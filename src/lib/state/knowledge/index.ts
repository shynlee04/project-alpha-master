/**
 * @fileoverview Knowledge Store Barrel Export
 * @module lib/state/knowledge
 * @governance Epic GS-001 (God Store Splitting)
 * @iteration 1147
 *
 * Barrel export for all knowledge store slices and types.
 * Provides single import point for consumers.
 */

// Types
export * from './types';

// Slices
export * from './slices/knowledge-source-crud-slice';
export * from './slices/knowledge-preview-slice';
export * from './slices/knowledge-collection-slice';
export * from './slices/knowledge-metadata-slice';
export * from './slices/knowledge-synthesis-slice';
export * from './slices/knowledge-undo-slice';

// Main store
export { useKnowledgeStore } from './knowledge-store';
