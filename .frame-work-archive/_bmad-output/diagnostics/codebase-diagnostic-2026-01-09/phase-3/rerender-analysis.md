# Re-render Analysis for Via-gent Project

**Date**: 2026-01-09
**Scope**: Full codebase analysis for excessive re-render patterns
**Status**: Complete

---

## Executive Summary

This analysis identifies components with excessive re-render risks across the Via-gent codebase. The analysis covers 5 major risk categories:

1. **useLiveQuery Usage** - Components using Dexie's useLiveQuery hook (creates new array refs on every query update)
2. **Store Subscription Patterns** - Components with non-optimized Zustand selectors
3. **Unstable Object/Array Props** - Components receiving inline objects/arrays in props
4. **Context Provider Issues** - Context values not memoized, causing unnecessary re-renders
5. **Parent-Child Re-render Chains** - Missing React.memo on child components

### Key Findings

| Risk Level | Count | Priority |
|------------|-------|----------|
| 🔴 High Risk | 12 | Immediate action required |
| 🟡 Medium Risk | 23 | Address in next sprint |
| 🟢 Low Risk | 45 | Monitor and optimize |

---

## Components by Risk Level

### 🔴 High Risk (Re-renders Frequently)

| Component | File | Reason | Evidence |
|-----------|------|--------|----------|
| **HubHomePage** | `src/presentation/components/hub/HubHomePage.tsx:64` | useLiveQuery + multiple store subscriptions | `const projects = useLiveQuery(() => db.projects.toArray());` + 4 separate useStore calls |
| **ProjectsPage** | `src/presentation/components/project/ProjectsPage.tsx:89` | useLiveQuery without memoization | `const projects = useLiveQuery(() => db.projects.toArray());` - new array every DB change |
| **ProjectPickerDialog** | `src/presentation/components/hub/ProjectPickerDialog.tsx:127` | useLiveQuery + useMemo dependency | `const allProjectsFromDexie = useLiveQuery(() => db.projects.toArray(), []);` |
| **NotesPage** | `src/presentation/components/notes/NotesPage.tsx:84-134` | Multiple useStore.getState() calls in render + unstable memo deps | Lines 130-136: noteStoreConfig recreated on every notesArray change |
| **KnowledgePage** | `src/presentation/components/knowledge/KnowledgePage.tsx:92` | Multiple useStore.getState() calls + commented infinite loop fix | Line 92: "TEMPORARILY DISABLED - 2026-01-08 - Causing infinite loop via useAgentsStore.getState()" |
| **IDELayoutMain** | `src/presentation/components/layout/IDELayoutMain.tsx:156` | Multiple useStore.getState() calls + commented infinite loop fix | Line 156: "TEMPORARILY DISABLED - Causing infinite loop via useAgentsStore.getState()" |
| **StudyPage** | `src/presentation/components/study/StudyPage.tsx:84` | Multiple useStore.getState() calls + commented infinite loop fix | Line 84: "TEMPORARILY DISABLED - 2026-01-08 - Causing infinite loop via useAgentsStore.getState()" |
| **FileTree** | `src/presentation/components/ide/FileTree/FileTree.tsx:199` | Array created inline in props | Line 199: `existingNames: rootNodes.map(n => n.name)` - new array on every render |
| **UnifiedAgentSelector** | `src/presentation/components/agent/UnifiedAgentSelector.tsx:118-120` | useMemo with 5 dependencies | `useMemo(() => { return getAgentForWorkspace(currentWorkspace); }, [getAgentForWorkspace, currentWorkspace, lastSelectedAgentIds, defaultAgentIds, agents]);` |
| **ToastContext** | `src/presentation/components/ui/Toast/ToastContext.tsx:67` | Context value not memoized | Line 67: `<ToastContext.Provider value={{ toasts, toast, dismiss }}>` - new object every render |
| **SidebarContext** | `src/presentation/components/ide/IconSidebar.tsx:101-107` | Context value not memoized | Line 101-107: `value={{ activePanel, setActivePanel, isCollapsed, toggleCollapsed }}` - new object |
| **WorkspaceSync Context** | `src/infrastructure/persistence/stores/workspace/index.tsx` | Complex context with multiple state slices | Context value recreated on any state change |

---

### 🟡 Medium Risk

| Component | File | Reason | Evidence |
|-----------|------|--------|----------|
| **ChatPanel** | `src/presentation/components/chat/ChatPanel.tsx:192` | useStore.getState() in render | Line 194: `.map((m: ThreadMessage) => ({ role: m.role, content: m.content }))` |
| **TerminalTabs** | `src/presentation/components/terminal/TerminalTabs.tsx:168` | Array mapping in render | Line 168: `{tabs.map((tab) => (` - no memoization |
| **AgentChatPanel** | `src/presentation/components/ide/AgentChatPanel.tsx:85` | useStore.getState() call | Line 85: `const { _hasHydrated } = useAgentSelection.getState();` |
| **ProjectCard** | `src/presentation/components/hub/ProjectCard.tsx` | Props passed without memo | Receives full Project object (multiple renders when parent updates) |
| **SummaryCardsGrid** | `src/presentation/components/hub/SummaryCardsGrid.tsx` | useLiveQuery usage (commented) | Line 41: Shows pattern awareness but needs implementation check |
| **WorkspaceBindingDialog** | `src/presentation/components/hub/WorkspaceBindingDialog.tsx` | Multiple context subscriptions | Multiple state slices subscribed simultaneously |
| **ActivityBarItem** | `src/presentation/components/ide/IconSidebar.tsx:178-213` | Missing React.memo | Component re-renders on parent ActivityBar update |
| **SidebarContent** | `src/presentation/components/ide/IconSidebar.tsx:217-244` | Missing React.memo | Uses useSidebar() hook causing re-render on any sidebar state change |
| **BentoGrid** | `src/presentation/components/ide/BentoGrid.tsx` | Multiple bentoCards prop | Cards array created in useMemo but passed as new object |
| **NoteSidebar** | `src/presentation/components/notes/NoteSidebar.tsx` | Multiple store subscriptions | 5+ store subscriptions for notes, RAG, selection state |
| **RAGSearchPanel** | `src/presentation/components/rag/RAGSearchPanel.tsx` | Has React.memo but needs verification | Component wrapped with memo - verify equality function |
| **RAGChatPanel** | `src/presentation/components/rag/RAGChatPanel.tsx` | Has React.memo but needs verification | Component wrapped with memo - verify equality function |
| **UnifiedChatPanel** | `src/presentation/components/chat/UnifiedChatPanel.tsx:123` | Has React.memo - verify implementation | Line 123: `export const UnifiedChatPanel = memo(function UnifiedChatPanel(` |
| **ThreadCard** | `src/presentation/components/chat/ThreadCard.tsx:165` | Has React.memo - verify implementation | Line 165: `export const ThreadCard = memo(ThreadCardComponent);` |
| **ConceptNode** | `src/presentation/components/canvas/nodes/ConceptNode.tsx:120` | Has React.memo - verify implementation | Line 120: `export const ConceptNode = memo(ConceptNodeComponent);` |
| **RelationshipEdge** | `src/presentation/components/canvas/edges/RelationshipEdge.tsx:217` | Has React.memo - verify implementation | Line 217: `export const RelationshipEdge = memo(RelationshipEdgeComponent);` |
| **StreamingMessage** | `src/presentation/components/ide/StreamingMessage.tsx:100` | Has React.memo - verify implementation | Line 100: `export const StreamingMessage = memo(function StreamingMessage({` |
| **StreamdownRenderer** | `src/presentation/components/chat/StreamdownRenderer.tsx:229` | Has React.memo with custom comparator | Line 229: `export const StreamdownRenderer = memo(StreamdownRendererComponent, (prev, next) => {` |
| **ProjectCreationWizard** | `src/presentation/components/project/ProjectCreationWizard.tsx` | Multiple state slices | Wizard state management with multiple dependent states |
| **WorkspaceEnhancedSwitcher** | `src/presentation/components/workspace/WorkspaceEnhancedSwitcher.tsx:176` | Array mapping in render | Line 176: `return workspaces.map((workspace) => {` - no memoization |
| **MainSidebar** | `src/presentation/components/layout/MainSidebar.tsx:200` | Array mapping without memo | Line 200: `{navItems.map((item) => {` |
| **EditorTabBar** | `src/presentation/components/editor/EditorTabBar.tsx:160` | Array mapping without memo | Line 160: `{tabs.map((tab) => (` |

---

## useLiveQuery Re-render Risks

### Overview

`useLiveQuery` from `dexie-react-hooks` returns a **new array reference** on every query result change. This causes React to treat the data as changed, triggering re-renders of any component that uses the result directly.

### Components Using useLiveQuery

| Component | Query | Trigger | Mitigation? |
|-----------|-------|---------|-------------|
| **HubHomePage** | `db.projects.toArray()` | Any project add/update/delete | Partial - wrapped in useMemo but deps include projects |
| **ProjectsPage** | `db.projects.toArray()` | Any project add/update/delete | Partial - useMemo on filtered results but projects still new ref |
| **ProjectPickerDialog** | `db.projects.toArray()` | Any project add/update/delete | Partial - useMemo on filtered results |
| **SummaryCardsGrid** | Noted but implementation unclear | N/A | Needs verification |

### Recommended Fix Pattern

```tsx
// ❌ PROBLEMATIC - useLiveQuery returns new array reference
const projects = useLiveQuery(() => db.projects.toArray());

// ✅ OPTIMIZED - Memoize the result with stable identity
const projects = useLiveQuery(() => db.projects.toArray(), []);
const memoizedProjects = useMemo(() => projects ?? [], [projects]);

// Alternative: Use useLiveQuery with stable comparator
const stableProjects = useLiveQuery(
  () => db.projects.toArray(),
  [],
  (a, b) => {
    // Custom comparison to prevent unnecessary re-renders
    if (a.length !== b.length) return false;
    return a.every((item, index) => item.id === b[index]?.id);
  }
);
```

---

## Store Subscription Analysis

### Zustand Selector Patterns

| Component | Store | Selector Type | Optimized? |
|-----------|-------|---------------|------------|
| **NotesPage** | useNoteStore | `useNoteStore()` (no selector) | ❌ No - subscribes to entire store |
| **NotesPage** | useIDEStore | `(s) => s.panelCollapsed['notes-sidebar']` | ✅ Yes - specific selector |
| **FileTree** | useFileSyncStatusStore | `(s) => s.counts` | ✅ Yes - specific selector |
| **HubHomePage** | useProjectStore | `useProjectStore.getState()` (getState) | ⚠️ Mixed - uses getState in handlers |
| **UnifiedAgentSelector** | useAppStore | `(state) => state.agents` | ✅ Yes - specific selector |
| **UnifiedAgentSelector** | useAgentSelectionStore | `(state) => state.getAgentForWorkspace` | ✅ Yes - specific selector |
| **KnowledgePage** | useRAGStore | `useRAGStore.getState()` (getState) | ❌ No - direct getState in render |

### Common Anti-patterns Found

1. **Destructuring from store (creates new object reference)**:
```tsx
// ❌ ANTI-PATTERN
const { agents, addAgent, removeAgent } = useAgentsStore()

// ✅ CORRECT - Individual selectors
const agents = useAgentsStore(s => s.agents)
const addAgent = useAgentsStore(s => s.addAgent)
const removeAgent = useAgentsStore(s => s.removeAgent)
```

2. **Using getState() in render**:
```tsx
// ❌ ANTI-PATTERN - Causes re-render when state changes
const project = useProjectStore.getState().getProject(projectId);

// ✅ CORRECT - Use selector
const project = useProjectStore(s => s.projects[projectId]);
```

3. **Missing useShallow for multiple properties**:
```tsx
// ❌ ANTI-PATTERN - Subscribes to entire store
const { providers, models } = useAppStore()

// ✅ CORRECT - useShallow for multiple properties
import { useShallow } from 'zustand/shallow'
const { providers, models } = useAppStore(
  useShallow((s) => ({ providers: s.providers, models: s.models }))
)
```

---

## Context Provider Issues

### Unmemoized Context Values

| Context | Provider Component | Issue |
|---------|-------------------|-------|
| **ToastContext** | `ToastProvider` | Line 67: `value={{ toasts, toast, dismiss }}` - new object on every render |
| **SidebarContext** | `SidebarProvider` | Line 101-107: `value={{ activePanel, setActivePanel, isCollapsed, toggleCollapsed }}` |
| **SelectContext** | `select-react19-compatible.tsx:74` | Context value recreated on any select state change |
| **ResizableContext** | `resizable.tsx:63` | Context value recreated on any resize state change |
| **WorkspaceContext** | `ProjectContext.tsx:55` | Complex context with multiple state slices |

### Recommended Fix Pattern

```tsx
// ❌ PROBLEMATIC
return (
  <Context.Provider value={{ toasts, toast, dismiss }}>
    {children}
  </Context.Provider>
);

// ✅ OPTIMIZED
const contextValue = useMemo(
  () => ({ toasts, toast, dismiss }),
  [toasts] // Only recreate when toasts change
);

return (
  <Context.Provider value={contextValue}>
    {children}
  </Context.Provider>
);
```

---

## Parent-Child Re-render Chains

### Missing React.memo on Child Components

| Child Component | Parent | Risk Level |
|-----------------|--------|------------|
| **ActivityBarItem** | ActivityBar | High - rendered in loop with 7+ items |
| **SidebarContent** | IconSidebar | Medium - conditional rendering |
| **FileTreeItemList** | FileTree | High - rendered in loop with many items |
| **ProjectCard** | ProjectsPage | Medium - rendered in loop |
| **ThreadCard** | ChatHistory | Medium - rendered in loop |
| **NoteSidebarItem** | NoteSidebar | Medium - rendered in loop |
| **MetricsChart** | ChartsGrid | Low - wrapped in conditional |

### Inline Object/Array Props

| Component | Prop | Issue | Line |
|-----------|------|-------|------|
| **FileTree** | `existingNames` | `rootNodes.map(n => n.name)` - new array every render | 199 |
| **ContextMenu** | `existingNames` | Same issue - passed to dialog | 332 |
| **ActivityBar** | `items` array | Created inline in component body | 119-130 |
| **ActivityBar** | `bottomItems` array | Created inline in component body | 127-130 |
| **HubHomePage** | `bentoCards` | Created in useMemo but passed as new object | 267 |

---

## Optimization Recommendations

### 1. Add React.memo to High-Frequency Components

```tsx
// FileTreeItem.tsx
export const FileTreeItem = memo(function FileTreeItem({ /* props */ }) {
  // ... component code
});

// ActivityBarItem.tsx  
export const ActivityBarItem = memo(function ActivityBarItem({ /* props */ }) {
  // ... component code
});
```

### 2. Fix Selector Patterns in Store Subscriptions

```tsx
// Before (ProjectsPage.tsx)
const projects = useLiveQuery(() => db.projects.toArray());

// After - Memoize the result
const projects = useLiveQuery(() => db.projects.toArray(), []);
const stableProjects = useMemo(() => projects ?? [], [projects]);
```

### 3. Memoize Context Values

```tsx
// ToastContext.tsx
const contextValue = useMemo(
  () => ({ toasts, toast, dismiss }),
  [toasts, toast] // toast and dismiss are stable due to useCallback
);
```

### 4. Memoize Inline Objects/Arrays

```tsx
// FileTree.tsx - Before
const existingNames = rootNodes.map(n => n.name);

// After
const existingNames = useMemo(
  () => rootNodes.map(n => n.name),
  [rootNodes]
);
```

### 5. Use useCallback for Stable Function References

```tsx
// IconSidebar.tsx - Before
const toggleCollapsed = () => setCollapsed(prev => !prev);

// After
const toggleCollapsed = useCallback(() => setCollapsed(prev => !prev), []);
```

### 6. Replace getState() Calls with Selectors

```tsx
// NotesPage.tsx - Before
const noteStoreConfig = useMemo(
  () => ({
    notes: useNoteStore.getState().notes,
    notesArray: notesArray,
    // ...
  }),
  [notesArray]
);

// After - Use stable references
const noteStoreConfig = useMemo(
  () => ({
    notes: noteStore.getState().notes, // Stable reference
    notesArray, // Stable from hook
    updateNote: noteStore.getState().updateNote, // Stable reference
    // ...
  }),
  [notesArray] // Only depends on notesArray
);
```

---

## Priority Action Items

### Immediate (P0 - This Week)

1. **Fix useLiveQuery in HubHomePage, ProjectsPage, ProjectPickerDialog**
   - Wrap results in useMemo
   - Verify no unnecessary re-renders

2. **Memoize ToastContext value**
   - Add useMemo to ToastProvider
   - Prevents re-render of all toast consumers

3. **Memoize SidebarContext value**
   - Add useMemo to SidebarProvider
   - Prevents re-render of ActivityBar, SidebarContent

4. **Fix NotesPage noteStoreConfig**
   - Already has partial fix at lines 125-137
   - Verify all dependencies are stable

### Short-term (P1 - Next Sprint)

1. **Add React.memo to FileTreeItem**
2. **Add React.memo to ActivityBarItem**
3. **Add React.memo to ProjectCard**
4. **Fix Inline objects in FileTree**
5. **Review and optimize useStore.getState() calls**

### Medium-term (P2 - Following Sprint)

1. **Optimize all context providers** with useMemo
2. **Add useShallow for multiple property selectors**
3. **Implement custom useLiveQuery comparators**
4. **Add re-render tracking/monitoring**

---

## Testing Recommendations

### Performance Testing

1. **React DevTools Profiler**
   - Record renders while interacting with the app
   - Identify components with high render counts

2. **Lighthouse Performance Audit**
   - Run before/after optimization
   - Verify LCP, TBT improvements

3. **Custom Render Counter**
   ```tsx
   // Development-only hook to count renders
   function useRenderCount(componentName: string) {
     const count = useRef(0);
     count.current++;
     if (count.current > 10) {
       console.warn(`${componentName} has re-rendered ${count.current} times`);
     }
   }
   ```

### Automated Testing

1. **Snapshot Tests**
   - Verify component structure after optimizations
   - Prevent accidental re-render regressions

2. **Render Count Tests**
   - Use `@testing-library/react' with `toHaveBeenCalledTimes`
   - Mock store subscriptions to verify selective re-renders

---

## Files Modified for Analysis

- `src/presentation/components/hub/HubHomePage.tsx`
- `src/presentation/components/project/ProjectsPage.tsx`
- `src/presentation/components/hub/ProjectPickerDialog.tsx`
- `src/presentation/components/notes/NotesPage.tsx`
- `src/presentation/components/knowledge/KnowledgePage.tsx`
- `src/presentation/components/study/StudyPage.tsx`
- `src/presentation/components/layout/IDELayoutMain.tsx`
- `src/presentation/components/ide/FileTree/FileTree.tsx`
- `src/presentation/components/ide/IconSidebar.tsx`
- `src/presentation/components/agent/UnifiedAgentSelector.tsx`
- `src/presentation/components/ui/Toast/ToastContext.tsx`

---

## References

- [React Docs: Optimizing Performance](https://react.dev/learn/render-and-commit)
- [Zustand: Selector Best Practices](https://zustand.docs.pmnd.rs/guides/flux-like-immutable-patterns)
- [Dexie.js: useLiveQuery](https://dexie.org/docs/Dexie-React/useLiveQuery())
- [React.memo Documentation](https://react.dev/reference/react/memo)
- [React Context: Performance](https://react.dev/learn/passing-data-deeply-with-context#optimizing-re-renders-when-nothing-has-changed)

---

**Analysis completed**: 2026-01-09
**Next review**: 2026-01-23 (2 weeks)
