/**
 * Integration Tests: Incremental Indexing Service
 *
 * ARCH-01.5.7 - Integration testing for RAG auto-indexing on sync.
 *
 * Tests for:
 * - File sync events trigger RAG indexing
 * - Only changed chunks are re-embedded (incremental)
 * - File deletions remove entries from index
 * - Progress callbacks are invoked correctly
 * - Change detection via hash comparison
 *
 * @integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  IncrementalIndexingService,
  getIncrementalIndexingService,
  resetIncrementalIndexingService,
  type IndexingTask,
  type IndexingProgressCallback,
} from '../incremental-indexing-service';

describe('IncrementalIndexingService - Integration', () => {
  let service: IncrementalIndexingService;

  beforeEach(() => {
    resetIncrementalIndexingService();
    service = getIncrementalIndexingService();
  });

  describe('Full Indexing (New Files)', () => {
    it('should index new file completely', async () => {
      const task: IndexingTask = {
        id: 'task-1',
        projectId: 'test-project',
        workspaceType: 'knowledge',
        filePath: '/test/file.md',
        type: 'index',
        content: 'This is a test document. '.repeat(200),
        priority: 10,
        createdAt: Date.now(),
        processing: false,
      };

      const onProgress = vi.fn();
      const result = await service.processTask(task, onProgress);

      expect(result.success).toBe(true);
      expect(result.chunksIndexed).toBeGreaterThan(0);
      expect(result.chunksEmbedded).toBe(result.chunksIndexed);
      expect(result.chunksRemoved).toBe(0);

      // Verify progress callbacks
      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          phase: 'chunking',
        })
      );
      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          phase: 'embedding',
        })
      );
    });

    it('should handle empty content gracefully', async () => {
      const task: IndexingTask = {
        id: 'task-empty',
        projectId: 'test-project',
        workspaceType: 'knowledge',
        filePath: '/test/empty.md',
        type: 'index',
        priority: 10,
        createdAt: Date.now(),
        processing: false,
      };

      const result = await service.processTask(task);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No content provided');
      expect(result.chunksIndexed).toBe(0);
    });
  });

  describe('Incremental Indexing (Modified Files)', () => {
    it('should skip re-indexing when content unchanged', async () => {
      const content = 'Original content. '.repeat(100);
      const task: IndexingTask = {
        id: 'task-no-change',
        projectId: 'test-project',
        workspaceType: 'knowledge',
        filePath: '/test/unchanged.md',
        type: 'reindex',
        content,
        priority: 10,
        createdAt: Date.now(),
        processing: false,
      };

      // First index
      const result1 = await service.processTask(task);
      expect(result1.chunksIndexed).toBeGreaterThan(0);

      // Second index with same content
      const result2 = await service.processTask(task);
      expect(result2.success).toBe(true);
      expect(result2.chunksIndexed).toBe(0); // No new chunks
      expect(result2.chunksEmbedded).toBe(0);
      expect(result2.chunksRemoved).toBe(0);
    });

    it('should re-index only changed content', async () => {
      const originalContent = 'Original content. '.repeat(100);
      const modifiedContent = 'Original content. '.repeat(50) + 'NEW CONTENT! ' + 'Original content. '.repeat(49);

      const task1: IndexingTask = {
        id: 'task-modified-1',
        projectId: 'test-project',
        workspaceType: 'knowledge',
        filePath: '/test/modified.md',
        type: 'index',
        content: originalContent,
        priority: 10,
        createdAt: Date.now(),
        processing: false,
      };

      // First index
      const result1 = await service.processTask(task1);
      const initialChunks = result1.chunksIndexed;

      // Modified content
      const task2: IndexingTask = {
        ...task1,
        id: 'task-modified-2',
        type: 'reindex',
        content: modifiedContent,
      };

      const result2 = await service.processTask(task2);

      expect(result2.success).toBe(true);
      // Should remove stale chunks and add new ones
      expect(result2.chunksRemoved).toBeGreaterThan(0);
      expect(result2.chunksIndexed).toBeGreaterThan(0);
    });
  });

  describe('File Deletion', () => {
    it('should remove chunks when file deleted', async () => {
      const task: IndexingTask = {
        id: 'task-delete',
        projectId: 'test-project',
        workspaceType: 'knowledge',
        filePath: '/test/delete-me.md',
        type: 'index',
        content: 'Content to be deleted. '.repeat(100),
        priority: 10,
        createdAt: Date.now(),
        processing: false,
      };

      // First index the file
      const indexResult = await service.processTask(task);
      expect(indexResult.chunksIndexed).toBeGreaterThan(0);

      // Then delete it
      const deleteTask: IndexingTask = {
        ...task,
        id: 'task-delete-2',
        type: 'remove',
        content: undefined,
      };

      const deleteResult = await service.processTask(deleteTask);

      expect(deleteResult.success).toBe(true);
      expect(deleteResult.chunksRemoved).toBeGreaterThan(0);
      expect(deleteResult.chunksIndexed).toBe(0);

      // Verify cache is cleared
      const cachedChunks = service.getCachedChunks(
        service.generateSourceId(task.projectId, task.filePath) as any
      );
      expect(cachedChunks).toEqual([]);
    });
  });

  describe('Progress Tracking', () => {
    it('should invoke progress callback for each phase', async () => {
      const task: IndexingTask = {
        id: 'task-progress',
        projectId: 'test-project',
        workspaceType: 'knowledge',
        filePath: '/test/progress.md',
        type: 'index',
        content: 'Test content for progress. '.repeat(200),
        priority: 10,
        createdAt: Date.now(),
        processing: false,
      };

      const phases: string[] = [];
      const onProgress: IndexingProgressCallback = (progress) => {
        phases.push(progress.phase);
      };

      await service.processTask(task, onProgress);

      expect(phases).toContain('chunking');
      expect(phases).toContain('embedding');
      expect(phases).toContain('indexing');
    });

    it('should report correct progress percentages', async () => {
      const task: IndexingTask = {
        id: 'task-percent',
        projectId: 'test-project',
        workspaceType: 'knowledge',
        filePath: '/test/percent.md',
        type: 'index',
        content: 'Content for percentage test. '.repeat(200),
        priority: 10,
        createdAt: Date.now(),
        processing: false,
      };

      const progressValues: number[] = [];
      const onProgress: IndexingProgressCallback = (progress) => {
        if (progress.total > 0) {
          const percent = (progress.current / progress.total) * 100;
          progressValues.push(percent);
        }
      };

      await service.processTask(task, onProgress);

      // Should have progress values from 0 to 100
      expect(progressValues.length).toBeGreaterThan(0);
      expect(Math.max(...progressValues)).toBe(100);
    });
  });

  describe('Cache Management', () => {
    it('should store chunks in cache after indexing', async () => {
      const task: IndexingTask = {
        id: 'task-cache',
        projectId: 'test-project',
        workspaceType: 'knowledge',
        filePath: '/test/cache.md',
        type: 'index',
        content: 'Cached content. '.repeat(100),
        priority: 10,
        createdAt: Date.now(),
        processing: false,
      };

      const sourceId = `${task.projectId}:${task.filePath}`;
      const result = await service.processTask(task);

      expect(result.chunksIndexed).toBeGreaterThan(0);

      const cachedChunks = service.getCachedChunks(sourceId as any);
      expect(cachedChunks.length).toBe(result.chunksIndexed);
    });

    it('should clear cache for specific source', async () => {
      const task: IndexingTask = {
        id: 'task-clear-cache',
        projectId: 'test-project',
        workspaceType: 'knowledge',
        filePath: '/test/clear-cache.md',
        type: 'index',
        content: 'Content to clear. '.repeat(100),
        priority: 10,
        createdAt: Date.now(),
        processing: false,
      };

      await service.processTask(task);

      const sourceId = `${task.projectId}:${task.filePath}`;
      service.clearCache(sourceId as any);

      const cachedChunks = service.getCachedChunks(sourceId as any);
      expect(cachedChunks).toEqual([]);
    });

    it('should clear all cache', async () => {
      const task1: IndexingTask = {
        id: 'task-1',
        projectId: 'test-project',
        workspaceType: 'knowledge',
        filePath: '/test/file1.md',
        type: 'index',
        content: 'File 1 content. '.repeat(50),
        priority: 10,
        createdAt: Date.now(),
        processing: false,
      };

      const task2: IndexingTask = {
        id: 'task-2',
        projectId: 'test-project',
        workspaceType: 'knowledge',
        filePath: '/test/file2.md',
        type: 'index',
        content: 'File 2 content. '.repeat(50),
        priority: 10,
        createdAt: Date.now(),
        processing: false,
      };

      await service.processTask(task1);
      await service.processTask(task2);

      service.clearCache();

      const chunks1 = service.getCachedChunks(`${task1.projectId}:${task1.filePath}` as any);
      const chunks2 = service.getCachedChunks(`${task2.projectId}:${task2.filePath}` as any);

      expect(chunks1).toEqual([]);
      expect(chunks2).toEqual([]);
    });
  });

  describe('Hash Calculation', () => {
    it('should generate consistent hashes for same content', () => {
      const content = 'Test content for hashing';

      const task1: IndexingTask = {
        id: 'task-hash-1',
        projectId: 'test-project',
        workspaceType: 'knowledge',
        filePath: '/test/hash.md',
        type: 'index',
        content,
        priority: 10,
        createdAt: Date.now(),
        processing: false,
      };

      const task2: IndexingTask = {
        ...task1,
        id: 'task-hash-2',
        type: 'reindex',
      };

      const result1 = await service.processTask(task1);
      const result2 = await service.processTask(task2);

      expect(result1.chunksIndexed).toBeGreaterThan(0);
      expect(result2.chunksIndexed).toBe(0); // Skipped due to same hash
    });

    it('should detect content changes', async () => {
      // Process content once
      const task1: IndexingTask = {
        id: 'task-change-1',
        projectId: 'test-project',
        workspaceType: 'knowledge',
        filePath: '/test/change.md',
        type: 'index',
        content: 'content 1',
        priority: 10,
        createdAt: Date.now(),
        processing: false,
      };

      await service.processTask(task1);

      // Process with different content
      const task2: IndexingTask = {
        ...task1,
        id: 'task-change-2',
        type: 'reindex',
        content: 'content 2',
      };

      const result = await service.processTask(task2);

      // Should have detected changes and processed
      expect(result.chunksRemoved).toBeGreaterThan(0);
      expect(result.chunksIndexed).toBeGreaterThan(0);
    });
  });

  describe('Configuration', () => {
    it('should use custom chunking config', async () => {
      const customService = new IncrementalIndexingService({
        chunking: {
          maxChunkSize: 500,
          overlap: 50,
        },
      });

      const task: IndexingTask = {
        id: 'task-custom-config',
        projectId: 'test-project',
        workspaceType: 'knowledge',
        filePath: '/test/custom.md',
        type: 'index',
        content: 'A'.repeat(2000),
        priority: 10,
        createdAt: Date.now(),
        processing: false,
      };

      const result = await customService.processTask(task);

      expect(result.success).toBe(true);
      // With maxChunkSize of 500, should get more chunks than default
      expect(result.chunksIndexed).toBeGreaterThan(3);
    });

    it('should support disabling diff detection', async () => {
      const noDiffService = new IncrementalIndexingService({
        useDiffDetection: false,
      });

      const content = 'Same content';

      const task: IndexingTask = {
        id: 'task-no-diff',
        projectId: 'test-project',
        workspaceType: 'knowledge',
        filePath: '/test/no-diff.md',
        type: 'reindex',
        content,
        priority: 10,
        createdAt: Date.now(),
        processing: false,
      };

      const result1 = await noDiffService.processTask(task);
      const result2 = await noDiffService.processTask(task);

      // Without diff detection, both should process
      expect(result1.chunksIndexed).toBeGreaterThan(0);
      expect(result2.chunksIndexed).toBeGreaterThan(0);
    });
  });
});
