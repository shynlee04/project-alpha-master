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
 * @epic EPIC-CC-ARC - Correct-Course Architectural Remediation
 * @story ARC-B01 - Create StorageGateway Interface
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

// ============================================================================
// Storage Gateway Interface (ARC-B01)
// ============================================================================

export type {
  StorageGateway,
  StorageGatewayFactory,
  FileEntry,
  FileChangeEvent as GatewayFileChangeEvent,
  FileChangeCallback as GatewayFileChangeCallback,
  WatchHandle,
} from './storage-gateway.interface';

// ============================================================================
// Feature Plugin Interface (ARCH-02-01)
// ============================================================================

export type {
  FeaturePlugin,
  PluginMainProps,
  PluginSidebarProps,
  PluginToolbarProps,
  PluginRequirements,
  PluginRegistryEntry,
  ProjectContext,
} from './feature-plugin.interface';

// ============================================================================
// Plugin Capability Interface (EPIC-0.6-04)
// ============================================================================

export type {
  PluginCapabilityType,
  DeviceType,
  ServiceRequirement,
  PluginCapability,
  PluginDeclaration,
} from './plugin-capability.interface';

export {
  FILE_TREE_DECLARATION,
  MONACO_DECLARATION,
  NOTES_DECLARATION,
  TERMINAL_DECLARATION,
  PREVIEW_DECLARATION,
  CHAT_DECLARATION,
  PLUGIN_DECLARATIONS,
  getPluginsForFileType,
  getBestPluginForFileType,
  getPluginsForDevice,
  canPluginRun,
  getUnsatisfiedDependencies,
  getPluginDeclaration,
} from './plugin-capability.interface';
