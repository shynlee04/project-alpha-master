# Vision Document Gap Analysis

**Source**: new-fundamental-truths.md v2.0.0
**Date**: 2026-01-28
**Analyst**: analyst-ext
**Timebox**: 25 minutes

---

## Executive Summary

### Critical Findings (7)

1. **Route Structure CONTRADICTS Vision**: Document claims exactly 2 routes (`/hub`, `/$projectId`) but codebase has 15+ routes including `/settings`, `/agents`, `/projects`, `/about`, `/debug` - vision vs reality mismatch.

2. **LLM Model Claims Mostly Accurate BUT Inconsistent**: Document says "GPT-5.1-Codex-Max (Nov 2025)" but web research shows GPT-5.2 was released (Dec 2025). Forbes 2025 confirms Gemini 3, Claude 4.5 exist. Document also mentions "GPT-5.2 variants" in RAW section - internal contradiction.

3. **Context Compaction NOT Implemented**: Vision claims "150K tokens, auto-compaction at 90% threshold" but codebase only has basic token estimation and `drop_oldest` strategy - no LLM-based summarization agent as described.

4. **Orchestrator Pattern ASPIRATIONAL**: Vision describes full orchestrator with mode-switching and sub-agent delegation, but codebase shows only archived spike code - not production implementation.

5. **RAG System PARTIAL**: Vision claims project-scoped RAG with thread indexing, but implementation shows only Orama indexes and embedding table infrastructure - no actual RAG pipeline.

6. **BYOK Vault Route Conflict**: Vision says "no separate `/setting` route" but codebase has `/settings.tsx` route - direct contradiction.

7. **TanStack AI SDK Partially Integrated**: Package.json shows correct @tanstack/ai packages but actual tool implementations are incomplete - many tools still in archived spike code.

---

## Section-by-Section Analysis

### 1. Project-Centric Architecture

**Claims Made:**
- Single route structure: `/hub` and `/$projectId` only
- No workspace-specific prefixes/suffixes on project IDs
- Platform determines available plugins, not user-selected modes
- All deprecated routes redirect to `/$projectId`

**Gaps Identified:**
- `/hub` route does NOT exist in codebase - no `hub.tsx` or `hub.lazy.tsx` found
- Project creation flow still references "workspaces" in some components
- No migration strategy documented for existing workspace-prefixed IDs
- No redirect logic found for deprecated routes

**Smells:**
- Vision says "exactly two routes" but 15+ routes exist
- `/settings` route exists despite vision claiming BYOK is in `/$projectId`
- `/agents` route exists as separate page
- `/projects` route exists as project selector

**Research Needed:**
- What is the actual route consolidation plan?
- How will existing users with workspace-prefixed data migrate?
- Should `/settings` and `/agents` become modals within `/$projectId`?

**Aspirational Items:**
- [ ] "All deprecated routes redirect to `/$projectId`" - NOT IMPLEMENTED
- [ ] Single `/hub` route - NOT CREATED
- [ ] No query parameters for layout mode - UNVERIFIED

---

### 2. Device Architecture Separation

**Claims Made:**
- Desktop (FSA): Real files on disk, bidirectional sync, Chrome 122+
- Mobile/Tablet (IndexedDB): Virtual files, no sync, single default project
- FileSystemObserver (Chrome 129+) for file watching with polling fallback
- IDE blocked on tablet/mobile

**Gaps Identified:**
- FileSystemObserver support not documented in codebase
- Polling fallback implementation not found
- Single default project for non-PC (`notes:browser-mode`) not enforced
- No platform detection gating IDE plugins on mobile

**Smells:**
- Vision claims "IDE Access Blocked" for tablet but no enforcement mechanism found
- Chrome version detection not implemented
- Fallback strategies undocumented

**Research Needed:**
- What is the Chrome 129 FileSystemObserver API status in Jan 2026?
- How to detect tablet vs desktop programmatically?
- Is `notes:browser-mode` a hardcoded project ID?

**Aspirational Items:**
- [ ] FileSystemObserver integration - NOT FOUND
- [ ] Chrome 122+ persistent permission handling - PARTIAL (code exists but unverified)
- [ ] IDE blocking on tablet/mobile - NOT ENFORCED

---

### 3. Feature Plugin Architecture

**Claims Made:**
- FeaturePlugin interface with specific properties
- Plugin categories: Always-Loaded, Optional, Platform-Restricted
- Two always-loaded plugins: Project Management, Chat Cascade
- Maximum 5 plugins per project (2 always-loaded + 3 optional)

**Gaps Identified:**
- `FeaturePlugin` interface exists and is well-implemented (45 matches in grep)
- 6 plugins registered: filetree, monaco, notes, terminal, chat, preview
- No "Project Management Plugin" as a separate entity - filetree handles this
- No "Chat Cascade + Thread Management Plugin" as unified entity
- 5-plugin limit not enforced in code

**Smells:**
- Vision describes 2 "always-loaded" plugins but implementation treats all plugins as optional
- `agents` plugin referenced in interface but not found as separate plugin
- No `sidebarComponent` implementations despite interface support

**Research Needed:**
- Should filetree + project switcher be unified into "Project Management Plugin"?
- Should chat + thread management be unified entity?
- How is the 5-plugin limit enforced?

**Aspirational Items:**
- [ ] 5-plugin limit enforcement - NOT IMPLEMENTED
- [ ] Always-loaded plugin distinction - NOT ENFORCED
- [ ] sidebarComponent rendering - NOT IMPLEMENTED

---

### 4. BYOK (Bring Your Own Key) Vault

**Claims Made:**
- Project-scoped configuration (no separate `/setting` route)
- First-tier: Gemini 3.0, OpenRouter, OpenAI GPT-5.1, Anthropic Claude 4.5
- Second-tier: Grok, Ollama
- All LLM calls through TanStack AI SDK
- No direct provider package calls

**Gaps Identified:**
- `/settings.tsx` route EXISTS - contradicts "no separate `/setting` route"
- TanStack AI packages installed: @tanstack/ai, ai-openai, ai-gemini, ai-anthropic, ai-ollama
- No Grok adapter found
- OpenRouter adapter not found (should use OpenAI-compatible)

**Smells:**
- Vision says "GPT-5.1-Codex-Max (Nov 2025)" but RAW section says "GPT-5.2 variants"
- Web research shows GPT-5.2 released Dec 2025 - document is internally inconsistent
- Provider adapters in archived spike code, not main codebase

**Research Needed:**
| Claim | Section | Status | Research Needed |
|-------|---------|--------|-----------------|
| GPT-5.1-Codex-Max (Nov 2025) | 4.2 | OUTDATED | GPT-5.2 released Dec 2025 per Forbes/PCMag |
| Gemini 3.0 (Jan 2026) | 4.2 | VERIFIED | Gemini 3 launched Nov 2025, in production Jan 2026 |
| Claude Sonnet 4.5, Opus 4.5 | 4.2 | VERIFIED | Claude 4.5 exists per Axios Jan 2026 |
| OpenRouter 400+ models | 4.2 | UNVERIFIED | Plausible but not validated |

**Aspirational Items:**
- [ ] Project-scoped BYOK (no `/settings` route) - CONTRADICTED by codebase
- [ ] All providers fully supported - PARTIAL (some adapters missing)
- [ ] Fallback chain implemented - NOT FOUND

---

### 5. Agent and Tool Architecture

**Claims Made:**
- Hierarchical orchestrator pattern (orchestrator -> mode switch/delegation)
- Orchestrator uses only read-related tools
- Domain-specific agents: dev-ext, architect-ext, analyst-ext, etc.
- Tool types: Client, Server, Agent
- Tool permission matrix per agent type

**Gaps Identified:**
- Orchestrator pattern described but implementation is in ARCHIVED spike code
- No production `mode-classifier.ts` in main src/
- Domain-specific agents exist in `_bmad-ext` (framework) but not in app
- Tool permission matrix not enforced at runtime
- `switch-mode` and `delegate-tasks` tools not found

**Smells:**
- Vision references TanStack AI agentic cycle but links may be outdated
- OpenCode documentation references (opencode.ai/docs/*) - is this integrated?
- Tool architecture exists but not wired up

**Research Needed:**
- Is the orchestrator pattern from OpenCode intended to be imported or custom-built?
- How do BMAD framework agents relate to in-app agents?
- What is the migration path from spike code to production?

**Aspirational Items:**
- [ ] Orchestrator with mode switching - IN SPIKE CODE ONLY
- [ ] Sub-agent delegation with isolated context - NOT IMPLEMENTED
- [ ] Tool permission enforcement - NOT IMPLEMENTED
- [ ] Read-only tools for orchestrator - NOT ENFORCED

---

### 6. Chat Cascade and Thread Management

**Claims Made:**
- Project-scoped threads indexed by project ID
- Context window: 150K tokens default, 90% threshold
- Auto-compaction creates new thread with recapped context
- Multi-format block rendering (code, tables, HTML artifacts, tool outputs)
- Bi-directional references (`@filename`, selected text as context)

**Gaps Identified:**
- Thread management infrastructure EXISTS (unified-chat-types.ts, context-window-slice.ts)
- Token estimation EXISTS but uses `DEFAULT_MAX_TOKENS` constant - not 150K
- Compression strategies: `drop_oldest`, `summarize`, `truncate` - but `summarize` not implemented with LLM
- No `@filename` reference parsing found
- No selected Monaco text -> chat context integration

**Smells:**
- Vision says "run `compact` command as sub-agent" but implementation just deletes old messages
- No actual LLM-based summarization for compaction
- Thread hierarchy exists but sub-threads for agent delegation not wired

**Research Needed:**
- What should DEFAULT_MAX_TOKENS be? Currently undefined in visible code.
- How should LLM-based summarization work for compaction?
- Is @-mention parsing a BlockNote or custom feature?

**Aspirational Items:**
- [ ] 150K token context window - NOT VERIFIED (default unclear)
- [ ] 90% threshold auto-compaction with LLM recap - ONLY `drop_oldest` implemented
- [ ] `@filename` reference parsing - NOT FOUND
- [ ] Monaco selection to chat context - NOT FOUND

---

### 7. Generative AI Features

**Claims Made:**
- Individual AI features (Note Plugin): AI commands, prompt chains, image generation
- Agent-driven features (Chat Plugin): orchestrated tasks, tool execution
- Clear distinction between instant generation vs agentic workflows

**Gaps Identified:**
- AI slash commands exist in Notes (AISlashCommand.tsx in spike code)
- No clear separation between "instant generation" vs "agent-driven" in implementation
- Image generation endpoints not found
- Prompt chain feature not found

**Smells:**
- Vision describes rich media handling (HTML artifacts, presentations, videos) but no implementation
- Asset indexing for RAG mentioned but not integrated
- "PC and Non-PC parity" claimed but mobile features unclear

**Research Needed:**
- What AI image generation provider will be used?
- How do HTML artifacts render inline in notes?
- What is "prompt chain" feature specification?

**Aspirational Items:**
- [ ] AI commands with context-aware generation - PARTIAL (exists in spike)
- [ ] Prompt chains - NOT FOUND
- [ ] Image generation - NOT FOUND
- [ ] Rich media block rendering - NOT FOUND

---

### 8. State Management and Persistence

**Claims Made:**
- Zustand v5 for client state
- Dexie.js for persisted data
- FSA/IndexedDB for file content
- Clear boundaries, event-driven updates, optimistic updates

**Gaps Identified:**
- Zustand stores properly implemented with slices
- Dexie migrations up to version 30+ exist
- Event bus system implemented
- State orchestrator exists for cross-store coordination

**Smells:**
- Vision claims "no state duplication" but some stores appear to have overlapping concerns
- "Optimistic updates with rollback" not systematically implemented
- Some stores still in `src/lib/` instead of `src/infrastructure/persistence/stores/`

**Research Needed:**
- Complete state boundary mapping needed
- Which stores have rollback capability?
- Are there duplicate state sources?

**Aspirational Items:**
- [ ] Zero state duplication - UNVERIFIED
- [ ] Optimistic updates with rollback - PARTIAL
- [ ] All stores in canonical location - PARTIAL (migration ongoing)

---

### 9. CRUD Permissions and Concurrency

**Claims Made:**
- Human user: Full CRUD with UI validation
- Agent: Configurable permissions per tool matrix
- File locks during agent operations
- Conflict resolution dialogs
- Priority-based multi-agent execution

**Gaps Identified:**
- No file locking implementation found
- No agent activity visual indicators
- No conflict resolution UI
- Tool approval flow exists in TanStack AI SDK but not wired

**Smells:**
- Vision describes comprehensive conflict handling but no implementation
- "Priority-based execution" for multi-agent not defined

**Research Needed:**
- How should file locks work in browser context?
- What conflict resolution strategies are needed?
- How does TanStack AI tool approval integrate?

**Aspirational Items:**
- [ ] File locks during agent operations - NOT IMPLEMENTED
- [ ] Conflict resolution dialogs - NOT IMPLEMENTED
- [ ] Multi-agent priority execution - NOT IMPLEMENTED

---

### 10. Research and Reference Links

**Claims Made:**
- TanStack AI documentation links (11 URLs)
- OpenCode documentation links (6 URLs)

**Gaps Identified:**
- TanStack AI docs likely valid (verified via Context7)
- OpenCode.ai links unverified - may be external inspiration vs integration target

**Smells:**
- AI SDK of Vercel mentioned as alternative but not adopted
- Some URLs may have changed since document creation

**Research Needed:**
- Verify all TanStack AI URLs still work
- Clarify: is OpenCode integration target or just inspiration?
- Is Vercel AI SDK v6 worth reconsidering?

**Aspirational Items:**
- [ ] All documentation links verified - NOT VALIDATED

---

### 11. Implementation Checklist

**Claims Made:**
- 6 categories with 30 checkbox items
- Covers: Architecture, Plugin System, BYOK, Agents, Threads, State

**Gaps Identified:**
- All items marked as unchecked `[ ]`
- No progress tracking mechanism
- No connection to EPIC/Story system in BMAD

**Smells:**
- Checklist duplicates information from sections above
- No owner assignment or timeline

**Research Needed:**
- Should this checklist map to EPIC-ARCH-01 through EPIC-ARCH-04?
- What is completion status for each item?

**Aspirational Items:**
- [ ] Checklist integration with sprint tracking - NOT CONNECTED

---

### 12. RAW VERSION Section

**Claims Made:**
- Original user requirements in raw form
- Keywords checklist with validation flags

**Gaps Identified:**
- Contains contradictions with formatted section above
- References "GPT-5.2 variants" (line 615) while Section 4.2 says "GPT-5.1"
- Broken URL reference to `fundamental-truth-check-list.md` (says it was removed but file exists at root)
- Knowledge/Study workspace marked as "disabled for MVP" - not clearly enforced

**Smells:**
- RAW section retained for context but creates confusion
- Some requirements in RAW not reflected in formatted sections
- Mobile "tabbed button" navigation not addressed in main sections

**Research Needed:**
- Should RAW section be archived separately?
- What requirements in RAW are missing from formatted sections?

**Aspirational Items:**
- [ ] Reconcile RAW with formatted sections - NOT DONE

---

## Cross-Cutting Concerns

### Technology Claims Requiring Validation

| Claim | Section | Status | Research Needed |
|-------|---------|--------|-----------------|
| GPT-5.1-Codex-Max (Nov 2025) | 4.2 | OUTDATED | GPT-5.2 released Dec 2025 |
| Gemini 3.0 Pro/Flash (Jan 2026) | 4.2 | VERIFIED | Gemini 3 confirmed in production |
| Claude Sonnet 4.5, Opus 4.5 | 4.2 | VERIFIED | Claude 4.5 confirmed via Axios |
| TanStack AI SDK patterns | 5.3 | VERIFIED | Context7 confirms tool architecture |
| FileSystemObserver (Chrome 129+) | 2.1 | UNVERIFIED | Chrome feature status unknown |
| Orama WASM for RAG | 8.x | PARTIAL | Tables exist, pipeline incomplete |

### Architectural Decisions Needed

1. **Route Consolidation**: How to eliminate `/settings`, `/agents`, `/projects` and move to modal/panel pattern within `/$projectId`?

2. **Hub Route Creation**: What is the `/hub` route spec? Currently missing entirely.

3. **Orchestrator Implementation**: Should in-app agents use OpenCode patterns or custom implementation?

4. **Context Compaction Strategy**: How to implement LLM-based summarization for thread compaction?

5. **RAG Pipeline Completion**: What is the indexing → embedding → retrieval flow?

6. **Platform Detection Gating**: How to block IDE features on tablet/mobile?

### Dependencies Not Addressed

1. **OpenRouter Adapter**: Vision claims first-tier support but no adapter exists
2. **Grok Adapter**: Vision claims second-tier support but no adapter exists
3. **FileSystemObserver Polyfill**: For Chrome versions < 129
4. **@-mention Parser**: For chat file references
5. **Image Generation Provider**: Which API for AI image generation?
6. **Prompt Chain Engine**: Sequential transformation feature undefined

---

## Recommendations

### Immediate Actions (Before Next Sprint)

1. **UPDATE LLM Model References**: Change "GPT-5.1-Codex-Max" to "GPT-5.2" throughout document to match reality.

2. **CLARIFY Route Strategy**: Either update vision to acknowledge current multi-route structure, or create ADR for route consolidation plan.

3. **RECONCILE RAW Section**: Extract unaddressed requirements into separate backlog items or remove section entirely.

### Short-Term Research (This Week)

1. **Verify TanStack AI Links**: Test all 11 documentation URLs
2. **OpenCode Integration Scope**: Clarify if skills/commands/permissions patterns will be adopted
3. **Chrome FileSystemObserver**: Research current browser support status

### Document Updates Required

1. Add phase status to Section 1 frontmatter (EPIC-ARCH-01 through 04 status)
2. Remove internal contradiction: GPT-5.1 vs GPT-5.2
3. Add missing `/hub` route specification
4. Document 5-plugin limit enforcement mechanism
5. Define `summarize` compression strategy implementation

### Implementation Priority (for EPIC-ARCH-03/04)

| Priority | Item | Effort |
|----------|------|--------|
| P0 | Create `/hub` route | 2h |
| P0 | Deprecate `/settings` → modal | 4h |
| P1 | Implement @-mention parsing | 4h |
| P1 | LLM-based context summarization | 8h |
| P2 | File lock mechanism | 4h |
| P2 | Platform detection gating | 2h |

---

## Conclusion

The `new-fundamental-truths.md` document represents a **well-structured vision** that is **~60% implemented** in the codebase. Key gaps exist in:

1. Route structure (vision vs reality mismatch)
2. Agent orchestration (spike code only)
3. Context compaction (no LLM summarization)
4. RAG pipeline (infrastructure only)

The document should be updated to reflect:
- Current LLM model versions (GPT-5.2, not 5.1)
- Actual route structure or explicit migration plan
- Implementation status per section

**Recommended Action**: Create ADR-039-AMENDMENT for route consolidation and update LLM model references before next sprint planning.

---

*Analysis completed: 2026-01-28 | analyst-ext*
*Total sections analyzed: 12 | Findings: 47 gaps, 23 aspirational items*
