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
 * @story ARCH-01.4 - Agent Tool Permission Matrix (YOLO mode, category approvals)
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
 *
 * MIGRATION-2026-01-05 (ARCH-01.4): YOLO mode and category approvals
 * - YOLO mode: Global bypass for all tool permissions with auto-expiry
 * - Category approvals: Workspace-scoped bulk tool permissions by category
 * - Updated checkPermission to check YOLO → category → tool level → session
 * - New methods: toggleYOLO, isYOLOActive, setCategoryApproval, isCategoryApproved
 */

import { useToolPermissionStore, getToolCategory, type ToolCategory, type YOLOMode } from '@/infrastructure/persistence/stores/permissions/tool-permission-store';
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
 * ARCH-01.4: Added 'yolo' and 'category' reason types
 */
export interface PermissionCheckResult {
  /** Whether the tool needs user approval before execution */
  needsApproval: boolean;
  /** Whether the tool can execute (false if blocked) */
  canExecute: boolean;
  /** Reason for the permission decision */
  reason: 'auto' | 'prompt' | 'block' | 'session' | 'yolo' | 'category';
  /** Workspace context for this permission check */
  workspace: WorkspaceType;
  /** Tool name for display */
  toolName: string;
  /** Tool identifier */
  toolId: string;
  /** Tool category (ARCH-01.4) */
  category?: ToolCategory;
}

/**
 * Events emitted by ToolPermissionManager
 *
 * ARCH-01.4: Added YOLO mode and category approval events
 */
export interface ToolPermissionEvents {
  'permission:changed': (toolId: string, newLevel: ToolTrustLevel) => void;
  'session:trust:added': (toolId: string) => void;
  'session:trust:removed': (toolId: string) => void;
  'session:trust:cleared': () => void;
  'yolo:mode:toggled': (enabled: boolean, expiryTime: number | null) => void;
  'yolo:mode:expired': () => void;
  'category:approval:changed': (category: ToolCategory, workspace: WorkspaceType, approved: boolean) => void;
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
   * @param workspaceType - Workspace context (defaults to 'ide' for backward compatibility)
   * @returns Trust level for the tool in this workspace
   */
  public getTrustLevel(toolId: string, workspaceType?: WorkspaceType): ToolTrustLevel {
    // Ralph Loop 51-3: Default to 'ide' workspace for backward compatibility
    const workspace = workspaceType ?? 'ide';
    return useToolPermissionStore.getState().getTrustLevel(toolId, workspace);
  }

  /**
   * Set the trust level for a tool in a workspace (persisted)
   *
   * Ralph Loop 51-3: Workspace-scoped trust level setting
   *
   * @param toolId - Tool to configure
   * @param workspaceOrLevel - Workspace context (if 3 params) or trust level (if 2 params for legacy)
   * @param level - Trust level to set (required if workspace provided)
   */
  public setTrustLevel(toolId: string, workspaceOrLevel: WorkspaceType | ToolTrustLevel, level?: ToolTrustLevel): void {
    // Ralph Loop 51-3: Handle both legacy and new API signatures
    // Legacy: setTrustLevel(toolId, level) - 2 parameters
    // New: setTrustLevel(toolId, workspaceType, level) - 3 parameters
    let workspace: WorkspaceType;
    let trustLevel: ToolTrustLevel;

    if (level === undefined) {
      // Legacy API: setTrustLevel(toolId, level)
      // Default to 'ide' workspace for backward compatibility
      workspace = 'ide';
      trustLevel = workspaceOrLevel as ToolTrustLevel;
    } else {
      // New API: setTrustLevel(toolId, workspaceType, level)
      workspace = workspaceOrLevel as WorkspaceType;
      trustLevel = level;
    }

    const previousLevel = this.getTrustLevel(toolId, workspace);

    // Update store (persisted automatically)
    useToolPermissionStore.getState().setTrustLevel(toolId, workspace, trustLevel);

    // Emit event if level changed (for backwards compatibility)
    if (previousLevel !== trustLevel) {
      this.eventBus?.emit('permission:changed', toolId, trustLevel);
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
   *
   * @param toolId - Tool to check
   * @param workspaceType - Workspace context (defaults to 'ide' for backward compatibility)
   * @returns True if tool has session trust in this workspace
   */
  public hasSessionTrust(toolId: string, workspaceType?: WorkspaceType): boolean {
    const workspace = workspaceType ?? 'ide';
    const state = useToolPermissionStore.getState();
    const sessionKey = `${toolId}:${workspace}`;
    return state.sessionTrust.includes(sessionKey);
  }

  /**
   * Add session-based trust for a tool in a workspace (ephemeral)
   *
   * Ralph Loop 51-3: Workspace-scoped session trust
   *
   * @param toolId - Tool to trust
   * @param workspaceType - Workspace context (defaults to 'ide' for backward compatibility)
   */
  public addSessionTrust(toolId: string, workspaceType?: WorkspaceType): void {
    const workspace = workspaceType ?? 'ide';
    const store = useToolPermissionStore.getState();
    const sessionKey = `${toolId}:${workspace}`;

    // Check if already has session trust (avoid duplicate event)
    if (!store.sessionTrust.includes(sessionKey)) {
      store.addSessionTrust(toolId, workspace);
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
   *
   * @param toolId - Tool to remove trust from
   * @param workspaceType - Workspace context (defaults to 'ide' for backward compatibility)
   */
  public removeSessionTrust(toolId: string, workspaceType?: WorkspaceType): void {
    const workspace = workspaceType ?? 'ide';
    const store = useToolPermissionStore.getState();
    const sessionKey = `${toolId}:${workspace}`;

    // Check if has session trust (avoid unnecessary event)
    if (store.sessionTrust.includes(sessionKey)) {
      store.removeSessionTrust(toolId, workspace);
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
   * - Defaults to 'ide' workspace for backward compatibility
   *
   * ARCH-01.4: Updated priority check order
   * - YOLO mode (global bypass) → Category approval → Tool level → Session trust
   * - YOLO mode bypasses ALL permission checks
   * - Category approval bypasses tool-level checks
   *
   * @param toolId - Tool to check
   * @param workspaceType - Workspace context (defaults to 'ide' for backward compatibility)
   * @returns Permission check result with workspace context
   */
  public checkPermission(toolId: string, workspaceType?: WorkspaceType): PermissionCheckResult {
    // Ralph Loop 51-3: Default to 'ide' workspace for backward compatibility
    const workspace = workspaceType ?? 'ide';
    const state = useToolPermissionStore.getState();
    const trustLevel = state.trustLevels[toolId]?.[workspace] ?? state.defaultTrustLevel;
    const sessionKey = `${toolId}:${workspace}`;
    const hasSession = state.sessionTrust.includes(sessionKey);
    const category = getToolCategory(toolId);

    // ARCH-01.4: Check YOLO mode first (highest priority - global bypass)
    if (state.isYOLOActive()) {
      return {
        needsApproval: false,
        canExecute: true,
        reason: 'yolo',
        workspace: workspace,
        toolName: this.getToolDisplayName(toolId),
        toolId,
        category,
      };
    }

    // ARCH-01.4: Check category approval (workspace-scoped bulk approval)
    if (state.isCategoryApproved(toolId, workspace)) {
      return {
        needsApproval: false,
        canExecute: true,
        reason: 'category',
        workspace: workspace,
        toolName: this.getToolDisplayName(toolId),
        toolId,
        category,
      };
    }

    // Check block first (highest priority for tool-level)
    if (trustLevel === 'block') {
      return {
        needsApproval: false,
        canExecute: false,
        reason: 'block',
        workspace: workspace,
        toolName: this.getToolDisplayName(toolId),
        toolId,
        category,
      };
    }

    // Check session trust (overrides configured level)
    if (hasSession) {
      return {
        needsApproval: false,
        canExecute: true,
        reason: 'session',
        workspace: workspace,
        toolName: this.getToolDisplayName(toolId),
        toolId,
        category,
      };
    }

    // Auto mode - execute without approval
    if (trustLevel === 'auto') {
      return {
        needsApproval: false,
        canExecute: true,
        reason: 'auto',
        workspace: workspace,
        toolName: this.getToolDisplayName(toolId),
        toolId,
        category,
      };
    }

    // Prompt mode - needs approval
    return {
      needsApproval: true,
      canExecute: true,
      reason: 'prompt',
      workspace: workspace,
      toolName: this.getToolDisplayName(toolId),
      toolId,
      category,
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
   * @param workspaceType - Workspace to get levels for (defaults to 'ide' for backward compatibility)
   * @returns Record of toolId -> trustLevel for the workspace
   */
  public getAllTrustLevels(workspaceType?: WorkspaceType): Record<string, ToolTrustLevel> {
    const workspace = workspaceType ?? 'ide';
    const state = useToolPermissionStore.getState();
    const workspaceLevels: Record<string, ToolTrustLevel> = {};

    for (const [toolId, workspaceMap] of Object.entries(state.trustLevels)) {
      workspaceLevels[toolId] = workspaceMap[workspace] ?? state.defaultTrustLevel;
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
   * @param workspaceType - Workspace to get defaults for (defaults to 'ide' for backward compatibility)
   * @returns Record of toolId -> trustLevel for the workspace
   */
  public getDefaultTrustLevels(workspaceType?: WorkspaceType): Record<string, ToolTrustLevel> {
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
   * Ralph Loop 51-3: Legacy flat format applied to 'ide' workspace for backward compatibility
   */
  public static fromJSON(json: string): ToolPermissionManager {
    const data = JSON.parse(json);

    if (data.permissions) {
      // Ralph Loop 51-3: Legacy flat format - apply to 'ide' workspace only
      Object.entries(data.permissions).forEach(([toolId, level]) => {
        useToolPermissionStore.getState().setTrustLevel(toolId, 'ide', level as ToolTrustLevel);
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
   * @param workspaceType - Workspace to filter by (defaults to 'ide' for backward compatibility)
   * @param level - Trust level to filter by
   * @returns Array of tool IDs with the specified trust level in this workspace
   */
  public getToolsByLevel(workspaceType: WorkspaceType | ToolTrustLevel, level?: ToolTrustLevel): string[] {
    // Ralph Loop 51-3: Handle both legacy and new API signatures
    // Legacy: getToolsByLevel(level) - 1 parameter
    // New: getToolsByLevel(workspaceType, level) - 2 parameters
    let workspace: WorkspaceType;
    let trustLevel: ToolTrustLevel;

    if (level === undefined) {
      // Legacy API: getToolsByLevel(level)
      // Default to 'ide' workspace for backward compatibility
      workspace = 'ide';
      trustLevel = workspaceType as ToolTrustLevel;
    } else {
      // New API: getToolsByLevel(workspaceType, level)
      workspace = workspaceType as WorkspaceType;
      trustLevel = level;
    }

    const state = useToolPermissionStore.getState();
    const tools: string[] = [];

    for (const [toolId, workspaceMap] of Object.entries(state.trustLevels)) {
      if (workspaceMap[workspace] === trustLevel) {
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
   * @param workspaceType - Workspace to check (defaults to 'ide' for backward compatibility)
   * @returns True if any tools in this workspace require approval
   */
  public hasPromptTools(workspaceType?: WorkspaceType): boolean {
    const workspace = workspaceType ?? 'ide';
    return this.getToolsByLevel(workspace, 'prompt').length > 0;
  }

  /**
   * Check if any tools are blocked in a workspace (for UI indicator)
   *
   * Ralph Loop 51-3: Workspace-scoped block check
   *
   * @param workspaceType - Workspace to check (defaults to 'ide' for backward compatibility)
   * @returns True if any tools in this workspace are blocked
   */
  public hasBlockedTools(workspaceType?: WorkspaceType): boolean {
    const workspace = workspaceType ?? 'ide';
    return this.getToolsByLevel(workspace, 'block').length > 0;
  }

  // ============================================================
  // YOLO Mode Methods (ARCH-01.4)
  // ============================================================

  /**
   * Check if YOLO mode is currently active
   *
   * ARCH-01.4: YOLO mode bypasses all permission checks
   * Auto-disables after expiry time
   *
   * @returns True if YOLO mode is enabled and not expired
   */
  public isYOLOActive(): boolean {
    return useToolPermissionStore.getState().isYOLOActive();
  }

  /**
   * Get YOLO mode state
   *
   * @returns Current YOLO mode state
   */
  public getYOLOMode(): YOLOMode {
    return useToolPermissionStore.getState().yoloMode;
  }

  /**
   * Toggle YOLO mode on/off
   *
   * ARCH-01.4: YOLO mode bypasses all permission checks
   * Auto-disables after expiry time (default: 24 hours)
   *
   * @param durationHours - Duration in hours (default: 24)
   * @returns New YOLO mode state
   */
  public toggleYOLO(durationHours?: number): YOLOMode {
    const store = useToolPermissionStore.getState();
    store.toggleYOLO(durationHours);

    // Emit event
    const newState = store.yoloMode;
    this.eventBus?.emit('yolo:mode:toggled', newState.enabled, newState.expiryTime);

    return newState;
  }

  /**
   * Enable YOLO mode for a specific duration
   *
   * @param durationHours - Duration in hours (default: 24)
   * @returns New YOLO mode state
   */
  public enableYOLO(durationHours: number = 24): YOLOMode {
    const store = useToolPermissionStore.getState();

    if (!store.yoloMode.enabled) {
      store.toggleYOLO(durationHours);
      const newState = store.yoloMode;
      this.eventBus?.emit('yolo:mode:toggled', true, newState.expiryTime);
      return newState;
    }

    // Already enabled, just update expiry
    const now = Date.now();
    const expiryTime = now + durationHours * 60 * 60 * 1000;
    store.setYOLOExpiry(expiryTime);
    this.eventBus?.emit('yolo:mode:toggled', true, expiryTime);
    return store.yoloMode;
  }

  /**
   * Disable YOLO mode
   */
  public disableYOLO(): void {
    const store = useToolPermissionStore.getState();
    if (store.yoloMode.enabled) {
      store.toggleYOLO(); // Toggle off
      this.eventBus?.emit('yolo:mode:toggled', false, null);
    }
  }

  /**
   * Check YOLO mode expiry and disable if expired
   *
   * Called automatically on store rehydration
   */
  public checkYOLOExpiry(): void {
    const store = useToolPermissionStore.getState();
    const wasActive = store.yoloMode.enabled;

    store.checkYOLOExpiry();

    // Emit event if YOLO mode expired
    if (wasActive && !store.yoloMode.enabled) {
      this.eventBus?.emit('yolo:mode:expired');
    }
  }

  /**
   * Set YOLO mode expiry time
   *
   * Primarily for testing purposes - allows setting expiry to past to test expiration
   *
   * @param expiryTime - Timestamp when YOLO mode should expire
   */
  public setYOLOExpiry(expiryTime: number): void {
    useToolPermissionStore.getState().setYOLOExpiry(expiryTime);
  }

  // ============================================================
  // Category Approval Methods (ARCH-01.4)
  // ============================================================

  /**
   * Get approval status for a category in a workspace
   *
   * ARCH-01.4: Category approvals allow bulk tool permissions
   *
   * @param category - Tool category to check
   * @param workspaceType - Workspace context (defaults to 'ide')
   * @returns True if category is approved in this workspace
   */
  public getCategoryApproval(category: ToolCategory, workspaceType?: WorkspaceType): boolean {
    const workspace = workspaceType ?? 'ide';
    return useToolPermissionStore.getState().getCategoryApproval(category, workspace);
  }

  /**
   * Set approval status for a category in a workspace
   *
   * ARCH-01.4: Category approvals allow bulk tool permissions
   * When approved, all tools in that category bypass permission checks
   *
   * @param category - Tool category to approve/disapprove
   * @param workspaceType - Workspace context (defaults to 'ide')
   * @param approved - Whether the category is approved
   */
  public setCategoryApproval(category: ToolCategory, workspaceType: WorkspaceType, approved: boolean): void {
    const store = useToolPermissionStore.getState();
    const previousValue = store.getCategoryApproval(category, workspaceType);

    if (previousValue !== approved) {
      store.setCategoryApproval(category, workspaceType, approved);
      this.eventBus?.emit('category:approval:changed', category, workspaceType, approved);
    }
  }

  /**
   * Check if a tool's category is approved in a workspace
   *
   * Combines tool-to-category mapping with category approval state
   *
   * @param toolId - Tool to check
   * @param workspaceType - Workspace context (defaults to 'ide')
   * @returns True if tool's category is approved in this workspace
   */
  public isCategoryApproved(toolId: string, workspaceType?: WorkspaceType): boolean {
    const workspace = workspaceType ?? 'ide';
    return useToolPermissionStore.getState().isCategoryApproved(toolId, workspace);
  }

  /**
   * Set approval status for a category (defaults to 'ide' workspace)
   *
   * @param category - Tool category to approve/disapprove
   * @param approved - Whether the category is approved
   */
  public setCategoryApprovalIde(category: ToolCategory, approved: boolean): void {
    this.setCategoryApproval(category, 'ide', approved);
  }

  /**
   * Get all category approvals for a workspace
   *
   * @param workspaceType - Workspace to get approvals for (defaults to 'ide')
   * @returns Record of category to approval status
   */
  public getAllCategoryApprovals(workspaceType?: WorkspaceType): Record<ToolCategory, boolean> {
    const workspace = workspaceType ?? 'ide';
    return useToolPermissionStore.getState().categoryApprovals[workspace] ?? {
      files: false,
      terminal: false,
      knowledge: false,
      vision: false,
      search: false,
      web: false,
    };
  }

  /**
   * Reset all category approvals to false (for a workspace or all workspaces)
   *
   * @param workspaceType - Workspace to reset (if not provided, resets all workspaces)
   */
  public resetCategoryApprovals(workspaceType?: WorkspaceType): void {
    const store = useToolPermissionStore.getState();
    const categories: ToolCategory[] = ['files', 'terminal', 'knowledge', 'vision', 'search', 'web'];

    if (workspaceType) {
      // Reset specific workspace
      categories.forEach(category => {
        store.setCategoryApproval(category, workspaceType, false);
      });
    } else {
      // Reset all workspaces
      const workspaces: WorkspaceType[] = ['ide', 'knowledge', 'notes', 'study'];
      workspaces.forEach(workspace => {
        categories.forEach(category => {
          store.setCategoryApproval(category, workspace, false);
        });
      });
    }
  }

  /**
   * Get the category for a tool
   *
   * ARCH-01.4: Tool-to-category mapping for category-level approvals
   *
   * @param toolId - Tool identifier
   * @returns Tool category (defaults to 'search' for unknown tools)
   */
  public getToolCategory(toolId: string): ToolCategory {
    return getToolCategory(toolId);
  }
}
