---
description: Execute systematic architectural refactoring with Phase 0 (Showcase), Phase 1 (Foundation), and Phase 2 (Full Scope)
---

# Architectural Consolidation Workflow

// turbo-all

Execute this workflow to systematically refactor the BMAD platform architecture to the v2.0 VIA-GENT standard.

## Prerequisites

Before starting this workflow, ensure:
- [ ] Sprint Change Proposal exists: `_bmad-output/sprint-change-proposal-2025-12-31.md`
- [ ] ARC Module Definition exists: `_bmad-output/bmb-creations/arc-module/module-definition.md`
- [ ] Build passes: `pnpm build`

## Workflow Steps

### Step 1: Initialize
Load and execute:
```
@_bmad/bmm/workflows/4-implementation/architectural-consolidation/steps/step-01-init.md
```

### Step 2: Phase 0 - Showcase Critical (Today)
Execute in order:
1. **Provider Foundation**:
   ```
   @_bmad/bmm/workflows/4-implementation/architectural-consolidation/steps/step-02-story-ac01.md
   ```
2. **Agent Vault**:
   ```
   @_bmad/bmm/workflows/4-implementation/architectural-consolidation/steps/step-03-story-ac02.md
   ```
3. **Chat Unification**:
   ```
   @_bmad/bmm/workflows/4-implementation/architectural-consolidation/steps/step-04-story-ac03.md
   ```

### Step 3: Phase 0 Validation
Run the gate check:
```
@_bmad/bmm/workflows/4-implementation/architectural-consolidation/steps/step-05-phase0-validation.md
```

## References
- Proposal: `_bmad-output/sprint-change-proposal-2025-12-31.md`
- Module Def: `_bmad-output/bmb-creations/arc-module/module-definition.md`
