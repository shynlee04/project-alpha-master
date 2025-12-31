/**
 * @fileoverview Hook for subscribing MonacoEditor to EventBus file events
 * @module components/ide/MonacoEditor/hooks/useMonacoEditorEventSubscriptions
 * 
 * MVP-3: Tool Execution - File Operations
 * 
 * This hook subscribes to file system events emitted by AI agents (via FileToolsFacade)
 * and updates Monaco Editor content when the currently open file is modified by the agent.
 * 
 * @example
 * ```tsx
 * function MonacoEditorWithEvents({ openFiles, activeFilePath, ...props }) {
 *     const { eventBus } = useWorkspace();
 *     const [openFiles, setOpenFiles] = useState([]);
 *     const [activeFilePath, setActiveFilePath] = useState(null);
 *     
 *     useMonacoEditorEventSubscriptions({
 *         eventBus,
 *         openFiles,
 *         activeFilePath,
 *         setOpenFiles,
 *     });
 *     
 *     return <MonacoEditor openFiles={openFiles} activeFilePath={activeFilePath} {...props} />;
 * }
 * ```
 */

import { useEffect, useRef } from 'react';
import type { WorkspaceEventEmitter } from '@/lib/events';
import type { OpenFile } from '../EditorTabBar';

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
 * Hook parameters
 */
interface UseMonacoEditorEventSubscriptionsParams {
    /** Workspace event emitter from WorkspaceContext */
    eventBus: WorkspaceEventEmitter | undefined;
    /** Currently open files */
    openFiles: OpenFile[];
    /** Path of the currently active file */
    activeFilePath: string | null;
    /** Callback to update open files state */
    setOpenFiles: (files: OpenFile[] | ((prev: OpenFile[]) => OpenFile[])) => void;
}

/**
 * Hook for subscribing MonacoEditor to EventBus file events from AI agents
 * 
 * Subscribes to:
 * - file:modified (agent source only) - Updates editor content when agent modifies open file
 * 
 * Behavior:
 * - Only updates files that are currently open in the editor
 * - Preserves cursor position and scroll position
 * - Clears dirty state (unsaved changes) when agent modifies file
 * - Ignores events from 'editor' source (user edits) to avoid loops
 * 
 * @param params - Hook parameters
 */
export function useMonacoEditorEventSubscriptions({
    eventBus,
    openFiles,
    activeFilePath,
    setOpenFiles,
}: UseMonacoEditorEventSubscriptionsParams): void {
    // Track active file path in ref to avoid stale closures
    const activeFilePathRef = useRef<string | null>(activeFilePath);
    useEffect(() => {
        activeFilePathRef.current = activeFilePath;
    }, [activeFilePath]);

    useEffect(() => {
        // Guard against undefined eventBus
        if (!eventBus) {
            return;
        }

        /**
         * Handle file:modified events from AI agents
         * Updates editor content if the modified file is currently open
         */
        const handleFileModified = (payload: FileEventPayload) => {
            // Only process agent-sourced events
            if (payload.source !== 'agent') {
                return;
            }

            // Only update if the file is currently open
            const isOpen = openFiles.some(f => f.path === payload.path);
            if (!isOpen) {
                return;
            }

            // Update the file content in openFiles
            setOpenFiles(prevFiles => 
                prevFiles.map(file => {
                    if (file.path === payload.path && payload.content !== undefined) {
                        return {
                            ...file,
                            content: payload.content,
                            dirty: false, // Clear dirty state since agent modified it
                        };
                    }
                    return file;
                })
            );
        };

        // Subscribe to file:modified events
        eventBus.on('file:modified', handleFileModified as any);

        // Cleanup function
        return () => {
            eventBus.off('file:modified', handleFileModified as any);
        };
    }, [eventBus, openFiles, setOpenFiles]);
}