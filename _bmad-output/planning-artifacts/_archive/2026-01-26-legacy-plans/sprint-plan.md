# Sprint Plan - Via-Gent (Project Alpha v2.0)

**Version**: 1.0.0
**Generated**: 2026-01-08T06:30:00+07:00
**Status**: READY FOR IMPLEMENTATION
**Development Cycle**: v2.0 (Strictly Regulated)

---

## Executive Summary

This sprint plan implements **9 epics with 76 active stories** (deferred stories excluded) over **~180 hours** of work using the **improved development cycle v2.0**.

**Critical Improvement**: All stories must follow `.agent/workflows/story-dev-cycle-v2.md` with:
- 14-stage regulated workflow
- Pre-entry validation for each stage
- Context freshness checks (24h TTL)
- Research mandate enforcement (min 2-3 MCP calls)
- Full traceability chains

---

## Sprint Structure

### Phase 1: Foundation (P0 - Critical Path)
**Duration**: 5-7 days (depending on team size)
**Goal**: Clean Architecture + Critical Fixes

| Epic | Stories | Effort | Priority | Team |
|------|---------|--------|----------|------|
| EPIC-38: Clean Architecture | 18 | ~33h | P0 | Team B (Architecture) |
| EPIC-30: P0 Fixes | 6 | ~8h | P0 | Team A (Frontend) |

**Dependencies**: None (foundation epics)
**Risk**: HIGH (Import direction fixes may break 32 files)
**Mitigation**: Incremental refactoring, test each file

### Phase 2: AI Service + Core Features (P1)
**Duration**: 5-7 days
**Goal**: Unified AI Service + Workspace foundations

| Epic | Stories | Effort | Priority | Team |
|------|---------|--------|----------|------|
| EPIC-31: AI Service Unification | 8 | ~12h | P1 | Team B (Backend) |
| EPIC-32: Notes Workspace | 10 | ~16h | P1 | Team A (Frontend) |
| EPIC-33: IDE Workspace | 8 | ~14h | P1 | Team A (Frontend) |

**Dependencies**: EPIC-38 (Clean Architecture), EPIC-30 (Critical Fixes)
**Risk**: MEDIUM (Notes AI migration is heavily used)
**Mitigation**: Feature flags for rollback

### Phase 3: Polish + UX (P1-P2)
**Duration**: 4-5 days
**Goal**: State consolidation + Responsive design

| Epic | Stories | Effort | Priority | Team |
|------|---------|--------|----------|------|
| EPIC-34: State Management | 8 | ~14h | P1 | Team B (Backend) |
| EPIC-35: Cross-Workspace CRUD | 6 | ~10h | P2 | Team A (Frontend) |
| EPIC-36: Responsive UX | 8 | ~12h | P2 | Team A (Frontend) |

**Dependencies**: EPIC-38, EPIC-32, EPIC-33
**Risk**: HIGH (Splitting unified-workspace-context is risky)
**Mitigation**: Facade exports, backward compatibility

### Phase 4: Internationalization (P2)
**Duration**: 2-3 days
**Goal**: Vietnamese market readiness

| Epic | Stories | Effort | Priority | Team |
|------|---------|--------|----------|------|
| EPIC-37: i18n | 9 | ~15h | P2 | Team A (Frontend) |

**Dependencies**: None (can run in parallel with Phase 3)
**Risk**: MEDIUM (Vietnamese translation quality)
**Mitigation**: Professional translation, community review

---

## Timeline Summary

| Phase | Duration | Stories | Effort | Team Assignment |
|-------|----------|---------|--------|-----------------|
| Phase 1 | 5-7 days | 24 | ~41h | Team A + Team B |
| Phase 2 | 5-7 days | 26 | ~42h | Team A + Team B |
| Phase 3 | 4-5 days | 22 | ~36h | Team A + Team B |
| Phase 4 | 2-3 days | 9 | ~15h | Team A |
| **Total** | **16-22 days** | **81** | **~134h** | **2 teams (3-4 weeks)** |

---

## Development Cycle v2.0 Integration

### All Stories Must Follow

```yaml
workflow: .agent/workflows/story-dev-cycle-v2.md
stages: 14
validation_loops: true
context_freshness_ttl: 24h
research_mandate:
  story_creation: 2 MCP calls
  context_creation: 3 MCP calls
traceability: full_bidirectional
```

### Stage Gate Summary

| Stage | Validation | On Fail |
|-------|------------|---------|
| 1. Create Story | 100% metadata complete | Loop |
| 2. Create Context | Freshness + completeness | Regenerate |
| 3. Develop | TDD + coverage ≥80% | Refactor |
| 4. Code Review | All ACs + tests | Loop |
| 5. Story Done | Traceability intact | Fix |
| 6. Update Status | YAML valid | Fix |
| 7. Validate Phase | All gates pass | Loop |
| 8. Regulate | Governance compliant | Fix |
| 9. Audit | No issues found | Fix |
| 10. Correct-Course | No critical issues | Pause |
| 11. All Stories | Epic complete | Continue |
| 12. Retrospective | Documented | Archive |
| 13. Handoff | Accepted | Next epic |
| 14. Archive | TTL cleanup | Complete |

---

## Story File Standards

### Required Metadata

```yaml
---
story_id: "XX-YY"
story_title: "Title"
epic_id: "EPIC-XX"
priority: "P0 | P1 | P2"
effort_hours: N
status: "draft | in_progress | review | done"
created_at: "YYYY-MM-DDTHH:mm:ss+07:00"
updated_at: "YYYY-MM-DDTHH:mm:ss+07:00"
assigned_to: "@agent-slug"
dependencies: ["XX-YY-01"]
research_artifacts:
  - source: "context7"
    query: "..."
    findings: N
---

# [STORY_ID] - [STORY_TITLE]

## Acceptance Criteria
1. [ ] AC 1 - Description
2. [ ] AC 2 - Description

## Dependencies
- Story: XX-YY-01
- Code: src/path/to/file.ts
- Doc: architecture.md Section N

## Traceability
| PRD Req | AC | Test | Code | Review |
|---------|----|----|----|----|
| REQ-001 | AC1 | test.spec.ts | file.ts:line | Reviewer |

## Research Findings
### Source 1: context7
**Finding**: ...
**Impact**: ...

## Validation Checklist
### Pre-Development
- [ ] Research completed (min 2 MCP calls)
- [ ] Architecture pattern documented
### Post-Development
- [ ] All ACs met
- [ ] Tests passing (≥80%)
- [ ] Code reviewed
```

---

## Known Story Overlap (RESOLVED)

### Issue: EPIC-34 Story 34-01 and EPIC-38 Story 38-15

**Both stories address**: `unified-workspace-context` split

**Resolution**:
1. **Execute EPIC-38 first**: Stories 38-15, 38-16, 38-17 extract workspace-context, file-system-context, and create UnifiedWorkspaceProvider
2. **Skip 34-01**: When EPIC-34 begins, Story 34-01 is already complete (via 38-15/16/17)
3. **Update dependencies**: Mark 34-01 as "COMPLETED via 38-15" in sprint tracking

**Implementation**:
```yaml
story_overlap_resolution:
  epic_38_story_38_15:
    action: "execute_first"
    output: "workspace-context.ts, file-system-context.tsx, UnifiedWorkspaceProvider"
  epic_34_story_34_01:
    action: "mark_completed_via_38_15"
    reference: "See EPIC-38 stories 38-15, 38-16, 38-17"
    effort_saved: "3 hours"
```

---

## Quality Gates (v2.0 Enhanced)

### Pre-Sprint Validation

- [x] All epics defined with acceptance criteria
- [x] Dependencies mapped (cross-epic graph)
- [x] Risk assessment complete
- [x] Team assignments clear
- [x] Development cycle v2.0 documented
- [x] Story file template created
- [x] Story overlap resolution documented

### Per-Story Validation

- [ ] Story file created with all required metadata
- [ ] Research artifacts section populated (min 2 MCP calls)
- [ ] Acceptance criteria numbered and testable
- [ ] Dependencies listed (story, code, doc)
- [ ] Traceability matrix populated
- [ ] Validation checklist complete

### Per-Epic Validation

- [ ] All stories in epic have files created
- [ ] Story dependencies sequenced correctly
- [ ] Cross-epic dependencies identified
- [ ] Risk mitigation plans in place

### Sprint Completion Validation

- [ ] All epics in phase complete
- [ ] TypeScript errors zero (production code)
- [ ] Build passes with zero warnings
- [ ] Tests pass (≥80% coverage)
- [ ] God files <300 lines verified
- [ ] Clean Architecture compliance verified
- [ ] Error boundary coverage tracked
- [ ] Retrospective documented

---

## Risk Mitigation Strategies

### EPIC-38: Clean Architecture (HIGH RISK)

**Risk**: Import direction fixes may break 32 files

**Mitigation**:
```yaml
mitigation_epic_38:
  strategy: "incremental_refactoring"
  approach:
    - "Fix imports in batches of 5 files"
    - "Run TypeScript check after each batch"
    - "Test affected workspaces after each batch"
    - "Keep rollback plan (git revert) ready"
  testing:
    - "Unit tests for each refactored file"
    - "Integration tests for import chains"
    - "Manual testing of workspace routes"
```

### EPIC-34: State Management (HIGH RISK)

**Risk**: Splitting unified-workspace-context (heavily used)

**Mitigation**:
```yaml
mitigation_epic_34:
  strategy: "facade_pattern"
  approach:
    - "Create new slice files first"
    - "Keep original as facade initially"
    - "Update consumers incrementally"
    - "Remove facade only after 100% migration"
  testing:
    - "Test all 4 workspaces after split"
    - "Verify state persistence intact"
    - "Check for circular dependencies"
```

---

## Team Coordination

### Team A (Frontend Focus)
**Responsibilities**: UI components, workspace features, responsive design
**Epics**: EPIC-30, EPIC-32, EPIC-33, EPIC-35, EPIC-36, EPIC-37

### Team B (Backend/Architecture Focus)
**Responsibilities**: State management, AI service, architecture compliance
**Epics**: EPIC-38, EPIC-31, EPIC-34

### Handoff Protocol
```yaml
handoff_protocol:
  daily_standup:
    time: "09:00 +07:00"
    duration: "15 minutes"
    format: "What I did, What I'll do, Blockers"
  cross_team_communication:
    tool: "slack/discord"
    channel: "#development"
    response_time: "<2 hours"
  story_handoff:
    from_to: "Team A → Team B or vice versa"
    artifact: "story file with dev completion signoff"
    acceptance: "receiving team reviews story file before starting"
```

---

## Success Metrics

### Velocity Tracking
- **Planned Velocity**: ~134 hours over 3-4 weeks
- **Target Velocity**: 40-50 hours per week per team
- **Burn Rate**: Track story completion rate

### Quality Metrics
- **TypeScript Errors**: 0 (production code)
- **Test Coverage**: ≥80%
- **God Files**: 0 (all files <300 lines)
- **Clean Architecture**: 100% compliance
- **Error Boundary Coverage**: ≥80%

### Completion Criteria
- [ ] All 76 active stories complete
- [ ] All validation gates passed
- [ ] Retrospective documented
- [ ] Next phase ready

---

## Output Artifacts

### Created During Sprint Planning
1. `_bmad-output/planning-artifacts/sprint-plan.md` (this file)
2. `_bmad-output/sprint-artifacts/stories/` (individual story files, 81 files)
3. `_bmad-output/handoffs/dev-implementation-handoff-2026-01-08.md`

### Updated During Sprint
4. `_bmad-output/sprint-artifacts/sprint-status.yaml` (progress tracking)

### Created During Sprint
5. `_bmad-output/retrospectives/phase-{N}-retrospective.md`
6. `_bmad-output/handoffs/phase-{N+1}-handoff.md`

---

## Next Actions

1. ✅ Sprint plan created (this file)
2. ⏳ Generate individual story files (81 files)
3. ⏳ Create dev implementation handoff
4. ⏳ Update sprint-status.yaml
5. ⏳ Begin Phase 1: Foundation (EPIC-38 + EPIC-30)

---

**Status**: READY FOR STORY FILE GENERATION
**Maintainer**: @bmad-core-bmad-master
**Next**: Generate 81 story files using v2.0 template
**Review Date**: 2026-01-08
