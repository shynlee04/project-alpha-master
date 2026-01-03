/**
 * @fileoverview Source Import Handlers
 * @module lib/knowledge/source-import-handlers
 * @governance EPIC-6-1, PHASE-5
 *
 * Import handlers for PDF, URL, text, and image sources.
 * Each handler accepts callback functions for orchestration.
 */

import { parsePDF } from './pdf-parser';
import { URLFetcher } from './url-fetcher';
import type { SourceRecord } from '@/lib/state/dexie-db';
import { db } from '@/lib/state/dexie-db';
import { emitStoreEvent } from '@/lib/events/store-events';
import { STORE_EVENTS } from '@/lib/events/store-events';
import type { SourceImportOptions } from './source-import-types';
import type { ChunkingOptions } from '@/lib/rag/types';

/**
 * Import handler dependencies interface
 */
interface ImportHandlerDependencies {
    emitEvent: (event: string, data: unknown) => void;
    triggerMetadataExtraction: (sourceId: string, content: string) => Promise<void>;
    triggerChunking: (sourceId: string, content: string, options?: ChunkingOptions) => Promise<void>;
}

/**
 * Import PDF source
 *
 * @param file - PDF file to import
 * @param options - Import options
 * @param urlFetcher - URLFetcher instance
 * @param deps - Handler dependencies
 * @returns Created SourceRecord
 * @throws Error if validation fails or PDF cannot be parsed
 */
export async function importPDF(
    file: File,
    options: SourceImportOptions,
    deps: ImportHandlerDependencies
): Promise<SourceRecord> {
    const { validatePDF } = await import('./source-import-validators');
    validatePDF(file);

    const sourceId = crypto.randomUUID();
    deps.emitEvent('import.started', { sourceId, type: 'pdf', title: file.name });

    try {
        // Parse PDF with progress tracking
        const result = await parsePDF(
            file,
            (page, total) => {
                const message = `Reading page ${page} of ${total}...`;
                options.onProgress?.(message);
                deps.emitEvent('import.progress', { sourceId, page, total, message });
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

        deps.triggerMetadataExtraction(sourceId, result.text);

        // Trigger chunking if enabled (Story 7-2)
        if (options.autoChunk) {
            deps.triggerChunking(sourceId, result.text, options.chunkingOptions);
        }

        deps.emitEvent('import.completed', { sourceId, record });
        return record;
    } catch (error) {
        deps.emitEvent('import.error', { sourceId, error: error as Error });
        throw error;
    }
}

/**
 * Import URL source
 *
 * @param url - URL to import
 * @param options - Import options
 * @param urlFetcher - URLFetcher instance
 * @param deps - Handler dependencies
 * @returns Created SourceRecord
 * @throws Error if URL is invalid or cannot be fetched
 */
export async function importURL(
    url: string,
    options: SourceImportOptions,
    urlFetcher: URLFetcher,
    deps: ImportHandlerDependencies
): Promise<SourceRecord> {
    const { validateURL } = await import('./source-import-validators');
    validateURL(url);

    const sourceId = crypto.randomUUID();
    deps.emitEvent('import.started', { sourceId, type: 'url', title: url });

    try {
        options.onProgress?.('Fetching URL...');
        deps.emitEvent('import.progress', { sourceId, message: 'Fetching URL...' });

        const result = await urlFetcher.fetchURL(url);

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

        deps.triggerMetadataExtraction(sourceId, result.content);

        // Trigger chunking if enabled (Story 7-2)
        if (options.autoChunk) {
            deps.triggerChunking(sourceId, result.content, options.chunkingOptions);
        }

        deps.emitEvent('import.completed', { sourceId, record });
        return record;
    } catch (error) {
        deps.emitEvent('import.error', { sourceId, error: error as Error });
        throw error;
    }
}

/**
 * Import text source
 *
 * @param text - Text content
 * @param title - Source title
 * @param options - Import options
 * @param deps - Handler dependencies
 * @returns Created SourceRecord
 * @throws Error if text is empty
 */
export async function importText(
    text: string,
    title: string,
    options: SourceImportOptions,
    deps: ImportHandlerDependencies
): Promise<SourceRecord> {
    if (!text || text.trim().length === 0) {
        throw new Error('Text content cannot be empty');
    }

    const sourceId = crypto.randomUUID();
    deps.emitEvent('import.started', { sourceId, type: 'text', title });

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

        deps.triggerMetadataExtraction(sourceId, text);

        // Trigger chunking if enabled (Story 7-2)
        if (options.autoChunk) {
            deps.triggerChunking(sourceId, text, options.chunkingOptions);
        }

        deps.emitEvent('import.completed', { sourceId, record });
        return record;
    } catch (error) {
        deps.emitEvent('import.error', { sourceId, error: error as Error });
        throw error;
    }
}

/**
 * Import image source
 *
 * @param file - Image file to import
 * @param options - Import options
 * @param deps - Handler dependencies
 * @returns Created SourceRecord
 * @throws Error if validation fails or image cannot be processed
 */
export async function importImage(
    file: File,
    options: SourceImportOptions,
    deps: ImportHandlerDependencies
): Promise<SourceRecord> {
    const { validateImage } = await import('./source-import-validators');
    validateImage(file);

    const sourceId = crypto.randomUUID();
    deps.emitEvent('import.started', { sourceId, type: 'image', title: file.name });

    try {
        options.onProgress?.('Processing image...');

        let extractedText = '';
        let description = '';
        // let imageType = 'photo'; // Unused

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
                // imageType = result.imageType; // Unused
            } catch (error) {
                console.error('[Image Import] Gemini processing failed, using basic extraction:', error);
                // Continue with basic metadata if Gemini fails
            }
        }

        // Create source record
        // NOTE: Image type not yet supported in SourceRecord, using text type as fallback
        const record: SourceRecord = {
            id: sourceId,
            projectId: options.projectId,
            type: 'text', // Image type not supported, using text as fallback
            title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
            content: extractedText || description || `Image: ${file.name}`,
            charCount: extractedText?.length || 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
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
            deps.triggerMetadataExtraction(sourceId, extractedText);
        }

        // Trigger chunking if enabled (Story 7-2)
        if (options.autoChunk && extractedText) {
            deps.triggerChunking(sourceId, extractedText, options.chunkingOptions);
        }

        deps.emitEvent('import.completed', { sourceId, record });
        return record;
    } catch (error) {
        deps.emitEvent('import.error', { sourceId, error: error as Error });
        throw error;
    }
}
