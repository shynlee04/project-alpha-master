# OpenAI-Compatible Provider Research
**Date:** 2026-01-11
**Epic:** Provider System Enhancement
**Related:** Chutes.ai Integration, Universal Provider Support

---

## Executive Summary

This document analyzes the current provider architecture and proposes a universal OpenAI-compatible provider system that supports:
- Multiple custom providers with different endpoints
- Per-modality endpoint configuration (text, image, audio)
- Manual model specification (no required `/models` endpoint)
- Local provider support (no API key required)
- Easy test UI for rapid configuration

---

## Current Architecture Analysis

### Existing Files

| File | description | Issues |
|------|---------|--------|
| `src/lib/agent/providers/types.ts` | Provider configurations | Single hardcoded `openai-compatible` entry |
| `src/lib/agent/providers/provider-adapter.ts` | Adapter factory | No per-modality endpoint support |
| `src/lib/agent/providers/model-registry.ts` | Model fetching | Assumes `/models` endpoint exists |
| `src/domain/types/llm/provider-types.ts` | Type definitions | `OpenAICompatibleConfig` too rigid |

### Current Provider Config (PROVIDERS)

```typescript
'openai-compatible': {
  id: 'openai-compatible',
  name: 'OpenAI Compatible',
  type: 'openai-compatible',
  baseURL: '',  // Must be provided at runtime
  enabled: true,
  isCustom: true,
  supportsNativeTools: false,
  hasApiKey: false,
  models: [],
  lastModelFetchAt: undefined,
}
```

**Problems:**
1. Only one `openai-compatible` provider allowed
2. No way to register multiple custom providers
3. `baseURL` is single string - no per-modality support
4. Model registry fails if `/models` endpoint doesn't exist

---

## Chutes.ai API Analysis

### Endpoint Structure

| Modality | Endpoint | Headers | Body Format |
|----------|----------|---------|-------------|
| **Text** | `https://llm.chutes.ai/v1/chat/completions` | `Authorization: Bearer $TOKEN` | OpenAI-compatible |
| **Image (Turbo)** | `https://chutes-z-image-turbo.chutes.ai/generate` | `Authorization: Bearer $TOKEN` | `{ prompt: string }` |
| **Image (Full)** | `https://image.chutes.ai/generate` | `Authorization: Bearer $TOKEN` | Custom schema |
| **TTS** | `https://chutes-kokoro.chutes.ai/speak` | `Authorization: Bearer $TOKEN` | `{ text, speed }` |
| **STT** | `https://chutes-whisper-large-v3.chutes.ai/transcribe` | `Authorization: Bearer $TOKEN` | `{ audio_b64, language }` |

### Key Observations

1. **No `/models` endpoint** - Users must know model names beforehand
2. **Different base URLs per modality** - Cannot use single `baseURL`
3. **Different request/response formats** - Not all are OpenAI-compatible
4. **All use same API key** - Single credential works across endpoints

---

## Proposed Architecture

### 1. Modality Type System

```typescript
/**
 * Supported AI modalities
 */
export type ModalityType = 'text' | 'image' | 'audio' | 'video';

/**
 * Modality capabilities for a provider/model
 */
export interface ModalityCapability {
  /** The modality type */
  type: ModalityType;

  /** Input support (can receive this modality) */
  input: boolean;

  /** Output support (can generate this modality) */
  output: boolean;

  /** Endpoint for this modality (may differ from base) */
  endpoint?: string;

  /** Request format for this modality */
  requestFormat: 'openai' | 'custom';

  /** Response format for this modality */
  responseFormat: 'openai' | 'custom';
}
```

### 2. Universal Provider Configuration

```typescript
/**
 * Universal OpenAI-Compatible Provider Configuration
 */
export interface UniversalProviderConfig {
  /** Unique provider identifier */
  id: string;

  /** Display name */
  name: string;

  /**
   * Per-modality endpoint configuration
   * Each modality can have its own endpoint
   */
  endpoints: Partial<Record<ModalityType, string>>;

  /**
   * Default endpoints (fallback if modality-specific not set)
   */
  baseURL?: string;

  /**
   * API key (optional for localhost providers)
   */
  apiKey?: string;

  /**
   * Custom headers for all requests
   */
  headers?: Record<string, string>;

  /**
   * Available models (manually configured, no auto-fetch)
   */
  models: UniversalModelConfig[];

  /**
   * Default model for text generation
   */
  defaultModel?: string;

  /**
   * Whether API key is required
   */
  requiresApiKey?: boolean;

  /**
   * Supported modalities
   */
  modalities: ModalityCapability[];
}

/**
 * Model configuration (manual entry)
 */
export interface UniversalModelConfig {
  /** Model ID (e.g., 'zai-org/GLM-4.7-TEE') */
  id: string;

  /** Display name */
  name: string;

  /** Supported modalities for this model */
  modalities: ModalityType[];

  /** Context window */
  contextLength?: number;

  /** Supports streaming */
  supportsStreaming?: boolean;
}
```

### 3. Provider Registry

```typescript
/**
 * Universal Provider Registry
 *
 * Manages dynamic provider registration and retrieval.
 * Replaces hardcoded PROVIDERS constant.
 */
export class UniversalProviderRegistry {
  private providers = new Map<string, UniversalProviderConfig>();

  /**
   * Register a new provider
   */
  register(config: UniversalProviderConfig): void;

  /**
   * Unregister a provider
   */
  unregister(id: string): void;

  /**
   * Get provider by ID
   */
  get(id: string): UniversalProviderConfig | undefined;

  /**
   * List all providers
   */
  listAll(): UniversalProviderConfig[];

  /**
   * Get providers that support a modality
   */
  getByModality(modality: ModalityType): UniversalProviderConfig[];
}
```

### 4. Universal Adapter

```typescript
/**
 * Universal OpenAI-Compatible Adapter
 *
 * Handles per-modality routing and request/response transformation.
 */
export class UniversalAdapter {
  /**
   * Get endpoint for specific modality
   */
  private getEndpoint(modality: ModalityType): string;

  /**
   * Transform request based on modality
   */
  private transformRequest(
    modality: ModalityType,
    payload: unknown
  ): RequestInit;

  /**
   * Transform response based on modality
   */
  private transformResponse<T>(
    modality: ModalityType,
    response: Response
  ): Promise<T>;

  /**
   * Execute request for specific modality
   */
  async execute<T>(
    modality: ModalityType,
    payload: unknown
  ): Promise<T>;
}
```

---

## Test UI Specification

### Provider Configuration Form

```
┌─────────────────────────────────────────────────────────────┐
│  Add Custom Provider                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Provider Name: [________________]                          │
│                                                             │
│  API Key:       [________________] (optional for localhost) │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Modality Endpoints                                  │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Text:   [https://llm.chutes.ai/v1/chat/completions] │   │
│  │ Image:  [https://image.chutes.ai/generate        ] │   │
│  │ TTS:    [https://chutes-kokoro.chutes.ai/speak   ] │   │
│  │ STT:    [https://chutes-whisper.chutes.ai/transcribe] │  │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Available Models                                    │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ [+ Add Model]                                       │   │
│  │                                                     │   │
│  │ • zai-org/GLM-4.7-TEE (text, audio)               │   │
│  │ • qwen-image (image)                               │   │
│  │ • kokoro (tts)                                     │   │
│  │ • whisper (stt)                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Test Connection]  [Save Provider]                        │
└─────────────────────────────────────────────────────────────┘
```

### Quick Test Panel

```
┌─────────────────────────────────────────────────────────────┐
│  Provider Test Bench                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Provider: [Chutes.ai ▼]   Model: [GLM-4.7-TEE ▼]          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Text] [Image] [TTS] [STT]                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Input:                                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Tell me a 250 word story.                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Parameters:                                                │
│  Max Tokens: [1024]   Temperature: [0.7]   Stream: [✓]    │
│                                                             │
│  [Send Request]                                            │
│                                                             │
│  Response:                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Once upon a time...                                 │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Status: ✅ Success (1247ms)                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Files

### New Files

| File | description |
|------|---------|
| `src/domain/types/llm/modality-types.ts` | Modality type definitions |
| `src/domain/types/llm/universal-provider-types.ts` | Universal provider types |
| `src/lib/agent/providers/universal-registry.ts` | Provider registry |
| `src/lib/agent/providers/universal-adapter.ts` | Universal adapter |
| `src/presentation/components/provider/test-bench.tsx` | Test UI component |

### Modified Files

| File | Changes |
|------|---------|
| `src/lib/agent/providers/provider-adapter.ts` | Integrate universal adapter |
| `src/domain/types/llm/index.ts` | Export new types |
| `src/lib/agent/providers/types.ts` | Add universal provider config |

---

## Example: Chutes.ai Configuration

```typescript
const chutesProvider: UniversalProviderConfig = {
  id: 'chutes',
  name: 'Chutes.ai',
  apiKey: 'chutes-api-key',
  requiresApiKey: true,
  endpoints: {
    text: 'https://llm.chutes.ai/v1',
    image: 'https://image.chutes.ai',
    audio: 'https://chutes-kokoro.chutes.ai',
  },
  headers: {
    'Authorization': 'Bearer ${apiKey}',
  },
  models: [
    {
      id: 'zai-org/GLM-4.7-TEE',
      name: 'GLM 4.7 TEE',
      modalities: ['text', 'audio'],
      contextLength: 128000,
      supportsStreaming: true,
    },
    {
      id: 'qwen-image',
      name: 'Qwen Image',
      modalities: ['image'],
    },
  ],
  modalities: [
    { type: 'text', input: true, output: true, endpoint: '/chat/completions', requestFormat: 'openai', responseFormat: 'openai' },
    { type: 'image', input: true, output: true, endpoint: '/generate', requestFormat: 'custom', responseFormat: 'custom' },
    { type: 'audio', input: true, output: true, endpoint: '/speak', requestFormat: 'custom', responseFormat: 'custom' },
  ],
};
```

---

## Next Steps

1. **Phase 1: Type System** - Create modality and universal provider types
2. **Phase 2: Registry** - Implement dynamic provider registration
3. **Phase 3: Adapter** - Build universal adapter with per-modality routing
4. **Phase 4: Test UI** - Create test bench component
5. **Phase 5: Integration** - Wire into existing provider system

---

*Document created: 2026-01-11*
*Related: EPIC-GU, Story: Universal OpenAI-Compatible Provider*
