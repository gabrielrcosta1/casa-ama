import { getRedisClient } from '../infrastructure/redis';

const CACHE_TTL = 5 * 60; // 5 minutos em segundos
const CACHE_PREFIX = 'recommendations:';

/**
 * Gera chave de cache baseada nos IDs dos produtos no carrinho
 */
function getCacheKey(productIds: number[]): string {
  const sortedIds = [...productIds].sort((a, b) => a - b).join(',');
  return `${CACHE_PREFIX}${sortedIds}`;
}

/**
 * Busca recomendações do cache
 */
export async function getCachedRecommendations(productIds: number[]): Promise<number[] | null> {
  try {
    const client = await getRedisClient();

    // Verificar se o cliente está conectado
    if (!client.isOpen) {
      console.warn('[RecommendationCache] Redis não está conectado');
      return null;
    }

    const key = getCacheKey(productIds);
    console.log('[RecommendationCache] Buscando cache para key:', key);

    const cached = await client.get(key);

    if (cached) {
      const parsed = JSON.parse(cached);
      console.log('[RecommendationCache] ✅ CACHE HIT! Key:', key, 'IDs:', parsed);
      return parsed;
    }

    console.log('[RecommendationCache] ❌ CACHE MISS para key:', key);
    return null;
  } catch (error) {
    console.error('[RecommendationCache] Erro ao buscar cache:', error);
    if (error instanceof Error) {
      console.error('[RecommendationCache] Erro detalhado:', error.message);
    }
    return null; // Se Redis falhar, retorna null para continuar sem cache
  }
}

/**
 * Salva recomendações no cache
 */
export async function setCachedRecommendations(
  productIds: number[],
  recommendedIds: number[]
): Promise<void> {
  try {
    const client = await getRedisClient();

    // Verificar se o cliente está conectado
    if (!client.isOpen) {
      console.warn('[RecommendationCache] Redis não está conectado, não será possível salvar cache');
      return;
    }

    const key = getCacheKey(productIds);
    const value = JSON.stringify(recommendedIds);
    await client.setEx(key, CACHE_TTL, value);
    console.log('[RecommendationCache] 💾 Cache salvo! Key:', key, 'IDs:', recommendedIds, 'TTL:', CACHE_TTL, 's');
  } catch (error) {
    console.error('[RecommendationCache] Erro ao salvar cache:', error);
    if (error instanceof Error) {
      console.error('[RecommendationCache] Erro detalhado:', error.message);
    }
    // Não lança erro, apenas loga - cache é opcional
  }
}

/**
 * Invalida todo o cache de recomendações
 * Chamado quando um produto é criado, atualizado ou deletado
 */
export async function invalidateRecommendationCache(): Promise<void> {
  try {
    const client = await getRedisClient();
    const pattern = `${CACHE_PREFIX}*`;
    const keys = await client.keys(pattern);

    if (keys.length > 0) {
      await Promise.all(keys.map(key => client.del(key)));
      console.log(`[RecommendationCache] Cache invalidado: ${keys.length} chaves removidas`);
    } else {
      console.log('[RecommendationCache] Nenhum cache para invalidar');
    }
  } catch (error) {
    console.error('[RecommendationCache] Erro ao invalidar cache:', error);
    // Não lança erro, apenas loga
  }
}

