/**
 * @fileoverview Subject classifier
 * @module lib/knowledge/subject-classifier
 *
 * **DEFERRED - Post-MVP Archive**
 */

import type {
  SubjectCategory,
  ClassificationResult,
  ClassificationOptions,
  SourceData,
  SubjectStatistics,
} from './subject-classifier-types';

import type { SubjectTaxonomy } from './subject-taxonomy';

/**
 * Subject classifier for knowledge organization
 */
export class SubjectClassifier {
  private taxonomy: SubjectTaxonomy;

  constructor(taxonomy?: SubjectTaxonomy) {
    this.taxonomy = taxonomy || defaultTaxonomy;
  }

  /**
   * Classify content into a subject category
   */
  async classify(
    content: string,
    options: ClassificationOptions = {}
  ): Promise<ClassificationResult> {
    const {
      returnAllScores = false,
      threshold = 0.3,
    } = options;

    const scores: Record<SubjectCategory, number> = {};
    const contentLower = content.toLowerCase();

    // Score against each category
    for (const category of this.taxonomy.categories) {
      let score = 0;
      let keywordMatches = 0;

      for (const keyword of category.keywords) {
        if (contentLower.includes(keyword.toLowerCase())) {
          score += keyword.length / 100; // Longer keywords weighted more
          keywordMatches++;
        }
      }

      // Normalize score
      if (category.keywords.length > 0) {
        score = Math.min(1, score * (1 + keywordMatches / category.keywords.length));
      }

      scores[category.id] = score;
    }

    // Find best match
    let bestCategory: SubjectCategory | null = null;
    let bestScore = 0;

    for (const [category, score] of Object.entries(scores)) {
      if (score > bestScore && score >= threshold) {
        bestScore = score;
        bestCategory = category as SubjectCategory;
      }
    }

    if (returnAllScores) {
      return {
        category: bestCategory || 'other',
        confidence: bestScore,
        scores,
        classifier: this,
      };
    }

    return {
      category: bestCategory || 'other',
      confidence: bestScore,
      scores,
      classifier: this,
    };
  }

  /**
   * Batch classify multiple documents
   */
  async classifyBatch(
    sources: SourceData[],
    options: ClassificationOptions = {}
  ): Promise<ClassificationResult[]> {
    return Promise.all(sources.map((source) => this.classify(source.content, options)));
  }

  /**
   * Get taxonomy statistics
   */
  async getStatistics(
    sources: SourceData[]
  ): Promise<SubjectStatistics> {
    const distribution: Record<SubjectCategory, number> = {
      technology: 0,
      science: 0,
      business: 0,
      arts: 0,
      health: 0,
      other: 0,
    };

    for (const source of sources) {
      const result = await this.classify(source.content);
      distribution[result.category]++;
    }

    const total = sources.length || 1;

    return {
      totalDocuments: sources.length,
      distribution,
      percentages: {
        technology: distribution.technology / total,
        science: distribution.science / total,
        business: distribution.business / total,
        arts: distribution.arts / total,
        health: distribution.health / total,
        other: distribution.other / total,
      },
      primarySubject: this.getPrimarySubject(distribution),
    };
  }

  /**
   * Get primary subject from distribution
   */
  private getPrimarySubject(
    distribution: Record<SubjectCategory, number>
  ): SubjectCategory {
    let maxCount = 0;
    let primary: SubjectCategory = 'other';

    for (const [subject, count] of Object.entries(distribution)) {
      if (count > maxCount) {
        maxCount = count;
        primary = subject as SubjectCategory;
      }
    }

    return primary;
  }
}

/**
 * Default taxonomy
 */
const defaultTaxonomy: SubjectTaxonomy = {
  categories: [
    {
      id: 'technology',
      name: 'Technology',
      keywords: [
        'software',
        'programming',
        'algorithm',
        'database',
        'api',
        'javascript',
        'react',
        'python',
        'machine learning',
        '人工智能',
        '机器学习',
      ],
    },
    {
      id: 'science',
      name: 'Science',
      keywords: [
        'research',
        'experiment',
        'hypothesis',
        'theory',
        'physics',
        'chemistry',
        'biology',
      ],
    },
    {
      id: 'business',
      name: 'Business',
      keywords: [
        'revenue',
        'profit',
        'strategy',
        'marketing',
        'sales',
        'management',
        'investment',
      ],
    },
    {
      id: 'arts',
      name: 'Arts & Humanities',
      keywords: ['art', 'design', 'music', 'literature', 'history', 'culture'],
    },
    {
      id: 'health',
      name: 'Health & Wellness',
      keywords: [
        'health',
        'medical',
        'fitness',
        'nutrition',
        'mental health',
        'wellness',
      ],
    },
  ],
};

/**
 * Create subject classifier instance
 */
export function createSubjectClassifier(): SubjectClassifier {
  return new SubjectClassifier();
}
