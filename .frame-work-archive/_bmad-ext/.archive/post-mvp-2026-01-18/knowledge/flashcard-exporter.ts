/**
 * @fileoverview Flashcard export utilities
 * @module lib/knowledge/flashcard-exporter
 */

import type { Flashcard, Deck } from './flashcard-types';

/**
 * Export format types
 */
export type ExportFormat = 'csv' | 'json' | 'anki' | 'quizlet';

/**
 * Export options
 */
export interface ExportOptions {
  format: ExportFormat;
  includeMetadata?: boolean;
  deckName?: string;
}

/**
 * Export flashcard deck to specified format
 */
export function exportDeck(deck: Deck, options: ExportOptions): string {
  switch (options.format) {
    case 'csv':
      return exportToCSV(deck);
    case 'json':
      return exportToJSON(deck, options.includeMetadata);
    case 'anki':
      return exportToAnki(deck);
    case 'quizlet':
      return exportToQuizlet(deck);
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}

/**
 * Export to CSV format
 */
function exportToCSV(deck: Deck): string {
  const headers = ['Front', 'Back', 'Tags', 'Notes'];
  const rows = deck.cards.map((card) => [
    `"${card.front.replace(/"/g, '""')}"`,
    `"${card.back.replace(/"/g, '""')}"`,
    `"${(card.tags || []).join(', ')}"`,
    `"${(card.notes || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Export to JSON format
 */
function exportToJSON(deck: Deck, includeMetadata = true): string {
  const data = includeMetadata
    ? {
        name: deck.name,
        description: deck.description,
        createdAt: deck.createdAt,
        updatedAt: deck.updatedAt,
        cards: deck.cards,
      }
    : deck.cards;

  return JSON.stringify(data, null, 2);
}

/**
 * Export to Anki format (CSV with specific columns)
 */
function exportToAnki(deck: Deck): string {
  const rows = deck.cards.map((card) => {
    const tags = (card.tags || []).join(' ');
    const ankiTags = tags ? `<div class="tags">${tags}</div>` : '';
    return `${card.front}${ankiTags}\t${card.back}`;
  });

  return rows.join('\n');
}

/**
 * Export to Quizlet format (TSV)
 */
function exportToQuizlet(deck: Deck): string {
  const headers = ['Term', 'Definition', 'Tag'];
  const rows = deck.cards.map((card) => [
    `"${card.front.replace(/"/g, '""')}"`,
    `"${card.back.replace(/"/g, '""')}"`,
    `"${(card.tags || []).join(', ')}"`,
  ]);

  return [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
}

/**
 * Import flashcards from CSV
 */
export function importFromCSV(content: string, deckName = 'Imported Deck'): Deck {
  const lines = content.trim().split('\n');
  const cards: Deck['cards'] = [];

  // Skip header if present
  const startIndex = lines[0].toLowerCase().includes('front') ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle CSV parsing with quoted values
    const values = parseCSVLine(line);

    if (values.length >= 2) {
      cards.push({
        id: crypto.randomUUID(),
        front: values[0],
        back: values[1],
        tags: values[2] ? values[2].split(',').map((t) => t.trim()) : [],
        notes: values[3] || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  return {
    id: crypto.randomUUID(),
    name: deckName,
    description: `Imported from CSV on ${new Date().toLocaleDateString()}`,
    cards,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Import flashcards from JSON
 */
export function importFromJSON(
  content: string,
  _options?: { deckName?: string }
): Deck {
  const data = JSON.parse(content);

  // Handle both array and object formats
  const cards: Deck['cards'] = Array.isArray(data)
    ? data
    : data.cards || [];

  // Ensure cards have required fields
  const normalizedCards = cards.map((card) => ({
    ...card,
    id: card.id || crypto.randomUUID(),
    createdAt: card.createdAt ? new Date(card.createdAt) : new Date(),
    updatedAt: card.updatedAt ? new Date(card.updatedAt) : new Date(),
  }));

  return {
    id: crypto.randomUUID(),
    name: data.name || 'Imported Deck',
    description: data.description || `Imported from JSON on ${new Date().toLocaleDateString()}`,
    cards: normalizedCards,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Parse CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

/**
 * Generate download blob for export
 */
export function createExportBlob(deck: Deck, options: ExportOptions): Blob {
  const content = exportDeck(deck, options);
  return new Blob([content], { type: 'text/plain;charset=utf-8' });
}

/**
 * Trigger download of exported deck
 */
export function downloadExport(
  deck: Deck,
  options: ExportOptions,
  filename?: string
): void {
  const blob = createExportBlob(deck, options);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `${deck.name.replace(/[^a-z0-9]/gi, '_')}.${options.format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
