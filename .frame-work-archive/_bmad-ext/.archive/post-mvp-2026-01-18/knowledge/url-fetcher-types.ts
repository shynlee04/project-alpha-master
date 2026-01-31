/**
 * @fileoverview URL fetcher types
 * @module lib/knowledge/url-fetcher-types
 */

export interface URLFetchResult {
  success: boolean;
  url: string;
  title?: string;
  content?: string;
  contentType?: string;
  wordCount?: number;
  error?: string;
  metadata?: {
    finalUrl?: string;
    contentLength?: number;
    contentLanguage?: string;
  };
}

export interface URLFetchOptions {
  timeout?: number;
  extractImages?: boolean;
  maxContentLength?: number;
  headers?: Record<string, string>;
}

export interface CachedFetchResult extends URLFetchResult {
  cachedAt: Date;
  expiresAt: Date;
}

export interface BatchFetchResult {
  total: number;
  successful: number;
  failed: number;
  results: URLFetchResult[];
}
