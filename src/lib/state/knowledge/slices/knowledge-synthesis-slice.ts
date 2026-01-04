/**
 * @fileoverview Knowledge Synthesis Slice (FACADE)
 * @module lib/state/knowledge/slices/knowledge-synthesis-slice
 * @governance Epic 53-3 (State Management Consolidation) - ADR-024
 * @deprecated Import from '@/infrastructure/persistence/stores/knowledge' instead
 *
 * MIGRATION NOTE: This file is a FACADE that re-exports from the canonical location.
 */

export { createSynthesisSlice } from '@/infrastructure/persistence/stores/knowledge';
export type { SynthesisState } from '@/infrastructure/persistence/stores/knowledge/slices/knowledge-synthesis-slice';
