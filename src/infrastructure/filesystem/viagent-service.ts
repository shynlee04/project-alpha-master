/**
 * @fileoverview .viagent/ Metadata Service
 * @module infrastructure/filesystem/viagent-service
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

import type { StorageGateway } from '@/domain/interfaces/storage-gateway.interface';
import type {
  ViagentProjectMetadata,
  ViagentNotesIndex,
  ViagentFileTreeSnapshot,
  ViagentNoteEntry,
  ViagentConfig,
} from '@/domain/types/viagent-metadata';
import {
  VIAGENT_FOLDER_NAME,
  VIAGENT_FILES,
  createDefaultProjectMetadata,
  createEmptyNotesIndex,
  createInitialFileTreeSnapshot,
  createDefaultConfig,
} from '@/domain/types/viagent-metadata';

// ============================================================================
// Types
// ============================================================================

/**
 * Result of metadata file operation
 */
export interface MetadataResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * ViaGent metadata service initialization options
 */
export interface ViagentInitOptions {
  /** Project ID */
  projectId: string;
  /** Project name */
  projectName: string;
  /** Storage type ('fsa' or 'indexeddb') */
  storageType: 'fsa' | 'indexeddb';
  /** Workspace bindings (optional, uses defaults if not provided) */
  workspaceBindings?: {
    ide: boolean;
    knowledge: boolean;
    notes: boolean;
    study: boolean;
  };
}

// ============================================================================
// ViaGent Metadata Service
// ============================================================================

/**
 * ViaGent Metadata Service
 *
 * @remarks
 * Manages .viagent/ folder metadata for projects.
 * All metadata operations go through this service.
 *
 * Per ADR-033 Decision D8:
 * - .viagent/project.json - Project configuration
 * - .viagent/notes-index.json - Notes workspace metadata
 * - .viagent/file-tree-snapshot.json - Cached file tree
 *
 * @example
 * ```ts
 * const gateway = storageGatewayFactory.createFSAGateway(handle);
 * const service = new ViagentService(gateway);
 *
 * // Initialize metadata folder
 * await service.initialize({
 *   projectId: 'ide:proj_123',
 *   projectName: 'My Project',
 *   storageType: 'fsa',
 * });
 *
 * // Read project metadata
 * const metadata = await service.readProjectMetadata();
 *
 * // Update notes index
 * await service.updateNotesIndex((index) => ({
 *   ...index,
 *   notes: [...index.notes, newNote],
 *   updatedAt: new Date().toISOString(),
 * }));
 * ```
 */
export class ViagentService {
  private readonly gateway: StorageGateway;
  private readonly projectId: string;

  /**
   * Create ViaGent metadata service
   *
   * @param gateway - Storage gateway for file operations
   * @param projectId - Project ID
   */
  constructor(gateway: StorageGateway, projectId: string) {
    this.gateway = gateway;
    this.projectId = projectId;
  }

  // ========================================================================
  // Initialization
  // ========================================================================

  /**
   * Initialize .viagent/ folder with default metadata files
   *
   * @param options - Initialization options
   * @returns Success result
   *
   * @remarks
   * Creates the following structure:
   * .viagent/
   * ├── project.json
   * ├── notes-index.json
   * ├── file-tree-snapshot.json
   * └── config.json
   */
  async initialize(options: ViagentInitOptions): Promise<MetadataResult<void>> {
    try {
      // Create .viagent/ directory marker file (directories implicit in path)
      const folderMarkerPath = `${VIAGENT_FOLDER_NAME}/.gitkeep`;

      // Create default project metadata
      const projectMetadata = createDefaultProjectMetadata(
        options.projectId,
        options.projectName,
        options.storageType
      );

      // Apply custom workspace bindings if provided
      if (options.workspaceBindings) {
        projectMetadata.workspaceBindings = options.workspaceBindings;
      }

      // Create empty notes index
      const notesIndex = createEmptyNotesIndex(options.projectId);

      // Create initial file tree snapshot
      const fileTreeSnapshot = createInitialFileTreeSnapshot(options.projectId);

      // Create default config (ARC-B08)
      const defaultConfig = createDefaultConfig(options.projectId);

      // Write all metadata files
      await Promise.all([
        this.writeProjectMetadata(projectMetadata),
        this.writeNotesIndex(notesIndex),
        this.writeFileTreeSnapshot(fileTreeSnapshot),
        this.writeConfig(defaultConfig),
        this.gateway.write(folderMarkerPath, new Uint8Array()), // Marker file
      ]);

      console.log('[ViagentService] Initialized .viagent/ folder for project:', options.projectId);

      return { success: true };
    } catch (error) {
      const err = error as Error;
      console.error('[ViagentService] Failed to initialize:', err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Check if .viagent/ folder exists
   *
   * @returns true if metadata folder exists
   */
  async exists(): Promise<boolean> {
    return await this.gateway.exists(`${VIAGENT_FOLDER_NAME}/${VIAGENT_FILES.PROJECT}`);
  }

  // ========================================================================
  // Project Metadata (project.json)
  // ========================================================================

  /**
   * Read project metadata
   *
   * @returns Project metadata or error
   */
  async readProjectMetadata(): Promise<MetadataResult<ViagentProjectMetadata>> {
    try {
      const path = this.getProjectPath();
      const data = await this.gateway.read(path);
      const text = new TextDecoder().decode(data);
      const metadata = JSON.parse(text) as ViagentProjectMetadata;

      // Validate required fields
      if (!metadata.projectId || metadata.projectId !== this.projectId) {
        throw new Error(`Project ID mismatch: expected ${this.projectId}, got ${metadata.projectId}`);
      }

      return { success: true, data: metadata };
    } catch (error) {
      const err = error as Error;
      return { success: false, error: err.message };
    }
  }

  /**
   * Write project metadata
   *
   * @param metadata - Project metadata to write
   * @returns Success result
   */
  async writeProjectMetadata(metadata: ViagentProjectMetadata): Promise<MetadataResult<void>> {
    try {
      // Update timestamp
      metadata.updatedAt = new Date().toISOString();

      const path = this.getProjectPath();
      const text = JSON.stringify(metadata, null, 2);
      const data = new TextEncoder().encode(text);

      await this.gateway.write(path, data);

      return { success: true };
    } catch (error) {
      const err = error as Error;
      return { success: false, error: err.message };
    }
  }

  /**
   * Update project metadata
   *
   * @param updater - Function to update metadata
   * @returns Success result
   */
  async updateProjectMetadata(
    updater: (current: ViagentProjectMetadata) => ViagentProjectMetadata
  ): Promise<MetadataResult<void>> {
    const result = await this.readProjectMetadata();
    if (!result.success || !result.data) {
      return { success: false, error: 'Failed to read current metadata' };
    }

    const updated = updater(result.data);
    return await this.writeProjectMetadata(updated);
  }

  // ========================================================================
  // Notes Index (notes-index.json)
  // ========================================================================

  /**
   * Read notes index
   *
   * @returns Notes index or error
   */
  async readNotesIndex(): Promise<MetadataResult<ViagentNotesIndex>> {
    try {
      const path = this.getNotesIndexPath();
      const data = await this.gateway.read(path);
      const text = new TextDecoder().decode(data);
      const index = JSON.parse(text) as ViagentNotesIndex;

      // Validate project ID
      if (index.projectId !== this.projectId) {
        throw new Error(`Project ID mismatch in notes index`);
      }

      return { success: true, data: index };
    } catch (error) {
      const err = error as Error;
      return { success: false, error: err.message };
    }
  }

  /**
   * Write notes index
   *
   * @param index - Notes index to write
   * @returns Success result
   */
  async writeNotesIndex(index: ViagentNotesIndex): Promise<MetadataResult<void>> {
    try {
      // Update timestamp
      index.updatedAt = new Date().toISOString();

      const path = this.getNotesIndexPath();
      const text = JSON.stringify(index, null, 2);
      const data = new TextEncoder().encode(text);

      await this.gateway.write(path, data);

      return { success: true };
    } catch (error) {
      const err = error as Error;
      return { success: false, error: err.message };
    }
  }

  /**
   * Update notes index
   *
   * @param updater - Function to update index
   * @returns Success result
   */
  async updateNotesIndex(
    updater: (current: ViagentNotesIndex) => ViagentNotesIndex
  ): Promise<MetadataResult<void>> {
    const result = await this.readNotesIndex();
    if (!result.success || !result.data) {
      return { success: false, error: 'Failed to read current notes index' };
    }

    const updated = updater(result.data);
    return await this.writeNotesIndex(updated);
  }

  /**
   * Add note to index
   *
   * @param note - Note entry to add
   * @returns Success result
   */
  async addNoteToIndex(note: ViagentNoteEntry): Promise<MetadataResult<void>> {
    return await this.updateNotesIndex((index) => ({
      ...index,
      notes: [...index.notes, note],
      updatedAt: new Date().toISOString(),
    }));
  }

  /**
   * Remove note from index
   *
   * @param noteId - Note ID to remove
   * @returns Success result
   */
  async removeNoteFromIndex(noteId: string): Promise<MetadataResult<void>> {
    return await this.updateNotesIndex((index) => ({
      ...index,
      notes: index.notes.filter((n) => n.id !== noteId),
      updatedAt: new Date().toISOString(),
    }));
  }

  /**
   * Toggle note favorite status
   *
   * @param noteId - Note ID to toggle
   * @returns Success result
   */
  async toggleNoteFavorite(noteId: string): Promise<MetadataResult<void>> {
    return await this.updateNotesIndex((index) => ({
      ...index,
      notes: index.notes.map((n) =>
        n.id === noteId ? { ...n, isFavorite: !n.isFavorite } : n
      ),
      updatedAt: new Date().toISOString(),
    }));
  }

  // ========================================================================
  // File Tree Snapshot (file-tree-snapshot.json)
  // ========================================================================

  /**
   * Read file tree snapshot
   *
   * @returns File tree snapshot or error
   */
  async readFileTreeSnapshot(): Promise<MetadataResult<ViagentFileTreeSnapshot>> {
    try {
      const path = this.getFileTreeSnapshotPath();
      const data = await this.gateway.read(path);
      const text = new TextDecoder().decode(data);
      const snapshot = JSON.parse(text) as ViagentFileTreeSnapshot;

      // Validate project ID
      if (snapshot.projectId !== this.projectId) {
        throw new Error(`Project ID mismatch in file tree snapshot`);
      }

      return { success: true, data: snapshot };
    } catch (error) {
      const err = error as Error;
      return { success: false, error: err.message };
    }
  }

  /**
   * Write file tree snapshot
   *
   * @param snapshot - File tree snapshot to write
   * @returns Success result
   */
  async writeFileTreeSnapshot(snapshot: ViagentFileTreeSnapshot): Promise<MetadataResult<void>> {
    try {
      const path = this.getFileTreeSnapshotPath();
      const text = JSON.stringify(snapshot, null, 2);
      const data = new TextEncoder().encode(text);

      await this.gateway.write(path, data);

      return { success: true };
    } catch (error) {
      const err = error as Error;
      return { success: false, error: err.message };
    }
  }

  /**
   * Mark file tree snapshot as stale
   *
   * @returns Success result
   */
  async markSnapshotStale(): Promise<MetadataResult<void>> {
    const result = await this.readFileTreeSnapshot();
    if (!result.success || !result.data) {
      return { success: false, error: 'Failed to read current snapshot' };
    }

    const updated = { ...result.data, isStale: true };
    return await this.writeFileTreeSnapshot(updated);
  }

  /**
   * Mark file tree snapshot as fresh
   *
   * @returns Success result
   */
  async markSnapshotFresh(): Promise<MetadataResult<void>> {
    const result = await this.readFileTreeSnapshot();
    if (!result.success || !result.data) {
      return { success: false, error: 'Failed to read current snapshot' };
    }

    const updated = { ...result.data, isStale: false };
    return await this.writeFileTreeSnapshot(updated);
  }

  // ========================================================================
  // User Configuration (config.json)
  // ========================================================================

  /**
   * Read user configuration
   *
   * @returns User configuration or error
   *
   * @remarks
   * **ARC-B08**: Reads .viagent/config.json for user-configurable settings.
   * If config doesn't exist, returns default config.
   */
  async readConfig(): Promise<MetadataResult<ViagentConfig>> {
    try {
      const path = this.getConfigPath();
      const exists = await this.gateway.exists(path);

      // Return default config if file doesn't exist yet
      if (!exists) {
        const defaultConfig = createDefaultConfig(this.projectId);
        return { success: true, data: defaultConfig };
      }

      const data = await this.gateway.read(path);
      const text = new TextDecoder().decode(data);
      const config = JSON.parse(text) as ViagentConfig;

      // Validate project ID
      if (config.projectId !== this.projectId) {
        throw new Error(`Project ID mismatch in config`);
      }

      return { success: true, data: config };
    } catch (error) {
      const err = error as Error;
      // On error, return default config rather than failing
      console.warn('[ViagentService] Failed to read config, using defaults:', err.message);
      const defaultConfig = createDefaultConfig(this.projectId);
      return { success: true, data: defaultConfig };
    }
  }

  /**
   * Write user configuration
   *
   * @param config - User configuration to write
   * @returns Success result
   *
   * @remarks
   * **ARC-B08**: Writes .viagent/config.json with user-configurable settings.
   */
  async writeConfig(config: ViagentConfig): Promise<MetadataResult<void>> {
    try {
      // Update timestamp
      config.updatedAt = new Date().toISOString();

      const path = this.getConfigPath();
      const text = JSON.stringify(config, null, 2);
      const data = new TextEncoder().encode(text);

      await this.gateway.write(path, data);

      return { success: true };
    } catch (error) {
      const err = error as Error;
      return { success: false, error: err.message };
    }
  }

  /**
   * Update user configuration
   *
   * @param updater - Function to update config
   * @returns Success result
   */
  async updateConfig(
    updater: (current: ViagentConfig) => ViagentConfig
  ): Promise<MetadataResult<void>> {
    const result = await this.readConfig();
    if (!result.success || !result.data) {
      return { success: false, error: 'Failed to read current config' };
    }

    const updated = updater(result.data);
    return await this.writeConfig(updated);
  }

  /**
   * Add exclusion pattern to config
   *
   * @param pattern - Pattern to add
   * @returns Success result
   *
   * @remarks
   * **ARC-B08**: Adds a user-configured exclusion pattern.
   */
  async addExclusionPattern(pattern: string): Promise<MetadataResult<void>> {
    return await this.updateConfig((config) => {
      const patterns = new Set(config.exclusionPatterns);
      patterns.add(pattern);
      return {
        ...config,
        exclusionPatterns: Array.from(patterns),
        updatedAt: new Date().toISOString(),
      };
    });
  }

  /**
   * Remove exclusion pattern from config
   *
   * @param pattern - Pattern to remove
   * @returns Success result
   */
  async removeExclusionPattern(pattern: string): Promise<MetadataResult<void>> {
    return await this.updateConfig((config) => {
      const patterns = new Set(config.exclusionPatterns);
      patterns.delete(pattern);
      return {
        ...config,
        exclusionPatterns: Array.from(patterns),
        updatedAt: new Date().toISOString(),
      };
    });
  }

  /**
   * Get exclusion patterns from config
   *
   * @returns Array of exclusion patterns
   *
   * @remarks
   * **ARC-B08**: Returns merged default + user-configured patterns.
   */
  async getExclusionPatterns(): Promise<string[]> {
    const result = await this.readConfig();
    return result.data?.exclusionPatterns ?? [...createDefaultConfig(this.projectId).exclusionPatterns];
  }

  // ========================================================================
  // Utility Methods
  // ========================================================================

  /**
   * Get project.json path
   */
  private getProjectPath(): string {
    return `${VIAGENT_FOLDER_NAME}/${VIAGENT_FILES.PROJECT}`;
  }

  /**
   * Get notes-index.json path
   */
  private getNotesIndexPath(): string {
    return `${VIAGENT_FOLDER_NAME}/${VIAGENT_FILES.NOTES_INDEX}`;
  }

  /**
   * Get file-tree-snapshot.json path
   */
  private getFileTreeSnapshotPath(): string {
    return `${VIAGENT_FOLDER_NAME}/${VIAGENT_FILES.FILE_TREE_SNAPSHOT}`;
  }

  /**
   * Get config.json path
   */
  private getConfigPath(): string {
    return `${VIAGENT_FOLDER_NAME}/${VIAGENT_FILES.CONFIG}`;
  }

  /**
   * Get all metadata file paths
   */
  getMetadataPaths(): string[] {
    return [
      this.getProjectPath(),
      this.getNotesIndexPath(),
      this.getFileTreeSnapshotPath(),
      this.getConfigPath(),
    ];
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create ViaGent metadata service for a project
 *
 * @param gateway - Storage gateway
 * @param projectId - Project ID
 * @returns ViagentService instance
 */
export function createViagentService(
  gateway: StorageGateway,
  projectId: string
): ViagentService {
  return new ViagentService(gateway, projectId);
}

/**
 * Initialize .viagent/ folder for a new project
 *
 * @param gateway - Storage gateway
 * @param options - Initialization options
 * @returns Success result
 */
export async function initializeViagentFolder(
  gateway: StorageGateway,
  options: ViagentInitOptions
): Promise<MetadataResult<void>> {
  const service = createViagentService(gateway, options.projectId);
  return await service.initialize(options);
}
