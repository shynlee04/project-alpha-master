# Storage Remediation Workflow for ASGL Module
# Module: _bmad/modules/asgl/workspace-remediation/
# Version: 1.0.0
# Status: READY FOR EXECUTION

## Overview

This workflow coordinates the execution of the Storage Type Architecture & User Journey Crisis Remediation plan, covering all phases from wizard fixes through testing.

## Workflow Triggers

- User directive: `/bmad:bmm:workflows:correct-course`
- Platform: Both Claude Code and Open Code
- Mode: Autonomous with human approval for P0 items

## Pre-Execution Validation

### Required Files
- [ ] `_bmad-output/governance/storage-remediation-plan-2026-01-07.md`
- [ ] `_bmad-output/workspace-remediation/issues-registry.yaml`
- [ ] `.claude/AGENT-STATE.yaml` (updated)

### Story Generation

Generate stories from issues registry:

```bash
# Stories to create
STORAGE-2-1: Disable IDE checkbox for IndexedDB in Wizard
STORAGE-2-2: Add storage type info badges in Wizard
STORAGE-3-1: Create useWorkspaceProjects hook
STORAGE-3-2: Add project switcher to NotesPage
STORAGE-3-3: Add project switcher to StudyPage
STORAGE-3-4: Add project switcher to KnowledgePage
STORAGE-3-5: Add project switcher to IDELayout
STORAGE-4-1: Make WorkspaceSwitcher mobile-compatible
STORAGE-4-2: Create unified ProjectSelector component
STORAGE-5-1: Consolidate project access patterns
STORAGE-6-1: Testing & validation
```

## Execution Phases

### Phase 2: Wizard Clarity Fixes
**Duration**: 1-2 hours
**Stories**: STORAGE-2-1, STORAGE-2-2

| Story | Task | File | Success Criteria |
|-------|------|------|------------------|
| STORAGE-2-1 | Disable IDE for IndexedDB | `WorkspaceSetupStep.tsx` | IDE checkbox disabled with message |
| STORAGE-2-2 | Add storage badges | `ProjectDetailsStep.tsx` | Info badges showing compatibility |

### Phase 3: Project Lists in All Workspaces
**Duration**: 3-4 hours
**Stories**: STORAGE-3-1 through STORAGE-3-5

| Story | Task | File | Success Criteria |
|-------|------|------|------------------|
| STORAGE-3-1 | Create hook | `useWorkspaceProjects.ts` | Unified hook with filtering |
| STORAGE-3-2 | Notes switcher | `NotesPage.tsx` | Project dropdown visible |
| STORAGE-3-3 | Study switcher | `StudyPage.tsx` | Project dropdown visible |
| STORAGE-3-4 | Knowledge switcher | `KnowledgePage.tsx` | Project dropdown + storage awareness |
| STORAGE-3-5 | IDE switcher | `IDELayout.tsx` | FSA-only projects shown |

### Phase 4: Storage Validation & Mobile Handling
**Duration**: 2-3 hours
**Stories**: STORAGE-4-1, STORAGE-4-2

| Story | Task | File | Success Criteria |
|-------|------|------|------------------|
| STORAGE-4-1 | Mobile switcher | `WorkspaceSwitcher.tsx` | Touch-optimized UI |
| STORAGE-4-2 | Shared selector | `ProjectSelector.tsx` | Reusable component |

### Phase 5: Unified Project Access Pattern
**Duration**: 2-3 hours
**Story**: STORAGE-5-1

| Story | Task | Files | Success Criteria |
|-------|------|-------|------------------|
| STORAGE-5-1 | Pattern consolidation | All workspace pages | useWorkspaceProjects used everywhere |

### Phase 6: Testing & Validation
**Duration**: 1-2 hours
**Story**: STORAGE-6-1

| Task | Command | Success Criteria |
|------|---------|------------------|
| User journey tests | Manual testing | 6/6 scenarios pass |
| TypeScript check | `pnpm typecheck` | 0 errors |
| Build verification | `pnpm build` | Build succeeds |

## Story Templates

### Story: STORAGE-2-1 (Wizard IDE Fix)

```markdown
# Story: STORAGE-2-1 - Disable IDE Option for IndexedDB

**Epic**: Storage Remediation
**Priority**: P0
**Points**: 3
**Status**: drafted

## User Story
As a user creating a new project,
I want the wizard to clearly show which workspaces are available for my storage choice,
So that I understand why I can't use IDE with local storage.

## Acceptance Criteria
- [ ] AC-1: When `storageType === 'indexeddb'`, IDE checkbox is disabled
- [ ] AC-2: Disabled state shows tooltip: "IDE workspace requires File System Access (desktop only)"
- [ ] AC-3: When `storageType === 'fsa'`, IDE checkbox is enabled
- [ ] AC-4: No silent overrides - user selection is respected

## Tasks
- [ ] T1: Read WorkspaceSetupStep.tsx current implementation
- [ ] T2: Add conditional disable for IDE checkbox
- [ ] T3: Add explanatory message for disabled state
- [ ] T4: Test wizard behavior with both storage types
- [ ] T5: Update validation to check storage type

## Dev Notes
- Pattern: See useResponsive hook for mobile detection
- Reference: ProjectCreationWizard.tsx lines 260-270
```

## Governance Integration

### ASGL Module Updates
After each phase completion:
1. Update `_bmad/modules/asgl/LOOP_STATE.yaml` (create if missing)
2. Update `.claude/AGENT-STATE.yaml`
3. Log decision to `autonomous_decisions`

### Progress Tracking
```yaml
# _bmad/modules/asgl/workspace-remediation/progress.yaml
storage-remediation:
  phase: "2"  # Current phase
  stories_completed: 0
  stories_total: 8
  hours_spent: 0
  next_action: "Create story files for Phase 2"
```

## Handoff Protocol

### Between Phases
1. Phase complete → Create handoff summary
2. Update issues registry with completion status
3. Update AGENT-STATE.yaml
4. Signal next phase readiness

### Handoff Summary Template
```markdown
**Storage Remediation Sprint**
**Status**: ✅ PLAN COMPLETE - Ready for Execution

### Artifacts Created:
- ✅ `_bmad-output/governance/storage-remediation-plan-2026-01-07.md` (comprehensive plan)
- ✅ `_bmad-output/workspace-remediation/issues-registry.yaml` (10 issues identified)
- ✅ `_bmad/modules/asgl/workspace-remediation/workflow.md` (execution workflow)
- ✅ `_bmad/modules/asgl/workspace-remediation/MANIFEST.yaml` (module manifest)
- ✅ `_bmad-output/sprint-artifacts/archive/storage-sprint-status.yaml` (sprint tracking - ARCHIVED)
- ✅ `_bmad-output/sprint-artifacts/STORAGE-2-1-*.md` (story files for Phase 2)
- ✅ `.claude/AGENT-STATE.yaml` (updated with new session)

### Phase 1 Complete:
- Comprehensive scan of all workspace components
- 13 critical issues identified
- Issues registry created with P0/P1/P2 categorization
- Estimated effort: 11-17 hours across 8 stories
```

## Validation Gates

### Before Starting Phase
- [ ] Previous phase 100% complete
- [ ] All stories created in sprint-status.yaml (canonical: _bmad-output/sprint-artifacts/sprint-status.yaml)
- [ ] Context XML generated for each story

### During Phase
- [ ] No TypeScript errors (run typecheck periodically)
- [ ] Tests pass (if applicable)
- [ ] Code review for each story

### After Phase
- [ ] All success criteria met
- [ ] User journey tested
- [ ] Documentation updated

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Wizard changes break project creation | Low | High | Test with dummy project |
| Mobile switcher introduces layout issues | Medium | Medium | Test on multiple breakpoints |
| Pattern consolidation causes regressions | Medium | High | Comprehensive testing |
| Dependencies between stories block progress | Medium | Medium | Parallel execution where possible |

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| TypeScript errors added | 0 | `pnpm typecheck` |
| User journey pass rate | 100% | 6/6 scenarios |
| Story completion rate | 100% | 8/8 stories |
| Time to complete | ≤17 hours | Sprint tracking |
