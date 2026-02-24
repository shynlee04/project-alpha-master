/**
 * @fileoverview Workspace Store Barrel Export
 * @module infrastructure/persistence/stores/workspace
 * @governance Epic 51 - Platform Unification
 * @story 51-4 - Workspace State Binding
 * @governance ARCH-01.3 - Workspace Context Unification
 *
 * Two providers are exported:
 * 1. WorkspaceProvider - Original 5-cornerstone provider
 * 2. UnifiedWorkspaceProvider - Complete provider with IDE file operations
 *
 * @example
 * ```tsx
 * // Use UnifiedWorkspaceProvider for full functionality
 * import { UnifiedWorkspaceProvider, useWorkspace, useWorkspaceSync } from '@/infrastructure/persistence/stores/workspace'
 *
 * function App() {
 *     return (
 *         <UnifiedWorkspaceProvider initialWorkspace="hub">
 *             <IDEWorkspace />
 *             <KnowledgeWorkspace />
 *             <NotesWorkspace />
 *         </UnifiedWorkspaceProvider>
 *     )
 * }
 *
 * function MyComponent() {
 *     const { activeWorkspace } = useWorkspace()
 *     const { syncNow, syncStatus } = useWorkspaceSync()
 *     const { activeAgent } = useWorkspaceAgent()
 * }
 * ```
 */

// ============================================================================
// Unified Workspace Provider (ARCH-01.3 - Complete Integration)
// ============================================================================

export { UnifiedWorkspaceProvider } from './unified-workspace-provider';
export type { UnifiedWorkspaceProviderProps } from './unified-workspace-provider';

export {
    useUnifiedWorkspaceContext,
    useWorkspace,
    useWorkspaceSync,
    useWorkspaceAgent,
    useWorkspaceSwitcher,
} from './unified-workspace-context';
export type {
    UnifiedWorkspaceContextValue,
    ProjectMetadata,
    SyncStatus,
    SyncProgress,
    FsaPermissionState,
} from './unified-workspace-context';

// ============================================================================
// Original WorkspaceProvider (5 Cornerstones Only)
// ============================================================================

// Provider
export { WorkspaceProvider } from './workspace-provider';
export type { WorkspaceProviderProps } from './workspace-provider';

// Context
export { WorkspaceContext } from './workspace-context';
export { useWorkspaceContext } from './workspace-context';
export type { WorkspaceContextValue } from './workspace-context';

// Workspace store - now local (migrated from lib/state)
export { useWorkspaceStore, useWorkspaceContext as useWorkspaceStoreContext, useWorkspaceMetadata } from './workspace-store';
export type { WorkspaceState, ToolAvailability } from './workspace-store';
export type { WorkspaceType, WorkspaceMetadata, WorkspaceTransitionEvent } from './workspace-types';
export { WORKSPACES } from './workspace-types';

// Workspace Provider Preferences (PRV-04)
export {
  useWorkspaceProviderStore,
  useWorkspaceProviderPreference,
  useAllWorkspaceProviderPreferences,
} from './workspace-provider-slice';
export type {
  WorkspaceProviderPreference,
  WorkspaceProviderState,
} from './workspace-provider-slice';
