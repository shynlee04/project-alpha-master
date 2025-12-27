/**
 * @fileoverview Hook for subscribing FileTree to EventBus file events
 * @module components/ide/FileTree/hooks/useFileTreeEventSubscriptions
 * 
 * Story 28-24: FileTree Event Subscriptions
 * 
 * This hook subscribes to file system events emitted by AI agents (via FileToolsFacade)
 * and triggers a debounced refresh callback when files are created, modified, or deleted.
 * 
 * @example
 * ```tsx
 * function ExplorerPanelWithEvents() {
 *     const { eventBus } = useWorkspaceContext();
 *     const [refreshKey, setRefreshKey] = useState(0);
 *     
 *     useFileTreeEventSubscriptions(eventBus, () => setRefreshKey(k => k + 1));
 *     
 *     return <FileTree refreshKey={refreshKey} />;
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
 * Directory event payload from EventBus
 */
interface DirectoryEventPayload {
    path: string;
}

/**
 * Hook for subscribing FileTree to EventBus file events from AI agents
 * 
 * Subscribes to:
 * - file:created (agent source only)
 * - file:modified (agent source only)
 * - file:deleted (agent source only)
 * - directory:created
 * - directory:deleted
 * 
 * @param eventBus - WorkspaceEventEmitter from WorkspaceContext (may be undefined)
 * @param onRefreshNeeded - Callback to trigger FileTree refresh (debounced)
 */
export function useFileTreeEventSubscriptions(
    eventBus: WorkspaceEventEmitter | undefined,
    onRefreshNeeded: () => void
): void {
    // Ref to store timeout for debouncing
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Stable callback ref to avoid stale closures
    const onRefreshNeededRef = useRef(onRefreshNeeded);
    onRefreshNeededRef.current = onRefreshNeeded;

    // Debounced refresh trigger
    const triggerRefresh = useCallback(() => {
        // Clear existing timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Set new timeout
        debounceTimeoutRef.current = setTimeout(() => {
            onRefreshNeededRef.current();
            debounceTimeoutRef.current = null;
        }, DEBOUNCE_MS);
    }, []);

    useEffect(() => {
        // Guard against undefined eventBus
        if (!eventBus) {
            return;
        }

        /**
         * Handle file events - only trigger refresh for agent-sourced events
         */
        const handleFileEvent = (payload: FileEventPayload) => {
            if (payload.source === 'agent') {
                triggerRefresh();
            }
        };

        /**
         * Handle directory events - always trigger refresh
         */
        const handleDirectoryEvent = (_payload: DirectoryEventPayload) => {
            triggerRefresh();
        };

        // Subscribe to file events (agent source only)
        eventBus.on('file:created', handleFileEvent as any);
        eventBus.on('file:modified', handleFileEvent as any);
        eventBus.on('file:deleted', handleFileEvent as any);

        // Subscribe to directory events (all sources)
        eventBus.on('directory:created', handleDirectoryEvent as any);
        eventBus.on('directory:deleted', handleDirectoryEvent as any);

        // Cleanup function
        return () => {
            // Clear debounce timeout
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            // Unsubscribe from all events
            eventBus.off('file:created', handleFileEvent as any);
            eventBus.off('file:modified', handleFileEvent as any);
            eventBus.off('file:deleted', handleFileEvent as any);
            eventBus.off('directory:created', handleDirectoryEvent as any);
            eventBus.off('directory:deleted', handleDirectoryEvent as any);
        };
    }, [eventBus, triggerRefresh]);
}
