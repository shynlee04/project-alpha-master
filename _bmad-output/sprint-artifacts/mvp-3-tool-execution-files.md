# Story: MVP-3 Tool Execution - File Operations

## Story Context
- Epic: MVP (AI Coding Agent Vertical Slice)
- Platform: Platform A (Antigravity)
- Incident: INC-2025-12-24-001 (browser E2E required)
- Depends on: MVP-2 Chat Interface (in-progress)

## User Story
As a developer using the AI coding agent, I want the agent to read and write project files with approvals so that file operations stay safe, synchronized (Local FS + WebContainer), and reflected in the IDE (Monaco + FileTree) in real time.

## Acceptance Criteria
- AC-1 (Read): Given an open project and an agent request to read a file, when approval is granted, then the file content is read from LocalFS (or WebContainer fallback), permissions are respected, and the response includes path, encoding, size, and lastModified.
- AC-2 (Write Existing): Given a file is open in Monaco with possible unsaved changes, when the agent requests to write/update the file and the user approves, then a diff preview is shown, conflicts are handled (prompt/merge/last-write), Monaco updates without cursor loss, and file tree metadata updates.
- AC-3 (Create New): Given a valid path for a new file, when the agent requests creation and the user approves, then the file is created in LocalFS + WebContainer, FileTree expands/ selects it, and it can be opened in Monaco.
- AC-4 (Sync & Events): Given file operations complete, when sync triggers, then SyncManager updates LocalFS↔WebContainer, emits file:changed/file:created, and UI (FileTree/Monaco) reflects changes in real time.
- AC-5 (Safety & Approval): Given any file operation, when approval is required, then the approval dialog shows path and diff/preview; denials abort cleanly; errors surface actionable messages.

## Tasks (with research)
- [ ] Research: Load dependency instructions (docs/agent-instructions/dependency-libraries-usage.md) and AGENTS.md guidance.
- [ ] Research: Use MCP tools (Context7/DeepWiki/Tavily/Exa) for TanStack AI tool architecture, tool approval, server/client tools, and WebContainer FS patterns.
- [ ] Design: Define tool contracts (read_file, write_file) with metadata, permissions, sync + event emission, and approval hooks.
- [ ] Design: Concurrency/merge strategy for writes (unsaved Monaco buffers; last-write vs prompt vs merge hook).
- [ ] Implement: AgentFileTools facade wiring to WorkspaceContext/SyncManager/LocalFSAdapter/WebContainer.
- [ ] Implement: Approval flow with diff/preview UI for reads/writes; error handling.
- [ ] Implement: UI updates—FileTree status, Monaco model updates (preserve cursor/selection), event bus hooks.
- [ ] Tests: Unit tests for tools; integration tests for LocalFS/WebContainer sync; UI tests for approval/diff; E2E browser check with screenshot.
- [ ] Docs & Governance: Update Dev Agent Record; ensure sprint-status/bmm-workflow-status reflect state; capture screenshot for DoD.

## Research Requirements
- TanStack AI tool architecture: client/server tools, tool approval, agentic cycle, connection adapters (tanstack.com/ai latest docs).
- WebContainer FS and permissions: stackblitz/webcontainer-core patterns.
- Monaco integration patterns for external writes (model update without cursor loss).
- Approval/diff UX best practices (shadcn + IDE patterns).

## Dev Notes
- Follow agent architecture guidelines (_bmad-output/architecture/agent-architecture-guidelines-2025-12-24.md).
- Respect Local FS as source of truth; SyncManager mirrors to WebContainer; emit file events.
- Approval mandatory for writes; show diff preview.
- Monaco: update model, preserve cursor; handle dirty tabs via prompt/merge.
- Event bus: emit file:created/file:changed; update FileTree status badges.

## References
- Sprint status: _bmad-output/sprint-artifacts/sprint-status-consolidated.yaml
- Workflow status: _bmad-output/bmm-workflow-status-consolidated.yaml
- Risk register: _bmad-output/sprint-artifacts/mvp-risk-register-2025-12-24.md
- Story validation: _bmad-output/sprint-artifacts/mvp-story-validation-2025-12-24.md
- Sprint plan: _bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md
- Agent architecture: _bmad-output/architecture/agent-architecture-guidelines-2025-12-24.md
- E2E testing foundation: _bmad-output/testing/e2e-testing-foundation-2025-12-24.md

## Dev Agent Record
- Implementation notes: (pending)
- Files changed: (pending)
- Tests: (pending)
- E2E screenshot: (pending)

## Status
- drafted
- History: 2025-12-25 created (Platform A)
