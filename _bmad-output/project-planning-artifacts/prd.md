---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
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
lastStep: 8
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

---

## Domain-Specific Requirements

### EdTech Compliance & Regulatory Overview

**Project Alpha v2.0** operates in the Vietnamese EdTech market, prioritizing **Local-First Privacy** to exceed typical regional requirements. While the project follows a "Solo Dev / Open-Source" delivery model, it adheres to the spirit of **Vietnamese Decree 13/2023/ND-CP** by ensuring 100% user control over data flows.

### Key Domain Concerns

| Concern | Solo-Dev Implementation Strategy |
|---------|---------------------------------|
| **Student Privacy** | Local-first file storage + BYOK (Bring Your Own Key) model ensures the developer never sees user data. |
| **Accessibility** | Focus on keyboard navigation and contrast ratios to support learners with diverse needs. |
| **Content Safety** | Grounded RAG citations [1][2] to mitigate AI hallucinations in educational materials. |
| **Curriculum Alignment** | Community-driven tagging system for subjects, grade levels, and exam preparation. |

### Compliance Requirements

| ID | Requirement | Priority | Implementation |
|----|-------------|----------|----------------|
| **EDU-PRIV-01** | Privacy banner on first use explaining external AI providers | P0 | Phase 1 |
| **EDU-PRIV-02** | "Clear All Data" button for local IndexedDB/State | P0 | Phase 1 |
| **EDU-PRIV-03** | Privacy Shield mode (regex-based PII redaction) | P1 | Phase 2 |
| **EDU-A11Y-01** | Keyboard-only navigation audit (A) | P0 | Phase 1 |
| **EDU-A11Y-02** | Color contrast validation 4.5:1 ratio (AA) | P0 | Phase 1 |
| **EDU-A11Y-03** | ARIA labels on all interactive/icon elements | P0 | Phase 1 |

### Industry Standards & Best Practices

1. **WCAG 2.1 Level AA:** Target standard for the primary Creator Studio interface.
2. **Grounded RAG (Source Grounding):** Mandatory citation requirement for all AI-generated educational content to ensure factual accuracy.
3. **Local-First Software:** Adherence to "offline-capable" and "user-owned-data" principles defined by Ink & Switch.

### Required Expertise & Validation

- **Community Validation:** Rely on teachers (Cô Lan persona) to review and tag "Verified" notebooks.
- **User Responsibility Model:** Explicit disclaimers for AI-generated quizzes/lessons requiring teacher review before classroom use.

### Implementation Considerations

**Phase 1 Effort (Core Stabilization): ~10 Days**
- Primarily focused on accessibility boilerplate and basic privacy controls (banners/clear state).

**Phase 2 Effort (Knowledge Synthesis): ~20 Days**
- Focused on the citation engine (source grounding), Privacy Shield redaction, and the curriculum tagging UI.

---

## Innovation & Differentiation

### Core Innovation Thesis

> **"AI-powered knowledge work doesn't require cloud infrastructure or sacrificing privacy—and a solo developer can prove it."**

**Project Alpha v2.0** is a **technical showcase** that challenges the assumption that complex AI + developer tooling requires cloud infrastructure or corporate backing. As an open-source project by a solo developer, it proves that modern browser APIs (WebContainers, WASM, File System Access) enable experiences previously reserved for enterprise SaaS.

### What Sacred Cow Is Being Challenged?

| Industry Assumption | Project Alpha's Counter-Thesis |
|---------------------|-------------------------------|
| "AI assistants require cloud servers" | BYOK model - users bring their own API keys, no proxy server |
| "Real IDEs need native apps" | WebContainer runs Node.js entirely in the browser |
| "Knowledge tools need vendor lock-in" | Local-first files + IndexedDB = zero lock-in |
| "Open-source can't compete with SaaS UX" | Modern component libraries (Radix, Monaco) close the gap |

### Technical Innovations (Proving the Browser's Limits)

**Browser-Native Compute Stack:**

```
Project Alpha Runtime (Zero Backend)
├── WebContainer API → Node.js 18+ execution in browser
├── Monaco Editor → VS Code editor core
├── xterm.js → Full terminal emulator
├── Orama WASM → Vector search without server
├── File System Access API → Direct local disk read/write
└── TanStack AI → Streaming LLM with multi-provider support
```

**Why This Is Hard (And Why It's Valuable to Prove):**
- WebContainers require `SharedArrayBuffer` (cross-origin isolation headers)
- File System Access API has strict permission lifecycles
- WASM + IndexedDB together can hit storage/memory quotas
- Multi-provider AI requires unified abstraction over different APIs

**Solo Dev Advantage:** No legacy architecture to refactor. Ground-up design for browser-native.

### Unfair Advantages (Solo Dev Open-Source Edition)

| Advantage | Why It's Sustainable | Enterprise Can't Copy Because... |
|-----------|---------------------|----------------------------------|
| **$0 Hosting** | No servers = no cloud bills | Their business model IS cloud revenue |
| **BYOK Model** | User pays OpenAI/Anthropic directly | Cannibalizes their AI upsell strategy |
| **Open Source** | Community contributions, transparency | Won't open-source their cash cows |
| **Zero Analytics** | Privacy by design, not policy | User data is their ML training asset |
| **Solo Velocity** | No meetings, no PRDs for PRDs | Coordination overhead kills speed |

### Validation Metrics

**Technical Proof Points (Phase 1 Demo):**

| Metric | Target | Validates |
|--------|--------|-----------|
| WebContainer cold boot | < 5s | Browser can run Node.js fast |
| 100-file mount via FSA | < 3s | Real projects work, not just demos |
| Agent tool execution | 95%+ success | AI can reliably edit local files |
| State restoration | 99%+ success | Session persistence works across visits |

**Market Validation (Phase 2 Beta):**

| Signal | Target | Indicates |
|--------|--------|-----------|
| GitHub stars | 500+ | Open-source community interest |
| Weekly active users | 50+ beta testers | Real usage, not just curiosity |
| Issues filed | 20+ substantive bugs | Users care enough to report |
| PRs from community | 5+ | Contributors want to improve it |

### Risk Mitigation & Fallback Strategy

**The "Prove the Tech" approach carries technical risk. Here's the escape ladder:**

| Fallback Level | Trigger | What Changes | Effort |
|----------------|---------|--------------|--------|
| **Plan A (Full Stack)** | Default | WebContainer + WASM + FSA + Monaco | Current |
| **Plan B (Lite)** | WC boot failures > 5% | Drop WebContainer, keep FSA + WASM + Monaco | 2-3 weeks |
| **Plan C (Core)** | WASM perf issues | Drop WASM, keep FSA + AI chat + basic editor | 1-2 weeks |
| **Plan D (Desktop)** | Browser limits block adoption | Pivot to Electron shell | 1 month |

**Decision Points:**
- End of Phase 1: If WebContainer reliability < 95%, pivot to Plan B
- Phase 2 Beta: If 30%+ users hit browser limits, evaluate Plan C
- Post-launch: If mobile demand high, build Plan D alongside web

### Open-Source Project Philosophy

**What "Open Source" Means for Project Alpha:**
1. **MIT Licensed** - Anyone can fork, modify, commercial use OK
2. **No Telemetry** - Zero tracking by default (opt-in analytics only)
3. **BYOK Only** - No hosted AI tier that creates vendor dependency
4. **Transparent Roadmap** - GitHub Issues/Discussions drive priorities
5. **Solo Maintainer Reality** - Contributions welcome, but expectations managed

**What This ISN'T:**
- ❌ "Open core" with paid enterprise features
- ❌ VC-backed with growth pressure
- ❌ Trying to compete with Google/Notion directly
- ❌ Aiming for unicorn status

**What This IS:**
- ✅ A technical proof-of-concept for browser-native knowledge tools
- ✅ A portfolio piece demonstrating advanced web APIs
- ✅ A useful tool for the Vietnamese EdTech community
- ✅ A foundation others can build on (forks, plugins, integrations)

---

## Technical Specifications

### Browser Compatibility Matrix

| Browser | Min Version | Status | Limiting Factor |
|---------|-------------|--------|-----------------|
| **Chrome** | 86+ | ✅ Full Support | SharedArrayBuffer, FSA API |
| **Edge** | 86+ | ✅ Full Support | Chromium-based |
| **Safari** | 15.2+ | ⚠️ Partial | No FSA API, limited WebContainer |
| **Firefox** | 111+ | ⚠️ Partial | No FSA API, experimental WC |
| **Mobile Chrome** | N/A | ❌ Demo Mode | No SharedArrayBuffer |
| **Mobile Safari** | N/A | ❌ Demo Mode | No SharedArrayBuffer, no FSA |

**Required Browser Features:**
- `SharedArrayBuffer` (for WebContainer)
- `Cross-Origin-Embedder-Policy: require-corp` header
- `Cross-Origin-Opener-Policy: same-origin` header
- IndexedDB (for Dexie.js persistence)
- Service Worker (for offline caching - Phase 2)

### Language & Framework Matrix

| Technology | Version | Purpose |
|------------|---------|---------|
| **TypeScript** | 5.x | Primary language |
| **React** | 19.x | UI framework |
| **TanStack Router** | 1.x | File-based routing |
| **TanStack Start** | 1.x | SSR/Full-stack framework |
| **Zustand** | 5.x | State management |
| **Dexie.js** | 4.x | IndexedDB abstraction |
| **TanStack AI** | 0.x | LLM integration |
| **Tailwind CSS** | 4.x | Styling |
| **Radix UI** | 1.x | Accessible components |

### Installation & Distribution Methods

| Method | Target User | Status |
|--------|-------------|--------|
| **Direct Browser** | All users | ✅ Primary (hosted on Vercel/Netlify) |
| **npm package** | Developers embedding features | 🔄 Phase 2 |
| **Docker** | Self-hosted | 🔄 Phase 3 |
| **Electron** | Desktop users (fallback) | 🔄 Plan D backup |

**No Installation Required:** Primary distribution is a hosted web app. Users visit URL, grant FSA permission, and start working.

### API Surface (Developer Tool Features)

**Agent Tool API:**

| Tool | Purpose | Phase |
|------|---------|-------|
| `readFile` | Read file contents from project | Phase 1 |
| `writeFile` | Write/create files in project | Phase 1 |
| `listFiles` | List directory contents | Phase 1 |
| `runCommand` | Execute shell commands via xterm | Phase 1 |
| `searchFiles` | Grep/semantic search in project | Phase 2 |
| `vectorSearch` | RAG query against sources | Phase 2 |

**State Store API (Zustand):**

| Store | Purpose | Persistence |
|-------|---------|-------------|
| `useAgentsStore` | Agent configurations | Dexie (IndexedDB) |
| `useWorkspaceStore` | Open files, tabs, layout | Dexie |
| `useConversationStore` | Chat history, messages | Dexie |
| `useSettingsStore` | User preferences | localStorage |

**Event System:**

| Event | Trigger | Consumers |
|-------|---------|-----------|
| `file:changed` | FSA write or WC sync | FileTree, Monaco, Agent |
| `agent:tool:start` | Tool execution begins | UI indicators |
| `agent:tool:end` | Tool execution completes | Conversation panel |
| `webcontainer:ready` | WC boot complete | Terminal, Preview |

---

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Strategy #3: Platform MVP (Foundation First)
**Resource Requirements:** Solo Developer + Open Source Contributors

**Rationale:**
We are building a technically complex "browser OS" platform. Before adding advanced EdTech features (RAG, Canvas), we must prove the core "Platform Constraints" (WebContainer + FSA + State) are solvable and reliable. A robust foundation enables rapid feature growth in Phase 2.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
1. **Alex (Developer):** Local project open, edit, agent refactor, persistence.
2. **Returning User:** Seamless session restore, permission re-grant.
3. **Mobile User:** Demo mode access (progressive degradation).

**Must-Have Capabilities (P0):**
- **WebContainer Core:** Reliable boot (<5s), error handling, `npm install`.
- **File System Bridge:** Bi-directional sync (<500ms latency), handle 100+ files.
- **Agent System:** Multi-provider support (OpenRouter/Anthropic), tool execution (RW files).
- **State Engine:** Unified Zustand+Dexie store, schema versioning, zero data loss.
- **UI Foundations:** Mobile-responsive layout, accessibility baseline (A11y), dark mode.
- **Privacy Controls:** BYOK key management, local data clear options.

### Post-MVP Features

**Phase 2: Knowledge Synthesis (Growth)**
- **Source Ingestion:** PDF/URL/YouTube import pipelines.
- **Intelligence Layer:** Orama WASM vector store, RAG chat with grounded citations.
- **Synthesis UI:** Knowledge Canvas (React Flow) for non-linear connection.
- **Compliance:** Privacy Shield (PII redaction), curriculum tags.

**Phase 3: Expansion (Vision)**
- **Artifact Generation:** AI-generated flashcards, quizzes, study guides.
- **Collaboration:** Peer-to-peer sync (future research), shared notebooks.
- **Monetization:** .alpha pack marketplace, Pro themes.

### Risk Mitigation Strategy

**Technical Risks:**
- **WebContainer Instability:** Fallback → "Lite Mode" (FSA + Agent only, no Node.js).
- **Storage Limits:** Mitigation → Auto-prune old sessions, warn at 80% quota.
- **Browser Compatibility:** Mitigation → Clear "Desktop Required" messaging for advanced features.

**Market Risks:**
- **Low Adoption:** Mitigation → Validate with 50 diverse beta testers (Devs + Students).
- **Complexity Overload:** Mitigation → Progressive onboarding (hide features until needed).

**Resource Risks:**
- **Solo Burnout:** Mitigation → Strict innovative scope boundaries (NO custom server backend).
