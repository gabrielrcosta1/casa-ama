import { db } from '../db';
import { orders, orderItems, products, stockMovements, deliveries } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import type { InsertOrder, InsertOrderItem, InsertDelivery, InsertStockMovement } from '@shared/schema';
import { optimizeRoutes, assignPartnerToRoute, type DeliveryPoint } from './logistics';
import type { Product } from '@shared/schema';

export interface CreateOrderData {
  sessionId?: string;
  customerId?: number;
  customerEmail?: string;
  customerName?: string;
  shippingAddress: string;
  items: Array<{ productId: number; quantity: number; price: string }>;
  shippingMethod?: string;
  shippingPrice?: number;
}

export async function createOrderTransactionally(data: CreateOrderData): Promise<number> {
  return await db.transaction(async (tx) => {
    const total = data.items.reduce((sum, item) => {
      return sum + parseFloat(item.price) * item.quantity;
    }, 0) + (data.shippingPrice || 0);

    const orderData: InsertOrder = {
      sessionId: data.sessionId || null,
      customerId: data.customerId || null,
      total: total.toFixed(2),
      status: 'pending',
      customerEmail: data.customerEmail || null,
      customerName: data.customerName || null,
      shippingAddress: data.shippingAddress,
      paymentStatus: 'unpaid',
    };

    const [order] = await tx.insert(orders).values(orderData).returning();

    for (const item of data.items) {
      const [product] = await tx
        .select()
        .from(products)
        .where(eq(products.id, item.productId))
        .for('update');

      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (!product.inStock || (product.stockQuantity || 0) < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }

      const newStockQuantity = (product.stockQuantity || 0) - item.quantity;

      await tx
        .update(products)
        .set({
          stockQuantity: newStockQuantity,
          inStock: newStockQuantity > 0,
        })
        .where(eq(products.id, item.productId));

      await tx.insert(orderItems).values({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      });

      const stockMovement: InsertStockMovement = {
        productId: item.productId,
        orderId: order.id,
        quantity: -item.quantity,
        movementType: 'sale',
      };

      await tx.insert(stockMovements).values(stockMovement);
    }

    return order.id;
  });
}

export async function createDeliveryForOrder(
  orderId: number,
  orderItems: Array<{ product: Product; quantity: number }>,
  destination: DeliveryPoint
): Promise<number> {
  const suppliers: DeliveryPoint[] = [];
  const hubs: DeliveryPoint[] = [
    { id: 1, name: 'Hub SP', lat: -23.5505, lng: -46.6333, type: 'hub' },
    { id: 2, name: 'Hub RJ', lat: -22.9068, lng: -43.1729, type: 'hub' },
  ];

  for (const item of orderItems) {
    if (item.product.supplierId) {
      suppliers.push({
        id: item.product.supplierId,
        name: `Supplier ${item.product.supplierId}`,
        lat: -23.5505,
        lng: -46.6333,
        type: 'supplier',
      });
    }
  }

  const solution = optimizeRoutes(orderItems, suppliers, hubs, destination);
  const route = solution.routes[0];
  const assignedRoute = assignPartnerToRoute(route, ['Partner A', 'Partner B', 'Partner C']);

  const deliveryData: InsertDelivery = {
    orderId,
    status: 'pending',
    assignedPartner: assignedRoute.assignedPartner || null,
    estimatedDeliveryDate: solution.estimatedDeliveryDate,
    trackingNumber: `TRK${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
  };

  const [delivery] = await db.insert(deliveries).values(deliveryData).returning();
  return delivery.id;
}

export async function logOrderEvent(orderId: number, event: string, data: any): Promise<void> {
  await db.execute(sql`
    INSERT INTO order_logs (order_id, event, data, created_at)
    VALUES (${orderId}, ${event}, ${JSON.stringify(data)}, NOW())
  `).catch(() => {
    console.error('Failed to log order event (table may not exist yet)');
  });
}

