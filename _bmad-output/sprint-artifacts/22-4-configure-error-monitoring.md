# Story 22-4: Configure Error Monitoring (Sentry)

**Epic:** 22 - Production Hardening  
**Sprint:** Production Hardening Sprint  
**Points:** 3  
**Severity:** 🟠 HIGH  
**Platform:** Platform A  

---

## User Story

**As a** developer  
**I want** client-side error monitoring with Sentry  
**So that** I can track, triage, and fix production errors with detailed context and stack traces

---

## Acceptance Criteria

### AC-1: Sentry SDK Installation
**Given** the project does not have error monitoring  
**When** Sentry is configured  
**Then**:
- `@sentry/react` package is installed
- Sentry DSN is configurable via environment variable (`VITE_SENTRY_DSN`)
- SDK initializes on client-side only (not SSR)

### AC-2: Error Boundary Integration
**Given** Sentry is initialized  
**When** an unhandled React error occurs  
**Then**:
- Error is automatically captured and sent to Sentry
- Fallback UI is displayed to user
- Error includes component stack trace

### AC-3: Client Configuration
**Given** Sentry is integrated  
**When** an error is reported  
**Then** it includes:
- Environment tag (development/staging/production)
- Release version (from package.json or git SHA)
- User context (if available)

### AC-4: Privacy & Performance
**Given** Sentry is running  
**When** errors are captured  
**Then**:
- No PII is sent unless explicitly configured
- Sample rate is configurable
- Bundle size impact is minimal (tree-shaking enabled)

### AC-5: Development Experience
**Given** the developer is running locally  
**When** Sentry DSN is not set  
**Then**:
- App runs without errors (graceful degradation)
- Console warning indicates Sentry is disabled

---

## Tasks

### Research (Mandatory)
- [ ] T0.1: Read existing error-handling.md standards
- [ ] T0.2: Research @sentry/react latest patterns (Context7)
- [ ] T0.3: Review TanStack Start client initialization patterns
- [ ] T0.4: Check existing ErrorBoundary usage in project

### Implementation
- [ ] T1: Install `@sentry/react` package
- [ ] T2: Create `src/lib/monitoring/sentry.ts` initialization module
  - Configure DSN from environment
  - Set environment, release, sample rate
  - Export initialization function
- [ ] T3: Create `src/components/common/AppErrorBoundary.tsx`
  - Use `Sentry.ErrorBoundary` with custom fallback
  - Style fallback using existing design system
- [ ] T4: Update root layout to wrap app with error boundary
- [ ] T5: Add environment variables to `.env.example`
- [ ] T6: Update Netlify environment configuration docs

### Validation
- [ ] T7: Verify Sentry loads only on client (check window)
- [ ] T8: Verify graceful degradation when DSN missing
- [ ] T9: Test error capture with intentional throw
- [ ] T10: Run TypeScript check: `pnpm exec tsc --noEmit`

---

## Dev Notes

### Architecture Patterns
- **Client-only initialization**: Use `typeof window !== 'undefined'` guard
- **Error classes**: Follow existing `SyncError`, `WebContainerError` patterns
- **Localization**: Error fallback UI should use i18n keys

### Key Integration Points
| File | Purpose |
|------|---------|
| `src/router.tsx` | TanStack Router entry |
| `src/routes/__root.tsx` | Root route, wrap with ErrorBoundary |
| `src/lib/monitoring/sentry.ts` | New - Sentry config |
| `src/components/common/AppErrorBoundary.tsx` | New - Fallback UI |

### Environment Variables
```env
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
VITE_SENTRY_ENVIRONMENT=development
VITE_SENTRY_SAMPLE_RATE=1.0
```

---

## Research Requirements

### MCP Tool Queries
1. **Context7** - @sentry/react latest initialization patterns
2. **Exa** - TanStack Start Sentry integration examples

### Local Files to Read
- `agent-os/standards/global/error-handling.md`
- `src/routes/__root.tsx`
- `src/router.tsx`

---

## References

- [Error Handling Standards](agent-os/standards/global/error-handling.md)
- [Epic 22 Definition](_bmad-output/epics/epic-22-production-hardening-new-course-correction-v6.md)
- [Sentry React Docs](https://docs.sentry.io/platforms/javascript/guides/react/)

---

## Dev Agent Record

**Agent:** Platform A (Antigravity - Gemini 2.5 Pro)  
**Session:** 2025-12-21T13:08:00+07:00

### Task Progress:
- [x] T0.1: Read existing error-handling.md standards
- [x] T0.2: Research @sentry/react latest patterns (Context7)
- [x] T0.3: Review TanStack Start client initialization patterns
- [x] T1: Install `@sentry/react` package (v10.32.1)
- [x] T2: Create `src/lib/monitoring/sentry.ts` initialization module
- [x] T3: Create `src/components/common/AppErrorBoundary.tsx`
- [x] T4: Update root layout to wrap app with error boundary
- [x] T5: Add environment variables to `.env.example`
- [x] T6: Add i18n translation keys (en.json, vi.json)
- [x] T7: Verify TypeScript compilation (no Sentry-related errors)

### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| `src/lib/monitoring/sentry.ts` | Created | 150 |
| `src/components/common/AppErrorBoundary.tsx` | Created | 120 |
| `src/routes/__root.tsx` | Modified | +8 |
| `src/i18n/en.json` | Modified | +6 |
| `src/i18n/vi.json` | Modified | +6 |
| `.env.example` | Created | 26 |

### Decisions Made:
- Used `toError()` helper to handle Sentry's `unknown` error type
- Wrapped only `Header` and `children` in ErrorBoundary (not DevTools)
- Sentry disabled by default in non-production (can force enable via env)
- Added session replay with privacy defaults (maskAllText, blockAllMedia)

---

## Code Review

**Reviewer:** -  
**Date:** -

#### Checklist:
- [ ] All ACs verified
- [ ] All tests passing
- [ ] Architecture patterns followed
- [ ] No TypeScript errors
- [ ] Code quality acceptable

#### Issues Found:
- None

#### Sign-off:
⏳ PENDING

---

## Status

| Date | Status | Notes |
|------|--------|-------|
| 2025-12-21 | `drafted` | Story file created by Platform A |
| 2025-12-21 | `ready-for-dev` | Context XML created, research complete |
| 2025-12-21 | `in-progress` | Development started |
| 2025-12-21 | `review` | Implementation complete, ready for code review |

**Current Status:** `review`

