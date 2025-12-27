# Story 25-0: Create ProviderAdapterFactory with OpenRouter

**Epic:** [25 - AI Foundation Sprint](../epics/epic-25-ai-foundation-sprint.md)  
**Status:** `done`  
**Priority:** P0 (enables Epic 25 core functionality)  
**Points:** 5  
**Created:** 2025-12-23T19:35:00+07:00
**Completed:** 2025-12-23T19:55:00+07:00

---

## User Story

**As a** developer building AI agent capabilities  
**I want** a provider adapter factory that supports OpenRouter and other OpenAI-compatible APIs  
**So that** I can switch between providers without code changes and test with free models

---

## Acceptance Criteria

### AC-25-0-1: OpenRouter Works as OpenAI Adapter
**Given** an OpenRouter API key  
**When** I create an adapter with `createAdapter({ provider: 'openrouter' })`  
**Then** it uses `@tanstack/ai-openai` with `baseURL: 'https://openrouter.ai/api/v1'`

### AC-25-0-2: API Keys Stored Encrypted
**Given** an API key to save  
**When** I call `credentialVault.storeCredentials(providerId, apiKey)`  
**Then** it's stored encrypted (AES-GCM) in IndexedDB via Dexie

### AC-25-0-3: Model List Fetched Dynamically
**Given** a connected provider  
**When** I call `modelRegistry.getModels(providerId)`  
**Then** it returns available models from the provider API

### AC-25-0-4: Connection Test Validates Key
**Given** an API key  
**When** I call `providerAdapter.testConnection(providerId, apiKey)`  
**Then** it makes a minimal API call and returns success/failure

---

## Tasks

### Research
- [x] T0: Research TanStack AI openai adapter patterns (Context7)
- [x] T1: Research OpenRouter API (Exa, official docs)
- [x] T2: Review existing ProviderStatus.tsx and statusbar-store.ts

### Implementation
- [ ] T3: Create `src/lib/agent/providers/types.ts`
- [ ] T4: Create `src/lib/agent/providers/provider-adapter.ts`
- [ ] T5: Create `src/lib/agent/providers/credential-vault.ts`
- [ ] T6: Create `src/lib/agent/providers/model-registry.ts`
- [ ] T7: Create `src/lib/agent/providers/index.ts`
- [ ] T8: Update statusbar-store.ts to use real provider state

### Testing
- [ ] T9: Write unit tests for ProviderAdapterFactory
- [ ] T10: Write unit tests for CredentialVault
- [ ] T11: Write unit tests for ModelRegistry
- [ ] T12: Run test suite

### Verification
- [ ] T13: Run TypeScript check
- [ ] T14: Update sprint-status.yaml

---

## Dev Notes

### TanStack AI OpenAI Adapter Pattern

```typescript
import { chat, toStreamResponse } from "@tanstack/ai";
import { openai } from "@tanstack/ai-openai";

// Standard OpenAI
const adapter = openai({
  apiKey: process.env.OPENAI_API_KEY!,
});

// OpenRouter (baseURL override)
const openRouterAdapter = openai({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});

const stream = chat({
  adapter: openRouterAdapter,
  messages,
  model: "meta-llama/llama-3.1-8b-instruct:free",
});
```

### ProviderAdapterFactory Design

```typescript
// src/lib/agent/providers/types.ts
export interface ProviderConfig {
  id: string;
  name: string;
  baseURL?: string;  // For OpenAI-compatible providers
  type: 'openai' | 'openai-compatible';
}

export interface AdapterConfig {
  apiKey: string;
  baseURL?: string;
}

export const PROVIDERS: Record<string, ProviderConfig> = {
  openai: { id: 'openai', name: 'OpenAI', type: 'openai' },
  openrouter: { 
    id: 'openrouter', 
    name: 'OpenRouter', 
    baseURL: 'https://openrouter.ai/api/v1',
    type: 'openai-compatible' 
  },
};
```

### CredentialVault Design (Web Crypto + Dexie)

```typescript
// Encrypt with Web Crypto API (AES-GCM)
const key = await crypto.subtle.generateKey(
  { name: 'AES-GCM', length: 256 },
  true,
  ['encrypt', 'decrypt']
);

const encrypted = await crypto.subtle.encrypt(
  { name: 'AES-GCM', iv },
  key,
  encoder.encode(apiKey)
);

// Store in Dexie.js credentials table
await db.credentials.put({ providerId, encrypted, iv });
```

### Free OpenRouter Models (December 2025)

| Model | ID |
|-------|---|
| Llama 3.1 8B | `meta-llama/llama-3.1-8b-instruct:free` |
| Gemini 2.0 Flash | `google/gemini-2.0-flash-exp:free` |
| DeepSeek R1 | `deepseek/deepseek-r1:free` |
| DeepSeek V3 | `deepseek/deepseek-v3:free` |

---

## Research Requirements

| Source | Query | Status |
|--------|-------|--------|
| Context7 | TanStack AI openai adapter | ✅ Done |
| Exa | OpenRouter baseURL integration | ✅ Done |
| Codebase | ProviderStatus.tsx | ✅ Done |

---

## References

- [Master Implementation Plan](./epic-25-12-28-master-implementation-plan.md)
- [TanStack AI Docs](https://tanstack.com/ai/latest)
- [OpenRouter API](https://openrouter.ai/docs)
- [ProviderStatus.tsx](file:///c:/Users/Admin/Documents/coding-project/project-alpha-master/project-alpha-master/src/components/ide/statusbar/ProviderStatus.tsx)
- [statusbar-store.ts](file:///c:/Users/Admin/Documents/coding-project/project-alpha-master/project-alpha-master/src/lib/state/statusbar-store.ts)

---

## Dev Agent Record

*To be filled during implementation*

---

## Code Review

*To be filled after implementation*

---

## Status History

| Date | Status | Notes |
|------|--------|-------|
| 2025-12-23T19:35 | drafted | Story created by SM |
| 2025-12-23T19:35 | ready-for-dev | Context XML created |
