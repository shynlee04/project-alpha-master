/**
 * AppInitializer - Global App Initialization (Phase 1A Compatible)
 *
 * Initializes critical services on app boot:
 * - Phase 1A: Core plugins (FileTree, Monaco, Notes, Terminal, Preview)
 * - Phase 1A: Project hydration from Dexie
 * - Phase 1A: Service Worker (offline support)
 * - Phase 2: CredentialVault, ProviderStore, AI features (DISABLED in Phase 1A)
 *
 * Phase 2 features are conditionally loaded to prevent module resolution errors
 * during Phase 1A development. When Phase 2 begins, remove the PHASE_1A_MODE
 * flag to re-enable AI features.
 *
 * CC-2025-12-29: Fix credential vault not being initialized on page load
 * CC-2025-12-29: Auto-fetch models for default provider on boot
 * CC-2026-01-06: Add workspace bindings migration (Phase 1A)
 * CC-2026-01-06: Add service worker registration (S-026)
 * CC-2026-01-29: Phase 1A compatibility - disable Phase 2 imports
 *
 * @epic Sprint 30 - Agent Configuration Corrections
 * @governance EPIC-CP-1.4, PHASE-1A-FOUNDATION
 * @phase 1A
 */

import { useEffect, type ReactNode } from 'react';
import { useProjectStore } from '@/infrastructure/persistence/stores/project/useProjectStore';
import { migrateWorkspaceBindings } from '@/infrastructure/persistence/stores/project/migrate-bindings';
import { registerServiceWorker } from '@/lib/offline/service-worker-registration';
import { registerPlugin } from '@/infrastructure/plugins/plugin-registry';
import { fileTreePlugin } from '@/plugins/filetree';
import { monacoPlugin } from '@/plugins/monaco';
import { notesPlugin } from '@/plugins/notes';
import { terminalPlugin } from '@/plugins/terminal';
import { chatPlugin } from '@/plugins/chat';
import { previewPlugin } from '@/plugins/preview';

interface AppInitializerProps {
    children: ReactNode;
}

/**
 * PHASE 1A MODE FLAG
 * Set to true to disable Phase 2 features (AI, credentials, providers)
 * Set to false when Phase 2 development begins
 */
const PHASE_1A_MODE = true;

/**
 * AppInitializer wraps the app and ensures critical services are initialized
 * before any components that depend on them mount.
 *
 * Phase 1A: Focuses on core plugin stability and layout fixes
 * Phase 2: Will re-enable AI features, credential vault, and provider management
 */
export function AppInitializer({ children }: AppInitializerProps) {
    const hydrateProjects = useProjectStore(s => s.hydrateProjects);

    useEffect(() => {
        // Initialize all critical services on app boot
        const initServices = async () => {
            try {
                console.log('[AppInitializer] Starting initialization...');
                console.log(`[AppInitializer] Phase 1A Mode: ${PHASE_1A_MODE ? 'ENABLED' : 'DISABLED'}`);

                // PHASE 1A: Skip credential vault and AI provider initialization
                // These features are archived to _phase2-archive/ during Phase 1A
                if (!PHASE_1A_MODE) {
                    // Phase 2: Initialize credential vault
                    // const { credentialVault } = await import('@/lib/agent/providers/credential-vault');
                    // await credentialVault.initialize();
                    // console.log('[AppInitializer] Credential vault ready');
                } else {
                    console.log('[AppInitializer] Phase 1A: Skipping credential vault initialization');
                }

                // 1. Hydrate projects from Dexie (CRITICAL: Must happen before workspace migration)
                // This loads all persisted projects into the Zustand store cache
                await hydrateProjects();
                console.log('[AppInitializer] Projects hydrated from Dexie');

                // 2. Run workspace bindings migration (one-time, idempotent)
                // Fixes P0 blocker where projects had notes: false by default
                const migrationResult = await migrateWorkspaceBindings();
                if (migrationResult.executed) {
                    console.log('[AppInitializer] Workspace bindings migration completed:', {
                        migratedCount: migrationResult.migratedCount,
                        totalProjects: migrationResult.totalProjects,
                    });
                }

                // 3. Register service worker for offline support
                const swRegistration = await registerServiceWorker({
                    onRegistered: () => {
                        console.log('[AppInitializer] Service worker registered');
                    },
                    onUpdated: () => {
                        console.log('[AppInitializer] Service worker update available');
                    },
                    onUpdateFound: () => {
                        console.log('[AppInitializer] Service worker update found');
                    },
                    onError: (error) => {
                        console.error('[AppInitializer] Service worker registration failed:', error);
                    },
                });

                if (swRegistration) {
                    console.log('[AppInitializer] Offline mode enabled');
                }

                // 4. Register feature plugins (Phase 1A Core)
                console.log('[AppInitializer] Registering feature plugins...');
                registerPlugin(fileTreePlugin);
                console.log('[AppInitializer] FileTree plugin registered');
                registerPlugin(monacoPlugin);
                console.log('[AppInitializer] Monaco plugin registered');
                registerPlugin(notesPlugin);
                console.log('[AppInitializer] Notes plugin registered');
                registerPlugin(terminalPlugin);
                console.log('[AppInitializer] Terminal plugin registered');
                registerPlugin(chatPlugin);
                console.log('[AppInitializer] Chat plugin registered');
                registerPlugin(previewPlugin);
                console.log('[AppInitializer] Preview plugin registered');

                // PHASE 1A: Skip AI provider model fetching
                // This requires credential vault and provider stores (Phase 2)
                if (!PHASE_1A_MODE) {
                    // Phase 2: Auto-fetch models for ALL providers with credentials
                    // const { useAppStore } = await import('@/infrastructure/persistence/stores/use-app-store');
                    // const { credentialVault } = await import('@/lib/agent/providers/credential-vault');
                    // const { providers } = useAppStore.getState();
                    // await Promise.all(providers.map(async (provider) => {
                    //     const apiKey = await credentialVault.getCredentials(provider.id);
                    //     if (apiKey) {
                    //         await useAppStore.getState().fetchModels(provider.id);
                    //     }
                    // }));
                } else {
                    console.log('[AppInitializer] Phase 1A: Skipping AI provider model fetching');
                }

                console.log('[AppInitializer] ✅ Initialization complete');

            } catch (error) {
                console.error('[AppInitializer] ❌ Initialization failed:', error);
            }
        };

        initServices();
    }, [hydrateProjects]);

    return <>{children}</>;
}
