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
  useAgentsStoreHydration,
  DEFAULT_AGENT,
  type AgentsState
} from './agents-store';

export {
  useAgentSelection,
  useActiveAgent,
  type AgentSelectionState
} from './agent-selection-store';

export {
  useProviderModelsStore,
  useProviderModels,
  useSelectedProviderModel,
  type ProviderModelsState
} from './provider-models-store';

// New split stores (FC-01: Foundation Consolidation)
// These replace provider-models-store.ts - split into provider and models concerns
export {
  useProviderConfigStore,
  useProviderState,
  useSelectedProvider,
  type ProviderConfigState,
  type CustomProvider
} from '@/stores/provider-config-store';

export {
  useModelsStore,
  useProviderModels as useModelsForProvider,
  useSelectedModel,
  type ModelsState,
  type ModelStateEntry
} from '@/stores/models-loader-store';

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
  useThreadsStore,
  useActiveThread,
  useProjectThreads,
  useThreadsHydration,
  type ThreadsState,
  type ThreadMessage,
  type ThreadToolCall,
  type ConversationThread
} from './conversation-threads-store';

export {
  useOpenAICompatibleStore,
  type OpenAICompatibleState
} from './openai-compatible-store';

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
  initializeQuizStore,
  type QuizState
} from './quiz/index';

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
export { ViaGentDatabase } from '../dexie-db-class';

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
