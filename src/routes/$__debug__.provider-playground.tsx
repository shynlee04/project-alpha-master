/**
 * @fileoverview Provider Test Playground
 * @module routes/$__debug__.provider-playground
 *
 * Debug route for testing OpenAI-compatible providers.
 * Supports text, image, TTS, and STT modalities.
 *
 * ROUTE: /__debug__/provider-playground
 * ACCESS: No authentication (debug only)
 *
 * @ epic EPIC-PRV
 * @ story PRV-05 - Test Playground UI
 *
 * TanStack Router: $ prefix escapes the underscore, so $__debug__ becomes __debug__ in URL
 */

import { useState, useEffect, useCallback } from 'react';
import { createFileRoute } from '@tanstack/react-router';

// ============================================================================
// LOCAL TYPES (Debug Only)
// ============================================================================

/**
 * Supported modality types for multi-modal providers
 */
type ModalityType = 'text' | 'image' | 'tts' | 'stt';

/**
 * Universal Provider Configuration (Debug)
 */
interface UniversalProviderConfig {
  id: string;
  name: string;
  description?: string;
  endpoints: Partial<Record<ModalityType, string>>;
  defaultApiKey?: string;
  requiresApiKey?: boolean;
  defaultHeaders?: Record<string, string>;
  models: UniversalModelConfig[];
  defaultModel?: string;
  docsUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Universal Model Configuration
 */
interface UniversalModelConfig {
  id: string;
  name: string;
  modalities: ModalityType[];
  contextLength?: number;
  supportsStreaming?: boolean;
  isFree?: boolean;
  description?: string;
}

/**
 * Provider Request Context
 */
interface ProviderRequestContext {
  providerId: string;
  model: string;
  modality: ModalityType;
  payload: unknown;
  apiKeyOverride?: string;
  parameters?: {
    maxTokens?: number;
    temperature?: number;
    stream?: boolean;
  };
}

/**
 * Provider Response
 */
interface ProviderResponse {
  success: boolean;
  latencyMs: number;
  data?: unknown;
  statusCode?: number;
  headers?: Record<string, string>;
  error?: string;
}

// ============================================================================
// DEFAULT PROVIDERS
// ============================================================================

const DEFAULT_PROVIDERS: UniversalProviderConfig[] = [
  {
    id: 'chutes',
    name: 'Chutes.ai',
    description: 'Multi-modality AI provider with text, image, TTS, and STT endpoints',
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
    docsUrl: 'https://chutes.ai/docs',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Unified interface for multiple LLM providers with free tier available',
    endpoints: {
      text: 'https://openrouter.ai/api/v1',
    },
    defaultApiKey: '',
    requiresApiKey: true,
    defaultHeaders: {
      // ARCH-01-01: Use window.location.origin for referer header (not full URL)
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
      'X-Title': 'Provider Playground',
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
      {
        id: 'meta-llama/llama-3.1-70b-instruct:free',
        name: 'Llama 3.1 70B Instruct (Free)',
        modalities: ['text'],
        contextLength: 131072,
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
    description: 'Local LLM server running on LM Studio',
    endpoints: {
      text: 'http://localhost:1234/v1',
    },
    defaultApiKey: '',
    requiresApiKey: false,
    defaultHeaders: {
      'Content-Type': 'application/json',
    },
    models: [
      {
        id: 'local-model',
        name: 'Local Model (configure in LM Studio)',
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
    description: 'Ollama local server for open-source models',
    endpoints: {
      text: 'http://localhost:11434/v1',
    },
    defaultApiKey: '',
    requiresApiKey: false,
    defaultHeaders: {
      'Content-Type': 'application/json',
    },
    models: [
      {
        id: 'llama3.2',
        name: 'Llama 3.2',
        modalities: ['text'],
      },
      {
        id: 'qwen2.5',
        name: 'Qwen 2.5',
        modalities: ['text'],
      },
    ],
    defaultModel: 'llama3.2',
    docsUrl: 'https://ollama.com/docs',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ============================================================================
// REQUEST BUILDER
// ============================================================================

function buildRequest(modality: ModalityType, input: string): unknown {
  switch (modality) {
    case 'text':
      return {
        model: '',
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

// ============================================================================
// REQUEST EXECUTOR
// ============================================================================

async function executeRequest(
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

    const url = buildUrl(endpoint, context.modality);
    const body = buildBody(context);
    const headers = buildHeaders(provider, context);

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

    const data = await parseResponse(response);

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

function buildUrl(baseEndpoint: string, modality: ModalityType): string {
  try {
    const url = new URL(baseEndpoint);
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
  } catch {
    return baseEndpoint;
  }
}

function buildBody(context: ProviderRequestContext): unknown {
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
      return { model: context.model, prompt: payload.prompt };
    case 'tts':
      return { text: payload.text, speed: payload.speed ?? 1.0 };
    case 'stt':
      return { audio_b64: payload.audio_b64, language: payload.language ?? null };
  }
}

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

async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.startsWith('image/') || contentType.startsWith('audio/')) {
    const buffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    return base64;
  }
  return response.json();
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface StatusIndicatorProps {
  response: ProviderResponse | null;
  isLoading: boolean;
}

function StatusIndicator({ response, isLoading }: StatusIndicatorProps) {
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

interface ResponseDisplayProps {
  response: ProviderResponse | null;
}

function ResponseDisplay({ response }: ResponseDisplayProps) {
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

  const contentType = response.headers?.['content-type'] ?? '';
  if (contentType.startsWith('image/')) {
    return (
      <div className="border rounded-lg p-4">
        <img
          src={`data:${contentType};base64,${response.data}`}
          alt="Generated"
          className="max-w-full h-auto rounded"
        />
      </div>
    );
  }

  if (contentType.startsWith('audio/')) {
    return (
      <div className="border rounded-lg p-4">
        <audio
          controls
          src={`data:${contentType};base64,${response.data}`}
          className="w-full"
        />
      </div>
    );
  }

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

export const Route = createFileRoute('/$__debug__/provider-playground')({
  component: ProviderPlayground,
});

function ProviderPlayground() {
  const [providers, setProviders] = useState<UniversalProviderConfig[]>(DEFAULT_PROVIDERS);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('chutes');
  const [showConfig, setShowConfig] = useState(false);

  const [selectedModel, setSelectedModel] = useState<string>('');
  const [modality, setModality] = useState<ModalityType>('text');
  const [input, setInput] = useState('Tell me a 250 word story.');
  const [response, setResponse] = useState<ProviderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [maxTokens, setMaxTokens] = useState(1024);
  const [temperature, setTemperature] = useState(0.7);
  const [stream, setStream] = useState(false);

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

  const saveProviders = useCallback((updated: UniversalProviderConfig[]) => {
    setProviders(updated);
    localStorage.setItem('debug-providers', JSON.stringify(updated));
  }, []);

  const currentProvider = providers.find(p => p.id === selectedProviderId);
  const availableModels = currentProvider?.models.filter(m => m.modalities.includes(modality)) ?? [];

  useEffect(() => {
    if (availableModels.length > 0 && !availableModels.find(m => m.id === selectedModel)) {
      setSelectedModel(availableModels[0].id);
    }
  }, [selectedProviderId, modality, availableModels, selectedModel]);

  const updateProvider = useCallback((id: string, updates: Partial<UniversalProviderConfig>) => {
    saveProviders(providers.map(p => p.id === id ? { ...p, ...updates } : p));
  }, [providers, saveProviders]);

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

  const getInputPlaceholder = (): string => {
    switch (modality) {
      case 'text': return 'Enter your prompt...';
      case 'image': return 'Describe the image to generate...';
      case 'tts': return 'Enter text to speak...';
      case 'stt': return 'Paste base64 audio data...';
      default: return 'Enter input...';
    }
  };

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

            {showConfig && currentProvider && (
              <div className="border rounded-lg p-4 bg-card space-y-4">
                <h3 className="font-semibold">Configuration: {currentProvider.name}</h3>
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
              </div>
            )}

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
            </div>

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
                      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                        modality === m
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted'
                      } ${
                        !enabled ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {m.toUpperCase()}
                    </button>
                  );
                })}
              </div>
              <div className="p-3 bg-muted/50 text-sm">
                {modality === 'text' && 'Generate text responses using chat completion API'}
                {modality === 'image' && 'Generate images from text descriptions'}
                {modality === 'tts' && 'Convert text to speech audio'}
                {modality === 'stt' && 'Transcribe audio to text'}
              </div>
            </div>

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
                  🔬 Explain Like I'm 5
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
                    <dt className="text-muted-foreground">Latency</dt>
                    <dd>{response.latencyMs}ms</dd>
                  </div>
                </dl>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
