---
artifact_id: "handoff-arc-b08-2026-01-12"
artifact_type: "handoff"
parent_id: "master-orchestrator-epic-cc-arc"
story_id: "ARC-B08"
source_agent: "master-orchestrator"
target_agent: "dev-ext"
created_at: "2026-01-18T11:30:00+07:00"
status: "PENDING"
sprint_id: "epic-cc-arc-week3-2026-01-12"
workflow: "story-cycle"
version: "2.0.0"
---

# ═══════════════════════════════════════════════════════════════
# HANDOFF ARTIFACT: ARC-B08
# File Tree Exclusion Patterns Configuration
# ═══════════════════════════════════════════════════════════════

**Epic**: EPIC-CC-ARC (Correct-Course Architectural Remediation)
**Team**: Team B (Storage Contract Squad)
**Week**: 3
**Story Type**: feature_development
**Priority**: P1
**Estimated Effort**: 3h

---

## CONTEXT SUMMARY

Orchestrator delegating **ARC-B08**: File tree exclusion patterns configuration

This story implements configurable file/folder exclusion patterns for the file tree scanner. Users can specify patterns to ignore during project scanning (e.g., `node_modules`, `.git`, `.next`, etc.).

**Dependency Status**: ARC-B05 (FileSystemObserver) ✅ Complete - FileTreeScanner exists

---

## HANDOFF DATA

### Story Specification

**Title**: File tree exclusion patterns configuration

**Description**:
Configure exclusion patterns for file tree scanning. Default patterns should include common development folders (`node_modules`, `.git`, `.next`, etc.). Users can add custom patterns stored in `.viagent/config.json`.

**Acceptance Criteria**:
1. ✅ Default exclusions applied automatically
2. ✅ User can configure additional patterns via settings
3. ✅ Patterns stored in `.viagent/config.json`
4. ✅ TypeScript: 0 errors

**Dependencies**:
- ARC-B05: FileSystemObserver with polling fallback ✅ COMPLETE
- FileTreeScanner: `src/infrastructure/filesystem/file-tree-scanner.ts` ✅ EXISTS

---

## TECHNICAL CONTEXT

### Existing Code to Work With

**FileTreeScanner** (`src/infrastructure/filesystem/file-tree-scanner.ts`):
- Already has default exclusions built in (lines with `DEFAULT_EXCLUSIONS`)
- Methods: `scan()`, `loadOrScan()`, `refreshInBackground()`
- Exclusions currently hardcoded in the class

**ViagentService** (`src/infrastructure/filesystem/viagent-service.ts`):
- Manages `.viagent/` folder metadata
- Methods: `initializeViagentFolder()`, `readProjectMetadata()`
- Can be extended to read/write config

### Integration Points

1. **Domain Layer**: Create exclusion pattern types
2. **Infrastructure**: Extend ViagentService with config read/write
3. **Presentation**: Add exclusion settings UI (if needed, or defer)

### Key Files to Reference

```
src/infrastructure/filesystem/
├── file-tree-scanner.ts     # Has DEFAULT_EXCLUSIONS constant
├── viagent-service.ts         # Manages .viagent/ metadata
└── fsa-gateway.ts             # Uses scanner for file tree

src/domain/types/
└── viagent-metadata.ts         # Has ViagentConfig interface
```

---

## ACCEPTANCE CRITERIA

| Criterion | Verification Method |
|-----------|---------------------|
| Default exclusions applied | Check DEFAULT_EXCLUSIONS includes: node_modules, .git, .next, dist, build, coverage, .cache, .turbo, out, .viagent |
| User can configure additional patterns | UI or API to add custom patterns |
| Patterns stored in .viagent/config.json | File exists and contains patterns array |
| TypeScript: 0 errors | Run `pnpm tsc --noEmit` |

---

## VALIDATION COMMANDS

```bash
# TypeScript check
pnpm tsc --noEmit

# Run tests (if applicable)
pnpm vitest run

# Lint check
pnpm lint
```

---

## ESCALATION PATH

On failure → Report to master-orchestrator with:
- Error details (stack trace, error message)
- What was attempted (code changes, file operations)
- Recovery actions taken (rollbacks, fixes)
- Recommendation for next steps (retry with different approach, escalate to different agent, defer story)

---

## OUTPUT REQUIREMENTS

1. **Code Changes**:
   - Modify `FileTreeScanner` to accept configurable exclusions
   - Extend `ViagentService` to read/write config
   - Add/update types in `viagent-metadata.ts`

2. **Documentation**:
   - Update this handoff with implementation notes
   - Add inline comments explaining the exclusion pattern matching

3. **Validation**:
   - TypeScript: 0 errors
   - Default exclusions still work after refactoring
   - Custom patterns can be added and persist

---

## TRACEABILITY

- **ADR**: `_bmad-output/planning-artifacts/adr/ADR-033-correct-course-architectural-remediation-2026-01-16.md`
- **Sprint Status**: `_bmad-output/sprint-artifacts/epic-cc-arc-sprint-2026-01-11.yaml`
- **Workflow Status**: `bmm-workflow-status.yaml`
- **LOOP_STATE**: `_bmad-ext/state/LOOP_STATE.yaml`

---

## GOVERNANCE NOTES

- Follow **ADR-033** decisions for file structure and storage
- Maintain **clean architecture** boundaries (domain/infrastructure/presentation)
- **No hardcoded values** that should be configurable
- **8-bit design** if UI is involved (no transparency, sharp corners)
- **i18n support** for any user-facing strings (English + Vietnamese)

---

**Status**: PENDING delegation to dev-ext
**Next Step**: dev-ext to execute Step 1: Init (deep project analysis)
