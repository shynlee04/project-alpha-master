/**
 * @fileoverview Subject taxonomy definition
 * @module lib/knowledge/subject-taxonomy
 *
 * **DEFERRED - Post-MVP Archive**
 */

export interface SubjectTaxonomy {
  version: string;
  lastUpdated: string;
  categories: SubjectCategoryDefinition[];
}

export interface SubjectCategoryDefinition {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  relatedSubjects?: string[];
  color?: string;
}

/**
 * Default subject taxonomy
 */
export const defaultTaxonomy: SubjectTaxonomy = {
  version: '1.0',
  lastUpdated: '2024-01-01',
  categories: [
    {
      id: 'technology',
      name: 'Technology',
      description: 'Software, programming, and tech-related topics',
      keywords: [
        'software',
        'programming',
        'coding',
        'algorithm',
        'database',
        'api',
        'javascript',
        'typescript',
        'react',
        'python',
        'machine learning',
        'ai',
        'artificial intelligence',
        '云计算',
        '大数据',
        '人工智能',
      ],
      relatedSubjects: ['science'],
      color: '#3b82f6',
    },
    {
      id: 'science',
      name: 'Science',
      description: 'Scientific research and methodology',
      keywords: [
        'research',
        'experiment',
        'hypothesis',
        'theory',
        'physics',
        'chemistry',
        'biology',
        'scientific',
        'data analysis',
        'methodology',
      ],
      relatedSubjects: ['technology'],
      color: '#10b981',
    },
    {
      id: 'business',
      name: 'Business',
      description: 'Business, finance, and management',
      keywords: [
        'business',
        'revenue',
        'profit',
        'strategy',
        'marketing',
        'sales',
        'management',
        'investment',
        'finance',
        'startup',
        'entrepreneur',
      ],
      color: '#f59e0b',
    },
    {
      id: 'arts',
      name: 'Arts & Humanities',
      description: 'Creative arts and humanities',
      keywords: [
        'art',
        'design',
        'music',
        'literature',
        'history',
        'culture',
        'philosophy',
        'creative',
        'visual',
        'performance',
      ],
      color: '#8b5cf6',
    },
    {
      id: 'health',
      name: 'Health & Wellness',
      description: 'Health, fitness, and wellness topics',
      keywords: [
        'health',
        'medical',
        'fitness',
        'nutrition',
        'mental health',
        'wellness',
        'exercise',
        'diet',
        'therapy',
        'medicine',
      ],
      color: '#ef4444',
    },
    {
      id: 'other',
      name: 'Other',
      description: 'Miscellaneous or uncategorized content',
      keywords: [],
      color: '#6b7280',
    },
  ],
};

/**
 * Get category by ID
 */
export function getCategoryById(
  taxonomy: SubjectTaxonomy,
  id: string
): SubjectCategoryDefinition | undefined {
  return taxonomy.categories.find((c) => c.id === id);
}

/**
 * Search categories by keyword
 */
export function searchCategories(
  taxonomy: SubjectTaxonomy,
  query: string
): SubjectCategoryDefinition[] {
  const queryLower = query.toLowerCase();

  return taxonomy.categories.filter((category) =>
    category.keywords.some((keyword) => keyword.includes(queryLower))
  );
}
