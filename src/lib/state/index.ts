/**
 * @fileoverview State Library Public API
 * @module lib/state
 * 
 * Exports all state management utilities:
 * - Dexie.js database
 * - Zustand IDE store
 * - Storage adapters
 * 
 * Story 27-1: State Architecture Stabilization
 * 
 * @example
 * ```tsx
 * // Import what you need
 * import { useIDEStore, db, useLiveQuery } from '@/lib/state';
 * 
 * // Use Zustand store
 * const openFiles = useIDEStore((s) => s.openFiles);
 * 
 * // Use Dexie live query
 * const projects = useLiveQuery(() => db.projects.toArray());
 * ```
 */

// Database
export {
    db,
    getIDEState,
    saveIDEState,
    deleteIDEState,
    getRecentProjects,
    resetDatabaseForTesting,
    type ProjectRecord,
    type IDEStateRecord,
    type ConversationRecord,
} from './dexie-db';

// Storage adapter
export { createDexieStorage } from './dexie-storage';

// Zustand store
export {
    useIDEStore,
    selectOpenFiles,
    selectActiveFile,
    selectExpandedPaths,
    selectPanelLayouts,
    createIsExpandedSelector,
    type IDEState,
    type TerminalTab,
} from './ide-store';

// Conversation store (Story 2.1)
export {
    useConversationStore,
    useConversationStoreHydration,
    useActiveConversation,
    usePendingApprovals,
    type ConversationState,
    type ConversationMetadata,
    type PendingToolApproval,
} from './conversation-store';

// Canvas store (Story 8.1)
export {
    useCanvasStore,
    useCanvasPersistence,
} from './canvas-store';

// Re-export Dexie hooks for convenience
export { useLiveQuery } from 'dexie-react-hooks';

