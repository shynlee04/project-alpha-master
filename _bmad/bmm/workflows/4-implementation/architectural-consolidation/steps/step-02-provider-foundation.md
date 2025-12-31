---
step: 2
id: step-02-provider-foundation
name: Provider Foundation & Reactivity
workflow: architectural-consolidation
---

# Step 2: Provider Foundation & Reactivity (Layer 2)

**Objective**: Implement the strict `LLMProvider` and `ProviderModel` contracts, ensuring correct data flow from API Key input to Model Loading via the Event Bus. This fixes "Refactor Provider Store" shortcomings.

---

## 1. ARCHITECTURAL ANALYSIS & CORRECTION of "Refactor Provider Store"

**Previous Error**: The previous session created a `provider-models-store.ts` that:
1. Defined local `ProviderState` instead of using the shared `LLMProvider` contract.
2. Left `CustomProvider` as a separate, potentially conflicting interface.
3. Did not fully enforce the `isHardcoded` constraint for built-in providers at the type level.

**Corrective Action**:
We will refactor `src/stores/provider-models-store.ts` to strictly implement the L2 Contracts defined in Step 01.

---

## 2. DATA CONTRACT REFACTORING

### 2.1 Update `src/lib/agent/providers/types.ts`
Establish the SINGLE SOURCE OF TRUTH types here.

```typescript
// src/lib/agent/providers/types.ts (TARGET_STATE)

export type ProviderType = 'openai' | 'anthropic' | 'gemini' | 'openai-compatible';

export interface LLMProvider {
  id: string;
  name: string;
  type: ProviderType;
  baseUrl: string;
  isHardcoded: boolean; // TRUE for built-ins
  hasApiKey: boolean;
  isEnabled: boolean;
  capabilities: {
    streaming: boolean;
    functionCalling: boolean;
    vision: boolean;
    embeddings: boolean;
  };
}

export interface ProviderModel {
  id: string;
  name: string;
  providerId: string;
  contextLength: number;
  maxOutputTokens: number;
  inputModalities: ('text' | 'image' | 'audio')[];
  outputModalities: ('text' | 'image' | 'audio')[];
}
```

### 2.2 Update `src/stores/provider-models-store.ts`
Refactor the store to use these types directly.

**Changes Required:**
1.  **Replace** `ProviderState` with `LLMProvider`.
2.  **Remove** redundant `CustomProvider` interface.
3.  **Ensure** getters like `getModelsForProvider(id)` return `ProviderModel[]`.

---

## 3. EVENT BUS IMPLEMENTATION (L1 Reactivity)

### 3.1 Verify `src/lib/events/store-events.ts`
Ensure the following events are defined and typed:

-   `PROVIDER_KEY_SET`: `{ providerId: string }`
-   `PROVIDER_MODELS_LOADED`: `{ providerId: string, count: number }`

### 3.2 Wire Actions (Flow 1 Implementation)

**In `provider-models-store.ts`:**

`setApiKey(providerId, key)`:
1.  Verify `providerId` exists.
2.  Store key in `CredentialVault`.
3.  Update state: `providers[id].hasApiKey = true`.
4.  **Emit**: `PROVIDER_KEY_SET`.

```typescript
// Correct implementation pattern
setApiKey: async (providerId, apiKey) => {
  await credentialVault.storeCredentials(providerId, apiKey);
  set(produce(state => {
    state.providers[providerId].hasApiKey = true;
  }));
  emitStoreEvent(STORE_EVENTS.PROVIDER_KEY_SET, { providerId });
  // Auto-trigger fetch
  get().refreshProviderModels(providerId);
}
```

`refreshProviderModels(providerId)`:
1.  Check `state.providers[providerId]`.
2.  Fetch models from API (using `modelRegistry`).
3.  Update state: `models = [...]`.
4.  **Emit**: `PROVIDER_MODELS_LOADED`.

---

## 4. UI ENFORCEMENT (Layer 5)

### 4.1 Update `ProviderConfigDialog.tsx`
Ensure it strictly respects the `isHardcoded` property from `LLMProvider`.

-   **Logic**: `readOnly={provider.isHardcoded}` on the Base URL input.
-   **Correction**: Do not rely on specific IDs like 'openrouter'. Rely on the boolean flag. This makes the system data-driven.

---

## 5. VALIDATION CHECKLIST (AC-01)

Execute these checks after refactoring:

- [ ] **Type Check**: Run `tsc --noEmit`. No errors in `provider-models-store.ts`.
- [ ] **Hardcoded Check**: Verify OpenRouter provider has `isHardcoded: true`.
- [ ] **Custom Check**: Add a custom provider. Verify `isHardcoded: false`.
- [ ] **Flow Check**:
    1.  Clear Application Storage (Dexie).
    2.  Open Settings -> Providers.
    3.  Enter OpenRouter Key.
    4.  Save.
    5.  **Verify**: Models dropdown populates *automatically* without page refresh.

---

## 6. EXECUTION INSTRUCTIONS

1.  **READ** `src/lib/agent/providers/types.ts` to ensure base types are correct.
2.  **EDIT** `src/stores/provider-models-store.ts` to align with the 5-Layer architecture contracts.
3.  **VERIFY** `ProviderConfigDialog` respects the contracts.

**(Self-Correction Note)**: If you find circular dependencies between store and events, extract events to a pure library file.

---

## 7. NEXT STEP

Once AC-01 is verified, we move to the Agent Vault (AC-02), which builds upon these providers.

**Menu:**
1.  **[AV] Proceed to Step 3 (Agent Vault)** - If Provider Foundation is solid.
2.  **[RE] Retry Step 2** - If validation fails.
