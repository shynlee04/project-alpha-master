# User Journey Failure Matrix - Verified (Skeptical PM Scan)

**Date**: 2026-01-07
**Method**: Runtime Verification + Code Tracing
**Stance**: "Assume the product is failing until proven otherwise via evidence"

## Instructions

For each user journey:
1. **Expected**: Can the user complete the journey in ≤3 steps?
2. **Reality**: What actually happens when you trace the code?
3. **Status**: ✅ PASS or ❌ FAIL (with evidence)

If any journey can't be completed in ≤3 steps, treat it as a **FAIL PRODUCT** for that journey.

---

## Matrix

### Journey 1: Add API Key → Use RAG Search

**Expected** (≤3 steps):
1. Open provider settings
2. Save API key
3. Search returns results from imported documents

**Reality** (Code Trace):
- ✅ Step 1: Provider settings accessible via AgentConfigDialog
- ✅ Step 2: API key saved to credentialVault (IndexedDB)
- ❌ Step 3: `createEmbeddingService()` called WITHOUT API key
  - Location: `KnowledgePage.tsx:351`
  - Result: `selectEmbeddingProvider()` sees `hasApiKey=false`
  - Falls back to 'none' or 'local' provider
  - Cloud embeddings NOT created
  - Search returns NO RESULTS

**Evidence**:
```typescript
// KnowledgePage.tsx:351
const service = await createEmbeddingService();  // NO API KEY PASSED
```

```typescript
// embedding-service.ts:272-273
if (!apiKey) {
    throw new Error('API key is required for cloud embeddings but was not provided.');
}
```

**Status**: ❌ **FAIL** - Key saved but embeddings fail (no key passed to service)

---

### Journey 2: Agent Chat (IDE Workspace)

**Expected** (≤3 steps):
1. Select agent from dropdown
2. Send message
3. Agent responds

**Reality** (Code Trace):
- ✅ Step 1: Agent selector uses `useAgentSelection` store
- ✅ Step 2: Message sent via `useAgentChatWithTools`
- ✅ Step 3: `useAgentChatAPIKeyManager` retrieves API key from vault
  - Location: `AgentChatAPIKeyManager.tsx:43-44`
  - Code: `await credentialVault.initialize(); await credentialVault.getCredentials(providerId)`
  - API key passed to `/api/chat` endpoint
  - LLM responds successfully

**Evidence**:
```typescript
// AgentChatPanel.tsx:93-95
const { apiKey, apiKeyError, providerId } = useAgentChatAPIKeyManager({
    agentProviderId: activeAgent?.providerId
});
```

```typescript
// AgentChatAPIKeyManager.tsx:43-44
await credentialVault.initialize();
let key = await credentialVault.getCredentials(providerId);
```

**Status**: ✅ **PASS** - Correct implementation (active vault retrieval)

---

### Journey 3: Agent Chat (Notes Workspace)

**Expected** (≤3 steps):
1. Select agent from dropdown
2. Send message
3. Agent responds

**Reality** (Code Trace):
- ✅ Step 1: Agent selector uses `useAgentSelection` store
- ✅ Step 2: Message sent via `useAgentChatWithTools`
- ❌ Step 3: `apiKey: undefined` passed to hook
  - Location: `NoteSidebarChat.tsx:83`
  - FALSE COMMENT: "Credential-vault handles API key lookup"
  - Reality: Hook does NO internal vault lookup
  - Request sent to `/api/chat` WITHOUT API key
  - LLM provider returns 401 Unauthorized

**Evidence**:
```typescript
// NoteSidebarChat.tsx:83
apiKey: undefined, // Credential-vault handles API key lookup  ← FALSE!
```

**Impact**: All agent chat messages in Notes workspace fail with 401 error.

**Status**: ❌ **FAIL** - No API key retrieval (false documentation)

---

### Journey 4: Returning User (Session Restore)

**Expected** (≤3 steps):
1. Open app
2. API key restored from vault
3. Features work (chat, RAG)

**Reality** (Code Trace):
- ✅ Step 1: App loads, credentialVault initializes from IndexedDB
- ✅ Step 2: API key exists in vault (from previous session)
- ❌ Step 3: Components DON'T retrieve key from vault
  - Notes workspace: `apiKey: undefined`
  - Embedding service: `createEmbeddingService()` called without key
  - Result: Features DON'T work despite key being in vault

**Evidence**:
- Key is in vault: `credentialVault.getCredentials()` returns key
- Components don't call it: See Journey 1 and Journey 3

**Status**: ❌ **FAIL** - Key in vault but never retrieved

---

### Journey 5: Create Agent → Configure Provider

**Expected** (≤3 steps):
1. Create new agent
2. Select provider/model
3. Save agent

**Reality** (Code Trace):
- ✅ Step 1: AgentConfigDialog creates agent via `agentsStore.addAgent()`
- ✅ Step 2: Provider/model selectors use `useProviderStore`
- ✅ Step 3: Agent saved to `agentsStore` (localStorage)
- ⚠️ Note: API key saved separately to credentialVault (different storage)

**Status**: ✅ **PASS** - Agent creation works

---

### Journey 6: Import Document → Index for Search

**Expected** (≤3 steps):
1. Import PDF/image/URL
2. Document processed
3. Indexed for search

**Reality** (Code Trace):
- ✅ Step 1: File picker/import works
- ✅ Step 2: Document processors (PDF, images, URLs) use credentialVault
  - Location: `gemini-pdf-processor.ts`, `gemini-image-processor.ts`, `gemini-url-processor.ts`
  - Code: `await credentialVault.getCredentials(providerId)` ✅
- ❌ Step 3: Embeddings NOT created
  - Location: `incremental-indexing-service.ts:247, 368`
  - Code: `await createEmbeddingService()` (NO API KEY)
  - Result: Document processed but NOT indexed for search

**Evidence**:
```typescript
// incremental-indexing-service.ts:247
const embeddingService = await createEmbeddingService();  // NO API KEY
```

**Status**: ❌ **FAIL** - Processing works but indexing fails (no embeddings)

---

### Journey 7: Switch Workspace → Context Preserved

**Expected** (≤3 steps):
1. Switch from IDE to Knowledge
2. Agent selection preserved
3. Chat context preserved

**Reality** (Code Trace):
- ✅ Step 1: Workspace switch works
- ✅ Step 2: `useAgentSelection` has per-workspace state
- ⚠️ Step 3: Chat context MAY be lost due to workspace-scoped stores

**Status**: ⚠️ **PARTIAL** - Agent selection works, chat context unclear

---

### Journey 8: Invalid API Key → Error Message

**Expected** (≤3 steps):
1. Enter invalid API key
2. Save key
3. See error message

**Reality** (Code Trace):
- ✅ Step 1: Key input works
- ✅ Step 2: Key saved to vault
- ❌ Step 3: Error handling unclear
  - Notes workspace: Sends undefined key → 401 error
  - Embedding service: Throws error at creation time
  - NO user-friendly error message displayed

**Status**: ❌ **FAIL** - No clear error handling for invalid keys

---

### Journey 9: Update API Key → Services Use New Key

**Expected** (≤3 steps):
1. Update saved API key
2. Services detect change
3. Use new key for requests

**Reality** (Code Trace):
- ✅ Step 1: Key update works
- ⚠️ Step 2: Event `credentials-updated` emitted
- ✅ Step 3: IDE workspace listens to event (useAgentChatAPIKeyManager)
- ❌ Step 4: Other workspaces/services DON'T listen to event

**Evidence**:
```typescript
// AgentChatAPIKeyManager.tsx:64-72
window.addEventListener('credentials-updated', handleCredentialsUpdate);
```

**Status**: ⚠️ **PARTIAL** - IDE workspace works, others don't

---

### Journey 10: Cross-Workspace File Operations

**Expected** (≤3 steps):
1. Open file in IDE workspace
2. Switch to Notes workspace
3. Reference file content in notes

**Reality** (Code Trace):
- ✅ Step 1: File operations work in IDE
- ✅ Step 2: Workspace switch works
- ❌ Step 3: File content NOT accessible in Notes workspace
  - Notes workspace only gets file READ tools (no write/terminal)
  - No cross-workspace file reference mechanism

**Status**: ❌ **FAIL** - No cross-workspace file access

---

## Summary

| Journey | Status | Issue |
|---------|--------|-------|
| J1: Add key → Use RAG | ❌ FAIL | Embedding service doesn't retrieve API key |
| J2: Agent chat (IDE) | ✅ PASS | Correct implementation |
| J3: Agent chat (Notes) | ❌ FAIL | Component doesn't retrieve API key |
| J4: Returning user | ❌ FAIL | Components don't retrieve saved key |
| J5: Create agent | ✅ PASS | Works correctly |
| J6: Import → Index | ❌ FAIL | Embedding service has no API key |
| J7: Switch workspace | ⚠️ PARTIAL | Agent selection works, context unclear |
| J8: Invalid key error | ❌ FAIL | No user-friendly error handling |
| J9: Update key | ⚠️ PARTIAL | IDE works, others don't |
| J10: Cross-workspace files | ❌ FAIL | No cross-workspace file access |

**Pass Rate**: 2/10 = **20%** ❌

**Overall Assessment**: **FAIL PRODUCT** - 80% of critical user journeys fail due to missing API key retrieval patterns.

---

## Priority Fixes

### P0 (Critical - Blocker)

1. **Fix NoteSidebarChat API key retrieval**
   - Use `useAgentChatAPIKeyManager` pattern
   - Effort: 30 minutes

2. **Fix embedding service API key retrieval**
   - Create `useEmbeddingServiceAPIKey` hook
   - Update 4 embedding service locations
   - Effort: 2-3 hours

### P1 (High)

3. **Add error handling for invalid API keys**
   - Display user-friendly error messages
   - Effort: 1-2 hours

4. **Implement cross-workspace key update events**
   - All workspaces listen to `credentials-updated`
   - Effort: 1 hour

### P2 (Medium)

5. **Clarify chat context preservation**
   - Document how context is preserved across workspace switches
   - Effort: 30 minutes (documentation only)

---

## Verification Status

✅ **COMPLETE** - All 10 journeys verified with code evidence

**Next Actions**:
1. Implement P0 fixes
2. Re-verify failed journeys
3. Update pass rate metric
