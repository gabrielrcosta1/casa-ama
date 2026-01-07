# Arquitetura e Documentação Técnica - Casa da Amazônia

## 📋 Índice
1. [Visão Geral da Arquitetura](#visão-geral)
2. [Stack Tecnológica](#stack-tecnológica)
3. [Infraestrutura e Serviços](#infraestrutura)
4. [Estado Atual vs. Requisitos](#estado-atual)
5. [Análise Sênior - Gaps e Prioridades](#análise-sênior)
6. [Roadmap de Implementação](#roadmap)

---

## 🏗️ Visão Geral da Arquitetura

### Padrão Arquitetural
- **Backend**: Express.js (Node.js/TypeScript)
- **Frontend**: React + Vite + TypeScript
- **Banco de Dados Principal**: PostgreSQL (Drizzle ORM)
- **Arquitetura**: Monolito modular com separação de serviços

### Fluxo de Dados Principal
```
Cliente → Express API → Serviços Especializados → Infraestrutura (DBs/Cache) → Resposta
```

---

## 🛠️ Stack Tecnológica

### Backend
- **Runtime**: Node.js com TypeScript
- **Framework**: Express.js
- **ORM**: Drizzle ORM
- **Autenticação**: JWT (implementado) + Session-based (admin)
- **Validação**: Zod

### Infraestrutura de Dados
- **PostgreSQL**: Banco principal (pedidos, produtos, usuários)
- **Redis**: Cache, sessões, carrinho temporário
- **Elasticsearch**: Busca de produtos
- **MongoDB**: Feedback e analytics backup
- **Qdrant**: Banco vetorial para recomendações

### Serviços Externos
- **Vindi**: Gateway de pagamento (implementado)
- **Stripe**: Gateway de pagamento (parcialmente implementado)
- **BigQuery**: Analytics (configurado, não totalmente integrado)

### Frontend
- **React 18**: Framework UI
- **Vite**: Build tool
- **TanStack Query**: Gerenciamento de estado servidor
- **Tailwind CSS**: Estilização
- **Radix UI**: Componentes acessíveis

---

## 🏛️ Infraestrutura e Serviços

### 1. Autenticação & Autorização

#### ✅ Implementado
- **JWT Tokens**: Sistema completo de access/refresh tokens
  - Arquivo: `server/auth/jwt.ts`
  - Funcionalidades:
    - Geração de token pairs (access + refresh)
    - Verificação e validação
    - Revogação de tokens (blacklist em Redis)
    - Armazenamento de refresh tokens em Redis
- **RBAC (Role-Based Access Control)**: Sistema de permissões granular
  - Arquivo: `server/auth/rbac.ts`
  - Permissões por role (customer, supplier, admin)
  - Middleware `requirePermission` implementado
- **Middleware de Autenticação**: `requireAuth` e `requirePermission`
  - Arquivo: `server/auth/middleware.ts`

#### ⚠️ Parcialmente Implementado
- **Sessões Admin**: Usa Set em memória (não Redis)
  - Localização: `server/routes.ts` linha 370
  - **Problema**: Não persiste entre reinicializações do servidor

#### ❌ Não Implementado
- **Sessões em Redis para Admin**: Admin ainda usa sessões em memória

### 2. Busca de Produtos

#### ✅ Implementado
- **Elasticsearch**: Totalmente integrado
  - Arquivo: `server/infrastructure/elasticsearch.ts`
  - Índice criado automaticamente
  - Mapeamento completo de campos
  - Busca com multi-match, filtros, ordenação
- **Cache Redis**: Implementado para resultados de busca
  - Arquivo: `server/services/search.ts`
  - TTL: 3600 segundos (1 hora)
  - Invalidação de cache implementada
- **Sincronização**: Produtos sincronizados com Elasticsearch
  - Função: `syncProductToElasticsearch()`

#### ✅ Funcionalidades
- Busca full-text com fuzziness
- Filtros por categoria, fornecedor, marca, preço, rating
- Ordenação customizável
- Paginação
- Fallback para PostgreSQL se Elasticsearch falhar

### 3. Sistema de Recomendação (IA)

#### ✅ Implementado
- **Qdrant**: Banco vetorial configurado
  - Arquivo: `server/infrastructure/qdrant.ts`
  - Collection criada automaticamente
  - Dimensão: 384 (embeddings)
- **Sistema de Embeddings**: Parcialmente implementado
  - Arquivo: `server/services/embeddings.ts`
  - Funções:
    - `generateProductEmbedding()` - **PROBLEMA**: Usa valores aleatórios, não modelo real
    - `generateUserEmbedding()` - **PROBLEMA**: Usa valores aleatórios
    - `storeProductEmbedding()` - ✅ Funciona
    - `findSimilarProducts()` - ✅ Busca em Qdrant
    - `findProductsForUser()` - ✅ Busca baseada em embedding do usuário
- **Histórico de Usuário em Redis**: ✅ Implementado
  - Chave: `user_history:{userType}:{userId}`
  - TTL: 30 dias
  - Atualização automática
- **Re-ranking**: ✅ Implementado
  - Arquivo: `server/recommendation/recommender.ts`
  - Considera: estoque, featured, sale, rating

#### ❌ Não Implementado
- **Modelo de Embeddings Real**: Atualmente usa valores aleatórios
  - **Necessário**: Integração com modelo (OpenAI, Sentence Transformers, etc.)
- **Re-rank com Custos Logísticos**: Re-ranking não considera custos de entrega

### 4. Carrinho de Compras

#### ✅ Implementado
- **Redis para Carrinho**: Totalmente implementado
  - Arquivo: `server/services/cart.ts`
  - TTL: 7 dias
  - Funções completas: get, add, update, remove, clear
- **Sincronização PostgreSQL ↔ Redis**: ✅ Implementado
  - `syncCartToPostgreSQL()` - Sincroniza Redis → PostgreSQL
  - `syncCartFromPostgreSQL()` - Sincroniza PostgreSQL → Redis

#### ⚠️ Observação
- Rotas ainda usam PostgreSQL diretamente em alguns endpoints
- Necessário migrar rotas para usar funções Redis

### 5. Processamento de Pagamento

#### ✅ Implementado
- **Vindi**: Totalmente integrado
  - Arquivo: `server/vindiService.ts`
  - Suporte a cartão de crédito e PIX
- **Stripe**: Parcialmente implementado
  - Arquivo: `server/services/payment.ts`
  - Código presente mas não totalmente testado
- **Webhooks**: ✅ Implementado
  - Endpoints: `/api/webhooks/stripe` e `/api/webhooks/vindi`
  - Idempotência via Redis
  - Validação de assinatura (Stripe)

#### ❌ Não Implementado
- **Validação PCI-DSS**: Não há documentação ou implementação
  - **Crítico**: Necessário para produção com cartões

### 6. Criação de Pedidos

#### ✅ Implementado
- **Decrementação de Inventário**: ✅ Implementado
  - Arquivo: `server/services/orders.ts`
  - Função: `createOrderTransactionally()`
  - Usa transações PostgreSQL
  - Lock de linha (`for update`) para evitar race conditions
  - Validação de estoque antes de decrementar
- **Movimentação de Estoque**: ✅ Implementado
  - Tabela: `stock_movements`
  - Registro de todas as movimentações

#### ⚠️ Parcialmente Implementado
- **Logging em TimescaleDB**: Não há TimescaleDB
  - Logs são salvos em PostgreSQL normal
  - **Nota**: PostgreSQL pode ser convertido para TimescaleDB facilmente

### 7. Orquestração Logística

#### ✅ Implementado
- **Sistema de Rotas**: Implementado
  - Arquivo: `server/services/logistics.ts`
  - Função: `optimizeRoutes()`
  - Cálculo de distâncias (Haversine)
  - Consolidação de rotas
  - Atribuição de parceiros
- **Criação de Entregas**: ✅ Implementado
  - Função: `createDeliveryForOrder()`
  - Integração com sistema de rotas

#### ❌ Não Implementado
- **OR-Tools**: Package instalado mas não usado
  - **Problema**: Sistema usa algoritmo simples, não OR-Tools
- **Notificações para Produtores**: Não há sistema de notificações
- **Integração com Parceiros Logísticos**: Atribuição é aleatória

### 8. Rastreamento em Tempo Real

#### ✅ Implementado
- **WebSockets**: Totalmente implementado
  - Arquivo: `server/services/websocket.ts`
  - Servidor WebSocket configurado
  - Broadcast para múltiplos clientes
  - Suporte a tracking updates
- **Armazenamento de Tracking**: ✅ Implementado
  - Tabela: `delivery_tracking`
  - Funções: `recordTrackingData()`, `getTrackingHistory()`, `getLatestTracking()`
- **Alertas**: ✅ Implementado
  - `checkRouteDeviation()` - Detecta desvios de rota
  - `checkTemperatureAlert()` - Detecta temperatura fora do range
- **Mock IoT**: ✅ Implementado
  - Função: `mockIoTTracking()` para testes

#### ❌ Não Implementado
- **TimescaleDB**: Tracking salvo em PostgreSQL normal
  - **Impacto**: Performance pode degradar com muitos dados
- **Integração IoT Real**: Apenas mock implementado
  - Necessário: Endpoint para receber dados de dispositivos LoRa/Satélite

### 9. Entrega e Feedback

#### ✅ Implementado
- **Sistema de Feedback**: ✅ Implementado
  - Arquivo: `server/services/feedback.ts`
  - Armazenamento em PostgreSQL
  - Endpoints: criar, buscar por produto, solicitar feedback
- **MongoDB**: ✅ Configurado
  - Arquivo: `server/infrastructure/mongodb.ts`
  - Usado como backup para analytics

#### ❌ Não Implementado
- **Assinatura Digital**: Não há sistema de assinatura
- **Solicitação Automática de Feedback**: Existe endpoint mas não é automático
- **Feedback Loop para ML**: Embeddings não são atualizados com feedback

### 10. Analytics & Insights

#### ✅ Implementado
- **Analytics Básicos**: ✅ Implementado
  - Arquivo: `server/services/analytics.ts`
  - Funções:
    - `getSalesAnalytics()` - Vendas por data e produto
    - `getCustomerAnalytics()` - Análise de clientes
    - `getProductPerformance()` - Performance de produtos
- **BigQuery**: ✅ Configurado
  - Função: `exportToBigQuery()`
  - Fallback para MongoDB se BigQuery falhar
  - Sincronização: `syncAnalyticsToBigQuery()`

#### ❌ Não Implementado
- **Dashboards**: Não há dashboards implementados
  - Superset/Metabase não estão configurados
- **Relatórios Automáticos**: Não há sistema de relatórios
- **Feedback Loop para IA**: Analytics não alimenta sistema de recomendação

---

## 🔍 Análise Sênior - Gaps e Prioridades

### Crítico (Bloqueadores para Produção)

#### 1. **Modelo de Embeddings Real** 🔴
**Status**: Usando valores aleatórios
**Impacto**: Recomendações não funcionam corretamente
**Solução**:
- Integrar modelo de embeddings (OpenAI, Sentence Transformers, ou modelo local)
- Opção recomendada: `sentence-transformers` (all-MiniLM-L6-v2) - 384 dims, gratuito
- Alternativa: OpenAI `text-embedding-3-small` (1536 dims, pago)

#### 2. **Validação PCI-DSS** 🔴
**Status**: Não implementado
**Impacto**: Não pode processar cartões em produção
**Solução**:
- Usar tokenização (Stripe/Vindi já fazem isso)
- Não armazenar dados de cartão
- Documentar compliance
- Auditoria de segurança

#### 3. **Sessões Admin em Redis** 🟡
**Status**: Em memória (Set)
**Impacto**: Sessões perdidas ao reiniciar servidor
**Solução**: Migrar para Redis (2-3 horas)

### Alto (Impacta Performance/Escalabilidade)

#### 4. **OR-Tools para Logística** 🟡
**Status**: Algoritmo simples implementado
**Impacto**: Rotas não otimizadas, custos maiores
**Solução**:
- Integrar OR-Tools para Vehicle Routing Problem (VRP)
- Considerar capacidades de veículos
- Otimizar múltiplas entregas

#### 5. **TimescaleDB para Tracking** 🟡
**Status**: PostgreSQL normal
**Impacto**: Performance degrada com muitos dados de tracking
**Solução**:
- Migrar tabela `delivery_tracking` para TimescaleDB
- Usar hypertables para particionamento temporal
- Implementar retenção automática

#### 6. **Integração IoT Real** 🟡
**Status**: Apenas mock
**Impacto**: Não recebe dados reais de dispositivos
**Solução**:
- Criar endpoint `/api/iot/tracking` com autenticação
- Suportar protocolos LoRa/Satélite
- Validação de dados e rate limiting

### Médio (Melhorias Importantes)

#### 7. **Re-rank com Custos Logísticos** 🟢
**Status**: Re-ranking básico
**Impacto**: Recomendações não consideram custo de entrega
**Solução**: Adicionar custo logístico ao score de re-ranking

#### 8. **Feedback Loop para ML** 🟢
**Status**: Feedback não atualiza embeddings
**Impacto**: Recomendações não melhoram com feedback
**Solução**: Recalcular embeddings de produtos baseado em feedback

#### 9. **Dashboards de Analytics** 🟢
**Status**: Apenas endpoints de dados
**Impacto**: Difícil visualizar insights
**Solução**: Integrar Metabase ou criar dashboards React

#### 10. **Notificações para Produtores** 🟢
**Status**: Não implementado
**Impacto**: Produtores não sabem quando há pedidos
**Solução**: Sistema de notificações (email, SMS, push)

### Baixo (Nice to Have)

#### 11. **Assinatura Digital** 🔵
**Status**: Não implementado
**Impacto**: Não há prova de entrega
**Solução**: Integrar serviço de assinatura (DocuSign, HelloSign)

#### 12. **Solicitação Automática de Feedback** 🔵
**Status**: Endpoint existe mas não é automático
**Impacto**: Menos feedback coletado
**Solução**: Job agendado que solicita feedback após entrega

---

## 📊 Resumo por Tecnologia

### ✅ Totalmente Implementado
1. **Redis** - Cache, sessões JWT, carrinho, histórico
2. **Elasticsearch** - Busca de produtos com cache
3. **JWT** - Sistema completo de autenticação
4. **Qdrant** - Banco vetorial configurado
5. **MongoDB** - Backup de analytics
6. **WebSockets** - Rastreamento em tempo real
7. **BigQuery** - Configurado (parcialmente usado)

### ⚠️ Parcialmente Implementado
1. **Stripe** - Código presente mas não totalmente testado
2. **OR-Tools** - Instalado mas não usado
3. **Embeddings** - Estrutura pronta mas usa valores aleatórios
4. **TimescaleDB** - Não usado (PostgreSQL normal)

### ❌ Não Implementado
1. **Modelo de Embeddings Real** - Crítico
2. **Validação PCI-DSS** - Crítico
3. **Dashboards** - Superset/Metabase
4. **Integração IoT Real** - Apenas mock
5. **Assinatura Digital** - Não há sistema
6. **Notificações** - Não há sistema

---

## 🗺️ Roadmap de Implementação

### Fase 1: Crítico (2-3 semanas)
1. ✅ Integrar modelo de embeddings real
2. ✅ Documentar e validar PCI-DSS compliance
3. ✅ Migrar sessões admin para Redis

### Fase 2: Alto Impacto (3-4 semanas)
4. ✅ Integrar OR-Tools para logística
5. ✅ Migrar tracking para TimescaleDB
6. ✅ Implementar endpoint IoT real

### Fase 3: Melhorias (4-6 semanas)
7. ✅ Re-rank com custos logísticos
8. ✅ Feedback loop para ML
9. ✅ Dashboards de analytics
10. ✅ Sistema de notificações

### Fase 4: Nice to Have (2-3 semanas)
11. ✅ Assinatura digital
12. ✅ Solicitação automática de feedback

---

## 📝 Notas Técnicas Importantes

### Performance
- **Cache Redis**: TTLs configurados adequadamente
- **Elasticsearch**: Fallback para PostgreSQL implementado
- **Transações**: Uso correto de transações para pedidos

### Segurança
- **JWT**: Implementação segura com refresh tokens
- **Validação**: Zod usado em todos os endpoints
- **SQL Injection**: Protegido por Drizzle ORM

### Escalabilidade
- **Stateless**: API é stateless (exceto sessões admin)
- **Cache**: Estratégia de cache bem implementada
- **WebSockets**: Suporta múltiplos clientes por entrega

### Observabilidade
- **Logging**: Logs básicos implementados
- **Error Handling**: Try-catch em serviços críticos
- **Falta**: Métricas, tracing, APM

---

## 🎯 Conclusão

O sistema está **bem arquitetado** com a maioria das funcionalidades implementadas. Os principais gaps são:

1. **Modelo de embeddings real** (crítico para recomendações)
2. **Validação PCI-DSS** (crítico para produção)
3. **OR-Tools** (importante para otimização logística)
4. **TimescaleDB** (importante para escalabilidade de tracking)

A base está sólida e a maioria das funcionalidades está implementada. Os gaps identificados são principalmente melhorias e otimizações, não bloqueadores arquiteturais.

