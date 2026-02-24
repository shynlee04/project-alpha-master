/**
 * @fileoverview AI Chat API Route (Refactored Phase B-1)
 * @module routes/api/chat
 *
 * TanStack Start server route using unified AI Gateway.
 * Streaming SSE responses with tool support.
 *
 * ARCHITECTURE NOTE:
 * This is a server-side route that runs in Cloudflare Workers/Node.
 * IndexedDB (credentialVault) is NOT available here.
 * The client MUST pass the API key in the request body.
 */

import { json } from '@tanstack/react-start';
import { createFileRoute } from '@tanstack/react-router';
import { createServerGateway } from '@/infrastructure/ai/gateway';
import { toolRegistry } from '@/infrastructure/tools/centralized-tool-registry';
import {
  validateChatRequest,
  createValidationErrorResponse,
  logValidationError,
} from '../../lib/validation/chat-request';

// Default configuration
const DEFAULT_PROVIDER = 'openrouter';
const DEFAULT_MODEL = 'meta-llama/llama-3.3-8b-instruct:free';

/**
 * Error response helper
 */
function errorResponse(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Get tool definitions for the chat
 */
function getTools(): unknown[] {
  const registeredTools = toolRegistry.getServerExposedTools();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tools = registeredTools.map((tool: any) => tool.definition ?? tool);

  console.log('[/api/chat] Tool Registry loaded:', {
    totalRegistered: toolRegistry.count,
    serverExposed: registeredTools.length,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toolNames: tools.map((t: any) => t?.name),
  });

  return tools;
}

/**
 * Sanitize messages for models without tool support
 */
function sanitizeMessagesForNoToolModel(
  messages: Array<{
    role: string;
    content: string;
    tool_calls?: unknown[];
    tool_call_id?: string;
  }>
): Array<{ role: 'user' | 'assistant'; content: string }> {
  return messages
    .filter((m) => m.role !== 'tool' && m.role !== 'system')
    .map((m) => ({
      role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.content || '',
    }))
    .filter((m) => m.content.trim() !== '');
}

/**
 * TanStack Start Server Route
 */
export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      /**
       * GET handler - health check
       */
      GET: async () => {
        return json({ status: 'ok', endpoint: '/api/chat', version: 'B-1' });
      },

      /**
       * POST handler - chat with AI via unified gateway
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

          // Validate request with Zod
          const validation = validateChatRequest(body);

          if (!validation.success) {
            logValidationError(
              validation.error?.message || 'unknown',
              validation.error?.message || 'Validation failed',
              {
                providerId: (body as { providerId?: string })?.providerId,
                messageCount: (body as { messages?: unknown[] })?.messages
                  ?.length,
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
            messageCount: validatedBody.messages?.length,
          });

          // API key is required
          const apiKey = validatedBody.apiKey;
          if (!apiKey) {
            return createValidationErrorResponse(
              'API key required. Configure API key in Agent Settings.',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              401 as any
            );
          }

          const providerId = validatedBody.providerId || DEFAULT_PROVIDER;
          const modelId = validatedBody.modelId || DEFAULT_MODEL;

          // Create server gateway with API key from request
          const gateway = createServerGateway(
            apiKey,
            providerId as 'openrouter' | 'gemini' | 'openai'
          );

          // Get tool definitions
          const tools = getTools();

          // Check if model supports tools
          const modelHasToolSupport = gateway['modelSupportsTools'](modelId);
          const enableTools =
            !validatedBody.disableTools && modelHasToolSupport;

          console.log('[/api/chat] Tools enabled:', enableTools, {
            disableTools: validatedBody.disableTools,
            modelHasToolSupport,
          });

          // Sanitize messages if needed
          const finalMessages = enableTools
            ? validatedBody.messages
            : sanitizeMessagesForNoToolModel(validatedBody.messages);

          console.log('[/api/chat] Message count:', {
            original: validatedBody.messages.length,
            final: finalMessages.length,
          });

          // Create streaming response using gateway
          // For now, we use the gateway's internal chat method directly
          // In the future, this could be wrapped in a proper streaming adapter

          // Create abort controller for streaming
          const abortController = new AbortController();

          // Handle client disconnect
          request.signal.addEventListener('abort', () => {
            console.log('[/api/chat] Client disconnected, aborting stream');
            abortController.abort(new Error('Client disconnected'));
          });

          // Use the gateway's chat method
          const chatStream = gateway.chat({
            provider: providerId as 'openrouter' | 'gemini' | 'openai',
            model: modelId,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            messages: finalMessages as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            tools: enableTools ? (tools as any) : undefined,
          });

          // Convert async generator to ReadableStream for SSE
          const stream = new ReadableStream({
            async start(controller) {
              const encoder = new TextEncoder();
              try {
                for await (const chunk of chatStream) {
                  // Format as SSE event
                  const data = JSON.stringify(chunk);
                  controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                }
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
              } catch (error) {
                console.error('[/api/chat] Stream error:', error);
                const errorData = JSON.stringify({
                  type: 'error',
                  error:
                    error instanceof Error ? error.message : 'Stream error',
                });
                controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
                controller.close();
              }
            },
            cancel() {
              abortController.abort();
            },
          });

          console.log('[/api/chat] Returning SSE Response');
          return new Response(stream, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              Connection: 'keep-alive',
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
