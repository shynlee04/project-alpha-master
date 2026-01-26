/**
 * File System Constants
 * @module lib/filesystem/constants
 *
 * Defines constants for file system operations including size limits,
 * depth limits, and performance thresholds.
 */

export const FILE_CONSTANTS = {
    /** Maximum file size in bytes (10MB) */
    MAX_FILE_SIZE: 10 * 1024 * 1024,

    /** Maximum recursion depth for directory listing */
    MAX_RECURSION_DEPTH: 3,

    /** Warning threshold for large files (5MB) - for early warnings */
    WARNING_THRESHOLD: 5 * 1024 * 1024,

    /** Chunk size for streaming large files (64KB) */
    CHUNK_SIZE: 64 * 1024,

    /** Performance target for file operations in milliseconds */
    PERFORMANCE_TARGET_MS: 500,
} as const;

export type FileConstant = typeof FILE_CONSTANTS[keyof typeof FILE_CONSTANTS];
