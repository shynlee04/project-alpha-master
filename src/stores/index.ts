/**
 * @deprecated Import from @/infrastructure/persistence/stores instead
 * This file re-exports from the new consolidated location for backward compatibility
 */

// Re-export from consolidated stores location
export {
  useAgentsStore,
  useAgentsStoreHydration,
  DEFAULT_AGENT,
  type AgentsState
} from '@/infrastructure/persistence/stores/agents-store';

export {
  useAgentSelection,
  useActiveAgent,
  type AgentSelectionState
} from '@/infrastructure/persistence/stores/agent-selection-store';

export {
  useProviderModelsStore,
  useProviderModels,
  useSelectedProviderModel,
  type ProviderModelsState
} from '@/infrastructure/persistence/stores/provider-models-store';

export {
  useAutoApproveStore,
  TOOL_CATEGORY_MAP,
  type AutoApproveState,
  type ToolCategory
} from '@/infrastructure/persistence/stores/auto-approve-store';

export {
  usePromptEnhancementStore,
  type PromptEnhancementState
} from '@/infrastructure/persistence/stores/prompt-enhancement-store';

export {
  useThreadsStore,
  useActiveThread,
  useProjectThreads,
  useThreadsHydration,
  type ThreadsState,
  type ThreadMessage,
  type ThreadToolCall,
  type ConversationThread
} from '@/stores/conversation-threads-store';

export {
  useOpenAICompatibleStore,
  type OpenAICompatibleState
} from '@/infrastructure/persistence/stores/openai-compatible-store';
