/**
 * PRE-FLIGHT CHECK — PRODUÇÃO
 * Owner: Vitor Hugo
 * Purpose: Block deploy if infra is not healthy
 */

import { checkRedis } from '../server/infrastructure/redis';
import { checkPostgres } from '../server/infrastructure/postgres';
import { checkElasticsearch } from '../server/infrastructure/elasticsearch';
import { checkQdrant } from '../server/infrastructure/qdrant';

async function run() {
  console.log('🚀 Running production preflight checks...\n');

  const checks = [
    { name: 'PostgreSQL', fn: checkPostgres },
    { name: 'Redis', fn: checkRedis },
    { name: 'Elasticsearch', fn: checkElasticsearch },
    { name: 'Qdrant', fn: checkQdrant }
  ];

  for (const check of checks) {
    try {
      await check.fn();
      console.log(`✅ ${check.name} OK`);
    } catch (error) {
      console.error(`❌ ${check.name} FAILED:`, error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }

  console.log('\n✅ Production environment validated.');
  process.exit(0);
}

run().catch((error) => {
  console.error('Fatal error during preflight checks:', error);
  process.exit(1);
});

