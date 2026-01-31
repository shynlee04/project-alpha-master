# Spike Architecture Design - Project Space Isolation
**Date**: 2026-01-16
**Purpose**: Create isolated "spike" space to debug and validate project space architecture
**Status**: READY FOR IMPLEMENTATION

---

## Executive Summary

The spike is an **isolated testing environment** that copies working code from main codebase to validate and debug:
1. Project space routing (entry points, guards, redirects)
2. Multi-workspace navigation (Notes ↔ IDE)
3. Project creation and selection flows
4. State management per project
5. Device-specific UX (desktop vs mobile)

**Goal**: Confirm working functionality → Identify issues → Document learnings → Migrate fixes back to main codebase.

---

## Spike Folder Structure

```
routes-spike/                              (The "Spike Space")
├── README.md                              (This document)
├── PROJECT-SPACE-MANIFEST.md              (Project space architecture rules)
├── notes/
│   ├── notes-route.tsx                 (Route loader - pure)
│   ├── notes-base.tsx                  (Base route logic)
│   ├── NotesPage.tsx                    (UI component - working)
│   └── NotesUI.tsx                     (Minimal UI - to be built)
├── ide/
│   ├── ide-route.tsx                   (Route loader - pure)
│   ├── ide-base.tsx                    (Base route logic)
│   ├── IDELayout.tsx                   (UI component - working)
│   └── IDEUI.tsx                      (Minimal UI - to be built)
├── project-creation/
│   └── wizard-ui.tsx                   (Project creation - working)
├── infrastructure/
│   ├── dexie-spoke.ts                 (Dexie DB access)
│   ├── platform-spoke.ts               (Platform detection)
│   └── fsa-spoke.ts                   (FSA handle storage)
└── utils/
    ├── route-guards.tsx                (Common guard logic)
    └── project-context-spoke.tsx        (Project context wrapper)
```

---

## Phase 1: Copy Working Code from Main

### Notes Workspace

#### 1. Copy Route Loader
**Source**: `src/routes/notes.$projectId.lazy.tsx` (lines 45-66 - working)
**Target**: `routes-spike/notes/notes-route.tsx`

**What to Copy**:
```typescript
// Route loader with waitForHydration + Dexie query
export async function loadNotesProject(projectId: string): Promise<Project> {
  await waitForHydration();
  const record = await db.projects.get(projectId);
  
  if (!record) {
    throw redirect({ to: '/hub' });
  }
  
  return record as Project;
}
```

**What NOT to Copy**:
- UI rendering logic (component, effects)
- Navigation logic (useNavigate)
- State management (useEffect hooks)

#### 2. Copy Base Route Logic
**Source**: `src/routes/notes.lazy.tsx` (working - desktop picker, mobile redirect)
**Target**: `routes-spike/notes/notes-base.tsx`

**What to Copy**:
```typescript
// Desktop with FSA: Show ProjectPickerDialog
// Mobile/Tablet: Redirect to hub
```

#### 3. Copy Working UI Component
**Source**: `src/presentation/components/notes/NotesPage.tsx` (working)
**Target**: `routes-spike/notes/NotesPage.tsx`

**What to Copy**:
- Full component with editor + sidebar
- State management logic
- Note CRUD operations

#### 4. Create Minimal UI Stub
**Target**: `routes-spike/notes/NotesUI.tsx`

**Purpose**: Placeholder for incremental UI development
```typescript
// Start with skeleton
export function NotesUI() {
  return (
    <div className="flex h-screen">
      <aside>File Tree (TODO)</aside>
      <main>Editor (TODO)</main>
    </div>
  );
}
```

### IDE Workspace

#### 1. Copy Route Loader
**Source**: `src/routes/ide.$projectId.tsx` (lines 38-88 - working)
**Target**: `routes-spike/ide/ide-route.tsx`

**What to Copy**:
- Loader with platform guard
- beforeLoad implementation
- Dexie project fetch

#### 2. Copy Base Route Logic
**Source**: `src/routes/ide.tsx` (working)
**Target**: `routes-spike/ide/ide-base.tsx`

**What to Copy**:
- Desktop FSA: Show folder picker + create project
- Mobile/Tablet: Redirect to Notes with toast
- Error boundary handling

#### 3. Copy Working UI Component
**Source**: `src/presentation/components/layout/IDELayout.tsx` (working)
**Target**: `routes-spike/ide/IDELayout.tsx`

**What to Copy**:
- File tree component
- Monaco editor
- Sidebar navigation
- Project context integration

#### 4. Create Minimal UI Stub
**Target**: `routes-spike/ide/IDEUI.tsx`

**Purpose**: Placeholder for incremental UI development

### Project Creation

#### Copy Working Wizard
**Source**: `src/presentation/components/project/ProjectCreationWizard.tsx` (working)
**Target**: `routes-spike/project-creation/wizard-ui.tsx`

### Infrastructure

#### Copy Working Spokes
```bash
# Dexie DB
cp src/infrastructure/persistence/dexie-db.ts routes-spike/infrastructure/dexie-spoke.ts

# Platform detection
cp src/infrastructure/filesystem/platform-contract.ts routes-spike/infrastructure/platform-spoke.ts

# FSA handle storage
cp src/infrastructure/persistence/stores/handle-persistence.ts routes-spike/infrastructure/fsa-spoke.ts
```

---

## Phase 2: Create Spike Entry Point

### File: `routes-spike/spike.tsx`

**Purpose**: Main entry point for spike testing environment

**Routes**:
- `/spike/notes` → Notes workspace
- `/spike/ide` → IDE workspace
- `/spike/project-creation` → Project creation wizard

**Implementation**:
```typescript
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/spike', {
  component: () => (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-4">Project Space Spike</h1>
        <p className="text-muted-foreground mb-8">
          Isolated testing environment for Notes and IDE workspaces.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Notes Workspace Entry */}
          <a 
            href="/spike/notes"
            className="block p-6 border-2 border-border bg-card hover:border-primary/50 transition-colors"
          >
            <div className="text-2xl font-bold mb-2">Notes</div>
            <p className="text-sm text-muted-foreground">
              Load projects, create notes, file tree editor
            </p>
          </a>
          
          {/* IDE Workspace Entry */}
          <a 
            href="/spike/ide"
            className="block p-6 border-2 border-border bg-card hover:border-primary/50 transition-colors"
          >
            <div className="text-2xl font-bold mb-2">IDE</div>
            <p className="text-sm text-muted-foreground">
              Create projects, file tree, Monaco editor
            </p>
          </a>
          
          {/* Project Creation Entry */}
          <a 
            href="/spike/project-creation"
            className="block p-6 border-2 border-border bg-card hover:border-primary/50 transition-colors"
          >
            <div className="text-2xl font-bold mb-2">Create Project</div>
            <p className="text-sm text-muted-foreground">
              Create new FSA or IndexedDB project
            </p>
          </a>
        </div>
        
        <div className="mt-8 p-4 border-2 border-border bg-muted/20 rounded">
          <h2 className="text-lg font-bold mb-2">Spike Status</h2>
          <ul className="space-y-2 text-sm">
            <li>✅ Notes route loader copied from working code</li>
            <li>✅ IDE route loader copied from working code</li>
            <li>✅ UI components copied from working code</li>
            <li>✅ Infrastructure spokes copied</li>
          </ul>
        </div>
      </div>
    </div>
  ),
});
```

---

## Phase 3: Add to Vite Config

### File: Update `vite.config.ts`

**Add Spike Alias**:
```typescript
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/spike': path.resolve(__dirname, './routes-spike'),
    },
  },
});
```

**Purpose**: Allow imports like `import { something } from '@/spike/notes/...'`

---

## Phase 4: Testing Strategy

### Manual Test Checklist

#### Notes Workspace Tests

**Test Case 1: Load Existing Project**
- [ ] Navigate to `/spike/notes/proj_test_123`
- [ ] Verify: Console shows "Loader called for project: proj_test_123"
- [ ] Verify: Console shows "Project loaded successfully: proj_test_123"
- [ ] Verify: NotesPage component renders with content
- [ ] Verify: State persists (refresh doesn't lose data)

**Test Case 2: Navigate to Non-Existent Project**
- [ ] Navigate to `/spike/notes/proj_nonexistent`
- [ ] Verify: Console shows "Project not found"
- [ ] Verify: Redirects to `/spike` (spike hub)
- [ ] Verify: Toast message shown

**Test Case 3: Create New Project**
- [ ] Click "Create Project" on spike entry
- [ ] Verify: Navigates to project creation wizard
- [ ] Verify: Can create FSA project (desktop)
- [ ] Verify: Can create IndexedDB project (mobile)
- [ ] Verify: After creation, navigates to workspace

**Test Case 4: Desktop vs Mobile**
- [ ] Desktop: Can access both Notes and IDE
- [ ] Mobile: Can access Notes, blocked from IDE
- [ ] Mobile: Toast message "IDE requires desktop" shown when blocked
- [ ] Desktop: No toast message when accessing IDE

#### IDE Workspace Tests

**Test Case 1: Load Existing Project**
- [ ] Navigate to `/spike/ide/proj_test_123`
- [ ] Verify: Console shows "Project loaded successfully"
- [ ] Verify: IDELayout component renders with file tree
- [ ] Verify: Monaco editor loads
- [ ] Verify: State persists (refresh doesn't lose data)

**Test Case 2: Navigate to Non-Existent Project**
- [ ] Navigate to `/spike/ide/proj_nonexistent`
- [ ] Verify: Redirects to `/spike` with error
- [ ] Verify: Toast message shown

**Test Case 3: Create New Project**
- [ ] Click "Create Project" on spike entry
- [ ] Verify: Navigates to creation wizard
- [ ] Verify: Can create project
- [ ] Verify: After creation, navigates to IDE workspace

**Test Case 4: Platform Guard**
- [ ] Mobile: Cannot access IDE route (blocked)
- [ ] Mobile: Redirects to Notes with toast "IDE requires desktop"
- [ ] Desktop: Can access IDE route

---

## Phase 5: Migration Plan

### After Spike Validation Complete

#### Step 1: Apply Fixes to Main Codebase

| Fix | File | Lines Changed | Priority |
|------|-------|--------------|----------|
| Fix regex bug in hydration manager | `src/infrastructure/persistence/stores/hydration-manager.ts:59` | Change regex | P0 |
| Fix FSA handle storage | `src/infrastructure/persistence/stores/handle-persistence.ts` | Implement proper storage | P0 |
| Consolidate route guards | Create `src/routes/utils/route-guards.tsx` | New file | P1 |
| Fix project selection flow | Update hub navigation logic | ~100 lines | P0 |

#### Step 2: Integrate Spike Learnings

**Documentation**:
- Create `_bmad-output/investigation-artifacts/spike-validation-report-2026-01-16.md`
- Include all test results
- Include all issues found
- Include recommendations for main codebase refactoring

#### Step 3: Archive Spike (Optional)

**When**: After all fixes validated and working in main codebase

**Action**:
```bash
# Archive spike for reference
mv routes-spike _bmad-ext/.archive/spike-2026-01-16
```

---

## Success Criteria

- [ ] Spike folder structure created
- [ ] All working code copied from main
- [ ] Minimal UI stubs created
- [ ] Infrastructure spokes created
- [ ] Spike entry point functional
- [ ] Vite config updated with alias
- [ ] Manual testing complete (all test cases)
- [ ] Validation report generated
- [ ] Migration plan documented

---

## Exit Criteria

**If ANY of these conditions occur, STOP and investigate**:

1. **Regex bug still present** - Spike shows hydration manager returns wrong projectId
2. **Bounce-back still occurs** - Spike shows users still redirected when accessing valid projects
3. **Platform guards fail** - Mobile can access IDE or desktop blocked from Notes
4. **State loss on refresh** - Projects don't persist after page reload
5. **FSA handle expires** - Projects require re-permission after browser restart

**If ALL criteria met**: Proceed to migration plan.

---

## Risk Mitigation

### Risk: Spike May Still Have Same Bugs

**Mitigation**:
1. Use exact file copies (no modifications during copy)
2. Document test results thoroughly
3. Compare console logs between main and spike environments
4. If issues persist, investigate ADR-035 fixes were applied

### Risk: Main Codebase May Have Regression

**Mitigation**:
1. Apply fixes incrementally (one at a time)
2. Run TypeScript compiler after each fix
3. Run tests after each fix
4. Keep spike folder for reference if major issues found

---

## Timeline

| Phase | Duration | Status |
|--------|----------|--------|
| Phase 1: Copy Working Code | 2 hours | TODO |
| Phase 2: Create Entry Point | 30 min | TODO |
| Phase 3: Add Vite Config | 15 min | TODO |
| Phase 4: Testing | 2 hours | TODO |
| Phase 5: Migration | 1 hour | TODO |

**Total Estimated**: 5.5 hours

---

**Created**: 2026-01-16T14:30:00+07:00
**Author**: BMAD Master Orchestrator
**Next**: Delegate to @dev-ext to implement Phase 1 (Copy Working Code)
