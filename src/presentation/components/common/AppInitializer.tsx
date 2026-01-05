/**
 * AppInitializer - Global App Initialization
 *
 * Initializes critical services on app boot:
 * - CredentialVault (API key encryption)
 * - ProviderStore (models cache - single source of truth)
 * - Workspace bindings migration (P0 fix - enable all workspaces)
 * - Dexie stores hydration
 *
 * CC-2025-12-29: Fix credential vault not being initialized on page load
 * CC-2025-12-29: Auto-fetch models for default provider on boot
 * CC-2026-01-06: Add workspace bindings migration (Phase 1A)
 *
 * @epic Sprint 30 - Agent Configuration Corrections
 * @governance EPIC-CP-1.4
 */

import { useEffect, type ReactNode } from 'react';
import { credentialVault } from '@/lib/agent/providers/credential-vault';
import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store';
import { migrateWorkspaceBindings } from '@/infrastructure/persistence/stores/project/migrate-bindings';

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

                // 2. Run workspace bindings migration (one-time, idempotent)
                // Fixes P0 blocker where projects had notes: false by default
                const migrationResult = await migrateWorkspaceBindings();
                if (migrationResult.executed) {
                    console.log('[AppInitializer] Workspace bindings migration completed:', {
                        migratedCount: migrationResult.migratedCount,
                        totalProjects: migrationResult.totalProjects,
                    });
                }

                // 3. Auto-fetch models for ALL providers with credentials
                // This ensures "single source of truth" is populated regardless of active selection
                const { providers } = useAppStore.getState();

                console.log('[AppInitializer] Checking credentials for providers:', providers.map(p => p.id));

                // Execute in parallel
                await Promise.all(providers.map(async (provider) => {
                    try {
                        const apiKey = await credentialVault.getCredentials(provider.id);
                        if (apiKey) {
                            // Provider has API key - fetch live models
                            console.log(`[AppInitializer] Pre-fetching models for ${provider.id}...`);
                            await fetchModels(provider.id);
                            console.log(`[AppInitializer] Models loaded for ${provider.id}`);
                        } else {
                            // Provider has no API key - load default models as fallback
                            // This ensures users see models immediately (better UX)
                            console.log(`[AppInitializer] Loading default models for ${provider.id}...`);
                            await fetchModels(provider.id);
                            console.log(`[AppInitializer] Default models loaded for ${provider.id}`);
                        }
                    } catch (err) {
                        console.warn(`[AppInitializer] Failed to load ${provider.id}:`, err);
                        // Continue with other providers even if one fails
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
