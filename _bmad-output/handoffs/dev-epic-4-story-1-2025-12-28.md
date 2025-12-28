# Handoff to `@bmad-bmm-dev`

**Story:** Epic 4 - Story 1 (4-1-system-prompt-composer)  
**Phase:** dev-story (Phase 3)  
**Date:** 2025-12-28  
**Time:** 16:52:00 UTC+7

---

## Task

Implement the 5-Layer System Prompt Composer (Layers 1-3) for the AI agent infrastructure.

**Scope:** Implement only Layers 1-3 (Layers 4-5 deferred)
- **Layer 1:** Tool Constitution (system role, hidden from UI)
- **Layer 2:** Agent Mode (user-selectable persona)
- **Layer 3:** Context Injection (Hybrid Strategy: open files + project summary)

---

## Context Files

1. **Story File:** `_bmad-output/sprint-artifacts/4-1-system-prompt-composer.md`
2. **Context XML:** `_bmad-output/sprint-artifacts/4-1-system-prompt-composer-context.xml`
3. **Architecture:** `_bmad-output/project-planning-artifacts/architecture.md`
4. **Existing Implementation:** `src/lib/agent/system-prompt.ts`

---

## Acceptance Criteria

### AC-1: Layer Composition Order
- System prompt composed from Layer 1 → 2 → 3 order
- Layer 1 sent as `system` role message (hidden from UI)
- Layer 2 as user-selectable persona
- Layer 3 with hybrid context injection

### AC-2: Layer Caching Strategy
- Layers 1+2 cached with priority ordering
- Recomputed only on config change
- Cache invalidation on agent mode change

### AC-3: Context Injection Strategy
- Max 10 open files included
- Active file identification
- Project package.json summary integration

---

## Implementation Tasks

From story file, implement these in order:

1. [ ] Create `SystemPromptComposer` class in `src/lib/agent/prompt-composer.ts`
2. [ ] Define Layer interface and Layer types
3. [ ] Implement layer registration with priority ordering
4. [ ] Implement caching for Layers 1+2
5. [ ] Implement dynamic Layer 3 recomputation on file changes
6. [ ] Implement `compose()` method
7. [ ] Add unit tests for layer composition
8. [ ] Add unit tests for caching
9. [ ] Add unit tests for context injection
10. [ ] Integrate into agent initialization
11. [ ] Add dev tools inspection

---

## Key Technical Requirements

### Architecture Patterns
- **Singleton Pattern:** One instance per agent configuration
- **Observer Pattern:** Listen to file system events for Layer 3
- **Strategy Pattern:** Different layer types implement common interface
- **Cache Pattern:** Memoize Layers 1+2 with `WeakMap`

### Caching Implementation
- Cache key: `{layerType}_{configHash}`
- Invalidate on agent mode, tool constitution, or provider config change

### File System Events
- 300ms debounce for file change events
- Subscribe to workspace events for Layer 3 updates

### Integration Points
- Agent initialization: Call `SystemPromptComposer.compose()` before first message
- TanStack AI: Use `systemPrompts` array in `chat()` call

---

## Research Findings Summary

| MCP Tool | Key Finding |
|----------|-------------|
| Context7 | TanStack AI `chat()` accepts `systemPrompts` array, SSE streaming |
| Tavily | WeakMap memoization with `{layerType}_{configHash}` cache key |
| DeepWiki | Tool-based RAG, file events for dynamic Layer 3 updates |
| Repomix | Existing 2-layer: Tool Constitution + Agent Mode |
| Tavily | Multi-agent personas, role-based security layer patterns |

---

## Testing Requirements

- Tests in `__tests__/` directories adjacent to source files
- Mock `vi.mock('@tanstack/ai')` for TanStack AI
- Use `vi.mock()` for WebContainer operations
- TypeScript: `pnpm tsc --noEmit`
- Run tests: `pnpm test`

---

## Deliverables

**Files to Create/Modify:**
1. `src/lib/agent/prompt-composer.ts` - SystemPromptComposer class
2. `src/lib/agent/prompt-composer.test.ts` - Unit tests
3. `src/lib/agent/index.ts` - Add to barrel exports
4. Update story file with Dev Agent Record

**Output Location:** `_bmad-output/sprint-artifacts/4-1-system-prompt-composer.md` (Dev Agent Record section)

---

## Return via `attempt_completion`

When complete, provide:
1. Summary of implementation
2. Files created/modified with line counts
3. Test results (passing/total)
4. Any decisions made during implementation
5. Update sprint-status.yaml: `4-1-system-prompt-composer: ready-for-dev → in-progress`

---

## This Instruction Supersedes

Any conflicting general instructions in `@bmad-bmm-dev` mode. Focus ONLY on this story implementation.
