/**
 * @fileoverview Knowledge Collection Slice (FACADE)
 * @module lib/state/knowledge/slices/knowledge-collection-slice
 * @governance Epic 53-3 (State Management Consolidation) - ADR-024
 * @deprecated Import from '@/infrastructure/persistence/stores/knowledge' instead
 *
 * MIGRATION NOTE: This file is a FACADE that re-exports from the canonical location.
 */

export { createCollectionSlice } from '@/infrastructure/persistence/stores/knowledge';
export type { CollectionState } from '@/infrastructure/persistence/stores/knowledge/slices/knowledge-collection-slice';
