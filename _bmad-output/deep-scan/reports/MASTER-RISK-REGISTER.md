# MASTER RISK REGISTER - DEEP SCAN FINDINGS

**Project:** project-alpha-master
**Scan Date:** 2026-01-06T12:00:00+07:00
**Overall Health:** CRITICAL (35/100)

## Executive Summary

This deep scan reveals fundamental architecture violations that contradict "production-ready" claims:

**P0 CRITICAL:** 7 issues requiring immediate action
- Cross-workspace state pollution (2,933 locations)
- 7 god stores (>300 lines) 
- 634 unencrypted secret exposures
- No workspace isolation in persistence
- 50+ TypeScript errors
- Zero migration rollback strategy

**P1 HIGH:** 12 issues
- Zustand v5 violations (~586 files)
- 12 god components (>300 lines)
- No mobile fallbacks
- Missing error boundaries

**P2 MEDIUM:** 8 issues
- Store fragmentation (46 stores)
- 243 localStorage usages
- Circular dependency risks

User-reported issues mapped to root causes:
- File system sync broken → No workspace_id in IndexedDB (PERSIST-004)
- No mobile fallback → Missing null checks (STATE-005)  
- LLM config inconsistent → 634 unencrypted secrets (PERSIST-002)

## P0 CRITICAL RISKS

### RISK-001: Cross-Workspace State Pollution
**ID:** STATE-005 | **Severity:** P0

**Evidence:** 2,933 files using global stores without workspace isolation
**Impact:** Data leaks between IDE/Notes/Knowledge workspaces

**Root Cause:** Zustand v5 violations, no workspace cleanup, missing null checks

**Remediation:**
- Story: STATE-S001
- Effort: 2-3 weeks
- Approach: Audit all 2,933 usages, add workspace-scoped selectors, implement cleanup

### RISK-002: God Store Violations (7 files)
**ID:** STATE-001 through STATE-004 | **Severity:** P0

**Evidence:**
| File | Lines | Multiplier |
|------|-------|-----------|
| note-store.ts | 723 | 2.41x |
| workflow-builder-store.ts | 568 | 1.89x |
| file-sync-status-store.ts | 554 | 1.85x |
| project-store.ts | 519 | 1.73x |

**Remediation:** Split into slices ≤120 lines each

### RISK-003: Unencrypted API Keys (634 locations)
**ID:** PERSIST-002 | **Severity:** P0

**Attack Vector:** DevTools → IndexedDB → View all API keys

**Remediation:** Implement Web Crypto API encryption

### RISK-004: No Workspace Isolation
**ID:** PERSIST-004 | **Severity:** P0

**Impact:** Notes from Project A visible in Project B

**Remediation:** Add workspace_id foreign keys to all tables

### RISK-005: No Migration Rollback
**ID:** PERSIST-001 | **Severity:** P0

**Impact:** Permanent data loss on migration failure

**Remediation:** Implement rollback with backups

### RISK-006: TypeScript Errors (50+)
**ID:** TYPES-001 | **Severity:** P0

**Impact:** Runtime crashes, type coercion bugs

**Remediation:** Fix all errors, enable strict mode

### RISK-007: Zero Mobile Fallbacks
**ID:** UX-005 | **Severity:** P0

**Impact:** App crashes on mobile

**Remediation:** Add fallback screens, touch targets ≥44px

## P1 HIGH RISKS

### RISK-008: Zustand v5 Violations (~586 files)
**ID:** STATE-006

**Impact:** Infinite re-render loops, battery drain

### RISK-009: God Components (12 files)
**ID:** ARCH-001

**Largest:** MonacoEditor.tsx (768 lines)

### RISK-010: Missing Error Boundaries
**ID:** UX-003

**Coverage:** Only 16.5% of files have error handling

### RISK-011: No User Feedback
**ID:** UX-004

**Impact:** Silent failures, no progress indication

## REMEDIATION BACKLOG

**Sprint 1 (2 weeks):**
- Fix cross-workspace pollution (STATE-S001)
- Encrypt API keys (PERSIST-S001)
- Add workspace_id (PERSIST-S002)
- Migration rollback (PERSIST-S003)

**Sprint 2 (2 weeks):**
- Split god stores (STATE-S002 through STATE-S005)

**Sprint 3 (2 weeks):**
- Fix TypeScript errors (TYPES-S001)
- Mobile fallbacks (UX-S001)
- Zustand v5 fixes (STATE-S006)

**Total Effort:** 8-10 weeks to reach production-ready

## VALIDATION CHECKLIST

Before claiming "production-ready":

- [ ] All 7 god stores split
- [ ] All 2,933 global store usages audited
- [ ] All 634 secrets encrypted
- [ ] All tables have workspace_id
- [ ] Migration rollback tested
- [ ] Zero TypeScript errors
- [ ] Mobile fallbacks implemented
- [ ] Error boundaries on all routes

---

**Generated:** 2026-01-06
**Output ID:** 038a4705979c834b
