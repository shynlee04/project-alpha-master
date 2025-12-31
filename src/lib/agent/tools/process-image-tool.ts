/**
 * @fileoverview Process Image Tool - Image Understanding Agent Tool
 * @module lib/agent/tools/process-image-tool
 *
 * Agent tool for processing images with Gemini vision API.
 * Extracts text (OCR), descriptions, detected objects, and visual elements.
 *
 * @governance EPIC-38, PHASE-5
 * @story KSI Agent Integration
 */

import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';
import type { ToolResult } from './types';
import type { AgentKnowledgeTools } from '../facades';

/**
 * Image processing input schema
 */
const ProcessImageInputSchema = z.object({
  file: z.instanceof(File).describe('Image file to process'),
  base64Content: z.string().describe('Base64-encoded image content'),
  options: z.object({
    extractText: z.boolean().optional().default(true),
    generateDescription: z.boolean().optional().default(true),
    detectObjects: z.boolean().optional().default(true),
    detectHandwriting: z.boolean().optional().default(true),
  }).optional().describe('Processing options'),
});

/**
 * Image processing output schema
 */
const ProcessImageOutputSchema = z.object({
  extractedText: z.string().describe('Text extracted via OCR'),
  description: z.string().describe('Visual description of image content'),
  detectedObjects: z.array(z.object({
    name: z.string(),
    confidence: z.number().optional(),
  })).optional().describe('Objects detected in image'),
  isHandwriting: z.boolean().optional().describe('Whether image contains handwriting'),
  metadata: z.object({
    mimeType: z.string(),
    width: z.number().optional(),
    height: z.number().optional(),
  }).optional(),
});

export type ProcessImageInput = z.infer<typeof ProcessImageInputSchema>;
export type ProcessImageOutput = z.infer<typeof ProcessImageOutputSchema>;

/**
 * Process image tool definition
 */
export const processImageDef = toolDefinition({
  name: 'process_image',
  description: 'Process an image file to extract text via OCR, generate visual descriptions, detect objects, and identify handwritten content using AI-powered vision understanding. Use this when ingesting images or screenshots into the knowledge base.',
  inputSchema: ProcessImageInputSchema,
  needsApproval: false, // Image processing is safe, no destructive operations
});

/**
 * Create client-side image processing tool implementation
 *
 * @param getKnowledgeTools - Function to get knowledge tools facade
 * @returns TanStack AI tool client implementation
 */
export function createProcessImageClientTool(getKnowledgeTools: () => AgentKnowledgeTools) {
  return processImageDef.client(async (input: unknown): Promise<ToolResult<ProcessImageOutput>> => {
    const args = input as ProcessImageInput;

    try {
      // Validate inputs
      if (!args.base64Content) {
        return {
          success: false,
          error: 'Image base64 content is required',
        };
      }

      if (!args.file || !args.file.type.startsWith('image/')) {
        return {
          success: false,
          error: 'Valid image file is required',
        };
      }

      // Call knowledge tools facade
      const tools = getKnowledgeTools();
      const result = await tools.processImage(args.file, args.base64Content, args.options);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown image processing error';
      console.error('[ProcessImageTool] Error:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  });
}
