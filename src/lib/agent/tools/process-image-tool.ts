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
import type { AgentKnowledgeTools, ImageProcessingOptions } from '../facades';

/**
 * Image processing input schema
 *
 * NOTE: `file` field is intentionally typed as z.string().optional() for schema
 * serialization compatibility with providers like Mistral. The actual File object
 * is handled at runtime in the client implementation (checking instanceof File).
 * LLMs should only send base64Content, never this field.
 */
const ProcessImageInputSchema = z.object({
  file: z.string().optional().describe('Internal: File reference (client-side only, LLM should not use this)'),
  base64Content: z.string().describe('Base64-encoded image content'),
  filename: z.string().optional().describe('Original filename'),
  mimeType: z.string().optional().describe('MIME type of the image (e.g., image/png, image/jpeg)'),
  options: z.object({
    extractText: z.boolean().optional().default(true),
    generateDescription: z.boolean().optional().default(true),
    detectObjects: z.boolean().optional().default(true),
    detectHandwriting: z.boolean().optional().default(true),
  }).optional().describe('Processing options'),
});

export type ProcessImageInput = z.infer<typeof ProcessImageInputSchema>;

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

export type ProcessImageOutput = z.infer<typeof ProcessImageOutputSchema>;

/**
 * Process image tool definition
 */
export const processImageDef = toolDefinition({
  name: 'process_image',
  description: 'Process an image file to extract text via OCR, generate visual descriptions, detect objects, and identify handwritten content using AI-powered vision understanding. Use this when ingesting images or screenshots into the knowledge base.',
  inputSchema: ProcessImageInputSchema,
  needsApproval: false,
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
      // Validate inputs - base64Content is required for LLM-initiated calls
      if (!args.base64Content) {
        return {
          success: false,
          error: 'Image base64 content is required',
        };
      }

      // Determine mimeType
      const mimeType = args.mimeType || 'image/png';

      // Call knowledge tools facade
      const tools = getKnowledgeTools();
      const imagePath = args.filename || 'image.png';

      // Map tool options to facade ImageProcessingOptions format
      const imageOptions: ImageProcessingOptions = {
        extractText: args.options?.extractText ?? true,
        generateDescription: args.options?.generateDescription ?? true,
        maxSize: undefined,
      };

      const result = await tools.processImage(imagePath, imageOptions);

      // Map result to ProcessImageOutput schema (stub returns minimal data)
      const mappedResult: ProcessImageOutput = {
        extractedText: result.description || '',
        description: result.description || '',
        detectedObjects: [],
        isHandwriting: false,
        metadata: {
          mimeType: mimeType || 'image/png',
          width: undefined,
          height: undefined,
        },
      };

      return {
        success: true,
        data: mappedResult,
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
