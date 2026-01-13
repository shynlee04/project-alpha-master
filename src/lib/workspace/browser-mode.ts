/**
 * @fileoverview Browser Mode Utilities
 * @module lib/workspace/browser-mode
 * @governance 45-04
 *
 * Provides "browser mode" functionality for Notes workspace.
 * Browser mode allows viewing/editing notes across all projects without
 * requiring explicit project selection.
 *
 * Usage:
 *   const browserProject = await getOrCreateBrowserModeProject();
 *   if (isBrowserModeProject(project)) { ... }
 */

import { getProject } from '@/lib/workspace/project-store';
// FIX-2026-01-14: Use infrastructure store which has REAL Dexie persistence
// The lib/workspace version is a STUB that doesn't persist
import { useProjectStore } from '@/infrastructure/persistence/stores/project/useProjectStore';
import { db } from '@/infrastructure/persistence/dexie-db';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';

/** Default browser mode project ID */
export const BROWSER_MODE_PROJECT_ID = 'notes:browser-mode';

/** Browser mode project display name */
export const BROWSER_MODE_DISPLAY_NAME = 'Browser Mode';

/**
 * Check if a project is the browser mode project
 * @param project - Project to check
 * @returns True if this is the browser mode project
 */
export function isBrowserModeProject(project: Project | null): boolean {
  return project?.id === BROWSER_MODE_PROJECT_ID || project?.isBrowserMode === true;
}

/**
 * Get or create the default browser mode project
 * Creates the browser mode project if it doesn't exist
 * 
 * FIX-2026-01-14: Uses DIRECT Dexie persistence instead of broken Zustand store facade
 * The lib/workspace/project-store saveProject was a STUB that didn't persist.
 * 
 * @returns Browser mode project
 */
export async function getOrCreateBrowserModeProject(): Promise<Project | null> {
  try {
    // Check Dexie directly for existing project
    const existingRecord = await db.projects.get(BROWSER_MODE_PROJECT_ID);
    if (existingRecord) {
      // Update lastOpened
      await db.projects.update(BROWSER_MODE_PROJECT_ID, { lastOpened: new Date() });
      
      // Convert record to Project type
      const project: Project = {
        id: existingRecord.id,
        name: existingRecord.name,
        folderPath: existingRecord.folderPath || existingRecord.path || 'Notes',
        storageType: 'indexeddb',
        lastOpened: new Date(),
        createdAt: new Date(existingRecord.createdAt),
        autoSync: false,
        bindings: existingRecord.bindings || { notes: true, knowledge: true },
        tags: [],
        isBrowserMode: true,
        isTemp: true,
        autoCreated: true,
      };
      
      // Also update Zustand store for reactive UI
      useProjectStore.setState((state) => ({
        projects: { ...state.projects, [project.id]: project },
      }));
      
      console.log('[BrowserMode] Found existing browser mode project:', BROWSER_MODE_PROJECT_ID);
      return project;
    }

    // Create browser mode project if it doesn't exist
    const now = new Date();
    const browserProjectData: Project = {
      id: BROWSER_MODE_PROJECT_ID,
      name: BROWSER_MODE_DISPLAY_NAME,
      folderPath: 'Notes', // Uses IndexedDB storage (no file system)
      storageType: 'indexeddb',
      createdAt: now,
      lastOpened: now,
      autoSync: false,
      bindings: { notes: true, knowledge: true, ide: false, study: false },
      tags: [],
      isBrowserMode: true, // Special flag for browser mode
      isTemp: true, // Temporary/auto-created project
      autoCreated: true,
    };

    // FIX-2026-01-14: Persist DIRECTLY to Dexie (bypass broken store facade)
    const dexieRecord = {
      id: BROWSER_MODE_PROJECT_ID,
      name: BROWSER_MODE_DISPLAY_NAME,
      path: 'Notes',
      folderPath: 'Notes',
      workspaceId: 'notes' as const,
      storageType: 'indexeddb' as const,
      lastOpened: now,
      createdAt: now,
      bindings: browserProjectData.bindings,
      isTemp: true,
      isBrowserMode: true,
      autoCreated: true,
    };
    
    await db.projects.put(dexieRecord);
    
    // Also update Zustand store for reactive UI
    useProjectStore.setState((state) => ({
      projects: { ...state.projects, [browserProjectData.id]: browserProjectData },
    }));

    console.log('[BrowserMode] Created browser mode project:', BROWSER_MODE_PROJECT_ID);
    return browserProjectData;
  } catch (error) {
    console.error('[BrowserMode] Failed to create browser mode project:', error);
    return null;
  }
}

/**
 * Get all notes across all projects for browser mode
 * This is a placeholder - actual implementation depends on note store structure
 * @param noteStore - The note store instance
 * @returns All notes from all projects
 */
export function getAllNotesFromAllProjects(noteStore: any): any[] {
  // The note store should have a method to get all notes regardless of project
  // For now, return the current notes array
  if (typeof noteStore?.getState === 'function') {
    const state = noteStore.getState();
    // Return all notes, filtering out any null/undefined values
    return Object.values(state.notes || {}).filter(Boolean);
  }
  return [];
}

/**
 * Get project info for a note's projectId
 * @param projectId - Project ID to look up
 * @returns Project or null
 */
export async function getProjectForNote(projectId: string): Promise<Project | null> {
  if (!projectId || projectId === BROWSER_MODE_PROJECT_ID) {
    return null;
  }
  try {
    return await getProject(projectId) as Project | null;
  } catch {
    return null;
  }
}
