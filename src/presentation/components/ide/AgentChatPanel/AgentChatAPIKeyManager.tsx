/**
 * PHASE 2 ARCHIVED
 * Original: _phase2-archive/presentation/components/ide/AgentChatPanel/AgentChatAPIKeyManager.tsx
 * 
 * This hook is disabled during Phase 1A. API key management functionality
 * will be restored in Phase 2 when agent features are re-enabled.
 */

console.log('[Phase 2] useAgentChatAPIKeyManager disabled during Phase 1A');

interface UseAgentChatAPIKeyManagerProps {
    agentProviderId: string | undefined;
}

interface APIKeyManagerResult {
    apiKey: string | null;
    apiKeyError: string | null;
    providerId: string;
    isFallback: boolean;
}

export function useAgentChatAPIKeyManager(_props: UseAgentChatAPIKeyManagerProps): APIKeyManagerResult {
    console.log('[Phase 2] useAgentChatAPIKeyManager feature disabled during Phase 1A');
    return { 
        apiKey: null, 
        apiKeyError: 'API key management is disabled during Phase 1A', 
        providerId: 'openrouter',
        isFallback: false 
    };
}

export default useAgentChatAPIKeyManager;
