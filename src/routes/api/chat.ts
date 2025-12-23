/**
 * @fileoverview AI Chat API Route
 * @module routes/api/chat
 * 
 * TanStack AI chat endpoint with streaming SSE responses.
 * Integrates ProviderAdapterFactory + file/terminal tools.
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-1 - TanStack AI Integration Setup
 */

import { json } from '@tanstack/react-start';
import { chat, toStreamResponse } from '@tanstack/ai';
import { providerAdapterFactory } from '../../lib/agent/providers';
import { credentialVault } from '../../lib/agent/providers/credential-vault';
import { createFileTools, createTerminalTools } from '../../lib/agent/tools';
import { createFileToolsFacade } from '../../lib/agent/facades';
import type { AgentFileTools, AgentTerminalTools } from '../../lib/agent/facades';

// Default model for development
const DEFAULT_PROVIDER = 'openrouter';
const DEFAULT_MODEL = 'meta-llama/llama-3.1-8b-instruct:free';

/**
 * Request body for chat endpoint
 */
interface ChatRequest {
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
    providerId?: string;
    modelId?: string;
}

/**
 * Error response helper
 */
function errorResponse(message: string, status: number) {
    return new Response(
        JSON.stringify({ error: message }),
        { status, headers: { 'Content-Type': 'application/json' } }
    );
}

// Lazy tool facade instances (created on first request)
let fileToolsFacade: AgentFileTools | null = null;
let terminalToolsFacade: AgentTerminalTools | null = null;

/**
 * GET handler - health check
 */
export async function GET() {
    return json({ status: 'ok', endpoint: '/api/chat' });
}

/**
 * POST handler - chat with AI
 */
export async function POST({ request }: { request: Request }) {
    try {
        const body: ChatRequest = await request.json();

        // Validate messages
        if (!body.messages || !Array.isArray(body.messages)) {
            return errorResponse('Messages array required', 400);
        }

        const providerId = body.providerId || DEFAULT_PROVIDER;
        const modelId = body.modelId || DEFAULT_MODEL;

        // Get API key from vault
        const apiKey = await credentialVault.getCredential(providerId);
        if (!apiKey) {
            return errorResponse(`No API key configured for provider: ${providerId}`, 401);
        }

        // Create adapter
        const adapter = providerAdapterFactory.createAdapter(providerId, { apiKey });

        // Get tools (lazy initialization)
        // Note: In real implementation, facades would be wired with actual WebContainer/LocalFS
        // For now, we create placeholder tools that will be properly integrated in Story 25-4
        const tools = getTools();

        // Create streaming chat
        const stream = chat({
            adapter,
            messages: body.messages,
            model: modelId,
            tools,
        });

        // Return SSE stream
        return toStreamResponse(stream);

    } catch (error) {
        console.error('[/api/chat] Error:', error);
        return errorResponse(
            error instanceof Error ? error.message : 'Internal server error',
            500
        );
    }
}

/**
 * Get all tools for the chat (lazy initialization)
 */
function getTools() {
    // For this story, we return empty array as facades need real WebContainer
    // Story 25-4 will wire these properly with actual WebContainer/LocalFS
    // This establishes the pattern for how tools will be integrated

    // TODO (Story 25-4): Wire actual facades when WebContainer is available
    // const fileTools = createFileTools(() => getFileToolsFacade());
    // const terminalTools = createTerminalTools(() => getTerminalToolsFacade());
    // return [...Object.values(fileTools), ...Object.values(terminalTools)];

    return [];
}
