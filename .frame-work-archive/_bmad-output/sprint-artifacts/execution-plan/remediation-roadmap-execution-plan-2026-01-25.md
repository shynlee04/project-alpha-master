# Sprint Execution Plan
# Session: arch-03-audit-2026-01-25
# Created: 2026-01-25
# Strategy: Option A (CTX-CLEAN FIRST)

---

## 🎯 EXECUTION OVERVIEW

**Goal:** Complete all 4 phases within 10-14 hours and unblock all future development work

**Strategy Rationale:**
- YAML syntax errors block ALL agent coordination
- Context poisoning causes agents to follow outdated ADRs
- Low effort (4-6h) vs high impact on all future work
- Enables sprint-manager to operate effectively

**Phases:**
1. **Phase 1:** CTX-02 (2h) → Fix YAML syntax errors → UNBLOCKS ALL AGENTS
2. **Phase 2:** CTX-01 (1h) → Archive superseded ADRs → REMOVES CONFLICTS
3. **Phase 3:** ARCH-03-05-FIX (1-2h) → Complete EPIC-ARCH-03 → **7/7 STORIES DONE**
4. **Phase 4:** TS-DEBT-01 & TS-DEBT-02 (5-6h) → Fix critical errors → **BUILD SUCCESS**

**Total Effort:** 10-14 hours

---

## 📋 PHASE 1: CTX-02 - Fix YAML Syntax Errors (P0)

**Story ID:** CTX-02
**Priority:** P0
**Effort:** 2 hours
**Assigned Team:** tech-writer-ext
**Status:** READY_TO_START

### Problem
- `sprint-status.yaml`: 5 YAML errors (duplicate keys, nested mappings)
- `bmm-workflow-status.yaml`: 14 YAML errors (column alignment)
- These errors prevent agents from parsing governance files

### Acceptance Criteria
| AC | Description | Verification |
|----|-------------|--------------|
| AC1 | `sprint-status.yaml` parses without errors | `yamllint` or manual YAML parser validates |
| AC2 | `bmm-workflow-status.yaml` parses without errors | `yamllint` or manual YAML parser validates |
| AC3 | No duplicate keys in YAML files | Manual inspection or script validation |
| AC4 | Proper indentation (2 spaces) | Visual inspection |
| AC5 | Column alignment is consistent | Visual inspection |

### Tool Constraints
**CRITICAL**: This agent has LIMITED permissions:
- write: true (can fix YAML files)
- edit: true (can modify YAML content)
- bash: true (can run yamllint if available)
- task: false (do NOT delegate further)

**Role Boundaries:**
- tech-writer-ext - Fix YAML syntax errors in governance files
- WHAT NOT TO DO: Do NOT modify any code files, do NOT change content logic

**Required Output:**
- Report location: `_bmad-output/sprint-artifacts/reports/CTX-02-completion-2026-01-25.md`
- Success criteria:
  - 0 YAML parse errors
  - Both files validate successfully
- Timebox: 2 hours

### Files to Fix
```
_bmad-output/sprint-artifacts/sprint-status.yaml
bmm-workflow-status.yaml
```

---

## 📋 PHASE 2: CTX-01 - Archive Superseded ADRs (P0)

**Story ID:** CTX-01
**Priority:** P0
**Effort:** 1 hour
**Assigned Team:** tech-writer-ext
**Status:** WAITING_FOR_PHASE_1

### Problem
- ADR-033, ADR-035 still active (should be SUPERSEDED by ADR-034)
- ADR-036 has two versions (ambiguous authority)
- Agents follow outdated architectural decisions

### Acceptance Criteria
| AC | Description | Verification |
|----|-------------|--------------|
| AC1 | ADR-033 marked as SUPERSEDED by ADR-034 | Header added to file |
| AC2 | ADR-035 marked as SUPERSEDED by ADR-034 | Header added to file |
| AC3 | ADR-036 consolidated to single version | One file active, one archived |
| AC4 | ADR index updated with superseded status | Index file reflects changes |
| AC5 | No references to superseded ADRs in active docs | Grep search confirms |

### Tool Constraints
**CRITICAL**: This agent has LIMITED permissions:
- write: true (can add headers to ADR files)
- edit: true (can modify ADR content and index)
- bash: false (do NOT run any commands)
- task: false (do NOT delegate further)

**Role Boundaries:**
- tech-writer-ext - Mark ADRs as superseded, consolidate duplicates
- WHAT NOT TO DO: Do NOT change architectural decisions, do NOT modify code

**Required Output:**
- Report location: `_bmad-output/sprint-artifacts/reports/CTX-01-completion-2026-01-25.md`
- Success criteria:
  - 0 ADR conflicts (single authority: ADR-034)
  - All superseded headers in place
- Timebox: 1 hour

### Files to Modify
```
_bmad-output/planning-artifacts/adr/ADR-033-correct-course-architectural-remediation-2026-01-16.md
_bmad-output/planning-artifacts/adr/ADR-035-[filename].md
_bmad-output/planning-artifacts/adr/ADR-036-[version].md
_bmad-output/planning-artifacts/adr/ADR-INDEX.md (if exists)
```

---

## 📋 PHASE 3: ARCH-03-05-FIX - Progressive Disclosure UI TypeScript Resolution (P0)

**Story ID:** ARCH-03-05-FIX
**Priority:** P0
**Effort:** 1-2 hours
**Assigned Team:** dev-ext
**Status:** WAITING_FOR_PHASE_2

### Problem
- ARCH-03-05 is marked complete but has TypeScript module resolution issues
- `LayoutOnboarding.tsx`: JSX configuration error
- `user-preferences-store.ts`: Import resolution error
- Prevents verification of ARCH-03-05

### Acceptance Criteria
| AC | Description | Verification |
|----|-------------|--------------|
| AC1 | `LayoutOnboarding.tsx` compiles without JSX errors | `pnpm tsc --noEmit` shows no errors for this file |
| AC2 | `user-preferences-store.ts` imports resolve correctly | All imports of this file succeed |
| AC3 | ARCH-03-05 components render without runtime errors | Manual test in browser |
| AC4 | No NEW TypeScript errors introduced | Compare before/after `tsc --noEmit` output |

### Tool Constraints
**CRITICAL**: This agent has LIMITED permissions:
- write: true (can create missing files)
- edit: true (can modify code files)
- bash: true (can run `pnpm tsc --noEmit`)
- task: false (do NOT delegate further)

**Role Boundaries:**
- dev-ext - Fix TypeScript errors related to ARCH-03-05 only
- WHAT NOT TO DO: Do NOT fix any other TypeScript errors, do NOT add new features

**Required Output:**
- Report location: `_bmad-output/sprint-artifacts/reports/ARCH-03-05-FIX-completion-2026-01-25.md`
- Success criteria:
  - 0 TypeScript errors related to ARCH-03-05 files
  - ARCH-03-05 can be marked VERIFIED
- Timebox: 2 hours

### Files to Check/Modify
```
src/presentation/components/layout/LayoutOnboarding.tsx   # May need creation or fix
src/infrastructure/persistence/stores/user-preferences-store.ts  # May need creation
tsconfig.json  # Verify jsx and paths configuration
```

---

## 📋 PHASE 4: TS-DEBT-01 & TS-DEBT-02 - Critical TypeScript Fixes (P0)

**Story ID:** TS-DEBT-01 & TS-DEBT-02
**Priority:** P0
**Effort:** 5-6 hours total (3-4h for TS-DEBT-01, 2h for TS-DEBT-02)
**Assigned Team:** dev-ext
**Status:** WAITING_FOR_PHASE_3

### TS-DEBT-01: Agent Tools Type Definitions (P0)

**Problem:**
- 50 errors in `src/lib/agent/tools/` and `src/lib/agent/factory.ts`
- TanStack AI SDK return types don't match expected properties
- Missing functions, unused imports, property errors

**Root Cause:** TanStack AI SDK return types changed

**Solution:** Update tool result types to match actual SDK responses

**Acceptance Criteria:**
| AC | Description | Verification |
|----|-------------|--------------|
| AC1 | `factory.ts` compiles (0 errors) | `pnpm tsc --noEmit` |
| AC2 | All tool files in `tools/` compile (0 errors) | `pnpm tsc --noEmit` |
| AC3 | No regressions in tool functionality | Manual test of each tool |

**Files to Fix:**
```
src/lib/agent/factory.ts (14 errors)
src/lib/agent/tools/process-image-tool.ts (6 errors)
src/lib/agent/tools/process-pdf-tool.ts (8 errors)
src/lib/agent/tools/process-url-tool.ts (2 errors)
src/lib/agent/tools/synthesize-tool.ts (12 errors)
src/lib/agent/tools/note-commands.ts (4 errors)
```

---

### TS-DEBT-02: Notes Sync Map/Array Fix (P0)

**Problem:**
- 15 errors in `src/lib/notes/sync/cache-sync.ts`
- Using Array methods (filter/find) on Map objects

**Root Cause:** Code assumes `notes` is Array, but it's a Map

**Solution:** Convert to `Array.from(notes.values()).filter(...)` pattern

**Acceptance Criteria:**
| AC | Description | Verification |
|----|-------------|--------------|
| AC1 | `cache-sync.ts` compiles (0 errors) | `pnpm tsc --noEmit` |
| AC2 | Sync functionality works correctly | Manual test of sync |
| AC3 | No other sync files have Map/Array errors | Grep for similar issues |

**Files to Fix:**
```
src/lib/notes/sync/cache-sync.ts (15 errors)
```

### Tool Constraints (Both Stories)
**CRITICAL**: This agent has LIMITED permissions:
- write: false (do NOT create new files)
- edit: true (can modify existing code files)
- bash: true (can run `pnpm tsc --noEmit` and tests)
- task: false (do NOT delegate further)

**Role Boundaries:**
- dev-ext - Fix TypeScript errors ONLY in specified files
- WHAT NOT TO DO: Do NOT modify any other files, do NOT add new features, do NOT refactor beyond error fixes

**Required Output:**
- Report location: `_bmad-output/sprint-artifacts/reports/TS-DEBT-01-02-completion-2026-01-25.md`
- Success criteria:
  - 0 TypeScript errors in Agent Tools domain
  - 0 TypeScript errors in Notes Sync domain
  - Total errors reduced from ~115 to <20
- Timebox: 6 hours (3 hours for TS-DEBT-01, 2 hours for TS-DEBT-02, 1 hour buffer)

---

## 📊 SUCCESS METRICS (OVERALL)

| Metric | Before | Target | After Phase |
|--------|--------|--------|-------------|
| YAML parse errors | 19 | 0 | Phase 1 ✅ |
| ADR conflicts | 3 | 0 | Phase 2 ✅ |
| EPIC-ARCH-03 completion | 6/7 | 7/7 | Phase 3 ✅ |
| TypeScript errors (P0) | 70 | 0 | Phase 4 ✅ |
| TypeScript errors (total) | 115 | <20 | Phase 4 ✅ |
| LOOP_STATE freshness | Stale | <24h | Updated continuously |

---

## 🔄 EXECUTION FLOW

```
START (Session: arch-03-audit-2026-01-25)
  │
  ├─► Phase 1: CTX-02 (tech-writer-ext)
  │     └─► Verify YAML files parse correctly
  │     └─► Update LOOP_STATE.yaml
  │     └─► Generate completion report
  │
  ├─► Phase 2: CTX-01 (tech-writer-ext) [BLOCKED by Phase 1]
  │     └─► Archive superseded ADRs
  │     └─► Update LOOP_STATE.yaml
  │     └─► Generate completion report
  │
  ├─► Phase 3: ARCH-03-05-FIX (dev-ext) [BLOCKED by Phase 2]
  │     └─► Fix TypeScript errors in ARCH-03-05 files
  │     └─► Verify ARCH-03-05 components render
  │     └─► Update LOOP_STATE.yaml
  │     └─► Generate completion report
  │     └─► 🎉 EPIC-ARCH-03 COMPLETE (7/7 stories)
  │
  └─► Phase 4: TS-DEBT-01 & TS-DEBT-02 (dev-ext) [BLOCKED by Phase 3]
        └─► Fix Agent Tools type definitions (50 errors → 0)
        └─► Fix Notes Sync Map/Array issues (15 errors → 0)
        └─► Run `pnpm tsc --noEmit` to verify
        └─► Update LOOP_STATE.yaml
        └─► Generate completion report
        └─► 🎉 ALL PHASES COMPLETE
              └─► Generate final sprint report
              └─► Update AGENTS.md
              └─► Report success metrics
```

---

## 🚨 CRITICAL REMINDERS

1. **DO NOT skip phases** - Each phase unblocks the next
2. **DO verify completion** - Run validation after each phase
3. **DO update LOOP_STATE** - After EVERY story completion
4. **DO generate reports** - For every phase completion
5. **DO NOT exceed timebox** - Escalate if timeout reached
6. **DO NOT skip tool permissions** - Always set constraints when delegating

---

## 📝 GATEKEEPING CHECKPOINTS

### After Phase 1 (CTX-02)
- [ ] Both YAML files parse without errors
- [ ] `yamllint` passes (if available)
- [ ] LOOP_STATE.yaml updated
- [ ] Completion report generated

### After Phase 2 (CTX-01)
- [ ] All superseded ADRs marked
- [ ] ADR-036 consolidated
- [ ] ADR index updated
- [ ] No conflicts with ADR-034
- [ ] LOOP_STATE.yaml updated
- [ ] Completion report generated

### After Phase 3 (ARCH-03-05-FIX)
- [ ] 0 TypeScript errors in ARCH-03-05 files
- [ ] ARCH-03-05 components render
- [ ] ARCH-03-05 marked VERIFIED
- [ ] EPIC-ARCH-03 status: 7/7 done
- [ ] LOOP_STATE.yaml updated
- [ ] Completion report generated

### After Phase 4 (TS-DEBT-01 & TS-DEBT-02)
- [ ] 0 errors in Agent Tools domain
- [ ] 0 errors in Notes Sync domain
- [ ] Total TypeScript errors <20
- [ ] Build succeeds (`pnpm build`)
- [ ] LOOP_STATE.yaml updated
- [ ] Completion report generated

### Final Sprint Completion
- [ ] All success metrics met
- [ ] LOOP_STATE.yaml finalized
- [ ] AGENTS.md updated
- [ ] Final sprint report generated
- [ ] Success metrics report generated

---

## 🎬 READY TO EXECUTE

**Phase 1 is READY_TO_START.**

**Next Action:** Delegate CTX-02 to tech-writer-ext with proper tool constraints.
