/**
 * @fileoverview Subject classifier types
 * @module lib/knowledge/subject-classifier-types
 */

export type SubjectCategory =
  | 'technology'
  | 'science'
  | 'business'
  | 'arts'
  | 'health'
  | 'other';

export interface ClassificationResult {
  category: SubjectCategory;
  confidence: number;
  scores: Record<SubjectCategory, number>;
  classifier: SubjectClassifier;
}

export interface ClassificationOptions {
  returnAllScores?: boolean;
  threshold?: number;
}

export interface SourceData {
  id: string;
  title: string;
  content: string;
  tags?: string[];
}

export interface SubjectStatistics {
  totalDocuments: number;
  distribution: Record<SubjectCategory, number>;
  percentages: Record<SubjectCategory, number>;
  primarySubject: SubjectCategory;
}
