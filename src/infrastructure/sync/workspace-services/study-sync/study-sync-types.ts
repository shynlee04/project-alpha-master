/**
 * @fileoverview Study File Sync Types
 * @module infrastructure/sync/workspace-services/study-sync/study-sync-types
 *
 * Type definitions for Study workspace file sync service.
 *
 * @story ARCH-01.1.3
 */

import type {
    FileSyncService,
    FileMetadata,
    FileChangeEvent,
    SyncResult,
    SyncStatus,
    SyncOptions,
    FileSyncConfig
} from '../file-sync-service';
import type { LocalFSAdapter } from '@/lib/filesystem/local-fs-adapter';
import type { Quiz } from '@/lib/study/quiz-types';

/**
 * Configuration for Study file sync service
 */
export interface StudyFileSyncConfig extends FileSyncConfig {
    localAdapter: LocalFSAdapter;
}

/**
 * Result of importing study materials
 */
export interface ImportResult {
    success: boolean;
    filesProcessed: number;
    quizzesImported: number;
    pdfsFound: number;
    errors: Array<{ path: string; error: string }>;
}
