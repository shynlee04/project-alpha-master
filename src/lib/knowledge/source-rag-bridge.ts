/**
 * @fileoverview Source → RAG Bridge
 * @module lib/knowledge/source-rag-bridge
 *
 * Bridges source import pipeline to RAG indexing system.
 * Automatically indexes imported sources in Orama with embeddings.
 *
 * @gap GAP-001: Source Import → Orama Index Disconnection
 * @epic KSI-01: Source → RAG Wiring
 */

import type { Document } from '../rag/types';
import type { Source } from './types';
import type { EmbeddingResult } from '../rag/embedding-service';

import { EventEmitter3 } from '../events/event-emitter3';
import { STORE_EVENTS } from '../events/store-events';
import { subscribeStoreEvent } from '../events/store-events';

import { DocumentChunker } from '../rag/document-chunker';
import { EmbeddingService } from '../rag/embedding-service';
import { OramaIndex } from '../rag/orama-index';
import { chunkStrategies } from '../rag/chunk-strategies';

/**
 * Source indexing status
 */
export type SourceIndexingStatus = 'pending' | 'indexing' | 'indexed' | 'failed';

/**
 * Source indexing result
 */
export interface SourceIndexingResult {
    sourceId: string;
    status: SourceIndexingStatus;
    chunksCreated: number;
    embeddingsGenerated: number;
    indexedAt: number;
    error?: string;
}

/**
 * Source → RAG Bridge Configuration
 */
export interface SourceRAGBridgeConfig {
    /** Auto-index on source import */
    autoIndex: boolean;
    /** Chunking strategy */
    chunkStrategy: 'fixed' | 'recursive' | 'semantic';
    /** Chunk size for fixed strategy */
    chunkSize: number;
    /** Chunk overlap */
    chunkOverlap: number;
    /** Progress callback */
    onProgress?: (result: SourceIndexingResult) => void;
}

/**
 * Default bridge configuration
 */
const DEFAULT_CONFIG: SourceRAGBridgeConfig = {
    autoIndex: true,
    chunkStrategy: 'recursive',
    chunkSize: 1000,
    chunkOverlap: 200
};

/**
 * Source → RAG Bridge
 *
 * Listens for source import events and automatically indexes
 * imported content in Orama with embeddings.
 */
export class SourceRAGBridge {
    private documentChunker: DocumentChunker;
    private embeddingService: EmbeddingService;
    private oramaIndex: OramaIndex;
    private eventBus: EventEmitter3;
    private config: SourceRAGBridgeConfig;
    private unsubscribe?: () => void;

    constructor(dependencies: {
        documentChunker: DocumentChunker;
        embeddingService: EmbeddingService;
        oramaIndex: OramaIndex;
        eventBus: EventEmitter3;
    }, config: Partial<SourceRAGBridgeConfig> = {}) {
        this.documentChunker = dependencies.documentChunker;
        this.embeddingService = dependencies.embeddingService;
        this.oramaIndex = dependencies.oramaIndex;
        this.eventBus = dependencies.eventBus;
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * Start listening for source import events
     */
    start(): void {
        if (this.config.autoIndex) {
            // Subscribe to source imported events
            this.unsubscribe = subscribeStoreEvent(
                STORE_EVENTS.SOURCE_IMPORTED,
                this.handleSourceImported.bind(this)
            );
        }
    }

    /**
     * Stop listening for source import events
     */
    stop(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = undefined;
        }
    }

    /**
     * Handle source imported event
     */
    private async handleSourceImported(source: Source): Promise<void> {
        try {
            // Create document from source
            const doc: Document = {
                id: `source-${source.id}`,
                projectId: source.collectionId,
                title: source.title,
                content: source.content || source.excerpt || '',
                source: source.id,
                sourceType: this.mapSourceType(source.sourceType),
                createdAt: source.createdAt,
                updatedAt: source.updatedAt
            };

            // Chunk document
            const chunks = await this.documentChunker.chunkDocument(doc);

            // Generate embeddings
            const embeddings = await this.embeddingService.embedBatch(chunks);

            // Index in Orama
            await this.oramaIndex.indexBatch(embeddings);

            // Notify progress
            const result: SourceIndexingResult = {
                sourceId: source.id,
                status: 'indexed',
                chunksCreated: chunks.length,
                embeddingsGenerated: embeddings.length,
                indexedAt: Date.now()
            };

            if (this.config.onProgress) {
                this.config.onProgress(result);
            }

            // Emit indexed event
            this.eventBus.emit('source:indexed', result);

        } catch (error) {
            const result: SourceIndexingResult = {
                sourceId: source.id,
                status: 'failed',
                chunksCreated: 0,
                embeddingsGenerated: 0,
                indexedAt: Date.now(),
                error: error instanceof Error ? error.message : 'Unknown error'
            };

            if (this.config.onProgress) {
                this.config.onProgress(result);
            }

            this.eventBus.emit('source:index-failed', result);
        }
    }

    /**
     * Manually index a source
     */
    async indexSource(source: Source): Promise<SourceIndexingResult> {
        return new Promise((resolve) => {
            const originalCallback = this.config.onProgress;
            this.config.onProgress = (result) => {
                if (originalCallback) {
                    originalCallback(result);
                }
                if (result.sourceId === source.id) {
                    resolve(result);
                }
            };

            this.handleSourceImported(source).catch(() => {
                // Error already handled in handleSourceImported
            });
        });
    }

    /**
     * Check if source is indexed
     */
    async isSourceIndexed(sourceId: string): Promise<boolean> {
        try {
            const docId = `source-${sourceId}`;
            const result = await this.oramaIndex.search({ query: '', limit: 1 });
            // Check if document exists in index
            return result.some(doc => doc.id === docId);
        } catch {
            return false;
        }
    }

    /**
     * Map source type to document source type
     */
    private mapSourceType(sourceType: string): Document['sourceType'] {
        const typeMap: Record<string, Document['sourceType']> = {
            'pdf': 'pdf',
            'image': 'image',
            'audio': 'audio',
            'url': 'url',
            'markdown': 'markdown',
            'text': 'text'
        };
        return typeMap[sourceType] || 'text';
    }

    /**
     * Get indexing status for multiple sources
     */
    async getBulkIndexingStatus(sourceIds: string[]): Promise<Map<string, SourceIndexingStatus>> {
        const statusMap = new Map<string, SourceIndexingStatus>();

        await Promise.all(
            sourceIds.map(async (sourceId) => {
                const indexed = await this.isSourceIndexed(sourceId);
                statusMap.set(sourceId, indexed ? 'indexed' : 'pending');
            })
        );

        return statusMap;
    }

    /**
     * Dispose of bridge resources
     */
    dispose(): void {
        this.stop();
    }
}

/**
 * Factory function to create SourceRAGBridge
 */
export function createSourceRAGBridge(
    dependencies: {
        documentChunker: DocumentChunker;
        embeddingService: EmbeddingService;
        oramaIndex: OramaIndex;
        eventBus: EventEmitter3;
    },
    config?: Partial<SourceRAGBridgeConfig>
): SourceRAGBridge {
    return new SourceRAGBridge(dependencies, config);
}
