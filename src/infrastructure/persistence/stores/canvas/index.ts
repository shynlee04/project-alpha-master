/**
 * @fileoverview Canvas Store - Unified Facade
 * @module infrastructure/persistence/stores/canvas
 * @governance S-012-a (God Store Elimination)
 *
 * Facade exports for canvas store composed from focused slices.
 * Zero breaking changes - all consumers work without code updates.
 *
 * Architecture:
 * - Composed from 5 focused slices (each ≤120 lines)
 * - Persist middleware for IndexedDB
 * - Re-exports both useCanvasStore and useMultiCanvasStore
 *
 * Line Count: ~150 (target: ≤150 lines)
 *
 * @see slices/ directory for slice implementations
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Node, Edge, Viewport } from '@xyflow/react';
import type {
  CanvasStoreState,
  CanvasRelationshipType,
  CanvasMetadata,
  CanvasExport,
} from '@/lib/canvas/types';
import type { LinkageProposal } from '@/lib/canvas/linkage-types';

// Import slice creators
import {
  createCanvasStateSlice,
  type CanvasStateSlice,
} from './slices/canvas-state-slice';
import {
  createCanvasLinkageSlice,
  type CanvasLinkageSlice,
} from './slices/canvas-linkage-slice';
import {
  createCanvasIOSlice,
  type CanvasIOSlice,
} from './slices/canvas-io-slice';
import {
  createCanvasMultiSlice,
  type CanvasMultiSlice,
} from './slices/canvas-multi-slice';
import { createIndexedDBStorage } from './slices/canvas-persistence-slice';

/**
 * Multi-canvas store state type
 */
interface MultiCanvasState extends CanvasMultiSlice, CanvasIOSlice {
  // useMultiCanvasStore only needs activeCanvasId and canvasList + CRUD/import/export
  activeCanvasId: string | null;
  canvasList: CanvasMetadata[];
  setActiveCanvas: (canvasId: string) => Promise<void>;
  createCanvas: (name?: string) => Promise<string>;
  deleteCanvas: (canvasId: string) => Promise<void>;
  renameCanvas: (canvasId: string, name: string) => Promise<void>;
  loadCanvasList: () => Promise<void>;
  exportCanvas: () => Promise<CanvasExport>;
  importCanvas: (exportData: CanvasExport) => Promise<string>;
}

/**
 * Combined canvas store state (for internal composition)
 */
interface CombinedCanvasState
  extends CanvasStateSlice,
    CanvasLinkageSlice,
    CanvasIOSlice {}

/**
 * Create useCanvasStore with IndexedDB persistence
 */
export const useCanvasStore = create<CombinedCanvasState>()(
  persist(
    (...a) => ({
      ...createCanvasStateSlice(...a),
      ...createCanvasLinkageSlice(...a),
      ...createCanvasIOSlice(...a),
    }),
    {
      name: 'canvas-storage',
      storage: createJSONStorage(() => createIndexedDBStorage()),
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        viewport: state.viewport,
        linkageProposals: state.linkageProposals,
      }),
    },
  ),
);

/**
 * Create useMultiCanvasStore (layered on top of useCanvasStore)
 */
export const useMultiCanvasStore = create<MultiCanvasState>()((set, get) => ({
  activeCanvasId: null,
  canvasList: [],
  ...createCanvasMultiSlice(set as any, get as any),
  createCanvas: async (name?: string) => {
    const sliceIO = createCanvasIOSlice(set as any, get as any);
    const result = await sliceIO.createCanvas(name);
    set({ canvasList: get().canvasList });
    return result;
  },
  deleteCanvas: async (canvasId: string) => {
    const sliceIO = createCanvasIOSlice(set as any, get as any);
    await sliceIO.deleteCanvas(canvasId);
    set({ canvasList: get().canvasList });
  },
  renameCanvas: async (canvasId: string, name: string) => {
    const sliceIO = createCanvasIOSlice(set as any, get as any);
    await sliceIO.renameCanvas(canvasId, name);
    set({ canvasList: get().canvasList });
  },
  loadCanvasList: async () => {
    const sliceIO = createCanvasIOSlice(set as any, get as any);
    await sliceIO.loadCanvasList();
    set({ canvasList: get().canvasList || [] });
  },
  exportCanvas: async () => {
    const sliceIO = createCanvasIOSlice(set as any, get as any);
    return await sliceIO.exportCanvas();
  },
  importCanvas: async (exportData: CanvasExport) => {
    const sliceIO = createCanvasIOSlice(set as any, get as any);
    const result = await sliceIO.importCanvas(exportData);
    set({ canvasList: get().canvasList });
    return result;
  },
}));

/**
 * Persistence helper hook
 */
export const useCanvasPersistence = () => {
  const { exportCanvas } = useMultiCanvasStore();

  return {
    clearCanvas: async () => {
      useCanvasStore.getState().resetCanvas();
    },
    exportCanvas: async () => {
      return await exportCanvas();
    },
    downloadCanvas: async () => {
      const exportData = await exportCanvas();
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
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

// Re-export slice types for advanced usage
export type {
  CanvasStateSlice,
  CanvasLinkageSlice,
  CanvasIOSlice,
  CanvasMultiSlice,
};