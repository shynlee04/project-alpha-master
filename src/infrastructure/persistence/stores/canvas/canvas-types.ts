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
 * Made generic to accept any linkage proposal type
 */
export interface CanvasState<T = unknown> {
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;
  linkageProposals: T[];
}

/**
 * Canvas store state and actions interface
 * Made generic to accept any linkage proposal type
 */
export interface CanvasStoreApi<T = unknown> {
  getState: () => CanvasState<T>;
  setState: (partial: Partial<CanvasState<T>>) => void;
}
