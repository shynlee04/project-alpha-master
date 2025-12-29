---
epic: 24
story: 4
title: "Tool Execution Context Persistence"
status: drafted
priority: high
team: B
created: 2025-12-29
updated: 2025-12-29
estimate_hours: 3-4

# User Story
As a user who runs tool-assisted conversations and returns later,
I want the IDE to remember which tools I approved and their execution context,
So that I can continue conversations without re-approving the same tool calls.

# Problem Statement
Currently, tool execution context (approvals, results, execution history) is not persisted. When users return to a conversation, they lose the record of what tools were approved and how they executed. This was flagged as CC-002 in the correct-course workflow.

# Acceptance Criteria

## AC-1: Tool Execution Logging
- [ ] **AC-1.1**: Every tool execution is logged to `toolExecutionLogs` table
- [ ] **AC-1.2**: Log entry includes: conversationId, messageId, toolName, args, result, approval status
- [ ] **AC-1.3**: Log entry includes execution duration and timestamp
- [ ] **AC-1.4**: Log entry includes whether user approved the execution

## AC-2: Context Restoration
- [ ] **AC-2.1**: On conversation restore, load associated tool execution logs
- [ ] **AC-2.2**: Display tool execution history in conversation UI (expandable)
- [ ] **AC-2.3**: Restore tool approval state (show what was approved/denied)
- [ ] **AC-2.4**: Link tool executions to their originating messages

## AC-3: Trust Memory
- [ ] **AC-3.1**: Track approved tools per conversation (unique tool names)
- [ ] **AC-3.2**: On new tool calls, check if tool was previously approved
- [ ] **AC-3.3**: Auto-approve previously approved tools (configurable in Settings)
- [ ] **AC-3.4**: Show visual indicator when tool is auto-approved due to trust memory

## AC-4: Audit Trail
- [ ] **AC-4.1**: All tool executions are queryable by conversationId
- [ ] **AC-4.2**: Audit view shows: timestamp, tool name, status, duration, approval
- [ ] **AC-4.3**: Export audit trail as JSON for debugging/compliance
- [ ] **AC-4.4**: Clear audit trail option in Settings (with confirmation)

## AC-5: Performance
- [ ] **AC-5.1**: Tool execution logging adds <5ms overhead to execution
- [ ] **AC-5.2**: Context restoration completes in <100ms
- [ ] **AC-5.3**: Audit trail queries complete in <50ms for 100+ entries
- [ ] **AC-5.4**: Automatic cleanup of logs older than 30 days

---

# Tasks

## Research & Planning
- [ ] T1: Review toolExecutionLogs schema and helpers in dexie-db.ts
- [ ] T2: Review tool permission manager implementation
- [ ] T3: Review agent tool facades (file-tools, terminal-tools)
- [ ] T4: Design tool execution logging middleware pattern

## Implementation
- [ ] T5: Create `tool-execution-logger.ts` module
- [ ] T6: Implement `logToolExecution()` function with all fields
- [ ] T7: Implement `updateToolExecution()` for result updates
- [ ] T8: Implement `getToolExecutionLogs()` query function
- [ ] T9: Create `ToolExecutionLogger` class with middleware pattern
- [ ] T10: Wire logger to tool facades (file-tools-impl.ts, terminal-tools-impl.ts)
- [ ] T11: Implement trust memory service (`trust-memory.ts`)
- [ ] T12: Implement auto-approve logic based on trust memory
- [ ] T13: Add audit trail UI component in conversation view
- [ ] T14: Add audit trail export and clear functions
- [ ] T15: Implement automatic log cleanup (30-day TTL)

## Testing
- [ ] T16: Write unit tests for `logToolExecution()` function
- [ ] T17: Write unit tests for trust memory service
- [ ] T18: Write integration test for tool execution logging flow
- [ ] T19: Test auto-approve behavior with trust memory
- [ ] T20: Test audit trail query performance
- [ ] T21: Test log cleanup for old entries
- [ ] T22: Test audit trail export functionality

## Documentation
- [ ] T23: Update AGENTS.md with tool execution logging documentation
- [ ] T24: Add user-facing docs for trust memory and audit features

---

# Dev Notes

## Architecture Reference
- **Current State**: Tool executions are ephemeral, no persistence
- **Goal**: Persistent tool execution history with trust memory
- **Components**: toolExecutionLogs table, tool facades, conversation store

## Key Files
- `src/lib/state/dexie-db.ts` - toolExecutionLogs table and helpers (already exists)
- `src/lib/agent/facades/file-tools-impl.ts` - File tool implementation
- `src/lib/agent/facades/terminal-tools-impl.ts` - Terminal tool implementation
- `src/lib/agent/tool-permission-manager.ts` - Permission checking

## Implementation Pattern
```typescript
// Tool execution logger middleware
const withExecutionLogging = (tool: Tool) => {
  return async (context: ToolExecutionContext, params: unknown) => {
    const logId = await logToolExecution({
      id: crypto.randomUUID(),
      conversationId: context.conversationId,
      messageId: context.messageId,
      toolName: tool.name,
      args: params,
      status: 'pending',
      timestamp: Date.now(),
    });

    try {
      const result = await tool.execute(context, params);

      await updateToolExecution(logId, {
        status: 'executed',
        result: { success: true, output: result },
        approved: context.wasApproved,
      });

      return result;
    } catch (error) {
      await updateToolExecution(logId, {
        status: 'error',
        result: { success: false, error: error.message },
      });
      throw error;
    }
  };
};

// Trust memory for auto-approve
class TrustMemory {
  async isTrusted(conversationId: string, toolName: string): Promise<boolean> {
    const logs = await getToolExecutionLogs(conversationId);
    const approvedTools = logs
      .filter(log => log.toolName === toolName && log.approved && log.status === 'executed')
      .map(log => log.toolName);

    return approvedTools.length > 0;
  }
}
```

## Tool Integration Points
1. **File Tools**: read_file, write_file, list_files, create_file, delete_file
2. **Terminal Tools**: execute_command
3. **Future Tools**: Any new tools should be auto-wired to logger

## Audit Trail UI
- Expandable section in conversation view
- Shows tool calls in chronological order
- Expandable details: input args, output, duration
- Filter by status: all, approved, denied, error

## Performance Considerations
- Log writes should be fire-and-forget (don't await)
- Use Dexie's bulkPut for batch logging
- Index conversationId + timestamp for efficient queries
- Background cleanup job for old logs

## Privacy Considerations
- Tool arguments may contain sensitive data (file paths, command args)
- Consider encryption for sensitive tool inputs
- Allow users to clear tool execution history
- Export should be user-initiated only

---

# Dev Agent Record

**Agent:**
**Session:**

#### Task Progress:
- [ ] T1:
- [ ] T2:
- [ ] T3:
- [ ] T4:
- [ ] T5:
- [ ] T6:
- [ ] T7:
- [ ] T8:
- [ ] T9:
- [ ] T10:
- [ ] T11:
- [ ] T12:
- [ ] T13:
- [ ] T14:
- [ ] T15:
- [ ] T16:
- [ ] T17:
- [ ] T18:
- [ ] T19:
- [ ] T20:
- [ ] T21:
- [ ] T22:
- [ ] T23:
- [ ] T24:

#### Research Executed:

#### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| | | |

#### Tests Created:

#### Decisions Made:

---

# Code Review

**Reviewer:**
**Date:**

#### Checklist:
- [ ] All ACs verified
- [ ] All tests passing
- [ ] Architecture patterns followed
- [ ] No TypeScript errors
- [ ] Code quality acceptable
- [ ] Privacy considerations addressed

#### Issues Found:

#### Sign-off:

---

# Status History

| Date | Status | Notes |
|------|--------|-------|
| 2025-12-29 | drafted | Story created |
