import { createFileRoute, redirect } from '@tanstack/react-router';
import { db } from '@/infrastructure/persistence/dexie-db';
import { waitForHydration } from '@/infrastructure/persistence/stores/project/wait-for-hydration';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';
import { requireIDEAccess } from '@/infrastructure/filesystem/route-guards';

export const Route = createFileRoute('/knowledge/$projectId')({
  // FIX-ARC-01: Add platform guard
  beforeLoad: async ({ params }) => {
    await requireIDEAccess(params.projectId);
  },
  // INF-03 FIX: Use loader with waitForHydration
  loader: async ({ params }) => {
    const { projectId } = params;
    console.log('[KnowledgeRoute.loader] Loading project:', projectId);

    await waitForHydration();
    
    const record = await db.projects.get(projectId);
    
    if (!record) {
      console.error('[KnowledgeRoute.loader] Project not found:', projectId);
      throw redirect({ to: '/hub' });
    }

    const project = record as unknown as Project;
    return { project };
  },
});
