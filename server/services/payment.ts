import Stripe from 'stripe';
import { createVindiTransaction, getVindiTransaction } from '../vindiService';
import { getRedisClient } from '../infrastructure/redis';
import type { Order } from '@shared/schema';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' })
  : null;

export type PaymentGateway = 'vindi' | 'stripe';

export interface PaymentRequest {
  amount: number;
  currency?: string;
  paymentMethod: string;
  customer: {
    name: string;
    email: string;
    cpf?: string;
    phone?: string;
  };
  shipping: any;
  cartItems: any[];
  cardToken?: string;
  gateway?: PaymentGateway;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentIntentId?: string;
  clientSecret?: string;
  redirectUrl?: string;
  message?: string;
}

export async function processPayment(request: PaymentRequest): Promise<PaymentResponse> {
  const gateway = request.gateway || 'vindi';

  if (gateway === 'stripe' && stripe) {
    return await processStripePayment(request);
  } else {
    return await processVindiPayment(request);
  }
}

async function processStripePayment(request: PaymentRequest): Promise<PaymentResponse> {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(request.amount * 100),
      currency: request.currency || 'brl',
      payment_method: request.cardToken,
      confirm: true,
      customer: await getOrCreateStripeCustomer(request.customer),
      metadata: {
        customerName: request.customer.name,
        customerEmail: request.customer.email,
      },
    });

    await storeWebhookIdempotency(paymentIntent.id, paymentIntent);

    return {
      success: paymentIntent.status === 'succeeded',
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret || undefined,
      message: paymentIntent.status,
    };
  } catch (error: any) {
    console.error('Stripe payment error:', error);
    return {
      success: false,
      message: error.message || 'Payment failed',
    };
  }
}

async function processVindiPayment(request: PaymentRequest): Promise<PaymentResponse> {
  try {
    const vindiResponse = await createVindiTransaction({
      amount: request.amount,
      paymentMethod: request.paymentMethod as 'credit_card' | 'pix',
      customer: request.customer,
      shipping: request.shipping,
      cartItems: request.cartItems,
      cardToken: request.cardToken,
    });

    return {
      success: true,
      transactionId: vindiResponse.token_transaction,
      redirectUrl: vindiResponse.payment?.url_payment,
      message: 'Payment processed',
    };
  } catch (error: any) {
    console.error('Vindi payment error:', error);
    return {
      success: false,
      message: error.message || 'Payment failed',
    };
  }
}

async function getOrCreateStripeCustomer(customer: { name: string; email: string }): Promise<string> {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const customers = await stripe.customers.list({
    email: customer.email,
    limit: 1,
  });

  if (customers.data.length > 0) {
    return customers.data[0].id;
  }

  const newCustomer = await stripe.customers.create({
    name: customer.name,
    email: customer.email,
  });

  return newCustomer.id;
}

export async function handleWebhook(
  gateway: PaymentGateway,
  payload: any,
  signature: string
): Promise<void> {
  if (gateway === 'stripe' && stripe) {
    await handleStripeWebhook(payload, signature);
  } else {
    await handleVindiWebhook(payload);
  }
}

async function handleStripeWebhook(payload: any, signature: string): Promise<void> {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('Stripe webhook secret not configured');
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error: any) {
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }

  const idempotencyKey = `stripe:${event.id}`;
  const processed = await checkWebhookIdempotency(idempotencyKey);
  if (processed) {
    return;
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    await updateOrderPaymentStatus(paymentIntent.metadata.orderId, 'paid', paymentIntent.id);
  } else if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    await updateOrderPaymentStatus(paymentIntent.metadata.orderId, 'failed', paymentIntent.id);
  }

  await storeWebhookIdempotency(idempotencyKey, event);
}

async function handleVindiWebhook(payload: any): Promise<void> {
  const idempotencyKey = `vindi:${payload.transaction?.token_transaction}`;
  const processed = await checkWebhookIdempotency(idempotencyKey);
  if (processed) {
    return;
  }

  if (payload.transaction) {
    const orderId = payload.transaction.order_number;
    const status = payload.transaction.status_name;

    if (status === 'paid' || status === 'approved') {
      await updateOrderPaymentStatus(orderId, 'paid', payload.transaction.token_transaction);
    } else if (status === 'failed' || status === 'rejected') {
      await updateOrderPaymentStatus(orderId, 'failed', payload.transaction.token_transaction);
    }
  }

  await storeWebhookIdempotency(idempotencyKey, payload);
}

async function checkWebhookIdempotency(key: string): Promise<boolean> {
  const redis = await getRedisClient();
  const exists = await redis.get(`webhook:${key}`);
  return exists !== null;
}

async function storeWebhookIdempotency(key: string, data: any): Promise<void> {
  const redis = await getRedisClient();
  await redis.setEx(`webhook:${key}`, 7 * 24 * 60 * 60, JSON.stringify(data));
}

async function updateOrderPaymentStatus(orderId: string | number, status: string, transactionId: string): Promise<void> {
  const { storage } = await import('../storage');
  const { sendOrderPaidEmail } = await import('../emailService');
  const id = typeof orderId === 'string' ? parseInt(orderId) : orderId;
  const updated = await storage.updateOrderStatus(id, status === 'paid' ? 'paid' : 'pending', status);
  try {
    if (status === 'paid') {
      const order = await storage.getOrderById(id);
      if (order?.customerEmail) {
        await sendOrderPaidEmail({
          email: order.customerEmail,
          customerName: order.customerName || undefined,
          orderId: id,
        });
      }
    }
  } catch (e) {
    // Best-effort: não bloquear fluxo de pagamento
    console.error('Error sending paid email:', e);
  }
}

