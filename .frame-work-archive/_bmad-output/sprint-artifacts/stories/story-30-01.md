---
story_id: "30-01"
story_title: "Add ErrorBoundaries to all workspace routes"
epic_id: "EPIC-30"
priority: "P0"
effort_hours: 2
status: "draft"
created_at: "2026-01-08T06:30:00+07:00"
updated_at: "2026-01-08T06:30:00+07:00"
assigned_to: "@bmad-bmm-dev"
dependencies: []
research_artifacts:
  - source: "context7"
    query: "React ErrorBoundary best practices 2025"
    findings: 4
  - source: "deepwiki"
    query: "TanStack Router error boundary integration"
    findings: 3
  - source: "codebase-scan"
    query: "Current workspace route structure"
    findings: 6
---

# Story 30-01: Add ErrorBoundaries to all workspace routes

## Epic Context
**EPIC-30**: P0 Critical Fixes - Address critical stability issues affecting user experience.

## Overview
Add React ErrorBoundary components to all workspace routes (IDE, Knowledge, Notes, Study) to catch and gracefully handle runtime errors, preventing complete app crashes.

## Background
Currently, not all workspace routes have ErrorBoundary protection. When an unhandled error occurs in a workspace, the entire app can crash, leaving users with a blank screen and no recovery path.

## Acceptance Criteria

1. [ ] **AC1 - IDE Route Protected**: `/ide` route wrapped with ErrorBoundary
2. [ ] **AC2 - Knowledge Route Protected**: `/knowledge` route wrapped with ErrorBoundary
3. [ ] **AC3 - Notes Route Protected**: `/notes` route wrapped with ErrorBoundary
4. [ ] **AC4 - Study Route Protected**: `/study` route wrapped with ErrorBoundary
5. [ ] **AC5 - Fallback UI**: Each ErrorBoundary has custom fallback with error message
6. [ ] **AC6 - Error Logging**: Errors are logged to console for debugging
7. [ ] **AC7 - Recovery Action**: Fallback UI includes "Reload Workspace" button

## Dependencies

### Story Dependencies
- None (first story in EPIC-30)

### Code Dependencies
- `src/presentation/components/common/ErrorBoundary.tsx` (existing component)
- `src/routes/ide.tsx` (route file)
- `src/routes/knowledge.tsx` (route file)
- `src/routes/notes.tsx` (route file)
- `src/routes/study.tsx` (route file)

### Documentation
- `_bmad-output/scans/error-boundary-scan-report.md` - Current coverage analysis
- CLAUDE.md: Error Handling Architecture section

## Traceability Matrix

| PRD Req | AC | Test | Code | Review |
|---------|----|----|----|----|
| REQ-STAB-001 | AC1 | error-boundary-ide.test.tsx | routes/ide.tsx:wrapped | @code-reviewer |
| REQ-STAB-001 | AC2 | error-boundary-knowledge.test.tsx | routes/knowledge.tsx:wrapped | @code-reviewer |
| REQ-STAB-001 | AC3 | error-boundary-notes.test.tsx | routes/notes.tsx:wrapped | @code-reviewer |
| REQ-STAB-001 | AC4 | error-boundary-study.test.tsx | routes/study.tsx:wrapped | @code-reviewer |
| REQ-STAB-001 | AC5 | fallback-ui.test.tsx | routes/*/tsx:fallback | @code-reviewer |
| REQ-STAB-001 | AC6 | error-logging.test.tsx | components/common/ErrorBoundary.tsx:logError | @code-reviewer |
| REQ-STAB-001 | AC7 | recovery-action.test.tsx | routes/*/tsx:recovery button | @code-reviewer |

## Research Findings

### Source 1: Context7 - React ErrorBoundary Best Practices
**Finding**: React ErrorBoundary requires class component or react-error-boundary library. For function components with hooks, use `react-error-boundary` package.

**Key Patterns**:
```typescript
import { ErrorBoundary } from 'react-error-boundary';

function Fallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

<ErrorBoundary FallbackComponent={Fallback}>
  <YourComponent />
</ErrorBoundary>
```

**Impact**: Use existing ErrorBoundary component or upgrade to react-error-boundary for better recovery.

**References**:
- React docs on Error Boundaries
- react-error-boundary documentation

### Source 2: DeepWiki - TanStack Router Integration
**Finding**: TanStack Router supports error boundaries at the route level using the `errorComponent` option or by wrapping the route element.

**Integration Pattern**:
```typescript
// In route file
import { createFileRoute } from '@tanstack/react-router';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export const Route = createFileRoute('/ide')({
  component: () => (
    <ErrorBoundary fallback={<WorkspaceErrorFallback />}>
      <IDEWorkspace />
    </ErrorBoundary>
  )
});
```

**Impact**: Wrap route component content, not the route definition itself.

### Source 3: Codebase Scan - Current Route Structure
**Finding**: Current workspace routes have inconsistent error boundary coverage:

| Route | Current Status | Line |
|------|----------------|------|
| `/ide` (ide.tsx) | PARTIAL - only wraps specific components | 45-120 |
| `/knowledge` (knowledge.tsx) | NONE | 1-85 |
| `/notes` (notes.tsx) | NONE | 1-92 |
| `/study` (study.tsx) | NONE | 1-78 |

**Impact**: Knowledge, Notes, and Study routes need complete ErrorBoundary wrapping. IDE route needs review for complete coverage.

**Current ErrorBoundary Component**:
```typescript
// src/presentation/components/common/ErrorBoundary.tsx
interface ErrorBoundaryProps {
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  children: React.ReactNode;
}

// Props: fallback, onError (callback)
// Already exists and functional
```

### Source 4: Error Handling Audit
**Finding**: From `_bmad-output/scans/error-boundary-scan-report.md`:
- Only 40% of workspace routes have ErrorBoundary protection
- No consistent fallback UI pattern across routes
- Missing error logging in some existing boundaries

**Impact**: Need to establish consistent pattern for all routes.

## Implementation Plan

### Step 1: Review Existing ErrorBoundary (10 minutes)
```typescript
// Read and understand existing ErrorBoundary component
// Location: src/presentation/components/common/ErrorBoundary.tsx
// Verify it supports:
// - Custom fallback UI
// - Error callback for logging
// - Reset functionality
```

### Step 2: Create Consistent Fallback Component (20 minutes)
```typescript
// src/presentation/components/workspace/WorkspaceErrorFallback.tsx
interface WorkspaceErrorFallbackProps {
  workspaceType: 'ide' | 'knowledge' | 'notes' | 'study';
  error: Error;
  resetErrorBoundary: () => void;
}

// Features:
// - Workspace-specific messaging
// - Error details (dev mode only)
// - "Reload Workspace" button
// - "Return Home" button
// - ARIA alerts for accessibility
```

### Step 3: Wrap IDE Route (15 minutes)
```typescript
// src/routes/ide.tsx
import { ErrorBoundary } from '@/presentation/components/common/ErrorBoundary';
import { WorkspaceErrorFallback } from '@/presentation/components/workspace/WorkspaceErrorFallback';

export const Route = createFileRoute('/ide')({
  component: () => (
    <ErrorBoundary
      fallback={<WorkspaceErrorFallback workspaceType="ide" />}
      onError={(error) => console.error('[IDE Route Error]', error)}
    >
      <IDEWorkspace />
    </ErrorBoundary>
  )
});
```

### Step 4: Wrap Knowledge, Notes, Study Routes (30 minutes)
```typescript
// Repeat pattern for all three routes
// Each with workspace-specific configuration
```

### Step 5: Test Error Handling (15 minutes)
```bash
# Manual testing checklist
# 1. Trigger error in each workspace (devtools: throw new Error())
# 2. Verify fallback UI appears
# 3. Verify "Reload Workspace" button works
# 4. Verify error logged to console
```

### Step 6: Write Tests (20 minutes)
```typescript
// src/routes/__tests__/error-boundary.test.tsx
// Test for each route:
// - Error caught by boundary
// - Fallback renders
// - Recovery button works
```

## Validation Checklist

### Pre-Development
- [x] Research completed (3 sources analyzed)
- [x] Current error boundary coverage documented
- [x] Existing ErrorBoundary component reviewed
- [x] Implementation pattern established

### Post-Development
- [ ] All 7 ACs met
- [ ] All 4 workspace routes protected
- [ ] Tests pass (error simulation)
- [ ] TypeScript check passes
- [ ] Manual testing checklist complete
- [ ] Code reviewed by @code-reviewer

## Exit Criteria

Story is **DONE** when:
1. All 4 workspace routes wrapped with ErrorBoundary
2. Consistent fallback UI across all routes
3. Errors logged with workspace context
4. Recovery actions functional
5. Stories 30-04 and 30-05 can proceed (depend on error boundary infrastructure)

## Notes

- **Estimated Effort**: 2 hours
- **Risk**: LOW - non-breaking change (adds safety, doesn't modify existing logic)
- **Dependencies**: Story 30-04 (BYOK integration) and 30-05 (race condition fixes) depend on error boundaries being in place

## Test Scenarios

```typescript
// Manual test scenarios
1. IDE Workspace: Trigger error in file tree
2. Knowledge Workspace: Trigger error during source import
3. Notes Workspace: Trigger error in note editor
4. Study Workspace: Trigger error in quiz component
5. Recovery: Click "Reload Workspace" - should refresh route
6. Accessibility: Verify ARIA alerts fire on error
```

## Metadata

**Story Type**: Critical Fix / Stability
**Complexity**: Low (wrapping existing components)
**Risk Level**: LOW (adds safety, no behavior changes)
**Test Coverage Required**: Error simulation tests
**Rollback Plan**: Remove ErrorBoundary wrappers (simple revert)

---

**Generated**: 2026-01-08T06:30:00+07:00
**Workflow**: story-dev-cycle-v2.md
**Template Version**: 2.0.0
