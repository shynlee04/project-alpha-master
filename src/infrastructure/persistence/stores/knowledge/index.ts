/**
 * @fileoverview Knowledge Store Barrel Export
 * @module infrastructure/persistence/stores/knowledge
 * @governance EPIC-6-3, EPIC-6-4
 *
 * Centralized exports for unified knowledge store.
 * Composed from 5 focused slices following January 2026 Zustand pattern.
 */

// Main store
export { useKnowledgeStore } from './useKnowledgeStore';

// Convenience hooks
export {
  useSelectedKnowledgeSource,
  useAllKnowledgeSources,
  useAllKnowledgeCollections,
  useFilteredKnowledgeSources,
  useKnowledgeMetadataExtraction,
  useKnowledgeSynthesis,
  useKnowledgeStoreHydration,
} from './useKnowledgeStore';

// Utilities
export {
  resetKnowledgeStore,
  getKnowledgeStoreState,
} from './useKnowledgeStore';

// Types
export type {
  KnowledgeSource,
  KnowledgeCollection,
  SynthesisResult,
  CreateSourceInput,
  UpdateSourceInput,
  SourceMetadataFields,
  KnowledgeSourcesState,
  KnowledgeCollectionsState,
  KnowledgeMetadataState,
  KnowledgeSynthesisState,
  KnowledgeUIState,
} from './knowledge-types';
