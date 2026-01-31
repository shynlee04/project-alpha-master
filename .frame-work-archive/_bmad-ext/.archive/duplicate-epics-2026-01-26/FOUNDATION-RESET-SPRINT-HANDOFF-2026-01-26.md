# Handoff Artifact: EPIC-FOUNDATION-RESET Sprint Assignment

**Artifact ID:** hnd_20260126_100000_foundation_reset
**Artifact Type:** handoff
**Created:** 2026-01-26T10:00:00+07:00
**Source Agent:** architect-ext
**Target Agent:** bmad-sprint-manager
**Status:** PENDING

---

## Context Summary

The architect-ext agent has completed architectural analysis and created EPIC-FOUNDATION-RESET to remediate false completion claims in EPIC-ARCH-01, EPIC-ARCH-02, and EPIC-ARCH-03.

**Key Finding:** The codebase does NOT align with ADR-034 project-centric architecture:
- 20 routes exist (should be 2)
- 170+ "workspace" references remain
- PluginLayout is 1034-line god component
- Monaco is POC stub (textarea, not real editor)
- 40+ i18n keys missing

---

## Artifacts Created

| Artifact | Path | Purpose |
|----------|------|---------|
| ADR Amendment | `_bmad-output/planning-artifacts/adr/ADR-034-AMENDMENT-002-foundation-reset-2026-01-26.md` | Documents false completion, creates reset plan |
| Epic File | `_bmad-output/planning-artifacts/epics/EPIC-FOUNDATION-RESET-2026-01-26.md` | 9 stories with acceptance criteria |
| Route Architecture | `_bmad-output/architecture/FOUNDATION-RESET/route-structure-2026-01-26.md` | Correct route structure diagram |

---

## Handoff Data

### Stories Ready for Execution

| Story | Title | Team | Effort | Status |
|-------|-------|------|--------|--------|
| FR-01 | Archive All Legacy Routes | A | 1h | READY |
| FR-02 | Implement Correct Hub Route | A | 2h | BLOCKED by FR-01 |
| FR-03 | Implement Correct Project Route | A | 3h | BLOCKED by FR-01 |
| FR-04 | Remove Workspace Terminology | B | 4h | BLOCKED by FR-03 |
| FR-05 | Split PluginLayout | B | 3h | BLOCKED by FR-03 |
| FR-06 | Replace Monaco POC | B | 4h | BLOCKED by FR-03 |
| FR-07 | Add Missing i18n Keys | A | 2h | BLOCKED by FR-04 |
| FR-08 | Fix Single Sidebar | A | 2h | BLOCKED by FR-05 |
| FR-09 | E2E Validation | Both | 3h | BLOCKED by FR-01..FR-08 |

### Files to Archive (FR-01)

```
src/routes/ide.$projectId.tsx
src/routes/notes.$projectId.tsx
src/routes/workspace/$projectId.tsx
src/routes/workspace/index.tsx
src/routes/notes.lazy.tsx
src/routes/ide.tsx
src/routes/agents.tsx
src/routes/settings.tsx
src/routes/projects.tsx
```

**Archive Location:** `_bmad-ext/.archive/legacy-routes-2026-01-26/`

### Tool Constraints for dev-ext

```yaml
tool_constraints:
  write: true
  edit: true
  bash: true (limited - TypeScript check, file operations)
  task: false (no sub-delegation without approval)
```

### Evidence Requirements

Each story completion MUST include:
1. TypeScript output: `pnpm tsc --noEmit 2>&1 | tee /tmp/tsc-output.txt`
2. File verification: `ls -la <modified-files>`
3. Screenshot (where applicable)
4. Console log check (for UI changes)

---

## Escalation Path

```
On blocker → Report to bmad-sprint-manager
On architecture question → Escalate to architect-ext
On governance violation → Escalate to bmad-governance
```

---

## Acceptance Criteria for Handoff

Sprint manager should:
1. ✅ Acknowledge receipt of this handoff
2. ✅ Update LOOP_STATE.yaml with new epic
3. ✅ Assign FR-01 to Team A dev-ext
4. ✅ Create story context files for each story
5. ✅ Begin sprint execution

---

## References

- Epic File: `_bmad-output/planning-artifacts/epics/EPIC-FOUNDATION-RESET-2026-01-26.md`
- ADR: `_bmad-output/planning-artifacts/adr/ADR-034-AMENDMENT-002-foundation-reset-2026-01-26.md`
- Fundamental Truths: `new-fundamental-truths.md`
- 3-Phase Approach: `docs/the-3-phase-approach.md`
