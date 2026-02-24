# ARCH-01-01: Remove window.location.href (11 instances)

## Metadata
- **Story ID**: ARCH-01-01
- **Epic**: EPIC-ARCH-01
- **Team**: Team A
- **Effort**: 2 hours
- **Priority**: P0
- **Created**: 2026-01-21
- **Updated**: 2026-01-21

## Description
Remove all 11 instances of `window.location.href` that cause hydration issues
and replace with proper TanStack Router navigation.

## Context
The application currently uses `window.location.href` for navigation in multiple places,
which causes hydration mismatches during server-side rendering. TanStack Router provides
`useNavigate()` hook for proper programmatic navigation.

## Acceptance Criteria
- [ ] All 11 instances of `window.location.href` identified and removed
- [ ] TanStack Router `useNavigate()` or `Link` component used instead
- [ ] No hydration mismatches in development console
- [ ] TypeScript compiles without errors (`pnpm tsc --noEmit`)
- [ ] Navigation functions correctly across all use cases
- [ ] `grep -r "window\.location\.href" src/` returns 0 matches

## Tasks
- [ ] Identify all 11 instances via grep (DONE)
- [ ] Replace each instance with router-based navigation
- [ ] Validate no regressions
- [ ] Run TypeScript compiler
- [ ] Run grep verification

## File Locations (11 instances found)

| File | Line | Current Use | Replacement |
|------|------|-------------|-------------|
| useFileTreeActions.ts | 140 | `/hub` redirect | `navigate({ to: '/hub' })` |
| useFileTreeActions.ts | 150 | `/hub` redirect | `navigate({ to: '/hub' })` |
| useFileTreeActions.ts | 160 | `/hub` redirect | `navigate({ to: '/hub' })` |
| DatabaseRecoveryDialog.tsx | 112 | URL pattern test | Keep (read-only comparison) |
| mobile-error-handling.ts | 138 | `/` redirect | `navigate({ to: '/' })` |
| mobile-error-handling.ts | 240 | `/` redirect | `navigate({ to: '/' })` |
| $__debug__.provider-playground.tsx | 137 | HTTP-Referer header | Keep (read-only) |
| offline-detector.ts | 126 | Fetch current URL | Keep (read-only) |
| notification-manager.ts | 260 | link navigation | `navigate({ to: notification.link })` |
| error-handling.ts | 117 | `/` redirect | `navigate({ to: '/' })` |
| useCommandPalette.ts | 56 | path navigation | `navigate({ to: path })` |

## Dependencies
None

## Implementation Notes

### Read-Only Uses (Do NOT replace)
These instances read `window.location.href` for non-navigation purposes:
1. `DatabaseRecoveryDialog.tsx:112` - Pattern matching (read-only)
2. `$__debug__.provider-playground.tsx:137` - HTTP-Referer header (read-only)
3. `offline-detector.ts:126` - Fetch current page (read-only)

### Navigation Replacements (MUST replace)
These instances use `window.location.href` for navigation:
1. `useFileTreeActions.ts` (lines 140, 150, 160) - 3 instances
2. `mobile-error-handling.ts` (lines 138, 240) - 2 instances
3. `notification-manager.ts` (line 260) - 1 instance
4. `error-handling.ts` (line 117) - 1 instance
5. `useCommandPalette.ts` (line 56) - 1 instance

**Total navigation instances to replace: 8**

## Risk Mitigation
- **Hydration Issues**: Primary issue being addressed
- **Navigation Breaking**: Verify router is properly initialized
- **Event Handlers**: Ensure navigate() called within event handlers, not during render
- **Async Context**: Be careful with navigate() in async functions

## Success Metrics
- ✅ 8 navigation instances replaced (3 read-only kept)
- ✅ 0 TypeScript errors
- ✅ 0 grep matches for navigation uses
- ✅ All navigation flows tested and working
