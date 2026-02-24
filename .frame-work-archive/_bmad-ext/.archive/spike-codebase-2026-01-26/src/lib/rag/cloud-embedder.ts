/**
 * @fileoverview Cloud Embedding Service (Gemini API)
 * @module lib/rag/cloud-embedder
 * @governance EPIC-7-3
 *
 * Cloud-based embedding generation using Gemini API.
 * Fallback for devices without WebGPU support.
 */

import type { EmbeddingVector } from './types';

/**
 * Gemini API configuration
 */
interface GeminiConfig {
  apiKey: string;
  model?: string;
  baseURL?: string;
}

/**
 * Cloud embedder using Gemini API
 */
export class CloudEmbedder {
  private config: GeminiConfig;
  private model: string;

  constructor(config: GeminiConfig) {
    this.config = {
      ...config,
      baseURL: config.baseURL || 'https://generativelanguage.googleapis.com/v1beta/openai',
    };
    this.model = config.model || 'gemini-embedding-001';
  }

  /**
   * Generate embedding for a single text
   *
   * @param text - Input text
   * @returns Embedding vector (384 dimensions)
   */
  async embed(text: string): Promise<EmbeddingVector> {
    const response = await fetch(`${this.config.baseURL}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const embedding = data.data[0].embedding;

    return Float32Array.from(embedding);
  }

  /**
   * Generate embeddings for multiple texts (batch processing)
   *
   * @param texts - Array of input texts
   * @returns Array of embedding vectors
   */
  async embedBatch(texts: string[]): Promise<EmbeddingVector[]> {
    // Process in parallel
    const embeddings = await Promise.all(
      texts.map((text) => this.embed(text))
    );

    return embeddings;
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.config.apiKey && this.config.apiKey.length > 0;
  }
}

/**
 * Singleton instance (lazy-loaded)
 */
let cloudEmbedderInstance: CloudEmbedder | null = null;

export function getCloudEmbedder(apiKey: string): CloudEmbedder {
  if (!cloudEmbedderInstance) {
    cloudEmbedderInstance = new CloudEmbedder({ apiKey });
  }
  return cloudEmbedderInstance;
}
