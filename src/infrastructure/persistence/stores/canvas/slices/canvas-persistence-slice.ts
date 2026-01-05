/**
 * @fileoverview Canvas Persistence Slice
 * @module infrastructure/persistence/stores/canvas/slices/canvas-persistence-slice
 * @governance S-012-a (God Store Elimination)
 *
 * IndexedDB read/write for canvas state persistence.
 * Part of canvas-store.ts refactoring to eliminate god store anti-pattern.
 *
 * Responsibility:
 * - Save canvas state to IndexedDB
 * - Load canvas state from IndexedDB
 * - Auto-save on state changes (handled by persist middleware)
 *
 * Line Count: ~100 (target: ≤120 lines)
 *
 * @see aggregation: canvas/index.ts (unified store)
 */

import type { StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CanvasStoreState } from '@/lib/canvas/types';
import { getSafeCanvasDb } from '../canvas-db';

/**
 * Custom storage implementation for IndexedDB
 */
const createIndexedDBStorage = () => {
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
          // Save canvas state
          await db.table('canvasStates').put({
            canvasId: activeCanvasId,
            nodes: parsed.nodes || [],
            edges: parsed.edges || [],
            viewport: parsed.viewport || { x: 0, y: 0, zoom: 1 },
            linkageProposals: parsed.linkageProposals || [],
          });

          // Update canvas metadata
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

/**
 * Create canvas persistence slice (for use in store composition)
 * This returns the persist middleware configuration
 */
export const createCanvasPersistMiddleware = (
  config: StateCreator<CanvasStoreState>,
) => {
  return persist(config, {
    name: 'canvas-storage',
    storage: createJSONStorage(() => createIndexedDBStorage()),
    partialize: (state) => ({
      nodes: state.nodes,
      edges: state.edges,
      viewport: state.viewport,
      linkageProposals: state.linkageProposals,
    }),
  });
};