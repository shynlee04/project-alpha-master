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

import { parsePDF, isPDF, getFileSizeMB } from './pdf-parser';
import { URLFetcher } from './url-fetcher';
import { db, type SourceRecord } from '@/lib/state/dexie-db';
import { useKnowledgeStore } from '@/lib/state/knowledge-store';
import { metadataExtractor } from './metadata-extractor';
import type { WorkspaceEventEmitter, WorkspaceEvents } from '@/lib/events/workspace-events';
import { useRAGStore } from '@/lib/state/rag-store';
import type { ChunkingOptions } from '@/lib/rag/types';
import { DEFAULT_CHUNKING_OPTIONS } from '@/lib/rag/types';
import { emitStoreEvent } from '@/lib/events/store-events';
import { STORE_EVENTS } from '@/lib/events/store-events';

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
    chunkingOptions?: ChunkingOptions;
    /** Use Gemini multimodal processing for images (requires API key) */
    useGemini?: boolean;
    /** Gemini API key (required if useGemini is true) */
    geminiApiKey?: string;
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
            const result = await parsePDF(
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

            // Emit SOURCE_IMPORTED event for SourceRAGBridge
            emitStoreEvent(STORE_EVENTS.SOURCE_IMPORTED, {
                sourceId,
                sourceType: 'pdf',
                collectionId: options.projectId,
                timestamp: Date.now()
            });

            this.triggerMetadataExtraction(sourceId, result.text);

            // Trigger chunking if enabled (Story 7-2)
            if (options.autoChunk) {
                await this.triggerChunking(sourceId, result.text, options.chunkingOptions);
            }

            this.emitEvent('import.completed', { sourceId, record });
            return record;
        } catch (error) {
            this.emitEvent('import.error', { sourceId, error: error as Error });
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

            // Emit SOURCE_IMPORTED event for SourceRAGBridge
            emitStoreEvent(STORE_EVENTS.SOURCE_IMPORTED, {
                sourceId,
                sourceType: 'url',
                collectionId: options.projectId,
                timestamp: Date.now()
            });

            this.triggerMetadataExtraction(sourceId, result.content);

            // Trigger chunking if enabled (Story 7-2)
            if (options.autoChunk) {
                await this.triggerChunking(sourceId, result.content, options.chunkingOptions);
            }

            this.emitEvent('import.completed', { sourceId, record });
            return record;
        } catch (error) {
            this.emitEvent('import.error', { sourceId, error: error as Error });
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

            // Emit SOURCE_IMPORTED event for SourceRAGBridge
            emitStoreEvent(STORE_EVENTS.SOURCE_IMPORTED, {
                sourceId,
                sourceType: 'text',
                collectionId: options.projectId,
                timestamp: Date.now()
            });

            this.triggerMetadataExtraction(sourceId, text);

            // Trigger chunking if enabled (Story 7-2)
            if (options.autoChunk) {
                await this.triggerChunking(sourceId, text, options.chunkingOptions);
            }

            this.emitEvent('import.completed', { sourceId, record });
            return record;
        } catch (error) {
            this.emitEvent('import.error', { sourceId, error: error as Error });
            throw error;
        }
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
        this.validateImage(file);

        const sourceId = crypto.randomUUID();
        this.emitEvent('import.started', { sourceId, type: 'image', title: file.name });

        try {
            options.onProgress?.('Processing image...');

            let extractedText = '';
            let description = '';
            let imageType = 'photo';

            // If Gemini processing is requested and API key is provided
            if (options.useGemini && options.geminiApiKey) {
                try {
                    // Dynamically import to avoid circular dependency
                    const { createGeminiImageProcessor } = await import('./gemini-image-processor');

                    // Convert file to base64 for Gemini API
                    const arrayBuffer = await file.arrayBuffer();
                    const base64Content = btoa(
                        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
                    );

                    // Process with Gemini
                    const processor = createGeminiImageProcessor(options.geminiApiKey);
                    const result = await processor.processImage(file, base64Content, {
                        extractText: true,
                        generateDescription: true,
                        analyzeStructure: true,
                        onProgress: (progress) => {
                            options.onProgress?.(progress.stage);
                        },
                    });

                    extractedText = result.text;
                    description = result.description;
                    imageType = result.imageType;
                } catch (error) {
                    console.error('[Image Import] Gemini processing failed, using basic extraction:', error);
                    // Continue with basic metadata if Gemini fails
                }
            }

            // Create source record
            const record: SourceRecord = {
                id: sourceId,
                projectId: options.projectId,
                type: 'image',
                title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
                content: extractedText || description || `Image: ${file.name}`,
                wordCount: extractedText ? extractedText.split(/\s+/).filter((w: string) => w.length > 0).length : 0,
                charCount: extractedText?.length || 0,
                fileSize: file.size,
                mimeType: file.type,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                processingStatus: 'pending',
                // Store image metadata
                metadata: {
                    description,
                    imageType,
                    hasGeminiData: options.useGemini && !!extractedText,
                } as Record<string, unknown>,
            };

            // Persist to IndexedDB
            await db.sources.put(record);

            // Emit SOURCE_IMPORTED event for SourceRAGBridge
            emitStoreEvent(STORE_EVENTS.SOURCE_IMPORTED, {
                sourceId,
                sourceType: 'image',
                collectionId: options.projectId,
                timestamp: Date.now()
            });

            // Trigger metadata extraction for additional analysis
            if (extractedText) {
                this.triggerMetadataExtraction(sourceId, extractedText);
            }

            // Trigger chunking if enabled (Story 7-2)
            if (options.autoChunk && extractedText) {
                await this.triggerChunking(sourceId, extractedText, options.chunkingOptions);
            }

            this.emitEvent('import.completed', { sourceId, record });
            return record;
        } catch (error) {
            this.emitEvent('import.error', { sourceId, error: error as Error });
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
        if (!isPDF(file)) {
            throw new Error('Invalid file type. Only PDF files are supported.');
        }

        // Check file size (50MB limit)
        const MAX_SIZE_MB = 50;
        const fileSizeMB = getFileSizeMB(file);
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
     * Validate image file
     *
     * @param file - File to validate
     * @throws Error if file is invalid
     */
    private validateImage(file: File): void {
        // Check file type
        const validImageTypes = [
            'image/png',
            'image/jpeg',
            'image/jpg',
            'image/gif',
            'image/webp',
            'image/bmp',
        ];

        // Also check by extension
        const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'];

        const isValidType = validImageTypes.includes(file.type);
        const isValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

        if (!isValidType && !isValidExtension) {
            throw new Error('Invalid file type. Only PNG, JPEG, GIF, WebP, and BMP images are supported.');
        }

        // Check file size (20MB limit for images)
        const MAX_SIZE_MB = 20;
        const fileSizeMB = getFileSizeMB(file);
        if (fileSizeMB > MAX_SIZE_MB) {
            throw new Error(`Image too large (${fileSizeMB.toFixed(1)}MB). Maximum size is ${MAX_SIZE_MB}MB.`);
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

    /**
     * Trigger background chunking (Story 7-2)
     */
    private async triggerChunking(
        sourceId: string,
        content: string,
        options?: ChunkingOptions
    ): Promise<void> {
        const ragStore = useRAGStore.getState();

        try {
            console.log('[Chunking] Starting chunking for source:', sourceId);

            // Chunk using RAG store
            const chunks = await ragStore.chunkSource(
                sourceId,
                content,
                options ?? DEFAULT_CHUNKING_OPTIONS
            );

            console.log(`[Chunking] Completed: ${chunks.length} chunks created`);

            // Note: In a full implementation, chunks would be saved to IndexedDB
            // and associated with the source for retrieval during search.
        } catch (error) {
            console.error('[Chunking] Failed:', error);
            // Don't throw - chunking failure shouldn't block import
        }
    }
}

/**
 * Singleton instance for convenience
 */
export const sourceImportPipeline = new SourceImportPipeline();
