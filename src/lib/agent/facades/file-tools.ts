/**
 * @fileoverview Agent File Tools Interface
 * @module lib/agent/facades/file-tools
 * 
 * Defines the stable contract for AI agent file operations.
 * This interface decouples agent tools from the underlying LocalFSAdapter/SyncManager.
 * 
 * @epic 12 - Agent Tool Interface Layer
 * @story 12-1 - Create AgentFileTools Facade
 */

/**
 * Entry in a file listing
 */
export interface FileEntry {
    /** File or directory name */
    name: string;
    /** Relative path from project root */
    path: string;
    /** Entry type */
    type: 'file' | 'directory';
    /** File size in bytes (files only) */
    size?: number;
}

/**
 * Result of a file read operation
 */
export interface FileReadResult {
    /** File content as string */
    content: string;
    /** File path that was read */
    path: string;
}

/**
 * Agent File Tools Interface
 *
 * Stable contract for AI agent file operations.
 * Implementation wraps LocalFSAdapter + SyncManager with event emission.
 */
export interface AgentFileTools {
    /**
     * Read a file's content
     * @param path - Relative path from project root
     * @returns File content or null if file doesn't exist
     */
    readFile(path: string): Promise<string | null>;

    /**
     * Write content to a file (creates if doesn't exist)
     * @param path - Relative path from project root
     * @param content - Content to write
     * @emits file:modified with source: 'agent'
     */
    writeFile(path: string, content: string): Promise<void>;

    /**
     * List contents of a directory
     * @param path - Relative path (empty string for root)
     * @param recursive - Whether to list recursively
     * @returns Array of file entries
     */
    listDirectory(path: string, recursive?: boolean): Promise<FileEntry[]>;

    /**
     * Create a new file
     * @param path - Relative path from project root
     * @param content - Initial content (default: empty string)
     * @emits file:created with source: 'agent'
     */
    createFile(path: string, content?: string): Promise<void>;

    /**
     * Delete a file
     * @param path - Relative path from project root
     * @emits file:deleted with source: 'agent'
     */
    deleteFile(path: string): Promise<void>;

    /**
     * Search for files by name pattern
     * @param query - Search query (substring match on filename)
     * @param basePath - Optional base path to search from
     * @returns Matching file entries
     */
    searchFiles(query: string, basePath?: string): Promise<FileEntry[]>;

    // ============================================================================
    // Advanced Operations (RC-007: Epic 4 Story 4.2 ACs)
    // ============================================================================

    /**
     * Read multiple files atomically
     * @param paths - Array of relative paths to read
     * @param signal - Optional AbortSignal for cancellation
     * @returns Array of FileReadResult in the same order as paths
     * @throws Error if any file read fails (none written if partial failure)
     */
    readMultiple(paths: string[], signal?: AbortSignal): Promise<FileReadResult[]>;

    /**
     * Write multiple files atomically with rollback on failure
     * @param files - Array of {path, content} objects to write
     * @param onProgress - Optional callback for progress tracking (0-100%)
     * @param signal - Optional AbortSignal for cancellation
     * @throws Error with RollbackInfo if any write fails (rollback triggered)
     */
    writeMultiple(
        files: Array<{ path: string; content: string }>,
        onProgress?: (progress: number) => void,
        signal?: AbortSignal
    ): Promise<void>;

    /**
     * Find files matching a glob pattern
     * @param pattern - Glob pattern (e.g., '**/*.ts', 'src/**/*.tsx')
     * @param basePath - Optional base path (defaults to project root)
     * @returns Array of matching file entries
     */
    globFiles(pattern: string, basePath?: string): Promise<FileEntry[]>;

    /**
     * Delete multiple files atomically with rollback
     * @param paths - Array of paths to delete
     * @param onProgress - Optional callback for progress tracking (0-100%)
     * @param signal - Optional AbortSignal for cancellation
     * @throws Error with RollbackInfo if any delete fails (rollback triggered)
     */
    deleteMultiple(
        paths: string[],
        onProgress?: (progress: number) => void,
        signal?: AbortSignal
    ): Promise<void>;
}

/**
 * Information about a batch operation that was rolled back
 */
export interface RollbackInfo {
    /** Total operations attempted */
    totalOperations: number;
    /** Operations completed before failure */
    completedOperations: number;
    /** Files that were written and need cleanup */
    writtenFiles: string[];
    /** The error that caused the rollback */
    cause: Error;
}

/**
 * Error thrown when batch operation fails and triggers rollback
 */
export class BatchOperationError extends Error {
    constructor(
        message: string,
        public readonly rollbackInfo: RollbackInfo
    ) {
        super(message);
        this.name = 'BatchOperationError';
    }
}

/**
 * Error thrown when path validation fails
 */
export class PathValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'PathValidationError';
    }
}

/**
 * Validate a file path for safety
 * @param path - Path to validate
 * @throws PathValidationError if path is invalid
 */
export function validatePath(path: string): void {
    if (path.includes('..')) {
        throw new PathValidationError('Path traversal (..) not allowed');
    }
    if (path.startsWith('/') || /^[a-zA-Z]:/.test(path)) {
        throw new PathValidationError('Absolute paths not allowed');
    }
}

/**
 * Normalize a path for FSA API compatibility
 * LLMs often use Unix conventions (., ./) that FSA doesn't understand
 * 
 * @param path - Path to normalize
 * @returns Normalized path suitable for FSA API
 * 
 * @example
 * normalizePath('.')        → ''      // Current directory = root
 * normalizePath('./src')    → 'src'   // Remove ./ prefix
 * normalizePath('./file.ts') → 'file.ts'
 * normalizePath('src/file') → 'src/file' // Already normalized
 */
export function normalizePath(path: string): string {
    // Handle '.' (current directory) → empty string (FSA root)
    if (path === '.') {
        return '';
    }
    // Handle './' prefix → remove it
    if (path.startsWith('./')) {
        return path.slice(2);
    }
    // Handle '.\\' prefix (Windows) → remove it
    if (path.startsWith('.\\')) {
        return path.slice(2);
    }
    return path;
}

