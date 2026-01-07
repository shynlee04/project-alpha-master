/**
 * @fileoverview Provider API Key Retrieval Hook
 * @module lib/agent/hooks/use-provider-api-key
 *
 * Retrieves API keys from the credential vault for AI provider operations.
 *
 * @epic BYOK Vault Wiring
 * @story B-1 - Wire Vault to AI Providers
 *
 * This hook provides a centralized way to retrieve API keys from the
 * encrypted credential vault for use in AI agent operations.
 *
 * @example
 * ```tsx
 * const { apiKey, isLoading, error } = useProviderApiKey('openrouter');
 * if (!apiKey) {
 *   return <MissingApiKeyWarning providerId="openrouter" />;
 * }
 * ```
 */

import { useState, useEffect } from 'react';
import { credentialVault } from '../providers/credential-vault';
import { crossWorkspaceEventBus } from '@/lib/events/cross-workspace-event-bus';
import type { ProviderConfigChangeEvent } from '@/lib/events/cross-workspace-event-bus';

export interface UseProviderApiKeyResult {
    /** The retrieved API key, or null if not found/loaded */
    apiKey: string | null;
    /** Whether the key is currently being retrieved */
    isLoading: boolean;
    /** Any error that occurred during retrieval */
    error: Error | null;
    /** Whether the provider has a key stored (async check) */
    hasKey: boolean;
}

/**
 * Hook to retrieve API key from credential vault for a given provider.
 *
 * @param providerId - The provider ID to retrieve the key for
 * @returns API key state and loading status
 *
 * SSR-safe: Returns null apiKey during server-side rendering.
 */
export function useProviderApiKey(providerId: string): UseProviderApiKeyResult {
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [hasKey, setHasKey] = useState(false);

    useEffect(() => {
        let isMounted = true;

        // SSR guard: IndexedDB not available on server
        if (typeof window === 'undefined') {
            setIsLoading(false);
            return;
        }

        const loadApiKey = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Retrieve from encrypted vault
                const key = await credentialVault.getCredentials(providerId);

                if (isMounted) {
                    setApiKey(key);
                    setHasKey(!!key);
                }
            } catch (err) {
                if (isMounted) {
                    console.error(`[useProviderApiKey] Failed to load key for ${providerId}:`, err);
                    setError(err instanceof Error ? err : new Error('Failed to load API key'));
                    setApiKey(null);
                    setHasKey(false);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadApiKey();

        // B-1 Code Review Fix: Subscribe to vault credential updates
        const handleCredentialUpdate = (event: ProviderConfigChangeEvent) => {
            if (event.changeType === 'credentials_updated' && event.providerId === providerId) {
                loadApiKey(); // Re-fetch when credentials are updated
            }
        };

        crossWorkspaceEventBus.onProviderConfigChange(handleCredentialUpdate);

        return () => {
            isMounted = false;
            crossWorkspaceEventBus.offProviderConfigChange(handleCredentialUpdate);
        };
    }, [providerId]);

    return {
        apiKey,
        isLoading,
        error,
        hasKey,
    };
}

export default useProviderApiKey;
