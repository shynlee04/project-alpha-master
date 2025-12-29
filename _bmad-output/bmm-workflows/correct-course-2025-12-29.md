# Correct-Course Workflow - Phase 1 Remediation

**Date:** 2025-12-29
**Trigger:** Ralph Loop Validation + Comprehensive 8-Domain Validation Sweep
**Status:** IN_PROGRESS - Remediation Cycle 1
**Phase:** Sprint 27B

---

## Validation Summary

### Original Ralph Loop Validation (Trigger)

| Metric | Value |
|--------|-------|
| Overall Health Score | 67/100 |
| CRITICAL Issues | 4 |
| HIGH Issues | 12 |
| MEDIUM Issues | 24 |
| LOW Issues | 18 |
| Phase 2 Ready | ❌ NO |

### Comprehensive Validation Sweep (Dec 29) - NEW FINDINGS

| Metric | Value |
|--------|-------|
| Overall Architecture Compliance | 76/100 |
| Security Posture | 5.0/10 (D Grade) |
| CRITICAL Issues | 8 |
| HIGH Issues | 18 |
| MEDIUM Issues | 45 |
| Phase 2 Ready | ❌ NO |

### Current Sprint Status

| Sprint | Status | Stories Complete |
|--------|--------|------------------|
| Sprint 27A | ✅ DONE | 4/4 (100%) |
| Sprint 27B | 🔄 IN_PROGRESS | 6/11 (55%) |
| Sprint 28 | ⏳ PENDING | 0/5 (0%) |

---

## Violation Catalog

### CRITICAL (Must Fix Before Any Further Development) - 8 Total

| ID | Domain | Issue | Location | Remediation | Status |
|----|--------|-------|----------|-------------|--------|
| CRIT-001 | 6 | Hook violation: `useTranslation()` in utility | `error-handling.ts:41` | Extract translation keys | ✅ FIXED |
| CRIT-002 | 6 | No file size validation (>10MB warning) | `sync-manager.ts` | Add MAX_FILE_SIZE check | ✅ FIXED |
| CRIT-003 | 8 | Master key in localStorage (XSS accessible) | `credential-vault.ts:17` | Move to IndexedDB/WebAuthn | 🔄 PARTIAL |
| CRIT-004 | 8 | No command injection protection | `execute-command-tool.ts` | Add allowlist/escape | ✅ FIXED |
| CRIT-NEW-005 | 8 | XOR "obfuscation" NOT encryption in vault | `credential-vault.ts` | Use AES-GCM only | ⏳ PENDING |
| CRIT-NEW-006 | 1 | Duplicate useSyncStatusStore definitions | Multiple stores | Consolidate single source | ⏳ PENDING |
| CRIT-NEW-007 | 4 | ToolPermissionManager.checkPermission() unwired | Tool execution flow | Wire to facade layer | ⏳ PENDING |
| CRIT-NEW-008 | 6 | Missing shell session timeout (30min max) | `terminal-tools-impl.ts` | Add timeout enforcement | ⏳ PENDING |

### HIGH (Must Fix Before Phase 2) - 18 Total

| ID | Domain | Issue | Location | Remediation | Status |
|----|--------|-------|----------|-------------|--------|
| HIGH-001 | 1 | useSyncStatusStore uses localStorage, not Dexie | `sync-status-store.ts` | Migrate to Dexie | ✅ DONE |
| HIGH-002 | 1 | Only 3/5 agent prompt layers implemented | `prompt-composer.ts` | Document deferred | ⏳ PENDING |
| HIGH-003 | 3 | Epic 4 Story 4.4 (Error Handling) incomplete | Tools | Complete retry queue | 🔄 IN_PROGRESS |
| HIGH-004 | 3 | Epic 4 Story 4.2 partial (file size, depth) | Tools | Complete ACs | 🔄 IN_PROGRESS |
| HIGH-005 | 3 | Epic 2 Story 2.3 (Approval Overlay) missing | Components | Implement UI | ✅ DONE |
| HIGH-006 | 4 | ChatRequest lacks input validation | `chat.ts` | Add Zod schema | ✅ DONE |
| HIGH-007 | 4 | CustomAdapterConfig type optionality mismatch | `provider-adapter.ts` | Fix types | ⏳ PENDING |
| HIGH-008 | 5 | Empty Dexie upgrade functions | `dexie-db.ts` | Add migration logic | ✅ DONE |
| HIGH-009 | 5 | No debouncing on conversation persistence | `conversation-store.ts` | Add debounce | ⏳ PENDING |
| HIGH-010 | 6 | No rollback on partial sync failure | `sync-manager.ts` | Implement rollback | ✅ DONE |
| HIGH-011 | 6 | AbortController not linked to stream | `chat.ts` | Wire signal | ⏳ PENDING |
| HIGH-012 | 6 | Non-retryable errors retried | `error-handling.ts` | Add classification | ✅ DONE |
| HIGH-NEW-013 | 6 | Stale closure in conversation-store.ts | `loadConversation` | Fix closure capture | ⏳ PENDING |
| HIGH-NEW-014 | 5 | No DexieStorage quota error handling | `dexie-storage.ts` | Add quota handling | ⏳ PENDING |
| HIGH-NEW-015 | 6 | Optimistic update missing rollback | Sync operations | Add error recovery | ⏳ PENDING |
| HIGH-NEW-016 | 2 | Path validation missing isAbsolute check | Agent tools | Normalize paths | ⏳ PENDING |
| HIGH-NEW-017 | 6 | Permission re-verification missing | `use-agent-chat-with-tools.ts` | Re-check on action | ⏳ PENDING |
| HIGH-NEW-018 | 5 | Storage key hardcoded (no namespace) | `ide-store.ts` | Add store namespace | ⏳ PENDING |

### MEDIUM (Fix in Remediation Sprints) - 45 Total

| ID | Domain | Issue | Location | Status |
|----|--------|-------|----------|--------|
| MED-001 | 1 | Inconsistent auto-boot in SyncManager | `sync-manager.ts:128` | ⏳ PENDING |
| MED-002 | 1 | Store import path inconsistency | Multiple | ⏳ PENDING |
| MED-003 | 1 | No unified error hierarchy | Scattered | ⏳ PENDING |
| MED-004 | 2 | Path normalization duplicated | Agent tools | ⏳ PENDING |
| MED-005 | 4 | Message role type incomplete | `chat.ts` | ⏳ PENDING |
| MED-006 | 4 | createAdapter no return type | `provider-adapter.ts` | ⏳ PENDING |
| MED-007 | 5 | Subscription fires on every change | `conversation-threads-store.ts` | ⏳ PENDING |
| MED-008 | 6 | Metrics not persisted | `crash-recovery.ts` | ⏳ PENDING |
| MED-009 | 6 | No recursive depth limit | `execute-command-tool.ts` | ⏳ PENDING |
| MED-010 | 7 | Story 5-1 UI not implemented | Components | ⏳ PENDING |
| MED-011 | 7 | Crash recovery: no unsaved work capture | `crash-recovery.ts` | ⏳ PENDING |
| MED-012 | 7 | Performance: no auto-instrumentation | `performance-monitor.ts` | ⏳ PENDING |
| MED-013 | 7 | Hydration: no version checking | `hydration-manager.ts` | ⏳ PENDING |
| MED-014 | 8 | Custom headers without validation | `provider-adapter.ts` | ⏳ PENDING |
| MED-015 | 8 | API key logging | `chat.ts` | ⏳ PENDING |
| MED-016 | 8 | No rate limiting | `chat.ts` | ⏳ PENDING |
| MED-017 | 8 | Custom baseURL no HTTPS validation | `provider-adapter.ts` | ⏳ PENDING |
| MED-018 | 2 | No operation cancellation timeout | Agent tools | ⏳ PENDING |
| MED-019 | 5 | No storage quota warning threshold | DexieStorage | ⏳ PENDING |
| MED-020 | 1 | WebContainer boot timing not tracked | `manager.ts` | ⏳ PENDING |
| MED-021 | 4 | Missing tool schema validation | Tool facades | ⏳ PENDING |
| MED-022 | 6 | Error boundary coverage gaps | Components | ⏳ PENDING |
| MED-023 | 6 | Terminal output stream buffering | `terminal-adapter.ts` | ⏳ PENDING |
| MED-024 | 6 | Process cleanup on unmount | Process manager | ⏳ PENDING |
| MED-025 | 2 | File lock contention handling | `local-fs-adapter.ts` | ⏳ PENDING |

---

## Remediation Stories

### Sprint 27A: Critical Security Fixes ✅ COMPLETE

**Duration:** 3 days
**Goal:** Eliminate CRITICAL issues
**Status:** 4/4 STORIES COMPLETE

| Story | Task | Status | Tests |
|-------|------|--------|-------|
| RC-001 | Fix Hook Violation | ✅ DONE | Verified |
| RC-002 | Add File Size Validation | ✅ DONE | 38 tests |
| RC-003 | Secure Credential Vault | ✅ DONE | 5+ tests |
| RC-004 | Command Injection Protection | ✅ DONE | 49 tests |

### Sprint 27B: High Priority Fixes 🔄 IN PROGRESS

**Duration:** 5 days
**Goal:** Resolve HIGH issues
**Status:** 8/11 STORIES COMPLETE (73%)

| Story | Task | Status | Tests |
|-------|------|--------|-------|
| RC-005 | Migrate SyncStatusStore to Dexie | ✅ DONE | 32 tests |
| RC-006 | Complete Epic 4 Story 4.4 Retry Queue | ✅ DONE | 40 tests |
| RC-007 | Complete Epic 4 Story 4.2 File ACs | ✅ DONE | Advanced ops |
| RC-008 | Implement Approval Overlay | ✅ DONE | UI complete |
| RC-009 | Add ChatRequest Validation | ✅ DONE | Zod schema |
| RC-010 | Fix Type Mismatches | 🔄 PENDING | Build verification |
| RC-011 | Add Dexie Migration Logic | ✅ DONE | 32 tests |
| RC-012 | Debounce Persistence | 🔄 PENDING | Performance tests |
| RC-013 | Implement Rollback | ✅ DONE | 13 tests |
| RC-014 | Wire AbortController | 🔄 PENDING | Integration tests |
| RC-015 | Classify Retryable Errors | ✅ DONE | 47 tests |

#### Remaining Sprint 27B Stories

**RC-006: Complete Epic 4 Story 4.4 Retry Queue**
- **Files:** `src/lib/agent/tools/retry-queue.ts`
- **AC:**
  - [ ] Error classification: RETRYABLE, NON_RETRYABLE, FATAL
  - [ ] Exponential backoff: `delay = min(baseDelay * 2^attempt, maxDelay) + jitter`
  - [ ] Max retry limits per type (RETRYABLE: 3, NON_RETRYABLE: 1, FATAL: 0)
  - [ ] Queue persists to Dexie for session recovery
  - [ ] Event bus emits: `retry-queued`, `retry-attempt`, `retry-success`, `retry-exhausted`
- **Tests:** 12+ tests

**RC-007: Complete Epic 4 Story 4.2 File ACs**
- **Files:** `src/lib/agent/facades/file-tools.ts`
- **AC:**
  - [ ] Glob patterns support (`**/*.ts`, `src/**/*`)
  - [ ] Multi-file operations atomic (all succeed or all fail)
  - [ ] Partial failure: rollback already-written files
  - [ ] Batch interface: `readMultiple(paths)`, `writeMultiple(files)`
  - [ ] Progress tracking callback with percentage
  - [ ] Cancellation via AbortSignal
- **Tests:** 15+ tests

**RC-010: Fix Type Mismatches**
- **Files:** Multiple (filesystem, agent, state, components)
- **AC:**
  - [ ] Run `pnpm tsc --noEmit` and catalog all errors
  - [ ] Fix errors in: filesystem sync types, tool types, store interfaces
  - [ ] Remove unnecessary `any` types and `as` casts
  - [ ] Add missing type exports for public APIs
  - [ ] `pnpm build` completes without type errors

**RC-012: Debounce Persistence**
- **Files:** `src/lib/state/conversation-store.ts`
- **AC:**
  - [ ] Add debounce function (500ms default)
  - [ ] Wrap persistence calls with debounce
  - [ ] Performance improved for long conversations
  - [ ] Cancellation of pending saves on new changes

**RC-014: Wire AbortController**
- **Files:** `src/routes/api/chat.ts`
- **AC:**
  - [ ] AbortController created per request
  - [ ] Signal passed to streaming response
  - [ ] Client disconnect triggers abort
  - [ ] Resources cleaned up on abort
  - [ ] Graceful error on abort

### Sprint 28: Medium Priority + Critical Security ⏳ PENDING

**Duration:** 5 days
**Goal:** Resolve MEDIUM issues + NEW CRITICAL security issues

#### NEW: Critical Security Fixes (Sprint 28)

**RC-SEC-001: Replace XOR with AES-GCM Encryption**
- **Files:** `src/lib/agent/providers/credential-vault.ts`
- **AC:**
  - [ ] Remove XOR "obfuscation" entirely
  - [ ] Implement AES-256-GCM encryption
  - [ ] Use Web Crypto API for crypto operations
  - [ ] Key derived from user password via PBKDF2
  - [ ] All existing credentials re-encrypted

**RC-SEC-002: Consolidate SyncStatusStore**
- **Files:** `src/lib/state/sync-status-store.ts`, `src/lib/state/sync-status-store-copy.ts`
- **AC:**
  - [ ] Single source of truth for sync status
  - [ ] Remove duplicate store definitions
  - [ ] All imports updated to single source
  - [ ] Dexie persistence unified

**RC-SEC-003: Wire ToolPermissionManager**
- **Files:** `src/lib/agent/facades/file-tools.ts`, `src/lib/agent/facades/terminal-tools.ts`
- **AC:**
  - [ ] `checkPermission()` called before tool execution
  - [ ] Permission denied throws appropriate error
  - [ ] Permission cache cleared on permission changes

**RC-SEC-004: Add Shell Session Timeout**
- **Files:** `src/lib/agent/facades/terminal-tools-impl.ts`
- **AC:**
  - [ ] Shell sessions timeout after 30 minutes
  - [ ] Warning shown at 25 minutes
  - [ ] Auto-reconnect on timeout option

#### Existing Sprint 28 Stories

| Story | Task | Priority | Status |
|-------|------|----------|--------|
| RC-016 | Sync Queue Visualizer UI | MEDIUM | ⏳ PENDING |
| RC-017 | Crash Recovery Enhancement | MEDIUM | ⏳ PENDING |
| RC-018 | Performance Auto-Instrument | MEDIUM | ⏳ PENDING |
| RC-019 | Robust State Hydration | MEDIUM | ⏳ PENDING |
| RC-020 | Security Hardening | MEDIUM | ⏳ PENDING |

---

## Effort Summary

| Sprint | Stories | Days | Focus | Status |
|--------|---------|------|-------|--------|
| 27A | 4 | 3 | CRITICAL security | ✅ DONE |
| 27B | 11 | 5 | HIGH functionality | 🔄 8/11 |
| 28 | 9 | 5 | CRITICAL + MEDIUM | ⏳ PENDING |
| **Total** | **24** | **13** | | |

### Remaining Work Breakdown

| Category | Count | Estimated Effort |
|----------|-------|------------------|
| CRITICAL (remaining) | 4 | ~8 hours |
| HIGH (remaining) | 8 | ~16 hours |
| MEDIUM | 25 | ~40 hours |
| **Total** | **39** | **~68 hours** |

---

## Exit Criteria

To exit this correct-course workflow, all of the following must be true:

- [ ] 0 CRITICAL issues remaining (XOR encryption, duplicate stores, unwired permissions, session timeout)
- [ ] 0 HIGH issues remaining (all 12 original + 6 new fixed)
- [ ] All remediation stories have passing tests
- [ ] Ralph Loop re-validation scores ≥85/100
- [ ] Security Posture ≥8.0/10
- [ ] Phase 2 readiness certified

---

## Validation Agent Reports

The following specialized agents contributed to the comprehensive validation:

1. **Architecture Compliance** (comprehensive-review:architect-review)
   - Score: 76/100
   - Key findings: State management consolidation needed, tool wiring incomplete

2. **State Management** (experienced-engineer:database-architect)
   - Findings: localStorage to Dexie migration partial, duplicate stores

3. **Requirements Traceability** (requirements-driven-development:requirements-review)
   - Findings: AC coverage gaps in Epic 4 Stories 2 and 4

4. **API Contracts** (code-refactoring:code-reviewer)
   - Findings: Type mismatches, missing validation schemas

5. **Logic & Business Rules** (debugging-toolkit:debugger)
   - Findings: Stale closures, non-atomic batch operations

6. **Security & Defects** (comprehensive-review:security-auditor)
   - Score: 5.0/10 (D Grade)
   - Findings: XOR "encryption", unwired permissions, no session timeout

---

## Workflow Status

| Phase | Status | Start Date | End Date | Stories |
|-------|--------|------------|----------|---------|
| Remediation Sprint 27A | ✅ DONE | 2025-12-29 | 2025-12-29 | 4/4 |
| Remediation Sprint 27B | 🔄 IN_PROGRESS | 2025-12-29 | TBD | 6/11 |
| Remediation Sprint 28 | ⏳ PENDING | TBD | TBD | 0/9 |
| Re-validation | ⏳ PENDING | TBD | TBD | 1 (RC-999) |

---

**Document Updated:** 2025-12-29
**Next Action:** Update sprint-status.yaml with validation results
**Related:**
- `ralph-loop-validation-report-2025-12-29-final.md`
- `validation-sweep-2025-12-29.md`
- `sprint-status.yaml`
