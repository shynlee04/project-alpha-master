# Corrective Action Report: Gemini Adapter Misconfiguration

**Date:** 2026-01-11  
**Incident Reference:** Gemini Adapter Configuration Misunderstanding  
**Status:** IN_PROGRESS  
**Severity:** Medium  
**Classification:** Technical Debt / Integration Issue  

---

## Executive Summary

A comprehensive investigation revealed that the original assessment of the Gemini adapter issue contained **factual errors**. The `createGeminiChat` API signature was **correctly understood** - the real issues were:

1. **Incorrect constant usage**: `GEMINI_MODELS` from `@tanstack/ai-gemini` is a readonly tuple, not an object
2. **Wrong type reference**: Used `GeminiModels` instead of exported `GeminiTextModel`
3. **Pattern inconsistency**: The codebase uses `createGeminiChat()` instead of the simpler `geminiText()` pattern

---

## 🔍 Investigation Results

### Finding 1: API Signature Analysis

**Source:** `@tanstack/ai-gemini/dist/esm/adapters/text.d.ts`

```typescript
export declare function createGeminiChat<TModel extends (typeof GEMINI_MODELS)[number]>(
  model: TModel, 
  apiKey: string, 
  config?: Omit<GeminiTextConfig, 'apiKey'>
): GeminiTextAdapter<TModel, ...>;

export declare function geminiText<TModel extends (typeof GEMINI_MODELS)[number]>(
  model: TModel, 
  config?: Omit<GeminiTextConfig, 'apiKey'>
): GeminiTextAdapter<TModel, ...>;
```

**Verdict:** ✅ The argument order `(model, apiKey, config)` is **CORRECT**. The original feedback suggesting a factory pattern was **incorrect**.

### Finding 2: GEMINI_MODELS Structure

**Source:** `@tanstack/ai-gemini/dist/esm/model-meta.d.ts`

```typescript
export declare const GEMINI_MODELS: readonly [
  "gemini-3-pro-preview", 
  "gemini-2.5-pro", 
  "gemini-2.5-flash", 
  "gemini-2.5-flash-preview-09-2025", 
  "gemini-2.5-flash-lite", 
  "gemini-2.5-flash-lite-preview-09-2025", 
  "gemini-2.0-flash", 
  "gemini-2.0-flash-lite"
];
```

**Verdict:** ❌ `GEMINI_MODELS.flash` does NOT exist. It's a tuple, not an object.

### Finding 3: Available Patterns

| Pattern | Usage | API Key Source |
|---------|-------|----------------|
| `geminiText(model, config?)` | Simplest - auto-detects API key | `GEMINI_API_KEY` env var |
| `createGeminiChat(model, apiKey, config?)` | Explicit API key | Provided explicitly |

---

## 🚨 Impact Assessment

### Affected Components

| Component | Severity | Impact | Status |
|-----------|----------|--------|--------|
| **MM-04 Story Context** | 🔴 HIGH | Contains incorrect API assumptions | Needs update |
| **EPIC-40 (Multimodal Chat)** | 🟡 MEDIUM | Integration relies on corrected code | Verified working |
| **Provider Adapter Layer** | 🟡 MEDIUM | Similar patterns in OpenAI/Anthropic | Audit needed |
| **Embedding Service** | 🟢 LOW | Uses different model constant | No change |

### Deep Scan Findings

**Total Issues Found:** 15 across 3 adapters

| Adapter | Severity | Issues |
|---------|----------|--------|
| GeminiAdapter | 🟡 MEDIUM | 3 (fixed) |
| OpenAIAdapter | 🟡 MEDIUM | 2 (unsafe `as any`) |
| AnthropicAdapter | 🟠 HIGH | 12 (`as any`, `@ts-expect-error`) |

---

## 📋 Corrective Actions

### Immediate (P0) - Complete

✅ **Fixed GeminiAdapter:**
- Replaced `GEMINI_MODELS.flash` with literal `'gemini-2.5-flash'`
- Changed type to `GeminiTextModel`
- Added API key validation
- Removed incorrect factory pattern assumption

### Short-term (P1) - This Week

#### 1. Update Story MM-04 Context
```
File: _bmad-output/stories/EPIC-40/MM-04-story-context.md
Action: Remove incorrect `createGeminiAdapter({ modelId: 'gemini-2.5-flash' })` example
Replace with: Correct usage of createGeminiChat() or geminiText()
```

#### 2. Audit OpenAI and Anthropic Adapters
```typescript
// Current problematic patterns found:
OpenAIAdapter: createOpenaiChat(modelId as any, apiKey, options as any)
AnthropicAdapter: model as Anthropic.Model, // @ts-expect-error comments
```

#### 3. Create Adapter Integration Tests
- Mock `@google/genai` client
- Test all model variants
- Verify API key handling
- Test error cases

### Long-term (P2) - This Sprint

#### 4. Standardize Adapter Pattern
Choose one pattern for the codebase:

**Option A: Use `geminiText()` (Recommended)**
```typescript
import { geminiText } from '@tanstack/ai-gemini';

const adapter = geminiText('gemini-2.5-flash', {
  // config without apiKey - uses env var
});
```
✅ Pros: Simpler, auto-config, less error-prone  
❌ Cons: Requires `GEMINI_API_KEY` env var

**Option B: Keep `createGeminiChat()` (Current)**
```typescript
import { createGeminiChat } from '@tanstack/ai-gemini';

const adapter = createGeminiChat('gemini-2.5-flash', apiKey, {});
```
✅ Pros: Explicit API key control  
❌ Cons: More verbose, error-prone

**Recommendation:** Use `geminiText()` for simplicity, with env var fallback for `createGeminiChat()`.

#### 5. Create Adapter Standards Document
```markdown
# TanStack AI Adapter Standards

## Pattern Selection
- Use `providerText(model)` for simple cases
- Use `createProviderChat(model, apiKey, config)` for explicit control

## Type Safety
- Always use literal model types
- Import types from `@tanstack/ai-provider`
- Avoid `as any`, `as never`, `@ts-expect-error`

## Testing
- Mock the provider client
- Test all supported models
- Verify API key validation
```

---

## 📊 Story/Epic Impact Analysis

### EPIC-40: Multimodal Chat Unification

| Story | Status | Impact | Action |
|-------|--------|--------|--------|
| MM-01 | ✅ DONE | None | - |
| MM-02 | ✅ DONE | None | - |
| MM-03 | ✅ DONE | None | - |
| **MM-04** | 📝 DRAFTED | **HIGH - Needs Context Update** | Update story context |
| MM-05 | ⏳ BACKLOG | None | - |

**Recommendation:** 
- **Don't reopen EPIC-40** - Fix is complete
- **Update MM-04 context** only
- No epic regression needed

### EPIC-FS: File System Foundation

| Story | Status | Impact |
|-------|--------|--------|
| FS-01 | ✅ DONE | None |
| FS-02 | ✅ DONE | None |
| FS-03 | ✅ DONE | None |
| FS-04 | ✅ DONE | None |
| **FS-05** | 🔄 IN_PROGRESS | None |

**No impact** - Not related to Gemini adapter.

### EPIC-39: 8-bit Design Compliance

**No impact** - Not related to Gemini adapter.

---

## 🧪 Testing Strategy

### Unit Tests Needed

```typescript
describe('GeminiAdapter', () => {
  describe('createAdapter', () => {
    it('should create adapter with valid model and API key', () => { ... });
    it('should throw on missing API key', () => { ... });
    it('should accept all supported model IDs', () => { ... });
  });

  describe('streamChat', () => {
    it('should stream response from Gemini API', () => { ... });
    it('should handle multimodal input', () => { ... });
    it('should handle tool calls', () => { ... });
  });

  describe('model selection', () => {
    it('should select flash for multimodal input', () => { ... });
    it('should use default model for text-only', () => { ... });
  });
});
```

### Integration Tests Needed

```typescript
describe('Gemini Integration', () => {
  it('should connect to Gemini API with valid key', () => { ... });
  it('should return available models', () => { ... });
  it('should handle invalid API key gracefully', () => { ... });
});
```

---

## 📚 Documentation Updates

### Required Changes

1. **MM-04 Story Context**
   - Remove incorrect `createGeminiAdapter()` example
   - Add correct `createGeminiChat()` or `geminiText()` examples

2. **AGENTS.md**
   - Add TanStack AI SDK patterns to standards
   - Link to official documentation

3. **Create Adapter Guide**
   - Document both patterns (`geminiText` vs `createGeminiChat`)
   - Provide working examples
   - Common pitfalls to avoid

---

## ✅ Verification Checklist

- [x] GeminiAdapter TypeScript compilation passes
- [x] API key validation added
- [x] Model constants use correct types
- [x] No `as never` casts in final code
- [ ] Story MM-04 context updated (pending)
- [ ] OpenAI/Anthropic adapters audited (pending)
- [ ] Integration tests created (pending)
- [ ] Adapter standards documented (pending)

---

## 🔗 References

- **TanStack AI Gemini Adapter:** https://tanstack.com/ai/latest/docs/adapters/gemini
- **TanStack AI GitHub:** https://github.com/TanStack/ai
- **Type Definitions:** `node_modules/@tanstack/ai-gemini/dist/esm/adapters/text.d.ts`
- **Incident Retrospective:** `_bmad-output/incident-reports/gemini-adapter-retrospective-2026-01-11.md`

---

*Generated: 2026-01-11*  
*Author: Autonomous Agent System*  
*Next Review: 2026-01-12*
