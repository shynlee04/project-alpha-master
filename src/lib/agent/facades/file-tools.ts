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
