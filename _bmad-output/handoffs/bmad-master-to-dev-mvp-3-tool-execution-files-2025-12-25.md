# Handoff Document: MVP-3 Tool Execution - File Operations

**Date**: 2025-12-25T06:06:00Z
**From**: BMAD Master Orchestrator (@bmad-core-bmad-master)
**To**: Development Agent (@bmad-bmm-dev)
**Epic**: MVP (AI Coding Agent Vertical Slice)
**Story**: MVP-3 Tool Execution - File Operations
**Platform**: Platform A (Antigravity)

---

## 1. Context Summary

### Epic Overview
- **Epic**: MVP - AI Coding Agent Vertical Slice
- **Incident Response**: INC-2025-12-24-001 (Consolidation from 26+ epics to 1 focused MVP)
- **Approach**: Sequential stories, single workstream (Platform A only)
- **User Journey**: Configure → Chat → Execute Tools → Approve → Iterate

### Story Dependencies
- **MVP-1**: ✅ DONE (Agent Configuration & Persistence)
- **MVP-2**: 🔄 IN_PROGRESS (Chat Interface with Streaming) - **MUST COMPLETE BEFORE STARTING MVP-3**
- **MVP-3**: ⏳ BACKLOG (This story - Tool Execution - File Operations)

### Traceability
This story consolidates functionality from original epics:
- **Epic 12-1**: AgentFileTools facade
- **Epic 25-2**: Tool integration with TanStack AI
- **Epic 25-5**: Approval workflow with diff preview

---

## 2. Task Specification

### User Story
As a developer using the AI coding agent, I want the agent to read and write project files with approvals so that file operations stay safe, synchronized (Local FS + WebContainer), and reflected in the IDE (Monaco + FileTree) in real time.

### Acceptance Criteria

#### AC-1: File Read Operations
- Given an open project and an agent request to read a file
- When approval is granted
- Then the file content is read from LocalFS (or WebContainer fallback)
- And permissions are respected
- And the response includes path, encoding, size, and lastModified metadata

#### AC-2: File Write Operations (Existing Files)
- Given a file is open in Monaco with possible unsaved changes
- When the agent requests to write/update the file and the user approves
- Then a diff preview is shown
- And conflicts are handled (prompt/merge/last-write options)
- And Monaco updates without cursor loss
- And file tree metadata updates

#### AC-3: File Creation (New Files)
- Given a valid path for a new file
- When the agent requests creation and the user approves
- Then the file is created in LocalFS + WebContainer
- And FileTree expands/selects it
- And it can be opened in Monaco

#### AC-4: Sync & Events
- Given file operations complete
- When sync triggers
- Then SyncManager updates LocalFS↔WebContainer
- And emits file:changed/file:created events
- And UI (FileTree/Monaco) reflects changes in real time

#### AC-5: Safety & Approval
- Given any file operation
- When approval is required
- Then the approval dialog shows path and diff/preview
- And denials abort cleanly
- And errors surface actionable messages

### Constraints & Requirements

1. **Mandatory MCP Research Protocol** (per `.agent/rules/general-rules.md`):
   - Context7: Query TanStack AI tool architecture documentation
   - Deepwiki: Check WebContainer FS patterns
   - Tavily/Exa: Search for 2025 best practices
   - Repomix: Analyze current codebase structure

2. **Architecture Patterns**:
   - Local FS is source of truth
   - SyncManager mirrors to WebContainer
   - Emit file events for UI updates
   - Approval mandatory for writes

3. **Performance**:
   - File operations must be non-blocking
   - UI updates must be real-time
   - Monaco cursor/selection preservation

4. **Security**:
   - All file operations require approval
   - Path validation before execution
   - Permission checks via LocalFSAdapter

5. **Browser E2E Verification** (MANDATORY per DoD):
   - Manual browser test required
   - Screenshot/recording required
   - Full workflow validation
   - **NO EXCEPTIONS**

---

## 3. Current Workflow Status

### From sprint-status-consolidated.yaml
```yaml
mvp-1-agent-configuration: done
  completed_at: "2025-12-25T10:35:00+07:00"
  e2e_verified: true

mvp-2-chat-interface-streaming: in-progress
  priority: P0
  points: 5
  dependencies: ["MVP-1"]

mvp-3-tool-execution-files: backlog
  priority: P0
  points: 8
  dependencies: ["MVP-2"]
```

### From bmm-workflow-status-consolidated.yaml
```yaml
current_story:
  key: "MVP-3-tool-execution-files"
  status: "in-progress"  # NOTE: Inconsistent with sprint-status.yaml
```

**⚠️ CRITICAL STATUS CHECK REQUIRED**: 
- Sprint status shows MVP-3 as "backlog" with dependency on MVP-2
- Workflow status shows MVP-3 as "in-progress"
- **VERIFY MVP-2 COMPLETION BEFORE PROCEEDING WITH MVP-3**

### Risk Register Status
- **R1**: WebContainer Integration Complexity (HIGH) - Active mitigation
- **R2**: SSE Streaming Stability (HIGH) - ✅ Resolved (2025-12-25)
- **R3**: File System Permissions (MEDIUM) - Active mitigation
- **R8**: Terminal Working Directory (MEDIUM) - Active mitigation

---

## 4. References & Context Files

### Primary Context
- **Story File**: `_bmad-output/sprint-artifacts/mvp-3-tool-execution-files.md`
- **Context XML**: `_bmad-output/sprint-artifacts/mvp-3-tool-execution-files-context.xml`

### Architecture Documentation
- **Agent Architecture Guidelines**: `_bmad-output/architecture/agent-architecture-guidelines-2025-12-24.md`
- **E2E Testing Foundation**: `_bmad-output/testing/e2e-testing-foundation-2025-12-24.md`
- **State Management Audit**: `_bmad-output/state-management-audit-2025-12-24.md`

### Governance Documents
- **Sprint Status**: `_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml`
- **Workflow Status**: `_bmad-output/bmm-workflow-status-consolidated.yaml`
- **MVP Sprint Plan**: `_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md`
- **Story Validation**: `_bmad-output/sprint-artifacts/mvp-story-validation-2025-12-24.md`
- **Risk Register**: `_bmad-output/sprint-artifacts/mvp-risk-register-2025-12-24.md`

### Development Guidelines
- **AGENTS.md**: Project-specific development patterns
- **General Rules**: `.agent/rules/general-rules.md` (MCP Research Protocol)

### Key Implementation Files
- **SyncManager**: `src/lib/filesystem/sync-manager.ts`
- **LocalFSAdapter**: `src/lib/filesystem/local-fs-adapter.ts`
- **WorkspaceContext**: `src/lib/workspace/WorkspaceContext.tsx`
- **AgentFileTools**: `src/lib/agent/facades/AgentFileTools.ts` (to be created)
- **ApprovalOverlay**: `src/components/chat/ApprovalOverlay.tsx` (from Epic 28)
- **DiffPreview**: `src/components/chat/DiffPreview.tsx` (from Epic 28)

---

## 5. Technical Implementation Requirements

### MCP Research Protocol (MANDATORY)
Before implementing unfamiliar patterns:

1. **Context7**: Query TanStack AI documentation for:
   - Tool architecture (client/server tools)
   - Tool approval patterns
   - Agentic cycle integration
   - Connection adapters

2. **Deepwiki**: Check WebContainer patterns for:
   - File system operations
   - Permission handling
   - Process management

3. **Tavily/Exa**: Search for 2025 best practices:
   - Monaco editor external updates
   - Diff preview UI patterns
   - File sync strategies

4. **Repomix**: Analyze current codebase:
   - Existing file system patterns
   - Event bus integration
   - State management usage

### Implementation Tasks

#### Phase 1: Research & Design (1 day)
- [ ] Load dependency instructions from AGENTS.md
- [ ] Research TanStack AI tool architecture via MCP tools
- [ ] Research WebContainer FS patterns via MCP tools
- [ ] Define tool contracts (read_file, write_file) with metadata
- [ ] Design concurrency/merge strategy for writes
- [ ] Design approval flow with diff/preview UI

#### Phase 2: Tool Implementation (2 days)
- [ ] Implement AgentFileTools facade
- [ ] Wire to WorkspaceContext/SyncManager/LocalFSAdapter/WebContainer
- [ ] Implement read_file tool with metadata
- [ ] Implement write_file tool with conflict handling
- [ ] Implement file locking mechanism (FileLock class)
- [ ] Register tools in `src/lib/agent/tools/index.ts`

#### Phase 3: UI Integration (1 day)
- [ ] Implement approval flow with diff/preview UI
- [ ] Integrate with existing ApprovalOverlay component
- [ ] Implement Monaco model updates (preserve cursor)
- [ ] Implement FileTree status updates
- [ ] Wire event bus hooks for file:created/file:changed

#### Phase 4: Testing (1 day)
- [ ] Unit tests for tools
- [ ] Integration tests for LocalFS/WebContainer sync
- [ ] UI tests for approval/diff
- [ ] **MANDATORY: Browser E2E verification with screenshot**

#### Phase 5: Documentation & Governance (0.5 day)
- [ ] Update Dev Agent Record in story file
- [ ] Update sprint-status.yaml (story → DONE)
- [ ] Update bmm-workflow-status.yaml
- [ ] Capture E2E screenshot for DoD
- [ ] Document any course corrections

### Key Technical Decisions

1. **Tool Architecture**:
   - Use TanStack AI `toolDefinition` pattern
   - Server-side tools for file operations
   - Client-side approval UI integration
   - Streaming responses for large files

2. **File Locking**:
   - Use FileLock class for concurrency control
   - Serialize concurrent operations on same path
   - Timeout mechanism for stuck locks

3. **Monaco Updates**:
   - Update model via `monaco.editor.IModel`
   - Preserve cursor position and selection
   - Handle dirty tabs (prompt/merge/overwrite)

4. **Sync Strategy**:
   - Local FS as source of truth
   - SyncManager mirrors to WebContainer
   - Emit events for UI updates
   - Debounce sync operations

5. **Approval Flow**:
   - Show diff preview for writes
   - Show content preview for reads
   - Approve/deny buttons
   - Error handling with actionable messages

---

## 6. Definition of Done Checklist

Before marking this story DONE, ensure ALL items are complete:

- [ ] **Code Implementation Complete**
  - [ ] All acceptance criteria implemented
  - [ ] Code follows project conventions
  - [ ] TypeScript types properly defined

- [ ] **TypeScript Build Passes**
  - [ ] `pnpm build` succeeds without errors
  - [ ] No TypeScript compilation warnings

- [ ] **Unit Tests Passing**
  - [ ] ≥80% code coverage
  - [ ] All tests pass
  - [ ] No flaky tests

- [ ] **MANDATORY: Browser E2E Verification**
  - [ ] Manual browser test completed
  - [ ] Screenshot or recording captured
  - [ ] Full workflow validated
  - [ ] **NO EXCEPTIONS**

- [ ] **Code Review Approved**
  - [ ] Peer review completed
  - [ ] All feedback addressed
  - [ ] Review approved in sprint status

---

## 7. Success Metrics

### Quantitative
- **Story Points**: 8 (estimated 3 days)
- **Test Coverage**: ≥80%
- **Build Success**: 100%
- **E2E Verification**: ✅ With screenshot

### Qualitative
- **File Operations**: Read/write working end-to-end
- **Approval Workflow**: Diff preview functional
- **UI Updates**: Real-time Monaco/FileTree updates
- **Sync**: LocalFS ↔ WebContainer synchronized
- **User Experience**: Clear approval dialogs, actionable errors

---

## 8. Next Action

### Immediate Action
**VERIFY MVP-2 COMPLETION STATUS** before proceeding with MVP-3 implementation.

### After MVP-2 Completion
1. Review MVP-2 completion artifacts
2. Verify chat streaming is working
3. Confirm tool call infrastructure is in place
4. Begin MVP-3 implementation per this handoff

### After MVP-3 Completion
1. Complete E2E browser verification
2. Capture screenshot/recording
3. Update sprint-status.yaml (MVP-3 → DONE)
4. Update bmm-workflow-status.yaml
5. Prepare handoff for MVP-4 (Terminal Commands)

---

## 9. Communication Protocol

### Reporting Back
Upon completion, report to @bmad-core-bmad-master with:

1. **Completion Summary**:
   - All acceptance criteria met
   - Files changed/created
   - Tests written and passing
   - E2E verification status

2. **Artifacts Created**:
   - Implementation files
   - Test files
   - E2E screenshot/recording
   - Any course corrections

3. **Workflow Status Updates**:
   - Updated: `bmm-workflow-status.yaml` (MVP-3 → DONE)
   - Updated: `sprint-status.yaml` (story progress)
   - Next action: MVP-4 preparation

### Blockers & Issues
Report immediately if:
- MVP-2 is not complete or has issues
- WebContainer integration problems
- Permission handling issues
- Monaco update problems
- Any showstoppers

---

## 10. Appendix: Course Corrections Log

| Date | Issue | Resolution |
|------|-------|------------|
| 2025-12-25 | Status inconsistency | Verify MVP-2 completion before proceeding |

---

**Handoff Status**: READY FOR DELEGATION (pending MVP-2 verification)
**Priority**: P0
**Estimated Duration**: 3-4 days (including E2E verification)

---

**Document Owner**: BMAD Master Orchestrator (@bmad-core-bmad-master)
**Version**: 1.0
**Created**: 2025-12-25T06:06:00Z