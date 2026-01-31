# Multi-LLM Provider Architecture & Abstraction Patterns Research

**Research Date:** 2026-01-25
**Source:** Web Search & Documentation Analysis
**Status:** COMPLETE

## Executive Summary

This document compiles research on multi-LLM provider architecture patterns, focusing on unified interfaces detection, and, capability adapter pattern implementations. Key findings from Vercel AI SDK, LangChain, and OmniLLM (Go) provide comprehensive patterns for building provider-agnostic LLM applications.

---

## 1. Unified Provider Interfaces

### 1.1 Core TypeScript Interface Pattern

```typescript
// ============================================================
// UNIFIED LLM PROVIDER INTERFACE (Based on Vercel AI SDK & LangChain)
// ============================================================

// Message Types
export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

export interface Message {
  role: MessageRole;
  content: string;
  name?: string;
  tool_call_id?: string;
}

// Completion Options
export interface CompletionOptions {
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  stop?: string[];
  presencePenalty?: number;
  frequencyPenalty?: number;
  seed?: number;
  responseFormat?: {
    type: 'json_object' | 'text';
  };
  logprobs?: boolean;
  topLogprobs?: number;
  user?: string;
  logitBias?: Record<string, number>;
  n?: number;
}

// Usage Statistics
export interface UsageInfo {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

// Completion Response
export interface CompletionResponse {
  content: string;
  usage?: UsageInfo;
  raw: unknown; // Provider-specific response for debugging
  providerMetadata?: Record<string, unknown>;
}

// Streaming Chunk
export interface StreamingChunk {
  content: string;
  role?: MessageRole;
  providerMetadata?: Record<string, unknown>;
}

// ============================================================
// PROVIDER INTERFACE CONTRACT
// ============================================================

export interface ILLMProvider {
  // Provider Identification
  readonly name: string;
  readonly version: string;
  
  // Core Methods
  generateCompletion(
    messages: Message[],
    options: CompletionOptions
  ): Promise<CompletionResponse>;
  
  // Streaming Support
  createChatCompletionStream(
    messages: Message[],
    options: CompletionOptions
  ): AsyncIterable<StreamingChunk>;
  
  // Capability Detection
  getCapabilities(): ProviderCapabilities;
  
  // Model Information
  getModels(): ProviderModel[];
  
  // Lifecycle
  close(): Promise<void>;
}

// ============================================================
// CAPABILITY DEFINITIONS
// ============================================================

export interface ProviderCapabilities {
  // Feature Support Flags
  supportsStreaming: boolean;
  supportsVision: boolean;
  supportsToolUse: boolean;
  supportsToolStreaming: boolean;
  supportsObjectGeneration: boolean;
  supportsJsonMode: boolean;
  supportsSeed: boolean;
  supportsTopK: boolean;
  supportsTopP: boolean;
  supportsStopSequences: boolean;
  supportsLogprobs: boolean;
  supportsUserPii: boolean;
  supportsResponseMimeType: boolean;
  
  // Limits
  maxContextTokens: number;
  maxOutputTokens: number;
  maxInputFiles?: number;
  maxVideoLength?: string;
  
  // Pricing (optional)
  pricing?: {
    inputPer1kTokens: number;
    outputPer1kTokens: number;
  };
}

export interface ProviderModel {
  id: string;
  name: string;
  capabilities: ProviderCapabilities;
  contextWindow: number;
  maxOutputTokens: number;
  isDefault?: boolean;
}
```

### 1.2 Go Interface Pattern (OmniLLM Reference)

```go
// ============================================================
// GO PROVIDER INTERFACE (Based on OmniLLM)
// ============================================================

package provider

import (
    "context"
    "io"
)

// ChatCompletionRequest - Unified request structure
type ChatCompletionRequest struct {
    Model            string              `json:"model"`
    Messages         []Message           `json:"messages"`
    MaxTokens        *int                `json:"max_tokens,omitempty"`
    Temperature      *float64            `json:"temperature,omitempty"`
    TopP             *float64            `json:"top_p,omitempty"`
    TopK             *int                `json:"top_k,omitempty"`
    Stop             []string            `json:"stop,omitempty"`
    PresencePenalty  *float64            `json:"presence_penalty,omitempty"`
    FrequencyPenalty *float64            `json:"frequency_penalty,omitempty"`
    Seed             *int                `json:"seed,omitempty"`
    ResponseFormat   *ResponseFormat     `json:"response_format,omitempty"`
    Logprobs         *bool               `json:"logprobs,omitempty"`
    TopLogprobs      *int                `json:"top_logprobs,omitempty"`
    User             *string             `json:"user,omitempty"`
    LogitBias        map[string]int      `json:"logit_bias,omitempty"`
    N                *int                `json:"n,omitempty"`
}

// Message - Unified message structure
type Message struct {
    Role         string         `json:"role"`
    Content      string         `json:"content"`
    Name         *string        `json:"name,omitempty"`
    ToolCallID   *string        `json:"tool_call_id,omitempty"`
    ToolCalls    []ToolCall     `json:"tool_calls,omitempty"`
    ToolCallResult *ToolCallResult `json:"tool_call_result,omitempty"`
}

// ToolCall - Function calling support
type ToolCall struct {
    ID       string          `json:"id"`
    Type     string          `json:"type"`
    Function FunctionCall    `json:"function"`
}

type FunctionCall struct {
    Name      string `json:"name"`
    Arguments string `json:"arguments"`
}

// ChatCompletionResponse - Unified response structure
type ChatCompletionResponse struct {
    ID              string          `json:"id"`
    Object          string          `json:"object"`
    Created         int64           `json:"created"`
    Model           string          `json:"model"`
    ProviderName    string          `json:"provider_name"`
    Choices         []ChatChoice    `json:"choices"`
    Usage           Usage           `json:"usage"`
    ProviderMetadata map[string]any `json:"provider_metadata,omitempty"`
}

type ChatChoice struct {
    Index        int             `json:"index"`
    Message      Message         `json:"message"`
    FinishReason string          `json:"finish_reason"`
    Logprobs     *LogprobsResult `json:"logprobs,omitempty"`
}

type Usage struct {
    PromptTokens     int `json:"prompt_tokens"`
    CompletionTokens int `json:"completion_tokens"`
    TotalTokens      int `json:"total_tokens"`
}

// ChatCompletionStream - Streaming interface
type ChatCompletionStream interface {
    Recv() (*ChatCompletionStreamResponse, error)
    Close() error
}

type ChatCompletionStreamResponse struct {
    ID              string        `json:"id"`
    Object          string        `json:"object"`
    Created         int64         `json:"created"`
    Model           string        `json:"model"`
    ProviderName    string        `json:"provider_name"`
    Choices         []StreamChoice `json:"choices"`
    Usage           *Usage        `json:"usage,omitempty"`
}

type StreamChoice struct {
    Index        int              `json:"index"`
    Delta        Message          `json:"delta"`
    FinishReason *string          `json:"finish_reason,omitempty"`
}

// Provider - Core interface all providers must implement
type Provider interface {
    // Provider identification
    Name() string
    
    // Lifecycle
    Close() error
    
    // Non-streaming completion
    CreateChatCompletion(
        ctx context.Context,
        req *ChatCompletionRequest,
    ) (*ChatCompletionResponse, error)
    
    // Streaming completion
    CreateChatCompletionStream(
        ctx context.Context,
        req *ChatCompletionRequest,
    ) (ChatCompletionStream, error)
}
```

---

## 2. Provider-Specific Capability Handling

### 2.1 Capability Matrix (Current Market Leaders)

| Provider | Top Model | Vision | Tool Use | Streaming | Context Window |
|----------|-----------|--------|----------|-----------|----------------|
| **OpenAI** | GPT-4o/5 | ✅ Native | ✅ Standard | ✅ SSE | 128K-200K |
| **Anthropic** | Claude 4 | ✅ High Perf | ✅ Specialized | ✅ SSE | 200K |
| **Google** | Gemini 2.5 | ✅ Video + Image | ✅ Native | ✅ gRPC/REST | 1M-2M |
| **xAI** | Grok 4 | ❌ | ✅ | ✅ SSE | 128K-2M |
| **Mistral** | Pixtral Large | ✅ | ✅ Advanced | ✅ SSE | 128K |
| **Ollama** | Llama/Mistral | Varies | ✅ | ✅ | Varies |

### 2.2 Capability Detection Interface

```typescript
// ============================================================
// CAPABILITY DETECTION SYSTEM
// ============================================================

export enum CapabilityType {
  VISION = 'vision',
  TOOL_USE = 'tool_use',
  STREAMING = 'streaming',
  JSON_MODE = 'json_mode',
  SEED = 'seed',
  TOP_K = 'top_k',
  LOGPROBS = 'logprobs',
  VIDEO_UNDERSTANDING = 'video_understanding',
  COMPUTER_USE = 'computer_use',
}

export interface ModelCapabilityRegistry {
  // OpenAI Models
  'gpt-5': {
    vision: true;
    toolUse: true;
    streaming: true;
    jsonMode: true;
    seed: true;
    topK: false;
    logprobs: true;
    maxContextTokens: 200000;
  };
  'gpt-4o': {
    vision: true;
    toolUse: true;
    streaming: true;
    jsonMode: true;
    seed: true;
    topK: false;
    logprobs: true;
    maxContextTokens: 128000;
  };
  'gpt-4o-mini': {
    vision: true;
    toolUse: true;
    streaming: true;
    jsonMode: true;
    seed: true;
    topK: false;
    logprobs: true;
    maxContextTokens: 128000;
  };
  
  // Anthropic Models
  'claude-opus-4': {
    vision: true;
    toolUse: true;
    streaming: true;
    jsonMode: true;
    seed: false;
    topK: true;
    logprobs: true;
    maxContextTokens: 200000;
  };
  'claude-sonnet-4': {
    vision: true;
    toolUse: true;
    streaming: true;
    jsonMode: true;
    seed: false;
    topK: true;
    logprobs: true;
    maxContextTokens: 200000;
  };
  'claude-3-5-haiku': {
    vision: true;
    toolUse: true;
    streaming: true;
    jsonMode: true;
    seed: false;
    topK: true;
    logprobs: true;
    maxContextTokens: 200000;
  };
  
  // Google Models
  'gemini-2-5-pro': {
    vision: true;
    toolUse: true;
    streaming: true;
    jsonMode: true;
    seed: false;
    topK: true;
    logprobs: false;
    maxContextTokens: 2000000;
  };
  'gemini-2-5-flash': {
    vision: true;
    toolUse: true;
    streaming: true;
    jsonMode: true;
    seed: false;
    topK: true;
    logprobs: false;
    maxContextTokens: 1000000;
  };
  'gemini-1-5-pro': {
    vision: true;
    toolUse: true;
    streaming: true;
    jsonMode: true;
    seed: false;
    topK: true;
    logprobs: false;
    maxContextTokens: 2000000;
  };
  
  // xAI Models
  'grok-4': {
    vision: false;
    toolUse: true;
    streaming: true;
    jsonMode: true;
    seed: true;
    topK: false;
    logprobs: false;
    maxContextTokens: 128000;
  };
  'grok-3': {
    vision: false;
    toolUse: true;
    streaming: true;
    jsonMode: true;
    seed: true;
    topK: false;
    logprobs: false;
    maxContextTokens: 128000;
  };
}

// Capability Detection Service
export class CapabilityDetector {
  private registry: Map<string, ModelCapabilities> = new Map();
  
  constructor() {
    this.initializeDefaultCapabilities();
  }
  
  private initializeDefaultCapabilities(): void {
    // Initialize with known model capabilities
    const knownModels: Record<string, ModelCapabilities> = {
      'gpt-5': { vision: true, toolUse: true, streaming: true, maxContextTokens: 200000 },
      'gpt-4o': { vision: true, toolUse: true, streaming: true, maxContextTokens: 128000 },
      'claude-opus-4': { vision: true, toolUse: true, streaming: true, maxContextTokens: 200000 },
      'gemini-2-5-pro': { vision: true, toolUse: true, streaming: true, maxContextTokens: 2000000 },
    };
    
    Object.entries(knownModels).forEach(([model, caps]) => {
      this.registry.set(model, caps);
    });
  }
  
  getCapabilities(modelId: string): ModelCapabilities {
    // Try exact match first
    if (this.registry.has(modelId)) {
      return this.registry.get(modelId)!;
    }
    
    // Try prefix match (e.g., 'gpt-4' matches 'gpt-4o')
    for (const [registeredModel, caps] of this.registry) {
      if (modelId.startsWith(registeredModel)) {
        return caps;
      }
    }
    
    // Return conservative defaults
    return {
      vision: false,
      toolUse: false,
      streaming: true,
      jsonMode: false,
      seed: false,
      topK: false,
      logprobs: false,
      maxContextTokens: 4096,
    };
  }
  
  supportsFeature(modelId: string, feature: CapabilityType): boolean {
    const caps = this.getCapabilities(modelId);
    switch (feature) {
      case CapabilityType.VISION: return caps.vision;
      case CapabilityType.TOOL_USE: return caps.toolUse;
      case CapabilityType.STREAMING: return caps.streaming;
      case CapabilityType.JSON_MODE: return caps.jsonMode;
      case CapabilityType.SEED: return caps.seed;
      case CapabilityType.TOP_K: return caps.topK;
      case CapabilityType.LOGPROBS: return caps.logprobs;
      case CapabilityType.VIDEO_UNDERSTANDING: return caps.videoUnderstanding;
      default: return false;
    }
  }
  
  validateRequest(modelId: string, request: CompletionOptions): ValidationResult {
    const caps = this.getCapabilities(modelId);
    const errors: ValidationError[] = [];
    
    if (request.maxTokens && request.maxTokens > caps.maxOutputTokens) {
      errors.push({
        field: 'maxTokens',
        message: `maxTokens (${request.maxTokens}) exceeds model's maxOutputTokens (${caps.maxOutputTokens})`,
      });
    }
    
    if (!caps.streaming && request.stream) {
      errors.push({
        field: 'stream',
        message: 'Model does not support streaming',
      });
    }
    
    if (!caps.seed && request.seed !== undefined) {
      errors.push({
        field: 'seed',
        message: 'Model does not support seed parameter',
      });
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
```

---

## 3. Adapter Pattern Implementations

### 3.1 OpenAI Adapter (TypeScript)

```typescript
// ============================================================
// OPENAI ADAPTER IMPLEMENTATION
// ============================================================

import { OpenAI } from 'openai';
import {
  ILLMProvider,
  Message,
  CompletionOptions,
  CompletionResponse,
  StreamingChunk,
  ProviderCapabilities,
} from './types';

export class OpenAIAdapter implements ILLMProvider {
  readonly name = 'openai';
  readonly version = '1.0.0';
  
  private client: OpenAI;
  
  constructor(apiKey?: string) {
    this.client = new OpenAI({ 
      apiKey: apiKey ?? process.env.OPENAI_API_KEY,
    });
  }
  
  async generateCompletion(
    messages: Message[],
    options: CompletionOptions
  ): Promise<CompletionResponse> {
    // Transform unified messages to OpenAI format
    const openaiMessages = this.transformMessages(messages);
    
    const response = await this.client.chat.completions.create({
      model: options.model,
      messages: openaiMessages,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      top_p: options.topP,
      stop: options.stop,
      presence_penalty: options.presencePenalty,
      frequency_penalty: options.frequencyPenalty,
      seed: options.seed,
      response_format: options.responseFormat,
      logprobs: options.logprobs,
      top_logprobs: options.topLogprobs,
      user: options.user,
      logit_bias: options.logitBias,
      n: options.n,
    });
    
    return this.transformResponse(response,);
  }
  
 options.model  async *createChatCompletionStream(
    messages: Message[],
    options: CompletionOptions
  ): AsyncIterable<StreamingChunk> {
    const openaiMessages = this.transformMessages(messages);
    
    const stream = await this.client.chat.completions.create({
      model: options.model,
      messages: openaiMessages,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      stream: true,
    });
    
    for await (const chunk of stream) {
      yield this.transformStreamChunk(chunk);
    }
  }
  
  getCapabilities(): ProviderCapabilities {
    return {
      supportsStreaming: true,
      supportsVision: true,
      supportsToolUse: true,
      supportsToolStreaming: true,
      supportsObjectGeneration: true,
      supportsJsonMode: true,
      supportsSeed: true,
      supportsTopK: false,
      supportsTopP: true,
      supportsStopSequences: true,
      supportsLogprobs: true,
      supportsUserPii: true,
      supportsResponseMimeType: true,
      maxContextTokens: 128000,
      maxOutputTokens: 4096,
    };
  }
  
  getModels(): ProviderModel[] {
    return [
      { id: 'gpt-5', name: 'GPT-5', contextWindow: 200000, maxOutputTokens: 16384, isDefault: true },
      { id: 'gpt-4o', name: 'GPT-4o', contextWindow: 128000, maxOutputTokens: 4096 },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', contextWindow: 128000, maxOutputTokens: 4096 },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', contextWindow: 128000, maxOutputTokens: 4096 },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', contextWindow: 16385, maxOutputTokens: 4096 },
    ];
  }
  
  async close(): Promise<void> {
    // OpenAI client doesn't require explicit close
  }
  
  // Private transformation methods
  private transformMessages(messages: Message[]): OpenAI.Chat.ChatCompletionMessageParam[] {
    return messages.map(msg => {
      switch (msg.role) {
        case 'system':
          return { role: 'system', content: msg.content };
        case 'user':
          return { role: 'user', content: msg.content };
        case 'assistant':
          return { role: 'assistant', content: msg.content };
        case 'tool':
          return {
            role: 'tool',
            content: msg.content,
            tool_call_id: msg.tool_call_id,
          };
        default:
          throw new Error(`Unknown message role: ${msg.role}`);
      }
    });
  }
  
  private transformResponse(
    response: OpenAI.Chat.ChatCompletion,
    model: string
  ): CompletionResponse {
    const choice = response.choices[0];
    return {
      content: choice.message.content ?? '',
      usage: {
        promptTokens: response.usage?.prompt_tokens ?? 0,
        completionTokens: response.usage?.completion_tokens ?? 0,
        totalTokens: response.usage?.total_tokens ?? 0,
      },
      raw: response,
      providerMetadata: {
        provider: 'openai',
        model: response.model,
        id: response.id,
        created: response.created,
      },
    };
  }
  
  private transformStreamChunk(
    chunk: OpenAI.Chat.ChatCompletionChunk
  ): StreamingChunk {
    const choice = chunk.choices[0];
    return {
      content: choice.delta.content ?? '',
      providerMetadata: {
        provider: 'openai',
        finishReason: choice.finish_reason,
      },
    };
  }
}
```

### 3.2 Anthropic Adapter (TypeScript)

```typescript
// ============================================================
// ANTHROPIC ADAPTER IMPLEMENTATION
// ============================================================

import Anthropic from '@anthropic-ai/sdk';
import {
  ILLMProvider,
  Message,
  CompletionOptions,
  CompletionResponse,
  StreamingChunk,
  ProviderCapabilities,
} from './types';

export class AnthropicAdapter implements ILLMProvider {
  readonly name = 'anthropic';
  readonly version = '1.0.0';
  
  private client: Anthropic;
  
  constructor(apiKey?: string) {
    this.client = new Anthropic({ 
      apiKey: apiKey ?? process.env.ANTHROPIC_API_KEY,
    });
  }
  
  async generateCompletion(
    messages: Message[],
    options: CompletionOptions
  ): Promise<CompletionResponse> {
    // Anthropic requires separate system message
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');
    
    const response = await this.client.messages.create({
      model: options.model,
      system: systemMessage?.content,
      max_tokens: options.maxTokens ?? 1024,
      messages: userMessages.map(msg => this.transformMessage(msg)),
      temperature: options.temperature,
      top_k: options.topK,
      top_p: options.topP,
      stop_sequences: options.stop,
    });
    
    return this.transformResponse(response, options.model);
  }
  
  async *createChatCompletionStream(
    messages: Message[],
    options: CompletionOptions
  ): AsyncIterable<StreamingChunk> {
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');
    
    const stream = await this.client.messages.stream({
      model: options.model,
      system: systemMessage?.content,
      max_tokens: options.maxTokens ?? 1024,
      messages: userMessages.map(msg => this.transformMessage(msg)),
      temperature: options.temperature,
      top_k: options.topK,
    });
    
    for await (const chunk of stream) {
      yield this.transformStreamChunk(chunk);
    }
  }
  
  getCapabilities(): ProviderCapabilities {
    return {
      supportsStreaming: true,
      supportsVision: true,
      supportsToolUse: true,
      supportsToolStreaming: true,
      supportsObjectGeneration: true,
      supportsJsonMode: true,
      supportsSeed: false,
      supportsTopK: true,
      supportsTopP: true,
      supportsStopSequences: true,
      supportsLogprobs: true,
      supportsUserPii: false,
      supportsResponseMimeType: false,
      maxContextTokens: 200000,
      maxOutputTokens: 8192,
    };
  }
  
  getModels(): ProviderModel[] {
    return [
      { id: 'claude-opus-4', name: 'Claude Opus 4', contextWindow: 200000, maxOutputTokens: 8192, isDefault: true },
      { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', contextWindow: 200000, maxOutputTokens: 8192 },
      { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', contextWindow: 200000, maxOutputTokens: 8192 },
      { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku', contextWindow: 200000, maxOutputTokens: 8192 },
    ];
  }
  
  async close(): Promise<void> {
    // Anthropic client doesn't require explicit close
  }
  
  private transformMessage(msg: Message): Anthropic.MessageParam {
    return {
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    };
  }
  
  private transformResponse(
    response: Anthropic.Message,
    model: string
  ): CompletionResponse {
    const contentBlock = response.content[0];
    return {
      content: contentBlock.type === 'text' ? contentBlock.text : '',
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      raw: response,
      providerMetadata: {
        provider: 'anthropic',
        model: response.model,
        id: response.id,
        type: response.type,
        role: response.role,
      },
    };
  }
  
  private transformStreamChunk(
    chunk: Anthropic.StreamingMessage
  ): StreamingChunk {
    const contentBlock = chunk.delta;
    return {
      content: contentBlock?.text ?? '',
      role: 'assistant',
      providerMetadata: {
        provider: 'anthropic',
        type: chunk.type,
      },
    };
  }
}
```

### 3.3 Google Gemini Adapter (TypeScript)

```typescript
// ============================================================
// GOOGLE GEMINI ADAPTER IMPLEMENTATION
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  ILLMProvider,
  Message,
  CompletionOptions,
  CompletionResponse,
  StreamingChunk,
  ProviderCapabilities,
} from './types';

export class GeminiAdapter implements ILLMProvider {
  readonly name = 'google';
  readonly version = '1.0.0';
  
  private client: GoogleGenerativeAI;
  
  constructor(apiKey?: string) {
    this.client = new GoogleGenerativeAI(apiKey ?? process.env.GEMINI_API_KEY);
  }
  
  async generateCompletion(
    messages: Message[],
    options: CompletionOptions
  ): Promise<CompletionResponse> {
    const model = this.client.getGenerativeModel({ model: options.model });
    
    // Convert messages to Gemini format
    const history = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));
    
    const chat = model.startChat({ history });
    
    const result = await chat.sendMessage(
      options.maxTokens 
        ? { text: messages[messages.length - 1].content }
        : { text: messages[messages.length - 1].content }
    );
    
    const response = await result.response;
    
    return this.transformResponse(response, options.model);
  }
  
  async *createChatCompletionStream(
    messages: Message[],
    options: CompletionOptions
  ): AsyncIterable<StreamingChunk> {
    const model = this.client.getGenerativeModel({ model: options.model });
    
    // For streaming, use generateContentStream
    const result = await model.generateContentStream(
      messages.map(m => m.content).join('\n')
    );
    
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield { content: text };
      }
    }
  }
  
  getCapabilities(): ProviderCapabilities {
    return {
      supportsStreaming: true,
      supportsVision: true,
      supportsToolUse: true,
      supportsToolStreaming: false,
      supportsObjectGeneration: true,
      supportsJsonMode: true,
      supportsSeed: false,
      supportsTopK: true,
      supportsTopP: true,
      supportsStopSequences: false,
      supportsLogprobs: false,
      supportsUserPii: false,
      supportsResponseMimeType: true,
      maxContextTokens: 2000000,
      maxOutputTokens: 8192,
      maxVideoLength: '1 hour (2M tokens)',
    };
  }
  
  getModels(): ProviderModel[] {
    return [
      { id: 'gemini-2-5-pro', name: 'Gemini 2.5 Pro', contextWindow: 2000000, maxOutputTokens: 8192, isDefault: true },
      { id: 'gemini-2-5-flash', name: 'Gemini 2.5 Flash', contextWindow: 1000000, maxOutputTokens: 8192 },
      { id: 'gemini-1-5-pro', name: 'Gemini 1.5 Pro', contextWindow: 2000000, maxOutputTokens: 8192 },
      { id: 'gemini-1-5-flash', name: 'Gemini 1.5 Flash', contextWindow: 1000000, maxOutputTokens: 8192 },
    ];
  }
  
  async close(): Promise<void> {
    // Gemini client doesn't require explicit close
  }
  
  private transformResponse(
    response: any,
    model: string
  ): CompletionResponse {
    return {
      content: response.text(),
      usage: {
        promptTokens: 0, // Gemini doesn't provide this directly
        completionTokens: 0,
        totalTokens: 0,
      },
      raw: response,
      providerMetadata: {
        provider: 'google',
        model: model,
        candidates: response.candidates,
      },
    };
  }
}
```

---

## 4. Provider Manager & Factory Pattern

### 4.1 LLM Manager (TypeScript)

```typescript
// ============================================================
// LLM MANAGER - FACTORY & ROUTING
// ============================================================

import { ILLMProvider, CompletionOptions, CompletionResponse, Message } from './types';
import { OpenAIAdapter } from './adapters/openai-adapter';
import { AnthropicAdapter } from './adapters/anthropic-adapter';
import { GeminiAdapter } from './adapters/gemini-adapter';

export type ProviderName = 'openai' | 'anthropic' | 'google' | 'custom';

export interface ProviderConfig {
  name: ProviderName;
  apiKey?: string;
  baseURL?: string;
  customProvider?: ILLMProvider;
}

export class LLMManager {
  private providers: Map<string, ILLMProvider> = new Map();
  private defaultProvider: string = 'openai';
  
  constructor(configs: ProviderConfig[]) {
    configs.forEach(config => {
      const provider = this.createProvider(config);
      if (provider) {
        this.providers.set(config.name, provider);
        if (!this.defaultProvider) {
          this.defaultProvider = config.name;
        }
      }
    });
  }
  
  private createProvider(config: ProviderConfig): ILLMProvider | null {
    // Use custom provider if provided
    if (config.customProvider) {
      return config.customProvider;
    }
    
    // Create provider based on name
    switch (config.name) {
      case 'openai':
        return new OpenAIAdapter(config.apiKey);
      case 'anthropic':
        return new AnthropicAdapter(config.apiKey);
      case 'google':
        return new GeminiAdapter(config.apiKey);
      default:
        console.warn(`Unknown provider: ${config.name}`);
        return null;
    }
  }
  
  registerProvider(name: string, provider: ILLMProvider): void {
    this.providers.set(name, provider);
  }
  
  getProvider(name: string): ILLMProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider '${name}' not registered. Available: ${Array.from(this.providers.keys()).join(', ')}`);
    }
    return provider;
  }
  
  setDefaultProvider(name: string): void {
    if (!this.providers.has(name)) {
      throw new Error(`Provider '${name}' not registered`);
    }
    this.defaultProvider = name;
  }
  
  async complete(
    messages: Message[],
    options: CompletionOptions,
    providerName?: string
  ): Promise<CompletionResponse> {
    const provider = providerName 
      ? this.getProvider(providerName) 
      : this.getProvider(this.defaultProvider);
    
    return provider.generateCompletion(messages, options);
  }
  
  async *stream(
    messages: Message[],
    options: CompletionOptions,
    providerName?: string
  ): AsyncIterable<StreamingChunk> {
    const provider = providerName 
      ? this.getProvider(providerName) 
      : this.getProvider(this.defaultProvider);
    
    yield* provider.createChatCompletionStream(messages, options);
  }
  
  getAllProviders(): ILLMProvider[] {
    return Array.from(this.providers.values());
  }
  
  async close(): Promise<void> {
    await Promise.all(
      Array.from(this.providers.values()).map(p => p.close())
    );
  }
}
```

### 4.2 Fallback Provider Pattern (Go - OmniLLM Reference)

```go
// ============================================================
// FALLBACK PROVIDER IMPLEMENTATION (Go)
// ============================================================

package omnillm

import (
    "context"
    "errors"
    "sync"
    "time"
    
    "github.com/agentplexus/omnillm/provider"
)

// CircuitBreaker states
type CircuitState int

const (
    CircuitClosed CircuitState = iota
    CircuitOpen
    CircuitHalfOpen
)

type CircuitBreaker struct {
    mu              sync.RWMutex
    state           CircuitState
    failureCount    int
    successCount    int
    lastFailureTime time.Time
    config          CircuitBreakerConfig
}

type CircuitBreakerConfig struct {
    FailureThreshold     int
    SuccessThreshold     int
    Timeout              time.Duration
    FailureRateThreshold float64
    MinimumRequests      int
}

type FallbackProvider struct {
    providers         []provider.Provider
    circuitBreakers   map[string]*CircuitBreaker
    circuitConfig     CircuitBreakerConfig
    mu                sync.RWMutex
}

func NewFallbackProvider(providers []provider.Provider, config CircuitBreakerConfig) *FallbackProvider {
    breakers := make(map[string]*CircuitBreaker)
    for _, p := range providers {
        breakers[p.Name()] = &CircuitBreaker{
            config: config,
            state:  CircuitClosed,
        }
    }
    return &FallbackProvider{
        providers:       providers,
        circuitBreakers: breakers,
        circuitConfig:   config,
    }
}

func (p *FallbackProvider) CreateChatCompletion(
    ctx context.Context,
    req *provider.ChatCompletionRequest,
) (*provider.ChatCompletionResponse, error) {
    var lastErr error
    
    for _, prov := range p.providers {
        breaker := p.circuitBreakers[prov.Name()]
        
        // Check if circuit is open
        if !breaker.canRequest() {
            continue
        }
        
        resp, err := prov.CreateChatCompletion(ctx, req)
        if err != nil {
            lastErr = err
            breaker.recordFailure()
            
            // Check if error is retryable
            if !p.isRetryableError(err) {
                return nil, err
            }
            continue
        }
        
        breaker.recordSuccess()
        return resp, nil
    }
    
    return nil, lastErr
}

func (b *CircuitBreaker) canRequest() bool {
    b.mu.RLock()
    defer b.mu.RUnlock()
    
    if b.state == CircuitClosed {
        return true
    }
    
    if b.state == CircuitOpen {
        // Check if timeout has passed
        if time.Since(b.lastFailureTime) > b.config.Timeout {
            b.mu.RUnlock()
            b.mu.Lock()
            b.state = CircuitHalfOpen
            b.mu.Unlock()
            b.mu.RLock()
            return true
        }
        return false
    }
    
    return true // HalfOpen
}

func (b *CircuitBreaker) recordFailure() {
    b.mu.Lock()
    defer b.mu.Unlock()
    
    b.failureCount++
    b.lastFailureTime = time.Now()
    
    if b.failureCount >= b.config.FailureThreshold {
        b.state = CircuitOpen
    }
}

func (b *CircuitBreaker) recordSuccess() {
    b.mu.Lock()
    defer b.mu.Unlock()
    
    b.successCount++
    
    if b.state == CircuitHalfOpen {
        if b.successCount >= b.config.SuccessThreshold {
            b.state = CircuitClosed
            b.failureCount = 0
            b.successCount = 0
        }
    } else {
        b.successCount = 0 // Reset in closed state
    }
}

func (p *FallbackProvider) isRetryableError(err error) bool {
    // Retry on rate limits, server errors, network issues
    // Don't retry on auth errors or invalid requests
    return true // Simplified - implement actual logic
}
```

---

## 5. Observability Hook Pattern

### 5.1 Observability Interface (Go - OmniLLM Reference)

```go
// ============================================================
// OBSERVABILITY HOOK INTERFACE
// ============================================================

package omnillm

import (
    "context"
    "time"
)

// LLMCallInfo provides metadata about the LLM call
type LLMCallInfo struct {
    CallID       string
    ProviderName string
    Model        string
    StartTime    time.Time
}

// ObservabilityHook allows external packages to observe LLM calls
type ObservabilityHook interface {
    // BeforeRequest is called before each LLM call
    BeforeRequest(ctx context.Context, info LLMCallInfo, req *provider.ChatCompletionRequest) context.Context
    
    // AfterResponse is called after each LLM call completes (success or failure)
    AfterResponse(
        ctx context.Context,
        info LLMCallInfo,
        req *provider.ChatCompletionRequest,
        resp *provider.ChatCompletionResponse,
        err error,
    )
    
    // WrapStream wraps a stream for observability
    WrapStream(
        ctx context.Context,
        info LLMCallInfo,
        req *provider.ChatCompletionRequest,
        stream provider.ChatCompletionStream,
    ) provider.ChatCompletionStream
}

// ============================================================
// EXAMPLE: OPEN TELEMETRY HOOK
// ============================================================

type OTelHook struct {
    tracer trace.Tracer
}

func (h *OTelHook) BeforeRequest(
    ctx context.Context,
    info LLMCallInfo,
    req *provider.ChatCompletionRequest,
) context.Context {
    ctx, span := h.tracer.Start(ctx, "llm.chat_completion",
        trace.WithAttributes(
            attribute.String("llm.provider", info.ProviderName),
            attribute.String("llm.model", req.Model),
            attribute.String("llm.call_id", info.CallID),
        ),
    )
    return ctx
}

func (h *OTelHook) AfterResponse(
    ctx context.Context,
    info LLMCallInfo,
    req *provider.ChatCompletionRequest,
    resp *provider.ChatCompletionResponse,
    err error,
) {
    span := trace.SpanFromContext(ctx)
    defer span.End()
    
    if err != nil {
        span.RecordError(err)
        span.SetStatus(codes.Error, err.Error())
        return
    }
    
    span.SetAttributes(
        attribute.Int("llm.tokens.total", resp.Usage.TotalTokens),
        attribute.Int("llm.tokens.prompt", resp.Usage.PromptTokens),
        attribute.Int("llm.tokens.completion", resp.Usage.CompletionTokens),
        attribute.String("llm.finish_reason", resp.Choices[0].FinishReason),
    )
}

func (h *OTelHook) WrapStream(
    ctx context.Context,
    info LLMCallInfo,
    req *provider.ChatCompletionRequest,
    stream provider.ChatCompletionStream,
) provider.ChatCompletionStream {
    return &observableStream{
        stream: stream,
        ctx:    ctx,
        info:   info,
        tracer: h.tracer,
    }
}
```

---

## 6. Token Estimation & Context Management

### 6.1 Token Estimator (Go - OmniLLM Reference)

```go
// ============================================================
// TOKEN ESTIMATOR
// ============================================================

type TokenEstimator struct {
    config TokenEstimatorConfig
}

type TokenEstimatorConfig struct {
    CharactersPerToken  float64
    CustomContextWindows map[string]int
}

type TokenLimitError struct {
    EstimatedTokens int
    ContextWindow   int
    Model           string
}

func (e *TokenEstimator) EstimateTokens(model string, messages []provider.Message) (int, error) {
    // Count characters across all messages
    totalChars := 0
    for _, msg := range messages {
        totalChars += len(msg.Content)
        totalChars += 4 // Add overhead for role markers
    }
    
    // Convert to tokens (rough estimate)
    tokens := int(float64(totalChars) / e.config.CharactersPerToken)
    
    // Add token overhead for message structure
    tokens += len(messages) * 4
    
    return tokens, nil
}

func (e *TokenEstimator) GetContextWindow(model string) int {
    // Check custom windows first
    if window, ok := e.config.CustomContextWindows[model]; ok {
        return window
    }
    
    // Return built-in defaults
    contextWindows := map[string]int{
        "gpt-4o":              128000,
        "gpt-4o-mini":         128000,
        "gpt-5":               200000,
        "claude-opus-4":       200000,
        "claude-sonnet-4":     200000,
        "gemini-1-5-pro":      2000000,
        "gemini-2-5-pro":      2000000,
        "gemini-2-5-flash":    1000000,
        "grok-3":              128000,
        "grok-4":              128000,
    }
    
    return contextWindows[model]
}
```

---

## 7. Error Handling Pattern

### 7.1 Unified Error Types

```typescript
// ============================================================
// UNIFIED ERROR TYPES
// ============================================================

export class LLMError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly model: string,
    public readonly code?: string,
    public readonly statusCode?: number,
    public readonly providerMetadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

export class RateLimitError extends LLMError {
  constructor(
    provider: string,
    model: string,
    public readonly retryAfter?: number,
    public readonly limitType?: 'requests' | 'tokens'
  ) {
    super(`Rate limit exceeded for ${provider}`, provider, model, 'RATE_LIMIT');
  }
}

export class AuthenticationError extends LLMError {
  constructor(provider: string, model: string) {
    super(`Authentication failed for ${provider}`, provider, model, 'AUTH_ERROR', 401);
  }
}

export class InvalidRequestError extends LLMError {
  constructor(
    provider: string,
    model: string,
    public readonly validationErrors?: string[]
  ) {
    super(`Invalid request to ${provider}`, provider, model, 'INVALID_REQUEST', 400);
  }
}

export class TokenLimitError extends LLMError {
  constructor(
    provider: string,
    model: string,
    public readonly estimatedTokens: number,
    public readonly contextWindow: number
  ) {
    super(
      `Token limit exceeded: ${estimatedTokens} > ${contextWindow}`,
      provider,
      model,
      'TOKEN_LIMIT'
    );
  }
}

export class ModelNotFoundError extends LLMError {
  constructor(provider: string, model: string) {
    super(`Model '${model}' not found for provider ${provider}`, provider, model, 'MODEL_NOT_FOUND', 404);
  }
}

// Error classification helper
export function classifyError(error: unknown): LLMError {
  if (error instanceof LLMError) {
    return error;
  }
  
  const err = error as any;
  
  // Check for common error patterns
  if (err.statusCode === 401 || err.message?.includes('auth')) {
    return new AuthenticationError(err.provider || 'unknown', err.model || 'unknown');
  }
  
  if (err.statusCode === 429) {
    return new RateLimitError(
      err.provider || 'unknown',
      err.model || 'unknown',
      err.retryAfter,
      err.limitType
    );
  }
  
  if (err.statusCode === 400 || err.message?.includes('validation')) {
    return new InvalidRequestError(
      err.provider || 'unknown',
      err.model || 'unknown',
      err.validationErrors
    );
  }
  
  // Default error
  return new LLMError(
    err.message || 'Unknown error',
    err.provider || 'unknown',
    err.model || 'unknown',
    err.code,
    err.statusCode
  );
}
```

---

## 8. Key Recommendations

### 8.1 Architecture Principles

Based on research from Vercel AI SDK, LangChain, and OmniLLM:

1. **Use Adapter Pattern**: Each provider wraps SDK in unified interface
2. **Capability Registry**: Maintain model capability matrix for feature detection
3. **Error Abstraction**: Normalize provider-specific errors to unified types
4. **Observability Hooks**: Support tracing without modifying core logic
5. **Fallback Strategy**: Implement circuit breaker and fallback routing
6. **Token Estimation**: Pre-flight validation to prevent context overflow

### 8.2 Recommended Libraries

| Library | Language | Pros | Cons |
|---------|----------|------|------|
| **Vercel AI SDK** | TypeScript | Native streaming, unified API, extensive providers | Framework-bound |
| **LangChain.js** | TypeScript | Rich integrations, tool calling, LCEL | Heavy abstraction overhead |
| **OmniLLM** | Go | Production-ready, observability, circuit breaker | Go only |
| **LiteLLM** | Python | Unified proxy, cost tracking | Python ecosystem |
| **Instructor** | Python | Response validation, structured outputs | Python only |

### 8.3 Implementation Priority

1. **Phase 1**: Core provider adapters (OpenAI, Anthropic, Gemini)
2. **Phase 2**: Capability detection and validation
3. **Phase 3**: Error normalization and retry logic
4. **Phase 4**: Observability hooks
5. **Phase 5**: Fallback and circuit breaker

---

## 9. References

- [Vercel AI SDK - Providers and Models](https://ai-sdk.dev/docs/foundations/providers-and-models)
- [LangChain.js - Custom Chat Models](https://js.langchain.com/docs/modules/model_io/chat/custom_chat)
- [OmniLLM - GitHub](https://github.com/agentplexus/omnillm)
- [Instructor - Unified Provider Interface](https://python.useinstructor.com/blog/2025/05/08/announcing-unified-provider-interface/)
- [any-llm - Mozilla AI](https://blog.mozilla.ai/introducing-any-llm-a-unified-api-to-access-any-llm-provider/)
- [AbstractCore - Unified LLM Provider](https://www.abstractcore.ai/)
