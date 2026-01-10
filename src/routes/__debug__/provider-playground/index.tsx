/**
 * @fileoverview Provider Test Playground
 * @module routes/__debug__/provider-playground
 *
 * Debug route for testing OpenAI-compatible providers.
 * Supports text, image, TTS, and STT modalities.
 *
 * ROUTE: /__debug__/provider-playground
 * ACCESS: No authentication (debug only)
 *
 * @ epic EPIC-PRV
 * @ story PRV-05 - Test Playground UI
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  ModalityType,
  UniversalProviderConfig,
  UniversalModelConfig,
  ProviderRequestContext,
  ProviderResponse,
} from './lib/types.js';
import { DEFAULT_PROVIDERS } from './lib/default-providers.js';
import { buildRequest } from './lib/request-builder.js';
import { executeRequest } from './lib/request-executor.js';

// ============================================================================
// SUB-COMPONENTS (Inline for single-file deployment)
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

  // Handle binary response (audio/image)
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
