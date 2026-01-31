/**
 * @fileoverview Shared types for project store
 * @module workspace/project-store/types
 */

import type { Project } from '@/infrastructure/persistence/stores/project/project-types';
import type { FsaPermissionState } from '@/lib/filesystem/permission-lifecycle';

/**
 * Re-export Project as ProjectMetadata for backward compatibility
 */
export type ProjectMetadata = Project;

/**
 * Re-export LayoutConfig from project-types
 */
export type { LayoutConfig } from '@/infrastructure/persistence/stores/project/project-types';

// Re-export FsaPermissionState for convenience
export type { FsaPermissionState } from '@/lib/filesystem/permission-lifecycle';

/**
 * Project with permission state for dashboard display.
 */
export interface ProjectWithPermission extends ProjectMetadata {
  permissionState: FsaPermissionState;
}
