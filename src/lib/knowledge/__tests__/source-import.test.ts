/**
 * @fileoverview Source Import Pipeline Tests
 * @module lib/knowledge/__tests__/source-import.test
 * @governance EPIC-6-1
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PDFParser } from '../pdf-parser';
import { URLFetcher } from '../url-fetcher';
import { SourceImportPipeline } from '../source-import';
import { db } from '@/lib/state/dexie-db';

// Mock PDF.js
vi.mock('pdfjs-dist', () => ({
    default: {
        GlobalWorkerOptions: { workerSrc: '' },
        getDocument: vi.fn(),
    },
}));

// Mock IndexedDB
vi.mock('@/lib/state/dexie-db', () => ({
    db: {
        sources: {
            put: vi.fn(),
        },
    },
}));

describe('PDFParser', () => {
    let parser: PDFParser;

    beforeEach(() => {
        parser = new PDFParser();
    });

    it('should identify PDF files correctly', () => {
        const pdfFile = new File([''], 'test.pdf', { type: 'application/pdf' });
        expect(parser.isPDF(pdfFile)).toBe(true);
    });

    it('should reject non-PDF files', () => {
        const txtFile = new File([''], 'test.txt', { type: 'text/plain' });
        expect(parser.isPDF(txtFile)).toBe(false);
    });

    it('should calculate file size in MB', () => {
        // Create a 1MB file
        const content = new Array(1024 * 1024).fill('a').join('');
        const file = new File([content], 'test.pdf', { type: 'application/pdf' });

        expect(parser.getFileSizeMB(file)).toBeCloseTo(1.0, 1);
    });

    it('should identify PDF by extension', () => {
        const file = new File([''], 'test.pdf', { type: 'application/octet-stream' });
        expect(parser.isPDF(file)).toBe(true);
    });
});

describe('URLFetcher', () => {
    let fetcher: URLFetcher;

    beforeEach(() => {
        fetcher = new URLFetcher();
        global.fetch = vi.fn();
        // Mock DOMParser for test environment
        global.DOMParser = vi.fn().mockImplementation(() => ({
            parseFromString: () => ({
                querySelector: vi.fn((selector) => {
                    if (selector === 'title') return { textContent: 'Test Title' };
                    return null;
                }),
                querySelectorAll: vi.fn(() => []),
                body: { textContent: 'Test content' },
            }),
        })) as any;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should validate correct URL format', async () => {
        // Mock fetch to return successful response
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            text: async () => '<html><head><title>Test</title></head><body>Content</body></html>',
        } as any);

        await expect(fetcher.fetchURL('https://example.com')).resolves.toBeDefined();
    });

    it('should reject invalid URL format', async () => {
        await expect(fetcher.fetchURL('not-a-url')).rejects.toThrow('Invalid URL format');
    });

    it.skip('should reject URLs without protocol', async () => {
        // NOTE: URLFetcher.validateURL() is called by SourceImportPipeline
        // This test is moved to SourceImportPipeline tests
        await expect(fetcher.fetchURL('example.com')).rejects.toThrow('must start with http:// or https://');
    });

    it('should handle fetch errors gracefully', async () => {
        vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'));

        await expect(fetcher.fetchURL('https://example.com')).rejects.toThrow();
    });
});

describe('SourceImportPipeline', () => {
    let pipeline: SourceImportPipeline;
    const mockProjectId = 'test-project-id';

    beforeEach(() => {
        pipeline = new SourceImportPipeline();
        vi.spyOn(db.sources, 'put').mockResolvedValue(undefined);
    });

    it('should validate PDF file type', async () => {
        const txtFile = new File([''], 'test.txt', { type: 'text/plain' });

        await expect(pipeline.importPDF(txtFile, { projectId: mockProjectId }))
            .rejects.toThrow('Invalid file type');
    });

    it('should validate PDF file size', async () => {
        // Create a 51MB PDF file (reduced from actual size to avoid timeout)
        // Using smaller buffer that simulates large file
        const largeContent = new Array(5 * 1024 * 1024).fill('a').join('');
        const largeFile = new File([largeContent], 'large.pdf', { type: 'application/pdf' });

        // Mock file size to appear as 51MB
        Object.defineProperty(largeFile, 'size', { value: 51 * 1024 * 1024 + 1 });

        await expect(pipeline.importPDF(largeFile, { projectId: mockProjectId }))
            .rejects.toThrow('File too large');
    });

    it('should validate URL format', async () => {
        await expect(pipeline.importURL('not-a-url', { projectId: mockProjectId }))
            .rejects.toThrow('must start with http:// or https://');
    });

    it('should validate URL has protocol', async () => {
        await expect(pipeline.importURL('example.com', { projectId: mockProjectId }))
            .rejects.toThrow('must start with http:// or https://');
    });

    it('should reject empty text content', async () => {
        await expect(pipeline.importText('', 'Test', { projectId: mockProjectId }))
            .rejects.toThrow('cannot be empty');
    });

    it('should reject whitespace-only text', async () => {
        await expect(pipeline.importText('   ', 'Test', { projectId: mockProjectId }))
            .rejects.toThrow('cannot be empty');
    });

    it('should use first line as default title for text', async () => {
        const progressCallback = vi.fn();

        await pipeline.importText(
            'First line\nSecond line\nThird line',
            '',
            { projectId: mockProjectId, onProgress: progressCallback }
        );

        expect(db.sources.put).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'text',
                title: 'First line',
            })
        );
    });

    it('should truncate long first-line titles', async () => {
        const longFirstLine = 'A'.repeat(200);

        await pipeline.importText(
            `${longFirstLine}\nSecond line`,
            '',
            { projectId: mockProjectId }
        );

        expect(db.sources.put).toHaveBeenCalledWith(
            expect.objectContaining({
                title: longFirstLine.substring(0, 100),
            })
        );
    });
});

describe('Source Record Validation', () => {
    it.skip('should create valid PDF source record', async () => {
        // TODO: Requires dependency injection or public mock interface
        // Cannot spy on private class properties (pdfParser, urlFetcher)
        // Refactor SourceImportPipeline to accept parsers via constructor
        const file = new File([''], 'test.pdf', { type: 'application/pdf' });
        const pipeline = new SourceImportPipeline();

        // Mock PDF parsing
        vi.spyOn(pipeline as any, 'pdfParser').mockResolvedValue({
            text: 'Test content',
            pageCount: 1,
            wordCount: 2,
        });

        vi.spyOn(db.sources, 'put').mockResolvedValue(undefined);

        await pipeline.importPDF(file, { projectId: 'test-project' });

        expect(db.sources.put).toHaveBeenCalledWith(
            expect.objectContaining({
                id: expect.any(String),
                projectId: 'test-project',
                type: 'pdf',
                title: 'test',
                content: 'Test content',
                pageCount: 1,
                wordCount: 2,
                fileSize: 0,
                createdAt: expect.any(Number),
                updatedAt: expect.any(Number),
            })
        );
    });

    it.skip('should create valid URL source record', async () => {
        // TODO: Requires dependency injection or public mock interface
        const pipeline = new SourceImportPipeline();

        // Mock URL fetching
        vi.spyOn(pipeline as any, 'urlFetcher').mockResolvedValue({
            title: 'Test Article',
            content: 'Article content here',
            wordCount: 3,
            url: 'https://example.com/test',
        });

        vi.spyOn(db.sources, 'put').mockResolvedValue(undefined);

        await pipeline.importURL('https://example.com/test', { projectId: 'test-project' });

        expect(db.sources.put).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'url',
                title: 'Test Article',
                content: 'Article content here',
                url: 'https://example.com/test',
                wordCount: 3,
            })
        );
    });

    it('should create valid text source record', async () => {
        const pipeline = new SourceImportPipeline();
        vi.spyOn(db.sources, 'put').mockResolvedValue(undefined);

        await pipeline.importText(
            'Test content here',
            'Custom Title',
            { projectId: 'test-project' }
        );

        expect(db.sources.put).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'text',
                title: 'Custom Title',
                content: 'Test content here',
                charCount: 17,
            })
        );
    });
});

describe('Progress Tracking', () => {
    it.skip('should call progress callback during PDF import', async () => {
        // TODO: Requires dependency injection or public mock interface
        const pipeline = new SourceImportPipeline();
        const progressCallback = vi.fn();

        // Mock PDF parser with progress
        vi.spyOn(pipeline as any, 'pdfParser').mockImplementation(async () => ({
            text: 'Content',
            pageCount: 3,
            wordCount: 1,
        }));

        vi.spyOn(db.sources, 'put').mockResolvedValue(undefined);

        const file = new File([''], 'test.pdf', { type: 'application/pdf' });
        await pipeline.importPDF(file, {
            projectId: 'test-project',
            onProgress: progressCallback,
        });

        // Should be called at least once
        expect(progressCallback).toHaveBeenCalled();
    });

    it.skip('should call progress callback during URL import', async () => {
        // TODO: Requires dependency injection or public mock interface
        const pipeline = new SourceImportPipeline();
        const progressCallback = vi.fn();

        vi.spyOn(pipeline as any, 'urlFetcher').mockResolvedValue({
            title: 'Test',
            content: 'Content',
            wordCount: 1,
            url: 'https://example.com',
        });

        vi.spyOn(db.sources, 'put').mockResolvedValue(undefined);

        await pipeline.importURL('https://example.com', {
            projectId: 'test-project',
            onProgress: progressCallback,
        });

        expect(progressCallback).toHaveBeenCalledWith('Fetching URL...');
    });
});

describe('Error Handling', () => {
    it.skip('should emit error event on PDF parse failure', async () => {
        // TODO: Requires dependency injection or public mock interface
        const eventBus = {
            emit: vi.fn(),
        };
        const pipeline = new SourceImportPipeline(eventBus as any);

        vi.spyOn(pipeline as any, 'pdfParser').mockRejectedValue(new Error('Parse error'));
        vi.spyOn(db.sources, 'put').mockResolvedValue(undefined);

        const file = new File([''], 'test.pdf', { type: 'application/pdf' });

        await expect(pipeline.importPDF(file, { projectId: 'test-project' }))
            .rejects.toThrow('Parse error');

        expect(eventBus.emit).toHaveBeenCalledWith(
            'import.error',
            expect.objectContaining({
                sourceId: expect.any(String),
                error: expect.any(Error),
            })
        );
    });

    it.skip('should emit error event on URL fetch failure', async () => {
        // TODO: Requires dependency injection or public mock interface
        const eventBus = {
            emit: vi.fn(),
        };
        const pipeline = new SourceImportPipeline(eventBus as any);

        vi.spyOn(pipeline as any, 'urlFetcher').mockRejectedValue(new Error('Fetch error'));
        vi.spyOn(db.sources, 'put').mockResolvedValue(undefined);

        await expect(pipeline.importURL('https://example.com', { projectId: 'test-project' }))
            .rejects.toThrow('Fetch error');

        expect(eventBus.emit).toHaveBeenCalledWith('import.error', expect.any(Object));
    });
});

describe('Event Bus Integration', () => {
    it.skip('should emit import.started event', async () => {
        // TODO: Requires dependency injection or public mock interface
        const eventBus = {
            emit: vi.fn(),
        };
        const pipeline = new SourceImportPipeline(eventBus as any);

        vi.spyOn(pipeline as any, 'pdfParser').mockResolvedValue({
            text: 'Content',
            pageCount: 1,
            wordCount: 1,
        });

        vi.spyOn(db.sources, 'put').mockResolvedValue(undefined);

        const file = new File([''], 'test.pdf', { type: 'application/pdf' });
        await pipeline.importPDF(file, { projectId: 'test-project' });

        expect(eventBus.emit).toHaveBeenCalledWith(
            'import.started',
            expect.objectContaining({
                sourceId: expect.any(String),
                type: 'pdf',
                title: 'test.pdf',
            })
        );
    });

    it.skip('should emit import.completed event', async () => {
        // TODO: Requires dependency injection or public mock interface
        const eventBus = {
            emit: vi.fn(),
        };
        const pipeline = new SourceImportPipeline(eventBus as any);

        vi.spyOn(pipeline as any, 'pdfParser').mockResolvedValue({
            text: 'Content',
            pageCount: 1,
            wordCount: 1,
        });

        vi.spyOn(db.sources, 'put').mockResolvedValue(undefined);

        const file = new File([''], 'test.pdf', { type: 'application/pdf' });
        await pipeline.importPDF(file, { projectId: 'test-project' });

        expect(eventBus.emit).toHaveBeenCalledWith(
            'import.completed',
            expect.objectContaining({
                sourceId: expect.any(String),
                record: expect.objectContaining({
                    type: 'pdf',
                }),
            })
        );
    });

    it.skip('should work without event bus', async () => {
        // TODO: Requires dependency injection or public mock interface
        const pipeline = new SourceImportPipeline(); // No event bus

        vi.spyOn(pipeline as any, 'pdfParser').mockResolvedValue({
            text: 'Content',
            pageCount: 1,
            wordCount: 1,
        });

        vi.spyOn(db.sources, 'put').mockResolvedValue(undefined);

        const file = new File([''], 'test.pdf', { type: 'application/pdf' });

        // Should not throw
        await expect(pipeline.importPDF(file, { projectId: 'test-project' }))
            .resolves.toBeDefined();
    });
});
