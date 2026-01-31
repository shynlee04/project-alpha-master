# Quick Dev: Provider Test UI
**Date:** 2026-01-11
**Type:** Quick Development Workflow
**Related:** OpenAI-Compatible Provider Research

---

## Overview

A rapid development workflow for creating a test UI that can quickly configure and test different OpenAI-compatible providers with custom endpoints, models, and modalities.

`★ Insight ─────────────────────────────────────`
**Why This Approach Works:**
1. **Single-file test component** - No routing, no state management complexity
2. **URL-based configuration** - Share test configs via URL params
3. **Direct fetch calls** - Bypass existing adapter complexity during testing
4. **LocalStorage persistence** - Save configs without backend
`─────────────────────────────────────────────────`

---

## Architecture: Test Component Structure

```
src/routes/__tests__/provider-test-bench.tsx
├── ProviderTestBench component
│   ├── ProviderSelector (dropdown + add new)
│   ├── ModelSelector (filtered by provider)
│   ├── ModalityTabs (text | image | audio)
│   ├── InputArea (changes based on modality)
│   ├── ParameterControls (temp, tokens, etc.)
│   ├── ResponseDisplay (raw + formatted)
│   └── StatusIndicator (latency, success/fail)
```

---

## File 1: Test Types

**Create:** `src/presentation/components/provider/test-bench-types.ts`

```typescript
/**
 * Test bench types for provider testing
 */

export type ModalityType = 'text' | 'image' | 'tts' | 'stt';

export interface TestProviderConfig {
  id: string;
  name: string;
  apiKey?: string;
  endpoints: {
    text?: string;
    image?: string;
    tts?: string;
    stt?: string;
  };
  headers?: Record<string, string>;
  models: TestModelConfig[];
}

export interface TestModelConfig {
  id: string;
  name: string;
  modalities: ModalityType[];
}

export interface TestRequest {
  providerId: string;
  model: string;
  modality: ModalityType;
  input: string;
  parameters: {
    maxTokens?: number;
    temperature?: number;
    stream?: boolean;
  };
}

export interface TestResponse {
  success: boolean;
  latencyMs: number;
  data?: unknown;
  error?: string;
}
```

---

## File 2: Test Bench Component

**Create:** `src/routes/__tests__/provider-test-bench.tsx`

```typescript
/**
 * @fileoverview Provider Test Bench
 * @module routes/__tests__/provider-test-bench
 *
 * Quick test UI for OpenAI-compatible providers.
 * Configure endpoints, models, and test requests directly.
 */

import { useState, useEffect } from 'react';
import type {
  TestProviderConfig,
  TestModelConfig,
  ModalityType,
  TestRequest,
  TestResponse
} from '@/presentation/components/provider/test-bench-types';

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

const DEFAULT_PROVIDERS: TestProviderConfig[] = [
  {
    id: 'chutes',
    name: 'Chutes.ai',
    apiKey: '',  // User fills this
    endpoints: {
      text: 'https://llm.chutes.ai/v1/chat/completions',
      image: 'https://image.chutes.ai/generate',
      tts: 'https://chutes-kokoro.chutes.ai/speak',
      stt: 'https://chutes-whisper-large-v3.chutes.ai/transcribe',
    },
    models: [
      { id: 'zai-org/GLM-4.7-TEE', name: 'GLM 4.7 TEE', modalities: ['text'] },
      { id: 'qwen-image', name: 'Qwen Image', modalities: ['image'] },
    ],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    apiKey: '',
    endpoints: {
      text: 'https://openrouter.ai/api/v1/chat/completions',
    },
    models: [
      { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B', modalities: ['text'] },
    ],
  },
  {
    id: 'localhost',
    name: 'Localhost (LM Studio)',
    apiKey: '',
    endpoints: {
      text: 'http://localhost:1234/v1/chat/completions',
    },
    models: [
      { id: 'local-model', name: 'Local Model', modalities: ['text'] },
    ],
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Load providers from localStorage or use defaults
 */
function loadProviders(): TestProviderConfig[] {
  const stored = localStorage.getItem('test-providers');
  if (stored) {
    return JSON.parse(stored);
  }
  return DEFAULT_PROVIDERS;
}

/**
 * Save providers to localStorage
 */
function saveProviders(providers: TestProviderConfig[]): void {
  localStorage.setItem('test-providers', JSON.stringify(providers));
}

// ============================================================================
// REQUEST HANDLERS
// ============================================================================

/**
 * Execute a test request based on modality
 */
async function executeRequest(request: TestRequest, providers: TestProviderConfig[]): Promise<TestResponse> {
  const provider = providers.find(p => p.id === request.providerId);
  if (!provider) {
    return { success: false, latencyMs: 0, error: 'Provider not found' };
  }

  const endpoint = provider.endpoints[request.modality];
  if (!endpoint) {
    return { success: false, latencyMs: 0, error: `No endpoint for modality: ${request.modality}` };
  }

  const startTime = performance.now();

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...provider.headers,
    };

    if (provider.apiKey) {
      headers['Authorization'] = `Bearer ${provider.apiKey}`;
    }

    let body: unknown;
    let fetchEndpoint = endpoint;

    // Build request based on modality
    switch (request.modality) {
      case 'text':
        body = {
          model: request.model,
          messages: [{ role: 'user', content: request.input }],
          stream: request.parameters.stream ?? false,
          max_tokens: request.parameters.maxTokens ?? 1024,
          temperature: request.parameters.temperature ?? 0.7,
        };
        break;

      case 'image':
        body = {
          model: request.model,
          prompt: request.input,
        };
        break;

      case 'tts':
        body = {
          text: request.input,
          speed: 1.0,
        };
        break;

      case 'stt':
        body = {
          audio_b64: request.input,
          language: null,
        };
        break;
    }

    const response = await fetch(fetchEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const latencyMs = Math.round(performance.now() - startTime);

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, latencyMs, error: `HTTP ${response.status}: ${errorText}` };
    }

    const data = await response.json();
    return { success: true, latencyMs, data };

  } catch (error) {
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      success: false,
      latencyMs,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function ProviderTestBench() {
  const [providers, setProviders] = useState<TestProviderConfig[]>(DEFAULT_PROVIDERS);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('chutes');
  const [selectedModel, setSelectedModel] = useState<string>('zai-org/GLM-4.7-TEE');
  const [modality, setModality] = useState<ModalityType>('text');
  const [input, setInput] = useState('Tell me a 250 word story.');
  const [response, setResponse] = useState<TestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [temperature, setTemperature] = useState(0.7);
  const [showConfig, setShowConfig] = useState(false);

  // Load saved providers on mount
  useEffect(() => {
    const saved = loadProviders();
    setProviders(saved);
  }, []);

  // Get current provider
  const currentProvider = providers.find(p => p.id === selectedProviderId);
  const availableModels = currentProvider?.models.filter(m => m.modalities.includes(modality)) ?? [];

  // Handle request
  const handleSend = async () => {
    if (!currentProvider) return;

    setIsLoading(true);
    setResponse(null);

    const request: TestRequest = {
      providerId: selectedProviderId,
      model: selectedModel,
      modality,
      input,
      parameters: { maxTokens, temperature, stream: false },
    };

    const result = await executeRequest(request, providers);
    setResponse(result);
    setIsLoading(false);
  };

  // Update provider config
  const handleUpdateProvider = (id: string, updates: Partial<TestProviderConfig>) => {
    const updated = providers.map(p =>
      p.id === id ? { ...p, ...updates } : p
    );
    setProviders(updated);
    saveProviders(updated);
  };

  // Format response for display
  const formatResponse = (resp: TestResponse): string => {
    if (!resp.success) return `Error: ${resp.error}`;
    return JSON.stringify(resp.data, null, 2);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Provider Test Bench</h1>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-4 py-2 border rounded hover:bg-muted"
          >
            {showConfig ? 'Hide Config' : 'Show Config'}
          </button>
        </div>

        {/* Provider Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Provider</label>
            <select
              value={selectedProviderId}
              onChange={(e) => {
                setSelectedProviderId(e.target.value);
                const provider = providers.find(p => p.id === e.target.value);
                if (provider?.models[0]) {
                  setSelectedModel(provider.models[0].id);
                }
              }}
              className="w-full p-2 border rounded bg-background"
            >
              {providers.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full p-2 border rounded bg-background"
            >
              {availableModels.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Configuration Panel (Collapsible) */}
        {showConfig && currentProvider && (
          <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
            <h3 className="font-semibold">Configuration: {currentProvider.name}</h3>

            <div>
              <label className="block text-sm font-medium mb-1">API Key</label>
              <input
                type="password"
                value={currentProvider.apiKey ?? ''}
                onChange={(e) => handleUpdateProvider(currentProvider.id, { apiKey: e.target.value })}
                placeholder="Enter API key (optional for localhost)"
                className="w-full p-2 border rounded bg-background"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Text Endpoint</label>
                <input
                  type="text"
                  value={currentProvider.endpoints.text ?? ''}
                  onChange={(e) => handleUpdateProvider(currentProvider.id, {
                    endpoints: { ...currentProvider.endpoints, text: e.target.value }
                  })}
                  placeholder="https://api.example.com/v1/chat/completions"
                  className="w-full p-2 border rounded bg-background text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image Endpoint</label>
                <input
                  type="text"
                  value={currentProvider.endpoints.image ?? ''}
                  onChange={(e) => handleUpdateProvider(currentProvider.id, {
                    endpoints: { ...currentProvider.endpoints, image: e.target.value }
                  })}
                  placeholder="https://api.example.com/generate"
                  className="w-full p-2 border rounded bg-background text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Modality Tabs */}
        <div className="flex gap-2 border-b">
          {(['text', 'image', 'tts', 'stt'] as ModalityType[]).map(m => {
            const hasEndpoint = currentProvider?.endpoints[m];
            return (
              <button
                key={m}
                onClick={() => setModality(m)}
                disabled={!hasEndpoint}
                className={`
                  px-4 py-2 border-b-2 -mb-px transition-colors
                  ${modality === m
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'}
                  ${!hasEndpoint ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {m.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Input Area */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {modality === 'text' ? 'Prompt' :
             modality === 'image' ? 'Image Prompt' :
             modality === 'tts' ? 'Text to Speak' :
             'Base64 Audio'}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            className="w-full p-3 border rounded-lg bg-background resize-none"
            placeholder={modality === 'text' ? 'Enter your prompt...' :
                     modality === 'image' ? 'Describe the image to generate...' :
                     modality === 'tts' ? 'Enter text to speak...' :
                     'Paste base64 audio data...'}
          />
        </div>

        {/* Parameters */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Max Tokens</label>
            <input
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(Number(e.target.value))}
              className="w-full p-2 border rounded bg-background"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Temperature</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="2"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full p-2 border rounded bg-background"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSend}
              disabled={isLoading || !currentProvider?.apiKey}
              className="w-full p-2 bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </div>

        {/* Response Display */}
        {response && (
          <div className="border rounded-lg">
            <div className="flex items-center justify-between p-3 border-b bg-muted/50">
              <span className={`font-medium ${response.success ? 'text-green-600' : 'text-red-600'}`}>
                {response.success ? '✅ Success' : '❌ Failed'}
              </span>
              <span className="text-sm text-muted-foreground">
                {response.latencyMs}ms
              </span>
            </div>
            <pre className="p-4 overflow-auto max-h-96 text-sm bg-background">
              {formatResponse(response)}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}
```

---

## File 3: Add Route

**Modify:** `src/routes/__root.tsx`

Add the test route (unauthenticated, no layout):

```typescript
import { createFileRoute } from '@tanstack/react-router';
import ProviderTestBench from '@/routes/__tests__/provider-test-bench';

export const Route = createFileRoute('/__tests__/provider-test-bench')({
  component: ProviderTestBench,
});
```

---

## Usage

### 1. Navigate to Test Bench

```
http://localhost:5173/__tests__/provider-test-bench
```

### 2. Configure Provider

1. Select provider from dropdown (Chutes.ai, OpenRouter, etc.)
2. Click "Show Config"
3. Enter API key
4. Verify endpoints are correct
5. Configuration auto-saves to localStorage

### 3. Test Request

1. Select model (filtered by provider and modality)
2. Select modality tab (text/image/tts/stt)
3. Enter input
4. Adjust parameters
5. Click "Send Request"

### 4. View Results

- Success/failure indicator
- Latency in milliseconds
- Full response JSON

---

## Adding New Providers

### Method 1: Edit DEFAULT_PROVIDERS

Add to `DEFAULT_PROVIDERS` array in the component:

```typescript
{
  id: 'my-provider',
  name: 'My Custom Provider',
  apiKey: '',
  endpoints: {
    text: 'https://my-api.com/v1/chat/completions',
  },
  models: [
    { id: 'my-model', name: 'My Model', modalities: ['text'] },
  ],
}
```

### Method 2: Browser Console

```javascript
// Get current providers
const providers = JSON.parse(localStorage.getItem('test-providers'));

// Add new provider
providers.push({
  id: 'custom',
  name: 'Custom',
  apiKey: 'sk-xxx',
  endpoints: { text: 'https://api.example.com/v1/chat/completions' },
  models: [{ id: 'model-1', name: 'Model 1', modalities: ['text'] }]
});

// Save
localStorage.setItem('test-providers', JSON.stringify(providers));
```

---

## Example: Testing Chutes.ai

1. Select "Chutes.ai" provider
2. Enter API key in config panel
3. Select "zai-org/GLM-4.7-TEE" model
4. Click "TEXT" tab
5. Enter prompt: "Tell me a 250 word story."
6. Set Max Tokens: 1024, Temperature: 0.7
7. Click "Send Request"

Expected result:
```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "zai-org/GLM-4.7-TEE",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "Once upon a time..."
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 250,
    "total_tokens": 265
  }
}
```

---

## Troubleshooting

### CORS Errors

If you see CORS errors, the provider doesn't support browser-based requests.

**Solutions:**
1. Use a proxy (e.g., `https://corsproxy.io/?${encodeURIComponent(url)}`)
2. Test from backend instead
3. Use a provider that allows browser requests

### 401 Unauthorized

- Check API key is correct
- Verify key has required permissions

### 404 Not Found

- Verify endpoint URL is correct
- Check if path includes `/v1` or not

### Model Not Found

- Model names are case-sensitive
- Verify model is available on the provider

---

*Document created: 2026-01-11*
*Related: OpenAI-Compatible Provider Research*
