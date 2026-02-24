/**
 * Platform Operator interfaces
 * @module @/platform/types/operator
 *
 * Operators are ALWAYS running - they ARE the platform
 * They represent core platform functionality that persists across projects
 */

/**
 * Operator identifiers
 * Operators are platform-level components, not workspace-bound
 */
export type OperatorId = 'filetree' | 'chat';

/**
 * Platform Operator interface
 * Operators are always-on platform components that respond to project changes
 */
export interface IPlatformOperator {
  /** Unique operator identifier */
  id: OperatorId;
  /** Human-readable operator name */
  name: string;

  // Lifecycle methods

  /**
   * Called when operator mounts with a project
   * @param projectId - The project to initialize with
   */
  onMount(projectId: string): void;

  /**
   * Called when operator unmounts
   * Clean up resources and subscriptions
   */
  onUnmount(): void;

  /**
   * Called when active project changes
   * @param newProjectId - The new project to switch to
   */
  onProjectChange(newProjectId: string): void;
}

/**
 * Props for operator React components
 * Used when rendering operator UI
 */
export interface OperatorProps {
  /** Current active project ID */
  projectId: string;
  /** Optional CSS class for styling */
  className?: string;
}
