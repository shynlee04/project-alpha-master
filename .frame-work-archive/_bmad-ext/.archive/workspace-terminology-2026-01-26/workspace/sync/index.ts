/**
 * @fileoverview Sync Components Barrel Export
 * @module presentation/components/workspace/sync
 * @governance EPIC-CC-01 - Project Space Foundation
 * @story PS-02-B - Hot Reactive Sync Integration
 *
 * Barrel export for sync-related components.
 */

// Components
export { SyncStatusIndicator } from './SyncStatusIndicator';
export { FileChangeNotification } from './FileChangeNotification';

// Hooks
export { useVFSSync, useVFSAutoWatch } from '@/infrastructure/persistence/stores/workspace/slices/use-vfs-sync-slice';

// Utilities
export {
  formatFilePath,
  getChangeTypeIcon,
  getChangeTypeColorClass,
} from '@/infrastructure/persistence/stores/workspace/slices/use-vfs-sync-slice';
