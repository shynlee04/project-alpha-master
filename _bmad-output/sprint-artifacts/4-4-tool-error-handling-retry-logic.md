---
date: 2025-12-28
time: 16:11:00
phase: Phase 1 (create-story)
team: Team-B
agent_mode: bmad-bmm-sm
---

# Story 4.4: Tool Error Handling with Retry Logic

## Story Context

**Epic:** Epic 4 - Smart Agent Tools  
**Story ID:** 4.4  
**Story Name:** Tool Error Handling with Retry Logic  
**Sprint:** Sprint 4 (Jan 11-14, 2026)  
**Team:** Team B (Backend/Agent Infrastructure)  
**Status:** drafted

---

## User Story

**As a** user,  
**I want** agent to handle tool failures gracefully,  
**So that** I'm not blocked by transient errors.

---

## Scope

**Phase 1 Implementation:** Tool Error Handling with Retry Logic only

This story implements error handling and retry mechanisms defined in FR-AGENT-05:
- Automatic retry once for transient errors
- User notification with actionable options (Retry, Skip, Report Issue)
- Request queue for concurrent tool execution (per-tool-type queue)
- Error classification (transient vs permanent)

**Out of Scope (Phase 2):**
- Detailed error analytics and reporting dashboard
- Per-tool retry configuration (customizable retry counts)
- Error recovery strategies for specific error types

---

## Acceptance Criteria

### AC-1: Automatic Retry for Transient Errors

**Given** a tool execution fails (e.g., file locked)  
**When** it's a transient error  
**Then** system retries once automatically (FR-AGENT-05)  
**And** status bar shows "Retrying... (1s)"  
**And** retry uses exponential backoff (100ms → 200ms → 400ms)

### AC-2: User Notification on Persistent Errors

**Given** a tool fails after retry  
**When** error persists  
**Then** a toast notification appears with error details  
**And** "Retry", "Skip", and "Report Issue" buttons are available  
**And** error message is user-friendly (no stack traces, actionable description)

### AC-3: Request Queue for Concurrent Execution

**Given** multiple providers configured (R-14)  
**When** Race Condition (concurrent writes to same file) could occur  
**Then** request queue ensures **one tool execution per tool type at a time** (Decision 5)  
**And** no concurrent writes allowed  
**And** queue prioritizes operations based on tool type (read > write > execute)

---

## Blockers

- **E4-B4:** Create `ToolExecutor` with retry logic
  - File: `src/lib/agent/tool-executor.ts`
  - Implements retry mechanism with exponential backoff
  - Implements request queue for concurrent execution
  - Classifies errors (transient vs permanent)
  - Provides user notification hooks

- **E4-D2:** Define race condition scope (Resolved: per-tool-type queue)
  - Document: Request queue architecture in architecture.md
  - Document: Tool type prioritization strategy
  - Document: Queue implementation patterns

---

## Tasks

### Research Tasks

- [ ] **R-4.4.1:** Research error handling patterns in AI agent systems
  - Query: "AI agent tool error handling retry mechanisms best practices"
  - Use Context7 MCP: Query AI agent error handling documentation
  - Use Tavily MCP: Search for error retry patterns 2025
  - Use Exa MCP: Search for AI agent error handling examples
  - Minimum 3 MCP server tools used per BMAD V6 standards
  - Validate through 5 successful iterative executions

- [ ] **R-4.4.2:** Review existing error handling in codebase
  - Analyze: `src/lib/utils/error-handling.ts` for error utilities
  - Analyze: `src/components/common/ErrorBoundary.tsx` for error boundary patterns
  - Analyze: `src/lib/filesystem/sync-types.ts` for error classes
  - Document: Current error handling patterns and gaps
  - Identify: Patterns for reusing in tool error handling

- [ ] **R-4.4.3:** Research retry mechanisms and backoff strategies
  - Query: "exponential backoff retry mechanisms JavaScript TypeScript"
  - Use Context7 MCP: Query retry pattern documentation
  - Use Tavily MCP: Search for retry implementation examples 2025
  - Use Deepwiki: Query AI agent repository wikis for retry patterns
  - Minimum 3 MCP server tools used per BMAD V6 standards
  - Validate through 5 successful iterative executions

- [ ] **R-4.4.4:** Research request queue patterns for concurrent operations
  - Query: "request queue patterns concurrent operations JavaScript"
  - Use Context7 MCP: Query queue implementation documentation
  - Use Tavily MCP: Search for queue implementation examples 2025
  - Use Exa MCP: Search for request queue patterns
  - Minimum 3 MCP server tools used per BMAD V6 standards
  - Validate through 5 successful iterative executions

- [ ] **R-4.4.5:** Review existing tool execution infrastructure
  - Analyze: `src/lib/agent/tools/` for tool execution patterns
  - Analyze: `src/lib/agent/facades/` for facade patterns
  - Document: Current concurrency handling and gaps
  - Identify: Integration points for ToolExecutor

### Implementation Tasks

- [ ] **I-4.4.1:** Create `ToolExecutor` class
  - File: `src/lib/agent/tool-executor.ts`
  - Implement `ToolExecutor` singleton class
  - Define `RetryConfig` interface: {maxRetries: number, backoffMs: number}
  - Implement `executeTool(toolName, params, config): Promise<ToolResult>` method
  - Implement `retryWithBackoff(toolFn, config): Promise<ToolResult>` method
  - Implement `classifyError(error): {isTransient: boolean, type: string}` method
  - Implement exponential backoff: 100ms → 200ms → 400ms
  - Add JSDoc comments for public API documentation

- [ ] **I-4.4.2:** Create request queue for concurrent tool execution
  - File: `src/lib/agent/request-queue.ts`
  - Implement `RequestQueue` class
  - Define `ToolType` enum: `read`, `write`, `execute`
  - Implement `enqueue(toolName, params, priority): Promise<ToolResult>` method
  - Implement `dequeue(): Promise<ToolResult>` method
  - Implement queue prioritization: read > write > execute
  - Ensure one tool execution per tool type at a time
  - Add JSDoc comments for public API documentation

- [ ] **I-4.4.3:** Integrate retry logic into tool execution flow
  - Modify: `src/lib/agent/tools/` tool execution logic
  - Add: Retry wrapper around tool handlers
  - Add: Error classification before retry
  - Add: User notification hooks on persistent errors
  - Pass: Retry config to tool executor
  - Log: Retry attempts and results to console for debugging

- [ ] **I-4.4.4:** Create error classification utilities
  - File: `src/lib/agent/error-classifier.ts`
  - Define `ErrorType` enum: `transient`, `permanent`, `permission`, `network`
  - Implement `classifyError(error): ErrorType` method
  - Define: Transient error patterns (file locked, timeout, rate limit)
  - Define: Permanent error patterns (not found, access denied, invalid)
  - Add JSDoc comments for public API documentation

- [ ] **I-4.4.5:** Add toast notification for tool errors
  - Implement: Toast notification using `sonner` library
  - Add: "Retry" button with retry action
  - Add: "Skip" button to continue without tool result
  - Add: "Report Issue" button to open issue tracker
  - Implement: User-friendly error messages (no stack traces)
  - Wire: Toast notifications to ToolExecutor error hooks

- [ ] **I-4.4.6:** Update status bar for retry progress
  - Modify: `src/components/ide/statusbar/AgentStatusSegment.tsx`
  - Add: Retry progress indicator
  - Implement: "Retrying... (Xs)" message display
  - Wire: Status updates from ToolExecutor events
  - Add: Visual distinction for retry vs normal status

- [ ] **I-4.4.7:** Add tool execution history with retry tracking
  - Modify: `src/stores/agents.ts` to include retry tracking
  - Define `ToolExecutionHistory` type: {timestamp: string, toolName: string, agentId: string, approved: boolean, result: 'success' | 'error', retryCount: number}
  - Implement: `logToolExecutionWithRetry(toolName, agentId, approved, result, retryCount): void` method
  - Implement: `getToolExecutionHistory(agentId): ToolExecutionHistory[]` method
  - Display: Execution history with retry count in AgentConfigDialog
  - Add: Retry success rate metrics

- [ ] **I-4.4.8:** Write unit tests for retry logic
  - File: `src/lib/agent/tool-executor.test.ts`
  - Test: Retry mechanism with exponential backoff
  - Test: Error classification (transient vs permanent)
  - Test: Request queue prioritization
  - Test: Concurrent execution prevention
  - Test: User notification hooks
  - Test: Retry count tracking in execution history

### Documentation Tasks

- [ ] **D-4.4.1:** Update AGENTS.md with error handling patterns
  - Document: Tool error handling and retry mechanisms
  - Document: Error classification patterns
  - Document: Request queue architecture
  - Document: Retry configuration options
  - Add: Code examples for ToolExecutor usage
  - Add: Best practices for error recovery and user experience

- [ ] **D-4.4.2:** Create JSDoc comments for ToolExecutor
  - Document: `ToolExecutor` class with JSDoc
  - Add: Method documentation with examples
  - Add: RetryConfig interface documentation
  - Add: Error classification documentation
  - Add: Request queue documentation

- [ ] **D-4.4.3:** Update architecture.md with error handling model
  - Document: Error handling and retry architecture
  - Document: Request queue for concurrent execution
  - Document: Error classification strategy
  - Document: Retry backoff mechanism
  - Reference: FR-AGENT-05 (Tool Error Handling)
  - Reference: Arch 6.2 (State boundary: Components → Zustand → Dexie)

---

## Dev Notes

### Architecture Patterns

**Tool Executor Pattern:**
- Singleton pattern for centralized tool execution
- Retry pattern with exponential backoff
- Error classification pattern (transient vs permanent)
- Observer pattern for retry progress notifications
- Queue pattern for concurrent execution control

**Retry Strategy:**
```
Initial attempt (0ms) → Retry 1 (100ms) → Retry 2 (200ms) → Retry 3 (400ms)
```

**Request Queue Strategy:**
```
Priority: Read (high) > Write (medium) > Execute (low)
One execution per tool type at a time
Queue enforces serialization for same tool type
```

**Error Classification:**
- **Transient:** File locked, timeout, rate limit (retry once)
- **Permanent:** Not found, access denied, invalid (no retry)
- **Permission:** Permission denied (no retry, user action required)
- **Network:** Network errors (retry with backoff)

### Integration Points

- ToolExecutor integrates with ToolPermissionManager (Story 4.3)
- RequestQueue integrates with ToolExecutor for serialization
- Status bar displays retry progress from ToolExecutor events
- Toast notifications use sonner library (already in project)
- AgentsStore tracks execution history with retry counts

### Security Considerations

**Retry Limits:**
- Maximum 3 retry attempts to prevent infinite loops
- Exponential backoff prevents API rate limiting
- User can skip retry if desired

**Concurrent Execution Prevention:**
- Request queue ensures one tool execution per tool type
- Prevents race conditions (R-14: Multi-Provider Race Condition Handling)
- Queue prioritization ensures critical operations complete first

**Audit Trail:**
- All tool executions logged to execution history
- Timestamp, tool name, agent ID, approval status, result, retry count
- Enables post-incident analysis and debugging

### Code References

**Existing Code:**
- `src/lib/agent/` - Agent infrastructure directory
- `src/lib/agent/tools/` - Tool execution directory
- `src/lib/agent/facades/` - Tool facade directory
- `src/components/chat/ApprovalOverlay.tsx` - Approval UI component
- `src/components/agent/AgentConfigDialog.tsx` - Agent configuration UI
- `src/stores/agents.ts` - Agent state management
- `src/components/ide/statusbar/AgentStatusSegment.tsx` - Status bar component
- `src/lib/utils/error-handling.ts` - Error handling utilities

**New Files to Create:**
- `src/lib/agent/tool-executor.ts` - ToolExecutor class with retry logic
- `src/lib/agent/request-queue.ts` - RequestQueue class for concurrent execution
- `src/lib/agent/error-classifier.ts` - Error classification utilities
- `src/stores/agents.ts` - Updated with retry tracking in execution history
- `src/components/ide/statusbar/AgentStatusSegment.tsx` - Updated with retry progress

---

## Research Requirements

**MANDATORY per story-dev-cycle.md line 142:** Research requirements must be completed before development.

### Research Questions

1. **Error Handling Patterns:** What are standard patterns for AI agent tool error handling and retry mechanisms?
2. **Retry Strategies:** What are best practices for exponential backoff and retry limits?
3. **Request Queues:** How should request queues be implemented for concurrent tool execution?
4. **Error Classification:** How should errors be classified (transient vs permanent) for retry decisions?
5. **User Experience:** How should users be notified about tool errors and retry attempts?

### Required MCP Research (Minimum 3 tools)

1. **Context7 MCP:** Query official documentation for:
   - AI agent error handling best practices
   - Retry mechanisms and backoff strategies
   - Error classification patterns
   - Request queue implementation patterns

2. **Tavily MCP:** Search for:
   - AI agent error handling retry examples 2025
   - Exponential backoff implementation patterns
   - Request queue patterns for concurrent operations

3. **Deepwiki MCP:** Query AI agent repository wikis for:
   - Tool error handling architecture patterns
   - Retry mechanism implementations
   - Concurrent execution prevention strategies

### Validation Criteria (5 successful iterative executions)

- [ ] Research iteration 1: Context7 query returns relevant documentation
- [ ] Research iteration 2: Tavily search returns implementation examples
- [ ] Research iteration 3: Deepwiki query returns architecture patterns
- [ ] Research iteration 4: Cross-reference findings from all sources
- [ ] Research iteration 5: Synthesize findings into research summary document

### Expected Research Artifacts

- `_bmad-output/research/4-4-error-handling-retry-research-2025-12-28.md` - Research summary document
- Include: Error handling patterns and best practices
- Include: Retry mechanisms and backoff strategies
- Include: Request queue implementation patterns
- Include: Error classification strategies
- Include: Code examples from similar projects
- Include: Implementation recommendations

---

## References

### Project Planning Documents

- `_bmad-output/project-planning-artifacts/architecture.md` - System architecture (Arch 6.2)
- `_bmad-output/project-planning-artifacts/prd.md` - Product requirements (FR-AGENT-05, FR-ERROR-01)
- `_bmad-output/epics.md` - Epic and story definitions (lines 879-907)

### Architecture Documentation

- **Arch 6.2:** State boundary: Components → Zustand → Dexie (never skip layers)
- **Arch 6.3:** Error handling architecture with custom error classes

### Related Stories

- **Story 4.1:** 5-Layer System Prompt Composer (Layers 1-3) - Foundation for agent configuration
- **Story 4.2:** File Tool Execution (read_file, write_file, list_files) - Tool execution infrastructure
- **Story 4.3:** Tool Permissions & Trust Levels - Permission model and trust levels

### Technical Stack

- **State Management:** Zustand stores for agent configuration
- **UI Components:** Radix UI components (Dialog, Button)
- **Notifications:** Sonner toast library

---

## Dev Agent Record

**Assigned Agent:** TBD (to be assigned during development phase)

**Agent Notes:** 
- Research findings to be populated during Phase 2 (create-context)
- Implementation decisions to be documented during Phase 3 (development)
- Code review feedback to be recorded during Phase 4 (code-review)

**Handoffs:**
- None yet - awaiting Phase 2 (create-context) completion

---

## Status

| Status | Date | Time | Notes |
|---------|------|------|-------|
| drafted | 2025-12-28 | 16:11:00 UTC | Story created following story-dev-cycle.md Phase 1 (create-story) workflow |

---

## Next Steps

1. **Phase 2 (create-context):** Generate context XML file with research findings
   - Load: @/sm (continue)
   - Execute: Create Context XML
   - Input: Story file path (`_bmad-output/sprint-artifacts/4-4-tool-error-handling-retry-logic.md`)
   - Output: `_bmad-output/sprint-artifacts/4-4-tool-error-handling-retry-logic-context.xml`

2. **Phase 3 (development):** Implement tool error handling system
   - Load: @/dev (continue)
   - Execute: Development workflow
   - Input: Context XML file
   - Output: Code implementation in `src/lib/agent/tool-executor.ts`, request queue, error classifier

3. **Phase 4 (code-review):** Review implementation
   - Load: @/code-reviewer (continue)
   - Execute: Code review workflow
   - Input: Story file and implementation code
   - Output: Code review feedback and approval

4. **Phase 5 (retrospective):** Generate retrospective (if applicable)
   - Load: @/sm (continue)
   - Execute: Retrospective workflow
   - Output: `_bmad-output/sprint-artifacts/epic-4-retrospective.md`

---

**Demo Checkpoint:** 🛡️ Error recovery demo (file locked → retry → success)

**Success Criteria:**
- [x] Story file exists at correct path
- [x] User story format complete (As a/I want/So that)
- [x] At least 3 acceptance criteria defined with Given/When/Then format
- [x] Tasks section with checkboxes (include research tasks)
- [x] Research Requirements section populated (MANDATORY per story-dev-cycle.md line 142)
- [x] Dev Notes references architecture.md
- [x] References section includes relevant project documents
- [x] Dev Agent Record section created (empty, to be populated)
- [x] Status set to `drafted`
