/**
 * @fileoverview AI Chat API Route
 * @module routes/api/chat
 * 
 * TanStack Start server route with streaming SSE responses.
 * Integrates ProviderAdapterFactory + file/terminal tools.
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-R1 - E2E Integration Fix
 * @fix INC-2025-12-24-001 - 500 Error on /api/chat
 * 
 * ARCHITECTURE NOTE:
 * This is a server-side route that runs in Cloudflare Workers/Node.
 * IndexedDB (credentialVault) is NOT available here.
 * The client MUST pass the API key in the request body.
 * The client retrieves the API key from credentialVault before calling.
 */

import { json } from '@tanstack/react-start';
import { createFileRoute } from '@tanstack/react-router';
import { chat, toServerSentEventsStream } from '@tanstack/ai';
import { createOpenaiChat } from '@tanstack/ai-openai';
import { readFileDef, writeFileDef, listFilesDef, executeCommandDef } from '../../lib/agent/tools';

// Default configuration
const DEFAULT_PROVIDER = 'openrouter';
const DEFAULT_MODEL = 'mistralai/devstral-2512:free';

// Provider base URLs
const PROVIDER_BASE_URLS: Record<string, string> = {
    openrouter: 'https://openrouter.ai/api/v1',
    openai: 'https://api.openai.com/v1',
    anthropic: 'https://api.anthropic.com/v1',
};

/**
 * Request body for chat endpoint
 */
interface ChatRequest {
    messages: Array<{ role: 'user' | 'assistant' | 'tool'; content: string }>;
    providerId?: string;
    modelId?: string;
    apiKey?: string; // Client MUST pass API key (from credentialVault)
    disableTools?: boolean; // CC-2025-12-25-004: Debug flag to test without tools
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
             * 
             * Client must pass:
             * - messages: Array of chat messages
             * - apiKey: API key from credentialVault (required)
             * - providerId: Provider ID (default: 'openrouter')
             * - modelId: Model to use (default: free Llama model)
             */
            POST: async ({ request }: { request: Request }) => {
                try {
                    const body: ChatRequest = await request.json();

                    console.log('[/api/chat] Request received:', {
                        providerId: body.providerId,
                        modelId: body.modelId,
                        hasApiKey: !!body.apiKey,
                        messageCount: body.messages?.length
                    });

                    // Validate messages
                    if (!body.messages || !Array.isArray(body.messages)) {
                        return errorResponse('Messages array required', 400);
                    }

                    // API key is required - client must retrieve from credentialVault
                    // and pass it in the request body
                    const apiKey = body.apiKey;
                    if (!apiKey) {
                        return errorResponse(
                            'API key required. Configure API key in Agent Settings and ensure it is passed in request.',
                            401
                        );
                    }

                    const providerId = body.providerId || DEFAULT_PROVIDER;
                    const modelId = body.modelId || DEFAULT_MODEL;
                    const baseURL = PROVIDER_BASE_URLS[providerId] || PROVIDER_BASE_URLS.openrouter;

                    // Create OpenAI-compatible adapter directly
                    // TanStack AI v0.2.0: createOpenaiChat(model, apiKey, config)
                    // Cast modelId as 'any' to allow arbitrary OpenRouter model strings
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const adapter = createOpenaiChat(modelId as any, apiKey, {
                        baseURL,
                        defaultHeaders: providerId === 'openrouter' ? {
                            'HTTP-Referer': 'https://via-gent.dev',
                            'X-Title': 'Via-Gent IDE',
                        } : undefined,
                    });

                    // Get tool definitions for LLM context
                    const tools = getTools();

                    // Debug: Log tool count and model being used
                    console.log('[/api/chat] Creating stream:', {
                        modelId,
                        baseURL,
                        toolCount: tools.length,
                        toolNames: tools.map(t => t.name),
                    });

                    // CC-2025-12-25-004: Debug flag to test without tools
                    // Set DISABLE_TOOLS=true in request body to test basic chat
                    const enableTools = !body.disableTools;

                    console.log('[/api/chat] Tools enabled:', enableTools);

                    // Create streaming chat with the adapter
                    // NOTE: Some free models may not support tools
                    const stream = chat({
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        adapter: adapter as any,
                        messages: body.messages,
                        // Only pass tools if enabled
                        ...(enableTools && { tools }),
                    });

                    // Create abort controller for streaming
                    const abortController = new AbortController();

                    // Return SSE stream using non-deprecated toServerSentEventsStream
                    const readableStream = toServerSentEventsStream(stream, abortController);
                    return new Response(readableStream, {
                        headers: {
                            'Content-Type': 'text/event-stream',
                            'Cache-Control': 'no-cache',
                            'Connection': 'keep-alive',
                        },
                    });

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
