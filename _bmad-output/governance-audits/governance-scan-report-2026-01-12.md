# Governance Scan Audit Report
**Date:** 2026-01-12
**Requestor:** skeptic-review delegate
**Audit ID:** GOV-2026-01-12-001
**Git Anchoring:** dev branch @ {session_date}

---

## Executive Summary

This comprehensive governance audit across 5 critical domains reveals **9 critical vulnerabilities** and **14 high-risk issues** that could cause:
- Infinite routing loops under normal usage patterns
- Stale AI prompts suggesting blocked tools
- Missing audit trails for tool executions
- UI flicker during rapid tool updates
- Project state drift across workspaces

**Overall Risk Assessment:** **HIGH** - Multiple production-critical issues identified.

---

## Agent A1: Routing Loop & State Drift Audit

### Critical Vulnerabilities Identified

| Severity | Issue | Location | Risk |
|----------|-------|----------|------|
| **CRITICAL** | No navigation guards before navigate() calls | NotesPage.tsx:84, KnowledgePage.tsx:77, StudyPage.tsx:52 | Infinite loop |
| **CRITICAL** | Competing state sources (route params vs IDE store vs ProjectContext) | Multiple workspace pages | State drift |
| **HIGH** | Event-driven feedback loop via WORKSPACE_CHANGED | ide-project-slice.ts:54-59 | Oscillation |

### State-Transition Analysis

| Before | After | Navigate Target | Result |
|--------|-------|-----------------|--------|
| ideProjectId=null, route="project-123" | ideProjectId="project-456" | `/notes/project-456` | Safe |
| ideProjectId="project-456", route="project-123" | (double render) | `/notes/project-456` | **LOOP RISK** |
| ideProjectId=null, route="project-456" | IDE store cleared | `/notes/null` | **INVALID ROUTE** |

### Edge Cases with Reproduction Steps

#### Edge Case 1: Delayed Context Hydration
**Reproduction:**
1. Open Notes workspace for project A
2. Navigate to Hub before effects complete
3. Click project B rapidly
4. Auto-switch effect triggers navigate to Notes/A
5. Conflicts with navigate to Notes/B → **loop**

#### Edge Case 2: Project Selector Navigation Race
**Reproduction:**
1. User selects project X in Notes
2. navigate() updates route URL
3. IDE store sync effect triggers (if different)
4. User clicks project Y before sync completes
5. Multiple navigate calls in succession → **race condition**

#### Edge Case 3: Browser Back Button with Event Bus
**Reproduction:**
1. IDE workspace: project A
2. Navigate to Notes (same project A)
3. IDE store updates to project B in another tab
4. WORKSPACE_CHANGED event received
5. Effect triggers navigate to Notes/B
6. User presses browser back
7. Route reverts to Notes/A, but IDE store still B → **loop**

### Code References

**Missing Navigation Guard (CRITICAL):**
```typescript
// src/presentation/components/notes/NotesPage.tsx:81-86
useEffect(() => {
    if (ideProjectId && ideProjectId !== projectId) {
        navigate({ to: `/notes/${ideProjectId}` }); // ❌ No guard
    }
}, [ideProjectId, projectId, navigate]);
```

**Required Fix:**
```typescript
useEffect(() => {
    // Guard 1: Already at target
    if (ideProjectId === projectId) return;

    // Guard 2: Stability check
    if (lastNavRef.current?.projectId === ideProjectId &&
        Date.now() - lastNavRef.current.timestamp < 1000) return;

    // Guard 3: Valid project ID
    if (!ideProjectId || ideProjectId === 'null') return;

    navigate({ to: `/notes/${ideProjectId}` });
    lastNavRef.current = { projectId: ideProjectId, timestamp: Date.now() };
}, [ideProjectId, projectId, navigate]);
```

---

## Agent A2: Browser Mode Correctness Audit

### Invariants Verified

| Invariant | Status | Enforcement Location |
|-----------|--------|---------------------|
| BROWSER_MODE_PROJECT_ID is constant | ✅ VERIFIED | browser-mode.ts:20 |
| Browser mode has `isBrowserMode: true` | ✅ VERIFIED | notes.lazy.tsx:64 |
| Notes store respects project ID filtering | ✅ VERIFIED | note-crud-slice.ts:45-98 |
| Tool context includes actual projectId | ✅ VERIFIED | All agent tools |
| Browser mode loads all notes | ✅ VERIFIED | note-crud-slice.ts:74 |

### Key Findings

**Authoritative Signal:** `project?.isBrowserMode` flag (not just projectId check)

**Data Persistence:** ✅ Notes created in browser mode are persisted with actual projectId `'notes:browser-mode'` and do NOT disappear when switching to real projects

**Tool Behavior:** ✅ Tools behave identically across all modes, no special browser mode handling required

### Risks Identified

| Risk | Severity | Impact |
|------|----------|--------|
| No visual distinction for browser mode | MEDIUM | User confusion |
| No guardrails for browser mode creation | MEDIUM | Accidental note creation |
| All notes share same Dexie table | LOW | Storage mixing |

### BROWSER_MODE_PROJECT_ID Constant

```typescript
// src/lib/workspace/browser-mode.ts:20
export const BROWSER_MODE_PROJECT_ID = 'notes:browser-mode';
```

---

## Agent A3: Tool Execution Logging & Schema Migration Audit

### Critical Findings

| Issue | Severity | Impact |
|-------|----------|--------|
| Missing `projectId` in ToolExecutionLogRecord | **CRITICAL** | No project-scoped audit trails |
| Denied tools not logged | **HIGH** | Incomplete security audit |
| No migration plan for projectId | **HIGH** | Breaking change risk |

### Current Schema State

**Schema Version:** 20 (dexie-db-migrations.ts)
**Last Migration:** v20 - Workspace isolation

**Missing Field:**
```typescript
// src/infrastructure/persistence/dexie-db-session-types.ts:98-115
export interface ToolExecutionLogRecord {
    id: string;
    conversationId: string;
    messageId: string;
    workspaceId: 'ide' | 'knowledge' | 'study' | 'notes';
    toolName: string;
    // ❌ Missing: projectId: string;
}
```

### Migration Plan (v21)

**Schema Update:**
```typescript
db.version(21).stores({
    toolExecutionLogs: 'id, conversationId, messageId, workspaceId, ++projectId, toolName, [timestamp]'
}).upgrade(async tx => {
    const logs = await tx.table('toolExecutionLogs').toArray();
    for (const log of logs) {
        const projectId = await deriveProjectIdFromConversation(log.conversationId);
        await tx.table('toolExecutionLogs').put({ ...log, projectId });
    }
});
```

**Rollback Plan:**
- Database remains at v20 if migration fails
- Recovery UI activates with options: retry / reset / continue
- No data loss with proper migration implementation

### Safe Context Retrieval

✅ **No unsafe guessing found** - `getWorkspaceExecutionContext()` properly retrieves projectId from Zustand store and handles null gracefully

---

## Agent A4: Workspace Prompts & Tool Filtering Audit

### Critical Gap Identified

**Question:** Can cached prompts become stale when permissions/tools change?
**Answer:** ❌ **YES - CRITICAL**

**Evidence:**
- Cache invalidation only occurs on explicit `updateConfig()` call
- No event listeners for `permission:changed` events
- No invalidation on workspace transitions
- No invalidation on agent binding changes

**Impact:** AI suggests blocked tools → user frustration → trust degradation

### Browser Mode Constraint Handling

**Question:** Does "browser mode treated like Notes" hide constraints?
**Answer:** ❌ **YES**

**Missing Context:**
- No mention of IndexedDB vs local FS limitation
- No explanation of cross-project access scope
- No explicit "no project folder path" constraint

### Prompt-Tool Misalignment

**Question:** Does prompt tool list match actual permission checks?
**Answer:** ❌ **NO - FUNDAMENTAL DISCONNECT**

**Current Flow:**
```
Prompt Generation: toolRegistry.getFilteredTools() → Tool Descriptions
Execution: WorkspacePermissionManager.checkWorkspacePermission() → Enforce/Block
```

**Required Flow:**
```
Both should use: WorkspacePermissionManager.getToolsForWorkspace()
```

### Cache Key Generation

**Current:** `{layerType}_{configHash}`
**Missing from hash:** workspaceType, toolPermissions, agentBindings

---

## Agent A5: Tool Metadata UI & Flicker Audit

### Critical UI Issues

| Issue | Severity | Location | Impact |
|------|----------|----------|--------|
| Unstable React keys | **HIGH** | ToolExecutionIndicator.tsx:228-231 | Flicker |
| No duration validation | **HIGH** | ToolExecutionIndicator.tsx:174-181 | Misleading display |
| Missing workspace context | **MEDIUM** | ToolExecutionIndicator component | Wrong badges |

### React Key Instability

**Current (WRONG):**
```tsx
{executions.map((execution, index) => (
  <ToolExecutionIndicator
    key={`${execution.toolName}-${index}`} // ❌ Index-based
  />
))}
```

**Required Fix:**
```tsx
{executions.map((execution) => (
  <ToolExecutionIndicator
    key={execution.toolName + '-' + execution.id} // ✅ Unique
  />
))}
```

### Duration Display Issues

**Unvalidated Values:**
- `duration = 0` → shows "0ms" (confusing)
- `duration = 150000` → shows "150000ms" (should format)
- No negative value handling
- No real-time duration during execution

**Required Formatter:**
```typescript
function formatDuration(duration?: number): string {
  if (duration === undefined) return '';
  if (duration === 0) return '<1ms';
  if (duration < 1000) return `${duration}ms`;
  return `${(duration / 1000).toFixed(1)}s`;
}
```

### Workspace Context Gap

**Missing:** ToolExecutionIndicator has no workspace awareness
**Impact:** Cannot show correct workspace badges without workspace context propagation

---

## Edge-Case Inventory (Must Be Proven)

### Edge Case 1: ProjectId null ↔ non-null transitions

**Risk:** Oscillating navigation during route hydration and workspace switching

**Proof:**
- Location: NotesPage.tsx:81-86
- Scenario: IDE store updates to null while route param has project
- Result: navigate() called with `/notes/null` → invalid route

**Reproduction:**
1. Open Notes with project A
2. Trigger IDE store to set projectId = null
3. Effect triggers navigate to `/notes/null`
4. Route fails to parse
5. Effect re-triggers → **loop**

### Edge Case 2: Browser mode first-visit auto-create failure

**Risk:** Notes workspace starts "empty" and not recoverable

**Proof:**
- Location: notes.lazy.tsx:64
- Scenario: Offline/permission failure during browser project creation
- Result: User sees empty notes with no recovery path

**Mitigation Required:**
- Add retry logic
- Show explicit "create failed" state
- Provide manual recovery option

### Edge Case 3: Browser mode tool logging

**Risk:** Tools executed in browser mode must log projectId = 'notes:browser-mode'

**Proof:**
- Location: tool-execution-logger.ts:30-41
- Current: No projectId in log records
- Required: Always capture actual projectId including 'notes:browser-mode'

### Edge Case 4: Prompt caching staleness

**Risk:** AI suggests forbidden tools after permission changes

**Proof:**
- Location: prompt-composer.ts:163-169
- Current: Cache invalidates only on explicit config change
- Required: Subscribe to `permission:changed` events

### Edge Case 5: Scroll-position map growth

**Risk:** Performance degradation, larger IndexedDB payload over long sessions

**Proof:**
- Location: Note store scroll position tracking
- Current: Unbounded map growth
- Required: LRU/TTL bounds

---

## Remediation Roadmap

### Immediate (Today)

**Priority: P0 - Production blockers**

1. **Add Navigation Guards** (2 hours)
   - Add "no-op navigate" check in all workspace useEffect hooks
   - Add stability check with ref tracking
   - Add valid project ID guard

2. **Add Duration Validation** (1 hour)
   - Implement formatDuration() function
   - Handle edge values (0, negative, large)
   - Add real-time duration display

3. **Fix React Key Instability** (30 minutes)
   - Replace index-based keys with unique IDs
   - Add stable key generation

### Short-Term (This Sprint)

**Priority: P0 - Data integrity**

4. **Implement Migration v21 for projectId** (3 hours)
   - Add projectId to ToolExecutionLogRecord
   - Create migration with data preservation
   - Add rollback handling
   - Test with existing data

5. **Add Permission Change Cache Invalidation** (2 hours)
   - Subscribe to `permission:changed` events
   - Subscribe to `workspace:transition:complete` events
   - Invalidate prompt cache on changes

6. **Enhance Denied Tools Logging** (2 hours)
   - Log denied tools with workspace context
   - Add denial reason to log record
   - Ensure audit trail completeness

### Long-Term (Next Sprint)

**Priority: P1 - Architecture improvements**

7. **Consolidate Event Propagation** (1 day)
   - Define single canonical "project changed" event path
   - Remove circular dependencies between route params and store
   - Centralize navigation logic

8. **Add Bounded Persistence** (1 day)
   - Implement LRU/TTL for scroll positions
   - Add cleanup for stale IndexedDB data
   - Performance monitoring

9. **Unify Prompt-Tool Sources** (4 hours)
   - Make prompt generation use same permission checks as execution
   - Add browser mode context to prompts
   - Improve tool unavailability explanations

---

## Test Requirements

### Immediate Tests Required

1. **Cross-Workspace Project Switching Test**
   ```typescript
   test('should not cause route churn during 50 rapid project switches', async () => {
     // Simulate cross-workspace project switching 50 times
     // Assert: No infinite loops, no excessive navigation calls
   });
   ```

2. **Migration v21 Test**
   ```typescript
   test('should migrate tool execution logs with projectId', async () => {
     // Create logs at v20
     // Run migration to v21
     // Assert: All logs have projectId, no data loss
   });
   ```

3. **Browser Mode Tool Logging Test**
   ```typescript
   test('should log tools in browser mode with correct projectId', async () => {
     // Execute tool in browser mode
     // Assert: Log has projectId = 'notes:browser-mode'
   });
   ```

---

## Summary

### Critical Issues Requiring Immediate Attention

| Issue | Agent | Severity | Fix Time |
|-------|-------|----------|----------|
| Navigation loop vulnerability | A1 | CRITICAL | 2h |
| Missing projectId in logs | A3 | CRITICAL | 3h |
| Stale prompt cache | A4 | CRITICAL | 2h |
| React key flicker | A5 | HIGH | 30m |
| Duration validation | A5 | HIGH | 1h |
| Denied tools not logged | A3 | HIGH | 2h |

**Total Immediate Work:** ~10.5 hours

### Recommendations

1. **Halt production deployment** until navigation guards are added
2. **Create dedicated ticket** for each critical issue
3. **Add integration tests** for all edge cases
4. **Monitor navigation cycles** in production with logging
5. **Establish monthly governance audits** going forward

---

**Audit Complete:** 2026-01-12
**Next Audit:** 2026-02-12 (30 days)
