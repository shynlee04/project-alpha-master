# Handoff: Tool Wiring Implementation (P0 Critical)

**Date**: 2025-12-26T21:39:00Z
**From**: @bmad-core-bmad-master
**To**: @bmad-bmm-dev
**Priority**: P0 - IMMEDIATE
**Blocks**: MVP-3 (Tool Execution - File Operations)

---

## Context Summary

### Phase 3 Technical Debt Cleanup Complete
Comprehensive technical debt analysis completed with 5 deliverables:
- **P0 - Tool Wiring Spec**: [`tool-wiring-spec-2025-12-26.md`](_bmad-output/technical-debt/tool-wiring-spec-2025-12-26.md) - **THIS HANDOFF**
- **P0 - State Refactoring Plan**: Deferred to avoid MVP-3 interference
- **P1 - Component Inventory**: 200+ files categorized
- **P1 - Architecture Conflicts**: 6 conflicts documented
- **P2 - Naming Violations**: Convention compliance verified

### Critical Finding
Agent tools are **defined but not wired** to [`useAgentChatWithTools`](src/lib/agent/hooks/use-agent-chat-with-tools.ts:153). This blocks MVP-3 completion.

### Current State
- ✅ Tools defined: `read_file`, `write_file`, `list_files`, `execute_command`
- ✅ Hook interface complete: [`UseAgentChatWithToolsOptions`](src/lib/agent/hooks/use-agent-chat-with-tools.ts:24-48)
- ✅ Factory function exists: [`createAgentClientTools`](src/lib/agent/factory.ts)
- ❌ **Tools NOT wired** to chat hook

---

## Task Specification

### Objective
Wire 4 agent tools to [`useAgentChatWithTools`](src/lib/agent/hooks/use-agent-chat-with-tools.ts) to enable MVP-3 (Tool Execution - File Operations).

### Acceptance Criteria
1. ✅ `toolsAvailable` returns `true` when facades are wired
2. ✅ Agent can call `read_file`, `write_file`, `list_files`, `execute_command`
3. ✅ Tool results appear in chat interface
4. ✅ E2E verification passes (browser test)
5. ✅ No console errors during tool execution

### Implementation Steps (from Tool Wiring Spec)

#### Step 1: Wire File Tools Facade
**File**: [`src/components/layout/IDELayout.tsx`](src/components/layout/IDELayout.tsx:164)

```typescript
// Around line 164 - useIDEFileHandlers hook call
const { handleFileSelect, handleSave, handleContentChange, handleTabClose } = useIDEFileHandlers({
    // ... existing params
});

// ADD: Create file tools facade
const fileTools = useMemo(() => {
    if (!localAdapterRef.current || !syncManagerRef.current) return null;
    return createFileToolsFacade(localAdapterRef.current, syncManagerRef.current, eventBus);
}, [localAdapterRef.current, syncManagerRef.current, eventBus]);
```

#### Step 2: Wire Terminal Tools Facade
**File**: [`src/components/layout/IDELayout.tsx`](src/components/layout/IDELayout.tsx:164)

```typescript
// After fileTools creation
const terminalTools = useMemo(() => {
    if (!syncManagerRef.current) return null;
    return createTerminalToolsFacade(syncManagerRef.current);
}, [syncManagerRef.current]);
```

#### Step 3: Pass Tools to ChatPanelWrapper
**File**: [`src/components/layout/IDELayout.tsx`](src/components/layout/IDELayout.tsx:391)

```typescript
// Line 391 - ChatPanelWrapper usage
<ChatPanelWrapper 
    projectId={projectId} 
    projectName={projectMetadata?.name ?? projectId ?? 'Project'} 
    onClose={() => setChatVisible(false)}
    // ADD:
    fileTools={fileTools}
    terminalTools={terminalTools}
    eventBus={eventBus}
/>
```

#### Step 4: Wire in ChatPanelWrapper
**File**: [`src/components/ide/AgentChatPanel.tsx`](src/components/ide/AgentChatPanel.tsx) (or similar)

```typescript
// Use useAgentChatWithTools with tools
const {
    messages,
    sendMessage,
    toolCalls,
    toolsAvailable,
    pendingApprovals,
    approveToolCall,
    rejectToolCall,
} = useAgentChatWithTools({
    providerId: selectedProvider,
    modelId: selectedModel,
    apiKey: credentials[selectedProvider],
    fileTools,       // ← WIRED
    terminalTools,   // ← WIRED
    eventBus,        // ← WIRED
});
```

### Constraints
- **DO NOT** implement state refactoring (deferred to avoid MVP-3 interference)
- **DO NOT** create unit tests (dry-check only - no linter/type/syntax errors)
- Follow existing code patterns in [`IDELayout.tsx`](src/components/layout/IDELayout.tsx)
- Use `useMemo` for facade creation to prevent unnecessary re-renders
- Handle null checks for refs before creating facades

### Risk Mitigation
| Risk | Mitigation |
|------|------------|
| Facade not initialized | Check `toolsAvailable` before execution |
| WebContainer not ready | Boot check before tool calls |
| File lock contention | Use [`FileLock`](src/lib/agent/facades/file-lock.ts) |
| Permission denied | Handle gracefully with user feedback |

---

## Current Workflow Status

### Sprint Status
**File**: [`_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml`](_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml)

- **Active Epic**: MVP (consolidated from Epics 12, 25, 28)
- **Current Story**: MVP-3 (Tool Execution - File Operations) - **BLOCKED**
- **Previous Stories**: MVP-1 (DONE), MVP-2 (DONE)
- **Next Stories**: MVP-4, MVP-5, MVP-6, MVP-7

### Workflow Status
**File**: [`_bmad-output/bmm-workflow-status-consolidated.yaml`](_bmad-output/bmm-workflow-status-consolidated.yaml)

- **Phase**: Implementation
- **Current Workflow**: Tool Wiring Implementation
- **Next Actions**: 
  1. Wire tools to useAgentChatWithTools (THIS TASK)
  2. E2E verification for MVP-3
  3. Begin MVP-4 (Tool Execution - Terminal Commands)

---

## References

### Technical Debt Artifacts
- **Tool Wiring Spec**: [`_bmad-output/technical-debt/tool-wiring-spec-2025-12-26.md`](_bmad-output/technical-debt/tool-wiring-spec-2025-12-26.md)
- **State Refactoring Plan**: [`_bmad-output/technical-debt/state-refactoring-plan-2025-12-26.md`](_bmad-output/technical-debt/state-refactoring-plan-2025-12-26.md) (DEFERRED)
- **Component Inventory**: [`_bmad-output/technical-debt/component-inventory-2025-12-26.md`](_bmad-output/technical-debt/component-inventory-2025-12-26.md)
- **Architecture Conflicts**: [`_bmad-output/technical-debt/architecture-conflicts-2025-12-26.md`](_bmad-output/technical-debt/architecture-conflicts-2025-12-26.md)
- **Naming Violations**: [`_bmad-output/technical-debt/naming-violations-2025-12-26.md`](_bmad-output/technical-debt/naming-violations-2025-12-26.md)

### Key Implementation Files
- **Hook**: [`src/lib/agent/hooks/use-agent-chat-with-tools.ts`](src/lib/agent/hooks/use-agent-chat-with-tools.ts)
- **Layout**: [`src/components/layout/IDELayout.tsx`](src/components/layout/IDELayout.tsx)
- **Chat Panel**: [`src/components/ide/AgentChatPanel.tsx`](src/components/ide/AgentChatPanel.tsx)
- **File Tools Facade**: [`src/lib/agent/facades/file-tools.ts`](src/lib/agent/facades/file-tools.ts)
- **Terminal Tools Facade**: [`src/lib/agent/facades/terminal-tools.ts`](src/lib/agent/facades/terminal-tools.ts)
- **Tool Definitions**: [`src/lib/agent/tools/index.ts`](src/lib/agent/tools/index.ts)

### Related Stories
- **MVP-3**: Tool Execution - File Operations (BLOCKED by this task)
- **MVP-4**: Tool Execution - Terminal Commands (depends on MVP-3)
- **MVP-5**: Approval Workflow (depends on MVP-3/MVP-4)

### Architecture Docs
- **MVP Sprint Plan**: [`_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md`](_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md)
- **State Management Audit**: [`_bmad-output/state-management-audit-p1.10-2025-12-26.md`](_bmad-output/state-management-audit-p1.10-2025-12-26.md)

---

## E2E Verification Requirements

### Mandatory Browser Testing
After implementation, perform E2E verification:

1. **Provider Setup**: Configure OpenRouter provider with valid API key in [`AgentConfigDialog`](src/components/agent/AgentConfigDialog.tsx)
2. **Tool Availability**: Verify `toolsAvailable` returns `true` when facades are present
3. **Tool Execution Test**:
   - Send message: "Read package.json"
   - Verify tool call appears in chat
   - Approve tool call
   - Verify file content displayed in chat
   - Verify no console errors
4. **Screenshot Required**: Capture screenshot of working feature

### Definition of Done
- [ ] All 4 tools wired to `useAgentChatWithTools`
- [ ] `toolsAvailable` returns `true`
- [ ] Agent can call tools successfully
- [ ] Tool results appear in chat
- [ ] E2E verification passes with screenshot
- [ ] No console errors
- [ ] No linter/type/syntax errors

---

## Next Agent Assignment

**Mode**: `@bmad-bmm-dev`
**Task**: Implement tool wiring per specification
**Output Location**: Code changes in [`src/components/layout/IDELayout.tsx`](src/components/layout/IDELayout.tsx) and [`src/components/ide/AgentChatPanel.tsx`](src/components/ide/AgentChatPanel.tsx)
**Return Via**: Report to @bmad-core-bmad-master with completion summary

---

## Handoff Protocol

### When Reporting Back
Provide completion report to BMAD Master with:
1. **Agent**: Your mode slug (`bmad-bmm-dev`)
2. **Task Completed**: Tool wiring implementation
3. **Files Modified**: List of changed files
4. **Verification Results**: E2E test results with screenshot
5. **Workflow Status Updates**:
   - Updated: `bmm-workflow-status.yaml` (MVP-3 → READY_FOR_E2E)
   - Updated: `sprint-status.yaml` (MVP-3 progress)
6. **Next Action**: Suggest next step (E2E verification or MVP-4)

### Critical Reminders
- **MANDATORY**: Browser E2E verification before marking DONE
- **NO UNIT TESTS**: Dry-check only (no linter/type/syntax errors)
- **SEQUENTIAL STORIES**: Do not start MVP-4 until MVP-3 is DONE
- **SCREENSHOT REQUIRED**: Capture working feature for verification

---

**END OF HANDOFF**