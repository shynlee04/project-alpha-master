# ADR-034: Project-Centric Architecture with Feature Plugins

**Status:** PROPOSED
**Date:** 2026-01-20
**Decision Makers:** User (Product Owner), Architect Agent
**Supersedes:** None (extends ADR-033)

---

## Context

After 5 iterations of "bug fixes" (V1-V5) that failed to resolve the persistent Notes import infinite loop and navigation issues, comprehensive investigation revealed that **patches cannot fix architectural debt**.

### Root Causes Identified

| Problem | Current State | Impact |
|---------|---------------|--------|
| **9 Application Entry Points** | Each route has independent logic | Inconsistent behavior, dead ends |
| **7 Project Creation Paths** | Wizard, Hub cards, IDE folder picker, etc. | Duplicate projects, lost handles |
| **2 Project Pointers** | `projects` table + `fsaHandles` table | Out of sync, permissions fail |
| **Workspace-Centric Model** | State/components duplicated per workspace | FileTree in 3 places |
| **Device Model Confusion** | FSA + IndexedDB mixed without clean boundary | Edge cases everywhere |
| **15+ Deprecated UI Elements** | Knowledge/Study routes exist but redirect | User confusion |

### Failed Patch Attempts (Evidence)

- **V5 Fix 2**: Replaced `window.location.href` in ProjectPickerDialog, but 11 other instances remain
- **V5 Fix 4**: Gateway initialization, but doesn't address why async is needed
- **All fixes**: Treated symptoms, not architectural root cause

---

## Decision

### 1. Adopt Project-Centric Architecture

**BEFORE (Workspace-Centric):**
```
Route → Workspace → Project → Features
/notes → NotesWorkspace → project.notes → NotesEditor
/ide → IDEWorkspace → project.ide → Monaco + FileTree + Terminal
```
- Duplicated state management per workspace
- Inconsistent project loading between workspaces
- FileTree component exists in 3 different forms

**AFTER (Project-Centric):**
```
Route → Project → Feature Plugins
/$projectId → ProjectContext → [FileTree, Monaco, Notes, Terminal, Chat]
```
- Single source of truth for project state
- Features are plugins that render into layout slots
- No workspace-specific duplication

### 2. Device Architecture Separation

**Desktop (FSA) vs Mobile (IndexedDB)** - completely separate flows:

| Aspect | Desktop (FSA) | Mobile (IndexedDB) |
|--------|---------------|-------------------|
| Project Creation | Folder picker → FSA handle | Browser project → Dexie |
| Storage | Real files on disk | Virtual files in IndexedDB |
| IDE Access | Full IDE with terminal | Blocked - Notes only |
| Persistence | Handle in IndexedDB | Files in IndexedDB |
| Sync | Bidirectional (external editors) | Single source (no sync) |

### 3. Feature Plugin Architecture

Each feature becomes a self-contained plugin:

```typescript
interface FeaturePlugin {
  id: 'filetree' | 'monaco' | 'notes' | 'terminal' | 'chat' | 'agents';
  name: string;
  icon: React.ReactNode;
  
  // Rendering
  component: React.FC<FeaturePluginProps>;
  sidebarComponent?: React.FC<SidebarPluginProps>;
  
  // Requirements
  requiresFSA: boolean;
  requiresProject: boolean;
  minWidth: number;
  maxInstances: 1 | 2 | 'unlimited';
  
  // State
  usePluginStore: () => PluginState;
}
```

### 4. Unified Layout System

Users select up to 5 features in flexible layouts:

```
┌─────────────────────────────────────────────────────────────────┐
│ PROJECT SIDEBAR │           MAIN CONTENT AREA                   │
│                 │  ┌─────────┬─────────┬─────────┐              │
│ - Project List  │  │ Plugin  │ Plugin  │ Plugin  │              │
│ - Chat Threads  │  │   1     │   2     │   3     │              │
│ - Agent Tools   │  │(Monaco) │ (Notes) │(Terminal)│              │
│                 │  └─────────┴─────────┴─────────┘              │
└─────────────────┴───────────────────────────────────────────────┘
```

Layout options: 1-column, 2-column split, 3-column, 2+1 (main + sidebar)

### 5. Single Project Route

Replace 9 routes with 2:

```
BEFORE:
/ide/$projectId
/notes/$projectId  
/knowledge/$projectId
/study/$projectId
/workspace/$projectId

AFTER:
/hub                    # Project management, no project loaded
/$projectId             # Project loaded with feature plugins
```

---

## Consequences

### Positive

1. **Single Source of Truth** - Project state in one place
2. **No Duplication** - FileTree, Chat, etc. exist once
3. **Clean Device Separation** - FSA desktop vs IndexedDB mobile
4. **Progressive Disclosure** - Simple default, advanced on demand
5. **Extensible** - New features as plugins without core changes

### Negative

1. **Migration Effort** - 8-week refactor estimated
2. **Breaking Changes** - URL structure changes
3. **Learning Curve** - New plugin architecture

### Neutral

1. **Route Structure Changes** - From workspace-based to project-based
2. **Component Reorganization** - From presentation/components/ to plugins/

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2) - EPIC-ARCH-01
- [ ] Create unified ProjectContext with single storage accessor
- [ ] Implement device-specific entry flows (FSA vs IndexedDB)
- [ ] Consolidate 7 project creation paths to 2 (FSA + IndexedDB)
- [ ] Remove Knowledge/Study UI elements (defer to Phase 4)
- [ ] Replace all `window.location.href` with navigate()

### Phase 2: Feature Plugins (Week 3-4) - EPIC-ARCH-02
- [ ] Define FeaturePlugin interface
- [ ] Convert FileTree to plugin
- [ ] Convert Monaco to plugin
- [ ] Convert Notes/BlockNote to plugin
- [ ] Convert Terminal to plugin

### Phase 3: Layout System (Week 5-6) - EPIC-ARCH-03
- [ ] Implement flexible layout engine
- [ ] Create ProjectSidebar with project list + chat threads
- [ ] Support 1/2/3 column layouts
- [ ] Implement plugin drag-and-drop

### Phase 4: Cleanup & Migration (Week 7-8) - EPIC-ARCH-04
- [ ] Remove deprecated workspace routes
- [ ] Implement Knowledge/Study as plugins (if needed)
- [ ] Final testing and migration scripts
- [ ] Documentation update

---

## Alternatives Considered

### Option A: Continue Patching (REJECTED)
- Keep adding fixes to specific bugs
- **Rejected because**: 5 iterations failed, architectural debt too deep

### Option B: Complete Rewrite (REJECTED)
- Start from scratch with new architecture
- **Rejected because**: Loses working code, too expensive

### Option C: Incremental Refactor (SELECTED)
- 4-phase migration preserving working code
- **Selected because**: Lowest risk, maintains functionality during transition

---

## References

- ADR-033: Correct Course Architectural Remediation
- User feedback: 2026-01-20 bug investigation session
- Dev team report: ARCH-UNIFIED-REPORT-2026-01-20

---

## Approval

- [ ] User (Product Owner)
- [ ] Architect Agent
- [ ] Dev Team Lead

**Signatures Required Before Implementation**
