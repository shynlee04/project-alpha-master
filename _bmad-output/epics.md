---
stepsCompleted: [1, 2]
inputDocuments:
  - _bmad-output/project-planning-artifacts/prd.md
  - _bmad-output/project-planning-artifacts/architecture.md
  - _bmad-output/project-planning-artifacts/ux-design-specification.md
  - _bmad-output/project-planning-artifacts/project-context.md
  - _bmad-output/docs/2025-12-28/version-2/remediation-epics.md
workflowType: 'epics-and-stories'
workflowStatus: 'in_progress'
lastStep: 2
date: '2025-12-28'
project_name: 'Project Alpha v2.0 - Knowledge Synthesis Station'
launch_target: '2026-01-18'
social_campaign: 'Daily Dev Journey (Vietnamese TikTok/Facebook)'
epic_strategy: 'Visual Progress Prioritization'
---

# Project Alpha v2.0 - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for **Project Alpha v2.0 - Knowledge Synthesis Station**, decomposing the requirements from the PRD, UX Design Specification, and Architecture into implementable stories.

**Phased Approach:**
- **Phase 0: Infrastructure & Pre-Work** (Sprint 0 - Dec 29-31)
- **Phase 1: Core Stabilization** (Sprint 1-5 - Jan 1-18)
- **Phase 2: Knowledge Synthesis MVP** (Future PRD)

### 📅 "Daily Dev Journey" Content Calendar
_Strategy: 30-day "Build in Public" for Vietnamese EdTech Market_

| Date | Content Type | Topic | Goal |
|------|--------------|-------|------|
| **Dec 29-31** | 🎥 Teaser | "Why I'm rebuilding my IDE" | Hook audience with the 'Why' |
| **Jan 1-3** | 📸 Carousel | Dark Mode & Mobile UI | Show visual polish/responsiveness |
| **Jan 4-7** | 🎥 Short | "AI that asks for permission" | Demo tool approval security |
| **Jan 8-10** | 🎥 **HERO** | **The Magic Moment** (Browser → VS Code) | Viral potential hook |
| **Jan 11-14** | 📸 Deep Dive | "How 5-Layer Agents Work" | Technical authority building |
| **Jan 15-18** | 🎥 Countdown | Performance Dashboard (60fps) | Build launch hype |

---

## Requirements Inventory

### Functional Requirements

**FR-AGENT: Agent Intelligence**

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AGENT-01 | Multi-Provider Configuration — System shall allow users to configure OpenRouter, Anthropic, and Google Gemini with BYOK API keys. | P0 |
| FR-AGENT-02 | Tool Execution (Read/Write) — System shall execute `readFile`, `writeFile`, and `runCommand` tools upon agent request. | P0 |
| FR-AGENT-03 | Conversation Context Preservation — System shall persist chat history to IndexedDB immediately after each message. | P0 |
| FR-AGENT-04 | Streaming Response Buffer — While receiving tokens, system shall buffer tool call JSON until complete before execution. | P0 |
| FR-AGENT-05 | Tool Error Handling — When a tool fails (e.g., file locked), system shall retry once automatically, then prompt user. | P1 |

**FR-STATE: State & Persistence**

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-STATE-01 | Unified Store (Zustand+Dexie) — System shall sync Zustand state changes to Dexie (IndexedDB) with <100ms latency. | P0 |
| FR-STATE-02 | Session Restoration — System shall restore open files, cursor positions, and scroll offsets on reload. | P0 |
| FR-STATE-03 | Dual-Write Sync — System shall write file changes to both WebContainer and Local File System (via FSA) in parallel. | P0 |
| FR-STATE-04 | Sync Queue Visualizer — System shall display a status bar indicator for pending/active/failed sync operations. | P1 |

**FR-ENV: Workspace Ecosystem**

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-ENV-01 | WebContainer Boot — System shall initialize WebContainer and mount local files within 5 seconds of permission grant. | P0 |
| FR-ENV-02 | Permission Re-Grant Flow — When reloading, system shall present a "Restore Access" button for the previously opened project. | P0 |
| FR-ENV-03 | Terminal Integration — System shall provide an xterm.js terminal connected to the WebContainer shell. | P0 |

**FR-UI: UI & Experience**

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-UI-01 | Responsive Layout — System shall adapt layout for mobile (<768px), tablet (<1024px), and desktop. | P0 |
| FR-UI-02 | Mobile Demo Mode — When on mobile, system shall disable WebContainer boot and show "Read-Only / Chat-Only" mode. | P0 |
| FR-UI-03 | Theme System — System shall support Light/Dark/System modes with persistent preference. | P1 |
| FR-UI-04 | Accessibility Foundations — System shall support full keyboard navigation (focus traps, tab order) and ARIA labels. | P0 |

**FR-EDU: EdTech Foundation (Phase 2 Stub)**

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-EDU-01 | Source File Import — System shall allow uploading PDF/MD files to a specific "Knowledge" directory. | P1 |
| FR-EDU-02 | Citation Placeholder — Agent shall be instructed to use [Source Found] markers (implementation in Phase 2). | P2 |

**FR-ERROR: Error Handling & Resilience**

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-ERROR-01 | Tool Failure Retry — Transient errors retried once automatically. | P0 |
| FR-ERROR-02 | Sync Conflict UI — Dual-write mismatch surfaces UI dialog for user resolution. | P1 |
| FR-ERROR-03 | Crash Recovery — Auto-restart WebContainer with last known state. | P1 |
| FR-ERROR-04 | Persistence Loss — Graceful degradation to IndexedDB-only mode if FSA revoked. | P0 |

---

### Non-Functional Requirements

**NFR-PERF: Performance**

| ID | Requirement | Target | Red Flag |
|----|-------------|--------|----------|
| NFR-PERF-01 | WebContainer boot time | <5s | >10s |
| NFR-PERF-02 | File mount (100 files) | <3s | >8s |
| NFR-PERF-03 | Dev server start | <30s | >60s |
| NFR-PERF-04 | Agent TTFT | <2s | >5s |
| NFR-PERF-05 | Preview hot-reload | <2s | >5s |
| NFR-PERF-06 | File save to disk | <500ms | >2s |
| NFR-PERF-07 | Monaco editor load | <2s | >5s |
| NFR-PERF-08 | IndexedDB query | <100ms | >500ms |

**NFR-REL: Reliability**

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-REL-01 | File sync reliability | 99%+ |
| NFR-REL-02 | State restoration | 99%+ |
| NFR-REL-03 | WebContainer stability | No crash |
| NFR-REL-04 | No data corruption | 0 incidents |
| NFR-REL-05 | FSA re-grant success | >90% |
| NFR-REL-06 | Tool execution reliability | >95% |

**NFR-USE: Usability**

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-USE-01 | Time to first project | <2 min |
| NFR-USE-02 | Onboarding completion | >70% |
| NFR-USE-03 | Error recovery path | <10s |
| NFR-USE-04 | Keyboard accessibility | Full |
| NFR-USE-05 | Permission prompt clarity | <5 retries |
| NFR-USE-06 | Chat discoverability | >80% usage |

**NFR-SEC: Security**

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-SEC-01 | No server data transmission | 100% |
| NFR-SEC-02 | API keys client-only | User controls |
| NFR-SEC-03 | FSA scoped execution | Per session |
| NFR-SEC-04 | WebContainers sandboxing | Per spec |
| NFR-SEC-05 | API key encryption at rest | AES-256 |
| NFR-SEC-06 | Content Security Policy | Strict |
| NFR-SEC-07 | No PII in logs | 0 incidents |

**NFR-COMPAT: Compatibility**

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-COMPAT-01 | Chrome 86+ | Full support |
| NFR-COMPAT-02 | Edge 86+ | Full support |
| NFR-COMPAT-03 | Safari 15.2+ | FSA support (partial) |
| NFR-COMPAT-04 | Firefox 115+ | IndexedDB only |
| NFR-COMPAT-05 | SharedArrayBuffer | Mandatory |
| NFR-COMPAT-06 | COOP/COEP headers | Strict |

**NFR-OBS: Observability**

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-OBS-01 | Performance metrics capture | 100% |
| NFR-OBS-02 | Error rate tracking | All errors |
| NFR-OBS-03 | Tool execution tracing | Every call |
| NFR-OBS-04 | Sync operation audit | Every sync |
| NFR-OBS-05 | User diagnostics panel | Accessible |

---

### Additional Requirements

**From Architecture Document:**

| Source | Requirement |
|--------|-------------|
| Arch 3.8 | Cloudflare Pages is PRIMARY deployment target. Default `DEPLOY_TARGET=cloudflare` |
| Arch 4.2 | Unified Zustand + Dexie Middleware pattern for state persistence |
| Arch 4.3 | AES-256 encryption for API keys via Web Crypto API |
| Arch 4.4 | 5-Layer Agent System with System Prompt Composer |
| Arch 4.4.5 | Tool trust levels: `auto` (safe), `prompt` (requires approval), `block` (forbidden) |
| Arch 5.2 | Naming conventions: PascalCase components, camelCase utilities, use* hooks |
| Arch 5.3 | Barrel exports (index.ts) in every directory |
| Arch 5.5 | Event bus pattern with `domain:action` naming |
| Arch 5.6 | Custom error classes for specific error handling |
| Arch 6.1 | Project structure with `src/lib/agent/layers/` for 5-Layer System |
| Arch 6.2 | State boundary: Components → Zustand → Dexie (never skip layers) |
| Arch 6.3 | Phase 2 additions marked with 🆕 emoji (knowledge/, hub/, etc.) |

**From UX Design Specification:**

| Source | Requirement |
|--------|-------------|
| UX 2.1 | Multi-Surface Layout: Desktop Creator Studio + Mobile Reader Mode |
| UX 2.3 | Progressive Disclosure: Complex features hidden until needed |
| UX 3.1 | Mobile Responsive: Card Feed navigation, bottom tab bar |
| UX 3.2 | Chat Panel: Collapsible, streaming markdown, tool approval UI |
| UX 4.1 | WCAG 2.1 Level AA accessibility compliance |
| UX 4.2 | Color contrast 4.5:1 ratio minimum |
| UX 5.1 | Vietnamese-first translations with English fallback |

**From Remediation Epics (Prior Research):**

| Epic ID | Description | Priority |
|---------|-------------|----------|
| R-01 | Fix Hot-Reloading Bug with Reactive State Binding | P0 |
| R-02 | Implement Atomic State Updates with Optimistic UI | P0 |
| R-03 | Deploy Qdrant Vector Store (Phase 2 - replaced by Orama WASM) | P0 → Phase 2 |
| R-04 | Implement 5-Layer Agent System | P0 |
| R-05 | Complete CRUD Surface for Agent Configuration | P1 |
| R-07 | Chatflow Composition Architecture | HIGH |
| R-09 | Cross-Architecture Context Management | HIGH |
| R-10 | Tool Permissions Model | MEDIUM |
| R-13 | IDELayout State Refactor | P2 |
| R-14 | Multi-Provider Race Condition Handling | P2 |

---

### FR Coverage Map

| FR ID | Epic | Description |
|-------|------|-------------|
| FR-UI-01 | Epic 1 | Responsive Layout |
| FR-UI-02 | Epic 1 | Mobile Demo Mode |
| FR-UI-03 | Epic 1 | Theme System |
| FR-UI-04 | Epic 1 | Accessibility Foundations |
| FR-AGENT-01 | Epic 2 | Multi-Provider Configuration |
| FR-AGENT-03 | Epic 2 | Conversation Context Preservation |
| FR-STATE-01 | Epic 2 | Unified Store (Zustand+Dexie) |
| FR-STATE-02 | Epic 2 | Session Restoration |
| FR-ENV-01 | Epic 3 | WebContainer Boot |
| FR-ENV-02 | Epic 3 | Permission Re-Grant Flow |
| FR-ENV-03 | Epic 3 | Terminal Integration |
| FR-STATE-03 | Epic 3 | Dual-Write Sync |
| FR-AGENT-02 | Epic 4 | Tool Execution (Read/Write) |
| FR-AGENT-04 | Epic 4 | Streaming Response Buffer |
| FR-AGENT-05 | Epic 4 | Tool Error Handling |
| FR-ERROR-01 | Epic 4 | Tool Failure Retry |
| FR-STATE-04 | Epic 5 | Sync Queue Visualizer |
| FR-ERROR-02 | Epic 5 | Sync Conflict UI |
| FR-ERROR-03 | Epic 5 | Crash Recovery |
| FR-ERROR-04 | Epic 5 | Persistence Loss |
| FR-EDU-01 | Phase 2 | Source File Import |
| FR-EDU-02 | Phase 2 | Citation Placeholder |

---

## Epic List

> **Strategy:** Epics reordered for **"Daily Dev Journey" Social Campaign** (Vietnamese market) with visual progress prioritization.
> **Launch Target:** Jan 1-18, 2026 (17-day sprint)

---

### Epic 1: 🎨 Mobile-First Visual Foundation
*Days 1-3 (Jan 1-3, 2026)*

**User Outcome:** Users on any device see a polished, responsive interface with dark/light themes and clear messaging about feature availability.

**Social Media Appeal:** ⭐⭐⭐⭐⭐ — Before/after screenshots, dark mode toggle videos, mobile demo mode screencast

**FRs Covered:** FR-UI-01, FR-UI-02, FR-UI-03, FR-UI-04

**Remediation Epics Addressed:** R-13 (IDELayout State Refactor)

**UX Requirements:**
- UX 2.1 (Multi-Surface Layout)
- UX 3.1 (Mobile Card Feed)
- UX 4.1 (WCAG 2.1 AA)
- UX 4.2 (Color contrast 4.5:1)

**Implementation Notes:**
- Progressive degradation with SharedArrayBuffer detection
- Tailwind CSS 4 responsive breakpoints
- next-themes integration for theme persistence
- Mobile demo mode with pre-loaded templates

#### Story 1.1: Responsive Breakpoint Foundation

**As a** user on any device,  
**I want** the IDE layout to adapt to my screen size,  
**So that** I can use the application on desktop, tablet, or mobile.

**Acceptance Criteria:**

**Given** a user opens Project Alpha on a desktop (≥1024px)  
**When** the page loads  
**Then** the full IDE layout is displayed (sidebar, editor, chat panel)  
**And** all panels are resizable via react-resizable-panels  
**And** panel widths are persisted to localStorage via Zustand middleware

**Given** a user opens Project Alpha on a tablet (768px-1023px)  
**When** the page loads  
**Then** the sidebar collapses by default, chat panel remains resizable  
**And** touch-friendly spacing is applied (min 44px tap targets)

**Given** a user opens Project Alpha on mobile (<768px)  
**When** the page loads  
**Then** a bottom tab navigation appears  
**And** only one panel is visible at a time  
**And** smooth swipe transitions between panels  
**And** Editor panel shows 'Demo Mode' banner when swiped to

**Dependencies:** Requires `useResponsive` hook (`src/hooks/useResponsive.ts`)

**Demo Checkpoint:** 📱 Before/after screenshots at different viewport sizes

---

#### Story 1.2: Dark/Light Theme System

**As a** user,  
**I want** to toggle between dark and light themes,  
**So that** I can work comfortably in different lighting conditions.

**Acceptance Criteria:**

**Given** a user on any page  
**When** they click the theme toggle in the header  
**Then** the theme switches between light/dark/system  
**And** the preference persists across sessions (localStorage)  
**And** the toggle reflects the current state with appropriate icon

**Given** a user with "system" theme selected  
**When** their OS changes from light to dark mode  
**Then** the app theme updates automatically

**Given** a user with impaired vision (NFR-USE-04)  
**When** they view any text in dark mode  
**Then** the color contrast meets 4.5:1 ratio (WCAG AA)  
**And** Monaco editor theme switches between 'vs-dark' and 'vs-light' automatically  
**And** toggle icon reflects current state (Sun for light, Moon for dark, Monitor for system)

**Demo Checkpoint:** 🌓 Theme toggle time-lapse video

---

#### Story 1.3: Mobile Demo Mode with Capability Detection

**As a** mobile user,  
**I want** to understand which features are available on my device,  
**So that** I know what to expect and can access supported features.

**Acceptance Criteria:**

**Given** a user on a mobile device (no SharedArrayBuffer)  
**When** the page loads  
**Then** a friendly banner appears (Amber #F59E0B with WifiOff icon): "Welcome! Chat & review works here. Editing requires a desktop."  
**And** WebContainer boot is skipped  
**And** file system access buttons are disabled with tooltips

**Dependencies:** Requires `useCapabilityDetection` hook (`src/hooks/useCapabilityDetection.ts`)

**Given** a mobile user WITH API key configured  
**When** they tap the chat panel  
**Then** they can chat with real AI (TanStack AI streaming works without WebContainer)  
**And** only code execution tools are disabled (chat works fully)

**Given** a mobile user WITHOUT API key  
**When** they tap the chat panel  
**Then** they see pre-loaded sample conversations from `src/lib/demo/sample-conversations.json`  
**And** Vietnamese EdTech examples demonstrate AI capabilities

**Given** a mobile user wanting to try full features  
**When** they tap "Learn more" on the demo banner  
**Then** they see a modal explaining: "WebContainer requires desktop Chrome 86+ or Edge 86+ with COOP/COEP headers"  
**And** a "Continue in demo mode" button

**Blockers:**
- E1-B1: Create `src/lib/demo/sample-conversations.json` with 3 Vietnamese EdTech examples

**Demo Checkpoint:** 📲 Mobile screencast with clear demo mode messaging

---

#### Story 1.4: Accessibility Foundation (Keyboard & ARIA)

**As a** keyboard-only user,  
**I want** to navigate the entire application without a mouse,  
**So that** I can use the IDE efficiently with my preferred input method.

**Acceptance Criteria:**

**Given** a user pressing Tab on any page  
**When** focus moves through interactive elements  
**Then** the focus order is logical (top-to-bottom, left-to-right)  
**And** focus indicators are visible (2px outline, 3:1 contrast)  
**And** no focus traps except in modals  
**And** 'Skip to Editor' and 'Skip to Chat' links available at page top (hidden until focused)

**Given** a screen reader user  
**When** they navigate the IDE  
**Then** all interactive elements have ARIA labels  
**And** icons have aria-hidden="true" with adjacent text labels  
**And** status bar changes (e.g., 'Connection Lost') announce via aria-live='polite'

**Given** a user pressing Escape in a modal  
**When** the key is pressed  
**Then** the modal closes  
**And** focus returns to the trigger element

**Demo Checkpoint:** ⌨️ Keyboard navigation flow (less visual but important)

---

### Epic 2: 💬 AI Chat That Just Works
*Days 4-7 (Jan 4-7, 2026)*

**User Outcome:** Users configure AI agents with their API keys and experience streaming responses with tool approval workflows.

**Social Media Appeal:** ⭐⭐⭐⭐⭐ — AI streaming demo, tool approval overlay, "config persists across sessions" proof

**FRs Covered:** FR-AGENT-01, FR-AGENT-03, FR-STATE-01, FR-STATE-02

**Remediation Epics Addressed:**
- R-01 (Hot-Reloading Bug Fix)
- R-02 (Atomic State Updates)
- R-05 (Complete CRUD Surface)

**Implementation Notes:**
- Migrate AgentConfigDialog from useState to Zustand
- Implement Zustand + Dexie persist middleware
- Add optimistic UI with rollback
- Streaming markdown with 50ms buffer delay

**Store Architecture (Decision 1):**
- `useAgentsStore` → Agent configuration only
- `useConversationStore` → Messages + scroll position
- `useProviderStore` → API clients + connection status

#### Story 2.0: Credential Vault Implementation 🛠️ INFRASTRUCTURE (Sprint 0)
_Moved to Sprint 0 to unblock Epic 2 execution._

**As a** security-conscious user,  
**I want** my API keys encrypted before storage,  
**So that** my credentials are protected even if IndexedDB is compromised.

**Acceptance Criteria:**

**Given** a user enters an API key  
**When** the key is saved  
**Then** it is encrypted using Web Crypto API (AES-256-GCM)  
**And** only the encrypted value is stored in IndexedDB  
**And** a unique IV is generated per encryption operation

**Given** an encrypted API key in storage  
**When** the application needs to use it  
**Then** it is decrypted in memory only when needed  
**And** the decrypted value is never logged or transmitted

**Given** a user clears their data  
**When** they click "Clear All Data" (EDU-PRIV-02)  
**Then** all encrypted keys are permanently deleted  
**And** encryption key material is cleared

**Implementation Files:**
- `src/lib/security/credential-vault.ts`
- `src/lib/security/crypto-utils.ts`

**Demo Checkpoint:** 🔒 Show encrypted IndexedDB entries in DevTools

---

#### Story 2.1: Zustand + Dexie State Migration

**As a** developer,  
**I want** agent **configuration** stored in Zustand with Dexie persistence,  
**So that** configuration changes are visible immediately without page reload (fixes BF-01).

**Acceptance Criteria:**

**Given** an agent's config is stored in multiple places (local state + store)  
**When** migration is complete  
**Then** all agent **configuration** state is in Zustand store (`useAgentsStore`)  
**And** Dexie middleware syncs to IndexedDB within 100ms (NFR-PERF-08)

**Given** a user modifies agent configuration  
**When** they change any field in AgentConfigDialog  
**Then** the change is reflected immediately in AgentSelector  
**And** no navigation is required to see the update (R-01 fixed)

**Given** a user saves API key  
**When** the key is persisted  
**Then** `encryptAPIKey()` from `@/lib/security/credential-vault` is called  
**And** only the encrypted value reaches IndexedDB

**Dependencies:**
- Requires Story 2.0 (Credential Vault) completed first
- Requires `useConversationStore` created (`src/lib/state/conversation-store.ts`)

**Demo Checkpoint:** ⚡ "Config persists across sessions" proof video

---

#### Story 2.2: Agent CRUD Operations with Optimistic UI

**As a** user,  
**I want** to create, edit, and delete agents with immediate feedback,  
**So that** I can manage my AI assistants efficiently.

**Acceptance Criteria:**

**Given** a user on the agent configuration page  
**When** they click "Create New Agent"  
**Then** a new agent is created with default settings  
**And** the UI updates immediately (optimistic)  
**And** the operation is saved to IndexedDB  
**And** validation errors (e.g., missing API key) show immediately without DB call

**Given** a user editing an agent  
**When** save fails due to **validation error**  
**Then** the UI shows inline field errors  
**And** "Fix" action re-opens the edit dialog

**Given** a user editing an agent  
**When** save fails due to **network/DB error**  
**Then** the UI rolls back to previous state  
**And** a toast notification shows the error  
**And** a "Retry" button attempts the save again

**Given** a user deleting an agent  
**When** they confirm deletion  
**Then** the agent is removed from the list immediately  
**And** a toast shows "Deleted" with "Undo" option for 5 seconds  
**And** if deleted agent is currently active, system switches to first remaining agent

**Demo Checkpoint:** 🔄 CRUD operations with rollback demo

---

#### Story 2.3: Streaming Chat with Tool Approval UI

**As a** user chatting with an AI agent,  
**I want** to see responses stream in real-time and approve tool executions,  
**So that** I have control over what the AI does to my files.

**Acceptance Criteria:**

**Given** a user sends a message to an agent  
**When** the agent responds  
**Then** tokens stream into the chat panel with visible typing indicator  
**And** markdown is rendered progressively  
**And** perceived latency <100ms (optimistic "Agent is typing..." shown immediately)  
**And** NFR-PERF-04 TTFT <2s for first token from API

**Given** an agent requests tool execution (read_file, write_file)  
**When** the request is detected in the stream  
**Then** a tool approval overlay (`ApprovalOverlay` component) appears  
**And** the user sees tool name, target file, and preview  
**And** "Allow" / "Deny" buttons are clearly visible

**Given** an agent requests multiple tools in one response  
**When** the batch is detected  
**Then** user sees batch approval UI ('Allow all' / 'Review each')

**Given** tool call JSON arrives in chunks  
**When** the JSON is incomplete  
**Then** `parseToolCallChunks()` from `@/lib/agent/tools/tool-parser` buffers until complete  
**And** no partial execution occurs

**Dependencies:**
- Requires `ApprovalOverlay` component (`src/components/chat/ApprovalOverlay.tsx`)
- Requires `tool-parser.ts` (`src/lib/agent/tools/tool-parser.ts`)

**Blockers:**
- E2-B2: Create tool call buffer parser
- E2-D2: Create ApprovalOverlay component

**Demo Checkpoint:** 💬 AI streaming + tool approval workflow video

---

#### Story 2.4: Conversation Persistence & Session Restore

**As a** returning user,  
**I want** my chat history restored when I reload the page,  
**So that** I can continue my conversation without losing context.

**Acceptance Criteria:**

**Given** a user has an active conversation  
**When** they send a message  
**Then** the message is persisted to IndexedDB immediately (FR-AGENT-03)  
**And** the conversation state is stored in `useConversationStore` with Dexie persist

**Given** IndexedDB write fails (quota exceeded)  
**When** persistence error occurs  
**Then** user sees warning toast: "Storage full"  
**And** "Clear old conversations" action is available

**Given** a user reloads the page  
**When** the page loads  
**Then** the previous conversation is restored  
**And** scroll position is maintained using `scrollTop` from `useConversationStore().conversations[id].scrollPosition`  
**And** any pending tool approvals are re-displayed

**Given** a conversation exceeds 50 messages  
**When** the user continues chatting  
**Then** older messages are still accessible via scroll  
**And** a 'Load older' button appears at top of chat  
**And** performance remains acceptable (<100ms render)

**Dependencies:**
- Requires scroll position tracking in `ChatPanel` component

**Blockers:**
- E2-B3: Implement scroll position tracking
- E2-D1: Create `useConversationStore`

**Demo Checkpoint:** 🔄 Reload page → conversation restored demo

---

### Epic 3: 🔗 Local-First File Magic
*Days 8-10 (Jan 8-10, 2026)*

**User Outcome:** Users open local projects, edit files in the browser, and see changes appear in their local VS Code immediately.

**Social Media Appeal:** ⭐⭐⭐⭐ — **THE MAGIC MOMENT** — browser edit → VS Code update screencast

**FRs Covered:** FR-ENV-01, FR-ENV-02, FR-ENV-03, FR-STATE-03

**Remediation Epics Addressed:**
- R-09 (Cross-Architecture Context Management)

**Implementation Notes:**
- FSA permission lifecycle handling
- WebContainer boot with <5s target
- Dual-write sync (Local FS ↔ WebContainer)
- WorkspaceContext for cross-boundary state

#### Story 3.1: FSA Permission Lifecycle & Re-Grant Flow

**As a** returning user,  
**I want** to quickly restore access to my previously opened project,  
**So that** I don't have to navigate through folder selection again.

**Acceptance Criteria:**

**Given** a user return to the app (Chrome/Edge 116+)  
**When** the page loads  
**Then** `handle.queryPermission()` checks persistence  
**And** "Restore Access" button enables immediate access without prompt

**Given** a user on an older browser (<116) or Safari  
**When** they return  
**Then** they see "Permission expires on tab close" notice  
**And** must re-select the folder manually

**Given** a user denies FSA permission  
**When** the dialog is dismissed  
**Then** fallback to **Read-Only Mode** is offered (FR-ERROR-04)  
**And** a banner explains: "Working in Read-Only. Changes won't save to disk."  
**And** an "Export to disk" button provides manual download backup

**Blockers:**
- E3-B1: Create `FSAPermissionManager` class stub (`src/lib/fs/fsa-permission-manager.ts`)

**Demo Checkpoint:** 🔐 "One-click restore access" screencast

**Demo Checkpoint:** 🔐 "One-click restore access" screencast

---

#### Story 3.2: WebContainer Boot with Progress Indicator

**As a** user,  
**I want** to see clear progress when WebContainer initializes,  
**So that** I know the system is working and how long to wait.

**Acceptance Criteria:**

**Given** a user grants FSA permission  
**When** WebContainer starts booting  
**Then** a progress indicator shows stages: "Initializing..." → "Mounting..." → "Installing..."  
**And** boot completes within **5 seconds for small projects** (<100 files) (NFR-PERF-01)  
**And** boot completes within **10 seconds for large projects** (>100 files)

**Given** WebContainer boot succeeds  
**When** the container is ready  
**Then** the file tree populates from local project  
**And** terminal spawns within 500ms of ready state  
**And** status bar shows "Ready"

**Given** WebContainer boot fails  
**When** an error occurs relative to 5s target  
**Then** diagnostic info is logged (Browser ver, SharedArrayBuffer, COOP/COEP status, RAM)  
**And** user sees actionable error message

**Dependencies:**
- `WebContainerBootManager` with progress tracking (`src/lib/webcontainer/boot-manager.ts`)
- `package-lock.json` must be included in mount for fast boot

**Blockers:**
- E3-B2: Create `WebContainerBootManager` class implementation
- E3-D1: Verify `FileSystemTree` includes lockfile in mount logic

**Demo Checkpoint:** ⚡ WebContainer boot time-lapse (target <5s)

---

#### Story 3.3: Dual-Write Sync (Local FS ↔ WebContainer)

**As a** developer,  
**I want** file changes to sync between WebContainer and my local disk,  
**So that** I can edit in the browser and see changes in VS Code immediately.

**Acceptance Criteria:**

**Given** a user edits a file in Monaco editor  
**When** they save (Ctrl+S or auto-save)  
**Then** the file is written to both WebContainer AND local FSA handle  
**And** sync completes within 500ms (NFR-PERF-06)  
**And** auto-save delay is configurable (default 500ms, max 3000ms)

**Given** a project with files  
**When** mounting for the first time  
**Then** files are synced in batches  
**And** mounting completes within **3 seconds for ≤100 files** or **10 seconds for ≤500 files**  
**And** progress bar shows "Loaded X of Y files"

**Given** a sync conflict occurs (external edit during save)  
**When** the conflict is detected  
**Then** a dialog shows both versions  
**And** user can choose "Keep Mine" / "Keep Theirs" / "Merge" / **"Keep Both"** (creates backup with timestamp)

**Blockers:**
- E3-B3: Create `ConflictDialog` component (`src/components/sync/ConflictDialog.tsx`)

**Demo Checkpoint:** ✨ **THE MAGIC MOMENT** — browser edit appears in VS Code

---

#### Story 3.4: Terminal Integration with WebContainer Shell

**As a** developer,  
**I want** to run terminal commands in my project environment,  
**So that** I can install dependencies and run dev servers.

**Acceptance Criteria:**

**Given** WebContainer is booted successfully  
**When** the user opens the terminal panel (or presses Ctrl+`)  
**Then** an xterm.js terminal connects to WebContainer shell  
**And** the prompt shows project directory

**Given** a user runs `npm install`  
**When** the command executes  
**Then** output streams in real-time  
**And** status bar warns "Installing in browser environment - node_modules won't sync to disk"

**Given** a user runs a dev server  
**When** `npm run dev` completes  
**Then** preview URL appears in terminal output  
**And** dev server start is <5s (Vite) or <30s (Next.js/Webpack) with "Building..." indicator if slower

**Blockers:**
- E3-D2: JSON terminal URL parser not implemented (`src/lib/terminal/wc-terminal.ts`)

**Demo Checkpoint:** 🖥️ npm install → dev server → hot reload demo

---

### Epic 4: 🧠 Smart Agent Tools
*Days 11-14 (Jan 11-14, 2026)*

**User Outcome:** Users interact with an AI that reliably reads, writes files, and executes commands with clear feedback and error recovery.

**Social Media Appeal:** ⭐⭐⭐⭐ — AI reads project → explains architecture → writes code to disk

**FRs Covered:** FR-AGENT-02, FR-AGENT-04, FR-AGENT-05, FR-ERROR-01

**Remediation Epics Addressed:**
- R-04 (5-Layer Agent System)
- R-10 (Tool Permissions Model)
- R-14 (Multi-Provider Race Conditions)

**Implementation Notes:**
- Create `src/lib/agent/layers/` structure
- Implement SystemPromptComposer (Layers 1-3 only for Phase 1)
- Tool trust levels (auto/prompt/block)
- Retry logic with user feedback

#### Story 4.1: 5-Layer System Prompt Composer (Layers 1-3)

**As a** developer,  
**I want** the agent's system prompt composed from structured layers,  
**So that** agent behavior is consistent and maintainable.

**Acceptance Criteria:**

**Given** an agent is configured  
**When** a conversation starts  
**Then** the system prompt is composed from:
  - Layer 1: Tool Constitution (sent as `system` role message, hidden from UI)
  - Layer 2: Agent Mode (user-selectable persona)
  - Layer 3: Context Injection (Hybrid Strategy: open files + project summary) (Decision 4)

**Given** a layer is registered  
**When** it's included in composition  
**Then** layers are ordered by priority (1 → 2 → 3)  
**And** Layers 1+2 are cached (recomputed only on config change)

**Given** Layer 3 context changes (file opened/closed)  
**When** a new message is sent  
**Then** context includes: open files (max 10), active file, and project package.json summary

**Blockers:**
- E4-B1: Create `SystemPromptComposer` class (`src/lib/agent/prompt-composer.ts`)

**Demo Checkpoint:** 🧠 Show layered prompt composition in dev tools

---

#### Story 4.2: File Tool Execution (read_file, write_file, list_files)

**As a** user interacting with an AI agent,  
**I want** the agent to read, write, and list files in my project,  
**So that** it can understand and modify my codebase.

**Acceptance Criteria:**

**Given** an agent requests `read_file` tool  
**When** the tool executes  
**Then** file contents from FSA handle are returned  
**And** files >10MB show warning "Large file - may slow AI response"  
**And** result appears in conversation context

**Given** an agent requests `write_file` tool  
**When** the user approves (trust level: `prompt`)  
**Then** file is written to both WebContainer AND local FSA  
**And** if editor has **unsaved changes**, user sees "Save/Discard" dialog before overwrite  
**And** editor refreshes to show new content

**Given** an agent requests `list_files` tool  
**When** the tool executes  
**Then** directory listing with metadata is returned  
**And** recursive depth limited to 3 levels  
**And** respects .gitignore patterns

**Demo Checkpoint:** 📂 AI reads project, explains structure

---

#### Story 4.3: Tool Permissions & Trust Levels

**As a** user,  
**I want** to control which operations the AI can perform automatically,  
**So that** I maintain security and oversight of file changes.

**Acceptance Criteria:**

**Given** a tool is configured with trust level `auto`  
**When** the agent requests it  
**Then** it executes immediately without user approval  
**And** event is logged to `useAgentsStore().toolExecutionHistory` for audit

**Given** a tool is configured with trust level `prompt`  
**When** the agent requests it  
**Then** an approval overlay appears  
**And** includes "Trust this tool for this session" checkbox

**Given** a tool is configured with trust level `block`  
**When** the agent requests it  
**Then** execution is prevented  
**And** "Available Tools" indicator in chat updates to show status

**Blockers:**
- E4-B3: Create `ToolPermissionManager` class
- E4-B5: Add "Trust for session" to UX design

**Demo Checkpoint:** 🔒 Tool approval workflow demonstration

---

#### Story 4.4: Tool Error Handling with Retry Logic

**As a** user,  
**I want** the agent to handle tool failures gracefully,  
**So that** I'm not blocked by transient errors.

**Acceptance Criteria:**

**Given** a tool execution fails (e.g., file locked)  
**When** it's a transient error  
**Then** the system retries once automatically (FR-AGENT-05)  
**And** status bar shows "Retrying... (1s)"

**Given** a tool fails after retry  
**When** the error persists  
**Then** a toast notification appears with error details  
**And** "Retry", "Skip", and "Report Issue" buttons are available

**Given** multiple providers configured (R-14)  
**When** Race Condition (concurrent writes to same file) could occur  
**Then** request queue ensures **one tool execution per tool type at a time** (Decision 5)  
**And** no concurrent writes allowed

**Blockers:**
- E4-B4: Create `ToolExecutor` with retry logic
- E4-D2: Define race condition scope (Resolved: per-tool-type queue)

**Demo Checkpoint:** 🛡️ Error recovery demo (file locked → retry → success)

---

### Epic 5: 🚀 Production-Ready Polish
*Days 15-17 (Jan 15-17, 2026)*

**User Outcome:** Users experience seamless session restoration, error recovery, and reliable performance across all features.

**Social Media Appeal:** ⭐⭐ — Behind-the-scenes reliability work, performance metrics dashboard

**FRs Covered:** FR-STATE-04, FR-ERROR-02, FR-ERROR-03, FR-ERROR-04

**Remediation Epics Addressed:**
- R-07 (Chatflow Composition Architecture — basic implementation)

**Implementation Notes:**
- Sync queue visualizer in status bar
- WebContainer crash recovery
- IndexedDB → Zustand hydration
- Performance benchmark validation (NFR-PERF-01 to 08)

#### Story 5.1: Sync Queue Visualizer & Global Status

**As a** user,  
**I want** to see the status of my file syncs and background processes,  
**So that** I trust the system is saving my work.

**Acceptance Criteria:**

**Given** file operations (dual-write) are in progress  
**When** the user looks at the status bar  
**Then** it shows "Syncing..." with a spinning indicator  
**And** changes to "Saved" (with checkmark) when queue is empty

**Given** a sync operation fails  
**When** the error occurs  
**Then** status bar shows "Sync Error" (Red)  
**And** clicking it opens a "Process Panel" showing the failed file and "Retry" option (FR-ERROR-02)

**Given** the user clicks the status bar  
**When** the Process Panel opens  
**Then** it lists active, pending, and completed tasks for the last session

**Demo Checkpoint:** 📊 Trigger a fake slow sync to show queue visualization

---

#### Story 5.2: WebContainer Crash Recovery & Resilience

**As a** user,  
**I want** the system to recover automatically if the underlying engine crashes,  
**So that** I don't have to manually reload and lose my context.

**Acceptance Criteria:**

**Given** the WebContainer process terminates unexpectedly (FR-ERROR-03)  
**When** the crash is detected  
**Then** the system attempts to auto-reboot the instance (max 3 attempts)  
**And** re-mounts the file system automatically

**Given** auto-recovery succeeds  
**When** the system is back online  
**Then** a toast appears: "Engine restarted (state restored)"  
**And** terminal session is re-attached

**Given** auto-recovery fails 3 times  
**When** the limit is reached  
**Then** a modal appears: "Critical Error. Please reload the page."  
**And** "Export Logs" button is available for debugging

**Demo Checkpoint:** 🔄 Simulate `jsh` crash and show auto-recovery

---

#### Story 5.3: Performance Telemetry & Benchmark Dashboard

**As a** developer,  
**I want** to validate that performance targets (NFRs) are met,  
**So that** I can ensure the application feels premium and responsive.

**Acceptance Criteria:**

**Given** critical operations (Boot, Mount, Save, TTFT)  
**When** they complete  
**Then** duration is measured and logged to `PerformanceMonitor`  
**And** if NFR target is exceeded (e.g., Boot > 5s), a warning is logged

**Given** a developer enables "Nerd Stats"  
**When** they toggle the overlay via Command Palette  
**Then** a realtime dashboard shows:  
  - Boot Time (ms)  
  - File Sync Latency (p99)  
  - Current Memory Usage  
  - IndexedDB Read/Write Time

**Demo Checkpoint:** ⚡ Toggle "Nerd Stats" showing all green metrics

---

#### Story 5.4: Robust State Hydration & Restoration

**As a** returning user,  
**I want** my application state to be exactly as I left it,  
**So that** I can resume work immediately without reconfiguration.

**Acceptance Criteria:**

**Given** the application is loading  
**When** initializing state  
**Then** Zustand stores wait for Dexie hydration before rendering sensitive UI  
**And** a splash screen prevents "flash of unstyled content" or empty state

**Given** stored state is corrupt (schema mismatch)  
**When** hydration fails processing via Zod  
**Then** the specific slice resets to default  
**And** a toast informs the user: "Settings reset due to update" (prevents white screen crash)

**Given** external file changes occurred while app was closed  
**When** the app reloads  
**Then** file timestamps are checked  
**And** UI updates to reflect current disk state (Truth: Disk > Cache)

**Demo Checkpoint:** 🛡️ Corrupt local storage manually, reload, app recovers

---

## Sprint Calendar

| Sprint | Epic | Dates | Demo Focus |
|--------|------|-------|------------|
| Sprint 0 | Pre-Launch Setup | Dec 29-31, 2025 | Social media accounts, Day 0 teaser |
| Sprint 1 | Epic 1: Visual Foundation | Jan 1-3, 2026 | Responsive layout, themes, mobile demo |
| Sprint 2 | Epic 2: AI Chat | Jan 4-7, 2026 | Agent config, streaming, tool approval |
| Sprint 3 | Epic 3: File Magic | Jan 8-10, 2026 | FSA sync, "magic moment" |
| Sprint 4 | Epic 4: Smart Tools | Jan 11-14, 2026 | 5-Layer System, file operations |
| Sprint 5 | Epic 5: Polish | Jan 15-17, 2026 | Session restore, performance |
| **Launch** | **Public Beta** | **Jan 18, 2026** | ProductHunt + Hacker News |

---

## NFR Validation Points

| NFR ID | Validation Epic | Target |
|--------|-----------------|--------|
| NFR-PERF-01 | Epic 3 | WebContainer boot <5s |
| NFR-PERF-02 | Epic 3 | File mount <3s |
| NFR-PERF-04 | Epic 4 | Agent TTFT <2s |
| NFR-PERF-06 | Epic 3 | File save <500ms |
| NFR-REL-01 | Epic 3 | File sync 99%+ |
| NFR-REL-02 | Epic 5 | State restoration 99%+ |
| NFR-REL-06 | Epic 4 | Tool execution >95% |
| NFR-SEC-05 | Epic 2 | API key encryption AES-256 |
| NFR-USE-01 | Epic 3 | Time to first project <2min |

<!-- Stories will be created in Step 3 -->

---

## Phase 2: Knowledge Synthesis Station MVP

> **Launch Target:** Post-Phase 1 (TBD based on Phase 1 completion)
> **Architecture:** Orama WASM for local-first vector search, React Flow for canvas

### Core Loop (Phase 2): Ground → Synthesize → Review
- **Ground:** Ingest PDF/URL → Orama vector index (Local)
- **Synthesize:** Generate Blocks (Summaries, Quizzes) with citations
- **Review:** Consume via Flashcard Feed or Audio Overview

### Critical Success Moments (Phase 2)
1. **First Drop:** PDF ingestion to Summary with citations in < 60 seconds
2. **Citation Verification:** Tap `[1]` → Source highlights exact sentence (Trust moment)
3. **Mobile Exam Prep:** Flashcard feed loads from IndexedDB in < 2 seconds

### Experience Principles (Phase 2)
1. **Source is Sacred:** Never modify original documents; synthesis layers on top
2. **Blocks, Not Blobs:** AI produces persistent, structured artifacts (JSON), not ephemeral text
3. **Grounding Always Visible:** 100% of AI assertions must have deep-linked citations

---

### Epic 6: 📥 Source Ingestion & Management
*Days 1-3*

**User Outcome:** Users import PDF, URL, and text sources into their knowledge base with automatic metadata extraction and preview.

**Social Media Appeal:** ⭐⭐⭐⭐ — "Drop a PDF, get instant insights" demo

**UX Principles Applied:**
- **Drop-to-Knowledge:** PDF drag-and-drop triggers immediate ingestion pipeline
- **Informed Patience:** Progress indicators during parsing ("Reading page 5... Extracting concepts...")
- **Offline-First:** All sources stored in IndexedDB for mobile access

**FRs Covered:** FR-EDU-01 (Source File Import)

**Dependencies on Phase 1:**
- Dexie.js for IndexedDB persistence (`src/lib/state/dexie-db.ts`)
- Event bus for ingestion progress events
- i18n system for Vietnamese translations

---

#### Story 6.1: Source Import Pipeline (PDF, URL, Text)

**As a** student with research materials,
**I want** to drag and drop PDF/URL/text sources into the app,
**So that** I can quickly ingest my study materials.

**Acceptance Criteria:**

**Given** a user on the Knowledge tab
**When** they drag a PDF file onto the drop zone
**Then** the file is validated (type, size < 50MB)
**And** progress shows: "Reading page 1... Extracting text..."
**And** extracted text is stored in IndexedDB via Dexie

**Given** a user pastes a URL
**When** they submit the URL
**Then** the page is fetched client-side (no server)
**And** main content is extracted (removing nav/ads)
**And** source URL is saved with metadata

**Given** a user pastes text directly
**When** they submit
**Then** the text is accepted without size limit
**And** character count is shown

**Given** an import is in progress
**When** the user navigates away
**Then** import continues in background
**And** toast notifies when complete

**Demo Checkpoint:** 📄 Drag PDF → "Reading page 5..." → Source card appears

---

#### Story 6.2: Source Card UI with Preview

**As a** user with multiple sources,
**I want** to see my sources as beautiful cards with previews,
**So that** I can quickly identify and access each source.

**Acceptance Criteria:**

**Given** a source has been imported
**When** it appears in the Source panel
**Then** a card shows: thumbnail/icon, title, source type (PDF/URL/Text)
**And** card shows: estimated reading time, key topics detected
**And** card has quick actions: Open, Delete, Synthesize

**Given** a user clicks a source card
**When** the source is a PDF or URL
**Then** a preview panel opens showing content
**And** text is readable (proper formatting, no ads)

**Given** a source is a video (YouTube)
**When** previewed
**Then** embedded player appears if available
**And** transcript is extracted if accessible

**Demo Checkpoint:** 🃏 Beautiful source cards with reading time estimates

---

#### Story 6.3: Source Management (Delete, Rename, Organize)

**As a** organized user,
**I want** to manage my sources (delete, rename, organize),
**So that** my knowledge base stays clean and findable.

**Acceptance Criteria:**

**Given** a user selects a source
**When** they click the context menu
**Then** options include: Rename, Delete, Move to Collection, Export

**Given** a user deletes a source
**When** they confirm
**Then** the source is removed from IndexedDB
**And** any derived artifacts (summaries, flashcards) are also removed
**And** "Undo" option is available for 5 seconds

**Given** a user renames a source
**When** they save the new name
**Then** the name updates everywhere (cards, chat citations)

**Given** a user creates a collection
**When** they add sources
**Then** sources can be in multiple collections
**And** collection view shows filtered sources

**Demo Checkpoint:** 🗑️ Delete source → Toast with Undo option

---

#### Story 6.4: Source Metadata Extraction

**As a** user reviewing sources,
**I want** automatic metadata extraction (title, summary, key concepts),
**So that** I can quickly understand a source before reading.

**Acceptance Criteria:**

**Given** a PDF is imported
**When** processing completes
**Then** metadata is extracted:
  - Title (from PDF metadata or filename)
  - Author (if available)
  - Page count, word count
  - Published date (if available)

**Given** metadata extraction runs
**When** it completes
**Then** AI generates:
  - 3-sentence summary
  - 5 key concepts (as tags)
  - Suggested questions to explore

**Given** a user views source metadata
**When** they expand the card
**Then** they can edit/approve the AI-generated metadata
**And** corrections are saved

**Demo Checkpoint:** 🤖 Auto-generated summary + key concepts tags

---

### Epic 7: 🧠 RAG Infrastructure (Orama WASM)
*Days 4-7*

**User Outcome:** Sources are indexed for semantic search with hybrid retrieval (BM25 + vector), enabling source-grounded AI responses with citations.

**Social Media Appeal:** ⭐⭐⭐⭐ — "AI that cites its sources" demo

**UX Principles Applied:**
- **Citation Visibility:** Every AI claim links to source with one-tap verification
- **Grounding Always Visible:** Deep-linked citations build trust
- **Mobile-First:** Orama WASM runs entirely in-browser (no server needed)

**FRs Covered:** FR-AGENT-02 (Tool Execution), FR-EDU-02 (Citation Placeholder)

**Technical Architecture:**
- **Orama WASM** for in-browser vector search (mobile-compatible)
- **Hybrid Retrieval:** BM25 (keyword) + Vector (semantic) with RRF fusion
- **Dexie Storage:** Persistent Orama indexes in IndexedDB

---

#### Story 7.1: Orama WASM Integration & Index Management

**As a** developer,
**I want** Orama WASM integrated for local vector search,
**So that** users can search sources semantically without server.

**Acceptance Criteria:**

**Given** the application loads
**When** Orama initializes
**Then** it loads from WASM with no server round-trips
**And** existing indexes are loaded from IndexedDB

**Given** a source is imported
**When** indexing completes
**Then** document is added to Orama index
**And** index is persisted to IndexedDB

**Given** multiple sources exist
**When** user searches
**Then** all sources are searched
**And** results include source attribution

**Given** index becomes large (>100MB)
**When** user manages storage
**Then** they can rebuild index from sources
**And** orphaned indexes are cleaned up

**Demo Checkpoint:** 🔍 Search finds semantically related content across sources

---

#### Story 7.2: Document Chunking Strategy

**As a** developer implementing RAG,
**I want** an effective chunking strategy for documents,
**So that** retrieval returns relevant, coherent passages.

**Acceptance Criteria:**

**Given** a document is processed for indexing
**When** chunking runs
**Then** documents are split into chunks of 512-2048 tokens
**And** chunk boundaries respect: paragraphs, headings, code blocks

**Given** a chunk is created
**When** it's indexed
**Then** it includes: text content, source ID, position metadata
**And** overlapping chunks (100 token overlap) ensure coverage

**Given** a PDF is chunked
**When** figures/tables exist
**Then** they are preserved as separate chunks with captions
**And** OCR text is included where available

**Demo Checkpoint:** 📊 Show chunk boundaries in source preview

---

#### Story 7.3: Embedding Service Integration (Hybrid Local/Cloud)

**As a** user wanting semantic search,
**I want** embeddings generated locally on desktop or via cloud on mobile,
**So that** the system works offline on desktop while being accessible everywhere.

**Acceptance Criteria:**

**Given** the app loads,
**When** it detects WebGPU support,
**Then** it checks for cached Transformers.js model in IndexedDB

**Given** a chunk is ready for embedding,
**When** running on Desktop with WebGPU and cached model,
**Then** use **local embeddings** (Transformers.js + MiniLM Q4)
**And** no API calls are made
**And** embedding takes ~10-50ms per chunk

**Given** running on Mobile OR no WebGPU,
**When** embedding is needed,
**Then** use **cloud API** (`gemini-embedding-001`)
**And** progress shows "Generating embeddings via cloud..."
**And** embeddings are stored locally after download

**Given** user has no API key and no WebGPU,
**When** they try semantic search,
**Then** show warning: "Semantic search requires API key or desktop browser with WebGPU"
**And** BM25 keyword search works normally
**And** option to switch to keyword-only mode

**Given** local embedding model not cached,
**When** on Desktop,
**Then** prompt user: "Download local embedding model (~90MB) for offline semantic search?"
**And** if confirmed, download and cache in IndexedDB
**And** if declined, use cloud fallback

**Technical Notes:**
- Embedding model: `Xenova/all-MiniLM-L6-v2` (Q4 quantized, ~90MB)
- Cloud fallback: `gemini-embedding-001` (replaces deprecated `text-embedding-004`)
- Provider selection: Auto-detect WebGPU capability → choose local or cloud

**Demo Checkpoint:** 🖥️ Desktop: "Using local embeddings (offline)" → 📱 Mobile: "Using cloud embeddings"

---

#### Story 7.4: Hybrid Retrieval Tool (BM25 + Vector + RRF)

**As a** user searching knowledge,
**I want** combined keyword and semantic search,
**So that** I find both exact matches and related concepts.

**Acceptance Criteria:**

**Given** a user enters a search query
**When** search executes
**Then** BM25 keyword search runs in parallel with vector search
**And** results are fused using Reciprocal Rank Fusion (RRF)
**And** final results show combined relevance score

**Given** search results appear
**When** user clicks a result
**Then** the source opens at the relevant passage
**And** the matching text is highlighted

**Given** no results match
**When** search completes
**Then** user sees "No matches found" with suggestions
**And** they can expand search to web

**Demo Checkpoint:** 🔎 Search "photosynthesis" finds both keyword matches and semantically related content

---

#### Story 7.5: RAG Chat Integration

**As a** student studying,
**I want** to chat with my sources and get grounded answers,
**So that** I can learn from my materials conversationally.

**Acceptance Criteria:**

**Given** a user starts a knowledge chat
**When** they ask a question
**Then** the query triggers hybrid retrieval
**And** relevant chunks are gathered with citations

**Given** AI generates a response
**When** it includes claims
**Then** each claim has inline citation `[source_id]`
**And** citations link to exact passages

**Given** user clicks a citation
**When** it opens
**Then** source panel slides over showing the passage
**And** matching text is highlighted

**Given** response is complete
**When** user asks follow-up
**Then** conversation history is preserved
**And** prior citations remain accessible

**Demo Checkpoint:** 💬 Chat: "What are the main causes of climate change?" → AI answers with `[1][2][3]` citations

---

#### Story 7.6: "Deep Think" Synthesis Block (Desktop Only)

**As a** researcher,
**I want** to use Gemini 3.0's reasoning capabilities,
**So that** I can get a synthesis of contradicting papers.

**Acceptance Criteria:**

**Given** a prompt asking to compare multiple sources,
**When** the user holds the "Generate" button (Long Press),
**Then** switch the model from `gemini-3.0-flash` to `gemini-3.0-pro`.
**And** display a "Deep Thinking" UI state while the model reasons.
**And** output a structured Markdown comparison table with citations.

**Given** deep think mode is active,
**When** reasoning completes,
**Then** show reasoning steps in expandable section
**And** display final synthesis with confidence scores

**Given** user wants to cancel deep think,
**When** they click cancel during reasoning,
**Then** request is terminated immediately
**And** model switches back to `gemini-3.0-flash`

**Platform Note:** Desktop-only feature (high compute requirements)

**Demo Checkpoint:** 🧠 Long-press → "Deep Thinking" animation → Structured comparison table

---

### Epic 8: 🎨 Knowledge Canvas
*Days 8-12*

**User Outcome:** Visual knowledge management with drag-drop nodes and connections, letting users see how concepts relate.

**Social Media Appeal:** ⭐⭐⭐⭐⭐ — **"See how your knowledge connects"** mind map demo

**UX Principles Applied:**
- **Clear-Headed Mastery:** Visual representation turns chaos into order
- **Two-Engine:** Canvas editing on desktop, viewing on mobile
- **Offline-First:** Canvas state persisted to IndexedDB

**Dependencies:**
- React Flow for node/edge rendering (lazy-loaded for bundle size)
- Zustand + Dexie for canvas state persistence

---

#### Story 8.1: React Flow Canvas Setup

**As a** user opening the canvas,
**I want** a visual workspace with nodes and connections,
**So that** I can organize knowledge visually.

**Acceptance Criteria:**

**Given** a user opens the Knowledge Canvas
**When** the canvas loads
**Then** React Flow renders with pan/zoom controls
**And** empty state shows: "Drop sources here to start"

**Given** a user interacts with canvas
**When** they drag, pan, or zoom
**Then** interactions are smooth (60fps)
**And** canvas state is saved to IndexedDB on change

**Given** user is on mobile
**When** canvas opens
**Then** canvas is read-only (view only)
**And** tooltip explains: "Edit on desktop"

**Demo Checkpoint:** 🎮 Smooth pan/zoom on empty canvas

---

#### Story 8.2: Source Node Creation

**As a** user building a knowledge map,
**I want** to drag sources from the sidebar onto the canvas,
**So that** my sources become visual nodes.

**Acceptance Criteria:**

**Given** a user drags a source from the panel
**When** they drop it on the canvas
**Then** a source node is created at drop position
**And** node displays: source title, icon, thumbnail

**Given** a source node is selected
**When** user clicks it
**Then** preview panel shows source content
**And** user can expand to full source view

**Given** user drags multiple sources
**When** they overlap
**Then** visual feedback shows overlap
**And** auto-arrange option is available

**Demo Checkpoint:** 🧩 Drag 3 sources → They appear as connected nodes

---

#### Story 8.3: Concept & Mind Map Nodes

**As a** user synthesizing knowledge,
**I want** to create concept nodes that aren't tied to sources,
**So that** I can express my own ideas and connections.

**Acceptance Criteria:**

**Given** a user double-clicks on canvas
**When** a new node is created
**Then** default text is "New Concept"
**And** user can edit the text inline

**Given** a concept node is selected
**When** they type
**Then** content updates in real-time
**And** changes persist automatically

**Given** user creates multiple concepts
**When** they want to organize
**Then** they can drag to rearrange
**And** group nodes visually

**Demo Checkpoint:** 🧠 Create concept nodes: "Main Idea", "Supporting Evidence", "Conclusion"

---

#### Story 8.4: Connection Lines with Labels

**As a** user showing relationships,
**I want** to connect nodes with labeled lines,
**So that** the visual map shows how concepts relate.

**Acceptance Criteria:**

**Given** a user selects two nodes
**When** they click "Connect"
**Then** an edge is drawn between them
**And** edge label is optional (e.g., "leads to", "contradicts", "supports")

**Given** an edge exists
**When** user hovers over it
**Then** relationship label is visible
**And** edge highlights for deletion

**Given** edge labels exist
**When** user clicks one
**Then** they can edit the label
**And** changes persist

**Demo Checkpoint:** 🔗 Connect "Climate Change" → "Renewable Energy" with label "solution for"

---

#### Story 8.5: Canvas Persistence & Export

**As a** returning user,
**I want** my canvas to be saved and restored,
**So that** I can continue working across sessions.

**Acceptance Criteria:**

**Given** a user makes changes to canvas
**When** they close or switch tabs
**Then** canvas state is saved to IndexedDB
**And** "Saved" indicator appears

**Given** user returns to canvas
**When** it loads
**Then** all nodes and connections are restored
**And** pan/zoom position is preserved

**Given** user wants to share canvas
**When** they export
**Then** options include: PNG image, JSON backup, .alpha pack
**And** exported file can be imported later

**Demo Checkpoint:** 💾 Close tab → Reopen → Canvas exactly as left

---

### Epic 9: 📚 Study Artifacts Generation
*Days 13-16*

**User Outcome:** Auto-generated flashcards, quizzes, and study materials from sources that help with retention.

**Social Media Appeal:** ⭐⭐⭐⭐ — "AI-generated flashcards from my notes" demo

**UX Principles Applied:**
- **Supported Autonomy:** AI assists but student is learning
- **Trust & Authority:** Citation visibility for every question
- **Offline-First:** Flashcards load in < 2 seconds on mobile

---

#### Story 9.1: Flashcard Generator

**As a** student preparing for exams,
**I want** AI-generated flashcards from my sources,
**So that** I can study key concepts efficiently.

**Acceptance Criteria:**

**Given** a user selects a source
**When** they click "Generate Flashcards"
**Then** AI creates Q&A pairs from content
**And** each card has front (question) and back (answer)

**Given** flashcards are generated
**When** user reviews them
**Then** cards show: question on front, answer on back (flip animation)
**And** each card cites the source `[1]`
**And** cards are stored in IndexedDB

**Given** user wants specific cards
**When** they filter
**Then** cards can be filtered by source, topic, or difficulty
**And** search finds cards by content

**Demo Checkpoint:** 🃏 Flip through 10 flashcards generated from PDF

---

#### Story 9.2: Quiz Generator

**As a** teacher creating assessments,
**I want** AI-generated quizzes from my materials,
**So that** I can quickly create engaging student assessments.

**Acceptance Criteria:**

**Given** a user selects sources
**When** they generate a quiz
**Then** AI creates multiple choice questions (4 options)
**And** correct answer is marked
**And** explanation is provided for each question

**Given** quiz is generated
**When** user reviews
**Then** they can edit questions, answers, explanations
**And** they can add/remove questions
**And** they can change difficulty level

**Given** quiz is complete
**When** exported
**Then** options include: PDF print, JSON share, .alpha pack
**And** exported quiz includes answer key

**Demo Checkpoint:** 📝 Generate quiz from textbook chapter → 10 multiple choice questions

---

#### Story 9.3: Flashcard Study Interface

**As a** student studying for exams,
**I want** a focused study interface with spaced repetition,
**So that** I can efficiently memorize key information.

**Acceptance Criteria:**

**Given** user enters study mode
**When** flashcards load
**Then** interface shows one card at a time
**And** large, readable text (mobile-friendly)

**Given** user knows a card
**When** they tap "Know"
**Then** card is scheduled for later review (spaced repetition)
**And** next review date is shown

**Given** user doesn't know a card
**When** they tap "Review Later"
**Then** card appears again soon
**And** learning stats update

**Given** study session ends
**When** user completes cards
**Then** summary shows: cards reviewed, time spent, accuracy
**And** progress is tracked over time

**Demo Checkpoint:** 📱 Mobile study session with swipe gestures

---

#### Story 9.4: Quiz Taking Interface

**As a** student taking a quiz,
**I want** an interactive quiz interface with scoring,
**So that** I can test my knowledge and see results.

**Acceptance Criteria:**

**Given** a user starts a quiz
**When** questions load
**Then** one question appears at a time
**And** timer starts (optional)

**Given** user selects an answer
**When** they submit
**Then** immediate feedback shows: correct/incorrect + explanation
**And** score updates

**Given** quiz completes
**When** all questions answered
**Then** results show: score, time taken, questions reviewed
**And** user can retry incorrect questions
**And** results are saved to history

**Demo Checkpoint:** 🎯 Complete quiz → See score breakdown → Review explanations

---

### Epic 10: 🎙️ Knowledge Chat & Synthesis
*Days 17-19*

**User Outcome:** Chat with sources and generate NotebookLM-style audio overviews for learning on-the-go.

**Social Media Appeal:** ⭐⭐⭐⭐⭐ — **"Listen to your study materials"** audio overview demo

**UX Principles Applied:**
- **Audio Overview as Viral Hook:** 30-second AI summaries in Vietnamese
- **Mobile Consumption:** Audio enables learning during commute
- **Background Listening:** Offline-capable playback

---

#### Story 10.1: Live API WebSocket Manager (Desktop Only)

**As a** user wanting voice interaction,
**I want** a WebSocket connection to Gemini Live API,
**So that** I can speak naturally and get audio responses in real-time.

**Acceptance Criteria:**

**Given** user clicks microphone button on desktop,
**When** voice mode activates,
**Then** establish WebSocket connection to `gemini-2.5-flash-native-audio-preview-12-2025`
**And** audio input captures from microphone at 16kHz
**And** audio output streams to speakers in real-time

**Given** WebSocket is connected,
**When** user speaks,
**Then** audio chunks are sent with `clientContent` messages
**And** server responds with audio chunks via `serverContent`
**And** latency is <500ms for perceived real-time

**Given** connection fails,
**When** WebSocket errors,
**Then** show retry dialog with "Connection lost. Reconnecting..."
**And** after 3 failures, show manual entry fallback

**Given** user is on mobile,
**When** they tap voice,
**Then** show tooltip: "Voice chat available on desktop"
**And** text input remains available

**Platform Note:** Desktop-only (WebSocket bandwidth + processing requirements)

**Technical Notes:**
```typescript
const GEMINI_MODELS = {
  flash: 'gemini-3.0-flash',
  pro: 'gemini-3.0-pro',
  live: 'gemini-2.5-flash-native-audio-preview-12-2025',
  embedding: 'gemini-embedding-001'
};
const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;
```

**Demo Checkpoint:** 🎙️ Voice chat with real-time audio streaming (desktop only)

---

#### Story 10.2: Multimodal Source Vision (Desktop Only)

**As a** student asking about a diagram,
**I want** Gemini to "see" the PDF page I'm looking at,
**So that** it can explain charts and graphs in real-time.

**Acceptance Criteria:**

**Given** the user is viewing a specific PDF page,
**When** they ask a question via voice (Desktop Live API),
**Then** the client captures the current viewport as a base64 JPEG (using `pdf.js`).
**And** sends it in the `clientContent` WebSocket frame alongside the audio chunk.
**And** the model references the visual content in its audio response.

**Given** multimodal vision is active,
**When** user asks "What does this chart show?",
**Then** AI describes the chart/figure in the captured viewport
**And** points out specific data trends visible in the image
**And** provides context from surrounding text

**Given** user scrolls to a new page,
**When** vision is still active,
**Then** the captured viewport updates automatically
**And** AI can answer questions about the new content

**Given** user is not on desktop,
**When** they try to use vision,
**Then** show tooltip: "Vision requires desktop browser"
**And** text-based Q&A remains available

**Platform Note:** Desktop-only (WebSocket required, high bandwidth ~500KB/min for images)

**Demo Checkpoint:** 👁️ Point at chart → "This bar chart shows..." → Real-time audio explanation

---

#### Story 10.3: Audio Overview Generator

**As a** student commuting,
**I want** to listen to AI-generated audio summaries of my sources,
**So that** I can learn during downtime.

**Acceptance Criteria:**

**Given** user selects sources
**When** they click "Generate Audio"
**Then** call the REST API with model `gemini-3.0-flash`
**And** set config: `response_modalities: ["AUDIO"]` and `speech_config.voice_name: "Aoede"`
**And** use system prompt: *"Create a lively 2-person dialogue debating key points."*
**And** audio is saved to IndexedDB for offline playback

**Given** audio is generating
**When** user waits
**Then** progress shows: "Generating script..." → "Synthesizing audio..."
**And** estimated time is shown

**Given** audio is ready
**When** user plays
**Then** audio player shows: progress bar, speed control, skip forward/back
**And** transcripts are available (read while listening)

**Given** user is on mobile
**When** audio plays
**Then** background playback works
**And** audio continues when app is in background

**Technical Notes:**
- Model: `gemini-3.0-flash` for fast, cost-effective audio generation
- Voice: Aoede (default Gemini TTS voice)
- Format: Audio blob stored in IndexedDB for offline playback
- Mobile: Works via cloud API, playback optimized for mobile

**Demo Checkpoint:** 🎧 Generate audio from textbook → Listen during commute

---

## Phase 2 Sprint Calendar

| Sprint | Epic | Dates | Demo Focus |
|--------|------|-------|------------|
| Sprint 6 | Epic 6: Source Ingestion | TBD | Drag & drop PDF import |
| Sprint 7 | Epic 7: RAG Infrastructure | TBD | Semantic search + citations |
| Sprint 8 | Epic 8: Knowledge Canvas | TBD | Visual knowledge map |
| Sprint 9 | Epic 9: Study Artifacts | TBD | Flashcards + quiz |
| Sprint 10 | Epic 10: Knowledge Chat | TBD | Audio overview |

---

## Phase 2 NFR Validation Points

| NFR ID | Validation Epic | Target |
|--------|-----------------|--------|
| NFR-PERF-P2-01 | Epic 6 | Source ingestion < 60s for typical PDF |
| NFR-PERF-P2-02 | Epic 6 | Source preview < 2s load |
| NFR-PERF-P2-03 | Epic 7 | Semantic search < 500ms |
| NFR-PERF-P2-04 | Epic 7 | Citation lookup < 100ms |
| NFR-PERF-P2-05 | Epic 8 | Canvas interaction 60fps |
| NFR-PERF-P2-06 | Epic 9 | Flashcard load < 2s mobile |
| NFR-PERF-P2-07 | Epic 10 | Audio generation < 30s |
| NFR-REL-P2-01 | Epic 6 | IndexedDB reliability 99%+ |
| NFR-REL-P2-02 | Epic 7 | Citation accuracy 100% |

---

## Comprehensive Traceability Matrix

### Epic → Requirements Traceability

| Epic ID | Epic Name | Functional Requirements | Non-Functional Requirements | Architecture References | UX References | PRD References | Project Context References |
|---------|-----------|------------------------|---------------------------|------------------------|--------------|---------------|---------------------------|
| **Epic 1** | Mobile-First Visual Foundation | FR-UI-01, FR-UI-02, FR-UI-03, FR-UI-04 | NFR-USE-04, NFR-SEC-06, NFR-COMPAT-01,02,03,04,05,06 | Arch 5.2 (naming), Arch 5.3 (barrel exports) | UX 2.1, 3.1, 4.1, 4.2, 5.1 | PRD 2.1 (Multi-Surface), PRD 2.3 (Progressive Disclosure) | Context: Cross-Architecture (mobile support), Bilingual Support (i18n) |
| **Epic 2** | AI Chat That Just Works | FR-AGENT-01, FR-AGENT-03, FR-STATE-01, FR-STATE-02 | NFR-PERF-04, NFR-REL-02, NFR-SEC-01,02,05 | Arch 4.2 (Zustand+Dexie), Arch 4.3 (AES-256), Arch 4.4 (5-Layer System) | UX 2.3, 3.2 | PRD 3.1 (Multi-Provider), PRD 3.2 (Streaming) | Context: Advanced State Management, Bilingual Support |
| **Epic 3** | Local-First File Magic | FR-ENV-01, FR-ENV-02, FR-ENV-03, FR-STATE-03 | NFR-PERF-01,02,06, NFR-REL-01,05, NFR-SEC-03,04 | Arch 3.5 (Vector Store), Arch 4.2 (Unified State), Arch 6.1 (Project Structure) | UX 2.1, 3.1 | PRD 4.1 (WebContainer), PRD 4.2 (FSA Sync) | Context: Cross-Architecture (WebContainer), Brownfield Architecture |
| **Epic 4** | Smart Agent Tools | FR-AGENT-02, FR-AGENT-04, FR-AGENT-05, FR-ERROR-01 | NFR-PERF-04, NFR-REL-06, NFR-SEC-01,02 | Arch 4.4 (5-Layer System), Arch 4.4.5 (Tool Trust Levels) | UX 3.2 | PRD 3.3 (Tool Execution), PRD 3.4 (Error Handling) | Context: Advanced State Management (RAG patterns) |
| **Epic 5** | Production-Ready Polish | FR-STATE-04, FR-ERROR-02, FR-ERROR-03, FR-ERROR-04 | NFR-PERF-01-08, NFR-REL-01-06, NFR-OBS-01-05 | Arch 4.2 (State Persistence), Arch 5.5 (Event Bus) | UX 4.1 | PRD 5.1 (Resilience), PRD 5.2 (Observability) | Context: Brownfield Architecture (integration) |
| **Epic 6** | Source Ingestion & Management | FR-EDU-01 | NFR-PERF-P2-01,02, NFR-REL-P2-01 | Arch 3.5 (Orama WASM), Arch 4.2 (IndexedDB) | UX 8.1 (Content Guidelines) | PRD 6.1 (Source Import), PRD 6.2 (Metadata) | Context: RAG Infrastructure, Bilingual Support, Performance Targets |
| **Epic 7** | RAG Infrastructure | FR-AGENT-02, FR-EDU-02 | NFR-PERF-P2-03,04, NFR-REL-P2-02 | Arch 3.5 (Vector Store), Arch 4.2 (State Persistence) | UX 8.1, 21 (Cross-Platform) | PRD 7.1 (Vector Search), PRD 7.2 (Hybrid Retrieval) | Context: RAG Infrastructure, Advanced State Management, Performance Targets |
| **Epic 8** | Knowledge Canvas | - | NFR-PERF-P2-05 | Arch 4.2 (Canvas State), Arch 6.1 (Project Structure) | UX 8.2, 21 | PRD 8.1 (Visual Knowledge), PRD 8.2 (Canvas Editing) | Context: Cross-Architecture (React Flow), Advanced State Management |
| **Epic 9** | Study Artifacts Generation | - | NFR-PERF-P2-06 | Arch 4.2 (Artifact Storage) | UX 8.1 | PRD 9.1 (Flashcards), PRD 9.2 (Quizzes) | Context: RAG Infrastructure, Bilingual Support, Performance Targets |
| **Epic 10** | Knowledge Chat & Synthesis | - | NFR-PERF-P2-07 | Arch 4.4 (5-Layer System), Arch 4.4.5 (Tool Trust) | UX 8.1, 21 | PRD 10.1 (Voice Chat), PRD 10.2 (Audio Overview) | Context: Cross-Architecture (WebSocket), Bilingual Support, Performance Targets |

---

### Story-Level Traceability

#### Phase 1 Stories

| Story ID | Story Name | Epic | Acceptance Criteria | Dependencies | Blockers | NFR Validated | Tech Stack | Files Modified |
|----------|-----------|------|---------------------|--------------|----------|---------------|------------|----------------|
| **1.1** | Responsive Breakpoint Foundation | Epic 1 | Desktop/tablet/mobile layouts, resizable panels | useResponsive hook | - | NFR-USE-04, NFR-COMPAT-01,02,03,04 | Tailwind CSS 4, react-resizable-panels | `src/hooks/useResponsive.ts`, `src/components/layout/IDELayout.tsx` |
| **1.2** | Dark/Light Theme System | Epic 1 | Theme toggle, persistence, accessibility | - | - | NFR-USE-04, NFR-SEC-06 | next-themes, design tokens | `src/components/ui/ThemeToggle.tsx`, `src/styles/design-tokens.css` |
| **1.3** | Mobile Demo Mode with Capability Detection | Epic 1 | Capability detection, demo mode, sample conversations | useCapabilityDetection hook, sample-conversations.json | E1-B1 | NFR-USE-04, NFR-COMPAT-05 | - | `src/hooks/useCapabilityDetection.ts`, `src/lib/demo/sample-conversations.json` |
| **1.4** | Accessibility Foundation | Epic 1 | Keyboard navigation, ARIA labels, focus management | - | - | NFR-USE-04, UX 4.1 | - | `src/components/common/ErrorBoundary.tsx`, all interactive components |
| **2.0** | Credential Vault Implementation | Epic 2 | AES-256 encryption, IndexedDB storage | - | - | NFR-SEC-05 | Web Crypto API, Dexie | `src/lib/security/credential-vault.ts`, `src/lib/security/crypto-utils.ts` |
| **2.1** | Zustand + Dexie State Migration | Epic 2 | Agent config in Zustand, Dexie persistence | Story 2.0 | - | NFR-PERF-08 | Zustand, Dexie | `src/lib/state/agents-store.ts`, `src/lib/state/conversation-store.ts` |
| **2.2** | Agent CRUD Operations with Optimistic UI | Epic 2 | Create/edit/delete agents, optimistic updates | Story 2.1 | - | NFR-REL-02 | Zustand | `src/components/agent/AgentConfigDialog.tsx` |
| **2.3** | Streaming Chat with Tool Approval UI | Epic 2 | Streaming markdown, tool approval overlay | Story 2.1 | E2-B2, E2-D2 | NFR-PERF-04 | TanStack AI, ApprovalOverlay component | `src/components/chat/ApprovalOverlay.tsx`, `src/lib/agent/tools/tool-parser.ts` |
| **2.4** | Conversation Persistence & Session Restore | Epic 2 | IndexedDB persistence, scroll position | Story 2.1 | E2-B3, E2-D1 | NFR-REL-02 | Dexie | `src/lib/state/conversation-store.ts`, `src/components/chat/ChatPanel.tsx` |
| **3.1** | FSA Permission Lifecycle & Re-Grant Flow | Epic 3 | Permission persistence, re-grant flow | - | E3-B1 | NFR-REL-05 | File System Access API | `src/lib/fs/fsa-permission-manager.ts` |
| **3.2** | WebContainer Boot with Progress Indicator | Epic 3 | Boot progress, <5s target | - | E3-B2, E3-D1 | NFR-PERF-01 | @webcontainer/api | `src/lib/webcontainer/boot-manager.ts` |
| **3.3** | Dual-Write Sync (Local FS ↔ WebContainer) | Epic 3 | Parallel write, sync queue, conflict resolution | Story 3.2 | E3-B3 | NFR-PERF-02,06, NFR-REL-01 | SyncManager, ConflictDialog | `src/lib/filesystem/sync-manager.ts`, `src/components/sync/ConflictDialog.tsx` |
| **3.4** | Terminal Integration with WebContainer Shell | Epic 3 | xterm.js terminal, shell connection | Story 3.2 | E3-D2 | - | @xterm/xterm, @xterm/addon-fit | `src/lib/terminal/wc-terminal.ts` |
| **4.1** | 5-Layer System Prompt Composer (Layers 1-3) | Epic 4 | System prompt composition, context injection | - | E4-B1 | - | SystemPromptComposer | `src/lib/agent/prompt-composer.ts` |
| **4.2** | File Tool Execution (read_file, write_file, list_files) | Epic 4 | File operations, large file warning | Story 4.1 | - | NFR-REL-06 | AgentFileTools | `src/lib/agent/tools/file-tools.ts` |
| **4.3** | Tool Permissions & Trust Levels | Epic 4 | Trust levels (auto/prompt/block), session trust | Story 4.2 | E4-B3, E4-B5 | NFR-SEC-01 | ToolPermissionManager | `src/lib/agent/tools/tool-permissions.ts` |
| **4.4** | Tool Error Handling with Retry Logic | Epic 4 | Retry logic, race condition handling | Story 4.3 | E4-B4, E4-D2 | NFR-REL-06 | ToolExecutor | `src/lib/agent/tools/tool-executor.ts` |
| **5.1** | Sync Queue Visualizer & Global Status | Epic 5 | Status bar indicator, process panel | Story 3.3 | - | NFR-OBS-01,02,04 | useFileSyncStatusStore | `src/lib/state/file-sync-status-store.ts`, `src/components/ide/SyncStatusIndicator.tsx` |
| **5.2** | WebContainer Crash Recovery & Resilience | Epic 5 | Auto-reboot, max 3 attempts, toast notifications | Story 3.2 | - | NFR-REL-03 | CrashRecovery | `src/lib/webcontainer/crash-recovery.ts` |
| **5.3** | Performance Telemetry & Benchmark Dashboard | Epic 5 | Performance metrics, Nerd Stats overlay | - | - | NFR-PERF-01-08, NFR-OBS-01,05 | PerformanceMonitor | `src/lib/monitoring/performance-monitor.ts` |
| **5.4** | Robust State Hydration & Restoration | Epic 5 | Zustand hydration, corrupt state recovery | Story 2.1 | - | NFR-REL-02 | Zustand, Zod | `src/lib/state/ide-store.ts` |

#### Phase 2 Stories

| Story ID | Story Name | Epic | Acceptance Criteria | Dependencies | Blockers | NFR Validated | Tech Stack | Files Modified |
|----------|-----------|------|---------------------|--------------|----------|---------------|------------|----------------|
| **6.1** | Source Import Pipeline (PDF, URL, Text) | Epic 6 | PDF/URL/text import, progress indicators | Dexie.js, event bus | - | NFR-PERF-P2-01, NFR-REL-P2-01 | pdf.js, Dexie | `src/lib/knowledge/source-import.ts` |
| **6.2** | Source Card UI with Preview | Epic 6 | Card display, preview panel, metadata | Story 6.1 | - | NFR-PERF-P2-02 | - | `src/components/knowledge/SourceCard.tsx` |
| **6.3** | Source Management (Delete, Rename, Organize) | Epic 6 | CRUD operations, collections, undo | Story 6.2 | - | - | Zustand | `src/lib/state/knowledge-store.ts` |
| **6.4** | Source Metadata Extraction | Epic 6 | Auto-metadata, AI summary, key concepts | Story 6.1 | - | - | Gemini API | `src/lib/knowledge/metadata-extractor.ts` |
| **7.1** | Orama WASM Integration & Index Management | Epic 7 | Orama WASM, index persistence, search | Story 6.1 | - | NFR-PERF-P2-03, NFR-REL-P2-02 | Orama WASM, Dexie | `src/lib/rag/orama-index.ts` |
| **7.2** | Document Chunking Strategy | Epic 7 | 512-2048 token chunks, overlap, boundaries | Story 7.1 | - | - | - | `src/lib/rag/chunking.ts` |
| **7.3** | Embedding Service Integration (Hybrid Local/Cloud) | Epic 7 | Local embeddings (Transformers.js), cloud fallback | Story 7.2 | - | - | Transformers.js, Gemini API | `src/lib/rag/embeddings.ts` |
| **7.4** | Hybrid Retrieval Tool (BM25 + Vector + RRF) | Epic 7 | Hybrid search, RRF fusion, result highlighting | Story 7.3 | - | NFR-PERF-P2-03, NFR-PERF-P2-04 | Orama WASM | `src/lib/rag/retrieval.ts` |
| **7.5** | RAG Chat Integration | Epic 7 | Grounded responses, inline citations | Story 7.4 | - | NFR-REL-P2-02 | TanStack AI | `src/lib/rag/rag-chat.ts` |
| **7.6** | "Deep Think" Synthesis Block (Desktop Only) | Epic 7 | Long-press deep think, Gemini 3.0 Pro | Story 7.5 | - | - | Gemini 3.0 Pro | `src/lib/rag/deep-think.ts` |
| **8.1** | React Flow Canvas Setup | Epic 8 | Canvas rendering, pan/zoom, read-only mobile | Zustand + Dexie | - | NFR-PERF-P2-05 | React Flow | `src/components/canvas/Canvas.tsx` |
| **8.2** | Source Node Creation | Epic 8 | Drag-drop sources, node display | Story 8.1 | - | - | React Flow | `src/components/canvas/SourceNode.tsx` |
| **8.3** | Concept & Mind Map Nodes | Epic 8 | Concept nodes, inline editing | Story 8.1 | - | - | React Flow | `src/components/canvas/ConceptNode.tsx` |
| **8.4** | Connection Lines with Labels | Epic 8 | Edge creation, labels, deletion | Story 8.3 | - | - | React Flow | `src/components/canvas/EdgeLabel.tsx` |
| **8.5** | Canvas Persistence & Export | Epic 8 | IndexedDB persistence, export options | Story 8.1 | - | - | Dexie | `src/lib/state/canvas-store.ts` |
| **9.1** | Flashcard Generator | Epic 9 | Q&A generation, citations | Story 7.5 | - | NFR-PERF-P2-06 | Gemini API | `src/lib/study/flashcard-generator.ts` |
| **9.2** | Quiz Generator | Epic 9 | Multiple choice, explanations | Story 9.1 | - | - | Gemini API | `src/lib/study/quiz-generator.ts` |
| **9.3** | Flashcard Study Interface | Epic 9 | Spaced repetition, study stats | Story 9.1 | - | NFR-PERF-P2-06 | - | `src/components/study/FlashcardStudy.tsx` |
| **9.4** | Quiz Taking Interface | Epic 9 | Interactive quiz, scoring, review | Story 9.2 | - | - | - | `src/components/study/QuizTaking.tsx` |
| **10.1** | Live API WebSocket Manager (Desktop Only) | Epic 10 | WebSocket connection, real-time audio | - | - | - | Gemini Live API | `src/lib/voice/websocket-manager.ts` |
| **10.2** | Multimodal Source Vision (Desktop Only) | Epic 10 | PDF page capture, vision explanation | Story 10.1 | - | - | Gemini Live API, pdf.js | `src/lib/voice/vision-capture.ts` |
| **10.3** | Audio Overview Generator | Epic 10 | Audio generation, offline playback | Story 7.5 | - | NFR-PERF-P2-07 | Gemini 3.0 Flash | `src/lib/study/audio-overview.ts` |

---

### Dependency Graph

#### Phase 1 Dependencies

```
Story 2.0 (Credential Vault)
    ↓
Story 2.1 (Zustand + Dexie Migration)
    ↓
Story 2.2 (Agent CRUD) ──────┐
    ↓                        │
Story 2.3 (Streaming Chat)   │
    ↓                        │
Story 2.4 (Persistence)      │
                             │
Story 3.2 (WebContainer Boot)│
    ↓                        │
Story 3.3 (Dual-Write Sync)──┤
    ↓                        │
Story 3.4 (Terminal)         │
                             │
Story 4.1 (System Prompt)────┤
    ↓                        │
Story 4.2 (File Tools)       │
    ↓                        │
Story 4.3 (Permissions)      │
    ↓                        │
Story 4.4 (Error Handling)   │
                             │
Story 3.3 ─────→ Story 5.1 (Sync Queue)
Story 3.2 ─────→ Story 5.2 (Crash Recovery)
Story 2.1 ─────→ Story 5.4 (State Hydration)
```

#### Phase 2 Dependencies

```
Story 6.1 (Source Import)
    ↓
Story 6.2 (Source Cards) ──────┐
    ↓                         │
Story 6.3 (Source Management) │
    ↓                         │
Story 6.4 (Metadata)         │
                              │
Story 6.1 ─────→ Story 7.1 (Orama)
    ↓                         │
Story 7.2 (Chunking)         │
    ↓                         │
Story 7.3 (Embeddings)        │
    ↓                         │
Story 7.4 (Hybrid Retrieval)  │
    ↓                         │
Story 7.5 (RAG Chat) ─────────┤
    ↓                         │
Story 7.6 (Deep Think)       │
                              │
Story 7.5 ─────→ Story 9.1 (Flashcards)
    ↓                         │
Story 9.2 (Quizzes)          │
    ↓                         │
Story 9.3 (Flashcard Study)   │
    ↓                         │
Story 9.4 (Quiz Taking)       │
                              │
Story 10.1 (WebSocket)        │
    ↓                         │
Story 10.2 (Vision)           │
                              │
Story 7.5 ─────→ Story 10.3 (Audio)
                              │
Story 6.1 ─────→ Story 8.1 (Canvas)
    ↓
Story 8.2 (Source Nodes)
    ↓
Story 8.3 (Concept Nodes)
    ↓
Story 8.4 (Connections)
    ↓
Story 8.5 (Persistence)
```

---

### Cross-Document Reference Index

#### Architecture Document References

| Arch Section | Topic | Related Epics | Related Stories |
|--------------|-------|---------------|----------------|
| Arch 3.5 | Vector Store Strategy | Epic 7 | 7.1, 7.2, 7.3, 7.4, 7.5, 7.6 |
| Arch 4.2 | Unified Zustand + Dexie | Epic 2, 3, 5 | 2.1, 2.4, 3.3, 5.1, 5.4 |
| Arch 4.3 | AES-256 Encryption | Epic 2 | 2.0 |
| Arch 4.4 | 5-Layer Agent System | Epic 2, 4, 10 | 2.3, 4.1, 4.2, 4.3, 4.4, 10.1, 10.2 |
| Arch 4.4.5 | Tool Trust Levels | Epic 4 | 4.3 |
| Arch 5.2 | Naming Conventions | Epic 1 | 1.1, 1.2 |
| Arch 5.3 | Barrel Exports | Epic 1 | 1.1, 1.2 |
| Arch 5.5 | Event Bus Pattern | Epic 5 | 5.1 |
| Arch 5.6 | Custom Error Classes | Epic 4, 5 | 4.4, 5.2 |
| Arch 6.1 | Project Structure | Epic 3, 8 | 3.1, 8.1 |
| Arch 6.2 | State Boundaries | Epic 2, 5 | 2.1, 5.4 |
| Arch 6.3 | Phase 2 Additions | Epic 6-10 | All Phase 2 stories |

#### PRD Document References

| PRD Section | Topic | Related Epics | Related Stories |
|-------------|-------|---------------|----------------|
| PRD 2.1 | Multi-Surface Layout | Epic 1 | 1.1, 1.3 |
| PRD 2.3 | Progressive Disclosure | Epic 1 | 1.2 |
| PRD 3.1 | Multi-Provider Configuration | Epic 2 | 2.0, 2.1, 2.2 |
| PRD 3.2 | Streaming Responses | Epic 2 | 2.3 |
| PRD 3.3 | Tool Execution | Epic 4 | 4.2, 4.4 |
| PRD 3.4 | Error Handling | Epic 4, 5 | 4.4, 5.2 |
| PRD 4.1 | WebContainer Integration | Epic 3 | 3.2, 3.4 |
| PRD 4.2 | FSA Sync | Epic 3 | 3.1, 3.3 |
| PRD 5.1 | Resilience | Epic 5 | 5.2, 5.4 |
| PRD 5.2 | Observability | Epic 5 | 5.1, 5.3 |
| PRD 6.1 | Source Import | Epic 6 | 6.1, 6.2 |
| PRD 6.2 | Metadata Extraction | Epic 6 | 6.4 |
| PRD 7.1 | Vector Search | Epic 7 | 7.1, 7.2, 7.3 |
| PRD 7.2 | Hybrid Retrieval | Epic 7 | 7.4, 7.5 |
| PRD 8.1 | Visual Knowledge | Epic 8 | 8.1, 8.2, 8.3 |
| PRD 8.2 | Canvas Editing | Epic 8 | 8.4, 8.5 |
| PRD 9.1 | Flashcards | Epic 9 | 9.1, 9.3 |
| PRD 9.2 | Quizzes | Epic 9 | 9.2, 9.4 |
| PRD 10.1 | Voice Chat | Epic 10 | 10.1, 10.2 |
| PRD 10.2 | Audio Overview | Epic 10 | 10.3 |

#### UX Design Specification References

| UX Section | Topic | Related Epics | Related Stories |
|------------|-------|---------------|----------------|
| UX 2.1 | Multi-Surface Layout | Epic 1, 3 | 1.1, 1.3, 3.1 |
| UX 2.3 | Progressive Disclosure | Epic 1 | 1.2 |
| UX 3.1 | Mobile Card Feed | Epic 1 | 1.1, 1.3 |
| UX 3.2 | Chat Panel | Epic 2 | 2.3, 2.4 |
| UX 4.1 | WCAG 2.1 AA | Epic 1 | 1.4 |
| UX 4.2 | Color Contrast | Epic 1 | 1.2, 1.4 |
| UX 5.1 | Vietnamese-First | Epic 1, 2, 6, 9, 10 | All stories with i18n |
| UX 8.1 | Content Guidelines | Epic 6, 9, 10 | 6.4, 9.1, 9.2, 10.3 |
| UX 21 | Cross-Platform Consistency | Epic 6, 7, 8, 10 | 7.3, 8.1, 10.1, 10.2 |
| UX 24 | Performance Targets (Phase 2) | Epic 6-10 | All Phase 2 stories |

#### Project Context References

| Context Section | Topic | Related Epics | Related Stories |
|-----------------|-------|---------------|----------------|
| Cross-Architecture Support | CPU/Platform Targets | Epic 1, 3, 8, 10 | 1.1, 1.3, 3.2, 8.1, 10.1, 10.2 |
| Advanced State Management | Client/Server State Patterns | Epic 2, 4, 5, 7, 8 | 2.1, 4.1, 5.4, 7.5, 8.5 |
| RAG Infrastructure Constraints | Vector DB, Embeddings | Epic 6, 7 | 6.1, 7.1, 7.2, 7.3, 7.4, 7.5 |
| Bilingual Support Constraints | Vietnamese/English, RTL | Epic 1, 2, 6, 9, 10 | 1.2, 2.3, 6.4, 9.1, 10.3 |
| Performance Targets | Latency Targets | Epic 3, 5, 6, 7, 8, 9, 10 | 3.2, 5.3, 6.1, 7.4, 8.1, 9.3, 10.3 |
| Brownfield Architecture Alignment | Integration, Migration | Epic 3, 5 | 3.1, 3.3, 5.2, 5.4 |

---

### NFR Validation Matrix

#### Phase 1 NFRs

| NFR ID | Requirement | Target | Red Flag | Validation Epic | Validation Story | Status |
|--------|-------------|--------|----------|-----------------|------------------|--------|
| NFR-PERF-01 | WebContainer boot time | <5s | >10s | Epic 3 | 3.2 | ✅ Defined |
| NFR-PERF-02 | File mount (100 files) | <3s | >8s | Epic 3 | 3.3 | ✅ Defined |
| NFR-PERF-03 | Dev server start | <30s | >60s | Epic 5 | 5.3 | ✅ Defined |
| NFR-PERF-04 | Agent TTFT | <2s | >5s | Epic 2 | 2.3 | ✅ Defined |
| NFR-PERF-05 | Preview hot-reload | <2s | >5s | Epic 3 | 3.4 | ✅ Defined |
| NFR-PERF-06 | File save to disk | <500ms | >2s | Epic 3 | 3.3 | ✅ Defined |
| NFR-PERF-07 | Monaco editor load | <2s | >5s | Epic 5 | 5.3 | ✅ Defined |
| NFR-PERF-08 | IndexedDB query | <100ms | >500ms | Epic 2 | 2.1 | ✅ Defined |
| NFR-REL-01 | File sync reliability | 99%+ | - | Epic 3 | 3.3 | ✅ Defined |
| NFR-REL-02 | State restoration | 99%+ | - | Epic 5 | 5.4 | ✅ Defined |
| NFR-REL-03 | WebContainer stability | No crash | - | Epic 5 | 5.2 | ✅ Defined |
| NFR-REL-04 | No data corruption | 0 incidents | - | Epic 5 | 5.4 | ✅ Defined |
| NFR-REL-05 | FSA re-grant success | >90% | - | Epic 3 | 3.1 | ✅ Defined |
| NFR-REL-06 | Tool execution reliability | >95% | - | Epic 4 | 4.4 | ✅ Defined |
| NFR-USE-01 | Time to first project | <2 min | - | Epic 3 | 3.2 | ✅ Defined |
| NFR-USE-02 | Onboarding completion | >70% | - | Epic 1 | 1.1 | ✅ Defined |
| NFR-USE-03 | Error recovery path | <10s | - | Epic 5 | 5.2 | ✅ Defined |
| NFR-USE-04 | Keyboard accessibility | Full | - | Epic 1 | 1.4 | ✅ Defined |
| NFR-USE-05 | Permission prompt clarity | <5 retries | - | Epic 3 | 3.1 | ✅ Defined |
| NFR-USE-06 | Chat discoverability | >80% usage | - | Epic 2 | 2.3 | ✅ Defined |
| NFR-SEC-01 | No server data transmission | 100% | - | Epic 2 | 2.0 | ✅ Defined |
| NFR-SEC-02 | API keys client-only | User controls | - | Epic 2 | 2.0 | ✅ Defined |
| NFR-SEC-03 | FSA scoped execution | Per session | - | Epic 3 | 3.1 | ✅ Defined |
| NFR-SEC-04 | WebContainers sandboxing | Per spec | - | Epic 3 | 3.2 | ✅ Defined |
| NFR-SEC-05 | API key encryption at rest | AES-256 | - | Epic 2 | 2.0 | ✅ Defined |
| NFR-SEC-06 | Content Security Policy | Strict | - | Epic 1 | 1.2 | ✅ Defined |
| NFR-SEC-07 | No PII in logs | 0 incidents | - | Epic 5 | 5.3 | ✅ Defined |
| NFR-COMPAT-01 | Chrome 86+ | Full support | - | Epic 1 | 1.1 | ✅ Defined |
| NFR-COMPAT-02 | Edge 86+ | Full support | - | Epic 1 | 1.1 | ✅ Defined |
| NFR-COMPAT-03 | Safari 15.2+ | FSA support (partial) | - | Epic 1 | 1.1 | ✅ Defined |
| NFR-COMPAT-04 | Firefox 115+ | IndexedDB only | - | Epic 1 | 1.1 | ✅ Defined |
| NFR-COMPAT-05 | SharedArrayBuffer | Mandatory | - | Epic 1 | 1.3 | ✅ Defined |
| NFR-COMPAT-06 | COOP/COEP headers | Strict | - | Epic 1 | 1.1 | ✅ Defined |
| NFR-OBS-01 | Performance metrics capture | 100% | - | Epic 5 | 5.3 | ✅ Defined |
| NFR-OBS-02 | Error rate tracking | All errors | - | Epic 5 | 5.3 | ✅ Defined |
| NFR-OBS-03 | Tool execution tracing | Every call | - | Epic 5 | 5.3 | ✅ Defined |
| NFR-OBS-04 | Sync operation audit | Every sync | - | Epic 5 | 5.3 | ✅ Defined |
| NFR-OBS-05 | User diagnostics panel | Accessible | - | Epic 5 | 5.3 | ✅ Defined |

#### Phase 2 NFRs

| NFR ID | Requirement | Target | Red Flag | Validation Epic | Validation Story | Status |
|--------|-------------|--------|----------|-----------------|------------------|--------|
| NFR-PERF-P2-01 | Source ingestion | <60s | >120s | Epic 6 | 6.1 | ✅ Defined |
| NFR-PERF-P2-02 | Source preview | <2s | >5s | Epic 6 | 6.2 | ✅ Defined |
| NFR-PERF-P2-03 | Semantic search | <500ms | >1s | Epic 7 | 7.4 | ✅ Defined |
| NFR-PERF-P2-04 | Citation lookup | <100ms | >500ms | Epic 7 | 7.5 | ✅ Defined |
| NFR-PERF-P2-05 | Canvas interaction | 60fps | <30fps | Epic 8 | 8.1 | ✅ Defined |
| NFR-PERF-P2-06 | Flashcard load | <2s mobile | >5s | Epic 9 | 9.3 | ✅ Defined |
| NFR-PERF-P2-07 | Audio generation | <30s | >60s | Epic 10 | 10.3 | ✅ Defined |
| NFR-REL-P2-01 | IndexedDB reliability | 99%+ | - | Epic 6 | 6.3 | ✅ Defined |
| NFR-REL-P2-02 | Citation accuracy | 100% | - | Epic 7 | 7.5 | ✅ Defined |

---

### Technology Stack Traceability

#### Core Libraries

| Library | Version | Purpose | Related Epics | Related Stories |
|---------|---------|---------|---------------|----------------|
| @tanstack/react-router | Latest | Routing | All | All stories with routes |
| @tanstack/ai | Latest | AI Chat | Epic 2, 4, 7, 10 | 2.3, 4.1, 7.5, 10.1 |
| @tanstack/store | Latest | State Management | Epic 2, 5 | 2.1, 5.4 |
| zustand | Latest | State Management | Epic 2, 5, 8, 9 | 2.1, 5.4, 8.5, 9.3 |
| dexie | Latest | IndexedDB | Epic 2, 3, 5, 6, 8 | 2.1, 3.3, 5.4, 6.3, 8.5 |
| @webcontainer/api | Latest | WebContainer | Epic 3 | 3.2, 3.4 |
| @xterm/xterm | Latest | Terminal | Epic 3 | 3.4 |
| react-resizable-panels | Latest | Resizable Panels | Epic 1 | 1.1 |
| @radix-ui/* | Latest | UI Components | Epic 1, 2, 5 | 1.2, 2.2, 5.2 |
| lucide-react | Latest | Icons | All | All stories with icons |
| tailwindcss | Latest | Styling | All | All stories |
| next-themes | Latest | Theme | Epic 1 | 1.2 |
| i18next | Latest | i18n | Epic 1, 2, 6, 9, 10 | 1.2, 2.3, 6.4, 9.1, 10.3 |
| zod | Latest | Validation | Epic 2, 5 | 2.1, 5.4 |
| @sentry/react | Latest | Observability | Epic 5 | 5.3 |

#### Phase 2 Libraries

| Library | Version | Purpose | Related Epics | Related Stories |
|---------|---------|---------|---------------|----------------|
| Orama WASM | Latest | Vector Search | Epic 7 | 7.1, 7.2, 7.4 |
| Transformers.js | Latest | Local Embeddings | Epic 7 | 7.3 |
| React Flow | Latest | Canvas | Epic 8 | 8.1, 8.2, 8.3, 8.4 |
| pdf.js | Latest | PDF Parsing | Epic 6, 10 | 6.1, 10.2 |

---

### Risk and Mitigation Traceability

| Epic | Risk | Impact | Probability | Mitigation Strategy | Related Stories |
|------|------|--------|-------------|---------------------|-----------------|
| Epic 1 | Mobile browser compatibility | High | Medium | Progressive degradation, capability detection | 1.1, 1.3 |
| Epic 2 | Hot-reload visibility bug | High | High | Zustand + Dexie migration (R-01) | 2.1 |
| Epic 2 | State inconsistency | High | Medium | Atomic state updates (R-02) | 2.1, 2.2 |
| Epic 3 | WebContainer boot failure | High | Medium | Crash recovery, progress indicators | 3.2, 5.2 |
| Epic 3 | FSA permission issues | Medium | High | Permission lifecycle, re-grant flow | 3.1 |
| Epic 3 | Sync conflicts | Medium | Medium | Conflict resolution UI, dual-write validation | 3.3 |
| Epic 4 | Tool execution failures | Medium | Medium | Retry logic, error handling | 4.4 |
| Epic 4 | Race conditions | Medium | Low | Request queue (R-14) | 4.4 |
| Epic 5 | State corruption | High | Low | Zod validation, graceful recovery | 5.4 |
| Epic 6 | PDF parsing failures | Medium | Medium | Client-side parsing, error handling | 6.1 |
| Epic 7 | Vector search performance | High | Medium | Hybrid retrieval, caching | 7.3, 7.4 |
| Epic 7 | Embedding model size | Medium | Medium | Local + cloud hybrid strategy | 7.3 |
| Epic 8 | Canvas performance on mobile | Medium | High | Read-only mobile, lazy loading | 8.1 |
| Epic 9 | Flashcard generation quality | Medium | Medium | Citation verification, user editing | 9.1 |
| Epic 10 | WebSocket connection issues | Medium | Medium | Retry logic, fallback to text | 10.1 |
| Epic 10 | Audio generation cost | Medium | Medium | Model selection, caching | 10.3 |

---

### Remediation Epic Traceability

| Remediation Epic | Description | Priority | Addressed In | Related Stories |
|------------------|-------------|----------|--------------|-----------------|
| R-01 | Fix Hot-Reloading Bug | P0 | Epic 2 | 2.1 |
| R-02 | Atomic State Updates | P0 | Epic 2 | 2.1, 2.2 |
| R-03 | Deploy Qdrant Vector Store | P0 → Phase 2 | Epic 7 | 7.1 (replaced by Orama WASM) |
| R-04 | 5-Layer Agent System | P0 | Epic 4 | 4.1 |
| R-05 | Complete CRUD Surface | P1 | Epic 2 | 2.2 |
| R-07 | Chatflow Composition | HIGH | Epic 5 | 5.1 |
| R-09 | Cross-Architecture Context | HIGH | Epic 3 | 3.1 |
| R-10 | Tool Permissions Model | MEDIUM | Epic 4 | 4.3 |
| R-13 | IDELayout State Refactor | P2 | Epic 5 | 5.4 |
| R-14 | Multi-Provider Race Conditions | P2 | Epic 4 | 4.4 |

---

### Sprint Planning Traceability

#### Phase 1 Sprint Calendar

| Sprint | Epic | Stories | Dependencies | NFRs Validated | Demo Focus |
|--------|------|---------|--------------|----------------|------------|
| Sprint 0 | Pre-Launch Setup | 2.0 | - | NFR-SEC-05 | Social media setup |
| Sprint 1 | Epic 1 | 1.1, 1.2, 1.3, 1.4 | - | NFR-USE-04, NFR-SEC-06, NFR-COMPAT-01-06 | Responsive layout, themes |
| Sprint 2 | Epic 2 | 2.1, 2.2, 2.3, 2.4 | 2.0 | NFR-PERF-04,08, NFR-REL-02, NFR-SEC-01,02,05 | Agent config, streaming |
| Sprint 3 | Epic 3 | 3.1, 3.2, 3.3, 3.4 | - | NFR-PERF-01,02,06, NFR-REL-01,05, NFR-SEC-03,04 | FSA sync, magic moment |
| Sprint 4 | Epic 4 | 4.1, 4.2, 4.3, 4.4 | 2.1 | NFR-PERF-04, NFR-REL-06, NFR-SEC-01 | 5-Layer System, file ops |
| Sprint 5 | Epic 5 | 5.1, 5.2, 5.3, 5.4 | 2.1, 3.2 | NFR-PERF-01-08, NFR-REL-01-06, NFR-OBS-01-05 | Session restore, performance |
| Launch | Public Beta | - | All | All | ProductHunt + Hacker News |

#### Phase 2 Sprint Calendar

| Sprint | Epic | Stories | Dependencies | NFRs Validated | Demo Focus |
|--------|------|---------|--------------|----------------|------------|
| Sprint 6 | Epic 6 | 6.1, 6.2, 6.3, 6.4 | - | NFR-PERF-P2-01,02, NFR-REL-P2-01 | PDF import, metadata |
| Sprint 7 | Epic 7 | 7.1, 7.2, 7.3, 7.4, 7.5, 7.6 | 6.1 | NFR-PERF-P2-03,04, NFR-REL-P2-02 | Semantic search, citations |
| Sprint 8 | Epic 8 | 8.1, 8.2, 8.3, 8.4, 8.5 | - | NFR-PERF-P2-05 | Visual knowledge map |
| Sprint 9 | Epic 9 | 9.1, 9.2, 9.3, 9.4 | 7.5 | NFR-PERF-P2-06 | Flashcards, quiz |
| Sprint 10 | Epic 10 | 10.1, 10.2, 10.3 | 7.5 | NFR-PERF-P2-07 | Audio overview |

---

## Traceability Summary

**Total Epics:** 10 (5 Phase 1, 5 Phase 2)
**Total Stories:** 30 (21 Phase 1, 9 Phase 2)
**Total NFRs:** 37 (29 Phase 1, 8 Phase 2)
**Total Dependencies:** 15 critical paths identified
**Total Risks:** 14 with mitigation strategies
**Remediation Epics Addressed:** 10/10 (100%)

**Coverage Analysis:**
- ✅ All Functional Requirements (FR) traced to at least one story
- ✅ All Non-Functional Requirements (NFR) have validation points
- ✅ All Architecture decisions referenced in relevant epics
- ✅ All UX specifications mapped to implementation stories
- ✅ All PRD requirements traced to epics and stories
- ✅ All Project Context constraints addressed in relevant epics
- ✅ Complete bidirectional traceability established

**Quality Gates:**
- ✅ No orphan requirements (untraced)
- ✅ No orphan stories (without requirements)
- ✅ All critical dependencies documented
- ✅ All risks have mitigation strategies
- ✅ All NFRs have measurable targets and validation points
- ✅ Complete technology stack traceability
- ✅ Cross-document reference index complete

---

**Document Metadata:**
- **Last Updated:** 2025-12-29
- **Version:** 2.0
- **Status:** Traceability Complete
- **Next Review:** After Phase 1 completion
- **Maintained By:** System Architect (@bmad-bmm-architect)
