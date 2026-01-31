/**
 * @fileoverview Graph CRUD operations
 * @module lib/knowledge/graph/graph-crud
 */

import type {
  GraphNode,
  GraphEdge,
  GraphCluster,
  GraphNodeId,
  GraphEdgeId,
  GraphClusterId,
  NodeCreationOptions,
  EdgeCreationOptions,
  KnowledgeGraph,
} from './index';

import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new knowledge graph instance
 */
export function createKnowledgeGraph(id: string, name: string): KnowledgeGraph {
  const nodes = new Map<GraphNodeId, GraphNode>();
  const edges = new Map<GraphEdgeId, GraphEdge>();
  const clusters = new Map<GraphClusterId, GraphCluster>();

  return {
    id,
    name,
    nodes,
    edges,
    clusters,

    addNode(options: Omit<GraphNode, 'id'>): GraphNode {
      const node: GraphNode = {
        ...options,
        id: uuidv4(),
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          ...options.metadata,
        },
      };
      nodes.set(node.id, node);
      return node;
    },

    getNode(id: GraphNodeId): GraphNode | undefined {
      return nodes.get(id);
    },

    updateNode(id: GraphNodeId, updates: Partial<GraphNode>): void {
      const node = nodes.get(id);
      if (!node) return;

      const updatedNode: GraphNode = {
        ...node,
        ...updates,
        metadata: {
          ...node.metadata,
          updatedAt: new Date(),
          ...updates.metadata,
        },
      };
      nodes.set(id, updatedNode);
    },

    deleteNode(id: GraphNodeId): void {
      // Remove associated edges first
      for (const edgeId of edges.keys()) {
        const edge = edges.get(edgeId)!;
        if (edge.source === id || edge.target === id) {
          edges.delete(edgeId);
        }
      }
      nodes.delete(id);

      // Remove from clusters
      for (const cluster of clusters.values()) {
        const index = cluster.nodeIds.indexOf(id);
        if (index !== -1) {
          cluster.nodeIds.splice(index, 1);
        }
      }
    },

    addEdge(options: Omit<GraphEdge, 'id'>): GraphEdge {
      const edge: GraphEdge = {
        ...options,
        id: uuidv4(),
      };
      edges.set(edge.id, edge);
      return edge;
    },

    getEdge(id: GraphEdgeId): GraphEdge | undefined {
      return edges.get(id);
    },

    updateEdge(id: GraphEdgeId, updates: Partial<GraphEdge>): void {
      const edge = edges.get(id);
      if (!edge) return;

      const updatedEdge: GraphEdge = {
        ...edge,
        ...updates,
      };
      edges.set(id, updatedEdge);
    },

    deleteEdge(id: GraphEdgeId): void {
      edges.delete(id);
    },

    detectClusters(options?: { minClusterSize?: number }): GraphCluster[] {
      // Simple connected components algorithm
      const visited = new Set<GraphNodeId>();
      const foundClusters: GraphCluster[] = [];

      const minClusterSize = options?.minClusterSize || 2;

      for (const nodeId of nodes.keys()) {
        if (visited.has(nodeId)) continue;

        const cluster: GraphCluster = {
          id: uuidv4(),
          label: `Cluster ${foundClusters.length + 1}`,
          nodeIds: [],
        };

        // BFS to find connected nodes
        const queue: GraphNodeId[] = [nodeId];
        while (queue.length > 0) {
          const currentId = queue.shift()!;
          if (visited.has(currentId)) continue;

          visited.add(currentId);
          cluster.nodeIds.push(currentId);

          // Find connected edges
          for (const edge of edges.values()) {
            if (edge.source === currentId && !visited.has(edge.target)) {
              queue.push(edge.target);
            } else if (edge.target === currentId && !visited.has(edge.source)) {
              queue.push(edge.source);
            }
          }
        }

        if (cluster.nodeIds.length >= minClusterSize) {
          foundClusters.push(cluster);
          clusters.set(cluster.id, cluster);
        }
      }

      return foundClusters;
    },

    query(options: {
      nodeTypes?: string[];
      edgeTypes?: string[];
      searchTerm?: string;
      limit?: number;
    }): { nodes: GraphNode[]; edges: GraphEdge[] } {
      let resultNodes: GraphNode[] = [];
      let resultEdges: GraphEdge[] = [];

      // Filter nodes
      for (const node of nodes.values()) {
        let matches = true;

        if (options.nodeTypes?.length && !options.nodeTypes.includes(node.type)) {
          matches = false;
        }

        if (options.searchTerm && !node.label.includes(options.searchTerm)) {
          matches = false;
        }

        if (matches) {
          resultNodes.push(node);
        }
      }

      // Filter edges
      for (const edge of edges.values()) {
        let matches = true;

        if (options.edgeTypes?.length && !options.edgeTypes.includes(edge.type)) {
          matches = false;
        }

        if (matches) {
          resultEdges.push(edge);
        }
      }

      // Apply limit
      if (options.limit) {
        resultNodes = resultNodes.slice(0, options.limit);
        resultEdges = resultEdges.slice(0, options.limit);
      }

      return { nodes: resultNodes, edges: resultEdges };
    },

    getStatistics(): {
      nodeCount: number;
      edgeCount: number;
      clusterCount: number;
      density: number;
    } {
      const nodeCount = nodes.size;
      const edgeCount = edges.size;
      const clusterCount = clusters.size;

      // Calculate density
      const maxEdges = (nodeCount * (nodeCount - 1)) / 2;
      const density = maxEdges > 0 ? edgeCount / maxEdges : 0;

      return {
        nodeCount,
        edgeCount,
        clusterCount,
        density,
      };
    },
  };
}
