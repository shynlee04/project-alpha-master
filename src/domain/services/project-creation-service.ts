/**
 * @fileoverview Unified Project Creation Service
 * @module domain/services/project-creation-service
 * @governance ARCH-01-02
 *
 * Consolidates 7 entry points into 2 unified paths:
 * - FSA-based creation (desktop)
 * - IndexedDB-based creation (mobile/tablet)
 *
 * Uses getPlatformContract() for platform detection and routes to appropriate implementation.
 *
 * @created 2026-01-20T12:50:00+07:00
 */

import { getPlatformContract } from '@/infrastructure/filesystem/platform-contract';
import { useProjectStore } from '@/infrastructure/persistence/stores/project/useProjectStore';
import type { CreateProjectInput } from '@/infrastructure/persistence/stores/project/project-types';
import { createProjectFromFolder } from '@/lib/workspace/fsa-persistence';
import type { CreateFromFolderOptions } from '@/lib/workspace/fsa-persistence';
import { getOrCreateBrowserModeProject } from '@/lib/workspace/browser-mode';
import { getOrCreateTempProject } from '@/lib/workspace/temp-project';

/**
 * Unified Project Creation Service
 *
 * Orchestrates project creation across platforms using Strategy Pattern.
 * Automatically routes to FSA or IndexedDB implementation based on platform detection.
 *
 * Architecture:
 * - Uses existing getPlatformContract() for platform routing
 * - Delegates to existing implementations (fsa-persistence, browser-mode)
 * - Provides unified API for all project creation scenarios
 *
 * @see ADR-033 Decision D1: Platform Detection & Routing
 */
export class ProjectCreationService {
  /**
   * Create project from wizard/form input
   *
   * Automatically routes to FSA or IndexedDB implementation
   * based on platform detection.
   *
   * @param input - Project creation input
   * @returns Created project ID
   * @throws Error if validation fails
   */
  async createProject(input: CreateProjectInput): Promise<string> {
    console.log('[ProjectCreationService] Creating project from input:', input.name);

    const platform = getPlatformContract();
    console.log('[ProjectCreationService] Detected platform:', platform);

    // Route to appropriate implementation based on platform
    if (platform.storageType === 'fsa') {
      // Desktop: Use project store directly (FSA mode)
      const projectId = await useProjectStore.getState().createProject({
        ...input,
        storageType: 'fsa',
      });
      console.log('[ProjectCreationService] Created FSA project:', projectId);
      return projectId;
    } else {
      // Mobile/Tablet: Use project store directly (IndexedDB mode)
      const projectId = await useProjectStore.getState().createProject({
        ...input,
        storageType: 'indexeddb',
      });
      console.log('[ProjectCreationService] Created IndexedDB project:', projectId);
      return projectId;
    }
  }

  /**
   * Create project from FSA folder handle
   *
   * Desktop only - requires FSA support.
   * Mobile/tablet throws error (no folder handle access).
   *
   * @param handle - File System Access API directory handle
   * @param folderName - Name of the selected folder
   * @param options - Optional creation options (workspaceBindings, autoSync, tags)
   * @returns Created project ID
   * @throws Error if platform doesn't support folder handles or handle is invalid
   */
  async createFromFolder(
    handle: FileSystemDirectoryHandle,
    folderName: string,
    options?: CreateFromFolderOptions
  ): Promise<string> {
    console.log('[ProjectCreationService] Creating project from folder:', folderName);

    const platform = getPlatformContract();

    // Verify FSA support
    if (platform.storageType !== 'fsa') {
      throw new Error(
        'Folder creation not available on mobile/tablet. ' +
        'Use createProject() to create projects on this platform.'
      );
    }

    // Delegate to existing FSA creation logic
    return createProjectFromFolder(handle, folderName, options);
  }

  /**
   * Get or create browser mode project
   *
   * Mobile/tablet only - uses IndexedDB storage.
   * Desktop throws error (use FSA folder creation instead).
   *
   * @returns Created or existing browser mode project ID
   * @throws Error if called on FSA platform
   */
  async getOrCreateBrowserModeProject(): Promise<string> {
    console.log('[ProjectCreationService] Getting/creating browser mode project');

    const platform = getPlatformContract();

    if (platform.storageType === 'fsa') {
      throw new Error(
        'Browser mode not available on desktop. Use createFromFolder() or createProject() instead.'
      );
    }

    // Delegate to existing browser mode logic and extract ID
    const project = await getOrCreateBrowserModeProject();
    if (!project) {
      throw new Error('Failed to get or create browser mode project');
    }
    return project.id;
  }

  /**
   * Get or create temp project
   *
   * DEPRECATED: Will be removed in Phase 4.
   * Projects should be explicitly created by users via hub.
   *
   * Desktop: Creates temp project for WebContainer fallback
   * Mobile/Tablet: Reuses browser mode project
   *
   * @returns Created or existing temp project ID
   */
  async getOrCreateTempProject(): Promise<string> {
    console.warn(
      '[ProjectCreationService] getOrCreateTempProject is deprecated. ' +
      'Use createProject() or getOrCreateBrowserModeProject() instead.'
    );

    const platform = getPlatformContract();

    if (platform.storageType === 'fsa') {
      // Desktop: Create temp project for WebContainer fallback
      const tempProject = await getOrCreateTempProject();
      return tempProject.id;
    } else {
      // Mobile/Tablet: Reuse browser mode project
      return this.getOrCreateBrowserModeProject();
    }
  }
}

/**
 * Export singleton instance for convenience
 * All calls should use the same instance for consistent platform detection.
 */
export const projectCreationService = new ProjectCreationService();
