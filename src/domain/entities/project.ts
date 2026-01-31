/**
 * @fileoverview Project Entity - Backward Compatibility Re-exports
 * @module domain/entities/project
 *
 * @deprecated Import from '@/domain/schemas' instead.
 * This file exists only for migration - will be removed.
 *
 * @mandate NO-WORKSPACE - WorkspaceBindings is ELIMINATED.
 * See .planning/architecture/NO-WORKSPACE-MANDATE.md
 */

// ============================================================================
// Re-exports from Canonical Schemas
// ============================================================================

/**
 * All Project-related types should be imported from @/domain/schemas.
 * These re-exports exist only for backward compatibility during migration.
 */
export {
  // Schemas (for runtime validation)
  ProjectSchema,
  LayoutConfigSchema,
  StorageTypeSchema,
  DeviceTypeSchema,
  ProjectCreateParamsSchema,
  ProjectUpdateParamsSchema,
  // Types (for compile-time safety)
  type Project,
  type ProjectCreateParams,
  type ProjectUpdateParams,
  type LayoutConfig,
  type StorageType,
  type DeviceType,
} from '@/domain/schemas/project.schema';

// ============================================================================
// Plugin Types (Replacement for Workspace Concepts)
// ============================================================================

/**
 * Plugin types replace the old workspace concept.
 * Use these instead of WorkspaceBindings.
 */
export {
  // Schemas
  PluginTypeSchema,
  PluginCapabilitySchema,
  ProjectPluginsSchema,
  // Types
  type PluginType,
  type PluginCapability,
  type ProjectPlugins,
  // Migration helpers
  isValidPluginType,
  mapWorkspaceToPlugin,
} from '@/domain/schemas/plugin.schema';

// ============================================================================
// DEPRECATED - Temporary Aliases for Migration
// ============================================================================

/**
 * @deprecated WorkspaceBindings is ELIMINATED.
 * Use PluginType[] or ProjectPlugins instead.
 *
 * This type alias exists ONLY for TypeScript compilation during migration.
 * All usages must be removed - grep for WorkspaceBindings and fix.
 *
 * Migration path:
 * - For boolean flags: Just remove the field
 * - For type checking: Use ProjectPlugins or PluginType[]
 * - For agent capabilities: Use PluginCapability[]
 *
 * @see .planning/architecture/NO-WORKSPACE-MANDATE.md
 */
export interface WorkspaceBindings {
  /** @deprecated Use PluginType[] with 'editor' instead */
  ide?: boolean;
  /** @deprecated Use PluginType[] with 'notes' instead */
  notes?: boolean;
  /** @deprecated Use PluginType[] with 'knowledge' instead */
  knowledge?: boolean;
  /** @deprecated Use PluginType[] with 'study' instead */
  study?: boolean;
}
