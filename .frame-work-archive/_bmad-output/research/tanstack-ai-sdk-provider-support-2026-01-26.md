# TanStack AI SDK Provider Support & Integration Patterns

**Date**: 2026-01-26  
**Version**: 1.0.0  
**Research Method**: TanStack AI Official Documentation (via tanstack.com)  
**Researcher**: analyst-ext (subagent)  
**Status**: ✅ COMPLETE

---

## Executive Summary

TanStack AI SDK is a **provider-agnostic**, **type-safe** SDK for building AI-powered applications with a unified interface across multiple AI providers. It enables **zero-vendor-lock-in** by using pluggable adapter system, allowing developers to switch between OpenAI, Anthropic, Gemini, and other providers **without code changes**.

**Key Findings**:
- ✅ **6 Official Adapters** available (OpenAI, Anthropic, Gemini, OpenRouter, Ollama, Grok/xAI)
- ✅ **Unified API** - Write logic once, switch providers at runtime
- ✅ **Full TypeScript Support** - End-to-end type safety across providers
- ✅ **Tree-shakeable** - Import only what you need for optimal bundle size
- ✅ **Isomorphic Tools** - Server/client tool definitions with approval workflows
- ⚠️ **No direct SDK imports** - Must use TanStack adapter pattern (prohibited to import `@anthropic-ai/sdk`, `openai`, etc. directly)

---

## 1. Official Provider Support Matrix

### 1.1 Core Adapters (Officially Supported)

| Provider | Package | Adapter Function | Status | Multimodal | Tool Calling | Streaming |
|----------|---------|-----------------|--------|------------|--------------|------------|
| **OpenAI** | `@tanstack/ai-openai` | `openai()` | ✅ Stable | ✅ Text + Image | ✅ Full Support | ✅ SSE + HTTP |
| **Anthropic** | `@tanstack/ai-anthropic` | `anthropic()` | ✅ Stable | ✅ Text + Image + PDF | ✅ Full Support | ✅ SSE + HTTP |
| **Google Gemini** | `@tanstack/ai-gemini` | `gemini()` | ✅ Stable | ✅ Text + Image + Audio + Video + Document | ✅ Full Support | ✅ SSE + HTTP |
| **OpenRouter** | `@tanstack/ai-openrouter` | `openrouter()` | ✅ Stable | ✅ Provider-dependent | ✅ Full Support | ✅ SSE + HTTP |
| **Ollama** | `@tanstack/ai-ollama` | `ollama()` | ✅ Stable | ✅ Text + Image (model-dependent) | ✅ Full Support | ✅ SSE + HTTP |
| **Grok/xAI** | `@tanstack/ai-grok` | `grok()` | ✅ Stable | ✅ Provider-dependent | ✅ Full Support | ✅ SSE + HTTP |

### 1.2 Community Adapters

| Provider | Package | Adapter Function | Status |
|----------|---------|-----------------|--------|
| **Cencori** | Community | `cencori()` | 🔄 Beta |
| **Decart** | Community | `decart()` | 🔄 Beta |

---

## 2. Adapter Patterns & Configuration

### 2.1 Standard Adapter Pattern

All adapters follow a **unified interface** pattern:

```typescript
import { chat } from '@tanstack/ai';
import { <ProviderAdapter> } from '@tanstack/ai-<provider>';

const adapter = <ProviderAdapter>({
  apiKey: process.env.<PROVIDER>_API_KEY!,
  // Provider-specific options
});

const stream = chat({
  adapter,
  messages,
  model: '<model-name>',
});
```

### 2.2 Provider-Specific Configuration

#### 2.2.1 OpenAI

```typescript
import { openai, type OpenAIConfig } from '@tanstack/ai-openai';

const config: OpenAIConfig = {
  apiKey: process.env.OPENAI_API_KEY!,
  organization: 'org-...', // Optional
  baseURL: 'https://api.openai.com/v1', // Optional, for custom endpoints
};

const adapter = openai(config);

// Available Models:
// Chat: gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo
// Image: dall-e-3, dall-e-2
// Embedding: text-embedding-3-large, text-embedding-3-small, text-embedding-ada-002
```

**Provider-Specific Options**:
```typescript
providerOptions: {
  temperature: 0.7,
  maxTokens: 1000,
  topP: 0.9,
  frequencyPenalty: 0.5,
  presencePenalty: 0.5,
  reasoning: {
    effort: 'medium', // "minimal" | "low" | "medium" | "high"
  }
}
```

**Reasoning Support** (gpt-5, o3 models):
```typescript
providerOptions: {
  reasoning: {
    effort: 'medium', // "minimal" | "low" | "medium" | "high"
  }
}
// Model's reasoning streams as separate ThinkingPart chunks
```

#### 2.2.2 Anthropic

```typescript
import { anthropic, type AnthropicConfig } from '@tanstack/ai-anthropic';

const config: AnthropicConfig = {
  apiKey: process.env.ANTHROPIC_API_KEY!,
};

const adapter = anthropic(config);

// Available Models:
// Chat: claude-3-5-sonnet-20241022, claude-3-opus-20240229,
//       claude-3-sonnet-20240229, claude-3-haiku-20240307,
//       claude-2.1, claude-2.0
```

**Provider-Specific Options**:
```typescript
providerOptions: {
  thinking: {
    type: 'enabled',
    budgetTokens: 1000, // Maximum tokens for reasoning
  },
  cacheControl: {
    type: 'ephemeral',
    ttl: '5m', // Cache TTL: '5m' or '1h'
  },
  sendReasoning: true,
}
```

**Extended Thinking** (claude-sonnet-4-5-20250929+):
```typescript
providerOptions: {
  thinking: {
    type: 'enabled',
    budgetTokens: 2048, // Maximum tokens for thinking
  }
}
// maxTokens must be greater than budget_tokens
// Adapter automatically adjusts max_tokens if needed
```

#### 2.2.3 Google Gemini

```typescript
import { gemini, type GeminiConfig } from '@tanstack/ai-gemini';

const config: GeminiConfig = {
  apiKey: process.env.GOOGLE_GEMINI_API_KEY!,
};

const adapter = gemini(config);

// Available Models:
// gemini-1.5-pro, gemini-1.5-flash: text, image, audio, video, document
// gemini-2.0-flash: text, image, audio, video, document
```

**Multimodal Metadata**:
```typescript
const message = {
  role: 'user',
  content: [
    { type: 'text', content: 'Analyze this image' },
    {
      type: 'image',
      source: { type: 'data', value: imageBase64 },
      metadata: { mimeType: 'image/png' }
    }
  ]
}
```

#### 2.2.4 OpenRouter

```typescript
import { openrouter, type OpenRouterConfig } from '@tanstack/ai-openrouter';

const config: OpenRouterConfig = {
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: 'https://openrouter.ai/api/v1', // Default endpoint
};

const adapter = openrouter(config);

// Supports models from all providers through OpenRouter's unified API
```

#### 2.2.5 Ollama

```typescript
import { ollama } from '@tanstack/ai-ollama';

const adapter = ollama('http://localhost:11434');

// Model support varies by Ollama-hosted models
// Images supported in compatible models
```

#### 2.2.6 Grok/xAI

```typescript
import { grok } from '@tanstack/ai-grok';

const adapter = grok({
  apiKey: process.env.GROK_API_KEY!,
});

// Accesses xAI's Grok models
```

---

## 3. Multimodal Content Handling

### 3.1 Content Parts Structure

TanStack AI uses a unified `ContentPart` type for multimodal content:

```typescript
import type { ContentPart, ImagePart, TextPart, DocumentPart, AudioPart, VideoPart } from '@tanstack/ai';

// Text content
const textPart: TextPart = {
  type: 'text',
  content: 'What do you see in this image?'
}

// Image from base64 data
const imagePart: ImagePart = {
  type: 'image',
  source: {
    type: 'data',
    value: 'base64EncodedImageData...'
  },
  metadata: {
    // Provider-specific metadata
    detail: 'high' // OpenAI detail level
  }
}

// Image from URL
const imageUrlPart: ImagePart = {
  type: 'image',
  source: {
    type: 'url',
    value: 'https://example.com/image.jpg'
  }
}

// Document (PDF)
const documentPart: DocumentPart = {
  type: 'document',
  source: {
    type: 'data',
    value: pdfBase64
  }
}
```

### 3.2 Provider Multimodal Support Matrix

| Provider | Text | Image | Audio | Video | Document (PDF) | Source Types |
|----------|------|-------|-------|-------|----------------|--------------|
| **OpenAI** | ✅ | ✅ | ✅ (gpt-5.2-audio-preview) | ❌ | ❌ | Data, URL |
| **Anthropic** | ✅ | ✅ | ❌ | ❌ | ✅ (Claude 3.5+) | Data, URL |
| **Gemini** | ✅ | ✅ | ✅ | ✅ | ✅ | Data, URL |
| **Ollama** | ✅ | ✅ (model-dependent) | ❌ | ❌ | ❌ | Data, URL (varies) |
| **OpenRouter** | ✅ | Provider-dependent | Provider-dependent | Provider-dependent | Provider-dependent | Varies |
| **Grok** | ✅ | Provider-dependent | ❌ | ❌ | ❌ | Varies |

### 3.3 Provider-Specific Metadata

#### OpenAI
```typescript
const imageMessage = {
  role: 'user',
  content: [
    { type: 'text', content: 'Describe this image' },
    {
      type: 'image',
      source: { type: 'data', value: imageBase64 },
      metadata: { 
        detail: 'high' // 'auto' | 'low' | 'high'
      }
    }
  ]
}
```

#### Anthropic
```typescript
const imageMessage = {
  role: 'user',
  content: [
    { type: 'text', content: 'What do you see?' },
    {
      type: 'image',
      source: { type: 'data', value: imageBase64 },
      metadata: { 
        media_type: 'image/jpeg'
      }
    }
  ]
}
```

#### Gemini
```typescript
const imageMessage = {
  role: 'user',
  content: [
    { type: 'text', content: 'Analyze this image' },
    {
      type: 'image',
      source: { type: 'data', value: imageBase64 },
      metadata: { 
        mimeType: 'image/png'
      }
    }
  ]
}
```

### 3.4 Using Multimodal Content

```typescript
import { chat } from '@tanstack/ai';
import { gemini } from '@tanstack/ai-gemini';

const adapter = gemini();

const response = await chat({
  adapter,
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', content: 'What is in this image?' },
        {
          type: 'image',
          source: {
            type: 'url',
            value: 'https://example.com/photo.jpg'
          }
        }
      ]
    }
  ]
});
```

**Backward Compatibility**:
```typescript
// String content still works
const message = {
  role: 'user',
  content: 'Hello, world!'
};

// Multimodal with array
const multimodalMessage = {
  role: 'user',
  content: [
    { type: 'text', content: 'Hello, world!' },
    { type: 'image', source: { type: 'url', value: '...' } }
  ]
};
```

---

## 4. Tool Calling Support

### 4.1 Tool Definition Pattern

Tools are defined **once** and can execute on **server** or **client**:

```typescript
import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';

// Step 1: Define tool schema
const getWeatherDef = toolDefinition({
  name: 'get_weather',
  description: 'Get the current weather for a location',
  inputSchema: z.object({
    location: z.string(),
    unit: z.enum(['celsius', 'fahrenheit']).default('celsius'),
  }),
  outputSchema: z.object({
    temperature: z.number(),
    conditions: z.string(),
    humidity: z.number().optional(),
  }),
  needsApproval: false, // Set to true for sensitive operations
});

// Step 2a: Server-side implementation
const getWeatherServer = getWeatherDef.server(async ({ location, unit }) => {
  // Secure server execution
  const data = await fetchWeatherAPI(location, unit);
  return data;
});

// Step 2b: Client-side implementation
const getWeatherClient = getWeatherDef.client(async ({ location, unit }) => {
  // Browser-based execution
  return { temperature: 72, conditions: 'sunny', humidity: 45 };
});
```

### 4.2 Tool Approval Flow

For sensitive operations (sending emails, making purchases, deleting data):

```typescript
const sendEmailDef = toolDefinition({
  name: 'send_email',
  description: 'Send an email to a recipient',
  inputSchema: z.object({
    to: z.string().email(),
    subject: z.string(),
    body: z.string(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    messageId: z.string(),
  }),
  needsApproval: true, // This tool requires approval
});

const sendEmail = sendEmailDef.server(async ({ to, subject, body }) => {
  // Only executes if approved
  await emailService.send({ to, subject, body });
  return { success: true, messageId: '...' };
});
```

**Tool States**:
1. **`approval-requested`** - Waiting for user approval
2. **`executing`** - Approved, now executing
3. **`output-available`** - Execution completed
4. **`output-error`** - Execution failed
5. **`cancelled`** - User denied approval

**Client-Side Approval Handling**:
```typescript
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react';

function ChatComponent() {
  const { messages, addToolApprovalResponse } = useChat({
    connection: fetchServerSentEvents('/api/chat'),
  });

  return (
    <div>
      {messages.map((message) => (
        <div key={message.id}>
          {message.parts.map((part) => {
            if (part.type === 'tool-call' && part.state === 'approval-requested') {
              return (
                <div key={part.id} className='approval-prompt'>
                  <p>Approve: {part.name}</p>
                  <pre>{JSON.stringify(part.arguments, null, 2)}</pre>
                  <button onClick={() => addToolApprovalResponse({
                    id: part.approval.id,
                    approved: true,
                  })}>
                    Approve
                  </button>
                  <button onClick={() => addToolApprovalResponse({
                    id: part.approval.id,
                    approved: false,
                  })}>
                    Deny
                  </button>
                </div>
              );
            }
            // ... render other parts
          })}
        </div>
      ))}
    </div>
  );
}
```

### 4.3 Using Tools in Chat

```typescript
import { chat } from '@tanstack/ai';
import { openai } from '@tanstack/ai-openai';
import { getWeatherServer } from './tools';

export async function POST(request: Request) {
  const { messages } = await request.json();

  const adapter = openai({ apiKey: process.env.OPENAI_API_KEY! });

  const stream = chat({
    adapter,
    messages,
    model: 'gpt-4o',
    tools: [getWeatherServer],
  });

  return toServerSentEventsResponse(stream);
}
```

---

## 5. Streaming Implementation Patterns

### 5.1 Stream Chunk Types

TanStack AI streams multiple chunk types:

- **`content`** - Text content being generated
- **`thinking`** - Model's internal reasoning process (when supported)
- **`tool-call`** - When model calls a tool
- **`tool-result`** - Results from tool execution
- **`done`** - Stream completion

### 5.2 Server-Side Streaming

```typescript
import { chat, toServerSentEventsResponse } from '@tanstack/ai';
import { openai } from '@tanstack/ai-openai';

export async function POST(request: Request) {
  const { messages } = await request.json();

  const stream = chat({
    adapter: openai({ apiKey: process.env.OPENAI_API_KEY! }),
    messages,
    model: 'gpt-4o',
  });

  return toServerSentEventsResponse(stream);
}
```

### 5.3 Client-Side Streaming (React)

```typescript
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react';

function ChatComponent() {
  const { messages, sendMessage, isLoading } = useChat({
    connection: fetchServerSentEvents('/api/chat'),
  });

  return (
    <div>
      {messages.map((message) => (
        <div key={message.id}>
          {message.content}
        </div>
      ))}
      <button onClick={() => sendMessage('Hello!')} disabled={isLoading}>
        Send
      </button>
    </div>
  );
}
```

### 5.4 Connection Adapters

#### Server-Sent Events (SSE)
```typescript
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react';

const { messages } = useChat({
  connection: fetchServerSentEvents('/api/chat'),
});
```

#### HTTP Stream
```typescript
import { useChat, fetchHttpStream } from '@tanstack/ai-react';

const { messages } = useChat({
  connection: fetchHttpStream('/api/chat'),
});
```

#### Custom Stream
```typescript
import { stream } from '@tanstack/ai-react';

const { messages } = useChat({
  connection: stream(async (messages, data, signal) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, ...data }),
      signal,
    });
    return processStream(response);
  }),
});
```

### 5.5 Monitoring Stream Progress

```typescript
const { messages } = useChat({
  connection: fetchServerSentEvents('/api/chat'),
  onChunk: (chunk) => {
    console.log('Received chunk:', chunk);
  },
  onFinish: (message) => {
    console.log('Stream finished:', message);
  },
});
```

### 5.6 Cancelling Streams

```typescript
const { stop } = useChat({
  connection: fetchServerSentEvents('/api/chat'),
});

// Cancel current stream
stop();
```

---

## 6. Type Safety & Validation

### 6.1 Provider-Specific Metadata Types

```typescript
import type {
  ContentPart,
  ImagePart,
  DocumentPart,
  AudioPart,
  VideoPart,
  TextPart
} from '@tanstack/ai';

// Provider-specific metadata types
import type { OpenAIImageMetadata } from '@tanstack/ai-openai';
import type { AnthropicImageMetadata } from '@tanstack/ai-anthropic';
import type { GeminiMediaMetadata } from '@tanstack/ai-gemini';
```

### 6.2 Message Type Safety

When receiving messages from external sources, use `assertMessages` to restore type safety:

```typescript
import { chat, assertMessages } from '@tanstack/ai';
import { openai } from '@tanstack/ai-openai';

// In an API route handler
const { messages: incomingMessages } = await request.json();

const adapter = openai('gpt-5.2');

// Assert incoming messages are compatible with gpt-5.2 (text + image only)
const typedMessages = assertMessages({ adapter }, incomingMessages);

// Now TypeScript will properly check any additional messages you add
const stream = chat({
  adapter,
  messages: [
    ...typedMessages,
    {
      role: 'user',
      content: [
        { type: 'text', content: 'What do you see?' },
        { type: 'image', source: { type: 'url', value: '...' } }
      ]
    }
  ]
});
```

**Note**: `assertMessages` is a type-level assertion only. It does not perform runtime validation. For runtime validation, use a schema validation library like Zod.

---

## 7. Direct SDK Usage Policy

### 7.1 Prohibited Imports

⚠️ **CRITICAL**: Direct SDK imports are **PROHIBITED** in TanStack AI architecture.

**DO NOT use**:
```typescript
// ❌ PROHIBITED - Direct OpenAI SDK
import OpenAI from 'openai';

// ❌ PROHIBITED - Direct Anthropic SDK
import Anthropic from '@anthropic-ai/sdk';

// ❌ PROHIBITED - Direct Google AI SDK
import { GoogleGenerativeAI } from '@google/generative-ai';
```

### 7.2 Required TanStack Pattern

**MUST use** TanStack adapter pattern:
```typescript
// ✅ CORRECT - TanStack Adapter Pattern
import { chat } from '@tanstack/ai';
import { openai } from '@tanstack/ai-openai';
import { anthropic } from '@tanstack/ai-anthropic';
import { gemini } from '@tanstack/ai-gemini';

// Switch providers without changing application logic
const adapters = {
  openai: openai({ apiKey: process.env.OPENAI_API_KEY! }),
  anthropic: anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! }),
  gemini: gemini({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! }),
};

const adapter = adapters[provider]; // Runtime provider switching

const stream = chat({
  adapter,
  messages,
  model: 'gpt-4o', // Or provider-specific model
});
```

### 7.3 Rationale for Prohibition

1. **Vendor Lock-in**: Direct SDKs create dependency on specific provider
2. **API Fragmentation**: Different SDKs have different interfaces
3. **Loss of Type Safety**: TanStack cannot enforce cross-provider type safety
4. **Feature Parity**: TanStack provides unified features (approval, streaming, multimodal) that direct SDKs lack
5. **Runtime Switching**: Direct SDKs prevent runtime provider changes

---

## 8. Configuration Examples

### 8.1 Runtime Provider Switching

```typescript
import { chat } from '@tanstack/ai';
import { openai } from '@tanstack/ai-openai';
import { anthropic } from '@tanstack/ai-anthropic';

// Configure adapters
const adapters = {
  openai: openai({ 
    apiKey: process.env.OPENAI_API_KEY!,
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
  }),
  anthropic: anthropic({ 
    apiKey: process.env.ANTHROPIC_API_KEY!,
  }),
};

// Runtime provider selection
function createStream(provider: 'openai' | 'anthropic', messages, model) {
  const adapter = adapters[provider];
  return chat({ adapter, messages, model });
}

// Usage
const openaiStream = createStream('openai', messages, 'gpt-4o');
const anthropicStream = createStream('anthropic', messages, 'claude-3-5-sonnet-20241022');
```

### 8.2 Tree-shakeable Imports

Import only what you need for optimal bundle size:

```typescript
// ✅ CORRECT - Tree-shakeable
import { openaiText } from '@tanstack/ai-openai/adapters';
import { chat } from '@tanstack/ai';

const adapter = openaiText();

// ❌ AVOID - Bundles everything
import { openai } from '@tanstack/ai-openai';
import { chat } from '@tanstack/ai';
```

**Available tree-shakeable imports**:
- `openaiText` - Chat completion
- `openaiEmbed` - Embeddings
- `openaiSummarize` - Summarization
- `anthropicText` - Chat completion
- `geminiText` - Chat completion
- `ollamaText` - Chat completion
- And more...

### 8.3 Environment Variables

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Google Gemini
GOOGLE_GEMINI_API_KEY=...

# OpenRouter
OPENROUTER_API_KEY=sk-or-...

# Ollama (optional)
OLLAMA_BASE_URL=http://localhost:11434

# Grok/xAI
GROK_API_KEY=...
```

---

## 9. Integration Patterns

### 9.1 Server-Side Integration (TanStack Start/Next.js)

```typescript
// app/api/chat/route.ts
import { chat, toServerSentEventsResponse } from '@tanstack/ai';
import { openai } from '@tanstack/ai-openai';
import { getWeather } from './tools';

export async function POST(request: Request) {
  const { messages, model = 'gpt-4o' } = await request.json();

  const adapter = openai({ 
    apiKey: process.env.OPENAI_API_KEY! 
  });

  const stream = chat({
    adapter,
    messages,
    model,
    tools: [getWeather],
  });

  return toServerSentEventsResponse(stream);
}
```

### 9.2 Client-Side Integration (React)

```typescript
// app/components/Chat.tsx
'use client';

import { useChat, fetchServerSentEvents } from '@tanstack/ai-react';

export function Chat() {
  const { messages, sendMessage, isLoading, addToolApprovalResponse } = useChat({
    connection: fetchServerSentEvents('/api/chat'),
  });

  const handleApproveTool = (approvalId: string) => {
    addToolApprovalResponse({ id: approvalId, approved: true });
  };

  const handleDenyTool = (approvalId: string) => {
    addToolApprovalResponse({ id: approvalId, approved: false });
  };

  return (
    <div>
      {messages.map((message) => (
        <div key={message.id}>
          {message.content}
          {message.parts?.map((part) => 
            part.type === 'tool-call' && part.state === 'approval-requested' ? (
              <div key={part.id}>
                <p>Execute {part.name}?</p>
                <pre>{JSON.stringify(part.arguments, null, 2)}</pre>
                <button onClick={() => handleApproveTool(part.approval.id)}>
                  Approve
                </button>
                <button onClick={() => handleDenyTool(part.approval.id)}>
                  Deny
                </button>
              </div>
            ) : null
          )}
        </div>
      ))}
      <button onClick={() => sendMessage('Hello!')} disabled={isLoading}>
        Send
      </button>
    </div>
  );
}
```

### 9.3 Provider Configuration Management

```typescript
// lib/ai/config.ts
import { openai } from '@tanstack/ai-openai';
import { anthropic } from '@tanstack/ai-anthropic';
import { gemini } from '@tanstack/ai-gemini';

export const aiConfig = {
  openai: openai({ apiKey: process.env.OPENAI_API_KEY! }),
  anthropic: anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! }),
  gemini: gemini({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! }),
};

export type Provider = keyof typeof aiConfig;

export function getAdapter(provider: Provider) {
  return aiConfig[provider];
}
```

```typescript
// app/api/chat/route.ts
import { chat, toServerSentEventsResponse } from '@tanstack/ai';
import { getAdapter, type Provider } from '@/lib/ai/config';

export async function POST(request: Request) {
  const { 
    messages, 
    provider = 'openai', 
    model = 'gpt-4o' 
  } = await request.json();

  const adapter = getAdapter(provider as Provider);

  const stream = chat({ adapter, messages, model });

  return toServerSentEventsResponse(stream);
}
```

---

## 10. Best Practices for 2026

### 10.1 Provider Selection

1. **OpenAI** - Best for:
   - General-purpose chat
   - Advanced reasoning (gpt-5, o3 models)
   - Image generation (DALL-E)
   - Audio transcription (gpt-5.2-audio-preview)

2. **Anthropic** - Best for:
   - Complex reasoning with transparency (thinking)
   - Long context windows (200K tokens)
   - Document analysis (PDF support)
   - Code generation

3. **Gemini** - Best for:
   - Multimodal (image + audio + video + documents)
   - Fast, cost-effective models (flash)
   - Media-rich applications

4. **OpenRouter** - Best for:
   - Access to multiple providers through one API
   - Cost optimization across providers
   - Provider redundancy

### 10.2 Tool Definition Guidelines

1. **Define schemas with Zod** for type safety
2. **Use `needsApproval`** for sensitive operations
3. **Separate server/client implementations** for isomorphic execution
4. **Provide clear descriptions** for model context
5. **Handle errors gracefully** in tool implementations

### 10.3 Streaming Best Practices

1. **Use SSE for real-time chat experiences**
2. **Handle loading states** with `isLoading`
3. **Cancel streams on unmount** to prevent memory leaks
4. **Monitor chunk types** (content, thinking, tool calls)
5. **Display partial content** as it streams

### 10.4 Multimodal Guidelines

1. **Use `data` source** for small files or inline content
2. **Use `url` source** for large files or hosted content
3. **Include metadata** (mimeType, detail) for model processing
4. **Check model support** before sending multimodal content
5. **Handle provider-specific metadata** correctly

### 10.5 Type Safety

1. **Use `assertMessages`** for dynamic message validation
2. **Leverage provider-specific metadata types**
3. **Avoid `any` types** in message handling
4. **Use Zod schemas** for runtime validation
5. **Let TypeScript enforce** multimodal content constraints

---

## 11. Gaps vs Direct SDK Usage

### 11.1 What TanStack AI Provides

✅ **Unified API** - Single interface across all providers
✅ **Runtime Provider Switching** - Change providers without code changes
✅ **Type Safety** - End-to-end TypeScript types
✅ **Tool Approval** - Built-in user approval workflows
✅ **Multimodal Abstraction** - Unified content parts
✅ **Streaming** - Consistent streaming across providers
✅ **Isomorphic Tools** - Server/client tool definitions
✅ **Thinking Support** - Model reasoning display (Anthropic, OpenAI o3/gpt-5)

### 11.2 Potential Gaps

⚠️ **Provider-Specific Features** - Some provider-specific features may not be exposed yet:
   - Anthropic: Prompt caching details (partially exposed)
   - OpenAI: Advanced vision options (partially exposed)
   - Gemini: Some experimental features

⚠️ **Advanced Provider Configuration** - Some advanced configs may require:
   - Custom HTTP options (timeouts, retries)
   - Custom authentication (JWT, etc.)
   - Advanced streaming options

⚠️ **Edge Cases** - Rare provider-specific edge cases may need direct SDK workaround

### 11.3 When to Consider Direct SDK

Only consider direct SDK if:

1. **Critical Provider-Specific Feature** - Essential feature not exposed by TanStack
2. **Provider-Specific Optimization** - Performance optimization requiring low-level control
3. **Legacy Integration** - Existing code using direct SDK

**Recommended Approach**: Use TanStack SDK for 95% of cases, create adapter pattern for remaining 5%

---

## 12. Migration Guide

### 12.1 From Direct OpenAI SDK

**Before (Direct SDK)**:
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

**After (TanStack AI)**:
```typescript
import { chat } from '@tanstack/ai';
import { openai } from '@tanstack/ai-openai';

const adapter = openai({ apiKey: process.env.OPENAI_API_KEY! });

const stream = chat({
  adapter,
  messages: [{ role: 'user', content: 'Hello!' }],
  model: 'gpt-4o',
});

for await (const chunk of stream) {
  console.log(chunk);
}
```

### 12.2 From Direct Anthropic SDK

**Before (Direct SDK)**:
```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const response = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

**After (TanStack AI)**:
```typescript
import { chat } from '@tanstack/ai';
import { anthropic } from '@tanstack/ai-anthropic';

const adapter = anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const stream = chat({
  adapter,
  messages: [{ role: 'user', content: 'Hello!' }],
  model: 'claude-3-5-sonnet-20241022',
});

for await (const chunk of stream) {
  console.log(chunk);
}
```

---

## 13. Conclusion

TanStack AI SDK provides a **robust, provider-agnostic** abstraction for building AI-powered applications in 2026. With **6 official adapters**, full **multimodal support**, **isomorphic tools**, and **unified streaming**, it eliminates vendor lock-in while maintaining type safety and developer productivity.

**Key Advantages**:
- ✅ **Zero vendor lock-in** - Switch providers without code changes
- ✅ **Full TypeScript support** - End-to-end type safety
- ✅ **Unified API** - Single interface for all providers
- ✅ **Advanced features** - Tool approval, thinking, multimodal
- ✅ **Tree-shakeable** - Optimal bundle size

**Recommendation**: Use TanStack AI SDK for all new AI integrations. Only consider direct SDK for critical provider-specific features not yet exposed by TanStack.

---

## 14. References

### 14.1 Official Documentation

- **TanStack AI Docs**: https://tanstack.com/ai/latest/docs
- **OpenAI Adapter**: https://tanstack.com/ai/latest/docs/adapters/openai
- **Anthropic Adapter**: https://tanstack.com/ai/latest/docs/adapters/anthropic
- **Gemini Adapter**: https://tanstack.com/ai/latest/docs/adapters/gemini
- **OpenRouter Adapter**: https://tanstack.com/ai/latest/docs/adapters/openrouter
- **Ollama Adapter**: https://tanstack.com/ai/latest/docs/adapters/ollama
- **Grok/xAI Adapter**: https://tanstack.com/ai/latest/docs/adapters/grok

### 14.2 Core Documentation

- **Streaming Guide**: https://tanstack.com/ai/latest/docs/guides/streaming
- **Multimodal Content**: https://tanstack.com/ai/latest/docs/guides/multimodal-content
- **Tools Guide**: https://tanstack.com/ai/latest/docs/guides/tools
- **Tool Approval Flow**: https://tanstack.com/ai/latest/docs/guides/tool-approval
- **Server Tools**: https://tanstack.com/ai/latest/docs/guides/server-tools
- **Client Tools**: https://tanstack.com/ai/latest/docs/guides/client-tools
- **Migration Guide**: https://tanstack.com/ai/latest/docs/guides/migration

### 14.3 GitHub Repository

- **TanStack AI**: https://github.com/TanStack/ai

### 14.4 Community Resources

- **TanStack AI Blog**: https://betterstack.com/community/guides/ai/tanstack-ai/
- **Discord**: https://tlinz.com/discord
- **Twitter**: https://x.com/tan_stack

---

## Appendix A: Complete Configuration Examples

### A.1 OpenAI with Tools and Streaming

```typescript
import { chat, toServerSentEventsResponse, toolDefinition } from '@tanstack/ai';
import { openai } from '@tanstack/ai-openai';
import { z } from 'zod';

// Tool definition
const searchDocsDef = toolDefinition({
  name: 'search_docs',
  description: 'Search the documentation',
  inputSchema: z.object({
    query: z.string(),
    limit: z.number().default(5),
  }),
  outputSchema: z.object({
    results: z.array(z.object({
      title: z.string(),
      url: z.string(),
      snippet: z.string(),
    })),
  }),
});

const searchDocs = searchDocsDef.server(async ({ query, limit }) => {
  const results = await searchEngine.query(query, limit);
  return { results };
});

// API route
export async function POST(request: Request) {
  const { messages } = await request.json();

  const adapter = openai({
    apiKey: process.env.OPENAI_API_KEY!,
  });

  const stream = chat({
    adapter,
    messages,
    model: 'gpt-4o',
    tools: [searchDocs],
    providerOptions: {
      temperature: 0.7,
      maxTokens: 1000,
    },
  });

  return toServerSentEventsResponse(stream);
}
```

### A.2 Anthropic with Multimodal and Thinking

```typescript
import { chat, toServerSentEventsResponse } from '@tanstack/ai';
import { anthropic } from '@tanstack/ai-anthropic';

export async function POST(request: Request) {
  const { imageBase64, question } = await request.json();

  const adapter = anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  const stream = chat({
    adapter,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', content: question },
          {
            type: 'image',
            source: {
              type: 'data',
              value: imageBase64,
            },
            metadata: {
              media_type: 'image/jpeg',
            },
          },
        ],
      },
    ],
    model: 'claude-3-5-sonnet-20241022',
    providerOptions: {
      thinking: {
        type: 'enabled',
        budgetTokens: 2048,
      },
    },
  });

  return toServerSentEventsResponse(stream);
}
```

### A.3 Gemini with Video and Audio

```typescript
import { chat } from '@tanstack/ai';
import { gemini } from '@tanstack/ai-gemini';

export async function POST(request: Request) {
  const { videoBase64, audioBase64, question } = await request.json();

  const adapter = gemini({
    apiKey: process.env.GOOGLE_GEMINI_API_KEY!,
  });

  const stream = chat({
    adapter,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', content: question },
          {
            type: 'video',
            source: { type: 'data', value: videoBase64 },
            metadata: { mimeType: 'video/mp4' },
          },
          {
            type: 'audio',
            source: { type: 'data', value: audioBase64 },
            metadata: { mimeType: 'audio/wav' },
          },
        ],
      },
    ],
    model: 'gemini-1.5-pro',
  });

  return toServerSentEventsResponse(stream);
}
```

### A.4 OpenRouter with Provider-Specific Model

```typescript
import { chat } from '@tanstack/ai';
import { openrouter } from '@tanstack/ai-openrouter';

export async function POST(request: Request) {
  const { messages, model = 'anthropic/claude-3.5-sonnet' } = await request.json();

  const adapter = openrouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  });

  const stream = chat({
    adapter,
    messages,
    model, // OpenRouter supports any provider's model
  });

  return toServerSentEventsResponse(stream);
}
```

---

**End of Research Report**
