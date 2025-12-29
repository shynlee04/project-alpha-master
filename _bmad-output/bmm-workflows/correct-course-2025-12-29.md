# Correct-Course Workflow - Phase 1 Remediation

**Date:** 2025-12-29
**Trigger:** Ralph Loop Validation - 67/100 Health Score
**Status:** PENDING - Remediation Cycle 1

---

## Workflow Context

The Ralph Loop comprehensive validation identified multiple violations across all 8 domains that block Phase 2 readiness. This workflow triggers the BMAD correct-course procedure to remediate findings before proceeding.

### Validation Summary

| Metric | Value |
|--------|-------|
| Overall Health Score | 67/100 |
| CRITICAL Issues | 4 |
| HIGH Issues | 12 |
| MEDIUM Issues | 24 |
| LOW Issues | 18 |
| Phase 2 Ready | ❌ NO |

---

## Violation Catalog

### CRITICAL (Must Fix Before Any Further Development)

| ID | Domain | Issue | Location | Remediation |
|----|--------|-------|----------|-------------|
| CRIT-001 | 6 | Hook violation: `useTranslation()` in utility | `error-handling.ts:41` | Extract translation keys |
| CRIT-002 | 6 | No file size validation (>10MB warning) | `sync-manager.ts` | Add MAX_FILE_SIZE check |
| CRIT-003 | 8 | Master key in localStorage (XSS accessible) | `credential-vault.ts:17` | Move to IndexedDB/WebAuthn |
| CRIT-004 | 8 | No command injection protection | `execute-command-tool.ts` | Add allowlist/escape |

### HIGH (Must Fix Before Phase 2)

| ID | Domain | Issue | Location | Remediation |
|----|--------|-------|----------|-------------|
| HIGH-001 | 1 | useSyncStatusStore uses localStorage, not Dexie | `sync-status-store.ts:9` | Migrate to Dexie |
| HIGH-002 | 1 | Only 3/5 agent prompt layers implemented | `prompt-composer.ts` | Document deferred layers |
| HIGH-003 | 3 | Epic 4 Story 4.4 (Error Handling) not found | Various | Implement retry queue |
| HIGH-004 | 3 | Epic 4 Story 4.2 partial (file size, depth) | Tools | Complete ACs |
| HIGH-005 | 3 | Epic 2 Story 2.3 (Approval Overlay) missing | Components | Implement UI |
| HIGH-006 | 4 | ChatRequest lacks input validation | `chat.ts:150` | Add Zod schema |
| HIGH-007 | 4 | CustomAdapterConfig type optionality mismatch | `provider-adapter.ts:23` | Fix types |
| HIGH-008 | 5 | Empty Dexie upgrade functions | `dexie-db.ts:258` | Add migration logic |
| HIGH-009 | 5 | No debouncing on conversation persistence | `conversation-store.ts:289` | Add debounce |
| HIGH-010 | 6 | No rollback on partial sync failure | `sync-manager.ts:228` | Implement rollback |
| HIGH-011 | 6 | AbortController not linked to stream | `chat.ts:252` | Wire signal |
| HIGH-012 | 6 | Non-retryable errors retried | `error-handling.ts:184` | Add classification |

### MEDIUM (Fix in Remediation Sprints)

| ID | Domain | Issue | Location |
|----|--------|-------|----------|
| MED-001 | 1 | Inconsistent auto-boot in SyncManager | `sync-manager.ts:128` |
| MED-002 | 1 | Hardcoded IDE store storage key | `ide-store.ts:238` |
| MED-003 | 1 | Store import path inconsistency | Multiple |
| MED-004 | 1 | No unified error hierarchy | Scattered |
| MED-005 | 2 | Path normalization duplicated | Agent tools |
| MED-006 | 4 | Message role type incomplete | `chat.ts:67` |
| MED-007 | 4 | createAdapter no return type | `provider-adapter.ts:42` |
| MED-008 | 5 | No quota handling in storage | `dexie-storage.ts` |
| MED-009 | 5 | Subscription fires on every change | `conversation-threads-store.ts` |
| MED-010 | 6 | Permission not re-verified | `use-agent-chat-with-tools.ts` |
| MED-011 | 6 | Metrics not persisted | `crash-recovery.ts:94` |
| MED-012 | 6 | No recursive depth limit | `execute-command-tool.ts` |
| MED-013 | 7 | Story 5-1 UI not implemented | Components |
| MED-014 | 7 | Crash recovery: no unsaved work capture | `crash-recovery.ts` |
| MED-015 | 7 | Performance: no auto-instrumentation | `performance-monitor.ts` |
| MED-016 | 7 | Hydration: no version checking | `hydration-manager.ts` |
| MED-017 | 8 | Custom headers without validation | `provider-adapter.ts:84` |
| MED-018 | 8 | API key logging | `chat.ts:154` |
| MED-019 | 8 | No rate limiting | `chat.ts` |
| MED-020 | 8 | Custom baseURL no HTTPS validation | `provider-adapter.ts:79` |

---

## Remediation Stories

### Sprint 27A: Critical Security Fixes

**Duration:** 3 days
**Goal:** Eliminate CRITICAL issues

#### Story RC-001: Fix Hook Violation
- **Task:** Extract `useTranslation()` from `showErrorToast()` utility
- **File:** `src/lib/utils/error-handling.ts`
- **AC:**
  - [ ] `showErrorToast()` accepts translation keys, not t function
  - [ ] Error messages use pre-translated strings
  - [ ] All existing callers updated
- **Tests:** Verify no runtime errors in non-component contexts

#### Story RC-002: Add File Size Validation
- **Task:** Implement >10MB warning in file operations
- **File:** `src/lib/filesystem/sync-manager.ts`
- **AC:**
  - [ ] `MAX_FILE_SIZE = 10 * 1024 * 1024` constant defined
  - [ ] Warning logged when file exceeds limit
  - [ ] Tests cover size boundary cases
- **Tests:** 5+ tests for size validation

#### Story RC-003: Secure Credential Vault
- **Task:** Move master key from localStorage to secure storage
- **File:** `src/lib/agent/providers/credential-vault.ts`
- **AC:**
  - [ ] Key stored in IndexedDB (not localStorage)
  - [ ] XSS cannot access encryption key
  - [ ] Existing credentials migrated
- **Tests:** 5+ tests for secure storage

#### Story RC-004: Command Injection Protection
- **Task:** Add command allowlist or shell escaping
- **File:** `src/lib/agent/tools/execute-command-tool.ts`
- **AC:**
  - [ ] Dangerous commands blocked or escaped
  - [ ] Allowlist configurable
  - [ ] Tests for injection attempts
- **Tests:** 8+ tests for command safety

### Sprint 27B: High Priority Fixes

**Duration:** 5 days
**Goal:** Resolve HIGH issues

#### Story RC-005: Migrate SyncStatusStore to Dexie
- **Task:** Change persistence from localStorage to Dexie
- **File:** `src/lib/state/sync-status-store.ts`
- **AC:** Unified Zustand + Dexie pattern implemented

#### Story RC-006: Complete Epic 4 Story 4.4
- **Task:** Implement retry logic and execution queue
- **Files:** `src/lib/agent/tools/*.ts`
- **AC:**
  - [ ] Retry once automatically
  - [ ] Queue ensures one execution per tool type
  - [ ] Tests cover queue behavior

#### Story RC-007: Complete Epic 4 Story 4.2 ACs
- **Task:** Add file size warning and depth limits
- **Files:** `src/lib/agent/tools/*.ts`
- **AC:**
  - [ ] Files >10MB show warning
  - [ ] Recursive depth limited to 3 levels
  - [ ] Tests cover both ACs

#### Story RC-008: Implement Approval Overlay
- **Task:** Create tool approval UI component
- **Files:** `src/components/agent/`
- **AC:**
  - [ ] Overlay appears for prompt-level tools
  - [ ] User can approve/deny
  - [ ] State reflects approval status

#### Story RC-009: Add ChatRequest Validation
- **Task:** Implement Zod schema for API requests
- **File:** `src/routes/api/chat.ts`
- **AC:**
  - [ ] Provider ID validated against registry
  - [ ] Model ID format validated
  - [ ] Message structure validated

#### Story RC-010: Fix Type Mismatches
- **Task:** Correct CustomAdapterConfig optionality
- **File:** `src/lib/agent/providers/provider-adapter.ts`
- **AC:** TypeScript compiles without errors

#### Story RC-011: Add Dexie Migration Logic
- **Task:** Implement actual schema migrations
- **File:** `src/lib/state/dexie-db.ts`
- **AC:**
  - [ ] Upgrade functions migrate data
  - [ ] Tests cover migration scenarios

#### Story RC-012: Debounce Persistence
- **Task:** Add debouncing to conversation store
- **File:** `src/lib/state/conversation-store.ts`
- **AC:**
  - [ ] Persistence debounced by 500ms
  - [ ] Performance improved for long conversations

#### Story RC-013: Implement Rollback
- **Task:** Handle partial sync failures
- **File:** `src/lib/filesystem/sync-manager.ts`
- **AC:**
  - [ ] Local FS write succeeds, WC fails: rollback Local
  - [ ] Error includes actionable information
  - [ ] Tests cover rollback scenarios

#### Story RC-014: Wire AbortController
- **Task:** Connect abort signal to stream
- **File:** `src/routes/api/chat.ts`
- **AC:**
  - [ ] Client disconnect terminates server stream
  - [ ] Resources properly cleaned up

#### Story RC-015: Classify Retryable Errors
- **Task:** Add isRetryableError helper
- **File:** `src/lib/utils/error-handling.ts`
- **AC:**
  - [ ] Auth errors fail fast
  - [ ] Network errors are retried
  - [ ] Tests cover classification

### Sprint 28: Medium Priority

**Duration:** 5 days
**Goal:** Resolve MEDIUM issues

#### Story RC-016: Implement Sync Queue Visualizer
- **Task:** Create UI for sync status
- **Files:** `src/components/ide/sync-queue-panel.tsx`
- **AC:**
  - [ ] Shows queue items with status
  - [ ] Conflict detection displayed
  - [ ] Mobile-responsive

#### Story RC-017: Enhance Crash Recovery
- **Task:** Add unsaved work capture
- **File:** `src/lib/webcontainer/crash-recovery.ts`
- **AC:**
  - [ ] Unsaved changes buffered before recovery
  - [ ] WebContainer explicitly terminated
  - [ ] Crash cause logged

#### Story RC-018: Auto-Instrument Performance
- **Task:** Add automatic metric collection
- **File:** `src/lib/monitoring/performance-monitor.ts`
- **AC:**
  - [ ] Critical paths automatically measured
  - [ ] Memory cleanup for old metrics
  - [ ] Status bar widget

#### Story RC-019: Robust State Hydration
- **Task:** Add version checking and corruption detection
- **File:** `src/lib/state/hydration-manager.ts`
- **AC:**
  - [ ] Schema version validated
  - [ ] Corrupted data detected and reset
  - [ ] Partial hydration works

#### Story RC-020: Security Hardening
- **Task:** Fix medium security issues
- **Files:** Various
- **AC:**
  - [ ] Custom headers validated
  - [ ] No API key logging
  - [ ] Rate limiting added
  - [ ] HTTPS required for custom URLs

---

## Effort Summary

| Sprint | Stories | Days | Focus |
|--------|---------|------|-------|
| 27A | 4 | 3 | CRITICAL security |
| 27B | 11 | 5 | HIGH functionality |
| 28 | 5 | 5 | MEDIUM improvements |
| **Total** | **20** | **13** | |

---

## Exit Criteria

To exit this correct-course workflow, all of the following must be true:

- [ ] 0 CRITICAL issues remaining
- [ ] 0 HIGH issues remaining
- [ ] All remediation stories have passing tests
- [ ] Ralph Loop re-validation scores ≥85/100
- [ ] Phase 2 readiness certified

---

## Workflow Status

| Phase | Status | Start Date | End Date |
|-------|--------|------------|----------|
| Remediation Sprint 27A | PENDING | TBD | TBD |
| Remediation Sprint 27B | PENDING | TBD | TBD |
| Remediation Sprint 28 | PENDING | TBD | TBD |
| Re-validation | PENDING | TBD | TBD |

---

**Document Created:** 2025-12-29
**Next Action:** Update sprint-status.yaml with remediation sprints
**Related:** `ralph-loop-validation-report-2025-12-29-final.md`
