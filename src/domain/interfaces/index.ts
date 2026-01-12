/**
 * @fileoverview Domain Interfaces Barrel Export
 * @module domain/interfaces
 *
 * Central export point for all domain interfaces.
 * These interfaces define contracts that infrastructure layer implements.
 *
 * Clean Architecture:
 * - Domain layer owns the interfaces
 * - Infrastructure layer provides implementations
 * - Presentation layer depends only on interfaces
 *
 * @epic EPIC-CC-01 - Project Space Foundation
 * @story PS-02 - Create StorageAdapter Domain Interface
 */

// ============================================================================
// Storage Adapter Interface
// ============================================================================

export type {
  StorageAdapter,
  FileContent,
  FileMetadata,
  FileChangeEvent,
  FileChangeCallback,
  FileSyncState,
} from './storage-adapter.interface';

// ============================================================================
// File Operations Adapter Interface
// ============================================================================

export type {
  FileOperationsAdapter,
  DirectoryEntry,
  DirectoryEntryWithMetadata,
  StorageType,
  CreateStorageAdapterOptions,
} from './file-operations-adapter.interface';
