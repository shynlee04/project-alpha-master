/**
 * @fileoverview RAG-Aware Linkage Analyzer
 * @module lib/canvas/rag-linkage-analyzer
 * @governance EPIC-7-1, UC2
 *
 * Extends LinkageAnalyzer to use RAG embeddings for semantic similarity.
 * Implements hybrid scoring: semantic (embeddings) + concept + keyword overlap.
 * Fallback to heuristic if embeddings unavailable.
 */

import { LinkageAnalyzer } from './linkage-analyzer';
import type {
  LinkageAnalyzerOptions,
  NodeAnalysis,
  SimilarityScore,
  LinkageAnalysis,
} from './linkage-types';
import type { Node } from '@xyflow/react';

/**
 * RAG-aware analyzer options
 */
export interface RAGLinkageAnalyzerOptions extends LinkageAnalyzerOptions {
  /** Project ID for RAG index lookup */
  projectId: string;
  /** Whether to use embeddings for similarity (default: true) */
  useEmbeddings?: boolean;
  /** Semantic similarity weight (default: 0.5) */
  semanticWeight?: number;
  /** Concept overlap weight (default: 0.3) */
  conceptWeight?: number;
  /** Keyword overlap weight (default: 0.2) */
  keywordWeight?: number;
}

/**
 * Enhanced similarity score with weight breakdown
 */
export interface HybridSimilarityScore extends SimilarityScore {
  /** Weight breakdown for transparency */
  weights: {
    semantic: number;
    concept: number;
    keyword: number;
  };
  /** Semantic similarity from embeddings */
  semanticSimilarity?: number;
}

/**
 * RAG-aware Linkage Analyzer
 *
 * Extends LinkageAnalyzer to leverage RAG embeddings for semantic similarity.
 * Falls back to heuristic scoring if embeddings unavailable.
 */
export class RAGLinkageAnalyzer extends LinkageAnalyzer {
  private ragOptions: Required<RAGLinkageAnalyzerOptions>;
  private embeddingCache = new Map<string, number[]>();

  constructor(options: RAGLinkageAnalyzerOptions) {
    // Pass base options to parent constructor
    super(options as LinkageAnalyzerOptions);

    // Initialize RAG-specific options with defaults
    // Spread base options first, then apply RAG-specific defaults
    this.ragOptions = {
      ...options,
      useEmbeddings: options.useEmbeddings ?? true,
      semanticWeight: options.semanticWeight ?? 0.5,
      conceptWeight: options.conceptWeight ?? 0.3,
      keywordWeight: options.keywordWeight ?? 0.2,
    } as Required<RAGLinkageAnalyzerOptions>;
  }

  /**
   * Analyze nodes with RAG-aware similarity calculation
   *
   * @param nodes - Canvas nodes to analyze
   * @returns Linkage analysis with proposals
   */
  async analyze(nodes: Node[]): Promise<LinkageAnalysis> {
    // Fetch embeddings if enabled
    let embeddings: Map<string, number[]> = new Map();

    if (this.ragOptions.useEmbeddings) {
      try {
        embeddings = await this.fetchNodeEmbeddings(nodes);
        console.log(`[RAGLinkageAnalyzer] Fetched ${embeddings.size} embeddings for ${nodes.length} nodes`);
      } catch (error) {
        console.warn('[RAGLinkageAnalyzer] Failed to fetch embeddings, falling back to heuristic:', error);
        embeddings = new Map();
      }
    }

    // Store embeddings for use in similarity calculation
    this.embeddingCache = embeddings;

    // Call parent analyze method (will use overridden calculateSimilarity)
    return super.analyze(nodes);
  }

  /**
   * Fetch embeddings from RAG Orama index for source nodes
   *
   * TODO: SearchResult does not include embedding property.
   * This feature requires Orama index schema enhancement to return embeddings.
   * For now, embeddings are not available and the analyzer falls back to heuristic scoring.
   *
   * @param nodes - Nodes to fetch embeddings for
   * @returns Map of node ID to embedding vector (always empty until schema is updated)
   */
  private async fetchNodeEmbeddings(nodes: Node[]): Promise<Map<string, number[]>> {
    const embeddings = new Map<string, number[]>();

    // Only source nodes have embeddings in RAG index
    const sourceNodes = nodes.filter((node) => node.type === 'source');

    if (sourceNodes.length === 0) {
      return embeddings;
    }

    // NOTE: Embeddings are not currently available in SearchResult
    // This is an acknowledged architectural limitation
    // The analyzer will fall back to heuristic scoring (concept + keyword overlap)

    console.warn(
      '[RAGLinkageAnalyzer] Embeddings not available in SearchResult schema. ' +
      'Falling back to heuristic scoring. To enable semantic similarity, ' +
      'update Orama index to return embeddings in search results.'
    );

    return embeddings;
  }

  /**
   * Calculate cosine similarity between two embedding vectors
   *
   * @param embedding1 - First embedding vector
   * @param embedding2 - Second embedding vector
   * @returns Similarity score (0-1)
   */
  private calculateCosineSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      console.warn('[RAGLinkageAnalyzer] Embedding dimensions mismatch, using zero similarity');
      return 0;
    }

    // Dot product
    const dotProduct = embedding1.reduce((sum, a, i) => sum + a * embedding2[i], 0);

    // Magnitudes
    const magnitude1 = Math.sqrt(embedding1.reduce((sum, a) => sum + a * a, 0));
    const magnitude2 = Math.sqrt(embedding2.reduce((sum, a) => sum + a * a, 0));

    // Cosine similarity
    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Calculate hybrid similarity combining semantic, concept, and keyword overlap
   *
   * This method overrides the parent class calculateSimilarity to add RAG-aware scoring.
   * Note: Embeddings are not currently available in SearchResult schema, so semantic
   * similarity is disabled until the Orama index is updated.
   *
   * @param analysis1 - First node analysis
   * @param analysis2 - Second node analysis
   * @returns Hybrid similarity score with weight breakdown
   */
  protected calculateSimilarity(
    analysis1: NodeAnalysis,
    analysis2: NodeAnalysis
  ): SimilarityScore {
    let similarity = 0;
    let semanticSimilarity: number | undefined = undefined;
    const weights = { semantic: 0, concept: 0, keyword: 0 };

    // Get embeddings if available (currently always empty due to schema limitation)
    const embedding1 = this.embeddingCache.get(analysis1.nodeId);
    const embedding2 = this.embeddingCache.get(analysis2.nodeId);

    // Semantic similarity (embeddings) - highest weight
    // NOTE: This code path is currently unreachable due to schema limitation
    if (embedding1 && embedding2 && this.ragOptions.useEmbeddings) {
      weights.semantic = this.ragOptions.semanticWeight;
      semanticSimilarity = this.calculateCosineSimilarity(embedding1, embedding2);
      similarity += semanticSimilarity * weights.semantic;
      console.log(
        `[RAGLinkageAnalyzer] Semantic similarity: ${semanticSimilarity.toFixed(3)} (${analysis1.nodeId} ↔ ${analysis2.nodeId})`
      );
    }

    // Concept overlap (from synthesis frontmatter) - medium weight
    const sharedConcepts = analysis1.concepts.filter((c) => analysis2.concepts.includes(c));

    if (analysis1.concepts.length > 0 && analysis2.concepts.length > 0) {
      weights.concept = this.ragOptions.conceptWeight;
      const conceptOverlap =
        (sharedConcepts.length * 2) / (analysis1.concepts.length + analysis2.concepts.length);
      similarity += conceptOverlap * weights.concept;
    }

    // Keyword overlap (from title) - low weight
    const sharedKeywords = analysis1.keywords.filter((k) => analysis2.keywords.includes(k));

    if (analysis1.keywords.length > 0 && analysis2.keywords.length > 0) {
      weights.keyword = this.ragOptions.keywordWeight;
      const keywordOverlap =
        (sharedKeywords.length * 2) / (analysis1.keywords.length + analysis2.keywords.length);
      similarity += keywordOverlap * weights.keyword;
    }

    // Subject match bonus (small boost)
    if (analysis1.subject && analysis1.subject === analysis2.subject) {
      similarity += 0.1;
    }

    const hybridScore: HybridSimilarityScore = {
      node1Id: analysis1.nodeId,
      node2Id: analysis2.nodeId,
      similarity: Math.min(similarity, 1),
      sharedConcepts: [...sharedConcepts, ...sharedKeywords],
      weights,
      semanticSimilarity,
    };

    console.log(
      `[RAGLinkageAnalyzer] Hybrid similarity: ${hybridScore.similarity.toFixed(3)} ` +
        `(semantic: ${weights.semantic}, concept: ${weights.concept}, keyword: ${weights.keyword})`
    );

    return hybridScore;
  }

  /**
   * Clear embedding cache (call when switching projects)
   */
  clearCache(): void {
    this.embeddingCache.clear();
    console.log('[RAGLinkageAnalyzer] Embedding cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; nodeIds: string[] } {
    return {
      size: this.embeddingCache.size,
      nodeIds: Array.from(this.embeddingCache.keys()),
    };
  }
}

/**
 * Create a RAG-aware linkage analyzer instance
 *
 * @param options - Analyzer options (projectId required)
 * @returns RAGLinkageAnalyzer instance
 */
export function createRAGLinkageAnalyzer(
  options: RAGLinkageAnalyzerOptions
): RAGLinkageAnalyzer {
  return new RAGLinkageAnalyzer(options);
}

/**
 * Default singleton instance (lazy initialization)
 */
let defaultAnalyzer: RAGLinkageAnalyzer | null = null;

export function getRAGLinkageAnalyzer(projectId: string): RAGLinkageAnalyzer {
  if (!defaultAnalyzer || defaultAnalyzer['ragOptions'].projectId !== projectId) {
    defaultAnalyzer = new RAGLinkageAnalyzer({ projectId });
  }
  return defaultAnalyzer;
}
