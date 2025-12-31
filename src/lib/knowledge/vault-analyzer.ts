/**
 * @fileoverview Vault Analyzer
 * @module lib/knowledge/vault-analyzer
 * @governance EPIC-38, PHASE-7
 */

import type { VaultAnalysis } from './organization-types';

export class VaultAnalyzer {
  analyzeVault(documents: Array<{
    id: string;
    createdAt?: number;
    subject?: string;
  }>): VaultAnalysis {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    const documentCount = documents.length;

    const subjectDistribution: Record<string, number> = {};
    for (const doc of documents) {
      const subject = doc.subject || 'uncategorized';
      subjectDistribution[subject] = (subjectDistribution[subject] || 0) + 1;
    }

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

    const uniqueSubjects = Object.keys(subjectDistribution).length;
    const estimatedClusters = Math.min(uniqueSubjects, Math.ceil(documentCount / 5));

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

  private detectTemporalClustering(timestamps: number[], dayMs: number): boolean {
    if (timestamps.length < 3) return false;

    let gaps = 0;
    for (let i = 1; i < timestamps.length; i++) {
      const diff = timestamps[i] - timestamps[i - 1];
      if (diff > 7 * dayMs) gaps++;
    }

    return gaps > 0;
  }
}
