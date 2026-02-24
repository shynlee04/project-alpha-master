/**
 * @fileoverview URL content extractor
 * @module lib/knowledge/url-fetcher-content-extractor
 *
 * **DEFERRED - Post-MVP Archive**
 */

import type { URLFetchResult } from './url-fetcher-types';

export interface ContentExtractorOptions {
  extractMainContent?: boolean;
  removeNavigation?: boolean;
  removeFooter?: boolean;
  maxLength?: number;
}

export interface ExtractedContent {
  text: string;
  links: { url: string; text: string }[];
  images: { src: string; alt: string }[];
  headings: { level: number; text: string }[];
}

/**
 * Extract structured content from fetched URL
 */
export function extractContent(
  result: URLFetchResult,
  options: ContentExtractorOptions = {}
): ExtractedContent | null {
  if (!result.success || !result.content) {
    return null;
  }

  const {
    extractMainContent = true,
    removeNavigation = true,
    removeFooter = true,
    maxLength = 50000,
  } = options;

  let text = result.content;

  // Remove navigation elements
  if (removeNavigation) {
    text = text.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
    text = text.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
  }

  // Remove footer elements
  if (removeFooter) {
    text = text.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
  }

  // Extract main content area if available
  if (extractMainContent) {
    const mainMatch = text.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    if (mainMatch) {
      text = mainMatch[1];
    }
  }

  // Extract links
  const linkPattern = /<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
  const links: ExtractedContent['links'] = [];
  let match;

  while ((match = linkPattern.exec(text)) !== null) {
    links.push({
      url: match[1],
      text: match[2].trim(),
    });
  }

  // Extract images
  const imgPattern = /<img[^>]+src="([^"]+)"[^>]+alt="([^"]*)"[^>]*>/gi;
  const images: ExtractedContent['images'] = [];

  while ((match = imgPattern.exec(text)) !== null) {
    images.push({
      src: match[1],
      alt: match[2],
    });
  }

  // Extract headings
  const headingPattern = /<h([1-6])[^>]*>([^<]+)<\/h\1>/gi;
  const headings: ExtractedContent['headings'] = [];

  while ((match = headingPattern.exec(text)) !== null) {
    headings.push({
      level: parseInt(match[1], 10),
      text: match[2].trim(),
    });
  }

  // Convert to plain text
  text = text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

  // Limit length
  if (maxLength && text.length > maxLength) {
    text = text.substring(0, maxLength) + '...';
  }

  return {
    text,
    links,
    images,
    headings,
  };
}
