import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Dexie from 'dexie';
import { applyNodeChanges, applyEdgeChanges, addEdge as rfAddEdge } from '@xyflow/react';
import type { Node, Edge, Viewport } from '@xyflow/react';
import type { CanvasStoreState, CanvasNodeData, CanvasEdgeData, CanvasRelationshipType, CanvasMetadata, CanvasExport } from '../canvas/types';

// ============================================================
// IndexedDB database for canvas persistence
// ============================================================

interface CanvasStateRecord {
  canvasId: string;
  nodes: Node<any>[];
  edges: Edge<any>[];
  viewport: Viewport;
}

interface CanvasMetadataRecord {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  nodeCount: number;
  edgeCount: number;
}

class KnowledgeCanvasDB extends Dexie {
  canvases!: Dexie.Table<CanvasMetadataRecord, string>;
  canvasStates!: Dexie.Table<CanvasStateRecord, string>;

  constructor() {
    super('KnowledgeCanvasDB');
    this.version(2).stores({
      canvases: 'id, name, updatedAt',
      canvasStates: 'canvasId',
    });
  }
}

const canvasDb = new KnowledgeCanvasDB();

/**
 * Generate a unique canvas ID
 */
function generateCanvasId(): string {
  return `canvas-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================
// Canvas Store with Persistence
// ============================================================

export const useCanvasStore = create<CanvasStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      isReadOnly: false,

      // Node operations with React Flow change handlers
      setNodes: (nodes: Node<any>[]) => {
        set({ nodes });
      },

      onNodesChange: (changes) => {
        const { nodes } = get();
        const newNodes = applyNodeChanges(changes, nodes) as Node<any>[];
        set({ nodes: newNodes });
      },

      // Edge operations with React Flow change handlers
      setEdges: (edges: Edge<any>[]) => {
        set({ edges });
      },

      onEdgesChange: (changes) => {
        const { edges } = get();
        const newEdges = applyEdgeChanges(changes, edges) as Edge<any>[];
        set({ edges: newEdges });
      },

      // Connection handler - creates relationship edges
      onConnect: (connection) => {
        const { edges } = get();
        const newEdge = rfAddEdge(
          {
            ...connection,
            type: 'relationship',
            animated: true,
          },
          edges,
        );
        // rfAddEdge can return single Edge or Edge[] depending on connection
        const edgeArray = Array.isArray(newEdge) ? newEdge : [newEdge];
        set({ edges: [...edges, ...edgeArray] as Edge<any>[] });
      },

      // Add edge with specific relationship type
      addEdgeWithRelationship: (connection: { source: string; target: string }, relationship: CanvasRelationshipType) => {
        const { edges } = get();
        const newEdge: Edge<any> = {
          id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
          source: connection.source,
          target: connection.target,
          type: 'relationship',
          data: { relationship },
          animated: true,
        };
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
      addNode: (node: Node<any>) => {
        const { nodes } = get();
        set({ nodes: [...nodes, node] });
      },

      removeNode: (nodeId: string) => {
        const { nodes } = get();
        set({ nodes: nodes.filter((n) => n.id !== nodeId) });
      },

      addEdge: (edge: Edge<any>) => {
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
      name: 'canvas-storage',
      storage: createJSONStorage(() => ({
        getItem: async (name: string) => {
          try {
            // Get the active canvas from localStorage or default to 'default'
            const stored = localStorage.getItem('canvas-active-id');
            const activeCanvasId = stored || 'default';

            const state = await canvasDb.table('canvasStates').get(activeCanvasId);
            if (state) {
              return JSON.stringify({
                nodes: state.nodes,
                edges: state.edges,
                viewport: state.viewport,
              });
            }
            return null;
          } catch {
            return null;
          }
        },
        setItem: async (name: string, value: string) => {
          try {
            const stored = localStorage.getItem('canvas-active-id');
            const activeCanvasId = stored || 'default';
            const parsed = JSON.parse(value);

            await canvasDb.transaction('rw', 'canvasStates', 'canvases', async () => {
              // Save canvas state
              await canvasDb.table('canvasStates').put({
                canvasId: activeCanvasId,
                nodes: parsed.nodes || [],
                edges: parsed.edges || [],
                viewport: parsed.viewport || { x: 0, y: 0, zoom: 1 },
              });

              // Update canvas metadata
              const metadata = await canvasDb.table('canvases').get(activeCanvasId);
              if (metadata) {
                await canvasDb.table('canvases').update(activeCanvasId, {
                  updatedAt: Date.now(),
                  nodeCount: parsed.nodes?.length || 0,
                  edgeCount: parsed.edges?.length || 0,
                });
              }
            });
          } catch (error) {
            console.error('Failed to persist canvas state:', error);
          }
        },
        removeItem: async (name: string) => {
          try {
            const stored = localStorage.getItem('canvas-active-id');
            const activeCanvasId = stored || 'default';

            await canvasDb.transaction('rw', 'canvasStates', 'canvases', async () => {
              await canvasDb.table('canvasStates').delete(activeCanvasId);
              await canvasDb.table('canvases').delete(activeCanvasId);
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

// ============================================================
// Multi-Canvas Management Store
// ============================================================

interface MultiCanvasStoreState {
  activeCanvasId: string | null;
  canvasList: CanvasMetadata[];

  // Actions
  setActiveCanvas: (canvasId: string) => Promise<void>;
  createCanvas: (name?: string) => Promise<string>;
  deleteCanvas: (canvasId: string) => Promise<void>;
  renameCanvas: (canvasId: string, name: string) => Promise<void>;
  loadCanvasList: () => Promise<void>;
  exportCanvas: () => Promise<CanvasExport>;
  importCanvas: (exportData: CanvasExport) => Promise<string>;
}

export const useMultiCanvasStore = create<MultiCanvasStoreState>((set, get) => ({
  activeCanvasId: null,
  canvasList: [],

  setActiveCanvas: async (canvasId: string) => {
    // Save current canvas state before switching
    const currentState = useCanvasStore.getState();
    try {
      await canvasDb.transaction('rw', 'canvasStates', 'canvases', async () => {
        const stored = localStorage.getItem('canvas-active-id');
        const activeCanvasId = stored || 'default';

        await canvasDb.table('canvasStates').put({
          canvasId: activeCanvasId,
          nodes: currentState.nodes,
          edges: currentState.edges,
          viewport: currentState.viewport,
        });

        const metadata = await canvasDb.table('canvases').get(activeCanvasId);
        if (metadata) {
          await canvasDb.table('canvases').update(activeCanvasId, {
            updatedAt: Date.now(),
            nodeCount: currentState.nodes.length,
            edgeCount: currentState.edges.length,
          });
        }
      });
    } catch (error) {
      console.error('Failed to save current canvas:', error);
    }

    // Switch to new canvas
    localStorage.setItem('canvas-active-id', canvasId);
    set({ activeCanvasId: canvasId });

    // Load new canvas state
    try {
      const state = await canvasDb.table('canvasStates').get(canvasId);
      if (state) {
        useCanvasStore.setState({
          nodes: state.nodes,
          edges: state.edges,
          viewport: state.viewport,
        });
      } else {
        useCanvasStore.setState({
          nodes: [],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        });
      }
    } catch (error) {
      console.error('Failed to load canvas:', error);
    }

    // Refresh canvas list
    await get().loadCanvasList();
  },

  createCanvas: async (name?: string) => {
    const canvasId = generateCanvasId();
    const canvasName = name || `Canvas ${Date.now()}`;
    const now = Date.now();

    await canvasDb.transaction('rw', 'canvases', 'canvasStates', async () => {
      await canvasDb.table('canvases').add({
        id: canvasId,
        name: canvasName,
        createdAt: now,
        updatedAt: now,
        nodeCount: 0,
        edgeCount: 0,
      });

      await canvasDb.table('canvasStates').add({
        canvasId,
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
      });
    });

    await get().loadCanvasList();
    return canvasId;
  },

  deleteCanvas: async (canvasId: string) => {
    if (canvasId === 'default') {
      throw new Error('Cannot delete the default canvas');
    }

    await canvasDb.transaction('rw', 'canvases', 'canvasStates', async () => {
      await canvasDb.table('canvases').delete(canvasId);
      await canvasDb.table('canvasStates').delete(canvasId);
    });

    // If deleting active canvas, switch to default
    const stored = localStorage.getItem('canvas-active-id');
    if (stored === canvasId) {
      localStorage.removeItem('canvas-active-id');
      set({ activeCanvasId: null });
      useCanvasStore.setState({
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
      });
    }

    await get().loadCanvasList();
  },

  renameCanvas: async (canvasId: string, name: string) => {
    await canvasDb.table('canvases').update(canvasId, {
      name,
      updatedAt: Date.now(),
    });
    await get().loadCanvasList();
  },

  loadCanvasList: async () => {
    try {
      const canvases = await canvasDb.table('canvases').toArray();
      set({ canvasList: canvases });
    } catch (error) {
      console.error('Failed to load canvas list:', error);
      set({ canvasList: [] });
    }
  },

  exportCanvas: async () => {
    const state = useCanvasStore.getState();
    const stored = localStorage.getItem('canvas-active-id');
    const activeCanvasId = stored || 'default';

    const metadata = await canvasDb.table('canvases').get(activeCanvasId);

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      canvas: {
        id: activeCanvasId,
        name: metadata?.name || 'Untitled',
        nodes: state.nodes,
        edges: state.edges,
        viewport: state.viewport,
      },
    };
  },

  importCanvas: async (exportData: CanvasExport) => {
    const canvasId = generateCanvasId();
    const now = Date.now();

    await canvasDb.transaction('rw', 'canvases', 'canvasStates', async () => {
      await canvasDb.table('canvases').add({
        id: canvasId,
        name: `${exportData.canvas.name} (Imported)`,
        createdAt: now,
        updatedAt: now,
        nodeCount: exportData.canvas.nodes.length,
        edgeCount: exportData.canvas.edges.length,
      });

      await canvasDb.table('canvasStates').add({
        canvasId,
        nodes: exportData.canvas.nodes,
        edges: exportData.canvas.edges,
        viewport: exportData.canvas.viewport,
      });
    });

    await get().loadCanvasList();
    return canvasId;
  },
}));

// ============================================================
// Persistence API Hook
// ============================================================

export const useCanvasPersistence = () => {
  const { exportCanvas } = useMultiCanvasStore();

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
      return await exportCanvas();
    },

    downloadCanvas: async () => {
      const exportData = await exportCanvas();
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportData.canvas.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  };
};

// ============================================================
// Initialize default canvas if needed
// ============================================================

async function initializeDefaultCanvas() {
  try {
    const existing = await canvasDb.table('canvases').get('default');
    if (!existing) {
      await canvasDb.transaction('rw', 'canvases', 'canvasStates', async () => {
        await canvasDb.table('canvases').add({
          id: 'default',
          name: 'My First Canvas',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          nodeCount: 0,
          edgeCount: 0,
        });

        await canvasDb.table('canvasStates').add({
          canvasId: 'default',
          nodes: [],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        });
      });
    }
  } catch (error) {
    console.error('Failed to initialize default canvas:', error);
  }
}

// Initialize on module load
initializeDefaultCanvas();
