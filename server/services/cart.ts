import { getRedisClient } from '../infrastructure/redis';
import { storage } from '../storage';
import type { CartItemWithProduct, InsertCartItem } from '@shared/schema';

const CART_TTL = 7 * 24 * 60 * 60;

export async function getCartFromRedis(sessionId: string): Promise<CartItemWithProduct[]> {
  const redis = await getRedisClient();
  const key = `cart:${sessionId}`;
  
  try {
    const cartData = await redis.get(key);
    if (cartData) {
      return JSON.parse(cartData);
    }
  } catch (error) {
    console.error('Error reading cart from Redis:', error);
  }
  
  return [];
}

export async function saveCartToRedis(sessionId: string, items: CartItemWithProduct[]): Promise<void> {
  const redis = await getRedisClient();
  const key = `cart:${sessionId}`;
  
  try {
    await redis.setEx(key, CART_TTL, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart to Redis:', error);
  }
}

export async function syncCartToPostgreSQL(sessionId: string, customerId?: number): Promise<void> {
  try {
    const redisItems = await getCartFromRedis(sessionId);
    
    for (const item of redisItems) {
      const cartItem: InsertCartItem = {
        productId: item.productId,
        quantity: item.quantity,
        sessionId,
        customerId,
      };
      
      await storage.addToCart(cartItem);
    }
  } catch (error) {
    console.error('Error syncing cart to PostgreSQL:', error);
  }
}

export async function syncCartFromPostgreSQL(sessionId: string, customerId?: number): Promise<void> {
  try {
    const pgItems = await storage.getCartItems(sessionId);
    await saveCartToRedis(sessionId, pgItems);
  } catch (error) {
    console.error('Error syncing cart from PostgreSQL:', error);
  }
}

export async function addToCartRedis(sessionId: string, item: InsertCartItem): Promise<CartItemWithProduct> {
  const redis = await getRedisClient();
  const key = `cart:${sessionId}`;
  
  try {
    const cartData = await redis.get(key);
    let items: CartItemWithProduct[] = cartData ? JSON.parse(cartData) : [];
    
    const existingIndex = items.findIndex(i => i.productId === item.productId);
    
    if (existingIndex >= 0) {
      items[existingIndex].quantity += item.quantity || 1;
    } else {
      const product = await storage.getProductById(item.productId);
      if (!product) {
        throw new Error('Product not found');
      }
      
      const newItem: CartItemWithProduct = {
        id: Date.now(),
        productId: item.productId,
        quantity: item.quantity || 1,
        sessionId,
        customerId: item.customerId || null,
        createdAt: new Date(),
        product,
      };
      
      items.push(newItem);
    }
    
    await saveCartToRedis(sessionId, items);
    
    if (existingIndex >= 0) {
      return items[existingIndex];
    } else {
      return items[items.length - 1];
    }
  } catch (error) {
    console.error('Error adding to cart in Redis:', error);
    throw error;
  }
}

export async function updateCartItemRedis(sessionId: string, productId: number, quantity: number): Promise<CartItemWithProduct | null> {
  const redis = await getRedisClient();
  const key = `cart:${sessionId}`;
  
  try {
    const cartData = await redis.get(key);
    if (!cartData) {
      return null;
    }
    
    let items: CartItemWithProduct[] = JSON.parse(cartData);
    const itemIndex = items.findIndex(i => i.productId === productId);
    
    if (itemIndex < 0) {
      return null;
    }
    
    if (quantity <= 0) {
      items.splice(itemIndex, 1);
    } else {
      items[itemIndex].quantity = quantity;
    }
    
    await saveCartToRedis(sessionId, items);
    
    return itemIndex >= 0 && quantity > 0 ? items[itemIndex] : null;
  } catch (error) {
    console.error('Error updating cart item in Redis:', error);
    return null;
  }
}

export async function removeFromCartRedis(sessionId: string, productId: number): Promise<boolean> {
  const redis = await getRedisClient();
  const key = `cart:${sessionId}`;
  
  try {
    const cartData = await redis.get(key);
    if (!cartData) {
      return false;
    }
    
    let items: CartItemWithProduct[] = JSON.parse(cartData);
    const initialLength = items.length;
    items = items.filter(i => i.productId !== productId);
    
    if (items.length !== initialLength) {
      await saveCartToRedis(sessionId, items);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error removing from cart in Redis:', error);
    return false;
  }
}

export async function clearCartRedis(sessionId: string): Promise<void> {
  const redis = await getRedisClient();
  const key = `cart:${sessionId}`;
  
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Error clearing cart in Redis:', error);
  }
}

