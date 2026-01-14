/**
 * @fileoverview Storage Types - Platform detection and storage adapter types
 * @module infrastructure/filesystem/storage-types
 *
 * Defines types for platform detection and storage adapter selection.
 * Used by StorageAdapterFactory to route to appropriate adapter.
 *
 * @epic EPIC-CC-01 - Project Space Foundation
 * @story PS-02-A - Platform Detection & Storage Routing
 *
 * NOTE: Core storage types (FileChangeEvent, FileContent, etc.)
 * are re-exported from the domain layer for Clean Architecture compliance.
 * See: src/domain/interfaces/storage-adapter.interface.ts
 */

// ============================================================================
// Re-exports from Domain Layer (Clean Architecture)
// ============================================================================

export type {
  FileChangeCallback,
  FileChangeEvent,
  FileContent,
  FileMetadata,
  FileSyncState,
} from '@/domain/interfaces/storage-adapter.interface';

// ============================================================================
// Infrastructure-Specific Types
// ============================================================================

/**
 * Storage type enumeration
 */
export type StorageType = 'fsa' | 'indexeddb';

/**
 * Platform type enumeration
 */
export type PlatformType = 'desktop' | 'mobile' | 'tablet';

/**
 * Platform information from detection
 */
export interface PlatformInfo {
  /** Detected platform type */
  type: PlatformType;
  /** Whether File System Access API is supported */
  isFSASupported: boolean;
  /** Whether WebContainer API is available */
  isWebContainer: boolean;
  /** Whether device can write to file system */
  canWrite: boolean;
  /** Optimal storage type for this platform */
  storageType: StorageType;
}

/**
 * Storage capabilities for a platform
 */
export interface StorageCapabilities {
  /** Supports File System Access API */
  supportsFSA: boolean;
  /** Supports WebContainer */
  supportsWebContainer: boolean;
  /** Has persistent storage */
  hasPersistentStorage: boolean;
  /** Maximum storage quota in bytes (0 = unknown) */
  storageQuota: number;
  /** Device type */
  deviceType: PlatformType;
}

/**
 * Options for creating a storage adapter
 * 
 * FIX-2026-01-19: FSA-006 - handle is now optional, use handleGetter for context-based retrieval
 */
export interface StorageOptions {
  /** Project ID for the storage */
  projectId: string;
  /** Requested storage type */
  storageType?: StorageType;
  /** FSA handle (deprecated: use handleGetter instead for FSA-006 fix) */
  handle?: FileSystemDirectoryHandle | null;
  /** Function to get FSA handle from context (FSA-006: Get handle from ProjectContext) */
  handleGetter?: FsaHandleGetter;
  /** Initial directory path */
  directoryPath?: string;
}

/**
 * Result of storage adapter creation
 */
export interface StorageAdapterResult<TAdapter = unknown> {
  /** The created storage adapter */
  adapter: TAdapter;
  /** Detected/selected storage type */
  storageType: StorageType;
  /** Platform information */
  platform: PlatformInfo;
}

/**
 * Factory configuration options
 */
export interface FactoryConfig {
  /** Force a specific storage type (overrides detection) */
  forceStorageType?: StorageType;
  /** Custom platform info (for testing) */
  customPlatform?: PlatformInfo;
}

/**
 * FSA Handle Getter Function (FSA-006: Get handle from ProjectContext)
 * 
 * This function type is used to lazily retrieve the FSA handle from context
 * instead of requiring it at factory creation time. This solves the issue
 * where handle is only available after user grants permission.
 * 
 * @returns The FSA handle or null if not yet available
 * 
 * @example
 * ```typescript
 * // In route loader or component:
 * const { fsaHandle } = useProjectContext();
 * 
 * const adapter = StorageAdapterFactory.createAdapter({
 *   projectId,
 *   handleGetter: () => fsaHandle,
 * });
 * ```
 */
export type FsaHandleGetter = () => FileSystemDirectoryHandle | null;
