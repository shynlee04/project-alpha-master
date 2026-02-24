---
phase: A-byok-foundation
plan: 04B
type: execute
wave: 3.5
depends_on: ["A-03", "A-04"]
files_modified: []
autonomous: true
user_setup: []

# HIGH-LEVEL CONTEXT LOADING (MANDATORY)
context_loaded:
  strategic:
    - ".planning/SOURCE-OF-TRUTH.md"
    - ".planning/schemas/MODEL-STRATEGY.md"
  governance:
    - ".planning/governance/GAPS-TRACKER.yaml"
    - ".planning/ROADMAP.md"
  phase_context:
    - ".planning/phases/A-byok-foundation/A-CONTEXT.md"

# Gap being addressed
addresses_gaps:
  - GAP-A04-001  # fetchModels is STUB
  - GAP-A04-002  # No 'provider:key:stored' event

must_haves:
  truths:
    - "fetchModels loads models from provider or hardcoded fallback"
    - "Saving API key triggers model fetch"
    - "Model dropdown shows available models after key save"
    - "Hardcoded models work even if API fails"
  artifacts:
    - ".planning/schemas/MODEL-STRATEGY.md"
  key_links:
    - "GAP-A04-001 resolved"
    - "GAP-A04-002 resolved"
---

<objective>
Restore model loading functionality so that saving an API key results in available models for selection.

Purpose: Fix the BLOCKER identified in GAP-A04-001 where fetchModels is a stub.
Output: Working model loading with hardcoded fallback.
High-Level Design: Per MODEL-STRATEGY.md Section 1 (Model Loading Strategy)
</objective>

<execution_context>
@/Users/apple/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/apple/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/schemas/MODEL-STRATEGY.md
@.planning/governance/GAPS-TRACKER.yaml
@.planning/phases/A-byok-foundation/A-CONTEXT.md
@.planning/phases/A-byok-foundation/A-03-SUMMARY.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create minimal model loading function</name>
  <files>
    - src/infrastructure/persistence/stores/providers/provider-models-slice.ts
    - src/lib/agent/providers/hardcoded-models.ts
  </files>
  <action>
    Replace the stubbed `fetchModels` function with working implementation:
    
    ```typescript
    // In provider-models-slice.ts
    
    import { getHardcodedModels, hasHardcodedModels } from '@/lib/agent/providers/hardcoded-models';
    import type { ModelInfo } from '@/domain/types/llm/model-types';
    
    fetchModels: async (providerId: string) => {
      console.log('[ProviderModelsSlice] Fetching models for:', providerId);
      
      // Step 1: Check for hardcoded models (always works)
      if (hasHardcodedModels(providerId)) {
        const hardcoded = getHardcodedModels(providerId);
        if (hardcoded) {
          const models: ModelInfo[] = hardcoded.map(m => ({
            id: m.id,
            name: m.name,
            providerId,
            contextLength: m.contextLength,
            supportsStreaming: true,
          }));
          
          set((state) => ({
            availableModels: {
              ...state.availableModels,
              [providerId]: models,
            },
            modelLoadingStatus: {
              ...state.modelLoadingStatus,
              [providerId]: { status: 'loaded', source: 'hardcoded' },
            },
          }));
          
          console.log('[ProviderModelsSlice] Loaded hardcoded models:', models.length);
          return;
        }
      }
      
      // Step 2: For providers without hardcoded models, use sensible defaults
      const defaultModels: Record<string, ModelInfo[]> = {
        gemini: [
          { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', providerId: 'gemini' },
          { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', providerId: 'gemini' },
        ],
        openrouter: [
          { id: 'meta-llama/llama-3.3-8b-instruct:free', name: 'Llama 3.3 8B (Free)', providerId: 'openrouter' },
        ],
        openai: [
          { id: 'gpt-4o-mini', name: 'GPT-4o Mini', providerId: 'openai' },
          { id: 'gpt-4o', name: 'GPT-4o', providerId: 'openai' },
        ],
      };
      
      const models = defaultModels[providerId] || [];
      
      set((state) => ({
        availableModels: {
          ...state.availableModels,
          [providerId]: models,
        },
        modelLoadingStatus: {
          ...state.modelLoadingStatus,
          [providerId]: { status: 'loaded', source: 'default' },
        },
      }));
      
      console.log('[ProviderModelsSlice] Loaded default models for', providerId, ':', models.length);
    },
    ```
    
    Per MODEL-STRATEGY.md Section 1.3:
    - Priority: api → cache → hardcoded
    - For Phase A, we implement hardcoded fallback only (api fetching in Phase B)
  </action>
  <verify>fetchModels logs "Loaded" instead of "STUB"</verify>
  <done>Model loading function works with hardcoded fallback.</done>
</task>

<task type="auto">
  <name>Task 2: Add model loading trigger on key save</name>
  <files>
    - src/presentation/components/settings/ProviderConfigDialog.tsx
  </files>
  <action>
    The ProviderConfigDialog already calls fetchModels after saving (line 227).
    
    Verify this wiring exists:
    ```typescript
    // After successful key save
    await storeVaultCredential(provider.id, apiKey);
    // ... 
    await fetchModels(provider.id);  // This should now work
    ```
    
    If not present, add the call:
    ```typescript
    // After credential stored successfully
    const { fetchModels } = useProviderStore.getState();
    await fetchModels(provider.id);
    ```
    
    Per MODEL-STRATEGY.md Section 5.1:
    - provider:key:stored event would be better (future Phase B work)
    - For now, direct call after save is acceptable
  </action>
  <verify>Saving API key triggers model loading</verify>
  <done>Key save → model load wiring confirmed.</done>
</task>

<task type="auto">
  <name>Task 3: Add model loading status to state</name>
  <files>
    - src/infrastructure/persistence/stores/providers/provider-models-slice.ts
  </files>
  <action>
    Ensure the slice tracks loading status for UI feedback:
    
    ```typescript
    // Add to state type if not present
    modelLoadingStatus: Record<string, {
      status: 'idle' | 'loading' | 'loaded' | 'error';
      source?: 'api' | 'cache' | 'hardcoded' | 'default';
      error?: string;
    }>;
    ```
    
    Update in fetchModels to set status.
  </action>
  <verify>Status shows 'loaded' after fetch</verify>
  <done>Loading status tracking works.</done>
</task>

<task type="auto">
  <name>Task 4: Run verification</name>
  <files></files>
  <action>
    Execute verification commands:
    
    1. TypeScript check:
       ```bash
       pnpm typecheck:fast
       ```
       Expected: No new errors in provider-models-slice.ts
    
    2. Governance check:
       ```bash
       pnpm governance
       ```
       Expected: Pass
    
    3. Verify hardcoded models exist:
       ```bash
       grep -n "getHardcodedModels" src/lib/agent/providers/hardcoded-models.ts
       ```
       Expected: Function exists
  </action>
  <verify>All commands pass.</verify>
  <done>Automated verification complete.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
    Restored model loading with hardcoded fallback:
    - fetchModels now loads models instead of logging "STUB"
    - Saving API key triggers model fetch
    - Model dropdown should populate after key save
  </what-built>
  <how-to-verify>
    1. Start development server:
       ```bash
       pnpm dev
       ```
    
    2. Navigate to Provider Settings:
       - Open app at http://localhost:3002
       - Go to Settings → Providers
    
    3. Test model loading:
       - Click "Edit" on Google Gemini provider
       - Enter your Gemini API key
       - Click Save
       - Wait 2 seconds
       - Check if model dropdown now shows models
    
    4. Check console for:
       - "[ProviderModelsSlice] Loaded hardcoded models: X"
       - NOT "[ProviderModelsSlice STUB]"
    
    5. (Optional) Refresh page and verify models persist
  </how-to-verify>
  <resume-signal>
    Type "approved" if model dropdown shows models after key save.
    If issues found, describe what failed and any error messages.
  </resume-signal>
</task>

</tasks>

<verification>
Gap Resolution:
- [ ] GAP-A04-001: fetchModels is no longer a stub
- [ ] GAP-A04-002: Key save triggers model loading (event-based in Phase B)

Phase A success criteria (updated):
- [ ] User can input Gemini API key in settings
- [ ] User can input OpenRouter API key in settings
- [ ] Keys persist after browser refresh
- [ ] **NEW: Models load after key is saved**
- [ ] **NEW: Model dropdown shows available models**
- [ ] credentialVault.getCredentials('gemini') returns the key
</verification>

<success_criteria>
- [ ] pnpm typecheck:fast passes
- [ ] pnpm governance passes
- [ ] Manual verification: models appear after key save
- [ ] Console shows "Loaded" not "STUB"
- [ ] GAP-A04-001 marked resolved in GAPS-TRACKER.yaml
- [ ] GAP-A04-002 marked resolved in GAPS-TRACKER.yaml
</success_criteria>

<output>
After completion:
1. Create `.planning/phases/A-byok-foundation/A-04B-SUMMARY.md`
2. Update `.planning/governance/GAPS-TRACKER.yaml`:
   - Set GAP-A04-001.resolution_status: resolved
   - Set GAP-A04-002.resolution_status: resolved
3. Update `.planning/STATE.md` to reflect A-04B completion
</output>
