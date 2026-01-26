/**
 * @fileoverview File Sync Hooks
 * @module lib/filesync/hooks
 *
 * Custom hooks for file sync service management.
 */

export { useFileSyncService } from './use-file-sync-service';
export type { UseFileSyncServiceOptions, UseFileSyncServiceResult } from './use-file-sync-service';

// CC-V2-B04: MarkdownSyncService hook for FSA projects
export { useMarkdownSyncService } from './use-markdown-sync-service';
export type { UseMarkdownSyncServiceOptions, UseMarkdownSyncServiceResult } from './use-markdown-sync-service';
