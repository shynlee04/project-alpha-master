/**
 * @fileoverview Canvas and Import/Export Operations Slice
 * @module infrastructure/persistence/stores/canvas/slices/canvas-io-slice
 * @governance S-012-a (God Store Elimination)
 *
 * Canvas CRUD operations (create/delete/rename) and import/export.
 * Part of canvas-store.ts refactoring to eliminate god store anti-pattern.
 *
 * Responsibility:
 * - Create/delete/rename canvases
 * - Export canvas data to JSON
 * - Import canvas data from JSON
 * - Load canvas list from IndexedDB
 *
 * Line Count: ~100 (target: ≤120 lines)
 *
 * @see aggregation: canvas/index.ts (unified store)
 */

import type { StateCreator } from 'zustand';
import type { CanvasMetadata, CanvasExport } from '@/lib/canvas/types';
import { getCanvasDb } from '../canvas-db';
import { getSafeCanvasDb } from '../canvas-db';
import { generateCanvasId } from '../canvas-utils';

/**
 * Canvas IO slice interface
 */
export interface CanvasIOSlice {
  canvasList: CanvasMetadata[];

  // CRUD operations
  createCanvas: (name?: string) => Promise<string>;
  deleteCanvas: (canvasId: string) => Promise<void>;
  renameCanvas: (canvasId: string, name: string) => Promise<void>;
  loadCanvasList: () => Promise<void>;

  // Import/Export
  exportCanvas: () => Promise<CanvasExport>;
  importCanvas: (exportData: CanvasExport) => Promise<string>;
}

/**
 * Canvas IO slice creator
 */
export const createCanvasIOSlice: StateCreator<CanvasIOSlice> = (set, get) => ({
  canvasList: [],

  createCanvas: async (name?: string) => {
    const db = getSafeCanvasDb();
    if (!db) throw new Error('Database not available');
    const canvasId = generateCanvasId();
    const canvasName = name || `Canvas ${Date.now()}`;
    const now = Date.now();

    await db.transaction('rw', 'canvases', 'canvasStates', async () => {
      await db.table('canvases').add({
        id: canvasId,
        name: canvasName,
        createdAt: now,
        updatedAt: now,
        nodeCount: 0,
        edgeCount: 0,
      });

      await db.table('canvasStates').add({
        canvasId,
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        linkageProposals: [],
      });
    });

    await get().loadCanvasList();
    return canvasId;
  },

  deleteCanvas: async (canvasId: string) => {
    const db = getSafeCanvasDb();
    if (!db) throw new Error('Database not available');
    if (canvasId === 'default') {
      throw new Error('Cannot delete the default canvas');
    }

    await db.transaction('rw', 'canvases', 'canvasStates', async () => {
      await db.table('canvases').delete(canvasId);
      await db.table('canvasStates').delete(canvasId);
    });

    await get().loadCanvasList();
  },

  renameCanvas: async (canvasId: string, name: string) => {
    const db = getSafeCanvasDb();
    if (!db) throw new Error('Database not available');
    await db.table('canvases').update(canvasId, { name, updatedAt: Date.now() });
    await get().loadCanvasList();
  },

  loadCanvasList: async () => {
    try {
      const db = getSafeCanvasDb();
      if (!db) {
        set({ canvasList: [] });
        return;
      }
      const canvases = await db.table('canvases').toArray();
      set({ canvasList: canvases });
    } catch (error) {
      console.error('Failed to load canvas list:', error);
      set({ canvasList: [] });
    }
  },

  exportCanvas: async () => {
    const db = getSafeCanvasDb();
    if (!db) throw new Error('Database not available');
    const stored = localStorage.getItem('canvas-active-id');
    const activeCanvasId = stored || 'default';

    const metadata = await db.table('canvases').get(activeCanvasId);

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      canvas: {
        id: activeCanvasId,
        name: metadata?.name || 'Untitled',
      },
    };
  },

  importCanvas: async (exportData: CanvasExport) => {
    const db = getSafeCanvasDb();
    if (!db) throw new Error('Database not available');
    const canvasId = generateCanvasId();
    const now = Date.now();

    await db.transaction('rw', 'canvases', 'canvasStates', async () => {
      await db.table('canvases').add({
        id: canvasId,
        name: `${exportData.canvas.name} (Imported)`,
        createdAt: now,
        updatedAt: now,
        nodeCount: exportData.canvas.nodes.length,
        edgeCount: exportData.canvas.edges.length,
      });

      await db.table('canvasStates').add({
        canvasId,
        nodes: exportData.canvas.nodes,
        edges: exportData.canvas.edges,
        viewport: exportData.canvas.viewport,
        linkageProposals: [],
      });
    });

    await get().loadCanvasList();
    return canvasId;
  },
});