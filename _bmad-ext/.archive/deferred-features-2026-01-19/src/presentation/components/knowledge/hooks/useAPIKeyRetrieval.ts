/**
 * API Key Retrieval Hook for RAG Embedding Service
 *
 * Manages API key fetching from credential vault for use in embedding service creation.
 * Based on useAgentChatAPIKeyManager pattern from AgentChatPanel.
 *
 * @layer Presentation
 * @hook useAPIKeyRetrieval
 *
 * @example
 * ```tsx
 * const { apiKey, providerId, isLoading, error } = useAPIKeyRetrieval('gemini');
 * const embeddingService = await createEmbeddingService(apiKey);
 * ```
 */

import { useEffect, useState, useMemo } from 'react';
import { credentialVault } from '@/lib/agent/providers/credential-vault';

/**
 * Provider IDs for embedding services
 */
export type EmbeddingProvider = 'gemini' | 'openai' | 'anthropic';

export interface UseAPIKeyRetrievalProps {
    /**
     * Provider ID to fetch API key for
     * @default 'gemini'
     */
    providerId?: EmbeddingProvider;
}

export interface APIKeyRetrievalResult {
    /**
     * Retrieved API key (null if not found or loading)
     */
    apiKey: string | null;

    /**
     * Provider ID used for key retrieval
     */
    providerId: string;

    /**
     * Loading state
     */
    isLoading: boolean;

    /**
     * Error message if retrieval failed
     */
    error: string | null;

    /**
     * Whether API key exists for provider
     */
    hasKey: boolean;
}

/**
 * Hook to manage API key retrieval from credential vault
 *
 * This hook:
 * 1. Initializes the credential vault
 * 2. Fetches API key for the specified provider
 * 3. Listens for credential update events
 * 4. Returns current state (apiKey, loading, error, hasKey)
 *
 * @param props - Provider configuration
 * @returns API key retrieval result
 */
export function useAPIKeyRetrieval({
    providerId: providerIdProp = 'gemini'
}: UseAPIKeyRetrievalProps = {}): APIKeyRetrievalResult {
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Normalize provider ID
    const providerId = useMemo(() => {
        return providerIdProp || 'gemini';
    }, [providerIdProp]);

    // Derived state
    const hasKey = useMemo(() => {
        return apiKey !== null && apiKey !== '';
    }, [apiKey]);

    // Fetch API key when provider changes
    useEffect(() => {
        let isCancelled = false;

        async function fetchAPIKey() {
            try {
                setIsLoading(true);
                setError(null);

                // Initialize vault and fetch credentials
                await credentialVault.initialize();
                const key = await credentialVault.getCredentials(providerId);

                if (!isCancelled) {
                    setApiKey(key);
                    setIsLoading(false);

                    // Set helpful error message if no key found
                    if (!key) {
                        setError(`No API key for ${providerId}. Add your API key in Settings → Providers to enable cloud embeddings.`);
                    }
                }
            } catch (err) {
                console.error('[useAPIKeyRetrieval] Failed to fetch API key:', err);
                if (!isCancelled) {
                    setError(`Failed to fetch API key for ${providerId}`);
                    setIsLoading(false);
                }
            }
        }

        fetchAPIKey();

        // Listen for credential updates from ProviderConfigDialog
        const handleCredentialsUpdate = (e: Event) => {
            const customEvent = e as CustomEvent<{ providerId: string }>;
            if (customEvent.detail && customEvent.detail.providerId === providerId) {
                fetchAPIKey();
            }
        };

        window.addEventListener('credentials-updated', handleCredentialsUpdate);

        return () => {
            isCancelled = true;
            window.removeEventListener('credentials-updated', handleCredentialsUpdate);
        };
    }, [providerId]);

    return {
        apiKey,
        providerId,
        isLoading,
        error,
        hasKey
    };
}

/**
 * Default export for convenience
 */
export default useAPIKeyRetrieval;
