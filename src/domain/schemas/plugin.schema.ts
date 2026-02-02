/**
 * @fileoverview Plugin Capability Schema - Domain Layer
 * @module domain/schemas/plugin.schema
 *
 * Replaces workspace-centric model with plugin-based architecture.
 * Platform determines available plugins, not workspace bindings.
 *
 * @mandate NO-WORKSPACE - See .planning/architecture/NO-WORKSPACE-MANDATE.md
 * @epic EPIC-CC-01 - Project Space Foundation
 * @phase 02 - Schema Definitions
 */

import { z } from 'zod';

// ============================================================================
// Plugin Type Schema
// ============================================================================

/**
 * Available plugin types in the system.
 * These replace the old workspace types (ide, notes, knowledge, study).
 *
 * Mapping from old workspace types:
 * - 'ide' → 'editor' (Monaco editor, file tree)
 * - 'notes' → 'notes' (BlockNote-based notes)
 * - 'knowledge' → 'knowledge' (RAG/knowledge base)
 * - 'study' → 'study' (Study/flashcards)
 * - NEW: 'chat' (AI chat/threads)
 * - NEW: 'terminal' (Terminal emulator)
 * - NEW: 'preview' (Web preview)
 */
export const PluginTypeSchema = z.enum([
  'editor', // Replaces 'ide' - Monaco editor, file tree
  'notes', // BlockNote-based notes
  'chat', // AI chat/threads
  'terminal', // Terminal emulator
  'preview', // Web preview
  'knowledge', // RAG/knowledge base
  'study', // Study/flashcards
]);

// ============================================================================
// Plugin Capability Schema
// ============================================================================

/**
 * Plugin capability for agents.
 * Replaces WorkspaceBinding.
 *
 * This defines what a plugin can do and whether it's the default.
 * 
 * Note: Both pluginType and workspaceType are accepted for backward compatibility.
 * The workspaceType field is deprecated and will be removed in future versions.
 */
export const PluginCapabilitySchema = z.object({
  /** Which plugin this capability applies to */
  pluginType: PluginTypeSchema,
  /** @deprecated Use pluginType instead - legacy workspace type for backward compatibility */
  workspaceType: PluginTypeSchema.optional(),
  /** Whether this plugin is available (platform may restrict) */
  isAvailable: z.boolean(),
  /** Whether this is the default plugin for the context */
  isDefault: z.boolean().optional(),
  /** @deprecated UI variant - no longer needed */
  uiVariant: z.string().optional(),
});

// ============================================================================
// Project Plugins Schema
// ============================================================================

/**
 * Project plugin configuration.
 * Replaces workspaceBindings on Project.
 *
 * This is OPTIONAL on Project - platform determines defaults if not specified.
 * Use this only when project needs explicit plugin control.
 */
export const ProjectPluginsSchema = z.object({
  /** List of enabled plugins for this project */
  enabled: z.array(PluginTypeSchema),
  /** Default plugin to open when project is loaded */
  default: PluginTypeSchema.optional(),
});

// ============================================================================
// Derived Types
// ============================================================================

/**
 * Plugin type - the identifier for a plugin capability.
 * Use this instead of WorkspaceId.
 */
export type PluginType = z.infer<typeof PluginTypeSchema>;

/**
 * Plugin capability - what a plugin can do.
 * Use this instead of WorkspaceBinding.
 */
export type PluginCapability = z.infer<typeof PluginCapabilitySchema>;

/**
 * Project plugins configuration.
 * Use this instead of WorkspaceBindings.
 */
export type ProjectPlugins = z.infer<typeof ProjectPluginsSchema>;

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Check if a string is a valid plugin type.
 * Useful for migrating from workspace strings.
 */
export function isValidPluginType(value: unknown): value is PluginType {
  return PluginTypeSchema.safeParse(value).success;
}

/**
 * Map old workspace type to new plugin type.
 * For migration assistance only.
 *
 * @deprecated Remove after migration complete
 */
export function mapWorkspaceToPlugin(
  workspaceType: string
): PluginType | undefined {
  const mapping: Record<string, PluginType> = {
    ide: 'editor',
    notes: 'notes',
    knowledge: 'knowledge',
    study: 'study',
  };
  return mapping[workspaceType];
}
