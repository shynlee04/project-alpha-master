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
import type { AgentKnowledgeTools } from '../facades';

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
    extractedMetadata: z.record(z.string(), z.unknown()).optional(),
  }),
  timestamp: z.string(),
});

export type SynthesizeInput = z.infer<typeof SynthesizeInputSchema>;
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

      // Call knowledge tools facade
      const tools = getKnowledgeTools();
      const result = await tools.synthesize({
        sourceId: args.sourceId,
        sourceType: args.sourceType,
        title: args.title,
        content: args.content,
        mimeType: args.mimeType,
        options: args.options,
      });

      // Map SynthesisResult to SynthesizeOutput format
      return {
        success: true,
        data: {
          synthesisId: result.id,
          frontmatter: {
            summary: result.frontmatter.summary,
            keyConcepts: result.frontmatter.keyConcepts?.map(kc => `${kc.term}: ${kc.definition}`) || [],
            subject: result.frontmatter.subject || '',
            tags: result.frontmatter.tags || [],
            contentType: result.frontmatter.documentType,
            extractedMetadata: {
              documentType: result.frontmatter.documentType,
              difficultyLevel: result.frontmatter.difficultyLevel,
              estimatedStudyTimeMinutes: result.frontmatter.estimatedStudyTimeMinutes,
            },
          },
          timestamp: result.synthesizedAt,
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
