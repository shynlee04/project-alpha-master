/**
 * @fileoverview Feature Plugin Interface - Core abstraction for all feature plugins
 * @module domain/interfaces/feature-plugin
 *
 * **ARCH-02-01**: Define FeaturePlugin Interface
 *
 * Per ADR-034 Decision D3:
 * Each feature becomes a self-contained plugin with:
 * - Identity (id, name, icon, description)
 * - Requirements (storageType, deviceType, minWidth, maxInstances)
 * - Rendering (component, sidebarComponent, toolbarComponent)
 * - Lifecycle (onMount, onUnmount, onProjectChange)
 *
 * This interface defines the contract between plugins and the plugin registry.
 * All feature plugins (FileTree, Monaco, Notes, Terminal, Chat, Agents)
 * MUST implement this interface to be loaded by the plugin system.
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-01
 * @team Team A
 * @created 2026-01-21
 */

// ============================================================================
// Imports
// ============================================================================

import type React from 'react';
import type { PluginId } from '@/domain/types/plugin-types';
import type { ProjectContext } from '@/infrastructure/context/project-context';

// ============================================================================
// Plugin Context Types
// ============================================================================

/**
 * Project Context
 *
 * @remarks
 * Re-exported from @/infrastructure/context/project-context
 * Defined in ARCH-02-03 (Create ProjectContext Provider).
 */
export type { ProjectContext };

// ============================================================================
// Plugin Props Interfaces
// ============================================================================

/**
 * Props for main plugin component
 *
 * @remarks
 * Passed to plugin's main rendering component when loaded in a panel.
 *
 * Note: Plugins can use useProjectContext() hook to access context,
 * so projectContext and panelId are optional.
 */
export interface PluginMainProps {
  /** Project context with storage, platform, and services (optional) */
  projectContext?: ProjectContext;

  /** Unique identifier for this panel instance (optional) */
  panelId?: string;

  /** Panel width in pixels (optional - parent container handles sizing) */
  width?: number;

  /** Panel height in pixels (optional - parent container handles sizing) */
  height?: number;
}

/**
 * Props for sidebar plugin component
 *
 * @remarks
 * Passed to plugin's sidebar component if provided.
 * Used for collapsible sidebar panels (e.g., FileTree).
 */
export interface PluginSidebarProps {
  /** Project context with storage, platform, and services */
  projectContext: ProjectContext;

  /** Whether sidebar is collapsed */
  collapsed: boolean;

  /** Toggle collapse state */
  onToggle: () => void;
}

/**
 * Props for toolbar plugin component
 *
 * @remarks
 * Passed to plugin's toolbar component if provided.
 * Used for plugin-specific toolbar actions.
 */
export interface PluginToolbarProps {
  /** Project context with storage, platform, and services */
  projectContext: ProjectContext;

  /** Handle toolbar action events */
  onAction: (action: string) => void;
}

// ============================================================================
// Feature Plugin Interface
// ============================================================================

/**
 * Plugin Requirements
 *
 * @remarks
 * Defines constraints for plugin loading and rendering.
 * Used by plugin registry to filter plugins based on platform capabilities.
 */
export interface PluginRequirements {
  /** Storage type requirement: 'fsa', 'indexeddb', or 'any' */
  storageType: 'fsa' | 'indexeddb' | 'any';

  /** Device type requirement: 'desktop', 'mobile', or 'any' */
  deviceType: 'desktop' | 'mobile' | 'any';

  /** Minimum panel width in pixels */
  minWidth: number;

  /** Maximum instances allowed: 1, 2, or unlimited */
  maxInstances: 1 | 2 | 'unlimited';
}

/**
 * Feature Plugin Interface
 *
 * @remarks
 * Core abstraction for all feature plugins in the application.
 * Each feature (FileTree, Monaco, Notes, Terminal, Chat, Agents)
 * MUST implement this interface to be registered and loaded.
 *
 * Plugins define:
 * - Identity: id, name, icon, description
 * - Requirements: storage/device constraints
 * - Rendering: components for main, sidebar, toolbar slots
 * - Lifecycle: mount, unmount, project change hooks
 *
 * @example
 * ```ts
 * const fileTreePlugin: FeaturePlugin = {
 *   id: 'filetree',
 *   name: 'File Tree',
 *   icon: <FileTreeIcon />,
 *   description: 'Browse and manage project files',
 *
 *   requirements: {
 *     storageType: 'any',
 *     deviceType: 'any',
 *     minWidth: 200,
 *     maxInstances: 1,
 *   },
 *
 *   MainComponent: FileTreeComponent,
 *   SidebarComponent: FileTreeSidebar,
 *
 *   onMount: async (context) => {
 *     // Initialize file tree on mount
 *   },
 *
 *   onUnmount: async () => {
 *     // Cleanup on unmount
 *   },
 *
 *   onProjectChange: async (newProjectId) => {
 *     // Handle project switch
 *   },
 * };
 * ```
 */
export interface FeaturePlugin {
  // ========================================================================
  // Identity
  // ========================================================================

  /** Unique plugin identifier (must be a valid PluginId) */
  id: PluginId;

  /** Display name for UI */
  name: string;

  /** Icon component for UI (ReactNode) */
  icon: React.ReactNode;

  /** Brief description of plugin functionality */
  description: string;

  // ========================================================================
  // Requirements
  // ========================================================================

  /** Platform and layout constraints for plugin loading */
  requirements: PluginRequirements;

  // ========================================================================
  // Rendering Components
  // ========================================================================

  /** Main plugin component (required) */
  MainComponent: React.FC<PluginMainProps>;

  /** Optional sidebar component (for collapsible panels) */
  SidebarComponent?: React.FC<PluginSidebarProps>;

  /** Optional toolbar component (for plugin actions) */
  ToolbarComponent?: React.FC<PluginToolbarProps>;

  // ========================================================================
  // Lifecycle Hooks
  // ========================================================================

  /** Called when plugin is mounted in layout */
  onMount?: (context: ProjectContext) => Promise<void>;

  /** Called when plugin is unmounted from layout */
  onUnmount?: () => Promise<void>;

  /** Called when active project changes */
  onProjectChange?: (newProjectId: string) => Promise<void>;

  // ========================================================================
  // Capability Declarations (EPIC-0.6-04)
  // ========================================================================

  /**
   * Plugin capabilities (optional - for advanced plugin coordination)
   *
   * @remarks
   * Declares what this plugin can do (edit files, run processes, etc.)
   * Used for intelligent plugin suggestions and dependency resolution.
   * See plugin-capability.interface.ts for full type definitions.
   */
  capabilities?: import('./plugin-capability.interface').PluginCapability[];

  /**
   * Plugin dependencies (optional)
   *
   * @remarks
   * Other plugins this plugin depends on.
   * Used for dependency resolution and loading order.
   */
  dependsOn?: PluginId[];
}

// ============================================================================
// Plugin Registry Entry (Forward Reference)
// ============================================================================

/**
 * Plugin Registry Entry
 *
 * @remarks
 * Forward reference - will be fully defined in ARCH-02-02 (Create Plugin Registry).
 * Represents a plugin instance loaded in the registry.
 */
export interface PluginRegistryEntry {
  /** The plugin definition */
  plugin: FeaturePlugin;

  /** Current instances of this plugin */
  instances: string[];

  /** Last mount timestamp */
  lastMountedAt?: number;
}

// ============================================================================
// No additional exports - types already exported above
// ============================================================================
