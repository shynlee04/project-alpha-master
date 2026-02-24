/**
 * @fileoverview lib/workspace barrel exports
 * @module lib/workspace
 *
 * @deprecated These exports are obsolete and being migrated.
 * Use canonical imports from domain/ and infrastructure/ layers.
 */

// File sync status store
export {
  useFileSyncStatusStore,
  fileSyncStatusStore,
  fileSyncCountsStore,
  setFileSyncPending,
  setFileSyncSynced,
  setFileSyncError,
  clearFileSyncStatus,
  clearAllFileSyncStatuses,
} from './file-sync-status-store';

export type {
  FileSyncState,
  FileSyncStatus,
  FileSyncCounts,
  SyncProgress,
  FileSyncStatusStore,
} from './file-sync-status-store';

// Workspace detector
export {
  detectWorkspace,
  getCurrentWorkspace,
  isValidWorkspace,
  isInWorkspace,
  getWorkspacePath,
} from './workspace-detector';

export type { WorkspaceType } from './workspace-detector';

// FSA persistence
export {
  fsaPersistenceManager,
  FSAPersistenceManager,
  createFSAPersistenceManager,
  createProjectFromFolder,
  pickFolder,
  isFSASupported,
  isDesktopPlatform,
} from './fsa-persistence';

export type { CreateFromFolderOptions } from './fsa-persistence';

// Browser mode
export { browserMode, isBrowserMode, getOrCreateBrowserModeProject } from './browser-mode';

// Temp project
export { tempProject, createTempProject, getOrCreateTempProject } from './temp-project';

export type { TempProjectMetadata } from './temp-project';

// Re-export common types used by consumers
export type { PluginType } from '@/domain/schemas/plugin.schema';

// ============================================================================
// Additional types needed by consumers
// ============================================================================

/** @deprecated Use appropriate sync type from infrastructure */
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

/** @deprecated */
export interface TerminalTab {
  id: string;
  title: string;
  cwd?: string;
}

/** @deprecated */
export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => children;

// Import React for the component
import * as React from 'react';
