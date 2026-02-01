/**
 * @fileoverview Bridge file for WorkspaceBinding backward compatibility
 * @module domain/value-objects/workspace-binding
 *
 * @deprecated Use PluginCapability from @/domain/schemas/plugin.schema instead
 * This file exists only for backward compatibility during migration.
 * Will be removed once all consumers are migrated to canonical types.
 *
 * Migration path:
 * - WorkspaceBinding → PluginCapability
 * - WorkspaceBindings → ProjectPlugins
 * - WorkspaceBindingArray → PluginType[]
 */

import {
  PluginCapability,
  ProjectPlugins,
  PluginType,
  PluginCapabilitySchema,
  ProjectPluginsSchema,
} from '@/domain/schemas/plugin.schema';

// ============================================================================
// Type Aliases (Deprecated)
// ============================================================================

/**
 * @deprecated Use PluginCapability from @/domain/schemas/plugin.schema
 */
export type WorkspaceBinding = PluginCapability;

/**
 * @deprecated Use ProjectPlugins from @/domain/schemas/plugin.schema
 */
export type WorkspaceBindings = ProjectPlugins;

/**
 * @deprecated Use PluginType[] instead
 */
export type WorkspaceBindingArray = PluginType[];

// ============================================================================
// Schema Aliases (Deprecated)
// ============================================================================

/**
 * @deprecated Use PluginCapabilitySchema from @/domain/schemas/plugin.schema
 */
export const workspaceBindingSchema = PluginCapabilitySchema;

/**
 * @deprecated Use ProjectPluginsSchema from @/domain/schemas/plugin.schema
 */
export const workspaceBindingsSchema = ProjectPluginsSchema;

// ============================================================================
// Re-exports for convenience during migration
// ============================================================================

export type {
  PluginCapability,
  ProjectPlugins,
  PluginType,
};

export {
  PluginCapabilitySchema,
  ProjectPluginsSchema,
};

/**
 * @deprecated Use PluginCapability instead
 * This exists only for backward compatibility - WorkspaceBindingProps was never
 * a separate type from WorkspaceBinding.
 */
export type WorkspaceBindingProps = PluginCapability;
