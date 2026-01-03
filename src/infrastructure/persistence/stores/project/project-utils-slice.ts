/**
 * @fileoverview Project Utils Slice
 * @module infrastructure/persistence/stores/project/project-utils-slice
 * @governance EPIC-CP-1.4
 *
 * Utility functions for project queries and updates.
 */

import { StateCreator } from 'zustand';
import type {
  WorkspaceType,
  WorkspaceBindings,
  ProjectState,
  ProjectUtilsMethods,
} from './project-types';

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
    // TODO: Add Dexie persistence
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

  // Get projects by workspace binding
  getProjectsByWorkspace: (workspaceType: WorkspaceType) => {
    const projects = Object.values(get().projects);

    return projects.filter((project) => {
      const binding = project.bindings[workspaceType as keyof WorkspaceBindings];
      return binding === true;
    });
  },

  // Get default project for workspace
  getDefaultProjectForWorkspace: (workspaceType: WorkspaceType) => {
    const projects = Object.values(get().projects);

    // Find most recently opened project with this workspace enabled
    const projectsWithWorkspace = projects
      .filter((project) => project.bindings[workspaceType as keyof WorkspaceBindings] === true)
      .sort((a, b) => {
        const timeA = a.lastOpened ? new Date(a.lastOpened).getTime() : 0;
        const timeB = b.lastOpened ? new Date(b.lastOpened).getTime() : 0;
        return timeB - timeA;
      });

    return projectsWithWorkspace[0] || null;
  },

  // Get project statistics
  getProjectStats: () => {
    const projects = Object.values(get().projects);

    // Count projects by workspace bindings
    const projectsByWorkspace: Record<string, number> = {
      ide: 0,
      knowledge: 0,
      notes: 0,
      study: 0,
    };

    projects.forEach((project) => {
      (Object.keys(project.bindings) as WorkspaceType[]).forEach((workspace) => {
        if (project.bindings[workspace as keyof WorkspaceBindings] === true) {
          projectsByWorkspace[workspace]++;
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
      projectsByWorkspace: projectsByWorkspace as Record<WorkspaceType, number>,
      recentlyCreated,
      recentlyOpened,
    };
  },
});
