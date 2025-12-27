---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: []
workflowType: 'research'
lastStep: 5
research_type: 'technical'
research_topic: 'via-gent-foundational-architectural-slice-spike'
research_goals:
  - 'Validate end-to-end vertical slice architecture for IDE shell, agents, and dual FS sync (Project Alpha).'
  - 'Confirm TanStack Start + TanStack AI + WebContainers integration patterns for a browser-only IDE route with SPA/ssr:false configuration.'
  - 'De-risk client-only Git and persistence constraints (File System Access API + IndexedDB + isomorphic-git adapter).'
user_name: 'Apple'
date: '2025-12-10'
web_research_enabled: true
source_verification: true
---

# Research Report: technical

**Date:** 2025-12-10  
**Author:** Apple  
**Research Type:** technical  
**Research Topic:** via-gent foundational architectural slice spike ("Project Alpha")

---


## 📐 THE FOUNDATIONAL SLICE: "Project Alpha"

### Core Thesis

> **If an AI agent can, through a browser-only TanStack Start app, execute tools that write files to WebContainers, sync those files to the user's local disk via File System Access API, commit via isomorphic-git, and persist the entire conversation/state to IndexedDB - then the architecture is proven.**

---

## 🧩 ARCHITECTURAL LAYERS TO VALIDATE

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                               │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  ┌─────────────┐ │
│  │ Monaco      │  │ XTerm        │  │ FileTree   │  │ ChatPanel   │ │
│  │ Editor      │  │ Terminal     │  │ Component  │  │ (TanStack   │ │
│  │             │  │              │  │            │  │  AI useChat)│ │
│  └─────┬───────┘  └──────┬───────┘  └─────┬──────┘  └──────┬──────┘ │
│        │                 │                │                │        │
├────────┼─────────────────┼────────────────┼────────────────┼────────┤
│        ▼                 ▼                ▼                ▼        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                     UNIFIED STATE LAYER                       │   │
│  │   TanStack Store (IDEStore, ProjectStore, ConversationStore) │   │
│  │   + TanStack Query (for async operations caching)            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│        │                                                            │
├────────┼────────────────────────────────────────────────────────────┤
│        ▼                                                            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │               FILE SYSTEM COORDINATION LAYER                  │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐ │   │
│  │  │ WebContainers   │  │ File System     │  │ Sync Manager  │ │   │
│  │  │ FS (in-memory)  │←→│ Access API      │←→│ (bidirectional│ │   │
│  │  │                 │  │ (local disk)    │  │  + conflict)  │ │   │
│  │  └─────────────────┘  └─────────────────┘  └───────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
│        │                                                            │
├────────┼────────────────────────────────────────────────────────────┤
│        ▼                                                            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    GIT LAYER (isomorphic-git)                 │   │
│  │   Uses File System Access API as fs adapter                  │   │
│  │   Operations: init, add, commit, branch, push, pull          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│        │                                                            │
├────────┼────────────────────────────────────────────────────────────┤
│        ▼                                                            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    PERSISTENCE LAYER                          │   │
│  │  ┌─────────────────┐  ┌─────────────────────────────────────┐│   │
│  │  │ IndexedDB       │  │ Conversation + Project Metadata     ││   │
│  │  │ (via idb lib)   │  │ (messages, tool results, settings)  ││   │
│  │  └─────────────────┘  └─────────────────────────────────────┘│   │
│  └──────────────────────────────────────────────────────────────┘   │
│        │                                                            │
├────────┼────────────────────────────────────────────────────────────┤
│        ▼                                                            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    AI AGENT LAYER                             │   │
│  │  ┌─────────────────┐  ┌─────────────────────────────────────┐│   │
│  │  │ TanStack AI     │  │ Tools (file ops, terminal, git)     ││   │
│  │  │ useChat hook    │  │ via toolDefinition() pattern        ││   │
│  │  └─────────────────┘  └─────────────────────────────────────┘│   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 VALIDATION REQUIREMENTS

### Layer 1: WebContainers + Terminal Integration

| Requirement | Validation Criteria |
|-------------|---------------------|
| **Boot WebContainers** | `WebContainer.boot()` succeeds, returns instance |
| **Mount Files** | `webcontainer.mount(fileTree)` works with 100+ files |
| **Spawn Shell** | `webcontainer.spawn('jsh')` creates interactive shell |
| **XTerm Binding** | Terminal input → shell stdin, shell stdout → terminal output |
| **Resize Handling** | Terminal resize sends `stty rows X cols Y` via shell, NOT via separate spawn |
| **Process Management** | Can spawn `npm install`, `npm run dev` and track exit codes |
| **Hot Reload** | Dev server in WebContainer updates when files change |

### Layer 2: File System Access API Integration

| Requirement | Validation Criteria |
|-------------|---------------------|
| **Directory Permission** | `showDirectoryPicker()` grants access to local folder |
| **Permission Persistence** | Permission survives page reload via `queryPermission()` |
| **Read Files** | Can read all files from local directory into memory |
| **Write Files** | Can write files back to local directory |
| **Watch Changes** | Detect when files change externally (if possible) |
| **Fallback Mode** | Works gracefully if permission denied (virtual FS only) |

### Layer 3: Bidirectional Sync

| Requirement | Validation Criteria |
|-------------|---------------------|
| **Initial Sync** | Local folder → WebContainers FS on project open |
| **WebContainer → Local** | File saved in Monaco writes to local disk |
| **Terminal → Local** | `npm install` in WebContainer creates `node_modules` in local |
| **Local → WebContainer** | External file change detected, synced to WebContainer |
| **Conflict Resolution** | Both modified same file → prompt user or use timestamps |
| **Debouncing** | Rapid changes don't cause sync storms |

### Layer 4: Git Integration (isomorphic-git)

| Requirement | Validation Criteria |
|-------------|---------------------|
| **Git Init** | `git.init()` creates `.git` in local folder |
| **Git Add** | `git.add()` stages files from local folder |
| **Git Commit** | `git.commit()` creates commit in local `.git` |
| **Git Status** | `git.status()` shows modified/staged/untracked |
| **GitHub Auth** | OAuth or PAT grants push/pull access |
| **Git Push** | `git.push()` uploads to GitHub |
| **Git Pull** | `git.pull()` downloads from GitHub |

### Layer 5: Persistence (IndexedDB)

| Requirement | Validation Criteria |
|-------------|---------------------|
| **Conversation Storage** | Messages persist across page reload |
| **Tool Results Storage** | Tool execution results persist with messages |
| **Project Metadata** | Project name, settings, open files persist |
| **Permission Handles** | File System Access API handles persist (if supported) |
| **Quota Management** | Large conversations don't exceed IndexedDB quota |
| **Migration Strategy** | Schema changes don't lose user data |

### Layer 6: AI Agent + Tools

| Requirement | Validation Criteria |
|-------------|---------------------|
| **TanStack AI useChat** | `useChat()` with `fetchServerSentEvents('/api/chat')` works |
| **Tool Definitions** | `toolDefinition()` pattern for file ops, terminal, git |
| **Tool Execution** | Agent calls tool → tool runs → result returns to agent |
| **File Tools** | `read_file`, `write_file`, `list_files`, `create_folder`, `delete_file` |
| **Terminal Tools** | `run_command` executes in WebContainer shell |
| **Git Tools** | `git_status`, `git_add`, `git_commit`, `git_push` |
| **Tool → UI Sync** | Tool writes file → Monaco shows updated content |

### Layer 7: Routing + Entry Points

| Requirement | Validation Criteria |
|-------------|---------------------|
| **SPA Mode** | TanStack Start runs in SPA mode (no SSR for WebContainers routes) |
| **Route Structure** | `/` (dashboard), `/workspace/:projectId` (IDE) |
| **Search Params** | `?file=src/index.ts` opens specific file in editor |
| **Navigation** | Switching routes doesn't lose WebContainer state |
| **API Routes** | `/api/chat` handles TanStack AI streaming |

---

## 📁 SPIKE FILE STRUCTURE

```
spikes/foundational-slice-alpha/
├── src/
│   ├── client.tsx                     # TanStack Start client entry
│   ├── router.tsx                     # Router configuration
│   ├── routes/
│   │   ├── __root.tsx                 # Root layout with providers
│   │   ├── index.tsx                  # Dashboard/project list
│   │   ├── workspace/
│   │   │   └── $projectId.tsx         # IDE workspace (SPA, ssr: false)
│   │   └── api/
│   │       └── chat.ts                # TanStack AI streaming endpoint
│   ├── lib/
│   │   ├── webcontainer/
│   │   │   ├── manager.ts             # WebContainer lifecycle
│   │   │   └── terminal-adapter.ts    # XTerm ↔ WebContainer binding
│   │   ├── filesystem/
│   │   │   ├── local-fs-adapter.ts    # File System Access API wrapper
│   │   │   ├── webcontainer-fs.ts     # WebContainer FS operations
│   │   │   └── sync-manager.ts        # Bidirectional sync logic
│   │   ├── git/
│   │   │   ├── git-service.ts         # isomorphic-git operations
│   │   │   └── github-auth.ts         # OAuth/PAT handling
│   │   ├── persistence/
│   │   │   ├── indexeddb-adapter.ts   # idb-based storage
│   │   │   ├── conversation-store.ts  # Message persistence
│   │   │   └── project-store.ts       # Project metadata
│   │   ├── agent/
│   │   │   ├── tool-definitions.ts    # TanStack AI tools
│   │   │   ├── file-tools.ts          # read/write/list/delete
│   │   │   ├── terminal-tools.ts      # run_command
│   │   │   └── git-tools.ts           # git operations
│   │   └── stores/
│   │       ├── ide-store.ts           # TanStack Store for IDE state
│   │       └── project-store.ts       # TanStack Store for project
│   ├── components/
│   │   ├── ide/
│   │   │   ├── MonacoEditor.tsx       # Monaco with FS sync
│   │   │   ├── XTerminal.tsx          # XTerm with WebContainer
│   │   │   ├── FileTree.tsx           # File tree with FS Access
│   │   │   └── ChatPanel.tsx          # TanStack AI useChat
│   │   └── layout/
│   │       └── IDELayout.tsx          # Resizable panels
├── tests/
│   ├── webcontainer.test.ts           # WebContainer boot, mount, spawn
│   ├── filesystem-sync.test.ts        # Bidirectional sync
│   ├── git-operations.test.ts         # isomorphic-git
│   ├── agent-tools.test.ts            # Tool execution
│   └── e2e/
│       └── full-workflow.test.ts      # End-to-end validation
├── vite.config.ts                     # Vite 7+ with TanStack Start plugin
├── package.json
└── tsconfig.json
```

---

## 🔬 CRITICAL UNKNOWNS TO RESOLVE

The Master identifies these as the **existential questions** this spike must answer:

### 1. File System Access API + isomorphic-git Adapter

**Question**: Does a working `fs` adapter for isomorphic-git that uses File System Access API exist, or must we build it?

**Research Needed**:
- Check if `browser-fs-access` provides compatible API
- Check if `file-system-access` polyfill works
- May need to build custom adapter

### 2. Bidirectional Sync Strategy

**Question**: What is the sync architecture?

**Options**:
| Strategy | Pros | Cons |
|----------|------|------|
| **WebContainer as source of truth** | Simple, consistent | Local changes lost |
| **Local FS as source of truth** | Real files, git works | WebContainer must re-mount on changes |
| **Bidirectional with conflict detection** | Full flexibility | Complex, needs UI for conflicts |

**Recommendation**: Start with **Local FS as source of truth**, WebContainer mirrors it.

### 3. WebContainers + Local FS Sync Performance

**Question**: Can we sync `node_modules` (thousands of files) without freezing the browser?

**Approach**:
- Don't sync `node_modules` to local disk (keep in WebContainer only)
- Only sync source files
- Use `.gitignore` patterns for sync exclusion

### 4. IndexedDB Persistence for File System Access API Handles

**Question**: Can `FileSystemDirectoryHandle` be stored in IndexedDB for cross-session persistence?

**Research Needed**: The spec mentions `navigator.storage.getDirectory()` for OPFS, but File System Access API handles may need `queryPermission()` on each session.

### 5. TanStack AI Tool Execution + WebContainer Coordination

**Question**: How do AI agent tools (which may be server-side) interact with WebContainers (which are client-side only)?

**Architecture Decision**:
- Tools must be **client-side tools** (execute in browser)
- Use TanStack AI's client tool pattern
- Tools call WebContainer/FS APIs directly

---

## 📋 IMPLEMENTATION ORDER

```
Phase 1: Core Foundation (Days 1-3)
├── Step 1.1: TanStack Start SPA skeleton with routing
├── Step 1.2: WebContainer boot + terminal integration
├── Step 1.3: File System Access API with directory picker
└── Step 1.4: Basic sync (local → WebContainer on project open)

Phase 2: Sync + Persistence (Days 4-6)
├── Step 2.1: WebContainer file changes → local disk write
├── Step 2.2: IndexedDB persistence for project metadata
├── Step 2.3: IndexedDB persistence for conversations
└── Step 2.4: Session restoration on page reload

Phase 3: Git Integration (Days 7-8)
├── Step 3.1: isomorphic-git with File System Access API adapter
├── Step 3.2: Git status display in UI
├── Step 3.3: Git commit workflow
└── Step 3.4: GitHub push/pull (stretch goal)

Phase 4: AI Agent Tools (Days 9-10)
├── Step 4.1: TanStack AI useChat with streaming
├── Step 4.2: File operation tools (read/write/list)
├── Step 4.3: Terminal execution tool
├── Step 4.4: Tool → UI sync (tool writes file → editor updates)
└── Step 4.5: Git tools (status, add, commit)

Phase 5: Validation (Days 11-12)
├── Step 5.1: End-to-end test: AI creates project from scratch
├── Step 5.2: End-to-end test: Session persistence
├── Step 5.3: End-to-end test: Git workflow
└── Step 5.4: Document learnings + patterns for main codebase
```

---

## ✅ SUCCESS CRITERIA

The spike is **successful** if all of the following work in sequence:

1. **User opens app** → Dashboard loads
2. **User clicks "Open Local Folder"** → File System Access API grants permission
3. **Local files appear in FileTree** → Mounted to WebContainer
4. **User clicks a file** → Monaco opens it
5. **User types in Monaco** → File saves to local disk
6. **User opens terminal** → jsh shell interactive
7. **User runs `npm install`** → Dependencies install in WebContainer
8. **User runs `npm run dev`** → Dev server starts, preview shows
9. **User opens chat** → AI agent available
10. **User says "Create a button component"** → Agent uses tools
11. **Tool writes file** → Monaco shows new file, local disk has it
12. **User refreshes page** → Everything restores from IndexedDB + local FS
13. **User commits changes** → isomorphic-git creates commit in local `.git`
14. **User pushes to GitHub** → Changes appear on GitHub

If **all 14 steps work**, the architecture is **validated**.

---

## 🎯 THE MASTER'S VERDICT ON YOUR INTUITION

**Apple**, your intuition is correct:

> *"If the full-client, persistence, and browser - through AI interactions (to really code, and can bootstrap by running commands) - they are essential to decide whether this stack works."*

This foundational slice is **not** about building features. It's about **proving the architecture**. If this slice works:

- ✅ WebContainers + browser file system integration is possible
- ✅ AI agents can manipulate real files on user's disk
- ✅ State persists across sessions without a server
- ✅ Git works entirely client-side
- ✅ The full Via-Gent vision is achievable

If this slice **fails**:
- ❌ We need to fundamentally rethink the architecture
- ❌ Possibly hybrid approach (some server components)
- ❌ Possibly different tech stack

---


## Research Overview

This document captures **technical research** for the **Foundational Architectural Slice (Project Alpha)** of via-gent.

It validates whether a **browser-only TanStack Start app** can:

- Drive **AI tools** via TanStack AI that
  - write files into a **WebContainers** project,
  - sync those files to the users local disk via the **File System Access API**,  
  - commit them via **isomorphic-git** against that local folder, and
  - persist conversations and IDE/project state into **IndexedDB**.

If this vertical slice works end-to-end, the via-gent architecture is considered **proven** for MVP-0.

---

## Technical Research Scope Confirmation

**Research Type:** technical  
**Research Topic:** via-gent foundational architectural slice spike (Project Alpha)

**Research Goals:**

- Validate end-to-end vertical slice architecture for IDE shell, agents, and dual FS sync.  
- Confirm TanStack Start + TanStack AI + WebContainers integration patterns for a browser-only IDE route.  
- De-risk client-only Git and persistence constraints (File System Access API + IndexedDB + isomorphic-git adapter).

**Technical Research Scope:**

- Architecture Analysis  design patterns, frameworks, and system architecture for a browser-only multi-agent IDE.  
- Implementation Approaches  development methodologies, coding patterns, and best practices for TanStack Start + TanStack AI + WebContainers.  
- Technology Stack  concrete roles and versions of TanStack Start/Router/AI, WebContainers, Monaco, xterm.js, File System Access API, IndexedDB, isomorphic-git, and idb.  
- Integration Patterns  APIs, protocols, and interoperability between WebContainers, File System Access API, isomorphic-git, and TanStack AI tools.  
- Performance Considerations  boot time, sync performance, Git operations, and persistence constraints within browser limits.

**Research Methodology:**

- Current web data with **rigorous source verification** (Context7, DeepWiki, Tavily/Exa).  
- Multi-source validation for critical technical claims.  
- Confidence levels for uncertain technical information.  
- Preference for **official docs** and maintainer-authored guides, cross-checked against real-world examples.

**Scope Confirmed:** 2025-12-10

---

## Initial Validation of the Project Alpha Specification

### Reference Spec & Inputs

- **Canonical high-level spec:** "Project Alpha" slice in `temporary-tracking-plan.md:L2027	12374` (core thesis, layers, phases, success criteria).
- **Local spike evidence:**
  - `spikes/tanstack-ai-spike/*` 																
    - TanStack Start + TanStack AI minimal streaming chat (`/api/chat` + `useChat`).
  - `spikes/advanced-ide-spike/*`
    - IDE route, WebContainers `FileManager`, agent tools, persistence evidence.
- **Product + remediation context:**
  - `agent-os/product/product-brief-2025-12-09.md`.
  - `docs/bmm-workflow-status.yaml` (spike + advanced spike status, remediation clusters).
- **External documentation (via MCP research):**
  - TanStack Start: SPA mode and **Selective SSR** (`ssr: false`) for browser-only routes.
  - TanStack AI: `useChat`, `fetchServerSentEvents`, `toolDefinition`, `clientTools`, server/client tools.
  - WebContainers: `WebContainer.boot()`, `mount(files)`, terminal integration patterns.
  - File System Access API + IndexedDB: handle serialization and permission model.
  - isomorphic-git: BYO `fs.promises` adapter design and constraints.

### 1. Core Thesis Validation

> If an AI agent, through a browser-only TanStack Start app, can:
> 1) write files to WebContainers,  
> 2) sync those files to local disk via File System Access API,  
> 3) commit via isomorphic-git, and  
> 4) persist conversation/state to IndexedDB,  
> then the architecture is proven.

**Assessment:** Technically achievable, with explicit constraints and required implementations:

- **Browser-only stack:**
  - WebContainers are designed to run Node.js fully in the browser via `WebContainer.boot()` + `webcontainer.mount(files)`.
  - TanStack Start supports SPA mode and per-route `ssr: false` (**Selective SSR**), which must be used for any route touching WebContainers, File System Access API, or other browser-only APIs.
- **File System Access + IndexedDB:**
  - `FileSystemDirectoryHandle` / `FileSystemFileHandle` instances can be **stored in IndexedDB** and restored later; on reload, `queryPermission()` and `requestPermission()` are required to re-establish access.
  - This supports the requirement that project selection and permissions survive reloads.
- **isomorphic-git:**
  - Designed for **bring-your-own filesystem**; no official File System Access adapter exists.
  - A custom **promise-based `fs` implementation** over `FileSystemDirectoryHandle` is required (map `readFile`, `writeFile`, `mkdir`, `readdir`, `stat`, `rm`, etc. to FSA calls).
- **AI tools:**
  - TanStack AI explicitly supports **client-side tools** via `toolDefinition().client(...)` and `clientTools(...)`.
  - This matches the requirement that IDE tools (file, terminal, git) run in the browser and talk directly to WebContainers + FSA.

Conclusion: the **core thesis is sound**. Architecture is proven if (and only if) the missing adapter and orchestration pieces are correctly implemented.

### 2. Architectural Layers vs. Evidence

#### 2.1 UI Layer (Monaco, XTerm, FileTree, ChatPanel)

- Advanced IDE spike already demonstrates:
  - Monaco-based editor wired to in-memory/project files.
  - XTerm terminal bound to WebContainers via `spawn` and stream piping.
  - Chat panel wired via `useChat({ connection: fetchServerSentEvents('/api/chat'), tools })`.
- This matches the Project Alpha diagram (Monaco, XTerm, FileTree, ChatPanel) and AGENTS.md expectation of an IDE shell with multiple panels.

#### 2.2 Unified State Layer (TanStack Store + TanStack Query)

- Product brief and AGENTS.md state that domain stores should be the single source of truth and that TanStack Query handles async/data fetching.
- Current spikes use local store constructs (and PGlite in some evidence) but not yet a fully unified TanStack Store-based state model.
- Architectural direction is correct; the validation work is to converge spike patterns into a **centralized domain state layer** (IDE, Project, Conversation, WebContainers).

#### 2.3 File System Coordination Layer (WebContainers + FSA + Sync Manager)

- `spikes/advanced-ide-spike/src/lib/file-manager.ts` already provides:
  - `WebContainer.boot()` and logging around container lifecycle.
  - `syncToWebContainer()` that mounts a tree derived from a `FileSystemDirectoryHandle`.
  - `writeFile(path, content)` performing dual writes to Disk (FSA) and WebContainer FS.
  - `readFile(path)` and `listFiles(path)` over FSA handles.
- This is a direct partial implementation of the **File System Coordination Layer** in Project Alpha:
  - What is still missing for production:
    - Incremental sync policies (not always full-tree mount) and **exclusion rules** (e.g. ignoring `node_modules`, `.git` when appropriate).
    - A clear **conflict detection strategy** for concurrent edits (WebContainer vs external editor).

#### 2.4 Git Layer (isomorphic-git over File System Access)

- Currently via-gent does not have a full FSA-backed Git implementation; Git spike code uses separate services.
- Deep research on isomorphic-git confirms:
  - Git operations require a Node-like `fs.promises` interface; in browser this is typically provided by LightningFS (IndexedDB-backed).
  - To operate directly on the user's chosen folder, we must implement `fs.promises` over **File System Access** instead of LightningFS.
  - Key risks: performance on deep trees, missing symlink support, path normalization, and frequent permission prompts depending on browser.
- Therefore, the Git layer described in Project Alpha is **feasible** but **currently unimplemented**, and is one of the spike's main research/implementation tasks.

#### 2.5 Persistence Layer (IndexedDB)

- MDN and spec docs confirm that FSA handles are serializable into IndexedDB, but restored handles typically start at `permission = "prompt"`.
- IndexedDB is appropriate for:
  - Conversations and tool logs (messages + tool results).
  - Project metadata (selected folder, open files, layout state, recent projects).
- Advanced IDE spike already includes:
  - A `PersistenceLayer` abstraction for chat history (IndexedDB-based).
  - PGlite experimentation for in-browser Postgres-style persistence.
- This strongly supports the persistence layer envisioned in Project Alpha; the spike's job is to standardize and formalize these patterns.

#### 2.6 AI Agent Layer (TanStack AI useChat + Tools)

- TanStack AI documentation and spikes show:
  - `useChat({ connection: fetchServerSentEvents('/api/chat'), tools })` for streaming chat.
  - `toolDefinition` with `.server()` implementations for server tools.
  - `toolDefinition` with `.client()` + `clientTools(...)` for client-only tools in the browser.
- Advanced IDE spike tool wiring:
  - Client tools for file operations, grep, and `run_command` routed to WebContainers and Git services.
- This confirms that the **AI agent + tool pattern in Project Alpha is aligned** with TanStack AI's intended usage.

### 3. Phases & Success Criteria vs. Existing Evidence

- Project Alpha defines 5 phases (Core Foundation, Sync + Persistence, Git Integration, AI Tools, Validation) plus a 14-step success narrative.
- `docs/bmm-workflow-status.yaml` shows:
  - Phase-2 and Phase-3 spikes already validated basic TanStack AI + Start integration and an advanced IDE spike.
  - Research documents exist for TanStack AI tools, useChat, streaming, WebContainers FS patterns, and IndexedDB persistence.
- Comparison:
  - **Core Foundation**: Largely validated by advanced spike (WebContainer boot, basic terminal, FileManager, IDE route with `ssr: false`).
  - **Sync + Persistence**: Partial evidence from FileManager + IndexedDB chat history, but no fully generalized SyncManager or project metadata schema yet.
  - **Git Integration**: Conceptually planned; requires FSA-backed isomorphic-git adapter.
  - **AI Tools**: Strong evidence from tool definitions in both spikes; need consolidation into a stable tool registry.
  - **Validation**: The 14-step end-to-end scenario is a **clear, testable acceptance sequence** and will be used as the final evaluation script for this spike.

Overall, the Project Alpha specification is **ambitious but well grounded** in:

- Existing spike code.  
- Official framework and browser API patterns.  
- Product brief requirements and remediation plan.

It is adopted as the **governing architecture hypothesis** for this technical research.

---

## Technology Stack Analysis for Project Alpha (Step 02)

This section focuses on the **concrete technology stack** required to realize the Project Alpha slice and validates that each choice is:

- Compatible with a **100% client-side** architecture.  
- Supported by **official docs** and prior via-gent spikes.  
- Sufficient to implement the **14-step success criteria**.

### Programming Languages

- **TypeScript 5.x**
  - Primary language for all application code (routes, domains, tools).
  - Strict typing is critical for TanStack Router/Start + TanStack AI tool schemas.
- **JavaScript (generated/bundled)**
  - WebContainers execute Node.js-compatible JS; build output from Vite/tsc.

### Frameworks and Core Libraries

- **React 19 + TanStack Start (React)**
  - React provides the UI component model for IDE panels (editor, terminal, chat, file tree).
  - TanStack Start adds file-based routing, SPA/SSR control, and integration with TanStack Router.
  - For WebContainer-dependent routes (e.g. `/workspace/:projectId`), `ssr: false` or SPA mode must be used to avoid server execution of browser APIs.

- **TanStack Router**
  - File-based routes under `src/routes` with nested layouts for IDE shell and workspace.
  - Search params used as **canonical state** (e.g. `?file=src/index.tsx`), consistent with product brief.

- **TanStack AI (+ provider adapters)**
  - `@tanstack/ai` core for `chat()` and tool definitions.
  - `@tanstack/ai-gemini` adapter with `createGemini(apiKey)` validated by prior spikes.
  - `@tanstack/ai-react` for `useChat` + `fetchServerSentEvents('/api/chat')` on the client.
  - `@tanstack/ai-client` for `clientTools(...)` and typed client-side tools.

- **WebContainers API (`@webcontainer/api`)**
  - Browser-based Node.js runtime for project execution and terminal processes.
  - Core APIs used in Project Alpha:
    - `WebContainer.boot()` to start the container.
    - `webcontainer.mount(tree)` to load the project structure.
    - `webcontainer.spawn(cmd, args)` for shell and dev server processes.

- **Monaco Editor + @monaco-editor/react**
  - Code editing surface for workspace files.
  - Backed by FileManager + WebContainers FS; must support external file changes (sync from local FS and AI-driven writes).

- **xterm.js**
  - Terminal emulator for interactive shell access in the browser.
  - Integrated with WebContainers via spawned `jsh` process and stream piping.

### Storage, Database, and Persistence

- **IndexedDB (via `idb` / `idb-keyval`)**
  - Persistent storage for:
    - Conversation history and tool results (per project/workspace).
    - Project metadata (selected folder handle references, layout state, recent projects).
  - Stores serialized `FileSystemDirectoryHandle` instances for rehydrating permissions.

- **PGlite (optional evidence layer)**
  - In-browser Postgres-compatible database used in advanced spike for event logging.
  - Not mandatory for minimal Project Alpha slice, but provides valuable evidence for **structured event/event-sourcing style** persistence.

### File System and Git

- **File System Access API**
  - `window.showDirectoryPicker()` to select the project root folder.
  - `FileSystemDirectoryHandle` / `FileSystemFileHandle` to read/write actual files on disk.
  - Permission model: `queryPermission()` + `requestPermission()` on reload, with handles persisted via IndexedDB.

- **isomorphic-git**
  - Pure JS Git implementation designed for Node.js and browser environments.
  - Requires a BYO `fs.promises` adapter; for this spike, the adapter will be built on top of File System Access.
  - Operations targeted for Project Alpha:
    - `init`, `statusMatrix`, `add`, `remove`, `commit`, `log`, and (stretch) `push`/`pull`.

### Development Tools and Platforms

- **Vite 7.x**
  - Bundler for the TanStack Start app used **inside** WebContainers (end-user project) and for via-gent itself.
  - Validated as a peer dependency for latest TanStack Start.

- **Vitest 3.x**
  - Test runner for unit/integration tests (e.g. FileManager, Git adapter, tools, and WebContainer orchestration mocks).

### Cloud/Runtime Environment

- **User Browser (Chrome/Chromium-based)**
  - Primary runtime for everything: TanStack Start app, WebContainers, IndexedDB, File System Access.
  - Requires support for SharedArrayBuffer/WebAssembly features used by WebContainers.

### Technology Adoption Summary (Project Alpha Scope)

- The stack choices are consistent with:
  - via-gent product brief and AGENTS.md tech standards.
  - Existing spikes that successfully validated TanStack Start + AI and WebContainers integration.
- The **main innovation surface** (and risk) is the **File System Access-based Git adapter** and **dual FS sync**. All other layers use patterns already validated in spikes or official docs.

---

## Integration Patterns Analysis (Step 03)

This section analyzes **how components integrate** in the Project Alpha slice: APIs, protocols, and data flows across UI, WebContainers, File System Access, Git, and AI tools.

### IDE Route and WebContainers Integration

- Route: `/workspace/:projectId` (or similar), defined via TanStack Start/Router.
- SSR configuration:
  - `ssr: false` for this route to keep all WebContainers + FS Access usage on the client.
- Lifecycle:
  1. Route loads → IDE layout mounts.
  2. `FileManager.init()` boots WebContainer and attempts to restore `FileSystemDirectoryHandle` from IndexedDB.
  3. If handle exists and permissions grant, `syncToWebContainer()` mounts the tree.
  4. If no handle, user is prompted via `showDirectoryPicker()`.

### File System Integration (Disk ↔ WebContainers)

- **Direction 1: Local Disk → WebContainers**
  - On project open or permission restore:
    - Walk the FSA directory tree and build a virtual `tree` object.
    - `webcontainer.mount(tree)` to reflect source files in the container FS.
  - Exclusion patterns:
    - `.git`, `node_modules`, large binaries, and other heavy directories should be excluded or handled specially.

- **Direction 2: WebContainers → Local Disk**
  - AI tools, Monaco saves, and terminal-driven changes (where appropriate) must be reflected on disk:
    - For **editor saves** and **AI file tools**: always write via FileManager to both WebContainer FS and FSA (dual write).
    - For **terminal-driven writes** (e.g. `npm install`): keep `node_modules` only inside WebContainers for performance; do not mirror to disk.

### Git Integration Patterns

- Git operations should be defined as **tools** that operate on the **FSA-backed repository**:
  - `git_status_tool` → calls isomorphic-git `statusMatrix` via FSA adapter.
  - `git_add_tool`, `git_commit_tool`, `git_log_tool`, and optionally `git_push_tool` / `git_pull_tool`.
- Integration flow:
  1. AI or user triggers Git tool from chat or UI button.
  2. Tool implementation calls isomorphic-git with the FSA adapter.
  3. Results are surfaced both in **terminal/log output** and structured UI (e.g. status panel).

### AI Tool Integration Patterns

- All core IDE actions that mutate state are exposed as **TanStack AI tools**:
  - File tools: `read_file`, `write_file`, `list_files`, `grep`.
  - Terminal/command tool: `run_command` for WebContainer processes.
  - Git tools: as above.
- Client-side execution:
  - Tools are implemented via `toolDefinition().client(...)` and `clientTools(...)`, so they run directly in the browser.
  - Server-side chat endpoint (`/api/chat`) receives tool **definitions** (schemas), not implementations, and remains stateless.

### Data Formats and Protocols

- **HTTP + Server-Sent Events (SSE):**
  - `/api/chat` endpoint streams AI responses via SSE.
  - `useChat` + `fetchServerSentEvents()` on the client side.

- **Binary/text data via FSA and WebContainers streams:**
  - FileManager reads/writes UTF-8 text files for source code.
  - Terminal uses stream-based byte I/O via WebContainers process APIs.

### Integration Risks

- Race conditions between:
  - External editor edits vs. IDE/AI edits.
  - WebContainer FS modifications vs. disk sync.
- Permission revocation for FSA handles between sessions.
- Long-running commands in WebContainers blocking UX if not streamed properly to terminal.

Conclusion: Integration patterns are feasible and align with WebContainers + TanStack AI design, but require careful **sync policies**, **error handling**, and **tool-level safeguards**.

---

## Architectural Patterns and Design (Step 04)

This section consolidates architectural patterns that best support Project Alpha.

### Vertical Slice Architecture

- Project Alpha itself is a **vertical slice**:
  - Cuts through routing, UI, state, WebContainers, FS, Git, persistence, and AI tools.
  - Provides a fully demonstrable end-to-end path without needing all future features.

### Layered + Modular Architecture

- Layers align with the Project Alpha diagram and AGENTS.md:
  - UI → State → FS Coordination → Git → Persistence → AI.
- Each layer is encapsulated behind **domain-oriented modules**:
  - `lib/webcontainer/*`, `lib/filesystem/*`, `lib/git/*`, `lib/persistence/*`, `lib/agent/*`.
  - Routes and components depend only on these modules, not raw APIs.

### Selective SSR and SPA Mode

- Architectural rule:
  - Non-IDE routes (marketing/docs) may use SSR for performance and SEO.
  - **IDE routes disable SSR** (`ssr: false`) to avoid WebContainers/FSA/IndexedDB on the server and to reduce hydration issues.

### Event-Driven IDE State

- IDE behaviors (file opened, file saved, command run, git commit) can be modeled as **events**, even if not fully persisted as event-sourced streams in MVP-0.
- This supports later evolution into a more explicit event-sourcing design (PGlite, pgvector, etc.).

### Security & Isolation Patterns

- No server access to user code or API keys; all secrets remain client-side.
- Git operations and FS access are scoped to **user-approved directories**.
- WebContainers provide sandboxed process execution.

Conclusion: The combination of **vertical slices**, **layered modules**, and **selective SSR** supports a maintainable and evolvable architecture while satisfying client-only constraints.

---

## Implementation Approaches and Technology Adoption (Step 05)

This section summarizes recommended **implementation strategies** and **adoption plans** for Project Alpha.

### Technology Adoption Strategy

- Build directly on the validated spikes:
  - Generalize `spikes/tanstack-ai-spike` patterns for `/api/chat` and AI tools.
  - Generalize `spikes/advanced-ide-spike` patterns for WebContainers, FileManager, persistence, and IDE route.
- Implement the FSA-backed isomorphic-git adapter as a dedicated module and **keep it spike-scoped** until performance and UX characteristics are understood.

### Development Workflow

- Use standard via-gent workflows:
  - `pnpm dev` for local dev.
  - `pnpm test` for unit/integration tests.
  - `pnpm typecheck` as part of validation for the spike.

- Require tests for:
  - FileManager sync semantics (disk ↔ WebContainers).
  - Git adapter behavior on small repositories.
  - AI tools calling FileManager, WebContainers, and git modules.

### Testing, Deployment, and Operations

- Testing:
  - Unit tests around FS, Git, and tool invocation.
  - Integration tests for the `/workspace/:projectId` route (mock WebContainers where necessary).
  - E2E tests for the 14-step acceptance sequence.

- Deployment:
  - Spike can be deployed as a **separate app** (e.g. under `spikes/foundational-slice-alpha`) or feature-flagged within via-gent; production promotion requires passing all validation steps.

### Team Skills and Cost

- Required skills:
  - TypeScript, React, TanStack Start/Router/Query/AI.
  - WebContainers integration patterns.
  - Browser storage APIs (IndexedDB, File System Access).
  - Git internals sufficient for using isomorphic-git.

Conclusion: Implementation is feasible with existing via-gent patterns and modern web capabilities, but requires focused effort on **FS/Git adapters**, **sync correctness**, and **developer tooling**.

---

## Technical Synthesis and Recommendations (Step 06)

### Executive Summary

- Project Alpha defines a **foundational vertical slice** that, if implemented successfully, proves that via-gent's **client-only, multi-agent IDE** architecture is viable.
- Existing spikes plus official documentation confirm that:
  - TanStack Start + TanStack AI can provide the required routing and AI tooling.
  - WebContainers can host the workspace runtime entirely in the browser.
  - File System Access and IndexedDB can support persistent projects and state across sessions.
  - isomorphic-git can be adapted to the browser if a suitable FS adapter is provided.

### Key Findings

1. **Architecture is plausible and standards-aligned**
   - All technologies required for Project Alpha are available and have working patterns.
2. **Primary risks are in FS/Git/persistence edges**
   - File System Access adapter for isomorphic-git is novel and must be designed carefully.
   - Sync policies between Disk and WebContainers must be explicit and tested.
   - Permission and quota limitations in browsers must be handled gracefully.
3. **Spikes provide strong groundwork**
   - Existing spikes prove core integration pieces; Project Alpha builds on these rather than starting from scratch.

### Recommendations

1. **Implement Project Alpha as a dedicated spike module**
   - Use the proposed `spikes/foundational-slice-alpha/` structure.
   - Keep concerns (WebContainers, FSA, Git, tools, persistence) modular and well-named.

2. **Prioritize FS/Git adapter and sync tests**
   - Treat the FSA-based isomorphic-git adapter and SyncManager as separate, test-heavy sub-features.
   - Validate behavior on small but non-trivial repositories first.

3. **Use the 14-step sequence as the acceptance test**
   - Automate as much as possible via tests and/or scripted flows.
   - Require that all 14 steps pass reliably across supported browsers before promoting patterns into the main via-gent architecture.

4. **Document and codify patterns for reuse**
   - When Project Alpha is successful, extract patterns into:
     - AGENTS.md or standards docs (FS coordination, Git adapter, AI tools contract).
     - Reusable modules under `src/lib` and domain boundaries.

### Conclusion

With Project Alpha implemented and validated, via-gent will have:

- Concrete evidence that a **browser-only AI IDE** with dual FS, Git, and persistent multi-agent workflows is technically feasible.
- A reusable, tested architectural slice to guide subsequent remediation clusters and MVP features.
- Reduced risk around the most uncertain aspects of the architecture (FS/Git/persistence), enabling confident investment in the broader roadmap.

