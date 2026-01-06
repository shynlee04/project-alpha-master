/**
 * Plugin System Type Definitions
 *
 * Defines the core types for the plugin system including:
 * - Plugin manifests
 * - Plugin metadata
 * - Permission types
 * - Extension point types
 * - Plugin lifecycle states
 *
 * @module plugins/types
 * @story S-037 - Plugin System for extensibility with marketplace
 */

/**
 * Permission types that plugins can request
 */
export type PluginPermission =
  | 'fs' // File system access (read/write)
  | 'network' // Network requests (API calls)
  | 'ui' // UI modification (add panels, menus)
  | 'workspace' // Workspace access
  | 'agents' // AI agent access
  | 'notifications' // Send notifications
  | 'storage'; // Plugin-specific storage (IndexedDB)

/**
 * Plugin permission details
 */
export interface PluginPermissionDetail {
  permission: PluginPermission;
  granted: boolean;
  requestedAt?: Date;
  grantedAt?: Date;
}

/**
 * Plugin lifecycle states
 */
export type PluginLifecycleState =
  | 'installed' // Plugin files present but not loaded
  | 'loaded' // Plugin code loaded in memory
  | 'activated' // Plugin activate() hook called
  | 'deactivated' // Plugin deactivate() hook called
  | 'error'; // Plugin encountered error

/**
 * Plugin source types
 */
export type PluginSource =
  | 'marketplace' // Installed from marketplace
  | 'local' // Installed from local file
  | 'builtin'; // Built-in plugin (bundled with app)

/**
 * Extension point types
 */
export type ExtensionPointType =
  | 'command' // Custom command palette command
  | 'theme' // Color theme
  | 'language' // Syntax highlighting language
  | 'fileHandler' // File type handler
  | 'uiPanel' // Custom UI panel
  | 'statusBar' // Status bar item
  | 'contextMenu' // Context menu item
  | 'hook'; // Event hook

/**
 * Base extension point interface
 */
export interface ExtensionPoint {
  id: string;
  type: ExtensionPointType;
  pluginId: string;
}

/**
 * Command extension point
 */
export interface CommandExtension extends ExtensionPoint {
  type: 'command';
  command: {
    id: string;
    label: string;
    description: string;
    icon?: string;
    handler: () => void | Promise<void>;
    keybinding?: string;
  };
}

/**
 * Theme extension point
 */
export interface ThemeExtension extends ExtensionPoint {
  type: 'theme';
  theme: {
    id: string;
    name: string;
    colors: {
      background: string;
      foreground: string;
      primary: string;
      secondary: string;
      accent: string;
      muted: string;
      border: string;
    };
  };
}

/**
 * Language extension point
 */
export interface LanguageExtension extends ExtensionPoint {
  type: 'language';
  language: {
    id: string;
    name: string;
    extensions: string[];
    mimeType?: string;
  };
}

/**
 * File handler extension point
 */
export interface FileHandlerExtension extends ExtensionPoint {
  type: 'fileHandler';
  handler: {
    extensions: string[];
    mimeType?: string;
    component: string; // Component path
    canEdit: boolean;
  };
}

/**
 * UI panel extension point
 */
export interface UIPanelExtension extends ExtensionPoint {
  type: 'uiPanel';
  panel: {
    id: string;
    title: string;
    icon: string;
    position: 'sidebar' | 'bottom' | 'right';
    component: string; // Component path
  };
}

/**
 * Status bar extension point
 */
export interface StatusBarExtension extends ExtensionPoint {
  type: 'statusBar';
  item: {
    id: string;
    label: string;
    icon?: string;
    position: 'left' | 'right';
    order: number;
    component?: string; // Optional custom component
  };
}

/**
 * Context menu extension point
 */
export interface ContextMenuExtension extends ExtensionPoint {
  type: 'contextMenu';
  menuItem: {
    id: string;
    label: string;
    icon?: string;
    context: string[]; // Where to show (['editor', 'fileTree', etc])
    handler: () => void | Promise<void>;
  };
}

/**
 * Hook extension point
 */
export interface HookExtension extends ExtensionPoint {
  type: 'hook';
  hook: {
    event: string; // Event name to hook into
    handler: (...args: any[]) => void | Promise<void>;
  };
}

/**
 * Union type of all extension points
 */
export type PluginExtension =
  | CommandExtension
  | ThemeExtension
  | LanguageExtension
  | FileHandlerExtension
  | UIPanelExtension
  | StatusBarExtension
  | ContextMenuExtension
  | HookExtension;

/**
 * Plugin manifest (from manifest.json)
 */
export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  license?: string;
  homepage?: string;
  repository?: string;
  icon?: string;
  screenshots?: string[];

  // Entry point
  main: string;

  // Permissions
  permissions: PluginPermission[];

  // Dependencies
  dependencies?: {
    [key: string]: string; // plugin name: version range
  };

  // App version compatibility
  appVersion?: {
    min?: string;
    max?: string;
  };

  // Extension points provided by this plugin
  extensionPoints?: PluginExtension[];

  // Settings schema (for plugin configuration UI)
  settingsSchema?: {
    type: 'object';
    properties: {
      [key: string]: {
        type: 'string' | 'number' | 'boolean' | 'select';
        label: string;
        description?: string;
        default?: any;
        options?: { label: string; value: any }[];
      };
    };
  };
}

/**
 * Plugin metadata (stored in registry)
 */
export interface PluginMetadata {
  id: string; // Generated from name:version
  manifest: PluginManifest;

  // Installation info
  source: PluginSource;
  installedAt: Date;
  updatedAt?: Date;

  // Lifecycle
  state: PluginLifecycleState;

  // Permissions
  permissions: PluginPermissionDetail[];

  // Settings
  settings?: Record<string, any>;

  // Statistics
  stats: {
    timesActivated: number;
    lastActivated?: Date;
    lastError?: string;
  };

  // Storage (IndexedDB store name)
  storeName?: string;
}

/**
 * Plugin marketplace entry
 */
export interface PluginMarketplaceEntry {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  icon?: string;
  screenshots?: string[];

  // Marketplace metadata
  category: string;
  tags: string[];
  downloads: number;
  rating: number;
  reviews: number;

  // Compatibility
  minAppVersion?: string;
  maxAppVersion?: string;

  // Permissions required
  permissions: PluginPermission[];

  // Download info
  downloadUrl: string;
  fileSize: number;
  checksum?: string;

  // Links
  homepage?: string;
  repository?: string;
  readme?: string;
  license?: string;

  // Extension points provided
  extensionPoints?: ExtensionPointType[];

  // Built-in flag
  builtin?: boolean;
}

/**
 * Plugin install options
 */
export interface PluginInstallOptions {
  source: PluginSource;
  url?: string; // For marketplace downloads
  file?: File; // For local file uploads
  builtin?: boolean; // For built-in plugins

  // Auto-activate after install
  autoActivate?: boolean;
}

/**
 * Plugin load context (passed to activate())
 */
export interface PluginContext {
  pluginId: string;
  permissions: PluginPermission[];
  storage: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<void>;
    delete: (key: string) => Promise<void>;
    clear: () => Promise<void>;
  };
  api: {
    // App API surface (sandboxed)
    commands: {
      register: (command: CommandExtension['command']) => void;
      unregister: (commandId: string) => void;
    };
    ui: {
      addPanel: (panel: UIPanelExtension['panel']) => void;
      removePanel: (panelId: string) => void;
      addStatusBarItem: (item: StatusBarExtension['item']) => void;
      removeStatusBarItem: (itemId: string) => void;
    };
    notifications: {
      show: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
    };
  };
}

/**
 * Plugin main export interface
 */
export interface PluginMain {
  activate: (context: PluginContext) => void | Promise<void>;
  deactivate: () => void | Promise<void>;
  settingsComponent?: React.ComponentType; // Optional settings UI
}

/**
 * Plugin error types
 */
export class PluginError extends Error {
  constructor(
    public pluginId: string,
    message: string,
    public code?: string
  ) {
    super(`[${pluginId}] ${message}`);
    this.name = 'PluginError';
  }
}

export class PluginValidationError extends PluginError {
  constructor(pluginId: string, message: string) {
    super(pluginId, message, 'VALIDATION_ERROR');
    this.name = 'PluginValidationError';
  }
}

export class PluginPermissionError extends PluginError {
  constructor(pluginId: string, permission: PluginPermission) {
    super(pluginId, `Permission denied: ${permission}`, 'PERMISSION_ERROR');
    this.name = 'PluginPermissionError';
  }
}

export class PluginActivationError extends PluginError {
  constructor(pluginId: string, message: string) {
    super(pluginId, `Activation failed: ${message}`, 'ACTIVATION_ERROR');
    this.name = 'PluginActivationError';
  }
}

export class PluginDependencyError extends PluginError {
  constructor(pluginId: string, dependency: string) {
    super(pluginId, `Missing dependency: ${dependency}`, 'DEPENDENCY_ERROR');
    this.name = 'PluginDependencyError';
  }
}
