/**
 * @fileoverview Source Helper Functions (Search & Stats)
 * @module lib/state/dexie-db-helpers/source-helpers-search
 * @governance ARC-1.1
 *
 * Helper functions for source search and statistics (Part 2 of 2).
 * Part of Story ARC-1.1: Split dexie-db.ts (1,267 lines)
 */

import type { SourceRecord } from '../dexie-db-types';
import { db } from '../dexie-db';
import { getSourcesForProject } from './source-helpers-basic';

/**
 * Search sources by content (full-text search)
 *
 * @param projectId - The project ID
 * @param query - Search query string
 * @returns Array of sources containing the query in title or content
 */
export async function searchSources(
    projectId: string,
    query: string
): Promise<SourceRecord[]> {
    const allSources = await getSourcesForProject(projectId);
    const lowerQuery = query.toLowerCase();

    return allSources.filter(source =>
        source.title.toLowerCase().includes(lowerQuery) ||
        source.content.toLowerCase().includes(lowerQuery)
    );
}

/**
 * Get source statistics for a project
 *
 * @param projectId - The project ID
 * @returns Object with counts by type and total
 */
export async function getSourceStats(
    projectId: string
): Promise<{
    total: number;
    pdf: number;
    url: number;
    text: number;
}> {
    const allSources = await getSourcesForProject(projectId);

    return {
        total: allSources.length,
        pdf: allSources.filter(s => s.type === 'pdf').length,
        url: allSources.filter(s => s.type === 'url').length,
        text: allSources.filter(s => s.type === 'text').length,
    };
}
