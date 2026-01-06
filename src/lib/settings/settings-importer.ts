/**
 * Settings Importer - Import Settings from JSON
 *
 * Handles import of settings from files, clipboard, or URLs.
 * Validates schema, detects conflicts, and provides backup/restore.
 *
 * @module lib/settings/settings-importer
 * @story S-028: Export/Import Project Settings
 */

import type { Project } from '@/infrastructure/persistence/stores/project';
import type { ProviderConfig } from '@/infrastructure/persistence/stores/providers/types';
import {
  deserializeSettings,
  validateImport,
  previewImport,
  createBackup,
  type SettingsExport,
  type ImportPreview,
} from './settings-serializer';

// ============================================================================
// IMPORT OPTIONS
// ============================================================================

/**
 * Conflict resolution strategy
 */
export type ConflictResolution = 'skip' | 'overwrite' | 'merge' | 'prompt';

/**
 * Import options
 */
export interface ImportOptions {
  /** How to handle conflicts (default: 'prompt') */
  conflictResolution?: ConflictResolution;
  /** Whether to create backup before import (default: true) */
  createBackup?: boolean;
  /** Whether to import projects (default: true) */
  importProjects?: boolean;
  /** Whether to import providers (default: true) */
  importProviders?: boolean;
  /** Whether to import preferences (default: true) */
  importPreferences?: boolean;
}

/**
 * Import result
 */
export interface ImportResult {
  success: boolean;
  preview?: ImportPreview;
  backup?: string;
  appliedChanges?: {
    projectsAdded: number;
    projectsUpdated: number;
    providersAdded: number;
    providersUpdated: number;
    preferencesUpdated: boolean;
  };
  error?: string;
}

// ============================================================================
// IMPORT FUNCTIONS
// ============================================================================

/**
 * Parse JSON from string
 *
 * @param jsonString - JSON string
 * @returns Parsed object or null if invalid
 */
export function parseImportData(jsonString: string): unknown {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Import settings from JSON string
 *
 * @param jsonString - JSON string data
 * @param currentProjects - Current projects from store
 * @param currentProviders - Current providers from store
 * @param options - Import options
 * @returns Import result
 */
export function importSettings(
  jsonString: string,
  currentProjects: Map<string, Project>,
  currentProviders: Map<string, ProviderConfig>,
  options: ImportOptions = {}
): ImportResult {
  try {
    const {
      createBackup: shouldCreateBackup = true,
    } = options;

    // Parse JSON
    const data = parseImportData(jsonString);
    if (!data) {
      return {
        success: false,
        error: 'Failed to parse JSON',
      };
    }

    // Validate
    const validation = validateImport(data);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`,
      };
    }

    // Deserialize
    const imported = deserializeSettings(data as SettingsExport);

    // Preview changes
    const current = {
      projects: currentProjects,
      providers: currentProviders,
    };

    const importPreview = previewImport(imported, current);

    // Create backup if requested
    let backup: string | undefined;
    if (shouldCreateBackup) {
      const currentExport: SettingsExport = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        projects: Array.from(currentProjects.values()).map(p => ({
          id: p.id,
          name: p.name,
          folderPath: p.folderPath,
          lastOpened: p.lastOpened.toISOString(),
          createdAt: p.createdAt.toISOString(),
          autoSync: p.autoSync,
          bindings: p.bindings,
          tags: p.tags,
        })),
        providers: Array.from(currentProviders.values()).map(p => ({
          id: p.id,
          name: p.name,
          type: p.type,
          baseURL: p.baseURL,
          hasApiKey: p.hasApiKey,
          models: p.models,
          enabled: p.enabled,
        })),
      };
      backup = createBackup(currentExport);
    }

    // Note: Actual application of changes happens in the store
    // This function only validates and prepares the import
    return {
      success: true,
      preview: importPreview,
      backup,
      appliedChanges: undefined, // Will be set by store
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Read file as text
 *
 * @param file - File object
 * @returns Promise with file contents
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Import settings from file
 *
 * @param file - File object
 * @param currentProjects - Current projects from store
 * @param currentProviders - Current providers from store
 * @param options - Import options
 * @returns Promise with import result
 */
export async function importFromFile(
  file: File,
  currentProjects: Map<string, Project>,
  currentProviders: Map<string, ProviderConfig>,
  options?: ImportOptions
): Promise<ImportResult> {
  try {
    const jsonString = await readFileAsText(file);
    return importSettings(jsonString, currentProjects, currentProviders, options);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to read file',
    };
  }
}

/**
 * Import settings from clipboard
 *
 * @param currentProjects - Current projects from store
 * @param currentProviders - Current providers from store
 * @param options - Import options
 * @returns Promise with import result
 */
export async function importFromClipboard(
  currentProjects: Map<string, Project>,
  currentProviders: Map<string, ProviderConfig>,
  options?: ImportOptions
): Promise<ImportResult> {
  try {
    if (!navigator.clipboard) {
      throw new Error('Clipboard API not available');
    }

    const jsonString = await navigator.clipboard.readText();
    return importSettings(jsonString, currentProjects, currentProviders, options);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to read clipboard',
    };
  }
}

/**
 * Import settings from URL (fetch JSON)
 *
 * @param url - URL to fetch
 * @param currentProjects - Current projects from store
 * @param currentProviders - Current providers from store
 * @param options - Import options
 * @returns Promise with import result
 */
export async function importFromUrl(
  url: string,
  currentProjects: Map<string, Project>,
  currentProviders: Map<string, ProviderConfig>,
  options?: ImportOptions
): Promise<ImportResult> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const jsonString = await response.text();
    return importSettings(jsonString, currentProjects, currentProviders, options);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch URL',
    };
  }
}

/**
 * Restore settings from backup
 *
 * @param backupJson - Backup JSON string
 * @param currentProjects - Current projects from store
 * @param currentProviders - Current providers from store
 * @returns Import result
 */
export function restoreFromBackup(
  backupJson: string,
  currentProjects: Map<string, Project>,
  currentProviders: Map<string, ProviderConfig>
): ImportResult {
  return importSettings(
    backupJson,
    currentProjects,
    currentProviders,
    { conflictResolution: 'overwrite' }
  );
}

/**
 * Load backup from localStorage
 *
 * @param key - Storage key (default: 'settings-backup-latest')
 * @returns Backup JSON string or null
 */
export function loadBackupFromStorage(key = 'settings-backup-latest'): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Failed to load backup from storage:', error);
    return null;
  }
}

/**
 * Save backup to localStorage
 *
 * @param backupJson - Backup JSON string
 * @param key - Storage key (default: 'settings-backup-latest')
 * @returns True if saved successfully
 */
export function saveBackupToStorage(
  backupJson: string,
  key = 'settings-backup-latest'
): boolean {
  try {
    localStorage.setItem(key, backupJson);
    return true;
  } catch (error) {
    console.error('Failed to save backup to storage:', error);
    return false;
  }
}

/**
 * Clear backup from localStorage
 *
 * @param key - Storage key (default: 'settings-backup-latest')
 * @returns True if cleared successfully
 */
export function clearBackupFromStorage(key = 'settings-backup-latest'): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Failed to clear backup from storage:', error);
    return false;
  }
}
