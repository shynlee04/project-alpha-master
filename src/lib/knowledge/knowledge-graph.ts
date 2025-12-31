/**
 * @fileoverview Knowledge Graph Service
 * @module lib/knowledge/knowledge-graph
 * @governance EPIC-38, PHASE-6
 * @ai-observable true
 *
 * Knowledge graph management service with CRUD operations,
 * graph traversal algorithms, and cluster detection.
 *
 * Supports:
 * - Node tracking (sources, concepts, clusters)
 * - Edge tracking (relationships, strengths)
 * - Graph traversal (BFS, DFS, shortest path)
 * - Cluster detection (connected components)
 * - Persistence in Dexie
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
 * const path = await service.findShortestPath('node-1', 'node-3');
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

/**
 * Knowledge Graph Service
 *
 * Manages knowledge graph data structure with persistence,
 * traversal algorithms, and cluster detection.
 */
export class KnowledgeGraphService {
  private graph: KnowledgeGraph;
  private graphId: string;
  private persistenceKey: string;

  constructor(graphId: string) {
    this.graphId = graphId;
    this.persistenceKey = `knowledge-graph-${graphId}`;
    this.graph = this.initializeEmptyGraph();
  }

  /**
   * Initialize empty graph structure
   */
  private initializeEmptyGraph(): KnowledgeGraph {
    return {
      nodes: new Map(),
      edges: new Map(),
      adjacency: new Map(),
      reverseAdjacency: new Map(),
      statistics: this.getEmptyStatistics(),
      updatedAt: Date.now(),
    };
  }

  /**
   * Get empty statistics object
   */
  private getEmptyStatistics(): GraphStatistics {
    return {
      nodeCount: 0,
      edgeCount: 0,
      nodesByType: {
        source: 0,
        concept: 0,
        cluster: 0,
      },
      edgesByType: {
        conceptual: 0,
        sequential: 0,
        contrastive: 0,
        citation: 0,
        temporal: 0,
        hierarchical: 0,
      },
      avgDegree: 0,
      clusterCount: 0,
      density: 0,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Node Operations
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Add a node to the graph
   *
   * @param node - Node data (without id)
   * @param options - Creation options
   * @returns Created node with generated ID
   *
   * @example
   * ```tsx
   * const node = await service.addNode({
   *   type: 'source',
   *   sourceId: 'source-abc',
   *   labels: ['calculus'],
   *   metadata: { subject: 'Mathematics' }
   * });
   * ```
   */
  async addNode(
    node: Omit<GraphNode, 'id'>,
    options: NodeCreationOptions = {}
  ): Promise<GraphNode> {
    const newNode: GraphNode = {
      id: this.generateId('node'),
      ...node,
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ...node.metadata,
      },
    };

    // Add to graph
    this.graph.nodes.set(newNode.id, newNode);
    this.graph.adjacency.set(newNode.id, new Set());
    this.graph.reverseAdjacency.set(newNode.id, new Set());

    // Update statistics
    this.updateStatistics();

    // Persist
    await this.persist();

    return newNode;
  }

  /**
   * Get a node by ID
   *
   * @param nodeId - Node ID
   * @returns Node or undefined if not found
   */
  getNode(nodeId: string): GraphNode | undefined {
    return this.graph.nodes.get(nodeId);
  }

  /**
   * Get multiple nodes by IDs
   *
   * @param nodeIds - Array of node IDs
   * @returns Array of nodes (undefined for missing IDs)
   */
  getNodes(nodeIds: string[]): GraphNode[] {
    return nodeIds.map(id => this.graph.nodes.get(id)).filter((node): node is GraphNode => node !== undefined);
  }

  /**
   * Get all nodes
   *
   * @param type - Optional node type filter
   * @returns All nodes or filtered by type
   */
  getAllNodes(type?: GraphNode['type']): GraphNode[] {
    const allNodes = Array.from(this.graph.nodes.values());
    return type ? allNodes.filter(node => node.type === type) : allNodes;
  }

  /**
   * Update a node
   *
   * @param nodeId - Node ID
   * @param updates - Partial node data to update
   * @returns Updated node or undefined if not found
   */
  async updateNode(nodeId: string, updates: Partial<GraphNode>): Promise<GraphNode | undefined> {
    const node = this.graph.nodes.get(nodeId);
    if (!node) return undefined;

    const updatedNode: GraphNode = {
      ...node,
      ...updates,
      id: node.id, // Preserve ID
      metadata: {
        ...node.metadata,
        ...updates.metadata,
        updatedAt: Date.now(),
      },
    };

    this.graph.nodes.set(nodeId, updatedNode);
    await this.persist();

    return updatedNode;
  }

  /**
   * Delete a node and all connected edges
   *
   * @param nodeId - Node ID
   * @returns True if deleted, false if not found
   */
  async deleteNode(nodeId: string): Promise<boolean> {
    const node = this.graph.nodes.get(nodeId);
    if (!node) return false;

    // Remove all edges connected to this node
    const edgesToRemove = this.getEdgesForNode(nodeId);
    for (const edge of edgesToRemove) {
      await this.deleteEdge(edge.id);
    }

    // Remove node
    this.graph.nodes.delete(nodeId);
    this.graph.adjacency.delete(nodeId);
    this.graph.reverseAdjacency.delete(nodeId);

    // Update statistics
    this.updateStatistics();

    // Persist
    await this.persist();

    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Edge Operations
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Add an edge to the graph
   *
   * @param edge - Edge data (without id)
   * @param options - Creation options
   * @returns Created edge with generated ID
   *
   * @example
   * ```tsx
   * const edge = await service.addEdge({
   *   sourceId: 'node-1',
   *   targetId: 'node-2',
   *   type: 'conceptual',
   *   strength: 0.85,
   *   metadata: { similarity: 0.85 }
   * });
   * ```
   */
  async addEdge(
    edge: Omit<GraphEdge, 'id' | 'createdAt'>,
    options: EdgeCreationOptions = {}
  ): Promise<GraphEdge> {
    // Validate nodes exist
    if (!this.graph.nodes.has(edge.sourceId) || !this.graph.nodes.has(edge.targetId)) {
      throw new Error('Cannot create edge: source or target node does not exist');
    }

    // Check for duplicates if enabled
    if (options.preventDuplicates) {
      const existing = this.findEdge(edge.sourceId, edge.targetId, edge.type);
      if (existing) {
        return existing;
      }
    }

    const newEdge: GraphEdge = {
      id: this.generateId('edge'),
      ...edge,
      createdAt: Date.now(),
    };

    // Add to graph
    this.graph.edges.set(newEdge.id, newEdge);

    // Update adjacency lists
    this.graph.adjacency.get(newEdge.sourceId)?.add(newEdge.targetId);
    this.graph.reverseAdjacency.get(newEdge.targetId)?.add(newEdge.sourceId);

    // Update statistics
    this.updateStatistics();

    // Persist
    await this.persist();

    return newEdge;
  }

  /**
   * Get an edge by ID
   *
   * @param edgeId - Edge ID
   * @returns Edge or undefined if not found
   */
  getEdge(edgeId: string): GraphEdge | undefined {
    return this.graph.edges.get(edgeId);
  }

  /**
   * Find edge between two nodes
   *
   * @param sourceId - Source node ID
   * @param targetId - Target node ID
   * @param type - Optional edge type filter
   * @returns Edge or undefined if not found
   */
  findEdge(sourceId: string, targetId: string, type?: GraphEdge['type']): GraphEdge | undefined {
    for (const edge of this.graph.edges.values()) {
      if (edge.sourceId === sourceId && edge.targetId === targetId) {
        if (!type || edge.type === type) {
          return edge;
        }
      }
    }
    return undefined;
  }

  /**
   * Get all edges
   *
   * @param type - Optional edge type filter
   * @returns All edges or filtered by type
   */
  getAllEdges(type?: GraphEdge['type']): GraphEdge[] {
    const allEdges = Array.from(this.graph.edges.values());
    return type ? allEdges.filter(edge => edge.type === type) : allEdges;
  }

  /**
   * Get all edges for a node
   *
   * @param nodeId - Node ID
   * @returns All edges connected to the node
   */
  getEdgesForNode(nodeId: string): GraphEdge[] {
    return Array.from(this.graph.edges.values()).filter(
      edge => edge.sourceId === nodeId || edge.targetId === nodeId
    );
  }

  /**
   * Update an edge
   *
   * @param edgeId - Edge ID
   * @param updates - Partial edge data to update
   * @returns Updated edge or undefined if not found
   */
  async updateEdge(edgeId: string, updates: Partial<GraphEdge>): Promise<GraphEdge | undefined> {
    const edge = this.graph.edges.get(edgeId);
    if (!edge) return undefined;

    const updatedEdge: GraphEdge = {
      ...edge,
      ...updates,
      id: edge.id, // Preserve ID and createdAt
      createdAt: edge.createdAt,
    };

    this.graph.edges.set(edgeId, updatedEdge);
    await this.persist();

    return updatedEdge;
  }

  /**
   * Delete an edge
   *
   * @param edgeId - Edge ID
   * @returns True if deleted, false if not found
   */
  async deleteEdge(edgeId: string): Promise<boolean> {
    const edge = this.graph.edges.get(edgeId);
    if (!edge) return false;

    // Remove from adjacency lists
    this.graph.adjacency.get(edge.sourceId)?.delete(edge.targetId);
    this.graph.reverseAdjacency.get(edge.targetId)?.delete(edge.sourceId);

    // Remove edge
    this.graph.edges.delete(edgeId);

    // Update statistics
    this.updateStatistics();

    // Persist
    await this.persist();

    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Graph Traversal
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Breadth-first search (BFS) from a node
   *
   * @param startNodeId - Starting node ID
   * @param options - Traversal options
   * @returns Array of reachable node IDs
   */
  bfs(startNodeId: string, options: TraversalOptions = {}): string[] {
    const visited = new Set<string>();
    const queue: string[] = [startNodeId];
    const result: string[] = [];

    const maxDepth = options.maxDepth ?? 3;
    let currentDepth = 0;
    let nodesAtCurrentDepth = 1;
    let nodesAtNextDepth = 0;

    while (queue.length > 0 && currentDepth < maxDepth) {
      const nodeId = queue.shift()!;
      if (visited.has(nodeId)) continue;

      visited.add(nodeId);
      result.push(nodeId);

      // Get neighbors
      const neighbors = this.getNeighbors(nodeId, options);
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          queue.push(neighborId);
          nodesAtNextDepth++;
        }
      }

      nodesAtCurrentDepth--;
      if (nodesAtCurrentDepth === 0) {
        currentDepth++;
        nodesAtCurrentDepth = nodesAtNextDepth;
        nodesAtNextDepth = 0;
      }
    }

    return result;
  }

  /**
   * Depth-first search (DFS) from a node
   *
   * @param startNodeId - Starting node ID
   * @param options - Traversal options
   * @returns Array of reachable node IDs
   */
  dfs(startNodeId: string, options: TraversalOptions = {}): string[] {
    const visited = new Set<string>();
    const result: string[] = [];

    const dfsRecursive = (nodeId: string, depth: number) => {
      if (visited.has(nodeId)) return;
      if (options.maxDepth !== undefined && depth > options.maxDepth) return;

      visited.add(nodeId);
      result.push(nodeId);

      const neighbors = this.getNeighbors(nodeId, options);
      for (const neighborId of neighbors) {
        dfsRecursive(neighborId, depth + 1);
      }
    };

    dfsRecursive(startNodeId, 0);
    return result;
  }

  /**
   * Find shortest path between two nodes (BFS-based)
   *
   * @param sourceId - Source node ID
   * @param targetId - Target node ID
   * @param options - Traversal options
   * @returns Shortest path or undefined if no path exists
   */
  findShortestPath(sourceId: string, targetId: string, options: TraversalOptions = {}): GraphPath | undefined {
    const visited = new Set<string>();
    const queue: Array<{ nodeId: string; path: string[]; edges: string[]; weight: number }> = [
      { nodeId: sourceId, path: [sourceId], edges: [], weight: 0 },
    ];

    while (queue.length > 0) {
      const { nodeId, path, edges, weight } = queue.shift()!;

      if (nodeId === targetId) {
        return {
          nodes: path,
          edges,
          weight,
          length: edges.length,
        };
      }

      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const neighbors = this.getNeighbors(nodeId, options);
      for (const neighborId of neighbors) {
        if (visited.has(neighborId)) continue;

        const edge = this.findEdge(nodeId, neighborId);
        if (edge) {
          queue.push({
            nodeId: neighborId,
            path: [...path, neighborId],
            edges: [...edges, edge.id],
            weight: weight + edge.strength,
          });
        }
      }
    }

    return undefined;
  }

  /**
   * Get neighbors of a node
   *
   * @param nodeId - Node ID
   * @param options - Traversal options for filtering
   * @returns Array of neighbor node IDs
   */
  private getNeighbors(nodeId: string, options: TraversalOptions = {}): string[] {
    const neighbors = Array.from(this.graph.adjacency.get(nodeId) || []);

    return neighbors.filter(neighborId => {
      // Filter by node type
      if (options.nodeTypes) {
        const node = this.graph.nodes.get(neighborId);
        if (!node || !options.nodeTypes.includes(node.type)) {
          return false;
        }
      }

      // Filter by edge strength
      if (options.minStrength !== undefined) {
        const edge = this.findEdge(nodeId, neighborId);
        if (!edge || edge.strength < options.minStrength) {
          return false;
        }
      }

      // Filter by edge type
      if (options.edgeTypes) {
        const edge = this.findEdge(nodeId, neighborId);
        if (!edge || !options.edgeTypes.includes(edge.type)) {
          return false;
        }
      }

      return true;
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Cluster Detection
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Detect clusters using connected components
   *
   * @param options - Cluster detection options
   * @returns Array of detected clusters
   */
  detectClusters(options: ClusterDetectionOptions = {}): GraphCluster[] {
    const minClusterSize = options.minClusterSize ?? 2;
    const minEdgeStrength = options.minEdgeStrength ?? 0.3;

    // Build subgraph with edges above strength threshold
    const subgraphAdjacency = new Map<string, Set<string>>();
    for (const [nodeId, neighbors] of this.graph.adjacency) {
      subgraphAdjacency.set(nodeId, new Set());
      for (const neighborId of neighbors) {
        const edge = this.findEdge(nodeId, neighborId);
        if (edge && edge.strength >= minEdgeStrength) {
          subgraphAdjacency.get(nodeId)!.add(neighborId);
        }
      }
    }

    // Find connected components
    const visited = new Set<string>();
    const clusters: GraphCluster[] = [];
    let clusterId = 0;

    for (const nodeId of subgraphAdjacency.keys()) {
      if (visited.has(nodeId)) continue;

      const component = this.bfs(nodeId, {
        maxDepth: 10,
        minStrength: minEdgeStrength,
      });

      if (component.length >= minClusterSize) {
        const nodes = this.getNodes(component);

        // Extract dominant subjects
        const subjects = this.extractSubjects(nodes);

        // Calculate cohesion (average edge strength)
        const cohesion = this.calculateCohesion(component, minEdgeStrength);

        clusters.push({
          id: `cluster-${clusterId++}`,
          label: this.generateClusterLabel(nodes),
          members: component,
          cohesion,
          subjects,
          size: component.length,
        });
      }

      for (const id of component) {
        visited.add(id);
      }
    }

    return clusters;
  }

  /**
   * Extract subjects from nodes
   */
  private extractSubjects(nodes: GraphNode[]): string[] {
    const subjectCounts = new Map<string, number>();

    for (const node of nodes) {
      const subject = node.metadata?.subject;
      if (subject) {
        subjectCounts.set(subject, (subjectCounts.get(subject) || 0) + 1);
      }
    }

    // Return top 3 subjects
    return Array.from(subjectCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([subject]) => subject);
  }

  /**
   * Calculate cluster cohesion (average edge strength)
   */
  private calculateCohesion(nodeIds: string[], minStrength: number): number {
    let totalStrength = 0;
    let edgeCount = 0;

    for (let i = 0; i < nodeIds.length; i++) {
      for (let j = i + 1; j < nodeIds.length; j++) {
        const edge = this.findEdge(nodeIds[i], nodeIds[j]);
        if (edge && edge.strength >= minStrength) {
          totalStrength += edge.strength;
          edgeCount++;
        }
      }
    }

    return edgeCount > 0 ? totalStrength / edgeCount : 0;
  }

  /**
   * Generate cluster label from dominant concepts
   */
  private generateClusterLabel(nodes: GraphNode[]): string {
    const allLabels = nodes.flatMap(node => node.labels);
    const labelCounts = new Map<string, number>();

    for (const label of allLabels) {
      labelCounts.set(label, (labelCounts.get(label) || 0) + 1);
    }

    const topLabels = Array.from(labelCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([label]) => label);

    return topLabels.length > 0 ? topLabels.join(' + ') : 'Unnamed Cluster';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Query & Statistics
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Query the graph
   *
   * @param options - Query options
   * @returns Query result with nodes and edges
   */
  query(options: GraphQueryOptions = {}): GraphQueryResult {
    const startTime = Date.now();

    let nodes = Array.from(this.graph.nodes.values());
    let edges = Array.from(this.graph.edges.values());

    // Sort
    if (options.sortBy) {
      const sortOrder = options.sortOrder === 'desc' ? -1 : 1;

      if (options.sortBy === 'createdAt') {
        nodes.sort((a, b) => sortOrder * ((a.metadata?.createdAt || 0) - (b.metadata?.createdAt || 0)));
      } else if (options.sortBy === 'strength') {
        edges.sort((a, b) => sortOrder * (b.strength - a.strength));
      } else if (options.sortBy === 'interactionScore') {
        nodes.sort((a, b) => sortOrder * ((a.metadata?.interactionScore || 0) - (b.metadata?.interactionScore || 0)));
      }
    }

    // Limit and offset
    if (options.offset) {
      nodes = nodes.slice(options.offset);
      edges = edges.slice(options.offset);
    }
    if (options.limit) {
      nodes = nodes.slice(0, options.limit);
      edges = edges.slice(0, options.limit);
    }

    // Include related nodes
    if (options.includeRelated && nodes.length > 0) {
      const relatedNodeIds = new Set<string>();
      const maxDepth = options.relatedDepth ?? 1;

      for (const node of nodes) {
        const reachable = this.bfs(node.id, { maxDepth });
        for (const id of reachable) {
          if (!relatedNodeIds.has(id)) {
            relatedNodeIds.add(id);
          }
        }
      }

      const relatedNodes = this.getNodes(Array.from(relatedNodeIds));
      nodes = [...nodes, ...relatedNodes];
    }

    return {
      nodes,
      edges,
      executionTime: Date.now() - startTime,
      count: nodes.length + edges.length,
    };
  }

  /**
   * Get graph statistics
   *
   * @returns Current graph statistics
   */
  getStatistics(): GraphStatistics {
    return { ...this.graph.statistics };
  }

  /**
   * Update graph statistics
   */
  private updateStatistics(): void {
    const nodes = Array.from(this.graph.nodes.values());
    const edges = Array.from(this.graph.edges.values());

    // Node count by type
    const nodesByType: Record<GraphNode['type'], number> = {
      source: 0,
      concept: 0,
      cluster: 0,
    };
    for (const node of nodes) {
      nodesByType[node.type]++;
    }

    // Edge count by type
    const edgesByType: Record<GraphEdge['type'], number> = {
      conceptual: 0,
      sequential: 0,
      contrastive: 0,
      citation: 0,
      temporal: 0,
      hierarchical: 0,
    };
    for (const edge of edges) {
      edgesByType[edge.type]++;
    }

    // Average degree
    let totalDegree = 0;
    for (const [nodeId, neighbors] of this.graph.adjacency) {
      totalDegree += neighbors.size;
    }
    const avgDegree = nodes.length > 0 ? totalDegree / nodes.length : 0;

    // Graph density
    const possibleEdges = nodes.length * (nodes.length - 1) / 2;
    const density = possibleEdges > 0 ? edges.length / possibleEdges : 0;

    this.graph.statistics = {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      nodesByType,
      edgesByType,
      avgDegree,
      clusterCount: 0, // Updated by detectClusters
      density,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Persistence
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Persist graph to IndexedDB
   */
  private async persist(): Promise<void> {
    try {
      const record: GraphPersistenceRecord = {
        id: this.graphId,
        nodes: Array.from(this.graph.nodes.entries()).map(([id, data]) => ({ id, data })),
        edges: Array.from(this.graph.edges.entries()).map(([id, data]) => ({ id, data })),
        statistics: this.graph.statistics,
        updatedAt: Date.now(),
      };

      // Store in localStorage for now (Dexie integration later)
      localStorage.setItem(this.persistenceKey, JSON.stringify(record));
    } catch (error) {
      console.error('[KnowledgeGraph] Failed to persist:', error);
    }
  }

  /**
   * Load graph from persistence
   */
  async load(): Promise<void> {
    try {
      const data = localStorage.getItem(this.persistenceKey);
      if (!data) return;

      const record: GraphPersistenceRecord = JSON.parse(data);

      // Rebuild graph
      this.graph = {
        nodes: new Map(record.nodes.map(({ id, data }) => [id, data])),
        edges: new Map(record.edges.map(({ id, data }) => [id, data])),
        adjacency: new Map(),
        reverseAdjacency: new Map(),
        statistics: record.statistics,
        updatedAt: record.updatedAt,
      };

      // Rebuild adjacency lists
      for (const [nodeId] of this.graph.nodes) {
        this.graph.adjacency.set(nodeId, new Set());
        this.graph.reverseAdjacency.set(nodeId, new Set());
      }
      for (const edge of this.graph.edges.values()) {
        this.graph.adjacency.get(edge.sourceId)?.add(edge.targetId);
        this.graph.reverseAdjacency.get(edge.targetId)?.add(edge.sourceId);
      }
    } catch (error) {
      console.error('[KnowledgeGraph] Failed to load:', error);
      this.graph = this.initializeEmptyGraph();
    }
  }

  /**
   * Clear all graph data
   */
  async clear(): Promise<void> {
    this.graph = this.initializeEmptyGraph();
    await this.persist();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Utilities
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Generate unique ID
   */
  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
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
export function createKnowledgeGraphService(graphId: string): KnowledgeGraphService {
  return new KnowledgeGraphService(graphId);
}
