/**
 * @fileoverview Note Retrieval Service
 * @module lib/notes/note-retriever
 * @governance EPIC-26-3
 *
 * Provides search functionality for notes using Orama index.
 * Filters results to ensure only notes (not files) are returned.
 */

import { searchIndex } from '@/lib/rag/orama-index';
import { useNoteStore } from './note-store';

export interface NoteSearchResult {
    id: string;
    title: string;
    content: string;
    score: number;
}

/**
 * Search notes in the current project
 * @param query Search query text
 * @param limit Max results to return
 */
export async function searchNotes(query: string, limit: number = 5): Promise<NoteSearchResult[]> {
    const projectId = useNoteStore.getState().currentProjectId;

    if (!projectId) {
        console.warn('[NoteRetriever] No active project selected for search');
        return [];
    }

    try {
        const results = await searchIndex(projectId, query, { limit });

        // Filter for notes: Exclude file sources (which typically contain slashes)
        // Note IDs are UUIDs and do not contain slashes
        const noteResults = results.filter(hit => {
            const sourceId = hit.source.id;
            return !sourceId.includes('/') && !sourceId.startsWith('.');
        });

        return noteResults.map(hit => ({
            id: hit.document.id,
            title: hit.document.title || 'Untitled Note',
            content: hit.document.content,
            score: hit.score
        }));
    } catch (error) {
        console.error('[NoteRetriever] Search failed:', error);
        return [];
    }
}
