/**
 * @fileoverview Project Migration Utilities
 * @module lib/workspace/migrate-projects
 * @governance WB-8 FSA Project Management
 * @created 2026-01-19
 *
 * Migration utilities for updating existing projects to enable new features.
 * These are one-time migrations that should be run after specific fixes.
 *
 * ## Migration: Enable Notes on FSA Projects
 *
 * This migration updates all FSA projects to have `notes: true` in their
 * workspaceBindings, enabling Notes workspace access for existing projects.
 */

import { db } from '@/infrastructure/persistence/dexie-db';
import type { WorkspaceBindings } from '@/infrastructure/persistence/stores/project/project-types';

// ============================================================================
// Migration Result Types
// ============================================================================

export interface MigrationResult {
  /** Number of projects successfully migrated */
  updated: number;
  /** Number of projects that failed to migrate */
  failed: number;
  /** IDs of projects that failed to migrate */
  failedIds: string[];
  /** Details of what was changed */
  details: Array<{
    projectId: string;
    projectName: string;
    changes: string[];
  }>;
}

export interface NotesBindingMigrationResult extends MigrationResult {
  /** Projects that already had Notes enabled */
  skipped: string[];
}

// ============================================================================
// Migration: Enable Notes Binding on FSA Projects
// ============================================================================

/**
 * Migration: Enable Notes binding on existing FSA projects
 *
 * This one-time migration updates all projects with storageType='fsa'
 * to have workspaceBindings.notes=true, enabling Notes workspace access.
 *
 * **Background**: Prior to BUG-FIX-005 (2026-01-19), FSA projects were created
 * with notes: false by default. After the fix, new projects have notes: true,
 * but existing projects need this migration to enable Notes workspace.
 *
 * **When to run**: Run once after deploying BUG-FIX-005 to enable Notes for
 * existing FSA projects. Safe to run multiple times (idempotent).
 *
 * @returns Migration result with stats and details
 *
 * @example
 * ```ts
 * import { migrateFSAProjectsToEnableNotes } from '@/lib/workspace/migrate-projects';
 *
 * const result = await migrateFSAProjectsToEnableNotes();
 * console.log(`Migrated ${result.updated} projects, ${result.failed} failed`);
 *
 * if (result.failed > 0) {
 *   console.error('Failed projects:', result.failedIds);
 * }
 * ```
 */
export async function migrateFSAProjectsToEnableNotes(): Promise<NotesBindingMigrationResult> {
  console.log('[Migration] Starting FSA Projects → Notes binding migration...');

  try {
    // Get all projects from Dexie
    const allProjects = await db.projects.toArray();
    
    // Filter for FSA projects
    const fsaProjects = allProjects.filter(p => p.storageType === 'fsa');

    console.log(`[Migration] Found ${fsaProjects.length} FSA projects to check`);

    const result: NotesBindingMigrationResult = {
      updated: 0,
      failed: 0,
      failedIds: [],
      skipped: [],
      details: [],
    };

    for (const project of fsaProjects) {
      try {
        // Get current bindings (handle both workspaceBindings and legacy bindings)
        const currentBindings = (project.workspaceBindings || project.bindings) as WorkspaceBindings | undefined;
        
        // Check if Notes is already enabled
        if (currentBindings?.notes === true) {
          console.log(`[Migration] Skipping ${project.id} (${project.name}) - Notes already enabled`);
          result.skipped.push(project.id);
          continue;
        }

        // Build new bindings with Notes enabled
        // Preserve existing bindings, ensure notes is true
        const newBindings: WorkspaceBindings = {
          ide: currentBindings?.ide ?? true,
          knowledge: currentBindings?.knowledge ?? false,
          notes: true,  // Enable Notes binding
          study: currentBindings?.study ?? false,
        };

        // Update the project in Dexie
        await db.projects.update(project.id, {
          workspaceBindings: newBindings,
          lastOpened: new Date(), // Update to current time
        });

        result.updated++;
        result.details.push({
          projectId: project.id,
          projectName: project.name,
          changes: ['Enabled Notes workspace binding'],
        });

        console.log(`[Migration] ✅ Migrated ${project.id} (${project.name}) - Notes enabled`);
      } catch (error) {
        result.failed++;
        result.failedIds.push(project.id);
        console.error(`[Migration] ❌ Failed to migrate ${project.id}:`, error);
      }
    }

    console.log(`[Migration] Complete: ${result.updated} updated, ${result.failed} failed, ${result.skipped.length} skipped`);
    
    return result;
  } catch (error) {
    console.error('[Migration] Fatal error during migration:', error);
    throw error;
  }
}

// ============================================================================
// Migration: Verify Notes Binding Status
// ============================================================================

/**
 * Check which FSA projects have Notes binding enabled
 *
 * Utility function to verify the migration status without making changes.
 *
 * @returns Object with enabled and disabled project counts
 */
export async function getNotesBindingStatus(): Promise<{
  totalFSAProjects: number;
  notesEnabled: string[];
  notesDisabled: string[];
}> {
  const allProjects = await db.projects.toArray();
  const fsaProjects = allProjects.filter(p => p.storageType === 'fsa');

  const notesEnabled: string[] = [];
  const notesDisabled: string[] = [];

  for (const project of fsaProjects) {
    const bindings = (project.workspaceBindings || project.bindings) as WorkspaceBindings | undefined;
    if (bindings?.notes === true) {
      notesEnabled.push(project.id);
    } else {
      notesDisabled.push(project.id);
    }
  }

  return {
    totalFSAProjects: fsaProjects.length,
    notesEnabled,
    notesDisabled,
  };
}

// ============================================================================
// Convenience: Run Migration from Browser Console
// ============================================================================

/**
 * Run the Notes binding migration from the browser console
 *
 * This function is exposed globally for debugging/manual migration.
 * Access via `window.runNotesBindingMigration()` in the browser console.
 *
 * @example
 * ```ts
 * // In browser console:
 * await window.runNotesBindingMigration();
 * ```
 */
export function exposeMigrationToGlobal(): void {
  if (typeof window !== 'undefined') {
    (window as any).runNotesBindingMigration = migrateFSAProjectsToEnableNotes;
    (window as any).checkNotesBindingStatus = getNotesBindingStatus;
    console.log('[Migration] Migration functions exposed to window.runNotesBindingMigration()');
  }
}
