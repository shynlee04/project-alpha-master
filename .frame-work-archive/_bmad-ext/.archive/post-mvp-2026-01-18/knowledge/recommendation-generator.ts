/**
 * @fileoverview Recommendation generator
 * @module lib/knowledge/recommendation-generator
 *
 * **DEFERRED - Post-MVP Archive**
 */

import type { RelevancyScore } from './relevancy-scorer';
import type { SubjectCategory } from './subject-classifier';

export interface Recommendation {
  id: string;
  type: 'related_document' | 'study_path' | 'knowledge_gap' | 'organization';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  targetId?: string;
  actionUrl?: string;
}

export interface RecommendationContext {
  currentDocument?: {
    id: string;
    title: string;
    content: string;
    tags?: string[];
  };
  recentDocuments?: { id: string; title: string; content: string }[];
  vaultStats?: {
    totalDocuments: number;
    subjectDistribution: Record<SubjectCategory, number>;
  };
}

/**
 * Generate recommendations based on context
 */
export async function generateRecommendations(
  context: RecommendationContext
): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  // Generate related document recommendations
  if (context.currentDocument) {
    const related = await generateRelatedRecommendations(context);
    recommendations.push(...related);
  }

  // Generate study path recommendations
  if (context.currentDocument) {
    const studyPath = await generateStudyPathRecommendations(context);
    recommendations.push(...studyPath);
  }

  // Generate knowledge gap recommendations
  if (context.vaultStats) {
    const gaps = await generateKnowledgeGapRecommendations(context);
    recommendations.push(...gaps);
  }

  // Generate organization recommendations
  if (context.vaultStats && context.vaultStats.totalDocuments > 20) {
    const org = await generateOrganizationRecommendations(context);
    recommendations.push(...org);
  }

  // Sort by priority
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Generate related document recommendations
 */
async function generateRelatedRecommendations(
  context: RecommendationContext
): Promise<Recommendation[]> {
  if (!context.currentDocument) return [];

  // In real implementation, this would use the relevancy scorer
  const recommendations: Recommendation[] = [];

  if (context.recentDocuments) {
    const recent = context.recentDocuments
      .filter((doc) => doc.id !== context.currentDocument!.id)
      .slice(0, 3);

    for (const doc of recent) {
      recommendations.push({
        id: `related-${doc.id}`,
        type: 'related_document',
        title: `Related: ${doc.title}`,
        description: 'This document might be relevant to your current reading',
        priority: 'medium',
        targetId: doc.id,
      });
    }
  }

  return recommendations;
}

/**
 * Generate study path recommendations
 */
async function generateStudyPathRecommendations(
  context: RecommendationContext
): Promise<Recommendation[]> {
  if (!context.currentDocument) return [];

  return [
    {
      id: 'study-path-1',
      type: 'study_path',
      title: 'Continue Learning',
      description: 'Explore related topics to deepen your understanding',
      priority: 'medium',
      actionUrl: '/study/continue',
    },
  ];
}

/**
 * Generate knowledge gap recommendations
 */
async function generateKnowledgeGapRecommendations(
  context: RecommendationContext
): Promise<Recommendation[]> {
  if (!context.vaultStats) return [];

  const recommendations: Recommendation[] = [];
  const underrepresented: SubjectCategory[] = [];

  // Find underrepresented subjects
  const total = context.vaultStats.totalDocuments;
  for (const [subject, count] of Object.entries(
    context.vaultStats.subjectDistribution
  )) {
    if (count / total < 0.1) {
      underrepresented.push(subject as SubjectCategory);
    }
  }

  if (underrepresented.length > 0) {
    recommendations.push({
      id: 'gap-1',
      type: 'knowledge_gap',
      title: 'Expand Your Knowledge Base',
      description: `Consider adding more content about: ${underrepresented.join(', ')}`,
      priority: 'low',
      actionUrl: '/knowledge/import',
    });
  }

  return recommendations;
}

/**
 * Generate organization recommendations
 */
async function generateOrganizationRecommendations(
  context: RecommendationContext
): Promise<Recommendation[]> {
  if (!context.vaultStats || context.vaultStats.totalDocuments <= 20) return [];

  return [
    {
      id: 'org-1',
      type: 'organization',
      title: 'Organize Your Vault',
      description: 'Your vault is growing. Consider reorganizing for better discoverability.',
      priority: 'low',
      actionUrl: '/knowledge/organize',
    },
  ];
}

/**
 * Create recommendation engine instance
 */
export function createRecommendationGenerator() {
  return {
    generate: generateRecommendations,
  };
}
