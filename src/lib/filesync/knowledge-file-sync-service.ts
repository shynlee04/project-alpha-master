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
import type { SourceRecord } from '@/lib/state/dexie-db-knowledge-types';
import { SyncError } from '@/lib/filesystem/sync-types';

/**
 * Configuration for Knowledge file sync service
 */
export interface KnowledgeFileSyncConfig extends FileSyncConfig {
    onDocumentImport?: (source: SourceRecord) => Promise<void>;
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
 * In-memory source storage (simplified implementation)
 * In production, this would use IndexedDB via the knowledge store
 */
class SourceStore {
    private sources = new Map<string, SourceRecord>();

    async get(path: string): Promise<SourceRecord | undefined> {
        return this.sources.get(path);
    }

    async set(path: string, source: SourceRecord): Promise<void> {
        this.sources.set(path, source);
    }

    async delete(path: string): Promise<void> {
        this.sources.delete(path);
    }

    async list(): Promise<SourceRecord[]> {
        return Array.from(this.sources.values());
    }

    async clear(): Promise<void> {
        this.sources.clear();
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
    private sourceStore: SourceStore;
    private onDocumentImport?: (source: SourceRecord) => Promise<void>;
    private changeListeners: Set<(event: FileChangeEvent) => void>;
    private disposed: boolean;
    private lastSync: number | null;

    constructor(config: KnowledgeFileSyncConfig) {
        this.projectId = config.projectId;
        this.onDocumentImport = config.onDocumentImport;
        this.sourceStore = new SourceStore();
        this.changeListeners = new Set();
        this.disposed = false;
        this.lastSync = null;
    }

    async readFile(path: string): Promise<string> {
        this.checkDisposed();
        const source = await this.sourceStore.get(path);
        if (!source) {
            throw new Error(`Source not found: ${path}`);
        }
        return source.content;
    }

    async writeFile(path: string, content: string): Promise<void> {
        this.checkDisposed();

        // Validate file format
        if (!this.isSupportedFormat(path)) {
            throw new Error(`Unsupported file format: ${path}`);
        }

        // Create source record
        const source: SourceRecord = {
            id: `${this.projectId}-${path}`,
            projectId: this.projectId,
            type: 'text',
            title: this.extractTitle(path),
            content,
            charCount: content.length,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        // Store source
        await this.sourceStore.set(path, source);

        // Trigger RAG pipeline import
        if (this.onDocumentImport) {
            await this.onDocumentImport(source);
        }

        this.emitChange({ type: 'created', path, timestamp: Date.now() });
    }

    async deleteFile(path: string): Promise<void> {
        this.checkDisposed();
        await this.sourceStore.delete(path);
        this.emitChange({ type: 'deleted', path, timestamp: Date.now() });
    }

    async listFiles(path: string, _recursive = false): Promise<string[]> {
        this.checkDisposed();
        const sources = await this.sourceStore.list();

        if (path === '' || path === '.') {
            // List all sources
            return sources.map(s => s.id);
        }

        // Filter by path prefix
        return sources
            .filter(s => s.id.startsWith(path))
            .map(s => s.id);
    }

    async getFileMetadata(path: string): Promise<FileMetadata> {
        this.checkDisposed();
        const source = await this.sourceStore.get(path);
        if (!source) {
            throw new Error(`Source not found: ${path}`);
        }

        return {
            path,
            size: source.content.length,
            lastModified: source.updatedAt,
            contentType: this.getContentType(path)
        };
    }

    async writeBatch(operations: Array<{ path: string; content: string }>): Promise<SyncResult> {
        this.checkDisposed();
        const startTime = Date.now();
        const errors: SyncError[] = [];
        let processed = 0;

        for (const op of operations) {
            try {
                await this.writeFile(op.path, op.content);
                processed++;
            } catch (error) {
                errors.push(new SyncError(
                    error instanceof Error ? error.message : 'Unknown error',
                    'FILE_WRITE_FAILED',
                    op.path
                ));
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
        const sources = await this.sourceStore.list();

        this.lastSync = Date.now();

        return {
            success: true,
            filesProcessed: sources.length,
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
        await this.sourceStore.clear();
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
