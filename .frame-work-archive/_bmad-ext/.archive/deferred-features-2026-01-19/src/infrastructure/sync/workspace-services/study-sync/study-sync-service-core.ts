/**
 * @fileoverview Study File Sync Service Core
 * @module infrastructure/sync/workspace-services/study-sync/study-sync-service-core
 *
 * Core read-only file sync service implementation for Study workspace.
 *
 * @story ARCH-01.1.3
 */

import type {
    FileSyncService,
    FileMetadata,
    FileChangeEvent,
    SyncResult,
    SyncStatus,
    SyncOptions
} from '../file-sync-service';
import type { StudyFileSyncConfig, ImportResult } from './study-sync-types';
import type { LocalFSAdapter } from '@/infrastructure/filesystem';
import type { Quiz } from '@/lib/study/quiz-types';
import { StudyImportUtils } from './study-import-utils';

/**
 * Study File Sync Service (READ-ONLY)
 *
 * Provides read-only access to study materials (PDFs, quiz JSONs, Markdown).
 * Intentionally blocks write/delete operations to prevent accidental data loss.
 *
 * Features:
 * - Read-only file operations (read, list, metadata)
 * - Mount directory handle for browser-based access
 * - Change event listeners for file monitoring
 */
export class StudyFileSyncServiceCore implements FileSyncService {
    protected localAdapter: LocalFSAdapter;
    protected changeListeners: Set<(event: FileChangeEvent) => void>;
    protected disposed: boolean;

    constructor(config: StudyFileSyncConfig) {
        this.localAdapter = config.localAdapter;
        this.changeListeners = new Set();
        this.disposed = false;
    }

    async readFile(path: string): Promise<string> {
        this.checkDisposed();
        const result = await this.localAdapter.readFile(path);
        return result.content;
    }

    /**
     * READ-ONLY: Throws error to prevent data loss
     */
    async writeFile(_path: string, _content: string): Promise<void> {
        this.checkDisposed();
        throw new Error(
            'Study workspace is read-only. Cannot write files. ' +
            'Study materials are consumed, not created. Use the Knowledge or Notes workspaces for content creation.'
        );
    }

    /**
     * READ-ONLY: Throws error to prevent data loss
     */
    async deleteFile(_path: string): Promise<void> {
        this.checkDisposed();
        throw new Error(
            'Study workspace is read-only. Cannot delete files. ' +
            'This prevents accidental loss of study materials.'
        );
    }

    async listFiles(path: string, recursive = false): Promise<string[]> {
        this.checkDisposed();

        if (!recursive) {
            const entries = await this.localAdapter.listDirectory(path);
            return entries.map((e: { name: string }) => path ? `${path}/${e.name}` : e.name);
        }

        // Manual recursive traversal
        const results: string[] = [];
        const queue: string[] = [path];

        while (queue.length > 0) {
            const currentPath = queue.shift()!;

            try {
                const entries = await this.localAdapter.listDirectory(currentPath);

                for (const entry of entries) {
                    const entryPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
                    results.push(entryPath);

                    if (entry.type === 'directory') {
                        queue.push(entryPath);
                    }
                }
            } catch (error) {
                console.warn(`[StudyFileSyncService] Failed to list ${currentPath}:`, error);
            }
        }

        return results;
    }

    async getFileMetadata(path: string): Promise<FileMetadata> {
        this.checkDisposed();

        try {
            const result = await this.localAdapter.readFile(path);
            return {
                path,
                size: result.content.length,
                lastModified: Date.now(),
                contentType: this.inferContentType(path)
            };
        } catch (error) {
            throw new Error(`Failed to get metadata for ${path}: ${error}`);
        }
    }

    async writeBatch(_operations: Array<{ path: string; content: string }>): Promise<SyncResult> {
        this.checkDisposed();
        throw new Error(
            'Study workspace is read-only. Cannot write files in batch. ' +
            'Use read operations only.'
        );
    }

    async mount(_source: FileSystemDirectoryHandle): Promise<void> {
        this.checkDisposed();

        // LocalFSAdapter is already initialized with directory handle
        // This is a no-op but kept for interface consistency
        console.log('[StudyFileSyncService] Directory mounted successfully (read-only mode)');
    }

    async sync(_options?: SyncOptions): Promise<SyncResult> {
        this.checkDisposed();

        // Study workspace is read-only, so sync is a no-op
        return {
            success: true,
            filesProcessed: 0,
            errors: [],
            duration: 0
        };
    }

    getSyncStatus(): SyncStatus {
        return {
            syncing: false,
            lastSync: null,
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
        this.changeListeners.clear();
    }

    // ============================================================
    // Study-specific import methods
    // ============================================================

    /**
     * Import PDF files for flashcard generation
     * Scans mounted directory for PDF files and returns list
     */
    async importPDFAsFlashcards(directory: string): Promise<string[]> {
        this.checkDisposed();
        return StudyImportUtils.importPDFAsFlashcards(this.listFiles.bind(this), directory);
    }

    /**
     * Import quiz from JSON file
     * Validates and parses quiz JSON structure
     */
    async importQuizJSON(filePath: string): Promise<Quiz | null> {
        this.checkDisposed();
        return StudyImportUtils.importQuizJSON(this.readFile.bind(this), filePath);
    }

    /**
     * Import all study materials from directory
     * Scans for PDFs, quiz JSONs, and Markdown files
     */
    async importStudyMaterials(directory: string): Promise<ImportResult> {
        this.checkDisposed();
        return StudyImportUtils.importStudyMaterials(
            this.listFiles.bind(this),
            this.importQuizJSON.bind(this),
            directory
        );
    }

    // ============================================================
    // Protected helper methods
    // ============================================================

    protected checkDisposed(): void {
        if (this.disposed) {
            throw new Error('StudyFileSyncService has been disposed');
        }
    }

    protected inferContentType(path: string): string {
        const ext = path.split('.').pop()?.toLowerCase();

        switch (ext) {
            case 'pdf':
                return 'application/pdf';
            case 'json':
                return 'application/json';
            case 'md':
            case 'markdown':
                return 'text/markdown';
            case 'txt':
                return 'text/plain';
            default:
                return 'application/octet-stream';
        }
    }
}

/**
 * Backward compatibility alias
 * @deprecated Use StudyFileSyncServiceCore directly
 */
export const StudyFileSyncService = StudyFileSyncServiceCore;

/**
 * Factory function to create Study file sync service
 */
export function createStudyFileSyncService(config: StudyFileSyncConfig): StudyFileSyncServiceCore {
    return new StudyFileSyncServiceCore(config);
}
