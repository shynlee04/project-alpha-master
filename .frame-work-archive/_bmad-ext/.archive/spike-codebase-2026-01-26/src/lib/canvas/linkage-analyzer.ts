/**
 * @fileoverview Linkage Analyzer Service
 * @module lib/canvas/linkage-analyzer
 * @governance EPIC-38, STORY-38-4
 *
 * AI-powered linkage discovery for knowledge canvas nodes.
 * Analyzes relationships between sources and concepts to generate
 * intelligent connection recommendations.
 */

import type { Node } from '@xyflow/react';
import {
  LinkageType,
  LinkageProposal,
  NodeAnalysis,
  LinkageAnalysis,
  LinkageAnalyzerOptions,
  SimilarityScore,
  BatchAnalysisResult,
} from './linkage-types';
import type { SourceNodeData, ConceptNodeData } from './types';

/**
 * Default options for linkage analysis
 */
const DEFAULT_OPTIONS: Required<LinkageAnalyzerOptions> = {
  minConfidence: 0.5,
  maxProposals: 10,
  useAI: true,
  providerId: 'openrouter',
  modelId: 'mistralai/devstral-2512:free',
};

/**
 * LinkageAnalyzer Service
 *
 * Analyzes canvas nodes to discover and propose connections
 * based on conceptual, sequential, and contrastive relationships.
 */
export class LinkageAnalyzer {
  private options: Required<LinkageAnalyzerOptions>;

  constructor(options: LinkageAnalyzerOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Analyze all nodes and generate linkage proposals
   *
   * @param nodes - Canvas nodes to analyze
   * @returns Linkage analysis with proposals
   */
  async analyze(nodes: Node[]): Promise<LinkageAnalysis> {
    const startTime = Date.now();

    // Filter to only source and concept nodes
    const validNodes = nodes.filter(
      (node) => node.type === 'source' || node.type === 'concept'
    );

    // Calculate total possible pairs for all node combinations
    const totalPossiblePairs = (validNodes.length * (validNodes.length - 1)) / 2;

    // Analyze each node
    const _nodeAnalyses = new Map<string, NodeAnalysis>();
    for (const node of validNodes) {
      const analysis = await this.analyzeNode(node);
      _nodeAnalyses.set(node.id, analysis);
    }

    // Generate proposals
    const proposals = await this.generateProposals(validNodes, _nodeAnalyses);

    const duration = Date.now() - startTime;

    return {
      proposals,
      analyzedNodePairs: proposals.length,
      totalPossiblePairs,
      analysisDuration: duration,
    };
  }

  /**
   * Analyze a single node to extract metadata
   *
   * @param node - Node to analyze
   * @returns Node analysis result
   */
  private async analyzeNode(node: Node): Promise<NodeAnalysis> {
    const data = node.data as unknown as SourceNodeData | ConceptNodeData;

    if (node.type === 'source') {
      return this.analyzeSourceNode(node.id, data as SourceNodeData);
    } else {
      return this.analyzeConceptNode(node.id, data as ConceptNodeData);
    }
  }

  /**
   * Analyze a source node
   *
   * @param nodeId - Node ID
   * @param data - Source node data
   * @returns Node analysis
   */
  private async analyzeSourceNode(
    nodeId: string,
    data: SourceNodeData
  ): Promise<NodeAnalysis> {
    // Import knowledge store to get source details
    const { useKnowledgeStore } = await import('@/infrastructure/persistence/stores/knowledge');
    const store = useKnowledgeStore.getState();
    const source = store.sources.find((s) => s.id === data.sourceId);

    if (!source) {
      return {
        nodeId,
        concepts: [],
        keywords: [],
      };
    }

    // Extract concepts from source metadata if available
    const concepts = source.keyConcepts || [];

    // Extract keywords from title
    const keywords = this.extractKeywords(source.title);

    // Subject and document type not available in SourceRecord
    const subject = undefined;
    const documentType = undefined;

    return {
      nodeId,
      concepts,
      keywords,
      subject,
      documentType,
    };
  }

  /**
   * Analyze a concept node
   *
   * @param nodeId - Node ID
   * @param data - Concept node data
   * @returns Node analysis
   */
  private async analyzeConceptNode(
    nodeId: string,
    data: ConceptNodeData
  ): Promise<NodeAnalysis> {
    // Extract concepts from title and description
    const concepts = this.extractConceptsFromText(data.title);
    if (data.description) {
      concepts.push(...this.extractConceptsFromText(data.description));
    }

    // Extract keywords
    const keywords = this.extractKeywords(data.title);

    return {
      nodeId,
      concepts: [...new Set(concepts)], // Dedupe
      keywords: [...new Set(keywords)], // Dedupe
    };
  }

  /**
   * Extract keywords from text
   *
   * @param text - Text to extract from
   * @returns Array of keywords
   */
  private extractKeywords(text: string): string[] {
    if (!text) return [];

    // Simple keyword extraction: lowercase, remove punctuation, split on spaces
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 3); // Only words longer than 3 chars

    return [...new Set(words)];
  }

  /**
   * Extract concepts from text (NLP-style)
   *
   * @param text - Text to extract from
   * @returns Array of concept phrases
   */
  private extractConceptsFromText(text: string): string[] {
    if (!text) return [];

    // For now, use simple phrase extraction (noun phrases, etc.)
    // In a full implementation, this would use NLP libraries
    const phrases: string[] = [];

    // Extract quoted text as concepts
    const quotedRegex = /"([^"]+)"/g;
    let match;
    while ((match = quotedRegex.exec(text)) !== null) {
      phrases.push(match[1]);
    }

    // Extract capitalized phrases as potential concepts
    const capitalizedRegex = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g;
    while ((match = capitalizedRegex.exec(text)) !== null) {
      phrases.push(match[1]);
    }

    return [...new Set(phrases)];
  }

  /**
   * Calculate similarity between two node analyses
   *
   * @param analysis1 - First node analysis
   * @param analysis2 - Second node analysis
   * @returns Similarity score and shared concepts
   */
  protected calculateSimilarity(
    analysis1: NodeAnalysis,
    analysis2: NodeAnalysis
  ): SimilarityScore {
    // Find shared concepts
    const sharedConcepts = analysis1.concepts.filter((c) =>
      analysis2.concepts.includes(c)
    );

    // Find shared keywords
    const sharedKeywords = analysis1.keywords.filter((k) =>
      analysis2.keywords.includes(k)
    );

    // Calculate similarity score
    let similarity = 0;

    // Concept overlap (weighted more heavily)
    if (analysis1.concepts.length > 0 && analysis2.concepts.length > 0) {
      const conceptOverlap =
        (sharedConcepts.length * 2) /
        (analysis1.concepts.length + analysis2.concepts.length);
      similarity += conceptOverlap * 0.7;
    }

    // Keyword overlap
    if (analysis1.keywords.length > 0 && analysis2.keywords.length > 0) {
      const keywordOverlap =
        (sharedKeywords.length * 2) /
        (analysis1.keywords.length + analysis2.keywords.length);
      similarity += keywordOverlap * 0.3;
    }

    // Subject match bonus
    if (analysis1.subject && analysis1.subject === analysis2.subject) {
      similarity += 0.2;
    }

    return {
      node1Id: analysis1.nodeId,
      node2Id: analysis2.nodeId,
      similarity: Math.min(similarity, 1),
      sharedConcepts: [...sharedConcepts, ...sharedKeywords],
    };
  }

  /**
   * Generate linkage proposals from node analyses
   *
   * @param nodes - Nodes to propose connections for
   * @param nodeAnalyses - Node analyses
   * @returns Array of linkage proposals
   */
  private async generateProposals(
    nodes: Node[],
    nodeAnalyses: Map<string, NodeAnalysis>
  ): Promise<LinkageProposal[]> {
    const proposals: LinkageProposal[] = [];
    const similarities: SimilarityScore[] = [];

    // Calculate similarities for all node pairs
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];

        const analysis1 = nodeAnalyses.get(node1.id);
        const analysis2 = nodeAnalyses.get(node2.id);

        if (!analysis1 || !analysis2) continue;

        const similarity = this.calculateSimilarity(analysis1, analysis2);
        similarities.push(similarity);

        // Generate proposal if similarity exceeds threshold
        if (similarity.similarity >= this.options.minConfidence) {
          proposals.push(
            this.createProposalFromSimilarity(node1.id, node2.id, similarity)
          );
        }
      }
    }

    // If AI is enabled, enhance proposals with AI analysis
    if (this.options.useAI && proposals.length > 0) {
      const aiEnhancedProposals = await this.enhanceWithAI(proposals, nodeAnalyses);
      return aiEnhancedProposals;
    }

    // Sort by confidence and limit
    return proposals
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, this.options.maxProposals);
  }

  /**
   * Create a linkage proposal from similarity score
   *
   * @param node1Id - First node ID
   * @param node2Id - Second node ID
   * @param similarity - Similarity score
   * @returns Linkage proposal
   */
  private createProposalFromSimilarity(
    node1Id: string,
    node2Id: string,
    similarity: SimilarityScore
  ): LinkageProposal {
    // Determine linkage type based on similarity characteristics
    let linkageType = LinkageType.CONCEPTUAL;
    let suggestedRelationship: 'relates' | 'supports' | 'contradicts' | 'extends' = 'relates';

    if (similarity.similarity > 0.7) {
      linkageType = LinkageType.CONCEPTUAL;
      suggestedRelationship = 'relates';
    } else if (similarity.similarity > 0.5) {
      linkageType = LinkageType.SEQUENTIAL;
      suggestedRelationship = 'supports';
    } else {
      linkageType = LinkageType.CONTRASTIVE;
      suggestedRelationship = 'extends';
    }

    return {
      id: `proposal-${node1Id}-${node2Id}`,
      sourceNodeId: node1Id,
      targetNodeId: node2Id,
      linkageType,
      confidence: similarity.similarity,
      rationale: `These nodes share ${similarity.sharedConcepts.length} concepts/keywords: ${similarity.sharedConcepts.slice(0, 3).join(', ')}`,
      evidence: similarity.sharedConcepts,
      suggestedLabel: this.generateLabel(linkageType, similarity.sharedConcepts),
      suggestedRelationship,
      reviewed: false,
      createdAt: Date.now(),
    };
  }

  /**
   * Generate edge label from linkage type and concepts
   *
   * @param linkageType - Type of linkage
   * @param concepts - Shared concepts
   * @returns Generated label
   */
  private generateLabel(linkageType: LinkageType, concepts: string[]): string {
    const primaryConcepts = concepts.slice(0, 2);

    switch (linkageType) {
      case LinkageType.CONCEPTUAL:
        return primaryConcepts.length > 0
          ? `Related: ${primaryConcepts[0]}`
          : 'Related';
      case LinkageType.SEQUENTIAL:
        return primaryConcepts.length > 0
          ? `Builds on: ${primaryConcepts[0]}`
          : 'Builds on';
      case LinkageType.CONTRASTIVE:
        return primaryConcepts.length > 0
          ? `Contrasts: ${primaryConcepts[0]}`
          : 'Contrasts';
      default:
        return 'Related';
    }
  }

  /**
   * Enhance proposals with AI analysis
   *
   * @param proposals - Initial proposals
   * @param nodeAnalyses - Node analyses
   * @returns AI-enhanced proposals
   */
  private async enhanceWithAI(
    proposals: LinkageProposal[],
    _nodeAnalyses: Map<string, NodeAnalysis>
  ): Promise<LinkageProposal[]> {
    // TODO: Implement AI enhancement using TanStack AI
    // For now, return the heuristic proposals as-is
    // This would call the LLM with node pair information and get back:
    // - Refined confidence scores
    // - Detailed rationales
    // - Suggested edge labels
    // - Linkage type classification

    return proposals;
  }

  /**
   * Batch analyze multiple canvas states
   *
   * @param nodesList - Array of node arrays to analyze
   * @returns Batch analysis results
   */
  async batchAnalyze(nodesList: Node[][]): Promise<BatchAnalysisResult[]> {
    const results: BatchAnalysisResult[] = [];

    for (const nodes of nodesList) {
      const analysis = await this.analyze(nodes);

      // Get node analyses
      const nodeAnalyses = new Map<string, NodeAnalysis>();
      for (const node of nodes) {
        const nodeAnalysis = await this.analyzeNode(node);
        nodeAnalyses.set(node.id, nodeAnalysis);
      }

      // Calculate similarities
      const similarities: SimilarityScore[] = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const analysis1 = nodeAnalyses.get(nodes[i].id);
          const analysis2 = nodeAnalyses.get(nodes[j].id);
          if (analysis1 && analysis2) {
            similarities.push(this.calculateSimilarity(analysis1, analysis2));
          }
        }
      }

      results.push({
        proposals: analysis.proposals,
        nodeAnalyses,
        similarities,
      });
    }

    return results;
  }
}

/**
 * Create a linkage analyzer instance
 *
 * @param options - Analyzer options
 * @returns LinkageAnalyzer instance
 */
export function createLinkageAnalyzer(
  options?: LinkageAnalyzerOptions
): LinkageAnalyzer {
  return new LinkageAnalyzer(options);
}

/**
 * Default singleton instance
 */
export const linkageAnalyzer = new LinkageAnalyzer();
