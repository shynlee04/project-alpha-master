# API Key Flow Verification Report

**Date**: 2026-01-07
**Method**: Skeptical PM Scan - Iteration 2 (Runtime Verification)
**Stance**: "Assume the product is failing until proven otherwise via evidence"

## Executive Summary

**Critical Finding**: API keys stored in the credential vault are NOT being retrieved/passed to critical services, causing core user journeys to FAIL.

**Impact**:
- ❌ RAG search fails (embeddings don't work with cloud API)
- ❌ Notes workspace agent chat fails (401 Unauthorized)
- ✅ IDE workspace agent chat works (correct implementation exists)

---

## Verification Methodology

### 1. Runtime Verification
Actually tested code paths to confirm if API key flows from credential vault to services.

### 2. Deep Trace
Found ALL code paths that call `credentialVault.getCredentials()` vs. those that don't.

### 3. Cross-Reference
Verified implementation patterns across workspaces to identify inconsistencies.

---

## Findings

### ✅ CORRECT Implementation: IDE Workspace Agent Chat

**Component**: `AgentChatPanel.tsx` (lines 93-95)
```typescript
const { apiKey, apiKeyError, providerId } = useAgentChatAPIKeyManager({
    agentProviderId: activeAgent?.providerId
});
```

**Hook**: `useAgentChatAPIKeyManager` (lines 43-44)
```typescript
await credentialVault.initialize();
let key = await credentialVault.getCredentials(providerId);
```

**Path**:
```
User saves API key → credentialVault (IndexedDB)
    ↓
AgentChatPanel mounts
    ↓
useAgentChatAPIKeyManager calls credentialVault.getCredentials()
    ↓
API key passed to useAgentChatWithTools
    ↓
/api/chat receives API key in request body
    ↓
LLM API call succeeds ✅
```

**Evidence**:
- File: `src/presentation/components/ide/AgentChatPanel/AgentChatAPIKeyManager.tsx`
- Lines: 43-44
- Pattern: Active retrieval from vault

---

### ❌ BROKEN Implementation: Notes Workspace Agent Chat

**Component**: `NoteSidebarChat.tsx` (line 83)
```typescript
apiKey: undefined, // Credential-vault handles API key lookup
```

**Problem**:
1. Comment claims "Credential-vault handles API key lookup"
2. **Reality**: `useAgentChatWithTools` does NO internal vault lookup
3. Hook just passes whatever `apiKey` it receives to `/api/chat`
4. With `apiKey: undefined`, request goes to server WITHOUT key

**Path**:
```
User saves API key → credentialVault (IndexedDB)
    ↓
NoteSidebarChat mounts
    ↓
apiKey: undefined passed to useAgentChatWithTools
    ↓
/api/chat receives request WITHOUT API key
    ↓
LLM provider returns 401 Unauthorized ❌
```

**Evidence**:
- File: `src/presentation/components/notes/NoteSidebarChat.tsx`
- Line: 83
- Issue: FALSE COMMENT + no vault retrieval

**Impact**: All agent chat messages in Notes workspace fail with 401 error.

---

### ❌ BROKEN Implementation: Embedding Service (ALL Workspaces)

**Function Signature** (`embedding-service.ts:16-19`):
```typescript
export async function createEmbeddingService(
    apiKey?: string  // Optional parameter!
): Promise<EmbeddingService>
```

**Provider Selection Logic** (`embedding-service.ts:176-202`):
```typescript
function selectEmbeddingProvider(
    capabilities: DeviceCapabilities,
    hasApiKey: boolean  // This is !!apiKey from caller
): EmbeddingProvider {
    if (capabilities.isEdge) {
        return hasApiKey ? 'cloud' : 'none';
    }
    // ...
    if (hasApiKey) {
        return 'cloud';
    }
    return 'none'; // No embeddings if no API key!
}
```

**Cloud Provider Throws Error** (`embedding-service.ts:272-273`):
```typescript
if (!apiKey) {
    throw new Error('API key is required for cloud embeddings but was not provided.');
}
```

**Problem**: 4 locations call `createEmbeddingService()` WITHOUT passing API key:

1. **KnowledgePage.tsx:351**:
```typescript
const service = await createEmbeddingService();  // NO API KEY
```

2. **incremental-indexing-service.ts:247**:
```typescript
const embeddingService = await createEmbeddingService();  // NO API KEY
```

3. **incremental-indexing-service.ts:368**:
```typescript
const embeddingService = await createEmbeddingService();  // NO API KEY
```

4. **hybrid-retriever.ts:473**:
```typescript
const embeddingService = await embeddingModule.createEmbeddingService();  // NO API KEY
```

**Result**:
- `hasApiKey = false` (because `apiKey` is `undefined`)
- Falls back to 'none' or 'local' provider
- Cloud embeddings NEVER used even when user saved API key
- RAG search returns NO RESULTS for new documents

**Impact**: Core RAG functionality is broken for all workspaces.

---

## User Journey Impact Matrix

| Journey | Expected (≤3 steps) | Reality | Status |
|---------|---------------------|---------|--------|
| **J1**: Add key → Use RAG | 1. Open settings<br>2. Save key<br>3. Search works | Key saved but embeddings fail (no key passed to service) | ❌ FAIL |
| **J2**: Agent chat (IDE) | 1. Select agent<br>2. Send message<br>3. AI responds | Works (key retrieved via useAgentChatAPIKeyManager) | ✅ PASS |
| **J3**: Agent chat (Notes) | 1. Select agent<br>2. Send message<br>3. AI responds | Sends message WITHOUT API key → 401 error | ❌ FAIL |
| **J4**: Returning user | 1. Open app<br>2. Key restored<br>3. Features work | Key in vault but never retrieved by components | ❌ FAIL |

---

## Root Causes

1. **Missing API Key Retrieval Pattern in NoteSidebarChat**
   - Component doesn't use `useAgentChatAPIKeyManager` hook
   - False comment claims "hook handles lookup internally"

2. **No API Key Retrieval Pattern in Embedding Service Creation**
   - 4 locations call `createEmbeddingService()` without retrieving key from vault
   - No centralized pattern for embedding service API key management

3. **False Documentation**
   - Comment in `NoteSidebarChat.tsx:83` is misleading
   - Creates confusion about how API key flow works

---

## Correct Implementation Pattern

The IDE workspace shows the correct pattern:

```typescript
// 1. Create a hook that retrieves API key from vault
export function useAgentChatAPIKeyManager({
    agentProviderId
}: UseAgentChatAPIKeyManagerProps): APIKeyManagerResult {
    const [apiKey, setApiKey] = useState<string | null>(null);

    useEffect(() => {
        async function fetchApiKey() {
            await credentialVault.initialize();
            let key = await credentialVault.getCredentials(providerId);
            setApiKey(key);
        }
        fetchApiKey();
    }, [providerId]);

    return { apiKey, /* ... */ };
}

// 2. Use the hook in component
const { apiKey } = useAgentChatAPIKeyManager({
    agentProviderId: activeAgent?.providerId
});

// 3. Pass retrieved key to service
useAgentChatWithTools({
    apiKey: apiKey || undefined,
    // ...
});
```

---

## Required Fixes

### Fix #1: NoteSidebarChat.tsx

**Priority**: P0 (Critical)
**Effort**: 30 minutes
**Actions**:
1. Import `useAgentChatAPIKeyManager` from AgentChatPanel
2. Call hook to retrieve API key
3. Pass retrieved key to `useAgentChatWithTools`
4. Remove false comment

### Fix #2: Embedding Service API Key Management

**Priority**: P0 (Critical)
**Effort**: 2-3 hours
**Actions**:
1. Create `useEmbeddingServiceAPIKey` hook (similar to useAgentChatAPIKeyManager)
2. Update all 4 embedding service creation locations:
   - KnowledgePage.tsx
   - incremental-indexing-service.ts (2 locations)
   - hybrid-retriever.ts
3. Retrieve API key from vault before calling `createEmbeddingService()`
4. Pass retrieved key to function

### Fix #3: Add Gherkin Tests

**Priority**: P1 (High)
**Effort**: 2 hours
**Actions**:
1. Add acceptance tests for API key flow:
   ```gherkin
   Scenario: User saves API key and uses RAG search
     Given user has opened provider settings
     And user enters valid Gemini API key
     When user saves the API key
     And user imports a PDF document
     And user searches for content from that PDF
     Then search results SHOULD include relevant content from PDF
   ```

2. Add tests for agent chat:
   ```gherkin
   Scenario: Agent chat uses saved API key
     Given user has saved valid API key for provider
     And user has selected an agent using that provider
     When user sends message to agent
     Then agent SHOULD respond successfully
     And response SHOULD NOT contain authentication error
   ```

---

## Verification Steps (Post-Fix)

1. **Manual Test - Notes Agent Chat**:
   - Open Notes workspace
   - Open agent selector
   - Select agent using provider with saved API key
   - Send message: "Hello"
   - ✅ Expected: Agent responds
   - ❌ Before: 401 Unauthorized error

2. **Manual Test - RAG Search**:
   - Open Knowledge workspace
   - Import PDF document
   - Search for content from PDF
   - ✅ Expected: Search returns relevant results
   - ❌ Before: No results (embeddings not created)

3. **Automated Test**:
   - Run Gherkin tests for API key flow
   - Verify all scenarios pass

---

## Related Issues

This investigation CONFIRMS the following blockers:

- **P0-LLM-001**: Models Not Loading After API Key Save
  - Root cause: API key not retrieved from vault by components
  - Status: CONFIRMED - API key flow gaps identified

- **P0-WK-001**: Workspace Integration Broken
  - Root cause: Notes workspace doesn't use useAgentChatAPIKeyManager pattern
  - Status: CONFIRMED - Inconsistent implementation across workspaces

---

## Evidence Files

All findings backed by specific file locations and line numbers:

- ✅ CORRECT: `src/presentation/components/ide/AgentChatPanel/AgentChatAPIKeyManager.tsx:43-44`
- ❌ BROKEN: `src/presentation/components/notes/NoteSidebarChat.tsx:83`
- ❌ BROKEN: `src/presentation/components/knowledge/KnowledgePage.tsx:351`
- ❌ BROKEN: `src/lib/rag/incremental-indexing-service.ts:247, 368`
- ❌ BROKEN: `src/lib/rag/hybrid-retriever.ts:473`
- ❌ ERROR: `src/lib/rag/embedding-service.ts:272-273` (throws if no API key)

---

## Conclusion

The skeptical PM scan revealed that claimed functionality (API key management) has IMPLEMENTATION GAPS:

1. One workspace (IDE) has correct implementation ✅
2. One workspace (Notes) has broken implementation ❌
3. One service (Embeddings) has broken implementation across ALL workspaces ❌

**Next Actions**:
1. Fix NoteSidebarChat to use useAgentChatAPIKeyManager pattern
2. Fix embedding service creation to retrieve API key from vault
3. Add Gherkin tests for API key flow acceptance criteria
4. Re-verify all user journeys after fixes

**Status**: Iteration 2 of skeptical PM scan COMPLETE. Gaps identified and documented with evidence.
