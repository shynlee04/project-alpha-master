/**
 * @fileoverview Relevancy Factor Calculations
 * @module lib/knowledge/relevancy-factors
 * @governance EPIC-38, PHASE-6
 */

import type { ScorableDocument } from './relevancy-types';

/**
 * Calculate embedding similarity using cosine similarity
 *
 * @param doc1 - First document
 * @param doc2 - Second document
 * @returns Similarity score (0-1)
 */
export function calculateEmbeddingSimilarity(
  doc1: ScorableDocument,
  doc2: ScorableDocument
): number {
  if (!doc1.embedding || !doc2.embedding) return 0;

  return cosineSimilarity(doc1.embedding, doc2.embedding);
}

/**
 * Calculate citation overlap (Jaccard similarity)
 *
 * @param doc1 - First document
 * @param doc2 - Second document
 * @returns Jaccard similarity score (0-1)
 */
export function calculateCitationOverlap(
  doc1: ScorableDocument,
  doc2: ScorableDocument
): number {
  if (!doc1.citations || !doc2.citations) return 0;

  const set1 = new Set(doc1.citations);
  const set2 = new Set(doc2.citations);

  // Jaccard similarity: |A ∩ B| / |A ∪ B|
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * Calculate subject proximity
 *
 * @param doc1 - First document
 * @param doc2 - Second document
 * @returns Subject proximity score (0-1)
 */
export function calculateSubjectProximity(
  doc1: ScorableDocument,
  doc2: ScorableDocument
): number {
  if (!doc1.subject || !doc2.subject) return 0;

  // Same subject = 1.0
  if (doc1.subject === doc2.subject) return 1.0;

  // Check for hierarchical relationship (e.g., "Mathematics > Calculus" vs "Mathematics")
  const parts1 = doc1.subject.split(' > ');
  const parts2 = doc2.subject.split(' > ');

  // Share root subject = 0.5
  if (parts1[0] === parts2[0]) return 0.5;

  // No relationship = 0
  return 0;
}

/**
 * Calculate temporal proximity
 *
 * @param doc1 - First document
 * @param doc2 - Second document
 * @returns Temporal proximity score (0-1)
 */
export function calculateTemporalProximity(
  doc1: ScorableDocument,
  doc2: ScorableDocument
): number {
  if (!doc1.createdAt || !doc2.createdAt) return 0;

  const timeDiff = Math.abs(doc1.createdAt - doc2.createdAt);
  const dayDiff = timeDiff / (1000 * 60 * 60 * 24);

  // Within same day = 1.0
  if (dayDiff < 1) return 1.0;

  // Within same week = 0.7
  if (dayDiff < 7) return 0.7;

  // Within same month = 0.4
  if (dayDiff < 30) return 0.4;

  // Within same year = 0.2
  if (dayDiff < 365) return 0.2;

  // More than a year apart = 0
  return 0;
}

/**
 * Calculate user interaction score
 *
 * @param doc1 - First document
 * @param doc2 - Second document
 * @returns Interaction score (0-1)
 */
export function calculateInteractionScore(
  doc1: ScorableDocument,
  doc2: ScorableDocument
): number {
  const score1 = doc1.interactionScore || 0;
  const score2 = doc2.interactionScore || 0;

  // Normalize to 0-1 (assuming max score is 100)
  const norm1 = Math.min(score1 / 100, 1.0);
  const norm2 = Math.min(score2 / 100, 1.0);

  // Average of both scores
  return (norm1 + norm2) / 2;
}

/**
 * Calculate cosine similarity between vectors
 *
 * @param a - First vector
 * @param b - Second vector
 * @returns Cosine similarity (0-1)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator > 0 ? dotProduct / denominator : 0;
}
