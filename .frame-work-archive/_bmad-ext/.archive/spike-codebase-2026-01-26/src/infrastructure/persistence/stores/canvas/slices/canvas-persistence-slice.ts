/**
 * @fileoverview Canvas Persistence Slice
 * @module infrastructure/persistence/stores/canvas/slices/canvas-persistence-slice
 * @governance S-012-a (God Store Elimination)
 *
 * IndexedDB read/write for canvas state persistence.
 * Provides custom storage implementation for Zustand persist middleware.
 *
 * Responsibility:
 * - Save canvas state to IndexedDB
 * - Load canvas state from IndexedDB
 * - Clear canvas state from IndexedDB
 *
 * Line Count: ~90 (target: ≤120 lines)
 *
 * @see aggregation: canvas/index.ts (unified store)
 */

import { getSafeCanvasDb } from '../canvas-db';

/**
 * Custom IndexedDB storage implementation for Zustand persist middleware
 */
export const createIndexedDBStorage = () => {
  return {
    getItem: async (_name: string) => {
      try {
        const stored = localStorage.getItem('canvas-active-id');
        const activeCanvasId = stored || 'default';
        const db = getSafeCanvasDb();
        if (!db) return null;

        const state = await db.table('canvasStates').get(activeCanvasId);
        if (state) {
          return JSON.stringify({
            nodes: state.nodes,
            edges: state.edges,
            viewport: state.viewport,
            linkageProposals: state.linkageProposals || [],
          });
        }
        return null;
      } catch {
        return null;
      }
    },
    setItem: async (_name: string, value: string) => {
      try {
        const db = getSafeCanvasDb();
        if (!db) return;
        const stored = localStorage.getItem('canvas-active-id');
        const activeCanvasId = stored || 'default';
        const parsed = JSON.parse(value);

        await db.transaction('rw', 'canvasStates', 'canvases', async () => {
          await db.table('canvasStates').put({
            canvasId: activeCanvasId,
            nodes: parsed.nodes || [],
            edges: parsed.edges || [],
            viewport: parsed.viewport || { x: 0, y: 0, zoom: 1 },
            linkageProposals: parsed.linkageProposals || [],
          });

          const metadata = await db.table('canvases').get(activeCanvasId);
          if (metadata) {
            await db.table('canvases').update(activeCanvasId, {
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
    removeItem: async (_name: string) => {
      try {
        const db = getSafeCanvasDb();
        if (!db) return;
        const stored = localStorage.getItem('canvas-active-id');
        const activeCanvasId = stored || 'default';

        await db.transaction('rw', 'canvasStates', 'canvases', async () => {
          await db.table('canvasStates').delete(activeCanvasId);
          await db.table('canvases').delete(activeCanvasId);
        });
      } catch (error) {
        console.error('Failed to clear canvas state:', error);
      }
    },
  };
};