/**
 * @fileoverview Subject Classification Service
 * @module lib/knowledge/subject-classifier
 * @governance EPIC-38, PHASE-6
 * @ai-observable true
 *
 * Automatic subject classification for knowledge sources.
 * Supports topic modeling from embeddings, hierarchical classification,
 * and dynamic category creation.
 *
 * @example
 * ```tsx
 * import { SubjectClassifier, createSubjectClassifier } from '@/lib/knowledge/subject-classifier';
 *
 * const classifier = createSubjectClassifier();
 *
 * // Classify a source
 * const subject = await classifier.classifySource({
 *   content: 'Calculus derivatives and integrals...',
 *   embedding: [0.1, 0.2, ...],
 *   metadata: { title: 'Introduction to Calculus' }
 * });
 * console.log(subject); // 'Mathematics > Calculus'
 *
 * // Get all subjects
 * const subjects = await classifier.getAllSubjects();
 * ```
 */

/**
 * Subject category
 *
 * Represents a subject in the classification hierarchy.
 */
export interface SubjectCategory {
  /** Unique subject ID */
  id: string;
  /** Subject name */
  name: string;
  /** Parent subject ID (for hierarchical classification) */
  parentId?: string;
  /** Child subject IDs */
  childIds: string[];
  /** Subject embedding (centroid of member embeddings) */
  embedding?: number[];
  /** Member source IDs */
  memberIds: string[];
  /** Subject metadata */
  metadata?: {
    /** Confidence score for this subject */
    confidence?: number;
    /** Creation timestamp */
    createdAt?: number;
    /** Last updated timestamp */
    updatedAt?: number;
    /** Description */
    description?: string;
    /** Alternative names */
    aliases?: string[];
  };
}

/**
 * Classification result
 *
 * Result of classifying a source.
 */
export interface ClassificationResult {
  /** Primary subject */
  subject: string;
  /** Subject path (e.g., "Mathematics > Calculus") */
  subjectPath: string[];
  /** Confidence score (0-1) */
  confidence: number;
  /** Alternative subjects with scores */
  alternatives: Array<{
    subject: string;
    confidence: number;
  }>;
  /** Classification timestamp */
  classifiedAt: number;
}

/**
 * Classification options
 */
export interface ClassificationOptions {
  /** Minimum confidence threshold */
  minConfidence?: number;
  /** Return full hierarchy path */
  includePath?: boolean;
  /** Return alternative subjects */
  includeAlternatives?: boolean;
  /** Create new subjects if needed */
  autoCreateSubjects?: boolean;
  /** Maximum hierarchy depth */
  maxDepth?: number;
}

/**
 * Source data for classification
 */
export interface SourceData {
  /** Source ID */
  id?: string;
  /** Content text */
  content?: string;
  /** Embedding vector */
  embedding?: number[];
  /** Existing metadata */
  metadata?: {
    title?: string;
    description?: string;
    labels?: string[];
    [key: string]: any;
  };
}

/**
 * Subject statistics
 */
export interface SubjectStatistics {
  /** Total subject count */
  totalSubjects: number;
  /** Subjects by hierarchy level */
  subjectsByLevel: Record<number, number>;
  /** Most common subjects */
  topSubjects: Array<{
    subject: string;
    count: number;
  }>;
  /** Average subjects per source */
  avgSubjectsPerSource: number;
}

/**
 * Predefined subject hierarchy
 *
 * Initial subject structure for common academic domains.
 */
const PREDEFINED_SUBJECTS = Array<{
  id: string;
  name: string;
  parentId?: string;
  aliases?: string[];
}>;

/**
 * Subject Classification Service
 *
 * Automatically classifies sources into hierarchical subjects.
 * Supports topic modeling, dynamic category creation, and reclassification.
 */
export class SubjectClassifier {
  private subjects: Map<string, SubjectCategory>;
  private classificationCache: Map<string, ClassificationResult>;
  private embeddingCache: Map<string, number[]>;
  private initialized: boolean;

  constructor() {
    this.subjects = new Map();
    this.classificationCache = new Map();
    this.embeddingCache = new Map();
    this.initialized = false;
  }

  /**
   * Initialize with predefined subjects
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Load predefined subjects
    const predefined = this.getPredefinedSubjects();

    for (const subject of predefined) {
      this.subjects.set(subject.id, {
        id: subject.id,
        name: subject.name,
        parentId: subject.parentId,
        childIds: [],
        memberIds: [],
        metadata: {
          createdAt: Date.now(),
          aliases: subject.aliases,
        },
      });
    }

    // Build hierarchy
    this.rebuildHierarchy();

    this.initialized = true;
  }

  /**
   * Get predefined subject hierarchy
   */
  private getPredefinedSubjects(): PREDEFINED_SUBJECTS {
    return [
      // STEM
      { id: 'stem', name: 'STEM', aliases: ['Science, Technology, Engineering, Mathematics'] },

      { id: 'mathematics', name: 'Mathematics', parentId: 'stem', aliases: ['Math'] },
      { id: 'calculus', name: 'Calculus', parentId: 'mathematics' },
      { id: 'algebra', name: 'Algebra', parentId: 'mathematics' },
      { id: 'geometry', name: 'Geometry', parentId: 'mathematics' },
      { id: 'statistics', name: 'Statistics', parentId: 'mathematics' },

      { id: 'physics', name: 'Physics', parentId: 'stem' },
      { id: 'mechanics', name: 'Mechanics', parentId: 'physics' },
      { id: 'thermodynamics', name: 'Thermodynamics', parentId: 'physics' },
      { id: 'electromagnetism', name: 'Electromagnetism', parentId: 'physics' },
      { id: 'quantum-physics', name: 'Quantum Physics', parentId: 'physics' },

      { id: 'computer-science', name: 'Computer Science', parentId: 'stem', aliases: ['CS'] },
      { id: 'programming', name: 'Programming', parentId: 'computer-science' },
      { id: 'algorithms', name: 'Algorithms', parentId: 'computer-science' },
      { id: 'data-structures', name: 'Data Structures', parentId: 'computer-science' },
      { id: 'machine-learning', name: 'Machine Learning', parentId: 'computer-science' },

      { id: 'biology', name: 'Biology', parentId: 'stem' },
      { id: 'chemistry', name: 'Chemistry', parentId: 'stem' },

      // Humanities
      { id: 'humanities', name: 'Humanities' },

      { id: 'literature', name: 'Literature', parentId: 'humanities' },
      { id: 'fiction', name: 'Fiction', parentId: 'literature' },
      { id: 'poetry', name: 'Poetry', parentId: 'literature' },
      { id: 'non-fiction', name: 'Non-Fiction', parentId: 'literature' },

      { id: 'history', name: 'History', parentId: 'humanities' },
      { id: 'ancient-history', name: 'Ancient History', parentId: 'history' },
      { id: 'modern-history', name: 'Modern History', parentId: 'history' },

      { id: 'philosophy', name: 'Philosophy', parentId: 'humanities' },

      // Social Sciences
      { id: 'social-sciences', name: 'Social Sciences', aliases: ['Social Studies'] },

      { id: 'economics', name: 'Economics', parentId: 'social-sciences' },
      { id: 'psychology', name: 'Psychology', parentId: 'social-sciences' },
      { id: 'sociology', name: 'Sociology', parentId: 'social-sciences' },
      { id: 'political-science', name: 'Political Science', parentId: 'social-sciences' },

      // Arts
      { id: 'arts', name: 'Arts' },

      { id: 'visual-arts', name: 'Visual Arts', parentId: 'arts' },
      { id: 'music', name: 'Music', parentId: 'arts' },
      { id: 'theater', name: 'Theater', parentId: 'arts' },

      // Other
      { id: 'general', name: 'General', aliases: ['Other', 'Miscellaneous'] },
    ];
  }

  /**
   * Rebuild hierarchy (parent-child relationships)
   */
  private rebuildHierarchy(): void {
    // Clear child IDs
    for (const subject of this.subjects.values()) {
      subject.childIds = [];
    }

    // Rebuild relationships
    for (const subject of this.subjects.values()) {
      if (subject.parentId) {
        const parent = this.subjects.get(subject.parentId);
        if (parent) {
          parent.childIds.push(subject.id);
        }
      }
    }
  }

  /**
   * Classify a source
   *
   * @param source - Source data to classify
   * @param options - Classification options
   * @returns Classification result
   *
   * @example
   * ```tsx
   * const result = await classifier.classifySource({
   *   content: 'Introduction to calculus derivatives...',
   *   metadata: { title: 'Calculus 101', labels: ['math', 'derivatives'] }
   * });
   * console.log(result.subject); // 'Mathematics > Calculus'
   * ```
   */
  async classifySource(source: SourceData, options: ClassificationOptions = {}): Promise<ClassificationResult> {
    await this.initialize();

    const minConfidence = options.minConfidence ?? 0.3;
    const includePath = options.includePath !== false;
    const includeAlternatives = options.includeAlternatives !== false;
    const autoCreateSubjects = options.autoCreateSubjects ?? false;

    // Check cache
    if (source.id && this.classificationCache.has(source.id)) {
      const cached = this.classificationCache.get(source.id)!;
      if (cached.confidence >= minConfidence) {
        return cached;
      }
    }

    // Extract features from source
    const features = this.extractFeatures(source);

    // Score all subjects
    const scores = this.scoreSubjects(features);

    // Find best match
    let bestSubject = this.getBestSubject(scores, minConfidence);

    // Create new subject if enabled and no good match
    if (!bestSubject && autoCreateSubjects && features.suggestedSubject) {
      const newSubject = await this.createSubject(features.suggestedSubject);
      if (newSubject) {
        bestSubject = {
          subjectId: newSubject.id,
          subjectName: newSubject.name,
          confidence: 0.5,
        };
      }
    }

    // Fallback to 'general' if still no match
    if (!bestSubject) {
      bestSubject = {
        subjectId: 'general',
        subjectName: 'General',
        confidence: 0.2,
      };
    }

    // Build result
    const result: ClassificationResult = {
      subject: bestSubject.subjectName,
      subjectPath: includePath ? this.buildSubjectPath(bestSubject.subjectId) : [bestSubject.subjectName],
      confidence: bestSubject.confidence,
      alternatives: includeAlternatives
        ? this.getAlternatives(scores, bestSubject.subjectId, 5)
        : [],
      classifiedAt: Date.now(),
    };

    // Cache result
    if (source.id) {
      this.classificationCache.set(source.id, result);
    }

    // Add to subject members
    if (source.id) {
      const subject = this.subjects.get(bestSubject.subjectId);
      if (subject && !subject.memberIds.includes(source.id)) {
        subject.memberIds.push(source.id);
        subject.metadata!.updatedAt = Date.now();

        // Update subject embedding
        if (source.embedding) {
          this.updateSubjectEmbedding(bestSubject.subjectId, source.embedding);
        }
      }
    }

    return result;
  }

  /**
   * Extract features from source
   */
  private extractFeatures(source: SourceData): {
    keywords: string[];
    labels: string[];
    titleWords: string[];
    suggestedSubject?: string;
  } {
    const keywords: string[] = [];
    const labels = source.metadata?.labels || [];
    const titleWords: string[] = [];

    // Extract from title
    if (source.metadata?.title) {
      const words = source.metadata.title.toLowerCase().split(/\s+/);
      titleWords.push(...words.filter(w => w.length > 3));
    }

    // Extract from content (sample)
    if (source.content) {
      const words = source.content.toLowerCase().split(/\s+/);
      keywords.push(...words.filter(w => w.length > 4));
    }

    // Suggest subject from labels
    const suggestedSubject = labels[0]?.charAt(0).toUpperCase() + labels[0]?.slice(1);

    return { keywords, labels, titleWords, suggestedSubject };
  }

  /**
   * Score subjects based on features
   */
  private scoreSubjects(features: ReturnType<SubjectClassifier['extractFeatures']>): Map<string, number> {
    const scores = new Map<string, number>();

    for (const [id, subject] of this.subjects) {
      let score = 0;

      // Match by name
      const subjectNameLower = subject.name.toLowerCase();
      for (const label of features.labels) {
        if (subjectNameLower.includes(label.toLowerCase()) || label.toLowerCase().includes(subjectNameLower)) {
          score += 0.5;
        }
      }

      // Match by aliases
      if (subject.metadata?.aliases) {
        for (const alias of subject.metadata.aliases) {
          const aliasLower = alias.toLowerCase();
          for (const label of features.labels) {
            if (aliasLower.includes(label.toLowerCase()) || label.toLowerCase().includes(aliasLower)) {
              score += 0.3;
            }
          }
        }
      }

      // Match by title words
      for (const word of features.titleWords) {
        if (subjectNameLower.includes(word) || word.includes(subjectNameLower)) {
          score += 0.2;
        }
      }

      // Embedding similarity
      if (features.embedding && subject.embedding) {
        const similarity = this.cosineSimilarity(features.embedding, subject.embedding);
        score += similarity * 0.3;
      }

      scores.set(id, Math.min(score, 1.0));
    }

    return scores;
  }

  /**
   * Get best subject from scores
   */
  private getBestSubject(scores: Map<string, number>, minConfidence: number): {
    subjectId: string;
    subjectName: string;
    confidence: number;
  } | null {
    let bestId: string | null = null;
    let bestScore = 0;

    for (const [id, score] of scores) {
      if (score > bestScore && score >= minConfidence) {
        bestScore = score;
        bestId = id;
      }
    }

    if (!bestId) return null;

    const subject = this.subjects.get(bestId);
    if (!subject) return null;

    return {
      subjectId: bestId,
      subjectName: subject.name,
      confidence: bestScore,
    };
  }

  /**
   * Build subject path (hierarchy)
   */
  private buildSubjectPath(subjectId: string): string[] {
    const path: string[] = [];
    let currentId = subjectId;

    while (currentId) {
      const subject = this.subjects.get(currentId);
      if (!subject) break;

      path.unshift(subject.name);
      currentId = subject.parentId || '';
    }

    return path;
  }

  /**
   * Get alternative subjects
   */
  private getAlternatives(
    scores: Map<string, number>,
    excludeId: string,
    count: number
  ): Array<{ subject: string; confidence: number }> {
    const alternatives: Array<{ subject: string; confidence: number }> = [];

    for (const [id, score] of scores) {
      if (id !== excludeId && score > 0.1) {
        const subject = this.subjects.get(id);
        if (subject) {
          alternatives.push({
            subject: subject.name,
            confidence: score,
          });
        }
      }
    }

    // Sort by confidence and limit
    alternatives.sort((a, b) => b.confidence - a.confidence);
    return alternatives.slice(0, count);
  }

  /**
   * Update subject embedding (centroid)
   */
  private updateSubjectEmbedding(subjectId: string, newEmbedding: number[]): void {
    const subject = this.subjects.get(subjectId);
    if (!subject) return;

    if (!subject.embedding) {
      subject.embedding = [...newEmbedding];
    } else {
      // Update centroid
      const n = subject.memberIds.length;
      for (let i = 0; i < subject.embedding.length; i++) {
        subject.embedding[i] = (subject.embedding[i] * (n - 1) + newEmbedding[i]) / n;
      }
    }
  }

  /**
   * Calculate cosine similarity between embeddings
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Create a new subject dynamically
   */
  async createSubject(name: string, parentId?: string): Promise<SubjectCategory | null> {
    const id = this.generateSubjectId(name);

    // Check if already exists
    if (this.subjects.has(id)) {
      return this.subjects.get(id)!;
    }

    const newSubject: SubjectCategory = {
      id,
      name,
      parentId,
      childIds: [],
      memberIds: [],
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        confidence: 0.5,
      },
    };

    this.subjects.set(id, newSubject);

    // Update hierarchy
    this.rebuildHierarchy();

    return newSubject;
  }

  /**
   * Generate subject ID from name
   */
  private generateSubjectId(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
  }

  /**
   * Get all subjects
   */
  getAllSubjects(): SubjectCategory[] {
    return Array.from(this.subjects.values());
  }

  /**
   * Get subject by ID
   */
  getSubject(id: string): SubjectCategory | undefined {
    return this.subjects.get(id);
  }

  /**
   * Get subject statistics
   */
  getStatistics(): SubjectStatistics {
    const subjectsByLevel: Record<number, number> = {};
    const memberCounts = new Map<string, number>();

    for (const subject of this.subjects.values()) {
      // Count by level
      let level = 0;
      let current = subject;
      while (current.parentId) {
        level++;
        current = this.subjects.get(current.parentId)!;
      }
      subjectsByLevel[level] = (subjectsByLevel[level] || 0) + 1;

      // Count members
      memberCounts.set(subject.name, subject.memberIds.length);
    }

    // Top subjects
    const topSubjects = Array.from(memberCounts.entries())
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Average subjects per source
    const totalMembers = Array.from(this.subjects.values()).reduce((sum, s) => sum + s.memberIds.length, 0);
    const uniqueSources = new Set(Array.from(this.subjects.values()).flatMap(s => s.memberIds)).size;
    const avgSubjectsPerSource = uniqueSources > 0 ? totalMembers / uniqueSources : 0;

    return {
      totalSubjects: this.subjects.size,
      subjectsByLevel,
      topSubjects,
      avgSubjectsPerSource,
    };
  }

  /**
   * Reclassify a source
   *
   * @param sourceId - Source ID to reclassify
   * @param newSourceData - Updated source data
   * @returns New classification result
   */
  async reclassify(sourceId: string, newSourceData: SourceData): Promise<ClassificationResult> {
    // Remove from old subject
    for (const subject of this.subjects.values()) {
      const index = subject.memberIds.indexOf(sourceId);
      if (index > -1) {
        subject.memberIds.splice(index, 1);
        subject.metadata!.updatedAt = Date.now();
      }
    }

    // Clear cache
    this.classificationCache.delete(sourceId);

    // Reclassify
    return this.classifySource({ ...newSourceData, id: sourceId });
  }

  /**
   * Clear all data
   */
  async clear(): Promise<void> {
    this.subjects.clear();
    this.classificationCache.clear();
    this.embeddingCache.clear();
    this.initialized = false;
  }
}

/**
 * Factory function to create SubjectClassifier
 *
 * @returns SubjectClassifier instance
 *
 * @example
 * ```tsx
 * const classifier = createSubjectClassifier();
 * await classifier.initialize();
 * ```
 */
export function createSubjectClassifier(): SubjectClassifier {
  return new SubjectClassifier();
}
