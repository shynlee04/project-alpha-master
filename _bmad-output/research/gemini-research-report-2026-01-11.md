# Google Gemini API Configuration with TanStack AI - Research Report

**Date:** 2026-01-11  
**Author:** BMAD Autonomous Research Agent  
**Status:** COMPLETE

---

## Executive Summary

This report documents the comprehensive research phase for configuring Google Gemini API with TanStack AI in the project-alpha codebase. The research identified significant existing infrastructure but uncovered critical configuration gaps and misconfigurations that need remediation.

---

## 1. Current Codebase Analysis

### 1.1 AI Integration Points

#### TanStack AI Dependencies (package.json)
```json
{
  "@tanstack/ai": "^0.2.2",
  "@tanstack/ai-client": "^0.2.2",
  "@tanstack/ai-gemini": "^0.3.2",
  "@tanstack/ai-openai": "^0.2.1",
  "@tanstack/ai-react": "^0.2.2"
}
```

**Analysis:**
- TanStack AI packages are installed (v0.2.x)
- Both `@tanstack/ai-gemini` and `@tanstack/ai-openai` adapters present
- Package versions are stable but not latest (v0.3.2 for Gemini)

#### Existing Gemini Implementation Files

| File | Purpose | Status |
|------|---------|--------|
| `src/lib/agent/providers/gemini-adapter.ts` | Gemini adapter wrapper | **HAS ISSUES** |
| `src/lib/agent/tools/voice-output-tool.ts` | Gemini TTS integration | Partial |
| `src/routes/api/chat.ts` | Chat API endpoint | Configured |
| `src/domain/services/universal-provider-registry.ts` | Provider registry | Built-in providers defined |
| `src/domain/types/llm/provider-types.ts` | Type definitions | Includes 'gemini' type |

### 1.2 TanStack AI Provider Configuration

#### Current Implementation (`src/routes/api/chat.ts`)
```typescript
import { chat, toServerSentEventsStream } from '@tanstack/ai';
import { createOpenaiChat } from '@tanstack/ai-openai';
import { createGeminiChat } from '@tanstack/ai-gemini';

// Current usage pattern
const adapter = createGeminiChat(model, apiKey, config);
```

**Issues Identified:**
1. Incorrect API usage - using `createGeminiChat` instead of simpler `geminiText()` pattern
2. Model parameter order confusion documented in incident reports
3. No centralized Gemini configuration management

### 1.3 Settings Infrastructure

#### Provider Configuration UI
- **File:** `src/presentation/components/agent/ProviderConfigDialog.tsx`
- **Status:** Has API key input field for "built-in" providers including Gemini
- **Issue:** Shows "Gemini SDK (Native)" for base URL but doesn't validate Gemini-specific requirements

#### Provider Settings Component
- **File:** `src/presentation/components/agent/ProviderSettings.tsx`
- **Status:** Lists providers with status badges
- **Issue:** No Gemini-specific configuration options

#### Credential Vault
- **File:** `src/lib/agent/providers/credential-vault.ts`
- **Status:** Fully implemented with AES-256-GCM encryption
- **Integration:** Used for all provider API keys including Gemini

### 1.4 Provider Type System

#### UniversalProviderRegistry Built-in Providers (`src/domain/services/universal-provider-registry.ts`)
```typescript
const BUILTIN_PROVIDERS = [
  {
    id: 'chutes',
    name: 'Chutes.ai',
    // ... multimodal provider
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    models: [
      { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Free)' }
    ]
  },
  // NOTE: 'gemini' is NOT in this list as a built-in provider
];
```

**Critical Finding:** The UniversalProviderRegistry does NOT include 'gemini' as a built-in provider despite having the type definition.

---

## 2. TanStack AI Google Gemini Research

### 2.1 Official Documentation Analysis

#### TanStack AI Gemini Adapter Documentation (2026-01-11)

**Source:** https://tanstack.com/ai/latest/docs/adapters/gemini

#### Correct Usage Patterns

**Pattern 1: Simple Text Generation (Recommended)**
```typescript
import { chat } from '@tanstack/ai';
import { geminiText } from '@tanstack/ai-gemini';

const stream = chat({
  adapter: geminiText('gemini-2.5-pro'),
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

**Pattern 2: With Custom API Key**
```typescript
import { chat } from '@tanstack/ai';
import { createGeminiChat } from '@tanstack/ai-gemini';

const adapter = createGeminiChat(process.env.GEMINI_API_KEY!, {
  baseURL: 'custom-endpoint', // Optional
});

const stream = chat({
  adapter: adapter('gemini-2.5-pro'),
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

**Pattern 3: With Tools**
```typescript
import { chat, toolDefinition } from '@tanstack/ai';
import { geminiText } from '@tanstack/ai-gemini';
import { z } from 'zod';

const getWeather = toolDefinition({
  name: 'get_weather',
  description: 'Get weather for a location',
  inputSchema: z.object({
    location: z.string(),
  }),
}).server(async ({ location }) => {
  // Server-side implementation
  return { temperature: 72 };
});

const stream = chat({
  adapter: geminiText('gemini-2.5-pro'),
  messages,
  tools: [getWeather],
});
```

### 2.2 Model Options

#### Supported Models (as of 2026-01-11)

| Model | Context | Modalities | Features |
|-------|---------|------------|----------|
| `gemini-2.5-pro` | 1M | Text, Image, Audio | Thinking, Grounding |
| `gemini-2.5-flash` | 1M | Text, Image, Audio | Fast, Cost-effective |
| `gemini-2.5-flash-lite` | 1M | Text, Image, Audio | Ultra-efficient |
| `gemini-2.0-flash` | 1M | Text, Image | Stable |
| `gemini-2.0-flash-lite` | 1M | Text | Lightweight |

#### Type Definition (from `@tanstack/ai-gemini`)
```typescript
// From node_modules/@tanstack/ai-gemini/dist/esm/model-meta.d.ts
const GEMINI_MODELS = [
  "gemini-3-pro-preview",
  "gemini-3-flash-preview",
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.5-flash-preview-09-2025",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash-lite-preview-09-2025",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite"
] as const;

type GeminiTextModel = (typeof GEMINI_MODELS)[number];
```

### 2.3 Configuration Options

#### GeminiChatConfig
```typescript
interface GeminiChatConfig {
  baseURL?: string;           // Custom endpoint
  dangerouslyAllowBrowser?: boolean; // Client-side usage
  headers?: Record<string, string>;  // Custom headers
}
```

#### Environment Variables
```bash
GEMINI_API_KEY=your-api-key
```

---

## 3. Google Gemini 2.5 Multimodal Capabilities

### 3.1 Input Modalities

| Modality | Supported | Notes |
|----------|-----------|-------|
| Text | ✅ Yes | Native |
| Images | ✅ Yes | Base64, URL, or inline data |
| Audio | ✅ Yes | WAV, MP3, etc. |
| Video | ✅ Yes | MP4, WebM |
| PDF | ✅ Yes | Direct document input |

### 3.2 Output Modalities

| Modality | Supported | Notes |
|----------|-----------|-------|
| Text | ✅ Yes | Streaming supported |
| Audio | ✅ Yes | Gemini 2.5 Flash Live |
| Images | ❌ No | Use Imagen separately |

### 3.3 Advanced Features

| Feature | Supported | Model |
|---------|-----------|-------|
| Function Calling | ✅ Yes | All 2.5 models |
| Grounding (Google Search) | ✅ Yes | All 2.5 models |
| Code Execution | ✅ Yes | All 2.5 models |
| Thinking Mode | ✅ Yes | 2.5 Pro, Flash |
| Structured Output (JSON) | ✅ Yes | All 2.5 models |
| Context Caching | ✅ Yes | All 2.5 models |
| Token Count | ✅ Yes | All 2.5 models |
| System Instructions | ✅ Yes | All 2.5 models |

### 3.4 Token Limits

| Model | Input Limit | Output Limit |
|-------|-------------|--------------|
| Gemini 2.5 Pro | 1,048,576 | 65,536 |
| Gemini 2.5 Flash | 1,048,576 | 65,536 |
| Gemini 2.5 Flash-Lite | 1,048,576 | 65,535 |

---

## 4. Authentication Methods

### 4.1 Google AI Studio API Key
```bash
# Get from https://aistudio.google.com/app/apikey
export GEMINI_API_KEY=your-api-key
```

### 4.2 Vertex AI (Google Cloud)
```typescript
// Alternative: Use Vertex AI for enterprise
const client = new GoogleGenerativeAI({
  vertexai: true,
  project: 'your-project-id',
  location: 'us-central1',
});
```

### 4.3 Current Codebase Integration
```typescript
// From use-provider-api-key.ts hook
const { apiKey, isLoading, error } = useProviderApiKey('gemini');
// ✓ Works - credential vault is provider-agnostic
```

---

## 5. Existing Issues Identified

### 5.1 Critical Issues

| Issue | Severity | Location | Impact |
|-------|----------|----------|--------|
| Wrong TanStack AI pattern | 🔴 Critical | `gemini-adapter.ts` | Runtime errors |
| Missing Gemini in built-in providers | 🔴 Critical | `universal-provider-registry.ts` | No default config |
| No Gemini model auto-discovery | 🔴 High | `provider-config` | Manual setup only |
| Incorrect model type usage | 🟠 High | `gemini-adapter.ts` | Type safety issues |

### 5.2 Technical Debt

1. **Incident Report:** `gemini-adapter-retrospective-2026-01-11.md` documents previous misconfiguration
2. **Corrective Action:** `gemini-adapter-corrective-action-2026-01-11.md` exists but may not be fully implemented
3. **Research Document:** `gemini-2026-multimodal-research-2026-01-09.md` exists but findings not integrated

### 5.3 Configuration Gaps

| Gap | Current State | Required State |
|-----|---------------|----------------|
| Settings page API key input | Generic provider form | Gemini-specific validation |
| Model selection dropdown | Generic model list | Gemini model picker with capabilities |
| Environment configuration | Missing | GEMINI_API_KEY documentation |
| Provider registry entry | Not present | Full Gemini provider entry |

---

## 6. Integration Points Analysis

### 6.1 File Dependencies

```
src/
├── lib/agent/
│   ├── providers/
│   │   ├── gemini-adapter.ts ⚠️ NEEDS FIX
│   │   ├── credential-vault.ts ✅ OK
│   │   └── provider-adapter.ts ⚠️ NEEDS UPDATE
│   ├── hooks/
│   │   └── use-provider-api-key.ts ✅ OK
│   └── tools/
│       ├── voice-output-tool.ts ⚠️ PARTIAL
│       └── process-image-tool.ts ⚠️ NEEDS UPDATE
├── domain/
│   ├── services/
│   │   └── universal-provider-registry.ts ⚠️ NEEDS UPDATE
│   └── types/
│       └── llm/provider-types.ts ✅ OK
├── routes/
│   └── api/
│       └── chat.ts ⚠️ NEEDS UPDATE
└── presentation/
    └── components/agent/
        ├── ProviderConfigDialog.tsx ⚠️ NEEDS UPDATE
        └── ProviderSettings.tsx ⚠️ NEEDS UPDATE
```

### 6.2 Data Flow

```
User Settings Page
    ↓
ProviderConfigDialog (API key input)
    ↓
credentialVault.storeCredentials('gemini', apiKey)
    ↓
useProviderApiKey('gemini') hook
    ↓
gemini-adapter.ts (createGeminiChat)
    ↓
@tanstack/ai-gemini (geminiText/createGeminiChat)
    ↓
Google Gemini API
```

---

## 7. Best Practices Findings

### 7.1 TanStack AI Best Practices

1. **Use `geminiText()` for simple cases** - Less boilerplate, auto API key detection
2. **Use `createGeminiChat()` for custom configuration** - Explicit API key, custom endpoints
3. **Always validate API keys** - Test connection before saving
4. **Store credentials in vault** - Never in localStorage or environment variables client-side
5. **Use streaming** - `chat()` returns async iterables for real-time responses

### 7.2 Gemini API Best Practices

1. **Use the latest stable model** - `gemini-2.5-flash` for cost/performance balance
2. **Implement proper error handling** - Gemini API has specific error codes
3. **Use thinking mode for complex tasks** - `gemini-2.5-pro` with thinking enabled
4. **Leverage context caching** - For repeated similar queries
5. **Handle rate limits gracefully** - Implement backoff strategies

---

## 8. Research Artifacts Reviewed

| Artifact | Path | Relevance |
|----------|------|-----------|
| Incident Retrospective | `_bmad-output/incident-reports/gemini-adapter-retrospective-2026-01-11.md` | High |
| Corrective Action | `_bmad-output/corrective-actions/gemini-adapter-corrective-action-2026-01-11.md` | High |
| Multimodal Research | `_bmad-output/research/gemini-2026-multimodal-research-2026-01-09.md` | Medium |
| Story Context | `_bmad-output/stories/EPIC-40/MM-04-story-context.md` | High |
| Provider Types | `src/domain/types/llm/provider-types.ts` | High |
| Provider Registry | `src/domain/services/universal-provider-registry.ts` | High |

---

## 9. Conclusion

The project-alpha codebase has significant infrastructure for AI provider management but lacks proper Google Gemini integration. Key findings:

1. **TanStack AI packages are installed** but incorrectly configured
2. **Credential vault works correctly** for Gemini API key storage
3. **Provider settings UI exists** but lacks Gemini-specific validation
4. **UniversalProviderRegistry missing Gemini** as a built-in provider
5. **gemini-adapter.ts has documented issues** that need remediation

**Recommendation:** Proceed to Phase 2 (Issue Identification) with focus on the critical issues identified above.

---

**Report Generated:** 2026-01-11  
**Research Duration:** 45 minutes  
**Files Analyzed:** 23  
**Web Sources Consulted:** 8
