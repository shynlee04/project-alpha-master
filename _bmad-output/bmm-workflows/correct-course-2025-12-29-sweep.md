# Correct-Course Workflow - Post-Sprint 27B Validation Sweep

**Date:** 2025-12-29
**Trigger:** Comprehensive 8-Domain Validation Sweep
**Status:** IN_PROGRESS - Remediation Cycle 2
**Phase:** Sprint 28

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Overall Health Score | 58/100 |
| CRITICAL Issues | 6 |
| HIGH Issues | 14 |
| MEDIUM Issues | 31 |
| LOW Issues | 13 |
| Phase 2 Ready | ❌ NO |

### Validation Coverage

| Domain | Grade | Critical Issues | High Issues | Medium Issues |
|--------|-------|-----------------|-------------|---------------|
| Domain 1: Architecture Compliance | A- | 0 | 0 | 2 |
| Domain 2: Code Quality | B+ | 0 | 0 | 1 |
| Domain 3: Requirements Traceability | D | 4 | 2 | 3 |
| Domain 4: API Contracts | C+ | 0 | 0 | 4 |
| Domain 5: State Management | C | 2 | 2 | 4 |
| Domain 6: Business Logic | C- | 0 | 5 | 7 |
| Domain 7: Remediation Stories | D+ | 0 | 2 | 2 |
| Domain 8: Security | D | 0 | 3 | 6 |
| **TOTAL** | **C-** | **6** | **14** | **31** |

---

## Violation Catalog

### CRITICAL Issues (Must Fix Before Any Further Development) - 6 Total

| ID | Domain | Issue | Location | Remediation |
|----|--------|-------|----------|-------------|
| CRIT-SW-001 | 3 | ToolPermissionManager.checkPermission() unwired to execution | `file-tools-impl.ts`, `terminal-tools-impl.ts` | Wire permission checks before tool execution |
| CRIT-SW-002 | 3 | XOR "obfuscation" NOT encryption for master key | `credential-vault.ts:111-143` | Replace with AES-256-GCM using Web Crypto API |
| CRIT-SW-003 | 5 | IDELayout.tsx duplicates IDE state with local useState | `IDELayout.tsx:122-123` | Refactor to single source of truth |
| CRIT-SW-004 | 5 | Conversation store dual-write (localStorage + Dexie) | `conversation-threads-store.ts` | Consolidate to Dexie only |
| CRIT-SW-005 | 6 | FileLock race condition in lock acquisition | `file-lock.ts:77-85` | Fix re-check logic after await |
| CRIT-SW-006 | 6 | Path validation missing in LocalFSAdapter | `local-fs-adapter.ts:106-117` | Add centralized path validation |

### HIGH Issues (Must Fix Before Phase 2) - 14 Total

| ID | Domain | Issue | Location | Remediation |
|----|--------|-------|----------|-------------|
| HIGH-SW-001 | 3 | Duplicate SyncStatusStore definitions | Multiple store files | Consolidate to single source |
| HIGH-SW-002 | 3 | Missing shell session timeout (30min max) | `terminal-tools-impl.ts:126-164` | Add timeout enforcement |
| HIGH-SW-003 | 4 | ProviderType missing 'openrouter' in union | `types.ts:14` | Add missing provider type |
| HIGH-SW-004 | 4 | messageCount not auto-synced with messages.length | `conversation-store.ts:346` | Add derived field |
| HIGH-SW-005 | 5 | Stale closure in AgentChatPanel sync effect | `AgentChatPanel.tsx:349-392` | Use functional updates |
| HIGH-SW-006 | 5 | Subscription memory leak in threads-store | `conversation-threads-store.ts:361-382` | Add unsubscribe capability |
| HIGH-SW-007 | 6 | Command sanitizer blocklist incomplete | `command-sanitizer.ts:30-44` | Add argument validation |
| HIGH-SW-008 | 6 | File lock path mismatch (normalized vs original) | `file-tools-impl.ts:70,83` | Use normalized path consistently |
| HIGH-SW-009 | 6 | Tool execution race condition in factory | `factory.ts:58-78` | Capture tools synchronously |
| HIGH-SW-010 | 7 | Crash recovery missing unsaved work preservation | `crash-recovery.ts` | Add snapshot/restore mechanism |
| HIGH-SW-011 | 7 | Sync Queue Visualizer UI not implemented | Components | Create visualizer component |
| HIGH-SW-012 | 8 | API key exposed in request body | `provider-adapter.ts` | Use server-side token exchange |
| HIGH-SW-013 | 8 | Path traversal protection incomplete | `path-guard.ts` | Add encoded traversal checks |
| HIGH-SW-014 | 8 | Command sanitizer argument bypass possible | `command-sanitizer.ts` | Add argument pattern matching |

### MEDIUM Issues (Fix in Remediation Sprint 28) - 31 Total

| ID | Domain | Issue | Location |
|----|--------|-------|----------|
| MED-SW-001 | 1 | Dynamic require() in tool index | `tools/index.ts:44-46` |
| MED-SW-002 | 1 | IDELayout state duplication deferred | `IDELayout.tsx` |
| MED-SW-003 | 2 | Implementation comments in file-ops.ts | `file-ops.ts:116-140` |
| MED-SW-004 | 2 | Path normalization duplication | Multiple files |
| MED-SW-005 | 2 | Deprecated wrapper in db.ts | `db.ts:55` |
| MED-SW-006 | 3 | System role handling inconsistency | `chat.ts:98-113` |
| MED-SW-007 | 3 | Thread message cast without validation | `threads-store.ts:73` |
| MED-SW-008 | 4 | Dexie storage type safety | `dexie-storage.ts:32` |
| MED-SW-009 | 4 | Error classification logic precedence | `error-classification.ts:208-209` |
| MED-SW-010 | 4 | Sync conflict detection missing | `sync-manager.ts:222-328` |
| MED-SW-011 | 5 | Object-returning selectors | `statusbar-store.ts` |
| MED-SW-012 | 5 | Interval accumulation | `conversation-threads-store.ts:417-423` |
| MED-SW-013 | 5 | Missing error recovery fallback | All persistent stores |
| MED-SW-014 | 6 | Retry queue cleanup mechanism | `retry-queue.ts:326-330` |
| MED-SW-015 | 6 | Terminal process cleanup on timeout | `terminal-tools-impl.ts:67-75` |
| MED-SW-016 | 6 | Sync state not reset on error | `sync-manager.ts:183-207` |
| MED-SW-017 | 6 | Singleton state HMR issues | `tool-permission-manager.ts` |
| MED-SW-018 | 6 | Error classification precedence | `error-classification.ts:208-209` |
| MED-SW-019 | 7 | Hydration no version migration | `hydration-manager.ts` |
| MED-SW-020 | 7 | No degraded UI state for hydration | Components |
| MED-SW-021 | 8 | Custom headers without validation | `provider-adapter.ts` |
| MED-SW-022 | 8 | Rate limiting missing | `chat.ts` |
| MED-SW-023 | 8 | HTTPS validation for custom baseURL | `provider-adapter.ts` |
| MED-SW-024 | 8 | Permission re-verification missing | `use-agent-chat-with-tools.ts` |
| MED-SW-025 | 8 | DexieStorage quota error handling | `dexie-storage.ts` |
| MED-SW-026 | 8 | Stale closure in loadConversation | `conversation-store.ts` |
| MED-SW-027 | 8 | Storage key hardcoded | `ide-store.ts` |
| MED-SW-028 | 8 | API key logging | `chat.ts` |
| MED-SW-029 | 8 | Custom baseURL HTTPS validation | `provider-adapter.ts` |
| MED-SW-030 | 8 | Command timeout cleanup | `terminal-tools-impl.ts` |
| MED-SW-031 | 8 | AbortController signal not passed | `file-tools-impl.ts:226-230` |

---

## Sprint 28: Critical Security + Remediation ⏳ PENDING

**Duration:** 5 days
**Goal:** Resolve CRITICAL/HIGH issues from validation sweep + MEDIUM backlog
**Status:** 0/9 stories drafted

### Sprint 28 Stories

| Story | Task | Priority | Status |
|-------|------|----------|--------|
| RC-028-001 | Wire ToolPermissionManager to execution layer | CRITICAL | ⏳ PENDING |
| RC-028-002 | Replace XOR with AES-GCM encryption | CRITICAL | ⏳ PENDING |
| RC-028-003 | Fix IDELayout state duplication | CRITICAL | ⏳ PENDING |
| RC-028-004 | Consolidate conversation store persistence | CRITICAL | ⏳ PENDING |
| RC-028-005 | Fix FileLock race condition | HIGH | ⏳ PENDING |
| RC-028-006 | Add path validation to LocalFSAdapter | HIGH | ⏳ PENDING |
| RC-028-007 | Fix command sanitizer argument validation | HIGH | ⏳ PENDING |
| RC-028-008 | Add crash recovery unsaved work preservation | HIGH | ⏳ PENDING |
| RC-028-009 | Security hardening (API keys, path traversal) | HIGH | ⏳ PENDING |

---

## Effort Summary

| Sprint | Stories | Days | Focus | Status |
|--------|---------|------|-------|--------|
| 27A | 4 | 3 | CRITICAL security | ✅ DONE |
| 27B | 11 | 5 | HIGH functionality | ✅ DONE |
| 28 | 9 | 5 | CRITICAL + HIGH remediation | ⏳ PENDING |
| **Total** | **24** | **13** | | |

### Remaining Work Breakdown

| Category | Count | Estimated Effort |
|----------|-------|------------------|
| CRITICAL (remaining) | 2 | ~4 hours |
| HIGH (remaining) | 5 | ~10 hours |
| MEDIUM | 31 | ~40 hours |
| LOW | 13 | ~13 hours |
| **Total** | **51** | **~67 hours** |

---

## Exit Criteria

To exit this correct-course workflow, all of the following must be true:

- [ ] 0 CRITICAL issues remaining (ToolPermissionManager wired, encryption fixed, state consolidated)
- [ ] 0 HIGH issues remaining (shell timeout, path validation, crash recovery)
- [ ] All Sprint 28 stories have passing tests
- [ ] Ralph Loop re-validation scores ≥85/100
- [ ] Security Posture ≥8.0/10
- [ ] Phase 2 readiness certified

---

## Validation Agent Reports Summary

### Domain 1: Architecture Compliance
- Grade: A-
- 2 MEDIUM issues (dynamic require, state duplication deferred)
- Facade pattern properly implemented
- No circular dependencies

### Domain 2: Code Quality
- Grade: B+
- All test thresholds met or exceeded
- 1 MEDIUM + 3 LOW issues (path normalization, deprecated code)

### Domain 3: Requirements Traceability
- Grade: D
- 4 CRITICAL issues (unwired permissions, XOR encryption, state duplication)
- Partial story implementations
- Integration gaps in permission enforcement

### Domain 4: API Contracts
- Grade: C+
- 4 MEDIUM issues (type safety, schema validation, path traversal)
- Well-structured TypeScript interfaces
- Schema validation gaps

### Domain 5: State Management
- Grade: C
- 2 CRITICAL + 2 HIGH issues (state duplication, stale closures)
- Good Dexie schema design
- Subscription memory leaks

### Domain 6: Business Logic
- Grade: C-
- 5 HIGH issues (FileLock race, path mismatch, command sanitizer)
- Control flow gaps in async operations
- Error handling inconsistencies

### Domain 7: Remediation Stories
- Grade: D+
- 2 HIGH issues (crash recovery, sync visualizer)
- Story 5-3 (Performance) fully complete
- Hydration manager lacks version migration

### Domain 8: Security
- Grade: D
- 3 HIGH issues (API key exposure, path traversal, command bypass)
- Credential vault XOR obfuscation
- Missing rate limiting

---

## Workflow Status

| Phase | Status | Start Date | End Date | Stories |
|-------|--------|------------|----------|---------|
| Remediation Sprint 27A | ✅ DONE | 2025-12-29 | 2025-12-29 | 4/4 |
| Remediation Sprint 27B | ✅ DONE | 2025-12-29 | 2025-12-29 | 11/11 |
| Remediation Sprint 28 | 🔄 IN_PROGRESS | 2025-12-29 | TBD | 0/9 |
| Re-validation | ⏳ PENDING | TBD | TBD | 1 (RC-999) |

---

**Document Created:** 2025-12-29
**Trigger:** Post-Sprint 27B Comprehensive Validation Sweep
**Next Action:** Draft Sprint 28 stories from remediation items

**Related:**
- `correct-course-2025-12-29.md` (Sprint 27B)
- `ralph-loop-validation-report-2025-12-29-final.md`
- `sprint-status.yaml`
