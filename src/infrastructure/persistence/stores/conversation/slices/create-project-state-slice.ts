/**
 * Project State Slice
 *
 * Manages project-scoped conversation state and hydration.
 * Part of the December 2025 Zustand slices pattern.
 *
 * @module conversation/slices/project-state
 */

import { StateCreator } from 'zustand';

/**
 * Project State & Actions
 */
export interface ProjectStateSlice {
    /** Currently active thread ID */
    activeThreadId: string | null;
    /** Currently selected project ID */
    currentProjectId: string | null;
    /** Hydration status */
    _hasHydrated: boolean;

    /** Set hydration status */
    setHasHydrated: (state: boolean) => void;

    /** Set current project (resets active thread) */
    setCurrentProject: (projectId: string) => void;
}

/**
 * Project State Slice Implementation
 */
export const createProjectStateSlice: StateCreator<
    ProjectStateSlice,
    [],
    [],
    ProjectStateSlice
> = (set) => ({
    activeThreadId: null,
    currentProjectId: null,
    _hasHydrated: false,

    setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
    },

    setCurrentProject: (projectId: string) => {
        console.log('[ProjectStateSlice] Setting current project:', projectId);
        set({ currentProjectId: projectId, activeThreadId: null });
    },
});
