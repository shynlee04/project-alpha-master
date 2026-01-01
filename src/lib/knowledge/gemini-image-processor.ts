/**
 * @fileoverview Gemini Image Processor - Multimodal Vision Understanding
 * @module lib/knowledge/gemini-image-processor
 * @governance EPIC-38, PHASE-5
 *
 * AI-powered image understanding using Gemini's multimodal vision API.
 * Supports OCR, handwriting recognition, diagram understanding, and chart interpretation.
 *
 * This is a FRAMEWORK implementation. Actual Gemini API calls require user
 * configuration of API keys and implementation of TODO sections.
 *
 * @example
 * ```tsx
 * import { createGeminiImageProcessor } from '@/lib/knowledge/gemini-image-processor';
 *
 * const processor = createGeminiImageProcessor(apiKey);
 * const result = await processor.processImage(file);
 * console.log(result.extractedText, result.description, result.detectedObjects);
 * ```
 */

import type {
  GeminiImageResult,
  GeminiImageOptions,
  GeminiConfig,
  GeminiRequest,
  GeminiResponse,
} from './gemini-image-types';
import { buildAnalysisPrompt } from './gemini-image-prompts';
import { credentialVault } from '@/lib/agent/providers/credential-vault';

/**
 * Gemini Image Processor
 *
 * Uses Gemini's multimodal vision API to understand image content
 * beyond basic OCR. Supports handwriting, diagrams, charts, and general photos.
 */
export class GeminiImageProcessor {
  private config: GeminiConfig;

  constructor(apiKey: string, model: string, _providerId: string = 'gemini') {
    this.config = {
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      model,
      apiKey,
    };
  }

  /**
   * Create image processor with API key from credential vault
   *
   * @param providerId - Provider ID for credential vault lookup
   * @param model - Model identifier (e.g., 'gemini-2.5-flash'). If not provided, will use default.
   */
  static async create(providerId: string = 'gemini', model?: string): Promise<GeminiImageProcessor> {
    await credentialVault.initialize();
    const apiKey = await credentialVault.getCredentials(providerId);

    if (!apiKey) {
      throw new Error(`No API key found for provider: ${providerId}. Please configure your API key in Settings.`);
    }

    // Use provided model or default
    const defaultModel = 'gemini-2.5-flash';
    const modelToUse = model || defaultModel;

    return new GeminiImageProcessor(apiKey, modelToUse, providerId);
  }

  /**
   * Process image file with Gemini multimodal vision API
   *
   * @param file - Image file to process
   * @param base64Content - Base64-encoded image content
   * @param options - Processing options
   * @returns Image analysis result
   * @throws Error if API key is missing or processing fails
   */
  async processImage(
    file: File,
    base64Content: string,
    options: GeminiImageOptions = {}
  ): Promise<GeminiImageResult> {
    try {
      // Validate API key
      if (!this.config.apiKey) {
        throw new Error('Gemini API key not configured');
      }

      // Report initial progress
      options.onProgress?.({
        status: 'processing',
        progress: 10,
        stage: 'Preparing image analysis',
      });

      // Detect MIME type
      const mimeType = file.type || this.getMimeTypeFromFileName(file.name);

      // Build analysis prompt
      const prompt = buildAnalysisPrompt(options);

      // Build request
      const requestBody: GeminiRequest = {
        contents: [{
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: base64Content,
              },
            },
          ],
        }],
        generationConfig: {
          temperature: 0.2, // Low temperature for consistent analysis
          maxOutputTokens: 4096,
        },
      };

      // Report progress
      options.onProgress?.({
        status: 'processing',
        progress: 30,
        stage: 'Analyzing image with Gemini Vision',
      });

      // TODO USER: Implement retry logic with exponential backoff
      // for rate limiting (429 errors)
      const result = await this.callGeminiAPI(requestBody, options);

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

      throw new Error(`Gemini image processing failed: ${errorMessage}`);
    }
  }

  /**
   * Get MIME type from file name
   */
  private getMimeTypeFromFileName(fileName: string): string {
    const ext = fileName.toLowerCase().split('.').pop();
    const mimeTypes: Record<string, string> = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'bmp': 'image/bmp',
    };
    return mimeTypes[ext || ''] || 'image/jpeg';
  }

  /**
   * Call Gemini API with retry logic
   *
   * Implements production-ready Gemini API integration for image processing with:
   * - Fetch with timeout (30 seconds)
   * - Retry logic for 429 (rate limit) and 5xx errors
   * - Exponential backoff (1s, 2s, 4s between retries)
   * - Max 3 retries
   * - Proper error parsing and handling
   * - JSON response validation
   */
  private async callGeminiAPI(
    requestBody: GeminiRequest,
    options: GeminiImageOptions
  ): Promise<GeminiImageResult> {
    const maxRetries = 3;
    const timeoutMs = 30000; // 30 seconds
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        // Report progress
        options.onProgress?.({
          status: 'processing',
          progress: 30 + (attempt * 20),
          stage: `Calling Gemini Vision API (attempt ${attempt + 1}/${maxRetries})`,
        });

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(
          `${this.config.baseUrl}/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
          }
        );

        // Clear timeout on successful response
        clearTimeout(timeoutId);

        if (response.ok) {
          const result: GeminiResponse = await response.json();

          // Validate response structure
          if (!result.candidates || result.candidates.length === 0) {
            throw new Error('Empty response from Gemini API');
          }

          const rawText = result.candidates[0].content.parts[0].text;

          if (!rawText) {
            throw new Error('No text content in Gemini API response');
          }

          // Parse JSON response
          const parsed = JSON.parse(rawText);

          // Validate structure (basic validation)
          if (!parsed.extractedText && !parsed.description) {
            console.warn('[GeminiImage] No content extracted from image');
          }

          return parsed as GeminiImageResult;
        }

        // Handle rate limiting (429)
        if (response.status === 429) {
          console.warn(`[GeminiImage] Rate limited, retry ${attempt + 1}/${maxRetries}`);
          const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
          await new Promise(resolve => setTimeout(resolve, waitTime));
          attempt++;
          continue;
        }

        // Handle server errors (5xx)
        if (response.status >= 500 && response.status < 600) {
          console.warn(`[GeminiImage] Server error ${response.status}, retry ${attempt + 1}/${maxRetries}`);
          const waitTime = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
          attempt++;
          continue;
        }

        // Client errors (4xx except 429) - don't retry
        const errorText = await response.text();
        throw new Error(`Gemini API error ${response.status}: ${errorText}`);

      } catch (error) {
        // Handle timeout
        if (error instanceof Error && error.name === 'AbortError') {
          console.warn(`[GeminiImage] Request timeout, retry ${attempt + 1}/${maxRetries}`);
          if (attempt === maxRetries - 1) {
            throw new Error('Gemini API request timeout after 30 seconds');
          }
          attempt++;
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }

        // Handle network errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
          console.warn(`[GeminiImage] Network error, retry ${attempt + 1}/${maxRetries}`);
          if (attempt === maxRetries - 1) {
            throw new Error('Network error - please check your connection');
          }
          attempt++;
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }

        // Re-throw other errors
        throw error;
      }
    }

    throw new Error('Max retries exceeded for Gemini Image API call');
  }
}

/**
 * Factory function to create Gemini image processor
 *
 * @param apiKey - Gemini API key from credential vault
 * @param model - Model identifier (defaults to gemini-2.5-flash)
 * @returns Gemini image processor instance
 */
export function createGeminiImageProcessor(apiKey: string, model?: string): GeminiImageProcessor {
  const defaultModel = 'gemini-2.5-flash';
  return new GeminiImageProcessor(apiKey, model || defaultModel);
}
