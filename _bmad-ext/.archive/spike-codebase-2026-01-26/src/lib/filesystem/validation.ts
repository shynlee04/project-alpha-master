/**
 * File System Validation Utilities
 * @module lib/filesystem/validation
 *
 * Provides validation functions for file system operations including
 * file size validation, path validation, and recursion depth checks.
 */

import { FILE_CONSTANTS } from './constants';

export interface ValidationResult {
    /** Whether the validation passed */
    valid: boolean;
    /** Translation key for error message (if invalid) */
    errorKey?: string;
    /** Parameters for translation interpolation */
    errorParams?: Record<string, unknown>;
}

/**
 * Validate file size against maximum limit
 *
 * @param size - File size in bytes
 * @returns ValidationResult with valid=true if within limit
 */
export function validateFileSize(size: number): ValidationResult {
    if (size > FILE_CONSTANTS.MAX_FILE_SIZE) {
        return {
            valid: false,
            errorKey: 'error.file.tooLarge',
            errorParams: {
                maxSize: formatFileSize(FILE_CONSTANTS.MAX_FILE_SIZE),
                actualSize: formatFileSize(size),
            },
        };
    }
    return { valid: true };
}

/**
 * Check if file size exceeds warning threshold (for informational warnings)
 *
 * @param size - File size in bytes
 * @returns true if file should show a warning
 */
export function shouldWarnFileSize(size: number): boolean {
    return size >= FILE_CONSTANTS.WARNING_THRESHOLD;
}

/**
 * Validate file path for security issues
 *
 * Checks for:
 * - Null byte injection
 * - Path traversal attempts
 * - Invalid characters
 *
 * @param path - File path to validate
 * @returns ValidationResult
 */
export function validateFilePath(path: string): ValidationResult {
    // Check for null bytes (null byte injection attack)
    if (path.includes('\0')) {
        return {
            valid: false,
            errorKey: 'error.file.invalidPath',
            errorParams: { path },
        };
    }

    // Check for path traversal attempts - reject any path that would escape the project root
    // This includes paths that navigate upward multiple levels or have embedded ../
    if (path.includes('..')) {
        // Reject if:
        // 1. Path starts with two or more "../" (e.g., "../../" or "../../etc")
        // 2. Path has "/../" embedded anywhere (e.g., "src/../etc")
        // 3. Path ends with "/.." (e.g., "src/..")
        const startsWithMultipleParentRefs = /^(\.\.\/){2,}/.test(path);
        const hasEmbeddedTraversal = /\/\.\.\//.test(path) || /\/[^/]+\/\.\.$/.test(path);

        if (startsWithMultipleParentRefs || hasEmbeddedTraversal) {
            return {
                valid: false,
                errorKey: 'error.file.pathTraversal',
                errorParams: { path },
            };
        }
    }

    // Check for absolute paths (should be relative)
    if (path.startsWith('/')) {
        return {
            valid: false,
            errorKey: 'error.file.absolutePath',
            errorParams: { path },
        };
    }

    return { valid: true };
}

/**
 * Validate recursion depth for directory listing
 *
 * @param currentDepth - Current recursion depth
 * @param maxDepth - Maximum allowed depth (defaults to constant)
 * @returns ValidationResult
 */
export function validateRecursionDepth(
    currentDepth: number,
    maxDepth: number = FILE_CONSTANTS.MAX_RECURSION_DEPTH
): ValidationResult {
    if (currentDepth >= maxDepth) {
        return {
            valid: false,
            errorKey: 'error.file.maxDepthExceeded',
            errorParams: { maxDepth },
        };
    }
    return { valid: true };
}

/**
 * Validate that content size is appropriate for text operations
 *
 * @param content - Content to validate
 * @param maxSize - Maximum size in bytes (defaults to MAX_FILE_SIZE)
 * @returns ValidationResult
 */
export function validateContentSize(
    content: string | Uint8Array,
    maxSize: number = FILE_CONSTANTS.MAX_FILE_SIZE
): ValidationResult {
    const size = typeof content === 'string' ? new Blob([content]).size : content.length;

    if (size > maxSize) {
        return {
            valid: false,
            errorKey: 'error.file.tooLarge',
            errorParams: {
                maxSize: formatFileSize(maxSize),
                actualSize: formatFileSize(size),
            },
        };
    }

    return { valid: true };
}

/**
 * Format bytes to human-readable string
 *
 * @param bytes - Number of bytes
 * @returns Formatted string (e.g., "5.2 MB")
 */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    if (bytes < 1024 * 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Parse human-readable size string to bytes
 *
 * @param sizeString - Size string (e.g., "5 MB", "1.5 GB")
 * @returns Number of bytes, or NaN if invalid
 */
export function parseFileSize(sizeString: string): number {
    const match = sizeString.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB|TB)?$/i);

    if (!match) {
        return NaN;
    }

    const value = parseFloat(match[1]);
    const unit = (match[2] || 'B').toUpperCase();

    const multipliers: Record<string, number> = {
        B: 1,
        KB: 1024,
        MB: 1024 * 1024,
        GB: 1024 * 1024 * 1024,
        TB: 1024 * 1024 * 1024 * 1024,
    };

    return value * (multipliers[unit] || 1);
}
