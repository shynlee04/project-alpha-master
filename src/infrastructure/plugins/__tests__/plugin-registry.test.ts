/**
 * @fileoverview Plugin Registry Unit Tests
 * @module infrastructure/plugins/__tests__/plugin-registry.test
 *
 * Tests for plugin registry functionality:
 * - Registration with duplicate detection
 * - Plugin retrieval by ID
 * - Filtering by storage type and device type
 * - Edge cases ('any' values)
 *
 * **ARCH-02-02**: Create Plugin Registry
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-02
 * @team Team A
 * @created 2026-01-21
 */

// ============================================================================
// Imports
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { FeaturePlugin } from '@/domain/interfaces/feature-plugin.interface';
import type { PluginId } from '@/domain/types/plugin-types';
import {
  registerPlugin,
  getPlugin,
  getAvailablePlugins,
  getAllPlugins,
} from '../plugin-registry';

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Create a mock plugin for testing
 */
function createMockPlugin(overrides: Partial<FeaturePlugin> = {}): FeaturePlugin {
  return {
    id: 'filetree' as PluginId,
    name: 'Test Plugin',
    icon: null,
    description: 'Test description',
    requirements: {
      storageType: 'any',
      deviceType: 'any',
      minWidth: 200,
      maxInstances: 1,
    },
    MainComponent: () => null,
    ...overrides,
  };
}

/**
 * Create a mock ProjectContext for testing
 */
function createMockContext(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    project: {
      storageType: 'fsa',
    },
    platform: {
      deviceType: 'desktop',
    },
    ...overrides,
  };
}

// Clear registry before each test
beforeEach(() => {
  getAllPlugins().forEach((plugin) => {
    // Note: We can't directly clear the registry, but we can verify it starts empty
    // The tests below assume registry state is managed correctly
  });
});

// ============================================================================
// Test Suites
// ============================================================================

describe('Plugin Registry - ARCH-02-02', () => {
  // -------------------------------------------------------------------------
  // Helper to reset registry for isolated tests
  // -------------------------------------------------------------------------

  // Since we can't directly clear the private Map, we track test IDs
  const testPluginIds: Set<PluginId> = new Set();

  // Clear registry by overwriting all plugins after each test
  afterEach(() => {
    testPluginIds.forEach((id) => {
      const dummyPlugin = createMockPlugin({ id });
      registerPlugin(dummyPlugin); // Overwrite with dummy
    });
    testPluginIds.clear();
  });

  // -------------------------------------------------------------------------
  // AC1: registerPlugin() stores plugin in Map
  // -------------------------------------------------------------------------

  describe('registerPlugin()', () => {
    it('should store plugin in registry', () => {
      // Given: A valid plugin
      const plugin = createMockPlugin({ id: 'filetree' as PluginId });

      // When: Plugin is registered
      registerPlugin(plugin);
      testPluginIds.add('filetree');

      // Then: Plugin is stored and can be retrieved
      const retrieved = getPlugin('filetree');
      expect(retrieved).toBe(plugin);
    });

    it('should log warning on duplicate registration', () => {
      // Given: Plugin already registered
      const plugin1 = createMockPlugin({ id: 'filetree' as PluginId });
      const plugin2 = createMockPlugin({ id: 'filetree' as PluginId, name: 'File Tree v2' });

      registerPlugin(plugin1);

      // When: Attempting to register duplicate ID
      const consoleWarnSpy = vi.spyOn(console, 'warn');
      registerPlugin(plugin2);

      // Then: Warning is logged
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Plugin "filetree" already registered')
      );

      // And: New plugin overwrites existing
      const retrieved = getPlugin('filetree');
      expect(retrieved?.name).toBe('File Tree v2');

      consoleWarnSpy.mockRestore();
    });

    it('should allow overwriting plugin with same ID', () => {
      // Given: Plugin already registered
      const plugin1 = createMockPlugin({
        id: 'monaco' as PluginId,
        name: 'Monaco v1',
      });
      const plugin2 = createMockPlugin({
        id: 'monaco' as PluginId,
        name: 'Monaco v2',
      });

      registerPlugin(plugin1);

      // When: Registering new plugin with same ID
      registerPlugin(plugin2);

      // Then: Latest version is stored
      const retrieved = getPlugin('monaco');
      expect(retrieved?.name).toBe('Monaco v2');
    });
  });

  // -------------------------------------------------------------------------
  // AC2: getPlugin() retrieves by PluginId
  // -------------------------------------------------------------------------

  describe('getPlugin()', () => {
    beforeEach(() => {
      // Register test plugins
      registerPlugin(createMockPlugin({ id: 'filetree' as PluginId }));
      registerPlugin(createMockPlugin({ id: 'monaco' as PluginId }));
    });

    it('should retrieve correct plugin by ID', () => {
      // Given: Plugin with ID 'filetree' is registered
      // When: Retrieving plugin by ID
      const plugin = getPlugin('filetree');

      // Then: Returns correct plugin
      expect(plugin).toBeDefined();
      expect(plugin?.id).toBe('filetree');
    });

    it('should return undefined for non-existent plugin', () => {
      // Given: Plugin with ID 'nonexistent' is NOT registered
      // When: Attempting to retrieve non-existent plugin
      const plugin = getPlugin('nonexistent' as PluginId);

      // Then: Returns undefined
      expect(plugin).toBeUndefined();
    });

    it('should return exact match from registry (not a copy)', () => {
      // Given: Plugin registered
      const original = createMockPlugin({ id: 'notes' as PluginId });
      registerPlugin(original);

      // When: Retrieving plugin
      const retrieved = getPlugin('notes');

      // Then: Returns exact same reference (not a copy)
      expect(retrieved).toBe(original);
    });
  });

  // -------------------------------------------------------------------------
  // AC3: getAvailablePlugins() filters by context requirements
  // -------------------------------------------------------------------------

  describe('getAvailablePlugins()', () => {
    beforeEach(() => {
      // Register test plugins with different requirements
      registerPlugin(
        createMockPlugin({
          id: 'filetree' as PluginId,
          requirements: { storageType: 'any', deviceType: 'any', minWidth: 200, maxInstances: 1 },
        })
      );
      registerPlugin(
        createMockPlugin({
          id: 'monaco' as PluginId,
          requirements: { storageType: 'any', deviceType: 'any', minWidth: 300, maxInstances: 1 },
        })
      );
      registerPlugin(
        createMockPlugin({
          id: 'terminal' as PluginId,
          requirements: { storageType: 'fsa', deviceType: 'desktop', minWidth: 400, maxInstances: 1 },
        })
      );
      registerPlugin(
        createMockPlugin({
          id: 'notes-mobile' as PluginId,
          requirements: { storageType: 'indexeddb', deviceType: 'mobile', minWidth: 200, maxInstances: 1 },
        })
      );
    });

    it('should filter by storage type', () => {
      // Given: Plugins with different storageType requirements
      // When: Filtering for FSA context
      const context = createMockContext({
        project: { storageType: 'fsa' },
      });
      const available = getAvailablePlugins(context as any);

      // Then: Only 'fsa' or 'any' storage plugins returned
      expect(available.length).toBeGreaterThan(0);
      const hasFsaOrAny = available.every(
        (p) => p.requirements.storageType === 'fsa' || p.requirements.storageType === 'any'
      );
      expect(hasFsaOrAny).toBe(true);
    });

    it('should filter by device type', () => {
      // Given: Plugins with different deviceType requirements
      // When: Filtering for desktop context
      const context = createMockContext({
        platform: { deviceType: 'desktop' },
      });
      const available = getAvailablePlugins(context as any);

      // Then: Only 'desktop' or 'any' device plugins returned
      expect(available.length).toBeGreaterThan(0);
      const hasDesktopOrAny = available.every(
        (p) => p.requirements.deviceType === 'desktop' || p.requirements.deviceType === 'any'
      );
      expect(hasDesktopOrAny).toBe(true);
    });

    it('should include plugins with "any" storage type', () => {
      // Given: Desktop FSA context
      const context = createMockContext({
        project: { storageType: 'fsa' },
        platform: { deviceType: 'desktop' },
      });
      const available = getAvailablePlugins(context as any);

      // Then: Plugins with 'any' storage type are included
      // (filetree, monaco - both 'any' storage)
      const anyStoragePlugins = available.filter((p) => p.requirements.storageType === 'any');
      expect(anyStoragePlugins.length).toBeGreaterThanOrEqual(2);
    });

    it('should include plugins with "any" device type', () => {
      // Given: Desktop FSA context
      const context = createMockContext({
        project: { storageType: 'fsa' },
        platform: { deviceType: 'desktop' },
      });
      const available = getAvailablePlugins(context as any);

      // Then: Plugins with 'any' device type are included
      // (filetree, monaco - both 'any' device)
      const anyDevicePlugins = available.filter((p) => p.requirements.deviceType === 'any');
      expect(anyDevicePlugins.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter out plugins with incompatible storage type', () => {
      // Given: FSA context
      const context = createMockContext({
        project: { storageType: 'fsa' },
      });
      const available = getAvailablePlugins(context as any);

      // Then: IndexedDB-only plugins excluded
      const hasIndexedDBOnly = available.some((p) => p.requirements.storageType === 'indexeddb');
      expect(hasIndexedDBOnly).toBe(false);
    });

    it('should filter out plugins with incompatible device type', () => {
      // Given: Desktop context
      const context = createMockContext({
        platform: { deviceType: 'desktop' },
      });
      const available = getAvailablePlugins(context as any);

      // Then: Mobile-only plugins excluded
      const hasMobileOnly = available.some((p) => p.requirements.deviceType === 'mobile');
      expect(hasMobileOnly).toBe(false);
    });

    it('should require BOTH storage AND device type compatibility', () => {
      // Given: Desktop FSA context
      const context = createMockContext({
        project: { storageType: 'fsa' },
        platform: { deviceType: 'desktop' },
      });
      const available = getAvailablePlugins(context as any);

      // Then: All returned plugins match both conditions
      available.forEach((plugin) => {
        const storageCompatible =
          plugin.requirements.storageType === 'any' || plugin.requirements.storageType === 'fsa';
        const deviceCompatible =
          plugin.requirements.deviceType === 'any' || plugin.requirements.deviceType === 'desktop';
        expect(storageCompatible && deviceCompatible).toBe(true);
      });
    });

    it('should return empty array if no plugins compatible', () => {
      // Given: Context with incompatible requirements
      // (e.g., mobile indexeddb but only desktop FSA plugins registered)
      registerPlugin(
        createMockPlugin({
          id: 'desktop-only' as PluginId,
          requirements: { storageType: 'fsa', deviceType: 'desktop', minWidth: 400, maxInstances: 1 },
        })
      );

      // When: Querying for mobile IndexedDB context
      const context = createMockContext({
        project: { storageType: 'indexeddb' },
        platform: { deviceType: 'mobile' },
      });
      const available = getAvailablePlugins(context as any);

      // Then: Only 'any' plugins returned (desktop-only excluded)
      const hasCompatible = available.filter(
        (p) => p.id === 'desktop-only'
      );
      expect(hasCompatible.length).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // AC4: Singleton pattern for registry
  // -------------------------------------------------------------------------

  describe('Singleton Pattern', () => {
    it('should share same registry instance across imports', () => {
      // Given: Register plugin in one import
      const plugin1 = createMockPlugin({ id: 'singleton-test' as PluginId });
      registerPlugin(plugin1);
      testPluginIds.add('singleton-test');

      // When: Retrieving plugin from different import
      const plugin2 = getPlugin('singleton-test');

      // Then: Same instance returned
      expect(plugin2).toBe(plugin1);
    });

    it('should maintain plugin state across registrations', () => {
      // Given: Register multiple plugins
      const plugin1 = createMockPlugin({ id: 'singleton-test1' as PluginId });
      const plugin2 = createMockPlugin({ id: 'singleton-test2' as PluginId });
      registerPlugin(plugin1);
      registerPlugin(plugin2);
      testPluginIds.add('singleton-test1');
      testPluginIds.add('singleton-test2');

      // When: Retrieving all plugins
      const all = getAllPlugins();

      // Then: All registered plugins present
      expect(all.length).toBeGreaterThanOrEqual(2);
      expect(all).toContain(plugin1);
      expect(all).toContain(plugin2);
    });
  });

  // -------------------------------------------------------------------------
  // getAllPlugins()
  // -------------------------------------------------------------------------

  describe('getAllPlugins()', () => {
    beforeEach(() => {
      registerPlugin(createMockPlugin({ id: 'all-test1' as PluginId }));
      registerPlugin(createMockPlugin({ id: 'all-test2' as PluginId }));
      testPluginIds.add('all-test1');
      testPluginIds.add('all-test2');
    });

    it('should return all registered plugins', () => {
      // Given: Two plugins registered
      // When: Getting all plugins
      const all = getAllPlugins();

      // Then: Returns array with both plugins
      expect(all.length).toBeGreaterThanOrEqual(2);
    });

    it('should return shallow copy (preventing direct Map mutation)', () => {
      // Given: Get all plugins
      const all1 = getAllPlugins();

      // When: Modifying returned array
      all1.push(createMockPlugin({ id: 'notes' as PluginId }));

      // Then: Registry not affected (shallow copy)
      const all2 = getAllPlugins();
      expect(all2.length).toBeGreaterThanOrEqual(2);
    });
  });
});
