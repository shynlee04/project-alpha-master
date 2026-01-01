/**
 * @fileoverview Synthesis Service - Generates frontmatter via Gemini API
 * @module lib/knowledge/synthesis-service
 * @governance GAP-003 - Synthesis Button + Service
 *
 * AI-powered synthesis service that analyzes source documents
 * and generates structured frontmatter for knowledge organization.
 */

import type {
  SynthesisFrontmatter,
  SynthesisResult,
  SynthesisOptions,
  SourceDocument,
} from './synthesis-types';
import { SynthesisFrontmatterSchema } from './synthesis-types';
import { emitStoreEvent } from '@/lib/events/store-events';
import { STORE_EVENTS } from '@/lib/events/store-events';
import type {
  GeminiConfig,
  GeminiRequest,
  GeminiResponse,
} from './synthesis-api-types';
import { getMimeType } from './synthesis-api-types';
import { getPromptForType } from './synthesis-prompts';
import { credentialVault } from '@/lib/agent/providers/credential-vault';

/**
 * Synthesis Service
 *
 * Analyzes source documents using Gemini AI to generate
 * structured frontmatter for knowledge organization.
 */
export class SynthesisService {
  private config: GeminiConfig;

  constructor(apiKey: string, model: string, _providerId: string = 'gemini') {
    this.config = {
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      model,
      apiKey,
      temperature: 0.4,
    };
  }

  /**
   * Create synthesis service with API key from credential vault
   *
   * @param providerId - Provider ID for credential vault lookup
   * @param model - Model identifier (e.g., 'gemini-2.5-flash'). If not provided, will use default.
   */
  static async create(providerId: string = 'gemini', model?: string): Promise<SynthesisService> {
    await credentialVault.initialize();
    const apiKey = await credentialVault.getCredentials(providerId);

    if (!apiKey) {
      throw new Error(`No API key found for provider: ${providerId}. Please configure your API key in Settings.`);
    }

    // Use provided model or default
    const defaultModel = 'gemini-2.5-flash';
    const modelToUse = model || defaultModel;

    return new SynthesisService(apiKey, modelToUse, providerId);
  }

  /**
   * Synthesize frontmatter for a source document
   *
   * @param source - Source document to analyze
   * @param options - Synthesis options
   * @returns Synthesis result with generated frontmatter
   * @throws Error if API key is missing or synthesis fails
   */
  async synthesize(
    source: SourceDocument,
    options: SynthesisOptions = {}
  ): Promise<SynthesisResult> {
    const startTime = Date.now();
    const synthesisId = crypto.randomUUID();

    try {
      // Validate API key
      if (!this.config.apiKey) {
        throw new Error('Gemini API key not configured');
      }

      // Report progress
      options.onProgress?.({
        status: 'processing',
        progress: 10,
        stage: 'Preparing request',
      });

      // Select prompt based on source type
      const prompt = getPromptForType(source.type);

      // Prepare content part based on source type
      const contentPart = await this.getContentPart(source);

      // Build request
      const requestBody: GeminiRequest = {
        contents: [{
          parts: [
            { text: prompt },
            contentPart,
          ],
        }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: this.config.temperature,
        },
      };

      // Report progress
      options.onProgress?.({
        status: 'processing',
        progress: 30,
        stage: 'Calling Gemini API',
      });

      // TODO USER: Implement retry logic with exponential backoff
      // for rate limiting (429 errors)
      const frontmatter = await this.callGeminiAPI(requestBody);

      // Validate response with Zod
      const validatedFrontmatter = SynthesisFrontmatterSchema.parse(frontmatter);

      // Report progress
      options.onProgress?.({
        status: 'processing',
        progress: 90,
        stage: 'Validating and storing',
      });

      const result: SynthesisResult = {
        id: synthesisId,
        sourceId: source.id,
        frontmatter: validatedFrontmatter,
        synthesizedAt: new Date().toISOString(),
        modelUsed: this.config.model,
        processingTimeMs: Date.now() - startTime,
      };

      // Emit event for UI updates
      emitStoreEvent(STORE_EVENTS.SOURCE_SYNTHESIZED, {
        sourceId: source.id,
        synthesisId: result.id,
        timestamp: Date.now()
      });

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

      throw new Error(`Synthesis failed for source ${source.id}: ${errorMessage}`);
    }
  }

  /**
   * Call Gemini API with retry logic
   *
   * Implements production-ready Gemini API integration with:
   * - Fetch with timeout (30 seconds)
   * - Retry logic for 429 (rate limit) and 5xx errors
   * - Exponential backoff (1s, 2s, 4s between retries)
   * - Max 3 retries
   * - Proper error parsing and handling
   */
  private async callGeminiAPI(requestBody: GeminiRequest): Promise<SynthesisFrontmatter> {
    const maxRetries = 3;
    const timeoutMs = 30000; // 30 seconds
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
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
          return parsed as SynthesisFrontmatter;
        }

        // Handle rate limiting (429)
        if (response.status === 429) {
          console.warn(`[SynthesisService] Rate limited, retry ${attempt + 1}/${maxRetries}`);
          const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
          await new Promise(resolve => setTimeout(resolve, waitTime));
          attempt++;
          continue;
        }

        // Handle server errors (5xx)
        if (response.status >= 500 && response.status < 600) {
          console.warn(`[SynthesisService] Server error ${response.status}, retry ${attempt + 1}/${maxRetries}`);
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
          console.warn(`[SynthesisService] Request timeout, retry ${attempt + 1}/${maxRetries}`);
          if (attempt === maxRetries - 1) {
            throw new Error('Gemini API request timeout after 30 seconds');
          }
          attempt++;
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }

        // Handle network errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
          console.warn(`[SynthesisService] Network error, retry ${attempt + 1}/${maxRetries}`);
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

    throw new Error('Max retries exceeded for Gemini API call');
  }

  /**
   * Get content part based on source type
   *
   * For binary types (PDF, image), use inline data.
   * For text types, use text content.
   */
  private async getContentPart(source: SourceDocument): Promise<
    { text: string } |
    { inlineData: { mimeType: string; data: string } }
  > {
    if ((source.type === 'pdf' || source.type === 'image') && source.base64Content) {
      return {
        inlineData: {
          mimeType: source.mimeType || getMimeType(source.type),
          data: source.base64Content,
        },
      };
    }

    return { text: source.content || '' };
  }
}

/**
 * Factory function to create synthesis service
 *
 * @param apiKey - Gemini API key from credential vault
 * @param model - Model identifier (defaults to gemini-2.5-flash)
 * @returns Synthesis service instance
 */
export function createSynthesisService(apiKey: string, model?: string): SynthesisService {
  const defaultModel = 'gemini-2.5-flash';
  return new SynthesisService(apiKey, model || defaultModel);
}
