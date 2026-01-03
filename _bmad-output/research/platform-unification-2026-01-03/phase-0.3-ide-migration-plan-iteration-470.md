# Phase 0.3: IDE Workspace Migration Plan

**Date**: 2026-01-03
**Iteration**: 470
**Governance**: EPIC-CP-1, EPIC-CC-1
**Status**: PLANNING
**Estimated Effort**: 10-12 hours

**Purpose**: Refactor 339-line god store into focused slices following December 2025 Zustand patterns.

---

## Executive Summary

Phase 0.3 migrates the IDE workspace state from a monolithic 339-line god store into 6 focused slices (<120 lines each), applying lessons learned from VSCode architecture and modern Zustand patterns.

### Target Architecture

```
src/infrastructure/persistence/stores/ide/
├── ide-types.ts                    # Type definitions
├── ide-editor-slice.ts             # Monaco file state (~90 lines)
├── ide-explorer-slice.ts           # File tree state (~70 lines)
├── ide-layout-slice.ts             # Panel layout (~80 lines)
├── ide-terminal-slice.ts           # Terminal state (~50 lines)
├── ide-project-slice.ts            # Project scoping (~60 lines)
├── ide-selectors-slice.ts          # AI context (~80 lines)
├── useIDEStore.ts                  # Unified store (~100 lines)
└── index.ts                        # Barrel export (~30 lines)
```

**Total Lines**: ~560 lines (vs 339 lines currently, but with:
- Clear separation of concerns
- Type safety throughout
- Zero god stores
- AI-observable selectors
- Cross-slice communication via get()
- Persist middleware on combined store only

---

## Current State Analysis

### Existing Stores

**1. ide-store.ts** (339 lines) - GOD STORE ❌
- **File Management**: openFiles, activeFile, activeFileScrollTop
- **Explorer State**: expandedPaths (Set<string>)
- **Layout State**: panelLayouts, chatVisible
- **Terminal State**: terminalTab
- **Project Scoping**: projectId
- **AI Context**: selectForAIContext, selectFileContext (selectors)

**2. layout-store.ts** (142 lines) - KEEP SEPARATE ✅
- Sidebar collapse state (application-level, not IDE-specific)
- Mobile menu state (application-level)
- Navigation items (application-level)
- **Decision**: This is application layout, not IDE workspace layout. Keep as-is.

**3. workspace-store.ts** (190 lines) - KEEP SEPARATE ✅
- Current workspace tracking (cross-workspace concern)
- Workspace transitions (cross-workspace concern)
- Agent/tool availability (cross-workspace concern)
- **Decision**: This orchestrates all workspaces, not IDE-specific. Keep as-is.

**4. WebContainer** (singleton) - NO STORE NEEDED ✅
- Module-level state (instance, bootPromise)
- Event bus emission (container:booted)
- **Decision**: Well-encapsulated singleton pattern, no Zustand store needed.

### Dependencies

**Files Using IDE State**:
- **Layout Components** (3 files):
  - MainSidebar.tsx (useLayoutStore - application layout)
  - MobileIDELayout.tsx (useIDEStore - IDE layout state)
  - MainLayout.tsx (useLayoutStore - application layout)

- **IDE Components** (3 core files):
  - MonacoEditor.tsx (uses openFiles, activeFile, activeFileScrollTop)
  - EditorTabBar.tsx (uses openFiles, activeFile)
  - FileTree.tsx (uses expandedPaths)

- **Terminal Components** (1 file):
  - XTerminal.tsx (uses terminalTab)

- **Status Components** (2 files):
  - WebContainerStatus.tsx (WebContainer singleton)
  - FeatureSearch.tsx (no state dependency)

**Total Component Migrations**: ~4 components (low risk)

---

## Migration Strategy

### Phase 0.3.1: Type Definitions (Step 1) ✅

**File**: `src/infrastructure/persistence/stores/ide/ide-types.ts`

**Purpose**: Centralize all IDE-related type definitions with clear separation of concerns.

**Interface Design**:

```typescript
/**
 * File tab in Monaco editor
 */
export interface EditorTab {
  path: string;
  title: string;
  dirty: boolean;
  active: boolean;
}

/**
 * File tree node (for explorer)
 */
export interface FileTreeNode {
  path: string;
  name: string;
  type: 'file' | 'folder';
  expanded?: boolean;
  children?: FileTreeNode[];
}

/**
 * Panel layout state
 */
export interface PanelLayout {
  groupId: string;
  sizes: number[];
  visible: boolean;
}

/**
 * IDE Editor State
 */
export interface IDEEditorState {
  openFiles: string[];
  activeFile: string | null;
  activeFileScrollTop: number;

  // Actions
  addOpenFile: (path: string) => void;
  removeOpenFile: (path: string) => void;
  setActiveFile: (path: string | null) => void;
  setActiveFileScrollTop: (scrollTop: number) => void;
}

/**
 * IDE Explorer State
 */
export interface IDEExplorerState {
  expandedPaths: Set<string>;

  // Actions
  toggleExpanded: (path: string) => void;
  setExpandedPaths: (paths: string[]) => void;
  isExpanded: (path: string) => boolean;
}

/**
 * IDE Layout State
 */
export interface IDELayoutState {
  panelLayouts: Record<string, number[]>;
  chatVisible: boolean;

  // Actions
  setPanelLayout: (groupId: string, layout: number[]) => void;
  setChatVisible: (visible: boolean) => void;
  toggleChatVisible: () => void;
}

/**
 * IDE Terminal State
 */
export type TerminalTab = 'terminal' | 'output' | 'problems';

export interface IDETerminalState {
  terminalTab: TerminalTab;

  // Actions
  setTerminalTab: (tab: TerminalTab) => void;
}

/**
 * IDE Project State
 */
export interface IDEProjectState {
  projectId: string | null;

  // Actions
  setProjectId: (projectId: string | null) => void;
  reset: () => void;
}

/**
 * AI Context Selectors (for AI agents)
 */
export interface IDESelectorsState {
  selectForAIContext: (state: CombinedIDEState) => AIContext;
  selectFileContext: (state: CombinedIDEState) => FileContext;
}

/**
 * AI Context (for agent tools)
 */
export interface AIContext {
  projectId: string | null;
  activeFile: string | null;
  openFiles: string[];
  expandedPaths: string[];
  chatVisible: boolean;
  terminalTab: TerminalTab;
}

/**
 * File Context (minimal, for AI tools)
 */
export interface FileContext {
  projectId: string | null;
  activeFile: string | null;
  openFiles: string[];
}

/**
 * Combined IDE State (all slices)
 */
export type CombinedIDEState = IDEEditorState &
  IDEExplorerState &
  IDELayoutState &
  IDETerminalState &
  IDEProjectState;
```

**Acceptance Criteria**:
- [ ] All interfaces defined with JSDoc comments
- [ ] Zero `any` types
- [ ] Clear separation between state and actions
- [ ] AI context interfaces separated (not part of slices)

**Estimated Time**: 1-2 hours

---

### Phase 0.3.2: Editor Slice (Step 2)

**File**: `src/infrastructure/persistence/stores/ide/ide-editor-slice.ts`

**Purpose**: Manage Monaco editor file state (open files, active file, scroll position).

**State**:
```typescript
{
  openFiles: string[],
  activeFile: string | null,
  activeFileScrollTop: number,
}
```

**Actions**:
- `addOpenFile(path)` - Add file to open files (auto-activate)
- `removeOpenFile(path)` - Remove file (activate last file or null)
- `setActiveFile(path)` - Set active file
- `setActiveFileScrollTop(scrollTop)` - Save scroll position

**Key Patterns**:
- Auto-activate new files when added
- When closing active file, activate previous file
- Persist scroll position for restoration after navigation

**Acceptance Criteria**:
- [ ] File <120 lines (excluding imports/comments)
- [ ] All state typed (no `any`)
- [ ] Auto-activation logic correct
- [ ] Scroll position preservation

**Estimated Time**: 1.5-2 hours

---

### Phase 0.3.3: Explorer Slice (Step 3)

**File**: `src/infrastructure/persistence/stores/ide/ide-explorer-slice.ts`

**Purpose**: Manage file tree expanded state.

**State**:
```typescript
{
  expandedPaths: Set<string>,
}
```

**Actions**:
- `toggleExpanded(path)` - Toggle folder expansion
- `setExpandedPaths(paths)` - Batch set expanded folders
- `isExpanded(path)` - Check if folder expanded

**Key Patterns**:
- Use Set<string> for O(1) lookup performance
- Convert to/from Array for JSON serialization (in persist middleware)
- Path normalization (handle trailing slashes)

**Acceptance Criteria**:
- [ ] File <120 lines (excluding imports/comments)
- [ ] Set<string> properly serialized in persist
- [ ] Path normalization implemented
- [ ] Helper methods for tree operations

**Estimated Time**: 1-1.5 hours

---

### Phase 0.3.4: Layout Slice (Step 4)

**File**: `src/infrastructure/persistence/stores/ide/ide-layout-slice.ts`

**Purpose**: Manage IDE panel layout (resizeable panels, chat visibility).

**State**:
```typescript
{
  panelLayouts: Record<string, number[]>,
  chatVisible: boolean,
}
```

**Actions**:
- `setPanelLayout(groupId, layout)` - Save panel sizes
- `setChatVisible(visible)` - Set chat visibility
- `toggleChatVisible()` - Toggle chat panel

**Key Patterns**:
- Panel layout uses react-resizable-panels pattern (array of numbers)
- Chat visibility persisted (user preference)
- Integration with react-resizable-panels components

**Acceptance Criteria**:
- [ ] File <120 lines (excluding imports/comments)
- [ ] Panel layout pattern matches react-resizable-panels
- [ ] Chat visibility properly persisted
- [ ] Integration with existing layout components

**Estimated Time**: 1.5-2 hours

---

### Phase 0.3.5: Terminal Slice (Step 5)

**File**: `src/infrastructure/persistence/stores/ide/ide-terminal-slice.ts`

**Purpose**: Manage terminal tab state (terminal, output, problems).

**State**:
```typescript
{
  terminalTab: TerminalTab,
}
```

**Actions**:
- `setTerminalTab(tab)` - Switch active terminal tab

**Key Patterns**:
- Simple tab state (minimal complexity)
- Type-safe tab enum
- Integration with XTerminal component

**Acceptance Criteria**:
- [ ] File <50 lines (smallest slice)
- [ ] Type-safe tab enum
- [ ] Zero TypeScript errors
- [ ] Integration with XTerminal

**Estimated Time**: 0.5-1 hour

---

### Phase 0.3.6: Project Slice (Step 6)

**File**: `src/infrastructure/persistence/stores/ide/ide-project-slice.ts`

**Purpose**: Manage project scoping for IDE state (multi-project support).

**State**:
```typescript
{
  projectId: string | null,
}
```

**Actions**:
- `setProjectId(projectId)` - Set current project (scopes state)
- `reset()` - Reset all state (for project change)

**Key Patterns**:
- Project ID scopes all IDE state to specific project
- Reset clears all slices (calls reset on each slice via get())
- Future: Load project-specific state from Dexie

**Acceptance Criteria**:
- [ ] File <60 lines
- [ ] Reset clears all slices via cross-slice communication
- [ ] Project scoping implemented
- [ ] TODO comments for Dexie integration

**Estimated Time**: 1 hour

---

### Phase 0.3.7: Selectors Slice (Step 7)

**File**: `src/infrastructure/persistence/stores/ide/ide-selectors-slice.ts`

**Purpose**: AI-observable selectors for AI agent context (Epic 25 prep).

**State**:
- No state (pure selectors)

**Selectors**:
- `selectForAIContext(state)` - Complete workspace context for AI agents
- `selectFileContext(state)` - Minimal file context for AI tools
- `getIDEStoreState()` - Direct state access (non-React contexts)

**Key Patterns**:
- Pure functions (no side effects)
- Optimized for AI agent consumption
- Follows VSCode's "extension context" pattern
- Convert Set<string> to Array for JSON serialization

**Acceptance Criteria**:
- [ ] File <80 lines
- [ ] Pure functions (no state mutations)
- [ ] Set<string> properly converted to Array
- [ ] AI context complete (all fields AI agents need)

**Estimated Time**: 1 hour

---

### Phase 0.3.8: Unified Store (Step 8)

**File**: `src/infrastructure/persistence/stores/ide/useIDEStore.ts`

**Purpose**: Compose all slices into unified store with persist middleware.

**Architecture**:
```typescript
export const useIDEStore = create<CombinedIDEState>()(
  persist(
    (set, get, api) => ({
      // Compose all slices
      ...createIDEEditorSlice(set, get, api),
      ...createIDEExplorerSlice(set, get, api),
      ...createIDELayoutSlice(set, get, api),
      ...createIDETerminalSlice(set, get, api),
      ...createIDEProjectSlice(set, get, api),
      ...createIDESelectorsSlice(set, get, api),
    }),
    {
      name: 'ide-state',
      storage: createJSONStorage(() => createDexieStorage('ideState')),
      partialize: (state) => ({
        // Persist all state except selectors (pure functions)
        openFiles: state.openFiles,
        activeFile: state.activeFile,
        activeFileScrollTop: state.activeFileScrollTop,
        expandedPaths: Array.from(state.expandedPaths),
        panelLayouts: state.panelLayouts,
        chatVisible: state.chatVisible,
        terminalTab: state.terminalTab,
        projectId: state.projectId,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...persisted,
        expandedPaths: new Set(persisted.expandedPaths ?? []),
      }),
    }
  )
);
```

**Convenience Hooks**:
```typescript
// Editor hooks
export function useOpenFiles() {
  return useIDEStore((s) => s.openFiles);
}

export function useActiveFile() {
  return useIDEStore((s) => s.activeFile);
}

// Explorer hooks
export function useExpandedPaths() {
  return useIDEStore((s) => s.expandedPaths);
}

// Layout hooks
export function useChatVisible() {
  return useIDEStore((s) => s.chatVisible);
}

// Terminal hooks
export function useTerminalTab() {
  return useIDEStore((s) => s.terminalTab);
}

// Project hooks
export function useProjectId() {
  return useIDEStore((s) => s.projectId);
}

// AI context hooks
export function useAIContext() {
  return useIDEStore((s) => s.selectForAIContext(s));
}
```

**Acceptance Criteria**:
- [ ] All slices composed with spread operator
- [ ] Persist middleware on combined store only
- [ ] Set<string> properly serialized/deserialized
- [ ] Dexie storage adapter integrated
- [ ] 7 convenience hooks exported
- [ ] Zero TypeScript errors

**Estimated Time**: 1.5-2 hours

---

### Phase 0.3.9: Barrel Export (Step 9)

**File**: `src/infrastructure/persistence/stores/ide/index.ts`

**Purpose**: Centralize all IDE store exports for clean imports.

**Exports**:
```typescript
// Main store
export { useIDEStore } from './useIDEStore';

// Convenience hooks
export {
  useOpenFiles,
  useActiveFile,
  useExpandedPaths,
  useChatVisible,
  useTerminalTab,
  useProjectId,
  useAIContext,
} from './useIDEStore';

// Utilities
export {
  resetIDEStore,
  getIDEStoreState,
} from './useIDEStore';

// Types
export type {
  EditorTab,
  FileTreeNode,
  PanelLayout,
  AIContext,
  FileContext,
  IDEEditorState,
  IDEExplorerState,
  IDELayoutState,
  IDETerminalState,
  IDEProjectState,
  CombinedIDEState,
} from './ide-types';

// Terminal tab type
export type { TerminalTab } from './ide-types';
```

**Acceptance Criteria**:
- [ ] All exports organized by category
- [ ] Types exported separately from store
- [ ] Barrel export pattern consistent with knowledge store
- [ ] File <50 lines

**Estimated Time**: 0.5 hour

---

## Component Migration (Step 10)

### Components to Migrate

**Low Risk** (3 components):
1. **MonacoEditor.tsx** - Update import path, add AI context hook
2. **EditorTabBar.tsx** - Update import path, use convenience hooks
3. **FileTree.tsx** - Update import path, use convenience hooks

**Medium Risk** (1 component):
4. **XTerminal.tsx** - Update import path, use convenience hooks

**No Migration Needed**:
- MainSidebar.tsx (uses useLayoutStore - application-level)
- MobileIDELayout.tsx (uses useLayoutStore - application-level)
- MainLayout.tsx (uses useLayoutStore - application-level)
- WebContainerStatus.tsx (uses WebContainer singleton)
- FeatureSearch.tsx (no state dependency)

### Migration Strategy

**Option A: Gradual Migration (Safest)**
- Create facade in legacy store (re-export from new store)
- Migrate components one-by-one
- Delete legacy store after all components migrated
- **Recommended**: Maintain system stability

**Option B: Big Bang (Fastest)**
- Migrate all components in single commit
- Test all components together
- **Risk**: Higher chance of breaking changes

**Decision**: Use **Option A** (gradual migration with facade)

### Facade Implementation

```typescript
// File: src/lib/state/ide-store.ts (legacy facade)

/**
 * @deprecated Import from @/infrastructure/persistence/stores/ide instead
 * This file re-exports for backward compatibility during migration.
 */

export { useIDEStore } from '@/infrastructure/persistence/stores/ide';
export type { IDEState } from '@/infrastructure/persistence/stores/ide';

// TODO: Delete after all components migrated (Iteration 472)
```

**Acceptance Criteria**:
- [ ] All 4 components migrated
- [ ] Zero TypeScript errors
- [ ] Zero runtime errors
- [ ] `pnpm dev` works correctly
- [ ] All IDE functionality preserved

**Estimated Time**: 2-3 hours

---

## Risk Assessment

### Low Risk Items

1. **Terminal State** (TerminalTab enum)
   - **Impact**: Simple enum, minimal complexity
   - **Mitigation**: Type-safe enum prevents invalid values
   - **Status**: Acceptable

2. **Panel Layout** (react-resizable-panels)
   - **Impact**: Well-established pattern
   - **Mitigation**: Follow library documentation
   - **Status**: Acceptable

3. **File Management** (openFiles, activeFile)
   - **Impact**: Well-understood pattern (VSCode, Monaco)
   - **Mitigation**: Follow Monaco editor best practices
   - **Status**: Acceptable

### Medium Risk Items

1. **Set<string> Serialization** (expandedPaths)
   - **Impact**: JSON doesn't natively serialize Set
   - **Mitigation**: Convert to/from Array in persist middleware
   - **Status**: Managed (pattern from knowledge store)

2. **Project Scoping** (multi-project support)
   - **Impact**: Reset must clear all slices
   - **Mitigation**: Use cross-slice communication via get()
   - **Status**: Managed (pattern from knowledge store)

3. **Component Migration** (4 components)
   - **Impact**: Breaking changes could crash IDE
   - **Mitigation**: Facade pattern for backward compatibility
   - **Status**: Managed (gradual migration strategy)

### High Risk Items

**None identified** - This is the lowest-risk Phase 0 migration.

**Rationale**:
- IDE workspace is well-contained (no dependencies on other workspaces)
- Components are simple (no complex state transformations)
- Clear separation between IDE and application layout
- WebContainer already uses singleton pattern (no refactoring needed)

---

## Success Criteria

### Quantitative Metrics

- **Store Files Created**: 9 new files (6 slices + types + unified + index + facade)
- **Lines Eliminated**: 339-line god store → 6 focused slices (<120 each)
- **Components Migrated**: 4 components (low risk)
- **TypeScript Errors**: Zero new errors (baseline: 397)
- **Test Coverage**: N/A (tests deferred per production-first discipline)

### Qualitative Metrics

- **System Stability**: ✅ MAINTAINED (zero crashes)
- **Routing**: ✅ PRESERVED (pnpm dev works)
- **Type Safety**: ✅ IMPROVED (all slices fully typed)
- **Code Quality**: ✅ ENHANCED (god store eliminated)
- **Developer Experience**: ✅ IMPROVED (convenience hooks, clear imports)

### Acceptance Checklist

**Code Quality**:
- [ ] All slices <120 lines (excluding imports/comments)
- [ ] Zero TypeScript errors in production code
- [ ] Zero `any` types (strict typing)
- [ ] All functions have JSDoc comments
- [ ] December 2025 Zustand patterns applied

**Functionality**:
- [ ] Monaco editor state works correctly
- [ ] File tree expansion persists
- [ ] Panel layouts restore after refresh
- [ ] Terminal tab switching works
- [ ] AI context selectors return correct data
- [ ] Project scoping implemented

**Safety**:
- [ ] Facade exports created (backward compatibility)
- [ ] Set<string> properly serialized
- [ ] No circular dependencies
- [ ] Cross-slice communication via get()
- [ ] Persist middleware on combined store only

**Integration**:
- [ ] All 4 components migrated successfully
- [ ] `pnpm dev` works correctly
- [ ] Monaco editor opens files
- [ ] File tree expands/collapses
- [ ] Terminal tab switches correctly
- [ ] Chat panel toggles visibility

---

## Dependencies

### Internal Dependencies

- Phase 0.3 (IDE) ← Phase 0.1 (Project Hub) ✅ COMPLETE
- Phase 0.3 (IDE) ← No dependencies on Phase 0.2 (Knowledge)
- Phase 0.3 (IDE) ← No dependencies on Phase 0.4 (Notes)
- Phase 0.3 (IDE) ← No dependencies on Phase 0.5 (Study)

**Status**: READY TO START (no blockers)

### External Dependencies

- **zustand** (v5.0.0) - Already installed ✅
- **dexie** (v3.x) - Already installed ✅
- **@tanstack/store** - Already installed ✅
- **monaco-editor** - Already installed ✅
- **react-resizable-panels** - Already installed ✅
- **@xterm/xterm** - Already installed ✅

**Status**: ALL DEPENDENCIES AVAILABLE ✅

---

## Implementation Timeline

### Step 1: Type Definitions (1-2 hours)
- Create ide-types.ts with all interfaces
- Define IDEEditorState, IDEExplorerState, etc.
- Add AI context interfaces
- **Deliverable**: ide-types.ts (~150 lines)

### Step 2: Editor Slice (1.5-2 hours)
- Create ide-editor-slice.ts
- Implement addOpenFile, removeOpenFile, setActiveFile
- Add scroll position management
- **Deliverable**: ide-editor-slice.ts (~90 lines)

### Step 3: Explorer Slice (1-1.5 hours)
- Create ide-explorer-slice.ts
- Implement toggleExpanded, setExpandedPaths
- Add Set<string> serialization helpers
- **Deliverable**: ide-explorer-slice.ts (~70 lines)

### Step 4: Layout Slice (1.5-2 hours)
- Create ide-layout-slice.ts
- Implement setPanelLayout, setChatVisible, toggleChatVisible
- Integrate react-resizable-panels pattern
- **Deliverable**: ide-layout-slice.ts (~80 lines)

### Step 5: Terminal Slice (0.5-1 hour)
- Create ide-terminal-slice.ts
- Implement setTerminalTab
- Add TerminalTab type
- **Deliverable**: ide-terminal-slice.ts (~50 lines)

### Step 6: Project Slice (1 hour)
- Create ide-project-slice.ts
- Implement setProjectId, reset
- Add cross-slice reset logic
- **Deliverable**: ide-project-slice.ts (~60 lines)

### Step 7: Selectors Slice (1 hour)
- Create ide-selectors-slice.ts
- Implement selectForAIContext, selectFileContext
- Add getIDEStoreState helper
- **Deliverable**: ide-selectors-slice.ts (~80 lines)

### Step 8: Unified Store (1.5-2 hours)
- Create useIDEStore.ts
- Compose all slices with spread operator
- Add persist middleware with Dexie adapter
- Create 7 convenience hooks
- **Deliverable**: useIDEStore.ts (~100 lines)

### Step 9: Barrel Export (0.5 hour)
- Create index.ts
- Export store, hooks, utilities, types
- **Deliverable**: index.ts (~50 lines)

### Step 10: Component Migration (2-3 hours)
- Create facade in legacy store
- Migrate MonacoEditor.tsx
- Migrate EditorTabBar.tsx
- Migrate FileTree.tsx
- Migrate XTerminal.tsx
- Test all components
- **Deliverable**: 4 migrated components, 0 errors

**Total Estimated Time**: 12-16 hours (spread across 2-3 iterations)

---

## Testing Strategy

### Manual Testing (Per Production-First Discipline)

1. **Monaco Editor**:
   - Open multiple files (tabs appear)
   - Switch between tabs (active file changes)
   - Close tab (previous file activates)
   - Scroll position preserved after navigation

2. **File Tree**:
   - Expand folder (folder stays expanded)
   - Collapse folder (folder stays collapsed)
   - Refresh page (expansion persists)

3. **Panel Layout**:
   - Resize panel (sizes save)
   - Toggle chat panel (visibility persists)
   - Refresh page (layout restores)

4. **Terminal**:
   - Switch tabs (terminal → output → problems)
   - Refresh page (active tab persists)

5. **AI Context**:
   - Call selectForAIContext (returns all fields)
   - Call selectFileContext (returns minimal context)

### Automated Testing (Deferred)

- **Unit Tests**: Deferred until Phase 0 complete
- **Integration Tests**: Deferred until Phase 0 complete
- **E2E Tests**: Deferred until Phase 0 complete

**Rationale**: Production-first discipline - fix production code first, test files later.

---

## Rollback Plan

### If Migration Fails

1. **Revert Component Migrations**:
   ```bash
   # Undo component imports
   git checkout HEAD -- src/presentation/components/ide/*.tsx
   ```

2. **Delete New Store Files**:
   ```bash
   # Remove new IDE store
   rm -rf src/infrastructure/persistence/stores/ide/
   ```

3. **Restore Legacy Store**:
   ```bash
   # Restore original ide-store.ts
   git checkout HEAD -- src/lib/state/ide-store.ts
   ```

4. **Verify System**:
   ```bash
   pnpm tsc --noEmit  # Should return to baseline (397 errors)
   pnpm dev           # Should work correctly
   ```

**Rollback Time**: <5 minutes

**Rollback Success Criteria**:
- [ ] TypeScript errors return to baseline (397)
- [ ] IDE functionality restored
- [ ] Zero new errors introduced

---

## Next Steps

### Immediate (Iteration 470-471)

1. ⏭️ **Begin Implementation** (Step 1: Type Definitions)
   - Create ide-types.ts
   - Define all state interfaces
   - Add AI context types
   - **Estimated Time**: 1-2 hours

### Short Term (Iteration 471-473)

2. **Create 6 Slices** (Steps 2-7)
   - Editor slice (Step 2)
   - Explorer slice (Step 3)
   - Layout slice (Step 4)
   - Terminal slice (Step 5)
   - Project slice (Step 6)
   - Selectors slice (Step 7)
   - **Estimated Time**: 7-9 hours

### Medium Term (Iteration 474)

3. **Compose Unified Store** (Steps 8-9)
   - Create useIDEStore.ts
   - Create barrel export (index.ts)
   - Add convenience hooks
   - **Estimated Time**: 2-2.5 hours

### Long Term (Iteration 475)

4. **Migrate Components** (Step 10)
   - Create facade in legacy store
   - Migrate 4 IDE components
   - Test all functionality
   - **Estimated Time**: 2-3 hours

---

## Conclusion

**Phase 0.3 Readiness**: ✅ READY TO START

**Reasons to Proceed**:
1. No dependencies on blocked Phase 0.2 Step 2
2. Low-risk migration (well-contained workspace)
3. Clear architectural boundaries (6 focused slices)
4. Lessons learned from Phase 0.2 (knowledge store)
5. VSCode architecture patterns validated via MCP research
6. All dependencies available and installed

**Recommendation**: Begin Phase 0.3 implementation immediately (Iteration 470)

**Success Probability**: **95%** (highest confidence of all Phase 0 migrations)

**Risk Level**: **LOW** (well-contained, simple patterns, no blockers)

---

**Status**: ✅ APPROVED FOR IMPLEMENTATION
**Next Update**: After Step 1 completion (ide-types.ts)
**Iteration**: 470 → 471 (Type Definitions)
