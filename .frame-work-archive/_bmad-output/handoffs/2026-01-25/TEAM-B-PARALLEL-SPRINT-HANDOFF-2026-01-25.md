# Team B Parallel Sprint Handoff

> **Handoff ID**: `TEAM-B-PARALLEL-2026-01-25`
> **Created**: 2026-01-25T23:45:00+07:00
> **Created By**: bmad-master (Orchestrator)
> **Target Agents**: sprint-manager (Team B), dev-ext
> **Priority**: P1 (Parallel to Team A's P0 work)
> **Status**: READY_FOR_EXECUTION

---

## Executive Summary

While **Team A** is completing EPIC-ARCH-04-CC (FSA Handle Lifecycle), **Team B** can execute independent consolidation work that does not conflict with Team A's changes.

### Parallel Work Scope

| Team | Epic/Stories | Files Touched | Status |
|------|--------------|---------------|--------|
| **Team A** | CC-01, CC-02, CC-03, CC-04 | `project-context.tsx`, `$projectId.tsx`, `PermissionOverlay.tsx` | IN_PROGRESS |
| **Team B** | CONS-01, CONS-02, CONS-03 | Different files (no conflict) | **READY** |

---

## Document Governance

### Parent Documents (MUST READ BEFORE STARTING)

| Document | Path | Purpose |
|----------|------|---------|
| **AGENTS.md** | `/AGENTS.md` | Governance rules, file tree governance, coding standards |
| **new-fundamental-truths.md** | `/new-fundamental-truths.md` | Architecture principles |
| **3-Phase Approach** | `/docs/the-3-phase-approach.md` | Strategic roadmap |
| **ADR-034** | `_bmad-output/planning-artifacts/adr/ADR-034-project-centric-architecture-2026-01-20.md` | Architecture decisions |
| **EPIC-ARCH-01** | `_bmad-output/planning-artifacts/epics/EPIC-ARCH-01-foundation-cleanup-2026-01-20.md` | Original foundation cleanup stories |

### Related Active Work (Team A - DO NOT TOUCH THESE FILES)

| File | Owner | Reason |
|------|-------|--------|
| `src/infrastructure/context/project-context.tsx` | Team A | CC-01, CC-02 changes |
| `src/routes/$projectId.tsx` | Team A | CC-03 changes |
| `src/presentation/components/layout/PermissionOverlay.tsx` | Team A | CC-02 integration |

---

## Team B Stories

### CONS-01: Complete ARCH-01-01 - Remove Remaining window.location.href

> **Priority**: P1 | **Effort**: 1 hour | **Dependencies**: None
> **Assigned To**: dev-ext

#### Problem Statement

ARCH-01-01 was marked complete but 2 actual usages remain (plus 1 legitimate use). Most `window.location.href` occurrences are now TODO comments, but some actual code remains.

#### Investigation Results

```bash
# Grep results from codebase:
src/lib/offline/offline-detector.ts:126        # KEEP - Used for fetch URL, not navigation
src/presentation/components/common/DatabaseRecoveryDialog.tsx:112  # FIX - Pattern test
src/routes/$__debug__.provider-playground.tsx:137  # FIX - HTTP Referer header
```

#### Files to Modify

| File | Line | Current Use | Action | Replacement |
|------|------|-------------|--------|-------------|
| `src/presentation/components/common/DatabaseRecoveryDialog.tsx` | 112 | `window.location.href` in pattern test | **FIX** | Use `window.location.pathname` or TanStack Router |
| `src/routes/$__debug__.provider-playground.tsx` | 137 | HTTP-Referer header | **FIX** | Use proper origin detection |
| `src/lib/offline/offline-detector.ts` | 126 | Fetch URL for connectivity check | **KEEP** | This is a legitimate use (not navigation) |

#### Implementation Steps

**Step 1: Read the affected files**
```bash
# Read current implementation
cat src/presentation/components/common/DatabaseRecoveryDialog.tsx | head -150
cat src/routes/$__debug__.provider-playground.tsx | head -150
```

**Step 2: Fix DatabaseRecoveryDialog.tsx (line ~112)**

Find the pattern that looks like:
```typescript
if (pattern.test(window.location.href) || pattern.test(document.body.innerText)) {
```

Replace with:
```typescript
// ARCH-01-01: Use window.location.pathname for pattern matching
if (pattern.test(window.location.pathname) || pattern.test(document.body.innerText)) {
```

**Step 3: Fix provider-playground.tsx (line ~137)**

Find:
```typescript
'HTTP-Referer': typeof window !== 'undefined' ? window.location.href : '',
```

Replace with:
```typescript
// ARCH-01-01: Use window.location.origin for referer header
'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
```

#### Verification Commands

```bash
# 1. Check remaining usages (should show only offline-detector.ts)
grep -rn "window.location.href" src/ --include="*.ts" --include="*.tsx" | grep -v "// ARCH-01-01" | grep -v "offline-detector.ts"

# 2. TypeScript check
pnpm tsc --noEmit 2>&1 | tee /tmp/cons-01-tsc.txt

# 3. Expected: Only 1 legitimate usage remains (offline-detector.ts)
```

#### Acceptance Criteria

| AC ID | Criterion | Verification Method |
|-------|-----------|---------------------|
| CONS-01-1 | DatabaseRecoveryDialog uses `pathname` not `href` | grep verification |
| CONS-01-2 | provider-playground uses `origin` not `href` | grep verification |
| CONS-01-3 | Only offline-detector.ts has `window.location.href` | grep shows 1 result |
| CONS-01-4 | TypeScript compiles | `pnpm tsc --noEmit` exit 0 |

---

### CONS-02: Consolidate Project Creation Deprecation Notices

> **Priority**: P1 | **Effort**: 1.5 hours | **Dependencies**: None
> **Assigned To**: dev-ext

#### Problem Statement

ARCH-01-02 requires 2 canonical project creation paths. Currently there are 4+ paths with inconsistent deprecation warnings.

#### Canonical Paths (KEEP)

1. **Desktop FSA**: `createProjectFromFolder()` in `src/lib/workspace/fsa-persistence.ts`
2. **Mobile IndexedDB**: `getOrCreateBrowserModeProject()` in `src/domain/services/project-creation-service.ts`

#### Deprecated Paths (ADD WARNINGS)

| File | Function | Current State | Action |
|------|----------|---------------|--------|
| `src/lib/workspace/temp-project.ts` | `createTempProject()` | Has deprecation notice | **VERIFY** |
| `src/infrastructure/persistence/stores/workspace/slices/use-file-ops-slice.ts` | `openFolder()` | Has deprecation notice | **VERIFY** |
| `src/infrastructure/persistence/stores/project/project-crud-slice.ts` | `createProject()` | Used internally, no warning | **ADD INTERNAL MARKER** |

#### Implementation Steps

**Step 1: Verify existing deprecation notices**
```bash
grep -rn "@deprecated\|console.warn.*deprecated" src/ --include="*.ts" | grep -i "project\|folder"
```

**Step 2: Add internal marker to project-crud-slice.ts**

At `src/infrastructure/persistence/stores/project/project-crud-slice.ts` line ~123:
```typescript
  createProject: async (input: CreateProjectInput) => {
    // INTERNAL: Called by canonical paths (createProjectFromFolder, getOrCreateBrowserModeProject)
    // Do NOT call directly from UI components - use canonical paths instead
```

**Step 3: Ensure temp-project.ts has proper warning**

Verify `src/lib/workspace/temp-project.ts` line ~110 has:
```typescript
/**
 * @deprecated Use createProjectFromFolder() for FSA projects or 
 * getOrCreateBrowserModeProject() for mobile
 */
```

**Step 4: Document canonical paths in AGENTS.md**

This will be a governance update after verification.

#### Verification Commands

```bash
# 1. Count deprecation markers
grep -rn "@deprecated.*project\|deprecated.*project" src/ --include="*.ts" | wc -l
# Expected: At least 3

# 2. Verify no new direct createProject calls in UI
grep -rn "useProjectStore.*createProject\|getState().createProject" src/presentation/ src/routes/ --include="*.tsx"
# Expected: 0 results (all should go through canonical paths)

# 3. TypeScript check
pnpm tsc --noEmit
```

#### Acceptance Criteria

| AC ID | Criterion | Verification Method |
|-------|-----------|---------------------|
| CONS-02-1 | `createTempProject()` has @deprecated JSDoc | grep verification |
| CONS-02-2 | `openFolder()` has deprecation warning | grep verification |
| CONS-02-3 | `createProject()` has internal marker comment | grep verification |
| CONS-02-4 | No direct `createProject` calls in UI components | grep shows 0 |
| CONS-02-5 | TypeScript compiles | `pnpm tsc --noEmit` exit 0 |

---

### CONS-03: Complete MonacoPlugin with Real Editor Integration

> **Priority**: P2 | **Effort**: 2-3 hours | **Dependencies**: None
> **Assigned To**: dev-ext

#### Problem Statement

MonacoPlugin at `src/plugins/monaco/MonacoPlugin.tsx` is a POC that uses a textarea placeholder instead of the real Monaco Editor. The actual `MonacoEditor` component exists at `src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx` (773 lines, fully functional).

#### Current State

```typescript
// MonacoPlugin.tsx line 22 (commented out)
// import Editor from '@monaco-editor/react';

// Line 176 (placeholder)
{/* In full implementation, this would be <Editor /> from @monaco-editor/react */}
```

#### Actual Editor Location

```
src/presentation/components/ide/MonacoEditor/
├── MonacoEditor.tsx           # 773 lines - Full implementation
├── EditorTabBar.tsx           # Tab bar component
├── types.ts                   # Types
└── index.ts                   # Exports
```

#### Implementation Steps

**Step 1: Read both files**
```bash
# Current POC plugin
head -200 src/plugins/monaco/MonacoPlugin.tsx

# Actual editor implementation
head -100 src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx
```

**Step 2: Update MonacoPlugin imports**

Replace textarea with actual MonacoEditor:
```typescript
// ADD import
import { MonacoEditor } from '@/presentation/components/ide/MonacoEditor';

// OR if using @monaco-editor/react directly
import Editor from '@monaco-editor/react';
```

**Step 3: Replace placeholder with actual editor**

Find the textarea placeholder (around line 176-195) and replace with:
```typescript
<MonacoEditor
  projectId={projectContext.projectId}
  onFileSave={handleSave}
  // ... other props from ProjectContext
/>
```

**Step 4: Wire file operations through ProjectContext**

The editor needs to:
- Load file content via `projectContext.gateway.read()`
- Save file content via `projectContext.gateway.write()`
- Subscribe to file changes via `projectContext.gateway.watch()`

#### Verification Commands

```bash
# 1. Check for textarea placeholder (should be gone)
grep -n "textarea\|In full implementation" src/plugins/monaco/MonacoPlugin.tsx
# Expected: 0 results

# 2. Check for MonacoEditor import
grep -n "MonacoEditor\|@monaco-editor/react" src/plugins/monaco/MonacoPlugin.tsx
# Expected: Import line present

# 3. TypeScript check
pnpm tsc --noEmit

# 4. Dev server test
pnpm dev
# Manually verify: Navigate to project, Monaco editor loads
```

#### Acceptance Criteria

| AC ID | Criterion | Verification Method |
|-------|-----------|---------------------|
| CONS-03-1 | No textarea placeholder in MonacoPlugin | grep verification |
| CONS-03-2 | MonacoEditor or Editor imported | grep verification |
| CONS-03-3 | File operations use ProjectContext.gateway | Code inspection |
| CONS-03-4 | TypeScript compiles | `pnpm tsc --noEmit` exit 0 |
| CONS-03-5 | Monaco loads in browser | Manual test |

---

## Tool Constraints

### CRITICAL: This agent has LIMITED permissions

```yaml
write: true    # Can modify code files within scope
edit: true     # Can edit existing files
bash: true     # Can run verification commands
task: true     # Can delegate sub-tasks if needed

# Role Boundaries
MUST DO:
  - Fix only the files listed in each story
  - Run verification commands after each change
  - Update TODO comments to DONE where appropriate
  - Create evidence of completion

MUST NOT:
  - Touch files owned by Team A (project-context.tsx, $projectId.tsx, PermissionOverlay.tsx)
  - Modify architecture decisions
  - Add new dependencies without approval
  - Skip TypeScript verification
```

---

## Execution Order

```
CONS-01 (window.location.href cleanup)    ← START HERE (1h)
    ↓
CONS-02 (Project creation deprecation)    ← (1.5h)
    ↓
CONS-03 (MonacoPlugin completion)         ← (2-3h, if time permits)
```

**Total Estimated Time**: 4.5-5.5 hours

---

## Evidence Package Required

After completion, create `_bmad-output/handoffs/2026-01-25/TEAM-B-CONS-EVIDENCE-2026-01-25.md`:

```markdown
# Team B Consolidation Evidence Package

## CONS-01: window.location.href Cleanup

### TypeScript Verification
[Paste pnpm tsc --noEmit output]

### Grep Verification
[Paste grep output showing only offline-detector.ts]

### Files Modified
- [ ] DatabaseRecoveryDialog.tsx - Changed line XXX
- [ ] provider-playground.tsx - Changed line XXX

## CONS-02: Project Creation Deprecation

### Deprecation Markers Found
[Paste grep output]

### Direct createProject Calls in UI
[Paste grep output - should be 0]

## CONS-03: MonacoPlugin Completion

### Placeholder Removed
[Paste grep verification]

### Import Added
[Paste grep verification]

### Manual Test Result
[Description of test: project loaded, Monaco displayed code]

## Attestation
- All stories completed: YES/NO
- TypeScript errors: 0
- Team A files NOT touched: YES/NO
- Completed by: [agent-name]
- Timestamp: [ISO timestamp]
```

---

## Coordination with Team A

### Communication Points

1. **Before Starting**: Verify Team A is working on CC-01 to CC-04 (not overlapping files)
2. **During Execution**: If you need to touch any of Team A's files, STOP and escalate
3. **After Completion**: Update `sprint-status-2026-01-25.yaml` with CONS story statuses

### Merge Strategy

When both teams complete:
1. Team A's CC work takes priority (P0)
2. Team B's CONS work merges after (P1)
3. Combined E2E validation recommended

---

## Sprint Status Update Template

After completing each story, update `_bmad-output/sprint-artifacts/sprint-status-2026-01-25.yaml`:

```yaml
# Add to active_epics section
- epic_id: "EPIC-CONSOLIDATION"
  name: "Architecture Consolidation (Parallel Work)"
  status: "IN_PROGRESS"
  priority: "P1"
  team: "B"
  parallel_to: "EPIC-ARCH-04-CC"
  
  stories:
    - id: "CONS-01"
      title: "Remove remaining window.location.href"
      status: "DONE"  # Update when complete
      completed_at: "2026-01-25T..."
      
    - id: "CONS-02"
      title: "Consolidate project creation deprecation"
      status: "DONE"  # Update when complete
      
    - id: "CONS-03"
      title: "Complete MonacoPlugin integration"
      status: "DONE"  # Update when complete
```

---

## Handoff Signature

```yaml
artifact_id: "team_b_parallel_handoff_20260125_v1"
artifact_type: "sprint_handoff"
created_by: "bmad-master"
created_at: "2026-01-25T23:45:00+07:00"
priority: "P1"
target_agents: ["sprint-manager", "dev-ext"]
estimated_hours: 4.5-5.5
stories: 3
parallel_to: "EPIC-ARCH-04-CC"

files_in_scope:
  - "src/presentation/components/common/DatabaseRecoveryDialog.tsx"
  - "src/routes/$__debug__.provider-playground.tsx"
  - "src/lib/workspace/temp-project.ts"
  - "src/infrastructure/persistence/stores/workspace/slices/use-file-ops-slice.ts"
  - "src/infrastructure/persistence/stores/project/project-crud-slice.ts"
  - "src/plugins/monaco/MonacoPlugin.tsx"

files_out_of_scope:
  - "src/infrastructure/context/project-context.tsx"
  - "src/routes/$projectId.tsx"
  - "src/presentation/components/layout/PermissionOverlay.tsx"

evidence_required:
  - "TypeScript tsc output (0 errors)"
  - "Grep verification outputs"
  - "Monaco manual test result"
```

---

**Ready for Team B sprint-manager execution.**
