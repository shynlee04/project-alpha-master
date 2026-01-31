/**
 * @fileoverview Shared Types for Knowledge Store Slices
 * @module infrastructure/persistence/stores/knowledge/types
 * @governance Epic 53-3 (State Management Consolidation)
 * @canonical This is the canonical location for knowledge store types
 *
 * This file contains shared type definitions used across all knowledge store slices.
 * Migrated from lib/state/knowledge/types.ts per ADR-024.
 */

import type { SourceRecord, CollectionRecord, SourceMetadata, SynthesisResultRecord } from '../../dexie-db';

// ============================================================================
// Type Exports from dexie-db
// ============================================================================

export type { SourceRecord, CollectionRecord, SourceMetadata, SynthesisResultRecord };

// ============================================================================
// Knowledge Store-Specific Types
// ============================================================================

/**
 * Deleted source for undo functionality
 *
 * @description
 * Stores information about deleted sources to enable undo functionality.
 * Undo queue entries expire after 5 seconds automatically.
 *
 * @property sourceId - Unique identifier of the deleted source
 * @property source - Complete source record for restoration
 * @property timestamp - Unix timestamp when source was deleted
 */
export interface DeletedSource {
    sourceId: string;
    source: SourceRecord;
    timestamp: number;
}

/**
 * Metadata fields for user editing (Story 6.4)
 *
 * @description
 * Subset of SourceMetadata fields that users can manually edit.
 * Used by the metadata editing UI to update AI-extracted metadata.
 *
 * @property summary - User-provided or AI-generated summary
 * @property keyConcepts - Array of key concepts extracted from source
 * @property suggestedQuestions - Questions for studying/testing understanding
 */
export interface SourceMetadataFields {
    summary?: string;
    keyConcepts?: string[];
    suggestedQuestions?: string[];
}

/**
 * Processing status for source operations
 *
 * @description
 * Tracks the lifecycle of async operations on sources (metadata extraction, synthesis, etc.)
 *
 * - pending: Operation queued but not started
 * - processing: Operation currently in progress
 * - completed: Operation finished successfully
 * - failed: Operation failed (check processingError for details)
 */
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Knowledge Store State Interface (Combined)
 *
 * @description
 * Complete state interface combining all slices.
 * Each slice contributes a subset of this interface.
 *
 * @see slices/knowledge-source-crud-slice.ts - Source CRUD state and actions
 * @see slices/knowledge-preview-slice.ts - Preview panel state
 * @see slices/knowledge-collection-slice.ts - Collection management
 * @see slices/knowledge-metadata-slice.ts - Metadata extraction
 * @see slices/knowledge-synthesis-slice.ts - Synthesis operations
 * @see slices/knowledge-undo-slice.ts - Undo functionality
 */
export interface KnowledgeStoreState {
    // Source CRUD State
    /** All sources for current project */
    sources: SourceRecord[];

    /** Currently selected source */
    selectedSource: SourceRecord | null;

    /** Loading state for async operations */
    loading: boolean;

    /** Error state */
    error: string | null;

    // Preview State
    /** Whether preview panel is open */
    isPreviewOpen: boolean;

    // Collection State
    /** All collections for current project */
    collections: CollectionRecord[];

    /** Currently filtered collection (null = show all) */
    filteredCollectionId: string | null;

    // Undo State
    /** Undo queue for deleted sources */
    undoQueue: DeletedSource[];

    // Metadata Extraction State
    /** Source IDs currently being extracted */
    extractingMetadata: Set<string>;

    // Synthesis State
    /** Source IDs currently being synthesized */
    synthesizingSources: Set<string>;

    /** Synthesis results by source ID */
    synthesisResults: Map<string, SynthesisResultRecord>;

    // Hydration State
    /** Whether store has hydrated from persistence */
    _hasHydrated: boolean;

    // Actions (defined across slices)
    setHasHydrated: (state: boolean) => void;
    loadSources: (projectId: string) => Promise<void>;
    selectSource: (source: SourceRecord | null) => void;
    openPreview: (source: SourceRecord) => void;
    closePreview: () => void;
    deleteSource: (sourceId: string) => Promise<void>;
    undoDelete: (sourceId: string) => Promise<void>;
    renameSource: (sourceId: string, newName: string) => Promise<void>;
    updateSourceMetadata: (sourceId: string, metadata: SourceMetadata) => Promise<void>;
    loadCollections: (projectId: string) => Promise<void>;
    createCollection: (name: string) => Promise<void>;
    updateCollection: (collectionId: string, updates: Partial<CollectionRecord>) => Promise<void>;
    deleteCollection: (collectionId: string) => Promise<void>;
    addSourceToCollection: (sourceId: string, collectionId: string) => Promise<void>;
    removeSourceFromCollection: (sourceId: string, collectionId: string) => Promise<void>;
    filterByCollection: (collectionId: string | null) => void;
    extractMetadata: (sourceId: string) => Promise<void>;
    updateMetadata: (sourceId: string, metadata: SourceMetadataFields) => Promise<void>;
    updateProcessingStatus: (sourceId: string, status: ProcessingStatus, error?: string) => Promise<void>;
    synthesizeSource: (sourceId: string) => Promise<void>;
    loadSynthesisResult: (sourceId: string) => Promise<void>;
    reset: () => void;
}
