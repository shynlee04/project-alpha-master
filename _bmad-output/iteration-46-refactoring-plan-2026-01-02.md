# Iteration 46: WorkspaceBindingDialog Refactoring Plan

**Date**: 2026-01-02
**Component**: WorkspaceBindingDialog.tsx
**Current Size**: 313 lines
**Target Size**: <200 lines
**Strategy**: Component extraction + hooks + co-located types

---

## Refactoring Strategy (Based on MCP Research)

### Phase 1: Extract Custom Hook
**File**: `useWorkspaceBindingState.ts` (~50 lines)
- State management (bindings, initialWorkspace)
- useEffect initialization logic
- Event handlers (handleWorkspaceToggle, handleConfirm)
- Computed values (hasEnabledWorkspaces, enabledWorkspaces)

### Phase 2: Extract Subcomponents

**File**: `WorkspaceBindingHeader.tsx` (~25 lines)
- Dialog.Title, Dialog.Description, project name display

**File**: `WorkspaceCheckboxItem.tsx` (~40 lines)
- Individual workspace checkbox with icon and label
- Reusable for both checkbox list and radio group

**File**: `WorkspaceCheckboxList.tsx` (~30 lines)
- Maps WORKSPACES to WorkspaceCheckboxItem components
- Manages checkbox state updates

**File**: `InitialWorkspaceSelector.tsx` (~35 lines)
- RadioGroup for initial workspace selection
- Maps enabled workspaces to WorkspaceCheckboxItem (with radio variant)

**File**: `WorkspaceBindingFooter.tsx` (~30 lines)
- Cancel and Confirm buttons
- Disabled state logic

### Phase 3: Co-locate Types
**File**: `WorkspaceBindingDialog.types.ts` (~20 lines)
- WorkspaceBindingDialogProps
- WorkspaceId type
- Export from main component

### Phase 4: Main Component Orchestration
**File**: `WorkspaceBindingDialog.tsx` (~160 lines target)
- Import hook and subcomponents
- Minimal state management
- Compose Dialog with subcomponents
- Pass through handlers from custom hook

---

## File Structure (After Refactoring)

```
src/presentation/components/hub/
├── WorkspaceBindingDialog.tsx           (160 lines) - Main orchestration
├── WorkspaceBindingDialog.types.ts       (20 lines)  - Type definitions
├── useWorkspaceBindingState.ts           (50 lines)  - Custom hook
├── WorkspaceBindingHeader.tsx            (25 lines)  - Subcomponent
├── WorkspaceCheckboxItem.tsx             (40 lines)  - Subcomponent
├── WorkspaceCheckboxList.tsx             (30 lines)  - Subcomponent
├── InitialWorkspaceSelector.tsx          (35 lines)  - Subcomponent
└── WorkspaceBindingFooter.tsx            (30 lines)  - Subcomponent
```

**Total**: 390 lines across 8 files (vs 313 lines in 1 file)
**Main Component**: 160 lines (49% reduction from 313)

---

## Acceptance Criteria

- [x] MCP Research completed (8 tool turns)
- [ ] Custom hook extracted (useWorkspaceBindingState)
- [ ] Subcomponents created (6 components)
- [ ] Types co-located (WorkspaceBindingDialog.types.ts)
- [ ] Main component <200 lines
- [ ] Zero TypeScript errors
- [ ] All functionality preserved
- [ ] Barrel exports updated in index.ts
- [ ] Integration test passed

---

## Next Steps

1. Create `useWorkspaceBindingState.ts` hook
2. Create `WorkspaceBindingDialog.types.ts` types file
3. Extract `WorkspaceBindingHeader.tsx`
4. Extract `WorkspaceCheckboxItem.tsx`
5. Extract `WorkspaceCheckboxList.tsx`
6. Extract `InitialWorkspaceSelector.tsx`
7. Extract `WorkspaceBindingFooter.tsx`
8. Refactor main component to orchestrate
9. Update barrel exports
10. Validate with TypeScript

---

**Status**: ✅ Research Complete, Implementation In Progress
**MCP Tool Turns**: 8 (exceeded 5+ requirement)
