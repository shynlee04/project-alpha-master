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
