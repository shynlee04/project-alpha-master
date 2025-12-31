/**
 * @fileoverview Gemini PDF API Handler
 * @module lib/knowledge/gemini-pdf-api
 * @governance EPIC-38, PHASE-5
 */

import type { GeminiConfig, GeminiRequest, GeminiResponse, GeminiPDFResult, GeminiPDFOptions } from './gemini-pdf-types';

/**
 * Call Gemini API with retry logic
 *
 * Implements production-ready Gemini API integration for PDF processing with:
 * - Fetch with timeout (30 seconds)
 * - Retry logic for 429 (rate limit) and 5xx errors
 * - Exponential backoff (1s, 2s, 4s between retries)
 * - Max 3 retries
 * - Proper error parsing and handling
 * - JSON response validation
 *
 * @param config - Gemini API configuration
 * @param requestBody - Request body
 * @param options - Processing options
 * @returns Parsed PDF result
 * @throws Error if API key is missing or all retries are exhausted
 */
export async function callGeminiAPI(
  config: GeminiConfig,
  requestBody: GeminiRequest,
  options: GeminiPDFOptions
): Promise<GeminiPDFResult> {
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
        `${config.baseUrl}/models/${config.model}:generateContent?key=${config.apiKey}`,
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
        if (!parsed.headings && !parsed.tables && !parsed.figures) {
          console.warn('[GeminiPDF] No structured elements extracted from PDF');
        }

        return parsed as GeminiPDFResult;
      }

      // Handle rate limiting (429)
      if (response.status === 429) {
        console.warn(`[GeminiPDF] Rate limited, retry ${attempt + 1}/${maxRetries}`);
        const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, waitTime));
        attempt++;
        continue;
      }

      // Handle server errors (5xx)
      if (response.status >= 500 && response.status < 600) {
        console.warn(`[GeminiPDF] Server error ${response.status}, retry ${attempt + 1}/${maxRetries}`);
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
        console.warn(`[GeminiPDF] Request timeout, retry ${attempt + 1}/${maxRetries}`);
        if (attempt === maxRetries - 1) {
          throw new Error('Gemini API request timeout after 30 seconds');
        }
        attempt++;
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn(`[GeminiPDF] Network error, retry ${attempt + 1}/${maxRetries}`);
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

  throw new Error('Max retries exceeded for Gemini PDF API call');
}
