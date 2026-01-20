/**
 * @fileoverview Plugin Registry Barrel Export
 * @module infrastructure/plugins
 *
 * Exports all plugin registry functions for centralized imports.
 *
 * **ARCH-02-02**: Create Plugin Registry
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-02
 * @team Team A
 * @created 2026-01-21
 */

// ============================================================================
// Re-exports from plugin-registry
// ============================================================================

export {
  registerPlugin,
  getPlugin,
  getAvailablePlugins,
  getAllPlugins,
} from './plugin-registry';

// ============================================================================
// No additional exports
// ============================================================================
