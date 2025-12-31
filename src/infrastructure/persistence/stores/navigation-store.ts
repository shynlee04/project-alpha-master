/**
 * Navigation State Management
 * @module lib/state
 * 
 * Centralized navigation state for consistent navigation patterns across IDE.
 * Tracks active panels, focused elements, selected items, and keyboard navigation state.
 * Persists to localStorage for session continuity.
 * 
 * EPIC_ID: Epic 23
 * STORY_ID: P1.5
 * CREATED_AT: 2025-12-25T22:00:00Z
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Navigation state interface
 */
export interface NavigationState {
  /** Currently active panel (explorer, agents, search, terminal, settings) */
  activePanel: string | null;
  
  /** Currently focused element identifier */
  focusedElement: string | null;
  
  /** Selected items by component ID */
  selectedItems: Map<string, string>;
  
  /** Keyboard navigation enabled */
  keyboardNavigationEnabled: boolean;
  
  /** Last active timestamp */
  lastActiveAt: number | null;
}

/**
 * Navigation actions
 */
export interface NavigationActions {
  /** Set active panel */
  setActivePanel: (panel: string | null) => void;
  
  /** Set focused element */
  setFocusedElement: (elementId: string | null) => void;
  
  /** Set selected item for component */
  setSelectedItem: (componentId: string, itemId: string) => void;
  
  /** Clear selected items for component */
  clearSelectedItems: (componentId: string) => void;
  
  /** Enable keyboard navigation */
  enableKeyboardNavigation: () => void;
  
  /** Disable keyboard navigation */
  disableKeyboardNavigation: () => void;
  
  /** Update last active timestamp */
  updateLastActiveAt: () => void;
  
  /** Reset navigation state */
  reset: () => void;
}

/**
 * Initial navigation state
 */
const initialState: NavigationState = {
  activePanel: null,
  focusedElement: null,
  selectedItems: new Map(),
  keyboardNavigationEnabled: true,
  lastActiveAt: null,
};

/**
 * Create navigation store with localStorage persistence
 */
type NavigationStore = NavigationState & NavigationActions;

export const useNavigationStore = create<NavigationStore>()(
  persist(
    (set) => ({
      // State
      activePanel: initialState.activePanel,
      focusedElement: initialState.focusedElement,
      selectedItems: initialState.selectedItems,
      keyboardNavigationEnabled: initialState.keyboardNavigationEnabled,
      lastActiveAt: initialState.lastActiveAt,
      
      // Actions
      setActivePanel: (panel) => set({ activePanel: panel }),
      
      setFocusedElement: (elementId) => set({ focusedElement: elementId }),
      
      setSelectedItem: (componentId, itemId) =>
        set((state) => {
          const selectedItems = new Map(state.selectedItems);
          selectedItems.set(componentId, itemId);
          return { selectedItems };
        }),
      
      clearSelectedItems: (componentId) =>
        set((state) => {
          const selectedItems = new Map(state.selectedItems);
          selectedItems.delete(componentId);
          return { selectedItems };
        }),
      
      enableKeyboardNavigation: () => set({ keyboardNavigationEnabled: true }),
      
      disableKeyboardNavigation: () => set({ keyboardNavigationEnabled: false }),
      
      updateLastActiveAt: () => set({ lastActiveAt: Date.now() }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'via-gent-navigation-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        ...state,
        selectedItems: Array.from(state.selectedItems.entries()),
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.selectedItems && Array.isArray(state.selectedItems)) {
          state.selectedItems = new Map(state.selectedItems);
        }
      },
    }
  )
);

export default useNavigationStore;
