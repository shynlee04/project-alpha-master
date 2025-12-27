# Via-gent UX/UI Navigation, Sidebar, and Main Pages Overhaul Specification

**Document ID**: `UX-DESIGN-NAV-2025-12-27-001`
**Created**: 2025-12-27T23:04:00+07:00
**Agent**: `@bmad-bmm-architect` (Team A)
**Task**: Comprehensive UX/UI overhaul design for navigation, sidebar, and main pages
**Status**: DESIGN_COMPLETE

---

## Document Metadata

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Phase | Design Specification |
| Epic Reference | Epic 23 (UX/UI Modernization) |
| Dependencies | None |
| Blocking | None |
| Blocked By | None |

---

## 1. Executive Summary

### 1.1 Problem Statement

The Via-gent application currently suffers from significant UX/UI deficiencies that impede user onboarding and overall experience quality. Despite generating 40+ documents during December 26-27, 2025, the actual user-facing interface has not improved proportionally. The following critical issues have been identified through comprehensive codebase analysis:

| Issue Category | Severity | Description |
|----------------|----------|-------------|
| Navigation Confusion | P0 | Header and sidebar are disorganized with unclear hierarchy |
| Empty/Placeholder Pages | P0 | Main pages contain placeholder content or are entirely empty |
| Generic Iconography | P1 | Sidebar uses generic icons instead of thematic "Agentic Workstation" portals |
| Route Redundancy | P1 | `/hub` route confusingly redirects to `/` without adding value |
| Missing Portal Cards | P1 | HubHomePage lacks portal cards to guide users to major sections |
| Knowledge Station Not Integrated | P1 | Knowledge Synthesis Station concept from Dec 26 not present in UI |
| Legacy Tour Fails | P2 | Interactive Tour component provides no investor/community value |

### 1.2 Design Vision

**Agentic Workstation Vision**: "Via-gent is Vietnam's first AI-powered browser-based IDE, facilitating personalized workspaces and orchestrating teams of fully-aware agents."

This overhaul transforms Via-gent from a technical IDE tool into an integrated "Agentic Workstation" that presents four distinct portals to users, each with clear purpose, visual identity, and navigation pathways. The design emphasizes:
- **Topic-based onboarding** for new users
- **Quick actions** for common tasks
- **Portal-centric navigation** to major feature areas
- **Corporate-level professional UI** with 8-bit aesthetic
- **Vietnamese language support** throughout

---

## 2. Current State Analysis

### 2.1 Existing Route Structure

```
src/routes/
├── __root.tsx                    # Root layout provider
├── index.tsx                     # → MainLayout + HubHomePage (/)
├── hub.tsx                       # → Redirects to / (REDUNDANT)
├── ide.tsx                       # → IDELayout (no project context)
├── settings.tsx                  # → MainLayout + SettingsPage (/settings)
├── agents.tsx                    # → MainLayout + AgentsPanel (/agents)
├── knowledge.tsx                 # → MainLayout + Placeholder (/knowledge)
├── webcontainer.$.tsx            # → IDELayout (/webcontainer/*)
├── workspace/
│   ├── index.tsx                 # → MainLayout + ProjectList (/workspace)
│   └── $projectId.tsx            # → IDELayout + ProjectLoader (/workspace/$projectId)
└── api/
    └── chat.ts                   # → API endpoint /api/chat
```

### 2.2 Current Layout Components

| Component | File | Purpose | Issues |
|-----------|------|---------|--------|
| `MainLayout` | [`src/components/layout/MainLayout.tsx`](src/components/layout/MainLayout.tsx) | Wrapper for non-IDE pages | Uses mobile header with generic menu icon |
| `MainSidebar` | [`src/components/layout/MainSidebar.tsx`](src/components/layout/MainSidebar.tsx) | Sidebar navigation | Generic icons (Home, Folder, Bot, Settings) |
| `IDELayout` | [`src/components/layout/IDELayout.tsx`](src/components/layout/IDELayout.tsx) | IDE-specific layout | P0 state duplication issue |
| `IDEHeaderBar` | [`src/components/layout/IDEHeaderBar.tsx`](src/components/layout/IDEHeaderBar.tsx) | IDE header with breadcrumbs | IDE-specific, not reusable |

### 2.3 Current Navigation Items

| ID | Label (i18n key) | Icon | Path | Purpose |
|----|------------------|------|------|---------|
| home | `sidebar.home` | Home | `/` | Hub home page |
| projects | `sidebar.projects` | Folder | `/workspace` | Project list |
| agents | `sidebar.agents` | Bot | `/agents` | AI agent configuration |
| settings | `sidebar.settings` | Settings | `/settings` | Workspace preferences |

### 2.4 State Management Issues

| Issue | Location | Severity | Impact |
|-------|----------|----------|--------|
| State duplication | `IDELayout.tsx:142-148` | P0 | Data inconsistency between Zustand and local state |
| Missing Hub state | `hub-store.ts` exists but unused | P2 | Cannot persist Hub page state |
| Navigation state | `navigation-store.ts` | P1 | No centralized navigation tracking |

---

## 3. Target Design Specification

### 3.1 Portal Architecture

Via-gent shall implement a **4-Portal Architecture** where each portal represents a distinct functional area with its own visual identity, navigation patterns, and user workflows:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Via-gent - Agentic Workstation                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  🏠 Hub    │  💻 IDE    │  🤖 Agents   │  🧠 Knowledge   │  ⚙️ Settings │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌───────────┐  │
│  │  🏠 HUB PORTAL │  │  💻 IDE PORTAL │  │ 🤖 AGENTS PORTAL│ │ 🧠 KNOW.  │  │
│  │  Project Mgmt  │  │  Code Editor   │  │  Agent Config   │ │ Station   │  │
│  │  Quick Actions │  │  Terminal      │  │  Orchestration  │ │ Edu. Hub  │  │
│  │  Onboarding    │  │  File Manager  │  │  Provider Mgmt  │ │ AI Chat   │  │
│  └────────────────┘  └────────────────┘  └────────────────┘  └───────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Portal Descriptions

#### 3.2.1 Hub Portal (🏠)
**Path**: `/` | **Layout**: `MainLayout` with Hub-specific header

The Hub Portal serves as the **central command center** for project management and quick actions. It is the default landing page for new users and returning users.

**Key Features**:
- Topic-based onboarding flow for new users
- Quick action buttons for common tasks
- Portal cards linking to IDE, Agents, Knowledge, Settings
- Recent projects list
- System status overview
- Vietnamese language toggle with prominent display

**Visual Identity**:
- Primary accent color: Blue/Cyan (trust, technology)
- Icon: Home/Building icon with digital elements
- Card-based layout with pixel-perfect borders

#### 3.2.2 IDE Portal (💻)
**Path**: `/ide` and `/workspace/$projectId` | **Layout**: `IDELayout`

The IDE Portal provides the **full development environment** with Monaco Editor, xterm.js terminal, and file management. This is the core productivity workspace.

**Key Features**:
- Monaco Editor with tabbed interface
- xterm.js terminal with WebContainer integration
- File tree with sync status indicators
- Agent chat panel (sidebar)
- Status bar with WebContainer/sync indicators
- Command palette (Ctrl/Cmd+K)

**Visual Identity**:
- Primary accent color: Green (productivity)
- Icon: Code/Terminal icon
- Resizable panels with dark theme

#### 3.2.3 Agents Portal (🤖)
**Path**: `/agents` | **Layout**: `MainLayout` with Agents-specific header

The Agents Portal is the **Agent Management Center** for configuring and orchestrating AI agents.

**Key Features**:
- Agent configuration dialogs
- Provider management (OpenRouter, Anthropic, etc.)
- Credential vault interface
- Agent creation/editing workflow
- Model selection per agent
- System prompt configuration

**Visual Identity**:
- Primary accent color: Purple (AI, intelligence)
- Icon: Bot/Robot icon with neural network elements
- Card-based configuration interface

#### 3.2.4 Knowledge Portal (🧠)
**Path**: `/knowledge` | **Layout**: `MainLayout` with Knowledge-specific header

The Knowledge Portal is the **Knowledge Synthesis Station** for educational content synthesis and AI-assisted learning.

**Key Features**:
- Visual source cards for content
- AI chat for knowledge exploration
- Auto-summarization of documents
- Concept mind maps (deferred)
- Vietnamese language support for all content
- Content organization by topic

**Visual Identity**:
- Primary accent color: Orange/Gold (learning, wisdom)
- Icon: Brain/Lightbulb icon with sparkles
- Card-based content layout

---

## 4. Navigation Hierarchy Design

### 4.1 Primary Navigation Bar

The primary navigation bar shall appear at the top of the application window (non-IDE pages) or be integrated into the IDE header bar (IDE pages):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Via-gent Logo]  Via-gent - Agentic Workstation              [VN/EN] [Theme] │
├─────────────────────────────────────────────────────────────────────────────┤
│  [🏠 Hub]  [💻 IDE]  [🤖 Agents]  [🧠 Knowledge]  [⚙️ Settings]              │
├─────────────────────────────────────────────────────────────────────────────┤
│  Content Area                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Navigation Item Specifications

| Nav Item | Icon | Path | Badge | Tooltip (EN) | Tooltip (VI) |
|----------|------|------|-------|--------------|--------------|
| Hub | Building/Home | `/` | None | Go to Hub Portal | Đến Cổng Hub |
| IDE | Code/Terminal | `/ide` | None | Go to IDE Workspace | Đến Không gian IDE |
| Agents | Bot | `/agents` | None | Manage AI Agents | Quản lý AI Agents |
| Knowledge | Brain | `/knowledge` | Coming Soon | Knowledge Synthesis | Tổng hợp Kiến thức |
| Settings | Settings | `/settings` | None | Workspace Settings | Cài đặt Workspace |

### 4.3 Secondary Navigation (Sidebar)

For IDE Portal, a collapsible left sidebar provides file tree and agent chat:

```
┌──────────────────┬──────────────────────────────────────────────────────────┐
│ ≡ Explorer      │  [Tab Bar]                              [Agent Selector]  │
├──────────────────┼──────────────────────────────────────────────────────────┤
│ > src/          │  [Monaco Editor Content]                                   │
│   > components/ │                                                              │
│   > lib/        │                                                              │
│   > routes/     │                                                              │
│   package.json  │                                                              │
├──────────────────┼──────────────────────────────────────────────────────────┤
│ ≡ Terminal      │  [Status Bar: WC ● Sync ● EN ● Path: src/App.ts]          │
└──────────────────┴──────────────────────────────────────────────────────────┘
```

---

## 5. Component Structure Diagram

### 5.1 New Component Hierarchy

```
src/components/
├── layout/
│   ├── MainLayout.tsx              # Main wrapper for non-IDE pages
│   ├── HubHeaderBar.tsx            # NEW: Header for Hub portal
│   ├── AgentsHeaderBar.tsx         # NEW: Header for Agents portal
│   ├── KnowledgeHeaderBar.tsx      # NEW: Header for Knowledge portal
│   ├── MainSidebar.tsx             # Modified: Thematic portal icons
│   ├── IDELayout.tsx               # Modified: Fix state duplication
│   └── IDEHeaderBar.tsx            # Existing: Enhanced with nav items
│
├── hub/
│   ├── HubHomePage.tsx             # Modified: Portal cards, onboarding
│   ├── PortalCard.tsx              # NEW: Thematic portal navigation card
│   ├── QuickActions.tsx            # NEW: Quick action buttons
│   ├── RecentProjects.tsx          # NEW: Recent projects list
│   ├── OnboardingFlow.tsx          # NEW: Topic-based onboarding
│   └── index.ts
│
├── ide/
│   ├── FileTree/                   # Existing components
│   ├── MonacoEditor/               # Existing components
│   ├── XTerminal/                  # Existing components
│   └── AgentChatPanel.tsx          # Existing component
│
├── agents/
│   ├── AgentsPanel.tsx             # Modified: Enhanced agent management
│   ├── AgentConfigDialog.tsx       # Existing: Enhanced configuration
│   ├── ProviderManager.tsx         # NEW: Provider management interface
│   ├── CredentialVault.tsx         # NEW: Credential management UI
│   └── index.ts
│
├── knowledge/
│   ├── KnowledgeHomePage.tsx       # NEW: Knowledge portal home
│   ├── SourceCard.tsx              # NEW: Visual source content card
│   ├── KnowledgeChat.tsx           # NEW: AI chat for knowledge
│   ├── Summarizer.tsx              # NEW: Auto-summarization UI
│   └── index.ts
│
└── ui/                             # Existing reusable UI components
```

### 5.2 State Management Structure

```
src/lib/state/
├── index.ts
├── ide-store.ts                    # Existing: IDE state (fixed)
├── layout-store.ts                 # Modified: Add nav state
├── hub-store.ts                    # Modified: Enable and use
├── navigation-store.ts             # NEW: Centralized navigation state
└── statusbar-store.ts              # Existing
```

### 5.3 Route Structure (Target)

```
src/routes/
├── __root.tsx                      # Root layout provider
├── index.tsx                       # → MainLayout + HubHomePage (/)
├── hub.tsx                         # REMOVED (redirect to /)
├── ide.tsx                         # → IDELayout (/)
├── settings.tsx                    # → MainLayout + SettingsPage
├── agents.tsx                      # → MainLayout + AgentsPanel
├── knowledge.tsx                   # → MainLayout + KnowledgeHomePage
├── workspace/
│   ├── index.tsx                   # → MainLayout + ProjectList
│   └── $projectId.tsx              # → IDELayout + ProjectLoader
└── api/
    └── chat.ts                     # → API endpoint
```

---

## 6. User Journey Flows

### 6.1 New User Onboarding Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  USER JOURNEY: New User Onboarding                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. LANDING PAGE (/): User arrives at Via-gent                             │
│     ↓                                                                       │
│  2. DETECT FIRST VISIT: Check localStorage for "hasVisited" flag           │
│     ↓                                                                       │
│  3. SHOW ONBOARDING MODAL: Topic-based introduction                         │
│     ├── "What brings you here?" (Developer/Student/Explorer)               │
│     ├── "Choose your language" (English/Vietnamese)                        │
│     └── "Select your focus" (Web Dev/Data Science/General)                 │
│     ↓                                                                       │
│  4. DISPLAY PORTAL CARDS: Guide to main sections                           │
│     ├── 🏠 Hub - Project Management                                        │
│     ├── 💻 IDE - Code Editor                                               │
│     ├── 🤖 Agents - AI Configuration                                       │
│     └── 🧠 Knowledge - Learning Hub                                        │
│     ↓                                                                       │
│  5. QUICK ACTION: "Open Sample Project" or "Create New Project"            │
│     ↓                                                                       │
│  6. COMPLETE ONBOARDING: Store preferences, mark as visited                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Returning User Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  USER JOURNEY: Returning User                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. LANDING PAGE (/): User arrives at Hub Portal                           │
│     ↓                                                                       │
│  2. SHOW DASHBOARD:                                                         │
│     ├── Recent projects (clickable)                                        │
│     ├── Quick actions (Create/Open/Settings)                               │
│     └── Portal cards (if exploring new areas)                              │
│     ↓                                                                       │
│  3. USER ACTION:                                                            │
│     ├── Click "Continue Project X" → Navigate to /workspace/projectX       │
│     ├── Click "💻 IDE" → Navigate to /ide                                  │
│     ├── Click "🤖 Agents" → Navigate to /agents                            │
│     └── Click "🧠 Knowledge" → Navigate to /knowledge                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 IDE User Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  USER JOURNEY: IDE User                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. ENTER IDE (/ide or /workspace/$projectId)                              │
│     ↓                                                                       │
│  2. LOAD PROJECT:                                                           │
│     ├── Open local folder (if no project selected)                         │
│     └── Load existing project (if projectId provided)                      │
│     ↓                                                                       │
│  3. WORKSPACE DISPLAYED:                                                    │
│     ├── Left: File tree / Terminal tabs                                    │
│     ├── Center: Monaco Editor with tabs                                    │
│     ├── Right: Agent Chat Panel (toggleable)                               │
│     └── Bottom: Status bar                                                 │
│     ↓                                                                       │
│  4. AGENT INTERACTION:                                                      │
│     ├── Open agent chat panel                                              │
│     ├── Configure agent (🤖 button in header)                              │
│     └── Execute code with agent assistance                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.4 Agent Management Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  USER JOURNEY: Agent Management                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. NAVIGATE TO AGENTS (/agents)                                           │
│     ↓                                                                       │
│  2. AGENTS DASHBOARD DISPLAYED:                                             │
│     ├── Active agents list                                                 │
│     ├── Provider status                                                    │
│     └── Quick actions (Create/Configure/Delete)                            │
│     ↓                                                                       │
│  3. CONFIGURE AGENT:                                                        │
│     ├── Click agent card or "New Agent" button                             │
│     ├── Select provider (OpenRouter/Anthropic/etc.)                        │
│     ├── Enter API credentials (Credential Vault)                           │
│     ├── Select model                                                        │
│     ├── Configure system prompt                                            │
│     └── Save agent configuration                                           │
│     ↓                                                                       │
│  4. TEST AGENT:                                                             │
│     ├── Open agent in IDE chat panel                                       │
│     └── Verify functionality                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.5 Knowledge Synthesis Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  USER JOURNEY: Knowledge Synthesis                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. NAVIGATE TO KNOWLEDGE (/knowledge)                                     │
│     ↓                                                                       │
│  2. KNOWLEDGE PORTAL DISPLAYED:                                             │
│     ├── Featured source cards                                              │
│     ├── Recent summaries                                                   │
│     └── Knowledge chat                                                     │
│     ↓                                                                       │
│  3. EXPLORE CONTENT:                                                        │
│     ├── Click source card to view details                                  │
│     ├── Use AI chat to ask questions                                       │
│     └── Request summarization of content                                   │
│     ↓                                                                       │
│  4. LANGUAGE TOGGLE:                                                        │
│     ├── Switch between English/Vietnamese                                  │
│     └── All content translates dynamically                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. TanStack Router Integration Plan

### 7.1 Route Configuration

The following route changes are required:

| Action | File | Change |
|--------|------|--------|
| MODIFY | `src/routes/index.tsx` | Add portal cards, onboarding, quick actions to HubHomePage |
| REMOVE | `src/routes/hub.tsx` | Delete redundant redirect route |
| MODIFY | `src/routes/knowledge.tsx` | Replace placeholder with KnowledgeHomePage |
| ADD | `src/components/hub/HubHeaderBar.tsx` | New header component for Hub portal |
| ADD | `src/components/agents/AgentsHeaderBar.tsx` | New header component for Agents portal |
| ADD | `src/components/knowledge/KnowledgeHomePage.tsx` | New knowledge portal home |
| MODIFY | `src/components/layout/MainSidebar.tsx` | Replace generic icons with thematic portal icons |

### 7.2 Route Guards

Implement route guards for:

| Guard | Purpose | Logic |
|-------|---------|-------|
| ProjectRequired | Ensure project is loaded before IDE | Check `useIDEStore(s => s.projectId)` |
| PermissionsGranted | Ensure FSA permissions before file operations | Check `useWorkspacePermissions()` |
| AgentConfigured | Ensure at least one agent exists before agent features | Check `useAgentsStore(s => s.agents.length > 0)` |

### 7.3 Lazy Loading Strategy

For performance, implement lazy loading for non-critical routes:

```typescript
// Pseudo-code pattern (actual implementation in Dev mode)
const KnowledgeHomePage = lazy(() => 
  import('@/components/knowledge/KnowledgeHomePage')
);

const OnboardingFlow = lazy(() => 
  import('@/components/hub/OnboardingFlow')
);
```

---

## 8. Component Creation/Modification Priority List

### 8.1 Priority Matrix

| Priority | Component | Type | Effort | Impact | Dependencies |
|----------|-----------|------|--------|--------|--------------|
| P0 | HubHeaderBar | CREATE | 2 days | High | None |
| P0 | PortalCard | CREATE | 1 day | High | HubHeaderBar |
| P0 | HubHomePage (enhanced) | MODIFY | 2 days | High | PortalCard, QuickActions |
| P0 | MainSidebar (icons) | MODIFY | 1 day | High | PortalCard |
| P1 | KnowledgeHomePage | CREATE | 3 days | Medium | None |
| P1 | KnowledgeChat | CREATE | 2 days | Medium | /api/chat |
| P1 | OnboardingFlow | CREATE | 2 days | Medium | HubHomePage |
| P1 | QuickActions | CREATE | 1 day | Medium | HubHomePage |
| P1 | RecentProjects | CREATE | 1 day | Medium | ProjectStore |
| P1 | SourceCard | CREATE | 2 days | Medium | KnowledgeHomePage |
| P1 | IDELayout (state fix) | MODIFY | 1 day | High | IDEStore |
| P2 | AgentsHeaderBar | CREATE | 1 day | Low | None |
| P2 | ProviderManager | CREATE | 2 days | Medium | AgentConfigDialog |
| P2 | CredentialVault (UI) | CREATE | 2 days | Medium | CredentialVault lib |
| P2 | NavigationStore | CREATE | 1 day | Medium | None |
| P2 | Route guard implementation | CREATE | 2 days | Medium | Routes |

### 8.2 Implementation Phases

#### Phase 1: Hub Portal Core (P0 items)
**Duration**: 4-5 days
**Goal**: Complete Hub Portal with portal cards and navigation

1. Create `HubHeaderBar.tsx` - Header with nav items and language toggle
2. Create `PortalCard.tsx` - Thematic navigation cards
3. Modify `MainSidebar.tsx` - Update icons to portal theme
4. Enhance `HubHomePage.tsx` - Add portal cards, quick actions, recent projects
5. Fix `IDELayout.tsx` state duplication

#### Phase 2: Knowledge Portal Foundation (P1 items)
**Duration**: 5-6 days
**Goal**: Basic Knowledge portal with chat

1. Create `KnowledgeHomePage.tsx` - Knowledge portal home
2. Create `SourceCard.tsx` - Visual source content cards
3. Create `KnowledgeChat.tsx` - AI chat for knowledge exploration
4. Modify `src/routes/knowledge.tsx` - Use new KnowledgeHomePage

#### Phase 3: Onboarding and Polish (P1 items)
**Duration**: 3-4 days
**Goal**: Complete user onboarding experience

1. Create `OnboardingFlow.tsx` - Topic-based onboarding modal
2. Create `QuickActions.tsx` - Quick action buttons
3. Create `RecentProjects.tsx` - Recent projects list
4. Add route guards

#### Phase 4: Agents Portal Enhancement (P2 items)
**Duration**: 3-4 days
**Goal**: Enhanced agent management

1. Create `AgentsHeaderBar.tsx` - Agents portal header
2. Create `ProviderManager.tsx` - Provider management interface
3. Create `CredentialVault.tsx` - Credential management UI

#### Phase 5: Infrastructure (P2 items)
**Duration**: 2-3 days
**Goal**: Complete infrastructure improvements

1. Create `NavigationStore.ts` - Centralized navigation state
2. Implement route guards
3. Remove redundant `/hub` route

---

## 9. Design Specifications

### 9.1 Visual Design System

**8-bit Aesthetic Guidelines**:
- Pixel-perfect borders: `border-2 border-border` with `rounded-none`
- Box shadows: `shadow-[2px_2px_0px_rgba(0,0,0,1)]` for pixel depth
- Fonts: `font-mono` for code, `font-pixel` for headings (existing pattern)
- No border-radius on interactive elements (except avatars)
- Contrast ratios: WCAG AA compliant

**Color Scheme**:
- Background: `bg-background` (#1a1a2e dark / #f5f5f5 light)
- Primary: `bg-primary` (#3b82f6 blue / #1d4ed8 dark)
- Accent: `bg-accent` (#6366f1 indigo / #4338ca dark)
- Border: `border-border` (#e5e7eb gray-200 / #374151 gray-700)
- Text: `text-foreground` (#1f2937 dark / #f9fafb light)

**Portal Color Coding**:
| Portal | Primary Color | Accent Color |
|--------|--------------|--------------|
| Hub | Blue (#3b82f6) | Cyan (#06b6d4) |
| IDE | Green (#22c55e) | Emerald (#10b981) |
| Agents | Purple (#8b5cf6) | Violet (#7c3aed) |
| Knowledge | Orange (#f97316) | Amber (#f59e0b) |
| Settings | Gray (#6b7280) | Slate (#64748b) |

### 9.2 Internationalization (i18n)

All new components must support English and Vietnamese. Key translation keys to add:

```typescript
// en.json additions
{
  "nav": {
    "hub": "Hub",
    "ide": "IDE",
    "agents": "Agents",
    "knowledge": "Knowledge",
    "settings": "Settings"
  },
  "hub": {
    "title": "Via-gent - Agentic Workstation",
    "subtitle": "Your AI-powered development environment",
    "portal_cards": {
      "ide": "Code Editor & Terminal",
      "agents": "AI Agent Management",
      "knowledge": "Knowledge Synthesis",
      "settings": "Workspace Settings"
    },
    "quick_actions": {
      "new_project": "New Project",
      "open_project": "Open Project",
      "continue_recent": "Continue Recent"
    }
  }
}

// vi.json additions
{
  "nav": {
    "hub": "Hub",
    "ide": "IDE",
    "agents": "Agents",
    "knowledge": "Kiến thức",
    "settings": "Cài đặt"
  },
  "hub": {
    "title": "Via-gent - Trạm làm việc AI",
    "subtitle": "Môi trường phát triển với AI",
    "portal_cards": {
      "ide": "Trình soạn thảo & Terminal",
      "agents": "Quản lý AI Agent",
      "knowledge": "Tổng hợp Kiến thức",
      "settings": "Cài đặt Workspace"
    },
    "quick_actions": {
      "new_project": "Dự án mới",
      "open_project": "Mở Dự án",
      "continue_recent": "Tiếp tục gần đây"
    }
  }
}
```

### 9.3 Responsive Design

**Breakpoint Strategy**:
- `xs` (< 640px): Mobile - Bottom navigation, stacked layout
- `sm` (640px - 767px): Small tablet - Collapsed sidebar
- `md` (768px - 1023px): Tablet - Collapsible sidebar
- `lg` (1024px - 1279px): Desktop - Full sidebar
- `xl` (1280px+): Large desktop - Full sidebar with extra space

**Mobile Navigation**:
```tsx
// Mobile: Bottom tab bar (new)
<BottomNavBar>
  <BottomNavItem icon={Hub} label="Hub" path="/" />
  <BottomNavItem icon={IDE} label="IDE" path="/ide" />
  <BottomNavItem icon={Agents} label="Agents" path="/agents" />
  <BottomNavItem icon={Knowledge} label="Knowledge" path="/knowledge" />
</BottomNavBar>
```

---

## 10. Implementation Guidelines for Dev Agent

### 10.1 Code Patterns

**Portal Card Component Pattern**:
```tsx
// src/components/hub/PortalCard.tsx (pseudo-code)
interface PortalCardProps {
  portal: 'ide' | 'agents' | 'knowledge' | 'settings';
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
}

export const PortalCard: React.FC<PortalCardProps> = ({
  portal,
  title,
  description,
  icon: Icon,
  onClick,
}) => {
  const colors = {
    ide: 'border-green-500 hover:bg-green-500/10',
    agents: 'border-purple-500 hover:bg-purple-500/10',
    knowledge: 'border-orange-500 hover:bg-orange-500/10',
    settings: 'border-gray-500 hover:bg-gray-500/10',
  };

  return (
    <Card 
      className={cn('border-2 cursor-pointer transition-colors', colors[portal])}
      onClick={onClick}
    >
      <Icon className="w-12 h-12 mb-4" />
      <h3>{title}</h3>
      <p>{description}</p>
    </Card>
  );
};
```

**Header Bar Pattern**:
```tsx
// src/components/layout/HubHeaderBar.tsx (pseudo-code)
export const HubHeaderBar: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <header className="h-14 border-b border-border flex items-center px-4">
      <BrandLogo />
      <nav className="flex gap-1 ml-8">
        <NavItem to="/" icon={Home} label={t('nav.hub')} />
        <NavItem to="/ide" icon={Code} label={t('nav.ide')} />
        <NavItem to="/agents" icon={Bot} label={t('nav.agents')} />
        <NavItem to="/knowledge" icon={Brain} label={t('nav.knowledge')} />
      </nav>
      <div className="flex-1" />
      <LanguageToggle />
      <ThemeToggle />
    </header>
  );
};
```

### 10.2 State Management Pattern

**Navigation Store**:
```typescript
// src/lib/state/navigation-store.ts (pseudo-code)
interface NavigationState {
  activePortal: 'hub' | 'ide' | 'agents' | 'knowledge' | 'settings';
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  setActivePortal: (portal: NavigationState['activePortal']) => void;
  toggleSidebar: () => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activePortal: 'hub',
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  setActivePortal: (portal) => set({ activePortal: portal }),
  toggleSidebar: () => set((state) => ({ 
    sidebarCollapsed: !state.sidebarCollapsed 
  })),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
}));
```

### 10.3 Testing Requirements

For each new component:
1. Unit tests for rendering and interactions
2. Integration tests for navigation flows
3. Visual regression tests (optional, if design system testing implemented)
4. Accessibility tests (keyboard navigation, ARIA labels)

---

## 11. Risks and Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| Route changes break existing functionality | High | Test all routes thoroughly; keep `/` as fallback |
| State management changes cause data loss | High | Backup IndexedDB before migration; implement migration scripts |
| Design changes require extensive refactoring | Medium | Follow existing patterns; minimize scope creep |
| Vietnamese translations may be incomplete | Medium | Add translation keys incrementally; use fallback English |
| Performance degradation from lazy loading | Low | Implement code splitting carefully; monitor bundle size |

---

## 12. Success Criteria

### 12.1 Functional Criteria

- [ ] All routes load without errors
- [ ] Navigation items correctly route to intended pages
- [ ] Portal cards are clickable and navigate correctly
- [ ] Language toggle works on all new components
- [ ] Theme toggle works on all new components
- [ ] Onboarding modal appears for new users
- [ ] Recent projects display correctly
- [ ] IDE portal maintains all existing functionality

### 12.2 Non-Functional Criteria

- [ ] Lighthouse performance score ≥ 80
- [ ] Lighthouse accessibility score ≥ 90
- [ ] Page load time < 3 seconds
- [ ] Mobile responsive layout works correctly
- [ ] No console errors in browser

### 12.3 User Experience Criteria

- [ ] Users can navigate to any portal from any page
- [ ] Portal purpose is clear from visual design
- [ ] Vietnamese language is fully supported
- [ ] New users understand the product from onboarding
- [ ] Existing users can find familiar features

---

## 13. References and Dependencies

### 13.1 Documentation References

| Document | Path | Purpose |
|----------|------|---------|
| Navigation Routing Investigation | `_bmad-output/investigation/navigation-routing-investigation-2025-12-27.md` | Current state analysis |
| State Management Audit | `_bmad-output/state-management-audit-2025-12-24.md` | State architecture |
| MVP Sprint Plan | `_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md` | Story dependencies |
| State Audit P1.10 | `_bmad-output/state-management-audit-p1.10-2025-12-26.md` | IDELayout issues |

### 13.2 External References

| Library | Documentation | Version |
|---------|---------------|---------|
| TanStack Router | https://tanstack.com/router | ^1.x |
| Lucide React | https://lucide.dev | ^0.x |
| Radix UI | https://www.radix-ui.com/primitives | ^1.x |
| Tailwind CSS | https://tailwindcss.com/docs | ^3.x |
| i18next | https://www.i18next.com | ^23.x |

---

## 14. Approval and Handoff

### 14.1 Design Approval

| Role | Name | Status | Date |
|------|------|--------|------|
| Architect | @bmad-bmm-architect | DESIGN_COMPLETE | 2025-12-27 |
| UX Designer | @bmad-bmm-ux-designer | PENDING_REVIEW | - |
| Product Owner | @bmad-core-bmad-master | PENDING_APPROVAL | - |

### 14.2 Handoff to Development

**Recommended Next Steps**:

1. **UX Design Review** (`@bmad-bmm-ux-designer`):
   - Review component specifications
   - Provide visual design mockups
   - Approve color scheme and typography

2. **Story Breakdown** (`@bmad-bmm-pm`):
   - Create stories for Phase 1 (Hub Portal Core)
   - Estimate effort for each story
   - Add to sprint backlog

3. **Implementation** (`@bmad-bmm-dev`):
   - Begin Phase 1 implementation
   - Follow code patterns specified in section 10
   - Report blockers to @bmad-core-bmad-master

---

**Document ID**: `UX-DESIGN-NAV-2025-12-27-001`
**Version**: 1.0.0
**Status**: DESIGN_COMPLETE
**Created**: 2025-12-27T23:04:00+07:00
**Agent**: `@bmad-bmm-architect`

---

*This document was created as part of the Via-gent UX/UI overhaul initiative. For questions or clarifications, contact the BMAD Master orchestrator.*
