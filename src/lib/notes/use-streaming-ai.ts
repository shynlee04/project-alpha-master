/**
 * @fileoverview React hook for streaming AI content generation
 * @module lib/notes/use-streaming-ai
 * @story EPIC-42-10 - Streaming output to blocks
 * @story UX-15 - Streaming Animations (enhanced with tokens and typing indicator)
 * @created 2026-01-13
 *
 * Provides a hook for streaming AI content generation with progressive
 * block updates in the editor.
 */

import { useState, useCallback, useRef } from 'react';
import type { BlockNoteEditor, Block } from '@blocknote/core';
import { generateNoteContentStream, type NoteAIOptions } from './note-ai-service';
import { useAILoadingStore } from './ai-loading-store';

/**
 * State for streaming AI generation
 */
export interface StreamingState {
    /** Whether streaming is in progress */
    isStreaming: boolean;
    /** Current accumulated content */
    content: string;
    /** Error message if any */
    error: string | null;
    /** Progress message */
    message: string;
    /** Abort controller for cancellation */
    abortController: AbortController | null;
}

/**
 * Options for streaming generation
 */
export interface StreamingOptions extends NoteAIOptions {
    /** Block ID where to insert content */
    targetBlockId?: string;
    /** How to handle insertion: after, replace, before */
    insertionMode?: 'after' | 'replace' | 'before';
    /** Whether to parse markdown to blocks during streaming */
    parseMarkdown?: boolean;
    /** Callback for each chunk */
    onChunk?: (text: string, fullContent: string) => void;
    /** Callback on completion */
    onComplete?: (fullContent: string) => void;
    /** Callback on error */
    onError?: (error: string) => void;
}

/**
 * Hook for streaming AI content generation
 * 
 * @story EPIC-42-10 - Streaming output to blocks
 * 
 * @example
 * ```tsx
 * const { streamContent, isStreaming, content, cancel } = useStreamingAI(editor);
 * 
 * // Start streaming
 * await streamContent('Write a poem about coding', {
 *   insertionMode: 'after',
 *   parseMarkdown: true,
 * });
 * ```
 */
export function useStreamingAI(editor: BlockNoteEditor | null) {
    const [state, setState] = useState<StreamingState>({
        isStreaming: false,
        content: '',
        error: null,
        message: '',
        abortController: null,
    });

    // Ref to track the streaming placeholder block ID
    const placeholderBlockRef = useRef<string | null>(null);

    // Get loading store actions (UX-15: includes new streaming methods)
    const {
        startBlockLoading,
        stopBlockLoading,
        updateLoadingMessage,
        updateTypingState,
        updateCharCount,
        // updateTokenCount - TODO: Add when ProviderService exposes token usage
    } = useAILoadingStore.getState();

    /**
     * Cancel ongoing streaming
     */
    const cancel = useCallback(() => {
        if (state.abortController) {
            state.abortController.abort();
            setState(prev => ({
                ...prev,
                isStreaming: false,
                message: 'Cancelled',
                abortController: null,
            }));

            // Clean up loading state
            if (placeholderBlockRef.current) {
                stopBlockLoading(placeholderBlockRef.current);
                updateTypingState(placeholderBlockRef.current, false); // UX-15: Clear typing state
            }
        }
    }, [state.abortController, stopBlockLoading, updateTypingState]);

    /**
     * Stream content from AI and insert into editor
     */
    const streamContent = useCallback(async (
        prompt: string,
        options: StreamingOptions = {}
    ): Promise<string> => {
        if (!editor) {
            const error = 'Editor not available';
            setState(prev => ({ ...prev, error }));
            options.onError?.(error);
            return '';
        }

        // Create abort controller
        const abortController = new AbortController();
        
        // Reset state
        setState({
            isStreaming: true,
            content: '',
            error: null,
            message: 'Starting...',
            abortController,
        });

        let fullContent = '';
        let placeholderBlockId: string | null = null;

        try {
            // Get cursor position for insertion
            const cursorPosition = editor.getTextCursorPosition();
            const targetBlockId = options.targetBlockId || cursorPosition?.block?.id;

            if (!targetBlockId) {
                throw new Error('No target block for insertion');
            }

            // Create a placeholder block for streaming content
            if (options.insertionMode !== 'replace') {
                const placeholderBlock: Partial<Block> = {
                    type: 'paragraph',
                    content: [{ type: 'text', text: '▋', styles: {} }],
                };
                
                const position = options.insertionMode === 'before' ? 'before' : 'after';
                editor.insertBlocks([placeholderBlock as Block], targetBlockId, position);
                
                // Get the inserted block's ID
                const document = editor.document;
                const targetIndex = document.findIndex(b => b.id === targetBlockId);
                if (targetIndex !== -1) {
                    const newBlockIndex = position === 'after' ? targetIndex + 1 : targetIndex;
                    if (newBlockIndex < document.length) {
                        placeholderBlockId = document[newBlockIndex].id;
                        placeholderBlockRef.current = placeholderBlockId;
                    }
                }
            }

            // Start loading indicator
            if (placeholderBlockId) {
                startBlockLoading(placeholderBlockId, 'AI Generation', 'Generating...');
                updateTypingState(placeholderBlockId, true); // UX-15: Show typing indicator
            }

            // Stream content
            let lastUpdateTime = Date.now();
            const UPDATE_INTERVAL = 100; // Update UI every 100ms to avoid flickering

            for await (const chunk of generateNoteContentStream(prompt, options)) {
                // Check for abort
                if (abortController.signal.aborted) {
                    break;
                }

                // Handle error
                if (chunk.error) {
                    throw new Error(chunk.error);
                }

                // Accumulate content
                if (chunk.text) {
                    fullContent += chunk.text;

                    // Update state
                    setState(prev => ({
                        ...prev,
                        content: fullContent,
                        message: `Generating... ${fullContent.length} chars`,
                    }));

                    // Call chunk callback
                    options.onChunk?.(chunk.text, fullContent);

                    // Update the placeholder block with streaming content (throttled)
                    const now = Date.now();
                    if (placeholderBlockId && (now - lastUpdateTime > UPDATE_INTERVAL || chunk.done)) {
                        lastUpdateTime = now;
                        try {
                            // For simplicity, update the block's text content directly
                            editor.updateBlock(placeholderBlockId, {
                                content: [{ type: 'text', text: fullContent + (chunk.done ? '' : '▋'), styles: {} }],
                            });

                            // UX-15: Update character count in loading store
                            updateCharCount(placeholderBlockId, fullContent.length);

                            // Update loading message
                            updateLoadingMessage(placeholderBlockId, `${fullContent.length} chars...`);
                        } catch (e) {
                            console.debug('Block update skipped:', e);
                        }
                    }

                    // Note: Token count tracking would be added here when ProviderService
                    // exposes token usage information in the chunk (UX-15 future enhancement)
                }

                // Handle completion
                if (chunk.done) {
                    break;
                }
            }

            // Final update: parse markdown and replace placeholder
            if (placeholderBlockId && fullContent) {
                try {
                    if (options.parseMarkdown !== false) {
                        // Parse markdown to blocks
                        const blocks = await editor.tryParseMarkdownToBlocks(fullContent);
                        
                        // Replace the placeholder with parsed blocks
                        if (blocks.length > 0) {
                            editor.replaceBlocks([placeholderBlockId], blocks);
                            
                            // Move cursor to end of last block
                            const lastBlock = blocks[blocks.length - 1];
                            if (lastBlock?.id) {
                                editor.setTextCursorPosition(lastBlock.id, 'end');
                            }
                        }
                    } else {
                        // Just update with final text (no markdown parsing)
                        editor.updateBlock(placeholderBlockId, {
                            content: [{ type: 'text', text: fullContent, styles: {} }],
                        });
                    }
                } catch (e) {
                    console.error('Failed to update block with streamed content:', e);
                }
            }

            // Stop loading indicator
            if (placeholderBlockId) {
                updateTypingState(placeholderBlockId, false); // UX-15: Clear typing indicator
                stopBlockLoading(placeholderBlockId);
            }

            // Update final state
            setState(prev => ({
                ...prev,
                isStreaming: false,
                content: fullContent,
                message: 'Complete',
                abortController: null,
            }));

            // Call completion callback
            options.onComplete?.(fullContent);

            return fullContent;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            
            setState(prev => ({
                ...prev,
                isStreaming: false,
                error: errorMessage,
                message: 'Error',
                abortController: null,
            }));

            // Clean up loading state
            if (placeholderBlockId) {
                updateTypingState(placeholderBlockId, false); // UX-15: Clear typing indicator
                stopBlockLoading(placeholderBlockId);
            }

            // Call error callback
            options.onError?.(errorMessage);

            return fullContent;
        }
    }, [editor, startBlockLoading, stopBlockLoading, updateLoadingMessage, updateTypingState, updateCharCount]);

    /**
     * Reset state
     */
    const reset = useCallback(() => {
        cancel();
        setState({
            isStreaming: false,
            content: '',
            error: null,
            message: '',
            abortController: null,
        });
    }, [cancel]);

    return {
        // State
        isStreaming: state.isStreaming,
        content: state.content,
        error: state.error,
        message: state.message,
        
        // Actions
        streamContent,
        cancel,
        reset,
    };
}

export default useStreamingAI;
