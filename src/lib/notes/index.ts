/**
 * @fileoverview Notes Library Barrel Export
 * @module lib/notes
 * @governance EPIC-26-1, EPIC-26-2
 */

// Types (Story 26.1)
export type {
    NoteRecord,
    NoteSaveStatus,
    NoteTreeNode,
    NoteEditorState,
    CreateNoteParams,
    UpdateNoteParams,
} from './types';

export {
    generateNoteId,
    extractTitleFromBlocks,
    DEFAULT_NOTE_BLOCKS,
} from './types';

// Embedding Types (Story 26.2)
export type {
    NoteIndexStatus,
    NoteIndexState,
    NoteEmbeddingResult,
    NoteDocumentSchema,
    EmbeddingWorkerRequest,
    EmbeddingWorkerResponse,
} from './types-embedding';

export {
    extractTextFromBlocks,
    chunkTextForEmbedding,
    generateNoteDocumentId,
    DEFAULT_CHUNK_SIZE,
    DEFAULT_CHUNK_OVERLAP,
    MAX_EMBEDDING_RETRIES,
    EMBEDDING_DEBOUNCE_MS,
    EMBEDDING_DIMENSIONS,
} from './types-embedding';

// Store (Story 26.1)
export {
    useNoteStore,
    useActiveNote,
    useNoteSaveStatus,
    useNotesByParent,
    useFavoriteNotes,
    useIsNoteIndexing,
} from './note-store';

// Indexer (Story 26.2)
export {
    noteIndexer,
    indexNote,
    removeNoteFromIndex,
    searchNotes,
    rebuildNoteIndex,
} from './note-indexer';

// Embedding Worker Bridge (Story 26.2)
export {
    embeddingWorkerBridge,
    embedTextInWorker,
    embedChunksInWorker,
} from './embedding-worker-bridge';

// File Sync Service (NR-06)
export {
    NoteFileSyncService,
    createNoteFileSyncService,
    type NoteFileSyncOptions,
    type NoteSyncResult,
    type NoteImportResult,
} from './note-file-sync';

// NR-07: Note Event Emitter
export {
    getNoteEventBus,
    resetNoteEventBus,
    emitNoteCreated,
    emitNoteUpdated,
    emitNoteDeleted,
    emitNoteSelected,
    emitNoteContentChanged,
    emitNoteTitleChanged,
    emitNoteMoved,
    emitNoteFavoriteChanged,
    emitNoteIndexed,
    emitNoteIndexingStarted,
    emitNoteIndexingFailed,
    emitNotesListed,
    type NoteEvents,
    type NoteEventEmitter,
} from './note-event-emitter';

// NR-08: Markdown Converter
export {
    noteToMarkdown,
    blocksToMarkdown,
    markdownToBlocks,
    blocksToPlainText,
    plainTextToBlock,
    stripMarkdown,
    isValidMarkdown,
    type MarkdownConversionOptions,
    type MarkdownParseResult,
} from './markdown-converter';
