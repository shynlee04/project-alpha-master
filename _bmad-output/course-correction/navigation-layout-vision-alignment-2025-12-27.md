# Via-gent Course Correction Plan
## Navigation, Layout & Vision Alignment - 2025-12-27

**Document ID**: CORRECTION-NAV-2025-12-27-001  
**Created**: 2025-12-27  
**Status**: Approved for Implementation  
**Version**: 1.0  
**Facilitated by**: BMAD Master Orchestrator

---

## Executive Summary

This document outlines a comprehensive course correction for the Via-gent AI Coding Agent project, addressing systemic issues in navigation, layout architecture, and product vision alignment. The investigation revealed that while the TanStack Router structure is technically correct, the UI fails to reflect the "Agentic Workstation" vision outlined in marketing documents.

**Key Findings:**
- Routes exist but pages are empty/placeholder (`HubHomePage` has no portal cards)
- Sidebar navigation uses generic icons instead of thematic "Agentic Workstation" portals
- The Knowledge Synthesis Station concept (December 26) is not integrated into the UI
- Legacy "Interactive Tour" fails to deliver investor/community value
- `/hub` route redirects confusingly to `/`

---

## Part I: Root Cause Analysis

### 1.1 Context Poisoning Evidence

| Category | Issue | Impact |
|----------|-------|--------|
| **Documentation** | 39+ artifacts created Dec 26-27 without corresponding code changes | False sense of progress |
| **Navigation** | Routes exist but pages empty/redirecting | Broken user journeys |
| **Vision** | Marketing strategy (Dec 24) and Knowledge Station concept (Dec 26) not reflected in UI | Product/market mismatch |
| **State Management** | IDELayout duplicates IDE state instead of using Zustand store | Inconsistent architecture |

### 1.2 Codebase Investigation Results

**Routes (`src/routes/`):**
```
✅ `/` → MainLayout + HubHomePage (EMPTY/PLACEHOLDER)
✅ `/ide` → IDELayout (CORRECT - SSR: false)
❌ `/hub` → Redirects to `/` (CONFUSING)
✅ `/agents` → MainLayout + AgentsPanel
✅ `/knowledge` → Exists (concept not implemented)
✅ `/settings` → Exists
✅ `/workspace/$projectId` → IDELayout (CORRECT)
```

**Layout Components:**
- `MainLayout.tsx` (69 lines) - Standard layout with responsive sidebar
- `MainSidebar.tsx` (366 lines) - Collapsible sidebar with generic icons
- `IDELayout.tsx` (554 lines) - Full IDE layout with resizable panels

**Critical Gap:** The sidebar navigation uses generic icons (Home, Projects, Agents, Settings) instead of the thematic portals defined in the vision documents.

---

## Part II: Vision Alignment Requirements

### 2.1 Agentic Workstation Vision (From Marketing Strategy)

**Brand Positioning:**
> "Via-gent is Vietnam's first AI-powered browser-based IDE, facilitating personalized workspaces and orchestrating teams of fully-aware agents."

**Target Portals (from concept documents):**
1. **IDE Workspace** - Code editing, terminal, file management
2. **Agent Management Center** - Configure and orchestrate AI agents
3. **Knowledge Synthesis Station** - Educational content synthesis (Dec 26 concept)
4. **Projects Hub** - Project management and organization

### 2.2 Knowledge Synthesis Station (December 26 Concept)

**Core Features:**
- Visual source cards (PDF, URL, audio)
- AI chat with sources and citations
- Auto-summarization
- Concept mind maps
- Vietnamese language support

**Route Structure:**
```
/knowledge → Knowledge Station dashboard
/knowledge/$notebookId → Individual notebook view
/knowledge/canvas → Visual canvas view
```

---

## Part III: Proposed Architecture

### 3.1 Navigation Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│  Via-gent - Agentic Workstation                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  🏠 Hub  │  💻 IDE  │  🤖 Agents  │  🧠 Knowledge  │ ⚙️    │  │
│  └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  Main Content Area                                             │
│  (Routes through MainLayout for non-IDE pages)                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Route Mapping

| Route | Layout | Page Component | Status |
|-------|--------|----------------|--------|
| `/` | MainLayout | **New: HomePortalPage** | Replace empty HubHomePage |
| `/ide` | IDELayout | IDEWorkspace | ✅ Existing |
| `/agents` | MainLayout | **Enhanced: AgentCenterPage** | Enhance existing |
| `/knowledge` | MainLayout | **New: KnowledgeStationPage** | Implement concept |
| `/settings` | MainLayout | SettingsPage | ✅ Existing |
| `/workspace/$projectId` | IDELayout | IDEWorkspace | ✅ Existing |

### 3.3 Sidebar Redesign

**Current (`MainSidebar.tsx`):**
- Generic icons: Home, Projects, Agents, Settings

**Proposed (Thematic Icons):**
- 🏠 **Hub** - Onboarding, quick actions, portal cards
- 💻 **IDE** - Code workspace entry
- 🤖 **Agents** - Agent configuration and orchestration
- 🧠 **Knowledge** - Educational synthesis (NEW)
- ⚙️ **Settings** - User preferences

---

## Part IV: Implementation Plan

### 4.1 Phase 1: Foundation (Week 1)

| Task | Owner | Dependencies | Priority |
|------|-------|--------------|----------|
| Redesign `MainSidebar.tsx` with thematic icons | @bmad-bmm-ux-designer | None | P0 |
| Create `HomePortalPage` with investor/community content | @bmad-bmm-ux-designer | Sidebar redesign | P0 |
| Update `/hub` route to point to `/` explicitly | @bmad-bmm-dev | None | P1 |
| Add portal cards to `HomePortalPage` | @bmad-bmm-dev | HomePortalPage | P1 |

### 4.2 Phase 2: Agent Center (Week 2)

| Task | Owner | Dependencies | Priority |
|------|-------|--------------|----------|
| Enhance `AgentCenterPage` with agent orchestration UI | @bmad-bmm-ux-designer | None | P0 |
| Add agent team visualization | @bmad-bmm-dev | AgentCenterPage | P1 |
| Integrate agent configuration dialogs | @bmad-bmm-dev | AgentCenterPage | P1 |

### 4.3 Phase 3: Knowledge Station (Week 3-4)

| Task | Owner | Dependencies | Priority |
|------|-------|--------------|----------|
| Implement `/knowledge` route with dashboard | @bmad-bmm-architect | Concept doc | P0 |
| Create `KnowledgeStationPage` component | @bmad-bmm-ux-designer | Route setup | P0 |
| Build SourceCard component | @bmad-bmm-dev | KnowledgeStationPage | P1 |
| Integrate AI chat with sources | @bmad-bmm-dev | Provider adapter | P1 |
| Add Vietnamese i18n support | @bmad-bmm-tech-writer | All above | P1 |

### 4.4 Phase 4: Polish & Integration (Week 5)

| Task | Owner | Dependencies | Priority |
|------|-------|--------------|----------|
| Remove legacy "Interactive Tour" | @bmad-bmm-quick-flow-solo-dev | None | P0 |
| Add investor pitch section to homepage | @bmad-bmm-ux-designer | HomePortalPage | P1 |
| Browser E2E verification for all pages | @bmad-bmm-tea | All phases | P0 |
| Update CLAUDE.md with new navigation | @bmad-bmm-tech-writer | All above | P1 |

---

## Part V: Technical Specifications

### 5.1 TanStack Router Integration

**Route Definition Pattern:**
```typescript
// src/routes/index.tsx (Updated)
export const Route = createFileRoute('/')({
  component: () => (
    <MainLayout>
      <HomePortalPage />
    </MainLayout>
  ),
})
```

**Knowledge Route Structure:**
```
src/routes/knowledge/
├── index.tsx         # /knowledge - Dashboard
├── $notebookId.tsx   # /knowledge/$notebookId - Notebook view
└── canvas.tsx        # /knowledge/canvas - Visual canvas
```

### 5.2 Component Architecture

```
src/components/
├── home/
│   ├── HomePortalPage.tsx
│   ├── PortalCard.tsx
│   ├── QuickActions.tsx
│   └── InvestorPitch.tsx
├── agent/
│   └── AgentCenterPage.tsx  # Enhanced from AgentsPanel
└── knowledge/
    ├── KnowledgeStationPage.tsx
    ├── SourceCard.tsx
    ├── KnowledgeCanvas.tsx
    └── SynthesisPanel.tsx
```

### 5.3 State Management

**Updated Store Usage:**
- `useIDEStore` → IDE state only (remove duplication in IDELayout)
- `useNavigationStore` → New store for sidebar state and portal navigation
- `useKnowledgeStore` → New store for knowledge station state

---

## Part VI: Preservation Requirements

### 6.1 Backend Connections to Preserve

| Feature | File | Status |
|---------|------|--------|
| Chat API | `src/routes/api/chat.ts` | ✅ Preserve |
| Agent Configuration | `src/components/agent/AgentConfigDialog.tsx` | ✅ Preserve |
| Provider Adapters | `src/lib/agent/providers/provider-adapter.ts` | ✅ Preserve |
| File System Sync | `src/lib/filesystem/sync-manager.ts` | ✅ Preserve |
| WebContainer Manager | `src/lib/webcontainer/manager.ts` | ✅ Preserve |

### 6.2 Existing Components to Enhance (Not Replace)

| Component | Enhancement Required |
|-----------|---------------------|
| `MainLayout.tsx` | Add portal-aware navigation state |
| `MainSidebar.tsx` | Redesign with thematic icons |
| `AgentsPanel.tsx` | Expand to Agent Center Page |
| `HubHomePage.tsx` | Replace with full HomePortalPage |

---

## Part VII: Success Metrics

### 7.1 Navigation Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to first portal access | < 3 seconds | From sidebar click to page load |
| Sidebar recognition accuracy | > 90% | Users identify portals correctly |
| Route accessibility | 100% | All routes load without errors |

### 7.2 Vision Alignment Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Investor pitch visibility | Home page above fold | Design review |
| Knowledge Station discovery | Sidebar icon recognized | User testing |
| Agent orchestration accessibility | Single click from sidebar | UX audit |

---

## Part VIII: References

### 8.1 Vision Documents
- [`_bmad-output/marketing-plan/via-gent-marketing-strategy-vietnam-2025-12-24.md`](_bmad-output/marketing-plan/via-gent-marketing-strategy-vietnam-2025-12-24.md)
- [`docs/2025-12-26/concept-for-knowledge-synthesis-station-2025-12-26.md`](docs/2025-12-26/concept-for-knowledge-synthesis-station-2025-12-26.md)

### 8.2 Technical References
- [`_bmad-output/architecture/mcp-research-protocol-mandatory.md`](_bmad-output/architecture/mcp-research-protocol-mandatory.md)
- [`_bmad-output/investigation/navigation-routing-investigation-2025-12-27.md`](_bmad-output/investigation/navigation-routing-investigation-2025-12-27.md)

### 8.3 BMAD Workflows
- [`bmm-workflow-status.yaml`](bmm-workflow-status.yaml)
- [`_bmad-output/sprint-artifacts/sprint-status.yaml`](_bmad-output/sprint-artifacts/sprint-status.yaml)

---

## Part IX: Handoff to Development

### 9.1 Immediate Actions

1. **@bmad-bmm-ux-designer**: Redesign `MainSidebar.tsx` with thematic icons
2. **@bmad-bmm-dev**: Create `HomePortalPage` component
3. **@bmad-bmm-architect**: Design Knowledge Station route structure
4. **@bmad-bmm-quick-flow-solo-dev**: Remove legacy "Interactive Tour"

### 9.2 Documentation Updates Required

- Update `CLAUDE.md` with new navigation structure
- Update `AGENTS.md` with portal-based workflows
- Create new `agent-os/product/roadmap.md` with vision alignment

### 9.3 Verification Gates

1. All routes load without errors
2. Sidebar icons match vision documents
3. Knowledge Station concept implemented
4. Investor pitch visible on home page
5. Browser E2E verification passed

---

*Generated via BMAD Master Orchestrator*  
*Project: Via-gent Course Correction (Navigation & Vision Alignment)*  
*Date: 2025-12-27T15:59:00+07:00*
