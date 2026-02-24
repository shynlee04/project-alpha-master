# ESCALATION: ESC-001 - BYOK Model Loading Blocked by Systemic Contamination

**Created:** 2026-02-02
**Severity:** BLOCKING
**Escalated From:** Phase A-04B (Dev execution)
**Escalated To:** Architect Level
**Status:** AWAITING RESOLUTION

---

## Executive Summary

Phase A-04B ("Restore Model Loading") **cannot be completed at dev level** because:

1. **The proposed fix was wrong** - Hardcoded models get stale; models MUST be auto-loaded from provider APIs
2. **180+ TypeScript errors exist** - Most are `workspaceBindings`/`workspaceId` contamination (SOURCE-OF-TRUTH Part 6 violations)
3. **Schema contamination is systemic** - The whole codebase uses banned terminology, blocking any coherent fix
4. **Patching creates more mess** - Any low-level fix will conflict with the contaminated architecture

---

## What Was Attempted

Phase A-04B plan specified:
1. Replace `fetchModels` stub with hardcoded model fallback
2. Trigger model loading on API key save

**Why this was wrong:**
- **Hardcoded models become outdated** - Provider model lists change frequently
- **Should auto-load from API** - When key is saved, fetch models from provider's `/models` endpoint
- **The compact context gave wrong direction** - It inherited flawed A-04B-PLAN.md assumptions

---

## Evidence of Systemic Contamination

### TypeScript Errors (180+ errors)

From `pnpm typecheck:fast`:

```
src/application/services/AgentService.ts(90,31): error TS2339: Property 'ide' does not exist on type 'Partial<Record<"chat" | "editor" | "knowledge" | "notes" | "preview" | "study" | "terminal", boolean>>'

src/infrastructure/persistence/stores/use-app-store.ts(190,27): error TS2322: Type '{ workspaceBindings: {...}[] }' is not assignable to type 'AgentData'.
  Types of property 'workspaceBindings' are incompatible.
    Type '{ workspaceType: ... }[]' is not assignable to type '{ pluginType: ... }[]'.
      Property 'pluginType' is missing in type '{ workspaceType: ... }'

src/presentation/components/hub/HubHomePage.tsx(135,51): error TS2339: Property 'workspaceBindings' does not exist on type 'ProjectRecord'.
```

### Pattern Analysis

| Pattern | Violations | SOURCE-OF-TRUTH Status |
|---------|------------|------------------------|
| `workspaceBindings` | ~368 | **BANNED** (Part 6) |
| `workspaceId` | ~642 | **BANNED** (Part 6) |
| `workspaceType` | ~50+ | **BANNED** (Part 6) |
| `'ide'` as type | ~30+ | Not in PluginType union |

### Governance Violations (106 files)

From `pnpm governance`:
- 38 stores exceed 120 lines
- 68 components exceed 300 lines
- Many files use banned `@/lib/` imports

---

## Root Cause Analysis

### Why Phase A Can't Complete at Dev Level

```
User Journey: Configure LLM Provider → Save API Key → Models Should Load

What's Broken:
1. fetchModels is a STUB (logs "Phase 2 feature")
2. Fixing fetchModels requires clean schema interfaces
3. Schema interfaces are contaminated with workspaceBindings/workspaceId
4. Contamination spans 1000+ lines across 50+ files
5. Any patch creates MORE type conflicts
```

### The Strategic-Tactical Gap

```
HIGH-LEVEL (Architect):
  - SOURCE-OF-TRUTH.md defines clean architecture
  - workspaceBindings is BANNED
  - PluginType is defined: "chat" | "editor" | "knowledge" | "notes" | "preview" | "study" | "terminal"

MID-LEVEL (Planner):
  - Phase A-04B assumed schema is clean
  - Planned hardcoded fallback (wrong)
  - Didn't validate against codebase reality

LOW-LEVEL (Dev):
  - Attempted to patch fetchModels
  - Encountered 180+ TypeScript errors
  - Realized patch would worsen contamination
  - ESCALATED (correctly)
```

---

## What Architect Must Decide

### Option 1: Schema Migration First (Recommended)

Before ANY Phase A completion:

1. **Eliminate all workspaceBindings/workspaceId references** (~1000+ changes)
2. **Align types with SOURCE-OF-TRUTH.md Part 3** (Entity Model)
3. **Fix PluginType to include 'ide'** or remove 'ide' usage everywhere
4. **THEN resume Phase A with clean foundation**

**Effort:** High (2-3 days)
**Risk:** Low (fixes root cause)

### Option 2: Isolate BYOK from Contamination

1. Create isolated `@/infrastructure/providers/` module
2. Implement model auto-loading there (no workspaceBindings dependency)
3. Wire into existing UI without touching contaminated code
4. Defer schema cleanup to Phase B

**Effort:** Medium (1 day)
**Risk:** Medium (technical debt accumulates)

### Option 3: Continue Patching (NOT RECOMMENDED)

1. Patch fetchModels with hardcoded fallback
2. Add more type casts to suppress errors
3. Hope contamination doesn't block future phases

**Effort:** Low (2 hours)
**Risk:** HIGH (creates more mess, blocks Phase B/C/D/E)

---

## Required Decisions

| Decision | Options | Default if No Response |
|----------|---------|----------------------|
| Schema migration timing | Before Phase A / After Phase A / Never | Before Phase A |
| Model loading strategy | Auto-load from API / Hardcoded fallback | Auto-load from API |
| PluginType union fix | Add 'ide' / Remove 'ide' usage | Follow SOURCE-OF-TRUTH.md |

---

## Proposed Action

**PAUSE Phase A execution** until Architect:

1. Updates SOURCE-OF-TRUTH.md Part 6 with explicit migration strategy
2. Decides on schema cleanup timing
3. Approves model auto-loading approach (not hardcoded)

---

## Files Referenced

| File | Issue |
|------|-------|
| `src/infrastructure/persistence/stores/providers/provider-models-slice.ts` | fetchModels is STUB |
| `src/lib/agent/providers/hardcoded-models.ts` | Wrong approach (models should auto-load) |
| `.planning/SOURCE-OF-TRUTH.md` | Defines correct architecture (being violated) |
| `.planning/phases/A-byok-foundation/A-04B-PLAN.md` | Plan assumed hardcoded fallback (wrong) |

---

## Escalation Chain

```
Dev (gsd-project-researcher) 
  → This Escalation Document
    → Planner (gsd-planner)
      → Architect (architect-ext)
        → User Approval
          → Updated SOURCE-OF-TRUTH.md
            → Resume Phase A with corrected plan
```

---

**Awaiting Architect decision before resuming Phase A work.**
