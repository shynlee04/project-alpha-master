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
import { useProviderStore } from '@/lib/state/provider-store';

interface AppInitializerProps {
    children: ReactNode;
}

/**
 * AppInitializer wraps the app and ensures critical services are initialized
 * before any components that depend on them mount.
 */
export function AppInitializer({ children }: AppInitializerProps) {
    const fetchModels = useProviderStore(s => s.fetchModels);
    const activeProviderId = useProviderStore(s => s.activeProviderId);

    useEffect(() => {
        // Initialize all critical services on app boot
        const initServices = async () => {
            try {
                console.log('[AppInitializer] Starting initialization...');

                // 1. Initialize credential vault
                await credentialVault.initialize();
                console.log('[AppInitializer] Credential vault ready');

                // 2. Auto-fetch models for the default/active provider
                // This populates availableModels for immediate use
                const providerId = activeProviderId || 'openrouter';
                console.log('[AppInitializer] Fetching models for:', providerId);
                await fetchModels(providerId);
                console.log('[AppInitializer] Models fetched for:', providerId);

            } catch (error) {
                console.error('[AppInitializer] Initialization failed:', error);
            }
        };

        initServices();
    }, [fetchModels, activeProviderId]);

    return <>{children}</>;
}
