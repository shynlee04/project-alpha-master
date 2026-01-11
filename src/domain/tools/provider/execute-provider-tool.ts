/**
 * @fileoverview Execute Provider Tool
 * @module domain/tools/provider/execute-provider-tool
 *
 * TanStack AI tool for executing requests through LLM providers.
 * Integrates with Universal Adapter Factory (EPIC-PRV).
 *
 * @epic EPIC-PRV
 * @story PRV-06 - Tool Registry Integration
 */

import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';
import type { ToolResult } from './types';
import { executeProviderRequest } from '@/domain/services';
import type { ModalityType } from '@/domain/types/llm/provider-types';

/**
 * Input schema for execute_provider tool
 */
export const ExecuteProviderInputSchema = z.object({
  providerId: z.string().describe('The ID of the provider to use'),
  model: z.string().describe('The model identifier to use'),
  modality: z.enum(['text', 'image', 'tts', 'stt']).describe('The modality type'),
  input: z.string().describe('The input for the model (prompt, text, audio, etc.)'),
  parameters: z.object({
    maxTokens: z.number().optional(),
    temperature: z.number().optional(),
    stream: z.boolean().optional(),
  }).optional(),
});

export type ExecuteProviderInput = z.infer<typeof ExecuteProviderInputSchema>;

/**
 * Output schema for execute_provider tool
 */
export interface ExecuteProviderOutput {
  result: unknown;
  latencyMs: number;
  statusCode?: number;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

/**
 * Execute provider tool definition
 */
export const executeProviderDef = toolDefinition({
  name: 'execute_provider',
  description: 'Execute a request through a configured LLM provider. Supports text generation, image generation, text-to-speech, and speech-to-text based on the provider capabilities.',
  inputSchema: ExecuteProviderInputSchema,
});

/**
 * Create a server implementation of execute_provider tool
 */
export const executeProviderServer = executeProviderDef.server(
  async (args: unknown): Promise<ToolResult<ExecuteProviderOutput>> => {
    try {
      const input = ExecuteProviderInputSchema.parse(args);

      // Build request payload
      const payload = buildRequestPayload(input.modality, input.input);

      // Execute request
      const result = await executeProviderRequest({
        providerId: input.providerId,
        model: input.model,
        modality: input.modality as ModalityType,
        payload,
        parameters: input.parameters,
      });

      if (!result.success) {
        return {
          success: false,
          error: result.error ?? 'Provider request failed',
        };
      }

      // Extract usage info if present
      const usage = extractUsageInfo(result.data);

      return {
        success: true,
        data: {
          result: result.data,
          latencyMs: result.latencyMs,
          statusCode: result.statusCode,
          usage,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute provider request',
      };
    }
  }
);

/**
 * Build request payload based on modality
 */
function buildRequestPayload(modality: string, input: string): unknown {
  switch (modality) {
    case 'text':
      return {
        model: '',
        messages: [{ role: 'user', content: input }],
      };
    case 'image':
      return {
        model: '',
        prompt: input,
        width: 1024,
        height: 1024,
      };
    case 'tts':
      return {
        text: input,
        speed: 1.0,
      };
    case 'stt':
      return {
        audio_b64: input,
        language: null,
      };
    default:
      return { input };
  }
}

/**
 * Extract usage information from response data
 */
function extractUsageInfo(data: unknown): ExecuteProviderOutput['usage'] {
  if (typeof data === 'object' && data !== null && '_usage' in data) {
    const usage = (data as { _usage: unknown })._usage;
    if (typeof usage === 'object' && usage !== null) {
      return {
        promptTokens: 'promptTokens' in usage ? Number(usage.promptTokens) : undefined,
        completionTokens: 'completionTokens' in usage ? Number(usage.completionTokens) : undefined,
        totalTokens: 'totalTokens' in usage ? Number(usage.totalTokens) : undefined,
      };
    }
  }
  return undefined;
}
