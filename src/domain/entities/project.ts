/**
 * @fileoverview Project Entity - Canonical Re-exports
 * @module domain/entities/project
 *
 * This file re-exports from @/domain/schemas for import convenience.
 * The canonical schemas are the single source of truth.
 *
 * @mandate NO-WORKSPACE - All workspace terminology is BANNED.
 * See SOURCE-OF-TRUTH.md Part 6: What is BANNED
 */

// ============================================================================
// Re-exports from Canonical Schemas
// ============================================================================

/**
 * All Project-related types are defined in @/domain/schemas.
 * These re-exports provide consistent import paths.
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
// Plugin Types (Project-centric architecture)
// ============================================================================

/**
 * Plugin types define feature capabilities.
 * Platform determines available plugins based on device type.
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
  // Validation helpers
  isValidPluginType,
  mapWorkspaceToPlugin,
} from '@/domain/schemas/plugin.schema';
