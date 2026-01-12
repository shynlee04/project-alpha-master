/**
 * Schema Migration System
 *
 * Manages versioned migrations for app state schema changes.
 * Enables safe upgrades and rollback capabilities.
 *
 * @module stores/schema-migrations
 * @story P2 Remediation - Cornerstone 2 Schema Versioning
 * @priority P0 CRITICAL (Data integrity)
 * @risk LOW (Non-destructive, versioned migrations)
 *
 * Migration Flow:
 * 1. Store rehydrates with persisted state (includes version number)
 * 2. Compare persisted version vs current version
 * 3. Run migrations in order if persisted version < current version
 * 4. Update version to current after successful migrations
 * 5. Log all migration results for debugging
 *
 * Design Principles:
 * - Each migration is versioned and atomic
 * - Migrations only transform state, never delete data
 * - Migrations are idempotent (safe to run multiple times)
 * - Forward-only (no automatic rollbacks, manual if needed)
 */

import type { AppState } from './types';
import { useMigrationState } from './providers/use-migration-state';
import type { MigrationState } from './providers/use-migration-state';

/**
 * Current schema version
 * Increment this when introducing breaking changes to persisted state
 */
export const CURRENT_SCHEMA_VERSION = 2;

/**
 * Migration function type
 *
 * Transforms state from one version to the next.
 * Must be pure (no side effects) and idempotent.
 */
export type MigrationFn = (state: AppState) => void | Promise<void>;

/**
 * Migration definition
 */
export interface Migration {
  /** Version this migration upgrades to */
  version: number;

  /** Human-readable description */
  description: string;

  /** Migration function (pure transformation) */
  migrate: MigrationFn;

  /** Estimated execution time (ms) */
  estimatedDuration?: number;
}

/**
 * Migration result
 */
export interface MigrationResult {
  success: boolean;
  fromVersion: number;
  toVersion: number;
  migrationsRun: number;
  duration: number;
  error?: string;
}

/**
 * Registry of all migrations in order
 *
 * Migrations run sequentially when version changes.
 * Each migration handles the upgrade from (version - 1) to version.
 */
const MIGRATIONS: Migration[] = [
  // Version 1: Initial schema versioning
  {
    version: 1,
    description: 'Initial schema version - Add version tracking',
    migrate: (_state) => {
      // No transformation needed, just establish version baseline
      console.log('[SchemaMigration] v1: Initial version tracking established');
    },
    estimatedDuration: 10,
  },

  // Version 2: Add missing built-in providers (Groq, Mistral, Chutes)
  {
    version: 2,
    description: 'Add Groq, Mistral AI, and Chutes.ai providers',
    migrate: (state) => {
      const { INITIAL_PROVIDERS } = require('./providers/provider-crud-slice');
      const existingIds = new Set(state.providers.map(p => p.id));

      // Add any missing built-in providers
      const missingProviders = INITIAL_PROVIDERS.filter(p => !existingIds.has(p.id));

      if (missingProviders.length > 0) {
        console.log('[SchemaMigration] v2: Adding missing providers:', missingProviders.map(p => p.id));
        state.providers = [...state.providers, ...missingProviders];
      } else {
        console.log('[SchemaMigration] v2: All built-in providers already present');
      }
    },
    estimatedDuration: 50,
  },

  // Future migrations will be added here:
  // {
  //   version: 2,
  //   description: 'Add workspace bindings to agents',
  //   migrate: (state) => {
  //     // Transform agents to add default workspace bindings
  //     state.agents = state.agents.map(agent => ({
  //       ...agent,
  //       workspaceBindings: agent.workspaceBindings || DEFAULT_WORKSPACE_BINDINGS,
  //     }));
  //   },
  //   estimatedDuration: 100,
  // },

  // IMPORTANT: Always add new migrations at the END of this array
  // Never modify existing migrations (create new version instead)
];

/**
 * Get migration for a specific version
 *
 * @param version - Target version
 * @returns Migration or undefined if version not found
 */
export function getMigration(version: number): Migration | undefined {
  return MIGRATIONS.find(m => m.version === version);
}

/**
 * Get all migrations that need to run
 *
 * @param fromVersion - Current persisted version
 * @param toVersion - Target version (default: CURRENT_SCHEMA_VERSION)
 * @returns Array of migrations to run in order
 */
export function getPendingMigrations(fromVersion: number, toVersion: number = CURRENT_SCHEMA_VERSION): Migration[] {
  return MIGRATIONS.filter(m => m.version > fromVersion && m.version <= toVersion);
}

/**
 * Check if migration is needed
 *
 * @param persistedVersion - Version from persisted state
 * @returns True if migration needed
 */
export function isMigrationNeeded(persistedVersion: number): boolean {
  return persistedVersion < CURRENT_SCHEMA_VERSION;
}

/**
 * Estimate total migration duration
 *
 * @param fromVersion - Current persisted version
 * @returns Estimated duration in milliseconds
 */
export function estimateMigrationDuration(fromVersion: number): number {
  const pendingMigrations = getPendingMigrations(fromVersion);
  return pendingMigrations.reduce((total, m) => total + (m.estimatedDuration || 100), 0);
}

/**
 * Run all pending migrations
 *
 * Executes migrations sequentially from persisted version to current version.
 * Updates state.version after successful completion.
 *
 * @param state - Rehydrated app state (will be mutated)
 * @returns Migration result with success/failure status
 */
export async function runMigrations(state: AppState): Promise<MigrationResult> {
  const startTime = performance.now();
  const fromVersion = state.version || 0; // Treat missing version as v0
  const toVersion = CURRENT_SCHEMA_VERSION;

  console.log(`[SchemaMigration] Starting migration: v${fromVersion} → v${toVersion}`);

  // Check if migration needed
  if (!isMigrationNeeded(fromVersion)) {
    console.log('[SchemaMigration] Already at current version, no migration needed');
    return {
      success: true,
      fromVersion,
      toVersion,
      migrationsRun: 0,
      duration: 0,
    };
  }

  // Get pending migrations
  const pendingMigrations = getPendingMigrations(fromVersion, toVersion);

  if (pendingMigrations.length === 0) {
    console.warn('[SchemaMigration] No migrations found for version range');
    return {
      success: true,
      fromVersion,
      toVersion,
      migrationsRun: 0,
      duration: performance.now() - startTime,
    };
  }

  console.log(`[SchemaMigration] Found ${pendingMigrations.length} pending migrations:`);
  pendingMigrations.forEach(m => {
    console.log(`  - v${m.version}: ${m.description}`);
  });

  // Track migration state for UI feedback (optional, may not exist in tests)
  const migrationState = useMigrationState?.getState?.() as MigrationState & {
    startMigration?: (type: string, estimatedDuration: number) => void;
    updateMigrationProgress?: (type: string, current: number, total: number) => void;
    completeMigration?: (type: string, success: boolean, error?: string) => void;
  };
  if (migrationState?.startMigration) {
    migrationState.startMigration('schema', estimateMigrationDuration(fromVersion));
  }

  let migrationsRun = 0;

  try {
    // Run migrations sequentially
    for (const migration of pendingMigrations) {
      const migrationStart = performance.now();

      console.log(`[SchemaMigration] Running v${migration.version}: ${migration.description}`);

      // Execute migration
      await migration.migrate(state);

      const migrationDuration = performance.now() - migrationStart;
      console.log(`[SchemaMigration] ✅ v${migration.version} complete (${migrationDuration.toFixed(2)}ms)`);

      // Update progress (optional, may not exist in tests)
      if (migrationState?.updateMigrationProgress) {
        migrationState.updateMigrationProgress(
          'schema',
          migrationsRun + 1,
          pendingMigrations.length
        );
      }

      migrationsRun++;
    }

    // Update state version to current
    state.version = CURRENT_SCHEMA_VERSION;

    const totalDuration = performance.now() - startTime;
    console.log(`[SchemaMigration] ✅ All migrations complete: v${fromVersion} → v${toVersion} (${totalDuration.toFixed(2)}ms)`);

    if (migrationState?.completeMigration) {
      migrationState.completeMigration('schema', true);
    }

    return {
      success: true,
      fromVersion,
      toVersion,
      migrationsRun,
      duration: totalDuration,
    };
  } catch (err) {
    const totalDuration = performance.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : String(err);

    console.error('[SchemaMigration] ❌ Migration failed:', errorMessage);
    console.error(`[SchemaMigration] Failed at migration ${migrationsRun + 1}/${pendingMigrations.length}`);

    if (migrationState?.completeMigration) {
      migrationState.completeMigration('schema', false, errorMessage);
    }

    return {
      success: false,
      fromVersion,
      toVersion: fromVersion + migrationsRun, // Partial version
      migrationsRun,
      duration: totalDuration,
      error: errorMessage,
    };
  }
}

/**
 * Validate state after migration
 *
 * Checks for common issues that could cause problems.
 *
 * @param state - Migrated state
 * @returns True if state is valid
 */
export function validateMigratedState(state: AppState): boolean {
  try {
    // Check version is set
    if (typeof state.version !== 'number') {
      console.error('[SchemaMigration] Validation failed: version is not a number');
      return false;
    }

    // Check agents array exists
    if (!Array.isArray(state.agents)) {
      console.error('[SchemaMigration] Validation failed: agents is not an array');
      return false;
    }

    // Check providers array exists
    if (!Array.isArray(state.providers)) {
      console.error('[SchemaMigration] Validation failed: providers is not an array');
      return false;
    }

    // Check activeProviderId is valid if set
    if (state.activeProviderId && !state.providers.find(p => p.id === state.activeProviderId)) {
      console.warn('[SchemaMigration] Validation warning: activeProviderId references non-existent provider');
      // This is a warning, not a failure
    }

    console.log('[SchemaMigration] ✅ State validation passed');
    return true;
  } catch (err) {
    console.error('[SchemaMigration] ❌ State validation failed:', err);
    return false;
  }
}
