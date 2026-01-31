# ARCH-02-FIX-03: TypeScript Error Resolution

**Story ID:** ARCH-02-FIX-03
**Epic:** EPIC-ARCH-02 (Cleanup)
**Priority:** P0 - BLOCKING EPIC-ARCH-03
**Status:** READY TO START
**Team:** Either (quick fix)
**Estimated Duration:** 30 minutes
**Created:** 2026-01-21
**Depends On:** None

---

## Problem Statement

TypeScript errors from EPIC-ARCH-02 (~6-8 errors) are blocking EPIC-ARCH-03 execution. These errors prevent the application from compiling cleanly and must be resolved before any new work can begin.

## Errors to Fix

| File | Line | Error Type | Required Fix |
|------|------|------------|--------------|
| `src/routes/ide.$projectId.tsx` | 52 | Missing params in redirect | Add `params: { projectId }` to navigate() call |
| `src/routes/notes.$projectId.tsx` | 54 | Missing params in redirect | Add `params: { projectId }` to navigate() call |
| `src/routes/$projectId.tsx` | 125 | PluginLayoutProps mismatch | Add props to PluginLayoutProps interface OR remove props usage |

## Root Cause Analysis

### Error 1 & 2: Missing params in redirect (TanStack Router)

**Current Code (WRONG):**
```typescript
// ide.$projectId.tsx line 52
throw redirect({ to: `/$projectId`, search: { layout: 'ide' } });

// notes.$projectId.tsx line 54
throw redirect({ to: `/$projectId`, search: { layout: 'notes' } });
```

**Issue:** When using dynamic route parameters in redirect, the `params` object must be provided to resolve the template string `$projectId`.

**Fix Required:**
```typescript
// CORRECT
throw redirect({
  to: '/$projectId',
  params: { projectId },  // ← ADD THIS
  search: { layout: 'ide' }  // ← Keep search params
});
```

### Error 3: PluginLayoutProps mismatch

**Current Code ($projectId.tsx lines 124-127):**
```typescript
<PluginLayout
  initialPlugins={PLUGIN_PRESETS[layoutPreset]}
  initialLayoutMode={LAYOUT_MODE_PRESETS[layoutPreset]}
/>
```

**Current Interface (PluginLayout.tsx line 47):**
```typescript
interface PluginLayoutProps {}
```

**Issue:** PluginLayout is receiving props but the interface defines no props.

**Two Possible Solutions:**

**Solution A (Recommended):** Remove props from PluginLayout, handle initialization via query params or store
- **Pros:** Simpler interface, already supported by existing code
- **Cons:** Requires PluginLayout to handle initialization logic

**Solution B:** Add props to PluginLayoutProps interface
- **Pros:** Explicit initialization, cleaner parent code
- **Cons:** More complex interface, PluginLayout needs to handle props

**Decision:** Use **Solution A** - PluginLayout already supports initialization via PluginLayoutStore and query params. The props in `$projectId.tsx` are redundant.

---

## Implementation Plan

### Step 1: Fix redirect errors (10 minutes)

**File:** `src/routes/ide.$projectId.tsx`
- Line 52: Add `params: { projectId }` to redirect call

**File:** `src/routes/notes.$projectId.tsx`
- Line 54: Add `params: { projectId }` to redirect call

### Step 2: Fix PluginLayout props mismatch (10 minutes)

**File:** `src/routes/$projectId.tsx`
- Lines 124-127: Remove `initialPlugins` and `initialLayoutMode` props from PluginLayout component
- Rationale: PluginLayout already handles initialization via PluginLayoutStore and query params

### Step 3: Validate (10 minutes)

Run validation checks:
```bash
# TypeScript compilation
pnpm tsc --noEmit
# Expected: 0 errors

# Application startup
pnpm dev
# Expected: No console errors, application loads

# Manual route testing
# 1. Navigate to /$projectId (should work)
# 2. Navigate to /ide/$projectId (should redirect to /$projectId?layout=ide)
# 3. Navigate to /notes/$projectId (should redirect to /$projectId?layout=notes)
```

---

## Acceptance Criteria

- [ ] **AC-1:** All TypeScript errors resolved (`pnpm tsc --noEmit` = 0 errors)
- [ ] **AC-2:** Application starts without errors (`pnpm dev`)
- [ ] **AC-3:** Route `/$projectId` loads correctly with default layout
- [ ] **AC-4:** Route `/ide/$projectId` redirects to `/$projectId?layout=ide` correctly
- [ ] **AC-5:** Route `/notes/$projectId` redirects to `/$projectId?layout=notes` correctly
- [ ] **AC-6:** No breaking changes introduced (existing functionality preserved)
- [ ] **AC-7:** No new files created (fixes only in existing files)
- [ ] **AC-8:** No ADR files modified (ADR-034 unchanged)

---

## Files Modified

```
src/routes/ide.$projectId.tsx     (1 line modified - line 52)
src/routes/notes.$projectId.tsx    (1 line modified - line 54)
src/routes/$projectId.tsx           (3 lines modified - lines 124-127)
```

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|-------|-------------|---------|------------|
| Redirect loop in /ide route | Low | High | Test redirect conditions, ensure search params checked |
| PluginLayout initialization broken | Medium | High | Test all 3 routes after fix |
| TypeScript still shows errors | Low | High | Verify each fix compiles, run full tsc check |

---

## Compliance Checks

### ADR-034 Compliance
- ✅ No ADR file modifications
- ✅ No new routes created
- ✅ Existing redirect logic preserved
- ✅ Query params still work

### AGENTS.md Compliance
- ✅ Clean architecture paths maintained
- ✅ Import order followed
- ✅ No god class violations
- ✅ TypeScript strict mode maintained

### CORRECT-COURSE Compliance
- ✅ No window.location.href usage (not in scope)
- ✅ No imports from @/lib/workspace/ProjectContext (not in scope)

---

## Success Metrics

| Metric | Before | After | Status |
|--------|---------|--------|--------|
| TypeScript Errors | ~6-8 | 0 | 🎯 Target |
| Application Starts | ❌ Errors | ✅ Clean | 🎯 Target |
| Route Navigation | ❌ Redirect broken | ✅ All work | 🎯 Target |

---

## Handoff Instructions

### To Dev-Ext Agent

```markdown
## Task: Fix TypeScript Errors from EPIC-ARCH-02

### What to Do

Fix 3 TypeScript errors blocking EPIC-ARCH-03:

1. **src/routes/ide.$projectId.tsx line 52**
   - Add `params: { projectId }` to redirect call
   - Change: `throw redirect({ to: `/$projectId`, search: { layout: 'ide' } })`
   - To: `throw redirect({ to: '/$projectId', params: { projectId }, search: { layout: 'ide' } })`

2. **src/routes/notes.$projectId.tsx line 54**
   - Add `params: { projectId }` to redirect call
   - Change: `throw redirect({ to: `/$projectId`, search: { layout: 'notes' } })`
   - To: `throw redirect({ to: '/$projectId', params: { projectId }, search: { layout: 'notes' } })`

3. **src/routes/$projectId.tsx lines 124-127**
   - Remove `initialPlugins` and `initialLayoutMode` props from PluginLayout
   - Change: `<PluginLayout initialPlugins={...} initialLayoutMode={...} />`
   - To: `<PluginLayout />`
   - Rationale: PluginLayout handles initialization via store, props are redundant

### Tool Constraints

**CRITICAL**: This agent has LIMITED permissions:
- write: false - DO NOT create new files (fixes only)
- edit: true - Can modify existing code files
- bash: true (limited) - Can run commands (pnpm tsc --noEmit, pnpm dev) - NO restart services
- task: true - Can delegate further if approved

**Role Boundaries:**
- Dev-Ext - Implementation ONLY (NO architecture decisions)
- WHAT NOT TO DO:
  - NO modifying ADR-034
  - NO modifying EPIC-ARCH-03
  - NO creating new routes or files
  - NO changing PluginLayoutProps interface (remove props from usage instead)
  - NO adding imports from @/lib/workspace/ProjectContext

**Required Output:**
- Report location: _bmad-output/sprint-artifacts/stories/EPIC-ARCH-03/ARCH-02-FIX-03-completion.md
- Success criteria: All acceptance criteria met, 0 TypeScript errors
- Timebox: 30 minutes

### Authority Documents

Include in implementation:
- ADR-034: Project-Centric Architecture (Phase 2 complete, Phase 3 pending)
- EPIC-ARCH-03: Layout System & UX (blocked by this fix)
- AGENTS.md: Governance rules and validation requirements
- CORRECT-COURSE: No window.location.href, no deprecated imports
```

---

## Dependencies

**None** - This is a prerequisite fix, no dependencies on other stories

---

## Next Steps (After Completion)

1. **Run validation checklist** (AC-1 through AC-8)
2. **Create completion report** with metrics
3. **Report to Orchestrator** with completion summary
4. **Wait for authorization** before starting ARCH-03-01

---

## Approval

- [ ] Sprint-Manager (agent initiating story)
- [ ] Orchestrator (required before ARCH-03-01 can start)
- [ ] User (Product Owner) - Acknowledgement only (not blocking)

---

**Status:** READY TO START
**Next Story:** ARCH-03-01 (ProjectSidebar Component) - BLOCKED until FIX-03 complete
