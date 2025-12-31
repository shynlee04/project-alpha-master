/**
 * @fileoverview Relevancy Scoring Types
 * @module lib/knowledge/relevancy-types
 * @governance EPIC-38, PHASE-6
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
export interface CacheEntry {
  doc1Id: string;
  doc2Id: string;
  score: RelevancyScore;
  lastAccessed: number;
}

/**
 * Default factor weights
 */
export const DEFAULT_WEIGHTS = {
  embedding: 0.35,
  citation: 0.20,
  subject: 0.20,
  temporal: 0.15,
  interaction: 0.10,
};
