/**
 * @fileoverview Knowledge Undo Slice (FACADE)
 * @module lib/state/knowledge/slices/knowledge-undo-slice
 * @governance Epic 53-3 (State Management Consolidation) - ADR-024
 * @deprecated Import from '@/infrastructure/persistence/stores/knowledge' instead
 *
 * MIGRATION NOTE: This file is a FACADE that re-exports from the canonical location.
 */

export { createUndoSlice } from '@/infrastructure/persistence/stores/knowledge';
export type { UndoState } from '@/infrastructure/persistence/stores/knowledge/slices/knowledge-undo-slice';
