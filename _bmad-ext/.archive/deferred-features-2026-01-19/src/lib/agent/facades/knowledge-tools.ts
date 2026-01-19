/**
 * @fileoverview Knowledge Tools Facade - Agent Tool Interface
 * @module lib/agent/facades/knowledge-tools
 *
 * Facade interface for knowledge synthesis operations.
 * Abstracts the underlying KSI services from agent tools.
 *
 * @governance EPIC-38, PHASE-7
 * @story KSI Agent Integration
 */

import type { SynthesisResult } from '@/lib/knowledge/synthesis-types';
import type { GeminiPDFResult } from '@/lib/knowledge/gemini-pdf-types';
import type { GeminiImageResult } from '@/lib/knowledge/gemini-image-types';
import type { GeminiURLResult } from '@/lib/knowledge/gemini-url-processor';

/**
 * Synthesis options for knowledge generation
 */
export interface SynthesisOptions {
  /** Generate summary (default: true) */
  generateSummary?: boolean;
  /** Extract key concepts (default: true) */
  extractKeyConcepts?: boolean;
  /** Classify subject (default: true) */
  classifySubject?: boolean;
  /** Generate tags (default: true) */
  generateTags?: boolean;
}

/**
 * Synthesis input parameters
 */
export interface SynthesisInput {
  sourceId: string;
  sourceType: 'text' | 'markdown' | 'pdf' | 'image' | 'url';
  title: string;
  content: string;
  mimeType?: string;
  options?: SynthesisOptions;
}

/**
 * PDF processing options
 */
export interface PDFProcessingOptions {
  /** Extract headings (default: true) */
  extractHeadings?: boolean;
  /** Extract tables (default: true) */
  extractTables?: boolean;
  /** Extract figures (default: true) */
  extractFigures?: boolean;
  /** Extract citations (default: true) */
  extractCitations?: boolean;
}

/**
 * Image processing options
 */
export interface ImageProcessingOptions {
  /** Extract text via OCR (default: true) */
  extractText?: boolean;
  /** Generate visual description (default: true) */
  generateDescription?: boolean;
  /** Detect objects (default: true) */
  detectObjects?: boolean;
  /** Detect handwriting (default: true) */
  detectHandwriting?: boolean;
}

/**
 * URL processing options
 */
export interface URLProcessingOptions {
  /** Generate summary (default: true) */
  generateSummary?: boolean;
  /** Infer metadata (default: true) */
  inferMetadata?: boolean;
  /** Detect related links (default: true) */
  detectLinks?: boolean;
}

/**
 * AgentKnowledgeTools - Facade interface for knowledge synthesis operations
 *
 * This interface provides a clean abstraction layer between agent tools
 * and the underlying KSI services, enabling:
 * - Consistent error handling
 * - Progress reporting
 * - Service abstraction
 * - Testability
 */
export interface AgentKnowledgeTools {
  /**
   * Synthesize knowledge from a source document
   *
   * @param input - Synthesis parameters
   * @returns Synthesis result with frontmatter
   * @throws Error if synthesis fails or API key not configured
   */
  synthesize(input: SynthesisInput): Promise<SynthesisResult>;

  /**
   * Process PDF document with Gemini multimodal API
   *
   * @param file - PDF file
   * @param base64Content - Base64-encoded PDF content
   * @param options - Processing options
   * @returns Structured PDF result with headings, tables, figures, citations
   * @throws Error if PDF processing fails or API key not configured
   */
  processPDF(
    file: File,
    base64Content: string,
    options?: PDFProcessingOptions
  ): Promise<GeminiPDFResult>;

  /**
   * Process image with Gemini vision API
   *
   * @param file - Image file
   * @param base64Content - Base64-encoded image content
   * @param options - Processing options
   * @returns Image analysis result with text, description, objects
   * @throws Error if image processing fails or API key not configured
   */
  processImage(
    file: File,
    base64Content: string,
    options?: ImageProcessingOptions
  ): Promise<GeminiImageResult>;

  /**
   * Process URL content with Gemini API
   *
   * @param url - URL to process
   * @param htmlContent - HTML content of the page
   * @param options - Processing options
   * @returns URL analysis result with clean content, metadata, summary
   * @throws Error if URL processing fails or API key not configured
   */
  processURL(
    url: string,
    htmlContent: string,
    options?: URLProcessingOptions
  ): Promise<GeminiURLResult>;
}
