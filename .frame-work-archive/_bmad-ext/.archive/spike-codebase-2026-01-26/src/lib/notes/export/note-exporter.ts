/**
 * @fileoverview Note Exporter
 * @module lib/notes/export/note-exporter
 * @governance CC-DF-01 - Note File Format Migration
 *
 * Exports Dexie notes to FSA markdown file format.
 * Handles batch export with progress tracking.
 */

import type { NoteRecord } from '@/lib/notes/types';
import { formatNoteForStorage, getNoteFilename } from '@/lib/notes/format/note-formatter';

// ============================================================================
// Types
// ============================================================================

/**
 * Progress callback for export operations
 */
export type ExportProgressCallback = (progress: {
    current: number;
    total: number;
    percent: number;
    note?: NoteRecord;
}) => void;

/**
 * Export result with statistics
 */
export interface ExportResult {
    /** Number of notes successfully exported */
    exported: number;

    /** Number of notes that failed to export */
    failed: number;

    /** List of exported file entries */
    files: FileEntry[];

    /** Any errors encountered */
    errors: string[];

    /** Total duration in milliseconds */
    duration: number;
}

/**
 * Export options
 */
export interface ExportOptions {
    /** Filter by workspace ID */
    workspaceId?: string;

    /** Filter by project ID */
    projectId?: string;

    /** Include favorite status in frontmatter */
    includeFavorite?: boolean;

    /** Include indexing status in frontmatter */
    includeIndexed?: boolean;

    /** Custom tags to add to all notes */
    tags?: string[];

    /** Progress callback for tracking */
    onProgress?: ExportProgressCallback;
}

/**
 * File entry for FSA write operation
 */
export interface FileEntry {
    /** Filename (e.g., "note-123.md") */
    name: string;

    /** Full markdown content */
    content: string;
}

// ============================================================================
// Main Export Function
// ============================================================================

/**
 * Export notes from Dexie format to FSA markdown format
 *
 * Converts Dexie NoteRecord array to FSA-compatible markdown files
 * with proper YAML frontmatter and ISO 8601 timestamps.
 *
 * @param notes - Array of NoteRecord from Dexie
 * @param options - Export options for filtering/formatting
 * @returns Export result with statistics
 *
 * @example
 * ```typescript
 * const result = await exportNotesToFSA(noteRecords, {
 *   workspaceId: 'ide',
 *   onProgress: (p) => console.log(`${p.percent}%`)
 * });
 * // Returns: { exported: 10, failed: 0, files: [...], errors: [], duration: 1234 }
 * ```
 */
export async function exportNotesToFSA(
    notes: NoteRecord[],
    options: ExportOptions = {},
): Promise<ExportResult> {
    const startTime = Date.now();
    const result: ExportResult = {
        exported: 0,
        failed: 0,
        files: [],
        errors: [],
        duration: 0,
    };

    // Filter notes based on options
    const filteredNotes = filterNotes(notes, options);

    // Track progress
    const total = filteredNotes.length;
    let current = 0;

    // Process each note
    for (const note of filteredNotes) {
        try {
            // Apply export options to note
            const modifiedNote = applyExportOptions(note, options);

            // Format as markdown
            const markdown = formatNoteForStorage(modifiedNote);

            // Generate filename
            const filename = getNoteFilename(modifiedNote.id);

            // Store for FSA write
            result.files.push({
                name: filename,
                content: markdown,
            });

            result.exported++;
            current++;

            // Report progress
            if (options.onProgress) {
                const percent = Math.round((current / total) * 100);
                options.onProgress({
                    current,
                    total,
                    percent,
                    note: modifiedNote,
                });
            }
        } catch (error) {
            result.failed++;
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Unknown error';
            result.errors.push(
                `Failed to export note ${note.id}: ${errorMessage}`,
            );
        }
    }

    result.duration = Date.now() - startTime;

    return result;
}

/**
 * Export a single note to markdown format
 *
 * @param note - Single note to export
 * @param options - Export options
 * @returns File entry ready for FSA write
 */
export function exportSingleNote(
    note: NoteRecord,
    options: ExportOptions = {},
): FileEntry {
    // Apply export options
    const modifiedNote = applyExportOptions(note, options);

    // Format as markdown
    const markdown = formatNoteForStorage(modifiedNote);

    // Generate filename
    const filename = getNoteFilename(modifiedNote.id);

    return {
        name: filename,
        content: markdown,
    };
}

/**
 * Get export statistics from notes
 *
 * Useful for pre-export validation and UI display.
 *
 * @param notes - Array of notes
 * @param options - Export options
 * @returns Statistics before export
 */
export function getExportStats(
    notes: NoteRecord[],
    options: ExportOptions = {},
): {
    total: number;
    filtered: number;
    byWorkspace: Record<string, number>;
    byProject: Record<string, number>;
    favorites: number;
    indexed: number;
} {
    const filteredNotes = filterNotes(notes, options);

    const stats = {
        total: notes.length,
        filtered: filteredNotes.length,
        byWorkspace: {} as Record<string, number>,
        byProject: {} as Record<string, number>,
        favorites: 0,
        indexed: 0,
    };

    // Count by workspace
    for (const note of filteredNotes) {
        // Count by workspace
        stats.byWorkspace[note.workspaceId] =
            (stats.byWorkspace[note.workspaceId] || 0) + 1;

        // Count by project
        if (note.projectId) {
            stats.byProject[note.projectId] =
                (stats.byProject[note.projectId] || 0) + 1;
        }

        // Count favorites
        if (note.isFavorite) {
            stats.favorites++;
        }

        // Count indexed
        if (note.isIndexed) {
            stats.indexed++;
        }
    }

    return stats;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Filter notes based on export options
 *
 * @param notes - All notes
 * @param options - Export options
 * @returns Filtered notes
 */
function filterNotes(
    notes: NoteRecord[],
    options: ExportOptions,
): NoteRecord[] {
    return notes.filter((note) => {
        // Filter by workspace
        if (
            options.workspaceId &&
            note.workspaceId !== options.workspaceId
        ) {
            return false;
        }

        // Filter by project
        if (options.projectId && note.projectId !== options.projectId) {
            return false;
        }

        return true;
    });
}

/**
 * Apply export options to a note
 *
 * Adds metadata from options to the note before formatting.
 *
 * @param note - Original note
 * @param options - Export options
 * @returns Modified note
 */
function applyExportOptions(
    note: NoteRecord,
    options: ExportOptions,
): NoteRecord {
    const modified = { ...note };

    // Add custom tags
    if (options.tags && options.tags.length > 0) {
        // Note: Tags are added via frontmatter in formatNoteForStorage
        // This is a placeholder for future tag merging logic
    }

    // Apply favorite inclusion
    if (!options.includeFavorite) {
        modified.isFavorite = false;
    }

    // Apply indexing status inclusion
    if (!options.includeIndexed) {
        modified.isIndexed = false;
        modified.indexedAt = undefined;
    }

    return modified;
}

/**
 * Validate exported markdown format
 *
 * Checks for proper frontmatter and content structure.
 *
 * @param markdown - Markdown content to validate
 * @returns Validation result with success flag and errors
 */
export function validateExportFormat(
    markdown: string,
): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for frontmatter delimiter
    if (!markdown.startsWith('---\n')) {
        errors.push('Missing YAML frontmatter delimiter');
    }

    // Check for closing frontmatter delimiter
    const frontmatterEndMatch = markdown.match(/\n---\n/);
    if (!frontmatterEndMatch) {
        errors.push('Missing YAML frontmatter closing delimiter');
    }

    // Extract frontmatter
    const frontmatterMatch = markdown.match(
        /^---\n([\s\S]*?)\n---\n/,
    );
    if (frontmatterMatch) {
        const frontmatterText = frontmatterMatch[1];

        // Validate required fields
        if (!frontmatterText.includes('title:')) {
            errors.push('Missing required field: title');
        }

        if (!frontmatterText.includes('created:')) {
            errors.push('Missing required field: created');
        }

        if (!frontmatterText.includes('modified:')) {
            errors.push('Missing required field: modified');
        }

        // Validate ISO date format
        const dateMatches = frontmatterText.match(
            /\b(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\b/g,
        );
        if (
            !dateMatches ||
            (frontmatterText.match(/created:/) && dateMatches.length < 1) ||
            (frontmatterText.match(/modified:/) && dateMatches.length < 1)
        ) {
            errors.push(
                'Invalid or missing ISO 8601 date format (expected: YYYY-MM-DDTHH:mm:ss.sssZ)',
            );
        }
    }

    // Check for content after frontmatter
    const contentStart =
        frontmatterEndMatch?.index !== undefined
            ? frontmatterEndMatch.index + 4
            : 0;
    const content = markdown.slice(contentStart).trim();

    if (content.length === 0) {
        errors.push('Note has no content');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Generate export report in markdown format
 *
 * Useful for documenting export operations and debugging.
 *
 * @param result - Export result
 * @param notes - Original notes
 * @returns Markdown report string
 */
export function generateExportReport(result: ExportResult): string {
    const lines: string[] = [];

    lines.push('# Note Export Report');
    lines.push('');
    lines.push(`**Date:** ${new Date().toISOString()}`);
    lines.push('');
    lines.push('## Summary');
    lines.push('');
    lines.push(`- **Total Notes:** ${result.exported + result.failed}`);
    lines.push(`- **Exported:** ${result.exported}`);
    lines.push(`- **Failed:** ${result.failed}`);
    lines.push(`- **Duration:** ${result.duration}ms`);
    lines.push('');

    if (result.errors.length > 0) {
        lines.push('## Errors');
        lines.push('');
        for (const error of result.errors) {
            lines.push(`- ${error}`);
        }
        lines.push('');
    }

    lines.push('## Exported Files');
    lines.push('');
    for (const file of result.files) {
        lines.push(`- \`${file.name}\``);
    }
    lines.push('');

    return lines.join('\n');
}
