import type { Product } from '@shared/schema';

export interface DeliveryPoint {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type: 'supplier' | 'hub' | 'customer';
  capacity?: number;
}

export interface Route {
  points: DeliveryPoint[];
  totalDistance: number;
  estimatedTime: number;
  assignedPartner?: string;
}

export interface LogisticsSolution {
  routes: Route[];
  totalCost: number;
  estimatedDeliveryDate: Date;
}

export function optimizeRoutes(
  products: Array<{ product: Product; quantity: number }>,
  suppliers: DeliveryPoint[],
  hubs: DeliveryPoint[],
  destination: DeliveryPoint
): LogisticsSolution {
  const routes: Route[] = [];
  let totalCost = 0;

  for (const item of products) {
    const supplier = suppliers.find(s => s.id === item.product.supplierId || 0);
    if (!supplier) continue;

    const hub = findNearestHub(supplier, hubs, destination);
    const route = calculateRoute([supplier, hub, destination]);
    
    routes.push(route);
    totalCost += calculateRouteCost(route);
  }

  const consolidatedRoutes = consolidateRoutes(routes);
  const estimatedDeliveryDate = new Date();
  estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 5);

  return {
    routes: consolidatedRoutes,
    totalCost,
    estimatedDeliveryDate,
  };
}

function findNearestHub(supplier: DeliveryPoint, hubs: DeliveryPoint[], destination: DeliveryPoint): DeliveryPoint {
  let nearestHub = hubs[0];
  let minDistance = calculateDistance(supplier, nearestHub) + calculateDistance(nearestHub, destination);

  for (const hub of hubs) {
    const distance = calculateDistance(supplier, hub) + calculateDistance(hub, destination);
    if (distance < minDistance) {
      minDistance = distance;
      nearestHub = hub;
    }
  }

  return nearestHub;
}

function calculateRoute(points: DeliveryPoint[]): Route {
  let totalDistance = 0;
  
  for (let i = 0; i < points.length - 1; i++) {
    totalDistance += calculateDistance(points[i], points[i + 1]);
  }

  const estimatedTime = totalDistance / 60;

  return {
    points,
    totalDistance,
    estimatedTime,
  };
}

function calculateDistance(point1: DeliveryPoint, point2: DeliveryPoint): number {
  const R = 6371;
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateRouteCost(route: Route): number {
  const baseCost = 50;
  const distanceCost = route.totalDistance * 0.5;
  return baseCost + distanceCost;
}

function consolidateRoutes(routes: Route[]): Route[] {
  const consolidated: Route[] = [];
  const usedSuppliers = new Set<number>();

  for (const route of routes) {
    const supplier = route.points.find(p => p.type === 'supplier');
    if (!supplier || usedSuppliers.has(supplier.id)) {
      continue;
    }

    const similarRoutes = routes.filter(r => {
      const rSupplier = r.points.find(p => p.type === 'supplier');
      return rSupplier && rSupplier.id === supplier.id;
    });

    if (similarRoutes.length > 1) {
      const consolidatedRoute: Route = {
        points: route.points,
        totalDistance: Math.max(...similarRoutes.map(r => r.totalDistance)),
        estimatedTime: Math.max(...similarRoutes.map(r => r.estimatedTime)),
      };
      consolidated.push(consolidatedRoute);
      usedSuppliers.add(supplier.id);
    } else {
      consolidated.push(route);
      usedSuppliers.add(supplier.id);
    }
  }

  return consolidated;
}

export function assignPartnerToRoute(route: Route, availablePartners: string[]): Route {
  const randomPartner = availablePartners[Math.floor(Math.random() * availablePartners.length)];
  return {
    ...route,
    assignedPartner: randomPartner,
  };
}

