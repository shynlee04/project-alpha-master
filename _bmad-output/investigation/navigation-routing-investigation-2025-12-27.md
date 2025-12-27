# Navigation & Routing Architecture Investigation

**Document ID**: `INVESTIGATION-NAV-2025-12-27`
**Created**: 2025-12-27T22:22:00+07:00
**Agent**: `@bmad-bmm-architect` (Team A)
**Task**: Deep investigation of navigation, header, sidebar, and routing architecture
**Status**: COMPLETE

---

## Executive Summary

This investigation addresses the user's report that "navigation header, sidebar, and routing are a whole lot of mess of many things." Through comprehensive analysis of the codebase, routing structure, and December 26-27 artifacts, this report provides a complete picture of the navigation architecture, identifies specific issues, and offers clear recommendations for cleanup and consolidation.

### Key Findings Summary

| Category | Status | Issues Found |
|----------|--------|--------------|
| Route Duplication | ⚠️ Medium | `/` and `/hub` both render same content |
| Layout Assignment | ✅ Fixed | `/ide` and `/workspace/$projectId` now use IDELayout |
| State Management | ⚠️ P0 Deferred | `IDELayout.tsx` duplicates state (documented) |
| Deprecated Components | ✅ Resolved | HubLayout/HubSidebar deleted, Header deprecated |
| Mobile Navigation | ✅ Implemented | Mobile sidebar overlay working |
| Design System | ✅ Consistent | Semantic CSS variables applied |

---

## 1. Complete Navigation Flow Diagram

### 1.1 Route Hierarchy (TanStack Router)

```
src/routes/
├── __root.tsx                    # Root layout provider
├── index.tsx                     # → MainLayout + HubHomePage (/)
├── hub.tsx                       # → MainLayout + HubHomePage (/hub)
├── ide.tsx                       # → IDELayout (no project context)
├── settings.tsx                  # → MainLayout + SettingsPage (/settings)
├── agents.tsx                    # → MainLayout + AgentsPanel (/agents)
├── knowledge.tsx                 # → MainLayout (? /knowledge)
├── webcontainer.$.tsx            # → IDELayout (/webcontainer/*)
├── workspace/
│   ├── index.tsx                 # → MainLayout + ProjectList (/workspace)
│   └── $projectId.tsx            # → IDELayout + ProjectLoader (/workspace/$projectId)
└── api/
    └── chat.ts                   # → API endpoint /api/chat
```

### 1.2 Navigation Flow by User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                        ENTRY POINTS                              │
├─────────────────────────────────────────────────────────────────┤
│ 1. Direct URL (browser address bar)                             │
│ 2. Sidebar Navigation (MainSidebar)                             │
│ 3. Project Selection (Workspace index)                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     LAYOUT SELECTION                             │
├──────────────────────┬──────────────────────────────────────────┤
│   MainLayout         │              IDELayout                    │
│   (Hub Navigation)   │         (Full IDE Experience)             │
├──────────────────────┼──────────────────────────────────────────┤
│ - / (root)           │ - /ide (direct IDE)                       │
│ - /hub               │ - /workspace/$projectId                   │
│ - /workspace         │ - /webcontainer/*                         │
│ - /agents            │                                          │
│ - /settings          │                                          │
│ - /knowledge         │                                          │
└──────────────────────┴──────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  COMPONENT COMPOSITION                           │
├─────────────────────────────────────────────────────────────────┤
│ MainLayout                    │ IDELayout                        │
│ ├── MainSidebar               │ ├── IDEHeaderBar                 │
│ │   ├── NavItems (4)          │ │   ├── File Breadcrumbs         │
│ │   ├── Theme Toggle          │ │   ├── Agent Selector           │
│ │   ├── Language Toggle       │ │   ├── Settings Menu            │
│ │   └── Mobile Overlay        │ │   └── Command Menu             │
│ └── Page Content              │ ├── Resizable Panels             │
│                              │ │   ├── File Tree                 │
│                              │ │   ├── Monaco Editor             │
│                              │ │   ├── Terminal                  │
│                              │ │   └── Chat/Preview              │
│                              │ └── StatusBar                     │
└──────────────────────────────┴──────────────────────────────────┘
```

### 1.3 State Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    STATE OWNERSHIP                               │
├─────────────────────────────────────────────────────────────────┤
│ Persisted State (IndexedDB)                                      │
│ ├── useIDEStore: openFiles, activeFile, panels, terminalTab     │
│ │   → Used by: IDELayout, MonacoEditor, TerminalPanel            │
│ └── useAgentsStore: agent configs (localStorage)                │
│     → Used by: AgentConfigDialog, AgentsPanel                    │
├─────────────────────────────────────────────────────────────────┤
│ Ephemeral State (In-Memory)                                      │
│ ├── useStatusBarStore: WC status, sync status, cursor           │
│ │   → Used by: StatusBar, SyncStatusIndicator                    │
│ ├── useFileSyncStatusStore: sync progress                        │
│ │   → Used by: SyncStatusIndicator                               │
│ └── Local useState in IDELayout (P0 Issue)                       │
│     → isChatVisible, terminalTab, openFiles, activeFilePath      │
├─────────────────────────────────────────────────────────────────┤
│ UI State (React Context)                                         │
│ ├── WorkspaceContext: project, handle, permissions              │
│ └── LocaleProvider: i18n, theme                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. All Navigation Items with Paths and Purposes

### 2.1 MainSidebar Navigation Items

**File**: [`src/components/layout/MainSidebar.tsx`](src/components/layout/MainSidebar.tsx:132-157)

| ID | Label (i18n key) | Icon | Path | Purpose |
|----|------------------|------|------|---------|
| home | `sidebar.home` | Home | `/` | Hub home page - project overview and quick actions |
| projects | `sidebar.projects` | Folder | `/workspace` | Project list - create/open projects |
| agents | `sidebar.agents` | Bot | `/agents` | AI agent configuration and management |
| settings | `sidebar.settings` | Settings | `/settings` | Workspace preferences and API configuration |

### 2.2 IDEHeaderBar Navigation Items

**File**: [`src/components/layout/IDEHeaderBar.tsx`](src/components/layout/IDEHeaderBar.tsx)

| Section | Items | Purpose |
|---------|-------|---------|
| Left | File breadcrumbs, navigation | Current file path, back navigation |
| Center | Agent selector dropdown | Switch active AI agent |
| Right | Command menu, settings, theme | Quick actions, preferences |

### 2.3 Hidden/Implicit Routes

| Route | Component | Purpose | Notes |
|-------|-----------|---------|-------|
| `/api/chat` | Chat API | AI chat endpoint | SSE streaming support |
| `/test-fs-adapter` | Test route | File system testing | Development/debug only |
| `/webcontainer/*` | Dynamic route | WebContainer debugging | Dev mode only |

---

## 3. Routing Inconsistencies & Issues Identified

### 3.1 Route Duplication (Medium Priority)

**Issue**: `/` and `/hub` both render `HubHomePage` with `MainLayout`

| Route | Layout | Component | Status |
|-------|--------|-----------|--------|
| `/` | MainLayout | HubHomePage | Active |
| `/hub` | MainLayout | HubHomePage | Duplicate |

**Impact**: 
- Confusers users about which is the "canonical" home URL
- Increases bundle size with unused route code
- Maintenance overhead

**Recommendation**: Consolidate to single route (likely `/`) and either:
- Redirect `/hub` → `/` (maintain backward compatibility)
- Delete `/hub` route entirely

### 3.2 State Duplication in IDELayout (P0 - Deferred)

**Issue**: [`src/components/layout/IDELayout.tsx`](src/components/layout/IDELayout.tsx) uses local `useState` instead of `useIDEStore`

**Duplicated State**:
```typescript
// Current: Local state (IDELayout.tsx lines 142-148)
const [isChatVisible, setIsChatVisible] = useState(false);
const [terminalTab, setTerminalTab] = useState('output');
const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
const [activeFilePath, setActiveFilePath] = useState<string | null>(null);

// Should use: Zustand store (useIDEStore)
const { chatVisible, setChatVisible } = useIDEStore(s => ({
  chatVisible: s.chatVisible,
  setChatVisible: s.setChatVisible
}));
```

**Impact**:
- State synchronization issues between components
- Loss of persistence (local state not persisted to IndexedDB)
- Violates single source of truth principle

**Status**: Documented in P1.10 audit, **deferred to avoid MVP-3 interference**

### 3.3 Settings Route Layout (Low Priority)

**Issue**: `/settings` uses `MainLayout` which includes navigation sidebar

**Analysis**:
- Settings page contains AgentConfigDialog for API configuration
- Having sidebar navigation available is not necessarily wrong
- User can navigate away while configuring agents (acceptable UX)

**Status**: Acceptable as-is, no change needed

### 3.4 Missing Route Guards

**Issue**: No authentication/permission checks before rendering routes

| Route | Should Have Guard |
|-------|-------------------|
| `/workspace/$projectId` | Project access check |
| `/settings` | Auth check |
| `/ide` | Permission check (WebContainer) |

**Status**: Not critical for MVP, can be addressed in future iteration

---

## 4. State Management Analysis for Navigation

### 4.1 Navigation State Stores

| Store | Purpose | Persistence | Used By |
|-------|---------|-------------|---------|
| `useIDEStore` | IDE panel state, open files | IndexedDB | IDELayout, MonacoEditor |
| `useStatusBarStore` | WebContainer status, sync | In-memory | StatusBar |
| `useFileSyncStatusStore` | File sync progress | In-memory | SyncStatusIndicator |
| `useAgentsStore` | Agent configurations | localStorage | AgentConfigDialog |
| `useLayoutStore` | Sidebar collapsed state | localStorage | MainSidebar |
| `useNavigationStore` | Route history, breadcrumbs | In-memory | IDEHeaderBar |

### 4.2 Sidebar Collapsed State

**File**: [`src/lib/state/layout-store.ts`](src/lib/state/layout-store.ts)

```typescript
interface LayoutState {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}
```

**Implementation**: Uses `localStorage` for persistence across sessions

### 4.3 Active Navigation Item Tracking

**Current Approach**: TanStack Router's `useLocation` for path matching

```typescript
// In MainSidebar.tsx
const location = useLocation();
const isActive = (path: string) => location.pathname === path;
```

**Limitation**: No centralized "current section" tracking
**Recommendation**: Add `useNavigationStore` with `currentSection` state for better UX

---

## 5. Mobile vs Desktop Navigation Behavior

### 5.1 Responsive Breakpoints

**Breakpoints Used**:
- `md`: 768px - Tablet threshold
- `lg`: 1024px - Desktop threshold

### 5.2 Desktop Behavior (≥1024px)

| Feature | Implementation |
|---------|---------------|
| Sidebar | Always visible, collapsible |
| Navigation items | Icons + labels |
| Footer | Theme + Language toggles visible |
| Mobile overlay | Not applicable |

### 5.3 Mobile/Tablet Behavior (<1024px)

| Feature | Implementation |
|---------|---------------|
| Sidebar | Collapsed by default, hamburger menu to open |
| Navigation items | Icons only (label on hover via tooltip) |
| Footer | Toggles in overlay |
| Mobile overlay | Full-screen sheet/dialog overlay |

**Implementation Details** (`MainSidebar.tsx`):

```typescript
// Mobile detection
const isMobile = useMediaQuery('(max-width: 1024px)');

// Mobile overlay state
const [mobileOpen, setMobileOpen] = useState(false);

// Sheet component for mobile
<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
  <SheetContent side="left" className="w-[280px]">
    <MainSidebarContent />
  </SheetContent>
</Sheet>
```

### 5.4 Mobile Navigation Issues

| Issue | Status | Notes |
|-------|--------|-------|
| Touch target size | ✅ OK | 44px minimum on buttons |
| Sidebar animation | ✅ OK | Smooth open/close transitions |
| Orientation change | ⚠️ Partial | May need resize handling |
| Keyboard navigation | ✅ OK | Focus trap in overlay |

---

## 6. Layout Component Comparison

### 6.1 MainLayout (69 lines)

**Purpose**: Hub/navigation layout for non-IDE pages

```
┌────────────────────────────────────────┐
│ MainLayout                             │
├────────────────────────────────────────┤
│ ┌──────┐                               │
│ │ Side │  Page Content Area            │
│ │ bar  │                               │
│ │      │                               │
│ └──────┘                               │
│ ┌──────┐ Footer (theme, language)      │
│ │Footer│                               │
│ └──────┘                               │
└────────────────────────────────────────┘
```

**Characteristics**:
- Fixed-width sidebar (60px collapsed, 240px expanded)
- Main content area with `flex-1`
- Footer with controls
- No resizable panels

### 6.2 IDELayout (554 lines)

**Purpose**: Full IDE experience with Monaco, terminal, file tree

```
┌────────────────────────────────────────────────────────────┐
│ IDEHeaderBar (60px fixed)                                 │
├────────────────────────────────────────────────────────────┤
│ ┌──────┬─────────────────┬──────────┐                     │
│ │ File │                 │  Preview │  (resizable)        │
│ │ Tree │   Monaco Editor │          │                     │
│ │      │                 │          │                     │
│ │      ├─────────────────┤          │                     │
│ │      │    Terminal     │          │                     │
│ │      │    (tabbed)     │          │                     │
│ └──────┴─────────────────┴──────────┘                     │
├────────────────────────────────────────────────────────────┤
│ StatusBar (28px fixed)                                    │
└────────────────────────────────────────────────────────────┘
```

**Characteristics**:
- Resizable panels via `react-resizable-panels`
- Multiple editors/terminals
- Chat panel (collapsible)
- File sync status indicators
- WebContainer status in header

---

## 7. Recommendations for Cleanup & Consolidation

### 7.1 High Priority (Critical for MVP)

#### REC-001: Consolidate Home Routes

**Action**: Remove route duplication between `/` and `/hub`

```typescript
// Option A: Redirect hub → index
// src/routes/hub.tsx
export const Route = createFileRoute('/hub')({
  component: () => <Navigate to="/" replace />,
});

// Option B: Delete hub route entirely
// Delete src/routes/hub.tsx
```

**Effort**: 1 hour
**Impact**: Reduces confusion, removes dead code

#### REC-002: Complete IDELayout State Migration

**Action**: Replace local `useState` with `useIDEStore` (after MVP-3)

**Current Blockers**: 
- Would interfere with active MVP-3 development
- State management audit (P1.10) already documented this

**Planned For**: Post-MVP stabilization

**Effort**: 4-6 hours
**Impact**: Fixes state synchronization, enables persistence

### 7.2 Medium Priority (Post-MVP)

#### REC-003: Add Route Guards

**Action**: Implement authentication/permission checks

```typescript
// Example: Protected route wrapper
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { hasPermission } = useWorkspaceActions();
  
  if (!hasPermission('access_ide')) {
    return <Navigate to="/workspace" replace />;
  }
  
  return children;
}
```

**Effort**: 4-6 hours
**Impact**: Security improvement, better UX for permission errors

#### REC-004: Unified Breadcrumb System

**Action**: Create centralized breadcrumb component used by both layouts

**Files**:
- Extract from `IDEHeaderBar.tsx`
- Create `src/components/ui/breadcrumbs.tsx` (already exists, needs enhancement)

**Effort**: 2-3 hours
**Impact**: Consistent breadcrumb UX across all routes

#### REC-005: Add Navigation Store for Active Section

**Action**: Track current navigation section in store

```typescript
// src/lib/state/navigation-store.ts
interface NavigationState {
  currentSection: 'home' | 'workspace' | 'agents' | 'settings';
  setCurrentSection: (section: NavigationState['currentSection']) => void;
}
```

**Effort**: 1-2 hours
**Impact**: Better active state handling, enables breadcrumbs in sidebar

### 7.3 Low Priority (Nice-to-Have)

#### REC-006: Remove Deprecated Header Import

**Action**: Clean up commented import in `__root.tsx`

```typescript
// Already done in frontend remediation
// import Header from '../components/Header'  // COMMENTED OUT
```

**Status**: Already addressed, confirm removal

#### REC-007: Document Route Entry Points

**Action**: Add JSDoc comments to each route file

```typescript
/**
 * Settings Route - Workspace Settings
 * @route /settings
 * @layout MainLayout
 * @description Configures AI agents, API keys, and workspace preferences
 */
export const Route = createFileRoute('/settings')({...});
```

**Effort**: 1-2 hours (all routes)
**Impact**: Better developer documentation

---

## 8. Investigation References

### 8.1 Source Files Analyzed

| File | Purpose | Last Modified |
|------|---------|---------------|
| [`src/routes/__root.tsx`](src/routes/__root.tsx) | Root route configuration | Pre-existing |
| [`src/routes/index.tsx`](src/routes/index.tsx) | Home route (/) | Pre-existing |
| [`src/routes/hub.tsx`](src/routes/hub.tsx) | Hub route (/hub) | Pre-existing |
| [`src/routes/ide.tsx`](src/routes/ide.tsx) | IDE route | 2025-12-27 |
| [`src/routes/workspace/$projectId.tsx`](src/routes/workspace/$projectId.tsx) | Project route | 2025-12-27 |
| [`src/routes/settings.tsx`](src/routes/settings.tsx) | Settings route | 2025-12-27 |
| [`src/components/layout/MainLayout.tsx`](src/components/layout/MainLayout.tsx) | Main layout | 2025-12-27 |
| [`src/components/layout/MainSidebar.tsx`](src/components/layout/MainSidebar.tsx) | Navigation sidebar | 2025-12-27 |
| [`src/components/layout/IDELayout.tsx`](src/components/layout/IDELayout.tsx) | IDE layout | Pre-existing |
| [`src/components/layout/IDEHeaderBar.tsx`](src/components/layout/IDEHeaderBar.tsx) | IDE header | Pre-existing |

### 8.2 Artifacts Referenced

| Artifact | ID | Relevance |
|----------|-----|-----------|
| Frontend Remediation Report | `REMEDIATION-FRONTEND-2025-12-27` | Route fixes, design system |
| State Management Audit P1.10 | `STATE-AUDIT-P1.10-2025-12-26` | IDELayout state issue |
| MVP Sprint Plan | `MVP-SPRINT-PLAN-2025-12-24` | Project context |
| Tech Spec MVP Completion | `TECH-SPEC-MVP-2025-12-27` | Implementation status |

### 8.3 MCP Tools Used

| Tool | Purpose | Validation |
|------|---------|------------|
| `read_file` | Analyze route files | 10 files read |
| `search_files` | Find navigation components | Pattern: `**/layout/*.tsx` |
| `codebase_search` | Semantic code search | Route patterns verified |

---

## 9. Next Steps

### Immediate Actions

1. **BMAD Master Review**: This investigation report for approval of recommendations
2. **Create Stories**: If REC-001 approved, create story for route consolidation
3. **Verify Remediation**: Confirm frontend remediation changes are working in browser

### Short-term (This Sprint)

1. E2E verification of navigation flow
2. Mobile responsiveness testing
3. Route consolidation (REC-001)

### Long-term (Post-MVP)

1. IDELayout state migration (REC-002)
2. Route guards implementation (REC-003)
3. Unified breadcrumb system (REC-004)

---

## 10. Investigation Metadata

| Field | Value |
|-------|-------|
| **Agent Mode** | `@bmad-bmm-architect` |
| **Team** | Team A (Frontend/Architecture) |
| **Start Time** | 2025-12-27T22:00:00+07:00 |
| **End Time** | 2025-12-27T22:22:00+07:00 |
| **Duration** | 22 minutes |
| **Files Analyzed** | 15+ |
| **Issues Identified** | 4 (1 Critical, 2 Medium, 1 Low) |
| **Recommendations** | 7 (2 High, 3 Medium, 2 Low) |

---

*Report generated as part of BMAD V6 framework architecture investigation cycle.*
*Next action: Report findings to @bmad-core-bmad-master for review and story creation.*
