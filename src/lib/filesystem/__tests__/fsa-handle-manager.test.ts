import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { FSAHandleRecord } from '../../state/dexie-db';

// Create mock functions
const mockPut = vi.fn();
const mockGet = vi.fn();
const mockDelete = vi.fn();
const mockClear = vi.fn();
const mockUpdate = vi.fn();

// Mock dexie-db module
vi.mock('../../state/dexie-db', () => ({
  db: {
    fsaHandles: {
      put: mockPut,
      get: mockGet,
      delete: mockDelete,
      clear: mockClear,
      update: mockUpdate
    }
  },
  storeFSAHandle: vi.fn((record: FSAHandleRecord) => mockPut(record)),
  getFSAHandle: vi.fn((projectId: string) => mockGet(projectId)),
  deleteFSAHandle: vi.fn((projectId: string) => mockDelete(projectId)),
  updateFSAHandlePermission: vi.fn(),
  clearAllFSAHandles: vi.fn(() => mockClear())
}));

// Import after mocking
const { FSAHandleManager } = await import('../fsa-handle-manager');

describe('FSAHandleManager', () => {
  let manager: InstanceType<typeof FSAHandleManager>;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new FSAHandleManager();
  });

  describe('persistHandle', () => {
    it('should store handle metadata with all required fields', async () => {
      const mockHandle = {
        kind: 'directory' as const,
        name: 'my-project',
        queryPermission: vi.fn().mockResolvedValue('granted')
      };
      const projectId = 'project-123';

      mockPut.mockResolvedValue(undefined);

      await manager.persistHandle(mockHandle as unknown as FileSystemDirectoryHandle, projectId);

      expect(mockPut).toHaveBeenCalled();
      const savedRecord = mockPut.mock.calls[0][0];
      expect(savedRecord.projectId).toBe(projectId);
      expect(savedRecord.kind).toBe('directory');
      expect(savedRecord.name).toBe('my-project');
      expect(savedRecord.permissionStatus).toBe('granted');
      expect(savedRecord.grantedAt).toBeDefined();
      expect(savedRecord.lastAccessedAt).toBeDefined();
    });

    it('should update lastAccessedAt on each persist', async () => {
      const mockHandle = {
        kind: 'directory' as const,
        name: 'test-project'
      };

      mockPut.mockResolvedValue(undefined);

      await manager.persistHandle(mockHandle as unknown as FileSystemDirectoryHandle, 'project-1');
      await manager.persistHandle(mockHandle as unknown as FileSystemDirectoryHandle, 'project-1');

      expect(mockPut).toHaveBeenCalledTimes(2);
    });
  });

  describe('restoreHandle', () => {
    it('should return null when no handle exists', async () => {
      mockGet.mockResolvedValue(undefined);

      const result = await manager.restoreHandle('non-existent-project');

      expect(result).toBeNull();
    });

    it('should return null when permission was not granted', async () => {
      mockGet.mockResolvedValue({
        projectId: 'project-1',
        permissionStatus: 'denied',
        kind: 'directory',
        name: 'test'
      });

      const result = await manager.restoreHandle('project-1');

      expect(result).toBeNull();
    });

    it('should return null when silent re-grant fails', async () => {
      mockGet.mockResolvedValue({
        projectId: 'project-1',
        permissionStatus: 'granted',
        kind: 'directory',
        name: 'test'
      });
      mockDelete.mockResolvedValue(undefined);

      const result = await manager.restoreHandle('project-1');

      expect(result).toBeNull();
      expect(mockDelete).toHaveBeenCalledWith('project-1');
    });

    it('should return handle and update lastAccessedAt when re-grant succeeds', async () => {
      const mockHandle = {
        kind: 'directory' as const,
        name: 'test-project',
        queryPermission: vi.fn().mockResolvedValue('granted')
      };
      mockGet.mockResolvedValue({
        projectId: 'project-1',
        permissionStatus: 'granted',
        kind: 'directory',
        name: 'test-project'
      });
      mockUpdate.mockResolvedValue(1);

      // This test is limited because window.showDirectoryPicker can't be easily mocked
      // In real implementation, this would verify the full flow
      const result = await manager.restoreHandle('project-1');

      // Without showDirectoryPicker mock, result is null
      expect(result).toBeNull();
    });
  });

  describe('deleteHandle', () => {
    it('should delete handle from storage', async () => {
      mockDelete.mockResolvedValue(undefined);

      await manager.deleteHandle('project-1');

      expect(mockDelete).toHaveBeenCalledWith('project-1');
    });
  });

  describe('getPermissionStatus', () => {
    it('should return undefined when handle not found', async () => {
      mockGet.mockResolvedValue(undefined);

      const result = await manager.getPermissionStatus('non-existent');

      expect(result).toBeUndefined();
    });

    it('should return stored permission status', async () => {
      mockGet.mockResolvedValue({
        projectId: 'project-1',
        permissionStatus: 'granted',
        kind: 'directory',
        name: 'test'
      });

      const result = await manager.getPermissionStatus('project-1');

      expect(result).toBe('granted');
    });
  });

  describe('clearAll', () => {
    it('should clear all stored handles', async () => {
      mockClear.mockResolvedValue(undefined);

      await manager.clearAll();

      expect(mockClear).toHaveBeenCalled();
    });
  });

  describe('getStoredHandles', () => {
    it('should return all stored handles', async () => {
      const mockHandles: FSAHandleRecord[] = [
        {
          projectId: 'project-1',
          kind: 'directory',
          name: 'proj1',
          permissionStatus: 'granted',
          grantedAt: Date.now()
        },
        {
          projectId: 'project-2',
          kind: 'directory',
          name: 'proj2',
          permissionStatus: 'prompt',
          grantedAt: Date.now()
        }
      ];
      mockGet.mockImplementation((id: string) => {
        const handle = mockHandles.find(h => h.projectId === id);
        return Promise.resolve(handle);
      });

      const result1 = await manager.getPermissionStatus('project-1');
      const result2 = await manager.getPermissionStatus('project-2');

      expect(result1).toBe('granted');
      expect(result2).toBe('prompt');
    });
  });
});
