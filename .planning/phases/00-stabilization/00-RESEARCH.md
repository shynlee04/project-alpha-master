# Phase 0: Stabilization - Research

**Researched:** 2026-02-01
**Domain:** Architecture remediation and contamination elimination
**Confidence:** HIGH (evidence-based from fresh codebase scan)

---

## Summary

The codebase is in a **contaminated state** that was incorrectly marked as Phase 1 complete. Fresh evidence from `pnpm typecheck:fast` reveals **39 TypeScript errors** - all related to `workspaceBindings` property violations - proving the KILL-PLAN elimination was never executed.

The ROADMAP shows Phase -1 (Preparation) and Phase 0 (Foundation Cleanup) as "Not started", yet Phase 1 was marked complete. This means **Phase 1 was built on contaminated ground**.

**Primary recommendation:** Insert Phase 0 as an urgent stabilization phase that eliminates all 1,054+ violations before any further feature work.

---

## Part 1: Current State Evidence (Fresh Scan 2026-02-01)

### 1.1 TypeScript Compilation Status

**Command:** `pnpm typecheck:fast`
**Result:** FAILED with 39 errors

| Error Type | Count | Root Cause |
|------------|-------|------------|
| `Property 'workspaceBindings' does not exist on type 'Project'` | 35 | Project type updated but consumers not migrated |
| Other TS errors | 4 | Test file violations |

**Key Affected Files:**
- `src/infrastructure/persistence/stores/project/*.ts` (6 files)
- `src/infrastructure/sync/pointer-sync-service.ts`
- `src/presentation/components/hub/*.ts` (5 files)
- `src/lib/workspace/*.ts` (3 files)
- `src/lib/settings/*.ts` (2 files)

### 1.2 Governance Violations

**Command:** `pnpm governance`
**Result:** FAILED with 24 oversized files

| Category | Count | Worst Offenders |
|----------|-------|-----------------|
| Components > 300 lines | 6 | resizable.tsx (592 lines, +97% over limit) |
| Hooks > 150 lines | 15 | usePlugins.ts (349 lines, +133% over limit) |
| Utilities > 200 lines | 3 | error-classification.ts (348 lines, +74% over limit) |

### 1.3 Banned Term Contamination

| Pattern | Count | Status |
|---------|-------|--------|
| Files containing `workspaceBindings` | 54 | ELIMINATE |
| Files containing `workspaceId` | 72 | ELIMINATE |
| Files using `@/lib/` imports | 440 | MIGRATE |
| Files named `*workspace*` | 30+ | RENAME or DELETE |

### 1.4 Circular Dependencies

**Command:** `pnpm deps:circular`
**Result:** ✅ PASSED - No circular dependencies found

---

## Part 2: The Contradiction

### What the Documents Claim

| Document | Claim |
|----------|-------|
| `STATE.md` | "Phase: 1 of 5 (Platform Operators) - ✓ VERIFIED" |
| `ROADMAP.md` | "Phase 1: Platform Operators | 6/6 | ✓ Complete" |

### What Fresh Evidence Shows

| Check | Expected | Actual |
|-------|----------|--------|
| `pnpm typecheck:fast` | Pass | **FAIL (39 errors)** |
| `pnpm governance` | Pass | **FAIL (24 violations)** |
| Phase 0 complete | Yes | **NO (marked "Not started")** |
| Phase -1 complete | Yes | **NO (marked "Not started")** |

### Root Cause

Phase 1 work was executed WITHOUT completing Phase 0 (Foundation Cleanup) first. The ROADMAP explicitly states:

> "Phase 1: Platform Operators - Depends on: Phase 0"

Yet Phase 0 success criteria were never met:
1. ❌ `grep workspaceBindings` returns 0 matches → Actually returns 54+ files
2. ❌ `grep workspaceId` returns 0 matches → Actually returns 72+ files  
3. ❌ `grep "from.*@/lib"` returns 0 matches → Actually returns 440+ files
4. ❌ `pnpm lint` passes with regression-prevention rules → Rules not even added

---

## Part 3: Standard Remediation Stack

### 3.1 Core Remediation Workflow

Based on the codebase's current state and the KILL-PLAN.md execution order:

| Wave | Focus | Files | Approach |
|------|-------|-------|----------|
| **Wave 1** | Type Definitions | 6 files | DELETE banned types at source |
| **Wave 2** | Infrastructure | 347+ violations | Update Dexie migrations, stores |
| **Wave 3** | Lib Imports | 440 files | Batch migrate @/lib → canonical |
| **Wave 4** | Components | 30+ files | Update UI consumers |
| **Wave 5** | Verification | All | TypeScript + lint + governance |

### 3.2 Verification Commands

```bash
# After each wave
pnpm typecheck:fast                    # Must pass
pnpm governance                        # Must pass
grep -r "workspaceBindings" src/ | wc -l  # Must be 0
grep -r "workspaceId" src/ | wc -l        # Must be 0
grep -r "@/lib/" src/ | wc -l             # Must be 0
```

---

## Part 4: Architecture Patterns

### 4.1 Clean Replacement Strategy

| Banned Term | Replacement | Location |
|-------------|-------------|----------|
| `workspaceBindings` | `enabledModules: ModuleType[]` | `ProjectSettings` |
| `workspaceId` | DELETE entirely | Files have only `projectId` |
| `@/lib/*` imports | Canonical paths | See migration map below |

### 4.2 Import Migration Map

| From | To |
|------|-----|
| `@/lib/workspace/*` | DELETE (workspace concept removed) |
| `@/lib/events/*` | `@/infrastructure/events/*` |
| `@/lib/utils/*` | `@/domain/utils/*` or inline |
| `@/lib/types/*` | `@/domain/schemas/*` |
| `@/lib/hooks/*` | `@/presentation/hooks/*` |
| `@/lib/storage/*` | `@/infrastructure/persistence/*` |

### 4.3 File Size Remediation

| File | Current | Limit | Action |
|------|---------|-------|--------|
| resizable.tsx | 592 | 300 | Extract into ResizableCore + handlers |
| usePlugins.ts | 349 | 150 | Split into usePluginLoader, usePluginState |
| error-classification.ts | 348 | 200 | Extract ErrorCategory enum + classifier functions |

---

## Part 5: Don't Hand-Roll

### Things That Already Exist

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Type migrations | Manual find/replace | AST transform with jscodeshift |
| Import path updates | Regex replacement | TypeScript compiler API |
| File renaming | Manual renames | Git mv + barrel export updates |
| Batch verification | Manual checks | npm scripts + CI gates |

### Key Insight

The previous Phase 1 attempted to add NEW code without first cleaning the EXISTING contamination. This is like painting over rust - the problem just spreads.

---

## Part 6: Common Pitfalls

### Pitfall 1: Partial Elimination

**What goes wrong:** Updating the Project TYPE but not updating consumers
**Why it happens:** Type definition changed, but 39+ files still reference old property
**How to avoid:** Run typecheck IMMEDIATELY after type changes
**Warning signs:** "Property X does not exist on type Y" errors

### Pitfall 2: Context Poisoning

**What goes wrong:** Planning documents claim completion without evidence
**Why it happens:** Documents updated before verification commands run
**How to avoid:** verification-before-completion skill MANDATORY
**Warning signs:** STATE.md says "VERIFIED" but `pnpm typecheck` fails

### Pitfall 3: Phase Skipping

**What goes wrong:** Feature work built on unstable foundation
**Why it happens:** Excitement to show progress, skip "boring" cleanup
**How to avoid:** Gate Phase N on Phase N-1 success criteria
**Warning signs:** Phases -1 and 0 marked "Not started" but Phase 1 "Complete"

### Pitfall 4: Import Path Leakage

**What goes wrong:** 440+ files still use `@/lib/` even though it's banned
**Why it happens:** No ESLint rule enforcing the ban
**How to avoid:** Add regression-prevention rules FIRST
**Warning signs:** grep "@/lib/" returns non-zero count

---

## Part 7: Code Examples

### 7.1 Type Definition Fix

```typescript
// BEFORE (src/domain/schemas/project.schema.ts - CONTAMINATED)
interface Project {
  id: string;
  workspaceBindings: WorkspaceBindings;  // ❌ BANNED
  // ...
}

// AFTER (src/domain/schemas/project.schema.ts - CLEAN)
interface Project {
  id: string;
  settings: ProjectSettings;  // ✅ CORRECT
  // ...
}

interface ProjectSettings {
  enabledModules: ModuleType[];  // ✅ CORRECT - replaces workspaceBindings
  defaultModule: ModuleType;
}
```

### 7.2 Consumer Update Pattern

```typescript
// BEFORE (contaminated consumer)
const workspaces = project.workspaceBindings;  // ❌ TS Error

// AFTER (clean consumer)
const enabledModules = project.settings?.enabledModules ?? ['ide'];  // ✅
```

### 7.3 Import Migration

```typescript
// BEFORE
import { someUtil } from '@/lib/utils/helpers';  // ❌ BANNED

// AFTER
import { someUtil } from '@/domain/utils/helpers';  // ✅ Canonical
```

---

## Part 8: State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Manual grep + fix | AST-based codemod | 10x faster, fewer errors |
| Hope it compiles | CI gate on typecheck | Blocks bad merges |
| "Phase complete" by feel | Evidence-based verification | No false claims |

---

## Part 9: Open Questions

### Q1: Should Phase 1 Work Be Reverted?

**What we know:** Phase 1 added working code on top of broken types
**What's unclear:** Does the Phase 1 code work at runtime despite TS errors?
**Recommendation:** Do NOT revert. Instead, fix the foundation (Phase 0) and the Phase 1 code becomes valid.

### Q2: How Long Will Stabilization Take?

**What we know:** 
- 39 TypeScript errors (focused on workspaceBindings)
- 54 files with workspaceBindings
- 72 files with workspaceId
- 440 files with @/lib imports

**Estimate:** 
- Wave 1-2 (types + infrastructure): 4-6 hours
- Wave 3 (imports): 2-4 hours (can be partially automated)
- Wave 4 (components): 2-3 hours
- Wave 5 (verification): 1-2 hours
- **Total: 9-15 hours**

### Q3: Can We Parallelize?

**Answer:** Partially. Waves 1-2 must be sequential (types before consumers). Wave 3 (imports) can run in parallel with Wave 4 (components) after Wave 2 completes.

---

## Part 10: Success Criteria

Phase 0 is complete when ALL of the following are TRUE:

| # | Criterion | Verification Command |
|---|-----------|---------------------|
| 1 | TypeScript compiles | `pnpm typecheck:fast` exits 0 |
| 2 | Governance passes | `pnpm governance` exits 0 |
| 3 | No workspaceBindings | `grep -r "workspaceBindings" src/ \| wc -l` = 0 |
| 4 | No workspaceId | `grep -r "workspaceId" src/ \| wc -l` = 0 |
| 5 | No @/lib imports | `grep -r "@/lib/" src/ \| wc -l` = 0 |
| 6 | ESLint rules active | Rules in eslint.config.js blocking banned patterns |
| 7 | No circular deps | `pnpm deps:circular` passes |

---

## Sources

### Primary (HIGH confidence)
- Fresh `pnpm typecheck:fast` output (2026-02-01)
- Fresh `pnpm governance` output (2026-02-01)
- Fresh grep counts on codebase (2026-02-01)

### Reference Documents
- `.planning/SOURCE-OF-TRUTH.md` - Canonical architecture
- `.planning/KILL-PLAN.md` - Elimination targets and execution order
- `.planning/ROADMAP.md` - Phase dependencies and success criteria

---

## Metadata

**Confidence breakdown:**
- Current state assessment: HIGH - based on fresh command output
- Remediation approach: HIGH - follows KILL-PLAN.md execution order
- Time estimates: MEDIUM - depends on hidden complexity

**Research date:** 2026-02-01
**Valid until:** Until stabilization complete (then archive)

---

## Recommendation

**Insert Phase 0: Stabilization as the IMMEDIATE next action.**

The roadmap already defines Phase 0 (Foundation Cleanup) with correct success criteria. This research confirms that Phase 0 was skipped, causing the current instability.

**Execution order:**
1. Execute KILL-PLAN.md Waves 1-5
2. Verify all success criteria pass
3. Add ESLint rules to prevent regression
4. Mark Phase 0 complete
5. Then (and only then) Phase 1 is truly ready for Phase 2

---

*Research complete. Ready for planning.*
