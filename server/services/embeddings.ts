import { getRedisClient } from '../infrastructure/redis';
import { getQdrantClient, ensureQdrantCollection } from '../infrastructure/qdrant';
import type { Product, Customer } from '@shared/schema';

const EMBEDDING_DIM = 384;

export async function generateProductEmbedding(product: Product): Promise<number[]> {
  const text = `${product.name} ${product.description} ${product.brand}`.toLowerCase();
  
  const embedding = new Array(EMBEDDING_DIM).fill(0).map(() => Math.random());
  const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / norm);
}

export async function generateUserEmbedding(userId: number, userType: 'customer' | 'supplier'): Promise<number[]> {
  const redis = await getRedisClient();
  const historyKey = `user_history:${userType}:${userId}`;
  
  const history = await redis.get(historyKey);
  if (!history) {
    return new Array(EMBEDDING_DIM).fill(0);
  }
  
  const historyData = JSON.parse(history);
  const text = historyData.viewedProducts?.join(' ') || '';
  
  const embedding = new Array(EMBEDDING_DIM).fill(0).map(() => Math.random());
  const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / norm);
}

export async function storeProductEmbedding(productId: number, embedding: number[]): Promise<void> {
  const client = getQdrantClient();
  await ensureQdrantCollection();
  
  try {
    await client.upsert('product_embeddings', {
      wait: true,
      points: [
        {
          id: productId,
          vector: embedding,
          payload: {
            productId,
          },
        },
      ],
    });
  } catch (error) {
    console.error(`Error storing embedding for product ${productId}:`, error);
  }
}

export async function storeUserEmbedding(userId: number, userType: string, embedding: number[]): Promise<void> {
  const client = getQdrantClient();
  const collectionName = `user_embeddings_${userType}`;
  await ensureQdrantCollection(collectionName);
  
  try {
    await client.upsert(collectionName, {
      wait: true,
      points: [
        {
          id: userId,
          vector: embedding,
          payload: {
            userId,
            userType,
          },
        },
      ],
    });
  } catch (error) {
    console.error(`Error storing embedding for user ${userId}:`, error);
  }
}

export async function findSimilarProducts(productId: number, limit: number = 10): Promise<number[]> {
  const client = getQdrantClient();
  await ensureQdrantCollection();
  
  try {
    const result = await client.search('product_embeddings', {
      vector: await getProductEmbedding(productId),
      limit: limit + 1,
      with_payload: true,
    });
    
    return result
      .filter((item) => item.id !== productId)
      .map((item) => item.id as number)
      .slice(0, limit);
  } catch (error) {
    console.error(`Error finding similar products for ${productId}:`, error);
    return [];
  }
}

export async function getProductEmbedding(productId: number): Promise<number[]> {
  const client = getQdrantClient();
  await ensureQdrantCollection();
  
  try {
    const result = await client.retrieve('product_embeddings', {
      ids: [productId],
      with_vector: true,
    });
    
    if (result.length > 0 && result[0].vector) {
      return result[0].vector as number[];
    }
  } catch (error) {
    console.error(`Error getting embedding for product ${productId}:`, error);
  }
  
  return new Array(EMBEDDING_DIM).fill(0);
}

export async function findProductsForUser(userId: number, userType: 'customer' | 'supplier', limit: number = 10): Promise<number[]> {
  const client = getQdrantClient();
  const collectionName = `user_embeddings_${userType}`;
  await ensureQdrantCollection(collectionName);
  
  try {
    const userEmbedding = await getUserEmbedding(userId, userType);
    if (userEmbedding.every(v => v === 0)) {
      return [];
    }
    
    const result = await client.search('product_embeddings', {
      vector: userEmbedding,
      limit,
      with_payload: true,
    });
    
    return result.map((item) => item.id as number);
  } catch (error) {
    console.error(`Error finding products for user ${userId}:`, error);
    return [];
  }
}

export async function getUserEmbedding(userId: number, userType: 'customer' | 'supplier'): Promise<number[]> {
  const client = getQdrantClient();
  const collectionName = `user_embeddings_${userType}`;
  await ensureQdrantCollection(collectionName);
  
  try {
    const result = await client.retrieve(collectionName, {
      ids: [userId],
      with_vector: true,
    });
    
    if (result.length > 0 && result[0].vector) {
      return result[0].vector as number[];
    }
  } catch (error) {
    console.error(`Error getting embedding for user ${userId}:`, error);
  }
  
  return new Array(EMBEDDING_DIM).fill(0);
}

export async function updateUserHistory(userId: number, userType: 'customer' | 'supplier', productId: number): Promise<void> {
  const redis = await getRedisClient();
  const historyKey = `user_history:${userType}:${userId}`;
  
  try {
    const history = await redis.get(historyKey);
    const historyData = history ? JSON.parse(history) : { viewedProducts: [] };
    
    if (!historyData.viewedProducts) {
      historyData.viewedProducts = [];
    }
    
    historyData.viewedProducts = [
      productId,
      ...historyData.viewedProducts.filter((id: number) => id !== productId),
    ].slice(0, 50);
    
    await redis.setEx(historyKey, 30 * 24 * 60 * 60, JSON.stringify(historyData));
    
    const userEmbedding = await generateUserEmbedding(userId, userType);
    await storeUserEmbedding(userId, userType, userEmbedding);
  } catch (error) {
    console.error(`Error updating user history for ${userId}:`, error);
  }
}

