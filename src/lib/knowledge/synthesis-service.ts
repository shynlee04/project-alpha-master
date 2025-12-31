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
  SynthesisProgress,
  SynthesisOptions,
  SourceDocument,
  SynthesizableSourceType,
} from './synthesis-types';
import { SynthesisFrontmatterSchema } from './synthesis-types';
import { emitStoreEvent } from '@/lib/events/store-events';
import { STORE_EVENTS } from '@/lib/events/store-events';

/**
 * Gemini API configuration
 */
interface GeminiConfig {
  baseUrl: string;
  model: string;
  apiKey: string;
  temperature: number;
}

/**
 * Gemini API request structure
 */
interface GeminiRequest {
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
interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

/**
 * Prompt templates for different source types
 *
 * TODO USER: Customize these prompts based on your specific use cases.
 * The current prompts are templates - you should enhance them with:
 * - Domain-specific instructions
 * - Output format examples
 * - Quality criteria
 */
const PROMPTS: Record<SynthesizableSourceType, string> = {
  pdf: `Analyze this PDF document and generate structured synthesis metadata.

Extract:
1. A comprehensive summary (150-300 words)
2. Document type classification
3. 5-10 key concepts with definitions
4. Subject area
5. 5-10 semantic tags
6. Structural metadata (headings, figures, tables, citations)
7. Prerequisite topics
8. Related topics for further exploration
9. Difficulty level (if educational)
10. Estimated study time

Respond ONLY with valid JSON matching the required schema.`,

  image: `Analyze this image and generate structured synthesis metadata.

For diagrams/notes:
1. Describe what the image depicts
2. Extract key concepts shown
3. Identify the subject area
4. Suggest related topics
5. If handwritten, estimate difficulty level

For other images:
1. Summarize the visual content
2. Identify main themes
3. Generate relevant tags

Respond ONLY with valid JSON matching the required schema.`,

  audio: `Analyze this audio transcript and generate structured synthesis metadata.

Extract:
1. Main topics discussed
2. Key concepts mentioned
3. Summary of content
4. Subject area
5. Relevant tags
6. Estimated study time if educational

Respond ONLY with valid JSON matching the required schema.`,

  url: `Analyze this web content and generate structured synthesis metadata.

Extract:
1. Summary of the article/page
2. Key concepts presented
3. Subject area
4. Relevant tags
5. Prerequisite knowledge
6. Related topics

Respond ONLY with valid JSON matching the required schema.`,

  markdown: `Analyze this markdown document and generate structured synthesis metadata.

Extract:
1. Summary of content
2. Document type
3. Key concepts with definitions
4. Subject area
5. Semantic tags
6. Document structure (headings, code blocks, etc.)
7. Prerequisites
8. Related topics
9. Difficulty level (if technical)

Respond ONLY with valid JSON matching the required schema.`,

  text: `Analyze this text content and generate structured synthesis metadata.

Extract:
1. Summary
2. Key concepts
3. Subject area
4. Tags
5. Related topics

Respond ONLY with valid JSON matching the required schema.`,
};

/**
 * Synthesis Service
 *
 * Analyzes source documents using Gemini AI to generate
 * structured frontmatter for knowledge organization.
 */
export class SynthesisService {
  private config: GeminiConfig;

  constructor(apiKey: string) {
    this.config = {
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      model: 'gemini-2.0-flash-latest',
      apiKey,
      temperature: 0.4,
    };
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
      const prompt = this.getPromptForType(source.type);

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
   * TODO USER: Implement this method with:
   * 1. Fetch with timeout
   * 2. Retry logic for 429 (rate limit) and 5xx errors
   * 3. Exponential backoff (wait 1s, 2s, 4s between retries)
   * 4. Max 3 retries
   * 5. Proper error parsing
   */
  private async callGeminiAPI(requestBody: GeminiRequest): Promise<SynthesisFrontmatter> {
    // === USER IMPLEMENTATION REQUIRED ===
    // The code below is a placeholder. You need to implement:

    // 1. Build the fetch request with proper error handling
    // 2. Handle rate limiting (429) with retries
    // 3. Parse JSON response
    // 4. Validate with Zod schema
    // 5. Handle network errors

    // Reference implementation structure:
    /*
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const response = await fetch(
          `${this.config.baseUrl}/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          }
        );

        if (response.ok) {
          const result: GeminiResponse = await response.json();
          const rawText = result.candidates[0].content.parts[0].text;
          return JSON.parse(rawText);
        }

        if (response.status === 429) {
          // Rate limited - wait and retry
          const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
          await new Promise(resolve => setTimeout(resolve, waitTime));
          attempt++;
          continue;
        }

        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      } catch (error) {
        if (attempt === maxRetries - 1) throw error;
        attempt++;
        // Network error - retry after delay
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }

    throw new Error('Max retries exceeded');
    */

    // TEMPORARY: Return mock data for development
    // Remove this when you implement the actual API call
    console.warn('[SynthesisService] Using mock data - implement callGeminiAPI()');
    return this.getMockFrontmatter();
  }

  /**
   * Get prompt template for source type
   */
  private getPromptForType(type: SynthesizableSourceType): string {
    return PROMPTS[type] || PROMPTS.text;
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
          mimeType: source.mimeType || this.getMimeType(source.type),
          data: source.base64Content,
        },
      };
    }

    return { text: source.content || '' };
  }

  /**
   * Get MIME type for source type
   */
  private getMimeType(type: SynthesizableSourceType): string {
    const mimeTypes: Record<SynthesizableSourceType, string> = {
      pdf: 'application/pdf',
      image: 'image/png',
      audio: 'audio/mpeg',
      url: 'text/html',
      markdown: 'text/markdown',
      text: 'text/plain',
    };
    return mimeTypes[type] || 'text/plain';
  }

  /**
   * Generate mock frontmatter for development
   *
   * TODO USER: Remove this method when callGeminiAPI() is implemented
   */
  private getMockFrontmatter(): SynthesisFrontmatter {
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
}

/**
 * Factory function to create synthesis service
 *
 * @param apiKey - Gemini API key from credential vault
 * @returns Synthesis service instance
 */
export function createSynthesisService(apiKey: string): SynthesisService {
  return new SynthesisService(apiKey);
}
