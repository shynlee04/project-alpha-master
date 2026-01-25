---
title: "New Fundamental Truths - Core Architecture Principles"
version: "2.0.0"
status: "ACTIVE"
created: "2026-01-25"
last_updated: "2026-01-25"
author: "User (Product Owner), Architect Agent"

related_adrs:
  - "ADR-034: Project-Centric Architecture with Feature Plugins"
  - "ADR-034-AMENDMENT-001: Platform-First Plugin Selection"

phase_status:
  epics:
    - id: "EPIC-ARCH-01"
      name: "Foundation"
      status: "COMPLETE"
      completed: "2026-01-20"
    - id: "EPIC-ARCH-02"
      name: "Feature Plugins"
      status: "COMPLETE"
      completed: "2026-01-21"
    - id: "EPIC-ARCH-03"
      name: "Layout System & UX"
      status: "IN_PROGRESS"
    - id: "EPIC-ARCH-04"
      name: "Cleanup & Migration"
      status: "PENDING"

key_definitions:
  platform: "Device type (desktop, tablet, mobile) determining available capabilities"
  project: "Single source of truth containing files, folders, and project-level configuration"
  plugin: "Self-contained feature module that renders into layout slots"
  thread: "Conversation context tied to a project ID for RAG and agent interactions"

---

# Core Architecture Principles

> **Document Purpose**: This document establishes the fundamental truths and guiding principles for the project-centric architecture. All implementation decisions must align with these principles.

## 1. Project-Centric Architecture

The architecture has shifted from **workspace-centric** to **project-centric** model. This fundamental change impacts every aspect of the application and requires systematic migration of all related systems.

### 1.1 The Project-Centric Mental Model

| Aspect | BEFORE (Workspace-Centric) | AFTER (Project-Centric) |
|--------|---------------------------|------------------------|
| **Route Structure** | `/ide/$projectId` → `/notes/$projectId` | Single `/$projectId` route |
| **State Management** | Duplicated per workspace | Single source of truth per project |
| **Feature Rendering** | Workspace determines features | Platform determines available plugins |
| **User Experience** | User selects "workspace mode" | Platform shows available tools |

### 1.2 Route Structure

The application has exactly **two routes**:

```
/hub                      # Project management, no project loaded
/$projectId               # Project loaded with feature plugins
```

**Key Principles:**
- All deprecated routes redirect to `/$projectId`
- No query parameters for "layout mode" (e.g., `?layout=ide`)
- Platform determines which plugins are available, not user-selected modes

### 1.3 Project ID and Routing

**Project ID is NOT:**
- Workspace-specific prefixed or suffixed
- Tied to a particular plugin or feature
- Modified based on device type

**Project ID IS:**
- A unique identifier for the entire project
- Consistent across all plugins within the project
- The anchor for threads, RAG indices, and project-level settings

### 1.4 Platform-Aware Default Plugins

Each platform type has platform-appropriate defaults. This replaces the "IDE mode" vs "Notes mode" concept.

| Platform | Storage | Default Plugins | Notes |
|----------|---------|-----------------|-------|
| **Desktop (FSA)** | File System Access | `filetree`, `monaco`, `chat` | Full development experience |
| **Desktop (IndexedDB)** | Browser Database | `filetree`, `notes`, `chat` | Notes-focused, no real files |
| **Tablet** | Browser Database | `filetree`, `notes`, `chat` | Max 2 panels |
| **Mobile** | Browser Database | `notes` | Single panel, chat via sidebar |

**Default Layout Modes by Platform:**

| Platform | Default Layout | Max Columns |
|----------|---------------|-------------|
| Mobile | 1-column | 1 |
| Tablet | 2-column | 2 |
| Desktop | 2-column | 3 |

---

## 2. Device Architecture Separation

### 2.1 Desktop (FSA - File System Access API)

**Characteristics:**
- Real files on disk via native file system
- Bidirectional sync with external editors
- Full IDE capabilities (Monaco, Terminal)
- Handle persistence in IndexedDB (not file system)

**Requirements:**
- Chrome 122+ for persistent permissions
- FileSystemObserver (Chrome 129+) for file watching with polling fallback

### 2.2 Mobile/Tablet (IndexedDB via Dexie.js)

**Characteristics:**
- Virtual files in browser database
- No external editor sync needed
- IDE features blocked (Monaco, Terminal unavailable)
- Single source of truth (no sync conflicts)

**Requirements:**
- Dexie.js for persistence
- Single default project (`notes:browser-mode`)
- Fallback to Note-taking only

### 2.3 IDE Access Policy

| Platform | IDE Access | Behavior |
|----------|-----------|----------|
| Desktop (FSA) | ✅ Full | Monaco + Terminal + FileTree |
| Desktop (IndexedDB) | ⚠️ Limited | FileTree + Notes only |
| Tablet | ❌ Blocked | Notes + Chat only |
| Mobile | ❌ Blocked | Notes + Chat only |

---

## 3. Feature Plugin Architecture

### 3.1 FeaturePlugin Interface

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

### 3.2 Plugin Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **Always-Loaded** | Loaded in every project session | Project Management, Chat Cascade |
| **Optional** | User-selectable up to 5 total | Monaco, Notes, Terminal |
| **Platform-Restricted** | Only available on certain platforms | Terminal (desktop-only) |

### 3.3 The Two Always-Loaded Plugins

These plugins are mandatory for all sessions:

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

**Key Principles:**
- Threads are indexed and dependent on project ID
- Context window limit: 150K tokens (90% threshold for compaction)
- Compaction creates new thread with recapped, filtered context
- All threads date/time stamped with names and hierarchy

---

## 4. BYOK (Bring Your Own Key) Vault

### 4.1 Vault Architecture

The BYOK Vault is a **project-scoped** configuration system for API keys. All LLM integrations must route through TanStack AI SDK.

**Integration Points:**
- Route: `/$projectId` (no separate `/setting` route)
- Configuration stored per project
- Keys securely persisted and conditionally distributed

### 4.2 Supported LLM Providers

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

#### Provider Integration Requirements

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

### 4.3 Integration Guidelines

1. **TanStack AI SDK First**: All LLM calls must use TanStack AI SDK with provider-specific adapters
2. **No Direct Provider Calls**: Direct calls to provider packages are prohibited
3. **Fallback Chain**: Implement provider → model fallback with graceful degradation
4. **Secure Key Distribution**: Keys passed reactively only to required endpoints

---

## 5. Agent and Tool Architecture

### 5.1 Agent Orchestrator Pattern

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

### 5.2 Tool Architecture

#### Tool Types

| Type | Execution | Examples |
|------|-----------|----------|
| **Client Tools** | Browser-only | File read, glob, grep |
| **Server Tools** | Server/Edge | LLM calls, database ops |
| **Agent Tools** | Delegated | Complex multi-step tasks |

#### Tool Permission Matrix

| Agent Type | write | edit | bash | task | Notes |
|------------|-------|------|------|------|-------|
| **real-world-validator** | true | false | browser | true | Testing only |
| **dev-ext** | true | true | limited | true | Implementation |
| **architect-ext** | false | design | false | true | Architecture docs |
| **analyst-ext** | false | false | false | true | Research only |
| **ux-designer-ext** | false | false | false | true | Design only |

#### Tool Approval

- Per-agent permission controls: `ask`, `allow`, `deny`
- Critical tools require explicit user approval
- Permission changes tracked and auditable

### 5.3 Agentic Cycle

Reference: [TanStack AI Agentic Cycle](https://tanstack.com/ai/latest/docs/guides/agentic-cycle)

**Key Patterns:**
- Sequential tool execution with state
- Conditional branching based on tool results
- Error handling with retry strategies
- Context management and compaction

---

## 6. Chat Cascade and Thread Management

### 6.1 Thread Architecture

Threads are **project-scoped** conversation contexts:

```
Project
    └─→ Threads (indexed by project ID)
        ├─→ Main Thread (user conversation)
        ├─→ Sub-threads (agent delegations)
        └─→ Compaction Threads (auto-generated at 90% context limit)
```

### 6.2 Context Management

**Context Window:**
- Default limit: 150K tokens
- Auto-compaction at 90% threshold (135K tokens)

**Compaction Process:**
1. Trigger when context reaches 90%
2. Run sub-agent to condense conversation turns
3. Filter irrelevant/contextual information
4. Generate new thread with recapped context
5. Preserve file path references for linking

### 6.3 Multi-Format Block Rendering

The chat interface renders diverse content types:

| Content Type | Rendering | Notes |
|--------------|-----------|-------|
| Code blocks | Syntax highlighted, copyable | Monaco integration |
| Rich text | Tables, diagrams, markdown | Block-based rendering |
| HTML artifacts | Embedded components | Interactive content |
| Streaming tokens | Real-time display | Thinking/reasoning |
| Tool outputs | Collapsible, status-coded | Success/failure indicators |
| File references | Clickable paths | `@` mentions with context |

### 6.4 Bi-Directional References

**File-to-Chat References:**
- `@filename` - Include entire file
- `@folder/` - Include all child files
- Selected text in Monaco - Include as context

**Chat-to-File Operations:**
- Insert AI output as new file
- Insert at cursor position
- Copy to clipboard

---

## 7. Generative AI Features

### 7.1 Individual AI Features (Note Plugin)

These features operate **independently** of the chat cascade:

| Feature | Description |
|---------|-------------|
| **AI Commands** | Context-aware text generation |
| **Prompt Chains** | Sequential transformations |
| **Image Generation** | Context-aware visual creation |
| **Text Selection** | Selected text transformation |

**UX Patterns:**
- Markdown block-based rendering
- Rich media support (HTML, images, videos, presentations)
- Asset indexing for RAG compatibility
- PC and Non-PC parity

### 7.2 Agent-Driven Features (Chat Plugin)

These features operate **within the chat cascade** with full agent capabilities:

| Feature | Description |
|---------|-------------|
| **Orchestrated Tasks** | Multi-step agent operations |
| **Tool Execution** | CRUD operations via agents |
| **Context-Aware Generation** | File-aware AI responses |

---

## 8. State Management and Persistence

### 8.1 State Layers

| Layer | Technology | Purpose | Scope |
|-------|-----------|---------|-------|
| **Client State** | Zustand v5 | UI state, ephemeral data | Component tree |
| **Persisted State** | Dexie.js | Long-term storage | Project, settings |
| **File System** | FSA/IndexedDB | File content | Project files |

### 8.2 State Boundaries

**Clear Separation:**
- Zustand for client-only state (UI, interaction)
- Dexie for persisted data (projects, threads, settings)
- FSA for actual file content (desktop) or IndexedDB virtual files (mobile)

**Conflict Prevention:**
- Single source of truth per data type
- Event-driven updates between layers
- Optimistic updates with rollback

### 8.3 Persistence Strategy

**Desktop (FSA):**
- Handle stored in IndexedDB for persistence
- Minimize re-sync on project switch
- Snapshot strategy for fast load

**Mobile/Tablet (IndexedDB):**
- All data in Dexie.js
- No sync needed (single source)
- Offline-first by default

---

## 9. CRUD Permissions and Concurrency

### 9.1 Permission Model

| Actor | Permissions | Constraints |
|-------|-------------|-------------|
| **Human User** | Full CRUD | Subject to UI validation |
| **Agent** | Configurable per agent | Tool permission matrix |
| **System** | Auto-save, indexing | No user-facing CRUD |

### 9.2 Concurrency Handling

**Agent-Human Conflicts:**
- File locks during agent operations
- Visual indicators of agent activity
- Conflict resolution dialogs
- Rollback capabilities

**Multi-Agent Conflicts:**
- Task delegation isolation
- Shared context synchronization
- Priority-based execution

---

## 10. Research and Reference Links

### 10.1 TanStack AI Documentation

| Topic | URL |
|-------|-----|
| Tools Guide | https://tanstack.com/ai/latest/docs/guides/tools |
| Tool Architecture | https://tanstack.com/ai/latest/docs/guides/tool-architecture |
| Server Tools | https://tanstack.com/ai/latest/docs/guides/server-tools |
| Client Tools | https://tanstack.com/ai/latest/docs/guides/client-tools |
| Tool Approval | https://tanstack.com/ai/latest/docs/guides/tool-approval |
| Agentic Cycle | https://tanstack.com/ai/latest/docs/guides/agentic-cycle |
| Dev Tools | https://tanstack.com/ai/latest/docs/getting-started/devtools |
| Structured Outputs | https://tanstack.com/ai/latest/docs/guides/structured-outputs |
| Streaming | https://tanstack.com/ai/latest/docs/guides/streaming |
| Multimodal Content | https://tanstack.com/ai/latest/docs/guides/multimodal-content |
| Observability | https://tanstack.com/ai/latest/docs/guides/observability |

### 10.2 OpenCode Documentation

| Topic | URL |
|-------|-----|
| Agents | https://opencode.ai/docs/agents/ |
| Commands | https://opencode.ai/docs/commands/ |
| Skills | https://opencode.ai/docs/skills/ |
| Rules | https://opencode.ai/docs/rules/ |
| Permissions | https://opencode.ai/docs/permissions/ |
| Tools | https://opencode.ai/docs/tools/ |

---

## 11. Implementation Checklist

### 11.1 Architecture Alignment

- [ ] Single route `/$projectId` implemented
- [ ] No workspace-specific routes or query params
- [ ] Platform detection working correctly
- [ ] Platform-aware default plugins configured
- [ ] FeaturePlugin interface defined and implemented

### 11.2 Plugin System

- [ ] Two always-loaded plugins functioning
- [ ] Plugin registry implemented
- [ ] Plugin layout system operational
- [ ] Maximum 5 plugins per project (2 always-loaded + 3 optional)
- [ ] Plugin CRUD permissions configured

### 11.3 BYOK Vault

- [ ] TanStack AI SDK integration complete
- [ ] Provider support: Gemini, OpenRouter, OpenAI, Anthropic
- [ ] Secure key storage implemented
- [ ] Fallback chain working
- [ ] No direct provider package calls

### 11.4 Agent System

- [ ] Orchestrator pattern implemented
- [ ] Domain-specific agents defined
- [ ] Tool permission matrix configured
- [ ] Agentic cycle following TanStack patterns
- [ ] Sub-agent delegation working

### 11.5 Thread Management

- [ ] Project-scoped threads implemented
- [ ] Context window limit (150K tokens)
- [ ] Auto-compaction at 90% threshold
- [ ] Multi-format block rendering
- [ ] Bi-directional file references

### 11.6 State and Persistence

- [ ] Zustand/Dexie boundaries clear
- [ ] Desktop FSA handling complete
- [ ] Mobile IndexedDB handling complete
- [ ] Event-driven sync working
- [ ] No state duplication

---

## 12. Glossary

| Term | Definition |
|------|------------|
| **FSA** | File System Access API (Desktop) |
| **Platform** | Device type (desktop, tablet, mobile) |
| **Plugin** | Self-contained feature module |
| **Project** | Single source of truth for files/settings |
| **Thread** | Conversation context tied to project |
| **RAG** | Retrieval-Augmented Generation |
| **BYOK** | Bring Your Own Key (API vault) |
| **Orchestrator** | Agent coordinator with read-only tools |

---

*Last Updated: 2026-01-25*
*Version: 2.0.0*
*Related: ADR-034, ADR-034-AMENDMENT-001*
---

# RAW VERSION

------

# **Core Centralized Groups (User Flow Management):**

## 1. Project-centric - with plugins enabled

with this complete shift to project-centric (instead of workspace-centric like before - there are many knock-on impacts that require revamps, upgrade and adapting to these - or else nothing works, and producing bugs and false errors if these fundamental entities are not migrated and changed along-side (these are just a few as I thought of - please investigate deeply to have the full-scopes of what need addressing here):

1. ID of the project vs routing → id IS NOT SET INTO ~~workspace-specific prefix or suffixes~~    ; ids are representations of A PROJECT and all its children files and sub-folders (THIS WILL RESULT IN THESE **ISSUES** >>
    1. for PC-USERS → how do we handle users creating projects which are children of another-already-created-project folder
    2. for NON-PC-USERS → yet we are all aware that `ide-related-plugins` are not loaded for `Non-pc-entries` → for other features like `notion-like-note` and `knowledge-synthesis` and `rag-related` features which pretty much involve with other file types and hierarchical set up to ensure `NON-PC-Clients` do not have to compromise too much of the provided features → HOW do we manage this?
    3. Design of the `plugins` → these need to be extremely well-thought-out in terms of the complexity mentioned above and below - plus the layout and designs of ux ui to fit `progressive disclosure patterns` concepts. AND Please remember the following
        1. **THE TWO-ALWAYS-LOADED-PLUGINS** ARE (as for phone or portrait screen make it tabbed button):
            1.  The `project management`  plugin (the one with filetree, project switcher, creation, files CRUD, database and RAG management) 
            2. The `agent chat cascade + thread management` plugin - connecting agents + tools and the ecosystem of them - to thread managements for RAG that are indexed and are dependent on the project (take the project id as anchor - so meaning when switching project → the persistent threads are changed too → this approach lessens the confusions of conversation drift to non-related project
        2. plugins are various in features, responsibilities and provided capabilities → so be carefully with data mapping and api contracts as these increase when loaded together (up-to-5 in desktops including the 2-always-loaded ones - there are 3 multiplication of variants in the total number of plugins) → these must be really ultrathink for this matter
2. Project storage types vs. client’s device 
    1. → finalize on file system for PC users (if dexiedb exists for PC users - they are the supportive persistent layer to help with indexing and reduce resynchronization every time users switch between projects) → think of all the edge cases above + handle states, persistent and hot load reactive for this as for eventbus + autosave + CRUD vs. files synchronization for large project (it will be a nightmare if every time 1000+ files need resynchronizing from beginning → so think of the solutions)
    2. → as for NON-PC users → finalize of using browserdb → but as issues I have mentioned in 1 → I feel this is not enough
3. Handling of States vs. Store vs. Persistence vs. Hooks and all of the conflicts calls (and later indexed, query and RAG??? - those that belongs to Zustand, ReAct, Dexiedb, indexdb, fsa, eventemitter etc) → if these are not regulated and mapped out from the begging - a collapsing chains of runtime errors and those similar types of errors will get stacked up as the complexity of `plugins`
4. Consolidate and remake the project creation + revamp the navigation (both ux and ui) and if necessary eliminate those that cause conflicts and confusion and create new ones for this new architecture
5. The rest of the matrix of complexity when counting CRUD permissions (for both clients and agents using tools), RAG features, Multimodality input and output and the edge cases — those will be discussed in much details after the next section.

## **2. BYOK (Bring Your Own Key) Vault:**

This is originally routed at `/setting` → configure, save API keys of different API of LLMs providers → persistent and secured per provider → to reactive and initiate at any route, interfaces, features that relate to `ai generative multimodality features`, `agents features`, `agents and tools features`, `multimodality input and output`, `RAG and embedding features` → this BYOK Vault must (and should though currently still many conflicts and not following these requirements, but after this [`fundamental-truth-check-list.md`](http://fundamental-truth-check-list.md) get updated you should also conduct an `ADR-034-Extensions-xx` → address each section of these (consolidate, migrate, and archive legacy, removing poinsoned context):

1. Go through Tanstack AI SDK and its provider-specific-package → so any feature that makes direct call or using LLMs’ providers’ packages instead of the Tanstack AI ones are all wrong)
2. Support these providers (must be fully supported meaning all endpoints of multimodality for input and output, embedding (if provided), models auto-loading, all supported parameters per models - such as max token, thinking variant , streaming thinking, native tools calling, tokens caching; and so many more, and so differences per model capabilities, per providers — conduct thorough research of 2026-01-25 for such matter):
    1. Google Gemini - first tier support (latest models at 3.0 variants)
    2.  Openrouter - equally first tier support - using OpenAI-Compatible settings (support all models) → From this allowing  SUPPORT FOR ANY `Providers` that are uisng OpenAI-Compatible formats (of the end points format - meaning users only need to input few required parameters like base URL and API key to activate full support as Openrouter → check with [chutes.ai](http://chutes.ai) ; and this is one LLM at chutes.ai as an example https://chutes.ai/app/chute/1c2b2bd7-afdd-5248-9a73-938d55f03dcd?tab=api 
    3. OpenAI and Anthropic - equally first tier support (latest of OpenAI is GPT 5.2 variants, Anthropic is at Claude 4.5 for both Sonnet, Opus and Haiku variants)
    4. Grok and local Ollama - equally second tier supports
3. Make sure these integrate and initiated correctly throughout the app/project - only when needed and make correct integration to models vs. providers vs. endpoints with fallback 
4. These below entities need to get upgrade/reengineer  and rearchitect alongside - to reduce confusion, fragment, conflict, overlapping and bug-prone implementations
    - these are more elaborated in the below sections
5. Securely persist and conditionally distribute keys to various provider endpoints and use cases.

## 3. Agents vs. tools (CRUD permissions, feedback loops, agentic patterns) vs. context-aware vs. configurations

before delving deep into agents and their ecosystem of tools (CRUD and executions to `plugins' environments` - its client-side vs server-side tools, vs. orchestrator and modes switching vs. system instruction prompts and the context - different plugins loaded - where these are used) → these articles and documents of Tanstack AI needs to deeply ingested and synthesized to understand advanced concepts when developing these into this project)

```markdown
#### Agents = orchestrator/coordinator - either switch modes or delegate to sub-agents

in the previous architecture - these similar concepts are thought of and put in code
but they have not fully implemented. The ideas are as below:

1. at any thread started -> always start with the `orchestrator/coordinator` mode - this mode system instruction:
are purely : "conversational, user-guidance, context-detector, tasks and sub-tasks coordinator, monitor
gatekeeping and so on" -> can only use read-related tools (such as `read-files`, `grep`, `glob`, `list-files`. 
And the task-managing tools like `todowrite`, `todoread`, and `question` . As well as `switch-mode` and `delegate-tasks`(the tools will be redesigned but
I base the concepts similar to `open-code: @https://opencode.ai/docs/tools/`. Apart from the allowed tools as above 
the main responsibilities of the orchestrator as said:

- start the conversatation with users + guide and detect the users' intention (instructed through orchestrator's system instruction)
- base on these factors a. plugins loaded; b. the conversation with users and their intentions; c. the project context by previous uses of grep, glob, read files tools -> decide to
a. update todo tasks -> switch to another mode `switch-mode` (mode are domain-specific agent, it can use all tools (as long as users set permissions) but each will come with their "focusing tools group" as well as its domain-specific `system-instruction` - option `switch-mode` will use the same context of the thread
b1. update todo tasks -> decide delegations to sequential sub-agents `delegate-tasks` (unlike the above when `orchestrator` detect complex, multi-step tasks from the above -> it will need to delegate to multiple sequential sequences of `tasks` of which each `delegation` is meticulously prepared with context + assignments + requirements + acceptance criteria and todo check list - to assign to a domain-specific agent working in a monitored seperate dependent thread with isolated context)
b2. first delegation completion with in-chat (last assistant message from the depedent child thread and/or handoff document) -> orchestrator will base on the return results to coordinate the next

---

The above wrap up how we are going to redesign the `Agents` system - in short domain-specific agents/modes are builtin -> meaning for MVP we do not allow `customized` agents and for such the system can be more strategically revamped and migrated.
The configurations are more comprehensive, refactored and centralized -> only allowing these configuration per agent: AI Providers + models (BUT restricted to those with matched capabilities only); per tool permissions (beware permissions mean each can toggle between `ask`,`allow` and `deny`.
READ MORE OF OPENCODE CONCEPTS TO LEARN FROM ITS AGENTS, AGENTS SKILLS, Commands, Rules, Permissions Concepts (Check if these help you with more fine-tuning ideas for our project's approach): 
- https://opencode.ai/docs/agents/ ; 
- https://opencode.ai/docs/commands/; 
- https://opencode.ai/docs/skills/; 
- https://opencode.ai/docs/rules/;
- https://opencode.ai/docs/permissions/

---

####  Tools, Tools architecture, Types of tools

basically for tools they are of various types (and as you can search in the codebase - though the tools there are not
totally accurate; but they should give you some concepts toward these. Tools are
decided to use by agents given the context of what-plugins-loaded; the current thread;
and the nature. These should be design and implement based on `complexity-layering` and `per-tool-tested` -> but I think the list of above taken from `OpenCode` https://opencode.ai/docs/tools/ a

- https://tanstack.com/ai/latest/docs/guides/tools
- https://tanstack.com/ai/latest/docs/guides/tool-architecture
- https://tanstack.com/ai/latest/docs/guides/server-tools 
- https://tanstack.com/ai/latest/docs/guides/client-tools
- https://tanstack.com/ai/latest/docs/guides/tool-approval

#### Agentic cycle

this is the only document contains agentic cycle https://tanstack.com/ai/latest/docs/guides/agentic-cycle 
though I feel Tanstack AI lacks pretty many agentic patterns compared to `AI SDK of Vercel` https://ai-sdk.dev/docs/introduction - though what prevent me from using AI-SDK is its lacking of client-side tooling system. And if we can resolve such short-comings of `AI-SDK version 6 of Vercel` - may be switching to it can give us an upperhand in designing more advanced agentic features

#### Dev tool and some other guides:
- https://tanstack.com/ai/latest/docs/getting-started/devtools
- https://tanstack.com/ai/latest/docs/guides/structured-outputs
- https://tanstack.com/ai/latest/docs/guides/streaming
- https://tanstack.com/ai/latest/docs/guides/multimodal-content
- https://tanstack.com/ai/latest/docs/guides/connection-adapters
- https://tanstack.com/ai/latest/docs/guides/observability
- https://tanstack.com/ai/latest/docs/guides/per-model-type-safety
- https://tanstack.com/ai/latest/docs/guides/runtime-adapter-switching
- https://tanstack.com/ai/latest/docs/guides/text-to-speech
- https://tanstack.com/ai/latest/docs/guides/transcription
- https://tanstack.com/ai/latest/docs/guides/image-generation
- https://tanstack.com/ai/latest/docs/guides/video-generation
- https://tanstack.com/ai/latest/docs/guides/tree-shaking
```

- And as the above section → require redesigns of `agent configuration` (both routing and the interface) → Should you also consider refactor this **IMPORTANT ISSUE** too of :
    - consolidating and refactored `endpoints` - even of the `individual ai-related features` as described below → I mean right now they are fragmented and hard to managed - creating another overlapping and confusing layer
- This section also shares substantial relationship with the next entity `Chat cascade and thread managements plugin`

### 4. Chat cascade and thread managements:

As many of the above sections and the below after this have elaborated and as you have learnt about the concepts - this is the `always-loaded-plugin` shows how important this is as this will follow these concepts principles:

- The multi-format-block-renderers and streamed conversation between user and the agents (showing which agent, their mode) → absolutely intuitive in many aspects as listed below:
    - absolute sign-postings → ux and ui-wise from blocks of rendering of different in-chat agents’ responses (of code block, rich-text format of tables, diagram, markdown conversion, html as artifacts, embedded contents, url, quoted content from files etc) → to even collapsible and streamed `thinking/reasoning` tokens if models provided → to ui supported for tools (each tool) returned result, indicating failure or success with returned values as instructions for agents agentic decisions
    - IS `context managed` per `conversation thread` (default limit at 150k tokens → when 90% of this reached → auto start a `new thread` with `recapped, filtered and compact context` → this is made available by making sure all activities that consume `context windows limit` from reading files, reading tools, in-chat responses etc are accurately measured and calculated → to when 90% context windows reached → run `compact` command → this command is actually a sub-agent run to condense major turns of the conversation + references to files and documents as file paths’ links while filtering out poisoned, irrelevant, inaccurate context → this will be then the conversation starter of the new thread
- `Threads`: these are indexed and dependent on the project id (meaning threads are indexed with meta data and frontmatter yaml - they are date and time stamped; with names and hierarchy (as orchestrator can delegate sub-agent in isolated context which is dependent sub-threads; they all belong to a particular project → meaning, not supporting cross-project RAG or those of the same concepts)
- Data mapping and relationships: as multiple concepts involve and impact to various `plugins` if loaded - during the session takes place in a thread → data mapping, contracts, states and persistence layer designs must take the following factors into consideration:
    - CRUD of agents vs. human user - as long as agents are given permissions → their tools executions definitely give CRUD operations on projects’ files, folders → result in a chain of synchronization, updates, event emitter etc
    - Think about bi-directional reference files’ context to the `casecade chat flow` → most platforms nowadays use `@` and path or file name to reference full context of a particular file, if used for a folder → all child files are used as context ; to reference partial context of a file → most platforms allow selected text on `monaco-editor` to have an option as `include selected text as context` → reference both text content and file path
    - think about the ease to create, copy, insert : the in-chat `block-output` from AI agent to the project new files, or insert to an opening file as the point of the cursor
- UX-UI wise : I Have included an image of `KiloCode UX` - and circle the 3 sections → you can learn from this to make a fluid, comprehensive and responsive ux and ui the support the above concepts

# The plugins - features related to agents, tools (CRUD and state), individual AI-generative features, RAG features VS. Plugins responsibilities and capabilities

### Generative individual AI-related features VS.  Agents using tools in `Chat cascade and in a thread`

These confusions and conflicts are on the-top-priority-list to address because of the following issues

**Generative individual AI-related features**: are the `note plugin` (yet apart form ai-related features - as for the block note features related to formats, rich-media content and embedding url or embedding rich-media contents as its core features are also important to taken to the architecture design for this `note plugin` can truly be functional as it should be) as for mainly these 2: 

1.  `insert +` `AI-commands` → depends of the command and the features ranging from `context-ware` text generation to sequential prompt-transformation to generate chains of `context-aware` images for example
2. `text selection` to `AI-commands` transformation → similar to the above approach but this is more like taking the `selected text or blocks` → transform with the commands

the above types of features are pretty much instantaneous and belong to `content-generation` group → advanced cases to think of:

1. as these notes are in markdown (dot md) and rendered per block -  how rich-media assets such as `html artifacts, images, presentations, videos`  are handled to not only rendered as in-line blocks but also work with the indexing, and the rest of our ecosystem - and for both `PC-USERS` and `NON-PC-USERS`

**Agents and tools in the `Chat cascade and thread management`**:  these are the pretty much explained in the above section - please refer to it

## Keywords check list (some of the below are no longer valid while many are still true - update and consider the new architecture)

1. **Client-Side Only:** Server interaction limited to LLM/API calls via browser.
2. **BYOK Implementation:** Use Tanstack AI SDK & Tanstack Start. Keys persisted in vault, reactively passed to agents.
3. **Project-Centric:** Multiple projects across workspaces (IDE, Notes - Knowledge/Study disabled for MVP). Unique Project IDs.
4. **Device Parity:** Desktop = FSA. Non-Desktop = IndexedDB (Dexie). **NO IDE on Non-Desktop.**
5. **Thread Management:** Chat cascade threads tied to Project ID and Workspace for RAG context.
6. **Consistent UX (State/Persistence):**
    1. FSA: Minimize compromise (persistent permissions, no reload/state loss). Handle non-MD file rendering in block notes.
    2. Non-Desktop: Prevent conflicts in RAG, agentic actions, and tool usage.
    3. CRUD Permissions: Prevent conflicts between agents and humans (esp. concurrent edits).
    4. RAG: Ensure conflict-free operation across environments.
    5. Multimodality: Prevent input/output access conflicts.
7. **Agent Permissions:** Control CRUD on files via tools.
8. **Rendering:** Support diverse file types and AI-generated content across workspaces and chat.
9. **State Management Boundaries:** Clearly define and connect Zustand (client state) and Dexie (persisted data) usage.
10. **Technical Hygiene:** Implement robust hooks, hydration, ID-based routing, and reactive persistence.
11. **Research:** Evaluate if DexieDB should augment FSA for persistence/reactivity. Refactor stores if needed.
12. **Edge Cases:** Address scenarios like agent CRUD operations during human file edits.
13. **Gap Analysis:** Identify and resolve any architectural or functional gaps.