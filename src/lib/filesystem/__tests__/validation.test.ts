/**
 * File System Validation Tests
 * @module lib/filesystem/__tests__/validation
 */

import { describe, it, expect } from 'vitest';
import {
    validateFileSize,
    shouldWarnFileSize,
    validateFilePath,
    validateRecursionDepth,
    validateContentSize,
    formatFileSize,
    parseFileSize,
} from '../validation';

describe('File Validation Utilities', () => {
    describe('validateFileSize', () => {
        it('should pass for files under 10MB', () => {
            const result = validateFileSize(5 * 1024 * 1024); // 5MB
            expect(result.valid).toBe(true);
            expect(result.errorKey).toBeUndefined();
        });

        it('should pass for files exactly at 10MB', () => {
            const result = validateFileSize(10 * 1024 * 1024);
            expect(result.valid).toBe(true);
        });

        it('should fail for files over 10MB', () => {
            const result = validateFileSize(11 * 1024 * 1024);
            expect(result.valid).toBe(false);
            expect(result.errorKey).toBe('error.file.tooLarge');
            expect(result.errorParams?.maxSize).toBe('10.0 MB');
            expect(result.errorParams?.actualSize).toBe('11.0 MB');
        });

        it('should fail for significantly larger files (100MB)', () => {
            const result = validateFileSize(100 * 1024 * 1024);
            expect(result.valid).toBe(false);
            expect(result.errorKey).toBe('error.file.tooLarge');
        });

        it('should pass for zero-byte files', () => {
            const result = validateFileSize(0);
            expect(result.valid).toBe(true);
        });

        it('should pass for small files (1KB)', () => {
            const result = validateFileSize(1024);
            expect(result.valid).toBe(true);
        });

        it('should pass for medium files (1MB)', () => {
            const result = validateFileSize(1 * 1024 * 1024);
            expect(result.valid).toBe(true);
        });
    });

    describe('shouldWarnFileSize', () => {
        it('should return false for files under 5MB', () => {
            expect(shouldWarnFileSize(4 * 1024 * 1024)).toBe(false);
            expect(shouldWarnFileSize(1 * 1024 * 1024)).toBe(false);
        });

        it('should return true for files over 5MB', () => {
            expect(shouldWarnFileSize(6 * 1024 * 1024)).toBe(true);
            expect(shouldWarnFileSize(8 * 1024 * 1024)).toBe(true);
        });

        it('should return true for files at exactly 5MB', () => {
            expect(shouldWarnFileSize(5 * 1024 * 1024)).toBe(true);
        });
    });

    describe('validateFilePath', () => {
        it('should pass for valid relative paths', () => {
            expect(validateFilePath('src/index.ts').valid).toBe(true);
            expect(validateFilePath('src/components/Button.tsx').valid).toBe(true);
            expect(validateFilePath('file.txt').valid).toBe(true);
        });

        it('should pass for paths with dots', () => {
            expect(validateFilePath('./src/index.ts').valid).toBe(true);
            expect(validateFilePath('../utils/helper.ts').valid).toBe(true);
        });

        it('should fail for paths with null bytes', () => {
            const result = validateFilePath('src/file\0name.ts');
            expect(result.valid).toBe(false);
            expect(result.errorKey).toBe('error.file.invalidPath');
        });

        it('should fail for embedded path traversal', () => {
            const result = validateFilePath('src/../etc/passwd');
            expect(result.valid).toBe(false);
            expect(result.errorKey).toBe('error.file.pathTraversal');
        });

        it('should fail for absolute paths', () => {
            const result = validateFilePath('/etc/passwd');
            expect(result.valid).toBe(false);
            expect(result.errorKey).toBe('error.file.absolutePath');
        });

        it('should fail for paths starting with multiple ..', () => {
            const result = validateFilePath('../../../etc/passwd');
            expect(result.valid).toBe(false);
            expect(result.errorKey).toBe('error.file.pathTraversal');
        });
    });

    describe('validateRecursionDepth', () => {
        it('should pass for depth 0', () => {
            const result = validateRecursionDepth(0);
            expect(result.valid).toBe(true);
        });

        it('should pass for depth 1', () => {
            const result = validateRecursionDepth(1);
            expect(result.valid).toBe(true);
        });

        it('should pass for depth 2 (at limit with default of 3)', () => {
            const result = validateRecursionDepth(2);
            expect(result.valid).toBe(true);
        });

        it('should fail for depth 3 (exceeds default limit)', () => {
            const result = validateRecursionDepth(3);
            expect(result.valid).toBe(false);
            expect(result.errorKey).toBe('error.file.maxDepthExceeded');
            expect(result.errorParams?.maxDepth).toBe(3);
        });

        it('should fail for depth 5', () => {
            const result = validateRecursionDepth(5);
            expect(result.valid).toBe(false);
        });

        it('should respect custom maxDepth', () => {
            expect(validateRecursionDepth(2, 5).valid).toBe(true);
            expect(validateRecursionDepth(3, 5).valid).toBe(true);
            expect(validateRecursionDepth(4, 5).valid).toBe(true);
            expect(validateRecursionDepth(5, 5).valid).toBe(false);
        });
    });

    describe('validateContentSize', () => {
        it('should pass for small strings', () => {
            const result = validateContentSize('Hello, World!');
            expect(result.valid).toBe(true);
        });

        it('should pass for strings at limit', () => {
            const smallContent = 'x'.repeat(10 * 1024 * 1024);
            const result = validateContentSize(smallContent);
            expect(result.valid).toBe(true);
        });

        it('should fail for strings exceeding limit', () => {
            const largeContent = 'x'.repeat(11 * 1024 * 1024);
            const result = validateContentSize(largeContent);
            expect(result.valid).toBe(false);
        });

        it('should work with Uint8Array', () => {
            const smallArray = new Uint8Array(1024);
            const result = validateContentSize(smallArray);
            expect(result.valid).toBe(true);
        });

        it('should accept custom maxSize', () => {
            const content = 'x'.repeat(1000);
            const result = validateContentSize(content, 500);
            expect(result.valid).toBe(false);
        });
    });

    describe('formatFileSize', () => {
        it('should format bytes', () => {
            expect(formatFileSize(500)).toBe('500 B');
        });

        it('should format kilobytes', () => {
            expect(formatFileSize(1024)).toBe('1.0 KB');
            expect(formatFileSize(1536)).toBe('1.5 KB');
        });

        it('should format megabytes', () => {
            expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
            expect(formatFileSize(5.5 * 1024 * 1024)).toBe('5.5 MB');
        });

        it('should format gigabytes', () => {
            expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.0 GB');
        });
    });

    describe('parseFileSize', () => {
        it('should parse bytes', () => {
            expect(parseFileSize('500 B')).toBe(500);
        });

        it('should parse kilobytes', () => {
            expect(parseFileSize('1 KB')).toBe(1024);
            expect(parseFileSize('1.5 KB')).toBe(1536);
        });

        it('should parse megabytes', () => {
            expect(parseFileSize('10 MB')).toBe(10 * 1024 * 1024);
        });

        it('should parse gigabytes', () => {
            expect(parseFileSize('2 GB')).toBe(2 * 1024 * 1024 * 1024);
        });

        it('should return NaN for invalid input', () => {
            expect(parseFileSize('invalid')).toBeNaN();
            expect(parseFileSize('')).toBeNaN();
        });

        it('should parse without unit (defaults to bytes)', () => {
            expect(parseFileSize('1000')).toBe(1000);
        });

        it('should be case-insensitive for units', () => {
            expect(parseFileSize('1 kb')).toBe(1024);
            expect(parseFileSize('2 MB')).toBe(2 * 1024 * 1024);
        });
    });
});
