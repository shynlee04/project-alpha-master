/**
 * @fileoverview Graph query operations
 * @module lib/knowledge/graph/graph-queries
 */

import type {
  GraphNode,
  GraphEdge,
  GraphQueryResult,
  GraphNodeId,
  GraphQueryOptions,
} from './index';

/**
 * Query nodes by type
 */
export function queryByType(
  nodes: Map<GraphNodeId, GraphNode>,
  types: string[]
): GraphNode[] {
  return Array.from(nodes.values()).filter((node) =>
    types.includes(node.type)
  );
}

/**
 * Query nodes by label (text search)
 */
export function queryByLabel(
  nodes: Map<GraphNodeId, GraphNode>,
  searchTerm: string
): GraphNode[] {
  const term = searchTerm.toLowerCase();
  return Array.from(nodes.values()).filter((node) =>
    node.label.toLowerCase().includes(term)
  );
}

/**
 * Query connected nodes
 */
export function queryConnected(
  nodes: Map<GraphNodeId, GraphNode>,
  edges: Map<string, GraphEdge>,
  nodeId: GraphNodeId
): GraphNode[] {
  const connectedIds = new Set<GraphNodeId>();

  for (const edge of edges.values()) {
    if (edge.source === nodeId) {
      connectedIds.add(edge.target);
    } else if (edge.target === nodeId) {
      connectedIds.add(edge.source);
    }
  }

  return Array.from(nodes.values()).filter((node) =>
    connectedIds.has(node.id)
  );
}

/**
 * Query nodes by property value
 */
export function queryByProperty(
  nodes: Map<GraphNodeId, GraphNode>,
  propertyName: string,
  propertyValue: unknown
): GraphNode[] {
  return Array.from(nodes.values()).filter((node) => {
    const value = node.properties[propertyName];
    if (value === undefined) return false;
    if (Array.isArray(value)) {
      return value.includes(propertyValue);
    }
    return value === propertyValue;
  });
}

/**
 * Execute complex query
 */
export function executeQuery(
  nodes: Map<GraphNodeId, GraphNode>,
  edges: Map<string, GraphEdge>,
  options: GraphQueryOptions
): GraphQueryResult {
  let resultNodes = Array.from(nodes.values());
  let resultEdges = Array.from(edges.values());

  // Filter by node types
  if (options.nodeTypes?.length) {
    resultNodes = resultNodes.filter((node) =>
      options.nodeTypes!.includes(node.type)
    );
  }

  // Filter by edge types
  if (options.edgeTypes?.length) {
    resultEdges = resultEdges.filter((edge) =>
      options.edgeTypes!.includes(edge.type)
    );
  }

  // Text search
  if (options.searchTerm) {
    const term = options.searchTerm.toLowerCase();
    resultNodes = resultNodes.filter(
      (node) =>
        node.label.toLowerCase().includes(term) ||
        JSON.stringify(node.properties).toLowerCase().includes(term)
    );
  }

  // Filter by connected nodes
  if (options.connectedTo) {
    const connectedIds = new Set<GraphNodeId>();
    for (const edge of edges.values()) {
      if (edge.source === options.connectedTo) {
        connectedIds.add(edge.target);
      } else if (edge.target === options.connectedTo) {
        connectedIds.add(edge.source);
      }
    }
    resultNodes = resultNodes.filter((node) => connectedIds.has(node.id));
  }

  // Filter by related nodes
  if (options.relatedTo) {
    const relatedIds = new Set<GraphNodeId>();
    for (const edge of edges.values()) {
      if (edge.source === options.relatedTo) {
        relatedIds.add(edge.target);
      } else if (edge.target === options.relatedTo) {
        relatedIds.add(edge.source);
      }
    }
    resultNodes = resultNodes.filter((node) => relatedIds.has(node.id));
  }

  // Apply limit
  if (options.limit) {
    resultNodes = resultNodes.slice(0, options.limit);
    resultEdges = resultEdges.slice(0, options.limit * 2);
  }

  const startTime = Date.now();

  // Detect clusters if requested
  let clusters: { id: string; label: string; nodeIds: GraphNodeId[] }[] = [];
  if (options.includeClusters) {
    clusters = detectClustersSimple(resultNodes, edges);
  }

  // Find paths if requested
  let paths: GraphPath[] = [];
  if (options.includePaths && resultNodes.length >= 2) {
    paths = findPathsBetweenAll(resultNodes, edges);
  }

  return {
    nodes: resultNodes,
    edges: resultEdges,
    clusters: clusters.map((c) => ({
      ...c,
      metadata: {
        density: 0,
        coherence: 0,
      },
    })),
    paths,
    metadata: {
      queryTime: Date.now() - startTime,
      totalNodesFound: resultNodes.length,
    },
  };
}

/**
 * Simple cluster detection
 */
function detectClustersSimple(
  nodes: GraphNode[],
  edges: Map<string, GraphEdge>
): { id: string; label: string; nodeIds: GraphNodeId[] }[] {
  const visited = new Set<string>();
  const clusters: { id: string; label: string; nodeIds: GraphNodeId[] }[] = [];

  for (const node of nodes) {
    if (visited.has(node.id)) continue;

    const cluster = {
      id: `cluster-${clusters.length}`,
      label: `Cluster ${clusters.length + 1}`,
      nodeIds: [] as GraphNodeId[],
    };

    const queue = [node.id];
    visited.add(node.id);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      cluster.nodeIds.push(currentId);

      for (const edge of edges.values()) {
        let neighborId: string | null = null;
        if (edge.source === currentId) {
          neighborId = edge.target;
        } else if (edge.target === currentId) {
          neighborId = edge.source;
        }

        if (
          neighborId &&
          !visited.has(neighborId) &&
          nodes.some((n) => n.id === neighborId)
        ) {
          visited.add(neighborId);
          queue.push(neighborId);
        }
      }
    }

    if (cluster.nodeIds.length >= 2) {
      clusters.push(cluster);
    }
  }

  return clusters;
}

/**
 * Find paths between all nodes
 */
function findPathsBetweenAll(
  nodes: GraphNode[],
  edges: Map<string, GraphEdge>
): GraphPath[] {
  const paths: GraphPath[] = [];

  for (let i = 0; i < Math.min(nodes.length, 5); i += 1) {
    for (let j = i + 1; j < Math.min(nodes.length, 5); j += 1) {
      const path = findShortestPathSimple(
        nodes,
        edges,
        nodes[i].id,
        nodes[j].id
      );
      if (path) {
        paths.push(path);
      }
    }
  }

  return paths;
}

/**
 * Find shortest path (simple version)
 */
function findShortestPathSimple(
  nodes: Map<GraphNodeId, GraphNode>,
  edges: Map<string, GraphEdge>,
  startId: GraphNodeId,
  endId: GraphNodeId
): GraphPath | null {
  if (startId === endId) {
    return { nodes: [nodes.get(startId)!], edges: [] };
  }

  const queue: { id: GraphNodeId; path: GraphNodeId[] }[] = [
    { id: startId, path: [startId] },
  ];
  const visited = new Set<GraphNodeId>([startId]);

  while (queue.length > 0) {
    const { id, path } = queue.shift()!;

    for (const edge of edges.values()) {
      let neighborId: GraphNodeId | null = null;
      if (edge.source === id) {
        neighborId = edge.target;
      } else if (edge.target === id) {
        neighborId = edge.source;
      }

      if (neighborId && !visited.has(neighborId)) {
        visited.add(neighborId);
        const newPath = [...path, neighborId];

        if (neighborId === endId) {
          return {
            nodes: newPath.map((nid) => nodes.get(nid)!),
            edges: [],
          };
        }

        queue.push({ id: neighborId, path: newPath });
      }
    }
  }

  return null;
}
