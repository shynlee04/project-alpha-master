/**
 * @fileoverview Plugin Coordination Context - React context for cross-plugin coordination
 * @module infrastructure/context/plugin-coordination-context
 *
 * **EPIC-0.6-01**: Plugin Coordination Context Foundation
 *
 * Provides React context wrapper around the plugin coordination store.
 * This context should be placed OUTSIDE ProjectContextProvider so that
 * it's available to all plugins regardless of project.
 *
 * Usage:
 * ```tsx
 * // In root layout (outside ProjectContextProvider):
 * <PluginCoordinationProvider>
 *   <ProjectContextProvider>
 *     <PluginLayout />
 *   </ProjectContextProvider>
 * </PluginCoordinationProvider>
 *
 * // In any plugin:
 * const { activeDocument, openDocument, acquireWriteLock } = usePluginCoordination();
 * ```
 *
 * @epic EPIC-0.6
 * @story 0.6-01
 * @team Team A
 * @created 2026-01-27
 */

import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { usePluginCoordinationStore } from '@/infrastructure/persistence/stores/plugin-coordination-store';
import type { PluginId } from '@/domain/types/plugin-types';
import type { SharedDocument } from '@/domain/types/plugin-coordination.types';

// ============================================================================
// Context Interface
// ============================================================================

/**
 * Plugin Coordination Context Value
 *
 * @remarks
 * Simplified interface exposed to components.
 * Wraps the Zustand store with React-friendly patterns.
 */
export interface PluginCoordinationContextValue {
  // ========================================================================
  // Active Document State
  // ========================================================================

  /** Currently active document (null if none selected) */
  activeDocument: SharedDocument | null;

  // ========================================================================
  // Document Actions
  // ========================================================================

  /** Register this plugin as having a document open */
  openDocument: (path: string, pluginId: PluginId) => void;

  /** Unregister this plugin from a document */
  closeDocument: (path: string, pluginId: PluginId) => void;

  /** Set the active document (typically called by FileTree) */
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
  // Deferred Capabilities (EPIC-0.6-09)
  // ========================================================================

  /** Queue a preview URL for when Preview mounts */
  queuePreviewUrl: (url: string) => void;

  /** Consume the next preview URL (called by Preview on mount) */
  consumePreviewUrl: () => string | null;

  // ========================================================================
  // Query Functions
  // ========================================================================

  /** Get list of plugins that have a path open */
  getEditorsForPath: (path: string) => PluginId[];

  /** Check if a path is open in any plugin */
  isPathOpen: (path: string) => boolean;

  /** Get the write lock holder for a path */
  getWriteLockHolder: (path: string) => PluginId | null;
}

// ============================================================================
// Context Creation
// ============================================================================

/**
 * Plugin Coordination Context
 *
 * @remarks
 * React context with null initial value.
 * Must be used within PluginCoordinationProvider.
 */
const PluginCoordinationContext = createContext<PluginCoordinationContextValue | null>(null);

// ============================================================================
// Provider Component
// ============================================================================

/**
 * Plugin Coordination Provider
 *
 * @param children - Child components
 *
 * @remarks
 * Wraps children with plugin coordination context.
 * Should be placed outside ProjectContextProvider.
 *
 * @example
 * ```tsx
 * // In $projectId.tsx:
 * <PluginCoordinationProvider>
 *   <ProjectContextProvider projectId={projectId}>
 *     <PluginLayout />
 *   </ProjectContextProvider>
 * </PluginCoordinationProvider>
 * ```
 */
export function PluginCoordinationProvider({ children }: { children: ReactNode }) {
  // Use useShallow to prevent unnecessary re-renders
  const storeValue = usePluginCoordinationStore(
    useShallow((state) => ({
      activeDocument: state.activeDocument,
      openDocument: state.openDocument,
      closeDocument: state.closeDocument,
      setActiveDocument: state.setActiveDocument,
      updateActiveDocumentContent: state.updateActiveDocumentContent,
      clearActiveDocument: state.clearActiveDocument,
      acquireWriteLock: state.acquireWriteLock,
      releaseWriteLock: state.releaseWriteLock,
      forceReleaseWriteLock: state.forceReleaseWriteLock,
      hasWriteLock: state.hasWriteLock,
      queuePreviewUrl: state.queuePreviewUrl,
      consumePreviewUrl: state.consumePreviewUrl,
      getEditorsForPath: state.getEditorsForPath,
      isPathOpen: state.isPathOpen,
      getWriteLockHolder: state.getWriteLockHolder,
    }))
  );

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<PluginCoordinationContextValue>(
    () => storeValue,
    [storeValue]
  );

  return (
    <PluginCoordinationContext.Provider value={contextValue}>
      {children}
    </PluginCoordinationContext.Provider>
  );
}

// ============================================================================
// Hook for Accessing Context
// ============================================================================

/**
 * Hook to access Plugin Coordination Context
 *
 * @throws Error if called outside PluginCoordinationProvider
 * @returns PluginCoordinationContextValue
 *
 * @example
 * ```tsx
 * function MonacoMain() {
 *   const { activeDocument, openDocument, acquireWriteLock } = usePluginCoordination();
 *
 *   useEffect(() => {
 *     if (activeDocument) {
 *       openDocument(activeDocument.path, 'monaco');
 *     }
 *   }, [activeDocument]);
 * }
 * ```
 */
export function usePluginCoordination(): PluginCoordinationContextValue {
  const context = useContext(PluginCoordinationContext);

  if (!context) {
    throw new Error('usePluginCoordination must be used within PluginCoordinationProvider');
  }

  return context;
}

/**
 * Safe version of usePluginCoordination that returns null instead of throwing
 *
 * @returns Plugin coordination context value or null if outside provider
 *
 * @remarks
 * Use this in components that may be rendered both inside and outside
 * of PluginCoordinationProvider.
 */
export function usePluginCoordinationSafe(): PluginCoordinationContextValue | null {
  const context = useContext(PluginCoordinationContext);
  return context ?? null;
}

// ============================================================================
// Re-exports for convenience
// ============================================================================

export { PluginCoordinationContext };
