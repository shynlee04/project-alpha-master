---
story_key: "P1-05-agent-config-per-workspace"
epic: "EPIC-P1"
story: 5
status: "pending"
created_at: "2026-01-09T19:00:00+07:00"
points: 3
priority: "P1"
depends_on: ["P1-04"]
---

# P1-05: Agent Config per Workspace

## User Story

**As a** User with different needs per workspace
**I want** agents to be configured differently for IDE vs Notes
**So that** the Coding Agent behaves differently from the Notes Agent

## Context

**Key Distinction Required**: "Coding Agent" (IDE) vs "Notes Agent" must be differentiated.

| Aspect | Shared | Different |
|--------|--------|-----------|
| Agent Concept | Same | - |
| Conversation Thread | Same (RAG table) | - |
| System Instructions | - | Different per workspace |
| Toolset | - | Different per workspace |
| User Prompt Space | - | Currently missing |

## Acceptance Criteria

### AC-1: Different System Prompts
**Given** An agent is used in IDE
**When** It generates a response
**Then** It uses IDE-specific system instructions

### AC-2: Different Toolsets
**Given** An agent is used in Notes
**When** Tools are available
**Then** Only Notes-relevant tools are shown (not terminal commands)

### AC-3: Workspace Context Passed
**Given** An agent receives a message
**When** Processing the request
**Then** It knows which workspace it's operating in

### AC-4: User Custom Instructions (Phase 2)
**Given** A user wants to customize agent behavior
**When** They configure the agent
**Then** A space for custom instructions exists (document for P2)

## Tasks

- [ ] T1: Design workspace-aware agent config schema
- [ ] T2: Update agent store to support workspace bindings
- [ ] T3: Create IDE-specific system prompt template
- [ ] T4: Create Notes-specific system prompt template
- [ ] T5: Update tool filtering per workspace

## Dev Notes

### Architectural Dilemma

Both Coding Agent and Notes generation use the **same API vault key and endpoint**.

**Decision Required**: Determine best architectural approach:

| Option | Pros | Cons |
|--------|------|------|
| A: Same key, different prompts | Simple | May confuse users |
| B: Separate configs per workspace | Clean separation | More complexity |
| C: Workspace binding on agent | Flexible | Needs UI work |

**Recommendation**: Option C - Use existing `workspaceBindings` array on Agent entity.

### Files to Modify

| File | Change |
|------|--------|
| `src/core/entities/Agent.ts` | Verify workspaceBindings structure |
| `src/lib/agent/system-prompt.ts` | Add workspace-aware prompt selection |
| `src/lib/agent/tools/` | Add workspace filtering |
