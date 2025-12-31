/**
 * @fileoverview Recommendation Generator
 * @module lib/knowledge/recommendation-generator
 * @governance EPIC-38, PHASE-7
 */

import type { VaultAnalysis } from './organization-types';
import type { OrganizationRecommendation } from './organization-types';

export class RecommendationGenerator {
  async generateRecommendations(
    analysis: VaultAnalysis
  ): Promise<OrganizationRecommendation[]> {
    const recommendations: OrganizationRecommendation[] = [];

    const chronologicalConfidence = this.calculateChronologicalConfidence(analysis);
    if (chronologicalConfidence > 0.3) {
      recommendations.push({
        type: 'chronological',
        confidence: chronologicalConfidence,
        rationale: this.buildChronologicalRationale(analysis),
        benefits: [
          'Easy to track progress over time',
          'Natural study flow',
          'Simple to understand',
        ],
        drawbacks: [
          'May obscure thematic connections',
          'Older content gets buried',
        ],
        estimatedTimeSeconds: Math.ceil(analysis.documentCount / 50),
      });
    }

    const conceptualConfidence = this.calculateConceptualConfidence(analysis);
    if (conceptualConfidence > 0.3) {
      recommendations.push({
        type: 'conceptual',
        confidence: conceptualConfidence,
        rationale: this.buildConceptualRationale(analysis),
        benefits: [
          'Groups related topics together',
          'Cross-references similar content',
          'Better for exploration',
        ],
        drawbacks: [
          'May split sequential content',
          'Requires consistent subject tagging',
        ],
        estimatedTimeSeconds: Math.ceil(analysis.documentCount / 30),
      });
    }

    const hybridConfidence = this.calculateHybridConfidence(analysis);
    if (hybridConfidence > 0.3) {
      recommendations.push({
        type: 'hybrid',
        confidence: hybridConfidence,
        rationale: this.buildHybridRationale(analysis),
        benefits: [
          'Best of both worlds',
          'Flexible viewing options',
          'Maintains context while showing connections',
        ],
        drawbacks: [
          'More complex to navigate',
          'May require UI redesign',
        ],
        estimatedTimeSeconds: Math.ceil(analysis.documentCount / 20),
      });
    }

    recommendations.sort((a, b) => b.confidence - a.confidence);
    return recommendations;
  }

  private calculateChronologicalConfidence(analysis: VaultAnalysis): number {
    let confidence = 0;

    if (analysis.temporalSpan > 30) confidence += 0.3;
    else if (analysis.temporalSpan > 7) confidence += 0.2;

    if (analysis.hasTemporalClustering) confidence += 0.3;

    if (Object.keys(analysis.subjectDistribution).length <= 3) confidence += 0.2;

    if (analysis.avgAge < 30) confidence += 0.2;

    return Math.min(confidence, 1.0);
  }

  private calculateConceptualConfidence(analysis: VaultAnalysis): number {
    let confidence = 0;

    const subjectCount = Object.keys(analysis.subjectDistribution).length;
    if (subjectCount > 5) confidence += 0.4;
    else if (subjectCount > 3) confidence += 0.3;

    if (analysis.hasSubjectClustering) confidence += 0.3;

    if (analysis.estimatedClusters > 3) confidence += 0.2;

    if (analysis.documentCount > 20) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  private calculateHybridConfidence(analysis: VaultAnalysis): number {
    const chronoConf = this.calculateChronologicalConfidence(analysis);
    const conceptConf = this.calculateConceptualConfidence(analysis);

    const avgConf = (chronoConf + conceptConf) / 2;
    const boost = (chronoConf > 0.5 && conceptConf > 0.5) ? 0.2 : 0;

    return Math.min(avgConf + boost, 1.0);
  }

  private buildChronologicalRationale(analysis: VaultAnalysis): string {
    const reasons: string[] = [];

    if (analysis.temporalSpan > 30) {
      reasons.push(`documents span ${Math.floor(analysis.temporalSpan)} days`);
    }
    if (analysis.hasTemporalClustering) {
      reasons.push('natural temporal groupings detected');
    }
    if (analysis.avgAge < 30) {
      reasons.push('recent content suitable for progress tracking');
    }

    return reasons.length > 0
      ? `Chronological organization recommended because: ${reasons.join(', ')}.`
      : 'Organize by creation date for simple time-based navigation.';
  }

  private buildConceptualRationale(analysis: VaultAnalysis): string {
    const subjects = Object.keys(analysis.subjectDistribution);
    const topSubjects = Object.entries(analysis.subjectDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([subject]) => subject);

    const reasons: string[] = [];

    if (subjects.length > 5) {
      reasons.push(`${subjects.length} distinct subjects detected`);
    }
    if (analysis.hasSubjectClustering) {
      reasons.push('strong subject clustering present');
    }
    if (topSubjects.length > 0) {
      reasons.push(`primary themes: ${topSubjects.join(', ')}`);
    }

    return reasons.length > 0
      ? `Conceptual organization recommended because: ${reasons.join(', ')}.`
      : 'Group by subject for thematic organization.';
  }

  private buildHybridRationale(analysis: VaultAnalysis): string {
    return `Hybrid organization combines chronological flow with conceptual grouping. ` +
      `View ${Math.floor(analysis.temporalSpan)}-day timeline across ${analysis.estimatedClusters} subject clusters. ` +
      `Provides flexible navigation options for different exploration modes.`;
  }
}
