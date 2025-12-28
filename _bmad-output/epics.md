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

{{requirements_coverage_map}}

---

## Epic List

{{epics_list}}

<!-- Epics and Stories will be generated in Step 2 -->
