/**
 * @fileoverview IDE Workspace Store Barrel Export
 * @module infrastructure/persistence/stores/ide
 * @governance EPIC-CP-1
 *
 * Centralized exports for IDE workspace store.
 * Provides clean imports for all IDE state management needs.
 */

// Main store
export { useIDEStore } from './useIDEStore';

// Convenience hooks
export {
  // Editor hooks
  useOpenFiles,
  useActiveFile,
  useActiveFileScrollTop,

  // Explorer hooks
  useExpandedPaths,

  // Layout hooks
  usePanelLayouts,
  usePanelCollapsed,
  useChatVisible,

  // Terminal hooks
  useTerminalTab,

  // Project hooks
  useProjectId,

  // AI context hooks
  useAIContext,
  useFileContext,
} from './useIDEStore';

// Utilities
export {
  resetIDEStore,
  getIDEStoreState,
} from './useIDEStore';

// Types
export type {
  // Domain types
  EditorTab,
  FileTreeNode,
  PanelLayout,

  // AI context types
  AIContext,
  FileContext,

  // Slice state types
  IDEEditorState,
  IDEExplorerState,
  IDELayoutState,
  IDETerminalState,
  IDEProjectState,

  // Combined state
  CombinedIDEState,

  // Terminal tab type
  TerminalTab,
} from './ide-types';
