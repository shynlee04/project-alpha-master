/**
 * @fileoverview Synthesis Service Mock Data
 * @module lib/knowledge/synthesis-mocks
 * @governance GAP-003 - Synthesis Button + Service
 *
 * Mock data for development and testing.
 *
 * TODO USER: Remove this module when callGeminiAPI() is implemented
 */

import type { SynthesisFrontmatter } from './synthesis-types';

/**
 * Generate mock frontmatter for development
 *
 * TODO USER: Remove this method when callGeminiAPI() is implemented
 *
 * @returns Mock synthesis frontmatter
 */
export function getMockFrontmatter(): SynthesisFrontmatter {
  return {
    summary: 'This is a mock summary for development. Implement callGeminiAPI() to get actual AI-generated summaries.',
    documentType: 'other',
    subject: 'General',
    keyConcepts: [
      { term: 'Concept 1', definition: 'Mock definition 1' },
      { term: 'Concept 2', definition: 'Mock definition 2' },
      { term: 'Concept 3', definition: 'Mock definition 3' },
    ],
    tags: ['mock', 'development', 'test'],
    structure: {
      hasFigures: false,
      hasTables: false,
      hasCitations: false,
    },
  };
}
