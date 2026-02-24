/**
 * @fileoverview Relevancy scorer for knowledge retrieval
 * @module lib/knowledge/relevancy-scorer
 *
 * **DEFERRED - Post-MVP Archive**
 */

import type {
  RelevancyScore,
  ScorableDocument,
  ScoringOptions,
  RelatedDocument,
} from './relevancy-types';

/**
 * Relevancy scoring service
 */
export class RelevancyScorer {
  /**
   * Score a document against a query
   */
  async score(
    doc: ScorableDocument,
    query: string,
    options: ScoringOptions = {}
  ): Promise<RelevancyScore> {
    const {
      termWeight = 1.0,
      positionWeight = 0.3,
      recencyWeight = 0.1,
      titleBoost = 2.0,
    } = options;

    const queryTerms = query.toLowerCase().split(/\s+/);
    const docLower = doc.content.toLowerCase();

    // Calculate term frequency scores
    const termScores: Record<string, number> = {};
    let totalScore = 0;

    for (const term of queryTerms) {
      const regex = new RegExp(term, 'gi');
      const matches = docLower.match(regex);
      const count = matches ? matches.length : 0;

      // TF-IDF like scoring
      const score = count * termWeight;
      termScores[term] = score;
      totalScore += score;
    }

    // Title bonus
    let titleScore = 0;
    if (doc.title) {
      const titleLower = doc.title.toLowerCase();
      for (const term of queryTerms) {
        if (titleLower.includes(term)) {
          titleScore += titleBoost * termWeight;
        }
      }
    }

    // Position bonus (terms appearing early in document)
    let positionScore = 0;
    for (const term of queryTerms) {
      const index = docLower.indexOf(term);
      if (index !== -1 && index < 500) {
        positionScore += positionWeight;
      }
    }

    // Recency bonus
    let recencyScore = 0;
    if (doc.updatedAt) {
      const daysSinceUpdate = (Date.now() - new Date(doc.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate < 30) {
        recencyScore = recencyWeight;
      }
    }

    const overallScore = Math.min(
      1,
      (totalScore + titleScore + positionScore + recencyScore) /
        (queryTerms.length * (1 + titleBoost + positionWeight + recencyWeight))
    );

    return {
      overallScore,
      breakdown: {
        termScore: totalScore,
        titleScore,
        positionScore,
        recencyScore,
      },
      matchedTerms: queryTerms.filter((term) => termScores[term] > 0),
    };
  }

  /**
   * Find related documents
   */
  async findRelated(
    documents: ScorableDocument[],
    targetDoc: ScorableDocument,
    options: ScoringOptions = {}
  ): Promise<RelatedDocument[]> {
    const related: RelatedDocument[] = [];

    for (const doc of documents) {
      if (doc.id === targetDoc.id) continue;

      const score = await this.score(doc, targetDoc.content, options);

      if (score.overallScore > 0.1) {
        related.push({
          document: doc,
          relevanceScore: score.overallScore,
          sharedTerms: score.matchedTerms,
        });
      }
    }

    // Sort by relevance
    related.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return related.slice(0, options.limit || 5);
  }
}

/**
 * Create relevancy scorer instance
 */
export function createRelevancyScorer(): RelevancyScorer {
  return new RelevancyScorer();
}
