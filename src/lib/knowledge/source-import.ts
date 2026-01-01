/**
 * @fileoverview Source Import Pipeline for Knowledge Base Ingestion
 * @module lib/knowledge/source-import
 * @governance EPIC-6-1, PHASE-5
 * @ai-observable true
 *
 * Orchestrates PDF, URL, text, and image source imports with validation,
 * progress tracking, and IndexedDB persistence.
 *
 * Story 6.1: Source Import Pipeline
 * Phase 5: Gemini Multimodal Image Understanding Integration
 *
 * @example
 * ```tsx
 * import { sourceImportPipeline } from '@/lib/knowledge/source-import';
 * import { db } from '@/lib/state/dexie-db';
 *
 * const record = await sourceImportPipeline.importPDF(file, {
 *   projectId: currentProject.id,
 *   onProgress: (msg) => console.log(msg),
 * });
 * ```
 */

import { URLFetcher } from './url-fetcher';
import type { SourceRecord } from '@/lib/state/dexie-db';
import { metadataExtractor } from './metadata-extractor';
import type { WorkspaceEventEmitter, WorkspaceEvents } from '@/lib/events/workspace-events';
import type { ChunkingOptions } from '@/lib/rag/types';
import { DEFAULT_CHUNKING_OPTIONS } from '@/lib/rag/types';
import type { SourceImportOptions, SourceType } from './source-import-types';
import { importPDF, importURL, importText, importImage } from './source-import-handlers';

// Re-export types for convenience
export type { SourceImportOptions, SourceType };

/**
 * Source import pipeline orchestrator
 *
 * Features:
 * - Unified interface for PDF, URL, and text imports
 * - Validation before processing
 * - Progress tracking via event bus
 * - Automatic persistence to IndexedDB
 * - Error handling with cleanup
 */
export class SourceImportPipeline {
    private urlFetcher = new URLFetcher();
    private eventBus?: WorkspaceEventEmitter;

    constructor(eventBus?: WorkspaceEventEmitter) {
        this.eventBus = eventBus;
    }

    /**
     * Import PDF source
     *
     * @param file - PDF file to import
     * @param options - Import options
     * @returns Created SourceRecord
     * @throws Error if validation fails or PDF cannot be parsed
     */
    async importPDF(
        file: File,
        options: SourceImportOptions
    ): Promise<SourceRecord> {
        return importPDF(file, options, {
            emitEvent: this.emitEvent.bind(this),
            triggerMetadataExtraction: this.triggerMetadataExtraction.bind(this),
            triggerChunking: this.triggerChunking.bind(this),
        });
    }

    /**
     * Import URL source
     *
     * @param url - URL to import
     * @param options - Import options
     * @returns Created SourceRecord
     * @throws Error if URL is invalid or cannot be fetched
     */
    async importURL(
        url: string,
        options: SourceImportOptions
    ): Promise<SourceRecord> {
        return importURL(url, options, this.urlFetcher, {
            emitEvent: this.emitEvent.bind(this),
            triggerMetadataExtraction: this.triggerMetadataExtraction.bind(this),
            triggerChunking: this.triggerChunking.bind(this),
        });
    }

    /**
     * Import text source
     *
     * @param text - Text content
     * @param title - Source title
     * @param options - Import options
     * @returns Created SourceRecord
     * @throws Error if text is empty
     */
    async importText(
        text: string,
        title: string,
        options: SourceImportOptions
    ): Promise<SourceRecord> {
        return importText(text, title, options, {
            emitEvent: this.emitEvent.bind(this),
            triggerMetadataExtraction: this.triggerMetadataExtraction.bind(this),
            triggerChunking: this.triggerChunking.bind(this),
        });
    }

    /**
     * Import image source
     *
     * @param file - Image file to import
     * @param options - Import options
     * @returns Created SourceRecord
     * @throws Error if validation fails or image cannot be processed
     */
    async importImage(
        file: File,
        options: SourceImportOptions
    ): Promise<SourceRecord> {
        return importImage(file, options, {
            emitEvent: this.emitEvent.bind(this),
            triggerMetadataExtraction: this.triggerMetadataExtraction.bind(this),
            triggerChunking: this.triggerChunking.bind(this),
        });
    }

    /**
     * Emit event to event bus if available
     *
     * @param event - Event name
     * @param data - Event data
     */
    private emitEvent(
        event: 'import.started' | 'import.progress' | 'import.completed' | 'import.error',
        data: WorkspaceEvents[keyof WorkspaceEvents][number]
    ): void {
        if (this.eventBus) {
            this.eventBus.emit(event, data);
        }
    }

    /**
     * Trigger metadata extraction for a source
     *
     * @param sourceId - Source ID to extract metadata for
     * @param content - Content to analyze
     */
    private async triggerMetadataExtraction(sourceId: string, content: string): Promise<void> {
        try {
            await metadataExtractor.extract(sourceId, content);
        } catch (error) {
            console.error('[Source Import] Metadata extraction failed:', error);
            // Don't fail import if metadata extraction fails
        }
    }

    /**
     * Trigger chunking for a source
     *
     * @param sourceId - Source ID to chunk
     * @param content - Content to chunk
     * @param options - Chunking options
     */
    private async triggerChunking(
        sourceId: string,
        content: string,
        options?: ChunkingOptions
    ): Promise<void> {
        const { useRAGStore } = await import('@/infrastructure/persistence/stores/rag/rag-store');
        const ragStore = useRAGStore.getState();

        const chunkingOptions = options || DEFAULT_CHUNKING_OPTIONS;

        try {
            await ragStore.chunkSource(sourceId, content, chunkingOptions);
        } catch (error) {
            console.error('[Source Import] Chunking failed:', error);
            // Don't fail import if chunking fails
        }
    }
}

/**
 * Singleton instance for easy import
 */
export const sourceImportPipeline = new SourceImportPipeline();
