/**
 * @fileoverview Subject Taxonomy Management
 * @module lib/knowledge/subject-taxonomy
 * @governance EPIC-38, PHASE-7
 * @ai-observable true
 *
 * Subject hierarchy and taxonomy management.
 * Handles predefined subjects, hierarchy building, and dynamic category creation.
 */

import type { SubjectCategory } from './subject-classifier-types';

/**
 * Subject Taxonomy Manager
 *
 * Manages subject hierarchy, predefined subjects, and dynamic category creation.
 */
export class SubjectTaxonomy {
  private subjects: Map<string, SubjectCategory>;
  private embeddingCache: Map<string, number[]>;

  constructor(subjects: Map<string, SubjectCategory>) {
    this.subjects = subjects;
    this.embeddingCache = new Map();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Initialization & Predefined Data
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get predefined subject hierarchy
   */
  getPredefinedSubjects(): Array<{
    id: string;
    name: string;
    parentId?: string;
    aliases?: string[];
  }> {
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
  rebuildHierarchy(): void {
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

  // ═══════════════════════════════════════════════════════════════════════════
  // Dynamic Category Creation
  // ═══════════════════════════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════════════════════════
  // Embedding Management
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Update subject embedding (centroid)
   */
  updateSubjectEmbedding(subjectId: string, newEmbedding: number[]): void {
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
   * Get embedding cache
   */
  getEmbeddingCache(): Map<string, number[]> {
    return this.embeddingCache;
  }
}
