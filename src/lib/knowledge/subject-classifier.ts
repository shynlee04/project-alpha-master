/**
 * @fileoverview Subject Classification Service
 * @module lib/knowledge/subject-classifier
 * @governance EPIC-38, PHASE-7
 * @ai-observable true
 *
 * Subject classification orchestrator combining taxonomy and scoring modules.
 */

import { SubjectTaxonomy } from './subject-taxonomy';
import { SubjectScoring } from './subject-scoring';
import type {
  SubjectCategory,
  ClassificationResult,
  ClassificationOptions,
  SourceData,
  SubjectStatistics,
} from './subject-classifier-types';

// Re-export types
export type {
  SubjectCategory,
  ClassificationResult,
  ClassificationOptions,
  SourceData,
  SubjectStatistics,
};

export class SubjectClassifier {
  private subjects: Map<string, SubjectCategory>;
  private taxonomy: SubjectTaxonomy;
  private scoring: SubjectScoring;
  private classificationCache: Map<string, ClassificationResult>;
  private embeddingCache: Map<string, number[]>;
  private initialized: boolean;

  constructor() {
    this.subjects = new Map();
    this.taxonomy = new SubjectTaxonomy(this.subjects);
    this.scoring = new SubjectScoring(this.subjects, this.taxonomy);
    this.classificationCache = new Map();
    this.embeddingCache = new Map();
    this.initialized = false;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    const predefined = this.taxonomy.getPredefinedSubjects();
    for (const subjectDef of predefined) {
      this.subjects.set(subjectDef.id, {
        id: subjectDef.id,
        name: subjectDef.name,
        parentId: subjectDef.parentId,
        childIds: [],
        memberIds: [],
        metadata: {
          confidence: 1.0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          aliases: subjectDef.aliases,
        },
      });
    }
    this.taxonomy.rebuildHierarchy();
    this.initialized = true;
  }

  async classifySource(
    source: SourceData,
    options: ClassificationOptions = {}
  ): Promise<ClassificationResult> {
    await this.initialize();
    const minConfidence = options.minConfidence ?? 0.3;
    const includePath = options.includePath !== false;
    const includeAlternatives = options.includeAlternatives !== false;
    const autoCreateSubjects = options.autoCreateSubjects ?? false;

    if (source.id && this.classificationCache.has(source.id)) {
      const cached = this.classificationCache.get(source.id)!;
      if (cached.confidence >= minConfidence) return cached;
    }

    const features = this.scoring.extractFeatures({
      labels: source.metadata?.labels,
      title: source.metadata?.title,
      content: source.content,
    });

    const scores = this.scoring.scoreSubjects(features, source.embedding);
    let bestSubject = this.scoring.getBestSubject(scores, minConfidence);

    if (!bestSubject && autoCreateSubjects && features.suggestedSubject) {
      const newSubject = await this.createSubject(features.suggestedSubject);
      if (newSubject) bestSubject = newSubject;
    }

    if (!bestSubject) bestSubject = this.subjects.get('general')!;

    const subjectPath = includePath
      ? this.buildSubjectPath(bestSubject.id).map((s) => s.name)
      : [bestSubject.name];

    const alternatives = includeAlternatives
      ? this.getAlternatives(scores, bestSubject.id, 5)
      : [];

    const result: ClassificationResult = {
      subject: bestSubject.name,
      subjectPath,
      confidence: scores.get(bestSubject.id) || 0,
      alternatives,
      classifiedAt: Date.now(),
    };

    if (source.id) {
      this.classificationCache.set(source.id, result);
      if (!bestSubject.memberIds.includes(source.id)) {
        bestSubject.memberIds.push(source.id);
        bestSubject.metadata!.updatedAt = Date.now();
        if (source.embedding) {
          this.taxonomy.updateSubjectEmbedding(bestSubject.id, source.embedding);
        }
      }
    }

    return result;
  }

  buildSubjectPath(subjectId: string): SubjectCategory[] {
    const path: SubjectCategory[] = [];
    let current = this.subjects.get(subjectId);
    while (current) {
      path.unshift(current);
      if (current.parentId) {
        current = this.subjects.get(current.parentId);
      } else {
        break;
      }
    }
    return path;
  }

  private getAlternatives(
    scores: Map<string, number>,
    excludeId: string,
    count: number
  ): Array<{ subject: string; confidence: number }> {
    const alternativesRaw = this.scoring.getAlternatives(scores, excludeId, count);
    return alternativesRaw.map((alt) => ({
      subject: alt.subject.name,
      confidence: alt.score,
    }));
  }

  async createSubject(name: string, parentId?: string): Promise<SubjectCategory | null> {
    return this.taxonomy.createSubject(name, parentId);
  }

  async reclassify(sourceId: string, newSourceData: SourceData): Promise<ClassificationResult> {
    for (const subject of this.subjects.values()) {
      const index = subject.memberIds.indexOf(sourceId);
      if (index > -1) {
        subject.memberIds.splice(index, 1);
        subject.metadata!.updatedAt = Date.now();
      }
    }
    this.classificationCache.delete(sourceId);
    return this.classifySource({ ...newSourceData, id: sourceId });
  }

  getAllSubjects(): SubjectCategory[] {
    return this.taxonomy.getAllSubjects();
  }

  getSubject(id: string): SubjectCategory | undefined {
    return this.taxonomy.getSubject(id);
  }

  getStatistics(): SubjectStatistics {
    const subjectsByLevel: Record<number, number> = {};
    const memberCounts = new Map<string, number>();

    for (const subject of this.subjects.values()) {
      let level = 0;
      let current = subject;
      while (current.parentId) {
        level++;
        current = this.subjects.get(current.parentId)!;
      }
      subjectsByLevel[level] = (subjectsByLevel[level] || 0) + 1;
      memberCounts.set(subject.name, subject.memberIds.length);
    }

    const topSubjects = Array.from(memberCounts.entries())
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const totalMembers = Array.from(this.subjects.values()).reduce(
      (sum, s) => sum + s.memberIds.length,
      0
    );
    const uniqueSources = new Set(
      Array.from(this.subjects.values()).flatMap((s) => s.memberIds)
    ).size;

    return {
      totalSubjects: this.subjects.size,
      subjectsByLevel,
      topSubjects,
      avgSubjectsPerSource: uniqueSources > 0 ? totalMembers / uniqueSources : 0,
    };
  }

  async clear(): Promise<void> {
    this.subjects.clear();
    this.classificationCache.clear();
    this.embeddingCache.clear();
    this.initialized = false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Factory Function
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Factory function to create SubjectClassifier
 *
 * @returns SubjectClassifier instance
 *
 * @example
 * ```tsx
 * import { createSubjectClassifier } from '@/lib/knowledge/subject-classifier';
 *
 * const classifier = createSubjectClassifier();
 * await classifier.initialize();
 * ```
 */
export function createSubjectClassifier(): SubjectClassifier {
  return new SubjectClassifier();
}
