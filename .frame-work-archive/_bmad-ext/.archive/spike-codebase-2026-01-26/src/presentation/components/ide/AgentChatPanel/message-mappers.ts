/**
 * Message Mappers
 *
 * Utility functions for mapping between different message formats.
 *
 * @layer Presentation
 * @module message-mappers
 */

import { ChatMessage } from '../EnhancedChatInterface';

/**
 * Map ThreadMessageRecord from store to ChatMessage
 */
export function mapStoreMessages(storeMessages: any[]): ChatMessage[] {
    return storeMessages.map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: new Date(m.timestamp),
        toolExecutions: m.toolCalls?.map((tc: any) => ({
            id: tc.id,
            name: tc.name,
            status: tc.status as any,
            input: typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input),
            output: typeof tc.output === 'string' ? tc.output : JSON.stringify(tc.output),
        }))
    }));
}

/**
 * Map hook messages to ChatMessage format
 */
export function mapHookMessages(hookMessages: any[], rawMessages: unknown[]): ChatMessage[] {
    return hookMessages.map((msg, index) => ({
        id: `msg_${index}_${Date.now()}`,
        role: msg.role === 'tool' ? 'assistant' : (msg.role as 'user' | 'assistant'),
        content: msg.content,
        timestamp: new Date(),
        toolExecutions: msg.role === 'assistant' ? extractToolExecutions(rawMessages, index) : undefined,
    }));
}

/**
 * Extract tool executions from raw messages
 */
function extractToolExecutions(msgs: unknown[], currentIndex: number) {
    const executions: any[] = [];

    const msg = msgs[currentIndex] as { parts?: unknown[] } | undefined;
    if (!msg?.parts || !Array.isArray(msg.parts)) {
        return undefined;
    }

    for (const part of msg.parts) {
        const p = part as {
            type?: string;
            id?: string;
            name?: string;
            state?: string;
            input?: Record<string, unknown>;
            output?: unknown;
        };

        if (p.type === 'tool-call' && p.name) {
            let status: 'pending' | 'running' | 'success' | 'error' = 'pending';

            switch (p.state) {
                case 'executing': status = 'running'; break;
                case 'result': status = 'success'; break;
                case 'error': status = 'error'; break;
                case 'approval-requested': status = 'pending'; break;
            }

            executions.push({
                id: p.id || `tool_${executions.length}`,
                name: p.name,
                status,
                input: p.input ? JSON.stringify(p.input) : undefined,
                output: p.output ? JSON.stringify(p.output) : undefined,
            });
        }
    }

    return executions.length > 0 ? executions : undefined;
}
