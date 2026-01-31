/**
 * @fileoverview Knowledge graph types and interfaces
 * @module lib/knowledge/graph
 */

export type GraphNodeId = string;
export type GraphEdgeId = string;
export type GraphClusterId = string;

/**
 * Core node representing a knowledge entity
 */
export interface GraphNode {
  id: GraphNodeId;
  type: string;
  label: string;
  properties: Record<string, unknown>;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    source?: string;
    confidence?: number;
  };
}

/**
 * Edge connecting two nodes with optional direction
 */
export interface GraphEdge {
  id: GraphEdgeId;
  source: GraphNodeId;
  target: GraphNodeId;
  type: string;
  weight?: number;
  properties?: Record<string, unknown>;
}

/**
 * Cluster of related nodes
 */
export interface GraphCluster {
  id: GraphClusterId;
  label: string;
  nodeIds: GraphNodeId[];
  metadata?: {
    density?: number;
    coherence?: number;
  };
}

/**
 * Path through the graph
 */
export interface GraphPath {
  nodes: GraphNode[];
  edges: GraphEdge[];
  totalWeight?: number;
}

/**
 * Query result container
 */
export interface GraphQueryResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters?: GraphCluster[];
  paths?: GraphPath[];
  metadata?: {
    queryTime: number;
    totalNodesFound: number;
  };
}

/**
 * Statistics about the graph
 */
export interface GraphStatistics {
  nodeCount: number;
  edgeCount: number;
  clusterCount: number;
  density: number;
  averageDegree: number;
}

/**
 * Knowledge graph interface
 */
export interface KnowledgeGraph {
  id: string;
  name: string;
  nodes: Map<GraphNodeId, GraphNode>;
  edges: Map<GraphEdgeId, GraphEdge>;
  clusters: Map<GraphClusterId, GraphCluster>;

  // CRUD operations
  addNode(node: Omit<GraphNode, 'id'>): GraphNode;
  getNode(id: GraphNodeId): GraphNode | undefined;
  updateNode(id: GraphNodeId, updates: Partial<GraphNode>): void;
  deleteNode(id: GraphNodeId): void;

  addEdge(edge: Omit<GraphEdge, 'id'>): GraphEdge;
  getEdge(id: GraphEdgeId): GraphEdge | undefined;
  updateEdge(id: GraphEdgeId, updates: Partial<GraphEdge>): void;
  deleteEdge(id: GraphEdgeId): void;

  // Cluster operations
  detectClusters(options?: ClusterDetectionOptions): GraphCluster[];

  // Query operations
  query(options: GraphQueryOptions): GraphQueryResult;

  // Statistics
  getStatistics(): GraphStatistics;
}

/**
 * Options for creating a node
 */
export interface NodeCreationOptions {
  type: string;
  label: string;
  properties?: Record<string, unknown>;
  metadata?: Partial<GraphNode['metadata']>;
}

/**
 * Options for creating an edge
 */
export interface EdgeCreationOptions {
  source: GraphNodeId;
  target: GraphNodeId;
  type: string;
  weight?: number;
  properties?: Record<string, unknown>;
}

/**
 * Options for graph traversal
 */
export interface TraversalOptions {
  startNode: GraphNodeId;
  maxDepth?: number;
  edgeTypes?: string[];
  nodeTypes?: string[];
  direction?: 'outgoing' | 'incoming' | 'both';
}

/**
 * Options for cluster detection
 */
export interface ClusterDetectionOptions {
  algorithm?: 'louvain' | 'label-propagation' | 'connected-components';
  minClusterSize?: number;
  resolution?: number;
}

/**
 * Options for graph queries
 */
export interface GraphQueryOptions {
  nodeTypes?: string[];
  edgeTypes?: string[];
  searchTerm?: string;
  connectedTo?: GraphNodeId;
  relatedTo?: GraphNodeId;
  limit?: number;
  includeClusters?: boolean;
  includePaths?: boolean;
}
