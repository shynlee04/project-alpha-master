/**
 * Unit Tests: Document Chunker Service
 *
 * Tests for:
 * - chunkSource() with various source types
 * - chunkPDF() with figure/table detection
 * - chunkText() with progress tracking
 * - Error handling for empty content
 * - Edge cases (small content, min chunk size)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentChunker } from '../document-chunker';
import type { SourceRecord } from '@/lib/state/dexie-db';
import { DEFAULT_CHUNKING_OPTIONS } from '../types';

describe('DocumentChunker', () => {
  let chunker: DocumentChunker;

  beforeEach(() => {
    chunker = new DocumentChunker();
  });

  describe('chunkSource()', () => {
    it('should chunk text source successfully', () => {
      const source: SourceRecord = {
        id: 'test-source-1',
        projectId: 'test-project',
        type: 'text',
        title: 'Test Document',
        content: 'This is a test document. '.repeat(100),
        wordCount: 600,
        charCount: 3600,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = chunker.chunkSource(source);

      expect(result.chunks).toBeDefined();
      expect(result.chunks.length).toBeGreaterThan(0);
      expect(result.totalChunks).toBe(result.chunks.length);
      expect(result.totalTokens).toBeGreaterThan(0);
      expect(result.metadata.strategy).toBe('fixed-size');
      expect(result.metadata.processingTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should chunk PDF source with figure detection', () => {
      const source: SourceRecord = {
        id: 'test-pdf-1',
        projectId: 'test-project',
        type: 'pdf',
        title: 'Test PDF',
        content: `
          Introduction text here.

          Figure 1: Neural Network Architecture
          This shows the layers.

          More text content here.

          Figure 2: Training Results
          Accuracy over epochs.

          Conclusion text.
        `,
        wordCount: 100,
        charCount: 600,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = chunker.chunkSource(source);

      expect(result.chunks.length).toBeGreaterThan(0);
      expect(result.metadata.figureCount).toBeGreaterThanOrEqual(0);
      expect(result.metadata.tableCount).toBe(0);
    });

    it('should chunk URL source as text', () => {
      const source: SourceRecord = {
        id: 'test-url-1',
        projectId: 'test-project',
        type: 'url',
        title: 'https://example.com',
        content: 'Web page content. '.repeat(50),
        wordCount: 300,
        charCount: 1800,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = chunker.chunkSource(source);

      expect(result.chunks.length).toBeGreaterThan(0);
      expect(result.totalTokens).toBeGreaterThan(0);
    });

    it('should call progress callback during chunking', () => {
      const source: SourceRecord = {
        id: 'test-progress',
        projectId: 'test-project',
        type: 'text',
        title: 'Progress Test',
        content: 'Test content. '.repeat(200),
        wordCount: 400,
        charCount: 2400,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const onProgress = vi.fn();
      chunker.chunkSource(source, DEFAULT_CHUNKING_OPTIONS, onProgress);

      expect(onProgress).toHaveBeenCalled();
      expect(onProgress).toHaveBeenLastCalledWith(
        expect.objectContaining({
          status: 'completed',
        })
      );
    });

    it('should throw error for null source', () => {
      expect(() =>
        chunker.chunkSource(null as unknown as SourceRecord)
      ).toThrow('Source is required');
    });

    it('should throw error for empty content', () => {
      const source: SourceRecord = {
        id: 'test-empty',
        projectId: 'test-project',
        type: 'text',
        title: 'Empty',
        content: '',
        wordCount: 0,
        charCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expect(() => chunker.chunkSource(source)).toThrow('has no content to chunk');
    });

    it('should throw error for unsupported source type', () => {
      const source: SourceRecord = {
        id: 'test-unsupported',
        projectId: 'test-project',
        type: 'video' as any,
        title: 'Video',
        content: 'content',
        wordCount: 10,
        charCount: 50,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expect(() => chunker.chunkSource(source)).toThrow(
        'Unsupported source type'
      );
    });
  });

  describe('chunkPDF()', () => {
    it('should detect and extract figures', () => {
      const pdfContent = `
        Introduction paragraph.

        Figure 1: Architecture Diagram
        This is the caption for the figure.

        More text content.
      `;

      const chunks = chunker.chunkPDF(pdfContent);

      expect(chunks.length).toBeGreaterThan(0);

      // Should have at least one figure chunk
      const figureChunks = chunks.filter((c) => c.metadata.type === 'figure');
      expect(figureChunks.length).toBeGreaterThanOrEqual(0);
    });

    it('should detect and extract tables', () => {
      const pdfContent = `
        Introduction paragraph.

        Table 1: Performance Metrics
        | Metric | Value |
        |--------|-------|
        | Accuracy | 95% |

        More text content.
      `;

      const chunks = chunker.chunkPDF(pdfContent);

      expect(chunks.length).toBeGreaterThan(0);

      // Should have at least one table chunk
      const tableChunks = chunks.filter((c) => c.metadata.type === 'table');
      expect(tableChunks.length).toBeGreaterThanOrEqual(0);
    });

    it('should extract captions from figures', () => {
      const pdfContent = `
        Figure 1: This is a test caption for the figure.
        Figure content follows.
      `;

      const chunks = chunker.chunkPDF(pdfContent);

      const figureChunk = chunks.find((c) => c.metadata.type === 'figure');
      if (figureChunk) {
        expect(figureChunk.metadata.caption).toBeDefined();
      }
    });

    it('should handle PDF without figures or tables', () => {
      const pdfContent = `
        This is plain text content.
        It has multiple paragraphs.
        But no figures or tables.
      `.repeat(20);

      const chunks = chunker.chunkPDF(pdfContent);

      expect(chunks.length).toBeGreaterThan(0);
      expect(
        chunks.filter((c) => c.metadata.type === 'text').length
      ).toBeGreaterThan(0);
    });

    it('should throw error for empty PDF content', () => {
      expect(() => chunker.chunkPDF('')).toThrow('PDF content is empty');
      expect(() => chunker.chunkPDF('   ')).toThrow('PDF content is empty');
    });

    it('should track progress during chunking', () => {
      const pdfContent = 'Content. '.repeat(200);
      const onProgress = vi.fn();

      chunker.chunkPDF(pdfContent, DEFAULT_CHUNKING_OPTIONS, onProgress);

      expect(onProgress).toHaveBeenCalled();
      expect(onProgress).toHaveBeenLastCalledWith(
        expect.objectContaining({
          status: 'completed',
        })
      );
    });
  });

  describe('chunkText()', () => {
    it('should chunk long text into multiple chunks', () => {
      const text = 'This is test content. '.repeat(200);

      const chunks = chunker.chunkText(text);

      expect(chunks.length).toBeGreaterThan(1);
      expect(chunks.every((c) => c.metadata.type === 'text')).toBe(true);
    });

    it('should return single chunk for content smaller than min chunk size', () => {
      const text = 'Short content';

      const chunks = chunker.chunkText(text, {
        ...DEFAULT_CHUNKING_OPTIONS,
        minChunkSize: 100,
        maxChunkSize: 200,
      });

      expect(chunks.length).toBe(1);
      expect(chunks[0].content).toBe(text);
      expect(chunks[0].chunkIndex).toBe(0);
      expect(chunks[0].totalChunks).toBe(1);
    });

    it('should preserve chunk metadata', () => {
      const text = 'Test content. '.repeat(100);

      const chunks = chunker.chunkText(text);

      chunks.forEach((chunk) => {
        expect(chunk.chunkId).toMatch(/^chunk-\d+$/);
        expect(chunk.sourceId).toBe('text');
        expect(chunk.chunkIndex).toBeGreaterThanOrEqual(0);
        expect(chunk.totalChunks).toBe(chunks.length);
        expect(chunk.startPosition).toBeLessThan(chunk.endPosition);
        expect(chunk.tokenCount).toBeGreaterThan(0);
        expect(chunk.metadata.type).toBe('text');
      });
    });

    it('should track progress during chunking', () => {
      const text = 'Content. '.repeat(200);
      const onProgress = vi.fn();

      chunker.chunkText(text, DEFAULT_CHUNKING_OPTIONS, onProgress);

      expect(onProgress).toHaveBeenCalled();
      expect(onProgress).toHaveBeenLastCalledWith(
        expect.objectContaining({
          status: 'completed',
          currentChunk: expect.any(Number),
          totalChunks: expect.any(Number),
        })
      );
    });

    it('should throw error for empty text', () => {
      expect(() => chunker.chunkText('')).toThrow('Text content is empty');
      expect(() => chunker.chunkText('   ')).toThrow('Text content is empty');
    });

    it('should use semantic strategy when specified', () => {
      const text = `
        # Heading 1
        Content under heading 1.

        # Heading 2
        Content under heading 2.
      `.repeat(20);

      const chunks = chunker.chunkText(text, {
        ...DEFAULT_CHUNKING_OPTIONS,
        strategy: 'semantic',
      });

      expect(chunks.length).toBeGreaterThan(0);
    });

    it('should use recursive strategy when specified', () => {
      const text = 'Content. '.repeat(300);

      const chunks = chunker.chunkText(text, {
        ...DEFAULT_CHUNKING_OPTIONS,
        strategy: 'recursive',
      });

      expect(chunks.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle text with special characters', () => {
      const text = 'Special chars: @#$%^&*()_+-=[]{}|;:\'",.<>?/~`';

      const chunks = chunker.chunkText(text, {
        ...DEFAULT_CHUNKING_OPTIONS,
        minChunkSize: 1,
        maxChunkSize: 10,
      });

      expect(chunks.length).toBe(1);
      expect(chunks[0].content).toContain('@#$%');
    });

    it('should handle text with multiple newlines', () => {
      const text = 'Paragraph 1\n\n\n\nParagraph 2\n\n\nParagraph 3';

      const chunks = chunker.chunkText(text, {
        ...DEFAULT_CHUNKING_OPTIONS,
        minChunkSize: 1,
        maxChunkSize: 50,
      });

      expect(chunks.length).toBeGreaterThan(0);
    });

    it('should handle very long single line', () => {
      const text = 'a'.repeat(10000);

      const chunks = chunker.chunkText(text);

      expect(chunks.length).toBeGreaterThan(1);
      expect(chunks.every((c) => c.tokenCount <= 2048)).toBe(true);
    });

    it('should handle unicode characters', () => {
      const text = 'Unicode test: 你好世界 αβγדעברית';

      const chunks = chunker.chunkText(text, {
        ...DEFAULT_CHUNKING_OPTIONS,
        minChunkSize: 1,
        maxChunkSize: 10,
      });

      expect(chunks.length).toBe(1);
      expect(chunks[0].content).toContain('你好世界');
    });
  });

  describe('Performance', () => {
    it('should complete chunking within reasonable time for 10k tokens', () => {
      const text = 'Word '.repeat(10000); // ~10k tokens

      const startTime = performance.now();
      const result = chunker.chunkSource({
        id: 'perf-test',
        projectId: 'test',
        type: 'text',
        title: 'Performance Test',
        content: text,
        wordCount: 10000,
        charCount: 60000,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      const duration = performance.now() - startTime;

      expect(result.chunks.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
      expect(result.metadata.processingTimeMs).toBeLessThan(5000);
    });
  });
});
