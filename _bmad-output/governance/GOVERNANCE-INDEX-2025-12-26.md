# Governance Index - Single Source of Truth

**Document ID**: GOV-INDEX-2025-12-26
**Last Updated**: 2025-12-26T16:45:00+07:00
**Maintainer**: BMAD Master Orchestrator (bmad-core-bmad-master)
**Version**: 1.0

---

## Quick Navigation

- [Project Overview](#project-overview)
- [Current Status Summary](#current-status-summary)
- [Active Epics & Stories](#active-epics--stories)
- [Governance Artifacts Index](#governance-artifacts-index)
- [Handoff Document Index](#handoff-document-index)
- [Governance Protocols](#governance-protocols)
- [Status Tracking](#status-tracking)
- [MCP Research Protocol](#mcp-research-protocol)

---

## Project Overview

**Project Name**: Via-gent
**Type**: Browser-based IDE with AI Agent Capabilities
**Stack**: React 19 + TypeScript + Vite + TanStack Router + WebContainers
**Platform**: Platform A (Antigravity) - Single Workstream

### Core Features
- Monaco Editor for code editing with tabbed interface
- xterm.js-based terminal integrated with WebContainers
- Bidirectional file sync between Local FS (FSA) and WebContainers
- AI Agent System with multi-provider support (OpenRouter, Anthropic, etc.)
- Multi-language support (English, Vietnamese) with i18next
- Project persistence via IndexedDB

### Architecture Principles
1. **Single Source of Truth**: Each state property has ONE owner (Zustand, Context, or localStorage)
2. **Local FS as Source of Truth**: All file operations go through LocalFSAdapter to browser's FSA
3. **WebContainer Mirror**: SyncManager syncs files to WebContainer sandbox (no reverse sync)
4. **Sequential Development**: MVP stories must be completed in order (no parallel execution)
5. **Mandatory E2E Verification**: Every story requires browser verification before DONE

---

## Current Status Summary

### Sprint Status (as of 2025-12-26T16:45:00+07:00)

| Story | Status | Completed At | Notes |
|-------|--------|---------------|-------|
| MVP-1: Agent Configuration & Persistence | DONE | 2025-12-25 | Configuration UI, credential vault, model registry implemented |
| MVP-2: Chat Interface with Streaming | DONE | 2025-12-25 | **Awaiting E2E verification** - streaming chat implemented |
| MVP-3: Tool Execution - File Operations | BLOCKED | N/A | **Blocked by MVP-2 E2E verification** - dependencies not met |
| MVP-4: Tool Execution - Terminal Commands | NOT_STARTED | N/A | Blocked by MVP-3 completion |
| MVP-5: Approval Workflow | NOT_STARTED | N/A | Blocked by MVP-4 completion |
| MVP-6: Real-time UI Updates | NOT_STARTED | N/A | Blocked by MVP-5 completion |
| MVP-7: E2E Integration Testing | NOT_STARTED | N/A | Blocked by MVP-6 completion |

### Governance Status

| Category | Status | Last Updated |
|----------|--------|--------------|
| P0 Critical Issues | RESOLVED | 2025-12-26 |
| P1 Urgent Issues | IN_PROGRESS | 2025-12-26 |
| P2 Medium Issues | PENDING | 2025-12-26 |
| E2E Verification Enforcement | IMPLEMENTED | 2025-12-26 |
| Status Consistency | VERIFIED | 2025-12-26 |

---

## Active Epics & Stories

### MVP Epic - AI Coding Agent Vertical Slice

**Epic ID**: MVP-2025-12-24
**Status**: IN_PROGRESS
**Stories**: 7 sequential stories
**Consolidation**: From 26+ epics, 124+ stories (96% reduction)

#### Story Details

**MVP-1**: Agent Configuration & Persistence
- **Status**: ✅ DONE
- **Completed**: 2025-12-25
- **E2E Verified**: Yes
- **Key Deliverables**:
  - AgentConfigDialog UI component
  - Credential vault (IndexedDB storage)
  - Model registry configuration
  - Provider adapter factory
- **Traceability**: Consolidates Epic 25-1, 25-2, 25-3

**MVP-2**: Chat Interface with Streaming
- **Status**: ✅ DONE (awaiting E2E verification)
- **Completed**: 2025-12-25
- **E2E Verified**: **PENDING** - screenshot required
- **Key Deliverables**:
  - AgentChatPanel component
  - StreamingMessage component
  - SSE streaming implementation
  - TanStack AI integration
- **Traceability**: Consolidates Epic 25-4, 25-6, 28-1

**MVP-3**: Tool Execution - File Operations
- **Status**: 🚫 BLOCKED (pending MVP-2 E2E verification)
- **Blocked By**: MVP-2 E2E verification
- **Key Deliverables**:
  - File tool facades (read, write, list)
  - Tool execution with approval workflow
  - Diff preview for file changes
  - File locking mechanism
- **Traceability**: Consolidates Epic 12-1, 25-5, 25-7

**MVP-4**: Tool Execution - Terminal Commands
- **Status**: ⏳ NOT_STARTED
- **Blocked By**: MVP-3 completion
- **Key Deliverables**:
  - Terminal tool facades (execute)
  - Shell integration with WebContainer
  - Command execution with approval
- **Traceability**: Consolidates Epic 12-2, 25-8

**MVP-5**: Approval Workflow
- **Status**: ⏳ NOT_STARTED
- **Blocked By**: MVP-4 completion
- **Key Deliverables**:
  - ApprovalOverlay component
  - ToolCallBadge component
  - Approval state management
  - DiffPreview component
- **Traceability**: Consolidates Epic 12-3, 28-2

**MVP-6**: Real-time UI Updates
- **Status**: ⏳ NOT_STARTED
- **Blocked By**: MVP-5 completion
- **Key Deliverables**:
  - Real-time file tree updates
  - Monaco editor synchronization
  - Terminal output streaming
  - Chat message streaming
- **Traceability**: Consolidates Epic 12-4, 28-3

**MVP-7**: E2E Integration Testing
- **Status**: ⏳ NOT_STARTED
- **Blocked By**: MVP-6 completion
- **Key Deliverables**:
  - Complete E2E test suite
  - Browser automation tests
  - Performance benchmarks
  - User journey validation
- **Traceability**: Consolidates Epic 12-5, 28-4

---

## Governance Artifacts Index

### Audit Reports

| Document ID | Title | Date | Status | Priority |
|-------------|-------|------|----------|
| GOV-AUD-2025-12-26 | Governance Audit Report | 2025-12-26 | COMPLETED |
| P1.10-2025-12-26 | State Management Audit | 2025-12-26 | COMPLETED |
| GOV-AUD-2025-12-25 | OpenRouter 401 Fix Analysis | 2025-12-25 | COMPLETED |

### Architecture Documents

| Document ID | Title | Date | Status |
|-------------|-------|------|--------|
| ARCH-MCP-2025-12-21 | MCP Research Protocol (Mandatory) | 2025-12-21 | ACTIVE |
| ARCH-MVP-2025-12-24 | MVP Sprint Plan | 2025-12-24 | ACTIVE |
| ARCH-VAL-2025-12-24 | MVP Story Validation | 2025-12-24 | ACTIVE |

### Course Corrections

| Document ID | Title | Date | Status |
|-------------|-------|------|--------|
| CC-OPENROUTER-2025-12-25 | OpenRouter 401 Fix | 2025-12-25 | RESOLVED |
| CC-AGENTIC-2025-12-25 | Agentic Execution Loop Analysis | 2025-12-25 | DOCUMENTED |

### Technical Documentation

| Directory | Description | Last Updated |
|-----------|-------------|--------------|
| docs/2025-12-23/ | Comprehensive technical documentation | 2025-12-23 |
| docs/2025-12-26/ | Concept for Knowledge Synthesis Station | 2025-12-26 |

---

## Handoff Document Index

### Recent Handoffs (Last 30 Days)

| Document ID | Source Agent | Target Agent | Date | Status | Epic/Story |
|------------|--------------|--------------|------|--------|-------------|
| ARCH-PM-2025-12-26 | bmad-bmm-architect | bmad-bmm-pm | 2025-12-26 | PENDING | Governance Fixes |
| BMAD-DEV-MVP3-2025-12-25 | bmad-core-bmad-master | bmad-bmm-dev | 2025-12-25 | BLOCKED | MVP-3 Tool Execution |
| BMAD-PM-MVP-2025-12-24 | bmad-core-bmad-master | bmad-bmm-pm | 2025-12-24 | COMPLETED | MVP Sprint Planning |
| BMAD-DEV-EPIC25-2025-12-22 | bmad-core-bmad-master | bmad-bmm-dev | 2025-12-22 | COMPLETED | Epic 25 AI Foundation |
| BMAD-DEV-28-24-2025-12-24 | bmad-core-bmad-master | bmad-bmm-dev | 2025-12-24 | COMPLETED | Story 28-24 |
| BMAD-DEV-2025-12-20 | bmad-core-bmad-master | bmad-bmm-dev | 2025-12-20 | COMPLETED | General Development |
| DEV-CR-25-6-2025-12-24 | bmad-bmm-dev | code-reviewer | 2025-12-24 | COMPLETED | Story 25-6 Code Review |
| DEV-CR-P1.4-2025-12-25 | bmad-bmm-dev | code-reviewer | 2025-12-25 | COMPLETED | P1.4 Code Review |
| ARCH-PHASE2-2025-12-22 | bmad-bmm-architect | bmad-core-bmad-master | 2025-12-22 | COMPLETED | Architect Phase 2 Completion |

### Handoff Status Legend

- **PENDING**: Handoff created, awaiting target agent acceptance
- **IN_PROGRESS**: Target agent actively working on handoff
- **COMPLETED**: Handoff accepted and work completed
- **BLOCKED**: Handoff blocked by dependencies
- **REJECTED**: Handoff rejected (requires clarification)

---

## Governance Protocols

### 1. Handoff Protocol

**Document**: [`HANDOFF-PROTOCOL.md`](_bmad-output/governance/HANDOFF-PROTOCOL-2025-12-26.md)

**Purpose**: Standardized process for creating and accepting handoff documents between agents.

**Key Requirements**:
- All handoffs must be timestamped (ISO 8601 format)
- Must include context summary, task specification, current workflow status
- Must reference related epic/story
- Must define acceptance criteria
- Must specify next agent assignment

**Status Update Procedure**:
1. Source agent creates handoff document
2. Target agent reviews and accepts handoff
3. Target agent updates status to IN_PROGRESS
4. Target agent completes work
5. Target agent updates status to COMPLETED
6. Both agents update governance index

### 2. Status Synchronization Procedure

**Document**: [`STATUS-SYNC-PROCEDURE.md`](_bmad-output/governance/STATUS-SYNC-PROCEDURE-2025-12-26.md)

**Purpose**: Maintain consistency between all governance status documents.

**Primary Sources of Truth**:
- [`sprint-status-consolidated.yaml`](_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml) - Story status
- [`bmm-workflow-status-consolidated.yaml`](_bmad-output/bmm-workflow-status-consolidated.yaml) - Workflow status

**Update Triggers**:
- After task completion
- After handoff creation/acceptance
- After E2E verification
- After sprint retrospective

**Conflict Resolution**:
1. Identify conflicting status values
2. Consult original handoff documents
3. Verify with BMAD Master Orchestrator
4. Update all status documents to agreed value
5. Document conflict resolution in governance notes

### 3. E2E Verification Protocol

**Document**: [`_bmad-output/e2e-verification/CHECKLIST-TEMPLATE.md`](_bmad-output/e2e-verification/CHECKLIST-TEMPLATE.md)

**Purpose**: Enforce mandatory browser E2E verification for all story completions.

**Requirements**:
- Full workflow testing (not just component existence)
- Screenshot or recording captured
- Verification checklist completed
- Artifacts stored in `_bmad-output/e2e-verification/{story-id}/`

**Gate Enforcement**:
- Story CANNOT be marked DONE without E2E verification
- PM agent must verify screenshot/recording exists
- Verification artifacts must be linked in governance index

### 4. MCP Research Protocol

**Document**: [`_bmad-output/architecture/mcp-research-protocol-mandatory.md`](_bmad-output/architecture/mcp-research-protocol-mandatory.md)

**Purpose**: Mandatory research steps before implementing unfamiliar patterns.

**Required Steps**:
1. **Context7**: Query library documentation for API signatures
2. **Deepwiki**: Check repo wikis for architecture decisions
3. **Tavily/Exa**: Search for 2025 best practices
4. **Repomix**: Analyze current codebase structure

**Enforcement**:
- Pre-commit hooks (planned)
- Code review checklist
- Research artifact requirements

---

## Status Tracking

### Primary Status Documents

#### Sprint Status

**File**: [`_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml`](_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml)
**Purpose**: Track story-level progress and completion status
**Owner**: BMAD Master Orchestrator
**Update Frequency**: After each story completion/blocker

#### Workflow Status

**File**: [`_bmad-output/bmm-workflow-status-consolidated.yaml`](_bmad-output/bmm-workflow-status-consolidated.yaml)
**Purpose**: Track agent-level workflow status
**Owner**: BMAD Master Orchestrator
**Update Frequency**: After each handoff acceptance/completion

### Status Consistency Verification

**Last Verified**: 2025-12-26T16:45:00+07:00
**Status**: ✅ CONSISTENT

**Verification Method**:
- Cross-referenced sprint-status.yaml with governance index
- Verified all handoff statuses match workflow status
- Confirmed story dependencies are respected

---

## MCP Research Protocol

### Mandatory Research Steps

All AI agents developing this project MUST use MCP research tools before implementing unfamiliar patterns.

#### Step 1: Context7
Query documentation for libraries (TanStack, WebContainers, isomorphic-git)
- Tool: `mcp_context7_get-library-docs`
- Purpose: Get API signatures and official documentation

#### Step 2: Deepwiki
Check GitHub repo wikis for implementation patterns
- Tool: `mcp_deepwiki_ask_question`
- Purpose: Understand architecture decisions and patterns

#### Step 3: Tavily/Exa
Search for recent (2025) best practices
- Tool: `mcp_tavily_tavily-search` or `mcp_exa_web_search_exa`
- Purpose: Find current best practices and patterns

#### Step 4: Repomix
Analyze current codebase structure before changes
- Tool: `mcp_repomix_pack_codebase`
- Purpose: Understand existing implementation before modifications

### Research Artifact Requirements

When implementing unfamiliar patterns:
1. Document research findings in `_bmad-output/research/{pattern}-{timestamp}.md`
2. Include library versions, API signatures, and code examples
3. Reference research artifacts in code comments
4. Update governance index with research artifacts

---

## Governance Rules

### Single Source of Truth Principle

**Rule**: Each state property has ONE owner (Zustand, Context, or localStorage)

**Enforcement**:
- Code review checklist
- Linting rules (planned)
- Documentation: State ownership matrix

**Reference**: [`state-management-audit-p1.10-2025-12-26.md`](_bmad-output/state-management-audit-p1.10-2025-12-26.md)

### E2E Verification Gate

**Rule**: No story marked DONE without browser verification

**Enforcement**:
- Automated gate in sprint workflow
- Documentation: Verification checklist and screenshot directory
- PM agent approval required

**Reference**: [`_bmad-output/e2e-verification/CHECKLIST-TEMPLATE.md`](_bmad-output/e2e-verification/CHECKLIST-TEMPLATE.md)

### Handoff Protocol

**Rule**: All handoffs indexed in GOVERNANCE-INDEX.md

**Enforcement**:
- Automated status synchronization
- Documentation: Handoff acceptance criteria
- Governance index updated after each handoff

**Reference**: [`HANDOFF-PROTOCOL.md`](_bmad-output/governance/HANDOFF-PROTOCOL-2025-12-26.md)

### Status Consistency

**Rule**: All governance documents must agree on current status

**Enforcement**:
- Automated validation scripts (planned)
- Documentation: Status update workflow
- Regular consistency checks

**Reference**: [`STATUS-SYNC-PROCEDURE.md`](_bmad-output/governance/STATUS-SYNC-PROCEDURE-2025-12-26.md)

### TODO Management

**Rule**: All TODOs tracked with ownership and deadlines

**Enforcement**:
- Sprint retrospective review
- Documentation: TODO tracking system
- GitHub issues for TODOs (planned)

### Component Integration

**Rule**: All components must be routed or integrated

**Enforcement**:
- Code review checklist
- Documentation: Component routing map
- Integration tests required

### MCP Research Protocol Enforcement

**Rule**: Mandatory research before implementing unfamiliar patterns

**Enforcement**:
- Code review checklist
- Pre-commit hooks (planned)
- Documentation: Research artifact requirements

**Reference**: [`_bmad-output/architecture/mcp-research-protocol-mandatory.md`](_bmad-output/architecture/mcp-research-protocol-mandatory.md)

---

## Quick Reference

### Critical Files

| File | Purpose | Location |
|------|---------|----------|
| GOVERNANCE-INDEX.md | Single source of truth | `_bmad-output/governance/` |
| sprint-status-consolidated.yaml | Story status | `_bmad-output/sprint-artifacts/` |
| bmm-workflow-status-consolidated.yaml | Workflow status | `_bmad-output/` |
| HANDOFF-INDEX.md | Handoff document index | `_bmad-output/governance/` |
| HANDOFF-PROTOCOL.md | Handoff standardized protocol | `_bmad-output/governance/` |
| STATUS-SYNC-PROCEDURE.md | Status synchronization procedure | `_bmad-output/governance/` |

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `_bmad-output/governance/` | Governance artifacts and protocols |
| `_bmad-output/handoffs/` | Handoff documents (timestamped) |
| `_bmad-output/sprint-artifacts/` | Sprint plans and status |
| `_bmad-output/e2e-verification/` | E2E verification artifacts |
| `_bmad-output/course-corrections/` | Course correction analyses |
| `_bmad-output/architecture/` | Architecture documentation |
| `_bmad-output/epics/` | Epic specifications |

---

## Change Log

| Date | Change | Author |
|------|--------|---------|
| 2025-12-26T16:45:00+07:00 | Initial governance infrastructure created | bmad-bmm-architect |

---

**Next Review**: After MVP-2 E2E verification completion
**Review Frequency**: Weekly or after major milestone completion
