/**
 * @fileoverview Sync Manager Factory
 * @module lib/filesystem/sync-manager
 *
 * Factory function for creating SyncManager instances.
 */

import type { LocalFSAdapter } from '../local-fs-adapter';
import type { WorkspaceEventEmitter } from '../../events';
import type { SyncConfig } from './sync-manager-types';
import { SyncManager } from './sync-manager';

/**
 * Create a SyncManager instance with optional configuration
 *
 * Convenience factory function for creating SyncManager instances.
 *
 * @param adapter - LocalFSAdapter instance with directory access
 * @param config - Optional configuration
 * @param eventBus - Optional event emitter
 * @returns SyncManager instance
 */
export function createSyncManager(
    adapter: LocalFSAdapter,
    config?: Partial<SyncConfig>,
    eventBus?: WorkspaceEventEmitter
): SyncManager {
    return new SyncManager(adapter, config, eventBus);
}
