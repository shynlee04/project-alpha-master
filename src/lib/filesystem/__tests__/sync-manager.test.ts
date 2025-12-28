/**
 * Sync Manager Tests
 * @module lib/filesystem/__tests__/sync-manager.test
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { SyncConfig } from '../sync-types';

// Mock webcontainer module before importing SyncManager
const mockMount = vi.fn().mockResolvedValue(undefined);
const mockBoot = vi.fn().mockResolvedValue(undefined);
const mockIsBooted = vi.fn().mockReturnValue(true);
const mockGetFileSystem = vi.fn().mockReturnValue({
  writeFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
  rm: vi.fn().mockResolvedValue(undefined),
});

vi.mock('../webcontainer', () => ({
  boot: vi.fn().mockResolvedValue(undefined),
  mount: vi.fn().mockResolvedValue(undefined),
  getFileSystem: vi.fn().mockReturnValue({
    writeFile: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined),
    rm: vi.fn().mockResolvedValue(undefined),
  }),
  isBooted: vi.fn().mockReturnValue(true),
}));

import { SyncManager, createSyncManager } from '../sync-manager';
import { LocalFSAdapter } from '../local-fs-adapter';
import { boot, mount, getFileSystem, isBooted } from '../webcontainer';

describe('SyncManager', () => {
  let mockAdapter: LocalFSAdapter;
  let syncManager: SyncManager;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset and configure mocks
    vi.mocked(boot).mockResolvedValue(undefined);
    vi.mocked(mount).mockResolvedValue(undefined);
    vi.mocked(isBooted).mockReturnValue(true);
    vi.mocked(getFileSystem).mockReturnValue({
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
  });

  describe('syncToWebContainer', () => {
    it('should boot WebContainer if not already booted', async () => {
      vi.mocked(isBooted).mockReturnValue(false);

      await syncManager.syncToWebContainer();

      expect(boot).toHaveBeenCalled();
    });

    it('should mount built file tree to WebContainer', async () => {
      mockAdapter.listFiles = vi.fn().mockResolvedValue([]);

      await syncManager.syncToWebContainer();

      expect(mount).toHaveBeenCalled();
      const mountedTree = vi.mocked(mount).mock.calls[0][0];
      expect(mountedTree).toBeDefined();
    });

    it('should return successful result', async () => {
      mockAdapter.listFiles = vi.fn().mockResolvedValue([]);

      const result = await syncManager.syncToWebContainer();

      expect(result.success).toBe(true);
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('should set status to error on failure', async () => {
      vi.mocked(mount).mockRejectedValue(new Error('Mount failed'));

      await expect(syncManager.syncToWebContainer()).rejects.toThrow();
      expect(syncManager.status).toBe('error');
    });
  });

  describe('writeFile', () => {
    it('should write to local FS first', async () => {
      await syncManager.writeFile('test.txt', 'content');

      expect(mockAdapter.writeFile).toHaveBeenCalledWith('test.txt', 'content');
    });

    it('should write to WebContainer if booted', async () => {
      const mockFs = vi.mocked(getFileSystem)();
      await syncManager.writeFile('test.txt', 'content');

      expect(mockFs.writeFile).toHaveBeenCalledWith('test.txt', 'content');
    });

    it('should create parent directories in WebContainer', async () => {
      const mockFs = vi.mocked(getFileSystem)();
      await syncManager.writeFile('src/components/Test.tsx', 'content');

      expect(mockFs.mkdir).toHaveBeenCalledWith('src/components', { recursive: true });
    });

    it('should throw on local FS write failure', async () => {
      mockAdapter.writeFile = vi.fn().mockRejectedValue(new Error('Permission denied'));

      await expect(syncManager.writeFile('test.txt', 'content')).rejects.toThrow();
    });
  });

  describe('deleteFile', () => {
    it('should delete from local FS first', async () => {
      await syncManager.deleteFile('test.txt');

      expect(mockAdapter.deleteFile).toHaveBeenCalledWith('test.txt');
    });

    it('should delete from WebContainer if booted', async () => {
      const mockFs = vi.mocked(getFileSystem)();
      await syncManager.deleteFile('test.txt');

      expect(mockFs.rm).toHaveBeenCalledWith('test.txt');
    });

    it('should handle missing file in WebContainer gracefully', async () => {
      const mockFs = vi.mocked(getFileSystem)();
      mockFs.rm.mockRejectedValue(new Error('Not found'));

      // Should not throw
      await syncManager.deleteFile('test.txt');
    });
  });

  describe('createDirectory', () => {
    it('should create in local FS first', async () => {
      await syncManager.createDirectory('new-dir');

      expect(mockAdapter.createDirectory).toHaveBeenCalledWith('new-dir');
    });

    it('should create in WebContainer if booted', async () => {
      const mockFs = vi.mocked(getFileSystem)();
      await syncManager.createDirectory('new-dir');

      expect(mockFs.mkdir).toHaveBeenCalledWith('new-dir', { recursive: true });
    });
  });

  describe('deleteDirectory', () => {
    it('should delete from local FS first', async () => {
      await syncManager.deleteDirectory('old-dir');

      expect(mockAdapter.deleteDirectory).toHaveBeenCalledWith('old-dir');
    });

    it('should delete from WebContainer if booted', async () => {
      const mockFs = vi.mocked(getFileSystem)();
      await syncManager.deleteDirectory('old-dir');

      expect(mockFs.rm).toHaveBeenCalledWith('old-dir', { recursive: true });
    });
  });

  describe('exclude patterns', () => {
    it('should allow updating exclusion patterns', () => {
      syncManager.setExcludePatterns(['custom', 'patterns']);

      expect(syncManager.getExcludePatterns()).toEqual(['custom', 'patterns']);
    });

    it('should return copy of patterns array', () => {
      const patterns1 = syncManager.getExcludePatterns();
      const patterns2 = syncManager.getExcludePatterns();

      expect(patterns1).not.toBe(patterns2);
      expect(patterns1).toEqual(patterns2);
    });
  });

  describe('callbacks', () => {
    it('should call onComplete callback', async () => {
      const onComplete = vi.fn();
      const manager = new SyncManager(mockAdapter, { onComplete });

      mockAdapter.listFiles = vi.fn().mockResolvedValue([]);

      await manager.syncToWebContainer();

      expect(onComplete).toHaveBeenCalled();
    });

    it('should call onError callback on failure', async () => {
      const onError = vi.fn();
      const manager = new SyncManager(mockAdapter, { onError });

      vi.mocked(mount).mockRejectedValue(new Error('Mount failed'));

      await expect(manager.syncToWebContainer()).rejects.toThrow();

      expect(onError).toHaveBeenCalled();
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
  });
});
