/**
 * @fileoverview IDB Adapter Factory - Factory functions for IDBAdapter
 * @module infrastructure/sync/adapters/idb-adapter-factory
 */

import type { IDBAdapterConfig } from './idb-adapter-types';
import { IDBAdapter } from './idb-adapter-core';

/**
 * Create an IDB adapter for a specific project
 * @param projectId - Project ID for namespacing
 * @param config - Optional configuration
 * @returns Configured IDB adapter
 */
export function createIDBAdapter(
  projectId: string,
  config?: Partial<IDBAdapterConfig>
): IDBAdapter {
  return new IDBAdapter({ ...config, projectId });
}

/**
 * Default IDB adapter instance (deprecated - use createIDBAdapter)
 * @deprecated Use createIDBAdapter(projectId) instead for proper namespacing
 */
export const idbAdapter = new IDBAdapter({ projectId: 'default' });
