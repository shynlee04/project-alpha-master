/**
 * Consolidated State Management
 *
 * All stores from src/stores/ and src/lib/state/ consolidated here
 * Single source of truth for application state
 */

// ============================================================================
// AGENT STORES (NEW: Ralph Loop Cycle 14 - Split into 5 slices)
// ============================================================================

export {
  useAgentsStore,
  useAgentsStoreHydration,
  DEFAULT_AGENT,
  type AgentsState
} from './agents';

export {
  useAgentSelectionStore,
  useAgentSelection,
  useActiveAgent,
  type AgentSelectionState
} from './agents/agent-selection-store';

// Ralph Loop Cycle 15: Provider store consolidated into use-app-store
// Provider slices: provider-crud-slice, provider-models-slice, provider-utils-slice
export {
  useAppStore as useProviderStore,
} from './use-app-store';

export type {
  ProviderState,
  ModelSettings
} from './providers/types';

export {
  useAutoApproveStore,
  TOOL_CATEGORY_MAP,
  type AutoApproveState,
  type ToolCategory
} from './auto-approve-store';

export {
  usePromptEnhancementStore,
  type PromptEnhancementState
} from './prompt-enhancement-store';

export {
  useOpenAICompatibleStore,
  type OpenAICompatibleState
} from './openai-compatible-store';

// ============================================================================
// IDE STORE (Hook exports - Zustand v5 pattern)
// Note: IDE store uses hook-based selectors (useOpenFiles, etc.)
// Legacy selector functions (selectOpenFiles, etc.) removed in EPIC-CP-1
// ============================================================================

export {
  useIDEStore,
  useOpenFiles,
  useActiveFile,
  useActiveFileScrollTop,
  useExpandedPaths,
  usePanelLayouts,
  usePanelCollapsed,
  useChatVisible,
  useTerminalTab,
  useProjectId,
  useAIContext,
  useFileContext,
  resetIDEStore,
  getIDEStoreState,
  type CombinedIDEState,
  type TerminalTab,
} from '@/infrastructure/persistence/stores/ide';

export {
  useConversationStore,
  useConversationStoreHydration,
  useActiveConversation,
  usePendingApprovals,
  type ConversationState,
  type ConversationMetadata,
  type PendingToolApproval,
} from './conversation/index';

// Quiz store - uses facade for backward compatibility
// Canonical location: @/infrastructure/persistence/stores/study
export {
  useQuizStore,
  initializeQuizStore,
  type QuizState
} from '@/infrastructure/persistence/stores/study/quiz-store';

export {
  useFlashcardStore,
  type FlashcardState
} from './flashcard-store';

export {
  useStudyStore,
  type StudyState
} from './study-store';

export {
  useRAGStore,
  type RAGStoreState as RAGState
} from './rag';

export {
  useCanvasStore,
  useCanvasPersistence,
} from './canvas-store';

export {
  useStatusBarStore,
  type StatusBarState
} from './statusbar-store';

export {
  useNavigationStore,
  type NavigationState
} from './navigation-store';

export {
  useHubStore,
  type HubState
} from './hub-store';

export {
  useLayoutStore,
  type LayoutState,
  type NavItem
} from './layout-store';

export {
  useQuizHistoryStore,
  type QuizHistoryState
} from './quiz-history-store';

// ============================================================================
// DATABASE
// ============================================================================

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
} from '../dexie-db';

export { createDexieStorage } from '@/infrastructure/persistence/dexie-storage';
export { ViaGentDatabase } from '../dexie-db-class';

// ============================================================================
// DOMAIN SERVICES (NEW: Ralph Loop Cycle 16 - AC-1.5)
// ============================================================================

/**
 * Domain service utilities for Agent workspace business logic.
 *
 * These services encapsulate business rules for workspace-aware agent operations.
 * Use these utilities instead of calling methods on Agent entities (which are pure interfaces).
 *
 * @example
 * ```ts
 * import { isAgentAvailableIn } from '@/domain/services';
 *
 * if (isAgentAvailableIn(agent, 'knowledge')) {
 *   // Agent is available in Knowledge workspace
 * }
 * ```
 */
export {
  isAgentAvailableIn,
  isAgentDefaultFor,
  getAgentsForWorkspace,
  getDefaultAgentForWorkspace,
} from '@/domain/services';

// ============================================================================
// HELPERS
// ============================================================================

export { useLiveQuery } from 'dexie-react-hooks';

export {
  useFileSyncStatusStore,
  setFileSyncPending,
  setFileSyncSynced,
  setFileSyncError,
  clearFileSyncStatus,
  clearAllFileSyncStatuses,
  fileSyncStatusStore,
  fileSyncCountsStore,
  type FileSyncState,
  type FileSyncStatus,
  type FileSyncCounts,
  type SyncProgress,
} from '@/lib/workspace/file-sync-status-store';

export {
  getNoteExecutionContext,
  formatNoteContextForPrompt,
  hasActiveNote,
  getActiveNoteId,
  getActiveNote,
  createNoteContextError,
  type NoteExecutionContext,
  type NoteSelection,
  type NoteContextError,
} from './notes';

// ============================================================================
// TYPES
// ============================================================================

export * from '../dexie-db-core-types';
export * from '../dexie-db-ai-types';
export * from '../dexie-db-session-types';
export * from '../dexie-db-knowledge-types';
