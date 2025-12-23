/**
 * @fileoverview Agent File Tools Facade Implementation
 * @module lib/agent/facades/file-tools-impl
 * 
 * Implementation of AgentFileTools interface.
 * Wraps LocalFSAdapter + SyncManager with event emission.
 * Includes file-level locking for concurrent operation safety.
 * 
 * @epic 12 - Agent Tool Interface Layer
 * @story 12-1 - Create AgentFileTools Facade
 * @story 12-1B - Add Concurrency Control to FileToolsFacade
 */

import type { AgentFileTools, FileEntry } from './file-tools';
import { validatePath, PathValidationError } from './file-tools';
import { FileLock, fileLock as defaultFileLock } from './file-lock';
import type { LocalFSAdapter } from '@/lib/filesystem/local-fs-adapter';
import type { SyncManager } from '@/lib/filesystem/sync-manager';
import type { WorkspaceEventEmitter } from '@/lib/events/workspace-events';

export { PathValidationError };

/**
 * FileToolsFacade - Implementation of AgentFileTools
 * 
 * Wraps LocalFSAdapter (reads) and SyncManager (writes) to provide
 * a stable API for AI agent file operations.
 * 
 * All write operations:
 * - Acquire file-level lock before operation
 * - Emit events via EventBus with source: 'agent' and lock timestamps
 * - Release lock in finally block (even on error)
 */
export class FileToolsFacade implements AgentFileTools {
    constructor(
        private readonly localFS: LocalFSAdapter,
        private readonly syncManager: SyncManager,
        private readonly eventBus: WorkspaceEventEmitter,
        private readonly fileLock: FileLock = defaultFileLock
    ) { }

    /**
     * Read a file's content (no lock required for reads)
     */
    async readFile(path: string): Promise<string | null> {
        validatePath(path);
        try {
            const result = await this.localFS.readFile(path);
            return result.content;
        } catch (error) {
            // File not found returns null
            if ((error as Error).message?.includes('not found') ||
                (error as Error).message?.includes('NOT_FOUND')) {
                return null;
            }
            throw error;
        }
    }

    /**
     * Write content to a file (creates if doesn't exist)
     * Uses SyncManager for dual-write to LocalFS + WebContainer
     * @story 12-1B - Now includes file-level locking
     */
    async writeFile(path: string, content: string): Promise<void> {
        validatePath(path);
        const lockAcquired = await this.fileLock.acquire(path);
        try {
            await this.syncManager.writeFile(path, content);
            const lockReleased = Date.now();
            this.eventBus.emit('file:modified', {
                path,
                source: 'agent',
                content,
                lockAcquired,
                lockReleased
            });
        } finally {
            this.fileLock.release(path);
        }
    }

    /**
     * List contents of a directory (no lock required for reads)
     */
    async listDirectory(path: string = '', recursive = false): Promise<FileEntry[]> {
        validatePath(path);
        const entries = await this.localFS.listDirectory(path);
        const result: FileEntry[] = entries.map(e => ({
            name: e.name,
            path: path ? `${path}/${e.name}` : e.name,
            type: e.type,
        }));

        if (recursive) {
            const dirs = result.filter(e => e.type === 'directory');
            for (const dir of dirs) {
                const subEntries = await this.listDirectory(dir.path, true);
                result.push(...subEntries);
            }
        }
        return result;
    }

    /**
     * Create a new file
     * @story 12-1B - Now includes file-level locking
     */
    async createFile(path: string, content = ''): Promise<void> {
        validatePath(path);
        const lockAcquired = await this.fileLock.acquire(path);
        try {
            await this.syncManager.writeFile(path, content);
            const lockReleased = Date.now();
            this.eventBus.emit('file:created', {
                path,
                source: 'agent',
                lockAcquired,
                lockReleased
            });
        } finally {
            this.fileLock.release(path);
        }
    }

    /**
     * Delete a file
     * @story 12-1B - Now includes file-level locking
     */
    async deleteFile(path: string): Promise<void> {
        validatePath(path);
        const lockAcquired = await this.fileLock.acquire(path);
        try {
            await this.syncManager.deleteFile(path);
            const lockReleased = Date.now();
            this.eventBus.emit('file:deleted', {
                path,
                source: 'agent',
                lockAcquired,
                lockReleased
            });
        } finally {
            this.fileLock.release(path);
        }
    }

    /**
     * Search for files by name pattern (no lock required for reads)
     */
    async searchFiles(query: string, basePath = ''): Promise<FileEntry[]> {
        validatePath(basePath);
        const allFiles = await this.listDirectory(basePath, true);
        const lowerQuery = query.toLowerCase();
        return allFiles.filter(f =>
            f.type === 'file' && f.name.toLowerCase().includes(lowerQuery)
        );
    }
}

/**
 * Factory function to create FileToolsFacade
 */
export function createFileToolsFacade(
    localFS: LocalFSAdapter,
    syncManager: SyncManager,
    eventBus: WorkspaceEventEmitter,
    fileLock: FileLock = defaultFileLock
): AgentFileTools {
    return new FileToolsFacade(localFS, syncManager, eventBus, fileLock);
}

