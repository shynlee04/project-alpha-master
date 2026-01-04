/**
 * @fileoverview IDE Workspace Type Definitions
 * @module infrastructure/persistence/stores/ide/ide-types
 * @governance EPIC-CP-1, EPIC-CC-1
 *
 * Centralized type definitions for IDE workspace state management.
 * Defines interfaces for all IDE slices following December 2025 Zustand patterns.
 *
 * Architecture:
 * - Editor State: Monaco file management (open files, active file, scroll position)
 * - Explorer State: File tree expansion state
 * - Layout State: Panel layouts and visibility
 * - Terminal State: Terminal tab switching
 * - Project State: Project scoping for multi-project support
 * - Selectors State: AI-observable context selectors
 */

/**
 * Terminal tab types
 */
export type TerminalTab = 'terminal' | 'output' | 'problems';

/**
 * File tab in Monaco editor
 * Used for managing editor tabs in the tab bar
 */
export interface EditorTab {
  path: string;
  title: string;
  dirty: boolean;
  active: boolean;
}

/**
 * File tree node (for explorer)
 * Represents a file or folder in the file tree
 */
export interface FileTreeNode {
  path: string;
  name: string;
  type: 'file' | 'folder';
  expanded?: boolean;
  children?: FileTreeNode[];
}

/**
 * Panel layout state
 * Stores panel sizes for react-resizable-panels
 */
export interface PanelLayout {
  groupId: string;
  sizes: number[];
  visible: boolean;
}

/**
 * IDE Editor State
 *
 * Manages Monaco editor file state including:
 * - Open files (tabs)
 * - Active file (currently focused)
 * - Scroll position (for restoration after navigation)
 */
export interface IDEEditorState {
  // State
  openFiles: string[];
  activeFile: string | null;
  activeFileScrollTop: number;

  // Actions
  addOpenFile: (path: string) => void;
  removeOpenFile: (path: string) => void;
  setActiveFile: (path: string | null) => void;
  setActiveFileScrollTop: (scrollTop: number) => void;
}

/**
 * IDE Explorer State
 *
 * Manages file tree expanded state:
 * - expandedPaths: Set of folder paths that are expanded
 * - toggleExpanded: Toggle a folder's expansion state
 * - setExpandedPaths: Batch set expanded folders
 * - isExpanded: Check if a folder is expanded
 */
export interface IDEExplorerState {
  // State
  expandedPaths: Set<string>;

  // Actions
  toggleExpanded: (path: string) => void;
  setExpandedPaths: (paths: string[]) => void;
  isExpanded: (path: string) => boolean;
}

/**
 * IDE Layout State
 *
 * Manages IDE panel layout and visibility:
 * - panelLayouts: Panel sizes for each panel group
 * - panelCollapsed: Panel collapse states by panel ID
 * - chatVisible: Chat panel visibility
 */
export interface IDELayoutState {
  // State
  panelLayouts: Record<string, number[]>;
  panelCollapsed: Record<string, boolean>;
  chatVisible: boolean;

  // Actions
  setPanelLayout: (groupId: string, layout: number[]) => void;
  setPanelCollapsed: (panelId: string, collapsed: boolean) => void;
  setChatVisible: (visible: boolean) => void;
  toggleChatVisible: () => void;
}

/**
 * IDE Terminal State
 *
 * Manages terminal tab state:
 * - terminalTab: Active terminal tab
 * - setTerminalTab: Switch active tab
 */
export interface IDETerminalState {
  // State
  terminalTab: TerminalTab;

  // Actions
  setTerminalTab: (tab: TerminalTab) => void;
}

/**
 * IDE Project State
 *
 * Manages project scoping for IDE state:
 * - projectId: Current project ID (scopes all IDE state)
 * - setProjectId: Set current project
 * - reset: Reset all state (for project change)
 * - _hasHydrated: Track hydration completion
 * - setHasHydrated: Set hydration flag
 */
export interface IDEProjectState {
  // State
  projectId: string | null;
  _hasHydrated: boolean;

  // Actions
  setProjectId: (projectId: string | null) => void;
  reset: () => void;
  setHasHydrated: (hydrated: boolean) => void;
}

/**
 * AI Context (for AI agents)
 *
 * Complete workspace context for AI agent tools.
 * Used by selectForAIContext selector.
 *
 * Provides AI agents with full understanding of:
 * - Current project context
 * - Active file and open files
 * - File tree structure
 * - UI state (for understanding user intent)
 */
export interface AIContext {
  // Project context
  projectId: string | null;

  // File context
  activeFile: string | null;
  openFiles: string[];

  // Explorer context
  expandedPaths: string[];

  // UI context
  chatVisible: boolean;
  terminalTab: TerminalTab;
}

/**
 * File Context (minimal, for AI tools)
 *
 * Minimal file context for AI tools.
 * Used by selectFileContext selector.
 *
 * Lightweight context for file operations:
 * - Project ID (for scoping)
 * - Active file (for single-file operations)
 * - Open files (for batch operations)
 */
export interface FileContext {
  projectId: string | null;
  activeFile: string | null;
  openFiles: string[];
}

/**
 * IDE Selectors State
 *
 * AI-observable selectors for AI agent context (Epic 25 prep).
 *
 * These selectors provide AI agents with read-only access to IDE state.
 * Follows VSCode's "extension context" pattern.
 *
 * Pure functions (no side effects, no state mutations).
 */
export interface IDESelectorsState {
  selectForAIContext: (state: CombinedIDEState) => AIContext;
  selectFileContext: (state: CombinedIDEState) => FileContext;
}

/**
 * Combined IDE State
 *
 * Composed state from all IDE slices.
 * Used as the type parameter for useIDEStore.
 *
 * This type combines:
 * - IDEEditorState (file management)
 * - IDEExplorerState (file tree)
 * - IDELayoutState (panels)
 * - IDETerminalState (terminal)
 * - IDEProjectState (project scoping)
 * - IDESelectorsState (AI context)
 */
export type CombinedIDEState = IDEEditorState &
  IDEExplorerState &
  IDELayoutState &
  IDETerminalState &
  IDEProjectState &
  IDESelectorsState;
