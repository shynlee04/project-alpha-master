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
import type { CanvasMetadata, CanvasExport } from '@/lib/canvas/types';

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
 * Multi-canvas store state type (with wrapped setActiveCanvas)
 */
type MultiCanvasState = Omit<CanvasMultiSlice, 'setActiveCanvas'> & CanvasIOSlice & {
  setActiveCanvas: (canvasId: string) => Promise<void>;
};

/**
 * Combined canvas store state (for internal composition)
 */
type CombinedCanvasState = CanvasStateSlice & CanvasLinkageSlice & CanvasIOSlice;

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
 *
 * Wraps setActiveCanvas to inject canvasStore, breaking circular dependency.
 */
export const useMultiCanvasStore = create<MultiCanvasState>((set, get, api) => {
  const multiSlice = createCanvasMultiSlice(set, get, api);
  const ioSlice = createCanvasIOSlice(set, get, api);

  return {
    ...multiSlice,
    ...ioSlice,
    // Wrap setActiveCanvas to inject canvasStore automatically
    setActiveCanvas: (canvasId: string) => {
      return multiSlice.setActiveCanvas(canvasId, {
        getState: useCanvasStore.getState,
        setState: useCanvasStore.setState,
      });
    },
  };
});

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