/**
 * @fileoverview Chat Settings Store Barrel Export
 * @module infrastructure/persistence/stores/chat
 * @governance E1-8
 *
 * Centralized exports for chat settings store.
 * Provides clean imports for all chat settings state management needs.
 */

// Main store
export { useChatSettingsStore } from './chat-settings-store';

// Types
export type {
  WorkspaceChatSettings,
  WorkspaceType,
} from './chat-settings-store';

// Constants
export { DEFAULT_CHAT_SETTINGS } from './chat-settings-store';

// Convenience hooks
export {
  useWorkspaceChatSettings,
  useChatSettingsActions,
} from './chat-settings-store';

// Utilities
export {
  getChatSettingsState,
} from './chat-settings-store';
