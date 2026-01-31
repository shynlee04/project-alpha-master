/**
 * @fileoverview Source import pipeline
 * @module lib/knowledge/source-import
 *
 * **DEFERRED - Post-MVP Archive**
 */

import type { SourceType, SourceImportOptions, SourceImportResult } from './source-import-types';
import type { ExtractedMetadata } from './metadata-extractor';

/**
 * Source import pipeline orchestrator
 */
export class SourceImportPipeline {
  private metadataExtractor: ExtractedMetadata['extractor'];

  constructor() {
    this.metadataExtractor = {
      extract: async (content: string) => ({
        title: 'Imported Source',
        description: content.substring(0, 200),
        keywords: [],
        readingTime: Math.ceil(content.split(/\s+/).length / 200),
      }),
    };
  }

  /**
   * Import a source document
   */
  async import(
    source: { type: SourceType; content: string; url?: string },
    options: SourceImportOptions = {}
  ): Promise<SourceImportResult> {
    const startTime = Date.now();

    try {
      // Extract metadata
      const metadata = await this.metadataExtractor.extract(source.content);

      // Validate source
      const validation = this.validateSource(source);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error || 'Invalid source',
          duration: Date.now() - startTime,
        };
      }

      // Process based on type
      let processedContent = source.content;
      let chunkCount = 1;

      if (options.chunkContent !== false) {
        const chunks = this.chunkContent(source.content, options.chunkSize || 1000);
        processedContent = chunks.join('\n\n---\n\n');
        chunkCount = chunks.length;
      }

      return {
        success: true,
        source: {
          id: crypto.randomUUID(),
          type: source.type,
          title: metadata.title || 'Untitled',
          content: processedContent,
          metadata: {
            ...metadata,
            importedAt: new Date(),
            chunkCount,
          },
          tags: options.tags || [],
          subjects: [],
        },
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Validate source before import
   */
  private validateSource(
    source: { type: SourceType; content: string; url?: string }
  ): { valid: boolean; error?: string } {
    if (!source.content || source.content.trim().length === 0) {
      return { valid: false, error: 'Content is empty' };
    }

    if (source.content.length > 10_000_000) {
      return { valid: false, error: 'Content exceeds maximum size (10MB)' };
    }

    if (source.type === 'url' && !source.url) {
      return { valid: false, error: 'URL is required for url type' };
    }

    return { valid: true };
  }

  /**
   * Chunk content into smaller pieces
   */
  private chunkContent(
    content: string,
    chunkSize: number,
    overlap: number = 100
  ): string[] {
    const words = content.split(/\s+/);
    const chunks: string[] = [];

    for (let i = 0; i < words.length; i += chunkSize - overlap) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      if (chunk.trim()) {
        chunks.push(chunk);
      }
    }

    return chunks;
  }
}

/**
 * Singleton instance
 */
export const sourceImportPipeline = new SourceImportPipeline();
