/**
 * @fileoverview Relevancy scoring types
 * @module lib/knowledge/relevancy-types
 */

export interface RelevancyScore {
  overallScore: number;
  breakdown: {
    termScore: number;
    titleScore: number;
    positionScore: number;
    recencyScore: number;
  };
  matchedTerms: string[];
}

export interface ScorableDocument {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  updatedAt?: Date;
}

export interface ScoringOptions {
  termWeight?: number;
  positionWeight?: number;
  recencyWeight?: number;
  titleBoost?: number;
  limit?: number;
}

export interface RelatedDocument {
  document: ScorableDocument;
  relevanceScore: number;
  sharedTerms: string[];
}

export interface SearchResult {
  documents: ScorableDocument[];
  scores: Map<string, RelevancyScore>;
  totalResults: number;
  searchTime: number;
}
