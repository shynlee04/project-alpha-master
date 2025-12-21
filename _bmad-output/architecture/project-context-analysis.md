# Project Context Analysis

### Requirements Overview

**Functional Requirements:**

The PRD defines **35+ functional requirements** across 7 domains:

| Domain | Count | Critical Items |
|--------|-------|----------------|
| IDE Shell (FR-IDE) | 6 | TanStack Start SPA, Monaco, xterm.js, resizable panels |
| WebContainers (FR-WC) | 6 | Boot, mount, spawn shell, npm commands, streaming |
| File System Access (FR-FS) | 6 | Directory picker, CRUD operations, permission persistence |
| Dual Sync (FR-SYNC) | 4 | Bidirectional sync, exclusion rules, debouncing |
| Git (FR-GIT) | 6 | FSA adapter, status, add, commit, push, pull |
| Persistence (FR-PERSIST) | 6 | Conversations, tool history, layout, FSA handles |
| AI Agent (FR-AGENT) | 7 | TanStack AI, client tools, file/terminal/git tools |

**Non-Functional Requirements:**

| Category | Key Targets |
|----------|-------------|
| Performance | WebContainer boot <5s, file mount <3s, dev server <30s |
| Reliability | 99%+ sync reliability, zero data corruption |
| Usability | Time to first project <2min, keyboard accessible |
| Security | Zero server transmission, BYOK API keys, FSA scoping |
| Compatibility | Chrome 86+, Edge 86+, Safari 15.2+ |

**Scale & Complexity:**

- Primary domain: **Full-stack client-side IDE**
- Complexity level: **High** (novel architecture, browser API integration)
- Estimated architectural components: **7 major layers**

### Technical Constraints & Dependencies

| Constraint | Description | Impact |
|------------|-------------|--------|
| **Browser-Only** | No backend services for core functionality | All state client-side |
| **WebContainers Required** | SharedArrayBuffer/WASM support | Limits browser compatibility |
| **FSA Required (Tier 2)** | Local file persistence needs FSA | Non-FSA browsers use IndexedDB only |
| **Single Session** | One active workspace per tab | No multi-window sync |

### Cross-Cutting Concerns Identified

1. **State Synchronization**: WebContainers FS ↔ Local Disk ↔ UI State
2. **Permission Lifecycle**: FSA handles require re-permission on reload
3. **Error Recovery**: Graceful handling of permission denial, sync failures, Git errors
4. **Session Restoration**: Full state restoration from IndexedDB + FSA handles
5. **Performance Boundaries**: Excluding `node_modules` from disk sync
6. **Localization (EN/VI)**: Client-only i18n with locale-aware routing, dynamic bundle loading, and `<html lang>` set per locale; avoid SSR/hydration coupling by lazy-loading translation resources and defaulting to `en` fallback.

---
