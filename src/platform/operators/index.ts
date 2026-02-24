/**
 * @fileoverview Platform Operators - Domain-specific operation handlers
 *
 * Operators are the primary abstraction for domain logic in the platform layer.
 * Each operator encapsulates a specific domain (filetree, chat, etc.) and provides:
 * - State management (via Zustand stores)
 * - Business logic operations
 * - Integration with platform core services
 *
 * This barrel file re-exports all operators for convenient access.
 *
 * @module platform/operators
 * @layer platform
 *
 * @example
 * import { filetreeOperator, chatOperator } from '@/platform/operators';
 */

// Phase R-1: Platform Operators
// export * from './filetree';  // TODO: R-1-03
export * from './chat';
