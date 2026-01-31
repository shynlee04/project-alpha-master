# Remediation Roadmap
**Governance Scan Reference:** GOV-2026-01-12-001
**Date:** 2026-01-12
**Target Resolution:** 2026-01-26 (14 days)

---

## Roadmap Overview

This roadmap addresses **9 critical vulnerabilities** and **14 high-risk issues** identified in the governance scan. Work is organized into three phases: Immediate (today), Short-term (this sprint), and Long-term (next sprint).

---

## Phase 1: Immediate (Today) - Production Blockers

**Target Completion:** Same day
**Total Effort:** ~10.5 hours
**Priority:** P0 - Must fix before any production deployment

### 1.1 Navigation Guards Implementation

**Issue:** No-op navigate causing infinite loops
**Reference:** Agent A1, Edge Case #1
**Effort:** 2 hours
**Assignee:** TBD

**Tasks:**
- [ ] Add navigation guard to `NotesPage.tsx:81-86`
- [ ] Add navigation guard to `KnowledgePage.tsx:74-79`
- [ ] Add navigation guard to `StudyPage.tsx:49-54`
- [ ] Create reusable `useNavigationGuard` hook
- [ ] Add unit test for 50 rapid project switches

**Implementation Template:**
```typescript
// src/presentation/hooks/useNavigationGuard.ts
export function useNavigationGuard(
  targetId: string | null,
  currentId: string | null,
  navigate: (path: string) => void,
  basePath: string
) {
  const lastNavRef = useRef<{ id: string | null; timestamp: number }>();

  return useCallback(() => {
    // Guard 1: Already at target
    if (targetId === currentId) return;

    // Guard 2: Invalid target
    if (!targetId || targetId === 'null' || targetId === 'undefined') return;

    // Guard 3: Recent navigation to same target (debounce)
    if (lastNavRef.current?.id === targetId &&
        Date.now() - lastNavRef.current.timestamp < 1000) return;

    // Navigate
    navigate(`${basePath}/${targetId}`);
    lastNavRef.current = { id: targetId, timestamp: Date.now() };
  }, [targetId, currentId, navigate, basePath]);
}
```

**Acceptance Criteria:**
- [ ] No infinite loops during 50 consecutive project switches
- [ ] Null/invalid project IDs are ignored
- [ ] Already-at-target navigations are skipped

---

### 1.2 Duration Validation & Formatting

**Issue:** Misleading duration display (0ms, 150000ms, negative values)
**Reference:** Agent A5, Edge Case #5
**Effort:** 1 hour
**Assignee:** TBD

**Tasks:**
- [ ] Create `formatDuration()` utility function
- [ ] Replace raw duration display in `ToolExecutionIndicator.tsx`
- [ ] Add unit tests for edge values
- [ ] Add real-time duration for executing tools

**Implementation:**
```typescript
// src/lib/utils/format-duration.ts
export function formatDuration(duration?: number): string {
  if (duration === undefined) return '';
  if (duration === 0) return '<1ms';
  if (duration < 0) return 'Error';
  if (duration < 1000) return `${duration}ms`;
  if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`;
  const mins = Math.floor(duration / 60000);
  const secs = Math.floor((duration % 60000) / 1000);
  return `${mins}m ${secs}s`;
}
```

**Acceptance Criteria:**
- [ ] 0ms shows "<1ms"
- [ ] 150000ms shows "2m 30s"
- [ ] Negative values show "Error"
- [ ] Real-time duration updates during execution

---

### 1.3 React Key Stability Fix

**Issue:** Index-based keys causing flicker
**Reference:** Agent A5
**Effort:** 30 minutes
**Assignee:** TBD

**Tasks:**
- [ ] Replace `key={${toolName}-${index}}` with unique ID
- [ ] Verify no re-mounts during status transitions

**Implementation:**
```typescript
// Before
{executions.map((execution, index) => (
  <ToolExecutionIndicator
    key={`${execution.toolName}-${index}`} // ❌
  />
))}

// After
{executions.map((execution) => (
  <ToolExecutionIndicator
    key={execution.toolName + '-' + (execution.id || execution.startTime)} // ✅
  />
))}
```

**Acceptance Criteria:**
- [ ] No flicker during 20 rapid tool executions
- [ ] Components maintain state through status transitions

---

### 1.4 Prompt Cache Invalidation Fix

**Issue:** Stale prompts after permission changes
**Reference:** Agent A4, Edge Case #4
**Effort:** 2 hours
**Assignee:** TBD

**Tasks:**
- [ ] Subscribe to `permission:changed` event
- [ ] Subscribe to `workspace:transition:complete` event
- [ ] Add cache invalidation on subscription
- [ ] Add integration test for permission change flow

**Implementation:**
```typescript
// src/lib/agent/prompt-composer.ts
constructor() {
  // ... existing code

  crossWorkspaceEventBus.on('permission:changed', () => {
    this.invalidateCache();
  });

  crossWorkspaceEventBus.on('workspace:transition:complete', () => {
    this.invalidateCache();
  });

  agentEventBus.on('availability:changed', () => {
    this.invalidateCache();
  });
}
```

**Acceptance Criteria:**
- [ ] Prompt cache invalidates within 100ms of permission change
- [ ] AI never suggests blocked tools after permission change
- [ ] No performance degradation from frequent invalidation

---

### 1.5 Integration Test Suite

**Issue:** No automated tests for edge cases
**Reference:** All agents
**Effort:** 5 hours
**Assignee:** TBD

**Tests Required:**
- [ ] `cross-workspace-project-switching.test.ts` - 50 rapid switches
- [ ] `navigation-loop-prevention.test.ts` - Null ID handling
- [ ] `prompt-cache-invalidation.test.ts` - Permission change
- [ ] `duration-formatting.test.ts` - Edge values
- [ ] `browser-mode-tool-logging.test.ts` - ProjectId capture

**Test Example:**
```typescript
// cross-workspace-project-switching.test.ts
describe('Cross-workspace project switching', () => {
  it('should not cause route churn during 50 rapid project switches', async () => {
    const navigateSpy = vi.fn();
    const projects = Array.from({ length: 50 }, (_, i) => `project-${i}`);

    for (const projectId of projects) {
      useIDEStore.getState().setProjectId(projectId);
      await waitFor(() => expect(navigateSpy).toHaveBeenCalled());
    }

    // Assert: No more than 51 navigations (one per project, no loops)
    expect(navigateSpy).toHaveBeenCalledTimes(51);
  });
});
```

---

## Phase 2: Short-Term (This Sprint) - Data Integrity

**Target Completion:** End of current sprint
**Total Effort:** ~12 hours
**Priority:** P0 - Critical for auditability

### 2.1 Migration v21: Add projectId to Tool Logs

**Issue:** Missing project context in audit trails
**Reference:** Agent A3
**Effort:** 3 hours
**Assignee:** TBD

**Tasks:**
- [ ] Add `projectId` to `ToolExecutionLogRecord` interface
- [ ] Create migration v21 with data preservation
- [ ] Update `tool-execution-logger.ts` to capture projectId
- [ ] Test migration with existing data
- [ ] Document rollback procedure

**Schema Change:**
```typescript
// src/infrastructure/persistence/dexie-db-session-types.ts
export interface ToolExecutionLogRecord {
  id: string;
  conversationId: string;
  messageId: string;
  workspaceId: 'ide' | 'knowledge' | 'study' | 'notes';
  projectId: string; // ✅ ADD THIS
  toolName: string;
  args: unknown;
  result?: { success: boolean; output?: string; error?: string; duration?: number };
  approved: boolean;
  status: 'pending' | 'approved' | 'denied' | 'executed' | 'error';
  timestamp: number;
  createdAt: number;
}
```

**Migration Script:**
```typescript
// src/infrastructure/persistence/dexie-db-migrations.ts
db.version(21).stores({
  toolExecutionLogs: 'id, conversationId, messageId, workspaceId, ++projectId, toolName, [timestamp]'
}).upgrade(async tx => {
  const logs = await tx.table('toolExecutionLogs').toArray();
  for (const log of logs) {
    // Derive projectId from conversation context or set to unknown
    const projectId = await deriveProjectIdFromConversation(log.conversationId) ?? 'unknown';
    await tx.table('toolExecutionLogs').put({ ...log, projectId });
  }
  markMigrationApplied(21);
});
```

**Acceptance Criteria:**
- [ ] All new tool logs include projectId
- [ ] Migration preserves existing data (projectId = 'unknown' for legacy)
- [ ] Rollback works without data loss

---

### 2.2 Denied Tools Logging Enhancement

**Issue:** Security audit gaps for denied tools
**Reference:** Agent A3
**Effort:** 2 hours
**Assignee:** TBD

**Tasks:**
- [ ] Log denied tools with workspace context
- [ ] Add denial reason to log record
- [ ] Ensure consistent logging before permission check

**Implementation:**
```typescript
// src/lib/agent/factory.ts
export function createToolFactory<T>(
  toolId: string,
  config: ToolConfig<T>,
  logger: ToolExecutionLogger
) {
  return async (args: T, context: ToolContext) => {
    const workspaceContext = getWorkspaceExecutionContext();
    const logId = await logger.logExecution(
      context,
      toolId,
      args,
      workspaceContext.workspaceType,
      workspaceContext.projectId // ✅ Add this
    );

    // Permission check
    const permissionCheck = permissionManager.checkPermission(toolId, workspaceContext);

    if (!permissionCheck.canExecute) {
      // ✅ Log denial with context
      await logger.updateExecution(logId, {
        status: 'denied',
        result: {
          success: false,
          error: `Tool blocked: ${permissionCheck.reason}`
        },
        approved: false,
        projectId: workspaceContext.projectId
      });

      return createWorkspaceDeniedResponse(toolId, permissionCheck.reason);
    }

    // ... proceed with execution
  };
}
```

**Acceptance Criteria:**
- [ ] All denied tools are logged with workspace context
- [ ] Denial reason is captured
- [ ] Audit trail is complete

---

### 2.3 Browser Mode Error Recovery

**Issue:** Unrecoverable empty state on first visit
**Reference:** Agent A2, Edge Case #3
**Effort:** 2 hours
**Assignee:** TBD

**Tasks:**
- [ ] Add try-catch around browser project creation
- [ ] Show explicit error state with retry
- [ ] Add manual recovery option
- [ ] Test offline/permission failure scenarios

**Implementation:**
```typescript
// src/routes/notes.lazy.tsx
let browserProject: Project | null = null;
let browserModeError: Error | null = null;

try {
  browserProject = await createOrGetBrowserModeProject();
} catch (error) {
  browserModeError = error as Error;
  console.error('Browser mode project creation failed:', error);
}

if (browserModeError) {
  return (
    <BrowserModeError
      error={browserModeError}
      onRetry={() => window.location.reload()}
      onReset={() => clearBrowserModeData()}
    />
  );
}
```

**Acceptance Criteria:**
- [ ] Error state shown on browser mode failure
- [ ] Retry button works
- [ ] Reset option clears bad state
- [ ] Offline scenario handled gracefully

---

### 2.4 Prompt-Tool Source Unification

**Issue:** Prompt generation uses different source than execution
**Reference:** Agent A4
**Effort:** 3 hours
**Assignee:** TBD

**Tasks:**
- [ ] Make prompt generation use `WorkspacePermissionManager.getToolsForWorkspace()`
- [ ] Add browser mode context to prompts
- [ ] Improve tool unavailability explanations
- [ ] Add unit test for prompt-tool consistency

**Implementation:**
```typescript
// src/lib/agent/prompt-orchestrator.ts
private getToolsForMode(mode: AgentMode, workspaceType?: WorkspaceType): ToolDescription[] {
  // ✅ Use same source as execution
  const availableTools = permissionManager.getToolsForWorkspace(
    agent.tools,
    agent.workspaceBindings,
    workspaceType
  );

  return availableTools.map(tool => ({
    name: tool.toolName,
    description: this.getToolDescription(tool),
    // ✅ Add unavailability reason
    unavailableReason: tool.hasPermission ? undefined : tool.blockReason,
    // ✅ Add required workspace if not available
    availableIn: tool.hasPermission ? [workspaceType] : this.getWorkspacesWithTool(tool.toolId)
  }));
}
```

**Acceptance Criteria:**
- [ ] Prompt tool list matches executable tools 100%
- [ ] Blocked tools show explanation and alternative workspace
- [ ] Browser mode context included in prompts

---

### 2.5 Context Hydration Race Fix

**Issue:** Competing navigate() calls during initialization
**Reference:** Agent A1, Edge Case #2
**Effort:** 2 hours
**Assignee:** TBD

**Tasks:**
- [ ] Add navigation coordination to ProjectProvider
- [ ] Implement navigation queue/debounce
- [ ] Add integration test for rapid workspace switches

**Implementation:**
```typescript
// src/infrastructure/persistence/providers/ProjectProvider.tsx
const navigationQueueRef = useRef<{ target: string; timestamp: number }[]>([]);
const navigationTimeoutRef = useRef<NodeJS.Timeout>();

function queueNavigation(target: string) {
  navigationQueueRef.current.push({ target, timestamp: Date.now() });

  // Debounce: execute after 100ms of no new navigation requests
  clearTimeout(navigationTimeoutRef.current);
  navigationTimeoutRef.current = setTimeout(() => {
    const latest = navigationQueueRef.current[0]; // Get most recent
    if (latest) {
      navigate({ to: latest.target });
      navigationQueueRef.current = [];
    }
  }, 100);
}
```

**Acceptance Criteria:**
- [ ] Only one navigate() executed per 100ms window
- [ ] Latest target wins in rapid succession
- [ ] No navigation loops during initialization

---

## Phase 3: Long-Term (Next Sprint) - Architecture Improvements

**Target Completion:** End of next sprint
**Total Effort:** ~16 hours
**Priority:** P1 - Important for long-term stability

### 3.1 Single Navigation Source Architecture

**Issue:** Competing state sources causing confusion
**Reference:** Agent A1
**Effort:** 8 hours
**Assignee:** TBD

**Tasks:**
- [ ] Define single canonical "project changed" event
- [ ] Remove circular dependencies between route params and store
- [ ] Centralize all navigation logic
- [ ] Update all workspace pages to use centralized navigation

**Architecture:**
```
┌─────────────────────────────────────────────────────────────┐
│                    NavigationController                       │
│  - Single source of truth for navigation decisions           │
│  - Coordinates all navigate() calls                          │
│  - Applies guards, debouncing, and validation                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────┴─────────────────────┐
        │                                               │
   ┌─────────────────┐                         ┌─────────────────┐
   │   Route Params  │                         │   IDE Store     │
   │  (UI State)     │                         │ (App State)    │
   └─────────────────┘                         └─────────────────┘
```

**Acceptance Criteria:**
- [ ] Single source of truth for project state
- [ ] No circular dependencies
- [ ] All navigation goes through controller

---

### 3.2 Bounded Persistence Implementation

**Issue:** Unbounded map growth causing performance issues
**Reference:** Edge Case #6
**Effort:** 4 hours
**Assignee:** TBD

**Tasks:**
- [ ] Implement LRU cache for scroll positions
- [ ] Add TTL for stale IndexedDB data
- [ ] Add cleanup job for expired entries
- [ ] Performance monitoring

**Implementation:**
```typescript
// src/lib/persistence/bounded-cache.ts
export class BoundedCache<K, V> {
  private cache = new Map<K, { value: V; timestamp: number }>();
  private maxSize: number;
  private ttl: number; // milliseconds

  constructor(maxSize: number, ttl: number) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  set(key: K, value: V): void {
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldest = this.cache.keys().next().value;
      this.cache.delete(oldest);
    }

    this.cache.set(key, { value, timestamp: Date.now() });
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Check TTL
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    // LRU: move to end
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }
}
```

**Acceptance Criteria:**
- [ ] Scroll position cache limited to 100 entries
- [ ] Entries expire after 7 days
- [ ] Cleanup job runs on app startup
- [ ] No performance degradation over long sessions

---

### 3.3 Component Synchronization

**Issue:** Multiple tool display components with different behavior
**Reference:** Edge Case #7
**Effort:** 4 hours
**Assignee:** TBD

**Tasks:**
- [ ] Standardize status enum across all components
- [ ] Unify key generation strategy
- [ ] Create shared ToolStatusContext
- [ ] Consolidate to single display component

**Implementation:**
```typescript
// src/presentation/components/chat/tool-status.ts
export type ToolStatus = 'pending' | 'executing' | 'completed' | 'failed';

export interface ToolExecution {
  id: string;
  toolName: string;
  status: ToolStatus;
  duration?: number;
  workspace?: WorkspaceType;
  projectId?: string;
}

// All components use this shared type
```

**Acceptance Criteria:**
- [ ] Single status enum used everywhere
- [ ] Consistent key generation
- [ ] No flicker between component updates
- [ ] Shared context for tool state

---

## Summary

### Work Distribution

| Phase | Duration | Effort | Priority |
|-------|----------|--------|----------|
| Phase 1 - Immediate | 1 day | 10.5h | P0 |
| Phase 2 - Short-term | 1 sprint | 12h | P0 |
| Phase 3 - Long-term | 1 sprint | 16h | P1 |
| **Total** | ~3 weeks | **38.5h** | |

### Risk Mitigation

1. **Phase 1 items must block any production deployment**
2. **Phase 2 items required for complete audit trails**
3. **Phase 3 items improve long-term stability**
4. **Each item has defined acceptance criteria**

### Progress Tracking

Create GitHub issues for each task with:
- Clear acceptance criteria
- Estimated effort
- Dependencies
- Test requirements

---

**Roadmap Complete:** 2026-01-12
**Next Review:** 2026-01-13 (Phase 1 completion check)
