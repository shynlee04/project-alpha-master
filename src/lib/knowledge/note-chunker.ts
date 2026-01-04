/**
 * Note Chunker - Notes → Knowledge RAG Integration (P2-8)
 *
 * Chunks notes for RAG indexing with heading-aware splitting
 */

import type { NoteRecord } from '@/infrastructure/persistence/dexie-db';

export interface NoteChunk {
  id: string;
  noteId: string;
  chunkIndex: number;
  content: string;
  metadata: {
    title: string;
    tags: string[];
    createdAt: string;
    chunkType: 'header' | 'paragraph' | 'list' | 'code';
  };
}

/**
 * Detect chunk type from content
 */
function detectChunkType(content: string): NoteChunk['metadata']['chunkType'] {
  const trimmed = content.trim();

  // Code blocks (triple backticks)
  if (trimmed.startsWith('```') || /^\s*```\s*\n/.test(trimmed)) {
    return 'code';
  }

  // Lists (bullet points or numbered)
  if (/^[\s\t]*[*-]\s/.test(trimmed) || /^[\s\t]*\d+\.\s/.test(trimmed)) {
    return 'list';
  }

  // Headers (markdown # syntax)
  if (/^#{1,3}\s/.test(trimmed)) {
    return 'header';
  }

  // Default to paragraph
  return 'paragraph';
}

/**
 * Chunk a note for RAG indexing
 *
 * Strategy:
 * 1. Split by headings first (preserves structure)
 * 2. Further split into paragraphs (keeps chunks small)
 * 3. Preserve metadata for citation linking
 *
 * @param note - Note to chunk
 * @returns Array of note chunks
 */
export function chunkNoteForRAG(note: NoteRecord): NoteChunk[] {
  const chunks: NoteChunk[] = [];

  // Convert note blocks to plain text
  const noteContent = note.blocks?.map((block: any) => {
    if (block.type === 'paragraph' && block.content) {
      return block.content.map((c: any) => c.text || '').join('');
    }
    return '';
  }).join('\n\n') || '';

  if (!noteContent.trim()) {
    return chunks;
  }

  // Split by markdown headings (h1, h2, h3)
  const sections = noteContent.split(/^#{1,3}\s+.+$/m);

  let chunkIndex = 0;

  sections.forEach((section) => {
    // Skip empty sections
    if (!section.trim()) {
      return;
    }

    // Further split into paragraphs (double newline)
    const paragraphs = section.split(/\n\n+/);

    paragraphs.forEach((para) => {
      const trimmed = para.trim();

      // Skip empty paragraphs
      if (trimmed.length === 0) {
        return;
      }

      // Create chunk
      chunks.push({
        id: `chunk-${note.id}-${chunkIndex}`,
        noteId: note.id,
        chunkIndex,
        content: trimmed,
        metadata: {
          title: note.title || 'Untitled Note',
          tags: [], // NoteRecord doesn't have tags property
          createdAt: new Date(note.createdAt || Date.now()).toISOString(),
          chunkType: detectChunkType(trimmed),
        },
      });

      chunkIndex++;
    });
  });

  return chunks;
}
