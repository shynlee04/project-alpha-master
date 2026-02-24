649 results - 337 files

_test-spike/_harness/src/runners/index.ts:
  1  /**
  2:  * @fileoverview Test Runners Index
  3: 
  3   * @module harness/runners

_test-spike/_harness/src/runners/prompt-mode-testing.ts:
  33  /**
  34:  * Agent mode state
  35: 

  35   */

  44   * Prompt Mode Testing Runner
  45:  * Tests prompt versions, mode switching, and mode persistence
  46: 
  46   */

_test-spike/_harness/src/runners/state-management.ts:
  233    /**
  234:    * Capture current state
  235: 
  235     */

_test-spike/_harness/src/tui/index.ts:
   26  /**
   27:  * Live execution state
   28: 

   28   */

  420    /**
  421:    * Get execution state
  422: 
  422     */

e2e/utils/test-assertions.ts:
  112  /**
  113:  * Assert progress indicator is visible with expected state
  114: 
  114   */

src/domain/entities/chat.ts:
    8   *
    9:  * @story MM-01: Create Unified Chat Store
   10: 

   10   * @created 2026-01-10

  220  /**
  221:  * Conversation state for persistence
  222: 
  222   *

src/domain/services/agent-workspace-utils.ts:
   8   * @module domain/services/agent-workspace-utils
   9:  * @story AC-1.5 - Fix circular dependencies in agent-selection-store
  10: 
  10   */

src/domain/services/project-registry-types.ts:
  12  /**
  13:  * Project lifecycle states
  14: 
  14   * - pending: Project created but not yet active

src/domain/services/ProjectRegistry.ts:
   54   * 2. Detect folder path conflicts (same folder in multiple workspaces)
   55:  * 3. Manage project lifecycle states
   56: 

   56   * 4. Provide workspace-scoped project IDs

  201    /**
  202:    * Update project lifecycle state
  203: 

  203     *
  204     * @param projectId - Project ID to update
  205:    * @param newState - New lifecycle state
  206: 

  206     * @returns Whether update succeeded

  317    /**
  318:    * Get projects by lifecycle state
  319: 
  319     *

src/domain/services/workspace-transition-service.ts:
  13  /**
  14:  * Workspace transition state
  15: 
  15   */

src/domain/types/viagent-metadata.ts:
  395  /**
  396:  * Create empty notes index
  397: 

  397   *
  398   * @param projectId - Project ID
  399:  * @returns Empty notes index
  400: 
  400   */

src/domain/types/llm/adapter-types.ts:
  24     * API key (decrypted)
  25:    * @security Fetched from credential-vault.ts at runtime, NOT stored in provider state
  26: 
  26     */

src/hooks/index.ts:
  1  /**
  2:  * @fileoverview Hooks Index
  3: 
  3   * @module hooks

src/hooks/use-cross-workspace-events.ts:
   14  /**
   15:  * RAG Event State
   16: 

   16   *

   34   *
   35:  * @returns Current RAG event state
   36: 

   36   *

   77   *
   78:  * @returns Current RAG event state
   79: 

   79   */

  111   *
  112:  * @returns Current RAG event state
  113: 

  113   */

  145   *
  146:  * @returns Current RAG event state
  147: 
  147   */

src/hooks/useAgents.ts:
  33  /**
  34:  * Hook for managing agent state with persistence
  35: 
  35   *

src/hooks/useCodeFormatter.ts:
  243    /**
  244:    * Reset formatter state
  245: 
  245     */

src/hooks/useFileDiff.ts:
  28  /**
  29:  * Diff state
  30: 
  30   */

src/hooks/useGit.ts:
  82   * Features:
  83:  * - Git state management via Zustand store
  84: 
  84   * - Auto-refresh with configurable interval

src/hooks/useIdeStatePersistence.ts:
  2   * @fileoverview IDE State Persistence Hook (Zustand Migration)
  3:  * @module hooks/useIdeStatePersistence
  4: 

  4   * 

  7   * BEFORE: Complex ref-based persistence with direct IndexedDB access
  8:  * AFTER: Simple wrapper around Zustand store with automatic persistence
  9: 
  9   * 

src/hooks/useKeyboardShortcuts.ts:
  17     * Whether shortcuts should be registered
  18:    * Useful for conditional registration based on component state
  19: 
  19     */

src/hooks/useOfflineStatus.ts:
  72  
  73:   return offlineState
  74: 
  74  }

src/hooks/useProjectTemplates.ts:
  330    /**
  331:    * Reset to initial state
  332: 
  332     */

src/hooks/useQuizSession.ts:
   1  /**
   2:  * @fileoverview Quiz session hook for managing quiz taking state
   3: 

   3   * @module hooks/useQuizSession

  45  /**
  46:  * Hook for managing quiz session state
  47: 
  47   */

src/hooks/useStoreHydration.ts:
  4   *
  5:  * Custom hook for waiting until Zustand store has finished hydrating from persistence
  6: 
  6   * before rendering components that depend on persisted state.

src/hooks/useTerminal.ts:
   82   * @param options - Hook options
   83:  * @returns Terminal operations and state
   84: 

   84   *

  221    /**
  222:    * Reset terminal state
  223: 
  223     */

src/infrastructure/filesystem/fsa-gateway.ts:
  4   *
  5:  * **ARC-B02**: Implement FSAGateway adapter with handle persistence
  6: 
  6   *

src/infrastructure/filesystem/handle-persistence.ts:
    2   * @fileoverview Handle Persistence Service
    3:  * @module infrastructure/filesystem/handle-persistence
    4: 

    4   * @governance EPIC-CC-01 (Project Space Foundation)

   99   *
  100:  * @param record - FSA handle record from Dexie
  101: 

  101   * @returns true if silent restore should be attempted

  300     * @param projectId - The project ID (used as handle ID)
  301:    * @param record - FSA handle record from Dexie
  302: 

  302     * @returns Restored handle or null if silent restore not possible

  521      projectId: string,
  522:     status: HandlePermissionState
  523: 
  523    ): Promise<void> {

src/infrastructure/filesystem/viagent-service.ts:
  267    /**
  268:    * Read notes index
  269: 

  269     *

  291    /**
  292:    * Write notes index
  293: 

  293     *

  315    /**
  316:    * Update notes index
  317: 

  317     *
  318:    * @param updater - Function to update index
  319: 

  319     * @returns Success result

  321    async updateNotesIndex(
  322:     updater: (current: ViagentNotesIndex) => ViagentNotesIndex
  323: 

  323    ): Promise<MetadataResult<void>> {

  333    /**
  334:    * Add note to index
  335: 

  335     *

  347    /**
  348:    * Remove note from index
  349: 
  349     *

src/infrastructure/persistence/dexie-db-ai-types.ts:
  118  /**
  119:  * Conversation thread record for Dexie persistence
  120: 
  120   * Enables full-text indexing for search.

src/infrastructure/persistence/dexie-db-core-types.ts:
   90   * File snapshot metadata (lightweight, for fast file tree loads)
   91:  * Story WB-2: File Snapshot Store
   92: 

   92   * PERSIST-S002: Added workspaceId for cross-workspace isolation

  108   * File content cache (lazy-loaded, only when file is opened)
  109:  * Story WB-2: File Snapshot Store
  110: 
  110   * PERSIST-S002: Added workspaceId for cross-workspace isolation

src/infrastructure/persistence/dexie-db-knowledge-types.ts:
  169  /**
  170:  * Note record for BlockNote editor persistence
  171: 
  171   * Stores structured note content with hierarchical organization.

src/infrastructure/persistence/dexie-db-migrations.ts:
  1421                  // Step 3: Update ideState references
  1422:                 const ideStateRecords = await db.ideState
  1423: 
  1423                      .where('projectId')

src/infrastructure/persistence/dexie-db-session-types.ts:
  19  /**
  20:  * Generic record for Zustand persistence in Dexie
  21: 

  21   * Used by createDexieStorage adapter

  95   * @epic Epic 24 - Performance & UX Optimization
  96:  * @story 24-4 - Tool Execution Context Persistence
  97: 
  97   */

src/infrastructure/persistence/dexie-db-study-types.ts:
  18  /**
  19:  * Flashcard record for IndexedDB persistence
  20: 

  20   */

  34  /**
  35:  * Flashcard set record for IndexedDB persistence
  36: 
  36   */

src/infrastructure/persistence/index.ts:
  3   *
  4:  * Consolidated state management and database persistence
  5: 
  5   *

src/infrastructure/persistence/state-orchestrator.ts:
  84     *
  85:    * @param storeName - Name of store
  86: 
  86     * @param store - Store reference

src/infrastructure/persistence/workflow-persistence.ts:
    2   * @fileoverview Workflow Persistence Service
    3:  * @module infrastructure/persistence/workflow-persistence
    4: 

    4   * @governance EPIC-E4-7

  494  /**
  495:  * Migrate workflows from localStorage to Dexie
  496: 
  496   *

src/infrastructure/persistence/stores/analytics-store.ts:
  6   *
  7:  * @module stores/analytics-store
  8: 
  8   * @story S-034 Analytics Dashboard and Metrics

src/infrastructure/persistence/stores/auto-approve-store.ts:
  1  /**
  2:  * Auto-Approve Settings Store
  3: 
  3   * 

src/infrastructure/persistence/stores/canvas-store.ts:
  2   * @fileoverview Canvas Store Facade (Legacy Export)
  3:  * @module infrastructure/persistence/stores/canvas-store
  4: 
  4   * @governance S-012-a (God Store Elimination)

src/infrastructure/persistence/stores/code-chunk-store.ts:
   1  /**
   2:  * @fileoverview Code Chunk Store
   3:  * @module infrastructure/persistence/stores/code-chunk-store
   4: 

   4   * @governance EPIC-40 MM-10

  17  /**
  18:  * Code chunk store state
  19: 

  19   */

  48  /**
  49:  * Create code chunk store
  50: 
  50   */

src/infrastructure/persistence/stores/file-watcher-store.ts:
   1  /**
   2:  * @fileoverview File Watcher Store
   3:  * @module infrastructure/persistence/stores/file-watcher-store
   4: 

   4   *

  16  /**
  17:  * Watched file state
  18: 

  18   */

  38  /**
  39:  * File watcher store state
  40: 

  40   */

  84  /**
  85:  * Create file watcher store with persistence
  86: 
  86   */

src/infrastructure/persistence/stores/flashcard-store.ts:
  2   * @fileoverview Flashcard store facade (backward compatibility)
  3:  * @module infrastructure/persistence/stores/flashcard-store
  4: 
  4   * @governance S-012-b | Phase 4 | API-001-REFACTOR

src/infrastructure/persistence/stores/hub-store.ts:
   1  /**
   2:  * Hub Navigation Store
   3: 

   3   * 

   5   * - Active section (home, ide, agents, knowledge, settings)
   6:  * - Sidebar collapsed state
   7: 

   7   * - Navigation history

  41  /**
  42:  * Hub navigation store
  43: 
  43   * 

src/infrastructure/persistence/stores/hydration-manager.ts:
   76          try {
   77:           const record = await db.ideState
   78: 

   78              .where('projectId')

  145    /**
  146:    * Unregister a store
  147: 

  147     */

  260    /**
  261:    * Reset a specific store
  262: 
  262     */

src/infrastructure/persistence/stores/index.ts:
    4   * All stores from src/stores/ and src/lib/state/ consolidated here
    5:  * Single source of truth for application state
    6: 

    6   */

   15    DEFAULT_AGENT,
   16:   type AgentsState
   17: 

   17  } from './agents';

   22    useActiveAgent,
   23:   type AgentSelectionState
   24: 

   24  } from './agents/agent-selection-store';

   45    usePromptEnhancementStore,
   46:   type PromptEnhancementState
   47: 

   47  } from './prompt-enhancement-store';

   50    useOpenAICompatibleStore,
   51:   type OpenAICompatibleState
   52: 

   52  } from './openai-compatible-store';

   93    initializeQuizStore,
   94:   type QuizState
   95: 

   95  } from '@/infrastructure/persistence/stores/study/quiz-store';

   98    useFlashcardStore,
   99:   type FlashcardState
  100: 

  100  } from './flashcard-store';

  103    useStudyStore,
  104:   type StudyState
  105: 

  105  } from './study-store';

  108    useRAGStore,
  109:   type RAGStoreState as RAGState
  110: 

  110  } from './rag';

  118    useStatusBarStore,
  119:   type StatusBarState
  120: 

  120  } from './statusbar-store';

  123    useNavigationStore,
  124:   type NavigationState
  125: 

  125  } from './navigation-store';

  128    useHubStore,
  129:   type HubState
  130: 

  130  } from './hub-store';

  133    useLayoutStore,
  134:   type LayoutState
  135: 

  135  } from './layout-store';

  138    useQuizHistoryStore,
  139:   type QuizHistoryState
  140: 
  140  } from './quiz-history-store';

src/infrastructure/persistence/stores/layout-store.ts:
   1  /**
   2:  * @fileoverview Layout State Store
   3:  * @module lib/state/layout-store
   4: 

   4   * @governance LAYOUT-1

   9   * 
  10:  * Story LAYOUT-1: Create Unified Layout Store
  11: 

  11   * 

  93  /**
  94:  * Main layout state store with localStorage persistence
  95: 
  95   * 

src/infrastructure/persistence/stores/navigation-store.ts:
   2   * Navigation State Management
   3:  * @module lib/state
   4: 

   4   * 

  72  /**
  73:  * Initial navigation state
  74: 

  74   */

  84  /**
  85:  * Create navigation store with localStorage persistence
  86: 
  86   */

src/infrastructure/persistence/stores/openai-compatible-store.ts:
   1  /**
   2:  * OpenAI Compatible Provider Store
   3: 

   3   * 

  58  /**
  59:  * OpenAI Compatible Provider store with localStorage persistence
  60: 
  60   */

src/infrastructure/persistence/stores/plugins-store.ts:
  6   *
  7:  * @module stores/plugins-store
  8: 
  8   * @story S-037 - Plugin System for extensibility with marketplace

src/infrastructure/persistence/stores/prompt-enhancement-store.ts:
  1  /**
  2:  * @fileoverview Prompt Enhancement Store
  3:  * @module stores/prompt-enhancement-store
  4: 
  4   * 

src/infrastructure/persistence/stores/quiz-history-store.ts:
    1  /**
    2:  * @fileoverview Quiz history store with Dexie persistence
    3:  * @module lib/state/quiz-history-store
    4: 

    4   */

   53  /**
   54:  * Quiz history store with Dexie persistence
   55: 

   55   */

  167  /**
  168:  * Initialize quiz history store
  169: 
  169   */

src/infrastructure/persistence/stores/schema-migrations.ts:
   32   * Current schema version
   33:  * Increment this when introducing breaking changes to persisted state
   34: 

   34   */

  153   *
  154:  * @param persistedVersion - Version from persisted state
  155: 

  155   * @returns True if migration needed

  299   *
  300:  * @param state - Migrated state
  301: 
  301   * @returns True if state is valid

src/infrastructure/persistence/stores/session-snapshot-manager.ts:
   55    /**
   56:    * Panel widths/resizing state
   57: 

   57     */

  107     *
  108:    * @param getState - Function to get current IDE state
  109: 

  109     */

  127     *
  128:    * @param getState - Function to get current IDE state
  129: 

  129     */

  142     *
  143:    * @param ideState - Current IDE state
  144: 

  144     */

  221    /**
  222:    * Restore snapshot to IDE state
  223: 

  223     *
  224:    * @param snapshot - Snapshot to restore
  225:    * @param setState - Function to set IDE state
  226: 

  226     */

  289   *
  290:  * @param getState - Function to get current IDE state
  291: 

  291   * @param options - Snapshot options

  304   * @param options - Snapshot options
  305:  * @param setState - Function to set IDE state
  306: 
  306   * @returns Whether snapshot was restored

src/infrastructure/persistence/stores/statusbar-store.ts:
    1  /**
    2:  * @fileoverview StatusBar State Store
    3:  * @module lib/state/statusbar-store
    4: 

    4   * 

   16   * @roadmap
   17:  * - Epic 25: Add agentStatus field for AI agent states
   18: 

   18   * - Epic 26: Wire providerStatus to real API key validation

   33  /**
   34:  * WebContainer boot states
   35: 

   35   */

   38  /**
   39:  * File sync states
   40: 

   40   */

   67  /**
   68:  * AI Agent activity states
   69: 

   69   * @story 28-27 - Agent activity in StatusBar

  173  /**
  174:  * StatusBar Zustand store
  175: 
  175   * 

src/infrastructure/persistence/stores/study-store.ts:
   2   * @fileoverview Study session store with Dexie persistence for SRS data
   3:  * @module lib/state/study-store
   4: 

   4   *

  33  LEGACY IMPLEMENTATION REMOVED - Refactored into 4 slices:
  34: - study-database-slice.ts: Database class, initialization, persistence
  35: 
  35  - study-session-slice.ts: Session CRUD, SRS data management

src/infrastructure/persistence/stores/synthesis-store.ts:
  1  /**
  2:  * Synthesis Store - Manages study material generation state
  3: 
  3   *

src/infrastructure/persistence/stores/terminal-store.ts:
    1  /**
    2:  * @fileoverview Terminal Store
    3:  * @module infrastructure/persistence/stores/terminal-store
    4: 

    4   *

    8   * - Terminal settings (font size, theme)
    9:  * - Command history persistence
   10: 

   10   * - Working directory tracking

   21  /**
   22:  * Terminal tab state
   23: 

   23   */

   59  /**
   60:  * Terminal store state
   61: 

   61   */

  297  /**
  298:  * Terminal store with persistence
  299: 

  299   */
  300  /**
  301:  * Terminal store with persistence
  302: 
  302   * 

src/infrastructure/persistence/stores/types.ts:
    7   * @module stores/types
    8:  * @story AC-1.7 - Create single bounded store
    9: 

    9   */

   31  /**
   32:  * Agent CRUD State
   33: 

   33   *

   56  /**
   57:  * Agent Workspace Bindings State
   58: 

   58   *

   78  /**
   79:  * Agent Validation State
   80: 

   80   *

   97  /**
   98:  * Agent Events State
   99: 

   99   *

  116  /**
  117:  * Agent Utils State
  118: 

  118   *

  151  /**
  152:  * Provider State
  153: 

  153   *

  220  /**
  221:  * App State - Single Bounded Store
  222: 

  222   *

  240     * Schema version for safe migrations
  241:    * Incremented when breaking changes are introduced to persisted state
  242: 

  242     * Migrations run automatically on rehydration when version changes

  247  export type AppState = AppStateBase
  248:   & AgentCrudState
  249:   & AgentWorkspaceBindingsState
  250:   & AgentValidationState
  251:   & AgentEventsState
  252:   & AgentUtilsState
  253: 
  253    & ProviderState;

src/infrastructure/persistence/stores/use-app-store.ts:
   1  /**
   2:  * App Store - Single Bounded Store
   3: 

   3   *

  13   *
  14:  * @module stores/use-app-store
  15:  * @story AC-1.7 - Create single bounded store
  16: 
  16   */

src/infrastructure/persistence/stores/agents/agent-selection-store.ts:
  2   * @fileoverview Agent Selection Store - Refactored with Slices
  3:  * @module infrastructure/persistence/stores/agents/agent-selection-store
  4: 
  4   * @governance Architectural Specification v3.0

src/infrastructure/persistence/stores/agents/index.ts:
   6   *
   7:  * @module agents/index
   8:  * @story AC-1.8 - Update agents facade to use unified store
   9:  * @migration Migrated from agents-store to use-app-store
  10: 
  10   */

src/infrastructure/persistence/stores/agents/types.ts:
   81  /**
   82:  * Agent Validation State
   83: 

   83   *

  150  /**
  151:  * Combined Agents State
  152: 
  152   *

src/infrastructure/persistence/stores/agents/slices/agent-crud-slice.ts:
  103   * - updateAgent: Update existing agent (no validation, no events)
  104:  * - resetToDefaults: Reset to initial state
  105: 

  105   */

  109    [],
  110:   AgentCrudState
  111: 
  111  > = (set) => ({

src/infrastructure/persistence/stores/agents/slices/agent-selection-state.ts:
  2   * @fileoverview Agent Selection State Interface
  3:  * @module infrastructure/persistence/stores/agents/slices/agent-selection-state
  4: 
  4   * @governance Architectural Specification v3.0

src/infrastructure/persistence/stores/canvas/canvas-db.ts:
  11   * - Canonical location for Dexie database initialization
  12:  * - Supports canvas metadata and state persistence
  13: 
  13   *

src/infrastructure/persistence/stores/canvas/index.ts:
  11   * - Persist middleware for IndexedDB
  12:  * - Re-exports both useCanvasStore and useMultiCanvasStore
  13: 

  13   *

  53  /**
  54:  * Create useCanvasStore with IndexedDB persistence
  55: 
  55   */

src/infrastructure/persistence/stores/canvas/types.ts:
  2   * @module Canvas Types
  3:  * @description Type definitions for canvas store
  4: 
  4   * @architecture Infrastructure Layer - Persistence Sub-layer

src/infrastructure/persistence/stores/canvas/slices/canvas-multi-slice.ts:
  11   * - Save current canvas before switching
  12:  * - Load new canvas state
  13: 
  13   * - Update active canvas ID in localStorage

src/infrastructure/persistence/stores/chat/chat-settings-store.ts:
   1  /**
   2:  * @fileoverview Workspace-Scoped Chat Settings Store
   3: 

   3   * @module infrastructure/persistence/stores/chat

  82  /**
  83:  * Chat Settings Store
  84: 

  84   *
  85   * Uses Zustand with:
  86:  * - Persist middleware for localStorage persistence
  87: 
  87   * - Partialize to persist only settings (not transient state)

src/infrastructure/persistence/stores/chat/unified-chat-store.ts:
    1  /**
    2:  * @fileoverview Unified Chat Store
    3: 

    3   * @module infrastructure/persistence/stores/chat

   15   *
   16:  * @story MM-01: Create Unified Chat Store
   17: 

   17   * @updated MM-09: Added context window slice

   52  /**
   53:  * Debounced persist function for conversation state
   54: 

   54   * Prevents excessive IndexedDB writes during rapid updates

   89  /**
   90:  * Unified Chat Store
   91: 

   91   *

   94   * Persistence Configuration:
   95:  * - Storage: DexieIndexedDB via createDexieStorage
   96: 

   96   * - Partialize: Conversations, threads, messages, tool calls, approvals
   97:  * - Excluded: Ephemeral UI state
   98: 

   98   */

  134          /**
  135:          * Get current conversation state for persistence
  136:          * Aggregates metadata, threads, and messages into a single ConversationState
  137: 

  137           */

  193           * Load conversation from IndexedDB by ID
  194:          * Restores conversation, threads, and messages into the store
  195: 
  195           */

src/infrastructure/persistence/stores/chat/unified-chat-types.ts:
   8   *
   9:  * @story MM-01: Create Unified Chat Store
  10: 

  10   * @created 2026-01-10

  63  /**
  64:  * Unified Chat Store State
  65: 
  65   *

src/infrastructure/persistence/stores/chat/__tests__/test-helper.ts:
   1  /**
   2:  * @fileoverview Test Helper for Unified Chat Store
   3: 

   3   * @module infrastructure/persistence/stores/chat/__tests__

   8   *
   9:  * @story TC-001: Add test coverage for unified chat store
  10: 
  10   * @created 2026-01-10

src/infrastructure/persistence/stores/chat/slices/chat-metadata-slice.ts:
   8   *
   9:  * @story MM-01: Create Unified Chat Store
  10: 
  10   * @created 2026-01-10

src/infrastructure/persistence/stores/chat/slices/message-crud-slice.ts:
   8   *
   9:  * @story MM-01: Create Unified Chat Store
  10: 
  10   * @created 2026-01-10

src/infrastructure/persistence/stores/chat/slices/thread-management-slice.ts:
   8   *
   9:  * @story MM-01: Create Unified Chat Store
  10: 
  10   * @created 2026-01-10

src/infrastructure/persistence/stores/chat/slices/tool-execution-slice.ts:
   8   *
   9:  * @story MM-01: Create Unified Chat Store
  10: 
  10   * @created 2026-01-10

src/infrastructure/persistence/stores/conversation/conversation-store.ts:
  2   * @fileoverview Conversation Store Re-export (Canonical Location)
  3:  * @module infrastructure/persistence/stores/conversation/conversation-store
  4: 
  4   *

src/infrastructure/persistence/stores/conversation/conversation-types.ts:
  49  /**
  50:  * Conversation metadata and state
  51: 
  51   * Extended with workspace awareness for multi-workspace architecture

src/infrastructure/persistence/stores/conversation/types.ts:
  90  /**
  91:  * Combined Conversation State
  92: 
  92   *

src/infrastructure/persistence/stores/conversation/useConversationStore.ts:
    1  /**
    2:  * @fileoverview Backward Compatibility Facade for useConversationStore
    3: 

    3   * @module infrastructure/persistence/stores/conversation

   61   * Map unified store thread to legacy format
   62:  * NOTE: Messages are computed lazily from the unified store's messages index
   63: 

   63   * agentsUsed is derived from unique agentIds in the thread's messages

  489  /**
  490:  * Get the entire conversation store state
  491: 
  491   * NOTE: This is a snapshot of state at call time, not reactive

src/infrastructure/persistence/stores/conversation/migration/conversation-migration.ts:
   14   * 3. Transform old schema to new schema
   15:  * 4. Write transformed data to new store
   16: 

   16   * 5. Verify data integrity (counts match)

   61  /**
   62:  * Legacy conversation store state
   63: 

   63   */

  304  async function transformLegacyData(
  305:     legacyData: LegacyConversationStoreState
  306: 

  306  ): Promise<{

  385  /**
  386:  * Write transformed data to new store
  387: 
  387   */

src/infrastructure/persistence/stores/conversation/slices/create-project-state-slice.ts:
  6   *
  7:  * @module conversation/slices/project-state
  8: 
  8   */

src/infrastructure/persistence/stores/editor-tabs/editor-tabs-crud-slice.ts:
  14  /**
  15:  * Editor Tabs CRUD State
  16: 

  16   */

  54  /**
  55:  * Initial CRUD state
  56: 
  56   */

src/infrastructure/persistence/stores/editor-tabs/index.ts:
  18  /**
  19:  * Combined Editor Tabs Store State
  20: 

  20   */
  21  export type EditorTabsStoreState =
  22:   & EditorTabsCrudState
  23:   & EditorTabsContentState
  24: 
  24    & EditorTabsPositionState;

src/infrastructure/persistence/stores/events/event-status-store.ts:
   16  /**
   17:  * Streaming status state
   18: 

   18   */

   26  /**
   27:  * Tool execution state
   28: 

   28   */

   44  /**
   45:  * Indexing state
   46: 

   46   */

   64  /**
   65:  * Note indexing state
   66: 

   66   */

   78  /**
   79:  * Quiz generation state
   80: 

   80   */

   97  /**
   98:  * Workspace transition state
   99: 

   99   */

  114  /**
  115:  * Event status store state
  116: 

  116   */

  143  /**
  144:  * Create event status store
  145: 
  145   */

src/infrastructure/persistence/stores/filesystem/useFileSnapshotStore.ts:
    1  /**
    2:  * @fileoverview Unified File Snapshot Store
    3:  * @module infrastructure/persistence/stores/filesystem/useFileSnapshotStore
    4: 

    4   * @governance EPIC-CP-1.11

   44  /**
   45:  * Unified File Snapshot Store
   46: 

   46   *

  121  /**
  122:  * Reset the file snapshot store to empty state
  123: 
  123   * Useful for testing or clearing all cache

src/infrastructure/persistence/stores/flashcard/flashcard-db.ts:
   9  /**
  10:  * IndexedDB record types for flashcard persistence
  11: 
  11   *

src/infrastructure/persistence/stores/flashcard/index.ts:
  25  /**
  26:  * Unified flashcard store with CRUD + Filter + Persistence
  27:  * Composed from 3 slices: crud, filter, persistence
  28: 

  28   */

  39  /**
  40:  * Unified flashcard set store with CRUD + Persistence
  41:  * Composed from 2 slices: set-crud, set-persistence
  42: 

  42   */

  53   * Flashcard operations hook
  54:  * Coordinates between flashcard-store and flashcard-set-store
  55: 
  55   * Avoids circular dependencies by injecting stores at call time

src/infrastructure/persistence/stores/flashcard/slices/flashcard-operations-slice.ts:
  12   * Flashcard operations interface
  13:  * Coordinates between flashcard-store and flashcard-set-store
  14: 
  14   */

src/infrastructure/persistence/stores/flashcard/slices/flashcard-set-crud-slice.ts:
  196     * Get cards for a specific flashcard set
  197:    * Cross-store coordination with flashcardStore
  198: 
  198     * 

src/infrastructure/persistence/stores/git/git-branch-slice.ts:
  16  /**
  17:  * Git Branch State
  18: 

  18   */

  47  /**
  48:  * Initial branch state
  49: 
  49   */

src/infrastructure/persistence/stores/git/git-client-slice.ts:
  14  /**
  15:  * Git Client State
  16: 

  16   */

  51  /**
  52:  * Initial client state
  53: 
  53   */

src/infrastructure/persistence/stores/git/git-operations-slice.ts:
  16  /**
  17:  * Git Operations State
  18: 

  18   */

  62  /**
  63:  * Initial operations state
  64: 
  64   */

src/infrastructure/persistence/stores/git/git-status-slice.ts:
  15  /**
  16:  * Git Status State
  17: 

  17   */

  43  /**
  44:  * Initial status state
  45: 
  45   */

src/infrastructure/persistence/stores/git/index.ts:
   18  /**
   19:  * Combined Git Store State
   20: 

   20   */
   21  export type GitStoreState =
   22:   & GitClientState
   23:   & GitStatusState
   24:   & GitBranchState
   25: 

   25    & GitOperationsState;

   86  /**
   87:  * Select loading state
   88: 

   88   */

   91  /**
   92:  * Select committing state
   93: 

   93   */

   96  /**
   97:  * Select branch switching state
   98: 

   98   */

  116  /**
  117:  * Select conflict state
  118: 
  118   */

src/infrastructure/persistence/stores/ide/ide-explorer-slice.ts:
   7   * - expandedPaths: Set of folder paths that are expanded
   8:  * - toggleExpanded: Toggle a folder's expansion state
   9: 

   9   * - setExpandedPaths: Batch set expanded folders

  30    /**
  31:    * Toggle a folder's expanded state
  32: 
  32     *

src/infrastructure/persistence/stores/ide/ide-layout-slice.ts:
  48    /**
  49:    * Set panel collapse state
  50: 
  50     *

src/infrastructure/persistence/stores/ide/ide-project-slice.ts:
  11   * Multi-project support:
  12:  * - Each project has its own IDE state
  13: 

  13   * - Reset clears all slices via cross-slice communication
  14:  * - Future: Load project-specific state from Dexie
  15: 

  15   */

  24    [],
  25:   IDEProjectState
  26: 

  26  > = (set, _get, _api) => ({

  63    /**
  64:    * Reset all IDE state
  65: 
  65     * Called when switching projects or clearing workspace

src/infrastructure/persistence/stores/ide/ide-selectors-slice.ts:
  28    /**
  29:    * Select complete AI context from IDE state
  30: 

  30     *

  36     *
  37:    * @param state - Combined IDE state
  38: 

  38     * @returns AI context object

  60    /**
  61:    * Select minimal file context from IDE state
  62: 

  62     *

  67     *
  68:    * @param state - Combined IDE state
  69: 
  69     * @returns File context object

src/infrastructure/persistence/stores/ide/ide-state-storage.ts:
  20   * - During hydration, read projectId from sessionStorage first
  21:  * - Query ideState by projectId for correct project-scoped restore
  22: 
  22   *

src/infrastructure/persistence/stores/ide/ide-types.ts:
   10   * - Editor State: Monaco file management (open files, active file, scroll position)
   11:  * - Explorer State: File tree expansion state
   12: 

   12   * - Layout State: Panel layouts and visibility

   29   * - title: Tab title (filename)
   30:  * - content: File content for persistence
   31: 

   31   * - dirty: Whether file has unsaved changes

   60  /**
   61:  * Panel layout state
   62: 

   62   * Stores panel sizes for react-resizable-panels

   70  /**
   71:  * IDE Editor State
   72: 

   72   *

   91  /**
   92:  * IDE Explorer State
   93: 

   93   *

   95   * - expandedPaths: Set of folder paths that are expanded
   96:  * - toggleExpanded: Toggle a folder's expansion state
   97: 

   97   * - setExpandedPaths: Batch set expanded folders

  110  /**
  111:  * IDE Layout State
  112: 

  112   *

  131  /**
  132:  * IDE Terminal State
  133: 

  133   *

  146  /**
  147:  * IDE Project State
  148: 

  148   *

  212  /**
  213:  * IDE Selectors State
  214: 

  214   *

  227  /**
  228:  * Combined IDE State
  229: 
  229   *

src/infrastructure/persistence/stores/ide/useIDEStore.ts:
    1  /**
    2:  * @fileoverview Unified IDE Workspace Store
    3:  * @module infrastructure/persistence/stores/ide/useIDEStore
    4: 

    4   * @governance EPIC-CP-1

   12   * - Persist middleware on combined store (not individual slices)
   13:  * - Custom IDE state storage adapter for IndexedDB persistence
   14: 

   14   * - Cross-slice communication via get()

   48  /**
   49:  * Main IDE workspace store with persistence
   50: 

   50   *

  229  /**
  230:  * Reset all IDE state
  231:  * Clears all slices to initial state
  232: 
  232   */

src/infrastructure/persistence/stores/knowledge/knowledge-store.ts:
  2   * @fileoverview Knowledge Store (Main Store - Combined Slices)
  3:  * @module infrastructure/persistence/stores/knowledge/knowledge-store
  4: 
  4   * @governance Epic 53-3 (State Management Consolidation)

src/infrastructure/persistence/stores/knowledge/types.ts:
  77   * @see slices/knowledge-source-crud-slice.ts - Source CRUD state and actions
  78:  * @see slices/knowledge-preview-slice.ts - Preview panel state
  79: 
  79   * @see slices/knowledge-collection-slice.ts - Collection management

src/infrastructure/persistence/stores/notifications/index.ts:
  18  /**
  19:  * Combined Notification Store State
  20: 

  20   */
  21  export type NotificationStoreState =
  22:   & NotificationCrudState
  23:   & NotificationFilterState
  24: 
  24    & NotificationPreferencesState;

src/infrastructure/persistence/stores/notifications/notification-crud-slice.ts:
  14  /**
  15:  * Notification CRUD State
  16: 

  16   */

  55  /**
  56:  * Initial CRUD state
  57: 
  57   */

src/infrastructure/persistence/stores/notifications/notification-preferences-slice.ts:
  13  /**
  14:  * Notification Preferences State
  15: 

  15   */

  49  /**
  50:  * Initial preferences state
  51: 
  51   */

src/infrastructure/persistence/stores/permissions/tool-permission-store.ts:
   1  /**
   2:  * @fileoverview Tool Permission Store
   3:  * @module infrastructure/persistence/stores/permissions/tool-permission-store
   4: 

   4   * @governance ADR-024 State Management Consolidation

  38  /**
  39:  * Tool Permission Store
  40: 

  40   * Refactored to compose slices

  65        /**
  66:        * Partialize - Selective field persistence
  67: 
  67         */

src/infrastructure/persistence/stores/permissions/types.ts:
  30  /**
  31:  * Category approval state
  32: 

  32   * When a category is approved, all tools in that category are auto-approved

  72      /**
  73:      * Whether the store has finished hydrating from persistence
  74: 
  74       */

src/infrastructure/persistence/stores/permissions/slices/permission-actions-slice.ts:
  36      set: (partial: Partial<ToolPermissionState> | ((state: ToolPermissionState) => Partial<ToolPermissionState>)) => void,
  37:     get: () => ToolPermissionState
  38: 
  38  ): PermissionActions => ({

src/infrastructure/persistence/stores/project/index.ts:
  128  /**
  129:  * Facade: List projects with permission state
  130: 
  130   *

src/infrastructure/persistence/stores/project/migrate-bindings.ts:
  111   * 1. Check if migration already ran (return early if true)
  112:  * 2. Get all projects from store
  113: 
  113   * 3. Identify projects with disabled workspaces

src/infrastructure/persistence/stores/project/project-crud-slice.ts:
  61  /**
  62:  * Convert Zustand Project to Dexie ProjectRecord for persistence
  63: 
  63   * PERSIST-S002: Added workspaceId for cross-workspace isolation

src/infrastructure/persistence/stores/project/project-types.ts:
  160   * FSA-010: Permission state is now sourced from FSAHandleRecord via handlePersistenceService
  161:  * All methods are async since they query Dexie for permission state
  162: 
  162   */

src/infrastructure/persistence/stores/project/useProjectStore.ts:
    1  /**
    2:  * @fileoverview Unified Project Store
    3:  * @module infrastructure/persistence/stores/project/useProjectStore
    4: 

    4   * @governance EPIC-CP-1

    8   * - Each slice is <120 lines (single responsibility principle)
    9:  * - Dexie IndexedDB persistence
   10: 

   10   * - Cross-slice communication via get()

   44  /**
   45:  * Unified Project Store
   46: 

   46   *

  130  /**
  131:  * Reset the project store to empty state
  132: 
  132   * Useful for testing or logout

src/infrastructure/persistence/stores/providers/index.ts:
  13   *
  14:  * @module providers/index
  15: 
  15   * @story AC-1.6 - Create provider slices

src/infrastructure/persistence/stores/providers/migrate-api-keys-to-vault.ts:
   28   * 4. Verify migration success
   29:  * 5. Clean up old apiKey fields from persisted state
   30: 

   30   * 6. Rollback on any error

   95   * 2. Migrates each provider's API key to credential vault
   96:  * 3. Updates provider state
   97: 

   97   * 4. Verifies migration

  101   * @param activeProviderId - Active provider ID
  102:  * @param updateProvider - Callback to update provider state
  103: 

  103   * @returns Migration result with statistics

  286   *
  287:  * @param updateProvider - Callback to update provider state
  288: 
  288   * @returns True if rollback succeeded

src/infrastructure/persistence/stores/providers/migration-backup.ts:
  122    /**
  123:    * Create 3-layer backups of provider state
  124: 

  124     *
  125:    * @param providers - Current provider state
  126: 

  126     * @param activeProviderId - Active provider ID

  222     *
  223:    * @param providers - Current provider state
  224: 
  224     * @param activeProviderId - Active provider ID

src/infrastructure/persistence/stores/providers/provider-utils-slice.ts:
   9   * Key Design Decisions:
  10:  * - Pure utilities with minimal state
  11: 
  11   * - No external dependencies

src/infrastructure/persistence/stores/providers/types.ts:
  49  /**
  50:  * Provider State
  51: 
  51   *

src/infrastructure/persistence/stores/providers/use-migration-state.ts:
  12   *
  13:  * @module providers/use-migration-state
  14: 

  14   * @story 3.2 Phase 2.1 - Add loading states to UI

  70  /**
  71:  * Migration state store
  72: 
  72   *

src/infrastructure/persistence/stores/providers/credentials/crud-slice.ts:
    7   * Key Design Decisions:
    8:  * - Owns keyMetadata state
    9: 

    9   * - Validates keys before/after storage using Zod schemas

   75   * - get().providers - Access provider configs for metadata updates
   76:  * - get().updateProvider - Sync hasApiKey flag with vault state
   77: 

   77   * - get().{vault methods} - Access vault-slice for encryption/decryption

  115     * @param providerId - Provider ID to store key for
  116:    * @param apiKey - Plain text API key to encrypt and store
  117: 

  117     * @throws Error if validation fails, vault unavailable, or storage fails

  273    /**
  274:    * Validate API key by checking vault state
  275: 

  275     *

  345    /**
  346:    * Sync hasApiKey flags with actual vault state
  347: 
  347     *

src/infrastructure/persistence/stores/providers/credentials/vault-slice.ts:
  59     * @param providerId - Provider ID to store key for
  60:    * @param apiKey - Plain text API key to encrypt and store
  61: 
  61     * @throws Error if vault unavailable or storage fails

src/infrastructure/persistence/stores/rag/rag-store.ts:
  2   * @fileoverview RAG Store - Consolidated State Management
  3:  * @module infrastructure/persistence/stores/rag/rag-store
  4: 
  4   * @governance EPIC-7-1

src/infrastructure/persistence/stores/study/quiz-store.ts:
  2   * @fileoverview Quiz store with Dexie persistence and Zustand state management
  3:  * @module infrastructure/persistence/stores/study/quiz-store
  4: 
  4   * @governance ADR-024 State Management Consolidation, Epic 53

src/infrastructure/persistence/stores/study/quiz/quiz-db.ts:
  41  /**
  42:  * Dexie database for quiz persistence
  43: 
  43   */

src/infrastructure/persistence/stores/study/quiz/slices/question-management-slice.ts:
  13      set: (partial: Partial<QuizState> | ((state: QuizState) => Partial<QuizState>)) => void,
  14:     _get: () => QuizState
  15: 
  15  ): QuestionManagementSlice => ({

src/infrastructure/persistence/stores/study/quiz/slices/quiz-management-slice.ts:
  14      set: (partial: Partial<QuizState> | ((state: QuizState) => Partial<QuizState>)) => void,
  15:     _get: () => QuizState
  16: 
  16  ): QuizManagementSlice => ({

src/infrastructure/persistence/stores/study/slices/study-database-slice.ts:
  37  /**
  38:  * Study session database class extending Dexie
  39: 
  39   */

src/infrastructure/persistence/stores/workspace/unified-workspace-provider.tsx:
  13   * - useCornerstoneStores.ts: Aggregates 5 Zustand stores
  14:  * - useWorkspaceFileSystem.ts: File system operations and state
  15: 
  15   * - useWorkspaceSwitching.ts: Workspace switching logic

src/infrastructure/persistence/stores/workspace/useWorkspaceFileSystem.ts:
  4   * @governance EPIC-CC-01 - Project Space Foundation
  5:  * @story PS-01 - Split useWorkspaceFileSystem God Store
  6: 
  6   *

src/infrastructure/persistence/stores/workspace/workspace-context.ts:
  88   *
  89:  * Provides access to all 5 cornerstones + workspace state
  90: 
  90   */

src/infrastructure/persistence/stores/workspace/workspace-provider-slice.ts:
  60  /**
  61:  * Create the workspace provider preferences store
  62: 
  62   *

src/infrastructure/persistence/stores/workspace/workspace-store.ts:
   2   * @fileoverview Workspace State Management
   3:  * @module lib/state/workspace-store
   4: 

   4   *

  72  /**
  73:  * Workspace store with persistence
  74: 

  74   *
  75   * Architecture:
  76:  * - Single source of truth for workspace state
  77: 
  77   * - Emits events on workspace change

src/infrastructure/persistence/stores/workspace/slices/index.ts:
  4   * @governance EPIC-CC-01 - Project Space Foundation
  5:  * @story PS-01 - Split useWorkspaceFileSystem God Store
  6: 
  6   *

src/infrastructure/persistence/stores/workspace/slices/use-file-loader-slice.ts:
  4   * @governance EPIC-CC-01 - Project Space Foundation
  5:  * @story PS-01 - Split useWorkspaceFileSystem God Store
  6: 

  6   *
  7   * Manages:
  8:  * - Project loading/hydration from Dexie
  9: 
  9   * - Permission state detection

src/infrastructure/persistence/stores/workspace/slices/use-file-ops-slice.ts:
  4   * @governance EPIC-CC-01 - Project Space Foundation
  5:  * @story PS-01 - Split useWorkspaceFileSystem God Store
  6: 
  6   *

src/infrastructure/persistence/stores/workspace/slices/use-storage-adapter-slice.ts:
  4   * @governance EPIC-CC-01 - Project Space Foundation
  5:  * @story PS-01 - Split useWorkspaceFileSystem God Store
  6: 
  6   *

src/infrastructure/persistence/stores/workspace/slices/use-vfs-sync-slice.ts:
  81  /**
  82:  * Create VFS sync store
  83: 
  83   */

src/infrastructure/sync/adapters/fsa-permission-manager.ts:
  96   * @param adapterName - Name of the adapter
  97:  * @param permissionGranted - Current permission state
  98: 
  98   * @param directoryHandle - Directory handle

src/infrastructure/sync/core/sync-core-types.ts:
  51  /**
  52:  * Individual file sync state
  53: 
  53   */

src/infrastructure/sync/core/sync-engine-state.ts:
   2   * @fileoverview Sync Engine State - State management for SyncEngine
   3:  * @module infrastructure/sync/core/sync-engine-state
   4: 

   4   *

  23  /**
  24:  * Create initial sync engine state
  25: 
  25   */

src/infrastructure/sync/core/sync-engine-types.ts:
  39  /**
  40:  * Current sync state
  41: 
  41   */

src/infrastructure/sync/workspace-bindings/base.ts:
  115    /**
  116:    * Get sync engine state
  117: 
  117     */

src/infrastructure/sync/workspace-bindings/study.ts:
  25    /**
  26:    * Study workspace exclusions for SRS state
  27: 
  27     */

src/infrastructure/sync/workspace-services/knowledge-file-sync-service.ts:
  30      createKnowledgeFileSyncService,
  31:     KnowledgeSourceStore
  32: 
  32  } from './knowledge-sync';

src/infrastructure/sync/workspace-services/knowledge-sync/knowledge-source-store.ts:
   1  /**
   2:  * @fileoverview Knowledge Source Store
   3:  * @module infrastructure/sync/workspace-services/knowledge-sync/knowledge-source-store
   4: 

   4   *

  13   * In-memory source storage (simplified implementation)
  14:  * In production, this would use IndexedDB via the knowledge store
  15: 
  15   */

src/infrastructure/sync/workspace-services/notes/index.ts:
  25      type NotesFileSyncDependencies,
  26:     type NoteSyncStore
  27: 
  27  } from './notes-file-sync-core';

src/infrastructure/sync/workspace-services/notes/note-crud-operations.ts:
  59      fileAdapter: FileAdapter,
  60:     noteStore: NoteStore
  61: 
  61  ): Promise<void> {

src/infrastructure/sync/workspace-services/notes/note-folder-bridge.ts:
  59          private localAdapter: LocalFSAdapter,
  60:         private noteStore: NoteSyncStore
  61: 
  61      ) { }

src/infrastructure/sync/workspace-services/notes/notes-file-sync-core.ts:
   69  /**
   70:  * Notes File Sync Service State
   71: 

   71   *

   89   *
   90:  * @param state - Service state
   91: 

   91   * @param event - File change event

  111   *
  112:  * @param state - Service state
  113: 

  113   * @throws Error if service is disposed

  126   *
  127:  * @param state - Service state
  128: 
  128   * @param deps - Service dependencies

src/infrastructure/sync/workspace-services/notes/notes-file-sync-service.ts:
  25      type NotesFileSyncState,
  26:     type NoteSyncStore
  27: 
  27  } from './notes-file-sync-core';

src/infrastructure/ui/AgentWorkspaceSync.tsx:
   8   *
   9:  * S-009: Fix Agent Selection Persistence
  10: 
  10   *

src/lib/agent/agent-io.ts:
  56  /**
  57:  * Convert exported agent data to AgentData format for store
  58: 
  58   * Handles field mapping and type conversions

src/lib/agent/deep-think/deep-think-hook.ts:
  196    /**
  197:    * Reset state
  198: 
  198     */

src/lib/agent/deep-think/deep-think-types.ts:
  127    /**
  128:    * Reset state
  129: 
  129     */

src/lib/agent/hooks/use-voice-input.ts:
  18  /**
  19:  * Voice input hook state
  20: 

  20   */

  77   * @param options - Voice input configuration
  78:  * @returns Voice input controls and state
  79: 
  79   *

src/lib/agent/hooks/use-voice-output.ts:
  22  /**
  23:  * Voice output hook state
  24: 

  24   */

  95   * @param options - Voice output configuration
  96:  * @returns Voice output controls and state
  97: 
  97   *

src/lib/agent/memory/memory-index.ts:
    2   * @fileoverview Memory Index for Semantic Search
    3:  * @module lib/agent/memory/memory-index
    4: 

    4   * @governance EPIC-31-1

   94  /**
   95:  * Initialize Orama memory index
   96: 

   96   *

  142   *
  143:  * @param conversation - Conversation memory to index
  144: 

  144   * @returns Promise resolving when indexed

  180   *
  181:  * @param conversations - Array of conversations to index
  182: 

  182   * @returns Promise resolving when all indexed

  295  /**
  296:  * Delete conversation from index
  297: 
  297   *

src/lib/agent/providers/credential-vault.ts:
  393       * @param providerId - Unique provider identifier
  394:      * @param apiKey - Plain text API key to encrypt and store
  395: 
  395       * @throws Error if vault not initialized or storage fails

src/lib/agent/tool-permission/tool-permission-queries.ts:
  100  /**
  101:  * Get current YOLO mode state
  102: 

  102   *

  113   * @param context - Manager context for event emission
  114:  * @returns New YOLO mode state
  115: 

  115   */

  130   * @param context - Manager context for event emission
  131:  * @returns New YOLO mode state
  132: 
  132   */

src/lib/agent/tools/retry-queue.ts:
   36  /**
   37:  * Retry queue item for tracking retry state
   38: 

   38   */

  492      /**
  493:      * Serialize queue for persistence
  494: 

  494       */

  499      /**
  500:      * Deserialize queue from persistence
  501: 
  501       */

src/lib/agent/tools/tool-error.ts:
  104    /**
  105:    * Serialize to JSON for logging/persistence
  106: 
  106     */

src/lib/agent/tools/composite/index.ts:
  1  /**
  2:  * @fileoverview Composite Tools Index
  3: 
  3   * @module lib/agent/tools/composite

src/lib/analytics/performance-monitor.ts:
  374    /**
  375:    * Reset monitoring state
  376: 
  376     */

src/lib/canvas/linkage-analyzer.ts:
  413    /**
  414:    * Batch analyze multiple canvas states
  415: 
  415     *

src/lib/canvas/types.ts:
  147  /**
  148:  * Multi-canvas store state
  149: 
  149   */

src/lib/collaboration/cursor-tracker.ts:
  13  /**
  14:  * Remote cursor state
  15: 
  15   */

src/lib/command-palette/fuzzy-search.tsx:
  236    /**
  237:    * Build search index
  238: 

  238     */

  269    /**
  270:    * Search using index
  271: 

  271     */

  320    /**
  321:    * Update items and rebuild index
  322: 
  322     */

src/lib/diff/index.ts:
  1  /**
  2:  * @fileoverview Diff Library Index
  3: 
  3   * @module lib/diff

src/lib/editor/tab-persistence.ts:
  6   *
  7:  * @module lib/editor/tab-persistence
  8: 
  8   * @story S-030 - Multi-Tab File Editor

src/lib/events/use-conversation-persistence.ts:
   2   * @fileoverview Conversation Persistence Hook
   3:  * @module lib/events/use-conversation-persistence
   4: 

   4   * @story E1-6 - Conversation Persistence Across Workspaces

  83   * @param options - Hook options
  84:  * @returns Methods for conversation persistence
  85: 

  85   */

  93     * Save current conversation to IndexedDB
  94:    * This bypasses the debounce and ensures immediate persistence
  95: 
  95     */

src/lib/filesystem/file-snapshot-store.ts:
   2   * @fileoverview File Snapshot Store - Facade (Major Architecture Migration)
   3:  * @module lib/filesystem/file-snapshot-store
   4:  * @governance Story WB-2: File Snapshot Store
   5: 

   5   *

  14   *
  15:  * AFTER (Zustand): Zustand store with 4 slices + Dexie persistence
  16: 
  16   * - Store: useFileSnapshotStore with slice composition

src/lib/filesystem/project-context-provider.ts:
  12   * - Save snapshots after FSA reads
  13:  * - Lazy content loading via FileSnapshotStore
  14: 
  14   *

src/lib/filesystem/file-snapshot-store/file-snapshot-store-refactored.ts:
  60  
  61: export interface FileSnapshotStore
  62: 

  62    extends SnapshotCacheSlice,

  75   * - Slice composition for single responsibility
  76:  * - Persist middleware for IndexedDB via Dexie
  77: 
  77   * - Backward compatible facade for gradual migration

src/lib/filesystem/file-snapshot-store/types.ts:
  1  /**
  2:  * @fileoverview Shared types for file snapshot store
  3: 
  3   * @module filesystem/file-snapshot-store/types

src/lib/formatter/code-formatter.ts:
  118        rangeOptions.startIndex,
  119:       rangeOptions.endIndex
  120: 
  120      );

src/lib/hooks/use-theme.ts:
   6   * - Theme mode tracking (light/dark/system)
   7:  * - LocalStorage persistence
   8: 

   8   * - System preference detection

  81  /**
  82:  * Custom hook for managing theme state
  83: 
  83   *

src/lib/keyboard/index.ts:
  1  /**
  2:  * @fileoverview Keyboard Module Index
  3: 
  3   * @module lib/keyboard

src/lib/knowledge/pdf-parser.ts:
  214  /**
  215:  * React hook for PDF parsing with loading state
  216: 
  216   */

src/lib/knowledge/relevancy-scorer.ts:
  260    /**
  261:    * Remove document from store
  262: 
  262     *

src/lib/knowledge/types.ts:
  113  /**
  114:  * Dexie store types for IndexedDB persistence
  115: 
  115   */

src/lib/knowledge/graph/graph-persistence.ts:
    1  /**
    2:  * @fileoverview Graph Persistence
    3:  * @module lib/knowledge/graph/graph-persistence
    4: 

    4   * @governance EPIC-38, PHASE-7

  119    /**
  120:    * Load graph from persistence
  121: 
  121     */

src/lib/notes/note-indexer.ts:
  128       * 
  129:      * @param note - Note record to index
  130: 

  130       * @param projectId - Project ID (for index isolation)

  240      /**
  241:      * Remove a note from the index
  242: 

  242       * 

  289       * 
  290:      * @param notes - All notes to index
  291: 

  291       * @param projectId - Project ID

  328      /**
  329:      * Get all index states
  330: 
  330       */

src/lib/notes/note-navigation-store.ts:
   2   * @fileoverview Note Navigation Store for Tree Structure
   3:  * @module lib/notes/note-navigation-store
   4: 

   4   * @governance EPIC-26-5, 45-05

  74  /**
  75:  * Create note navigation store with persistence
  76: 
  76   */

src/lib/notes/note-store-refactored.ts:
  15   * Follows December 2025 Zustand patterns:
  16:  * - Slice pattern with single bounded store
  17: 

  17   * - Individual selectors (no infinite loops)

  39  /**
  40:  * Note Store - Single Bounded Store
  41: 
  41   *

src/lib/notes/note-store.ts:
  2   * @fileoverview Note Store Facade (Backward Compatibility)
  3:  * @module lib/notes/note-store
  4: 

  4   * @governance EPIC-26-1
  5   *
  6:  * FACADE PATTERN - Redirects to refactored store
  7: 
  7   *

src/lib/notes/prompt-history-store.ts:
  2   * @fileoverview Prompt History Store - Track prompt usage and analytics
  3:  * @module lib/notes/prompt-history-store
  4: 
  4   * @story 43-06: Prompt History/Analytics

src/lib/notes/prompt-suggestion-store.ts:
  1  /**
  2:  * @fileoverview AI Prompt Suggestion Store
  3:  * @module lib/notes/prompt-suggestion-store
  4: 
  4   * @created 2026-01-13

src/lib/notes/saved-blocks-store.ts:
  2   * @fileoverview Saved Blocks Store and Management
  3:  * @module lib/notes/saved-blocks-store
  4: 
  4   * @governance UX-13

src/lib/notes/slash-command-store.ts:
  2   * @fileoverview Custom Slash Commands Store and Management
  3:  * @module lib/notes/slash-command-store
  4: 
  4   * @created 2026-01-08

src/lib/notes/types-embedding.ts:
   58  /**
   59:  * Document schema for Orama note index
   60: 

   60   */

  240  /**
  241:  * Generate document ID for Orama index
  242: 

  242   * 
  243   * @param noteId - Note ID
  244:  * @param chunkIndex - Chunk index
  245: 
  245   * @returns Document ID: noteId-chunk-{index}

src/lib/notes/types.ts:
  16  /**
  17:  * Note record for Dexie persistence
  18: 

  18   * Stores BlockNote JSON blocks with hierarchical organization.

  87  /**
  88:  * Note editor state
  89: 
  89   */

src/lib/notes/use-streaming-ai.ts:
  306      /**
  307:      * Reset state
  308: 
  308       */

src/lib/notes/slices/note-indexing-slice.ts:
   7   * - triggerIndexing: Trigger background note indexing
   8:  * - removeFromIndex: Remove note from search index
   9: 

   9   * - Indexing state tracking (indexingNoteIds)

  38       *
  39:      * @param noteId - Note ID to index
  40: 

  40       */

  92      /**
  93:      * Remove note from search index
  94: 

  94       * Called after note deletion
  95       *
  96:      * @param noteId - Note ID to remove from index
  97: 
  97       * @param projectId - Project ID (optional, for logging)

src/lib/notifications/types.ts:
  89  /**
  90:  * Notification Store State
  91: 
  91   */

src/lib/persistence/db.ts:
  81  /**
  82:  * Wrapper that provides idb-like API on top of Dexie
  83: 
  83   * This allows existing code to work without modification.

src/lib/plugins/plugin-manager.ts:
  508    /**
  509:    * Get plugins by state
  510: 
  510     */

src/lib/plugins/types.ts:
   8   * - Extension point types
   9:  * - Plugin lifecycle states
  10: 

  10   *

  37  /**
  38:  * Plugin lifecycle states
  39: 
  39   */

src/lib/rag/citation-types.ts:
  142  /**
  143:  * Citation filter state
  144: 
  144   */

src/lib/rag/incremental-indexing-service.ts:
   9   * - Only embeds new/changed chunks
  10:  * - Handles file deletions by removing chunks from index
  11: 
  11   */

src/lib/rag/live-api-types.ts:
   46  /**
   47:  * WebSocket connection state
   48: 

   48   */

  138  /**
  139:  * Voice mode store state
  140: 
  140   */

src/lib/rag/live-api-websocket.ts:
  97    /**
  98:    * Get current connection state
  99: 
  99     */

src/lib/rag/orama-index.ts:
    2   * @fileoverview Orama Index Management
    3:  * @module lib/rag/orama-index
    4: 

    4   * @governance EPIC-7-1

   13   * - Full-text and vector hybrid search
   14:  * - IndexedDB persistence using @orama/plugin-data-persistence
   15: 

   15   * - Source attribution in search results

   68   * @param config - Index configuration options
   69:  * @returns Promise resolving to created Orama index
   70: 

   70   *

  235   * @param projectId - Project ID
  236:  * @param document - Document to index
  237: 

  237   * @returns Promise resolving when indexed

  312   * @param sourceId - Source ID
  313:  * @param content - Full content to chunk and index
  314: 

  314   * @param options - Chunking options

  418  /**
  419:  * Remove all documents for a source from the index
  420: 

  420   *

  570   * @param projectId - Project ID
  571:  * @param sources - Array of sources to index
  572: 
  572   * @returns Promise resolving to number of documents indexed

src/lib/rag/pagination.ts:
  293      /**
  294:      * Reset pagination to initial state
  295: 

  295       */

  403      /**
  404:      * Reset infinite scroll state
  405: 
  405       */

src/lib/rag/sync-subscription-service.ts:
  144    /**
  145:    * Get current queue state
  146: 
  146     */

src/lib/rag/types.ts:
  12  /**
  13:  * Document schema for Orama index
  14: 

  14   * Supports full-text search with optional vector embeddings

  94  /**
  95:  * Index metadata for persistence
  96: 
  96   */

src/lib/rag/chunk-strategies/fixed-size-chunker.ts:
  190                      maxChunkSize,
  191:                     chunkIndex
  192: 
  192                  );

src/lib/scheduler/built-in-tasks.ts:
  54  /**
  55:  * Index update task: Rebuilds search index
  56: 
  56   */

src/lib/scheduler/task-scheduler.ts:
   7   * - Background execution via Web Workers
   8:  * - IndexedDB persistence
   9: 

   9   * - Battery awareness

  83    /**
  84:    * Initialize IndexedDB for persistence
  85: 
  85     */

src/lib/search/search-indexer.ts:
  128    /**
  129:    * Add or update a document in the index
  130: 

  130     */

  161    /**
  162:    * Remove document from index
  163: 

  163     */

  226    /**
  227:    * Clear entire index
  228: 

  228     */

  304    /**
  305:    * Find candidate documents using inverted index
  306: 
  306     */

src/lib/settings/settings-importer.ts:
   85   * @param jsonString - JSON string data
   86:  * @param currentProjects - Current projects from store
   87:  * @param currentProviders - Current providers from store
   88: 

   88   * @param options - Import options

  201   * @param file - File object
  202:  * @param currentProjects - Current projects from store
  203:  * @param currentProviders - Current providers from store
  204: 

  204   * @param options - Import options

  226   *
  227:  * @param currentProjects - Current projects from store
  228:  * @param currentProviders - Current providers from store
  229: 

  229   * @param options - Import options

  255   * @param url - URL to fetch
  256:  * @param currentProjects - Current projects from store
  257:  * @param currentProviders - Current providers from store
  258: 

  258   * @param options - Import options

  287   * @param backupJson - Backup JSON string
  288:  * @param currentProjects - Current projects from store
  289:  * @param currentProviders - Current providers from store
  290: 
  290   * @returns Import result

src/lib/snippets/snippet-store.ts:
  2   * @fileoverview Code Snippet Store - Facade (Major Refactoring)
  3:  * @module lib/snippets/snippet-store
  4: 
  4   * @governance S-031

src/lib/snippets/snippet-store/snippet-filtering-slice.ts:
  1  /**
  2:  * @fileoverview Snippet Filtering Slice - Search, selection, and filter state
  3: 
  3   * @module snippets/snippet-store/snippet-filtering-slice

src/lib/snippets/snippet-store/snippet-store-refactored.ts:
   6   * - snippet-crud-slice.ts (195 lines) - Core CRUD operations
   7:  * - snippet-filtering-slice.ts (115 lines) - Search + filter state
   8: 

   8   * - snippet-export-slice.ts (110 lines) - Export/import operations

  30  
  31: export interface SnippetStore
  32: 
  32    extends SnippetCrudSlice,

src/lib/snippets/snippet-store/snippet-utils-slice.ts:
  14   * Parse snippet placeholders from code
  15:  * Pure function - can be used standalone or via store
  16: 
  16   */

src/lib/study/quiz-types.ts:
  125  /**
  126:  * Dexie store types for IndexedDB persistence
  127: 
  127   */

src/lib/study/srs-types.ts:
  33  /**
  34:  * Study session state
  35: 
  35   */

src/lib/terminal/index.ts:
  1  /**
  2:  * @fileoverview Terminal Module Index
  3: 
  3   * @module lib/terminal

src/lib/terminal/terminal-emulator.ts:
   45  /**
   46:  * Terminal session state
   47: 

   47   */

  430    /**
  431:    * Reset terminal state
  432: 
  432     * @param sessionId - Session identifier

src/lib/voice/gemini-transcription-service.ts:
   13  /**
   14:  * Transcription session state
   15: 

   15   */

   83    /**
   84:    * Get current state
   85: 

   85     */

  328    /**
  329:    * Update state
  330: 
  330     */

src/lib/voice/use-voice-recording.ts:
  29  /**
  30:  * Voice recording state
  31: 
  31   */

src/lib/webcontainer/crash-recovery.ts:
   77    /**
   78:    * Get current recovery state
   79: 

   79     */

  241    /**
  242:    * Reset manager to initial state
  243: 
  243     */

src/lib/webcontainer/__tests__/webcontainer.mock.ts:
  168   * Reset the manager singleton state between tests
  169:  * This needs to be called in beforeEach to ensure clean state
  170: 
  170   */

src/lib/workflow/types.ts:
  241  /**
  242:  * Workflow execution state
  243: 
  243   */

src/lib/workflow/builder/types.ts:
  110  /**
  111:  * Workflow builder state
  112: 
  112   */

src/lib/workflow/builder/workflow-builder-store-refactored.ts:
  32  
  33: export interface WorkflowBuilderStore
  34: 
  34      extends WorkflowCrudState,

src/lib/workflow/builder/workflow-builder-store.ts:
   2   * @fileoverview Workflow Builder Store (FACADE - Deprecated)
   3:  * @module lib/workflow/builder/workflow-builder-store
   4: 

   4   * @governance EPIC-E4-5, EPIC-E4-7

  23   * - workflow-validation-slice.ts (74 lines) - Validation logic
  24:  * - workflow-persistence-slice.ts (133 lines) - IndexedDB persistence
  25: 
  25   * - workflow-utilities-slice.ts (65 lines) - Helper functions

src/lib/workflow/executor/workflow-executor.ts:
  196       * @param config - Execution configuration
  197:      * @returns Final execution state
  198: 

  198       */

  314      /**
  315:      * Stop execution and reset state
  316: 

  316       */

  704   * @param config - Execution configuration
  705:  * @returns Final execution state
  706: 
  706   */

src/lib/workspace/fsa-persistence.ts:
  2   * @fileoverview FSA Folder Picker & Persistence (Phase 1)
  3:  * @module lib/workspace/fsa-persistence
  4: 
  4   *

src/lib/workspace/temp-project.ts:
  73   * - ONE temp project per session (reuses existing if found)
  74:  * - Project persists in IndexedDB via project store
  75: 
  75   */

src/lib/workspace/threads-store.ts:
  2   * @fileoverview Thread Persistence - Dexie-backed thread storage
  3:  * @module lib/workspace/thread-store
  4: 
  4   * @governance MVP-2

src/lib/workspace/useUnifiedProjectState.ts:
  2   * @fileoverview Unified Project State Hook
  3:  * @module lib/workspace/useUnifiedProjectState
  4: 
  4   * @governance EPIC-45 Story 45-03

src/lib/workspace/workspace-access-helper.tsx:
   80  /**
   81:  * Workspace access state
   82: 

   82   */

  373   * 2. Projects exist but workspace not enabled
  374:  * 3. Loading state
  375: 
  375   */

src/lib/workspace/workspace-transition-manager.ts:
  34   * - Emit coordinated events
  35:  * - Manage transition state
  36: 

  36   */

  62     * Coordinates:
  63:    * 1. Save current state
  64:    * 2. Update workspace store
  65: 
  65     * 3. Filter agents for new workspace

src/lib/workspace/file-sync-status-store/file-sync-status-store-refactored.ts:
  40  
  41: export interface FileSyncStatusStore
  42: 
  42    extends FileStatusSlice,

src/lib/workspace/file-sync-status-store/index.ts:
  1  /**
  2:  * @fileoverview Barrel export for file-sync-status-store
  3:  * @module workspace/file-sync-status-store
  4: 
  4   */

src/lib/workspace/file-sync-status-store/types.ts:
  1  /**
  2:  * @fileoverview Shared types for file sync status store
  3: 
  3   * @module workspace/file-sync-status-store/types

src/lib/workspace/hooks/useWorkspaceActions.ts:
  264       *
  265:      * FSA-010: Permission state updated in FSAHandleRecord, not in Project.lastKnownPermissionState
  266: 
  266       */

src/lib/workspace/hooks/useWorkspaceState.ts:
  1  /**
  2:  * @module lib/workspace/hooks/useWorkspaceState
  3: 
  3   */

src/presentation/components/about/projects/ViaGentCard.tsx:
  157                  'h-2 rounded-full transition-all',
  158:                 index === activeFeatureIndex
  159: 
  159                    ? 'w-8 bg-primary'

src/presentation/components/agent/AgentWorkspaceBindingConfig.tsx:
  10   * - Accessibility: ARIA labels and keyboard navigation
  11:  * - Reactive updates via Zustand store
  12: 
  12   *

src/presentation/components/agent/AgentWorkspaceSwitchingFeedback.tsx:
  10   * - Agent reselection notification
  11:  * - Transition progress states
  12: 

  12   * - Accessibility: ARIA live regions

  61  /**
  62:  * Transition state
  63: 
  63   */

src/presentation/components/agent/ApiKeyInputSection.tsx:
  21  /**
  22:  * Connection status states
  23: 
  23   */

src/presentation/components/agent/ModelFetchProgress.tsx:
  23  /**
  24:  * Fetch state
  25: 

  25   */

  88    /**
  89:    * Render based on state
  90: 
  90     */

src/presentation/components/agent/WorkspacePermissionManager.tsx:
  154    /**
  155:    * Save changes to store
  156: 

  156     */

  168    /**
  169:    * Reset changes to agent state
  170: 
  170     */

src/presentation/components/agent/hooks/useAgentFormValidation.ts:
  27  /**
  28:  * Agent form validation state
  29: 
  29   */

src/presentation/components/agent/ToolTrustLevels/hooks/useToolTrustLevels.ts:
  11   * - Custom hooks for business logic
  12:  * - LocalStorage persistence
  13: 
  13   * - Callback stability

src/presentation/components/agent/WorkspacePermissions/ToolPermissionRow.tsx:
  41      onToggle,
  42:     index
  43: 
  43  }: ToolPermissionRowProps) {

src/presentation/components/canvas/EnhancedLinkageVisualization.tsx:
  236              className={`h-1 flex-1 rounded-full transition-colors ${
  237:               index === currentIndex
  238: 

  238                  ? 'bg-primary'
  239:                 : index < currentIndex
  240: 
  240                  ? 'bg-primary/30'

src/presentation/components/chat/ChatExportControls.tsx:
  14   * - Keyboard accessible
  15:  * - Loading states
  16: 
  16   * - Toast notifications

src/presentation/components/chat/ChatInputControls.tsx:
  54      /** Voice recording state */
  55:     voiceRecording: UseVoiceRecordingState
  56: 
  56      /** Voice button click handler */

src/presentation/components/chat/ExpandableChatPanel.tsx:
  51   * - Toggle between collapsed (30%) and expanded (60%)
  52:  * - Arrow indicator showing expansion state
  53: 
  53   * - Drag handle for custom sizing

src/presentation/components/chat/FileAttachmentInput.tsx:
  360        {imagePreview && (
  361:         <ImagePreviewDialogWithState
  362: 
  362            isOpen={!!imagePreview}

src/presentation/components/chat/NoteReferencePicker.tsx:
  170                                              className={`group relative flex cursor-pointer select-none items-center gap-3 px-3 py-3 text-sm outline-none ${
  171:                                                 index === selectedIndex
  172: 
  172                                                      ? 'bg-accent'

src/presentation/components/chat/ToolProgressIndicator.tsx:
  173  /**
  174:  * Hook for managing tool progress state
  175: 
  175   */

src/presentation/components/chat/WorkflowBuilder.tsx:
  77  
  78:     const paletteItem = useWorkflowBuilderStore
  79: 
  79          .getState()

src/presentation/components/chat/workflow/WorkflowCanvas.tsx:
  91  
  92:     const paletteItem = useWorkflowBuilderStore
  93: 
  93          .getState()

src/presentation/components/common/ErrorBoundary.tsx:
  22  /**
  23:  * Error Boundary State
  24: 

  24   */

  83              return (
  84:                 <ErrorState
  85: 
  85                      error={this.state.error?.message || 'Unknown error'}

src/presentation/components/common/hooks/useUnsavedChangesWarning.ts:
   8   * @December2025Patterns
   9:  * - Reusable across all forms with unsaved state
  10: 
  10   * - Type-safe with proper TypeScript interfaces

src/presentation/components/diff/index.ts:
  1  /**
  2:  * @fileoverview Diff Components Index
  3: 
  3   * @module components/diff

src/presentation/components/editor/index.ts:
  1  /**
  2:  * Editor Components Index
  3: 
  3   *

src/presentation/components/error/ErrorBoundary.tsx:
  29  /**
  30:  * Error Boundary State
  31: 
  31   */

src/presentation/components/hub/ProjectPickerDialog.tsx:
    3   * @module presentation/components/hub/ProjectPickerDialog
    4:  * @governance Story UJ-000: ProjectPickerDialog & Empty States
    5: 

    5   * @created 2026-01-06T04:00:00+07:00

  102   * - Navigates to /$workspace/$projectId on selection
  103:  * - "Create Project" button in empty state
  104: 
  104   *

src/presentation/components/hub/RecentProjectsSection.tsx:
  31   * - File directory style table (Name, Status, Last Modified, Size)
  32:  * - Loading skeleton state
  33: 

  33   * - Empty state with CTA

  81          // Empty state
  82:         <EmptyState
  83: 
  83            variant="no-projects"

src/presentation/components/hub/useProjectSearch.ts:
  41   * @param projects - Array of projects to search
  42:  * @param initialOpenState - Initial command palette open state
  43: 
  43   * @returns Search state and handlers

src/presentation/components/hub/WorkspaceBindingToggle.tsx:
  11   * - Single workspace toggle (vs. full dialog)
  12:  * - Instant state update via store
  13: 
  13   * - Visual feedback (enabled/disabled states)

src/presentation/components/hub/WorkspacePieChart.tsx:
  58   * - Icons in legend
  59:  * - Loading state
  60: 
  60   *

src/presentation/components/ide/IconSidebar.tsx:
  22   * - Keyboard shortcut support (Ctrl+B to toggle)
  23:  * - LocalStorage persistence
  24: 
  24   * - Smooth animations

src/presentation/components/ide/IDEMobileLayout.tsx:
  48  /**
  49:  * Hook for managing mobile panel state with localStorage persistence
  50: 
  50   */

src/presentation/components/ide/SyncStatusPanel.tsx:
  55  /**
  56:  * Sync queue state
  57: 
  57   */

src/presentation/components/ide/FileTree/FileTree.tsx:
  12   * - Keyboard navigation
  13:  * - Selection state
  14: 
  14   * - Sync status integration

src/presentation/components/ide/FileTree/types.ts:
  78  /**
  79:  * Context menu state
  80: 
  80   */

src/presentation/components/ide/FileTree/hooks/useContextMenuActions.ts:
  57   * Return type for the useContextMenuActions hook.
  58:  * S-024: Enhanced with dialog states
  59: 

  59   */

  85   * @param options - Hook options
  86:  * @returns Context menu handlers with dialog states
  87: 
  87   */

src/presentation/components/ide/hooks/useLazyFileContent.ts:
  81   * @param options - Hook options
  82:  * @returns Lazy loading functions and state
  83: 
  83   *

src/presentation/components/ide/PreviewPanel/PreviewPanel.tsx:
  25   * - Device frame selector (desktop/tablet/mobile)
  26:  * - Loading and waiting states
  27: 
  27   */

src/presentation/components/ide/statusbar/AgentStatusSegment.tsx:
  29  /**
  30:  * AgentStatusSegment - Shows AI agent activity state
  31: 
  31   * 

src/presentation/components/ide/statusbar/SyncStatusSegment.tsx:
  31  /**
  32:  * SyncStatusSegment - Shows file sync state
  33: 
  33   * 

src/presentation/components/ide/statusbar/WebContainerStatus.tsx:
  20  /**
  21:  * WebContainerStatus - Shows WebContainer boot state
  22: 
  22   * 

src/presentation/components/keyboard/index.ts:
  1  /**
  2:  * @fileoverview Keyboard Components Index
  3: 
  3   * @module components/keyboard

src/presentation/components/knowledge/FlashcardPreviewPanel.tsx:
    3   *
    4:  * UC1: Synthesis → Preview → Save to FlashcardStore
    5: 

    5   */

  210                    className={`h-1 w-8 rounded transition-colors ${
  211:                     idx === currentIndex
  212: 
  212                        ? 'bg-primary'

src/presentation/components/knowledge/IndexingProgressPanel.tsx:
  67  /**
  68:  * Overall indexing state
  69: 
  69   */

src/presentation/components/knowledge/QuizPreviewPanel.tsx:
    3   *
    4:  * UC1: Synthesis → Preview → Save to QuizStore
    5: 

    5   */

  200                    className={`h-1 w-8 rounded transition-colors ${
  201:                     idx === currentIndex
  202: 
  202                        ? 'bg-primary'

src/presentation/components/knowledge/hooks/useAPIKeyRetrieval.ts:
  44      /**
  45:      * Loading state
  46: 
  46       */

src/presentation/components/layout/ChatPanelWrapper.tsx:
   1  /**
   2:  * @fileoverview Chat Panel Wrapper Component - INTEGRATED WITH UNIFIED CHAT STORE
   3: 

   3   * @module components/layout/ChatPanelWrapper

  16   * 
  17:  * @created 2026-01-11 - Integrated ThreadManager with UnifiedChatStore
  18: 
  18   */

src/presentation/components/layout/IDELayoutMain.tsx:
   42      IDEResizableLayout,
   43:     useIDELayoutState
   44: 

   44  } from './IDELayout';

   51   * - File tree, editor, preview, terminal, chat panels
   52:  * - IDE state persistence
   53: 

   53   *

  114          handlePanelLayoutChange,
  115:         restoredIdeState
  116: 
  116      } = useIdeStatePersistence({ projectId });

src/presentation/components/layout/MobileTabBar.tsx:
  174  /**
  175:  * Hook for managing mobile panel state with persistence
  176: 
  176   *

src/presentation/components/layout/IDELayout/IDEEditorPanel.tsx:
  52      activeFileScrollTopRef,
  53:     scheduleIdeStatePersistence
  54: 
  54  }: IDEEditorPanelProps) {

src/presentation/components/layout/IDELayout/IDETerminalPanel.tsx:
  41      initialSyncCompleted,
  42:     permissionState
  43: 
  43  }: IDETerminalPanelProps) {

src/presentation/components/layout/IDELayout/useIDELayoutDiscoveryState.ts:
   6   * @layer Presentation
   7:  * @hook useIDELayoutDiscoveryState
   8: 

   8   */

  19  /**
  20:  * Hook to manage discovery mechanism state
  21: 
  21   */

src/presentation/components/layout/IDELayout/useIDELayoutFileState.ts:
   6   * @layer Presentation
   7:  * @hook useIDELayoutFileState
   8: 

   8   */

  30  /**
  31:  * Hook to manage IDE layout file state
  32: 
  32   */

src/presentation/components/layout/IDELayout/useIDELayoutState.ts:
   6   * @layer Presentation
   7:  * @hook useIDELayoutState
   8: 

   8   */

  18  /**
  19:  * Hook to manage IDE layout state
  20: 
  20   * Composes file state, workspace state, discovery state, and panel refs

src/presentation/components/layout/IDELayout/useIDELayoutWorkspaceState.ts:
  6   * @layer Presentation
  7:  * @hook useIDELayoutWorkspaceState
  8: 
  8   */

src/presentation/components/notes/AISlashCommand.tsx:
  4   * @story NR-05 - Implement Command Palette AI Actions
  5:  * @updated 2026-01-01 - Fixed async command execution with loading states
  6: 
  6   */

src/presentation/components/notes/InBlockAIPopup.tsx:
  11   * - Container-aware positioning (respects viewport bounds)
  12:  * - Renders through OverlayRoot for consistent z-index
  13: 
  13   * - Quick access to common AI actions

src/presentation/components/notes/MarkdownSyncConflictDialog.tsx:
  330  /**
  331:  * Hook for managing markdown sync conflict dialog state
  332: 
  332   *

src/presentation/components/notes/NotesMobileLayout.tsx:
  183  /**
  184:  * NotesMobileLayout with integrated note list state
  185: 
  185   */

src/presentation/components/notes/ProjectFilesPanel.tsx:
  32  /**
  33:  * File preview dialog state
  34: 
  34   */

src/presentation/components/notes/ReplacementPreviewDialog.tsx:
  271  /**
  272:  * Hook for managing replacement preview dialog state
  273: 
  273   */

src/presentation/components/notes/SaveBlockDialog.tsx:
  462  /**
  463:  * Hook to use the save block dialog state
  464: 
  464   */

src/presentation/components/plugins/index.ts:
  1  /**
  2:  * Plugin Components Index
  3: 
  3   *

src/presentation/components/search/index.ts:
  1  /**
  2:  * Search Components Index
  3: 
  3   * @module presentation/components/search

src/presentation/components/snippets/SnippetEditor.tsx:
  54  /**
  55:  * Initial form state
  56: 
  56   */

src/presentation/components/study/StudyPage.tsx:
  173                                      ) : (
  174:                                         <EmptyState
  175: 

  175                                              icon={Brain}

  185                                      ) : (
  186:                                         <EmptyState
  187: 

  187                                              icon={Trophy}

  201                          ) : (
  202:                             <EmptyState
  203: 

  203                                  icon={Sparkles}

  311                                      ) : (
  312:                                         <EmptyState
  313: 

  313                                              icon={Brain}

  323                                      ) : (
  324:                                         <EmptyState
  325: 

  325                                              icon={Trophy}

  343                          <div className="flex items-center justify-center h-full">
  344:                             <EmptyState
  345: 
  345                                  icon={Sparkles}

src/presentation/components/terminal/TerminalPanel.tsx:
  35   * - Multiple terminal tabs support
  36:  * - Terminal settings persistence
  37: 
  37   * - Tab management

src/presentation/components/ui/alert-dialog.tsx:
  175  /**
  176:  * Hook for managing alert dialog state
  177: 
  177   */

src/presentation/components/ui/EmptyState.tsx:
   2   * Empty State Component
   3:  * @module components/ui/EmptyState
   4: 

   4   *

  46  /**
  47:  * CVA variants for empty state
  48: 

  48   */

  70   * @example
  71:  * <EmptyState
  72: 
  72   *   message="No files found"

src/presentation/components/ui/ErrorState.tsx:
   2   * Error State Component
   3:  * @module components/ui/ErrorState
   4: 

   4   *

  48  /**
  49:  * CVA variants for error state
  50: 

  50   */

  71   * @example
  72:  * <ErrorState
  73: 
  73   *   error="Failed to load file"

src/presentation/components/ui/LoadingState.tsx:
   2   * Loading State Component
   3:  * @module components/ui/LoadingState
   4: 

   4   *

  37  /**
  38:  * CVA variants for loading state
  39: 

  39   */

  61   * @example
  62:  * <LoadingState
  63: 
  63   *   message="Loading files..."

src/presentation/components/ui/resizable.tsx:
  327  
  328:       const { handleIndex, startLayout } = state
  329:       const leftIndex = handleIndex
  330: 

  330        const rightIndex = handleIndex + 1

  399        // or ABOVE the handle (for vertical)
  400:       const panelIndex = handleIndex
  401: 

  401        if (panelIndex < 0 || panelIndex >= panelIds.length) return

  512              _size: size,
  513:             _index: pIndex
  514: 

  514            })

  520              key: child.key ?? `handle-${hIndex}`,
  521:             _index: hIndex
  522: 
  522            })

src/presentation/components/ui/status-dot.tsx:
   8   * Features:
   9:  * - Pulse animation for active states
  10: 
  10   * - Multiple status colors

src/presentation/components/ui/activity-indicators/ChunkingStatusIndicator.tsx:
  29  }: BaseActivityIndicatorProps) {
  30:     const { status, progress = 0, current = 0, total = 0, message, error } = state
  31: 
  31  

src/presentation/components/ui/activity-indicators/DatabaseIndexingIndicator.tsx:
  29  }: BaseActivityIndicatorProps) {
  30:     const { status, progress = 0, current = 0, total = 0, message, error } = state
  31: 
  31  

src/presentation/components/ui/activity-indicators/EmbeddingProgressIndicator.tsx:
  29  }: BaseActivityIndicatorProps) {
  30:     const { status, progress = 0, current = 0, total = 0, message, error } = state
  31: 
  31  

src/presentation/components/ui/activity-indicators/RAGAutoIndexingIndicator.tsx:
  54          phase = 'idle'
  55:     } = state
  56: 
  56  

src/presentation/components/ui/activity-indicators/SyncStatusIndicator.tsx:
  36  }: SyncStatusIndicatorProps) {
  37:     const { status, progress = 0, current = 0, total = 0, message, error } = state
  38: 
  38  

src/presentation/components/ui/activity-indicators/SyncStatusPanel.tsx:
  43   * Container component that:
  44:  * - Reads sync state from file-sync-status-store
  45:  * - Renders SyncStatusIndicator with store state
  46: 
  46   * - Auto-hides when no sync activity

src/presentation/components/ui/activity-indicators/types.ts:
  30  export interface BaseActivityIndicatorProps {
  31:     state: ActivityState
  32: 
  32      className?: string

src/presentation/components/ui/event-indicators/indexing-utils.tsx:
  13  /**
  14:  * Get status from indexing state
  15: 
  15   */

src/presentation/components/ui/event-indicators/IndexingProgressIndicator.tsx:
  26      /** Indexing state from RAG store */
  27:     indexing?: IndexingState
  28: 
  28      /** Optional CSS class name */

src/presentation/components/ui/event-indicators/note-indexing-utils.tsx:
  13  /**
  14:  * Get status from note indexing state
  15: 
  15   */

src/presentation/components/ui/event-indicators/NoteIndexingIndicator.tsx:
  24      /** Note indexing state from notes store */
  25:     indexing?: NoteIndexingState
  26: 
  26      /** Optional CSS class name */

src/presentation/components/ui/event-indicators/quiz-generation-utils.tsx:
  13  /**
  14:  * Get status from quiz generation state
  15: 
  15   */

src/presentation/components/ui/event-indicators/QuizGenerationIndicator.tsx:
  26      /** Quiz generation state from study store */
  27:     generation?: QuizGenerationState
  28: 
  28      /** Optional CSS class name */

src/presentation/components/ui/event-indicators/StreamingStatusIndicator.tsx:
  21  /**
  22:  * Streaming state
  23: 

  23   */

  35      /** Streaming state from chat store */
  36:     streaming?: StreamingState
  37: 

  37      /** Optional CSS class name */

  43  /**
  44:  * Get status from streaming state
  45: 
  45   */

src/presentation/components/ui/event-indicators/ToolExecutionIndicator.tsx:
  23      /** Tool execution state from agent store */
  24:     execution?: ToolExecutionState
  25: 

  25      /** Optional CSS class name */

  31  /**
  32:  * Get status from tool execution state
  33: 
  33   */

src/presentation/components/ui/event-indicators/ToolExecutionStep.tsx:
  23  /**
  24:  * Tool execution state
  25: 
  25   */

src/presentation/components/ui/event-indicators/types.ts:
   59  /**
   60:  * Indexing state
   61: 

   61   */

   79      /** Current indexing state */
   80:     indexing?: IndexingState
   81: 

   81      /** Optional CSS class name */

  103  /**
  104:  * Quiz generation state
  105: 

  105   */

  123      /** Current quiz generation state */
  124:     generation?: QuizGenerationState
  125: 

  125      /** Optional CSS class name */

  147  /**
  148:  * Workspace transition state
  149: 

  149   */

  164      /** Workspace transition state from workspace store */
  165:     transition?: WorkspaceTransitionState
  166: 

  166      /** Optional CSS class name */

  181  /**
  182:  * Note indexing state
  183: 

  183   */

  200      /** Current note indexing state */
  201:     indexing?: NoteIndexingState
  202: 
  202      /** Optional CSS class name */

src/presentation/components/ui/event-indicators/workspace-transition-utils.tsx:
  13  /**
  14:  * Get status from workspace transition state
  15: 
  15   */

src/presentation/components/workspace/sync/SyncStatusIndicator.tsx:
  83  /**
  84:  * Get status configuration based on sync state
  85: 
  85   */

src/presentation/hooks/useArtifactPreview.ts:
  39  /**
  40:  * Hook for managing artifact preview state
  41: 
  41   *

src/routes/ide.tsx:
  200   * - Navigates to /ide/$projectId route
  201:  * - Temp project persists in IndexedDB via project store
  202: 
  202   */

src/routes/workspace/$projectId.tsx:
  12    * - Uses loader to fetch project BEFORE render (no flash of null state)
  13:   * - Calls setProjectId to sync IDE store
  14: 
  14    * - WorkspaceSwitcher in header allows switching to other workspaces

src/routes/workspace/index.tsx:
  2   * @fileoverview Workspace Index Route
  3:  * @module routes/workspace/index
  4: 
  4   *

src/shared/types/index.ts:
  82  /**
  83:  * Configuration for persistence
  84: 
  84   */

src/styles/design-tokens.ts:
  438   * @param token - Z-index token name
  439:  * @returns CSS variable reference for z-index
  440: 
  440   * 
