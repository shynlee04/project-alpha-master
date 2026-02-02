/**
 * AI Provider Adapters
 * @module infrastructure/ai/adapters
 */

export {
  createOpenRouterAdapter,
  OPENROUTER_DEFAULT_MODELS,
  type OpenRouterAdapterConfig,
} from './openrouter-adapter';

export {
  createGeminiAdapter,
  GEMINI_DEFAULT_MODELS,
  type GeminiAdapterConfig,
} from './gemini-adapter';

export {
  generateEmbeddings,
  generateEmbedding,
  GEMINI_EMBEDDING_MODELS,
  type EmbeddingConfig,
} from './gemini-embeddings';
