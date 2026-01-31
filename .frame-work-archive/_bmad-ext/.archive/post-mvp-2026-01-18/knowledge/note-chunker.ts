/**
 * @fileoverview Note chunking for RAG
 * @module lib/knowledge/note-chunker
 *
 * **DEFERRED - Post-MVP Archive**
 */

export interface ChunkOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  separators?: string[];
  keepHeadings?: boolean;
}

export interface TextChunk {
  id: string;
  text: string;
  metadata: {
    startIndex: number;
    endIndex: number;
    chunkIndex: number;
    sourceTitle?: string;
    heading?: string;
  };
}

/**
 * Split text into overlapping chunks
 */
export function chunkText(
  text: string,
  options: ChunkOptions = {}
): TextChunk[] {
  const {
    chunkSize = 1000,
    chunkOverlap = 100,
    separators = ['\n\n', '\n', '. ', ' '],
    keepHeadings = true,
  } = options;

  if (!text.trim()) {
    return [];
  }

  const chunks: TextChunk[] = [];
  let chunkIndex = 0;
  let position = 0;

  while (position < text.length) {
    const endPosition = Math.min(position + chunkSize, text.length);
    let chunkEnd = endPosition;

    // Try to split at natural boundaries
    for (const separator of separators) {
      const lastSeparatorIndex = text.lastIndexOf(
        separator,
        endPosition - 1
      );
      if (lastSeparatorIndex > position) {
        chunkEnd = lastSeparatorIndex + separator.length;
        break;
      }
    }

    const chunkText = text.slice(position, chunkEnd).trim();

    if (chunkText) {
      // Extract heading if present
      let heading: string | undefined;
      if (keepHeadings) {
        const headingMatch = chunkText.match(/^(#{1,6})\s+(.+)$/m);
        heading = headingMatch ? headingMatch[2] : undefined;
      }

      chunks.push({
        id: `chunk-${chunkIndex}`,
        text: chunkText,
        metadata: {
          startIndex: position,
          endIndex: chunkEnd,
          chunkIndex,
          heading,
        },
      });
    }

    // Move position forward, accounting for overlap
    position = chunkEnd - chunkOverlap;

    // Ensure we make progress
    if (position >= chunkEnd) {
      position = chunkEnd;
    }

    chunkIndex++;
  }

  return chunks;
}

/**
 * Chunk a document with hierarchical structure
 */
export function chunkDocument(
  content: string,
  options: ChunkOptions = {}
): TextChunk[] {
  const { chunkSize = 1000, chunkOverlap = 100 } = options;

  // Split by headings first
  const headingPattern = /^(#{1,6})\s+(.+)$/gm;
  const sections: { heading: string; level: number; content: string }[] = [];

  let lastMatchEnd = 0;
  let match;

  while ((match = headingPattern.exec(content)) !== null) {
    // Add content before this heading
    if (match.index > lastMatchEnd) {
      const textBefore = content.slice(lastMatchEnd, match.index).trim();
      if (textBefore) {
        sections.push({
          heading: '',
          level: 0,
          content: textBefore,
        });
      }
    }

    // Add heading section
    sections.push({
      heading: match[2],
      level: match[1].length,
      content: '',
    });

    lastMatchEnd = headingPattern.lastIndex;
  }

  // Add remaining content
  if (lastMatchEnd < content.length) {
    sections.push({
      heading: '',
      level: 0,
      content: content.slice(lastMatchEnd),
    });
  }

  // Chunk each section
  const allChunks: TextChunk[] = [];
  let globalIndex = 0;

  for (const section of sections) {
    if (section.content.trim()) {
      const sectionChunks = chunkText(section.content, {
        chunkSize,
        chunkOverlap,
        keepHeadings: false,
      });

      for (const chunk of sectionChunks) {
        chunk.metadata.sourceTitle = section.heading;
        chunk.metadata.chunkIndex = globalIndex;
        allChunks.push(chunk);
        globalIndex++;
      }
    }
  }

  return allChunks;
}
