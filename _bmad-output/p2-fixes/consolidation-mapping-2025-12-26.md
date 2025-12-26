# Consolidation Mapping Document

**Document ID**: P2-CONSOL-2025-12-26  
**Created**: 2025-12-26T19:02:00Z  
**Status**: Completed

## Overview

This document provides traceability mapping from consolidated MVP stories to original Epics 12, 25, and 28. This mapping preserves the history of consolidation decisions made during INC-2025-12-24-001 response, which reduced 26+ epics to 1 focused MVP epic.

## Consolidation Context

### Incident Response: INC-2025-12-24-001

**Response Date**: 2025-12-24  
**Decision**: Consolidate Epics 12, 25, and 28 into a single MVP epic  
**Rationale**: Ensure complete vertical slice of AI coding agent functionality  
**Impact**: 
- Reduced 26+ epics to 1 focused MVP epic (96% reduction)
- Reduced 124+ stories to 7 sequential stories (94% reduction)
- Single workstream approach (Platform A only)
- Preserved traceability to original epics

### Original Epics

| Epic ID | Epic Name | Description | Story Count | Status |
|----------|-------------|-------------|---------------|----------|
| **Epic 12** | Tool Interface | Agent tool execution, file operations, terminal commands | 15+ | Consolidated into MVP |
| **Epic 25** | AI Foundation | Agent configuration, chat interface, streaming | 40+ | Consolidated into MVP |
| **Epic 28** | UX Brand | Approval workflow, real-time UI updates, design system | 20+ | Consolidated into MVP |

### Consolidated MVP Epic

| Epic ID | Epic Name | Description | Story Count | Status |
|----------|-------------|-------------|---------------|----------|
| **MVP** | AI Coding Agent Vertical Slice | Complete vertical slice from configuration to E2E validation | 7 | IN_PROGRESS |

---

## Story Mapping Matrix

### MVP-1: Agent Configuration & Persistence

**Story Key**: `MVP-1-agent-configuration-persistence`  
**Story Points**: 5  
**Status**: IN_PROGRESS  
**Original Epic**: Epic 25 (AI Foundation)

**Original Stories Merged**:
- Epic 25: Agent Provider Selection UI
- Epic 25: Secure API Key Storage
- Epic 25: Model Selection from Catalog
- Epic 25: Connection Test Functionality
- Epic 25: Agent Status Indicator

**Functionality Delivered**:
- Provider selection UI (OpenRouter/Anthropic)
- Secure API key storage in localStorage
- Model selection from provider catalog
- Cross-session persistence
- Connection test functionality
- Agent status indicator

**Traceability**:
- **Epic 25 → MVP-1**: All agent configuration and persistence stories from Epic 25 merged into MVP-1
- **Components**: [`AgentConfigDialog.tsx`](../src/components/agent/AgentConfigDialog.tsx)
- **Stores**: [`useAgentsStore`](../src/stores/agents.ts), [`useAgentSelectionStore`](../src/stores/agent-selection.ts)
- **Infrastructure**: [`provider-adapter.ts`](../src/lib/agent/providers/provider-adapter.ts), [`model-registry.ts`](../src/lib/agent/providers/model-registry.ts), [`credential-vault.ts`](../src/lib/agent/providers/credential-vault.ts)

---

### MVP-2: Chat Interface with Streaming

**Story Key**: `MVP-2-chat-interface-streaming`  
**Story Points**: 5  
**Status**: DONE (E2E verified)  
**Original Epic**: Epic 25 (AI Foundation)

**Original Stories Merged**:
- Epic 25: Chat Panel UI
- Epic 25: Message Display Components
- Epic 25: SSE Streaming Integration
- Epic 25: Rich Text Formatting
- Epic 25: Code Blocks with Syntax Highlighting
- Epic 25: Chat History Persistence

**Functionality Delivered**:
- Chat panel UI with message display
- Message sending to `/api/chat` endpoint
- Real-time SSE streaming responses
- Rich text formatting (markdown)
- Code blocks with syntax highlighting
- Error handling for failed requests
- Chat history persistence

**Traceability**:
- **Epic 25 → MVP-2**: All chat interface and streaming stories from Epic 25 merged into MVP-2
- **Components**: [`AgentChatPanel.tsx`](../src/components/ide/AgentChatPanel.tsx), [`StreamingMessage.tsx`](../src/components/ide/StreamingMessage.tsx)
- **Chat Components**: [`ChatPanel.tsx`](../src/components/chat/ChatPanel.tsx), [`CodeBlock.tsx`](../src/components/chat/CodeBlock.tsx), [`ToolCallBadge.tsx`](../src/components/chat/ToolCallBadge.tsx)
- **API**: [`chat.ts`](../src/routes/api/chat.ts)
- **Hooks**: [`use-agent-chat-with-tools.ts`](../src/lib/agent/hooks/use-agent-chat-with-tools.ts)

---

### MVP-3: Tool Execution - File Operations

**Story Key**: `MVP-3-tool-execution-files`  
**Story Points**: 5  
**Status**: BACKLOG  
**Original Epic**: Epic 12 (Tool Interface)

**Original Stories Merged**:
- Epic 12: File Read Tool
- Epic 12: File Write Tool
- Epic 12: File List Tool
- Epic 12: File Tool Facades
- Epic 12: File Lock Mechanism

**Functionality Delivered**:
- File read tool implementation
- File write tool implementation
- File list tool implementation
- Tool facade for WebContainer file operations
- File locking for concurrency control
- Tool execution validation

**Traceability**:
- **Epic 12 → MVP-3**: All file operation tool stories from Epic 12 merged into MVP-3
- **Tools**: [`read-file-tool.ts`](../src/lib/agent/tools/read-file-tool.ts), [`write-file-tool.ts`](../src/lib/agent/tools/write-file-tool.ts), [`list-files-tool.ts`](../src/lib/agent/tools/list-files-tool.ts)
- **Facades**: [`file-tools.ts`](../src/lib/agent/facades/file-tools.ts), [`file-tools-impl.ts`](../src/lib/agent/facades/file-tools-impl.ts)
- **Concurrency**: [`file-lock.ts`](../src/lib/agent/facades/file-lock.ts)

---

### MVP-4: Tool Execution - Terminal Commands

**Story Key**: `MVP-4-tool-execution-terminal`  
**Story Points**: 5  
**Status**: BACKLOG  
**Original Epic**: Epic 12 (Tool Interface)

**Original Stories Merged**:
- Epic 12: Terminal Execute Tool
- Epic 12: Terminal Tool Facades
- Epic 12: Terminal Output Capture
- Epic 12: Command History

**Functionality Delivered**:
- Terminal execute tool implementation
- Tool facade for WebContainer terminal operations
- Terminal output capture and display
- Command history tracking
- Shell process management

**Traceability**:
- **Epic 12 → MVP-4**: All terminal command tool stories from Epic 12 merged into MVP-4
- **Tools**: [`execute-command-tool.ts`](../src/lib/agent/tools/execute-command-tool.ts)
- **Facades**: [`terminal-tools.ts`](../src/lib/agent/facades/terminal-tools.ts), [`terminal-tools-impl.ts`](../src/lib/agent/facades/terminal-tools-impl.ts)
- **Terminal**: [`terminal-adapter.ts`](../src/lib/webcontainer/terminal-adapter.ts)

---

### MVP-5: Approval Workflow

**Story Key**: `MVP-5-approval-workflow`  
**Story Points**: 6  
**Status**: BACKLOG  
**Original Epic**: Epic 28 (UX Brand)

**Original Stories Merged**:
- Epic 28: Approval Overlay UI
- Epic 28: Tool Call Review Interface
- Epic 28: Approval/Rejection Actions
- Epic 28: Approval History Tracking
- Epic 28: Diff Preview for File Changes

**Functionality Delivered**:
- Approval overlay for tool calls
- Tool call review interface
- Approve/reject actions
- Approval history tracking
- Diff preview for file changes
- Approval state management

**Traceability**:
- **Epic 28 → MVP-5**: All approval workflow stories from Epic 28 merged into MVP-5
- **Components**: [`ApprovalOverlay.tsx`](../src/components/chat/ApprovalOverlay.tsx), [`DiffPreview.tsx`](../src/components/chat/DiffPreview.tsx)
- **Hooks**: Approval state management in [`use-agent-chat-with-tools.ts`](../src/lib/agent/hooks/use-agent-chat-with-tools.ts)

---

### MVP-6: Real-time UI Updates

**Story Key**: `MVP-6-realtime-ui-updates`  
**Story Points**: 5  
**Status**: BACKLOG  
**Original Epic**: Epic 28 (UX Brand)

**Original Stories Merged**:
- Epic 28: Streaming Message Updates
- Epic 28: Tool Execution Progress
- Epic 28: File Sync Status Display
- Epic 28: WebContainer Status Indicators
- Epic 28: Real-time Status Bar Updates

**Functionality Delivered**:
- Streaming message updates in real-time
- Tool execution progress indicators
- File sync status display
- WebContainer status indicators
- Real-time status bar updates
- Event-driven UI updates

**Traceability**:
- **Epic 28 → MVP-6**: All real-time UI update stories from Epic 28 merged into MVP-6
- **Components**: [`StreamingMessage.tsx`](../src/components/ide/StreamingMessage.tsx), [`IDEHeaderBar.tsx`](../src/components/layout/IDEHeaderBar.tsx)
- **Stores**: [`useStatusBarStore`](../src/lib/state/statusbar-store.ts), [`useFileSyncStatusStore`](../src/lib/state/file-sync-status-store.ts)
- **Events**: [`workspace-events.ts`](../src/lib/events/workspace-events.ts)

---

### MVP-7: E2E Integration Testing

**Story Key**: `MVP-7-e2e-integration-testing`  
**Story Points**: 5  
**Status**: BACKLOG  
**Original Epic**: Epic 12, 25, 28 (All)

**Original Stories Merged**:
- Epic 12: Tool Integration Tests
- Epic 25: Chat Integration Tests
- Epic 28: UI Integration Tests
- Epic 12: End-to-End Workflow Tests
- Epic 25: Agent Workflow Tests

**Functionality Delivered**:
- End-to-end workflow testing
- Agent integration testing
- Tool execution testing
- UI component integration testing
- Browser E2E verification
- Test coverage validation

**Traceability**:
- **Epic 12, 25, 28 → MVP-7**: All integration testing stories from all three epics merged into MVP-7
- **Tests**: All `__tests__` directories across codebase
- **E2E Verification**: Browser testing framework and screenshots

---

## Epic-to-Story Summary

### Epic 12 (Tool Interface) → MVP Stories

| Original Epic 12 Stories | Consolidated Into MVP Story | Status |
|--------------------------|----------------------------|---------|
| File Read Tool | MVP-3 | BACKLOG |
| File Write Tool | MVP-3 | BACKLOG |
| File List Tool | MVP-3 | BACKLOG |
| File Tool Facades | MVP-3 | BACKLOG |
| File Lock Mechanism | MVP-3 | BACKLOG |
| Terminal Execute Tool | MVP-4 | BACKLOG |
| Terminal Tool Facades | MVP-4 | BACKLOG |
| Terminal Output Capture | MVP-4 | BACKLOG |
| Command History | MVP-4 | BACKLOG |
| Tool Integration Tests | MVP-7 | BACKLOG |
| End-to-End Workflow Tests | MVP-7 | BACKLOG |

**Total Epic 12 Stories Consolidated**: 11  
**MVP Stories Receiving**: MVP-3, MVP-4, MVP-7

---

### Epic 25 (AI Foundation) → MVP Stories

| Original Epic 25 Stories | Consolidated Into MVP Story | Status |
|-------------------------|----------------------------|---------|
| Agent Provider Selection UI | MVP-1 | IN_PROGRESS |
| Secure API Key Storage | MVP-1 | IN_PROGRESS |
| Model Selection from Catalog | MVP-1 | IN_PROGRESS |
| Connection Test Functionality | MVP-1 | IN_PROGRESS |
| Agent Status Indicator | MVP-1 | IN_PROGRESS |
| Chat Panel UI | MVP-2 | DONE |
| Message Display Components | MVP-2 | DONE |
| SSE Streaming Integration | MVP-2 | DONE |
| Rich Text Formatting | MVP-2 | DONE |
| Code Blocks with Syntax Highlighting | MVP-2 | DONE |
| Chat History Persistence | MVP-2 | DONE |
| Agent Workflow Tests | MVP-7 | BACKLOG |

**Total Epic 25 Stories Consolidated**: 13  
**MVP Stories Receiving**: MVP-1, MVP-2, MVP-7

---

### Epic 28 (UX Brand) → MVP Stories

| Original Epic 28 Stories | Consolidated Into MVP Story | Status |
|-------------------------|----------------------------|---------|
| Approval Overlay UI | MVP-5 | BACKLOG |
| Tool Call Review Interface | MVP-5 | BACKLOG |
| Approval/Rejection Actions | MVP-5 | BACKLOG |
| Approval History Tracking | MVP-5 | BACKLOG |
| Diff Preview for File Changes | MVP-5 | BACKLOG |
| Streaming Message Updates | MVP-6 | BACKLOG |
| Tool Execution Progress | MVP-6 | BACKLOG |
| File Sync Status Display | MVP-6 | BACKLOG |
| WebContainer Status Indicators | MVP-6 | BACKLOG |
| Real-time Status Bar Updates | MVP-6 | BACKLOG |
| UI Integration Tests | MVP-7 | BACKLOG |

**Total Epic 28 Stories Consolidated**: 11  
**MVP Stories Receiving**: MVP-5, MVP-6, MVP-7

---

## Consolidation Statistics

### Epic Reduction

| Metric | Before Consolidation | After Consolidation | Reduction |
|---------|---------------------|---------------------|------------|
| Total Epics | 26+ | 1 | 96% |
| Total Stories | 124+ | 7 | 94% |
| Epic 12 Stories | 15+ | Merged into 3 MVP stories | 80% |
| Epic 25 Stories | 40+ | Merged into 3 MVP stories | 93% |
| Epic 28 Stories | 20+ | Merged into 3 MVP stories | 85% |

### Story Distribution by Original Epic

| Original Epic | Stories Consolidated | MVP Stories Receiving | Consolidation Ratio |
|--------------|---------------------|----------------------|-------------------|
| Epic 12 (Tool Interface) | 11 | 3 (MVP-3, MVP-4, MVP-7) | 3.7:1 |
| Epic 25 (AI Foundation) | 13 | 3 (MVP-1, MVP-2, MVP-7) | 4.3:1 |
| Epic 28 (UX Brand) | 11 | 3 (MVP-5, MVP-6, MVP-7) | 3.7:1 |

### Story Point Distribution

| MVP Story | Story Points | Original Epic Source | Status |
|-----------|--------------|---------------------|---------|
| MVP-1 | 5 | Epic 25 | IN_PROGRESS |
| MVP-2 | 5 | Epic 25 | DONE |
| MVP-3 | 5 | Epic 12 | BACKLOG |
| MVP-4 | 5 | Epic 12 | BACKLOG |
| MVP-5 | 6 | Epic 28 | BACKLOG |
| MVP-6 | 5 | Epic 28 | BACKLOG |
| MVP-7 | 5 | Epic 12, 25, 28 | BACKLOG |
| **Total** | **36** | **All 3 Epics** | **1 DONE, 1 IN_PROGRESS, 5 BACKLOG** |

---

## Traceability Artifacts

### Code Files by Original Epic

#### Epic 12 (Tool Interface) Files
- `src/lib/agent/tools/read-file-tool.ts`
- `src/lib/agent/tools/write-file-tool.ts`
- `src/lib/agent/tools/list-files-tool.ts`
- `src/lib/agent/tools/execute-command-tool.ts`
- `src/lib/agent/facades/file-tools.ts`
- `src/lib/agent/facades/file-tools-impl.ts`
- `src/lib/agent/facades/terminal-tools.ts`
- `src/lib/agent/facades/terminal-tools-impl.ts`
- `src/lib/agent/facades/file-lock.ts`
- `src/lib/webcontainer/terminal-adapter.ts`

#### Epic 25 (AI Foundation) Files
- `src/components/agent/AgentConfigDialog.tsx`
- `src/components/ide/AgentChatPanel.tsx`
- `src/components/ide/StreamingMessage.tsx`
- `src/components/chat/ChatPanel.tsx`
- `src/components/chat/CodeBlock.tsx`
- `src/components/chat/ToolCallBadge.tsx`
- `src/lib/agent/providers/provider-adapter.ts`
- `src/lib/agent/providers/model-registry.ts`
- `src/lib/agent/providers/credential-vault.ts`
- `src/lib/agent/providers/types.ts`
- `src/lib/agent/hooks/use-agent-chat-with-tools.ts`
- `src/routes/api/chat.ts`
- `src/stores/agents.ts`
- `src/stores/agent-selection.ts`

#### Epic 28 (UX Brand) Files
- `src/components/chat/ApprovalOverlay.tsx`
- `src/components/chat/DiffPreview.tsx`
- `src/components/layout/IDEHeaderBar.tsx`
- `src/lib/state/statusbar-store.ts`
- `src/lib/state/file-sync-status-store.ts`
- `src/lib/events/workspace-events.ts`

### Documentation Artifacts

| Artifact | Original Epic | Consolidated Into | Status |
|----------|----------------|-------------------|---------|
| Epic 12 Specification | Epic 12 | MVP-3, MVP-4, MVP-7 | Archived |
| Epic 25 Specification | Epic 25 | MVP-1, MVP-2, MVP-7 | Archived |
| Epic 28 Specification | Epic 28 | MVP-5, MVP-6, MVP-7 | Archived |
| MVP Sprint Plan | All 3 Epics | MVP (all 7 stories) | Active |

---

## Consolidation Rationale

### Why Consolidate Epics 12, 25, 28?

1. **Vertical Slice Completeness**: Each original epic focused on a specific layer (tool interface, AI foundation, UX brand), but lacked complete user journey

2. **Sequential Dependency**: Original epics had complex cross-dependencies that made parallel execution difficult

3. **Story Granularity**: Original stories were too fine-grained, leading to 124+ stories across 26+ epics

4. **Focus and Clarity**: Single MVP epic provides clear focus on delivering complete AI coding agent functionality

5. **Reduced Overhead**: Fewer governance documents, handoffs, and status tracking overhead

### Why 7 Sequential Stories?

1. **User Journey Alignment**: Stories follow complete user journey from configuration to E2E validation

2. **Dependency Management**: Each story builds upon previous one, ensuring working software at each stage

3. **E2E Verification**: Sequential approach allows mandatory browser E2E verification at each stage

4. **Risk Mitigation**: Completing stories sequentially reduces risk of incomplete implementation

5. **Clear Progression**: 7 stories provide clear milestones and progress tracking

---

## Preservation of Traceability

### How Traceability is Preserved

1. **This Document**: Complete mapping from original epics to consolidated MVP stories

2. **Code Comments**: Files include comments referencing original epic/story context

3. **Git History**: Original epic commits preserved in git history

4. **Archived Specifications**: Original epic specifications archived in `_bmad-output/epics/`

5. **Story Dependencies**: MVP story dependencies reference original epic relationships

### Future Reference

When reviewing code or making changes:
- Refer to this document to understand original epic context
- Check archived epic specifications for detailed requirements
- Review git history for original implementation decisions
- Use story mapping to trace feature origins

---

## Related Documents

- [MVP Sprint Plan](../sprint-artifacts/mvp-sprint-plan-2025-12-24.md) - Complete MVP story details
- [Story Validation](../sprint-artifacts/mvp-story-validation-2025-12-24.md) - Story dependency and validation rules
- [Sprint Status](../sprint-artifacts/sprint-status-consolidated.yaml) - Current story status
- [Governance Audit Report](../governance-audit/governance-audit-report-2025-12-26.md) - Audit findings and issues
- [Remediation Plan](../governance-audit/remediation-plan-2025-12-26.md) - P2 remediation steps

---

## Approval

- **Status**: Approved for implementation
- **Next Steps**: Use this mapping for traceability in future development
- **Owner**: Dev Team

---

**Document End**
