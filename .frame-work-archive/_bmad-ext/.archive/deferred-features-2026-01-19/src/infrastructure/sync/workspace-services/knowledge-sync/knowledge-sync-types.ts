/**
 * @fileoverview Knowledge File Sync Types
 * @module infrastructure/sync/workspace-services/knowledge-sync/knowledge-sync-types
 *
 * Type definitions for Knowledge workspace file sync service.
 *
 * @story ARCH-01.1.4
 */

import type { FileSyncConfig } from '../file-sync-service';
import type { SourceRecord } from '@/infrastructure/persistence/dexie-db-types';

/**
 * Configuration for Knowledge file sync service
 */
export interface KnowledgeFileSyncConfig extends FileSyncConfig {
    onDocumentImport?: (source: SourceRecord) => Promise<void>;
}

/**
 * Supported document formats for Knowledge workspace
 */
export const SUPPORTED_FORMATS = [
    '.txt',
    '.md',
    '.rst',
    '.pdf',
    '.html',
    '.htm',
    '.json'
] as const;

export type SupportedFormat = typeof SUPPORTED_FORMATS[number];
