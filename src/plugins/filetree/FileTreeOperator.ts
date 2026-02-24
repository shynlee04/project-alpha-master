/**
 * @fileoverview FileTree Platform Operator
 * @module plugins/filetree/FileTreeOperator
 *
 * FileTree Platform Operator - Manages FileTree lifecycle and synchronization.
 * Implements IPlatformOperator for consistent lifecycle management across operators.
 *
 * Key responsibilities:
 * - Subscribe to domain events for reactive tree updates
 * - Manage file-tree-store state based on file/project events
 * - Coordinate with ProjectStore for project switching
 * - Clean up subscriptions on destroy
 *
 * @epic EPIC-CC-01 - Project Space Foundation
 * @story PLAT-02 - FileTree Operator CRUD Operations
 */

import type {
  IPlatformOperator,
  OperatorHealthStatus,
} from '@/domain/interfaces/operator.interface';
import { domainEventBus } from '@/infrastructure/events/domain-event-bus';
import { useFileTreeStore } from '@/infrastructure/persistence/stores/file-tree-store';
import { useProjectStore } from '@/infrastructure/persistence/stores/project';
import type { FileEventPayload, ProjectEventPayload } from '@/domain/types/domain-events';

// ============================================================================
// FileTree Platform Operator
// ============================================================================

/**
 * FileTreeOperator - Platform Operator for file tree management
 *
 * Implements IPlatformOperator to manage:
 * - Event subscriptions for file changes (create, update, delete)
 * - Project switching event handling
 * - File tree store synchronization
 *
 * @implements {IPlatformOperator}
 *
 * @example
 * ```typescript
 * // Initialize on app startup
 * await fileTreeOperator.init();
 *
 * // Later: cleanup on shutdown
 * await fileTreeOperator.destroy();
 * ```
 */
class FileTreeOperator implements IPlatformOperator {
  /**
   * Operator name for identification
   */
  readonly name = 'FileTree';

  /**
   * Discriminator - identifies this as a Platform Operator
   */
  readonly isOperator = true as const;

  /**
   * Array of unsubscribe functions for cleanup
   */
  private unsubscribers: (() => void)[] = [];

  /**
   * Whether operator has been initialized
   */
  private initialized = false;

  // ==========================================================================
  // Lifecycle Methods
  // ==========================================================================

  /**
   * Initialize the FileTree operator
   *
   * Sets up domain event subscriptions for:
   * - file:created - Add node to tree
   * - file:deleted - Remove node from tree
   * - file:renamed - Update node in tree
   * - project:switched - Reload tree for new project
   *
   * @returns Promise that resolves when initialization is complete
   */
  async init(): Promise<void> {
    if (this.initialized) {
      console.warn('[FileTreeOperator] Already initialized, skipping');
      return;
    }

    console.log('[FileTreeOperator] Initializing...');

    // Subscribe to file events for reactive tree updates
    this.unsubscribers.push(
      domainEventBus.on('file:created', (event) => {
        this.handleFileCreated(event.payload);
      })
    );

    this.unsubscribers.push(
      domainEventBus.on('file:deleted', (event) => {
        this.handleFileDeleted(event.payload);
      })
    );

    this.unsubscribers.push(
      domainEventBus.on('file:renamed', (event) => {
        this.handleFileRenamed(event.payload);
      })
    );

    // Subscribe to project switch events
    this.unsubscribers.push(
      domainEventBus.on('project:switched', (event) => {
        this.handleProjectSwitch(event.payload);
      })
    );

    this.initialized = true;
    console.log('[FileTreeOperator] Initialized with', this.unsubscribers.length, 'event subscriptions');
  }

  /**
   * Destroy the FileTree operator
   *
   * Cleans up:
   * - Event subscriptions
   * - File tree store state
   *
   * @returns Promise that resolves when cleanup is complete
   */
  async destroy(): Promise<void> {
    console.log('[FileTreeOperator] Destroying...');

    // Unsubscribe from all events
    this.unsubscribers.forEach((unsub) => unsub());
    this.unsubscribers = [];

    // Reset the file tree store
    useFileTreeStore.getState().reset();

    this.initialized = false;
    console.log('[FileTreeOperator] Destroyed');
  }

  /**
   * Health check for operator monitoring
   *
   * @returns OperatorHealthStatus indicating operator health
   */
  async healthCheck(): Promise<OperatorHealthStatus> {
    const fileTreeState = useFileTreeStore.getState();
    const projectState = useProjectStore.getState();
    const activeProject = projectState.getActiveProject();

    return {
      healthy: this.initialized,
      message: this.initialized
        ? 'FileTree operator running'
        : 'FileTree operator not initialized',
      details: {
        initialized: this.initialized,
        subscriptionCount: this.unsubscribers.length,
        nodeCount: fileTreeState.nodes.size,
        activeProjectId: activeProject?.id ?? null,
        hasError: !!fileTreeState.error,
      },
    };
  }

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  /**
   * Handle file:created event
   *
   * Adds a new node to the file tree when a file is created.
   *
   * @param payload - File event payload with projectId and path
   */
  private handleFileCreated(payload: FileEventPayload): void {
    const activeProject = useProjectStore.getState().getActiveProject();

    // Only update tree if event is for active project
    if (!activeProject || payload.projectId !== activeProject.id) {
      return;
    }

    console.log('[FileTreeOperator] File created:', payload.path);

    // Extract parent path
    const pathParts = payload.path.split('/');
    const parentPath = pathParts.slice(0, -1).join('/') || '';

    // Add node to store
    useFileTreeStore.getState().addNode(
      {
        path: payload.path,
        kind: 'file',
        size: payload.content?.length ?? 0,
        lastModified: Date.now(),
      },
      parentPath
    );
  }

  /**
   * Handle file:deleted event
   *
   * Removes a node from the file tree when a file is deleted.
   *
   * @param payload - File event payload with projectId and path
   */
  private handleFileDeleted(payload: FileEventPayload): void {
    const activeProject = useProjectStore.getState().getActiveProject();

    // Only update tree if event is for active project
    if (!activeProject || payload.projectId !== activeProject.id) {
      return;
    }

    console.log('[FileTreeOperator] File deleted:', payload.path);

    // Remove node from store
    useFileTreeStore.getState().removeNode(payload.path);
  }

  /**
   * Handle file:renamed event
   *
   * Updates a node in the file tree when a file is renamed.
   * Removes old path and adds new path.
   *
   * @param payload - File event payload with path and previousPath
   */
  private handleFileRenamed(payload: FileEventPayload): void {
    const activeProject = useProjectStore.getState().getActiveProject();

    // Only update tree if event is for active project
    if (!activeProject || payload.projectId !== activeProject.id) {
      return;
    }

    console.log('[FileTreeOperator] File renamed:', payload.previousPath, '->', payload.path);

    // Remove old node
    if (payload.previousPath) {
      useFileTreeStore.getState().removeNode(payload.previousPath);
    }

    // Add new node
    const pathParts = payload.path.split('/');
    const parentPath = pathParts.slice(0, -1).join('/') || '';

    useFileTreeStore.getState().addNode(
      {
        path: payload.path,
        kind: 'file',
        size: 0,
        lastModified: Date.now(),
      },
      parentPath
    );
  }

  /**
   * Handle project:switched event
   *
   * Resets the file tree store when user switches projects.
   * The new tree will be loaded by the component's useEffect.
   *
   * @param payload - Project event payload with projectId
   */
  private handleProjectSwitch(payload: ProjectEventPayload): void {
    console.log('[FileTreeOperator] Project switched to:', payload.projectId);

    // Reset the tree state - new data will be loaded by component
    useFileTreeStore.getState().reset();
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

/**
 * Global FileTreeOperator instance
 *
 * Use this singleton for FileTree lifecycle management.
 * Initialize on app startup, destroy on shutdown.
 */
export const fileTreeOperator = new FileTreeOperator();

/**
 * Export class for testing/extension
 */
export { FileTreeOperator };
