/**
 * Settings Serializer - Serialize/Deserialize Settings
 *
 * Handles conversion between application state and portable settings format.
 * Sanitizes sensitive data, validates schema, and provides backup/restore.
 *
 * @module lib/settings/settings-serializer
 * @story S-028: Export/Import Project Settings
 */

import type { Project } from '@/infrastructure/persistence/stores/project';
import type { ProviderConfig } from '@/infrastructure/persistence/stores/providers/types';
import type { LayoutState } from '@/infrastructure/persistence/stores/layout-store';

// ============================================================================
// SETTINGS SCHEMA TYPES
// ============================================================================

/**
 * Serializable project settings (excluding FSA handles)
 */
export interface SerializableProject {
  id: string;
  name: string;
  folderPath: string;
  lastOpened: string; // ISO timestamp
  createdAt: string; // ISO timestamp
  autoSync: boolean;
  layoutState?: {
    panelSizes?: number[];
    openFiles?: string[];
    activeFile?: string | null;
  };
  exclusionPatterns?: string[];
  bindings: {
    ide: boolean;
    knowledge: boolean;
    notes: boolean;
    study: boolean;
  };
  fileSnapshotEnabled?: boolean;
  description?: string;
  tags: string[];
}

/**
 * Serializable provider configuration (API keys sanitized)
 */
export interface SerializableProvider {
  id: string;
  name: string;
  type: string;
  baseURL: string;
  defaultModel?: string;
  hasApiKey: boolean; // Flag only, actual key excluded
  models: Array<{
    id: string;
    name: string;
    providerId: string;
    contextLength?: number;
    maxTokens?: number;
    isFree?: boolean;
    supportsStreaming?: boolean;
    supportsImages?: boolean;
    supportsTools?: boolean;
  }>;
  lastModelFetchAt?: number;
  enabled: boolean;
  isCustom?: boolean;
  supportsNativeTools?: boolean;
}

/**
 * Settings export format
 */
export interface SettingsExport {
  version: string;
  exportedAt: string; // ISO timestamp
  applicationVersion?: string;

  // Project settings
  projects?: SerializableProject[];
  activeProjectId?: string | null;

  // Provider configuration (API keys sanitized)
  providers?: SerializableProvider[];

  // UI preferences
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    sidebarCollapsed?: boolean;
    activeNavItem?: string;
  };
}

/**
 * Import validation result
 */
export interface ImportValidationResult {
  isValid: boolean;
  version: string;
  versionCompatible: boolean;
  errors: string[];
  warnings: string[];
  projectCount: number;
  providerCount: number;
}

/**
 * Import conflict type
 */
export type ConflictType = 'skip' | 'overwrite' | 'merge' | 'prompt';

/**
 * Import conflict resolution
 */
export interface ImportConflict {
  type: 'project' | 'provider' | 'preference';
  id: string;
  name: string;
  currentValue: any;
  importValue: any;
  suggestedAction: ConflictType;
}

/**
 * Import preview result
 */
export interface ImportPreview {
  validation: ImportValidationResult;
  conflicts: ImportConflict[];
  estimatedChanges: {
    projectsToAdd: number;
    projectsToUpdate: number;
    providersToAdd: number;
    providersToUpdate: number;
    preferencesToUpdate: number;
  };
}

// ============================================================================
// SERIALIZATION FUNCTIONS
// ============================================================================

/**
 * Current settings format version
 */
const SETTINGS_VERSION = '1.0.0';

/**
 * Sanitize project for export (remove FSA handles)
 */
function sanitizeProject(project: Project): SerializableProject {
  return {
    id: project.id,
    name: project.name,
    folderPath: project.folderPath,
    lastOpened: project.lastOpened.toISOString(),
    createdAt: project.createdAt.toISOString(),
    autoSync: project.autoSync,
    layoutState: project.layoutState,
    exclusionPatterns: project.exclusionPatterns,
    bindings: project.bindings,
    fileSnapshotEnabled: project.fileSnapshotEnabled,
    description: project.description,
    tags: project.tags,
  };
}

/**
 * Sanitize provider for export (remove API keys)
 */
function sanitizeProvider(provider: ProviderConfig): SerializableProvider {
  return {
    id: provider.id,
    name: provider.name,
    type: provider.type,
    baseURL: provider.baseURL,
    defaultModel: provider.defaultModel,
    hasApiKey: provider.hasApiKey, // Flag only, not actual key
    models: provider.models.map(m => ({
      id: m.id,
      name: m.name,
      providerId: m.providerId,
      contextLength: m.contextLength,
      maxTokens: m.maxTokens,
      isFree: m.isFree,
      supportsStreaming: m.supportsStreaming,
      supportsImages: m.supportsImages,
      supportsTools: m.supportsTools,
    })),
    lastModelFetchAt: provider.lastModelFetchAt,
    enabled: provider.enabled,
    isCustom: provider.isCustom,
    supportsNativeTools: provider.supportsNativeTools,
  };
}

/**
 * Serialize settings to export format
 *
 * @param config - Settings configuration from stores
 * @returns Serializable settings object
 */
export function serializeSettings(config: {
  projects?: Project[];
  activeProjectId?: string | null;
  providers?: ProviderConfig[];
  preferences?: Partial<LayoutState>;
}): SettingsExport {
  return {
    version: SETTINGS_VERSION,
    exportedAt: new Date().toISOString(),
    applicationVersion: import.meta.env.VITE_APP_VERSION || '2.5.0-BETA',

    // Serialize projects
    projects: config.projects?.map(sanitizeProject),

    // Active project
    activeProjectId: config.activeProjectId,

    // Serialize providers (API keys already excluded)
    providers: config.providers?.map(sanitizeProvider),

    // UI preferences
    preferences: config.preferences ? {
      theme: undefined, // Will be read from theme store
      sidebarCollapsed: config.preferences.sidebarCollapsed,
      activeNavItem: config.preferences.activeNavItem,
    } : undefined,
  };
}

/**
 * Deserialize settings from import format
 *
 * @param data - Imported settings data
 * @returns Deserialized settings object
 */
export function deserializeSettings(data: SettingsExport): {
  projects: SerializableProject[];
  providers: SerializableProvider[];
  preferences?: SettingsExport['preferences'];
  activeProjectId?: string | null;
} {
  return {
    projects: data.projects || [],
    providers: data.providers || [],
    preferences: data.preferences,
    activeProjectId: data.activeProjectId,
  };
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate settings import data
 *
 * @param data - Raw import data
 * @returns Validation result
 */
export function validateImport(data: unknown): ImportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic structure check
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      version: 'unknown',
      versionCompatible: false,
      errors: ['Invalid import data: not an object'],
      warnings: [],
      projectCount: 0,
      providerCount: 0,
    };
  }

  const importData = data as Partial<SettingsExport>;

  // Version check
  const version = importData.version || 'unknown';
  const versionCompatible = isVersionCompatible(version);

  if (!versionCompatible) {
    warnings.push(`Import version ${version} may not be fully compatible with current version ${SETTINGS_VERSION}`);
  }

  // Required fields check
  if (!importData.exportedAt) {
    errors.push('Missing export timestamp');
  }

  if (importData.projects && !Array.isArray(importData.projects)) {
    errors.push('Projects must be an array');
  }

  if (importData.providers && !Array.isArray(importData.providers)) {
    errors.push('Providers must be an array');
  }

  // Count items
  const projectCount = Array.isArray(importData.projects) ? importData.projects.length : 0;
  const providerCount = Array.isArray(importData.providers) ? importData.providers.length : 0;

  // Validate projects
  if (importData.projects) {
    importData.projects.forEach((project, index) => {
      if (!project.id) {
        errors.push(`Project at index ${index} missing id`);
      }
      if (!project.name) {
        errors.push(`Project at index ${index} missing name`);
      }
      if (!project.folderPath) {
        warnings.push(`Project "${project.name || index}" missing folderPath`);
      }
    });
  }

  // Validate providers
  if (importData.providers) {
    importData.providers.forEach((provider, index) => {
      if (!provider.id) {
        errors.push(`Provider at index ${index} missing id`);
      }
      if (!provider.name) {
        errors.push(`Provider at index ${index} missing name`);
      }
      if (provider.hasApiKey === undefined) {
        warnings.push(`Provider "${provider.name || index}" missing API key flag`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    version,
    versionCompatible,
    errors,
    warnings,
    projectCount,
    providerCount,
  };
}

/**
 * Check if import version is compatible with current version
 *
 * @param version - Import version string
 * @returns True if compatible
 */
function isVersionCompatible(version: string): boolean {
  if (version === 'unknown') {
    return true; // Assume compatible for unknown versions
  }

  const currentParts = SETTINGS_VERSION.split('.').map(Number);
  const importParts = version.split('.').map(Number);

  // Major version must match
  if (currentParts[0] !== importParts[0]) {
    return false;
  }

  // Minor version can be lower (backward compatible)
  // but not higher (forward compatibility not guaranteed)
  if (importParts[1] > currentParts[1]) {
    return false;
  }

  return true;
}

/**
 * Detect conflicts between current and imported settings
 *
 * @param imported - Imported settings
 * @param current - Current settings
 * @returns List of conflicts
 */
export function detectConflicts(
  imported: ReturnType<typeof deserializeSettings>,
  current: {
    projects: Map<string, Project>;
    providers: Map<string, ProviderConfig>;
  }
): ImportConflict[] {
  const conflicts: ImportConflict[] = [];

  // Project conflicts
  imported.projects.forEach(importedProject => {
    const existingProject = current.projects.get(importedProject.id);
    if (existingProject) {
      conflicts.push({
        type: 'project',
        id: importedProject.id,
        name: importedProject.name,
        currentValue: existingProject,
        importValue: importedProject,
        suggestedAction: 'merge',
      });
    }
  });

  // Provider conflicts
  imported.providers.forEach(importedProvider => {
    const existingProvider = current.providers.get(importedProvider.id);
    if (existingProvider) {
      conflicts.push({
        type: 'provider',
        id: importedProvider.id,
        name: importedProvider.name,
        currentValue: existingProvider,
        importValue: importedProvider,
        suggestedAction: 'skip', // Don't overwrite provider configs
      });
    }
  });

  return conflicts;
}

/**
 * Preview import changes
 *
 * @param imported - Imported settings
 * @param current - Current settings
 * @returns Import preview
 */
export function previewImport(
  imported: ReturnType<typeof deserializeSettings>,
  current: {
    projects: Map<string, Project>;
    providers: Map<string, ProviderConfig>;
  }
): ImportPreview {
  const validation = validateImport(imported as any);
  const conflicts = detectConflicts(imported, current);

  // Estimate changes
  const existingProjectIds = new Set(current.projects.keys());
  const projectsToAdd = imported.projects.filter(p => !existingProjectIds.has(p.id)).length;
  const projectsToUpdate = imported.projects.filter(p => existingProjectIds.has(p.id)).length;

  const existingProviderIds = new Set(current.providers.keys());
  const providersToAdd = imported.providers.filter(p => !existingProviderIds.has(p.id)).length;
  const providersToUpdate = imported.providers.filter(p => existingProviderIds.has(p.id)).length;

  const preferencesToUpdate = imported.preferences ? 1 : 0;

  return {
    validation,
    conflicts,
    estimatedChanges: {
      projectsToAdd,
      projectsToUpdate,
      providersToAdd,
      providersToUpdate,
      preferencesToUpdate,
    },
  };
}

/**
 * Get export filename with timestamp
 *
 * @returns Filename string
 */
export function getExportFilename(): string {
  const date = new Date();
  const timestamp = date.toISOString().replace(/[:.]/g, '-').split('T')[0];
  return `settings-backup-${timestamp}.json`;
}

/**
 * Create backup of current settings before import
 *
 * @param settings - Current settings
 * @returns Backup data
 */
export function createBackup(settings: SettingsExport): string {
  return JSON.stringify(settings, null, 2);
}
