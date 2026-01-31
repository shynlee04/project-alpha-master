/**
 * @fileoverview Study File Sync Service - FACADE EXPORT
 * @module infrastructure/sync/workspace-services/study-file-sync-service
 * @deprecated Import from './study-sync' instead
 *
 * This file is a backward-compatibility facade.
 * The canonical implementation is now in the study-sync module.
 *
 * @migration ARCH-01.1 - God File Elimination (2026-01-05)
 *
 * @before
 * import { StudyFileSyncService, createStudyFileSyncService } from './study-file-sync-service';
 *
 * @after
 * import { StudyFileSyncService, createStudyFileSyncService } from './study-sync';
 * // Or use the new core class directly:
 * import { StudyFileSyncServiceCore } from './study-sync/study-sync-service-core';
 */

// Re-export all types from the new modular location
export type {
    StudyFileSyncConfig,
    ImportResult
} from './study-sync';

// Re-export all classes and functions from the new modular location
export {
    StudyFileSyncServiceCore,
    StudyFileSyncService,
    createStudyFileSyncService,
    StudyImportUtils
} from './study-sync';
