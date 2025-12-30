/**
 * @fileoverview Reciprocal Rank Fusion (RRF) Algorithm
 * @module lib/rag/rrf-fusion
 * @governance EPIC-7-4
 *
 * Implements Reciprocal Rank Fusion to combine multiple ranked result lists.
 * Formula: score = 1/(k + rank) where k is a constant (default: 60)
 */

import type { ExtendedSearchResult, RRFConfig, SearchResult } from './types';

/**
 * Reciprocal Rank Fusion implementation
 *
 * Combines results from multiple search sources using rank-based scoring.
 */
export class RRFFusion {
  private config: Required<RRFConfig>;

  constructor(config?: RRFConfig) {
    this.config = {
      k: config?.k ?? 60,
      maxResults: config?.maxResults ?? 10,
    };
  }

  /**
   * Fuse two ranked result lists using RRF
   *
   * @param keywordResults - Results from BM25 keyword search
   * @param vectorResults - Results from vector semantic search
   * @returns Fused and sorted results
   */
  fuse(
    keywordResults: SearchResult[],
    vectorResults: SearchResult[]
  ): ExtendedSearchResult[] {
    const scores = new Map<string, ExtendedSearchResult>();

    // Score keyword results
    keywordResults
      .slice(0, this.config.maxResults)
      .forEach((result, index) => {
        const id = result.document.id;
        const score = this.calculateRRFScore(index);

        if (!scores.has(id)) {
          scores.set(id, {
            ...result,
            matchedTerms: [],
            rank: index,
            source: 'bm25',
            highlightedText: undefined,
          });
        }

        const existing = scores.get(id)!;
        existing.score = (existing.score || 0) + score;
      });

    // Score vector results
    vectorResults
      .slice(0, this.config.maxResults)
      .forEach((result, index) => {
        const id = result.document.id;
        const score = this.calculateRRFScore(index);

        if (!scores.has(id)) {
          scores.set(id, {
            ...result,
            matchedTerms: [],
            rank: index,
            source: 'vector',
            highlightedText: undefined,
          });
        } else {
          // Document exists in both - combine scores and mark as RRF
          const existing = scores.get(id)!;
          existing.score = (existing.score || 0) + score;
          existing.source = 'rrf';
        }
      });

    // Convert to array and sort by score
    const fused = Array.from(scores.values()).sort((a, b) => {
      const scoreA = a.score || 0;
      const scoreB = b.score || 0;
      return scoreB - scoreA;
    });

    // Update ranks after sorting
    fused.forEach((result, index) => {
      result.rank = index;
    });

    return fused;
  }

  /**
   * Calculate RRF score for a given rank
   *
   * Formula: score = 1/(k + rank)
   *
   * @param rank - Position in ranked list (0-indexed)
   * @returns RRF score
   */
  private calculateRRFScore(rank: number): number {
    return 1 / (this.config.k + rank + 1);
  }
}

/**
 * Singleton instance (lazy-loaded)
 */
let rrfInstance: RRFFusion | null = null;

export function getRRFFusion(config?: RRFConfig): RRFFusion {
  if (!rrfInstance) {
    rrfInstance = new RRFFusion(config);
  }
  return rrfInstance;
}
