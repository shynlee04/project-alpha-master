/**
 * @fileoverview Subject scoring utilities
 * @module lib/knowledge/subject-scoring
 *
 * **DEFERRED - Post-MVP Archive**
 */

import type { SubjectCategory } from './subject-classifier-types';

export interface SubjectScore {
  category: SubjectCategory;
  score: number;
  keywordMatches: string[];
  density: number;
}

export interface MultiSubjectResult {
  primary: SubjectScore;
  secondary: SubjectScore | null;
  isMixed: boolean;
  suggestedTags: string[];
}

/**
 * Score content against multiple subjects
 */
export function scoreContentAgainstSubjects(
  content: string,
  subjects: { id: SubjectCategory; keywords: string[] }[]
): SubjectScore[] {
  const contentLower = content.toLowerCase();
  const wordCount = content.split(/\s+/).length;

  const scores: SubjectScore[] = [];

  for (const subject of subjects) {
    const matches: string[] = [];

    for (const keyword of subject.keywords) {
      if (contentLower.includes(keyword.toLowerCase())) {
        matches.push(keyword);
      }
    }

    // Calculate score based on matches and density
    const matchRatio = matches.length / subject.keywords.length;
    const density = matches.length / Math.max(wordCount, 1);
    const score = matchRatio * (1 + density * 10);

    scores.push({
      category: subject.id,
      score: Math.min(1, score),
      keywordMatches: matches,
      density,
    });
  }

  // Sort by score descending
  return scores.sort((a, b) => b.score - a.score);
}

/**
 * Detect mixed subjects in content
 */
export function detectMixedSubjects(
  content: string,
  subjects: { id: SubjectCategory; keywords: string[] }[]
): MultiSubjectResult {
  const scores = scoreContentAgainstSubjects(content, subjects);

  const primary = scores[0];
  const secondary = scores.length > 1 ? scores[1] : null;

  // Check if content has multiple significant subjects
  const isMixed = secondary ? secondary.score > primary.score * 0.5 : false;

  // Generate suggested tags
  const suggestedTags: string[] = [];
  for (const score of scores.slice(0, 3)) {
    if (score.score > 0.1) {
      suggestedTags.push(score.category);
      suggestedTags.push(...score.keywordMatches.slice(0, 2));
    }
  }

  return {
    primary,
    secondary,
    isMixed,
    suggestedTags: [...new Set(suggestedTags)],
  };
}
