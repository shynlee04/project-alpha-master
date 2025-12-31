/**
 * @fileoverview RAG Query Optimizer
 * @module lib/rag/query-optimizer
 * @governance EPIC-32-4
 *
 * Query parsing and optimization utilities for RAG queries.
 * Supports compound queries, keyword extraction, and query enhancement.
 */

import type { SearchFilters } from './types';
import type {
  ParsedQuery,
  QueryOperator,
  QueryType,
  OptimizedQuery,
  QueryParserConfig,
} from './query-optimizer-types';
import { DEFAULT_CONFIG } from './query-optimizer-config';

// Re-export types for convenience
export type {
  ParsedQuery,
  QueryOperator,
  QueryType,
  OptimizedQuery,
  QueryParserConfig,
} from './query-optimizer-types';

// Re-export helpers
export { createWeightedQuery } from './query-optimizer-helpers';

/**
 * Query parser and optimizer class
 */
export class QueryOptimizer {
  private config: Required<QueryParserConfig>;

  constructor(config: QueryParserConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Parse a query into its components
   *
   * @param query - Raw query string
   * @returns Parsed query object
   *
   * @example
   * ```typescript
   * const parser = new QueryOptimizer();
   * const parsed = parser.parseQuery("machine learning vs deep learning");
   * console.log(parsed.keywords); // ["machine", "learning", "deep"]
   * console.log(parsed.operators); // ["vs"]
   * ```
   */
  parseQuery(query: string): ParsedQuery {
    const original = query.trim();
    const normalized = this.normalizeQuery(original);

    // Extract keywords
    const keywords = this.extractKeywords(normalized);

    // Extract entities
    const entities = this.config.enableEntityExtraction
      ? this.extractEntities(original, keywords)
      : [];

    // Extract operators
    const operators = this.extractOperators(normalized);

    // Extract negations
    const negations = this.extractNegations(normalized);

    // Suggest filters
    const suggestedFilters = this.config.enableFilterSuggestion
      ? this.suggestFilters(original, keywords, entities)
      : {};

    // Classify query type
    const queryType = this.classifyQueryType(original);

    return {
      original,
      normalized,
      keywords,
      entities,
      operators,
      negations,
      suggestedFilters,
      queryType,
      confidence: this.calculateConfidence(keywords, entities, queryType),
    };
  }

  /**
   * Optimize a query for better search results
   *
   * @param query - Raw query string
   * @returns Optimized query result
   *
   * @example
   * ```typescript
   * const optimizer = new QueryOptimizer();
   * const result = optimizer.optimizeQuery("what is react hooks and how to use them");
   * console.log(result.searchQuery); // Optimized query
   * console.log(result.alternatives); // Alternative queries to try
   * ```
   */
  optimizeQuery(query: string): OptimizedQuery {
    const parsed = this.parseQuery(query);
    const notes: string[] = [];

    // Build search query
    let searchQuery = parsed.original;

    // Remove question words for simpler search
    if (parsed.queryType === 'question') {
      searchQuery = this.removeQuestionWords(searchQuery);
      notes.push("Removed question words for simpler search");
    }

    // Expand entities into keywords
    if (parsed.entities.length > 0) {
      const expanded = this.expandEntities(parsed.entities);
      if (expanded !== parsed.original) {
        searchQuery = expanded;
        notes.push("Expanded entities into keywords");
      }
    }

    // Generate alternatives
    const alternatives = this.generateAlternatives(parsed);

    return {
      searchQuery,
      filters: parsed.suggestedFilters,
      parsed,
      alternatives,
      notes,
    };
  }

  /**
   * Create a compound query from multiple terms
   *
   * @param terms - Array of search terms
   * @param operator - Operator to use between terms ('AND' or 'OR')
   * @returns Compound query string
   */
  createCompoundQuery(terms: string[], operator: 'AND' | 'OR' = 'AND'): string {
    if (terms.length === 0) return '';
    if (terms.length === 1) return terms[0];

    const separator = operator === 'AND' ? ' AND ' : ' OR ';
    return terms.map(t => this.quoteIfNeeded(t)).join(separator);
  }

  /**
   * Split a compound query into individual terms
   *
   * @param query - Compound query string
   * @returns Array of terms with operators
   */
  splitCompoundQuery(query: string): Array<{ term: string; operator: QueryOperator | null }> {
    const parts: Array<{ term: string; operator: QueryOperator | null }> = [];
    let currentTerm = '';
    let currentOperator: QueryOperator | null = null;

    const tokens = this.tokenize(query);

    for (const token of tokens) {
      if (token === 'AND' || token === 'OR') {
        if (currentTerm.trim()) {
          parts.push({ term: currentTerm.trim(), operator: currentOperator });
        }
        currentTerm = '';
        currentOperator = token as QueryOperator;
      } else if (token === 'NOT') {
        if (currentTerm.trim()) {
          parts.push({ term: currentTerm.trim(), operator: currentOperator });
        }
        currentTerm = '';
        currentOperator = 'NOT';
      } else {
        currentTerm += token + ' ';
      }
    }

    if (currentTerm.trim()) {
      parts.push({ term: currentTerm.trim(), operator: currentOperator });
    }

    return parts;
  }

  /**
   * Boost search relevance for specific terms
   *
   * @param query - Base query
   * @param boostTerms - Terms with boost values
   * @param defaultBoost - Default boost value
   * @returns Boosted query string
   */
  boostTerms(
    query: string,
    boostTerms: Array<{ term: string; boost: number }>,
    defaultBoost: number = 1
  ): string {
    let boostedQuery = query;

    for (const { term, boost } of boostTerms) {
      if (boost !== defaultBoost) {
        // Quote the term and add boost notation
        const escapedTerm = term.replace(/"/g, '\\"');
        boostedQuery = boostedQuery.replace(
          new RegExp(this.escapeRegex(escapedTerm), 'gi'),
          `"${escapedTerm}"^${boost}`
        );
      }
    }

    return boostedQuery;
  }

  /**
   * Get search suggestions for a partial query
   *
   * @param partial - Partial query string
   * @param knownTerms - Known terms to suggest from
   * @returns Array of suggestions
   */
  suggestTerms(partial: string, knownTerms: string[]): string[] {
    const normalized = partial.toLowerCase().trim();
    const suggestions: string[] = [];

    for (const term of knownTerms) {
      if (term.toLowerCase().includes(normalized) && !suggestions.includes(term)) {
        suggestions.push(term);
      }
    }

    return suggestions.slice(0, 5);
  }

  /**
   * Normalize query text
   */
  private normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-"']/g, '')
      .trim();
  }

  /**
   * Extract keywords from query
   */
  private extractKeywords(query: string): string[] {
    const words = query
      .split(/\s+/)
      .filter(word => word.length >= this.config.minKeywordLength)
      .filter(word => !this.config.stopWords.includes(word.toLowerCase()));

    // Remove duplicates while preserving order
    const seen = new Set<string>();
    return words.filter(word => {
      const lower = word.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    }).slice(0, this.config.maxKeywords);
  }

  /**
   * Extract multi-word entities
   */
  private extractEntities(query: string, keywords: string[]): string[] {
    const entities: string[] = [];
    const lowerQuery = query.toLowerCase();

    // Common entity patterns
    const patterns = [
      // Technology patterns
      /\b(\w+(?:\s+\w+)?(?:\s+\w+(?:\s+\w+)?)?(?:\s+(?:framework|language|library|api|database|pattern|architecture))\b)/gi,
      // Concept patterns
      /\b(\w+(?:\s+\w+)?(?:\s+\w+(?:\s+\w+)?)?(?:\s+(?:learning|processing|analysis|synthesis|generation|extraction))\b)/gi,
    ];

    for (const pattern of patterns) {
      const matches = lowerQuery.match(pattern);
      if (matches) {
        for (const match of matches) {
          if (!entities.includes(match)) {
            entities.push(match);
          }
        }
      }
    }

    return entities;
  }

  /**
   * Extract boolean operators
   */
  private extractOperators(query: string): QueryOperator[] {
    const operators: QueryOperator[] = [];

    if (/\bAND\b/.test(query)) operators.push('AND');
    if (/\bOR\b/.test(query)) operators.push('OR');
    if (/\bNOT\b/.test(query) || /\b-\w+/.test(query)) operators.push('NOT');

    return operators;
  }

  /**
   * Extract negation terms
   */
  private extractNegations(query: string): string[] {
    const negations: string[] = [];

    // Find terms after NOT or with minus sign
    const notMatch = query.match(/\bNOT\s+(\w+)/gi);
    if (notMatch) {
      for (const match of notMatch) {
        const term = match.replace(/\bNOT\s+/i, '').trim();
        if (term) negations.push(term);
      }
    }

    // Find terms with minus prefix
    const minusMatch = query.match(/-\s*(\w+)/g);
    if (minusMatch) {
      for (const match of minusMatch) {
        const term = match.replace(/-\s*/, '').trim();
        if (term && !negations.includes(term)) {
          negations.push(term);
        }
      }
    }

    return negations;
  }

  /**
   * Suggest filters based on query content
   */
  private suggestFilters(
    query: string,
    keywords: string[],
    entities: string[]
  ): SearchFilters {
    const filters: SearchFilters = {};

    // Language detection
    const langPatterns = {
      javascript: /\b(javascript|js|typescript|ts|node|nodejs)\b/i,
      python: /\b(python|pandas|numpy|django|flask)\b/i,
      rust: /\b(rust|cargo)\b/i,
      vietnamese: /\b(việt nam|tiếng việt|tài liệu)\b/i,
    };

    for (const [lang, pattern] of Object.entries(langPatterns)) {
      if (pattern.test(query)) {
        filters.language = lang;
        break;
      }
    }

    // Content type detection
    const typePatterns = {
      tutorial: /\b(tutorial|how to|learn|course|guide|step by step)\b/i,
      documentation: /\b(documentation|docs|reference|api|manual)\b/i,
      code: /\b(code|function|class|method|variable|import|export)\b/i,
    };

    const detectedTypes: string[] = [];
    for (const [type, pattern] of Object.entries(typePatterns)) {
      if (pattern.test(query)) {
        detectedTypes.push(type);
      }
    }

    if (detectedTypes.length > 0) {
      filters.contentType = detectedTypes;
    }

    return filters;
  }

  /**
   * Classify query type
   */
  private classifyQueryType(query: string): QueryType {
    const lowerQuery = query.toLowerCase();

    // Question patterns
    const questionPatterns = [
      { pattern: /\bwhat\s+is|what\s+are|what\s+does|what\s+does\s+\w+\s+mean\b/i, type: 'definitional' as const },
      { pattern: /\bhow\s+to|how\s+do|how\s+can|how\s+does\b/i, type: 'procedural' as const },
      { pattern: /\bwhy\s+|because\b/i, type: 'causal' as const },
      { pattern: /\bwho\s+|when\s+|where\s+\b/i, type: 'factual' as const },
      { pattern: /\bvs\.?\s*|versus\s+|compared\s+to|better\s+than|worse\s+than\b/i, type: 'comparative' as const },
    ];

    for (const { pattern, type } of questionPatterns) {
      if (pattern.test(lowerQuery)) {
        return type;
      }
    }

    // Check for compound queries
    if (/\b(AND|OR|NOT)\b/i.test(query) || /(\w+)\s+(\w+)\s+\w+\s+\w+/i.test(query)) {
      return 'compound';
    }

    // Check for simple queries
    if (query.split(/\s+/).length <= 3) {
      return 'simple';
    }

    return 'unsupported';
  }

  /**
   * Calculate confidence score for parsing
   */
  private calculateConfidence(
    keywords: string[],
    entities: string[],
    queryType: QueryType
  ): number {
    let score = 0.5; // Base score

    // More keywords = higher confidence
    if (keywords.length >= 2) score += 0.1;
    if (keywords.length >= 4) score += 0.1;

    // Entities found = higher confidence
    if (entities.length > 0) score += 0.15;

    // Question types have good structure
    if (queryType !== 'unsupported') score += 0.15;

    return Math.min(1, score);
  }

  /**
   * Remove question words from query
   */
  private removeQuestionWords(query: string): string {
    return query
      .replace(/\b(what|who|when|where|why|how|which|whose)\b/gi, '')
      .replace(/\b(is|are|was|were|do|does|did|can|could|should|would)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Expand entities into individual keywords
   */
  private expandEntities(entities: string[]): string {
    return entities.join(' ');
  }

  /**
   * Generate alternative queries
   */
  private generateAlternatives(parsed: ParsedQuery): string[] {
    const alternatives: string[] = [];

    // Create variations with different operators
    if (parsed.keywords.length >= 2) {
      alternatives.push(this.createCompoundQuery(parsed.keywords, 'AND'));
      alternatives.push(this.createCompoundQuery(parsed.keywords, 'OR'));
    }

    // Add entity-based alternatives
    if (parsed.entities.length > 0) {
      alternatives.push(this.createCompoundQuery([...parsed.keywords, ...parsed.entities], 'AND'));
    }

    // Add single keyword fallback
    if (parsed.keywords.length > 0) {
      alternatives.push(parsed.keywords[0]);
    }

    return [...new Set(alternatives)];
  }

  /**
   * Tokenize query into components
   */
  private tokenize(query: string): string[] {
    return query
      .split(/\s+/)
      .map(token => token.trim())
      .filter(token => token.length > 0);
  }

  /**
   * Quote term if it contains spaces
   */
  private quoteIfNeeded(term: string): string {
    return term.includes(' ') ? `"${term}"` : term;
  }

  /**
   * Escape regex special characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
