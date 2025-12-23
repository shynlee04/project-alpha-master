/**
 * @fileoverview Unit tests for useMonacoEventSubscriptions hook
 * @module components/ide/MonacoEditor/hooks/__tests__/useMonacoEventSubscriptions
 * 
 * Story 28-25: Monaco Event Subscriptions
 * 
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMonacoEventSubscriptions } from '../useMonacoEventSubscriptions';
import type { WorkspaceEventEmitter } from '@/lib/events';

// Mock EventEmitter
function createMockEventBus(): WorkspaceEventEmitter {
    const listeners: Map<string, Set<Function>> = new Map();

    return {
        on: vi.fn((event: string, handler: Function) => {
            if (!listeners.has(event)) {
                listeners.set(event, new Set());
            }
            listeners.get(event)!.add(handler);
        }),
        off: vi.fn((event: string, handler: Function) => {
            listeners.get(event)?.delete(handler);
        }),
        emit: vi.fn((event: string, payload: unknown) => {
            listeners.get(event)?.forEach(handler => handler(payload));
        }),
        // Minimal EventEmitter interface
        once: vi.fn(),
        removeListener: vi.fn(),
        removeAllListeners: vi.fn(),
        listenerCount: vi.fn(() => 0),
    } as unknown as WorkspaceEventEmitter;
}

describe('useMonacoEventSubscriptions', () => {
    let mockEventBus: WorkspaceEventEmitter;

    beforeEach(() => {
        vi.useFakeTimers();
        mockEventBus = createMockEventBus();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    describe('subscription lifecycle', () => {
        it('should subscribe to file:modified on mount', () => {
            const onExternalChange = vi.fn();

            renderHook(() =>
                useMonacoEventSubscriptions(mockEventBus, '/src/test.ts', onExternalChange)
            );

            expect(mockEventBus.on).toHaveBeenCalledWith('file:modified', expect.any(Function));
        });

        it('should unsubscribe on unmount', () => {
            const onExternalChange = vi.fn();

            const { unmount } = renderHook(() =>
                useMonacoEventSubscriptions(mockEventBus, '/src/test.ts', onExternalChange)
            );

            unmount();

            expect(mockEventBus.off).toHaveBeenCalledWith('file:modified', expect.any(Function));
        });

        it('should handle undefined eventBus gracefully', () => {
            const onExternalChange = vi.fn();

            // Should not throw
            expect(() => {
                renderHook(() =>
                    useMonacoEventSubscriptions(undefined, '/src/test.ts', onExternalChange)
                );
            }).not.toThrow();
        });
    });

    describe('agent source filtering', () => {
        it('should call onExternalChange for agent-sourced events', () => {
            const onExternalChange = vi.fn();
            const activeFilePath = '/src/test.ts';

            renderHook(() =>
                useMonacoEventSubscriptions(mockEventBus, activeFilePath, onExternalChange)
            );

            act(() => {
                (mockEventBus as any).emit('file:modified', {
                    path: activeFilePath,
                    source: 'agent',
                    content: 'new content from agent',
                });
                vi.advanceTimersByTime(300);
            });

            expect(onExternalChange).toHaveBeenCalledWith(activeFilePath, 'new content from agent');
        });

        it('should NOT call onExternalChange for editor-sourced events', () => {
            const onExternalChange = vi.fn();
            const activeFilePath = '/src/test.ts';

            renderHook(() =>
                useMonacoEventSubscriptions(mockEventBus, activeFilePath, onExternalChange)
            );

            act(() => {
                (mockEventBus as any).emit('file:modified', {
                    path: activeFilePath,
                    source: 'editor',
                    content: 'user edit',
                });
                vi.advanceTimersByTime(300);
            });

            expect(onExternalChange).not.toHaveBeenCalled();
        });

        it('should NOT call onExternalChange for local-sourced events', () => {
            const onExternalChange = vi.fn();
            const activeFilePath = '/src/test.ts';

            renderHook(() =>
                useMonacoEventSubscriptions(mockEventBus, activeFilePath, onExternalChange)
            );

            act(() => {
                (mockEventBus as any).emit('file:modified', {
                    path: activeFilePath,
                    source: 'local',
                    content: 'local change',
                });
                vi.advanceTimersByTime(300);
            });

            expect(onExternalChange).not.toHaveBeenCalled();
        });
    });

    describe('activeFilePath filtering', () => {
        it('should only trigger for matching activeFilePath', () => {
            const onExternalChange = vi.fn();
            const activeFilePath = '/src/active.ts';

            renderHook(() =>
                useMonacoEventSubscriptions(mockEventBus, activeFilePath, onExternalChange)
            );

            act(() => {
                (mockEventBus as any).emit('file:modified', {
                    path: '/src/other.ts',
                    source: 'agent',
                    content: 'content for other file',
                });
                vi.advanceTimersByTime(300);
            });

            expect(onExternalChange).not.toHaveBeenCalled();
        });

        it('should handle null activeFilePath', () => {
            const onExternalChange = vi.fn();

            renderHook(() =>
                useMonacoEventSubscriptions(mockEventBus, null, onExternalChange)
            );

            act(() => {
                (mockEventBus as any).emit('file:modified', {
                    path: '/src/test.ts',
                    source: 'agent',
                    content: 'content',
                });
                vi.advanceTimersByTime(300);
            });

            expect(onExternalChange).not.toHaveBeenCalled();
        });
    });

    describe('debouncing', () => {
        it('should debounce rapid events', () => {
            const onExternalChange = vi.fn();
            const activeFilePath = '/src/test.ts';

            renderHook(() =>
                useMonacoEventSubscriptions(mockEventBus, activeFilePath, onExternalChange)
            );

            // Emit 3 rapid events
            act(() => {
                (mockEventBus as any).emit('file:modified', {
                    path: activeFilePath,
                    source: 'agent',
                    content: 'content 1',
                });
            });

            act(() => {
                vi.advanceTimersByTime(100);
                (mockEventBus as any).emit('file:modified', {
                    path: activeFilePath,
                    source: 'agent',
                    content: 'content 2',
                });
            });

            act(() => {
                vi.advanceTimersByTime(100);
                (mockEventBus as any).emit('file:modified', {
                    path: activeFilePath,
                    source: 'agent',
                    content: 'content 3',
                });
            });

            // Before debounce completes
            expect(onExternalChange).not.toHaveBeenCalled();

            // After debounce completes
            act(() => {
                vi.advanceTimersByTime(300);
            });

            // Should only have been called once with the last content
            expect(onExternalChange).toHaveBeenCalledTimes(1);
            expect(onExternalChange).toHaveBeenCalledWith(activeFilePath, 'content 3');
        });
    });

    describe('content handling', () => {
        it('should not trigger when content is undefined', () => {
            const onExternalChange = vi.fn();
            const activeFilePath = '/src/test.ts';

            renderHook(() =>
                useMonacoEventSubscriptions(mockEventBus, activeFilePath, onExternalChange)
            );

            act(() => {
                (mockEventBus as any).emit('file:modified', {
                    path: activeFilePath,
                    source: 'agent',
                    // No content field
                });
                vi.advanceTimersByTime(300);
            });

            expect(onExternalChange).not.toHaveBeenCalled();
        });
    });
});
