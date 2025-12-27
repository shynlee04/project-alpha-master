/**
 * @fileoverview Unit tests for useFileTreeEventSubscriptions hook
 * @module components/ide/FileTree/hooks/__tests__/useFileTreeEventSubscriptions
 * 
 * Story 28-24: FileTree Event Subscriptions
 * Tests the hook that subscribes FileTree to EventBus file events from agents.
 * 
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFileTreeEventSubscriptions } from '../useFileTreeEventSubscriptions';
import type { WorkspaceEventEmitter } from '@/lib/events';

// Mock EventEmitter
function createMockEventBus() {
    const handlers = new Map<string, Set<Function>>();

    return {
        on: vi.fn((event: string, handler: Function) => {
            if (!handlers.has(event)) {
                handlers.set(event, new Set());
            }
            handlers.get(event)!.add(handler);
        }),
        off: vi.fn((event: string, handler: Function) => {
            handlers.get(event)?.delete(handler);
        }),
        emit: vi.fn((event: string, payload: unknown) => {
            handlers.get(event)?.forEach(handler => handler(payload));
        }),
        // For debugging
        _handlers: handlers,
    } as unknown as WorkspaceEventEmitter & { _handlers: Map<string, Set<Function>> };
}

describe('useFileTreeEventSubscriptions', () => {
    let mockEventBus: ReturnType<typeof createMockEventBus>;
    let onRefreshNeeded: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.useFakeTimers();
        mockEventBus = createMockEventBus();
        onRefreshNeeded = vi.fn();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    // =========================================================================
    // AC-28-24-5: Event Cleanup on Unmount
    // =========================================================================

    it('should subscribe to file events on mount', () => {
        const { unmount } = renderHook(() =>
            useFileTreeEventSubscriptions(mockEventBus, onRefreshNeeded)
        );

        expect(mockEventBus.on).toHaveBeenCalledWith('file:created', expect.any(Function));
        expect(mockEventBus.on).toHaveBeenCalledWith('file:deleted', expect.any(Function));
        expect(mockEventBus.on).toHaveBeenCalledWith('file:modified', expect.any(Function));
        expect(mockEventBus.on).toHaveBeenCalledWith('directory:created', expect.any(Function));
        expect(mockEventBus.on).toHaveBeenCalledWith('directory:deleted', expect.any(Function));

        unmount();
    });

    it('should unsubscribe from all events on unmount', () => {
        const { unmount } = renderHook(() =>
            useFileTreeEventSubscriptions(mockEventBus, onRefreshNeeded)
        );

        unmount();

        expect(mockEventBus.off).toHaveBeenCalledWith('file:created', expect.any(Function));
        expect(mockEventBus.off).toHaveBeenCalledWith('file:deleted', expect.any(Function));
        expect(mockEventBus.off).toHaveBeenCalledWith('file:modified', expect.any(Function));
        expect(mockEventBus.off).toHaveBeenCalledWith('directory:created', expect.any(Function));
        expect(mockEventBus.off).toHaveBeenCalledWith('directory:deleted', expect.any(Function));
    });

    // =========================================================================
    // AC-28-24-1: Subscribe to Agent File Events
    // =========================================================================

    it('should trigger refresh on file:created from agent', () => {
        renderHook(() =>
            useFileTreeEventSubscriptions(mockEventBus, onRefreshNeeded)
        );

        act(() => {
            mockEventBus.emit('file:created', { path: 'test.ts', source: 'agent' });
            vi.advanceTimersByTime(300);
        });

        expect(onRefreshNeeded).toHaveBeenCalledTimes(1);
    });

    // =========================================================================
    // AC-28-24-2: Handle File Deletion Events  
    // =========================================================================

    it('should trigger refresh on file:deleted from agent', () => {
        renderHook(() =>
            useFileTreeEventSubscriptions(mockEventBus, onRefreshNeeded)
        );

        act(() => {
            mockEventBus.emit('file:deleted', { path: 'test.ts', source: 'agent' });
            vi.advanceTimersByTime(300);
        });

        expect(onRefreshNeeded).toHaveBeenCalledTimes(1);
    });

    // =========================================================================
    // AC-28-24-3: Handle Directory Events
    // =========================================================================

    it('should trigger refresh on directory:created', () => {
        renderHook(() =>
            useFileTreeEventSubscriptions(mockEventBus, onRefreshNeeded)
        );

        act(() => {
            mockEventBus.emit('directory:created', { path: 'new-folder' });
            vi.advanceTimersByTime(300);
        });

        expect(onRefreshNeeded).toHaveBeenCalledTimes(1);
    });

    it('should trigger refresh on directory:deleted', () => {
        renderHook(() =>
            useFileTreeEventSubscriptions(mockEventBus, onRefreshNeeded)
        );

        act(() => {
            mockEventBus.emit('directory:deleted', { path: 'old-folder' });
            vi.advanceTimersByTime(300);
        });

        expect(onRefreshNeeded).toHaveBeenCalledTimes(1);
    });

    // =========================================================================
    // Filter behavior - only agent events trigger refresh
    // =========================================================================

    it('should NOT trigger refresh on file:created from editor', () => {
        renderHook(() =>
            useFileTreeEventSubscriptions(mockEventBus, onRefreshNeeded)
        );

        act(() => {
            mockEventBus.emit('file:created', { path: 'test.ts', source: 'editor' });
            vi.advanceTimersByTime(300);
        });

        expect(onRefreshNeeded).not.toHaveBeenCalled();
    });

    it('should NOT trigger refresh on file:modified from local', () => {
        renderHook(() =>
            useFileTreeEventSubscriptions(mockEventBus, onRefreshNeeded)
        );

        act(() => {
            mockEventBus.emit('file:modified', { path: 'test.ts', source: 'local' });
            vi.advanceTimersByTime(300);
        });

        expect(onRefreshNeeded).not.toHaveBeenCalled();
    });

    // =========================================================================
    // AC-28-24-4: Debounce Rapid Updates
    // =========================================================================

    it('should debounce multiple rapid events', () => {
        renderHook(() =>
            useFileTreeEventSubscriptions(mockEventBus, onRefreshNeeded)
        );

        act(() => {
            // Rapid succession of events
            mockEventBus.emit('file:created', { path: 'file1.ts', source: 'agent' });
            mockEventBus.emit('file:created', { path: 'file2.ts', source: 'agent' });
            mockEventBus.emit('file:created', { path: 'file3.ts', source: 'agent' });
            vi.advanceTimersByTime(100); // Not enough time
        });

        expect(onRefreshNeeded).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(200); // Total 300ms
        });

        // Should only call once after debounce
        expect(onRefreshNeeded).toHaveBeenCalledTimes(1);
    });

    // =========================================================================
    // Edge case: undefined eventBus
    // =========================================================================

    it('should not crash if eventBus is undefined', () => {
        expect(() => {
            renderHook(() =>
                useFileTreeEventSubscriptions(undefined, onRefreshNeeded)
            );
        }).not.toThrow();
    });
});
