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
import type { AgentKnowledgeTools } from '../facades';

/**
 * PDF processing input schema
 */
const ProcessPDFInputSchema = z.object({
  file: z.instanceof(File).describe('PDF file to process'),
  base64Content: z.string().describe('Base64-encoded PDF content'),
  options: z.object({
    extractHeadings: z.boolean().optional().default(true),
    extractTables: z.boolean().optional().default(true),
    extractFigures: z.boolean().optional().default(true),
    extractCitations: z.boolean().optional().default(true),
  }).optional().describe('Processing options'),
});

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
    data: z.unknown(),
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

export type ProcessPDFInput = z.infer<typeof ProcessPDFInputSchema>;
export type ProcessPDFOutput = z.infer<typeof ProcessPDFOutputSchema>;

/**
 * Process PDF tool definition
 */
export const processPDFDef = toolDefinition({
  name: 'process_pdf',
  description: 'Process a PDF document to extract structured elements like headings, tables, figures, and citations using AI-powered document understanding. Use this when ingesting PDF files into the knowledge base.',
  inputSchema: ProcessPDFInputSchema,
  needsApproval: false, // PDF processing is safe, no destructive operations
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
      // Validate inputs
      if (!args.base64Content) {
        return {
          success: false,
          error: 'PDF base64 content is required',
        };
      }

      if (!args.file || args.file.type !== 'application/pdf') {
        return {
          success: false,
          error: 'Valid PDF file is required',
        };
      }

      // Call knowledge tools facade
      const tools = getKnowledgeTools();
      const result = await tools.processPDF(args.file, args.base64Content, args.options);

      // Map GeminiPDFResult to ProcessPDFOutput schema
      const mappedResult: ProcessPDFOutput = {
        headings: result.headings.map(h => ({
          level: h.level,
          title: h.text,
          page: h.pageNumber,
        })),
        tables: result.tables.map(t => ({
          rows: t.rows.length,
          columns: t.rows.length > 0 ? t.rows[0].length : 0,
          caption: t.caption,
          data: t.rows,
        })),
        figures: result.figures.map(f => ({
          caption: f.caption,
          type: f.type,
          page: f.pageNumber,
        })),
        citations: result.citations.map(c => ({
          title: c.metadata?.title || c.text,
          author: c.metadata?.authors?.join(', '),
          year: c.metadata?.year,
        })),
        metadata: {
          totalPages: undefined,
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
