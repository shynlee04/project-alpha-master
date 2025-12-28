---
date: 2025-12-28
time: 16:05:00
phase: create-story
team: Team-B
agent_mode: bmad-bmm-sm
---

# Story 4.1: 5-Layer System Prompt Composer (Layers 1-3)

## Story Context

**Epic:** Epic 4 - Smart Agent Tools  
**Story:** 4.1 - 5-Layer System Prompt Composer  
**Sprint:** Sprint 1  
**Team:** Team B (Backend/Agent Infrastructure)  
**Status:** drafted  
**Created:** 2025-12-28T16:05:00Z

## User Story

**As a** developer,  
**I want** a composable 5-layer system prompt architecture so that agent behavior can be dynamically configured without hardcoding,  
**So that** agent behavior is consistent and maintainable.

## Scope

**Phase 1 Implementation:** Implement Layers 1-3 only

- **Layer 1:** Tool Constitution (system role, hidden from user)
- **Layer 2:** Agent Mode (user-selectable persona)
- **Layer 3:** Context Injection (Hybrid Strategy: open files + project summary)

**Phase 2 (Deferred):** Layers 4-5 (Tool Definitions, Output Format)

## Blockers

- **E4-B1:** Create `SystemPromptComposer` class (`src/lib/agent/prompt-composer.ts`)

## Acceptance Criteria

### AC-1: Layer Composition Order

**Given** an agent is configured  
**When** a conversation starts  
**Then** system prompt is composed from:
  - Layer 1: Tool Constitution (sent as `system` role message, hidden from UI)
  - Layer 2: Agent Mode (user-selectable persona)
  - Layer 3: Context Injection (Hybrid Strategy: open files + project summary) (Decision 4)

### AC-2: Layer Caching Strategy

**Given** a layer is registered  
**When** it's included in composition  
**Then** layers are ordered by priority (1 → 2 → 3)  
**And** Layers 1+2 are cached (recomputed only on config change)

### AC-3: Context Injection Strategy

**Given** Layer 3 context changes (file opened/closed)  
**When** a new message is sent  
**Then** context includes:
  - Open files (max 10)
  - Active file
  - Project package.json summary

## Tasks

### Research Tasks
- [ ] Research TanStack AI system message composition patterns
- [ ] Research caching strategies for prompt layers
- [ ] Research context injection best practices for AI agents
- [ ] Review existing agent system prompt implementation in codebase

### Implementation Tasks
- [ ] Create `SystemPromptComposer` class in `src/lib/agent/prompt-composer.ts`
- [ ] Define Layer interface and Layer types (ToolConstitution, AgentMode, ContextInjection)
- [ ] Implement layer registration system with priority ordering
- [ ] Implement caching mechanism for Layers 1+2
- [ ] Implement dynamic recomputation for Layer 3 on file changes
- [ ] Implement `compose()` method to build system prompt from layers
- [ ] Add unit tests for layer composition
- [ ] Add unit tests for caching behavior
- [ ] Add unit tests for context injection updates
- [ ] Integrate `SystemPromptComposer` into agent initialization flow
- [ ] Add dev tools to inspect composed system prompt (demo checkpoint)

### Documentation Tasks
- [ ] Document layer composition architecture in AGENTS.md
- [ ] Add TypeScript JSDoc comments for `SystemPromptComposer` API
- [ ] Update agent development patterns with layer usage examples

## Dev Notes

### Architecture Patterns

Reference: `_bmad-output/project-planning-artifacts/architecture.md`

The `SystemPromptComposer` should follow these architectural patterns:

1. **Singleton Pattern:** Only one instance per agent configuration
2. **Observer Pattern:** Listen to file system events for Layer 3 updates
3. **Strategy Pattern:** Different layer types implement common interface
4. **Cache Pattern:** Memoize Layers 1+2 until config changes

### Layer Composition Strategy

```
System Prompt = Layer 1 (Tool Constitution)
             + Layer 2 (Agent Mode)
             + Layer 3 (Context Injection)

Order: 1 → 2 → 3 (priority-based)
Cache: Layers 1+2 (recomputed on config change only)
Dynamic: Layer 3 (recomputed on every file change)
```

### Caching Implementation

- Use `WeakMap` for caching layer compositions
- Cache key: `{layerType}_{configHash}`
- Invalidate cache on:
  - Agent mode change
  - Tool constitution change
  - Provider configuration change

### Context Injection Details

**Hybrid Strategy (Decision 4):**
- Open files: Maximum 10 most recent files
- Active file: Currently focused file in editor
- Project summary: Parsed from `package.json` (name, version, dependencies)

### Integration Points

- **Agent Initialization:** Call `SystemPromptComposer.compose()` before first message
- **File System Events:** Subscribe to workspace events for Layer 3 updates
- **Config Changes:** Invalidate cache on agent configuration updates

## Research Requirements

### Required Research (MCP Tools)

Per story-dev-cycle.md line 142, this section is MANDATORY before development begins.

#### TanStack AI System Messages
- **Tool:** Context7 MCP
- **Query:** TanStack AI system message composition, chat streaming API
- **Purpose:** Understand how to structure system messages for different roles
- **Expected Findings:**
  - System message format and structure
  - Role-based message composition
  - Streaming response handling

#### Caching Strategies for Prompts
- **Tool:** Tavily/Exa MCP
- **Query:** AI agent prompt caching strategies 2025, memoization best practices
- **Purpose:** Research optimal caching strategies for prompt layers
- **Expected Findings:**
  - Cache invalidation patterns
  - Performance optimization techniques
  - Memory management for cached prompts

#### Context Injection Patterns
- **Tool:** DeepWiki MCP
- **Query:** TanStack AI context injection, RAG prompt patterns
- **Purpose:** Learn best practices for injecting context into system prompts
- **Expected Findings:**
  - Context window management
  - File content summarization
  - Project metadata integration

#### Existing Implementation Review
- **Tool:** Repomix MCP
- **Query:** System prompt patterns in src/lib/agent/
- **Purpose:** Review current agent system prompt implementation
- **Expected Findings:**
  - Existing prompt construction code
  - Integration points with chat API
  - Opportunities for refactoring

#### Agent Mode Patterns
- **Tool:** Tavily MCP
- **Query:** AI agent persona system prompts, role-based agents 2025
- **Purpose:** Research agent mode/persona implementation patterns
- **Expected Findings:**
  - Persona definition structures
  - Role switching mechanisms
  - Multi-mode agent architectures

### Research Execution Protocol

1. **Step 1:** Query Context7 for TanStack AI system message API
2. **Step 2:** Query Tavily for caching strategies
3. **Step 3:** Query DeepWiki for TanStack AI context patterns
4. **Step 4:** Use Repomix to analyze existing codebase implementation
5. **Step 5:** Query Tavily for agent mode patterns
6. **Step 6:** Document all findings in Dev Agent Record during development

### Validation Criteria

Research is complete when:
- [ ] TanStack AI system message format documented
- [ ] Caching strategy selected and justified
- [ ] Context injection pattern defined
- [ ] Existing implementation reviewed
- [ ] Agent mode pattern researched
- [ ] All findings documented with sources

## References

### Project Documents
- `_bmad-output/epics.md` - Epic 4 definition and story details
- `_bmad-output/project-planning-artifacts/architecture.md` - System architecture patterns
- `_bmad-output/project-planning-artifacts/prd.md` - Product requirements
- `_bmad-output/project-planning-artifacts/parallel-development-dual-agents-mode.md` - Team B responsibilities

### Technical Documentation
- `AGENTS.md` - Agent development patterns and conventions
- `src/lib/agent/system-prompt.ts` - Existing system prompt implementation
- `src/lib/agent/factory.ts` - Agent factory pattern

### External Resources
- TanStack AI Documentation: https://tanstack.com/ai
- WebContainer API: https://developer.stackblitz.com/platform/api/webcontainer-api

### Related Stories
- Story 2.0: Credential Vault (completed) - Provider configuration foundation
- Story 4.3: Tool Permissions & Trust Levels (upcoming) - Depends on SystemPromptComposer
- Story 4.4: Tool Error Handling with Retry Logic (upcoming) - Error handling foundation

## Dev Agent Record

*This section will be populated during development phase*

**Agent:** {model_name}  
**Session:** {timestamp}  

#### Task Progress:
*Tasks will be marked complete during development*

#### Research Executed:
*Research findings will be documented here*

#### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| *To be populated* | | |

#### Tests Created:
*Test files will be listed here*

#### Decisions Made:
*Architectural decisions will be documented here*

## Status History

| Status | Date | Agent | Notes |
|--------|--------|--------|--------|
| drafted | 2025-12-28T16:05:00Z | bmad-bmm-sm | Initial story creation following Phase 1 workflow |

## Demo Checkpoint

🧠 **Show layered prompt composition in dev tools**

- Add console logging for layer composition
- Add dev tools panel to inspect composed system prompt
- Display layer priority order
- Show cache hit/miss statistics
