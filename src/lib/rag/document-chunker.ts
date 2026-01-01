/**
 * Document Chunker Service
 *
 * Orchestrates chunking strategies for RAG pipeline.
 * Handles PDF, text, and general source content chunking with:
 * - Multiple chunking strategies (fixed-size, semantic, recursive)
 * - Progress tracking for long documents
 * - Figure/table detection for PDFs
 * - Error handling for edge cases
 *
 * @iteration 15 - Added RAG progress events (CHUNKING_STATUS)
 */

import type { SourceRecord } from '@/lib/state/dexie-db';
import type {
  ChunkMetadata,
  ChunkingOptions,
  ChunkingProgress,
  ChunkingStrategy,
} from './types';
import { DEFAULT_CHUNKING_OPTIONS } from './types';
import { createChunker } from './chunk-strategies';
import { eventBus } from '@/infrastructure/events/event-bus';

/**
 * Pattern for detecting figures in PDF text
 * Matches: "Figure 1:", "Fig. 1:", "Figure 1 -", etc.
 */
const FIGURE_PATTERN = /(?:Figure|Fig\.?)\s+\d+[:\.\-]/gi;

/**
 * Pattern for detecting tables in PDF text
 * Matches: "Table 1:", "Tab. 1:", "Table 1 -", etc.
 */
const TABLE_PATTERN = /(?:Table|Tab\.?)\s+\d+[:\.\-]/gi;

/**
 * Pattern for extracting captions
 * Matches text after Figure/Table markers until end of line
 */
const CAPTION_PATTERN = /(?:Figure|Fig\.?|Table|Tab\.?)\s+\d+[:\.\-]\s*([^\n]+)/gi;

/**
 * Result of a chunking operation
 */
export interface ChunkingResult {
  chunks: ChunkMetadata[];
  totalChunks: number;
  totalTokens: number;
  metadata: {
    strategy: ChunkingStrategy;
    figureCount: number;
    tableCount: number;
    processingTimeMs: number;
  };
}

/**
 * Document Chunker Service
 *
 * Provides high-level API for chunking various document types
 * with progress tracking and error handling.
 */
export class DocumentChunker {
  /**
   * Chunk a complete source record
   *
   * Iteration 15: Added progress event emissions for UI feedback
   *
   * @param source - Source record to chunk
   * @param options - Chunking options (defaults to DEFAULT_CHUNKING_OPTIONS)
   * @param onProgress - Optional progress callback
   * @returns ChunkingResult with chunks and metadata
   */
  chunkSource(
    source: SourceRecord,
    options: ChunkingOptions = DEFAULT_CHUNKING_OPTIONS,
    onProgress?: (progress: ChunkingProgress) => void
  ): ChunkingResult {
    const startTime = performance.now();

    // Emit start event
    eventBus.emitRAGChunkingStatus({
      status: 'running',
      progress: 0,
      current: 0,
      total: 0,
      message: `Starting chunking for source: ${source.id}`,
      sourceId: source.id
    });

    try {
      // Validate source
      if (!source) {
        throw new Error('Source is required');
      }

      if (!source.content || source.content.length === 0) {
        throw new Error(`Source ${source.id} has no content to chunk`);
      }

      // Route to appropriate chunking method based on source type
      let chunks: ChunkMetadata[];
      switch (source.type) {
        case 'pdf':
          chunks = this.chunkPDF(source.content, options, onProgress);
          break;
        case 'text':
          chunks = this.chunkText(source.content, options, onProgress);
          break;
        case 'url':
          // URLs are fetched as text, chunk as text
          chunks = this.chunkText(source.content, options, onProgress);
          break;
        default:
          throw new Error(`Unsupported source type: ${source.type}`);
      }

      // Calculate metadata
      const totalTokens = chunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0);
      const figureCount = chunks.filter(
        (c) => c.metadata.type === 'figure'
      ).length;
      const tableCount = chunks.filter(
        (c) => c.metadata.type === 'table'
      ).length;
      const processingTimeMs = Math.round(performance.now() - startTime);

      // Emit completion event
      eventBus.emitRAGChunkingStatus({
        status: 'completed',
        progress: 100,
        current: chunks.length,
        total: chunks.length,
        message: `Document chunked into ${chunks.length} chunks`,
        sourceId: source.id
      });

      return {
        chunks,
        totalChunks: chunks.length,
        totalTokens,
        metadata: {
          strategy: options.strategy,
          figureCount,
          tableCount,
          processingTimeMs,
        },
      };
    } catch (error: unknown) {
      // Emit error event
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      eventBus.emitRAGChunkingStatus({
        status: 'error',
        progress: 0,
        current: 0,
        total: 0,
        message: 'Chunking failed',
        error: errorMessage,
        sourceId: source.id
      });

      throw error;
    }
  }

  /**
   * Chunk PDF content with figure/table detection
   *
   * @param pdfContent - Raw text extracted from PDF
   * @param options - Chunking options
   * @param onProgress - Optional progress callback
   * @returns Array of chunk metadata
   */
  chunkPDF(
    pdfContent: string,
    options: ChunkingOptions = DEFAULT_CHUNKING_OPTIONS,
    onProgress?: (progress: ChunkingProgress) => void
  ): ChunkMetadata[] {
    const startTime = performance.now();

    // Validate content
    if (!pdfContent || pdfContent.trim().length === 0) {
      throw new Error('PDF content is empty');
    }

    // Detect figures and tables
    const figures = this.extractFigures(pdfContent);
    const tables = this.extractTables(pdfContent);

    // Replace figures/tables with placeholders to avoid chunking them
    let processedContent = pdfContent;
    const figurePlaceholders = new Map<string, string>();
    const tablePlaceholders = new Map<string, string>();

    // Replace figures with placeholders
    figures.forEach((fig, idx) => {
      const placeholder = `__FIGURE_${idx}__`;
      figurePlaceholders.set(placeholder, fig);
      processedContent = processedContent.replace(fig, placeholder);
    });

    // Replace tables with placeholders
    tables.forEach((table, idx) => {
      const placeholder = `__TABLE_${idx}__`;
      tablePlaceholders.set(placeholder, table);
      processedContent = processedContent.replace(table, placeholder);
    });

    // Chunk the processed content
    const chunker = createChunker(options.strategy);
    const baseChunks = chunker.chunk(
      { id: 'pdf-temp', content: processedContent },
      options,
      (progress) => {
        onProgress?.({
          sourceId: 'pdf',
          currentChunk: progress.current,
          totalChunks: progress.total,
          status: 'chunking',
        });
      }
    );

    // Restore figures/tables as separate chunks
    const finalChunks: ChunkMetadata[] = [];
    let chunkIndex = 0;

    baseChunks.forEach((baseChunk) => {
      let { content } = baseChunk;
      let startPos = baseChunk.startPosition;

      // Find all placeholders in this chunk
      const figureMatches = [
        ...content.matchAll(/__FIGURE_(\d+)__/g),
      ].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

      const tableMatches = [
        ...content.matchAll(/__TABLE_(\d+)__/g),
      ].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

      // Process content and insert figure/table chunks
      let lastPos = 0;
      const allMatches = [
        ...figureMatches.map((m) => ({
          type: 'figure' as const,
          index: parseInt(m[1]),
          pos: m.index ?? 0,
        })),
        ...tableMatches.map((m) => ({
          type: 'table' as const,
          index: parseInt(m[1]),
          pos: m.index ?? 0,
        })),
      ].sort((a, b) => a.pos - b.pos);

      allMatches.forEach((match) => {
        // Add text before this figure/table
        const textContent = content.substring(lastPos, match.pos);
        if (textContent.trim().length > 0) {
          finalChunks.push({
            ...baseChunk,
            chunkId: `chunk-${chunkIndex++}`,
            chunkIndex: finalChunks.length,
            totalChunks: 0, // Will update at end
            startPosition: startPos,
            endPosition: startPos + textContent.length,
            content: textContent,
            tokenCount: this.countTokens(textContent),
            metadata: { type: 'text' },
          });
          startPos += textContent.length;
        }

        // Add figure/table as separate chunk
        const placeholder = content.substring(
          match.pos,
          match.pos + `__${match.type.toUpperCase()}_${match.index}__`.length
        );
        const originalContent =
          match.type === 'figure'
            ? figurePlaceholders.get(placeholder)
            : tablePlaceholders.get(placeholder);

        if (originalContent) {
          const caption = this.extractCaption(originalContent);
          finalChunks.push({
            chunkId: `chunk-${chunkIndex++}`,
            sourceId: 'pdf',
            chunkIndex: finalChunks.length,
            totalChunks: 0,
            startPosition: startPos,
            endPosition: startPos + originalContent.length,
            content: originalContent,
            tokenCount: this.countTokens(originalContent),
            metadata: {
              type: match.type,
              caption,
            },
          });
          startPos += originalContent.length;
        }

        lastPos = match.pos + placeholder.length;
      });

      // Add remaining text after last figure/table
      const remainingText = content.substring(lastPos);
      if (remainingText.trim().length > 0) {
        finalChunks.push({
          ...baseChunk,
          chunkId: `chunk-${chunkIndex++}`,
          chunkIndex: finalChunks.length,
          totalChunks: 0,
          startPosition: startPos,
          endPosition: startPos + remainingText.length,
          content: remainingText,
          tokenCount: this.countTokens(remainingText),
          metadata: { type: 'text' },
        });
      }
    });

    // Update total chunks count
    finalChunks.forEach((chunk) => {
      chunk.totalChunks = finalChunks.length;
    });

    // Report completion
    onProgress?.({
      sourceId: 'pdf',
      currentChunk: finalChunks.length,
      totalChunks: finalChunks.length,
      status: 'completed',
    });

    console.log(
      `PDF chunked in ${Math.round(performance.now() - startTime)}ms: ` +
        `${finalChunks.length} chunks, ${figures.length} figures, ${tables.length} tables`
    );

    return finalChunks;
  }

  /**
   * Chunk plain text content
   *
   * Iteration 15: Added progress event emissions
   *
   * @param text - Text content to chunk
   * @param options - Chunking options
   * @param onProgress - Optional progress callback
   * @returns Array of chunk metadata
   */
  chunkText(
    text: string,
    options: ChunkingOptions = DEFAULT_CHUNKING_OPTIONS,
    onProgress?: (progress: ChunkingProgress) => void
  ): ChunkMetadata[] {
    const startTime = performance.now();

    // Validate content
    if (!text || text.trim().length === 0) {
      throw new Error('Text content is empty');
    }

    // Check if content is smaller than min chunk size
    const tokenCount = this.countTokens(text);
    if (tokenCount < options.minChunkSize) {
      // Return as single chunk
      const chunk: ChunkMetadata = {
        chunkId: 'chunk-0',
        sourceId: 'text',
        chunkIndex: 0,
        totalChunks: 1,
        startPosition: 0,
        endPosition: text.length,
        content: text,
        tokenCount,
        metadata: { type: 'text' },
      };

      onProgress?.({
        sourceId: 'text',
        currentChunk: 1,
        totalChunks: 1,
        status: 'completed',
      });

      // Emit progress event
      eventBus.emitRAGChunkingStatus({
        status: 'running',
        progress: 100,
        current: 1,
        total: 1,
        message: 'Text chunked (content smaller than min chunk size)',
      });

      console.log(
        `Text chunked in ${Math.round(performance.now() - startTime)}ms: ` +
          `1 chunk (content smaller than min chunk size)`
      );

      return [chunk];
    }

    // Emit chunking in progress event
    eventBus.emitRAGChunkingStatus({
      status: 'running',
      progress: 10,
      current: 0,
      total: 0,
      message: 'Chunking text content...',
    });

    // Chunk using selected strategy
    const chunker = createChunker(options.strategy);
    const chunks = chunker.chunk(
      { id: 'text-temp', content: text },
      options,
      (progress) => {
        // Emit progress events during chunking
        eventBus.emitRAGChunkingStatus({
          status: 'running',
          progress: Math.round((progress.current / progress.total) * 50 + 10), // 10-60% range
          current: progress.current,
          total: progress.total,
          message: `Chunking: ${progress.current}/${progress.total}`,
        });

        onProgress?.({
          sourceId: 'text',
          currentChunk: progress.current,
          totalChunks: progress.total,
          status: 'chunking',
        });
      }
    );

    // Update source IDs
    chunks.forEach((chunk, idx) => {
      chunk.chunkId = `chunk-${idx}`;
      chunk.sourceId = 'text';
    });

    // Report completion
    onProgress?.({
      sourceId: 'text',
      currentChunk: chunks.length,
      totalChunks: chunks.length,
      status: 'completed',
    });

    // Emit completion event
    eventBus.emitRAGChunkingStatus({
      status: 'running',
      progress: 90,
      current: chunks.length,
      total: chunks.length,
      message: `Text chunked into ${chunks.length} chunks`,
    });

    console.log(
      `Text chunked in ${Math.round(performance.now() - startTime)}ms: ` +
        `${chunks.length} chunks`
    );

    return chunks;
  }

  /**
   * Extract figures from PDF content
   *
   * @param content - PDF text content
   * @returns Array of figure strings with captions
   * @private
   */
  private extractFigures(content: string): string[] {
    const figures: string[] = [];
    const matches = content.matchAll(FIGURE_PATTERN);

    for (const match of matches) {
      const start = match.index ?? 0;
      // Find end of figure (next Figure marker, Table marker, or double newline)
      const remaining = content.substring(start);
      const endPatterns = [
        /(?:Figure|Fig\.?)\s+\d+[:\.\-]/gi,
        /(?:Table|Tab\.?)\s+\d+[:\.\-]/gi,
        /\n\s*\n/g,
      ];

      let endPos = remaining.length;
      for (const pattern of endPatterns) {
        const nextMatch = pattern.exec(remaining.substring(10));
        if (nextMatch && nextMatch.index < endPos) {
          endPos = nextMatch.index + 10;
        }
      }

      figures.push(content.substring(start, start + endPos));
    }

    return figures;
  }

  /**
   * Extract tables from PDF content
   *
   * @param content - PDF text content
   * @returns Array of table strings with captions
   * @private
   */
  private extractTables(content: string): string[] {
    const tables: string[] = [];
    const matches = content.matchAll(TABLE_PATTERN);

    for (const match of matches) {
      const start = match.index ?? 0;
      // Find end of table (next Table marker, Figure marker, or double newline)
      const remaining = content.substring(start);
      const endPatterns = [
        /(?:Table|Tab\.?)\s+\d+[:\.\-]/gi,
        /(?:Figure|Fig\.?)\s+\d+[:\.\-]/gi,
        /\n\s*\n/g,
      ];

      let endPos = remaining.length;
      for (const pattern of endPatterns) {
        const nextMatch = pattern.exec(remaining.substring(10));
        if (nextMatch && nextMatch.index < endPos) {
          endPos = nextMatch.index + 10;
        }
      }

      tables.push(content.substring(start, start + endPos));
    }

    return tables;
  }

  /**
   * Extract caption from figure/table text
   *
   * @param text - Figure or table text
   * @returns Caption string or undefined
   * @private
   */
  private extractCaption(text: string): string | undefined {
    const match = CAPTION_PATTERN.exec(text);
    if (match && match[1]) {
      return match[1].trim();
    }
    return undefined;
  }

  /**
   * Count tokens using approximation (1 token ≈ 4 characters)
   *
   * @param text - Text to count
   * @returns Token count
   * @private
   */
  private countTokens(text: string): number {
    if (!text || text.length === 0) return 0;
    return Math.ceil(text.length / 4);
  }
}

/**
 * Singleton instance for convenience
 */
export const documentChunker = new DocumentChunker();
