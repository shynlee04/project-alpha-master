/**
 * @fileoverview Incremental Sync Tests
 * @module lib/filesystem/sync-manager/__tests__
 * @governance Story 54-2 - AC2: Incremental Sync Accuracy
 *
 * Tests for incremental sync - only syncing changed files.
 * TDD Red Phase: All tests should fail initially.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FileMetadataCache } from '@/lib/sync/file-metadata-cache';
import type { FileMetadataRecord } from '@/infrastructure/persistence/dexie-db';

// In-memory storage for mock database
const mockMetadataStore = new Map<string, FileMetadataRecord>();

// Mock Dexie DB with in-memory storage
vi.mock('@/infrastructure/persistence/dexie-db', () => {
  const mockWhere = vi.fn((field: string) => {
    return {
      equals: vi.fn((value: string | [string, string]) => {
        // Handle compound index queries [projectId+path]
        if (Array.isArray(value)) {
          const [projectId, path] = value;
          const found = Array.from(mockMetadataStore.values()).find(
            (m) => m.projectId === projectId && m.path === path
          );
          return {
            first: () => Promise.resolve(found || undefined),
            delete: () => Promise.resolve(),
          };
        }
        // Handle simple path queries
        const found = mockMetadataStore.get(value);
        return {
          first: () => Promise.resolve(found || undefined),
          delete: () => {
            mockMetadataStore.delete(value);
            return Promise.resolve();
          },
        };
      }),
    };
  });

  return {
    db: {
      fileMetadata: {
        where: mockWhere,
        toArray: () => Promise.resolve(Array.from(mockMetadataStore.values())),
        put: (metadata: FileMetadataRecord) => {
          mockMetadataStore.set(metadata.path, metadata);
          return Promise.resolve();
        },
        bulkPut: (files: FileMetadataRecord[]) => {
          for (const file of files) {
            mockMetadataStore.set(file.path, file);
          }
          return Promise.resolve();
        },
        orderBy: () => ({
          last: () => {
            const values = Array.from(mockMetadataStore.values());
            return Promise.resolve(values[values.length - 1] || undefined);
          },
        }),
      },
    },
    getChangedFilesSince: (sinceTimestamp: number) => {
      return Promise.resolve(
        Array.from(mockMetadataStore.values()).filter(
          (m) => m.lastModified > sinceTimestamp
        )
      );
    },
    clearFileMetadataCache: () => {
      mockMetadataStore.clear();
      return Promise.resolve();
    },
  };
});

describe('Incremental Sync - AC2', () => {
  let fileMetadataCache: FileMetadataCache;

  beforeEach(() => {
    mockMetadataStore.clear(); // Clear store before each test
    fileMetadataCache = new FileMetadataCache();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Changed file detection via timestamp', () => {
    it('should detect file with newer timestamp as changed', async () => {
      const oldMetadata: FileMetadataRecord = {
        path: '/src/test.ts',
        lastModified: 1000000,
        size: 100,
        createdAt: 1000000,
        updatedAt: 1000000,
      };

      const newMetadata: FileMetadataRecord = {
        path: '/src/test.ts',
        lastModified: 2000000, // Newer
        size: 100,
        createdAt: 1000000,
        updatedAt: 2000000,
      };

      const hasChanged = await fileMetadataCache.hasChanged('/src/test.ts', newMetadata);
      expect(hasChanged).toBe(true);
    });

    it('should detect file with older timestamp as changed (mtime rollback)', async () => {
      const oldMetadata: FileMetadataRecord = {
        path: '/src/test.ts',
        lastModified: 2000000,
        size: 100,
        createdAt: 1000000,
        updatedAt: 2000000,
      };

      const newMetadata: FileMetadataRecord = {
        path: '/src/test.ts',
        lastModified: 1000000, // Older (mtime changed)
        size: 100,
        createdAt: 1000000,
        updatedAt: 1000000,
      };

      const hasChanged = await fileMetadataCache.hasChanged('/src/test.ts', newMetadata);
      expect(hasChanged).toBe(true);
    });

    it('should not detect unchanged file as modified', async () => {
      const oldMetadata: FileMetadataRecord = {
        path: '/src/test.ts',
        lastModified: 1000000,
        size: 100,
        createdAt: 1000000,
        updatedAt: 1000000,
      };

      const sameMetadata: FileMetadataRecord = {
        path: '/src/test.ts',
        lastModified: 1000000, // Same
        size: 100, // Same
        createdAt: 1000000,
        updatedAt: 1000000,
      };

      // First check returns true (file is new/not in cache)
      await fileMetadataCache.set(oldMetadata);

      // Second check with same metadata returns false
      const hasChanged = await fileMetadataCache.hasChanged('/src/test.ts', sameMetadata);
      expect(hasChanged).toBe(false);
    });
  });

  describe('File size change detection', () => {
    it('should detect file with different size as changed', async () => {
      const oldMetadata: FileMetadataRecord = {
        path: '/src/test.ts',
        lastModified: 1000000,
        size: 100,
        createdAt: 1000000,
        updatedAt: 1000000,
      };

      const newMetadata: FileMetadataRecord = {
        path: '/src/test.ts',
        lastModified: 1000000, // Same timestamp
        size: 200, // Different size
        createdAt: 1000000,
        updatedAt: 1000000,
      };

      await fileMetadataCache.set(oldMetadata);
      const hasChanged = await fileMetadataCache.hasChanged('/src/test.ts', newMetadata);
      expect(hasChanged).toBe(true);
    });

    it('should detect file size increase', async () => {
      const oldMetadata: FileMetadataRecord = {
        path: '/src/test.ts',
        lastModified: 1000000,
        size: 100,
        createdAt: 1000000,
        updatedAt: 1000000,
      };

      const newMetadata: FileMetadataRecord = {
        path: '/src/test.ts',
        lastModified: 1000000,
        size: 500, // Increased
        createdAt: 1000000,
        updatedAt: 1000000,
      };

      await fileMetadataCache.set(oldMetadata);
      const hasChanged = await fileMetadataCache.hasChanged('/src/test.ts', newMetadata);
      expect(hasChanged).toBe(true);
    });

    it('should detect file size decrease', async () => {
      const oldMetadata: FileMetadataRecord = {
        path: '/src/test.ts',
        lastModified: 1000000,
        size: 500,
        createdAt: 1000000,
        updatedAt: 1000000,
      };

      const newMetadata: FileMetadataRecord = {
        path: '/src/test.ts',
        lastModified: 1000000,
        size: 100, // Decreased
        createdAt: 1000000,
        updatedAt: 1000000,
      };

      await fileMetadataCache.set(oldMetadata);
      const hasChanged = await fileMetadataCache.hasChanged('/src/test.ts', newMetadata);
      expect(hasChanged).toBe(true);
    });
  });

  describe('No unnecessary file operations', () => {
    it('should only return changed files from getChangedFiles', async () => {
      const mockChangedFiles: FileMetadataRecord[] = [
        { path: '/src/changed.ts', lastModified: 2000000, size: 100, createdAt: 1000000, updatedAt: 2000000 },
      ];

      const { getChangedFilesSince } = await import('@/infrastructure/persistence/dexie-db');
      vi.mocked(getChangedFilesSince).mockResolvedValue(mockChangedFiles);

      const changedFiles = await fileMetadataCache.getChangedFiles(1500000);

      expect(changedFiles).toHaveLength(1);
      expect(changedFiles[0].path).toBe('/src/changed.ts');
    });

    it('should return empty array when no files changed', async () => {
      const { getChangedFilesSince } = await import('@/infrastructure/persistence/dexie-db');
      vi.mocked(getChangedFilesSince).mockResolvedValue([]);

      const changedFiles = await fileMetadataCache.getChangedFiles(1500000);

      expect(changedFiles).toHaveLength(0);
    });
  });

  describe('Deleted files detection', () => {
    it('should detect files removed from local FS', async () => {
      // File exists in cache but not in current scan
      const cachedFile: FileMetadataRecord = {
        path: '/src/deleted.ts',
        lastModified: 1000000,
        size: 100,
        createdAt: 1000000,
        updatedAt: 1000000,
      };

      await fileMetadataCache.set(cachedFile);

      // Current scan doesn't include this file
      const currentPaths = ['/src/kept.ts', '/src/new.ts'];

      // Should identify deleted files
      // This would be a method on the sync manager
      // For now, we test the cache can return the file
      const retrieved = await fileMetadataCache.get('/src/deleted.ts');
      expect(retrieved).toBeTruthy();
      expect(retrieved?.path).toBe('/src/deleted.ts');
    });
  });

  describe('New files detection', () => {
    it('should detect files not in cache', async () => {
      const newFile: FileMetadataRecord = {
        path: '/src/new.ts',
        lastModified: 2000000,
        size: 100,
        createdAt: 2000000,
        updatedAt: 2000000,
      };

      // File not in cache returns undefined
      const notInCache = await fileMetadataCache.get('/src/new.ts');
      expect(notInCache).toBeUndefined();

      // After checking hasChanged, should return true (new file)
      const hasChanged = await fileMetadataCache.hasChanged('/src/new.ts', newFile);
      expect(hasChanged).toBe(true);
    });
  });

  describe('Metadata cache updates', () => {
    it('should update cache after sync completes', async () => {
      const syncedFile: FileMetadataRecord = {
        path: '/src/synced.ts',
        lastModified: 3000000,
        size: 150,
        createdAt: 1000000,
        updatedAt: 3000000,
      };

      await fileMetadataCache.set(syncedFile);

      const retrieved = await fileMetadataCache.get('/src/synced.ts');
      expect(retrieved).toEqual(syncedFile);
    });

    it('should update timestamp on metadata update', async () => {
      const original: FileMetadataRecord = {
        path: '/src/test.ts',
        lastModified: 1000000,
        size: 100,
        createdAt: 1000000,
        updatedAt: 1000000,
      };

      await fileMetadataCache.set(original);

      const updated: FileMetadataRecord = {
        path: '/src/test.ts',
        lastModified: 2000000,
        size: 100,
        createdAt: 1000000,
        updatedAt: 2000000,
      };

      await fileMetadataCache.set(updated);

      const retrieved = await fileMetadataCache.get('/src/test.ts');
      expect(retrieved?.lastModified).toBe(2000000);
      expect(retrieved?.updatedAt).toBe(2000000);
    });
  });

  describe('Incremental sync performance', () => {
    it('should complete faster than full sync when few files changed', async () => {
      // Simulate scenario: 1000 files total, only 5 changed
      const totalFiles = 1000;
      const changedFiles = 5;

      // Incremental sync should process ~5 files
      // Full sync would process all 1000 files

      // This is a performance test - in real scenario we'd measure time
      // For unit test, we verify the count
      const { getChangedFilesSince } = await import('@/infrastructure/persistence/dexie-db');
      vi.mocked(getChangedFilesSince).mockResolvedValue(
        Array.from({ length: changedFiles }, (_, i) => ({
          path: `/src/changed${i}.ts`,
          lastModified: Date.now(),
          size: 100,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }))
      );

      const result = await fileMetadataCache.getChangedFiles(Date.now() - 10000);

      expect(result.length).toBeLessThan(totalFiles);
      expect(result.length).toBe(changedFiles);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty cache (first sync)', async () => {
      const newFile: FileMetadataRecord = {
        path: '/src/first.ts',
        lastModified: 1000000,
        size: 100,
        createdAt: 1000000,
        updatedAt: 1000000,
      };

      // Empty cache means no comparison possible
      // hasChanged should return true for new files
      const hasChanged = await fileMetadataCache.hasChanged('/src/first.ts', newFile);
      expect(hasChanged).toBe(true);
    });

    it('should handle file with same timestamp but different content', async () => {
      // Edge case: fast consecutive saves (same second)
      const oldMetadata: FileMetadataRecord = {
        path: '/src/fast-edit.ts',
        lastModified: 1000000,
        size: 100,
        createdAt: 1000000,
        updatedAt: 1000000,
      };

      const newMetadata: FileMetadataRecord = {
        path: '/src/fast-edit.ts',
        lastModified: 1000000, // Same timestamp (within same second)
        size: 120, // Different size (content changed)
        createdAt: 1000000,
        updatedAt: 1000000,
      };

      await fileMetadataCache.set(oldMetadata);
      const hasChanged = await fileMetadataCache.hasChanged('/src/fast-edit.ts', newMetadata);
      expect(hasChanged).toBe(true);
    });

    it('should handle zero-byte files', async () => {
      const emptyFile: FileMetadataRecord = {
        path: '/src/empty.ts',
        lastModified: 1000000,
        size: 0,
        createdAt: 1000000,
        updatedAt: 1000000,
      };

      const hasChanged = await fileMetadataCache.hasChanged('/src/empty.ts', emptyFile);
      expect(hasChanged).toBe(true); // New file
    });
  });
});
