/**
 * @fileoverview Graph utility functions
 * @module lib/knowledge/graph/graph-utils
 */

import type {
  GraphNode,
  GraphEdge,
  GraphPath,
  GraphNodeId,
} from './index';

/**
 * Find shortest path between two nodes using BFS
 */
export function findShortestPath(
  nodes: Map<GraphNodeId, GraphNode>,
  edges: Map<string, GraphEdge>,
  startId: GraphNodeId,
  endId: GraphNodeId
): GraphPath | null {
  if (startId === endId) {
    return {
      nodes: [nodes.get(startId)!],
      edges: [],
    };
  }

  const queue: { id: GraphNodeId; path: GraphNodeId[] }[] = [
    { id: startId, path: [startId] },
  ];
  const visited = new Set<GraphNodeId>([startId]);

  while (queue.length > 0) {
    const { id, path } = queue.shift()!;

    // Find all edges from this node
    for (const edge of edges.values()) {
      if (edge.source !== id && edge.target !== id) continue;

      const neighborId = edge.source === id ? edge.target : edge.source;
      if (visited.has(neighborId)) continue;

      visited.add(neighborId);
      const newPath = [...path, neighborId];

      if (neighborId === endId) {
        const pathNodes = newPath.map((nodeId) => nodes.get(nodeId)!);
        const pathEdges = edges.values();

        return {
          nodes: pathNodes,
          edges: Array.from(pathEdges),
        };
      }

      queue.push({ id: neighborId, path: newPath });
    }
  }

  return null;
}

/**
 * Get all neighbors of a node
 */
export function getNeighbors(
  nodeId: GraphNodeId,
  edges: Map<string, GraphEdge>
): GraphNodeId[] {
  const neighbors: GraphNodeId[] = [];

  for (const edge of edges.values()) {
    if (edge.source === nodeId) {
      neighbors.push(edge.target);
    } else if (edge.target === nodeId) {
      neighbors.push(edge.source);
    }
  }

  return neighbors;
}

/**
 * Calculate node degree (number of connections)
 */
export function getNodeDegree(
  nodeId: GraphNodeId,
  edges: Map<string, GraphEdge>
): number {
  let degree = 0;

  for (const edge of edges.values()) {
    if (edge.source === nodeId || edge.target === nodeId) {
      degree += 1;
    }
  }

  return degree;
}

/**
 * Check if graph is connected
 */
export function isGraphConnected(
  nodes: Map<GraphNodeId, GraphNode>,
  edges: Map<string, GraphEdge>
): boolean {
  if (nodes.size === 0) return true;

  // Start BFS from first node
  const startNodeId = nodes.keys().next().value;
  const visited = new Set<GraphNodeId>();
  const queue: GraphNodeId[] = [startNodeId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;

    visited.add(currentId);

    // Add all neighbors to queue
    for (const edge of edges.values()) {
      if (edge.source === currentId && !visited.has(edge.target)) {
        queue.push(edge.target);
      } else if (edge.target === currentId && !visited.has(edge.source)) {
        queue.push(edge.source);
      }
    }
  }

  return visited.size === nodes.size;
}

/**
 * Find all cycles in the graph
 */
export function findCycles(
  nodes: Map<GraphNodeId, GraphNode>,
  edges: Map<string, GraphEdge>
): GraphPath[] {
  const cycles: GraphPath[] = [];

  // Simple DFS-based cycle detection
  const visited = new Set<string>();
  const cyclesSet = new Set<string>();

  function dfs(
    currentId: GraphNodeId,
    path: GraphNodeId[],
    startNodeId: GraphNodeId
  ): void {
    visited.add(`${startNodeId}-${currentId}`);

    const neighbors = getNeighbors(currentId, edges);

    for (const neighborId of neighbors) {
      if (neighborId === startNodeId && path.length > 2) {
        // Found a cycle
        const cyclePath = [...path, startNodeId];
        const cycleKey = cyclePath.slice(0, -1).join('-');

        if (!cyclesSet.has(cycleKey)) {
          cyclesSet.add(cycleKey);
          cycles.push({
            nodes: cyclePath.map((id) => nodes.get(id)!),
            edges: [],
          });
        }
      } else if (!path.includes(neighborId)) {
        dfs(neighborId, [...path, neighborId], startNodeId);
      }
    }
  }

  for (const nodeId of nodes.keys()) {
    dfs(nodeId, [nodeId], nodeId);
  }

  return cycles;
}

/**
 * Get strongly connected components (for directed graphs)
 */
export function getStronglyConnectedComponents(
  nodes: Map<GraphNodeId, GraphNode>,
  edges: Map<string, GraphEdge>
): GraphNodeId[][] {
  // Kosaraju's algorithm
  const visited = new Set<GraphNodeId>();
  const order: GraphNodeId[] = [];

  // First pass: get finishing times
  function dfs1(nodeId: GraphNodeId): void {
    visited.add(nodeId);

    for (const edge of edges.values()) {
      if (edge.source === nodeId) {
        if (!visited.has(edge.target)) {
          dfs1(edge.target);
        }
      }
    }

    order.push(nodeId);
  }

  for (const nodeId of nodes.keys()) {
    if (!visited.has(nodeId)) {
      dfs1(nodeId);
    }
  }

  // Second pass: get components in reverse order
  const reversedEdges = new Map<string, GraphEdge>();
  for (const edge of edges.values()) {
    reversedEdges.set(`${edge.target}-${edge.source}`, {
      ...edge,
      source: edge.target,
      target: edge.source,
    });
  }

  const components: GraphNodeId[][] = [];
  const visited2 = new Set<GraphNodeId>();

  function dfs2(nodeId: GraphNodeId, component: GraphNodeId[]): void {
    visited2.add(nodeId);
    component.push(nodeId);

    for (const edge of reversedEdges.values()) {
      if (edge.source === nodeId && !visited2.has(edge.target)) {
        dfs2(edge.target, component);
      }
    }
  }

  for (let i = order.length - 1; i >= 0; i -= 1) {
    const nodeId = order[i];
    if (!visited2.has(nodeId)) {
      const component: GraphNodeId[] = [];
      dfs2(nodeId, component);
      components.push(component);
    }
  }

  return components;
}

/**
 * Serialize graph to JSON
 */
export function serializeGraph(
  nodes: Map<GraphNodeId, GraphNode>,
  edges: Map<string, GraphEdge>
): string {
  return JSON.stringify({
    nodes: Array.from(nodes.values()),
    edges: Array.from(edges.values()),
  }, null, 2);
}

/**
 * Deserialize graph from JSON
 */
export function deserializeGraph(
  json: string,
  nodes: Map<GraphNodeId, GraphNode>,
  edges: Map<string, GraphEdge>
): void {
  const data = JSON.parse(json);

  for (const node of data.nodes) {
    nodes.set(node.id, node);
  }

  for (const edge of data.edges) {
    edges.set(edge.id, edge);
  }
}
