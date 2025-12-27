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
 * Models known to NOT support function calling
 * Add models here that return errors when tools are passed
 */
const MODELS_WITHOUT_TOOL_SUPPORT = [
    'nex-agi/deepseek-v3.1-nex-n1:free',
    'deepseek/deepseek-chat:free',
    'deepseek-chat',
    // Add more models here as discovered
];

/**
 * Check if a model supports tool/function calling
 */
function modelSupportsTools(modelId: string): boolean {
    // Check explicit blocklist
    if (MODELS_WITHOUT_TOOL_SUPPORT.some(m => modelId.includes(m))) {
        return false;
    }
    // Known good models
    if (modelId.includes('gpt-') || modelId.includes('claude') || modelId.includes('devstral')) {
        return true;
    }
    // Default to true but log warning
    console.log('[/api/chat] Unknown model tool support, assuming yes:', modelId);
    return true;
}

/**
 * Request body for chat endpoint
 */
interface ChatRequest {
    messages: Array<{ role: 'user' | 'assistant' | 'tool'; content: string }>;
    providerId?: string;
    modelId?: string;
    apiKey?: string; // Client MUST pass API key (from credentialVault)
    disableTools?: boolean; // CC-2025-12-25-004: Debug flag to test without tools
    // OpenAI Compatible Provider support
    customBaseURL?: string; // Custom API base URL for openai-compatible providers
    customHeaders?: Record<string, string>; // Custom headers for openai-compatible providers
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
 * Sanitize messages for models without tool support
 * Removes tool-related messages and tool_calls from assistant messages
 */
function sanitizeMessagesForNoToolModel(
    messages: Array<{ role: string; content: string; tool_calls?: unknown[]; tool_call_id?: string }>
): Array<{ role: 'user' | 'assistant' | 'tool'; content: string }> {
    return messages
        // Filter out tool role messages entirely
        .filter(m => m.role !== 'tool')
        // Filter out system messages (convert to user with prefix if needed)
        .filter(m => m.role !== 'system')
        // Map remaining to clean format
        .map(m => ({
            role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant' | 'tool',
            content: m.content || '',
        }))
        // Filter out empty messages
        .filter(m => m.content.trim() !== '');
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

                    // Determine baseURL: prioritize custom URL, then look up by provider
                    let baseURL: string;
                    if (body.customBaseURL) {
                        // OpenAI Compatible provider with custom endpoint
                        // Strip trailing slashes to avoid double slashes when SDK appends /chat/completions
                        baseURL = body.customBaseURL.replace(/\/+$/, '');
                    } else {
                        baseURL = PROVIDER_BASE_URLS[providerId] || PROVIDER_BASE_URLS.openrouter;
                    }

                    // Determine headers: custom headers OR OpenRouter defaults
                    let defaultHeaders: Record<string, string> | undefined;
                    if (body.customHeaders && Object.keys(body.customHeaders).length > 0) {
                        defaultHeaders = body.customHeaders;
                    } else if (providerId === 'openrouter') {
                        defaultHeaders = {
                            'HTTP-Referer': 'https://via-gent.dev',
                            'X-Title': 'Via-Gent IDE',
                        };
                    }

                    // Create OpenAI-compatible adapter directly
                    // TanStack AI v0.2.0: createOpenaiChat(model, apiKey, config)
                    // Cast modelId as 'any' to allow arbitrary model strings
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const adapter = createOpenaiChat(modelId as any, apiKey, {
                        baseURL,
                        defaultHeaders,
                    });

                    // Get tool definitions for LLM context
                    const tools = getTools();

                    // Debug: Log tool count and model being used
                    console.log('[/api/chat] Creating stream:', {
                        modelId,
                        baseURL,
                        isCustomProvider: !!body.customBaseURL,
                        toolCount: tools.length,
                        toolNames: tools.map(t => t.name),
                    });

                    // CC-2025-12-25-004: Debug flag to test without tools
                    // Also check if model supports tools (some models error with tool definitions)
                    const modelHasToolSupport = modelSupportsTools(modelId);
                    const enableTools = !body.disableTools && modelHasToolSupport;

                    console.log('[/api/chat] Tools enabled:', enableTools, {
                        disableTools: body.disableTools,
                        modelHasToolSupport
                    });

                    // Sanitize messages for models without tool support
                    // This removes tool-role messages and empty messages that could cause errors
                    const finalMessages = enableTools
                        ? body.messages
                        : sanitizeMessagesForNoToolModel(body.messages);

                    console.log('[/api/chat] Message count:', {
                        original: body.messages.length,
                        final: finalMessages.length
                    });

                    // Create streaming chat with the adapter
                    // NOTE: Some free models may not support tools
                    const stream = chat({
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        adapter: adapter as any,
                        messages: finalMessages,
                        // Only pass tools if enabled and model supports them
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
