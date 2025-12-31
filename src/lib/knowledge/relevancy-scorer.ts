/**
 * @fileoverview Relevancy Scoring Service
 * @module lib/knowledge/relevancy-scorer
 * @governance EPIC-38, PHASE-6
 * @ai-observable true
 *
 * Multi-factor relevancy scoring for inter-document relationships.
 * Scores cached and updated incrementally for performance.
 *
 * @example
 * ```tsx
 * import { RelevancyScorer, createRelevancyScorer } from '@/lib/knowledge/relevancy-scorer';
 *
 * const scorer = createRelevancyScorer();
 *
 * // Calculate relevancy between two documents
 * const score = await scorer.calculateRelevancy(doc1, doc2);
 * console.log(score.score); // 0.85
 * console.log(score.factors); // { embedding: 0.8, subject: 0.9, ... }
 *
 * // Get top related documents
 * const related = await scorer.getTopRelated(docId, 5);
 * ```
 */

import type {
  RelevancyScore,
  ScorableDocument,
  ScoringOptions,
  RelatedDocument,
  CacheEntry,
} from './relevancy-types';
import { DEFAULT_WEIGHTS } from './relevancy-types';
import {
  calculateEmbeddingSimilarity,
  calculateCitationOverlap,
  calculateSubjectProximity,
  calculateTemporalProximity,
  calculateInteractionScore,
} from './relevancy-factors';

// Re-export types for backward compatibility
export type { RelevancyScore, ScorableDocument, ScoringOptions, RelatedDocument };

/**
 * Relevancy Scoring Service
 *
 * Calculates multi-factor relevancy scores between documents.
 * Scores are cached and updated incrementally for performance.
 */
export class RelevancyScorer {
  private cache: Map<string, CacheEntry>;
  private maxCacheSize: number;
  private documentStore: Map<string, ScorableDocument>;

  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 1000;
    this.documentStore = new Map();
  }

  /**
   * Calculate relevancy between two documents
   *
   * @param doc1 - First document
   * @param doc2 - Second document
   * @param options - Scoring options
   * @returns Relevancy score
   *
   * @example
   * ```tsx
   * const score = await scorer.calculateRelevancy(doc1, doc2);
   * console.log(score.score); // 0.85
   * ```
   */
  async calculateRelevancy(
    doc1: ScorableDocument,
    doc2: ScorableDocument,
    options: ScoringOptions = {}
  ): Promise<RelevancyScore> {
    // Store documents
    this.documentStore.set(doc1.id, doc1);
    this.documentStore.set(doc2.id, doc2);

    // Check cache
    const cacheKey = this.getCacheKey(doc1.id, doc2.id);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      cached.lastAccessed = Date.now();
      return cached.score;
    }

    // Get weights
    const weights = { ...DEFAULT_WEIGHTS, ...options.weights };

    // Calculate factors using imported functions
    const factors = {
      embedding: calculateEmbeddingSimilarity(doc1, doc2),
      citation: calculateCitationOverlap(doc1, doc2),
      subject: calculateSubjectProximity(doc1, doc2),
      temporal: calculateTemporalProximity(doc1, doc2),
      interaction: calculateInteractionScore(doc1, doc2),
    };

    // Calculate weighted score
    const score =
      factors.embedding * weights.embedding! +
      factors.citation * weights.citation! +
      factors.subject * weights.subject! +
      factors.temporal * weights.temporal! +
      factors.interaction * weights.interaction!;

    const result: RelevancyScore = {
      score: Math.min(score, 1.0),
      factors,
      calculatedAt: Date.now(),
    };

    // Cache result
    this.cache.set(cacheKey, {
      doc1Id: doc1.id,
      doc2Id: doc2.id,
      score: result,
      lastAccessed: Date.now(),
    });

    // Trim cache if needed
    this.trimCache();

    return result;
  }

  /**
   * Get cache key for document pair
   */
  private getCacheKey(id1: string, id2: string): string {
    // Sort IDs to ensure consistent key
    const [a, b] = [id1, id2].sort();
    return `${a}-${b}`;
  }

  /**
   * Trim cache to max size
   */
  private trimCache(): void {
    if (this.cache.size <= this.maxCacheSize) return;

    // Sort by last accessed and remove oldest entries
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

    const toRemove = entries.slice(0, this.cache.size - this.maxCacheSize);
    for (const [key] of toRemove) {
      this.cache.delete(key);
    }
  }

  /**
   * Get top related documents for a document
   *
   * @param docId - Document ID
   * @param limit - Maximum number of results
   * @param options - Scoring options
   * @returns Array of related documents
   *
   * @example
   * ```tsx
   * const related = await scorer.getTopRelated('doc-123', 5);
   * console.log(related); // [{ id: 'doc-456', score: 0.9 }, ...]
   * ```
   */
  async getTopRelated(
    docId: string,
    limit: number = 10,
    options: ScoringOptions = {}
  ): Promise<RelatedDocument[]> {
    const doc = this.documentStore.get(docId);
    if (!doc) return [];

    const results: RelatedDocument[] = [];

    // Score against all other documents
    for (const [otherId, otherDoc] of this.documentStore) {
      if (otherId === docId) continue;

      const scoreResult = await this.calculateRelevancy(doc, otherDoc, options);

      results.push({
        id: otherId,
        title: otherDoc.title,
        score: scoreResult.score,
        factors: scoreResult.factors,
      });
    }

    // Sort by score and limit
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

  /**
   * Batch calculate relevancy for multiple document pairs
   *
   * @param pairs - Array of document ID pairs
   * @param options - Scoring options
   * @returns Array of relevancy scores
   */
  async batchCalculateRelevancy(
    pairs: Array<{ doc1Id: string; doc2Id: string }>,
    options: ScoringOptions = {}
  ): Promise<Array<{ doc1Id: string; doc2Id: string; score: RelevancyScore }>> {
    const results = await Promise.all(
      pairs.map(async ({ doc1Id, doc2Id }) => {
        const doc1 = this.documentStore.get(doc1Id);
        const doc2 = this.documentStore.get(doc2Id);

        if (!doc1 || !doc2) {
          return {
            doc1Id,
            doc2Id,
            score: {
              score: 0,
              factors: {
                embedding: 0,
                citation: 0,
                subject: 0,
                temporal: 0,
                interaction: 0,
              },
              calculatedAt: Date.now(),
            },
          };
        }

        const score = await this.calculateRelevancy(doc1, doc2, options);

        return { doc1Id, doc2Id, score };
      })
    );

    return results;
  }

  /**
   * Update document in store (invalidates affected cache entries)
   *
   * @param doc - Updated document
   */
  updateDocument(doc: ScorableDocument): void {
    this.documentStore.set(doc.id, doc);

    // Invalidate cache entries involving this document
    for (const [key, entry] of this.cache) {
      if (entry.doc1Id === doc.id || entry.doc2Id === doc.id) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Remove document from store
   *
   * @param docId - Document ID to remove
   */
  removeDocument(docId: string): void {
    this.documentStore.delete(docId);

    // Invalidate cache entries involving this document
    for (const [key, entry] of this.cache) {
      if (entry.doc1Id === docId || entry.doc2Id === docId) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.cache.clear();
    this.documentStore.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      hitRate: 0, // TODO: Track hits/misses
    };
  }
}

/**
 * Factory function to create RelevancyScorer
 *
 * @returns RelevancyScorer instance
 *
 * @example
 * ```tsx
 * const scorer = createRelevancyScorer();
 * const score = await scorer.calculateRelevancy(doc1, doc2);
 * ```
 */
export function createRelevancyScorer(): RelevancyScorer {
  return new RelevancyScorer();
}
