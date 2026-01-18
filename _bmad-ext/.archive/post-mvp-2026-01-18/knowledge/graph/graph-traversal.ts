/**
 * @fileoverview Graph traversal algorithms
 * @module lib/knowledge/graph/graph-traversal
 */

import type {
  GraphNode,
  GraphEdge,
  GraphPath,
  GraphNodeId,
  TraversalOptions,
} from './index';

/**
 * BFS traversal
 */
export function bfsTraversal(
  nodes: Map<GraphNodeId, GraphNode>,
  edges: Map<string, GraphEdge>,
  startNodeId: GraphNodeId,
  maxDepth?: number
): Map<number, GraphNode[]> {
  const result = new Map<number, GraphNode[]>();
  const visited = new Set<GraphNodeId>([startNodeId]);
  const queue: { id: GraphNodeId; depth: number }[] = [
    { id: startNodeId, depth: 0 },
  ];

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;

    if (maxDepth !== undefined && depth > maxDepth) continue;

    if (!result.has(depth)) {
      result.set(depth, []);
    }
    result.get(depth)!.push(nodes.get(id)!);

    // Get neighbors
    for (const edge of edges.values()) {
      let neighborId: GraphNodeId | null = null;

      if (edge.source === id) {
        neighborId = edge.target;
      } else if (edge.target === id) {
        neighborId = edge.source;
      }

      if (neighborId && !visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push({ id: neighborId, depth: depth + 1 });
      }
    }
  }

  return result;
}

/**
 * DFS traversal
 */
export function dfsTraversal(
  nodes: Map<GraphNodeId, GraphNode>,
  edges: Map<string, GraphEdge>,
  startNodeId: GraphNodeId,
  maxDepth?: number
): GraphNode[] {
  const visited = new Set<GraphNodeId>();
  const result: GraphNode[] = [];

  function dfs(id: GraphNodeId, depth: number): void {
    if (maxDepth !== undefined && depth > maxDepth) return;
    if (visited.has(id)) return;

    visited.add(id);
    result.push(nodes.get(id)!);

    // Get neighbors
    for (const edge of edges.values()) {
      let neighborId: GraphNodeId | null = null;

      if (edge.source === id) {
        neighborId = edge.target;
      } else if (edge.target === id) {
        neighborId = edge.source;
      }

      if (neighborId) {
        dfs(neighborId, depth + 1);
      }
    }
  }

  dfs(startNodeId, 0);
  return result;
}

/**
 * Find all paths between two nodes
 */
export function findAllPaths(
  nodes: Map<GraphNodeId, GraphNode>,
  edges: Map<string, GraphEdge>,
  startId: GraphNodeId,
  endId: GraphNodeId,
  maxPaths: number = 10,
  maxDepth: number = 10
): GraphPath[] {
  const paths: GraphPath[] = [];

  function dfs(
    currentId: GraphNodeId,
    path: GraphNodeId[],
    depth: number
  ): void {
    if (paths.length >= maxPaths) return;
    if (depth > maxDepth) return;

    if (currentId === endId) {
      paths.push({
        nodes: path.map((id) => nodes.get(id)!),
        edges: [],
      });
      return;
    }

    // Get unvisited neighbors
    for (const edge of edges.values()) {
      let neighborId: GraphNodeId | null = null;

      if (edge.source === currentId) {
        neighborId = edge.target;
      } else if (edge.target === currentId) {
        neighborId = edge.source;
      }

      if (neighborId && !path.includes(neighborId)) {
        dfs(neighborId, [...path, neighborId], depth + 1);
      }
    }
  }

  dfs(startId, [startId], 0);
  return paths;
}

/**
 * Get nodes within N hops
 */
export function getNodesWithinHops(
  nodes: Map<GraphNodeId, GraphNode>,
  edges: Map<string, GraphEdge>,
  startNodeId: GraphNodeId,
  maxHops: number
): Set<GraphNodeId> {
  const result = new Set<GraphNodeId>([startNodeId]);
  const queue: { id: GraphNodeId; hops: number }[] = [
    { id: startNodeId, hops: 0 },
  ];

  while (queue.length > 0) {
    const { id, hops } = queue.shift()!;

    if (hops >= maxHops) continue;

    for (const edge of edges.values()) {
      let neighborId: GraphNodeId | null = null;

      if (edge.source === id) {
        neighborId = edge.target;
      } else if (edge.target === id) {
        neighborId = edge.source;
      }

      if (neighborId && !result.has(neighborId)) {
        result.add(neighborId);
        queue.push({ id: neighborId, hops: hops + 1 });
      }
    }
  }

  return result;
}

/**
 * Traverse with edge type filtering
 */
export function traverseWithEdgeFilter(
  nodes: Map<GraphNodeId, GraphNode>,
  edges: Map<string, GraphEdge>,
  startNodeId: GraphNodeId,
  allowedEdgeTypes: string[],
  maxDepth?: number
): Map<number, GraphNode[]> {
  const result = new Map<number, GraphNode[]>();
  const visited = new Set<GraphNodeId>([startNodeId]);
  const queue: { id: GraphNodeId; depth: number }[] = [
    { id: startNodeId, depth: 0 },
  ];

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;

    if (maxDepth !== undefined && depth > maxDepth) continue;

    if (!result.has(depth)) {
      result.set(depth, []);
    }
    result.get(depth)!.push(nodes.get(id)!);

    // Get neighbors with allowed edge types
    for (const edge of edges.values()) {
      if (!allowedEdgeTypes.includes(edge.type)) continue;

      let neighborId: GraphNodeId | null = null;

      if (edge.source === id) {
        neighborId = edge.target;
      } else if (edge.target === id) {
        neighborId = edge.source;
      }

      if (neighborId && !visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push({ id: neighborId, depth: depth + 1 });
      }
    }
  }

  return result;
}

/**
 * Get traversal summary
 */
export function getTraversalSummary(
  traversalResult: Map<number, GraphNode[]>
): {
  totalNodes: number;
  maxDepth: number;
  nodesByDepth: { depth: number; count: number }[];
} {
  let totalNodes = 0;
  let maxDepth = 0;
  const nodesByDepth: { depth: number; count: number }[] = [];

  for (const [depth, nodes] of traversalResult) {
    totalNodes += nodes.length;
    maxDepth = Math.max(maxDepth, depth);
    nodesByDepth.push({ depth, count: nodes.length });
  }

  return {
    totalNodes,
    maxDepth,
    nodesByDepth,
  };
}
