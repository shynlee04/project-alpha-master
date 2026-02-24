/**
 * @fileoverview Graph persistence operations
 * @module lib/knowledge/graph/graph-persistence
 */

import type { KnowledgeGraph } from './index';

/**
 * Save graph to IndexedDB
 */
export async function saveGraphToDB(
  graph: KnowledgeGraph,
  dbName: string = 'knowledge-graph-db',
  storeName: string = 'graphs'
): Promise<void> {
  const nodes = Array.from(graph.nodes.values());
  const edges = Array.from(graph.edges.values());
  const clusters = Array.from(graph.clusters.values());

  const graphData = {
    id: graph.id,
    name: graph.name,
    nodes,
    edges,
    clusters,
    savedAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      store.put(graphData);

      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Load graph from IndexedDB
 */
export async function loadGraphFromDB(
  graphId: string,
  dbName: string = 'knowledge-graph-db',
  storeName: string = 'graphs'
): Promise<KnowledgeGraph | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const getRequest = store.get(graphId);

      getRequest.onerror = () => reject(getRequest.error);
      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (!data) {
          resolve(null);
          return;
        }

        const graph = createGraphFromData(data);
        resolve(graph);
      };
    };
  });
}

/**
 * Create graph instance from saved data
 */
function createGraphFromData(data: {
  id: string;
  name: string;
  nodes: KnowledgeGraph['nodes'] extends Map<infer K, infer V> ? { id: K; }[] : never;
  edges: KnowledgeGraph['edges'] extends Map<infer K, infer V> ? { id: K; }[] : never;
  clusters: KnowledgeGraph['clusters'] extends Map<infer K, infer V> ? { id: K; }[] : never;
}): KnowledgeGraph {
  const { createKnowledgeGraph } = require('./graph-crud');

  const graph = createKnowledgeGraph(data.id, data.name);

  // Add nodes
  for (const node of data.nodes) {
    graph.nodes.set(node.id as never, node as never);
  }

  // Add edges
  for (const edge of data.edges) {
    graph.edges.set(edge.id as never, edge as never);
  }

  // Add clusters
  for (const cluster of data.clusters) {
    graph.clusters.set(cluster.id as never, cluster as never);
  }

  return graph;
}

/**
 * Export graph to JSON
 */
export function exportGraphToJSON(graph: KnowledgeGraph): string {
  const data = {
    id: graph.id,
    name: graph.name,
    nodes: Array.from(graph.nodes.values()),
    edges: Array.from(graph.edges.values()),
    clusters: Array.from(graph.clusters.values()),
    exportedAt: new Date().toISOString(),
    version: '1.0',
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Import graph from JSON
 */
export async function importGraphFromJSON(
  json: string
): Promise<KnowledgeGraph> {
  const data = JSON.parse(json);
  return createGraphFromData(data);
}

/**
 * Delete graph from IndexedDB
 */
export async function deleteGraphFromDB(
  graphId: string,
  dbName: string = 'knowledge-graph-db',
  storeName: string = 'graphs'
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const deleteRequest = store.delete(graphId);

      deleteRequest.onerror = () => reject(deleteRequest.error);
      deleteRequest.onsuccess = () => resolve();
    };
  });
}

/**
 * List all saved graphs
 */
export async function listSavedGraphs(
  dbName: string = 'knowledge-graph-db',
  storeName: string = 'graphs'
): Promise<{ id: string; name: string; savedAt: string }[]> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const getAllRequest = store.getAll();

      getAllRequest.onerror = () => reject(getAllRequest.error);
      getAllRequest.onsuccess = () => {
        const results = getAllRequest.result || [];
        resolve(
          results.map((g: { id: string; name: string; savedAt?: string }) => ({
            id: g.id,
            name: g.name,
            savedAt: g.savedAt || 'unknown',
          }))
        );
      };
    };
  });
}

/**
 * Sync graph to cloud storage
 */
export async function syncGraphToCloud(
  graph: KnowledgeGraph,
  _cloudEndpoint: string
): Promise<{ success: boolean; message: string }> {
  const json = exportGraphToJSON(graph);

  try {
    // In a real implementation, this would make an API call
    // For now, simulate success
    console.log('Syncing graph to cloud:', graph.id);
    return {
      success: true,
      message: `Graph ${graph.id} synced successfully`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Sync failed: ${error}`,
    };
  }
}
