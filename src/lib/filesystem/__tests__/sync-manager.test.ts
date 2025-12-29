/**
 * Sync Manager Tests
 * @module lib/filesystem/__tests__/sync-manager.test
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { SyncConfig } from '../sync-types';

// Create mock functions before vi.mock
const mockBoot = vi.fn().mockResolvedValue(undefined);
const mockMount = vi.fn().mockResolvedValue(undefined);
const mockIsBooted = vi.fn().mockReturnValue(true);
const mockGetFileSystem = vi.fn().mockReturnValue({
  writeFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
  rm: vi.fn().mockResolvedValue(undefined),
});

// Mock webcontainer module
vi.mock('../webcontainer', () => ({
  boot: mockBoot,
  mount: mockMount,
  getFileSystem: mockGetFileSystem,
  isBooted: mockIsBooted,
}));

import { SyncManager, createSyncManager, SyncError } from '../sync-manager';
import type { LocalFSAdapter } from '../local-fs-adapter';

describe('SyncManager', () => {
  let mockAdapter: LocalFSAdapter;
  let syncManager: SyncManager;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock implementations
    mockBoot.mockResolvedValue(undefined);
    mockMount.mockResolvedValue(undefined);
    mockIsBooted.mockReturnValue(true);
    mockGetFileSystem.mockReturnValue({
      writeFile: vi.fn().mockResolvedValue(undefined),
      mkdir: vi.fn().mockResolvedValue(undefined),
      rm: vi.fn().mockResolvedValue(undefined),
    });

    mockAdapter = {
      requestDirectoryAccess: vi.fn().mockResolvedValue({}),
      getDirectoryHandle: vi.fn(),
      readFile: vi.fn().mockResolvedValue('file content'),
      writeFile: vi.fn().mockResolvedValue(undefined),
      deleteFile: vi.fn().mockResolvedValue(undefined),
      createDirectory: vi.fn().mockResolvedValue(undefined),
      deleteDirectory: vi.fn().mockResolvedValue(undefined),
      exists: vi.fn().mockResolvedValue(true),
      listFiles: vi.fn().mockResolvedValue([]),
      isDirectory: vi.fn().mockResolvedValue(false),
      getFullPath: vi.fn().mockImplementation((path) => Promise.resolve(path)),
    } as unknown as LocalFSAdapter;

    syncManager = new SyncManager(mockAdapter);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Initial State', () => {
    it('should start with idle status', () => {
      expect(syncManager.status).toBe('idle');
    });

    it('should have default exclusion patterns', () => {
      const patterns = syncManager.getExcludePatterns();
      expect(patterns).toContain('.git');
      expect(patterns).toContain('node_modules');
    });

    it('should accept custom config', () => {
      const customConfig: Partial<SyncConfig> = {
        excludePatterns: ['custom-dir'],
        preScanFileCount: true,
      };
      const manager = new SyncManager(mockAdapter, customConfig);
      expect(manager.getExcludePatterns()).toContain('custom-dir');
    });

    it('should have default config values', () => {
      const manager = new SyncManager(mockAdapter);
      const config = (manager as { config: SyncConfig }).config;
      expect(config.preScanFileCount).toBe(true);
    });
  });

  describe('writeFile', () => {
    it('should write to local FS first', async () => {
      await syncManager.writeFile('test.txt', 'content');

      expect(mockAdapter.writeFile).toHaveBeenCalledWith('test.txt', 'content');
    });

    it('should write to WebContainer if booted', async () => {
      await syncManager.writeFile('test.txt', 'content');

      const mockFs = mockGetFileSystem();
      expect(mockFs.writeFile).toHaveBeenCalledWith('test.txt', 'content');
    });

    it('should create parent directories in WebContainer for nested paths', async () => {
      await syncManager.writeFile('src/components/Test.tsx', 'content');

      const mockFs = mockGetFileSystem();
      expect(mockFs.mkdir).toHaveBeenCalledWith('src/components', { recursive: true });
    });

    it('should not create directories for root-level files', async () => {
      const mockFs = mockGetFileSystem();
      mockFs.mkdir.mockClear();

      await syncManager.writeFile('index.html', '<html></html>');

      expect(mockFs.mkdir).not.toHaveBeenCalled();
    });

    it('should throw SyncError on local FS write failure', async () => {
      mockAdapter.writeFile = vi.fn().mockRejectedValue(new Error('Permission denied'));

      await expect(syncManager.writeFile('test.txt', 'content')).rejects.toThrow(SyncError);
    });

    it('should set error status on write failure', async () => {
      mockAdapter.writeFile = vi.fn().mockRejectedValue(new Error('Permission denied'));

      try {
        await syncManager.writeFile('test.txt', 'content');
      } catch {
        // Expected
      }

      expect(syncManager.status).toBe('error');
    });
  });

  describe('deleteFile', () => {
    it('should delete from local FS first', async () => {
      await syncManager.deleteFile('test.txt');

      expect(mockAdapter.deleteFile).toHaveBeenCalledWith('test.txt');
    });

    it('should delete from WebContainer if booted', async () => {
      await syncManager.deleteFile('test.txt');

      const mockFs = mockGetFileSystem();
      expect(mockFs.rm).toHaveBeenCalledWith('test.txt');
    });

    it('should handle missing file in WebContainer gracefully', async () => {
      const mockFs = mockGetFileSystem();
      mockFs.rm.mockRejectedValue(new Error('Not found'));

      // Should not throw
      await syncManager.deleteFile('test.txt');
    });

    it('should throw SyncError on local FS delete failure', async () => {
      mockAdapter.deleteFile = vi.fn().mockRejectedValue(new Error('Not found'));

      await expect(syncManager.deleteFile('test.txt')).rejects.toThrow(SyncError);
    });
  });

  describe('createDirectory', () => {
    it('should create in local FS first', async () => {
      await syncManager.createDirectory('new-dir');

      expect(mockAdapter.createDirectory).toHaveBeenCalledWith('new-dir');
    });

    it('should create in WebContainer if booted', async () => {
      await syncManager.createDirectory('new-dir');

      const mockFs = mockGetFileSystem();
      expect(mockFs.mkdir).toHaveBeenCalledWith('new-dir', { recursive: true });
    });

    it('should throw SyncError on local FS create failure', async () => {
      mockAdapter.createDirectory = vi.fn().mockRejectedValue(new Error('Already exists'));

      await expect(syncManager.createDirectory('new-dir')).rejects.toThrow(SyncError);
    });
  });

  describe('deleteDirectory', () => {
    it('should delete from local FS first', async () => {
      await syncManager.deleteDirectory('old-dir');

      expect(mockAdapter.deleteDirectory).toHaveBeenCalledWith('old-dir');
    });

    it('should delete from WebContainer if booted', async () => {
      await syncManager.deleteDirectory('old-dir');

      const mockFs = mockGetFileSystem();
      expect(mockFs.rm).toHaveBeenCalledWith('old-dir', { recursive: true });
    });

    it('should throw SyncError on local FS delete failure', async () => {
      mockAdapter.deleteDirectory = vi.fn().mockRejectedValue(new Error('Not found'));

      await expect(syncManager.deleteDirectory('old-dir')).rejects.toThrow(SyncError);
    });
  });

  describe('exclude patterns', () => {
    it('should merge custom patterns with defaults', () => {
      syncManager.setExcludePatterns(['custom', 'patterns']);

      const patterns = syncManager.getExcludePatterns();
      expect(patterns).toContain('.git');
      expect(patterns).toContain('node_modules');
      expect(patterns).toContain('custom');
      expect(patterns).toContain('patterns');
    });

    it('should preserve default patterns when updating', () => {
      syncManager.setExcludePatterns(['custom']);

      const patterns = syncManager.getExcludePatterns();
      expect(patterns).toContain('.git');
      expect(patterns).toContain('node_modules');
      expect(patterns).toContain('custom');
    });

    it('should return copy of patterns array', () => {
      const patterns1 = syncManager.getExcludePatterns();
      const patterns2 = syncManager.getExcludePatterns();

      expect(patterns1).not.toBe(patterns2);
      expect(patterns1).toEqual(patterns2);
    });
  });

  describe('createSyncManager factory', () => {
    it('should create SyncManager instance', () => {
      const manager = createSyncManager(mockAdapter);
      expect(manager).toBeInstanceOf(SyncManager);
    });

    it('should accept optional config', () => {
      const manager = createSyncManager(mockAdapter, { excludePatterns: ['test'] });
      expect(manager.getExcludePatterns()).toContain('test');
    });

    it('should accept eventBus parameter', () => {
      const eventBus = { emit: vi.fn() };
      const manager = createSyncManager(mockAdapter, {}, eventBus as never);
      expect(manager.status).toBe('idle');
    });
  });

  describe('SyncError', () => {
    it('should have correct error codes', () => {
      const error = new SyncError('Test error', 'FILE_WRITE_FAILED', '/test', new Error('original'));
      expect(error.code).toBe('FILE_WRITE_FAILED');
      expect(error.message).toBe('Test error');
      expect(error.filePath).toBe('/test');
    });

    it('should be throwable and catchable', async () => {
      mockAdapter.writeFile = vi.fn().mockRejectedValue(new Error('Permission denied'));

      try {
        await syncManager.writeFile('test.txt', 'content');
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(SyncError);
      }
    });
  });
});

// Story 24-1: Tests for incrementalSyncToWebContainer with FileMetadataCache integration
describe('SyncManager incrementalSync (Story 24-1)', () => {
  let mockAdapter: LocalFSAdapter;
  let mockFileMetadataCache: {
    getLastSyncTime: ReturnType<typeof vi.fn>;
    getChangedFiles: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
  };
  let syncManager: SyncManager;

  // Create mock functions before vi.mock
  const mockBoot = vi.fn().mockResolvedValue(undefined);
  const mockMount = vi.fn().mockResolvedValue(undefined);
  const mockIsBooted = vi.fn().mockReturnValue(true);
  const mockGetFileSystem = vi.fn().mockReturnValue({
    writeFile: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined),
    rm: vi.fn().mockResolvedValue(undefined),
  });

  // Mock webcontainer module
  vi.mock('../webcontainer', () => ({
    boot: mockBoot,
    mount: mockMount,
    getFileSystem: mockGetFileSystem,
    isBooted: mockIsBooted,
  }));

  // Mock file-metadata-cache module
  vi.mock('../sync/file-metadata-cache', () => ({
    fileMetadataCache: {
      getLastSyncTime: vi.fn(),
      getChangedFiles: vi.fn(),
      set: vi.fn(),
    },
  }));

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock implementations
    mockBoot.mockResolvedValue(undefined);
    mockIsBooted.mockReturnValue(true);
    mockGetFileSystem.mockReturnValue({
      writeFile: vi.fn().mockResolvedValue(undefined),
      mkdir: vi.fn().mockResolvedValue(undefined),
      rm: vi.fn().mockResolvedValue(undefined),
    });

    // Setup file metadata cache mock
    mockFileMetadataCache = {
      getLastSyncTime: vi.fn().mockResolvedValue(0),
      getChangedFiles: vi.fn().mockResolvedValue([]),
      set: vi.fn().mockResolvedValue(undefined),
    };

    // Import and replace the mock
    const { fileMetadataCache } = await import('../sync/file-metadata-cache');
    vi.mocked(fileMetadataCache).getLastSyncTime = mockFileMetadataCache.getLastSyncTime;
    vi.mocked(fileMetadataCache).getChangedFiles = mockFileMetadataCache.getChangedFiles;
    vi.mocked(fileMetadataCache).set = mockFileMetadataCache.set;

    mockAdapter = {
      requestDirectoryAccess: vi.fn().mockResolvedValue({}),
      getDirectoryHandle: vi.fn(),
      readFile: vi.fn().mockResolvedValue('file content'),
      writeFile: vi.fn().mockResolvedValue(undefined),
      deleteFile: vi.fn().mockResolvedValue(undefined),
      createDirectory: vi.fn().mockResolvedValue(undefined),
      deleteDirectory: vi.fn().mockResolvedValue(undefined),
      exists: vi.fn().mockResolvedValue(true),
      listFiles: vi.fn().mockResolvedValue([]),
      isDirectory: vi.fn().mockResolvedValue(false),
      getFullPath: vi.fn().mockImplementation((path) => Promise.resolve(path)),
    } as unknown as LocalFSAdapter;

    syncManager = new SyncManager(mockAdapter);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('incrementalSyncToWebContainer', () => {
    it('should return empty result when no files changed', async () => {
      mockFileMetadataCache.getChangedFiles.mockResolvedValue([]);

      const result = await syncManager.incrementalSyncToWebContainer();

      expect(result.success).toBe(true);
      expect(result.totalFiles).toBe(0);
      expect(result.syncedFiles).toBe(0);
      expect(result.failedFiles).toHaveLength(0);
    });

    it('should sync only changed files to WebContainer', async () => {
      const changedFiles = [
        { path: 'src/index.ts', lastModified: 1000, size: 100 },
        { path: 'src/utils.ts', lastModified: 1001, size: 200 },
      ];
      mockFileMetadataCache.getChangedFiles.mockResolvedValue(changedFiles);
      mockAdapter.readFile.mockResolvedValue('// file content');

      const result = await syncManager.incrementalSyncToWebContainer();

      expect(result.success).toBe(true);
      expect(result.totalFiles).toBe(2);
      expect(result.syncedFiles).toBe(2);

      const mockFs = mockGetFileSystem();
      expect(mockFs.writeFile).toHaveBeenCalledTimes(2);
    });

    it('should read file content from local FS for each changed file', async () => {
      const changedFiles = [
        { path: 'src/index.ts', lastModified: 1000, size: 100 },
      ];
      mockFileMetadataCache.getChangedFiles.mockResolvedValue(changedFiles);
      mockAdapter.readFile.mockResolvedValue('// updated content');

      await syncManager.incrementalSyncToWebContainer();

      expect(mockAdapter.readFile).toHaveBeenCalledWith('src/index.ts');
    });

    it('should create parent directories for nested files', async () => {
      const changedFiles = [
        { path: 'src/components/Button.tsx', lastModified: 1000, size: 100 },
      ];
      mockFileMetadataCache.getChangedFiles.mockResolvedValue(changedFiles);
      mockAdapter.readFile.mockResolvedValue('// component code');

      await syncManager.incrementalSyncToWebContainer();

      const mockFs = mockGetFileSystem();
      expect(mockFs.mkdir).toHaveBeenCalledWith('src/components', { recursive: true });
    });

    it('should update last sync time after successful sync', async () => {
      const changedFiles = [
        { path: 'test.ts', lastModified: 1000, size: 100 },
      ];
      mockFileMetadataCache.getChangedFiles.mockResolvedValue(changedFiles);

      await syncManager.incrementalSyncToWebContainer();

      expect(mockFileMetadataCache.set).toHaveBeenCalled();
      const setCall = (mockFileMetadataCache.set as vi.fn).mock.calls[0][0];
      expect(setCall.path).toBe('@lastSync');
      expect(setCall.lastModified).toBeDefined();
    });

    it('should skip files that fail to read', async () => {
      const changedFiles = [
        { path: 'good.ts', lastModified: 1000, size: 100 },
        { path: 'bad.ts', lastModified: 1001, size: 200 },
      ];
      mockFileMetadataCache.getChangedFiles.mockResolvedValue(changedFiles);
      mockAdapter.readFile
        .mockResolvedValueOnce('// good content')
        .mockRejectedValueOnce(new Error('Read error'));

      const result = await syncManager.incrementalSyncToWebContainer();

      expect(result.success).toBe(false);
      expect(result.failedFiles).toContain('bad.ts');
    });

    it('should skip files that fail to write to WebContainer', async () => {
      const changedFiles = [
        { path: 'good.ts', lastModified: 1000, size: 100 },
        { path: 'bad.ts', lastModified: 1001, size: 200 },
      ];
      mockFileMetadataCache.getChangedFiles.mockResolvedValue(changedFiles);
      mockAdapter.readFile.mockResolvedValue('// content');

      const mockFs = mockGetFileSystem();
      mockFs.writeFile
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Write error'));

      const result = await syncManager.incrementalSyncToWebContainer();

      expect(result.success).toBe(false);
      expect(result.failedFiles).toContain('bad.ts');
    });

    it('should boot WebContainer if not booted', async () => {
      mockIsBooted.mockReturnValue(false);
      mockFileMetadataCache.getChangedFiles.mockResolvedValue([]);

      await syncManager.incrementalSyncToWebContainer();

      expect(mockBoot).toHaveBeenCalled();
    });

    it('should return result when sync already in progress', async () => {
      // Start first sync
      const syncPromise = syncManager.incrementalSyncToWebContainer();

      // Second sync should return early
      const result = await syncManager.incrementalSyncToWebContainer();

      expect(result.success).toBe(false);
      expect(result.totalFiles).toBe(0);

      // Wait for first sync to complete
      await syncPromise;
    });

    it('should set error status on critical failure', async () => {
      mockFileMetadataCache.getChangedFiles.mockRejectedValue(new Error('Cache error'));

      try {
        await syncManager.incrementalSyncToWebContainer();
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(SyncError);
      }

      expect(syncManager.status).toBe('error');
    });

    it('should report duration in result', async () => {
      mockFileMetadataCache.getChangedFiles.mockResolvedValue([]);

      const result = await syncManager.incrementalSyncToWebContainer();

      expect(result.duration).toBeGreaterThanOrEqual(0);
    });
  });
});
