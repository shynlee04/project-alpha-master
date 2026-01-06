/**
 * @fileoverview Search Indexer
 * @module lib/search/search-indexer
 *
 * Full-text search indexer for files and content.
 * Provides inverted index for fast text search with highlighting support.
 *
 * @story S-027 Advanced Search with Filters
 */

export interface SearchDocument {
  /** Unique document identifier */
  id: string;

  /** File path */
  path: string;

  /** File name */
  filename: string;

  /** File extension */
  extension: string;

  /** Document content */
  content: string;

  /** File size in bytes */
  size: number;

  /** Creation timestamp */
  createdAt: Date;

  /** Last modified timestamp */
  modifiedAt: Date;

  /** Author/creator */
  author?: string;

  /** Tags */
  tags: string[];

  /** Project ID */
  projectId?: string;
}

export interface SearchMatch {
  /** Line number where match occurs */
  line: number;

  /** Column number where match starts */
  column: number;

  /** Match length */
  length: number;

  /** Preview text around match */
  preview: string;

  /** Matched text */
  matchedText: string;
}

export interface SearchResult {
  /** Document */
  document: SearchDocument;

  /** Relevance score (0-1) */
  score: number;

  /** Matches found */
  matches: SearchMatch[];

  /** Total match count */
  matchCount: number;
}

export interface SearchFilters {
  /** File type filter */
  fileTypes?: string[];

  /** Date range filter */
  dateRange?: {
    from?: Date;
    to?: Date;
    lastDays?: number;
  };

  /** Tags filter */
  tags?: string[];

  /** Author filter */
  author?: string;

  /** File size filter (bytes) */
  sizeRange?: {
    min?: number;
    max?: number;
  };

  /** Project filter */
  projectId?: string;
}

export interface SearchOptions {
  /** Case sensitive search */
  caseSensitive?: boolean;

  /** Use regex */
  regex?: boolean;

  /** Maximum results */
  maxResults?: number;

  /** Preview length */
  previewLength?: number;
}

/**
 * Search Indexer Class
 *
 * Builds and maintains an inverted index for fast full-text search.
 */
class SearchIndexerClass {
  private index: Map<string, Set<string>> = new Map();
  private documents: Map<string, SearchDocument> = new Map();
  private trigramIndex: Map<string, Set<string>> = new Map();

  /**
   * Add or update a document in the index
   */
  indexDocument(document: SearchDocument): void {
    const { id, content, filename } = document;

    // Store document
    this.documents.set(id, document);

    // Clear existing index entries for this document
    this.removeDocumentFromIndex(id);

    // Tokenize content
    const tokens = this.tokenize(content);
    const trigrams = this.generateTrigrams(content.toLowerCase());

    // Build inverted index
    for (const token of tokens) {
      if (!this.index.has(token)) {
        this.index.set(token, new Set());
      }
      this.index.get(token)!.add(id);
    }

    // Build trigram index for fuzzy search
    for (const trigram of trigrams) {
      if (!this.trigramIndex.has(trigram)) {
        this.trigramIndex.set(trigram, new Set());
      }
      this.trigramIndex.get(trigram)!.add(id);
    }
  }

  /**
   * Remove document from index
   */
  removeDocument(id: string): void {
    this.removeDocumentFromIndex(id);
    this.documents.delete(id);
  }

  /**
   * Search documents with filters
   */
  search(
    query: string,
    filters: SearchFilters = {},
    options: SearchOptions = {}
  ): SearchResult[] {
    const {
      caseSensitive = false,
      maxResults = 100,
      previewLength = 100,
    } = options;

    if (!query.trim()) {
      return [];
    }

    // Get candidate documents from index
    const candidates = this.findCandidates(query, caseSensitive);

    // Apply filters
    const filtered = this.applyFilters(candidates, filters);

    // Score and rank results
    const results: SearchResult[] = filtered.map((doc) => {
      const matches = this.findMatches(doc, query, caseSensitive, previewLength);
      const score = this.calculateScore(doc, matches, query);

      return {
        document: doc,
        score,
        matches: matches.slice(0, 20), // Limit matches per document
        matchCount: matches.length,
      };
    });

    // Sort by score (descending)
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, maxResults);
  }

  /**
   * Get all indexed documents
   */
  getAllDocuments(): SearchDocument[] {
    return Array.from(this.documents.values());
  }

  /**
   * Get document by ID
   */
  getDocument(id: string): SearchDocument | undefined {
    return this.documents.get(id);
  }

  /**
   * Clear entire index
   */
  clear(): void {
    this.index.clear();
    this.trigramIndex.clear();
    this.documents.clear();
  }

  /**
   * Get index statistics
   */
  getStats() {
    return {
      documentCount: this.documents.size,
      tokenCount: this.index.size,
      trigramCount: this.trigramIndex.size,
    };
  }

  /**
   * Remove document from index (internal)
   */
  private removeDocumentFromIndex(id: string): void {
    for (const [token, docIds] of this.index.entries()) {
      docIds.delete(id);
      if (docIds.size === 0) {
        this.index.delete(token);
      }
    }

    for (const [trigram, docIds] of this.trigramIndex.entries()) {
      docIds.delete(id);
      if (docIds.size === 0) {
        this.trigramIndex.delete(trigram);
      }
    }
  }

  /**
   * Tokenize text into words
   */
  private tokenize(text: string): string[] {
    const tokens: string[] = [];

    // Split by word boundaries
    const words = text.match(/\b\w+\b/g) || [];

    for (const word of words) {
      // Add whole word
      tokens.push(word);

      // Add subwords for camelCase and PascalCase
      const subwords = word.split(/(?=[A-Z])/);
      if (subwords.length > 1) {
        tokens.push(...subwords.filter(w => w.length > 2));
      }
    }

    return tokens;
  }

  /**
   * Generate trigrams for fuzzy search
   */
  private generateTrigrams(text: string): string[] {
    const trigrams: string[] = [];

    for (let i = 0; i <= text.length - 3; i++) {
      const trigram = text.substring(i, i + 3);
      if (trigram.trim().length === 3) {
        trigrams.push(trigram);
      }
    }

    return trigrams;
  }

  /**
   * Find candidate documents using inverted index
   */
  private findCandidates(query: string, caseSensitive: boolean): SearchDocument[] {
    const searchQuery = caseSensitive ? query : query.toLowerCase();
    const tokens = this.tokenize(searchQuery);
    const candidateIds = new Set<string>();

    // Exact phrase match
    if (tokens.length === 1) {
      const docs = this.index.get(tokens[0]);
      if (docs) {
        docs.forEach(id => candidateIds.add(id));
      }
    } else {
      // All tokens must be present (AND logic)
      const tokenSets = tokens.map(t => this.index.get(t));

      if (tokenSets.some(set => !set || set.size === 0)) {
        return []; // No matches if any token is missing
      }

      // Intersection of all token sets
      const [firstSet, ...restSets] = tokenSets;
      firstSet!.forEach(id => {
        if (restSets.every(set => set!.has(id))) {
          candidateIds.add(id);
        }
      });
    }

    // Fuzzy match using trigrams if no exact matches
    if (candidateIds.size === 0) {
      const trigrams = this.generateTrigrams(searchQuery);
      const fuzzyIds = new Set<string>();

      for (const trigram of trigrams) {
        const docs = this.trigramIndex.get(trigram);
        if (docs) {
          docs.forEach(id => fuzzyIds.add(id));
        }
      }

      fuzzyIds.forEach(id => candidateIds.add(id));
    }

    return Array.from(candidateIds)
      .map(id => this.documents.get(id))
      .filter((doc): doc is SearchDocument => doc !== undefined);
  }

  /**
   * Apply filters to documents
   */
  private applyFilters(documents: SearchDocument[], filters: SearchFilters): SearchDocument[] {
    return documents.filter(doc => {
      // File type filter
      if (filters.fileTypes && filters.fileTypes.length > 0) {
        const ext = doc.extension.toLowerCase();
        if (!filters.fileTypes.some(type => {
          const typeLower = type.toLowerCase();
          return ext === typeLower || ext === `.${typeLower}`;
        })) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange) {
        const { from, to, lastDays } = filters.dateRange;
        const modified = doc.modifiedAt.getTime();

        if (lastDays) {
          const cutoff = Date.now() - (lastDays * 24 * 60 * 60 * 1000);
          if (modified < cutoff) return false;
        } else {
          if (from && modified < from.getTime()) return false;
          if (to && modified > to.getTime()) return false;
        }
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        if (!filters.tags.some(tag => doc.tags.includes(tag))) {
          return false;
        }
      }

      // Author filter
      if (filters.author) {
        if (doc.author !== filters.author) {
          return false;
        }
      }

      // Size filter
      if (filters.sizeRange) {
        const { min, max } = filters.sizeRange;
        if (min && doc.size < min) return false;
        if (max && doc.size > max) return false;
      }

      // Project filter
      if (filters.projectId && doc.projectId !== filters.projectId) {
        return false;
      }

      return true;
    });
  }

  /**
   * Find all matches in document
   */
  private findMatches(
    doc: SearchDocument,
    query: string,
    caseSensitive: boolean,
    previewLength: number
  ): SearchMatch[] {
    const matches: SearchMatch[] = [];
    const content = caseSensitive ? doc.content : doc.content.toLowerCase();
    const searchQuery = caseSensitive ? query : query.toLowerCase();

    const lines = doc.content.split('\n');

    let index = 0;
    while ((index = content.indexOf(searchQuery, index)) !== -1) {
      // Find line number
      let lineNum = 0;
      let lineStart = 0;
      for (let i = 0; i < lines.length; i++) {
        const lineLen = lines[i].length + 1; // +1 for newline
        if (index < lineStart + lineLen) {
          lineNum = i;
          break;
        }
        lineStart += lineLen;
      }

      // Calculate column
      const column = index - lineStart;

      // Generate preview
      const line = lines[lineNum];
      const matchStartInLine = Math.max(0, column - previewLength / 2);
      const matchEndInLine = Math.min(line.length, column + query.length + previewLength / 2);
      const preview = line.substring(matchStartInLine, matchEndInLine);

      matches.push({
        line: lineNum + 1,
        column,
        length: query.length,
        preview,
        matchedText: query,
      });

      index += query.length;
    }

    return matches;
  }

  /**
   * Calculate relevance score
   */
  private calculateScore(doc: SearchDocument, matches: SearchMatch[], query: string): number {
    let score = 0;

    // Match frequency (more matches = higher score)
    score += Math.min(matches.length * 0.1, 0.5);

    // Filename match boost
    if (doc.filename.toLowerCase().includes(query.toLowerCase())) {
      score += 0.3;
    }

    // Path match boost
    if (doc.path.toLowerCase().includes(query.toLowerCase())) {
      score += 0.1;
    }

    // Tag match boost
    if (doc.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))) {
      score += 0.1;
    }

    return Math.min(score, 1);
  }
}

/**
 * Global singleton instance
 */
export const SearchIndexer = new SearchIndexerClass();

/**
 * Convert bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Get file type from extension
 */
export function getFileType(extension: string): string {
  const ext = extension.toLowerCase();

  const codeFiles = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte'];
  const markupFiles = ['.html', '.htm', '.md', '.markdown', '.css', '.scss', '.sass', '.less'];
  const dataFiles = ['.json', '.yaml', '.yml', '.xml', '.toml', '.ini'];
  const assetFiles = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'];

  if (codeFiles.includes(ext)) return 'code';
  if (markupFiles.includes(ext)) return 'markup';
  if (dataFiles.includes(ext)) return 'data';
  if (assetFiles.includes(ext)) return 'asset';

  return 'other';
}
