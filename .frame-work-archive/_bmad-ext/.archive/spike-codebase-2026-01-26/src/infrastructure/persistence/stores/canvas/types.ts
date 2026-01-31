/**
 * @module Canvas Types
 * @description Type definitions for canvas store
 * @architecture Infrastructure Layer - Persistence Sub-layer
 * @governance ADR-024
 * @epic ARC-1
 * @story S-012-a
 * @created 2026-01-05
 */

import type {
  CanvasStoreState,
  CanvasRelationshipType,
  CanvasMetadata,
  CanvasExport,
} from '@/lib/canvas/types';
import type { LinkageProposal } from '@/lib/canvas/linkage-types';

/**
 * Re-export canvas-related types for store usage
 */
export type {
  CanvasStoreState,
  CanvasRelationshipType,
  CanvasMetadata,
  CanvasExport,
  LinkageProposal,
};

/**
 * Combined store state with all slices
 */
export interface CanvasCombinedState extends CanvasStoreState {
  // Additional state from multi-canvas management
  activeCanvasId: string | null;
  canvasList: CanvasMetadata[];
}

/**
 * Slice states (for type safety in composition)
 */
export interface CanvasCrudSliceState {
  canvasList: CanvasMetadata[];
  loadCanvasList: () => Promise<void>;
  createCanvas: (name?: string) => Promise<string>;
  deleteCanvas: (canvasId: string) => Promise<void>;
  renameCanvas: (canvasId: string, name: string) => Promise<void>;
}

export interface CanvasMultiSliceState {
  activeCanvasId: string | null;
  setActiveCanvas: (canvasId: string) => Promise<void>;
}

export interface CanvasIOSliceState {
  exportCanvas: () => Promise<CanvasExport>;
  importCanvas: (exportData: CanvasExport) => Promise<string>;
}