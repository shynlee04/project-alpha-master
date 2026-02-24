# Story: ARCH-02-FIX-02

**Story ID:** ARCH-02-FIX-02
**Title:** Fix File Extension/Import Issues in ProjectContext
**Priority:** P0 (IMMEDIATE)
**Effort:** 15 minutes
**Timebox:** 30 minutes max
**Team:** Any (first available)
**Status:** pending
**Epic:** EPIC-ARCH-02
**Created:** 2026-01-21
**Last Updated:** 2026-01-21

---

## Context

### Authority Documents (READ THESE)

1. **ADR-034:** `_bmad-output/planning-artifacts/adr/ADR-034-project-centric-architecture-2026-01-20.md`
   - Defines Project-Centric Architecture
   - Specifies file structure for plugins and context
   - Section: "Phase 2: Feature Plugins (Week 3-4)" - amended to include route migration

2. **CORRECT-COURSE:** `_bmad-output/correct-course/CORRECT-COURSE-ADR034-REMEDIATION-2026-01-20.md`
   - Part 4.1: Immediate Fixes Before Continuing
   - Identifies file extension and import issues
   - Critical: "Files have .tsx extension but may not need JSX"
   - Required: "All imports in use-project-context.ts resolve correctly"

### Problem Statement (from CORRECT-COURSE Part 4.1)

Files created in ARCH-02-03 (ProjectContext Provider) have issues:
- `src/infrastructure/context/project-context.tsx` - has .tsx extension but may not need JSX
- `src/infrastructure/context/use-project-context.ts` - imports reference paths without extensions
- TypeScript error: `use-project-context.ts(24,1): error TS1128: Declaration or statement expected`

### Root Cause

The new context files were created with incorrect file extensions and import paths:
- TypeScript expects consistent file extensions or explicit extension in imports
- Some files marked .tsx but don't use JSX
- Import statements don't include file extensions when needed

---

## Description

As a developer, I want to fix file extension and import issues in the ProjectContext files so that TypeScript compiles without errors and the files can be imported by other modules.

---

## Acceptance Criteria

- [ ] All imports in `use-project-context.ts` resolve correctly
- [ ] TypeScript compiles (0 errors from these files)
- [ ] Files can be imported by other modules
- [ ] File extensions match content (.ts if no JSX, .tsx if JSX present)
- [ ] Import paths include correct extensions where required

---

## Implementation Notes

### Files to Check/Fix

1. **src/infrastructure/context/project-context.tsx**
   - Check if JSX is actually used
   - If no JSX, rename to `.ts` and update imports
   - If JSX present, keep `.tsx` and ensure imports include `.tsx` extension

2. **src/infrastructure/context/use-project-context.ts**
   - Check imports for missing extensions
   - Verify all imports reference existing files
   - Fix import paths to include extensions where needed

### Verification Command

```bash
pnpm tsc --noEmit 2>&1 | grep -E "(project-context|use-project-context)"
# Expected: No errors
```

### Possible Solutions

**Option A:** Rename to `.ts` if no JSX present
- Change `project-context.tsx` → `project-context.ts`
- Update all imports to reference `.ts` file
- Keep imports without extension (TypeScript resolves `.ts` automatically)

**Option B:** Keep `.tsx` but fix import paths
- Keep `project-context.tsx` as-is
- Update imports to include `.tsx` extension
- Example: `from './project-context'` → `from './project-context.tsx'`

**Decision:** Implementer should check if JSX is used in files and choose appropriate option.

---

## Dependencies

**None** - This is a standalone fix story

---

## Handoff Artifacts

- Story file: `_bmad-output/sprint-artifacts/stories/EPIC-ARCH-02/ARCH-02-FIX-02.md`
- Context file: `_bmad-output/sprint-artifacts/stories/EPIC-ARCH-02/ARCH-02-FIX-02-context.xml`
- Completion report: `_bmad-output/sprint-artifacts/stories/EPIC-ARCH-02/ARCH-02-FIX-02-completion.md`

---

## Critical Rules (from CORRECT-COURSE)

- **NO** modifications to ADR files (read-only reference)
- **NO** new routes without ARCH-02-10 story
- **NO** window.location.href usage in new code
- **NO** imports from `@/lib/workspace/ProjectContext` in new code
- **YES** follow ADR-034 architecture for Project-Centric model

---

## Success Metrics

- TypeScript compilation: 0 errors
- Import resolution: All imports resolve correctly
- File consistency: Extensions match content
- Timebox: ≤30 minutes

---

## Verification Checklist

After implementation, verify:

```bash
# 1. TypeScript check
pnpm tsc --noEmit
# Expected: 0 errors

# 2. Check for project-context errors specifically
pnpm tsc --noEmit 2>&1 | grep -E "(project-context|use-project-context)"
# Expected: No output (no errors)

# 3. Verify files exist
ls -la src/infrastructure/context/
# Expected: project-context.ts (or .tsx) and use-project-context.ts
```

---

## References

- EPIC-ARCH-02: `_bmad-output/planning-artifacts/epics/EPIC-ARCH-02-feature-plugins-2026-01-20.md`
- ADR-034: `_bmad-output/planning-artifacts/adr/ADR-034-project-centric-architecture-2026-01-20.md`
- CORRECT-COURSE: `_bmad-output/correct-course/CORRECT-COURSE-ADR034-REMEDIATION-2026-01-20.md`
- AGENTS.md: Project governance rules

---

## Approval

- [x] Story file created
- [ ] Story validated
- [ ] Context file created
- [ ] Delegated to dev-ext
- [ ] Implementation complete
- [ ] Code review passed
- [ ] Validation complete
- [ ] Completion report created
