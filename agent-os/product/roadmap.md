# Product Roadmap

> **Strategic ordering based on:** Technical dependencies (foundational first), best-practice architecture, future extensibility, reusability, and maintainability.

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

## Phase 2: Stability & Production Hardening `IN PROGRESS`

| # | Feature | Description | Effort |
|---|---------|-------------|--------|
| 10 | [ ] Terminal CWD Fix | Correct working directory for npm commands | `S` |
| 11 | [ ] Auto-Sync Timing | Ensure sync completes before terminal access | `S` |
| 12 | [ ] Sync Status UI | Visual indicators: idle/syncing/error with manual trigger | `S` |
| 13 | [ ] CI/CD Pipeline | GitHub Actions for build, test, deploy to Netlify | `M` |
| 14 | [ ] Edge Function Headers | COOP/COEP via Netlify Edge Functions for SSR compat | `S` |
| 15 | [ ] Client-Only Externalization | Prevent xterm/monaco from SSR bundle | `S` |
| 16 | [ ] Localization Foundation | react-i18next, EN/VI bundles, language switcher | `M` |

---

## Phase 3: AI Foundation & Event Architecture `PLANNED`

| # | Feature | Description | Effort |
|---|---------|-------------|--------|
| 17 | [ ] Event Bus | Typed event emitter for cross-component communication | `M` |
| 18 | [ ] IDE Event Schemas | Standard events for file/terminal/sync operations | `M` |
| 19 | [ ] AI Tool Facades | Service layer exposing filesystem/terminal/git to agents | `L` |
| 20 | [ ] TanStack AI Integration | useChat hook, streaming responses, Gemini adapter | `M` |
| 21 | [ ] File Tools | read_file, write_file, list_files, create, delete | `M` |
| 22 | [ ] Terminal Tool | run_command with stdout/stderr streaming | `M` |
| 23 | [ ] Tool → UI Sync | Agent writes file → editor/tree automatically updates | `S` |

---

## Phase 4: Full Development Workflow `PLANNED`

| # | Feature | Description | Effort |
|---|---------|-------------|--------|
| 24 | [ ] Chat Panel UI | Streaming messages, tool execution badges, threads | `M` |
| 25 | [ ] isomorphic-git FS Adapter | Custom fs.promises adapter over File System Access API | `L` |
| 26 | [ ] Git Status Display | Modified/staged/untracked indicators in file tree | `S` |
| 27 | [ ] Stage & Commit | Add files, write commit message, create commits | `M` |
| 28 | [ ] GitHub Push/Pull | Remote authentication, upload/download changes | `L` |
| 29 | [ ] Diff Viewer | Side-by-side comparison with add/remove highlighting | `M` |

---

## Phase 5: Extensibility & Polish `PLANNED`

| # | Feature | Description | Effort |
|---|---------|-------------|--------|
| 30 | [ ] Project Templates | Gallery with blog, portfolio, e-commerce, API starters | `L` |
| 31 | [ ] Multi-Agent Orchestration | Specialized agents: Planner, Coder, Validator | `XL` |
| 32 | [ ] Agent Customization | Profiles: verbosity, strictness, code style, learning mode | `M` |
| 33 | [ ] Asset Studio | AI image generation, gallery, drag-and-drop to code | `L` |
| 34 | [ ] Conversation Search | Semantic search across chat history | `M` |
| 35 | [ ] Keyboard Accessibility | Full navigation, customizable shortcuts | `M` |
| 36 | [ ] E2E Validation | 14-step validation sequence passing | `L` |

---

## Phase 6: Advanced & Future `BACKLOG`

| # | Feature | Description | Effort |
|---|---------|-------------|--------|
| 37 | [ ] Multi-Root Workspaces | VS Code-style multiple folder roots | `XL` |
| 38 | [ ] FSA Permission Persistence | Chrome 122+ enhanced permission APIs | `M` |
| 39 | [ ] File Watcher | Detect external changes (polling fallback) | `M` |
| 40 | [ ] Async Clipboard | Copy code with syntax highlighting | `S` |
| 41 | [ ] Schema Migrations | IndexedDB version upgrades | `M` |
| 42 | [ ] Plugin Architecture | Third-party extensions system | `XL` |

---

> **Effort Scale:**
> - `XS`: 1 day
> - `S`: 2-3 days
> - `M`: 1 week
> - `L`: 2 weeks
> - `XL`: 3+ weeks

> **Notes:**
> - Order driven by technical dependencies and architectural best practices
> - Event Bus (17) unlocks AI observability for phases 3+
> - Git integration (25-29) requires isomorphic-git adapter foundation
> - Multi-agent (31) depends on single-agent tools working reliably
