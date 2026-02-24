/**
 * Tool Permission Manager - Singleton & Factory Methods
 *
 * Manages the singleton instance and factory creation.
 * Handles event bus registration for permission events.
 *
 * @module tool-permission-singleton
 */

import type { ToolTrustLevel } from './types';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
import { useToolPermissionStore } from '@/infrastructure/persistence/stores/permissions/tool-permission-store';

/**
 * Event emitter callback type
 */
export type PermissionEventBus = (event: string, ...args: unknown[]) => void;

/**
 * Permission manager context (singleton instance + event bus)
 */
export interface PermissionManagerContext {
  eventBus: PermissionEventBus | null;
}

/**
 * Create a new permission manager instance
 *
 * @param initialPermissions - Optional initial trust levels (can be workspace-scoped)
 * @param context - Manager context for event emission
 */
export function createPermissionInstance(
  initialPermissions?: Record<string, ToolTrustLevel> | Record<string, Record<WorkspaceType, ToolTrustLevel>>,
  _context?: PermissionManagerContext
): void {
  if (!initialPermissions) {
    return;
  }

  const store = useToolPermissionStore.getState();
  const firstToolId = Object.keys(initialPermissions)[0];
  const isWorkspaceScoped = firstToolId && typeof initialPermissions[firstToolId] === 'object';

  if (isWorkspaceScoped) {
    Object.entries(initialPermissions).forEach(([toolId, workspaceLevels]) => {
      Object.entries(workspaceLevels as Record<WorkspaceType, ToolTrustLevel>).forEach(([workspace, level]) => {
        store.setTrustLevel(toolId, workspace as WorkspaceType, level);
      });
    });
  } else {
    Object.entries(initialPermissions).forEach(([toolId, level]) => {
      for (const workspace of ['ide', 'knowledge', 'notes', 'study'] as WorkspaceType[]) {
        store.setTrustLevel(toolId, workspace, level);
      }
    });
  }
}

/**
 * Set the event bus for permission change events
 *
 * @param context - Manager context to update
 * @param eventBus - Event emitter callback
 */
export function setPermissionEventBus(
  context: PermissionManagerContext,
  eventBus: PermissionEventBus
): void {
  context.eventBus = eventBus;
}

/**
 * Emit a permission event through the registered event bus
 *
 * @param context - Manager context containing event bus
 * @param event - Event name
 * @param args - Event arguments
 */
export function emitPermissionEvent(
  context: PermissionManagerContext,
  event: string,
  ...args: unknown[]
): void {
  context.eventBus?.(event, ...args);
}
