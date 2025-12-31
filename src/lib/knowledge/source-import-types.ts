/**
 * @fileoverview Source Import Types
 * @module lib/knowledge/source-import-types
 * @governance EPIC-6-1, PHASE-5
 */

/**
 * Supported source types
 */
export type SourceType = 'pdf' | 'url' | 'text' | 'image';

/**
 * Source import options
 */
export interface SourceImportOptions {
    /** Project ID to associate source with */
    projectId: string;
    /** Optional progress callback for UI updates */
    onProgress?: (message: string) => void;
    /** Auto-chunk after import (Story 7-2) */
    autoChunk?: boolean;
    /** Chunking options (defaults to DEFAULT_CHUNKING_OPTIONS) */
    chunkingOptions?: import('@/lib/rag/types').ChunkingOptions;
    /** Use Gemini multimodal processing for images (requires API key) */
    useGemini?: boolean;
    /** Gemini API key (required if useGemini is true) */
    geminiApiKey?: string;
}
