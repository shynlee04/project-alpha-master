/**
 * @fileoverview Knowledge Graph Type Definitions
 * @module lib/knowledge/knowledge-graph-types
 * @governance EPIC-38, PHASE-6
 *
 * Type definitions for knowledge graph data structure.
 * Supports nodes (sources, concepts, clusters) and edges (relationships)
 * with traversal algorithms and cluster detection.
 *
 * @example
 * ```tsx
 * import type { GraphNode, GraphEdge, KnowledgeGraph } from '@/lib/knowledge/knowledge-graph-types';
 *
 * const node: GraphNode = {
 *   id: 'node-1',
 *   type: 'source',
 *   sourceId: 'source-abc',
 *   labels: ['calculus', 'derivatives'],
 *   embeddings: [0.1, 0.2, ...]
 * };
 *
 * const edge: GraphEdge = {
 *   id: 'edge-1',
 *   sourceId: 'node-1',
 *   targetId: 'node-2',
 *   type: 'conceptual',
 *   strength: 0.85,
 *   metadata: { similarity: 0.85 }
 * };
 * ```
 */

/**
 * Node types in the knowledge graph
 */
export type GraphNodeType = 'source' | 'concept' | 'cluster';

/**
 * Edge types representing different relationship kinds
 */
export type GraphEdgeType =
  | 'conceptual' // Shared concepts, themes
  | 'sequential' // Prerequisite/progression
  | 'contrastive' // Opposing views, alternatives
  | 'citation' // Direct citation/reference
  | 'temporal' // Time-based relationship
  | 'hierarchical'; // Parent-child (concept → cluster)

/**
 * Knowledge graph node
 *
 * Nodes can be sources (documents), concepts (extracted topics),
 * or clusters (groups of related nodes).
 */
export interface GraphNode {
  /** Unique node identifier */
  id: string;
  /** Node type */
  type: GraphNodeType;
  /** Source document ID (for source nodes) */
  sourceId?: string;
  /** Concept label (for concept nodes) */
  concept?: string;
  /** Cluster label (for cluster nodes) */
  clusterLabel?: string;
  /** Node labels for search and categorization */
  labels: string[];
  /** Embedding vector for similarity calculations */
  embedding?: number[];
  /** Node metadata */
  metadata?: {
    /** Subject classification */
    subject?: string;
    /** Creation timestamp */
    createdAt?: number;
    /** Last updated timestamp */
    updatedAt?: number;
    /** User interaction score */
    interactionScore?: number;
    /** Additional custom properties */
    [key: string]: any;
  };
}

/**
 * Knowledge graph edge
 *
 * Edges represent relationships between nodes with strength scores.
 */
export interface GraphEdge {
  /** Unique edge identifier */
  id: string;
  /** Source node ID */
  sourceId: string;
  /** Target node ID */
  targetId: string;
  /** Relationship type */
  type: GraphEdgeType;
  /** Relationship strength (0-1) */
  strength: number;
  /** Edge metadata */
  metadata?: {
    /** Similarity score */
    similarity?: number;
    /** Citation count */
    citationCount?: number;
    /** Temporal distance in days */
    temporalDistance?: number;
    /** User confirmation count */
    confirmedBy?: number;
    /** User dismissal count */
    dismissedBy?: number;
    /** Additional custom properties */
    [key: string]: any;
  };
  /** Creation timestamp */
  createdAt?: number;
}

/**
 * Graph cluster
 *
 * Represents a group of closely related nodes detected via
 * clustering algorithms (e.g., connected components).
 */
export interface GraphCluster {
  /** Cluster identifier */
  id: string;
  /** Cluster label */
  label: string;
  /** Member node IDs */
  members: string[];
  /** Cluster center node ID */
  centerNodeId?: string;
  /** Cluster cohesion score (0-1) */
  cohesion: number;
  /** Dominant subjects in cluster */
  subjects: string[];
  /** Cluster size (member count) */
  size: number;
}

/**
 * Graph traversal path
 *
 * Represents a path through the graph from source to target.
 */
export interface GraphPath {
  /** Path node IDs in order */
  nodes: string[];
  /** Path edge IDs in order */
  edges: string[];
  /** Total path weight (sum of edge strengths) */
  weight: number;
  /** Path length (number of edges) */
  length: number;
}

/**
 * Graph query result
 *
 * Result of graph traversal or search operations.
 */
export interface GraphQueryResult {
  /** Matching nodes */
  nodes: GraphNode[];
  /** Matching edges */
  edges: GraphEdge[];
  /** Query execution time (ms) */
  executionTime: number;
  /** Total results count */
  count: number;
}

/**
 * Graph statistics
 *
 * Aggregate statistics about the knowledge graph.
 */
export interface GraphStatistics {
  /** Total node count */
  nodeCount: number;
  /** Total edge count */
  edgeCount: number;
  /** Node count by type */
  nodesByType: Record<GraphNodeType, number>;
  /** Edge count by type */
  edgesByType: Record<GraphEdgeType, number>;
  /** Average node degree (connections per node) */
  avgDegree: number;
  /** Cluster count */
  clusterCount: number;
  /** Graph density (actual edges / possible edges) */
  density: number;
}

/**
 * Knowledge graph structure
 *
 * Complete graph representation with nodes, edges, and metadata.
 */
export interface KnowledgeGraph {
  /** All nodes in the graph */
  nodes: Map<string, GraphNode>;
  /** All edges in the graph */
  edges: Map<string, GraphEdge>;
  /** Adjacency list for fast traversal */
  adjacency: Map<string, Set<string>>;
  /** Reverse adjacency list for reverse traversal */
  reverseAdjacency: Map<string, Set<string>>;
  /** Graph statistics */
  statistics: GraphStatistics;
  /** Last updated timestamp */
  updatedAt: number;
}

/**
 * Graph persistence record
 *
 * Structure for persisting graph data in IndexedDB/Dexie.
 */
export interface GraphPersistenceRecord {
  /** Graph ID (typically project ID) */
  id: string;
  /** Serialized nodes */
  nodes: Array<{ id: string; data: GraphNode }>;
  /** Serialized edges */
  edges: Array<{ id: string; data: GraphEdge }>;
  /** Graph statistics */
  statistics: GraphStatistics;
  /** Last updated timestamp */
  updatedAt: number;
}

/**
 * Node creation options
 */
export interface NodeCreationOptions {
  /** Generate embedding automatically */
  generateEmbedding?: boolean;
  /** Extract labels automatically */
  extractLabels?: boolean;
  /** Classify subject automatically */
  classifySubject?: boolean;
}

/**
 * Edge creation options
 */
export interface EdgeCreationOptions {
  /** Calculate strength automatically */
  autoCalculateStrength?: boolean;
  /** Validate edge type compatibility */
  validateType?: boolean;
  /** Prevent duplicate edges */
  preventDuplicates?: boolean;
}

/**
 * Graph traversal options
 */
export interface TraversalOptions {
  /** Maximum traversal depth */
  maxDepth?: number;
  /** Filter by edge types */
  edgeTypes?: GraphEdgeType[];
  /** Filter by node types */
  nodeTypes?: GraphNodeType[];
  /** Minimum edge strength threshold */
  minStrength?: number;
  /** Follow bidirectional edges */
  bidirectional?: boolean;
}

/**
 * Cluster detection options
 */
export interface ClusterDetectionOptions {
  /** Minimum cluster size */
  minClusterSize?: number;
  /** Minimum edge strength for clustering */
  minEdgeStrength?: number;
  /** Clustering algorithm */
  algorithm?: 'connected-components' | 'label-propagation' | 'louvain';
}

/**
 * Graph query options
 */
export interface GraphQueryOptions {
  /** Limit result count */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
  /** Sort by field */
  sortBy?: 'createdAt' | 'strength' | 'interactionScore';
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
  /** Include related nodes */
  includeRelated?: boolean;
  /** Max depth for related nodes */
  relatedDepth?: number;
}
