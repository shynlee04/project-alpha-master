/**
 * @fileoverview FSA Adapter Types
 * @module infrastructure/sync/adapters/fsa-adapter-types
 *
 * Type definitions for File System Access API adapter.
 */

// ============================================================================
// FSA Adapter Configuration
// ============================================================================

/**
 * FSA adapter configuration options
 */
export interface FSAAdapterConfig {
  /** Whether to enable debug logging */
  debug?: boolean;
  /** Whether to use experimental features */
  experimental?: boolean;
}

/**
 * Permission status for File System Access API
 */
export type PermissionStatus =
  | 'granted'   // User has granted permission
  | 'denied'    // User has denied permission
  | 'prompt'    // User needs to be prompted
  | 'unsupported'; // API not supported in this browser
