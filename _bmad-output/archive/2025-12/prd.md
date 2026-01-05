---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
inputDocuments:
  - docs/analysis/product-brief-via-gent-2025-12-10-architectural-slice.md
  - docs/analysis/research/technical-via-gent-foundational-architectural-slice-spike-research-2025-12-10.md
  - docs/ux-design-specification.md
  - docs/ux-color-themes.html
  - docs/ux-design-directions.html
  - docs/bmm-workflow-status.yaml
documentCounts:
  briefs: 1
  research: 1
  brainstorming: 0
  projectDocs: 3
workflowType: 'prd'
lastStep: 11
project_name: 'via-gent'
user_name: 'Apple'
date: '2025-12-10'
---

# Product Requirements Document
## Via-Gent: Foundational Architectural Slice ("Project Alpha")

**Version:** 1.0  
**Author:** Apple  
**Date:** 2025-12-10  
**Status:** Draft  

---

## 1. Executive Summary

### 1.1 Product Vision

Via-gent is a **100% browser-based, AI-powered IDE** where developers collaborate with AI agents to build full-stack applications without any server infrastructure. Projects are scaffolded, coded, tested, and deployed entirely within the browser, with files persisted to the user's local machine via the File System Access API.

### 1.2 Project Alpha Purpose

**Project Alpha** is a **foundational architectural slice**—not a feature release, but a critical validation spike that must prove or falsify the viability of via-gent's core technical architecture:

> **If an AI agent can, through a browser-only TanStack Start app, execute tools that write files to WebContainers, sync those files to the user's local disk via File System Access API, commit via isomorphic-git, and persist conversation/state to IndexedDB—then the architecture is proven.**

### 1.3 Success Statement

Project Alpha succeeds if a user can:
1. Open a local project folder in Via-gent
2. Edit files in Monaco, run dev server in WebContainers
3. Ask an AI agent to "add a login form" and watch it create the component
4. Commit changes and push to GitHub—all from the browser
5. Close the tab, reopen it, and resume exactly where they left off

---

## 2. Problem Statement

### 2.1 Core Problem

Modern web developers face a **setup tax**: creating a new project with best practices requires 2+ hours of boilerplate configuration. Existing solutions either:
- Require cloud lock-in (CodeSandbox, Replit)
- Offer AI that generates code but can't execute it (ChatGPT, Copilot)
- Lack persistence across sessions (Stackblitz without account)

### 2.2 Why This Matters Now

Via-gent's architecture claims to solve this with a radical approach: zero-server, fully client-side, AI agents that can *actually manipulate* the user's real project files. But this claim is **unproven**. Previous remediation efforts failed because:

- **Architecture uncertainty**: Can WebContainers + File System Access API + isomorphic-git actually work together?
- **State confusion**: How to persist projects, conversations, and permissions across sessions?
- **Agent ineffectiveness**: AI proposes code but can't reliably operate on real projects

Project Alpha exists to **answer these questions conclusively**.

### 2.3 Target Users

| User | Profile | Key Pain Point |
|------|---------|----------------|
| **Alex (Primary)** | Solo full-stack developer, 25-35 | "Project setup takes 2 hours" |
| **Jordan (Secondary)** | Student/bootcamp grad, 18-24 | "I don't know how to set up a dev environment" |
| **Taylor (Tertiary)** | Workshop instructor, 30-45 | "Half my workshop time is npm install errors" |

---

## 3. Goals and Success Criteria

### 3.1 Goals (What This Slice Must Prove)

| Goal | Description | Validation |
|------|-------------|------------|
| **G1: Local Project Flow** | Folder picker → WebContainers → Monaco → terminal → Git → GitHub | User edits file, sees change on disk |
| **G2: Agent Tooling** | AI agents reliably read/write/run on real projects | Agent creates component, file appears in tree |
| **G3: Client-Only Persistence** | IndexedDB/FSA handles survive page reload | User closes tab, reopens, state restored |
| **G4: Coherent State Model** | Clear separation: LocalFS / WebContainers / UI / Conversation | No state confusion during operation |
| **G5: Acceptable Performance** | Fast enough for moderately-sized front-end repos | Dev server starts in <30s |

### 3.2 Non-Goals (Explicitly Out of Scope)

- Multi-project workspace switching
- Multi-user collaboration/live sharing
- Complex project templates or cloud workspaces
- Full VS Code feature parity
- Multi-agent orchestration beyond single coder agent

### 3.3 Success Criteria

**The 14-Step Validation Sequence:**

| # | Step | Success Indicator |
|---|------|-------------------|
| 1 | User opens app | Dashboard loads |
| 2 | Click "Open Local Folder" | FSA grants permission |
| 3 | Local files appear in FileTree | Mounted to WebContainer |
| 4 | Click a file | Monaco opens it |
| 5 | Type in Monaco | File saves to local disk |
| 6 | Open terminal | jsh shell interactive |
| 7 | Run `npm install` | Dependencies install in WebContainer |
| 8 | Run `npm run dev` | Dev server starts, preview shows |
| 9 | Open chat | AI agent available |
| 10 | Say "Create a button component" | Agent uses tools |
| 11 | Tool writes file | Monaco shows new file, local disk has it |
| 12 | Refresh page | Everything restores from IndexedDB + local FS |
| 13 | Commit changes | isomorphic-git creates commit |
| 14 | Push to GitHub | Changes appear on GitHub |

**If all 14 steps work, the architecture is validated.**

---

## 4. User Journeys

### 4.1 Journey 1: First-Time Project Opening

```
Landing Page → Click "Open Project" 
    → File System Access prompt → Grant permission
    → Files sync to WebContainers → FileTree populated
    → Click file → Monaco opens → Ready to code
```

**Key Moments:**
- FSA permission explanation before browser prompt
- Loading indicator during WebContainer mount
- Clear "Ready" state when IDE is operational

### 4.2 Journey 2: AI-Assisted Coding

```
Open Chat Panel (Cmd+K) → Type "Add a contact form"
    → Agent explains plan → User confirms "Go ahead"
    → Tool execution visible (readFile, writeFile badges)
    → Code appears with green diff highlights
    → Preview hot-reloads → User sees working form
```

**Key Moments:**
- Plan shown before execution (builds trust)
- Tool activity visible in real-time
- Immediate visual confirmation in preview

### 4.3 Journey 3: Session Restoration

```
Return to Via-gent → Dashboard shows recent projects
    → Click project → FSA permission re-check
    → IndexedDB restores: open files, scroll positions, chat history
    → WebContainer re-mounts from disk → Dev server restarts
    → User continues exactly where they left off
```

**Key Moments:**
- Permission re-grant should be one click
- Full state restoration (tabs, positions, panels)
- Background dev server startup

### 4.4 Journey 4: Git Commit and Push

```
Make changes → Git status shows modified files
    → Stage files → Enter commit message → Commit
    → Configure GitHub remote (if needed) → Push
    → See success confirmation → Changes live on GitHub
```

**Key Moments:**
- Visual diff before commit
- GitHub auth flow (PAT or OAuth)
- Success confirmation with link to GitHub

---

## 5. Functional Requirements

### 5.1 IDE Shell (FR-IDE)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-IDE-01 | TanStack Start SPA with file-based routing | P0 | Routes: `/`, `/workspace/:projectId` |
| FR-IDE-02 | IDE layout with resizable panels | P0 | FileTree, Editor, Terminal, Preview, Chat |
| FR-IDE-03 | Monaco editor integration | P0 | Syntax highlighting, auto-save, multiple tabs |
| FR-IDE-04 | xterm.js terminal bound to WebContainers | P0 | Interactive shell, command history |
| FR-IDE-05 | Live preview iframe for dev server | P0 | Hot-reload, device frame options |
| FR-IDE-06 | Agent chat panel | P0 | Streaming responses, tool execution badges |

### 5.2 WebContainers Integration (FR-WC)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-WC-01 | Boot WebContainers on workspace open | P0 | `WebContainer.boot()` succeeds |
| FR-WC-02 | Mount project files from FileTree | P0 | 100+ files mounted without error |
| FR-WC-03 | Spawn interactive shell | P0 | `jsh` responsive to user input |
| FR-WC-04 | Run npm commands | P0 | `npm install`, `npm run dev` work correctly |
| FR-WC-05 | Stream stdout/stderr to terminal | P0 | Real-time output display |
| FR-WC-06 | Track process lifecycle | P0 | Exit codes surfaced to UI |

### 5.3 File System Access Integration (FR-FS)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-FS-01 | Request directory access via `showDirectoryPicker()` | P0 | Permission granted and handle stored |
| FR-FS-02 | Read all files from local directory | P0 | Complete file tree retrieved |
| FR-FS-03 | Write files back to local directory | P0 | Changes persist to disk |
| FR-FS-04 | Create/delete/rename files and folders | P0 | All CRUD operations work |
| FR-FS-05 | Permission persistence via handle storage | P0 | Handles survive page reload |
| FR-FS-06 | Fallback mode for denied permissions | P1 | Virtual FS only if access denied |

### 5.4 Dual Sync Layer (FR-SYNC)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-SYNC-01 | Initial sync: Local FS → WebContainers | P0 | Full tree mounted on project open |
| FR-SYNC-02 | Editor save: dual write to disk + WebContainers | P0 | Both systems updated on save |
| FR-SYNC-03 | Exclusion rules for `node_modules`, `.git` | P0 | Heavy directories not synced to disk |
| FR-SYNC-04 | Debounced sync (2s) to prevent storms | P1 | Rapid changes don't cause loops |

### 5.5 Git Integration (FR-GIT)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-GIT-01 | `fs` adapter for isomorphic-git over FSA | P0 | Git operations use local folder |
| FR-GIT-02 | Git status display | P0 | Show modified/staged/untracked |
| FR-GIT-03 | Git add/remove operations | P0 | Stage/unstage files |
| FR-GIT-04 | Git commit with message | P0 | Commit created in local `.git` |
| FR-GIT-05 | Git push to GitHub | P1 | Changes uploaded to remote |
| FR-GIT-06 | Git pull from GitHub | P1 | Changes downloaded to local |

### 5.6 Persistence Layer (FR-PERSIST)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-PERSIST-01 | Conversation history per project | P0 | Messages survive page reload |
| FR-PERSIST-02 | Tool execution history | P0 | Tool results logged and retrievable |
| FR-PERSIST-03 | IDE layout state | P0 | Panel sizes, open tabs restored |
| FR-PERSIST-04 | Project metadata (recent projects) | P0 | Dashboard shows recent projects |
| FR-PERSIST-05 | FSA handle storage in IndexedDB | P0 | Handles serialized and restored |
| FR-PERSIST-06 | Schema versioning for migrations | P1 | Data survives schema changes |

### 5.7 AI Agent Layer (FR-AGENT)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-AGENT-01 | TanStack AI `useChat` integration | P0 | Streaming chat functional |
| FR-AGENT-02 | Client-side tools via `clientTools()` | P0 | Tools execute in browser |
| FR-AGENT-03 | File tools: read, write, list, create, delete | P0 | All operations work |
| FR-AGENT-04 | Terminal tool: `run_command` | P0 | Commands execute in WebContainers |
| FR-AGENT-05 | Git tools: status, add, commit | P1 | Git operations via agent |
| FR-AGENT-06 | Tool → UI sync | P0 | Tool writes file → editor updates |
| FR-AGENT-07 | Gemini adapter with BYOK | P0 | User provides own API key |

---

## 6. Non-Functional Requirements

### 6.1 Performance (NFR-PERF)

| ID | Requirement | Target | Rationale |
|----|-------------|--------|-----------|
| NFR-PERF-01 | WebContainer boot time | <5s | User expects fast startup |
| NFR-PERF-02 | File mount (100 files) | <3s | Reasonable for typical project |
| NFR-PERF-03 | Dev server start | <30s | Include npm install if needed |
| NFR-PERF-04 | Agent first token (TTFT) | <2s | Perceived responsiveness |
| NFR-PERF-05 | Preview hot-reload | <2s | Instant feedback loop |
| NFR-PERF-06 | File save to disk | <500ms | Feels instantaneous |

### 6.2 Reliability (NFR-REL)

| ID | Requirement | Target | Rationale |
|----|-------------|--------|-----------|
| NFR-REL-01 | File sync reliability | 99%+ | Data loss unacceptable |
| NFR-REL-02 | State restoration | 99%+ | User trusts persistence |
| NFR-REL-03 | WebContainer stability | No crash per session | Basic usability |
| NFR-REL-04 | No data corruption | 0 incidents | Trust is paramount |

### 6.3 Usability (NFR-USE)

| ID | Requirement | Target | Rationale |
|----|-------------|--------|-----------|
| NFR-USE-01 | Time to first project | <2 min | Minimize friction |
| NFR-USE-02 | Onboarding completion | >70% | Reduce abandonment |
| NFR-USE-03 | Error recovery path | <10s to understand | Clear guidance |
| NFR-USE-04 | Keyboard accessibility | Full | Developer expectation |

### 6.4 Security (NFR-SEC)

| ID | Requirement | Target | Rationale |
|----|-------------|--------|-----------|
| NFR-SEC-01 | No server data transmission | 100% | Zero-knowledge architecture |
| NFR-SEC-02 | API keys client-only | User controls keys | BYOK model |
| NFR-SEC-03 | FSA scoped to user-approved dirs | Per session | Browser security model |
| NFR-SEC-04 | WebContainers sandboxed | Per browser spec | Isolated execution |

### 6.5 Compatibility (NFR-COMPAT)

| ID | Requirement | Target | Rationale |
|----|-------------|--------|-----------|
| NFR-COMPAT-01 | Chrome 86+ | Full support | Primary target |
| NFR-COMPAT-02 | Edge 86+ | Full support | Chromium-based |
| NFR-COMPAT-03 | Safari 15.2+ | FSA support | Modern Safari |
| NFR-COMPAT-04 | Firefox 115+ | IndexedDB fallback | No FSA, virtual FS |

---

## 7. Technical Constraints

### 7.1 Architecture Constraints

| Constraint | Description | Impact |
|------------|-------------|--------|
| **Browser-Only** | No backend services for core functionality | All state client-side |
| **WebContainers Required** | SharedArrayBuffer/WASM support | Limits browser compatibility |
| **FSA Required (Tier 2)** | Local file persistence needs FSA | Non-FSA browsers use IndexedDB only |
| **Single Session** | One active workspace per tab | No multi-window sync |

### 7.2 Technology Stack (Locked)

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | TanStack Start | 1.140.0+ |
| Router | TanStack Router | 1.140.0+ |
| AI | TanStack AI | 0.0.3+ |
| AI Adapter | @tanstack/ai-gemini | 0.0.3+ |
| WebContainers | @webcontainer/api | latest |
| Editor | Monaco Editor | latest |
| Terminal | xterm.js | latest |
| Git | isomorphic-git | latest |
| Persistence | idb (IndexedDB wrapper) | latest |
| Schema | Zod | 4.x |
| Build | Vite | 7.x |

### 7.3 Dependency Constraints

- **isomorphic-git**: Requires custom `fs.promises` adapter for File System Access API
- **TanStack Start**: Must use `ssr: false` for IDE routes (WebContainers are browser-only)
- **Monaco**: Heavy bundle, defer loading until IDE route

---

## 8. Risks and Mitigations

### 8.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| FSA + isomorphic-git adapter fails | Medium | High | Spike validation first; fallback to IndexedDB |
| WebContainers performance on large projects | Medium | Medium | Limit sync to source files; exclude node_modules |
| FSA permission loss on browser restart | High | Medium | Clear UX for re-granting; graceful degradation |
| IndexedDB quota exceeded | Low | High | Quota monitoring; purge old conversations |

### 8.2 User Experience Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Users confused by permission prompts | Medium | Medium | Pre-explain before prompts; retry flows |
| AI agent produces broken code | Medium | High | Diff review before applying; undo support |
| State restoration fails | Low | High | Explicit save indicators; export option |

### 8.3 Mitigation Strategy

**Red Flag Protocol:** If any of the 14 success steps cannot be achieved within realistic constraints, the slice is considered a **red flag** for the current architecture, and alternative approaches must be explored before further investment.

---

## 9. Appendix

### 9.0 Requirements Implementation Status (Updated 2025-12-11)

#### Epic 3 Completed Requirements ✅

| ID | Requirement | Status | Validated By |
|----|-------------|--------|--------------|
| FR-FS-01 | Request directory access via `showDirectoryPicker()` | ✅ Complete | 52 tests |
| FR-FS-02 | Read all files from local directory | ✅ Complete | LocalFSAdapter |
| FR-FS-03 | Write files back to local directory | ✅ Complete | LocalFSAdapter |
| FR-FS-04 | Create/delete/rename files and folders | ✅ Complete | LocalFSAdapter |
| FR-FS-05 | Permission persistence via handle storage | ✅ Complete | permission-lifecycle.ts |
| FR-SYNC-01 | Initial sync: Local FS → WebContainers | ✅ Complete | SyncManager |
| FR-SYNC-02 | Editor save: dual write to disk + WebContainers | ✅ Complete | SyncManager |
| FR-SYNC-03 | Exclusion rules for `node_modules`, `.git` | ✅ Complete | SyncManager |

#### Epic 4.5 New Requirements (Project Fugu)

| ID | Requirement | Priority | Epic |
|----|-------------|----------|------|
| FR-FUGU-01 | Enhanced FSA permission persistence (Chrome 122+) | P0 | 4.5.1 |
| FR-FUGU-02 | File watcher for external change detection | P0 | 4.5.2 |
| FR-FUGU-03 | Async clipboard with syntax highlighting | P1 | 4.5.3 |
| FR-FUGU-04 | Build status badging API | P2 | 4.5.4 |
| FR-FUGU-05 | Local font selection | P3 | 4.5.5 |
| FR-FUGU-06 | Web Share API for snippets | P3 | 4.5.6 |

---

### 9.1 Glossary

| Term | Definition |
|------|------------|
| **WebContainers** | StackBlitz technology to run Node.js in the browser |
| **FSA** | File System Access API - browser API for local file access |
| **BYOK** | Bring Your Own Key - user provides API keys |
| **isomorphic-git** | Pure JavaScript Git implementation for browser/Node |
| **Dual Sync** | Keeping WebContainers FS and local disk in sync |

### 9.2 Related Documents

- [Product Brief: Foundational Architectural Slice](docs/analysis/product-brief-via-gent-2025-12-10-architectural-slice.md)
- [Technical Research Report](docs/analysis/research/technical-via-gent-foundational-architectural-slice-spike-research-2025-12-10.md)
- [UX Design Specification](docs/ux-design-specification.md)
- [BMM Workflow Status](docs/bmm-workflow-status.yaml)

### 9.3 Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-10 | Apple | Initial PRD for Project Alpha |

---

**PRD Complete** ✅

*Generated via BMAD PRD Workflow*  
*Project: Via-Gent Foundational Architectural Slice*
