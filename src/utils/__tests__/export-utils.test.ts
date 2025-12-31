/**
 * @fileoverview Export Utilities Tests
 * @module utils/__tests__/export-utils.test
 * @governance EPIC-6-3
 */

import { exportText, sanitizeFilename } from '../export-utils';
import type { SourceRecord } from '@/lib/state/dexie-db';

/**
 * @vitest-environment jsdom
 */

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();
const mockClick = vi.fn();

Object.defineProperty(global, 'URL', {
    value: {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL,
    },
    writable: true,
});

Object.defineProperty(global, 'Blob', {
    value: class MockBlob {
        constructor(public parts: any[], public options: any) {}
    },
    writable: true,
});

describe('export-utils (Story 6-3, Task 6)', () => {
    let mockAnchor: HTMLAnchorElement;

    beforeEach(() => {
        mockCreateObjectURL.mockReturnValue('blob:test-url');
        mockAnchor = {
            href: '',
            download: '',
            click: mockClick,
            style: {},
        } as unknown as HTMLAnchorElement;
        vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
        vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor);
        vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('sanitizeFilename', () => {
        it('should remove special characters', () => {
            expect(sanitizeFilename('file/name?.txt')).toBe('filename.txt');
            expect(sanitizeFilename('file:name*.txt')).toBe('filename.txt');
            expect(sanitizeFilename('file"name|.txt')).toBe('filename.txt');
            expect(sanitizeFilename('file<>name.txt')).toBe('filename.txt');
        });

        it('should replace spaces with underscores', () => {
            expect(sanitizeFilename('my file name')).toBe('my_file_name');
        });

        it('should remove leading/trailing spaces', () => {
            expect(sanitizeFilename('  filename  ')).toBe('filename');
        });

        it('should handle multiple consecutive spaces', () => {
            expect(sanitizeFilename('my   file')).toBe('my_file');
        });

        it('should preserve file extensions', () => {
            expect(sanitizeFilename('document.pdf')).toBe('document.pdf');
            expect(sanitizeFilename('notes.txt')).toBe('notes.txt');
        });

        it('should handle empty string', () => {
            expect(sanitizeFilename('')).toBe('');
        });

        it('should handle only special characters', () => {
            expect(sanitizeFilename('???')).toBe('');
        });

        it('should preserve alphanumeric characters and hyphens', () => {
            expect(sanitizeFilename('file-123_abc')).toBe('file-123_abc');
        });

        it('should limit filename length (100 chars)', () => {
            const longName = 'a'.repeat(150);
            const result = sanitizeFilename(longName);
            expect(result.length).toBeLessThanOrEqual(100);
        });
    });

    describe('exportText', () => {
        it('should create blob from source content', () => {
            const source: SourceRecord = {
                id: 'source-1',
                projectId: 'project-1',
                type: 'text',
                title: 'Test Note',
                content: 'This is test content',
                charCount: 22,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            exportText(source);

            expect(mockCreateObjectURL).toHaveBeenCalled();
            const blob = mockCreateObjectURL.mock.calls[0][0];
            expect(blob).toBeInstanceOf(Blob);
        });

        it('should create download link with correct filename', () => {
            const source: SourceRecord = {
                id: 'source-1',
                projectId: 'project-1',
                type: 'text',
                title: 'Test Note',
                content: 'Content',
                charCount: 7,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            exportText(source);

            expect(mockAnchor.download).toBe('Test_Note.txt');
        });

        it('should sanitize filename from source title', () => {
            const source: SourceRecord = {
                id: 'source-1',
                projectId: 'project-1',
                type: 'text',
                title: 'File/With:Special?Chars',
                content: 'Content',
                charCount: 7,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            exportText(source);

            expect(mockAnchor.download).toBe('FileWithSpecialChars.txt');
        });

        it('should trigger download on click', () => {
            const source: SourceRecord = {
                id: 'source-1',
                projectId: 'project-1',
                type: 'text',
                title: 'Test',
                content: 'Content',
                charCount: 7,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            exportText(source);

            expect(mockClick).toHaveBeenCalled();
        });

        it('should clean up blob URL after download', () => {
            vi.useFakeTimers();

            const source: SourceRecord = {
                id: 'source-1',
                projectId: 'project-1',
                type: 'text',
                title: 'Test',
                content: 'Content',
                charCount: 7,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            exportText(source);

            // Fast-forward timers to trigger cleanup
            vi.runAllTimers();

            expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url');

            vi.useRealTimers();
        });

        it('should append .txt extension if not present', () => {
            const source: SourceRecord = {
                id: 'source-1',
                projectId: 'project-1',
                type: 'url',
                title: 'https://example.com/article',
                content: 'Article content',
                url: 'https://example.com/article',
                wordCount: 2,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            exportText(source);

            expect(mockAnchor.download).toBe('httpsexample.comarticle.txt');
        });

        it('should handle URL sources', () => {
            const source: SourceRecord = {
                id: 'source-1',
                projectId: 'project-1',
                type: 'url',
                title: 'Example Article',
                content: 'Article content goes here',
                url: 'https://example.com',
                wordCount: 4,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            exportText(source);

            expect(mockCreateObjectURL).toHaveBeenCalled();
            expect(mockAnchor.download).toBe('Example_Article.txt');
        });

        it('should handle PDF sources by exporting content as text', () => {
            const source: SourceRecord = {
                id: 'source-1',
                projectId: 'project-1',
                type: 'pdf',
                title: 'Research Paper',
                content: 'Extracted PDF content',
                pageCount: 10,
                wordCount: 3,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            exportText(source);

            expect(mockCreateObjectURL).toHaveBeenCalled();
            expect(mockAnchor.download).toBe('Research_Paper.txt');
        });

        it('should handle empty content', () => {
            const source: SourceRecord = {
                id: 'source-1',
                projectId: 'project-1',
                type: 'text',
                title: 'Empty Note',
                content: '',
                charCount: 0,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            exportText(source);

            expect(mockCreateObjectURL).toHaveBeenCalled();
            const blob = mockCreateObjectURL.mock.calls[0][0];
            expect(blob).toBeInstanceOf(Blob);
        });
    });
});
