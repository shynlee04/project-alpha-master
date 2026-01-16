---
version: 1.1.0
generated: 2026-01-07T12:00:00+07:00
updated: 2026-01-22T18:00:00+07:00
agent: product-manager-rigorous
phase: planning
status: draft
stepsCompleted: [phase-1-research, phase-2-analysis, phase-3-synthesis, phase-1.2-fundamental-truth-updates]
---

# Product Requirements Document: Via-Gent (Project Alpha v2.0)

> **⚠️ IMPORTANT:** This document references authoritative architecture decisions defined in ADRs. For implementation details, always consult these ADRs first:
> - **ADR-033**: Correct Course Architectural Remediation (Platform, Storage, FSA Handle Persistence)
> - **ADR-034**: Workspace Access Infection Remediation (31 infection points, remediation phases)
> - **ADR-035**: Architecture Standardization v2 (Chrome 122+, Chrome 129+ requirements)

## Document Control
- **Version:** 1.1.0 (Updated with Fundamental Truths and ADR references)
- **Generated:** 2026-01-07
- **Updated:** 2026-01-22
- **Status:** Draft - Pending Review
- **Generating Agent:** Product Manager (Rigorous)
- **Confidence Level:** HIGH (based on comprehensive codebase scan + market research + ADR-033/034/035 alignment)

## Executive Summary [UPDATED: 2026-01-22 - Team B Phase 1]

Via-Gent is a browser-based AI-powered development workspace that enables solo developers, learners, and distributed teams to eliminate setup friction and ship applications faster. The platform provides a zero-server, privacy-first IDE with intelligent agents that can execute—not just suggest—code changes, running 100% client-side via WebContainers with local filesystem integration.

**Platform Positioning:**
Via-Gent is a **Desktop-First IDE with mobile Notes/Knowledge/Study access**. The IDE workspace requires desktop capabilities (File System Access API, WebContainers, terminal) and is not available on mobile or tablet devices. Mobile users can access Notes, Knowledge, and Study workspaces with full functionality via IndexedDB storage (Dexie).

> **📋 Reference:** [ADR-033 D1-D4] PlatformContract and Platform-Aware Entry

**Current State (~30-40% Complete - Verified 2026-01-22):**
> **⚠️ CORRECTION:** Previous claims of 65-70% completion were overly optimistic. Current actual completion is approximately 30-40% based on deep architectural analysis identifying 31 infection points blocking all user journeys.

- ✅ **Core Infrastructure:** WebContainer integration, file system sync, Monaco editor, terminal
- ✅ **Multi-Workspace Architecture:** IDE (desktop only), Knowledge, Notes, Study workspaces with workspace-aware state management
- ✅ **Agent System:** Modular provider adapters, tool permissions, credential vault (AES-256-GCM encryption)
- ⚠️ **Critical Issues:** 31 infection points identified (ADR-034 Infection Registry), requiring phased remediation across 5 phases
- ⚠️ **P0 Blockers:** 3 P0 bugs blocking ALL user journeys (per ADR-035)

> **📋 Reference:** [ADR-034] Phase 1-5 Remediation Plan for 31 infection points

**Target State (80-90% Complete - 8-12 weeks):**
- Phase out all P0/P1 blockers (5 phases, 31 stories)
- Complete unified AI service architecture (ADR-033/034/035)
- Achieve 80%+ error boundary coverage
- Consolidate god stores into focused slices (12 → 0)
- Launch production-ready feature set

**Market Position:**
Via-Gent occupies a unique position as a **local-first AI IDE** with multi-workspace architecture. Unlike Cursor (desktop-only), Windsurf (open-source alternative), or v0.dev (UI generation only), Via-Gent combines browser-based execution with privacy-first local storage and education market focus. The platform is distinguished by its Notes/Knowledge/Study workspaces being accessible on mobile devices, while the IDE workspace remains desktop-exclusive due to technical requirements (FSA, WebContainers, terminal).

---

## Problem Statement

### Primary Problem: Development Setup Tax

Creating a new project with best practices requires 2+ hours of boilerplate configuration across package managers, build tools, linting, testing, and deployment. Existing solutions force unacceptable tradeoffs:

**Cloud IDEs** (CodeSandbox, Replit):
- ❌ Require subscriptions ($10-20/month)
- ❌ Store code on their servers (privacy concerns)
- ❌ Vendor lock-in (cannot export easily)

**AI Assistants** (Copilot, Cursor):
- ❌ Generate code but can't execute, test, or deploy
- ❌ Require desktop installation
- ❌ No mobile support

**Traditional IDEs** (VS Code):
- ❌ Require installation and local setup per machine
- ❌ Complex environment configuration
- ❌ No AI agent integration with tool execution

### Via-Gent Solution [UPDATED: 2026-01-22]

**Zero-Server, Privacy-First Architecture**
- 100% client-side execution (code never leaves browser)
- Local filesystem sync via File System Access API (desktop) or IndexedDB (mobile, Dexie only)
- No server costs, no subscription fees
- Works offline after initial load

> **⚠️ Storage Correction:** LocalStorage is DEPRECATED. Use Dexie (IndexedDB) for all persistent storage per [ADR-035 Part 1].

**Platform-Aware Entry (ADR-033 D1)**

Via-Gent uses automatic platform detection to provide the optimal experience per device:

## Entry Matrix: [New/Returned User] x [Desktop/Mobile/Tablet]

| User Type | Desktop | Mobile | Tablet |
|-----------|---------|--------|--------|
| **New** | Create project → Select workspace (IDE/Notes/Knowledge/Study) | Create project → Notes only (auto-create browser-mode project) | Create project → Notes only (auto-create browser-mode project) |
| **Returned** | Select from list → Select workspace | Auto-load → Notes only | Select from list → Notes only |
| **IDE Access** | Full IDE (with FSA folder) | Blocked (toast redirect to Notes) | Blocked (toast redirect to Notes) |
| **Storage** | FSA (File System Access API) | IndexedDB (Dexie) | IndexedDB (Dexie) |

**Key Rules:**
- IDE workspace is desktop-only (requires FSA, WebContainers, terminal)
- Mobile/tablet users redirected to Notes workspace with toast notification
- Project ID format: `proj_{uuid}` (e.g., "proj_abc123") or `notes:browser-mode` for mobile default
- Storage type determined once at project creation, immutable thereafter
- Direct landing to workspace after project+workspace selection (no intermediate screens)

> **📋 Reference:** [ADR-033 D1] getPlatformContract() for platform detection, [ADR-033 D10] FSA handle persistence

**AI Agents That Execute, Not Just Suggest**
- Write and modify files
- Run terminal commands (`npm install`, `npm run dev`)
- Commit changes via Git
- Show results in live preview

**Bring Your Own AI Key (BYOK)**
- Connect your own Gemini, OpenAI, or other API keys
- Control your costs, choose your model
- AES-256-GCM encrypted credential vault
- No vendor lock-in

> **📋 Reference:** [ADR-033 D7-D9] BYOK architecture, credential vault, provider integration

### Market Validation

**Competitive Analysis** [HIGH confidence - market-research.md]:
- **Cursor**: $20/month, desktop-only, professional workflows
- **Windsurf**: Open-source, agent marketplace, local-first
- **Claude Code**: CLI-first, skills system, advanced reasoning
- **v0.dev**: Free tier, UI generation, React/Tailwind expertise

**Via-Gent Differentiators:**
1. **Mobile-First IDE** - No competitor has this
2. **Multi-Workspace Architecture** - IDE + Knowledge + Notes + Study
3. **Education Market Focus** - Vietnamese localization, learn-to-code features
4. **Local-First with AI Synthesis** - Privacy-focused, zero server costs

---

## Target Users

### Primary Customers [from mission.md - HIGH confidence]

1. **Solo Developers (Freelancers)**
   - Need quick project setup, AI assistance, easy client demos
   - No infrastructure overhead
   - Work from any computer

2. **Distributed Development Teams**
   - Cross-functional teams (PM, Designer, Developer, QA)
   - Unified workspace with customizable workflows
   - Real-time collaboration features

3. **Educational Platforms**
   - Coding bootcamps, instructors, students
   - Instant-ready development environments
   - No setup friction for workshops

### User Personas [from mission.md - HIGH confidence]

**Alex** (25-35, Solo Full-Stack Developer)
- **Role:** Freelance web developer
- **Context:** Takes on 3-4 projects monthly, works from various locations
- **Pain Points:** "Project setup takes 2+ hours"; switching between client projects is painful; managing local dev environments is fragmented
- **Goals:** Ship faster, reduce boilerplate, work from any computer

**Jordan** (18-24, Student/Bootcamp Graduate)
- **Role:** Learning full-stack development
- **Context:** Using shared/borrowed computers, limited CLI experience
- **Pain Points:** "I don't know how to set up a dev environment"; npm errors derail learning
- **Goals:** Focus on coding concepts, not tooling; understand how code works

**Taylor** (30-45, Workshop Instructor/Content Creator)
- **Role:** Teaching coding to groups
- **Context:** Half of workshop time lost to installation issues
- **Pain Points:** "Students can't follow along because their setup failed"
- **Goals:** Every student codes in browser instantly; demonstrate concepts without setup friction

---

## User Stories & Journeys [UPDATED: 2026-01-22]

### Overview: 7 Core User Use Cases

Based on the fundamental truths checklist, Via-Gent supports these 7 user journeys:

1. **Journey 1:** Desktop User - IDE Workspace (File System Foundation)
2. **Journey 2:** Desktop User - Notes Workspace (Markdown Editor)
3. **Journey 3:** Desktop User - Knowledge Workspace (RAG-Enhanced)
4. **Journey 4:** Mobile User - Notes/Knowledge (BrowserDB/Dexie)
5. **Journey 5:** Agent-Assisted Coding (AI Integration)
6. **Journey 6:** Cross-Workspace Operations (State Sync)
7. **Journey 7:** Settings & Configuration (BYOK)

> **📋 Reference:** [check-list-for-fundamental-truth.md] All 7 use cases documented

---

### Journey 1: Desktop User - IDE Workspace (File System Foundation)

**Story:** As a desktop developer, I want to create and manage projects with full IDE capabilities, so I can develop applications with AI assistance and local filesystem integration.

**Current State** [Evidence: scan-summary.md]:
- ✅ Project bootstrap with TanStack Start SPA
- ✅ File system picker for local folder selection (FSA)
- ✅ WebContainer boots with Node.js runtime
- ⚠️ Template gallery incomplete [feature-gaps.yaml:34]
- ⚠️ 31 infection points blocking all journeys [ADR-034]

**Happy Path:**
1. User opens Via-Gent → lands on Hub page
2. System detects desktop platform via `getPlatformContract()`
3. Clicks "New Project" → sees template gallery
4. Selects "Portfolio Website" template
5. Chooses local folder via File System Access API (FSA)
6. FSA handle persisted to Dexie for session restore [ADR-033 D10]
7. WebContainer mounts local files automatically
8. Dev server starts (`npm run dev` in terminal)
9. Live preview shows running application
10. Chat panel available: "Describe what you want to build"

**Platform Requirements:**
- Chrome 122+ for persistent FSA permissions [ADR-033 D2]
- Chrome 129+ for structuredClone optimization [ADR-035 Part 2]
- FSA handle persistence via Dexie [ADR-033 D10]

> **📋 Reference:** [ADR-033 D1-D4] PlatformContract, [ADR-033 D10] HandlePersistenceService

**Evidence:**
- Hub page: `src/routes/hub.tsx` ✅
- Platform contract: `src/lib/platform/get-platform-contract.ts` ✅
- Project creation: `src/infrastructure/persistence/stores/project/` ✅
- WebContainer boot: `src/lib/webcontainer/manager.ts` ✅
- Terminal integration: `src/presentation/components/ide/XTerminal.tsx` ✅
- Preview panel: `src/presentation/components/ide/PreviewPanel/` ✅

**Broken Steps** [Evidence: ADR-034 Infection Registry]:
- ❌ Route loading race conditions (STATE-001, STATE-002)
- ❌ FSA handle persistence incomplete (PLAT-001, PLAT-002)
- ❌ Platform guards missing for /ide route (ROUTE-001)
- ❌ God stores causing crashes (STATE-003 through STATE-012)

**Success Metric:** Time from "New Project" to running app < 60 seconds (after remediation)

---

### Journey 2: Desktop User - Notes Workspace (Markdown Editor)

**Story:** As a desktop user, I want to create and manage notes with AI assistance, so I can document my projects and learning materials.

**Current State** [Evidence: component-inventory.yaml]:
- ✅ Notes workspace (17 components)
- ✅ BlockNote editor (block-based rich text)
- ✅ Voice recording with transcription
- ✅ AI enhancement (summarize, expand, organize, cite)
- ❌ note-ai-service.ts bypasses unified agent system [ADR-025]
- ❌ VoiceRecordButton uses hardcoded Gemini provider [ADR-025:381]

**Happy Path:**
1. User opens Via-Gent on desktop
2. Selects or creates project (Dexie storage for notes)
3. Navigates to Notes workspace
4. Creates new note with BlockNote editor
5. Uses AI for enhancement (summarize, organize, cite)
6. Notes sync to local filesystem automatically (if FSA project)
7. Cross-workspace references to Knowledge materials

> **📋 Reference:** [ADR-033 D5] State Management Boundaries, [ADR-034 D11] State scoping by [projectId+workspaceId]

**State Boundaries:**
- UI state: Zustand (session-only)
- Persistent state: Dexie (notes, metadata)
- Composite key pattern: `[projectId+workspaceId]` [ADR-033 D6]

**Evidence:**
- NotesPage: `src/presentation/components/notes/NotesPage.tsx` (420 lines) ✅
- BlockNote editor: `src/presentation/components/notes/*` ✅
- Platform contract: `src/lib/platform/get-platform-contract.ts` ✅

**Broken Steps:**
- ❌ P0 CRIT-010: Architectural disjoint - Notes AI uses different invocation pattern
- ❌ Security risk: Hardcoded provider bypasses permission system [ADR-025:19]

**Success Metric:** Lecture → organized notes < 2 minutes

---

### Journey 3: Desktop User - Knowledge Workspace (RAG-Enhanced)

**Story:** As a desktop user, I want to import learning materials and generate study artifacts with RAG, so I can synthesize knowledge across sources.

**Current State** [Evidence: component-inventory.yaml]:
- ✅ Knowledge workspace (23 components)
- ✅ Source import (PDF, URL)
- ✅ RAG pipeline configuration
- ✅ Block-based note editor
- ✅ Flashcard/quiz system
- ✅ Study workspace (12 components)
- ❌ Markdown to BlockNote parser missing [feature-gaps.yaml:36]
- ❌ Vector search optimization in progress [feature-gaps.yaml:60]

**Happy Path:**
1. User switches to Knowledge workspace (desktop: sidebar nav)
2. Clicks "Import Source" → selects PDF document
3. PDF processes via `process_pdf` tool
4. Content chunks and embeddings generated
5. Source appears in SourceCardGrid
6. User creates collection: "React Fundamentals"
7. User drags source to collection
8. Clicks "Generate Flashcards" → AI creates 20 flashcards
9. Switches to Study workspace → takes practice quiz
10. Reviews progress analytics

> **📋 Reference:** [ADR-034 D12] Route loading patterns, waitForHydration()

**Route Loading Standard:**
- Use `loader` pattern for data fetching [ADR-034 D12]
- Implement `waitForHydration()` before rendering [ADR-034 D12]
- Platform-specific route guards via `beforeLoad` [ADR-034 D13]

**Evidence:**
- KnowledgePage: `src/presentation/components/knowledge/KnowledgePage.tsx` (450 lines) ✅
- SourceCardGrid: `src/presentation/components/knowledge/SourceCardGrid.tsx` (280 lines) ✅
- CollectionManager: `src/presentation/components/knowledge/CollectionManager.tsx` (320 lines) ✅
- StudyPage: `src/routes/study.$projectId.lazy.tsx` ✅
- Quiz system: `src/presentation/components/study/*` ✅

**Broken Steps:**
- ❌ P1: Markdown to BlockNote parser missing (8 hours estimated)
- ❌ P1: Quiz loading from store incomplete [feature-gaps.yaml:71]
- ❌ N+1 query pattern in RAG [audit finding]

**Success Metric:** Time from PDF import to study-ready < 5 minutes

---

### Journey 4: Mobile User - Notes/Knowledge (BrowserDB)

**Story:** As a mobile user with tablets, I want to access Notes and Knowledge workspaces on my device, so I can learn and take notes anywhere.

> **⚠️ CRITICAL:** IDE workspace is NOT available on mobile. Per [ADR-033 D4], mobile users are blocked from IDE with toast redirect.

**Current State** [Evidence: component-inventory.yaml + scan-summary.md]:
- ✅ Mobile tab bar navigation (70% complete)
- ✅ Responsive breakpoints (sm: 640px, md: 768px, lg: 1024px)
- ✅ Touch targets >= 44px
- ✅ Notes workspace mobile-optimized
- ✅ Knowledge workspace mobile-optimized
- ✅ Study workspace mobile-optimized
- ❌ Mobile command palette incomplete [feature-gaps.yaml:58]

**Happy Path (Mobile):**
1. User opens Via-Gent on iPad (Safari) or Android tablet (Chrome)
2. Platform detection via `getPlatformContract()` → mobile
3. Lands on mobile-optimized Hub page with browser-mode project auto-created
4. Bottom navigation bar shows: Knowledge | Notes | Study (IDE hidden)
5. Taps "Notes" → mobile-optimized BlockNote editor opens
6. Taps microphone icon → records lecture audio, AI transcribes
7. Taps "Organize" → AI creates hierarchical structure
8. Switches to "Knowledge" → imports PDF study materials
9. Switches to "Study" → takes practice quiz with flashcards
10. Reviews progress analytics

**IDE Access Blocked (Mobile):**
- Route guard on `/ide/$projectId` [ADR-034 ROUTE-001]
- Toast notification: "IDE requires desktop browser with File System Access API support"
- Redirect to `/notes/$projectId`

**Storage:**
- Dexie (IndexedDB) for all mobile data [ADR-033 D3]
- No FSA on mobile devices
- FSA handles stored in Dexie for desktop restore only [ADR-033 D10]

> **📋 Reference:** [ADR-033 D3] IDBGateway adapter, [ADR-034 D13] Platform guards distribution

**Evidence:**
- Mobile layout: `src/presentation/components/layout/MobileIDELayout.tsx` ✅
- Bottom nav bar: `src/presentation/components/layout/BottomTabBar.tsx` ✅
- Notes workspace: `src/presentation/components/notes/*` ✅
- Knowledge workspace: `src/presentation/components/knowledge/*` ✅
- Study workspace: `src/presentation/components/study/*` ✅
- Platform contract: `src/lib/platform/get-platform-contract.ts` ✅ (ADR-033 D1)

**Broken Steps:**
- ⚠️ Mobile command palette incomplete
- ⚠️ Route guards for IDE on mobile not fully implemented (EPIC-CC-05)

**Success Metric:** All Notes/Knowledge/Study features functional on mobile (iOS Safari, Android Chrome); IDE blocked with toast redirect

---

### Journey 5: Agent-Assisted Coding (AI Integration)

**Story:** As a developer, I want AI agents to implement features for me, so I can focus on business logic instead of boilerplate.

**Current State** [Evidence: ai-integration.yaml]:
- ✅ Agent factory with provider adapters (Anthropic, OpenRouter, OpenAI, Gemini)
- ✅ 11 tools (file ops, terminal, RAG, multimodal)
- ✅ Workspace permissions (agents available per workspace, tools enabled per workspace)
- ✅ Credential vault (AES-256-GCM encryption)
- ❌ God component: AgentConfigDialog.tsx (1,089 lines) - needs splitting
- ❌ Missing agent flags (deep think, memory) [feature-gaps.yaml:57]

**Happy Path:**
1. User opens ChatPanel in IDE workspace
2. Types: "Add a contact form with validation"
3. Agent reads current file context via `read_file` tool
4. Agent proposes changes (diff view)
5. User approves changes
6. Agent writes files via `write_file` tool
7. Agent runs `npm run lint` via `execute_command` tool
8. Editor and file tree auto-update with changes
9. Live preview shows new form

**Tool Permissions:**
- CRUD toggle per workspace [check-list-for-fundamental-truth.md item 7]
- File-level permissions for agent operations
- Approval workflow for destructive operations

> **📋 Reference:** [ADR-033 D7-D9] BYOK architecture, tool permissions, credential vault

**Evidence:**
- ChatPanel: `src/presentation/components/ide/AgentChatPanel.tsx` (650 lines) ✅
- Agent factory: `src/lib/agent/factory.ts` ✅
- File tools: `src/lib/agent/tools/` (11 tools) ✅
- Tool approvals: `src/presentation/components/chat/ApprovalOverlay.tsx` ✅
- Workspace permissions: `src/lib/agent/workspace-permission-manager.ts` ✅

**Broken Steps** [Evidence: comprehensive-diagnostic-report.md]:
- ❌ P0 CRIT-009: BYOK system incomplete (vault exists but providers use `hasApiKey: boolean` only)
- ❌ Three different AI invocation patterns (architectural disjoint)
- ❌ God component: AgentConfigDialog.tsx (1,089 lines)

**Success Metric:** Agent correctly implements feature without user intervention > 90% of time

---

### Journey 6: Cross-Workspace Operations (State Sync)

**Story:** As a user, I want to work seamlessly across workspaces with consistent state, so I can switch between coding, notes, and learning without friction.

**Key Requirements:**
1. **State Scoping:** `[projectId+workspaceId]` composite key [ADR-033 D6]
2. **Hydration:** `waitForHydration()` before workspace render [ADR-034 D12]
3. **Reactivity:** Hot-reload across workspaces when files change
4. **Persistence:** Clear Dexie vs Zustand boundaries [ADR-033 D5]

**Happy Path:**
1. User in IDE workspace edits file
2. File change detected via File System Observer or polling
3. Dexie state updated (if FSA project)
4. Zustand UI state updated (session-only)
5. User switches to Notes workspace
6. waitForHydration() ensures data ready
7. Notes workspace loads with consistent state
8. User references IDE file from Notes via cross-workspace RAG

> **📋 Reference:** [ADR-033 D5] State Management Boundaries, [ADR-034 D11] State scoping, [ADR-034 D12] Route loading

**State Boundaries:**

| State Type | Storage | Lifetime | Examples |
|------------|---------|----------|----------|
| UI State | Zustand | Session | Active file, panel sizes, chat input |
| Persistent State | Dexie | Forever | Notes, projects, credentials, threads |
| FSA Handles | Dexie | Forever | Directory handles for desktop restore |
| Composite Key | Both | Per workspace | `[projectId+workspaceId]` scope |

**Broken Steps:**
- ❌ STATE-001 through STATE-012: State scoping issues [ADR-034]
- ❌ Race conditions in route loading [ADR-034 D12]
- ❌ Inconsistent hydration patterns

**Success Metric:** Workspace switch < 500ms with consistent state

---

### Journey 7: Settings & Configuration (BYOK)

**Story:** As a user, I want to configure AI providers and manage my API keys securely, so I can use my preferred models with full control.

**Current State** [Evidence: ai-integration.yaml]:
- ✅ Credential vault implementation (AES-256-GCM encryption)
- ✅ Provider adapters (Anthropic, OpenRouter, OpenAI, Gemini)
- ❌ BYOK integration incomplete (vault unused by providers)
- ❌ Provider store: 396 lines - god store needs splitting

**Happy Path:**
1. User opens Settings → AI Providers
2. Clicks "Add API Key" for Gemini
3. Enters API key (masked input)
4. Key encrypted via AES-256-GCM, stored in vault
5. User selects Gemini as active provider
6. Agent uses key from vault for API calls
7. User can disable/revoke keys anytime

> **📋 Reference:** [ADR-033 D7-D9] BYOK architecture, credential vault, provider integration

**BYOK Requirements:**
- AES-256-GCM encryption for all keys [ADR-033 D8]
- Provider-agnostic key storage [ADR-033 D7]
- Conditional key selection per workspace/use case [ADR-033 D9]
- TanStack AI SDK integration [check-list-for-fundamental-truth.md]

**Broken Steps:**
- ❌ P0 CRIT-009: Providers only use `hasApiKey: boolean`, no actual key storage
- ❌ P0 CRIT-010: Vault exists but providers don't call it

**Success Metric:** Users can successfully configure and use custom API keys

---

## Functional Requirements

### Core Features (Existing - Validated ✅)

**1. Browser-Based IDE** [Evidence: scan-summary.md, component-inventory.yaml]
- Monaco editor integration (multi-tab, syntax highlighting, 20+ languages)
  - File: `src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx` (420 lines) ✅
- File tree with drag-drop support
  - File: `src/presentation/components/ide/FileTree/FileTree.tsx` (380 lines) ✅
- Integrated terminal (xterm.js)
  - File: `src/presentation/components/ide/XTerminal.tsx` (310 lines) ✅
- Live preview panel (hot-reload iframe)
  - File: `src/presentation/components/ide/PreviewPanel/` ✅
- Resizable panel layout
  - File: `src/presentation/components/layout/IDELayout.tsx` ✅
- **Health Score:** 9/10 [HIGH confidence]

**2. WebContainer Integration** [Evidence: roadmap.md Phase 1 ✅]
- Node.js runtime in browser
  - File: `src/lib/webcontainer/manager.ts` ✅
- Cross-origin isolation headers (COOP/COEP)
  - File: `vite.config.ts` (crossOriginIsolationPlugin FIRST) ✅
- File system operations (readFile, writeFile, readdir, rm, mkdir)
  - File: `src/lib/webcontainer/filesystem.ts` ✅
- Process management (spawn, kill, shell)
  - File: `src/lib/webcontainer/process.ts` ✅
- **Health Score:** 10/10 [HIGH confidence]

**3. Local Filesystem Sync** [Evidence: roadmap.md Phase 1 ✅]
- File System Access API integration (desktop only)
  - File: `src/lib/filesystem/adapters/LocalFSAdapter.ts` ✅
- Dual sync (Local FS ↔ WebContainers)
  - File: `src/lib/filesystem/sync/SyncManager.ts` ✅
- Sync exclusions (.git, node_modules, .DS_Store)
  - File: `src/lib/filesystem/sync/exclusions.ts` ✅
- Sync status UI (idle/syncing/error indicators)
  - File: `src/presentation/components/ide/SyncStatusIndicator.tsx` ✅
- **Health Score:** 8/10 [HIGH confidence]

> **⚠️ Note:** FSA handle persistence via Dexie [ADR-033 D10]

**4. Agent System** [Evidence: ai-integration.yaml, scan-summary.md]
- Provider adapters (Anthropic, OpenRouter, OpenAI, Gemini)
  - File: `src/lib/agent/providers/` ✅
- Tool registry (11 tools: file, terminal, RAG, multimodal)
  - File: `src/lib/agent/tools/` ✅
- Workspace permissions (agent availability per workspace)
  - File: `src/lib/agent/workspace-permission-manager.ts` ✅
- Tool permissions (enable/disable per workspace)
  - File: `src/presentation/components/agent/WorkspacePermissionEditor.tsx` ✅
- Credential vault (AES-256-GCM encryption)
  - File: `src/lib/agent/providers/credential-vault.ts` ✅
- Agent configuration dialog
  - File: `src/presentation/components/agent/AgentConfigDialog.tsx` (1,089 lines - GOD COMPONENT) ⚠️
- **Health Score:** 7/10 (god component needs splitting) [MEDIUM confidence]

**5. Multi-Workspace Architecture** [Evidence: component-inventory.yaml, scan-summary.md]
- IDE workspace (code execution, desktop only)
  - File: `src/routes/ide.$projectId.tsx` ✅
- Knowledge workspace (RAG, notes)
  - File: `src/routes/knowledge.$projectId.lazy.tsx` ✅
- Notes workspace (document sync)
  - File: `src/routes/notes.$projectId.lazy.tsx` ✅
- Study workspace (flashcards, quizzes)
  - File: `src/routes/study.$projectId.lazy.tsx` ✅
- Workspace switcher (mobile: bottom nav bar, desktop: sidebar)
  - File: `src/presentation/components/layout/BottomTabBar.tsx` ✅
- Workspace-aware state management
  - File: `src/infrastructure/persistence/stores/workspace/` ✅
- **Health Score:** 8/10 [HIGH confidence]

---

### Core Features (Existing - Broken ❌) [UPDATED: 2026-01-22]

**1. BYOK (Bring Your Own Key) System** [Evidence: comprehensive-diagnostic-report.md]

**Status:** ⚠️ VAULT EXISTS BUT UNUSED

- Vault implementation: `src/lib/agent/providers/credential-vault.ts` (529 lines) ✅
- Provider store integration: `src/infrastructure/persistence/stores/providers/provider-credentials-slice.ts` (396 lines - GOD STORE) ⚠️
- **P0 CRIT-009:** Providers only use `hasApiKey: boolean`, no actual key storage
- **P0 CRIT-010:** Vault exists but providers don't call it
- **Impact:** Users cannot actually use custom API keys
- **Evidence:** [comprehensive-diagnostic-report.md:68-75]
- **Remediation:** Integrate vault with providers (2 days estimated) [comprehensive-diagnostic-report.md:125]
- **Confidence:** HIGH

> **📋 Reference:** [ADR-033 D7-D9] BYOK architecture requirements

**2. Error Boundaries** [Evidence: comprehensive-diagnostic-report.md]

**Status:** ⚠️ 22.2% COVERAGE (CRITICAL)
- Overall coverage: 113/510 components wrapped
- Route coverage: 5/22 routes protected
- **P0 CRIT-005:** Missing error boundaries on workspace routes
  - `/notes` - No ErrorBoundary
  - `/knowledge` - No ErrorBoundary
  - `/study` - No ErrorBoundary
- **P0 CRIT-001:** Missing `useProjectStats` export causes WSOD in Settings/Study
- **Impact:** White Screen of Death across major user flows
- **Evidence:** [comprehensive-diagnostic-report.md:79-82]
- **Remediation:** Add ErrorBoundaries to all workspace routes (1 hour) [comprehensive-diagnostic-report.md:97]
- **Confidence:** HIGH

**3. Workspace Access** [Evidence: comprehensive-diagnostic-report.md]

**Status:** ⚠️ REDIRECT LOOP VULNERABILITY
- File: `src/lib/workspace/workspace-access-helper.tsx` (524 lines - GOD FILE)
- **P0 CRIT-007:** No redirect loop prevention mechanism
- **P0 CRIT-008:** Race condition risk (5 parallel useEffect hooks)
- **Impact:** Infinite redirect loops, navigation failures
- **Evidence:** [comprehensive-diagnostic-report.md:60-67]
- **Remediation:** Add redirect loop prevention flags (1 hour) [comprehensive-diagnostic-report.md:109]
- **Confidence:** HIGH

> **📋 Reference:** [ADR-034] Workspace Access Infection Remediation (31 infection points)

**4. AI Service Unification** [Evidence: ADR-033/034/035]

**Status:** ⚠️ ARCHITECTURAL DISJOINT
- **Problem:** Three different AI invocation patterns
  1. Full Agent System (ChatPanel → /api/chat) ✅ Proper but complex
  2. Notes AI Service (note-ai-service → Direct API) ❌ Bypasses unified system
  3. Hardcoded Features (VoiceRecordButton → Direct API) ❌ Security risk
- **Impact:** Inconsistent behavior, permission bypasses, security vulnerabilities
- **Evidence:** [ADR-025:12-20] (superseded by ADR-033/034/035)
- **Remediation:** Implement AgentExecutionService (10 weeks estimated)
- **Confidence:** HIGH

> **📋 Reference:** [ADR-033 D7-D9] Unified AI service architecture requirements

---

### Storage Requirements [UPDATED: 2026-01-22]

> **⚠️ CRITICAL:** LocalStorage is DEPRECATED. Use Dexie only for persistent storage per [ADR-035 Part 1].

**Storage Stack:**
| Platform | Storage Type | Implementation |
|----------|--------------|----------------|
| **Desktop** | FSA (File System Access API) | Direct file operations |
| **Mobile/Tablet** | IndexedDB (Dexie) | No FSA support |
| **FSA Handles** | IndexedDB (Dexie) | Persist directory handles [ADR-033 D10] |
| **UI State** | Zustand | Session-only |

> **📋 Reference:** [ADR-033 D1-D4] Storage selection per platform, [ADR-035 Part 1] Storage layer standardization

**StorageGateway Abstraction** [ADR-033 D2-D3]:
```typescript
interface StorageGateway {
  read(path: string): Promise<Uint8Array>;
  write(path: string, data: Uint8Array): Promise<void>;
  delete(path: string): Promise<void>;
  list(path: string): Promise<FileEntry[]>;
  exists(path: string): Promise<boolean>;
  watch(callback: FileChangeCallback): () => void;
}

// Factory creates appropriate gateway based on platform
const gateway = StorageGatewayFactory.create(project.storageType);
```

**Dexie Schema (Required):**
- `projects`: id, name, storageType, workspaceBindings, createdAt
- `notes`: id, projectId, content, blocks, metadata
- `threads`: id, projectId, workspaceId, messages
- `providers`: id, name, encryptedKey, model, settings
- `fsaHandles`: id, projectId, handle (serialized)

> **📋 Reference:** [ADR-033 D6] Composite key pattern `[projectId+workspaceId]`

---

### Route Loading Patterns [UPDATED: 2026-01-22]

> **📋 Reference:** [ADR-034 D12] Route loading standards

**Standard Route Pattern:**
```typescript
// loader for data fetching
const loader = async ({ params, context }) => {
  await waitForHydration(); // Ensure Dexie ready
  const project = await db.projects.get(params.projectId);
  if (!project) throw redirect('/hub');
  return { project };
};

// beforeLoad for platform guards
const beforeLoad = async ({ context, params }) => {
  const platform = getPlatformContract();
  if (params.workspace === 'ide' && !platform.canAccessFSA) {
    toast.error('IDE requires desktop browser');
    return redirect(`/notes/${params.projectId}`);
  }
};
```

**Platform Guards Distribution** [ADR-034 D13]:
| Route | Desktop | Mobile | Tablet |
|-------|---------|--------|--------|
| `/ide/$projectId` | ✅ Full access | ❌ Blocked | ❌ Blocked |
| `/notes/$projectId` | ✅ Full access | ✅ Full access | ✅ Full access |
| `/knowledge/$projectId` | ✅ Full access | ✅ Full access | ✅ Full access |
| `/study/$projectId` | ✅ Full access | ✅ Full access | ✅ Full access |

---

## Technical Architecture [UPDATED: 2026-01-22]

> **📋 Reference:** [ADR-033] Canonical Architecture, [ADR-034] Infection Registry, [ADR-035] Standards

### Current State [Evidence: scan-summary.md, ADR-033/034/035]

**Architecture Compliance:**
- **ADR-033/034/035 (Canonical):** ~50% compliant (not 70%)
- December 2025 Zustand Patterns: ~50% compliant (not 70%)
- Workspace Awareness: 100% compliant

> **⚠️ CORRECTION:** Previous claims of 70% Clean Architecture compliance were incorrect. Actual compliance is approximately 50% based on architecture.md correction and 130+ layer violations identified.

**Technology Stack:**
- **Frontend:** React 19 + TanStack Router + TanStack Start + TanStack AI
- **UI Components:** Radix UI primitives + shadcn/ui
- **Styling:** Tailwind CSS (8-bit dark theme, no glassmorphism)
- **State Management:** Zustand v5 (slice pattern, persist) + Dexie.js
- **Persistence:** Dexie (IndexedDB) **ONLY** - LocalStorage DEPRECATED [ADR-035]
- **Code Execution:** WebContainers API (browser-based Node.js)
- **File System:** File System Access API (desktop) / IndexedDB (mobile)
- **Terminal:** xterm.js
- **Editor:** Monaco Editor
- **Localization:** react-i18next (EN/VI)

> **⚠️ Storage Correction:** LocalStorage is DEPRECATED. Use Dexie for all persistent storage per [ADR-035 Part 1].

### PlatformContract Interface [UPDATED: 2026-01-22]

> **📋 Reference:** [ADR-033 D1] getPlatformContract() specification

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

### StorageGateway Abstraction [UPDATED: 2026-01-22]

> **📋 Reference:** [ADR-033 D2-D3] Storage layer specification

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

### State Management Boundaries (ADR-033 D5)

Via-Gent uses a two-layer state management architecture with clear responsibilities:

**Zustand** (Reactive UI State)
- Current active file path
- UI panel states (open/closed, sizes)
- Temporary selection state
- Chat input state (draft messages)
- Loading/error indicators
- **Lifetime:** Session-only (cleared on page refresh)

**Dexie IndexedDB** (Persistent Storage)
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

**Rule:** Always persist to Dexie before updating Zustand. This prevents data loss if the state update fails or the page refreshes.

**Hydration Strategy:**
- Wait for Dexie hydration before rendering workspace UI [ADR-034 D12]
- Show loading state during hydration
- Handle hydration errors gracefully (show toast, allow retry)

### File Structure (Canonical)

```
src/
├── routes/                  # TanStack Router file-based routes
│   ├── __root.tsx          # Root layout
│   ├── index.tsx           # Hub entry
│   ├── ide.$projectId.tsx  # IDE route (desktop only)
│   └── notes.$projectId.lazy.tsx
│
├── presentation/            # React UI ONLY
│   ├── components/         # UI components (592 files)
│   │   ├── ui/             # Design system primitives
│   │   ├── ide/            # IDE-specific
│   │   ├── notes/          # Notes-specific
│   │   ├── knowledge/      # Knowledge-specific
│   │   └── study/          # Study-specific
│   └── hooks/              # React hooks (UI concerns only)
│
├── domain/                  # Business Logic ONLY
│   ├── entities/            # Domain entities
│   ├── services/            # Domain services
│   └── interfaces/          # Repository interfaces
│
├── infrastructure/          # External Interfaces ONLY
│   ├── persistence/
│   │   ├── stores/         # Zustand stores (179 stores)
│   │   └── dexie-db.ts     # Single DexieDB instance
│   ├── filesystem/         # File system adapters
│   │   ├── StorageAdapterFactory.ts
│   │   └── fsa-storage-adapter.ts
│   └── events/             # Event bus
│
└── lib/                     # DEPRECATED - Migrate to above
    └── utils.ts            # Keep only utilities
```

> **📋 Reference:** [ADR-033] Canonical directory structure

### Quality Metrics [UPDATED: 2026-01-22]

| Metric | Current | Target |
|--------|---------|--------|
| **Total Components** | 592 | 592 |
| **Total Stores** | 179 (28,902 lines) | 179 (refactored) |
| **God Stores** | 12 [ADR-034 STATE infections] | 0 |
| **God Components** | 1 >1000 lines | 0 |
| **Test Coverage** | 60-70% | 80%+ |
| **Error Boundary Coverage** | 22.2% | 80%+ |
| **TypeScript Errors** | Unknown (stale) | 0 |
| **Overall Completion** | ~30-40% | 80-90% |

> **⚠️ CORRECTION:** God stores count is 12 (per ADR-034 Infection Registry), not 8-9 as previously documented.

**Critical Issues** [Evidence: ADR-034, ADR-035]:
- 31 infection points requiring remediation (5 phases)
- 3 P0 bugs blocking all user journeys (ADR-035)
- 12 god stores needing refactoring (STATE-001 through STATE-012)
- 22.2% error boundary coverage

---

## Chrome Version Requirements [UPDATED: 2026-01-22]

> **📋 Reference:** [ADR-035 Part 2] Chrome version handling

| Feature | Minimum Chrome Version | Notes |
|---------|----------------------|-------|
| **Persistent FSA Permissions** | Chrome 122+ | "Allow on every visit" option |
| **Structured Clone Optimization** | Chrome 129+ | Required for FSA handle serialization |
| **File System Observer** | Chrome 129+ | Native file watching (fallback: polling) |

**Feature Detection:**
```typescript
function checkChromeVersion(): {
  supportsPersistentPermissions: boolean;
  supportsStructuredClone: boolean;
  supportsFileSystemObserver: boolean;
} {
  const ua = navigator.userAgent;
  const match = ua.match(/Chrome\/(\d+)/);
  const version = match ? parseInt(match[1]) : 0;
  
  return {
    supportsPersistentPermissions: version >= 122,
    supportsStructuredClone: version >= 129,
    supportsFileSystemObserver: version >= 129,
  };
}
```

---

## Non-Functional Requirements

### Performance [Evidence: mission.md:123, market-research.md]

**Response Time Targets:**
- Page load: < 2 seconds (currently: 2-3 seconds)
- File operations: < 100ms (currently: 50-200ms)
- Agent response: < 5 seconds to first token (streaming)
- Workspace switch: < 500ms (currently: 200-800ms)
- WebContainer boot: 3-5 seconds (acceptable, browser-based Node.js)

**Resource Limits:**
- Bundle size: < 2MB (currently: 1.5MB gzipped)
- Memory usage: < 500MB (currently: 300-400MB)
- IndexedDB quota: < 50MB (currently: 20-30MB)

---

### Security [Evidence: market-research.md:92-106, comprehensive-diagnostic-report.md:68-75]

**OWASP Top 10 for Agentic Applications** [HIGH confidence]:

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
- ✅ Workspace permission manager (agent availability, tool permissions)
- ✅ Trust levels (auto/prompt/block)
- ✅ Tool approval workflows (ApprovalOverlay component)
- ❌ P0: BYOK incomplete (vault exists but unused)
- ❌ P0: Hardcoded providers bypass permission system [ADR-025:19]

---

## Success Metrics [UPDATED: 2026-01-22]

### Product Metrics (OKRs)

**Objective 1: Eliminate P0/P1 Blockers (ADR-034/035 Remediation)**
- **Key Result 1.1:** Fix all 31 infection points (5 phases, 31 stories) - 90% crash reduction
- **Key Result 1.2:** Fix all 3 P0 bugs blocking user journeys (ADR-035)
- **Key Result 1.3:** Achieve 80%+ error boundary coverage (currently: 22.2%)
- **Key Result 1.4:** Reduce god stores from 12 to 0 (STATE-001 through STATE-012)
- **Timeline:** 8-12 weeks (5 phases)

**Objective 2: Complete Feature Set to 80-90%**
- **Key Result 2.1:** Implement 5 missing features (Markdown parser, agent flags, Monaco features, analytics, git basics)
- **Key Result 2.2:** Complete unified AI service architecture (ADR-033/034/035)
- **Key Result 2.3:** Launch production-ready feature set
- **Timeline:** 8-12 weeks

### Quality Metrics [UPDATED: 2026-01-22]

**Code Quality:**
- **God Files:** 0 files >300 lines (currently: 19+)
- **Test Coverage:** 80%+ (currently: 60-70%)
- **TypeScript Errors:** 0 in production code (count unknown - stale)
- **Error Boundary Coverage:** 80%+ (currently: 22.2%)
- **Bundle Size:** <2MB gzipped (currently: 1.5MB - maintain)

**Architecture Compliance:**
- **ADR-033/034/035:** 100% (currently: ~50%)
- **State Management Boundaries:** Clear Dexie vs Zustand (currently: unclear)
- **Platform Contract:** Fully implemented (currently: partial)

---

## Dependencies & Risks

### Technical Dependencies

**Critical Path Dependencies:**
1. **Platform Contract (ADR-033 D1)** → All platform-aware features
2. **StorageGateway (ADR-033 D2-D3)** → All persistence
3. **FSA Handle Persistence (ADR-033 D10)** → Desktop session restore
4. **waitForHydration() (ADR-034 D12)** → Route loading stability

**External Dependencies:**
- **TanStack AI:** Streaming responses, tool integration (actively maintained)
- **TanStack Start:** Full-stack React framework (v1.0+)
- **WebContainers API:** Browser-based Node.js (StackBlitz, stable)
- **File System Access API:** Local filesystem integration (W3C standard, evolving)
- **xterm.js:** Terminal emulation (stable, mature)
- **Monaco Editor:** Code editing (Microsoft, stable)
- **Dexie:** IndexedDB wrapper (stable, mature)
- **Radix UI:** Component primitives (actively maintained)

---

## Appendix: ADR References

### Authoritative Architecture Documents

| ADR | Title | Status | Key Decisions |
|-----|-------|--------|---------------|
| **ADR-033** | Correct Course Architectural Remediation | APPROVED | PlatformContract, StorageGateway, FSA persistence |
| **ADR-034** | Workspace Access Infection Remediation | APPROVED | 31 infection points, 5 remediation phases |
| **ADR-035** | Architecture Standardization v2 | APPROVED | Chrome 122+/129+ requirements, 3 P0 bugs |

### ADR-034 Infection Registry Summary

| Phase | Infections | Focus |
|-------|------------|-------|
| **Phase 1** | 6 | Hooks, hydration, state scoping |
| **Phase 2** | 7 | Route loading race conditions |
| **Phase 3** | 6 | FSA handle persistence |
| **Phase 4** | 7 | State scoping by workspace |
| **Phase 5** | 5 | Platform guards |

> **Full Details:** See `_bmad-output/planning-artifacts/adr/ADR-034-workspace-access-infection-remediation-2026-01-17.md`

---

## Document Change Log [UPDATED: 2026-01-22]

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-07 | 1.0.0 | Initial draft |
| 2026-01-22 | 1.1.0 | **Major Update:** Fixed false completion claims, added ADR references, updated storage to Dexie-only, added PlatformContract interface, corrected god store count (12), updated 7 user journeys |

**Changes in v1.1.0:**
1. ✅ Executive Summary: Corrected 70% → ~30-40% completion
2. ✅ Executive Summary: Added reference to 31 infection points
3. ✅ Added ADR-033/034/035 references at document start
4. ✅ Problem Statement: Updated storage to Dexie-only (no LocalStorage)
5. ✅ Problem Statement: Added Platform-Aware Entry matrix
6. ✅ User Stories: Expanded to 7 documented use cases
7. ✅ Journey 4: Clarified IDE is NOT available on mobile
8. ✅ Functional Requirements: Removed LocalStorage references
9. ✅ Added StorageGateway abstraction requirement
10. ✅ Added Chrome version requirements (122+, 129+)
11. ✅ Technical Architecture: Updated compliance to ~50%
12. ✅ Added PlatformContract interface documentation
13. ✅ Updated god stores count: 8-9 → 12
14. ✅ Updated error boundary coverage: "in progress" → 22.2%
15. ✅ Added Route Loading Patterns section
16. ✅ Added Platform Guards Distribution section

---

*Document generated by Team B Phase 1 - Task 1.2: Update PRD Working Copy*
*Output: `_bmad-output/planning-artifacts/team-b-phase-1/prd-working-copy.md`*
