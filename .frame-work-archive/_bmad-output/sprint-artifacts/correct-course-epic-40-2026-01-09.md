---
artifact_id: "CC-40-01"
artifact_type: "correct_course_output"
parent_id: "EPIC-40"
sequence_number: 1
created_at: "2026-01-09T23:50:00+07:00"
expires_at: "2026-04-09T23:50:00+07:00"
status: "APPROVED"
team: "A+B"
workflow: "/bmad-bmm-workflows-correct-course"
governance:
  constitution: "_bmad/modules/governance/CONSTITUTION.md"
  version: "1.0.0"
  acknowledged_at: "2026-01-09"
  acknowledged_by: "@bmad-core-bmad-master"
---

# Correct Course Output: EPIC-40 Multimodal Chat Unification

**Document ID**: CC-40-01
**Generated**: 2026-01-09T23:50:00+07:00
**Workflow**: `/bmad-bmm-workflows-correct-course`
**Status**: APPROVED - Routed to Sprint Planning

---

## 1. Executive Summary

This document formalizes the course correction merging **Team A** and **Team B** sprint planning proposals into a unified **EPIC-40: Multimodal Chat Unification**.

### Key Decisions Made
1. **Merged 8-story (Team A) + 12-story (Team B) proposals** into consolidated 12-story epic
2. **Created ADR-030 (Multimodal Integration)** and **ADR-031 (Chat Unification)**
3. **Established 4-track parallel execution** strategy for dual-team development
4. **Configured governance-compliant Ralph Loops** for both platforms
5. **Updated sprint-status.yaml** with full EPIC-40 tracking

---

## 2. Team Analysis Matrix

### Team A Summary
| Dimension | Value |
|-----------|-------|
| **Platform** | Claude Code |
| **Story Count** | 8 |
| **Focus Areas** | Voice I/O Tools, Note Blocks |
| **Strengths** | Technical depth, code examples |
| **Weaknesses** | No epic structure, no architecture docs |
| **Research Artifacts** | 3 files (~1,800 lines) |

### Team B Summary
| Dimension | Value |
|-----------|-------|
| **Platform** | OpenCode |
| **Story Count** | 12 |
| **Focus Areas** | Chat Unification, UX Fixes, RAG |
| **Strengths** | Epic definition, parallel tracks, ADR updates |
| **Weaknesses** | Less technical detail in stories |
| **Research Artifacts** | 6 files (~5,000 lines) |

### Comparison Verdict
| Dimension | Winner | Margin |
|-----------|--------|--------|
| Epic Structure | Team B | Strong |
| Dependency Mapping | Team B | Strong |
| Technical Detail | Team A | Moderate |
| Parallelism Strategy | Team B | Strong |
| UX/UI Priority | Team B | Critical |
| BMAD Compliance | Tie | - |

**Final Decision**: Team B's proposal as base, enriched with Team A's technical details.

---

## 3. Artifacts Created

### ADR Documents
| ADR | Title | Path |
|-----|-------|------|
| ADR-030 | Multimodal Integration Architecture | `_bmad-output/planning-artifacts/architecture/adr-030-multimodal-integration.md` |
| ADR-031 | Chat System Unification | `_bmad-output/planning-artifacts/architecture/adr-031-chat-system-unification.md` |

### Epic Definition
| Document | Path |
|----------|------|
| EPIC-40 Definition | `_bmad-output/planning-artifacts/epics/epic-40-multimodal-chat-unification.md` |

### Team Ralph Loops
| Team | Platform | Path |
|------|----------|------|
| Team A | Claude Code | `.claude/ralph-loop.local.md` |
| Team B | OpenCode | `.opencode/ralph-loop.local.md` |

### Sprint Status
| Document | Path |
|----------|------|
| Sprint Status | `_bmad-output/sprint-artifacts/sprint-status.yaml` (updated with epic_40_status section) |

---

## 4. EPIC-40 Story Breakdown

### Track A: Chat Unification (Team A - Claude Code)
| ID | Title | Effort | Priority |
|----|-------|--------|----------|
| MM-01 | Create unified chat store | 4h | P0 |
| MM-02 | Merge thread management | 3h | P0 |
| MM-03 | Unify tool execution | 5h | P0 |

### Track B: Multimodal Integration (Team B - OpenCode)
| ID | Title | Effort | Priority | Depends On |
|----|-------|--------|----------|------------|
| MM-04 | Integrate Gemini 2.5 APIs | 6h | P0 | MM-01 |
| MM-05 | Voice input tool (Whisper) | 4h | P0 | MM-04 |
| MM-06 | Voice output tool (TTS) | 4h | P0 | MM-04 |
| MM-07 | Voice input hook | 3h | P1 | MM-05 |
| MM-08 | Voice output hook | 3h | P1 | MM-06 |

### Track C: RAG Enhancements (Team A - Claude Code)
| ID | Title | Effort | Priority |
|----|-------|--------|----------|
| MM-09 | Context window manager | 4h | P0 |
| MM-10 | Code-aware chunking | 3h | P1 |
| NC-01 | Note code block renderer | 3h | P1 |

### Track D: UX & Notes (Team B - OpenCode)
| ID | Title | Effort | Priority |
|----|-------|--------|----------|
| MM-11 | Fix z-index/flexbox issues | 5h | P0 ⚠️ |
| MM-12 | Note embed block renderer | 3h | P2 |
| NC-02 | Note image block renderer | 2h | P1 |

---

## 5. Parallel Execution Strategy

```
Week 1 (Day 1-5)
================

TEAM A (Claude Code)                    TEAM B (OpenCode)
═══════════════════                     ═══════════════════
Track A: Chat Unification               Track D: UX & Notes
Day 1-2: MM-01 (4h)                    Day 1: MM-11 (5h) ⚠️ P0
Day 2-3: MM-02 (3h)                    Day 2: NC-02 (2h)
Day 3-4: MM-03 (5h)                    Day 2-3: MM-12 (3h)
         │
         └─ SYNC POINT ──────────────────────────────┐
                                                      │
Track C: RAG (After Track A)            Track B: Multimodal (After MM-01)
Day 4-5: MM-09 (4h)                    Day 3-4: MM-04 (6h)
Day 5:   NC-01 (3h)                    Day 4-5: MM-05, MM-06 (8h)
                                       Day 5:   MM-07, MM-08 (6h)
```

---

## 6. Governance Compliance

### Story Cycle Requirement
All stories MUST follow `_bmad/workflows/story-cycle/`:

1. `01-create-story.md` - Generate story file
2. `02-validate-story.md` - Validate against acceptance criteria
3. `03-create-context.md` - Create implementation context
4. `04-validate-context.md` - Validate technical context
5. `05-pre-planning.md` - Pre-planning checklist
6. `06-dev-story.md` - Development execution
7. `07-code-review.md` - Code review (adversarial)
8. `08-story-done.md` - Story completion
9. `09-retrospective.md` - Per-story retrospective

### Constitution Compliance
| Article | Requirement | Status |
|---------|-------------|--------|
| Article I | 4-Tier Artifact Governance | ✅ Tier 2 SSOT used |
| Article II | Naming Convention | ✅ `{PREFIX}-{DOMAIN}-{SEQ}` |
| Article III | Stale Artifact Protocol | ✅ 24h freshness check |
| Article IV | Multi-Team Coordination | ✅ Team A/B sync points |
| Article V | Module Governance | ✅ Read-only templates |
| Article VI | Agent Acknowledgment | ✅ Frontmatter included |
| Article VII | Ralph Loop Coordination | ✅ Both loops configured |

---

## 7. Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Gemini 2.5 API changes | Medium | High | Version pin adapters, fallback to 1.5 |
| Chat migration data loss | Low | Critical | Migration tests, backup before 38-04 |
| Context window overflow | Medium | Medium | MM-09 before MM-04 |
| Voice permission denied | Medium | Low | Graceful fallback to text input |
| Team sync failure | Low | Medium | Daily standups, shared sprint-status.yaml |

---

## 8. Sprint Planning Handoff

### Immediate Actions

1. **Team A (Claude Code)**:
   - Start MM-01 (Create Unified Chat Store)
   - Follow `.claude/ralph-loop.local.md`
   - Execute story-cycle steps 01-09

2. **Team B (OpenCode)**:
   - Start MM-11 (Fix Z-Index Issues) ⚠️ P0 BLOCKER
   - Follow `.opencode/ralph-loop.local.md`
   - Wait for MM-01 complete before MM-04

### Story File Generation
Run `/bmad-bmm-workflows-create-story` for each story:
- `_bmad-output/stories/EPIC-40/MM-01-story-context.md`
- `_bmad-output/stories/EPIC-40/MM-02-story-context.md`
- ... (repeat for all 12 stories)

### Sprint Planning Workflow
Route to: `/bmad-bmm-workflows-sprint-planning`

With inputs:
- Epic file: `_bmad-output/planning-artifacts/epics/epic-40-multimodal-chat-unification.md`
- ADR-030: `_bmad-output/planning-artifacts/architecture/adr-030-multimodal-integration.md`
- ADR-031: `_bmad-output/planning-artifacts/architecture/adr-031-chat-system-unification.md`

---

## 9. Success Criteria Checklist

- [ ] Single unified chat interface (no dual systems)
- [ ] Voice input/output functional in all workspaces
- [ ] Gemini 2.5 Flash/Pro integrated with full modalities
- [ ] Context window manager prevents token overflow
- [ ] All z-index/flexbox UX issues resolved
- [ ] Note blocks render code, images, and embeds
- [ ] Zero TypeScript errors in modified files
- [ ] E2E tests passing for critical multimodal flows
- [ ] AGENTS.md updated with EPIC-40 learnings
- [ ] Retrospective completed for each track

---

## 10. Document Provenance

| Field | Value |
|-------|-------|
| Generated By | @bmad-core-bmad-master |
| Workflow | `/bmad-bmm-workflows-correct-course` |
| Input: Team A | `_bmad-output/research/2026-01-09/multimodality-chat-architecture/` |
| Input: Team B | `_bmad-output/sprint-artifacts/sprint-change-proposal-multimodal-chat-fix-2026-01-09.md` |
| Output Location | `_bmad-output/sprint-artifacts/correct-course-epic-40-2026-01-09.md` |
| Status | APPROVED |
| Approver | Admin |
| Approved At | 2026-01-09T23:50:00+07:00 |

---

**END OF CORRECT COURSE OUTPUT**

*Next Step*: User approves, then route to `/bmad-bmm-workflows-sprint-planning` for story file generation.
