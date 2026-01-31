/**
 * @fileoverview Provider Tool Types
 * @module domain/tools/provider/types
 *
 * Common types for provider tools.
 *
 * @epic EPIC-PRV
 * @story PRV-06 - Tool Registry Integration
 */

/**
 * Standard tool result type
 */
export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Re-export tool types
 */
export type {
  ListProvidersInput,
  ListProvidersOutput,
} from './list-providers-tool';

export type {
  ExecuteProviderInput,
  ExecuteProviderOutput,
} from './execute-provider-tool';

export type {
  TestProviderInput,
  TestProviderOutput,
} from './test-provider-tool';
