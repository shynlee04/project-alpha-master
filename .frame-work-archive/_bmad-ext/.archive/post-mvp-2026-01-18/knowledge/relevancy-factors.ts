/**
 * @fileoverview Relevancy factors
 * @module lib/knowledge/relevancy-factors
 *
 * **DEFERRED - Post-MVP Archive**
 */

export interface RelevancyFactor {
  name: string;
  weight: number;
  description: string;
  calculate: (document: unknown, query: string) => number;
}

export const relevancyFactors: RelevancyFactor[] = [
  {
    name: 'term_frequency',
    weight: 0.3,
    description: 'How many query terms appear in the document',
    calculate: (doc: unknown, query: string) => {
      const scorableDoc = doc as { content: string };
      const terms = query.toLowerCase().split(/\s+/);
      let matches = 0;

      for (const term of terms) {
        const regex = new RegExp(term, 'gi');
        const count = scorableDoc.content.match(regex)?.length || 0;
        matches += count;
      }

      return Math.min(1, matches / terms.length);
    },
  },
  {
    name: 'title_match',
    weight: 0.25,
    description: 'Query terms appearing in the title',
    calculate: (doc: unknown, query: string) => {
      const scorableDoc = doc as { title?: string };
      if (!scorableDoc.title) return 0;

      const terms = query.toLowerCase().split(/\s+/);
      const titleLower = scorableDoc.title.toLowerCase();
      let matches = 0;

      for (const term of terms) {
        if (titleLower.includes(term)) {
          matches++;
        }
      }

      return matches / terms.length;
    },
  },
  {
    name: 'recency',
    weight: 0.15,
    description: 'How recently the document was updated',
    calculate: (doc: unknown, _query: string) => {
      const scorableDoc = doc as { updatedAt?: Date };
      if (!scorableDoc.updatedAt) return 0;

      const daysSinceUpdate = (Date.now() - new Date(scorableDoc.updatedAt).getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceUpdate < 7) return 1;
      if (daysSinceUpdate < 30) return 0.8;
      if (daysSinceUpdate < 90) return 0.5;
      return 0.2;
    },
  },
  {
    name: 'popularity',
    weight: 0.15,
    description: 'How often the document has been accessed',
    calculate: (doc: unknown, _query: string) => {
      const scorableDoc = doc as { accessCount?: number };
      const count = scorableDoc.accessCount || 0;

      // Normalize to 0-1 scale (capped at 100 accesses)
      return Math.min(1, count / 100);
    },
  },
  {
    name: 'tag_match',
    weight: 0.15,
    description: 'Matching tags with query',
    calculate: (doc: unknown, query: string) => {
      const scorableDoc = doc as { tags?: string[] };
      if (!scorableDoc.tags?.length) return 0;

      const queryTerms = query.toLowerCase().split(/\s+/);
      let matches = 0;

      for (const term of queryTerms) {
        if (scorableDoc.tags.some((tag) => tag.toLowerCase().includes(term))) {
          matches++;
        }
      }

      return matches / Math.max(queryTerms.length, 1);
    },
  },
];

/**
 * Calculate combined relevancy score
 */
export function calculateRelevancyScore(
  document: unknown,
  query: string
): { score: number; factors: Record<string, number> } {
  let totalWeight = 0;
  let weightedSum = 0;
  const factorScores: Record<string, number> = {};

  for (const factor of relevancyFactors) {
    const score = factor.calculate(document, query);
    factorScores[factor.name] = score;

    weightedSum += score * factor.weight;
    totalWeight += factor.weight;
  }

  return {
    score: totalWeight > 0 ? weightedSum / totalWeight : 0,
    factors: factorScores,
  };
}
