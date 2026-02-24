/**
 * @fileoverview Hook for subscribing Monaco Editor to EventBus file events
 * @module components/ide/MonacoEditor/hooks/useMonacoEventSubscriptions
 * 
 * Story 28-25: Monaco Event Subscriptions
 * 
 * This hook subscribes to file:modified events emitted by AI agents (via FileToolsFacade)
 * and triggers a callback when the currently active file is modified externally.
 * 
 * @example
 * ```tsx
 * function MonacoEditorWithEvents() {
 *     const { eventBus } = useWorkspaceContext();
 *     const activeFilePath = '/src/index.ts';
 *     
 *     useMonacoEventSubscriptions(eventBus, activeFilePath, (path, content) => {
 *         // Update editor model content
 *         editorRef.current?.getModel()?.setValue(content);
 *     });
 *     
 *     return <Editor />;
 * }
 * ```
 */

import { useEffect, useRef, useCallback } from 'react';
import type { WorkspaceEventEmitter } from '@/lib/events';

/** Debounce time in milliseconds for batching rapid events */
const DEBOUNCE_MS = 300;

/**
 * File event payload from EventBus
 */
interface FileEventPayload {
    path: string;
    source: 'local' | 'editor' | 'agent';
    content?: string;
    lockAcquired?: number;
    lockReleased?: number;
}

/**
 * Hook for subscribing Monaco Editor to EventBus file events from AI agents
 * 
 * Subscribes to:
 * - file:modified (agent source only, matching activeFilePath)
 * 
 * @param eventBus - WorkspaceEventEmitter from WorkspaceContext (may be undefined)
 * @param activeFilePath - Currently active file path in the editor
 * @param onExternalChange - Callback with (path, content) when agent modifies active file
 */
export function useMonacoEventSubscriptions(
    eventBus: WorkspaceEventEmitter | undefined,
    activeFilePath: string | null,
    onExternalChange: (path: string, content: string) => void
): void {
    // Ref to store timeout for debouncing
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Stable callback ref to avoid stale closures
    const onExternalChangeRef = useRef(onExternalChange);
    onExternalChangeRef.current = onExternalChange;

    // Ref for activeFilePath to avoid recreating effect
    const activeFilePathRef = useRef(activeFilePath);
    activeFilePathRef.current = activeFilePath;

    // Debounced change trigger
    const triggerChange = useCallback((path: string, content: string) => {
        // Clear existing timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Set new timeout
        debounceTimeoutRef.current = setTimeout(() => {
            onExternalChangeRef.current(path, content);
            debounceTimeoutRef.current = null;
        }, DEBOUNCE_MS);
    }, []);

    useEffect(() => {
        // Guard against undefined eventBus
        if (!eventBus) {
            return;
        }

        /**
         * Handle file:modified events
         * - Only trigger for agent-sourced events
         * - Only trigger if path matches active file
         * - Only trigger if content is provided
         */
        const handleFileModified = (payload: FileEventPayload) => {
            // Only agent-sourced events
            if (payload.source !== 'agent') {
                return;
            }

            // Only if matches active file path
            if (payload.path !== activeFilePathRef.current) {
                return;
            }

            // Only if content is provided
            if (payload.content === undefined) {
                return;
            }

            triggerChange(payload.path, payload.content);
        };

        // Subscribe to file:modified events
        eventBus.on('file:modified', handleFileModified as any);

        // Cleanup function
        return () => {
            // Clear debounce timeout
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            // Unsubscribe from event
            eventBus.off('file:modified', handleFileModified as any);
        };
    }, [eventBus, triggerChange]);
}
