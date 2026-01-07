import { Client } from '@elastic/elasticsearch';

let esClient: Client | null = null;

export function getElasticsearchClient(): Client {
  if (esClient) {
    return esClient;
  }

  const node = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
  esClient = new Client({
    node,
    requestTimeout: 30000,
    pingTimeout: 3000,
  });

  return esClient;
}

export async function ensureElasticsearchIndex(): Promise<void> {
  const client = getElasticsearchClient();
  const indexName = 'products';

  try {
    const exists = await client.indices.exists({ index: indexName });

    if (!exists) {
      await client.indices.create({
        index: indexName,
        body: {
          settings: {
            analysis: {
              analyzer: {
                portuguese_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: [
                    'lowercase',
                    'asciifolding' // Remove acentos - funciona sem plugins adicionais
                  ]
                },
                portuguese_search: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: [
                    'lowercase',
                    'asciifolding' // Remove acentos para busca
                  ]
                }
              }
            }
          },
          mappings: {
            properties: {
              id: { type: 'integer' },
              name: {
                type: 'text',
                analyzer: 'portuguese_analyzer',
                search_analyzer: 'portuguese_search',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              description: {
                type: 'text',
                analyzer: 'portuguese_analyzer',
                search_analyzer: 'portuguese_search'
              },
              price: { type: 'float' },
              brand: {
                type: 'text',
                analyzer: 'portuguese_analyzer',
                search_analyzer: 'portuguese_search',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              categoryId: { type: 'integer' },
              categoryName: { type: 'keyword' },
              supplierId: { type: 'integer' },
              inStock: { type: 'boolean' },
              stockQuantity: { type: 'integer' },
              rating: { type: 'float' },
              isOnSale: { type: 'boolean' },
              isFeatured: { type: 'boolean' },
              isApproved: { type: 'boolean' },
              createdAt: { type: 'date' },
            }
          }
        }
      });
    }
  } catch (error) {
    console.error('Error ensuring Elasticsearch index:', error);
    throw error;
  }
}

export async function checkElasticsearch(): Promise<void> {
  const client = getElasticsearchClient();
  await client.ping();
}

