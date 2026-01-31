# OpenAI-Compatible Endpoint Integration Patterns

**Research Date:** 2026-01-25
**Focus:** Dynamic endpoint configuration, provider compatibility, OpenRouter integration

---

## 1. Core Integration Pattern: Base URL + API Key

The fundamental pattern for OpenAI-compatible endpoints is configuring a custom `baseURL` with the provider's API key.

### 1.1 OpenAI SDK Native Pattern

```typescript
import OpenAI from 'openai';

// Standard OpenAI configuration
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Custom baseURL for any OpenAI-compatible endpoint
const openRouterClient = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://yourapp.com',
    'X-Title': 'Your App Name',
  },
});

const chutesClient = new OpenAI({
  baseURL: 'https://api.chutes.ai/v1',
  apiKey: process.env.CHUTES_API_KEY,
});

// Usage is identical across all providers
const response = await openRouterClient.chat.completions.create({
  model: 'openai/gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

### 1.2 AI SDK Provider Pattern (@ai-sdk/openai)

```typescript
import { createOpenAI } from '@ai-sdk/openai';

// Default OpenAI provider
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Custom baseURL for OpenRouter
const openRouter = createOpenAI({
  name: 'openrouter',
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    'HTTP-Referer': 'https://yourapp.com',
    'X-Title': 'Your App Name',
  },
});

// Custom baseURL for Chutes.ai
const chutes = createOpenAI({
  name: 'chutes',
  baseURL: 'https://api.chutes.ai/v1',
  apiKey: process.env.CHUTES_API_KEY,
});

// Usage with AI SDK
import { generateText } from 'ai';

const { text } = await generateText({
  model: openRouter('gpt-4'),
  prompt: 'Hello!',
});
```

---

## 2. OpenAI-Compatible Provider Factory Pattern

For maximum flexibility, use the `@ai-sdk/openai-compatible` package to create providers for any OpenAI-compatible API.

### 2.1 Factory Function Pattern

```typescript
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

// Create a generic OpenAI-compatible provider
const openRouterProvider = createOpenAICompatible({
  name: 'openrouter',
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'HTTP-Referer': 'https://yourapp.com',
    'X-Title': 'Your App Name',
  },
  // API key can be provided at runtime
  apiKeyName: 'OPENROUTER_API_KEY',
  apiKeyHeader: 'Authorization',
});

// Create provider with explicit API key
const chutesProvider = createOpenAICompatible({
  name: 'chutes',
  baseURL: 'https://api.chutes.ai/v1',
  apiKey: process.env.CHUTES_API_KEY,
});

// Usage
const model = openRouterProvider('gpt-4');
```

### 2.2 Dynamic Provider Configuration

```typescript
interface ProviderConfig {
  name: string;
  baseURL: string;
  apiKey: string;
  headers?: Record<string, string>;
}

const providers: Record<string, ProviderConfig> = {
  openrouter: {
    name: 'openrouter',
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY!,
    headers: {
      'HTTP-Referer': 'https://yourapp.com',
      'X-Title': 'Your App Name',
    },
  },
  chutes: {
    name: 'chutes',
    baseURL: 'https://api.chutes.ai/v1',
    apiKey: process.env.CHUTES_API_KEY!,
  },
  groq: {
    name: 'groq',
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY!,
  },
  togetherai: {
    name: 'togetherai',
    baseURL: 'https://api.together.ai/v1',
    apiKey: process.env.TOGETHERAI_API_KEY!,
  },
};

function createProvider(config: ProviderConfig) {
  return createOpenAICompatible({
    name: config.name,
    baseURL: config.baseURL,
    apiKey: config.apiKey,
    headers: config.headers,
  });
}

// Usage
const openRouter = createProvider(providers.openrouter);
const chutes = createProvider(providers.chutes);
```

---

## 3. OpenRouter SDK Specific Pattern

OpenRouter provides its own dedicated SDK with enhanced features.

### 3.1 OpenRouter TypeScript SDK

```typescript
import { OpenRouter } from '@openrouter/sdk';

// Initialize client
const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://yourapp.com',
    'X-Title': 'Your App Name',
  },
});

// Non-streaming request
const completion = await openRouter.chat.send({
  model: 'openai/gpt-4',
  messages: [{ role: 'user', content: 'What is the meaning of life?' }],
  stream: false,
});

console.log(completion.choices[0].message.content);

// Streaming request
const stream = await openRouter.chat.send({
  model: 'openai/gpt-4',
  messages: [{ role: 'user', content: 'Tell me a story' }],
  stream: true,
});

for await (const chunk of stream) {
  console.log(chunk.choices[0]?.delta?.content);
}
```

### 3.2 OpenRouter with OpenAI SDK (Legacy)

```typescript
import OpenAI from 'openai';

const openRouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://yourapp.com',
    'X-Title': 'Your App Name',
  },
});

// OpenRouter-specific model formats
const models = [
  'openai/gpt-4',          // Provider/model format
  'anthropic/claude-3-5-sonnet',
  'deepseek/deepseek-chat',
  'google/gemini-pro',
  'meta-llama/llama-3.1-405b',
];

// Usage
const response = await openRouter.chat.completions.create({
  model: 'openai/gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

---

## 4. Multi-Provider Abstraction Layer

Create a unified interface for managing multiple OpenAI-compatible endpoints.

### 4.1 Provider Registry Pattern

```typescript
interface LLMProvider {
  name: string;
  client: OpenAI;
  models: string[];
  capabilities: string[];
}

class ProviderRegistry {
  private providers: Map<string, LLMProvider> = new Map();

  registerProvider(provider: LLMProvider) {
    this.providers.set(provider.name, provider);
  }

  getProvider(name: string): LLMProvider | undefined {
    return this.providers.get(name);
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  async createClient(providerName: string, model: string) {
    const provider = this.getProvider(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }
    if (!provider.models.includes(model)) {
      throw new Error(`Model ${model} not available on ${providerName}`);
    }
    return provider.client;
  }
}

// Initialize registry
const registry = new ProviderRegistry();

registry.registerProvider({
  name: 'openrouter',
  client: new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: { 'HTTP-Referer': 'https://yourapp.com', 'X-Title': 'App' },
  }),
  models: ['openai/gpt-4', 'anthropic/claude-3-5-sonnet', 'deepseek/deepseek-chat'],
  capabilities: ['streaming', 'function-calling', 'vision'],
});

registry.registerProvider({
  name: 'chutes',
  client: new OpenAI({
    baseURL: 'https://api.chutes.ai/v1',
    apiKey: process.env.CHUTES_API_KEY,
  }),
  models: ['chutes/mistral-large', 'chutes/llama-3.1-70b'],
  capabilities: ['streaming', 'function-calling'],
});

// Usage
const client = await registry.createClient('openrouter', 'openai/gpt-4');
const response = await client.chat.completions.create({
  model: 'openai/gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

### 4.2 Unified Interface Pattern

```typescript
interface ChatCompletionParams {
  model: string;
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

interface LLMService {
  complete(params: ChatCompletionParams): Promise<string>;
  stream(params: ChatCompletionParams): AsyncIterable<string>;
}

class OpenAICompatibleService implements LLMService {
  constructor(
    private client: OpenAI,
    private providerName: string
  ) {}

  async complete(params: ChatCompletionParams): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: params.model,
      messages: params.messages,
      temperature: params.temperature,
      max_tokens: params.maxTokens,
    });
    return response.choices[0]?.message?.content || '';
  }

  async *stream(params: ChatCompletionParams): AsyncIterable<string> {
    const response = await this.client.chat.completions.create({
      model: params.model,
      messages: params.messages,
      temperature: params.temperature,
      max_tokens: params.maxTokens,
      stream: true,
    });

    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) yield content;
    }
  }
}

// Factory function
function createLLMService(provider: 'openrouter' | 'chutes' | 'groq'): LLMService {
  const configs = {
    openrouter: {
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    },
    chutes: {
      baseURL: 'https://api.chutes.ai/v1',
      apiKey: process.env.CHUTES_API_KEY,
    },
    groq: {
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: process.env.GROQ_API_KEY,
    },
  };

  const config = configs[provider];
  const client = new OpenAI({
    baseURL: config.baseURL,
    apiKey: config.apiKey,
  });

  return new OpenAICompatibleService(client, provider);
}

// Usage
const llm = createLLMService('openrouter');
const response = await llm.complete({
  model: 'openai/gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

---

## 5. Dynamic Endpoint Configuration with Environment Variables

### 5.1 Environment-Based Configuration

```typescript
// config/llm-providers.ts
interface ProviderEnvironmentConfig {
  baseURL: string;
  apiKeyEnv: string;
  requiredEnvVars?: string[];
  headers?: Record<string, string>;
}

export const providerConfigs: Record<string, ProviderEnvironmentConfig> = {
  openrouter: {
    baseURL: 'https://openrouter.ai/api/v1',
    apiKeyEnv: 'OPENROUTER_API_KEY',
    headers: {
      'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
      'X-Title': process.env.APP_NAME || 'My App',
    },
  },
  chutes: {
    baseURL: 'https://api.chutes.ai/v1',
    apiKeyEnv: 'CHUTES_API_KEY',
  },
  groq: {
    baseURL: 'https://api.groq.com/openai/v1',
    apiKeyEnv: 'GROQ_API_KEY',
  },
  togetherai: {
    baseURL: 'https://api.together.ai/v1',
    apiKeyEnv: 'TOGETHERAI_API_KEY',
  },
  azure: {
    baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_DEPLOYMENT_NAME}`,
    apiKeyEnv: 'AZURE_OPENAI_API_KEY',
    requiredEnvVars: ['AZURE_OPENAI_API_VERSION'],
    headers: {
      'api-key': '', // Will be set dynamically
    },
  },
};

function validateProviderConfig(provider: string): void {
  const config = providerConfigs[provider];
  if (!config) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  const apiKey = process.env[config.apiKeyEnv];
  if (!apiKey) {
    throw new Error(`Missing API key for ${provider}: ${config.apiKeyEnv}`);
  }

  if (config.requiredEnvVars) {
    for (const envVar of config.requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }
  }
}

function createProviderClient(provider: string): OpenAI {
  validateProviderConfig(provider);
  const config = providerConfigs[provider];
  const apiKey = process.env[config.apiKeyEnv]!;

  return new OpenAI({
    baseURL: config.baseURL,
    apiKey,
    defaultHeaders: config.headers,
  });
}

// Usage
const openrouterClient = createProviderClient('openrouter');
const chutesClient = createProviderClient('chutes');
```

### 5.2 Runtime Provider Switching

```typescript
class MultiProviderManager {
  private clients: Map<string, OpenAI> = new Map();

  async getClient(provider: string): Promise<OpenAI> {
    if (this.clients.has(provider)) {
      return this.clients.get(provider)!;
    }

    const client = createProviderClient(provider);
    this.clients.set(provider, client);
    return client;
  }

  async execute<T>(
    provider: string,
    operation: (client: OpenAI) => Promise<T>
  ): Promise<T> {
    const client = await this.getClient(provider);
    return operation(client);
  }

  // Fallback mechanism - try providers in order
  async executeWithFallback<T>(
    providers: string[],
    operation: (client: OpenAI) => Promise<T>
  ): Promise<T> {
    let lastError: Error | null = null;

    for (const provider of providers) {
      try {
        const client = await this.getClient(provider);
        return await operation(client);
      } catch (error) {
        lastError = error as Error;
        console.warn(`Provider ${provider} failed, trying next...`);
      }
    }

    throw lastError || new Error('All providers failed');
  }

  // Health check
  async healthCheck(provider: string): Promise<boolean> {
    try {
      const client = await this.getClient(provider);
      await client.models.list();
      return true;
    } catch {
      return false;
    }
  }

  async getHealthyProviders(): Promise<string[]> {
    const providers = Object.keys(providerConfigs);
    const healthy: string[] = [];

    await Promise.all(
      providers.map(async (provider) => {
        const isHealthy = await this.healthCheck(provider);
        if (isHealthy) healthy.push(provider);
      })
    );

    return healthy;
  }
}

// Usage
const manager = new MultiProviderManager();

// Execute with fallback
const response = await manager.executeWithFallback(
  ['openrouter', 'chutes', 'groq'],
  async (client) => {
    const completion = await client.chat.completions.create({
      model: 'openai/gpt-4',
      messages: [{ role: 'user', content: 'Hello!' }],
    });
    return completion.choices[0]?.message?.content;
  }
);

// Get healthy providers
const healthyProviders = await manager.getHealthyProviders();
console.log('Healthy providers:', healthyProviders);
```

---

## 6. Provider Compatibility Detection

### 6.1 Capability Detection Pattern

```typescript
interface ProviderCapabilities {
  supportsStreaming: boolean;
  supportsFunctionCalling: boolean;
  supportsVision: boolean;
  supportsSystemMessages: boolean;
  maxContextLength: number;
  models: string[];
}

const providerCapabilities: Record<string, ProviderCapabilities> = {
  openrouter: {
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: true,
    supportsSystemMessages: true,
    maxContextLength: 128000,
    models: ['openai/gpt-4', 'anthropic/claude-3-5-sonnet', 'deepseek/deepseek-chat'],
  },
  chutes: {
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: false,
    supportsSystemMessages: true,
    maxContextLength: 128000,
    models: ['chutes/mistral-large', 'chutes/llama-3.1-70b'],
  },
  groq: {
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: false,
    supportsSystemMessages: true,
    maxContextLength: 32768,
    models: ['llama-3.1-70b-versatile', 'mixtral-8x7b-32768'],
  },
};

function selectProviderForTask(
  task: 'text-generation' | 'vision' | 'function-calling',
  preferredProviders?: string[]
): string {
  const candidates = preferredProviders || Object.keys(providerCapabilities);

  for (const provider of candidates) {
    const capabilities = providerCapabilities[provider];
    if (!capabilities) continue;

    switch (task) {
      case 'vision':
        if (capabilities.supportsVision) return provider;
        break;
      case 'function-calling':
        if (capabilities.supportsFunctionCalling) return provider;
        break;
      case 'text-generation':
        return provider; // All providers support this
    }
  }

  throw new Error(`No provider found for task: ${task}`);
}

// Usage
const visionProvider = selectProviderForTask('vision', ['openrouter', 'chutes']);
const functionCallingProvider = selectProviderForTask('function-calling');
```

### 6.2 Model Availability Check

```typescript
async function getAvailableModels(client: OpenAI): Promise<string[]> {
  try {
    const response = await client.models.list();
    return response.data.map((model) => model.id);
  } catch (error) {
    console.error('Failed to fetch models:', error);
    return [];
  }
}

async function isModelAvailable(
  client: OpenAI,
  modelId: string
): Promise<boolean> {
  const models = await getAvailableModels(client);
  return models.includes(modelId);
}

// Usage
const openrouterClient = createProviderClient('openrouter');
const isAvailable = await isModelAvailable(openrouterClient, 'gpt-4');
console.log(`GPT-4 available: ${isAvailable}`);
```

---

## 7. OpenRouter-Specific Features

### 7.1 OpenRouter Headers and Attribution

```typescript
// OpenRouter-specific configuration
const openRouterConfig = {
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    // Required for OpenRouter
    'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
    'X-Title': process.env.APP_NAME || 'My AI App',

    // Optional: Site URL for rankings
    'HTTP-Referer': 'https://yourapp.com',

    // Optional: Site title for rankings
    'X-Title': 'Your App Name',
  },
};

// OpenRouter model routing
const openRouterModels = {
  // Direct model specification
  gpt4: 'openai/gpt-4',
  claude: 'anthropic/claude-3-5-sonnet',
  deepseek: 'deepseek/deepseek-chat',

  // Best value models
  bestValue: 'deepseek/deepseek-chat',

  // Fastest models
  fastest: 'anthropic/claude-instant-1',

  // Reasoning models
  reasoning: 'openai/o1',
};

// OpenRouter routing options
interface OpenRouterRequestOptions {
  route?: 'fallback' | 'balance' | 'cost' | 'latency' | 'quality';
  models?: {
    deny?: string[];
    prefer?: string[];
  };
  transforms?: {
    matrix?: boolean;
  };
}

// Example with routing options
const response = await openrouterClient.chat.completions.create({
  model: 'openai/gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }],
  // OpenRouter-specific parameters (passed as extra body)
  extra_body: {
    models: {
      prefer: ['deepseek/deepseek-chat'],
      deny: ['anthropic/claude-1'],
    },
    route: 'fallback',
  },
});
```

---

## 8. Error Handling and Retry Patterns

### 8.1 Resilient Request Pattern

```typescript
import OpenAI from 'openai';

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

async function makeRequestWithRetry<T>(
  client: OpenAI,
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const { maxRetries, baseDelay, maxDelay, backoffMultiplier } = {
    ...defaultRetryConfig,
    ...config,
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (4xx)
      if (error instanceof OpenAI.APIError) {
        if (error.status && error.status >= 400 && error.status < 500) {
          throw error;
        }
      }

      // Calculate delay with exponential backoff
      if (attempt < maxRetries) {
        const delay = Math.min(
          baseDelay * Math.pow(backoffMultiplier, attempt),
          maxDelay
        );

        console.warn(
          `Attempt ${attempt + 1} failed, retrying in ${delay}ms...`,
          lastError.message
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// Usage
const response = await makeRequestWithRetry(
  openrouterClient,
  async () => {
    const completion = await openrouterClient.chat.completions.create({
      model: 'openai/gpt-4',
      messages: [{ role: 'user', content: 'Hello!' }],
    });
    return completion.choices[0]?.message?.content;
  },
  { maxRetries: 3, baseDelay: 1000 }
);
```

---

## 9. Complete Implementation Example

### 9.1 Unified LLM Client

```typescript
// llm-client.ts
import OpenAI from 'openai';

export type ProviderType = 'openrouter' | 'chutes' | 'groq' | 'togetherai' | 'custom';

export interface LLMClientConfig {
  provider: ProviderType;
  baseURL?: string;
  apiKey: string;
  model?: string;
  headers?: Record<string, string>;
}

export class LLMClient {
  private client: OpenAI;
  private provider: ProviderType;
  private defaultModel: string;

  constructor(config: LLMClientConfig) {
    this.provider = config.provider;
    this.defaultModel = config.model || this.getDefaultModel(config.provider);

    const baseURL = config.baseURL || this.getBaseURL(config.provider);

    this.client = new OpenAI({
      baseURL,
      apiKey: config.apiKey,
      defaultHeaders: config.headers,
    });
  }

  private getBaseURL(provider: ProviderType): string {
    const baseURLs: Record<ProviderType, string> = {
      openrouter: 'https://openrouter.ai/api/v1',
      chutes: 'https://api.chutes.ai/v1',
      groq: 'https://api.groq.com/openai/v1',
      togetherai: 'https://api.together.ai/v1',
      custom: '',
    };
    return baseURLs[provider];
  }

  private getDefaultModel(provider: ProviderType): string {
    const models: Record<ProviderType, string> = {
      openrouter: 'openai/gpt-4',
      chutes: 'chutes/mistral-large',
      groq: 'llama-3.1-70b-versatile',
      togetherai: 'togetherai/llama-3.1-405b-instruct',
      custom: 'gpt-4',
    };
    return models[provider];
  }

  async complete(
    prompt: string,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      systemMessage?: string;
    }
  ): Promise<string> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (options?.systemMessage) {
      messages.push({ role: 'system', content: options.systemMessage });
    }

    messages.push({ role: 'user', content: prompt });

    const completion = await this.client.chat.completions.create({
      model: options?.model || this.defaultModel,
      messages,
      temperature: options?.temperature,
      max_tokens: options?.maxTokens,
    });

    return completion.choices[0]?.message?.content || '';
  }

  async *streamComplete(
    prompt: string,
    options?: {
      model?: string;
      temperature?: number;
      systemMessage?: string;
    }
  ): AsyncIterable<string> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (options?.systemMessage) {
      messages.push({ role: 'system', content: options.systemMessage });
    }

    messages.push({ role: 'user', content: prompt });

    const completion = await this.client.chat.completions.create({
      model: options?.model || this.defaultModel,
      messages,
      temperature: options?.temperature,
      stream: true,
    });

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) yield content;
    }
  }
}

// Factory function
export function createLLMClient(
  providerType: ProviderType,
  options?: {
    baseURL?: string;
    model?: string;
    headers?: Record<string, string>;
  }
): LLMClient {
  const apiKeyEnvVars: Record<ProviderType, string> = {
    openrouter: 'OPENROUTER_API_KEY',
    chutes: 'CHUTES_API_KEY',
    groq: 'GROQ_API_KEY',
    togetherai: 'TOGETHERAI_API_KEY',
    custom: 'CUSTOM_LLM_API_KEY',
  };

  const apiKey = process.env[apiKeyEnvVars[providerType]];
  if (!apiKey) {
    throw new Error(`Missing API key for ${providerType}: ${apiKeyEnvVars[providerType]}`);
  }

  return new LLMClient({
    provider: providerType,
    baseURL: options?.baseURL,
    apiKey,
    model: options?.model,
    headers: options?.headers,
  });
}

// Usage examples
const openrouterClient = createLLMClient('openrouter', {
  model: 'openai/gpt-4',
  headers: { 'HTTP-Referer': 'https://yourapp.com', 'X-Title': 'App' },
});

const chutesClient = createLLMClient('chutes');

// Simple completion
const response = await openrouterClient.complete('What is AI?');
console.log(response);

// Streaming completion
for await (const chunk of openrouterClient.streamComplete('Tell me a story')) {
  process.stdout.write(chunk);
}
```

---

## Summary

| Pattern | Use Case | Key Features |
|---------|----------|--------------|
| **BaseURL + API Key** | Universal pattern for OpenAI-compatible endpoints | Simple, supported by all providers |
| **AI SDK Provider** | Type-safe integration with AI SDK | Enhanced type safety, provider registry |
| **OpenRouter SDK** | OpenRouter-specific features | Native routing, attribution headers |
| **Provider Registry** | Multi-provider management | Unified interface, fallback support |
| **Dynamic Configuration** | Runtime provider switching | Environment-based, validation |
| **Retry Pattern** | Production resilience | Exponential backoff, error handling |

**Key Takeaways:**
1. All OpenAI-compatible providers use the same `baseURL + API key` pattern
2. The `@ai-sdk/openai-compatible` package provides factory functions for custom endpoints
3. OpenRouter requires specific headers for attribution (`HTTP-Referer`, `X-Title`)
4. Create a unified client interface to abstract provider differences
5. Implement fallback mechanisms for production resilience
