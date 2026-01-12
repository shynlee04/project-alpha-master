/**
 * Agent Chat API Key Manager Hook
 *
 * Manages API key fetching and credential update events.
 * Includes automatic provider fallback when primary provider lacks API key.
 *
 * @layer Presentation
 * @hook useAgentChatAPIKeyManager
 * @story PRV-03 - Provider Fallback Mechanism
 */

import { useEffect, useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { credentialVault } from '@/lib/agent/providers/credential-vault';
import {
    getProviderWithKey,
    getProviderDisplayName,
    NoProviderKeyAvailableError
} from '@/lib/agent/provider-fallback';

interface UseAgentChatAPIKeyManagerProps {
    agentProviderId: string | undefined;
}

interface APIKeyManagerResult {
    apiKey: string | null;
    apiKeyError: string | null;
    providerId: string;
    /** Whether a fallback occurred (providerId differs from agent's configured provider) */
    isFallback: boolean;
}

/**
 * Hook to manage API key fetching and credential updates with fallback support
 *
 * @story PRV-03 - AC1: Agent falls back to next available provider when primary lacks key
 * @story PRV-03 - AC2: User notified of fallback (bilingual)
 */
export function useAgentChatAPIKeyManager({
    agentProviderId
}: UseAgentChatAPIKeyManagerProps): APIKeyManagerResult {
    const { t } = useTranslation();
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [apiKeyError, setApiKeyError] = useState<string | null>(null);
    const [providerId, setProviderId] = useState(() => agentProviderId || 'openrouter');
    const [isFallback, setIsFallback] = useState(false);

    // Track fallback notification to avoid duplicate toasts
    const fallbackNotifiedRef = useRef<string | null>(null);

    // Use provider ID directly (already in ID format)
    const requestedProviderId = useMemo(() => {
        return agentProviderId || 'openrouter';
    }, [agentProviderId]);

    // Fetch API key with fallback when agent or provider changes
    useEffect(() => {
        let isCancelled = false;

        async function fetchApiKeyWithFallback() {
            try {
                await credentialVault.initialize();

                // First try the agent's configured provider
                let key = await credentialVault.getCredentials(requestedProviderId);

                if (key && !isCancelled) {
                    // Primary provider has a key - no fallback needed
                    setApiKey(key);
                    setProviderId(requestedProviderId);
                    setIsFallback(false);
                    setApiKeyError(null);
                    return;
                }

                // Primary provider lacks key - try fallback providers
                try {
                    const fallbackResult = await getProviderWithKey(requestedProviderId);

                    if (!isCancelled) {
                        setApiKey(fallbackResult.apiKey);
                        setProviderId(fallbackResult.providerId);
                        setIsFallback(fallbackResult.isFallback);

                        // Show fallback notification if fallback occurred
                        if (fallbackResult.isFallback && fallbackNotifiedRef.current !== fallbackResult.providerId) {
                            const originalName = getProviderDisplayName(requestedProviderId);
                            const fallbackName = getProviderDisplayName(fallbackResult.providerId);
                            toast.info(
                                t('agentKey.fallbackNotice', {
                                    originalProvider: originalName,
                                    fallbackProvider: fallbackName,
                                })
                            );
                            fallbackNotifiedRef.current = fallbackResult.providerId;
                        }

                        setApiKeyError(null);
                    }
                } catch (error) {
                    // No provider in the fallback chain has a key
                    if (error instanceof NoProviderKeyAvailableError || error instanceof Error) {
                        if (!isCancelled) {
                            setApiKey(null);
                            setProviderId(requestedProviderId);
                            setIsFallback(false);
                            setApiKeyError(
                                t('agentKey.fallbackUnavailable', { provider: getProviderDisplayName(requestedProviderId) })
                            );
                        }
                    }
                }
            } catch (err) {
                console.error('[AgentChatPanel] Failed to fetch API key:', err);
                if (!isCancelled) {
                    setApiKey(null);
                    setApiKeyError(t('agentKey.fetchFailed'));
                }
            }
        }

        fetchApiKeyWithFallback();

        // Listen for credential updates from AgentConfigDialog
        const handleCredentialsUpdate = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail && customEvent.detail.providerId === providerId) {
                fetchApiKeyWithFallback();
            }
        };

        window.addEventListener('credentials-updated', handleCredentialsUpdate);

        return () => {
            isCancelled = true;
            window.removeEventListener('credentials-updated', handleCredentialsUpdate);
        };
    }, [requestedProviderId, providerId, t]);

    return { apiKey, apiKeyError, providerId, isFallback };
}
