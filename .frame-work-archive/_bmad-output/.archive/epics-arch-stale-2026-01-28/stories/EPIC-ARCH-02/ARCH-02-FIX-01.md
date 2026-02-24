# ARCH-02-FIX-01: Fix window.location.href Violation in ProjectContext

**Story ID:** ARCH-02-FIX-01
**Epic:** EPIC-ARCH-02 (Feature Plugins + Route Migration)
**Phase:** PHASE 1 - IMMEDIATE FIXES (Before continuing)
**Priority:** P0 (IMMEDIATE)
**Team:** Any (first available)
**Effort:** 15 minutes
**Timebox:** 30 minutes max
**Created:** 2026-01-21T00:00:00+07:00
**Status:** complete
**Completed At:** 2026-01-21T00:25:00+07:00
**Validation Result:** PASS (all acceptance criteria met)

---

## Context (Authority Documents)

### Primary Authority Documents
1. **ADR-034:** `_bmad-output/planning-artifacts/adr/ADR-034-project-centric-architecture-2026-01-20.md`
   - Section: Phase 1 Foundation requirements (line 159)
   - Requirement: "Replace all `window.location.href` with navigate()"

2. **CORRECT-COURSE:** `_bmad-output/correct-course/CORRECT-COURSE-ADR034-REMEDIATION-2026-01-20.md`
   - Section: Part 2.3 - Violation 1 (line 68)
   - Section: Part 4.1 - ARCH-02-FIX-01 (line 163)
   - Critical Finding: NEW code introduced window.location.href violation

### Violation Details

**File:** `src/infrastructure/context/project-context.tsx`
**Line:** 313 (in error boundary fallback component)
**Issue:** Uses `window.location.href = '/'` instead of `navigate()`

**Current Code:**
```typescript
// Line 313
onClick={() => window.location.href = '/'}
```

**Required Fix:**
```typescript
// Use TanStack Router navigate()
onClick={() => navigate({ to: '/' })}
```

**Why This Matters:**
- Violates ADR-034 Phase 1 requirement
- Bypasses router state management
- Creates inconsistent navigation pattern
- Independent architecture review flagged this as CRITICAL

---

## Description

Replace the `window.location.href` navigation in ProjectContext's error boundary fallback with proper TanStack Router navigation using `useNavigate`.

**User Story:**
As a developer,
I want all navigation in new ProjectContext code to use TanStack Router,
So that router state is managed consistently across the application.

---

## Acceptance Criteria

- [ ] Replace `window.location.href = '/'` with `navigate({ to: '/' })`
- [ ] Import `useNavigate` from `@tanstack/react-router` at top of file
- [ ] Add `const navigate = useNavigate();` inside component
- [ ] TypeScript compiles with 0 new errors
- [ ] No other `window.location.href` instances remain in this file
- [ ] Error boundary fallback still navigates to root correctly (manual verification)

---

## Implementation Steps

### Step 1: Add Import
```typescript
// At top of src/infrastructure/context/project-context.tsx
import { useNavigate } from '@tanstack/react-router';
```

### Step 2: Add Navigate Hook
```typescript
// Inside component function body (after other hooks)
const navigate = useNavigate();
```

### Step 3: Replace Navigation
```typescript
// Find line ~313 in error boundary fallback
// BEFORE:
onClick={() => window.location.href = '/'}

// AFTER:
onClick={() => navigate({ to: '/' })}
```

### Step 4: Verify
```bash
# Check for remaining violations
grep -n "window.location.href" src/infrastructure/context/project-context.tsx
# Expected: 0 matches

# Verify TypeScript
pnpm tsc --noEmit 2>&1 | grep -E "(project-context)"
# Expected: No errors
```

---

## Dependencies

**Blocks:**
- ARCH-02-FIX-02 (Cannot proceed with other fixes while violation exists)

**Required For:**
- ARCH-02-04 (FileTree Plugin + route migration)
- All subsequent EPIC-ARCH-02 stories

---

## Verification Commands

```bash
# 1. Check for window.location.href violations in new code
grep -rn "window.location.href" src/infrastructure/context/project-context.tsx
# Expected: 0 matches (SUCCESS)

# 2. Verify TypeScript compilation
pnpm tsc --noEmit
# Expected: Exit code 0 (0 errors)

# 3. Check imports are correct
grep -n "useNavigate" src/infrastructure/context/project-context.tsx
# Expected: 1 match at import statement

# 4. Check navigate() usage
grep -n "navigate({ to:" src/infrastructure/context/project-context.tsx
# Expected: 1 match at line 313 (or similar)
```

---

## Testing

**Manual Test (Post-Implementation):**
1. Load a project that triggers an error (or mock error state)
2. Click "Go to Hub" button in error boundary
3. Verify navigation to root route works
4. Check browser DevTools → Network tab → Confirm client-side navigation (not full page reload)

**Expected Behavior:**
- Error boundary renders correctly
- "Go to Hub" button triggers router navigation
- No full page reload occurs
- URL changes to `/` without page refresh

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| window.location.href removed | 0 instances | `grep -rn "window.location.href"` in target file |
| TypeScript errors | 0 | `pnpm tsc --noEmit` |
| useNavigate imported | Yes | `grep -n "import.*useNavigate"` |
| navigate() used | Yes | `grep -n "navigate({ to:"` |
| Manual test pass | ✅ | Error boundary button works |

---

## Handoff Artifacts

**Upon Completion:**
1. Modified file: `src/infrastructure/context/project-context.tsx`
2. Verification output saved to: `ARCH-02-FIX-01-completion.md`
3. TypeScript check output captured

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Navigation breaks | Low | Medium | Manual test verification |
| TypeScript error | Low | Low | Immediate compile check |
| Hook rules violation | Very Low | Medium | Verify hook placement in component |

---

## Notes

- This is a **CRITICAL FIX** - blocks all subsequent work in EPIC-ARCH-02
- This violation was introduced during EPIC-ARCH-01 work and flagged by independent review
- Fix is straightforward but demonstrates commitment to ADR-034 requirements
- No other code changes required for this story

---

## Related Stories

- **Previous:** None (first remediation story)
- **Next:** ARCH-02-FIX-02 (Fix File Extension Issues)
- **Related:** All EPIC-ARCH-01 stories (violation source)

---

## Approval

- [ ] Sprint-Manager Review
- [ ] Dev-Ext Assignment
- [ ] Implementation Complete
- [ ] Validation Passed
- [ ] Story Complete

---

**Next Action:** Assign to Dev-Ext for implementation
