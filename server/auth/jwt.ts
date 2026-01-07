import jwt from 'jsonwebtoken';
import { getRedisClient } from '../infrastructure/redis';
import type { Customer, Supplier } from '@shared/schema';

export interface JWTPayload {
  userId: number;
  userType: 'customer' | 'supplier' | 'admin';
  email: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

export function generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

export function generateTokenPair(user: Customer | Supplier, userType: 'customer' | 'supplier'): TokenPair {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: user.id,
    userType,
    email: user.email,
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
}

export function verifyRefreshToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

export async function revokeToken(token: string, expirySeconds: number): Promise<void> {
  const redis = await getRedisClient();
  await redis.setEx(`revoked:${token}`, expirySeconds, '1');
}

export async function isTokenRevoked(token: string): Promise<boolean> {
  const redis = await getRedisClient();
  const result = await redis.get(`revoked:${token}`);
  return result === '1';
}

export async function storeRefreshToken(userId: number, userType: string, token: string): Promise<void> {
  const redis = await getRedisClient();
  const key = `refresh:${userType}:${userId}`;
  const expirySeconds = 7 * 24 * 60 * 60;
  await redis.setEx(key, expirySeconds, token);
}

export async function getStoredRefreshToken(userId: number, userType: string): Promise<string | null> {
  const redis = await getRedisClient();
  const key = `refresh:${userType}:${userId}`;
  return await redis.get(key);
}

export async function revokeRefreshToken(userId: number, userType: string): Promise<void> {
  const redis = await getRedisClient();
  const key = `refresh:${userType}:${userId}`;
  await redis.del(key);
}

