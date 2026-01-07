import { getMongoDb } from '../infrastructure/mongodb';
import { db } from '../db';
import { productFeedback, products } from '@shared/schema';
import { eq } from 'drizzle-orm';
import type { InsertProductFeedback } from '@shared/schema';
import { generateProductEmbedding, storeProductEmbedding } from './embeddings';
import type { Product } from '@shared/schema';

export interface FeedbackData {
  orderId: number;
  productId: number;
  customerId?: number;
  rating: number;
  comment?: string;
}

export async function createFeedback(data: FeedbackData): Promise<void> {
  const feedbackData: InsertProductFeedback = {
    orderId: data.orderId,
    productId: data.productId,
    customerId: data.customerId || null,
    rating: data.rating,
    comment: data.comment || null,
  };

  await db.insert(productFeedback).values(feedbackData);

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, data.productId));

  if (product) {
    await updateProductRating(product.id);
    await updateProductEmbedding(product);
  }

  const mongoDb = await getMongoDb();
  await mongoDb.collection('feedback').insertOne({
    ...data,
    createdAt: new Date(),
    source: 'web',
  });
}

async function updateProductRating(productId: number): Promise<void> {
  const feedbacks = await db
    .select()
    .from(productFeedback)
    .where(eq(productFeedback.productId, productId));

  if (feedbacks.length === 0) return;

  const avgRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;

  await db
    .update(products)
    .set({
      rating: avgRating.toFixed(2),
      reviewCount: feedbacks.length,
    })
    .where(eq(products.id, productId));
}

async function updateProductEmbedding(product: Product): Promise<void> {
  const feedbacks = await db
    .select()
    .from(productFeedback)
    .where(eq(productFeedback.productId, product.id));

  const feedbackText = feedbacks
    .map(f => f.comment || '')
    .join(' ')
    .toLowerCase();

  const enhancedProduct = {
    ...product,
    description: `${product.description} ${feedbackText}`,
  };

  const embedding = await generateProductEmbedding(enhancedProduct as Product);
  await storeProductEmbedding(product.id, embedding);
}

export async function getProductFeedback(productId: number): Promise<any[]> {
  const feedbacks = await db
    .select()
    .from(productFeedback)
    .where(eq(productFeedback.productId, productId))
    .orderBy(productFeedback.createdAt);

  return feedbacks;
}

export async function requestFeedbackForOrder(orderId: number): Promise<void> {
  const mongoDb = await getMongoDb();
  await mongoDb.collection('feedback_requests').insertOne({
    orderId,
    requestedAt: new Date(),
    status: 'pending',
  });
}

