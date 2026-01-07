import { Router } from 'express';
import { getRedisClient } from '../infrastructure/redis';
import { checkPostgres } from '../infrastructure/postgres';
import { getElasticsearchClient } from '../infrastructure/elasticsearch';
import { getQdrantClient } from '../infrastructure/qdrant';

const router = Router();

router.get('/health', async (_, res) => {
  const services: Record<string, boolean> = {
    api: true,
    redis: false,
    postgres: false,
    elasticsearch: false,
    qdrant: false,
  };

  // Check Redis
  try {
    const redis = await getRedisClient();
    await redis.ping();
    services.redis = true;
  } catch (error) {
    console.error('Redis health check failed:', error);
  }

  // Check PostgreSQL
  try {
    await checkPostgres();
    services.postgres = true;
  } catch (error) {
    console.error('PostgreSQL health check failed:', error);
  }

  // Check Elasticsearch
  try {
    const es = getElasticsearchClient();
    await es.ping();
    services.elasticsearch = true;
  } catch (error) {
    console.error('Elasticsearch health check failed:', error);
  }

  // Check Qdrant
  try {
    const qdrant = getQdrantClient();
    await qdrant.getCollections();
    services.qdrant = true;
  } catch (error) {
    console.error('Qdrant health check failed:', error);
  }

  const allHealthy = Object.values(services).every(status => status === true);
  const statusCode = allHealthy ? 200 : 503;

  res.status(statusCode).json({
    status: allHealthy ? 'ok' : 'degraded',
    services,
    timestamp: new Date().toISOString(),
  });
});

router.get('/health/live', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/health/ready', async (_, res) => {
  try {
    await checkPostgres();
    const redis = await getRedisClient();
    await redis.ping();
    res.json({ status: 'ready', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;

