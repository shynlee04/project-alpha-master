/**
 * @fileoverview Knowledge Store Types (FACADE)
 * @module lib/state/knowledge/types
 * @governance Epic 53-3 (State Management Consolidation) - ADR-024
 * @deprecated Import from '@/infrastructure/persistence/stores/knowledge' instead
 *
 * MIGRATION NOTE: This file is a FACADE that re-exports from the canonical location.
 * The canonical implementation is at src/infrastructure/persistence/stores/knowledge/types.ts
 */

// Re-export all types from canonical location
export type {
    SourceRecord,
    CollectionRecord,
    SourceMetadata,
    SynthesisResultRecord,
    DeletedSource,
    SourceMetadataFields,
    ProcessingStatus,
    KnowledgeStoreState,
} from '@/infrastructure/persistence/stores/knowledge';
