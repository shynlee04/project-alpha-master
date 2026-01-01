/**
 * @fileoverview Knowledge Graph Service
 * @module lib/knowledge/knowledge-graph
 * @governance EPIC-38, PHASE-6
 * @ai-observable true
 *
 * Knowledge graph management service with CRUD operations,
 * graph traversal algorithms, and cluster detection.
 *
 * This is the main orchestrator that combines:
 * - KnowledgeGraphCRUD (node/edge operations)
 * - GraphTraversal (BFS, DFS, shortest path)
 * - GraphQueries (queries, cluster detection, statistics)
 * - GraphPersistence (save, load, export)
 *
 * @example
 * ```tsx
 * import { KnowledgeGraphService, createKnowledgeGraphService } from '@/lib/knowledge/knowledge-graph';
 *
 * const service = createKnowledgeGraphService('project-123');
 *
 * // Add source node
 * const node = await service.addNode({
 *   type: 'source',
 *   sourceId: 'source-abc',
 *   labels: ['calculus', 'derivatives'],
 *   metadata: { subject: 'Mathematics' }
 * });
 *
 * // Add edge between nodes
 * const edge = await service.addEdge({
 *   sourceId: 'node-1',
 *   targetId: 'node-2',
 *   type: 'conceptual',
 *   strength: 0.85
 * });
 *
 * // Find shortest path
 * const path = service.findShortestPath('node-1', 'node-3');
 * ```
 */

import type {
  GraphNode,
  GraphEdge,
  GraphCluster,
  GraphPath,
  GraphQueryResult,
  GraphStatistics,
  KnowledgeGraph,
  NodeCreationOptions,
  EdgeCreationOptions,
  TraversalOptions,
  ClusterDetectionOptions,
  GraphQueryOptions,
} from './knowledge-graph-types';

import { KnowledgeGraphCRUD } from './graph/graph-crud';
import { GraphTraversal } from './graph/graph-traversal';
import { GraphQueries } from './graph/graph-queries';
import { GraphPersistence } from './graph/graph-persistence';

/**
 * Knowledge Graph Service
 *
 * Main orchestrator that combines CRUD, traversal, queries, and persistence.
 * Maintains backward compatibility with the original monolithic service.
 */
export class KnowledgeGraphService {
  private graph: KnowledgeGraph;

  // Module instances
  private crud: KnowledgeGraphCRUD;
  private traversal: GraphTraversal;
  private queries: GraphQueries;
  private persistence: GraphPersistence;

  constructor(graphId: string) {
    // Initialize persistence and empty graph
    this.persistence = new GraphPersistence(this.graph, graphId);
    this.graph = this.persistence.initializeEmptyGraph();

    // Initialize modules (order matters: traversal → queries → crud)
    this.traversal = new GraphTraversal(this.graph);
    this.queries = new GraphQueries(this.graph, this.traversal);
    this.crud = new KnowledgeGraphCRUD(
      this.graph,
      () => this.queries.updateStatistics(),
      () => this.persist()
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CRUD Operations (delegated to KnowledgeGraphCRUD)
  // ═══════════════════════════════════════════════════════════════════════════

  async addNode(
    node: Omit<GraphNode, 'id'>,
    options?: NodeCreationOptions
  ): Promise<GraphNode> {
    return this.crud.addNode(node, options);
  }

  getNode(nodeId: string): GraphNode | undefined {
    return this.crud.getNode(nodeId);
  }

  getNodes(nodeIds: string[]): GraphNode[] {
    return this.crud.getNodes(nodeIds);
  }

  getAllNodes(type?: GraphNode['type']): GraphNode[] {
    return this.crud.getAllNodes(type);
  }

  async updateNode(
    nodeId: string,
    updates: Partial<GraphNode>
  ): Promise<GraphNode | undefined> {
    return this.crud.updateNode(nodeId, updates);
  }

  async deleteNode(nodeId: string): Promise<boolean> {
    return this.crud.deleteNode(nodeId);
  }

  async addEdge(
    edge: Omit<GraphEdge, 'id' | 'createdAt'>,
    options?: EdgeCreationOptions
  ): Promise<GraphEdge> {
    return this.crud.addEdge(edge, options);
  }

  getEdge(edgeId: string): GraphEdge | undefined {
    return this.crud.getEdge(edgeId);
  }

  findEdge(
    sourceId: string,
    targetId: string,
    type?: GraphEdge['type']
  ): GraphEdge | undefined {
    return this.crud.findEdge(sourceId, targetId, type);
  }

  getAllEdges(type?: GraphEdge['type']): GraphEdge[] {
    return this.crud.getAllEdges(type);
  }

  getEdgesForNode(nodeId: string): GraphEdge[] {
    return this.crud.getEdgesForNode(nodeId);
  }

  async updateEdge(
    edgeId: string,
    updates: Partial<GraphEdge>
  ): Promise<GraphEdge | undefined> {
    return this.crud.updateEdge(edgeId, updates);
  }

  async deleteEdge(edgeId: string): Promise<boolean> {
    return this.crud.deleteEdge(edgeId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Graph Traversal (delegated to GraphTraversal)
  // ═══════════════════════════════════════════════════════════════════════════

  bfs(startNodeId: string, options?: TraversalOptions): string[] {
    return this.traversal.bfs(startNodeId, options);
  }

  dfs(startNodeId: string, options?: TraversalOptions): string[] {
    return this.traversal.dfs(startNodeId, options);
  }

  findShortestPath(
    sourceId: string,
    targetId: string,
    options?: TraversalOptions
  ): GraphPath | undefined {
    return this.traversal.findShortestPath(sourceId, targetId, options);
  }

  findAllPaths(
    sourceId: string,
    targetId: string,
    options?: TraversalOptions
  ): GraphPath[] {
    return this.traversal.findAllPaths(sourceId, targetId, options);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Cluster Detection (delegated to GraphQueries)
  // ═══════════════════════════════════════════════════════════════════════════

  detectClusters(options?: ClusterDetectionOptions): GraphCluster[] {
    return this.queries.detectClusters(options);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Query & Statistics (delegated to GraphQueries)
  // ═══════════════════════════════════════════════════════════════════════════

  query(options?: GraphQueryOptions): GraphQueryResult {
    return this.queries.query(options);
  }

  getStatistics(): GraphStatistics {
    return this.queries.getStatistics();
  }

  getStatisticsByType(type: GraphNode['type']): number {
    return this.queries.getStatisticsByType(type);
  }

  getConnectedComponents(): number {
    return this.queries.getConnectedComponents();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Persistence (delegated to GraphPersistence)
  // ═══════════════════════════════════════════════════════════════════════════

  async persist(): Promise<void> {
    return this.persistence.persist();
  }

  async load(): Promise<void> {
    return this.persistence.load();
  }

  async clear(): Promise<void> {
    return this.persistence.clear();
  }

  exportGraph(): string {
    return this.persistence.exportGraph();
  }

  importGraph(
    jsonData: string,
    options?: { merge?: boolean; validate?: boolean }
  ): { success: boolean; message: string; nodesImported: number; edgesImported: number } {
    return this.persistence.importGraph(jsonData, options);
  }
}

/**
 * Factory function to create KnowledgeGraphService
 *
 * @param graphId - Unique graph identifier (typically project ID)
 * @returns KnowledgeGraphService instance
 *
 * @example
 * ```tsx
 * const service = createKnowledgeGraphService('project-123');
 * await service.load(); // Load from persistence
 * ```
 */
export function createKnowledgeGraphService(
  graphId: string
): KnowledgeGraphService {
  return new KnowledgeGraphService(graphId);
}
