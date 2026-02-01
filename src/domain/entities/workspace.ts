/**
 * @fileoverview Bridge file for Workspace entity backward compatibility
 * @module domain/entities/workspace
 *
 * @deprecated Workspace entity is obsolete. Use Project from @/domain/schemas/project.schema
 * This file exists only for backward compatibility during migration.
 *
 * Migration path:
 * - Workspace → Project
 * - WorkspaceState → Use Zustand store state directly
 * - createWorkspace → Use Project creation patterns
 */

import type { Project } from '@/domain/schemas/project.schema';
import type { PluginType } from '@/domain/schemas/plugin.schema';

// ============================================================================
// Type Definitions (Deprecated)
// ============================================================================

/**
 * @deprecated Use Project from @/domain/schemas/project.schema
 * Workspaces are obsolete - files belong to Projects, not Workspaces.
 */
export type Workspace = {
  id: string;
  name: string;
  type: PluginType;
  projectId: string;
};

/**
 * @deprecated Use Zustand store state directly
 * This pattern is obsolete - use store slices for state management.
 */
export type WorkspaceState = {
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
};

// ============================================================================
// Factory Functions (Deprecated)
// ============================================================================

/**
 * @deprecated Use Project creation patterns instead
 * This function creates a pseudo-workspace from a project for backward compatibility.
 */
export function createWorkspace(project: Project, type: PluginType): Workspace {
  return {
    id: `${project.id}-${type}`,
    name: project.name,
    type,
    projectId: project.id,
  };
}

/**
 * @deprecated Use Project patterns instead
 * Creates a minimal workspace stub for legacy code compatibility.
 */
export function createWorkspaceStub(
  projectId: string,
  name: string,
  type: PluginType
): Workspace {
  return {
    id: `${projectId}-${type}`,
    name,
    type,
    projectId,
  };
}

// ============================================================================
// Re-exports for convenience during migration
// ============================================================================

export type { Project, PluginType };

/**
 * @deprecated Use PluginType from @/domain/schemas/plugin.schema
 */
export type WorkspaceType = PluginType;
