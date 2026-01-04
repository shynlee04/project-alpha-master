/**
 * @fileoverview Workspace Store Barrel Export
 * @module infrastructure/persistence/stores/workspace
 * @governance Epic 51 - Platform Unification
 * @story 51-4 - Workspace State Binding
 *
 * Unified workspace context provider integrating all 5 cornerstones.
 * Replaces fragmented workspace contexts across IDE, Knowledge, Notes, Study.
 *
 * @example
 * ```tsx
 * import { WorkspaceProvider, useWorkspaceContext } from '@/infrastructure/persistence/stores/workspace'
 *
 * function App() {
 *     return (
 *         <WorkspaceProvider initialWorkspace="ide">
 *             <IDEWorkspace />
 *             <KnowledgeWorkspace />
 *             <NotesWorkspace />
 *             <StudyWorkspace />
 *         </WorkspaceProvider>
 *     )
 * }
 *
 * function ChatPanel() {
 *     const { providers, agents, conversations } = useWorkspaceContext()
 *     // Access all 5 cornerstones seamlessly
 * }
 * ```
 */

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
