/**
 * @fileoverview Context Engine Module
 * @module lib/context
 * @governance EPIC-31-1
 *
 * Exports context engine services for note-aware AI chat.
 */

// ContextEngine exports (E3-1)
export {
    buildNoteContext,
    formatContextAsMarkdown,
    getFormattedNoteContext,
    getCurrentNoteContent,
    clearContextCache,
} from './ContextEngine';

export type {
    NoteContext,
    ContextEngineConfig,
} from './ContextEngine';

// NoteContentRetriever exports (E3-2)
export {
    retrieveNoteContent,
    getBlockContent,
    getBlockChunks,
    filterSensitiveData,
    containsSensitiveData,
    chunkText,
} from './NoteContentRetriever';

export type {
    ContentChunk,
    RetrievedContent,
    ContentRetrievalOptions,
} from './NoteContentRetriever';

// RAGQueryService exports (E3-3)
export {
    queryRelatedNotes,
    batchQueryRelatedNotes,
    isRAGAvailable,
    quickQuery,
    getTopRelatedNote,
} from './RAGQueryService';

export type {
    RAGQueryResult,
    RAGQueryOptions,
    RAGQueryResponse,
} from './RAGQueryService';

// ContextInjector exports (E3-4)
export {
    injectContextIntoPrompt,
    formatContextForPrompt,
    formatContextWithLimit,
    quickInject,
    isContextAvailable,
    getModelTokenLimit,
    getRecommendedContextTokens,
    validateContextSize,
    estimateTokens,
} from './ContextInjector';

export type {
    ModelTokenLimit,
    ContextInjectionConfig,
    InjectedContext,
    ContextInjectionResult,
} from './ContextInjector';
