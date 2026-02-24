/**
 * PHASE 2 ARCHIVED
 * Original: _phase2-archive/lib/agent/hooks/use-multi-agent-chat.ts
 * 
 * This hook is disabled during Phase 1A. Multi-agent chat functionality
 * will be restored in Phase 2 when agent features are re-enabled.
 */

console.log('[Phase 2] useMultiAgentChat disabled during Phase 1A');

// Stub types
export interface MultiAgentConfig {
  agents: string[];
  mode: 'debate' | 'collaboration' | 'routing';
}

export interface MultiAgentState {
  isActive: boolean;
  currentAgent: string | null;
}

export interface MultiAgentResults {
  responses: Record<string, string>;
  consensus?: string;
}

export interface UseMultiAgentChatOptions {
  config: MultiAgentConfig;
  onComplete?: (results: MultiAgentResults) => void;
}

export interface UseMultiAgentChatActions {
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export interface UseMultiAgentChatReturn extends UseMultiAgentChatActions {
  state: MultiAgentState;
  results: MultiAgentResults | null;
  isLoading: boolean;
  error: string | null;
}

export function useMultiAgentChat(_options: UseMultiAgentChatOptions): UseMultiAgentChatReturn {
  console.log('[Phase 2] useMultiAgentChat feature disabled during Phase 1A');
  
  return {
    state: { isActive: false, currentAgent: null },
    results: null,
    isLoading: false,
    error: 'Multi-agent chat is disabled during Phase 1A',
    start: () => {},
    stop: () => {},
    reset: () => {},
  };
}

export function useDebate() {
  console.log('[Phase 2] useDebate feature disabled during Phase 1A');
  return {
    startDebate: () => {},
    responses: [],
    isDebating: false,
  };
}

export function useRouting() {
  console.log('[Phase 2] useRouting feature disabled during Phase 1A');
  return {
    routeQuery: () => null,
    selectedAgent: null,
    isRouting: false,
  };
}

export function useExpansion() {
  console.log('[Phase 2] useExpansion feature disabled during Phase 1A');
  return {
    expandQuery: () => [],
    expandedQueries: [],
    isExpanding: false,
  };
}

export default useMultiAgentChat;
