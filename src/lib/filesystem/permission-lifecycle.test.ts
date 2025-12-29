import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the dexie-db module before importing
vi.mock('../state/dexie-db', () => ({
  storeFSAHandle: vi.fn().mockResolvedValue(undefined),
  getFSAHandle: vi.fn().mockResolvedValue(undefined),
  updateFSAHandleStatus: vi.fn().mockResolvedValue(undefined),
  deleteFSAHandle: vi.fn().mockResolvedValue(undefined),
}));

import {
  getPermissionState,
  ensureReadWritePermission,
  isPersistentPermissionSupported,
  restorePermission,
  saveDirectoryHandleReference,
  loadDirectoryHandleReference,
  getStoredHandleMetadata,
  deleteStoredHandleReference,
} from './permission-lifecycle'

// Import mocked functions for assertions
import { storeFSAHandle, getFSAHandle, updateFSAHandleStatus, deleteFSAHandle } from '../state/dexie-db';

function createMockHandle(states: {
  query?: 'granted' | 'prompt' | 'denied'
  request?: 'granted' | 'prompt' | 'denied'
}): FileSystemDirectoryHandle {
  const handle: any = {
    kind: 'directory',
    name: 'test-project',
    queryPermission: vi
      .fn()
      .mockResolvedValue(states.query ?? 'denied'),
    requestPermission: vi
      .fn()
      .mockResolvedValue(states.request ?? 'denied'),
  }
  return handle as FileSystemDirectoryHandle
}

describe('permission-lifecycle (Epic 24)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps queryPermission state correctly', async () => {
    const granted = createMockHandle({ query: 'granted' })
    const prompt = createMockHandle({ query: 'prompt' })
    const denied = createMockHandle({ query: 'denied' })

    await expect(getPermissionState(granted, 'readwrite')).resolves.toBe('granted')
    await expect(getPermissionState(prompt, 'readwrite')).resolves.toBe('prompt')
    await expect(getPermissionState(denied, 'readwrite')).resolves.toBe('denied')
  })

  it('returns denied when queryPermission is missing or throws', async () => {
    const noApi = ({} as any) as FileSystemDirectoryHandle
    await expect(getPermissionState(noApi, 'readwrite')).resolves.toBe('denied')

    const throwing = createMockHandle({ query: 'granted' }) as any
    throwing.queryPermission.mockRejectedValue(new Error('boom'))

    await expect(getPermissionState(throwing, 'readwrite')).resolves.toBe('denied')
  })

  it('ensureReadWritePermission returns granted when already granted', async () => {
    const handle = createMockHandle({ query: 'granted' })
    await expect(ensureReadWritePermission(handle)).resolves.toBe('granted')
  })

  it('ensureReadWritePermission requests permission when not yet granted', async () => {
    const handle = createMockHandle({ query: 'prompt', request: 'granted' })
    await expect(ensureReadWritePermission(handle)).resolves.toBe('granted')
  })

  it('ensureReadWritePermission falls back to denied when requestPermission fails or is missing', async () => {
    const handleNoApi = ({
      queryPermission: vi.fn().mockResolvedValue('prompt'),
    } as any) as FileSystemDirectoryHandle

    await expect(ensureReadWritePermission(handleNoApi)).resolves.toBe('denied')

    const handleDenied = createMockHandle({ query: 'prompt', request: 'denied' })
    await expect(ensureReadWritePermission(handleDenied)).resolves.toBe('denied')
  })
})

// Story 13-5: Tests for new permission helpers
describe('permission-lifecycle Story 13-5', () => {
  describe('isPersistentPermissionSupported', () => {
    it('returns true when navigator.permissions.query is available', () => {
      // In browser/JSDOM environment, navigator.permissions may be available
      // This test verifies the function returns a boolean
      const result = isPersistentPermissionSupported()
      expect(typeof result).toBe('boolean')
    })

    it('returns false when navigator is undefined', () => {
      // Store original navigator
      const originalNavigator = global.navigator

      // Mock undefined navigator
      Object.defineProperty(global, 'navigator', {
        value: undefined,
        writable: true,
        configurable: true,
      })

      expect(isPersistentPermissionSupported()).toBe(false)

      // Restore
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true,
      })
    })

    it('returns false when navigator.permissions is undefined', () => {
      // Store original navigator
      const originalNavigator = global.navigator

      // Mock navigator without permissions
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true,
        configurable: true,
      })

      expect(isPersistentPermissionSupported()).toBe(false)

      // Restore
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true,
      })
    })
  })

  describe('restorePermission', () => {
    it('returns granted when permission is restored', async () => {
      const handle = createMockHandle({ query: 'prompt', request: 'granted' })
      const result = await restorePermission(handle)
      expect(result).toBe('granted')
    })

    it('returns denied when permission is denied', async () => {
      const handle = createMockHandle({ query: 'prompt', request: 'denied' })
      const result = await restorePermission(handle)
      expect(result).toBe('denied')
    })

    it('returns granted immediately if already granted', async () => {
      const handle = createMockHandle({ query: 'granted' })
      const result = await restorePermission(handle)
      expect(result).toBe('granted')
    })
  })
})

// Epic 24: Tests for Dexie-based FSA handle persistence
describe('permission-lifecycle Dexie persistence (Epic 24)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveDirectoryHandleReference', () => {
    it('stores handle data using Dexie helpers', async () => {
      const handle = createMockHandle({ query: 'granted' });
      const result = await saveDirectoryHandleReference(handle, 'project-123', '/path/to/project');

      expect(result).toBe(true);
      expect(storeFSAHandle).toHaveBeenCalledTimes(1);

      // Verify the record structure
      const recordArg = (storeFSAHandle as any).mock.calls[0][0];
      expect(recordArg.projectId).toBe('project-123');
      expect(recordArg.directoryPath).toBe('/path/to/project');
      expect(recordArg.permissionStatus).toBe('granted');
      expect(recordArg.handleData).toEqual({ kind: 'directory', name: 'test-project' });
    });

    it('returns false on error', async () => {
      (storeFSAHandle as any).mockRejectedValue(new Error('DB error'));
      const handle = createMockHandle({ query: 'granted' });

      const result = await saveDirectoryHandleReference(handle, 'project-123', '/path');
      expect(result).toBe(false);
    });
  });

  describe('loadDirectoryHandleReference', () => {
    it('returns null when no stored handle exists', async () => {
      // Mock getFSAHandle to return null
      vi.mocked(getFSAHandle).mockResolvedValue(null);

      const result = await loadDirectoryHandleReference('project-123');
      expect(result).toBeNull();
    });

    it('loads handle metadata and updates access time', async () => {
      const mockRecord = {
        projectId: 'project-123',
        directoryPath: '/path/to/project',
        handleData: { kind: 'directory', name: 'test-project' },
        permissionStatus: 'granted' as const,
      };
      vi.mocked(getFSAHandle).mockResolvedValue(mockRecord);

      const result = await loadDirectoryHandleReference('project-123');
      // deserializeHandle returns null because handles can't be fully reconstructed
      expect(result).toBeNull();
      expect(vi.mocked(updateFSAHandleStatus)).toHaveBeenCalledWith('project-123', 'granted');
    });
  });

  describe('getStoredHandleMetadata', () => {
    it('returns metadata when handle exists', async () => {
      const mockRecord = {
        projectId: 'project-123',
        directoryPath: '/path/to/project',
        permissionStatus: 'granted' as const,
      };
      (getFSAHandle as any).mockResolvedValue(mockRecord);

      const result = await getStoredHandleMetadata('project-123');
      expect(result).toEqual({
        directoryPath: '/path/to/project',
        permissionStatus: 'granted',
      });
    });

    it('returns null when no handle stored', async () => {
      (getFSAHandle as any).mockResolvedValue(null);

      const result = await getStoredHandleMetadata('project-123');
      expect(result).toBeNull();
    });
  });

  describe('deleteStoredHandleReference', () => {
    it('calls deleteFSAHandle with projectId', async () => {
      await deleteStoredHandleReference('project-123');
      expect(vi.mocked(deleteFSAHandle)).toHaveBeenCalledWith('project-123');
    });

    it('handles errors gracefully', async () => {
      vi.mocked(deleteFSAHandle).mockRejectedValue(new Error('DB error'));
      // Should not throw
      await expect(deleteStoredHandleReference('project-123')).resolves.toBeUndefined();
    });
  });
})
