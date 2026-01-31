/**
 * @fileoverview IDE Workspace Route with Project ID - SPIKE ISOLATED VERSION
 * @module routes/spike/ide.$projectId
 * @governance Story WB-6: Cross-Workspace Navigation
 * @updated 2026-01-22T21:30:00+07:00
 *
 * ============================================================================
 * @spike-copy-source: src/routes/ide.$projectId.tsx (main app)
 * ============================================================================
 *
 * PHASE 3 MIRROR COPY:
 * - Exact copy of main app IDE route implementation
 * - IMPORTS FROM ISOLATED SPIKE COPIES (@/spike/*)
 * - Integrates ProjectProvider for cross-workspace state sharing
 * - Loads IDE with file system sync, WebContainer, EventBus, and persistence
 *
 * Route Pattern: /spike/ide/$projectId
 * - ProjectProvider wraps IDELayout with project context
 * - WorkspaceProvider provides FSA adapter, sync manager, etc.
 * - WorkspaceSwitcher in header allows switching to Notes/Knowledge/Study
 *
 * INF-03 FIX: Added waitForHydration() to fix race condition where
 * loader runs before Zustand store hydration completes.
 *
 * ============================================================================
 * @spike-copy-notes
 * This code COPIED from main app to provide ISOLATED testing environment.
 * All imports use @/spike/* paths, NOT @/presentation/* or @/infrastructure/*
 *
 * Current Issues (to be documented):
 *   1. Direct Dexie access in loader (P0)
 *      - Line 97: const record = await db.projects.get(projectId);
 *      - Should use: Store hooks or service layer
 *      - Issue: Bypasses Zustand state layer
 *      - Remediation: Create repository layer, eliminate direct DB access
 *
 *   2. Platform guard already using getPlatformContract() (✅)
 *      - Line 74: if (!platform.canAccessIDE) { throw redirect... }
 *      - This is correct per ADR-033 D12
 *
 *   3. Store hydration handling (✅)
 *      - Line 93: await waitForHydration();
 *      - This is correct per ADR-034 D12
 *
 *   4. Composite keys properly used (✅)
 *      - Dexie schema uses [projectId+workspaceId] pattern
 *      - Compliant with ADR-033 D6
 *
 *   5. Cross-workspace state synchronization (✅)
 *      - Lines 124-126: Set projectId in IDE store & workspace store
 *      - This ensures state scoping per project
 *
 * ADR-033 Compliance Score: 6/10 (Partial)
 *   ✅ Composite keys properly implemented
 *   ✅ FSA handle persistence implemented
 *   ✅ Auto-detection of storage type implemented
 *   ✅ PlatformContract used in route guards
 *   ✅ Store hydration with waitForHydration implemented
 *   ❌ Presentation layer may have direct Dexie access (in IDELayout components)
 *   ❌ StorageGateway not used by presentation layer (in IDELayout components)
 *
 * REMEDIATION PRIORITY: P0 (address after routing works)
 *   - R1: Eliminate Direct Dexie Access in IDE components (6 hours)
 *   - R2: Eliminate Direct FSA API Calls in IDE components (10 hours)
 *   - R5: Eliminate Reactive State Duplication (6 hours)
 *   - R6: Refactor State Storage to Use Services (8 hours)
 *
 * ============================================================================
 */

import { lazy, Suspense, useEffect } from 'react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { ToastProvider } from '@/spike/components/ui/Toast/ToastContext';
import { Toast } from '@/spike/components/ui/Toast';
import { ProjectProvider } from '@/spike/lib/workspace/ProjectContext';
import type { Project } from '@/spike/infrastructure/persistence/stores/project/project-types';
import { useIDEStore } from '@/spike/stores/useIDEStore';
import { useWorkspaceStore } from '@/spike/stores/workspace-store';
import { ErrorBoundary } from '@/spike/components/common/ErrorBoundary';
import { getPlatformContract } from '@/spike/infrastructure/filesystem/platform-contract';
import { db } from '@/spike/infrastructure/persistence/dexie-db';
import { waitForHydration } from '@/spike/lib/wait-for-hydration';

// Lazy load IDELayout FROM ISOLATED SPIKE COPY
const IDELayout = lazy(() =>
  import('@/spike/components/ide/IDELayout').then(m => ({
    default: m.IDELayout,
  }))
);

export const Route = createFileRoute('/spike/ide/$projectId')({
  ssr: false,

  // P0 FIX: Route guards for platform validation ONLY (ADR-033 D12, ADR-034 D12)
  beforeLoad: async ({ params }) => {
    const { projectId } = params;
    console.log('[Spike/IDERoute] beforeLoad called for project:', projectId);

    // Check: Mobile users cannot access IDE (audit violation - ABSOLUTE)
    const platform = getPlatformContract();
    if (!platform.canAccessIDE) {
      console.warn('[Spike/IDERoute] Mobile/tablet access denied to IDE, redirecting to Notes');
      throw redirect({
        to: '/spike/notes/$projectId',
        params: { projectId },
        search: { reason: 'mobile-not-supported' }
      });
    }

    console.log('[Spike/IDERoute] Route guard passed (platform validated):', { projectId });
  },

  // INF-03 FIX: Use loader with waitForHydration per ADR-034 D12
  loader: async ({ params }) => {
    const { projectId } = params;
    console.log('[Spike/IDERoute.loader] Loading project:', projectId);

    // ✅ INF-03 FIX: Wait for Zustand store hydration before querying
    await waitForHydration();
    console.log('[Spike/IDERoute.loader] Hydration complete, querying Dexie...');

    // ✅ INF-03 FIX: Query Dexie directly (not Zustand/getProject facade)
    const record = await db.projects.get(projectId);

    if (!record) {
      console.error('[Spike/IDERoute.loader] Project not found in Dexie:', projectId);
      throw redirect({ to: '/spike' });
    }

    // Convert record to Project type
    const project = record as unknown as Project;
    console.log('[Spike/IDERoute.loader] Project found:', { id: project.id, name: project.name });
    return { project };
  },

  component: () => (
    <ErrorBoundary>
      <IDEWorkspace />
    </ErrorBoundary>
  ),
});

function IDEWorkspace() {
  const { projectId: _projectId } = Route.useParams();
  const { project } = Route.useLoaderData();

  // Store project ID in stores on mount
  useEffect(() => {
    if (_projectId) {
      useIDEStore.getState().setProjectId(_projectId);
      useWorkspaceStore.getState().setCurrentProject(_projectId);
      console.log('[Spike/IDERoute] Project ID set in IDE store & workspace store:', _projectId);
    }
  }, [_projectId]);

  return (
    <ProjectProvider project={project as Project | null} workspace="ide">
      <ToastProvider>
        <Suspense fallback={
          <div className="h-screen w-screen flex items-center justify-center bg-background">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        }>
          <IDELayout />
        </Suspense>
        <Toast />
      </ToastProvider>
    </ProjectProvider>
  );
}
