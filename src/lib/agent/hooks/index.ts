/**
 * @fileoverview Agent Hooks - Public Exports
 * @module lib/agent/hooks
 *
 * @epic 25 - AI Foundation Sprint
 * @story 25-1, 25-4 - TanStack AI Integration + Wire Tool Execution
 * @story B-1 - Wire Vault to AI Providers
 */

// export { useAgentChat, type UseAgentChatOptions, type UseAgentChatReturn, type ChatMessage } from './use-agent-chat';
export { useAgentChatWithTools, type UseAgentChatWithToolsOptions, type UseAgentChatWithToolsReturn } from './use-agent-chat-with-tools';
export { useProviderApiKey, type UseProviderApiKeyResult } from './use-provider-api-key';
