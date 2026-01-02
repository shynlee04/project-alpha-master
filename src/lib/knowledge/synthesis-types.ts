/**
 * @fileoverview Synthesis Types for Knowledge Synthesis Platform
 * @module lib/knowledge/synthesis-types
 * @governance GAP-003 - Synthesis Button + Service
 *
 * Type definitions for AI-powered synthesis of knowledge sources.
 * Defines schemas for structured frontmatter generation via Gemini API.
 */

import { z } from 'zod';

/**
 * Synthesis frontmatter schema (matches Gemini output)
 *
 * Generated structure from AI analysis of source documents.
 * Used for knowledge organization, search, and recommendations.
 */
export const SynthesisFrontmatterSchema = z.object({
  /** Document title */
  title: z.string().optional(),

  /** Summary of document content (150-1000 words) */
  summary: z.string().min(100).max(1000),

  /** Document type classification */
  documentType: z.enum([
    'lecture_notes',
    'textbook_chapter',
    'research_paper',
    'article',
    'handwritten_notes',
    'diagram',
    'audio_recording',
    'web_content',
    'other'
  ]),

  /** Subject area (e.g., "Mathematics", "Physics") */
  subject: z.string().optional(),

  /** Key concepts with definitions */
  keyConcepts: z.array(z.object({
    term: z.string(),
    definition: z.string(),
  })).min(3).max(15).optional(),

  /** Semantic tags for search and organization */
  tags: z.array(z.string()).min(3).max(10).optional(),

  /** Generated flashcards */
  flashcards: z.array(z.object({
    front: z.string(),
    back: z.string(),
  })).optional(),

  /** Generated quiz questions */
  quiz: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()).min(2),
    correctIndex: z.number().min(0),
    explanation: z.string().optional(),
    type: z.enum(['multiple-choice', 'true-false', 'short-answer']).optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  })).optional(),

  /** Document structure metadata */
  structure: z.object({
    /** Section headings */
    headings: z.array(z.string()).optional(),
    /** Contains figures/diagrams */
    hasFigures: z.boolean().optional(),
    /** Contains data tables */
    hasTables: z.boolean().optional(),
    /** Contains academic citations */
    hasCitations: z.boolean().optional(),
    /** Page count (for PDFs) */
    pageCount: z.number().optional(),
  }).optional(),

  /** Prerequisite topics/concepts */
  prerequisites: z.array(z.string()).optional(),

  /** Related topics for exploration */
  relatedTopics: z.array(z.string()).optional(),

  /** Action items or follow-up tasks */
  actionItems: z.array(z.string()).optional(),

  /** Difficulty level for study materials */
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),

  /** Estimated study time in minutes */
  estimatedStudyTimeMinutes: z.number().optional(),
});

export type SynthesisFrontmatter = z.infer<typeof SynthesisFrontmatterSchema>;

/**
 * Result of synthesis operation
 */
export interface SynthesisResult {
  /** Unique synthesis ID */
  id: string;
  /** Source document ID */
  sourceId: string;
  /** Generated frontmatter */
  frontmatter: SynthesisFrontmatter;
  /** ISO timestamp of synthesis */
  synthesizedAt: string;
  /** Model used for generation */
  modelUsed: string;
  /** Processing time in milliseconds */
  processingTimeMs: number;
}

/**
 * Synthesis operation status
 */
export type SynthesisStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

/**
 * Synthesis progress tracking
 */
export interface SynthesisProgress {
  /** Current status */
  status: SynthesisStatus;
  /** Progress percentage (0-100) */
  progress: number;
  /** Current processing stage */
  stage?: string;
  /** Error message if failed */
  error?: string;
}

/**
 * Synthesis request options
 */
export interface SynthesisOptions {
  /** Override default model */
  model?: string;
  /** Include in progress callbacks */
  onProgress?: (progress: SynthesisProgress) => void;
  /** Force re-synthesis even if already synthesized */
  force?: boolean;
}

/**
 * Source document types that can be synthesized
 */
export type SynthesizableSourceType =
  | 'pdf'
  | 'image'
  | 'audio'
  | 'url'
  | 'markdown'
  | 'text';

/**
 * Study artifact types that can be generated
 */
export type ArtifactType = 'flashcards' | 'quiz';

/**
 * Source document interface for synthesis
 */
export interface SourceDocument {
  id: string;
  type: SynthesizableSourceType;
  title: string;
  content?: string;
  base64Content?: string;
  mimeType?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Re-exports: Gemini-specific types
// ============================================================================

/**
 * Re-export Gemini PDF options for convenient imports
 */
export type { GeminiPDFOptions } from './gemini-pdf-types';

/**
 * Re-export Gemini image options for convenient imports
 */
export type { GeminiImageOptions } from './gemini-image-types';

/**
 * Re-export Gemini URL options for convenient imports
 */
export type { GeminiURLOptions } from './gemini-url-processor';
