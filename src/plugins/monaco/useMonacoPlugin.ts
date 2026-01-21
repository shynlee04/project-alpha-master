/**
 * @fileoverview Monaco Plugin Hook
 * @module plugins/monaco/useMonacoPlugin
 *
 * **ARCH-02-05**: Monaco Plugin Hook
 *
 * Hook for accessing ProjectContext in Monaco plugin.
 * Provides direct access to gateway and file operations.
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-05
 * @team Team B
 * @created 2026-01-21
 */

import { useProjectContext } from '@/infrastructure/context/project-context';
import type { ProjectContext } from '@/infrastructure/context/project-context';
import type { EditorState } from './types';

// ============================================================================
// Hook Definition
// ============================================================================

/**
 * Monaco Plugin Hook
 *
 * @remarks
 * Hook for accessing ProjectContext in Monaco plugin.
 * Extracts relevant state and actions for Monaco editor.
 *
 * @returns Editor state and actions
 *
 * @example
 * ```tsx
 * function MonacoComponent() {
 *   const { project, gateway, saveFile, openFile } = useMonacoPlugin();
 *
 *   return (
 *     <div>
 *       <Editor project={project} gateway={gateway} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useMonacoPlugin() {
  const context = useProjectContext();

  // Extract relevant state from ProjectContext
  const { project, projectId, gateway, platform, openFile, saveFile, refreshFileTree } = context;

  // Editor state (managed locally, synced with context)
  const editorState: EditorState = {
    openFiles: [],
    activePath: null,
    content: new Map(),
  };

  return {
    // Project Data
    project,
    projectId,

    // Storage Access
    gateway,
    platform,

    // Actions
    openFile,
    saveFile,
    refreshFileTree,

    // Editor State
    editorState,
  };
}

// ============================================================================
// Hook Return Type
// ============================================================================

/**
 * Monaco Plugin Hook Return Type
 *
 * @remarks
 * Combines ProjectContext with editor-specific state.
 */
export interface MonacoPluginHookReturn {
  /** Complete project object */
  project: ProjectContext['project'];

  /** Project ID (for convenience) */
  projectId: string;

  /** Storage gateway for file I/O operations */
  gateway: ProjectContext['gateway'];

  /** Platform contract with device and capability info */
  platform: ProjectContext['platform'];

  /** Open a file in project */
  openFile: ProjectContext['openFile'];

  /** Save file content to storage */
  saveFile: ProjectContext['saveFile'];

  /** Refresh file tree from storage */
  refreshFileTree: ProjectContext['refreshFileTree'];

  /** Editor state (open files, active path, content) */
  editorState: EditorState;
}
