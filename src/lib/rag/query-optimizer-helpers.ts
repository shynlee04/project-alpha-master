/**
 * @fileoverview RAG Query Optimizer - Helper Functions
 * @module lib/rag/query-optimizer-helpers
 * @governance EPIC-32-4
 *
 * Helper functions for query optimization.
 */

import type { QueryWeightConfig } from './query-optimizer-types';
import { QueryOptimizer } from './query-optimizer';

/**
 * Create a weighted query for relevance tuning
 *
 * @param query - Base query
 * @param weights - Weight configuration
 * @returns Weighted query string
 *
 * @example
 * ```typescript
 * const weighted = createWeightedQuery("machine learning", {
 *   entityWeight: 2.0,
 *   keywordWeight: 1.0,
 * });
 * // Returns: '"machine learning"^2.0'
 * ```
 */
export function createWeightedQuery(
  query: string,
  weights: QueryWeightConfig = {}
): string {
  const {
    phraseWeight = 2.0,
    keywordWeight = 1.0,
    entityWeight = 1.5,
    negationWeight = -1.0,
  } = weights;

  const optimizer = new QueryOptimizer();
  const parsed = optimizer.parseQuery(query);

  let weightedQuery = '';

  // Add phrase weight for entities
  for (const entity of parsed.entities) {
    weightedQuery += `"${entity}"^${entityWeight} `;
  }

  // Add keyword weights
  for (const keyword of parsed.keywords) {
    if (!parsed.entities.some(e => keyword.includes(e) || e.includes(keyword))) {
      weightedQuery += `${keyword}^${keywordWeight} `;
    }
  }

  // Handle negations
  for (const negation of parsed.negations) {
    weightedQuery += `NOT ${negation} `;
  }

  return weightedQuery.trim();
}
