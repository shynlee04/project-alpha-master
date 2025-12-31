/**
 * @fileoverview Document Chunking Strategies
 * @module lib/rag/chunk-strategies
 * @governance EPIC-7-2
 *
 * Pluggable chunking algorithms for RAG document processing.
 * Implements fixed-size, semantic, and recursive chunking strategies.
 */

import type { ChunkMetadata, ChunkingOptions } from './types';
import { DEFAULT_CHUNKING_OPTIONS } from './types';
import { countTokens, findChunkBoundary, calculateOverlap } from './token-counter';
import type { SourceRecord } from '@/lib/state/dexie-db';

// ============================================================================
// Base Chunker Interface
// ============================================================================

/**
 * Base interface for chunking strategies
 */
export interface ChunkStrategy {
    /**
     * Chunk content into pieces
     *
     * @param source - Source record to chunk
     * @param options - Chunking options
     * @param onProgress - Optional progress callback
     * @returns Array of chunk metadata
     */
    chunk(
        source: Pick<SourceRecord, 'id' | 'content'>,
        options: ChunkingOptions,
        onProgress?: (progress: { current: number; total: number }) => void
    ): ChunkMetadata[];
}

// ============================================================================
// Fixed-Size Chunker
// ============================================================================

/**
 * Fixed-size token chunking with overlap
 * Splits text into chunks of specified token size with configurable overlap
 */
export class FixedSizeChunker implements ChunkStrategy {
    chunk(
        source: Pick<SourceRecord, 'id' | 'content'>,
        options: ChunkingOptions = DEFAULT_CHUNKING_OPTIONS,
        onProgress?: (progress: { current: number; total: number }) => void
    ): ChunkMetadata[] {
        const { id: sourceId, content } = source;
        const { minChunkSize, maxChunkSize, overlap, preserveFormatting } = options;

        if (!content || content.length === 0) {
            return [];
        }

        const chunks: ChunkMetadata[] = [];
        let currentPosition = 0;
        let chunkIndex = 0;

        // Preserve code blocks and tables if requested
        if (preserveFormatting) {
            return this.chunkWithPreservation(source, options, onProgress);
        }

        // Calculate total chunks (rough estimate)
        const totalTokens = countTokens(content);
        const avgChunkSize = (minChunkSize + maxChunkSize) / 2;
        const estimatedTotalChunks = Math.max(1, Math.ceil(totalTokens / (avgChunkSize - overlap)));

        while (currentPosition < content.length) {
            // Calculate target chunk size (in characters)
            // const targetSize = (avgChunkSize * 4); // Convert tokens to chars
            // const maxPos = Math.min(currentPosition + targetSize, content.length);

            // Find best boundary
            const endPosition = findChunkBoundary(
                content,
                currentPosition + (maxChunkSize * 4),
                minChunkSize * 4,
                maxChunkSize * 4
            );

            // Extract chunk content
            const chunkContent = content.substring(currentPosition, endPosition);

            // Skip empty chunks
            if (chunkContent.trim().length === 0) {
                currentPosition = endPosition;
                continue;
            }

            // Calculate overlap for next chunk
            const overlapChars = calculateOverlap(countTokens(chunkContent), overlap);
            const startPosition = Math.max(0, currentPosition - overlapChars);

            // Create chunk metadata
            const chunk: ChunkMetadata = {
                chunkId: `${sourceId}-${chunkIndex}`,
                sourceId,
                chunkIndex,
                totalChunks: estimatedTotalChunks, // Will be updated at end
                startPosition,
                endPosition,
                content: chunkContent,
                tokenCount: countTokens(chunkContent),
                metadata: {
                    type: 'text',
                },
            };

            chunks.push(chunk);

            // Report progress
            onProgress?.({ current: chunkIndex + 1, total: estimatedTotalChunks });

            // Move to next position
            currentPosition = endPosition;
            chunkIndex++;
        }

        // Update total chunks count
        chunks.forEach((chunk) => {
            chunk.totalChunks = chunks.length;
        });

        return chunks;
    }

    /**
     * Chunk content while preserving code blocks and tables
     */
    private chunkWithPreservation(
        source: Pick<SourceRecord, 'id' | 'content'>,
        options: ChunkingOptions,
        onProgress?: (progress: { current: number; total: number }) => void
    ): ChunkMetadata[] {
        const { id: sourceId, content } = source;
        const { minChunkSize, maxChunkSize, overlap } = options;

        const chunks: ChunkMetadata[] = [];
        let chunkIndex = 0;

        // Detect and preserve code blocks (```code```)
        const codeBlockRegex = /```[\s\S]*?```/g;
        const codeBlocks: Array<{ start: number; end: number; content: string }> = [];
        let match: RegExpExecArray | null;

        // Find all code blocks
        while ((match = codeBlockRegex.exec(content)) !== null) {
            codeBlocks.push({
                start: match.index,
                end: match.index + match[0].length,
                content: match[0],
            });
        }

        // Split content by code blocks
        let currentPosition = 0;
        const allSegments: Array<{ type: 'code' | 'text'; start: number; end: number }> = [];

        for (const block of codeBlocks) {
            // Add text before code block
            if (block.start > currentPosition) {
                allSegments.push({
                    type: 'text',
                    start: currentPosition,
                    end: block.start,
                });
            }
            // Add code block
            allSegments.push({
                type: 'code',
                start: block.start,
                end: block.end,
            });
            currentPosition = block.end;
        }

        // Add remaining text
        if (currentPosition < content.length) {
            allSegments.push({
                type: 'text',
                start: currentPosition,
                end: content.length,
            });
        }

        // Process segments
        for (const segment of allSegments) {
            const segmentContent = content.substring(segment.start, segment.end);

            if (segment.type === 'code') {
                // Code blocks become their own chunks
                const chunk: ChunkMetadata = {
                    chunkId: `${sourceId}-${chunkIndex}`,
                    sourceId,
                    chunkIndex,
                    totalChunks: 0, // Will be updated
                    startPosition: segment.start,
                    endPosition: segment.end,
                    content: segmentContent,
                    tokenCount: countTokens(segmentContent),
                    metadata: {
                        type: 'code',
                        language: this.detectLanguage(segmentContent),
                    },
                };
                chunks.push(chunk);
                chunkIndex++;
            } else {
                // Text content gets chunked normally
                const textChunks = this.chunkTextSegment(
                    sourceId,
                    segmentContent,
                    segment.start,
                    minChunkSize,
                    maxChunkSize,
                    overlap,
                    chunkIndex
                );
                chunks.push(...textChunks);
                chunkIndex += textChunks.length;
            }

            // Report progress
            onProgress?.({ current: chunkIndex, total: chunkIndex });
        }

        // Update total chunks count
        chunks.forEach((chunk) => {
            chunk.totalChunks = chunks.length;
        });

        return chunks;
    }

    /**
     * Chunk a text segment (not containing code blocks)
     */
    private chunkTextSegment(
        sourceId: string,
        content: string,
        offset: number,
        minChunkSize: number,
        maxChunkSize: number,
        // overlap: number,
        startChunkIndex: number
    ): ChunkMetadata[] {
        const chunks: ChunkMetadata[] = [];
        let currentPosition = 0;

        while (currentPosition < content.length) {
            // const targetSize = ((minChunkSize + maxChunkSize) / 2) * 4;
            // const maxPos = Math.min(currentPosition + targetSize, content.length);

            const endPosition = findChunkBoundary(
                content,
                currentPosition + (maxChunkSize * 4),
                minChunkSize * 4,
                maxChunkSize * 4
            );

            const chunkContent = content.substring(currentPosition, endPosition);

            if (chunkContent.trim().length === 0) {
                currentPosition = endPosition;
                continue;
            }

            const chunk: ChunkMetadata = {
                chunkId: `${sourceId}-${startChunkIndex + chunks.length}`,
                sourceId,
                chunkIndex: startChunkIndex + chunks.length,
                totalChunks: 0,
                startPosition: offset + currentPosition,
                endPosition: offset + endPosition,
                content: chunkContent,
                tokenCount: countTokens(chunkContent),
                metadata: { type: 'text' },
            };

            chunks.push(chunk);
            currentPosition = endPosition;
        }

        return chunks;
    }

    /**
     * Detect programming language from code block
     */
    private detectLanguage(codeBlock: string): string {
        // Check for language hint in ```language
        const langMatch = codeBlock.match(/^```(\w+)?/m);
        if (langMatch && langMatch[1]) {
            return langMatch[1];
        }

        // Simple detection based on patterns
        if (codeBlock.includes('function ') || codeBlock.includes('const ') || codeBlock.includes('=>')) {
            return 'javascript';
        }
        if (codeBlock.includes('def ') || codeBlock.includes('import ')) {
            return 'python';
        }
        if (codeBlock.includes('public class') || codeBlock.includes('interface ')) {
            return 'java';
        }

        return 'text';
    }
}

// ============================================================================
// Semantic Chunker
// ============================================================================

/**
 * Semantic chunking based on document structure
 * Splits by headings, paragraphs, and other natural boundaries
 */
export class SemanticChunker implements ChunkStrategy {
    chunk(
        source: Pick<SourceRecord, 'id' | 'content'>,
        _options: ChunkingOptions = DEFAULT_CHUNKING_OPTIONS,
        onProgress?: (progress: { current: number; total: number }) => void
    ): ChunkMetadata[] {
        const { id: sourceId, content } = source;
        // const { minChunkSize, maxChunkSize, preserveFormatting } = _options;

        const chunks: ChunkMetadata[] = [];

        // Split by headings (# ## ###)
        const headingRegex = /^#{1,6}\s+.+$/gm;
        const sections = content.split(headingRegex);

        let currentPosition = 0;
        let chunkIndex = 0;

        for (const section of sections) {
            if (section.trim().length === 0) continue;

            // Check if section is too large
            const sectionTokens = countTokens(section);

            if (sectionTokens <= maxChunkSize) {
                // Section fits in one chunk
                const startPos = content.indexOf(section, currentPosition);
                const endPos = startPos + section.length;

                chunks.push({
                    chunkId: `${sourceId}-${chunkIndex}`,
                    sourceId,
                    chunkIndex,
                    totalChunks: 0,
                    startPosition: startPos,
                    endPosition: endPos,
                    content: section.trim(),
                    tokenCount: countTokens(section.trim()),
                    metadata: { type: 'text' },
                });

                chunkIndex++;
                currentPosition = endPos;
            } else {
                // Section too large, split by paragraphs
                const paragraphs = section.split(/\n\s*\n/);
                let currentChunk = '';

                for (const para of paragraphs) {
                    const testChunk = currentChunk + '\n\n' + para;
                    const testTokens = countTokens(testChunk);

                    if (testTokens <= maxChunkSize) {
                        currentChunk = testChunk;
                    } else {
                        // Save current chunk and start new one
                        if (currentChunk.trim().length > 0) {
                            const startPos = content.indexOf(currentChunk, currentPosition);
                            const endPos = startPos + currentChunk.length;

                            chunks.push({
                                chunkId: `${sourceId}-${chunkIndex}`,
                                sourceId,
                                chunkIndex,
                                totalChunks: 0,
                                startPosition: startPos,
                                endPosition: endPos,
                                content: currentChunk.trim(),
                                tokenCount: countTokens(currentChunk.trim()),
                                metadata: { type: 'text' },
                            });

                            chunkIndex++;
                        }

                        // Check if single paragraph is too large
                        if (countTokens(para) > maxChunkSize) {
                            // Split large paragraph by sentences
                            const sentences = para.split(/(?<=[.!?])\s+/);
                            currentChunk = '';

                            for (const sentence of sentences) {
                                const testSentence = currentChunk + ' ' + sentence;
                                if (countTokens(testSentence) <= maxChunkSize) {
                                    currentChunk = testSentence;
                                } else {
                                    if (currentChunk.trim().length > 0) {
                                        chunks.push(this.createChunk(sourceId, currentChunk, chunkIndex++));
                                    }
                                    currentChunk = sentence;
                                }
                            }
                        } else {
                            currentChunk = para;
                        }
                    }

                    onProgress?.({ current: chunks.length, total: chunks.length });
                }

                // Don't forget the last chunk
                if (currentChunk.trim().length > 0) {
                    chunks.push(this.createChunk(sourceId, currentChunk, chunkIndex++));
                }
            }
        }

        // Update total chunks
        chunks.forEach((chunk) => {
            chunk.totalChunks = chunks.length;
        });

        return chunks;
    }

    private createChunk(sourceId: string, content: string, index: number): ChunkMetadata {
        return {
            chunkId: `${sourceId}-${index}`,
            sourceId,
            chunkIndex: index,
            totalChunks: 0,
            startPosition: 0,
            endPosition: content.length,
            content: content.trim(),
            tokenCount: countTokens(content.trim()),
            metadata: { type: 'text' },
        };
    }
}

// ============================================================================
// Recursive Chunker
// ============================================================================

/**
 * Recursive chunking for long documents
 * First pass: Split by sections (headings)
 * Second pass: Split large sections by paragraphs
 * Third pass: Split long paragraphs by sentences
 */
export class RecursiveChunker implements ChunkStrategy {
    chunk(
        source: Pick<SourceRecord, 'id' | 'content'>,
        _options: ChunkingOptions = DEFAULT_CHUNKING_OPTIONS,
        onProgress?: (progress: { current: number; total: number }) => void
    ): ChunkMetadata[] {
        const { id: sourceId, content } = source;
        // const { minChunkSize, maxChunkSize } = _options;

        const chunks: ChunkMetadata[] = [];
        let chunkIndex = 0;
        let globalPosition = 0;

        // First pass: Split by headings
        const headingRegex = /^#{1,6}\s+.+$/gm;
        const sections = content.split(headingRegex);

        for (const section of sections) {
            if (section.trim().length === 0) continue;

            const sectionStart = globalPosition;
            const sectionTokens = countTokens(section);

            if (sectionTokens <= maxChunkSize) {
                // Section fits in one chunk
                chunks.push({
                    chunkId: `${sourceId}-${chunkIndex}`,
                    sourceId,
                    chunkIndex,
                    totalChunks: 0,
                    startPosition: sectionStart,
                    endPosition: sectionStart + section.length,
                    content: section.trim(),
                    tokenCount: sectionTokens,
                    metadata: { type: 'text' },
                });
                chunkIndex++;
                globalPosition = sectionStart + section.length;
            } else {
                // Section too large, split by paragraphs
                const paragraphs = section.split(/\n\s*\n/);
                let currentContent = '';
                let currentStart = sectionStart;

                for (const para of paragraphs) {
                    const testContent = currentContent + '\n\n' + para;
                    const testTokens = countTokens(testContent);

                    if (testTokens <= maxChunkSize) {
                        currentContent = testContent;
                    } else {
                        // Save current chunk
                        if (currentContent.trim().length > 0) {
                            chunks.push({
                                chunkId: `${sourceId}-${chunkIndex}`,
                                sourceId,
                                chunkIndex,
                                totalChunks: 0,
                                startPosition: currentStart,
                                endPosition: currentStart + currentContent.length,
                                content: currentContent.trim(),
                                tokenCount: countTokens(currentContent.trim()),
                                metadata: { type: 'text' },
                            });
                            chunkIndex++;
                            currentStart += currentContent.length;
                        }

                        // Check if paragraph is still too large
                        if (countTokens(para) > maxChunkSize) {
                            // Split by sentences
                            const sentences = para.split(/(?<=[.!?])\s+/);
                            let sentenceChunk = '';

                            for (const sentence of sentences) {
                                const testSentence = sentenceChunk + ' ' + sentence;
                                if (countTokens(testSentence) <= maxChunkSize) {
                                    sentenceChunk = testSentence;
                                } else {
                                    if (sentenceChunk.trim().length > 0) {
                                        chunks.push({
                                            chunkId: `${sourceId}-${chunkIndex}`,
                                            sourceId,
                                            chunkIndex,
                                            totalChunks: 0,
                                            startPosition: currentStart,
                                            endPosition: currentStart + sentenceChunk.length,
                                            content: sentenceChunk.trim(),
                                            tokenCount: countTokens(sentenceChunk.trim()),
                                            metadata: { type: 'text' },
                                        });
                                        chunkIndex++;
                                        currentStart += sentenceChunk.length;
                                    }
                                    sentenceChunk = sentence;
                                }
                            }

                            if (sentenceChunk.trim().length > 0) {
                                currentContent = sentenceChunk;
                            } else {
                                currentContent = para;
                            }
                        } else {
                            currentContent = para;
                        }
                    }

                    onProgress?.({ current: chunks.length, total: chunks.length });
                }

                // Don't forget last chunk
                if (currentContent.trim().length > 0) {
                    chunks.push({
                        chunkId: `${sourceId}-${chunkIndex}`,
                        sourceId,
                        chunkIndex,
                        totalChunks: 0,
                        startPosition: currentStart,
                        endPosition: currentStart + currentContent.length,
                        content: currentContent.trim(),
                        tokenCount: countTokens(currentContent.trim()),
                        metadata: { type: 'text' },
                    });
                    chunkIndex++;
                }

                globalPosition = sectionStart + section.length;
            }
        }

        // Update total chunks
        chunks.forEach((chunk) => {
            chunk.totalChunks = chunks.length;
        });

        return chunks;
    }
}

// ============================================================================
// Chunker Factory
// ============================================================================

/**
 * Create a chunker instance based on strategy
 *
 * @param strategy - Chunking strategy type
 * @returns Chunker instance
 */
export function createChunker(strategy: ChunkingStrategy): ChunkStrategy {
    switch (strategy) {
        case 'fixed-size':
            return new FixedSizeChunker();
        case 'semantic':
            return new SemanticChunker();
        case 'recursive':
            return new RecursiveChunker();
        default:
            return new FixedSizeChunker();
    }
}
