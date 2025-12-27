---
stepsCompleted: []
inputDocuments:
  - .bmad/custom/src/modules/cham/status/2025-12-10/diagnostic-request.md
  - agent-os/product/non-tech-specification.md
  - docs/assessment/implementation-master-plan/kick-start-prompt.md
  - docs/analysis/spikes/advanced-ide-spike-fix-report-2025-12-10.md
  - docs/research/webcontainers-terminal-patterns-2025-12-10.md
  - docs/research/indexeddb-persistence-patterns-2025-12-10.md
  - agent-os/specs/diagnostic-framework-2025-12-10/reports/final-diagnostic-report.md
workflowType: 'product-brief'
lastStep: 0
project_name: 'via-gent'
user_name: 'Apple'
date: '2025-12-10'
---

# Product Brief: via-gent – Foundational Architectural Slice ("Project Alpha")

**Date:** 2025-12-10  
**Author:** Apple

---

## 1. Purpose of This Brief

This brief defines **Project Alpha**: a **foundational architectural slice** for via-gent that must *prove or falsify* the viability of the fully client-side, multi-agent IDE vision.

Rather than a smallest feature vertical, Project Alpha is a **cross-cutting architectural experiment** whose success or failure determines whether via-gent can:

- Run a usable dev environment entirely in the browser via **WebContainers**
- Access and synchronize a **real local project** using **File System Access API**
- Provide **real Git workflows** (local → GitHub) using **isomorphic-git**
- Orchestrate **AI agents (TanStack AI)** that can *actually code* via tools
- Persist **projects, conversations, and state** across sessions without a backend

If this slice works, via-gents chosen stack is validated for future roadmaps. If it fails, the architecture must be reconsidered before further investment.

---

## 2. Context & Problem

The diagnostic framework and research docs highlighted critical doubts:

- **Architecture uncertainty**: Can a zero-server, browser-only design realistically support a serious IDE with persistence, Git, and multi-project workflows?
- **Integration risk**: WebContainers, File System Access API, isomorphic-git, TanStack Start/Router, TanStack AI, Monaco, and xterm.js must all cooperate in a single browser tab.
- **State & persistence confusion**: How to model and persist:
  - Project selection & configuration
  - Conversation history and tool results
  - File system permissions & paths
  - Long-running dev-server processes inside WebContainers
- **Agent effectiveness doubt**: Today, agents can propose code, but cannot reliably *operate* on a real project (run commands, modify files, manage Git) in a durable way.

Without a **hard, end-to-end proof** that these can work together, every future roadmap item is built on unstable ground.

Project Alpha exists to **answer this question conclusively**.

---

## 3. Target Users & Usage Scenarios

### 3.1 Primary User: Developer using via-gent as a Browser IDE

- **Profile**: Intermediate-to-senior web developer, comfortable with Node, Git, and common frameworks.
- **Environment**: Local projects on disk, GitHub repos, VS Code as their primary editor today.
- **Motivation**:
  - Wants a browser-based, AI-native IDE that is ~80% of their local VS Code for many tasks
  - Wants to let AI agents *actually manipulate their repo* rather than copy/paste patches
  - Prefers **zero server lock-in**; everything should run locally or within the browser sandbox.

### 3.2 Core Scenarios for the Slice

For **Project Alpha**, we focus on a single-project, single-user, single-tab scenario:

- **S1: Open Local Project in via-gent**
  - User grants folder access via File System Access API.
  - via-gent loads project structure into a file tree and WebContainers.

- **S2: Edit & Run Project in Browser**
  - User edits files in Monaco, changes persist to both WebContainers FS and local disk.
  - User runs `npm install`, `npm run dev` etc. inside a WebContainers-powered terminal.

- **S3: AI-Assisted Coding on Real Files**
  - User chats with an AI agent that can:
    - Read files, propose changes, and *apply them* via tools.
    - Run tests / lint via terminal tools.

- **S4: Git Commit & Push from Browser**
  - via-gent exposes Git status, staging, commit, and push using isomorphic-git against the *real local folder*, then to GitHub.

- **S5: Close and Reopen**
  - User closes the tab and comes back later.
  - via-gent restores:
    - Which project is open
    - Conversation history
    - Panel layout and open files
    - Any still-valid file system permissions

---

## 4. Goals and Non-Goals

### 4.1 Goals (What This Slice Must Prove)

1. **End-to-End Local Project Flow**
   - From folder picker → WebContainers → Monaco → terminal → Git → GitHub → back.

2. **Agent Tooling on Real Projects**
   - AI agents can reliably:
     - Read existing files
     - Create/edit/delete/move files and folders
     - Run commands in WebContainers
     - Surface results back into the conversation

3. **Persistence Without a Backend**
   - Conversation history and project metadata persist via IndexedDB (or similar), not a server DB.

4. **Coherent State Model**
   - Clear separation between:
     - **Local FS state** (source of truth for project files)
     - **WebContainers state** (runtime mirror for dev server and commands)
     - **UI/IDE state** (layout, open files, selections)
     - **Conversation state** (messages + tool traces)

5. **Acceptable UX & Performance for a Single Project**
   - Fast enough for a realistic, moderately sized front-end repo.
   - No catastrophic hangs when syncing or running typical dev commands.

### 4.2 Non-Goals (Intentionally Out of Scope for Alpha)

- Multi-project workspaces or project switching UX.
- Multi-user collaboration or live sharing.
- Complex workspace templates, scaffolding, or cloud projects.
- Full reproduction of all VS Code capabilities.
- Advanced agent orchestration beyond a single primary coder agent + tools.

---

## 5. Success Criteria

This slice is **successful** if all of the following hold:

1. **Local Project Loop**
   - User can open a local folder, see files in the tree, open/edit them in Monaco, and see the same changes on disk in their OS.

2. **Dev Server in WebContainers**
   - From the in-browser terminal, the user can run `npm install` and `npm run dev` for a typical Vite/React/TanStack app, and see the app running in a preview frame.

3. **Agent-Driven Code Change**
   - User asks the agent to "add a new button component" or similar.
   - Agent:
     - Reads relevant files
     - Applies file changes via tools
     - Optionally runs tests or dev commands
     - Explains what it did, with links to changed files.

4. **Git Workflow**
   - User can run:
     - `git status` (view changes)
     - Stage files
     - Commit with message
     - Push to a GitHub repo configured for that folder.

5. **Persistence Across Reloads**
   - After closing and reopening the tab, via-gent can:
     - Restore last open project (subject to permissions)
     - Reload conversation history for that project
     - Restore at least last open file + basic layout

6. **No Hidden Server Requirements**
   - Everything required for the above runs either:
     - In the browser (WebContainers, IndexedDB), or
     - Against the users own local filesystem and GitHub account.

If any of these cannot be achieved *within realistic constraints*, the slice is considered a **red flag** for the current architecture.

---

## 6. Scope of Work (Functional Scope)

This section translates the goals into concrete capabilities the implementation must deliver.

### 6.1 IDE Shell (UI & Routing)

- TanStack Start-based SPA with routes:
  - `/` – simple dashboard / project picker
  - `/workspace/:projectId` – single-project IDE view
- IDE layout with panels:
  - File tree
  - Monaco editor
  - Xterm.js terminal bound to WebContainers shell
  - (Optional) Preview iframe for dev server
  - Chat panel for agent interactions

### 6.2 WebContainers Integration

- Boot a single WebContainers instance per workspace.
- Mount a virtual project tree; when a local folder is selected, mirror its contents into WebContainers using mount operations.
- Expose an API to:
  - Run commands (`npm install`, `npm run dev`, `npm test`, etc.)
  - Stream stdout/stderr into xterm
  - Track process lifecycle and exit codes

### 6.3 File System Access API Integration

- Request directory access via `showDirectoryPicker()`.
- Read the directory structure into an in-memory representation.
- Provide operations:
  - Read text files
  - Write text files
  - Create/delete/move/rename files and folders
- Store necessary handles/metadata to allow re-binding on subsequent visits, with permission re-check.

### 6.4 Sync Layer (Local ↔ WebContainers)

- Define **Local FS as the source of truth** for project files.
- Implement one-way + on-demand sync:
  - On project open: local → WebContainers full sync
  - On file edit in Monaco: write to both local FS and WebContainers FS
  - On external change detection (if practical): local → WebContainers for affected files
- Define ignore rules:
  - Do not sync `node_modules` or other heavy artifacts to local disk if they are purely runtime.

### 6.5 Git Integration (isomorphic-git)

- Create an `fs` adapter that maps isomorphic-git calls onto the File System Access API provider.
- Support operations for the alpha slice:
  - `statusMatrix` or equivalent for UI status display
  - `add`, `remove`, `commit`
  - `log` (basic history)
  - `push` & `pull` to a GitHub remote using PAT or similar auth

### 6.6 Persistence Layer (IndexedDB or Equivalent)

- Use a small persistence service (e.g. `idb`) for:
  - Conversation history per project
  - Tool invocation history (or at least summaries)
  - IDE layout & open files
  - Lightweight project metadata (recent projects, last opened, etc.)
- Define simple versioned schemas to allow future migrations without data loss.

### 6.7 Agent Layer (TanStack AI + Tools)

- Integrate TanStack AI with:
  - Gemini (and/or other providers) via adapters
  - Streaming responses to the chat panel
- Define **client-side tools** (not server-only) for:
  - File operations (read/write/list/create/delete/move/rename)
  - WebContainers terminal commands (run, stream logs)
  - Git status/add/commit/push
- Ensure:
  - Every tool action that touches files is reflected in the UI
  - Tool errors surface clearly in the conversation

---

## 7. Out-of-Scope / Future Extensions

Once Project Alpha is validated, future briefs and slices can extend to:

- Multiple simultaneous projects and workspace management.
- UI and orchestration for multiple cooperating agents (planner, coder, validator, etc.).
- Rich project templates and cloud-hosted workspaces.
- Non-web targets (mobile, backend services) and multi-language support.
- Team workflows, sharing, and review flows.

These are explicitly **not required** for this slice to be successful.

---

## 8. Dependencies & Constraints

### 8.1 Key Dependencies

- **WebContainers API** (StackBlitz webcontainer-core)
- **File System Access API** (modern Chromium-based browsers only)
- **isomorphic-git** with a compatible `fs` adapter
- **TanStack Start + TanStack Router** for SPA shell
- **TanStack AI** for agent orchestration + tool calling
- **Monaco Editor** for code editing
- **xterm.js** for the in-browser terminal
- **IndexedDB (`idb` helper)** for persistence

### 8.2 Constraints

- Browser-only, no dedicated backend services for this slice.
- Limited to browsers supporting both WebContainers and File System Access API.
- Git operations are bound to what isomorphic-git and browser networking allow (e.g. CORS, auth flows).

---

## 9. Risks & Open Questions

1. **FS Access + isomorphic-git Adaptation Risk**
   - Building a robust `fs` adapter on top of File System Access API is non-trivial.
   - Error handling, concurrency, and directory traversal need careful design.

2. **Performance & UX Under Load**
   - Large projects or heavy `node_modules` may cause slow mounts or syncs.
   - Terminal I/O and dev server startup times must remain acceptable.

3. **Permission Lifecycle**
   - File System Access API permissions may not persist cleanly across browser restarts.
   - UX must gracefully handle re-requesting permissions without breaking the mental model.

4. **Error Recovery**
   - Failed tool runs (e.g. `npm install` failures) must not corrupt local project state.
   - AI agents must not generate large-scale destructive changes without clear confirmation.

5. **Security & Trust**
   - Users must understand what the agent is allowed to do to their local files and Git remotes.
   - There must be clear boundaries and logs of agent-driven actions.

---

## 10. Alignment with via-gent Vision

This slice is directly aligned with the **non-technical product specification**:

- Demonstrates via-gent as a **client-only, multi-agent IDE** that can work on *real* local projects.
- Proves the feasibility of **zero-knowledge, BYOK** patterns (keys stay with the user, projects stay local).
- Establishes the **AI-first workflow** where conversations, tools, and the IDE surface form a coherent loop.

If Project Alpha succeeds, it becomes the **architectural backbone** on which more advanced features, workspaces, and agent bundles can be layered with confidence.
