/**
 * @fileoverview Knowledge File Sync Module Barrel Export
 * @module infrastructure/sync/workspace-services/knowledge-sync
 *
 * Barrel export for knowledge file sync service module.
 *
 * @story ARCH-01.1.4
 */

// Types
export type { KnowledgeFileSyncConfig } from './knowledge-sync-types';
export { SUPPORTED_FORMATS } from './knowledge-sync-types';
export type { SupportedFormat } from './knowledge-sync-types';

// Source store
export { KnowledgeSourceStore } from './knowledge-source-store';

// Core service
export { KnowledgeFileSyncServiceCore, KnowledgeFileSyncService, createKnowledgeFileSyncService } from './knowledge-sync-service-core';
