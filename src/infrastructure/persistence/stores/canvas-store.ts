/**
 * @fileoverview Canvas Store Facade (Legacy Export)
 * @module infrastructure/persistence/stores/canvas-store
 * @governance S-012-a (God Store Elimination)
 *
 * Facade export for backward compatibility.
 * Re-exports from new slice-based architecture.
 *
 * MIGRATION STATUS: ✅ COMPLETE (2026-01-05)
 * - New location: infrastructure/persistence/stores/canvas/index.ts
 * - Old store split into 5 focused slices (each ≤120 lines)
 * - Zero breaking changes - all consumers work without code updates
 *
 * @deprecated Import from infrastructure/persistence/stores/canvas instead
 */

// Re-export database classes (used by tests and persistence)
export {
  KnowledgeCanvasDB,
  getCanvasDb,
  setCanvasDbForTesting,
  getSafeCanvasDb,
} from './canvas/canvas-db';

// Re-export utilities
export { generateCanvasId, initializeDefaultCanvas } from './canvas/canvas-utils';

// Re-export all stores and types (zero breaking changes)
export {
  useCanvasStore,
  useMultiCanvasStore,
  useCanvasPersistence,
} from './canvas/index';

// Re-export slice types (for advanced usage)
export type {
  CanvasStateSlice,
  CanvasLinkageSlice,
  CanvasIOSlice,
  CanvasMultiSlice,
} from './canvas/index';