import type { Product, ProductWithCategory } from "@shared/schema";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface CartItem {
  id: number;
  name: string;
  description: string;
  category: string | null;
  brand: string;
  price: string;
}

interface AIRecommendationResponse {
  productIds: number[];
  reasoning?: string;
}

export async function getAIRecommendations(
  cartItems: CartItem[],
  allProducts: (Product | ProductWithCategory)[],
  limit: number = 5
): Promise<number[]> {
  console.log('[AI Recommendations] Iniciando busca de recomendações...');
  console.log('[AI Recommendations] API Key configurada:', OPENAI_API_KEY ? 'Sim' : 'Não');
  console.log('[AI Recommendations] Itens no carrinho:', cartItems.length);
  console.log('[AI Recommendations] Produtos disponíveis:', allProducts.length);

  if (!OPENAI_API_KEY) {
    console.warn('[AI Recommendations] OpenAI API key not configured, falling back to rule-based recommendations');
    return [];
  }

  try {
    // Preparar informações dos produtos do carrinho
    const cartSummary = cartItems.map(item => ({
      nome: item.name,
      categoria: item.category || 'N/A',
      marca: item.brand,
      descricao: item.description.substring(0, 100) + '...',
    }));

    // Preparar lista de todos os produtos disponíveis (limitado para não exceder tokens)
    const productsWithCategories = allProducts.slice(0, 50).map(p => {
      const categoryName = ('category' in p && p.category) ? p.category.name : 'N/A';
      return {
        id: p.id,
        nome: p.name,
        categoria: categoryName,
        marca: p.brand,
        descricao: p.description.substring(0, 80) + '...',
        preco: p.price,
        emEstoque: p.inStock,
      };
    });

    const prompt = `Você é um assistente de recomendações para uma loja online de produtos da Amazônia brasileira chamada "Casa D'Amazonia".
Sua função é sugerir produtos complementares baseados nos itens que o cliente tem no carrinho.

ITENS NO CARRINHO DO CLIENTE:
${JSON.stringify(cartSummary, null, 2)}

PRODUTOS DISPONÍVEIS NA LOJA:
${JSON.stringify(productsWithCategories, null, 2)}

INSTRUÇÕES:
1. Analise os produtos no carrinho e identifique padrões, categorias, uso complementar, ou combinações lógicas
2. Recomende até ${limit} produtos que façam sentido com o que já está no carrinho
3. Considere:
   - Produtos da mesma categoria quando fizer sentido
   - Produtos complementares (ex: se tem açaí, sugerir granola ou castanhas)
   - Produtos similares mas diferentes (ex: se tem castanha do Pará, sugerir outras castanhas)
   - Combinações típicas da culinária amazônica
   - Produtos que completam uma experiência de compra
4. NÃO recomende produtos que já estão no carrinho
5. Priorize produtos em estoque
6. Retorne APENAS um JSON válido no formato: {"productIds": [1, 2, 3, ...], "reasoning": "breve explicação"}

RESPOSTA (apenas JSON, sem markdown, sem código, sem explicações adicionais):`;

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em recomendações de produtos. Sempre retorne apenas JSON válido sem formatação markdown.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return [];
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    console.log('[AI Recommendations] Resposta recebida da OpenAI');

    if (!content) {
      console.error('[AI Recommendations] No content in OpenAI response');
      return [];
    }

    // Tentar extrair JSON da resposta (pode vir com markdown ou texto adicional)
    let jsonContent = content.trim();

    // Remover markdown code blocks se existirem
    jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Tentar encontrar o JSON no conteúdo
    const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonContent = jsonMatch[0];
    }

    const result: AIRecommendationResponse = JSON.parse(jsonContent);

    console.log('[AI Recommendations] IDs recomendados pela IA:', result.productIds);

    if (result.productIds && Array.isArray(result.productIds)) {
      // Garantir que os IDs existem nos produtos disponíveis
      const validIds = result.productIds.filter(id =>
        allProducts.some(p => p.id === id)
      );
      console.log('[AI Recommendations] IDs válidos após validação:', validIds);
      return validIds.slice(0, limit);
    }

    console.warn('[AI Recommendations] Resposta da IA não contém productIds válidos');
    return [];
  } catch (error) {
    console.error('[AI Recommendations] Error getting AI recommendations:', error);
    if (error instanceof Error) {
      console.error('[AI Recommendations] Error message:', error.message);
      console.error('[AI Recommendations] Error stack:', error.stack);
    }
    return [];
  }
}

