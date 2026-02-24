# PRD Analysis Report: Alignment with New Fundamental Truths and 3-Phase Approach

**Analysis Date:** 2026-01-26
**Analyst:** analyst-ext (subagent)
**Report ID:** PRD-ANALYSIS-2026-01-26
**Status:** COMPLETE

---

## Executive Summary

This report analyzes the current PRD (version 1.1.0, dated 2026-01-22) against the new architecture fundamentals (new-fundamental-truths.md v2.0.0, dated 2026-01-25) and the 3-phase approach outlined in `docs/the-3-phase-approach.md`.

**Critical Finding:** The PRD is **SIGNIFICANTLY MISALIGNED** with the new fundamental truths (v2.0.0), requiring comprehensive updates to reflect the project-centric architecture shift, plugin system design, and phase-by-phase feature requirements.

**Alignment Score:** 45/100 (45% aligned)

---

## Document Metadata

| Attribute | Current PRD | New Fundamental Truths | Alignment Status |
|-----------|---------------|---------------------|-----------------|
| **Version** | 1.1.0 (2026-01-07) | 2.0.0 (2026-01-25) | ❌ PRD outdated by 18 days |
| **Last Update** | 2026-01-22 | 2026-01-25 | ❌ PRD stale |
| **Architecture** | Workspace-centric | Project-centric | ❌ FUNDAMENTAL MISALIGNMENT |
| **Route Structure** | Multi-route per workspace | Single route `/$projectId` | ❌ INCOMPATIBLE |
| **Storage Focus** | Mixed FSA/IndexedDB | Platform-specific with FSA/IndexedDB | ⚠️ PARTIAL |
| **BYOK Design** | Vault exists, incomplete | Comprehensive TanStack AI SDK | ❌ MAJOR GAP |
| **Plugin System** | Not defined | Fully specified | ❌ MISSING |

---

## Phase Coverage Matrix

### Phase 1A: Non-AI Core & Foundational Setup

| Feature Category | PRD Coverage | Requirement Status | Gaps Identified |
|----------------|--------------|-------------------|------------------|
| **Project Architecture** | ✅ Covered (Journeys 1-7) | ⚠️ Outdated routing model | Route structure wrong (/ide/$projectId vs /$projectId) |
| **Project ID Routing** | ✅ Covered | ❌ Incomplete | Project ID not clearly defined as single source of truth |
| **Platform-Aware Entry** | ✅ Covered (Section: Platform-Aware Entry) | ⚠️ Partial | Entry matrix present, but lacks plugin-based selection |
| **Terminal & WebContainer** | ✅ Covered (Journey 1) | ✅ Complete | WebContainer integration documented |
| **Monaco Editor** | ✅ Covered (Functional Requirements) | ⚠️ Partial | Hot load reactive, sync described but plugin architecture missing |
| **FileTree + Project** | ✅ Covered (Functional Requirements) | ⚠️ Partial | Snapshots, persistent permission described but plugin architecture missing |
| **Preview Plugin** | ✅ Covered (Functional Requirements) | ⚠️ Partial | WebContainer preview described but plugin architecture missing |

**Phase 1A Coverage:** 65% (Core features present, plugin architecture missing)

---

### Phase 1B: BYOK & Notes Features

| Feature Category | PRD Coverage | Requirement Status | Gaps Identified |
|----------------|--------------|-------------------|------------------|
| **BYOK Vault Architecture** | ✅ Covered (Journey 7, Section 4) | ❌ OUTDATED | Vault exists but TanStack AI SDK integration missing |
| **TanStack AI SDK Integration** | ❌ NOT MENTIONED | ❌ CRITICAL GAP | Entire section missing from PRD |
| **Provider Support** | ⚠️ Partial (Journey 5, Section 4) | ⚠️ Incomplete | Provider list exists, but integration patterns outdated |
| **Provider Adapter Updates** | ❌ NOT MENTIONED | ❌ CRITICAL GAP | No mention of adapter integration with TanStack AI SDK |
| **Fallback Chains** | ❌ NOT MENTIONED | ❌ CRITICAL GAP | Provider fallback mechanism not described |
| **Secure Key Distribution** | ⚠️ Partial (Section 4) | ❌ Incomplete | Reactive key passing described, but TanStack AI SDK missing |
| **Notes Plugin Features** | ✅ Covered (Journey 2) | ⚠️ Partial | BlockNote, AI enhancement described but plugin architecture missing |
| **Notes ↔ Markdown Sync** | ✅ Covered (ADR-034 D3) | ⚠️ Partial | Bidirectional sync described, but plugin integration missing |

**Phase 1B Coverage:** 40% (BYOK architecture significantly outdated, plugin architecture missing)

---

### Phase 2: Chat Cascade, Threads, Agents

| Feature Category | PRD Coverage | Requirement Status | Gaps Identified |
|----------------|--------------|-------------------|------------------|
| **Chat Cascade Plugin** | ✅ Covered (Journey 5) | ❌ INCOMPLETE | ChatPanel exists but plugin architecture missing |
| **Thread Architecture** | ⚠️ Partial (Journey 5) | ❌ MAJOR GAP | Threads described, but project-scoped indexing missing |
| **Context Window Management** | ❌ NOT MENTIONED | ❌ CRITICAL GAP | 150K token limit, 90% compaction threshold not documented |
| **Auto-Compaction** | ❌ NOT MENTIONED | ❌ CRITICAL GAP | Compaction process completely missing |
| **Multi-Format Block Rendering** | ❌ NOT MENTIONED | ❌ CRITICAL GAP | Diverse content rendering (code blocks, rich text, artifacts) not specified |
| **Bi-Directional File References** | ⚠️ Partial (Journey 5) | ⚠️ Incomplete | File-to-chat and chat-to-file described but @ syntax missing |
| **Agent Orchestrator** | ✅ Covered (Journey 5, Section 4) | ⚠️ Partial | Orchestrator pattern exists but TanStack AI SDK integration missing |
| **Domain-Specific Agents** | ⚠️ Partial (Journey 5) | ⚠️ Incomplete | Tools and system instructions described but agent registry missing |
| **Tool Permission Matrix** | ⚠️ Partial (Journey 5) | ❌ MAJOR GAP | Per-agent permissions mentioned, but matrix not defined |
| **Agentic Cycle** | ❌ NOT MENTIONED | ❌ CRITICAL GAP | Sequential tool execution with error handling completely missing |

**Phase 2 Coverage:** 30% (Basic chat exists, advanced patterns and TanStack AI SDK missing)

---

### Phase 3: Advanced Cross-Plugin, Multi-Agentic Patterns, Tooling, RAG

| Feature Category | PRD Coverage | Requirement Status | Gaps Identified |
|----------------|--------------|-------------------|------------------|
| **Cross-Plugin Communication** | ❌ NOT MENTIONED | ❌ CRITICAL GAP | Plugin-to-plugin messaging patterns not described |
| **Multi-Agent Coordination** | ⚠️ Partial (Journey 5) | ⚠️ Incomplete | Basic delegation described, complex coordination missing |
| **Advanced Tool Patterns** | ⚠️ Partial (Journey 5) | ⚠️ Incomplete | Tool registry exists, but advanced patterns missing |
| **Tool Permission Granularity** | ⚠️ Partial (Journey 5) | ⚠️ Incomplete | CRUD toggle per workspace mentioned, but granular permissions missing |
| **RAG Integration** | ✅ Covered (Journey 3, Section 3.1) | ⚠️ Partial | RAG pipeline described, but plugin integration missing |
| **Embedding Endpoints** | ⚠️ Partial (Journey 3) | ⚠️ Incomplete | Embedding via process_pdf described, but multimodal patterns missing |
| **RAG Index Per Project** | ⚠️ Partial (Journey 3) | ⚠️ Incomplete | RAG index described, but project-scoping unclear |
| **Vector Search + BM25** | ⚠️ Partial (Journey 3) | ⚠️ Incomplete | Hybrid retriever described, but reranking missing |
| **Advanced Agentic Patterns** | ❌ NOT MENTIONED | ❌ CRITICAL GAP | Handoff patterns, context transfer, multi-agent consensus not described |

**Phase 3 Coverage:** 25% (Basic RAG exists, advanced patterns completely missing)

---

## Critical Architecture Misalignments

### 1. Route Structure (SEVERE MISALIGNMENT)

**Current PRD Model (Workspace-Centric):**
```
/ide/$projectId      → IDE workspace
/notes/$projectId    → Notes workspace
/knowledge/$projectId → Knowledge workspace
/study/$projectId    → Study workspace
```

**New Fundamental Truths Model (Project-Centric):**
```
/hub                    → Project management (no project loaded)
/$projectId              → Project loaded with feature plugins
```

**Impact:** The PRD's route structure is **incompatible** with the new architecture. All references to workspace-specific routes must be removed.

**Required Updates:**
- Remove all workspace route references
- Document single `/$projectId` route with plugin loading
- Update all user journeys to reflect project-centric model
- Document platform-aware plugin selection on project load

---

### 2. Project-Centric vs Workspace-Centric (FUNDAMENTAL SHIFT)

**Current PRD (Workspace-Centric):**
- Routes define workspace types
- User selects workspace mode
- State duplicated per workspace
- Plugins tied to specific workspaces

**New Fundamental Truths (Project-Centric):**
- Project is single source of truth
- Platform determines available plugins
- Plugins loaded based on platform capabilities
- No user-selected "workspace mode"

**Impact:** The PRD describes an architecture that no longer exists. All user journeys must be rewritten.

**Required Updates:**
- Remove "workspace" terminology throughout
- Document platform detection at project load
- Explain plugin loading based on PlatformContract
- Update state management to describe project-scoped plugins
- Document platform-specific default plugins (desktop vs mobile)

---

### 3. Plugin System Architecture (COMPLETELY MISSING)

**Current PRD Status:**
- No plugin system defined
- No FeaturePlugin interface documented
- No plugin registry described
- No plugin lifecycle explained
- No plugin layout system specified

**New Fundamental Truths Requirements:**
- FeaturePlugin interface (id, name, component, sidebarComponent, platform requirements, state management)
- Plugin categories (Always-Loaded, Optional, Platform-Restricted)
- Two always-loaded plugins: Project Management, Chat Cascade + Thread Management
- Plugin registry with maximum 5 plugins per project
- Plugin layout system (mobile: 1-column, tablet: 2-column, desktop: 3-column)

**Impact:** The PRD provides NO guidance on plugin architecture, which is now a core requirement.

**Required Updates:**
- Add comprehensive "Plugin System Architecture" section
- Document FeaturePlugin interface specification
- Describe two always-loaded plugins and their responsibilities
- Explain plugin registry and loading mechanism
- Document platform-aware default plugins per device type
- Specify maximum plugin limits (2 always-loaded + 3 optional)
- Describe plugin layout system and responsive behavior

---

### 4. BYOK Vault Architecture (MAJOR GAPS)

**Current PRD BYOK Coverage (Journey 7):**
- Credential vault mentioned (AES-256-GCM encryption)
- Provider adapters listed (Anthropic, OpenRouter, OpenAI, Gemini)
- Basic encryption and persistence described

**New Fundamental Truths BYOK Requirements:**
- Project-scoped BYOK configuration
- TanStack AI SDK integration (ALL LLM calls must use it)
- No direct provider package calls (prohibited)
- Fallback chain for providers
- Secure key distribution reactive to required endpoints
- Provider support tiers (First-Tier: Full Feature Parity, Second-Tier: Basic)
- All providers must support: multimodal input/output, embedding endpoints, model auto-loading, all parameters, native tool calling, token caching

**Impact:** The PRD's BYOK section is **significantly incomplete** and misses the critical TanStack AI SDK integration requirement.

**Required Updates:**
- Add "TanStack AI SDK Integration" section
- Document provider adapter patterns
- Describe fallback chain implementation
- Specify supported parameters per provider (max tokens, thinking variants, streaming thinking, native tool calling, token caching)
- List provider support tiers with capabilities
- Document multimodal requirements (text, images, audio, video)
- Explain secure reactive key distribution
- Add constraint: "No direct provider package calls"

---

### 5. Platform-Specific Requirements (GAPS)

**Current PRD Platform Coverage (Section: Platform-Aware Entry):**
- Entry matrix documented (New/Returned User × Desktop/Mobile/Tablet)
- IDE access blocking mentioned for mobile/tablet
- Platform detection partially described

**New Fundamental Truths Platform Requirements:**
- PlatformContract interface fully specified (deviceType, storageType, canAccessFSA, canWatchFiles, canRunTerminal, canDoAgenticCoding, canAccessIDE)
- Platform-aware default plugins per device type
- Default layout modes by platform (mobile: 1-column, tablet: 2-column, desktop: 3-column)
- Chrome version requirements (122+ for persistent FSA permissions, 129+ for structured clone optimization, FileSystemObserver)
- IDE access policy per platform (Desktop FSA: Full, Desktop IndexedDB: Limited, Tablet: Blocked, Mobile: Blocked)

**Impact:** The PRD's platform requirements are **incomplete** and lack critical details.

**Required Updates:**
- Add complete "Platform Requirements" section
- Document PlatformContract interface
- Specify platform-aware default plugins
- Describe default layout modes by platform
- Add Chrome version requirements table
- Document IDE access policy matrix
- Explain platform detection via `getPlatformContract()`

---

### 6. StorageGateway Abstraction (PARTIAL)

**Current PRD Storage Coverage (Section: Storage Requirements):**
- Storage stack documented (FSA for desktop, IndexedDB for mobile/tablet)
- Dexie schema partially described
- StorageGateway interface mentioned

**New Fundamental Truths Storage Requirements:**
- StorageGateway abstraction layer with clear interface
- FSAGateway implementation (desktop FSA)
- IDBGateway implementation (mobile/tablet IndexedDB)
- Factory pattern for storage adapter creation
- FSA handle persistence in IndexedDB (Chrome 129+ structured clone support)
- Minimize re-sync on project switch via snapshot caching
- Composite key pattern `[projectId+workspaceId]` for workspace state

**Impact:** The PRD's storage section is **partial** and lacks the abstraction layer details.

**Required Updates:**
- Document complete StorageGateway interface
- Describe FSAGateway implementation details
- Describe IDBGateway implementation details
- Explain factory pattern
- Add FSA handle persistence strategy (Chrome 129+ support)
- Document snapshot caching for fast load
- Explain composite key pattern for workspace state

---

### 7. State Management Boundaries (PARTIAL)

**Current PRD State Coverage (Section: State Management Boundaries):**
- Zustand vs Dexie responsibilities mentioned
- Persist-first pattern documented
- Hydration strategy partially described

**New Fundamental Truths State Requirements:**
- Clear separation: Zustand (client state), Dexie (persistent storage), File System (FSA/IndexedDB virtual files)
- Composite key pattern `[projectId+workspaceId]` for all workspace-scoped state
- Event-driven updates between layers
- Optimistic updates with rollback
- Workspace switch cleanup (clear composite-keyed state)
- Dexie vs LocalStorage boundaries (LocalStorage DEPRECATED, use Dexie only)

**Impact:** The PRD's state management section is **incomplete** and lacks critical details on state scoping and cleanup.

**Required Updates:**
- Document complete state layers table
- Explain composite key pattern in detail
- Add event-driven update mechanism description
- Describe optimistic update strategy with rollback
- Document workspace switch cleanup process
- Add explicit LocalStorage deprecation notice
- Clarify state cleanup on workspace/project switch

---

### 8. Agent and Tool Architecture (MAJOR GAPS)

**Current PRD Agent Coverage (Journey 5, Section: Technical Architecture):**
- Agent factory mentioned
- Tool registry (11 tools) documented
- Workspace permissions mentioned
- Credential vault mentioned
- God component: AgentConfigDialog.tsx (1,089 lines) identified

**New Fundamental Truths Agent Requirements:**
- Orchestrator pattern (hierarchical: User Input → Orchestrator → Mode Switching / Task Delegation → Domain-Specific Agents)
- Orchestrator responsibilities (conversational, context detection, task decomposition) with read-only tools (read-files, grep, glob, list-files, todowrite, todoread, question, switch-mode, delegate-tasks)
- Domain-specific agents with focused tool groups (dev-ext, architect-ext, analyst-ext, ux-designer-ext, tech-writer-ext)
- Tool types (Client Tools, Server Tools, Agent Tools)
- Tool permission matrix per agent type (write, edit, bash, task permissions)
- Tool approval workflows (per-agent permission controls: ask, allow, deny, critical tools require explicit user approval)
- Permission changes tracked and auditable
- Agentic cycle pattern (sequential tool execution with state, conditional branching, error handling with retry, context management and compaction)

**Impact:** The PRD's agent system description is **significantly incomplete** and lacks the orchestrator pattern and detailed permission matrix.

**Required Updates:**
- Add comprehensive "Agent System Architecture" section
- Document orchestrator pattern and responsibilities
- Describe domain-specific agents with tool groups
- Create tool permission matrix table
- Explain tool approval workflows
- Document agentic cycle pattern
- Remove AgentConfigDialog god component (split into smaller components)
- Reference TanStack AI SDK documentation (Tools Guide, Tool Architecture, Server Tools, Client Tools, Tool Approval, Agentic Cycle, Dev Tools, Structured Outputs, Streaming, Multimodal Content, Observability)

---

### 9. Chat Cascade and Thread Management (COMPLETELY MISSING)

**Current PRD Chat Coverage (Journey 5):**
- ChatPanel component mentioned
- Basic agent-assisted coding described
- Tool permissions mentioned

**New Fundamental Truths Chat Requirements:**
- Chat Cascade as always-loaded plugin (responsibilities: agent orchestration, thread management, RAG context indexing, multi-format block rendering, streaming conversation display)
- Thread architecture (project-scoped conversation contexts: Main Thread, Sub-threads, Compaction Threads)
- Context window management (default limit: 150K tokens, auto-compaction at 90% threshold)
- Compaction process (run sub-agent to condense conversation, filter irrelevant/contextual information, generate new thread with recapped context, preserve file path references)
- Multi-format block rendering (code blocks with syntax highlighting and copyable, rich text tables/diagrams/markdown, HTML artifacts embedded, streaming tokens displayed, tool outputs collapsible with status codes, file references clickable with `@` mentions)
- Bi-directional references (file-to-chat: @filename, @folder/, selected text in Monaco; chat-to-file: insert AI output as new file, insert at cursor position, copy to clipboard)

**Impact:** The PRD provides **NO guidance** on chat cascade and thread management, which is now a core requirement.

**Required Updates:**
- Add comprehensive "Chat Cascade Plugin" section
- Document thread architecture and indexing
- Explain context window management and limits
- Describe compaction process in detail
- Document multi-format block rendering requirements
- Explain bi-directional file references (`@` syntax, selected text integration)
- Describe streaming conversation display patterns
- Add tool output rendering requirements (collapsible, status-coded)

---

### 10. Generative AI Features (GAPS)

**Current PRD AI Features Coverage (Journey 2, Journey 5):**
- AI enhancement in Notes workspace mentioned (summarize, expand, organize, cite)
- Voice recording with transcription mentioned
- Agent-assisted coding described

**New Fundamental Truths Generative AI Requirements:**
- Individual AI features (Note Plugin) operating independently: AI Commands (context-aware text generation), Prompt Chains (sequential transformations), Image Generation (context-aware visual creation), Text Selection (selected text transformation)
- Agent-driven features (Chat Plugin) operating within chat cascade: Orchestrated Tasks (multi-step agent operations), Tool Execution (CRUD operations via agents), Context-Aware Generation (file-aware AI responses)
- UX patterns for individual AI features: Markdown block-based rendering, rich media support (HTML, images, videos, presentations), asset indexing for RAG compatibility, PC and Non-PC parity
- Multimodal input/output support: text, images, audio, video

**Impact:** The PRD's generative AI features description is **incomplete** and lacks distinction between individual AI features and agent-driven features.

**Required Updates:**
- Add "Generative AI Features" section
- Document individual AI features in Note Plugin
- Document agent-driven features in Chat Plugin
- Explain UX patterns for both feature types
- Describe multimodal input/output requirements
- Specify rich media support and asset indexing

---

## Deprecated Content (Should Remove)

### 1. Workspace-Centric References

**Locations in PRD:**
- "Multi-Workspace Architecture" (Section: Functional Requirements - Core Features)
- "IDE workspace (desktop only)" (multiple sections)
- "Knowledge workspace (RAG, notes)" (multiple sections)
- "Notes workspace (document sync)" (multiple sections)
- "Study workspace (flashcards, quizzes)" (multiple sections)
- Workspace switcher (multiple sections)

**Action Required:**
- ❌ **REMOVE** all workspace-centric terminology
- ❌ **REMOVE** references to workspace-specific routes (`/ide/$projectId`, `/notes/$projectId`, `/knowledge/$projectId`, `/study/$projectId`)
- ❌ **REMOVE** workspace switcher descriptions
- ✅ **REPLACE** with project-centric language (plugins, PlatformContract, single `/$projectId` route)

---

### 2. Outdated BYOK References

**Locations in PRD:**
- Journey 7: Settings & Configuration (BYOK) - "Route: /setting → AI Providers"
- Section 4: BYOK (Bring Your Own Key) Vault - "Route: /setting (no separate /setting route)"
- Section: BYOK Requirements - "Integration Points: - Route: /$projectId (no separate /setting route)" (conflicting)

**Action Required:**
- ❌ **REMOVE** references to `/setting` route
- ✅ **REPLACE** with project-scoped BYOK configuration (per project, not separate route)
- ⚠️ **CLARIFY** that BYOK configuration is per project, stored in Dexie, accessible from `/$projectId` route

---

### 3. LocalStorage References (DEPRECATED)

**Locations in PRD:**
- Section: Storage Requirements - "LocalStorage is DEPRECATED. Use Dexie (IndexedDB) for all persistent storage per [ADR-035 Part 1]."
- Section: State Management Boundaries - Mentions LocalStorage in table
- Section: Technical Architecture - "LocalStorage DEPRECATED [ADR-035 Part 1]"

**Action Required:**
- ⚠️ **KEEP** deprecation notice but ensure consistency
- ✅ **CLARIFY** that LocalStorage should NEVER be used except for "last workspace" preference per project
- ⚠️ **AUDIT** entire codebase for LocalStorage usage (per new fundamental truths)

---

### 4. Outdated State Scoping

**Locations in PRD:**
- Section: State Management Boundaries - Mentions "Composite key pattern: `[projectId+workspaceId]` but implementation is inconsistent
- Section: Journey 6: Cross-Workspace Operations - Describes state scoping but lacks clear rules

**Action Required:**
- ❌ **REMOVE** inconsistent state scoping references
- ✅ **REPLACE** with clear composite key pattern `[projectId+workspaceId]` for ALL workspace-scoped state (as per new fundamental truths section 8.0.2)
- ✅ **CLARIFY** state cleanup on workspace switch (clear composite-keyed state only)

---

## New Requirements to Add

### Phase 1A: Non-AI Core (Critical Additions)

#### 1. Plugin System Architecture

```markdown
## Plugin System Architecture

### FeaturePlugin Interface

The plugin system is based on a unified `FeaturePlugin` interface:

```typescript
interface FeaturePlugin {
  // Identification
  id: 'filetree' | 'monaco' | 'notes' | 'terminal' | 'chat' | 'agents';
  name: string;
  icon: React.ReactNode;
  
  // Rendering
  component: React.FC<FeaturePluginProps>;
  sidebarComponent?: React.FC<SidebarPluginProps>;
  
  // Platform Requirements
  requiresFSA: boolean;           // Requires desktop FSA
  requiresProject: boolean;        // Requires project to be loaded
  minWidth: number;                // Minimum layout width in pixels
  maxInstances: 1 | 2 | 'unlimited';
  
  // State Management
  usePluginStore: () => PluginState;
}
```

### Plugin Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **Always-Loaded** | Loaded in every project session | Project Management, Chat Cascade |
| **Optional** | User-selectable up to 5 total | Monaco, Notes, Terminal |
| **Platform-Restricted** | Only available on certain platforms | Terminal (desktop-only) |

### Two Always-Loaded Plugins

#### Plugin 1: Project Management Plugin

**Responsibilities:**
- File tree navigation and display
- Project switcher
- Project creation and deletion
- File/folder CRUD operations
- Database and RAG management

**UX Considerations:**
- For mobile/portrait: Tabbed button navigation
- Progressive disclosure for complex operations
- Clear visual hierarchy

#### Plugin 2: Chat Cascade + Thread Management Plugin

**Responsibilities:**
- Agent orchestration and coordination
- Thread management (project-scoped)
- RAG context indexing
- Multi-format block rendering
- Streaming conversation display

### Plugin Registry

Maximum plugins per project: **5** (2 always-loaded + 3 optional)

### Plugin Layout System

Responsive layout based on platform:

| Platform | Default Layout | Max Columns |
|----------|---------------|-------------|
| Mobile | 1-column | 1 |
| Tablet | 2-column | 2 |
| Desktop | 3-column | 3 |
```

---

#### 2. Platform-Aware Routing

```markdown
## Project-Centric Routing

### Route Structure

The application has exactly **two routes**:

```
/hub                      # Project management, no project loaded
/$projectId               # Project loaded with feature plugins
```

### Platform Contract Implementation

```typescript
interface PlatformContract {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  storageType: 'fsa' | 'indexeddb';
  canAccessFSA: boolean;
  canWatchFiles: boolean;
  canRunTerminal: boolean;
  canDoAgenticCoding: boolean;
  canAccessIDE: boolean;
  chromeVersion?: number;
  supportsStructuredClone: boolean;
}

// Usage: Call ONCE at app start, use everywhere
const platform = getPlatformContract();
if (platform.canAccessIDE) {
  // Enable IDE features
} else {
  // Redirect to Notes
}
```

### Default Plugins by Platform

| Platform | Storage | Default Plugins |
|----------|---------|-----------------|
| **Desktop (FSA)** | File System Access | `filetree`, `monaco`, `chat` |
| **Desktop (IndexedDB)** | Browser Database | `filetree`, `notes`, `chat` |
| **Tablet** | Browser Database | `filetree`, `notes`, `chat` |
| **Mobile** | Browser Database | `notes` |

### IDE Access Policy

| Platform | IDE Access | Behavior |
|----------|-----------|----------|
| Desktop (FSA) | ✅ Full | Monaco + Terminal + FileTree |
| Desktop (IndexedDB) | ⚠️ Limited | FileTree + Notes only |
| Tablet | ❌ Blocked | Notes + Chat only |
| Mobile | ❌ Blocked | Notes + Chat only |
```

---

### Phase 1B: BYOK & Notes (Critical Additions)

#### 1. TanStack AI SDK Integration

```markdown
## TanStack AI SDK Integration

### Integration Requirements

**ALL LLM calls must use TanStack AI SDK** with provider-specific adapters.

### Provider Adapters

#### First-Tier Support (Full Feature Parity)

| Provider | Latest Models | Notes |
|----------|---------------|-------|
| **Google Gemini** | 3.0 Pro / 3.0 Flash (Jan 2026) | First-tier, image preview variants |
| **OpenRouter** | 400+ models | OpenAI-compatible endpoints |
| **OpenAI** | GPT-5.1-Codex-Max (Nov 2025) | Standard OpenAI API |
| **Anthropic** | Claude Sonnet 4.5, Claude Opus 4.5 | Standard Claude API |

#### Second-Tier Support (Basic Integration)

| Provider | Notes |
|----------|-------|
| **Grok** | Basic completion only |
| **Ollama (Local)** | Local model serving |

### Provider Integration Requirements

All providers must support:
- Multimodal input/output (text, images, audio, video)
- Embedding endpoints (if available)
- Model auto-loading
- All supported parameters per model:
  - Max tokens
  - Thinking variants
  - Streaming thinking
  - Native tool calling
  - Token caching

### Integration Guidelines

1. **TanStack AI SDK First**: All LLM calls must use TanStack AI SDK with provider-specific adapters
2. **No Direct Provider Calls**: Direct calls to provider packages are prohibited
3. **Fallback Chain**: Implement provider → model fallback with graceful degradation
4. **Secure Key Distribution**: Keys passed reactively only to required endpoints

### Project-Scoped BYOK Configuration

BYOK configuration is **project-scoped** and stored per project in Dexie. All LLM integrations must route through TanStack AI SDK.

**Integration Points:**
- Route: `/$projectId` (no separate `/setting` route)
- Configuration stored per project
- Keys securely persisted and conditionally distributed
```

---

### Phase 2: Chat Cascade, Threads, Agents (Critical Additions)

#### 1. Chat Cascade Plugin

```markdown
## Chat Cascade Plugin

### Plugin Responsibilities

The chat cascade is an **always-loaded plugin** with these responsibilities:
- Agent orchestration and coordination
- Thread management (project-scoped)
- RAG context indexing
- Multi-format block rendering
- Streaming conversation display

### Thread Architecture

Threads are **project-scoped** conversation contexts:

```
Project
    └─→ Threads (indexed by project ID)
        ├─→ Main Thread (user conversation)
        ├─→ Sub-threads (agent delegations)
        └─→ Compaction Threads (auto-generated at 90% context limit)
```

### Context Management

**Context Window:**
- Default limit: 150K tokens
- Auto-compaction at 90% threshold (135K tokens)

**Compaction Process:**
1. Trigger when context reaches 90%
2. Run sub-agent to condense conversation turns
3. Filter irrelevant/contextual information
4. Generate new thread with recapped context
5. Preserve file path references for linking

### Multi-Format Block Rendering

The chat interface renders diverse content types:

| Content Type | Rendering | Notes |
|--------------|-----------|-------|
| Code blocks | Syntax highlighted, copyable | Monaco integration |
| Rich text | Tables, diagrams, markdown | Block-based rendering |
| HTML artifacts | Embedded components | Interactive content |
| Streaming tokens | Real-time display | Thinking/reasoning |
| Tool outputs | Collapsible, status-coded | Success/failure indicators |
| File references | Clickable paths | `@` mentions with context |

### Bi-Directional References

**File-to-Chat References:**
- `@filename` - Include entire file
- `@folder/` - Include all child files
- Selected text in Monaco - Include as context

**Chat-to-File Operations:**
- Insert AI output as new file
- Insert at cursor position
- Copy to clipboard
```

---

#### 2. Agent System Architecture

```markdown
## Agent System Architecture

### Orchestrator Pattern

The agent system follows a **hierarchical orchestrator pattern**:

```
User Input
    ↓
Orchestrator/Coordinator (read-only tools only)
    ├─→ Mode Switching (to domain-specific agent)
    └─→ Task Delegation (to sub-agents with isolated context)
```

#### Orchestrator Responsibilities

- Conversational, user-guidance oriented
- Context detection and task decomposition
- Uses only read-related tools:
  - `read-files`, `grep`, `glob`, `list-files`
  - `todowrite`, `todoread`, `question`
  - `switch-mode`, `delegate-tasks`

#### Domain-Specific Agents

Agents have focused tool groups and domain-specific system instructions:

| Agent Type | Tools | Use Case |
|------------|-------|----------|
| **dev-ext** | File CRUD, bash, task | Code implementation |
| **architect-ext** | Design docs, review | Architecture decisions |
| **analyst-ext** | Research, analysis | Requirements gathering |
| **ux-designer-ext** | UI/UX design | Interface design |
| **tech-writer-ext** | Documentation | API docs, guides |

### Tool Permission Matrix

| Agent Type | write | edit | bash | task | Notes |
|------------|-------|------|------|------|-------|
| **real-world-validator** | true | false | browser | true | Testing only |
| **dev-ext** | true | true | limited | true | Implementation |
| **architect-ext** | false | design | false | true | Architecture docs |
| **analyst-ext** | false | false | false | true | Research only |
| **ux-designer-ext** | false | false | false | true | Design only |

### Tool Approval

- Per-agent permission controls: `ask`, `allow`, `deny`
- Critical tools require explicit user approval
- Permission changes tracked and auditable

### Agentic Cycle

Reference: [TanStack AI Agentic Cycle](https://tanstack.com/ai/latest/docs/guides/agentic-cycle)

**Key Patterns:**
- Sequential tool execution with state
- Conditional branching based on tool results
- Error handling with retry strategies
- Context management and compaction
```

---

### Phase 3: Advanced Patterns (Critical Additions)

#### 1. Cross-Plugin Communication

```markdown
## Cross-Plugin Communication

### Plugin-to-Plugin Messaging

Plugins must communicate through defined interfaces:
- Event bus for cross-plugin notifications
- Shared state for coordinated operations
- File reference passing between plugins

### Multi-Agent Coordination

Advanced patterns for multi-agent scenarios:
- Handoff patterns with context transfer
- Multi-agent consensus mechanisms
- Priority-based execution scheduling
- Conflict resolution for concurrent operations
```

---

#### 2. Advanced Tool Patterns

```markdown
## Advanced Tool Patterns

### Tool Permission Granularity

| Permission Level | Scope | Examples |
|----------------|------|----------|
| **CRUD Toggle** | Per workspace | File write, file delete, project modify |
| **File-Level** | Per agent operation | Read specific file, write specific file |
| **Approval-Based** | Per critical operation | Destructive operations require approval |

### Advanced Agentic Patterns

| Pattern | Description |
|---------|-------------|
| **Handoff** | Agent A → Handoff → Agent B (new context transfer) |
| **Context Transfer** | Preserve context across agent handoffs |
| **Multi-Agent Consensus** | Multiple agents agree on action |
| **Error Recovery** | Fallback strategies when agents fail |

### RAG Advanced Features

- Reranking for search results
- Metadata filtering
- Hybrid retriever optimization
- Per-project RAG index management
```

---

## Feature Overlap/Conflicts

### 1. Plugin System vs Workspace Architecture (CONFLICT)

**Conflict:** The PRD describes workspace architecture while new fundamental truths require plugin system.

**Impact:** Direct conflict in architectural direction.

**Resolution Required:**
- ❌ **REMOVE** all workspace architecture references
- ✅ **REPLACE** with plugin system architecture
- ✅ **HARMONIZE** routes to support plugin loading
- ⚠️ **WARNING** This is a fundamental architectural shift requiring comprehensive PRD rewrite

---

### 2. BYOK Route Location (CONFLICT)

**Conflict:** PRD references `/setting` route for BYOK, while new fundamental truths state BYOK is per project accessible from `/$projectId`.

**Impact:** Conflicting routing model.

**Resolution Required:**
- ❌ **REMOVE** references to `/setting` route
- ✅ **REPLACE** with project-scoped BYOK configuration description
- ⚠️ **CLARIFY** that BYOK is integrated into `/$projectId` route, not a separate page

---

### 3. Agent System Description (INCOMPLETE)

**Conflict:** PRD mentions agent factory and tools, but lacks detailed orchestrator pattern and permission matrix.

**Impact:** Insufficient guidance for Phase 2 development.

**Resolution Required:**
- ✅ **EXPAND** agent system architecture section
- ✅ **ADD** orchestrator pattern description
- ✅ **ADD** domain-specific agents documentation
- ✅ **ADD** tool permission matrix
- ✅ **ADD** agentic cycle pattern
- ✅ **REFERENCE** TanStack AI SDK documentation (Tools Guide, Tool Architecture, Server Tools, Client Tools, Tool Approval, Agentic Cycle, Dev Tools, Structured Outputs, Streaming, Multimodal Content, Observability)

---

### 4. State Scoping Inconsistencies (CONFLICT)

**Conflict:** PRD mentions composite key pattern `[projectId+workspaceId]` but implementation details are inconsistent.

**Impact:** Ambiguous state management guidance.

**Resolution Required:**
- ✅ **CLARIFY** composite key pattern for all workspace-scoped state
- ✅ **STANDARDIZE** state cleanup on workspace switch
- ✅ **SPECIFY** that all workspace state MUST use composite key `[projectId+workspaceId]`
- ⚠️ **WARNING** Inconsistent state scoping will cause bugs and race conditions

---

## Summary of Critical Gaps

### By Priority

| Priority | Gap | Phase | Impact |
|----------|------|--------|--------|
| **P0** | Plugin system architecture completely missing | Phase 1A | Cannot implement plugin system without guidance |
| **P0** | TanStack AI SDK integration missing | Phase 1B | BYOK architecture fundamentally broken |
| **P0** | Route structure incompatible with new architecture | Phase 1A | Cannot implement project-centric routing |
| **P0** | Project-centric vs workspace-centric shift not reflected | Phase 1A | PRD describes outdated architecture |
| **P0** | Chat cascade and thread management missing | Phase 2 | Cannot implement advanced chat features |
| **P0** | Agent orchestrator pattern missing | Phase 2 | Cannot implement hierarchical agent system |
| **P1** | Platform-specific requirements incomplete | Phase 1A | Platform detection and default plugins underspecified |
| **P1** | StorageGateway abstraction details missing | Phase 1A | Storage layer guidance insufficient |
| **P1** | State management boundaries incomplete | Phase 1A | State scoping and cleanup unclear |
| **P1** | Tool permission matrix missing | Phase 2 | Cannot implement granular permissions |
| **P2** | Advanced agentic patterns missing | Phase 3 | Cannot implement multi-agent coordination |

---

## Recommendations

### Immediate Actions (P0 - Blockers)

1. **Create PRD v2.0.0** that aligns with new-fundamental-truths.md v2.0.0
2. **Remove all workspace-centric architecture references** and replace with project-centric plugin system
3. **Add comprehensive plugin system architecture section** with FeaturePlugin interface, registry, and two always-loaded plugins
4. **Add TanStack AI SDK integration section** with provider adapters, fallback chains, and multimodal requirements
5. **Document platform-aware routing** with PlatformContract interface and single `/$projectId` route
6. **Add chat cascade plugin section** with thread architecture, context management, and multi-format rendering
7. **Add agent system architecture section** with orchestrator pattern, domain-specific agents, tool permission matrix, and agentic cycle
8. **Document storageGateway abstraction** with FSAGateway, IDBGateway, and factory pattern
9. **Clarify state management boundaries** with composite key pattern, event-driven updates, and workspace switch cleanup
10. **Remove deprecated content** (workspace routes, `/setting` route, LocalStorage references)

### Medium-Term Actions (P1 - Alignment)

1. **Phase-by-phase feature breakdown** - Document each phase (1A, 1B, 2, 3) with clear feature requirements
2. **Platform-specific requirements** - Add detailed platform detection, default plugins, and layout modes per device type
3. **Generative AI features** - Distinguish between individual AI features (Note Plugin) and agent-driven features (Chat Plugin)
4. **Advanced patterns documentation** - Add cross-plugin communication, multi-agent coordination, and advanced tool patterns
5. **Update all user journeys** - Rewrite 7 user journeys to reflect project-centric architecture and plugin system
6. **Update success metrics** - Add phase-specific metrics and acceptance criteria

### Long-Term Actions (P2 - Completeness)

1. **Cross-phase integration** - Document how phases 1A, 1B, 2, and 3 build on each other
2. **RAG advanced features** - Add reranking, metadata filtering, and hybrid retriever optimization
3. **Multi-agent consensus** - Document consensus mechanisms and conflict resolution
4. **Handoff patterns** - Add context transfer and handoff workflows
5. **Update technical architecture section** - Reflect all new architectural decisions from new fundamental truths

---

## Evidence and References

### Documents Analyzed

| Document | Version | Date | Purpose |
|----------|---------|------|---------|
| **prd.md** | 1.1.0 | 2026-01-22 | Current product requirements document |
| **new-fundamental-truths.md** | 2.0.0 | 2026-01-25 | Core architecture principles v2.0.0 |
| **docs/the-3-phase-approach.md** | N/A | 2026-01-26 | 3-phase roadmap skeleton |
| **epics.md** | 2.2.0 | 2026-01-16 | Current epic and story definitions |
| **architecture.md** | 2.1.0 | 2026-01-16 | Current architecture document |

### Key ADR References

| ADR | Status | Key Decisions | PRD Alignment |
|-----|--------|---------------|----------------|
| **ADR-033** | APPROVED | Platform detection, FSA persistence, Notes storage, Project structure | ⚠️ Partially aligned |
| **ADR-034** | APPROVED | 31 infection points, FSA handle unification, State scoping, Route loading, Platform guards | ⚠️ Not reflected |
| **ADR-035** | APPROVED | Entity model, storage boundaries, P0 bugs, Chrome 129+ detection | ⚠️ Not reflected |

---

## Conclusion

The current PRD (version 1.1.0) is **significantly misaligned** with the new fundamental truths (version 2.0.0) and requires comprehensive updates to reflect:

1. **Project-centric architecture** (replacing workspace-centric)
2. **Plugin system architecture** (completely missing)
3. **TanStack AI SDK integration** (major gap)
4. **Platform-aware routing** (incomplete)
5. **Chat cascade and thread management** (completely missing)
6. **Agent orchestrator pattern** (incomplete)
7. **State management boundaries** (underspecified)
8. **Phase-by-phase feature breakdown** (not structured)

**Estimated Effort for PRD Update:** 40-60 hours (1-2 weeks)

**Priority:** **P0 BLOCKER** - Cannot proceed with phase implementation without updated PRD

**Next Steps:**
1. Create comprehensive PRD rewrite plan
2. Coordinate with product manager for PRD v2.0.0 scope
3. Align PRD updates with new fundamental truths v2.0.0
4. Update all user journeys to reflect project-centric architecture
5. Document plugin system architecture comprehensively
6. Add TanStack AI SDK integration requirements
7. Structure PRD by phase (1A, 1B, 2, 3) for clarity

---

**Report Generated:** 2026-01-26T16:30+07:00
**Analyst:** analyst-ext (subagent)
**Session:** 2026-01-26
**Status:** COMPLETE
