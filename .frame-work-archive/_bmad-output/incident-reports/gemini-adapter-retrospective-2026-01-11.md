# Incident Retrospective: Gemini Adapter Configuration Misunderstanding

**Date:** 2026-01-11  
**Severity:** Medium  
**Impact:** Integration blocking - Gemini adapter could not load models correctly  
**Status:** RESOLVED  

---

## 📋 Incident Summary

A misconfiguration was identified in `src/lib/agent/providers/gemini-adapter.ts` where the developer (or AI assistant) misunderstood the `@tanstack/ai-gemini` API signature, leading to incorrect assumptions about how to instantiate the Gemini adapter.

### The Issue

The initial feedback suggested the `createGeminiChat` function used a **factory pattern** where:
```typescript
// Incorrect assumption
const adapterFactory = createGeminiChat(apiKey, config);
return adapterFactory(model);
```

This was **wrong**. The actual signature is:
```typescript
// Correct usage - direct instantiation
createGeminiChat(model, apiKey, config?);
```

### Root Cause

1. **Misunderstanding TanStack AI SDK patterns** - Assumed OpenAI-like factory pattern applied to Gemini
2. **Incorrect import usage** - Used `GEMINI_MODELS` as an object with properties (`.flash`, `.pro`) when it's actually a readonly tuple
3. **Wrong type references** - Used `GeminiModels` instead of the exported `GeminiTextModel`

---

## 🔍 Technical Investigation

### What Actually Happened

| Aspect | Initial Assumption | Reality |
|--------|-------------------|---------|
| `createGeminiChat` signature | `(apiKey, config?) => (model) => Adapter` | `(model, apiKey, config?) => Adapter` |
| `GEMINI_MODELS` structure | Object with named properties | Readonly tuple of literal strings |
| Type export | `GeminiModels` | `GeminiTextModel` |
| Model references | `GEMINI_MODELS.flash` | Direct string literal `'gemini-2.5-flash'` |

### Evidence from Source

From `@tanstack/ai-gemini/dist/esm/adapters/text.d.ts`:
```typescript
export declare function createGeminiChat<TModel extends (typeof GEMINI_MODELS)[number]>(
  model: TModel, 
  apiKey: string, 
  config?: Omit<GeminiTextConfig, 'apiKey'>
): GeminiTextAdapter<TModel, ...>;
```

From `@tanstack/ai-gemini/dist/esm/model-meta.d.ts`:
```typescript
export declare const GEMINI_MODELS: readonly [
  "gemini-3-pro-preview", 
  "gemini-2.5-pro", 
  "gemini-2.5-flash", 
  ...
];
```

---

## ✅ Resolution Applied

### Changes Made

1. **Removed factory pattern assumption:**
   ```typescript
   // BEFORE (broken)
   private createAdapter(model: string) {
       const adapterFactory = createGeminiChat(this.apiKey, {});
       return adapterFactory(model);
   }
   
   // AFTER (correct)
   private createAdapter(model: string) {
       return createGeminiChat(model as GeminiTextModel, this.apiKey, {});
   }
   ```

2. **Fixed model references:**
   ```typescript
   // BEFORE (broken)
   private defaultModel = config.model || GEMINI_MODELS.flash;
   return [
       { id: GEMINI_MODELS.flash, ... },
       { id: GEMINI_MODELS.pro, ... },
   ];
   
   // AFTER (correct)
   const DEFAULT_MODEL = 'gemini-2.5-flash' as const satisfies GeminiTextModel;
   private defaultModel = config.model || DEFAULT_MODEL;
   return [
       { id: DEFAULT_MODEL, ... },
       { id: 'gemini-2.5-pro' as const, ... },
   ];
   ```

3. **Added API key validation:**
   ```typescript
   constructor(config: GeminiAdapterConfig) {
       if (!config.apiKey) {
           throw new Error('GeminiAdapter: API key is required');
       }
       // ...
   }
   ```

4. **Fixed type imports:**
   ```typescript
   import { createGeminiChat, type GeminiTextConfig, type GeminiTextModel } from '@tanstack/ai-gemini';
   export type GeminiModelId = GeminiTextModel;
   ```

---

## 🎓 Lessons Learned

### For AI Assistants

1. **Verify SDK signatures before assuming patterns** - Don't assume OpenAI-like patterns apply to all providers
2. **Check exports carefully** - Read the actual `.d.ts` files from `node_modules`
3. **Type assertions mask real issues** - `as never` and similar casts hide type mismatches that indicate logic errors
4. **Test assumptions early** - Create minimal test cases to verify API behavior

### For Codebase Standards

1. **Need adapter-specific test suites** - No unit tests caught this integration issue
2. **Type safety gaps** - The adapter used `string` for model parameters instead of branded types
3. **Documentation lacking** - No adapter-specific usage examples in codebase

---

## ⚠️ Risk Assessment

### Affected Components

| Component | Risk Level | Notes |
|-----------|-----------|-------|
| EPIC-40 (Multimodal Chat) | HIGH | Core epic relying on Gemini integration |
| MM-04 (Integrate Gemini 2.5) | HIGH | Direct story affected |
| Provider abstraction layer | MEDIUM | Other adapters may have similar issues |
| Story-MM-04 context | HIGH | Context may contain incorrect assumptions |

### Potential Similar Issues

- OpenAI adapter - likely correct (more documented)
- Anthropic adapter - needs verification
- Ollama adapter - needs verification

---

## 🔄 Action Items

### Immediate (P0)

- [ ] Launch deep scan for similar adapter issues
- [ ] Create integration tests for all provider adapters
- [ ] Update story MM-04 context with correct information

### Short-term (P1)

- [ ] Add adapter-specific documentation with working examples
- [ ] Create type-safe model constants in domain layer
- [ ] Add runtime validation for adapter initialization

### Long-term (P2)

- [ ] Establish adapter testing standards
- [ ] Create SDK verification checklist for new providers
- [ ] Build integration test suite covering all provider paths

---

## 📊 Metrics

| Metric | Before | After |
|--------|--------|-------|
| TypeScript errors in gemini-adapter.ts | 0 (masked) | 0 |
| API key validation | ❌ Missing | ✅ Added |
| Model type safety | ❌ `string` | ✅ `GeminiTextModel` |
| Integration tests | ❌ None | ⏳ Pending |

---

## 🔗 References

- TanStack AI Gemini Adapter: https://tanstack.com/ai/latest/docs/adapters/gemini
- TanStack AI GitHub: https://github.com/TanStack/ai
- Google Gemini API: https://ai.google.dev/gemini-api/docs

---

*Generated: 2026-01-11*  
*Author: Autonomous Agent System*  
*Classification: Internal Development Documentation*
