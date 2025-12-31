/**
 * @fileoverview useAgentChatApiKeys Hook
 * @module components/ide/hooks/useAgentChatApiKeys
 * @governance EPIC-31
 * @ai-observable true
 *
 * Custom hook for managing API keys in AgentChatPanel.
 * Handles fetching, error handling, and listening for credential updates.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { credentialVault } from '@/lib/agent/providers/credential-vault';
import type { Agent } from '@/mocks/agents';

// Map agent provider display names to provider IDs
const PROVIDER_ID_MAP: Record<string, string> = {
    'OpenRouter': 'openrouter',
    'OpenAI': 'openai',
    'Anthropic': 'anthropic',
    'Google': 'gemini',
    'Mistral': 'openrouter',
    'OpenAI Compatible': 'openai-compatible',
};

export interface UseAgentChatApiKeysReturn {
    /** Current API key value */
    apiKey: string | null;
    /** API key error message */
    apiKeyError: string | null;
    /** Provider ID for the active agent */
    providerId: string;
    /** Refetch the API key */
    refetchApiKey: () => void;
}

/**
 * Hook for managing API keys in AgentChatPanel
 *
 * @param agent - The active agent
 * @returns API key state and utilities
 */
export function useAgentChatApiKeys(agent: Agent | undefined): UseAgentChatApiKeysReturn {
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [apiKeyError, setApiKeyError] = useState<string | null>(null);

    // Get provider ID from agent's provider name
    const providerId = useMemo(() => {
        if (!agent?.provider) return 'openrouter';
        return PROVIDER_ID_MAP[agent.provider] || 'openrouter';
    }, [agent?.provider]);

    // Fetch API key
    const fetchApiKey = useCallback(async () => {
        try {
            await credentialVault.initialize();
            let key = await credentialVault.getCredentials(providerId);

            setApiKey(key);
            if (!key) {
                setApiKeyError(`No API key for ${providerId}. Click the settings icon on the agent in the Agents panel to configure it.`);
            } else {
                setApiKeyError(null);
            }
        } catch (err) {
            console.error('[useAgentChatApiKeys] Failed to fetch API key:', err);
            setApiKeyError('Failed to fetch API key');
        }
    }, [providerId]);

    // Fetch API key when agent or provider changes
    useEffect(() => {
        let isCancelled = false;

        (async () => {
            await fetchApiKey();
        })();

        // Listen for credential updates from AgentConfigDialog
        const handleCredentialsUpdate = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail && customEvent.detail.providerId === providerId) {
                if (!isCancelled) {
                    fetchApiKey();
                }
            }
        };

        window.addEventListener('credentials-updated', handleCredentialsUpdate);

        return () => {
            isCancelled = true;
            window.removeEventListener('credentials-updated', handleCredentialsUpdate);
        };
    }, [providerId, fetchApiKey]);

    return {
        apiKey,
        apiKeyError,
        providerId,
        refetchApiKey: fetchApiKey,
    };
}
