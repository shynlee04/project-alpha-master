/**
 * Diagnostics Module Index
 * 
 * Structured observability for debugging FSA project management issues.
 * 
 * @module lib/diagnostics
 */

export * from './trace-system';
export { withDeadline, withTimeout } from './async-timeout';
export type { AsyncOperationResult } from './async-timeout';
