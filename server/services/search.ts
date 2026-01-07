import { getElasticsearchClient, ensureElasticsearchIndex } from '../infrastructure/elasticsearch';
import { getRedisClient } from '../infrastructure/redis';
import { storage } from '../storage';
import type { ProductWithCategory } from '@shared/schema';

const CACHE_TTL = 3600;

export interface SearchFilters {
  categoryId?: number;
  supplierId?: number;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  search?: string;
  isOnSale?: boolean;
  isFeatured?: boolean;
  isApproved?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export async function syncProductToElasticsearch(product: ProductWithCategory): Promise<void> {
  const client = getElasticsearchClient();
  
  try {
    await client.index({
      index: 'products',
      id: product.id.toString(),
      document: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        brand: product.brand,
        categoryId: product.categoryId,
        categoryName: product.category?.name || null,
        supplierId: product.supplierId,
        inStock: product.inStock,
        stockQuantity: product.stockQuantity,
        rating: product.rating ? parseFloat(product.rating) : 0,
        isOnSale: product.isOnSale,
        isFeatured: product.isFeatured,
        isApproved: product.isApproved,
        createdAt: product.createdAt,
      },
    });
  } catch (error) {
    console.error(`Error syncing product ${product.id} to Elasticsearch:`, error);
  }
}

export async function syncAllProductsToElasticsearch(): Promise<void> {
  await ensureElasticsearchIndex();
  const products = await storage.getProducts({ isApproved: true });
  
  for (const product of products) {
    await syncProductToElasticsearch(product);
  }
}

export async function searchProducts(filters: SearchFilters): Promise<ProductWithCategory[]> {
  const redis = await getRedisClient();
  const cacheKey = `search:${JSON.stringify(filters)}`;
  
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error('Error reading from cache:', error);
  }

  try {
    const client = getElasticsearchClient();
    const must: any[] = [];
    const should: any[] = [];

    if (filters.search) {
      should.push({
        multi_match: {
          query: filters.search,
          fields: ['name^3', 'description^2', 'brand'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      });
    }

    if (filters.categoryId) {
      must.push({ term: { categoryId: filters.categoryId } });
    }

    if (filters.supplierId) {
      must.push({ term: { supplierId: filters.supplierId } });
    }

    if (filters.brand) {
      must.push({ term: { 'brand.keyword': filters.brand } });
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const range: any = {};
      if (filters.minPrice !== undefined) range.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) range.lte = filters.maxPrice;
      must.push({ range: { price: range } });
    }

    if (filters.minRating !== undefined) {
      must.push({ range: { rating: { gte: filters.minRating } } });
    }

    if (filters.isOnSale !== undefined) {
      must.push({ term: { isOnSale: filters.isOnSale } });
    }

    if (filters.isFeatured !== undefined) {
      must.push({ term: { isFeatured: filters.isFeatured } });
    }

    if (filters.isApproved !== undefined) {
      must.push({ term: { isApproved: filters.isApproved } });
    } else {
      must.push({ term: { isApproved: true } });
    }

    const query: any = {};
    if (must.length > 0) {
      query.must = must;
    }
    if (should.length > 0) {
      query.should = should;
      query.minimum_should_match = should.length > 0 ? 1 : 0;
    }

    const sort: any[] = [];
    if (filters.sortBy) {
      const order = filters.sortOrder || 'asc';
      sort.push({ [filters.sortBy]: { order } });
    } else {
      sort.push({ _score: { order: 'desc' } });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const from = (page - 1) * limit;

    const result = await client.search({
      index: 'products',
      body: {
        query: {
          bool: query,
        },
        sort,
        from,
        size: limit,
      },
    });

    const productIds = result.hits.hits.map((hit: any) => parseInt(hit._id));
    const products = await Promise.all(
      productIds.map((id: number) => storage.getProductById(id))
    );

    const validProducts = products.filter((p): p is ProductWithCategory => p !== undefined) as ProductWithCategory[];

    try {
      await redis.setEx(cacheKey, CACHE_TTL, JSON.stringify(validProducts));
    } catch (error) {
      console.error('Error writing to cache:', error);
    }

    return validProducts;
  } catch (error) {
    console.error('Elasticsearch search error, falling back to PostgreSQL:', error);
    return await storage.getProducts(filters);
  }
}

export async function invalidateSearchCache(pattern?: string): Promise<void> {
  const redis = await getRedisClient();
  
  try {
    if (pattern) {
      const keys = await redis.keys(`search:${pattern}*`);
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } else {
      const keys = await redis.keys('search:*');
      if (keys.length > 0) {
        await redis.del(keys);
      }
    }
  } catch (error) {
    console.error('Error invalidating cache:', error);
  }
}

