/**
 * @fileoverview AI Chat API Route
 * @module routes/api/chat
 * 
 * TanStack AI chat endpoint with streaming SSE responses.
 * Integrates ProviderAdapterFactory + file/terminal tools.
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-1 - TanStack AI Integration Setup
 * @story 25-4 - Wire Tool Execution to UI
 */

import { json } from '@tanstack/react-start';
import { chat, toStreamResponse } from '@tanstack/ai';
import { providerAdapterFactory } from '../../lib/agent/providers';
import { credentialVault } from '../../lib/agent/providers/credential-vault';
import { readFileDef, writeFileDef, listFilesDef, executeCommandDef } from '../../lib/agent/tools';

// Default model for development
const DEFAULT_PROVIDER = 'openrouter';
const DEFAULT_MODEL = 'meta-llama/llama-3.1-8b-instruct:free';

/**
 * Request body for chat endpoint
 */
interface ChatRequest {
    messages: Array<{ role: 'user' | 'assistant' | 'tool'; content: string }>;
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
        const apiKey = await credentialVault.getCredentials(providerId);
        if (!apiKey) {
            return errorResponse(`No API key configured for provider: ${providerId}`, 401);
        }

        // Create adapter factory (returns a function that takes modelId)
        const adapterFactory = providerAdapterFactory.createAdapter(providerId, { apiKey });

        // Create model-specific adapter
        // TanStack AI openai() returns a function that creates text adapters
        const adapter = adapterFactory(modelId);

        // Get tool definitions for LLM context
        // Note: Actual execution happens client-side via .client() implementations
        const tools = getTools();

        // Create streaming chat
        const stream = chat({
            adapter,
            messages: body.messages,
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
 * Get tool definitions for the chat
 * 
 * Returns TanStack AI tool definitions that the LLM can choose to call.
 * The client-side useAgentChatWithTools hook handles actual execution
 * using .client() implementations with workspace facades.
 * 
 * @story 25-4 - Wire Tool Execution to UI
 */
function getTools() {
    // Return tool definitions for LLM context
    // The LLM will see these tool schemas and can request to call them
    // Actual execution handled client-side via .client() pattern
    return [
        readFileDef,
        writeFileDef,
        listFilesDef,
        executeCommandDef,
    ];
}

