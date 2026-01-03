/**
 * @fileoverview Linkage Analysis Types
 * @module lib/canvas/linkage-types
 * @governance EPIC-38, STORY-38-4
 *
 * Type definitions for AI-powered linkage discovery between canvas nodes.
 */

/**
 * Linkage type categories
 */
export enum LinkageType {
  /** Shared concepts, themes, vocabulary */
  CONCEPTUAL = 'conceptual',
  /** Prerequisite/progression relationships */
  SEQUENTIAL = 'sequential',
  /** Opposing views, alternatives, complements */
  CONTRASTIVE = 'contrastive',
}

/**
 * Linkage proposal with metadata
 */
export interface LinkageProposal {
  /** Unique proposal ID */
  id: string;
  /** Source node ID */
  sourceNodeId: string;
  /** Target node ID */
  targetNodeId: string;
  /** Type of linkage */
  linkageType: LinkageType;
  /** Confidence score (0-1) */
  confidence: number;
  /** Rationale for the connection */
  rationale: string;
  /** Supporting evidence */
  evidence: string[];
  /** Proposed edge label */
  suggestedLabel: string;
  /** Proposed relationship type */
  suggestedRelationship: 'relates' | 'supports' | 'contradicts' | 'extends';
  /** Whether proposal has been reviewed */
  reviewed: boolean;
  /** Timestamp when proposal was created */
  createdAt: number;
}

/**
 * Node analysis result
 */
export interface NodeAnalysis {
  nodeId: string;
  /** Extracted concepts/topics */
  concepts: string[];
  /** Key terms */
  keywords: string[];
  /** Subject classification */
  subject?: string;
  /** Document type (if source node) */
  documentType?: string;
  /** Content embedding vector */
  embedding?: number[];
}

/**
 * Linkage analysis result
 */
export interface LinkageAnalysis {
  proposals: LinkageProposal[];
  analyzedNodePairs: number;
  totalPossiblePairs: number;
  analysisDuration: number;
}

/**
 * Linkage analyzer options
 */
export interface LinkageAnalyzerOptions {
  /** Minimum confidence threshold for proposals (default: 0.5) */
  minConfidence?: number;
  /** Maximum proposals to generate (default: 10) */
  maxProposals?: number;
  /** Whether to use AI for analysis (default: true) */
  useAI?: boolean;
  /** Provider for AI analysis (default: 'openrouter') */
  providerId?: string;
  /** Model for AI analysis (default: free model) */
  modelId?: string;
}

/**
 * Similarity score result
 */
export interface SimilarityScore {
  node1Id: string;
  node2Id: string;
  similarity: number;
  sharedConcepts: string[];
}

/**
 * Batch analysis result
 */
export interface BatchAnalysisResult {
  proposals: LinkageProposal[];
  nodeAnalyses: Map<string, NodeAnalysis>;
  similarities: SimilarityScore[];
}
