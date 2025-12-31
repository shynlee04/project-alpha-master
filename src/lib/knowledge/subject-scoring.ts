/**
 * @fileoverview Subject Scoring Algorithms
 * @module lib/knowledge/subject-scoring
 * @governance EPIC-38, PHASE-7
 * @ai-observable true
 */

import type { SubjectCategory } from './subject-classifier';

interface SourceFeatures {
  keywords: string[];
  labels: string[];
  titleWords: string[];
  suggestedSubject: string;
}

interface SubjectScore {
  subjectId: string;
  score: number;
  breakdown: {
    nameMatch: number;
    aliasMatch: number;
    titleMatch: number;
    embeddingSimilarity: number;
  };
}

export class SubjectScoring {
  private subjects: Map<string, SubjectCategory>;
  private taxonomy: any;

  constructor(subjects: Map<string, SubjectCategory>, taxonomy: any) {
    this.subjects = subjects;
    this.taxonomy = taxonomy;
  }

  extractFeatures(source: {
    labels?: string[];
    title?: string;
    content?: string;
  }): SourceFeatures {
    const keywords: string[] = [];
    const labels: string[] = source.labels || [];
    const titleWords: string[] = [];

    if (source.title) {
      const words = source.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      titleWords.push(...words);
    }

    if (source.content) {
      const contentWords = source.content.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
      keywords.push(...contentWords.slice(0, 20));
    }

    const suggestedSubject = labels[0] || titleWords[0] || keywords[0] || 'general';

    return { keywords, labels, titleWords, suggestedSubject };
  }

  scoreSubjects(features: SourceFeatures, sourceEmbedding?: number[]): Map<string, number> {
    const scores = new Map<string, number>();

    for (const subject of this.subjects.values()) {
      let score = 0;
      const nameMatch = this.calculateNameMatch(features, subject);
      score += nameMatch * 0.5;
      const aliasMatch = this.calculateAliasMatch(features, subject);
      score += aliasMatch * 0.3;
      const titleMatch = this.calculateTitleMatch(features, subject);
      score += titleMatch * 0.2;

      if (sourceEmbedding && subject.embedding) {
        const embeddingSim = this.cosineSimilarity(sourceEmbedding, subject.embedding);
        score += embeddingSim * 0.3;
      }

      scores.set(subject.id, Math.min(score, 1));
    }

    return scores;
  }

  private calculateNameMatch(features: SourceFeatures, subject: SubjectCategory): number {
    const subjectName = subject.name.toLowerCase();
    let matches = 0;

    for (const label of features.labels) {
      if (label.toLowerCase() === subjectName) {
        matches += 1;
      }
    }

    for (const keyword of features.keywords) {
      if (keyword === subjectName) {
        matches += 0.5;
      }
    }

    return Math.min(matches, 1);
  }

  private calculateAliasMatch(features: SourceFeatures, subject: SubjectCategory): number {
    const aliases = subject.metadata?.aliases || [];
    let matches = 0;

    for (const label of features.labels) {
      for (const alias of aliases) {
        if (label.toLowerCase() === alias.toLowerCase()) {
          matches += 1;
        }
      }
    }

    return Math.min(matches, 1);
  }

  private calculateTitleMatch(features: SourceFeatures, subject: SubjectCategory): number {
    const subjectName = subject.name.toLowerCase();
    let matches = 0;

    for (const word of features.titleWords) {
      if (word === subjectName) {
        matches += 1;
      }
    }

    return Math.min(matches, 1);
  }

  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude > 0 ? dotProduct / magnitude : 0;
  }

  getBestSubject(scores: Map<string, number>, minConfidence: number = 0.3): SubjectCategory | undefined {
    let bestScore = 0;
    let bestSubjectId: string | undefined;

    for (const [subjectId, score] of scores) {
      if (score > bestScore && score >= minConfidence) {
        bestScore = score;
        bestSubjectId = subjectId;
      }
    }

    return bestSubjectId ? this.subjects.get(bestSubjectId) : undefined;
  }

  getAlternatives(
    scores: Map<string, number>,
    bestSubjectId: string,
    maxAlternatives: number = 3
  ): Array<{ subject: SubjectCategory; score: number }> {
    const alternatives: Array<{ subject: SubjectCategory; score: number }> = [];

    for (const [subjectId, score] of scores) {
      if (subjectId !== bestSubjectId && score > 0.2) {
        const subject = this.subjects.get(subjectId);
        if (subject) {
          alternatives.push({ subject, score });
        }
      }
    }

    return alternatives.sort((a, b) => b.score - a.score).slice(0, maxAlternatives);
  }

  getScoreBreakdown(
    subjectId: string,
    features: SourceFeatures,
    sourceEmbedding?: number[]
  ): SubjectScore | undefined {
    const subject = this.subjects.get(subjectId);
    if (!subject) return undefined;

    const nameMatch = this.calculateNameMatch(features, subject);
    const aliasMatch = this.calculateAliasMatch(features, subject);
    const titleMatch = this.calculateTitleMatch(features, subject);
    let embeddingSimilarity = 0;

    if (sourceEmbedding && subject.embedding) {
      embeddingSimilarity = this.cosineSimilarity(sourceEmbedding, subject.embedding);
    }

    const totalScore =
      nameMatch * 0.5 + aliasMatch * 0.3 + titleMatch * 0.2 + embeddingSimilarity * 0.3;

    return {
      subjectId,
      score: Math.min(totalScore, 1),
      breakdown: {
        nameMatch,
        aliasMatch,
        titleMatch,
        embeddingSimilarity,
      },
    };
  }
}
