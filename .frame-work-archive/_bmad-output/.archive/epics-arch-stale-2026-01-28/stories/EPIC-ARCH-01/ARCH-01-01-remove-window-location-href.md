# Story: ARCH-01-01 - Remove window.location.href (11 instances)
**Created:** 2026-01-21 | **Status:** PENDING | **Team:** A | **Priority:** P0

---

## 📋 Story Details

| Field | Value |
|-------|-------|
| **Story ID** | ARCH-01-01 |
| **Name** | Remove window.location.href (11 instances) |
| **Effort** | 2 hours |
| **Team** | A |
| **Priority** | P0 |
| **Status** | pending |
| **Dependencies** | None |
| **Epic** | EPIC-ARCH-01 (Foundation Cleanup) |

---

## 📝 Description

As a developer, I want to remove all 11 instances of `window.location.href` that cause hydration issues and replace them with proper TanStack Router navigation, so that the application has consistent routing behavior without SSR/hydration mismatches.

---

## ✅ Acceptance Criteria

1. All 11 instances of `window.location.href` identified and documented
2. Instances replaced with TanStack Router `useNavigate()` hook or `Link` component
3. No hydration mismatches occur after refactoring
4. TypeScript compiles with 0 new errors
5. All navigation functionality works correctly
6. No regression in existing user flows

---

## 📊 Current State (11 Instances Found)

| # | File | Line | Context | Replace With |
|---|------|------|---------|--------------|
| 1 | `src/hooks/useCommandPalette.ts` | - | Navigation via command palette | `useNavigate()` |
| 2 | `src/routes/$__debug__.provider-playground.tsx` | - | HTTP-Referer header | **KEEP** (valid use) |
| 3 | `src/lib/offline/offline-detector.ts` | - | Fetch current URL | `window.location.href` (valid) |
| 4 | `src/lib/notifications/notification-manager.ts` | - | Navigate to notification link | `useNavigate()` |
| 5 | `src/lib/utils/mobile-error-handling.ts` | - | Redirect to root on error | `useNavigate()` |
| 6 | `src/lib/utils/mobile-error-handling.ts` | - | Redirect to root on error | `useNavigate()` |
| 7 | `src/lib/utils/error-handling.ts` | - | Redirect to root on error | `useNavigate()` |
| 8 | `src/presentation/components/common/DatabaseRecoveryDialog.tsx` | - | Pattern matching for URL | **KEEP** (valid use) |
| 9 | `src/presentation/components/ide/FileTree/hooks/useFileTreeActions.ts` | - | Navigate to hub | `useNavigate()` |
| 10 | `src/presentation/components/ide/FileTree/hooks/useFileTreeActions.ts` | - | Navigate to hub | `useNavigate()` |
| 11 | `src/presentation/components/ide/FileTree/hooks/useFileTreeActions.ts` | - | Navigate to hub | `useNavigate()` |

**Note:** 2 instances marked as **KEEP** are valid uses (HTTP-Referer header and pattern matching for recovery detection).

**Actual Replacements Needed:** 9 instances

---

## 🎯 Tasks

### Phase 1: Identification & Analysis
- [ ] Read each file containing `window.location.href`
- [ ] Verify each instance's purpose
- [ ] Determine appropriate replacement strategy

### Phase 2: Implementation
- [ ] Replace in `src/hooks/useCommandPalette.ts`
- [ ] Replace in `src/lib/notifications/notification-manager.ts`
- [ ] Replace in `src/lib/utils/mobile-error-handling.ts` (2 instances)
- [ ] Replace in `src/lib/utils/error-handling.ts`
- [ ] Replace in `src/presentation/components/ide/FileTree/hooks/useFileTreeActions.ts` (3 instances)

### Phase 3: Validation
- [ ] Run `pnpm tsc --noEmit` - no new errors
- [ ] Test navigation flows
- [ ] Verify hydration issues resolved

---

## 🔗 Dependencies

| Dependency | Status | Reason |
|------------|--------|--------|
| None | - | This story can start immediately |

---

## 📁 File Changes

| Action | File | Lines Changed |
|--------|------|---------------|
| modify | `src/hooks/useCommandPalette.ts` | ~10 |
| modify | `src/lib/notifications/notification-manager.ts` | ~10 |
| modify | `src/lib/utils/mobile-error-handling.ts` | ~20 |
| modify | `src/lib/utils/error-handling.ts` | ~10 |
| modify | `src/presentation/components/ide/FileTree/hooks/useFileTreeActions.ts` | ~30 |

---

## 🧪 Testing Strategy

1. **Unit Tests**: Add/verify tests for navigation functions
2. **Integration Tests**: Verify user flows work correctly
3. **E2E Tests**: Run existing Playwright tests to ensure no regressions
4. **Manual Testing**: Test command palette, notifications, and error flows

---

## 📝 Notes

- TanStack Router's `useNavigate()` hook should be used for programmatic navigation
- `Link` component should be used for navigation triggered by user actions
- Some `window.location.href` uses are valid (e.g., reading current URL, HTTP headers)
- Error handling navigation should maintain error context where possible

---

## ✅ Definition of Done

- [ ] All 9 replaceable instances converted to router navigation
- [ ] 2 valid uses documented and kept
- [ ] TypeScript compilation passes
- [ ] All tests pass
- [ ] No hydration warnings in console
- [ ] Code review completed
- [ ] Story marked complete in epic status
