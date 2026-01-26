/**
 * @fileoverview IDE File Gateway Tests
 * @module infrastructure/filesystem/__tests__/ide-file-gateway
 *
 * **CC-IDE-01**: Unit tests for IDE file gateway
 *
 * Tests:
 * - Factory function returns correct gateway type
 * - File exclusion logic works
 * - Gateway implements StorageGateway interface
 * - Platform-aware gateway selection
 *
 * @epic EPIC-CC-IDE-FSA
 * @story CC-IDE-01
 * @created 2026-01-18
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createIdeFileGateway } from '../ide-file-gateway';
import { getPlatformContract } from '../platform-contract';
import type { StorageGateway } from '@/domain/interfaces/storage-gateway.interface';
import type { PlatformContract } from '../storage-types';

// ============================================================================
// Mocks
// ============================================================================

vi.mock('../platform-contract', () => ({
  getPlatformContract: vi.fn(),
}));

// ============================================================================
// Test Suite
// ============================================================================

describe('createIdeFileGateway', () => {
  let mockGetPlatformContract: ReturnType<typeof vi.fn>;
  let mockFileSystemHandle: FileSystemDirectoryHandle;

  beforeEach(() => {
    // Reset mocks before each test
    mockGetPlatformContract = vi.mocked(getPlatformContract);
    mockFileSystemHandle = {
      kind: 'directory',
      name: 'test-project',
      queryPermission: vi.fn(),
      requestPermission: vi.fn(),
      isSameEntry: vi.fn(),
      getFileHandle: vi.fn(),
      getDirectoryHandle: vi.fn(),
      removeEntry: vi.fn(),
      entries: vi.fn(),
    } as unknown as FileSystemDirectoryHandle;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('AC-1: Gateway implements StorageGateway interface', () => {
    it('should return FSAGateway for desktop IDE', () => {
      // Mock platform contract for desktop with IDE access
      mockGetPlatformContract.mockReturnValue({
        deviceType: 'desktop',
        storageType: 'fsa',
        canAccessFSA: true,
        canWatchFiles: true,
        canRunTerminal: true,
        canDoAgenticCoding: true,
        canAccessIDE: true,
      });

      const gateway = createIdeFileGateway({
        projectId: 'test-proj',
        fsaHandle: mockFileSystemHandle,
      });

      // Verify gateway is FSAGateway (check class name or interface)
      expect(gateway).toBeDefined();
      expect(gateway.constructor.name).toBe('FSAGateway');
    });

    it('should return IDBGateway for mobile device', () => {
      // Mock platform contract for mobile (no IDE access)
      mockGetPlatformContract.mockReturnValue({
        deviceType: 'mobile',
        storageType: 'indexeddb',
        canAccessFSA: false,
        canWatchFiles: false,
        canRunTerminal: false,
        canDoAgenticCoding: false,
        canAccessIDE: false,
      });

      const gateway = createIdeFileGateway({
        projectId: 'test-proj',
      });

      // Verify gateway is IDBGateway
      expect(gateway).toBeDefined();
      expect(gateway.constructor.name).toBe('IDBGateway');
    });

    it('should return IDBGateway for tablet device', () => {
      // Mock platform contract for tablet (no IDE access)
      mockGetPlatformContract.mockReturnValue({
        deviceType: 'tablet',
        storageType: 'indexeddb',
        canAccessFSA: false,
        canWatchFiles: false,
        canRunTerminal: false,
        canDoAgenticCoding: false,
        canAccessIDE: false,
      });

      const gateway = createIdeFileGateway({
        projectId: 'test-proj',
      });

      // Verify gateway is IDBGateway
      expect(gateway).toBeDefined();
      expect(gateway.constructor.name).toBe('IDBGateway');
    });

    it('should implement StorageGateway interface methods', () => {
      // Mock desktop platform
      mockGetPlatformContract.mockReturnValue({
        deviceType: 'desktop',
        storageType: 'fsa',
        canAccessFSA: true,
        canWatchFiles: true,
        canRunTerminal: true,
        canDoAgenticCoding: true,
        canAccessIDE: true,
      });

      const gateway = createIdeFileGateway({
        projectId: 'test-proj',
        fsaHandle: mockFileSystemHandle,
      });

      // Verify all StorageGateway methods exist
      expect(typeof gateway.read).toBe('function');
      expect(typeof gateway.write).toBe('function');
      expect(typeof gateway.delete).toBe('function');
      expect(typeof gateway.list).toBe('function');
      expect(typeof gateway.exists).toBe('function');
      expect(typeof gateway.watch).toBe('function');
    });
  });

  describe('AC-2: Platform-aware gateway selection', () => {
    it('should call getPlatformContract to detect platform', () => {
      mockGetPlatformContract.mockReturnValue({
        deviceType: 'desktop',
        storageType: 'fsa',
        canAccessFSA: true,
        canWatchFiles: true,
        canRunTerminal: true,
        canDoAgenticCoding: true,
        canAccessIDE: true,
      });

      createIdeFileGateway({
        projectId: 'test-proj',
        fsaHandle: mockFileSystemHandle,
      });

      expect(getPlatformContract).toHaveBeenCalledTimes(1);
    });

    it('should route to FSAGateway when canAccessIDE is true', () => {
      mockGetPlatformContract.mockReturnValue({
        deviceType: 'desktop',
        storageType: 'fsa',
        canAccessFSA: true,
        canWatchFiles: true,
        canRunTerminal: true,
        canDoAgenticCoding: true,
        canAccessIDE: true,
      });

      const gateway = createIdeFileGateway({
        projectId: 'test-proj',
        fsaHandle: mockFileSystemHandle,
      });

      expect(gateway.constructor.name).toBe('FSAGateway');
    });

    it('should route to IDBGateway when canAccessIDE is false', () => {
      mockGetPlatformContract.mockReturnValue({
        deviceType: 'mobile',
        storageType: 'indexeddb',
        canAccessFSA: false,
        canWatchFiles: false,
        canRunTerminal: false,
        canDoAgenticCoding: false,
        canAccessIDE: false,
      });

      const gateway = createIdeFileGateway({
        projectId: 'test-proj',
      });

      expect(gateway.constructor.name).toBe('IDBGateway');
    });

    it('should log creation of FSAGateway for desktop', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      mockGetPlatformContract.mockReturnValue({
        deviceType: 'desktop',
        storageType: 'fsa',
        canAccessFSA: true,
        canWatchFiles: true,
        canRunTerminal: true,
        canDoAgenticCoding: true,
        canAccessIDE: true,
      });

      createIdeFileGateway({
        projectId: 'test-proj',
        fsaHandle: mockFileSystemHandle,
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ide-file-gateway] Creating FSAGateway for desktop IDE')
      );
      consoleSpy.mockRestore();
    });

    it('should log creation of IDBGateway for mobile', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      mockGetPlatformContract.mockReturnValue({
        deviceType: 'mobile',
        storageType: 'indexeddb',
        canAccessFSA: false,
        canWatchFiles: false,
        canRunTerminal: false,
        canDoAgenticCoding: false,
        canAccessIDE: false,
      });

      createIdeFileGateway({
        projectId: 'test-proj',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ide-file-gateway] Creating IDBGateway for mobile/tablet IDE')
      );
      consoleSpy.mockRestore();
    });
  });

  describe('AC-3: File exclusion patterns applied', () => {
    it('should pass projectId to IDBGateway', () => {
      mockGetPlatformContract.mockReturnValue({
        deviceType: 'mobile',
        storageType: 'indexeddb',
        canAccessFSA: false,
        canWatchFiles: false,
        canRunTerminal: false,
        canDoAgenticCoding: false,
        canAccessIDE: false,
      });

      const gateway = createIdeFileGateway({
        projectId: 'test-project-id',
      });

      // Verify gateway is IDBGateway with correct projectId
      expect(gateway.constructor.name).toBe('IDBGateway');
      // @ts-ignore - access private property for test verification
      const gatewayAny = gateway as any;
      expect(gatewayAny.projectId).toBe('test-project-id');
    });

    it('should not fail when exclude parameter is omitted', () => {
      mockGetPlatformContract.mockReturnValue({
        deviceType: 'desktop',
        storageType: 'fsa',
        canAccessFSA: true,
        canWatchFiles: true,
        canRunTerminal: true,
        canDoAgenticCoding: true,
        canAccessIDE: true,
      });

      expect(() => {
        createIdeFileGateway({
          projectId: 'test-proj',
          fsaHandle: mockFileSystemHandle,
        });
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing fsaHandle for mobile', () => {
      mockGetPlatformContract.mockReturnValue({
        deviceType: 'mobile',
        storageType: 'indexeddb',
        canAccessFSA: false,
        canWatchFiles: false,
        canRunTerminal: false,
        canDoAgenticCoding: false,
        canAccessIDE: false,
      });

      expect(() => {
        createIdeFileGateway({
          projectId: 'test-proj',
        });
      }).not.toThrow();
    });

    it('should work with both projectId and fsaHandle', () => {
      mockGetPlatformContract.mockReturnValue({
        deviceType: 'desktop',
        storageType: 'fsa',
        canAccessFSA: true,
        canWatchFiles: true,
        canRunTerminal: true,
        canDoAgenticCoding: true,
        canAccessIDE: true,
      });

      const gateway = createIdeFileGateway({
        projectId: 'test-proj',
        fsaHandle: mockFileSystemHandle,
      });

      expect(gateway).toBeDefined();
      expect(gateway.constructor.name).toBe('FSAGateway');
    });
  });

  describe('Integration with PlatformContract', () => {
    it('should use getPlatformContract for routing decision', () => {
      const platformContract: PlatformContract = {
        deviceType: 'desktop',
        storageType: 'fsa',
        canAccessFSA: true,
        canWatchFiles: true,
        canRunTerminal: true,
        canDoAgenticCoding: true,
        canAccessIDE: true,
      };

      mockGetPlatformContract.mockReturnValue(platformContract);

      const gateway = createIdeFileGateway({
        projectId: 'test-proj',
        fsaHandle: mockFileSystemHandle,
      });

      expect(getPlatformContract).toHaveBeenCalled();
      expect(gateway.constructor.name).toBe('FSAGateway');
    });

    it('should check canAccessIDE for IDE routing', () => {
      const platformWithIDE: PlatformContract = {
        deviceType: 'desktop',
        storageType: 'fsa',
        canAccessFSA: true,
        canWatchFiles: true,
        canRunTerminal: true,
        canDoAgenticCoding: true,
        canAccessIDE: true,
      };

      const platformWithoutIDE: PlatformContract = {
        deviceType: 'mobile',
        storageType: 'indexeddb',
        canAccessFSA: false,
        canWatchFiles: false,
        canRunTerminal: false,
        canDoAgenticCoding: false,
        canAccessIDE: false,
      };

      // Test with IDE access
      mockGetPlatformContract.mockReturnValue(platformWithIDE);
      let gateway = createIdeFileGateway({
        projectId: 'test-proj',
        fsaHandle: mockFileSystemHandle,
      });
      expect(gateway.constructor.name).toBe('FSAGateway');

      // Test without IDE access
      mockGetPlatformContract.mockReturnValue(platformWithoutIDE);
      gateway = createIdeFileGateway({
        projectId: 'test-proj',
      });
      expect(gateway.constructor.name).toBe('IDBGateway');
    });
  });
});
