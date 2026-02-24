/**
 * @fileoverview Platform Operator Interface
 * @module domain/interfaces/operator.interface
 *
 * Defines the lifecycle interface for Platform Operators.
 * Platform Operators (FileTree, Chat-Cascade) are always-on infrastructure
 * that manages core application functionality.
 *
 * Key distinction:
 * - Platform Operators implement this interface (always-on, infrastructure)
 * - Feature Modules (Monaco, Notes, Terminal) do NOT implement this interface
 *
 * @epic EPIC-CC-01 - Project Space Foundation
 * @story PS-01 - Platform Operator Architecture
 */

// ============================================================================
// Health Check Types
// ============================================================================

/**
 * Health check result from an operator
 */
export interface OperatorHealthStatus {
  /** Whether the operator is healthy */
  healthy: boolean;
  /** Optional message describing the health status */
  message?: string;
  /** Additional details (metrics, diagnostics) */
  details?: Record<string, unknown>;
}

// ============================================================================
// Platform Operator Interface
// ============================================================================

/**
 * IPlatformOperator - Lifecycle interface for Platform Operators
 *
 * Platform Operators are always-on infrastructure components that:
 * - Initialize on app startup
 * - Clean up on app shutdown
 * - Provide core functionality (file tree, chat, etc.)
 *
 * @example
 * ```typescript
 * class FileTreeOperator implements IPlatformOperator {
 *   readonly name = 'FileTree';
 *   readonly isOperator = true;
 *
 *   async init(): Promise<void> {
 *     // Subscribe to file events, initialize cache
 *   }
 *
 *   async destroy(): Promise<void> {
 *     // Cleanup subscriptions, flush pending operations
 *   }
 *
 *   async healthCheck(): Promise<OperatorHealthStatus> {
 *     return { healthy: true, message: 'FileTree operational' };
 *   }
 * }
 * ```
 */
export interface IPlatformOperator {
  /**
   * Unique name identifying this operator
   */
  readonly name: string;

  /**
   * Discriminator - operators are always-on infrastructure
   * This distinguishes Platform Operators from Feature Modules
   */
  readonly isOperator: true;

  /**
   * Initialize the operator
   * Called during app startup to set up:
   * - Storage adapter connections
   * - Event subscriptions
   * - Initial state hydration
   *
   * @returns Promise that resolves when initialization is complete
   */
  init(): Promise<void>;

  /**
   * Destroy the operator
   * Called during app shutdown to:
   * - Unsubscribe from events
   * - Flush pending operations
   * - Release resources
   *
   * @returns Promise that resolves when cleanup is complete
   */
  destroy(): Promise<void>;

  /**
   * Optional health check for monitoring
   * Used to verify operator is functioning correctly
   *
   * @returns Promise with health status
   */
  healthCheck?(): Promise<OperatorHealthStatus>;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if an object is a Platform Operator
 */
export function isPlatformOperator(obj: unknown): obj is IPlatformOperator {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'isOperator' in obj &&
    (obj as IPlatformOperator).isOperator === true &&
    'name' in obj &&
    typeof (obj as IPlatformOperator).name === 'string' &&
    'init' in obj &&
    typeof (obj as IPlatformOperator).init === 'function' &&
    'destroy' in obj &&
    typeof (obj as IPlatformOperator).destroy === 'function'
  );
}
