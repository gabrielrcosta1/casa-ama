import { storage } from "../storage";
import type { Product, ProductWithCategory } from "@shared/schema";
import { findSimilarProducts, findProductsForUser, updateUserHistory } from "../services/embeddings";
import { getAIRecommendations } from "../services/ai-recommendations";
import { getCachedRecommendations, setCachedRecommendations } from "../services/recommendation-cache";

export interface RecommendationOptions {
  userId?: number;
  userType?: 'customer' | 'supplier';
  productIds?: number[];
  limit?: number;
}

export async function getProductRecommendations(productIds: number[]): Promise<Product[]>;
export async function getProductRecommendations(options: RecommendationOptions): Promise<Product[]>;
export async function getProductRecommendations(
  productIdsOrOptions: number[] | RecommendationOptions
): Promise<Product[]> {
  try {
    const options: RecommendationOptions = Array.isArray(productIdsOrOptions)
      ? { productIds: productIdsOrOptions }
      : productIdsOrOptions;

    const { userId, userType, productIds = [], limit = 5 } = options;

    let recommendedProductIds: number[] = [];

    if (userId && userType) {
      const userRecommendations = await findProductsForUser(userId, userType, limit * 2);
      recommendedProductIds = [...recommendedProductIds, ...userRecommendations];
    }

    if (productIds.length > 0) {
      // Tentar buscar do cache primeiro
      try {
        const cachedIds = await getCachedRecommendations(productIds);
        if (cachedIds && cachedIds.length > 0) {
          console.log('[Recommender] ✅ CACHE HIT! Usando recomendações do cache:', cachedIds.length, 'produtos');

          // Buscar produtos do cache
          const cachedProducts = await Promise.all(
            cachedIds.map(id => storage.getProductById(id))
          );
          const validCachedProducts = cachedProducts.filter((p): p is Product => p !== null && p !== undefined);

          if (validCachedProducts.length > 0) {
            const rankedProducts = await reRankProducts(validCachedProducts, userId, userType);
            console.log('[Recommender] Retornando produtos do cache:', rankedProducts.length);
            return rankedProducts.slice(0, limit);
          }
        } else {
          console.log('[Recommender] ❌ CACHE MISS - Buscando recomendações da IA/embeddings');
        }
      } catch (cacheError) {
        console.warn('[Recommender] Erro ao buscar cache, continuando sem cache:', cacheError);
      }

      // Tentar usar IA primeiro se disponível (apenas se não tiver cache)
      try {
        console.log('[Recommender] Tentando usar IA para recomendações. Product IDs:', productIds);
        const cartProducts = await Promise.all(
          productIds.map(id => storage.getProductById(id))
        );
        const validCartProducts = cartProducts.filter((p): p is Product => p !== null);
        console.log('[Recommender] Produtos válidos no carrinho:', validCartProducts.length);

        if (validCartProducts.length > 0) {
          // Buscar todos os produtos para o contexto da IA (com categorias)
          const allProducts = await storage.getProducts({ isApproved: true });
          console.log('[Recommender] Produtos disponíveis para IA:', allProducts.length);

          // Preparar produtos do carrinho com categorias
          const cartWithCategories = validCartProducts.map((p) => {
            const fullProduct = allProducts.find(prod => prod.id === p.id);
            const categoryName = (fullProduct && 'category' in fullProduct && fullProduct.category)
              ? fullProduct.category.name
              : null;

            return {
              id: p.id,
              name: p.name,
              description: p.description,
              category: categoryName,
              brand: p.brand,
              price: p.price,
            };
          });

          console.log('[Recommender] Chamando getAIRecommendations...');
          const aiRecommendedIds = await getAIRecommendations(
            cartWithCategories,
            allProducts as Product[],
            limit
          );
          console.log('[Recommender] IDs retornados pela IA:', aiRecommendedIds);

          if (aiRecommendedIds.length > 0) {
            recommendedProductIds = [...recommendedProductIds, ...aiRecommendedIds];
            console.log('[Recommender] ✅ Usando recomendações da IA:', aiRecommendedIds.length, 'produtos');

            // Salvar no cache
            await setCachedRecommendations(productIds, aiRecommendedIds);
            console.log('[Recommender] 💾 Cache salvo com recomendações da IA');
          } else {
            console.log('[Recommender] IA não retornou recomendações, usando fallback');
          }
        }
      } catch (aiError) {
        console.warn('[Recommender] AI recommendations failed, falling back to embeddings:', aiError);
        if (aiError instanceof Error) {
          console.error('[Recommender] Error details:', aiError.message, aiError.stack);
        }
      }

      // Fallback para embeddings se IA não retornou resultados suficientes
      if (recommendedProductIds.length < limit) {
        console.log('[Recommender] Usando fallback de embeddings...');
        const fallbackIds: number[] = [];
        for (const productId of productIds.slice(0, 3)) {
          const similar = await findSimilarProducts(productId, limit);
          fallbackIds.push(...similar);
        }
        recommendedProductIds = [...recommendedProductIds, ...fallbackIds];

        // Salvar fallback no cache também (apenas os IDs únicos)
        if (fallbackIds.length > 0) {
          const uniqueFallbackIds = [...new Set(fallbackIds)];
          await setCachedRecommendations(productIds, uniqueFallbackIds);
          console.log('[Recommender] 💾 Cache salvo com recomendações de embeddings:', uniqueFallbackIds.length);
        }
      }
    }

    if (recommendedProductIds.length === 0) {
      const featuredProducts = await storage.getProducts({ isFeatured: true, isApproved: true });
      return featuredProducts.slice(0, limit);
    }

    const uniqueIds = [...new Set(recommendedProductIds)];
    const existingIds = new Set(productIds);
    const filteredIds = uniqueIds.filter(id => !existingIds.has(id)).slice(0, limit * 2);

    const products = await Promise.all(
      filteredIds.map(id => storage.getProductById(id))
    );

    const validProducts = products.filter((p): p is Product => p !== null && p !== undefined);

    const rankedProducts = await reRankProducts(validProducts, userId, userType);

    return rankedProducts.slice(0, limit);
  } catch (error) {
    console.error("Erro na lógica de recomendação:", error);

    const productIds = Array.isArray(productIdsOrOptions) ? productIdsOrOptions : productIdsOrOptions.productIds || [];

    if (productIds.length === 0) {
      const featuredProducts = await storage.getProducts({ isFeatured: true, isApproved: true });
      return featuredProducts.slice(0, 5);
    }

    const productsInCartPromises = productIds.map(id => storage.getProductById(id));
    const productsInCartOrNull = await Promise.all(productsInCartPromises);
    const productsInCart = productsInCartOrNull.filter((p): p is Product => p !== null && p !== undefined);

    if (productsInCart.length === 0) {
      const featuredProducts = await storage.getProducts({ isFeatured: true, isApproved: true });
      return featuredProducts.slice(0, 5);
    }

    const categoryIds: (number | null)[] = productsInCart.map(p => p.categoryId);
    const uniqueCategoryIds = [...new Set(categoryIds)].filter((id): id is number => id !== null);

    let recommendedProducts: Product[] = [];

    if (uniqueCategoryIds.length > 0) {
      const promises = uniqueCategoryIds.map(catId =>
        storage.getProducts({
          categoryId: catId,
          isApproved: true,
        })
      );
      const results = await Promise.all(promises);
      const combinedResults = results.flat();

      const uniqueResults = Array.from(new Map(combinedResults.map(p => [p.id, p])).values());
      recommendedProducts = uniqueResults;
    }

    const existingIds = new Set(productIds);
    let filteredRecommendations = recommendedProducts.filter(p => !existingIds.has(p.id));

    if (filteredRecommendations.length === 0) {
      const featuredProducts = await storage.getProducts({
        isFeatured: true,
        isApproved: true,
      });
      filteredRecommendations = featuredProducts.filter(p => !existingIds.has(p.id));
    }

    return filteredRecommendations.slice(0, 5);
  }
}

async function reRankProducts(
  products: Product[],
  userId?: number,
  userType?: 'customer' | 'supplier'
): Promise<Product[]> {
  return products.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    if (a.inStock && a.stockQuantity && a.stockQuantity > 0) scoreA += 10;
    if (b.inStock && b.stockQuantity && b.stockQuantity > 0) scoreB += 10;

    if (a.isFeatured) scoreA += 5;
    if (b.isFeatured) scoreB += 5;

    if (a.isOnSale) scoreA += 3;
    if (b.isOnSale) scoreB += 3;

    const ratingA = parseFloat(a.rating || '0');
    const ratingB = parseFloat(b.rating || '0');
    scoreA += ratingA * 2;
    scoreB += ratingB * 2;

    return scoreB - scoreA;
  });
}
