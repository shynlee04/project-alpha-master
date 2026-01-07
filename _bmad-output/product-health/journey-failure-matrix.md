# User Journey Failure Matrix - Iteration 1

**Assessment Date**: 2026-01-07
**Module**: Product Health Skeptical Scan
**Status**: Iteration 1 of 5 (Journey 1: First-Time User)
**Assessor**: BMAD Skeptical PM

---

## Journey 1: First-Time User (Gemini Key → RAG)

**Core Promise**: A normal user can paste a Gemini API key and immediately use RAG over a personal collection of notes/documents with minimal friction and no surprises.

### Journey Map

| Step | User Action | Expected Result | Actual Observed | Status |
|------|-------------|-----------------|-----------------|--------|
| 1.1 | Open app (first load) | App loads without errors, no blocking modal | **UNKNOWN** - Need runtime test | ⏳ |
| 1.2 | Navigate to Settings → Providers | Provider list visible, Gemini available | **CODE: OK** - `INITIAL_PROVIDERS` includes 'google' at `provider-crud-slice.ts:64-73` | ✅ |
| 1.3 | Click "Configure" on Gemini | ProviderConfigDialog opens | **CODE: OK** - Dialog renders at `ProviderConfigDialog.tsx:44` | ✅ |
| 1.4 | Enter Gemini API key | Input field accepts key, masked | **CODE: OK** - `ApiKeyInputSection.tsx:182-205` with password masking | ✅ |
| 1.5 | Click "Save" | Key encrypted, stored in vault | **CODE: OK** - `credentialVault.storeCredentials()` at `credential-vault.ts:384-406` with AES-256-GCM encryption | ✅ |
| 1.6 | System validates key | Connection tested, models fetched | **CODE: OK** - `fetchModels()` called at `ProviderConfigDialog.tsx:125` | ✅ |
| 1.7 | Navigate to Knowledge workspace | Workspace loads, RAG available | **CODE: OK** - `UnifiedWorkspaceProvider` handles switching | ⏳ |
| 1.8 | Create/ingest first note or source | Source saved, indexing triggered | **CODE: OK** - `IncrementalIndexingService.processTask()` at `incremental-indexing-service.ts:149` | ⏳ |
| 1.9 | Ask RAG question | Query returns results with citations | **CODE: OK** - `HybridRetriever` with citation support | ⏳ |

---

## P0/P1 Gap Analysis (Journey 1)

### P0 - Critical Blockers (50% product health hit per incident)

| ID | Gap | Evidence | Severity | Fix Proposal |
|----|-----|----------|----------|--------------|
| **P0-001** | **SSR Guard Bypass Risk** | `credentialVault.initialize()` at `credential-vault.ts:158-170` checks for SSR but `getCredentials()` at line 416-421 returns null during SSR. **If vault not initialized before RAG query, key retrieval fails silently.** | P0 | Add `await credentialVault.initialize()` at start of any RAG query path, or lazy-init guard that throws clear error |
| **P0-002** | **Connection Test Hangs on Invalid Key** | `ProviderAdapterFactory.testConnection()` at `provider-adapter.ts:50` - no timeout handling. If API returns 401, fetch may hang indefinitely. | P0 | Add 10-second timeout to connection test, show spinner with countdown |
| **P0-003** | **No Key Format Validation** | `ApiKeyInputSection.tsx` accepts any string. Gemini keys have specific format (`AIza...`). No validation before storage. | P1 | Add regex validation for known provider key formats, show "key looks invalid" warning |

### P1 - Major Friction

| ID | Gap | Evidence | Severity | Fix Proposal |
|----|-----|----------|----------|--------------|
| **P1-001** | **Missing Progress Indicator During Model Fetch** | `ProviderConfigDialog.tsx:123-141` shows loading state but no progress feedback. User sees spinner for unknown duration. | P1 | Show "Fetching models..." with estimated time or spinner animation |
| **P1-002** | **No RAG Index Status on First Load** | `rag-index-slice.ts:19-27` starts at `indexStatus: 'idle'`. No guidance to user that they need to add sources. | P1 | Show "Add your first source to start RAG" empty state in Knowledge workspace |
| **P1-003** | **Credential Vault Error is Cryptic** | `credentialVault.storeCredentials()` throws "Vault not initialized" at line 392. User sees generic error. | P1 | Wrap in user-friendly message: "Encryption system needs refresh - please reload" |

---

## Spec-Driven Acceptance Checks (Journey 1)

### P0-001: SSR Guard Bypass Risk

**Given** a user has saved a valid Gemini API key
**And** the app is rendering on the server (SSR)
**When** the RAG system tries to retrieve credentials for a query
**Then** the system should either:
- Return a clear "Credentials not available during initial load" message
- Automatically retry client-side without silent failure
**And** the user should NOT see "Key not found" or silent RAG failure

**Verification**:
```typescript
// Test pseudo-code
await page.goto('/knowledge');
await expectRAGToWork(); // Should not error on first query
```

### P0-002: Connection Test Timeout

**Given** a user enters an invalid API key
**When** they click "Save"
**Then** within 10 seconds, the system should:
- Show a loading spinner with status "Testing connection..."
- Either succeed with models loaded OR fail with specific error
- NOT hang indefinitely

**Verification**:
```typescript
// Test pseudo-code
await enterInvalidKey();
await saveKey();
await expectTimeoutOrError(10000); // Should not hang >10s
```

### P0-003: Key Format Validation

**Given** a user enters a key that doesn't match provider's expected format
**When** they click "Save"
**Then** the system should:
- Show warning: "This key doesn't look like a valid Gemini API key (should start with AIza)"
- Still allow saving if user confirms

**Verification**:
```typescript
await enterMalformedKey();
await saveKey();
await expectWarningDialog(); // Should show format warning
```

---

## RAG Convenience Scorecard (Journey 1)

### Scoring: 0 (Poor) → 1 (OK) → 2 (Excellent)

| Stage | Score | Notes |
|-------|-------|-------|
| **1. Setup Friction** | 1/2 | Key saved easily but no validation feedback |
| **2. Clarity of Next Action** | 1/2 | After key saved, user must discover Knowledge workspace |
| **3. Performance Perception** | 1/2 | Model fetch spinner, no progress indication |
| **4. Trust (Citations)** | 2/2 | Citation system exists (`citation-formatter.ts`) |
| **5. Recovery (Failure)** | 0/2 | No clear recovery path if key invalid or vault fails |
| **TOTAL** | **5/10** | **Major gaps in error handling and user guidance** |

---

## Code Evidence Summary

### Key Files Analyzed

| File | Lines | Purpose | Health |
|------|-------|---------|--------|
| `src/presentation/components/agent/ProviderConfigDialog.tsx` | 361 | Provider config UI | 7/10 |
| `src/presentation/components/agent/ApiKeyInputSection.tsx` | 224 | Key input with testing | 8/10 |
| `src/lib/agent/providers/credential-vault.ts` | 529 | Encrypted key storage | 8/10 (SSR risk) |
| `src/infrastructure/persistence/stores/providers/provider-crud-slice.ts` | 233 | Provider CRUD | 8/10 |
| `src/lib/agent/providers/provider-adapter.ts` | ~350 | Provider adapters | 7/10 (no timeout) |
| `src/lib/rag/incremental-indexing-service.ts` | ~500 | RAG indexing | 8/10 |
| `src/infrastructure/persistence/stores/rag/rag-index-slice.ts` | 119 | Index state | 7/10 |
| `src/infrastructure/persistence/dexie-db.ts` | 1117 | IndexedDB persistence | 9/10 |

### Critical Pattern Issues

1. **Async Initialization Without Await**: `credentialVault.initialize()` is called but many code paths don't await it
2. **No Timeout on External Calls**: API calls to providers have no timeout handling
3. **Missing Validation**: Key format validation is absent
4. **Cryptic Errors**: Error messages leak implementation details

---

## Next Steps

**Iteration 2**: Journey 2 - Returning User (Persistence & Hydration)
- Audit `dexie-db.ts` hydration flow
- Test key persistence after reload
- Verify workspace state restoration
- Check for race conditions during hydration

**Dependencies**: None - can proceed independently

---

*Generated by BMAD Skeptical PM Assessment*
*Document ID: product-health-journey-failure-matrix-001*
