# User Journey Failure Matrix - Journey 2: Returning User

**Assessment Date**: 2026-01-07
**Module**: Product Health Skeptical Scan
**Status**: Iteration 2 of 5 (Journey 2: Returning User)
**Assessor**: BMAD Skeptical PM

---

## Journey 2: Returning User (Key Persistence)

**Core Promise**: A returning user can reopen the app and continue where they left off - key persists, workspace restores, RAG index available.

### Journey Map

| Step | User Action | Expected Result | Actual Observed | Status |
|------|-------------|-----------------|-----------------|--------|
| 2.1 | Close and reopen app | App loads, no errors | **CODE: PARTIAL** - `dexie-db.ts:223-236` handles SSR guard | ⏳ |
| 2.2 | Verify key persists | Key loads without re-entry | **CODE: OK** - `credentialVault.getCredentials()` at `credential-vault.ts:416-449` | ⏳ |
| 2.3 | Workspace loads | All 4 workspaces available | **CODE: OK** - `workspace-store.ts:83` initializes with defaults | ✅ |
| 2.4 | Last workspace restored | Active workspace matches previous session | **CODE: OK** - `workspace-store.ts:175-178` persists `currentWorkspace` | ✅ |
| 2.5 | RAG index restored | Indexed documents available | **CODE: PARTIAL** - `rag-index-slice.ts:52-81` loads metadata | ⏳ |
| 2.6 | Last agent restored | Previously selected agent active | **CODE: PARTIAL** - `agent-selection-store` not analyzed | ⏳ |

---

## P0/P1 Gap Analysis (Journey 2)

### P0 - Critical Blockers (50% product health hit per incident)

| ID | Gap | Evidence | Severity | Fix Proposal |
|----|-----|----------|----------|--------------|
| **P0-004** | **Hydration Race Condition** | `useAppStore` at `use-app-store.ts:63` and `useWorkspaceStore` at `workspace-store.ts:79` hydrate independently. If RAG query runs before `credentialVault` initializes, keys unavailable. | P0 | Add hydration dependency - RAG store waits for credential vault AND app store hydration |
| **P0-005** | **IndexedDB Corruption Not Handled** | `dexie-db.ts:231` catches open errors but doesn't attempt recovery. If DB corrupted, user loses all data. | P0 | Add automatic DB recovery: delete and recreate on corruption |
| **P0-006** | **Model Cache Lost on Reload** | `use-app-store.ts:127-131` explicitly NOT persist `availableModels` or `modelCache`. User must re-fetch models every reload. | P1 | Cache models in IndexedDB, fetch only if stale (>24h) |

### P1 - Major Friction

| ID | Gap | Evidence | Severity | Fix Proposal |
|----|-----|----------|----------|--------------|
| **P1-004** | **No Loading State During Hydration** | Both `use-app-store` and `useWorkspaceStore` have `_hasHydrated` flag but components don't use it. Users see broken UI before data loads. | P1 | Add `useAppStoreHydration()` check in root layout, show skeleton until hydrated |
| **P1-005** | **Agent Re-selection Logic Missing** | `workspace-transition-manager.ts:102-118` checks if current agent available but `agent-selection-store` may not persist active agent per workspace. | P1 | Persist `activeAgentId` per workspace in agent-selection-store |
| **P1-006** | **RAG Index Metadata Not Persisted** | `rag-index-slice.ts:52-81` loads metadata from Orama but no caching. If Orama index corrupted, no recovery. | P1 | Add `indexMetadata` to Dexie for quick restore, implement index repair |

---

## Spec-Driven Acceptance Checks (Journey 2)

### P0-004: Hydration Race Condition

**Given** a user previously configured Gemini with valid key
**When** they reopen the app and immediately navigate to Knowledge workspace
**Then** the system should:
1. Show loading state while hydrating (≤500ms)
2. Ensure credential vault is initialized before any RAG query
3. Show error only if hydration fails after 5 seconds

**AC-004-1: Credential Vault Pre-Initialization**
```gherkin
Given the app is starting (client-side hydration)
When the root layout renders
Then the credential vault should be initialized immediately
And any RAG component should wait for vault ready state
```

**AC-004-2: RAG Component Guard**
```gherkin
Given a user navigates to Knowledge workspace
When the RAG interface attempts to query
If credentials are not yet loaded
Then show "Loading credentials..." placeholder
And retry automatically after 100ms
And not throw error or return empty results
```

### P0-005: IndexedDB Corruption Recovery

**Given** the IndexedDB database is corrupted (version mismatch, disk full, etc.)
**When** the app tries to open the database
Then the system should:
1. Detect corruption (open error)
2. Attempt automatic recovery (delete and recreate)
3. Notify user: "Database was recovered. Some settings may have been reset."
4. NOT crash or show generic error

**AC-005-1: Corruption Detection**
```gherkin
Given IndexedDB is corrupted
When getDb() is called
Then catch the error and check if it's corruption-related
If corruption detected, trigger recovery flow
```

**AC-005-2: Automatic Recovery**
```gherkin
Given corruption detected
When recovery flow triggers
Then:
1. Delete corrupted database
2. Create new database with same schema
3. Restore from backup if available
4. Notify user of recovery
```

### P0-006: Model Cache Persistence

**Given** a user previously fetched models for a provider
**When** they reload the page
Then the cached models should be available immediately
And only re-fetch if cache is older than 24 hours

**AC-006-1: Cache with TTL**
```gherkin
Given models were fetched at timestamp T
When app reloads at T+1 hour
Then use cached models without re-fetching
When app reloads at T+25 hours
Then re-fetch models from provider
And update cache timestamp
```

---

## RAG Convenience Scorecard (Journey 2)

### Scoring: 0 (Poor) → 1 (OK) → 2 (Excellent)

| Stage | Score | Notes |
|-------|-------|-------|
| **1. Resume After Close** | 1/2 | Key persists but model cache lost |
| **2. Workspace Restoration** | 2/2 | Workspace persists correctly |
| **3. Hydration Feedback** | 0/2 | No loading state during hydration |
| **4. State Consistency** | 1/2 | Agent selection may not persist per workspace |
| **5. Recovery** | 0/2 | No corruption recovery, cryptic errors |
| **TOTAL** | **4/10** | **Major gaps in hydration UX and recovery** |

---

## Code Evidence Summary

### Key Files Analyzed

| File | Lines | Purpose | Health |
|------|-------|---------|--------|
| `src/infrastructure/persistence/stores/use-app-store.ts` | ~250 | Main app store with hydration | 7/10 |
| `src/lib/workspace/workspace-store.ts` | 216 | Workspace state with persistence | 8/10 |
| `src/lib/workspace/workspace-transition-manager.ts` | ~250 | Workspace transition coordination | 8/10 |
| `src/infrastructure/persistence/dexie-db.ts` | 1117 | IndexedDB with SSR guard | 8/10 (no recovery) |
| `src/infrastructure/persistence/stores/rag/rag-index-slice.ts` | 119 | RAG index state | 7/10 |

### Critical Pattern Issues

1. **Independent Hydration**: Multiple stores hydrate independently, causing race conditions
2. **No Loading States**: `_hasHydrated` flag exists but not used in UI
3. **No Corruption Recovery**: IndexedDB errors are caught but not recovered
4. **Model Cache Not Persisted**: Models re-fetched on every load

---

## Next Steps

**Iteration 3**: Journey 3 - Invalid/Expired Key Recovery
- Audit error handling in provider adapters
- Test 401/403 error flows
- Verify error messages are user-friendly

**Dependencies**: None - can proceed independently

---

*Generated by BMAD Skeptical PM Assessment*
*Document ID: product-health-journey-2-failure-matrix-001*
