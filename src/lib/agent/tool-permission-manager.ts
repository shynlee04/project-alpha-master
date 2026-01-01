/**
 * @fileoverview Tool Permission Manager
 * @module lib/agent/tool-permission-manager
 *
 * Manages workspace-scoped tool execution trust levels and permissions for AI agents.
 * NOW USES: Zustand store with Dexie persistence for cross-session survival.
 *
 * Trust Levels:
 * - 'auto': Execute immediately without user approval (safe operations)
 * - 'prompt': Require user approval before execution (risky operations)
 * - 'block': Never execute (dangerous operations)
 *
 * @epic WB-8.3 - Cross-Workspace Event System
 * @story WB-8.3.1 - Tool Permission Persistence
 * @story Ralph Loop 51-3 - Workspace-Scoped Tool Permissions
 * @prio P0 - Critical UX Fix
 *
 * MIGRATION-2026-01-01: Refactored to use Zustand store
 * - trustLevels now persisted via useToolPermissionStore (Dexie/IndexedDB)
 * - Session trust remains ephemeral (cleared on reload)
 * - Public API preserved for backwards compatibility
 * - All 8 integration points continue to work without changes
 *
 * MIGRATION-2026-01-03 (Ralph Loop 51-3): Workspace-scoped permissions
 * - All methods now accept workspaceType parameter
 * - Each workspace has independent tool trust levels
 * - Backward compatibility layer for legacy API (defaults to 'ide' workspace)
 * - Zero breaking changes - all existing consumers continue to work
 */

import { useToolPermissionStore } from '@/lib/state/tool-permission-store';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
// import type { EventEmitter } from 'eventemitter3'; // Reserved for future use

/**
 * Trust level for a tool - determines when user approval is required
 */
export type ToolTrustLevel = 'auto' | 'prompt' | 'block';

/**
 * Result of a permission check
 *
 * Ralph Loop 51-3: Now includes workspace context
 */
export interface PermissionCheckResult {
  /** Whether the tool needs user approval before execution */
  needsApproval: boolean;
  /** Whether the tool can execute (false if blocked) */
  canExecute: boolean;
  /** Reason for the permission decision */
  reason: 'auto' | 'prompt' | 'block' | 'session';
  /** Workspace context for this permission check */
  workspace: WorkspaceType;
  /** Tool name for display */
  toolName: string;
  /** Tool identifier */
  toolId: string;
}

/**
 * Events emitted by ToolPermissionManager
 */
export interface ToolPermissionEvents {
  'permission:changed': (toolId: string, newLevel: ToolTrustLevel) => void;
  'session:trust:added': (toolId: string) => void;
  'session:trust:removed': (toolId: string) => void;
  'session:trust:cleared': () => void;
}

/**
 * ToolPermissionManager - Facade over Zustand store for tool permissions
 *
 * Architecture:
 * - Singleton per agent configuration (preserved for backwards compatibility)
 * - Delegates to useToolPermissionStore for all state operations
 * - Event emission for UI updates (preserved for backwards compatibility)
 * - Trust levels persisted via Dexie/IndexedDB
 * - Session trust remains ephemeral (cleared on reload)
 */
export class ToolPermissionManager {
  private static instance: ToolPermissionManager | null = null;

  /** Event emitter for permission changes (preserved for backwards compatibility) */
  private eventBus: any | null = null;

  /**
   * Get singleton instance
   */
  public static getInstance(): ToolPermissionManager {
    if (!ToolPermissionManager.instance) {
      ToolPermissionManager.instance = new ToolPermissionManager();
    }
    return ToolPermissionManager.instance;
  }

  /**
   * Create a new instance (for testing or custom configurations)
   *
   * Ralph Loop 51-3: Workspace-scoped initial permissions
   *
   * NOTE: Custom initial permissions will override store defaults
   */
  public static createInstance(
    initialPermissions?: Record<string, ToolTrustLevel> | Record<string, Record<WorkspaceType, ToolTrustLevel>>
  ): ToolPermissionManager {
    const instance = new ToolPermissionManager();

    // Apply custom permissions to store if provided
    if (initialPermissions) {
      const store = useToolPermissionStore.getState();

      // Check if flat (legacy) or nested (workspace-scoped) format
      const firstToolId = Object.keys(initialPermissions)[0];
      const isWorkspaceScoped = firstToolId && typeof initialPermissions[firstToolId] === 'object';

      if (isWorkspaceScoped) {
        // Workspace-scoped format: Record<string, Record<WorkspaceType, ToolTrustLevel>>
        Object.entries(initialPermissions).forEach(([toolId, workspaceLevels]) => {
          Object.entries(workspaceLevels as Record<WorkspaceType, ToolTrustLevel>).forEach(([workspace, level]) => {
            store.setTrustLevel(toolId, workspace as WorkspaceType, level);
          });
        });
      } else {
        // Legacy flat format: Record<string, ToolTrustLevel> - apply to all workspaces
        Object.entries(initialPermissions).forEach(([toolId, level]) => {
          for (const workspace of ['ide', 'knowledge', 'notes', 'study'] as WorkspaceType[]) {
            store.setTrustLevel(toolId, workspace, level);
          }
        });
      }
    }

    return instance;
  }

  /**
   * Private constructor - use getInstance()
   *
   * NOTE: No initialization needed - Zustand store handles defaults
   */
  private constructor() {
    // Store auto-initializes with defaults
  }

  /**
   * Set event bus for emitting permission change events
   */
  public setEventBus(eventBus: any): void {
    this.eventBus = eventBus;
  }

  /**
   * Get the trust level for a tool in a workspace
   *
   * Ralph Loop 51-3: Workspace-aware trust level lookup
   *
   * @param toolId - Tool to check
   * @param workspaceType - Workspace context
   * @returns Trust level for the tool in this workspace
   */
  public getTrustLevel(toolId: string, workspaceType: WorkspaceType): ToolTrustLevel {
    return useToolPermissionStore.getState().getTrustLevel(toolId, workspaceType);
  }

  /**
   * Set the trust level for a tool in a workspace (persisted)
   *
   * Ralph Loop 51-3: Workspace-scoped trust level setting
   *
   * @param toolId - Tool to configure
   * @param workspaceType - Workspace context
   * @param level - Trust level to set
   */
  public setTrustLevel(toolId: string, workspaceType: WorkspaceType, level: ToolTrustLevel): void {
    const previousLevel = this.getTrustLevel(toolId, workspaceType);

    // Update store (persisted automatically)
    useToolPermissionStore.getState().setTrustLevel(toolId, workspaceType, level);

    // Emit event if level changed (for backwards compatibility)
    if (previousLevel !== level) {
      this.eventBus?.emit('permission:changed', toolId, level);
    }
  }

  /**
   * Set the trust level for a tool (legacy API - defaults to 'ide' workspace)
   *
   * @deprecated Use setTrustLevel(toolId, workspaceType, level) instead
   * Preserved for backwards compatibility - defaults to 'ide' workspace
   *
   * @param toolId - Tool to configure
   * @param level - Trust level to set
   */
  public setTrustLevelLegacy(toolId: string, level: ToolTrustLevel): void {
    this.setTrustLevel(toolId, 'ide', level);
  }

  /**
   * Check if a tool has session-based trust in a workspace
   *
   * Ralph Loop 51-3: Workspace-scoped session trust check
   */
  public hasSessionTrust(toolId: string, workspaceType: WorkspaceType): boolean {
    const state = useToolPermissionStore.getState();
    const sessionKey = `${toolId}:${workspaceType}`;
    return state.sessionTrust.includes(sessionKey);
  }

  /**
   * Add session-based trust for a tool in a workspace (ephemeral)
   *
   * Ralph Loop 51-3: Workspace-scoped session trust
   */
  public addSessionTrust(toolId: string, workspaceType: WorkspaceType): void {
    const store = useToolPermissionStore.getState();
    const sessionKey = `${toolId}:${workspaceType}`;

    // Check if already has session trust (avoid duplicate event)
    if (!store.sessionTrust.includes(sessionKey)) {
      store.addSessionTrust(toolId, workspaceType);
      this.eventBus?.emit('session:trust:added', toolId);
    }
  }

  /**
   * Add session-based trust for a tool (legacy API - defaults to 'ide' workspace)
   *
   * @deprecated Use addSessionTrust(toolId, workspaceType) instead
   * Preserved for backwards compatibility - defaults to 'ide' workspace
   */
  public addSessionTrustLegacy(toolId: string): void {
    this.addSessionTrust(toolId, 'ide');
  }

  /**
   * Remove session-based trust for a tool in a workspace
   *
   * Ralph Loop 51-3: Workspace-scoped session trust removal
   */
  public removeSessionTrust(toolId: string, workspaceType: WorkspaceType): void {
    const store = useToolPermissionStore.getState();
    const sessionKey = `${toolId}:${workspaceType}`;

    // Check if has session trust (avoid unnecessary event)
    if (store.sessionTrust.includes(sessionKey)) {
      store.removeSessionTrust(toolId, workspaceType);
      this.eventBus?.emit('session:trust:removed', toolId);
    }
  }

  /**
   * Remove session-based trust for a tool (legacy API - defaults to 'ide' workspace)
   *
   * @deprecated Use removeSessionTrust(toolId, workspaceType) instead
   * Preserved for backwards compatibility - defaults to 'ide' workspace
   */
  public removeSessionTrustLegacy(toolId: string): void {
    this.removeSessionTrust(toolId, 'ide');
  }

  /**
   * Clear all session-based trust (ephemeral)
   */
  public clearSessionTrust(): void {
    useToolPermissionStore.getState().clearSessionTrust();
    this.eventBus?.emit('session:trust:cleared');
  }

  /**
   * Check permission for a tool execution in a workspace
   *
   * Ralph Loop 51-3: Workspace-aware permission check
   * - Checks trust level for specific workspace
   * - Returns workspace context in result
   * - Session trust checked in workspace-scoped format
   *
   * @param toolId - Tool to check
   * @param workspaceType - Workspace context
   * @returns Permission check result with workspace context
   */
  public checkPermission(toolId: string, workspaceType: WorkspaceType): PermissionCheckResult {
    const state = useToolPermissionStore.getState();
    const trustLevel = state.trustLevels[toolId]?.[workspaceType] ?? state.defaultTrustLevel;
    const sessionKey = `${toolId}:${workspaceType}`;
    const hasSession = state.sessionTrust.includes(sessionKey);

    // Check block first (highest priority)
    if (trustLevel === 'block') {
      return {
        needsApproval: false,
        canExecute: false,
        reason: 'block',
        workspace: workspaceType,
        toolName: this.getToolDisplayName(toolId),
        toolId,
      };
    }

    // Check session trust (overrides configured level)
    if (hasSession) {
      return {
        needsApproval: false,
        canExecute: true,
        reason: 'session',
        workspace: workspaceType,
        toolName: this.getToolDisplayName(toolId),
        toolId,
      };
    }

    // Auto mode - execute without approval
    if (trustLevel === 'auto') {
      return {
        needsApproval: false,
        canExecute: true,
        reason: 'auto',
        workspace: workspaceType,
        toolName: this.getToolDisplayName(toolId),
        toolId,
      };
    }

    // Prompt mode - needs approval
    return {
      needsApproval: true,
      canExecute: true,
      reason: 'prompt',
      workspace: workspaceType,
      toolName: this.getToolDisplayName(toolId),
      toolId,
    };
  }

  /**
   * Check permission for a tool execution (legacy API - defaults to 'ide' workspace)
   *
   * @deprecated Use checkPermission(toolId, workspaceType) instead
   * Preserved for backwards compatibility - defaults to 'ide' workspace
   *
   * @param toolId - Tool to check
   * @returns Permission check result (workspace defaults to 'ide')
   */
  public checkPermissionLegacy(toolId: string): Omit<PermissionCheckResult, 'workspace'> {
    const result = this.checkPermission(toolId, 'ide');
    // Exclude workspace field for legacy API
    const { workspace, ...legacyResult } = result;
    return legacyResult;
  }

  /**
   * Get all trust levels for a workspace (for persistence/UI)
   *
   * Ralph Loop 51-3: Workspace-scoped trust levels
   *
   * @param workspaceType - Workspace to get levels for
   * @returns Record of toolId -> trustLevel for the workspace
   */
  public getAllTrustLevels(workspaceType: WorkspaceType): Record<string, ToolTrustLevel> {
    const state = useToolPermissionStore.getState();
    const workspaceLevels: Record<string, ToolTrustLevel> = {};

    for (const [toolId, workspaceMap] of Object.entries(state.trustLevels)) {
      workspaceLevels[toolId] = workspaceMap[workspaceType] ?? state.defaultTrustLevel;
    }

    return workspaceLevels;
  }

  /**
   * Get all trust levels (legacy API - returns 'ide' workspace only)
   *
   * @deprecated Use getAllTrustLevels(workspaceType) instead
   * Preserved for backwards compatibility - returns 'ide' workspace levels
   *
   * @returns Record of toolId -> trustLevel for 'ide' workspace
   */
  public getAllTrustLevelsLegacy(): Record<string, ToolTrustLevel> {
    return this.getAllTrustLevels('ide');
  }

  /**
   * Get default trust levels for a workspace
   *
   * Ralph Loop 51-3: Workspace-scoped defaults
   *
   * @param workspaceType - Workspace to get defaults for
   * @returns Record of toolId -> trustLevel for the workspace
   */
  public getDefaultTrustLevels(workspaceType: WorkspaceType): Record<string, ToolTrustLevel> {
    return this.getAllTrustLevels(workspaceType);
  }

  /**
   * Get default trust levels (legacy API - returns 'ide' workspace only)
   *
   * @deprecated Use getDefaultTrustLevels(workspaceType) instead
   * Preserved for backwards compatibility - returns 'ide' workspace levels
   *
   * @returns Record of toolId -> trustLevel for 'ide' workspace
   */
  public getDefaultTrustLevelsLegacy(): Record<string, ToolTrustLevel> {
    return this.getDefaultTrustLevels('ide');
  }

  /**
   * Reset all trust levels to defaults
   *
   * NOTE: Delegates to store method
   */
  public resetToDefaults(): void {
    useToolPermissionStore.getState().resetToDefaults();
  }

  /**
   * Serialize permissions for persistence
   *
   * @deprecated Store now auto-persists via Dexie. This method kept for backwards compatibility.
   */
  public toJSON(): string {
    const state = useToolPermissionStore.getState();
    return JSON.stringify({ permissions: state.trustLevels });
  }

  /**
   * Deserialize permissions from persistence
   *
   * @deprecated Store now auto-persists via Dexie. This method kept for backwards compatibility.
   *
   * NOTE: This will override current store state with provided JSON
   */
  public static fromJSON(json: string): ToolPermissionManager {
    const data = JSON.parse(json);

    if (data.permissions) {
      Object.entries(data.permissions).forEach(([toolId, level]) => {
        useToolPermissionStore.getState().setTrustLevel(toolId, level as ToolTrustLevel);
      });
    }

    return ToolPermissionManager.getInstance();
  }

  /**
   * Get tool display name from ID
   */
  private getToolDisplayName(toolId: string): string {
    const displayNames: Record<string, string> = {
      read_file: 'Read File',
      list_files: 'List Files',
      read_directory: 'Read Directory',
      write_file: 'Write File',
      create_directory: 'Create Directory',
      delete_file: 'Delete File',
      execute_command: 'Execute Command',
    };
    return displayNames[toolId] ?? toolId.replace(/_/g, ' ');
  }

  /**
   * Get all tool IDs
   *
   * NOTE: Now reads from Zustand store
   */
  public getToolIds(): string[] {
    return Object.keys(useToolPermissionStore.getState().trustLevels);
  }

  /**
   * Get tools by trust level in a workspace
   *
   * Ralph Loop 51-3: Workspace-scoped tool filtering
   *
   * @param workspaceType - Workspace to filter by
   * @param level - Trust level to filter by
   * @returns Array of tool IDs with the specified trust level in this workspace
   */
  public getToolsByLevel(workspaceType: WorkspaceType, level: ToolTrustLevel): string[] {
    const state = useToolPermissionStore.getState();
    const tools: string[] = [];

    for (const [toolId, workspaceMap] of Object.entries(state.trustLevels)) {
      if (workspaceMap[workspaceType] === level) {
        tools.push(toolId);
      }
    }

    return tools;
  }

  /**
   * Get tools by trust level (legacy API - returns 'ide' workspace only)
   *
   * @deprecated Use getToolsByLevel(workspaceType, level) instead
   * Preserved for backwards compatibility - returns 'ide' workspace tools
   *
   * @param level - Trust level to filter by
   * @returns Array of tool IDs with the specified trust level in 'ide' workspace
   */
  public getToolsByLevelLegacy(level: ToolTrustLevel): string[] {
    return this.getToolsByLevel('ide', level);
  }

  /**
   * Check if any tools require approval in a workspace (for UI indicator)
   *
   * Ralph Loop 51-3: Workspace-scoped approval check
   *
   * @param workspaceType - Workspace to check
   * @returns True if any tools in this workspace require approval
   */
  public hasPromptTools(workspaceType: WorkspaceType): boolean {
    return this.getToolsByLevel(workspaceType, 'prompt').length > 0;
  }

  /**
   * Check if any tools are blocked in a workspace (for UI indicator)
   *
   * Ralph Loop 51-3: Workspace-scoped block check
   *
   * @param workspaceType - Workspace to check
   * @returns True if any tools in this workspace are blocked
   */
  public hasBlockedTools(workspaceType: WorkspaceType): boolean {
    return this.getToolsByLevel(workspaceType, 'block').length > 0;
  }
}
