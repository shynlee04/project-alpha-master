/**
 * Agent Chat API Key Manager Hook
 *
 * Manages API key fetching and credential update events.
 *
 * @layer Presentation
 * @hook useAgentChatAPIKeyManager
 */

import { useEffect, useState, useMemo } from 'react';
import { credentialVault } from '@/lib/agent/providers/credential-vault';

const PROVIDER_ID_MAP: Record<string, string> = {
    'OpenRouter': 'openrouter',
    'OpenAI': 'openai',
    'Anthropic': 'anthropic',
    'Google': 'gemini',
    'Mistral': 'openrouter',
    'OpenAI Compatible': 'openai-compatible',
};

interface UseAgentChatAPIKeyManagerProps {
    agentProvider: string | undefined;
}

interface APIKeyManagerResult {
    apiKey: string | null;
    apiKeyError: string | null;
    providerId: string;
}

/**
 * Hook to manage API key fetching and credential updates
 */
export function useAgentChatAPIKeyManager({
    agentProvider
}: UseAgentChatAPIKeyManagerProps): APIKeyManagerResult {
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [apiKeyError, setApiKeyError] = useState<string | null>(null);

    // Get provider ID from agent's provider name
    const providerId = useMemo(() => {
        if (!agentProvider) return 'openrouter';
        return PROVIDER_ID_MAP[agentProvider] || 'openrouter';
    }, [agentProvider]);

    // Fetch API key when agent or provider changes
    useEffect(() => {
        let isCancelled = false;

        async function fetchApiKey() {
            try {
                await credentialVault.initialize();
                let key = await credentialVault.getCredentials(providerId);

                if (!isCancelled) {
                    setApiKey(key);
                    if (!key) {
                        setApiKeyError(`No API key for ${providerId}. Click the settings icon on the agent in the Agents panel to configure it.`);
                    } else {
                        setApiKeyError(null);
                    }
                }
            } catch (err) {
                console.error('[AgentChatPanel] Failed to fetch API key:', err);
                if (!isCancelled) {
                    setApiKeyError('Failed to fetch API key');
                }
            }
        }

        fetchApiKey();

        // Listen for credential updates from AgentConfigDialog
        const handleCredentialsUpdate = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail && customEvent.detail.providerId === providerId) {
                fetchApiKey();
            }
        };

        window.addEventListener('credentials-updated', handleCredentialsUpdate);

        return () => {
            isCancelled = true;
            window.removeEventListener('credentials-updated', handleCredentialsUpdate);
        };
    }, [providerId]);

    return { apiKey, apiKeyError, providerId };
}
