/**
 * @fileoverview FileTree Plugin Hook
 * @module plugins/filetree/useFileTreePlugin
 *
 * **ARCH-02-04**: FileTree Plugin Hook
 *
 * Custom hook for FileTree plugin to access ProjectContext
 * and manage plugin-specific state.
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-04
 * @team Team A
 * @created 2026-01-21
 */

import { useProjectContext } from '@/infrastructure/context/project-context';
import type { StorageGateway } from '@/domain/interfaces/storage-gateway.interface';

// ============================================================================
// Hook Return Type
// ============================================================================

/**
 * Return type for useFileTreePlugin hook
 *
 * @remarks
 * Provides access to ProjectContext values relevant to FileTree plugin.
 */
export interface UseFileTreePluginResult {
  /** Project ID */
  projectId: string;
  /** Storage gateway for file I/O */
  gateway: StorageGateway;
  /** Open file action from context */
  openFile: (path: string) => void;
  /** Save file action from context */
  saveFile: (path: string, content: string) => Promise<void>;
  /** Refresh file tree action from context */
  refreshFileTree: () => Promise<void>;
  /** File tree store from context */
  fileTree: unknown; // Will be typed as Zustand store
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for FileTree plugin to access ProjectContext
 *
 * @returns ProjectContext values relevant to FileTree plugin
 *
 * @remarks
 * - Provides direct access to gateway and file operations
 * - Throws error if used outside ProjectContextProvider
 *
 * @example
 * ```tsx
 * function FileTreeComponent() {
 *   const { gateway, openFile, refreshFileTree } = useFileTreePlugin();
 *
 *   // Use gateway for file operations
 *   const entries = await gateway.list('.');
 *
 *   // Use context actions
 *   openFile('/src/index.ts');
 *   await refreshFileTree();
 * }
 * ```
 *
 * @throws Error if used outside ProjectContextProvider
 */
export function useFileTreePlugin(): UseFileTreePluginResult {
  // Get context value from provider
  const context = useProjectContext();

  // Extract relevant values
  return {
    projectId: context.projectId,
    gateway: context.gateway,
    openFile: context.openFile,
    saveFile: context.saveFile,
    refreshFileTree: context.refreshFileTree,
    fileTree: context.fileTree,
  };
}

// ============================================================================
// No additional exports
// ============================================================================
