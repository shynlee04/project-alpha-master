/**
 * @fileoverview Tool Permission Manager
 * @module lib/agent/tool-permission-manager
 *
 * Manages tool execution trust levels and permissions for AI agents.
 * NOW USES: Zustand store with Dexie persistence for cross-session survival.
 *
 * Trust Levels:
 * - 'auto': Execute immediately without user approval (safe operations)
 * - 'prompt': Require user approval before execution (risky operations)
 * - 'block': Never execute (dangerous operations)
 *
 * @epic WB-8.3 - Cross-Workspace Event System
 * @story WB-8.3.1 - Tool Permission Persistence
 * @prio P0 - Critical UX Fix
 *
 * MIGRATION-2026-01-01: Refactored to use Zustand store
 * - trustLevels now persisted via useToolPermissionStore (Dexie/IndexedDB)
 * - Session trust remains ephemeral (cleared on reload)
 * - Public API preserved for backwards compatibility
 * - All 8 integration points continue to work without changes
 */

import { useToolPermissionStore } from '@/lib/state/tool-permission-store';
// import type { EventEmitter } from 'eventemitter3'; // Reserved for future use

/**
 * Trust level for a tool - determines when user approval is required
 */
export type ToolTrustLevel = 'auto' | 'prompt' | 'block';

/**
 * Result of a permission check
 */
export interface PermissionCheckResult {
  /** Whether the tool needs user approval before execution */
  needsApproval: boolean;
  /** Whether the tool can execute (false if blocked) */
  canExecute: boolean;
  /** Reason for the permission decision */
  reason: 'auto' | 'prompt' | 'block' | 'session';
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
   * NOTE: Custom initial permissions will override store defaults
   */
  public static createInstance(
    initialPermissions?: Record<string, ToolTrustLevel>
  ): ToolPermissionManager {
    const instance = new ToolPermissionManager();

    // Apply custom permissions to store if provided
    if (initialPermissions) {
      Object.entries(initialPermissions).forEach(([toolId, level]) => {
        useToolPermissionStore.getState().setTrustLevel(toolId, level);
      });
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
   * Get the trust level for a tool
   */
  public getTrustLevel(toolId: string): ToolTrustLevel {
    return useToolPermissionStore.getState().getTrustLevel(toolId);
  }

  /**
   * Set the trust level for a tool (persisted)
   */
  public setTrustLevel(toolId: string, level: ToolTrustLevel): void {
    const previousLevel = this.getTrustLevel(toolId);

    // Update store (persisted automatically)
    useToolPermissionStore.getState().setTrustLevel(toolId, level);

    // Emit event if level changed (for backwards compatibility)
    if (previousLevel !== level) {
      this.eventBus?.emit('permission:changed', toolId, level);
    }
  }

  /**
   * Check if a tool has session-based trust
   */
  public hasSessionTrust(toolId: string): boolean {
    const state = useToolPermissionStore.getState();
    return state.sessionTrust.includes(toolId);
  }

  /**
   * Add session-based trust for a tool (ephemeral)
   */
  public addSessionTrust(toolId: string): void {
    const store = useToolPermissionStore.getState();

    // Check if already has session trust (avoid duplicate event)
    if (!store.sessionTrust.includes(toolId)) {
      store.addSessionTrust(toolId);
      this.eventBus?.emit('session:trust:added', toolId);
    }
  }

  /**
   * Remove session-based trust for a tool
   */
  public removeSessionTrust(toolId: string): void {
    const store = useToolPermissionStore.getState();

    // Check if has session trust (avoid unnecessary event)
    if (store.sessionTrust.includes(toolId)) {
      store.removeSessionTrust(toolId);
      this.eventBus?.emit('session:trust:removed', toolId);
    }
  }

  /**
   * Clear all session-based trust (ephemeral)
   */
  public clearSessionTrust(): void {
    useToolPermissionStore.getState().clearSessionTrust();
    this.eventBus?.emit('session:trust:cleared');
  }

  /**
   * Check permission for a tool execution
   *
   * Reads from Zustand store and returns permission result
   */
  public checkPermission(toolId: string): PermissionCheckResult {
    const state = useToolPermissionStore.getState();
    const trustLevel = state.trustLevels[toolId] ?? 'prompt';
    const hasSession = state.sessionTrust.includes(toolId);

    // Check block first (highest priority)
    if (trustLevel === 'block') {
      return {
        needsApproval: false,
        canExecute: false,
        reason: 'block',
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
        toolName: this.getToolDisplayName(toolId),
        toolId,
      };
    }

    // Prompt mode - needs approval
    return {
      needsApproval: true,
      canExecute: true,
      reason: 'prompt',
      toolName: this.getToolDisplayName(toolId),
      toolId,
    };
  }

  /**
   * Get all trust levels (for persistence/UI)
   *
   * NOTE: Now returns from Zustand store
   */
  public getAllTrustLevels(): Record<string, ToolTrustLevel> {
    return { ...useToolPermissionStore.getState().trustLevels };
  }

  /**
   * Get default trust levels
   *
   * NOTE: Hardcoded defaults removed (managed by store)
   */
  public getDefaultTrustLevels(): Record<string, ToolTrustLevel> {
    // Store manages defaults - return current state for backwards compatibility
    return { ...useToolPermissionStore.getState().trustLevels };
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
   * Get tools by trust level
   *
   * NOTE: Now reads from Zustand store
   */
  public getToolsByLevel(level: ToolTrustLevel): string[] {
    const state = useToolPermissionStore.getState();
    return Object.entries(state.trustLevels)
      .filter(([_, trustLevel]) => trustLevel === level)
      .map(([toolId]) => toolId);
  }

  /**
   * Check if any tools require approval (for UI indicator)
   */
  public hasPromptTools(): boolean {
    return this.getToolsByLevel('prompt').length > 0;
  }

  /**
   * Check if any tools are blocked (for UI indicator)
   */
  public hasBlockedTools(): boolean {
    return this.getToolsByLevel('block').length > 0;
  }
}
