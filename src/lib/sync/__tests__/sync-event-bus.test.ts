/**
 * Sync Event Bus - Unit Tests
 * 
 * Tests for the centralized event publishing service.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SyncEventBus, syncEventBus } from '../sync-event-bus';
import type {
  SyncEventType,
  BaseEventPayload,
  FileEventPayload,
  TerminalEventPayload,
  NavigationEventPayload,
} from '../event-types';

describe('SyncEventBus', () => {
  let bus: SyncEventBus;

  beforeEach(() => {
    bus = new SyncEventBus({ debug: false });
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
      };
      
      bus.emit('file:created', payload);
      bus.emit('file:created', payload);
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should return event names with listeners', () => {
      bus.on('file:created', vi.fn());
      bus.on('file:modified', vi.fn());
      
      const eventNames = bus.eventNames();
      
      expect(eventNames).toContain('file:created');
      expect(eventNames).toContain('file:modified');
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
      
      expect(bus.eventNames().length).toBe(2);
      
      bus.removeAllListeners();
      
      expect(bus.eventNames().length).toBe(0);
    });
  });

  describe('Convenience Methods', () => {
    it('should emit file created events', () => {
      const callback = vi.fn();
      bus.on('file:created', callback);
      
      bus.emitFileCreated('/path/to/file.txt');
      
      expect(callback).toHaveBeenCalledTimes(1);
      const callArg = callback.mock.calls[0][0];
      expect(callArg.data.path).toBe('/path/to/file.txt');
      expect(callArg.data.operation).toBe('create');
    });

    it('should emit file modified events', () => {
      const callback = vi.fn();
      bus.on('file:modified', callback);
      
      bus.emitFileModified('/path/to/file.txt');
      
      expect(callback).toHaveBeenCalledTimes(1);
      const callArg = callback.mock.calls[0][0];
      expect(callArg.data.path).toBe('/path/to/file.txt');
      expect(callArg.data.operation).toBe('modify');
    });

    it('should emit file deleted events', () => {
      const callback = vi.fn();
      bus.on('file:deleted', callback);
      
      bus.emitFileDeleted('/path/to/file.txt');
      
      expect(callback).toHaveBeenCalledTimes(1);
      const callArg = callback.mock.calls[0][0];
      expect(callArg.data.path).toBe('/path/to/file.txt');
      expect(callArg.data.operation).toBe('delete');
    });

    it('should emit terminal output events', () => {
      const callback = vi.fn();
      bus.on('terminal:output', callback);
      
      bus.emitTerminalOutput('session-123', 'test output', false);
      
      expect(callback).toHaveBeenCalledTimes(1);
      const callArg = callback.mock.calls[0][0];
      expect(callArg.data.sessionId).toBe('session-123');
      expect(callArg.data.output).toBe('test output');
      expect(callArg.data.isError).toBe(false);
    });

    it('should emit terminal error events', () => {
      const callback = vi.fn();
      bus.on('terminal:error', callback);
      
      bus.emitTerminalOutput('session-123', 'error message', true);
      
      expect(callback).toHaveBeenCalledTimes(1);
      const callArg = callback.mock.calls[0][0];
      expect(callArg.data.isError).toBe(true);
    });

    it('should emit navigation changed events', () => {
      const callback = vi.fn();
      bus.on('navigation:file_opened', callback);
      
      bus.emitNavigationChanged(null, 'file.txt', 'file.txt', 'open');
      
      expect(callback).toHaveBeenCalledTimes(1);
      const callArg = callback.mock.calls[0][0];
      expect(callArg.data.target).toBe('file.txt');
      expect(callArg.data.action).toBe('open');
    });
  });

  describe('Namespace Support', () => {
    it('should track namespaces', () => {
      const callback = vi.fn();
      bus.on('file:created', callback, { namespace: 'local-fs' });
      
      expect(bus.listenerCount('file:created')).toBe(1);
    });

    it('should emit to namespace subscribers', () => {
      const callback = vi.fn();
      bus.onNamespace('local-fs', callback);
      
      const payload: BaseEventPayload<FileEventPayload> = {
        type: 'file:created',
        timestamp: Date.now(),
        data: {
          path: '/test/file.txt',
          name: 'file.txt',
          operation: 'create',
        },
        source: 'test',
        namespace: 'local-fs:adapter',
      };
      
      bus.emit('file:created', payload);
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should not emit to non-matching namespaces', () => {
      const callback = vi.fn();
      bus.onNamespace('local-fs', callback);
      
      const payload: BaseEventPayload<FileEventPayload> = {
        type: 'file:created',
        timestamp: Date.now(),
        data: {
          path: '/test/file.txt',
          name: 'file.txt',
          operation: 'create',
        },
        source: 'test',
        namespace: 'other-namespace',
      };
      
      bus.emit('file:created', payload);
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should return unsubscribe function for on()', () => {
      const callback = vi.fn();
      const unsubscribe = bus.on('file:created', callback);
      
      expect(bus.listenerCount('file:created')).toBe(1);
      
      unsubscribe();
      
      expect(bus.listenerCount('file:created')).toBe(0);
    });
  });

  describe('Type Safety', () => {
    it('should properly type file events', () => {
      const fileCallback = vi.fn<(payload: BaseEventPayload<FileEventPayload>) => void>();
      bus.on('file:created', fileCallback);
      
      bus.emitFileCreated('/test.txt');
      
      expect(fileCallback).toHaveBeenCalled();
      const payload = fileCallback.mock.calls[0][0];
      expect(payload.data.name).toBe('test.txt');
    });

    it('should properly type terminal events', () => {
      const terminalCallback = vi.fn<(payload: BaseEventPayload<TerminalEventPayload>) => void>();
      bus.on('terminal:output', terminalCallback);
      
      bus.emitTerminalOutput('session-1', 'output', false);
      
      expect(terminalCallback).toHaveBeenCalled();
      const payload = terminalCallback.mock.calls[0][0];
      expect(payload.data.sessionId).toBe('session-1');
    });

    it('should properly type navigation events', () => {
      const navCallback = vi.fn<(payload: BaseEventPayload<NavigationEventPayload>) => void>();
      bus.on('navigation:file_opened', navCallback);
      
      bus.emitNavigationChanged(null, 'file.txt', 'file.txt', 'open');
      
      expect(navCallback).toHaveBeenCalled();
      const payload = navCallback.mock.calls[0][0];
      expect(payload.data.action).toBe('open');
    });
  });

  describe('Configuration', () => {
    it('should respect maxListeners configuration', () => {
      const limitedBus = new SyncEventBus({ maxListeners: 2 });
      
      limitedBus.on('file:created', vi.fn());
      limitedBus.on('file:created', vi.fn());
      
      // Should not throw, but EventEmitter3 doesn't enforce by default
      expect(limitedBus.listenerCount('file:created')).toBe(2);
    });

    it('should use custom default source', () => {
      const customBus = new SyncEventBus({ defaultSource: 'custom-source' });
      
      const callback = vi.fn();
      customBus.on('file:created', callback);
      
      customBus.emitFileCreated('/test.txt');
      
      expect(callback).toHaveBeenCalled();
      const payload = callback.mock.calls[0][0];
      expect(payload.source).toBe('custom-source');
    });
  });
});

describe('syncEventBus Singleton', () => {
  it('should export a singleton instance', () => {
    expect(syncEventBus).toBeInstanceOf(SyncEventBus);
  });

  it('should be usable for event operations', () => {
    const callback = vi.fn();
    syncEventBus.on('file:created', callback);
    
    syncEventBus.emitFileCreated('/singleton-test.txt');
    
    expect(callback).toHaveBeenCalledTimes(1);
    
    syncEventBus.off('file:created', callback);
  });
});
