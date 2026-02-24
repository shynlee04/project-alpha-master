/**
 * @fileoverview Platform Core - Foundation services and utilities
 * @module @/platform/core
 *
 * This module provides core platform infrastructure including:
 * - PlatformProvider context for project/platform state
 * - PlatformLayout for 3-column operator layout
 * - Event bus for cross-operator communication (R-1)
 * - Platform configuration and initialization
 *
 * @layer platform
 * @created 2026-02-02
 *
 * @example
 * import { PlatformProvider, usePlatform } from '@/platform/core';
 * import { PlatformLayout } from '@/platform/core';
 */

// Platform context and hooks
export {
  PlatformProvider,
  usePlatform,
  usePlatformSafe,
} from './platform-context';

// Platform layout
export { PlatformLayout } from './platform-layout';

// R-2: Platform storage gateway wrapper
export {
  createPlatformStorage,
  createPlatformFSAStorage,
  createPlatformIDBStorage,
  type PlatformStorageOptions,
  type StorageGateway,
} from './storage-gateway';
