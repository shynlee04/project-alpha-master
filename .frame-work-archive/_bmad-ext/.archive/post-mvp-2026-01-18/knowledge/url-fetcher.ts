/**
 * @fileoverview URL content fetcher
 * @module lib/knowledge/url-fetcher
 *
 * **DEFERRED - Post-MVP Archive**
 * See: _bmad-ext/.archive/post-mvp-2026-01-18/DEFER-log.md
 */

import type { URLFetchResult } from './url-fetcher-types';

/**
 * Fetch and extract content from a URL
 */
export class URLFetcher {
  private timeout: number;
  private userAgent: string;

  constructor(options: { timeout?: number; userAgent?: string } = {}) {
    this.timeout = options.timeout || 30000;
    this.userAgent = options.userAgent || 'Mozilla/5.0 (compatible; KnowledgeBot/1.0)';
  }

  /**
   * Fetch URL and extract content
   */
  async fetch(url: string): Promise<URLFetchResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': this.userAgent,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          url,
        };
      }

      const contentType = response.headers.get('content-type') || '';
      const html = await response.text();

      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : url;

      // Extract main content
      const content = this.extractMainContent(html);

      return {
        success: true,
        url,
        title,
        content,
        contentType,
        wordCount: content.split(/\s+/).length,
        metadata: {
          finalUrl: response.url,
          contentLength: html.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        url,
      };
    }
  }

  /**
   * Extract main content from HTML
   */
  private extractMainContent(html: string): string {
    // Simple content extraction - remove scripts, styles, etc.
    let content = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      // Remove remaining tags
      .replace(/<[^>]+>/g, ' ')
      // Decode HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .trim();

    return content;
  }
}

/**
 * Singleton instance
 */
export const urlFetcher = new URLFetcher();
