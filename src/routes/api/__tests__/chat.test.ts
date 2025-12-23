/**
 * @fileoverview Chat API Route Tests
 * @module routes/api/__tests__/chat.test
 * 
 * @epic 25 - AI Foundation Sprint
 * @story 25-1 - TanStack AI Integration Setup
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock TanStack AI
vi.mock('@tanstack/ai', () => ({
    chat: vi.fn(() => ({
        [Symbol.asyncIterator]: async function* () {
            yield { type: 'content', delta: 'Hello' };
            yield { type: 'done' };
        },
    })),
    toStreamResponse: vi.fn((stream) => new Response('stream', {
        headers: { 'Content-Type': 'text/event-stream' },
    })),
}));

// Mock providers
vi.mock('../../../lib/agent/providers', () => ({
    providerAdapterFactory: {
        createAdapter: vi.fn(() => ({})),
    },
}));

// Mock credential vault
vi.mock('../../../lib/agent/providers/credential-vault', () => ({
    credentialVault: {
        getCredential: vi.fn(() => Promise.resolve('test-api-key')),
    },
}));

import { GET, POST } from '../chat';
import { providerAdapterFactory } from '../../../lib/agent/providers';
import { credentialVault } from '../../../lib/agent/providers/credential-vault';

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
            vi.mocked(credentialVault.getCredential).mockResolvedValueOnce(null);

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
    });
});
