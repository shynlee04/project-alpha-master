/**
 * @fileoverview IDE State Persistence Hook (Zustand Migration)
 * @module hooks/useIdeStatePersistence
 * 
 * Story 27-1b: Component Migration to Zustand + Dexie.js
 * 
 * BEFORE: Complex ref-based persistence with direct IndexedDB access
 * AFTER: Simple wrapper around Zustand store with automatic persistence
 * 
 * The Zustand store (`useIDEStore`) handles all persistence automatically
 * via its persist middleware connected to Dexie.js.
 * 
 * This hook is maintained for backward compatibility with existing components.
 * New components should use `useIDEStore` directly.
 * 
 * @example
 * ```tsx
 * // Legacy usage (still works)
 * const { handlePanelLayoutChange } = useIdeStatePersistence({ projectId });
 * 
 * // Preferred new usage
 * import { useIDEStore } from '@/lib/state';
 * const setPanelLayout = useIDEStore(s => s.setPanelLayout);
 * ```
 */

import { useEffect, useRef, useCallback } from 'react';
import { useIDEStore, type TerminalTab } from '@/lib/state';

// ============================================================================
// Types (maintained for backward compatibility)
// ============================================================================

/**
 * IDE State interface (derived from store state)
 */
export interface IdeState {
    projectId: string;
    panelLayouts?: Record<string, number[]>;
    openFiles?: string[];
    activeFile?: string | null;
    activeFileScrollTop?: number;
    terminalTab?: TerminalTab;
    chatVisible?: boolean;
}

/**
 * Options for the useIdeStatePersistence hook.
 */
export interface UseIdeStatePersistenceOptions {
    /** Current project ID */
    projectId: string | null;
}

/**
 * Return type for the useIdeStatePersistence hook.
 * Simplified from original - refs replaced with Zustand selectors.
 */
export interface UseIdeStatePersistenceResult {
    /** Restored IDE state from storage (now derived from Zustand store) */
    restoredIdeState: IdeState | null;
    /** Reference to panel layouts (legacy compatibility) */
    panelLayoutsRef: React.MutableRefObject<Record<string, number[]>>;
    /** Reference to set of applied panel groups */
    appliedPanelGroupsRef: React.MutableRefObject<Set<string>>;
    /** Whether open files have been restored */
    didRestoreOpenFilesRef: React.MutableRefObject<boolean>;
    /** Reference to active file scroll position */
    activeFileScrollTopRef: React.MutableRefObject<number | undefined>;
    /** Reference to open file paths */
    openFilePathsRef: React.MutableRefObject<string[]>;
    /** Reference to active file path */
    activeFilePathRef: React.MutableRefObject<string | null>;
    /** Reference to terminal tab */
    terminalTabRef: React.MutableRefObject<TerminalTab>;
    /** Reference to chat visibility */
    chatVisibleRef: React.MutableRefObject<boolean>;
    /** Schedule state persistence (now no-op, Zustand auto-persists) */
    scheduleIdeStatePersistence: (delayMs?: number) => void;
    /** Handle panel layout change */
    handlePanelLayoutChange: (groupId: string, layout: number[]) => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * IDE State Persistence Hook
 * 
 * Now delegates to Zustand store for all state management.
 * The store's persist middleware handles IndexedDB via Dexie.js.
 * 
 * @param options - Hook options
 * @returns IDE state persistence utilities
 */
export function useIdeStatePersistence({
    projectId,
}: UseIdeStatePersistenceOptions): UseIdeStatePersistenceResult {
    // Get state and actions from Zustand store
    const openFiles = useIDEStore(s => s.openFiles);
    const activeFile = useIDEStore(s => s.activeFile);
    const panelLayouts = useIDEStore(s => s.panelLayouts);
    const terminalTab = useIDEStore(s => s.terminalTab);
    const chatVisible = useIDEStore(s => s.chatVisible);
    const activeFileScrollTop = useIDEStore(s => s.activeFileScrollTop);
    const setProjectId = useIDEStore(s => s.setProjectId);
    const setPanelLayout = useIDEStore(s => s.setPanelLayout);

    // Legacy refs for backward compatibility with consumers
    // These sync with Zustand state automatically
    const panelLayoutsRef = useRef<Record<string, number[]>>(panelLayouts);
    const appliedPanelGroupsRef = useRef<Set<string>>(new Set());
    const didRestoreOpenFilesRef = useRef(false);
    const activeFileScrollTopRef = useRef<number | undefined>(activeFileScrollTop);
    const openFilePathsRef = useRef<string[]>(openFiles);
    const activeFilePathRef = useRef<string | null>(activeFile);
    const terminalTabRef = useRef<TerminalTab>(terminalTab);
    const chatVisibleRef = useRef(chatVisible);

    // Keep refs in sync with store state
    useEffect(() => {
        panelLayoutsRef.current = panelLayouts;
        openFilePathsRef.current = openFiles;
        activeFilePathRef.current = activeFile;
        activeFileScrollTopRef.current = activeFileScrollTop;
        terminalTabRef.current = terminalTab;
        chatVisibleRef.current = chatVisible;
    }, [panelLayouts, openFiles, activeFile, activeFileScrollTop, terminalTab, chatVisible]);

    // Set project ID in store when it changes
    useEffect(() => {
        setProjectId(projectId);
        // Reset restoration flags on project change
        appliedPanelGroupsRef.current = new Set();
        didRestoreOpenFilesRef.current = false;

        // Mark files as restored after Zustand rehydrates
        if (projectId && openFiles.length > 0) {
            didRestoreOpenFilesRef.current = true;
        }
    }, [projectId, setProjectId, openFiles.length]);

    /**
     * Schedule state persistence (now a no-op)
     * Zustand's persist middleware handles this automatically.
     */
    const scheduleIdeStatePersistence = useCallback(
        (_delayMs = 250) => {
            // No-op: Zustand persist middleware auto-saves on every state change
            // This function is kept for backward compatibility only
        },
        [],
    );

    /**
     * Handle panel layout change.
     * Delegates to Zustand store action.
     */
    const handlePanelLayoutChange = useCallback(
        (groupId: string, layout: number[]) => {
            setPanelLayout(groupId, layout);
        },
        [setPanelLayout],
    );

    // Build restored state from Zustand (for backward compatibility)
    const restoredIdeState: IdeState | null = projectId
        ? {
            projectId,
            panelLayouts,
            openFiles,
            activeFile,
            activeFileScrollTop,
            terminalTab,
            chatVisible,
        }
        : null;

    return {
        restoredIdeState,
        panelLayoutsRef,
        appliedPanelGroupsRef,
        didRestoreOpenFilesRef,
        activeFileScrollTopRef,
        openFilePathsRef,
        activeFilePathRef,
        terminalTabRef,
        chatVisibleRef,
        scheduleIdeStatePersistence,
        handlePanelLayoutChange,
    };
}
