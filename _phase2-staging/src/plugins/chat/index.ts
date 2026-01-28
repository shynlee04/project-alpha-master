/**
 * @fileoverview Chat Plugin Public API
 * @module plugins/chat
 *
 * **ARCH-02-08**: Chat Plugin Exports
 *
 * Public API for Chat plugin.
 * Exports plugin definition for registration in plugin-registry.
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-08
 * @team Team A
 * @created 2026-01-21
 */

// ============================================================================
// Plugin Definition
// ============================================================================

/**
 * Chat Feature Plugin
 *
 * @remarks
 * Implements FeaturePlugin interface per ADR-034 Section 3.
 * Registered in plugin-registry at app startup.
 *
 * Exported for:
 * - Plugin registration: `registerPlugin(chatPlugin)`
 * - Component usage: `<chatPlugin.MainComponent />`
 *
 * @see ChatPlugin.tsx for implementation details
 */
export { chatPlugin } from './ChatPlugin';

// ============================================================================
// Hooks
// ============================================================================

/**
 * Chat plugin hook
 *
 * @remarks
 * Hook for accessing ProjectContext in Chat plugin.
 * Provides direct access to gateway and tool operations.
 */
export { useChatPlugin } from './useChatPlugin';

// ============================================================================
// Types
// ============================================================================

/**
 * Chat plugin types
 *
 * @remarks
 * Types for Chat plugin integration.
 */
export type { ChatPluginContext } from './useChatPlugin';
