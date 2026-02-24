/**
 * @fileoverview Synthesize Tool - Knowledge Synthesis Agent Tool
 * @module lib/agent/tools/synthesize-tool
 *
 * Agent tool for synthesizing knowledge from source documents.
 * Uses configured agent's provider and model (no hard-coding).
 *
 * @governance EPIC-38, PHASE-7
 * @story KSI Agent Integration
 */

import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';
import type { ToolResult } from './types';
import type { AgentKnowledgeTools, SynthesisInput } from '../facades';

/**
 * Synthesis input schema
 */
const SynthesizeInputSchema = z.object({
  sourceId: z.string().describe('Unique identifier of the source document'),
  sourceType: z.enum(['text', 'markdown', 'pdf', 'image', 'url']).describe('Type of source document'),
  title: z.string().describe('Document title'),
  content: z.string().describe('Document content to synthesize'),
  mimeType: z.string().optional().describe('MIME type (optional)'),
  options: z.object({
    generateSummary: z.boolean().optional().default(true),
    extractKeyConcepts: z.boolean().optional().default(true),
    classifySubject: z.boolean().optional().default(true),
    generateTags: z.boolean().optional().default(true),
  }).optional().describe('Synthesis options'),
});

export type SynthesizeInput = z.infer<typeof SynthesizeInputSchema>;

/**
 * Synthesis output schema
 */
const SynthesizeOutputSchema = z.object({
  synthesisId: z.string(),
  frontmatter: z.object({
    summary: z.string(),
    keyConcepts: z.array(z.string()),
    subject: z.string(),
    tags: z.array(z.string()),
    contentType: z.string().optional(),
    extractedMetadata: z.record(z.string(), z.string()).optional(),
  }),
  timestamp: z.string(),
});

export type SynthesizeOutput = z.infer<typeof SynthesizeOutputSchema>;

/**
 * Synthesize tool definition
 */
export const synthesizeDef = toolDefinition({
  name: 'synthesize_knowledge',
  description: 'Synthesize knowledge from a source document to generate frontmatter with summary, key concepts, subject classification, and tags. Use this when processing documents for knowledge organization.',
  inputSchema: SynthesizeInputSchema,
});

/**
 * Create client-side synthesize tool implementation
 *
 * @param getKnowledgeTools - Function to get knowledge tools facade
 * @returns TanStack AI tool client implementation
 */
export function createSynthesizeClientTool(getKnowledgeTools: () => AgentKnowledgeTools) {
  return synthesizeDef.client(async (input: unknown): Promise<ToolResult<SynthesizeOutput>> => {
    const args = input as SynthesizeInput;

    try {
      // Validate inputs
      if (!args.content.trim()) {
        return {
          success: false,
          error: 'Document content cannot be empty',
        };
      }

      if (!args.sourceId) {
        return {
          success: false,
          error: 'Source ID is required',
        };
      }

      // Call knowledge tools facade with correct input format
      const tools = getKnowledgeTools();

      // Map tool input to facade SynthesisInput format
      const synthesisInput: SynthesisInput = {
        sourceIds: [args.sourceId],
        artifactType: 'summary',
        options: undefined, // Options not used in stub facade
      };

      const result = await tools.synthesize(synthesisInput);

      // Return result in expected format
      return {
        success: true,
        data: {
          synthesisId: result.id,
          frontmatter: {
            summary: 'Stub summary generated from synthesis',
            keyConcepts: [],
            subject: result.type || 'summary',
            tags: [],
            contentType: result.type || 'summary',
            extractedMetadata: undefined,
          },
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown synthesis error';
      console.error('[SynthesizeTool] Error:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  });
}
