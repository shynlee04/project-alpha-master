import { createFileRoute, redirect } from '@tanstack/react-router';
import { db } from '@/infrastructure/persistence/dexie-db';
import { waitForHydration } from '@/infrastructure/persistence/stores/project/wait-for-hydration';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';

export const Route = createFileRoute('/notes/$projectId')({
  ssr: false,
  loader: async ({ params }) => {
    const { projectId } = params;
    
    // Wait for hydration to ensure DB is ready and consistent
    await waitForHydration();

    // Query Dexie directly for the project
    const record = await db.projects.get(projectId);
    
    if (!record) {
      throw redirect({ to: '/hub' });
    }

    return { project: record as unknown as Project };
  },
});
