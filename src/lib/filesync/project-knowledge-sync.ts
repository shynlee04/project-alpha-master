/**
 * @fileoverview Project to Knowledge Sync
 * @module lib/filesync/project-knowledge-sync
 *
 * Synchronization service for syncing documents from IDE projects
 * to Knowledge workspace and integrating with RAG pipeline.
 *
 * @epic CW-02 - Project → Knowledge Sync
 */

import type { Document } from '../rag/types';
import type { FileSyncService } from './file-sync-service';
import type { DocumentChunker } from '../rag/document-chunker';
import type { EmbeddingService } from '../rag/embedding-service';
import type { OramaIndex } from '../rag/orama-index';

/**
 * Sync configuration
 */
export interface SyncConfig {
    /** Project ID to sync from */
    projectId: string;
    /** File patterns to include */
    includePatterns: string[];
    /** File patterns to exclude */
    excludePatterns: string[];
    /** Maximum file size in bytes */
    maxFileSize?: number;
}

/**
 * Sync result
 */
export interface ProjectKnowledgeSyncResult {
    success: boolean;
    documentsSynced: number;
    chunksCreated: number;
    embeddingsGenerated: number;
    errors: Array<{ path: string; error: string }>;
    duration: number;
}

/**
 * Project to Knowledge Sync Service
 *
 * Syncs documents from IDE projects to Knowledge workspace
 * and processes them through the RAG pipeline.
 */
export class ProjectKnowledgeSync {
    private fileSyncService: FileSyncService;
    private documentChunker: DocumentChunker;
    private embeddingService: EmbeddingService;
    private oramaIndex: OramaIndex;
    private synced: boolean;

    constructor(dependencies: {
        fileSyncService: FileSyncService;
        documentChunker: DocumentChunker;
        embeddingService: EmbeddingService;
        oramaIndex: OramaIndex;
    }) {
        this.fileSyncService = dependencies.fileSyncService;
        this.documentChunker = dependencies.documentChunker;
        this.embeddingService = dependencies.embeddingService;
        this.oramaIndex = dependencies.oramaIndex;
        this.synced = false;
    }

    /**
     * Sync project documents to Knowledge workspace
     */
    async syncProject(config: SyncConfig): Promise<ProjectKnowledgeSyncResult> {
        const startTime = Date.now();
        const errors: Array<{ path: string; error: string }> = [];
        let documentsSynced = 0;
        let chunksCreated = 0;
        let embeddingsGenerated = 0;

        try {
            // 1. Discover documents
            const files = await this.discoverDocuments(config);

            // 2. Filter by patterns
            const toSync = this.filterDocuments(files, config);

            // 3. Sync each document
            for (const filePath of toSync) {
                try {
                    // Read file content
                    const content = await this.fileSyncService.readFile(filePath);

                    // Create document
                    const doc: Document = {
                        id: `doc-${filePath}`,
                        projectId: config.projectId,
                        title: this.extractTitle(filePath),
                        content,
                        source: filePath,
                        sourceType: 'project',
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                    };

                    // Import to Knowledge workspace
                    await this.fileSyncService.writeFile(filePath, content);
                    documentsSynced++;

                    // Process through RAG pipeline
                    const ragResult = await this.processThroughRAG(doc);
                    chunksCreated += ragResult.chunks;
                    embeddingsGenerated += ragResult.embeddings;

                } catch (error) {
                    errors.push({
                        path: filePath,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    });
                }
            }

            this.synced = true;

            return {
                success: errors.length === 0,
                documentsSynced,
                chunksCreated,
                embeddingsGenerated,
                errors,
                duration: Date.now() - startTime
            };

        } catch (error) {
            return {
                success: false,
                documentsSynced,
                chunksCreated,
                embeddingsGenerated,
                errors: [{
                    path: 'root',
                    error: error instanceof Error ? error.message : 'Sync failed'
                }],
                duration: Date.now() - startTime
            };
        }
    }

    /**
     * Discover documents in project
     */
    private async discoverDocuments(_config: SyncConfig): Promise<string[]> {
        const allFiles = await this.fileSyncService.listFiles('.', true);
        return allFiles;
    }

    /**
     * Filter documents by patterns
     */
    private filterDocuments(files: string[], config: SyncConfig): string[] {
        return files.filter(file => {
            // Check include patterns
            const included = config.includePatterns.some(pattern =>
                file.match(new RegExp(pattern))
            );

            // Check exclude patterns
            const excluded = config.excludePatterns.some(pattern =>
                file.match(new RegExp(pattern))
            );

            return included && !excluded;
        });
    }

    /**
     * Process document through RAG pipeline
     */
    private async processThroughRAG(doc: Document): Promise<{
        chunks: number;
        embeddings: number;
    }> {
        // Chunk document
        const chunks = await this.documentChunker.chunkDocument(doc);

        // Generate embeddings
        const embeddings = await this.embeddingService.embedBatch(chunks);

        // Index in Orama
        await this.oramaIndex.indexBatch(embeddings);

        return {
            chunks: chunks.length,
            embeddings: embeddings.length
        };
    }

    /**
     * Extract title from file path
     */
    private extractTitle(filePath: string): string {
        const parts = filePath.split('/');
        const filename = parts[parts.length - 1];
        return filename.replace(/\.[^/.]+$/, '');
    }

    /**
     * Get sync status
     */
    isSynced(): boolean {
        return this.synced;
    }
}

/**
 * Factory function to create Project to Knowledge sync service
 */
export function createProjectKnowledgeSync(dependencies: {
    fileSyncService: FileSyncService;
    documentChunker: DocumentChunker;
    embeddingService: EmbeddingService;
    oramaIndex: OramaIndex;
}): ProjectKnowledgeSync {
    return new ProjectKnowledgeSync(dependencies);
}

/**
 * Default sync configuration for common project types
 */
export const DEFAULT_SYNC_CONFIG: SyncConfig = {
    projectId: 'default',
    includePatterns: [
        '\\.md$',      // Markdown
        '\\.txt$',     // Text
        '\\.rst$',     // reStructuredText
        '\\.json$',    // JSON
        '\\.yaml$',    // YAML
        '\\.yml$'      // YAML
    ],
    excludePatterns: [
        'node_modules/',
        '\\.git/',
        'dist/',
        'build/',
        '\\.min\\.js$', // Minified JS
        'package-lock\\.json',
        'yarn\\.lock'
    ],
    maxFileSize: 1024 * 1024 // 1MB
};
