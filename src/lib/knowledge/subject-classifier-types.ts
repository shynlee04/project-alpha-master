/**
 * @fileoverview Subject Classification Types
 * @module lib/knowledge/subject-classifier-types
 * @governance EPIC-38, PHASE-7
 *
 * Shared types for subject classification system.
 */

/**
 * Subject category with hierarchy and metadata
 */
export interface SubjectCategory {
  id: string;
  name: string;
  parentId?: string;
  childIds: string[];
  embedding?: number[];
  memberIds: string[];
  metadata?: {
    confidence: number;
    createdAt: number;
    updatedAt: number;
    description?: string;
    aliases?: string[];
  };
}

/**
 * Classification result with subject and alternatives
 */
export interface ClassificationResult {
  subject: string;
  subjectPath: string[];
  confidence: number;
  alternatives: Array<{ subject: string; confidence: number }>;
  classifiedAt: number;
}

/**
 * Classification options
 */
export interface ClassificationOptions {
  minConfidence?: number;
  includePath?: boolean;
  includeAlternatives?: boolean;
  autoCreateSubjects?: boolean;
  maxDepth?: number;
}

/**
 * Source data for classification
 */
export interface SourceData {
  id?: string;
  content?: string;
  embedding?: number[];
  metadata?: {
    title?: string;
    description?: string;
    labels?: string[];
    [key: string]: any;
  };
}

/**
 * Subject statistics
 */
export interface SubjectStatistics {
  totalSubjects: number;
  subjectsByLevel: Record<number, number>;
  topSubjects: Array<{ subject: string; count: number }>;
  avgSubjectsPerSource: number;
}
