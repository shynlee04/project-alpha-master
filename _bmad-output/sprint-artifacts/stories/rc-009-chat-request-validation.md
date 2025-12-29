# Story: RC-009 - ChatRequest Validation

**Story ID:** rc-009-chat-request-validation
**Sprint:** 27B
**Priority:** HIGH (HIGH-006)
**Status:** ready-for-dev
**Estimated Points:** 5
**Owner:** Team B

## Issue Description

The `ChatRequest` type in the chat API (`src/routes/api/chat.ts`) lacks input validation, allowing malformed requests to reach the AI provider layer. This can cause:
- Unexpected errors from provider APIs
- Potential security issues with malformed prompts
- Poor error messages for developers

## Root Cause

The chat API was implemented quickly during Epic 2 without comprehensive input validation. The Ralph Loop security audit flagged this as a potential attack vector.

## Acceptance Criteria

1. [ ] `ChatRequest` validated with Zod schema before processing
2. [ ] Validation rules:
   - `message`: non-empty string, max 10,000 characters
   - `agentId`: valid UUID or 'default'
   - `stream`: boolean, default true
   - `context`: optional object with max 50 items
   - `tools`: optional array, max 20 tools
3. [ ] Invalid requests return 400 with detailed error message
4. [ ] Validation errors logged for security monitoring
5. [ ] Rate limiting headers included on responses
6. [ ] Tests cover: valid requests, all invalid patterns, error responses (15+ tests)

## Technical Approach

```typescript
import { z } from 'zod';

const ChatRequestSchema = z.object({
  message: z.string()
    .min(1, 'Message is required')
    .max(10000, 'Message exceeds maximum length')
    .trim(),
  agentId: z.string()
    .uuid('Invalid agent ID')
    .or(z.literal('default')),
  stream: z.boolean().default(true),
  context: z.object({
    files: z.array(z.string()).max(50),
    conversationId: z.string().optional(),
  }).optional(),
  tools: z.array(z.string()).max(20).optional(),
});

type ChatRequest = z.infer<typeof ChatRequestSchema>;

// Middleware pattern
async function validateChatRequest(req: Request, next: Next): Promise<Response> {
  try {
    const body = await req.json();
    const result = ChatRequestSchema.safeParse(body);

    if (!result.success) {
      return Response.json({
        error: 'Invalid request',
        details: result.error.flatten(),
      }, { status: 400 });
    }

    // Attach validated request to context
    req.validatedData = result.data;
    return next(req);
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}
```

## Dependencies

- `src/routes/api/chat.ts` - Chat API endpoint
- `src/lib/agent/providers/model-registry.ts` - For agent validation
- Zod library (already a dependency)

## Files to Modify

- `src/routes/api/chat.ts` - Add validation middleware
- `src/routes/api/__tests__/chat.test.ts` - Add validation tests

## Files to Create

- `src/lib/validation/chat-request.ts` - Shared validation schemas

## Test Strategy

1. **Valid Requests**: Schema accepts all valid request patterns
2. **Invalid Message**: Empty, too long, whitespace only
3. **Invalid AgentId**: Malformed UUID, wrong format
4. **Invalid Context**: Too many files, invalid structure
5. **Error Responses**: 400 status with detailed error body

## Definition of Done

- [ ] All AC satisfied
- [ ] 15+ tests passing (100%)
- [ ] Code reviewed
- [ ] Integration validated with chat API
- [ ] sprint-status.yaml updated

## Notes

Validation should be applied at the API layer before any processing occurs.

---

**Created:** 2025-12-29
**Last Updated:** 2025-12-29
