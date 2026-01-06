/**
 * @fileoverview Project Utils Slice - ID generation, DB connection, migration
 * @module workspace/project-store/project-utils-slice
 */

import { StateCreator } from 'zustand';

export interface ProjectUtilsSliceState {
  /** Whether legacy migration has been attempted */
  legacyMigrationAttempted: boolean;
}

export interface ProjectUtilsSliceActions {
  /** Generate a unique project ID */
  generateProjectId: () => string;

  /** Set migration flag */
  setLegacyMigrationAttempted: (attempted: boolean) => void;

  /** Get database connection (delegates to Dexie) */
  getDB: () => Promise<any>;
}

export type ProjectUtilsSlice = ProjectUtilsSliceState & ProjectUtilsSliceActions;

export const createProjectUtilsSlice: StateCreator<
  ProjectUtilsSlice,
  [],
  [],
  ProjectUtilsSlice
> = (set) => ({
  legacyMigrationAttempted: false,

  generateProjectId: () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback: timestamp + random
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  },

  setLegacyMigrationAttempted: (attempted) => {
    set({ legacyMigrationAttempted: attempted });
  },

  getDB: async () => {
    // This will delegate to the persistence layer
    const { getPersistenceDB } = await import('@/lib/persistence');
    return await getPersistenceDB();
  },
});
