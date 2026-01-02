/**
 * @fileoverview Citation Formatter for RAG Chat
 * @module lib/rag/citation-formatter
 * @governance EPIC-7-5
 *
 * Formats retrieved chunks into citations and builds RAG context prompts.
 */

import type { Citation, ExtendedSearchResult, RAGContext } from './types';

/**
 * Citation formatter service
 *
 * Formats retrieved chunks into citations and builds context for RAG generation.
 */
export class CitationFormatter {
  /**
   * Format search results as citations
   *
   * @param results - Search results from hybrid retrieval
   * @returns Array of citations (1-indexed)
   */
  formatCitations(results: ExtendedSearchResult[]): Citation[] {
    return results.map((result, index) => {
      const passage = result.highlightedText || result.document.content;
      const fullContent = result.document.content;

      return {
        id: index + 1, // 1-indexed for display: [1], [2], [3]
        sourceId: result.document.id,
        title: result.document.title,
        passage,
        contextBefore: this.extractContextBefore(fullContent, passage),
        contextAfter: this.extractContextAfter(fullContent, passage),
        position: result.document.position,
        score: result.score,
      };
    });
  }

  /**
   * Extract text before the passage (±500 chars)
   *
   * @param fullContent - Full document content
   * @param passage - The passage to find context for
   * @returns Text before the passage (up to 500 chars)
   */
  private extractContextBefore(fullContent: string, passage: string): string {
    const passageIndex = fullContent.indexOf(passage);
    if (passageIndex === -1) return '';

    const contextStart = Math.max(0, passageIndex - 500);
    const contextBefore = fullContent.slice(contextStart, passageIndex).trim();

    // Ensure we break at sentence boundary
    const lastSentenceEnd = contextBefore.lastIndexOf('. ');
    if (lastSentenceEnd !== -1 && contextBefore.length - lastSentenceEnd < 200) {
      return contextBefore.slice(lastSentenceEnd + 2).trim();
    }

    return contextBefore.slice(-200).trim(); // Last 200 chars max
  }

  /**
   * Extract text after the passage (±500 chars)
   *
   * @param fullContent - Full document content
   * @param passage - The passage to find context for
   * @returns Text after the passage (up to 500 chars)
   */
  private extractContextAfter(fullContent: string, passage: string): string {
    const passageIndex = fullContent.indexOf(passage);
    if (passageIndex === -1) return '';

    const passageEnd = passageIndex + passage.length;
    const contextEnd = Math.min(fullContent.length, passageEnd + 500);
    const contextAfter = fullContent.slice(passageEnd, contextEnd).trim();

    // Ensure we break at sentence boundary
    const firstSentenceEnd = contextAfter.indexOf('. ');
    if (firstSentenceEnd !== -1 && firstSentenceEnd < 200) {
      return contextAfter.slice(0, firstSentenceEnd + 1).trim();
    }

    return contextAfter.slice(0, 200).trim(); // First 200 chars max
  }

  /**
   * Build RAG context from retrieved chunks
   *
   * @param results - Search results from hybrid retrieval
   * @param query - Original query
   * @returns RAG context object
   */
  buildContext(results: ExtendedSearchResult[], query: string): RAGContext {
    return {
      chunks: results.map((result) => ({
        id: result.document.id,
        sourceId: result.document.sourceId,
        title: result.document.title,
        content: result.document.content,
        position: result.document.position,
        score: result.score,
      })),
      query,
      windowSize: results.length,
    };
  }

  /**
   * Build prompt with context for RAG generation
   *
   * @param context - RAG context object
   * @param query - User query
   * @returns Formatted prompt string
   */
  buildPrompt(context: RAGContext, query: string): string {
    const contextText = this.formatContextForPrompt(context);

    return `Answer the following question using the provided sources. Cite your answers using [source_number] notation.

${contextText}

Question: ${query}

Instructions:
- Use information from the provided sources
- Cite each claim with [source_number] (e.g., [1], [2])
- If multiple sources support the same point, cite all of them (e.g., [1][3])
- If sources don't contain the answer, say so clearly
- Do not make up information beyond what's provided`;
  }

  /**
   * Format context chunks as structured text for prompt
   *
   * @param context - RAG context object
   * @returns Formatted context string
   */
  private formatContextForPrompt(context: RAGContext): string {
    return context.chunks
      .map((chunk, index) => {
        const title = chunk.title || 'Untitled';
        const content = chunk.content;
        return `[Source ${index + 1}]
Title: ${title}
Content: ${content}`;
      })
      .join('\n\n---\n\n');
  }

  /**
   * Extract citation references from AI response text
   *
   * Parses response text for citation patterns like [1], [2], etc.
   *
   * @param response - AI response text
   * @returns Array of citation IDs found in response
   */
  extractCitationReferences(response: string): number[] {
    const citationPattern = /\[(\d+)\]/g;
    const citations = new Set<number>();

    let match;
    while ((match = citationPattern.exec(response)) !== null) {
      const id = parseInt(match[1], 10);
      citations.add(id);
    }

    return Array.from(citations).sort((a, b) => a - b);
  }

  /**
   * Create citations map for efficient lookup
   *
   * @param citations - Array of citations
   * @returns Map of citation ID to citation object
   */
  createCitationsMap(citations: Citation[]): Map<string, Citation> {
    const map = new Map<string, Citation>();
    citations.forEach((citation) => {
      map.set(String(citation.id), citation);
    });
    return map;
  }
}

/**
 * Singleton instance
 */
const formatterInstance = new CitationFormatter();

export function formatCitations(results: ExtendedSearchResult[]): Citation[] {
  return formatterInstance.formatCitations(results);
}

export function buildContext(results: ExtendedSearchResult[], query: string): RAGContext {
  return formatterInstance.buildContext(results, query);
}

export function buildPrompt(context: RAGContext, query: string): string {
  return formatterInstance.buildPrompt(context, query);
}

export function extractCitationReferences(response: string): number[] {
  return formatterInstance.extractCitationReferences(response);
}

export function createCitationsMap(citations: Citation[]): Map<string, Citation> {
  return formatterInstance.createCitationsMap(citations);
}
