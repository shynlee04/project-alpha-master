# Requirements Inventory

### Functional Requirements

#### FR-IDE: IDE Shell (6 Requirements)
- **FR-IDE-01:** TanStack Start SPA with file-based routing - Routes: `/`, `/workspace/:projectId`
- **FR-IDE-02:** IDE layout with resizable panels - FileTree, Editor, Terminal, Preview, Chat
- **FR-IDE-03:** Monaco editor integration - Syntax highlighting, auto-save, multiple tabs
- **FR-IDE-04:** xterm.js terminal bound to WebContainers - Interactive shell, command history
- **FR-IDE-05:** Live preview iframe for dev server - Hot-reload, device frame options
- **FR-IDE-06:** Agent chat panel - Streaming responses, tool execution badges

#### FR-WC: WebContainers Integration (6 Requirements)
- **FR-WC-01:** Boot WebContainers on workspace open - `WebContainer.boot()` succeeds
- **FR-WC-02:** Mount project files from FileTree - 100+ files mounted without error
- **FR-WC-03:** Spawn interactive shell - `jsh` responsive to user input
- **FR-WC-04:** Run npm commands - `npm install`, `npm run dev` work correctly
- **FR-WC-05:** Stream stdout/stderr to terminal - Real-time output display
- **FR-WC-06:** Track process lifecycle - Exit codes surfaced to UI

#### FR-FS: File System Access Integration (6 Requirements)
- **FR-FS-01:** Request directory access via `showDirectoryPicker()` - Permission granted and handle stored
- **FR-FS-02:** Read all files from local directory - Complete file tree retrieved
- **FR-FS-03:** Write files back to local directory - Changes persist to disk
- **FR-FS-04:** Create/delete/rename files and folders - All CRUD operations work
- **FR-FS-05:** Permission persistence via handle storage - Handles survive page reload
- **FR-FS-06:** Fallback mode for denied permissions - Virtual FS only if access denied (P1)

#### FR-SYNC: Dual Sync Layer (4 Requirements)
- **FR-SYNC-01:** Initial sync: Local FS → WebContainers - Full tree mounted on project open
- **FR-SYNC-02:** Editor save: dual write to disk + WebContainers - Both systems updated on save
- **FR-SYNC-03:** Exclusion rules for `node_modules`, `.git` - Heavy directories not synced to disk
- **FR-SYNC-04:** Debounced sync (2s) to prevent storms - Rapid changes don't cause loops (P1)

#### FR-GIT: Git Integration (6 Requirements)
- **FR-GIT-01:** `fs` adapter for isomorphic-git over FSA - Git operations use local folder
- **FR-GIT-02:** Git status display - Show modified/staged/untracked
- **FR-GIT-03:** Git add/remove operations - Stage/unstage files
- **FR-GIT-04:** Git commit with message - Commit created in local `.git`
- **FR-GIT-05:** Git push to GitHub - Changes uploaded to remote (P1)
- **FR-GIT-06:** Git pull from GitHub - Changes downloaded to local (P1)

#### FR-PERSIST: Persistence Layer (6 Requirements)
- **FR-PERSIST-01:** Conversation history per project - Messages survive page reload
- **FR-PERSIST-02:** Tool execution history - Tool results logged and retrievable
- **FR-PERSIST-03:** IDE layout state - Panel sizes, open tabs restored
- **FR-PERSIST-04:** Project metadata (recent projects) - Dashboard shows recent projects
- **FR-PERSIST-05:** FSA handle storage in IndexedDB - Handles serialized and restored
- **FR-PERSIST-06:** Schema versioning for migrations - Data survives schema changes (P1)

#### FR-AGENT: AI Agent Layer (7 Requirements)
- **FR-AGENT-01:** TanStack AI `useChat` integration - Streaming chat functional
- **FR-AGENT-02:** Client-side tools via `clientTools()` - Tools execute in browser
- **FR-AGENT-03:** File tools: read, write, list, create, delete - All operations work
- **FR-AGENT-04:** Terminal tool: `run_command` - Commands execute in WebContainers
- **FR-AGENT-05:** Git tools: status, add, commit - Git operations via agent (P1)
- **FR-AGENT-06:** Tool → UI sync - Tool writes file → editor updates
- **FR-AGENT-07:** Gemini adapter with BYOK - User provides own API key

---

### Non-Functional Requirements

#### NFR-PERF: Performance (6 Requirements)
- **NFR-PERF-01:** WebContainer boot time < 5s
- **NFR-PERF-02:** File mount (100 files) < 3s
- **NFR-PERF-03:** Dev server start < 30s
- **NFR-PERF-04:** Agent first token (TTFT) < 2s
- **NFR-PERF-05:** Preview hot-reload < 2s
- **NFR-PERF-06:** File save to disk < 500ms

#### NFR-REL: Reliability (4 Requirements)
- **NFR-REL-01:** File sync reliability 99%+
- **NFR-REL-02:** State restoration 99%+
- **NFR-REL-03:** WebContainer stability - No crash per session
- **NFR-REL-04:** No data corruption - 0 incidents

#### NFR-USE: Usability (4 Requirements)
- **NFR-USE-01:** Time to first project < 2 min
- **NFR-USE-02:** Onboarding completion > 70%
- **NFR-USE-03:** Error recovery path < 10s to understand
- **NFR-USE-04:** Keyboard accessibility - Full

#### NFR-SEC: Security (4 Requirements)
- **NFR-SEC-01:** No server data transmission - 100%
- **NFR-SEC-02:** API keys client-only - User controls keys
- **NFR-SEC-03:** FSA scoped to user-approved dirs - Per session
- **NFR-SEC-04:** WebContainers sandboxed - Per browser spec

#### NFR-COMPAT: Compatibility (4 Requirements)
- **NFR-COMPAT-01:** Chrome 86+ - Full support
- **NFR-COMPAT-02:** Edge 86+ - Full support
- **NFR-COMPAT-03:** Safari 15.2+ - FSA support
- **NFR-COMPAT-04:** Firefox 115+ - IndexedDB fallback

---

### Additional Requirements

#### From Architecture Document
- **ARCH-STARTER:** Project initialized using TanStack Start with SPA mode: `npx -y create-tanstack-start@latest ./ --template default --package-manager pnpm`
- **ARCH-SSR:** IDE routes must use `ssr: false` for WebContainers compatibility
- **ARCH-HEADERS:** Deployment requires `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` headers
- **ARCH-STRUCTURE:** Project follows layered architecture: UI → Store → Domain → Adapter → Browser/System
- **ARCH-NAMING:** Consistent naming conventions per Architecture patterns section
- **ARCH-STATE:** TanStack Store + TanStack Query for state management

#### From UX Design Specification
- **UX-DESIGN:** Shadcn/ui component library with dark theme default
- **UX-TYPOGRAPHY:** Inter for UI, JetBrains Mono for code
- **UX-LAYOUT:** Resizable panels with min 1024px viewport requirement
- **UX-A11Y:** WCAG AA compliance, keyboard accessibility required
- **UX-FEEDBACK:** All actions produce visible response within 2 seconds
- **UX-COMPONENTS:** Custom components needed: FileTree, Terminal, AgentChat, PreviewPanel, DiffViewer

#### From Technical Research
- **TECH-FSA-ADAPTER:** Custom `fs.promises` adapter required for isomorphic-git over File System Access API
- **TECH-SYNC-STRATEGY:** Local FS as source of truth; WebContainers mirrors it
- **TECH-EXCLUSIONS:** Do not sync `node_modules`, `.git` to local disk from WebContainers
- **TECH-CLIENT-TOOLS:** AI tools must be client-side via `toolDefinition().client()` pattern

---

### FR Coverage Map

| Epic | Requirements Covered | Priority |
|------|---------------------|----------|
| Epic 1: Project Foundation | ARCH-STARTER, FR-IDE-01, FR-IDE-02 | P0 |
| Epic 2: WebContainers Integration | FR-WC-01 to FR-WC-06, FR-IDE-04 | P0 |
| Epic 3: File System Access | FR-FS-01 to FR-FS-05, FR-SYNC-01 to FR-SYNC-03 | P0 |
| Epic 4: IDE Components | FR-IDE-03, FR-IDE-05, FR-IDE-06, UX-COMPONENTS | P0 |
| Epic 5: Persistence Layer | FR-PERSIST-01 to FR-PERSIST-05 | P0 |
| Epic 6: AI Agent Integration | FR-AGENT-01 to FR-AGENT-04, FR-AGENT-06, FR-AGENT-07 | P0 |
| Epic 7: Git Integration | FR-GIT-01 to FR-GIT-04 | P0 |
| Epic 8: Polish & Validation | NFR-PERF-*, NFR-REL-*, 14-step validation | P0 |

---
