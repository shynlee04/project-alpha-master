/**
 * @fileoverview RAG Query Optimizer - Helper Functions
 * @module lib/rag/query-optimizer-helpers
 * @governance EPIC-32-4
 *
 * Helper functions for query optimization.
 * Note: createWeightedQuery moved to QueryOptimizer static method to break circular dependency.
 */

// Re-export for backward compatibility (imports from query-optimizer.ts static method)
export { createWeightedQuery } from './query-optimizer';

