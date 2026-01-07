import { syncAllProductsToElasticsearch } from '../server/services/search';

async function syncElasticsearch() {
  try {
    console.log('🔄 Sincronizando produtos com Elasticsearch...');
    await syncAllProductsToElasticsearch();
    console.log('✅ Sincronização concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao sincronizar produtos:', error);
    process.exit(1);
  }
}

syncElasticsearch();

