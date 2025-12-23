/**
 * @fileoverview Unit tests for useTerminalEventSubscriptions hook
 * @module components/ide/XTerminal/hooks/__tests__/useTerminalEventSubscriptions
 * 
 * Story 28-26: Terminal Event Subscriptions
 * 
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTerminalEventSubscriptions } from '../useTerminalEventSubscriptions';
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

describe('useTerminalEventSubscriptions', () => {
    let mockEventBus: WorkspaceEventEmitter;
    let onProcessOutput: ReturnType<typeof vi.fn>;
    let onProcessExited: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockEventBus = createMockEventBus();
        onProcessOutput = vi.fn();
        onProcessExited = vi.fn();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('subscription lifecycle', () => {
        it('should subscribe to process:output on mount', () => {
            renderHook(() =>
                useTerminalEventSubscriptions(mockEventBus, onProcessOutput, onProcessExited)
            );

            expect(mockEventBus.on).toHaveBeenCalledWith('process:output', expect.any(Function));
        });

        it('should subscribe to process:exited on mount', () => {
            renderHook(() =>
                useTerminalEventSubscriptions(mockEventBus, onProcessOutput, onProcessExited)
            );

            expect(mockEventBus.on).toHaveBeenCalledWith('process:exited', expect.any(Function));
        });

        it('should unsubscribe from all events on unmount', () => {
            const { unmount } = renderHook(() =>
                useTerminalEventSubscriptions(mockEventBus, onProcessOutput, onProcessExited)
            );

            unmount();

            expect(mockEventBus.off).toHaveBeenCalledWith('process:output', expect.any(Function));
            expect(mockEventBus.off).toHaveBeenCalledWith('process:exited', expect.any(Function));
        });

        it('should handle undefined eventBus gracefully', () => {
            expect(() => {
                renderHook(() =>
                    useTerminalEventSubscriptions(undefined, onProcessOutput, onProcessExited)
                );
            }).not.toThrow();
        });
    });

    describe('process:output events', () => {
        it('should call onProcessOutput with pid, data, and type', () => {
            renderHook(() =>
                useTerminalEventSubscriptions(mockEventBus, onProcessOutput, onProcessExited)
            );

            act(() => {
                (mockEventBus as any).emit('process:output', {
                    pid: 'pid-123',
                    data: 'Hello from agent',
                    type: 'stdout',
                });
            });

            expect(onProcessOutput).toHaveBeenCalledWith('pid-123', 'Hello from agent', 'stdout');
        });

        it('should handle stderr type', () => {
            renderHook(() =>
                useTerminalEventSubscriptions(mockEventBus, onProcessOutput, onProcessExited)
            );

            act(() => {
                (mockEventBus as any).emit('process:output', {
                    pid: 'pid-456',
                    data: 'Error message',
                    type: 'stderr',
                });
            });

            expect(onProcessOutput).toHaveBeenCalledWith('pid-456', 'Error message', 'stderr');
        });
    });

    describe('process:exited events', () => {
        it('should call onProcessExited with pid and exitCode', () => {
            renderHook(() =>
                useTerminalEventSubscriptions(mockEventBus, onProcessOutput, onProcessExited)
            );

            act(() => {
                (mockEventBus as any).emit('process:exited', {
                    pid: 'pid-789',
                    exitCode: 0,
                });
            });

            expect(onProcessExited).toHaveBeenCalledWith('pid-789', 0);
        });

        it('should handle non-zero exit codes', () => {
            renderHook(() =>
                useTerminalEventSubscriptions(mockEventBus, onProcessOutput, onProcessExited)
            );

            act(() => {
                (mockEventBus as any).emit('process:exited', {
                    pid: 'pid-error',
                    exitCode: 1,
                });
            });

            expect(onProcessExited).toHaveBeenCalledWith('pid-error', 1);
        });
    });
});
