/**
 * @fileoverview Workspace Bindings Migration
 * @module infrastructure/persistence/stores/project/migrate-bindings
 * @governance EPIC-CP-1.4
 *
 * One-time migration: Enable all workspaces for existing projects.
 *
 * Problem: Projects created before 2026-01-06 had bindings.notes: false by default,
 * preventing users from accessing Notes workspace without manual UI intervention.
 *
 * Solution: This migration ensures all workspaces (ide, notes, knowledge, study)
 * are enabled by default for existing projects.
 *
 * Migration tracking: Uses localStorage key 'workspace-bindings-migration-v1'
 * to ensure migration runs only once.
 */

import type { WorkspaceBindings } from '@/infrastructure/persistence/dexie-db-core-types';
import { getProjectStoreState } from './useProjectStore';

// ============================================================================
// MIGRATION CONSTANTS
// ============================================================================

/**
 * localStorage key for tracking migration execution
 */
const MIGRATION_KEY = 'workspace-bindings-migration-v1';

/**
 * Default bindings with all workspaces enabled
 */
const DEFAULT_BINDINGS_ALL_ENABLED: WorkspaceBindings = {
  ide: true,
  notes: true,
  knowledge: true,
  study: true,
};

// ============================================================================
// MIGRATION RESULT TYPES
// ============================================================================

/**
 * Result of workspace bindings migration
 */
export interface MigrationResult {
  /** Whether migration was executed (false if already ran) */
  executed: boolean;
  /** Number of projects migrated */
  migratedCount: number;
  /** Total projects checked */
  totalProjects: number;
  /** IDs of projects that were migrated */
  migratedProjectIds: string[];
  /** Timestamp of migration */
  timestamp?: number;
}

/**
 * Validation check for migration eligibility
 */
export interface MigrationEligibility {
  /** Whether migration is needed */
  needsMigration: boolean;
  /** Projects that need migration (have disabled workspaces) */
  projectsNeedingMigration: string[];
  /** Current migration status */
  alreadyMigrated: boolean;
}

// ============================================================================
// MIGRATION FUNCTIONS
// ============================================================================

/**
 * Check if migration has already been executed.
 *
 * @returns true if migration marker exists in localStorage
 */
export function hasMigrationRan(): boolean {
  return localStorage.getItem(MIGRATION_KEY) !== null;
}

/**
 * Mark migration as complete in localStorage.
 *
 * @param timestamp - Migration execution timestamp
 */
export function markMigrationComplete(timestamp: number): void {
  localStorage.setItem(MIGRATION_KEY, timestamp.toString());
}

/**
 * Check if a project's bindings need migration.
 *
 * A project needs migration if any workspace binding is false/undefined.
 *
 * @param bindings - Project's current workspace bindings
 * @returns true if at least one workspace is disabled
 */
export function needsMigration(bindings: WorkspaceBindings | undefined): boolean {
  if (!bindings) return true; // No bindings = needs migration
  return Object.values(bindings).some((value) => value !== true);
}

/**
 * Execute workspace bindings migration.
 *
 * Process:
 * 1. Check if migration already ran (return early if true)
 * 2. Get all projects from store
 * 3. Identify projects with disabled workspaces
 * 4. Update bindings to all workspaces enabled
 * 5. Mark migration as complete
 * 6. Return migration result
 *
 * @returns Migration result with counts and affected project IDs
 */
export async function migrateWorkspaceBindings(): Promise<MigrationResult> {
  const timestamp = Date.now();

  // Step 1: Check if already ran
  if (hasMigrationRan()) {
    return {
      executed: false,
      migratedCount: 0,
      totalProjects: 0,
      migratedProjectIds: [],
    };
  }

  // Step 2: Get all projects from store
  const state = getProjectStoreState();
  const allProjects = Object.values(state.projects || {});
  const migratedProjectIds: string[] = [];

  // Step 3: Filter projects needing migration
  // ARC-D03: Check both workspaceBindings (new) and bindings (legacy)
  const projectsNeedingMigration = allProjects.filter((project) =>
    needsMigration(project.workspaceBindings || (project as any).bindings)
  );

  // Step 4: Update each project's workspaceBindings (ARC-D03)
  for (const project of projectsNeedingMigration) {
    // Update workspaceBindings via store (using new field name)
    state.updateProject(project.id, {
      workspaceBindings: DEFAULT_BINDINGS_ALL_ENABLED,
    });
    migratedProjectIds.push(project.id);
  }

  // Step 5: Mark migration complete
  markMigrationComplete(timestamp);

  // Step 6: Log result
  console.log(`[Migration] Workspace bindings migration completed:`, {
    migratedCount: migratedProjectIds.length,
    totalProjects: allProjects.length,
    migratedProjectIds,
  });

  return {
    executed: true,
    migratedCount: migratedProjectIds.length,
    totalProjects: allProjects.length,
    migratedProjectIds,
    timestamp,
  };
}

/**
 * Check migration eligibility without executing.
 *
 * Useful for showing UI prompts or logging before migration.
 *
 * @returns Eligibility check with project IDs needing migration
 */
export function checkMigrationEligibility(): MigrationEligibility {
  const alreadyMigrated = hasMigrationRan();

  if (alreadyMigrated) {
    return {
      needsMigration: false,
      projectsNeedingMigration: [],
      alreadyMigrated: true,
    };
  }

  const state = getProjectStoreState();
  const allProjects = Object.values(state.projects || {});
  // ARC-D03: Check both workspaceBindings (new) and bindings (legacy)
  const projectsNeedingMigration = allProjects
    .filter((project) => needsMigration(project.workspaceBindings || (project as any).bindings))
    .map((project) => project.id);

  return {
    needsMigration: projectsNeedingMigration.length > 0,
    projectsNeedingMigration,
    alreadyMigrated: false,
  };
}

/**
 * Rollback migration (for testing/debugging).
 *
 * Removes migration marker from localStorage, allowing
 * migration to run again on next app load.
 *
 * @warning This should only be used in development/testing
 */
export function rollbackMigration(): void {
  localStorage.removeItem(MIGRATION_KEY);
  console.warn('[Migration] Workspace bindings migration rolled back');
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get migration metadata for logging/display.
 *
 * @returns Migration configuration info
 */
export function getMigrationMetadata() {
  return {
    version: 1,
    key: MIGRATION_KEY,
    defaultBindings: DEFAULT_BINDINGS_ALL_ENABLED,
    description: 'Enable all workspaces for existing projects',
  };
}
