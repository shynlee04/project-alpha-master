/**
 * @fileoverview Workspace-Scoped Chat Settings Store
 * @module infrastructure/persistence/stores/chat
 * @governance E1-8
 *
 * Stores chat settings that vary by workspace type.
 * Each workspace (IDE, Notes, Knowledge, Study) has its own settings.
 *
 * Settings include:
 * - model: Selected AI model
 * - temperature: Response creativity (0-1)
 * - autoScroll: Auto-scroll to new messages
 * - systemPrompt: Custom system prompt
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Workspace type identifier
 */
export type WorkspaceType = 'ide' | 'notes' | 'knowledge' | 'study';

/**
 * Chat settings for a single workspace
 */
export interface WorkspaceChatSettings {
  /** Selected AI model ID */
  model: string;
  /** Response temperature (0 = focused, 1 = creative) */
  temperature: number;
  /** Auto-scroll to new messages */
  autoScroll: boolean;
  /** Custom system prompt override */
  systemPrompt?: string;
}

/**
 * Default chat settings for new workspaces
 */
export const DEFAULT_CHAT_SETTINGS: WorkspaceChatSettings = {
  model: 'gemini-2.5-flash',
  temperature: 0.7,
  autoScroll: true,
  systemPrompt: undefined,
};

/**
 * Store state interface
 */
interface ChatSettingsState {
  /** Settings indexed by workspace type */
  settings: Record<WorkspaceType, WorkspaceChatSettings>;

  /** Get settings for a workspace */
  getSettings: (workspace: WorkspaceType) => WorkspaceChatSettings;

  /** Update settings for a workspace */
  setSettings: (workspace: WorkspaceType, settings: Partial<WorkspaceChatSettings>) => void;

  /** Reset settings for a workspace to defaults */
  resetSettings: (workspace: WorkspaceType) => void;

  /** Reset all workspaces to defaults */
  resetAll: () => void;
}

/**
 * Initialize settings for all workspaces
 */
const initialSettings: Record<WorkspaceType, WorkspaceChatSettings> = {
  ide: { ...DEFAULT_CHAT_SETTINGS },
  notes: { ...DEFAULT_CHAT_SETTINGS },
  knowledge: { ...DEFAULT_CHAT_SETTINGS },
  study: { ...DEFAULT_CHAT_SETTINGS },
};

/**
 * Chat Settings Store
 *
 * Uses Zustand with:
 * - Persist middleware for localStorage persistence
 * - Partialize to persist only settings (not transient state)
 */
export const useChatSettingsStore = create<ChatSettingsState>()(
  persist(
    (set, get) => ({
      // Initial state
      settings: initialSettings,

      /**
       * Get settings for a specific workspace
       * Returns defaults if workspace not found
       */
      getSettings: (workspace: WorkspaceType) => {
        // Read from current store state via get()
        return get().settings[workspace];
      },

      /**
       * Update settings for a workspace
       * Merges with existing settings
       */
      setSettings: (workspace: WorkspaceType, newSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            [workspace]: {
              ...state.settings[workspace],
              ...newSettings,
            },
          },
        })),

      /**
       * Reset a single workspace to defaults
       */
      resetSettings: (workspace: WorkspaceType) =>
        set((state) => ({
          settings: {
            ...state.settings,
            [workspace]: { ...DEFAULT_CHAT_SETTINGS },
          },
        })),

      /**
       * Reset all workspaces to defaults
       */
      resetAll: () =>
        set(() => ({
          settings: { ...initialSettings },
        })),
    }),
    {
      name: 'chat-settings-storage',
      storage: createJSONStorage(() => localStorage),
      // Persist only the settings object
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Get chat settings for a specific workspace
 */
export function useWorkspaceChatSettings(workspace: WorkspaceType) {
  return useChatSettingsStore((s) => s.settings[workspace]);
}

/**
 * Get chat settings actions
 */
export function useChatSettingsActions() {
  return {
    setSettings: useChatSettingsStore((s) => s.setSettings),
    resetSettings: useChatSettingsStore((s) => s.resetSettings),
    resetAll: useChatSettingsStore((s) => s.resetAll),
  };
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Get store state without React hook (for non-React contexts)
 */
export function getChatSettingsState() {
  return useChatSettingsStore.getState();
}
