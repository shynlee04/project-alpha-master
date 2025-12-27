# Product Roadmap

> **Strategic ordering based on:** AI-first prioritization, technical dependencies, best-practice architecture, future extensibility.  
> **Last Updated:** 2025-12-21 (AI Foundation prioritized)

---

## Phase 1: Foundation & Core Infrastructure ✅ `COMPLETE`

| # | Feature | Description | Effort |
|---|---------|-------------|--------|
| 1 | [x] Project Bootstrap | TanStack Start SPA with file-based routing, Vite build | `S` |
| 2 | [x] IDE Layout Shell | Resizable panels: FileTree, Editor, Terminal, Preview, Chat | `M` |
| 3 | [x] COOP/COEP Headers | Cross-origin isolation for WebContainers (SharedArrayBuffer) | `XS` |
| 4 | [x] WebContainers Boot | Container lifecycle, process management, terminal binding | `M` |
| 5 | [x] FSA Integration | Local folder picker, read/write operations, permission lifecycle | `L` |
| 6 | [x] Dual Sync | Local FS ↔ WebContainers synchronization with exclusions | `M` |
| 7 | [x] Monaco Editor | Multi-tab editing, syntax highlighting, auto-save | `M` |
| 8 | [x] Preview Panel | iframe dev server with hot-reload | `S` |
| 9 | [x] IndexedDB Persistence | Project metadata, layout state, conversation storage | `M` |

---

## Phase 2: Stability & Production Hardening ✅ `COMPLETE`

| # | Feature | Description | Effort |
|---|---------|-------------|--------|
| 10 | [x] Terminal CWD Fix | Correct working directory for npm commands | `S` |
| 11 | [x] Auto-Sync Timing | Ensure sync completes before terminal access | `S` |
| 12 | [x] Sync Status UI | Visual indicators: idle/syncing/error with manual trigger | `S` |
| 13 | [x] CI/CD Pipeline | GitHub Actions for build, test, deploy to Netlify | `M` |
| 14 | [x] Edge Function Headers | COOP/COEP via Netlify Edge Functions for SSR compat | `S` |
| 15 | [x] Client-Only Externalization | Prevent xterm/monaco from SSR bundle | `S` |
| 16 | [x] Localization Foundation | react-i18next, EN/VI bundles, language switcher | `M` |

---

## Phase 3: Event Bus Wiring `READY`

| # | Feature | Description | Effort |
|---|---------|-------------|--------|
| 17 | [ ] SyncManager Event Emissions | Emit sync:started, sync:progress, sync:completed | `M` |
| 18 | [ ] UI Event Subscriptions | FileTree, Monaco, SyncStatus subscribe to event bus | `M` |

---

## Phase 4: AI Foundation 🔴 `PRIORITY`

| # | Feature | Description | Effort |
|---|---------|-------------|--------|
| 19 | [ ] TanStack AI Integration | useChat hook, streaming responses, Gemini adapter | `M` |
| 20 | [ ] File Tools | read_file, write_file, list_files, create, delete | `M` |
| 21 | [ ] Terminal Tool | run_command with stdout/stderr streaming | `M` |
| 22 | [ ] Tool → UI Sync | Agent writes file → editor/tree automatically updates | `S` |
| 23 | [ ] Tool Approval Flow | Diff preview before AI executes changes | `M` |
| 24 | [ ] AI DevTools | @tanstack/ai-devtools for debugging agent behavior | `S` |

---

## Phase 5: Productivity Features `PLANNED`

| # | Feature | Description | Effort |
|---|---------|-------------|--------|
| 25 | [ ] Smart Dependency Sync | Persist node_modules to local FS for instant reload | `M` |
| 26 | [ ] Agent Management Dashboard | Configure agents, tools, workflows in UI | `L` |
| 27 | [ ] Multi-Agent Orchestration | Specialized agents: Planner, Coder, Validator | `XL` |
| 28 | [ ] Workflow Visual Editor | Drag-and-drop agent workflow builder | `L` |

---

## Phase 6: Git & Version Control `PLANNED`

| # | Feature | Description | Effort |
|---|---------|-------------|--------|
| 29 | [ ] isomorphic-git FS Adapter | Custom fs.promises adapter over File System Access API | `L` |
| 30 | [ ] Git Status Display | Modified/staged/untracked indicators in file tree | `S` |
| 31 | [ ] Stage & Commit | Add files, write commit message, create commits | `M` |
| 32 | [ ] GitHub Push/Pull | Remote authentication, upload/download changes | `L` |
| 33 | [ ] Diff Viewer | Side-by-side comparison with add/remove highlighting | `M` |

---

## Phase 7: Polish & Extensibility `PLANNED`

| # | Feature | Description | Effort |
|---|---------|-------------|--------|
| 34 | [ ] Project Templates | Gallery with blog, portfolio, e-commerce, API starters | `L` |
| 35 | [ ] Agent Customization | Profiles: verbosity, strictness, code style, learning mode | `M` |
| 36 | [ ] Asset Studio | AI image generation, gallery, drag-and-drop to code | `L` |
| 37 | [ ] Conversation Search | Semantic search across chat history | `M` |
| 38 | [ ] Keyboard Accessibility | Full navigation, customizable shortcuts | `M` |
| 39 | [ ] E2E Validation | 14-step validation sequence passing | `L` |

---

## Phase 8: Advanced & Future `BACKLOG`

| # | Feature | Description | Effort |
|---|---------|-------------|--------|
| 40 | [ ] Multi-Root Workspaces | VS Code-style multiple folder roots | `XL` |
| 41 | [ ] FSA Permission Persistence | Chrome 122+ enhanced permission APIs | `M` |
| 42 | [ ] File Watcher | Detect external changes (polling fallback) | `M` |
| 43 | [ ] Schema Migrations | IndexedDB version upgrades | `M` |
| 44 | [ ] Plugin Architecture | Third-party extensions system | `XL` |

---

> **Effort Scale:**
> - `XS`: 1 day | `S`: 2-3 days | `M`: 1 week | `L`: 2 weeks | `XL`: 3+ weeks

> **Key Dependencies:**
> - Event Bus Wiring (17-18) → AI Foundation (19-24)
> - AI Foundation (19-24) → Agent Dashboard (26-28)
> - Git Adapter (29) → Git Features (30-33)
