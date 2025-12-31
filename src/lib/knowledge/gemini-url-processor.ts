/**
 * @fileoverview Gemini URL Processor - Enhanced Web Content Understanding
 * @module lib/knowledge/gemini-url-processor
 * @governance EPIC-38, PHASE-5
 *
 * AI-powered web content analysis using Gemini's multimodal API.
 * Enhances basic HTML extraction with semantic understanding, metadata inference,
 * and related link detection.
 *
 * This is a FRAMEWORK implementation. Actual Gemini API calls require user
 * configuration of API keys and implementation of TODO sections.
 *
 * @example
 * ```tsx
 * import { createGeminiURLProcessor } from '@/lib/knowledge/gemini-url-processor';
 *
 * const processor = createGeminiURLProcessor(apiKey);
 * const result = await processor.processURL('https://example.com/article', htmlContent);
 * console.log(result.cleanContent, result.metadata, result.relatedLinks);
 * ```
 */

import { credentialVault } from '@/lib/agent/providers/credential-vault';

/**
 * Enhanced URL analysis result
 */
export interface GeminiURLResult {
  /** Clean main content (ads, nav, footer removed) */
  cleanContent: string;
  /** Extracted title */
  title: string;
  /** Author detection */
  author?: string;
  /** Publication date */
  publishedDate?: string;
  /** Content type inference */
  contentType?: 'article' | 'blog' | 'news' | 'documentation' | 'tutorial' | 'research' | 'other';
  /** Reading time estimate (minutes) */
  readingTimeMinutes?: number;
  /** Summary (3-5 sentences) */
  summary?: string;
  /** Key topics/tags */
  tags?: string[];
  /** Related links found in content */
  relatedLinks?: Array<{
    url: string;
    title?: string;
    relevance: 'high' | 'medium' | 'low';
  }>;
  /** Main image URL */
  mainImageUrl?: string;
}

/**
 * Processing progress callback
 */
export interface URLProcessingProgress {
  status: 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  stage: string;
  error?: string;
}

/**
 * Processing options
 */
export interface GeminiURLOptions {
  /** Progress callback for UI updates */
  onProgress?: (progress: URLProcessingProgress) => void;
  /** Generate summary (default: true) */
  generateSummary?: boolean;
  /** Detect related links (default: true) */
  detectLinks?: boolean;
  /** Infer metadata (default: true) */
  inferMetadata?: boolean;
}

/**
 * Gemini API configuration
 */
interface GeminiConfig {
  baseUrl: string;
  model: string;
  apiKey: string;
}

/**
 * Gemini API request structure
 */
interface GeminiRequest {
  contents: Array<{
    parts: Array<{ text: string }>;
  }>;
  generationConfig: {
    temperature: number;
    maxOutputTokens: number;
  };
}

/**
 * Gemini API response structure
 */
interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text?: string }>;
    };
  }>;
}

/**
 * Gemini URL Processor
 *
 * Uses Gemini's multimodal API to analyze web content beyond basic
 * HTML extraction. Provides semantic understanding and metadata inference.
 */
export class GeminiURLProcessor {
  private config: GeminiConfig;
  private providerId: string;

  constructor(apiKey: string, model: string, providerId: string = 'gemini') {
    this.config = {
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      model,
      apiKey,
    };
    this.providerId = providerId;
  }

  /**
   * Create URL processor with API key from credential vault
   *
   * @param providerId - Provider ID for credential vault lookup
   * @param model - Model identifier (e.g., 'gemini-2.5-flash'). If not provided, will use default.
   */
  static async create(providerId: string = 'gemini', model?: string): Promise<GeminiURLProcessor> {
    await credentialVault.initialize();
    const apiKey = await credentialVault.getCredentials(providerId);

    if (!apiKey) {
      throw new Error(`No API key found for provider: ${providerId}. Please configure your API key in Settings.`);
    }

    // Use provided model or default
    const defaultModel = 'gemini-2.5-flash';
    const modelToUse = model || defaultModel;

    return new GeminiURLProcessor(apiKey, modelToUse, providerId);
  }

  /**
   * Process URL content with Gemini for enhanced analysis
   *
   * @param url - The URL being processed
   * @param htmlContent - Raw HTML content (already fetched)
   * @param options - Processing options
   * @returns Enhanced URL analysis result
   * @throws Error if API key is missing or processing fails
   */
  async processURL(
    url: string,
    htmlContent: string,
    options: GeminiURLOptions = {}
  ): Promise<GeminiURLResult> {
    const startTime = Date.now();

    try {
      // Validate API key
      if (!this.config.apiKey) {
        throw new Error('Gemini API key not configured');
      }

      // Report initial progress
      options.onProgress?.({
        status: 'processing',
        progress: 10,
        stage: 'Preparing content analysis',
      });

      // Truncate HTML if too long (Gemini has input limits)
      const maxHtmlLength = 50000; // Keep first 50k chars
      const truncatedHtml = htmlContent.length > maxHtmlLength
        ? htmlContent.substring(0, maxHtmlLength) + '\n\n[Content truncated...]'
        : htmlContent;

      // Build analysis prompt
      const prompt = this.buildAnalysisPrompt(url, options);

      // Build request
      const requestBody: GeminiRequest = {
        contents: [{
          parts: [
            { text: prompt },
            { text: truncatedHtml },
          ],
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 4096,
        },
      };

      // Report progress
      options.onProgress?.({
        status: 'processing',
        progress: 30,
        stage: 'Analyzing content with Gemini',
      });

      // TODO USER: Implement retry logic with exponential backoff
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

      throw new Error(`Gemini URL processing failed: ${errorMessage}`);
    }
  }

  /**
   * Build analysis prompt based on options
   */
  private buildAnalysisPrompt(url: string, options: GeminiURLOptions): string {
    const generateSummary = options.generateSummary !== false;
    const detectLinks = options.detectLinks !== false;
    const inferMetadata = options.inferMetadata !== false;

    const tasks = [];
    if (generateSummary) tasks.push('Summarize the main content in 3-5 sentences');
    if (detectLinks) tasks.push('Detect and categorize related links');
    if (inferMetadata) tasks.push('Infer metadata (author, date, content type, tags)');

    return `Analyze this web page content and provide structured information in JSON format.

Source URL: ${url}

Tasks:
${tasks.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Specific analysis required:
${generateSummary ? '- Extract the main content, removing navigation, ads, footers\n- Provide a concise 3-5 sentence summary' : ''}
${inferMetadata ? '- Detect author if mentioned\n- Extract publication date if available\n- Classify content type (article/blog/news/documentation/tutorial/research/other)\n- Estimate reading time based on content length\n- Extract 5-10 relevant topic tags' : ''}
${detectLinks ? '- Identify important related links (references, citations, further reading)\n- Categorize links by relevance (high/medium/low)' : ''}

Respond ONLY with valid JSON matching this structure:
{
  "cleanContent": "Main article content with nav/ads/footer removed",
  "title": "Article or page title",
  "author": "Author name if detected",
  "publishedDate": "ISO date string if detected",
  "contentType": "article|blog|news|documentation|tutorial|research|other",
  "readingTimeMinutes": 5,
  "summary": "3-5 sentence summary of main content",
  "tags": ["tag1", "tag2", "tag3"],
  "relatedLinks": [
    {"url": "https://example.com", "title": "Link Title", "relevance": "high"}
  ],
  "mainImageUrl": "URL of primary image if detected"
}`;
  }

  /**
   * Call Gemini API with retry logic
   *
   * Implements production-ready Gemini API integration for URL processing with:
   * - Fetch with timeout (30 seconds)
   * - Retry logic for 429 (rate limit) and 5xx errors
   * - Exponential backoff (1s, 2s, 4s between retries)
   * - Max 3 retries
   * - Proper error parsing and handling
   * - JSON response validation
   */
  private async callGeminiAPI(
    requestBody: GeminiRequest,
    options: GeminiURLOptions
  ): Promise<GeminiURLResult> {
    const maxRetries = 3;
    const timeoutMs = 30000; // 30 seconds
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        // Report progress
        options.onProgress?.({
          status: 'processing',
          progress: 30 + (attempt * 20),
          stage: `Calling Gemini API (attempt ${attempt + 1}/${maxRetries})`,
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
          if (!parsed.cleanContent && !parsed.title) {
            console.warn('[GeminiURL] No content extracted from URL');
          }

          return parsed as GeminiURLResult;
        }

        // Handle rate limiting (429)
        if (response.status === 429) {
          console.warn(`[GeminiURL] Rate limited, retry ${attempt + 1}/${maxRetries}`);
          const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
          await new Promise(resolve => setTimeout(resolve, waitTime));
          attempt++;
          continue;
        }

        // Handle server errors (5xx)
        if (response.status >= 500 && response.status < 600) {
          console.warn(`[GeminiURL] Server error ${response.status}, retry ${attempt + 1}/${maxRetries}`);
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
          console.warn(`[GeminiURL] Request timeout, retry ${attempt + 1}/${maxRetries}`);
          if (attempt === maxRetries - 1) {
            throw new Error('Gemini API request timeout after 30 seconds');
          }
          attempt++;
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }

        // Handle network errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
          console.warn(`[GeminiURL] Network error, retry ${attempt + 1}/${maxRetries}`);
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

    throw new Error('Max retries exceeded for Gemini URL API call');
  }

  /**
   * Generate mock result for development
   */
  private getMockResult(): GeminiURLResult {
    return {
      cleanContent: 'This is the mock clean content extracted from the web page.',
      title: 'Mock Article Title',
      author: 'Mock Author',
      publishedDate: '2025-12-31',
      contentType: 'article',
      readingTimeMinutes: 5,
      summary: 'This is a mock summary of the article content, typically 3-5 sentences long.',
      tags: ['mock', 'development', 'test'],
      relatedLinks: [
        { url: 'https://example.com/related1', title: 'Related Article 1', relevance: 'high' },
        { url: 'https://example.com/related2', title: 'Related Article 2', relevance: 'medium' },
      ],
      mainImageUrl: 'https://example.com/image.jpg',
    };
  }
}

/**
 * Factory function to create Gemini URL processor
 *
 * @param apiKey - Gemini API key from credential vault
 * @param model - Model identifier (defaults to gemini-2.5-flash)
 * @returns Gemini URL processor instance
 */
export function createGeminiURLProcessor(apiKey: string, model?: string): GeminiURLProcessor {
  const defaultModel = 'gemini-2.5-flash';
  return new GeminiURLProcessor(apiKey, model || defaultModel);
}
