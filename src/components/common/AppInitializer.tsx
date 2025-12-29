/**
 * AppInitializer - Global App Initialization
 * 
 * Initializes critical services on app boot:
 * - CredentialVault (API key encryption)
 * - ProviderModelsStore (models cache)
 * - Dexie stores hydration
 * 
 * CC-2025-12-29: Fix credential vault not being initialized on page load
 * CC-2025-12-29: Add provider models store initialization
 * 
 * @epic Sprint 30 - Agent Configuration Corrections
 */

import { useEffect, type ReactNode } from 'react';
import { credentialVault } from '@/lib/agent/providers/credential-vault';
import { useProviderModelsStore } from '@/stores/provider-models-store';

interface AppInitializerProps {
    children: ReactNode;
}

/**
 * AppInitializer wraps the app and ensures critical services are initialized
 * before any components that depend on them mount.
 */
export function AppInitializer({ children }: AppInitializerProps) {
    const initializeProviders = useProviderModelsStore(s => s.initialize);

    useEffect(() => {
        // Initialize all critical services on app boot
        const initServices = async () => {
            try {
                console.log('[AppInitializer] Starting initialization...');

                // 1. Initialize credential vault
                await credentialVault.initialize();
                console.log('[AppInitializer] Credential vault ready');

                // 2. Initialize provider models store (loads API key status and models)
                await initializeProviders();
                console.log('[AppInitializer] Provider models store ready');

            } catch (error) {
                console.error('[AppInitializer] Initialization failed:', error);
            }
        };

        initServices();
    }, [initializeProviders]);

    return <>{children}</>;
}

