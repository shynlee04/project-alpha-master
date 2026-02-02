/**
 * Gemini Embeddings - Direct API
 *
 * TanStack AI does NOT support embeddings, so we use direct Gemini API.
 * Uses text-embedding-004 model (768 dimensions by default).
 *
 * @module infrastructure/ai/adapters
 */

export interface EmbeddingConfig {
  model?: string;
  apiKey: string;
  dimensions?: number;
}

const DEFAULT_MODEL = 'text-embedding-004';
const DEFAULT_DIMENSIONS = 768;

interface GeminiEmbeddingResponse {
  embeddings: Array<{ values: number[] }>;
}

/**
 * Generate embeddings using Gemini API
 *
 * @param texts - Array of texts to embed
 * @param config - Configuration including API key and optional model
 * @returns Array of embedding vectors
 */
export async function generateEmbeddings(
  texts: string[],
  config: EmbeddingConfig
): Promise<number[][]> {
  const {
    model = DEFAULT_MODEL,
    apiKey,
    dimensions = DEFAULT_DIMENSIONS,
  } = config;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:batchEmbedContents?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: texts.map((text) => ({
          model: `models/${model}`,
          content: { parts: [{ text }] },
          outputDimensionality: dimensions,
        })),
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini embeddings failed: ${response.status} - ${error}`);
  }

  const data = (await response.json()) as GeminiEmbeddingResponse;
  return data.embeddings.map((e) => e.values);
}

/**
 * Generate a single embedding
 */
export async function generateEmbedding(
  text: string,
  config: EmbeddingConfig
): Promise<number[]> {
  const [embedding] = await generateEmbeddings([text], config);
  return embedding;
}

/** Embedding model info */
export const GEMINI_EMBEDDING_MODELS = {
  'text-embedding-004': {
    dimensions: 768,
    maxInputTokens: 2048,
  },
} as const;
