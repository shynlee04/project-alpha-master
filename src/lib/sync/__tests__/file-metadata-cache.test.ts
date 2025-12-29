import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { FileMetadataRecord } from '../../state/dexie-db';

// Create mock functions
const mockPut = vi.fn();
const mockGet = vi.fn();
const mockWhere = vi.fn();
const mockToArray = vi.fn();
const mockClear = vi.fn();
const mockDelete = vi.fn();
const mockBulkPut = vi.fn();
const mockOrderBy = vi.fn();
const mockLast = vi.fn();

// Mock dexie-db module
vi.mock('../../state/dexie-db', () => ({
  db: {
    fileMetadata: {
      put: mockPut,
      get: mockGet,
      where: mockWhere,
      clear: mockClear,
      delete: mockDelete,
      bulkPut: mockBulkPut,
      orderBy: mockOrderBy
    }
  },
  upsertFileMetadata: vi.fn((metadata: FileMetadataRecord) => mockPut(metadata)),
  getFileMetadata: vi.fn((path: string) => mockGet(path)),
  getChangedFilesSince: vi.fn((_timestamp: number) =>
    Promise.resolve(mockToArray())
  ),
  clearFileMetadataCache: vi.fn(() => mockClear())
}));

// Import after mocking
const { FileMetadataCache } = await import('../file-metadata-cache');

describe('FileMetadataCache', () => {
  let cache: InstanceType<typeof FileMetadataCache>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockWhere.mockReturnValue({ toArray: mockToArray });
    mockOrderBy.mockReturnValue({ last: mockLast });
    cache = new FileMetadataCache();
  });

  describe('get', () => {
    it('should return undefined when file not in cache', async () => {
      mockGet.mockResolvedValue(undefined);

      const result = await cache.get('/test/path/file.txt');

      expect(result).toBeUndefined();
      expect(mockGet).toHaveBeenCalledWith('/test/path/file.txt');
    });

    it('should return metadata when file exists in cache', async () => {
      const mockMetadata: FileMetadataRecord = {
        path: '/test/path/file.txt',
        projectId: 'project-1',
        lastModified: 1234567890,
        size: 1024,
        hash: 'abc123',
        syncedAt: 1234567890,
        createdAt: 1234567800,
        updatedAt: 1234567890
      };
      mockGet.mockResolvedValue(mockMetadata);

      const result = await cache.get('/test/path/file.txt');

      expect(result).toEqual(mockMetadata);
    });
  });

  describe('set', () => {
    it('should store metadata in cache', async () => {
      const mockMetadata: FileMetadataRecord = {
        path: '/test/path/file.txt',
        projectId: 'project-1',
        lastModified: 1234567890,
        size: 1024,
        hash: 'abc123',
        syncedAt: 1234567890,
        createdAt: 1234567800,
        updatedAt: 1234567890
      };
      mockPut.mockResolvedValue(undefined);

      await cache.set('/test/path/file.txt', mockMetadata);

      expect(mockPut).toHaveBeenCalledWith(mockMetadata);
    });
  });

  describe('getChangedFiles', () => {
    it('should return files changed since timestamp', async () => {
      const mockFiles: FileMetadataRecord[] = [
        { path: '/test/file1.txt', projectId: 'p1', lastModified: 1234567891, size: 100, hash: 'hash1', syncedAt: 1, createdAt: 1, updatedAt: 1 },
        { path: '/test/file2.txt', projectId: 'p1', lastModified: 1234567892, size: 200, hash: 'hash2', syncedAt: 1, createdAt: 1, updatedAt: 1 }
      ];
      mockToArray.mockResolvedValue(mockFiles);

      const result = await cache.getChangedFiles(1234567890);

      expect(result).toEqual(mockFiles);
      expect(mockToArray).toHaveBeenCalled();
    });
  });

  describe('hasChanged', () => {
    it('should return true when file not in cache', async () => {
      mockGet.mockResolvedValue(undefined);

      const currentMetadata: FileMetadataRecord = {
        path: '/test/path/file.txt',
        projectId: 'project-1',
        lastModified: 1234567890,
        size: 1024,
        hash: 'abc123',
        syncedAt: 1234567890,
        createdAt: 1234567800,
        updatedAt: 1234567890
      };

      const result = await cache.hasChanged('/test/path/file.txt', currentMetadata);

      expect(result).toBe(true);
    });

    it('should return true when lastModified differs', async () => {
      mockGet.mockResolvedValue({
        path: '/test/path/file.txt',
        projectId: 'project-1',
        lastModified: 1234567880,
        size: 1024,
        hash: 'abc123',
        syncedAt: 1234567880,
        createdAt: 1234567800,
        updatedAt: 1234567880
      });

      const currentMetadata: FileMetadataRecord = {
        path: '/test/path/file.txt',
        projectId: 'project-1',
        lastModified: 1234567890,
        size: 1024,
        hash: 'abc123',
        syncedAt: 1234567890,
        createdAt: 1234567800,
        updatedAt: 1234567890
      };

      const result = await cache.hasChanged('/test/path/file.txt', currentMetadata);

      expect(result).toBe(true);
    });

    it('should return false when lastModified and size match', async () => {
      mockGet.mockResolvedValue({
        path: '/test/path/file.txt',
        projectId: 'project-1',
        lastModified: 1234567890,
        size: 1024,
        hash: 'abc123',
        syncedAt: 1234567890,
        createdAt: 1234567800,
        updatedAt: 1234567890
      });

      const currentMetadata: FileMetadataRecord = {
        path: '/test/path/file.txt',
        projectId: 'project-1',
        lastModified: 1234567890,
        size: 1024,
        hash: 'abc123',
        syncedAt: 1234567890,
        createdAt: 1234567800,
        updatedAt: 1234567890
      };

      const result = await cache.hasChanged('/test/path/file.txt', currentMetadata);

      expect(result).toBe(false);
    });
  });

  describe('invalidate', () => {
    it('should delete file from cache', async () => {
      mockDelete.mockResolvedValue(undefined);

      await cache.invalidate('/test/path/file.txt');

      expect(mockDelete).toHaveBeenCalledWith('/test/path/file.txt');
    });
  });

  describe('clear', () => {
    it('should clear all cached metadata', async () => {
      mockClear.mockResolvedValue(undefined);

      await cache.clear();

      expect(mockClear).toHaveBeenCalled();
    });
  });

  describe('getLastSyncTime', () => {
    it('should return 0 when no files in cache', async () => {
      mockLast.mockResolvedValue(undefined);

      const result = await cache.getLastSyncTime();

      expect(result).toBe(0);
    });

    it('should return last lastModified when files exist', async () => {
      mockLast.mockResolvedValue({
        path: '/test/file.txt',
        projectId: 'project-1',
        lastModified: 1234567890,
        size: 100,
        hash: 'hash1',
        syncedAt: 1234567890,
        createdAt: 1234567800,
        updatedAt: 1234567890
      });

      const result = await cache.getLastSyncTime();

      expect(result).toBe(1234567890);
    });
  });

  describe('updateBatch', () => {
    it('should use bulkPut for efficiency', async () => {
      const mockFiles: FileMetadataRecord[] = [
        { path: '/test/file1.txt', projectId: 'p1', lastModified: 1234567891, size: 100, hash: 'hash1', syncedAt: 1, createdAt: 1, updatedAt: 1 },
        { path: '/test/file2.txt', projectId: 'p1', lastModified: 1234567892, size: 200, hash: 'hash2', syncedAt: 1, createdAt: 1, updatedAt: 1 }
      ];
      mockBulkPut.mockResolvedValue(undefined);

      await cache.updateBatch(mockFiles);

      expect(mockBulkPut).toHaveBeenCalledWith(mockFiles);
    });
  });
});
