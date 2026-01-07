import { db } from '../db';
import { deliveryTracking, deliveries } from '@shared/schema';
import { eq } from 'drizzle-orm';
import type { InsertDeliveryTracking } from '@shared/schema';
import { sql } from 'drizzle-orm';

export interface TrackingData {
  deliveryId: number;
  latitude: number;
  longitude: number;
  temperature?: number;
  status?: string;
  notes?: string;
}

export async function recordTrackingData(data: TrackingData): Promise<void> {
  const trackingData: InsertDeliveryTracking = {
    deliveryId: data.deliveryId,
    latitude: data.latitude.toString(),
    longitude: data.longitude.toString(),
    temperature: data.temperature?.toString(),
    status: data.status || 'in_transit',
    notes: data.notes || null,
  };

  await db.insert(deliveryTracking).values(trackingData);

  if (data.status) {
    await db
      .update(deliveries)
      .set({ status: data.status, updatedAt: new Date() })
      .where(eq(deliveries.id, data.deliveryId));
  }
}

export async function getTrackingHistory(deliveryId: number): Promise<any[]> {
  const history = await db
    .select()
    .from(deliveryTracking)
    .where(eq(deliveryTracking.deliveryId, deliveryId))
    .orderBy(deliveryTracking.timestamp);

  return history;
}

export async function getLatestTracking(deliveryId: number): Promise<any | null> {
  const [latest] = await db
    .select()
    .from(deliveryTracking)
    .where(eq(deliveryTracking.deliveryId, deliveryId))
    .orderBy(sql`${deliveryTracking.timestamp} DESC`)
    .limit(1);

  return latest || null;
}

export function checkRouteDeviation(
  currentLat: number,
  currentLng: number,
  expectedLat: number,
  expectedLng: number,
  thresholdKm: number = 5
): boolean {
  const distance = calculateDistance(currentLat, currentLng, expectedLat, expectedLng);
  return distance > thresholdKm;
}

export function checkTemperatureAlert(temperature: number | undefined, minTemp: number = 2, maxTemp: number = 8): boolean {
  if (temperature === undefined) return false;
  return temperature < minTemp || temperature > maxTemp;
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

