import { QdrantClient } from '@qdrant/js-client-rest';

let qdrantClient: QdrantClient | null = null;

export function getQdrantClient(): QdrantClient {
  if (qdrantClient) {
    return qdrantClient;
  }

  const url = process.env.QDRANT_URL || 'http://localhost:6333';
  qdrantClient = new QdrantClient({ url });

  return qdrantClient;
}

export async function ensureQdrantCollection(collectionName: string = 'product_embeddings'): Promise<void> {
  const client = getQdrantClient();

  try {
    const collections = await client.getCollections();
    const collectionExists = collections.collections.some(
      (col) => col.name === collectionName
    );

    if (!collectionExists) {
      await client.createCollection(collectionName, {
        vectors: {
          size: 384,
          distance: 'Cosine',
        },
      });
    }
  } catch (error) {
    console.error('Error ensuring Qdrant collection:', error);
    throw error;
  }
}

export async function checkQdrant(): Promise<void> {
  const client = getQdrantClient();
  await client.getCollections();
}

