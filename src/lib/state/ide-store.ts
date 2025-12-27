/**
 * @fileoverview Main IDE State Store
 * @module lib/state/ide-store
 * @governance EPIC-27-1, EPIC-27-1c
 * @ai-observable true
 * 
 * Unified Zustand store for all IDE state with automatic Dexie.js persistence.
 * This replaces the previous fragmented state management approach.
 * 
 * Story 27-1: State Architecture Stabilization
 * Story 27-1c: Persistence Migration with AI readiness
 * 
 * @ai-contracts
 * - selectForAIContext: Provides complete workspace context for AI agents
 * - selectFileContext: Minimal file context for AI tools
 * - getIDEStoreState: Direct state access for non-React AI tools
 * 
 * @example
 * ```tsx
 * import { useIDEStore, selectForAIContext } from '@/lib/state';
 * 
 * function Component() {
 *   // Select specific state
 *   const openFiles = useIDEStore((s) => s.openFiles);
 *   const addOpenFile = useIDEStore((s) => s.addOpenFile);
 *   
 *   // For AI agents
 *   const aiContext = useIDEStore(selectForAIContext);
 * }
 * ```
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from './dexie-storage';

// ============================================================================
// Types
// ============================================================================

export type TerminalTab = 'terminal' | 'output' | 'problems';

/**
 * IDE State shape
 */
export interface IDEState {
    // =========================================================================
    // State
    // =========================================================================

    /** Currently open file paths */
    openFiles: string[];

    /** Path of the currently active/focused file */
    activeFile: string | null;

    /** Set of expanded folder paths in FileTree */
    expandedPaths: Set<string>;

    /** Panel layout sizes by group ID */
    panelLayouts: Record<string, number[]>;

    /** Active terminal panel tab */
    terminalTab: TerminalTab;

    /** Whether chat panel is visible */
    chatVisible: boolean;

    /** Scroll position of active file in editor */
    activeFileScrollTop: number;

    /** Current project ID for scoping state */
    projectId: string | null;

    // =========================================================================
    // Actions
    // =========================================================================

    /** Set the current project ID (scopes state to this project) */
    setProjectId: (projectId: string | null) => void;

    /** Add a file to open files list */
    addOpenFile: (path: string) => void;

    /** Remove a file from open files list */
    removeOpenFile: (path: string) => void;

    /** Set the active file */
    setActiveFile: (path: string | null) => void;

    /** Toggle a folder's expanded state */
    toggleExpanded: (path: string) => void;

    /** Set multiple folders as expanded */
    setExpandedPaths: (paths: string[]) => void;

    /** Update panel layout for a group */
    setPanelLayout: (groupId: string, layout: number[]) => void;

    /** Set terminal tab */
    setTerminalTab: (tab: TerminalTab) => void;

    /** Toggle chat visibility */
    toggleChatVisible: () => void;

    /** Set chat visibility explicitly */
    setChatVisible: (visible: boolean) => void;

    /** Set scroll position */
    setActiveFileScrollTop: (scrollTop: number) => void;

    /** Reset all state (for project change) */
    reset: () => void;
}

// ============================================================================
// Default State
// ============================================================================

const defaultState = {
    openFiles: [],
    activeFile: null,
    expandedPaths: new Set<string>(),
    panelLayouts: {},
    terminalTab: 'terminal' as TerminalTab,
    chatVisible: true,
    activeFileScrollTop: 0,
    projectId: null,
};

// ============================================================================
// Store
// ============================================================================

/**
 * Create the store with a project-scoped key
 */
/**
 * Main IDE state store with persistence
 * 
 * Uses Zustand with persist middleware connected to Dexie.js (IndexedDB).
 * State is automatically saved on every change and restored on initialization.
 */
export const useIDEStore = create<IDEState>()(
    persist(
        (set, get) => ({
            // Initial state
            ...defaultState,

            // =========================================================
            // Actions
            // =========================================================

            setProjectId: (projectId) => {
                // When project changes, update the projectId in state
                // Future: Could trigger rehydration from project-specific storage
                set({ projectId });
            },

            addOpenFile: (path) => {
                const { openFiles } = get();
                if (!openFiles.includes(path)) {
                    set({
                        openFiles: [...openFiles, path],
                        activeFile: path, // Auto-activate new file
                    });
                } else {
                    // File already open, just activate it
                    set({ activeFile: path });
                }
            },

            removeOpenFile: (path) => {
                const { openFiles, activeFile } = get();
                const newOpenFiles = openFiles.filter((f) => f !== path);

                // If closing active file, activate the last file or null
                const newActiveFile = activeFile === path
                    ? newOpenFiles[newOpenFiles.length - 1] ?? null
                    : activeFile;

                set({
                    openFiles: newOpenFiles,
                    activeFile: newActiveFile,
                });
            },

            setActiveFile: (path) => {
                set({ activeFile: path });
            },

            toggleExpanded: (path) => {
                const { expandedPaths } = get();
                const next = new Set(expandedPaths);

                if (next.has(path)) {
                    next.delete(path);
                } else {
                    next.add(path);
                }

                set({ expandedPaths: next });
            },

            setExpandedPaths: (paths) => {
                set({ expandedPaths: new Set(paths) });
            },

            setPanelLayout: (groupId, layout) => {
                const { panelLayouts } = get();
                set({
                    panelLayouts: { ...panelLayouts, [groupId]: layout },
                });
            },

            setTerminalTab: (tab) => {
                set({ terminalTab: tab });
            },

            toggleChatVisible: () => {
                const { chatVisible } = get();
                set({ chatVisible: !chatVisible });
            },

            setChatVisible: (visible) => {
                set({ chatVisible: visible });
            },

            setActiveFileScrollTop: (scrollTop) => {
                set({ activeFileScrollTop: scrollTop });
            },

            reset: () => {
                set(defaultState);
            },
        }),
        {
            name: 'via-gent-ide-state', // Will be overridden per-project
            storage: createJSONStorage(() => createDexieStorage('providerConfigs')),

            // Only persist data, not functions
            partialize: (state) => ({
                openFiles: state.openFiles,
                activeFile: state.activeFile,
                // Convert Set to Array for JSON serialization
                expandedPaths: Array.from(state.expandedPaths),
                panelLayouts: state.panelLayouts,
                terminalTab: state.terminalTab,
                chatVisible: state.chatVisible,
                activeFileScrollTop: state.activeFileScrollTop,
            }),

            // Convert expandedPaths array back to Set on rehydration
            merge: (persisted, current) => {
                const persistedState = persisted as Partial<IDEState> & { expandedPaths?: string[] };
                return {
                    ...current,
                    ...persistedState,
                    // Convert array back to Set
                    expandedPaths: new Set(persistedState.expandedPaths ?? []),
                };
            },
        },
    ),
);

// ============================================================================
// Selectors (for performance optimization)
// ============================================================================

/**
 * Select only open files
 */
export const selectOpenFiles = (state: IDEState) => state.openFiles;

/**
 * Select only active file
 */
export const selectActiveFile = (state: IDEState) => state.activeFile;

/**
 * Select only expanded paths
 */
export const selectExpandedPaths = (state: IDEState) => state.expandedPaths;

/**
 * Select panel layouts
 */
export const selectPanelLayouts = (state: IDEState) => state.panelLayouts;

/**
 * Check if a path is expanded
 */
export const createIsExpandedSelector = (path: string) =>
    (state: IDEState) => state.expandedPaths.has(path);

// ============================================================================
// AI-Observable Selectors (Epic 25 Prep)
// ============================================================================

/**
 * Select complete context for AI agents
 * 
 * This selector provides all information an AI agent needs to understand
 * the current workspace state. Used by AI tools to build context.
 * 
 * @ai-observable
 * @epic Epic 25 - AI Foundation Sprint
 * @contracts Used by: file_read, file_write, execute_command tools
 */
export const selectForAIContext = (state: IDEState) => ({
    // Current working context
    projectId: state.projectId,
    activeFile: state.activeFile,
    openFiles: state.openFiles,

    // Visible structure
    expandedPaths: Array.from(state.expandedPaths),

    // UI state (for understanding user intent)
    chatVisible: state.chatVisible,
    terminalTab: state.terminalTab,
});

/**
 * Select minimal file context for AI tools
 * @ai-observable
 */
export const selectFileContext = (state: IDEState) => ({
    activeFile: state.activeFile,
    openFiles: state.openFiles,
    projectId: state.projectId,
});

/**
 * Get the store state directly (for non-React contexts like AI tools)
 * @ai-observable
 */
export const getIDEStoreState = () => useIDEStore.getState();
