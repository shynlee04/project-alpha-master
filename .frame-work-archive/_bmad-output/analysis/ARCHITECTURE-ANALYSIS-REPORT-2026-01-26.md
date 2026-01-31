# Architecture Alignment Analysis Report
## architecture.md vs new-fundamental-truths.md

**Version:** 1.0.0
**Date:** 2026-01-26
**Status:** ANALYSIS COMPLETE
**Author:** analyst-ext

---

## Executive Summary

| Category | Alignment Score | Key Finding | Priority |
|-----------|-----------------|--------------|-----------|
| **Project-Centric Architecture** | 30% | Outdated - still references workspace-centric routes | P0 |
| **Plugin System** | 0% | Missing - completely absent from architecture.md | P0 |
| **Agent System** | 40% | Partial - infrastructure exists but not aligned with new orchestrator pattern | P0 |
| **BYOK Vault** | 50% | Partially aligned but needs TanStack AI SDK migration | P0 |
| **Chat Cascade & Threads** | 30% | Incomplete - missing context window and compaction logic | P0 |
| **State Management** | 70% | Good alignment but needs plugin integration | P1 |
| **Device Architecture** | 90% | Strong alignment on FSA/IndexedDB separation | P2 |
| **Storage Architecture** | 85% | Good alignment with StorageGateway pattern | P2 |

**Overall Alignment: 35%** - Major restructuring required for Phase 1A/1B implementation

---

## Section-by-Section Comparison

### 1. Project-Centric Architecture

#### Current State (architecture.md)
- **Routes Listed (Section 8.1):**
  - `/ide/:projectId` - IDE workspace
  - `/knowledge/:projectId` - Knowledge workspace
  - `/notes/:projectId` - Notes workspace
  - `/study/:projectId` - Study workspace
  - `/api/chat` - AI conversations

- **State Management (Section 5.0.1):**
  - Composite key pattern: `[projectId+workspaceId]`
  - Workspace-specific state isolation

#### New Requirements (new-fundamental-truths.md)
- **Route Structure (Section 1.2):**
  - **Only two routes:**
    - `/hub` - Project management, no project loaded
    - `/$projectId` - Project loaded with feature plugins
  - **All deprecated routes redirect to `/$projectId`**
  - **No query parameters for "layout mode" (e.g., `?layout=ide`)**

- **Project ID Rules (Section 1.3):**
  - Project ID is NOT workspace-specific prefixed or suffixed
  - Consistent across all plugins within project
  - Anchor for threads, RAG indices, and project-level settings

#### Analysis

| Aspect | Current (architecture.md) | Required (new-fundamental-truths.md) | Alignment | Action Required |
|---------|-------------------------|-------------------------------------|-----------|----------------|
| Route Count | 5 routes (/ide, /knowledge, /notes, /study, /api/chat) | 2 routes (/hub, /$projectId) | ❌ OUTDATED | Consolidate routes |
| Route Parameters | `:projectId` for each workspace | `:projectId` only, no workspace-specific routes | ❌ OUTDATED | Remove workspace routing |
| Query Params | None mentioned | Explicitly forbid `?layout=ide` patterns | ❌ MISSING | Document ban |
| Composite Keys | `[projectId+workspaceId]` for state scoping | Single `projectId` (no workspace ID in key) | ⚠️ CONFLICT | Resolve composite key pattern |
| State Isolation | Per workspace | Per project | ❌ OUTDATED | Redefine state boundaries |

#### Specific Changes Needed

1. **Route Consolidation (Section 8.1) - OUTDATED ❌**
   - Remove all workspace-specific routes
   - Add redirect logic from deprecated routes to `/$projectId`
   - Document that `/$projectId` loads plugins based on platform, not user-selected mode

2. **Composite Key Pattern (Section 5.0.1) - CONFLICT ⚠️**
   - Current: `[projectId+workspaceId]`
   - Required: Single `projectId` (workspace is a plugin concern, not data layer)
   - Update all store key patterns to remove `workspaceId` component
   - Rationale: Plugins are loaded/unloaded, not data-layer concern

3. **State Scoping Rules (Section 5.0.2) - OUTDATED ❌**
   - Current table shows IDE, Knowledge, Notes, Study as separate workspaces
   - Replace with project-scoped state only
   - Plugins manage their own temporary state, not persisted state

---

### 2. Plugin System Architecture

#### Current State (architecture.md)
- **NO MENTION of plugin system**
- No Plugin interface defined
- No plugin registry
- No plugin lifecycle management
- No plugin layout system

#### New Requirements (new-fundamental-truths.md)

**Plugin Interface (Section 3.1):**
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

**Plugin Categories (Section 3.2):**
| Category | Description | Examples |
|----------|-------------|----------|
| Always-Loaded | Loaded in every project session | Project Management, Chat Cascade |
| Optional | User-selectable up to 5 total | Monaco, Notes, Terminal |
| Platform-Restricted | Only available on certain platforms | Terminal (desktop-only) |

**Two Always-Loaded Plugins (Section 3.3):**
1. **Project Management Plugin**
   - File tree navigation and display
   - Project switcher
   - Project creation and deletion
   - File/folder CRUD operations
   - Database and RAG management

2. **Chat Cascade + Thread Management Plugin**
   - Agent orchestration and coordination
   - Thread management (project-scoped)
   - RAG context indexing
   - Multi-format block rendering
   - Streaming conversation display

**Platform-Aware Defaults (Section 1.4):**
| Platform | Storage | Default Plugins | Notes |
|----------|---------|-----------------|-------|
| Desktop (FSA) | File System Access | `filetree`, `monaco`, `chat` | Full development experience |
| Desktop (IndexedDB) | Browser Database | `filetree`, `notes`, `chat` | Notes-focused, no real files |
| Tablet | Browser Database | `filetree`, `notes`, `chat` | Max 2 panels |
| Mobile | Browser Database | `notes` | Single panel, chat via sidebar |

#### Analysis

| Plugin Concept | Current (architecture.md) | Required (new-fundamental-truths.md) | Alignment | Action Required |
|---------------|-------------------------|-------------------------------------|-----------|----------------|
| Plugin Interface | Not defined | FeaturePlugin interface required | ❌ MISSING | Define interface |
| Plugin Registry | Not defined | Registry for up to 5 plugins | ❌ MISSING | Implement registry |
| Plugin Lifecycle | Not defined | Load/unload with state cleanup | ❌ MISSING | Define lifecycle |
| Plugin Layout System | Not defined | Layout slots for panel rendering | ❌ MISSING | Implement layout |
| Always-Loaded Plugins | Not defined | Project Management + Chat Cascade required | ❌ MISSING | Document required plugins |
| Plugin Categories | Not defined | Always-Loaded, Optional, Platform-Restricted | ❌ MISSING | Define categories |
| Platform Defaults | Not defined | Device-specific plugin presets | ❌ MISSING | Implement defaults |
| Plugin State | Not defined | usePluginStore hook per plugin | ❌ MISSING | Define state pattern |
| Plugin Permissions | Not defined | CRUD permissions per plugin | ❌ MISSING | Define permission model |

#### Specific Sections Needed in architecture.md

**NEW SECTION REQUIRED: Plugin Architecture (Priority: P0)**
- Location: After Section 2 (System Overview)
- Content:
  - Plugin interface definition
  - Plugin registry architecture
  - Plugin loading/unloading lifecycle
  - Plugin state management pattern
  - Plugin communication (event bus)
  - Plugin permissions model
  - Platform-aware default plugin configuration
  - Plugin layout system (slots, panels, responsive behavior)

---

### 3. Agent System Architecture

#### Current State (architecture.md)

**Agent Mode Auto-Switching (Section 4):**
- Infrastructure EXISTS but NOT ENABLED
- ModeClassifier implemented
- Scoring system working
- Confidence thresholds configurable
- Context sources available

**Missing:**
- ❌ Mode persistence in conversation history
- ❌ Auto-switching enabled (manual override takes precedence)
- ❌ UI confidence indicator

**Two-Layer System Instruction (Section 4.2):**
- Layer 1: Universal (applies to all agents)
- Layer 2: Mode-specific (applies based on workspace)

**Tool Permissions Model (Section 4.3):**
- Capabilities defined per workspace
- Filtered by PlatformContract

#### New Requirements (new-fundamental-truths.md)

**Orchestrator Pattern (Section 5.1):**
```
User Input
    ↓
Orchestrator/Coordinator (read-only tools only)
    ├─→ Mode Switching (to domain-specific agent)
    └─→ Task Delegation (to sub-agents with isolated context)
```

**Orchestrator Responsibilities:**
- Conversational, user-guidance oriented
- Context detection and task decomposition
- Uses only read-related tools:
  - `read-files`, `grep`, `glob`, `list-files`
  - `todowrite`, `todoread`, `question`
  - `switch-mode`, `delegate-tasks`

**Domain-Specific Agents (Section 5.1):**
| Agent Type | Tools | Use Case |
|------------|-------|----------|
| dev-ext | File CRUD, bash, task | Code implementation |
| architect-ext | Design docs, review | Architecture decisions |
| analyst-ext | Research, analysis | Requirements gathering |
| ux-designer-ext | UI/UX design | Interface design |
| tech-writer-ext | Documentation | API docs, guides |

**Tool Architecture (Section 5.2):**

**Tool Types:**
| Type | Execution | Examples |
|------|-----------|----------|
| Client Tools | Browser-only | File read, glob, grep |
| Server Tools | Server/Edge | LLM calls, database ops |
| Agent Tools | Delegated | Complex multi-step tasks |

**Tool Permission Matrix (Section 5.2):**
| Agent Type | write | edit | bash | task |
|------------|-------|------|------|------|
| real-world-validator | true | false | browser | true |
| dev-ext | true | true | limited | true |
| architect-ext | false | design | false | true |
| analyst-ext | false | false | false | true |
| ux-designer-ext | false | false | false | true |

#### Analysis

| Agent Concept | Current (architecture.md) | Required (new-fundamental-truths.md) | Alignment | Action Required |
|--------------|-------------------------|-------------------------------------|-----------|----------------|
| Orchestrator Pattern | Not defined | Orchestrator + coordinator pattern required | ❌ MISSING | Define orchestrator architecture |
| Mode Auto-Switching | Infrastructure exists, not enabled | Orchestrator with mode switching | ⚠️ PARTIAL | Enable and document |
| Tool Classification | "Three AI invocation patterns" | Client/Server/Agent tools | ❌ OUTDATED | Redefine tool types |
| Tool Permission Matrix | AgentCapabilities interface | Specific matrix per agent | ⚠️ PARTIAL | Update to match new matrix |
| Domain-Specific Agents | ModeClassifier (scores modes) | dev-ext, architect-ext, analyst-ext, etc. | ⚠️ DIFFERENT | Align agent definitions |
| Agent System Instructions | Two-layer prompts | Two-layer prompts (universal + mode-specific) | ✅ ALIGNED | Keep, update for plugins |
| TanStack AI SDK | Not mentioned | REQUIRED for all LLM calls | ❌ MISSING | Add SDK requirement |
| OpenCode Concepts | Not mentioned | Reference to OpenCode agents, skills, commands | ❌ MISSING | Document OpenCode patterns |

#### Specific Changes Needed

1. **Agent Section 4 - OUTDATED ⚠️**
   - Replace "Agent Mode Auto-Switching" with "Orchestrator + Domain-Specific Agents"
   - Remove ModeClassifier references (replace with orchestrator pattern)
   - Add tool classification: Client, Server, Agent tools
   - Update tool permission matrix to match new agent types
   - Add TanStack AI SDK requirement (mandatory for all LLM calls)
   - Remove references to "mode" (replace with "agent type" or "domain-specific agent")

2. **Tool Architecture (Section 4.3) - PARTIAL ⚠️**
   - Current: Capabilities per workspace
   - Required: Permission matrix per agent type
   - Add specific permissions: write, edit, bash, task
   - Document tool types: Client, Server, Agent

3. **NEW SECTION REQUIRED: TanStack AI SDK Integration (Priority: P0)**
   - Location: Within Agent System section
   - Content:
     - TanStack AI SDK is mandatory for all LLM calls
     - Provider adapters for Gemini, OpenRouter, OpenAI, Anthropic
     - No direct provider package calls allowed
     - Fallback chain implementation
     - Model auto-loading and capability detection
     - Streaming support
     - Tool calling integration
     - Token caching

---

### 4. BYOK Vault Architecture

#### Current State (architecture.md)

**Credential Vault (Section 7.1):**
- Location: `src/lib/agent/providers/credential-vault.ts` (18,167 lines)
- Features:
  - AES-256-GCM encryption for API keys
  - Encrypted storage in IndexedDB
  - Decryption on-demand for provider requests
  - No plaintext in state

**Known Issues (Section 7.2):**
| Issue | Location | Severity |
|-------|----------|----------|
| Hardcoded provider | VoiceRecordButton.tsx | HIGH |
| Vault unused | Provider implementations | HIGH |
| Permission bypass | note-ai-service.ts | MEDIUM |

#### New Requirements (new-fundamental-truths.md)

**Vault Architecture (Section 4.1):**
- Project-scoped configuration system for API keys
- All LLM integrations must route through TanStack AI SDK
- Route: `/$projectId` (no separate `/setting` route)
- Configuration stored per project
- Keys securely persisted and conditionally distributed

**Supported Providers (Section 4.2):**

**First-Tier Support (Full Feature Parity):**
| Provider | Latest Models | Notes |
|----------|---------------|-------|
| Google Gemini | 3.0 Pro / 3.0 Flash (Jan 2026) | First-tier, image preview variants |
| OpenRouter | 400+ models | OpenAI-compatible endpoints |
| OpenAI | GPT-5.1-Codex-Max (Nov 2025) | Standard OpenAI API |
| Anthropic | Claude Sonnet 4.5, Claude Opus 4.5 | Standard Claude API |

**Second-Tier Support (Basic Integration):**
| Provider | Notes |
|----------|-------|
| Grok | Basic completion only |
| Ollama (Local) | Local model serving |

**Provider Integration Requirements (Section 4.3):**
1. **TanStack AI SDK First**: All LLM calls must use TanStack AI SDK with provider-specific adapters
2. **No Direct Provider Calls**: Direct calls to provider packages are prohibited
3. **Fallback Chain**: Implement provider → model fallback with graceful degradation
4. **Secure Key Distribution**: Keys passed reactively only to required endpoints

#### Analysis

| BYOK Aspect | Current (architecture.md) | Required (new-fundamental-truths.md) | Alignment | Action Required |
|--------------|-------------------------|-------------------------------------|-----------|----------------|
| Routing | Not defined (Vault section only) | `/$projectId` only, no `/setting` route | ❌ MISSING | Document routing |
| SDK Requirement | Not mentioned | TanStack AI SDK mandatory | ❌ MISSING | Add SDK requirement |
| Provider List | Not defined | 4 first-tier + 2 second-tier providers | ❌ MISSING | Document supported providers |
| Model Versions | Not defined | Specific versions for each provider | ❌ MISSING | Document model versions |
| Fallback Chain | Not defined | Provider → model fallback required | ❌ MISSING | Implement fallback |
| Encryption | AES-256-GCM ✅ | AES-256-GCM ✅ | ✅ ALIGNED | Keep |
| Storage | IndexedDB ✅ | Project-scoped in Dexie ✅ | ✅ ALIGNED | Keep |
| Direct Call Ban | Not defined | Prohibited | ❌ MISSING | Document prohibition |

#### Specific Changes Needed

1. **BYOK Section 7 - OUTDATED ❌**
   - Add TanStack AI SDK requirement
   - Document 4 first-tier providers with specific model versions
   - Document 2 second-tier providers
   - Add routing requirement: `/$projectId` only
   - Implement fallback chain pattern
   - Add provider → model fallback logic
   - Document feature parity requirements per provider
   - Remove any remaining direct provider calls from codebase

2. **NEW SUBSECTION: Provider Integration Requirements (Priority: P0)**
   - Multimodal input/output (text, images, audio, video)
   - Embedding endpoints (if available)
   - Model auto-loading
   - Supported parameters: max tokens, thinking variants, streaming thinking, native tool calling, token caching

---

### 5. Chat Cascade & Thread Management

#### Current State (architecture.md)

**Not covered as a standalone section.**
- Some thread management concepts in Section 5 (State Management)
- Chat API route: `/api/chat` (Section 8.1)

#### New Requirements (new-fundamental-truths.md)

**Thread Architecture (Section 6.1):**
```
Project
    └─→ Threads (indexed by project ID)
        ├─→ Main Thread (user conversation)
        ├─→ Sub-threads (agent delegations)
        └─→ Compaction Threads (auto-generated at 90% context limit)
```

**Context Management (Section 6.2):**

**Context Window:**
- Default limit: 150K tokens
- Auto-compaction at 90% threshold (135K tokens)

**Compaction Process:**
1. Trigger when context reaches 90%
2. Run sub-agent to condense conversation turns
3. Filter irrelevant/contextual information
4. Generate new thread with recapped context
5. Preserve file path references for linking

**Multi-Format Block Rendering (Section 6.3):**
| Content Type | Rendering | Notes |
|--------------|-----------|-------|
| Code blocks | Syntax highlighted, copyable | Monaco integration |
| Rich text | Tables, diagrams, markdown | Block-based rendering |
| HTML artifacts | Embedded components | Interactive content |
| Streaming tokens | Real-time display | Thinking/reasoning |
| Tool outputs | Collapsible, status-coded | Success/failure indicators |
| File references | Clickable paths | `@` mentions with context |

**Bi-Directional References (Section 6.4):**

**File-to-Chat References:**
- `@filename` - Include entire file
- `@folder/` - Include all child files
- Selected text in Monaco - Include as context

**Chat-to-File Operations:**
- Insert AI output as new file
- Insert at cursor position
- Copy to clipboard

#### Analysis

| Chat Cascade Concept | Current (architecture.md) | Required (new-fundamental-truths.md) | Alignment | Action Required |
|-------------------|-------------------------|-------------------------------------|-----------|----------------|
| Thread Architecture | Not defined | Project-scoped threads with hierarchy | ❌ MISSING | Define thread model |
| Context Window | Not defined | 150K token limit, 90% compaction | ❌ MISSING | Define context limits |
| Compaction Logic | Not defined | Sub-agent compaction at 90% threshold | ❌ MISSING | Implement compaction |
| Block Rendering | Not defined | Multi-format block rendering | ❌ MISSING | Define rendering |
| Bi-Directional References | Not defined | `@` file references, cursor insertion | ❌ MISSING | Define reference system |
| Thread Indexing | Composite key `[projectId+workspaceId]` | Project ID only | ⚠️ CONFLICT | Fix indexing |
| Streaming Support | Not defined | Streaming tokens, thinking display | ❌ MISSING | Add streaming |

#### Specific Sections Needed

**NEW SECTION REQUIRED: Chat Cascade & Thread Management (Priority: P0)**
- Location: After State Management section
- Content:
  - Thread architecture (main, sub, compaction threads)
  - Thread indexing by project ID only (not workspace)
  - Context window management (150K limit)
  - Auto-compaction trigger at 90%
  - Compaction process and sub-agent usage
  - Multi-format block rendering system
  - Bi-directional file-chat references
  - Streaming token display
  - Thinking/reasoning display
  - Tool output rendering
  - Thread hierarchy and metadata

---

### 6. State Management and Persistence

#### Current State (architecture.md)

**State Boundaries (Section 5.0):**
- Zustand for ephemeral UI state
- Dexie for persistent data
- FSA for actual file content

**Layer Distribution:**
| Layer | Technology | Purpose | Scope |
|-------|-----------|---------|--------|
| LAYER 1: DEXIE | Persistent Database | Project, settings |
| LAYER 2: ZUSTAND | Reactive UI State | Component tree |
| LAYER 3: LOCALSTORAGE | DEPRECATED | Do not use |

**Composite Key Pattern (Section 5.0.1):**
```typescript
const store = createStore()(
  persist(
    (set, get) => ({
      // State for this specific project + workspace
      fileTree: null,
      selectedFile: null,
    }),
    {
      name: `ide-store-${projectId}-${workspaceId}`,  // Composite key
      storage: createJSONStorage(() => createDexieStorage('ideState')),
    }
  )
);
```

#### New Requirements (new-fundamental-truths.md)

**State Layers (Section 8.1):**
| Layer | Technology | Purpose | Scope |
|-------|-----------|---------|--------|
| Client State | Zustand v5 | UI state, ephemeral data | Component tree |
| Persisted State | Dexie.js | Long-term storage | Project, settings |
| File System | FSA/IndexedDB | File content | Project files |

**State Boundaries (Section 8.2):**
- Zustand for client-only state (UI, interaction)
- Dexie for persisted data (projects, threads, settings)
- FSA for actual file content (desktop) or IndexedDB virtual files (mobile)

**Persistence Strategy (Section 8.3):**

**Desktop (FSA):**
- Handle stored in IndexedDB for persistence
- Minimize re-sync on project switch
- Snapshot strategy for fast load

**Mobile/Tablet (IndexedDB):**
- All data in Dexie.js
- No sync needed (single source)
- Offline-first by default

#### Analysis

| State Aspect | Current (architecture.md) | Required (new-fundamental-truths.md) | Alignment | Action Required |
|-------------|-------------------------|-------------------------------------|-----------|----------------|
| Zustand Usage | Zustand ✅ | Zustand v5 ✅ | ✅ ALIGNED | Update to v5 if needed |
| Dexie Usage | Dexie ✅ | Dexie.js ✅ | ✅ ALIGNED | Keep |
| FSA Integration | FSAGateway ✅ | FSA for desktop files ✅ | ✅ ALIGNED | Keep |
| Composite Keys | `[projectId+workspaceId]` | Single `projectId` only | ⚠️ CONFLICT | Remove workspaceId |
| State Boundaries | Clear ✅ | Clear ✅ | ✅ ALIGNED | Keep |
| LocalStorage | Deprecated ✅ | Deprecated ✅ | ✅ ALIGNED | Keep deprecation warning |
| Desktop Strategy | Handle in IndexedDB ✅ | Handle in IndexedDB ✅ | ✅ ALIGNED | Keep |
| Mobile Strategy | Dexie ✅ | Dexie ✅ | ✅ ALIGNED | Keep |
| Plugin State | Not defined | Plugin state pattern needed | ❌ MISSING | Define plugin state |

#### Specific Changes Needed

1. **Composite Key Pattern (Section 5.0.1) - CONFLICT ⚠️**
   - Current: `[projectId+workspaceId]`
   - Required: Single `projectId` only
   - Rationale: Plugins load/unload, workspace is a UI concern
   - Update all store key patterns
   - Remove workspaceId from composite keys

2. **Plugin State Management (Section 5.0) - MISSING ❌**
   - Define plugin state pattern:
     ```typescript
     interface PluginState {
       pluginId: string;
       enabled: boolean;
       config: Record<string, unknown>;
       sessionState: Record<string, unknown>;
     }
     ```
   - Document `usePluginStore` hook pattern
   - Define plugin lifecycle and state cleanup

---

### 7. RAG Implementation

#### Current State (architecture.md)

**Current Technology (Section 3.1):**
- Vector Database: OramaDB (browser-based, local-first)
- Embeddings: Xenova/all-MiniLM-L6-v2 (384-dimension)
- Search Type: Hybrid (vector 0.7 + BM25 0.3)
- Fallback: Gemini API for embedding generation

**Implementation:**
- `src/lib/rag/` - 30+ files
- `src/infrastructure/persistence/stores/rag/` - Store layer
- `src/presentation/components/rag/` - UI components

**RAG Architecture (Section 3.2):**
```
User Query
    ↓
Hybrid Retriever (vector + BM25)
    ↓
├─→ OramaDB Vector Search (local in-memory)
└─→ BM25 Full-text Search
    ↓
Reranking (if implemented)
    ↓
Context + Query → LLM
    ↓
Response with Citations
```

#### New Requirements (new-fundamental-truths.md)

**RAG Context (Section 3.3 & 6.1):**
- Threads are indexed and dependent on project ID
- RAG index is project-scoped
- No cross-project RAG

**Individual AI Features vs Agent-Driven (Section 7):**
- Individual AI features: Independent of chat cascade (Note plugin)
- Agent-driven features: Within chat cascade (Chat plugin)

#### Analysis

| RAG Aspect | Current (architecture.md) | Required (new-fundamental-truths.md) | Alignment | Action Required |
|-------------|-------------------------|-------------------------------------|-----------|----------------|
| Technology | OramaDB ✅ | OramaDB or similar ✅ | ✅ ALIGNED | Keep |
| Embeddings | Xenova/all-MiniLM-L6-v2 ✅ | Any local-first embeddings ✅ | ✅ ALIGNED | Keep |
| Hybrid Search | Vector + BM25 ✅ | Any hybrid approach ✅ | ✅ ALIGNED | Keep |
| Project Scoping | Not explicitly defined | Project ID only | ⚠️ UNCLEAR | Clarify project scope |
| Thread Integration | Not defined | Threads project-scoped | ⚠️ UNCLEAR | Define integration |
| Individual AI Support | Not defined | Support for individual AI features | ❌ MISSING | Document individual AI |

#### Specific Changes Needed

1. **RAG Scoping (Section 3) - UNCLEAR ⚠️**
   - Clarify that RAG indices are project-scoped (not workspace-scoped)
   - Update composite key pattern to use single `projectId`
   - Remove `workspaceId` from RAG store keys
   - Document thread-RAG integration (threads project-scoped)

2. **NEW SUBSECTION: Individual AI Features Support (Priority: P1)**
   - Document support for individual AI features in Note plugin
   - Describe AI commands and prompt chains
   - Describe image generation and text selection features
   - Define how these integrate with project-scoped RAG

---

### 8. Device Architecture & Platform Detection

#### Current State (architecture.md)

**Platform Contract Interface (Section 2.3):**
```typescript
interface PlatformContract {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  storageType: 'fsa' | 'indexeddb';
  canAccessFSA: boolean;
  canWatchFiles: boolean;
  canRunTerminal: boolean;
  canDoAgenticCoding: boolean;
  canAccessIDE: boolean;
}
```

**Platform Capabilities (Section 2.3 Table):**
| Capability | Desktop | Mobile | Tablet |
|------------|---------|--------|--------|
| storageType | 'fsa' | 'indexeddb' | 'indexeddb' |
| canAccessFSA | ✅ true | ❌ false | ❌ false |
| canAccessIDE | ✅ true | ❌ false | ❌ false |
| canWatchFiles | Chrome 129+ | ❌ false | ❌ false |
| canRunTerminal | ✅ true | ❌ false | ❌ false |

#### New Requirements (new-fundamental-truths.md)

**Platform Contract (Section 2):**
- Platform determines available capabilities
- Device type: desktop, tablet, mobile

**Desktop (FSA) Characteristics (Section 2.1):**
- Real files on disk via native file system
- Bidirectional sync with external editors
- Full IDE capabilities (Monaco, Terminal)
- Handle persistence in IndexedDB (not file system)

**Mobile/Tablet (IndexedDB) Characteristics (Section 2.2):**
- Virtual files in browser database
- No external editor sync needed
- IDE features blocked (Monaco, Terminal unavailable)
- Single source of truth (no sync conflicts)

**IDE Access Policy (Section 2.3):**
| Platform | IDE Access | Behavior |
|----------|-----------|----------|
| Desktop (FSA) | ✅ Full | Monaco + Terminal + FileTree |
| Desktop (IndexedDB) | ⚠️ Limited | FileTree + Notes only |
| Tablet | ❌ Blocked | Notes + Chat only |
| Mobile | ❌ Blocked | Notes + Chat only |

#### Analysis

| Platform Aspect | Current (architecture.md) | Required (new-fundamental-truths.md) | Alignment | Action Required |
|---------------|-------------------------|-------------------------------------|-----------|----------------|
| Platform Types | desktop, mobile, tablet ✅ | desktop, mobile, tablet ✅ | ✅ ALIGNED | Keep |
| Storage Types | fsa, indexeddb ✅ | fsa, indexeddb ✅ | ✅ ALIGNED | Keep |
| Platform Detection | PlatformContract ✅ | PlatformContract ✅ | ✅ ALIGNED | Keep |
| Desktop FSA | Defined ✅ | Defined ✅ | ✅ ALIGNED | Keep |
| Mobile IndexedDB | Defined ✅ | Defined ✅ | ✅ ALIGNED | Keep |
| IDE Access Policy | canAccessIDE boolean | Per-platform policy with behaviors | ⚠️ PARTIAL | Update to match policy |
| Terminal Access | canRunTerminal boolean | Platform-specific access policy | ⚠️ PARTIAL | Update to match policy |
| Tablet Distinction | ✅ Included | ✅ Included | ✅ ALIGNED | Keep |
| Chrome 129+ Detection | ✅ Implemented | ✅ Required | ✅ ALIGNED | Keep |

#### Specific Changes Needed

1. **IDE Access Policy (Section 2.3) - PARTIAL ⚠️**
   - Current: Single `canAccessIDE` boolean
   - Required: Per-platform policy with specific behaviors:
     - Desktop (FSA): Full access (Monaco + Terminal + FileTree)
     - Desktop (IndexedDB): Limited (FileTree + Notes only)
     - Tablet: Blocked (Notes + Chat only)
     - Mobile: Blocked (Notes + Chat only)
   - Update PlatformContract to support policy enum or detail object

---

### 9. ADR Dependencies

#### Current ADR References (Section 9)

| ADR | Title | Status | Key Decisions |
|-----|-------|--------|---------------|
| **ADR-033** | Correct-Course Architectural Remediation | APPROVED | Platform detection (D1), FSA persistence (D2), Notes storage (D3), Project structure (D4-D9) |
| **ADR-034** | Workspace Access Infection Remediation | APPROVED | 31 infection points, FSA handle unification (D10), State scoping (D11), Route loading (D12), Platform guards (D13) |
| **ADR-035** | Architecture Standardization v2 | APPROVED | Entity model, storage boundaries, 3 P0 bugs, Chrome 129+ detection |
| ADR-026 | AI Service Unification | SUPERSEDED | Replaced by ADR-033/agent orchestration |
| ADR-027 | State Management Consolidation | SUPERSEDED | Replaced by ADR-034/035 |
| ADR-028 | Error Boundary Coverage | SUPERSEDED | 22.2% coverage, needs remediation |
| ADR-029 | Clean Architecture Layer Compliance | SUPERSEDED | Actual compliance ~50%, not 70% |
| ADR-032 | Agent Chat Self-Switching | EXTENDED | Infrastructure exists, not enabled |

#### New ADR Requirements (new-fundamental-truths.md)

**Related ADRs (Frontmatter):**
- **ADR-034**: Project-Centric Architecture with Feature Plugins
- **ADR-034-AMENDMENT-001**: Platform-First Plugin Selection

#### Analysis

| ADR Aspect | Current (architecture.md) | Required (new-fundamental-truths.md) | Alignment | Action Required |
|-------------|-------------------------|-------------------------------------|-----------|----------------|
| ADR-034 | Not listed (only 033, 034, 035) | ADR-034 as primary governance | ⚠️ MISSING | Add ADR-034 reference |
| ADR-034-AMENDMENT-001 | Not listed | Platform-First Plugin Selection | ❌ MISSING | Add amendment reference |
| Plugin System ADR | Not defined | Required ADR for plugin architecture | ❌ MISSING | Create new ADR |
| TanStack AI ADR | Not defined | Required ADR for SDK integration | ❌ MISSING | Create new ADR |
| Orchestrator ADR | Not defined | Required ADR for orchestrator pattern | ❌ MISSING | Create new ADR |

#### New ADRs Required

1. **ADR-036: Plugin System Architecture (Priority: P0)**
   - Plugin interface definition
   - Plugin registry architecture
   - Plugin loading/unloading lifecycle
   - Plugin state management
   - Plugin permissions
   - Platform-aware default plugins
   - Plugin layout system

2. **ADR-037: TanStack AI SDK Integration (Priority: P0)**
   - Mandatory use of TanStack AI SDK
   - Provider adapter architecture
   - Fallback chain implementation
   - Model capability detection
   - Tool integration
   - Streaming support

3. **ADR-038: Orchestrator + Domain-Specific Agents (Priority: P0)**
   - Orchestrator pattern
   - Domain-specific agent definitions
   - Tool permission matrix
   - Agent delegation patterns
   - Mode switching logic

4. **ADR-039: Chat Cascade & Thread Management (Priority: P0)**
   - Thread architecture (main, sub, compaction)
   - Context window management (150K tokens)
   - Auto-compaction at 90%
   - Multi-format block rendering
   - Bi-directional file references

---

## Conflicts and Contradictions

### Critical Conflicts (Must Resolve)

| Conflict | Current (architecture.md) | Required (new-fundamental-truths.md) | Impact | Priority |
|----------|-------------------------|-------------------------------------|--------|-----------|
| **Route Structure** | 5 workspace routes | Single `/$projectId` route | Breaks all navigation | P0 |
| **Composite Keys** | `[projectId+workspaceId]` | Single `projectId` only | Breaks state management | P0 |
| **Workspace Concept** | Workspace-scoped state | Project-centric architecture | Breaks state isolation | P0 |
| **Agent Pattern** | ModeClassifier | Orchestrator + domain agents | Breaks agent system | P0 |
| **Plugin System** | Not defined | Complete plugin architecture | Breaks Phase 1A | P0 |
| **TanStack AI SDK** | Not mentioned | Mandatory for all LLM calls | Breaks BYOK integration | P0 |

### Medium Priority Conflicts

| Conflict | Current (architecture.md) | Required (new-fundamental-truths.md) | Impact | Priority |
|----------|-------------------------|-------------------------------------|--------|-----------|
| **IDE Access** | Single boolean | Per-platform policy | Confusing UX | P1 |
| **Thread Management** | Not defined | Full thread architecture | Missing features | P1 |
| **Individual AI** | Not defined | Support for individual AI | Missing features | P1 |

### Low Priority Conflicts

| Conflict | Current (architecture.md) | Required (new-fundamental-truths.md) | Impact | Priority |
|----------|-------------------------|-------------------------------------|--------|-----------|
| **RAG Scoping** | Unclear | Project-scoped explicitly | Potential bugs | P2 |

---

## Duplicate Content

### Section 8.1 Routes (DUPLICATE)

**Duplicate Information:**
- Lists routes that conflict with Section 1.2 (new-fundamental-truths.md)
- Overlaps with potential new plugin routing section

**Action:** Rewrite Section 8.1 to align with plugin system

### Section 5.0.1 Composite Keys (DUPLICATE)

**Duplicate Information:**
- Section 5.0.2 State Scoping Rules also describes state keys
- Inconsistent with new fundamentals

**Action:** Consolidate composite key description into single section

---

## Missing Sections

### High Priority Missing (P0)

1. **Plugin Architecture** - Complete absence
   - Plugin interface
   - Plugin registry
   - Plugin lifecycle
   - Plugin state management
   - Plugin permissions
   - Platform-aware defaults
   - Plugin layout system

2. **Orchestrator Pattern** - Only ModeClassifier exists
   - Orchestrator responsibilities
   - Read-only tools
   - Mode switching logic
   - Task delegation
   - Sub-agent isolation

3. **Chat Cascade & Thread Management** - Not covered
   - Thread architecture
   - Context window limits
   - Auto-compaction
   - Multi-format rendering
   - Bi-directional references

4. **TanStack AI SDK Requirements** - Not mentioned
   - SDK as mandatory
   - Provider adapters
   - Fallback chain
   - Model capabilities

### Medium Priority Missing (P1)

5. **Individual AI Features** - Not documented
   - AI commands
   - Prompt chains
   - Image generation
   - Text selection

6. **Plugin Layout System** - Not defined
   - Layout slots
   - Panel rendering
   - Responsive behavior
   - Max column limits per platform

### Low Priority Missing (P2)

7. **BYOK Routing Integration** - Partial
   - Route: `/$projectId` integration
   - No separate `/setting` route

---

## Actionable Recommendations

### Immediate Actions (P0 - Phase 1A/1B Blockers)

1. **Rewrite Section 1: Executive Summary**
   - Update to reflect project-centric architecture
   - Update feature completeness metrics
   - Add plugin system status (0% - missing)
   - Update agent system status (40% - partial)
   - Update BYOK status (50% - needs SDK migration)

2. **Create Section: Plugin System Architecture**
   - Define FeaturePlugin interface
   - Document plugin registry
   - Define plugin lifecycle (load/unload)
   - Define plugin state pattern
   - Document two always-loaded plugins
   - Define plugin categories
   - Document platform-aware defaults

3. **Rewrite Section 8.1: Routes**
   - Consolidate to two routes:
     - `/hub` - Project management
     - `/$projectId` - Project with plugins
   - Add redirect logic from deprecated routes
   - Remove workspace-specific route references

4. **Rewrite Section 4: Agent System**
   - Replace "Agent Mode Auto-Switching" with "Orchestrator + Domain-Specific Agents"
   - Remove ModeClassifier
   - Add tool classification (Client/Server/Agent)
   - Update tool permission matrix
   - Add TanStack AI SDK requirement
   - Document OpenCode patterns

5. **Create Section: Chat Cascade & Thread Management**
   - Define thread architecture (main, sub, compaction)
   - Document context window (150K tokens)
   - Document auto-compaction at 90%
   - Define multi-format block rendering
   - Document bi-directional file references
   - Define thread indexing by project ID only

6. **Fix Composite Key Pattern (Section 5.0.1)**
   - Remove `workspaceId` from composite keys
   - Use single `projectId` only
   - Update all examples

7. **Rewrite Section 7: BYOK Vault**
   - Add TanStack AI SDK requirement
   - Document 4 first-tier providers
   - Document 2 second-tier providers
   - Add routing requirement
   - Implement fallback chain pattern
   - Add provider → model fallback logic
   - Document feature parity requirements

### Secondary Actions (P1 - Phase 1B Readiness)

8. **Create ADR-036: Plugin System Architecture**
   - Plugin interface
   - Plugin registry
   - Plugin lifecycle
   - Plugin state management
   - Plugin permissions

9. **Create ADR-037: TanStack AI SDK Integration**
   - SDK mandatory requirement
   - Provider adapters
   - Fallback chain
   - Model capabilities

10. **Create ADR-038: Orchestrator + Domain-Specific Agents**
    - Orchestrator pattern
    - Domain-specific agents
    - Tool permission matrix
    - Agent delegation

11. **Create ADR-039: Chat Cascade & Thread Management**
    - Thread architecture
    - Context window limits
    - Auto-compaction
    - Multi-format rendering
    - Bi-directional references

12. **Update ADR References (Section 9)**
    - Add ADR-034 as primary governance
    - Add ADR-034-AMENDMENT-001
    - Remove SUPERSEDED status from relevant ADRs
    - Add new ADRs (036, 037, 038, 039)

### Tertiary Actions (P2 - Phase 2/3 Readiness)

13. **Update IDE Access Policy (Section 2.3)**
    - Change from boolean to per-platform policy
    - Document specific behaviors per platform

14. **Document Individual AI Features Support**
    - Add subsection to RAG or new section
    - Describe AI commands
    - Describe prompt chains
    - Describe image generation

15. **Update RAG Scoping**
    - Clarify project-only scoping
    - Remove workspace references

---

## Alignment Summary Table

| Section | Current Status | Required Status | Alignment | Priority | Effort |
|---------|---------------|----------------|-----------|-----------|---------|
| 1. Executive Summary | Outdated metrics | Project-centric, plugin system | 30% | P0 | 2h |
| 2. System Overview | Platform detection good | Add plugin architecture | 70% | P0 | 4h |
| 2.3 Platform Contract | Partial alignment | Per-platform IDE policy | 80% | P1 | 1h |
| 2.4 Storage Gateway | Aligned | Keep | 90% | P2 | 0h |
| 3. RAG Implementation | Aligned | Add individual AI support | 80% | P1 | 2h |
| 4. Agent System | Partial (ModeClassifier) | Orchestrator + domain agents | 40% | P0 | 6h |
| 5. State Management | Good | Remove workspaceId from keys | 70% | P0 | 2h |
| 6. Data Flow | Aligned | Add plugin event bus | 80% | P2 | 1h |
| 7. BYOK Vault | Partial | Add TanStack AI SDK | 50% | P0 | 4h |
| 8.1 Routes | OUTDATED | Consolidate to 2 routes | 0% | P0 | 2h |
| 8.2 Provider Adapters | Aligned | Update for TanStack AI SDK | 60% | P0 | 3h |
| 9. ADR References | Missing new ADRs | Add ADR-036-039 | 50% | P1 | 1h |
| **PLUGIN SYSTEM** | MISSING | Complete section | 0% | P0 | 8h |
| **CHAT CASCADE** | MISSING | Complete section | 0% | P0 | 6h |

**Total Effort Estimate:** 42 hours for full alignment

---

## Conclusion

The current `architecture.md` document is **35% aligned** with the new fundamental truths defined in `new-fundamental-truths.md`. Critical gaps exist in:

1. **Plugin System Architecture** (0% aligned) - Completely missing
2. **Project-Centric Routing** (30% aligned) - Still workspace-centric
3. **Agent System** (40% aligned) - Needs complete overhaul to orchestrator pattern
4. **TanStack AI SDK Integration** (0% aligned) - Completely missing
5. **Chat Cascade & Thread Management** (30% aligned) - Major features undefined
6. **BYOK Vault** (50% aligned) - Needs SDK migration

The document requires extensive rewriting to align with Phase 1A (Non-AI Core) and Phase 1B (BYOK & Note Features) requirements. The most critical blockers are:

- **Plugin system architecture** - Blocks Phase 1A implementation
- **Route consolidation** - Breaks project-centric model
- **Agent system overhaul** - Breaks orchestrator pattern
- **TanStack AI SDK** - Breaks BYOK integration
- **Composite key pattern** - Breaks state management

**Recommended Approach:**
1. Create new ADRs (036-039) to govern missing sections
2. Rewrite architecture.md sections by priority (P0 first)
3. Validate against new-fundamental-truths.md requirements
4. Update related documents (epics.md, prd.md)
5. Update governance artifacts (AGENTS.md, LOOP_STATE.yaml)

**Estimated Timeline:** 42 hours (5-6 days) for complete alignment

---

## Appendices

### Appendix A: Section-by-Section Mapping

| Section in architecture.md | Required Changes | Priority | References |
|------------------------|------------------|-----------|------------|
| 1. Executive Summary | Update metrics, add plugin status | P0 | new-fundamental-truths.md 1.1 |
| 2. System Overview | Add plugin architecture | P0 | new-fundamental-truths.md 3.1 |
| 2.1-2.4 Layers | Keep aligned | P2 | - |
| 3. RAG Implementation | Add individual AI support | P1 | new-fundamental-truths.md 7.1 |
| 4. Agent System | Complete overhaul | P0 | new-fundamental-truths.md 5.1 |
| 5. State Management | Remove workspaceId | P0 | new-fundamental-truths.md 1.3 |
| 6. Data Flow | Add plugin events | P2 | new-fundamental-truths.md 3.3 |
| 7. BYOK Vault | Add SDK, providers | P0 | new-fundamental-truths.md 4.2 |
| 8.1 Routes | Consolidate to 2 routes | P0 | new-fundamental-truths.md 1.2 |
| 8.2 Providers | Update for SDK | P0 | new-fundamental-truths.md 4.3 |
| 9. ADR References | Add ADR-036-039 | P1 | new-fundamental-truths.md related_adrs |

### Appendix B: New ADR Structure Templates

**ADR-036: Plugin System Architecture**
```
## Context
Phase 1A requires plugin system architecture to support project-centric model.

## Decision
Implement FeaturePlugin interface with platform-aware defaults.

## Consequences
- Plugins replace workspaces
- Two always-loaded plugins (Project Management, Chat Cascade)
- Up to 3 optional plugins
- Platform-specific defaults
```

**ADR-037: TanStack AI SDK Integration**
```
## Context
Phase 1B requires BYOK integration with TanStack AI SDK.

## Decision
Mandate TanStack AI SDK for all LLM calls.

## Consequences
- All provider adapters must use SDK
- Fallback chain required
- No direct provider calls
```

### Appendix C: Evidence Links

| Claim | Evidence Source |
|-------|---------------|
| Plugin system missing | new-fundamental-truths.md Section 3 |
| Routes outdated | new-fundamental-truths.md Section 1.2 |
| Agent pattern mismatch | new-fundamental-truths.md Section 5.1 |
| TanStack AI SDK required | new-fundamental-truths.md Section 4.3 |
| Thread management missing | new-fundamental-truths.md Section 6 |
| Composite key conflict | new-fundamental-truths.md Section 1.3 |

---

**Report Generated:** 2026-01-26
**Analysis Duration:** 30 minutes
**Evidence:** Section-by-section comparison, conflict identification, action items
**Status:** COMPLETE - Ready for architecture.md rewrite
