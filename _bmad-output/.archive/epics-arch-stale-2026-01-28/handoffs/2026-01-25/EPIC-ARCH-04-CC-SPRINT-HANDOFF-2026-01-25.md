# SPRINT HANDOFF: EPIC-ARCH-04-CC Correct-Course Remediation

> **Handoff ID**: SPRINT-HANDOFF-ARCH-04-CC-2026-01-25
> **From**: bmad-master (Orchestrator)
> **To**: sprint-manager, dev-ext (Team A or B)
> **Created**: 2026-01-25T23:00:00+07:00
> **Priority**: P0 CRITICAL
> **Status**: READY_FOR_EXECUTION

---

## 🚨 CRITICAL: This is a P0 Blocker

**ALL PHASES ARE BLOCKED until this epic is complete.**

| Phase | Status |
|-------|--------|
| Phase 1A: Non-AI Core | ⛔ BLOCKED |
| Phase 1B: BYOK + Notes | ⛔ BLOCKED |
| Phase 2: Chat + Agents | ⛔ BLOCKED |
| Phase 3: Advanced | ⛔ BLOCKED |

---

## Epic Summary

**Epic File**: `_bmad-output/planning-artifacts/epics/EPIC-ARCH-04-CC-correct-course-remediation-2026-01-25.md`

**Problem**: ProjectContextProvider lacks FSA handle lifecycle integration, making app non-functional for desktop FSA projects.

**Solution**: 4 stories with exact code changes, line-by-line specifications, and mandatory evidence capture.

---

## Story Queue

| # | Story ID | Title | Effort | Dependencies | Assigned |
|---|----------|-------|--------|--------------|----------|
| 1 | **CC-01** | Add initialHandle Prop and FSA Restore Logic | 2h | None | dev-ext |
| 2 | **CC-02** | Wire PermissionOverlay with Persist and Reinit | 1.5h | CC-01 | dev-ext |
| 3 | **CC-03** | Wire Route to Pass initialHandle | 1h | CC-01 | dev-ext |
| 4 | **CC-04** | End-to-End Validation with Evidence | 1.5h | CC-01,02,03 | real-world-validator |

**Total Estimated**: 4-6 hours

---

## Tool Constraints for dev-ext

```markdown
## Tool Constraints

**CRITICAL**: This agent has LIMITED permissions:
- write: true - Can modify specified files ONLY
- edit: true - Can edit code files as specified
- bash: true (limited) - TypeScript check, grep verification ONLY
- task: false - DO NOT delegate, execute directly

**Role Boundaries**:
- ONLY modify files specified in each story
- ONLY make changes specified in epic document
- DO NOT add "improvements" or refactoring
- DO NOT modify other files

**Required Output**:
- Report location: `_bmad-output/handoffs/2026-01-25/CC-[XX]-DEV-REPORT-2026-01-25.md`
- Success criteria: All ACs passed with evidence
- Timebox: 2 hours per story maximum

**Evidence Requirements (NON-NEGOTIABLE)**:
- TypeScript output saved to file
- Grep verification commands run and output captured
- DO NOT claim "complete" without evidence
```

---

## Execution Instructions

### For Sprint-Manager

1. **Assign CC-01 to dev-ext immediately**
   - This is the gate story - CC-02 and CC-03 depend on it

2. **Monitor for evidence, not claims**
   - Story is NOT complete without:
     - `pnpm tsc --noEmit` output (0 errors)
     - grep verification outputs
     - Screenshot/log evidence for CC-04

3. **Coordinate CC-02 and CC-03 in parallel after CC-01**
   - Both depend only on CC-01
   - Can run simultaneously

4. **CC-04 is final validation gate**
   - Assign to real-world-validator
   - Requires all 4 scenarios to pass
   - Evidence package is mandatory

### For dev-ext

1. **Read the epic document first**
   - File: `_bmad-output/planning-artifacts/epics/EPIC-ARCH-04-CC-correct-course-remediation-2026-01-25.md`
   - Contains exact code changes with line numbers

2. **Execute CC-01 exactly as specified**
   - DO NOT deviate from the specifications
   - If something doesn't work, report back - don't improvise

3. **Run verification commands and save output**
   ```bash
   pnpm tsc --noEmit 2>&1 | tee /tmp/cc-01-tsc-output.txt
   grep -n "handlePersistenceService" src/infrastructure/context/project-context.tsx
   grep -n "initialHandle" src/infrastructure/context/project-context.tsx
   grep -n "handle:" src/infrastructure/context/project-context.tsx
   ```

4. **Create dev report with evidence**
   - Location: `_bmad-output/handoffs/2026-01-25/CC-01-DEV-REPORT-2026-01-25.md`
   - Include all verification outputs

### For real-world-validator (CC-04)

1. **Tool Constraints**
   ```markdown
   - write: true (reports only)
   - edit: false - DO NOT modify code
   - bash: true (browser automation, dev server)
   - task: false
   ```

2. **Execute all 4 scenarios**
   - Scenario 1: New FSA Project Creation
   - Scenario 2: FSA Project Reload (Silent Restore)
   - Scenario 3: FSA Project Load (Permission Required)
   - Scenario 4: IndexedDB Project (Control)

3. **Capture evidence**
   - Screenshots or detailed descriptions
   - Console log outputs
   - TypeScript/build verification

4. **Create evidence package**
   - Location: `_bmad-output/handoffs/2026-01-25/EPIC-ARCH-04-CC-EVIDENCE-2026-01-25.md`

---

## Files to Modify (Complete List)

| Story | File | Action |
|-------|------|--------|
| CC-01 | `src/infrastructure/context/project-context.tsx` | MODIFY (major) |
| CC-02 | `src/infrastructure/context/project-context.tsx` | MODIFY (minor) |
| CC-03 | `src/routes/$projectId.tsx` | MODIFY (minor) |
| CC-04 | (none - validation only) | READ ONLY |

---

## Key Services to Use (Reference)

### HandlePersistenceService

```typescript
// Location: src/infrastructure/filesystem/handle-persistence.ts
import { handlePersistenceService } from '@/infrastructure/filesystem/handle-persistence';

// Methods:
handlePersistenceService.persistHandle(projectId, handle, 'ide');
handlePersistenceService.restoreHandle(projectId);
```

### HandleRestoreResult Type

```typescript
interface HandleRestoreResult {
  success: boolean;
  handle: FileSystemDirectoryHandle | null;
  error?: string;
  requiresUserInteraction: boolean;
}
```

---

## Completion Criteria

### Epic is COMPLETE when:

- [ ] CC-01: All 5 ACs passed with evidence
- [ ] CC-02: All 4 ACs passed with evidence
- [ ] CC-03: All 4 ACs passed with evidence
- [ ] CC-04: All 8 ACs passed with evidence package
- [ ] TypeScript: 0 errors (verified, not timed out)
- [ ] Build: SUCCESS
- [ ] Evidence package created at `_bmad-output/handoffs/2026-01-25/EPIC-ARCH-04-CC-EVIDENCE-2026-01-25.md`

### Then:

1. Update AGENTS.md:
   - Health: 50% → 85%
   - Remove P0 BLOCKER section
   
2. Update workflow status:
   - EPIC-ARCH-04-CC: COMPLETE
   
3. Unblock Phase 1A planning

---

## Escalation Path

If any story is blocked for >30 minutes:

1. **Document the blocker** in dev report
2. **DO NOT attempt workarounds** without approval
3. **Report to sprint-manager**
4. **Sprint-manager escalates to bmad-master/architect**

---

## Handoff Signature

```yaml
handoff_id: "sprint_handoff_arch_04_cc_20260125"
from: "bmad-master"
to: ["sprint-manager", "dev-ext", "real-world-validator"]
created_at: "2026-01-25T23:00:00+07:00"
priority: "P0"
estimated_hours: 4-6
stories: 4
evidence_required: true
blocking_phases: ["1A", "1B", "2", "3"]
```

---

## Quick Start Checklist

- [ ] Sprint-manager: Acknowledge handoff
- [ ] Sprint-manager: Assign CC-01 to dev-ext
- [ ] Dev-ext: Read epic document
- [ ] Dev-ext: Execute CC-01 with evidence
- [ ] Dev-ext: Execute CC-02 and CC-03 (after CC-01)
- [ ] Real-world-validator: Execute CC-04 with evidence package
- [ ] Sprint-manager: Verify all evidence
- [ ] Sprint-manager: Declare epic COMPLETE
- [ ] Update AGENTS.md and workflow status

**BEGIN EXECUTION IMMEDIATELY.**
