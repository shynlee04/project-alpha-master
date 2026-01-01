/**
 * @fileoverview Agent File Tools Facade Implementation
 * @module lib/agent/facades/file-tools-impl
 *
 * Implementation of AgentFileTools interface.
 * Wraps LocalFSAdapter + SyncManager with event emission.
 * Includes file-level locking for concurrent operation safety.
 * Includes permission checks via ToolPermissionManager.
 *
 * @epic 12 - Agent Tool Interface Layer
 * @story 12-1 - Create AgentFileTools Facade
 * @story 12-1B - Add Concurrency Control to FileToolsFacade
 * @fix RC-028-001 - Wire ToolPermissionManager to execution layer
 */

import type { AgentFileTools, FileEntry, RollbackInfo, FileReadResult } from './file-tools';
import { BatchOperationError } from './file-tools';
import { validatePath, normalizePath, PathValidationError } from './file-tools';
import { FileLock, fileLock as defaultFileLock } from './file-lock';
import type { LocalFSAdapter } from '@/lib/filesystem/local-fs-adapter';
import type { SyncManager } from '@/lib/filesystem/sync-manager';
import type { WorkspaceEventEmitter } from '@/lib/events/workspace-events';
import { ToolPermissionManager, PermissionCheckResult } from '../tool-permission-manager';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';

export { PathValidationError };

/**
 * Error thrown when tool execution is blocked by permission settings
 */
export class ToolPermissionDeniedError extends Error {
    constructor(
        message: string,
        public readonly toolName: string,
        public readonly reason: PermissionCheckResult['reason']
    ) {
        super(message);
        this.name = 'ToolPermissionDeniedError';
    }
}

/**
 * FileToolsFacade - Implementation of AgentFileTools
 *
 * Wraps LocalFSAdapter (reads) and SyncManager (writes) to provide
 * a stable API for AI agent file operations.
 *
 * All operations:
 * - Check permission via ToolPermissionManager before execution
 * - Write operations: Acquire file-level lock before operation
 * - Emit events via EventBus with source: 'agent' and lock timestamps
 * - Release lock in finally block (even on error)
 *
 * @fix RC-028-001 - Wire ToolPermissionManager to execution layer
 */
export class FileToolsFacade implements AgentFileTools {
    private readonly permissionManager: ToolPermissionManager;
    private readonly workspaceType: WorkspaceType;

    constructor(
        private readonly localFS: LocalFSAdapter,
        private readonly syncManager: SyncManager,
        private readonly eventBus: WorkspaceEventEmitter,
        private readonly fileLock: FileLock = defaultFileLock,
        permissionManager?: ToolPermissionManager,
        workspaceType?: WorkspaceType
    ) {
        this.permissionManager = permissionManager || ToolPermissionManager.getInstance();
        // Ralph Loop 51-3: Default to 'ide' workspace for backward compatibility
        this.workspaceType = workspaceType ?? 'ide';
    }

    /**
     * Check permission before tool execution
     * Ralph Loop 51-3: Now checks workspace-scoped permissions
     * @throws ToolPermissionDeniedError if tool cannot execute
     */
    private checkPermission(toolId: string): void {
        const result = this.permissionManager.checkPermission(toolId, this.workspaceType);

        if (!result.canExecute) {
            let userMessage: string;

            switch (result.reason) {
                case 'block':
                    userMessage = `The "${result.toolName}" tool is blocked by your security settings. You can change this in Agent Settings.`;
                    break;
                case 'prompt':
                    userMessage = `The "${result.toolName}" tool requires your approval before execution. Please approve this action when prompted.`;
                    break;
                default:
                    userMessage = `Permission denied for "${result.toolName}" tool.`;
            }

            throw new ToolPermissionDeniedError(
                userMessage,
                result.toolName,
                result.reason
            );
        }

        // Log for debugging (auto-approved or session-trusted tools)
        if (result.reason === 'auto' || result.reason === 'session') {
            console.log(`[FileToolsFacade] Permission granted for ${result.toolName} (reason: ${result.reason})`);
        }
    }

    /**
     * Read a file's content (no lock required for reads)
     * @fix RC-028-001 - Added permission check
     */
    async readFile(path: string): Promise<string | null> {
        // RC-028-001: Check permission before execution
        this.checkPermission('read_file');

        const normalizedPath = normalizePath(path);
        validatePath(normalizedPath);
        try {
            const result = await this.localFS.readFile(normalizedPath);
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
     * @fix RC-028-001 - Added permission check
     */
    async writeFile(path: string, content: string): Promise<void> {
        // RC-028-001: Check permission before execution
        this.checkPermission('write_file');

        const normalizedPath = normalizePath(path);
        validatePath(normalizedPath);
        console.log('[FileToolsFacade] writeFile called:', { path, normalizedPath, contentLength: content.length });
        const lockAcquired = await this.fileLock.acquire(normalizedPath);
        try {
            await this.syncManager.writeFile(normalizedPath, content);
            const lockReleased = Date.now();
            console.log('[FileToolsFacade] Emitting file:modified event:', { path, source: 'agent' });
            this.eventBus.emit('file:modified', {
                path,
                source: 'agent',
                content,
                lockAcquired,
                lockReleased
            });
        } finally {
            this.fileLock.release(normalizedPath);
        }
    }

    /**
     * List contents of a directory (no lock required for reads)
     * @fix RC-028-001 - Added permission check
     */
    async listDirectory(path: string = '', recursive = false): Promise<FileEntry[]> {
        // RC-028-001: Check permission before execution
        this.checkPermission('list_files');

        // Use centralized normalizePath for consistent handling of '.', './', etc.
        const normalizedPath = normalizePath(path);
        validatePath(normalizedPath);
        const entries = await this.localFS.listDirectory(normalizedPath);
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
     * @fix RC-028-001 - Added permission check
     */
    async createFile(path: string, content = ''): Promise<void> {
        // RC-028-001: Check permission before execution
        this.checkPermission('write_file');

        const normalizedPath = normalizePath(path);
        validatePath(normalizedPath);
        console.log('[FileToolsFacade] createFile called:', { path, normalizedPath, contentLength: content.length });
        const lockAcquired = await this.fileLock.acquire(normalizedPath);
        try {
            await this.syncManager.writeFile(normalizedPath, content);
            const lockReleased = Date.now();
            console.log('[FileToolsFacade] Emitting file:created event:', { path, source: 'agent' });
            this.eventBus.emit('file:created', {
                path,
                source: 'agent',
                lockAcquired,
                lockReleased
            });
        } finally {
            this.fileLock.release(normalizedPath);
        }
    }

    /**
     * Delete a file
     * @story 12-1B - Now includes file-level locking
     * @fix RC-028-001 - Added permission check (BLOCKED by default!)
     */
    async deleteFile(path: string): Promise<void> {
        // RC-028-001: Check permission before execution
        // Note: delete_file defaults to 'block' trust level - user must explicitly allow
        this.checkPermission('delete_file');

        const normalizedPath = normalizePath(path);
        validatePath(normalizedPath);
        const lockAcquired = await this.fileLock.acquire(normalizedPath);
        try {
            await this.syncManager.deleteFile(normalizedPath);
            const lockReleased = Date.now();
            this.eventBus.emit('file:deleted', {
                path,
                source: 'agent',
                lockAcquired,
                lockReleased
            });
        } finally {
            this.fileLock.release(normalizedPath);
        }
    }

    /**
     * Search for files by name pattern (no lock required for reads)
     * @fix RC-028-001 - Added permission check
     */
    async searchFiles(query: string, basePath = ''): Promise<FileEntry[]> {
        // RC-028-001: Check permission before execution
        this.checkPermission('list_files');

        const normalizedBasePath = normalizePath(basePath);
        validatePath(normalizedBasePath);
        const allFiles = await this.listDirectory(normalizedBasePath, true);
        const lowerQuery = query.toLowerCase();
        return allFiles.filter(f =>
            f.type === 'file' && f.name.toLowerCase().includes(lowerQuery)
        );
    }

    // ============================================================================
    // Advanced Operations (RC-007: Epic 4 Story 4.2 ACs)
    // ============================================================================

    /**
     * Read multiple files atomically
     * @fix RC-028-001 - Added permission check
     */
    async readMultiple(paths: string[], signal?: AbortSignal): Promise<FileReadResult[]> {
        // RC-028-001: Check permission before execution
        this.checkPermission('read_file');

        // Check if aborted before starting
        if (signal?.aborted) {
            throw new Error('Operation was aborted');
        }

        const results: FileReadResult[] = [];
        for (let i = 0; i < paths.length; i++) {
            // Check abort between each file
            if (signal?.aborted) {
                throw new Error('Operation was aborted');
            }

            const path = paths[i];
            const normalizedPath = normalizePath(path);
            validatePath(normalizedPath);

            try {
                const content = await this.readFile(normalizedPath);
                results.push({ path: normalizedPath, content: content ?? '' });
            } catch (error) {
                throw new Error(`Failed to read file "${path}": ${(error as Error).message}`);
            }
        }
        return results;
    }

    /**
     * Write multiple files atomically with rollback on failure
     * @fix RC-028-001 - Added permission check
     */
    async writeMultiple(
        files: Array<{ path: string; content: string }>,
        onProgress?: (progress: number) => void,
        signal?: AbortSignal
    ): Promise<void> {
        // RC-028-001: Check permission before execution
        this.checkPermission('write_file');

        if (signal?.aborted) {
            throw new Error('Operation was aborted');
        }

        if (files.length === 0) {
            onProgress?.(100);
            return;
        }

        const writtenFiles: string[] = [];
        let completedOperations = 0;
        const totalOperations = files.length;

        try {
            for (let i = 0; i < files.length; i++) {
                // Check abort between each file
                if (signal?.aborted) {
                    throw new Error('Operation was aborted');
                }

                const { path, content } = files[i];
                const normalizedPath = normalizePath(path);
                validatePath(normalizedPath);

                // Acquire lock and write
                const lockAcquired = await this.fileLock.acquire(normalizedPath);
                try {
                    await this.syncManager.writeFile(normalizedPath, content);
                    writtenFiles.push(normalizedPath);

                    // Emit event for each file
                    this.eventBus.emit('file:modified', {
                        path: normalizedPath,
                        source: 'agent',
                        content,
                        lockAcquired,
                        lockReleased: Date.now()
                    });
                } finally {
                    this.fileLock.release(normalizedPath);
                }

                completedOperations++;
                onProgress?.(Math.round((completedOperations / totalOperations) * 100));
            }
            onProgress?.(100);
        } catch (error) {
            // Rollback: delete all files that were successfully written
            const rollbackInfo: RollbackInfo = {
                totalOperations,
                completedOperations,
                writtenFiles,
                cause: error as Error
            };

            // Perform rollback
            for (const filePath of writtenFiles) {
                try {
                    await this.syncManager.deleteFile(filePath);
                    this.eventBus.emit('file:deleted', {
                        path: filePath,
                        source: 'agent',
                        lockAcquired: Date.now(),
                        lockReleased: Date.now()
                    });
                } catch (rollbackError) {
                    // Log but don't fail - best effort rollback
                    console.error(`[FileToolsFacade] Rollback failed for ${filePath}:`, rollbackError);
                }
            }

            // Create BatchOperationError with rollback info
            const batchError = new BatchOperationError(
                `Batch write failed after ${completedOperations}/${totalOperations} files. Rolled back ${writtenFiles.length} files.`,
                rollbackInfo
            ) as BatchOperationError;
            throw batchError;
        }
    }

    /**
     * Find files matching a glob pattern
     * Supports basic glob patterns: `**`/ `*`.ext, `src`/ `**`/ `*`, etc.
     * @fix RC-028-001 - Added permission check
     */
    async globFiles(pattern: string, basePath = ''): Promise<FileEntry[]> {
        // RC-028-001: Check permission before execution
        this.checkPermission('list_files');

        const normalizedBasePath = normalizePath(basePath);
        validatePath(normalizedBasePath);

        // Get all files recursively
        const allFiles = await this.listDirectory(normalizedBasePath, true);

        // Parse glob pattern
        const { dirPattern, extension } = this.parseGlobPattern(pattern);

        return allFiles.filter(entry => {
            if (entry.type !== 'file') return false;

            // Check extension first (most common filter)
            if (extension && !entry.name.endsWith(extension)) {
                return false;
            }

            // Check directory pattern if specified
            if (dirPattern) {
                const normalizedDirPattern = dirPattern.replace(/\*\*/g, '**').replace(/\*/g, '*');
                return this.matchGlob(entry.path, normalizedDirPattern);
            }

            return true;
        });
    }

    /**
     * Parse a glob pattern into directory pattern and extension
     */
    private parseGlobPattern(pattern: string): { dirPattern: string; extension: string } {
        // Handle patterns like "**/*.ts", "src/**/*.tsx", "*.json"
        const parts = pattern.split(/[\/*]/).filter(Boolean);

        let dirPattern = '';
        let extension = '';

        // Find where the extension starts (after the last ** or *)
        // Workaround for ES2022: use reverse + findIndex instead of findLastIndex (ES2023)
        const lastWildcardIndex = parts.length - 1 - [...parts].reverse().findIndex((p: string) => p.includes('*'));

        if (lastWildcardIndex !== -1) {
            // Directory pattern is everything up to and including the last wildcard segment
            dirPattern = parts.slice(0, lastWildcardIndex + 1).join('/');

            // Extension is everything after the last wildcard (if it's not a wildcard itself)
            const extensionPart = parts.slice(lastWildcardIndex + 1).join('/');
            if (extensionPart && !extensionPart.includes('*')) {
                extension = extensionPart;
            }
        } else {
            // No wildcard - it's just a file name or extension pattern
            const extensionPart = parts.join('/');
            if (extensionPart && !extensionPart.includes('*')) {
                extension = extensionPart;
            }
        }

        return { dirPattern, extension };
    }

    /**
     * Match a path against a glob pattern
     * Supports ** (recursive), * (single segment)
     */
    private matchGlob(path: string, pattern: string): boolean {
        // Convert glob pattern to regex
        const regexPattern = pattern
            .replace(/\*\*/g, '{{DOUBLE_STAR}}')
            .replace(/\*/g, '{{STAR}}')
            .replace(/\./g, '\\.')
            .replace(/\{\{DOUBLE_STAR\}\}/g, '.*')
            .replace(/\{\{STAR\}\}/g, '[^/]*');

        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(path);
    }

    /**
     * Delete multiple files atomically with rollback
     * @fix RC-028-001 - Added permission check (BLOCKED by default!)
     */
    async deleteMultiple(
        paths: string[],
        onProgress?: (progress: number) => void,
        signal?: AbortSignal
    ): Promise<void> {
        // RC-028-001: Check permission before execution
        // Note: delete_file defaults to 'block' trust level - user must explicitly allow
        this.checkPermission('delete_file');

        if (signal?.aborted) {
            throw new Error('Operation was aborted');
        }

        if (paths.length === 0) {
            onProgress?.(100);
            return;
        }

        const deletedFiles: string[] = [];
        let completedOperations = 0;
        const totalOperations = paths.length;

        try {
            for (let i = 0; i < paths.length; i++) {
                // Check abort between each file
                if (signal?.aborted) {
                    throw new Error('Operation was aborted');
                }

                const path = paths[i];
                const normalizedPath = normalizePath(path);
                validatePath(normalizedPath);

                // Acquire lock and delete
                const lockAcquired = await this.fileLock.acquire(normalizedPath);
                try {
                    await this.syncManager.deleteFile(normalizedPath);
                    deletedFiles.push(normalizedPath);

                    // Emit event for each file
                    this.eventBus.emit('file:deleted', {
                        path: normalizedPath,
                        source: 'agent',
                        lockAcquired,
                        lockReleased: Date.now()
                    });
                } finally {
                    this.fileLock.release(normalizedPath);
                }

                completedOperations++;
                onProgress?.(Math.round((completedOperations / totalOperations) * 100));
            }
            onProgress?.(100);
        } catch (error) {
            // Rollback: re-create all files that were successfully deleted
            const rollbackInfo: RollbackInfo = {
                totalOperations,
                completedOperations,
                writtenFiles: deletedFiles, // Re-using field name for consistency
                cause: error as Error
            };

            // Perform rollback (re-create files)
            for (const filePath of deletedFiles) {
                try {
                    await this.syncManager.writeFile(filePath, '');
                    this.eventBus.emit('file:created', {
                        path: filePath,
                        source: 'agent',
                        lockAcquired: Date.now(),
                        lockReleased: Date.now()
                    });
                } catch (rollbackError) {
                    // Log but don't fail - best effort rollback
                    console.error(`[FileToolsFacade] Rollback failed for ${filePath}:`, rollbackError);
                }
            }

            // Create BatchOperationError with rollback info
            const batchError = new BatchOperationError(
                `Batch delete failed after ${completedOperations}/${totalOperations} files. Rolled back ${deletedFiles.length} files.`,
                rollbackInfo
            ) as BatchOperationError;
            throw batchError;
        }
    }
}

/**
 * Factory function to create FileToolsFacade
 * @param permissionManager - Optional permission manager for testing
 * @param workspaceType - Optional workspace type for workspace-scoped permissions (defaults to 'ide')
 */
export function createFileToolsFacade(
    localFS: LocalFSAdapter,
    syncManager: SyncManager,
    eventBus: WorkspaceEventEmitter,
    fileLock: FileLock = defaultFileLock,
    permissionManager?: ToolPermissionManager,
    workspaceType?: WorkspaceType
): AgentFileTools {
    return new FileToolsFacade(localFS, syncManager, eventBus, fileLock, permissionManager, workspaceType);
}

