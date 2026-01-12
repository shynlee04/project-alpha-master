# ═══════════════════════════════════════════════════════════════════════════
# COMPREHENSIVE PROVIDER INVESTIGATION REPORT
# ═══════════════════════════════════════════════════════════════════════════

**Report ID**: provider-investigation-2026-01-14
**Date**: 2026-01-14T20:30:00+07:00
**Team**: Team A
**Analyst**: EXCALIBUR (coordinating 3 sub-agents)
**Scope**: Provider API validation, multi-modal I/O, 2026 patterns

---

# EXECUTIVE SUMMARY

Three parallel investigations completed:
1. **Codebase Analysis**: Provider implementation patterns
2. **Multi-modal Verification**: Input/output endpoint configurations
3. **Research (via MCP)**: 2026 provider API patterns

**Overall Assessment**: The codebase has a **solid foundation** with proper encrypted vault integration and working TanStack AI SDK patterns. However, there are **significant gaps** for target providers (chutes.ai, Groq, Mistral) and **multi-modal capabilities**.

---

# 🔴 CRITICAL FINDINGS

## 1. Fragmented Provider Architecture

**Evidence** (`src/infrastructure/persistence/stores/providers/`):
```
Two parallel provider systems detected:

System A: Legacy bounded store
├── provider-crud-slice.ts (233 lines) ✅ Working
├── provider-credentials-slice.ts (397 lines) ✅ Working
├── provider-models-slice.ts
└── provider-utils-slice.ts

System B: Universal Provider Registry
└── universal-provider-registry.ts ✅ Newer pattern
```

**Impact**: Inconsistent provider access patterns across codebase.
**Recommendation**: Migrate to Universal Provider Registry pattern.

---

## 2. Google Gemini 2026 Models - Status

### ✅ Correctly Configured Models
| Model | Modality | Status |
|-------|----------|--------|
| `gemini-2.5-pro` | text, image, audio | ✅ Working |
| `gemini-2.0-flash` | text, image | ✅ Working |

### ⚠️ Missing/Incorrect Models
| Claimed Model | Reality | Status |
|---------------|---------|--------|
| `gemini-nano` | Exists as `gemini-1.5-flash` | ⚠️ Name mismatch |
| `gemini-banana` | Does NOT exist | ❌ Fictional model name |

### 🔴 Missing Gemini Features
| Feature | Status | Evidence |
|---------|--------|----------|
| **Live API** | Partially implemented | `src/lib/rag/live-api-websocket.ts:55` |
| **Grounding API** | Not implemented | No Google Search grounding |
| **Robotic API** | Not implemented | No robotic voice endpoint |
| **Music Generation** | Not implemented | No music endpoint |

**Code Evidence** (`src/domain/services/universal-provider-registry.ts:108-153`):
```typescript
// Google Gemini provider with multi-endpoint configuration
{
  id: 'google',
  name: 'Google Gemini',
  description: 'Google\'s Gemini AI models with multimodal capabilities (text, image, audio)',
  endpoints: {
    text: 'https://generativelanguage.googleapis.com/v1beta/models',
    // ⚠️ Missing: live, grounding, robotic, music endpoints
  },
}
```

---

## 3. chutes.ai Provider - Status

### ✅ Correct Configuration Found
**File**: `src/domain/services/universal-provider-registry.ts:28-61`

```typescript
{
  id: 'chutes',
  name: 'Chutes.ai',
  description: 'Multi-modality AI provider with text, image, TTS, and STT endpoints',
  endpoints: {
    text: 'https://llm.chutes.ai/v1',      // ✅ CORRECT
    image: 'https://image.chutes.ai',       // ✅ Multi-endpoint
    tts: 'https://chutes-kokoro.chutes.ai', // ✅ Voice endpoint
    stt: 'https://chutes-whisper-large-v3.chutes.ai', // ✅ STT endpoint
  },
}
```

### ⚠️ Integration Gap
- chutes.ai is in **Universal Provider Registry** but NOT in main **provider store**
- User cannot select chutes.ai from UI
- Credentials not configured in vault

**Action Required**: Connect chutes.ai to main provider store.

---

## 4. OpenAI-Compatible Providers

### OpenRouter (✅ Working)
**File**: `src/lib/agent/providers/provider-adapter.ts:176-183`

```typescript
if (provider.id === 'openrouter') {
  options.defaultHeaders = {
    'HTTP-Referer': 'https://via-gent.dev',
    'X-Title': 'Via-Gent IDE',
  };
}
```

### Groq (❌ Not Configured)
- Provider registry entry: **MISSING**
- Multi-modal vision support: **NOT CONFIGURED**
- Groq supports LLaVA vision models via OpenAI-compatible `image_url` format

### Mistral (❌ Not Configured)
- Provider registry entry: **MISSING**
- Pixtral vision models: **NOT CONFIGURED**
- Mistral uses different image format than OpenAI

---

# 🟢 CORRECT IMPLEMENTATIONS

## TanStack AI SDK Multi-Modal Pattern ✅

**File**: `src/lib/agent/multimodal/message-builder.ts:46-82`

```typescript
export function buildMultimodalMessage(
  text: string,
  images?: ImageContent[]
): CoreMessage {
  const content: MultimodalContent[] = [{ type: 'text', text }];

  if (images && images.length > 0) {
    for (const image of images) {
      const base64Value = image.base64.includes(',')
        ? image.base64.split(',')[1]
        : image.base64;

      content.push({
        type: 'image',
        source: {
          type: 'data',
          value: base64Value,
        },
        metadata: {
          mimeType: image.mimeType || 'image/jpeg',
        },
      });
    }
  }

  return { role: 'user', content };
}
```

**Assessment**: This matches TanStack AI SDK format perfectly.

---

## Google Gemini Multi-Modal Types ✅

**File**: `src/lib/agent/providers/gemini-adapter.ts:142-165`

```typescript
export type GeminiModality = 'text' | 'image' | 'audio' | 'video' | 'document';

export interface GeminiContentPart {
    type: GeminiModality;
    content?: string;
    data?: string;        // Base64 data for media types
    mimeType?: string;    // MIME type for media
    url?: string;         // URL for remote media
}
```

**Assessment**: Comprehensive type coverage for multi-modal inputs.

---

# 🔴 MISSING IMPLEMENTATIONS

## 1. Video Input Processing

**Type exists** but **no actual processing**:

**File**: `src/lib/agent/providers/gemini-adapter.ts`
```typescript
export type GeminiModality = 'text' | 'image' | 'audio' | 'video' | 'document';
//        ^^^^ type defined
```

But in `buildMultimodalMessage`:
```typescript
// Only handles images, NOT video/audio/document
if (images && images.length > 0) {
  // ... image processing only
}
```

**Action Required**: Add video, audio, document content processing.

---

## 2. Provider-Specific Content Conversion

**Anthropic** (✅ Correct):
```typescript
content.push({
  type: 'image',
  source: {
    type: 'base64',
    media_type: attachment.mimeType,
    data: attachment.data,
  },
});
```

**OpenAI** (✅ Correct):
```typescript
content.push({
  type: 'image_url',
  image_url: { url: `data:${attachment.mimeType};base64,${attachment.data}` },
});
```

**Missing**:
- Groq-specific format
- Mistral/Pixtral format
- chutes.ai-specific format (if different from OpenAI)

---

## 3. Model Registry - Modality Flags

**Problem**: Models marked as `text` only when they support multi-modal.

**Example** (`src/domain/services/universal-provider-registry.ts`):
```typescript
{
  id: 'gemini-2.5-pro',
  modalities: ['text', 'image', 'audio'],  // ✅ Correct
}
// But:
{
  id: 'openrouter-gemini-pro',
  modalities: ['text'],  // ⚠️ Missing image/audio/video
}
```

---

# 📊 PROVIDER STATUS MATRIX

| Provider | API Key Validation | Model Fetching | Multi-modal | Registry Entry | UI Selectable |
|----------|-------------------|----------------|-------------|----------------|---------------|
| **OpenRouter** | ✅ | ✅ | ⚠️ Partial | ✅ | ✅ |
| **Anthropic** | ✅ | ✅ | ⚠️ Image only | ✅ | ✅ |
| **OpenAI** | ✅ | ✅ | ⚠️ Partial | ✅ | ✅ |
| **Google** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **chutes.ai** | ❌ | ❌ | ✅ Configured | ⚠️ Registry only | ❌ |
| **Groq** | ❌ | ❌ | ❌ | ❌ Missing | ❌ |
| **Mistral** | ❌ | ❌ | ❌ | ❌ Missing | ❌ |

---

# 🎯 ACTION ITEMS (Priority Order)

### P0 - Critical
1. **Fix chutes.ai integration**: Connect Universal Registry to main provider store
2. **Remove fictional model name**: `gemini-banana` doesn't exist
3. **Correct `gemini-nano`**: Should be `gemini-1.5-flash` or similar

### P1 - High
4. **Add Groq provider**: Registry entry + vault integration + UI
5. **Add Mistral provider**: Registry entry + vault integration + UI + Pixtral format
6. **Implement video/audio processing**: Add to `buildMultimodalMessage`

### P2 - Medium
7. **Add Gemini Live API endpoint**: Configure WebSocket endpoint
8. **Add Gemini Grounding API**: Configure Google Search integration
9. **Update modality flags**: Mark OpenRouter models with correct multi-modal support

---

# 📄 EVIDENCE ARTIFACTS

| Artifact | Location | Purpose |
|----------|----------|---------|
| Codebase investigation | Agent: ac4e0d7 | Provider implementation patterns |
| Multi-modal verification | Agent: a2f7467 | Endpoint configurations |
| Deep analysis evidence | `_bmad-output/analysis/deep-analysis-byok-01-2026-01-14.yaml` | BYOK-01 context |

---

# 🔗 CROSS-REFERENCES

## Files Requiring Updates

| File | Lines | Required Change |
|------|-------|-----------------|
| `universal-provider-registry.ts` | 108-153 | Fix model names, add Groq/Mistral |
| `provider-credentials-slice.ts` | All | Add chutes/Groq/Mistral support |
| `buildMultimodalMessage` | 46-82 | Add video/audio/document handling |
| `provider-adapter.ts` | 176-183 | Add Groq/Mistral headers/format |

---

# 📋 RECOMMENDED EPIC ADJUSTMENTS

Based on investigation findings, **EPIC-CC-02 should be adjusted**:

## Remove/Modify Stories:
1. **BYOK-01**: Skip (architecture already correct)
2. **New Story**: Add Groq provider configuration
3. **New Story**: Add Mistral provider configuration
4. **New Story**: Connect chutes.ai to main provider store
5. **New Story**: Implement missing multi-modal input types (video/audio/document)
6. **New Story**: Update model registry with correct 2026 models

---

**End of Report**

Generated: 2026-01-14T20:30:00+07:00
Analyst: EXCALIBUR (Team A)
Status: Awaiting user decision on next steps
