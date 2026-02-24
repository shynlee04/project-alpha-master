/**
 * @fileoverview Bridge file for WorkspaceType backward compatibility
 * @module domain/value-objects/workspace-type
 *
 * @deprecated Use PluginType from @/domain/schemas/plugin.schema instead
 * This file exists only for backward compatibility during migration.
 * Will be removed once all consumers are migrated to canonical types.
 *
 * Migration path:
 * - WorkspaceType → PluginType
 * - WORKSPACE_TYPES → PluginTypeSchema.options
 * - workspaceTypeSchema → PluginTypeSchema
 */

import { PluginType, PluginTypeSchema } from '@/domain/schemas/plugin.schema';

// ============================================================================
// Type Aliases (Deprecated)
// ============================================================================

/**
 * @deprecated Use PluginType from @/domain/schemas/plugin.schema
 */
export type WorkspaceType = PluginType;

// ============================================================================
// Schema Aliases (Deprecated)
// ============================================================================

/**
 * @deprecated Use PluginTypeSchema from @/domain/schemas/plugin.schema
 */
export const workspaceTypeSchema = PluginTypeSchema;

// ============================================================================
// Constants (Deprecated)
// ============================================================================

/**
 * @deprecated Derive from PluginTypeSchema.options or use PluginType union
 */
export const WORKSPACE_TYPES = [
  'editor',
  'notes',
  'chat',
  'terminal',
  'preview',
  'knowledge',
  'study',
] as const;

// ============================================================================
// Re-exports for convenience during migration
// ============================================================================

export type { PluginType };
export { PluginTypeSchema };
