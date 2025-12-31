/**
 * @fileoverview Gemini PDF Mock Data Generator
 * @module lib/knowledge/gemini-pdf-mocks
 * @governance EPIC-38, PHASE-5
 */

import type { GeminiPDFResult } from './gemini-pdf-types';

/**
 * Generate mock result for development
 *
 * TODO USER: Remove this method when callGeminiAPI() is implemented
 *
 * @returns Mock PDF result for testing
 */
export function getMockResult(): GeminiPDFResult {
  return {
    title: 'Mock Document Title',
    authors: ['Author One', 'Author Two'],
    abstract: 'This is a mock abstract for development testing.',
    headings: [
      { level: 1, text: 'Introduction', pageNumber: 1 },
      { level: 2, text: 'Background', pageNumber: 2 },
      { level: 1, text: 'Methodology', pageNumber: 4 },
      { level: 1, text: 'Results', pageNumber: 8 },
      { level: 1, text: 'Conclusion', pageNumber: 12 },
    ],
    tables: [
      {
        id: 'table-1',
        caption: 'Mock Table Caption',
        rows: [
          ['Header 1', 'Header 2', 'Header 3'],
          ['Data 1', 'Data 2', 'Data 3'],
          ['Data 4', 'Data 5', 'Data 6'],
        ],
        pageNumber: 5,
      },
    ],
    figures: [
      {
        id: 'figure-1',
        caption: 'Mock Figure Caption',
        type: 'chart',
        description: 'A bar chart showing mock data',
        pageNumber: 7,
      },
    ],
    citations: [
      {
        id: 'citation-1',
        text: 'Smith, J. et al. (2024). Mock Paper Title. Journal of Examples, 10(2), 123-145.',
        type: 'journal',
        pageNumber: 11,
        metadata: {
          authors: ['J. Smith', 'A. Jones'],
          title: 'Mock Paper Title',
          year: 2024,
          venue: 'Journal of Examples',
        },
      },
    ],
    sections: [
      {
        startPage: 1,
        endPage: 3,
        heading: { level: 1, text: 'Introduction', pageNumber: 1 },
        content: 'Introduction content summary...',
      },
      {
        startPage: 4,
        endPage: 7,
        heading: { level: 1, text: 'Methodology', pageNumber: 4 },
        content: 'Methodology content summary...',
      },
    ],
  };
}
