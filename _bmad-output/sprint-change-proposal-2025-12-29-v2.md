# Sprint Change Proposal - Agent Configuration System Overhaul

**Date:** 2025-12-29T23:05:00+07:00  
**Trigger:** User feedback - Critical functionality gaps in agent configuration  
**Scope:** MAJOR - Requires fundamental implementation changes  

---

## Section 1: Issue Summary

### Problem Statement

The agent configuration system is fundamentally broken with multiple interconnected failures:

1. **Agent Edit Not Reflecting** - When editing an agent, name/role/model changes are not populated or saved
2. **API Keys Not Recognized** - Key status shows "not configured" even when credentials exist in vault
3. **Hardcoded Models** - Models are hardcoded, not dynamically loaded from provider APIs
4. **Provider-Agent Disconnect** - Selecting a provider doesn't auto-load stored credentials
5. **No LLM Parameters** - Missing temperature, topP, topK, maxTokens, systemPrompt controls
6. **Conversation Context Lost** - Chat history not persisting across reloads/sessions
7. **Sync Counter Resets** - File sync status resets to 0 on every page reload

### Evidence

- Console shows `[AgentConfigDialog] Edit mode` but form fields remain empty
- credentialVault.hasCredentials() returns false after page reload
- Model dropdown shows static list instead of API-fetched models
- No LLM parameter sliders or inputs visible in agent config UI
- Conversations disappear after browser refresh
- Sync counter starts at 0 even with previously synced files

---

## Section 2: Impact Analysis

### Epic Impact

| Epic | Status | Impact |
|------|--------|--------|
| Epic 2 (AI Chat) | COMPLETED | ❌ Agent CRUD broken, conversation persistence broken |
| Epic 3 (File Sync) | COMPLETED | ❌ Sync status persistence broken |
| Epic 24 (Performance) | IN-PROGRESS | ⚠️ Blocked by persistence issues |
| Epic 25 (AI Foundation) | PLANNED | ⚠️ Provider integration incomplete |

### Story Impact

**Must Fix (CRITICAL):**
- Story 2-2: Agent CRUD Operations - Form population broken
- Story 2-4: Conversation Persistence - Not actually persisting
- Story 24-1: Incremental Sync - Sync status not persisting

**Should Fix (HIGH):**
- Story 25-0: Provider Integration - Models hardcoded
- New Story: LLM Parameters UI - Missing entirely

### Technical Impact

| Component | File | Issue |
|-----------|------|-------|
| AgentConfigDialog | `src/components/agent/AgentConfigDialog.tsx` | Form not populating, race conditions |
| CredentialVault | `src/lib/agent/providers/credential-vault.ts` | Not initializing on page load |
| ModelRegistry | `src/lib/agent/providers/model-registry.ts` | API calls exist but not triggered |
| AgentsStore | `src/stores/agents-store.ts` | Updates not reflecting in UI |
| FileSyncStatusStore | `src/lib/workspace/file-sync-status-store.ts` | Persistence not working |
| ConversationStore | `src/lib/state/conversation-store.ts` | Not hydrating from Dexie |

---

## Section 3: Recommended Approach

### Root Cause Analysis

```
credentialVault.initialize() not called on app boot
        ↓
hasCredentials() returns false (vault not initialized)
        ↓
AgentConfigDialog shows "not configured"
        ↓
modelRegistry.getModels() called without API key
        ↓
Returns hardcoded defaults instead of API models
```

### Recommended: Corrective Sprint 30

**Stories to Create:**

| ID | Title | Priority | Est. |
|----|-------|----------|------|
| 30-1 | App-level credential vault initialization | CRITICAL | 2h |
| 30-2 | Provider-credential auto-detection | CRITICAL | 3h |
| 30-3 | Dynamic model loading from APIs | CRITICAL | 4h |
| 30-4 | Fix agent edit form population | CRITICAL | 2h |
| 30-5 | Add LLM parameters UI | HIGH | 4h |
| 30-6 | Fix Dexie sync status hydration | CRITICAL | 3h |
| 30-7 | Fix conversation store hydration | CRITICAL | 3h |
| 30-8 | Per-thread agent selection | MEDIUM | 3h |

---

## Section 4: Immediate Fixes

### FIX-001: Credential Vault App-Level Init

Add to `src/routes/__root.tsx`:
```tsx
useEffect(() => {
    credentialVault.initialize().catch(console.error);
}, []);
```

### FIX-002: Provider Auto-Credential Detection

Modify `AgentConfigDialog.tsx` provider change effect:
```tsx
useEffect(() => {
    const loadProviderData = async () => {
        await credentialVault.initialize();
        const hasKey = await credentialVault.hasCredentials(providerId);
        if (hasKey) {
            const models = await modelRegistry.getModels(
                providerId, 
                await credentialVault.getCredentials(providerId)
            );
            setModels(models);
        }
    };
    loadProviderData();
}, [providerId]);
```

---

## Status: AWAITING APPROVAL

Proceed with Sprint 30 implementation? [yes/no]
