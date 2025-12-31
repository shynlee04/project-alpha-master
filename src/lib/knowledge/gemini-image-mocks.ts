/**
 * @fileoverview Gemini Image Processor Mock Data
 * @module lib/knowledge/gemini-image-mocks
 * @governance EPIC-38, PHASE-5
 *
 * Mock data for development and testing.
 *
 * TODO USER: Remove this module when callGeminiAPI() is implemented
 */

import type { GeminiImageResult } from './gemini-image-types';

/**
 * Generate mock result for development
 *
 * TODO USER: Remove this method when callGeminiAPI() is implemented
 *
 * @returns Mock image analysis result
 */
export function getMockImageResult(): GeminiImageResult {
  return {
    text: 'Sample extracted text from image. This is mock OCR data.',
    description: 'A mock image containing handwritten notes and diagrams.',
    imageType: 'handwriting',
    handwritingConfidence: 0.92,
    structuredData: {
      elements: ['arrow', 'box', 'label'],
      dataPoints: [
        { label: 'Point A', value: 10 },
        { label: 'Point B', value: 20 },
      ],
    },
    detectedObjects: [
      { label: 'text', confidence: 0.95 },
      { label: 'handwriting', confidence: 0.88 },
    ],
    textRegions: [
      {
        text: 'Sample text',
        boundingBox: { x: 0.1, y: 0.1, width: 0.3, height: 0.05 },
      },
    ],
  };
}
