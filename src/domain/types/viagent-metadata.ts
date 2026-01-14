/**
 * @fileoverview .viagent/ Metadata Folder Types
 * @module domain/types/viagent-metadata
 *
 * **ARC-B10**: .viagent/ metadata folder structure
 *
 * Per ADR-033 Decision D8:
 * - .viagent/ at project root for metadata
 * - Never scatter metadata files
 * - Single source of truth for project metadata
 *
 * @epic EPIC-CC-ARC
 * @story ARC-B10
 * @author Team B
 * @created 2026-01-17
 */

// ============================================================================
// Types
// ============================================================================

/**
 * ViaGent project metadata version
 *
 * @remarks
 * Incremented when metadata structure changes.
 * Used for migration logic.
 */
export type ViagentVersion = '1.0.0' | '1.1.0' | '2.0.0';

/**
 * ViaGent project configuration
 *
 * @remarks
 * Stored in .viagent/project.json at project root.
 * Contains core project identity and settings.
 */
export interface ViagentProjectMetadata {
  /** Metadata schema version */
  version: ViagentVersion;

  /** Unique project identifier (matches Dexie Project.id) */
  projectId: string;

  /** Project display name */
  projectName: string;

  /** Storage type ('fsa' or 'indexeddb') */
  storageType: 'fsa' | 'indexeddb';

  /** Workspace binding configuration */
  workspaceBindings: {
    ide: boolean;
    knowledge: boolean;
    notes: boolean;
    study: boolean;
  };

  /** Project creation timestamp (ISO 8601) */
  createdAt: string;

  /** Last updated timestamp (ISO 8601) */
  updatedAt: string;

  /** ViaGent CLI version that created this project (if applicable) */
  viaGentVersion?: string;

  /** Project description (optional) */
  description?: string;

  /** Project tags */
  tags: string[];
}

/**
 * Note entry metadata
 *
 * @remarks
 * Represents a single note in the notes index.
 */
export interface ViagentNoteEntry {
  /** Unique note identifier (matches Dexie Note.id) */
  id: string;

  /** Note title */
  title: string;

  /** Relative path from project root (e.g., "notes/welcome.md") */
  path: string;

  /** Note creation timestamp (ISO 8601) */
  createdAt: string;

  /** Last modified timestamp (ISO 8601) */
  updatedAt: string;

  /** Whether note is pinned/favorited */
  isFavorite: boolean;

  /** Note folder for organization (empty string for root) */
  folder: string;

  /** Content hash for change detection (SHA-256 hex) */
  contentHash?: string;

  /** Note character count */
  charCount: number;

  /** Note block count */
  blockCount: number;
}

/**
 * Notes index metadata
 *
 * @remarks
 * Stored in .viagent/notes-index.json.
 * Maintains order, favorites, and folder structure for notes workspace.
 */
export interface ViagentNotesIndex {
  /** Metadata schema version */
  version: ViagentVersion;

  /** Project ID this index belongs to */
  projectId: string;

  /** All notes in flat array (order = display order) */
  notes: ViagentNoteEntry[];

  /** Folder structure for organizing notes */
  folders: ViagentNoteFolder[];

  /** Last updated timestamp (ISO 8601) */
  updatedAt: string;
}

/**
 * Note folder structure
 *
 * @remarks
 * Represents a folder in the notes workspace hierarchy.
 */
export interface ViagentNoteFolder {
  /** Unique folder identifier */
  id: string;

  /** Folder display name */
  name: string;

  /** Parent folder ID (null for root folders) */
  parentId: string | null;

  /** Folder creation timestamp (ISO 8601) */
  createdAt: string;

  /** Expanded state for UI */
  isExpanded: boolean;

  /** Sort order among siblings */
  order: number;
}

/**
 * File tree entry
 *
 * @remarks
 * Represents a file or directory in the cached file tree.
 */
export interface ViagentFileTreeEntry {
  /** Relative path from project root */
  path: string;

  /** Entry kind */
  kind: 'file' | 'directory';

  /** File size in bytes (0 for directories) */
  size: number;

  /** Last modified timestamp (epoch milliseconds) */
  lastModified: number;

  /** SHA-256 hash for files (for change detection) */
  hash?: string;

  /** Whether entry is excluded by patterns (e.g., node_modules) */
  isExcluded: boolean;

  /** Child entries (only for directories) */
  children?: ViagentFileTreeEntry[];
}

/**
 * File tree snapshot metadata
 *
 * @remarks
 * Stored in .viagent/file-tree-snapshot.json.
 * Cached file tree for instant project load.
 * Background refresh keeps this fresh.
 */
export interface ViagentFileTreeSnapshot {
  /** Metadata schema version */
  version: ViagentVersion;

  /** Project ID this snapshot belongs to */
  projectId: string;

  /** Root file tree entry */
  root: ViagentFileTreeEntry;

  /** Total file count (excluding excluded) */
  fileCount: number;

  /** Total directory count (excluding excluded) */
  directoryCount: number;

  /** Scan depth achieved */
  maxDepth: number;

  /** Exclusion patterns applied */
  exclusionPatterns: string[];

  /** Snapshot creation timestamp (ISO 8601) */
  createdAt: string;

  /** Whether snapshot is stale (needs refresh) */
  isStale: boolean;

  /** Scan duration in milliseconds */
  scanDurationMs: number;
}

/**
 * File tree scan configuration
 *
 * @remarks
 * Configures how file tree scanning behaves.
 */
export interface ViagentScanConfig {
  /** Maximum scan depth (default: 20, max: 50) */
  maxDepth: number;

  /** Depth at which to show warning (default: 15) */
  warningDepth: number;

  /** Maximum number of files to scan (default: 50000) */
  maxFiles: number;

  /** Whether to show scan progress */
  showProgress: boolean;
}

/**
 * ViaGent user configuration
 *
 * @remarks
 * Stored in .viagent/config.json.
 * Contains user-configurable settings for file tree and workspace behavior.
 *
 * **ARC-B08**: File tree exclusion patterns configuration
 */
export interface ViagentConfig {
  /** Metadata schema version */
  version: ViagentVersion;

  /** Project ID this config belongs to */
  projectId: string;

  /** File tree exclusion patterns (user-configurable) */
  exclusionPatterns: string[];

  /** File tree scan configuration */
  scan: ViagentScanConfig;

  /** Last updated timestamp (ISO 8601) */
  updatedAt: string;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Default exclusion patterns for file tree scanning
 *
 * @remarks
 * These patterns are always applied. Users can add more via config.json.
 */
export const DEFAULT_EXCLUSION_PATTERNS: readonly string[] = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'coverage',
  '.cache',
  '.turbo',
  'out',
  '.viagent',
] as const;

/**
 * Default file tree scan configuration
 */
export const DEFAULT_SCAN_CONFIG: ViagentScanConfig = {
  maxDepth: 20,
  warningDepth: 15,
  maxFiles: 50000,
  showProgress: true,
} as const;

/**
 * ViaGent metadata folder name
 *
 * @remarks
 * Hidden folder at project root containing all metadata.
 */
export const VIAGENT_FOLDER_NAME = '.viagent';

/**
 * ViaGent metadata file names
 */
export const VIAGENT_FILES = {
  /** Project configuration */
  PROJECT: 'project.json',

  /** Notes workspace index */
  NOTES_INDEX: 'notes-index.json',

  /** Cached file tree for fast load */
  FILE_TREE_SNAPSHOT: 'file-tree-snapshot.json',

  /** RAG vector index (optional, for local search) */
  RAG_INDEX: 'rag-index.json',

  /** User preferences (optional) */
  PREFERENCES: 'preferences.json',

  /** User-configurable settings (exclusion patterns, scan limits, etc.) */
  CONFIG: 'config.json',
} as const;

/**
 * Current metadata schema version
 */
export const CURRENT_VERSION: ViagentVersion = '1.0.0';

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create default project metadata
 *
 * @param projectId - Project ID
 * @param projectName - Project display name
 * @param storageType - Storage type ('fsa' or 'indexeddb')
 * @returns Default project metadata
 */
export function createDefaultProjectMetadata(
  projectId: string,
  projectName: string,
  storageType: 'fsa' | 'indexeddb'
): ViagentProjectMetadata {
  const now = new Date().toISOString();

  return {
    version: CURRENT_VERSION,
    projectId,
    projectName,
    storageType,
    workspaceBindings: {
      ide: storageType === 'fsa',
      knowledge: true,
      notes: true,
      study: true,
    },
    createdAt: now,
    updatedAt: now,
    tags: [],
  };
}

/**
 * Create empty notes index
 *
 * @param projectId - Project ID
 * @returns Empty notes index
 */
export function createEmptyNotesIndex(projectId: string): ViagentNotesIndex {
  return {
    version: CURRENT_VERSION,
    projectId,
    notes: [],
    folders: [],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Create initial file tree snapshot
 *
 * @param projectId - Project ID
 * @returns Initial file tree snapshot
 */
export function createInitialFileTreeSnapshot(projectId: string): ViagentFileTreeSnapshot {
  return {
    version: CURRENT_VERSION,
    projectId,
    root: {
      path: '.',
      kind: 'directory',
      size: 0,
      lastModified: Date.now(),
      isExcluded: false,
      children: [],
    },
    fileCount: 0,
    directoryCount: 0,
    maxDepth: 0,
    exclusionPatterns: [...DEFAULT_EXCLUSION_PATTERNS],
    createdAt: new Date().toISOString(),
    isStale: true,
    scanDurationMs: 0,
  };
}

/**
 * Create default user configuration
 *
 * @param projectId - Project ID
 * @param customExclusionPatterns - Optional custom exclusion patterns to add
 * @returns Default user configuration
 *
 * @remarks
 * **ARC-B08**: Creates default config with default exclusion patterns.
 * Users can add custom patterns via settings UI.
 */
export function createDefaultConfig(
  projectId: string,
  customExclusionPatterns: string[] = []
): ViagentConfig {
  const mergedPatterns = new Set([
    ...DEFAULT_EXCLUSION_PATTERNS,
    ...customExclusionPatterns,
  ]);

  return {
    version: CURRENT_VERSION,
    projectId,
    exclusionPatterns: Array.from(mergedPatterns),
    scan: { ...DEFAULT_SCAN_CONFIG },
    updatedAt: new Date().toISOString(),
  };
}
