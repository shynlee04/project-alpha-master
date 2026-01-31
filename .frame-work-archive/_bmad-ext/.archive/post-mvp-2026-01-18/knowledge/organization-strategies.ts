/**
 * @fileoverview Organization strategies
 * @module lib/knowledge/organization-strategies
 *
 * **DEFERRED - Post-MVP Archive**
 */

import type {
  OrganizationType,
  OrganizationOptions,
} from './organization-types';

import type { OrganizedDocument } from './organization-types';

import type { SubjectCategory } from './subject-classifier';

/**
 * Organization strategy interface
 */
export interface OrganizationStrategy {
  type: OrganizationType;
  name: string;
  description: string;
  organize: (
    documents: OrganizedDocument[],
    options?: OrganizationOptions
  ) => Promise<{
    structure: unknown;
    recommendations: string[];
  }>;
}

/**
 * Hierarchical strategy
 */
export const hierarchicalStrategy: OrganizationStrategy = {
  type: 'hierarchical',
  name: 'Hierarchical Folders',
  description: 'Organize documents into nested folders by category',
  organize: async (documents: OrganizedDocument[]) => {
    const folderMap = new Map<string, OrganizedDocument[]>();

    for (const doc of documents) {
      // Simple categorization
      const category = categorizeDocument(doc.content);
      const path = `/${category}`;
      if (!folderMap.has(path)) {
        folderMap.set(path, []);
      }
      folderMap.get(path)!.push(doc);
    }

    return {
      structure: Object.fromEntries(folderMap),
      recommendations: [
        'Consider creating subfolders for fine-grained organization',
        'Use consistent naming conventions for folders',
      ],
    };
  },
};

/**
 * Tag-based strategy
 */
export const tagBasedStrategy: OrganizationStrategy = {
  type: 'tag_based',
  name: 'Tag-Based',
  description: 'Organize documents using tags instead of folders',
  organize: async (documents: OrganizedDocument[]) => {
    const tagMap = new Map<string, OrganizedDocument[]>();

    for (const doc of documents) {
      const tags = extractTags(doc.content);
      for (const tag of tags) {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, []);
        }
        tagMap.get(tag)!.push(doc);
      }
    }

    return {
      structure: Object.fromEntries(tagMap),
      recommendations: [
        'Use consistent tagging across all documents',
        'Consider a controlled vocabulary for tags',
      ],
    };
  },
};

/**
 * Timeline strategy
 */
export const timelineStrategy: OrganizationStrategy = {
  type: 'timeline',
  name: 'Timeline',
  description: 'Organize documents chronologically',
  organize: async (documents: OrganizedDocument[]) => {
    const timeline = new Map<string, OrganizedDocument[]>();

    for (const doc of documents) {
      const year = doc.createdAt
        ? new Date(doc.createdAt).getFullYear().toString()
        : 'unknown';
      if (!timeline.has(year)) {
        timeline.set(year, []);
      }
      timeline.get(year)!.push(doc);
    }

    // Sort years descending
    const sortedTimeline = new Map(
      [...timeline.entries()].sort((a, b) => b[0].localeCompare(a[0]))
    );

    return {
      structure: Object.fromEntries(sortedTimeline),
      recommendations: [
        'Consider adding creation dates to undated documents',
        'Use consistent date formats',
      ],
    };
  },
};

/**
 * Graph strategy
 */
export const graphStrategy: OrganizationStrategy = {
  type: 'graph',
  name: 'Knowledge Graph',
  description: 'Organize documents as a connected graph',
  organize: async (documents: OrganizedDocument[]) => {
    const nodes = documents.map((doc) => ({
      id: doc.id,
      label: doc.title,
      type: 'document' as const,
    }));

    // Add subject nodes
    const subjects = new Set<SubjectCategory>();
    for (const doc of documents) {
      subjects.add(categorizeDocument(doc.content) as SubjectCategory);
    }

    for (const subject of subjects) {
      nodes.push({
        id: `subject-${subject}`,
        label: subject,
        type: 'subject' as const,
      });
    }

    const edges = documents.flatMap((doc) => {
      const subject = categorizeDocument(doc.content);
      return [
        {
          from: doc.id,
          to: `subject-${subject}`,
          type: 'belongs_to' as const,
        },
      ];
    });

    return {
      structure: { nodes, edges },
      recommendations: [
        'Add connections between related documents',
        'Consider using AI to suggest connections',
      ],
    };
  },
};

/**
 * Hybrid strategy
 */
export const hybridStrategy: OrganizationStrategy = {
  type: 'hybrid',
  name: 'Hybrid',
  description: 'Combine multiple organization methods',
  organize: async (documents: OrganizedDocument[]) => {
    const [hierarchical, tags, timeline] = await Promise.all([
      hierarchicalStrategy.organize(documents),
      tagBasedStrategy.organize(documents),
      timelineStrategy.organize(documents),
    ]);

    return {
      structure: {
        folders: hierarchical.structure,
        tags: tags.structure,
        timeline: timeline.structure,
      },
      recommendations: [
        ...hierarchical.recommendations,
        ...tags.recommendations,
        ...timeline.recommendations,
      ],
    };
  },
};

/**
 * All available strategies
 */
export const organizationStrategies: OrganizationStrategy[] = [
  hierarchicalStrategy,
  tagBasedStrategy,
  timelineStrategy,
  graphStrategy,
  hybridStrategy,
];

/**
 * Get strategy by type
 */
export function getStrategy(type: OrganizationType): OrganizationStrategy {
  const strategy = organizationStrategies.find((s) => s.type === type);
  if (!strategy) {
    throw new Error(`Unknown organization strategy: ${type}`);
  }
  return strategy;
}

/**
 * Categorize document content
 */
function categorizeDocument(content: string): string {
  const lower = content.toLowerCase();

  if (lower.includes('react') || lower.includes('javascript')) {
    return 'technology';
  }
  if (lower.includes('design') || lower.includes('ui')) {
    return 'design';
  }
  if (lower.includes('business') || lower.includes('revenue')) {
    return 'business';
  }

  return 'general';
}

/**
 * Extract tags from content
 */
function extractTags(content: string): string[] {
  const tagPattern = /#(\w+)/g;
  const matches = content.match(tagPattern);
  return matches ? matches.map((t) => t.slice(1)) : ['untagged'];
}
