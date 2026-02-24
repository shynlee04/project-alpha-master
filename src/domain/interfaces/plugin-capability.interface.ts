/**
 * @fileoverview Plugin Capability Interface - Declarative plugin capabilities
 * @module domain/interfaces/plugin-capability
 *
 * **EPIC-0.6-04**: PluginCapability Interface
 *
 * Provides a declarative interface for plugins to declare:
 * - What they can do (edit files, execute code, show preview, etc.)
 * - What they need (file system, WebContainer, network, etc.)
 * - Device support (desktop, tablet, mobile)
 * - Dependencies on other plugins
 *
 * This enables:
 * - Intelligent plugin suggestions (e.g., "use Notes for .md files")
 * - Dependency resolution (e.g., "Terminal requires WebContainer")
 * - Device-appropriate fallbacks (e.g., "Terminal unavailable on mobile")
 *
 * @epic EPIC-0.6
 * @story 0.6-04
 * @team Team A
 * @created 2026-01-27
 */

import type { PluginId } from '@/domain/types/plugin-types';

// ============================================================================
// Capability Type Definitions
// ============================================================================

/**
 * Plugin Capability Type
 *
 * @remarks
 * Categories of functionality a plugin can provide.
 */
export type PluginCapabilityType =
  | 'file-editor'      // Can edit files (Monaco, Notes)
  | 'file-viewer'      // Can view files read-only
  | 'process-runner'   // Can run processes (Terminal)
  | 'preview-renderer' // Can show preview (Preview)
  | 'ai-assistant'     // Can provide AI assistance (Chat)
  | 'file-browser';    // Can browse files (FileTree)

/**
 * Device Type
 *
 * @remarks
 * Device types for capability filtering.
 */
export type DeviceType = 'desktop' | 'tablet' | 'mobile';

/**
 * Service Requirement
 *
 * @remarks
 * Services that a plugin may require to function.
 */
export type ServiceRequirement =
  | 'webcontainer' // WebContainer for process execution
  | 'fsa'          // File System Access API
  | 'network'      // Network access
  | 'indexeddb';   // IndexedDB for storage

// ============================================================================
// Plugin Capability Interface
// ============================================================================

/**
 * Plugin Capability
 *
 * @remarks
 * Declares a single capability that a plugin provides.
 * A plugin can have multiple capabilities.
 *
 * @example
 * ```ts
 * const monacoCapabilities: PluginCapability[] = [
 *   {
 *     type: 'file-editor',
 *     fileTypes: ['*'],  // Can edit any file
 *     priority: 50,      // Default priority
 *   },
 * ];
 *
 * const notesCapabilities: PluginCapability[] = [
 *   {
 *     type: 'file-editor',
 *     fileTypes: ['.md', '.mdx'],  // Markdown only
 *     priority: 100,               // Higher priority for .md
 *   },
 * ];
 * ```
 */
export interface PluginCapability {
  /** Type of capability */
  type: PluginCapabilityType;

  /** File types this capability applies to (e.g., ['.md', '.tsx']) */
  fileTypes?: string[];

  /** Process types this capability applies to (e.g., ['shell', 'node']) */
  processTypes?: string[];

  /** Priority (higher = preferred handler). Default: 50 */
  priority?: number;
}

/**
 * Plugin Declaration
 *
 * @remarks
 * Complete capability declaration for a plugin.
 * Includes what the plugin can do, what it needs, and where it works.
 */
export interface PluginDeclaration {
  /** Plugin identifier */
  id: PluginId;

  /** Display name */
  name: string;

  // ========================================================================
  // What this plugin can do
  // ========================================================================

  /** Capabilities this plugin provides */
  capabilities: PluginCapability[];

  // ========================================================================
  // What this plugin needs
  // ========================================================================

  /** Services required for this plugin to function */
  requires: {
    /** Requires File System Access API */
    fileSystem: boolean;

    /** Requires WebContainer for process execution */
    webContainer: boolean;

    /** Requires network access */
    network: boolean;
  };

  // ========================================================================
  // Where this plugin works
  // ========================================================================

  /** Device types this plugin supports */
  supportedDevices: DeviceType[];

  // ========================================================================
  // Dependencies
  // ========================================================================

  /** Other plugins this plugin depends on */
  dependsOn: PluginId[];
}

// ============================================================================
// Plugin Declarations for Built-in Plugins
// ============================================================================

/**
 * FileTree Plugin Declaration
 */
export const FILE_TREE_DECLARATION: PluginDeclaration = {
  id: 'filetree',
  name: 'File Tree',
  capabilities: [
    { type: 'file-browser', priority: 100 },
  ],
  requires: {
    fileSystem: false, // Works with IndexedDB too
    webContainer: false,
    network: false,
  },
  supportedDevices: ['desktop', 'tablet', 'mobile'],
  dependsOn: [],
};

/**
 * Monaco Plugin Declaration
 */
export const MONACO_DECLARATION: PluginDeclaration = {
  id: 'monaco',
  name: 'Code Editor',
  capabilities: [
    { type: 'file-editor', fileTypes: ['*'], priority: 50 },
    { type: 'file-viewer', fileTypes: ['*'], priority: 50 },
  ],
  requires: {
    fileSystem: false, // Works with IndexedDB too
    webContainer: false,
    network: false,
  },
  supportedDevices: ['desktop', 'tablet'],
  dependsOn: [],
};

/**
 * Notes Plugin Declaration
 */
export const NOTES_DECLARATION: PluginDeclaration = {
  id: 'notes',
  name: 'Notes',
  capabilities: [
    { type: 'file-editor', fileTypes: ['.md', '.mdx'], priority: 100 },
    { type: 'file-viewer', fileTypes: ['.md', '.mdx'], priority: 100 },
  ],
  requires: {
    fileSystem: false, // Works with IndexedDB too
    webContainer: false,
    network: false,
  },
  supportedDevices: ['desktop', 'tablet', 'mobile'],
  dependsOn: [],
};

/**
 * Terminal Plugin Declaration
 */
export const TERMINAL_DECLARATION: PluginDeclaration = {
  id: 'terminal',
  name: 'Terminal',
  capabilities: [
    { type: 'process-runner', processTypes: ['shell', 'node'], priority: 100 },
  ],
  requires: {
    fileSystem: true,     // Requires FSA for file mounting
    webContainer: true,   // Requires WebContainer for process execution
    network: false,
  },
  supportedDevices: ['desktop'], // Desktop only
  dependsOn: [],
};

/**
 * Preview Plugin Declaration
 */
export const PREVIEW_DECLARATION: PluginDeclaration = {
  id: 'preview',
  name: 'Preview',
  capabilities: [
    { type: 'preview-renderer', priority: 100 },
  ],
  requires: {
    fileSystem: true,     // Requires FSA for file access
    webContainer: true,   // Requires WebContainer for dev server
    network: false,
  },
  supportedDevices: ['desktop'], // Desktop only
  dependsOn: ['terminal'], // Depends on Terminal for dev server
};

/**
 * Chat Plugin Declaration
 */
export const CHAT_DECLARATION: PluginDeclaration = {
  id: 'chat',
  name: 'AI Chat',
  capabilities: [
    { type: 'ai-assistant', priority: 100 },
  ],
  requires: {
    fileSystem: false,
    webContainer: false,
    network: true, // Requires network for AI API calls
  },
  supportedDevices: ['desktop', 'tablet', 'mobile'],
  dependsOn: [],
};

/**
 * All Plugin Declarations
 */
export const PLUGIN_DECLARATIONS: PluginDeclaration[] = [
  FILE_TREE_DECLARATION,
  MONACO_DECLARATION,
  NOTES_DECLARATION,
  TERMINAL_DECLARATION,
  PREVIEW_DECLARATION,
  CHAT_DECLARATION,
];

// ============================================================================
// Capability Query Functions
// ============================================================================

/**
 * Get plugins that can handle a specific file type
 *
 * @param fileType - File extension (e.g., '.md', '.tsx')
 * @returns Plugins sorted by priority (highest first)
 */
export function getPluginsForFileType(fileType: string): PluginDeclaration[] {
  return PLUGIN_DECLARATIONS
    .filter((plugin) =>
      plugin.capabilities.some((cap) =>
        (cap.type === 'file-editor' || cap.type === 'file-viewer') &&
        (cap.fileTypes?.includes(fileType) || cap.fileTypes?.includes('*'))
      )
    )
    .sort((a, b) => {
      const aPriority = a.capabilities.find((c) =>
        c.fileTypes?.includes(fileType) || c.fileTypes?.includes('*')
      )?.priority ?? 50;
      const bPriority = b.capabilities.find((c) =>
        c.fileTypes?.includes(fileType) || c.fileTypes?.includes('*')
      )?.priority ?? 50;
      return bPriority - aPriority; // Higher priority first
    });
}

/**
 * Get the best plugin for a file type
 *
 * @param fileType - File extension (e.g., '.md', '.tsx')
 * @returns Best plugin for this file type, or null if none
 */
export function getBestPluginForFileType(fileType: string): PluginDeclaration | null {
  const plugins = getPluginsForFileType(fileType);
  return plugins.length > 0 ? plugins[0] : null;
}

/**
 * Get plugins that support a specific device type
 *
 * @param deviceType - Device type
 * @returns Plugins that support this device
 */
export function getPluginsForDevice(deviceType: DeviceType): PluginDeclaration[] {
  return PLUGIN_DECLARATIONS.filter((plugin) =>
    plugin.supportedDevices.includes(deviceType)
  );
}

/**
 * Check if a plugin can run on the current platform
 *
 * @param plugin - Plugin declaration
 * @param hasFSA - Whether FSA is available
 * @param hasWebContainer - Whether WebContainer is available
 * @param deviceType - Current device type
 * @returns true if plugin can run
 */
export function canPluginRun(
  plugin: PluginDeclaration,
  hasFSA: boolean,
  hasWebContainer: boolean,
  deviceType: DeviceType
): boolean {
  // Check device support
  if (!plugin.supportedDevices.includes(deviceType)) {
    return false;
  }

  // Check service requirements
  if (plugin.requires.fileSystem && !hasFSA) {
    return false;
  }

  if (plugin.requires.webContainer && !hasWebContainer) {
    return false;
  }

  return true;
}

/**
 * Get unsatisfied dependencies for a plugin
 *
 * @param plugin - Plugin declaration
 * @param loadedPlugins - Currently loaded plugins
 * @returns List of unsatisfied plugin dependencies
 */
export function getUnsatisfiedDependencies(
  plugin: PluginDeclaration,
  loadedPlugins: PluginId[]
): PluginId[] {
  return plugin.dependsOn.filter((dep) => !loadedPlugins.includes(dep));
}

/**
 * Get plugin declaration by ID
 *
 * @param pluginId - Plugin ID
 * @returns Plugin declaration or null if not found
 */
export function getPluginDeclaration(pluginId: PluginId): PluginDeclaration | null {
  return PLUGIN_DECLARATIONS.find((p) => p.id === pluginId) ?? null;
}
