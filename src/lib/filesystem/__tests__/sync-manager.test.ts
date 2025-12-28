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
    it('should allow updating exclusion patterns', () => {
      syncManager.setExcludePatterns(['custom', 'patterns']);

      expect(syncManager.getExcludePatterns()).toEqual(['custom', 'patterns']);
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
