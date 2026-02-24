/**
 * @fileoverview Process URL Tool - Web Content Understanding Agent Tool
 * @module lib/agent/tools/process-url-tool
 *
 * Agent tool for processing web page content with Gemini API.
 * Extracts clean content, metadata, summaries, tags, and related links.
 *
 * @governance EPIC-38, PHASE-5
 * @story KSI Agent Integration
 */

import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';
import type { ToolResult } from './types';
import type { AgentKnowledgeTools } from '../facades';

/**
 * URL processing input schema
 */
const ProcessURLInputSchema = z.object({
  url: z.string().url().describe('URL to process'),
  htmlContent: z.string().describe('HTML content of the page'),
  options: z.object({
    generateSummary: z.boolean().optional().default(true),
    inferMetadata: z.boolean().optional().default(true),
    detectLinks: z.boolean().optional().default(true),
  }).optional().describe('Processing options'),
});

/**
 * URL processing output schema
 */
const ProcessURLOutputSchema = z.object({
  cleanContent: z.string().describe('Main content with nav/ads removed'),
  title: z.string().describe('Page title'),
  author: z.string().optional(),
  publishedDate: z.string().optional(),
  contentType: z.string().optional(),
  readingTimeMinutes: z.number().optional(),
  summary: z.string().optional().describe('3-5 sentence summary'),
  tags: z.array(z.string()).optional(),
  relatedLinks: z.array(z.object({
    url: z.string(),
    title: z.string().optional(),
    relevance: z.enum(['high', 'medium', 'low']),
  })).optional(),
  mainImageUrl: z.string().optional(),
});

export type ProcessURLInput = z.infer<typeof ProcessURLInputSchema>;
export type ProcessURLOutput = z.infer<typeof ProcessURLOutputSchema>;

/**
 * Process URL tool definition
 */
export const processURLDef = toolDefinition({
  name: 'process_url',
  description: 'Process a web page URL to extract clean content, metadata (author, date, content type), generate a summary, infer relevant tags, and detect related links using AI-powered content understanding. Use this when ingesting web articles or online resources into the knowledge base.',
  inputSchema: ProcessURLInputSchema,
  needsApproval: false, // URL processing is safe, no destructive operations
});

/**
 * Create client-side URL processing tool implementation
 *
 * @param getKnowledgeTools - Function to get knowledge tools facade
 * @returns TanStack AI tool client implementation
 */
export function createProcessURLClientTool(getKnowledgeTools: () => AgentKnowledgeTools) {
  return processURLDef.client(async (input: unknown): Promise<ToolResult<ProcessURLOutput>> => {
    const args = input as ProcessURLInput;

    try {
      // Validate inputs
      if (!args.url) {
        return {
          success: false,
          error: 'URL is required',
        };
      }

      if (!args.htmlContent) {
        return {
          success: false,
          error: 'HTML content is required',
        };
      }

      // Call knowledge tools facade
      const tools = getKnowledgeTools();
      const result = await tools.processURL(args.url, args.htmlContent, args.options);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown URL processing error';
      console.error('[ProcessURLTool] Error:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  });
}
