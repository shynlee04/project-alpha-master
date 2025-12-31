/**
 * @fileoverview URL Fetcher Types
 * @module lib/knowledge/url-fetcher-types
 * @governance EPIC-6-1, PHASE-5
 */

/**
 * URL fetch result with extracted content
 */
export interface URLFetchResult {
  /** Page title */
  title: string;
  /** Main content text */
  content: string;
  /** Estimated word count */
  wordCount: number;
  /** Original URL */
  url: string;
  /** Optional enhanced metadata from Gemini */
  metadata?: {
    author?: string;
    publishedDate?: string;
    contentType?: string;
    readingTimeMinutes?: number;
    summary?: string;
    tags?: string[];
    relatedLinks?: Array<{
      url: string;
      title?: string;
      relevance: string;
    }>;
    mainImageUrl?: string;
  };
}

/**
 * URL fetch options
 */
export interface URLFetchOptions {
  /** Use Gemini for enhanced analysis (requires API key) */
  useGemini?: boolean;
  /** Gemini API key (required if useGemini is true) */
  geminiApiKey?: string;
}
