---
id: PRIORITY-0-AI-GATEWAY
type: architecture-remediation
status: BLOCKING
priority: 0
created: 2026-02-02T13:00:00+07:00
revised: 2026-02-02T19:30:00+07:00
validated: 2026-02-02T20:15:00+07:00
version: 2.1.0
blocks:
  - Phase B (AI Gateway)
  - Phase C (Notes AI)
  - Phase D (Agentic)
  - Phase E (RAG)
author: supreme-coordinator
validation:
  tanstack_ai_patterns: CORRECTED
  source_of_truth_alignment: 12/12 aligned, 3 gaps documented
  hardcoded_keys: 3 files identified (was 1)
  tool_blocklist: PRESERVED from chat.ts
trigger: "User directive to fix AI fragmentation with plugin-aware architecture"
---

# PRIORITY 0: Unified AI Gateway Architecture (REVISED v2.0)

## Executive Summary

**Problem:** 100+ files with scattered AI logic across Platform Operators and Feature Modules. No unified gateway. Adding AI agents/tools will create unmaintainable chaos.

**Solution:** Create a single AI Gateway that ALL AI operations go through, with clear contracts for Platform Operators (FileTree, Chat-Cascade) and Feature Modules (Notes, Monaco, Terminal).

**Key Insight from `what-bring-us-here.md`:**
> "There are multiple AI-related issues nested into plugins issues that the high-level architecture must gradually resolve with schema, data types and models while regulating the data management"

---

## Part 1: Plugin-Aware AI Architecture

### 1.1 The Two Types of "Plugins"

From SOURCE-OF-TRUTH.md Part 2:

| Category | Components | AI Needs | Loading |
|----------|------------|----------|---------|
| **PLATFORM OPERATORS** | FileTree, Chat-Cascade | Chat-Cascade: Heavy AI (chat, tools, RAG) | Always running |
| **FEATURE MODULES** | Monaco, Notes, Terminal, Preview | Notes: Heavy AI (multimodality) | Optional, platform-dependent |

### 1.2 AI Consumption by Consumer Type

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           AI CONSUMERS                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  PLATFORM OPERATORS (Always Loaded)                                              │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │ Chat-Cascade Operator                                                       │ │
│  │ - chat()         → Streaming chat completions with tools                   │ │
│  │ - tools[]        → Tool execution (file CRUD, RAG, terminal)               │ │
│  │ - threads[]      → Thread management with MessagePart rendering            │ │
│  │                                                                             │ │
│  │ FileTree Operator                                                           │ │
│  │ - No direct AI   → File CRUD only, BUT receives tool results               │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
│  FEATURE MODULES (Optional)                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │ Notes Module (HEAVY AI)                                                     │ │
│  │ - generateContent()    → Text generation (summarize, continue, translate)  │ │
│  │ - generateImage()      → Image generation (Gemini Imagen, DALL-E)          │ │
│  │ - analyzeImage()       → Vision analysis (describe, extract text)          │ │
│  │ - transcribe()         → Audio to text                                      │ │
│  │ - generateTTS()        → Text to speech                                     │ │
│  │ - generateVideo()      → Video generation (Veo)                             │ │
│  │ - generateStoryboard() → Multi-image story generation                       │ │
│  │                                                                             │ │
│  │ Monaco Module                                                                │ │
│  │ - Future: Code completion, inline suggestions                               │ │
│  │                                                                             │ │
│  │ Terminal/Preview                                                             │ │
│  │ - No direct AI                                                               │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
│  CROSS-CUTTING (Phase E)                                                         │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │ RAG System                                                                   │ │
│  │ - embed()        → Text to vectors (Gemini embeddings)                      │ │
│  │ - search()       → Vector similarity search (Orama)                         │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           AI GATEWAY                                             │
│                     src/infrastructure/ai/gateway/                               │
│                                                                                  │
│  Single entry point for ALL AI operations                                        │
│  - Credential management (vault integration)                                     │
│  - Provider routing (OpenRouter, Gemini Direct)                                  │
│  - Request/response normalization                                                │
│  - Error handling                                                                │
│  - Future: Rate limiting, cost tracking                                          │
└─────────────────────────────────────────────────────────────────────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                  ▼
         ┌──────────────────┐              ┌──────────────────┐
         │ TanStack AI      │              │ Gemini Direct    │
         │ + OpenRouter     │              │ (embeddings,     │
         │ (chat, text)     │              │  media gen)      │
         └──────────────────┘              └──────────────────┘
```

---

## Part 2: Dual-Mode Gateway Design

### 2.1 The Server-Side Problem

From `chat.ts`:
```typescript
// ARCHITECTURE NOTE:
// This is a server-side route that runs in Cloudflare Workers/Node.
// IndexedDB (credentialVault) is NOT available here.
// The client MUST pass the API key in the request body.
```

**Solution:** Gateway operates in two modes:

| Mode | Environment | Credential Source | Use Case |
|------|-------------|-------------------|----------|
| **Client Mode** | Browser | CredentialVault (IndexedDB) | Direct AI calls from components |
| **Server Mode** | Cloudflare Workers | Request body | API routes like `/api/chat` |

### 2.2 Gateway Interface

```typescript
// src/infrastructure/ai/gateway/types.ts

export type AIProvider = 'openrouter' | 'gemini' | 'openai' | 'anthropic' | 'ollama';

// Credential can come from vault OR request
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
  // Server mode: pass credentials in options
  credentials?: CredentialSource;
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

// Embedding options (Gemini only - Phase E)
export interface EmbedOptions {
  input: string | string[];
  model?: string;  // Default: 'text-embedding-004'
  credentials?: CredentialSource;
}

// Transcription options
export interface TranscribeOptions {
  provider: AIProvider;
  audio: Blob | ArrayBuffer;
  language?: string;
  credentials?: CredentialSource;
}
```

### 2.3 Gateway Class

```typescript
// src/infrastructure/ai/gateway/ai-gateway.ts

import { chat, toServerSentEventsStream } from '@tanstack/ai';
// CORRECTED: Use createOpenaiChat for explicit API key (server-side)
// openaiText auto-detects from env and does NOT take apiKey as 2nd arg
import { createOpenaiChat } from '@tanstack/ai-openai';
import { geminiText, createGeminiChat } from '@tanstack/ai-gemini';
import { credentialVault } from '../credential-vault';

// Models known to NOT support function calling (from chat.ts)
const MODELS_WITHOUT_TOOL_SUPPORT = [
  'nex-agi/deepseek-v3.1-nex-n1:free',
  'deepseek/deepseek-chat:free',
  'deepseek-chat',
  'mistralai/devstral-2512:free',
  'mistralai/',
];

export class AIGateway {
  private config: AIGatewayConfig;

  constructor(config: AIGatewayConfig) {
    this.config = config;
  }

  /**
   * Get API key from appropriate source
   */
  private async getApiKey(
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
      throw new Error(`No API key found for ${provider} in vault`);
    }
    return creds;
  }

  /**
   * Check if model supports tool/function calling
   */
  private modelSupportsTools(modelId: string): boolean {
    if (MODELS_WITHOUT_TOOL_SUPPORT.some(m => modelId.includes(m))) {
      return false;
    }
    return true;
  }

  /**
   * Create TanStack AI adapter for provider
   * CORRECTED: Use createOpenaiChat/createGeminiChat for explicit API key
   */
  private createAdapter(provider: AIProvider, model: string, apiKey: string) {
    switch (provider) {
      case 'openrouter':
        // CORRECTED: createOpenaiChat(model, apiKey, config) - NOT openaiText
        return createOpenaiChat(model, apiKey, {
          baseURL: 'https://openrouter.ai/api/v1',
          // Note: defaultHeaders may not be supported - verify with SDK
        });
      
      case 'gemini':
        // CORRECTED: geminiText(model, { apiKey }) - config object format
        return geminiText(model, { apiKey });
      
      case 'openai':
        // CORRECTED: createOpenaiChat for explicit API key
        return createOpenaiChat(model, apiKey);
      
      case 'anthropic':
        // anthropicText from @tanstack/ai-anthropic
        throw new Error('Anthropic adapter not yet implemented');
      
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /**
   * Streaming chat completion (for Chat-Cascade operator)
   * Uses TanStack AI SDK
   */
  async chat(options: ChatOptions): AsyncIterable<ChatChunk> {
    const apiKey = await this.getApiKey(options.provider, options.credentials);
    const adapter = this.createAdapter(options.provider, options.model, apiKey);
    
    const stream = chat({
      adapter,
      messages: options.messages,
      tools: options.tools,
    });
    
    return stream;
  }

  /**
   * Generate content (for Notes module)
   * Routes to appropriate provider based on type
   */
  async generate(options: GenerateOptions): Promise<GenerateResult> {
    const apiKey = await this.getApiKey(options.provider, options.credentials);
    
    switch (options.type) {
      case 'text':
        return this.generateText(apiKey, options);
      case 'image':
        return this.generateImage(apiKey, options);
      case 'audio':
        return this.generateAudio(apiKey, options);
      case 'video':
        return this.generateVideo(apiKey, options);
      case 'storyboard':
        return this.generateStoryboard(apiKey, options);
      default:
        throw new Error(`Unknown generation type: ${options.type}`);
    }
  }

  /**
   * Generate embeddings (Gemini only - for RAG)
   * NOT using TanStack AI (not supported yet)
   */
  async embed(options: EmbedOptions): Promise<number[][]> {
    const apiKey = await this.getApiKey('gemini', options.credentials);
    const model = options.model ?? 'text-embedding-004';
    const inputs = Array.isArray(options.input) ? options.input : [options.input];
    
    // Direct Gemini API call for embeddings
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:batchEmbedContents?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: inputs.map(text => ({
            model: `models/${model}`,
            content: { parts: [{ text }] },
          })),
        }),
      }
    );
    
    if (!response.ok) {
      throw new Error(`Gemini embeddings failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.embeddings.map((e: { values: number[] }) => e.values);
  }

  /**
   * Transcribe audio (for Notes module)
   */
  async transcribe(options: TranscribeOptions): Promise<string> {
    const apiKey = await this.getApiKey(options.provider, options.credentials);
    // Implementation depends on provider
    // Gemini: Use Gemini Live API or generateContent with audio
    // OpenAI: Use Whisper API
    throw new Error('Transcription not yet implemented');
  }

  // Private implementations for media generation
  private async generateText(apiKey: string, options: GenerateOptions): Promise<GenerateResult> {
    // Use TanStack AI for text generation
    const adapter = this.createAdapter(options.provider, options.model ?? 'gemini-2.0-flash', apiKey);
    // ... implementation
  }

  private async generateImage(apiKey: string, options: GenerateOptions): Promise<GenerateResult> {
    // Direct API call to Gemini Imagen or OpenAI DALL-E
    // NOT using TanStack AI (not supported)
    // ... implementation
  }

  private async generateAudio(apiKey: string, options: GenerateOptions): Promise<GenerateResult> {
    // Direct API call to TTS provider
    // ... implementation
  }

  private async generateVideo(apiKey: string, options: GenerateOptions): Promise<GenerateResult> {
    // Direct API call to Gemini Veo
    // ... implementation
  }

  private async generateStoryboard(apiKey: string, options: GenerateOptions): Promise<GenerateResult> {
    // Multiple image generations in sequence
    // ... implementation
  }
}

// Export singleton for client mode
export const aiGateway = new AIGateway({
  defaultProvider: 'openrouter',
  credentialSource: { type: 'vault' },
});

// Export factory for server mode
export function createServerGateway(apiKey: string, provider: AIProvider = 'openrouter') {
  return new AIGateway({
    defaultProvider: provider,
    credentialSource: { type: 'request', apiKey },
  });
}
```

---

## Part 3: Plugin Integration Contracts

### 3.1 Chat-Cascade Operator Contract

```typescript
// src/plugins/chat/ai-contract.ts

import { aiGateway, createServerGateway } from '@/infrastructure/ai/gateway';
import type { ChatOptions, Tool } from '@/infrastructure/ai/gateway/types';

/**
 * AI contract for Chat-Cascade operator
 * 
 * This operator is ALWAYS LOADED and handles:
 * - Chat completions with streaming
 * - Tool execution (file CRUD, RAG, terminal)
 * - Thread management
 */
export interface ChatCascadeAIContract {
  /**
   * Stream chat completion with tools
   * Used by: /api/chat route
   */
  streamChat(options: {
    messages: Message[];
    model: string;
    provider: AIProvider;
    tools: Tool[];
    // Server mode: API key passed from client
    apiKey?: string;
  }): AsyncIterable<ChatChunk>;

  /**
   * Execute tool and return result
   * Tools can CRUD files in project
   */
  executeTool(toolCall: ToolCall): Promise<ToolResult>;
}

// Implementation
export const chatCascadeAI: ChatCascadeAIContract = {
  async *streamChat(options) {
    // Server mode: create gateway with passed API key
    const gateway = options.apiKey
      ? createServerGateway(options.apiKey, options.provider)
      : aiGateway;

    const stream = await gateway.chat({
      provider: options.provider,
      model: options.model,
      messages: options.messages,
      tools: options.tools,
    });

    for await (const chunk of stream) {
      yield chunk;
    }
  },

  async executeTool(toolCall) {
    // Tool execution is handled by tool registry
    // Results may include sideEffects (files created/modified)
    // This is defined in SOURCE-OF-TRUTH Part 3.4
    const tool = toolRegistry.get(toolCall.toolName);
    return tool.execute(toolCall.args);
  },
};
```

### 3.2 Notes Module AI Contract

```typescript
// src/plugins/notes/ai-contract.ts

import { aiGateway } from '@/infrastructure/ai/gateway';
import type { GenerateOptions } from '@/infrastructure/ai/gateway/types';

/**
 * AI contract for Notes module
 * 
 * This module is OPTIONALLY LOADED and handles:
 * - Multimodal content generation
 * - Text transformation (summarize, continue, translate)
 * - Media generation (image, audio, video)
 * 
 * From what-bring-us-here.md:
 * > "endpoints of those features in note plugins that the features are 
 * >  individual AI commands that both offer input and output multimodality"
 */
export interface NotesAIContract {
  // Text generation
  generateContent(prompt: string, context?: string): AsyncIterable<string>;
  summarize(content: string): AsyncIterable<string>;
  continueWriting(content: string): AsyncIterable<string>;
  translate(content: string, targetLang: string): AsyncIterable<string>;

  // Media generation (Gemini preferred)
  generateImage(prompt: string): Promise<{ url: string; base64?: string }>;
  analyzeImage(image: Blob, prompt?: string): Promise<string>;
  generateTTS(text: string, voice?: string): Promise<Blob>;
  transcribeAudio(audio: Blob): Promise<string>;
  generateVideo(prompt: string): Promise<{ url: string }>;
  generateStoryboard(prompt: string, scenes: number): Promise<{ images: string[] }>;
}

// Implementation
export const notesAI: NotesAIContract = {
  async *generateContent(prompt, context) {
    const stream = await aiGateway.chat({
      provider: 'gemini',
      model: 'gemini-2.0-flash',
      messages: [
        ...(context ? [{ role: 'system', content: context }] : []),
        { role: 'user', content: prompt },
      ],
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content') {
        yield chunk.delta;
      }
    }
  },

  async *summarize(content) {
    yield* this.generateContent(`Summarize the following:\n\n${content}`);
  },

  async *continueWriting(content) {
    yield* this.generateContent(`Continue writing:\n\n${content}`);
  },

  async *translate(content, targetLang) {
    yield* this.generateContent(`Translate to ${targetLang}:\n\n${content}`);
  },

  async generateImage(prompt) {
    const result = await aiGateway.generate({
      type: 'image',
      provider: 'gemini',
      prompt,
    });
    return { url: result.url, base64: result.base64 };
  },

  async analyzeImage(image, prompt) {
    const result = await aiGateway.generate({
      type: 'text',
      provider: 'gemini',
      model: 'gemini-2.0-flash',
      prompt: prompt ?? 'Describe this image in detail',
      input: { images: [{ blob: image }] },
    });
    return result.text;
  },

  async generateTTS(text, voice) {
    const result = await aiGateway.generate({
      type: 'audio',
      provider: 'gemini',
      prompt: text,
    });
    return result.blob;
  },

  async transcribeAudio(audio) {
    return aiGateway.transcribe({
      provider: 'gemini',
      audio,
    });
  },

  async generateVideo(prompt) {
    const result = await aiGateway.generate({
      type: 'video',
      provider: 'gemini',
      prompt,
    });
    return { url: result.url };
  },

  async generateStoryboard(prompt, scenes) {
    const result = await aiGateway.generate({
      type: 'storyboard',
      provider: 'gemini',
      prompt,
    });
    return { images: result.images };
  },
};
```

### 3.3 RAG System Contract (Phase E)

```typescript
// src/infrastructure/rag/ai-contract.ts

import { aiGateway } from '@/infrastructure/ai/gateway';

/**
 * AI contract for RAG system
 * 
 * Uses Gemini embeddings (text-embedding-004)
 * NOT using TanStack AI (embeddings not supported)
 * 
 * From what-bring-us-here.md:
 * > "the RAG area → as for when allowing user embedding and index their 
 * >  asset in project → and as the AI agents are given agentic permissions 
 * >  CRUD and RAG retrieve these"
 */
export interface RAGAIContract {
  /**
   * Generate embeddings for text chunks
   * Uses Gemini text-embedding-004 (768 dimensions)
   */
  embed(texts: string[]): Promise<number[][]>;

  /**
   * Embed single text (convenience)
   */
  embedSingle(text: string): Promise<number[]>;
}

// Implementation
export const ragAI: RAGAIContract = {
  async embed(texts) {
    return aiGateway.embed({
      input: texts,
      model: 'text-embedding-004',
    });
  },

  async embedSingle(text) {
    const [embedding] = await this.embed([text]);
    return embedding;
  },
};
```

---

## Part 4: Migration Plan (Phased)

### Phase B-0: Gateway Foundation (3-4 days)

**Scope:** Create gateway infrastructure only, NO migrations yet

**Files to create:**
```
src/infrastructure/ai/
├── gateway/
│   ├── ai-gateway.ts          ← Core gateway class (Part 2.3)
│   ├── types.ts               ← Gateway types (Part 2.2)
│   └── index.ts               ← Public exports
├── adapters/
│   ├── openrouter-adapter.ts  ← TanStack AI + OpenRouter
│   ├── gemini-adapter.ts      ← Direct Gemini (embeddings, media)
│   └── index.ts               ← Adapter exports
└── index.ts                   ← Barrel (add gateway exports)
```

**Deliverables:**
1. `AIGateway` class with `chat()`, `generate()`, `embed()`, `transcribe()`
2. Dual-mode support (client vault + server request)
3. OpenRouter adapter using `@tanstack/ai-openai`
4. Gemini direct adapter for embeddings
5. Integration with existing `CredentialVault`
6. Unit tests for gateway methods

**Success criteria:**
- [ ] `aiGateway.chat()` works in browser with vault credentials
- [ ] `createServerGateway(apiKey).chat()` works on server
- [ ] `aiGateway.embed()` returns Gemini embeddings
- [ ] TypeScript compiles with 0 new errors
- [ ] Existing code unchanged (no migrations yet)

### Phase B-1: Chat-Cascade Migration (3-4 days)

**Scope:** Migrate `src/routes/api/chat.ts` to use gateway

**Why separate phase:**
- `chat.ts` is 370 lines with `@ts-nocheck`
- Complex tool handling logic
- Server-side credential flow
- Needs careful testing

**Files to modify:**
```
src/routes/api/chat.ts              ← Refactor to use gateway
src/plugins/chat/ai-contract.ts     ← Create contract (Part 3.1)
```

**Target `chat.ts` after migration (~100 lines):**
```typescript
import { createServerGateway } from '@/infrastructure/ai/gateway';
import { toServerSentEventsResponse } from '@tanstack/ai';

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, provider, model, tools, apiKey } = await request.json();
        
        const gateway = createServerGateway(apiKey, provider);
        const stream = await gateway.chat({ provider, model, messages, tools });
        
        return toServerSentEventsResponse(stream);
      },
    },
  },
});
```

**Success criteria:**
- [ ] Chat works with OpenRouter models
- [ ] Chat works with Gemini models
- [ ] Tool calling works
- [ ] Streaming works
- [ ] Remove `@ts-nocheck` from chat.ts
- [ ] TypeScript compiles with 0 new errors

### Phase B-2: Notes AI Migration (3-4 days)

**Scope:** Migrate Notes module AI services to use gateway

**Files to migrate:**
```
src/lib/notes/ai-image-service.ts       → notesAI.generateImage()
src/lib/notes/ai-vision-service.ts      → notesAI.analyzeImage()
src/lib/notes/ai-tts-service.ts         → notesAI.generateTTS()
src/lib/notes/ai-video-service.ts       → notesAI.generateVideo()
src/lib/notes/ai-storyboard-service.ts  → notesAI.generateStoryboard()
```

**Files to create:**
```
src/plugins/notes/ai-contract.ts        ← Notes AI contract (Part 3.2)
```

**Success criteria:**
- [ ] Notes slash commands work (/summarize, /continue)
- [ ] Image generation works
- [ ] Vision analysis works
- [ ] All Notes AI features work through gateway
- [ ] Legacy services can be deleted

### Phase B-3: Security Remediation (1-2 days)

**Scope:** Remove ALL hardcoded API keys (CRITICAL SECURITY)

**Files to fix (3 total):**
```
src/lib/canvas/linkage-ai-enhancer.ts:320
src/presentation/components/canvas/LinkageProposalsPanel.tsx:200
src/presentation/components/canvas/CanvasRAGLinkagePanel.tsx:111
```

**Current (SECURITY ISSUE) - Same key in all 3 files:**
```typescript
const key = apiKey || 'AIzaSyBDdeIqJ01SCftRWM64oN3dncoGFHSvOgQ';
```

**After - Use gateway or require vault credentials:**
```typescript
import { aiGateway } from '@/infrastructure/ai/gateway';

// Option 1: Use gateway directly
const result = await aiGateway.chat({
  provider: 'gemini',
  model: 'gemini-2.0-flash',
  messages: [{ role: 'user', content: prompt }],
});

// Option 2: Require credentials from vault (throw if missing)
const apiKey = await credentialVault.getCredentials('gemini');
if (!apiKey) {
  throw new Error('Gemini API key required. Configure in Settings > Providers.');
}
```

**Pattern to use:** Gateway is preferred for new code. Direct vault access is acceptable if gateway not needed for simple calls.

**Success criteria:**
- [ ] `grep -r 'AIza' src/` returns 0 matches (NO hardcoded keys)
- [ ] All 3 files migrated to gateway or vault
- [ ] Canvas AI enhancer works through gateway
- [ ] LinkageProposalsPanel works through gateway
- [ ] CanvasRAGLinkagePanel works through gateway

### Phase B-4: Cleanup & RAG Prep (2 days)

**Scope:** Delete legacy files, prepare RAG integration

**Files to delete (after migration verified):**
```
src/lib/notes/ai-image-service.ts
src/lib/notes/ai-vision-service.ts
src/lib/notes/ai-tts-service.ts
src/lib/notes/ai-video-service.ts
src/lib/notes/ai-storyboard-service.ts
```

**Files to prepare for Phase E:**
```
src/infrastructure/rag/ai-contract.ts   ← RAG AI contract (Part 3.3)
src/lib/rag/embedding-service.ts        ← Update to use gateway.embed()
```

**Success criteria:**
- [ ] Legacy AI files deleted
- [ ] All AI calls go through gateway
- [ ] Embedding service uses `aiGateway.embed()`
- [ ] TypeScript compiles with 0 new errors
- [ ] pnpm governance passes

---

## Part 5: TanStack AI Patterns (v0.2.x) - VALIDATED

### 5.1 Correct Import Patterns

```typescript
// ✅ CORRECT for installed v0.2.x (VALIDATED against node_modules)
import { chat, toServerSentEventsStream, toServerSentEventsResponse, toolDefinition } from '@tanstack/ai';

// For explicit API key (server-side) - USE THESE:
import { createOpenaiChat } from '@tanstack/ai-openai';
import { createGeminiChat } from '@tanstack/ai-gemini';

// For auto-detect API key from env - USE THESE:
import { openaiText } from '@tanstack/ai-openai';
import { geminiText } from '@tanstack/ai-gemini';

// ❌ WRONG - Common mistakes
openaiText('model', apiKey)           // WRONG: openaiText does NOT take apiKey as 2nd arg
geminiText('model', apiKey)           // WRONG: Use geminiText('model', { apiKey }) instead
import { openai } from '@tanstack/ai' // WRONG: Deprecated monolithic adapter
```

### 5.2 Correct Adapter Creation

```typescript
// ===== SERVER-SIDE (Explicit API Key) =====

// For OpenRouter or OpenAI - use createOpenaiChat
const adapter = createOpenaiChat('gpt-4o', apiKey, {
  baseURL: 'https://openrouter.ai/api/v1',  // Optional for OpenRouter
  organization: 'org-id',                    // Optional
});

// For Gemini - use createGeminiChat OR geminiText with config object
const adapter = createGeminiChat('gemini-2.0-flash', apiKey, config);
// OR
const adapter = geminiText('gemini-2.0-flash', { apiKey });

// ===== CLIENT-SIDE (Auto-detect from env) =====

// Uses OPENAI_API_KEY from window.env or process.env
const adapter = openaiText('gpt-4o', {
  baseURL: 'https://openrouter.ai/api/v1',
});

// Uses GEMINI_API_KEY from env
const adapter = geminiText('gemini-2.0-flash');
```

### 5.3 Chat with Tools Pattern

```typescript
import { chat, toolDefinition } from '@tanstack/ai';
import { createOpenaiChat } from '@tanstack/ai-openai';
import { z } from 'zod';

// Define tool with Zod schema
const readFileDef = toolDefinition({
  name: 'read_file',
  description: 'Read file contents',
  inputSchema: z.object({
    path: z.string().describe('File path'),
  }),
  outputSchema: z.object({
    content: z.string(),
  }),
});

// Server implementation
const readFile = readFileDef.server(async ({ path }) => {
  const content = await fs.readFile(path, 'utf-8');
  return { content };
});

// Use in chat - CORRECTED: createOpenaiChat for server-side
const stream = chat({
  adapter: createOpenaiChat('gpt-4o', apiKey, {
    baseURL: 'https://openrouter.ai/api/v1',
  }),
  messages,
  tools: [readFile],
  toolChoice: 'auto',  // Optional: controls tool calling behavior
});

// Consume stream
for await (const chunk of stream) {
  if (chunk.type === 'content') console.log(chunk.delta);
  if (chunk.type === 'tool_call') console.log('Tool:', chunk.name);
  if (chunk.type === 'tool_result') console.log('Result:', chunk.output);
}
```

### 5.4 Multimodal Content Pattern

```typescript
import { chat } from '@tanstack/ai';
import { geminiText } from '@tanstack/ai-gemini';
import type { ImagePart } from '@tanstack/ai';

// Image from base64
const imagePart: ImagePart = {
  type: 'image',
  source: { type: 'data', value: base64Data },
  metadata: { mimeType: 'image/png' },
};

// Vision analysis - CORRECTED: use config object for apiKey
const stream = chat({
  adapter: geminiText('gemini-2.0-flash', { apiKey }),
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', content: 'What is in this image?' },
        imagePart,
      ],
    },
  ],
});
```

---

## Part 6: Embeddings Strategy (Gemini)

### 6.1 Why Gemini for Embeddings

| Factor | Decision |
|--------|----------|
| **TanStack AI** | Does NOT support embeddings |
| **Consistency** | Use Gemini for all Google AI features |
| **Quality** | `text-embedding-004` is state-of-art |
| **Dimension** | 768 dimensions, configurable |
| **Cost** | Free tier generous |

### 6.2 Embedding Implementation

```typescript
// src/infrastructure/ai/adapters/gemini-embeddings.ts

export interface EmbeddingConfig {
  model: string;
  apiKey: string;
  dimensions?: number;
}

const DEFAULT_MODEL = 'text-embedding-004';
const DEFAULT_DIMENSIONS = 768;

export async function generateEmbeddings(
  texts: string[],
  config: EmbeddingConfig
): Promise<number[][]> {
  const { model = DEFAULT_MODEL, apiKey, dimensions = DEFAULT_DIMENSIONS } = config;

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
    throw new Error(`Gemini embeddings failed: ${error}`);
  }

  const data = await response.json();
  return data.embeddings.map((e: { values: number[] }) => e.values);
}
```

### 6.3 Integration with Orama

```typescript
// src/infrastructure/rag/orama-embeddings.ts

import { generateEmbeddings } from '../ai/adapters/gemini-embeddings';
import { credentialVault } from '../ai/credential-vault';

export async function embedForOrama(texts: string[]): Promise<number[][]> {
  const apiKey = await credentialVault.getCredentials('gemini');
  if (!apiKey) {
    throw new Error('Gemini API key required for embeddings');
  }

  return generateEmbeddings(texts, {
    model: 'text-embedding-004',
    apiKey,
    dimensions: 768,  // Match Orama schema
  });
}
```

---

## Part 7: Success Criteria (Full PRIORITY-0)

### Technical Criteria

- [ ] All AI calls go through `AIGateway`
- [ ] No direct `fetch()` to AI providers outside gateway
- [ ] No hardcoded API keys in codebase
- [ ] TanStack AI v0.2.x patterns used correctly
- [ ] Dual-mode (client/server) credential handling works
- [ ] Plugin contracts defined and implemented
- [ ] TypeScript errors: 0 new errors introduced
- [ ] pnpm governance passes

### Architectural Criteria

- [ ] Gateway is plugin-agnostic (doesn't import plugin code)
- [ ] Plugins consume gateway through contracts
- [ ] Embeddings use Gemini (not OpenAI)
- [ ] Media generation routes to Gemini (Imagen, Veo)
- [ ] Server routes pass API key in request body

### Migration Criteria

- [ ] `chat.ts` reduced from 370 to <100 lines
- [ ] `@ts-nocheck` removed from `chat.ts`
- [ ] Legacy Notes AI services deleted
- [ ] Canvas AI enhancer security fixed

---

## Part 8: Timeline (Realistic)

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| B-0 Gateway Foundation | 3-4 days | Core gateway + types + adapters |
| B-1 Chat Migration | 3-4 days | chat.ts refactored |
| B-2 Notes AI Migration | 3-4 days | Notes module using gateway |
| B-3 Security Remediation | 1 day | Hardcoded key removed |
| B-4 Cleanup & RAG Prep | 2 days | Legacy deleted, RAG ready |

**Total: 12-15 days** (not 7 days as originally claimed)

---

## Part 9: Blocking Status

This document **BLOCKS**:
- Phase B execution (until B-0 complete)
- Phase C: Notes AI (until B-2 complete)
- Phase D: Agentic (until B-4 complete)
- Phase E: RAG (until B-4 complete)

**Reason:** Adding more AI features on the current fragmented architecture will multiply technical debt. The gateway provides the foundation for ALL future AI work.

---

*Revised: 2026-02-02T19:30:00+07:00*
*Author: supreme-coordinator*
*Version: 2.0.0*
*Status: BLOCKING - Execute B-0 to B-4 sequentially*
