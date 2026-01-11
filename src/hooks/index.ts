/**
 * @fileoverview Hooks Index
 * @module hooks
 *
 * Central exports for all custom React hooks.
 */

// Workspace hooks
export {
    useWorkspaceContext,
    useCurrentWorkspace,
    useIsInWorkspace,
} from './useWorkspaceContext';

// Cross-workspace events hooks (Iteration 15)
export {
    useRAGEmbeddingProgress,
    useRAGChunkingStatus,
    useRAGDatabaseIndexing,
    useRAGSourceProcessing,
    useCrossWorkspaceEvent,
} from './use-cross-workspace-events';

// Keyboard shortcuts hooks (S-021)
export {
    useKeyboardShortcuts,
    useKeyboardShortcut,
    useShortcutLabel,
    useShortcutsAvailable,
    useAllShortcuts,
} from './useKeyboardShortcuts';

// Advanced search hook (S-027)
export {
    useAdvancedSearch,
} from './useAdvancedSearch';

// Editor tabs hook (S-030)
export {
    useEditorTabs,
    useEditorTabShortcuts,
    useDirtyTabs,
} from './useEditorTabs';

// Command palette hook (S-038)
export {
    useCommandPalette,
} from './useCommandPalette';

// Thread manager hook (CHAT-005) - Uses UnifiedChatStore (Dexie) - CORRECT ARCHITECTURE
export {
    useThreadManager,
} from '../presentation/hooks/useThreadManager';
