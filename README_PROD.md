# Production Readiness Guide

**Owner**: Vitor Hugo  
**Last Updated**: Based on current codebase analysis

---

## 📊 Current Status

### ✅ Production Ready
- **Authentication & Authorization**: Stable JWT system with refresh tokens
- **Product Search & Cache**: Elasticsearch with Redis caching operational
- **Checkout and Payments**: Tokenized payment processing (Vindi/Stripe)
- **Logistics Baseline**: Basic routing and delivery system functional
- **Real-time Tracking**: WebSocket-based tracking available
- **Inventory Management**: Transactional stock decrementation implemented
- **Order Processing**: Complete order lifecycle with stock validation

### ⚠️ Experimental Features (Feature Flags)
- **Recommendation AI**: OFF (embeddings use random values, not production-ready)
- **OR-Tools Logistics Optimization**: OFF (algorithm simple, OR-Tools not integrated)
- **Real IoT Integration**: OFF (mock only, no real device endpoint)
- **Feedback ML Loop**: OFF (feedback doesn't update embeddings)
- **TimescaleDB**: OFF (using PostgreSQL normal)
- **BigQuery Sync**: OFF (configured but not auto-syncing)

---

## 🚩 Feature Flags

Feature flags are controlled via environment variables:

```bash
# Enable experimental features (use with caution)
FEATURE_RECOMMENDATION_AI=true
FEATURE_OR_TOOLS_LOGISTICS=true
FEATURE_REAL_IOT=true
FEATURE_FEEDBACK_LOOP=true
FEATURE_TIMESCALEDB=true
FEATURE_BIGQUERY_SYNC=true

# Stripe production mode
STRIPE_MODE=production
```

**Default**: All experimental features are **OFF** for production stability.

### Feature Flag Usage

```typescript
import { FEATURES, isFeatureEnabled, requireFeature } from './server/config/features';

// Check if feature is enabled
if (isFeatureEnabled('RECOMMENDATION_AI')) {
  // Use AI recommendations
}

// Require feature (throws if not enabled)
requireFeature('OR_TOOLS_LOGISTICS');
```

---

## 🔒 Production Strategy

### Phase 1: Core Stability (Current)
- ✅ All core features enabled and stable
- ✅ External gateways handle PCI scope (Vindi/Stripe tokenization)
- ✅ Infrastructure validated via preflight checks
- ❌ No experimental systems enabled

### Phase 2: Progressive Rollout (After Stabilization)
1. **Monitor core metrics** (orders, payments, search)
2. **Collect real data** (user behavior, logistics patterns)
3. **Enable features incrementally**:
   - Start with low-risk features (BigQuery sync)
   - Move to medium-risk (TimescaleDB migration)
   - Finally high-impact (AI recommendations, OR-Tools)

### Phase 3: Optimization (After Data Collection)
- Use real data to train/improve:
  - AI recommendation models
  - Logistics optimization algorithms
  - Feedback loops

---

## 🛡️ Risk Management

### PCI-DSS Compliance
- ✅ **Tokenization**: No card data stored (Vindi/Stripe handle tokens)
- ✅ **HTTPS**: Required in production
- ⚠️ **Documentation**: PCI-DSS compliance doc needed
- ⚠️ **Audit**: Security audit recommended before production

### Infrastructure Health
- ✅ **Preflight Checks**: Validates all services before deploy
- ✅ **Health Endpoints**: `/health`, `/health/live`, `/health/ready`
- ✅ **Graceful Degradation**: Fallbacks for Elasticsearch, MongoDB

### Data Safety
- ✅ **Transactions**: All critical operations use database transactions
- ✅ **Stock Validation**: Prevents overselling with row-level locks
- ✅ **Error Handling**: Try-catch in all critical paths

---

## 🚀 Pre-Deployment Checklist

### 1. Infrastructure Validation
```bash
# Run preflight checks
npm run preflight:prod
# or
tsx scripts/preflight-prod.ts
```

**Required Services**:
- ✅ PostgreSQL (connection + query)
- ✅ Redis (connection + ping)
- ✅ Elasticsearch (connection + ping)
- ✅ Qdrant (connection + collections)

### 2. Environment Variables
```bash
# Required
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
ELASTICSEARCH_URL=http://...
QDRANT_URL=http://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...

# Payment Gateways
VINDI_API_URL=...
VINDI_API_TOKEN=...
STRIPE_SECRET_KEY=... (optional)
STRIPE_WEBHOOK_SECRET=... (optional)

# Optional
MONGODB_URL=...
BIGQUERY_DATASET=...
GCP_PROJECT_ID=...
```

### 3. Feature Flags
- Verify all experimental features are **OFF** unless explicitly enabled
- Document which features are enabled and why

### 4. Security
- [ ] HTTPS enabled
- [ ] JWT secrets are strong and rotated
- [ ] API keys stored securely (not in code)
- [ ] CORS configured correctly
- [ ] Rate limiting configured (if applicable)

### 5. Monitoring
- [ ] Health check endpoints accessible
- [ ] Logging configured
- [ ] Error tracking (Sentry, etc.) configured
- [ ] Metrics collection (if applicable)

---

## 📈 Health Check Endpoints

### `/health`
Full health check of all services:
```json
{
  "status": "ok" | "degraded",
  "services": {
    "api": true,
    "redis": true,
    "postgres": true,
    "elasticsearch": true,
    "qdrant": true
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes**:
- `200`: All services healthy
- `503`: One or more services down

### `/health/live`
Liveness probe (always returns 200 if API is running):
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### `/health/ready`
Readiness probe (checks critical services):
```json
{
  "status": "ready",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes**:
- `200`: Ready to serve traffic
- `503`: Not ready (critical services down)

---

## 🔧 Maintenance

### Daily
- Monitor health check endpoints
- Review error logs
- Check payment gateway status

### Weekly
- Review analytics data
- Check infrastructure costs
- Review feature flag usage

### Monthly
- Security audit
- Performance review
- Plan feature rollouts

---

## 📝 Known Limitations

### Current
1. **AI Recommendations**: Not production-ready (random embeddings)
2. **OR-Tools**: Not integrated (simple algorithm used)
3. **TimescaleDB**: Not used (PostgreSQL normal)
4. **IoT Integration**: Mock only
5. **Admin Sessions**: In-memory (not Redis)

### Planned Fixes
- See [RECOMMENDATIONS.md](./RECOMMENDATIONS.md) for detailed fixes

---

## 🆘 Troubleshooting

### Preflight Check Fails
1. Check service connectivity
2. Verify environment variables
3. Check service logs
4. Verify network/firewall rules

### Health Check Degraded
1. Check individual service status
2. Review service logs
3. Check resource usage (CPU, memory, disk)
4. Verify service configurations

### Payment Issues
1. Verify gateway credentials
2. Check webhook endpoints
3. Review payment logs
4. Verify PCI-DSS compliance

---

## 📚 Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [GAPS_ANALYSIS.md](./GAPS_ANALYSIS.md) - Gap analysis
- [RECOMMENDATIONS.md](./RECOMMENDATIONS.md) - Implementation recommendations

---

## 👤 Contact

**Owner**: Vitor Hugo  
**For Issues**: Create GitHub issue or contact team lead

