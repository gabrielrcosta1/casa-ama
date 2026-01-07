import { getRedisClient } from '../infrastructure/redis';
import type { Product } from '@shared/schema';

export interface ShippingAddress {
  cep: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface ShippingOption {
  method: string;
  price: number;
  estimatedDays: number;
  description: string;
}

const SHIPPING_CACHE_TTL = 24 * 60 * 60;

export async function calculateShipping(
  products: Array<{ product: Product; quantity: number }>,
  address: ShippingAddress
): Promise<ShippingOption[]> {
  const redis = await getRedisClient();
  const cacheKey = `shipping:${address.cep}:${JSON.stringify(products.map(p => ({ id: p.product.id, qty: p.quantity })))}`;
  
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error('Error reading shipping cache:', error);
  }

  const totalWeight = products.reduce((sum, item) => {
    const weight = parseFloat((item.product as any).weight || '1');
    return sum + weight * item.quantity;
  }, 0);

  const totalVolume = products.reduce((sum, item) => {
    const volume = parseFloat((item.product as any).volume || '0.001');
    return sum + volume * item.quantity;
  }, 0);

  const basePrice = products.reduce((sum, item) => {
    return sum + parseFloat(item.product.price) * item.quantity;
  }, 0);

  const options: ShippingOption[] = [
    {
      method: 'standard',
      price: calculateStandardShipping(totalWeight, totalVolume, address),
      estimatedDays: 5,
      description: 'Entrega padrão',
    },
    {
      method: 'express',
      price: calculateExpressShipping(totalWeight, totalVolume, address),
      estimatedDays: 2,
      description: 'Entrega expressa',
    },
    {
      method: 'economy',
      price: calculateEconomyShipping(totalWeight, totalVolume, address),
      estimatedDays: 10,
      description: 'Entrega econômica',
    },
  ];

  try {
    await redis.setEx(cacheKey, SHIPPING_CACHE_TTL, JSON.stringify(options));
  } catch (error) {
    console.error('Error caching shipping:', error);
  }

  return options;
}

function calculateStandardShipping(weight: number, volume: number, address: ShippingAddress): number {
  const basePrice = 15.0;
  const weightPrice = weight * 2.5;
  const volumePrice = volume * 100;
  const distanceMultiplier = getDistanceMultiplier(address.estado);
  
  return Math.round((basePrice + weightPrice + volumePrice) * distanceMultiplier * 100) / 100;
}

function calculateExpressShipping(weight: number, volume: number, address: ShippingAddress): number {
  const basePrice = 35.0;
  const weightPrice = weight * 5.0;
  const volumePrice = volume * 200;
  const distanceMultiplier = getDistanceMultiplier(address.estado);
  
  return Math.round((basePrice + weightPrice + volumePrice) * distanceMultiplier * 100) / 100;
}

function calculateEconomyShipping(weight: number, volume: number, address: ShippingAddress): number {
  const basePrice = 8.0;
  const weightPrice = weight * 1.5;
  const volumePrice = volume * 50;
  const distanceMultiplier = getDistanceMultiplier(address.estado);
  
  return Math.round((basePrice + weightPrice + volumePrice) * distanceMultiplier * 100) / 100;
}

function getDistanceMultiplier(state: string): number {
  const multipliers: Record<string, number> = {
    'AC': 1.8, 'AL': 1.3, 'AP': 2.0, 'AM': 1.9, 'BA': 1.2,
    'CE': 1.3, 'DF': 1.1, 'ES': 1.1, 'GO': 1.2, 'MA': 1.4,
    'MT': 1.5, 'MS': 1.3, 'MG': 1.1, 'PA': 1.7, 'PB': 1.3,
    'PR': 1.1, 'PE': 1.3, 'PI': 1.4, 'RJ': 1.0, 'RN': 1.3,
    'RS': 1.2, 'RO': 1.7, 'RR': 2.0, 'SC': 1.1, 'SP': 1.0,
    'SE': 1.3, 'TO': 1.6,
  };
  
  return multipliers[state.toUpperCase()] || 1.5;
}

