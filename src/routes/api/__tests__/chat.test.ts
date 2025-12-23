/**
 * @fileoverview Chat API Route Tests
 * @module routes/api/__tests__/chat.test
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-1 - TanStack AI Integration Setup
 * @story 25-4 - Wire Tool Execution to UI
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';

// Mock tool definition helper
const createMockToolDef = (name: string) => ({
    name,
    inputSchema: z.object({ path: z.string() }),
    client: vi.fn((fn) => ({ type: 'client', name, execute: fn })),
    server: vi.fn((fn) => ({ type: 'server', name, execute: fn })),
});

// Mock TanStack AI
vi.mock('@tanstack/ai', () => ({
    chat: vi.fn(() => ({
        [Symbol.asyncIterator]: async function* () {
            yield { type: 'content', delta: 'Hello' };
            yield { type: 'done' };
        },
    })),
    toStreamResponse: vi.fn((_stream) => new Response('stream', {
        headers: { 'Content-Type': 'text/event-stream' },
    })),
    toolDefinition: vi.fn((config) => ({
        ...config,
        client: vi.fn((fn) => ({ type: 'client', name: config.name, execute: fn })),
        server: vi.fn((fn) => ({ type: 'server', name: config.name, execute: fn })),
    })),
}));

// Mock providers
vi.mock('../../../lib/agent/providers', () => ({
    providerAdapterFactory: {
        createAdapter: vi.fn(() => vi.fn(() => ({}))), // Returns a function that takes modelId
    },
}));

// Mock credential vault
vi.mock('../../../lib/agent/providers/credential-vault', () => ({
    credentialVault: {
        getCredentials: vi.fn(() => Promise.resolve('test-api-key')),
    },
}));

// Mock tools - need to mock the tool definitions since they use toolDefinition
vi.mock('../../../lib/agent/tools', () => ({
    readFileDef: { name: 'read_file' },
    writeFileDef: { name: 'write_file' },
    listFilesDef: { name: 'list_files' },
    executeCommandDef: { name: 'execute_command' },
}));

import { GET, POST } from '../chat';
import { providerAdapterFactory } from '../../../lib/agent/providers';
import { credentialVault } from '../../../lib/agent/providers/credential-vault';
import { chat } from '@tanstack/ai';

describe('/api/chat', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET', () => {
        it('should return health check', async () => {
            const response = await GET();
            const data = await response.json();

            expect(data.status).toBe('ok');
            expect(data.endpoint).toBe('/api/chat');
        });
    });

    describe('POST', () => {
        it('should return 400 if messages missing', async () => {
            const request = new Request('http://localhost/api/chat', {
                method: 'POST',
                body: JSON.stringify({}),
                headers: { 'Content-Type': 'application/json' },
            });

            const response = await POST({ request });

            expect(response.status).toBe(400);
        });

        it('should return 401 if no API key', async () => {
            vi.mocked(credentialVault.getCredentials).mockResolvedValueOnce(null);

            const request = new Request('http://localhost/api/chat', {
                method: 'POST',
                body: JSON.stringify({
                    messages: [{ role: 'user', content: 'Hello' }],
                }),
                headers: { 'Content-Type': 'application/json' },
            });

            const response = await POST({ request });

            expect(response.status).toBe(401);
        });

        it('should create adapter with correct provider', async () => {
            const request = new Request('http://localhost/api/chat', {
                method: 'POST',
                body: JSON.stringify({
                    messages: [{ role: 'user', content: 'Hello' }],
                    providerId: 'openrouter',
                }),
                headers: { 'Content-Type': 'application/json' },
            });

            await POST({ request });

            expect(providerAdapterFactory.createAdapter).toHaveBeenCalledWith(
                'openrouter',
                { apiKey: 'test-api-key' }
            );
        });

        it('should use default provider if not specified', async () => {
            const request = new Request('http://localhost/api/chat', {
                method: 'POST',
                body: JSON.stringify({
                    messages: [{ role: 'user', content: 'Hello' }],
                }),
                headers: { 'Content-Type': 'application/json' },
            });

            await POST({ request });

            expect(providerAdapterFactory.createAdapter).toHaveBeenCalledWith(
                'openrouter',
                expect.any(Object)
            );
        });

        it('should return SSE stream response', async () => {
            const request = new Request('http://localhost/api/chat', {
                method: 'POST',
                body: JSON.stringify({
                    messages: [{ role: 'user', content: 'Hello' }],
                }),
                headers: { 'Content-Type': 'application/json' },
            });

            const response = await POST({ request });

            expect(response.headers.get('Content-Type')).toBe('text/event-stream');
        });

        it('should pass tools to chat function (Story 25-4)', async () => {
            const request = new Request('http://localhost/api/chat', {
                method: 'POST',
                body: JSON.stringify({
                    messages: [{ role: 'user', content: 'Hello' }],
                }),
                headers: { 'Content-Type': 'application/json' },
            });

            await POST({ request });

            expect(chat).toHaveBeenCalledWith(
                expect.objectContaining({
                    tools: expect.arrayContaining([
                        expect.objectContaining({ name: 'read_file' }),
                        expect.objectContaining({ name: 'write_file' }),
                        expect.objectContaining({ name: 'list_files' }),
                        expect.objectContaining({ name: 'execute_command' }),
                    ]),
                })
            );
        });

        it('should include 4 tools in chat call (Story 25-4)', async () => {
            const request = new Request('http://localhost/api/chat', {
                method: 'POST',
                body: JSON.stringify({
                    messages: [{ role: 'user', content: 'Hello' }],
                }),
                headers: { 'Content-Type': 'application/json' },
            });

            await POST({ request });

            const chatCall = vi.mocked(chat).mock.calls[0][0];
            expect(chatCall.tools).toHaveLength(4);
        });
    });
});

