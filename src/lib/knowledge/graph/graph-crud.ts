/**
 * @fileoverview Graph CRUD Operations
 * @module lib/knowledge/graph/graph-crud
 * @governance EPIC-38, PHASE-7
 * @ai-observable true
 *
 * CRUD operations for knowledge graph nodes and edges.
 * Handles create, read, update, and delete operations with validation.
 */

import type {
  GraphNode,
  GraphEdge,
  KnowledgeGraph,
  NodeCreationOptions,
  EdgeCreationOptions,
} from '../knowledge-graph-types';
import { generateId } from './graph-utils';

/**
 * Graph CRUD Operations
 *
 * Manages create, read, update, and delete operations for graph nodes and edges.
 */
export class KnowledgeGraphCRUD {
  private graph: KnowledgeGraph;
  private updateStatisticsCallback: () => void;
  private persistCallback: () => Promise<void>;

  constructor(
    graph: KnowledgeGraph,
    updateStatisticsCallback: () => void,
    persistCallback: () => Promise<void>
  ) {
    this.graph = graph;
    this.updateStatisticsCallback = updateStatisticsCallback;
    this.persistCallback = persistCallback;
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
   */
  async addNode(
    node: Omit<GraphNode, 'id'>,
    _options: NodeCreationOptions = {}
  ): Promise<GraphNode> {
    const newNode: GraphNode = {
      id: generateId('node'),
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
    this.updateStatisticsCallback();

    // Persist
    await this.persistCallback();

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
    return nodeIds
      .map((id) => this.graph.nodes.get(id))
      .filter((node): node is GraphNode => node !== undefined);
  }

  /**
   * Get all nodes
   *
   * @param type - Optional node type filter
   * @returns All nodes or filtered by type
   */
  getAllNodes(type?: GraphNode['type']): GraphNode[] {
    const allNodes = Array.from(this.graph.nodes.values());
    return type ? allNodes.filter((node) => node.type === type) : allNodes;
  }

  /**
   * Update a node
   *
   * @param nodeId - Node ID
   * @param updates - Partial node data to update
   * @returns Updated node or undefined if not found
   */
  async updateNode(
    nodeId: string,
    updates: Partial<GraphNode>
  ): Promise<GraphNode | undefined> {
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
    await this.persistCallback();

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
    this.updateStatisticsCallback();

    // Persist
    await this.persistCallback();

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
   */
  async addEdge(
    edge: Omit<GraphEdge, 'id' | 'createdAt'>,
    options: EdgeCreationOptions = {}
  ): Promise<GraphEdge> {
    // Validate nodes exist
    if (
      !this.graph.nodes.has(edge.sourceId) ||
      !this.graph.nodes.has(edge.targetId)
    ) {
      throw new Error(
        'Cannot create edge: source or target node does not exist'
      );
    }

    // Check for duplicates if enabled
    if (options.preventDuplicates) {
      const existing = this.findEdge(edge.sourceId, edge.targetId, edge.type);
      if (existing) {
        return existing;
      }
    }

    const newEdge: GraphEdge = {
      id: generateId('edge'),
      ...edge,
      createdAt: Date.now(),
    };

    // Add to graph
    this.graph.edges.set(newEdge.id, newEdge);

    // Update adjacency lists
    this.graph.adjacency.get(newEdge.sourceId)?.add(newEdge.targetId);
    this.graph.reverseAdjacency.get(newEdge.targetId)?.add(newEdge.sourceId);

    // Update statistics
    this.updateStatisticsCallback();

    // Persist
    await this.persistCallback();

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
  findEdge(
    sourceId: string,
    targetId: string,
    type?: GraphEdge['type']
  ): GraphEdge | undefined {
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
    return type ? allEdges.filter((edge) => edge.type === type) : allEdges;
  }

  /**
   * Get all edges for a node
   *
   * @param nodeId - Node ID
   * @returns All edges connected to the node
   */
  getEdgesForNode(nodeId: string): GraphEdge[] {
    return Array.from(this.graph.edges.values()).filter(
      (edge) => edge.sourceId === nodeId || edge.targetId === nodeId
    );
  }

  /**
   * Update an edge
   *
   * @param edgeId - Edge ID
   * @param updates - Partial edge data to update
   * @returns Updated edge or undefined if not found
   */
  async updateEdge(
    edgeId: string,
    updates: Partial<GraphEdge>
  ): Promise<GraphEdge | undefined> {
    const edge = this.graph.edges.get(edgeId);
    if (!edge) return undefined;

    const updatedEdge: GraphEdge = {
      ...edge,
      ...updates,
      id: edge.id, // Preserve ID and createdAt
      createdAt: edge.createdAt,
    };

    this.graph.edges.set(edgeId, updatedEdge);
    await this.persistCallback();

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
    this.updateStatisticsCallback();

    // Persist
    await this.persistCallback();

    return true;
  }
}
