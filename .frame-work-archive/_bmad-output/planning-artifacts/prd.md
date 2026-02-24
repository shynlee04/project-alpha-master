---
version: 2.2.0
generated: 2026-01-26T00:00:00+07:00
updated: 2026-01-28T17:00:00+07:00
agent: architect-ext
phase: planning
status: ACTIVE
research_validated: 2026-01-28
stepsCompleted: [phase-1-research, phase-2-analysis, phase-3-synthesis, phase-1.2-fundamental-truth-updates, phase-1.3-prd-alignment, phase-1.4-architecture-validation]
---

# Product Requirements Document: Via-Gent (Project Alpha v2.0)

> **⚠️ IMPORTANT:** This document references authoritative architecture decisions defined in ADRs. For implementation details, always consult these ADRs first:
> - **ADR-039**: Unified Architecture Fundamentals (v2.0.0 Alignment) - **Primary Reference**
> - **ADR-034**: Project-Centric Architecture with Feature Plugins (Partial - See ADR-039)
> - **ADR-035**: Architecture Standardization v2 (Chrome 122+/129+ requirements)

## Document Control
- **Version:** 2.2.0 (Research-Validated 2026-01-28)
- **Generated:** 2026-01-26
- **Updated:** 2026-01-28
- **Status:** ACTIVE
- **Research Validated:** 2026-01-28
- **Generating Agent:** Architect-Ext (BMAD Framework)
- **Confidence Level:** HIGH (research-validated architecture decisions)
- **Reference Document:** new-fundamental-truths.md v2.2.0 (2026-01-28)
- **Related:** ADR-039 (APPROVED), ADR-040–047 (Proposed)

## Executive Summary

Via-Gent is a browser-based AI-powered development workspace that enables solo developers, learners, and distributed teams to eliminate setup friction and ship applications faster. The platform provides a zero-server, privacy-first IDE with intelligent agents that can execute—not just suggest—code changes, running 100% client-side via WebContainers with local filesystem integration.

**Platform Positioning:**
Via-Gent is a **Project-Centric Development Environment with Platform-Aware Plugin System**. The application provides a unified project experience where features are delivered via plugins based on platform capabilities and user preferences. Desktop users get full IDE capabilities, while mobile/tablet users access focused note-taking and chat features.

> **📋 Reference:** [new-fundamental-truths.md Section 1] Project-Centric Architecture, Section 3.2] Two Always-Loaded Plugins

**Current State (2026-01-26 - Post-Remediation Analysis):**
- ✅ **Core Infrastructure:** WebContainer integration, file system sync, Monaco editor, terminal
- ✅ **Project-Centric Architecture:** Single `/$projectId` route with plugin-based feature loading
- ⚠️ **Plugin System:** Basic structure defined, needs full implementation (EPIC-CC-AR02AR03)
- ⚠️ **BYOK Integration:** TanStack AI SDK integration incomplete (providers use direct calls)
- ⚠️ **Chat Cascade:** Basic chat exists, thread management and agent orchestration incomplete
- ⚠️ **P0 Blockers:** 3 P0 bugs partially resolved, monitoring needed

**Alignment Status with v2.0.0 Fundamentals:**
| Category | Previous (v1.1.0) | Current (v2.0.0) | Change |
|----------|---------------------|---------------------|--------|
| Architecture | Workspace-Centric | Project-Centric | Fundamental shift ✅ |
| Route Structure | 9 routes per workspace | Single `/$projectId` | Simplified ✅ |
| Plugin System | Not defined | Fully specified | Complete ✅ |
| BYOK | Vault exists, no SDK | TanStack AI SDK | Complete ✅ |
| Agent System | Basic factory | Orchestrator + permissions | Enhanced ✅ |
| Chat Cascade | Basic panel | Thread management | Complete ✅ |
| Phase Structure | Not structured | 3-phase approach | Organized ✅ |

**Target State (80-90% Complete - 8-12 weeks):**
- Complete plugin system implementation (Phase 1A)
- Full TanStack AI SDK integration (Phase 1B)
- Implement chat cascade and agent orchestration (Phase 2)
- Advanced multi-agent patterns and RAG (Phase 3)
- Achieve 80%+ error boundary coverage
- Eliminate all god stores (Target: 0)

**Market Position:**
Via-Gent occupies a unique position as a **project-centric browser IDE with platform-aware plugins**. Unlike Cursor (desktop-only), Windsurf (open-source alternative), or v0.dev (UI generation only), Via-Gent combines browser-based execution with plugin-based architecture allowing progressive feature rollout. The platform is distinguished by its unified project model where the same project ID works across all plugins, with platform-aware defaults optimizing experience per device type.

---

## Architecture Shifts (Research-Validated 2026-01-28)

> **📋 Reference:** [architecture-validation-2026-01-28.md] Research validation report

The following architecture shifts have been validated through comprehensive research and formalized in ADR-040 through ADR-047:

### Shift 1: Storage Strategy — SQLite WASM + OPFS

| Aspect | Previous Decision | Validated Decision | ADR |
|--------|-------------------|-------------------|-----|
| **Mobile/Tablet Storage** | IndexedDB via Dexie.js only | SQLite WASM + OPFS (primary), Dexie.js (fallback) | ADR-041 |
| **Rationale** | IndexedDB alone is insufficient for production use | SQLite provides ACID transactions, FTS5 for RAG, near-native performance via Web Workers |
| **Impact** | Major architectural change | Requires SQLite WASM build integration, Web Worker for sync file access, OPFS feature detection |

**Browser Support Matrix:**
| Browser | OPFS Support | SQLite WASM | Status |
|---------|--------------|-------------|--------|
| Chrome 102+ | ✅ | ✅ | Recommended |
| Firefox 111+ | ✅ | ✅ | Full support |
| Safari 15.2+ | ✅ | ✅ | Requires PWA for persistence |
| Older browsers | ❌ | ❌ | Dexie.js fallback |

### Shift 2: AI SDK Confirmation — TanStack AI

| Aspect | Previous State | Validated Decision | ADR |
|--------|---------------|-------------------|-----|
| **SDK Choice** | "TanStack AI SDK First" (with uncertainty) | TanStack AI **CONFIRMED** | ADR-040 |
| **Rationale** | Vercel SDK v6 lacks client-side tool system | TanStack AI's `.client()` modifier enables true browser-side tool execution |
| **Key Advantage** | N/A | `needsApproval` flag for tool approval workflows |

**Comparison Summary:**
| Criterion | TanStack AI | Vercel SDK v6 | Winner |
|-----------|-------------|---------------|--------|
| Client-side tools | ✅ First-class `.client()` | ⚠️ Callback-based | TanStack |
| Tool approval | ✅ `needsApproval` flag | ⚠️ Manual output flow | TanStack |
| TanStack integration | ✅ Native | ⚠️ Compatible | TanStack |

### Shift 3: State Management — 4-Layer Architecture

| Aspect | Previous Decision | Validated Decision | ADR |
|--------|-------------------|-------------------|-----|
| **State Layers** | 3 layers (Client, Persisted, File System) | 4 layers (UI, Session, Persisted, File) | ADR-042 |
| **New Layer** | N/A | Session State (Zustand + Dexie Hydration) |
| **Boundary Rules** | Generic | Explicit conflict prevention rules |

**4-Layer Architecture:**
```
Layer 1: UI State (Zustand NO persist) → Transient UI state
Layer 2: Session State (Zustand + Dexie hydration) → Active context
Layer 3: Persisted State (Dexie.js useLiveQuery) → Source of truth
Layer 4: File State (FSA/SQLite+OPFS) → Source code, notes
```

### Shift 4: LLM Provider Priority — Gemini P1

| Aspect | Previous Decision | Validated Decision | ADR |
|--------|-------------------|-------------------|-----|
| **Provider Priority** | All first-tier equal | Gemini P1 (FREE embeddings, 2M context) | ADR-044 |
| **Embedding Strategy** | Not defined | Google Text Embedding 004 (FREE) as primary | ADR-044 |
| **Context Caching** | Not defined | Anthropic 90%, Gemini 75% cost reduction | ADR-046 |

**Updated Priority Order:**
| Priority | Provider | Key Advantage |
|----------|----------|---------------|
| **P1** | Google Gemini | FREE embeddings, 2M context, 75% caching savings |
| **P2** | Anthropic Claude | 90% caching savings, extended thinking, MCP native |
| **P3** | OpenAI | Ecosystem maturity, stable APIs |
| **P4** | OpenRouter | 400+ models, fallback routing |
| **P5** | Ollama | Privacy mode, offline capable |

### Shift 5: Nested Project Policy — Block Creation

| Aspect | Previous Decision | Validated Decision | ADR |
|--------|-------------------|-------------------|-----|
| **Nested Projects** | Not addressed | Block with detection + migration prompts | ADR-034 (amended) |
| **Rationale** | N/A | VSCode/Obsidian both advise against due to data corruption risks |
| **UX Pattern** | N/A | Detection → Dialog → Migration/Promotion option |

### Shift 6: Plugin Contract — Event Bus Pattern

| Aspect | Previous Decision | Validated Decision | ADR |
|--------|-------------------|-------------------|-----|
| **Plugin Communication** | Not defined | Event Bus pattern for cross-plugin notifications | ADR-043 |
| **State Isolation** | Not defined | Plugin-scoped stores + global read-only subscriptions | ADR-043 |
| **Lifecycle Hooks** | Not defined | `onLoad`, `onUnload`, `onActivate`, `onDeactivate` | ADR-043 |

**Expanded FeaturePlugin Interface:**
```typescript
interface FeaturePlugin {
  // ...existing properties
  capabilities: PluginCapability[];           // NEW
  onLoad(context: PluginContext): Promise<void>;   // NEW
  onUnload(): Promise<void>;                  // NEW
  onActivate?(): Promise<void>;               // NEW
  onDeactivate?(): Promise<void>;             // NEW
}
```

---

## Problem Statement

### Primary Problem: Development Setup Tax with Architecture Fragmentation

Creating a new project with best practices requires 2+ hours of boilerplate configuration across package managers, build tools, linting, testing, and deployment. Existing solutions force unacceptable tradeoffs:

**Cloud IDEs** (CodeSandbox, Replit):
- ❌ Require subscriptions ($10-20/month)
- ❌ Store code on their servers (privacy concerns)
- ❌ Vendor lock-in (cannot export easily)

**AI Assistants** (Copilot, Cursor):
- ❌ Generate code but can't execute, test, or deploy
- ❌ Require desktop installation
- ❌ No mobile support
- ❌ Workspace-centric architecture causing feature duplication and fragmentation

**Traditional IDEs** (VS Code):
- ❌ Require installation and local setup per machine
- ❌ Complex environment configuration
- ❌ No AI agent integration with tool execution
- ❌ Workspace separation creates cognitive overhead

### Via-Gent Solution (v2.0.0 - Project-Centric with Plugins)

**Zero-Server, Privacy-First Architecture**
- 100% client-side execution (code never leaves browser)
- Local filesystem sync via File System Access API (desktop) or IndexedDB (mobile, Dexie only)
- No server costs, no subscription fees
- Works offline after initial load

> **⚠️ Storage Correction:** LocalStorage is DEPRECATED. Use Dexie (IndexedDB) for all persistent storage per [ADR-035 Part 1].

**Project-Centric Architecture (Fundamental Shift):**

The application has shifted from **workspace-centric** to **project-centric** model:

| Aspect | BEFORE (Workspace-Centric) | AFTER (Project-Centric) |
|--------|---------------------------|------------------------|
| **Route Structure** | `/ide/$projectId`, `/notes/$projectId` | Single `/$projectId` |
| **State Management** | Duplicated per workspace | Single source of truth per project |
| **Feature Rendering** | Workspace determines features | Platform determines available plugins |
| **User Experience** | User selects "workspace mode" | Platform shows available tools |
| **Project ID** | Workspace-scoped prefix/suffix | Consistent across all plugins |

> **📋 Reference:** [new-fundamental-truths.md Section 1.1] Project-Centric Mental Model, [ADR-039 D1] Single Project Route

**Feature Plugin Architecture:**
- Self-contained feature modules that render into layout slots
- Platform-aware loading (plugins load based on device capabilities)
- Two always-loaded plugins (Project Management, Chat Cascade)
- Up to 5 plugins per project (2 always-loaded + 3 optional)
- Plugin lifecycle managed via registry

> **📋 Reference:** [new-fundamental-truths.md Section 3.2] Plugin Architecture, [ADR-039 D3] FeaturePlugin Interface

**Platform-Aware Entry:**

Via-Gent uses automatic platform detection to provide optimal experience per device:

## Entry Matrix: [New/Returned User] x [Desktop/Mobile/Tablet]

| User Type | Desktop (FSA) | Desktop (IndexedDB) | Tablet | Mobile |
|-----------|---------------|---------------------|--------|--------|
| **New** | Create project → Full plugins | Create project → FileTree/Notes/Chat | Create project → Notes/Chat | Auto-create browser-mode project |
| **Returned** | Select from list → Full plugins | Select from list → FileTree/Notes/Chat | Select from list → Notes/Chat | Auto-load → Notes |
| **Default Plugins** | FileTree, Monaco, Chat | FileTree, Notes, Chat | FileTree, Notes, Chat | Notes |
| **Layout Mode** | 3-column max | 2-column max | 2-column max | 1-column |
| **Storage** | FSA (File System Access) | IndexedDB (Dexie) | IndexedDB (Dexie) | IndexedDB (Dexie) |

**Key Rules:**
- Platform detection via `getPlatformContract()` on app start
- Default plugins loaded automatically based on platform
- User can toggle optional plugins (up to 3 additional)
- Project ID format: `proj_{uuid}` (consistent across all plugins)
- Storage type determined at project creation, immutable thereafter
- Single route `/$projectId` loads plugins based on platform

> **📋 Reference:** [new-fundamental-truths.md Section 1.4] Platform-Aware Default Plugins, [ADR-039 D2] Device Architecture Separation

**AI Agents That Execute, Not Just Suggest:**
- Write and modify files via plugin system
- Run terminal commands (`npm install`, `npm run dev`)
- Commit changes via Git
- Show results in live preview
- Orchestrate via agent pattern (Phase 2)

**Bring Your Own AI Key (BYOK) - Project-Scoped:**
- Connect your own Gemini, OpenRouter, OpenAI, or Anthropic API keys
- Control your costs, choose your model
- AES-256-GCM encrypted credential vault (project-scoped)
- All LLM calls routed through TanStack AI SDK
- No direct provider package calls

> **📋 Reference:** [new-fundamental-truths.md Section 4] BYOK Vault, [ADR-039 D5] TanStack AI SDK Integration

---

## Target Users

### Primary Customers

1. **Solo Developers (Freelancers)**
   - Need quick project setup, AI assistance, easy client demos
   - No infrastructure overhead
   - Work from any computer (desktop for IDE, mobile for notes)

2. **Distributed Development Teams**
   - Cross-functional teams (PM, Designer, Developer, QA)
   - Unified workspace with customizable workflows
   - Real-time collaboration features
   - Benefit from project-centric architecture (single project ID across team)

3. **Educational Platforms**
   - Coding bootcamps, instructors, students
   - Instant-ready development environments
   - No setup friction for workshops
   - Mobile note-taking and chat features for on-the-go learning

### User Personas

**Alex** (25-35, Solo Full-Stack Developer)
- **Role:** Freelance web developer
- **Context:** Takes on 3-4 projects monthly, works from various locations
- **Pain Points:** "Project setup takes 2+ hours"; switching between IDE and Notes is confusing; managing local dev environments is fragmented
- **Goals:** Ship faster, reduce boilerplate, work from any computer; use AI agents to execute tasks
- **v2.0.0 Benefits:** Single project view with all features in one interface, platform-aware defaults eliminate configuration overhead

**Jordan** (18-24, Student/Bootcamp Graduate)
- **Role:** Learning full-stack development
- **Context:** Using shared/borrowed computers, limited CLI experience
- **Pain Points:** "I don't know how to set up a dev environment"; npm errors derail learning
- **Goals:** Focus on coding concepts, not tooling; understand how code works
- **v2.0.0 Benefits:** Mobile-optimized notes and chat access; simplified project creation; AI agents guide learning process

**Taylor** (30-45, Workshop Instructor/Content Creator)
- **Role:** Teaching coding to groups
- **Context:** Half of workshop time lost to installation issues
- **Pain Points:** "Students can't follow along because their setup failed"
- **Goals:** Every student codes in browser instantly; demonstrate concepts without setup friction
- **v2.0.0 Benefits:** Instant browser-based access; project-centric model ensures consistent experience; platform-aware defaults adapt to student devices

---

## 3-Phase Development Approach

Via-Gent v2.0.0 development follows a phased approach to ensure systematic implementation and incremental value delivery:

### Phase 1A: Non-AI Core & Foundational Setup

**Objective:** Establish project-centric architecture with plugin system, platform-aware defaults, and IDE foundation features (Terminal, Monaco, FileTree, Preview).

**Duration:** 4-6 weeks
**Entry Criteria:**
- ADR-039 approved (Unified Architecture Fundamentals)
- PlatformContract interface fully implemented
- Plugin registry and FeaturePlugin interface defined
- StorageGateway abstraction complete (FSA/IDB adapters)
- Single `/$projectId` route operational

**Features:**
1. Project creation, selection, and management
2. FileTree plugin (always-loaded)
3. Monaco plugin (optional, desktop FSA only)
4. Terminal plugin (optional, desktop FSA only)
5. Preview plugin (optional, desktop FSA only)
6. Platform-aware default plugin loading
7. Plugin registry with max 5 plugins (2 always-loaded + 3 optional)

**Success Metrics:**
- Time from "New Project" to running app < 60 seconds
- Platform detection accuracy 100%
- Plugin load time < 500ms
- All Phase 1A stories complete

### Phase 1A Plugin Requirements (Updated from EPIC-0 Learnings)

> **Source:** EPIC-0 implementation learnings | **Updated:** 2026-01-26

#### FileTree Plugin Requirements

1. **Hierarchical Display**: Must show folders with nested children, NOT flat file list
2. **Event Subscription**: Must subscribe to FILE_CREATED, FILE_UPDATED, FILE_DELETED events
3. **Location**: Renders in SIDEBAR TAB, not main panel area
4. **Always Loaded**: Part of immediate loading strategy (P0)

#### Monaco Plugin Requirements

1. **Auto-Save**: Debounced save (500ms) on content change
2. **Event Subscription**: Subscribe to FILE_UPDATED for external changes
3. **Event Emission**: Emit FILE_SAVED after successful write
4. **Dirty State**: Track unsaved changes with visual indicator
5. **Location**: Main panel area (lazy loaded)

#### EventBus Requirements

1. **File Events**: FILE_CREATED, FILE_UPDATED, FILE_DELETED, FILE_MOVED, FILE_RENAMED
2. **Singleton**: Single EventBus instance per project
3. **Type Safety**: Typed event payloads
4. **CRUD Integration**: All storage gateway operations emit events

> **📋 Reference:** EPIC-0 implementation, [new-fundamental-truths.md Section 3] Plugin Architecture

### Phase 1B: BYOK & Notes Features

**Objective:** Implement TanStack AI SDK integration for all LLM calls and complete Notes plugin with AI features.

**Duration:** 4-6 weeks
**Entry Criteria:**
- Phase 1A complete
- TanStack AI SDK integrated and tested
- Provider adapters for all first-tier providers
- Project-scoped BYOK vault operational
- Notes plugin with BlockNote editor and AI commands

**Features:**
1. TanStack AI SDK integration (ALL LLM calls)
2. Provider adapters (Gemini, OpenRouter, OpenAI, Anthropic - first-tier; Grok, Ollama - second-tier)
3. Fallback chain implementation (provider → model fallback)
4. Project-scoped credential vault (AES-256-GCM)
5. Secure key distribution (reactive, only to required endpoints)
6. Notes plugin with BlockNote editor
7. AI commands (summarize, expand, organize, cite)
8. Prompt chains and text selection transformations
9. Notes ↔ Markdown sync (bidirectional)
10. Voice recording with transcription

**Success Metrics:**
- Users can configure and use custom API keys
- All LLM calls use TanStack AI SDK
- Notes AI features work independently of chat cascade
- Markdown sync bidirectional without conflicts

### Phase 2: Chat Cascade, Threads, Agents

**Objective:** Implement chat cascade plugin with thread management, agent orchestrator pattern, and domain-specific agents.

**Duration:** 6-8 weeks
**Entry Criteria:**
- Phase 1B complete
- TanStack AI SDK fully integrated
- Plugin system operational
- Agent tool registry defined

**Features:**
1. Chat Cascade plugin (always-loaded)
2. Thread architecture (project-scoped: Main, Sub-threads, Compaction)
3. Context window management (150K token limit, 90% compaction threshold)
4. Multi-format block rendering (code, rich text, HTML artifacts, streaming tokens)
5. Bi-directional file references (file-to-chat with `@`, chat-to-file with insert/copy)
6. Agent orchestrator pattern (read-only tools, mode switching, task delegation)
7. Domain-specific agents (dev-ext, architect-ext, analyst-ext, ux-designer-ext, tech-writer-ext)
8. Tool permission matrix (write, edit, bash, task per agent type)
9. Tool approval workflows (ask/allow/deny, critical tools require approval)
10. Agentic cycle pattern (sequential execution, conditional branching, error handling, context management)

**Success Metrics:**
- Agents correctly implement features without user intervention > 90% of time
- Context compaction triggers at 90% threshold
- Thread management handles 10,000+ turns without degradation
- Multi-format rendering performs smoothly (no layout shifts)

### Phase 3: Advanced Cross-Plugin, Multi-Agentic Patterns, Tooling, RAG

**Objective:** Implement advanced patterns for multi-agent coordination, cross-plugin communication, RAG integration, and sophisticated tool usage.

**Duration:** 8-12 weeks
**Entry Criteria:**
- Phase 2 complete
- Chat cascade stable with thread management
- Agent orchestrator operational
- All domain-specific agents tested

**Features:**
1. Cross-plugin communication (event bus, shared state, file reference passing)
2. Multi-agent coordination (handoff patterns, context transfer, consensus mechanisms)
3. Advanced tool patterns (granular permissions, file-level permissions, approval-based operations)
4. RAG integration (per-project indexing, embeddings, hybrid retriever with reranking)
5. Advanced agentic patterns (multi-agent consensus, conflict resolution, priority-based execution)
6. Generative AI features distinction (individual AI in Notes vs agent-driven features in Chat)
7. RAG advanced features (metadata filtering, hybrid retriever optimization, per-project RAG index management)

**Success Metrics:**
- Multi-agent scenarios complete without conflicts
- RAG retrieval accuracy > 80%
- Cross-plugin operations execute without race conditions
- Advanced patterns documented and tested

---

## User Stories & Journeys (Phase-by-Phase Structure)

### Journey 1: Desktop User - Project Creation and IDE Features (Phase 1A)

**Story:** As a desktop developer, I want to create a project and access IDE features (Terminal, Monaco, FileTree, Preview) via a single unified interface, so I can develop applications with AI assistance and local filesystem integration.

**Phase:** 1A - Non-AI Core
**Current State:**
- ✅ Project bootstrap with TanStack Start SPA
- ✅ File system picker for local folder selection (FSA)
- ✅ WebContainer boots with Node.js runtime
- ⚠️ Plugin system structure defined, needs implementation (EPIC-CC-AR02AR03)
- ⚠️ Monaco plugin is POC stub (textarea, not real editor)
- ⚠️ 40+ i18n keys missing

**Happy Path:**
1. User opens Via-Gent → lands on Hub page
2. System detects desktop platform via `getPlatformContract()`
3. Clicks "New Project" → sees template gallery
4. Selects "Portfolio Website" template
5. Chooses local folder via File System Access API (FSA)
6. FSA handle persisted to Dexie for session restore
7. Route navigates to `/$projectId` (not `/ide/$projectId`)
8. Plugins load based on platform defaults: FileTree, Monaco, Chat
9. WebContainer mounts local files automatically
10. Dev server starts (`npm run dev` in terminal)
11. Live preview shows running application in Preview plugin panel

**Platform Requirements:**
- Chrome 122+ for persistent FSA permissions
- Chrome 129+ for structured clone optimization (FSA handle serialization)
- FSA handle persistence via Dexie

**Evidence:**
- Hub page: `src/routes/index.tsx` ✅
- Platform contract: `src/lib/platform/get-platform-contract.ts` ✅
- Project creation: `src/infrastructure/persistence/stores/project/` ✅
- WebContainer boot: `src/lib/webcontainer/manager.ts` ✅
- Terminal integration: `src/presentation/components/ide/XTerminal.tsx` ✅
- Preview panel: `src/presentation/components/ide/PreviewPanel/` ✅
- FileTree plugin: `src/plugins/filetree/` ⚠️ Implementation needed
- Monaco plugin: `src/plugins/monaco/` ⚠️ POC stub, real editor needed
- Plugin registry: `src/lib/plugin-registry.ts` ⚠️ Implementation needed

**Broken Steps:**
- ❌ Route loading race conditions
- ❌ Monaco is POC stub (no syntax highlighting)
- ❌ 40+ i18n keys missing (UI shows raw keys)
- ❌ Drag-drop layout causes broken UI

**Success Metric:** Time from "New Project" to running app < 60 seconds

---

### Journey 2: Desktop User - Notes Plugin with AI Features (Phase 1B)

**Story:** As a desktop user, I want to create and manage notes with AI assistance (summarize, expand, organize, cite) that sync with local markdown files, so I can document my projects and learning materials.

**Phase:** 1B - BYOK & Notes
**Current State:**
- ✅ Notes workspace (17 components)
- ✅ BlockNote editor (block-based rich text)
- ✅ Voice recording with transcription
- ❌ BYOK integration incomplete (no TanStack AI SDK)
- ❌ AI enhancement features (summarize, expand, organize, cite) use direct provider calls

**Happy Path:**
1. User opens Via-Gent on desktop
2. Selects or creates project
3. Route navigates to `/$projectId` (not `/notes/$projectId`)
4. Notes plugin loads (default plugin on desktop with FSA)
5. User creates new note with BlockNote editor
6. User selects text and clicks "AI Commands" → summarize
7. System calls TanStack AI SDK with configured provider (Gemini, OpenAI, etc.)
8. AI response with summary appears as new block in note
9. Note auto-syncs to local filesystem (markdown file in project folder)
10. Changes reflected in FileTree plugin immediately

> **📋 Reference:** [new-fundamental-truths.md Section 7] Generative AI Features

**State Boundaries:**
- UI state: Zustand (session-only)
- Persistent state: Dexie (notes, metadata)
- Composite key: `[projectId]` (no workspaceId needed)
- File system: FSA for desktop (markdown files), Dexie handles persisted

**Evidence:**
- Notes plugin: `src/plugins/notes/` ⚠️ Implementation needed
- BlockNote editor: Existing ✅
- TanStack AI SDK: `src/lib/ai/tanstack-adapter.ts` ⚠️ Implementation needed
- Provider adapters: `src/lib/ai/providers/` ⚠️ Full SDK integration needed

**Broken Steps:**
- ❌ BYOK incomplete - vault exists but unused by providers
- ❌ AI features use direct provider calls instead of TanStack AI SDK
- ❌ Markdown sync has race conditions

**Success Metric:** Lecture → organized notes < 2 minutes

---

### Journey 3: Mobile User - Notes & Chat (Phase 1A/B)

**Story:** As a mobile user with tablets, I want to access Notes and Chat plugins on my device, so I can learn and take notes anywhere without desktop capabilities.

**Phase:** 1A (Platform-aware defaults) + 1B (BYOK)
**Current State:**
- ✅ Mobile tab bar navigation (70% complete)
- ✅ Responsive breakpoints (sm: 640px, md: 768px, lg: 1024px)
- ✅ Touch targets >= 44px
- ✅ Notes plugin mobile-optimized
- ✅ Chat plugin basic functionality
- ❌ Platform-aware defaults not implemented
- ❌ BYOK incomplete

**Happy Path (Mobile):**
1. User opens Via-Gent on iPad (Safari) or Android tablet (Chrome)
2. Platform detection via `getPlatformContract()` → mobile
3. Lands on mobile-optimized Hub page with browser-mode project auto-created
4. Route navigates to `/$projectId` (IDE plugins blocked for mobile)
5. Plugins load based on platform defaults: Notes, Chat (FileTree visible in sidebar)
6. Bottom navigation bar shows: Notes | Chat (IDE hidden)
7. Taps "Notes" → mobile-optimized BlockNote editor opens
8. Taps microphone icon → records lecture audio, AI transcribes
9. Taps "Organize" → AI creates hierarchical structure
10. Taps "Chat" → mobile-optimized chat panel opens
11. User types message, AI responds via TanStack AI SDK

**IDE Access Blocked (Mobile):**
- Platform guard on `/$projectId` route checks platform capabilities
- Toast notification: "IDE features require desktop browser with File System Access API support"
- Monaco, Terminal, Preview plugins not loaded on mobile

> **📋 Reference:** [new-fundamental-truths.md Section 1.4] Platform-Aware Default Plugins, [ADR-039 D2] IDE Access Policy

**Storage:**
- Dexie (IndexedDB) for all mobile data
- No FSA on mobile devices

**Evidence:**
- Mobile layout: `src/presentation/components/layout/MobileLayout.tsx` ✅
- Platform contract: `src/lib/platform/get-platform-contract.ts` ✅
- Notes plugin: `src/plugins/notes/` ⚠️ Mobile optimization needed
- Chat plugin: `src/plugins/chat/` ⚠️ Implementation needed

**Broken Steps:**
- ⚠️ Platform-aware defaults not implemented (loads all plugins, doesn't filter)
- ⚠️ Mobile command palette incomplete

**Success Metric:** All Notes/Chat features functional on mobile (iOS Safari, Android Chrome)

---

### Journey 4: Agent-Assisted Coding (Phase 2)

**Story:** As a developer, I want AI agents to implement features for me via chat cascade, so I can focus on business logic instead of boilerplate.

**Phase:** 2 - Chat Cascade, Threads, Agents
**Current State:**
- ✅ Agent factory with provider adapters (Anthropic, OpenRouter, OpenAI, Gemini)
- ✅ 11 tools (file ops, terminal, RAG, multimodal)
- ⚠️ Orchestrator pattern not implemented
- ⚠️ Domain-specific agents not defined
- ⚠️ Tool permission matrix not implemented
- ⚠️ Thread architecture not implemented

**Happy Path:**
1. User opens ChatPanel (always-loaded plugin)
2. System detects platform capabilities via `getPlatformContract()`
3. User types: "Add a contact form with validation"
4. Orchestrator receives user input (read-only tools only: read-files, grep, glob, list-files)
5. Orchestrator analyzes context and delegates to domain-specific agent (dev-ext)
6. dev-ext agent reads current file context via file tools
7. dev-ext agent proposes changes (diff view)
8. User approves changes (tool approval workflow: ask/allow/deny)
9. dev-ext agent writes files via file write tool
10. dev-ext agent runs `npm run lint` via bash tool
11. Editor and file tree auto-update with changes
12. Thread history shows full conversation with agent mode switches

> **📋 Reference:** [new-fundamental-truths.md Section 5] Agent and Tool Architecture, [ADR-039 D6] Orchestrator Pattern

**Tool Permissions:**
| Agent Type | write | edit | bash | task | Role |
|------------|-------|------|------|------|------|
| real-world-validator | true | false | browser (limited) | true | Testing only |
| dev-ext | true | true | limited | true | Implementation |
| architect-ext | false | design only | false | true | Architecture docs |
| analyst-ext | false | false | false | true | Research only |
| ux-designer-ext | false | false | false | true | Design only |

**Evidence:**
- Chat plugin: `src/plugins/chat/` ⚠️ Implementation needed
- Orchestrator: `src/lib/agent/orchestrator/` ⚠️ Implementation needed
- Domain agents: `src/lib/agent/agents/` ⚠️ Implementation needed
- Tool registry: `src/lib/agent/tools/` ✅

**Broken Steps:**
- ❌ Orchestrator pattern missing (current code uses direct agent calls)
- ❌ No domain-specific agents defined (all agents treated identically)
- ❌ Tool permission matrix not implemented (all agents have full permissions)
- ❌ Thread management missing (no thread hierarchy, no context compaction)

**Success Metric:** Agent correctly implements feature without user intervention > 90% of time

---

### Journey 5: Chat Cascade and Thread Management (Phase 2)

**Story:** As a user, I want to have persistent conversation threads with context management and automatic compaction, so I can maintain long-running conversations with agents without hitting token limits.

**Phase:** 2 - Chat Cascade, Threads, Agents
**Current State:**
- ✅ ChatPanel component exists (650 lines)
- ⚠️ Thread architecture not implemented (flat conversation)
- ⚠️ Context window management not implemented
- ⚠️ Multi-format block rendering incomplete
- ⚠️ Bi-directional file references missing

**Happy Path:**
1. User opens ChatPanel (always-loaded plugin)
2. Main Thread shows conversation history (project-scoped)
3. User requests complex task that requires agent delegation
4. Orchestrator creates Sub-thread for delegated agent (dev-ext) with isolated context
5. Agent completes task with multiple tool calls
6. Sub-thread context preserved (agent sees full conversation up to delegation point)
7. Agent returns to Main Thread with handoff document
8. Orchestrator summarizes result for user
9. Context window reaches 90% threshold (135K tokens)
10. System triggers auto-compaction:
    - Runs sub-agent to condense conversation turns
    - Filters irrelevant/contextual information
    - Generates new Compaction Thread with recapped context
    - Preserves file path references with `@` mentions
11. New Compaction Thread becomes active conversation
12. Main Thread archived for reference

> **📋 Reference:** [new-fundamental-truths.md Section 6] Chat Cascade and Thread Management

**Thread Architecture:**
```
Project
    └─→ Threads (indexed by project ID)
        ├─→ Main Thread (user conversation)
        ├─→ Sub-threads (agent delegations)
        └─→ Compaction Threads (auto-generated at 90% context limit)
```

**Context Management:**
- Default limit: 150K tokens
- Auto-compaction at 90% threshold (135K tokens)
- Thread hierarchy with timestamps and metadata
- All threads scoped to project ID (no cross-project RAG)

**Evidence:**
- Chat plugin: `src/plugins/chat/` ⚠️ Implementation needed
- Thread store: `src/infrastructure/persistence/stores/thread/` ⚠️ Implementation needed
- Orchestrator: `src/lib/agent/orchestrator/` ⚠️ Implementation needed

**Broken Steps:**
- ❌ Thread architecture missing (flat conversation, no hierarchy)
- ❌ Context window not enforced (unlimited tokens)
- ❌ Auto-compaction not implemented
- ❌ Multi-format block rendering incomplete (no distinct styling for different content types)

**Success Metric:** Thread management handles 10,000+ turns without performance degradation

---

### Journey 6: Cross-Plugin Communication (Phase 3)

**Story:** As a user, I want plugins to communicate seamlessly (e.g., Notes referencing files from FileTree, Chat referencing Notes content), so I can work efficiently across features.

**Phase:** 3 - Advanced Patterns
**Current State:**
- ✅ Plugin system structure defined
- ❌ Cross-plugin communication not implemented
- ❌ Event bus not established
- ❌ Shared state patterns not defined

**Happy Path:**
1. User in Notes plugin selects text block
2. User clicks "Reference File" → opens FileTree picker
3. FileTree component shows project files
4. User selects `src/components/Button.tsx`
5. Notes plugin inserts `@src/components/Button.tsx` reference in note
6. User clicks reference → FileTree highlights and scrolls to file
7. FileTree loads file content
8. Notes plugin creates shared state via event bus
9. FileTree updates UI to show active reference

> **📋 Reference:** [new-fundamental-truths.md Section 10] Advanced Patterns

**Cross-Plugin Communication Patterns:**
- Event bus for cross-plugin notifications
- Shared state for coordinated operations
- File reference passing between plugins
- Plugin discovery and capability queries

**Evidence:**
- Event bus: `src/lib/events/event-bus.ts` ⚠️ Implementation needed
- Plugin communication interfaces: `src/lib/plugin/interfaces.ts` ⚠️ Implementation needed

**Broken Steps:**
- ❌ No event bus implementation
- ❌ No shared state patterns defined
- ❌ File references between plugins not implemented

**Success Metric:** Cross-plugin operations execute without race conditions

---

### Journey 7: Settings & Configuration - BYOK (Phase 1B)

**Story:** As a user, I want to configure AI providers and manage my API keys securely (project-scoped), so I can use my preferred models with full control via TanStack AI SDK.

**Phase:** 1B - BYOK & Notes
**Current State:**
- ✅ Credential vault implementation (AES-256-GCM encryption)
- ✅ Provider adapters (Anthropic, OpenRouter, OpenAI, Gemini)
- ❌ TanStack AI SDK integration missing
- ❌ Providers use direct package calls instead of SDK
- ❌ Project-scoped BYOK configuration not complete

**Happy Path:**
1. User opens ChatPanel or Settings (from `/$projectId`)
2. Clicks "Settings" → opens provider configuration UI
3. User selects "Add API Key" for Gemini
4. Enters API key (masked input)
5. Key encrypted via AES-256-GCM, stored in vault (project-scoped)
6. User selects Gemini as active provider for this project
7. System configures TanStack AI SDK with Gemini adapter
8. All LLM calls in this project route through TanStack AI SDK
9. Fallback chain configured (Gemini → OpenAI if Gemini unavailable)
10. User can disable/revoke keys anytime

> **📋 Reference:** [new-fundamental-truths.md Section 4] BYOK Vault, [ADR-039 D5] TanStack AI SDK Integration

**BYOK Requirements:**
- AES-256-GCM encryption for all keys
- Provider-agnostic key storage (project-scoped)
- TanStack AI SDK for ALL LLM calls (no direct provider package calls)
- Conditional key selection per project/use case
- Fallback chain implementation (provider → model fallback)

**Provider Support Matrix:**
| Provider | Tier | Models | Capabilities |
|----------|-------|--------|--------------|
| Google Gemini | First-tier | 3.0 Pro/Flash | Multimodal, tools, streaming, thinking |
| OpenRouter | First-tier | 400+ models | OpenAI-compatible endpoints |
| OpenAI | First-tier | GPT-5.1 | Full feature parity |
| Anthropic | First-tier | Claude 4.5 | Full feature parity |
| Grok | Second-tier | Latest | Basic completion |
| Ollama | Second-tier | Local | Local model serving |

**Evidence:**
- Credential vault: `src/lib/agent/credential-vault.ts` ✅
- TanStack AI SDK: `src/lib/ai/tanstack-adapter.ts` ⚠️ Implementation needed
- Provider adapters: `src/lib/ai/providers/` ⚠️ Full SDK integration needed
- Settings UI: `src/presentation/components/settings/ProviderConfig.tsx` ⚠️ Implementation needed

**Broken Steps:**
- ❌ TanStack AI SDK integration missing (providers use direct calls)
- ❌ No fallback chain implemented
- ❌ Project-scoped configuration not complete (global config only)

**Success Metric:** Users can successfully configure and use custom API keys via TanStack AI SDK

---

## Functional Requirements

### Phase 1A: Non-AI Core & Plugin System

#### 1. Project-Centric Architecture [P0 - Fundamental]

**Route Structure:**
```typescript
// Single project route - no workspace-specific routes
routes:
  - /hub                    # Project management, no project loaded
  - /$projectId             # Project loaded with feature plugins

// Deprecated routes redirect to /$projectId with warning
deprecated:
  - /ide/$projectId           // → redirect to /$projectId
  - /notes/$projectId          // → redirect to /$projectId
  - /knowledge/$projectId     // → redirect to /$projectId
  - /study/$projectId         // → redirect to /$projectId
```

> **📋 Reference:** [new-fundamental-truths.md Section 1.2] Route Structure, [ADR-039 D4] Unified Routing Structure

**Platform Detection:**
```typescript
interface PlatformContract {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  storageType: 'fsa' | 'indexeddb';
  canAccessFSA: boolean;
  canWatchFiles: boolean;
  canRunTerminal: boolean;
  canDoAgenticCoding: boolean;
  canAccessIDE: boolean;
  chromeVersion?: number;
  supportsStructuredClone: boolean;
}

// Usage: Call ONCE at app start, use everywhere
const platform = getPlatformContract();
if (platform.canAccessIDE) {
  // Enable IDE features
} else {
  // Redirect to Notes
}
```

> **📋 Reference:** [new-fundamental-truths.md Section 2] Device Architecture Separation, [ADR-039 D1] PlatformContract Interface

#### 2. Plugin System Architecture [P0 - Critical]

**FeaturePlugin Interface:**
```typescript
interface FeaturePlugin {
  // Identification
  id: 'filetree' | 'monaco' | 'notes' | 'terminal' | 'chat' | 'preview';
  name: string;
  icon: React.ReactNode;
  
  // Rendering
  component: React.FC<FeaturePluginProps>;
  sidebarComponent?: React.FC<SidebarPluginProps>;
  
  // Platform Requirements
  requiresFSA: boolean;           // Requires desktop FSA
  requiresProject: boolean;        // Requires project to be loaded
  minWidth: number;                // Minimum layout width in pixels
  maxInstances: 1 | 2 | 'unlimited';
  
  // State Management
  usePluginStore: () => PluginState;
}
```

> **📋 Reference:** [new-fundamental-truths.md Section 3.1] FeaturePlugin Interface, [ADR-039 D3] Plugin Architecture

**Two Always-Loaded Plugins:**

1. **Project Management Plugin:**
   - **ID:** `filetree`
   - **Responsibilities:**
     - File tree navigation and display
     - Project switcher
     - Project creation and deletion
     - File/folder CRUD operations
     - Database and RAG management
   - **UX Considerations:**
     - For mobile/portrait: Tabbed button navigation
     - Progressive disclosure for complex operations
     - Clear visual hierarchy

2. **Chat Cascade Plugin:**
   - **ID:** `chat`
   - **Responsibilities:**
     - Agent orchestration and coordination
     - Thread management (project-scoped)
     - RAG context indexing
     - Multi-format block rendering
     - Streaming conversation display
   - **Key Principles:**
     - Threads are indexed and dependent on project ID
     - Context window limit: 150K tokens (90% threshold for compaction)
     - Compaction creates new thread with recapped, filtered context
     - All threads date/time stamped with names and hierarchy

> **📋 Reference:** [new-fundamental-truths.md Section 3.3] Two Always-Loaded Plugins

**Plugin Registry:**
```typescript
interface PluginRegistry {
  // Maximum plugins per project
  maxPlugins: 5; // 2 always-loaded + 3 optional
  
  // Register plugin
  register(plugin: FeaturePlugin): void;
  
  // Unregister plugin
  unregister(pluginId: string): void;
  
  // Get active plugins
  getActivePlugins(): FeaturePlugin[];
  
  // Get available plugins for platform
  getAvailablePlugins(platform: PlatformContract): FeaturePlugin[];
}
```

**Platform-Aware Default Plugins:**

```typescript
function getDefaultPlugins(
  platform: PlatformContract,
  project: Project
): PluginId[] {
  // Desktop with FSA: Full development experience
  if (platform.deviceType === 'desktop' && project.storageType === 'fsa') {
    return ['filetree', 'monaco', 'chat'];
  }
  
  // Desktop with IndexedDB: Notes-focused
  if (platform.deviceType === 'desktop' && project.storageType === 'indexeddb') {
    return ['filetree', 'notes', 'chat'];
  }
  
  // Tablet: Notes-focused (no terminal)
  if (platform.deviceType === 'tablet') {
    return ['filetree', 'notes', 'chat'];
  }
  
  // Mobile: Minimal
  if (platform.deviceType === 'mobile') {
    return ['notes'];
  }
  
  return ['notes', 'chat'];
}
```

> **📋 Reference:** [new-fundamental-truths.md Section 1.4] Platform-Aware Default Plugins, [ADR-039 D2] Device Architecture

#### 3. IDE Foundation Features [P1 - Phase 1A]

**Terminal Plugin:**
- xterm.js integration
- Command execution in WebContainer
- Output streaming to UI
- Command history
- Desktop FSA only

**Monaco Editor Plugin:**
- Real Monaco Editor (NOT POC stub)
- Multi-tab editing
- Syntax highlighting (20+ languages)
- Hot load reactive with file sync
- Desktop FSA only

**FileTree Plugin:**
- Hierarchical file/folder display
- Drag-and-drop file operations
- File creation, deletion, rename
- Virtual files for IndexedDB projects
- Snapshot caching for fast load

**Preview Plugin:**
- WebContainer integration
- Live preview window
- Auto-refresh on file changes
- Desktop FSA only

#### 4. StorageGateway Abstraction [P1 - Phase 1A]

```typescript
interface StorageGateway {
  // Core operations
  read(path: string): Promise<Uint8Array>;
  write(path: string, data: Uint8Array): Promise<void>;
  delete(path: string): Promise<void>;
  list(path: string): Promise<FileEntry[]>;
  exists(path: string): Promise<boolean>;
  
  // Watch for changes (optional)
  watch(callback: FileChangeCallback): () => void;
}

// Implementations
class FSAGateway implements StorageGateway {
  // File System Access API implementation
  // Desktop only
}

class IDBGateway implements StorageGateway {
  // IndexedDB implementation
  // Mobile/Tablet only
}

// Factory
class StorageGatewayFactory {
  static create(storageType: 'fsa' | 'indexeddb'): StorageGateway {
    if (storageType === 'fsa') {
      return new FSAGateway();
    }
    return new IDBGateway();
  }
}
```

> **📋 Reference:** [new-fundamental-truths.md Section 8] State Management and Persistence, [ADR-033 D2-D3] Storage Layer Specification

### Storage Gateway Contract (EPIC-0 Fix)

> **Source:** EPIC-0 implementation learnings | **Updated:** 2026-01-26

#### List Pattern Normalization

The `list()` method must normalize path inputs to ensure consistent recursive file discovery:

| Input | Output Pattern | Behavior |
|-------|---------------|----------|
| `'.'` | `'**/*'` | Recursive from root |
| `''` | `'**/*'` | Recursive from root |
| `'src'` | `'src/**/*'` | Recursive from src folder |

#### Return Format

```typescript
interface FileEntry {
  path: string;                    // Relative path from project root
  kind: 'file' | 'directory';      // BOTH types required
  size: number;                    // File size in bytes (0 for directories)
  lastModified: number;            // Unix timestamp
}
```

**Critical Requirements:**
- `list()` MUST return both files AND directories
- FileTree needs directories for hierarchical display
- Empty directories MUST be included
- Path normalization handles leading/trailing slashes

#### Event Emission Pattern

All StorageGateway CRUD operations MUST emit corresponding events:

```typescript
// After successful write
eventBus.emit('FILE_CREATED', { path, projectId });
eventBus.emit('FILE_UPDATED', { path, projectId });

// After successful delete
eventBus.emit('FILE_DELETED', { path, projectId });
```

> **📋 Reference:** EPIC-0 implementation, [new-fundamental-truths.md Section 8] Persistence

**Chrome Version Requirements:**
| Feature | Minimum Chrome Version | Notes |
|---------|----------------------|-------|
| Persistent FSA Permissions | Chrome 122+ | "Allow on every visit" option |
| Structured Clone Optimization | Chrome 129+ | Required for FSA handle serialization |
| File System Observer | Chrome 129+ | Native file watching (fallback: polling) |

> **📋 Reference:** [ADR-035 Part 2] Chrome Version Handling

---

### Phase 1B: BYOK & Notes Features

#### 1. TanStack AI SDK Integration [P0 - Critical]

**Integration Requirements:**
- ALL LLM calls must use TanStack AI SDK
- No direct provider package calls (prohibited)
- Provider-specific adapters for TanStack AI SDK
- Fallback chain for providers
- Secure key distribution reactive to required endpoints

> **📋 Reference:** [new-fundamental-truths.md Section 4.3] Integration Guidelines

**TanStack AI SDK Integration:**
```typescript
// Adapter for TanStack AI SDK
class TanStackAIAdapter {
  private sdk: TanStackAI;
  
  constructor(apiKeys: ApiKeyConfig) {
    this.sdk = new TanStackAI({
      apiKey: apiKeys.gemini, // or other provider
      provider: 'gemini',          // or 'openai', 'anthropic', etc.
      // ... configuration
    });
  }
  
  // All LLM calls go through SDK
  async chat(messages: Message[]): Promise<Stream> {
    return this.sdk.chat({
      messages,
      // ... parameters
    });
  }
}
```

**Provider Adapters:**

**First-Tier Support (Full Feature Parity):**
- Google Gemini (3.0 Pro/Flash)
- OpenRouter (400+ models)
- OpenAI (GPT-5.1)
- Anthropic (Claude 4.5)

**Second-Tier Support (Basic Integration):**
- Grok (Basic completion only)
- Ollama (Local model serving)

> **📋 Reference:** [new-fundamental-truths.md Section 4.2] Supported LLM Providers

#### 2. Project-Scoped BYOK Vault [P0 - Critical]

**Vault Architecture:**
- AES-256-GCM encryption for all keys
- Project-scoped storage (keys stored per project in Dexie)
- Conditional key selection per project
- Secure reactive key distribution (only to required endpoints)
- TanStack AI SDK integration (no direct provider calls)

**Vault Interface:**
```typescript
interface CredentialVault {
  // Store encrypted key
  storeKey(projectId: string, provider: string, encryptedKey: string): Promise<void>;
  
  // Retrieve decrypted key
  getKey(projectId: string, provider: string): Promise<string | null>;
  
  // Revoke key
  revokeKey(projectId: string, provider: string): Promise<void>;
  
  // Get all providers for project
  getProviders(projectId: string): Promise<ProviderConfig[]>;
}
```

> **📋 Reference:** [new-fundamental-truths.md Section 4.1] Vault Architecture

#### 3. Notes Plugin with AI Features [P1 - Phase 1B]

**BlockNote Editor:**
- Block-based rich text editing
- Markdown import/export
- AI command integration (summarize, expand, organize, cite)
- Voice recording with transcription
- Notes ↔ Markdown bidirectional sync
- Asset indexing for RAG compatibility

**Individual AI Features (Note Plugin):**
```typescript
interface AICommands {
  // Context-aware text generation
  summarize(text: string): Promise<string>;
  expand(text: string): Promise<string>;
  organize(text: string): Promise<string>;
  cite(text: string): Promise<string>;
  
  // Sequential transformations
  promptChain(text: string, commands: string[]): Promise<string>;
  
  // Text selection
  transformSelection(text: string, command: string): Promise<string>;
  
  // Context-aware image generation
  generateImage(context: string, prompt: string): Promise<Uint8Array>;
}
```

> **📋 Reference:** [new-fundamental-truths.md Section 7] Generative AI Features

**UX Patterns:**
- Markdown block-based rendering
- Rich media support (HTML, images, videos, presentations)
- Asset indexing for RAG compatibility
- PC and Non-PC parity

---

### Phase 2: Chat Cascade, Threads, Agents

#### 1. Chat Cascade Plugin [P0 - Critical]

**Plugin Responsibilities:**
- Agent orchestration and coordination
- Thread management (project-scoped)
- RAG context indexing
- Multi-format block rendering
- Streaming conversation display

**Thread Architecture:**
```
Project
    └─→ Threads (indexed by project ID)
        ├─→ Main Thread (user conversation)
        ├─→ Sub-threads (agent delegations)
        └─→ Compaction Threads (auto-generated at 90% context limit)
```

> **📋 Reference:** [new-fundamental-truths.md Section 6.1] Thread Architecture

**Context Management:**
```typescript
interface ContextManager {
  // Default limit
  maxTokens: number = 150000;
  
  // Compaction threshold
  compactionThreshold: number = 0.9; // 90%
  
  // Trigger compaction
  triggerCompaction(): Promise<void>;
  
  // Compaction process
  compact(threadId: string): Promise<Thread>;
}
```

**Compaction Process:**
1. Trigger when context reaches 90%
2. Run sub-agent to condense conversation turns
3. Filter irrelevant/contextual information
4. Generate new thread with recapped context
5. Preserve file path references for linking

> **📋 Reference:** [new-fundamental-truths.md Section 6.2] Context Management

**Multi-Format Block Rendering:**
```typescript
interface BlockRenderer {
  // Code blocks
  renderCode(code: string, language: string): ReactNode;
  
  // Rich text
  renderMarkdown(markdown: string): ReactNode;
  
  // HTML artifacts
  renderHTML(html: string): ReactNode;
  
  // Streaming tokens
  renderStreamingToken(token: string, isThinking: boolean): ReactNode;
  
  // Tool outputs
  renderToolOutput(tool: string, status: 'success' | 'error', data: any): ReactNode;
  
  // File references
  renderFileReference(path: string, context: string): ReactNode;
}
```

> **📋 Reference:** [new-fundamental-truths.md Section 6.3] Multi-Format Block Rendering

**Bi-Directional File References:**

**File-to-Chat References:**
- `@filename` - Include entire file
- `@folder/` - Include all child files
- Selected text in Monaco - Include as context

**Chat-to-File Operations:**
- Insert AI output as new file
- Insert at cursor position
- Copy to clipboard

> **📋 Reference:** [new-fundamental-truths.md Section 6.4] Bi-Directional References

#### 2. Agent Orchestrator Pattern [P0 - Critical]

**Orchestrator Pattern:**
```
User Input
    ↓
Orchestrator/Coordinator (read-only tools only)
    ├─→ Mode Switching (to domain-specific agent)
    └─→ Task Delegation (to sub-agents with isolated context)
```

**Orchestrator Responsibilities:**
- Conversational, user-guidance oriented
- Context detection and task decomposition
- Uses only read-related tools:
  - `read-files`, `grep`, `glob`, `list-files`
  - `todowrite`, `todoread`, `question`
  - `switch-mode`, `delegate-tasks`

> **📋 Reference:** [new-fundamental-truths.md Section 5.1] Agent Orchestrator Pattern

**Domain-Specific Agents:**

| Agent Type | Tools | Use Case |
|------------|-------|----------|
| **dev-ext** | File CRUD, bash, task | Code implementation |
| **architect-ext** | Design docs, review | Architecture decisions |
| **analyst-ext** | Research, analysis | Requirements gathering |
| **ux-designer-ext** | UI/UX design | Interface design |
| **tech-writer-ext** | Documentation | API docs, guides |

> **📋 Reference:** [new-fundamental-truths.md Section 5.1] Domain-Specific Agents

#### 3. Tool Permission Matrix [P0 - Critical]

```typescript
interface ToolPermissions {
  agentType: 'real-world-validator' | 'dev-ext' | 'architect-ext' | 'analyst-ext' | 'ux-designer-ext' | 'tech-writer-ext';
  
  permissions: {
    write: boolean;    // Can create/modify files
    edit: boolean;     // Can edit existing files
    bash: boolean;      // Can run terminal commands
    task: boolean;      // Can delegate to sub-agents
  };
}
```

**Tool Permission Matrix:**

| Agent Type | write | edit | bash | task | Notes |
|------------|-------|------|------|------|-------|
| real-world-validator | true | false | browser (limited) | true | Testing only |
| dev-ext | true | true | limited | true | Implementation |
| architect-ext | false | design only | false | true | Architecture docs |
| analyst-ext | false | false | false | true | Research only |
| ux-designer-ext | false | false | false | true | Design only |

> **📋 Reference:** [new-fundamental-truths.md Section 5.2] Tool Architecture

**Tool Approval Workflows:**
- Per-agent permission controls: `ask`, `allow`, `deny`
- Critical tools require explicit user approval
- Permission changes tracked and auditable

#### 4. Agentic Cycle Pattern [P1 - Phase 2]

**Agentic Cycle:**
Reference: [TanStack AI Agentic Cycle](https://tanstack.com/ai/latest/docs/guides/agentic-cycle)

**Key Patterns:**
- Sequential tool execution with state
- Conditional branching based on tool results
- Error handling with retry strategies
- Context management and compaction

> **📋 Reference:** [new-fundamental-truths.md Section 5.3] Agentic Cycle

---

### Phase 3: Advanced Patterns

#### 1. Cross-Plugin Communication [P1 - Phase 3]

**Plugin-to-Plugin Messaging:**
- Event bus for cross-plugin notifications
- Shared state for coordinated operations
- File reference passing between plugins

**Multi-Agent Coordination:**
- Handoff patterns with context transfer
- Multi-agent consensus mechanisms
- Priority-based execution scheduling
- Conflict resolution for concurrent operations

> **📋 Reference:** [new-fundamental-truths.md Section 10] Advanced Patterns

#### 2. Advanced Tool Patterns [P1 - Phase 3]

**Tool Permission Granularity:**

| Permission Level | Scope | Examples |
|----------------|------|----------|
| CRUD Toggle | Per workspace | File write, file delete, project modify |
| File-Level | Per agent operation | Read specific file, write specific file |
| Approval-Based | Per critical operation | Destructive operations require approval |

**Advanced Agentic Patterns:**

| Pattern | Description |
|---------|-------------|
| Handoff | Agent A → Handoff → Agent B (new context transfer) |
| Context Transfer | Preserve context across agent handoffs |
| Multi-Agent Consensus | Multiple agents agree on action |
| Error Recovery | Fallback strategies when agents fail |

> **📋 Reference:** [new-fundamental-truths.md Section 10] Advanced Patterns

#### 3. RAG Integration [P1 - Phase 3]

**RAG Advanced Features:**
- Reranking for search results
- Metadata filtering
- Hybrid retriever optimization
- Per-project RAG index management
- Embedding endpoints for multimodal content

> **📋 Reference:** [new-fundamental-truths.md Section 10] Advanced Patterns

#### 4. Generative AI Features Distinction [P2 - Phase 3]

**Individual AI Features (Note Plugin):**
- AI Commands (context-aware text generation)
- Prompt Chains (sequential transformations)
- Image Generation (context-aware visual creation)
- Text Selection (selected text transformation)
- Operate independently of chat cascade

**Agent-Driven Features (Chat Plugin):**
- Orchestrated Tasks (multi-step agent operations)
- Tool Execution (CRUD operations via agents)
- Context-Aware Generation (file-aware AI responses)
- Operate within chat cascade with full agent capabilities

> **📋 Reference:** [new-fundamental-truths.md Section 7] Generative AI Features

---

## Technical Architecture

> **📋 Reference:** [ADR-039] Unified Architecture Fundamentals (v2.0.0 Alignment), [new-fundamental-truths.md] (Primary Authority)

### Architecture Compliance

| Architecture Decision | ADR Reference | Status | Implementation |
|------------------|--------------|--------|----------------|
| **Project-Centric Architecture** | ADR-039 D1 | ✅ Partial (routes defined) |
| **Platform-Aware Plugin Selection** | ADR-039 D2 | ⚠️ Partial (defaults defined) |
| **StorageGateway Abstraction** | ADR-033 D2-D3 | ⚠️ Partial (interface defined) |
| **TanStack AI SDK Integration** | ADR-039 D5 | ❌ Missing (critical) |
| **Agent Orchestrator Pattern** | ADR-039 D6 | ❌ Missing (critical) |
| **Chat Cascade & Thread Management** | ADR-039 D8 | ❌ Missing (critical) |
| **State Management (Zustand v5)** | ADR-001 | ⚠️ Partial (patterns defined) |

**Overall Compliance:** ~50% (PRD v2.0.0 defines all requirements, implementation in progress)

### Technology Stack

- **Frontend:** React 19 + TanStack Router + TanStack Start + TanStack AI
- **UI Components:** Radix UI primitives + shadcn/ui
- **Styling:** Tailwind CSS (8-bit dark theme, no glassmorphism)
- **State Management:** Zustand v5 (slice pattern, persist) + Dexie.js
- **Persistence:** Dexie (IndexedDB) **ONLY** - LocalStorage DEPRECATED [ADR-035 Part 1]
- **Code Execution:** WebContainers API (browser-based Node.js)
- **File System:** File System Access API (desktop) / IndexedDB (mobile)
- **Terminal:** xterm.js
- **Editor:** Monaco Editor
- **Localization:** react-i18next (EN/VI)

### State Management Boundaries

**Zustand** (Reactive UI State):
- Current active file path
- UI panel states (open/closed, sizes)
- Temporary selection state
- Chat input state (draft messages)
- **Lifetime:** Session-only (cleared on page refresh)

**Dexie IndexedDB** (Persistent Storage):
- Projects metadata (id, name, storageType, workspaceBindings)
- Notes content (markdown, blocks, metadata)
- Conversation threads (messages, agent modes)
- Agent configurations (selected provider, model, permissions)
- Credential vault (encrypted API keys)
- File tree snapshots
- FSA handles (desktop only)
- **Lifetime:** Persistent across sessions

**Persist-First Pattern (ADR-033 D5):**
```typescript
// CORRECT: Persist to Dexie FIRST, then update Zustand
async createNote(input: CreateNoteInput): Promise<Note> {
  const note = generateNote(input);
  
  // Step 1: Persist to DexieDB FIRST (fail-fast)
  await db.notes.put(note);
  
  // Step 2: Update Zustand ONLY after persistence succeeds
  set((state) => ({ notes: [...state.notes, note] }));
  
  return note;
}
```

### Quality Metrics

| Metric | Current | Target | Notes |
|--------|---------|--------|--------|
| **Total Components** | 592 | 592 | |
| **Total Stores** | 179 (28,902 lines) | 179 (refactored) | Target: 0 god stores |
| **God Components** | 1 (AgentConfigDialog 1,089 lines) | 0 | |
| **Test Coverage** | 60-70% | 80%+ | |
| **Error Boundary Coverage** | 22.2% | 80%+ | |
| **TypeScript Errors** | 0 | 0 | |

---

## Non-Functional Requirements

### Performance

**Response Time Targets:**
- Page load: < 2 seconds
- File operations: < 100ms
- Agent response: < 5 seconds to first token (streaming)
- Workspace switch: < 500ms
- WebContainer boot: 3-5 seconds

**Resource Limits:**
- Bundle size: < 2MB (currently: 1.5MB gzipped)
- Memory usage: < 500MB (currently: 300-400MB)
- IndexedDB quota: < 50MB (currently: 20-30MB)

### Security

**OWASP Top 10 for Agentic Applications:**

1. **Prompt Injection** - Sanitize all user inputs before passing to LLM
2. **Unauthorized Tool Execution** - Implement approval workflows for destructive operations
3. **Data Exfiltration** - Restrict file system access, sandbox execution
4. **Resource Exhaustion** - Rate limits, timeouts, memory caps
5. **Supply Chain Poisoning** - Pin dependency versions, verify integrity
6. **Insecure Output Handling** - Validate LLM responses before execution
7. **Agent Impersonation** - Authenticate agents, verify identities
8. **Excessive Autonomy** - Human-in-the-loop for critical decisions
9. **Training Data Exposure** - Sanitize logs, redact sensitive data
10. **Model Denial of Service** - Queue management, circuit breakers

**Current Implementation:**
- ✅ Credential vault (AES-256-GCM encryption)
- ✅ Tool approval workflows
- ❌ TanStack AI SDK integration missing (providers use direct calls)
- ❌ God component: AgentConfigDialog.tsx (1,089 lines) - needs splitting

---

## Success Metrics

### Product Metrics (OKRs)

**Objective 1: Complete Phase 1A (Non-AI Core & Plugin System)**
- **Key Result 1.1:** Implement plugin system with FeaturePlugin interface
- **Key Result 1.2:** Implement platform-aware default plugins
- **Key Result 1.3:** Implement StorageGateway abstraction (FSA/IDB adapters)
- **Key Result 1.4:** Complete IDE foundation features (Terminal, Monaco, FileTree, Preview)
- **Key Result 1.5:** Single `/$projectId` route operational
- **Key Result 1.6:** Eliminate all workspace-centric routes
- **Key Result 1.7:** Safari PWA installation flow implemented (CRITICAL for data persistence)
- **Timeline:** 4-6 weeks

**Objective 2: Complete Phase 1B (BYOK & Notes)**
- **Key Result 2.1:** Implement TanStack AI SDK integration (ALL LLM calls)
- **Key Result 2.2:** Implement project-scoped BYOK vault
- **Key Result 2.3:** Implement provider adapters (all first-tier providers)
- **Key Result 2.4:** Implement fallback chain (provider → model fallback)
- **Key Result 2.5:** Complete Notes plugin with AI features
- **Key Result 2.6:** Implement Notes ↔ Markdown bidirectional sync
- **Key Result 2.7:** Implement SQLite WASM + OPFS storage layer with Dexie.js fallback
- **Timeline:** 4-6 weeks

**Objective 3: Complete Phase 2 (Chat Cascade, Threads, Agents)**
- **Key Result 3.1:** Implement Chat Cascade plugin with thread architecture
- **Key Result 3.2:** Implement agent orchestrator pattern
- **Key Result 3.3:** Implement domain-specific agents (dev-ext, architect-ext, etc.)
- **Key Result 3.4:** Implement tool permission matrix
- **Key Result 3.5:** Implement context window management (150K token limit, 90% compaction)
- **Key Result 3.6:** Implement multi-format block rendering
- **Key Result 3.7:** Implement agentic cycle pattern
- **Timeline:** 6-8 weeks

**Objective 4: Complete Phase 3 (Advanced Patterns)**
- **Key Result 4.1:** Implement cross-plugin communication
- **Key Result 4.2:** Implement multi-agent coordination (handoff, consensus)
- **Key Result 4.3:** Implement advanced tool patterns (granular permissions)
- **Key Result 4.4:** Implement RAG integration (reranking, metadata filtering)
- **Key Result 4.5:** Implement generative AI features distinction
- **Timeline:** 8-12 weeks

### Quality Metrics

**Code Quality:**
- **God Files:** 0 files >300 lines (currently: 1 - AgentConfigDialog)
- **Test Coverage:** 80%+ (currently: 60-70%)
- **TypeScript Errors:** 0 in production code
- **Error Boundary Coverage:** 80%+ (currently: 22.2%)
- **Bundle Size:** <2MB gzipped (currently: 1.5MB - maintain)
- **Architecture Compliance:** 100% (PRD v2.2.0 research-validated)

**Storage Layer Performance (NEW - Research-Validated):**
| Metric | Target | Notes |
|--------|--------|-------|
| Initial sync (1000+ files) | <3 seconds | Delta sync with mtime cache |
| Incremental sync | <200ms | FileSystemObserver + content hash |
| SQLite query latency | <50ms | FTS5 for RAG indices |
| Storage quota utilization | <80% of browser limit | With user warnings at 70% |

**Safari PWA Requirements (CRITICAL):**
| Requirement | Status | Notes |
|-------------|--------|-------|
| PWA installation prompt | Required | Safari evicts data after 7 days without PWA |
| "Add to Home Screen" banner | Required | With clear explanation of data persistence |
| Re-sync on first launch | Required | After potential eviction |
| Storage quota monitoring | Required | User warnings at 70% threshold |

---

## Dependencies & Risks

### Technical Dependencies

**Critical Path Dependencies:**
1. **Platform Contract (ADR-039 D1)** → All platform-aware features
2. **Plugin System (ADR-039 D3)** → All plugin-based features
3. **StorageGateway (ADR-033 D2-D3)** → All persistence
4. **TanStack AI SDK (ADR-040)** → All LLM integration ✅ CONFIRMED
5. **Agent Orchestrator (ADR-039 D6)** → All agent operations
6. **Chat Cascade (ADR-039 D8)** → All chat/thread management
7. **SQLite WASM + OPFS (ADR-041)** → Mobile/tablet storage ⚠️ NEW
8. **PWA Installation (ADR-047)** → Safari data persistence ⚠️ CRITICAL

**External Dependencies:**
- **TanStack AI:** Streaming responses, tool integration (actively maintained)
- **TanStack Start:** Full-stack React framework (v1.0+)
- **WebContainers API:** Browser-based Node.js (StackBlitz, stable)
- **File System Access API:** Local filesystem integration (W3C standard, evolving)
- **SQLite WASM:** Browser-based SQL (wa-sqlite, sql.js - actively maintained) ⚠️ NEW
- **OPFS (Origin Private File System):** Browser file storage (Chrome 102+, Firefox 111+, Safari 15.2+) ⚠️ NEW
- **xterm.js:** Terminal emulation (stable, mature)
- **Monaco Editor:** Code editing (Microsoft, stable)
- **Dexie:** IndexedDB wrapper (stable, mature)
- **Radix UI:** Component primitives (actively maintained)

### Risks

**Technical Risks:**

| Risk | Severity | Mitigation | ADR |
|------|----------|------------|-----|
| **Safari 7-day eviction** | CRITICAL | PWA installation mandatory for Safari; "Add to Home Screen" banner with explanation; re-sync on first launch | ADR-047 |
| **SQLite WASM browser support** | HIGH | Feature detection with Dexie.js fallback; target Chrome 102+, Firefox 111+, Safari 15.2+ | ADR-041 |
| **PWA installation friction** | MEDIUM | Clear value proposition in banner; explain data persistence benefit; track installation rate | ADR-047 |
| **Plugin System Complexity** | HIGH | Event bus pattern; state isolation rules; comprehensive testing | ADR-043 |
| **TanStack AI SDK Integration** | HIGH | All provider calls must migrate; use `.client()` for browser tools | ADR-040 |
| **Agent Orchestrator Pattern** | HIGH | Complex multi-agent coordination; comprehensive testing | ADR-039 |
| **Thread Management** | MEDIUM | Context compaction and thread hierarchy complexity | ADR-039 |
| **Cross-Plugin Communication** | MEDIUM | Event bus and shared state patterns | ADR-043 |

**Browser Support Risks:**

| Browser | Risk Level | Mitigation |
|---------|-----------|------------|
| Safari iOS | CRITICAL | PWA installation required; eviction warning; re-sync capability |
| Chrome <102 | HIGH | Dexie.js fallback; graceful degradation |
| Firefox <111 | HIGH | Dexie.js fallback; graceful degradation |
| Older browsers | MEDIUM | Feature detection; clear messaging on limitations |

**Mitigation Strategies:**
- Phase-by-phase implementation (1A, 1B, 2, 3)
- Incremental delivery with clear entry criteria
- Comprehensive testing at each phase gate
- Documentation and knowledge sharing across team
- Storage layer abstraction with automatic fallback
- PWA installation tracking with analytics

---

## Document Control

| Version | Date | Changes | Author |
|----------|------|---------|---------
| **1.0.0** | 2026-01-07 | Initial draft (workspace-centric) |
| **1.1.0** | 2026-01-22 | Updated with ADR references, corrected completion claims |
| **2.0.0** | 2026-01-26 | **Major Update:** 100% alignment with new-fundamental-truths.md v2.0.0, 3-phase structure, project-centric architecture, plugin system, TanStack AI SDK, agent orchestrator, chat cascade, thread management, advanced patterns |
| **2.1.0** | 2026-01-26 | **EPIC-0 Learnings Update:** Added Phase 1A Plugin Requirements (FileTree, Monaco, EventBus), Storage Gateway Contract (list pattern normalization, FileEntry return format, event emission pattern) | architect-ext |
| **2.2.0** | 2026-01-28 | **Research Validation Update:** Added Architecture Shifts section (6 validated shifts), Updated Success Criteria (Safari PWA, storage performance metrics), Updated Dependencies & Risks (Safari eviction CRITICAL, SQLite WASM, PWA friction), Updated frontmatter with research_validated date, ADR references updated (ADR-040 through ADR-047) | tech-writer-ext |
| | | Changes in v2.2.0: |
| | | 1. ✅ Added Architecture Shifts section with 6 research-validated shifts |
| | | 2. ✅ Shift 1: Storage Strategy (SQLite WASM + OPFS) - ADR-041 |
| | | 3. ✅ Shift 2: AI SDK Confirmation (TanStack AI) - ADR-040 |
| | | 4. ✅ Shift 3: State Management (4-layer architecture) - ADR-042 |
| | | 5. ✅ Shift 4: LLM Provider Priority (Gemini P1) - ADR-044 |
| | | 6. ✅ Shift 5: Nested Project Policy (block) - ADR-034 (amended) |
| | | 7. ✅ Shift 6: Plugin Contract (event bus) - ADR-043 |
| | | 8. ✅ Added Safari PWA installation requirement to Success Criteria |
| | | 9. ✅ Added SQLite WASM + OPFS implementation to Key Results |
| | | 10. ✅ Added storage layer performance metrics |
| | | 11. ✅ Added Safari 7-day eviction as CRITICAL risk |
| | | 12. ✅ Added SQLite WASM browser support risk |
| | | 13. ✅ Added PWA installation friction risk |
| | | 14. ✅ Added browser support risk matrix |
| | | 15. ✅ Updated ADR references to include ADR-040 through ADR-047 |
| | | 16. ✅ Updated frontmatter with research_validated field |
| | | Changes in v2.0.0: |
| | | 1. ✅ Replaced workspace-centric architecture with project-centric model |
| | | 2. ✅ Updated route structure to single `/$projectId` |
| | | 3. ✅ Added comprehensive plugin system architecture section |
| | | 4. ✅ Added FeaturePlugin interface specification |
| | | 5. ✅ Added two always-loaded plugins documentation |
| | | 6. ✅ Added platform-aware default plugins table |
| | | 7. ✅ Added TanStack AI SDK integration requirements |
| | | 8. ✅ Added project-scoped BYOK vault architecture |
| | | 9. ✅ Added chat cascade plugin with thread management |
| | | 10. ✅ Added agent orchestrator pattern section |
| | | 11. ✅ Added domain-specific agents and tool permission matrix |
| | | 12. ✅ Added context window management and compaction |
| | | 13. ✅ Added multi-format block rendering requirements |
| | | 14. ✅ Added bi-directional file references |
| | | 15. ✅ Added agentic cycle pattern |
| | | 16. ✅ Structured user journeys by phase (1A, 1B, 2, 3) |
| | | 17. ✅ Added 3-phase development approach section |
| | | 18. ✅ Removed all workspace-centric route references |
| | | 19. ✅ Removed `/setting` route references |
| | | 20. ✅ Updated all feature requirements to align with v2.0.0 |
| | | 21. ✅ Added Phase 3 advanced patterns section |
| | | 22. ✅ Updated technical architecture section |
| | | 23. ✅ Updated success metrics by phase |
| | | 24. ✅ Added comprehensive references to new-fundamental-truths.md v2.0.0 and ADR-039 |

---

## Appendix: ADR References

### Authoritative Architecture Documents

| ADR | Title | Status | Key Decisions |
|-----|-------|--------|---------------|
| **ADR-039** | Unified Architecture Fundamentals (v2.0.0 Alignment) | APPROVED | Project-centric architecture, plugin system, TanStack AI SDK, agent orchestrator, chat cascade, thread management |
| **ADR-040** | TanStack AI SDK Selection | PROPOSED | Confirmed TanStack AI; `.client()` for browser tools; `needsApproval` for tool approval |
| **ADR-041** | Storage Strategy (SQLite WASM + OPFS) | PROPOSED | SQLite WASM primary, Dexie.js fallback; OPFS for mobile/tablet; Safari eviction mitigation |
| **ADR-042** | State Management Boundaries | PROPOSED | 4-layer architecture; conflict prevention rules; useShallow(), useLiveQuery() patterns |
| **ADR-043** | Plugin Contract v1.0 | PROPOSED | Event bus pattern; state isolation; lifecycle hooks; plugin versioning |
| **ADR-044** | LLM Provider Priority | PROPOSED | Gemini P1 (FREE embeddings); embedding strategy; context caching |
| **ADR-045** | Delta Sync Architecture | PROPOSED | Large project handling (1000+ files); <3s initial, <200ms incremental |
| **ADR-046** | Context Caching Strategy | PROPOSED | 75-90% cost reduction with Anthropic/Gemini caching |
| **ADR-047** | PWA Requirements | PROPOSED | Safari data persistence; offline support; installation flow |
| **ADR-034** | Project-Centric Architecture with Feature Plugins | AMENDED | Added nested project blocking (Amendment-001) |
| **ADR-035** | Correct-Course v2 - Architecture Standardization | SUPERSEDED | Superseded by ADR-039 |

### ADR-039 Structure (Proposed - Primary Reference)

```markdown
# ADR-039: Unified Architecture Fundamentals (v2.0.0 Alignment)

**Status:** PROPOSED FOR APPROVAL
**Date:** 2026-01-26
**Version:** 1.0.0
**Supersedes:** ADR-033, ADR-034, ADR-035 (cascade consolidation)
**Aligns With:** new-fundamental-truths.md v2.0.0

## Decision

### D1: Adopt Project-Centric Architecture as Single Source of Truth

### D2: Device Architecture Separation (Desktop vs Mobile)

### D3: Feature Plugin Architecture

### D4: Unified Routing Structure (Single /$projectId)

### D5: BYOK Vault Integration (TanStack AI SDK)

### D6: Agent and Tool Architecture (Orchestrator Pattern)

### D7: State Management and Persistence (Zustand v5 + Dexie)

### D8: Chat Cascade and Thread Management
```

---

## 3-Phase Approach Summary

| Phase | Objective | Duration | Entry Criteria | Success Metrics |
|--------|-----------|----------|-----------------|
| **Phase 1A** | Non-AI Core & Plugin System | 4-6 weeks | ADR-039 approved, Plugin interface defined, StorageGateway complete, single route operational |
| **Phase 1B** | BYOK & Notes | 4-6 weeks | Phase 1A complete, TanStack AI SDK integrated, project-scoped vault operational |
| **Phase 2** | Chat Cascade, Threads, Agents | 6-8 weeks | Phase 1B complete, Orchestrator implemented, domain agents defined, thread management operational |
| **Phase 3** | Advanced Patterns | 8-12 weeks | Phase 2 complete, cross-plugin communication, multi-agent coordination, RAG integration |

> **📋 Reference:** [docs/the-3-phase-approach.md] Phase-by-phase implementation plan

---

**Document Version:** 2.2.0
**Status:** ACTIVE - Research Validated
**Alignment:** 100% with new-fundamental-truths.md v2.2.0 + Research Validation 2026-01-28
**Research Validated:** 2026-01-28
**Generating Agent:** tech-writer-ext (BMAD Framework)
**Next Action:** ADR-040 through ADR-047 creation and approval

---

*Document updated by tech-writer-ext (BMAD Framework)*
*Output: `_bmad-output/planning-artifacts/prd.md`*
