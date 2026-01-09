/**
 * @fileoverview Agent Hooks - Public Exports
 * @module lib/agent/hooks
 *
 * @epic 25 - AI Foundation Sprint
 * @story 25-1, 25-4 - TanStack AI Integration + Wire Tool Execution
 * @story B-1 - Wire Vault to AI Providers
 * @epic 40 - Multimodal Chat Unification
 * @story MM-07, MM-08 - Voice Input/Output Hooks
 */

// export { useAgentChat, type UseAgentChatOptions, type UseAgentChatReturn, type ChatMessage } from './use-agent-chat';
export { useAgentChatWithTools, type UseAgentChatWithToolsOptions, type UseAgentChatWithToolsReturn } from './use-agent-chat-with-tools';
export { useProviderApiKey, type UseProviderApiKeyResult } from './use-provider-api-key';

// Voice I/O Hooks (EPIC-40, MM-07, MM-08)
export {
  useVoiceInput,
  useTranscribeFile,
  type VoiceInputState,
  type UseVoiceInputOptions,
  type UseVoiceInputReturn,
} from './use-voice-input';
export {
  useVoiceOutput,
  useSpeakOnce,
  type VoiceOutputState,
  type UseVoiceOutputOptions,
  type UseVoiceOutputReturn,
  TTS_PROVIDERS,
  OPENAI_VOICES,
  GEMINI_VOICES,
} from './use-voice-output';
