/**
 * @fileoverview RAG Query Optimizer - Type Definitions
 * @module lib/rag/query-optimizer-types
 * @governance EPIC-32-4
 *
 * Type definitions for query parsing and optimization.
 */

import type { SearchFilters } from './hybrid-retriever';

/**
 * Parsed query components
 */
export interface ParsedQuery {
  /** Original query text */
  original: string;
  /** Normalized query text */
  normalized: string;
  /** Extracted keywords */
  keywords: string[];
  /** Identified entities (e.g., "machine learning", "react hooks") */
  entities: string[];
  /** Boolean operators found */
  operators: QueryOperator[];
  /** Negation terms found */
  negations: string[];
  /** Suggested filters based on query */
  suggestedFilters: SearchFilters;
  /** Query type classification */
  queryType: QueryType;
  /** Confidence score (0-1) */
  confidence: number;
}

/**
 * Query operator types
 */
export type QueryOperator = 'AND' | 'OR' | 'NOT';

/**
 * Query type classifications
 */
export type QueryType =
  | 'simple'        // Single keyword/phrase
  | 'compound'      // Multiple keywords with operators
  | 'question'      // Question format (what, how, why, when, where)
  | 'comparative'   // Comparison (vs, compared to, better than)
  | 'definitional'  // Definition (what is, what are, meaning of)
  | 'causal'        // Cause/effect (why, because, causes)
  | 'procedural'    // How-to (how to, steps, tutorial)
  | 'factual'       // Who, when, where questions
  | 'unsupported';  // Unable to classify

/**
 * Query optimization result
 */
export interface OptimizedQuery {
  /** Optimized query string for search */
  searchQuery: string;
  /** Filters extracted from query */
  filters: SearchFilters;
  /** Parsed query components */
  parsed: ParsedQuery;
  /** Alternative queries to try */
  alternatives: string[];
  /** Optimization notes */
  notes: string[];
}

/**
 * Configuration for query parser
 */
export interface QueryParserConfig {
  /** Minimum keyword length */
  minKeywordLength?: number;
  /** Maximum keywords to extract */
  maxKeywords?: number;
  /** Enable entity extraction */
  enableEntityExtraction?: boolean;
  /** Enable filter suggestion */
  enableFilterSuggestion?: boolean;
  /** Custom stop words */
  stopWords?: string[];
}

/**
 * Query weight configuration for boosting
 */
export interface QueryWeightConfig {
  /** Weight for exact phrase matches (default: 2.0) */
  phraseWeight?: number;
  /** Weight for keyword matches (default: 1.0) */
  keywordWeight?: number;
  /** Weight for entity matches (default: 1.5) */
  entityWeight?: number;
  /** Weight for negated terms (default: -1.0) */
  negationWeight?: number;
}
