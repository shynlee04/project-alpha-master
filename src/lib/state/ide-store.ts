/**
 * @fileoverview IDE Store Facade - DEPRECATED
 * @module lib/state/ide-store
 * @deprecated Use `@/infrastructure/persistence/stores/ide` instead
 *
 * This file is a backward-compatibility facade that re-exports from the
 * canonical location in infrastructure/persistence/stores/ide.
 *
 * Migration (ADR-024, Epic 53):
 * - Old import: `import { useIDEStore } from '@/lib/state/ide-store'`
 * - New import: `import { useIDEStore } from '@/infrastructure/persistence/stores/ide'`
 *
 * This facade will be removed after Story 53-7 (Update All Import Paths).
 */

// Emit deprecation warning in development
if (process.env.NODE_ENV === 'development') {
  console.warn(
    '[DEPRECATED] Import from @/lib/state/ide-store is deprecated.\n' +
      'Please update your import to: @/infrastructure/persistence/stores/ide\n' +
      'See: ADR-024, Epic 53 - State Management Consolidation'
  );
}

// Re-export everything from canonical location
export {
  // Main store
  useIDEStore,

  // Convenience hooks
  useOpenFiles,
  useActiveFile,
  useActiveFileScrollTop,
  useExpandedPaths,
  usePanelLayouts,
  usePanelCollapsed,
  useChatVisible,
  useTerminalTab,
  useProjectId,
  useAIContext,
  useFileContext,

  // Utilities
  resetIDEStore,
  getIDEStoreState,
} from '@/infrastructure/persistence/stores/ide';

// Re-export types
export type {
  EditorTab,
  FileTreeNode,
  PanelLayout,
  AIContext,
  FileContext,
  IDEEditorState,
  IDEExplorerState,
  IDELayoutState,
  IDETerminalState,
  IDEProjectState,
  CombinedIDEState,
  TerminalTab,
} from '@/infrastructure/persistence/stores/ide';

// ============================================================================
// Legacy Exports for Backward Compatibility
// ============================================================================

/**
 * @deprecated Use CombinedIDEState from infrastructure instead
 * This type alias maintains backward compatibility with existing code
 * that imports IDEState from this module.
 */
export type { CombinedIDEState as IDEState } from '@/infrastructure/persistence/stores/ide';

// Legacy selectors (re-export as convenience)
// These match the original file's export pattern

import { useIDEStore as _useIDEStore } from '@/infrastructure/persistence/stores/ide';
import type { CombinedIDEState } from '@/infrastructure/persistence/stores/ide';

/**
 * @deprecated Use useIDEStore((s) => s.openFiles) instead
 */
export const selectOpenFiles = (state: CombinedIDEState) => state.openFiles;

/**
 * @deprecated Use useIDEStore((s) => s.activeFile) instead
 */
export const selectActiveFile = (state: CombinedIDEState) => state.activeFile;

/**
 * @deprecated Use useIDEStore((s) => s.expandedPaths) instead
 */
export const selectExpandedPaths = (state: CombinedIDEState) => state.expandedPaths;

/**
 * @deprecated Use useIDEStore((s) => s.panelLayouts) instead
 */
export const selectPanelLayouts = (state: CombinedIDEState) => state.panelLayouts;

/**
 * @deprecated Use useIDEStore((s) => s.isExpanded(path)) instead
 */
export const createIsExpandedSelector = (path: string) => (state: CombinedIDEState) =>
  state.expandedPaths.has(path);

/**
 * @deprecated Use useAIContext() hook instead
 */
export const selectForAIContext = (state: CombinedIDEState) => ({
  projectId: state.projectId,
  activeFile: state.activeFile,
  openFiles: state.openFiles,
  expandedPaths: Array.from(state.expandedPaths),
  chatVisible: state.chatVisible,
  terminalTab: state.terminalTab,
});

/**
 * @deprecated Use useFileContext() hook instead
 */
export const selectFileContext = (state: CombinedIDEState) => ({
  activeFile: state.activeFile,
  openFiles: state.openFiles,
  projectId: state.projectId,
});
