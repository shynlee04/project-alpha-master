/**
 * @fileoverview Export Utilities
 * @module utils/export-utils
 * @governance EPIC-6-3
 *
 * Utility functions for exporting knowledge sources as downloadable files.
 */

import type { SourceRecord } from '@/infrastructure/persistence/dexie-db';

const MAX_FILENAME_LENGTH = 100;

/**
 * Invalid characters for filenames
 */
const INVALID_CHARS = /[<>:"/\\|?*\x00-\x1F]/g;

/**
 * Sanitize a filename by removing/replacing invalid characters
 *
 * @param filename - The filename to sanitize
 * @returns Sanitized filename safe for file systems
 *
 * Removes special characters, replaces spaces with underscores,
 * and limits length to MAX_FILENAME_LENGTH.
 */
export function sanitizeFilename(filename: string): string {
    if (!filename) {
        return '';
    }

    // Remove invalid characters
    let sanitized = filename.replace(INVALID_CHARS, '');

    // Replace spaces and multiple underscores with single underscore
    sanitized = sanitized.replace(/[ _]+/g, '_');

    // Remove leading/trailing underscores
    sanitized = sanitized.trim().replace(/^_+|_+$/g, '');

    // Limit length
    if (sanitized.length > MAX_FILENAME_LENGTH) {
        sanitized = sanitized.substring(0, MAX_FILENAME_LENGTH);
    }

    return sanitized;
}

/**
 * Export source content as a text file
 *
 * @param source - The source to export
 *
 * Creates a downloadable .txt file with the source content.
 * Filename is derived from source title (sanitized).
 * Triggers browser download via anchor tag.
 *
 * Supports all source types (text, url, pdf) by exporting
 * their text content.
 */
export function exportText(source: SourceRecord): void {
    // Create blob from content
    const blob = new Blob([source.content || ''], { type: 'text/plain;charset=utf-8' });

    // Create object URL
    const url = URL.createObjectURL(blob);

    // Create anchor element
    const anchor = document.createElement('a');
    anchor.href = url;

    // Generate filename from title
    const baseName = sanitizeFilename(source.title || 'source');
    anchor.download = `${baseName}.txt`;

    // Trigger download
    anchor.click();

    // Clean up
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 100);
}

/**
 * Export PDF source as original file
 *
 * @param source - The PDF source to export
 *
 * Note: This is a placeholder for future implementation.
 * Currently PDF export requires the original file blob from IndexedDB,
 * which needs to be stored during import.
 *
 * For now, we export the text content instead.
 */
export function exportPDF(source: SourceRecord): void {
    // TODO: Implement PDF export when we store original file blobs
    // For now, export as text
    exportText(source);
}
