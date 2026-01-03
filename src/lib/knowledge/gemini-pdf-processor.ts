/**
 * @fileoverview Gemini PDF Processor - Multimodal Document Understanding
 * @module lib/knowledge/gemini-pdf-processor
 * @governance EPIC-38, PHASE-5
 *
 * AI-powered PDF document processing using Gemini's multimodal API.
 * Extracts structural elements: headings, paragraphs, tables, figures, citations.
 *
 * This is a FRAMEWORK implementation. Actual Gemini API calls require user
 * configuration of API keys and implementation of TODO sections.
 *
 * @example
 * ```tsx
 * import { createGeminiPDFProcessor } from '@/lib/knowledge/gemini-pdf-processor';
 *
 * const processor = createGeminiPDFProcessor(apiKey);
 * const result = await processor.processPDF(file);
 * console.log(result.headings, result.tables);
 * ```
 */

import type {
  PDFHeading,
  PDFTable,
  PDFFigure,
  PDFCitation,
  GeminiPDFResult,
  ProcessingProgress,
  GeminiPDFOptions,
  GeminiConfig,
  GeminiRequest,
} from './gemini-pdf-types';
import { buildExtractionPrompt } from './gemini-pdf-prompts';
import { callGeminiAPI } from './gemini-pdf-api';
import { credentialVault } from '@/lib/agent/providers/credential-vault';

// Re-export types for convenience
export type {
  PDFHeading,
  PDFTable,
  PDFFigure,
  PDFCitation,
  GeminiPDFResult,
  ProcessingProgress,
  GeminiPDFOptions,
};

/**
 * Gemini PDF Processor
 *
 * Uses Gemini's multimodal document understanding API to extract
 * structured elements from PDF files beyond basic text extraction.
 */
export class GeminiPDFProcessor {
  private config: GeminiConfig;

  constructor(apiKey: string, model: string, _providerId: string = 'gemini') {
    this.config = {
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      model,
      apiKey,
    };
  }

  /**
   * Create PDF processor with API key from credential vault
   *
   * @param providerId - Provider ID for credential vault lookup
   * @param model - Model identifier (e.g., 'gemini-2.5-flash'). If not provided, will use default.
   */
  static async create(providerId: string = 'gemini', model?: string): Promise<GeminiPDFProcessor> {
    await credentialVault.initialize();
    const apiKey = await credentialVault.getCredentials(providerId);

    if (!apiKey) {
      throw new Error(`No API key found for provider: ${providerId}. Please configure your API key in Settings.`);
    }

    // Use provided model or default
    const defaultModel = 'gemini-2.5-flash';
    const modelToUse = model || defaultModel;

    return new GeminiPDFProcessor(apiKey, modelToUse, providerId);
  }

  /**
   * Process PDF file with Gemini multimodal API
   *
   * @param file - PDF file to process
   * @param base64Content - Base64-encoded PDF content
   * @param options - Processing options
   * @returns Structured PDF result
   * @throws Error if API key is missing or processing fails
   */
  async processPDF(
    _file: File,
    base64Content: string,
    options: GeminiPDFOptions = {}
  ): Promise<GeminiPDFResult> {
    try {
      // Validate API key
      if (!this.config.apiKey) {
        throw new Error('Gemini API key not configured');
      }

      // Report initial progress
      options.onProgress?.({
        status: 'processing',
        progress: 10,
        stage: 'Preparing document analysis',
      });

      // Build extraction prompt
      const prompt = buildExtractionPrompt(options);

      // Build request
      const requestBody: GeminiRequest = {
        contents: [{
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: base64Content,
              },
            },
          ],
        }],
        generationConfig: {
          temperature: 0.1, // Low temperature for structured extraction
          maxOutputTokens: 8192, // Allow for detailed extraction
        },
      };

      // Report progress
      options.onProgress?.({
        status: 'processing',
        progress: 30,
        stage: 'Analyzing document structure',
      });

      // TODO USER: Implement retry logic with exponential backoff
      // for rate limiting (429 errors)
      const result = await callGeminiAPI(this.config, requestBody, options);

      options.onProgress?.({
        status: 'completed',
        progress: 100,
        stage: 'Complete',
      });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      options.onProgress?.({
        status: 'failed',
        progress: 0,
        stage: 'Error',
        error: errorMessage,
      });

      throw new Error(`Gemini PDF processing failed: ${errorMessage}`);
    }
  }
}

/**
 * Factory function to create Gemini PDF processor
 *
 * @param apiKey - Gemini API key from credential vault
 * @param model - Model identifier (e.g., 'gemini-2.5-flash'). Defaults to 'gemini-2.5-flash'.
 * @returns Gemini PDF processor instance
 */
export function createGeminiPDFProcessor(apiKey: string, model: string = 'gemini-2.5-flash'): GeminiPDFProcessor {
  return new GeminiPDFProcessor(apiKey, model);
}
