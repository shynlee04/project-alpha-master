/**
 * @fileoverview IDE Terminal Slice
 * @module infrastructure/persistence/stores/ide/ide-terminal-slice
 * @governance EPIC-CP-1
 *
 * Manages terminal tab state:
 * - terminalTab: Active terminal tab (terminal, output, problems)
 * - setTerminalTab: Switch active tab
 *
 * Simple tab state (minimal complexity).
 * Type-safe enum prevents invalid tab values.
 */

import { StateCreator } from 'zustand';
import type { IDETerminalState, TerminalTab } from './ide-types';

export const createIDETerminalSlice: StateCreator<IDETerminalState> = (set) => ({
  // =========================================================================
  // State Initialization
  // =========================================================================

  terminalTab: 'terminal',

  // =========================================================================
  // Actions
  // =========================================================================

  /**
   * Set the active terminal tab
   *
   * @param tab - Terminal tab to activate
   *
   * @example
   * setTerminalTab('terminal') // Switch to terminal
   * setTerminalTab('output')   // Switch to output
   * setTerminalTab('problems') // Switch to problems
   */
  setTerminalTab: (tab: TerminalTab) => {
    set({ terminalTab: tab });
  },
});
