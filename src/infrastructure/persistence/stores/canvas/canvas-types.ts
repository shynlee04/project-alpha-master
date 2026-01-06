/**
 * Canvas Store Types
 *
 * Shared types for canvas store to avoid circular dependencies.
 * Separated from index.ts and canvas-multi-slice.ts.
 *
 * @module infrastructure/persistence/stores/canvas/canvas-types
 */

import type { Node, Edge, Viewport } from '@xyflow/react';

/**
 * Canvas state interface (subset of CombinedCanvasState)
 */
export interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;
  linkageProposals: unknown[];
}

/**
 * Canvas store state and actions interface
 */
export interface CanvasStoreApi {
  getState: () => CanvasState;
  setState: (partial: Partial<CanvasState>) => void;
}
