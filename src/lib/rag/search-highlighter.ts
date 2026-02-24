/**
 * @fileoverview Text Highlighting Utility
 * @module lib/rag/search-highlighter
 * @governance EPIC-7-4
 *
 * Highlights matching text in search results using safe regex.
 * Preserves markdown formatting and HTML structure.
 */

/**
 * Search highlighter utility
 */
export class SearchHighlighter {
  /**
   * Highlight matching terms in text
   *
   * @param text - Original text
   * @param queryTerms - Terms to highlight
   * @returns Text with HTML <mark> tags around matches
   */
  highlight(text: string, queryTerms: string[]): string {
    if (!queryTerms.length || !text) {
      return text;
    }

    // Escape special regex characters in query terms
    const escapedTerms = queryTerms.map((term) => this.escapeRegex(term));

    // Create regex pattern (case-insensitive)
    const pattern = new RegExp(`(${escapedTerms.join('|')})`, 'gi');

    // Replace matches with highlighted version
    return text.replace(pattern, '<mark>$1</mark>');
  }

  /**
   * Extract matched terms from search result
   *
   * @param text - Result text
   * @param queryTerms - Search query terms
   * @returns Array of matched terms
   */
  extractMatchedTerms(text: string, queryTerms: string[]): string[] {
    const matched = new Set<string>();
    const lowerText = text.toLowerCase();

    queryTerms.forEach((term) => {
      const lowerTerm = term.toLowerCase();
      if (lowerText.includes(lowerTerm)) {
        matched.add(term);
      }
    });

    return Array.from(matched);
  }

  /**
   * Escape special regex characters to prevent regex injection
   *
   * @param text - Text to escape
   * @returns Escaped text safe for regex
   */
  private escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

/**
 * Singleton instance
 */
const highlighterInstance = new SearchHighlighter();

export function highlightText(text: string, queryTerms: string[]): string {
  return highlighterInstance.highlight(text, queryTerms);
}

export function extractMatchedTerms(text: string, queryTerms: string[]): string[] {
  return highlighterInstance.extractMatchedTerms(text, queryTerms);
}
