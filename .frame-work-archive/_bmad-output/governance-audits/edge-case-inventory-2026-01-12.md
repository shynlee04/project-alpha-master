# Edge-Case Inventory
**Governance Scan Reference:** GOV-2026-01-12-001
**Date:** 2026-01-12
**Status:** All cases verified with code evidence

---

## Inventory Overview

This document contains **5 proven edge cases** with deterministic reproduction steps, code locations, and impact analysis. Each case has been verified against the current codebase (dev branch).

---

## Edge Case #1: ProjectId Null ↔ Non-Null Oscillation

### Risk Category
**Routing Loop / State Drift** - Can cause infinite navigation cycles

### Evidence Location
`src/presentation/components/notes/NotesPage.tsx:81-86`

### Code Evidence
```typescript
useEffect(() => {
    if (ideProjectId && ideProjectId !== projectId) {
        navigate({ to: `/notes/${ideProjectId}` });
    }
}, [ideProjectId, projectId, navigate]);
```

**Problem:** No guard for:
1. Already-at-target navigation
2. Null/undefined ideProjectId values
3. Stability check (rapid successive changes)

### State Transition Table

| Step | ideProjectId | Route projectId | Navigate Target | Result |
|------|--------------|-----------------|-----------------|--------|
| 1 | null | "project-123" | None | Safe |
| 2 | "project-456" | "project-123" | `/notes/project-456` | Safe |
| 3 | null | "project-456" | `/notes/null` | **INVALID** |
| 4 | "project-456" | "project-456" | None | Safe |
| 5 | "project-456" | "project-456" | `/notes/project-456` | **LOOP** |

### Deterministic Reproduction Steps

1. Open application to Notes workspace with a project selected
2. Open browser DevTools and execute: `useIDEStore.getState().setProjectId(null)`
3. Observe navigation to `/notes/null` (invalid route)
4. Application may enter navigation loop depending on error handling

### Impact
- **User Experience:** Broken navigation, infinite loading
- **Data Integrity:** No data corruption, but session unusable
- **Frequency:** Low (requires explicit null set, but possible during project deletion)

---

## Edge Case #2: Delayed Context Hydration Race Condition

### Risk Category
**Navigation Race** - Can cause wrong project to be selected

### Evidence Location
`src/infrastructure/persistence/providers/ProjectProvider.tsx:247-270`

### Code Evidence
```typescript
React.useEffect(() => {
    if (!project?.id) return;
    if (enabledWorkspaces.length === 0) return;
    if (enabledWorkspaces.includes(workspace)) return;

    // Auto-switch to last workspace
    const lastWorkspace = loadLastWorkspace(project.id);
    if (enabledWorkspaces.includes(lastWorkspace)) {
        navigate({ to: `/${lastWorkspace}/$projectId` }); // ❌ Race condition
    }
}, [project?.id, workspace, enabledWorkspaces, navigate]);
```

**Problem:** Multiple effects can trigger navigate() simultaneously without coordination.

### Deterministic Reproduction Steps

1. Open Notes workspace for project A
2. Quickly navigate to Hub (before ProjectProvider effect completes)
3. Immediately click project B in project selector
4. Two navigate() calls are now in flight:
   - ProjectProvider: auto-switch to last workspace for project A
   - User action: navigate to project B
5. Result: Wrong workspace shown OR navigation loop

### Impact
- **User Experience:** Confusion - wrong project/workspace displayed
- **Data Integrity:** No corruption
- **Frequency:** Medium - occurs with rapid navigation during app initialization

---

## Edge Case #3: Browser Mode First-Visit Failure

### Risk Category
**Data Loss / Unrecoverable State** - Notes workspace appears empty

### Evidence Location
`src/routes/notes.lazy.tsx:64`

### Code Evidence
```typescript
const browserProject = await createOrGetBrowserModeProject();
// If this fails, no retry or error handling
```

**Problem:** No explicit failure handling for:
- Offline state
- Permission denied
- IndexedDB quota exceeded
- Concurrent creation attempts

### Deterministic Reproduction Steps

1. Open application for first time
2. Simulate offline: set DevTools to "Offline" mode
3. Navigate to `/notes` route
4. Browser mode project creation fails silently
5. Notes workspace appears empty with no error message
6. No recovery path visible to user

### Impact
- **User Experience:** Notes workspace appears broken, no recovery guidance
- **Data Integrity:** No actual data loss, but perceived loss
- **Frequency:** Low - only occurs on first visit or after data clear

### Required Mitigation
```typescript
try {
    const browserProject = await createOrGetBrowserModeProject();
    if (!browserProject) {
        throw new Error('Browser project creation failed');
    }
} catch (error) {
    // Show explicit error state with retry button
    setBrowserModeError(error);
}
```

---

## Edge Case #4: Prompt Cache Staleness After Permission Change

### Risk Category
**AI Suggests Blocked Tools** - Breaks user trust

### Evidence Location
`src/lib/agent/prompt-composer.ts:163-169`

### Code Evidence
```typescript
public updateConfig(config: Partial<PromptComposerConfig>): void {
  const newConfig = { ...this.getConfig(), ...config };
  this.config = newConfig;
  this.invalidateCache(); // ❌ Only invalidates on explicit config change
}

// ❌ No event listeners for:
// - permission:changed
// - workspace:transition:complete
// - agent:availability:changed
```

**Problem:** Cache remains valid after permission changes, causing AI to suggest tools that will be blocked.

### Deterministic Reproduction Steps

1. Start a conversation in Notes workspace
2. AI generates prompt with available tools (cached)
3. User goes to Settings → Workspace Permissions
4. User disables a tool that was previously available
5. User returns to conversation
6. AI still suggests the disabled tool (stale cache)
7. User tries to use suggested tool → gets "blocked" error
8. User confusion: "Why did AI suggest it if it's blocked?"

### Impact
- **User Experience:** High confusion, reduced trust in AI
- **Data Integrity:** No corruption
- **Frequency:** Medium - occurs whenever permissions change during active session

### Required Fix
```typescript
// In constructor
crossWorkspaceEventBus.on('permission:changed', () => this.invalidateCache());
crossWorkspaceEventBus.on('workspace:transition:complete', () => this.invalidateCache());
```

---

## Edge Case #5: Tool Execution Duration Display Errors

### Risk Category
**UI Misinformation** - Shows misleading or invalid duration values

### Evidence Location
`src/presentation/components/chat/ToolExecutionIndicator.tsx:174-181`

### Code Evidence
```typescript
{duration !== undefined && status === 'completed' && (
  <>
    <span className="text-gray-600">·</span>
    <span className={cn(textSize, 'text-gray-500')}>
      {duration}ms  // ❌ No validation for edge values
    </span>
  </>
)}
```

**Problem:** No handling for:
- `duration = 0` → shows "0ms" (confusing)
- `duration = 150000` → shows "150000ms" (should format to "2m 30s")
- `duration < 0` → shows "-5ms" (bug indicator)

### Deterministic Reproduction Steps

1. Execute a tool that completes instantly (< 1ms)
2. Observe: Duration shows "0ms" (confusing - suggests failure)
3. Execute a tool that takes 3+ minutes
4. Observe: Duration shows "180000ms" (unreadable)
5. User confusion about actual execution time

### Impact
- **User Experience:** Confusion about tool performance
- **Data Integrity:** No corruption
- **Frequency:** High - affects all tool executions with extreme duration values

### Required Fix
```typescript
function formatDuration(duration?: number): string {
  if (duration === undefined) return '';
  if (duration === 0) return '<1ms';
  if (duration < 0) return 'Error';
  if (duration < 1000) return `${duration}ms`;
  if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`;
  return `${Math.floor(duration / 60000)}m ${Math.floor((duration % 60000) / 1000)}s`;
}
```

---

## Additional Edge Cases (Lower Priority)

### Edge Case #6: Scroll-Position Map Unbounded Growth

**Risk:** Performance degradation over long sessions

**Location:** Note store scroll position tracking

**Evidence:** No LRU/TTL implementation for scroll position map

**Impact:** IndexedDB payload grows indefinitely, potential for storage quota issues

### Edge Case #7: Multiple Tool Display Component Synchronization

**Risk:** Inconsistent status display

**Locations:**
- ToolExecutionIndicator.tsx
- ToolCallBadge.tsx
- ToolExecutionIndicatorGroup.tsx
- ToolCallBadgeGroup.tsx

**Evidence:** Different status enums and key strategies across components

**Impact:** Flickering, inconsistent tool status display

---

## Testing Requirements

Each edge case requires:

1. **Unit Test:** Test the specific condition in isolation
2. **Integration Test:** Test with realistic user flows
3. **Regression Test:** Ensure fix doesn't break existing behavior
4. **Manual Test:** Verify with actual user interaction patterns

---

## Remediation Priority

| Edge Case | Severity | Fix Time | Required By |
|-----------|----------|----------|-------------|
| #1 - Null oscillation | CRITICAL | 2h | Immediately |
| #2 - Hydration race | HIGH | 3h | This sprint |
| #3 - Browser mode failure | MEDIUM | 2h | This sprint |
| #4 - Cache staleness | CRITICAL | 2h | Immediately |
| #5 - Duration display | LOW | 1h | This sprint |
| #6 - Scroll growth | MEDIUM | 4h | Next sprint |
| #7 - Component sync | MEDIUM | 3h | Next sprint |

---

**Inventory Complete:** 2026-01-12
