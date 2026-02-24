# ARCH-02-FIX-03 - TypeScript Path Resolution Fix

**Story ID:** ARCH-02-FIX-03
**Epic:** EPIC-ARCH-02 (Plugin Architecture)
**Priority:** P0 (Critical - Blocks remaining ARCH-02 stories)
**Status:** READY
**Created:** 2026-01-21T15:45:00+07:00
**Estimated Effort:** 2 hours
**Time Box:** 2 hours

---

## Context

**Previous Story:** ARCH-02-04 - Convert FileTree to Plugin + Migrate notes.$projectId Route

**Issues Identified:**
1. TypeScript cannot resolve `@/infrastructure/context/project-context` import path correctly
2. Two `ProjectContext` interfaces exist in different locations:
   - `src/infrastructure/context/project-context.tsx` (old location)
   - `src/infrastructure/context/use-project-context.ts` (new location with hooks)

**Root Cause:**
Path alias configuration in `tsconfig.json` may not be correctly mapping `@/infrastructure/context/*` imports, or there may be duplicate context definitions causing conflicts.

**Impact:**
- ❌ TypeScript compilation fails with path resolution errors
- ❌ AC6, AC7, AC8, AC9 of ARCH-02-04 are blocked
- ❌ Cannot validate FileTree plugin functionality end-to-end
- ❌ Future ARCH-02 stories (Monaco plugin, Terminal plugin) will have same issues

---

## Acceptance Criteria

- [ ] **AC1:** Analyze and document all ProjectContext export locations
  - Identify all files that define `ProjectContext`
  - Identify all files that import `ProjectContext`
  - Document the correct canonical location

- [ ] **AC2:** Consolidate ProjectContext to single canonical location
  - Determine correct location based on ADR-033 Clean Architecture
  - Remove duplicate definitions
  - Update all imports to use canonical path

- [ ] **AC3:** Verify TypeScript path alias configuration
  - Check `tsconfig.json` `paths` configuration
  - Ensure `@/infrastructure/context/*` maps correctly
  - Fix any misconfigurations

- [ ] **AC4:** TypeScript compiles with 0 errors
  ```bash
  pnpm tsc --noEmit
  ```
  Must output: ✅ Found 0 errors

- [ ] **AC5:** All ARCH-02-04 AC criteria pass
  - AC6: File tree loads project files ✅
  - AC7: File selection works ✅
  - AC8: TypeScript compiles with 0 errors ✅
  - AC9: Route functions end-to-end ✅

- [ ] **AC6:** Build succeeds
  ```bash
  pnpm build
  ```
  Must complete successfully

---

## Tasks

### Phase 1: Discovery (30 min)

- [ ] **T1:** Search for all `ProjectContext` definitions
  ```bash
  rg "interface ProjectContext" --type ts --type tsx
  rg "export.*ProjectContext" --type ts --type tsx
  ```

- [ ] **T2:** Search for all `ProjectContext` imports
  ```bash
  rg "from.*ProjectContext" --type ts --type tsx
  rg "import.*ProjectContext" --type ts --type tsx
  ```

- [ ] **T3:** Analyze ADR-033 for canonical context location
  - Read ADR-033 infrastructure/persistence guidelines
  - Determine correct location based on Clean Architecture

- [ ] **T4:** Check tsconfig.json paths configuration
  ```bash
  rg "paths" tsconfig.json -A 20
  ```

### Phase 2: Consolidation (60 min)

- [ ] **T5:** Document findings in temporary report
  - Create `_bmad-output/sprint-artifacts/stories/EPIC-ARCH-02/ARCH-02-FIX-03-findings.md`
  - List all ProjectContext locations
  - List all import locations
  - Recommend canonical location

- [ ] **T6:** Consolidate to canonical location
  - If duplicate: Remove older version
  - If split: Merge into single file
  - Ensure exports are consistent

- [ ] **T7:** Update all imports
  - Replace all imports to use canonical path
  - Verify no broken imports remain
  - Check for circular dependencies

- [ ] **T8:** Update tsconfig.json if needed
  - Add or correct path alias if missing
  - Verify path resolution works

### Phase 3: Validation (30 min)

- [ ] **T9:** Run TypeScript check
  ```bash
  pnpm tsc --noEmit
  ```
  Must have 0 errors

- [ ] **T10:** Verify ARCH-02-04 FileTree functionality
  - Load notes.$projectId route
  - Verify FileTree loads
  - Verify file selection works

- [ ] **T11:** Create completion report
  - Document changes made
  - List files modified
  - Provide evidence of success

---

## Dependencies

- **Blocked by:** None (can proceed immediately)
- **Blocks:** ARCH-02-05 (Monaco Plugin), ARCH-02-06 (Terminal Plugin)
- **Related Stories:** ARCH-02-04 (FileTree Plugin - needs unblocking)

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Multiple ProjectContext definitions needed (e.g., different contexts) | Low | High | Analyze use cases, potentially rename if truly distinct |
| tsconfig.json path resolution issue | Medium | Medium | Fix tsconfig.json paths configuration |
| Circular dependency after consolidation | Low | Medium | Use dependency analysis tools to verify |
| Breaks other stories/components | Medium | High | Thorough testing after consolidation |

---

## Handoff Artifacts

### Input Artifacts
- `_bmad-output/sprint-artifacts/stories/EPIC-ARCH-02/ARCH-02-04-completion.md`
- `src/presentation/components/common/AppInitializer.tsx`
- `src/plugins/filetree/FileTreePlugin.tsx`
- `src/routes/notes.$projectId.tsx`

### Output Artifacts
- `_bmad-output/sprint-artifacts/stories/EPIC-ARCH-02/ARCH-02-FIX-03-findings.md`
- `_bmad-output/sprint-artifacts/stories/EPIC-ARCH-02/ARCH-02-FIX-03-completion.md`
- Updated tsconfig.json (if modified)
- Modified context files (if consolidated)

---

## Success Metrics

| Metric | Target |
|--------|--------|
| TypeScript errors | 0 |
| ProjectContext definitions | 1 (canonical only) |
| Import consistency | 100% of imports use canonical path |
| ARCH-02-04 AC completion | AC6, AC7, AC8, AC9 passing |
| Build time | No regression (< 5 minutes) |

---

## Delegation Instructions

**Recommended Agent:** dev-ext

**Tool Constraints:**
```markdown
## Tool Constraints

**CRITICAL**: This agent has LIMITED permissions:
- write: true - Can create reports, modify tsconfig.json, update imports
- edit: true - Can consolidate context files, fix imports
- bash: true (limited) - Can run pnpm tsc --noEmit for validation ONLY
- task: true - Can delegate further if approved

**Role Boundaries**:
- [CONSOLIDATION & FIX] - Consolidate duplicate context definitions, fix path resolution
- [WHAT NOT TO DO] - Don't change context semantics, only organization and imports

**Required Output**:
- Report location: _bmad-output/sprint-artifacts/stories/EPIC-ARCH-02/ARCH-02-FIX-03-completion.md
- Success criteria: 0 TypeScript errors, 1 ProjectContext definition, all imports consistent
- Timebox: 2 hours
```

---

## References

- **ADR-033:** `_bmad-output/planning-artifacts/adr/ADR-033-correct-course-architectural-remediation-2026-01-16.md`
- **Clean Architecture:** Infrastructure layer context locations
- **ARCH-02-04:** `_bmad-output/sprint-artifacts/stories/EPIC-ARCH-02/ARCH-02-04-completion.md`
- **TypeScript Path Aliases:** tsconfig.json `paths` section
