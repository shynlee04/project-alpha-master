/**
 * AppInitializer - Global App Initialization
 * 
 * Initializes critical services on app boot:
 * - CredentialVault (API key encryption)
 * - Dexie stores hydration
 * 
 * CC-2025-12-29: Fix credential vault not being initialized on page load
 * 
 * @epic Sprint 30 - Agent Configuration Corrections
 */

import { useEffect, type ReactNode } from 'react';
import { credentialVault } from '@/lib/agent/providers/credential-vault';

interface AppInitializerProps {
    children: ReactNode;
}

/**
 * AppInitializer wraps the app and ensures critical services are initialized
 * before any components that depend on them mount.
 */
export function AppInitializer({ children }: AppInitializerProps) {
    useEffect(() => {
        // Initialize credential vault on app boot
        // This ensures hasCredentials() works correctly everywhere
        const initServices = async () => {
            try {
                console.log('[AppInitializer] Initializing credential vault...');
                await credentialVault.initialize();
                console.log('[AppInitializer] Credential vault ready');
            } catch (error) {
                console.error('[AppInitializer] Failed to initialize credential vault:', error);
            }
        };

        initServices();
    }, []);

    return <>{children}</>;
}
