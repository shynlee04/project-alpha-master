---
date: 2025-12-28
time: 16:09:00
phase: Phase 1 (create-story)
team: Team-B
agent_mode: bmad-bmm-sm
---

# Story 4.3: Tool Permissions & Trust Levels

## Story Context

**Epic:** Epic 4 - Smart Agent Tools  
**Story ID:** 4.3  
**Story Name:** Tool Permissions & Trust Levels  
**Sprint:** Sprint 4 (Jan 11-14, 2026)  
**Team:** Team B (Backend/Agent Infrastructure)  
**Status:** drafted

---

## User Story

**As a** user,  
**I want** to control which operations the AI can perform automatically,  
**So that** I maintain security and oversight of file changes.

---

## Scope

**Phase 1 Implementation:** Tool Permissions & Trust Levels only

This story implements the tool permission model defined in Architecture 4.4.5:
- **Trust Level `auto`**: Tool executes immediately without user approval (safe operations only)
- **Trust Level `prompt`**: Tool requires user approval before execution (default for write operations)
- **Trust Level `block`**: Tool execution is prevented entirely (forbidden operations)

**Out of Scope (Phase 2):**
- Per-tool trust level persistence across sessions
- Trust level configuration UI in AgentConfigDialog
- Tool execution audit history and reporting

---

## Acceptance Criteria

### AC-1: Auto-Execute Safe Tools

**Given** a tool is configured with trust level `auto`  
**When** the agent requests the tool  
**Then** it executes immediately without user approval  
**And** the execution is logged to `useAgentsStore().toolExecutionHistory` for audit  
**And** status bar shows "Tool executed" notification

### AC-2: Prompt Approval for Write Operations

**Given** a tool is configured with trust level `prompt`  
**When** the agent requests a write operation (write_file, create_file)  
**Then** an approval overlay appears  
**And** user sees tool name, target file, and preview  
**And** "Allow" / "Deny" buttons are clearly visible  
**And** "Trust this tool for this session" checkbox is available

### AC-3: Block Forbidden Operations

**Given** a tool is configured with trust level `block`  
**When** the agent requests the tool  
**Then** execution is prevented  
**And** "Available Tools" indicator in chat updates to show status  
**And** user sees a toast notification: "Tool not permitted"

---

## Blockers

- **E4-B3:** Create `ToolPermissionManager` class in `src/lib/agent/permissions.ts`
  - Manages tool trust levels per agent and per tool
  - Validates tool execution requests against trust configuration
  - Provides `canExecute(toolName, agentId)` method

- **E4-B5:** Add "Trust for session" to UX design
  - Add trust level configuration to AgentConfigDialog
  - Include "Trust this tool for this session" checkbox for `prompt` level
  - Persist trust level choice for current session only

---

## Tasks

### Research Tasks

- [ ] **R-4.3.1:** Research tool permission models in similar AI agent systems
  - Query: "AI agent tool permission models security oversight"
  - Use Context7 MCP: Query AI agent security best practices documentation
  - Use Tavily MCP: Search for AI agent permission implementation patterns 2025
  - Use Exa MCP: Search for AI agent permission UI/UX patterns
  - Minimum 3 MCP server tools used per BMAD V6 standards
  - Validate through 5 successful iterative executions

- [ ] **R-4.3.2:** Review existing agent configuration patterns in codebase
  - Analyze: `src/lib/agent/providers/` directory structure
  - Analyze: `src/stores/agents.ts` for current agent config storage
  - Identify: How tool configuration is currently managed
  - Document: Current state and gaps for tool permission model

- [ ] **R-4.3.3:** Research trust level UX patterns and security best practices
  - Query: "tool trust level UI patterns user approval AI agents"
  - Use Context7 MCP: Query UI/UX documentation for permission controls
  - Use Deepwiki: Query AI agent repository wikis for trust patterns
  - Use Tavily MCP: Search for trust level UI examples 2025
  - Minimum 3 MCP server tools used per BMAD V6 standards
  - Validate through 5 successful iterative executions

- [ ] **R-4.3.4:** Review existing approval UI components for patterns
  - Analyze: `src/components/chat/ApprovalOverlay.tsx`
  - Analyze: `src/components/chat/AutoApproveSettings.tsx`
  - Document: Existing approval patterns and reusable components
  - Identify: Patterns for reusing in tool permission approval flow

### Implementation Tasks

- [ ] **I-4.3.1:** Create `ToolPermissionManager` class
  - File: `src/lib/agent/permissions.ts`
  - Implement `ToolPermissionManager` singleton class
  - Define `TrustLevel` enum: `auto`, `prompt`, `block`
  - Implement `canExecute(toolName, agentId): boolean` method
  - Implement `getTrustLevel(toolName, agentId): TrustLevel` method
  - Implement `setTrustLevel(toolName, agentId, level): void` method
  - Implement `validateExecution(toolName, agentId): {canExecute: boolean, reason?: string}` method
  - Add JSDoc comments for public API documentation

- [ ] **I-4.3.2:** Integrate permission checks into tool execution flow
  - Modify: `src/lib/agent/tools/` tool execution logic
  - Add: Permission check before tool execution
  - Block: `block` level tools from executing entirely
  - Pass: `canExecute` result to tool handler
  - Log: Permission validation results to console for debugging

- [ ] **I-4.3.3:** Add trust level configuration to agent config
  - Modify: `src/stores/agents.ts` to include tool trust levels
  - Define: `toolTrustLevels: Record<string, {toolName: TrustLevel}>` type
  - Implement: `setToolTrustLevel(toolName, level): void` method in store
  - Implement: `getToolTrustLevel(toolName): TrustLevel` method in store
  - Persist: Trust level changes to localStorage (session-scoped)

- [ ] **I-4.3.4:** Update ApprovalOverlay component for trust checkbox
  - Modify: `src/components/chat/ApprovalOverlay.tsx`
  - Add: "Trust this tool for this session" checkbox
  - Add: Trust level indicator in approval UI
  - Implement: Checkbox state management
  - Add: "Trust" vs "Block" visual distinction
  - Wire: Checkbox to `setToolTrustLevel` in agents store

- [ ] **I-4.3.5:** Update AgentConfigDialog for tool trust configuration
  - Modify: `src/components/agent/AgentConfigDialog.tsx`
  - Add: Tool trust level configuration section
  - Implement: Per-tool trust level selector (dropdown or radio buttons)
  - Implement: "Set as default" option for each tool
  - Wire: Trust level changes to agents store
  - Add: Validation for trust level configuration (at least one tool must be `prompt` or `auto`)

- [ ] **I-4.3.6:** Add tool execution history tracking
  - Modify: `src/stores/agents.ts` to include execution history
  - Define: `ToolExecutionHistory: {timestamp: string, toolName: string, agentId: string, approved: boolean, result: 'success' | 'error'}`
  - Implement: `logToolExecution(toolName, agentId, approved, result): void` method
  - Implement: `getToolExecutionHistory(agentId): ToolExecutionHistory[]` method
  - Display: Execution history in AgentConfigDialog for audit trail

- [ ] **I-4.3.7:** Implement status bar indicator for tool availability
  - Modify: `src/components/ide/statusbar/AgentStatusSegment.tsx`
  - Add: Tool trust level status indicator
  - Implement: Visual distinction for auto/prompt/block tools
  - Wire: Status updates from ToolPermissionManager events

- [ ] **I-4.3.8:** Add toast notifications for permission events
  - Implement: Toast notification when tool is blocked
  - Implement: Toast notification when trust level changes
  - Use: `sonner` toast library (already in project)
  - Add: "Tool blocked" message with tool name
  - Add: "Trust level updated" message for configuration changes

### Documentation Tasks

- [ ] **D-4.3.1:** Update AGENTS.md with tool permission patterns
  - Document: Tool permission model implementation
  - Document: Trust level enum and usage patterns
  - Document: Permission check integration points
  - Add: Code examples for ToolPermissionManager usage
  - Add: Best practices for tool security and user oversight

- [ ] **D-4.3.2:** Create JSDoc comments for ToolPermissionManager
  - Document: `ToolPermissionManager` class with JSDoc
  - Add: Method documentation with examples
  - Add: TrustLevel enum documentation
  - Add: Permission validation logic documentation

- [ ] **D-4.3.3:** Update architecture.md with tool permission model
  - Document: Tool permission model in architecture section
  - Add: Security and oversight architecture
  - Document: Trust level configuration flow
  - Reference: Arch 4.4.5 (Tool trust levels: auto, prompt, block)

---

## Dev Notes

### Architecture Patterns

**Tool Permission Manager Pattern:**
- Singleton pattern for centralized permission management
- Registry pattern for tool trust level configuration
- Validation gate pattern before tool execution
- Observer pattern for permission change notifications

**Trust Level Hierarchy:**
```
auto (safe) > prompt (requires approval) > block (forbidden)
```

**Permission Check Flow:**
```
Tool Execution Request → ToolPermissionManager.canExecute() → Validation → Allow/Block → Tool Handler
```

**Integration Points:**
- ToolPermissionManager integrates with ToolExecutor (Story 4.4)
- ApprovalOverlay (Story 2.3) shows trust checkbox
- AgentsStore persists trust level configuration
- AgentStatusSegment displays tool availability status

### Security Considerations

**Session-Scoped Trust:**
- Trust level choices persist only for current session
- Cleared on page reload or session expiration
- Prevents accidental trust elevation across sessions

**Audit Trail:**
- All tool executions logged to execution history
- Timestamp, tool name, agent ID, approval status, result
- Enables post-incident analysis and debugging

### Code References

**Existing Code:**
- `src/lib/agent/` - Agent infrastructure directory
- `src/components/chat/ApprovalOverlay.tsx` - Approval UI component
- `src/components/agent/AgentConfigDialog.tsx` - Agent configuration UI
- `src/stores/agents.ts` - Agent state management
- `src/components/ide/statusbar/AgentStatusSegment.tsx` - Status bar component

**New Files to Create:**
- `src/lib/agent/permissions.ts` - ToolPermissionManager class
- `src/stores/agents.ts` - Updated with tool trust levels and execution history
- `src/components/chat/ApprovalOverlay.tsx` - Updated with trust checkbox
- `src/components/agent/AgentConfigDialog.tsx` - Updated with trust level configuration

---

## Research Requirements

**MANDATORY per story-dev-cycle.md line 142:** Research requirements must be completed before development.

### Research Questions

1. **Tool Permission Models:** What are the standard patterns for AI agent tool permission systems?
2. **Trust Level UX:** How should trust levels be presented in the UI for optimal user experience?
3. **Security Best Practices:** What are the security considerations for auto-executing tools vs user-approved tools?
4. **Audit Trail:** How should tool execution history be structured for debugging and compliance?

### Required MCP Research (Minimum 3 tools)

1. **Context7 MCP:** Query official documentation for:
   - AI agent security best practices
   - Tool permission management patterns
   - User approval UI/UX patterns

2. **Tavily MCP:** Search for:
   - AI agent permission implementation examples 2025
   - Trust level UI patterns for AI tools
   - Tool execution audit trail patterns

3. **Deepwiki MCP:** Query AI agent repository wikis for:
   - Tool permission architecture patterns
   - Security and oversight best practices

### Validation Criteria (5 successful iterative executions)

- [ ] Research iteration 1: Context7 query returns relevant documentation
- [ ] Research iteration 2: Tavily search returns implementation examples
- [ ] Research iteration 3: Deepwiki query returns architecture patterns
- [ ] Research iteration 4: Cross-reference findings from all sources
- [ ] Research iteration 5: Synthesize findings into research summary document

### Expected Research Artifacts

- `_bmad-output/research/4-3-tool-permissions-research-2025-12-28.md` - Research summary document
- Include: Tool permission model patterns
- Include: Trust level UX best practices
- Include: Security considerations
- Include: Code examples from similar projects
- Include: Implementation recommendations

---

## References

### Project Planning Documents

- `_bmad-output/project-planning-artifacts/architecture.md` - System architecture (Arch 4.4.5)
- `_bmad-output/project-planning-artifacts/prd.md` - Product requirements (FR-AGENT-02, FR-AGENT-05)
- `_bmad-output/epics.md` - Epic and story definitions (lines 848-876)

### Architecture Documentation

- **Arch 4.4.5:** Tool trust levels: `auto` (safe), `prompt` (requires approval), `block` (forbidden)
- **Arch 6.2:** State boundary: Components → Zustand → Dexie (never skip layers)

### Related Stories

- **Story 4.1:** 5-Layer System Prompt Composer (Layers 1-3) - Foundation for agent configuration
- **Story 4.2:** File Tool Execution (read_file, write_file, list_files) - Tool execution infrastructure
- **Story 4.4:** Tool Error Handling with Retry Logic - Error recovery and retry mechanisms

### Technical Stack

- **State Management:** Zustand stores for agent configuration
- **UI Components:** Radix UI components (Dialog, Checkbox, Select)
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
| drafted | 2025-12-28 | 16:09:00 UTC | Story created following story-dev-cycle.md Phase 1 (create-story) workflow |

---

## Next Steps

1. **Phase 2 (create-context):** Generate context XML file with research findings
   - Load: @/sm (continue)
   - Execute: Create Context XML
   - Input: Story file path (`_bmad-output/sprint-artifacts/4-3-tool-permissions-trust-levels.md`)
   - Output: `_bmad-output/sprint-artifacts/4-3-tool-permissions-trust-levels-context.xml`

2. **Phase 3 (development):** Implement tool permission system
   - Load: @/dev (continue)
   - Execute: Development workflow
   - Input: Context XML file
   - Output: Code implementation in `src/lib/agent/permissions.ts`, store updates, UI components

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

**Demo Checkpoint:** 🔒 Tool approval workflow demonstration

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
