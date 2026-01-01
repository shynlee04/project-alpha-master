/**
 * AppInitializer - Global App Initialization
 * 
 * Initializes critical services on app boot:
 * - CredentialVault (API key encryption)
 * - ProviderStore (models cache - single source of truth)
 * - Dexie stores hydration
 * 
 * CC-2025-12-29: Fix credential vault not being initialized on page load
 * CC-2025-12-29: Auto-fetch models for default provider on boot
 * 
 * @epic Sprint 30 - Agent Configuration Corrections
 */

import { useEffect, type ReactNode } from 'react';
import { credentialVault } from '@/lib/agent/providers/credential-vault';
import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store';

interface AppInitializerProps {
    children: ReactNode;
}

/**
 * AppInitializer wraps the app and ensures critical services are initialized
 * before any components that depend on them mount.
 */
export function AppInitializer({ children }: AppInitializerProps) {
    const fetchModels = useAppStore(s => s.fetchModels);

    useEffect(() => {
        // Initialize all critical services on app boot
        const initServices = async () => {
            try {
                console.log('[AppInitializer] Starting initialization...');

                // 1. Initialize credential vault
                await credentialVault.initialize();
                console.log('[AppInitializer] Credential vault ready');

                // 2. Auto-fetch models for ALL providers with credentials
                // This ensures "single source of truth" is populated regardless of active selection
                const { providers } = useAppStore.getState();

                console.log('[AppInitializer] Checking credentials for providers:', providers.map(p => p.id));

                // execute in parallel
                await Promise.all(providers.map(async (provider) => {
                    // if (!provider.enabled) return; // 'enabled' property removed from ProviderConfig

                    try {
                        const apiKey = await credentialVault.getCredentials(provider.id);
                        if (apiKey) {
                            console.log(`[AppInitializer] Pre-fetching models for ${provider.id}...`);
                            await fetchModels(provider.id);
                            console.log(`[AppInitializer] Models loaded for ${provider.id}`);
                        } else if (provider.id === 'openrouter') {
                            // Ensure free models are loaded for OpenRouter even without key
                            console.log(`[AppInitializer] Loading default models for ${provider.id}...`);
                            await fetchModels(provider.id);
                        }
                    } catch (err) {
                        console.warn(`[AppInitializer] Failed to load ${provider.id}:`, err);
                    }
                }));

            } catch (error) {
                console.error('[AppInitializer] Initialization failed:', error);
            }
        };

        initServices();
    }, [fetchModels]);

    return <>{children}</>;
}
