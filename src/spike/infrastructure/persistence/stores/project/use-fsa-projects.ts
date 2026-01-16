// src/infrastructure/persistence/stores/project/use-fsa-projects.ts
// Custom hook to fetch FSA projects with workspaceBindings.notes === true
// Fixes: "Rendered fewer hooks than expected" error by always calling useLiveQuery at top level

import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { getPlatformContract } from '@/infrastructure/filesystem/platform-contract';
import { db } from '@/infrastructure/persistence/dexie-db';
import type { Project } from './project-types';

/**
 * Custom hook to fetch FSA projects for Notes workspace
 * Always calls useLiveQuery at top level (no conditional)
 * Filters in useMemo (deferred evaluation)
 * 
 * @returns Array of FSA projects with notes binding
 */
export function useFSAProjects(): Project[] {
  const platform = getPlatformContract();

  // ✅ ALWAYS call hook at top level (no conditional)
  const allProjects = useLiveQuery(() => db.projects.toArray(), []);

  // ✅ Filter in useMemo (deferred, not in hook)
  const fsaProjects = useMemo(() => {
    if (!platform.canAccessFSA) return [];
    
    return (allProjects?.filter(
      (p) => p.storageType === 'fsa' && p.workspaceBindings?.notes === true
    ) ?? []) as Project[];
  }, [allProjects, platform.canAccessFSA]);
  
  return fsaProjects;
}

/**
 * Custom hook to get browser-mode project for mobile
 *
 * ⚠️ DEPRECATED: This function will be removed in Phase 4.
 * Browser-mode pseudo-project pattern is deprecated.
 * Users should create real projects via hub.
 *
 * Always calls useLiveQuery at top level (no conditional)
 *
 * @returns Browser-mode project or null
 * @deprecated Use explicit project creation via hub instead.
 */
export function useBrowserModeProject(): Project | null {
  const platform = getPlatformContract();

  // ✅ ALWAYS call hook at top level (no conditional)
  const browserProject = useLiveQuery(async () => {
    if (platform.canAccessFSA) return null; // Desktop: not needed

    const project = await db.projects.get('proj_browser-default');
    if (project) {
      console.warn('[DEPRECATED] Browser-mode project is deprecated and will be removed in Phase 4.');
    }
    return project as Project | null;
  }, [platform.canAccessFSA]);

  return browserProject ?? null;
}
