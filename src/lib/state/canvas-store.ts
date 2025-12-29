import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Dexie from 'dexie';
import { applyNodeChanges, applyEdgeChanges, addEdge as rfAddEdge } from '@xyflow/react';
import type { Node, Edge, Viewport, OnNodesChange, OnEdgesChange, OnConnect } from '@xyflow/react';
import type { CanvasStoreState, CanvasNodeData, CanvasEdgeData } from '../canvas/types';

// IndexedDB database for canvas persistence
const canvasDb = new Dexie('KnowledgeCanvasDB');
canvasDb.version(1).stores({
  nodes: 'id, type',
  edges: 'id, source, target',
  viewport: 'key',
});

/**
 * Zustand store for Knowledge Canvas state with Dexie persistence
 */
export const useCanvasStore = create<CanvasStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      isReadOnly: false,

      // Node operations with React Flow change handlers
      setNodes: (nodes: Node<CanvasNodeData>[]) => {
        set({ nodes });
      },

      onNodesChange: (changes) => {
        const { nodes } = get();
        const newNodes = applyNodeChanges(changes, nodes) as Node<CanvasNodeData>[];
        set({ nodes: newNodes });
      },

      // Edge operations with React Flow change handlers
      setEdges: (edges: Edge<CanvasEdgeData>[]) => {
        set({ edges });
      },

      onEdgesChange: (changes) => {
        const { edges } = get();
        const newEdges = applyEdgeChanges(changes, edges) as Edge<CanvasEdgeData>[];
        set({ edges: newEdges });
      },

      // Connection handler
      onConnect: (connection) => {
        const { edges } = get();
        const newEdge = rfAddEdge(connection, edges) as Edge<CanvasEdgeData>;
        set({ edges: [...edges, newEdge] });
      },

      // Viewport operations
      setViewport: (viewport: Viewport) => {
        set({ viewport });
      },

      // Read-only mode
      setReadOnly: (readOnly: boolean) => {
        set({ isReadOnly: readOnly });
      },

      // Bulk operations
      addNode: (node: Node<CanvasNodeData>) => {
        const { nodes } = get();
        set({ nodes: [...nodes, node] });
      },

      removeNode: (nodeId: string) => {
        const { nodes } = get();
        set({ nodes: nodes.filter((n) => n.id !== nodeId) });
      },

      addEdge: (edge: Edge<CanvasEdgeData>) => {
        const { edges } = get();
        set({ edges: [...edges, edge] });
      },

      removeEdge: (edgeId: string) => {
        const { edges } = get();
        set({ edges: edges.filter((e) => e.id !== edgeId) });
      },

      resetCanvas: () => {
        set({
          nodes: [],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        });
      },
    }),
    {
      name: 'canvas-store',
      storage: createJSONStorage(() => ({
        getItem: async (name: string) => {
          try {
            const nodes = await canvasDb.table('nodes').toArray();
            const edges = await canvasDb.table('edges').toArray();
            const viewport = await canvasDb.table('viewport').get('main');
            return JSON.stringify({
              nodes,
              edges,
              viewport: viewport?.value,
            });
          } catch {
            return null;
          }
        },
        setItem: async (name: string, value: string) => {
          try {
            const parsed = JSON.parse(value);
            await canvasDb.transaction('rw', 'nodes', 'edges', 'viewport', async () => {
              await canvasDb.table('nodes').clear();
              await canvasDb.table('edges').clear();
              await canvasDb.table('viewport').clear();

              if (parsed.nodes?.length) {
                await canvasDb.table('nodes').bulkAdd(parsed.nodes);
              }
              if (parsed.edges?.length) {
                await canvasDb.table('edges').bulkAdd(parsed.edges);
              }
              if (parsed.viewport) {
                await canvasDb.table('viewport').put({ key: 'main', value: parsed.viewport });
              }
            });
          } catch (error) {
            console.error('Failed to persist canvas state:', error);
          }
        },
        removeItem: async (name: string) => {
          try {
            await canvasDb.transaction('rw', 'nodes', 'edges', 'viewport', async () => {
              await canvasDb.table('nodes').clear();
              await canvasDb.table('edges').clear();
              await canvasDb.table('viewport').clear();
            });
          } catch (error) {
            console.error('Failed to clear canvas state:', error);
          }
        },
      })),
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        viewport: state.viewport,
      }),
    },
  ),
);

/**
 * Hook to get canvas store persistence API
 */
export const useCanvasPersistence = () => {
  return {
    clearCanvas: async () => {
      await canvasDb.transaction('rw', 'nodes', 'edges', 'viewport', async () => {
        await canvasDb.table('nodes').clear();
        await canvasDb.table('edges').clear();
        await canvasDb.table('viewport').clear();
      });
      useCanvasStore.getState().resetCanvas();
    },
    exportCanvas: async () => {
      const nodes = await canvasDb.table('nodes').toArray();
      const edges = await canvasDb.table('edges').toArray();
      return { nodes, edges };
    },
  };
};
