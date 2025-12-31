/**
 * @fileoverview Gemini PDF Types
 * @module lib/knowledge/gemini-pdf-types
 * @governance EPIC-38, PHASE-5
 */

/**
 * Heading structure from PDF
 */
export interface PDFHeading {
  level: number; // 1-6
  text: string;
  pageNumber: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Table structure from PDF
 */
export interface PDFTable {
  id: string;
  caption?: string;
  rows: string[][];
  pageNumber: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Figure/image structure from PDF
 */
export interface PDFFigure {
  id: string;
  caption?: string;
  type: 'diagram' | 'chart' | 'graph' | 'image' | 'screenshot';
  description?: string; // AI-generated description
  pageNumber: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Citation structure from PDF
 */
export interface PDFCitation {
  id: string;
  text: string;
  type: 'journal' | 'book' | 'conference' | 'web' | 'other';
  pageNumber: number;
  metadata?: {
    authors?: string[];
    title?: string;
    year?: number;
    venue?: string;
    doi?: string;
    url?: string;
  };
}

/**
 * Structured PDF processing result
 */
export interface GeminiPDFResult {
  /** Document title (if detected) */
  title?: string;
  /** Authors (if detected) */
  authors?: string[];
  /** Abstract (if detected) */
  abstract?: string;
  /** Headings hierarchy */
  headings: PDFHeading[];
  /** Tables with content */
  tables: PDFTable[];
  /** Figures with descriptions */
  figures: PDFFigure[];
  /** Citations with metadata */
  citations: PDFCitation[];
  /** Section structure */
  sections: {
    startPage: number;
    endPage: number;
    heading?: PDFHeading;
    content: string;
  }[];
}

/**
 * Processing progress callback
 */
export interface ProcessingProgress {
  status: 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  stage: string;
  error?: string;
}

/**
 * Processing options
 */
export interface GeminiPDFOptions {
  /** Progress callback for UI updates */
  onProgress?: (progress: ProcessingProgress) => void;
  /** Extract tables (default: true) */
  extractTables?: boolean;
  /** Extract figures (default: true) */
  extractFigures?: boolean;
  /** Extract citations (default: true) */
  extractCitations?: boolean;
  /** Maximum pages to process (default: all) */
  maxPages?: number;
}

/**
 * Gemini API configuration
 */
export interface GeminiConfig {
  baseUrl: string;
  model: string;
  apiKey: string;
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
    temperature: number;
    maxOutputTokens: number;
  };
}

/**
 * Gemini API response structure
 */
export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text?: string;
        functionCall?: {
          name: string;
          args: Record<string, unknown>;
        };
      }>;
    };
  }>;
}
