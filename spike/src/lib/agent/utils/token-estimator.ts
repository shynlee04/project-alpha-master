/**
 * @fileoverview Token Estimation Utility
 * @module lib/agent/utils/token-estimator
 * @governance EPIC-40 MM-09
 *
 * Estimates token count for messages to track context window usage.
 * Uses character-based approximation (~4 chars per token for English text).
 *
 * @story MM-09: Context Window Manager
 * @created 2026-01-10
 */

import type { ChatMessage, ToolCall } from '@/domain/entities/chat';

/**
 * Token estimation configuration
 */
export interface TokenEstimatorConfig {
  /** Average characters per token (varies by language) */
  charsPerToken: number;
  /** Base token overhead for metadata (role, timestamp, etc.) */
  baseOverhead: number;
  /** Token cost per tool call */
  toolCallMultiplier: number;
}

/**
 * Default configuration (optimized for English text)
 */
const DEFAULT_CONFIG: TokenEstimatorConfig = {
  charsPerToken: 4,
  baseOverhead: 10,
  toolCallMultiplier: 1.5,
};

/**
 * Estimate token count for a string
 *
 * @param text - Text to estimate
 * @param config - Estimation configuration
 * @returns Estimated token count
 */
export function estimateTextTokens(
  text: string,
  config: TokenEstimatorConfig = DEFAULT_CONFIG
): number {
  if (!text) return 0;
  // Normalize whitespace and count characters
  const normalized = text.trim().replace(/\s+/g, ' ');
  return Math.ceil(normalized.length / config.charsPerToken);
}

/**
 * Estimate token count for a tool call
 *
 * Tool calls have structured data that requires more tokens than raw text.
 *
 * @param toolCall - Tool call to estimate
 * @param config - Estimation configuration
 * @returns Estimated token count
 */
export function estimateToolCallTokens(
  toolCall: ToolCall,
  config: TokenEstimatorConfig = DEFAULT_CONFIG
): number {
  let tokens = config.baseOverhead;

  // Tool name
  tokens += estimateTextTokens(toolCall.name, config);

  // Input arguments (JSON stringified)
  if (toolCall.input) {
    const inputStr = JSON.stringify(toolCall.input);
    tokens += Math.ceil(estimateTextTokens(inputStr, config) * config.toolCallMultiplier);
  }

  // Output (if present)
  if (toolCall.output) {
    const outputStr = typeof toolCall.output === 'string'
      ? toolCall.output
      : JSON.stringify(toolCall.output);
    tokens += Math.ceil(estimateTextTokens(outputStr, config) * config.toolCallMultiplier);
  }

  // Error (if present)
  if (toolCall.error) {
    tokens += estimateTextTokens(toolCall.error, config);
  }

  return tokens;
}

/**
 * Estimate token count for a message
 *
 * Includes content, role, agent info, and tool calls.
 *
 * @param message - Message to estimate
 * @param config - Estimation configuration
 * @returns Estimated token count
 */
export function estimateMessageTokens(
  message: ChatMessage,
  config: TokenEstimatorConfig = DEFAULT_CONFIG
): number {
  let tokens = config.baseOverhead;

  // Role (user/assistant/system/tool)
  tokens += 5;

  // Content
  if (message.content) {
    tokens += estimateTextTokens(message.content, config);
  }

  // Agent metadata (for assistant messages)
  if (message.agentId) tokens += 10;
  if (message.agentName) tokens += estimateTextTokens(message.agentName, config);
  if (message.agentModel) tokens += estimateTextTokens(message.agentModel, config);

  // Tool calls
  if (message.toolCalls && message.toolCalls.length > 0) {
    for (const toolCall of message.toolCalls) {
      tokens += estimateToolCallTokens(toolCall, config);
    }
  }

  // Metadata
  if (message.metadata) {
    const metadataStr = JSON.stringify(message.metadata);
    tokens += Math.ceil(estimateTextTokens(metadataStr, config) * 0.5);
  }

  return tokens;
}

/**
 * Estimate token count for multiple messages
 *
 * @param messages - Messages to estimate
 * @param config - Estimation configuration
 * @returns Total estimated token count
 */
export function estimateMessagesTokens(
  messages: ChatMessage[],
  config: TokenEstimatorConfig = DEFAULT_CONFIG
): number {
  return messages.reduce((sum, msg) => sum + estimateMessageTokens(msg, config), 0);
}

/**
 * Get remaining context capacity
 *
 * @param currentTokens - Current token count
 * @param maxTokens - Maximum tokens allowed
 * @returns Remaining tokens and percentage used
 */
export function getContextCapacity(
  currentTokens: number,
  maxTokens: number
): { remaining: number; used: number; percentage: number } {
  const used = Math.min(currentTokens, maxTokens);
  const remaining = Math.max(0, maxTokens - used);
  const percentage = maxTokens > 0 ? (used / maxTokens) * 100 : 0;

  return { remaining, used, percentage };
}

/**
 * Check if context is approaching limit
 *
 * @param currentTokens - Current token count
 * @param maxTokens - Maximum tokens allowed
 * @param threshold - Warning threshold percentage (default 80)
 * @returns True if context is near limit
 */
export function isContextNearLimit(
  currentTokens: number,
  maxTokens: number,
  threshold: number = 80
): boolean {
  const { percentage } = getContextCapacity(currentTokens, maxTokens);
  return percentage >= threshold;
}
