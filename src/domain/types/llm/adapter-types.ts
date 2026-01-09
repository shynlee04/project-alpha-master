/**
 * @fileoverview Adapter Type Definitions
 * @module domain/types/llm/adapter-types
 *
 * Canonical type definitions for provider adapters.
 * Single source of truth for adapter-related types.
 *
 * @ epic EPIC-GU
 * @ story GU-A-01 - Unify Provider Type Definitions
 * @created 2026-01-09
 */

import type { ProviderType } from './provider-types.js';

/**
 * Adapter configuration for creating instances
 *
 * Used by ProviderAdapterFactory after fetching key from vault.
 * Contains runtime configuration for adapter initialization.
 */
export interface AdapterConfig {
  /**
   * API key (decrypted)
   * @security Fetched from credential-vault.ts at runtime, NOT stored in provider state
   */
  apiKey: string;

  /** Optional model ID override */
  model?: string;

  /** Optional base URL override */
  baseURL?: string;

  /** Optional custom headers */
  headers?: Record<string, string>;
}

/**
 * Provider Adapter Interface
 *
 * Defines the contract that all provider adapters must implement.
 * Each adapter (OpenAI, Anthropic, Gemini, etc.) implements this interface.
 */
export interface ProviderAdapter {
  /** The provider type this adapter handles */
  type: ProviderType;

  /**
   * Initialize the adapter with configuration
   * @param config - Adapter configuration including API key
   */
  initialize(config: AdapterConfig): void | Promise<void>;

  /**
   * Generate a chat completion
   * @param messages - Chat messages
   * @param options - Generation options
   * @returns Stream or response
   */
  chat(messages: ChatMessage[], options?: ChatOptions): AsyncIterable<ChatChunk>;

  /**
   * Get available models from the provider
   * @returns List of available models
   */
  getModels?(): Promise<ModelInfo[]>;

  /**
   * Validate the API key
   * @returns True if key is valid
   */
  validateKey?(): Promise<boolean>;
}

/**
 * Chat Message
 *
 * Standard format for chat messages across all providers.
 */
export interface ChatMessage {
  /** Message role */
  role: 'system' | 'user' | 'assistant';

  /** Message content */
  content: string;

  /** Optional tool calls (for assistant messages) */
  toolCalls?: ToolCall[];

  /** Optional tool call ID (for tool response messages) */
  toolCallId?: string;
}

/**
 * Chat Options
 *
 * Optional parameters for chat completion generation.
 */
export interface ChatOptions {
  /** Sampling temperature */
  temperature?: number;

  /** Maximum tokens to generate */
  maxTokens?: number;

  /** Top-p sampling */
  topP?: number;

  /** Top-k sampling */
  topK?: number;

  /** Stop sequences */
  stop?: string[];

  /** Tools to use */
  tools?: ToolDefinition[];

  /** Tool choice */
  toolChoice?: 'auto' | 'required' | { type: 'function'; name: string };
}

/**
 * Chat Chunk
 *
 * Streaming response chunk.
 */
export interface ChatChunk {
  /** Delta content */
  delta?: string;

  /** Tool calls (if any) */
  toolCalls?: ToolCall[];

  /** Whether this is the final chunk */
  done?: boolean;

  /** Usage statistics (on final chunk) */
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

/**
 * Tool Definition
 *
 * Schema for a tool/function that can be called by the model.
 */
export interface ToolDefinition {
  /** Tool name */
  name: string;

  /** Tool description */
  description: string;

  /** Tool parameters as JSON Schema */
  inputSchema: Record<string, unknown>;
}

/**
 * Tool Call
 *
 * A tool/function call requested by the model or executed by the system.
 */
export interface ToolCall {
  /** Tool call ID */
  id: string;

  /** Tool/function name */
  name: string;

  /** Tool arguments (JSON string) */
  arguments: string;
}

/**
 * Adapter Response
 *
 * Standard response format from adapter operations.
 */
export interface AdapterResponse<T = unknown> {
  /** Whether the operation was successful */
  success: boolean;

  /** Response data */
  data?: T;

  /** Error message if failed */
  error?: string;

  /** HTTP status code (if applicable) */
  status?: number;
}

/**
 * Model Info (minimal version for adapter types)
 *
 * Re-exported from model-types for convenience.
 */
export type { ModelInfo } from './model-types.js';
