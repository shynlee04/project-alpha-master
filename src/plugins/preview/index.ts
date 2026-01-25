/**
 * @fileoverview Preview Plugin Public API
 * @module plugins/preview
 *
 * **CC-AR-06**: Preview Plugin Exports
 *
 * Public API for Preview plugin.
 * Exports plugin definition for registration in plugin-registry.
 *
 * @epic EPIC-CC-AR02AR03
 * @story CC-AR-06
 * @team Team B
 * @created 2026-01-26
 */

// ============================================================================
// Plugin Definition
// ============================================================================

/**
 * Preview Feature Plugin
 *
 * @remarks
 * Implements FeaturePlugin interface per ADR-034 Section 3.
 * Registered in plugin-registry at app startup.
 *
 * Exported for:
 * - Plugin registration: `registerPlugin(previewPlugin)`
 * - Component usage: `<previewPlugin.MainComponent />`
 *
 * @see PreviewPlugin.tsx for implementation details
 */
export { previewPlugin } from './PreviewPlugin';
