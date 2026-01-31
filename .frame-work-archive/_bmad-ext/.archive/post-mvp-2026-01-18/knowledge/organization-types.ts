/**
 * @fileoverview Organization types
 * @module lib/knowledge/organization-types
 */

export type OrganizationType =
  | 'hierarchical'
  | 'tag_based'
  | 'timeline'
  | 'graph'
  | 'hybrid';

export interface OrganizationRecommendation {
  suggestedFolders: {
    name: string;
    path: string;
    suggestedDocuments: { id: string; title: string }[];
  }[];
  suggestedTags: string[];
  suggestedTimeline: {
    year: string;
    suggestedDocuments: { id: string; title: string }[];
  }[];
  changes: {
    documentId: string;
    documentTitle: string;
    action: 'move' | 'tag' | 'merge';
    from: string;
    to: string;
  }[];
}

export interface OrganizedDocument {
  id: string;
  title: string;
  content: string;
  folder?: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrganizationResult {
  success: boolean;
  organized: {
    folders: {
      name: string;
      path: string;
      documents: { id: string; title: string }[];
      subfolders: typeof this.folders;
    }[];
    tags: {
      tag: string;
      documentCount: number;
      documents: { id: string; title: string }[];
    }[];
    timeline: {
      year: string;
      documentCount: number;
      documents: { id: string; title: string }[];
    }[];
    graph: {
      nodes: { id: string; label: string; type: string }[];
      edges: { from: string; to: string; type: string }[];
    };
  };
  changes?: {
    documentId: string;
    documentTitle: string;
    action: 'move' | 'tag' | 'merge';
    from: string;
    to: string;
  }[];
  duration: number;
}

export interface VaultAnalysis {
  totalDocuments: number;
  uniqueSubjects: string[];
  tagDistribution: Record<string, number>;
  recommendedOrganization: OrganizationType;
  organizationScores: Record<OrganizationType, number>;
}

export interface OrganizationOptions {
  maxDepth?: number;
  includeChanges?: boolean;
  preserveExistingStructure?: boolean;
}
