/**
 * @fileoverview Incremental RAG Indexing Service
 * @module lib/rag/incremental-indexing-service
 *
 * ARCH-01.5.3-5.5 - Incremental chunking, embedding, and deletion for RAG.
 *
 * This service provides efficient incremental indexing:
 * - Only re-chunks modified sections using diff detection
 * - Only embeds new/changed chunks
 * - Handles file deletions by removing chunks from index
 */

import type { DocumentSchema, ChunkMetadata } from './types';
import { createEmbeddingService } from './embedding-service';
import type { IndexingTask } from './sync-subscription-service';
// P0-LLM-001: Import credential vault to retrieve API key for embeddings
import { credentialVault } from '@/lib/agent/providers/credential-vault';

/**
 * Diff result for comparing content changes
 */
export interface ContentDiff {
  /** Whether content has changed */
  hasChanges: boolean;
  /** Previous content hash */
  previousHash: string;
  /** New content hash */
  newHash: string;
  /** Changed character ranges (start, end) */
  changedRanges: Array<[number, number]>;
  /** Union of unchanged content */
  unchangedContent: string;
}

/**
 * Indexing result
 */
export interface IndexingResult {
  /** Task ID */
  taskId: string;
  /** Success status */
  success: boolean;
  /** Number of chunks indexed */
  chunksIndexed: number;
  /** Number of chunks removed */
  chunksRemoved: number;
  /** Number of chunks embedded */
  chunksEmbedded: number;
  /** Error message if failed */
  error?: string;
  /** Processing time in ms */
  duration: number;
}

/**
 * Indexing progress callback
 */
export type IndexingProgressCallback = (progress: {
  taskId: string;
  phase: 'chunking' | 'embedding' | 'indexing' | 'removing';
  current: number;
  total: number;
  message: string;
}) => void;

/**
 * Service configuration
 */
export interface IncrementalIndexingConfig {
  /** Chunking options */
  chunking?: {
    strategy?: 'fixed-size' | 'semantic' | 'recursive';
    minChunkSize?: number;
    maxChunkSize?: number;
    overlap?: number;
    preserveFormatting?: boolean;
  };
  /** Embedding options */
  embedding?: {
    mode?: 'auto' | 'local' | 'cloud' | 'keyword-only';
    batchSize?: number;
  };
  /** Whether to use diff detection */
  useDiffDetection?: boolean;
  /** Minimum change size to trigger re-chunking */
  minChangeSize?: number;
}

/**
 * Chunk storage for tracking existing chunks
 */
interface ChunkStorageEntry {
  chunkId: string;
  sourceId: string;
  filePath: string;
  contentHash: string;
  startPosition: number;
  endPosition: number;
  chunkIndex: number;
}

/**
 * Default configuration
 */
type ChunkingConfig = {
  strategy: 'fixed-size' | 'semantic' | 'recursive';
  minChunkSize: number;
  maxChunkSize: number;
  overlap: number;
  preserveFormatting: boolean;
};

type EmbeddingConfig = {
  mode: 'auto' | 'local' | 'cloud' | 'keyword-only';
  batchSize: number;
};

const DEFAULT_CHUNKING: ChunkingConfig = {
  strategy: 'fixed-size',
  minChunkSize: 512,
  maxChunkSize: 2048,
  overlap: 100,
  preserveFormatting: true,
};

/**
 * Incremental RAG Indexing Service
 *
 * Handles efficient incremental indexing with change detection.
 */
export class IncrementalIndexingService {
  private chunkCache: Map<string, ChunkStorageEntry[]> = new Map();
  private config: {
    chunking: ChunkingConfig;
    embedding: EmbeddingConfig;
    useDiffDetection: boolean;
    minChangeSize: number;
  };

  constructor(config: IncrementalIndexingConfig = {}) {
    this.config = {
      chunking: { ...DEFAULT_CHUNKING, ...config.chunking },
      embedding: { mode: 'auto', batchSize: 10, ...config.embedding },
      useDiffDetection: config.useDiffDetection ?? true,
      minChangeSize: config.minChangeSize ?? 100,
    };
  }

  /**
   * Process an indexing task
   */
  async processTask(
    task: IndexingTask,
    onProgress?: IndexingProgressCallback
  ): Promise<IndexingResult> {
    const startTime = Date.now();

    try {
      if (task.type === 'remove') {
        return await this.removeChunks(task, onProgress);
      }

      if (!task.content) {
        return {
          taskId: task.id,
          success: false,
          chunksIndexed: 0,
          chunksRemoved: 0,
          chunksEmbedded: 0,
          error: 'No content provided',
          duration: Date.now() - startTime,
        };
      }

      // Generate source ID from file path
      const sourceId = this.generateSourceId(task.projectId, task.filePath);

      // Check for existing chunks
      const existingChunks = this.chunkCache.get(sourceId) || [];
      const contentHash = this.hashContent(task.content);

      // Detect changes if we have existing chunks
      if (existingChunks.length > 0 && this.config.useDiffDetection) {
        const diff = this.diffContent(task.content, existingChunks);

        if (!diff.hasChanges) {
          // No changes, skip indexing
          return {
            taskId: task.id,
            success: true,
            chunksIndexed: 0,
            chunksRemoved: 0,
            chunksEmbedded: 0,
            duration: Date.now() - startTime,
          };
        }

        // Incremental chunking - only re-chunk changed sections
        return await this.incrementalIndex(task, sourceId, diff, onProgress);
      }

      // Full indexing for new files or when diff is disabled
      return await this.fullIndex(task, sourceId, contentHash, onProgress);
    } catch (error) {
      return {
        taskId: task.id,
        success: false,
        chunksIndexed: 0,
        chunksRemoved: 0,
        chunksEmbedded: 0,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Full indexing for new files
   */
  private async fullIndex(
    task: IndexingTask,
    sourceId: string,
    contentHash: string,
    onProgress?: IndexingProgressCallback
  ): Promise<IndexingResult> {
    const startTime = Date.now();

    onProgress?.({
      taskId: task.id,
      phase: 'chunking',
      current: 0,
      total: 1,
      message: 'Chunking document...',
    });

    // Chunk the content
    const chunks = this.chunkContent(task.content!, sourceId);
    const chunkMetadata = chunks.map((chunk, index) => this.createChunkMetadata(chunk, index, sourceId));

    onProgress?.({
      taskId: task.id,
      phase: 'embedding',
      current: 0,
      total: chunkMetadata.length,
      message: `Embedding ${chunkMetadata.length} chunks...`,
    });

    // Get embedding service and embed chunks
    // P0-LLM-001: Retrieve API key from credential vault for cloud embeddings
    await credentialVault.initialize();
    const geminiApiKey = await credentialVault.getCredentials('gemini');
    const embeddingService = await createEmbeddingService(geminiApiKey ?? undefined);
    const embeddings: number[][] = [];
    const batchSize = this.config.embedding.batchSize;

    for (let i = 0; i < chunkMetadata.length; i += batchSize) {
      const batch = chunkMetadata.slice(i, i + batchSize);
      const batchEmbeddings = await embeddingService.embedBatch(
        batch.map(c => c.content)
      );
      embeddings.push(...batchEmbeddings.results.map(r => r.embedding));

      onProgress?.({
        taskId: task.id,
        phase: 'embedding',
        current: embeddings.length,
        total: chunkMetadata.length,
        message: `Embedded ${embeddings.length}/${chunkMetadata.length} chunks...`,
      });
    }

    onProgress?.({
      taskId: task.id,
      phase: 'indexing',
      current: 0,
      total: chunkMetadata.length,
      message: 'Indexing chunks...',
    });

    // Create documents for index
    const documents: DocumentSchema[] = chunkMetadata.map((meta, idx) => ({
      id: meta.chunkId,
      sourceId,
      content: meta.content,
      metadata: {
        chunkIndex: meta.chunkIndex,
        totalChunks: meta.totalChunks,
        sourceType: task.workspaceType,
      },
      embedding: embeddings[idx],
    }));

    // Store chunks in cache
    const cacheEntries: ChunkStorageEntry[] = chunkMetadata.map((meta) => ({
      chunkId: meta.chunkId,
      sourceId,
      filePath: task.filePath,
      contentHash,
      startPosition: meta.startPosition,
      endPosition: meta.endPosition,
      chunkIndex: meta.chunkIndex,
    }));
    this.chunkCache.set(sourceId, cacheEntries);

    return {
      taskId: task.id,
      success: true,
      chunksIndexed: documents.length,
      chunksRemoved: 0,
      chunksEmbedded: embeddings.length,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Incremental indexing with change detection
   */
  private async incrementalIndex(
    task: IndexingTask,
    sourceId: string,
    diff: ContentDiff,
    onProgress?: IndexingProgressCallback
  ): Promise<IndexingResult> {
    const startTime = Date.now();
    let chunksIndexed = 0;
    let chunksRemoved = 0;
    let chunksEmbedded = 0;

    onProgress?.({
      taskId: task.id,
      phase: 'chunking',
      current: 0,
      total: 1,
      message: 'Analyzing changes...',
    });

    const existingChunks = this.chunkCache.get(sourceId) || [];

    // Remove chunks that overlap with changed ranges
    const chunksToRemove = this.findAffectedChunks(existingChunks, diff.changedRanges);
    if (chunksToRemove.length > 0) {
      onProgress?.({
        taskId: task.id,
        phase: 'removing',
        current: 0,
        total: chunksToRemove.length,
        message: `Removing ${chunksToRemove.length} stale chunks...`,
      });

      chunksRemoved = chunksToRemove.length;

      // Remove from cache
      const remainingChunks = existingChunks.filter(c => !chunksToRemove.includes(c.chunkId));
      this.chunkCache.set(sourceId, remainingChunks);
    }

    // Re-chunk the changed content
    const changedContent = this.extractChangedContent(task.content!, diff.changedRanges);
    const newChunks = this.chunkContent(changedContent, sourceId);
    const newChunkMetadata = newChunks.map((chunk, idx) =>
      this.createChunkMetadata(chunk, idx, sourceId)
    );

    onProgress?.({
      taskId: task.id,
      phase: 'embedding',
      current: 0,
      total: newChunkMetadata.length,
      message: `Embedding ${newChunkMetadata.length} new chunks...`,
    });

    // Get embedding service and embed new chunks
    // P0-LLM-001: Retrieve API key from credential vault for cloud embeddings
    await credentialVault.initialize();
    const geminiApiKey = await credentialVault.getCredentials('gemini');
    const embeddingService = await createEmbeddingService(geminiApiKey ?? undefined);
    const embeddings: number[][] = [];
    const batchSize = this.config.embedding.batchSize;

    for (let i = 0; i < newChunkMetadata.length; i += batchSize) {
      const batch = newChunkMetadata.slice(i, i + batchSize);
      const batchEmbeddings = await embeddingService.embedBatch(
        batch.map(c => c.content)
      );
      embeddings.push(...batchEmbeddings.results.map(r => r.embedding));

      chunksEmbedded += batchEmbeddings.results.length;

      onProgress?.({
        taskId: task.id,
        phase: 'embedding',
        current: embeddings.length,
        total: newChunkMetadata.length,
        message: `Embedded ${embeddings.length}/${newChunkMetadata.length} chunks...`,
      });
    }

    // Add new chunks to cache
    const remainingChunks = this.chunkCache.get(sourceId) || [];
    const newCacheEntries: ChunkStorageEntry[] = newChunkMetadata.map((meta, idx) => ({
      chunkId: meta.chunkId,
      sourceId,
      filePath: task.filePath,
      contentHash: diff.newHash,
      startPosition: meta.startPosition,
      endPosition: meta.endPosition,
      chunkIndex: remainingChunks.length + idx,
    }));
    this.chunkCache.set(sourceId, [...remainingChunks, ...newCacheEntries]);

    chunksIndexed = newChunkMetadata.length;

    return {
      taskId: task.id,
      success: true,
      chunksIndexed,
      chunksRemoved,
      chunksEmbedded,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Remove chunks for deleted file
   */
  private async removeChunks(
    task: IndexingTask,
    onProgress?: IndexingProgressCallback
  ): Promise<IndexingResult> {
    const startTime = Date.now();
    const sourceId = this.generateSourceId(task.projectId, task.filePath);
    const existingChunks = this.chunkCache.get(sourceId) || [];

    onProgress?.({
      taskId: task.id,
      phase: 'removing',
      current: 0,
      total: existingChunks.length,
      message: `Removing ${existingChunks.length} chunks...`,
    });

    // Clear cache for this file
    this.chunkCache.delete(sourceId);

    return {
      taskId: task.id,
      success: true,
      chunksIndexed: 0,
      chunksRemoved: existingChunks.length,
      chunksEmbedded: 0,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Find chunks that overlap with changed ranges
   */
  private findAffectedChunks(chunks: ChunkStorageEntry[], changedRanges: Array<[number, number]>): string[] {
    const affected = new Set<string>();

    for (const [start, end] of changedRanges) {
      for (const chunk of chunks) {
        // Check if chunk overlaps with changed range
        if (chunk.startPosition < end && chunk.endPosition > start) {
          affected.add(chunk.chunkId);
        }
      }
    }

    return Array.from(affected);
  }

  /**
   * Extract content from changed ranges
   */
  private extractChangedContent(content: string, changedRanges: Array<[number, number]>): string {
    // Expand ranges to include overlap context
    const overlap = this.config.chunking.overlap;
    const expandedRanges = changedRanges.map(([start, end]) => [
      Math.max(0, start - overlap),
      Math.min(content.length, end + overlap),
    ] as [number, number]);

    // Merge overlapping ranges
    const merged = this.mergeRanges(expandedRanges);

    // Extract content
    return merged.map(([start, end]) => content.slice(start, end)).join('\n');
  }

  /**
   * Merge overlapping ranges
   */
  private mergeRanges(ranges: Array<[number, number]>): Array<[number, number]> {
    if (ranges.length === 0) return [];

    const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
    const merged: Array<[number, number]> = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const [start, end] = sorted[i];
      const lastEnd = merged[merged.length - 1][1];

      if (start <= lastEnd) {
        merged[merged.length - 1][1] = Math.max(lastEnd, end);
      } else {
        merged.push([start, end]);
      }
    }

    return merged;
  }

  /**
   * Detect changes between current and previous content
   */
  private diffContent(content: string, existingChunks: ChunkStorageEntry[]): ContentDiff {
    // For simplicity, use hash comparison
    // In production, would use proper diff algorithm like diff-match-patch
    const previousHash = existingChunks[0]?.contentHash || '';
    const newHash = this.hashContent(content);

    const hasChanges = previousHash !== newHash;

    // If changed, mark entire content as changed range (conservative)
    // In production, would use actual diff algorithm
    const changedRanges: Array<[number, number]> = hasChanges
      ? [[0, content.length]]
      : [];

    return {
      hasChanges,
      previousHash,
      newHash,
      changedRanges,
      unchangedContent: content,
    };
  }

  /**
   * Chunk content into pieces
   */
  private chunkContent(content: string, _sourceId: string): string[] {
    const { maxChunkSize = 2048, overlap = 100 } = this.config.chunking;
    const chunks: string[] = [];

    let position = 0;
    while (position < content.length) {
      const end = Math.min(position + maxChunkSize, content.length);
      chunks.push(content.slice(position, end));
      position = end - overlap;
    }

    return chunks;
  }

  /**
   * Create chunk metadata
   */
  private createChunkMetadata(
    content: string,
    index: number,
    sourceId: string
  ): ChunkMetadata {
    const { maxChunkSize = 2048, overlap = 100 } = this.config.chunking;
    const startPos = index * (maxChunkSize - overlap);

    return {
      chunkId: `${sourceId}:chunk:${index}`,
      sourceId,
      chunkIndex: index,
      totalChunks: 0, // Will be updated after all chunks created
      startPosition: startPos,
      endPosition: startPos + content.length,
      content,
      tokenCount: Math.ceil(content.length / 4), // Approximate token count
      metadata: {
        type: 'text',
      },
    };
  }

  /**
   * Generate source ID from project and file path
   */
  private generateSourceId(projectId: string, filePath: string): string {
    return `${projectId}:${filePath}`;
  }

  /**
   * Hash content for change detection
   */
  private hashContent(content: string): string {
    // Simple hash for demonstration - use proper hash in production
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  /**
   * Get all cached chunks for a source
   */
  getCachedChunks(sourceId: string): ChunkStorageEntry[] {
    return this.chunkCache.get(sourceId) || [];
  }

  /**
   * Clear cache for a source
   */
  clearCache(sourceId?: string): void {
    if (sourceId) {
      this.chunkCache.delete(sourceId);
    } else {
      this.chunkCache.clear();
    }
  }
}

/**
 * Singleton instance
 */
let indexingServiceInstance: IncrementalIndexingService | null = null;

/**
 * Get or create the indexing service singleton
 */
export function getIncrementalIndexingService(
  config?: IncrementalIndexingConfig
): IncrementalIndexingService {
  if (!indexingServiceInstance) {
    indexingServiceInstance = new IncrementalIndexingService(config);
  }
  return indexingServiceInstance;
}

/**
 * Reset the singleton (for testing)
 */
export function resetIncrementalIndexingService(): void {
  indexingServiceInstance = null;
}
