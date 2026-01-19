import { createFileRoute, redirect } from '@tanstack/react-router';
import { db } from '@/infrastructure/persistence/dexie-db';
import { waitForHydration } from '@/infrastructure/persistence/stores/project/wait-for-hydration';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';
import { requireIDEAccess } from '@/infrastructure/filesystem/route-guards';

export const Route = createFileRoute('/study/$projectId')({
  // FIX-ARC-01: Add platform guard
  beforeLoad: async ({ params }) => {
    await requireIDEAccess(params.projectId);
  },
  // INF-03 FIX: Use loader with waitForHydration
  loader: async ({ params }) => {
    const { projectId } = params;
    console.log('[StudyRoute.loader] Loading project:', projectId);

    await waitForHydration();
    
    const record = await db.projects.get(projectId);
    
    if (!record) {
      console.error('[StudyRoute.loader] Project not found:', projectId);
      throw redirect({ to: '/hub' });
    }

    const project = record as unknown as Project;
    return { project };
  },
});
