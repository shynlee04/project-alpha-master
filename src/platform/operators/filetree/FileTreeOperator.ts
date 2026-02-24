/**
 * @fileoverview FileTree Platform Operator
 * @module @/platform/operators/filetree/FileTreeOperator
 *
 * Platform Operator adapter for FileTree functionality.
 * Implements the new IPlatformOperator interface from @/platform/types
 * while delegating to the existing plugin operator.
 *
 * Strangler Fig Pattern:
 * - Uses existing fileTreeOperator from plugins
 * - Adapts to new platform operator interface
 * - No modifications to original plugin code
 *
 * @phase R-1 (Platform Layer)
 * @task R-1-01
 * @created 2026-02-02
 */

import type { IPlatformOperator, OperatorId } from '@/platform/types';
import { fileTreeOperator as legacyOperator } from '@/plugins/filetree';

/**
 * FileTreePlatformOperator - Adapter for new platform architecture
 *
 * Wraps the existing FileTreeOperator to conform to the new
 * IPlatformOperator interface used by PlatformLayout.
 *
 * @implements {IPlatformOperator}
 *
 * @example
 * ```typescript
 * // Register with PlatformLayout
 * const operators = [fileTreePlatformOperator];
 * <PlatformLayout operators={operators}>
 *   <App />
 * </PlatformLayout>
 * ```
 */
class FileTreePlatformOperator implements IPlatformOperator {
  /**
   * Unique operator identifier
   */
  readonly id: OperatorId = 'filetree';

  /**
   * Human-readable operator name
   */
  readonly name = 'FileTree';

  /**
   * Track current project for change detection
   */
  private currentProjectId: string | null = null;

  /**
   * Track initialization state
   */
  private mounted = false;

  /**
   * Called when operator mounts with a project
   * Initializes the legacy operator if not already done
   *
   * @param projectId - The project to initialize with
   */
  onMount(projectId: string): void {
    console.log(`[FileTreePlatformOperator] Mounting with project: ${projectId}`);

    this.currentProjectId = projectId;

    // Initialize legacy operator (idempotent)
    if (!this.mounted) {
      legacyOperator.init().catch((error) => {
        console.error('[FileTreePlatformOperator] Failed to init:', error);
      });
      this.mounted = true;
    }
  }

  /**
   * Called when operator unmounts
   * Cleans up resources and subscriptions
   */
  onUnmount(): void {
    console.log('[FileTreePlatformOperator] Unmounting');

    this.currentProjectId = null;

    // Cleanup legacy operator
    if (this.mounted) {
      legacyOperator.destroy().catch((error) => {
        console.error('[FileTreePlatformOperator] Failed to destroy:', error);
      });
      this.mounted = false;
    }
  }

  /**
   * Called when active project changes
   * The legacy operator handles this via domain events
   *
   * @param newProjectId - The new project to switch to
   */
  onProjectChange(newProjectId: string): void {
    console.log(
      `[FileTreePlatformOperator] Project changing: ${this.currentProjectId} -> ${newProjectId}`
    );

    this.currentProjectId = newProjectId;

    // Legacy operator listens to project:switched domain event
    // No additional action needed - just track state
  }

  /**
   * Health check passthrough to legacy operator
   */
  async healthCheck() {
    return legacyOperator.healthCheck();
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

/**
 * Global FileTree Platform Operator instance
 *
 * Use this singleton for platform-level operator registration.
 * Adapts legacy fileTreeOperator to new platform interface.
 */
export const fileTreePlatformOperator = new FileTreePlatformOperator();

/**
 * Export class for testing/extension
 */
export { FileTreePlatformOperator };

/**
 * Also re-export the legacy operator for direct access when needed
 */
export { fileTreeOperator as legacyFileTreeOperator } from '@/plugins/filetree';
