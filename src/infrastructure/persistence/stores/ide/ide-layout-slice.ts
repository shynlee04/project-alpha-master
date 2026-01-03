/**
 * @fileoverview IDE Layout Slice
 * @module infrastructure/persistence/stores/ide/ide-layout-slice
 * @governance EPIC-CP-1
 *
 * Manages IDE panel layout and visibility:
 * - panelLayouts: Panel sizes for each panel group
 * - chatVisible: Chat panel visibility
 *
 * Integration with react-resizable-panels:
 * - Panel sizes stored as number[] (array of percentages/pixels)
 * - Panel layouts persisted across sessions
 */

import { StateCreator } from 'zustand';
import type { IDELayoutState } from './ide-types';

export const createIDELayoutSlice: StateCreator<IDELayoutState> = (set, get) => ({
  // =========================================================================
  // State Initialization
  // =========================================================================

  panelLayouts: {},
  chatVisible: true,

  // =========================================================================
  // Actions
  // =========================================================================

  /**
   * Update panel layout for a specific group
   *
   * @param groupId - Panel group identifier
   * @param layout - Array of panel sizes (react-resizable-panels pattern)
   *
   * @example
   * setPanelLayout('main', [50, 50]) // Two panels, 50-50 split
   */
  setPanelLayout: (groupId: string, layout: number[]) => {
    const { panelLayouts } = get();
    set({
      panelLayouts: { ...panelLayouts, [groupId]: layout },
    });
  },

  /**
   * Set chat panel visibility explicitly
   *
   * @param visible - true to show chat panel, false to hide
   *
   * @example
   * setChatVisible(true)  // Show chat
   * setChatVisible(false) // Hide chat
   */
  setChatVisible: (visible: boolean) => {
    set({ chatVisible: visible });
  },

  /**
   * Toggle chat panel visibility
   *
   * @example
   * toggleChatVisible() // Switch chat on/off
   */
  toggleChatVisible: () => {
    const { chatVisible } = get();
    set({ chatVisible: !chatVisible });
  },
});
