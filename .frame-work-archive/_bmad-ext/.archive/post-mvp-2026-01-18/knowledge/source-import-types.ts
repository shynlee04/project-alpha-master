/**
 * @fileoverview Source import types
 * @module lib/knowledge/source-import-types
 */

export type SourceType = 'pdf' | 'url' | 'note' | 'document' | 'markdown' | 'text';

export interface SourceImportOptions {
  tags?: string[];
  chunkContent?: boolean;
  chunkSize?: number;
  extractImages?: boolean;
  preserveFormatting?: boolean;
}

export interface SourceImportResult {
  success: boolean;
  source?: {
    id: string;
    type: SourceType;
    title: string;
    content: string;
    metadata: {
      description?: string;
      keywords?: string[];
      readingTime: number;
      importedAt: Date;
      chunkCount?: number;
    };
    tags: string[];
    subjects: string[];
  };
  error?: string;
  duration: number;
}

export interface SourceValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

export interface BatchImportResult {
  total: number;
  successful: number;
  failed: number;
  results: SourceImportResult[];
}
