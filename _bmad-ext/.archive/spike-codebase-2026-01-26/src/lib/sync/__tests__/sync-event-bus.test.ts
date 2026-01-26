/**
 * Sync Event Bus - Unit Tests
 * 
 * Tests for the centralized event publishing service.
 * Updated to match actual SyncEventBus API (2025-12-31)
 */

import { SyncEventBus, getSyncEventBus, resetSyncEventBus } from '../sync-event-bus';
import type {
  BaseEventPayload,
  FileEventPayload,
  TerminalEventPayload,
  NavigationEventPayload,
} from '../event-types';

describe('SyncEventBus', () => {
  let bus: SyncEventBus;

  beforeEach(() => {
    resetSyncEventBus(); // Reset singleton before each test
    bus = new SyncEventBus();
  });

  afterEach(() => {
    bus.removeAllListeners();
  });

  describe('Basic Operations', () => {
    it('should subscribe to events', () => {
      const callback = vi.fn();
      bus.on('file:created', callback);
      
      expect(bus.listenerCount('file:created')).toBe(1);
    });

    it('should unsubscribe from events', () => {
      const callback = vi.fn();
      bus.on('file:created', callback);
      bus.off('file:created', callback);
      
      expect(bus.listenerCount('file:created')).toBe(0);
    });

    it('should emit events and call subscribers', () => {
      const callback = vi.fn();
      bus.on('file:created', callback);
      
      const payload: BaseEventPayload<FileEventPayload> = {
        type: 'file:created',
        timestamp: Date.now(),
        data: {
          path: '/test/file.txt',
          name: 'file.txt',
          operation: 'create',
        },
        source: 'test',
        namespace: 'sync',
      };
      
      bus.emit('file:created', payload);
      
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({
        type: 'file:created',
        data: payload.data,
      }));
    });

    it('should support once() for single-fire listeners', () => {
      const callback = vi.fn();
      bus.once('file:created', callback);
      
      const payload: BaseEventPayload<FileEventPayload> = {
        type: 'file:created',
        timestamp: Date.now(),
        data: {
          path: '/test/file.txt',
          name: 'file.txt',
          operation: 'create',
        },
        source: 'test',
        namespace: 'sync',
      };
      
      bus.emit('file:created', payload);
      bus.emit('file:created', payload);
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should remove all listeners for a specific event', () => {
      bus.on('file:created', vi.fn());
      bus.on('file:created', vi.fn());
      
      expect(bus.listenerCount('file:created')).toBe(2);
      
      bus.removeAllListeners('file:created');
      
      expect(bus.listenerCount('file:created')).toBe(0);
    });

    it('should remove all listeners when no event specified', () => {
      bus.on('file:created', vi.fn());
      bus.on('terminal:output', vi.fn());
      
      bus.removeAllListeners();
      
      expect(bus.listenerCount()).toBe(0);
    });

    it('should return this for chaining on on()', () => {
      const callback = vi.fn();
      const result = bus.on('file:created', callback);
      
      expect(bus.listenerCount('file:created')).toBe(1);
      expect(result).toBe(bus); // on() returns this for chaining
      
      // To unsubscribe, use off() method
      bus.off('file:created', callback);
      expect(bus.listenerCount('file:created')).toBe(0);
    });
  });

  describe('EmitFileEvent Method', () => {
    it('should emit file created events using emitFileEvent', () => {
      const callback = vi.fn();
      bus.on('file:created', callback);
      
      const payload: BaseEventPayload<FileEventPayload> = {
        type: 'file:created',
        timestamp: Date.now(),
        data: {
          path: '/path/to/file.txt',
          name: 'file.txt',
          operation: 'create',
        },
        source: 'test',
        namespace: 'sync',
      };
      
      bus.emitFileEvent('file:created', payload);
      
      expect(callback).toHaveBeenCalledTimes(1);
      const callArg = callback.mock.calls[0][0];
      expect(callArg.data.path).toBe('/path/to/file.txt');
      expect(callArg.data.operation).toBe('create');
    });

    it('should emit file modified events using emitFileEvent', () => {
      const callback = vi.fn();
      bus.on('file:modified', callback);
      
      const payload: BaseEventPayload<FileEventPayload> = {
        type: 'file:modified',
        timestamp: Date.now(),
        data: {
          path: '/path/to/file.txt',
          name: 'file.txt',
          operation: 'modify',
        },
        source: 'test',
        namespace: 'sync',
      };
      
      bus.emitFileEvent('file:modified', payload);
      
      expect(callback).toHaveBeenCalledTimes(1);
      const callArg = callback.mock.calls[0][0];
      expect(callArg.data.path).toBe('/path/to/file.txt');
      expect(callArg.data.operation).toBe('modify');
    });

    it('should emit file deleted events using emitFileEvent', () => {
      const callback = vi.fn();
      bus.on('file:deleted', callback);
      
      const payload: BaseEventPayload<FileEventPayload> = {
        type: 'file:deleted',
        timestamp: Date.now(),
        data: {
          path: '/path/to/file.txt',
          name: 'file.txt',
          operation: 'delete',
        },
        source: 'test',
        namespace: 'sync',
      };
      
      bus.emitFileEvent('file:deleted', payload);
      
      expect(callback).toHaveBeenCalledTimes(1);
      const callArg = callback.mock.calls[0][0];
      expect(callArg.data.path).toBe('/path/to/file.txt');
      expect(callArg.data.operation).toBe('delete');
    });
  });

  describe('EmitTerminalEvent Method', () => {
    it('should emit terminal output events using emitTerminalEvent', () => {
      const callback = vi.fn();
      bus.on('terminal:output', callback);
      
      const payload: BaseEventPayload<TerminalEventPayload> = {
        type: 'terminal:output',
        timestamp: Date.now(),
        data: {
          sessionId: 'session-123',
          output: 'test output',
          isError: false,
        },
        source: 'test',
        namespace: 'sync',
      };
      
      bus.emitTerminalEvent('terminal:output', payload);
      
      expect(callback).toHaveBeenCalledTimes(1);
      const callArg = callback.mock.calls[0][0];
      expect(callArg.data.sessionId).toBe('session-123');
      expect(callArg.data.output).toBe('test output');
      expect(callArg.data.isError).toBe(false);
    });

    it('should emit terminal error events using emitTerminalEvent', () => {
      const callback = vi.fn();
      bus.on('terminal:error', callback);
      
      const payload: BaseEventPayload<TerminalEventPayload> = {
        type: 'terminal:error',
        timestamp: Date.now(),
        data: {
          sessionId: 'session-123',
          output: 'error message',
          isError: true,
        },
        source: 'test',
        namespace: 'sync',
      };
      
      bus.emitTerminalEvent('terminal:error', payload);
      
      expect(callback).toHaveBeenCalledTimes(1);
      const callArg = callback.mock.calls[0][0];
      expect(callArg.data.isError).toBe(true);
    });
  });

  describe('EmitNavigationEvent Method', () => {
    it('should emit navigation changed events using emitNavigationEvent', () => {
      const callback = vi.fn();
      bus.on('navigation:file_opened', callback);
      
      const payload: BaseEventPayload<NavigationEventPayload> = {
        type: 'navigation:file_opened',
        timestamp: Date.now(),
        data: {
          previousPath: undefined,
          path: 'file.txt',
          name: 'file.txt',
          action: 'open',
        },
        source: 'test',
        namespace: 'sync',
      };
      
      bus.emitNavigationEvent('navigation:file_opened', payload);
      
      expect(callback).toHaveBeenCalledTimes(1);
      const callArg = callback.mock.calls[0][0];
      // NavigationEventPayload uses 'path' not 'target'
      expect(callArg.data.path).toBe('file.txt');
      expect(callArg.data.action).toBe('open');
    });
  });

  describe('Type Safety', () => {
    it('should properly type file events', () => {
      const fileCallback = vi.fn<(payload: BaseEventPayload<FileEventPayload>) => void>();
      bus.on('file:created', fileCallback);
      
      const payload: BaseEventPayload<FileEventPayload> = {
        type: 'file:created',
        timestamp: Date.now(),
        data: {
          path: '/test.txt',
          name: 'test.txt',
          operation: 'create',
        },
        source: 'test',
        namespace: 'sync',
      };
      
      bus.emitFileEvent('file:created', payload);
      
      expect(fileCallback).toHaveBeenCalled();
      const callPayload = fileCallback.mock.calls[0][0];
      expect(callPayload.data.name).toBe('test.txt');
    });

    it('should properly type terminal events', () => {
      const terminalCallback = vi.fn<(payload: BaseEventPayload<TerminalEventPayload>) => void>();
      bus.on('terminal:output', terminalCallback);
      
      const payload: BaseEventPayload<TerminalEventPayload> = {
        type: 'terminal:output',
        timestamp: Date.now(),
        data: {
          sessionId: 'session-1',
          output: 'output',
          isError: false,
        },
        source: 'test',
        namespace: 'sync',
      };
      
      bus.emitTerminalEvent('terminal:output', payload);
      
      expect(terminalCallback).toHaveBeenCalled();
      const callPayload = terminalCallback.mock.calls[0][0];
      expect(callPayload.data.sessionId).toBe('session-1');
    });

    it('should properly type navigation events', () => {
      const navCallback = vi.fn<(payload: BaseEventPayload<NavigationEventPayload>) => void>();
      bus.on('navigation:file_opened', navCallback);
      
      const payload: BaseEventPayload<NavigationEventPayload> = {
        type: 'navigation:file_opened',
        timestamp: Date.now(),
        data: {
          previousPath: undefined,
          path: 'file.txt',
          name: 'file.txt',
          action: 'open',
        },
        source: 'test',
        namespace: 'sync',
      };
      
      bus.emitNavigationEvent('navigation:file_opened', payload);
      
      expect(navCallback).toHaveBeenCalled();
      const callPayload = navCallback.mock.calls[0][0];
      expect(callPayload.data.action).toBe('open');
    });
  });

  describe('Event Listener Methods', () => {
    it('should support onFileEvent for typed file event subscriptions', () => {
      const callback = vi.fn();
      bus.onFileEvent('file:created', callback);
      
      const payload: BaseEventPayload<FileEventPayload> = {
        type: 'file:created',
        timestamp: Date.now(),
        data: {
          path: '/test.txt',
          name: 'test.txt',
          operation: 'create',
        },
        source: 'test',
        namespace: 'sync',
      };
      
      bus.emitFileEvent('file:created', payload);
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should support onTerminalEvent for typed terminal event subscriptions', () => {
      const callback = vi.fn();
      bus.onTerminalEvent('terminal:output', callback);
      
      const payload: BaseEventPayload<TerminalEventPayload> = {
        type: 'terminal:output',
        timestamp: Date.now(),
        data: {
          sessionId: 'session-1',
          output: 'test',
          isError: false,
        },
        source: 'test',
        namespace: 'sync',
      };
      
      bus.emitTerminalEvent('terminal:output', payload);
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should support onNavigationEvent for typed navigation event subscriptions', () => {
      const callback = vi.fn();
      bus.onNavigationEvent('navigation:file_opened', callback);
      
      const payload: BaseEventPayload<NavigationEventPayload> = {
        type: 'navigation:file_opened',
        timestamp: Date.now(),
        data: {
          previousPath: undefined,
          path: 'file.txt',
          name: 'file.txt',
          action: 'open',
        },
        source: 'test',
        namespace: 'sync',
      };
      
      bus.emitNavigationEvent('navigation:file_opened', payload);
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should support onAny for wildcard subscriptions', () => {
      const callback = vi.fn();
      bus.onAny(callback);
      
      const payload: BaseEventPayload<FileEventPayload> = {
        type: 'file:created',
        timestamp: Date.now(),
        data: {
          path: '/test.txt',
          name: 'test.txt',
          operation: 'create',
        },
        source: 'test',
        namespace: 'sync',
      };
      
      bus.emitFileEvent('file:created', payload);
      
      // onAny receives (type, payload) where type is namespaced
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Custom Namespace', () => {
    it('should use custom namespace when provided', () => {
      const customBus = new SyncEventBus('custom-ns');
      const callback = vi.fn();
      customBus.on('file:created', callback);
      
      const payload: BaseEventPayload<FileEventPayload> = {
        type: 'file:created',
        timestamp: Date.now(),
        data: {
          path: '/test.txt',
          name: 'test.txt',
          operation: 'create',
        },
        source: 'test',
        namespace: 'custom-ns',
      };
      
      customBus.emitFileEvent('file:created', payload);
      
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('emitEvent Convenience Method', () => {
    it('should emit events with data using emitEvent', () => {
      const callback = vi.fn();
      bus.on('file:created', callback);
      
      const fileData = {
        path: '/test.txt',
        name: 'test.txt',
        operation: 'create' as const,
      };
      
      bus.emitEvent('file:created', fileData, 'test-source');
      
      expect(callback).toHaveBeenCalledTimes(1);
      const callArg = callback.mock.calls[0][0];
      expect(callArg.data).toEqual(fileData);
      expect(callArg.source).toBe('test-source');
    });
  });
});

describe('getSyncEventBus Singleton', () => {
  beforeEach(() => {
    resetSyncEventBus();
  });
  
  afterEach(() => {
    resetSyncEventBus();
  });

  it('should export a singleton instance via getSyncEventBus()', () => {
    const singleton1 = getSyncEventBus();
    const singleton2 = getSyncEventBus();
    
    expect(singleton1).toBeInstanceOf(SyncEventBus);
    expect(singleton1).toBe(singleton2); // Same instance
  });

  it('should be usable for event operations', () => {
    const syncBus = getSyncEventBus();
    const callback = vi.fn();
    syncBus.on('file:created', callback);
    
    const payload: BaseEventPayload<FileEventPayload> = {
      type: 'file:created',
      timestamp: Date.now(),
      data: {
        path: '/singleton-test.txt',
        name: 'singleton-test.txt',
        operation: 'create',
      },
      source: 'test',
      namespace: 'sync',
    };
    
    syncBus.emitFileEvent('file:created', payload);
    
    expect(callback).toHaveBeenCalledTimes(1);
    
    syncBus.off('file:created', callback);
  });
});
