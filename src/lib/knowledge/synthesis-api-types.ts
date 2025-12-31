/**
 * @fileoverview Synthesis Service API Types
 * @module lib/knowledge/synthesis-api-types
 * @governance GAP-003 - Synthesis Button + Service
 */

/**
 * Gemini API configuration
 */
export interface GeminiConfig {
  baseUrl: string;
  model: string;
  apiKey: string;
  temperature: number;
}

/**
 * Gemini API request structure
 */
export interface GeminiRequest {
  contents: Array<{
    parts: Array<
      { text: string } |
      { inlineData: { mimeType: string; data: string } }
    >;
  }>;
  generationConfig: {
    responseMimeType: string;
    temperature: number;
  };
}

/**
 * Gemini API response structure
 */
export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

/**
 * MIME type mappings for synthesizable source types
 */
export const MIME_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  image: 'image/png',
  audio: 'audio/mpeg',
  url: 'text/html',
  markdown: 'text/markdown',
  text: 'text/plain',
};

/**
 * Get MIME type for source type
 *
 * @param type - Source type identifier
 * @returns MIME type string
 */
export function getMimeType(type: string): string {
  return MIME_TYPES[type] || 'text/plain';
}
