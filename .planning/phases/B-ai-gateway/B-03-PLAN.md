---
phase: B-ai-gateway
plan: 03
type: execute
wave: 2
depends_on: ["B-01"]
files_modified:
  - src/infrastructure/ai/adapters/gemini-adapter.ts
  - src/infrastructure/ai/adapters/gemini-embeddings.ts
  - src/infrastructure/ai/adapters/index.ts
  - src/infrastructure/ai/gateway/ai-gateway.ts
autonomous: true

must_haves:
  truths:
    - "Gemini adapter creates valid TanStack AI adapter for chat"
    - "Embeddings use direct Gemini API (TanStack AI doesn't support embeddings)"
    - "embed() method returns number[][] from Gemini"
  artifacts:
    - path: "src/infrastructure/ai/adapters/gemini-adapter.ts"
      provides: "Gemini chat adapter using createGeminiChat or geminiText"
      exports: ["createGeminiAdapter"]
    - path: "src/infrastructure/ai/adapters/gemini-embeddings.ts"
      provides: "Direct Gemini API for embeddings"
      exports: ["generateEmbeddings"]
  key_links:
    - from: "src/infrastructure/ai/gateway/ai-gateway.ts"
      to: "src/infrastructure/ai/adapters/gemini-adapter.ts"
      via: "createAdapter switch case"
      pattern: "case 'gemini'"
    - from: "src/infrastructure/ai/gateway/ai-gateway.ts"
      to: "src/infrastructure/ai/adapters/gemini-embeddings.ts"
      via: "embed() method implementation"
      pattern: "generateEmbeddings"
---

<objective>
Create the Gemini adapter for chat and direct embeddings support via Gemini API.

Purpose: Gemini handles chat (via TanStack AI) and embeddings (direct API - TanStack AI doesn't support embeddings). Gemini is the preferred provider for multimodal Notes features and RAG embeddings.

Output: Working Gemini chat adapter + embeddings function, wired into the gateway.
</objective>

<execution_context>
@./.opencode/get-shit-done/workflows/execute-plan.md
@./.opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PRIORITY-0-AI-GATEWAY-ARCHITECTURE-2026-02-02.md
@.planning/phases/B-ai-gateway/B-01-SUMMARY.md

# PRIORITY-0 Part 5.2: geminiText('model', { apiKey }) for explicit key
# PRIORITY-0 Part 6: Embeddings strategy with text-embedding-004
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Gemini Chat Adapter</name>
  <files>src/infrastructure/ai/adapters/gemini-adapter.ts</files>
  <action>
Create `src/infrastructure/ai/adapters/gemini-adapter.ts`:

```typescript
/**
 * Gemini Adapter for AI Gateway
 * 
 * Uses TanStack AI's geminiText with config object for explicit API key.
 * 
 * IMPORTANT: Use geminiText('model', { apiKey }) format.
 * The config object approach is the correct way to pass explicit API key.
 * 
 * @see PRIORITY-0-AI-GATEWAY-ARCHITECTURE-2026-02-02.md Part 5.2
 */

import { geminiText, createGeminiChat } from '@tanstack/ai-gemini';

export interface GeminiAdapterConfig {
  apiKey: string;
  model: string;
}

/**
 * Create a TanStack AI adapter for Gemini
 * 
 * @param config - Adapter configuration including API key and model
 * @returns TanStack AI chat adapter
 * 
 * @example
 * ```typescript
 * const adapter = createGeminiAdapter({
 *   apiKey: 'AIza...',
 *   model: 'gemini-2.0-flash',
 * });
 * 
 * const stream = chat({ adapter, messages });
 * ```
 */
export function createGeminiAdapter(config: GeminiAdapterConfig) {
  const { apiKey, model } = config;

  // geminiText with config object for explicit API key
  // This is the CORRECT way per PRIORITY-0 Part 5.2
  return geminiText(model, { apiKey });
}

/**
 * Create a Gemini chat adapter (alternative using createGeminiChat)
 * Use this for more advanced configuration options
 */
export function createGeminiChatAdapter(config: GeminiAdapterConfig) {
  const { apiKey, model } = config;
  
  return createGeminiChat(model, apiKey);
}

/**
 * Default models for Gemini
 * Used for fallback when user hasn't selected a model
 */
export const GEMINI_DEFAULT_MODELS = {
  chat: 'gemini-2.0-flash',
  vision: 'gemini-2.0-flash',
  embedding: 'text-embedding-004',
} as const;
```

IMPORTANT:
- Use `geminiText(model, { apiKey })` with config object
- Export both `createGeminiAdapter` and `createGeminiChatAdapter` for flexibility
- Define default models including embedding model
  </action>
  <verify>
    pnpm typecheck:fast | grep -E "(gemini-adapter|error)" || echo "No errors"
  </verify>
  <done>
    - Gemini chat adapter created
    - Uses geminiText with config object for API key
    - Both adapter functions exported
    - Default models defined
  </done>
</task>

<task type="auto">
  <name>Task 2: Create Gemini Embeddings Module</name>
  <files>src/infrastructure/ai/adapters/gemini-embeddings.ts</files>
  <action>
Create `src/infrastructure/ai/adapters/gemini-embeddings.ts`:

```typescript
/**
 * Gemini Embeddings - Direct API
 * 
 * TanStack AI does NOT support embeddings, so we use direct Gemini API.
 * Uses text-embedding-004 model (768 dimensions by default).
 * 
 * @see PRIORITY-0-AI-GATEWAY-ARCHITECTURE-2026-02-02.md Part 6
 */

export interface EmbeddingConfig {
  model?: string;
  apiKey: string;
  dimensions?: number;
}

const DEFAULT_MODEL = 'text-embedding-004';
const DEFAULT_DIMENSIONS = 768;

interface GeminiEmbeddingResponse {
  embeddings: Array<{ values: number[] }>;
}

/**
 * Generate embeddings using Gemini API
 * 
 * @param texts - Array of texts to embed
 * @param config - Configuration including API key and optional model
 * @returns Array of embedding vectors
 * 
 * @example
 * ```typescript
 * const embeddings = await generateEmbeddings(
 *   ['Hello world', 'How are you?'],
 *   { apiKey: 'AIza...' }
 * );
 * // embeddings[0] is a 768-dimension vector for 'Hello world'
 * ```
 */
export async function generateEmbeddings(
  texts: string[],
  config: EmbeddingConfig
): Promise<number[][]> {
  const {
    model = DEFAULT_MODEL,
    apiKey,
    dimensions = DEFAULT_DIMENSIONS,
  } = config;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:batchEmbedContents?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: texts.map(text => ({
          model: `models/${model}`,
          content: { parts: [{ text }] },
          outputDimensionality: dimensions,
        })),
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini embeddings failed: ${response.status} - ${error}`);
  }

  const data = (await response.json()) as GeminiEmbeddingResponse;
  return data.embeddings.map(e => e.values);
}

/**
 * Generate a single embedding
 * 
 * @param text - Text to embed
 * @param config - Configuration including API key
 * @returns Single embedding vector
 */
export async function generateEmbedding(
  text: string,
  config: EmbeddingConfig
): Promise<number[]> {
  const [embedding] = await generateEmbeddings([text], config);
  return embedding;
}

/**
 * Embedding model info
 */
export const GEMINI_EMBEDDING_MODELS = {
  'text-embedding-004': {
    dimensions: 768,
    maxInputTokens: 2048,
  },
} as const;
```

IMPORTANT:
- Direct fetch to Gemini API (no SDK wrapper)
- Supports batch embedding for efficiency
- Configurable dimensions (default 768)
- Proper error handling with status and message
  </action>
  <verify>
    pnpm typecheck:fast | grep -E "(gemini-embeddings|error)" || echo "No errors"
  </verify>
  <done>
    - generateEmbeddings function created
    - generateEmbedding convenience function created
    - Uses direct Gemini API (not TanStack AI)
    - Supports configurable dimensions
    - Proper error handling
  </done>
</task>

<task type="auto">
  <name>Task 3: Wire Gemini to Gateway</name>
  <files>src/infrastructure/ai/adapters/index.ts, src/infrastructure/ai/gateway/ai-gateway.ts</files>
  <action>
1. Update `src/infrastructure/ai/adapters/index.ts` to export Gemini:

```typescript
/**
 * AI Provider Adapters
 */

export {
  createOpenRouterAdapter,
  OPENROUTER_DEFAULT_MODELS,
  type OpenRouterAdapterConfig,
} from './openrouter-adapter';

export {
  createGeminiAdapter,
  createGeminiChatAdapter,
  GEMINI_DEFAULT_MODELS,
  type GeminiAdapterConfig,
} from './gemini-adapter';

export {
  generateEmbeddings,
  generateEmbedding,
  GEMINI_EMBEDDING_MODELS,
  type EmbeddingConfig,
} from './gemini-embeddings';
```

2. Update `src/infrastructure/ai/gateway/ai-gateway.ts`:

Add imports:
```typescript
import { createGeminiAdapter, generateEmbeddings } from '../adapters';
```

Update createAdapter method 'gemini' case:
```typescript
      case 'gemini':
        return createGeminiAdapter({
          apiKey,
          model,
        });
```

Implement embed() method (replace the skeleton):
```typescript
  /**
   * Generate embeddings using Gemini
   * 
   * @param options - Embedding options
   * @returns Array of embedding vectors
   */
  async embed(options: EmbedOptions): Promise<number[][]> {
    const apiKey = await this.getApiKey('gemini', options.credentials);
    const inputs = Array.isArray(options.input) ? options.input : [options.input];
    
    return generateEmbeddings(inputs, {
      apiKey,
      model: options.model ?? 'text-embedding-004',
      dimensions: options.dimensions ?? 768,
    });
  }
```
  </action>
  <verify>
    pnpm typecheck:fast | grep -E "(gateway|adapters|error)" || echo "No errors"
  </verify>
  <done>
    - adapters/index.ts exports all Gemini functions
    - Gateway createAdapter handles 'gemini' case
    - Gateway embed() method implemented
    - TypeScript compiles without errors
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

# Verify Gemini adapter creates
echo "
import { createGeminiAdapter } from './src/infrastructure/ai/adapters';
const adapter = createGeminiAdapter({ apiKey: 'test', model: 'gemini-2.0-flash' });
console.log('Adapter created:', typeof adapter);
" | pnpm tsx --eval
```
</verification>

<success_criteria>
- [ ] `src/infrastructure/ai/adapters/gemini-adapter.ts` exists
- [ ] `src/infrastructure/ai/adapters/gemini-embeddings.ts` exists
- [ ] Uses `geminiText(model, { apiKey })` pattern
- [ ] `generateEmbeddings` uses direct Gemini API
- [ ] Gateway `createAdapter()` handles 'gemini'
- [ ] Gateway `embed()` is fully implemented
- [ ] `pnpm typecheck:fast` passes with 0 new errors
- [ ] `pnpm governance` passes
</success_criteria>

<output>
After completion, create `.planning/phases/B-ai-gateway/B-03-SUMMARY.md`
</output>
