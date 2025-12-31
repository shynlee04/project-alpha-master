/**
 * @fileoverview Organization Engine Service
 * @module lib/knowledge/organization-engine
 * @governance EPIC-38, PHASE-6
 * @ai-observable true
 *
 * Auto-organization recommendations engine for knowledge vaults.
 * Generates and applies organization strategies (chronological, conceptual, hybrid).
 *
 * @example
 * ```tsx
 * import { OrganizationEngine, createOrganizationEngine } from '@/lib/knowledge/organization-engine';
 *
 * const engine = createOrganizationEngine();
 *
 * // Generate recommendations
 * const recommendations = await engine.generateRecommendations(vaultId, documents);
 * console.log(recommendations); // [{ type: 'chronological', confidence: 0.8 }, ...]
 *
 * // Apply organization
 * const organized = await engine.applyOrganization(vaultId, 'chronological', documents);
 * ```
 */

/**
 * Organization recommendation type
 */
export type OrganizationType = 'chronological' | 'conceptual' | 'hybrid';

/**
 * Organization recommendation
 *
 * Suggested organization strategy with confidence score.
 */
export interface OrganizationRecommendation {
  /** Organization type */
  type: OrganizationType;
  /** Confidence score (0-1) */
  confidence: number;
  /** Rationale for this recommendation */
  rationale: string;
  /** Expected benefits */
  benefits: string[];
  /** Potential drawbacks */
  drawbacks: string[];
  /** Estimated time to apply */
  estimatedTimeSeconds: number;
}

/**
 * Organized document
 *
 * Document with organization metadata.
 */
export interface OrganizedDocument {
  /** Document ID */
  id: string;
  /** Document data */
  document: {
    id: string;
    title?: string;
    content?: string;
    createdAt?: number;
    subject?: string;
    labels?: string[];
    embedding?: number[];
  };
  /** Organization group */
  group: string;
  /** Position within group */
  position: number;
  /** Organization metadata */
  metadata?: {
    /** Related documents */
    relatedIds?: string[];
    /** Cluster membership */
    clusterId?: string;
    /** Sort key */
    sortKey?: string;
  };
}

/**
 * Organization result
 *
 * Result of applying organization strategy.
 */
export interface OrganizationResult {
  /** Organization type applied */
  type: OrganizationType;
  /** Total documents organized */
  totalDocuments: number;
  /** Number of groups created */
  groupCount: number;
  /** Organized documents */
  documents: OrganizedDocument[];
  /** Organization statistics */
  statistics: {
    /** Average group size */
    avgGroupSize: number;
    /** Largest group size */
    maxGroupSize: number;
    /** Smallest group size */
    minGroupSize: number;
  };
  /** Applied timestamp */
  appliedAt: number;
}

/**
 * Organization options
 */
export interface OrganizationOptions {
  /** Minimum group size */
  minGroupSize?: number;
  /** Maximum groups */
  maxGroups?: number;
  /** Preserve existing groups when possible */
  preserveExisting?: boolean;
}

/**
 * Vault analysis result
 *
 * Analysis of vault for organization recommendations.
 */
export interface VaultAnalysis {
  /** Total document count */
  documentCount: number;
  /** Subject distribution */
  subjectDistribution: Record<string, number>;
  /** Temporal span (days) */
  temporalSpan: number;
  /** Average document age (days) */
  avgAge: number;
  /** Cluster count estimate */
  estimatedClusters: number;
  /** Has temporal clustering */
  hasTemporalClustering: boolean;
  /** Has subject clustering */
  hasSubjectClustering: boolean;
}

/**
 * Organization Engine
 *
 * Generates and applies organization recommendations for knowledge vaults.
 */
export class OrganizationEngine {
  private organizationCache: Map<string, OrganizationResult>;

  constructor() {
    this.organizationCache = new Map();
  }

  /**
   * Analyze vault to determine best organization strategy
   *
   * @param documents - Documents to analyze
   * @returns Vault analysis
   */
  async analyzeVault(documents: Array<{
    id: string;
    createdAt?: number;
    subject?: string;
  }>): Promise<VaultAnalysis> {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    // Document count
    const documentCount = documents.length;

    // Subject distribution
    const subjectDistribution: Record<string, number> = {};
    for (const doc of documents) {
      const subject = doc.subject || 'uncategorized';
      subjectDistribution[subject] = (subjectDistribution[subject] || 0) + 1;
    }

    // Temporal analysis
    const timestamps = documents
      .map(d => d.createdAt)
      .filter((t): t is number => t !== undefined)
      .sort((a, b) => a - b);

    const temporalSpan = timestamps.length > 0
      ? (timestamps[timestamps.length - 1] - timestamps[0]) / dayMs
      : 0;

    const avgAge = timestamps.length > 0
      ? (now - timestamps[0]) / dayMs
      : 0;

    // Cluster estimation (based on subject diversity)
    const uniqueSubjects = Object.keys(subjectDistribution).length;
    const estimatedClusters = Math.min(uniqueSubjects, Math.ceil(documentCount / 5));

    // Detect clustering patterns
    const hasTemporalClustering = this.detectTemporalClustering(timestamps, dayMs);
    const hasSubjectClustering = uniqueSubjects > 1 && documentCount > 5;

    return {
      documentCount,
      subjectDistribution,
      temporalSpan,
      avgAge,
      estimatedClusters,
      hasTemporalClustering,
      hasSubjectClustering,
    };
  }

  /**
   * Detect temporal clustering in timestamps
   */
  private detectTemporalClustering(timestamps: number[], dayMs: number): boolean {
    if (timestamps.length < 3) return false;

    // Check for gaps > 7 days
    let gaps = 0;
    for (let i = 1; i < timestamps.length; i++) {
      const diff = timestamps[i] - timestamps[i - 1];
      if (diff > 7 * dayMs) gaps++;
    }

    return gaps > 0;
  }

  /**
   * Generate organization recommendations
   *
   * @param vaultId - Vault identifier
   * @param documents - Documents to analyze
   * @returns Array of recommendations
   *
   * @example
   * ```tsx
   * const recommendations = await engine.generateRecommendations('vault-123', documents);
   * console.log(recommendations);
   * // [
   * //   { type: 'chronological', confidence: 0.8, rationale: '...', ... },
   * //   { type: 'conceptual', confidence: 0.6, rationale: '...', ... }
   * // ]
   * ```
   */
  async generateRecommendations(
    vaultId: string,
    documents: Array<{
      id: string;
      title?: string;
      createdAt?: number;
      subject?: string;
      labels?: string[];
    }>
  ): Promise<OrganizationRecommendation[]> {
    // Analyze vault
    const analysis = await this.analyzeVault(documents);

    const recommendations: OrganizationRecommendation[] = [];

    // Chronological recommendation
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

    // Conceptual recommendation
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

    // Hybrid recommendation
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

    // Sort by confidence
    recommendations.sort((a, b) => b.confidence - a.confidence);

    return recommendations;
  }

  /**
   * Calculate confidence for chronological organization
   */
  private calculateChronologicalConfidence(analysis: VaultAnalysis): number {
    let confidence = 0;

    // High temporal span = good for chronological
    if (analysis.temporalSpan > 30) confidence += 0.3;
    else if (analysis.temporalSpan > 7) confidence += 0.2;

    // Has temporal clustering = good fit
    if (analysis.hasTemporalClustering) confidence += 0.3;

    // Low subject diversity = chronological is fine
    if (Object.keys(analysis.subjectDistribution).length <= 3) confidence += 0.2;

    // Recent documents (good for current progress tracking)
    if (analysis.avgAge < 30) confidence += 0.2;

    return Math.min(confidence, 1.0);
  }

  /**
   * Calculate confidence for conceptual organization
   */
  private calculateConceptualConfidence(analysis: VaultAnalysis): number {
    let confidence = 0;

    // High subject diversity = good for conceptual
    const subjectCount = Object.keys(analysis.subjectDistribution).length;
    if (subjectCount > 5) confidence += 0.4;
    else if (subjectCount > 3) confidence += 0.3;

    // Has subject clustering = good fit
    if (analysis.hasSubjectClustering) confidence += 0.3;

    // Many clusters detected = needs conceptual grouping
    if (analysis.estimatedClusters > 3) confidence += 0.2;

    // Large vault = needs organization
    if (analysis.documentCount > 20) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  /**
   * Calculate confidence for hybrid organization
   */
  private calculateHybridConfidence(analysis: VaultAnalysis): number {
    // Hybrid is good when both chronological and conceptual are viable
    const chronoConf = this.calculateChronologicalConfidence(analysis);
    const conceptConf = this.calculateConceptualConfidence(analysis);

    // Hybrid confidence = average of both, boosted when both are strong
    const avgConf = (chronoConf + conceptConf) / 2;
    const boost = (chronoConf > 0.5 && conceptConf > 0.5) ? 0.2 : 0;

    return Math.min(avgConf + boost, 1.0);
  }

  /**
   * Build rationale for chronological organization
   */
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

  /**
   * Build rationale for conceptual organization
   */
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

  /**
   * Build rationale for hybrid organization
   */
  private buildHybridRationale(analysis: VaultAnalysis): string {
    return `Hybrid organization combines chronological flow with conceptual grouping. ` +
      `View ${Math.floor(analysis.temporalSpan)}-day timeline across ${analysis.estimatedClusters} subject clusters. ` +
      `Provides flexible navigation options for different exploration modes.`;
  }

  /**
   * Apply organization strategy to documents
   *
   * @param vaultId - Vault identifier
   * @param type - Organization type to apply
   * @param documents - Documents to organize
   * @param options - Organization options
   * @returns Organization result
   *
   * @example
   * ```tsx
   * const result = await engine.applyOrganization('vault-123', 'chronological', documents);
   * console.log(result.documents); // Organized by date
   * ```
   */
  async applyOrganization(
    vaultId: string,
    type: OrganizationType,
    documents: Array<{
      id: string;
      title?: string;
      content?: string;
      createdAt?: number;
      subject?: string;
      labels?: string[];
      embedding?: number[];
    }>,
    options: OrganizationOptions = {}
  ): Promise<OrganizationResult> {
    // Check cache
    const cacheKey = `${vaultId}-${type}`;
    const cached = this.organizationCache.get(cacheKey);
    if (cached && options.preserveExisting) {
      return cached;
    }

    let organized: OrganizedDocument[];

    switch (type) {
      case 'chronological':
        organized = this.organizeChronological(documents);
        break;
      case 'conceptual':
        organized = this.organizeConceptual(documents, options);
        break;
      case 'hybrid':
        organized = this.organizeHybrid(documents, options);
        break;
    }

    // Calculate statistics
    const groups = new Set(organized.map(d => d.group));
    const groupSizes = Array.from(groups).map(group =>
      organized.filter(d => d.group === group).length
    );

    const result: OrganizationResult = {
      type,
      totalDocuments: documents.length,
      groupCount: groups.size,
      documents: organized,
      statistics: {
        avgGroupSize: groupSizes.reduce((a, b) => a + b, 0) / groupSizes.length,
        maxGroupSize: Math.max(...groupSizes),
        minGroupSize: Math.min(...groupSizes),
      },
      appliedAt: Date.now(),
    };

    // Cache result
    this.organizationCache.set(cacheKey, result);

    return result;
  }

  /**
   * Organize documents chronologically
   */
  private organizeChronological(
    documents: Array<{
      id: string;
      title?: string;
      content?: string;
      createdAt?: number;
      subject?: string;
      labels?: string[];
      embedding?: number[];
    }>
  ): OrganizedDocument[] {
    // Sort by creation date
    const sorted = [...documents].sort((a, b) =>
      (a.createdAt || 0) - (b.createdAt || 0)
    );

    // Group by week
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const groups: Map<string, OrganizedDocument[]> = new Map();

    for (const doc of sorted) {
      const date = doc.createdAt || Date.now();
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const groupKey = `Week of ${weekStart.toLocaleDateString()}`;

      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }

      groups.get(groupKey)!.push({
        id: doc.id,
        document: doc,
        group: groupKey,
        position: groups.get(groupKey)!.length,
        metadata: {
          sortKey: date.toString(),
        },
      });
    }

    // Flatten
    return Array.from(groups.values()).flat();
  }

  /**
   * Organize documents conceptually by subject
   */
  private organizeConceptual(
    documents: Array<{
      id: string;
      title?: string;
      content?: string;
      createdAt?: number;
      subject?: string;
      labels?: string[];
      embedding?: number[];
    }>,
    options: OrganizationOptions
  ): OrganizedDocument[] {
    // Group by subject
    const groups: Map<string, OrganizedDocument[]> = new Map();

    for (const doc of documents) {
      const subject = doc.subject || doc.labels?.[0] || 'Uncategorized';

      if (!groups.has(subject)) {
        groups.set(subject, []);
      }

      groups.get(subject)!.push({
        id: doc.id,
        document: doc,
        group: subject,
        position: groups.get(subject)!.length,
        metadata: {
          clusterId: subject,
        },
      });
    }

    // Flatten and sort by group size
    return Array.from(groups.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .flatMap(([_, docs]) => docs);
  }

  /**
   * Organize documents with hybrid approach (chronological within conceptual groups)
   */
  private organizeHybrid(
    documents: Array<{
      id: string;
      title?: string;
      content?: string;
      createdAt?: number;
      subject?: string;
      labels?: string[];
      embedding?: number[];
    }>,
    options: OrganizationOptions
  ): OrganizedDocument[] {
    // First group by subject
    const subjectGroups: Map<string, typeof documents> = new Map();

    for (const doc of documents) {
      const subject = doc.subject || doc.labels?.[0] || 'Uncategorized';

      if (!subjectGroups.has(subject)) {
        subjectGroups.set(subject, []);
      }

      subjectGroups.get(subject)!.push(doc);
    }

    // Then sort within each subject group chronologically
    const organized: OrganizedDocument[] = [];

    for (const [subject, docs] of subjectGroups) {
      const sorted = [...docs].sort((a, b) =>
        (a.createdAt || 0) - (b.createdAt || 0)
      );

      for (let i = 0; i < sorted.length; i++) {
        const doc = sorted[i];
        organized.push({
          id: doc.id,
          document: doc,
          group: subject,
          position: i,
          metadata: {
            clusterId: subject,
            sortKey: (doc.createdAt || 0).toString(),
          },
        });
      }
    }

    // Sort groups by most recent document
    organized.sort((a, b) => {
      const aTime = a.document.createdAt || 0;
      const bTime = b.document.createdAt || 0;
      return bTime - aTime;
    });

    return organized;
  }

  /**
   * Clear cached organization results
   */
  clearCache(vaultId?: string): void {
    if (vaultId) {
      // Clear specific vault
      for (const key of this.organizationCache.keys()) {
        if (key.startsWith(`${vaultId}-`)) {
          this.organizationCache.delete(key);
        }
      }
    } else {
      // Clear all
      this.organizationCache.clear();
    }
  }
}

/**
 * Factory function to create OrganizationEngine
 *
 * @returns OrganizationEngine instance
 *
 * @example
 * ```tsx
 * const engine = createOrganizationEngine();
 * const recommendations = await engine.generateRecommendations('vault-123', documents);
 * ```
 */
export function createOrganizationEngine(): OrganizationEngine {
  return new OrganizationEngine();
}
