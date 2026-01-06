/**
 * Dexie Database Plugin Types
 *
 * Defines IndexedDB table schemas for plugin registry.
 * Stores plugin metadata, settings, and marketplace cache.
 *
 * @module infrastructure/persistence/dexie-db-plugin-types
 * @story S-037 - Plugin System for extensibility with marketplace
 */

import type { PluginMarketplaceEntry, PluginManifest } from '@/lib/plugins/types';

/**
 * Plugin registry record (stored in IndexedDB)
 */
export interface PluginRecord {
  id: string; // plugin ID (name:version)
  manifest: PluginManifest;
  source: 'marketplace' | 'local' | 'builtin';
  installedAt: string; // ISO timestamp
  updatedAt?: string; // ISO timestamp
  state: 'installed' | 'loaded' | 'activated' | 'deactivated' | 'error';
  permissions: {
    permission: string;
    granted: boolean;
    requestedAt?: string;
    grantedAt?: string;
  }[];
  settings?: Record<string, any>;
  stats: {
    timesActivated: number;
    lastActivated?: string;
    lastError?: string;
  };
  storeName?: string; // IndexedDB store name for plugin data
}

/**
 * Plugin settings record (separate table for plugin-specific settings)
 */
export interface PluginSettingsRecord {
  pluginId: string; // FK to plugins.id
  settings: Record<string, any>;
  updatedAt: string; // ISO timestamp
}

/**
 * Plugin marketplace cache record
 */
export interface PluginMarketplaceRecord {
  id: string; // plugin ID
  entry: PluginMarketplaceEntry;
  cachedAt: string; // ISO timestamp
  expiresAt: string; // ISO timestamp
}

/**
 * Plugin storage record (generic plugin data storage)
 */
export interface PluginStorageRecord {
  id: string; // Composite: pluginId:key
  pluginId: string; // Which plugin owns this
  key: string; // Storage key
  value: any; // Serialized value
  updatedAt: string; // ISO timestamp
}

/**
 * Dexie table definitions
 */
export interface PluginsTable {
  key: string; // Primary key
  indexes: {
    'source': string; // For filtering by source
    'state': string; // For filtering by state
    'installedAt': string; // For sorting by installation date
  };
}

export interface PluginSettingsTable {
  key: string; // Primary key: pluginId
  indexes: {};
}

export interface PluginMarketplaceTable {
  key: string; // Primary key: plugin ID
  indexes: {
    'category': string; // For filtering by category
    'cachedAt': string; // For cleanup of expired entries
  };
}

export interface PluginStorageTable {
  key: string; // Primary key: pluginId:key
  indexes: {
    'pluginId': string; // For querying all storage for a plugin
  };
}

/**
 * Helper to generate plugin ID from name and version
 */
export function generatePluginId(name: string, version: string): string {
  return `${name.toLowerCase().replace(/\s+/g, '-')}-${version}`;
}

/**
 * Helper to generate storage record ID
 */
export function generateStorageId(pluginId: string, key: string): string {
  return `${pluginId}:${key}`;
}
