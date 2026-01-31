/**
 * Plugin Manager - Lifecycle Management
 *
 * Core plugin system that handles:
 * - Plugin installation, loading, activation, deactivation, uninstallation
 * - Plugin validation and dependency resolution
 * - Permission management
 * - Sandboxed execution
 *
 * @module plugins/plugin-manager
 * @story S-037 - Plugin System for extensibility with marketplace
 */

import { getDb } from '@/infrastructure/persistence/dexie-db';
import { generatePluginId } from '@/infrastructure/persistence/dexie-db-plugin-types';

// Helper functions to bypass Dexie table type assertions
const pluginsTable = () => (getDb()?.plugins as any);
const pluginStorageTable = () => (getDb()?.pluginStorage as any);
const pluginSettingsTable = () => (getDb()?.pluginSettings as any);
import type {
  PluginManifest,
  PluginMetadata,
  PluginMain,
  PluginContext,
  PluginLifecycleState,
  PluginSource,
  PluginPermission,
  PluginPermissionDetail,
} from './types';
import {
  PluginError,
  PluginValidationError,
  PluginPermissionError,
  PluginActivationError,
  PluginDependencyError,
} from './types';

/**
 * Plugin Manager Singleton
 */
class PluginManagerClass {
  private loadedPlugins = new Map<string, PluginMain>();
  private activatedPlugins = new Set<string>();

  // ========================================================================
  // Plugin Installation
  // ========================================================================

  /**
   * Install a plugin from various sources
   */
  async install(options: {
    source: PluginSource;
    manifest: PluginManifest;
    code?: string; // Plugin code as string
    autoActivate?: boolean;
  }): Promise<string> {
    const { source, manifest, code, autoActivate = false } = options;

    // Validate manifest
    this.validateManifest(manifest);

    // Check dependencies
    await this.checkDependencies(manifest);

    // Generate plugin ID
    const pluginId = generatePluginId(manifest.name, manifest.version);

    // Check if already installed
    const db = getDb();
    if (!db) throw new PluginError(pluginId, 'Database not available');

    const existing = await pluginsTable().get(pluginId);
    if (existing) {
      throw new PluginError(pluginId, 'Plugin already installed');
    }

    // Create permission details
    const permissions: PluginPermissionDetail[] = manifest.permissions.map(permission => ({
      permission,
      granted: false, // Require explicit permission grant
      requestedAt: new Date(),
    }));

    // Create plugin metadata
    const metadata: PluginMetadata = {
      id: pluginId,
      manifest,
      source,
      installedAt: new Date(),
      state: 'installed',
      permissions,
      stats: {
        timesActivated: 0,
      },
    };

    // Store plugin files (in pluginStorage for built-in, or external for marketplace)
    if (code) {
      await pluginStorageTable().put({
        id: `${pluginId}:main.js`,
        pluginId,
        key: 'main.js',
        value: code,
        updatedAt: new Date().toISOString(),
      });
    }

    // Save to registry
    await pluginsTable().put(metadata);

    console.log(`[PluginManager] Installed plugin: ${pluginId}`);

    // Auto-activate if requested
    if (autoActivate) {
      await this.activate(pluginId);
    }

    return pluginId;
  }

  /**
   * Uninstall a plugin
   */
  async uninstall(pluginId: string): Promise<void> {
    const db = getDb();
    if (!db) throw new PluginError(pluginId, 'Database not available');

    const plugin = await pluginsTable().get(pluginId);
    if (!plugin) {
      throw new PluginError(pluginId, 'Plugin not found');
    }

    // Deactivate first
    if (plugin.state === 'activated') {
      await this.deactivate(pluginId);
    }

    // Unload if loaded
    if (this.loadedPlugins.has(pluginId)) {
      this.loadedPlugins.delete(pluginId);
    }

    // Delete plugin storage
    await pluginStorageTable().where('pluginId').equals(pluginId).delete();

    // Delete plugin settings
    await pluginSettingsTable().delete(pluginId);

    // Delete from registry
    await pluginsTable().delete(pluginId);

    console.log(`[PluginManager] Uninstalled plugin: ${pluginId}`);
  }

  // ========================================================================
  // Plugin Loading
  // ========================================================================

  /**
   * Load plugin code into memory
   */
  async load(pluginId: string): Promise<void> {
    const db = getDb();
    if (!db) throw new PluginError(pluginId, 'Database not available');

    // Check if already loaded
    if (this.loadedPlugins.has(pluginId)) {
      console.log(`[PluginManager] Plugin already loaded: ${pluginId}`);
      return;
    }

    const plugin = await pluginsTable().get(pluginId);
    if (!plugin) {
      throw new PluginError(pluginId, 'Plugin not found');
    }

    try {
      let pluginMain: PluginMain;

      if (plugin.source === 'builtin') {
        // Built-in plugins are imported dynamically
        // Use a map-based approach to avoid Vite's dynamic import limitations
        const builtinPlugins: Record<string, () => Promise<any>> = {
          'github-integration': () => import('./builtins/github-integration'),
          'retro-theme-pack': () => import('./builtins/retro-theme-pack'),
        };

        const pluginName = plugin.manifest.name;
        const pluginLoader = builtinPlugins[pluginName];

        if (!pluginLoader) {
          throw new PluginError(pluginId, `Unknown builtin plugin: ${pluginName}`);
        }

        const module = await pluginLoader();
        pluginMain = module.default;
      } else {
        // Load from storage
        const codeRecord = await pluginStorageTable().get(`${pluginId}:main.js`);
        if (!codeRecord) {
          throw new PluginError(pluginId, 'Plugin code not found');
        }

        // Sandboxed execution using eval (could be replaced with Web Worker)
        // This is a simplified version - production should use Web Workers
        const sandboxedEval = new Function('code', `
          ${codeRecord.value}
          return plugin;
        `);

        pluginMain = sandboxedEval(codeRecord.value);
      }

      // Cache loaded plugin
      this.loadedPlugins.set(pluginId, pluginMain);

      // Update state
      await pluginsTable().update(pluginId, {
        state: 'loaded',
        updatedAt: new Date().toISOString(),
      });

      console.log(`[PluginManager] Loaded plugin: ${pluginId}`);
    } catch (error) {
      await pluginsTable().update(pluginId, {
        state: 'error',
        stats: {
          ...plugin.stats,
          lastError: String(error),
        },
      });

      throw new PluginError(pluginId, `Failed to load: ${error}`);
    }
  }

  /**
   * Unload plugin from memory
   */
  async unload(pluginId: string): Promise<void> {
    const db = getDb();
    if (!db) throw new PluginError(pluginId, 'Database not available');

    // Deactivate if activated
    if (this.activatedPlugins.has(pluginId)) {
      await this.deactivate(pluginId);
    }

    // Remove from memory
    this.loadedPlugins.delete(pluginId);

    // Update state
    await pluginsTable().update(pluginId, {
      state: 'installed',
      updatedAt: new Date().toISOString(),
    });

    console.log(`[PluginManager] Unloaded plugin: ${pluginId}`);
  }

  // ========================================================================
  // Plugin Activation
  // ========================================================================

  /**
   * Activate a plugin
   */
  async activate(pluginId: string): Promise<void> {
    const db = getDb();
    if (!db) throw new PluginError(pluginId, 'Database not available');

    // Check if already activated
    if (this.activatedPlugins.has(pluginId)) {
      console.log(`[PluginManager] Plugin already activated: ${pluginId}`);
      return;
    }

    const plugin = await pluginsTable().get(pluginId);
    if (!plugin) {
      throw new PluginError(pluginId, 'Plugin not found');
    }

    // Check permissions
    const deniedPermissions = plugin.permissions.filter((p: PluginPermissionDetail) => !p.granted);
    if (deniedPermissions.length > 0) {
      throw new PluginPermissionError(
        pluginId,
        deniedPermissions[0].permission
      );
    }

    // Load if not loaded
    if (!this.loadedPlugins.has(pluginId)) {
      await this.load(pluginId);
    }

    const pluginMain = this.loadedPlugins.get(pluginId);
    if (!pluginMain) {
      throw new PluginError(pluginId, 'Plugin not loaded');
    }

    try {
      // Create plugin context
      const context: PluginContext = {
        pluginId,
        permissions: plugin.permissions.map((p: PluginPermissionDetail) => p.permission),
        storage: this.createStorageAPI(pluginId),
        api: this.createSandboxedAPI(pluginId, plugin.permissions.map((p: PluginPermissionDetail) => p.permission)),
      };

      // Call activate hook
      await pluginMain.activate(context);

      // Track activation
      this.activatedPlugins.add(pluginId);

      // Update state
      await pluginsTable().update(pluginId, {
        state: 'activated',
        updatedAt: new Date().toISOString(),
        stats: {
          timesActivated: plugin.stats.timesActivated + 1,
          lastActivated: new Date().toISOString(),
        },
      });

      console.log(`[PluginManager] Activated plugin: ${pluginId}`);
    } catch (error) {
      await pluginsTable().update(pluginId, {
        state: 'error',
        stats: {
          ...plugin.stats,
          lastError: String(error),
        },
      });

      throw new PluginActivationError(pluginId, String(error));
    }
  }

  /**
   * Deactivate a plugin
   */
  async deactivate(pluginId: string): Promise<void> {
    const db = getDb();
    if (!db) throw new PluginError(pluginId, 'Database not available');

    // Check if activated
    if (!this.activatedPlugins.has(pluginId)) {
      console.log(`[PluginManager] Plugin not activated: ${pluginId}`);
      return;
    }

    const pluginMain = this.loadedPlugins.get(pluginId);
    if (!pluginMain) {
      this.activatedPlugins.delete(pluginId);
      return;
    }

    try {
      // Call deactivate hook
      if (pluginMain.deactivate) {
        await pluginMain.deactivate();
      }

      // Remove from tracking
      this.activatedPlugins.delete(pluginId);

      // Update state
      await pluginsTable().update(pluginId, {
        state: 'loaded',
        updatedAt: new Date().toISOString(),
      });

      console.log(`[PluginManager] Deactivated plugin: ${pluginId}`);
    } catch (error) {
      console.error(`[PluginManager] Error deactivating ${pluginId}:`, error);
      throw new PluginError(pluginId, `Deactivation failed: ${error}`);
    }
  }

  // ========================================================================
  // Plugin Permissions
  // ========================================================================

  /**
   * Grant permission to a plugin
   */
  async grantPermission(pluginId: string, permission: PluginPermission): Promise<void> {
    const db = getDb();
    if (!db) throw new PluginError(pluginId, 'Database not available');

    const plugin = await pluginsTable().get(pluginId);
    if (!plugin) {
      throw new PluginError(pluginId, 'Plugin not found');
    }

    const permIndex = plugin.permissions.findIndex((p: PluginPermissionDetail) => p.permission === permission);
    if (permIndex === -1) {
      throw new PluginPermissionError(pluginId, permission);
    }

    plugin.permissions[permIndex].granted = true;
    plugin.permissions[permIndex].grantedAt = new Date();

    await pluginsTable().update(pluginId, {
      permissions: plugin.permissions,
    });

    console.log(`[PluginManager] Granted permission '${permission}' to ${pluginId}`);
  }

  /**
   * Revoke permission from a plugin
   */
  async revokePermission(pluginId: string, permission: PluginPermission): Promise<void> {
    const db = getDb();
    if (!db) throw new PluginError(pluginId, 'Database not available');

    const plugin = await pluginsTable().get(pluginId);
    if (!plugin) {
      throw new PluginError(pluginId, 'Plugin not found');
    }

    const permIndex = plugin.permissions.findIndex((p: PluginPermissionDetail) => p.permission === permission);
    if (permIndex === -1) {
      throw new PluginPermissionError(pluginId, permission);
    }

    plugin.permissions[permIndex].granted = false;

    await pluginsTable().update(pluginId, {
      permissions: plugin.permissions,
    });

    // Deactivate if permission revoked while active
    if (plugin.state === 'activated') {
      await this.deactivate(pluginId);
    }

    console.log(`[PluginManager] Revoked permission '${permission}' from ${pluginId}`);
  }

  // ========================================================================
  // Plugin Settings
  // ========================================================================

  /**
   * Update plugin settings
   */
  async updateSettings(pluginId: string, settings: Record<string, any>): Promise<void> {
    const db = getDb();
    if (!db) throw new PluginError(pluginId, 'Database not available');

    await pluginSettingsTable().put({
      pluginId,
      settings,
      updatedAt: new Date().toISOString(),
    });

    await pluginsTable().update(pluginId, {
      settings,
      updatedAt: new Date().toISOString(),
    });

    console.log(`[PluginManager] Updated settings for ${pluginId}`);
  }

  /**
   * Clear plugin data
   */
  async clearData(pluginId: string): Promise<void> {
    const db = getDb();
    if (!db) throw new PluginError(pluginId, 'Database not available');

    await pluginStorageTable().where('pluginId').equals(pluginId).delete();
    await pluginSettingsTable().delete(pluginId);

    console.log(`[PluginManager] Cleared data for ${pluginId}`);
  }

  // ========================================================================
  // Plugin Queries
  // ========================================================================

  /**
   * Get all plugins
   */
  async getAllPlugins(): Promise<PluginMetadata[]> {
    const db = getDb();
    if (!db) return [];

    return await pluginsTable().toArray();
  }

  /**
   * Get plugin by ID
   */
  async getPlugin(pluginId: string): Promise<PluginMetadata | undefined> {
    const db = getDb();
    if (!db) return undefined;

    return await pluginsTable().get(pluginId);
  }

  /**
   * Get plugins by state
   */
  async getPluginsByState(state: PluginLifecycleState): Promise<PluginMetadata[]> {
    const db = getDb();
    if (!db) return [];

    return await pluginsTable().where('state').equals(state).toArray();
  }

  /**
   * Get plugins by source
   */
  async getPluginsBySource(source: PluginSource): Promise<PluginMetadata[]> {
    const db = getDb();
    if (!db) return [];

    return await pluginsTable().where('source').equals(source).toArray();
  }

  // ========================================================================
  // Validation & Helpers
  // ========================================================================

  /**
   * Validate plugin manifest
   */
  private validateManifest(manifest: PluginManifest): void {
    if (!manifest.name || typeof manifest.name !== 'string') {
      throw new PluginValidationError('unknown', 'Invalid plugin name');
    }

    if (!manifest.version || typeof manifest.version !== 'string') {
      throw new PluginValidationError('unknown', 'Invalid plugin version');
    }

    if (!manifest.main || typeof manifest.main !== 'string') {
      throw new PluginValidationError('unknown', 'Invalid plugin main entry point');
    }

    if (!Array.isArray(manifest.permissions)) {
      throw new PluginValidationError('unknown', 'Invalid permissions array');
    }

    // Validate permissions
    const validPermissions: PluginPermission[] = [
      'fs', 'network', 'ui', 'workspace', 'agents', 'notifications', 'storage'
    ];

    for (const perm of manifest.permissions) {
      if (!validPermissions.includes(perm)) {
        throw new PluginValidationError('unknown', `Invalid permission: ${perm}`);
      }
    }
  }

  /**
   * Check plugin dependencies
   */
  private async checkDependencies(manifest: PluginManifest): Promise<void> {
    if (!manifest.dependencies || Object.keys(manifest.dependencies).length === 0) {
      return;
    }

    const db = getDb();
    if (!db) return;

    for (const [depName, depVersion] of Object.entries(manifest.dependencies)) {
      const depId = generatePluginId(depName, depVersion);
      const dep = await pluginsTable().get(depId);

      if (!dep) {
        throw new PluginDependencyError(depId, depName);
      }
    }
  }

  /**
   * Create sandboxed storage API for plugin
   */
  private createStorageAPI(pluginId: string) {
    const db = getDb();
    if (!db) {
      throw new PluginError(pluginId, 'Database not available');
    }

    return {
      get: async (key: string) => {
        const record = await pluginStorageTable().get(`${pluginId}:${key}`);
        return record?.value;
      },
      set: async (key: string, value: any) => {
        await pluginStorageTable().put({
          id: `${pluginId}:${key}`,
          pluginId,
          key,
          value,
          updatedAt: new Date().toISOString(),
        });
      },
      delete: async (key: string) => {
        await pluginStorageTable().delete(`${pluginId}:${key}`);
      },
      clear: async () => {
        await pluginStorageTable().where('pluginId').equals(pluginId).delete();
      },
    };
  }

  /**
   * Create sandboxed API surface for plugin
   */
  private createSandboxedAPI(
    pluginId: string,
    _permissions: PluginPermission[]
  ): PluginContext['api'] {
    // TODO: Implement actual sandboxed API
    // For now, return placeholder
    return {
      commands: {
        register: (command) => {
          console.log(`[PluginManager] ${pluginId} registering command:`, command.id);
        },
        unregister: (commandId) => {
          console.log(`[PluginManager] ${pluginId} unregistering command:`, commandId);
        },
      },
      ui: {
        addPanel: (panel) => {
          console.log(`[PluginManager] ${pluginId} adding panel:`, panel.id);
        },
        removePanel: (panelId) => {
          console.log(`[PluginManager] ${pluginId} removing panel:`, panelId);
        },
        addStatusBarItem: (item) => {
          console.log(`[PluginManager] ${pluginId} adding status bar item:`, item.id);
        },
        removeStatusBarItem: (itemId) => {
          console.log(`[PluginManager] ${pluginId} removing status bar item:`, itemId);
        },
      },
      notifications: {
        show: (message, type = 'info') => {
          console.log(`[PluginManager] ${pluginId} notification [${type}]:`, message);
        },
      },
    };
  }
}

// Export singleton instance
export const PluginManager = new PluginManagerClass();
