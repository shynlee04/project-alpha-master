# 46-01: Unified Tool Context Propagation

**Epic:** EPIC-46 - Space-Aware Agent Orchestration
**Story:** 46-01
**Status:** READY (90% complete - verification needed)
**Created:** 2026-01-14
**Priority:** P1-HIGH
**Team:** Team A

---

## User Story

**As a** developer working on agent tool execution
**I want** all tool executions to receive and log workspace context (workspaceType, projectId)
**So that** tools can make workspace-aware decisions and we have a complete audit trail

---

## Epic Analysis

### Epic Basics
- **Number:** 46
- **Name:** Space-Aware Agent Orchestration
- **Status:** IN_PROGRESS
- **Progress:** 0% (0/4 stories complete)

### Epic Scope
- **Stories Total:** 4
- **Current Story:** 46-01 (tool context propagation)

---

## Current Problem

### Partial Context Coverage

The codebase has excellent infrastructure for workspace-aware tools:
- `workspace-execution-context.ts` provides `getWorkspaceExecutionContext()`
- `workspace-tool-filter.ts` provides `filterToolsForWorkspace()`
- `factory.ts` uses permission checks for all tools

**However**, there are gaps:
1. **projectId not logged** - ToolExecutionLogger only records `workspaceId`, not `projectId`
2. **Browser mode project handling** - Need to verify browser mode works correctly with tools
3. **Execution context not passed to logger** - Logger doesn't receive full workspace context

---

## Gap Analysis Results

### ✅ What's Already Working

| File | Feature | Status |
|------|----------|--------|
| `factory.ts` | `getWorkspaceExecutionContext()` before ALL tool executions | ✅ COMPLETE |
| `factory.ts` | Workspace permission checks for all 13 tools | ✅ COMPLETE |
| `tool-execution-logger.ts` | workspaceId logging | ✅ COMPLETE |
| `tool-execution-logger.ts` | duration tracking | ✅ COMPLETE |

### ❌ What's Missing

| Gap | Impact | Fix |
|-----|--------|-----|
| `projectId` not in log records | Can't track which project a tool ran in | Add `projectId` to `ToolExecutionLogRecord` |
| Browser mode project path resolution | Tools may fail in browser mode | Verify and test |
| Workspace type not in UI | Users can't see execution context | Covered in 46-03 |

---

## Acceptance Criteria

### AC1: All Tools Use Workspace Context ✅
- [x] `read_file` uses `getWorkspaceExecutionContext()`
- [x] `write_file` uses `getWorkspaceExecutionContext()`
- [x] `list_files` uses `getWorkspaceExecutionContext()`
- [x] `execute_command` uses `getWorkspaceExecutionContext()`
- [x] `synthesize` uses `getWorkspaceExecutionContext()`
- [x] `process_pdf` uses `getWorkspaceExecutionContext()`
- [x] `process_image` uses `getWorkspaceExecutionContext()`
- [x] `process_url` uses `getWorkspaceExecutionContext()`
- [x] `create_note` uses `getWorkspaceExecutionContext()`
- [x] `read_note` uses `getWorkspaceExecutionContext()`
- [x] `update_note` uses `getWorkspaceExecutionContext()`
- [x] `delete_note` uses `getWorkspaceExecutionContext()`
- [x] `list_notes` uses `getWorkspaceExecutionContext()`

**Status: COMPLETE** - All 13 tools have workspace permission checks in `factory.ts`

### AC2: Tool Execution Logs Include Workspace Metadata
- [ ] Log records include `workspaceType`
- [ ] Log records include `projectId` (NEW - to be added)
- [ ] Log records include execution `duration`

**Status: PARTIAL** - `workspaceId` exists, `duration` exists, `projectId` needs to be added

### AC3: Tools Blocked by Workspace Return Standardized Error ✅
- [x] `createWorkspaceDeniedResponse()` used in all tools
- [x] Error includes `workspaceType`
- [x] Error includes `toolName`

**Status: COMPLETE**

### AC4: Browser Mode Properly Handled
- [ ] Browser mode project (`notes:browser-mode`) works with all tools
- [ ] Project path resolution handles browser mode correctly
- [ ] Tools can read/write notes in browser mode

**Status: NEEDS VERIFICATION**

---

## Technical Implementation

### Files to Modify

#### 1. `src/infrastructure/persistence/dexie-db.ts`

Add `projectId` to `ToolExecutionLogRecord` interface:

```typescript
export interface ToolExecutionLogRecord {
  id: string;
  conversationId: string;
  messageId: string;
  workspaceId: 'ide' | 'knowledge' | 'study' | 'notes';
  projectId: string | null;  // NEW
  toolName: string;
  args: Record<string, unknown>;
  status: 'pending' | 'executed' | 'error' | 'denied';
  result?: {
    success: boolean;
    output?: string;
    error?: string;
    duration?: number;
  };
  timestamp: number;
  createdAt: number;
  approved: boolean;
}
```

#### 2. `src/lib/agent/tools/tool-execution-logger.ts`

Update `logExecution` to accept and store `projectId`:

```typescript
async logExecution(
  context: ToolExecutionContext,
  toolName: string,
  args: Record<string, unknown>,
  workspaceId: 'ide' | 'knowledge' | 'study' | 'notes' = 'ide',
  projectId: string | null = null  // NEW parameter
): Promise<string> {
  // ... logEntry.projectId = projectId
}
```

#### 3. `src/lib/agent/factory.ts`

Pass `projectId` to logger when starting tool execution:

```typescript
const workspaceContext = getWorkspaceExecutionContext();
// ... permission check ...

const logId = await toolExecutionLogger.logExecution(
  context,
  toolName,
  args,
  workspaceContext.workspaceType,
  workspaceContext.projectId  // NEW: pass project ID
);
```

### Files to Verify (No Changes Expected)

| File | Verification Needed |
|------|---------------------|
| `src/lib/workspace/browser-mode.ts` | Browser mode project ID constant exists ✅ |
| `src/lib/agent/workspace-execution-context.ts` | `getWorkspaceExecutionContext()` returns `projectId` ✅ |

---

## Testing Checklist

### Unit Tests
- [ ] Test `projectId` is stored in log records
- [ ] Test browser mode `projectId` (`notes:browser-mode`) is handled
- [ ] Test `null` `projectId` (no project selected)

### Integration Tests
- [ ] Execute `read_file` in IDE workspace with project → verify `projectId` logged
- [ ] Execute `create_note` in Notes workspace with project → verify `projectId` logged
- [ ] Execute `create_note` in browser mode → verify `notes:browser-mode` logged
- [ ] Execute blocked tool → verify standardized error with workspaceType

---

## Implementation Tasks

| Task | Type | Effort | Depends On |
|------|------|--------|------------|
| Add `projectId` to ToolExecutionLogRecord interface | Implementation | 15m | - |
| Update tool-execution-logger to accept projectId | Implementation | 30m | Interface |
| Update factory.ts to pass projectId to logger | Implementation | 30m | Logger |
| Verify browser mode tool execution | Testing | 30m | All above |
| Run TypeScript check | Validation | 5m | All above |

**Total Estimated Effort:** ~2 hours

---

## Design Notes

### Why Add `projectId` to Logs?

1. **Audit Trail** - Know which project a tool affected
2. **Debugging** - Trace issues to specific project configurations
3. **Browser Mode** - Distinguish browser mode from regular project
4. **Multi-Project Future** - Foundation for multi-project tool execution

### Browser Mode Project ID

The browser mode project uses a special ID: `notes:browser-mode`

This should be logged as the `projectId` when tools execute in browser mode,
allowing us to distinguish:
- Regular project: `projectId = "proj-abc123"`
- Browser mode: `projectId = "notes:browser-mode"`
- No project: `projectId = null`

---

## Handoff

**Story Status:** READY TO IMPLEMENT (90% complete)
**Remaining Work:** Add `projectId` to logging + verification

### Files Created
- [x] Story artifact (this file)
- [x] EPIC-46 sprint artifact

### Files to Modify
1. `src/infrastructure/persistence/dexie-db.ts` - Add projectId to interface
2. `src/lib/agent/tools/tool-execution-logger.ts` - Accept and store projectId
3. `src/lib/agent/factory.ts` - Pass projectId to logger

---

## Notes

**Why This Matters:**

Complete workspace context in logs provides:
1. Full audit trail for debugging
2. Project-specific tool execution history
3. Foundation for workspace-aware analytics
4. Support for browser mode tracking

**Complexity Consideration:**

This is a P1 feature because:
- The infrastructure is 90% complete
- Only `projectId` logging is missing
- Low implementation risk
- Enables future workspace-aware features

**Existing Foundation:**

All 13 tools already have:
- Workspace permission checks ✅
- Standardized error responses ✅
- Workspace type logging ✅

We're just adding the final piece: project ID tracking.
