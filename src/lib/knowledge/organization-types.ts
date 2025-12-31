/**
 * @fileoverview Organization Types
 * @module lib/knowledge/organization-types
 * @governance EPIC-38, PHASE-7
 */

export type OrganizationType = 'chronological' | 'conceptual' | 'hybrid';

export interface OrganizationRecommendation {
  type: OrganizationType;
  confidence: number;
  rationale: string;
  benefits: string[];
  drawbacks: string[];
  estimatedTimeSeconds: number;
}

export interface OrganizedDocument {
  id: string;
  document: {
    id: string;
    title?: string;
    content?: string;
    createdAt?: number;
    subject?: string;
    labels?: string[];
    embedding?: number[];
  };
  group: string;
  position: number;
  metadata?: {
    relatedIds?: string[];
    clusterId?: string;
    sortKey?: string;
  };
}

export interface OrganizationResult {
  type: OrganizationType;
  totalDocuments: number;
  groupCount: number;
  documents: OrganizedDocument[];
  statistics: {
    avgGroupSize: number;
    maxGroupSize: number;
    minGroupSize: number;
  };
  appliedAt: number;
}

export interface OrganizationOptions {
  minGroupSize?: number;
  maxGroups?: number;
  preserveExisting?: boolean;
}

export interface VaultAnalysis {
  documentCount: number;
  subjectDistribution: Record<string, number>;
  temporalSpan: number;
  avgAge: number;
  estimatedClusters: number;
  hasTemporalClustering: boolean;
  hasSubjectClustering: boolean;
}
