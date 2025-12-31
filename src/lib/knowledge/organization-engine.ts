/**
 * @fileoverview Organization Engine Service
 * @module lib/knowledge/organization-engine
 * @governance EPIC-38, PHASE-7
 * @ai-observable true
 *
 * Auto-organization recommendations engine for knowledge vaults.
 * Orchestrates vault analysis, recommendation generation, and strategy application.
 */

import { VaultAnalyzer } from './vault-analyzer';
import { RecommendationGenerator } from './recommendation-generator';
import { OrganizationStrategies } from './organization-strategies';
import type {
  OrganizationType,
  OrganizationRecommendation,
  OrganizationResult,
  OrganizationOptions,
  VaultAnalysis,
  OrganizedDocument,
} from './organization-types';

export type {
  OrganizationType,
  OrganizationRecommendation,
  OrganizedDocument,
  OrganizationResult,
  OrganizationOptions,
  VaultAnalysis,
};

export class OrganizationEngine {
  private analyzer: VaultAnalyzer;
  private generator: RecommendationGenerator;
  private strategies: OrganizationStrategies;

  constructor() {
    this.analyzer = new VaultAnalyzer();
    this.generator = new RecommendationGenerator();
    this.strategies = new OrganizationStrategies();
  }

  async analyzeVault(documents: Array<{
    id: string;
    createdAt?: number;
    subject?: string;
  }>): Promise<VaultAnalysis> {
    return this.analyzer.analyzeVault(documents);
  }

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
    const analysis = await this.analyzeVault(documents);
    return this.generator.generateRecommendations(analysis);
  }

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
    return this.strategies.applyOrganization(vaultId, type, documents, options);
  }

  clearCache(vaultId?: string): void {
    this.strategies.clearCache(vaultId);
  }
}

export function createOrganizationEngine(): OrganizationEngine {
  return new OrganizationEngine();
}
