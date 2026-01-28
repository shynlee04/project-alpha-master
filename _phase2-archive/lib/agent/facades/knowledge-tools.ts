/**
 * @fileoverview Knowledge tools interface (stub - DEFERRED)
 * @module lib/agent/facades/knowledge-tools
 * @status DEFERRED - Knowledge workspace is post-MVP
 *
 * Provides agent tool interfaces for Knowledge workspace operations.
 * Actual implementation will be added when Knowledge workspace epic begins.
 */

// ============================================================
// Types
// ============================================================

/**
 * Synthesis input for agent
 */
export interface SynthesisInput {
  sourceIds: string[];
  artifactType: 'flashcards' | 'quiz' | 'summary' | 'outline';
  options?: SynthesisOptions;
}

/**
 * Synthesis options
 */
export interface SynthesisOptions {
  maxCards?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  language?: string;
}

/**
 * PDF processing options
 */
export interface PDFProcessingOptions {
  extractText?: boolean;
  extractImages?: boolean;
  maxPages?: number;
}

/**
 * Image processing options
 */
export interface ImageProcessingOptions {
  extractText?: boolean;
  generateDescription?: boolean;
  maxSize?: number;
}

/**
 * URL processing options
 */
export interface URLProcessingOptions {
  extractContent?: boolean;
  includeMetadata?: boolean;
  maxDepth?: number;
}

// ============================================================
// Agent Knowledge Tools Interface
// ============================================================

/**
 * Agent knowledge tools interface
 * @deprecated Knowledge workspace is deferred to post-MVP
 */
export interface AgentKnowledgeTools {
  /**
   * Index a document into the knowledge base
   */
  indexDocument(
    content: string,
    metadata?: Record<string, unknown>
  ): Promise<{ id: string; success: boolean }>;

  /**
   * Search the knowledge base
   */
  searchKnowledge(
    query: string,
    options?: { limit?: number; threshold?: number }
  ): Promise<Array<{ id: string; content: string; score: number }>>;

  /**
   * Synthesize study materials
   */
  synthesize(
    input: SynthesisInput
  ): Promise<{ id: string; type: string; success: boolean }>;

  /**
   * Process a PDF document
   */
  processPDF(
    path: string,
    options?: PDFProcessingOptions
  ): Promise<{ id: string; pages: number; success: boolean }>;

  /**
   * Process an image
   */
  processImage(
    path: string,
    options?: ImageProcessingOptions
  ): Promise<{ id: string; description?: string; success: boolean }>;

  /**
   * Process a URL
   */
  processURL(
    url: string,
    options?: URLProcessingOptions
  ): Promise<{ id: string; title?: string; success: boolean }>;

  /**
   * Get knowledge item by ID
   */
  getKnowledgeItem(
    id: string
  ): Promise<{ id: string; content: string; metadata?: Record<string, unknown> } | null>;

  /**
   * Delete knowledge item
   */
  deleteKnowledgeItem(id: string): Promise<{ success: boolean }>;
}
