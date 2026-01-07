import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { recordTrackingData, checkRouteDeviation, checkTemperatureAlert, getLatestTracking } from './tracking';
import { db } from '../db';
import { deliveries } from '@shared/schema';
import { eq } from 'drizzle-orm';

const clients = new Map<string, Set<WebSocket>>();

export function setupWebSocketServer(httpServer: Server): WebSocketServer {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req) => {
    const deliveryId = new URL(req.url || '', 'http://localhost').searchParams.get('deliveryId');
    
    if (!deliveryId) {
      ws.close(1008, 'deliveryId required');
      return;
    }

    if (!clients.has(deliveryId)) {
      clients.set(deliveryId, new Set());
    }
    clients.get(deliveryId)!.add(ws);

    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'tracking_update') {
          await handleTrackingUpdate(ws, deliveryId, message.data);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      const deliveryClients = clients.get(deliveryId);
      if (deliveryClients) {
        deliveryClients.delete(ws);
        if (deliveryClients.size === 0) {
          clients.delete(deliveryId);
        }
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return wss;
}

async function handleTrackingUpdate(ws: WebSocket, deliveryId: string, data: any): Promise<void> {
  try {
    const trackingData = {
      deliveryId: parseInt(deliveryId),
      latitude: data.latitude,
      longitude: data.longitude,
      temperature: data.temperature,
      status: data.status,
      notes: data.notes,
    };

    await recordTrackingData(trackingData);

    const [delivery] = await db
      .select()
      .from(deliveries)
      .where(eq(deliveries.id, trackingData.deliveryId));

    if (delivery) {
      const latest = await getLatestTracking(trackingData.deliveryId);
      
      if (latest) {
        const routeDeviation = checkRouteDeviation(
          trackingData.latitude,
          trackingData.longitude,
          parseFloat(latest.latitude || '0'),
          parseFloat(latest.longitude || '0')
        );

        const tempAlert = checkTemperatureAlert(trackingData.temperature);

        const alerts: string[] = [];
        if (routeDeviation) {
          alerts.push('Route deviation detected');
        }
        if (tempAlert) {
          alerts.push('Temperature out of range');
        }

        const update = {
          type: 'tracking_update',
          deliveryId: trackingData.deliveryId,
          latitude: trackingData.latitude,
          longitude: trackingData.longitude,
          temperature: trackingData.temperature,
          status: trackingData.status,
          alerts,
          timestamp: new Date().toISOString(),
        };

        broadcastToDelivery(deliveryId, update);
      }
    }
  } catch (error) {
    console.error('Error handling tracking update:', error);
    ws.send(JSON.stringify({ type: 'error', message: 'Failed to process tracking update' }));
  }
}

export function broadcastToDelivery(deliveryId: string, message: any): void {
  const deliveryClients = clients.get(deliveryId);
  if (deliveryClients) {
    const data = JSON.stringify(message);
    deliveryClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }
}

export function mockIoTTracking(deliveryId: number): void {
  setInterval(async () => {
    const baseLat = -23.5505;
    const baseLng = -46.6333;
    
    const trackingData = {
      deliveryId,
      latitude: baseLat + (Math.random() - 0.5) * 0.1,
      longitude: baseLng + (Math.random() - 0.5) * 0.1,
      temperature: 5 + (Math.random() - 0.5) * 4,
      status: 'in_transit',
    };

    await recordTrackingData(trackingData);
    
    broadcastToDelivery(deliveryId.toString(), {
      type: 'tracking_update',
      ...trackingData,
      timestamp: new Date().toISOString(),
    });
  }, 30000);
}

