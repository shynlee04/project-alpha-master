/**
 * @fileoverview Tool Permission Manager
 * @module lib/agent/tool-permission-manager
 *
 * Manages tool execution trust levels and permissions for AI agents.
 *
 * Trust Levels:
 * - 'auto': Execute immediately without user approval (safe operations)
 * - 'prompt': Require user approval before execution (risky operations)
 * - 'block': Never execute (dangerous operations)
 *
 * @epic 4 - Smart Agent Tools
 * @story 4.3 - Tool Permissions & Trust Levels
 */

import type { EventEmitter3 } from 'eventemitter3';

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
 * ToolPermissionManager - Manages tool execution permissions and trust levels
 *
 * Architecture:
 * - Singleton per agent configuration
 * - In-memory trust level storage with persistence support
 * - Session-based temporary trust (cleared on reload)
 * - Event emission for UI updates
 */
export class ToolPermissionManager {
  private static instance: ToolPermissionManager | null = null;

  /** Tool trust levels (persisted) */
  private trustLevels: Map<string, ToolTrustLevel> = new Map();

  /** Session-based trust (in-memory only, cleared on reload) */
  private sessionTrust: Set<string> = new Set();

  /** Event emitter for permission changes */
  private eventBus: EventEmitter3<ToolPermissionEvents> | null = null;

  /** Default trust levels for all tools */
  private readonly defaultTrustLevels: Record<string, ToolTrustLevel> = {
    read_file: 'auto',
    list_files: 'auto',
    read_directory: 'auto',
    write_file: 'prompt',
    create_directory: 'prompt',
    delete_file: 'block',
    execute_command: 'prompt',
  };

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
   */
  public static createInstance(
    initialPermissions?: Record<string, ToolTrustLevel>
  ): ToolPermissionManager {
    const instance = new ToolPermissionManager();
    if (initialPermissions) {
      Object.entries(initialPermissions).forEach(([toolId, level]) => {
        instance.trustLevels.set(toolId, level);
      });
    }
    return instance;
  }

  /**
   * Private constructor - use getInstance()
   */
  private constructor() {
    // Initialize with default trust levels
    this.initializeDefaults();
  }

  /**
   * Initialize trust levels from defaults
   */
  private initializeDefaults(): void {
    Object.entries(this.defaultTrustLevels).forEach(([toolId, level]) => {
      this.trustLevels.set(toolId, level);
    });
  }

  /**
   * Set event bus for emitting permission change events
   */
  public setEventBus(eventBus: EventEmitter3<ToolPermissionEvents>): void {
    this.eventBus = eventBus;
  }

  /**
   * Get the trust level for a tool
   */
  public getTrustLevel(toolId: string): ToolTrustLevel {
    return this.trustLevels.get(toolId) ?? 'prompt'; // Default to prompt if unknown
  }

  /**
   * Set the trust level for a tool
   */
  public setTrustLevel(toolId: string, level: ToolTrustLevel): void {
    const previousLevel = this.trustLevels.get(toolId);
    this.trustLevels.set(toolId, level);

    // Emit event if level changed
    if (previousLevel !== level) {
      this.eventBus?.emit('permission:changed', toolId, level);
    }
  }

  /**
   * Check if a tool has session-based trust
   */
  public hasSessionTrust(toolId: string): boolean {
    return this.sessionTrust.has(toolId);
  }

  /**
   * Add session-based trust for a tool
   */
  public addSessionTrust(toolId: string): void {
    if (!this.sessionTrust.has(toolId)) {
      this.sessionTrust.add(toolId);
      this.eventBus?.emit('session:trust:added', toolId);
    }
  }

  /**
   * Remove session-based trust for a tool
   */
  public removeSessionTrust(toolId: string): void {
    if (this.sessionTrust.has(toolId)) {
      this.sessionTrust.delete(toolId);
      this.eventBus?.emit('session:trust:removed', toolId);
    }
  }

  /**
   * Clear all session-based trust
   */
  public clearSessionTrust(): void {
    this.sessionTrust.clear();
    this.eventBus?.emit('session:trust:cleared');
  }

  /**
   * Check permission for a tool execution
   */
  public checkPermission(toolId: string): PermissionCheckResult {
    const trustLevel = this.trustLevels.get(toolId) ?? 'prompt';
    const hasSession = this.sessionTrust.has(toolId);

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
   */
  public getAllTrustLevels(): Record<string, ToolTrustLevel> {
    const result: Record<string, ToolTrustLevel> = {};
    this.trustLevels.forEach((level, toolId) => {
      result[toolId] = level;
    });
    return result;
  }

  /**
   * Get default trust levels
   */
  public getDefaultTrustLevels(): Record<string, ToolTrustLevel> {
    return { ...this.defaultTrustLevels };
  }

  /**
   * Reset all trust levels to defaults
   */
  public resetToDefaults(): void {
    this.trustLevels.clear();
    this.initializeDefaults();
  }

  /**
   * Serialize permissions for persistence
   */
  public toJSON(): string {
    const permissions: Record<string, ToolTrustLevel> = {};
    this.trustLevels.forEach((level, toolId) => {
      permissions[toolId] = level;
    });
    return JSON.stringify({ permissions });
  }

  /**
   * Deserialize permissions from persistence
   * Preserves defaults for tools not in the JSON
   */
  public static fromJSON(json: string): ToolPermissionManager {
    const data = JSON.parse(json);
    const instance = new ToolPermissionManager();

    if (data.permissions) {
      Object.entries(data.permissions).forEach(([toolId, level]) => {
        instance.trustLevels.set(toolId, level as ToolTrustLevel);
      });
    }

    return instance;
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
   */
  public getToolIds(): string[] {
    return Array.from(this.trustLevels.keys());
  }

  /**
   * Get tools by trust level
   */
  public getToolsByLevel(level: ToolTrustLevel): string[] {
    const tools: string[] = [];
    this.trustLevels.forEach((trustLevel, toolId) => {
      if (trustLevel === level) {
        tools.push(toolId);
      }
    });
    return tools;
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
