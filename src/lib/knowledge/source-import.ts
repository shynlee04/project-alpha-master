/**
 * @fileoverview Source Import Pipeline for Knowledge Base Ingestion
 * @module lib/knowledge/source-import
 * @governance EPIC-6-1
 * @ai-observable true
 *
 * Orchestrates PDF, URL, and text source imports with validation,
 * progress tracking, and IndexedDB persistence.
 *
 * Story 6.1: Source Import Pipeline
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

import { PDFParser, type PDFProgressCallback } from './pdf-parser';
import { URLFetcher } from './url-fetcher';
import { db, type SourceRecord } from '@/lib/state/dexie-db';
import { useKnowledgeStore } from '@/lib/state/knowledge-store';
import { metadataExtractor } from './metadata-extractor';
import type { WorkspaceEventEmitter, WorkspaceEvents } from '@/lib/events/workspace-events';

/**
 * Supported source types
 */
export type SourceType = 'pdf' | 'url' | 'text';

/**
 * Source import options
 */
export interface SourceImportOptions {
    /** Project ID to associate source with */
    projectId: string;
    /** Optional progress callback for UI updates */
    onProgress?: (message: string) => void;
}

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
    private pdfParser = new PDFParser();
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
        this.validatePDF(file);

        const sourceId = crypto.randomUUID();
        this.emitEvent('import.started', { sourceId, type: 'pdf', title: file.name });

        try {
            // Parse PDF with progress tracking
            const result = await this.pdfParser.parsePDF(
                file,
                (page, total) => {
                    const message = `Reading page ${page} of ${total}...`;
                    options.onProgress?.(message);
                    this.emitEvent('import.progress', { sourceId, page, total, message });
                }
            );

            // Use title from metadata or filename
            const title = result.metadata?.title || file.name.replace(/\.pdf$/i, '');

            // Create source record
            const record: SourceRecord = {
                id: sourceId,
                projectId: options.projectId,
                type: 'pdf',
                title,
                content: result.text,
                pageCount: result.pageCount,
                wordCount: result.wordCount,
                fileSize: file.size,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                processingStatus: 'pending',
            };

            // Persist to IndexedDB
            await db.sources.put(record);

            this.triggerMetadataExtraction(sourceId, result.text);

            this.emitEvent('import.completed', { sourceId, record });
            return record;
        } catch (error) {
            this.emitEvent('import.error', { sourceId, error });
            throw error;
        }
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
        this.validateURL(url);

        const sourceId = crypto.randomUUID();
        this.emitEvent('import.started', { sourceId, type: 'url', title: url });

        try {
            options.onProgress?.('Fetching URL...');
            this.emitEvent('import.progress', { sourceId, message: 'Fetching URL...' });

            const result = await this.urlFetcher.fetchURL(url);

            // Create source record
            const record: SourceRecord = {
                id: sourceId,
                projectId: options.projectId,
                type: 'url',
                title: result.title,
                content: result.content,
                url: result.url,
                wordCount: result.wordCount,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                processingStatus: 'pending',
            };

            // Persist to IndexedDB
            await db.sources.put(record);

            this.triggerMetadataExtraction(sourceId, result.content);

            this.emitEvent('import.completed', { sourceId, record });
            return record;
        } catch (error) {
            this.emitEvent('import.error', { sourceId, error });
            throw error;
        }
    }

    /**
     * Import text source
     *
     * @param text - Text content
     * @param title - Source title
     * @param options - Import options
     * @returns Created SourceRecord
     */
    async importText(
        text: string,
        title: string,
        options: SourceImportOptions
    ): Promise<SourceRecord> {
        if (!text || text.trim().length === 0) {
            throw new Error('Text content cannot be empty');
        }

        const sourceId = crypto.randomUUID();
        this.emitEvent('import.started', { sourceId, type: 'text', title });

        try {
            // Use first line or provided title
            const finalTitle = title || text.split('\n')[0].trim().substring(0, 100);

            // Create source record
            const record: SourceRecord = {
                id: sourceId,
                projectId: options.projectId,
                type: 'text',
                title: finalTitle,
                content: text,
                charCount: text.length,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                processingStatus: 'pending',
            };

            // Persist to IndexedDB
            await db.sources.put(record);

            this.triggerMetadataExtraction(sourceId, text);

            this.emitEvent('import.completed', { sourceId, record });
            return record;
        } catch (error) {
            this.emitEvent('import.error', { sourceId, error });
            throw error;
        }
    }

    /**
     * Validate PDF file
     *
     * @param file - File to validate
     * @throws Error if file is invalid
     */
    private validatePDF(file: File): void {
        // Check file type
        if (!this.pdfParser.isPDF(file)) {
            throw new Error('Invalid file type. Only PDF files are supported.');
        }

        // Check file size (50MB limit)
        const MAX_SIZE_MB = 50;
        const fileSizeMB = this.pdfParser.getFileSizeMB(file);
        if (fileSizeMB > MAX_SIZE_MB) {
            throw new Error(`File too large (${fileSizeMB.toFixed(1)}MB). Maximum size is ${MAX_SIZE_MB}MB.`);
        }
    }

    /**
     * Validate URL format
     *
     * @param url - URL to validate
     * @throws Error if URL is invalid
     */
    private validateURL(url: string): void {
        // Check protocol first before URL construction
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            throw new Error('URL must start with http:// or https://');
        }

        // Validate URL format
        try {
            new URL(url);
        } catch {
            throw new Error('Invalid URL format. Please enter a complete URL (e.g., https://example.com).');
        }
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
     * Trigger background metadata extraction (Story 6-4)
     */
    private async triggerMetadataExtraction(sourceId: string, content: string): Promise<void> {
        const store = useKnowledgeStore.getState();

        try {
            await store.updateProcessingStatus(sourceId, 'processing');

            // 1. Basic Stats
            const basicStats = metadataExtractor.extractBasicStats(content);
            await store.updateSourceMetadata(sourceId, basicStats);

            // 2. AI Analysis (if available)
            const isAvailable = await metadataExtractor.isAvailable();
            if (isAvailable) {
                const analysis = await metadataExtractor.extractAllMetadata({ content });
                // Merge with basic stats (analysis includes metadataExtracted flag)
                await store.updateSourceMetadata(sourceId, {
                    ...basicStats,
                    ...analysis
                });
            }

            await store.updateProcessingStatus(sourceId, 'completed');
        } catch (error) {
            console.error('[Metadata] Extraction failed:', error);
            await store.updateProcessingStatus(sourceId, 'failed', (error as Error).message);
        }
    }
}

/**
 * Singleton instance for convenience
 */
export const sourceImportPipeline = new SourceImportPipeline();
