/**
 * Settings Exporter - Export Settings to JSON
 *
 * Handles export of settings to downloadable JSON files, clipboard,
 * or project-local storage. Sensitive data is sanitized automatically.
 *
 * @module lib/settings/settings-exporter
 * @story S-028: Export/Import Project Settings
 */

import type { Project } from '@/infrastructure/persistence/stores/project';
import type { ProviderConfig } from '@/infrastructure/persistence/stores/providers/types';
import type { LayoutState } from '@/infrastructure/persistence/stores/layout-store';
import { serializeSettings, getExportFilename } from './settings-serializer';

// ============================================================================
// EXPORT OPTIONS
// ============================================================================

/**
 * Export options
 */
export interface ExportOptions {
  /** Include projects (default: true) */
  includeProjects?: boolean;
  /** Include providers (default: true, API keys always excluded) */
  includeProviders?: boolean;
  /** Include UI preferences (default: true) */
  includePreferences?: boolean;
  /** Minify JSON output (default: false) */
  minify?: boolean;
}

/**
 * Export result
 */
export interface ExportResult {
  success: boolean;
  data?: string;
  filename?: string;
  error?: string;
  size?: number; // bytes
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

/**
 * Export settings from stores
 *
 * @param config - Settings from Zustand stores
 * @param options - Export options
 * @returns Export result with JSON data
 */
export function exportSettings(
  config: {
    projects?: Project[];
    activeProjectId?: string | null;
    providers?: ProviderConfig[];
    preferences?: Partial<LayoutState>;
  },
  options: ExportOptions = {}
): ExportResult {
  try {
    const {
      includeProjects = true,
      includeProviders = true,
      includePreferences = true,
      minify = false,
    } = options;

    // Filter config based on options
    const filteredConfig = {
      projects: includeProjects ? config.projects : [],
      activeProjectId: config.activeProjectId,
      providers: includeProviders ? config.providers : [],
      preferences: includePreferences ? config.preferences : undefined,
    };

    // Serialize to export format
    const serialized = serializeSettings(filteredConfig);

    // Convert to JSON
    const json = minify
      ? JSON.stringify(serialized)
      : JSON.stringify(serialized, null, 2);

    return {
      success: true,
      data: json,
      filename: getExportFilename(),
      size: new Blob([json]).size,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Download settings as JSON file
 *
 * @param data - JSON string data
 * @param filename - Output filename (default: auto-generated)
 * @returns Promise that resolves when download starts
 */
export async function downloadSettingsFile(
  data: string,
  filename?: string
): Promise<void> {
  try {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename || getExportFilename();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup URL after delay
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Copy settings to clipboard
 *
 * @param data - JSON string data
 * @returns Promise that resolves when copied to clipboard
 */
export async function copyToClipboard(data: string): Promise<void> {
  try {
    if (!navigator.clipboard) {
      throw new Error('Clipboard API not available');
    }

    await navigator.clipboard.writeText(data);
  } catch (error) {
    throw new Error(`Failed to copy to clipboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Save settings to IndexedDB for backup
 *
 * @param data - JSON string data
 * @param key - Storage key (default: 'settings-backup-latest')
 * @returns Promise that resolves when saved
 */
export async function saveToIndexedDB(
  data: string,
  key = 'settings-backup-latest'
): Promise<void> {
  try {
    // Use localStorage for simple backup (consider IndexedDB for larger data)
    localStorage.setItem(key, data);
  } catch (error) {
    throw new Error(`Failed to save to storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Export and download settings in one step
 *
 * @param config - Settings from Zustand stores
 * @param options - Export options
 * @returns Promise that resolves when download starts
 */
export async function exportAndDownload(
  config: Parameters<typeof exportSettings>[0],
  options?: ExportOptions
): Promise<void> {
  const result = exportSettings(config, options);

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Export failed');
  }

  await downloadSettingsFile(result.data, result.filename);
}

/**
 * Export and copy to clipboard in one step
 *
 * @param config - Settings from Zustand stores
 * @param options - Export options
 * @returns Promise that resolves when copied
 */
export async function exportAndCopy(
  config: Parameters<typeof exportSettings>[0],
  options?: ExportOptions
): Promise<void> {
  const result = exportSettings(config, options);

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Export failed');
  }

  await copyToClipboard(result.data);
}

/**
 * Get export statistics
 *
 * @param config - Settings from Zustand stores
 * @returns Statistics about the export
 */
export function getExportStats(config: {
  projects?: Project[];
  providers?: ProviderConfig[];
  preferences?: Partial<LayoutState>;
}): {
  projectCount: number;
  providerCount: number;
  hasPreferences: boolean;
  estimatedSize: number;
} {
  const projectCount = config.projects?.length || 0;
  const providerCount = config.providers?.length || 0;
  const hasPreferences = !!config.preferences;

  // Rough estimate: 1KB per project, 500B per provider
  const estimatedSize = (projectCount * 1024) + (providerCount * 512) + (hasPreferences ? 256 : 0);

  return {
    projectCount,
    providerCount,
    hasPreferences,
    estimatedSize,
  };
}

/**
 * Format file size for display
 *
 * @param bytes - Size in bytes
 * @returns Formatted size string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}
