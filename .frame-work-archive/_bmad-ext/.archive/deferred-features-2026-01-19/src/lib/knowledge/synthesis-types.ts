/**
 * @file Stub for archived knowledge module
 * @deprecated This module is archived for MVP
 */

export type ArtifactType = 'quiz' | 'flashcard' | 'summary' | 'note';

export interface SynthesisResult {
  success: boolean;
  artifacts: SynthesizedArtifact[];
  error?: string;
}

export interface SynthesizedArtifact {
  id: string;
  type: ArtifactType;
  content: unknown;
  sourceId: string;
}

export interface SynthesisOptions {
  sourceIds: string[];
  artifactType: ArtifactType;
  options?: Record<string, unknown>;
}

export interface SynthesisProgress {
  current: number;
  total: number;
  status: string;
}

/**
 * Source document for knowledge synthesis
 */
export interface SourceDocument {
  id: string;
  sourceId: string;
  sourceType: 'pdf' | 'text' | 'url' | 'image';
  title: string;
  content: string;
  mimeType?: string;
  metadata?: Record<string, unknown>;
}

/**
 * PDF processing options for Gemini
 */
export interface GeminiPDFOptions {
  extractHeadings: boolean;
  extractTables: boolean;
  extractFigures: boolean;
  extractCitations: boolean;
  generateSummary: boolean;
}

/**
 * Image processing options for Gemini
 */
export interface GeminiImageOptions {
  extractText: boolean;
  generateDescription: boolean;
  detectObjects: boolean;
  detectHandwriting: boolean;
}

/**
 * URL processing options for Gemini
 */
export interface GeminiURLOptions {
  generateSummary: boolean;
  inferMetadata: boolean;
  detectLinks: boolean;
}
