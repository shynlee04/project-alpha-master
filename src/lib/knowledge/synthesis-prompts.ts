/**
 * @fileoverview Synthesis Prompt Templates
 * @module lib/knowledge/synthesis-prompts
 * @governance GAP-003 - Synthesis Button + Service
 *
 * Prompt templates for AI-powered synthesis of different source types.
 *
 * TODO USER: Customize these prompts based on your specific use cases.
 * Enhance with:
 * - Domain-specific instructions
 * - Output format examples
 * - Quality criteria
 */

import type { SynthesizableSourceType } from './synthesis-types';

/**
 * Prompt templates for different source types
 */
export const PROMPTS: Record<SynthesizableSourceType, string> = {
  pdf: `Analyze this PDF document and generate structured synthesis metadata.

Extract:
1. A comprehensive summary (150-300 words)
2. Document type classification
3. 5-10 key concepts with definitions
4. Subject area
5. 5-10 semantic tags
6. Structural metadata (headings, figures, tables, citations)
7. Prerequisite topics
8. Related topics for further exploration
9. Difficulty level (if educational)
10. Estimated study time

Respond ONLY with valid JSON matching the required schema.`,

  image: `Analyze this image and generate structured synthesis metadata.

For diagrams/notes:
1. Describe what the image depicts
2. Extract key concepts shown
3. Identify the subject area
4. Suggest related topics
5. If handwritten, estimate difficulty level

For other images:
1. Summarize the visual content
2. Identify main themes
3. Generate relevant tags

Respond ONLY with valid JSON matching the required schema.`,

  audio: `Analyze this audio transcript and generate structured synthesis metadata.

Extract:
1. Main topics discussed
2. Key concepts mentioned
3. Summary of content
4. Subject area
5. Relevant tags
6. Estimated study time if educational

Respond ONLY with valid JSON matching the required schema.`,

  url: `Analyze this web content and generate structured synthesis metadata.

Extract:
1. Summary of the article/page
2. Key concepts presented
3. Subject area
4. Relevant tags
5. Prerequisite knowledge
6. Related topics

Respond ONLY with valid JSON matching the required schema.`,

  markdown: `Analyze this markdown document and generate structured synthesis metadata.

Extract:
1. Summary of content
2. Document type
3. Key concepts with definitions
4. Subject area
5. Semantic tags
6. Document structure (headings, code blocks, etc.)
7. Prerequisites
8. Related topics
9. Difficulty level (if technical)

Respond ONLY with valid JSON matching the required schema.`,

  text: `Analyze this text content and generate structured synthesis metadata.

Extract:
1. Summary
2. Key concepts
3. Subject area
4. Tags
5. Related topics

Respond ONLY with valid JSON matching the required schema.`,
};

/**
 * Get prompt template for source type
 *
 * @param type - Source type identifier
 * @returns Prompt template string
 */
export function getPromptForType(type: SynthesizableSourceType): string {
  return PROMPTS[type] || PROMPTS.text;
}
