/**
 * @fileoverview Graph Traversal Algorithms
 * @module lib/knowledge/graph/graph-traversal
 * @governance EPIC-38, PHASE-7
 * @ai-observable true
 *
 * Graph traversal algorithms including BFS, DFS, and shortest path finding.
 * Takes a graph reference and provides efficient traversal methods.
 */

import type {
  KnowledgeGraph,
  GraphPath,
  TraversalOptions,
  GraphEdge,
} from '../knowledge-graph-types';

/**
 * Graph Traversal Algorithms
 *
 * Provides BFS, DFS, and shortest path algorithms for graph traversal.
 */
export class GraphTraversal {
  private graph: KnowledgeGraph;

  constructor(graph: KnowledgeGraph) {
    this.graph = graph;
  }

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
  findShortestPath(
    sourceId: string,
    targetId: string,
    options: TraversalOptions = {}
  ): GraphPath | undefined {
    const visited = new Set<string>();
    const queue: Array<{
      nodeId: string;
      path: string[];
      edges: string[];
      weight: number;
    }> = [
      {
        nodeId: sourceId,
        path: [sourceId],
        edges: [],
        weight: 0,
      },
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
   * Find all paths between two nodes (DFS-based)
   *
   * @param sourceId - Source node ID
   * @param targetId - Target node ID
   * @param options - Traversal options
   * @returns Array of all paths
   */
  findAllPaths(
    sourceId: string,
    targetId: string,
    options: TraversalOptions = {}
  ): GraphPath[] {
    const paths: GraphPath[] = [];
    const visited = new Set<string>();

    const dfsRecursive = (
      currentNodeId: string,
      path: string[],
      edges: string[],
      weight: number
    ) => {
      // Add current node to path
      const newPath = [...path, currentNodeId];
      const newWeight = weight;

      // Check if we reached the target
      if (currentNodeId === targetId && newPath.length > 1) {
        paths.push({
          nodes: newPath,
          edges,
          weight: newWeight,
          length: edges.length,
        });
        return;
      }

      // Skip visited nodes (except for finding alternative paths)
      if (visited.has(currentNodeId)) return;
      visited.add(currentNodeId);

      // Respect max depth
      if (options.maxDepth !== undefined && newPath.length > options.maxDepth + 1) {
        visited.delete(currentNodeId);
        return;
      }

      // Explore neighbors
      const neighbors = this.getNeighbors(currentNodeId, options);
      for (const neighborId of neighbors) {
        const edge = this.findEdge(currentNodeId, neighborId);
        if (edge) {
          dfsRecursive(
            neighborId,
            newPath,
            [...edges, edge.id],
            newWeight + edge.strength
          );
        }
      }

      // Backtrack
      visited.delete(currentNodeId);
    };

    dfsRecursive(sourceId, [], [], 0);
    return paths;
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

    return neighbors.filter((neighborId) => {
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

  /**
   * Find edge between two nodes
   *
   * @param sourceId - Source node ID
   * @param targetId - Target node ID
   * @returns Edge or undefined if not found
   */
  private findEdge(sourceId: string, targetId: string): GraphEdge | undefined {
    for (const edge of this.graph.edges.values()) {
      if (edge.sourceId === sourceId && edge.targetId === targetId) {
        return edge;
      }
    }
    return undefined;
  }
}
