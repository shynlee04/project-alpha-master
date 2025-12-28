---
date: 2025-12-28
time: 16:13:00
phase: Phase 1 (create-story)
team: Team-B
agent_mode: bmad-bmm-sm
---

# Epic 4 Handoff: Smart Agent Tools - Team B

## Handoff Information

**Epic:** Epic 4 - Smart Agent Tools  
**Sprint:** Sprint 4 (Jan 11-14, 2026)  
**Team:** Team B (Backend/Agent Infrastructure)  
**Handoff Date:** 2025-12-28  
**Handoff From:** Scrum Master (bmad-bmm-sm)  
**Handoff To:** Team B (Backend/Agent Infrastructure) - Dev Agent

---

## Epic Overview

**User Outcome:** Users interact with an AI that reliably reads, writes files, and executes commands with clear feedback and error recovery.

**Social Media Appeal:** ⭐⭐⭐⭐ — AI reads project → explains architecture → writes code to disk

**FRs Covered:**
- FR-AGENT-02: Tool Execution (Read/Write)
- FR-AGENT-04: Streaming Response Buffer
- FR-AGENT-05: Tool Error Handling
- FR-ERROR-01: Tool Failure Retry

**Remediation Epics Addressed:**
- R-04: 5-Layer Agent System
- R-10: Tool Permissions Model
- R-14: Multi-Provider Race Condition Handling

**Implementation Notes:**
- Create `src/lib/agent/layers/` structure for 5-layer system
- Implement Layers 1-3 only for Phase 1 (Tool Constitution, Agent Mode, Context Injection)
- Layers 4-5 (Tool Definitions, Output Format) deferred to Phase 2
- Tool trust levels: auto (safe), prompt (requires approval), block (forbidden)
- Retry mechanism: exponential backoff (100ms → 200ms → 400ms)
- Request queue: one tool execution per tool type at a time
- Error classification: transient vs permanent

---

## Story Summary

### Story 4.1: 5-Layer System Prompt Composer (Layers 1-3)

**Story File:** [`_bmad-output/sprint-artifacts/4-1-system-prompt-composer.md`](_bmad-output/sprint-artifacts/4-1-system-prompt-composer.md)

**Status:** drafted  
**Priority:** P0 (Foundation - unblocks all other stories)

**Scope:** Phase 1 implementation - Layers 1-3 only
- Layer 1: Tool Constitution (system role, hidden from UI)
- Layer 2: Agent Mode (user-selectable persona)
- Layer 3: Context Injection (open files + project summary)
- Layers 1+2 cached (recomputed only on config change)
- Layer 3 dynamic (recomputed on file changes)

**Key Blockers:**
- E4-B1: Create `SystemPromptComposer` class in `src/lib/agent/prompt-composer.ts`

**Acceptance Criteria:** 3 ACs with Given/When/Then format

**Tasks:** 8 tasks (4 research + 4 implementation)

**Research Requirements:** MANDATORY section with 4 research tasks using 3 MCP tools

**Dev Notes:** Singleton, Observer, Strategy, Cache patterns documented

**Next Steps:** Phase 2 (create-context) → Phase 3 (development) → Phase 4 (code-review) → Phase 5 (retrospective)

---

### Story 4.3: Tool Permissions & Trust Levels

**Story File:** [`_bmad-output/sprint-artifacts/4-3-tool-permissions-trust-levels.md`](_bmad-output/sprint-artifacts/4-3-tool-permissions-trust-levels.md)

**Status:** drafted  
**Priority:** P1 (Security & Oversight)

**Scope:** Tool permission model with trust levels
- Trust Level `auto`: Tool executes immediately without user approval (safe operations only)
- Trust Level `prompt`: Tool requires user approval before execution (default for write operations)
- Trust Level `block`: Tool execution is prevented entirely (forbidden operations)
- Session-scoped trust: Trust level choices persist only for current session
- Audit trail: All tool executions logged to execution history

**Key Blockers:**
- E4-B3: Create `ToolPermissionManager` class in `src/lib/agent/permissions.ts`
- E4-B5: Add "Trust for session" to UX design

**Acceptance Criteria:** 3 ACs with Given/When/Then format

**Tasks:** 8 tasks (4 research + 4 implementation)

**Research Requirements:** MANDATORY section with 4 research tasks using 3 MCP tools

**Dev Notes:** Singleton, Registry, Validation, Observer patterns documented

**Next Steps:** Phase 2 (create-context) → Phase 3 (development) → Phase 4 (code-review) → Phase 5 (retrospective)

---

### Story 4.4: Tool Error Handling with Retry Logic

**Story File:** [`_bmad-output/sprint-artifacts/4-4-tool-error-handling-retry-logic.md`](_bmad-output/sprint-artifacts/4-4-tool-error-handling-retry-logic.md)

**Status:** drafted  
**Priority:** P1 (Error Recovery & Reliability)

**Scope:** Tool error handling and retry mechanisms
- Automatic retry once for transient errors (FR-AGENT-05)
- User notification with actionable options (Retry, Skip, Report Issue)
- Request queue for concurrent tool execution (per-tool-type queue)
- Error classification: transient vs permanent
- Retry limits: Maximum 3 retry attempts with exponential backoff

**Key Blockers:**
- E4-B4: Create `ToolExecutor` with retry logic in `src/lib/agent/tool-executor.ts`
- E4-D2: Define race condition scope (Resolved: per-tool-type queue)

**Acceptance Criteria:** 3 ACs with Given/When/Then format

**Tasks:** 8 tasks (4 research + 4 implementation)

**Research Requirements:** MANDATORY section with 4 research tasks using 3 MCP tools

**Dev Notes:** Retry pattern, Request queue, Error classification documented

**Next Steps:** Phase 2 (create-context) → Phase 3 (development) → Phase 4 (code-review) → Phase 5 (retrospective)

---

## Development Context for Team B

### Team Identity
**Team:** Team B (Backend/Agent Infrastructure)  
**Execution Rationale:** Consecutive execution of Epic 4 stories to build foundational agent infrastructure

### Current State

**Active Epics:** Epic 4 - Smart Agent Tools (IN_PROGRESS)

**Sprint Status:** Sprint 4 (Jan 11-14, 2026) - Active

**Stories Ready for Development:**
- Story 4.1: 5-Layer System Prompt Composer (drafted) - Foundation for agent configuration
- Story 4.3: Tool Permissions & Trust Levels (drafted) - Security and oversight model
- Story 4.4: Tool Error Handling with Retry Logic (drafted) - Error recovery and reliability

**Story 4.2:** File Tool Execution (read_file, write_file, list_files) - Not created in this handoff
  - **Note:** Story 4.2 is defined in [`epics.md`](_bmad-output/epics.md) (lines 818-846) but was not created as a separate story file
  - **Action Required:** Create Story 4.2 following same Phase 1 workflow before development begins
  - **Reference:** Epic 4 lines 818-846 for Story 4.2 details

---

## Architecture & Design Patterns

### System Prompt Composer Architecture (Story 4.1)
**Pattern:** Singleton pattern for centralized prompt composition  
**Location:** `src/lib/agent/prompt-composer.ts`  
**Layers:**
1. **Tool Constitution** (Layer 1): System role, hidden from UI
2. **Agent Mode** (Layer 2): User-selectable persona
3. **Context Injection** (Layer 3): Open files + project summary (Hybrid Strategy)

**Caching Strategy:**
- Layers 1+2 cached (recomputed only on config change)
- Layer 3 dynamic (recomputed on file changes)

### Tool Permission Manager Architecture (Story 4.3)
**Pattern:** Registry pattern for tool trust levels  
**Location:** `src/lib/agent/permissions.ts`  
**Trust Levels:**
- `auto`: Safe operations execute immediately
- `prompt`: User approval required (default for write operations)
- `block`: Forbidden operations prevented

**Security Features:**
- Session-scoped trust (cleared on page reload)
- Audit trail (timestamp, tool name, agent ID, approval status, result)
- User notification hooks for trust level changes

### Tool Executor Architecture (Story 4.4)
**Pattern:** Singleton with retry and queue management  
**Location:** `src/lib/agent/tool-executor.ts`  
**Features:**
- Retry mechanism with exponential backoff (100ms → 200ms → 400ms)
- Request queue for concurrent execution (per-tool-type serialization)
- Error classification (transient vs permanent)
- User notification hooks (Retry, Skip, Report Issue)

**Retry Limits:**
- Maximum 3 retry attempts
- Exponential backoff prevents API rate limiting

---

## Implementation Sequence

### Phase 1: Foundation (COMPLETE)
**Status:** All stories drafted

**Deliverables:**
- Story 4.1: 5-Layer System Prompt Composer
- Story 4.3: Tool Permissions & Trust Levels
- Story 4.4: Tool Error Handling with Retry Logic

**Note:** Story 4.2 (File Tool Execution) was NOT created - needs to be created before development

---

### Phase 2: Create Context (PENDING)

**Action Required:** Generate context XML files for each story

**For Each Story:**
1. Load story file
2. Conduct research using MCP tools (minimum 3 tools, 5 successful iterations)
3. Synthesize findings into research summary document
4. Generate context XML with:
   - Research findings
   - Code references
   - Implementation recommendations
   - Integration points

**Expected Output:**
- [`4-1-system-prompt-composer-context.xml`](_bmad-output/sprint-artifacts/4-1-system-prompt-composer-context.xml)
- [`4-3-tool-permissions-trust-levels-context.xml`](_bmad-output/sprint-artifacts/4-3-tool-permissions-trust-levels-context.xml)
- [`4-4-tool-error-handling-retry-logic-context.xml`](_bmad-output/sprint-artifacts/4-4-tool-error-handling-retry-logic-context.xml)

---

### Phase 3: Development (PENDING)

**Action Required:** Implement stories based on context XML files

**Implementation Order:**
1. Story 4.1: 5-Layer System Prompt Composer (Foundation)
2. Story 4.3: Tool Permissions & Trust Levels (Security)
3. Story 4.4: Tool Error Handling with Retry Logic (Reliability)
4. Story 4.2: File Tool Execution (must be created first)

**For Each Story:**
1. Create implementation files
2. Write unit tests
3. Integrate with existing codebase
4. Update stores and UI components
5. Validate acceptance criteria

---

### Phase 4: Code Review (PENDING)

**Action Required:** Review implementation against acceptance criteria

**Review Focus:**
- Code quality and patterns
- Error handling completeness
- Test coverage
- Integration with existing architecture

---

### Phase 5: Retrospective (PENDING)

**Action Required:** Generate retrospective after Epic completion

**Trigger:** All stories in Epic 4 reach DONE status

---

## Research Requirements (MANDATORY)

### Per Story Research Protocol

**Story 4.1 Research:**
- [ ] R-4.1.1: Research 5-layer system prompt architectures
  - Query: "AI agent system prompt composition patterns"
  - Tools: Context7, Tavily, Exa (minimum 3, 5 iterations)
  - Output: Research summary document

- [ ] R-4.1.2: Review existing system prompt implementation in codebase
  - Analyze: `src/lib/agent/system-prompt.ts` (if exists)
  - Analyze: `src/lib/agent/` directory structure
  - Tools: Grep, search_files (minimum 3, 5 iterations)
  - Output: Research findings integration

- [ ] R-4.1.3: Research caching strategies for prompt composition
  - Query: "prompt caching strategies JavaScript TypeScript"
  - Tools: Context7, Tavily, Exa (minimum 3, 5 iterations)
  - Output: Caching strategy recommendations

- [ ] R-4.1.4: Research context injection patterns (Hybrid Strategy)
  - Query: "RAG context injection patterns open files project summary"
  - Tools: Context7, Tavily, Exa (minimum 3, 5 iterations)
  - Output: Context injection strategy recommendations

**Story 4.3 Research:**
- [ ] R-4.3.1: Research tool permission models in AI agent systems
  - Query: "AI agent tool permission models security oversight"
  - Tools: Context7, Tavily, Exa (minimum 3, 5 iterations)
  - Output: Permission model patterns and best practices

- [ ] R-4.3.2: Review existing permission handling in codebase
  - Analyze: `src/lib/agent/` for permission patterns
  - Analyze: `src/components/chat/ApprovalOverlay.tsx` for approval UI
  - Tools: Grep, search_files (minimum 3, 5 iterations)
  - Output: Current permission handling patterns and gaps

- [ ] R-4.3.3: Research trust level UX patterns and security best practices
  - Query: "tool trust level UI patterns user approval AI agents"
  - Tools: Context7, Tavily, Exa (minimum 3, 5 iterations)
  - Output: Trust level UX recommendations

**Story 4.4 Research:**
- [ ] R-4.4.1: Research error handling patterns in AI agent systems
  - Query: "AI agent tool error handling retry mechanisms best practices"
  - Tools: Context7, Tavily, Exa (minimum 3, 5 iterations)
  - Output: Error handling patterns and retry strategies

- [ ] R-4.4.2: Review existing error handling in codebase
  - Analyze: `src/lib/utils/error-handling.ts` for error utilities
  - Analyze: `src/components/common/ErrorBoundary.tsx` for error boundary patterns
  - Tools: Grep, search_files (minimum 3, 5 iterations)
  - Output: Current error handling patterns and gaps

- [ ] R-4.4.3: Research retry mechanisms and backoff strategies
  - Query: "exponential backoff retry mechanisms JavaScript TypeScript"
  - Tools: Context7, Tavily, Exa (minimum 3, 5 iterations)
  - Output: Retry mechanism recommendations

- [ ] R-4.4.4: Research request queue patterns for concurrent operations
  - Query: "request queue patterns concurrent operations JavaScript"
  - Tools: Context7, Tavily, Exa (minimum 3, 5 iterations)
  - Output: Queue implementation patterns and best practices

- [ ] R-4.4.5: Review existing tool execution infrastructure
  - Analyze: `src/lib/agent/tools/` for tool execution patterns
  - Analyze: `src/lib/agent/facades/` for facade patterns
  - Tools: Grep, search_files (minimum 3, 5 iterations)
  - Output: Current tool execution patterns and gaps

---

## Dependencies & Integration Points

### Internal Dependencies

**Story 4.1 → Story 4.3:**
- Story 4.1 provides SystemPromptComposer for agent configuration
- Story 4.3 uses ToolPermissionManager for security model
- Both use singleton pattern
- Both integrate with Zustand stores

**Story 4.3 → Story 4.4:**
- Story 4.3 provides ToolPermissionManager for permission checks
- Story 4.4 uses ToolPermissionManager for validation before execution
- Both integrate with ToolExecutor for retry logic

**Story 4.1 → Story 4.4:**
- Story 4.1 provides SystemPromptComposer for context layer
- Story 4.4 uses ToolExecutor for error handling
- SystemPromptComposer provides context for tool error messages

### External Dependencies

**Existing Codebase Components:**
- `src/stores/agents.ts` - Agent state management (Zustand + Dexie)
- `src/lib/agent/providers/` - Provider adapters and model registry
- `src/lib/agent/tools/` - Tool implementations
- `src/components/chat/ApprovalOverlay.tsx` - Approval UI component
- `src/components/chat/AutoApproveSettings.tsx` - Auto-approve settings
- `src/components/agent/AgentConfigDialog.tsx` - Agent configuration UI
- `src/components/ide/statusbar/AgentStatusSegment.tsx` - Status bar component
- `sonner` - Toast notification library (already in project)

**TanStack AI Integration:**
- `@tanstack/ai` - Chat streaming and tool execution
- `@tanstack/ai-react` - React hooks for AI integration

---

## Quality Gates & Validation

### Pre-Development Validation (Phase 2)

**Gate 1: Research Completion**
- [ ] All research tasks completed with minimum 3 MCP tools
- [ ] Minimum 5 successful iterative executions per research task
- [ ] Research summary documents generated for each story

**Gate 2: Context XML Generation**
- [ ] Context XML files created for all 3 stories
- [ ] Each context XML includes research findings, code references, integration points
- [ ] Context XML files follow BMAD metadata standards

### Development Validation (Phase 3)

**Gate 3: Story 4.1 Implementation**
- [ ] `SystemPromptComposer` class created in `src/lib/agent/prompt-composer.ts`
- [ ] Layers 1-3 implemented with caching strategy
- [ ] Integration with agent configuration UI
- [ ] Unit tests written in `src/lib/agent/prompt-composer.test.ts`
- [ ] All acceptance criteria validated

**Gate 4: Story 4.3 Implementation**
- [ ] `ToolPermissionManager` class created in `src/lib/agent/permissions.ts`
- [ ] Trust levels (auto/prompt/block) implemented
- [ ] Integration with approval UI components
- [ ] Unit tests written in `src/lib/agent/permissions.test.ts`
- [ ] All acceptance criteria validated

**Gate 5: Story 4.4 Implementation**
- [ ] `ToolExecutor` class created in `src/lib/agent/tool-executor.ts`
- [ ] Retry mechanism with exponential backoff implemented
- [ ] Request queue for concurrent execution created
- [ ] Error classification utilities created
- [ ] Toast notifications integrated
- [ ] Unit tests written in `src/lib/agent/tool-executor.test.ts`
- [ ] All acceptance criteria validated

**Gate 6: Story 4.2 Implementation (MISSING)**
- [ ] Story 4.2 must be created before development
- [ ] File tool execution logic implemented
- [ ] Integration with tool executor
- [ ] Unit tests written
- [ ] All acceptance criteria validated

### Code Review Validation (Phase 4)

**Gate 7: Code Quality Review**
- [ ] All code reviewed for patterns and best practices
- [ ] Error handling completeness verified
- [ ] Test coverage validated
- [ ] Integration with existing architecture verified

---

## Next Actions for Team B

### Immediate Actions (Pre-Development)

1. **Create Story 4.2** (File Tool Execution)
   - Follow same Phase 1 workflow as Stories 4.1, 4.3, 4.4
   - Extract details from [`epics.md`](_bmad-output/epics.md) lines 818-846
   - Create story file at `_bmad-output/sprint-artifacts/4-2-file-tool-execution.md`
   - Include user story, acceptance criteria, tasks, research requirements, dev notes, references
   - Set status to `drafted`

2. **Phase 2: Create Context** (Research Phase)
   - Generate context XML files for all 4 stories
   - Complete research tasks using MCP tools (minimum 3 tools, 5 iterations)
   - Synthesize findings into research summary documents
   - Create context XML files with research findings, code references, implementation recommendations

3. **Phase 3: Development** (Implementation Phase)
   - Implement all stories based on context XML files
   - Follow implementation order: 4.1 → 4.3 → 4.4 → 4.2
   - Write unit tests for all implementations
   - Integrate with existing codebase components
   - Validate all acceptance criteria

4. **Phase 4: Code Review** (Review Phase)
   - Review all implementations against acceptance criteria
   - Validate code quality and patterns
   - Ensure error handling completeness
   - Verify test coverage

5. **Phase 5: Retrospective** (After Epic Completion)
   - Generate retrospective document for Epic 4
   - Document lessons learned, successes, and improvements
   - Update sprint status to mark Epic 4 as DONE

---

## Success Criteria

**Epic 4 Handoff Complete When:**
- [x] All 3 story files exist at correct paths
- [x] All story files follow Phase 1 (create-story) workflow
- [x] All story files include user story format (As a/I want/So that)
- [x] All story files have at least 3 acceptance criteria with Given/When/Then format
- [x] All story files have tasks section with checkboxes (include research tasks)
- [x] All story files have Research Requirements section populated (MANDATORY)
- [x] All story files have Dev Notes section referencing architecture.md
- [x] All story files have References section with relevant project documents
- [x] All story files have Dev Agent Record section (empty, to be populated)
- [x] All story files have Status section with initial `drafted` status
- [x] All story files have Next Steps section outlining phases 2-5
- [x] This handoff document exists at correct path
- [x] This handoff document includes all 3 stories with context for Team B
- [x] This handoff document includes architecture patterns and design patterns
- [x] This handoff document includes dependencies and integration points
- [x] This handoff document includes quality gates and validation criteria
- [x] This handoff document includes research requirements for all stories
- [x] This handoff document includes next actions for Team B
- [x] This handoff document notes that Story 4.2 was not created and needs to be created before development

---

## References

### Project Planning Documents
- [`_bmad-output/project-planning-artifacts/architecture.md`](_bmad-output/project-planning-artifacts/architecture.md) - System architecture (Arch 6.2)
- [`_bmad-output/project-planning-artifacts/prd.md`](_bmad-output/project-planning-artifacts/prd.md) - Product requirements (FR-AGENT-02, FR-AGENT-05, FR-ERROR-01)
- [`_bmad-output/epics.md`](_bmad-output/epics.md) - Epic and story definitions (lines 767-907)

### Story Files
- [`_bmad-output/sprint-artifacts/4-1-system-prompt-composer.md`](_bmad-output/sprint-artifacts/4-1-system-prompt-composer.md) - Story 4.1
- [`_bmad-output/sprint-artifacts/4-3-tool-permissions-trust-levels.md`](_bmad-output/sprint-artifacts/4-3-tool-permissions-trust-levels.md) - Story 4.3
- [`_bmad-output/sprint-artifacts/4-4-tool-error-handling-retry-logic.md`](_bmad-output/sprint-artifacts/4-4-tool-error-handling-retry-logic.md) - Story 4.4

### Workflow Documents
- [`.agent/workflows/story-dev-cycle.md`](.agent/workflows/story-dev-cycle.md) - Story development cycle workflow

### Technical Stack Documentation
- [`AGENTS.md`](AGENTS.md) - Project-specific dev patterns and BMAD V6 framework

---

## Handoff Metadata

**Handoff From:** Scrum Master (bmad-bmm-sm)  
**Handoff To:** Team B (Backend/Agent Infrastructure) - Dev Agent  
**Date:** 2025-12-28  
**Time:** 16:13:00 UTC  
**Phase:** Phase 1 (create-story) → Phase 2 (create-context) → Phase 3 (development) → Phase 4 (code-review) → Phase 5 (retrospective)

**Mode:** bmad-bmm-sm → bmad-bmm-dev

---

## Notes to Dev Agent

### Critical Reminders

1. **Story 4.2 is Missing:** File Tool Execution story was defined in [`epics.md`](_bmad-output/epics.md) but was NOT created as a separate story file
   - **Action Required:** Create Story 4.2 following same Phase 1 workflow BEFORE starting development
   - **Reference:** Extract details from [`epics.md`](_bmad-output/epics.md) lines 818-846
   - **Priority:** HIGH - This story is foundational for all other stories

2. **Research is MANDATORY:** Per story-dev-cycle.md line 142, all stories MUST complete research tasks before development
   - **Action:** Use minimum 3 MCP tools (Context7, Tavily, Exa) with 5 successful iterative executions
   - **Validation:** Phase 2 (create-context) cannot proceed until research is complete

3. **Follow BMAD V6 Standards:** 
   - Minimum 3 MCP server tools for research
   - Minimum 5 successful iterative executions per research task
   - All documents must include references to research artifacts, URLs, and documentation

4. **Integration Points:**
   - Stories 4.1, 4.3, 4.4 integrate with existing Zustand stores and UI components
   - Use `src/stores/agents.ts` for agent configuration
   - Use `src/components/chat/ApprovalOverlay.tsx` for approval UI
   - Use `sonner` for toast notifications
   - Follow state boundary: Components → Zustand → Dexie (never skip layers)

5. **Testing Requirements:**
   - Write unit tests for all implementations
   - Co-locate tests in `__tests__` directories adjacent to source files
   - Use `vitest` with `jsdom` for React components, `node` for utilities

6. **Code Style & Conventions:**
   - Follow naming conventions: PascalCase components, camelCase utilities
   - Use interfaces for props (not type aliases)
   - Follow import order: React → Third-party → Internal with `@/` alias → Relative

7. **Error Handling:**
   - Use custom error classes from `src/lib/filesystem/sync-types.ts`
   - Implement retry mechanism with exponential backoff
   - Provide user-friendly error messages (no stack traces)
   - Wrap critical components with `ErrorBoundary` from `src/components/common/ErrorBoundary.tsx`

---

## Completion Report to BMAD Master

**Agent:** bmad-bmm-sm (Scrum Master)

**Task Completed:** Epic 4 Handoff for Team B

**Artifacts Created:**
- [`_bmad-output/sprint-artifacts/epic-4-handoff-team-b-2025-12-28.md`](_bmad-output/sprint-artifacts/epic-4-handoff-team-b-2025-12-28.md) - Epic 4 handoff document

**Story Files Referenced:**
- [`_bmad-output/sprint-artifacts/4-1-system-prompt-composer.md`](_bmad-output/sprint-artifacts/4-1-system-prompt-composer.md) - Story 4.1 (drafted)
- [`_bmad-output/sprint-artifacts/4-3-tool-permissions-trust-levels.md`](_bmad-output/sprint-artifacts/4-3-tool-permissions-trust-levels.md) - Story 4.3 (drafted)
- [`_bmad-output/sprint-artifacts/4-4-tool-error-handling-retry-logic.md`](_bmad-output/sprint-artifacts/4-4-tool-error-handling-retry-logic.md) - Story 4.4 (drafted)

**Workflow Status Updates:**
- Epic 4 handoff complete
- Ready for Phase 2 (create-context) for all stories
- Story 4.1, 4.3, 4.4: drafted (ready for development)
- Story 4.2: NOT created (needs to be created before development)

**Next Action:** Switch to Dev mode (bmad-bmm-dev) to begin Phase 2 (create-context) for all stories

**Recommendations:**
1. Create Story 4.2 immediately following same Phase 1 workflow
2. Begin Phase 2 (create-context) research for all stories
3. Ensure all research tasks use minimum 3 MCP tools with 5 successful iterations
4. Generate context XML files with comprehensive research findings
5. Proceed to Phase 3 (development) only after Phase 2 (create-context) is complete for all stories
