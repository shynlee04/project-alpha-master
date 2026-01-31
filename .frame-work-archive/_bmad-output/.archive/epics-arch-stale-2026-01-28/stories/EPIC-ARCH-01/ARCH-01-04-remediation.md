---
story_id: ARCH-01-04-remediation
title: Complete Wizard Simplification (Hide AgentSelectionStep)
points: 3
priority: P1
status: pending
team: B
dependencies:
  - ARCH-01-06-remediation
time_box: 1 hour
created_at: 2026-01-21T17:30:00+07:00
epic_id: EPIC-ARCH-01
epic_name: Foundation Cleanup
architecture_ref: ADR-034
parent_story: ARCH-01-04
---

# Story: ARCH-01-04-Remediation - Complete Wizard Simplification

## Description

As a user, I want a Project Wizard with ≤10 visible options (not 23), So that project creation is faster and less overwhelming while advanced options are accessible later.

## Context

**Original Story Claim (ARCH-01-04):**
- "Removed: workspaceName (auto-generate), workspaceType (always local)"
- "Removed: projectType options (4→2: app/library)"
- "Removed: projectIcons (10→6 emojis)"
- "Removed: workspaceTemplate (4→3, removed node-lib)"
- "Simplified: agentPermissions (3 toggles → 1 fullAccess toggle)"
- "Simplified: fileSetupEnabled + createReadme + createGitignore → createReadme only"
- "Archived TemplateSelectionStep.tsx"
- "TypeScript compiles with 0 new errors"

**Architect Validation Findings (FAIL):**
- `src/presentation/components/project/steps/AgentSelectionStep.tsx` exists (132 lines)
- `src/presentation/components/project/ProjectCreationWizard.tsx` line 39 imports AgentSelectionStep
- `src/presentation/components/project/ProjectCreationWizard.tsx` line 337 renders `<AgentSelectionStep {...props} />`
- Claim about "wizard simplified" is FALSE - AgentSelectionStep still active
- Wizard still has >10 options (needs validation)

**What's Working:**
- TemplateSelectionStep.tsx was archived ✅
- Some options were simplified ✅

**What's Not Working:**
- AgentSelectionStep is still rendered in wizard flow ❌
- Wizard options count not verified (likely still >10) ❌

## Acceptance Criteria

- [ ] AgentSelectionStep removed from wizard steps array OR hidden with `enabled: false` condition
- [ ] AgentSelectionStep.tsx file retained (don't delete - needed for Phase 4)
- [ ] Wizard has ≤10 visible options (count and document)
- [ ] TypeScript: 0 new errors
- [ ] Build succeeds (pnpm build)

## Tasks

### Phase 1: Count Wizard Options (15 min)
- [ ] Audit ProjectCreationWizard.tsx to count all visible options
- [ ] Document each option (inputs, toggles, selects, etc.)
- [ ] Verify count is ≤10
- [ ] If >10, identify which options to remove or hide

### Phase 2: Hide/Remove AgentSelectionStep (15 min)
- [ ] Remove AgentSelectionStep from wizard steps array OR add `enabled: false` condition
- [ ] Keep AgentSelectionStep.tsx file intact (Phase 4 will need it)
- [ ] Update wizard flow to skip Agent Selection step
- [ ] Verify no broken references to removed options

### Phase 3: Verify Option Count (15 min)
- [ ] Re-count visible wizard options after hiding AgentSelectionStep
- [ ] Document all remaining visible options
- [ ] Ensure count is ≤10
- [ ] If still >10, remove additional options

### Phase 4: Validation (15 min)
- [ ] Run TypeScript compiler (0 errors)
- [ ] Run build command (success)
- [ ] Test wizard renders without errors
- [ ] Verify agentPermissions logic works (if fullAccess toggle exists)

## Dependencies

- ARCH-01-06-remediation (TypeScript errors must be fixed first)
  - Cannot validate changes if TS errors block compilation

## Blocked By

- ARCH-01-06-remediation (pending)

## Handoff Artifacts

- `_bmad-output/sprint-artifacts/stories/EPIC-ARCH-01/ARCH-01-04-remediation-completion.md`

## Notes

- **Critical**: Do NOT delete AgentSelectionStep.tsx file
  - File will be needed for Phase 4 of EPIC-ARCH-02 (Feature Plugins)
  - Keep it in codebase, just hide from wizard flow

- **Two Approaches**:
  1. Remove from steps array (cleaner, but file unused)
  2. Add `enabled: false` condition (keeps file usable for Phase 4)
  - Recommended: Approach 2 for Phase 4 compatibility

- **Option Count**:
  - Must count ALL visible options (inputs, toggles, selects, radio buttons)
  - Not just wizard steps - count actual UI controls user sees
  - Document the count in completion report

## Required MCP Research

None - this is remediation work based on existing code.

## Implementation Guidelines

1. **ProjectCreationWizard.tsx**:
   - Find wizard steps array
   - Either remove AgentSelectionStep from array
   - Or add conditional: `if (showAgentSelection) { return <AgentSelectionStep /> }`
   - Set `showAgentSelection = false` (or remove entirely)

2. **AgentSelectionStep.tsx**:
   - DO NOT DELETE this file
   - Keep intact for Phase 4 (Feature Plugins)
   - File can remain unused for now

3. **Option Count**:
   - Count all `<Input>`, `<Select>`, `<Switch>`, `<RadioGroup>` components in wizard
   - Count them BEFORE and AFTER hiding AgentSelectionStep
   - Document exact count in completion report

4. **Preserved Features** (from original story):
   - WorkspaceName: auto-generate ✅
   - WorkspaceType: always local ✅
   - ProjectType: app/library only ✅
   - ProjectIcons: 6 emojis only ✅
   - WorkspaceTemplate: 3 options (removed node-lib) ✅
   - AgentPermissions: 1 fullAccess toggle ✅
   - FileSetup: createReadme only ✅

## Validation Report

**Validated At:** 2026-01-21T17:30:00+07:00
**Result:** PENDING (Awaiting Remediation)

### Evidence of Failure

```bash
# From architect grep:
src/presentation/components/project/steps/AgentSelectionStep.tsx: 132 lines (file exists)
src/presentation/components/project/ProjectCreationWizard.tsx: line 39:
  import { AgentSelectionStep } from './steps/AgentSelectionStep';
src/presentation/components/project/ProjectCreationWizard.tsx: line 337:
  return <AgentSelectionStep {...props} />;
```

### Verdict: FAIL - AgentSelectionStep still active in wizard

## Success Metrics

When complete:
- AgentSelectionStep not rendered in wizard flow
- Wizard option count documented and ≤10
- AgentSelectionStep.tsx file retained (not deleted)
- TypeScript: 0 new errors
- Build succeeds
