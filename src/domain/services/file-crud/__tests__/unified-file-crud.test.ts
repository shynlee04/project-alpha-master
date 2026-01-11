/**
 * @fileoverview Unified File CRUD Service Tests
 * @module domain/services/file-crud/__tests__/unified-file-crud.test
 *
 * @epic EPIC-FS - File System & Workspace Architecture
 * @story FS-06 - Unified CRUD interface for users + agents
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  UnifiedFileCrudService,
  type FileOperationsAdapter,
} from '../unified-file-crud';
import type { FileLock } from '@/lib/agent/facades/file-lock';

// Mock FileLock
function createMockFileLock(): FileLock {
  return {
    acquire: vi.fn().mockResolvedValue(Date.now()),
    release: vi.fn().mockReturnValue(Date.now()),
    isLocked: vi.fn().mockReturnValue(false),
    getLockInfo: vi.fn().mockReturnValue(null),
  } as unknown as FileLock;
}

// Mock FileOperationsAdapter
function createMockAdapter(): FileOperationsAdapter {
  const files = new Map<string, string>();
  files.set('existing.txt', 'existing content');
  files.set('folder/nested.md', '# Nested');

  return {
    readFile: vi.fn().mockImplementation(async (path: string) => {
      if (files.has(path)) {
        return { content: files.get(path)! };
      }
      throw new Error(`File not found: ${path}`);
    }),
    writeFile: vi.fn().mockImplementation(async (path: string, content: string) => {
      files.set(path, content);
    }),
    deleteFile: vi.fn().mockImplementation(async (path: string) => {
      if (!files.has(path)) {
        throw new Error(`File not found: ${path}`);
      }
      files.delete(path);
    }),
    listDirectory: vi.fn().mockResolvedValue([
      { name: 'file1.txt', type: 'file' as const, handle: {} as FileSystemHandle },
      { name: 'file2.md', type: 'file' as const, handle: {} as FileSystemHandle },
      { name: 'folder', type: 'directory' as const, handle: {} as FileSystemHandle },
    ]),
    rename: vi.fn().mockImplementation(async (from: string, to: string) => {
      const content = files.get(from);
      if (!content) {
        throw new Error(`File not found: ${from}`);
      }
      files.delete(from);
      files.set(to, content);
    }),
  };
}

describe('UnifiedFileCrudService', () => {
  let service: UnifiedFileCrudService;
  let mockAdapter: FileOperationsAdapter;
  let mockFileLock: FileLock;

  beforeEach(() => {
    mockAdapter = createMockAdapter();
    mockFileLock = createMockFileLock();
    service = new UnifiedFileCrudService({
      adapter: mockAdapter,
      fileLock: mockFileLock,
      debug: false,
    });
  });

  describe('create', () => {
    it('should create a new file successfully', async () => {
      const result = await service.create('new-file.txt', 'Hello World', {
        source: 'user',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.path).toBe('new-file.txt');
        expect(result.data.name).toBe('new-file.txt');
        expect(result.data.contentType).toBe('text');
      }
      expect(mockAdapter.writeFile).toHaveBeenCalledWith('new-file.txt', 'Hello World');
    });

    it('should acquire lock for agent operations', async () => {
      await service.create('agent-file.ts', 'const x = 1;', {
        source: 'agent',
        useLock: true,
      });

      expect(mockFileLock.acquire).toHaveBeenCalledWith('agent-file.ts', 30000);
      expect(mockFileLock.release).toHaveBeenCalledWith('agent-file.ts');
    });

    it('should fail when file exists and overwrite is false', async () => {
      const result = await service.create('existing.txt', 'new content', {
        source: 'user',
        overwrite: false,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('FILE_EXISTS');
      }
    });

    it('should overwrite existing file when overwrite is true', async () => {
      const result = await service.create('existing.txt', 'new content', {
        source: 'user',
        overwrite: true,
      });

      expect(result.success).toBe(true);
      expect(mockAdapter.writeFile).toHaveBeenCalledWith('existing.txt', 'new content');
    });
  });

  describe('read', () => {
    it('should read existing file successfully', async () => {
      const result = await service.read('existing.txt', { source: 'user' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('existing content');
      }
    });

    it('should return FILE_NOT_FOUND for missing file', async () => {
      const result = await service.read('missing.txt', { source: 'user' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('FILE_NOT_FOUND');
      }
    });

    it('should read nested file', async () => {
      const result = await service.read('folder/nested.md', { source: 'agent' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('# Nested');
      }
    });
  });

  describe('update', () => {
    it('should update existing file successfully', async () => {
      const result = await service.update('existing.txt', 'updated content', {
        source: 'user',
      });

      expect(result.success).toBe(true);
      expect(mockAdapter.writeFile).toHaveBeenCalledWith('existing.txt', 'updated content');
    });

    it('should fail when file does not exist and createIfMissing is false', async () => {
      const result = await service.update('missing.txt', 'content', {
        source: 'user',
        createIfMissing: false,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('FILE_NOT_FOUND');
      }
    });

    it('should create file when createIfMissing is true', async () => {
      const result = await service.update('new-file.txt', 'content', {
        source: 'user',
        createIfMissing: true,
      });

      expect(result.success).toBe(true);
      expect(mockAdapter.writeFile).toHaveBeenCalledWith('new-file.txt', 'content');
    });
  });

  describe('delete', () => {
    it('should delete existing file successfully', async () => {
      const result = await service.delete('existing.txt', { source: 'user' });

      expect(result.success).toBe(true);
      expect(mockAdapter.deleteFile).toHaveBeenCalledWith('existing.txt');
    });

    it('should fail when file does not exist', async () => {
      const result = await service.delete('missing.txt', { source: 'user' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('FILE_NOT_FOUND');
      }
    });

    it('should succeed when file does not exist and ignoreNotFound is true', async () => {
      const result = await service.delete('missing.txt', {
        source: 'user',
        ignoreNotFound: true,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('list', () => {
    it('should list directory contents', async () => {
      const result = await service.list('.', { source: 'user' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(3);
        expect(result.data[0].name).toBe('file1.txt');
        expect(result.data[2].type).toBe('directory');
      }
    });

    it('should filter by extensions', async () => {
      const result = await service.list('.', {
        source: 'user',
        extensions: ['md'],
      });

      expect(result.success).toBe(true);
      if (result.success) {
        // Should include directories and .md files
        const files = result.data.filter((e) => e.type === 'file');
        expect(files.every((f) => f.name.endsWith('.md'))).toBe(true);
      }
    });
  });

  describe('move', () => {
    it('should move file successfully', async () => {
      const result = await service.move('existing.txt', 'renamed.txt', {
        source: 'user',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.path).toBe('renamed.txt');
      }
      expect(mockAdapter.rename).toHaveBeenCalledWith('existing.txt', 'renamed.txt');
    });

    it('should fail when source does not exist', async () => {
      const result = await service.move('missing.txt', 'new.txt', { source: 'user' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('FILE_NOT_FOUND');
      }
    });
  });

  describe('copy', () => {
    it('should copy file successfully', async () => {
      const result = await service.copy('existing.txt', 'copy.txt', {
        source: 'user',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.path).toBe('copy.txt');
      }
      expect(mockAdapter.readFile).toHaveBeenCalledWith('existing.txt');
      expect(mockAdapter.writeFile).toHaveBeenCalledWith('copy.txt', 'existing content');
    });
  });

  describe('exists', () => {
    it('should return true for existing file', async () => {
      const result = await service.exists('existing.txt');
      expect(result).toBe(true);
    });

    it('should return false for missing file', async () => {
      const result = await service.exists('missing.txt');
      expect(result).toBe(false);
    });
  });

  describe('getMetadata', () => {
    it('should return metadata for existing file', async () => {
      const result = await service.getMetadata('existing.txt', { source: 'user' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.path).toBe('existing.txt');
        expect(result.data.name).toBe('existing.txt');
        expect(result.data.extension).toBe('txt');
        expect(result.data.contentType).toBe('text');
        expect(result.data.size).toBe(new TextEncoder().encode('existing content').length);
      }
    });
  });

  describe('source tracking', () => {
    it('should track user source correctly', async () => {
      await service.create('user-file.txt', 'content', { source: 'user' });
      // No lock should be acquired for user operations unless explicitly requested
      expect(mockFileLock.acquire).toHaveBeenCalled();
    });

    it('should track agent source with locking', async () => {
      await service.create('agent-file.txt', 'content', {
        source: 'agent',
        useLock: true,
      });
      expect(mockFileLock.acquire).toHaveBeenCalled();
      expect(mockFileLock.release).toHaveBeenCalled();
    });

    it('should skip locking when useLock is false', async () => {
      const freshLock = createMockFileLock();
      const svc = new UnifiedFileCrudService({
        adapter: mockAdapter,
        fileLock: freshLock,
      });

      await svc.create('no-lock.txt', 'content', {
        source: 'user',
        useLock: false,
      });
      expect(freshLock.acquire).not.toHaveBeenCalled();
    });
  });
});
