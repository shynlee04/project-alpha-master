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

/**
 * Relevancy score result
 *
 * Result of scoring a document pair.
 */
export interface RelevancyScore {
  /** Overall relevancy score (0-1) */
  score: number;
  /** Individual factor scores */
  factors: {
    /** Embedding similarity (0-1) */
    embedding: number;
    /** Citation overlap (0-1) */
    citation: number;
    /** Subject proximity (0-1) */
    subject: number;
    /** Temporal proximity (0-1) */
    temporal: number;
    /** User interaction score (0-1) */
    interaction: number;
  };
  /** Scoring timestamp */
  calculatedAt: number;
}

/**
 * Document for scoring
 */
export interface ScorableDocument {
  /** Document ID */
  id: string;
  /** Embedding vector */
  embedding?: number[];
  /** Citations (IDs of cited documents) */
  citations?: string[];
  /** Subject classification */
  subject?: string;
  /** Creation timestamp */
  createdAt?: number;
  /** User interaction score */
  interactionScore?: number;
  /** Title */
  title?: string;
  /** Labels/tags */
  labels?: string[];
}

/**
 * Scoring options
 */
export interface ScoringOptions {
  /** Factor weights (default: equal weighting) */
  weights?: {
    embedding?: number;
    citation?: number;
    subject?: number;
    temporal?: number;
    interaction?: number;
  };
  /** Minimum score threshold */
  minScore?: number;
  /** Include factor breakdown */
  includeFactors?: boolean;
}

/**
 * Related document result
 */
export interface RelatedDocument {
  /** Related document ID */
  id: string;
  /** Document title */
  title?: string;
  /** Relevancy score */
  score: number;
  /** Factor scores */
  factors?: RelevancyScore['factors'];
}

/**
 * Relevancy cache entry
 */
interface CacheEntry {
  doc1Id: string;
  doc2Id: string;
  score: RelevancyScore;
  lastAccessed: number;
}

/**
 * Default factor weights
 */
const DEFAULT_WEIGHTS = {
  embedding: 0.35,
  citation: 0.20,
  subject: 0.20,
  temporal: 0.15,
  interaction: 0.10,
};

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

    // Calculate factors
    const factors = {
      embedding: this.calculateEmbeddingSimilarity(doc1, doc2),
      citation: this.calculateCitationOverlap(doc1, doc2),
      subject: this.calculateSubjectProximity(doc1, doc2),
      temporal: this.calculateTemporalProximity(doc1, doc2),
      interaction: this.calculateInteractionScore(doc1, doc2),
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
   * Calculate embedding similarity using cosine similarity
   */
  private calculateEmbeddingSimilarity(doc1: ScorableDocument, doc2: ScorableDocument): number {
    if (!doc1.embedding || !doc2.embedding) return 0;

    return this.cosineSimilarity(doc1.embedding, doc2.embedding);
  }

  /**
   * Calculate citation overlap (Jaccard similarity)
   */
  private calculateCitationOverlap(doc1: ScorableDocument, doc2: ScorableDocument): number {
    if (!doc1.citations || !doc2.citations) return 0;

    const set1 = new Set(doc1.citations);
    const set2 = new Set(doc2.citations);

    // Jaccard similarity: |A ∩ B| / |A ∪ B|
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Calculate subject proximity
   */
  private calculateSubjectProximity(doc1: ScorableDocument, doc2: ScorableDocument): number {
    if (!doc1.subject || !doc2.subject) return 0;

    // Same subject = 1.0
    if (doc1.subject === doc2.subject) return 1.0;

    // Check for hierarchical relationship (e.g., "Mathematics > Calculus" vs "Mathematics")
    const parts1 = doc1.subject.split(' > ');
    const parts2 = doc2.subject.split(' > ');

    // Share root subject = 0.5
    if (parts1[0] === parts2[0]) return 0.5;

    // No relationship = 0
    return 0;
  }

  /**
   * Calculate temporal proximity
   */
  private calculateTemporalProximity(doc1: ScorableDocument, doc2: ScorableDocument): number {
    if (!doc1.createdAt || !doc2.createdAt) return 0;

    const timeDiff = Math.abs(doc1.createdAt - doc2.createdAt);
    const dayDiff = timeDiff / (1000 * 60 * 60 * 24);

    // Within same day = 1.0
    if (dayDiff < 1) return 1.0;

    // Within same week = 0.7
    if (dayDiff < 7) return 0.7;

    // Within same month = 0.4
    if (dayDiff < 30) return 0.4;

    // Within same year = 0.2
    if (dayDiff < 365) return 0.2;

    // More than a year apart = 0
    return 0;
  }

  /**
   * Calculate user interaction score
   */
  private calculateInteractionScore(doc1: ScorableDocument, doc2: ScorableDocument): number {
    const score1 = doc1.interactionScore || 0;
    const score2 = doc2.interactionScore || 0;

    // Normalize to 0-1 (assuming max score is 100)
    const norm1 = Math.min(score1 / 100, 1.0);
    const norm2 = Math.min(score2 / 100, 1.0);

    // Average of both scores
    return (norm1 + norm2) / 2;
  }

  /**
   * Calculate cosine similarity between vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator > 0 ? dotProduct / denominator : 0;
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
