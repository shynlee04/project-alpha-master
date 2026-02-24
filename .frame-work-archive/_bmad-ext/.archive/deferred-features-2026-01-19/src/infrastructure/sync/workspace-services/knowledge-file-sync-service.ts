/**
 * @fileoverview Knowledge File Sync Service - FACADE EXPORT
 * @module infrastructure/sync/workspace-services/knowledge-file-sync-service
 * @deprecated Import from './knowledge-sync' instead
 *
 * This file is a backward-compatibility facade.
 * The canonical implementation is now in the knowledge-sync module.
 *
 * @migration ARCH-01.1 - God File Elimination (2026-01-05)
 *
 * @before
 * import { KnowledgeFileSyncService, createKnowledgeFileSyncService } from './knowledge-file-sync-service';
 *
 * @after
 * import { KnowledgeFileSyncService, createKnowledgeFileSyncService } from './knowledge-sync';
 * // Or use the new core class directly:
 * import { KnowledgeFileSyncServiceCore } from './knowledge-sync/knowledge-sync-service-core';
 */

// Re-export all types from the new modular location
export type { KnowledgeFileSyncConfig, SupportedFormat } from './knowledge-sync';

// Re-export constants
export { SUPPORTED_FORMATS } from './knowledge-sync';

// Re-export all classes and functions from the new modular location
export {
    KnowledgeFileSyncServiceCore,
    KnowledgeFileSyncService,
    createKnowledgeFileSyncService,
    KnowledgeSourceStore
} from './knowledge-sync';
