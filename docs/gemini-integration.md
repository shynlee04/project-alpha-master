# Google Gemini API Integration Guide

**Date:** 2026-01-11  
**Version:** 1.0  
**Status:** BYOK (Bring Your Own Key) Compatible

---

## Overview

This guide documents the Google Gemini API integration for project-alpha. The integration uses TanStack AI's `@tanstack/ai-gemini` adapter with BYOK architecture - API keys are entered via the Settings UI and stored securely in an encrypted credential vault.

## Architecture

```
User Settings Page (Frontend)
         ↓
ProviderConfigDialog (API Key Input)
         ↓
credentialVault (Encrypted Storage - IndexedDB)
         ↓
useProviderApiKey Hook (Key Retrieval)
         ↓
Chat API / Model Fetching (Server-Side)
         ↓
@tanstack/ai-gemini → Google Gemini API
```

## Features

### Supported Modalities
| Modality | Status | Notes |
|----------|--------|-------|
| Text | ✅ Full | Streaming supported |
| Images | ✅ Full | Vision/multimodal input |
| Audio | ✅ Full | Input and TTS |
| Video | ⏳ Coming | Future update |
| Function Calling | ✅ Full | Tool use supported |
| Thinking Mode | ✅ Full | Gemini 2.5 Pro/Flash |
| Grounding | ✅ Full | Google Search |

### Supported Models
| Model | Context | Best For |
|-------|---------|----------|
| Gemini 2.5 Pro | 1M tokens | Complex reasoning, multimodal |
| Gemini 2.5 Flash | 1M tokens | Fast, cost-effective general use |
| Gemini 2.5 Flash Lite | 1M tokens | High-volume, efficiency |
| Gemini 2.0 Flash | 1M tokens | Stable production use |

## Setup Instructions

### 1. Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key (39+ characters, does NOT start with "sk-")

### 2. Configure in Settings

1. Navigate to **Settings** → **AI Agent Configuration**
2. Find **Google Gemini** in the providers list
3. Click **Configure** or **Add Provider**
4. Paste your API key
5. Click **Test Connection** to verify
6. Select your preferred model

### 3. Environment Variables (Optional)

For development or server-side usage:

```bash
# .env.example
GEMINI_API_KEY=your-api-key-here
```

**Note:** In BYOK mode, API keys are stored in the encrypted vault, not environment variables.

## Usage Examples

### Basic Chat

```typescript
import { chat } from '@tanstack/ai';
import { geminiText } from '@tanstack/ai-gemini';

const stream = chat({
  adapter: geminiText('gemini-2.5-flash', {
    apiKey: apiKeyFromVault,
  }),
  messages: [
    { role: 'user', content: 'Hello, Gemini!' }
  ],
});
```

### With Tools

```typescript
import { chat, toolDefinition } from '@tanstack/ai';
import { geminiText } from '@tanstack/ai-gemini';
import { z } from 'zod';

const getWeather = toolDefinition({
  name: 'get_weather',
  description: 'Get weather for a location',
  inputSchema: z.object({
    location: z.string(),
  }),
}).server(async ({ location }) => {
  // Server-side implementation
  return { temperature: 72 };
});

const stream = chat({
  adapter: geminiText('gemini-2.5-pro', { apiKey }),
  messages,
  tools: [getWeather],
});
```

### Multimodal Input

```typescript
const messages = [
  {
    role: 'user',
    content: [
      { type: 'text', content: 'What do you see in this image?' },
      { type: 'image', data: base64Image, mimeType: 'image/jpeg' }
    ]
  }
];

const stream = chat({
  adapter: geminiText('gemini-2.5-flash', { apiKey }),
  messages,
});
```

## Troubleshooting

### Common Errors

| Error | Solution |
|-------|----------|
| "API key appears too short" | Keys should be 39+ characters. Get a new key from AI Studio. |
| "Keys do not start with sk-" | OpenAI keys start with "sk-". Gemini keys don't have this prefix. |
| "Rate limit exceeded" | Wait a moment and try again. Check your quota. |
| "Content blocked" | Safety filters triggered. Try a different prompt. |

### Validation

The system validates API keys on input:
- Minimum 30 characters
- Does not start with "sk-" (OpenAI format)
- Tests connection via Google API

### Debug Mode

Enable console logging:

```typescript
// Check browser console for debug output
console.log('[GeminiAdapter] Creating adapter...');
console.log('[GeminiAdapter] Fetching models...');
```

## API Reference

### GeminiAdapter Class

```typescript
class GeminiAdapter {
  constructor(config: GeminiAdapterConfig)
  
  // Chat operations
  chat(messages, options): Promise<ChatResult>
  streamChat(messages, options): AsyncGenerator<StreamChunk>
  
  // Utilities
  detectModalities(messages): GeminiModality[]
  selectModelForModalities(modalities): GeminiModelId
  testConnection(): Promise<ConnectionTestResult>
  getAvailableModels(): Promise<ModelInfo[]>
}
```

### Exported Functions

```typescript
// Model validation
isValidGeminiModel(model: string): boolean
validateGeminiModelId(model: string): void

// Error handling
formatGeminiError(error: unknown): string

// Model discovery
fetchGoogleModels(apiKey: Promise<ModelInfo[]>
getDefaultGoogleModels(): ModelInfo[]
testGoogleApiKey(apiKey: Promise<{ valid: boolean; error?: string }>
```

## Security

- **Storage:** API keys encrypted with AES-256-GCM
- **Vault:** PBKDF2-SHA256 key derivation
- **Transport:** Keys passed in request body (HTTPS required)
- **Validation:** Client-side format validation before storage

## Files Modified

| File | description |
|------|---------|
| `src/lib/agent/providers/gemini-adapter.ts` | Core adapter with geminiText pattern |
| `src/domain/services/universal-provider-registry.ts` | Built-in Google provider |
| `src/domain/types/llm/provider-types.ts` | ModalityType updated (added 'audio') |
| `src/presentation/components/agent/ProviderConfigDialog.tsx` | Gemini-specific validation |
| `src/infrastructure/persistence/stores/providers/google-model-fetcher.ts` | Model auto-discovery |
| `src/routes/api/chat.ts` | Updated to use geminiText |
| `.env.example` | Added Gemini API key documentation |
| `src/presentation/components/agent/ProviderSettings.tsx` | Gemini capabilities UI |

## References

- [TanStack AI Gemini Documentation](https://tanstack.com/ai/latest/docs/adapters/gemini)
- [Google Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- [Google AI Studio](https://aistudio.google.com)

---

**Document Generated:** 2026-01-11  
**Compatible with:** project-alpha BYOK Architecture
