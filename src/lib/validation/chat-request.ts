/**
 * Chat Request Validation Schemas
 * @module lib/validation/chat-request
 *
 * Zod schemas for validating chat API requests.
 * RC-009: Sprint 27B - ChatRequest Validation
 */

import { z } from 'zod';

/**
 * Chat message schema
 */
export const chatMessageSchema = z.object({
    role: z.enum(['user', 'assistant', 'system', 'tool']),
    content: z.string().min(0).max(100000, 'Message exceeds maximum length'),
    name: z.string().optional(),
    tool_calls: z.array(z.unknown()).optional(),
    tool_call_id: z.string().optional(),
});

/**
 * Chat context schema
 */
export const chatContextSchema = z.object({
    files: z.array(z.string()).max(50, 'Context files exceed maximum of 50'),
    conversationId: z.string().optional(),
});

/**
 * Main ChatRequest schema
 */
export const chatRequestSchema = z.object({
    // Messages - required
    messages: z.array(chatMessageSchema)
        .min(1, 'At least one message is required')
        .max(1000, 'Message array exceeds maximum of 1000'),

    // Provider and model - optional with defaults
    providerId: z.string().optional(),
    modelId: z.string().optional(),

    // API key - required for actual requests
    apiKey: z.string().optional(),

    // Debug flag
    disableTools: z.boolean().optional(),

    // Custom provider support
    customBaseURL: z.string().url('Invalid custom base URL').optional().or(z.literal('')),
    customHeaders: z.record(z.string()).optional(),

    // Context - optional
    context: chatContextSchema.optional(),

    // Tools whitelist - optional
    tools: z.array(z.string()).max(20, 'Tool whitelist exceeds maximum of 20').optional(),

    // Streaming - optional
    stream: z.boolean().optional(),
});

/**
 * Inferred type from chat request schema
 */
export type ChatRequest = z.infer<typeof chatRequestSchema>;

/**
 * Validation result type
 */
export interface ValidationResult {
    success: boolean;
    data?: ChatRequest;
    error?: {
        message: string;
        details?: z.ZodErrorDetails;
    };
}

/**
 * Validate chat request
 */
export function validateChatRequest(body: unknown): ValidationResult {
    const result = chatRequestSchema.safeParse(body);

    if (result.success) {
        return {
            success: true,
            data: result.data,
        };
    }

    // Format error message
    const firstError = result.error.errors[0];
    let message = 'Invalid request';

    if (firstError) {
        message = `${firstError.path.join('.') || 'field'}: ${firstError.message}`;
    }

    return {
        success: false,
        error: {
            message,
            details: result.error.flatten(),
        },
    };
}

/**
 * Create a chat API response error
 */
export function createValidationErrorResponse(error: string, details?: unknown): Response {
    return new Response(
        JSON.stringify({
            error: 'Validation Error',
            message: error,
            details: details,
        }),
        {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
                'X-Validation-Error': 'true',
            },
        }
    );
}

/**
 * Create a chat API error response
 */
export function createChatErrorResponse(message: string, status: number): Response {
    return new Response(
        JSON.stringify({ error: message }),
        {
            status,
            headers: {
                'Content-Type': 'application/json',
                'X-Error-Source': 'chat-api',
            },
        }
    );
}

/**
 * Log validation errors for security monitoring
 */
export function logValidationError(
    path: string,
    error: string,
    requestInfo?: {
        providerId?: string;
        messageCount?: number;
        timestamp: number;
    }
): void {
    console.warn('[ChatValidation]', {
        path,
        error,
        ...requestInfo,
        timestamp: requestInfo?.timestamp || Date.now(),
    });
}
