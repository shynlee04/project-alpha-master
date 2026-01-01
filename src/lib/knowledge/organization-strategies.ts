/**
 * @fileoverview Organization Strategies
 * @module lib/knowledge/organization-strategies
 * @governance EPIC-38, PHASE-7
 */

import type { OrganizedDocument, OrganizationOptions, OrganizationResult, OrganizationType } from './organization-types';

export class OrganizationStrategies {
  private cache: Map<string, OrganizationResult>;

  constructor() {
    this.cache = new Map();
  }

  applyOrganization(
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
  ): OrganizationResult {
    const cacheKey = `${vaultId}-${type}`;
    const cached = this.cache.get(cacheKey);
    if (cached && options.preserveExisting) {
      return cached;
    }

    let organized: OrganizedDocument[];

    switch (type) {
      case 'chronological':
        organized = this.organizeChronological(documents);
        break;
      case 'conceptual':
        organized = this.organizeConceptual(documents, options);
        break;
      case 'hybrid':
        organized = this.organizeHybrid(documents, options);
        break;
    }

    const groups = new Set(organized.map(d => d.group));
    const groupSizes = Array.from(groups).map(group =>
      organized.filter(d => d.group === group).length
    );

    const result: OrganizationResult = {
      type,
      totalDocuments: documents.length,
      groupCount: groups.size,
      documents: organized,
      statistics: {
        avgGroupSize: groupSizes.reduce((a, b) => a + b, 0) / groupSizes.length,
        maxGroupSize: Math.max(...groupSizes),
        minGroupSize: Math.min(...groupSizes),
      },
      appliedAt: Date.now(),
    };

    this.cache.set(cacheKey, result);
    return result;
  }

  clearCache(vaultId?: string): void {
    if (vaultId) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${vaultId}-`)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  getCache(): Map<string, OrganizationResult> {
    return this.cache;
  }

  private organizeChronological(
    documents: Array<{
      id: string;
      title?: string;
      content?: string;
      createdAt?: number;
      subject?: string;
      labels?: string[];
      embedding?: number[];
    }>
  ): OrganizedDocument[] {
    const sorted = [...documents].sort((a, b) =>
      (a.createdAt || 0) - (b.createdAt || 0)
    );

    const groups: Map<string, OrganizedDocument[]> = new Map();

    for (const doc of sorted) {
      const date = doc.createdAt || Date.now();
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const groupKey = `Week of ${weekStart.toLocaleDateString()}`;

      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }

      groups.get(groupKey)!.push({
        id: doc.id,
        document: doc,
        group: groupKey,
        position: groups.get(groupKey)!.length,
        metadata: {
          sortKey: date.toString(),
        },
      });
    }

    return Array.from(groups.values()).flat();
  }

  private organizeConceptual(
    documents: Array<{
      id: string;
      title?: string;
      content?: string;
      createdAt?: number;
      subject?: string;
      labels?: string[];
      embedding?: number[];
    }>,
    _options: OrganizationOptions
  ): OrganizedDocument[] {
    const groups: Map<string, OrganizedDocument[]> = new Map();

    for (const doc of documents) {
      const subject = doc.subject || doc.labels?.[0] || 'Uncategorized';

      if (!groups.has(subject)) {
        groups.set(subject, []);
      }

      groups.get(subject)!.push({
        id: doc.id,
        document: doc,
        group: subject,
        position: groups.get(subject)!.length,
        metadata: {
          clusterId: subject,
        },
      });
    }

    return Array.from(groups.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .flatMap(([_, docs]) => docs);
  }

  private organizeHybrid(
    documents: Array<{
      id: string;
      title?: string;
      content?: string;
      createdAt?: number;
      subject?: string;
      labels?: string[];
      embedding?: number[];
    }>,
    _options: OrganizationOptions
  ): OrganizedDocument[] {
    const subjectGroups: Map<string, typeof documents> = new Map();

    for (const doc of documents) {
      const subject = doc.subject || doc.labels?.[0] || 'Uncategorized';

      if (!subjectGroups.has(subject)) {
        subjectGroups.set(subject, []);
      }

      subjectGroups.get(subject)!.push(doc);
    }

    const organized: OrganizedDocument[] = [];

    for (const [subject, docs] of subjectGroups) {
      const sorted = [...docs].sort((a, b) =>
        (a.createdAt || 0) - (b.createdAt || 0)
      );

      for (let i = 0; i < sorted.length; i++) {
        const doc = sorted[i];
        organized.push({
          id: doc.id,
          document: doc,
          group: subject,
          position: i,
          metadata: {
            clusterId: subject,
            sortKey: (doc.createdAt || 0).toString(),
          },
        });
      }
    }

    organized.sort((a, b) => {
      const aTime = a.document.createdAt || 0;
      const bTime = b.document.createdAt || 0;
      return bTime - aTime;
    });

    return organized;
  }
}
