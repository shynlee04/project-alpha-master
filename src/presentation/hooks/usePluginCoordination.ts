/**
 * @fileoverview usePluginCoordination Hook - React hook for Plugin Coordination
 * @module presentation/hooks/usePluginCoordination
 *
 * EPIC-UXUI-04-08: Plugin Coordination Integration
 * Provides integration between the layout system and PluginCoordinationContext
 *
 * @story UXUI-04-08
 * @created 2026-01-30
 */

import { useCallback, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  usePluginCoordinationStore,
  useActiveDocument,
  useActiveWriteLockHolder,
} from '@/infrastructure/persistence/stores/plugin-coordination-store';
import type { PluginId } from '@/domain/types/plugin-types';
import type { SharedDocument } from '@/domain/types/plugin-coordination.types';

// ============================================================================
// Types
// ============================================================================

/**
 * File status information
 */
export interface FileStatus {
  /** File path/ID */
  fileId: string;
  /** Whether file is open in any plugin */
  isOpen: boolean;
  /** Whether file is locked for editing */
  isLocked: boolean;
  /** Plugin ID that holds the lock, or null */
  lockedBy: PluginId | null;
  /** Plugin ID that has the file open, or null */
  openInPlugin: PluginId | null;
}

/**
 * Plugin capability information
 */
export interface PluginCapability {
  /** Whether plugin supports file editing */
  canEdit: boolean;
  /** Whether plugin supports file preview */
  canPreview: boolean;
  /** Whether plugin supports file creation */
  canCreate: boolean;
  /** Whether plugin supports file deletion */
  canDelete: boolean;
}

/**
 * Return type for usePluginCoordination hook
 */
export interface UsePluginCoordinationReturn {
  // ========================================================================
  // State
  // ========================================================================

  /** Currently active document */
  activeDocument: SharedDocument | null;
  /** Current write lock holder */
  writeLockHolder: PluginId | null;
  /** Whether current user/plugin has write lock */
  hasWriteLock: (pluginId: PluginId) => boolean;

  // ========================================================================
  // File Actions
  // ========================================================================

  /** Open a file in a plugin */
  openFile: (fileId: string, pluginId: PluginId) => boolean;
  /** Close a file in a plugin */
  closeFile: (fileId: string, pluginId: PluginId) => void;
  /** Get file status */
  getFileStatus: (fileId: string) => FileStatus;

  // ========================================================================
  // Write Lock Actions
  // ========================================================================

  /** Request write lock for a file */
  requestWriteLock: (fileId: string, pluginId: PluginId) => boolean;
  /** Release write lock for a file */
  releaseWriteLock: (fileId: string, pluginId: PluginId) => void;
  /** Force release a stale lock */
  forceReleaseWriteLock: (fileId: string) => void;

  // ========================================================================
  // Plugin Registration
  // ========================================================================

  /** Register a plugin with the coordination layer */
  registerPlugin: (pluginId: PluginId) => void;
  /** Unregister a plugin from the coordination layer */
  unregisterPlugin: (pluginId: PluginId) => void;

  // ========================================================================
  // Query Functions
  // ========================================================================

  /** Get list of plugins that have a file open */
  getEditorsForFile: (fileId: string) => PluginId[];
  /** Check if file is open in any plugin */
  isFileOpen: (fileId: string) => boolean;
  /** Get which plugin has a file open */
  getFileOpenInPlugin: (fileId: string) => PluginId | null;
}

// ============================================================================
// Plugin Capabilities Registry
// ============================================================================

/**
 * Plugin capabilities registry
 * Defines what each plugin can do
 */
const PLUGIN_CAPABILITIES: Record<PluginId, PluginCapability> = {
  filetree: {
    canEdit: false,
    canPreview: false,
    canCreate: true,
    canDelete: true,
  },
  monaco: {
    canEdit: true,
    canPreview: false,
    canCreate: true,
    canDelete: false,
  },
  notes: {
    canEdit: true,
    canPreview: false,
    canCreate: true,
    canDelete: true,
  },
  terminal: {
    canEdit: false,
    canPreview: false,
    canCreate: false,
    canDelete: false,
  },
  chat: {
    canEdit: false,
    canPreview: false,
    canCreate: false,
    canDelete: false,
  },
  agents: {
    canEdit: false,
    canPreview: false,
    canCreate: false,
    canDelete: false,
  },
  preview: {
    canEdit: false,
    canPreview: true,
    canCreate: false,
    canDelete: false,
  },
};

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * usePluginCoordination Hook
 *
 * Provides integration between the layout system and PluginCoordinationContext.
 * Manages file open/close tracking, write locks, and plugin capabilities.
 *
 * @example
 * ```tsx
 * const {
 *   activeDocument,
 *   requestWriteLock,
 *   releaseWriteLock,
 *   getFileStatus,
 * } = usePluginCoordination();
 *
 * // Request lock before editing
 * const canEdit = requestWriteLock('/path/to/file', 'monaco');
 * if (canEdit) {
 *   // Proceed with edit
 * } else {
 *   // Show lock indicator
 * }
 * ```
 */
export function usePluginCoordination(): UsePluginCoordinationReturn {
  // ========================================================================
  // State from Store
  // ========================================================================

  const activeDocument = useActiveDocument();
  const writeLockHolder = useActiveWriteLockHolder();

  // Get store actions using useShallow for performance
  const storeActions = usePluginCoordinationStore(
    useShallow((state) => ({
      openDocument: state.openDocument,
      closeDocument: state.closeDocument,
      acquireWriteLock: state.acquireWriteLock,
      releaseWriteLock: state.releaseWriteLock,
      forceReleaseWriteLock: state.forceReleaseWriteLock,
      getEditorsForPath: state.getEditorsForPath,
      isPathOpen: state.isPathOpen,
      getWriteLockHolder: state.getWriteLockHolder,
    }))
  );

  // ========================================================================
  // File Actions
  // ========================================================================

  /**
   * Open a file in a plugin
   * Returns true if successful, false if file already open in another plugin
   */
  const openFile = useCallback(
    (fileId: string, pluginId: PluginId): boolean => {
      // Check if file is already open in a different plugin
      const existingEditors = storeActions.getEditorsForPath(fileId);
      const alreadyOpenInPlugin = existingEditors.includes(pluginId);

      if (existingEditors.length > 0 && !alreadyOpenInPlugin) {
        // File is open in another plugin - warn but allow
        console.warn(
          `[PluginCoordination] File ${fileId} already open in plugin(s):`,
          existingEditors
        );
      }

      // Open the document
      storeActions.openDocument(fileId, pluginId);
      return true;
    },
    [storeActions]
  );

  /**
   * Close a file in a plugin
   */
  const closeFile = useCallback(
    (fileId: string, pluginId: PluginId): void => {
      storeActions.closeDocument(fileId, pluginId);
    },
    [storeActions]
  );

  /**
   * Get comprehensive file status
   */
  const getFileStatus = useCallback(
    (fileId: string): FileStatus => {
      const isOpen = storeActions.isPathOpen(fileId);
      const editors = storeActions.getEditorsForPath(fileId);
      const lockHolder = storeActions.getWriteLockHolder(fileId);

      return {
        fileId,
        isOpen,
        isLocked: lockHolder !== null,
        lockedBy: lockHolder,
        openInPlugin: editors.length > 0 ? editors[0] : null,
      };
    },
    [storeActions]
  );

  // ========================================================================
  // Write Lock Actions
  // ========================================================================

  /**
   * Request write lock for a file
   * Returns true if lock acquired, false if denied
   */
  const requestWriteLock = useCallback(
    (fileId: string, pluginId: PluginId): boolean => {
      // Check if plugin has edit capability
      const capabilities = PLUGIN_CAPABILITIES[pluginId];
      if (!capabilities?.canEdit) {
        console.warn(
          `[PluginCoordination] Plugin ${pluginId} does not have edit capability`
        );
        return false;
      }

      return storeActions.acquireWriteLock(fileId, pluginId);
    },
    [storeActions]
  );

  /**
   * Release write lock for a file
   */
  const releaseWriteLock = useCallback(
    (fileId: string, pluginId: PluginId): void => {
      storeActions.releaseWriteLock(fileId, pluginId);
    },
    [storeActions]
  );

  /**
   * Force release a stale lock
   */
  const forceReleaseWriteLock = useCallback(
    (fileId: string): void => {
      storeActions.forceReleaseWriteLock(fileId);
    },
    [storeActions]
  );

  /**
   * Check if a plugin has the write lock
   */
  const hasWriteLock = useCallback(
    (pluginId: PluginId): boolean => {
      if (!activeDocument) return false;
      return writeLockHolder === pluginId;
    },
    [activeDocument, writeLockHolder]
  );

  // ========================================================================
  // Plugin Registration
  // ========================================================================

  /**
   * Register a plugin with the coordination layer
   * (Currently a no-op, reserved for future use)
   */
  const registerPlugin = useCallback((pluginId: PluginId): void => {
    console.log('[PluginCoordination] Registering plugin:', pluginId);
    // Future: Track registered plugins, validate capabilities, etc.
  }, []);

  /**
   * Unregister a plugin from the coordination layer
   * Releases all locks held by this plugin
   */
  const unregisterPlugin = useCallback(
    (pluginId: PluginId): void => {
      console.log('[PluginCoordination] Unregistering plugin:', pluginId);

      // Release any locks held by this plugin
      if (activeDocument?.writeLock?.holder === pluginId) {
        storeActions.releaseWriteLock(activeDocument.path, pluginId);
      }

      // Close any documents opened by this plugin
      // Note: This would require tracking which plugin opened which document
      // For now, we rely on the plugin to close its documents before unregistering
    },
    [activeDocument, storeActions]
  );

  // ========================================================================
  // Query Functions
  // ========================================================================

  /**
   * Get list of plugins that have a file open
   */
  const getEditorsForFile = useCallback(
    (fileId: string): PluginId[] => {
      return storeActions.getEditorsForPath(fileId);
    },
    [storeActions]
  );

  /**
   * Check if file is open in any plugin
   */
  const isFileOpen = useCallback(
    (fileId: string): boolean => {
      return storeActions.isPathOpen(fileId);
    },
    [storeActions]
  );

  /**
   * Get which plugin has a file open (first one if multiple)
   */
  const getFileOpenInPlugin = useCallback(
    (fileId: string): PluginId | null => {
      const editors = storeActions.getEditorsForPath(fileId);
      return editors.length > 0 ? editors[0] : null;
    },
    [storeActions]
  );

  // ========================================================================
  // Return
  // ========================================================================

  return useMemo(
    () => ({
      // State
      activeDocument,
      writeLockHolder,
      hasWriteLock,

      // File Actions
      openFile,
      closeFile,
      getFileStatus,

      // Write Lock Actions
      requestWriteLock,
      releaseWriteLock,
      forceReleaseWriteLock,

      // Plugin Registration
      registerPlugin,
      unregisterPlugin,

      // Query Functions
      getEditorsForFile,
      isFileOpen,
      getFileOpenInPlugin,
    }),
    [
      activeDocument,
      writeLockHolder,
      hasWriteLock,
      openFile,
      closeFile,
      getFileStatus,
      requestWriteLock,
      releaseWriteLock,
      forceReleaseWriteLock,
      registerPlugin,
      unregisterPlugin,
      getEditorsForFile,
      isFileOpen,
      getFileOpenInPlugin,
    ]
  );
}

// ============================================================================
// Utility Exports
// ============================================================================

/**
 * Get plugin capabilities
 */
export function getPluginCapabilities(pluginId: PluginId): PluginCapability {
  return (
    PLUGIN_CAPABILITIES[pluginId] || {
      canEdit: false,
      canPreview: false,
      canCreate: false,
      canDelete: false,
    }
  );
}

/**
 * Check if a plugin has a specific capability
 */
export function hasPluginCapability(
  pluginId: PluginId,
  capability: keyof PluginCapability
): boolean {
  const capabilities = PLUGIN_CAPABILITIES[pluginId];
  return capabilities?.[capability] ?? false;
}

export default usePluginCoordination;
