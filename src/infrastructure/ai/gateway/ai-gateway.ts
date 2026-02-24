/**
 * AI Gateway - Unified AI Operations Entry Point
 *
 * Single entry point for ALL AI operations across the application.
 * Supports dual-mode credentials:
 * - Client mode: Gets API key from CredentialVault (IndexedDB)
 * - Server mode: Gets API key from request body
 *
 * @module infrastructure/ai/gateway
 */

import { credentialVault } from '../credential-vault';
import type {
  AIProvider,
  AIGatewayConfig,
  CredentialSource,
  ChatOptions,
  GenerateOptions,
  EmbedOptions,
  TranscribeOptions,
  ChatChunk,
  GenerateResult,
  Message,
} from './types';

/**
 * Models known to NOT support function calling
 * Preserved from existing chat.ts
 */
const MODELS_WITHOUT_TOOL_SUPPORT = [
  'nex-agi/deepseek-v3.1-nex-n1:free',
  'deepseek/deepseek-chat:free',
  'deepseek-chat',
  'mistralai/devstral-2512:free',
  'mistralai/',
];

/**
 * Unified AI Gateway
 */
export class AIGateway {
  private config: AIGatewayConfig;

  constructor(config: AIGatewayConfig) {
    this.config = config;
  }

  /**
   * Get API key from appropriate source (vault or request)
   */
  protected async getApiKey(
    provider: AIProvider,
    credentials?: CredentialSource
  ): Promise<string> {
    const source = credentials ?? this.config.credentialSource;

    if (source.type === 'request') {
      if (!source.apiKey) {
        throw new Error(`API key required for ${provider} in server mode`);
      }
      return source.apiKey;
    }

    // Client mode: get from vault
    const creds = await credentialVault.getCredentials(provider);
    if (!creds) {
      throw new Error(
        `No API key found for ${provider} in vault. Configure in Settings > Providers.`
      );
    }
    return creds;
  }

  /**
   * Check if model supports tool/function calling
   */
  protected modelSupportsTools(modelId: string): boolean {
    return !MODELS_WITHOUT_TOOL_SUPPORT.some((m) => modelId.includes(m));
  }

  /**
   * Create TanStack AI adapter for the specified provider
   */
  protected async createAdapter(
    provider: AIProvider,
    model: string,
    apiKey: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    const adapters = await import('../adapters');

    switch (provider) {
      case 'openrouter':
        return adapters.createOpenRouterAdapter({ apiKey, model });

      case 'gemini':
        return adapters.createGeminiAdapter({ apiKey, model });

      case 'openai':
        return adapters.createOpenRouterAdapter({ apiKey, model });

      case 'anthropic':
        throw new Error('Anthropic adapter not yet implemented');

      case 'ollama':
        throw new Error('Ollama adapter not yet implemented');

      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /**
   * Streaming chat completion
   */
  async *chat(options: ChatOptions): AsyncIterable<ChatChunk> {
    const { provider, model, messages, tools, credentials } = options;

    try {
      const apiKey = await this.getApiKey(provider, credentials);
      const adapter = await this.createAdapter(provider, model, apiKey);

      const supportedTools =
        tools && this.modelSupportsTools(model) ? tools : undefined;

      if (tools && !supportedTools) {
        console.warn(
          `Model ${model} does not support tools, ignoring tools parameter`
        );
      }

      const { chat: tanstackChat } = await import('@tanstack/ai');

      const stream = tanstackChat({
        adapter,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messages: messages.map((m) => ({
          role: m.role === 'system' ? 'user' : m.role,
          content:
            typeof m.content === 'string'
              ? m.content
              : JSON.stringify(m.content),
        })) as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tools: supportedTools as any,
      });

      for await (const event of stream) {
        if (typeof event === 'string') {
          yield { type: 'content', delta: event };
        } else if (event && typeof event === 'object') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const e = event as any;
          if (e.type === 'text') {
            yield { type: 'content', delta: e.text };
          } else if (e.type === 'tool_call') {
            yield { type: 'tool_call', name: e.name, args: e.args };
          } else if (e.type === 'tool_result') {
            yield { type: 'tool_result', name: e.name, output: e.output };
          } else if (e.type === 'done') {
            yield { type: 'done' };
          }
        }
      }

      yield { type: 'done' };
    } catch (error) {
      yield {
        type: 'error',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Generate content (text, image, audio, video, storyboard)
   */
  async generate(options: GenerateOptions): Promise<GenerateResult> {
    const { type, provider, credentials } = options;
    const apiKey = await this.getApiKey(provider, credentials);

    switch (type) {
      case 'text':
        return this.generateText(apiKey, options);

      case 'image':
        throw new Error('Image generation not yet implemented - Phase C');

      case 'audio':
        throw new Error('Audio generation not yet implemented - Phase C');

      case 'video':
        throw new Error('Video generation not yet implemented - Phase C');

      case 'storyboard':
        throw new Error('Storyboard generation not yet implemented - Phase C');

      default:
        throw new Error(`Unknown generation type: ${type}`);
    }
  }

  /**
   * Generate text content by collecting streaming response
   */
  private async generateText(
    _apiKey: string,
    options: GenerateOptions
  ): Promise<GenerateResult> {
    const { provider, model, prompt, input, credentials } = options;

    const messages: Message[] = [];

    if (input?.images?.length) {
      const imageContent = input.images.map((img) => ({
        type: 'image' as const,
        image_url: {
          url:
            img.url ?? (img.base64 ? `data:image/png;base64,${img.base64}` : ''),
        },
      }));

      messages.push({
        role: 'user',
        content: [...imageContent, { type: 'text' as const, text: prompt }],
      });
    } else {
      messages.push({
        role: 'user',
        content: prompt,
      });
    }

    let text = '';

    for await (const chunk of this.chat({
      provider,
      model: model ?? 'gemini-2.0-flash',
      messages,
      credentials,
    })) {
      if (chunk.type === 'content' && chunk.delta) {
        text += chunk.delta;
      }
      if (chunk.type === 'error') {
        throw new Error(chunk.error);
      }
    }

    return { text };
  }

  /**
   * Generate embeddings using Gemini
   */
  async embed(options: EmbedOptions): Promise<number[][]> {
    const apiKey = await this.getApiKey('gemini', options.credentials);
    const inputs = Array.isArray(options.input) ? options.input : [options.input];

    const { generateEmbeddings } = await import('../adapters');

    return generateEmbeddings(inputs, {
      apiKey,
      model: options.model ?? 'text-embedding-004',
      dimensions: options.dimensions ?? 768,
    });
  }

  /**
   * Transcribe audio (not yet implemented)
   */
  async transcribe(_options: TranscribeOptions): Promise<string> {
    throw new Error('transcribe() not yet implemented');
  }
}

/**
 * Singleton gateway for client-side usage
 */
export const aiGateway = new AIGateway({
  defaultProvider: 'openrouter',
  credentialSource: { type: 'vault' },
});

/**
 * Factory for server-side usage
 */
export function createServerGateway(
  apiKey: string,
  provider: AIProvider = 'openrouter'
): AIGateway {
  return new AIGateway({
    defaultProvider: provider,
    credentialSource: { type: 'request', apiKey },
  });
}
