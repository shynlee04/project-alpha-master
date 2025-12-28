---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/docs/2025-12-28/correct-course/knowledge-synthesis-proposal-2025-12-28.md
  - _bmad-output/docs/2025-12-28/correct-course/ux-ui-knowledge-synthesis-proposal-2025-12-28.md
  - docs/2025-12-26/concept-for-knowledge-synthesis-station-2025-12-26.md
  - _bmad-output/cis/knowledge-synthesis-station-concept-2025-12-26.md
  - _bmad-output/docs/2025-12-28/version-2/implementation-roadmap.md
  - _bmad-output/docs/2025-12-28/version-2/technical-architecture-document.md
  - _bmad-output/docs/2025-12-28/version-2/remediation-epics.md
  - _bmad-output/docs/index.md
  - _bmad-output/docs/project-overview-2025-12-28.md
  - _bmad-output/docs/architecture-analysis-2025-12-28.md
documentCounts:
  briefs: 0
  research: 7
  brainstorming: 1
  projectDocs: 10
workflowType: 'prd'
lastStep: 4
project_name: 'Project Alpha v2.0 - Knowledge Synthesis Station'
user_name: 'Admin'
date: '2025-12-28'
---

# Product Requirements Document - Project Alpha v2.0

**Knowledge Synthesis Station**

**Author:** Admin  
**Date:** 2025-12-28  
**Version:** 2.0  
**Status:** Draft  

---

## Executive Summary

### Product Vision

**Project Alpha v2.0 - Knowledge Synthesis Station** transforms the existing Via-gent browser-based IDE into a **Universal Knowledge Platform** that serves both developers and learners. It merges the structured creativity of **Notion** with the AI synthesis power of **NotebookLM**, powered by a privacy-first, local-first architecture that works entirely in the browser.

### The Strategic Pivot

| FROM (Via-gent v1.0) | TO (Project Alpha v2.0) |
|----------------------|-------------------------|
| "Run Node.js in the browser" | "Synthesize Knowledge in the browser" |
| WebContainer-centric IDE | RAG-centric Knowledge Platform |
| Developer-only target | Developers + Students + Teachers |
| Desktop-only experience | Unified Desktop + Mobile experience |

### Core Problem Statement

Modern knowledge workers face a **synthesis tax**: gathering information from multiple sources and transforming it into actionable knowledge requires hours of manual effort. Existing solutions either:
- Require cloud lock-in and always-online connectivity (NotebookLM, ChatGPT)
- Offer beautiful structure but passive, manual knowledge management (Notion)
- Provide AI chat but ephemeral, ungrounded responses without persistence
- Are English-first with poor Vietnamese language support

**Project Alpha solves this with a radical approach:** a browser-based, offline-capable AI agent that understands your sources through RAG, synthesizes knowledge into persistent blocks, and works across both desktop and mobile with full Vietnamese language support.

### What Makes This Special

1. **Unified Multi-Surface Experience** — Desktop Creator Studio and Mobile Knowledge Reader share the same agent conversation cascade, coexisting seamlessly with the IDE workspace
2. **AI Agent That Actually Understands** — RAG-powered retrieval with grounded citations, proactive suggestions, and persistent outputs (not ephemeral chat)
3. **Notion-Like Notes with LLM Intelligence** — Block-based editing meets AI synthesis in a local-first architecture
4. **Local-First Privacy** — 100% browser-based, offline-capable, no cloud dependency for core features
5. **Vietnamese-First, Global-Ready** — Built for the Vietnamese EdTech market (25% CAGR) with full i18n architecture

### Target Users

| User | Profile | Key Pain Point | Success Metric |
|------|---------|----------------|----------------|
| **Minh** | Grade 11 student, 16-18 | Can't connect concepts across 5+ textbooks | Time to insight < 60 seconds |
| **Thảo** | University student, 20-24 | Drowning in research papers | Synthesis table from 10 sources |
| **Cô Lan** | High school teacher, 30-45 | Manual work to create engaging materials | Lesson → Quiz in < 5 minutes |
| **Dev** | Developer, 25-40 | Project planning and research across codebases | Codebase → Architecture understanding |

### Phased Approach

**Phase 1: Core Stabilization (This PRD Focus)**
- Stabilize agent system and conversation cascade
- Unify state management (Zustand + Dexie)
- Implement mobile-first responsive layout
- Fix API management and provider configuration
- Establish foundation for extensibility

**Phase 2: Knowledge Synthesis MVP (Future PRD)**
- Source ingestion pipeline (PDF, URL, YouTube, audio)
- Orama WASM vector store integration
- RAG-powered chat with grounded citations
- Knowledge canvas with React Flow
- Study artifact generation (flashcards, quizzes, audio)

---

## Project Classification

**Technical Type:** Web Application (PWA/SPA) + Developer Tool (Hybrid)  
**Domain:** EdTech (Education Technology)  
**Complexity:** Medium  
**Project Context:** Brownfield - extending existing Via-gent codebase with incremental refactoring  

### Classification Rationale

This project sits at the intersection of **EdTech** and **Developer Tools**, requiring:
- **EdTech Concerns:** Student privacy considerations, accessibility standards, content quality
- **Developer Tool Concerns:** API design, extensibility architecture, tooling ecosystem
- **Hybrid Concerns:** Unified experience across learning and development workflows

### Technology Strategy

**Retain & Extend (Brownfield Approach):**
- React 19 + TypeScript + TanStack ecosystem
- Zustand + Dexie.js (unified state management)
- Monaco Editor + xterm.js (IDE features)
- TanStack AI + existing agent infrastructure
- WebContainer API (desktop only)
- Tailwind CSS + Radix UI

**Incremental Additions (Phase 2):**
- Orama (WASM Vector Store - mobile compatible)
- pdf.js + mammoth.js (client-side document parsing)
- React Flow (knowledge graph visualization)
- JSZip (.alpha pack creation)

---

## Success Criteria

### User Success

#### Phase 1: Core Stabilization (Current Focus)

**Agent Configuration Success:**

| Metric | Target | Current Status | Validation Method |
|--------|--------|----------------|-------------------|
| Configuration time | < 2 minutes | ✅ Achieved | User session timing |
| Configuration persistence | 100% across sessions | ✅ Achieved | E2E restoration tests |
| Multi-agent management | No user confusion | ✅ Achieved | UX testing |

**State Management Success:**

| Metric | Target | Current Status | Validation Method |
|--------|--------|----------------|-------------------|
| Zero data loss | 0 incidents in 1000 sessions | ⚠️ Needs validation | Session restoration tests |
| Immediate UI updates | < 100ms state → UI | ✅ Achieved | Performance testing |
| Session restoration | 99%+ success rate | ✅ Achieved | FSA handle + IndexedDB tests |

**Mobile Experience Success:**

| Metric | Target | Status | Notes |
|--------|--------|--------|-------|
| Responsive layout | Works on tablet+ viewports | ✅ Achieved | Tailwind responsive patterns |
| WebContainer on mobile | N/A | ❌ Desktop-only | SharedArrayBuffer requires desktop browsers |
| Progressive degradation | Graceful mobile fallback | 🔄 Needs design | Show demo mode on mobile |

**Additional User Success Metrics:**
- **WebContainer boot reliability**: 95%+ success rate across cold starts
- **FSA permission re-grant**: >90% users successfully restore access on return visit
- **Time savings perception**: "I scaffolded a feature in 10 minutes vs. 2 hours"
- **Trust metric**: "I trust this tool won't lose my work"

#### Phase 2: Knowledge Synthesis (Future)

| Metric | Target | Rationale |
|--------|--------|-----------|
| Time to first insight | < 60 seconds from source upload | WOW factor |
| Sources per notebook | > 3 average | Engagement indicator |
| Grounded citations | 100% of AI responses | Trust and accuracy |
| Code understanding time | < 30 seconds to explain any function | Developer value |
| Refactor suggestions | Within 2 minutes of project analysis | AI usefulness |

---

### Business Success

#### 3-Month Milestones (End of Phase 1)

| Metric | Target | Validation Method |
|--------|--------|-------------------|
| **Technical Stability** | Zero P0 bugs in core flows | GitHub Issues analysis |
| **Developer Adoption** | 50 active developers using weekly | Analytics (page visits) |
| **Feature Completeness** | 14/14 validation steps pass | E2E test suite |
| **Documentation** | 100% of PRD requirements documented | Docs coverage report |
| **Beta Testimonials** | 5+ public testimonials | User outreach |

#### 12-Month Milestones (Mature Phase 2)

| Metric | Target | Rationale |
|--------|--------|-----------|
| **Active Users** | 500+ monthly active developers | Sustainable community |
| **D7 Retention** | >40% return rate | User value validation |
| **Vietnamese EdTech** | 10+ schools/bootcamps testing | Market-specific goal |
| **Project Diversity** | React, Vue, Svelte, Astro support | Broad applicability |
| **Revenue** (optional) | Pro tier @ $10/mo, $5K MRR | BYOK remains free |

---

### Technical Success

#### Performance Benchmarks

```typescript
const TECHNICAL_BENCHMARKS = {
  // Core Performance (from PRD NFR-PERF)
  webContainerBoot: { target: 5000, unit: 'ms', description: 'Boot time' },
  fileMount100Files: { target: 3000, unit: 'ms', description: '100 file mount' },
  devServerStart: { target: 30000, unit: 'ms', description: 'npm install + dev' },
  agentFirstToken: { target: 2000, unit: 'ms', description: 'TTFT' },
  previewHotReload: { target: 2000, unit: 'ms', description: 'HMR update' },
  fileSaveToDisk: { target: 500, unit: 'ms', description: 'FSA write' },
  
  // State Management
  fileSyncLatency: { target: 500, unit: 'ms', description: 'Local ↔ WebContainer sync' },
  indexedDBQueryTime: { target: 50, unit: 'ms', description: 'DB query' },
  stateRestorationTime: { target: 2000, unit: 'ms', description: 'Full session restore' },
}
```

#### Reliability Targets

| Dimension | Success Indicator | Target |
|-----------|-------------------|--------|
| **WebContainer Reliability** | Boot success rate | 99%+ |
| **File Sync Integrity** | Zero data loss | 100% |
| **State Management** | Schema versioned with migrations | ✅ |
| **Agent Tool Execution** | Tool call success rate | 95%+ |
| **Browser Compatibility** | Chrome 86+, Edge 86+, Safari 15.2+ | Verified |

#### Test Coverage Requirements

| Area | Target Coverage | Priority |
|------|-----------------|----------|
| File sync layer | 90%+ | P0 |
| State management (Zustand + Dexie) | 85%+ | P0 |
| Agent tools (file ops, terminal) | 80%+ | P0 |
| UI components | 70%+ | P1 |
| Overall codebase | 80%+ | P1 |

---

### Measurable Outcomes

#### Telemetry Requirements

The following analytics events must be implemented:

```typescript
// Success tracking events
analytics.track('webcontainer_boot', { duration_ms, success, error_type? });
analytics.track('fsa_permission_granted', { retry_count, time_to_grant_ms });
analytics.track('file_sync_completed', { file_count, duration_ms, direction });
analytics.track('agent_tool_execution', { tool_name, success, error?, duration_ms });
analytics.track('state_restoration', { success, data_size_kb, duration_ms });
analytics.track('user_session', { duration_min, actions_count, files_edited });
```

#### Health Check Dashboard

Real-time status page showing:
- WebContainer boot success rate (last 24h)
- FSA permission grant rate
- File sync error rate
- Agent tool success rate
- IndexedDB quota usage (% of limit)

---

### Red Flags & Mitigation

| Red Flag | Detection Threshold | Mitigation Strategy |
|----------|---------------------|---------------------|
| WebContainer boot failures | >5% | Retry logic + fallback error UI |
| FSA permission denials | >20% | Clearer explainer before prompt |
| File sync data loss | Any incident | Atomic writes + checksums |
| Agent tool failures | >10% | Better error recovery + user feedback |
| IndexedDB quota exceeded | >80% usage | Conversation pruning + export option |

---

## Product Scope

### MVP - Phase 1: Core Stabilization (This PRD)

**Must Have (P0):**

1. **Agent System Stability**
   - Multi-provider support (OpenRouter, Gemini, Anthropic)
   - Configuration persistence across sessions
   - Conversation cascade with tool execution

2. **State Management Foundation**
   - Unified Zustand + Dexie.js architecture
   - Zero data loss guarantee
   - Immediate UI reactivity

3. **Responsive Layout**
   - Mobile-responsive design (not mobile-first due to WebContainer constraint)
   - Progressive degradation with demo mode on mobile
   - Desktop-optimized IDE experience

4. **File System Reliability**
   - FSA permission lifecycle handling
   - Graceful re-grant flows
   - Sync integrity validation

5. **Developer Experience**
   - 14-step validation sequence passing
   - Error recovery with actionable messages
   - Performance benchmarks met

**Brownfield Adjustments:**
- Import existing GitHub projects in < 5 minutes
- Handle projects with 500+ files without degradation
- Agent refactors existing components successfully 70%+ of attempts

### Growth Features - Phase 2: Knowledge Synthesis (Post-MVP)

**High Priority (P1):**

1. **Source Ingestion Pipeline**
   - PDF parsing with pdf.js
   - URL content extraction
   - YouTube transcript import
   - Audio transcription

2. **Vector Store Integration**
   - Orama WASM for client-side RAG
   - Document chunking strategies
   - Semantic search < 200ms

3. **Grounded AI Responses**
   - Every response with [1][2] citations
   - Citation deep-links to source text
   - Persistent answer blocks

4. **Knowledge Canvas**
   - React Flow integration
   - Notion-like block editing
   - Source → Insight connections

**Medium Priority (P2):**

5. **Study Artifact Generation**
   - AI-generated flashcards
   - Quiz creation from sources
   - Summary blocks

6. **Audio Overview**
   - TTS integration for summaries
   - Vietnamese language support
   - Background listening mode

### Vision - Future (12+ Months)

**Long-term Features:**

1. **Team Collaboration**
   - Real-time multi-user editing
   - Shared notebooks
   - Permission management

2. **Publishing & Monetization**
   - .alpha pack export with encryption
   - Marketplace for educational content
   - License management

3. **Advanced AI Capabilities**
   - Multi-agent orchestration
   - Cross-modal reasoning (image, audio)
   - Custom agent personalities

4. **Platform Expansion**
   - PWA with offline-first
   - Desktop app (Electron/Tauri)
   - Mobile companion app (read-only)

---

## User Journeys

### Journey 1: Alex (Developer) — Reclaiming Project Flow

**The Hero:** Alex is a solo full-stack developer tired of "environment hell" and the 2-hour tax of setting up Docker or npm environments for quick fixes.
**The Pain:** Alex is skeptical of browser-based IDEs; they usually feel like toys that can't handle real production codebases.
**The Journey:**
1. **The Hook:** Alex lands on Project Alpha and sees "Open Local Project" with a clear trust-explainer about privacy and zero-cloud uploads.
2. **The Discovery:** Alex chooses their 300-file React project. They watch a progress bar that actually reports "Mounting 247 files... skipping node_modules."
3. **The Aha Moment #1:** Alex opens a file, types a console log, and immediately checks their local VS Code. The change is there. This is a real file-system bridge, not a playground.
4. **The Climax:** Alex asks the AI to "Add a logout button with specific logic." The AI doesn't just chat; it reads the source, proposes a diff, and upon approval, *writes the code directly to his local disk*. 
5. **The Resolution:** Alex realizes they can do 90% of their research and planning work from any browser without complex setup. Trust is established.

### Journey 2: Thảo (University Student) — Mastering Research Chaos

**The Hero:** Thảo is a senior university student currently drowning in 50+ research papers for her graduation thesis.
**The Pain:** She has highlights everywhere (Zotero, Notion, physical notes) but can't connect the dots between finding "A" in one paper and "B" in another.
**The Journey:**
1. **The Collection:** Thảo creates a "Thesis Notebook" and drags in 10 PDFs. Project Alpha parses them locally in seconds.
2. **The Dialogue:** She asks, "What are the conflicting views on [Topic] across these papers?"
3. **The Aha Moment:** The AI generates a synthesis table. Every claim has a [1][2] citation. She clicks [1], and the PDF viewer jumps exactly to the highlighted paragraph in the specific source.
4. **The Climax:** Thảo uses the "Knowledge Canvas" to drag her favorite AI-generated blocks into a visual map, connecting them with her own handwritten notes.
5. **The Resolution:** Thảo finishes her literature review in two nights instead of two weeks. Her knowledge isn't just stored; it's synthesized.

### Journey 3: The Returning Explorer — "Where Was I?"

**The Hero:** A user returning after 3 days to a complex project.
**The Pain:** Most web apps lose state or require re-auth and re-navigation, breaking the mental model.
**The Journey:**
1. **The Arrival:** The dashboard shows their recent project with a "Resume" button.
2. **The Re-Grant:** Because of browser security, they see a one-click "Restore Access" button. They select the same folder again.
3. **The Magic:** Instantly, the IDE restores exactly: Line 45 of App.tsx, the scroll position in the chat, and the half-finished terminal command.
4. **The Resolution:** The user feels that the tool "respects their time." There is no "startup tax" on subsequent visits.

### Journey 4: The Mobile Learner — The "Learner Companion"

**The Hero:** Minh (High school student) trying to review his notes on the bus using his phone.
**The Pain:** WebContainers and Monaco don't work on mobile browsers.
**The Journey:**
1. **The Landing:** Minh opens the app on his phone. A friendly banner says: "Welcome! Chat & Review works here. Editing requires a desktop."
2. **The Experience:** He enters "Demo Mode" with a mobile-optimized tab bar.
3. **The Interaction:** He can't edit code, but he can chat with the AI about his chemistry notes he uploaded earlier. He reviews flashcards generated by the agent.
4. **The Resolution:** Minh stays productive during his commute. He knows the "heavy lifting" happens at home on his PC, but his knowledge is always in his pocket.

---

### Journey Requirements Summary

These narrative arcs reveal critical capability requirements:

1. **Trust-First Onboarding:** Requires a "Pre-FSA Explainer" modal and visible progress indicators for file mounting and WebContainer booting.
2. **Dual-Sync File System:** Requires a robust bridge that writes to both the WebContainer and the Local File System in < 500ms.
3. **Local-First RAG Intelligence:** Requires client-side parsing (pdf.js) and vector storage (Orama) that creates deep-links to specific source chunks.
4. **State Persistence Engine:** Requires IndexedDB (Dexie) to store UI state (open tabs, scroll position) and FSA handles for seamless session restoration.
5. **Progressive Degradation (Mobile):** Requires a "Capability Detection" layer that toggles features based on `SharedArrayBuffer` availability and viewport size.
6. **Agent Tool Transparency:** Requires UI markers showing when the AI is reading or writing files, with explicit "Approve/Reject" gates for code changes.
