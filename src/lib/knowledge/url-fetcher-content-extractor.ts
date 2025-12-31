/**
 * @fileoverview URL Fetcher Content Extraction
 * @module lib/knowledge/url-fetcher-content-extractor
 * @governance EPIC-6-1, PHASE-5
 *
 * Content extraction utilities for web pages.
 * Removes navigation, ads, and other non-content elements.
 */

/**
 * Selectors for elements to remove during content extraction
 */
export const SELECTORS_TO_REMOVE = [
  // Navigation
  'nav',
  '[role="navigation"]',
  '.navigation',
  '.nav',
  '.navbar',
  '.menu',
  // Complementary content
  '[role="complementary"]',
  'aside',
  '.sidebar',
  // Ads
  '.advertisement',
  '.ad',
  '.ads',
  '[class*="ad-"]',
  // Footer
  'footer',
  '.footer',
  // Scripts and styles
  'script',
  'style',
  'noscript',
  // Header (keep title, remove nav headers)
  'header:not(:has(h1))',
  // Comments
  '.comments',
  '#comments',
  // Social media
  '.social',
  '.share',
  // Media
  'video',
  'audio',
  'iframe',
  // Forms
  'form',
  'input',
  'button',
];

/**
 * Selectors for main content detection (in priority order)
 */
export const MAIN_CONTENT_SELECTORS = [
  'article',
  'main',
  '[role="main"]',
  '.content',
  '.article',
  '.post',
  'article',
  '#content',
  '#article',
  '#main',
];

/**
 * Extract page title from meta tags or page title
 *
 * @param doc - Parsed HTML document
 * @param url - Fallback URL if no title found
 * @returns Page title
 */
export function extractTitle(doc: Document, url: string): string {
  // Try Open Graph title first
  const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
  if (ogTitle) {
    return ogTitle;
  }

  // Try Twitter title
  const twitterTitle = doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
  if (twitterTitle) {
    return twitterTitle;
  }

  // Try page title
  const titleTag = doc.querySelector('title')?.textContent;
  if (titleTag) {
    return titleTag.trim();
  }

  // Try h1 as fallback
  const h1 = doc.querySelector('h1')?.textContent;
  if (h1) {
    return h1.trim();
  }

  // Fallback to URL domain
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

/**
 * Extract main content by removing non-content elements
 *
 * @param doc - Parsed HTML document
 * @returns Clean main content text
 */
export function extractMainContent(doc: Document): string {
  // Remove unwanted elements
  SELECTORS_TO_REMOVE.forEach(selector => {
    doc.querySelectorAll(selector).forEach(el => el.remove());
  });

  // Find main content element
  const mainElement = MAIN_CONTENT_SELECTORS
    .map(selector => doc.querySelector(selector))
    .find(el => el !== null);

  // Fall back to body if no main content found
  const contentElement = mainElement || doc.body;

  // Extract and clean text
  const text = contentElement?.textContent || '';

  // Clean up whitespace
  return cleanText(text);
}

/**
 * Clean text content
 *
 * @param text - Raw text
 * @returns Cleaned text with normalized whitespace
 */
export function cleanText(text: string): string {
  return text
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    // Remove leading/trailing whitespace
    .trim();
}
