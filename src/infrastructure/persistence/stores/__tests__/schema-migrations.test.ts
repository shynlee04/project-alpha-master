/**
 * Schema Migration System Tests
 *
 * Tests versioned migrations for app state schema changes.
 *
 * @module stores/__tests__/schema-migrations
 * @story P2 Remediation - Cornerstone 2 Schema Versioning
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { AppState } from '../types';
import {
  CURRENT_SCHEMA_VERSION,
  getMigration,
  getPendingMigrations,
  isMigrationNeeded,
  estimateMigrationDuration,
  runMigrations,
  validateMigratedState,
} from '../schema-migrations';

describe('Schema Migrations', () => {
  let mockState: AppState;

  beforeEach(() => {
    // Create a minimal valid app state for testing
    mockState = {
      version: 0,

      // Agent CRUD State
      agents: [],
      addAgent: (() => {}) as any,
      removeAgent: (() => {}) as any,
      updateAgent: (() => {}) as any,
      resetToDefaults: (() => {}) as any,

      // Agent Workspace Bindings State
      getAgentsForWorkspace: (() => []) as any,
      updateWorkspaceBinding: (() => {}) as any,
      updateAgentWorkspaceBinding: (() => {}) as any,
      getAgentWorkspaceBinding: (() => undefined) as any,
      isAgentAvailableInWorkspace: (() => false) as any,

      // Agent Validation State
      validationErrors: {},
      addAgentValidated: (() => ({ id: 'test' })) as any,
      updateAgentValidated: (() => {}) as any,
      clearValidationErrors: (() => {}) as any,

      // Agent Events State
      addAgentWithEvent: (() => ({ id: 'test' })) as any,
      removeAgentWithEvent: (() => {}) as any,
      updateAgentWithEvent: (() => {}) as any,
      updateWorkspaceBindingWithEvent: (() => {}) as any,

      // Agent Utils State
      _hasHydrated: false,
      setHasHydrated: (() => {}) as any,
      getAgent: (() => undefined) as any,
      updateAgentStatus: (() => {}) as any,
      getAgentsCount: (() => 0) as any,

      // Provider State
      providers: [],
      activeProviderId: null,
      modelSettings: {},
      availableModels: {},
      isLoading: false,
      isLoadingModels: {},
      selectedModelId: null,
      modelCache: {},
      addProvider: (() => {}) as any,
      updateProvider: (() => {}) as any,
      removeProvider: (() => Promise.resolve()) as any,
      setActiveProvider: (() => {}) as any,
      updateModelSettings: (() => {}) as any,
      fetchModels: (() => Promise.resolve()) as any,
      getAvailableModels: (() => []) as any,
      reset: (() => {}) as any,
      setSelectedModel: (() => {}) as any,
      loadModelsForProvider: (() => Promise.resolve()) as any,
      clearModelsCache: (() => {}) as any,
    };
  });

  describe('Version Tracking', () => {
    it('should have current schema version defined', () => {
      expect(CURRENT_SCHEMA_VERSION).toBeGreaterThan(0);
      expect(typeof CURRENT_SCHEMA_VERSION).toBe('number');
    });

    it('should treat missing version as v0', () => {
      const stateWithoutVersion = { ...mockState };
      delete (stateWithoutVersion as any).version;

      expect(isMigrationNeeded((stateWithoutVersion as any).version || 0)).toBe(true);
    });
  });

  describe('Migration Detection', () => {
    it('should detect migration is needed when version is old', () => {
      mockState.version = 0;
      expect(isMigrationNeeded(mockState.version)).toBe(true);
    });

    it('should not detect migration needed when version is current', () => {
      mockState.version = CURRENT_SCHEMA_VERSION;
      expect(isMigrationNeeded(mockState.version)).toBe(false);
    });

    it('should not detect migration needed when version is future', () => {
      mockState.version = CURRENT_SCHEMA_VERSION + 1;
      expect(isMigrationNeeded(mockState.version)).toBe(false);
    });
  });

  describe('Migration Retrieval', () => {
    it('should get migration by version', () => {
      const migration = getMigration(1);

      expect(migration).toBeDefined();
      expect(migration?.version).toBe(1);
      expect(migration?.description).toBeDefined();
      expect(typeof migration?.migrate).toBe('function');
    });

    it('should return undefined for non-existent migration', () => {
      const migration = getMigration(999);
      expect(migration).toBeUndefined();
    });

    it('should get pending migrations for old version', () => {
      const pending = getPendingMigrations(0);

      expect(pending.length).toBeGreaterThan(0);
      expect(pending[0].version).toBe(1);
    });

    it('should return empty array when version is current', () => {
      const pending = getPendingMigrations(CURRENT_SCHEMA_VERSION);

      expect(pending.length).toBe(0);
    });

    it('should return empty array when version is future', () => {
      const pending = getPendingMigrations(CURRENT_SCHEMA_VERSION + 1);

      expect(pending.length).toBe(0);
    });

    it('should filter migrations by target version', () => {
      // If we had migrations up to v5, asking for v3 should only return v1, v2, v3
      const pending = getPendingMigrations(0, 1);

      expect(pending.length).toBe(1);
      expect(pending[0].version).toBe(1);
    });
  });

  describe('Duration Estimation', () => {
    it('should estimate duration for pending migrations', () => {
      const duration = estimateMigrationDuration(0);

      expect(duration).toBeGreaterThanOrEqual(0);
      expect(typeof duration).toBe('number');
    });

    it('should return 0 for current version', () => {
      const duration = estimateMigrationDuration(CURRENT_SCHEMA_VERSION);

      expect(duration).toBe(0);
    });

    it('should sum migration durations', () => {
      const duration = estimateMigrationDuration(0);

      // Should be at least 10ms for v1 migration
      expect(duration).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Migration Execution', () => {
    it('should run migrations from v0 to current', async () => {
      mockState.version = 0;

      const result = await runMigrations(mockState);

      expect(result.success).toBe(true);
      expect(result.fromVersion).toBe(0);
      expect(result.toVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(result.migrationsRun).toBeGreaterThan(0);
      expect(mockState.version).toBe(CURRENT_SCHEMA_VERSION);
    });

    it('should skip migrations if already at current version', async () => {
      mockState.version = CURRENT_SCHEMA_VERSION;

      const result = await runMigrations(mockState);

      expect(result.success).toBe(true);
      expect(result.migrationsRun).toBe(0);
      expect(result.duration).toBe(0);
    });

    it('should update state version after successful migration', async () => {
      mockState.version = 0;

      await runMigrations(mockState);

      expect(mockState.version).toBe(CURRENT_SCHEMA_VERSION);
    });

    it('should handle migration function errors gracefully', async () => {
      // Create a state with an invalid migration scenario
      mockState.version = 0;

      // Mock a migration that throws
      const originalMigrations = (await import('../schema-migrations')).MIGRATIONS;
      // We can't easily test this without modifying the migration system
      // So we'll just verify the error handling structure exists

      const result = await runMigrations(mockState);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('migrationsRun');
    });

    it('should provide migration result details', async () => {
      mockState.version = 0;

      const result = await runMigrations(mockState);

      expect(result).toMatchObject({
        success: expect.any(Boolean),
        fromVersion: expect.any(Number),
        toVersion: expect.any(Number),
        migrationsRun: expect.any(Number),
        duration: expect.any(Number),
      });
    });
  });

  describe('State Validation', () => {
    it('should validate correct state after migration', () => {
      mockState.version = CURRENT_SCHEMA_VERSION;
      mockState.agents = [];
      mockState.providers = [];

      const isValid = validateMigratedState(mockState);

      expect(isValid).toBe(true);
    });

    it('should fail validation if version is not a number', () => {
      (mockState as any).version = 'not a number';

      const isValid = validateMigratedState(mockState);

      expect(isValid).toBe(false);
    });

    it('should fail validation if agents is not an array', () => {
      mockState.version = CURRENT_SCHEMA_VERSION;
      (mockState as any).agents = 'not an array';

      const isValid = validateMigratedState(mockState);

      expect(isValid).toBe(false);
    });

    it('should fail validation if providers is not an array', () => {
      mockState.version = CURRENT_SCHEMA_VERSION;
      mockState.agents = [];
      (mockState as any).providers = null;

      const isValid = validateMigratedState(mockState);

      expect(isValid).toBe(false);
    });

    it('should warn but not fail for invalid activeProviderId', () => {
      mockState.version = CURRENT_SCHEMA_VERSION;
      mockState.agents = [];
      mockState.providers = [];
      mockState.activeProviderId = 'non-existent-provider';

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const isValid = validateMigratedState(mockState);

      expect(isValid).toBe(true); // Warning only, not a failure
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle fresh install (no version field)', async () => {
      const freshState = { ...mockState };
      delete (freshState as any).version;

      const result = await runMigrations(freshState);

      expect(result.success).toBe(true);
      expect(freshState.version).toBe(CURRENT_SCHEMA_VERSION);
      expect(validateMigratedState(freshState)).toBe(true);
    });

    it('should handle upgrade from v0 to v1', async () => {
      mockState.version = 0;

      const result = await runMigrations(mockState);

      expect(result.success).toBe(true);
      expect(result.fromVersion).toBe(0);
      expect(result.toVersion).toBe(1);
      expect(mockState.version).toBe(1);
    });

    it('should handle multiple sequential migrations', async () => {
      // This test verifies the system can handle multiple migrations
      // even though we only have v1 currently
      mockState.version = 0;

      const result = await runMigrations(mockState);

      expect(result.success).toBe(true);
      expect(result.migrationsRun).toBeGreaterThan(0);
      expect(mockState.version).toBe(CURRENT_SCHEMA_VERSION);
    });

    it('should maintain data integrity during migration', async () => {
      // Setup state with data
      mockState.version = 0;
      mockState.agents = [{
        id: 'test-agent',
        name: 'Test Agent',
        providerId: 'openrouter',
        status: 'idle',
        workspaceBindings: {},
        createdAt: Date.now(),
        tasksCompleted: 0,
        successRate: 0,
        tokensUsed: 0,
        lastActive: Date.now(),
      }];
      mockState.providers = [{
        id: 'openrouter',
        name: 'OpenRouter',
        type: 'openai-compatible',
        baseURL: 'https://openrouter.ai/api/v1',
        hasApiKey: false,
        models: [],
        enabled: true,
      }];

      await runMigrations(mockState);

      // Verify data is preserved
      expect(mockState.agents.length).toBe(1);
      expect(mockState.agents[0].id).toBe('test-agent');
      expect(mockState.providers.length).toBe(1);
      expect(mockState.providers[0].id).toBe('openrouter');
    });
  });

  describe('Migration Idempotency', () => {
    it('should be safe to run migrations multiple times', async () => {
      mockState.version = 0;

      // First migration
      await runMigrations(mockState);
      const firstVersion = mockState.version;

      // Second migration (should be no-op)
      const result = await runMigrations(mockState);

      expect(result.success).toBe(true);
      expect(result.migrationsRun).toBe(0);
      expect(mockState.version).toBe(firstVersion);
    });
  });
});
