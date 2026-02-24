---
phase: B-ai-gateway
plan: 02
type: execute
wave: 2
depends_on: ["B-01"]
files_modified:
  - src/infrastructure/ai/adapters/openrouter-adapter.ts
  - src/infrastructure/ai/adapters/index.ts
  - src/infrastructure/ai/gateway/ai-gateway.ts
autonomous: true

must_haves:
  truths:
    - "OpenRouter adapter creates valid TanStack AI adapter"
    - "Gateway can route 'openrouter' provider to correct adapter"
    - "Adapter uses explicit API key (not env auto-detect)"
  artifacts:
    - path: "src/infrastructure/ai/adapters/openrouter-adapter.ts"
      provides: "OpenRouter adapter using createOpenaiChat"
      exports: ["createOpenRouterAdapter"]
    - path: "src/infrastructure/ai/adapters/index.ts"
      provides: "Adapter barrel exports"
  key_links:
    - from: "src/infrastructure/ai/gateway/ai-gateway.ts"
      to: "src/infrastructure/ai/adapters/openrouter-adapter.ts"
      via: "createAdapter switch case"
      pattern: "case 'openrouter'"
---

<objective>
Create the OpenRouter adapter using TanStack AI's `createOpenaiChat` for explicit API key handling.

Purpose: OpenRouter is the primary provider for diverse LLM access (GPT-4, Claude, Llama, etc.). The adapter enables server-side routing through the AI Gateway.

Output: Working OpenRouter adapter wired into the gateway's createAdapter method.
</objective>

<execution_context>
@./.opencode/get-shit-done/workflows/execute-plan.md
@./.opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PRIORITY-0-AI-GATEWAY-ARCHITECTURE-2026-02-02.md
@.planning/phases/B-ai-gateway/B-01-SUMMARY.md

# TanStack AI patterns (validated in PRIORITY-0 Part 5)
# CORRECTED: Use createOpenaiChat for explicit API key, NOT openaiText
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create OpenRouter Adapter</name>
  <files>src/infrastructure/ai/adapters/openrouter-adapter.ts</files>
  <action>
Create `src/infrastructure/ai/adapters/openrouter-adapter.ts`:

```typescript
/**
 * OpenRouter Adapter for AI Gateway
 * 
 * Uses TanStack AI's createOpenaiChat with OpenRouter's OpenAI-compatible endpoint.
 * 
 * IMPORTANT: Use createOpenaiChat (NOT openaiText) for explicit API key handling.
 * openaiText auto-detects from env and does NOT accept apiKey as 2nd argument.
 * 
 * @see PRIORITY-0-AI-GATEWAY-ARCHITECTURE-2026-02-02.md Part 5.2
 */

import { createOpenaiChat } from '@tanstack/ai-openai';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export interface OpenRouterAdapterConfig {
  apiKey: string;
  model: string;
  siteUrl?: string;
  siteName?: string;
}

/**
 * Create a TanStack AI adapter for OpenRouter
 * 
 * @param config - Adapter configuration including API key and model
 * @returns TanStack AI chat adapter
 * 
 * @example
 * ```typescript
 * const adapter = createOpenRouterAdapter({
 *   apiKey: 'sk-or-...',
 *   model: 'anthropic/claude-3.5-sonnet',
 * });
 * 
 * const stream = chat({ adapter, messages });
 * ```
 */
export function createOpenRouterAdapter(config: OpenRouterAdapterConfig) {
  const { apiKey, model, siteUrl, siteName } = config;

  // createOpenaiChat signature: (model, apiKey, config?)
  // This is the CORRECT way to pass explicit API key
  return createOpenaiChat(model, apiKey, {
    baseURL: OPENROUTER_BASE_URL,
    // OpenRouter-specific headers for attribution
    // Note: These are passed via defaultHeaders if supported
    defaultHeaders: {
      'HTTP-Referer': siteUrl ?? 'https://project-alpha.local',
      'X-Title': siteName ?? 'Project Alpha',
    },
  });
}

/**
 * Default models for OpenRouter
 * Used for fallback when user hasn't selected a model
 */
export const OPENROUTER_DEFAULT_MODELS = {
  chat: 'anthropic/claude-3.5-sonnet',
  fast: 'anthropic/claude-3-haiku',
  code: 'anthropic/claude-3.5-sonnet',
} as const;
```

IMPORTANT:
- Use `createOpenaiChat(model, apiKey, config)` NOT `openaiText(model, apiKey)`
- The config.defaultHeaders may or may not be supported - test this
- Add JSDoc with examples for clarity
  </action>
  <verify>
    pnpm typecheck:fast | grep -E "(adapters|error)" || echo "No errors"
  </verify>
  <done>
    - OpenRouter adapter created
    - Uses createOpenaiChat with explicit API key
    - Exports createOpenRouterAdapter function
    - TypeScript compiles without errors
  </done>
</task>

<task type="auto">
  <name>Task 2: Create Adapter Barrel Export</name>
  <files>src/infrastructure/ai/adapters/index.ts</files>
  <action>
Create `src/infrastructure/ai/adapters/index.ts`:

```typescript
/**
 * AI Provider Adapters
 * 
 * Each adapter wraps a TanStack AI SDK adapter with our configuration.
 */

export {
  createOpenRouterAdapter,
  OPENROUTER_DEFAULT_MODELS,
  type OpenRouterAdapterConfig,
} from './openrouter-adapter';

// Gemini adapter will be added in B-03
// export { createGeminiAdapter } from './gemini-adapter';
```

Then update `src/infrastructure/ai/index.ts` to include adapters:

```typescript
// Add to existing exports
export * from './adapters';
```
  </action>
  <verify>
    pnpm typecheck:fast | grep -E "(adapters|error)" || echo "No errors"
  </verify>
  <done>
    - adapters/index.ts exports OpenRouter adapter
    - infrastructure/ai/index.ts re-exports adapters
  </done>
</task>

<task type="auto">
  <name>Task 3: Wire OpenRouter to Gateway</name>
  <files>src/infrastructure/ai/gateway/ai-gateway.ts</files>
  <action>
Update `src/infrastructure/ai/gateway/ai-gateway.ts` to add the createAdapter method:

1. Add import at top:
```typescript
import { createOpenRouterAdapter } from '../adapters';
```

2. Add createAdapter method to AIGateway class (after modelSupportsTools):

```typescript
  /**
   * Create TanStack AI adapter for the specified provider
   * 
   * @param provider - AI provider to create adapter for
   * @param model - Model ID to use
   * @param apiKey - API key for authentication
   * @returns TanStack AI compatible adapter
   */
  protected createAdapter(provider: AIProvider, model: string, apiKey: string) {
    switch (provider) {
      case 'openrouter':
        return createOpenRouterAdapter({
          apiKey,
          model,
        });
      
      case 'gemini':
        // Will be implemented in B-03
        throw new Error('Gemini adapter not yet implemented - complete B-03 first');
      
      case 'openai':
        // Direct OpenAI support (same adapter, different base URL)
        return createOpenRouterAdapter({
          apiKey,
          model,
        });
      
      case 'anthropic':
        throw new Error('Anthropic adapter not yet implemented');
      
      case 'ollama':
        throw new Error('Ollama adapter not yet implemented');
      
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }
```

Note: OpenAI uses the same adapter as OpenRouter for now (OpenAI-compatible API).
  </action>
  <verify>
    pnpm typecheck:fast | grep -E "(gateway|error)" || echo "No errors"
  </verify>
  <done>
    - createAdapter method added to AIGateway
    - 'openrouter' case returns working adapter
    - Other providers throw descriptive errors
    - Gateway is ready for chat implementation in B-04
  </done>
</task>

</tasks>

<verification>
Run after all tasks complete:

```bash
# TypeScript compilation
pnpm typecheck:fast

# Governance checks  
pnpm governance

# Verify adapter can be instantiated (basic test)
echo "
import { createOpenRouterAdapter } from './src/infrastructure/ai/adapters';
const adapter = createOpenRouterAdapter({ apiKey: 'test', model: 'test' });
console.log('Adapter created:', typeof adapter);
" | pnpm tsx --eval
```
</verification>

<success_criteria>
- [ ] `src/infrastructure/ai/adapters/openrouter-adapter.ts` exists
- [ ] Uses `createOpenaiChat` (NOT `openaiText`)
- [ ] `src/infrastructure/ai/adapters/index.ts` exports adapter
- [ ] `AIGateway.createAdapter()` method exists
- [ ] 'openrouter' case returns adapter instance
- [ ] `pnpm typecheck:fast` passes with 0 new errors
- [ ] `pnpm governance` passes
</success_criteria>

<output>
After completion, create `.planning/phases/B-ai-gateway/B-02-SUMMARY.md`
</output>
