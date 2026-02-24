/**
 * @fileoverview Project Utils Slice
 * @module infrastructure/persistence/stores/project/project-utils-slice
 * @governance EPIC-CP-1.4
 *
 * Utility functions for project queries and updates.
 * 
 * 00-06: Migrated from workspaceBindings to plugins field
 */

import { StateCreator } from 'zustand';
import { db } from '@/infrastructure/persistence/dexie-db';
import { fromRecord, toRecord } from './project-crud-slice'; // PERSIST-S002: Import both converters
import type {
  ProjectState,
  ProjectUtilsMethods,
} from './project-types';
import type { PluginType } from '@/domain/entities/project';

/**
 * Helper to check if a project has a plugin enabled
 */
function hasPluginEnabled(project: { plugins?: { enabled?: PluginType[] } }, pluginType: PluginType): boolean {
  return project.plugins?.enabled?.includes(pluginType) ?? false;
}

export const createProjectUtilsSlice: StateCreator<
  ProjectState,
  [],
  [],
  ProjectUtilsMethods
> = (set, get) => ({
  // Update last opened timestamp
  updateLastOpened: async (projectId: string) => {
    const existing = get().projects[projectId];
    if (!existing) {
      console.warn('[ProjectStore] Project not found:', projectId);
      return;
    }

    const updated = {
      ...existing,
      lastOpened: new Date(),
    };

    set((state) => ({
      projects: { ...state.projects, [projectId]: updated },
    }));

    // Persist to Dexie
    // PERSIST-S002: Use toRecord() to ensure workspaceId is included
    const record = toRecord(updated);

    db.projects.put(record).catch((error) => {
      console.error('[ProjectStore] Failed to update lastOpened in Dexie:', error);
    });
  },

  // Hydrate projects from Dexie into Zustand store
  // Call this on app startup to load persisted projects
  hydrateProjects: async () => {
    console.log('[ProjectStore] Hydrating projects from Dexie...');

    try {
      const records = await db.projects.toArray();

      const projects: Record<string, any> = {};
      records.forEach((record) => {
        const project = fromRecord(record);
        projects[project.id] = project;
      });

      set((state) => ({
        ...state,
        projects,
        _hasHydrated: true,
      }));

      console.log(`[ProjectStore] Hydrated ${Object.keys(projects).length} projects from Dexie`);
    } catch (error) {
      console.error('[ProjectStore] Failed to hydrate projects from Dexie:', error);
      // Mark as hydrated even on error to prevent infinite retries
      set((state) => ({
        ...state,
        _hasHydrated: true,
      }));
    }
  },

  // Get recent projects
  getRecentProjects: (limit = 5) => {
    const projects = Object.values(get().projects);

    return projects
      .sort((a, b) => {
        const timeA = a.lastOpened ? new Date(a.lastOpened).getTime() : 0;
        const timeB = b.lastOpened ? new Date(b.lastOpened).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, limit);
  },

  // Search projects
  searchProjects: (query: string) => {
    const projects = Object.values(get().projects);
    const lowerQuery = query.toLowerCase();

    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(lowerQuery) ||
        project.description?.toLowerCase().includes(lowerQuery) ||
        project.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  },

  // Get projects by plugin (replaces getProjectsByWorkspace)
  getProjectsByPlugin: (pluginType: PluginType) => {
    const projects = Object.values(get().projects);

    return projects.filter((project) => hasPluginEnabled(project, pluginType));
  },

  // Get default project for plugin (replaces getDefaultProjectForWorkspace)
  getDefaultProjectForPlugin: (pluginType: PluginType) => {
    const projects = Object.values(get().projects);

    // Find most recently opened project with this plugin enabled
    const projectsWithPlugin = projects
      .filter((project) => hasPluginEnabled(project, pluginType))
      .sort((a, b) => {
        const timeA = a.lastOpened ? new Date(a.lastOpened).getTime() : 0;
        const timeB = b.lastOpened ? new Date(b.lastOpened).getTime() : 0;
        return timeB - timeA;
      });

    return projectsWithPlugin[0] || null;
  },

  // Get project statistics
  getProjectStats: () => {
    const projects = Object.values(get().projects);

    // Count projects by plugin
    const projectsByPlugin: Record<PluginType, number> = {
      editor: 0,
      notes: 0,
      chat: 0,
      terminal: 0,
      preview: 0,
      knowledge: 0,
      study: 0,
    };

    projects.forEach((project) => {
      const enabled = project.plugins?.enabled ?? [];
      enabled.forEach((plugin: PluginType) => {
        if (projectsByPlugin[plugin] !== undefined) {
          projectsByPlugin[plugin]++;
        }
      });
    });

    // Find recently created (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentlyCreated = projects.filter(
      (project) => project.createdAt >= sevenDaysAgo
    );

    // Find recently opened (last 7 days)
    const recentlyOpened = projects
      .filter((project) => {
        const lastOpened = project.lastOpened
          ? new Date(project.lastOpened)
          : new Date(0);
        return lastOpened >= sevenDaysAgo;
      })
      .sort((a, b) => {
        const timeA = a.lastOpened ? new Date(a.lastOpened).getTime() : 0;
        const timeB = b.lastOpened ? new Date(b.lastOpened).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 5);

    return {
      totalProjects: projects.length,
      activeProjects: projects.filter((p) => !p.deleted).length,
      deletedProjects: projects.filter((p) => p.deleted).length,
      projectsByPlugin,
      recentlyCreated,
      recentlyOpened,
    };
  },
});
