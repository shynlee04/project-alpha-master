/**
 * @file Hybrid Search Retriever
 * @module lib/rag/hybrid-retriever
 * @governance EPIC-32-2
 *
 * Implements weighted hybrid search combining vector similarity with full-text search
 * using configurable weights (default: vector 0.7, fulltext 0.3) per Story 32-2 AC1.
 *
 * Key Features:
 * - Configurable weighted scoring (vector: 0-1, fulltext: 0-1)
 * - Phrase matching boost for quoted phrases in queries
 * - Filter support (date range, source type, tags)
 * - Result merging with deduplication
 * - Performance target: <500ms for 10K documents
 */

import type { Orama, search as oramaSearch } from '@orama/orama';
import { loadIndex } from './orama-index';
import type { OramaSchema, DocumentSchema } from './types';

// ============================================================================
// Types
// ============================================================================

/** Hybrid search configuration */
export interface HybridSearchConfig {
  /** Weight for vector search (0-1), default 0.7 */
  weightVector: number;
  /** Weight for full-text search (0-1), default 0.3 */
  weightFulltext: number;
  /** Minimum score threshold (0-1), default 0.1 */
  minScore: number;
  /** Search filters */
  filters?: SearchFilters;
  /** Maximum results to return, default 10 */
  limit: number;
  /** Enable phrase matching boost, default true */
  enablePhraseBoost: boolean;
  /** Phrase boost multiplier, default 2.0 */
  phraseBoostMultiplier: number;
}

/** Search filter options */
export interface SearchFilters {
  /** Date range filter */
  dateRange?: {
    start: Date;
    end: Date;
  };
  /** Source type filter (e.g., 'pdf', 'markdown', 'url') */
  sourceType?: string[];
  /** Tags filter */
  tags?: string[];
  /** Source ID filter (exclude specific sources) */
  excludeSourceIds?: string[];
}

/** Individual search result */
export interface HybridSearchResult {
  /** Document ID */
  documentId: string;
  /** Document title */
  title: string;
  /** Combined weighted score (0-1) */
  combinedScore: number;
  /** Vector similarity score (0-1) */
  vectorScore: number;
  /** Full-text search score (0-1) */
  fulltextScore: number;
  /** Highlighted text snippets */
  highlights: string[];
  /** Source ID for attribution */
  sourceId: string;
  /** Document metadata */
  metadata: Record<string, unknown>;
}

/** Internal hit type for merging */
interface HitWithScore {
  id: string;
  document: DocumentSchema;
  score: number;
  type: 'vector' | 'fulltext';
  highlights: string[];
}

/** Default configuration */
const DEFAULT_CONFIG: HybridSearchConfig = {
  weightVector: 0.7,
  weightFulltext: 0.3,
  minScore: 0.1,
  limit: 10,
  enablePhraseBoost: true,
  phraseBoostMultiplier: 2.0,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract quoted phrases from query for boosting
 *
 * @param query - Search query
 * @returns Array of extracted phrases
 *
 * @example
 * ```typescript
 * const phrases = extractQuotedPhrases('search "machine learning" and AI');
 * // Returns: ['machine learning']
 * ```
 */
function extractQuotedPhrases(query: string): string[] {
  const regex = /"([^"]+)"/g;
  const phrases: string[] = [];
  let match;

  while ((match = regex.exec(query)) !== null) {
    phrases.push(match[1]);
  }

  return phrases;
}

/**
 * Check if text contains a phrase
 *
 * @param text - Text to search
 * @param phrase - Phrase to find
 * @returns true if phrase found
 */
function containsPhrase(text: string, phrase: string): boolean {
  const normalizedText = text.toLowerCase();
  const normalizedPhrase = phrase.toLowerCase();
  return normalizedText.includes(normalizedPhrase);
}

/**
 * Generate highlights for a document based on query terms
 *
 * @param content - Document content
 * @param query - Search query
 * @param maxHighlights - Maximum highlights to return
 * @returns Array of highlighted snippets
 */
function generateHighlights(content: string, query: string, maxHighlights = 3): string[] {
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);

  // Score sentences by term frequency
  const scored = sentences.map(sentence => {
    const lower = sentence.toLowerCase();
    const score = words.reduce((acc, word) => {
      return acc + (lower.includes(word) ? 1 : 0);
    }, 0);
    return { sentence: sentence.trim(), score };
  });

  // Sort by score and return top highlights
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxHighlights)
    .map(s => s.sentence);
}

/**
 * Apply filters to a document
 *
 * @param document - Document to check
 * @param filters - Filters to apply
 * @returns true if document passes all filters
 */
function passesFilters(document: DocumentSchema, filters?: SearchFilters): boolean {
  if (!filters) return true;

  // Date range filter
  if (filters.dateRange) {
    // Document would need a date field - check metadata
    const docDate = document.metadata?.indexedAt as Date | undefined;
    if (docDate) {
      if (docDate < filters.dateRange.start || docDate > filters.dateRange.end) {
        return false;
      }
    }
  }

  // Source type filter
  if (filters.sourceType && filters.sourceType.length > 0) {
    const sourceType = document.metadata?.sourceType as string | undefined;
    if (sourceType && !filters.sourceType.includes(sourceType)) {
      return false;
    }
  }

  // Tags filter
  if (filters.tags && filters.tags.length > 0) {
    const docTags = (document.metadata?.tags as string[] | undefined) || [];
    const hasMatchingTag = filters.tags.some(tag => docTags.includes(tag));
    if (!hasMatchingTag) {
      return false;
    }
  }

  // Exclude source IDs
  if (filters.excludeSourceIds && filters.excludeSourceIds.length > 0) {
    if (filters.excludeSourceIds.includes(document.sourceId)) {
      return false;
    }
  }

  return true;
}

// ============================================================================
// Main Hybrid Search Function
// ============================================================================

/**
 * Perform hybrid search combining vector similarity with full-text search
 *
 * @param projectId - Project ID to search in
 * @param query - Search query string
 * @param vectorEmbedding - Pre-computed query embedding for vector search
 * @param config - Hybrid search configuration
 * @returns Promise resolving to hybrid search results
 *
 * @example
 * ```typescript
 * const results = await hybridSearch('my-project', 'machine learning', [0.1, 0.2, ...]);
 * // Returns results with combined scores
 * ```
 */
export async function hybridSearch(
  projectId: string,
  query: string,
  vectorEmbedding: number[],
  config?: Partial<HybridSearchConfig>
): Promise<HybridSearchResult[]> {
  // Merge with default config
  const mergedConfig: HybridSearchConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  // Validate weights
  const totalWeight = mergedConfig.weightVector + mergedConfig.weightFulltext;
  if (totalWeight !== 1.0) {
    console.warn(
      `[HybridRetriever] Weights sum to ${totalWeight}, normalizing to 1.0`
    );
    mergedConfig.weightVector /= totalWeight;
    mergedConfig.weightFulltext /= totalWeight;
  }

  // Load Orama index
  const db = await loadIndex(projectId);
  if (!db) {
    console.warn(`[HybridRetriever] No index found for project "${projectId}"`);
    return [];
  }

  const startTime = performance.now();

  // Collect all hits with their scores
  const allHits: HitWithScore[] = [];

  // =========================================================================
  // Phase 1: Full-text search
  // =========================================================================
  try {
    const fulltextResults = await oramaSearch(db as Orama<OramaSchema>, {
      term: query,
      mode: 'fulltext',
      limit: mergedConfig.limit * 2, // Fetch extra for merging
    });

    for (const hit of fulltextResults.hits) {
      const document = hit.document as unknown as DocumentSchema;

      // Apply filters
      if (!passesFilters(document, mergedConfig.filters)) {
        continue;
      }

      // Calculate normalized full-text score (0-1)
      const maxScore = fulltextResults.hits.length > 0
        ? Math.max(...fulltextResults.hits.map(h => h.score))
        : 1;
      const normalizedScore = maxScore > 0 ? hit.score / maxScore : 0;

      // Apply phrase boost if enabled
      let boostMultiplier = 1;
      if (mergedConfig.enablePhraseBoost) {
        const phrases = extractQuotedPhrases(query);
        for (const phrase of phrases) {
          if (containsPhrase(document.content, phrase)) {
            boostMultiplier = mergedConfig.phraseBoostMultiplier;
            break;
          }
        }
      }

      allHits.push({
        id: hit.id,
        document,
        score: normalizedScore * boostMultiplier,
        type: 'fulltext',
        highlights: generateHighlights(document.content, query),
      });
    }
  } catch (error) {
    console.error('[HybridRetriever] Full-text search failed:', error);
  }

  // =========================================================================
  // Phase 2: Vector search (if embedding provided)
  // =========================================================================
  if (vectorEmbedding && vectorEmbedding.length > 0) {
    try {
      const vectorResults = await oramaSearch(db as Orama<OramaSchema>, {
        term: query,
        mode: 'vector',
        vector: {
          value: vectorEmbedding,
          property: 'embedding',
        },
        limit: mergedConfig.limit * 2,
        similarity: mergedConfig.minScore,
      });

      for (const hit of vectorResults.hits) {
        const document = hit.document as unknown as DocumentSchema;

        // Apply filters
        if (!passesFilters(document, mergedConfig.filters)) {
          continue;
        }

        // Vector scores are already normalized (0-1)
        const normalizedScore = typeof hit.score === 'number' ? hit.score : 0;

        allHits.push({
          id: hit.id,
          document,
          score: normalizedScore,
          type: 'vector',
          highlights: generateHighlights(document.content, query),
        });
      }
    } catch (error) {
      console.error('[HybridRetriever] Vector search failed:', error);
    }
  }

  // =========================================================================
  // Phase 3: Merge and deduplicate results
  // =========================================================================

  // Group hits by document ID
  const docMap = new Map<string, HitWithScore>();

  for (const hit of allHits) {
    const existing = docMap.get(hit.id);
    if (!existing) {
      docMap.set(hit.id, hit);
    } else {
      // Merge scores - take max for each type
      if (hit.type === 'vector' && existing.type === 'fulltext') {
        docMap.set(hit.id, {
          ...existing,
          vectorScore: hit.score,
        });
      } else if (hit.type === 'fulltext' && existing.type === 'vector') {
        docMap.set(hit.id, {
          ...existing,
          fulltextScore: hit.score,
        });
      }
    }
  }

  // =========================================================================
  // Phase 4: Calculate combined scores
  // =========================================================================

  const results: HybridSearchResult[] = [];

  for (const [id, hit] of docMap) {
    // Use actual scores if available, otherwise use combined
    const vectorScore = hit.type === 'vector' ? hit.score : (hit as any).vectorScore || 0;
    const fulltextScore = hit.type === 'fulltext' ? hit.score : (hit as any).fulltextScore || 0;

    // Calculate combined weighted score
    const combinedScore =
      vectorScore * mergedConfig.weightVector +
      fulltextScore * mergedConfig.weightFulltext;

    // Skip if below minimum score
    if (combinedScore < mergedConfig.minScore) {
      continue;
    }

    // Merge highlights
    const mergedHighlights = Array.from(
      new Set([...(hit.highlights || []), ...((hit as any).highlights || [])])
    ).slice(0, 5);

    results.push({
      documentId: hit.id,
      title: hit.document.title || 'Untitled',
      combinedScore,
      vectorScore,
      fulltextScore,
      highlights: mergedHighlights,
      sourceId: hit.document.sourceId,
      metadata: hit.document.metadata || {},
    });
  }

  // =========================================================================
  // Phase 5: Sort by combined score and limit results
  // =========================================================================

  const sortedResults = results
    .sort((a, b) => b.combinedScore - a.combinedScore)
    .slice(0, mergedConfig.limit);

  const endTime = performance.now();
  const duration = endTime - startTime;

  console.log(
    `[HybridRetriever] Search completed in ${duration.toFixed(2)}ms, ` +
    `found ${sortedResults.length} results for query: "${query.substring(0, 50)}..."`
  );

  return sortedResults;
}

/**
 * Perform hybrid search with automatic query embedding
 *
 * This is a convenience wrapper that generates embeddings automatically
 * using the embedding pipeline from the RAG store.
 *
 * @param projectId - Project ID to search in
 * @param query - Search query string
 * @param config - Hybrid search configuration
 * @returns Promise resolving to hybrid search results
 */
export async function hybridSearchWithEmbedding(
  projectId: string,
  query: string,
  config?: Partial<HybridSearchConfig>
): Promise<HybridSearchResult[]> {
  // Import embedding generator dynamically to avoid circular deps
  // and SSR issues
  let embeddingGenerator: ((text: string) => Promise<number[]>) | null = null;

  try {
    const embeddingModule = await import('./embedding-generator');
    embeddingGenerator = embeddingModule.generateEmbedding;
  } catch {
    console.error('[HybridRetriever] Could not load embedding generator');
    return [];
  }

  if (!embeddingGenerator) {
    console.error('[HybridRetriever] Embedding generator not available');
    return [];
  }

  // Generate embedding for query
  const embedding = await embeddingGenerator(query);

  // Perform hybrid search
  return hybridSearch(projectId, query, embedding, config);
}

// ============================================================================
// Export
// ============================================================================

export type {
  HybridSearchConfig,
  SearchFilters,
  HybridSearchResult,
};

export const DEFAULT_HYBRID_CONFIG = DEFAULT_CONFIG;
