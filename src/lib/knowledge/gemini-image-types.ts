/**
 * @fileoverview Gemini Image Processor Types
 * @module lib/knowledge/gemini-image-types
 * @governance EPIC-38, PHASE-5
 */

/**
 * Image analysis result
 */
export interface GeminiImageResult {
  /** Extracted text content (OCR) */
  text: string;
  /** Image description (visual summary) */
  description: string;
  /** Detected image type */
  imageType: 'handwriting' | 'diagram' | 'chart' | 'graph' | 'screenshot' | 'photo' | 'other';
  /** For handwriting: confidence score */
  handwritingConfidence?: number;
  /** For diagrams/charts: structured data */
  structuredData?: {
    /** Chart type (if detected) */
    chartType?: 'bar' | 'line' | 'pie' | 'scatter' | 'histogram' | 'unknown';
    /** Diagram elements detected */
    elements?: string[];
    /** Chart data points (if readable) */
    dataPoints?: Array<{ label: string; value: number }>;
    /** Axes labels (for charts/graphs) */
    axes?: { x?: string; y?: string };
  };
  /** Detected objects in the image */
  detectedObjects?: Array<{
    label: string;
    confidence: number;
    boundingBox?: { x: number; y: number; width: number; height: number };
  }>;
  /** Text regions with positions */
  textRegions?: Array<{
    text: string;
    boundingBox: { x: number; y: number; width: number; height: number };
  }>;
}

/**
 * Processing progress callback
 */
export interface ImageProcessingProgress {
  status: 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  stage: string;
  error?: string;
}

/**
 * Processing options
 */
export interface GeminiImageOptions {
  /** Progress callback for UI updates */
  onProgress?: (progress: ImageProcessingProgress) => void;
  /** Extract text with OCR (default: true) */
  extractText?: boolean;
  /** Generate description (default: true) */
  generateDescription?: boolean;
  /** Detect objects (default: false, slower) */
  detectObjects?: boolean;
  /** Analyze charts/diagrams (default: true) */
  analyzeStructure?: boolean;
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
      }>;
    };
  }>;
}
