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
 *
 * PHASE0-1 FIX (2026-01-20):
 * - Write directly to Dexie instead of Zustand to eliminate race condition
 * - Handle empty object {} as needing migration
 * - Add verification function for debugging
 */

import type { WorkspaceBindings } from '@/infrastructure/persistence/dexie-db-core-types';
import { getProjectStoreState } from './useProjectStore';
import { db } from '@/infrastructure/persistence/dexie-db';

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

/**
 * PHASE0-1 FIX (2026-01-20):
 * Result of migration verification check.
 *
 * Used to verify that all projects in Dexie have correct bindings.
 */
export interface VerificationResult {
  /** Total projects in Dexie */
  totalProjects: number;
  /** Projects with all workspaces enabled */
  migratedCount: number;
  /** Whether all projects are migrated */
  migrated: boolean;
  /** Projects that need attention (disabled workspaces) */
  needsAttention: number;
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
 * PHASE0-1 FIX (2026-01-20):
 * - Empty object {} now triggers migration
 *
 * @param bindings - Project's current workspace bindings
 * @returns true if at least one workspace is disabled
 */
export function needsMigration(bindings: WorkspaceBindings | undefined): boolean {
  if (!bindings) return true; // No bindings = needs migration

  // PHASE0-1 FIX: Check for empty object
  const keys = Object.keys(bindings) as (keyof WorkspaceBindings)[];
  if (keys.length === 0) return true; // Empty object = needs migration

  // Check if any workspace is disabled
  return keys.some((key) => bindings[key] !== true);
}

/**
 * Execute workspace bindings migration.
 *
 * Process:
 * 1. Check if migration already ran (return early if true)
 * 2. Get all projects from Dexie (single source of truth)
 * 3. Identify projects with disabled workspaces
 * 4. Update bindings in Dexie directly (PHASE0-1 FIX)
 * 5. Mark migration as complete
 * 6. Return migration result
 *
 * PHASE0-1 FIX (2026-01-20):
 * - Write directly to Dexie instead of Zustand to eliminate race condition
 * - use-fsa-projects.ts reads from Dexie via useLiveQuery()
 * - Zustand updates are transient and race with async Dexie persistence
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

  console.log('[Migration] Starting workspace bindings migration (PHASE0-1 - direct Dexie writes)...');

  // Step 2: Get all projects from Dexie (single source of truth)
  const allProjects = await db.projects.toArray();
  const migratedProjectIds: string[] = [];
  const failedProjectIds: string[] = [];

  // Step 3: Filter projects needing migration
  // ARC-D03: Check both workspaceBindings (new) and bindings (legacy)
  const projectsNeedingMigration = allProjects.filter((project) =>
    needsMigration(project.workspaceBindings || (project as any).bindings)
  );

  console.log(`[Migration] Found ${projectsNeedingMigration.length} projects needing migration out of ${allProjects.length} total`);

  // Step 4: Update each project's workspaceBindings directly in Dexie (PHASE0-1 FIX)
  for (const project of projectsNeedingMigration) {
    try {
      await db.projects.update(project.id, {
        workspaceBindings: DEFAULT_BINDINGS_ALL_ENABLED,
        lastOpened: new Date(), // Update to trigger reactivity in useLiveQuery
      });
      migratedProjectIds.push(project.id);

      console.log(`[Migration] ✅ Migrated ${project.id} (${project.name}) - All workspaces enabled`);
    } catch (error) {
      console.error(`[Migration] ❌ Failed to migrate ${project.id}:`, error);
      failedProjectIds.push(project.id);
    }
  }

  // Step 5: Mark migration complete
  markMigrationComplete(timestamp);

  // Step 5.5: Migrate FSA projects to Notes (TASK8-WSBINDINGS FIX)
  await migrateFSAProjectsToNotes();

  // Step 6: Log result
  console.log(`[Migration] Workspace bindings migration completed:`, {
    migratedCount: migratedProjectIds.length,
    failedCount: failedProjectIds.length,
    totalProjects: allProjects.length,
    migratedProjectIds,
    failedProjectIds,
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
 * Migrate FSA projects specifically for Notes workspace.
 *
 * TASK8-WSBINDINGS FIX (2026-01-20):
 * - Ensures FSA projects have workspaceBindings.notes === true
 * - Fixes issue where Notes redirects to IDE-only projects
 * - Notes filtering: Only shows projects where workspaceBindings.notes === true
 *
 * Process:
 * 1. Get all FSA projects from Dexie
 * 2. Check if notes binding is missing or false
 * 3. Update bindings to enable notes workspace
 * 4. Update lastOpened to trigger useLiveQuery refresh
 *
 * @returns Number of migrated FSA projects
 */
export async function migrateFSAProjectsToNotes(): Promise<number> {
  console.log('[Migration] Starting FSA Notes binding migration...');

  const fsaProjects = await db.projects
    .where('storageType')
    .equals('fsa')
    .toArray();

  let migratedCount = 0;

  for (const project of fsaProjects) {
    // Set Notes binding if not set or set to false
    const currentBindings = project.workspaceBindings || (project as any).bindings;
    const needsNotesBinding = !currentBindings || currentBindings.notes === false;

    if (needsNotesBinding) {
      await db.projects.update(project.id, {
        workspaceBindings: {
          ...currentBindings,
          notes: true,  // ✅ Enable Notes
        },
        lastOpened: new Date(), // Trigger useLiveQuery refresh
      });

      migratedCount++;
      console.log(`[Migration] ✅ Migrated project "${project.name}" (${project.id}) to Notes-enabled`);
    }
  }

  console.log(`[Migration] FSA Notes binding complete: ${migratedCount} projects migrated`);
  return migratedCount;
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

/**
 * Verify migration success by checking Dexie directly
 *
 * PHASE0-1 FIX (2026-01-20):
 * Useful for debugging and CI/CD validation. Checks that all projects
 * in Dexie have all workspace bindings enabled.
 *
 * @returns Verification result with migration status
 */
export async function verifyMigration(): Promise<VerificationResult> {
  const allProjects = await db.projects.toArray();

  const migrated = allProjects.filter(p => {
    const bindings = p.workspaceBindings || (p as any).bindings;
    if (!bindings || Object.keys(bindings).length === 0) return false;

    const keys = Object.keys(bindings) as (keyof WorkspaceBindings)[];
    return keys.every(key => bindings[key] === true);
  });

  return {
    totalProjects: allProjects.length,
    migratedCount: migrated.length,
    migrated: migrated.length === allProjects.length,
    needsAttention: allProjects.length - migrated.length,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get migration metadata for logging/display.
 *
 * PHASE0-1 FIX (2026-01-20):
 * Updated description to reflect direct Dexie writes.
 *
 * @returns Migration configuration info
 */
export function getMigrationMetadata() {
  return {
    version: 1,
    key: MIGRATION_KEY,
    defaultBindings: DEFAULT_BINDINGS_ALL_ENABLED,
    description: 'Enable all workspaces for existing projects (writes directly to Dexie)',
  };
}
