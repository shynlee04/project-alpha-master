/**
 * @fileoverview Graph Queries and Cluster Detection
 * @module lib/knowledge/graph/graph-queries
 * @governance EPIC-38, PHASE-7
 * @ai-observable true
 *
 * Graph query methods and cluster detection algorithms.
 * Provides high-level querying and analysis capabilities.
 */

import type {
  KnowledgeGraph,
  GraphNode,
  GraphEdge,
  GraphCluster,
  GraphQueryResult,
  GraphStatistics,
  GraphQueryOptions,
  ClusterDetectionOptions,
  TraversalOptions,
} from '../knowledge-graph-types';

/**
 * Graph Queries and Cluster Detection
 *
 * Provides query methods and cluster detection for graph analysis.
 */
export class GraphQueries {
  private graph: KnowledgeGraph;
  private traversal: any; // GraphTraversal instance (will be passed)

  constructor(graph: KnowledgeGraph, traversal: any) {
    this.graph = graph;
    this.traversal = traversal;
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

      const component = this.traversal.bfs(nodeId, {
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
    const allLabels = nodes.flatMap((node) => node.labels);
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
        nodes.sort(
          (a, b) =>
            sortOrder *
            ((a.metadata?.createdAt || 0) - (b.metadata?.createdAt || 0))
        );
      } else if (options.sortBy === 'strength') {
        edges.sort((a, b) => sortOrder * (b.strength - a.strength));
      } else if (options.sortBy === 'interactionScore') {
        nodes.sort(
          (a, b) =>
            sortOrder *
            ((a.metadata?.interactionScore || 0) -
              (b.metadata?.interactionScore || 0))
        );
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
        const reachable = this.traversal.bfs(node.id, { maxDepth });
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
   * Get statistics by node type
   *
   * @param type - Node type
   * @returns Count of nodes of this type
   */
  getStatisticsByType(type: GraphNode['type']): number {
    return this.graph.statistics.nodesByType[type] || 0;
  }

  /**
   * Get connected components count
   *
   * @returns Number of connected components in the graph
   */
  getConnectedComponents(): number {
    const visited = new Set<string>();
    let components = 0;

    for (const nodeId of this.graph.nodes.keys()) {
      if (!visited.has(nodeId)) {
        const component = this.traversal.bfs(nodeId, { maxDepth: 100 });
        for (const id of component) {
          visited.add(id);
        }
        components++;
      }
    }

    return components;
  }

  /**
   * Update graph statistics
   *
   * Recalculates all graph statistics based on current nodes and edges.
   */
  updateStatistics(): void {
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
    for (const [, neighbors] of this.graph.adjacency) {
      totalDegree += neighbors.size;
    }
    const avgDegree = nodes.length > 0 ? totalDegree / nodes.length : 0;

    // Graph density
    const possibleEdges = (nodes.length * (nodes.length - 1)) / 2;
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
  // Helper Methods
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get nodes by IDs
   */
  private getNodes(nodeIds: string[]): GraphNode[] {
    return nodeIds
      .map((id) => this.graph.nodes.get(id))
      .filter((node): node is GraphNode => node !== undefined);
  }

  /**
   * Find edge between two nodes
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
