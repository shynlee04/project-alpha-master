/**
 * @fileoverview Synthesis types (stub - DEFERRED)
 * @module lib/knowledge/synthesis-types
 * @status DEFERRED - Synthesis is post-MVP
 *
 * Provides type definitions for AI synthesis operations.
 * Actual implementation will be added when Knowledge/Study epic begins.
 */

// ============================================================
// Source Document Types
// ============================================================

/**
 * Source document for synthesis
 * @deprecated Synthesis is deferred to post-MVP
 */
export interface SourceDocument {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'markdown' | 'pdf' | 'url';
  metadata?: Record<string, unknown>;
}

// ============================================================
// Artifact Types
// ============================================================

/**
 * Type of artifact to generate
 * @deprecated Synthesis is deferred to post-MVP
 */
export type ArtifactType =
  | 'flashcards'
  | 'quiz'
  | 'summary'
  | 'outline'
  | 'concept-map'
  | 'study-guide';

// ============================================================
// Synthesis Options
// ============================================================

/**
 * Progress callback data
 */
export interface SynthesisProgressData {
  status: 'idle' | 'processing' | 'completed' | 'failed';
  progress: number;
  stage?: string;
  error?: string;
}

/**
 * Synthesis options
 * @deprecated Synthesis is deferred to post-MVP
 */
export interface SynthesisOptions {
  artifactType?: ArtifactType;
  maxCards?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  language?: string;
  onProgress?: (progress: SynthesisProgressData) => void;
}

// ============================================================
// Synthesis Results
// ============================================================

/**
 * Generated flashcard from synthesis
 */
export interface GeneratedFlashcard {
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

/**
 * Generated quiz question from synthesis
 */
export interface GeneratedQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

/**
 * Synthesis result
 * @deprecated Synthesis is deferred to post-MVP
 */
export interface SynthesisResult {
  id: string;
  type: ArtifactType;
  sourceId: string;
  createdAt: number;
  flashcards?: GeneratedFlashcard[];
  quizQuestions?: GeneratedQuizQuestion[];
  summary?: string;
  outline?: string[];
  conceptMap?: Record<string, string[]>;
  studyGuide?: string;
}
