# Gemini API Integration Guide
## Via-gent LLM Provider Implementation

**Date**: 2025-12-28
**Epic**: Epic 25 - AI Foundation Sprint
**Priority**: MVP

---

## Overview

This guide documents the integration patterns for Google Gemini API within the Via-gent IDE, covering both direct API access and the TanStack AI adapter approach.

---

## 1. Provider Configuration

### 1.1 Provider Definition

```typescript
// src/lib/agent/providers/types.ts
export const PROVIDERS = {
    gemini: {
        id: 'gemini',
        name: 'Google Gemini',
        type: 'gemini',
        defaultModel: 'gemini-2.5-flash',
        enabled: true,  // Enable after implementation
        supportsNativeTools: true
    }
};
```

### 1.2 API Key Storage

```typescript
// Store credentials securely
await credentialVault.storeCredentials('gemini', apiKey);

// Retrieve for API calls
const apiKey = await credentialVault.getCredentials('gemini');
```

---

## 2. TanStack AI Integration (Recommended)

### 2.1 Installation

```bash
pnpm add @tanstack/ai @tanstack/ai-gemini
```

### 2.2 Adapter Configuration

```typescript
import { geminiText, createGeminiText } from "@tanstack/ai-gemini";

// Using environment variable
const adapter = geminiText("gemini-2.5-flash");

// Using explicit API key
const adapter = createGeminiText(apiKey, {
    baseURL: "https://generativelanguage.googleapis.com/v1beta"
});
```

### 2.3 Chat Integration

```typescript
import { chat, toStreamResponse } from "@tanstack/ai";
import { geminiText } from "@tanstack/ai-gemini";

export async function POST(request: Request) {
    const { messages, providerId, model } = await request.json();
    
    // Get API key from credential vault
    const apiKey = await getProviderApiKey(providerId);
    
    const stream = chat({
        adapter: createGeminiText(apiKey)(model),
        messages,
    });
    
    return toStreamResponse(stream);
}
```

### 2.4 Tool Integration

```typescript
import { chat, toolDefinition } from "@tanstack/ai";
import { geminiText } from "@tanstack/ai-gemini";
import { z } from "zod";

// Define tool with Zod schema
const readFileTool = toolDefinition({
    name: "read_file",
    description: "Read contents of a file from the workspace",
    inputSchema: z.object({
        path: z.string().describe("File path relative to workspace root")
    })
});

// Server-side implementation
const readFile = readFileTool.server(async ({ path }) => {
    const content = await syncManager.readFile(path);
    return { content, path };
});

// Chat with tools
const stream = chat({
    adapter: geminiText("gemini-2.5-flash"),
    messages,
    tools: [readFile]
});
```

---

## 3. Native Gemini API (Alternative)

### 3.1 Direct API Usage

```typescript
import { GoogleGenAI } from '@google/genai';

const client = new GoogleGenAI({ apiKey });

const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }]
});
```

### 3.2 Function Calling

```typescript
const toolConfig = {
    functionDeclarations: [{
        name: 'read_file',
        description: 'Read file contents',
        parameters: {
            type: 'OBJECT',
            properties: {
                path: { 
                    type: 'STRING', 
                    description: 'File path' 
                }
            },
            required: ['path']
        }
    }]
};

const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { tools: [toolConfig] }
});

// Handle function call
const functionCall = response.candidates[0].content.parts[0].function_call;
if (functionCall) {
    const result = await executeFunction(functionCall.name, functionCall.args);
    
    // Send result back
    const finalResponse = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            ...previousContents,
            { role: 'model', parts: [{ functionCall }] },
            { role: 'function', parts: [{ functionResponse: { name: functionCall.name, response: result } }] }
        ]
    });
}
```

---

## 4. Live API (Audio/Video Streaming)

### 4.1 WebSocket Connection

```typescript
const liveSession = await client.live.connect({
    model: 'gemini-live-2.5-flash-preview',
    config: {
        responseModalities: ['audio', 'text']
    }
});

// Send audio data (PCM format)
liveSession.send({
    audio: base64EncodedPCM
});

// Receive responses
liveSession.on('message', (response) => {
    if (response.audio) {
        playAudio(response.audio);
    }
    if (response.text) {
        displayText(response.text);
    }
});
```

### 4.2 Audio Format Requirements

| Parameter | Value |
|-----------|-------|
| Format | PCM (raw) |
| Sample Rate | 16000 Hz |
| Channels | Mono |
| Encoding | 16-bit signed |
| Transmission | Base64 encoded |

---

## 5. Model Selection

### 5.1 Available Models

| Model | Context | Speed | Best For |
|-------|---------|-------|----------|
| `gemini-2.5-pro` | 1M tokens | Slower | Complex reasoning |
| `gemini-2.5-flash` | 1M tokens | Fast | General use |
| `gemini-2.0-flash-exp` | 1M tokens | Fast | Experimental features |
| `gemini-live-2.5-flash-preview` | Session | Real-time | Audio/video |

### 5.2 Dynamic Model Fetching

```typescript
// Fetch available models from API
const models = await modelRegistry.getModels('gemini', apiKey);

// Without API key, returns defaults
const freeModels = modelRegistry.getDefaultModels('gemini');
```

---

## 6. Error Handling

### 6.1 Retry Strategy

```typescript
const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 1000;

async function callWithRetry(fn: () => Promise<T>): Promise<T> {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (error.status === 429) {
                // Rate limited - exponential backoff
                await sleep(INITIAL_BACKOFF * Math.pow(2, attempt));
                continue;
            }
            if (error.status >= 500) {
                // Server error - immediate retry
                continue;
            }
            throw error; // Don't retry client errors
        }
    }
    throw new Error('Max retries exceeded');
}
```

### 6.2 Error Types

| HTTP Code | Type | Action |
|-----------|------|--------|
| 400 | Bad Request | Surface to user, don't retry |
| 401 | Unauthorized | Prompt for new API key |
| 403 | Forbidden | Check API key permissions |
| 429 | Rate Limited | Exponential backoff |
| 500 | Server Error | Retry with backoff |

---

## 7. Configuration Schema

### 7.1 Provider Settings

```typescript
interface GeminiProviderConfig {
    // Required
    apiKey: string;
    
    // Optional with defaults
    model?: string;              // default: 'gemini-2.5-flash'
    temperature?: number;        // default: 0.7, range: 0-2
    maxOutputTokens?: number;    // default: 8192
    topK?: number;              // default: 40
    topP?: number;              // default: 0.95
    
    // Feature toggles
    enableTools?: boolean;       // default: true
    enableMultiModal?: boolean;  // default: true
    enableStreaming?: boolean;   // default: true
}
```

### 7.2 Persistence

```typescript
// Store in Dexie.js
interface ProviderConfigRecord {
    providerId: 'gemini';
    config: GeminiProviderConfig;
    updatedAt: Date;
}
```

---

## 8. Via-gent Integration Points

### 8.1 Chat API Route

```typescript
// src/routes/api/chat.ts
const PROVIDER_BASE_URLS = {
    gemini: 'https://generativelanguage.googleapis.com/v1beta'
};
```

### 8.2 Agent Chat Hook

```typescript
// src/lib/agent/hooks/use-agent-chat-with-tools.ts
if (providerId === 'gemini') {
    adapter = createGeminiText(apiKey)(model);
}
```

### 8.3 Status Bar Integration

```typescript
// src/lib/state/statusbar-store.ts
modelIndicator: {
    name: 'Gemini',
    model: 'gemini-2.5-flash',
    status: 'connected'
}
```

---

## References

- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [TanStack AI Gemini Adapter](https://tanstack.com/ai/latest/docs/adapters/gemini)
- [Function Calling Guide](https://ai.google.dev/gemini-api/docs/function-calling)
- [Live API Guide](https://ai.google.dev/gemini-api/docs/live)

---

*Generated via BMAD v6 Investigation Cycle - 2025-12-28*
