/**
 * @fileoverview AI Chat API Route
 * @module routes/api/chat
 * 
 * TanStack Start server route with streaming SSE responses.
 * Integrates ProviderAdapterFactory + file/terminal tools.
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-R1 - E2E Integration Fix
 * @fix INC-2025-12-24-001 - 404 Error on /api/chat
 */

import { json } from '@tanstack/react-start';
import { createFileRoute } from '@tanstack/react-router';
import { chat, toStreamResponse } from '@tanstack/ai';
import { providerAdapterFactory } from '../../lib/agent/providers';
import { credentialVault } from '../../lib/agent/providers/credential-vault';
import { readFileDef, writeFileDef, listFilesDef, executeCommandDef } from '../../lib/agent/tools';

// Default model for development
const DEFAULT_PROVIDER = 'openrouter';

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
 * Get tool definitions for the chat
 * 
 * Returns TanStack AI tool definitions that the LLM can choose to call.
 * The client-side useAgentChatWithTools hook handles actual execution
 * using .client() implementations with workspace facades.
 */
function getTools() {
    return [
        readFileDef,
        writeFileDef,
        listFilesDef,
        executeCommandDef,
    ];
}

/**
 * TanStack Start Server Route
 * 
 * Uses createFileRoute with server.handlers pattern for proper
 * route registration in the generated route tree.
 */
export const Route = createFileRoute('/api/chat')({
    server: {
        handlers: {
            /**
             * GET handler - health check
             */
            GET: async () => {
                return json({ status: 'ok', endpoint: '/api/chat' });
            },

            /**
             * POST handler - chat with AI
             */
            POST: async ({ request }: { request: Request }) => {
                try {
                    const body: ChatRequest = await request.json();

                    // Validate messages
                    if (!body.messages || !Array.isArray(body.messages)) {
                        return errorResponse('Messages array required', 400);
                    }

                    const providerId = body.providerId || DEFAULT_PROVIDER;

                    // Get API key from vault
                    const apiKey = await credentialVault.getCredentials(providerId);
                    if (!apiKey) {
                        return errorResponse(`No API key configured for provider: ${providerId}`, 401);
                    }

                    // Create OpenAI-compatible adapter using the factory
                    // The adapter already includes API key and baseURL configuration
                    const adapter = providerAdapterFactory.createAdapter(providerId, { apiKey });

                    // Get tool definitions for LLM context
                    const tools = getTools();

                    // Create streaming chat
                    // Pass the adapter directly - TanStack AI handles model selection
                    // Model is passed via messages context or adapter configuration
                    const stream = chat({
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        adapter: adapter as any, // Type assertion needed for OpenRouter compatibility
                        messages: body.messages,
                        tools,
                        // Model can be specified in the initial request - adapter handles internally
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
            },
        },
    },
});
