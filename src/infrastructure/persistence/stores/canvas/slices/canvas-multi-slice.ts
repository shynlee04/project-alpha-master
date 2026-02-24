/**
 * @fileoverview Multi-Canvas Management Slice
 * @module infrastructure/persistence/stores/canvas/slices/canvas-multi-slice
 * @governance S-012-a (God Store Elimination)
 *
 * Multi-canvas switching and active canvas management.
 * Part of canvas-store.ts refactoring to eliminate god store anti-pattern.
 *
 * Responsibility:
 * - Switch between canvases
 * - Save current canvas before switching
 * - Load new canvas state
 * - Update active canvas ID in localStorage
 *
 * Line Count: ~100 (target: ≤120 lines)
 *
 * @see aggregation: canvas/index.ts (unified store)
 */

import { getSafeCanvasDb } from '../canvas-db';
import type { CanvasStoreApi } from '../canvas-types';

/**
 * Multi-canvas management slice interface
 */
export interface CanvasMultiSlice {
  activeCanvasId: string | null;
  setActiveCanvas: (canvasId: string, canvasStore: CanvasStoreApi) => Promise<void>;
}

/**
 * Multi-canvas slice creator
 */
export const createCanvasMultiSlice = (set: any, get: any, _api?: any) => ({
  activeCanvasId: null,

  setActiveCanvas: async (canvasId: string, canvasStore: CanvasStoreApi) => {
    const db = getSafeCanvasDb();
    if (!db) return;

    // Use injected canvasStore to avoid circular dependency
    const getCanvasState = canvasStore.getState;
    const setCanvasState = canvasStore.setState;

    // Save current canvas state before switching
    const currentState = getCanvasState();
    try {
      await db.transaction('rw', 'canvasStates', 'canvases', async () => {
        const stored = localStorage.getItem('canvas-active-id');
        const activeCanvasId = stored || 'default';

        await db.table('canvasStates').put({
          canvasId: activeCanvasId,
          nodes: currentState.nodes,
          edges: currentState.edges,
          viewport: currentState.viewport,
          linkageProposals: currentState.linkageProposals,
        });

        const metadata = await db.table('canvases').get(activeCanvasId);
        if (metadata) {
          await db.table('canvases').update(activeCanvasId, {
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
      const state = await db.table('canvasStates').get(canvasId);
      if (state) {
        setCanvasState({
          nodes: state.nodes,
          edges: state.edges,
          viewport: state.viewport,
          linkageProposals: state.linkageProposals || [],
        });
      } else {
        setCanvasState({
          nodes: [],
          edges: [],
          linkageProposals: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        });
      }
    } catch (error) {
      console.error('Failed to load canvas:', error);
    }

    // Refresh canvas list if method exists
    get().loadCanvasList?.();
  },
});