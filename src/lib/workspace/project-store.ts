/**
 * @fileoverview Project Store - Facade (Major Architecture Migration)
 * @module lib/workspace/project-store
 *
 * @deprecated This module has undergone a MAJOR ARCHITECTURE MIGRATION.
 *
 * **IMPORTANT ARCHITECTURAL CHANGE:**
 *
 * BEFORE (519 lines): Dexie CRUD service module with async functions
 * - Functions: saveProject(), getProject(), listProjects(), etc.
 * - Direct Dexie IndexedDB operations
 * - No state management, just CRUD utilities
 *
 * AFTER (Zustand): Zustand store with 5 slices + Dexie persistence
 * - Store: useProjectStore with slice composition
 * - State management via Zustand
 * - Dexie persistence via Zustand middleware
 * - Reactive hooks for components
 *
 * **This is NOT just a god store split - it's a complete architectural migration.**
 *
 * Migration Guide:
 *
 * OLD (Dexie service):
 * ```ts
 * import { saveProject, getProject } from '@/lib/workspace/project-store';
 * await saveProject(project);
 * const project = await getProject(id);
 * ```
 *
 * NEW (Zustand store):
 * ```ts
 * import { useProjectStore } from '@/lib/workspace/project-store/project-store-refactored';
 * const { saveProject, getProject } = useProjectStore.getState();
 * await saveProject(project);
 * const project = getProject(id);
 * ```
 *
 * **All backward-compatible functions are now facades that delegate to Zustand store.**
 *
 * @see _bmad-output/store-refactoring-summaries/project-store-refactoring-2026-01-07.md
 * @see Epic CP-1: Project Consolidation (workspace-sprints/comprehensive-remediation-sprint-2026-01-05.yaml)
 */

// ============================================================================
// Types
// ============================================================================

export type { ProjectMetadata, ProjectWithPermission, LayoutConfig } from './project-store/types';

// Re-export WorkspaceBindings for component imports
export type { WorkspaceBindings } from '@/infrastructure/persistence/dexie-db-core-types';

// ============================================================================
// Backward Compatibility Facade (Delegates to Zustand Store)
// ============================================================================

export {
  saveProject,
  getProject,
  listProjects,
  listActiveProjects,
  listProjectsWithPermission,
  deleteProject,
  updateProjectLastOpened,
  updateProjectBindings,
  updateProjectMetadata,
  checkProjectPermission,
  clearAllProjects,
  getProjectCount,
  generateProjectId,
  _resetDBForTesting,
} from './project-store/project-store-refactored';

// Export Zustand store for new code
export { useProjectStore } from './project-store/project-store-refactored';
