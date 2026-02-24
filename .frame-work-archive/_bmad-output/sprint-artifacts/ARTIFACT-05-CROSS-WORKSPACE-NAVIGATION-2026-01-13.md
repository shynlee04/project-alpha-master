# ARTIFACT 5: Cross-Workspace Navigation Investigation
**Date:** 2026-01-13
**Focus:** Cross-Workspace Layout & Navigation
**Status:** INVESTIGATION COMPLETE

---

## ULTRA-THINK: What This Artifact Is

**This IS:**
- ✅ Evidence-based investigation of cross-workspace navigation
- ✅ Route mapping between workspaces
- ✅ State sharing and persistence patterns
- ✅ Layout architecture across workspaces

**This is NOT:**
- ❌ Assumptions without code verification
- ❌ Implementation recommendations
- ❌ Solutions without investigation

---

## ROUTE STRUCTURE

### Main Routes
| Route | Workspace | Layout | description |
|-------|-----------|--------|---------|
| `/` | Hub | MainLayout | Home page with project selection |
| `/ide/:projectId` | IDE | IDELayoutMain | Full IDE with file system, chat, terminal |
| `/notes/:projectId` | Notes | NotesPage | BlockNote editor with AI features |
| `/knowledge/:projectId` | Knowledge | KnowledgePage | Placeholder for future RAG workspace |
| `/study/:projectId` | Study | StudyPage | Placeholder for future study tools |

**Evidence:** Route definitions in `src/routes/`

---

## LAYOUT ARCHITECTURE

### Non-Project Routes
**Layout:** MainLayout with MainSidebar
- Hub (`/`)
- About
- Settings

**Components:**
- MainSidebar (global navigation)
- No project-specific state

### Project Routes
**Layout:** Workspace-specific layouts
- IDE: IDELayoutMain with resizable panels
- Notes: NotesPage with sidebar/editor split
- Knowledge: KnowledgePage (placeholder)
- Study: StudyPage (placeholder)

**Shared Element:** All project routes include IDEHeaderBar with workspace switcher

---

## WORKSPACE SWITCHING

### Mechanism
```
1. ProjectProvider wraps each workspace route
   └── Provides project context (id, name, bindings)

2. WorkspaceTransitionManager orchestrates state changes
   └── Handles state preservation during switch

3. Cross-workspace event bus coordinates events
   └── DomainEventType filters agent availability

4. localStorage remembers last workspace per project
   └── Enables "return to last workspace" feature
```

### WorkspaceSwitcher Component
**File:** `src/presentation/components/ide/IDEHeaderBar`

**Props Flow:**
```typescript
ProjectProvider → IDEHeaderBar → WorkspaceSwitcher
    ↓
Current workspace + Available workspaces
    ↓
User selects workspace → navigate to route
```

---

## STATE SHARING

### Shared State (Across All Workspaces)
| State | Storage | Scope |
|-------|---------|-------|
| Project metadata | ProjectContext | All workspaces |
| Active workspace | localStorage | Per project |
| Enabled workspaces | Project bindings | All workspaces |
| Agent selection | Agent store | Per workspace |

### Separate State (Per Workspace)
| Workspace | Isolated State |
|-----------|---------------|
| IDE | Open files, panel configs, terminal state |
| Notes | Notes content, active note, sidebar state |
| Knowledge | (Not fully implemented) |
| Study | (Not fully implemented) |
| Chat | Unified chat (shared across IDE and Notes) |

---

## NAVIGATION FLOWS

### Flow 1: Initial Entry
```
User visits app → Hub page (/)
    ↓
Selects project → Redirected to last used workspace
    ↓
Workspace loads with persisted state
```

### Flow 2: Workspace Switching
```
User in any workspace
    ↓
Clicks WorkspaceSwitcher dropdown
    ↓
Selects different workspace
    ↓
Navigate to /{workspace}/{projectId}
    ↓
New workspace loads, project state preserved
```

### Flow 3: Direct Navigation
```
User types direct URL or uses deep link
    ↓
Route loader fetches project metadata
    ↓
Workspace renders with project context
    ↓
State hydrated from persistence
```

---

## CHAT INTEGRATION ACROSS WORKSPACES

### Chat in IDE Workspace
- **Location:** Right panel (resizable)
- **Features:** Full tool access, file system integration, terminal tools
- **Agent:** Coding agent with file/terminal tools

### Chat in Notes Workspace
- **Location:** Right panel (30% width)
- **Features:** Note context, limited tools (note CRUD only)
- **Agent:** Notes agent with note-specific system prompt

### Shared Chat State
```
UnifiedChatStore (IndexedDB persistence)
    ├── Conversations (workspace-scoped)
    ├── Threads (workspace-scoped)
    └── Messages (within threads)

Workspace switching:
    → Chat state preserved per workspace
    → Active conversation remembered
    → Thread context maintained
```

---

## LAYOUT COMPARISON

### IDE Layout
```
┌─────────────────────────────────────────────────────────────┐
│ IDEHeaderBar (Workspace Switcher | Agent Selector | Project)│
├──────┬──────────────────────────────┬────────────────────────┤
│Icon  │ Editor + Preview             │ Terminal               │
│Side  │ (Resizable)                  │ (Collapsible)           │
│Bar   │                               │                        │
│      ├──────────────────────────────┴────────────────────────┤
│      │ Chat Panel (Resizable)                                  │
└──────┴─────────────────────────────────────────────────────────┘
```

### Notes Layout
```
┌─────────────────────────────────────────────────────────────┐
│ IDEHeaderBar (Workspace Switcher | Agent Selector | Project)│
├────────────┬───────────────────────────┬─────────────────────┤
│ NoteSidebar │ NoteEditor                │ Chat Panel          │
│ (20-30%)    │ (50%)                     │ (30%)               │
│            │                           │                     │
│ Notes/Files/AI views                   │ UnifiedChatPanel   │
└────────────┴───────────────────────────┴─────────────────────┘
```

---

## IDENTIFIED ISSUES

### Critical (P0)
1. **Knowledge/Study workspaces incomplete** - Placeholder components only
   - **Evidence:** KnowledgePage.tsx, StudyPage.tsx minimal implementation

### High (P1)
2. **No unified navigation state** - Each workspace manages its own nav state
3. **Layout inconsistency** - Notes has 3-column, IDE has complex resizable panels
4. **Chat panel differs** - Different features available in IDE vs Notes chat

### Medium (P2)
5. **No transition animations** - Workspace switch is abrupt
6. **State not fully preserved** - Some UI state resets on workspace switch

---

## DELIVERABLES STATUS

- ✅ Routes mapped
- ✅ Layout architecture documented
- ✅ Workspace switching mechanism analyzed
- ✅ State sharing patterns identified
- ✅ Navigation flows documented
- ✅ Chat integration mapped

---

**Last Updated:** 2026-01-13
**Version:** 1.0
**Agent ID:** ab3423e
