# Quick Dev: Provider Test Playground

**Epic:** EPIC-PRV
**Version:** 1.0.0
**Date:** 2026-01-11
**Workflow:** /bmad:bmm:workflows:quick-dev
**Route:** `/__debug__/provider-playground`

---

## Overview

A complete test playground implementation for rapid validation of OpenAI-compatible providers. This is an isolated debug route that does not touch production code.

`★ Insight ─────────────────────────────────────`
**Why a Separate Debug Route?**
1. **Isolation** - No risk to production UI
2. **Speed** - Direct DOM manipulation, no state management overhead
3. **Flexibility** - Can test incomplete implementations
4. **Persistence** - LocalStorage survives reloads for iterative testing
`─────────────────────────────────────────────────`

---

## Architecture

```
/__debug__/provider-playground
├── index.tsx                    # Main playground component
├── components/
│   ├── ProviderConfigPanel.tsx  # Provider configuration form
│   ├── RequestPanel.tsx         # Request builder by modality
│   ├── ResponseDisplay.tsx      # Response viewer (raw + formatted)
│   └── StatusIndicator.tsx      # Latency, success/fail display
├── hooks/
│   ├── useProviderRegistry.ts   # Provider state management
│   └── useRequestExecutor.ts    # Request execution logic
├── lib/
│   ├── default-providers.ts     # Pre-configured provider templates
│   └── request-builder.ts       # Build requests per modality
└── styles.css                    # Scoped playground styles
```

---

## Implementation

### File 1: Main Component

**Create:** `src/routes/__debug__/provider-playground/index.tsx`

```typescript
/**
 * @fileoverview Provider Test Playground
 * @module routes/__debug__/provider-playground
 *
 * Debug route for testing OpenAI-compatible providers.
 * Supports text, image, TTS, and STT modalities.
 *
 * ROUTE: /__debug__/provider-playground
 * ACCESS: No authentication (debug only)
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  ModalityType,
  UniversalProviderConfig,
  UniversalModelConfig,
  ProviderRequestContext,
  ProviderResponse,
} from '@/domain/providers/universal-provider-types';
import { DEFAULT_PROVIDERS } from './lib/default-providers';
import { buildRequest } from './lib/request-builder';
import { executeRequest } from './lib/request-executor';

// ============================================================================
// SUB-COMPONENTS (Inline for single-file deployment)
// ============================================================================

function StatusIndicator({ response, isLoading }: {
  response: ProviderResponse | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
        Sending...
      </div>
    );
  }

  if (!response) {
    return <div className="text-sm text-muted-foreground">Ready</div>;
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className={response.success ? 'text-green-600' : 'text-red-600'}>
        {response.success ? '✓ Success' : '✗ Failed'}
      </span>
      <span className="text-muted-foreground">{response.latencyMs}ms</span>
    </div>
  );
}

function ResponseDisplay({ response }: { response: ProviderResponse | null }) {
  if (!response) {
    return (
      <div className="border rounded-lg bg-muted/30 p-8 text-center text-muted-foreground">
        Response will appear here
      </div>
    );
  }

  if (!response.success) {
    return (
      <div className="border border-red-200 rounded-lg bg-red-50 dark:bg-red-950/20 p-4">
        <h4 className="font-semibold text-red-600 mb-2">Error</h4>
        <p className="text-sm text-red-700 dark:text-red-400 font-mono">
          {response.error}
        </p>
        {response.statusCode && (
          <p className="text-xs text-muted-foreground mt-2">
            Status Code: {response.statusCode}
          </p>
        )}
      </div>
    );
  }

  // Handle binary response (audio/image)
  if (response.headers?.['content-type']?.startsWith('image/')) {
    return (
      <div className="border rounded-lg p-4">
        <img
          src={`data:${response.headers['content-type']};base64,${response.data}`}
          alt="Generated"
          className="max-w-full h-auto rounded"
        />
      </div>
    );
  }

  if (response.headers?.['content-type']?.startsWith('audio/')) {
    return (
      <div className="border rounded-lg p-4">
        <audio
          controls
          src={`data:${response.headers['content-type']};base64,${response.data}`}
          className="w-full"
        />
      </div>
    );
  }

  // JSON response
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted px-4 py-2 text-xs font-mono text-muted-foreground">
        Response JSON
      </div>
      <pre className="p-4 text-sm overflow-auto max-h-96 bg-background">
        {JSON.stringify(response.data, null, 2)}
      </pre>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProviderPlayground() {
  // Provider state
  const [providers, setProviders] = useState<UniversalProviderConfig[]>(DEFAULT_PROVIDERS);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('chutes');
  const [showConfig, setShowConfig] = useState(false);

  // Request state
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [modality, setModality] = useState<ModalityType>('text');
  const [input, setInput] = useState('Tell me a 250 word story.');
  const [response, setResponse] = useState<ProviderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Parameters
  const [maxTokens, setMaxTokens] = useState(1024);
  const [temperature, setTemperature] = useState(0.7);
  const [stream, setStream] = useState(false);

  // Load saved providers on mount
  useEffect(() => {
    const saved = localStorage.getItem('debug-providers');
    if (saved) {
      try {
        setProviders(JSON.parse(saved));
      } catch {
        // Use defaults
      }
    }
  }, []);

  // Save providers when changed
  const saveProviders = useCallback((updated: UniversalProviderConfig[]) => {
    setProviders(updated);
    localStorage.setItem('debug-providers', JSON.stringify(updated));
  }, []);

  // Get current provider
  const currentProvider = providers.find(p => p.id === selectedProviderId);
  const availableModels = currentProvider?.models.filter(m => m.modalities.includes(modality)) ?? [];

  // Update selected model when provider or modality changes
  useEffect(() => {
    if (availableModels.length > 0 && !availableModels.find(m => m.id === selectedModel)) {
      setSelectedModel(availableModels[0].id);
    }
  }, [selectedProviderId, modality, availableModels, selectedModel]);

  // Handle provider config update
  const updateProvider = useCallback((id: string, updates: Partial<UniversalProviderConfig>) => {
    saveProviders(providers.map(p => p.id === id ? { ...p, ...updates } : p));
  }, [providers, saveProviders]);

  // Execute request
  const handleSend = useCallback(async () => {
    if (!currentProvider || !selectedModel) return;

    setIsLoading(true);
    setResponse(null);

    try {
      const context: ProviderRequestContext = {
        providerId: selectedProviderId,
        model: selectedModel,
        modality,
        payload: buildRequest(modality, input),
        parameters: { maxTokens, temperature, stream },
      };

      const result = await executeRequest(currentProvider, context);
      setResponse(result);
    } catch (error) {
      setResponse({
        success: false,
        latencyMs: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentProvider, selectedModel, selectedProviderId, modality, input, maxTokens, temperature, stream]);

  // Get input placeholder based on modality
  const getInputPlaceholder = (): string => {
    switch (modality) {
      case 'text': return 'Enter your prompt...';
      case 'image': return 'Describe the image to generate...';
      case 'tts': return 'Enter text to speak...';
      case 'stt': return 'Paste base64 audio data...';
      default: return 'Enter input...';
    }
  };

  // Get input label based on modality
  const getInputLabel = (): string => {
    switch (modality) {
      case 'text': return 'Prompt';
      case 'image': return 'Image Prompt';
      case 'tts': return 'Text to Speak';
      case 'stt': return 'Base64 Audio';
      default: return 'Input';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Provider Playground
            </h1>
            <p className="text-sm text-muted-foreground">
              Test OpenAI-compatible providers with custom endpoints
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs rounded font-medium">
              DEBUG ONLY
            </span>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="px-4 py-2 border rounded hover:bg-muted transition-colors"
            >
              {showConfig ? 'Hide Config' : 'Show Config'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Configuration */}
          <div className="space-y-4">
            {/* Provider Selection */}
            <div className="border rounded-lg p-4 bg-card">
              <h3 className="font-semibold mb-3">Provider</h3>
              <select
                value={selectedProviderId}
                onChange={(e) => {
                  setSelectedProviderId(e.target.value);
                  setShowConfig(false);
                }}
                className="w-full p-2 border rounded bg-background"
              >
                {providers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Config Panel (Collapsible) */}
            {showConfig && currentProvider && (
              <div className="border rounded-lg p-4 bg-card space-y-4">
                <h3 className="font-semibold">Configuration: {currentProvider.name}</h3>

                {/* API Key */}
                <div>
                  <label className="block text-sm font-medium mb-1">API Key</label>
                  <input
                    type="password"
                    value={currentProvider.defaultApiKey ?? ''}
                    onChange={(e) => updateProvider(currentProvider.id, { defaultApiKey: e.target.value })}
                    placeholder="Enter API key (optional for localhost)"
                    className="w-full p-2 border rounded bg-background text-sm"
                  />
                </div>

                {/* Endpoints */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Endpoints</label>
                  {(['text', 'image', 'tts', 'stt'] as ModalityType[]).map(m => (
                    <div key={m} className="flex items-center gap-2">
                      <span className="w-12 text-xs uppercase text-muted-foreground">{m}</span>
                      <input
                        type="text"
                        value={currentProvider.endpoints[m] ?? ''}
                        onChange={(e) => updateProvider(currentProvider.id, {
                          endpoints: { ...currentProvider.endpoints, [m]: e.target.value }
                        })}
                        placeholder={`https://api.example.com/${m}`}
                        className="flex-1 p-2 border rounded bg-background text-sm"
                      />
                    </div>
                  ))}
                </div>

                {/* Models List */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Models</label>
                    <button
                      onClick={() => {
                        const newModel: UniversalModelConfig = {
                          id: `custom-${Date.now()}`,
                          name: 'Custom Model',
                          modalities: [modality],
                        };
                        updateProvider(currentProvider.id, {
                          models: [...currentProvider.models, newModel],
                        });
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      + Add Model
                    </button>
                  </div>
                  <div className="space-y-1 max-h-40 overflow-auto">
                    {currentProvider.models.map((model, idx) => (
                      <div key={model.id} className="flex items-center gap-2 text-sm p-2 border rounded bg-background">
                        <span className="flex-1">{model.name}</span>
                        <span className="text-xs text-muted-foreground">{model.modalities.join(', ')}</span>
                        <button
                          onClick={() => {
                            const filtered = currentProvider.models.filter((_, i) => i !== idx);
                            updateProvider(currentProvider.id, { models: filtered });
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Model Selection */}
            <div className="border rounded-lg p-4 bg-card">
              <h3 className="font-semibold mb-3">Model</h3>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-2 border rounded bg-background"
                disabled={availableModels.length === 0}
              >
                {availableModels.length > 0 ? (
                  availableModels.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))
                ) : (
                  <option value="">No models for this modality</option>
                )}
              </select>
              {availableModels.find(m => m.id === selectedModel)?.contextLength && (
                <p className="text-xs text-muted-foreground mt-2">
                  Context: {availableModels.find(m => m.id === selectedModel)?.contextLength?.toLocaleString()} tokens
                </p>
              )}
            </div>

            {/* Parameters */}
            <div className="border rounded-lg p-4 bg-card">
              <h3 className="font-semibold mb-3">Parameters</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Max Tokens</label>
                  <input
                    type="number"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(Number(e.target.value))}
                    className="w-full p-2 border rounded bg-background text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Temperature</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full p-2 border rounded bg-background text-sm"
                  />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="stream"
                    checked={stream}
                    onChange={(e) => setStream(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="stream" className="text-sm">Stream response</label>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column: Input */}
          <div className="space-y-4">
            {/* Modality Tabs */}
            <div className="border rounded-lg bg-card overflow-hidden">
              <div className="flex border-b">
                {(['text', 'image', 'tts', 'stt'] as ModalityType[]).map(m => {
                  const hasEndpoint = currentProvider?.endpoints[m];
                  const hasModel = availableModels.some(mdl => mdl.modalities.includes(m));
                  const enabled = hasEndpoint && hasModel;

                  return (
                    <button
                      key={m}
                      onClick={() => enabled && setModality(m)}
                      disabled={!enabled}
                      className={`
                        flex-1 px-4 py-3 text-sm font-medium transition-colors
                        ${modality === m
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted'}
                        ${!enabled ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {m.toUpperCase()}
                    </button>
                  );
                })}
              </div>

              {/* Description for selected modality */}
              <div className="p-3 bg-muted/50 text-sm">
                {modality === 'text' && 'Generate text responses using chat completion API'}
                {modality === 'image' && 'Generate images from text descriptions'}
                {modality === 'tts' && 'Convert text to speech audio'}
                {modality === 'stt' && 'Transcribe audio to text'}
              </div>
            </div>

            {/* Input Area */}
            <div className="border rounded-lg bg-card p-4 space-y-3">
              <label className="block text-sm font-medium">{getInputLabel()}</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={8}
                className="w-full p-3 border rounded bg-background resize-none font-mono text-sm"
                placeholder={getInputPlaceholder()}
              />
              <div className="flex items-center justify-between">
                <StatusIndicator response={response} isLoading={isLoading} />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !currentProvider?.defaultApiKey && currentProvider?.requiresApiKey}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {isLoading ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border rounded-lg bg-card p-4">
              <h3 className="font-semibold mb-2 text-sm">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setInput('Tell me a 250 word story.')}
                  className="text-xs p-2 border rounded hover:bg-muted text-left"
                >
                  📝 Story Prompt
                </button>
                <button
                  onClick={() => setInput('Explain quantum computing in simple terms.')}
                  className="text-xs p-2 border rounded hover:bg-muted text-left"
                >
                  🔬 Explain Like I\'m 5
                </button>
                <button
                  onClick={() => setInput('Write a haiku about coding.')}
                  className="text-xs p-2 border rounded hover:bg-muted text-left"
                >
                  ✨ Creative Writing
                </button>
                <button
                  onClick={() => setInput('What are the key principles of clean architecture?')}
                  className="text-xs p-2 border rounded hover:bg-muted text-left"
                >
                  🏗️ Technical Question
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Response */}
          <div className="space-y-4">
            {/* Response Display */}
            <div className="border rounded-lg bg-card">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h3 className="font-semibold">Response</h3>
                {response && (
                  <button
                    onClick={() => setResponse(null)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="p-4">
                <ResponseDisplay response={response} />
              </div>
            </div>

            {/* Request Info */}
            {response && (
              <div className="border rounded-lg bg-card p-4">
                <h3 className="font-semibold mb-3 text-sm">Request Details</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Provider</dt>
                    <dd className="font-mono">{currentProvider?.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Model</dt>
                    <dd className="font-mono text-xs">{selectedModel}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Modality</dt>
                    <dd>{modality.toUpperCase()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Endpoint</dt>
                    <dd className="font-mono text-xs text-right truncate max-w-[200px]">
                      {currentProvider?.endpoints[modality]}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Latency</dt>
                    <dd>{response.latencyMs}ms</dd>
                  </div>
                </dl>
              </div>
            )}

            {/* Tips */}
            <div className="border rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 text-sm">
                💡 Tips
              </h4>
              <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                <li>• Configuration saves to localStorage automatically</li>
                <li>• Add custom models in the config panel</li>
                <li>• Use localhost providers without an API key</li>
                <li>• Check browser console for detailed error logs</li>
              </ul>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
```

### File 2: Default Providers

**Create:** `src/routes/__debug__/provider-playground/lib/default-providers.ts`

```typescript
/**
 * @fileoverview Default Provider Configurations
 * @module routes/__debug__/provider-playground/lib/default-providers
 */

import type { UniversalProviderConfig } from '@/domain/providers/universal-provider-types';

export const DEFAULT_PROVIDERS: UniversalProviderConfig[] = [
  {
    id: 'chutes',
    name: 'Chutes.ai',
    description: 'Multi-modality AI provider with text, image, TTS, and STT',
    endpoints: {
      text: 'https://llm.chutes.ai/v1',
      image: 'https://image.chutes.ai',
      tts: 'https://chutes-kokoro.chutes.ai',
      stt: 'https://chutes-whisper-large-v3.chutes.ai',
    },
    defaultApiKey: '',
    requiresApiKey: true,
    defaultHeaders: {
      'Content-Type': 'application/json',
    },
    models: [
      {
        id: 'zai-org/GLM-4.7-TEE',
        name: 'GLM 4.7 TEE',
        modalities: ['text', 'tts', 'stt'],
        contextLength: 128000,
        supportsStreaming: true,
      },
      {
        id: 'qwen-image',
        name: 'Qwen Image',
        modalities: ['image'],
      },
    ],
    defaultModel: 'zai-org/GLM-4.7-TEE',
    docsUrl: 'https://chutes.ai',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Unified interface for multiple LLM providers',
    endpoints: {
      text: 'https://openrouter.ai/api/v1',
    },
    defaultApiKey: '',
    requiresApiKey: true,
    defaultHeaders: {
      'HTTP-Referer': 'https://via-gent.dev',
      'X-Title': 'Via-Gent',
    },
    models: [
      {
        id: 'meta-llama/llama-3.1-8b-instruct:free',
        name: 'Llama 3.1 8B Instruct (Free)',
        modalities: ['text'],
        contextLength: 131072,
        isFree: true,
      },
      {
        id: 'google/gemini-2.0-flash-exp:free',
        name: 'Gemini 2.0 Flash (Free)',
        modalities: ['text'],
        contextLength: 1048576,
        isFree: true,
      },
    ],
    defaultModel: 'meta-llama/llama-3.1-8b-instruct:free',
    docsUrl: 'https://openrouter.ai/docs',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'localhost-lmstudio',
    name: 'Localhost (LM Studio)',
    description: 'Local LLM server running on localhost',
    endpoints: {
      text: 'http://localhost:1234/v1',
    },
    defaultApiKey: '',
    requiresApiKey: false,
    models: [
      {
        id: 'local-model',
        name: 'Local Model',
        modalities: ['text'],
        contextLength: 8192,
      },
    ],
    defaultModel: 'local-model',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'localhost-ollama',
    name: 'Localhost (Ollama)',
    description: 'Ollama local server',
    endpoints: {
      text: 'http://localhost:11434/v1',
    },
    defaultApiKey: '',
    requiresApiKey: false,
    models: [
      {
        id: 'llama3.2',
        name: 'Llama 3.2',
        modalities: ['text'],
      },
    ],
    defaultModel: 'llama3.2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
```

### File 3: Request Builder

**Create:** `src/routes/__debug__/provider-playground/lib/request-builder.ts`

```typescript
/**
 * @fileoverview Request Builder
 * @module routes/__debug__/provider-playground/lib/request-builder
 */

import type { ModalityType } from '@/domain/providers/universal-provider-types';

interface TextPayload {
  model: string;
  messages: Array<{ role: string; content: string }>;
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
}

interface ImagePayload {
  model?: string;
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
}

interface TTSPayload {
  text: string;
  speed?: number;
}

interface STTPayload {
  audio_b64: string;
  language?: string | null;
}

export type BuiltRequest = TextPayload | ImagePayload | TTSPayload | STTPayload;

/**
 * Build request payload based on modality
 */
export function buildRequest(
  modality: ModalityType,
  input: string
): BuiltRequest {
  switch (modality) {
    case 'text':
      return {
        model: '', // Will be filled by executor
        messages: [{ role: 'user', content: input }],
        stream: false,
      };

    case 'image':
      return {
        prompt: input,
        width: 1024,
        height: 1024,
      };

    case 'tts':
      return {
        text: input,
        speed: 1.0,
      };

    case 'stt':
      return {
        audio_b64: input,
        language: null,
      };
  }
}
```

### File 4: Request Executor

**Create:** `src/routes/__debug__/provider-playground/lib/request-executor.ts`

```typescript
/**
 * @fileoverview Request Executor
 * @module routes/__debug__/provider-playground/lib/request-executor
 */

import type {
  UniversalProviderConfig,
  ProviderRequestContext,
  ProviderResponse,
  ModalityType,
} from '@/domain/providers/universal-provider-types';

/**
 * Execute a provider request
 */
export async function executeRequest(
  provider: UniversalProviderConfig,
  context: ProviderRequestContext
): Promise<ProviderResponse> {
  const startTime = performance.now();

  try {
    const endpoint = provider.endpoints[context.modality];
    if (!endpoint) {
      return {
        success: false,
        latencyMs: Math.round(performance.now() - startTime),
        error: `No endpoint configured for modality: ${context.modality}`,
      };
    }

    // Build full URL based on modality
    const url = buildUrl(endpoint, context.modality);

    // Build request body
    const body = buildBody(context, provider);

    // Build headers
    const headers = buildHeaders(provider, context);

    // Execute fetch
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const latencyMs = Math.round(performance.now() - startTime);

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        latencyMs,
        error: `HTTP ${response.status}: ${errorText}`,
        statusCode: response.status,
      };
    }

    // Parse response based on modality
    const data = await parseResponse(response, context.modality);

    return {
      success: true,
      latencyMs,
      data,
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
    };

  } catch (error) {
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      success: false,
      latencyMs,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Build full URL for the request
 */
function buildUrl(baseEndpoint: string, modality: ModalityType): string {
  const url = new URL(baseEndpoint);

  // Append path based on modality
  switch (modality) {
    case 'text':
      url.pathname = url.pathname.replace(/\/$/, '') + '/chat/completions';
      break;
    case 'image':
      url.pathname = url.pathname.replace(/\/$/, '') + '/generate';
      break;
    case 'tts':
      url.pathname = url.pathname.replace(/\/$/, '') + '/speak';
      break;
    case 'stt':
      url.pathname = url.pathname.replace(/\/$/, '') + '/transcribe';
      break;
  }

  return url.toString();
}

/**
 * Build request body based on modality
 */
function buildBody(
  context: ProviderRequestContext,
  provider: UniversalProviderConfig
): unknown {
  const payload = context.payload as Record<string, unknown>;

  switch (context.modality) {
    case 'text':
      return {
        model: context.model,
        messages: payload.messages,
        stream: context.parameters?.stream ?? false,
        max_tokens: context.parameters?.maxTokens ?? 1024,
        temperature: context.parameters?.temperature ?? 0.7,
      };

    case 'image':
      return {
        model: context.model,
        prompt: payload.prompt,
      };

    case 'tts':
      return {
        text: payload.text,
        speed: payload.speed ?? 1.0,
      };

    case 'stt':
      return {
        audio_b64: payload.audio_b64,
        language: payload.language ?? null,
      };
  }
}

/**
 * Build headers with auth
 */
function buildHeaders(
  provider: UniversalProviderConfig,
  context: ProviderRequestContext
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...provider.defaultHeaders,
  };

  const apiKey = context.apiKeyOverride ?? provider.defaultApiKey;
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  return headers;
}

/**
 * Parse response based on modality
 */
async function parseResponse(
  response: Response,
  modality: ModalityType
): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';

  // Binary response (image/audio)
  if (contentType.startsWith('image/') || contentType.startsWith('audio/')) {
    const buffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    return base64;
  }

  // JSON response
  return response.json();
}
```

### File 5: Route Definition

**Create:** `src/routes/__debug__/provider-playground/route.tsx`

```typescript
import { createFileRoute } from '@tanstack/react-router';
import ProviderPlayground from './index';

export const Route = createFileRoute('/__debug__/provider-playground')({
  component: ProviderPlayground,
});
```

---

## Usage

### 1. Access the Playground

```
http://localhost:5173/__debug__/provider-playground
```

### 2. Configure a Provider

1. Click "Show Config"
2. Enter API key (for Chutes.ai, OpenRouter, etc.)
3. Verify endpoints are correct
4. Add/remove models as needed
5. Configuration auto-saves to localStorage

### 3. Send a Request

1. Select provider and model
2. Choose modality (TEXT, IMAGE, TTS, STT)
3. Enter input
4. Adjust parameters
5. Click "Send Request"

### 4. View Results

- Success/failure indicator
- Latency in milliseconds
- Full response JSON
- Image/audio preview for binary responses

---

## Troubleshooting

### CORS Errors

If you see CORS errors in the console:

```
Access to fetch at 'https://llm.chutes.ai/v1' from origin 'http://localhost:5173'
has been blocked by CORS policy
```

**Solution:** The provider may not support browser-based requests. You have two options:

1. **Use a CORS proxy** (for testing only):
   ```
   https://corsproxy.io/?${encodeURIComponent(url)}
   ```

2. **Use backend proxy** (for production):
   - Backend route at `/api/providers/proxy`
   - Forwards requests server-side

### 401 Unauthorized

- Verify API key is correct
- Check key has required permissions
- Some providers require IP whitelisting

### Model Not Found

- Model names are case-sensitive
- Verify model is available on the provider
- Check spelling against provider documentation

---

## Pre-configured Providers

| Provider | API Key Required | Modalities | Notes |
|----------|-----------------|------------|-------|
| Chutes.ai | Yes | text, image, tts, stt | Multi-endpoint provider |
| OpenRouter | Yes | text | Aggregates multiple providers |
| LM Studio | No | text | Local inference |
| Ollama | No | text | Local inference |

---

*Document created: 2026-01-11*
*Workflow: /bmad:bmm:workflows:quick-dev*
*Route: /__debug__/provider-playground*
