---
phase: B-ai-gateway
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/infrastructure/ai/gateway/types.ts
  - src/infrastructure/ai/gateway/ai-gateway.ts
  - src/infrastructure/ai/gateway/index.ts
autonomous: true

must_haves:
  truths:
    - "Gateway types are importable and type-safe"
    - "AIGateway class exists with constructor"
    - "getApiKey works for both vault and request modes"
  artifacts:
    - path: "src/infrastructure/ai/gateway/types.ts"
      provides: "All gateway interfaces and types"
      exports: ["AIProvider", "CredentialSource", "AIGatewayConfig", "ChatOptions", "GenerateOptions", "EmbedOptions", "TranscribeOptions"]
    - path: "src/infrastructure/ai/gateway/ai-gateway.ts"
      provides: "Core gateway class skeleton"
      exports: ["AIGateway", "aiGateway", "createServerGateway"]
    - path: "src/infrastructure/ai/gateway/index.ts"
      provides: "Barrel exports"
  key_links:
    - from: "src/infrastructure/ai/gateway/ai-gateway.ts"
      to: "src/infrastructure/ai/credential-vault.ts"
      via: "import for getApiKey"
      pattern: "from.*credential-vault"
---

<objective>
Create the foundational types and core gateway class structure for the unified AI Gateway.

Purpose: Establish the type-safe foundation that all AI operations will flow through, with dual-mode credential support (client vault + server request body).

Output: Gateway types, core class skeleton, and barrel exports ready for adapter implementation.
</objective>

<execution_context>
@./.opencode/get-shit-done/workflows/execute-plan.md
@./.opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/PRIORITY-0-AI-GATEWAY-ARCHITECTURE-2026-02-02.md

# Existing infrastructure to integrate with
@src/infrastructure/ai/credential-vault.ts
@src/infrastructure/ai/index.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Gateway Types</name>
  <files>src/infrastructure/ai/gateway/types.ts</files>
  <action>
Create `src/infrastructure/ai/gateway/types.ts` with all gateway interfaces from PRIORITY-0 Part 2.2:

```typescript
// AI Provider types
export type AIProvider = 'openrouter' | 'gemini' | 'openai' | 'anthropic' | 'ollama';

// Credential source - vault (client) or request (server)
export interface CredentialSource {
  type: 'vault' | 'request';
  apiKey?: string;  // Only for 'request' type
}

// Core gateway configuration
export interface AIGatewayConfig {
  defaultProvider: AIProvider;
  credentialSource: CredentialSource;
}

// Chat options (for Chat-Cascade operator)
export interface ChatOptions {
  provider: AIProvider;
  model: string;
  messages: Message[];
  tools?: Tool[];
  stream?: boolean;
  credentials?: CredentialSource;
}

// Message type (from TanStack AI)
export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | ContentPart[];
  name?: string;
  tool_call_id?: string;
}

export interface ContentPart {
  type: 'text' | 'image';
  text?: string;
  image_url?: { url: string };
}

// Tool definition (simplified)
export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

// Generate options (for Notes module multimodality)
export interface GenerateOptions {
  type: 'text' | 'image' | 'audio' | 'video' | 'storyboard';
  provider: AIProvider;
  model?: string;
  prompt: string;
  input?: {
    images?: ImageInput[];
    audio?: AudioInput;
    document?: DocumentInput;
  };
  credentials?: CredentialSource;
}

export interface ImageInput {
  blob?: Blob;
  base64?: string;
  url?: string;
}

export interface AudioInput {
  blob: Blob;
  mimeType?: string;
}

export interface DocumentInput {
  content: string;
  mimeType: string;
}

// Embedding options (Gemini only - Phase E)
export interface EmbedOptions {
  input: string | string[];
  model?: string;  // Default: 'text-embedding-004'
  dimensions?: number;  // Default: 768
  credentials?: CredentialSource;
}

// Transcription options
export interface TranscribeOptions {
  provider: AIProvider;
  audio: Blob | ArrayBuffer;
  language?: string;
  credentials?: CredentialSource;
}

// Result types
export interface ChatChunk {
  type: 'content' | 'tool_call' | 'tool_result' | 'done' | 'error';
  delta?: string;
  name?: string;
  args?: Record<string, unknown>;
  output?: unknown;
  error?: string;
}

export interface GenerateResult {
  text?: string;
  url?: string;
  base64?: string;
  blob?: Blob;
  images?: string[];
}
```

IMPORTANT:
- Use `export type` for type-only exports where appropriate
- Add JSDoc comments for each interface explaining its purpose
- Keep consistent with PRIORITY-0 Part 2.2 but add JSDoc
  </action>
  <verify>
    pnpm typecheck:fast | grep -E "(gateway/types|error)" || echo "No errors"
  </verify>
  <done>
    - All types defined in types.ts
    - No TypeScript errors
    - Types are importable: `import { AIProvider, ChatOptions } from '@/infrastructure/ai/gateway/types'`
  </done>
</task>

<task type="auto">
  <name>Task 2: Create Core Gateway Class</name>
  <files>src/infrastructure/ai/gateway/ai-gateway.ts</files>
  <action>
Create `src/infrastructure/ai/gateway/ai-gateway.ts` with the core class structure from PRIORITY-0 Part 2.3:

```typescript
import { credentialVault } from '../credential-vault';
import type {
  AIProvider,
  AIGatewayConfig,
  CredentialSource,
  ChatOptions,
  GenerateOptions,
  EmbedOptions,
  TranscribeOptions,
  ChatChunk,
  GenerateResult,
} from './types';

/**
 * Models known to NOT support function calling
 * Preserved from existing chat.ts
 */
const MODELS_WITHOUT_TOOL_SUPPORT = [
  'nex-agi/deepseek-v3.1-nex-n1:free',
  'deepseek/deepseek-chat:free',
  'deepseek-chat',
  'mistralai/devstral-2512:free',
  'mistralai/',
];

/**
 * Unified AI Gateway
 * 
 * Single entry point for ALL AI operations across the application.
 * Supports dual-mode credentials:
 * - Client mode: Gets API key from CredentialVault (IndexedDB)
 * - Server mode: Gets API key from request body
 */
export class AIGateway {
  private config: AIGatewayConfig;

  constructor(config: AIGatewayConfig) {
    this.config = config;
  }

  /**
   * Get API key from appropriate source (vault or request)
   */
  protected async getApiKey(
    provider: AIProvider,
    credentials?: CredentialSource
  ): Promise<string> {
    const source = credentials ?? this.config.credentialSource;
    
    if (source.type === 'request') {
      if (!source.apiKey) {
        throw new Error(`API key required for ${provider} in server mode`);
      }
      return source.apiKey;
    }
    
    // Client mode: get from vault
    const creds = await credentialVault.getCredentials(provider);
    if (!creds) {
      throw new Error(`No API key found for ${provider} in vault. Configure in Settings > Providers.`);
    }
    return creds;
  }

  /**
   * Check if model supports tool/function calling
   */
  protected modelSupportsTools(modelId: string): boolean {
    return !MODELS_WITHOUT_TOOL_SUPPORT.some(m => modelId.includes(m));
  }

  /**
   * Streaming chat completion (for Chat-Cascade operator)
   * Implementation in B-04
   */
  async *chat(_options: ChatOptions): AsyncIterable<ChatChunk> {
    // Skeleton - implemented in B-04 after adapters are ready
    throw new Error('chat() not yet implemented - complete B-02, B-03 first');
  }

  /**
   * Generate content (for Notes module)
   * Implementation in B-04
   */
  async generate(_options: GenerateOptions): Promise<GenerateResult> {
    // Skeleton - implemented in B-04
    throw new Error('generate() not yet implemented - complete B-02, B-03 first');
  }

  /**
   * Generate embeddings (Gemini only - for RAG)
   * Implementation in B-03
   */
  async embed(_options: EmbedOptions): Promise<number[][]> {
    // Skeleton - implemented in B-03
    throw new Error('embed() not yet implemented - complete B-03 first');
  }

  /**
   * Transcribe audio
   * Implementation deferred
   */
  async transcribe(_options: TranscribeOptions): Promise<string> {
    throw new Error('transcribe() not yet implemented');
  }
}

/**
 * Singleton gateway for client-side usage
 * Uses CredentialVault (IndexedDB) for API keys
 */
export const aiGateway = new AIGateway({
  defaultProvider: 'openrouter',
  credentialSource: { type: 'vault' },
});

/**
 * Factory for server-side usage
 * API key is passed from client in request body
 */
export function createServerGateway(
  apiKey: string,
  provider: AIProvider = 'openrouter'
): AIGateway {
  return new AIGateway({
    defaultProvider: provider,
    credentialSource: { type: 'request', apiKey },
  });
}
```

IMPORTANT:
- Use `protected` for internal methods (allows extension in tests)
- Methods are skeletons that throw - actual implementation in B-04
- Preserve MODELS_WITHOUT_TOOL_SUPPORT from existing chat.ts
- Add comprehensive JSDoc comments
  </action>
  <verify>
    pnpm typecheck:fast | grep -E "(ai-gateway|error)" || echo "No errors"
  </verify>
  <done>
    - AIGateway class exists with constructor
    - getApiKey works for both modes (vault/request)
    - modelSupportsTools checks blocklist
    - Singleton `aiGateway` exported
    - Factory `createServerGateway` exported
    - Methods are skeletons (throw errors explaining next steps)
  </done>
</task>

<task type="auto">
  <name>Task 3: Create Barrel Export and Update Index</name>
  <files>src/infrastructure/ai/gateway/index.ts, src/infrastructure/ai/index.ts</files>
  <action>
1. Create `src/infrastructure/ai/gateway/index.ts`:

```typescript
// Gateway barrel export
export * from './types';
export { AIGateway, aiGateway, createServerGateway } from './ai-gateway';
```

2. Update `src/infrastructure/ai/index.ts` to add gateway exports:

Add to the existing file:
```typescript
// Gateway exports (Phase B)
export * from './gateway';
```

This allows imports like:
- `import { aiGateway, ChatOptions } from '@/infrastructure/ai'`
- `import { createServerGateway } from '@/infrastructure/ai/gateway'`
  </action>
  <verify>
    pnpm typecheck:fast | grep -E "(infrastructure/ai|error)" || echo "No errors"
  </verify>
  <done>
    - gateway/index.ts exports all types and gateway
    - infrastructure/ai/index.ts re-exports gateway
    - Import from '@/infrastructure/ai' works for gateway types
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

# Verify imports work
echo "import { aiGateway, ChatOptions, createServerGateway } from '@/infrastructure/ai'" | pnpm tsx --eval
```
</verification>

<success_criteria>
- [ ] `src/infrastructure/ai/gateway/types.ts` exists with all interfaces
- [ ] `src/infrastructure/ai/gateway/ai-gateway.ts` exists with AIGateway class
- [ ] `src/infrastructure/ai/gateway/index.ts` exports everything
- [ ] `src/infrastructure/ai/index.ts` re-exports gateway
- [ ] `pnpm typecheck:fast` passes with 0 new errors
- [ ] `pnpm governance` passes
- [ ] Imports work: `import { aiGateway } from '@/infrastructure/ai'`
</success_criteria>

<output>
After completion, create `.planning/phases/B-ai-gateway/B-01-SUMMARY.md`
</output>
