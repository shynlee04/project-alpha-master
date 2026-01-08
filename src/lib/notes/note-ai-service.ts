/**
 * @fileoverview Note AI Service - Real AI Implementation
 * @module lib/notes/note-ai-service
 * @story NR-01 - Wire AI Service to Agent System
 * @fixed 2025-12-31 - Connected to real agent system (replaces mock)
 */

import { useAgentSelectionStore } from '@/infrastructure/persistence/stores/agents/agent-selection-store';
import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store';
import { credentialVault } from '@/lib/agent/providers/credential-vault';
import type { Block } from '@blocknote/core';

/**
 * Options for AI content generation
 */
export interface NoteAIOptions {
    /** Override default active agent */
    agentId?: string;
    /** Context blocks from current note */
    contextBlocks?: Block[];
    /** Override agent's system prompt */
    systemPromptOverride?: string;
}

/**
 * Error codes for AI service
 */
export const NOTE_AI_ERRORS = {
    NO_AGENT: 'NO_AGENT',
    AGENT_NOT_FOUND: 'AGENT_NOT_FOUND',
    NO_API_KEY: 'NO_API_KEY',
    API_ERROR: 'API_ERROR',
} as const;

/**
 * Custom error class for AI service errors
 */
export class NoteAIError extends Error {
    code: keyof typeof NOTE_AI_ERRORS;

    constructor(code: keyof typeof NOTE_AI_ERRORS, message: string) {
        super(message);
        this.name = 'NoteAIError';
        this.code = code;
    }
}

/**
 * Generate content for a note based on a prompt
 * Uses the active agent's configuration and provider
 * 
 * @param prompt User's instruction
 * @param options Configuration options
 * @returns Generated text content
 * @throws {NoteAIError} If no agent configured, no API key, or API fails
 */
export async function generateNoteContent(
    prompt: string,
    options?: NoteAIOptions
): Promise<string> {
    // 0. Ensure credential vault is initialized
    try {
        await credentialVault.initialize();
    } catch (err) {
        console.warn('[NoteAIService] Vault init warning:', err);
    }

    // 1. Get active agent specifically for NOTES workspace
    const { getAgentForWorkspace } = useAgentSelectionStore.getState();
    let activeAgent = getAgentForWorkspace('notes');

    // 1.1 Fallback: If no notes-specific agent, try global active agent
    if (!activeAgent) {
        const { activeAgentId } = useAgentSelectionStore.getState();
        if (activeAgentId) {
            activeAgent = useAppStore.getState().getAgent(activeAgentId) || null;
        }
    }

    // Allow override, otherwise use the notes workspace agent
    const agent = options?.agentId
        ? useAppStore.getState().getAgent(options.agentId)
        : activeAgent;

    if (!agent) {
        // Try to get any available agent as last resort
        const allAgents = useAppStore.getState().agents;
        if (allAgents.length > 0) {
            console.warn('[NoteAIService] No notes agent, using first available agent');
            const fallbackAgent = allAgents[0];
            return generateWithAgent(fallbackAgent, prompt, options);
        }
        throw new NoteAIError(
            'NO_AGENT',
            'No AI agent configured. Please create an agent in Settings > Agents.'
        );
    }

    return generateWithAgent(agent, prompt, options);
}

/**
 * Internal function to generate content with a specific agent
 */
async function generateWithAgent(
    agent: any,
    prompt: string,
    options?: NoteAIOptions
): Promise<string> {
    // 2. Get API key from credential vault
    let apiKey = await credentialVault.getCredentials(agent.providerId);

    // 2.1 Fallback: Check if API key is still in old location (hasApiKey flag with no vault entry)
    if (!apiKey && agent.hasApiKey) {
        console.warn('[NoteAIService] API key flagged but not in vault. Migration may be needed.');
        // Try to get from legacy location if available
        const providers = useAppStore.getState().providers;
        const provider = providers?.find((p: any) => p.id === agent.providerId);
        if (provider && 'apiKey' in provider && provider.apiKey) {
            // Cast apiKey to string for legacy migration path
            const legacyKey = String(provider.apiKey);
            apiKey = legacyKey;
            console.log('[NoteAIService] Using legacy API key from provider store');
            // Auto-migrate to vault
            if (apiKey) {
                try {
                    await credentialVault.storeCredentials(agent.providerId, apiKey);
                    console.log('[NoteAIService] Auto-migrated API key to vault');
                } catch (e) {
                    console.warn('[NoteAIService] Failed to auto-migrate:', e);
                }
            }
        }
    }

    if (!apiKey) {
        throw new NoteAIError(
            'NO_API_KEY',
            `No API key configured for provider "${agent.providerId}". Please add your API key in Settings > Providers.`
        );
    }

    // 3. Build context from blocks if provided
    let fullPrompt = prompt;
    if (options?.contextBlocks?.length) {
        const contextText = options.contextBlocks
            .map(block => extractBlockText(block))
            .filter(Boolean)
            .join('\n');

        if (contextText) {
            fullPrompt = `Context from current note:\n\`\`\`\n${contextText}\n\`\`\`\n\n${prompt}`;
        }
    }

    // 4. Use system prompt (override or agent's default)
    const systemPrompt = options?.systemPromptOverride || agent.systemPrompt ||
        'You are a helpful AI assistant for note-taking. Generate clear, concise content. Respond in the same language as the user input.';

    // 5. Call the provider API
    console.log(`[NoteAIService] Calling ${agent.providerId}/${agent.modelId || agent.model}`);

    const response = await callProviderAPI({
        providerId: agent.providerId,
        modelId: agent.modelId || agent.model,
        apiKey,
        systemPrompt,
        userPrompt: fullPrompt,
        temperature: agent.temperature ?? 0.7,
        maxTokens: agent.maxTokens ?? 2048,
    });

    return response;
}

/**
 * Extract text content from a BlockNote block
 */
function extractBlockText(block: Block): string {
    if (!block.content) return '';

    if (Array.isArray(block.content)) {
        return block.content
            .map(item => {
                if (typeof item === 'object' && item !== null && 'text' in item) {
                    return (item as { text: string }).text;
                }
                return '';
            })
            .join('');
    }

    return '';
}

/**
 * Call the appropriate provider API
 */
async function callProviderAPI(params: {
    providerId: string;
    modelId: string;
    apiKey: string;
    systemPrompt: string;
    userPrompt: string;
    temperature: number;
    maxTokens: number;
}): Promise<string> {
    const { providerId, modelId, apiKey, systemPrompt, userPrompt, temperature, maxTokens } = params;

    let endpoint: string;
    let headers: Record<string, string>;
    let body: object;

    // Build request based on provider type
    switch (providerId) {
        case 'openrouter':
            endpoint = 'https://openrouter.ai/api/v1/chat/completions';
            headers = {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost',
                'X-Title': 'Via-gent Notes'
            };
            body = {
                model: modelId,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature,
                max_tokens: maxTokens
            };
            break;

        case 'openai':
            endpoint = 'https://api.openai.com/v1/chat/completions';
            headers = {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            };
            body = {
                model: modelId,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature,
                max_tokens: maxTokens
            };
            break;

        case 'anthropic':
            endpoint = 'https://api.anthropic.com/v1/messages';
            headers = {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            };
            body = {
                model: modelId,
                system: systemPrompt,
                messages: [{ role: 'user', content: userPrompt }],
                max_tokens: maxTokens
            };
            break;

        case 'google':
            endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
            headers = { 'Content-Type': 'application/json' };
            body = {
                contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
                generationConfig: { temperature, maxOutputTokens: maxTokens }
            };
            break;

        default:
            // OpenAI-compatible fallback for custom providers
            endpoint = 'https://api.openai.com/v1/chat/completions';
            headers = {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            };
            body = {
                model: modelId,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature,
                max_tokens: maxTokens
            };
    }

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[NoteAIService] API error:', response.status, errorText);
            throw new NoteAIError(
                'API_ERROR',
                `AI API error (${response.status}): ${errorText.slice(0, 200)}`
            );
        }

        const data = await response.json();

        // Extract content based on provider response format
        if (providerId === 'anthropic') {
            return data.content?.[0]?.text || '';
        } else if (providerId === 'google') {
            return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } else {
            // OpenAI / OpenRouter format
            return data.choices?.[0]?.message?.content || '';
        }
    } catch (error) {
        if (error instanceof NoteAIError) {
            throw error;
        }

        console.error('[NoteAIService] Fetch error:', error);
        throw new NoteAIError(
            'API_ERROR',
            `Failed to call AI API: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

