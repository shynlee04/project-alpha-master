/**
 * @fileoverview Fixed-Size Chunking Strategy
 * @module lib/rag/chunk-strategies/fixed-size-chunker
 * @governance EPIC-7-2
 *
 * Fixed-size token chunking with overlap.
 * Splits text into chunks of specified token size with configurable overlap.
 */

import type { ChunkMetadata, ChunkingOptions } from '../types';
import { DEFAULT_CHUNKING_OPTIONS } from '../types';
import { countTokens, findChunkBoundary, calculateOverlap } from '../token-counter';
import type { ChunkStrategy } from './chunk-strategy.interface';
import type { SourceRecord } from '@/lib/state/dexie-db';

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
        const { minChunkSize, maxChunkSize } = options;

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
        startChunkIndex: number
    ): ChunkMetadata[] {
        const chunks: ChunkMetadata[] = [];
        let currentPosition = 0;

        while (currentPosition < content.length) {
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
