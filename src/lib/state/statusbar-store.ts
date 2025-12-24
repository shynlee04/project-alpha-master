/**
 * @fileoverview StatusBar State Store
 * @module lib/state/statusbar-store
 * 
 * @epic Epic-28 Story 28-18
 * @integrates Epic-10 Story 10-7 - Subscribes to sync events
 * @integrates Epic-25 Story 25-1 - Will display agent status (future)
 * @integrates Epic-26 Story 26-5 - Will show provider connection (future)
 * 
 * Zustand store for IDE StatusBar state. Manages:
 * - WebContainer boot status
 * - File sync status and progress
 * - LLM provider connection status (mock)
 * - Cursor position and file info
 * 
 * @roadmap
 * - Epic 25: Add agentStatus field for AI agent states
 * - Epic 26: Wire providerStatus to real API key validation
 * 
 * @example
 * ```tsx
 * const wcStatus = useStatusBarStore((s) => s.webContainerStatus);
 * const setWCStatus = useStatusBarStore((s) => s.setWebContainerStatus);
 * ```
 */

import { create } from 'zustand';

// ============================================================================
// Types
// ============================================================================

/**
 * WebContainer boot states
 */
export type WebContainerStatus = 'idle' | 'booting' | 'ready' | 'error';

/**
 * File sync states
 */
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

/**
 * LLM provider connection info
 */
export interface ProviderInfo {
    name: string;
    connected: boolean;
}

/**
 * Cursor position in editor
 */
export interface CursorPosition {
    line: number;
    column: number;
}

/**
 * Sync progress during active sync
 */
export interface SyncProgress {
    current: number;
    total: number;
}

/**
 * AI Agent activity states
 * @story 28-27 - Agent activity in StatusBar
 */
export type AgentActivityStatus = 'idle' | 'thinking' | 'executing' | 'error';

/**
 * StatusBar state interface
 */
export interface StatusBarState {
    // =========================================================================
    // State
    // =========================================================================

    /** WebContainer boot status */
    webContainerStatus: WebContainerStatus;

    /** File sync status */
    syncStatus: SyncStatus;

    /** Sync progress (null when not syncing) */
    syncProgress: SyncProgress | null;

    /** Last successful sync timestamp */
    lastSyncTime: Date | null;

    /** Sync error message (null when no error) */
    syncError: string | null;

    /** LLM provider connection info (mock for now) */
    providerInfo: ProviderInfo;

    /** Current cursor position */
    cursorPosition: CursorPosition;

    /** Current file type/language */
    fileType: string;

    /** File encoding (static UTF-8 for now) */
    encoding: string;

    /** AI Agent activity status (Story 28-27) */
    agentStatus: AgentActivityStatus;

    // =========================================================================
    // Actions
    // =========================================================================

    /** Update WebContainer status */
    setWebContainerStatus: (status: WebContainerStatus) => void;

    /** Update sync status */
    setSyncStatus: (status: SyncStatus) => void;

    /** Update sync progress */
    setSyncProgress: (progress: SyncProgress | null) => void;

    /** Update last sync time */
    setLastSyncTime: (time: Date | null) => void;

    /** Update sync error */
    setSyncError: (error: string | null) => void;

    /** Update provider info */
    setProviderInfo: (info: ProviderInfo) => void;

    /** Update cursor position */
    setCursorPosition: (position: CursorPosition) => void;

    /** Update file type */
    setFileType: (type: string) => void;

    /** Update agent activity status */
    setAgentStatus: (status: AgentActivityStatus) => void;

    /** Reset all status to initial state */
    reset: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
    webContainerStatus: 'idle' as WebContainerStatus,
    syncStatus: 'idle' as SyncStatus,
    syncProgress: null as SyncProgress | null,
    lastSyncTime: null as Date | null,
    syncError: null as string | null,
    providerInfo: {
        name: 'Gemini',
        connected: false,
    } as ProviderInfo,
    cursorPosition: {
        line: 1,
        column: 1,
    } as CursorPosition,
    fileType: '',
    encoding: 'UTF-8',
    agentStatus: 'idle' as AgentActivityStatus,
};

// ============================================================================
// Store
// ============================================================================

/**
 * StatusBar Zustand store
 * 
 * No persistence - StatusBar state is ephemeral and rebuilt on each session.
 */
export const useStatusBarStore = create<StatusBarState>()((set) => ({
    ...initialState,

    setWebContainerStatus: (status) => set({ webContainerStatus: status }),

    setSyncStatus: (status) => set({ syncStatus: status }),

    setSyncProgress: (progress) => set({ syncProgress: progress }),

    setLastSyncTime: (time) => set({ lastSyncTime: time }),

    setSyncError: (error) => set({ syncError: error }),

    setProviderInfo: (info) => set({ providerInfo: info }),

    setCursorPosition: (position) => set({ cursorPosition: position }),

    setFileType: (type) => set({ fileType: type }),

    setAgentStatus: (status) => set({ agentStatus: status }),

    reset: () => set(initialState),
}));

// ============================================================================
// Selectors - IMPORTANT: Select individual primitives to avoid re-render loops
// ============================================================================

// NOTE: Do NOT use object-returning selectors like:
//   const { fileType, encoding } = useStatusBarStore(selectEditorInfo); // BAD - causes infinite loops
// Instead, select individual values:
//   const fileType = useStatusBarStore((s) => s.fileType); // GOOD
//   const encoding = useStatusBarStore((s) => s.encoding); // GOOD

/**
 * Select connection statuses for status overview (external/AI use only)
 * @ai-observable - Useful for AI context, NOT for React components
 */
export const selectConnectionStatus = (state: StatusBarState) => ({
    webContainer: state.webContainerStatus,
    provider: state.providerInfo,
    sync: state.syncStatus,
});

// ============================================================================
// External Access (for non-React code)
// ============================================================================

/**
 * Get current StatusBar state (for use outside React components)
 */
export const getStatusBarState = () => useStatusBarStore.getState();

/**
 * Subscribe to StatusBar state changes (for use outside React components)
 */
export const subscribeToStatusBar = (callback: (state: StatusBarState) => void) => {
    return useStatusBarStore.subscribe(callback);
};
