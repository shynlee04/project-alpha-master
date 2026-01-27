/**
 * @fileoverview Domain Types Barrel Export
 * @module domain/types
 *
 * Central export point for all domain types.
 * These types define data structures used across the application.
 *
 * Clean Architecture:
 * - Domain layer owns types
 * - Infrastructure layer provides implementations
 * - Presentation layer depends only on types
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-01
 */

// ============================================================================
// Plugin Types (ARCH-02-01)
// ============================================================================

export type { PluginId } from './plugin-types';
export type { PluginCategory } from './plugin-types';

export { PLUGIN_IDS } from './plugin-types';
export { PLUGIN_CATEGORIES } from './plugin-types';
export { isValidPluginId } from './plugin-types';
export { getPluginsByCategory } from './plugin-types';

// ============================================================================
// Project Types
// ============================================================================

export type { ProjectId } from './project-ids';
export type { WorkspaceType } from './project-ids';
export type { AnyProjectId } from './project-ids';
export type { BrandedProjectId } from './project-ids';
export type { ExtractWorkspaceType } from './project-ids';

export { isValidProjectId } from './project-ids';
export { hasLegacyPrefix } from './project-ids';
export { stripLegacyPrefix } from './project-ids';
export { extractWorkspaceType } from './project-ids';
export { assertProjectId } from './project-ids';
export { isBrandedProjectId } from './project-ids';

// ============================================================================
// VIAgent Metadata
// ============================================================================

export type { ViagentVersion } from './viagent-metadata';
export type { ViagentProjectMetadata } from './viagent-metadata';
export type { ViagentNoteEntry } from './viagent-metadata';
export type { ViagentNotesIndex } from './viagent-metadata';
export type { ViagentNoteFolder } from './viagent-metadata';
export type { ViagentFileTreeEntry } from './viagent-metadata';
export type { ViagentFileTreeSnapshot } from './viagent-metadata';
export type { ViagentScanConfig } from './viagent-metadata';

// ============================================================================
// Plugin Coordination Types (EPIC-0.6-01)
// ============================================================================

export type {
  SharedDocument,
  OpenDocumentInfo,
  WriteLock,
  ProcessInfo,
  DevServerInfo,
  DeferredCapabilities,
  SessionData,
  PluginCoordinationState,
  PluginCoordinationActions,
  PluginCoordinationStore,
} from './plugin-coordination.types';

export {
  DEFAULT_WRITE_LOCK_TIMEOUT,
  MAX_DEFERRED_URLS,
  MAX_OPEN_DOCUMENTS,
} from './plugin-coordination.types';
