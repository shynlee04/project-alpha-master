# ARCH-02-FIX-04: Route Redirect Params Fix

**Story ID:** ARCH-02-FIX-04
**Epic:** EPIC-ARCH-02 (Cleanup)
**Created:** 2026-01-21
**Priority:** P0 - BLOCKS EPIC-ARCH-03
**Status:** IN PROGRESS
**Estimated Duration:** 30 minutes
**Team:** Either (quick fix)
**Depends On:** ARCH-02-10 (redirects created but with errors)

---

## Executive Summary

Fix missing `params` parameter in TanStack Router `redirect()` calls that causes TypeScript errors.

**Blocker Status:** This story BLOCKS EPIC-ARCH-03 from starting. Must resolve first.

---

## Problem Statement

After ARCH-02-10 completion (route migration to `/$projectId`), TypeScript errors remain in redirect calls:

| File | Line | Error | Fix Required |
|------|------|-------|--------------|
| `src/routes/ide.$projectId.tsx` | 50, 52 | Missing params in redirect() | Add `params: { projectId }` |
| `src/routes/notes.$projectId.tsx` | 52, 54 | Missing params in redirect() | Add `params: { projectId }` |

**Root Cause:**
- ARCH-02-10 created redirect() calls without proper `params` parameter
- TanStack Router redirect() requires both `to` AND `params` when path contains dynamic segments

---

## Acceptance Criteria

1. ✅ All TypeScript errors resolved (`pnpm tsc --noEmit` = 0 errors)
2. ✅ Application starts without errors (`pnpm dev`)
3. ✅ All routes navigate correctly:
   - `/ide/$projectId` → `/$projectId?layout=ide`
   - `/notes/$projectId` → `/$projectId?layout=notes`
4. ✅ No breaking changes to existing functionality

---

## Technical Details

### Fix 1: Add params to ide.$projectId redirect()

**File:** `src/routes/ide.$projectId.tsx`

**Current (Line 52):**
```typescript
throw redirect({ to: `/$projectId`, search: { layout: 'ide' } });
```

**Fix:**
```typescript
throw redirect({ to: `/$projectId`, params: { projectId }, search: { layout: 'ide' } });
```

### Fix 2: Add params to notes.$projectId redirect()

**File:** `src/routes/notes.$projectId.tsx`

**Current (Line 54):**
```typescript
throw redirect({ to: `/$projectId`, search: { layout: 'notes' } });
```

**Fix:**
```typescript
throw redirect({ to: `/$projectId`, params: { projectId }, search: { layout: 'notes' } });
```

### Additional Checks

Based on prompt, also verify:
1. `src/routes/$projectId.tsx` line 125 - Type mismatch (if exists)
2. `src/presentation/layouts/PluginLayout.tsx` line 135 - Type mismatch (if exists)

---

## Files to Modify

| File | Change Type | Lines Changed |
|------|--------------|---------------|
| `src/routes/ide.$projectId.tsx` | Add params to redirect | 1 |
| `src/routes/notes.$projectId.tsx` | Add params to redirect | 1 |
| `src/routes/$projectId.tsx` | Type alignment (if needed) | TBD |
| `src/presentation/layouts/PluginLayout.tsx` | Interface alignment (if needed) | TBD |

---

## Validation Steps

### Before Fix
```bash
# Should show errors
pnpm tsc --noEmit 2>&1 | grep -A 2 "redirect"
```

### After Fix
```bash
# Should show 0 errors
pnpm tsc --noEmit

# Application should start
pnpm dev
```

### Manual Testing
1. Navigate to `/ide/your-project-id`
2. Verify redirect to `/$your-project-id?layout=ide`
3. Verify layout preset works (FileTree, Monaco, Terminal, Chat load)
4. Navigate to `/notes/your-project-id`
5. Verify redirect to `/$your-project-id?layout=notes`
6. Verify layout preset works (FileTree, Notes, Chat load)
7. Verify no console errors

---

## Governance References

- **ADR-034:** Phase 2 (Feature Plugins) - Route migration (ARCH-02-10)
- **ADR-033:** Clean Architecture - Type safety and interface consistency
- **EPIC-ARCH-03:** Layout System & UX - BLOCKED until this fix completes
- **TanStack Router Docs:** redirect() function signature (to + params for dynamic routes)

---

## Tool Constraints

**CRITICAL**: This agent has LIMITED permissions:
- **write:** true - Can create completion reports
- **edit:** true - Can modify route files ONLY (redirect calls)
- **bash:** true (limited) - Can run `pnpm tsc --noEmit`, `pnpm dev` - NO restart
- **task:** true - Can delegate with same constraints

**Role Boundaries:**
- **Dev-Ext:** Implementation ONLY (fixes to redirect calls)
- **NO modifying ADR-034 or EPIC-ARCH-03 (read-only)**
- **NO new routes (only fix existing redirect calls)**
- **NO window.location.href (use TanStack Router redirect() correctly)**
- **NO imports from @/lib/workspace/ProjectContext**

**Required Output:**
- Report location: `_bmad-output/sprint-artifacts/stories/EPIC-ARCH-02/ARCH-02-FIX-04-completion.md`
- Success criteria:
  1. `pnpm tsc --noEmit` = 0 errors
  2. `pnpm dev` starts without errors
  3. Redirects work correctly
- Timebox: 30 minutes

---

## Delegation Instructions

Delegate to **dev-ext** with:
1. Read current state of 2 route files
2. Fix redirect() calls to include `params: { projectId }`
3. Run TypeScript validation
4. Test redirects manually
5. Create completion report

**Escalation Path:**
- If TypeScript errors persist beyond 1 hour → escalate to architect-ext
- If breaking changes introduced → rollback and re-analyze

---

## Handoff Artifacts

- ✅ This story file (ARCH-02-FIX-04.md)
- ⏳ Context file (to be created in Step 3)
- ⏳ Completion report (to be created in Step 7)

---

## Story Metadata

- **Created By:** bmad-sprint-manager
- **Created At:** 2026-01-21
- **Session ID:** epic-arch-03-sprint-2026-01-21
- **ADR Reference:** ADR-034 (Phase 2 ✅ COMPLETE, Phase 3 🔄 IN PROGRESS)
- **Epic Status:** EPIC-ARCH-02 ✅ COMPLETE (pending this fix)
