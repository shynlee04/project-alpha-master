/**
 * @deprecated Import from @/infrastructure/persistence/stores instead
 * This file re-exports from the new consolidated location for backward compatibility
 */

export { useAgentsStore } from './agents-store';
export { useAgentSelection, activeAgentId, setActiveAgent } from './agent-selection-store';
export { useProviderModelsStore } from './provider-models-store';
export { useAutoApproveStore } from './auto-approve-store';
export { usePromptEnhancementStore } from './prompt-enhancement-store';
export { useThreadsStore, createThread, setActiveThread } from './conversation-threads-store';
export { useOpenAICompatibleStore } from './openai-compatible-store';

export type { AgentState } from './agents-store';
export type { AgentSelectionState } from './agent-selection-store';
export type { ProviderModelState } from './provider-models-store';
export type { AutoApproveState } from './auto-approve-store';
export type { PromptEnhancementState } from './prompt-enhancement-store';
export type { ThreadsState, ConversationThread, ThreadMessage } from './conversation-threads-store';
export type { OpenAICompatibleState } from './openai-compatible-store';
