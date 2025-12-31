/**
 * @fileoverview Knowledge File Sync Service Implementation
 * @module lib/filesync/knowledge-file-sync-service
 *
 * File sync service for Knowledge workspace.
 * Handles document imports and RAG pipeline integration.
 *
 * @epic CW-01 - Abstract File Sync Service
 */

import type {
    FileSyncService,
    FileMetadata,
    FileChangeEvent,
    SyncResult,
    SyncStatus,
    SyncOptions,
    FileSyncConfig
} from './file-sync-service';
import type { Document } from '../rag/types';

/**
 * Configuration for Knowledge file sync service
 */
export interface KnowledgeFileSyncConfig extends FileSyncConfig {
    onDocumentImport?: (document: Document) => Promise<void>;
}

/**
 * Supported document formats for Knowledge workspace
 */
const SUPPORTED_FORMATS = [
    '.txt',
    '.md',
    '.rst',
    '.pdf',
    '.html',
    '.htm',
    '.json'
];

/**
 * Default exclusions for Knowledge workspace
 */
const DEFAULT_EXCLUSIONS = [
    'node_modules/',
    '.git/',
    'package-lock.json',
    'yarn.lock',
    '.DS_Store'
];

/**
 * In-memory document storage (simplified implementation)
 * In production, this would use IndexedDB via the knowledge store
 */
class DocumentStore {
    private documents = new Map<string, Document>();

    async get(path: string): Promise<Document | undefined> {
        return this.documents.get(path);
    }

    async set(path: string, doc: Document): Promise<void> {
        this.documents.set(path, doc);
    }

    async delete(path: string): Promise<void> {
        this.documents.delete(path);
    }

    async list(): Promise<Document[]> {
        return Array.from(this.documents.values());
    }

    async clear(): Promise<void> {
        this.documents.clear();
    }
}

/**
 * Knowledge File Sync Service
 *
 * Handles document imports for the Knowledge workspace.
 * Stores documents in memory and triggers RAG pipeline integration.
 *
 * Features:
 * - Document import from file system
 * - Format validation
 * - Metadata extraction hooks
 * - RAG pipeline integration
 */
export class KnowledgeFileSyncService implements FileSyncService {
    private projectId: string;
    private options: SyncOptions;
    private documentStore: DocumentStore;
    private onDocumentImport?: (document: Document) => Promise<void>;
    private changeListeners: Set<(event: FileChangeEvent) => void>;
    private disposed: boolean;
    private lastSync: number | null;

    constructor(config: KnowledgeFileSyncConfig) {
        this.projectId = config.projectId;
        this.options = config.syncOptions || {};
        this.onDocumentImport = config.onDocumentImport;
        this.documentStore = new DocumentStore();
        this.changeListeners = new Set();
        this.disposed = false;
        this.lastSync = null;
    }

    async readFile(path: string): Promise<string> {
        this.checkDisposed();
        const doc = await this.documentStore.get(path);
        if (!doc) {
            throw new Error(`Document not found: ${path}`);
        }
        return doc.content;
    }

    async writeFile(path: string, content: string): Promise<void> {
        this.checkDisposed();

        // Validate file format
        if (!this.isSupportedFormat(path)) {
            throw new Error(`Unsupported file format: ${path}`);
        }

        // Create document
        const doc: Document = {
            id: `${this.projectId}-${path}`,
            projectId: this.projectId,
            title: this.extractTitle(path),
            content,
            source: path,
            sourceType: 'imported',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        // Store document
        await this.documentStore.set(path, doc);

        // Trigger RAG pipeline import
        if (this.onDocumentImport) {
            await this.onDocumentImport(doc);
        }

        this.emitChange({ type: 'created', path, timestamp: Date.now() });
    }

    async deleteFile(path: string): Promise<void> {
        this.checkDisposed();
        await this.documentStore.delete(path);
        this.emitChange({ type: 'deleted', path, timestamp: Date.now() });
    }

    async listFiles(path: string, recursive = false): Promise<string[]> {
        this.checkDisposed();
        const docs = await this.documentStore.list();

        if (path === '' || path === '.') {
            // List all documents
            return docs.map(d => d.source);
        }

        // Filter by path prefix
        return docs
            .filter(d => d.source.startsWith(path))
            .map(d => d.source);
    }

    async getFileMetadata(path: string): Promise<FileMetadata> {
        this.checkDisposed();
        const doc = await this.documentStore.get(path);
        if (!doc) {
            throw new Error(`Document not found: ${path}`);
        }

        return {
            path,
            size: doc.content.length,
            lastModified: doc.updatedAt,
            contentType: this.getContentType(path)
        };
    }

    async writeBatch(operations: Array<{ path: string; content: string }>): Promise<SyncResult> {
        this.checkDisposed();
        const startTime = Date.now();
        const errors: Array<{ path: string; error: string; code?: string }> = [];
        let processed = 0;

        for (const op of operations) {
            try {
                await this.writeFile(op.path, op.content);
                processed++;
            } catch (error) {
                errors.push({
                    path: op.path,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        return {
            success: errors.length === 0,
            filesProcessed: processed,
            errors,
            duration: Date.now() - startTime
        };
    }

    async mount(_source: FileSystemDirectoryHandle): Promise<void> {
        this.checkDisposed();
        // Knowledge workspace doesn't use File System Access API for mounting
        // Documents are imported via SourceImportDialog
        console.log('[KnowledgeFileSyncService] Documents imported via dialog');
    }

    async sync(_options?: SyncOptions): Promise<SyncResult> {
        this.checkDisposed();
        const startTime = Date.now();
        const docs = await this.documentStore.list();

        this.lastSync = Date.now();

        return {
            success: true,
            filesProcessed: docs.length,
            errors: [],
            duration: Date.now() - startTime
        };
    }

    getSyncStatus(): SyncStatus {
        return {
            syncing: false,
            lastSync: this.lastSync,
            filesProcessed: 0,
            error: null
        };
    }

    onFileChange(callback: (event: FileChangeEvent) => void): () => void {
        this.checkDisposed();
        this.changeListeners.add(callback);
        return () => {
            this.changeListeners.delete(callback);
        };
    }

    async dispose(): Promise<void> {
        this.disposed = true;
        await this.documentStore.clear();
        this.changeListeners.clear();
    }

    private isSupportedFormat(path: string): boolean {
        return SUPPORTED_FORMATS.some(format => path.endsWith(format));
    }

    private extractTitle(path: string): string {
        // Extract title from file path
        const parts = path.split('/');
        const filename = parts[parts.length - 1];
        return filename.replace(/\.[^/.]+$/, ''); // Remove extension
    }

    private getContentType(path: string): string {
        const ext = path.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'txt':
                return 'text/plain';
            case 'md':
                return 'text/markdown';
            case 'html':
            case 'htm':
                return 'text/html';
            case 'json':
                return 'application/json';
            case 'pdf':
                return 'application/pdf';
            default:
                return 'text/plain';
        }
    }

    private emitChange(event: FileChangeEvent): void {
        this.changeListeners.forEach(callback => {
            try {
                callback(event);
            } catch (error) {
                console.error('[KnowledgeFileSyncService] Error in change listener:', error);
            }
        });
    }

    private checkDisposed(): void {
        if (this.disposed) {
            throw new Error('KnowledgeFileSyncService has been disposed');
        }
    }
}

/**
 * Factory function to create Knowledge file sync service
 */
export function createKnowledgeFileSyncService(config: KnowledgeFileSyncConfig): KnowledgeFileSyncService {
    return new KnowledgeFileSyncService(config);
}
