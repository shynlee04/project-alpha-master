/**
 * @fileoverview Graph Persistence
 * @module lib/knowledge/graph/graph-persistence
 * @governance EPIC-38, PHASE-7
 * @ai-observable true
 *
 * Graph persistence layer for saving, loading, and exporting graph data.
 * Handles localStorage persistence with future Dexie integration planned.
 */

import type {
  KnowledgeGraph,
  GraphStatistics,
  GraphNode,
  GraphEdge,
} from '../knowledge-graph-types';

/**
 * Graph persistence record shape
 */
interface GraphPersistenceRecord {
  id: string;
  nodes: Array<{ id: string; data: GraphNode }>;
  edges: Array<{ id: string; data: GraphEdge }>;
  statistics: GraphStatistics;
  updatedAt: number;
}

/**
 * Graph Persistence Manager
 *
 * Handles graph persistence, loading, clearing, and export/import operations.
 */
export class GraphPersistence {
  private graph: KnowledgeGraph;
  private graphId: string;
  private persistenceKey: string;

  constructor(graph: KnowledgeGraph, graphId: string) {
    this.graph = graph;
    this.graphId = graphId;
    this.persistenceKey = `knowledge-graph-${graphId}`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Initialization
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Initialize empty graph structure
   */
  initializeEmptyGraph(): KnowledgeGraph {
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
  getEmptyStatistics(): GraphStatistics {
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
  // Persistence
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Persist graph to IndexedDB (currently localStorage, Dexie integration planned)
   */
  async persist(): Promise<void> {
    try {
      const record: GraphPersistenceRecord = {
        id: this.graphId,
        nodes: Array.from(this.graph.nodes.entries()).map(([id, data]) => ({
          id,
          data,
        })),
        edges: Array.from(this.graph.edges.entries()).map(([id, data]) => ({
          id,
          data,
        })),
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
      this.graph.nodes = new Map(record.nodes.map(({ id, data }) => [id, data]));
      this.graph.edges = new Map(record.edges.map(({ id, data }) => [id, data]));
      this.graph.adjacency = new Map();
      this.graph.reverseAdjacency = new Map();
      this.graph.statistics = record.statistics;
      this.graph.updatedAt = record.updatedAt;

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
  // Export/Import
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Export graph to JSON
   *
   * @returns JSON string of graph data
   */
  exportGraph(): string {
    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      graphId: this.graphId,
      nodes: Array.from(this.graph.nodes.values()),
      edges: Array.from(this.graph.edges.values()),
      statistics: this.graph.statistics,
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import graph from JSON
   *
   * @param jsonData - JSON string of graph data
   * @param options - Import options
   * @returns Import result with success status and message
   */
  importGraph(
    jsonData: string,
    options: { merge?: boolean; validate?: boolean } = {}
  ): { success: boolean; message: string; nodesImported: number; edgesImported: number } {
    try {
      const data = JSON.parse(jsonData);

      // Validate structure if requested
      if (options.validate && !this.validateImportData(data)) {
        return {
          success: false,
          message: 'Invalid import data structure',
          nodesImported: 0,
          edgesImported: 0,
        };
      }

      // Clear existing data if not merging
      if (!options.merge) {
        this.graph.nodes.clear();
        this.graph.edges.clear();
        this.graph.adjacency.clear();
        this.graph.reverseAdjacency.clear();
      }

      // Import nodes
      let nodesImported = 0;
      if (Array.isArray(data.nodes)) {
        for (const node of data.nodes) {
          this.graph.nodes.set(node.id, node);
          this.graph.adjacency.set(node.id, new Set());
          this.graph.reverseAdjacency.set(node.id, new Set());
          nodesImported++;
        }
      }

      // Import edges
      let edgesImported = 0;
      if (Array.isArray(data.edges)) {
        for (const edge of data.edges) {
          this.graph.edges.set(edge.id, edge);
          this.graph.adjacency.get(edge.sourceId)?.add(edge.targetId);
          this.graph.reverseAdjacency.get(edge.targetId)?.add(edge.sourceId);
          edgesImported++;
        }
      }

      // Import statistics if available
      if (data.statistics) {
        this.graph.statistics = data.statistics;
      }

      // Update timestamp
      this.graph.updatedAt = Date.now();

      // Persist
      this.persist();

      return {
        success: true,
        message: `Imported ${nodesImported} nodes and ${edgesImported} edges`,
        nodesImported,
        edgesImported,
      };
    } catch (error) {
      return {
        success: false,
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        nodesImported: 0,
        edgesImported: 0,
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Validation
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Validate import data structure
   */
  private validateImportData(data: any): boolean {
    // Check basic structure
    if (!data || typeof data !== 'object') return false;

    // Check nodes array
    if (data.nodes && !Array.isArray(data.nodes)) return false;

    // Check edges array
    if (data.edges && !Array.isArray(data.edges)) return false;

    // Validate node structure (sample check)
    if (Array.isArray(data.nodes) && data.nodes.length > 0) {
      const sampleNode = data.nodes[0];
      if (!sampleNode.id || !sampleNode.type) return false;
    }

    // Validate edge structure (sample check)
    if (Array.isArray(data.edges) && data.edges.length > 0) {
      const sampleEdge = data.edges[0];
      if (!sampleEdge.id || !sampleEdge.sourceId || !sampleEdge.targetId) {
        return false;
      }
    }

    return true;
  }
}
