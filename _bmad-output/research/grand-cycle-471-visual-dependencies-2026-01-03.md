# Grand Cycle 471: Visual Dependency Analysis
**Date**: 2026-01-03
**Purpose**: Visual representation of IDE component → Store dependencies

---

## 1. Current Store Architecture (3-Tier System)

```
┌─────────────────────────────────────────────────────────────────┐
│                    STORE ARCHITECTURE (3 Tiers)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  TIER 1: Legacy Stores (Being Migrated)                  │  │
│  │  Location: src/lib/state/                                │  │
│  │  Count: 25 stores                                        │  │
│  │  Status: ⚠️ 50+ components still import from here        │  │
│  │                                                           │  │
│  │  ┌───────────────────────────────────────────────────┐  │  │
│  │  │ useIDEStore                                       │  │  │
│  │  │ - Open files, active file, panels, terminal tab   │  │  │
│  │  │ - Persistence: IndexedDB (Dexie)                 │  │  │
│  │  │ - Imported by: 50+ components                    │  │  │
│  │  └───────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │  ┌───────────────────────────────────────────────────┐  │  │
│  │  │ useProviderStore (MIGRATED ✅)                    │  │  │
│  │  │ - LLM provider config, API keys, models           │  │  │
│  │  │ - Now at: infrastructure/persistence/stores/      │  │  │
│  │  └───────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │  ┌───────────────────────────────────────────────────┐  │  │
│  │  │ useToolPermissionStore (MIGRATED ✅)              │  │  │
│  │  │ - Tool trust levels, workspace permissions        │  │  │
│  │  │ - Persistence: Zustand + Dexie with partialize    │  │  │
│  │  └───────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           ↓                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  TIER 2: Deprecated Stores (Being Deleted)                │  │
│  │  Location: src/stores/                                    │  │
│  │  Count: 8 stores (most files deleted)                     │  │
│  │  Status: ❌ Empty but still referenced by components      │  │
│  │                                                           │  │
│  │  ┌───────────────────────────────────────────────────┐  │  │
│  │  │ useAgentSelectionStore                            │  │  │
│  │  │ - Selected agent per workspace                    │  │  │
│  │  │ - Persistence: localStorage                       │  │  │
│  │  │ - Imported by: 20+ components                     │  │  │
│  │  │ - Issue: ⚠️ Should migrate to infrastructure      │  │  │
│  │  └───────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │  ┌───────────────────────────────────────────────────┐  │  │
│  │  │ useProviderModelsStore (DUPLICATE)                │  │  │
│  │  │ - Available models per provider                   │  │  │
│  │  │ - Duplicate of provider-store models slice        │  │  │
│  │  └───────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           ↓                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  TIER 3: Modern Stores (Primary Location)                 │  │
│  │  Location: src/infrastructure/persistence/stores/          │  │
│  │  Count: 38+ stores                                         │  │
│  │  Status: ✅ Target location for all new stores            │  │
│  │                                                           │  │
│  │  ┌───────────────────────────────────────────────────┐  │  │
│  │  │ useAppStore (Provider + Agent Unified)            │  │  │
│  │  │ - 8 slices (3 provider + 5 agent)                 │  │  │
│  │  │ - 850 lines (consolidated from 765 lines)         │  │  │
│  │  │ - Pattern: Zustand v5 with individual selectors   │  │  │
│  │  └───────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │  ┌───────────────────────────────────────────────────┐  │  │
│  │  │ useConversationStore (TARGET for Epic CC-1)       │  │  │
│  │  │ - 6 slices planned (not yet implemented)          │  │  │
│  │  │ - God stores: 626 + 726 lines = 1,352 total       │  │  │
│  │  │ - Effort: 127 hours (15 stories)                 │  │  │
│  │  └───────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │  ┌───────────────────────────────────────────────────┐  │  │
│  │  │ useProjectStore (TARGET for Epic CP-1)            │  │  │
│  │  │ - 9 slices planned (not yet implemented)          │  │  │
│  │  │ - God stores: 450 + 509 lines = 959 total         │  │  │
│  │  │ - Effort: 80-100 hours (18 stories)               │  │  │
│  │  └───────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │  ┌───────────────────────────────────────────────────┐  │  │
│  │  │ useIDEStore (TARGET for Phase 0.3)                │  │  │
│  │  │ - 5 slices planned (not yet implemented)          │  │  │
│  │  │ - Current: 158K lines (legacy location)           │  │  │
│  │  │ - Target: 600 lines (5 slices × 120 lines)        │  │  │
│  │  │ - Effort: 16-20 hours                             │  │  │
│  │  └───────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. IDE Component → Store Dependency Graph

```
┌─────────────────────────────────────────────────────────────────┐
│              IDE COMPONENTS (149 files)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  LAYER 1: Layout Components (13 files)                   │  │
│  │                                                           │  │
│  │  IDELayoutMain.tsx ────────┐                             │  │
│  │  MobileIDELayout.tsx ──────┤                             │  │
│  │  IconSidebar.tsx ──────────┤                             │  │
│  │  StatusBar.tsx ────────────┤──► useIDEStore (Legacy)     │  │
│  │  CommandPalette.tsx ───────┤   ┌──────────────────┐     │  │
│  │  FeatureSearch.tsx ────────┘   │ Legacy Location  │     │  │
│  │  UnifiedNavigation.tsx ──┐    │ src/lib/state/   │     │  │
│  │                           │    │ ide-store.ts    │     │  │
│  │  [6 more files]          │    └──────────────────┘     │  │
│  └───────────────────────────┘                            │  │
│                                                           │  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  LAYER 2: Editor Components (8 files)                    │  │
│  │                                                           │  │
│  │  MonacoEditor.tsx ─────────┐                             │  │
│  │  EditorTabBar.tsx ─────────┤                             │  │
│  │  PreviewPanel.tsx ─────────┤──► useIDEStore (Legacy)     │  │
│  │  XTerminal.tsx ────────────┤   ┌──────────────────┐     │  │
│  │  TerminalPanel.tsx ────────┘   │ Legacy Location  │     │  │
│  │                           │    │ src/lib/state/   │     │  │
│  │  [3 more files]          │    │ ide-store.ts    │     │  │
│  └───────────────────────────┘    └──────────────────┘     │  │
│                                                           │  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  LAYER 3: File Tree Components (11 files)                │  │
│  │                                                           │  │
│  │  FileTree.tsx ─────────────┐                             │  │
│  │  FileTreeItem.tsx ─────────┤                             │  │
│  │  ContextMenu.tsx ──────────┤──► useIDEStore (Legacy)     │  │
│  │  useFileTreeState.ts ──────┤   ┌──────────────────┐     │  │
│  │  useFileTreeActions.ts ────┘   │ Legacy Location  │     │  │
│  │  useFileTreeEvents.ts ────┐    │ src/lib/state/   │     │  │
│  │                           │    │ ide-store.ts    │     │  │
│  │  [5 more files]          │    └──────────────────┘     │  │
│  └───────────────────────────┘                            │  │
│                                                           │  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  LAYER 4: Agent Chat Components (8 files)                │  │
│  │                                                           │  │
│  │  AgentChatPanel ──────────┐                             │  │
│  │  AgentChatAPIKeyManager ──┤                             │  │
│  │  AgentChatApprovals ──────┤──► useIDEStore +            │  │
│  │  AgentChatEnhancingUI ────┤   useAgentSelectionStore +   │  │
│  │  AgentChatHeader ─────────┤   useAppStore                │  │
│  │  AgentChatStatus ─────────┤   ┌──────────────────┐     │  │
│  │  AgentChatToolFacades ────┘   │ 3 Store Imports! │     │  │
│  │  useAgentChatApprovals ──┐    │ HIGH RISK        │     │  │
│  │                           │    └──────────────────┘     │  │
│  └───────────────────────────┘                            │  │
│                                                           │  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  LAYER 5: Discovery Components (7 files)                 │  │
│  │                                                           │  │
│  │  BentoGrid.tsx ─────────────┐                            │  │
│  │  BentoCardPreview.tsx ──────┤                            │  │
│  │  CommandPalette.tsx ────────┤──► NO STORE DEPENDENCY     │  │
│  │  FeatureSearch.tsx ─────────┤   (Standalone UI)          │  │
│  │  QuickActionsMenu.tsx ──────┘                            │  │
│  │  [2 more files]                                         │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                           │  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  LAYER 6: Other Components (22 files)                    │  │
│  │                                                           │  │
│  │  ProcessPanel.tsx ──────────┐                            │  │
│  │  SyncPanel.tsx ─────────────┤                            │  │
│  │  ApiKeyStatus.tsx ──────────┤──► useIDEStore (Legacy)     │  │
│  │  IDETerminalPanel.tsx ──────┤   ┌──────────────────┐     │  │
│  │  [18 more files]          │    │ Legacy Location  │     │  │
│  └───────────────────────────┘    │ src/lib/state/   │     │  │
│                                   │ ide-store.ts    │     │  │
│                                   └──────────────────┘     │  │
│                                                            │  │
└────────────────────────────────────────────────────────────┘
```

---

## 3. Cross-Workspace Component Reuse

```
┌─────────────────────────────────────────────────────────────────┐
│           CROSS-WORKSPACE IDE COMPONENT USAGE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  KNOWLEDGE WORKSPACE (4 IDE components)                  │  │
│  │                                                           │  │
│  │  KnowledgePage.tsx                                       │  │
│  │       │                                                  │  │
│  │       ├──► BentoGrid.tsx ────┐                           │  │
│  │       │                      │ NO STORE DEPS            │  │
│  │       ├──► CommandPalette.tsx │ (Standalone UI)         │  │
│  │       │                      │ RISK: LOW               │  │
│  │       ├──► FeatureSearch.tsx │                         │  │
│  │       │                      │                         │  │
│  │       └──► UnifiedNavigation ─┘                         │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           ↓                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  NOTES WORKSPACE (3 IDE components)                      │  │
│  │                                                           │  │
│  │  NoteEditor.tsx                                          │  │
│  │       │                                                  │  │
│  │       ├──► MonacoEditor.tsx ──┐                          │  │
│  │       │                      │ useIDEStore dependency   │  │
│  │       ├──► StatusBar.tsx ────┤ RISK: MEDIUM             │  │
│  │       │                      │ (Open files state)      │  │
│  │       └──► IconSidebar.tsx ──┘                          │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           ↓                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  STUDY WORKSPACE (2 IDE components)                      │  │
│  │                                                           │  │
│  │  StudyPage.tsx                                           │  │
│  │       │                                                  │  │
│  │       ├──► CommandPalette.tsx ──┐                        │  │
│  │       │                        │ NO STORE DEPS          │  │
│  │       └──► FeatureSearch.tsx ───┘ RISK: LOW             │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           ↓                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  SHARED ACROSS ALL WORKSPACES                            │  │
│  │                                                           │  │
│  │  AgentChatPanel ────┐                                    │  │
│  │                    │                                     │  │
│  │  Used in IDE ───────┼──► useIDEStore +                  │  │
│  │  Knowledge          │    useAgentSelectionStore +        │  │
│  │  Notes              │    useAppStore                     │  │
│  │  Study              │                                     │  │
│  │                    │    ┌──────────────────┐            │  │
│  │                    │    │ 3 STORE IMPORTS  │            │  │
│  │                    └────┤ CRITICAL DEP     │            │  │
│  │                         └──────────────────┘            │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Migration Impact Timeline

```
┌─────────────────────────────────────────────────────────────────┐
│              MIGRATION PHASES & DEPENDENCIES                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  WEEK 1-2: Foundation Stabilization (Phase 0)                   │
│  ─────────────────────────────────────────────                  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PHASE 0.1: Provider Store Consolidation (DONE ✅)       │  │
│  │  Epic AC-1.2 - 12 hours                                  │  │
│  │  Output: useAppStore (3 provider slices)                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PHASE 0.2: Agent Store Consolidation (IN PROGRESS ⏳)   │  │
│  │  Epic AC-1 - 42 hours                                    │  │
│  │  Output: useAppStore (5 agent slices)                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PHASE 0.3: IDE Store Migration (THIS ASSESSMENT)        │  │
│  │  - Create 5 IDE store slices (16-20 hours)               │  │
│  │  - Update 159 component imports (12.5 hours)             │  │
│  │  - Write 85 tests (8 hours)                              │  │
│  │  - Data migration script (4 hours)                       │  │
│  │  TOTAL: 40.5 hours                                       │  │
│  │                                                           │  │
│  │  ⚠️  BLOCKED BY: Epic AC-1 (must complete first)        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  WEEK 3-4: Store Refactoring (Phase 1)                          │
│  ──────────────────────────────────                              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PHASE 1.1: Conversation Consolidation (Epic CC-1)        │  │
│  │  - Create 6 conversation slices (20 hours)               │  │
│  │  - Migrate conversation stores (30 hours)                │  │
│  │  - Component migration (47 hours)                        │  │
│  │  TOTAL: 127 hours (15 stories)                           │  │
│  │                                                           │  │
│  │  ⚠️  BLOCKS IDE Migration: AgentChatPanel dependency     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PHASE 1.2: Project Consolidation (Epic CP-1)            │  │
│  │  - Create 9 project slices (18 hours)                   │  │
│  │  - Migrate project stores (32 hours)                    │  │
│  │  - Component migration (30 hours)                        │  │
│  │  TOTAL: 80-100 hours (18 stories)                        │  │
│  │                                                           │  │
│  │  ✅ INDEPENDENT: Can run in parallel with IDE migration  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Store State Shape Comparison

```
┌─────────────────────────────────────────────────────────────────┐
│            LEGACY vs MODERN STORE STATE SHAPE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  LEGACY: src/lib/state/ide-store.ts                             │
│  ─────────────────────────────────────                          │
│                                                                  │
│  interface IDEState {                                            │
│    // Open Files                                                │
│    openFiles: OpenFile[];                                       │
│    activeFile: string | null;                                  │
│                                                                  │
│    // Panel State                                               │
│    panels: {                                                    │
│      explorer: boolean;                                         │
│      terminal: boolean;                                         │
│      chat: boolean;                                            │
│      preview: boolean;                                          │
│    };                                                          │
│                                                                  │
│    // Terminal Tab                                              │
│    terminalTab: 'shell' | 'processes';                         │
│                                                                  │
│    // Chat Visibility                                           │
│    chatVisible: boolean;                                        │
│                                                                  │
│    // 20+ action methods...                                     │
│    addOpenFile: (file: OpenFile) => void;                      │
│    removeOpenFile: (path: string) => void;                     │
│    setActiveFile: (path: string | null) => void;               │
│    toggleChat: () => void;                                     │
│    setTerminalTab: (tab: 'shell' | 'processes') => void;       │
│    // ... 15 more actions                                       │
│  }                                                              │
│                                                                  │
│  Total: ~158,000 lines (in packed output)                       │
│  Location: src/lib/state/ide-store.ts                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│  MODERN: src/infrastructure/persistence/stores/ide/ (TARGET)     │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  SLICE 1: ide-metadata-slice.ts (120 lines)             │  │
│  │                                                           │  │
│  │  interface IDEMetadataState {                            │  │
│  │    openFiles: Record<string, OpenFile>;                 │  │
│  │    activeFileId: string | null;                         │  │
│  │    lastActiveFile: string | null;                       │  │
│  │                                                           │  │
│  │    // Actions (CRUD)                                    │  │
│  │    createOpenFile: (file: OpenFile) => string;          │  │
│  │    updateOpenFile: (id: string, updates: Partial<OpenFile>) => void; │  │
│  │    deleteOpenFile: (id: string) => void;                │  │
│  │    setActiveFile: (id: string | null) => void;          │  │
│  │    getActiveFile: () => OpenFile | undefined;           │  │
│  │  }                                                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  SLICE 2: ide-panel-slice.ts (100 lines)                │  │
│  │                                                           │  │
│  │  interface IDEPanelState {                               │  │
│  │    panels: {                                             │  │
│  │      explorer: boolean;                                  │  │
│  │      terminal: boolean;                                  │  │
│  │      chat: boolean;                                      │  │
│  │      preview: boolean;                                   │  │
│  │    };                                                    │  │
│  │                                                           │  │
│  │    // Actions                                            │  │
│  │    togglePanel: (panelId: PanelId) => void;              │  │
│  │    showPanel: (panelId: PanelId) => void;                │  │
│  │    hidePanel: (panelId: PanelId) => void;                │  │
│  │    isPanelVisible: (panelId: PanelId) => boolean;        │  │
│  │  }                                                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  SLICE 3: ide-terminal-slice.ts (80 lines)              │  │
│  │                                                           │  │
│  │  interface IDETerminalState {                            │  │
│  │    terminalTab: 'shell' | 'processes';                  │  │
│  │    shellHistory: string[];                               │  │
│  │    maxHistorySize: number;                                │  │
│  │                                                           │  │
│  │    // Actions                                            │  │
│  │    setTerminalTab: (tab: 'shell' | 'processes') => void; │  │
│  │    addToShellHistory: (command: string) => void;         │  │
│  │    clearShellHistory: () => void;                        │  │
│  │    getShellHistory: () => string[];                      │  │
│  │  }                                                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  SLICE 4: ide-utils-slice.ts (90 lines)                  │  │
│  │                                                           │  │
│  │  // Utility functions (no state)                         │  │
│  │  interface IDEUtils {                                    │  │
│  │    getOpenFileById: (id: string) => OpenFile | undefined;│  │
│  │    getOpenFilesByLanguage: (language: string) => OpenFile[]; │  │
│  │    sortOpenFiles: (files: OpenFile[]) => OpenFile[];     │  │
│  │    filterOpenFiles: (predicate: (f: OpenFile) => boolean) => OpenFile[]; │  │
│  │  }                                                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  SLICE 5: ide-events-slice.ts (70 lines)                │  │
│  │                                                           │  │
│  │  interface IDEEventState {                               │  │
│  │    // Event emitters (no persisted state)                │  │
│  │    onFileOpen: (file: OpenFile) => void;                 │  │
│  │    onFileClose: (fileId: string) => void;                │  │
│  │    onActiveFileChange: (fileId: string) => void;         │  │
│  │  }                                                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Total: ~460 lines (5 slices × avg 92 lines)                     │
│  Reduction: 99.7% (158K → 460 lines via compression + slicing)   │
│  Location: src/infrastructure/persistence/stores/ide/             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Risk Assessment Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│                    MIGRATION RISK MATRIX                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  IMPACT vs PROBABILITY                                      │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │                                                              │ │
│  │            LOW          MEDIUM         HIGH                  │ │
│  │              │              │              │                 │ │
│  │        ┌─────┴─────┐         │         ┌─────┴─────┐         │ │
│  │  HIGH  │   1       │         │         │    2      │         │ │
│  │  IMPACT│ Facade    │         │         │ IndexedDB │         │ │
│  │        │ exports   │         │         │ migration │         │ │
│  │        └───────────┘         │         └───────────┘         │ │
│  │              │              │              │                 │ │
│  │        ┌─────┴─────┐         │         ┌─────┴─────┐         │ │
│  │  MEDIUM│   3       │         │         │    4      │         │ │
│  │  IMPACT│ Component │         │         │ Circular   │         │ │
│  │        │ updates   │         │         │ deps       │         │ │
│  │        └───────────┘         │         └───────────┘         │ │
│  │              │              │              │                 │ │
│  │        ┌─────┴─────┐         │         ┌─────┴─────┐         │ │
│  │  LOW   │   5       │         │         │    6      │         │ │
│  │  IMPACT│ Test      │         │         │ State      │         │ │
│  │        │ coverage  │         │         │ mismatch   │         │ │
│  │        └───────────┘         │         └───────────┘         │ │
│  │                                                              │ │
│  │         LOW PROBABILITY    MEDIUM PROBABILITY   HIGH PROBABILITY│ │
│  │                                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Risk Details:                                                   │
│  ─────────────                                                   │
│                                                                  │
│  1. Facade Exports (HIGH Impact, LOW Probability)               │
│     - Mitigation: Create re-export facade in legacy location     │
│     - Probability: LOW (well-tested pattern from provider store) │
│     - Impact: HIGH (affects 159 component references)            │
│                                                                  │
│  2. IndexedDB Migration (HIGH Impact, MEDIUM Probability)       │
│     - Mitigation: Backup script, verification, rollback          │
│     - Probability: MEDIUM (schema changes are complex)           │
│     - Impact: HIGH (data loss = critical issue)                  │
│                                                                  │
│  3. Component Updates (MEDIUM Impact, LOW Probability)          │
│     - Mitigation: Batch migration, incremental testing           │
│     - Probability: LOW (mechanical search-and-replace)           │
│     - Impact: MEDIUM (159 files across 5 batches)                │
│                                                                  │
│  4. Circular Dependencies (MEDIUM Impact, HIGH Probability)     │
│     - Mitigation: Zustand v5 get() pattern, slice isolation     │
│     - Probability: HIGH (4 high-risk cycles identified)          │
│     - Impact: MEDIUM (causes infinite re-renders)                │
│                                                                  │
│  5. Test Coverage (LOW Impact, LOW Probability)                │
│     - Mitigation: 85 tests (50 unit + 20 integration + 15 E2E)  │
│     - Probability: LOW (test patterns well-established)          │
│     - Impact: LOW (catches regressions early)                    │
│                                                                  │
│  6. State Mismatch (LOW Impact, MEDIUM Probability)            │
│     - Mitigation: Ensure modern store has ALL legacy properties  │
│     - Probability: MEDIUM (easy to miss state properties)        │
│     - Impact: LOW (causes runtime errors, detectable in tests)   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Success Criteria Checklist

```
┌─────────────────────────────────────────────────────────────────┐
│              SUCCESS CRITERIA CHECKLIST                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CODE QUALITY                                                    │
│  ────────────                                                    │
│  [ ] All 159 component imports updated to modern location        │
│  [ ] Zero legacy imports remaining (grep verification)           │
│  [ ] Zero TypeScript errors (pnpm tsc --noEmit)                 │
│  [ ] Zero ESLint warnings                                        │
│  [ ] All files ≤120 lines (slices only)                         │
│                                                                  │
│  STORE CONSOLIDATION                                             │
│  ────────────────────                                            │
│  [ ] 5 IDE store slices created (460 lines total)               │
│  [ ] Unified store exported from index.ts                       │
│  [ ] Facade exports in legacy location (backwards compat)       │
│  [ ] All state properties from legacy store present            │
│  [ ] No circular dependencies (dependency check)                 │
│                                                                  │
│  TESTING                                                         │
│  ───────                                                         │
│  [ ] 50 unit tests written (10 per slice)                       │
│  [ ] 20 integration tests written (cross-slice)                  │
│  [ ] 15 E2E tests written (critical workflows)                   │
│  [ ] Test coverage ≥80% (vitest --coverage)                      │
│  [ ] All tests passing (pnpm test)                              │
│                                                                  │
│  DATA MIGRATION                                                  │
│  ───────────────                                                  │
│  [ ] IndexedDB migration script created                         │
│  [ ] Migration tested with 5 edge cases                         │
│  [ ] Backup + rollback mechanism verified                       │
│  [ ] Zero data loss in migration tests                          │
│  [ ] State integrity verified (pre/post migration)              │
│                                                                  │
│  PERFORMANCE                                                      │
│  ────────────                                                    │
│  [ ] Store bundle size reduced by ≥20% (650KB target)           │
│  [ ] Initial render time reduced by ≥25% (100-150ms target)     │
│  [ ] Store updates ≤10ms (Zustand v5 selectors)                 │
│  [ ] No infinite re-renders (React DevTools verification)       │
│                                                                  │
│  DOCUMENTATION                                                   │
│  ─────────────                                                   │
│  [ ] CLAUDE.md updated (remove deprecated store refs)           │
│  [ ] AGENTS.md updated (new store import patterns)              │
│  [ ] Migration plan marked complete                             │
│  [ ] JSDoc comments on all exported functions                   │
│  [ ] Type definitions in src/types/ (not store files)           │
│                                                                  │
│  CROSS-WORKSPACE COMPATIBILITY                                   │
│  ────────────────────────────                                    │
│  [ ] Knowledge workspace still works (4 components tested)      │
│  [ ] Notes workspace still works (3 components tested)           │
│  [ ] Study workspace still works (2 components tested)           │
│  [ ] AgentChatPanel works in all 4 workspaces                   │
│  [ ] Zero breaking changes to workspace APIs                   │
│                                                                  │
│  DEPLOYMENT SAFETY                                               │
│  ─────────────────                                              │
│  [ ] Feature flag ready (USE_MODERN_IDE_STORE=false)            │
│  [ ] A/B testing plan documented (10% → 100% rollout)           │
│  [ ] Sentry error tracking configured                           │
│  [ ] Rollback procedure tested (facade deletion)                │
│  [ ] User feedback mechanism in place                           │
│                                                                  │
│  TOTAL CHECKLIST ITEMS: 50                                      │
│  TARGET COMPLETION: ≥90% (45/50 items)                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

**Visual Analysis Completed**: 2026-01-03
**Companion Document**: `grand-cycle-471-codebase-analysis-2026-01-03.md`
**Next Phase**: Detailed migration plan creation (Phase 0.3)
