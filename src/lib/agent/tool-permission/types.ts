/**
 * @fileoverview Tool Permission Manager Types
 * @module lib/agent/tool-permission/types
 *
 * Type definitions for the tool permission system.
 * Split from tool-permission-manager.ts for better organization.
 *
 * @epic CWAC-P0 - Address Critical P0 Issues
 * @story CWAC-P0-1 - Split god store (860 → ≤300 lines)
 */

import type { WorkspaceType } from '@/domain/value-objects/workspace-type';

/**
 * Trust level for a tool - determines when user approval is required
 */
export type ToolTrustLevel = 'auto' | 'prompt' | 'block';

/**
 * Tool categories for bulk permission management (ARCH-01.4)
 */
export type ToolCategory =
  | 'file_read'
  | 'file_write'
  | 'file_delete'
  | 'command'
  | 'web_search'
  | 'knowledge'
  | 'notes'
  | 'study';

/**
 * YOLO mode configuration (ARCH-01.4)
 */
export interface YOLOMode {
  /** Whether YOLO mode is currently active */
  enabled: boolean;
  /** Timestamp when YOLO mode expires (null if no expiry) */
  expiryTime: number | null;
  /** Timestamp when YOLO mode was enabled */
  enabledAt: number | null;
}

/**
 * Default trust levels for tools (used on first use)
 */
export const DEFAULT_TRUST_LEVELS: Record<string, ToolTrustLevel> = {
  // File operations - prompt by default (user must approve file changes)
  'read_file': 'auto',
  'write_file': 'prompt',
  'create_file': 'prompt',
  'delete_file': 'block',
  'list_files': 'auto',

  // Command execution - prompt (security sensitive)
  'execute_command': 'prompt',
  'run_terminal': 'prompt',

  // Knowledge operations - auto (read-only)
  'synthesize': 'auto',
  'search_knowledge': 'auto',
  'index_document': 'auto',

  // Notes operations - prompt (modifies user data)
  'search_notes': 'auto',
  'create_note': 'prompt',
  'update_note': 'prompt',

  // Study operations - prompt (modifies user data)
  'create_flashcard': 'prompt',
  'create_quiz': 'prompt',

  // Web operations - prompt (external calls)
  'process_url': 'prompt',
  'web_search': 'prompt',

  // Default for unknown tools
  'unknown': 'prompt',
};

/**
 * Tool to category mapping (ARCH-01.4)
 */
export const TOOL_CATEGORIES: Record<string, ToolCategory> = {
  // File operations
  'read_file': 'file_read',
  'write_file': 'file_write',
  'create_file': 'file_write',
  'delete_file': 'file_delete',
  'list_files': 'file_read',

  // Command execution
  'execute_command': 'command',
  'run_terminal': 'command',

  // Knowledge operations
  'synthesize': 'knowledge',
  'search_knowledge': 'knowledge',
  'index_document': 'knowledge',

  // Notes operations
  'search_notes': 'notes',
  'create_note': 'notes',
  'update_note': 'notes',

  // Study operations
  'create_flashcard': 'study',
  'create_quiz': 'study',

  // Web operations
  'process_url': 'web_search',
  'web_search': 'web_search',
};

/**
 * Result of a permission check
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
