/**
 * Fuzzy Search for Command Palette
 *
 * Fast, fuzzy matching algorithm with relevance scoring and highlighting.
 * Optimized for 1000+ commands/files.
 */

import React from 'react';

export interface MatchResult {
  text: string;
  score: number;
  matches: number[];
}

export interface SearchResult<T> {
  item: T;
  score: number;
  highlights: Map<string, number[]>;
}

/**
 * Calculate fuzzy match score
 * Higher score = better match
 */
export function fuzzyScore(text: string, query: string): number {
  if (!query) {
    return 0;
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Exact match (highest score)
  if (lowerText === lowerQuery) {
    return 100;
  }

  // Starts with query
  if (lowerText.startsWith(lowerQuery)) {
    return 90;
  }

  // Contains query as whole word
  if (lowerText.includes(lowerQuery)) {
    return 70;
  }

  // Fuzzy match: consecutive characters
  let score = 0;
  let textIndex = 0;
  let queryIndex = 0;
  let consecutiveMatches = 0;

  while (textIndex < lowerText.length && queryIndex < lowerQuery.length) {
    if (lowerText[textIndex] === lowerQuery[queryIndex]) {
      consecutiveMatches++;
      queryIndex++;

      // Bonus for consecutive matches
      score += 10 * consecutiveMatches;

      // Bonus for word boundary match
      if (
        textIndex === 0 ||
        lowerText[textIndex - 1] === ' ' ||
        lowerText[textIndex - 1] === '-' ||
        lowerText[textIndex - 1] === '_'
      ) {
        score += 15;
      }
    } else {
      consecutiveMatches = 0;
    }

    textIndex++;
  }

  // All query characters matched
  if (queryIndex === lowerQuery.length) {
    score += 50;
  }

  // Penalty for gaps
  const gapPenalty = textIndex - queryIndex;
  score -= gapPenalty * 2;

  return Math.max(0, score);
}

/**
 * Find all match positions
 */
export function findMatches(text: string, query: string): number[] {
  if (!query) {
    return [];
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matches: number[] = [];

  for (let i = 0; i < lowerText.length; i++) {
    let queryIndex = 0;

    for (let j = i; j < lowerText.length && queryIndex < lowerQuery.length; j++) {
      if (lowerText[j] === lowerQuery[queryIndex]) {
        matches.push(j);
        queryIndex++;
      }
    }

    if (queryIndex === lowerQuery.length) {
      return matches;
    }

    matches.length = 0;
  }

  return matches;
}

/**
 * Highlight matched characters in text
 */
export function highlightMatches(
  text: string,
  matches: number[]
): React.ReactNode {
  if (!matches.length) {
    return text;
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  matches.forEach((index, i) => {
    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }

    parts.push(
      <mark
        key={`match-${i}`}
        className="bg-primary/30 text-primary-foreground rounded px-0.5"
      >
        {text[index]}
      </mark>
    );

    lastIndex = index + 1;
  });

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}

/**
 * Fuzzy search with multiple fields
 */
export function fuzzySearch<T>(
  items: T[],
  query: string,
  options: {
    fields: (keyof T)[];
    threshold?: number;
    maxResults?: number;
  }
): SearchResult<T>[] {
  const { fields, threshold = 30, maxResults = 100 } = options;

  if (!query) {
    return items.slice(0, maxResults).map((item) => ({
      item,
      score: 0,
      highlights: new Map(),
    }));
  }

  const results = items
    .map((item) => {
      let totalScore = 0;
      const highlights = new Map<string, number[]>();

      for (const field of fields) {
        const value = String(item[field] || '');
        const score = fuzzyScore(value, query);
        const matches = findMatches(value, query);

        if (score > 0) {
          totalScore += score;
          highlights.set(String(field), matches);
        }
      }

      return { item, score: totalScore, highlights };
    })
    .filter((result) => result.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);

  return results;
}

/**
 * Rank and sort commands by relevance
 */
export function rankByRelevance<T>(
  items: T[],
  getRelevance: (item: T) => number
): T[] {
  return items
    .map((item) => ({ item, relevance: getRelevance(item) }))
    .sort((a, b) => b.relevance - a.relevance)
    .map((result) => result.item);
}

/**
 * Optimized search for large datasets (1000+ items)
 * Uses indexing for faster lookups
 */
export class FuzzySearchIndex<T> {
  private index = new Map<string, T[]>();
  private items: T[] = [];
  private fields: (keyof T)[] = [];

  constructor(items: T[], fields: (keyof T)[]) {
    this.items = items;
    this.fields = fields;
    this.buildIndex();
  }

  /**
   * Build search index
   */
  private buildIndex(): void {
    this.index.clear();

    this.items.forEach((item) => {
      for (const field of this.fields) {
        const value = String(item[field] || '').toLowerCase();

        // Index by words
        const words = value.split(/\s+/);
        words.forEach((word) => {
          if (word.length < 2) return;

          if (!this.index.has(word)) {
            this.index.set(word, []);
          }
          this.index.get(word)!.push(item);
        });

        // Index by prefixes (first 3 characters)
        if (value.length >= 3) {
          const prefix = value.substring(0, 3);
          if (!this.index.has(prefix)) {
            this.index.set(prefix, []);
          }
          this.index.get(prefix)!.push(item);
        }
      }
    });
  }

  /**
   * Search using index
   */
  search(query: string, maxResults: number = 100): SearchResult<T>[] {
    if (!query) {
      return this.items.slice(0, maxResults).map((item) => ({
        item,
        score: 0,
        highlights: new Map(),
      }));
    }

    const lowerQuery = query.toLowerCase();
    const candidates = new Set<T>();

    // Find candidates from index
    const words = lowerQuery.split(/\s+/);
    words.forEach((word) => {
      // Direct lookup
      const direct = this.index.get(word);
      if (direct) {
        direct.forEach((item) => candidates.add(item));
      }

      // Prefix lookup
      if (word.length >= 3) {
        const prefix = word.substring(0, 3);
        const prefixMatches = this.index.get(prefix);
        if (prefixMatches) {
          prefixMatches.forEach((item) => candidates.add(item));
        }
      }
    });

    // If no candidates from index, search all items
    if (candidates.size === 0) {
      return fuzzySearch(this.items, query, {
        fields: this.fields,
        maxResults,
      });
    }

    // Score candidates
    const results = fuzzySearch(Array.from(candidates), query, {
      fields: this.fields,
      maxResults,
    });

    return results;
  }

  /**
   * Update items and rebuild index
   */
  updateItems(items: T[]): void {
    this.items = items;
    this.buildIndex();
  }

  /**
   * Get index size (for debugging)
   */
  getIndexSize(): number {
    return this.index.size;
  }
}

/**
 * Highlight text with fuzzy matches
 */
export function highlightFuzzy(
  text: string,
  query: string
): React.ReactNode {
  const matches = findMatches(text, query);
  return highlightMatches(text, matches);
}
