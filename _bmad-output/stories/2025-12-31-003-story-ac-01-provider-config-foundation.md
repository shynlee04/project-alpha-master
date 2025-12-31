# Story AC-01: Provider Configuration Foundation

**Story ID**: AC-01
**Priority**: P0 (TODAY)
**Epic**: Sprint Change Proposal 2025-12-31
**Status**: 🚨 READY FOR CONTEXT
**Date Created**: 2025-12-31
**Story Type**: Implementation (Foundation)

---

## Executive Summary

Implement LLM Provider configuration system with correct data flow, reactive updates, and cross-workspace synchronization. This is the foundation for all AI interactions.

---

## Acceptance Criteria

### AC-01.1: Built-in Providers Have READONLY Base URLs

**Requirements**:
- OpenRouter, Anthropic, Gemini, OpenAI endpoints are NOT editable
- UI shows lock icon and greyed out baseUrl field
- Only API Key field is editable for built-in providers

**Validation Method**:
- Manual UI testing
- Verify baseUrl field is disabled
- Verify lock icon displayed

**Files Involved**:
- `src/presentation/components/agent/ProviderConfigDialog.tsx`
- `src/lib/state/provider-store.ts`

---

### AC-01.2: Custom Provider Creation Works

**Requirements**:
- Only for OpenAI-compatible endpoints
- User enters: Name (required), BaseURL (required), Headers (optional)
- API Key optional (for local providers like Ollama)
- Custom providers get ID: `custom-{timestamp}`

**Validation Method**:
- Create custom provider with valid inputs
- Create custom provider with missing Name (should reject)
- Create custom provider with missing BaseURL (should reject)
- Verify custom provider ID format

**Files Involved**:
- `src/presentation/components/agent/ProviderConfigDialog.tsx`
- `src/lib/state/provider-store.ts`
- `src/lib/agent/providers/provider-adapter.ts`

---

### AC-01.3: API Key Saves → Models Auto-Load

**Requirements**:
- Key saved to CredentialVault (encrypted)
- Models fetched from provider API
- Models appear in UI immediately (reactive)
- Event emitted: `provider:models-loaded`

**Validation Method**:
- Enter API key for OpenAI → Models load
- Enter API key for Anthropic → Models load
- Verify models stored in provider-models-store
- Verify event emitted in console

**Files Involved**:
- `src/lib/state/provider-store.ts` (needs `setApiKey` action)
- `src/lib/events/store-events.ts` (event definitions)
- `src/lib/agent/providers/model-registry.ts` (model fetching)

---

### AC-01.4: Reactivity Across Workspaces

**Requirements**:
- Change in settings → ALL workspaces see update
- Event bus used for cross-component sync
- AgentSelector updates available models
- AgentConfigDialog shows models in dropdown

**Validation Method**:
- Add API key in Settings
- Navigate to IDE workspace → Models visible
- Navigate to Knowledge workspace → Models visible
- Select agent → Models dropdown populated

**Files Involved**:
- `src/lib/events/store-events.ts`
- `src/presentation/components/chat/AgentSelector.tsx`
- `src/presentation/components/agent/AgentConfigDialog.tsx`

---

## Current State Analysis

### What Exists
- ✅ `ProviderConfigDialog.tsx` component exists
- ✅ `provider-store.ts` exists (basic structure)
- ✅ `model-registry.ts` exists (model definitions)
- ✅ `credential-vault.ts` exists (API key storage)

### What's Missing
- ❌ `setApiKey` action in provider-store
- ❌ Auto-fetch models after API key save
- ❌ Event bus integration
- ❌ READONLY baseUrl enforcement for built-in providers
- ❌ Custom provider creation UI

---

## Implementation Plan

### Phase 1: Store Enhancement (TDD RED Phase)
1. Add `setApiKey` action to provider-store
2. Write tests for API key persistence
3. Write tests for model auto-loading
4. Write tests for event emission

### Phase 2: Provider Adapter Integration (TDD GREEN Phase)
1. Implement `fetchModels` function
2. Connect to provider APIs
3. Normalize models to ProviderModel interface
4. Handle errors gracefully

### Phase 3: UI Updates (TDD REFACTOR Phase)
1. Update ProviderConfigDialog for READONLY baseUrl
2. Add custom provider creation form
3. Wire up event bus listeners
4. Test reactivity across workspaces

---

## Risk Assessment

### High Risk Areas
1. **Provider API Integration**: May fail if APIs change
   - **Mitigation**: Mock API responses in tests

2. **Event Bus Timing**: Components may update before models load
   - **Mitigation**: Loading states in UI

3. **Cross-Workspace Sync**: State may not propagate
   - **Mitigation**: Explicit event listeners in each workspace

---

## Dependencies

### Blocking Dependencies
- None

### Dependent Stories
- **Story AC-02**: Agent Configuration Vault (depends on AC-01.3)
- **Story AC-03**: Chat Panel Cross-Workspace (depends on AC-01.4)

---

## Definition of Done

- [ ] All 4 acceptance criteria met
- [ ] All tests passing (100% coverage for new code)
- [ ] No regressions in existing functionality
- [ ] Event bus working correctly
- [ ] Cross-workspace reactivity verified
- [ ] Code review completed

---

**Story Created**: 2025-12-31 16:00:00+07:00
**Next Step**: CREATE-STORY-CONTEXT → Deep analysis of all files involved
**Status**: 🚨 READY FOR CONTEXT PHASE
