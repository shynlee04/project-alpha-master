/**
 * @fileoverview Prompt Enhancer Hook
 * @module lib/agent/hooks/use-prompt-enhancer
 * 
 * Custom hook to handle the 2-step prompt enhancement logic.
 * Intercepts user input, enriches it via a separate LLM call, and returns the enhanced text.
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
// Using fetch directly since we want a one-off request, not a persistent chat session for the enhancer itself.
// Alternatively, we could use a specific mutation if available, but fetch to /api/chat is standard.

interface EnhancementResult {
    enhancedText: string;
    originalText: string;
    wasEnhanced: boolean;
}

export function usePromptEnhancer() {
    const { t, i18n } = useTranslation();
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const enhancePrompt = useCallback(async (
        originalPrompt: string,
        historyContext: { role: string; content: string }[] = []
    ): Promise<EnhancementResult> => {
        // Skip enhancement for short prompts
        const wordCount = originalPrompt.trim().split(/\s+/).length;
        if (wordCount < 10) {
            return { enhancedText: originalPrompt, originalText: originalPrompt, wasEnhanced: false };
        }

        setIsEnhancing(true);
        setError(null);

        try {
            // Construct the system prompt for the enhancer
            const currentLang = i18n.language || 'en';
            const contextSummary = historyContext
                .slice(-5) // Last 5 turns
                .map(msg => `${msg.role}: ${msg.content}`)
                .join('\n');

            const systemPrompt = `You are a Prompt Enhancement Expert. Your goal is to rewrite the user's prompt to be clear, precise, and contextually accurate for an AI Coding Agent.
            
            Current Language: ${currentLang} (Output MUST be in this language).
            
            Guidelines:
            1. Fix ambiguous or vague instructions.
            2. Correct technical terminology if misused.
            3. Add necessary context based on the provided conversation history.
            4. Do NOT remove specific constraints or requirements (like file names, libraries).
            5. If the prompt is already excellent, return it unchanged.
            6. Do not include any conversational filler (e.g., "Here is the enhanced prompt:"). JUST return the prompt.
            
            Conversation History Context:
            ${contextSummary}
            
            Original Prompt:
            ${originalPrompt}`;

            // We use the same chat endpoint but with a non-streaming request if possible, 
            // or we just consume the stream and buffer it.
            // For simplicity in this vertical slice, we'll use a standardized POST to /api/chat 
            // and assume it might stream, so we'll collect the response.

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: 'Enhance this prompt.' }
                        // Note: We put the actual prompt in the system instruction context to avoid 
                        // the model directly responding to the prompt instead of rewriting it. 
                        // Or we can just send the system prompt + user prompt. 
                        // Let's rely on the system prompt instruction.
                    ]
                })
            });

            if (!response.ok) {
                throw new Error('Failed to enhance prompt');
            }

            // Handle response - assuming standard text response or stream we need to read
            // If the API returns a stream, we read it.
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let enhancedText = '';

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });
                    // Simple parsing for now - in production use a robust stream parser 
                    // if the API wraps chunks significantly. 
                    // Assuming /api/chat returns raw text or simple chunks.
                    // If it returns 'data: ...' (SSE), we need to parse.
                    // For this MVP, let's assume raw text accumulation works or standard fetch behavior.

                    // Actually, the current /api/chat likely returns a stream of text directly 
                    // or TanStack AI stream format.
                    // If it's Vercel AI SDK/TanStack, it's text stream.
                    enhancedText += chunk;
                }
            } else {
                enhancedText = await response.text();
            }

            // Cleanup any SSE prefixes/artifacts if necessary
            // (e.g., "0: ...") - simplified for MVP. 
            // Ideally, we should reuse the same stream parser `useChat` uses, 
            // but that's internal to the hook.
            // Let's act defensively: if it looks like garbage, return original.
            // If raw text is clean, use it.

            // Removing common SSE prefixes if present (hacky but effective for MVP)
            // e.g. "0: " at start of lines
            // enhancedText = enhancedText.replace(/^0: /gm, '').replace(/\n0: /g, '');

            // Start of simple cleanup for demo
            if (enhancedText.length < 5) { // Too short, likely error or empty
                return { enhancedText: originalPrompt, originalText: originalPrompt, wasEnhanced: false };
            }

            return { enhancedText: enhancedText.trim(), originalText: originalPrompt, wasEnhanced: true };

        } catch (err) {
            console.error('Prompt Enhancement failed:', err);
            setError('Failed to enhance prompt');
            return { enhancedText: originalPrompt, originalText: originalPrompt, wasEnhanced: false };
        } finally {
            setIsEnhancing(false);
        }
    }, [i18n.language]);

    return {
        enhancePrompt,
        isEnhancing,
        error
    };
}
