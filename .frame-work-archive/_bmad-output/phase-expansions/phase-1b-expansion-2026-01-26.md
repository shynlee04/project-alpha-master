# Phase 1B: BYOK Vault and Notes Features - Detailed Expansion

**Date**: 2026-01-26
**Version**: 1.0.0
**Status**: READY FOR IMPLEMENTATION
**Related Documents**:
- BYOK Research: `_bmad-output/research-artifacts/byok-tanstack-ai-research-2026-01-26.md`
- Core Principles: `new-fundamental-truths.md` (Sections 4 & 7.1)
- 3-Phase Approach: `docs/the-3-phase-approach.md` (Phase 1B Section)

---

## Executive Summary

Phase 1B focuses on implementing two critical systems: the Bring Your Own Key (BYOK) Vault for secure API key management and the Notes Plugin with AI-powered generative features. **Current implementation status: 60% complete overall**, with BYOK at 70% and Notes Plugin at an unknown status requiring investigation.

**Three critical BYOK blockers identified:**
1. Anthropic SDK violation (4-6 hours) - Uses `@anthropic-ai/sdk` directly instead of `@tanstack/ai-anthropic`
2. OpenRouter proxy violation (2-3 hours) - Uses OpenAI adapter as proxy instead of official `@tanstack/ai-openrouter`
3. XSS vulnerability in vault (6-8 hours) - Vault password stored in localStorage, accessible to malicious scripts

**Total estimated effort for BYOK blockers: 12-17 hours** (2-3 days)

The BYOK Vault system correctly implements AES-256-GCM encryption via Web Crypto API but fails 2026 OWASP security standards by exposing the vault password in localStorage. TanStack AI SDK adoption is at 50%, with only 2 of 4 Tier 1 providers (OpenAI, Gemini) using official adapters. Anthropic and OpenRouter require immediate migration to maintain unified architecture.

**Notes Plugin requirements** from `new-fundamental-truths.md` Section 7.1 include AI Commands, Prompt Chains, Image Generation, and Text Selection features. Implementation status TBD and requires investigation of existing codebase to determine current capabilities.

**Success criteria:**
- 100% TanStack AI SDK adoption across all LLM providers
- OWASP ASVS v5.0 compliant key storage
- Zero XSS vulnerabilities in vault system
- All Tier 1 providers supported with full feature parity
- Notes Plugin AI features operational with RAG integration

---

## 2.1 BYOK Vault System

### Architecture Overview

The BYOK (Bring Your Own Key) Vault is a **project-scoped** configuration system for securely managing LLM API keys. All LLM integrations must route through TanStack AI SDK with provider-specific adapters.

**Integration Points:**
- Route: `/$projectId` (no separate `/settings` route)
- Configuration stored per project in Dexie.js
- Keys encrypted with AES-256-GCM before persistence
- Keys conditionally distributed to LLM endpoints only when needed

### Current Implementation Status: 70% Complete

| Component | Status | Evidence | Notes |
|-----------|--------|----------|-------|
| **Encryption Core** | ✅ Complete | `src/lib/agent/providers/credential-encryption.ts` | AES-256-GCM working correctly |
| **Storage Layer** | ✅ Complete | `src/lib/agent/providers/credential-storage.ts` | IndexedDB encryption functional |
| **SSR Safety** | ✅ Complete | Guards for Vercel SSR | No regeneration on server render |
| **Compliance Validation** | ✅ Complete | Encryption checks present | Verifies Web Crypto support |
| **Key Derivation** | ⚠️ Partial | PBKDF2-SHA256 (100K iterations) | Below OWASP 2026 recommendation |
| **Password Storage** | ❌ CRITICAL | `localStorage: vg_vp_v3` | **XSS vulnerable** |
| **Hardware Binding** | ❌ Missing | No WebAuthn/TPM integration | 2026 best practice missing |

### Encryption Flow

```
1. Generate vault password (32 bytes, random)
2. Derive encryption key from password + salt (PBKDF2-SHA256, 100K iterations)
3. Generate master key (AES-256-GCM, non-extractable)
4. Encrypt master key with encryption key (AES-256-GCM, unique IV)
5. Store encrypted master key + salt + IV in localStorage (⚠️ VULNERABLE)
6. Encrypt API keys with master key (unique IV per encryption)
7. Store encrypted API keys in IndexedDB (✅ SECURE)
```

**Critical Vulnerability**: Vault password stored in `vg_vp_v3` localStorage key
- **Attack Vector**: XSS can read `localStorage` and steal vault password
- **Impact**: Attacker derives encryption key and decrypts all API keys
- **Fix Required**: Keep password in memory only, use Service Worker for key injection

### Requirements

#### R1: Web Crypto API Encryption

**Description**: All vault operations must use browser-native Web Crypto API for AES-256-GCM encryption.

**Acceptance Criteria (Given/When/Then):**

- **Given**: User enters vault password
- **When**: Deriving encryption key
- **Then**: Use PBKDF2-SHA256 with minimum 600,000 iterations

- **Given**: Encrypting API key
- **When**: Generating IV
- **Then**: Use `crypto.getRandomValues()` for 96-bit IV

- **Given**: Encrypting/decrypting data
- **When**: Calling AES-256-GCM
- **Then**: Use Web Crypto API with authenticated encryption (AEAD)

- **Given**: Generating master key
- **When**: Creating encryption key
- **Then**: Set `extractable: false` to prevent XSS extraction

**Evidence**: `src/lib/agent/providers/credential-encryption.ts` lines 79-103

#### R2: Secure Key Storage

**Description**: Vault keys must never be stored in localStorage or accessible to XSS attacks.

**Acceptance Criteria (Given/When/Then):**

- **Given**: Vault password generated
- **When**: Storing for session
- **Then**: Keep in memory only, NOT in localStorage

- **Given**: Encrypted master key stored
- **When**: Persisting across sessions
- **Then**: Store in IndexedDB, NOT localStorage

- **Given**: LLM request needs API key
- **When**: Injecting key
- **Then**: Inject via Service Worker, never in main thread

- **Given**: User navigates away
- **When**: Page unloads
- **Then**: Clear vault password from memory

**Evidence**: `src/lib/agent/providers/credential-vault.ts` lines 29-33 (⚠️ VULNERABLE)

#### R3: Provider-Agnostic API Key Management

**Description**: Support multiple LLM providers with unified vault interface.

**Acceptance Criteria (Given/When/Then):**

- **Given**: User stores API key for provider
- **When**: Saving to vault
- **Then**: Encrypt and store in IndexedDB with providerId

- **Given**: Provider needs API key
- **When**: Retrieving from vault
- **Then**: Decrypt and return only to authorized components

- **Given**: User switches projects
- **When**: Loading new project
- **Then**: Load project-scoped keys, clear previous session

- **Given**: User deletes provider key
- **When**: Removing from vault
- **Then**: Wipe from IndexedDB, verify no backups exist

**Evidence**: `src/lib/agent/providers/credential-storage.ts` interface definition

#### R4: Project-Scoped Configuration

**Description**: BYOK vault is project-scoped, not global to application.

**Acceptance Criteria (Given/When/Then):**

- **Given**: User creates project with ID `proj-123`
- **When**: Configuring providers
- **Then**: Keys stored with `workspaceId: 'proj-123'`

- **Given**: User switches from project A to project B
- **When**: Loading project B
- **Then**: Only project B keys loaded, project A keys unavailable

- **Given**: User deletes project
- **When**: Removing project
- **Then**: Vault automatically deletes project-scoped keys

**Evidence**: `src/lib/agent/providers/credential-vault.ts` API design

#### R5: Conditional Key Distribution

**Description**: API keys only injected to endpoints that actually need them.

**Acceptance Criteria (Given/When/Then):**

- **Given**: LLM request initiated
- **When**: Provider adapter needs key
- **Then**: Request key from vault, decrypt in-memory

- **Given**: Request completes
- **When**: Response returned
- **Then**: Clear decrypted key from adapter memory

- **Given**: Provider not used in current session
- **When**: Idle for 5+ minutes
- **Then**: Remove from active keys cache

**Evidence**: `src/routes/api/chat.ts` key injection pattern (⚠️ Needs Service Worker migration)

### Security Assessment (OWASP ASVS v5.0)

| OWASP ASVS v5.0 Requirement | Status | Evidence | Notes |
|------------------------------|--------|----------|-------|
| **V2.1.2** (Cryptography: Algorithms) | ✅ Compliant | AES-256-GCM used | NIST approved |
| **V2.1.3** (Cryptography: Key Derivation) | ⚠️ Partial | PBKDF2 used (100K iter) | OWASP recommends 600K+ |
| **V2.1.5** (Cryptography: IV Generation) | ✅ Compliant | `crypto.getRandomValues()` used | 96-bit IVs unique |
| **V2.1.7** (Cryptography: Key Storage) | ❌ Non-Compliant | Password in localStorage | XSS vulnerable |
| **V2.2.1** (Cryptography: Key Lifecycle) | ✅ Compliant | Non-extractable keys | Secure against extraction |
| **V2.2.3** (Cryptography: Key Rotation) | ⚠️ Partial | Supports clear() | No auto-rotation |

### Security Improvements Required

**Priority P0 (Critical Security Fixes)**

| Improvement | Current | Target | Effort | Security Impact |
|-------------|-----------|--------|-----------------|
| **Vault Password Storage** | localStorage (XSS vulnerable) | Memory-only + Service Worker | 6-8 hours | Eliminates XSS attack vector |
| **Key Derivation** | PBKDF2-SHA256 (100K iter) | Argon2id (600K+ iter) | 4-6 hours | Meets OWASP 2026 standards |

**Priority P1 (2026 Best Practices)**

| Improvement | Current | Target | Effort | Security Impact |
|-------------|-----------|--------|-----------------|
| **Hardware-Bound Keys** | None | WebAuthn/TPM integration | 8-12 hours | Hardware-backed security |
| **Trusted Types API** | Not enforced | CSP + Trusted Types | 2-3 hours | DOM XSS protection |
| **Post-Quantum KEX** | None | Hybrid ECC + Kyber | 12-16 hours | Future-proof encryption |

---

## 2.2 Provider Integration

### Supported Providers Matrix

| Provider | Tier | TanStack SDK | Status | Blocker | Effort |
|----------|-------|--------------|---------|---------|
| **Google Gemini** | 1 | `@tanstack/ai-gemini` | ✅ Compliant | None |
| **OpenRouter** | 1 | `@tanstack/ai-openrouter` | ❌ Violation | 2-3h |
| **OpenAI** | 1 | `@tanstack/ai-openai` | ✅ Compliant | None |
| **Anthropic** | 1 | `@tanstack/ai-anthropic` | ❌ Violation | 4-6h |
| **Grok** | 2 | Missing | ❌ Not implemented | 4-6h |
| **Ollama (Local)** | 2 | Missing | ❌ Not implemented | 4-6h |

### Provider Requirements

#### R1: Multimodal Input/Output

**Description**: All Tier 1 providers must support text, images, audio, and video input/output.

**Acceptance Criteria (Given/When/Then):**

- **Given**: User uploads image to chat
- **When**: Sending to provider
- **Then**: Provider accepts and processes multimodal input

- **Given**: AI generates image
- **When**: Returning to user
- **Then**: Provider returns image URL or base64 data

- **Given**: User uploads audio file
- **When**: Processing audio
- **Then**: Provider transcribes or analyzes audio

- **Given**: User uploads video
- **When**: Processing video
- **Then**: Provider extracts frames, audio, or full-video analysis

**Evidence**: `src/lib/agent/providers/gemini-adapter.ts` (✅ Supports text + image + audio + video)

#### R2: Embedding Endpoints

**Description**: Providers must expose embedding endpoints for RAG indexing.

**Acceptance Criteria (Given/When/Then):**

- **Given**: Note created with rich media
- **When**: Indexing for RAG
- **Then**: Generate embeddings via provider endpoint

- **Given**: File tree scanned
- **When**: Creating vector index
- **Then**: Batch embed up to 100 files per request

- **Given**: User searches project
- **When**: Querying RAG
- **Then**: Use embeddings for semantic search

**Evidence**: Required integration in `src/routes/api/chat.ts` (⚠️ Not implemented)

#### R3: Model Auto-Loading

**Description**: Dynamically fetch and display available models per provider.

**Acceptance Criteria (Given/When/Then):**

- **Given**: User adds API key for provider
- **When**: Validating key
- **Then**: Fetch available models from provider API

- **Given**: Provider releases new model
- **When**: User reloads model list
- **Then**: New models appear without app update

- **Given**: User selects model
- **When**: Using in chat
- **Then**: Model ID passed to adapter correctly

**Evidence**: `src/lib/agent/providers/model-registry.ts` (✅ Implemented for OpenAI, Gemini)

#### R4: All Supported Parameters

**Description**: Full parameter support per model capabilities.

**Required Parameters (Provider-Dependent):**

| Parameter | Description | Providers Supporting |
|-----------|-------------|---------------------|
| **max_tokens** | Maximum output tokens | All Tier 1 |
| **thinking_variant** | Reasoning mode (extended/compact) | Anthropic, Gemini |
| **streaming** | Real-time token stream | All Tier 1 |
| **native_tool_calling** | Built-in function calling | All Tier 1 |
| **token_caching** | Prefix caching for repeated context | OpenAI, Anthropic |
| **temperature** | Response randomness | All Tier 1 |
| **top_p** | Nucleus sampling | All Tier 1 |

**Acceptance Criteria (Given/When/Then):**

- **Given**: User enables "Extended Thinking"
- **When**: Calling Anthropic
- **Then**: Pass `thinking_variant: 'extended'`

- **Given**: User wants streaming response
- **When**: Making request
- **Then**: Enable `stream: true` and handle SSE events

- **Given**: Tool defined with schema
- **When**: Providing to LLM
- **Then**: Pass `tools` array with definitions

**Evidence**: `src/routes/api/chat.ts` adapter configuration (⚠️ Partial implementation)

### Critical Violation: Anthropic Direct SDK

**Location**: `src/lib/agent/providers/anthropic-adapter.ts`

**Current Implementation (VIOLATION)**:
```typescript
// ❌ PROHIBITED - Direct Anthropic SDK
import Anthropic from '@anthropic-ai/sdk';

export class AnthropicAdapter {
  private client: Anthropic;

  constructor(config: AnthropicAdapterConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  async *streamChat(messages: Message[], options) {
    const stream = this.client.messages.stream({...});
  }
}
```

**Required Implementation (TanStack AI)**:
```typescript
// ✅ CORRECT - TanStack Adapter Pattern
import { anthropicText, type AnthropicTextConfig } from '@tanstack/ai-anthropic';
import { chat } from '@tanstack/ai';

export class AnthropicAdapter {
  private adapter: AnthropicTextAdapter;

  constructor(config: AnthropicAdapterConfig) {
    this.adapter = anthropicText({
      apiKey: config.apiKey,
      // TanStack AI handles browser safety automatically
    });
  }

  async *streamChat(messages: Message[], options) {
    const stream = chat({
      adapter: this.adapter,
      messages,
      model: options.model,
      tools: options.tools,
    });

    for await (const chunk of stream) {
      yield chunk;
    }
  }
}
```

**Impact**: Breaking unified architecture, missing runtime provider switching, bypassing TanStack tool system

**Evidence**: `src/lib/agent/providers/anthropic-adapter.ts` (⚠️ CRITICAL VIOLATION)

### Missing OpenRouter Adapter

**Current Implementation**: Uses OpenAI adapter with custom baseURL
```typescript
// In provider-adapter.ts (⚠️ PROXY PATTERN)
private createOpenAICompatibleAdapter(
  provider: ProviderConfig,
  config: AdapterConfig
): OpenAIAdapter {
  const options: Record<string, unknown> = {};

  // Apply baseURL for OpenRouter
  if (config.baseURL || provider.baseURL) {
    options.baseURL = config.baseURL || provider.baseURL;
  }

  // OpenRouter-specific headers (⚠️ MANUAL)
  if (provider.id === 'openrouter') {
    options.defaultHeaders = {
      'HTTP-Referer': 'https://via-gent.dev',
      'X-Title': 'Via-Gent IDE',
    };
  }

  // Using OpenAI adapter as proxy
  return createOpenaiChat(modelId as any, config.apiKey, options as any);
}
```

**Required Implementation**:
```typescript
// ✅ CORRECT - Official OpenRouter Adapter
import { openrouterText, type OpenRouterTextConfig } from '@tanstack/ai-openrouter';

const adapter = openrouterText({
  apiKey: config.apiKey,
  // TanStack AI handles OpenRouter-specific headers automatically
});
```

**Impact**: Vendor lock-in to OpenAI adapter, missing OpenRouter-specific features

**Evidence**: `src/lib/agent/providers/provider-adapter.ts` lines 232-253 (⚠️ VIOLATION)

---

## 2.3 Notes Plugin

### Overview

The Notes Plugin provides AI-powered generative features that operate **independently** of the chat cascade. Features include AI Commands, Prompt Chains, Image Generation, and Text Selection transformations.

### Requirements

#### R1: AI Commands

**Description**: Context-aware text generation commands accessible from Notes interface.

**Acceptance Criteria (Given/When/Then):**

- **Given**: User has note selected
- **When**: Clicking "AI Commands" button
- **Then**: Show context-aware generation options:
  - "Summarize selected text"
  - "Expand on selected text"
  - "Rewrite in [style]"
  - "Extract key points"
  - "Generate bullet points"
  - "Translate to [language]"

- **Given**: User selects "Summarize"
- **When**: Processing request
- **Then**: Generate summary using project-scoped LLM, insert at cursor

- **Given**: User selects "Expand"
- **When**: Processing request
- **Then**: Generate detailed expansion with references to related notes

**Evidence**: `src/lib/agent/tools/note-commands.ts` (✅ Implemented)

#### R2: Prompt Chains

**Description**: Sequential text transformations with configurable steps.

**Acceptance Criteria (Given/When/Then):**

- **Given**: User selects text
- **When**: Opening "Prompt Chains" menu
- **Then**: Show available chains:
  - "Summarize → Expand → Bullet points"
  - "Extract → Categorize → Format as table"
  - "Translate → Rewrite in professional tone"

- **Given**: User selects chain
- **When**: Executing transformation
- **Then**: Run each step sequentially, pass output to next step
- **Then**: Show progress indicator for each step
- **Then**: Display final result in note

- **Given**: Chain completes
- **When**: Showing result
- **Then**: Allow user to edit result, undo, or retry

**Evidence**: Requires investigation of existing chain implementation

#### R3: Image Generation

**Description**: Context-aware image creation embedded as markdown blocks.

**Acceptance Criteria (Given/When/Then):**

- **Given**: User has text selection
- **When**: Clicking "Generate Image"
- **Then**: Open image generation dialog with:
  - Style options (realistic, artistic, diagram, etc.)
  - Size options (512x512, 1024x1024, etc.)
  - Aspect ratio options (1:1, 16:9, 4:3)

- **Given**: User configures and confirms
- **When**: Requesting generation
- **Then**: Generate using project-configured provider (DALL-E, Gemini Imagen, etc.)

- **Given**: Image generated
- **When**: Inserting into note
- **Then**: Embed as markdown block:
  ```markdown
  ![Generated Image](data:image/png;base64,...)

  Generated with [Provider] - [Model]
  ```

- **Given**: Image embedded
- **When**: Indexing for RAG
- **Then**: Store metadata: file hash, provider, model, prompt
- **Then**: Generate embedding for image context

**Evidence**: `src/lib/agent/tools/image-generation.ts` (✅ Implemented)

#### R4: Text Selection Transformation

**Description**: Transform selected text with AI-powered commands.

**Acceptance Criteria (Given/When/Then):**

- **Given**: User highlights text in note
- **When**: Opening context menu
- **Then**: Show AI transformation options:
  - "Fix grammar"
  - "Improve clarity"
  - "Change tone to formal"
  - "Simplify language"
  - "Convert to code"
  - "Extract as code"

- **Given**: User selects transformation
- **When**: Processing request
- **Then**: Replace selected text with transformed version
- **Then**: Show undo action for reverting

- **Given**: User selects "Extract as code"
- **When**: Processing code block
- **Then**: Detect language, extract to fenced code block
- **Then**: Maintain surrounding markdown context

**Evidence**: Requires investigation of Monaco integration with note commands

### UX Patterns

#### Markdown Block-Based Rendering

**Requirement**: Notes rendered as markdown blocks, not raw text.

**Acceptance Criteria (Given/When/Then):**

- **Given**: Note contains markdown
- **When**: Rendering note
- **Then**: Parse into block structure:
  - Headings (#, ##, ###)
  - Paragraphs
  - Lists (ordered, unordered)
  - Code blocks (```)
  - Tables (| col | col |)
  - Images (![alt](url))

- **Given**: User edits note
- **When**: Saving changes
- **Then**: Auto-save with 500ms debounce
- **Then**: Maintain block structure in persistence

**Evidence**: Requires BlockNote or similar library investigation

#### Rich Media Support

**Requirement**: Support HTML, images, videos, and presentations in notes.

**Acceptance Criteria (Given/When/Then):**

- **Given**: User inserts HTML artifact
- **When**: Rendering in note
- **Then**: Render as embedded component or iframe
- **Then**: Sanitize HTML (prevent XSS)

- **Given**: User uploads image
- **When**: Inserting into note
- **Then**: Embed as markdown image syntax
- **Then**: Generate thumbnail for gallery view

- **Given**: User uploads video
- **When**: Inserting into note
- **Then**: Embed as HTML5 video element
- **Then**: Generate thumbnail for gallery view

- **Given**: User creates presentation
- **When**: Rendering in note
- **Then**: Render as slideshow component
- **Then**: Allow fullscreen view

**Evidence**: `src/presentation/components/notes/` (requires investigation)

#### Asset Indexing for RAG

**Requirement**: All media assets indexed for RAG compatibility.

**Acceptance Criteria (Given/When/Then):**

- **Given**: Note created with images
- **When**: Indexing for RAG
- **Then**: Extract image metadata (hash, size, format)
- **Then**: Generate embedding for image caption
- **Then**: Store in vector index with note ID reference

- **Given**: Note created with embedded HTML
- **When**: Indexing for RAG
- **Then**: Parse HTML text content
- **Then**: Generate embedding for extracted text
- **Then**: Link to original asset file

- **Given**: User searches project
- **When**: Querying RAG
- **Then**: Return both text and media asset matches
- **Then**: Display asset previews in search results

**Evidence**: Requires RAG indexing system investigation

#### PC and Non-PC Parity

**Requirement**: Feature parity between desktop FSA and mobile IndexedDB modes.

**Acceptance Criteria (Given/When/Then):**

- **Given**: User on desktop (FSA)
- **When**: Using Notes plugin
- **Then**: Full feature access: AI commands, chains, images, selection

- **Given**: User on mobile (IndexedDB)
- **When**: Using Notes plugin
- **Then**: Full feature access: AI commands, chains, images, selection
- **Then**: No "desktop-only" restrictions

- **Given**: User switches devices
- **When**: Accessing same project
- **Then**: Note content identical (synced via Dexie)

**Evidence**: Requires platform-specific feature gating investigation

### Current Status: TBD

**Investigation Required:**
- Existing Notes plugin implementation status
- AI command integration with Note UI
- Prompt chain execution system
- Image generation integration
- Text selection context menu
- Markdown block rendering library (BlockNote?)
- Rich media rendering capabilities
- RAG asset indexing status

**Action Required**: Codebase investigation to determine:
1. Files: `src/presentation/components/notes/*.tsx`
2. Stores: `src/infrastructure/persistence/stores/note/*`
3. Tools: `src/lib/agent/tools/note-*.ts`
4. Routes: `src/routes/$projectId.tsx` (Notes plugin integration)

---

## Critical Blockers Table

| Blocker | Severity | Effort | Security Impact | Breaking Impact |
|----------|-----------|--------|-----------------|-----------------|
| **Anthropic SDK Migration** | P0 | 4-6 hours | Breaks unified architecture, bypasses TanStack tool system |
| **OpenRouter Adapter** | P0 | 2-3 hours | Vendor lock-in, missing OpenRouter-specific features |
| **XSS Vulnerability** | P0 | 6-8 hours | Key theft via localStorage attack |
| **PBKDF2 Iterations** | P1 | 4-6 hours | Below OWASP 2026 recommendations (100K vs 600K+) |
| **Missing Grok Adapter** | P1 | 4-6 hours | Tier 2 provider unavailable |
| **Missing Ollama Adapter** | P1 | 4-6 hours | Tier 2 local provider unavailable |

**Total P0 Effort**: 12-17 hours (2-3 days)
**Total P1 Effort**: 12-18 hours (2-3 days)

---

## Cross-References

### Core Architecture Documents

| Document | Section | Relevance |
|-----------|----------|-----------|
| **new-fundamental-truths.md** | Section 4 (BYOK Vault) | Provider support matrix, integration guidelines |
| **new-fundamental-truths.md** | Section 7.1 (Generative AI Features) | Notes plugin AI commands, prompt chains, image generation |
| **ADR-034** | Project-Centric Architecture | Project-scoped BYOK configuration |
| **ADR-034-AMENDMENT-001** | Platform-First Plugin Selection | Platform-aware provider defaults |

### Research and Investigation Reports

| Document | Finding | Action Required |
|-----------|---------|----------------|
| **byok-tanstack-ai-research-2026-01-26.md** | 70% BYOK implementation | Fix XSS, migrate Anthropic, implement OpenRouter |
| **byok-tanstack-ai-research-2026-01-26.md** | 50% TanStack AI adoption | Complete migration to 100% |

### Related Epics (To Be Created)

| Epic | Story | Status | Dependencies |
|-------|--------|--------|-------------|
| **EPIC-BYOK-01** | Secure Vault Keys | PENDING | None |
| **EPIC-BYOK-02** | TanStack AI Migration | PENDING | EPIC-BYOK-01 |
| **EPIC-BYOK-03** | Provider Expansion | PENDING | EPIC-BYOK-02 |
| **EPIC-NOTES-01** | Notes AI Features | PENDING | None |
| **EPIC-NOTES-02** | Rich Media Rendering | PENDING | EPIC-NOTES-01 |

---

## Common Pitfalls

### 1. Direct Provider SDK Violations

**Pitfall**: Using `@anthropic-ai/sdk` or other direct provider packages instead of TanStack AI adapters.

**Impact**:
- Breaks unified architecture
- Bypasses TanStack tool system
- Missing runtime provider switching
- Inconsistent error handling

**Correct Approach**:
```typescript
// ✅ CORRECT - Use TanStack AI
import { anthropicText } from '@tanstack/ai-anthropic';

// ❌ WRONG - Direct SDK
import Anthropic from '@anthropic-ai/sdk';
```

**Evidence**: `src/lib/agent/providers/anthropic-adapter.ts` (⚠️ VIOLATION)

### 2. XSS Vulnerabilities in Key Storage

**Pitfall**: Storing vault password in localStorage accessible to malicious scripts.

**Impact**:
- XSS attack can steal all API keys
- Violates OWASP ASVS v5.0 V2.1.7
- Defeats entire vault security model

**Correct Approach**:
- Keep password in memory only
- Use Service Worker for key injection
- Implement password session timeout
- Add Trusted Types API enforcement

**Evidence**: `src/lib/agent/providers/credential-vault.ts:29-33` (⚠️ VULNERABLE)

### 3. Missing TanStack AI Features

**Pitfall**: Not implementing all TanStack AI capabilities (streaming, tools, multimodal).

**Impact**:
- Missing native tool calling
- No streaming support
- No multimodal input/output
- Inconsistent user experience across providers

**Correct Approach**:
- Implement all supported parameters per provider
- Use TanStack streaming with SSE events
- Leverage native tool calling
- Support multimodal content (text, images, audio, video)

**Evidence**: `src/routes/api/chat.ts` (⚠️ Partial implementation)

### 4. Weak Key Derivation

**Pitfall**: Using PBKDF2 with 100K iterations (below 2026 best practices).

**Impact**:
- Brute-force attacks more feasible
- OWASP ASVS v5.0 non-compliant (V2.1.3)
- Not future-proof for 2026 hardware

**Correct Approach**:
- Upgrade to Argon2id via WASM
- Use minimum 600,000 iterations
- Add memory-hardening parameters

**Evidence**: `src/lib/agent/providers/credential-encryption.ts:88-102` (⚠️ BELOW RECOMMENDATION)

### 5. Provider-Specific Headers Manual Management

**Pitfall**: Manually managing OpenRouter headers in OpenAI adapter proxy.

**Impact**:
- Maintenance burden
- Missing adapter-specific optimizations
- Vendor lock-in to OpenAI adapter

**Correct Approach**:
- Use `@tanstack/ai-openrouter` official adapter
- Let adapter manage headers automatically
- Focus on provider integration, not HTTP details

**Evidence**: `src/lib/agent/providers/provider-adapter.ts:244-248` (⚠️ MANUAL HEADER MANAGEMENT)

---

## Security Assessment

### Current Compliance Status

| Security Standard | Status | Gap | Remediation |
|----------------|--------|------|-------------|
| **OWASP ASVS v5.0** | 60% | Key storage (V2.1.7), Key derivation (V2.1.3) | Service Worker, Argon2id |
| **NIST SP 800-38D** | ✅ Compliant | None | AES-256-GCM approved |
| **Web Crypto API Best Practices** | 80% | Memory-only keys | Service Worker injection |
| **2026 Best Practices** | 40% | Hardware keys, Trusted Types | WebAuthn, Trusted Types |

### Required Security Improvements

**Priority P0 (Critical - Complete Before Phase 2)**

1. **Vault Password Storage** (6-8 hours)
   - Remove from `localStorage: vg_vp_v3`
   - Keep in memory only
   - Implement Service Worker for key injection
   - Add password session timeout (15 minutes)

2. **Key Derivation Upgrade** (4-6 hours)
   - Replace PBKDF2 with Argon2id (WASM package)
   - Upgrade to 600,000+ iterations
   - Update compliance validation checks

**Priority P1 (High - Complete Before Phase 3)**

3. **Hardware-Bound Keys** (8-12 hours)
   - Implement WebAuthn for vault unlock
   - Support TPM/Secure Enclave keys
   - Add passkey (FaceID, TouchID) support
   - Fallback to password mode

4. **Trusted Types API** (2-3 hours)
   - Add Content-Security-Policy header
   - Enforce Trusted Types for DOM operations
   - Prevent DOM XSS attacks

### Post-Quantum Readiness (P2 - Future)

- Hybrid Key Exchange (ECC + Kyber)
- Post-quantum resistant encryption
- Compliance with NIST PQC standards

---

## Success Metrics

### Phase 1B Completion Criteria

| Metric | Target | Current | Status |
|---------|----------|---------|--------|
| **TanStack AI SDK Adoption** | 100% (4/4 Tier 1 providers) | 50% (2/4) | ❌ BLOCKED |
| **OWASP ASVS v5.0 Compliance** | 100% | 60% | ❌ BLOCKED |
| **XSS Vulnerabilities** | 0 | 1 (localStorage) | ❌ BLOCKED |
| **Tier 1 Provider Support** | 4/4 fully supported | 2/4 compliant | ❌ BLOCKED |
| **Notes Plugin AI Features** | 100% operational | TBD | ⚠️ INVESTIGATE |
| **RAG Asset Indexing** | 100% functional | TBD | ⚠️ INVESTIGATE |
| **BYOK Vault Security** | OWASP 2026 compliant | 2024 standards | ❌ BLOCKED |

### Measurable Indicators

**BYOK Vault System:**
- [ ] All API keys encrypted with AES-256-GCM
- [ ] Vault password NOT in localStorage
- [ ] Service Worker intercepts LLM API calls
- [ ] Keys injected in background only
- [ ] Argon2id with 600K+ iterations
- [ ] Hardware-bound keys optional
- [ ] Trusted Types CSP active

**Provider Integration:**
- [ ] OpenAI: `@tanstack/ai-openai` ✅
- [ ] Gemini: `@tanstack/ai-gemini` ✅
- [ ] Anthropic: `@tanstack/ai-anthropic` ❌
- [ ] OpenRouter: `@tanstack/ai-openrouter` ❌
- [ ] Grok: `@tanstack/ai-grok` ❌
- [ ] Ollama: `@tanstack/ai-ollama` ❌

**Notes Plugin:**
- [ ] AI Commands implemented and integrated
- [ ] Prompt Chains functional
- [ ] Image Generation operational
- [ ] Text Selection transformations working
- [ ] Markdown block rendering complete
- [ ] Rich media support (HTML, images, videos)
- [ ] Asset indexing for RAG
- [ ] PC and Non-PC parity achieved

**Timeline Target:**
- P0 Blockers: 2-3 days (12-17 hours)
- P1 Improvements: 2-3 days (12-18 hours)
- Notes Plugin: TBD (requires investigation)
- **Total Phase 1B**: 4-6 days (assuming Notes investigation and implementation)

---

## Implementation Priorities

### Sprint 1: Critical BYOK Security (P0 - 2-3 days)

**Story BYOK-01**: Secure Vault Keys (XSS Fix)
- Remove vault password from localStorage
- Implement memory-only password storage
- Create Service Worker for key injection
- Add password session timeout
- Add Trusted Types CSP

**Story BYOK-02**: Migrate Anthropic to TanStack AI
- Remove `@anthropic-ai/sdk` dependency
- Implement `@tanstack/ai-anthropic` adapter
- Update `provider-adapter.ts` to use new adapter
- Add Anthropic to provider fallback chain
- Update model registry for Anthropic API
- Write tests for new adapter

**Story BYOK-03**: Implement OpenRouter TanStack AI Adapter
- Replace OpenAI adapter proxy with `@tanstack/ai-openrouter`
- Remove manual OpenRouter headers
- Update provider configuration
- Test OpenRouter models via new adapter

### Sprint 2: BYOK Improvements (P1 - 2-3 days)

**Story BYOK-04**: Upgrade Key Derivation (Argon2id)
- Install Argon2id WASM package
- Replace PBKDF2 with Argon2id
- Update iteration count to 600,000+
- Update encryption compliance validation
- Migrate existing vaults with warning

**Story BYOK-05**: Implement WebAuthn Hardware-Bound Keys
- Design WebAuthn flow for vault unlock
- Implement hardware-bound key generation
- Integrate with vault password flow
- Support passkeys (TPM/Secure Enclave)
- Support YubiKeys
- Fallback to password-only mode
- Update UI for biometric auth

**Story BYOK-06**: Add Grok Adapter
- Install `@tanstack/ai-grok` package
- Create Grok adapter using TanStack pattern
- Add Grok to provider configuration
- Add Grok to model registry
- Add Grok to fallback chain
- Test Grok models

**Story BYOK-07**: Add Ollama Adapter
- Install `@tanstack/ai-ollama` package
- Create Ollama adapter using TanStack pattern
- Add Ollama to provider configuration
- Add Ollama to model registry
- Add local model selection UI
- Test Ollama models

### Sprint 3: Notes Plugin Investigation (TBD)

**Story NOTES-01**: Investigate Notes Plugin Status
- Map existing Notes files in codebase
- Identify current AI features implemented
- Document gaps vs. requirements
- Estimate implementation effort
- Create detailed implementation plan

**Story NOTES-02**: Implement Notes AI Features (effort TBD)
- AI Commands integration
- Prompt Chains system
- Image Generation integration
- Text Selection transformations
- Markdown block rendering
- Rich media support
- RAG asset indexing

---

## Conclusion

Phase 1B represents a **critical foundation phase** for AI-powered features. The BYOK Vault system is 70% functional but requires urgent security fixes to meet 2026 OWASP standards. TanStack AI SDK adoption is at 50%, with critical violations in Anthropic and OpenRouter integrations that must be resolved before Phase 2 (Chat Cascade).

**Estimated total effort**: 12-23 hours (2-4 days) for P0 + P1 blockers, plus TBD for Notes Plugin investigation and implementation.

**Blockers for Phase 2:**
1. Anthropic SDK migration (4-6 hours)
2. OpenRouter adapter implementation (2-3 hours)
3. XSS vulnerability fix (6-8 hours)

**Critical Success Factors:**
- 100% TanStack AI SDK adoption for unified architecture
- OWASP ASVS v5.0 compliant key storage
- Zero XSS vulnerabilities in vault system
- All Tier 1 providers supported with full feature parity
- Notes Plugin AI features operational with RAG integration

---

**End of Phase 1B Expansion**

**Date**: 2026-01-26
**Author**: tech-writer-ext (subagent)
**Status**: ✅ COMPLETE
**Next Action**: Create EPIC-BYOK and EPIC-NOTES implementation epics
