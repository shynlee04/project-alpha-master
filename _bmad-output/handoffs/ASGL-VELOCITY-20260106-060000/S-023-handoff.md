# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: S-023
**Title**: Project Creation Wizard
**Date**: 2026-01-06T09:15:00+07:00
**Priority**: P1 - HIGH

## From
- **Agent**: bmad-core-bmad-master (coordinator)
- **Module**: asgl

## To
- **Agent**: bmad-bmm-dev
- **Module**: bmm
- **Path**: _bmad/modules/bmm/agents/dev.md

## Task
Create multi-step project creation wizard with workspace configuration, agent selection, and initial file setup.

## Context
Users can view projects but lack guided creation flow. Need onboarding wizard that walks through project setup step-by-step.

## Root Cause
```typescript
// No project creation wizard exists
// ProjectPickerDialog only shows existing projects
// No guided workflow for new project setup
// Missing workspace/agent configuration during creation
```

## Files to Create/Modify
- **Create**: `src/presentation/components/project/ProjectCreationWizard.tsx` - Multi-step wizard
- **Create**: `src/presentation/components/project/steps/ProjectDetailsStep.tsx` - Step 1: Basic info
- **Create**: `src/presentation/components/project/steps/WorkspaceSetupStep.tsx` - Step 2: Workspace config
- **Create**: `src/presentation/components/project/steps/AgentSelectionStep.tsx` - Step 3: Agent selection
- **Create**: `src/presentation/components/project/steps/FileSetupStep.tsx` - Step 4: Initial files
- **Create**: `src/presentation/components/project/steps/ReviewStep.tsx` - Step 5: Review & create
- **Modify**: `src/routes/hub.tsx` - Add "Create Project" button
- **Modify**: `src/lib/project/project-service.ts` - Add wizard validation logic

## Constraints
- Multi-step wizard with progress indicator
- Each step validates before proceeding
- Can skip optional steps (workspace, agents)
- Back/Next navigation with keyboard shortcuts
- Mobile-optimized (touch targets ≥44px)
- i18n strings via t() function
- 8-bit gaming style (no glassmorphism)
- Project creation creates valid project structure

## Wizard Steps

### Step 1: Project Details (Required)
- Project name (2-50 chars, unique)
- Description (optional, max 500 chars)
- Project type dropdown (app, library, experiment, learning)
- Icon selection (emoji or color)

### Step 2: Workspace Setup (Optional)
- Workspace name
- Local path or WebContainer workspace
- Initial folder structure
- Template selection (blank, react-app, next-app, node-lib)

### Step 3: Agent Selection (Optional)
- Select default agent for project
- Configure tool permissions
- Set agent capabilities (read, write, execute)
- Override workspace agent bindings

### Step 4: File Setup (Optional)
- Create initial files from template
- Import existing files
- Set up configuration files
- Create README.md

### Step 5: Review & Create
- Summary of all choices
- Validation checks (name unique, path valid)
- Create or Back buttons
- Success animation on creation

## Acceptance Criteria
- [ ] Multi-step wizard with 5 steps
- [ ] Progress indicator showing current step
- [ ] Step validation (required fields)
- [ ] Back/Next navigation with keyboard (Arrow Left/Right)
- [ ] Can skip optional steps (2, 3, 4)
- [ ] Mobile-optimized layout
- [ ] i18n strings via t() function
- [ ] 8-bit gaming style maintained
- [ ] Creates valid project with proper structure
- [ ] Success message after creation
- [ ] Error handling for invalid inputs

## Skills to Invoke
- `frontend-components` - Build wizard UI
- `brainstorming` - Design wizard flow and steps
- `global-validation` - Input validation
- `frontend-accessibility` - Keyboard navigation
- `global-coding-style` - Consistent patterns

## Validation Commands
```bash
# TypeScript check
pnpm typecheck

# Verify wizard component created
ls -la src/presentation/components/project/ProjectCreationWizard.tsx

# Verify all steps created
ls -la src/presentation/components/project/steps/
```

## Related Issues
- User onboarding experience
- Project creation UX
- Ralph Loop Cycle 5A: New user experience

## Next Action
Create ProjectCreationWizard component with 5 steps, progress indicator, validation, and mobile optimization.

---
**Handoff ID**: S-023-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: development-essentials:code
