/**
 * @fileoverview Semantic Chunking Strategy
 * @module lib/rag/chunk-strategies/semantic-chunker
 * @governance EPIC-7-2
 *
 * Semantic chunking based on document structure.
 * Splits by headings, paragraphs, and other natural boundaries.
 */

import type { ChunkMetadata, ChunkingOptions } from '../types';
import { DEFAULT_CHUNKING_OPTIONS } from '../types';
import { countTokens } from '../token-counter';
import type { ChunkStrategy } from './chunk-strategy.interface';
import type { SourceRecord } from '@/infrastructure/persistence/dexie-db';

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
        const { maxChunkSize } = _options;

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
