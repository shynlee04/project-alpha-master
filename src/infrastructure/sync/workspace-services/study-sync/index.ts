/**
 * @fileoverview Study File Sync Module Barrel Export
 * @module infrastructure/sync/workspace-services/study-sync
 *
 * Barrel export for study file sync service module.
 *
 * @story ARCH-01.1.3
 */

// Types
export type { StudyFileSyncConfig, ImportResult } from './study-sync-types';

// Core service
export { StudyFileSyncServiceCore, StudyFileSyncService, createStudyFileSyncService } from './study-sync-service-core';

// Import utilities
export { StudyImportUtils } from './study-import-utils';
