/**
 * @fileoverview URL Fetcher for Client-Side Web Content Extraction
 * @module lib/knowledge/url-fetcher
 * @governance EPIC-6-1, PHASE-5
 * @ai-observable true
 *
 * Client-side URL fetching with main content extraction.
 * Removes navigation, ads, and other non-content elements.
 *
 * Story 6.1: Source Import Pipeline
 * Phase 5: Gemini Multimodal URL Content Integration
 *
 * @example
 * ```tsx
 * import { URLFetcher } from '@/lib/knowledge/url-fetcher';
 *
 * const fetcher = new URLFetcher();
 * const result = await fetcher.fetchURL('https://example.com/article');
 * console.log(`Extracted ${result.wordCount} words`);
 *
 * // With Gemini enhancement
 * const enhanced = await fetcher.fetchURLWithGemini(
 *   'https://example.com/article',
 *   geminiApiKey
 * );
 * console.log(enhanced.summary, enhanced.tags);
 * ```
 */

import type { URLFetchResult, URLFetchOptions } from './url-fetcher-types';
import { extractTitle, extractMainContent } from './url-fetcher-content-extractor';

// Re-export types for backward compatibility
export type { URLFetchResult, URLFetchOptions };

/**
 * URL Fetcher for client-side web content extraction
 *
 * Features:
 * - Fetches HTML client-side (no server required)
 * - Extracts main content by removing nav/ads/footer
 * - Handles CORS gracefully with informative errors
 * - Extracts title from meta tags or page title
 */
export class URLFetcher {
  /**
   * Fetch URL and extract main content client-side
   *
   * @param url - URL to fetch
   * @returns URLFetchResult with extracted content
   * @throws Error if URL is invalid, blocked by CORS, or unreachable
   *
   * @example
   * ```tsx
   * try {
   *   const result = await fetcher.fetchURL('https://example.com/article');
   *   console.log(result.title); // "Article Title"
   *   console.log(result.content); // Main article text
   * } catch (error) {
   *   if (error.message.includes('CORS')) {
   *     // Show fallback option: paste content manually
   *   }
   * }
   * ```
   */
  async fetchURL(url: string): Promise<URLFetchResult> {
    // Validate URL format
    this.validateURL(url);

    try {
      // Fetch URL
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();

      // Parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Extract title
      const title = extractTitle(doc, url);

      // Extract main content
      const content = extractMainContent(doc);

      // Calculate word count
      const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;

      return {
        title,
        content,
        wordCount,
        url,
      };
    } catch (error) {
      // Enhance error messages for common issues
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          throw new Error(`Failed to fetch URL. The site may be blocking requests or the URL may be invalid.`);
        }
        // CORS errors typically show as "Failed to fetch" with specific message
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          throw new Error(
            'Cannot fetch URL due to CORS restrictions. ' +
            'Please try copying and pasting the content directly, ' +
            'or use a browser extension to save the page as text.'
          );
        }
      }
      throw error;
    }
  }

  /**
   * Validate URL format
   *
   * @param url - URL to validate
   * @throws Error if URL is invalid
   */
  private validateURL(url: string): void {
    try {
      new URL(url);
    } catch {
      throw new Error('Invalid URL format. Please enter a complete URL (e.g., https://example.com).');
    }
  }

  /**
   * Check if URL is accessible (pre-flight check)
   *
   * @param url - URL to check
   * @returns true if URL appears accessible
   */
  async isAccessible(url: string): Promise<boolean> {
    try {
      this.validateURL(url);
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Fetch URL with Gemini-enhanced analysis
   *
   * @param url - URL to fetch and analyze
   * @param options - Fetch options including Gemini API key
   * @returns Enhanced URLFetchResult with metadata
   * @throws Error if URL is invalid, blocked by CORS, or unreachable
   */
  async fetchURLWithGemini(
    url: string,
    options: URLFetchOptions = {}
  ): Promise<URLFetchResult> {
    // First, do basic extraction
    const basicResult = await this.fetchURL(url);

    // If Gemini processing is requested and API key is provided
    if (options.useGemini && options.geminiApiKey) {
      try {
        // Fetch the HTML content for Gemini analysis
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch URL: ${response.status}`);
        }
        const html = await response.text();

        // Dynamically import to avoid circular dependency
        const { createGeminiURLProcessor } = await import('./gemini-url-processor');

        // Process with Gemini
        const processor = createGeminiURLProcessor(options.geminiApiKey);
        const enhanced = await processor.processURL(url, html, {
          generateSummary: true,
          detectLinks: true,
          inferMetadata: true,
          onProgress: (progress) => {
            console.log(`[URL Fetcher] ${progress.stage}`);
          },
        });

        // Merge results
        return {
          ...basicResult,
          title: enhanced.title || basicResult.title,
          content: enhanced.cleanContent || basicResult.content,
          wordCount: enhanced.cleanContent
            ? enhanced.cleanContent.split(/\s+/).filter(w => w.length > 0).length
            : basicResult.wordCount,
          metadata: {
            author: enhanced.author,
            publishedDate: enhanced.publishedDate,
            contentType: enhanced.contentType,
            readingTimeMinutes: enhanced.readingTimeMinutes,
            summary: enhanced.summary,
            tags: enhanced.tags,
            relatedLinks: enhanced.relatedLinks,
            mainImageUrl: enhanced.mainImageUrl,
          },
        };
      } catch (error) {
        console.error('[URL Fetcher] Gemini processing failed, using basic extraction:', error);
        // Continue with basic result if Gemini fails
      }
    }

    return basicResult;
  }
}

/**
 * Singleton instance for convenience
 */
export const urlFetcher = new URLFetcher();
