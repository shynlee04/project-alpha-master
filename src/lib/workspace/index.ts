/**
 * Workspace module exports.
 *
 * This module provides workspace management functionality including:
 * Story 3-7: Project Metadata Persistence (IndexedDB storage)
 * Story 3-8: Workspace Context (centralized state)
 */

// Story 3-7: Project Store (ARC-E01: Migrated to canonical location)
export {
    saveProject,
    getProject,
    listProjects,
    listProjectsWithPermission,
    deleteProject,
    updateProjectLastOpened,
    checkProjectPermission,
    generateProjectId,
    clearAllProjects,
    getProjectCount,
    _resetDBForTesting,
    type ProjectMetadata,
    type ProjectWithPermission,
    type LayoutConfig,
} from '@/infrastructure/persistence/stores/project';

// WorkspaceId type from core types
export type { WorkspaceId } from '@/infrastructure/persistence/dexie-db-types';

// Story 5-3: Conversation Store (MIGRATED - Story 51-12)
// The old conversation-store.ts was an adapter to infrastructure/persistence/stores/conversation
// It has been deleted. Re-export types from the new location for backwards compatibility.

export type {
    ThreadMessage,
    ConversationState,
    ConversationMetadata,
} from '@/infrastructure/persistence/stores/conversation';

// Note: Imperative functions (getConversation, saveConversation, etc.) removed
// Use Zustand store instead: import { useConversationStore } from '@/infrastructure/persistence/stores/conversation'

// Story 5-4: IDE State Store (DEPRECATED - Story 51-12)
// The old ide-state-store.ts was deleted as it was a deprecated backward compatibility layer
// Use Zustand store instead: import { useIDEStore } from '@/infrastructure/persistence/stores/ide'
// Or from infrastructure: import { useIDEStore } from '@/infrastructure/persistence/stores/ide/useIDEStore'

// Re-export TerminalTab type for backwards compatibility
export type { TerminalTab } from '@/infrastructure/persistence/stores/ide';

// Story 3-8: Workspace Context (MIGRATED - Story ARCH-01.3)
// The old WorkspaceContext.tsx has been migrated to infrastructure/persistence/stores/workspace
// Re-export from new location for backwards compatibility

export {
    UnifiedWorkspaceProvider as WorkspaceProvider,
    useWorkspace,
    useWorkspaceSync,
    useWorkspaceAgent,
    useWorkspaceSwitcher,
    useUnifiedWorkspaceContext,
} from '@/infrastructure/persistence/stores/workspace';

// Re-export types (avoiding duplicate ProjectMetadata from project-store above)
export type {
    UnifiedWorkspaceContextValue as WorkspaceContextValue,
    SyncStatus,
    SyncProgress,
    FsaPermissionState,
} from '@/infrastructure/persistence/stores/workspace';

// Story WB-6: Cross-Workspace Navigation (DEPRECATED - Migrated to unified ProjectContext)
// Old ProjectContext has been archived to _bmad-ext/.archive/ProjectContext-2026-01-25.tsx
// Use new unified context: import { useProjectContext } from '@/infrastructure/context/project-context'

// Story 27-1b: Migrated to Zustand
export {
    useFileSyncStatusStore,
    // Backward compatibility alias (deprecated)
    useFileSyncStatusStore as useSyncStatusStore,
    fileSyncStatusStore,
    fileSyncCountsStore,
    setFileSyncPending,
    setFileSyncSynced,
    setFileSyncError,
    clearFileSyncStatus,
    clearAllFileSyncStatuses,
    type FileSyncState,
    type FileSyncStatus,
    type FileSyncCounts,
} from './file-sync-status-store';

// NS-2026-01-07: Note Context Tracker for AI Awareness
export {
    getNoteExecutionContext,
    formatNoteContextForPrompt,
    hasActiveNote,
    getActiveNoteId,
    getActiveNote,
    createNoteContextError,
    type NoteExecutionContext,
    type NoteSelection,
    type NoteContextError,
} from './note-context-tracker';
