/**
 * @fileoverview Canvas Utilities
 * @module infrastructure/persistence/stores/canvas/canvas-utils
 * @governance S-012-a (God Store Elimination)
 *
 * Utility functions for canvas operations.
 * Part of canvas-store.ts refactoring to eliminate god store anti-pattern.
 *
 * Architecture:
 * - Extracted from canvas-store.ts (original lines 73-78)
 * - Canvas ID generation utilities
 *
 * @see aggregation: canvas/index.ts (unified store)
 */

/**
 * Generate a unique canvas ID
 */
export function generateCanvasId(): string {
  return `canvas-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Initialize default canvas in database
 */
export async function initializeDefaultCanvas(): Promise<void> {
  // Lazy import to avoid SSR issues
  const { getSafeCanvasDb } = await import('./canvas-db');
  const db = getSafeCanvasDb();
  if (!db) return;

  const existing = await db.table('canvases').get('default');
  if (existing) return; // Already exists

  const now = Date.now();
  await db.transaction('rw', 'canvases', 'canvasStates', async () => {
    await db.table('canvases').add({
      id: 'default',
      name: 'My First Canvas',
      createdAt: now,
      updatedAt: now,
      nodeCount: 0,
      edgeCount: 0,
    });

    await db.table('canvasStates').add({
      canvasId: 'default',
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      linkageProposals: [],
    });
  });
}

// Initialize on module load
if (typeof window !== 'undefined') {
  initializeDefaultCanvas().catch(() => {
    // Silently fail
  });
}