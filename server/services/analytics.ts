import { db } from '../db';
import { orders, orderItems, products, productFeedback } from '@shared/schema';
import { eq, gte, lte, sql, and } from 'drizzle-orm';
import { getMongoDb } from '../infrastructure/mongodb';

export interface AnalyticsPeriod {
  startDate: Date;
  endDate: Date;
}

export async function exportToBigQuery(data: any[], tableName: string): Promise<void> {
  try {
    const { BigQuery } = await import('@google-cloud/bigquery');
    const bigquery = new BigQuery({
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GCP_KEY_FILE,
    });

    const dataset = bigquery.dataset(process.env.BIGQUERY_DATASET || 'casa_amazonia');
    const table = dataset.table(tableName);

    await table.insert(data);
  } catch (error) {
    console.error('BigQuery export error (may not be configured):', error);
    const mongoDb = await getMongoDb();
    await mongoDb.collection('analytics_backup').insertMany(
      data.map(item => ({ ...item, tableName, exportedAt: new Date() }))
    );
  }
}

export async function getSalesAnalytics(period?: AnalyticsPeriod): Promise<any> {
  const conditions = [];
  
  if (period) {
    conditions.push(gte(orders.createdAt, period.startDate));
    conditions.push(lte(orders.createdAt, period.endDate));
  }

  const salesData = await db
    .select({
      date: sql<string>`DATE(${orders.createdAt})`,
      total: sql<number>`SUM(${orders.total}::numeric)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(orders)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(sql`DATE(${orders.createdAt})`);

  const productSales = await db
    .select({
      productId: orderItems.productId,
      productName: products.name,
      quantity: sql<number>`SUM(${orderItems.quantity})`,
      revenue: sql<number>`SUM(${orderItems.price}::numeric * ${orderItems.quantity})`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(orderItems.productId, products.name);

  return {
    salesByDate: salesData,
    productSales,
    period: period || { startDate: new Date(0), endDate: new Date() },
  };
}

export async function getCustomerAnalytics(period?: AnalyticsPeriod): Promise<any> {
  const conditions = [];
  
  if (period) {
    conditions.push(gte(orders.createdAt, period.startDate));
    conditions.push(lte(orders.createdAt, period.endDate));
  }

  const customerData = await db
    .select({
      customerId: orders.customerId,
      orderCount: sql<number>`COUNT(*)`,
      totalSpent: sql<number>`SUM(${orders.total}::numeric)`,
      avgOrderValue: sql<number>`AVG(${orders.total}::numeric)`,
    })
    .from(orders)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(orders.customerId);

  return {
    customers: customerData,
    period: period || { startDate: new Date(0), endDate: new Date() },
  };
}

export async function getProductPerformance(period?: AnalyticsPeriod): Promise<any> {
  const conditions = [];
  
  if (period) {
    conditions.push(gte(orders.createdAt, period.startDate));
    conditions.push(lte(orders.createdAt, period.endDate));
  }

  const performance = await db
    .select({
      productId: products.id,
      productName: products.name,
      sales: sql<number>`SUM(${orderItems.quantity})`,
      revenue: sql<number>`SUM(${orderItems.price}::numeric * ${orderItems.quantity})`,
      avgRating: sql<number>`AVG(${productFeedback.rating})`,
      reviewCount: sql<number>`COUNT(DISTINCT ${productFeedback.id})`,
    })
    .from(products)
    .leftJoin(orderItems, eq(products.id, orderItems.productId))
    .leftJoin(orders, eq(orderItems.orderId, orders.id))
    .leftJoin(productFeedback, eq(products.id, productFeedback.productId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(products.id, products.name);

  return {
    products: performance,
    period: period || { startDate: new Date(0), endDate: new Date() },
  };
}

export async function syncAnalyticsToBigQuery(): Promise<void> {
  try {
    const salesData = await getSalesAnalytics();
    await exportToBigQuery(salesData.salesByDate, 'sales_by_date');
    await exportToBigQuery(salesData.productSales, 'product_sales');

    const customerData = await getCustomerAnalytics();
    await exportToBigQuery(customerData.customers, 'customer_analytics');

    const productData = await getProductPerformance();
    await exportToBigQuery(productData.products, 'product_performance');
  } catch (error) {
    console.error('Error syncing analytics to BigQuery:', error);
  }
}

