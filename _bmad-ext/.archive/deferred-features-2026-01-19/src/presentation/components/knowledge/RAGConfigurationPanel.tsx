/**
 * @fileoverview RAG Configuration Panel
 * @module presentation/components/knowledge/RAGConfigurationPanel
 * @governance Architectural Specification v3.0
 *
 * RAG (Retrieval-Augmented Generation) configuration UI.
 * Addresses gap in knowledge synthesis workspace integration.
 */

import { useState } from 'react';
import { FileText, Database, Zap, Sliders, Check, X } from 'lucide-react';

/**
 * Chunking strategy types
 */
export type ChunkingStrategy = 'fixed-size' | 'semantic' | 'hybrid';

/**
 * Embedding model types
 */
export type EmbeddingModel = 'text-embedding-3-small' | 'text-embedding-3-large' | 'cohere-embed-v3';

/**
 * RAG configuration data structure
 */
export interface RAGConfig {
  enabled: boolean;
  chunkingStrategy: ChunkingStrategy;
  chunkSize: number;
  chunkOverlap: number;
  embeddingModel: EmbeddingModel;
  maxContextLength: number;
  topKResults: number;
  minSimilarityScore: number;
  includeMetadata: boolean;
}

/**
 * Props for RAGConfigurationPanel
 */
export interface RAGConfigurationPanelProps {
  config: RAGConfig;
  onUpdateConfig: (config: Partial<RAGConfig>) => void;
  onTestConnection?: () => Promise<boolean>;
}

/**
 * RAG Configuration Panel Component
 *
 * Provides UI for configuring:
 * - Document chunking strategies
 * - Embedding model selection
 * - Retrieval parameters
 * - Context window management
 *
 * @example
 * ```tsx
 * <RAGConfigurationPanel
 *   config={ragConfig}
 *   onUpdateConfig={(updates) => updateRAGConfig(updates)}
 *   onTestConnection={async () => {
 *     const result = await testRAGConnection();
 *     return result;
 *   }}
 * />
 * ```
 */
export function RAGConfigurationPanel({
  config,
  onUpdateConfig,
  onTestConnection,
}: RAGConfigurationPanelProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);

  /**
   * Handle test connection
   */
  const handleTestConnection = async () => {
    if (!onTestConnection) return;

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await onTestConnection();
      setTestResult(result);
    } catch (error) {
      console.error('[RAGConfigurationPanel] Connection test failed:', error);
      setTestResult(false);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">RAG Configuration</h3>
        </div>

        {onTestConnection && (
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-md hover:bg-muted disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            {isTesting ? 'Testing...' : 'Test Connection'}
          </button>
        )}
      </div>

      {/* Test Result */}
      {testResult !== null && (
        <div className={`flex items-center gap-2 p-3 rounded-md ${
          testResult ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
        }`}>
          {testResult ? (
            <>
              <Check className="w-4 h-4" />
              <span className="text-sm">Connection successful! RAG system is ready.</span>
            </>
          ) : (
            <>
              <X className="w-4 h-4" />
              <span className="text-sm">Connection failed. Check your configuration.</span>
            </>
          )}
        </div>
      )}

      {/* Enable RAG Toggle */}
      <div className="flex items-center justify-between p-4 border rounded-none">
        <div>
          <p className="font-medium">Enable RAG</p>
          <p className="text-sm text-muted-foreground">
            Allow agents to retrieve context from knowledge base
          </p>
        </div>

        <button
          onClick={() => onUpdateConfig({ enabled: !config.enabled })}
          className={`relative inline-flex h-6 w-11 items-center rounded-none transition-colors ${
            config.enabled ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-none bg-white transition-transform ${
              config.enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Chunking Strategy */}
      {config.enabled && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Chunking Strategy</label>

            <div className="grid grid-cols-3 gap-2">
              {(['fixed-size', 'semantic', 'hybrid'] as ChunkingStrategy[]).map((strategy) => (
                <button
                  key={strategy}
                  onClick={() => onUpdateConfig({ chunkingStrategy: strategy })}
                   className={`px-3 py-2 text-sm border rounded-none transition-colors ${
                     config.chunkingStrategy === strategy
                       ? 'bg-primary text-primary-foreground border-primary'
                       : 'hover:bg-muted'
                   }`}
                >
                  {strategy === 'fixed-size' ? 'Fixed Size' : strategy === 'semantic' ? 'Semantic' : 'Hybrid'}
                </button>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              {config.chunkingStrategy === 'fixed-size' && 'Split documents into equal-sized chunks'}
              {config.chunkingStrategy === 'semantic' && 'Split documents based on semantic boundaries'}
              {config.chunkingStrategy === 'hybrid' && 'Combine semantic analysis with size limits'}
            </p>
          </div>

          {/* Chunk Size and Overlap */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Chunk Size (tokens)</label>
              <input
                type="number"
                value={config.chunkSize}
                onChange={(e) => onUpdateConfig({ chunkSize: parseInt(e.target.value) })}
                min={128}
                max={8192}
                step={128}
                className="w-full px-3 py-2 border rounded-md"
              />
              <p className="text-xs text-muted-foreground">
                {config.chunkSize} tokens per chunk
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Chunk Overlap (tokens)</label>
              <input
                type="number"
                value={config.chunkOverlap}
                onChange={(e) => onUpdateConfig({ chunkOverlap: parseInt(e.target.value) })}
                min={0}
                max={512}
                step={32}
                className="w-full px-3 py-2 border rounded-md"
              />
              <p className="text-xs text-muted-foreground">
                {config.chunkOverlap} tokens overlap between chunks
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Embedding Model */}
      {config.enabled && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Embedding Model</label>

          <select
            value={config.embeddingModel}
            onChange={(e) => onUpdateConfig({ embeddingModel: e.target.value as EmbeddingModel })}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="text-embedding-3-small">OpenAI text-embedding-3-small (Fast)</option>
            <option value="text-embedding-3-large">OpenAI text-embedding-3-large (Accurate)</option>
            <option value="cohere-embed-v3">Cohere embed-v3 (Multilingual)</option>
          </select>

          <p className="text-xs text-muted-foreground">
            Model used to generate vector embeddings for documents
          </p>
        </div>
      )}

      {/* Retrieval Parameters */}
      {config.enabled && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Retrieval Parameters</h4>

          {/* Top K Results */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm">Top K Results</label>
              <span className="text-xs text-muted-foreground">{config.topKResults} chunks</span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              value={config.topKResults}
              onChange={(e) => onUpdateConfig({ topKResults: parseInt(e.target.value) })}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Number of relevant chunks to retrieve
            </p>
          </div>

          {/* Min Similarity Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm">Min Similarity Score</label>
              <span className="text-xs text-muted-foreground">{(config.minSimilarityScore * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={config.minSimilarityScore}
              onChange={(e) => onUpdateConfig({ minSimilarityScore: parseFloat(e.target.value) })}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Minimum similarity threshold for retrieved chunks
            </p>
          </div>

          {/* Max Context Length */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm">Max Context Length</label>
              <span className="text-xs text-muted-foreground">{config.maxContextLength} tokens</span>
            </div>
            <input
              type="range"
              min={1000}
              max={32000}
              step={1000}
              value={config.maxContextLength}
              onChange={(e) => onUpdateConfig({ maxContextLength: parseInt(e.target.value) })}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Maximum tokens from retrieved chunks to include in context
            </p>
          </div>
        </div>
      )}

      {/* Advanced Options */}
      {config.enabled && (
        <details className="border rounded-none">
          <summary className="px-4 py-3 cursor-pointer hover:bg-muted/50">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              <span className="text-sm font-medium">Advanced Options</span>
            </div>
          </summary>

          <div className="p-4 space-y-4 border-t">
            {/* Include Metadata */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Include Metadata</p>
                <p className="text-xs text-muted-foreground">
                  Attach file metadata to chunks
                </p>
              </div>

              <button
                onClick={() => onUpdateConfig({ includeMetadata: !config.includeMetadata })}
                className={`relative inline-flex h-6 w-11 items-center rounded-none transition-colors ${
                  config.includeMetadata ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-none bg-white transition-transform ${
                    config.includeMetadata ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </details>
      )}

      {/* Documentation */}
      <div className="p-4 bg-muted/30 rounded-none">
        <div className="flex items-start gap-2">
          <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">About RAG</p>
            <p className="mt-1">
              Retrieval-Augmented Generation (RAG) enhances agent responses by retrieving relevant context
              from your knowledge base. Configure chunking strategies, embedding models, and retrieval
              parameters to optimize for your use case.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
