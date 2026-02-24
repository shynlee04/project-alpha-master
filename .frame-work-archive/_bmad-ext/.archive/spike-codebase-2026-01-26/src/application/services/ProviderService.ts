/**
 * ProviderService (Application Layer)
 * Orchestrates provider configuration operations
 *
 * Responsibilities:
 * - Provider CRUD operations
 * - API key management
 * - Model fetching and caching
 * - Cross-workspace provider synchronization
 * - Unified content generation (EPIC-41-02)
 * - OpenAI-compatible endpoint support (EPIC-41-03)
 * 
 * @story EPIC-41-02 - Create unified provider service layer
 * @story EPIC-41-03 - Add OpenAI-compatible endpoint support
 * @updated 2026-01-12 - Added generateContent() for unified AI generation
 * @updated 2026-01-13 - Added OpenAI-compatible presets and custom endpoint support
 */

import { emitStoreEvent } from '@/lib/events/store-events';
import { credentialVault } from '@/lib/agent/providers/credential-vault';
import { providerAdapterFactory } from '@/lib/agent/providers/provider-adapter';
import { GeminiAdapter } from '@/lib/agent/providers/gemini-adapter';
import { AnthropicAdapter } from '@/lib/agent/providers/anthropic-adapter';
import type { ProviderModel } from '@/core/entities/Provider';
import { STORE_EVENTS } from '@/lib/events/store-events';

/**
 * Message format for content generation
 */
export interface GenerationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Multimodal content attachment
 * @story EPIC-41-07 - Multimodal capability detection
 */
export interface MultimodalAttachment {
  /** Type of content */
  type: 'image' | 'audio' | 'video' | 'document' | 'url';
  /** MIME type of the content */
  mimeType: string;
  /** Base64 encoded data (for images, audio, video) */
  data?: string;
  /** URL to the content (alternative to base64) */
  url?: string;
  /** Original filename if applicable */
  filename?: string;
  /** Size in bytes */
  size?: number;
}

/**
 * Extended message format with multimodal attachments
 * @story EPIC-41-07 - Multimodal capability detection
 */
export interface MultimodalMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  /** Multimodal attachments (images, audio, video, documents) */
  attachments?: MultimodalAttachment[];
}

/**
 * Requirements detected from multimodal content
 * @story EPIC-41-07 - Multimodal capability detection
 */
export interface MultimodalRequirements {
  /** Does the content require vision capability? */
  requiresVision: boolean;
  /** Does the content require audio processing? */
  requiresAudio: boolean;
  /** Does the content require video processing? */
  requiresVideo: boolean;
  /** Does the content require document understanding? */
  requiresDocumentUnderstanding: boolean;
  /** Does the content require URL/web understanding? */
  requiresUrlUnderstanding: boolean;
  /** Total number of attachments */
  attachmentCount: number;
  /** Total size of all attachments in bytes */
  totalSizeBytes: number;
  /** Detected attachment types */
  attachmentTypes: MultimodalAttachment['type'][];
}

/**
 * Options for content generation
 * @story EPIC-41-03 - Extended with baseURL for custom endpoints
 */
export interface GenerationOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  /** Custom base URL for OpenAI-compatible endpoints */
  baseURL?: string;
  /** Custom headers for the request */
  headers?: Record<string, string>;
}

/**
 * Provider capability flags
 */
export interface ProviderCapabilities {
  supportsStreaming: boolean;
  supportsTools: boolean;
  supportsVision: boolean;
  supportsAudio: boolean;
  supportsVideo: boolean;
  supportsImageGeneration: boolean;
}

/**
 * Fallback chain configuration
 * @story EPIC-41-05 - Provider fallback chain
 */
export interface FallbackConfig {
  /** Ordered list of provider IDs to try */
  providers: string[];
  /** Maximum retry attempts per provider (default: 1) */
  maxRetries?: number;
  /** Delay between retries in ms (default: 1000) */
  retryDelayMs?: number;
  /** Skip providers marked as unhealthy (default: true) */
  skipUnhealthy?: boolean;
  /** Timeout per provider call in ms (default: 30000) */
  timeoutMs?: number;
}

/**
 * Provider health status
 * @story EPIC-41-05 - Provider fallback chain
 */
export interface ProviderHealth {
  providerId: string;
  status: 'healthy' | 'degraded' | 'down';
  lastSuccess: number | null;
  lastFailure: number | null;
  consecutiveFailures: number;
  totalFailures: number;
  totalSuccesses: number;
  averageLatencyMs: number;
}

/**
 * Result from fallback chain execution
 * @story EPIC-41-05 - Provider fallback chain
 */
export interface FallbackResult {
  content: string;
  providerId: string;
  attemptedProviders: string[];
  latencyMs: number;
}

/**
 * Default fallback chain (most reliable providers first)
 */
export const DEFAULT_FALLBACK_CHAIN: string[] = [
  'gemini',      // Usually fastest and most generous rate limits
  'anthropic',   // Very reliable
  'openai',      // Industry standard
  'groq',        // Fast inference
  'together',    // Good fallback
  'openrouter',  // Aggregator (last resort)
];

/**
 * In-memory provider health tracking
 * Key: normalized provider ID
 */
const providerHealthMap = new Map<string, ProviderHealth>();

/**
 * Get or create health record for a provider
 */
function getProviderHealth(providerId: string): ProviderHealth {
  const normalized = normalizeProviderId(providerId);
  let health = providerHealthMap.get(normalized);
  
  if (!health) {
    health = {
      providerId: normalized,
      status: 'healthy',
      lastSuccess: null,
      lastFailure: null,
      consecutiveFailures: 0,
      totalFailures: 0,
      totalSuccesses: 0,
      averageLatencyMs: 0,
    };
    providerHealthMap.set(normalized, health);
  }
  
  return health;
}

/**
 * Update health status based on consecutive failures
 */
function updateHealthStatus(health: ProviderHealth): void {
  if (health.consecutiveFailures >= 5) {
    health.status = 'down';
  } else if (health.consecutiveFailures >= 2) {
    health.status = 'degraded';
  } else {
    health.status = 'healthy';
  }
}

/**
 * Record a successful provider call
 */
function recordProviderSuccess(providerId: string, latencyMs: number): void {
  const health = getProviderHealth(providerId);
  health.lastSuccess = Date.now();
  health.consecutiveFailures = 0;
  health.totalSuccesses++;
  
  // Rolling average latency
  const totalCalls = health.totalSuccesses + health.totalFailures;
  health.averageLatencyMs = ((health.averageLatencyMs * (totalCalls - 1)) + latencyMs) / totalCalls;
  
  updateHealthStatus(health);
}

/**
 * Record a failed provider call
 */
function recordProviderFailure(providerId: string): void {
  const health = getProviderHealth(providerId);
  health.lastFailure = Date.now();
  health.consecutiveFailures++;
  health.totalFailures++;
  
  updateHealthStatus(health);
}

/**
 * Check if an error is retryable (network issues, rate limits, server errors)
 */
function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  
  const message = error.message.toLowerCase();
  
  // Rate limit errors
  if (message.includes('429') || message.includes('rate limit') || message.includes('too many requests')) {
    return true;
  }
  
  // Server errors (5xx)
  if (message.includes('500') || message.includes('502') || message.includes('503') || message.includes('504')) {
    return true;
  }
  
  // Network errors
  if (message.includes('network') || message.includes('timeout') || message.includes('fetch failed')) {
    return true;
  }
  
  // CORS or connection errors
  if (message.includes('failed to fetch') || message.includes('connection refused')) {
    return true;
  }
  
  return false;
}

/**
 * Check if error is a non-retryable auth error
 */
function isAuthError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  
  const message = error.message.toLowerCase();
  return message.includes('401') || 
         message.includes('403') || 
         message.includes('unauthorized') ||
         message.includes('no api key') ||
         message.includes('invalid api key');
}

/**
 * Sleep helper for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ═══════════════════════════════════════════════════════════════════════════════
// MULTIMODAL DETECTION (EPIC-41-07)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * MIME types that require vision capability
 */
const VISION_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 
  'image/svg+xml', 'image/bmp', 'image/tiff'
];

/**
 * MIME types that require audio capability
 */
const AUDIO_MIME_TYPES = [
  'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm',
  'audio/mp4', 'audio/aac', 'audio/flac', 'audio/m4a'
];

/**
 * MIME types that require video capability
 */
const VIDEO_MIME_TYPES = [
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
  'video/x-msvideo', 'video/mpeg'
];

/**
 * MIME types that require document understanding
 */
const DOCUMENT_MIME_TYPES = [
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 'text/csv', 'text/markdown'
];

/**
 * Detect MIME type from base64 data or filename
 * @story EPIC-41-07 - Multimodal capability detection
 */
export function detectMimeType(data?: string, filename?: string): string | null {
  // Try to detect from base64 data signature
  if (data) {
    if (data.startsWith('/9j/')) return 'image/jpeg';
    if (data.startsWith('iVBORw0KGgo')) return 'image/png';
    if (data.startsWith('R0lGOD')) return 'image/gif';
    if (data.startsWith('UklGR')) return 'image/webp';
    if (data.startsWith('JVBERi0')) return 'application/pdf';
    if (data.startsWith('SUQz') || data.startsWith('//uQ')) return 'audio/mpeg';
    if (data.startsWith('T2dnUw')) return 'audio/ogg';
    if (data.startsWith('AAAAIG')) return 'video/mp4';
    if (data.startsWith('GkXfo')) return 'video/webm';
  }
  
  // Try to detect from filename extension
  if (filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    const extToMime: Record<string, string> = {
      'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png',
      'gif': 'image/gif', 'webp': 'image/webp', 'svg': 'image/svg+xml',
      'pdf': 'application/pdf', 'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'mp3': 'audio/mpeg', 'wav': 'audio/wav', 'ogg': 'audio/ogg',
      'mp4': 'video/mp4', 'webm': 'video/webm', 'mov': 'video/quicktime',
    };
    if (ext && ext in extToMime) return extToMime[ext];
  }
  
  return null;
}

/**
 * Check if MIME type requires vision capability
 */
export function requiresVision(mimeType: string): boolean {
  return VISION_MIME_TYPES.includes(mimeType);
}

/**
 * Check if MIME type requires audio capability
 */
export function requiresAudio(mimeType: string): boolean {
  return AUDIO_MIME_TYPES.includes(mimeType);
}

/**
 * Check if MIME type requires video capability
 */
export function requiresVideo(mimeType: string): boolean {
  return VIDEO_MIME_TYPES.includes(mimeType);
}

/**
 * Check if MIME type requires document understanding
 */
export function requiresDocumentUnderstanding(mimeType: string): boolean {
  return DOCUMENT_MIME_TYPES.includes(mimeType);
}

/**
 * Analyze messages to detect multimodal requirements
 * @story EPIC-41-07 - Multimodal capability detection
 * 
 * @example
 * ```typescript
 * const messages: MultimodalMessage[] = [
 *   { role: 'user', content: 'What is in this image?', attachments: [
 *     { type: 'image', mimeType: 'image/jpeg', data: '...' }
 *   ]}
 * ];
 * const requirements = detectMultimodalRequirements(messages);
 * // { requiresVision: true, requiresAudio: false, ... }
 * ```
 */
export function detectMultimodalRequirements(
  messages: MultimodalMessage[]
): MultimodalRequirements {
  const requirements: MultimodalRequirements = {
    requiresVision: false,
    requiresAudio: false,
    requiresVideo: false,
    requiresDocumentUnderstanding: false,
    requiresUrlUnderstanding: false,
    attachmentCount: 0,
    totalSizeBytes: 0,
    attachmentTypes: [],
  };
  
  const typesSet = new Set<MultimodalAttachment['type']>();
  
  for (const message of messages) {
    if (!message.attachments) continue;
    
    for (const attachment of message.attachments) {
      requirements.attachmentCount++;
      requirements.totalSizeBytes += attachment.size || 0;
      typesSet.add(attachment.type);
      
      // Check by attachment type
      switch (attachment.type) {
        case 'image':
          requirements.requiresVision = true;
          break;
        case 'audio':
          requirements.requiresAudio = true;
          break;
        case 'video':
          requirements.requiresVideo = true;
          break;
        case 'document':
          requirements.requiresDocumentUnderstanding = true;
          break;
        case 'url':
          requirements.requiresUrlUnderstanding = true;
          break;
      }
      
      // Also check by MIME type (more specific)
      if (attachment.mimeType) {
        if (requiresVision(attachment.mimeType)) {
          requirements.requiresVision = true;
        }
        if (requiresAudio(attachment.mimeType)) {
          requirements.requiresAudio = true;
        }
        if (requiresVideo(attachment.mimeType)) {
          requirements.requiresVideo = true;
        }
        if (requiresDocumentUnderstanding(attachment.mimeType)) {
          requirements.requiresDocumentUnderstanding = true;
        }
      }
    }
  }
  
  requirements.attachmentTypes = Array.from(typesSet);
  
  return requirements;
}

/**
 * Get providers that support specific multimodal requirements
 * @story EPIC-41-07 - Multimodal capability detection
 */
export function getProvidersForRequirements(
  requirements: MultimodalRequirements
): string[] {
  const allProviders = DEFAULT_FALLBACK_CHAIN;
  
  return allProviders.filter(providerId => {
    const capabilities = getProviderCapabilities(providerId);
    
    // Check if provider meets all requirements
    if (requirements.requiresVision && !capabilities.supportsVision) return false;
    if (requirements.requiresAudio && !capabilities.supportsAudio) return false;
    if (requirements.requiresVideo && !capabilities.supportsVideo) return false;
    
    return true;
  });
}

/**
 * Convert multimodal messages to standard messages (for providers that don't support attachments)
 * This is a fallback that describes the attachments in text
 * @story EPIC-41-07 - Multimodal capability detection
 */
export function flattenMultimodalMessages(
  messages: MultimodalMessage[]
): GenerationMessage[] {
  return messages.map(msg => {
    let content = msg.content;
    
    if (msg.attachments && msg.attachments.length > 0) {
      const attachmentDescriptions = msg.attachments.map(att => {
        const typeLabel = att.type.charAt(0).toUpperCase() + att.type.slice(1);
        const filename = att.filename ? ` (${att.filename})` : '';
        const size = att.size ? ` - ${Math.round(att.size / 1024)}KB` : '';
        return `[${typeLabel}${filename}${size}]`;
      }).join(', ');
      
      content = `${content}\n\n[Attachments: ${attachmentDescriptions}]`;
    }
    
    return {
      role: msg.role,
      content,
    };
  });
}

/**
 * Preset OpenAI-compatible provider configurations
 * @story EPIC-41-03 - Popular provider presets
 */
export const OPENAI_COMPATIBLE_PRESETS: Record<string, {
  name: string;
  baseURL: string;
  defaultModel: string;
  requiresApiKey: boolean;
  description: string;
}> = {
  'ollama': {
    name: 'Ollama (Local)',
    baseURL: 'http://localhost:11434/v1',
    defaultModel: 'llama3.2',
    requiresApiKey: false,
    description: 'Local Ollama server for open-source models',
  },
  'lmstudio': {
    name: 'LM Studio (Local)',
    baseURL: 'http://localhost:1234/v1',
    defaultModel: 'local-model',
    requiresApiKey: false,
    description: 'Local LM Studio server',
  },
  'together': {
    name: 'Together AI',
    baseURL: 'https://api.together.xyz/v1',
    defaultModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    requiresApiKey: true,
    description: 'Together AI cloud inference',
  },
  'groq': {
    name: 'Groq',
    baseURL: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    requiresApiKey: true,
    description: 'Groq ultra-fast inference',
  },
  'fireworks': {
    name: 'Fireworks AI',
    baseURL: 'https://api.fireworks.ai/inference/v1',
    defaultModel: 'accounts/fireworks/models/llama-v3p3-70b-instruct',
    requiresApiKey: true,
    description: 'Fireworks AI inference platform',
  },
  'deepinfra': {
    name: 'DeepInfra',
    baseURL: 'https://api.deepinfra.com/v1/openai',
    defaultModel: 'meta-llama/Llama-3.3-70B-Instruct',
    requiresApiKey: true,
    description: 'DeepInfra serverless inference',
  },
  'perplexity': {
    name: 'Perplexity',
    baseURL: 'https://api.perplexity.ai',
    defaultModel: 'llama-3.1-sonar-large-128k-online',
    requiresApiKey: true,
    description: 'Perplexity AI with web search',
  },
};

/**
 * Normalize provider ID to canonical form
 * Maps legacy/variant IDs to standard IDs
 */
export function normalizeProviderId(providerId: string): string {
  const normalizations: Record<string, string> = {
    'google': 'gemini',      // Legacy name → standard
    'claude': 'anthropic',   // Legacy name → standard
    'gpt': 'openai',         // Shorthand → standard
  };
  return normalizations[providerId.toLowerCase()] || providerId;
}

/**
 * Check if a provider ID is an OpenAI-compatible preset
 */
export function isOpenAICompatiblePreset(providerId: string): boolean {
  return providerId in OPENAI_COMPATIBLE_PRESETS;
}

/**
 * Get preset configuration for an OpenAI-compatible provider
 */
export function getOpenAICompatiblePreset(providerId: string) {
  return OPENAI_COMPATIBLE_PRESETS[providerId];
}

/**
 * Get capabilities for a provider
 */
export function getProviderCapabilities(providerId: string): ProviderCapabilities {
  const normalized = normalizeProviderId(providerId);
  
  const capabilities: Record<string, ProviderCapabilities> = {
    'gemini': {
      supportsStreaming: true,
      supportsTools: true,
      supportsVision: true,
      supportsAudio: true,
      supportsVideo: true,
      supportsImageGeneration: true,
    },
    'openai': {
      supportsStreaming: true,
      supportsTools: true,
      supportsVision: true,
      supportsAudio: true,
      supportsVideo: false,
      supportsImageGeneration: true,
    },
    'anthropic': {
      supportsStreaming: true,
      supportsTools: true,
      supportsVision: true,
      supportsAudio: false,
      supportsVideo: false,
      supportsImageGeneration: false,
    },
    'openrouter': {
      supportsStreaming: true,
      supportsTools: true,
      supportsVision: true,
      supportsAudio: false,
      supportsVideo: false,
      supportsImageGeneration: false,
    },
  };
  
  return capabilities[normalized] || {
    supportsStreaming: true,
    supportsTools: false,
    supportsVision: false,
    supportsAudio: false,
    supportsVideo: false,
    supportsImageGeneration: false,
  };
}

export class ProviderService {
  /**
   * Generate content using any supported provider
   * Unified API that routes to the correct adapter
   * 
   * @story EPIC-41-02 - Unified provider service layer
   * @story EPIC-41-03 - Supports custom OpenAI-compatible endpoints via options.baseURL
   */
  async generateContent(
    providerId: string,
    messages: GenerationMessage[],
    options: GenerationOptions = {}
  ): Promise<string> {
    const normalized = normalizeProviderId(providerId);
    
    // Check if this is an OpenAI-compatible preset
    const preset = getOpenAICompatiblePreset(normalized);
    if (preset || options.baseURL) {
      // Route to OpenAI-compatible handler with custom baseURL
      const baseURL = options.baseURL || preset?.baseURL;
      const apiKey = await credentialVault.getCredentials(normalized) || '';
      
      // For local providers (Ollama, LM Studio), API key is optional
      if (preset?.requiresApiKey && !apiKey) {
        throw new Error(`No API key found for provider: ${normalized}`);
      }
      
      return this.callOpenAICompatible(
        normalized,
        apiKey,
        messages,
        {
          ...options,
          baseURL,
          model: options.model || preset?.defaultModel,
        }
      );
    }
    
    // 1. Get API key for built-in providers
    const apiKey = await credentialVault.getCredentials(normalized);
    if (!apiKey) {
      throw new Error(`No API key found for provider: ${normalized}`);
    }
    
    // 2. Route to correct adapter based on provider type
    const providerConfig = providerAdapterFactory.getProviderConfig(normalized);
    
    if (providerConfig?.type === 'gemini' || normalized === 'gemini') {
      // Use Gemini adapter directly for better multimodal support
      const adapter = new GeminiAdapter({
        apiKey,
        model: options.model || 'gemini-2.5-flash',
      });
      
      const result = await adapter.chat(
        messages.map(m => ({ role: m.role, content: m.content })),
        {
          model: options.model,
          temperature: options.temperature,
          maxTokens: options.maxTokens,
        }
      );
      
      return result.content;
    }
    
    if (providerConfig?.type === 'anthropic' || normalized === 'anthropic') {
      // Use Anthropic adapter
      const adapter = new AnthropicAdapter({
        apiKey,
        model: options.model || 'claude-3-5-sonnet-20241022',
        dangerouslyAllowBrowser: true,
      });
      
      // Convert messages to Anthropic format
      const anthropicMessages = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));
      
      const result = await adapter.chat(anthropicMessages as never, {
        model: options.model,
        temperature: options.temperature,
        maxTokens: options.maxTokens || 4096,
      });
      
      return result.content;
    }
    
    // 3. Default: Use OpenAI-compatible API call
    const response = await this.callOpenAICompatible(
      normalized,
      apiKey,
      messages,
      options
    );
    
    return response;
  }
  
  /**
   * Stream content generation from a provider
   * Returns an async generator that yields text chunks
   * 
   * @story EPIC-42-10 - Streaming output to blocks
   */
  async *generateContentStream(
    providerId: string,
    messages: GenerationMessage[],
    options: GenerationOptions = {}
  ): AsyncGenerator<{ text: string; done: boolean; error?: string }> {
    const normalized = normalizeProviderId(providerId);
    
    // 1. Get API key for built-in providers
    const apiKey = await credentialVault.getCredentials(normalized);
    if (!apiKey) {
      yield { text: '', done: true, error: `No API key found for provider: ${normalized}` };
      return;
    }
    
    // 2. Route to correct adapter based on provider type
    const providerConfig = providerAdapterFactory.getProviderConfig(normalized);
    
    if (providerConfig?.type === 'gemini' || normalized === 'gemini') {
      // Use Gemini adapter's streamChat
      const adapter = new GeminiAdapter({
        apiKey,
        model: options.model || 'gemini-2.5-flash',
      });
      
      try {
        for await (const chunk of adapter.streamChat(
          messages.map(m => ({ role: m.role, content: m.content })),
          {
            model: options.model,
            temperature: options.temperature,
            maxTokens: options.maxTokens,
            stream: true,
          }
        )) {
          if (chunk.type === 'text') {
            yield { text: chunk.text || '', done: false };
          } else if (chunk.type === 'final' || chunk.type === 'stop') {
            yield { text: '', done: true };
          } else if (chunk.type === 'error') {
            yield { text: '', done: true, error: chunk.error };
          }
        }
      } catch (error) {
        yield { 
          text: '', 
          done: true, 
          error: error instanceof Error ? error.message : 'Unknown streaming error' 
        };
      }
      return;
    }
    
    if (providerConfig?.type === 'anthropic' || normalized === 'anthropic') {
      // Use Anthropic adapter's streamChat
      const adapter = new AnthropicAdapter({
        apiKey,
        model: options.model || 'claude-3-5-sonnet-20241022',
        dangerouslyAllowBrowser: true,
      });
      
      const anthropicMessages = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));
      
      try {
        for await (const chunk of adapter.streamChat(anthropicMessages as never, {
          model: options.model,
          temperature: options.temperature,
          maxTokens: options.maxTokens || 4096,
          stream: true,
        })) {
          if (chunk.type === 'content_block_delta' && 'delta' in chunk) {
            const delta = (chunk as any).delta;
            if (delta?.text) {
              yield { text: delta.text, done: false };
            }
          } else if (chunk.type === 'message_stop') {
            yield { text: '', done: true };
          }
        }
      } catch (error) {
        yield { 
          text: '', 
          done: true, 
          error: error instanceof Error ? error.message : 'Unknown streaming error' 
        };
      }
      return;
    }
    
    // 3. Default: OpenAI-compatible streaming (SSE-based)
    yield* this.streamOpenAICompatible(normalized, apiKey, messages, options);
  }
  
  /**
   * Stream from OpenAI-compatible API using Server-Sent Events
   * @story EPIC-42-10 - Streaming output to blocks
   */
  private async *streamOpenAICompatible(
    providerId: string,
    apiKey: string,
    messages: GenerationMessage[],
    options: GenerationOptions
  ): AsyncGenerator<{ text: string; done: boolean; error?: string }> {
    let baseURL = options.baseURL;
    
    if (!baseURL) {
      const preset = getOpenAICompatiblePreset(providerId);
      if (preset) {
        baseURL = preset.baseURL;
      } else {
        const providerConfig = providerAdapterFactory.getProviderConfig(providerId);
        baseURL = providerConfig?.baseURL || 'https://api.openai.com/v1';
      }
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      ...(options.headers || {}),
    };
    
    // Add OpenRouter-specific headers
    if (providerId === 'openrouter') {
      headers['HTTP-Referer'] = typeof window !== 'undefined' ? window.location.origin : 'https://via-gent.dev';
      headers['X-Title'] = 'Via-gent';
    }
    
    let defaultModel = options.model;
    if (!defaultModel) {
      const preset = getOpenAICompatiblePreset(providerId);
      if (preset) {
        defaultModel = preset.defaultModel;
      } else {
        const providerConfig = providerAdapterFactory.getProviderConfig(providerId);
        defaultModel = providerConfig?.defaultModel || 'gpt-4o';
      }
    }
    
    try {
      const response = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: defaultModel,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 2048,
          stream: true,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        yield { text: '', done: true, error: `API error: ${errorText}` };
        return;
      }
      
      if (!response.body) {
        yield { text: '', done: true, error: 'No response body for streaming' };
        return;
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          
          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                yield { text: content, done: false };
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
      
      yield { text: '', done: true };
    } catch (error) {
      yield { 
        text: '', 
        done: true, 
        error: error instanceof Error ? error.message : 'Unknown streaming error' 
      };
    }
  }
  
  /**
   * Generate content using a custom OpenAI-compatible endpoint
   * Convenience method for custom providers
   * 
   * @story EPIC-41-03 - OpenAI-compatible endpoint support
   */
  async generateWithCustomEndpoint(
    baseURL: string,
    messages: GenerationMessage[],
    options: Omit<GenerationOptions, 'baseURL'> & { apiKey?: string } = {}
  ): Promise<string> {
    const apiKey = options.apiKey || '';
    
    return this.callOpenAICompatible(
      'openai-compatible',
      apiKey,
      messages,
      {
        ...options,
        baseURL,
      }
    );
  }
  
  /**
   * Call OpenAI-compatible API (OpenAI, OpenRouter, custom endpoints)
   * @story EPIC-41-03 - Enhanced with options.baseURL support
   */
  private async callOpenAICompatible(
    providerId: string,
    apiKey: string,
    messages: GenerationMessage[],
    options: GenerationOptions
  ): Promise<string> {
    // Determine baseURL: options > preset > providerConfig > default
    let baseURL = options.baseURL;
    
    if (!baseURL) {
      const preset = getOpenAICompatiblePreset(providerId);
      if (preset) {
        baseURL = preset.baseURL;
      } else {
        const providerConfig = providerAdapterFactory.getProviderConfig(providerId);
        baseURL = providerConfig?.baseURL || 'https://api.openai.com/v1';
      }
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    
    // Add Authorization header only if API key is provided
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    
    // Add OpenRouter-specific headers
    if (providerId === 'openrouter') {
      headers['HTTP-Referer'] = typeof window !== 'undefined' ? window.location.origin : 'https://via-gent.dev';
      headers['X-Title'] = 'Via-gent';
    }
    
    // Determine default model
    let defaultModel = options.model;
    if (!defaultModel) {
      const preset = getOpenAICompatiblePreset(providerId);
      if (preset) {
        defaultModel = preset.defaultModel;
      } else {
        const providerConfig = providerAdapterFactory.getProviderConfig(providerId);
        defaultModel = providerConfig?.defaultModel || 'gpt-4o';
      }
    }
    
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: defaultModel,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText.slice(0, 200)}`);
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  /**
   * Set API key for provider and trigger model loading
   */
  async setApiKey(providerId: string, apiKey: string): Promise<void> {
    const normalized = normalizeProviderId(providerId);
    
    // 1. Store key securely
    await credentialVault.storeCredentials(normalized, apiKey);

    // 2. Emit event for cross-workspace reactivity
    emitStoreEvent(STORE_EVENTS.PROVIDER_KEY_SET, {
      providerId: normalized,
      timestamp: Date.now()
    });

    // 3. Auto-load models (skip for local providers that don't need API key)
    const preset = getOpenAICompatiblePreset(normalized);
    if (!preset || preset.requiresApiKey) {
      try {
        await this.fetchModels(normalized);
      } catch (e) {
        console.warn(`[ProviderService] Could not fetch models for ${normalized}:`, e);
      }
    }
  }

  /**
   * Fetch models for a provider
   */
  async fetchModels(providerId: string): Promise<ProviderModel[]> {
    const normalized = normalizeProviderId(providerId);
    
    // 1. Get API key
    const apiKey = await credentialVault.getCredentials(normalized);
    if (!apiKey) {
      throw new Error(`No API key found for provider: ${normalized}`);
    }

    // 2. Create adapter and fetch
    const adapter = providerAdapterFactory.createAdapter(normalized, { apiKey });
    const models = await adapter.getModels();

    // 3. Emit models loaded event
    emitStoreEvent(STORE_EVENTS.PROVIDER_MODELS_LOADED, {
      providerId: normalized,
      modelCount: models.length,
      timestamp: Date.now()
    });

    return models;
  }

  /**
   * Remove API key for provider
   */
  async removeApiKey(providerId: string): Promise<void> {
    const normalized = normalizeProviderId(providerId);
    await credentialVault.deleteCredentials(normalized);

    emitStoreEvent(STORE_EVENTS.PROVIDER_KEY_REMOVED, {
      providerId: normalized,
      timestamp: Date.now()
    });
  }

  /**
   * Test provider connection
   */
  async testConnection(providerId: string): Promise<{ success: boolean; latencyMs: number; error?: string }> {
    const normalized = normalizeProviderId(providerId);
    const apiKey = await credentialVault.getCredentials(normalized);
    if (!apiKey) {
      return { success: false, latencyMs: 0, error: 'No API key' };
    }

    const adapter = providerAdapterFactory.createAdapter(normalized, { apiKey });
    return adapter.testConnection();
  }
  
  /**
   * Test connection to a custom OpenAI-compatible endpoint
   * @story EPIC-41-03 - Custom endpoint testing
   */
  async testCustomEndpoint(
    baseURL: string,
    apiKey?: string
  ): Promise<{ success: boolean; latencyMs: number; error?: string }> {
    const startTime = Date.now();
    
    try {
      const headers: Record<string, string> = {};
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      
      const response = await fetch(`${baseURL}/models`, {
        method: 'GET',
        headers,
      });
      
      const latencyMs = Date.now() - startTime;
      
      if (response.ok) {
        return { success: true, latencyMs };
      } else {
        const errorText = await response.text();
        return { success: false, latencyMs, error: `${response.status}: ${errorText.slice(0, 100)}` };
      }
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      return { 
        success: false, 
        latencyMs, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      };
    }
  }
  
  /**
   * Get all available OpenAI-compatible presets
   * @story EPIC-41-03 - Preset discovery
   */
  getOpenAICompatiblePresets() {
    return OPENAI_COMPATIBLE_PRESETS;
  }
  
  /**
   * Get capabilities for a provider
   */
  getCapabilities(providerId: string): ProviderCapabilities {
    return getProviderCapabilities(providerId);
  }
  
  /**
   * Generate content with automatic fallback to other providers
   * Tries providers in order until one succeeds
   * 
   * @story EPIC-41-05 - Provider fallback chain
   * 
   * @param config - Fallback configuration with provider chain
   * @param messages - Messages to send
   * @param options - Generation options (applied to all providers)
   * @returns Result with content and metadata about which provider was used
   * 
   * @example
   * ```typescript
   * const result = await providerService.generateContentWithFallback(
   *   { providers: ['gemini', 'anthropic', 'openai'], maxRetries: 2 },
   *   [{ role: 'user', content: 'Hello!' }],
   *   { temperature: 0.7 }
   * );
   * console.log(`Used provider: ${result.providerId}`);
   * ```
   */
  async generateContentWithFallback(
    config: FallbackConfig,
    messages: GenerationMessage[],
    options: GenerationOptions = {}
  ): Promise<FallbackResult> {
    const {
      providers = DEFAULT_FALLBACK_CHAIN,
      maxRetries = 1,
      retryDelayMs = 1000,
      skipUnhealthy = true,
      timeoutMs = 30000,
    } = config;
    
    const attemptedProviders: string[] = [];
    const errors: Array<{ provider: string; error: string }> = [];
    const startTime = Date.now();
    
    // Filter providers based on health if requested
    const availableProviders = skipUnhealthy
      ? providers.filter(p => getProviderHealth(p).status !== 'down')
      : providers;
    
    if (availableProviders.length === 0) {
      throw new Error(
        `No healthy providers available. Attempted: ${providers.join(', ')}. ` +
        `All providers are marked as 'down'. Consider resetting health with resetProviderHealth().`
      );
    }
    
    for (const providerId of availableProviders) {
      const normalized = normalizeProviderId(providerId);
      attemptedProviders.push(normalized);
      
      // Retry loop for this provider
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const attemptStart = Date.now();
        
        try {
          // Create a timeout promise
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
          });
          
          // Race between the actual call and timeout
          const content = await Promise.race([
            this.generateContent(normalized, messages, options),
            timeoutPromise,
          ]);
          
          const latencyMs = Date.now() - attemptStart;
          
          // Success! Record it and return
          recordProviderSuccess(normalized, latencyMs);
          
          return {
            content,
            providerId: normalized,
            attemptedProviders,
            latencyMs: Date.now() - startTime,
          };
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          errors.push({ provider: normalized, error: errorMessage });
          
          // Auth errors are not retryable - skip to next provider
          if (isAuthError(error)) {
            console.warn(`[ProviderService] Auth error for ${normalized}, skipping: ${errorMessage}`);
            recordProviderFailure(normalized);
            break; // Skip to next provider
          }
          
          // If this is a retryable error and we have retries left, retry
          if (isRetryableError(error) && attempt < maxRetries) {
            console.warn(`[ProviderService] Retrying ${normalized} (attempt ${attempt + 1}/${maxRetries}): ${errorMessage}`);
            await sleep(retryDelayMs * (attempt + 1)); // Exponential-ish backoff
            continue;
          }
          
          // Not retryable or out of retries - record failure
          recordProviderFailure(normalized);
          console.warn(`[ProviderService] Provider ${normalized} failed: ${errorMessage}`);
          break; // Move to next provider
        }
      }
    }
    
    // All providers failed
    const errorSummary = errors
      .map(e => `${e.provider}: ${e.error.slice(0, 100)}`)
      .join('; ');
    
    throw new Error(
      `All providers in fallback chain failed. ` +
      `Attempted: ${attemptedProviders.join(' → ')}. ` +
      `Errors: ${errorSummary}`
    );
  }
  
  /**
   * Get the default fallback chain
   * @story EPIC-41-05 - Provider fallback chain
   */
  getDefaultFallbackChain(): string[] {
    return [...DEFAULT_FALLBACK_CHAIN];
  }
  
  /**
   * Get health status for a provider
   * @story EPIC-41-05 - Provider fallback chain
   */
  getProviderHealth(providerId: string): ProviderHealth {
    return getProviderHealth(providerId);
  }
  
  /**
   * Get health status for all tracked providers
   * @story EPIC-41-05 - Provider fallback chain
   */
  getAllProviderHealth(): ProviderHealth[] {
    return Array.from(providerHealthMap.values());
  }
  
  /**
   * Reset health status for a provider (mark as healthy)
   * Useful after fixing issues or waiting for rate limits to clear
   * @story EPIC-41-05 - Provider fallback chain
   */
  resetProviderHealth(providerId: string): void {
    const normalized = normalizeProviderId(providerId);
    const health = getProviderHealth(normalized);
    health.consecutiveFailures = 0;
    health.status = 'healthy';
  }
  
  /**
   * Reset health status for all providers
   * @story EPIC-41-05 - Provider fallback chain
   */
  resetAllProviderHealth(): void {
    providerHealthMap.clear();
  }
  
  /**
   * Build a smart fallback chain based on current health and capabilities
   * Prioritizes healthy providers with required capabilities
   * @story EPIC-41-05 - Provider fallback chain
   */
  buildSmartFallbackChain(requiredCapabilities?: Partial<ProviderCapabilities>): string[] {
    const allProviders = [...DEFAULT_FALLBACK_CHAIN];
    
    // Score providers based on health and capability match
    const scored = allProviders.map(providerId => {
      const health = getProviderHealth(providerId);
      const capabilities = getProviderCapabilities(providerId);
      
      let score = 100;
      
      // Health penalties
      if (health.status === 'down') score -= 100;
      else if (health.status === 'degraded') score -= 50;
      
      // Failure history penalty
      score -= health.consecutiveFailures * 10;
      
      // Success history bonus
      if (health.totalSuccesses > 0) {
        score += Math.min(20, health.totalSuccesses);
      }
      
      // Latency penalty (prefer faster providers)
      if (health.averageLatencyMs > 0) {
        score -= Math.min(20, health.averageLatencyMs / 500);
      }
      
      // Capability matching bonus
      if (requiredCapabilities) {
        let capabilityMatches = 0;
        let capabilityRequired = 0;
        
        if (requiredCapabilities.supportsVision) {
          capabilityRequired++;
          if (capabilities.supportsVision) capabilityMatches++;
        }
        if (requiredCapabilities.supportsAudio) {
          capabilityRequired++;
          if (capabilities.supportsAudio) capabilityMatches++;
        }
        if (requiredCapabilities.supportsVideo) {
          capabilityRequired++;
          if (capabilities.supportsVideo) capabilityMatches++;
        }
        if (requiredCapabilities.supportsTools) {
          capabilityRequired++;
          if (capabilities.supportsTools) capabilityMatches++;
        }
        
        if (capabilityRequired > 0) {
          // Providers that don't meet all requirements get heavy penalty
          if (capabilityMatches < capabilityRequired) {
            score -= (capabilityRequired - capabilityMatches) * 30;
          } else {
            score += 20; // Bonus for meeting all requirements
          }
        }
      }
      
      return { providerId, score };
    });
    
    // Sort by score (highest first) and filter out very low scores
    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(s => s.providerId);
  }
  
  /**
   * Run health checks on all configured providers
   * Tests connectivity and updates health status
   * 
   * @story EPIC-41-06 - Provider health check and auto-switch
   * 
   * @param providerIds - Optional list of providers to check (defaults to all known)
   * @returns Map of provider ID to health check result
   */
  async runHealthChecks(
    providerIds?: string[]
  ): Promise<Map<string, { success: boolean; latencyMs: number; error?: string }>> {
    const results = new Map<string, { success: boolean; latencyMs: number; error?: string }>();
    const providersToCheck = providerIds || [...DEFAULT_FALLBACK_CHAIN];
    
    // Run health checks in parallel for efficiency
    const checks = providersToCheck.map(async (providerId) => {
      const normalized = normalizeProviderId(providerId);
      
      try {
        // Check if we have API key first
        const apiKey = await credentialVault.getCredentials(normalized);
        
        // For OpenAI-compatible presets without required API key, check endpoint
        const preset = getOpenAICompatiblePreset(normalized);
        if (preset && !preset.requiresApiKey) {
          const result = await this.testCustomEndpoint(preset.baseURL);
          
          if (result.success) {
            recordProviderSuccess(normalized, result.latencyMs);
          } else {
            recordProviderFailure(normalized);
          }
          
          return { providerId: normalized, result };
        }
        
        // For providers requiring API key
        if (!apiKey) {
          const result = { success: false, latencyMs: 0, error: 'No API key configured' };
          // Don't mark as failure - just not configured
          return { providerId: normalized, result };
        }
        
        // Test the connection
        const result = await this.testConnection(normalized);
        
        if (result.success) {
          recordProviderSuccess(normalized, result.latencyMs);
        } else {
          recordProviderFailure(normalized);
        }
        
        return { providerId: normalized, result };
        
      } catch (error) {
        const result = { 
          success: false, 
          latencyMs: 0, 
          error: error instanceof Error ? error.message : 'Health check failed' 
        };
        recordProviderFailure(normalized);
        return { providerId: normalized, result };
      }
    });
    
    const checkResults = await Promise.all(checks);
    
    for (const { providerId, result } of checkResults) {
      results.set(providerId, result);
    }
    
    return results;
  }
  
  /**
   * Get provider status summary for UI display
   * @story EPIC-41-06 - Provider health check and auto-switch
   */
  getProviderStatusSummary(): Array<{
    providerId: string;
    name: string;
    status: 'healthy' | 'degraded' | 'down' | 'not_configured';
    hasApiKey: boolean;
    lastSuccess: number | null;
    averageLatencyMs: number;
  }> {
    const summary: Array<{
      providerId: string;
      name: string;
      status: 'healthy' | 'degraded' | 'down' | 'not_configured';
      hasApiKey: boolean;
      lastSuccess: number | null;
      averageLatencyMs: number;
    }> = [];
    
    // Include core providers
    const coreProviders = ['gemini', 'anthropic', 'openai', 'openrouter'];
    
    for (const providerId of coreProviders) {
      const health = getProviderHealth(providerId);
      
      // Determine display name
      const names: Record<string, string> = {
        'gemini': 'Google Gemini',
        'anthropic': 'Anthropic Claude',
        'openai': 'OpenAI',
        'openrouter': 'OpenRouter',
      };
      
      summary.push({
        providerId,
        name: names[providerId] || providerId,
        status: health.totalSuccesses === 0 && health.totalFailures === 0 
          ? 'not_configured' 
          : health.status,
        hasApiKey: health.totalSuccesses > 0 || health.totalFailures > 0,
        lastSuccess: health.lastSuccess,
        averageLatencyMs: health.averageLatencyMs,
      });
    }
    
    // Include OpenAI-compatible presets
    for (const [presetId, preset] of Object.entries(OPENAI_COMPATIBLE_PRESETS)) {
      const health = getProviderHealth(presetId);
      
      summary.push({
        providerId: presetId,
        name: preset.name,
        status: health.totalSuccesses === 0 && health.totalFailures === 0 
          ? 'not_configured' 
          : health.status,
        hasApiKey: !preset.requiresApiKey || (health.totalSuccesses > 0 || health.totalFailures > 0),
        lastSuccess: health.lastSuccess,
        averageLatencyMs: health.averageLatencyMs,
      });
    }
    
    return summary;
  }
  
  /**
   * Auto-switch to a healthy provider based on current health status
   * Returns the best available provider or null if none healthy
   * 
   * @story EPIC-41-06 - Provider health check and auto-switch
   */
  async autoSelectProvider(
    preferredProvider?: string,
    requiredCapabilities?: Partial<ProviderCapabilities>
  ): Promise<string | null> {
    // If preferred provider is healthy, use it
    if (preferredProvider) {
      const normalized = normalizeProviderId(preferredProvider);
      const health = getProviderHealth(normalized);
      
      if (health.status === 'healthy') {
        // Verify it has API key or is local
        const apiKey = await credentialVault.getCredentials(normalized);
        const preset = getOpenAICompatiblePreset(normalized);
        
        if (apiKey || (preset && !preset.requiresApiKey)) {
          return normalized;
        }
      }
    }
    
    // Build smart fallback chain based on health and capabilities
    const smartChain = this.buildSmartFallbackChain(requiredCapabilities);
    
    // Find first provider with API key or local provider
    for (const providerId of smartChain) {
      const apiKey = await credentialVault.getCredentials(providerId);
      const preset = getOpenAICompatiblePreset(providerId);
      
      if (apiKey || (preset && !preset.requiresApiKey)) {
        return providerId;
      }
    }
    
    return null;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // MULTIMODAL GENERATION (EPIC-41-07)
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Generate content with multimodal inputs (images, audio, video)
   * Automatically routes to a provider that supports the required capabilities
   * 
   * @story EPIC-41-07 - Multimodal capability detection
   * 
   * @param messages - Messages with optional multimodal attachments
   * @param options - Generation options
   * @returns Generated content
   * 
   * @example
   * ```typescript
   * const result = await providerService.generateMultimodalContent([
   *   { 
   *     role: 'user', 
   *     content: 'What is in this image?',
   *     attachments: [{ type: 'image', mimeType: 'image/jpeg', data: '...' }]
   *   }
   * ]);
   * ```
   */
  async generateMultimodalContent(
    messages: MultimodalMessage[],
    options: GenerationOptions = {}
  ): Promise<FallbackResult> {
    // 1. Detect multimodal requirements
    const requirements = detectMultimodalRequirements(messages);
    
    console.log('[ProviderService] Multimodal requirements:', {
      ...requirements,
      attachmentTypes: requirements.attachmentTypes.join(', ')
    });
    
    // 2. Get providers that support these requirements
    const capableProviders = getProvidersForRequirements(requirements);
    
    if (capableProviders.length === 0) {
      // No provider supports these requirements - try with flattened messages
      console.warn('[ProviderService] No provider supports multimodal requirements, falling back to text-only');
      const flattenedMessages = flattenMultimodalMessages(messages);
      
      return this.generateContentWithFallback(
        { providers: DEFAULT_FALLBACK_CHAIN },
        flattenedMessages,
        options
      );
    }
    
    console.log('[ProviderService] Capable providers:', capableProviders.join(', '));
    
    // 3. Convert multimodal messages for the chosen provider
    // For now, we flatten for non-Gemini providers (they handle multimodal differently)
    const startTime = Date.now();
    
    // Try capable providers in order
    const attemptedProviders: string[] = [];
    const errors: Array<{ provider: string; error: string }> = [];
    
    for (const providerId of capableProviders) {
      const normalized = normalizeProviderId(providerId);
      attemptedProviders.push(normalized);
      
      try {
        // Get API key
        const apiKey = await credentialVault.getCredentials(normalized);
        const preset = getOpenAICompatiblePreset(normalized);
        
        if (!apiKey && (!preset || preset.requiresApiKey)) {
          console.warn(`[ProviderService] No API key for ${normalized}, skipping`);
          continue;
        }
        
        let content: string;
        
        if (normalized === 'gemini') {
          // Gemini supports multimodal natively
          content = await this.generateGeminiMultimodal(messages, options, apiKey!);
        } else if (normalized === 'anthropic') {
          // Anthropic supports vision
          content = await this.generateAnthropicMultimodal(messages, options, apiKey!);
        } else if (normalized === 'openai') {
          // OpenAI supports vision
          content = await this.generateOpenAIMultimodal(messages, options, apiKey!);
        } else {
          // Fallback to text-only for other providers
          const flattenedMessages = flattenMultimodalMessages(messages);
          content = await this.generateContent(normalized, flattenedMessages, options);
        }
        
        const latencyMs = Date.now() - startTime;
        recordProviderSuccess(normalized, latencyMs);
        
        return {
          content,
          providerId: normalized,
          attemptedProviders,
          latencyMs,
        };
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push({ provider: normalized, error: errorMessage });
        recordProviderFailure(normalized);
        console.warn(`[ProviderService] Multimodal generation failed for ${normalized}:`, errorMessage);
      }
    }
    
    // All capable providers failed - throw error
    const errorSummary = errors.map(e => `${e.provider}: ${e.error.slice(0, 100)}`).join('; ');
    throw new Error(`All multimodal-capable providers failed. Attempted: ${attemptedProviders.join(' → ')}. Errors: ${errorSummary}`);
  }
  
  /**
   * Generate content with Gemini using multimodal inputs
   * @story EPIC-41-07 - Multimodal capability detection
   */
  private async generateGeminiMultimodal(
    messages: MultimodalMessage[],
    options: GenerationOptions,
    apiKey: string
  ): Promise<string> {
    const adapter = new GeminiAdapter({
      apiKey,
      model: options.model || 'gemini-2.5-flash',
    });
    
    // Convert multimodal messages to Gemini format
    const geminiMessages = messages.map(msg => {
      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
      
      // Add text content
      if (msg.content) {
        parts.push({ text: msg.content });
      }
      
      // Add attachments
      if (msg.attachments) {
        for (const attachment of msg.attachments) {
          if (attachment.data && attachment.mimeType) {
            parts.push({
              inlineData: {
                mimeType: attachment.mimeType,
                data: attachment.data,
              },
            });
          }
        }
      }
      
      return {
        role: msg.role,
        content: parts.length === 1 && parts[0].text ? parts[0].text : JSON.stringify(parts),
      };
    });
    
    const result = await adapter.chat(geminiMessages, {
      model: options.model,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
    });
    
    return result.content;
  }
  
  /**
   * Generate content with Anthropic using vision inputs
   * @story EPIC-41-07 - Multimodal capability detection
   */
  private async generateAnthropicMultimodal(
    messages: MultimodalMessage[],
    options: GenerationOptions,
    apiKey: string
  ): Promise<string> {
    const adapter = new AnthropicAdapter({
      apiKey,
      model: options.model || 'claude-3-5-sonnet-20241022',
      dangerouslyAllowBrowser: true,
    });
    
    // Convert to Anthropic vision format
    const anthropicMessages = messages
      .filter(m => m.role !== 'system')
      .map(msg => {
        const content: Array<{ type: 'text' | 'image'; text?: string; source?: { type: 'base64'; media_type: string; data: string } }> = [];
        
        // Add text content
        if (msg.content) {
          content.push({ type: 'text', text: msg.content });
        }
        
        // Add image attachments (Anthropic only supports images)
        if (msg.attachments) {
          for (const attachment of msg.attachments) {
            if (attachment.type === 'image' && attachment.data) {
              content.push({
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: attachment.mimeType,
                  data: attachment.data,
                },
              });
            }
          }
        }
        
        return {
          role: msg.role as 'user' | 'assistant',
          content: content.length === 1 && content[0].type === 'text' ? content[0].text! : content,
        };
      });
    
    const result = await adapter.chat(anthropicMessages as never, {
      model: options.model,
      temperature: options.temperature,
      maxTokens: options.maxTokens || 4096,
    });
    
    return result.content;
  }
  
  /**
   * Generate content with OpenAI using vision inputs
   * @story EPIC-41-07 - Multimodal capability detection
   */
  private async generateOpenAIMultimodal(
    messages: MultimodalMessage[],
    options: GenerationOptions,
    apiKey: string
  ): Promise<string> {
    // Build OpenAI-compatible request with vision
    const openAIMessages = messages.map(msg => {
      const content: Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }> = [];
      
      // Add text content
      if (msg.content) {
        content.push({ type: 'text', text: msg.content });
      }
      
      // Add image attachments
      if (msg.attachments) {
        for (const attachment of msg.attachments) {
          if (attachment.type === 'image') {
            if (attachment.url) {
              content.push({
                type: 'image_url',
                image_url: { url: attachment.url },
              });
            } else if (attachment.data) {
              content.push({
                type: 'image_url',
                image_url: { url: `data:${attachment.mimeType};base64,${attachment.data}` },
              });
            }
          }
        }
      }
      
      return {
        role: msg.role,
        content: content.length === 1 && content[0].type === 'text' ? content[0].text : content,
      };
    });
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: options.model || 'gpt-4o',
        messages: openAIMessages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 4096,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorText.slice(0, 200)}`);
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }
  
  /**
   * Get multimodal requirements helper
   * @story EPIC-41-07 - Multimodal capability detection
   */
  detectMultimodalRequirements(messages: MultimodalMessage[]): MultimodalRequirements {
    return detectMultimodalRequirements(messages);
  }
  
  /**
   * Get providers capable of handling given requirements
   * @story EPIC-41-07 - Multimodal capability detection
   */
  getProvidersForRequirements(requirements: MultimodalRequirements): string[] {
    return getProvidersForRequirements(requirements);
  }
}

// Singleton instance
export const providerService = new ProviderService();
