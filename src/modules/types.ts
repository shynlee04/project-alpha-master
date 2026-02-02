/**
 * @fileoverview Feature Module Types
 * @description Type definitions for the feature module system.
 * 
 * **NO-WORKSPACE COMPLIANT**: Uses projectId only.
 */

import type { ComponentType } from 'react';

/**
 * Available module types
 */
export type ModuleType = 'monaco' | 'notes' | 'terminal' | 'preview';

/**
 * Props passed to all module components
 */
export interface ModuleProps {
  projectId: string;
  className?: string;
}

/**
 * Feature Module Interface
 * 
 * All feature modules implement this interface for consistent loading.
 */
export interface IFeatureModule {
  /** Unique module identifier */
  id: ModuleType;
  
  /** Display name */
  name: string;
  
  /** Icon identifier (for activity bar) */
  icon: string;
  
  /** Short description */
  description: string;
  
  /** React component to render */
  component: ComponentType<ModuleProps>;
  
  /** Whether this module requires a project to function */
  requiresProject: boolean;
  
  /** Whether this module works offline */
  supportsOffline: boolean;
  
  /** Lifecycle: Called when module is mounted */
  onMount?: (projectId: string) => void | Promise<void>;
  
  /** Lifecycle: Called when module is unmounted */
  onUnmount?: () => void;
  
  /** Lifecycle: Called when project changes while module is active */
  onProjectChange?: (newProjectId: string) => void | Promise<void>;
}
