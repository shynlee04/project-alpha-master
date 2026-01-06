/**
 * usePlugins Hook - Plugin Operations
 *
 * React hook that provides convenient access to plugin operations.
 * Wraps PluginManager and integrates with plugins store.
 *
 * @module hooks/usePlugins
 * @story S-037 - Plugin System for extensibility with marketplace
 */

import { useCallback } from 'react';
import { PluginManager } from '@/lib/plugins/plugin-manager';
import { usePluginsStore } from '@/infrastructure/persistence/stores/plugins-store';
import { manifest as githubManifest } from '@/lib/plugins/builtins/github-integration';
import { manifest as retroThemeManifest } from '@/lib/plugins/builtins/retro-theme-pack';
import {
  useAddPlugin,
  useUpdatePlugin,
  useRemovePlugin,
  useSetShowMarketplace,
  useSetShowManager,
  useSetIsLoadingPlugins,
  useSetIsLoadingMarketplace,
  useSetPluginError,
  useSetFilterCategory,
  useSetFilterSearch,
} from '@/infrastructure/persistence/stores/plugins-store';
import type {
  PluginManifest,
  PluginMetadata,
  PluginMarketplaceEntry,
  PluginPermission,
} from '@/lib/plugins/types';

export interface UsePluginOperationsReturn {
  // State
  plugins: PluginMetadata[];
  isLoading: boolean;
  error: string | null;

  // Plugin operations
  installPlugin: (manifest: PluginManifest, code?: string) => Promise<string>;
  uninstallPlugin: (pluginId: string) => Promise<void>;
  activatePlugin: (pluginId: string) => Promise<void>;
  deactivatePlugin: (pluginId: string) => Promise<void>;
  grantPermission: (pluginId: string, permission: PluginPermission) => Promise<void>;
  revokePermission: (pluginId: string, permission: PluginPermission) => Promise<void>;
  updatePluginSettings: (pluginId: string, settings: Record<string, any>) => Promise<void>;
  clearPluginData: (pluginId: string) => Promise<void>;

  // Refresh
  refreshPlugins: () => Promise<void>;

  // UI helpers
  openMarketplace: () => void;
  openManager: () => void;
  closeMarketplace: () => void;
  closeManager: () => void;
}

export function usePluginOperations(): UsePluginOperationsReturn {
  // Store hooks
  const plugins = usePluginsStore((s) => s.plugins);
  const addPlugin = useAddPlugin();
  const updatePlugin = useUpdatePlugin();
  const removePlugin = useRemovePlugin();
  const setIsLoadingPlugins = useSetIsLoadingPlugins();
  const setError = useSetPluginError();
  const setShowMarketplace = useSetShowMarketplace();
  const setShowManager = useSetShowManager();

  // Install plugin
  const installPlugin = useCallback(
    async (manifest: PluginManifest, code?: string) => {
      setIsLoadingPlugins(true);
      setError(null);

      try {
        const pluginId = await PluginManager.install({
          source: 'marketplace',
          manifest,
          code,
          autoActivate: false,
        });

        // Refresh plugins list
        await refreshPlugins();

        return pluginId;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to install plugin';
        setError(message);
        throw error;
      } finally {
        setIsLoadingPlugins(false);
      }
    },
    [setIsLoadingPlugins, setError]
  );

  // Uninstall plugin
  const uninstallPlugin = useCallback(
    async (pluginId: string) => {
      setIsLoadingPlugins(true);
      setError(null);

      try {
        await PluginManager.uninstall(pluginId);
        removePlugin(pluginId);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to uninstall plugin';
        setError(message);
        throw error;
      } finally {
        setIsLoadingPlugins(false);
      }
    },
    [setIsLoadingPlugins, setError, removePlugin]
  );

  // Activate plugin
  const activatePlugin = useCallback(
    async (pluginId: string) => {
      setIsLoadingPlugins(true);
      setError(null);

      try {
        await PluginManager.activate(pluginId);

        // Update plugin state
        const updated = await PluginManager.getPlugin(pluginId);
        if (updated) {
          updatePlugin(pluginId, updated);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to activate plugin';
        setError(message);
        throw error;
      } finally {
        setIsLoadingPlugins(false);
      }
    },
    [setIsLoadingPlugins, setError, updatePlugin]
  );

  // Deactivate plugin
  const deactivatePlugin = useCallback(
    async (pluginId: string) => {
      setIsLoadingPlugins(true);
      setError(null);

      try {
        await PluginManager.deactivate(pluginId);

        // Update plugin state
        const updated = await PluginManager.getPlugin(pluginId);
        if (updated) {
          updatePlugin(pluginId, updated);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to deactivate plugin';
        setError(message);
        throw error;
      } finally {
        setIsLoadingPlugins(false);
      }
    },
    [setIsLoadingPlugins, setError, updatePlugin]
  );

  // Grant permission
  const grantPermission = useCallback(
    async (pluginId: string, permission: PluginPermission) => {
      try {
        await PluginManager.grantPermission(pluginId, permission);

        // Update plugin state
        const updated = await PluginManager.getPlugin(pluginId);
        if (updated) {
          updatePlugin(pluginId, updated);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to grant permission';
        setError(message);
        throw error;
      }
    },
    [setError, updatePlugin]
  );

  // Revoke permission
  const revokePermission = useCallback(
    async (pluginId: string, permission: PluginPermission) => {
      try {
        await PluginManager.revokePermission(pluginId, permission);

        // Update plugin state
        const updated = await PluginManager.getPlugin(pluginId);
        if (updated) {
          updatePlugin(pluginId, updated);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to revoke permission';
        setError(message);
        throw error;
      }
    },
    [setError, updatePlugin]
  );

  // Update plugin settings
  const updatePluginSettings = useCallback(
    async (pluginId: string, settings: Record<string, any>) => {
      try {
        await PluginManager.updateSettings(pluginId, settings);

        // Update plugin state
        const updated = await PluginManager.getPlugin(pluginId);
        if (updated) {
          updatePlugin(pluginId, updated);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update settings';
        setError(message);
        throw error;
      }
    },
    [setError, updatePlugin]
  );

  // Clear plugin data
  const clearPluginData = useCallback(
    async (pluginId: string) => {
      try {
        await PluginManager.clearData(pluginId);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to clear data';
        setError(message);
        throw error;
      }
    },
    [setError]
  );

  // Refresh plugins list
  const refreshPlugins = useCallback(async () => {
    setIsLoadingPlugins(true);
    setError(null);

    try {
      const allPlugins = await PluginManager.getAllPlugins();
      // Add each plugin to store
      for (const plugin of allPlugins) {
        addPlugin(plugin);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load plugins';
      setError(message);
    } finally {
      setIsLoadingPlugins(false);
    }
  }, [setIsLoadingPlugins, setError, addPlugin]);

  // UI helpers
  const openMarketplace = useCallback(() => {
    setShowMarketplace(true);
  }, [setShowMarketplace]);

  const openManager = useCallback(() => {
    setShowManager(true);
  }, [setShowManager]);

  const closeMarketplace = useCallback(() => {
    setShowMarketplace(false);
  }, [setShowMarketplace]);

  const closeManager = useCallback(() => {
    setShowManager(false);
  }, [setShowManager]);

  return {
    plugins,
    isLoading: usePluginsStore.getState().isLoadingPlugins,
    error: usePluginsStore.getState().error,

    installPlugin,
    uninstallPlugin,
    activatePlugin,
    deactivatePlugin,
    grantPermission,
    revokePermission,
    updatePluginSettings,
    clearPluginData,

    refreshPlugins,

    openMarketplace,
    openManager,
    closeMarketplace,
    closeManager,
  };
}

// Helper hook for plugin marketplace
export interface UsePluginMarketplaceReturn {
  entries: PluginMarketplaceEntry[];
  isLoading: boolean;
  error: string | null;

  // Filters
  filterCategory: string | null;
  setFilterCategory: (category: string | null) => void;
  filterSearch: string;
  setFilterSearch: (search: string) => void;

  // Actions
  refreshMarketplace: () => Promise<void>;
  installFromMarketplace: (entry: PluginMarketplaceEntry) => Promise<string>;
}

export function usePluginMarketplace(): UsePluginMarketplaceReturn {
  const setFilterCategory = useSetFilterCategory();
  const setFilterSearch = useSetFilterSearch();
  const setIsLoadingMarketplace = useSetIsLoadingMarketplace();
  const setError = useSetPluginError();
  const { installPlugin } = usePluginOperations();

  // Refresh marketplace (placeholder for future API)
  const refreshMarketplace = useCallback(async () => {
    setIsLoadingMarketplace(true);
    setError(null);

    try {
      // TODO: Fetch from actual marketplace API
      // For now, load built-in plugins
      const builtInPlugins = getBuiltInMarketplaceEntries();

      usePluginsStore.getState().setMarketplaceEntries(builtInPlugins);
      usePluginsStore.getState().setMarketplaceLastFetch(Date.now());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load marketplace';
      setError(message);
    } finally {
      setIsLoadingMarketplace(false);
    }
  }, [setIsLoadingMarketplace, setError]);

  // Install from marketplace
  const installFromMarketplace = useCallback(
    async (entry: PluginMarketplaceEntry) => {
      // For built-in plugins, the manifest is embedded
      const manifest = entry.manifest || (await fetchPluginManifest(entry.id));

      if (!manifest) {
        throw new Error('Plugin manifest not found');
      }

      return installPlugin(manifest);
    },
    [installPlugin]
  );

  return {
    entries: usePluginsStore((s) => s.getFilteredMarketplaceEntries()),
    isLoading: usePluginsStore((s) => s.isLoadingMarketplace),
    error: usePluginsStore((s) => s.error),

    filterCategory: usePluginsStore((s) => s.filterCategory),
    setFilterCategory,
    filterSearch: usePluginsStore((s) => s.filterSearch),
    setFilterSearch,

    refreshMarketplace,
    installFromMarketplace,
  };
}

// Helper to load built-in marketplace entries
function getBuiltInMarketplaceEntries(): PluginMarketplaceEntry[] {
  return [
    {
      id: 'github-integration',
      name: 'GitHub Integration',
      version: '1.0.0',
      description: 'Sync repositories, issues, and pull requests from GitHub',
      author: 'Built-in',
      category: 'Integrations',
      tags: ['github', 'git', 'version-control'],
      downloads: 0,
      rating: 5,
      reviews: 0,
      permissions: ['network', 'storage'],
      downloadUrl: '',
      fileSize: 0,
      builtin: true,
      manifest: githubManifest,
    },
    {
      id: 'theme-pack-retro',
      name: 'Retro Theme Pack',
      version: '1.0.0',
      description: '50+ retro color themes including 8-bit, cyberpunk, and vaporwave',
      author: 'Built-in',
      category: 'Themes',
      tags: ['themes', 'colors', 'retro'],
      downloads: 0,
      rating: 5,
      reviews: 0,
      permissions: [],
      downloadUrl: '',
      fileSize: 0,
      builtin: true,
      manifest: retroThemeManifest,
    },
  ];
}

// Helper to fetch plugin manifest (placeholder)
async function fetchPluginManifest(_pluginId: string): Promise<PluginManifest | null> {
  // TODO: Implement actual manifest fetching
  return null;
}

// Note: usePluginsStore is already imported at the top of this file
