/**
 * @fileoverview Knowledge Store Barrel Export (Canonical Location)
 * @module infrastructure/persistence/stores/knowledge
 * @governance Epic 53-3 (State Management Consolidation) - ADR-024
 * @canonical This is the canonical location for all knowledge store exports
 *
 * Barrel export for all knowledge store slices and types.
 * Provides single import point for consumers.
 *
 * MIGRATION NOTE: src/lib/state/knowledge/ is now a facade that re-exports
 * from this location. New code should import directly from here.
 */

// Types
export * from './types';

// Slices (for testing/extension)
export * from './slices/knowledge-source-crud-slice';
export * from './slices/knowledge-preview-slice';
export * from './slices/knowledge-collection-slice';
export * from './slices/knowledge-metadata-slice';
export * from './slices/knowledge-synthesis-slice';
export * from './slices/knowledge-undo-slice';

// Main store
export { useKnowledgeStore } from './knowledge-store';
