/**
 * @fileoverview Test Provider Tool
 * @module domain/tools/provider/test-provider-tool
 *
 * TanStack AI tool for testing provider connections.
 * Integrates with Universal Provider Registry (EPIC-PRV).
 *
 * @epic EPIC-PRV
 * @story PRV-06 - Tool Registry Integration
 */

import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';
import type { ToolResult } from './types';
import { createProviderAdapter, universalProviderRegistry } from '@/domain/services';

/**
 * Input schema for test_provider tool
 */
export const TestProviderInputSchema = z.object({
  providerId: z.string().describe('The ID of the provider to test'),
});

export type TestProviderInput = z.infer<typeof TestProviderInputSchema>;

/**
 * Output schema for test_provider tool
 */
export interface TestProviderOutput {
  success: boolean;
  latencyMs: number;
  error?: string;
  providerInfo: {
    id: string;
    name: string;
    hasApiKey: boolean;
    endpoint?: string;
  };
}

/**
 * Test provider tool definition
 */
export const testProviderDef = toolDefinition({
  name: 'test_provider',
  description: 'Test the connection to a configured LLM provider. Use this to verify that a provider is accessible and properly configured.',
  inputSchema: TestProviderInputSchema,
});

/**
 * Create a server implementation of test_provider tool
 */
export const testProviderServer = testProviderDef.server(
  async (args: unknown): Promise<ToolResult<TestProviderOutput>> => {
    try {
      const input = TestProviderInputSchema.parse(args);

      // Get provider info
      const provider = universalProviderRegistry.getConfig(input.providerId);
      if (!provider) {
        return {
          success: false,
          error: `Provider not found: ${input.providerId}`,
        };
      }

      // Create adapter and test connection
      const adapter = createProviderAdapter(input.providerId);
      const result = await adapter.testConnection();

      return {
        success: true,
        data: {
          success: result.success,
          latencyMs: result.latencyMs,
          error: result.error,
          providerInfo: {
            id: provider.id,
            name: provider.name,
            hasApiKey: provider.hasApiKey,
            endpoint: provider.endpoints.text,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to test provider',
      };
    }
  }
);
