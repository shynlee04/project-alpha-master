/**
 * @fileoverview Gemini PDF Prompt Builder
 * @module lib/knowledge/gemini-pdf-prompts
 * @governance EPIC-38, PHASE-5
 */

import type { GeminiPDFOptions } from './gemini-pdf-types';

/**
 * Build extraction prompt based on options
 *
 * @param options - Processing options
 * @returns Prompt string for Gemini API
 */
export function buildExtractionPrompt(options: GeminiPDFOptions): string {
  const extractTables = options.extractTables !== false;
  const extractFigures = options.extractFigures !== false;
  const extractCitations = options.extractCitations !== false;

  const extractionTargets = [];
  if (extractTables) extractionTargets.push('tables');
  if (extractFigures) extractionTargets.push('figures');
  if (extractCitations) extractionTargets.push('citations');

  return `Analyze this PDF document and extract its structure in JSON format.

Extract the following elements:
${extractTables ? '- Tables: Extract all table content as 2D arrays' : ''}
${extractFigures ? '- Figures: Identify and describe diagrams, charts, graphs' : ''}
${extractCitations ? '- Citations: Extract all references with metadata' : ''}
- Headings: Extract heading hierarchy (H1-H6)
- Sections: Group content by logical sections

Respond ONLY with valid JSON matching this structure:
{
  "title": "Document title (if detected)",
  "authors": ["Author 1", "Author 2"],
  "abstract": "Abstract text (if present)",
  "headings": [
    {"level": 1, "text": "Introduction", "pageNumber": 1}
  ],
  "tables": [
    {
      "id": "table-1",
      "caption": "Table caption",
      "rows": [["Header 1", "Header 2"], ["Data 1", "Data 2"]],
      "pageNumber": 3
    }
  ],
  "figures": [
    {
      "id": "figure-1",
      "caption": "Figure caption",
      "type": "diagram|chart|graph|image",
      "description": "AI-generated description",
      "pageNumber": 5
    }
  ],
  "citations": [
    {
      "id": "citation-1",
      "text": "Full citation text",
      "type": "journal|book|conference|web",
      "pageNumber": 10,
      "metadata": {"authors": [], "title": "", "year": 2024}
    }
  ],
  "sections": [
    {
      "startPage": 1,
      "endPage": 3,
      "heading": {"level": 1, "text": "Introduction"},
      "content": "Summary of section content"
    }
  ]
}`;
}
