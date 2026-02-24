# Technical Specification: Universal OpenAI-Compatible Provider System

**Epic:** EPIC-PRV
**Version:** 1.0.0
**Date:** 2026-01-11
**Status:** Ready for Implementation
**Workflow:** /bmad:bmm:workflows:create-tech-spec

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Type System](#type-system)
4. [Component Specifications](#component-specifications)
5. [API Contracts](#api-contracts)
6. [Data Flow](#data-flow)
7. [File Structure](#file-structure)
8. [Implementation Sequence](#implementation-sequence)
9. [Testing Strategy](#testing-strategy)
10. [Integration Points](#integration-points)

---

## Executive Summary

This specification defines a universal provider system that supports:

1. **Dynamic provider registration** - Add/remove providers at runtime
2. **Per-modality endpoints** - Different URLs for text/image/audio
3. **Manual model configuration** - No dependency on `/models` API
4. **Test playground UI** - Isolated route for debugging and validation

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Manual model entry instead of auto-fetch | Most providers don't expose `/models`; manual is more reliable |
| Per-modality endpoints | Single `baseURL` cannot support multi-endpoint providers like Chutes.ai |
| LocalStorage for test UI | Fast iteration without backend changes |
| Credential Vault for production | Reuses existing encrypted storage |

---

## Architecture Overview

### System Context Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              APPLICATION                                  │
│                                                                            │
│  ┌──────────────────────┐         ┌──────────────────────┐                │
│  │   Production UI      │         │   Test Playground    │                │
│  │   /agent/config      │         │   /__debug__/playground │             │
│  └──────────┬───────────┘         └──────────┬───────────┘                │
│             │                                │                          │
│             └────────────┬───────────────────┘                          │
│                          ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                    Provider Facade Layer                            │  │
│  │  ┌──────────────────────────────────────────────────────────────┐ │  │
│  │  │ UniversalProviderRegistry (register, get, list, remove)      │ │  │
│  │  └──────────────────────────────────────────────────────────────┘ │  │
│  │  ┌──────────────────────────────────────────────────────────────┐ │  │
│  │  │ UniversalAdapterFactory (createAdapter, executeRequest)      │ │  │
│  │  └──────────────────────────────────────────────────────────────┘ │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                          │                                               │
│                          ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                      External Services                               │  │
│  │  Chutes.ai  │  OpenRouter  │  Localhost  │  Custom Endpoint        │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Responsibility | Files |
|-------|----------------|-------|
| **Domain** | Types, interfaces, no dependencies | `src/domain/providers/*` |
| **Application** | Business logic, registry service | `src/lib/providers/*` |
| **Infrastructure** | Storage, adapters | `src/infrastructure/providers/*` |
| **Presentation** | UI components, test playground | `src/routes/__debug__/playground/*` |

---

## Type System

### Core Types

```typescript
/**
 * @fileoverview Universal Provider Types
 * @module domain/providers/universal-provider-types
 */

/**
 * Supported modalities for AI providers
 */
export type ModalityType = 'text' | 'image' | 'tts' | 'stt';

/**
 * Input/output direction for a modality
 */
export type ModalityDirection = 'input' | 'output' | 'both';

/**
 * Request/response format variants
 */
export type RequestFormat = 'openai' | 'custom';
export type ResponseFormat = 'openai' | 'custom' | 'binary';

/**
 * Universal provider configuration
 *
 * Represents a complete provider definition with all modalities,
 * endpoints, models, and authentication details.
 */
export interface UniversalProviderConfig {
  /** Unique provider identifier (e.g., 'chutes', 'openrouter') */
  id: string;

  /** Display name for UI */
  name: string;

  /** Description of this provider */
  description?: string;

  /**
   * Per-modality endpoint configuration
   * Each modality can have its own base URL
   */
  endpoints: {
    text?: string;      // e.g., 'https://llm.chutes.ai/v1'
    image?: string;     // e.g., 'https://image.chutes.ai'
    tts?: string;       // e.g., 'https://chutes-kokoro.chutes.ai'
    stt?: string;       // e.g., 'https://chutes-whisper.chutes.ai'
  };

  /** Default API key (can be overridden per request) */
  defaultApiKey?: string;

  /** Whether API key is required (false for localhost) */
  requiresApiKey: boolean;

  /** Custom headers to include with all requests */
  defaultHeaders?: Record<string, string>;

  /**
   * Manually configured models
   * Most providers don't expose a /models endpoint
   */
  models: UniversalModelConfig[];

  /** Default model for text generation */
  defaultModel?: string;

  /** Provider homepage URL (for documentation links) */
  docsUrl?: string;

  /** When this config was created */
  createdAt: string;

  /** When this config was last modified */
  updatedAt: string;
}

/**
 * Model configuration (manual entry)
 *
 * Models are manually configured since most providers
 * don't expose a discoverable /models endpoint.
 */
export interface UniversalModelConfig {
  /** Unique model identifier (e.g., 'zai-org/GLM-4.7-TEE') */
  id: string;

  /** Display name */
  name: string;

  /** Which modalities this model supports */
  modalities: ModalityType[];

  /** Maximum context window (tokens) */
  contextLength?: number;

  /** Supports streaming responses */
  supportsStreaming?: boolean;

  /** Maximum output tokens */
  maxOutputTokens?: number;

  /** Pricing (per 1M tokens, if known) */
  pricing?: {
    prompt: number;
    completion: number;
  };
}

/**
 * Per-modality capability definition
 */
export interface ModalityCapability {
  /** The modality type */
  type: ModalityType;

  /** Can receive this modality as input */
  input: boolean;

  /** Can generate this modality as output */
  output: boolean;

  /** Endpoint path (relative to provider baseURL or absolute) */
  endpointPath: string;

  /** Request format */
  requestFormat: RequestFormat;

  /** Response format */
  responseFormat: ResponseFormat;

  /** HTTP method for this modality */
  method: 'GET' | 'POST' | 'PUT';
}

/**
 * Request context for executing a provider call
 */
export interface ProviderRequestContext {
  /** Provider ID */
  providerId: string;

  /** Model ID */
  model: string;

  /** Target modality */
  modality: ModalityType;

  /** Request payload (format depends on modality) */
  payload: unknown;

  /** Override API key (optional) */
  apiKeyOverride?: string;

  /** Additional headers (optional) */
  headers?: Record<string, string>;

  /** Request parameters */
  parameters?: {
    maxTokens?: number;
    temperature?: number;
    stream?: boolean;
    [key: string]: unknown;
  };
}

/**
 * Provider response wrapper
 */
export interface ProviderResponse<T = unknown> {
  /** Whether the request succeeded */
  success: boolean;

  /** Response latency in milliseconds */
  latencyMs: number;

  /** Response data (if successful) */
  data?: T;

  /** Error message (if failed) */
  error?: string;

  /** HTTP status code (if applicable) */
  statusCode?: number;

  /** Response headers (if available) */
  headers?: Record<string, string>;
}

/**
 * Zod schema for runtime validation
 */
export const UniversalProviderConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  endpoints: z.object({
    text: z.string().url().optional(),
    image: z.string().url().optional(),
    tts: z.string().url().optional(),
    stt: z.string().url().optional(),
  }),
  defaultApiKey: z.string().optional(),
  requiresApiKey: z.boolean(),
  defaultHeaders: z.record(z.string()).optional(),
  models: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    modalities: z.array(z.enum(['text', 'image', 'tts', 'stt'])),
    contextLength: z.number().optional(),
    supportsStreaming: z.boolean().optional(),
    maxOutputTokens: z.number().optional(),
    pricing: z.object({
      prompt: z.number(),
      completion: z.number(),
    }).optional(),
  })),
  defaultModel: z.string().optional(),
  docsUrl: z.string().url().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UniversalProviderConfigInput = z.infer<typeof UniversalProviderConfigSchema>;
```

---

## Component Specifications

### 1. Provider Registry Service

**File:** `src/lib/providers/universal-provider-registry.ts`

**Responsibilities:**
- Register/unregister providers
- Retrieve providers by ID
- List all providers
- Filter providers by modality support
- Persist to IndexedDB via credential vault

**Interface:**

```typescript
export class UniversalProviderRegistry {
  /**
   * Register a new provider
   * @throws Error if provider ID already exists
   */
  register(config: UniversalProviderConfigInput): void;

  /**
   * Unregister a provider
   * @returns true if provider was removed, false if not found
   */
  unregister(id: string): boolean;

  /**
   * Get provider by ID
   */
  get(id: string): UniversalProviderConfig | undefined;

  /**
   * List all registered providers
   */
  listAll(): UniversalProviderConfig[];

  /**
   * Get providers that support a specific modality
   */
  getByModality(modality: ModalityType): UniversalProviderConfig[];

  /**
   * Update an existing provider
   * @throws Error if provider not found
   */
  update(id: string, updates: Partial<UniversalProviderConfigInput>): void;

  /**
   * Validate provider configuration
   * @returns Validation result with errors if any
   */
  validate(config: UniversalProviderConfigInput): {
    valid: boolean;
    errors: string[];
  };
}
```

### 2. Universal Adapter Factory

**File:** `src/lib/providers/universal-adapter-factory.ts`

**Responsibilities:**
- Create adapter instances for providers
- Execute requests per modality
- Transform request/response based on format
- Handle authentication headers

**Interface:**

```typescript
export class UniversalAdapterFactory {
  /**
   * Get or create adapter for a provider
   */
  getAdapter(providerId: string): UniversalAdapter | undefined;

  /**
   * Execute a request through the appropriate adapter
   */
  async execute<T>(
    context: ProviderRequestContext
  ): Promise<ProviderResponse<T>>;

  /**
   * Test connection to a provider
   */
  async testConnection(
    providerId: string,
    apiKey?: string
  ): Promise<{ success: boolean; latencyMs: number; error?: string }>;
}

export interface UniversalAdapter {
  /**
   * Execute a request for a specific modality
   */
  execute<T>(
    modality: ModalityType,
    payload: unknown,
    options?: RequestInit
  ): Promise<ProviderResponse<T>>;

  /**
   * Test if the adapter can connect
   */
  test(): Promise<boolean>;
}
```

### 3. Request Transformer

**File:** `src/lib/providers/request-transformer.ts`

**Responsibilities:**
- Transform internal request format to provider-specific format
- Handle OpenAI-compatible format
- Handle custom formats per modality

**Interface:**

```typescript
export class RequestTransformer {
  /**
   * Transform request for text modality
   */
  transformTextRequest(
    payload: TextGenerationPayload,
    format: RequestFormat
  ): RequestInit;

  /**
   * Transform request for image modality
   */
  transformImageRequest(
    payload: ImageGenerationPayload,
    format: RequestFormat
  ): RequestInit;

  /**
   * Transform request for TTS modality
   */
  transformTTSRequest(
    payload: TTSRequestPayload,
    format: RequestFormat
  ): RequestInit;

  /**
   * Transform request for STT modality
   */
  transformSTTRequest(
    payload: STTRequestPayload,
    format: RequestFormat
  ): RequestInit;
}
```

### 4. Response Transformer

**File:** `src/lib/providers/response-transformer.ts`

**Responsibilities:**
- Parse provider responses to standard format
- Handle streaming vs non-streaming
- Extract relevant data from various response formats

---

## API Contracts

### Backend API Endpoints

**Base Path:** `/api/providers`

```typescript
// GET /api/providers
// List all registered providers
interface ListProvidersResponse {
  providers: UniversalProviderConfig[];
}

// POST /api/providers
// Register a new provider
interface CreateProviderRequest {
  config: UniversalProviderConfigInput;
}

interface CreateProviderResponse {
  provider: UniversalProviderConfig;
}

// GET /api/providers/:id
// Get specific provider
interface GetProviderResponse {
  provider: UniversalProviderConfig;
}

// PUT /api/providers/:id
// Update provider configuration
interface UpdateProviderRequest {
  updates: Partial<UniversalProviderConfigInput>;
}

interface UpdateProviderResponse {
  provider: UniversalProviderConfig;
}

// DELETE /api/providers/:id
// Unregister a provider
interface DeleteProviderResponse {
  success: boolean;
}

// POST /api/providers/:id/test
// Test connection to provider
interface TestProviderRequest {
  apiKey?: string;
}

interface TestProviderResponse {
  success: boolean;
  latencyMs: number;
  error?: string;
}

// POST /api/providers/:id/execute
// Execute a request
interface ExecuteProviderRequest {
  model: string;
  modality: ModalityType;
  payload: unknown;
  parameters?: Record<string, unknown>;
}

interface ExecuteProviderResponse {
  success: boolean;
  latencyMs: number;
  data?: unknown;
  error?: string;
}
```

---

## Data Flow

### Request Flow (Text Generation)

```
User Input (Test Playground)
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Validate Request                                        │
│    - Check provider exists                                  │
│    - Check model exists                                     │
│    - Check modality supported                               │
└─────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Build Request Context                                    │
│    - Provider ID, Model, Modality                           │
│    - Payload, Parameters                                    │
│    - API Key (from vault or override)                       │
└─────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Get Adapter                                              │
│    - UniversalAdapterFactory.getAdapter(providerId)          │
└─────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Transform Request                                        │
│    - RequestTransformer.transform{Modality}Request()         │
│    - Add auth headers                                        │
└─────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Execute Fetch                                            │
│    - await fetch(endpoint, options)                         │
└─────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Transform Response                                       │
│    - ResponseTransformer.transform{Modality}Response()       │
└─────────────────────────────────────────────────────────────┘
       │
       ▼
Return to User
```

---

## File Structure

```
src/
├── domain/
│   └── providers/
│       ├── universal-provider-types.ts       # Core types
│       ├── modality-types.ts                 # Modality definitions
│       └── index.ts                          # Exports
├── lib/
│   └── providers/
│       ├── universal-provider-registry.ts   # Registry service
│       ├── universal-adapter-factory.ts     # Adapter factory
│       ├── request-transformer.ts           # Request transformation
│       ├── response-transformer.ts          # Response transformation
│       └── __tests__/
│           ├── universal-provider-registry.test.ts
│           ├── universal-adapter-factory.test.ts
│           └── request-transformer.test.ts
├── infrastructure/
│   └── providers/
│       ├── provider-storage.ts              # IndexedDB storage
│       └── provider-vault.ts                 # Credential integration
├── routes/
│   ├── api/
│   │   └── providers/                        # Backend API routes
│   │       ├── index.ts
│   │       ├── list.ts
│   │       ├── create.ts
│   │       ├── update.ts
│   │       ├── delete.ts
│   │       ├── test.ts
│   │       └── execute.ts
│   └── __debug__/
│       └── provider-playground/              # Test playground UI
│           ├── index.tsx
│           ├── provider-config.tsx
│           ├── request-panel.tsx
│           ├── response-display.tsx
│           └── types.ts
└── styles/
    └── provider-playground.css               # Test UI styles
```

---

## Implementation Sequence

### Phase 1: Foundation (Stories PRV-01, PRV-02)
1. Create domain types
2. Implement provider registry
3. Add IndexedDB storage layer
4. Write unit tests

### Phase 2: Adapter Layer (Story PRV-03)
1. Implement universal adapter factory
2. Create request/response transformers
3. Add per-modality request builders
4. Write unit tests

### Phase 3: Backend API (Story PRV-04)
1. Create API route handlers
2. Integrate with credential vault
3. Add request validation middleware
4. Write integration tests

### Phase 4: Test Playground (Story PRV-05)
1. Create playground route
2. Build provider configuration UI
3. Implement request/response panels
4. Add modality-specific inputs

### Phase 5: Integration (Story PRV-06)
1. Wire up end-to-end flow
2. Add E2E tests
3. Documentation
4. Demo with Chutes.ai

---

## Testing Strategy

### Unit Tests

| Component | Coverage Target | Key Scenarios |
|-----------|----------------|---------------|
| Registry | 90% | Register, update, remove, validation |
| Adapter Factory | 85% | Create adapter, execute request |
| Request Transformer | 85% | All modalities, both formats |
| Response Transformer | 85% | All modalities, error handling |

### Integration Tests

```typescript
describe('Universal Provider Integration', () => {
  it('should register and use a custom provider', async () => {
    const registry = new UniversalProviderRegistry();
    registry.register(chutesProviderConfig);

    const factory = new UniversalAdapterFactory(registry);
    const response = await factory.execute({
      providerId: 'chutes',
      model: 'zai-org/GLM-4.7-TEE',
      modality: 'text',
      payload: { messages: [{ role: 'user', content: 'Hello' }] },
    });

    expect(response.success).toBe(true);
  });

  it('should handle per-modality endpoints', async () => {
    // Test text, image, tts, stt all use different endpoints
  });
});
```

### E2E Tests (Playwright)

```typescript
test('provider playground end-to-end', async ({ page }) => {
  await page.goto('/__debug__/provider-playground');

  // Configure Chutes.ai provider
  await page.fill('[data-testid="provider-api-key"]', 'test-key');
  await page.click('[data-testid="save-provider"]');

  // Execute text request
  await page.selectOption('[data-testid="modality-select"]', 'text');
  await page.fill('[data-testid="request-input"]', 'Tell me a joke');
  await page.click('[data-testid="send-request"]');

  // Verify response
  await expect(page.locator('[data-testid="response-display"]')).toBeVisible();
});
```

---

## Integration Points

### With EPIC-GU (Grand Unification)

```typescript
// Reuse unified provider types
import type {
  ProviderConfig,
  ModelInfo,
} from '@/domain/types/llm';

// Extend with universal-specific types
export interface UniversalProviderConfig extends ProviderConfig {
  endpoints: Record<ModalityType, string>;
  universalModels: UniversalModelConfig[];
}
```

### With EPIC-40 (Agent Chat)

```typescript
// Register universal providers in tool registry
toolRegistry.registerProvider({
  id: 'universal',
  getAdapter: (providerId: string) => {
    return universalAdapterFactory.getAdapter(providerId);
  },
});
```

### With Credential Vault

```typescript
// Store API keys securely
import { credentialVault } from '@/lib/agent/providers/credential-vault';

await credentialVault.storeCredentials(providerId, apiKey);
const key = await credentialVault.getCredentials(providerId);
```

---

## Standards Compliance

| Standard | Status | Notes |
|----------|--------|-------|
| Clean Architecture | ✅ PASS | Domain types pure, infrastructure manages state |
| Coding Style | ✅ PASS | TypeScript strict, named exports |
| Error Handling | ✅ PASS | Result types, try-catch with logging |
| Size Limits | ✅ PASS | Each file ≤300 lines |
| Import Patterns | ✅ PASS | @/ aliases, no circular deps |

---

## References

- **Epic:** `_bmad-output/epics/EPIC-PRV-universal-openai-compatible-provider-2026-01-11.md`
- **Research:** `_bmad-output/planning-artifacts/bmad-bmm-workflows-research-openai-compatible-provider-2026-01-11.md`
- **Domain Types:** `src/domain/types/llm/provider-types.ts`
- **Credential Vault:** `src/lib/agent/providers/credential-vault.ts`

---

*Document created: 2026-01-11*
*Workflow: /bmad:bmm:workflows:create-tech-spec*
*Status: Ready for Implementation*
*Next Step: Execute `/bmad:bmm:workflows:quick-dev` for test playground
