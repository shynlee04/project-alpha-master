/**
 * AI Gateway Types
 *
 * Core types for the unified AI Gateway that handles all AI operations.
 * Supports dual-mode credentials: client (vault) and server (request body).
 *
 * @module infrastructure/ai/gateway
 */

/** Supported AI providers */
export type AIProvider = 'openrouter' | 'gemini' | 'openai' | 'anthropic' | 'ollama';

/**
 * Credential source for API key resolution
 * - vault: Client-side, from IndexedDB CredentialVault
 * - request: Server-side, passed in request body
 */
export interface CredentialSource {
  type: 'vault' | 'request';
  /** API key (only for 'request' type) */
  apiKey?: string;
}

/** Core gateway configuration */
export interface AIGatewayConfig {
  defaultProvider: AIProvider;
  credentialSource: CredentialSource;
}

/** Message role types */
export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

/** Content part for multimodal messages */
export interface ContentPart {
  type: 'text' | 'image';
  text?: string;
  image_url?: { url: string };
}

/** Chat message */
export interface Message {
  role: MessageRole;
  content: string | ContentPart[];
  name?: string;
  tool_call_id?: string;
}

/** Tool definition for function calling */
export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

/** Chat completion options */
export interface ChatOptions {
  provider: AIProvider;
  model: string;
  messages: Message[];
  tools?: Tool[];
  stream?: boolean;
  credentials?: CredentialSource;
}

/** Image input for vision/multimodal */
export interface ImageInput {
  blob?: Blob;
  base64?: string;
  url?: string;
}

/** Audio input for transcription */
export interface AudioInput {
  blob: Blob;
  mimeType?: string;
}

/** Document input */
export interface DocumentInput {
  content: string;
  mimeType: string;
}

/** Generation types */
export type GenerationType = 'text' | 'image' | 'audio' | 'video' | 'storyboard';

/** Content generation options */
export interface GenerateOptions {
  type: GenerationType;
  provider: AIProvider;
  model?: string;
  prompt: string;
  input?: {
    images?: ImageInput[];
    audio?: AudioInput;
    document?: DocumentInput;
  };
  credentials?: CredentialSource;
}

/** Embedding options (Gemini only) */
export interface EmbedOptions {
  input: string | string[];
  model?: string;
  dimensions?: number;
  credentials?: CredentialSource;
}

/** Transcription options */
export interface TranscribeOptions {
  provider: AIProvider;
  audio: Blob | ArrayBuffer;
  language?: string;
  credentials?: CredentialSource;
}

/** Chat chunk types for streaming */
export type ChatChunkType = 'content' | 'tool_call' | 'tool_result' | 'done' | 'error';

/** Streaming chat chunk */
export interface ChatChunk {
  type: ChatChunkType;
  delta?: string;
  name?: string;
  args?: Record<string, unknown>;
  output?: unknown;
  error?: string;
}

/** Generation result */
export interface GenerateResult {
  text?: string;
  url?: string;
  base64?: string;
  blob?: Blob;
  images?: string[];
}
