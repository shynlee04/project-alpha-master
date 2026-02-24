---
status: resolved
trigger: "GAP-A04B-003: ProviderSettings.tsx prioritizes hardcoded models over API-loaded models"
created: 2026-02-02T12:30:00+07:00
updated: 2026-02-02T12:45:00+07:00
symptoms_prefilled: true
goal: find_and_fix
---

## Current Focus

hypothesis: ProviderSettings.tsx lines 191-195 check hasHardcodedModels() FIRST, bypassing API-loaded models
test: Trace code path to confirm hardcoded models are prioritized over getAvailableModels()
expecting: UI always shows hardcoded list for 6 providers (groq, mistral, chutes, gemini, openrouter, openai)
next_action: Create A-04C-PLAN.md to remove all hardcoded model logic and use API-first approach

## Symptoms

expected: Model dropdown shows API-loaded models from provider APIs
actual: Model dropdown shows stale hardcoded list, API models ignored
errors: No errors - silent priority bypass
reproduction: Add API key → Model dropdown shows hardcoded models, not fresh API models
started: Since hardcoded-models.ts was created with 6 major providers

## Evidence

- timestamp: 2026-02-02T12:25:00Z
  checked: ProviderSettings.tsx lines 191-195
  found: |
    ```tsx
    const hardcodedModels = getHardcodedModelList(provider.id);
    const useHardcoded = hardcodedModels !== null;  // TRUE for 6 providers
    const models = useHardcoded
        ? hardcodedModels.map(formatHardcodedModel)  // ALWAYS used
        : getProviderModels(provider.id);           // NEVER reached
    ```
  implication: API models from getAvailableModels() are completely ignored

- timestamp: 2026-02-02T12:26:00Z
  checked: hardcoded-models.ts line 297-314
  found: hasHardcodedModels() returns true for groq, mistral, chutes, gemini, google, openrouter, openai
  implication: 6 major providers ALWAYS use hardcoded list, never API

- timestamp: 2026-02-02T12:27:00Z
  checked: model-loader.ts (infrastructure/ai/)
  found: Proper API-first strategy exists (API → Cache → Hardcoded fallback)
  implication: model-loader.ts is correctly implemented but ProviderSettings.tsx bypasses it

- timestamp: 2026-02-02T12:28:00Z
  checked: provider-models-slice.ts
  found: fetchModels() correctly calls loadModels() from model-loader.ts
  implication: Store infrastructure is correct, UI bypasses it

- timestamp: 2026-02-02T12:29:00Z
  checked: package.json
  found: @tanstack/ai@^0.2.2 and @tanstack/ai-openai@^0.2.1 are installed
  implication: TanStack AI SDK is available but NOT used for model loading

## Eliminated

(none yet - root cause is clear)

## Resolution

root_cause: |
  ProviderSettings.tsx lines 191-195 have inverted priority logic:
  1. Checks hasHardcodedModels(provider.id) FIRST
  2. If true (which it is for 6 major providers), uses hardcoded list
  3. getAvailableModels() from store is NEVER called for these providers
  
  The hardcoded-models.ts file was created as "fallback" but UI treats it as PRIMARY source.

fix: |
  Phase A-04C Executed:
  1. Removed hardcoded model imports from ProviderSettings.tsx
  2. Removed getHardcodedModelList and formatHardcodedModel functions
  3. Changed model loading to always use getProviderModels(provider.id)
  4. Removed !useHardcoded check on Refresh button (now always visible)
  5. Deleted hardcoded-models.ts entirely (323 lines removed)
  6. model-loader.ts already has proper API-first with fallback strategy

verification: |
  - TypeScript: No ProviderSettings.tsx errors
  - Imports: No hardcoded-models imports remain in codebase
  - File deleted: src/lib/agent/providers/hardcoded-models.ts removed
  - model-loader.ts: Verified API-first strategy intact (API → Cache → Hardcoded fallback)

files_changed:
  - src/presentation/components/agent/ProviderSettings.tsx (removed hardcoded priority logic)
  - src/lib/agent/providers/hardcoded-models.ts (DELETED)
