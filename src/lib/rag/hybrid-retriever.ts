/**
 * @fileoverview Hybrid Retrieval Service (BM25 + Vector + RRF)
 * @module lib/rag/hybrid-retriever
 * @governance EPIC-7-4
 *
 * Hybrid retrieval service combining BM25 keyword search and vector semantic search
 * using Reciprocal Rank Fusion (RRF) for result fusion.
 */

import { search } from '@orama/orama';
import type { Orama } from '@orama/orama';
import type { EmbeddingService } from './embedding-service';
import type {
  DocumentSchema,
  ExtendedSearchResult,
  RetrievalOptions,
  SearchMode,
  SearchResult,
} from './types';
import { getRRFFusion } from './rrf-fusion';
import { highlightText, extractMatchedTerms } from './search-highlighter';

/**
 * Hybrid retriever configuration
 */
interface HybridRetrieverConfig {
  /** Orama index instance */
  index: Orama;

  /** Embedding service for vector search */
  embeddingService: EmbeddingService;

  /** Default search mode */
  defaultMode?: SearchMode;

  /** Default retrieval options */
  defaultOptions?: Partial<RetrievalOptions>;
}

/**
 * Hybrid retriever service
 *
 * Combines BM25 keyword search and vector semantic search
 * using Reciprocal Rank Fusion (RRF) for optimal result fusion.
 */
export class HybridRetriever {
  private index: Orama;
  private embeddingService: EmbeddingService;
  private defaultMode: SearchMode;
  private defaultOptions: Partial<RetrievalOptions>;

  constructor(config: HybridRetrieverConfig) {
    this.index = config.index;
    this.embeddingService = config.embeddingService;
    this.defaultMode = config.defaultMode ?? 'hybrid';
    this.defaultOptions = config.defaultOptions ?? {};
  }

  /**
   * Perform hybrid search
   *
   * @param query - Search query text
   * @param options - Retrieval options
   * @returns Extended search results with highlighting
   */
  async search(
    query: string,
    options?: RetrievalOptions
  ): Promise<ExtendedSearchResult[]> {
    const opts = { ...this.defaultOptions, ...options };
    const mode = opts.mode ?? this.defaultMode;

    // Tokenize query for highlighting
    const queryTerms = this.tokenizeQuery(query);

    switch (mode) {
      case 'keyword':
        return await this.keywordSearch(query, queryTerms, opts);
      case 'semantic':
        return await this.semanticSearch(query, queryTerms, opts);
      case 'hybrid':
      default:
        return await this.hybridSearch(query, queryTerms, opts);
    }
  }

  /**
   * BM25 keyword-only search
   */
  private async keywordSearch(
    query: string,
    queryTerms: string[],
    options: RetrievalOptions
  ): Promise<ExtendedSearchResult[]> {
    const results = search(this.index, {
      term: query,
      limit: options.limit ?? 10,
      properties: options.properties ?? ['content', 'title'],
      relevance: options.bm25,
      mode: 'fulltext',
    });

    return this.transformResults(results, queryTerms, 'bm25');
  }

  /**
   * Vector semantic-only search
   */
  private async semanticSearch(
    query: string,
    queryTerms: string[],
    options: RetrievalOptions
  ): Promise<ExtendedSearchResult[]> {
    // Generate query embedding
    const embeddingResult = await this.embeddingService.embed(query);
    const embedding = Float32Array.from(embeddingResult.embedding);

    const results = search(this.index, {
      mode: 'vector',
      vector: {
        value: Array.from(embedding),
        property: 'embedding',
      },
      similarity: options.similarity ?? 0.8,
      limit: options.limit ?? 10,
    });

    return this.transformResults(results, queryTerms, 'vector');
  }

  /**
   * Hybrid search with RRF fusion
   */
  private async hybridSearch(
    query: string,
    queryTerms: string[],
    options: RetrievalOptions
  ): Promise<ExtendedSearchResult[]> {
    // Run keyword and vector searches in parallel
    const [keywordResults, vectorResults] = await Promise.all([
      this.keywordSearchRaw(query, options),
      this.semanticSearchRaw(query, options),
    ]);

    // Fuse results using RRF
    const rrf = getRRFFusion(options.rrf);
    const fused = rrf.fuse(keywordResults, vectorResults);

    // Add highlighting
    return fused.map((result) => ({
      ...result,
      matchedTerms: extractMatchedTerms(result.document.content, queryTerms),
      highlightedText: highlightText(
        this.extractPreview(result.document.content, queryTerms),
        queryTerms
      ),
    }));
  }

  /**
   * Raw keyword search (returns SearchResult[])
   */
  private keywordSearchRaw(
    query: string,
    options: RetrievalOptions
  ): SearchResult[] {
    return search(this.index, {
      term: query,
      limit: options.limit ?? 10,
      properties: options.properties ?? ['content', 'title'],
      relevance: options.bm25,
      mode: 'fulltext',
    });
  }

  /**
   * Raw semantic search (returns SearchResult[])
   */
  private async semanticSearchRaw(
    query: string,
    options: RetrievalOptions
  ): Promise<SearchResult[]> {
    const embeddingResult = await this.embeddingService.embed(query);
    const embedding = Float32Array.from(embeddingResult.embedding);

    return search(this.index, {
      mode: 'vector',
      vector: {
        value: Array.from(embedding),
        property: 'embedding',
      },
      similarity: options.similarity ?? 0.8,
      limit: options.limit ?? 10,
    });
  }

  /**
   * Transform Orama results to ExtendedSearchResult
   */
  private transformResults(
    results: SearchResult[],
    queryTerms: string[],
    searchSource: 'bm25' | 'vector'
  ): ExtendedSearchResult[] {
    return results.hits.map((hit: any, index: number) => ({
      document: hit.document as DocumentSchema,
      score: hit.score,
      source: {
        id: hit.document.id,
        title: (hit.document as DocumentSchema).title,
      },
      matchedTerms: extractMatchedTerms((hit.document as DocumentSchema).content, queryTerms),
      rank: index,
      searchSource,
      highlightedText: highlightText(
        this.extractPreview((hit.document as DocumentSchema).content, queryTerms),
        queryTerms
      ),
    }));
  }

  /**
   * Extract text preview around matches
   */
  private extractPreview(text: string, queryTerms: string[], maxLength = 200): string {
    if (text.length <= maxLength) {
      return text;
    }

    // Find first occurrence of any query term
    const lowerText = text.toLowerCase();
    let firstMatch = -1;

    for (const term of queryTerms) {
      const index = lowerText.indexOf(term.toLowerCase());
      if (index !== -1 && (firstMatch === -1 || index < firstMatch)) {
        firstMatch = index;
      }
    }

    if (firstMatch === -1) {
      return text.substring(0, maxLength) + '...';
    }

    // Extract around match
    const start = Math.max(0, firstMatch - 50);
    const end = Math.min(text.length, firstMatch + maxLength - 50);

    let preview = text.substring(start, end);
    if (start > 0) preview = '...' + preview;
    if (end < text.length) preview = preview + '...';

    return preview;
  }

  /**
   * Tokenize query for highlighting and matching
   */
  private tokenizeQuery(query: string): string[] {
    // Simple word-based tokenization
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 2) // Skip very short terms
      .filter((term, i, arr) => arr.indexOf(term) === i); // Deduplicate
  }
}
