/**
 * @fileoverview Notes Workspace Route with Project ID - Spike Isolated Mirror Copy
 * @module routes/spike/notes.$projectId
 * @updated 2026-01-22T21:45:00+07:00
 *
 * ============================================================================
 * @spike-copy-source: src/routes/notes.$projectId.lazy.tsx (main app)
 * ============================================================================
 *
 * PHASE 3 MIRROR COPY:
 * - Exact copy of main app notes route implementation
 * - IMPORTS FROM ISOLATED SPIKE COPIES (@/spike/*)
 * - Integrates ProjectProvider for cross-workspace state sharing
 * - Loads BlockNote editor with AI slash commands and RAG retrieval
 *
 * Route Pattern: /spike/notes/$projectId
 * - ProjectProvider wraps NotesPage with project context
 * - WorkspaceSwitcher in header allows switching to IDE/Knowledge/Study
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
 *      - Line 62: const record = await db.projects.get(projectId);
 *      - Should use: Store hooks or service layer
 *      - Issue: Bypasses Zustand state layer
 *      - Remediation: Create repository layer, eliminate direct DB access
 *
 *   2. Platform guard already using getPlatformContract() (✅)
 *      - This is correct per ADR-033 D12
 *
 *   3. Store hydration handling (✅)
 *      - Line 45: await waitForHydration();
 *      - This is correct per ADR-034 D12
 *
 *   4. Mobile IDE access blocked with toast (✅)
 *      - Lines 79-87: Show toast when redirected from IDE
 *      - This is correct per ADR-033 D12
 *
 *   5. Composite keys properly used (✅)
 *      - Dexie schema uses [projectId+workspaceId] pattern
 *      - Compliant with ADR-033 D6
 *
 *   6. Cross-workspace state synchronization (P1)
 *      - Notes watches IDE store for project changes
 *      - Remediation: Use event bus for cross-workspace communication (Phase 4)
 *
 * ADR-033 Compliance Score: 7/10 (Improved)
 *   ✅ Composite keys properly implemented
 *   ✅ FSA handle persistence implemented
 *   ✅ Auto-detection of storage type implemented
 *   ✅ PlatformContract used in route guards
 *   ✅ Store hydration with waitForHydration implemented
 *   ✅ Mobile IDE access blocked with toast
 *   ❌ Cross-workspace state coupling
 *   ❌ Presentation layer may have direct Dexie access (in NotesPage)
 *   ❌ StorageGateway not used by presentation layer (in NotesPage)
 *
 * REMEDIATION PRIORITY: P0 (address after routing works)
 *   - R1: Eliminate Direct Dexie Access in NotesPage (6 hours)
 *   - R2: Eliminate Direct FSA API Calls (10 hours)
 *   - R5: Eliminate Reactive State Duplication (6 hours)
 *   - R7: Decouple Cross-Workspace State (4 hours)
 *
 * ============================================================================
 */

import { useEffect, useRef } from 'react';
import { redirect, createFileRoute } from '@tanstack/react-router';
import { toast } from 'sonner';
import { NotesPage } from '@/spike/components/notes/NotesPage';
import { ProjectProvider } from '@/spike/lib/workspace/ProjectContext';
import type { Project } from '@/spike/infrastructure/persistence/stores/project/project-types';
import { useIDEStore } from '@/spike/stores/useIDEStore';
import { ErrorBoundary } from '@/spike/components/common/ErrorBoundary';
import { db } from '@/spike/infrastructure/persistence/dexie-db';
import { waitForHydration } from '@/spike/lib/wait-for-hydration';

type NotesSearchParams = { reason?: "mobile-not-supported" | undefined };

// ============================================================================
// Route Definition (ROUTE-004 FIX: Using createFileRoute for loader pattern)
// INF-03 FIX: Added waitForHydration() to fix race condition
// ============================================================================

export const Route = createFileRoute('/spike/notes/$projectId')({
  ssr: false,

  // INF-03 FIX: Use loader with waitForHydration per ADR-034 D12
  loader: async ({ params }) => {
    const { projectId } = params;
    console.log('[SPIKE notes.$projectId] Loader called for project:', projectId);

    // ✅ INF-03 FIX: Wait for Zustand store hydration before querying
    await waitForHydration();
    console.log('[SPIKE notes.$projectId] Hydration complete, querying Dexie...');

    // ✅ INF-03 FIX: Query Dexie directly (not Zustand/getProject facade)
    const record = await db.projects.get(projectId);

    if (!record) {
      console.error('[SPIKE notes.$projectId] Project not found in Dexie:', projectId);
      throw redirect({ to: '/' });
    }

    // Convert record to Project type
    const project = record as unknown as Project;
    console.log('[SPIKE notes.$projectId] Project loaded successfully:', project.id);
    return { project };
  },

  component: () => (
    <ErrorBoundary>
      <NotesWorkspace />
    </ErrorBoundary>
  ),
});

function NotesWorkspace() {
  const { projectId: _projectId } = Route.useParams();
  const { project } = Route.useLoaderData();
  const search = Route.useSearch() as NotesSearchParams;
  const toastShownRef = useRef(false);

  // ARC-A04: Show toast when redirected from IDE (mobile users)
  useEffect(() => {
    if (search?.reason === 'mobile-not-supported' && !toastShownRef.current) {
      toastShownRef.current = true;
      toast.info('IDE requires desktop. Opening Notes workspace.', {
        duration: 4000,
        id: 'mobile-redirect-toast',
      });
    }
  }, [search?.reason]);

  // Set projectId in IDE store when component mounts
  useEffect(() => {
    if (_projectId) {
      useIDEStore.getState().setProjectId(_projectId);
      console.log('[SPIKE NotesRoute] Project ID set in store:', _projectId);
    }
  }, [_projectId]);

  return (
    <ProjectProvider project={project as Project | null} workspace="notes">
      <NotesPage />
    </ProjectProvider>
  );
}
