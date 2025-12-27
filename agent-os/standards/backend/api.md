---
document_id: STD-BACKEND-API-2025-12-27
title: Backend API Design Standards
version: 1.0.0
last_updated: 2025-12-27T13:10:00Z
phase: Implementation
team: Team A (Antigravity)
agent_mode: bmad-bmm-tech-writer
status: ACTIVE
---

# Backend API Design Standards

## Overview

This document defines API design standards for the Via-gent project. Since Via-gent is primarily a frontend-focused browser-based IDE with minimal backend infrastructure, these standards focus on the limited server-side API routes that support the application.

**Project Context**: Via-gent is a browser-based IDE running on WebContainers with a single API endpoint for AI chat functionality. The application is deployed to Cloudflare Workers via TanStack Start.

## API Architecture

### Current API Routes

The project has one primary API endpoint:

- **`POST /api/chat`** - AI chat endpoint with Server-Sent Events (SSE) streaming

Reference: [`src/routes/api/chat.ts`](../../src/routes/api/chat.ts)

### API Design Principles

1. **Minimal Backend**: Keep server-side logic minimal; most functionality runs client-side
2. **SSE Streaming**: Use Server-Sent Events for real-time AI responses
3. **Provider Abstraction**: Support multiple AI providers through adapter pattern
4. **Stateless Design**: API endpoints should be stateless; state managed client-side
5. **Type Safety**: Use TypeScript for all API route definitions

## API Endpoint Standards

### Request Format

All API requests should follow this structure:

```typescript
interface ChatRequest {
  messages: Array<{ role: 'user' | 'assistant' | 'tool'; content: string }>;
  providerId?: string;      // Default: 'openrouter'
  modelId?: string;         // Default: 'mistralai/devstral-2512:free'
  apiKey: string;           // REQUIRED - from client-side credentialVault
  disableTools?: boolean;   // Debug flag
  customBaseURL?: string;   // OpenAI-compatible provider support
  customHeaders?: Record<string, string>;
}
```

### Response Format

API responses use Server-Sent Events (SSE) streaming:

```typescript
// Content-Type: text/event-stream

// Text delta events
data: {"type":"text-delta","text":"Hello"}

// Tool call events
data: {"type":"tool_call","tool":"read_file","args":{"path":"/file.txt"}}

// Completion event
data: {"type":"done"}
```

### HTTP Methods

| Method | Usage | Example |
|--------|-------|---------|
| `POST` | Create/Execute | `/api/chat` - Send chat message |
| `GET` | Health Check | `/api/chat` - Verify endpoint availability |

### Status Codes

| Status | Usage | Description |
|--------|-------|-------------|
| `200` | Success | Successful request |
| `400` | Bad Request | Invalid request parameters |
| `401` | Unauthorized | Missing or invalid API key |
| `500` | Server Error | Internal server error |

## SSE Streaming Standards

### Event Types

```typescript
type StreamEvent = 
  | { type: 'text-delta'; text: string }
  | { type: 'tool_call'; tool: string; args: unknown }
  | { type: 'tool_result'; tool: string; result: unknown }
  | { type: 'done' }
  | { type: 'error'; error: string };
```

### Stream Consumption

Client-side stream consumption pattern:

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(request)
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const event = JSON.parse(line.slice(6));
      // Handle event
    }
  }
}
```

## Error Handling Standards

### Error Response Format

```typescript
interface ErrorResponse {
  error: string;
  code: string;
  details?: unknown;
}
```

### Error Types

| Error Code | Description | HTTP Status |
|------------|-------------|-------------|
| `MISSING_API_KEY` | API key not provided | 401 |
| `INVALID_API_KEY` | API key validation failed | 401 |
| `PROVIDER_ERROR` | AI provider error | 500 |
| `STREAM_ERROR` | Stream interruption | 500 |

### Error Handling Pattern

```typescript
try {
  const response = await fetch('/api/chat', { /* ... */ });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  // Process stream
} catch (error) {
  // Handle error
  console.error('API Error:', error);
}
```

## Security Standards

### API Key Handling

- **Client-Side Storage**: API keys stored in IndexedDB via Credential Vault
- **Transmission**: API keys sent in request body (not headers for OpenAI compatibility)
- **Validation**: Validate API key format before forwarding to provider
- **No Logging**: Never log API keys or sensitive data

Reference: [`src/lib/agent/providers/credential-vault.ts`](../../src/lib/agent/providers/credential-vault.ts)

### CORS Configuration

```typescript
// vite.config.ts
res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
```

### Input Validation

```typescript
import { z } from 'zod';

const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'tool']),
    content: z.string()
  })),
  providerId: z.string().optional(),
  modelId: z.string().optional(),
  apiKey: z.string().min(1),
  disableTools: z.boolean().optional(),
  customBaseURL: z.string().url().optional(),
  customHeaders: z.record(z.string()).optional()
});
```

## Documentation Standards

### API Documentation

- **Inline Comments**: Document request/response schemas
- **Type Definitions**: Use TypeScript interfaces for all API types
- **Example Usage**: Provide example requests and responses
- **Error Cases**: Document all possible error scenarios

### OpenAPI Specification

Consider maintaining an OpenAPI specification for future API expansion:

```yaml
openapi: 3.0.0
info:
  title: Via-gent API
  version: 1.0.0
paths:
  /api/chat:
    post:
      summary: Send chat message
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ChatRequest'
      responses:
        '200':
          description: Streaming response
          content:
            text/event-stream: {}
```

## Testing Standards

### API Testing

Test API routes using Vitest:

```typescript
describe('/api/chat', () => {
  it('should return 200 for valid request', async () => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ /* valid request */ })
    });
    
    expect(response.status).toBe(200);
  });
  
  it('should return 401 for missing API key', async () => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: '' })
    });
    
    expect(response.status).toBe(401);
  });
});
```

Reference: [`src/routes/api/__tests__/chat.test.ts`](../../src/routes/api/__tests__/chat.test.ts)

## Versioning Strategy

### API Versioning

- **Current Version**: v1.0.0
- **Versioning Approach**: URL-based versioning (`/api/v1/chat`)
- **Backward Compatibility**: Maintain backward compatibility when possible
- **Deprecation Notice**: Provide deprecation warnings for breaking changes

## Performance Standards

### Response Time Targets

| Operation | Target | Maximum |
|-----------|--------|---------|
| First byte | < 100ms | 500ms |
| Stream latency | < 50ms | 200ms |
| Total request | < 5s | 30s |

### Optimization Techniques

- **Streaming**: Use SSE for real-time responses
- **Caching**: Cache provider responses when appropriate
- **Connection Pooling**: Reuse connections to AI providers
- **Request Batching**: Batch multiple requests when possible

## Monitoring Standards

### Logging

```typescript
// Log API requests (without sensitive data)
console.log('[API] Chat request', {
  providerId: request.providerId,
  modelId: request.modelId,
  messageCount: request.messages.length
});

// Log errors
console.error('[API] Error:', error.message, {
  code: error.code,
  stack: error.stack
});
```

### Metrics

Track the following metrics:
- Request count by provider
- Average response time
- Error rate by error type
- Stream duration

## References

### Internal Documentation

- [`project-architecture-analysis-2025-12-27.md`](../../_bmad-output/documentation/project-architecture-analysis-2025-12-27.md) - Architecture analysis
- [`development-workflow-2025-12-27.md`](../../_bmad-output/documentation/development-workflow-2025-12-27.md) - Development workflow
- [`testing-infrastructure-2025-12-27.md`](../../_bmad-output/documentation/testing-infrastructure-2025-12-27.md) - Testing infrastructure

### External Documentation

- **TanStack Router**: [https://tanstack.com/router](https://tanstack.com/router)
- **Server-Sent Events**: [https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- **Cloudflare Workers**: [https://developers.cloudflare.com/workers/](https://developers.cloudflare.com/workers/)

### Implementation Files

- [`src/routes/api/chat.ts`](../../src/routes/api/chat.ts) - Chat API endpoint
- [`src/routes/api/__tests__/chat.test.ts`](../../src/routes/api/__tests__/chat.test.ts) - API tests
- [`src/lib/agent/providers/provider-adapter.ts`](../../src/lib/agent/providers/provider-adapter.ts) - Provider adapters

---

**Document Status**: Active
**Last Updated**: 2025-12-27T13:10:00Z
**Next Review**: 2026-01-27