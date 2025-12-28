---
stepsCompleted: [1]
inputDocuments:
  - _bmad-output/project-planning-artifacts/prd.md
  - _bmad-output/project-planning-artifacts/architecture.md
  - _bmad-output/project-planning-artifacts/ux-design-specification.md
  - _bmad-output/project-planning-artifacts/project-context.md
  - _bmad-output/docs/2025-12-28/version-2/remediation-epics.md
workflowType: 'epics-and-stories'
workflowStatus: 'in_progress'
lastStep: 1
date: '2025-12-28'
project_name: 'Project Alpha v2.0 - Knowledge Synthesis Station'
---

# Project Alpha v2.0 - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for **Project Alpha v2.0 - Knowledge Synthesis Station**, decomposing the requirements from the PRD, UX Design Specification, and Architecture into implementable stories.

**Phased Approach:**
- **Phase 1: Core Stabilization** (This document's primary focus)
- **Phase 2: Knowledge Synthesis MVP** (Future PRD)

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
