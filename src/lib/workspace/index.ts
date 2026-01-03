/**
 * Workspace module exports.
 *
 * This module provides workspace management functionality including:
 * Story 3-7: Project Metadata Persistence (IndexedDB storage)
 * Story 3-8: Workspace Context (centralized state)
 */

// Story 3-7: Project Store
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
} from './project-store';

// WorkspaceId type from core types
export type { WorkspaceId } from '../state/dexie-db-core-types';

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
// Use Zustand store instead: import { useIDEStore } from '@/lib/state/ide-store'
// Or from infrastructure: import { useIDEStore } from '@/infrastructure/persistence/stores/ide/useIDEStore'

// Re-export TerminalTab type for backwards compatibility
export type { TerminalTab } from '../state/ide-store';

// Story 3-8: Workspace Context
export {
    WorkspaceProvider,
    useWorkspace,
    type WorkspaceState,
    type WorkspaceActions,
    type WorkspaceContextValue,
    type WorkspaceProviderProps,
    type SyncStatus,
} from './WorkspaceContext';

// Story WB-6: Cross-Workspace Navigation
export {
    ProjectProvider,
    useProjectContext,
    type ProjectContextValue,
    type ProjectProviderProps,
} from './ProjectContext';

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
