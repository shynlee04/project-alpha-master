/**
 * Workspace Domain Entities - Domain Layer
 *
 * Core business entities representing Workspace configuration and state.
 * Aligned with Clean Architecture principles - pure domain logic with no infrastructure dependencies.
 *
 * @layer Domain
 * @module core/entities
 */

/**
 * Supported workspace types
 */
export type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';

/**
 * Workspace Configuration - Domain Entity
 *
 * Represents the static configuration of a workspace.
 *
 * Business rules:
 * - Each workspace type has a unique configuration
 * - Settings allow for flexible customization
 */
export interface WorkspaceConfig {
  /** Workspace type identifier */
  type: WorkspaceType;
  /** Whether the workspace is enabled for the user/project */
  isEnabled: boolean;
  /** Display label (optional override) */
  label?: string;
  /** Custom settings */
  settings: Record<string, unknown>;
  /** Creation timestamp */
  created: Date;
  /** Last update timestamp */
  updated: Date;
}

/**
 * Workspace State - Domain Entity
 *
 * Represents the dynamic, persistent state of a workspace.
 *
 * Business rules:
 * - Captures UI state like open files and panels
 * - Used for session restoration
 */
export interface WorkspaceState {
  /** Workspace type identifier */
  type: WorkspaceType;
  /** Currently active file path or ID */
  activeFile?: string | null;
  /** List of open file paths or IDs */
  openFiles: string[];
  /** Panel configuration (e.g., { left: true, right: false }) */
  panels: Record<string, boolean>;
  /** Custom metadata */
  metadata: Record<string, unknown>;
  /** Last update timestamp */
  updated: Date;
}

// --- Create Params ---

/**
 * WorkspaceConfig creation parameters
 * Excludes auto-generated fields: created, updated
 */
export type WorkspaceConfigCreateParams = Omit<
  WorkspaceConfig,
  'created' | 'updated'
>;

/**
 * WorkspaceState creation parameters
 * Excludes auto-generated fields: updated
 */
export type WorkspaceStateCreateParams = Omit<WorkspaceState, 'updated'>;

// --- Update Params ---

/**
 * WorkspaceConfig update parameters
 * All fields optional except type (identifier)
 */
export type WorkspaceConfigUpdateParams = Partial<
  Omit<WorkspaceConfig, 'type'>
> & {
  type: WorkspaceType;
};

/**
 * WorkspaceState update parameters
 * All fields optional except type (identifier)
 */
export type WorkspaceStateUpdateParams = Partial<
  Omit<WorkspaceState, 'type'>
> & {
  type: WorkspaceType;
};
