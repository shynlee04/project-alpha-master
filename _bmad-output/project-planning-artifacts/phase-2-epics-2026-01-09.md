---
# ═══════════════════════════════════════════════════════════════════════════
# PHASE 2 EPICS: Agentic Capability Verification
# ═══════════════════════════════════════════════════════════════════════════
title: "Phase 2 Epics: Agentic Capability Verification"
version: "1.0.0"
created: "2026-01-09T03:10:00+07:00"
phase: "PHASE 2: Agentic Verification"
status: "READY_FOR_IMPLEMENTATION"
priority: "P0 - CRITICAL"
duration: "3-4 days"
total_stories: 18
total_effort: "~24 hours"
gate_criteria: "All agentic use cases verified with real API calls"

# Predecessor:
predecessor:
  phase: "PHASE 1"
  status: "COMPLETE ✅"
  completed_at: "2026-01-09T16:30:00+07:00"
  stories_completed: 18
  gate_result: "ALL GATES PASSING"

# Input Documents:
input_documents:
  - "_bmad-output/project-planning-artifacts/phase-1-epics-2026-01-08.md"
  - "_bmad-output/sprint-artifacts/phase-1-sprint-status-2026-01-08.yaml"
  - "_bmad-output/documentation/architecture.md"
  - "_bmad/modules/integration-testing/MANIFEST.md"
  - "_bmad/modules/integration-testing/config/api-keys-prod.yaml"

# Integration Testing Resources:
integration_testing:
  api_keys: "_bmad/modules/integration-testing/config/api-keys-prod.yaml"
  mcp_servers: "_bmad/modules/integration-testing/config/mcp-servers.yaml"
  playwright_mcp: "INSTALLED"
  gemini_key: "AVAILABLE"
  openrouter_key: "AVAILABLE"
---

# Phase 2 Epics: Agentic Capability Verification

## Executive Summary

Phase 2 focuses on **verifying that the agentic capabilities work end-to-end** with real API calls. Phase 1 established the foundation (routing, settings, CRUD). Phase 2 proves the AI agent can actually:

1. **CRUD files programmatically** via agent tools
2. **Execute terminal commands** via WebContainer
3. **Respond to AI slash commands** in Notes
4. **Access cross-workspace context** for informed responses

**Philosophy**: Phase 2 is about VERIFICATION, not NEW code. The code exists - we need to prove it works.

---

## Real-World Use Cases (The Why)

### USE CASE 1: "Build me a Next.js app with authentication"

```
USER: "Create a Next.js app with NextAuth.js authentication"

AGENT NEEDS TO:
├── Create project files (pages, components, api routes)
├── Install dependencies via terminal (npm install next-auth)
├── Configure environment variables
├── Test the flow
└── Iterate on user feedback

PHASE 2 VERIFIES:
✓ write_file tool creates files correctly
✓ execute_command runs npm install
✓ Terminal output streams to user
✓ Agent can read and modify created files
```

### USE CASE 2: "Fix this bug in my code"

```
USER: *pastes error message* "Fix this TypeError"

AGENT NEEDS TO:
├── Read relevant files for context
├── Understand codebase structure via search
├── Propose and apply fix
└── Verify fix works

PHASE 2 VERIFIES:
✓ read_file returns file content
✓ search_files finds relevant matches
✓ write_file updates existing files
✓ execute_command runs tests
```

### USE CASE 3: "Summarize my notes for this project"

```
USER: "Summarize my notes for this project"

AGENT NEEDS TO:
├── Read all notes for current project
├── Synthesize key points
└── Generate coherent summary

PHASE 2 VERIFIES:
✓ AI slash commands work in Notes
✓ Agent can access note content
✓ Model selection affects response
```

### USE CASE 4: "Search my knowledge base for X"

```
USER: "What does the authentication module do?"

AGENT NEEDS TO:
├── Search codebase for relevant files
├── Read file contents for context
└── Synthesize answer with references

PHASE 2 VERIFIES:
✓ search_files returns relevant matches
✓ Agent chains multiple tool calls
✓ Context window includes file content
```

---

## Requirements for Phase 2

### Functional Requirements

```
FR-P2-01: Agent read_file tool returns file content correctly
FR-P2-02: Agent write_file tool creates/modifies files
FR-P2-03: Agent list_files tool returns directory contents
FR-P2-04: Agent execute_command tool runs shell commands
FR-P2-05: Agent search_files tool returns regex matches
FR-P2-06: Terminal displays command output in real-time
FR-P2-07: AI slash commands in Notes trigger AI response
FR-P2-08: Model selection persists and affects responses
FR-P2-09: Agent selection per workspace works correctly
FR-P2-10: Cross-workspace context accessible to agent
```

### Non-Functional Requirements

```
NFR-P2-01: Real API calls (NO MOCKS) - Gemini and OpenRouter
NFR-P2-02: Response time < 10 seconds for tool calls
NFR-P2-03: Terminal output streams within 500ms
NFR-P2-04: No console errors during agentic operations
NFR-P2-05: All tests pass in Chromium, Firefox, WebKit
```

---

## EPIC-P2-1: Agent Tool Verification

**Priority**: P0-CRITICAL
**Effort**: 8 hours
**Dependencies**: Phase 1 COMPLETE

**Description**: Verify all agent file tools work end-to-end with real API calls.

### Stories

#### P2-01: Verify read_file Tool

**Priority**: P0
**Effort**: 1 hour
**Type**: Verification

**Description**:
Test agent's read_file tool with a real Gemini/OpenRouter API call.

**Acceptance Criteria**:
- [ ] Chat: "Read the package.json file and tell me the dependencies"
- [ ] Agent calls read_file tool
- [ ] File content returned correctly
- [ ] Agent summarizes dependencies in response
- [ ] No errors in console

**Test File**: `tests/e2e/agent-tools/read-file.spec.ts`

---

#### P2-02: Verify write_file Tool

**Priority**: P0
**Effort**: 1 hour
**Type**: Verification

**Description**:
Test agent's write_file tool creates and modifies files.

**Acceptance Criteria**:
- [ ] Chat: "Create a new file called hello.txt with content 'Hello World'"
- [ ] Agent calls write_file tool
- [ ] File appears in file tree
- [ ] File content is correct
- [ ] Chat: "Update hello.txt to say 'Hello Phase 2'"
- [ ] File content updated

**Test File**: `tests/e2e/agent-tools/write-file.spec.ts`

---

#### P2-03: Verify list_files Tool

**Priority**: P1
**Effort**: 1 hour
**Type**: Verification

**Description**:
Test agent's list_files tool returns directory contents.

**Acceptance Criteria**:
- [ ] Chat: "List all files in the project root"
- [ ] Agent calls list_files tool
- [ ] File list returned
- [ ] Agent formats response with file names

**Test File**: `tests/e2e/agent-tools/list-files.spec.ts`

---

#### P2-04: Verify execute_command Tool

**Priority**: P0
**Effort**: 2 hours
**Type**: Verification

**Description**:
Test agent's execute_command tool runs shell commands via WebContainer.

**Acceptance Criteria**:
- [ ] Chat: "Run 'echo Hello World'"
- [ ] Terminal shows command and output
- [ ] Chat: "Run 'ls -la'"
- [ ] Directory listing displayed
- [ ] Chat: "Run 'npm --version'"
- [ ] npm version displayed (WebContainer has npm)
- [ ] Error commands handled gracefully

**Test File**: `tests/e2e/agent-tools/execute-command.spec.ts`

---

#### P2-05: Verify search_files Tool

**Priority**: P1
**Effort**: 1 hour
**Type**: Verification

**Description**:
Test agent's search_files tool finds pattern matches.

**Acceptance Criteria**:
- [ ] Chat: "Search for 'export function' in all TypeScript files"
- [ ] Agent calls search_files tool
- [ ] Results returned with file paths and line numbers
- [ ] Agent summarizes findings

**Test File**: `tests/e2e/agent-tools/search-files.spec.ts`

---

#### P2-06: Create Agent Tool Integration Test Suite

**Priority**: P0
**Effort**: 2 hours
**Type**: Development

**Description**:
Create Playwright test suite that verifies all agent tools with real API.

**Acceptance Criteria**:
- [ ] Test suite runs in CI
- [ ] Uses Gemini API key from config
- [ ] All 5 tool tests pass
- [ ] Screenshots captured for evidence
- [ ] Test report generated

**Output**: `tests/e2e/agent-tools/agent-tools.spec.ts`

---

## EPIC-P2-2: AI Integration End-to-End

**Priority**: P0-CRITICAL
**Effort**: 6 hours
**Dependencies**: EPIC-P2-1

**Description**: Verify the complete AI flow from Settings → Notes → Response.

### Stories

#### P2-07: Verify Settings → API Key → Store Chain

**Priority**: P0
**Effort**: 1 hour
**Type**: Verification

**Description**:
Verify API key flows from Settings UI to credential vault.

**Acceptance Criteria**:
- [ ] Go to Settings
- [ ] Enter Gemini API key
- [ ] VaultStatusCard shows "Key stored"
- [ ] Refresh page
- [ ] Key still shows as stored
- [ ] Vault persists key in IndexedDB

**Test File**: `tests/e2e/ai-integration/api-key-flow.spec.ts`

---

#### P2-08: Verify Notes AI Slash Commands

**Priority**: P0
**Effort**: 2 hours
**Type**: Verification

**Description**:
Verify AI slash commands work in BlockNote editor.

**Acceptance Criteria**:
- [ ] Open Notes workspace
- [ ] Create new note
- [ ] Type `/summarize this is a test paragraph`
- [ ] AI response appears in editor
- [ ] Response is coherent (real AI, not mock)
- [ ] Error message if no API key configured

**Test File**: `tests/e2e/ai-integration/slash-commands.spec.ts`

---

#### P2-09: Verify Model Selection

**Priority**: P1
**Effort**: 1 hour
**Type**: Verification

**Description**:
Verify model selection affects AI responses.

**Acceptance Criteria**:
- [ ] Go to agent configuration
- [ ] Change model from default to different model
- [ ] Model selection persists
- [ ] New AI call uses selected model
- [ ] Response header shows correct model

**Test File**: `tests/e2e/ai-integration/model-selection.spec.ts`

---

#### P2-10: Verify Agent Selection per Workspace

**Priority**: P1
**Effort**: 1 hour
**Type**: Verification

**Description**:
Verify different agents can be selected for different workspaces.

**Acceptance Criteria**:
- [ ] Configure Agent A for Notes workspace
- [ ] Configure Agent B for IDE workspace
- [ ] Switch to Notes, Agent A is active
- [ ] Switch to IDE, Agent B is active
- [ ] Selection persists across refresh

**Test File**: `tests/e2e/ai-integration/workspace-agents.spec.ts`

---

#### P2-11: Create AI Integration Test Suite

**Priority**: P0
**Effort**: 1 hour
**Type**: Development

**Description**:
Create Playwright test suite for all AI integration tests.

**Acceptance Criteria**:
- [ ] Test suite runs with OpenRouter API key
- [ ] All 4 test files pass
- [ ] Screenshots captured
- [ ] Real AI responses validated

**Output**: `tests/e2e/ai-integration/ai-integration.spec.ts`

---

## EPIC-P2-3: Terminal & WebContainer

**Priority**: P0
**Effort**: 6 hours
**Dependencies**: EPIC-P2-1

**Description**: Verify Terminal executes commands via WebContainer.

### Stories

#### P2-12: Verify WebContainer Boots

**Priority**: P0
**Effort**: 1 hour
**Type**: Verification

**Description**:
Verify WebContainer initializes successfully.

**Acceptance Criteria**:
- [ ] Open IDE workspace
- [ ] WebContainer boots without errors
- [ ] Terminal panel shows shell prompt
- [ ] Boot time < 5 seconds
- [ ] No console errors during boot

**Test File**: `tests/e2e/terminal/webcontainer-boot.spec.ts`

---

#### P2-13: Verify Terminal Command Execution

**Priority**: P0
**Effort**: 2 hours
**Type**: Verification

**Description**:
Verify basic terminal commands execute correctly.

**Acceptance Criteria**:
- [ ] Type `ls` in terminal, see directory listing
- [ ] Type `pwd`, see current directory
- [ ] Type `echo "test"`, see "test" output
- [ ] Type `cat package.json`, see file content
- [ ] Up arrow recalls previous command

**Test File**: `tests/e2e/terminal/commands.spec.ts`

---

#### P2-14: Verify npm/pnpm Commands

**Priority**: P0
**Effort**: 2 hours
**Type**: Verification

**Description**:
Verify npm commands execute in WebContainer.

**Acceptance Criteria**:
- [ ] Run `npm init -y`, package.json created
- [ ] Run `npm install lodash`, package installed
- [ ] Check node_modules/lodash exists
- [ ] Run `npm --version`, version displayed
- [ ] Run `node -e "console.log(1+1)"`, outputs 2

**Test File**: `tests/e2e/terminal/npm-commands.spec.ts`

---

#### P2-15: Verify Terminal in Agentic Mode

**Priority**: P1
**Effort**: 1 hour
**Type**: Verification

**Description**:
Verify agent's execute_command updates terminal UI.

**Acceptance Criteria**:
- [ ] Chat to agent: "Run npm init -y"
- [ ] Agent calls execute_command
- [ ] Terminal shows command being executed
- [ ] Output visible to user
- [ ] Agent reports success/failure

**Test File**: `tests/e2e/terminal/agentic-terminal.spec.ts`

---

## EPIC-P2-4: Cross-Workspace Context

**Priority**: P1
**Effort**: 4 hours
**Dependencies**: EPIC-P2-1, EPIC-P2-2

**Description**: Verify agent can access context across workspaces.

### Stories

#### P2-16: Verify Project Visible in IDE and Notes

**Priority**: P1
**Effort**: 1 hour
**Type**: Verification

**Description**:
Verify same project accessible in both workspaces.

**Acceptance Criteria**:
- [ ] Create project in IDE
- [ ] Navigate to Notes
- [ ] Same project shown in Notes sidebar
- [ ] Notes belong to correct project
- [ ] Files visible when switching back to IDE

**Test File**: `tests/e2e/cross-workspace/project-visibility.spec.ts`

---

#### P2-17: Verify Agent Can Read Notes Content

**Priority**: P1
**Effort**: 2 hours
**Type**: Verification

**Description**:
Verify agent in IDE can access Notes content via search_notes tool.

**Acceptance Criteria**:
- [ ] Create note in Notes workspace with specific content
- [ ] Switch to IDE workspace
- [ ] Chat: "What are my notes about?"
- [ ] Agent uses search_notes tool
- [ ] Agent summarizes note content

**Test File**: `tests/e2e/cross-workspace/notes-in-ide.spec.ts`

---

#### P2-18: Verify File Changes Sync Across Workspaces

**Priority**: P2
**Effort**: 1 hour
**Type**: Verification

**Description**:
Verify file edits reflect when switching workspaces.

**Acceptance Criteria**:
- [ ] Edit file in IDE
- [ ] Switch to Notes
- [ ] Chat about the file
- [ ] Agent sees updated content
- [ ] Sync happens without manual refresh

**Test File**: `tests/e2e/cross-workspace/file-sync.spec.ts`

---

## Story Dependency Graph

```
                    ┌──────────────────────────────────────────────────────────┐
                    │              PHASE 1 COMPLETE                            │
                    │      (Routes, Settings, Basic CRUD)                      │
                    └─────────────────────────┬────────────────────────────────┘
                                              │
            ┌─────────────────────────────────┼────────────────────────────────┐
            │                                 │                                │
    ┌───────▼───────┐                 ┌──────▼──────┐                  ┌──────▼──────┐
    │  EPIC-P2-1    │                 │ EPIC-P2-2   │                  │ EPIC-P2-3   │
    │ Agent Tools   │                 │ AI Flow     │                  │ Terminal    │
    │  (8h)         │                 │  (6h)       │                  │  (6h)       │
    └───────┬───────┘                 └──────┬──────┘                  └──────┬──────┘
            │                                 │                                │
    ┌───────┼───────┬───────┐        ┌──────┼──────┐               ┌──────────┼────────┐
    │       │       │       │        │      │      │               │          │        │
  P2-01  P2-02  P2-03  P2-04      P2-07  P2-08  P2-09          P2-12    P2-13    P2-14
    │       │       │       │        │      │      │               │          │        │
    │       │       │       │        │      │      │               │          │        │
    └───────┴───────┼───────┘        └──────┴──────┘               └──────────┼────────┘
                    │                       │                                  │
                 P2-05                   P2-10                              P2-15
                    │                       │                                  │
                 P2-06                   P2-11                                 │
                    │                       │                                  │
                    └───────────────────────┼──────────────────────────────────┘
                                            │
                                    ┌──────▼──────┐
                                    │ EPIC-P2-4   │
                                    │Cross-WS Ctx │
                                    │  (4h)       │
                                    └──────┬──────┘
                                           │
                                   ┌───────┼───────┐
                                   │       │       │
                                 P2-16  P2-17  P2-18
                                   │       │       │
                                   └───────┴───────┘
                                           │
                              ┌────────────▼────────────┐
                              │   PHASE 2 GATE VERIFY   │
                              │    (All Journeys Pass)  │
                              └─────────────────────────┘
```

---

## Effort Summary

| Story | Title | Effort | Priority |
|-------|-------|--------|----------|
| P2-01 | Verify read_file | 1h | P0 |
| P2-02 | Verify write_file | 1h | P0 |
| P2-03 | Verify list_files | 1h | P1 |
| P2-04 | Verify execute_command | 2h | P0 |
| P2-05 | Verify search_files | 1h | P1 |
| P2-06 | Agent Tool Test Suite | 2h | P0 |
| P2-07 | API Key Flow | 1h | P0 |
| P2-08 | Notes Slash Commands | 2h | P0 |
| P2-09 | Model Selection | 1h | P1 |
| P2-10 | Workspace Agents | 1h | P1 |
| P2-11 | AI Integration Suite | 1h | P0 |
| P2-12 | WebContainer Boot | 1h | P0 |
| P2-13 | Terminal Commands | 2h | P0 |
| P2-14 | npm/pnpm Commands | 2h | P0 |
| P2-15 | Agentic Terminal | 1h | P1 |
| P2-16 | Project Visibility | 1h | P1 |
| P2-17 | Notes in IDE | 2h | P1 |
| P2-18 | File Sync | 1h | P2 |
| **TOTAL** | | **24h** | |

---

## Phase 2 Gate Criteria

**PHASE 2 PASSES WHEN:**

### User Journey 1: "Build me a Next.js app" ✓
- [ ] Agent creates multiple files via write_file
- [ ] Agent runs npm install via execute_command
- [ ] Files appear in file tree
- [ ] Terminal shows command output

### User Journey 2: "Fix this bug" ✓
- [ ] Agent reads files via read_file
- [ ] Agent searches codebase via search_files
- [ ] Agent proposes fix
- [ ] Agent applies fix via write_file
- [ ] Agent verifies fix via execute_command (tests)

### User Journey 3: "Summarize my notes" ✓
- [ ] Notes AI slash commands work
- [ ] Agent generates coherent summary
- [ ] Model selection affects response

### User Journey 4: "Search my knowledge base" ✓
- [ ] Agent searches files
- [ ] Agent provides answers with file references
- [ ] Cross-workspace context accessible

### No Errors ✓
- [ ] Zero console errors during agentic operations
- [ ] All tests pass in 3 browsers
- [ ] Real API calls successful

---

## Integration Testing Approach

**Resources**: `_bmad/modules/integration-testing/`

```yaml
# Use real API keys (NO MOCKS)
api_keys:
  gemini: "FROM_CONFIG"  # _bmad/modules/integration-testing/config/api-keys-prod.yaml
  openrouter: "FROM_CONFIG"
  
# Use real browsers via Playwright MCP
browsers:
  - chromium
  - firefox
  - webkit
  
# Capture evidence
artifacts:
  - screenshots: every step
  - console_logs: all errors
  - network_logs: API calls
  - video: failed tests
```

---

## Ralph Loop Configuration for Phase 2

```yaml
# .claude/ralph-loop.local.md update
active: true
current_iteration: 1
phase: "phase-2-agentic-verification"
completion_promise: "All 18 P2 stories DONE + 4 User Journeys PASSING"
checkpoint: "STARTING_PHASE_2"

validation_gates:
  - "Agent tools verified with real API"
  - "AI slash commands working"
  - "Terminal executes commands"
  - "Cross-workspace context accessible"
```

---

*Phase 2 Epics generated: 2026-01-09T03:15:00+07:00*
*Workflow: /bmad-bmm-workflows-correct-course*
*Predecessor: Phase 1 Foundation (COMPLETE ✅)*
