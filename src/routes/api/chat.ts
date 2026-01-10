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
 * @fix RC-009 - ChatRequest Validation
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
import { createGeminiChat } from '@tanstack/ai-gemini';
// Story 40-06: Use centralized tool registry instead of hardcoded imports
import { toolRegistry } from '@/infrastructure/tools/centralized-tool-registry';
import { initializeToolRegistry } from '@/infrastructure/tools/tool-catalog';
import {
    validateChatRequest,
    createValidationErrorResponse,
    logValidationError,
} from '../../lib/validation/chat-request';

// Default configuration
const DEFAULT_PROVIDER = 'openrouter';
const DEFAULT_MODEL = 'mistralai/devstral-2512:free';

// Provider base URLs
const PROVIDER_BASE_URLS: Record<string, string> = {
    openrouter: 'https://openrouter.ai/api/v1',
    openai: 'https://api.openai.com/v1',
    anthropic: 'https://api.anthropic.com/v1',
    gemini: 'https://generativelanguage.googleapis.com/v1beta/openai',
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
    // Gemini models support function calling
    if (modelId.includes('gemini')) {
        return true;
    }
    // Default to true but log warning
    console.log('[/api/chat] Unknown model tool support, assuming yes:', modelId);
    return true;
}

/**
 * Request body for chat endpoint
 */

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
    // Story 40-06: Use centralized tool registry
    // Ensure registry is initialized (singleton pattern)
    initializeToolRegistry();
    
    const registeredTools = toolRegistry.getServerExposedTools();
    const tools = registeredTools.map(tool => tool.definition);
    
    console.log('[/api/chat] Tool Registry loaded:', {
        totalRegistered: toolRegistry.count(),
        serverExposed: registeredTools.length,
        toolNames: tools.map(t => t.name),
    });
    
    return tools;
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
                    // Parse request body
                    let body: unknown;
                    try {
                        body = await request.json();
                    } catch {
                        return createValidationErrorResponse('Invalid JSON in request body');
                    }

                    // RC-009: Validate request with Zod
                    const validation = validateChatRequest(body);

                    if (!validation.success) {
                        // Log validation error for security monitoring
                        logValidationError(
                            validation.error?.message || 'unknown',
                            validation.error?.message || 'Validation failed',
                            {
                                providerId: (body as { providerId?: string })?.providerId,
                                messageCount: (body as { messages?: unknown[] })?.messages?.length,
                                timestamp: Date.now(),
                            }
                        );
                        return createValidationErrorResponse(
                            validation.error?.message || 'Validation failed',
                            validation.error?.details
                        );
                    }

                    const validatedBody = validation.data!;

                    console.log('[/api/chat] Request received:', {
                        providerId: validatedBody.providerId,
                        modelId: validatedBody.modelId,
                        hasApiKey: !!validatedBody.apiKey,
                        messageCount: validatedBody.messages?.length
                    });

                    // API key is required - client must retrieve from credentialVault
                    // and pass it in the request body
                    const apiKey = validatedBody.apiKey;
                    if (!apiKey) {
                        return createValidationErrorResponse(
                            'API key required. Configure API key in Agent Settings and ensure it is passed in request.',
                            401
                        );
                    }

                    const providerId = validatedBody.providerId || DEFAULT_PROVIDER;
                    const modelId = validatedBody.modelId || DEFAULT_MODEL;

                    // Determine baseURL: prioritize custom URL, then look up by provider
                    let baseURL: string;
                    if (validatedBody.customBaseURL) {
                        // OpenAI Compatible provider with custom endpoint
                        // Strip trailing slashes to avoid double slashes when SDK appends /chat/completions
                        baseURL = validatedBody.customBaseURL.replace(/\/+$/, '');
                    } else {
                        baseURL = PROVIDER_BASE_URLS[providerId] || PROVIDER_BASE_URLS.openrouter;
                    }

                    // Determine headers: custom headers OR OpenRouter defaults
                    let defaultHeaders: Record<string, string> | undefined;
                    if (validatedBody.customHeaders && Object.keys(validatedBody.customHeaders).length > 0) {
                        // Convert unknown values to strings for headers
                        defaultHeaders = Object.fromEntries(
                            Object.entries(validatedBody.customHeaders).map(([k, v]) => [k, String(v)])
                        );
                    } else if (providerId === 'openrouter') {
                        defaultHeaders = {
                            'HTTP-Referer': 'https://via-gent.dev',
                            'X-Title': 'Via-Gent IDE',
                        };
                    }

                    // Create provider-specific adapter
                    // TanStack AI v0.2.0: createOpenaiChat/createGeminiChat(model, apiKey, config)
                    // FIX-2026-01-09: Added Gemini support using createGeminiChat
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const adapter = providerId === 'gemini' || providerId === 'google'
                        ? createGeminiChat(modelId as any, apiKey)  // Gemini uses its own adapter
                        : createOpenaiChat(modelId as any, apiKey, {
                            baseURL,
                            defaultHeaders,
                        });

                    // Get tool definitions for LLM context
                    const tools = getTools();

                    // Debug: Log tool count and model being used
                    console.log('[/api/chat] Creating stream:', {
                        modelId,
                        baseURL,
                        isCustomProvider: !!validatedBody.customBaseURL,
                        toolCount: tools.length,
                        toolNames: tools.map(t => t.name),
                    });

                    // CC-2025-12-25-004: Debug flag to test without tools
                    // Also check if model supports tools (some models error with tool definitions)
                    const modelHasToolSupport = modelSupportsTools(modelId);
                    const enableTools = !validatedBody.disableTools && modelHasToolSupport;

                    console.log('[/api/chat] Tools enabled:', enableTools, {
                        disableTools: validatedBody.disableTools,
                        modelHasToolSupport
                    });

                    // Sanitize messages for models without tool support
                    // This removes tool-role messages and empty messages that could cause errors
                    const finalMessages = enableTools
                        ? validatedBody.messages
                        : sanitizeMessagesForNoToolModel(validatedBody.messages);

                    console.log('[/api/chat] Message count:', {
                        original: validatedBody.messages.length,
                        final: finalMessages.length
                    });

                    // Create streaming chat with the adapter
                    // NOTE: Some free models may not support tools
                    // FIX-2026-01-11: Mistral/OpenRouter requires explicit tool_choice
                    // Error 3051 "Invalid structured output syntax" when tool_choice is null
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const stream = chat({
                        adapter: adapter as any,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        messages: finalMessages as any,
                        // Only pass tools if enabled and model supports them
                        ...(enableTools && {
                            tools,
                            // Mistral/OpenRouter requires explicit tool_choice (rejects null)
                            // Set to 'auto' for default behavior when tools are available
                            toolChoice: 'auto' as const,
                        }),
                    });

                    // Create abort controller for streaming
                    const abortController = new AbortController();

                    // Handle client disconnect - abort the stream when client disconnects
                    request.signal.addEventListener('abort', () => {
                        console.log('[/api/chat] Client disconnected, aborting stream');
                        abortController.abort(new Error('Client disconnected'));
                    });

                    // Create SSE stream with abort controller
                    console.log('[/api/chat] About to create SSE stream from chat() result');
                    
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    let readableStream: ReadableStream;
                    try {
                        readableStream = toServerSentEventsStream(
                            stream as any,
                            abortController as any
                        );
                        console.log('[/api/chat] SSE stream created successfully');
                    } catch (sseError) {
                        console.error('[/api/chat] Failed to create SSE stream:', sseError);
                        throw sseError;
                    }

                    console.log('[/api/chat] Returning SSE Response');
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
