/**
 * @fileoverview Recursive Chunking Strategy
 * @module lib/rag/chunk-strategies/recursive-chunker
 * @governance EPIC-7-2
 *
 * Recursive chunking for long documents.
 * First pass: Split by sections (headings)
 * Second pass: Split large sections by paragraphs
 * Third pass: Split long paragraphs by sentences
 */

import type { ChunkMetadata, ChunkingOptions } from '../types';
import { DEFAULT_CHUNKING_OPTIONS } from '../types';
import { countTokens } from '../token-counter';
import type { ChunkStrategy } from './chunk-strategy.interface';
import type { SourceRecord } from '@/infrastructure/persistence/dexie-db';

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
        const { maxChunkSize } = _options;

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
