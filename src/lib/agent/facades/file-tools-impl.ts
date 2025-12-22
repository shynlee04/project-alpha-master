/**
 * @fileoverview Agent File Tools Facade Implementation
 * @module lib/agent/facades/file-tools-impl
 * 
 * Implementation of AgentFileTools interface.
 * Wraps LocalFSAdapter + SyncManager with event emission.
 * 
 * @epic 12 - Agent Tool Interface Layer
 * @story 12-1 - Create AgentFileTools Facade
 */

import type { AgentFileTools, FileEntry } from './file-tools';
import { validatePath, PathValidationError } from './file-tools';
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
 * All write operations emit events via EventBus with source: 'agent'.
 * All paths are validated for safety before operations.
 */
export class FileToolsFacade implements AgentFileTools {
    constructor(
        private readonly localFS: LocalFSAdapter,
        private readonly syncManager: SyncManager,
        private readonly eventBus: WorkspaceEventEmitter
    ) { }

    /**
     * Read a file's content
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
     */
    async writeFile(path: string, content: string): Promise<void> {
        validatePath(path);
        await this.syncManager.writeFile(path, content);
        this.eventBus.emit('file:modified', { path, source: 'agent', content });
    }

    /**
     * List contents of a directory
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
     */
    async createFile(path: string, content = ''): Promise<void> {
        validatePath(path);
        await this.syncManager.writeFile(path, content);
        this.eventBus.emit('file:created', { path, source: 'agent' });
    }

    /**
     * Delete a file
     */
    async deleteFile(path: string): Promise<void> {
        validatePath(path);
        await this.syncManager.deleteFile(path);
        this.eventBus.emit('file:deleted', { path, source: 'agent' });
    }

    /**
     * Search for files by name pattern
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
    eventBus: WorkspaceEventEmitter
): AgentFileTools {
    return new FileToolsFacade(localFS, syncManager, eventBus);
}
