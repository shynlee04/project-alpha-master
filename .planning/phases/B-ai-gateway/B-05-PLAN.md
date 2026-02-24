---
phase: B-ai-gateway
plan: 05
type: execute
wave: 4
depends_on: ["B-04"]
files_modified:
  - src/infrastructure/ai/gateway/__tests__/ai-gateway.test.ts
autonomous: false

must_haves:
  truths:
    - "Gateway chat works with OpenRouter (streaming)"
    - "Gateway chat works with Gemini (streaming)"
    - "Gateway embed works with Gemini"
    - "Server mode (createServerGateway) works"
    - "Client mode (aiGateway singleton) works with vault"
  artifacts:
    - path: "src/infrastructure/ai/gateway/__tests__/ai-gateway.test.ts"
      provides: "Unit tests for gateway"
      min_lines: 50
  key_links:
    - from: "test"
      to: "aiGateway.chat()"
      via: "integration test"
---

<objective>
Verify the AI Gateway works end-to-end with unit tests and manual verification checkpoint.

Purpose: Ensure the gateway foundation is solid before proceeding to Phase B-1 (Chat Migration). Catch integration issues early.

Output: Passing unit tests and user-verified functionality.
</objective>

<execution_context>
@./.opencode/get-shit-done/workflows/execute-plan.md
@./.opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PRIORITY-0-AI-GATEWAY-ARCHITECTURE-2026-02-02.md
@.planning/phases/B-ai-gateway/B-04-SUMMARY.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Gateway Unit Tests</name>
  <files>src/infrastructure/ai/gateway/__tests__/ai-gateway.test.ts</files>
  <action>
Create `src/infrastructure/ai/gateway/__tests__/ai-gateway.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  AIGateway,
  aiGateway,
  createServerGateway,
} from '../ai-gateway';
import type { AIGatewayConfig, ChatOptions, EmbedOptions } from '../types';

// Mock the credential vault
vi.mock('../../credential-vault', () => ({
  credentialVault: {
    getCredentials: vi.fn(),
  },
}));

// Mock the adapters
vi.mock('../../adapters', () => ({
  createOpenRouterAdapter: vi.fn(() => ({})),
  createGeminiAdapter: vi.fn(() => ({})),
  generateEmbeddings: vi.fn(() => [[0.1, 0.2, 0.3]]),
}));

// Mock TanStack AI
vi.mock('@tanstack/ai', () => ({
  chat: vi.fn(async function* () {
    yield 'Hello';
    yield ' world';
  }),
}));

describe('AIGateway', () => {
  describe('constructor', () => {
    it('creates gateway with client config', () => {
      const gateway = new AIGateway({
        defaultProvider: 'openrouter',
        credentialSource: { type: 'vault' },
      });
      expect(gateway).toBeInstanceOf(AIGateway);
    });

    it('creates gateway with server config', () => {
      const gateway = new AIGateway({
        defaultProvider: 'gemini',
        credentialSource: { type: 'request', apiKey: 'test-key' },
      });
      expect(gateway).toBeInstanceOf(AIGateway);
    });
  });

  describe('createServerGateway', () => {
    it('creates server gateway with API key', () => {
      const gateway = createServerGateway('test-api-key', 'openrouter');
      expect(gateway).toBeInstanceOf(AIGateway);
    });

    it('defaults to openrouter provider', () => {
      const gateway = createServerGateway('test-api-key');
      expect(gateway).toBeInstanceOf(AIGateway);
    });
  });

  describe('aiGateway singleton', () => {
    it('exists and is an AIGateway instance', () => {
      expect(aiGateway).toBeInstanceOf(AIGateway);
    });
  });

  describe('getApiKey (via reflection)', () => {
    it('returns API key from request source', async () => {
      const gateway = createServerGateway('my-api-key', 'openrouter');
      
      // Access protected method via any
      const apiKey = await (gateway as any).getApiKey('openrouter', {
        type: 'request',
        apiKey: 'my-api-key',
      });
      
      expect(apiKey).toBe('my-api-key');
    });

    it('throws when request source has no key', async () => {
      const gateway = createServerGateway('', 'openrouter');
      
      await expect(
        (gateway as any).getApiKey('openrouter', { type: 'request' })
      ).rejects.toThrow('API key required');
    });
  });

  describe('modelSupportsTools (via reflection)', () => {
    const gateway = new AIGateway({
      defaultProvider: 'openrouter',
      credentialSource: { type: 'request', apiKey: 'test' },
    });

    it('returns true for supported models', () => {
      expect((gateway as any).modelSupportsTools('gpt-4o')).toBe(true);
      expect((gateway as any).modelSupportsTools('claude-3.5-sonnet')).toBe(true);
    });

    it('returns false for unsupported models', () => {
      expect((gateway as any).modelSupportsTools('deepseek/deepseek-chat:free')).toBe(false);
      expect((gateway as any).modelSupportsTools('mistralai/devstral-2512:free')).toBe(false);
    });
  });

  describe('chat', () => {
    it('yields content chunks from stream', async () => {
      const gateway = createServerGateway('test-key', 'openrouter');
      const chunks: string[] = [];

      for await (const chunk of gateway.chat({
        provider: 'openrouter',
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Hi' }],
      })) {
        if (chunk.type === 'content' && chunk.delta) {
          chunks.push(chunk.delta);
        }
      }

      // Based on mock, should have 'Hello' and ' world'
      expect(chunks.length).toBeGreaterThan(0);
    });
  });

  describe('embed', () => {
    it('returns embeddings from Gemini', async () => {
      const gateway = createServerGateway('test-key', 'gemini');
      
      const embeddings = await gateway.embed({
        input: ['test text'],
      });

      expect(embeddings).toEqual([[0.1, 0.2, 0.3]]);
    });

    it('handles array input', async () => {
      const gateway = createServerGateway('test-key', 'gemini');
      
      const embeddings = await gateway.embed({
        input: ['text 1', 'text 2'],
      });

      expect(Array.isArray(embeddings)).toBe(true);
    });
  });
});
```

IMPORTANT:
- Mock external dependencies (vault, adapters, TanStack AI)
- Test both client (vault) and server (request) modes
- Test the singleton export
- Test edge cases (missing key, unsupported models)
  </action>
  <verify>
    pnpm test:fast src/infrastructure/ai/gateway
  </verify>
  <done>
    - Test file created
    - All tests pass
    - Coverage of main gateway functionality
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
AI Gateway foundation with:
- Gateway types (types.ts)
- Core gateway class (ai-gateway.ts)
- OpenRouter adapter (openrouter-adapter.ts)
- Gemini adapter + embeddings (gemini-adapter.ts, gemini-embeddings.ts)
- Barrel exports
- Unit tests
  </what-built>
  <how-to-verify>
1. **Check TypeScript compiles:**
   ```bash
   pnpm typecheck:fast
   ```
   Expected: 0 new errors

2. **Run unit tests:**
   ```bash
   pnpm test:fast src/infrastructure/ai/gateway
   ```
   Expected: All tests pass

3. **Run governance:**
   ```bash
   pnpm governance
   ```
   Expected: Passes

4. **Verify imports work (in browser console or test file):**
   ```typescript
   import { aiGateway, createServerGateway, ChatOptions } from '@/infrastructure/ai';
   console.log(typeof aiGateway.chat); // should be 'function'
   ```

5. **Optional: Live test with real API key:**
   If you have OpenRouter key configured in vault:
   ```typescript
   for await (const chunk of aiGateway.chat({
     provider: 'openrouter',
     model: 'anthropic/claude-3-haiku',
     messages: [{ role: 'user', content: 'Say hello!' }],
   })) {
     console.log(chunk);
   }
   ```
  </how-to-verify>
  <resume-signal>Type "B-0 verified" or describe issues found</resume-signal>
</task>

</tasks>

<verification>
Run before presenting checkpoint:

```bash
# All checks
pnpm typecheck:fast && pnpm test:fast src/infrastructure/ai/gateway && pnpm governance

# Summary
echo "=== B-0 Gateway Foundation Complete ==="
echo "Files created:"
ls -la src/infrastructure/ai/gateway/
ls -la src/infrastructure/ai/adapters/
```
</verification>

<success_criteria>
- [ ] Unit tests exist and pass
- [ ] `pnpm typecheck:fast` passes
- [ ] `pnpm governance` passes
- [ ] User verifies gateway works
- [ ] Phase B-0 marked complete
</success_criteria>

<output>
After user verification, create `.planning/phases/B-ai-gateway/B-05-SUMMARY.md` with:
- All B-0 deliverables confirmed
- Test results
- Any issues found and resolved
- Ready for Phase B-1 (Chat Migration)
</output>
