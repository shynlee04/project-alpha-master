/**
 * PHASE 2 STUB: System Prompt
 * Original code archived to: _phase2-archive/lib/agent/
 * 
 * @phase 2
 * @stub true
 * @created 2026-01-29
 */

export function buildSystemPrompt(_options?: Record<string, unknown>): string {
  console.log('[Phase 2] System prompt building disabled during Phase 1A');
  return 'You are a helpful assistant.';
}

export function getDefaultSystemPrompt(): string {
  return 'You are a helpful assistant.';
}

export function getNotesAgentSystemPrompt(): string {
  console.log('[Phase 2] Notes agent system prompt disabled during Phase 1A');
  return 'You are a helpful notes assistant.';
}

export const systemPromptBuilder = {
  build: buildSystemPrompt,
  default: getDefaultSystemPrompt,
  notes: getNotesAgentSystemPrompt,
};
