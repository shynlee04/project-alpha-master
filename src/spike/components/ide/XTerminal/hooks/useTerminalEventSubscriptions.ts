/**
 * @fileoverview Hook for subscribing Terminal to EventBus process events
 * @module components/ide/XTerminal/hooks/useTerminalEventSubscriptions
 * 
 * Story 28-26: Terminal Event Subscriptions
 * 
 * This hook subscribes to process events emitted by AI agents (via TerminalToolsFacade)
 * and triggers callbacks when process output is received or a process exits.
 */

import { useEffect, useRef } from 'react';
import type { WorkspaceEventEmitter } from '@/lib/events';

/**
 * Process output event payload from EventBus
 */
interface ProcessOutputPayload {
    pid: string;
    data: string;
    type: 'stdout' | 'stderr';
}

/**
 * Process exited event payload from EventBus
 */
interface ProcessExitedPayload {
    pid: string;
    exitCode: number;
}

/**
 * Hook for subscribing Terminal to EventBus process events from AI agents
 * 
 * Subscribes to:
 * - process:output (data from agent commands)
 * - process:exited (process completion)
 * 
 * @param eventBus - WorkspaceEventEmitter from WorkspaceContext (may be undefined)
 * @param onProcessOutput - Callback with (pid, data, type) when process outputs
 * @param onProcessExited - Callback with (pid, exitCode) when process exits
 */
export function useTerminalEventSubscriptions(
    eventBus: WorkspaceEventEmitter | undefined,
    onProcessOutput: (pid: string, data: string, type: 'stdout' | 'stderr') => void,
    onProcessExited: (pid: string, exitCode: number) => void
): void {
    // Stable callback refs to avoid stale closures
    const onProcessOutputRef = useRef(onProcessOutput);
    onProcessOutputRef.current = onProcessOutput;

    const onProcessExitedRef = useRef(onProcessExited);
    onProcessExitedRef.current = onProcessExited;

    useEffect(() => {
        // Guard against undefined eventBus
        if (!eventBus) {
            return;
        }

        /**
         * Handle process:output events
         */
        const handleProcessOutput = (payload: ProcessOutputPayload) => {
            onProcessOutputRef.current(payload.pid, payload.data, payload.type);
        };

        /**
         * Handle process:exited events
         */
        const handleProcessExited = (payload: ProcessExitedPayload) => {
            onProcessExitedRef.current(payload.pid, payload.exitCode);
        };

        // Subscribe to process events
        eventBus.on('process:output', handleProcessOutput as any);
        eventBus.on('process:exited', handleProcessExited as any);

        // Cleanup function
        return () => {
            eventBus.off('process:output', handleProcessOutput as any);
            eventBus.off('process:exited', handleProcessExited as any);
        };
    }, [eventBus]);
}
