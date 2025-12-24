# Epic Overlap Analysis
**Date**: 2025-12-24
**Purpose**: Document overlapping and conflicting epics for consolidation

## Current Epic Landscape (26+ epics)

### COMPLETED EPICS (Should be Archived)
- Epic 1: Project Foundation & IDE Shell ✅
- Epic 2: WebContainers Integration ✅
- Epic 3: File System Access Layer ✅
- Epic 4: IDE Components ✅
- Epic 5: Persistence Layer ✅
- Epic 10: Event Bus Architecture ✅
- Epic 13: Terminal & Sync Stability ✅
- Epic 22: Production Hardening ✅

### ACTIVE EPICS WITH OVERLAPS

#### AI Agent Core (HIGH OVERLAP)
- **Epic 12: Tool Interface Layer** (4/6 done)
  - AgentFileTools facade
  - AgentTerminalTools facade
  - Tool wiring to TanStack AI
  
- **Epic 25: AI Foundation Sprint** (6 stories - all marked DONE but non-functional)
  - TanStack AI integration
  - File/terminal tools implementation
  - Tool execution UI
  - Approval flow
  - Agent UI wiring
  
- **Epic 28: UX Brand Identity & Design System** (15/17 done)
  - Agent Management Dashboard
  - Agent configuration forms
  - Agent chat interface
  - Design system components

#### State Management (MEDIUM OVERLAP)
- **Epic 27: State Architecture Stabilization** (8/13 done)
  - Zustand migration
  - Dexie integration
  - Component migration

#### UI/UX Modernization (LOW OVERLAP)
- **Epic 23: UX/UI Modernization** (3/16 done)
  - TailwindCSS 4.x
  - ShadcnUI components
  - Theme system

#### BACKLOG EPICS
- Epic 7: Git Integration (P2)
- Epic 11: Code Splitting & Module Refactor (PAUSED)
- Epic 21: Client-Side Localization (P2)

## Critical Issues Identified

### 1. Epic Proliferation
- 26+ epics for a single MVP feature
- No clear user journey mapping
- Technical concerns separated from user value

### 2. Story Status Chaos
- Epic 25 stories marked DONE but frontend non-functional
- No acceptance criteria verification
- Missing E2E validation

### 3. Duplication
- Agent tools: Epic 12 + Epic 25
- Agent UI: Epic 25 + Epic 28
- State management: Epic 27 + scattered across others

### 4. Context Poisoning
- Too many concurrent workstreams
- No focus on vertical slice
- Component-centric validation

## Consolidation Strategy

### 1. Create Single MVP Epic
```
Epic MVP: AI Coding Agent Vertical Slice
├── MVP-1: Agent Configuration & Persistence
├── MVP-2: Chat Interface with Streaming
├── MVP-3: Tool Execution (File Operations)
├── MVP-4: Tool Execution (Terminal Commands)
├── MVP-5: Approval Workflow
├── MVP-6: Real-time UI Updates
└── MVP-7: E2E Integration Testing
```

### 2. Archive Completed Epics
- Move Epics 1-5, 10, 13, 22 to archive
- Keep as reference for implementation patterns

### 3. Supersede Overlapping Epics
- Epic 12 → Absorbed into MVP-3/MVP-4
- Epic 25 → Superseded by MVP epic
- Epic 28 → Partially absorbed (MVP-1/MVP-2)

### 4. Defer Non-Essential
- Epic 7 (Git) → P2 backlog
- Epic 11 (Refactor) → Post-MVP
- Epic 21 (i18n) → Post-MVP
- Epic 23 (UI polish) → Post-MVP

## User Journey Mapping

### Journey: Configure → Chat → Execute → Approve → Iterate

1. **Configure Agent** (MVP-1)
   - Provider selection (OpenRouter, Anthropic)
   - API key storage
   - Model selection
   - Persistence across sessions

2. **Chat Interface** (MVP-2)
   - Message input/send
   - Streaming responses
   - Rich text rendering
   - Code highlighting

3. **Tool Execution - Files** (MVP-3)
   - Read file operations
   - Write file operations
   - File tree integration
   - Monaco editor updates

4. **Tool Execution - Terminal** (MVP-4)
   - Command execution
   - Output display
   - Terminal integration
   - Process management

5. **Approval Workflow** (MVP-5)
   - Tool call visualization
   - Approve/deny interface
   - Execution logs
   - Error handling

6. **Real-time Updates** (MVP-6)
   - File sync notifications
   - Terminal status updates
   - Chat state persistence
   - UI synchronization

7. **E2E Testing** (MVP-7)
   - Full workflow verification
   - Browser automation tests
   - Performance validation
   - Documentation

## Next Steps

1. Create consolidated sprint-status.yaml
2. Update bmm-workflow-status.yaml
3. Document dead artifacts for removal
4. Create consolidation report
5. Implement governance gates for E2E verification
