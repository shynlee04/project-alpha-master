# Feature Group 1: BYOK Vault System - Deep Analysis

**Shard ID**: ARCH-SHARD-03-01
**Parent**: ARCH-REMEDIATION-INDEX-2026-01-14
**Focus**: Core Centralized Group #1 - BYOK (Bring Your Own Key)
**Status**: COMPLETE - DEEP ANALYSIS

---

## 1. Architecture → BYOK Mapping

### 1.1 Architecture Groups Involved

| Architecture Group | Files | Issue Severity | Impact on BYOK |
|--------------------|-------|----------------|----------------|
| **A: State & Stores** | `provider-credentials-slice.ts:396` | P0 | God store mixes CRUD + migration + vault |
| **D: API & Data Flow** | `credential-vault.ts`, `credential-encryption.ts` | ✅ WORKING | Core encryption is solid |
| **E: Schema & Contracts** | `credential-types.ts` | P1 | Type definitions need review |
| **F: Layers & Boundaries** | `domain/types/llm/provider-types.ts` | P1 | Provider config types may leak vault concerns |

### 1.2 Current BYOK Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BYOK VAULT SYSTEM                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐   │
│  │ ProviderService │────▶│ CredentialVault │────▶│ CredentialStorage│  │
│  │ (App Layer)     │     │ (AES-256-GCM)   │     │ (Dexie)         │  │
│  └────────┬────────┘     └────────┬────────┘     └────────┬────────┘   │
│           │                       │                        │             │
│           │                       │                        │             │
│           ▼                       ▼                        ▼             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Provider Credentials Slice                    │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │   │
│  │  │ API Key CRUD│  │ Migration   │  │ Vault Integration       │  │   │
│  │  │ (should be) │  │ (shouldn't) │  │ (should be)             │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘  │   │
│  │                                                                      │   │
│  │  ⚠️ CURRENT STATE: All 3 concerns mixed in ONE 396-line slice    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐   │
│  │ Gemini Adapter  │     │ OpenAI Adapter  │     │ Anthropic Adapt │   │
│  │ (Domain)        │     │ (Domain)        │     │ (Domain)        │   │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Issues Found (BYOK Specific)

| Issue | Location | Severity | Root Cause |
|-------|----------|----------|------------|
| **God credentials slice** | `provider-credentials-slice.ts:396` | P0 | 3 concerns mixed: CRUD + Migration + Vault |
| **Migration in production** | `migrate-api-keys-to-vault.ts:388` | P1 | Legacy code not cleaned up |
| **Type safety gaps** | `provider-types.ts` | P1 | `Record<string, unknown>` in provider config |
| **Duplicate Dexie** | `credential-storage.ts` vs main DB | P0 | Credentials in separate storage |

---

## 2. Feature Behavior Analysis

### 2.1 BYOK Core Flows

#### Flow 1: User Adds API Key

```
User Action                    System Response              Architecture Path
────────────────────────────────────────────────────────────────────────────
1. Opens Settings          →   Show provider list          Presentation
2. Clicks "Add Key"        →   Open API key input form     Presentation
3. Enters key + provider   →   Validate format             Domain (Zod?)
4. Clicks "Save"           →   Encrypt key                 CredentialEncryption
                              → Store in Dexie             CredentialStorage
                              → Update store               ProviderCredentialsSlice
5. Show success            →   Toast notification          Presentation
```

**Current Issues**:
- Step 3: No Zod validation found (P1)
- Step 4: Migration logic may trigger unexpectedly (P1)
- Step 4: Dual storage (credentials + main DB) causes sync issues (P0)

#### Flow 2: Agent Uses API Key

```
Agent Action                   System Response              Architecture Path
────────────────────────────────────────────────────────────────────────────
1. Agent needs LLM            →   Request provider config    AgentService
2. Vault check                →   Get decrypted key          CredentialVault
3. Return to agent            →   Inject key into adapter    ProviderAdapterFactory
4. Execute LLM call           →   Use key for auth           External API
```

**Current Issues**:
- Step 2: No "vault ready" check before access (P0) - causes silent failures
- Step 3: Adapter caching may return stale keys (P1)
- Step 4: No key rotation handling (P2)

#### Flow 3: Key Management (Edit/Delete)

```
User Action                    System Response              Architecture Path
────────────────────────────────────────────────────────────────────────────
1. Opens Settings          →   Show key status             Presentation
2. Clicks "Edit"           →   Load key (decrypted view)   CredentialVault
3. Modifies key            →   Re-encrypt                  CredentialEncryption
                              → Update storage              CredentialStorage
                              → Invalidate cache            ProviderAdapterFactory
4. Clicks "Delete"         →   Remove from storage         CredentialStorage
                              → Invalidate cache            ProviderAdapterFactory
5. Show success            →   Toast notification          Presentation
```

**Current Issues**:
- Step 2: Decrypted key visible in memory (P2 - security concern)
- Step 3-4: Cache invalidation not guaranteed (P1)

---

## 3. User Stories - BYOK (DETAILED)

### Story BYOK-01: Secure Key Storage

```
As a security-conscious user
I want my API keys encrypted before storage
So that even if the database is compromised, my keys remain secure

Priority: P0
Estimation: Already implemented (verify only)

Acceptance Criteria:
- [ ] AC1: Keys encrypted with AES-256-GCM before storage
- [ ] AC2: Encryption uses PBKDF2 with 100k iterations
- [ ] AC3: Master password required only at session start
- [ ] AC4: Encrypted data cannot be decrypted without master password
- [ ] AC5: Failed decryption shows clear error (not crash)

Technical Requirements:
- [ ] TR1: `CredentialEncryption.encrypt()` returns `{ iv, ciphertext, tag }`
- [ ] TR2: `CredentialEncryption.decrypt()` validates tag before return
- [ ] TR3: No plaintext keys in Dexie storage

Edge Cases:
- [ ] EC1: User enters wrong master password → Clear error, retry option
- [ ] EC2: Browser storage corrupted → Recovery dialog, no data loss
- [ ] EC3: Multiple browser tabs open → Key synced across tabs
- [ ] EC4: Session timeout → Keys cleared from memory

Combined Uses:
- [ ] CU1: User adds key, then edits it → Edit preserves encryption
- [ ] CU2: Agent uses key while user edits it → Should fail gracefully
- [ ] CU3: User adds key for Provider A, then Provider B → Independent storage

Non-Functional Requirements:
- [ ] NFR1: Encryption latency < 100ms for typical key size
- [ ] NFR2: Memory usage < 10MB for key storage
- [ ] NFR3: Works in private/incognito mode
- [ ] NFR4: No data loss on browser crash

Tests Required:
- [ ] Unit: Encrypt/decrypt round-trip
- [ ] Unit: Wrong password rejection
- [ ] Integration: Key storage and retrieval
- [ ] E2E: User adds and uses key in chat
```

### Story BYOK-02: Provider Key Management

```
As a user using multiple LLM providers
I want to manage separate API keys for each provider
So that I can use Gemini for some tasks and Claude for others

Priority: P0
Estimation: 1 day

Acceptance Criteria:
- [ ] AC1: Can add keys for any supported provider (Google, OpenAI, Anthropic, OpenRouter)
- [ ] AC2: Each provider key stored independently
- [ ] AC3: Can view which providers have keys configured
- [ ] AC4: Can edit key for a provider without affecting others
- [ ] AC5: Can delete key for a provider without affecting others

Technical Requirements:
- [ ] TR1: `ProviderCredentialsSlice` methods: `addKey()`, `updateKey()`, `deleteKey()`
- [ ] TR2: Each key stored with `providerId` compound index
- [ ] TR3: Attempt to use unset provider shows clear UI message

Edge Cases:
- [ ] EC1: Provider no longer supported → Migration path or clear error
- [ ] EC2: Key format changed (e.g., OpenAI new format) → Validation update
- [ ] EC3: Multiple keys for same provider → Last one wins, clear indication
- [ ] EC4: Provider API changes → Graceful degradation with user notification

Combined Uses:
- [ ] CU1: Set up keys for all providers, then use in different workspaces
- [ ] CU2: Edit key while active conversation using old key → Prompt to restart
- [ ] CU3: Delete key while agent mid-generation → Handle gracefully

Non-Functional Requirements:
- [ ] NFR1: Key validation < 50ms
- [ ] NFR2: Provider list renders < 100ms
- [ ] NFR3: Clear visual indication of configured vs unconfigured providers

Tests Required:
- [ ] Unit: CRUD operations for single provider
- [ ] Unit: Multi-provider isolation
- [ ] Integration: Provider selection uses correct key
- [ ] E2E: Configure multiple providers, use each
```

### Story BYOK-03: BYOK + Project Space Integration

```
As a user working across different project spaces
I want my API keys to be available in all spaces
So that I can use AI features regardless of which project I'm in

Priority: P1
Estimation: 2 days (refactoring)

Acceptance Criteria:
- [ ] AC1: Keys available across IDE, Notes, Knowledge, Study workspaces
- [ ] AC2: No need to re-enter keys when switching projects
- [ ] AC3: Keys persist across browser sessions
- [ ] AC4: Clear indicator when key is being used in current context

Technical Requirements:
- [ ] TR1: Keys stored in centralized credential vault (not per-workspace)
- [ ] TR2: Workspace context can access vault without additional auth
- [ ] TR3: Audit log tracks which workspace used which key

Edge Cases:
- [ ] EC1: Workspace A uses key while Workspace B deletes it → Conflict resolution
- [ ] EC2: Browser storage quota exceeded → Clear message, cleanup options
- [ ] EC3: User wants workspace-specific keys → Future feature, design for extension

Combined Uses:
- [ ] CU1: Configure key in IDE, use in Notes AI commands
- [ ] CU2: Switch project while agent mid-generation → Continue using same key
- [ ] CU3: Open multiple workspaces → Keys loaded once, shared in memory

Non-Functional Requirements:
- [ ] NFR1: Key availability check < 10ms
- [ ] NFR2: No memory duplication of keys across workspaces
- [ ] NFR3: Consistent behavior across all workspace types

Tests Required:
- [ ] Integration: Key accessible from all workspaces
- [ ] Integration: Switch workspace, key still available
- [ ] E2E: Use AI in IDE, switch to Notes, use AI again
```

### Story BYOK-04: Key Security & Audit

```
As a security-conscious user or team lead
I want to see how my keys are being used
So that I can detect unauthorized access or usage patterns

Priority: P2
Estimation: 3 days (deferred to Phase 4)

Acceptance Criteria:
- [ ] AC1: Audit log shows when each key was last used
- [ ] AC2: Audit log shows which provider/model was called
- [ ] AC3: Can export audit log for review
- [ ] AC4: Suspicious patterns flagged (e.g., unusual volume)

Technical Requirements:
- [ ] TR1: `ToolExecutionLogRecord` includes `providerId` and `modelId`
- [ ] TR2: Audit table in Dexie with compound index on `timestamp`
- [ ] TR3: Export function generates CSV/JSON

Edge Cases:
- [ ] EC1: User has many API calls → Log size management
- [ ] EC2: Sensitive data in logs → Minimal logging, opt-out option
- [ ] EC3: Team scenario → Who made the call? (requires user identity)

Combined Uses:
- [ ] CU1: Audit key usage across multiple projects
- [ ] CU2: Detect which provider being used most
- [ ] CU3: Identify unused keys for cleanup

Non-Functional Requirements:
- [ ] NFR1: Audit log query < 500ms for 10k entries
- [ ] NFR2: Log storage < 10MB by default (configurable)
- [ ] NFR3: Export completes < 5s for 10k entries

Tests Required:
- [ ] Unit: Audit log append
- [ ] Integration: Usage tracking with tool execution
- [ ] E2E: Generate and download audit report

DEFER NOTE: This is NOT MVP. Defer to Phase 4 (Type Safety) after core BYOK works.
```

---

## 4. BYOK → Architecture Conflict Matrix

| BYOK Story | Architecture Issue | Conflict Severity | Fix Required |
|------------|-------------------|-------------------|--------------|
| BYOK-01 | God credentials slice (P0) | BLOCKING | Split slice |
| BYOK-01 | No Zod validation (P1) | HIGH | Add schemas |
| BYOK-02 | Duplicate Dexie storage (P0) | BLOCKING | Consolidate DB |
| BYOK-02 | Migration code in prod (P1) | MEDIUM | Remove dead code |
| BYOK-03 | Keys not shared across workspaces (P1) | HIGH | Add vault access |
| BYOK-04 | Missing `projectId` in tool logs (P0) | BLOCKING | Add field + migration |
| BYOK-ALL | `as any` type casts (P1) | MEDIUM | Remove casts |

---

## 5. File Change Manifest - BYOK

### 5.1 Files to CREATE

| File | Purpose | Lines | Story |
|------|---------|-------|-------|
| `domain/schemas/credential-schemas.ts` | Zod schemas for key validation | 50 | BYOK-02 |
| `infrastructure/persistence/stores/providers/credentials/crud-slice.ts` | Focused CRUD operations | 100 | BYOK-02 |
| `infrastructure/persistence/stores/providers/credentials/vault-slice.ts` | Vault integration only | 80 | BYOK-01 |
| `lib/analytics/credential-audit-log.ts` | Audit trail (Phase 4) | 120 | BYOK-04 |

### 5.2 Files to MODIFY

| File | Change | Lines | Story |
|------|--------|-------|-------|
| `provider-credentials-slice.ts` | Split into CRUD + vault slices, reduce to <200 lines | -200 | BYOK-01, BYOK-02 |
| `credential-types.ts` | Replace Record<string, unknown> with typed interfaces | -30 | BYOK-02 |
| `dexie-db-migrations.ts` | Add migration v21 for tool log projectId | +50 | BYOK-04 |
| `provider-types.ts` | Add validation schemas | +30 | BYOK-02 |

### 5.3 Files to DELETE (After Verification)

| File | Reason | Story |
|------|--------|-------|
| `migrate-api-keys-to-vault.ts` | Migration complete, dead code | BYOK-01 |
| `migration-backup.ts` | Backup of old migration, no longer needed | BYOK-01 |

### 5.4 Files to REFERENCE (No Changes)

| File | Purpose | Status |
|------|---------|--------|
| `credential-vault.ts` | Core encryption - working correctly | ✅ |
| `credential-encryption.ts` | AES-256-GCM - working correctly | ✅ |
| `credential-storage.ts` | Dexie operations - working correctly | ✅ |

---

## 6. BYOK Must-Pass Checklist

### Pre-Refactor Verification

- [ ] Current BYOK flow tested and documented
- [ ] All provider adapters tested with real keys
- [ ] Migration code status verified
- [ ] TypeScript strict mode identifies all issues

### During Refactor

- [ ] New CRUD slice created and tested in isolation
- [ ] New vault slice created and tested in isolation
- [ ] Both slices compose correctly in provider store
- [ ] No regression in encryption/decryption
- [ ] All provider adapters work with refactored store

### Post-Refactor Verification

- [ ] ProviderCredentialsSlice < 300 lines
- [ ] Zero `as any` casts in provider code
- [ ] Zod schemas validate all key input
- [ ] Keys work across all workspaces
- [ ] No console errors in normal operation
- [ ] TypeScript compilation succeeds
- [ ] All existing tests pass

---

## 7. Dependencies & Risks

### Dependencies

| Dependency | Status | Impact |
|------------|--------|--------|
| CredentialVault (encryption) | ✅ Ready | Core dependency |
| Dexie (storage) | ✅ Ready | Core dependency |
| ProviderAdapterFactory | ⚠️ May need update | Changes if key format changes |

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Key loss during refactor** | Low | Critical | Backup before, test read/write, rollback plan |
| **Encryption breaking** | Low | Critical | Test encrypt/decrypt for all key types |
| **Provider adapter incompatibility** | Medium | High | Test each provider after refactor |
| **Migration v21 failure** | Medium | High | Test in staging, have rollback |

### Deferred (Not MVP)

| Item | Reason | When |
|------|--------|------|
| Audit logging (BYOK-04) | Nice to have, not blocking | Phase 4 |
| Workspace-specific keys | Feature request, not arch issue | Future |
| Key rotation | Advanced security, low priority | Future |

---

## 8. Research Notes & Tech Context

### Relevant Documentation

| Source | URL | Relevance |
|--------|-----|-----------|
| Web Crypto API | https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API | Encryption implementation |
| Dexie.js | https://dexie.org/ | Storage implementation |
| Zod | https://zod.dev/ | Validation schemas |

### Tech Stack Notes

```
Current Implementation:
- Encryption: Web Crypto API (AES-256-GCM)
- Key Derivation: PBKDF2 (100k iterations)
- Storage: Dexie.js (IndexedDB)
- Validation: Custom (need Zod)

Recommended Changes:
- Add Zod for input validation
- Consolidate Dexie databases
- Split provider credentials slice
```

---

*Back to [ARCH-INDEX.md](./ARCH-INDEX.md)*
*Next: [shard-03-02 - Project Space Boundaries](./shard-03-02-project-space.md)*
