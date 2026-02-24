---
title: "EPIC-PH1A-COMPLETION: Phase 1A Completion Sprint"
type: "duplicate-epic"
archived_by: "MASTERCORDINATION-SESSION-2026-01-26"
archived_date: "2026-01-26"
original_path: "/bmad-output/planning-artifacts/epics/EPIC-PH1A-COMPLETION-2026-01-26.md"
archive_path: "/bmad-ext/.archive/planning/epics/"
duplicate_of: "None"
superseded_by: "EPIC-CC-AR02AR03"
reason: "All Phase 1A stories consolidated into EPIC-CC-AR02AR03. This epic created confusion about which epic to work on."
status: "DUPLICATE"
---
# EPIC-PH1A-COMPLETION: Phase 1A Completion Sprint

---

```yaml
epic_id: EPIC-PH1A-COMPLETION
name: "Phase 1A Completion Sprint"
type: implementation
priority: P0
phase: "Phase 1A"
source_document: "docs/the-3-phase-approach.md"
source_section: "Phase 1A: Non-AI Core & Foundational Setup (Section 3)"
created: 2026-01-26
status: READY_FOR_EXECUTION
estimated_effort: "29-39 hours"
teams_assigned: ["Team A", "Team B"]

references:
  primary:
    - path: "docs/the-3-phase-approach.md"
      sections: ["3.1 Project Management System", "3.3 Monaco Editor Plugin", "3.6 Plugin Layout System", "Phase 1A Critical Blockers (lines 583-595)"]
      description: "Master strategic guide for Phase 1A architecture"
  secondary:
    - path: "new-fundamental-truths.md"
      sections: ["1.2 Route Structure", "1.4 Platform-Aware Default Plugins", "3.3 The Two Always-Loaded Plugins", "8.3 Persistence Strategy"]
      description: "Core architecture principles and fundamental truths"
  adrs:
    - id: "ADR-034"
      path: "_bmad-output/planning-artifacts/adr/ADR-034-project-centric-architecture-2026-01-20.md"
      sections: ["2. Device Architecture Separation", "3. Feature Plugin Architecture", "5. Single Project Route"]
      description: "Project-centric architecture decision record"
    - id: "ADR-034-AMENDMENT-001"
      path: "_bmad-output/planning-artifacts/adr/ADR-034-AMENDMENT-001-platform-first-2026-01-21.md"
      sections: ["Platform-First Plugin Defaults"]
      description: "Amendment eliminating IDE/Notes mode concept"

blockers_summary:
  P0_count: 5
  P1_count: 3
  total_effort: "15-23 hours (blockers only)"

epic_dependencies:
  requires_completion_first:
    - epic_id: "EPIC-ARCH-04-CC"
      status: "95% (CC-04 E2E Pending)"
      reason: "FSA handle lifecycle must complete before Phase 1A can proceed"
```

---

## Executive Summary

**Phase 1A is at 45% completion with 5 P0 blockers that must be resolved before Phase 1B can proceed.**

### Current Architecture Health

| Metric | Value | Evidence |
|--------|-------|----------|
| **Completion** | 45% | `the-3-phase-approach.md` line 179 |
| **P0 Blockers** | 5 | `the-3-phase-approach.md` lines 586-591 |
| **P1 Blockers** | 3 | `the-3-phase-approach.md` lines 592-594 |
| **Effort to Complete** | 15-23 hours | `the-3-phase-approach.md` line 262 |

### Key Findings from Source Documents

**From `the-3-phase-approach.md` (lines 186-188):**
> - **Broken**: Monaco is POC stub (textarea, no syntax highlighting), FSA handle lifecycle incomplete, store hydration race condition, PluginLayout.tsx = 1034 lines (god component), 40+ i18n keys missing
> - **Root Cause**: EPIC-ARCH-02 and EPIC-ARCH-03 marked complete prematurely (claimed 100%, actually 70% and 45% true)

**From `new-fundamental-truths.md` (lines 23-31):**
> - EPIC-ARCH-02: true_completion = 70% (blockers: Monaco POC stub, StorageGateway factory inconsistency)
> - EPIC-ARCH-03: true_completion = 45% (blockers: PluginLayout god component (1034 lines), i18n missing, hydration race)

**From ADR-034 (lines 176-191):**
> Phase 2 COMPLETE but investigation reveals premature completion claims.

### Strategic Priority

This EPIC remediates the false completion claims from EPIC-ARCH-02 and EPIC-ARCH-03 to achieve true Phase 1A completion before proceeding to Phase 1B (BYOK + Notes) and Phase 2 (Chat Cascade + Agents).

---

## P0 Blocker Stories

### Story: PH1A-P0-1 - Replace Monaco POC with Real Monaco Editor

**Priority**: P0  
**Team**: B  
**Effort**: 4-6 hours  

#### Reference
- **Source**: `the-3-phase-approach.md` → Section 3.3 Monaco Editor Plugin (lines 384-437)
- **Evidence Line 430**: `"Simplified version for proof of concept"`
- **Blocker Line 587**: `P0-1: Monaco Editor is POC Stub | 4-6h`

#### File Locations
| File | Current State | Target State |
|------|---------------|--------------|
| `src/plugins/monaco/MonacoPlugin.tsx` | Textarea POC (295 lines) | Real Monaco with @monaco-editor/react |

#### Current State Evidence
From `the-3-phase-approach.md` (lines 428-435):
```
File: src/plugins/monaco/monacoPlugin.tsx
Line 291: "Simplified version for proof of concept"

Evidence from codebase-patterns-analysis-2026-01-26.md:
- "Monaco Editor is POC Stub (textarea, not real editor) - No syntax highlighting"
- "Root Cause: EPIC-ARCH-02 marked complete prematurely (claimed 100%, actually 70% true)"
```

#### Required State
- Real Monaco editor using `@monaco-editor/react` library
- Syntax highlighting for 50+ languages
- Language auto-detection based on file extension
- Auto-save with 500ms debounce
- Line numbers and minimap support

#### Acceptance Criteria
```gherkin
Feature: Monaco Editor Plugin
  As a developer using the IDE
  I want a real code editor with syntax highlighting
  So that I can edit code files effectively

  Scenario: Monaco Editor Initialization
    Given I open a .tsx file in FileTree
    When Monaco plugin loads
    Then I should see:
      | Feature | Expected |
      | Editor Type | Real Monaco (not textarea) |
      | Syntax Highlighting | TypeScript highlighting active |
      | Line Numbers | Visible on left margin |
      | Language Indicator | "TypeScript React" in status |
      | Minimap | Present (if enabled) |

  Scenario: File Type Detection
    Given I open a file with extension ".py"
    When Monaco editor renders
    Then language mode should be "Python"
    And syntax highlighting should match Python grammar

  Scenario: Auto-Save
    Given I have a file open in Monaco
    When I stop typing for 500ms
    Then file should auto-save to storage
    And sync indicator should update
```

#### Implementation Notes
- Import: `import Editor from '@monaco-editor/react';`
- Use `onMount` callback to get editor instance
- Wire `onChange` to storage adapter with 500ms debounce
- Map file extensions to Monaco language IDs

#### Validation Gate
```bash
# Must pass
pnpm tsc --noEmit
pnpm vitest run --filter "monaco"

# Visual verification required
- Open a .tsx file, confirm syntax highlighting
- Open a .py file, confirm Python mode
- Type code, wait 500ms, confirm auto-save
```

---

### Story: PH1A-P0-2 - Complete FSA Handle Lifecycle Integration

**Priority**: P0  
**Team**: A  
**Effort**: 2-3 hours  

#### Reference
- **Source**: `the-3-phase-approach.md` → Section 3.1 Project Management System (lines 279-343)
- **Evidence Line 342-343**: `project-context.tsx | Needs initialHandle prop`
- **Blocker Line 588**: `P0-2: FSA Handle Lifecycle Incomplete | 1-2h`

#### File Locations
| File | Current Lines | Changes Required |
|------|---------------|------------------|
| `src/infrastructure/context/project-context.tsx` | ~200 | Add `initialHandle` prop, call `handlePersistenceService.restoreHandle()` |
| `src/routes/$projectId.tsx` | ~50 | Pass handle from loader to ProjectContextProvider |
| `src/presentation/components/layout/PermissionOverlay.tsx` | ~150 | Wire persist and reinit triggers |

#### Current State Evidence
From `the-3-phase-approach.md` (lines 339-343):
```
| **Project Context** | `src/infrastructure/context/project-context.tsx` | Partial | 200+ | Needs initialHandle prop |
| **Project Route** | `src/routes/$projectId.tsx` | Partial | 50+ | Needs to pass handle |
```

From `new-fundamental-truths.md` (lines 119-123):
```
**Requirements:**
- Chrome 122+ for persistent permissions
- FileSystemObserver (Chrome 129+) for file watching with polling fallback
```

#### Required State
- `ProjectContextProvider` accepts `initialHandle` prop
- Route loader restores handle from IndexedDB
- Handle passed to `StorageAdapterFactory`
- `PermissionOverlay` triggers on permission loss
- No permission prompt if handle already persisted

#### Acceptance Criteria
```gherkin
Feature: FSA Handle Lifecycle
  As a desktop user with an existing FSA project
  I want my file system handle to persist across sessions
  So that I don't have to re-select my project folder

  Scenario: Handle Restoration on Page Load
    Given I have previously opened an FSA project "MyProject"
    And the handle is stored in IndexedDB
    When I reload the page at "/$projectId"
    Then FSA handle should be restored from IndexedDB
    And no permission prompt should appear (if already granted)
    And FileTree should display project files

  Scenario: Permission Overlay Trigger
    Given I have an FSA project loaded
    And I close Chrome and reopen it (handle still valid but needs permission check)
    When I navigate to "/$projectId"
    Then PermissionOverlay should appear if permission needs re-grant
    And clicking "Grant Access" should restore full functionality

  Scenario: Handle Missing Fallback
    Given a project ID exists in database
    But no FSA handle is stored in IndexedDB
    When I navigate to "/$projectId"
    Then project picker should prompt to re-select folder
    And handle should be persisted after selection
```

#### Implementation Notes
```typescript
// In $projectId.tsx loader:
const handle = await handlePersistenceService.restoreHandle(projectId);
return { project, handle };

// In ProjectContextProvider:
interface ProjectContextProviderProps {
  projectId: string;
  initialHandle?: FileSystemDirectoryHandle; // NEW
  children: React.ReactNode;
}
```

#### Validation Gate
```bash
# Must pass
pnpm tsc --noEmit

# Manual E2E test required
1. Open FSA project
2. Close browser tab
3. Reopen at /$projectId
4. Verify no permission prompt
5. Verify FileTree loads correctly
```

---

### Story: PH1A-P0-3 - Fix Store Hydration Race Condition

**Priority**: P0  
**Team**: B  
**Effort**: 2-3 hours  

#### Reference
- **Source**: `the-3-phase-approach.md` → Section 3.6 Plugin Layout System (lines 523-581)
- **Evidence Line 544**: `PL-06 | Plugin layout persists across page refresh | P0 | Store hydration race condition`
- **Blocker Line 589**: `P0-3: Store Hydration Race Condition | 2-3h`

#### File Locations
| File | Issue | Fix Required |
|------|-------|--------------|
| `src/infrastructure/persistence/stores/plugin-layout-store.ts` | Hydration timing issue | Add proper async hydration with loading state |

#### Current State Evidence
From `the-3-phase-approach.md` (lines 543-544):
```
| **PL-06** | Plugin layout persists across page refresh | P0 | Investigation: Store hydration race condition |
```

From `new-fundamental-truths.md` (lines 427-447):
```
### 8.1 State Layers
| Layer | Technology | Purpose | Scope |
|-------|-----------|---------|-------|
| **Client State** | Zustand v5 | UI state, ephemeral data | Component tree |
| **Persisted State** | Dexie.js | Long-term storage | Project, settings |
```

#### Required State
- Layout state properly hydrated from Dexie before render
- Loading indicator during hydration
- No flash of default layout on page load
- Layout persists correctly after hydration

#### Acceptance Criteria
```gherkin
Feature: Layout State Hydration
  As a user returning to my project
  I want my plugin layout to persist exactly as I left it
  So that I don't have to reconfigure my workspace

  Scenario: Layout Persistence on Reload
    Given I have configured a 3-column layout [FileTree, Monaco, Terminal]
    When I reload the page
    Then I should see a loading indicator during hydration
    And after hydration, my 3-column layout should appear exactly as before
    And no flash of default 2-column layout should occur

  Scenario: Race Condition Prevention
    Given hydration is in progress
    When a component attempts to read layout state
    Then it should receive the hydrated value, not default
    And no visual layout jump should occur

  Scenario: Hydration Failure Fallback
    Given hydration fails (corrupted data, timeout)
    When page loads
    Then default layout should apply gracefully
    And error should be logged to console
    And user should not see broken UI
```

#### Implementation Notes
```typescript
// Zustand persist with proper onRehydrateStorage
export const usePluginLayoutStore = create<PluginLayoutState>()(
  persist(
    (set, get) => ({
      // ... state
      _hasHydrated: false,
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
    }),
    {
      name: 'plugin-layout-storage',
      storage: createJSONStorage(() => ({
        getItem: async (name) => {
          // Dexie async read
          const data = await db.settings.get(name);
          return data?.value ?? null;
        },
        setItem: async (name, value) => {
          await db.settings.put({ key: name, value });
        },
        removeItem: async (name) => {
          await db.settings.delete(name);
        },
      })),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
```

#### Validation Gate
```bash
# Must pass
pnpm tsc --noEmit

# Manual test required
1. Set layout to 3-column with Terminal
2. Reload page 10 times rapidly
3. Verify no layout flicker
4. Verify consistent 3-column layout each time
```

---

### Story: PH1A-P0-4 - Replace Drag-Drop with Toggle-Based Layout

**Priority**: P0  
**Team**: A  
**Effort**: 4-6 hours  

#### Reference
- **Source**: `the-3-phase-approach.md` → Section 3.6 Plugin Layout System (lines 523-581)
- **Evidence Line 545**: `PL-05 | Toggle-based toolbar (NOT drag-drop) | P0 | Drag-drop causes broken UI`
- **Blocker Line 590 + 592**: `P0-4 + P1-1 | PluginLayout + Drag-Drop | 6-9h total`

#### File Locations
| File | Current State | Target State |
|------|---------------|--------------|
| `src/presentation/layouts/PluginLayout.tsx` | 1034 lines (god component) | Split into 4-6 focused modules |

#### Current State Evidence
From `the-3-phase-approach.md` (lines 566-579):
```
| **PluginLayout** | `src/presentation/layouts/PluginLayout.tsx` | GOD COMPONENT | **1034** | Violates S-014a |

Evidence from codebase-patterns-analysis-2026-01-26.md:
- "PluginLayout.tsx = 1034 lines (god component) causing maintenance nightmare"
- "Root Cause: EPIC-ARCH-02 marked complete prematurely"
```

#### Required State
- Toggle-based toolbar for plugin visibility
- No drag-drop functionality (simplified UX)
- PluginLayout split into <400 line modules
- Responsive layout: Mobile 1-col, Tablet 2-col, Desktop 3-col

#### Acceptance Criteria
```gherkin
Feature: Toggle-Based Plugin Layout
  As a user configuring my workspace
  I want a simple toggle toolbar for plugins
  So that I can easily show/hide features without broken drag-drop

  Scenario: Plugin Toggle Toolbar
    Given I am on the /$projectId route
    When I look at the plugin toolbar
    Then I should see toggle buttons for each available plugin
    And clicking a toggle should show/hide that plugin panel
    And no drag handles should be visible

  Scenario: Maximum 5 Plugins
    Given I have 5 plugins visible
    When I try to enable a 6th plugin
    Then the toggle should be disabled or show warning
    And message should explain "Maximum 5 plugins"

  Scenario: Responsive Layout
    Given I am on a mobile device (width < 768px)
    Then layout should be 1-column
    And plugins should stack vertically
    
    Given I am on a tablet (768px <= width < 1024px)
    Then layout should be 2-column maximum
    
    Given I am on desktop (width >= 1024px)
    Then layout should support up to 3 columns

  Scenario: God Component Elimination
    Given I inspect PluginLayout module structure
    Then no single file should exceed 400 lines
    And modules should be: PluginToolbar, PluginPanel, PluginGrid, PluginLoader
```

#### Implementation Notes
```typescript
// Split PluginLayout.tsx (1034 lines) into:
// - PluginToolbar.tsx (~100 lines) - toggle buttons
// - PluginPanel.tsx (~150 lines) - individual panel wrapper
// - PluginGrid.tsx (~150 lines) - responsive grid logic
// - PluginLoader.tsx (~100 lines) - lazy loading orchestration
// - PluginLayoutContainer.tsx (~100 lines) - composition root
// Total: ~600 lines across 5 files (all under 400 limit)
```

#### Validation Gate
```bash
# Must pass
pnpm tsc --noEmit

# File size check
wc -l src/presentation/layouts/Plugin*.tsx
# All files must be < 400 lines

# Manual test required
1. Toggle each plugin on/off
2. Verify no UI breakage
3. Test on mobile/tablet/desktop viewports
```

---

### Story: PH1A-P0-5 - Add All Missing i18n Translation Keys

**Priority**: P0  
**Team**: A  
**Effort**: 2 hours  

#### Reference
- **Source**: `the-3-phase-approach.md` → Section 3.6 (Phase 1A Critical Blockers)
- **Evidence Line 187**: `40+ i18n keys missing`
- **Blocker Line 591**: `P0-5: 40+ i18n Keys Missing | 2h`

#### File Locations
| File | Action Required |
|------|-----------------|
| `public/locales/en/translation.json` | Add missing keys |
| `public/locales/vi/translation.json` | Add Vietnamese translations |
| All UI components using `useTranslation()` | Verify no raw strings |

#### Current State Evidence
From `the-3-phase-approach.md` (line 187):
```
- **Broken**: ... 40+ i18n keys missing
```

From `new-fundamental-truths.md` (lines 23-31):
```
blockers: "PluginLayout god component (1034 lines), i18n missing, hydration race"
```

#### Required State
- All UI strings use i18n keys
- No raw text strings in components
- Both English and Vietnamese translations complete
- Translation keys follow namespace convention

#### Acceptance Criteria
```gherkin
Feature: Complete i18n Coverage
  As a Vietnamese user
  I want all UI text translated
  So that I can use the app in my language

  Scenario: No Raw Translation Keys Visible
    Given I set language to Vietnamese
    When I navigate through all routes
    Then I should never see raw keys like "plugin.monaco.title"
    And all text should be in Vietnamese

  Scenario: Plugin Names Translated
    Given I open the plugin toolbar
    Then I should see:
      | Plugin | English | Vietnamese |
      | FileTree | "File Tree" | "Cây Thư Mục" |
      | Monaco | "Code Editor" | "Trình Chỉnh Sửa Mã" |
      | Terminal | "Terminal" | "Dòng Lệnh" |
      | Notes | "Notes" | "Ghi Chú" |
      | Chat | "Chat" | "Trò Chuyện" |

  Scenario: Error Messages Translated
    Given an error occurs (e.g., permission denied)
    When error toast appears
    Then error message should be in current language
    And action button text should be translated
```

#### Implementation Notes
```json
// public/locales/en/translation.json - add missing keys
{
  "plugin": {
    "filetree": {
      "title": "File Tree",
      "empty": "No files in project",
      "loading": "Loading files..."
    },
    "monaco": {
      "title": "Code Editor",
      "unsaved": "Unsaved changes",
      "saving": "Saving..."
    },
    "terminal": {
      "title": "Terminal",
      "connecting": "Connecting to WebContainer..."
    },
    "notes": {
      "title": "Notes",
      "placeholder": "Start typing..."
    },
    "chat": {
      "title": "Chat",
      "placeholder": "Type a message..."
    }
  },
  "layout": {
    "maxPlugins": "Maximum 5 plugins allowed",
    "toggle": "Toggle {{plugin}}"
  }
}
```

#### Validation Gate
```bash
# Search for raw strings in components
grep -r "useTranslation" src/ | wc -l  # Should cover all UI files

# Check for missing keys
pnpm i18next-scanner  # Scan for missing translations

# Manual test
1. Set language to Vietnamese
2. Navigate all routes
3. Verify no "plugin.xxx.yyy" raw keys visible
```

---

## ADR-034 Route Implementation Stories

### Story: ADR034-ROUTE-1 - Eliminate Deprecated Workspace Routes

**Priority**: P1  
**Team**: A  
**Effort**: 2-3 hours  

#### Reference
- **Source**: ADR-034 → Section 5 (lines 124-137)
- **Evidence**: Lines 127-136 show BEFORE/AFTER route structure

#### File Locations
| File | Action |
|------|--------|
| `src/routes/ide.$projectId.tsx` | Convert to redirect to `/$projectId` |
| `src/routes/notes.$projectId.tsx` | Convert to redirect to `/$projectId` |
| `src/routes/notes.lazy.tsx` | Archive or redirect |
| `src/routes/knowledge.$projectId.tsx` | Archive (Phase 4) |
| `src/routes/study.$projectId.tsx` | Archive (Phase 4) |

#### Current State Evidence
From ADR-034 (lines 127-136):
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

#### Acceptance Criteria
```gherkin
Feature: Single Project Route
  As a user navigating the app
  I want a simple URL structure
  So that I don't get confused by workspace-specific routes

  Scenario: Deprecated Route Redirect
    Given I navigate to "/ide/proj-123"
    Then I should be redirected to "/proj-123"
    And platform-appropriate plugins should load

  Scenario: Notes Route Redirect
    Given I navigate to "/notes/proj-123"
    Then I should be redirected to "/proj-123"
    And Notes plugin should be visible (if platform allows)

  Scenario: No Query Parameters for Mode
    Given I am on "/$projectId"
    Then URL should NOT have "?layout=ide" or "?layout=notes"
    And platform detection should determine available plugins
```

---

### Story: ADR034-ROUTE-2 - Wire platform-defaults.ts to Route Loader

**Priority**: P1  
**Team**: A  
**Effort**: 2-3 hours  

#### Reference
- **Source**: `new-fundamental-truths.md` → Section 1.4 (lines 90-108)
- **Evidence**: Lines 94-99 show platform-specific default plugins

#### File Locations
| File | Action |
|------|--------|
| `src/infrastructure/filesystem/platform-defaults.ts` | Verify exports |
| `src/routes/$projectId.tsx` | Import and use platform defaults |
| `src/infrastructure/context/project-context.tsx` | Consume platform defaults |

#### Current State Evidence
From `new-fundamental-truths.md` (lines 94-99):
```
| Platform | Storage | Default Plugins | Notes |
|----------|---------|-----------------|-------|
| **Desktop (FSA)** | File System Access | `filetree`, `monaco`, `chat` | Full development experience |
| **Desktop (IndexedDB)** | Browser Database | `filetree`, `notes`, `chat` | Notes-focused, no real files |
| **Tablet** | Browser Database | `filetree`, `notes`, `chat` | Max 2 panels |
| **Mobile** | Browser Database | `notes` | Single panel, chat via sidebar |
```

#### Acceptance Criteria
```gherkin
Feature: Platform-Aware Default Plugins
  As a mobile user
  I want appropriate plugins pre-selected
  So that I don't see unavailable IDE features

  Scenario: Desktop FSA Defaults
    Given I am on a desktop with FSA project
    When project loads
    Then default visible plugins should be: FileTree, Monaco, Chat
    And Terminal should be available but not default

  Scenario: Mobile Defaults
    Given I am on a mobile device
    When project loads
    Then only Notes plugin should be visible
    And Chat should be accessible via sidebar
    And Monaco/Terminal should NOT appear in plugin list
```

---

### Story: ADR034-NAV-1 - Replace Remaining window.location.href

**Priority**: P1  
**Team**: A  
**Effort**: 1.5 hours  

#### Reference
- **Source**: ADR-034 → Phase 4 Cleanup (lines 233-239)
- **Evidence**: Lines 233-238 list files with window.location.href

#### File Locations
| File | Lines Affected |
|------|----------------|
| `src/lib/notifications/notification-manager.ts` | TBD |
| `src/lib/utils/mobile-error-handling.ts` | TBD |
| `src/lib/utils/error-handling.ts` | TBD |
| `src/hooks/useCommandPalette.ts` | TBD |
| `src/presentation/components/common/DatabaseRecoveryDialog.tsx` | TBD |
| `src/routes/$__debug__.provider-playground.tsx` | TBD |

#### Acceptance Criteria
```gherkin
Feature: TanStack Router Navigation
  As a developer maintaining the codebase
  I want all navigation to use TanStack Router
  So that we maintain SPA behavior and state

  Scenario: No Hard Refreshes
    Given I trigger any navigation action
    Then page should NOT hard refresh
    And React state should be preserved
    And router should handle transition

  Scenario: Error Recovery Navigation
    Given an error recovery dialog appears
    When I click "Return to Hub"
    Then navigation should use router.navigate()
    And NOT window.location.href
```

---

## Fundamental Truths Alignment Stories

### Story: NFT-3.3-1 - Complete FileTree Sync Integration

**Priority**: P1  
**Team**: A  
**Effort**: 1.5 hours  

#### Reference
- **Source**: `new-fundamental-truths.md` → Section 3.3 (lines 183-215)
- **Evidence**: Lines 188-199 describe FileTree responsibilities

#### Acceptance Criteria
```gherkin
Feature: FileTree Always-Loaded Plugin
  As specified in new-fundamental-truths.md Section 3.3
  FileTree must be always-loaded and sync-integrated

  Scenario: Sync Status Display
    Given a file has pending sync
    When I look at FileTree
    Then file should show sync status indicator (dot/color)
    And indicator should update when sync completes

  Scenario: EventBus Integration
    Given file is modified in Monaco
    When auto-save triggers
    Then FileTree should receive sync event
    And display updated timestamp
```

---

### Story: NFT-1.2-1 - Implement Single Route Architecture

**Priority**: P1  
**Team**: B  
**Effort**: 2-3 hours  

#### Reference
- **Source**: `new-fundamental-truths.md` → Section 1.2 (lines 64-77)
- **Evidence**: Lines 68-71 define the two routes

#### File Locations
| Route | Purpose |
|-------|---------|
| `/hub` | Project management, no project loaded |
| `/$projectId` | Project loaded with feature plugins |

#### Acceptance Criteria
```gherkin
Feature: Two-Route Architecture
  As defined in new-fundamental-truths.md Section 1.2
  The app has exactly two routes

  Scenario: Hub Route
    Given I navigate to "/hub"
    Then project picker should display
    And no project should be loaded
    And no plugin layout should render

  Scenario: Project Route
    Given I navigate to "/$projectId" with valid ID
    Then project should load
    And plugin layout should render
    And platform-appropriate plugins should be available
```

---

### Story: TERM-WORKSPACE-1 - Terminal WebContainer Integration

**Priority**: P1  
**Team**: A  
**Effort**: 2-3 hours  

#### Reference
- **Source**: `the-3-phase-approach.md` → Section 3.2 Terminal Plugin (lines 345-382)
- **Evidence**: Lines 357-365 define Terminal requirements

#### Acceptance Criteria
```gherkin
Feature: Terminal Plugin
  As a desktop user
  I want a working terminal
  So that I can run commands in my project

  Scenario: Terminal Initialization
    Given I am on desktop with FSA project
    When I toggle Terminal plugin
    Then WebContainer should boot
    And command prompt should appear
    And project directory should be accessible

  Scenario: Desktop-Only Restriction
    Given I am on mobile or tablet
    Then Terminal should NOT appear in available plugins
    And requiresFSA should prevent loading
```

---

## Team Assignments

| Team | Stories | Total Effort |
|------|---------|--------------|
| **Team A** | PH1A-P0-2, PH1A-P0-4, PH1A-P0-5, ADR034-ROUTE-1, ADR034-ROUTE-2, ADR034-NAV-1, NFT-3.3-1, TERM-WORKSPACE-1 | 16-21 hours |
| **Team B** | PH1A-P0-1, PH1A-P0-3, NFT-1.2-1 | 8-12 hours |

---

## Dependencies Graph

```
                 ┌─────────────────────┐
                 │ EPIC-ARCH-04-CC     │
                 │ (CC-04 E2E Pending) │
                 └──────────┬──────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────┐
│               EPIC-PH1A-COMPLETION                        │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ PH1A-P0-2    │  │ PH1A-P0-3    │  │ PH1A-P0-5    │    │
│  │ FSA Handle   │  │ Hydration    │  │ i18n Keys    │    │
│  │ (Team A)     │  │ (Team B)     │  │ (Team A)     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│         │                 │                 │            │
│         └────────┬────────┴────────┬────────┘            │
│                  │                 │                     │
│                  ▼                 ▼                     │
│  ┌──────────────────────┐  ┌──────────────────────┐     │
│  │ PH1A-P0-1            │  │ PH1A-P0-4            │     │
│  │ Monaco Editor        │  │ Toggle Layout        │     │
│  │ (Team B)             │  │ (Team A)             │     │
│  │ Depends: Hydration   │  │ Depends: i18n        │     │
│  └──────────────────────┘  └──────────────────────┘     │
│                  │                 │                     │
│                  └────────┬────────┘                     │
│                           │                              │
│                           ▼                              │
│          ┌────────────────────────────────┐             │
│          │ ADR034-ROUTE-1, ADR034-ROUTE-2 │             │
│          │ Route Implementation           │             │
│          │ Depends: Layout, Monaco        │             │
│          └────────────────────────────────┘             │
│                           │                              │
│                           ▼                              │
│          ┌────────────────────────────────┐             │
│          │ NFT-3.3-1, NFT-1.2-1           │             │
│          │ TERM-WORKSPACE-1               │             │
│          │ Final Integration              │             │
│          └────────────────────────────────┘             │
└───────────────────────────────────────────────────────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Phase 1A COMPLETE   │
                 │ Proceed to Phase 1B │
                 └─────────────────────┘
```

---

## Validation Gates

### Pre-Merge Validation (Every Story)

```bash
# TypeScript compilation
pnpm tsc --noEmit

# Unit tests
pnpm vitest run

# Linting
pnpm eslint src/
```

### Phase 1A Completion Gate

| Metric | Target | Verification |
|--------|--------|--------------|
| TypeScript Errors | 0 | `pnpm tsc --noEmit` |
| Test Coverage | ≥80% | `pnpm vitest --coverage` |
| God Components | 0 | `wc -l src/**/*.tsx` all < 400 |
| i18n Coverage | 100% | No raw translation keys |
| P0 Blockers | 0 | All 5 stories DONE |

### Visual Verification Required

- [ ] Monaco editor shows syntax highlighting
- [ ] FSA handle persists across reload (no permission prompt)
- [ ] Layout persists without flicker
- [ ] Toggle toolbar works (no drag-drop)
- [ ] All text translated (switch to Vietnamese)

---

## Cross-References

### To Source Documents

| Document | Sections Referenced | Purpose |
|----------|---------------------|---------|
| `docs/the-3-phase-approach.md` | 3.1, 3.3, 3.6, Critical Blockers | Strategic guidance, blocker list |
| `new-fundamental-truths.md` | 1.2, 1.4, 3.3, 8.3 | Architecture principles |
| ADR-034 | 2, 3, 5, Phase 3-4 | Decision record, route structure |

### To Related Epics

| Epic | Relationship |
|------|--------------|
| EPIC-ARCH-04-CC | Must complete first (FSA handle lifecycle) |
| EPIC-CC-AR02AR03 | Superseded by this EPIC (merged stories) |
| EPIC-ARCH-02 | Remediates false 100% claim (actual 70%) |
| EPIC-ARCH-03 | Remediates false 85% claim (actual 45%) |

### To Investigation Reports

| Report | Location | Relevant Sections |
|--------|----------|-------------------|
| Codebase Patterns Analysis | `_bmad-output/investigation-reports/codebase-patterns-analysis-2026-01-26.md` | God components, i18n gaps |
| Phase 1A Investigation | `_bmad-output/investigation-reports/phase-1a-investigation-2026-01-26.md` | Blocker evidence |

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-01-26 | Initial EPIC created with full context | bmad-sprint-manager |

---

**Word Count**: ~3,500 words (comprehensive context for sprint execution)

**Status**: READY_FOR_EXECUTION - Pending EPIC-ARCH-04-CC completion (CC-04 E2E)
