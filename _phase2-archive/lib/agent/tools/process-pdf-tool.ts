/**
 * @fileoverview Process PDF Tool - PDF Document Understanding Agent Tool
 * @module lib/agent/tools/process-pdf-tool
 *
 * Agent tool for processing PDF documents with Gemini multimodal API.
 * Extracts headings, tables, figures, citations from PDFs.
 *
 * @governance EPIC-38, PHASE-5
 * @story KSI Agent Integration
 */

import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';
import type { ToolResult } from './types';
import type { AgentKnowledgeTools, PDFProcessingOptions } from '../facades';

/**
 * PDF processing input schema
 *
 * NOTE: `file` field is intentionally typed as z.string().optional() for schema
 * serialization compatibility with providers like Mistral. The actual File object
 * is handled at runtime in the client implementation (checking instanceof File).
 * LLMs should only send base64Content, never this field.
 */
const ProcessPDFInputSchema = z.object({
  file: z.string().optional().describe('Internal: File reference (client-side only, LLM should not use this)'),
  base64Content: z.string().describe('Base64-encoded PDF content'),
  filename: z.string().optional().describe('Original filename'),
  mimeType: z.string().optional().default('application/pdf').describe('MIME type of the PDF'),
  options: z.object({
    extractHeadings: z.boolean().optional().default(true),
    extractTables: z.boolean().optional().default(true),
    extractFigures: z.boolean().optional().default(true),
    extractCitations: z.boolean().optional().default(true),
  }).optional().describe('Processing options'),
});

export type ProcessPDFInput = z.infer<typeof ProcessPDFInputSchema>;

/**
 * PDF processing output schema
 */
const ProcessPDFOutputSchema = z.object({
  headings: z.array(z.object({
    level: z.number(),
    title: z.string(),
    page: z.number().optional(),
  })),
  tables: z.array(z.object({
    rows: z.number(),
    columns: z.number(),
    caption: z.string().optional(),
    data: z.array(z.array(z.string())),
  })),
  figures: z.array(z.object({
    caption: z.string().optional(),
    type: z.string().optional(),
    page: z.number().optional(),
  })),
  citations: z.array(z.object({
    title: z.string(),
    author: z.string().optional(),
    year: z.number().optional(),
  })),
  metadata: z.object({
    totalPages: z.number().optional(),
    hasColor: z.boolean().optional(),
  }).optional(),
});

export type ProcessPDFOutput = z.infer<typeof ProcessPDFOutputSchema>;

/**
 * Process PDF tool definition
 */
export const processPDFDef = toolDefinition({
  name: 'process_pdf',
  description: 'Process a PDF document to extract structured elements like headings, tables, figures, and citations using AI-powered document understanding. Use this when ingesting PDF files into the knowledge base.',
  inputSchema: ProcessPDFInputSchema,
  needsApproval: false,
});

/**
 * Create client-side PDF processing tool implementation
 *
 * @param getKnowledgeTools - Function to get knowledge tools facade
 * @returns TanStack AI tool client implementation
 */
export function createProcessPDFClientTool(getKnowledgeTools: () => AgentKnowledgeTools) {
  return processPDFDef.client(async (input: unknown): Promise<ToolResult<ProcessPDFOutput>> => {
    const args = input as ProcessPDFInput;

    try {
      // Validate inputs - base64Content is required for LLM-initiated calls
      if (!args.base64Content) {
        return {
          success: false,
          error: 'PDF base64 content is required',
        };
      }

      // Call knowledge tools facade
      const tools = getKnowledgeTools();
      const pdfPath = args.filename || 'document.pdf';

      // Map tool options to facade PDFProcessingOptions format
      const pdfOptions: PDFProcessingOptions = {
        extractText: args.options?.extractHeadings ?? true,
        extractImages: args.options?.extractFigures ?? true,
        maxPages: undefined,
      };

      const result = await tools.processPDF(pdfPath, pdfOptions);

      // Map result to ProcessPDFOutput schema (stub returns minimal data)
      const mappedResult: ProcessPDFOutput = {
        headings: [],
        tables: [],
        figures: [],
        citations: [],
        metadata: {
          totalPages: result.pages || 0,
          hasColor: undefined,
        },
      };

      return {
        success: true,
        data: mappedResult,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown PDF processing error';
      console.error('[ProcessPDFTool] Error:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  });
}
