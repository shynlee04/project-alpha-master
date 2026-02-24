/**
 * @fileoverview Plugin Coordination Types - Shared state for cross-plugin coordination
 * @module domain/types/plugin-coordination
 *
 * **EPIC-0.6-01**: Plugin Coordination Context Foundation
 *
 * Provides type definitions for plugin coordination:
 * - SharedDocument: Currently active document being edited
 * - OpenDocumentInfo: Track which plugins have which files open
 * - WriteLock: Prevent concurrent writes to same file
 * - ProcessInfo: Track running processes (Terminal → Preview)
 *
 * @epic EPIC-0.6
 * @story 0.6-01
 * @team Team A
 * @created 2026-01-27
 */

import type { PluginId } from '@/domain/types/plugin-types';

// ============================================================================
// Active Document Types
// ============================================================================

/**
 * Shared Document State
 *
 * @remarks
 * Represents the currently active document across all plugins.
 * When FileTree selects a file, this becomes the shared document.
 * Monaco, Notes, and other editors subscribe to this.
 */
export interface SharedDocument {
  /** Full path from project root */
  path: string;

  /** Current content (for sync across plugins) */
  content: string;

  /** Last modification timestamp */
  lastModified: number;

  /** List of plugins that have this document open */
  openedBy: PluginId[];

  /** Current write lock holder (null if unlocked) */
  writeLock: WriteLock | null;
}

/**
 * Open Document Info
 *
 * @remarks
 * Tracks metadata about a document opened by a specific plugin.
 * Used for tracking which plugins have which files open.
 */
export interface OpenDocumentInfo {
  /** Full path from project root */
  path: string;

  /** Plugin that opened this document */
  pluginId: PluginId;

  /** When the document was opened */
  openedAt: number;

  /** Whether there are unsaved changes */
  hasUnsavedChanges: boolean;
}

// ============================================================================
// Write Lock Types (EPIC-0.6-03)
// ============================================================================

/**
 * Write Lock
 *
 * @remarks
 * Prevents concurrent writes to the same file by multiple plugins.
 * Auto-releases after timeout to prevent stale locks.
 */
export interface WriteLock {
  /** Path of the locked file */
  path: string;

  /** Plugin holding the lock */
  holder: PluginId;

  /** When the lock was acquired */
  acquiredAt: number;

  /** Auto-release timeout in milliseconds (default 30000ms) */
  timeout: number;
}

// ============================================================================
// Process Tracking Types (Team B - EPIC-0.6-07)
// ============================================================================

/**
 * Process Info
 *
 * @remarks
 * Tracks running processes from Terminal for Preview plugin.
 * Used to detect dev-server-ready events.
 */
export interface ProcessInfo {
  /** Unique process identifier */
  id: string;

  /** Command that started this process */
  command: string;

  /** Process ID (from WebContainer) */
  pid: number;

  /** Current status */
  status: 'running' | 'stopped' | 'error';

  /** Ports this process is listening on */
  ports: number[];

  /** When process was started */
  startedAt: number;
}

/**
 * Dev Server Info
 *
 * @remarks
 * Extended process info for dev servers (npm run dev, etc.)
 */
export interface DevServerInfo extends ProcessInfo {
  /** URL where dev server is accessible */
  url: string;

  /** Framework detected (vite, next, webpack, etc.) */
  framework?: string;

  /** Whether HMR is enabled */
  hmrEnabled?: boolean;
}

// ============================================================================
// Deferred Capabilities (EPIC-0.6-09)
// ============================================================================

/**
 * Deferred Capabilities
 *
 * @remarks
 * When a plugin is OFF when an event fires, the data is queued here.
 * When the plugin turns ON, it consumes from the queue.
 */
export interface DeferredCapabilities {
  /** URLs from dev-server-ready events (for Preview) */
  previewUrls: string[];

  /** Terminal session data (for Terminal restore) */
  terminalSessions: SessionData[];
}

/**
 * Session Data
 *
 * @remarks
 * Data for restoring a terminal session when Terminal plugin mounts.
 */
export interface SessionData {
  /** Session identifier */
  id: string;

  /** Current working directory */
  cwd: string;

  /** Command history */
  history: string[];

  /** Output buffer (last N lines) */
  outputBuffer: string[];
}

// ============================================================================
// Plugin Coordination State (Main Interface)
// ============================================================================

/**
 * Plugin Coordination State
 *
 * @remarks
 * Complete state interface for the plugin coordination store.
 * This is the source of truth for cross-plugin coordination.
 */
export interface PluginCoordinationState {
  // ========================================================================
  // Active Document State
  // ========================================================================

  /** Currently active document (single source of truth) */
  activeDocument: SharedDocument | null;

  /** Map of all open documents across all plugins */
  openDocuments: Map<string, OpenDocumentInfo[]>;

  // ========================================================================
  // Process Tracking (Team B fills this)
  // ========================================================================

  /** Running processes from Terminal */
  processes: Map<string, ProcessInfo>;

  /** Dev servers detected from Terminal output */
  devServers: Map<string, DevServerInfo>;

  // ========================================================================
  // Deferred Capabilities
  // ========================================================================

  /** Queued data for plugins that are currently OFF */
  deferredCapabilities: DeferredCapabilities;
}

/**
 * Plugin Coordination Actions
 *
 * @remarks
 * Actions available on the plugin coordination store.
 */
export interface PluginCoordinationActions {
  // ========================================================================
  // Document Actions
  // ========================================================================

  /** Register a plugin as having a document open */
  openDocument: (path: string, pluginId: PluginId) => void;

  /** Unregister a plugin from a document */
  closeDocument: (path: string, pluginId: PluginId) => void;

  /** Set the active document (used by FileTree) */
  setActiveDocument: (path: string, content: string) => void;

  /** Update active document content (for sync) */
  updateActiveDocumentContent: (content: string) => void;

  /** Clear active document */
  clearActiveDocument: () => void;

  // ========================================================================
  // Write Lock Actions (EPIC-0.6-03)
  // ========================================================================

  /** Attempt to acquire write lock for a path */
  acquireWriteLock: (path: string, pluginId: PluginId) => boolean;

  /** Release write lock for a path */
  releaseWriteLock: (path: string, pluginId: PluginId) => void;

  /** Force release a stale lock */
  forceReleaseWriteLock: (path: string) => void;

  /** Check if a plugin holds the write lock */
  hasWriteLock: (path: string, pluginId: PluginId) => boolean;

  // ========================================================================
  // Deferred Capabilities Actions (EPIC-0.6-09)
  // ========================================================================

  /** Queue a preview URL for when Preview mounts */
  queuePreviewUrl: (url: string) => void;

  /** Consume the next preview URL (called by Preview on mount) */
  consumePreviewUrl: () => string | null;

  // ========================================================================
  // Query Actions
  // ========================================================================

  /** Get list of plugins that have a path open */
  getEditorsForPath: (path: string) => PluginId[];

  /** Check if a path is open in any plugin */
  isPathOpen: (path: string) => boolean;

  /** Get the write lock holder for a path */
  getWriteLockHolder: (path: string) => PluginId | null;
}

// ============================================================================
// Combined Store Type
// ============================================================================

/**
 * Plugin Coordination Store
 *
 * @remarks
 * Combined state and actions for the Zustand store.
 */
export interface PluginCoordinationStore
  extends PluginCoordinationState,
    PluginCoordinationActions {}

// ============================================================================
// Constants
// ============================================================================

/** Default write lock timeout in milliseconds (30 seconds) */
export const DEFAULT_WRITE_LOCK_TIMEOUT = 30000;

/** Maximum number of deferred preview URLs to queue */
export const MAX_DEFERRED_URLS = 10;

/** Maximum number of open documents to track */
export const MAX_OPEN_DOCUMENTS = 50;
