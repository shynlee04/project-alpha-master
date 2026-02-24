/**
 * @fileoverview Bridge file for workspace-detector backward compatibility
 * @module lib/workspace/workspace-detector
 *
 * @deprecated This module is obsolete.
 * Use PluginType from @/domain/schemas/plugin.schema
 */

import type { PluginType } from '@/domain/schemas/plugin.schema';

/**
 * @deprecated Use PluginType directly
 */
export type WorkspaceType = PluginType;

/**
 * @deprecated Workspaces are replaced by plugins
 */
export function detectWorkspace(): PluginType {
  return 'editor';
}

/**
 * @deprecated Use PluginType directly
 */
export function getCurrentWorkspace(): PluginType {
  return 'editor';
}

/**
 * @deprecated
 */
export function isValidWorkspace(ws: string): ws is PluginType {
  return ['editor', 'notes', 'chat', 'terminal', 'preview', 'knowledge', 'study'].includes(ws);
}

/**
 * @deprecated Always returns true for backward compatibility
 */
export function isInWorkspace(_ws?: string): boolean {
  return true;
}

/**
 * @deprecated Returns empty string for backward compatibility
 */
export function getWorkspacePath(_ws?: string): string {
  return '';
}
