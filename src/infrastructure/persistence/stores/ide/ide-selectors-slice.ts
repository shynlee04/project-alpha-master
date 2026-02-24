/**
 * @fileoverview IDE Selectors Slice
 * @module infrastructure/persistence/stores/ide/ide-selectors-slice
 * @governance EPIC-CP-1, Epic 25
 *
 * AI-observable selectors for AI agent context:
 * - selectForAIContext: Complete workspace context for AI agents
 * - selectFileContext: Minimal file context for AI tools
 *
 * Follows VSCode's "extension context" pattern.
 * Pure functions (no side effects, no state mutations).
 *
 * Converts Set<string> to Array for JSON serialization.
 * Optimized for AI agent consumption.
 */

import type { StateCreator } from 'zustand';
import type { IDESelectorsState, CombinedIDEState, AIContext, FileContext } from './ide-types';

export const createIDESelectorsSlice: StateCreator<IDESelectorsState> = (
  _set,
  _get
) => ({
  // =========================================================================
  // Selectors (Pure Functions)
  // =========================================================================

  /**
   * Select complete AI context from IDE state
   *
   * Provides AI agents with full understanding of:
   * - Current project context
   * - Active file and open files
   * - File tree structure
   * - UI state (for understanding user intent)
   *
   * @param state - Combined IDE state
   * @returns AI context object
   *
   * @example
   * const aiContext = selectForAIContext(useIDEStore.getState())
   * // => { projectId: '123', activeFile: '/src/index.ts', ... }
   */
  selectForAIContext: (state: CombinedIDEState): AIContext => ({
    // Project context
    projectId: state.projectId,

    // File context
    activeFile: state.activeFile,
    openFiles: state.openFiles,

    // Explorer context (convert Set to Array for JSON serialization)
    expandedPaths: Array.from(state.expandedPaths),

    // UI context
    chatVisible: state.chatVisible,
    terminalTab: state.terminalTab,
  }),

  /**
   * Select minimal file context from IDE state
   *
   * Lightweight context for file operations:
   * - Project ID (for scoping)
   * - Active file (for single-file operations)
   * - Open files (for batch operations)
   *
   * @param state - Combined IDE state
   * @returns File context object
   *
   * @example
   * const fileContext = selectFileContext(useIDEStore.getState())
   * // => { projectId: '123', activeFile: '/src/index.ts', openFiles: [...] }
   */
  selectFileContext: (state: CombinedIDEState): FileContext => ({
    projectId: state.projectId,
    activeFile: state.activeFile,
    openFiles: state.openFiles,
  }),
});
