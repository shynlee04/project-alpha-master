/**
 * PHASE 2 ARCHIVED
 * Original: _phase2-archive/lib/agent/utils/token-estimator.ts
 * 
 * This module is disabled during Phase 1A. Token estimation functionality
 * will be restored in Phase 2 when agent features are re-enabled.
 */

console.log('[Phase 2] Token estimator disabled during Phase 1A');

export interface TokenEstimate {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export function estimateTokens(text: string): number {
  console.log('[Phase 2] Token estimation disabled during Phase 1A');
  // Rough approximation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

export function estimateMessageTokens(messages: Array<{ role: string; content: string }>): TokenEstimate {
  console.log('[Phase 2] Message token estimation disabled during Phase 1A');
  const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0);
  const inputTokens = Math.ceil(totalChars / 4);
  
  return {
    inputTokens,
    outputTokens: 0,
    totalTokens: inputTokens,
  };
}

// Alias for compatibility
export const estimateMessagesTokens = estimateMessageTokens;

export function getContextCapacity(
  maxTokens: number,
  reservedTokens: number = 1024
): { maxTokens: number; reservedTokens: number; availableTokens: number } {
  console.log('[Phase 2] Context capacity calculation disabled during Phase 1A');
  return {
    maxTokens,
    reservedTokens,
    availableTokens: maxTokens - reservedTokens,
  };
}

export function estimateContextWindow(
  messages: Array<{ role: string; content: string }>,
  maxTokens: number
): { fits: boolean; overflowBy: number } {
  console.log('[Phase 2] Context window estimation disabled during Phase 1A');
  const { totalTokens } = estimateMessageTokens(messages);
  
  return {
    fits: totalTokens <= maxTokens,
    overflowBy: Math.max(0, totalTokens - maxTokens),
  };
}

export class TokenEstimator {
  estimate(text: string): number {
    return estimateTokens(text);
  }
  
  estimateMessages(messages: Array<{ role: string; content: string }>): TokenEstimate {
    return estimateMessageTokens(messages);
  }
}

export const tokenEstimator = new TokenEstimator();