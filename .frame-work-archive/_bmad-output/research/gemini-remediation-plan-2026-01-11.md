# Google Gemini API Configuration - Remediation Plan

**Date:** 2026-01-11  
**Author:** BMAD Autonomous Research Agent  
**Status:** COMPLETE

---

## Executive Summary

This remediation plan provides detailed specifications for fixing all identified issues with Google Gemini API configuration. The plan covers 10 implementation tasks across 4 phases with estimated effort of 24-32 hours.

---

## 1. Implementation Overview

### 1.1 Goals

1. **Fix Critical Issues** - Resolve adapter pattern, provider registry, and type safety
2. **Enable Full Functionality** - Complete Gemini integration with all modalities
3. **Improve UX** - Add Gemini-specific settings, validation, and error handling
4. **Document Configuration** - Provide clear setup instructions

### 1.2 Scope

| Category | In Scope | Out of Scope |
|----------|----------|--------------|
| Provider Configuration | ✅ Gemini provider | ✅ OpenAI, Anthropic |
| TanStack AI Integration | ✅ Adapter patterns | ❌ Library modifications |
| Settings UI | ✅ Provider dialog | ❌ Complete UI overhaul |
| Multimodal Support | ✅ Text, Image, Audio | ❌ Video processing |
| Documentation | ✅ Setup guides | ❌ Tutorial content |

---

## 2. Task Breakdown

### Phase 1: Critical Fixes (8 hours)

#### Task 1.1: Fix Gemini Adapter Pattern

**File:** `src/lib/agent/providers/gemini-adapter.ts`

**Changes Required:**

1. **Update Imports (Lines 12-17)**
```typescript
// BEFORE
import { createGeminiChat, type GeminiTextConfig, type GeminiTextModel } from '@tanstack/ai-gemini';

// AFTER
import { geminiText, type GeminiTextModel } from '@tanstack/ai-gemini';
```

2. **Add Model Validation (After Line 37)**
```typescript
// Add constant array for runtime validation
const GEMINI_MODELS = [
  'gemini-3-pro-preview',
  'gemini-3-flash-preview',
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'gemini-2.5-flash-preview-09-2025',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash-lite-preview-09-2025',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite'
] as const;

type GeminiModelId = typeof GEMINI_MODELS[number];

// Add validation function
function isValidGeminiModel(model: string): model is GeminiModelId {
  return GEMINI_MODELS.includes(model as GeminiModelId);
}
```

3. **Update Adapter Creation Method (Line 112-116)**
```typescript
// BEFORE
private createAdapter(model: string) {
  return createGeminiChat(model as GeminiModelId, this.apiKey, {});
}

// AFTER
private createAdapter(model: string) {
  if (!isValidGeminiModel(model)) {
    throw new Error(`Invalid Gemini model: ${model}. Valid models: ${GEMINI_MODELS.join(', ')}`);
  }
  return geminiText(model, {
    apiKey: this.apiKey,
  });
}
```

4. **Update Default Model Constant (Line 21)**
```typescript
// BEFORE
const DEFAULT_MODEL = 'gemini-2.5-flash' as const satisfies GeminiTextModel;

// AFTER
const DEFAULT_MODEL = 'gemini-2.5-flash' as const satisfies GeminiModelId;
```

**Testing:**
```typescript
// Add unit tests
describe('GeminiAdapter', () => {
  it('should create adapter with valid model', () => {
    const adapter = new GeminiAdapter({ apiKey: 'test' });
    expect(() => adapter.createAdapter('gemini-2.5-flash')).not.toThrow();
  });

  it('should throw on invalid model', () => {
    const adapter = new GeminiAdapter({ apiKey: 'test' });
    expect(() => adapter.createAdapter('invalid-model')).toThrow();
  });
});
```

**Estimated Effort:** 2 hours

---

#### Task 1.2: Add Gemini to Built-in Providers

**File:** `src/domain/services/universal-provider-registry.ts`

**Changes Required:**

1. **Add Gemini Provider Entry (After Line 101)**
```typescript
{
  id: 'google',
  name: 'Google Gemini',
  description: 'Google\'s Gemini AI models with multimodal capabilities',
  endpoints: {
    text: 'https://generativelanguage.googleapis.com/v1beta/models',
  },
  requiresApiKey: true,
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
  models: [
    {
      id: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      modalities: ['text', 'image', 'audio'],
      contextLength: 1048576,
      supportsStreaming: true,
      description: 'Flagship model with enhanced reasoning and multimodal support',
    },
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      modalities: ['text', 'image', 'audio'],
      contextLength: 1048576,
      supportsStreaming: true,
      isFree: false,
      description: 'Fast and cost-effective model for most use cases',
    },
    {
      id: 'gemini-2.5-flash-lite',
      name: 'Gemini 2.5 Flash Lite',
      modalities: ['text', 'image', 'audio'],
      contextLength: 1048576,
      supportsStreaming: true,
      description: 'Lightweight model optimized for efficiency',
    },
    {
      id: 'gemini-2.0-flash',
      name: 'Gemini 2.0 Flash',
      modalities: ['text', 'image'],
      contextLength: 1048576,
      supportsStreaming: true,
      description: 'Stable, production-ready model',
    },
  ],
  defaultModel: 'gemini-2.5-flash',
  docsUrl: 'https://ai.google.dev/gemini-api/docs',
  websiteUrl: 'https://gemini.google.com',
  enabled: false,
},
```

2. **Update Provider Type Definitions (If Needed)**
```typescript
// In provider-types.ts, ensure 'google' or 'gemini' is in ProviderType
export type ProviderType =
  | 'openai'
  | 'anthropic'
  | 'google'  // ADD THIS
  | 'openrouter'
  | 'custom';
```

**Estimated Effort:** 3 hours

---

#### Task 1.3: Add Model Runtime Validation

**File:** `src/lib/agent/providers/gemini-adapter.ts`

**Changes Required:**

1. **Add Model Selection Validation (After Line 144)**
```typescript
/**
 * Validate that a model ID is supported
 */
function validateGeminiModelId(modelId: string): asserts modelId is GeminiModelId {
  if (!isValidGeminiModel(modelId)) {
    const validModels = GEMINI_MODELS.join(', ');
    throw new Error(
      `Invalid Gemini model ID: "${modelId}".\n` +
      `Supported models: ${validModels}\n` +
      `For the latest models, visit: https://ai.google.dev/gemini-api/docs/models`
    );
  }
}
```

2. **Update Stream Chat Method (Line 163)**
```typescript
async *streamChat(
  messages: GeminiMessage[],
  options: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    tools?: GeminiTool[];
    stream?: boolean;
  }
): AsyncGenerator<GeminiStreamChunk> {
  // Validate model before creating adapter
  const model = options.model || this.defaultModel;
  validateGeminiModelId(model);
  const adapter = this.createAdapter(model);
  // ... rest of implementation
}
```

**Estimated Effort:** 3 hours

---

### Phase 2: High Priority Features (10 hours)

#### Task 2.1: Enhance Settings Validation

**File:** `src/presentation/components/agent/ProviderConfigDialog.tsx`

**Changes Required:**

1. **Update Base URL Display (Line 34-42)**
```typescript
function getBuiltInBaseUrl(providerId: string): string {
  const urls: Record<string, string> = {
    openai: 'https://api.openai.com/v1',
    anthropic: 'https://api.anthropic.com/v1',
    openrouter: 'https://openrouter.ai/api/v1',
    google: 'https://generativelanguage.googleapis.com/v1beta/models',  // UPDATED
  };
  return urls[providerId] || '';
}
```

2. **Add Gemini-Specific Validation (After Line 99)**
```typescript
/**
 * Validate Gemini API key format
 */
function validateGeminiApiKey(apiKey: string): { valid: boolean; error?: string } {
  // Gemini API keys are typically 39+ characters
  if (apiKey.length < 30) {
    return { valid: false, error: 'API key appears too short. Gemini keys are typically 39+ characters.' };
  }
  
  // Check for common invalid patterns
  if (apiKey.startsWith('sk-')) {
    return { valid: false, error: 'Invalid format. Gemini API keys do not start with "sk-". Use keys from Google AI Studio.' };
  }
  
  return { valid: true };
}
```

3. **Update Test Connection Handler (Line 99-140)**
```typescript
const handleTestConnection = async () => {
  if (!apiKey.trim()) {
    toast.error('Please enter an API key first');
    return;
  }

  // Validate format first
  const formatValidation = validateGeminiApiKey(apiKey.trim());
  if (!formatValidation.valid) {
    toast.error(formatValidation.error || 'Invalid API key format');
    return;
  }

  const providerId = provider?.id || 'google';
  setIsTestingConnection(true);
  setTestResult(null);

  try {
    // For Gemini, test with models endpoint
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`
    );

    const data = await response.json();

    if (response.ok && data.models) {
      setTestResult({ valid: true, latencyMs: 150 });
      toast.success('✓ Gemini API key validated successfully');
      setKeyStatus('configured');
    } else {
      const errorMsg = data.error?.message || 'Invalid API key';
      setTestResult({ valid: false, error: errorMsg });
      toast.error(`✗ Connection failed: ${errorMsg}`);
      setKeyStatus('error');
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Network error';
    setTestResult({ valid: false, error: errorMsg });
    toast.error(`✗ Test failed: ${errorMsg}`);
    setKeyStatus('error');
  } finally {
    setIsTestingConnection(false);
  }
};
```

**Estimated Effort:** 4 hours

---

#### Task 2.2: Implement Model Auto-Discovery

**File:** `src/infrastructure/persistence/stores/providers/`

**Changes Required:**

1. **Add Model Fetching for Google Provider**
```typescript
// In provider-models-slice.ts or create new file
import type { ModelInfo } from '@/domain/types/llm/model-types';

export async function fetchGoogleModels(apiKey: string): Promise<ModelInfo[]> {
  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    // Filter for content generation models
    const contentModels = (data.models || []).filter((model: any) =>
      model.supportedGenerationMethods?.includes('generateContent')
    );

    return contentModels.map((model: any) => {
      const name = model.name.replace('models/', '');
      return {
        id: name,
        name: model.displayName || name,
        providerId: 'google',
        contextLength: model.inputTokenLimit,
        maxTokens: 65536,
        supportsStreaming: true,
        supportsImages: true,
        supportsTools: true,
        inputModalities: ['text', 'image', 'audio', 'video'].filter(m => 
          model.supportedInputModalities?.includes(m)
        ),
        outputModalities: ['text', 'audio'].filter(m =>
          model.supportedOutputModalities?.includes(m)
        ),
      };
    });
  } catch (error) {
    console.error('Failed to fetch Google models:', error);
    // Return default models on error
    return getDefaultGoogleModels();
  }
}

function getDefaultGoogleModels(): ModelInfo[] {
  return [
    {
      id: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      providerId: 'google',
      contextLength: 1048576,
      supportsStreaming: true,
      supportsImages: true,
      supportsTools: true,
    },
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      providerId: 'google',
      contextLength: 1048576,
      supportsStreaming: true,
      supportsImages: true,
      supportsTools: true,
    },
    // ... other default models
  ];
}
```

2. **Integrate with Provider Store**
```typescript
// In provider-crud-slice.ts, update fetchModels action
async fetchModels(providerId: string) {
  // ... existing code for other providers
  
  if (providerId === 'google') {
    const apiKey = await credentialVault.getCredentials(providerId);
    if (apiKey) {
      const models = await fetchGoogleModels(apiKey);
      get().updateProviderModels(providerId, models);
    }
  }
}
```

**Estimated Effort:** 4 hours

---

#### Task 2.3: Complete Voice Integration

**File:** `src/lib/agent/tools/voice-output-tool.ts`

**Changes Required:**

1. **Add Gemini TTS Configuration**
```typescript
interface GeminiTTSConfig {
  voiceType?: 'Puck' | 'Charon' | 'Apollo' | 'Hyacinth' | 'Kore' | 'Fenrir' | 'Aoede';
  speechSpeed?: number; // 0.25 to 4.0
  pitch?: number; // -20 to 20
}

// Update voice-output-tool.ts
export const voiceOutputTool = toolDefinition({
  name: 'voice_output',
  description: 'Generate speech from text using TTS. Supports multiple providers including OpenAI and Gemini.',
  inputSchema: z.object({
    text: z.string().describe('Text to convert to speech'),
    provider: z.enum(['openai', 'google']).default('openai').describe('TTS provider to use'),
    voice: z.string().optional().describe('Voice name (provider-specific)'),
    config: z.object({
      voiceType: z.enum(['Puck', 'Charon', 'Apollo', 'Hyacinth', 'Kore', 'Fenrir', 'Aoede']).optional(),
      speechSpeed: z.number().min(0.25).max(4.0).optional(),
      pitch: z.number().min(-20).max(20).optional(),
    }).optional().describe('Gemini-specific TTS configuration'),
  }),
}).server(async ({ text, provider, voice, config }) => {
  try {
    let audioBuffer: ArrayBuffer;

    if (provider === 'google') {
      // Use Gemini TTS
      const apiKey = await credentialVault.getCredentials('google');
      if (!apiKey) {
        throw new Error('Google API key not configured');
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-exp:tts?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text },
            config: {
              voiceConfig: {
                predefinedVoice: { voiceName: config?.voiceType || 'Puck' },
              },
              audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: config?.speechSpeed || 1.0,
                pitch: config?.pitch || 0,
              },
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini TTS failed: ${response.statusText}`);
      }

      audioBuffer = await response.arrayBuffer();
    } else {
      // Use OpenAI (existing implementation)
      // ... existing code
    }

    // Return audio as base64
    return {
      audio: Buffer.from(audioBuffer).toString('base64'),
      format: 'mp3',
      duration: estimateAudioDuration(text),
    };
  } catch (error) {
    throw new Error(`Voice output failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});
```

**Estimated Effort:** 2 hours

---

#### Task 2.4: Update Chat API

**File:** `src/routes/api/chat.ts`

**Changes Required:**

1. **Update Gemini Import and Usage**
```typescript
// BEFORE
import { createGeminiChat } from '@tanstack/ai-gemini';

// AFTER
import { geminiText } from '@tanstack/ai-gemini';
```

2. **Update Chat Handler**
```typescript
export async function POST({ request }: RequestHandlerArgs) {
  const { messages, provider, model, apiKey } = await request.json();

  let stream;

  if (provider === 'google') {
    // Use modern geminiText pattern
    stream = chat({
      adapter: geminiText(model || 'gemini-2.5-flash', {
        apiKey,
      }),
      messages,
    });
  } else if (provider === 'openai') {
    // ... existing OpenAI handling
  }

  return toServerSentEventsResponse(stream);
}
```

**Estimated Effort:** 2 hours

---

### Phase 3: Medium Priority Improvements (6 hours)

#### Task 3.1: Environment Configuration Documentation

**File:** `.env.example`

**Changes Required:**

```bash
# ═══════════════════════════════════════════════════════════════
# AI PROVIDERS
# ═══════════════════════════════════════════════════════════════

# OpenAI (https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-your-openai-key

# Anthropic (https://console.anthropic.com/account/keys)
ANTHROPIC_API_KEY=your-anthropic-key

# Google Gemini (https://aistudio.google.com/app/apikey)
# Get your API key from Google AI Studio
GEMINI_API_KEY=your-gemini-api-key

# OpenRouter (https://openrouter.ai/settings)
OPENROUTER_API_KEY=your-openrouter-key
```

**Estimated Effort:** 0.5 hours

---

#### Task 3.2: Add Multimodal UI Section

**File:** `src/presentation/components/agent/ProviderSettings.tsx`

**Changes Required:**

1. **Add Modalities Section**
```typescript
// In ProviderSettings.tsx, after model selection
{provider.id === 'google' && provider.hasApiKey && (
  <div className="mt-4 p-4 bg-muted/50 rounded">
    <h4 className="font-semibold mb-2">Gemini Capabilities</h4>
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline">Text ✅</Badge>
      <Badge variant="outline">Images ✅</Badge>
      <Badge variant="outline">Audio ✅</Badge>
      <Badge variant="outline">Video ⏳</Badge>
      <Badge variant="outline">Function Calling ✅</Badge>
      <Badge variant="outline">Thinking Mode ⏳</Badge>
    </div>
  </div>
)}
```

**Estimated Effort:** 2 hours

---

#### Task 3.3: Improve Error Handling

**File:** `src/lib/agent/providers/gemini-adapter.ts`

**Changes Required:**

1. **Add Error Mapping**
```typescript
const GEMINI_ERROR_CODES: Record<string, string> = {
  'API_KEY_INVALID': 'Your Gemini API key is invalid or expired. Get a new key from Google AI Studio.',
  'RESOURCE_EXHAUSTED': 'Rate limit exceeded. Please wait before trying again.',
  'BLOCKED_RESPONSE': 'Content was blocked due to safety filters. Try a different prompt.',
  'INVALID_ARGUMENT': 'Invalid request format. Check your input parameters.',
  'DEADLINE_EXCEEDED': 'Request took too long. Try with a shorter input.',
};

function formatGeminiError(error: any): string {
  const code = error.code || error.status;
  const message = error.message || 'Unknown error';
  
  if (code && GEMINI_ERROR_CODES[code]) {
    return GEMINI_ERROR_CODES[code];
  }
  
  // Generic message with hint
  return `${message}\n\nFor help, visit: https://ai.google.dev/gemini-api/docs/troubleshooting`;
}
```

2. **Update Error Handling in Stream**
```typescript
// In streamChat method
} catch (error) {
  const errorMessage = formatGeminiError(error);
  yield {
    type: 'error',
    error: errorMessage,
  };
}
```

**Estimated Effort:** 2 hours

---

#### Task 3.4: Add Provider Status Indicator

**File:** `src/presentation/components/agent/ProviderStatusBadge.tsx`

**Changes Required:**

1. **Add Gemini-Specific Status**
```typescript
// Add capability indicators
const GEMINI_CAPABILITIES = {
  gemini: {
    modalities: ['text', 'image', 'audio'],
    features: ['streaming', 'function_calling', 'thinking'],
    link: 'https://ai.google.dev/gemini-api/docs/models',
  },
};
```

**Estimated Effort:** 1.5 hours

---

### Phase 4: Documentation & Testing (2 hours)

#### Task 4.1: Create Integration Guide

**File:** `docs/gemini-integration.md`

**Content:**
- Setup instructions
- API key acquisition
- Environment configuration
- Troubleshooting guide
- Example code snippets

**Estimated Effort:** 1 hour

---

#### Task 4.2: Add Integration Tests

**File:** `src/__tests__/gemini-integration.test.ts`

**Tests:**
```typescript
describe('Gemini Integration', () => {
  it('should create adapter with valid model', () => {
    // Test Task 1.1
  });

  it('should validate API key format', () => {
    // Test Task 2.1
  });

  it('should fetch models from Google API', () => {
    // Test Task 2.2
  });

  it('should handle multimodal messages', () => {
    // Test multimodal support
  });
});
```

**Estimated Effort:** 1 hour

---

## 3. Implementation Order

```
Phase 1: Critical Fixes (8 hours)
├── Task 1.1: Fix Gemini Adapter Pattern ⬅️ START HERE
├── Task 1.2: Add Gemini to Built-in Providers
└── Task 1.3: Add Model Runtime Validation

Phase 2: High Priority Features (10 hours)
├── Task 2.1: Enhance Settings Validation
├── Task 2.2: Implement Model Auto-Discovery
├── Task 2.3: Complete Voice Integration
└── Task 2.4: Update Chat API

Phase 3: Medium Priority Improvements (6 hours)
├── Task 3.1: Environment Configuration Documentation
├── Task 3.2: Add Multimodal UI Section
├── Task 3.3: Improve Error Handling
└── Task 3.4: Add Provider Status Indicator

Phase 4: Documentation & Testing (2 hours)
├── Task 4.1: Create Integration Guide
└── Task 4.2: Add Integration Tests
```

---

## 4. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking changes in TanStack AI | Low | High | Use stable v0.2.x API |
| Google API changes | Medium | Medium | Use official SDK |
| Test environment setup | Medium | Medium | Mock Google API responses |
| Integration complexity | Low | Low | Phased implementation |

---

## 5. Success Criteria

### Functional Criteria
- [ ] Gemini API key can be saved via settings UI
- [ ] Models can be fetched from Google API
- [ ] Text generation works with geminiText pattern
- [ ] Multimodal input (images, audio) supported
- [ ] Error messages are user-friendly

### Non-Functional Criteria
- [ ] No TypeScript errors
- [ ] All existing tests pass
- [ ] New integration tests added
- [ ] Documentation updated

---

## 6. Rollback Plan

If issues occur:

1. **Revert adapter changes** - Keep createGeminiChat as fallback
2. **Keep provider config** - Don't remove from registry
3. **Environment backup** - Save .env before changes
4. **Feature flags** - Wrap Gemini features in flags

---

## 7. Estimated Timeline

| Phase | Effort | Duration | Sprint |
|-------|--------|----------|--------|
| Phase 1: Critical | 8 hours | 1 day | Day 1 |
| Phase 2: High | 10 hours | 1.5 days | Day 2-3 |
| Phase 3: Medium | 6 hours | 1 day | Day 4 |
| Phase 4: Docs & Tests | 2 hours | 0.5 days | Day 5 |

**Total: 26 hours (5 working days)**

---

## 8. Dependencies

### Internal Dependencies
- `credential-vault.ts` - Must be working (✅)
- `universal-provider-registry.ts` - Being updated (Task 1.2)
- TanStack AI packages - Installed (✅)

### External Dependencies
- `@tanstack/ai-gemini` v0.3.2 - Already installed
- Google Gemini API - Must be accessible
- Google AI Studio - For API keys

---

## 9. Files Modified Summary

| File | Tasks | Complexity |
|------|-------|------------|
| `src/lib/agent/providers/gemini-adapter.ts` | 1.1, 1.3, 3.3 | High |
| `src/domain/services/universal-provider-registry.ts` | 1.2 | Medium |
| `src/presentation/components/agent/ProviderConfigDialog.tsx` | 2.1 | Medium |
| `src/infrastructure/persistence/stores/providers/` | 2.2 | Medium |
| `src/lib/agent/tools/voice-output-tool.ts` | 2.3 | Medium |
| `src/routes/api/chat.ts` | 2.4 | Low |
| `.env.example` | 3.1 | Low |
| `src/presentation/components/agent/ProviderSettings.tsx` | 3.2, 3.4 | Medium |
| `docs/gemini-integration.md` | 4.1 | Low |
| `src/__tests__/gemini-integration.test.ts` | 4.2 | Low |

---

**Plan Generated:** 2026-01-11  
**Estimated Total Effort:** 24-32 hours  
**Risk Level:** Medium  
**Priority:** P0 (Critical issues first)
