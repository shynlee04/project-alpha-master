/**
 * Reverse Sync Service Unit Tests
 * 
 * Tests for ReverseSyncService class that handles syncing files
 * from WebContainer back to local file system.
 * 
 * @see src/lib/sync/reverse-sync-service.ts
 */

import { ReverseSyncService, createReverseSyncService } from '../reverse-sync-service';
import { SyncEventBus } from '../sync-event-bus';
import type { 
  ReverseSyncOptions, 
  ReverseSyncProgress, 
  ConflictResolutionStrategy,
} from '../reverse-sync-service';
import type { FileEventPayload } from '../event-types';

// Mock SyncEventBus
const createMockSyncEventBus = () => {
  const listeners = new Map<string, Set<(...args: unknown[]) => void>>();
  
  return {
    on: vi.fn((event: string, callback: (...args: unknown[]) => void) => {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event)!.add(callback);
      return () => listeners.get(event)?.delete(callback);
    }),
    once: vi.fn((event: string, callback: (...args: unknown[]) => void) => {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event)!.add(callback);
    }),
    emit: vi.fn((event: string, payload: unknown) => {
      const eventListeners = listeners.get(event);
      if (eventListeners) {
        eventListeners.forEach(callback => callback(payload));
      }
    }),
    off: vi.fn((event: string, callback: (...args: unknown[]) => void) => {
      listeners.get(event)?.delete(callback);
    }),
    removeAllListeners: vi.fn((event?: string) => {
      if (event) {
        listeners.delete(event);
      } else {
        listeners.clear();
      }
    }),
    // Helper for tests to simulate events
    _simulateEvent: (event: string, payload: unknown) => {
      const eventListeners = listeners.get(event);
      if (eventListeners) {
        eventListeners.forEach(callback => callback(payload));
      }
    },
    _getListeners: () => listeners,
  };
};

// Mock LocalFSAdapter
const createMockLocalFSAdapter = () => ({
  readFile: vi.fn(),
  writeFile: vi.fn().mockResolvedValue(undefined),
  deleteFile: vi.fn().mockResolvedValue(undefined),
  exists: vi.fn().mockResolvedValue(true),
  fileExists: vi.fn().mockResolvedValue(true),
  mkdir: vi.fn(),
  readdir: vi.fn(),
  stat: vi.fn(),
  getDirectoryHandle: vi.fn(),
  getFileMetadata: vi.fn().mockResolvedValue({ lastModified: Date.now() }),
});

// Mock WebContainer
const createMockWebContainer = () => ({
  fs: {
    readFile: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
  },
});

describe('ReverseSyncService', () => {
  let mockSyncEventBus: ReturnType<typeof createMockSyncEventBus>;
  let mockLocalFSAdapter: ReturnType<typeof createMockLocalFSAdapter>;
  let mockWebContainer: ReturnType<typeof createMockWebContainer>;
  
  beforeEach(() => {
    vi.useFakeTimers();
    mockSyncEventBus = createMockSyncEventBus();
    mockLocalFSAdapter = createMockLocalFSAdapter();
    mockWebContainer = createMockWebContainer();
  });
  
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });
  
  describe('Constructor', () => {
    it('should create service with default options', () => {
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1]
      );
      
      expect(service).toBeInstanceOf(ReverseSyncService);
    });
    
    it('should create service with custom exclusion patterns', () => {
      const customExclusions = ['custom-folder', 'another-folder'];
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1],
        {
          exclusionPatterns: customExclusions,
        }
      );
      
      expect(service).toBeInstanceOf(ReverseSyncService);
    });
    
    it('should create service with custom debounce time', () => {
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1],
        {
          debounceMs: 500,
        }
      );
      
      expect(service).toBeInstanceOf(ReverseSyncService);
    });
    
    it('should create service with webContainer option', () => {
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1],
        {
          webContainer: mockWebContainer as unknown as ReverseSyncService['webContainer'],
        }
      );
      
      expect(service).toBeInstanceOf(ReverseSyncService);
    });
  });
  
  describe('createReverseSyncService factory', () => {
    it('should create service using factory function', () => {
      const service = createReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1]
      );
      
      expect(service).toBeInstanceOf(ReverseSyncService);
    });
    
    it('should create service with options via factory', () => {
      const options: ReverseSyncOptions = {
        exclusionPatterns: ['test-pattern'],
        conflictResolution: 'remoteWins',
        debounceMs: 100,
        onProgress: vi.fn(),
        onError: vi.fn(),
      };
      
      const service = createReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1],
        options
      );
      
      expect(service).toBeInstanceOf(ReverseSyncService);
    });
  });
  
  describe('Service Lifecycle', () => {
    it('should start listening to file events when started', () => {
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1]
      );
      
      service.start();
      
      // Verify event listeners were registered
      expect(mockSyncEventBus.on).toHaveBeenCalledWith('file:created', expect.any(Function));
      expect(mockSyncEventBus.on).toHaveBeenCalledWith('file:modified', expect.any(Function));
      expect(mockSyncEventBus.on).toHaveBeenCalledWith('file:deleted', expect.any(Function));
    });
    
    it('should not register listeners multiple times if already running', () => {
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1]
      );
      
      service.start();
      service.start();
      
      // Should only register listeners once
      expect(mockSyncEventBus.on).toHaveBeenCalledTimes(3); // 3 file event types
    });
    
    it('should stop listening to file events when stopped', () => {
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1]
      );
      
      service.start();
      service.stop();
      
      // Should not have any listeners left
      expect(mockSyncEventBus._getListeners().size).toBe(0);
    });
    
    it('should handle stop when not running', () => {
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1]
      );
      
      // Should not throw
      expect(() => service.stop()).not.toThrow();
    });
    
    it('should report active status correctly', () => {
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1]
      );
      
      expect(service.isActive()).toBe(false);
      
      service.start();
      expect(service.isActive()).toBe(true);
      
      service.stop();
      expect(service.isActive()).toBe(false);
    });
  });
  
  describe('Exclusion Patterns', () => {
    it('should exclude node_modules by default', () => {
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1]
      );
      
      expect((service as unknown as { isExcluded: (path: string) => boolean }).isExcluded('node_modules/package.json')).toBe(true);
      expect((service as unknown as { isExcluded: (path: string) => boolean }).isExcluded('node_modules/deep/nested/file.js')).toBe(true);
    });
    
    it('should exclude .git by default', () => {
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1]
      );
      
      expect((service as unknown as { isExcluded: (path: string) => boolean }).isExcluded('.git/config')).toBe(true);
      expect((service as unknown as { isExcluded: (path: string) => boolean }).isExcluded('.gitignore')).toBe(true);
    });
    
    it('should exclude .DS_Store by default', () => {
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1]
      );
      
      expect((service as unknown as { isExcluded: (path: string) => boolean }).isExcluded('.DS_Store')).toBe(true);
    });
    
    it('should exclude Thumbs.db by default', () => {
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1]
      );
      
      expect((service as unknown as { isExcluded: (path: string) => boolean }).isExcluded('Thumbs.db')).toBe(true);
    });
    
    it('should not exclude regular files', () => {
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1]
      );
      
      expect((service as unknown as { isExcluded: (path: string) => boolean }).isExcluded('src/index.ts')).toBe(false);
      expect((service as unknown as { isExcluded: (path: string) => boolean }).isExcluded('package.json')).toBe(false);
      expect((service as unknown as { isExcluded: (path: string) => boolean }).isExcluded('README.md')).toBe(false);
    });
    
    it('should support custom exclusion patterns', () => {
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1],
        {
          exclusionPatterns: ['dist/', 'build/', 'coverage/'],
        }
      );
      
      expect((service as unknown as { isExcluded: (path: string) => boolean }).isExcluded('dist/bundle.js')).toBe(true);
      expect((service as unknown as { isExcluded: (path: string) => boolean }).isExcluded('build/output.css')).toBe(true);
      expect((service as unknown as { isExcluded: (path: string) => boolean }).isExcluded('coverage/index.html')).toBe(true);
    });
    
    it('should handle glob patterns like *.swp', () => {
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1]
      );
      
      expect((service as unknown as { isExcluded: (path: string) => boolean }).isExcluded('file.swp')).toBe(true);
      expect((service as unknown as { isExcluded: (path: string) => boolean }).isExcluded('another.swo')).toBe(true);
    });
    
    it('should handle path traversal attempts', () => {
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1]
      );
      
      // Normalized path should still be excluded
      expect((service as unknown as { isExcluded: (path: string) => boolean }).isExcluded('../node_modules/evil.js')).toBe(true);
      expect((service as unknown as { isExcluded: (path: string) => boolean }).isExcluded('./node_modules/malicious.js')).toBe(true);
    });
  });
  
  describe('Conflict Resolution', () => {
    it('should default to localWins strategy', () => {
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1]
      );
      
      expect((service as unknown as { conflictResolution: ConflictResolutionStrategy }).conflictResolution).toBe('localWins');
    });
    
    it('should allow setting conflict resolution strategy', () => {
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1]
      );
      
      service.setConflictResolution('remoteWins');
      expect((service as unknown as { conflictResolution: ConflictResolutionStrategy }).conflictResolution).toBe('remoteWins');
      
      service.setConflictResolution('localWins');
      expect((service as unknown as { conflictResolution: ConflictResolutionStrategy }).conflictResolution).toBe('localWins');
      
      service.setConflictResolution('merge');
      expect((service as unknown as { conflictResolution: ConflictResolutionStrategy }).conflictResolution).toBe('merge');
    });
    
    it('should reject invalid conflict resolution strategies at type level', () => {
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1]
      );
      
      // TypeScript would catch invalid strings at compile time
      // At runtime, we only accept valid strategies
      expect(() => service.setConflictResolution('invalid' as ConflictResolutionStrategy)).toThrow();
    });
  });
  
  describe('Options Management', () => {
    it('should allow updating options at runtime', () => {
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1]
      );
      
      const newOnProgress = vi.fn();
      service.setOptions({ onProgress: newOnProgress });
      
      service.start();
      
      mockSyncEventBus._simulateEvent('file:created', {
        path: 'test.ts',
        content: new Uint8Array([1]),
        timestamp: Date.now(),
        source: 'webcontainer',
      });
      
      expect(newOnProgress).toHaveBeenCalled();
    });
    
    it('should merge options without overwriting unspecified ones', () => {
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1],
        {
          debounceMs: 100,
        }
      );
      
      service.setOptions({ debounceMs: 50 });
      
      // debounceMs should be updated
      expect((service as unknown as { debounceMs: number }).debounceMs).toBe(50);
    });
    
    it('should allow updating webContainer at runtime', () => {
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1]
      );
      
      const newWebContainer = createMockWebContainer();
      service.setOptions({ webContainer: newWebContainer as unknown as ReverseSyncService['webContainer'] });
      
      // Should not throw
      expect(service).toBeInstanceOf(ReverseSyncService);
    });
  });
  
  describe('File Event Handling', () => {
    it('should handle file:created events', () => {
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1],
        {
          webContainer: mockWebContainer as unknown as ReverseSyncService['webContainer'],
        }
      );
      
      const onProgress = vi.fn();
      service.setOptions({ onProgress });
      
      service.start();
      
      const payload: FileEventPayload = {
        path: 'new-file.ts',
        name: 'new-file.ts',
        operation: 'create',
        size: 27,
        mimeType: 'text/typescript',
        lastModified: Date.now(),
      };
      
      mockSyncEventBus._simulateEvent('file:created', payload);
      
      // Advance timers to trigger debounced operation
      vi.advanceTimersByTime(150);
      
      expect(onProgress).toHaveBeenCalled();
      expect(mockLocalFSAdapter.writeFile).toHaveBeenCalled();
    });
    
    it('should handle file:modified events', () => {
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1],
        {
          webContainer: mockWebContainer as unknown as ReverseSyncService['webContainer'],
        }
      );
      
      const onProgress = vi.fn();
      service.setOptions({ onProgress });
      
      service.start();
      
      const payload: FileEventPayload = {
        path: 'existing-file.ts',
        name: 'existing-file.ts',
        operation: 'modify',
        size: 15,
        mimeType: 'text/typescript',
        lastModified: Date.now(),
      };
      
      mockSyncEventBus._simulateEvent('file:modified', payload);
      
      vi.advanceTimersByTime(150);
      
      expect(onProgress).toHaveBeenCalled();
    });
    
    it('should handle file:deleted events', () => {
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1]
      );
      
      const onProgress = vi.fn();
      service.setOptions({ onProgress });
      
      service.start();
      
      mockSyncEventBus._simulateEvent('file:deleted', {
        path: 'deleted-file.ts',
        timestamp: Date.now(),
        source: 'webcontainer',
      });
      
      vi.advanceTimersByTime(150);
      
      expect(onProgress).toHaveBeenCalled();
      expect(mockLocalFSAdapter.deleteFile).toHaveBeenCalled();
    });
    
    it('should skip excluded files from event handling', () => {
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1],
        {
          webContainer: mockWebContainer as unknown as ReverseSyncService['webContainer'],
        }
      );
      
      const onProgress = vi.fn();
      service.setOptions({ onProgress });
      
      service.start();
      
      // Try to sync a file in node_modules
      const payload: FileEventPayload = {
        path: 'node_modules/package/index.js',
        name: 'index.js',
        operation: 'create',
        size: 3,
        mimeType: 'text/javascript',
        lastModified: Date.now(),
      };
      
      mockSyncEventBus._simulateEvent('file:created', payload);
      
      vi.advanceTimersByTime(150);
      
      // onProgress should not be called for excluded files
      expect(onProgress).not.toHaveBeenCalled();
      expect(mockLocalFSAdapter.writeFile).not.toHaveBeenCalled();
    });
  });
  
  describe('Debouncing', () => {
    it('should debounce file operations', () => {
      const onProgress = vi.fn();
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1],
        {
          debounceMs: 100,
          webContainer: mockWebContainer as unknown as ReverseSyncService['webContainer'],
          onProgress,
        }
      );
      
      service.start();
      
      // Send multiple events quickly
      mockSyncEventBus._simulateEvent('file:modified', {
        path: 'file1.ts',
        content: new Uint8Array([1]),
        timestamp: Date.now(),
        source: 'webcontainer',
      });
      
      mockSyncEventBus._simulateEvent('file:modified', {
        path: 'file2.ts',
        content: new Uint8Array([2]),
        timestamp: Date.now(),
        source: 'webcontainer',
      });
      
      // Progress should not be called immediately
      expect(onProgress).not.toHaveBeenCalled();
      
      // Advance timers past the debounce delay
      vi.advanceTimersByTime(150);
      
      // Now progress should be called
      expect(onProgress).toHaveBeenCalled();
    });
    
    it('should handle rapid events with different paths', () => {
      const onProgress = vi.fn();
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1],
        {
          debounceMs: 50,
          webContainer: mockWebContainer as unknown as ReverseSyncService['webContainer'],
          onProgress,
        }
      );
      
      service.start();
      
      // Send 5 events for different files
      for (let i = 0; i < 5; i++) {
        mockSyncEventBus._simulateEvent('file:created', {
          path: `file${i}.ts`,
          content: new Uint8Array([i]),
          timestamp: Date.now(),
          source: 'webcontainer',
        });
      }
      
      vi.advanceTimersByTime(100);
      
      // Each file should be synced (5 separate operations)
      expect(onProgress).toHaveBeenCalledTimes(5);
    });
  });
  
  describe('Progress Callback', () => {
    it('should report progress with correct structure', () => {
      const onProgress = vi.fn<(progress: ReverseSyncProgress) => void>();
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1],
        {
          debounceMs: 0, // No debounce for immediate callback
          webContainer: mockWebContainer as unknown as ReverseSyncService['webContainer'],
          onProgress,
        }
      );
      
      service.start();
      
      mockSyncEventBus._simulateEvent('file:created', {
        path: 'test.ts',
        content: new Uint8Array([1, 2, 3]),
        timestamp: Date.now(),
        source: 'webcontainer',
      });
      
      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          path: 'test.ts',
          operation: 'create',
          syncedCount: 1,
          completed: false,
          eventType: 'file:created',
        })
      );
    });
    
    it('should track synced count correctly', () => {
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1],
        {
          debounceMs: 0,
          webContainer: mockWebContainer as unknown as ReverseSyncService['webContainer'],
        }
      );
      
      service.start();
      
      expect(service.getSyncedCount()).toBe(0);
      
      mockSyncEventBus._simulateEvent('file:created', {
        path: 'file1.ts',
        content: new Uint8Array([1]),
        timestamp: Date.now(),
        source: 'webcontainer',
      });
      
      expect(service.getSyncedCount()).toBe(1);
      
      mockSyncEventBus._simulateEvent('file:created', {
        path: 'file2.ts',
        content: new Uint8Array([2]),
        timestamp: Date.now(),
        source: 'webcontainer',
      });
      
      expect(service.getSyncedCount()).toBe(2);
      
      service.resetSyncedCount();
      expect(service.getSyncedCount()).toBe(0);
    });
  });
  
  describe('Error Handling', () => {
    it('should handle write errors gracefully', () => {
      const onError = vi.fn();
      mockLocalFSAdapter.writeFile.mockRejectedValue(new Error('Permission denied'));
      
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1],
        {
          debounceMs: 0,
          webContainer: mockWebContainer as unknown as ReverseSyncService['webContainer'],
          onError,
        }
      );
      
      service.start();
      
      mockSyncEventBus._simulateEvent('file:created', {
        path: 'test.ts',
        content: new Uint8Array([1, 2, 3]),
        timestamp: Date.now(),
        source: 'webcontainer',
      });
      
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
          path: 'test.ts',
        })
      );
    });
    
    it('should handle read errors for deleted files', () => {
      const onError = vi.fn();
      mockLocalFSAdapter.deleteFile.mockRejectedValue(new Error('File not found'));
      
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1],
        {
          debounceMs: 0,
          onError,
        }
      );
      
      service.start();
      
      mockSyncEventBus._simulateEvent('file:deleted', {
        path: 'missing.ts',
        timestamp: Date.now(),
        source: 'webcontainer',
      });
      
      expect(onError).toHaveBeenCalled();
    });
    
    it('should not throw when no error callback is provided', () => {
      const service = new ReverseSyncService(
        mockSyncEventBus as unknown as SyncEventBus,
        mockLocalFSAdapter as unknown as ConstructorParameters<typeof ReverseSyncService>[1],
        {
          debounceMs: 0,
          webContainer: mockWebContainer as unknown as ReverseSyncService['webContainer'],
        }
      );
      
      mockLocalFSAdapter.writeFile.mockRejectedValue(new Error('Error'));
      
      service.start();
      
      // Should not throw
      expect(() => {
        mockSyncEventBus._simulateEvent('file:created', {
          path: 'test.ts',
          content: new Uint8Array([1]),
          timestamp: Date.now(),
          source: 'webcontainer',
        });
      }).not.toThrow();
    });
  });
});

describe('ReverseSyncService Type Definitions', () => {
  it('should accept valid ReverseSyncOptions', () => {
    const options: ReverseSyncOptions = {
      exclusionPatterns: ['dist/', 'build/'],
      conflictResolution: 'remoteWins',
      debounceMs: 200,
      onProgress: vi.fn(),
      onError: vi.fn(),
    };
    
    expect(options.conflictResolution).toBe('remoteWins');
    expect(options.debounceMs).toBe(200);
  });
  
  it('should accept all valid conflict resolution strategies', () => {
    const localWins: ConflictResolutionStrategy = 'localWins';
    const remoteWins: ConflictResolutionStrategy = 'remoteWins';
    const merge: ConflictResolutionStrategy = 'merge';
    
    expect(localWins).toBe('localWins');
    expect(remoteWins).toBe('remoteWins');
    expect(merge).toBe('merge');
  });
  
  it('should have correct progress type structure', () => {
    const progress: ReverseSyncProgress = {
      path: 'test.ts',
      operation: 'create',
      syncedCount: 1,
      completed: false,
      eventType: 'file:created',
    };
    
    expect(progress.path).toBe('test.ts');
    expect(progress.operation).toBe('create');
    expect(progress.syncedCount).toBe(1);
    expect(progress.completed).toBe(false);
    expect(progress.eventType).toBe('file:created');
  });
});
