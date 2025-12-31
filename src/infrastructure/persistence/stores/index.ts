/**
 * Consolidated State Management
 *
 * All stores from src/stores/ and src/lib/state/ consolidated here
 * Single source of truth for application state
 */

// ============================================================================
// AGENT STORES (from src/stores/)
// ============================================================================

export {
  useAgentsStore,
  addAgent,
  updateAgent,
  removeAgent,
  type AgentState
} from './agents-store';

export {
  useAgentSelection,
  activeAgentId,
  setActiveAgent,
  type AgentSelectionState
} from '../agent-selection-store';

export {
  useProviderModelsStore,
  setApiKey,
  fetchModels,
  type ProviderModelState
} from './provider-models-store';

export {
  useAutoApproveStore,
  shouldAutoApprove,
  type AutoApproveState
} from '../auto-approve-store';

export {
  usePromptEnhancementStore,
  isEnabled,
  toggle,
  type PromptEnhancementState
} from '../prompt-enhancement-store';

export {
  useThreadsStore,
  createThread,
  setActiveThread,
  type ThreadsState
} from '../conversation-threads-store';

export {
  useOpenAICompatibleStore,
  type OpenAICompatibleState
} from '../openai-compatible-store';

// ============================================================================
// IDE & UI STORES (from src/lib/state/)
// ============================================================================

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

export {
  useConversationStore,
  useConversationStoreHydration,
  useActiveConversation,
  usePendingApprovals,
  type ConversationState,
  type ConversationMetadata,
  type PendingToolApproval,
} from './conversation-store';

export {
  useProviderStore,
  type ProviderState
} from './provider-store';

export {
  useKnowledgeStore,
  type KnowledgeState
} from './knowledge-store';

export {
  useQuizStore,
  type QuizState
} from './quiz-store';

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
  type RAGState
} from './rag-store';

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
  type LayoutState
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

export { createDexieStorage } from '../dexie-storage';
export { DexieDB } from '../dexie-db-class';

// ============================================================================
// HELPERS
// ============================================================================

export { useLiveQuery } from 'dexie-react-hooks';

// ============================================================================
// TYPES
// ============================================================================

export * from '../dexie-db-core-types';
export * from '../dexie-db-ai-types';
export * from '../dexie-db-session-types';
export * from '../dexie-db-knowledge-types';
