/**
 * @fileoverview List Providers Tool
 * @module domain/tools/provider/list-providers-tool
 *
 * TanStack AI tool for listing available LLM providers.
 * Integrates with Universal Provider Registry (EPIC-PRV).
 *
 * @epic EPIC-PRV
 * @story PRV-06 - Tool Registry Integration
 */

import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';
import type { ToolResult } from './types';
import { universalProviderRegistry } from '@/domain/services';

/**
 * Input schema for list_providers tool
 */
export const ListProvidersInputSchema = z.object({
  modality: z.enum(['text', 'image', 'tts', 'stt']).optional(),
  enabled: z.boolean().optional(),
  custom: z.boolean().optional(),
});

export type ListProvidersInput = z.infer<typeof ListProvidersInputSchema>;

/**
 * Output schema for list_providers tool
 */
export interface ListProvidersOutput {
  providers: Array<{
    id: string;
    name: string;
    description?: string;
    modalities: string[];
    hasApiKey: boolean;
    isCustom: boolean;
    enabled: boolean;
    modelCount: number;
  }>;
  count: number;
  stats: {
    totalProviders: number;
    enabledProviders: number;
    customProviders: number;
  };
}

/**
 * List providers tool definition
 */
export const listProvidersDef = toolDefinition({
  name: 'list_providers',
  description: 'List all available LLM providers with their capabilities and status. Use this to discover which providers are configured.',
  inputSchema: ListProvidersInputSchema,
});

/**
 * Create a server implementation of list_providers tool
 */
export const listProvidersServer = listProvidersDef.server(
  async (args: unknown): Promise<ToolResult<ListProvidersOutput>> => {
    try {
      const input = ListProvidersInputSchema.parse(args);
      const providers = universalProviderRegistry.list({
        modality: input.modality,
        enabled: input.enabled,
        custom: input.custom,
      });

      const stats = universalProviderRegistry.getStats();

      return {
        success: true,
        data: {
          providers: providers.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            modalities: Object.keys(p.endpoints),
            hasApiKey: p.hasApiKey,
            isCustom: p.isCustom ?? false,
            enabled: p.enabled ?? true,
            modelCount: p.models?.length ?? 0,
          })),
          count: providers.length,
          stats,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list providers',
      };
    }
  }
);
