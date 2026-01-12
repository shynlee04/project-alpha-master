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
import { useProjectStore } from '@/lib/workspace/project-store/project-store-refactored';
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
 * @returns Browser mode project
 */
export async function getOrCreateBrowserModeProject(): Promise<Project | null> {
  try {
    const existing = await getProject(BROWSER_MODE_PROJECT_ID);
    if (existing) {
      return existing as Project;
    }

    // Create browser mode project if it doesn't exist
    // Use Zustand store's saveProject method
    const browserProjectData = {
      id: BROWSER_MODE_PROJECT_ID,
      name: BROWSER_MODE_DISPLAY_NAME,
      folderPath: 'Notes', // Uses IndexedDB storage (no file system)
      storageType: 'indexeddb' as const,
      createdAt: new Date(),
      lastOpened: new Date(),
      autoSync: false,
      bindings: { notes: true, knowledge: true },
      tags: [],
      isBrowserMode: true, // Special flag for browser mode
      isTemp: true, // Temporary/auto-created project
      autoCreated: true,
    } as Project;

    const { saveProject } = useProjectStore.getState();
    await saveProject(browserProjectData);

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
