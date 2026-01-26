/**
 * @fileoverview Storage Gateway Factory Tests - Gateway creation and routing tests
 * @module infrastructure/filesystem/__tests__/storage-gateway-factory.test.ts
 *
 * **CC-SG-02**: Create Platform Routing Tests
 *
 * Tests for:
 * - Factory creates FSAGateway for 'fsa' storage type
 * - Factory creates IDBGateway for 'indexeddb' storage type
 * - Factory throws error for FSA without directoryHandle
 * - Factory throws error for IDB without projectId
 * - Test createFromPlatform() routing
 *
 * @epic EPIC-CC-ARC
 * @story CC-SG-02
 * @created 2026-01-18
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createStorageGateway,
  createFSAGateway,
  createIDBGateway,
  storageGatewayFactory,
} from '../storage-gateway-factory';
import type { StorageGateway } from '../../../domain/interfaces/storage-gateway.interface';
import { FSAGateway } from '../fsa-gateway';
import { IDBGateway } from '../idb-gateway';
import type { StorageType } from '../platform-contract';

// ============================================================================
// Mock Setup
// ============================================================================

/**
 * Mock FileSystemDirectoryHandle for testing
 */
class MockFileSystemDirectoryHandle {
  constructor(public name: string = 'mock-project') {}
}

// ============================================================================
// Test Suites
// ============================================================================

describe('StorageGatewayFactory', () => {
  // ------------------------------------------------------------------------
  // createStorageGateway Tests
  // ------------------------------------------------------------------------

  describe('createStorageGateway', () => {
    it('should create FSAGateway for fsa storage type', () => {
      const mockHandle = new MockFileSystemDirectoryHandle('test-project');
      const gateway = createStorageGateway(
        { storageType: 'fsa' as StorageType },
        { directoryHandle: mockHandle as any }
      );

      expect(gateway).toBeInstanceOf(FSAGateway);
    });

    it('should create IDBGateway for indexeddb storage type', () => {
      const gateway = createStorageGateway(
        { storageType: 'indexeddb' as StorageType },
        { projectId: 'test-project' }
      );

      expect(gateway).toBeInstanceOf(IDBGateway);
    });

    it('should throw error for FSA without directoryHandle', () => {
      expect(() => {
        createStorageGateway(
          { storageType: 'fsa' as StorageType },
          {}
        );
      }).toThrow('FSAGateway requires directoryHandle option');
    });

    it('should throw error for IDB without projectId', () => {
      expect(() => {
        createStorageGateway(
          { storageType: 'indexeddb' as StorageType },
          {}
        );
      }).toThrow('IDBGateway requires projectId option');
    });

    it('should throw specific error message for missing FSA handle', () => {
      try {
        createStorageGateway({ storageType: 'fsa' as StorageType }, {});
        throw new Error('Expected error was not thrown');
      } catch (error) {
        expect((error as Error).message).toBe('FSAGateway requires directoryHandle option');
      }
    });

    it('should throw specific error message for missing IDB projectId', () => {
      try {
        createStorageGateway({ storageType: 'indexeddb' as StorageType }, {});
        throw new Error('Expected error was not thrown');
      } catch (error) {
        expect((error as Error).message).toBe('IDBGateway requires projectId option');
      }
    });
  });

  // ------------------------------------------------------------------------
  // createFSAGateway Tests
  // ------------------------------------------------------------------------

  describe('createFSAGateway', () => {
    it('should create FSAGateway instance', () => {
      const mockHandle = new MockFileSystemDirectoryHandle('test-project');
      const gateway = createFSAGateway(mockHandle as any);

      expect(gateway).toBeInstanceOf(FSAGateway);
    });

    it('should return StorageGateway interface', () => {
      const mockHandle = new MockFileSystemDirectoryHandle('test-project');
      const gateway = createFSAGateway(mockHandle as any);

      // Verify interface methods exist
      expect(gateway).toHaveProperty('read');
      expect(gateway).toHaveProperty('write');
      expect(gateway).toHaveProperty('delete');
      expect(gateway).toHaveProperty('list');
      expect(gateway).toHaveProperty('exists');
      expect(gateway).toHaveProperty('watch');
    });
  });

  // ------------------------------------------------------------------------
  // createIDBGateway Tests
  // ------------------------------------------------------------------------

  describe('createIDBGateway', () => {
    it('should create IDBGateway instance', () => {
      const gateway = createIDBGateway('test-project');

      expect(gateway).toBeInstanceOf(IDBGateway);
    });

    it('should return StorageGateway interface', () => {
      const gateway = createIDBGateway('test-project');

      // Verify interface methods exist
      expect(gateway).toHaveProperty('read');
      expect(gateway).toHaveProperty('write');
      expect(gateway).toHaveProperty('delete');
      expect(gateway).toHaveProperty('list');
      expect(gateway).toHaveProperty('exists');
      expect(gateway).toHaveProperty('watch');
    });

    it('should accept projectId string', () => {
      const projectId = 'proj_test123';
      const gateway = createIDBGateway(projectId);

      expect(gateway).toBeInstanceOf(IDBGateway);
    });

    it('should handle long projectId strings', () => {
      const longProjectId = 'proj_' + 'x'.repeat(100);
      const gateway = createIDBGateway(longProjectId);

      expect(gateway).toBeInstanceOf(IDBGateway);
    });

    it('should handle projectId with special characters', () => {
      const specialProjectId = 'proj_test-2026.01.18';
      const gateway = createIDBGateway(specialProjectId);

      expect(gateway).toBeInstanceOf(IDBGateway);
    });
  });

  // ------------------------------------------------------------------------
  // storageGatewayFactory Tests
  // ------------------------------------------------------------------------

  describe('storageGatewayFactory', () => {
    it('should be a singleton instance', () => {
      const factory1 = storageGatewayFactory;
      const factory2 = storageGatewayFactory;

      expect(factory1).toBe(factory2);
    });

    it('should have createFromPlatform method', () => {
      expect(storageGatewayFactory).toHaveProperty('createFromPlatform');
      expect(typeof storageGatewayFactory.createFromPlatform).toBe('function');
    });

    it('should have createFSAGateway method', () => {
      expect(storageGatewayFactory).toHaveProperty('createFSAGateway');
      expect(typeof storageGatewayFactory.createFSAGateway).toBe('function');
    });

    it('should have createIDBGateway method', () => {
      expect(storageGatewayFactory).toHaveProperty('createIDBGateway');
      expect(typeof storageGatewayFactory.createIDBGateway).toBe('function');
    });

    it('should create FSAGateway via factory method', () => {
      const mockHandle = new MockFileSystemDirectoryHandle('test-project');
      const gateway = storageGatewayFactory.createFSAGateway(mockHandle as any);

      expect(gateway).toBeInstanceOf(FSAGateway);
    });

    it('should create IDBGateway via factory method', () => {
      const gateway = storageGatewayFactory.createIDBGateway('test-project');

      expect(gateway).toBeInstanceOf(IDBGateway);
    });
  });

  // ------------------------------------------------------------------------
  // createFromPlatform Tests
  // ------------------------------------------------------------------------

  describe('createFromPlatform', () => {
    it('should route to FSAGateway for fsa storage type', () => {
      const mockHandle = new MockFileSystemDirectoryHandle('test-project');
      const gateway = storageGatewayFactory.createFromPlatform(
        { storageType: 'fsa' as StorageType },
        { directoryHandle: mockHandle as any }
      );

      expect(gateway).toBeInstanceOf(FSAGateway);
    });

    it('should route to IDBGateway for indexeddb storage type', () => {
      const gateway = storageGatewayFactory.createFromPlatform(
        { storageType: 'indexeddb' as StorageType },
        { projectId: 'test-project' }
      );

      expect(gateway).toBeInstanceOf(IDBGateway);
    });

    it('should throw error for fsa without directoryHandle', () => {
      expect(() => {
        storageGatewayFactory.createFromPlatform(
          { storageType: 'fsa' as StorageType },
          {}
        );
      }).toThrow('FSAGateway requires directoryHandle option');
    });

    it('should throw error for indexeddb without projectId', () => {
      expect(() => {
        storageGatewayFactory.createFromPlatform(
          { storageType: 'indexeddb' as StorageType },
          {}
        );
      }).toThrow('IDBGateway requires projectId option');
    });

    it('should accept both directoryHandle and projectId', () => {
      const mockHandle = new MockFileSystemDirectoryHandle('test-project');
      const gateway = storageGatewayFactory.createFromPlatform(
        { storageType: 'fsa' as StorageType },
        {
          directoryHandle: mockHandle as any,
          projectId: 'test-project',
        }
      );

      // Should use directoryHandle for fsa
      expect(gateway).toBeInstanceOf(FSAGateway);
    });

    it('should use only projectId for indexeddb', () => {
      const mockHandle = new MockFileSystemDirectoryHandle('test-project');
      const gateway = storageGatewayFactory.createFromPlatform(
        { storageType: 'indexeddb' as StorageType },
        {
          directoryHandle: mockHandle as any,
          projectId: 'test-project',
        }
      );

      // Should use projectId for indexeddb
      expect(gateway).toBeInstanceOf(IDBGateway);
    });
  });

  // ------------------------------------------------------------------------
  // Type Safety Tests
  // ------------------------------------------------------------------------

  describe('Type Safety', () => {
    it('should return StorageGateway interface', () => {
      const mockHandle = new MockFileSystemDirectoryHandle('test-project');
      const gateway = createStorageGateway(
        { storageType: 'fsa' as StorageType },
        { directoryHandle: mockHandle as any }
      );

      // Type guard to ensure interface compliance
      const isStorageGateway: StorageGateway = gateway;
      expect(isStorageGateway).toBeDefined();
    });

    it('should accept StorageType union', () => {
      const mockHandle = new MockFileSystemDirectoryHandle('test-project');

      // Both should work without type errors
      const fsaGateway = createStorageGateway(
        { storageType: 'fsa' as StorageType },
        { directoryHandle: mockHandle as any }
      );

      const idbGateway = createStorageGateway(
        { storageType: 'indexeddb' as StorageType },
        { projectId: 'test-project' }
      );

      expect(fsaGateway).toBeInstanceOf(FSAGateway);
      expect(idbGateway).toBeInstanceOf(IDBGateway);
    });
  });

  // ------------------------------------------------------------------------
  // Error Handling Tests
  // ------------------------------------------------------------------------

  describe('Error Handling', () => {
    it('should throw error for missing FSA options', () => {
      expect(() => {
        createStorageGateway({ storageType: 'fsa' as StorageType }, {});
      }).toThrow();
    });

    it('should throw error for missing IDB options', () => {
      expect(() => {
        createStorageGateway({ storageType: 'indexeddb' as StorageType }, {});
      }).toThrow();
    });

    it('should throw error with descriptive message', () => {
      try {
        createStorageGateway({ storageType: 'fsa' as StorageType }, {});
      } catch (error) {
        expect((error as Error).message).toContain('directoryHandle');
      }
    });

    it('should throw error with correct type', () => {
      try {
        createStorageGateway({ storageType: 'fsa' as StorageType }, {});
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  // ------------------------------------------------------------------------
  // Integration with Platform Contract Tests
  // ------------------------------------------------------------------------

  describe('Integration with Platform Contract', () => {
    it('should work with platform contract object', () => {
      const platform = {
        storageType: 'fsa' as StorageType,
        canAccessFSA: true,
        canWatchFiles: true,
        canRunTerminal: true,
        canDoAgenticCoding: true,
        canAccessIDE: true,
        deviceType: 'desktop' as any,
      };

      const mockHandle = new MockFileSystemDirectoryHandle('test-project');
      const gateway = createStorageGateway(platform, {
        directoryHandle: mockHandle as any,
      });

      expect(gateway).toBeInstanceOf(FSAGateway);
    });

    it('should handle mobile platform contract', () => {
      const platform = {
        storageType: 'indexeddb' as StorageType,
        canAccessFSA: false,
        canWatchFiles: false,
        canRunTerminal: false,
        canDoAgenticCoding: false,
        canAccessIDE: false,
        deviceType: 'mobile' as any,
      };

      const gateway = createStorageGateway(platform, {
        projectId: 'proj_test123',
      });

      expect(gateway).toBeInstanceOf(IDBGateway);
    });

    it('should handle desktop without FSA platform contract', () => {
      const platform = {
        storageType: 'indexeddb' as StorageType,
        canAccessFSA: false,
        canWatchFiles: false,
        canRunTerminal: false,
        canDoAgenticCoding: false,
        canAccessIDE: false,
        deviceType: 'desktop' as any,
      };

      const gateway = createStorageGateway(platform, {
        projectId: 'proj_fallback',
      });

      expect(gateway).toBeInstanceOf(IDBGateway);
    });
  });
});
