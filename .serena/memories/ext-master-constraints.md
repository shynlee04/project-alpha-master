# EXCALIBUR - Tool Constraints Reference
# Created: 2026-01-18
# Purpose: Template for tool permission delegation patterns

## Tool Permission Matrix (MEMORIZE THIS)

| Agent Type | write | edit | bash | task | Notes |
|-----------|--------|-------|-------|-------|--------|
| **real-world-validator** | true | false | true (limited) | true | Tests ONLY (bash: browser automation + restart if stuck), writes reports (write), NEVER modifies code (edit: NO) |
| **dev-ext** | true | true | true (limited) | true | Implementation, but NEVER without context and review |
| **architect-ext** | false | true (design only) | false | true | Architecture docs, NOT code implementation |
| **analyst-ext** | false | false | false | true | Research and analysis ONLY |
| **tea-ext** | false | false | false | true | Test specifications, NOT implementation |
| **ux-designer-ext** | false | false | false | true | UI/UX design, NOT coding |
| **bmad-sprint-manager** | true | true | true (limited) | true | Sprint coordination, story execution, tracking |
| **component-splitter** | true | true | false | true | Refactoring ONLY, no new features |
| **store-refactorer** | true | true | false | true | Store refactoring ONLY, no new features |

**CRITICAL**: Always set tool constraints when delegating! See templates below.

---

## Delegation Templates

### For dev-ext (Implementation)
```markdown
## Tool Constraints

**CRITICAL**: This agent has LIMITED permissions:
- write: true - Can create files (components, tests, utilities)
- edit: true - Can modify code files (implementation only)
- bash: true (limited) - Can run pnpm commands for build/test ONLY
- task: true - Can delegate further if approved

**Role Boundaries**:
- [IMPLEMENTATION] - Write code based on story context
- [WHAT NOT TO DO] - Don't modify governance docs, don't skip tests

**Required Output**:
- Report location: _bmad-output/sprint-artifacts/stories/{story-id}-report.md
- Success criteria: All AC verified, 0 TypeScript errors, tests passing
- Timebox: Story-specific (see story template)
```

### For real-world-validator (Testing)
```markdown
## Tool Constraints

**CRITICAL**: This agent has LIMITED permissions:
- write: true - Can write test reports
- edit: false - NEVER modifies code files
- bash: true (limited) - Can run browser automation, restart if stuck
- task: true - Can delegate further if approved

**Role Boundaries**:
- [TESTING] - Run browser automation tests, validate real-world behavior
- [WHAT NOT TO DO] - Don't fix bugs, only report them with evidence

**Required Output**:
- Report location: _bmad-output/sprint-artifacts/stories/{story-id}-test-report.md
- Success criteria: All acceptance criteria validated in browser
- Timebox: 60 minutes per test session
```

### For bmad-sprint-manager (Sprint Coordination)
```markdown
## Tool Constraints

**CRITICAL**: This agent has LIMITED permissions:
- write: true - Can create story reports, sprint reports
- edit: true - Can update sprint status files, LOOP_STATE.yaml
- bash: true (limited) - Can run pnpm tsc, pnpm vitest for validation ONLY
- task: true - Can delegate to dev-ext, real-world-validator, etc.

**Role Boundaries**:
- [COORDINATION] - Execute stories, track progress, maintain sprint state
- [WHAT NOT TO DO] - Don't modify production code directly, delegate to dev-ext

**Required Output**:
- Report location: _bmad-output/sprint-artifacts/sprint-completion-report-{sprint-id}.md
- Success criteria: All stories complete, all AC met, all tests passing
- Timebox: Epic-specific (see epic template)
```

---

## CC-DESKTOP-FSA EPIC - TEAM_B EXECUTION
**Status**: ACTIVE - STARTING NOW
**Context**: CC-STORAGE-GATEWAY complete, FSA migration ready

### Stories to Execute (Total: 6, Effort: 22 hours)

1. **CC-DF-01**: Note File Format Migration (4h)
   - Create note-formatter.ts (Markdown + YAML frontmatter)
   - Create note-exporter.ts (DexieDB → FSA export)

2. **CC-DF-02**: DexieDB → FSA Sync Layer (6h)
   - Create note-sync-layer.ts
   - Create file-watcher.ts (FileSystemObserver + polling)
   - Create cache-sync.ts (bidirectional sync)

3. **CC-DF-03**: Agent Tool Integration (4h)
   - Create note-commands.ts (agent tools for FSA notes)
   - Update file-commands.ts

4. **CC-DF-04**: User Experience Updates (3h)
   - Create StorageIndicator.tsx (8-bit design)
   - Create useStorageMode.ts hook
   - Update NoteHeader.tsx

5. **CC-DF-05**: Migration Verification Tests (3h)
   - Create fsa-migration.test.ts
   - E2E tests for create/edit/delete workflows

6. **CC-DF-06**: Rollback Procedure (2h)
   - Create rollback-procedure.md
   - Document rollback steps

### Critical Dependencies (Now Unblocked ✅)
- ✅ StorageGateway abstraction working (CC-SG-01)
- ✅ Platform routing verified (CC-SG-02)
- ✅ Migration path documented (CC-SG-03)

### Success Criteria
- Desktop notes in /project/notes/*.md (FSA)
- DexieDB only contains cache data
- Agent tools can read/write notes via file system
- Storage mode indicator visible in UI
- 0 TypeScript errors
- All tests passing
