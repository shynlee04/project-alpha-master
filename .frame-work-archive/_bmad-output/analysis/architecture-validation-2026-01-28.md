# Architecture Validation Report

**Date**: 2026-01-28
**Time**: 12:30 UTC
**Purpose**: Validate new-fundamental-truths.md against research findings
**Version**: 1.0.0
**Researcher**: architect-ext (BMAD Framework)

---

## Executive Summary

**Overall Validation Status: NEEDS UPDATES**

The vision document (`new-fundamental-truths.md`) is architecturally sound in its core concepts (project-centric, plugin-based, BYOK vault) but requires **significant updates** in three key areas:

1. **Storage Strategy** - IndexedDB alone is NOT sufficient; SQLite WASM + OPFS required
2. **AI SDK Selection** - TanStack AI confirmed; remove uncertainty language
3. **State Management** - 4-layer architecture needs explicit documentation

The research validates 70% of the vision while identifying critical gaps that must be addressed before implementation.

---

## 1. Project-Centric Architecture

**Status**: VALID WITH MINOR UPDATES

### Analysis

The shift from workspace-centric to project-centric architecture is **validated by research**:

- **VSCode Pattern**: Multi-root workspaces allow project isolation but don't support nested configurations (aligns with our nested project blocking approach)
- **Obsidian Pattern**: Strongly discourages nested vaults due to data corruption risks (validates our decision)
- **Notion Pattern**: Single hierarchy approach works but lacks project isolation (validates our project-centric choice)

### Research Validation Points

| Vision Claim | Research Finding | Validated? |
|-------------|------------------|------------|
| Single `/$projectId` route | Industry pattern for project-based apps | ✅ Yes |
| Block nested projects | Obsidian + VSCode both struggle with nesting | ✅ Yes |
| Platform determines plugins | Natural for responsive design | ✅ Yes |
| Project ID as anchor for threads/RAG | Required for context isolation | ✅ Yes |

### Edge Cases Identified by Research

The vision document lacks handling for these scenarios:

1. **User downloads project into existing project folder** - Need detection + migration prompt
2. **Git clone creates nested structure** - Need `.git` detection + promotion option
3. **Monorepo with multiple sub-projects** - Need "Project Groups" feature (not nested projects)

### Updates Needed

| Section | Current | Update To |
|---------|---------|-----------|
| Section 1.3 | Silent about nested projects | Add explicit "Nested Project Blocking" subsection |
| Section 1.3 | No edge case handling | Add edge case detection behaviors |
| N/A | No monorepo strategy | Add "Project Groups" concept for future |

---

## 2. Plugin Architecture

**Status**: NEEDS UPDATE

### Analysis

The current vision defines plugins but lacks critical contract details discovered in research:

**Strengths (Validated)**:
- FeaturePlugin interface captures essential properties
- 5-plugin limit (2 always-loaded + 3 optional) is reasonable
- Platform-restricted plugins concept is correct

**Gaps Identified**:

| Gap | Impact | Research Solution |
|-----|--------|-------------------|
| No plugin communication pattern | Plugins can't interact | Event Bus pattern required |
| No state isolation rules | State conflicts likely | Plugin-scoped stores + global read-only |
| No versioning strategy | Breaking changes unmanageable | API versioning with manifest |
| No lifecycle hooks | Plugins can't cleanup | `onActivate`, `onDeactivate` hooks |

### Plugin Contract Definition - Research Findings

The vision's `FeaturePlugin` interface is **incomplete**. Research suggests expanding it:

```typescript
// Current (from vision)
interface FeaturePlugin {
  id: string;
  name: string;
  component: React.FC;
  requiresFSA: boolean;
  minWidth: number;
  // ...basic properties
}

// Research recommends adding:
interface FeaturePlugin {
  // ...existing
  capabilities: PluginCapability[];  // NEW
  onLoad(context: PluginContext): Promise<void>;  // NEW
  onUnload(): Promise<void>;  // NEW
  onActivate?(): Promise<void>;  // NEW
  onDeactivate?(): Promise<void>;  // NEW
}
```

### Updates Needed

| Section | Update Required |
|---------|----------------|
| Section 3.1 | Expand FeaturePlugin interface with lifecycle hooks |
| Section 3.1 | Add PluginContext interface (event bus, storage, services) |
| NEW | Add "Plugin Communication" section (Event Bus pattern) |
| NEW | Add "Plugin State Isolation" section |
| NEW | Add "Plugin Versioning" section |

### 5-Plugin Limit Validation

**VALID** - Research confirms:
- Lazy loading requirement for >3 plugins is standard
- Event bus pattern scales to 10+ plugins
- Memory pressure becomes issue at 8+ simultaneous UI plugins
- 5 is a pragmatic limit for MVP

### Always-Loaded Plugins Validation

**VALID** - The two always-loaded plugins are correct:
1. **Project Management Plugin** - Essential for navigation
2. **Chat Cascade Plugin** - Core AI interaction surface

---

## 3. Storage Strategy

**Status**: NEEDS MAJOR UPDATE

### Original Vision (Section 2.2)

```
Mobile/Tablet (IndexedDB via Dexie.js)
- Virtual files in browser database
- Single source of truth (no sync conflicts)
```

### Research Finding: IndexedDB Alone is NOT Sufficient

**Critical Issues Discovered**:

| Issue | Impact | Severity |
|-------|--------|----------|
| Safari 7-day eviction | ALL DATA WIPED if user doesn't open app for 7 days | CRITICAL |
| No SQL queries | Complex RAG queries inefficient | HIGH |
| 50MB Cache API limit (iOS) | Limits offline assets | MEDIUM |
| IndexedDB performance at 1000+ files | Slow without proper indexing | HIGH |

### Research Recommendation: Tiered Hybrid Storage

```
Layer 1: SQLite WASM + OPFS (Primary)
├── Notes metadata
├── Project structure
├── RAG embeddings
├── Search indices (FTS5)

Layer 2: IndexedDB (Fallback + Blobs)
├── Note content (Markdown/HTML)
├── File attachments
├── Sync queue
├── Browser compatibility fallback

Layer 3: Cache API (Static Assets Only)
├── App shell
├── Fonts, icons
├── Static images
```

### Safari Eviction Mitigation (CRITICAL)

The vision document **completely ignores** Safari's 7-day eviction policy:

```yaml
Required Mitigations:
  1. PWA installation prompt (mandatory for Safari mobile)
  2. "Add to Home Screen" banner with explanation
  3. Re-sync on first launch after eviction
  4. Storage quota monitoring with user warnings
```

### Updates Needed

| Section | Current | Update To |
|---------|---------|-----------|
| Section 2.2 | "Dexie.js for persistence" | "SQLite WASM + OPFS as primary, Dexie.js fallback" |
| Section 2.2 | No eviction handling | Add Safari eviction mitigation section |
| Section 8.1 | Only 3 state layers | Add Layer 4: SQLite/OPFS storage |
| NEW | N/A | Add "Browser Storage Limitations" section |
| NEW | N/A | Add "PWA Installation Requirements" section |

### Impact on Architecture

This is a **MAJOR architectural change** requiring:
1. SQLite WASM build integration
2. Web Worker for sync file access
3. OPFS feature detection
4. Fallback path for older browsers
5. Storage quota monitoring

---

## 4. AI SDK Selection

**Status**: VALID (TanStack AI Confirmed)

### Analysis

Research **conclusively validates** TanStack AI over Vercel AI SDK for Project Alpha:

| Criterion | TanStack AI | Vercel SDK v6 | Winner |
|-----------|-------------|---------------|--------|
| Client-side tools | ✅ First-class `.client()` | ⚠️ Callback-based | TanStack |
| Tool approval | ✅ `needsApproval` flag | ⚠️ Manual output flow | TanStack |
| TanStack integration | ✅ Native | ⚠️ Compatible | TanStack |
| Provider switching | ✅ Runtime type-safe | ✅ Runtime | Tie |
| Agentic patterns | ⚠️ Manual | ✅ ToolLoopAgent | Vercel |

**User's Core Concern Addressed**: The vision mentioned "lacking of client-side tooling system" in Vercel SDK - TanStack AI's `.client()` modifier **directly solves this**.

### Updates Needed

| Section | Current | Update To |
|---------|---------|-----------|
| Section 4.3 | "TanStack AI SDK First" (but uncertain language in RAW) | Remove uncertainty; confirm TanStack AI |
| Section 5.2 | Tool types mentioned | Add explicit client vs server tool examples |
| Section 3 (RAW) | "may be switching to AI-SDK" | Remove - decision is TanStack AI |

---

## 5. State Management

**Status**: NEEDS UPDATE

### Current Vision (Section 8.1)

3 layers defined:
1. Client State (Zustand)
2. Persisted State (Dexie.js)
3. File System (FSA/IndexedDB)

### Research Finding: 4-Layer Architecture Required

Research identified a critical **missing layer** and refined boundaries:

```
Layer 1: UI State (Zustand ONLY)
├── Panel open/closed states
├── Selection state
├── Hover/focus states
├── Transient form values
└── Technology: Zustand (NO persist middleware)

Layer 2: Session State (Zustand + Dexie Hydration)
├── Active project ID
├── Open editor tabs
├── Panel layout preferences
└── Technology: Zustand with hydrateProjects()

Layer 3: Persisted State (Dexie.js Source of Truth)
├── Projects metadata
├── Conversation threads
├── User preferences
└── Technology: useLiveQuery() for reactivity

Layer 4: File State (FSA/IDB Adapters)
├── Source code files
├── Markdown notes
└── Technology: Sync engine orchestrates
```

### Key Boundary Rules (from Research)

1. **Never use Zustand persist middleware for Dexie-owned data**
2. **Always use useShallow() for Zustand selectors**
3. **Always use useLiveQuery() for Dexie data**
4. **File operations MUST go through sync engine**

### Updates Needed

| Section | Current | Update To |
|---------|---------|-----------|
| Section 8.1 | 3 layers | 4 layers with Session State added |
| Section 8.2 | Generic boundaries | Add explicit boundary rules |
| NEW | N/A | Add "State Conflict Prevention Rules" section |
| NEW | N/A | Add "Anti-Patterns to Avoid" section |

---

## 6. LLM Provider Strategy

**Status**: NEEDS UPDATE

### Current Vision (Section 4.2)

| Provider | Tier | Status |
|----------|------|--------|
| Google Gemini | First-tier | Listed as "3.0 Pro / 3.0 Flash" |
| OpenRouter | First-tier | Listed correctly |
| OpenAI | First-tier | Listed as "GPT-5.1-Codex-Max" (outdated) |
| Anthropic | First-tier | Listed as "Claude Sonnet 4.5, Opus 4.5" |
| Grok | Second-tier | Listed |
| Ollama | Second-tier | Listed |

### Research Finding: Provider Priority Update

**Recommended Priority Order**:

| Priority | Provider | Reason |
|----------|----------|--------|
| **P1** | Google Gemini | FREE embeddings, 2M context, best multimodal, 75% caching savings |
| **P2** | Anthropic Claude | 90% caching savings, extended thinking, MCP native |
| **P3** | OpenAI | Ecosystem maturity, stable APIs |
| **P4** | OpenRouter | 400+ models, fallback routing |
| **P5** | Ollama | Local/privacy mode, offline |

**Critical Finding: Embedding Strategy**

```yaml
Recommendation:
  Primary: Google Text Embedding 004 (FREE)
  Fallback: OpenAI text-embedding-3-small ($0.02/1M)
  
Reason: Anthropic does NOT provide embedding endpoints
```

### Updates Needed

| Section | Current | Update To |
|---------|---------|-----------|
| Section 4.2 | All first-tier equal | Prioritize Gemini as P1 |
| Section 4.2 | No embedding strategy | Add embedding provider selection |
| Section 4.2 | Outdated model names | Update to 2026 models |
| NEW | N/A | Add "Context Caching Strategy" section |
| NEW | N/A | Add "Embedding Provider Selection" section |

---

## 7. Remaining Gaps from RAW VERSION

The following questions from the RAW VERSION remain **partially or not addressed**:

### Q1: PC-USERS Nested Projects
**Status**: ✅ ANSWERED by Research 1
- Block nested projects with detection + migration prompts

### Q2: Non-PC Feature Parity
**Status**: ✅ ANSWERED by Research 1
- Tiered feature model (Essential, Enhanced, Desktop-only)
- Never silently fail - show clear messaging

### Q3: Plugin Design Complexity
**Status**: ⚠️ PARTIALLY ANSWERED by Research 4
- Event bus pattern for communication
- State isolation rules defined
- **Gap**: Plugin lazy loading implementation details

### Q4: Large Project Sync (1000+ files)
**Status**: ✅ ANSWERED by Research 3
- Layered delta sync architecture
- FileSystemObserver + mtime cache + content hash
- Target: <3s initial sync, <200ms incremental

### Q5: IndexedDB Limitations
**Status**: ✅ ANSWERED by Research 1
- SQLite WASM + OPFS required
- Safari eviction requires PWA installation

### Q6: State Management Boundaries
**Status**: ✅ ANSWERED by Research 3
- 4-layer architecture with strict boundaries
- Conflict prevention rules defined

### Q7: Project Creation/Navigation Revamp
**Status**: ❌ NOT ADDRESSED
- Research focused on technical aspects
- UX for project creation not explored
- **Needs**: Separate UX research

### Q8: LLM Provider Capabilities
**Status**: ✅ ANSWERED by Research 4
- Full capability matrix for 2026
- Embedding strategy (Gemini FREE)
- Priority order established

### Q9: Agent Tool Permissions
**Status**: ⚠️ PARTIALLY ADDRESSED
- TanStack AI `needsApproval` flag confirmed
- **Gap**: Full permission matrix per agent type

### Q10: Thread Management Details
**Status**: ⚠️ PARTIALLY ADDRESSED
- Project-scoped threads confirmed
- 150K token limit with 90% compaction confirmed
- **Gap**: Compaction algorithm details

### Q11: Bi-directional File References
**Status**: ❌ NOT ADDRESSED
- `@filename` mentions not researched
- Selected text context not researched
- **Needs**: Separate research

---

## Summary: Vision Document Updates Required

### Sections to ADD

| Section # | Title | Content |
|-----------|-------|---------|
| 2.4 | Browser Storage Limitations | Safari eviction, OPFS browser support, quota monitoring |
| 2.5 | PWA Installation Requirements | Required for Safari data persistence |
| 3.4 | Plugin Communication | Event bus pattern, typed events |
| 3.5 | Plugin State Isolation | Plugin-scoped stores, global read-only subscriptions |
| 3.6 | Plugin Versioning | Manifest with minHostVersion, apiVersion |
| 4.4 | Embedding Provider Strategy | Gemini FREE as primary, OpenAI fallback |
| 4.5 | Context Caching Strategy | Anthropic/Gemini caching for 75-90% cost reduction |
| 8.4 | State Conflict Prevention | Rules for Zustand/Dexie boundary enforcement |
| 8.5 | Anti-Patterns to Avoid | Common mistakes and correct patterns |

### Sections to UPDATE

| Section | What to Change |
|---------|---------------|
| 1.3 | Add nested project blocking with edge cases |
| 2.2 | Replace "Dexie.js" with "SQLite WASM + OPFS primary, Dexie fallback" |
| 3.1 | Expand FeaturePlugin interface with lifecycle hooks |
| 4.2 | Update model names to 2026, add priority order |
| 4.3 | Remove uncertainty language about AI SDK choice |
| 5.2 | Add explicit client vs server tool examples |
| 8.1 | Add Layer 2 (Session State), expand to 4 layers |

### Sections to REMOVE

| Section | Reason |
|---------|--------|
| RAW VERSION Section 3 paragraph about "may be switching to AI-SDK" | Decision made: TanStack AI |
| References to "GPT-5.1-Codex-Max" | Outdated model name |

---

## ADRs Identified from Research

| ADR ID | Title | Status | Rationale |
|--------|-------|--------|-----------|
| **ADR-034** | Project-Centric Architecture | VALIDATE | Already exists - add nested project blocking details |
| **ADR-040** | TanStack AI Selection | CREATE | Research confirmed choice; document client-side tool patterns |
| **ADR-041** | Storage Strategy (SQLite WASM + OPFS) | CREATE | Major shift from Dexie-only; critical for Safari |
| **ADR-042** | State Management Boundaries | CREATE | 4-layer architecture with conflict prevention |
| **ADR-043** | Plugin Contract v1.0 | CREATE | Event bus, state isolation, versioning |
| **ADR-044** | LLM Provider Priority | CREATE | Gemini first, FREE embeddings strategy |
| **ADR-045** | Delta Sync Architecture | CREATE | Large project handling (1000+ files) |
| **ADR-046** | Context Caching Strategy | CREATE | 75-90% cost reduction with Anthropic/Gemini |
| **ADR-047** | PWA Requirements | CREATE | Safari data persistence, offline support |

---

## Effort Estimation for Updates

| Update | Effort | Priority |
|--------|--------|----------|
| Storage Strategy overhaul | 2-3 epics | P0 (CRITICAL) |
| Plugin Contract expansion | 1 epic | P1 (HIGH) |
| State Management docs | 0.5 epic | P1 (HIGH) |
| LLM Provider updates | 0.5 epic | P2 (MEDIUM) |
| AI SDK confirmation | 0.25 epic | P2 (MEDIUM) |
| Vision document edits | 0.5 epic | P1 (HIGH) |
| ADR creation (9 ADRs) | 1 epic | P1 (HIGH) |

**Total Estimated Effort**: 5-7 epics

---

## Next Steps

1. **IMMEDIATE**: Create ADR-041 (Storage Strategy) - This is the biggest architectural change
2. **HIGH**: Update new-fundamental-truths.md with all identified changes
3. **HIGH**: Create ADR-040 (TanStack AI) to formalize SDK choice
4. **MEDIUM**: Create remaining ADRs (043-047)
5. **MEDIUM**: Update architecture.md to align with new storage strategy
6. **LOW**: Research Q7 (Project Creation UX) and Q11 (Bi-directional References)

---

## Validation Summary

| Domain | Status | Confidence |
|--------|--------|------------|
| Project-Centric Architecture | ✅ VALID | HIGH |
| Plugin Architecture | ⚠️ NEEDS UPDATE | HIGH |
| Storage Strategy | ❌ MAJOR UPDATE | HIGH |
| AI SDK Selection | ✅ VALID | HIGH |
| State Management | ⚠️ NEEDS UPDATE | HIGH |
| LLM Providers | ⚠️ NEEDS UPDATE | HIGH |

**Overall**: The foundation is solid. The project-centric model, plugin-based architecture, and TanStack AI choice are all validated. However, the storage strategy requires a significant rearchitecting to handle Safari eviction and scale to 1000+ file projects.

---

**Report Generated**: 2026-01-28T12:30:00Z
**Timebox**: 20 minutes
**Tools Used**: read (5 files), write (1 file)
**Research Sources**: 4 research reports (Q1-Q8 coverage)
