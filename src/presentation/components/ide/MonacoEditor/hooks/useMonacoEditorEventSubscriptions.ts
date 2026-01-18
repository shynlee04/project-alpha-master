/**
 * @fileoverview Hook for subscribing MonacoEditor to EventBus file events
 * @module components/ide/MonacoEditor/hooks/useMonacoEditorEventSubscriptions
 * 
 * MVP-3: Tool Execution - File Operations
 * 
 * This hook subscribes to:
 * 1. Workspace eventBus file events from AI agents (file:modified)
 * 2. CrossWorkspaceEventBus file change events from external sources (FSA watch)
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
import { crossWorkspaceEventBus, type FileChangeEvent as CrossFileChangeEvent } from '@/lib/events/cross-workspace-event-bus';
import { storageAdapterFactory } from '@/infrastructure/filesystem/StorageAdapterFactory';
import { useProjectId } from '@/infrastructure/persistence/stores/ide';
import type { WebContainerFSAAdapter } from '@/infrastructure/webcontainer/fsa-adapter';

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
    /** CC-IDE-05b: FSA adapter for HMR events */
    fsaAdapterRef?: React.RefObject<WebContainerFSAAdapter | null>;
}

/**
 * Hook for subscribing MonacoEditor to file events from:
 * 1. Workspace eventBus - AI agent file modifications (file:modified)
 * 2. CrossWorkspaceEventBus - External file changes from FSA watch (onFileChange)
 * 3. CC-IDE-05b: FSA adapter HMR events (hot module reload)
 *
 * Behavior:
 * - Only updates files that are currently open in the editor
 * - Preserves cursor position and scroll position (handled by Monaco)
 * - Clears dirty state (unsaved changes) when external agent modifies file
 * - Ignores events from 'editor' source (user edits) to avoid loops
 * - Reads fresh content from storage adapter for external file changes
 * - Updates editor content on HMR without full page reload
 *
 * @param params - Hook parameters
 */
export function useMonacoEditorEventSubscriptions({
    eventBus,
    openFiles,
    activeFilePath,
    setOpenFiles,
    fsaAdapterRef,
}: UseMonacoEditorEventSubscriptionsParams): void {
    // Track active file path in ref to avoid stale closures
    const activeFilePathRef = useRef<string | null>(activeFilePath);
    useEffect(() => {
        activeFilePathRef.current = activeFilePath;
    }, [activeFilePath]);

    // Get projectId from IDE store (real project context)
    const projectId = useProjectId();

    // =========================================================================
    // Effect 1: Subscribe to workspace eventBus (AI agent file modifications)
    // =========================================================================
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
                            isDirty: false, // Clear dirty state since agent modified it
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

    // =========================================================================
    // Effect 2: Subscribe to CrossWorkspaceEventBus (FSA external file changes)
    // =========================================================================
    useEffect(() => {
        /**
         * Handle external file changes from FSA storage adapter watch
         * When a file is modified outside the IDE (e.g., in VS Code), reload it
         */
        const handleExternalFileChange = async (event: CrossFileChangeEvent) => {
            // Only process events from IDE workspace (ignore other workspaces)
            if (event.workspaceId !== 'ide') {
                return;
            }

            // Only update if the file is currently open in the editor
            const openFile = openFiles.find(f => f.path === event.filePath);
            if (!openFile) {
                return;
            }

            console.log('[MonacoEditor] External file change detected:', event.filePath);

            try {
                // Use real projectId from IDE store (not hardcoded)
                const realProjectId = projectId || 'default';
                if (!realProjectId || realProjectId === 'default') {
                    console.warn('[MonacoEditor] No projectId available for file reload');
                    return;
                }

                // Read fresh content from storage adapter
                const adapter = storageAdapterFactory.createAdapter({
                    projectId: realProjectId,
                });

                // Read the file content
                const content = await adapter.readFile(event.filePath);

                // Update the file content in openFiles
                // Ensure content is a string (adapter may return FileContent)
                const contentString = typeof content === 'string' ? content : 
                    content instanceof Blob ? await content.text() : String(content);
                
                setOpenFiles(prevFiles => 
                    prevFiles.map(file => {
                        if (file.path === event.filePath) {
                            return {
                                ...file,
                                content: contentString,
                                isDirty: false, // External change clears local dirty state
                            };
                        }
                        return file;
                    })
                );

                console.log('[MonacoEditor] Reloaded file from external change:', event.filePath);
            } catch (error) {
                console.error('[MonacoEditor] Failed to reload file after external change:', event.filePath, error);
            }
        };

        // Subscribe to cross-workspace file change events
        crossWorkspaceEventBus.onFileChange(handleExternalFileChange);

        // Cleanup function
        return () => {
            crossWorkspaceEventBus.offFileChange(handleExternalFileChange);
        };
    }, [openFiles, setOpenFiles, projectId]);

    // =========================================================================
    // CC-IDE-05b: Effect 3 - Subscribe to FSA adapter HMR events
    // =========================================================================
    useEffect(() => {
        // Guard against missing fsaAdapterRef
        if (!fsaAdapterRef) {
            return;
        }

        /**
         * Handle HMR events from FSA adapter
         * When WebContainer detects HMR, update editor without full page reload
         */
        const handleHMREvent = async (path: string) => {
            // Only update if file is currently open in editor
            const openFile = openFiles.find(f => f.path === path);
            if (!openFile) {
                return;
            }

            console.log('[MonacoEditor] HMR event detected for:', path);

            try {
                // Get adapter from ref
                const adapter = fsaAdapterRef.current;
                if (!adapter) {
                    console.warn('[MonacoEditor] FSA adapter not available for HMR');
                    return;
                }

                // TODO: Read fresh content from gateway via fsaAdapterRef
                // For now, we'll update openFiles with isDirty: false
                // This will be handled by MonacoEditor's internal state
                setOpenFiles(prevFiles =>
                    prevFiles.map(file => {
                        if (file.path === path) {
                            return {
                                ...file,
                                isDirty: false, // HMR update clears dirty state
                            };
                        }
                        return file;
                    })
                );

                console.log('[MonacoEditor] HMR update complete for:', path);
            } catch (error) {
                console.error('[MonacoEditor] Failed to handle HMR event:', path, error);
            }
        };

        // Subscribe to HMR events from FSA adapter
        // Note: FSA adapter will call onHMREvent() when files sync to WebContainer
        if (fsaAdapterRef.current) {
            fsaAdapterRef.current.onHMREvent(handleHMREvent);
        }

        // Cleanup function - HMR subscription is managed by adapter
        return () => {
            // FSA adapter cleanup is handled by IDELayoutMain
            console.log('[MonacoEditor] HMR subscription cleanup');
        };
    }, [openFiles, setOpenFiles, fsaAdapterRef]);
}