/**
 * FEATURE FLAGS — PRODUÇÃO
 * Owner: Vitor Hugo
 * Purpose: Control experimental features rollout
 */

export const FEATURES = {
  RECOMMENDATION_AI: process.env.FEATURE_RECOMMENDATION_AI === 'true',
  OR_TOOLS_LOGISTICS: process.env.FEATURE_OR_TOOLS_LOGISTICS === 'true',
  REAL_IOT: process.env.FEATURE_REAL_IOT === 'true',
  STRIPE_PROD: process.env.STRIPE_MODE === 'production',
  FEEDBACK_LOOP: process.env.FEATURE_FEEDBACK_LOOP === 'true',
  TIMESCALEDB: process.env.FEATURE_TIMESCALEDB === 'true',
  BIGQUERY_SYNC: process.env.FEATURE_BIGQUERY_SYNC === 'true',
} as const;

export type FeatureName = keyof typeof FEATURES;

export function isFeatureEnabled(feature: FeatureName): boolean {
  return FEATURES[feature];
}

export function requireFeature(feature: FeatureName): void {
  if (!FEATURES[feature]) {
    throw new Error(`Feature ${feature} is not enabled. Set FEATURE_${feature}=true to enable.`);
  }
}

