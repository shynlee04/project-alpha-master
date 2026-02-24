/**
 * @fileoverview Terminal Plugin Public API
 * @module plugins/terminal
 *
 * **ARCH-02-07**: Terminal Plugin Exports
 *
 * Public API for Terminal plugin.
 * Exports plugin definition for registration in plugin-registry.
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-07
 * @team Team B
 * @created 2026-01-21
 */

// ============================================================================
// Plugin Definition
// ============================================================================

/**
 * Terminal Feature Plugin
 *
 * @remarks
 * Implements FeaturePlugin interface per ADR-034 Section 3.
 * Registered in plugin-registry at app startup.
 *
 * Exported for:
 * - Plugin registration: `registerPlugin(terminalPlugin)`
 * - Component usage: `<terminalPlugin.MainComponent />`
 *
 * @see TerminalPlugin.tsx for implementation details
 */
export { terminalPlugin } from './TerminalPlugin';

// ============================================================================
// Types
// ============================================================================

/**
 * Terminal plugin types
 *
 * @remarks
 * Types for Terminal plugin integration.
 */
export type { TerminalState } from './types';

// ============================================================================
// Hooks
// ============================================================================

/**
 * Terminal plugin hook
 *
 * @remarks
 * Hook for accessing ProjectContext in Terminal plugin.
 * Provides direct access to gateway and terminal state.
 */
export { useTerminalPlugin } from './useTerminalPlugin';
