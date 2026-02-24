# Legacy PRD Analysis Report

**Date**: 2026-01-28 12:02:52
**Source**: `_bmad-output/planning-artifacts/prd.md`
**Purpose**: Determine what to keep, update, or remove for PRD regeneration
**Analyst**: analyst-ext
**Timebox**: 20 minutes

---

## Executive Summary

The current PRD (v2.1.0, 1678 lines) is **substantially aligned** with `new-fundamental-truths.md` v2.0.0 but contains several issues:

1. **Strength**: Comprehensive 3-phase development approach, detailed user journeys, well-structured functional requirements
2. **Critical Gap**: Contains aspirational claims marked as implemented that contradict codebase reality
3. **Conflict**: Route claims (2 routes only) directly contradict diagnostic findings (14+ routes exist)
4. **Outdated**: LLM model versions inconsistent (GPT-5.1 vs GPT-5.2)
5. **Missing**: No `/hub` route specification, no RAG pipeline details, no conflict resolution mechanisms

**Recommendation**: MAJOR UPDATE needed - preserve structure, update claims to reflect reality, add missing sections, reconcile with codebase diagnostic findings.

---

## 1. PRD Structure Analysis

### Current Sections (14 major sections)

| Section | Line Range | Lines | Description |
|---------|------------|-------|-------------|
| Frontmatter | 1-9 | 9 | YAML metadata (version, status, agent) |
| Document Control | 11-26 | 16 | Version, dates, references |
| Executive Summary | 28-66 | 39 | Product overview, current state, targets |
| Problem Statement | 68-165 | 98 | Problems and Via-Gent solution |
| Target Users | 167-210 | 44 | Primary customers and personas |
| 3-Phase Development Approach | 212-356 | 145 | Phase structure with entry criteria |
| User Stories & Journeys | 358-727 | 370 | 7 detailed user journeys by phase |
| Functional Requirements | 729-1131 | 403 | Phase-by-phase requirements |
| Advanced Patterns (Phase 3) | 1132-1365 | 234 | Cross-plugin, multi-agent, RAG |
| Technical Architecture | 1367-1443 | 77 | Stack, state management, compliance |
| Non-Functional Requirements | 1445-1482 | 38 | Performance, security |
| Success Metrics | 1484-1534 | 51 | OKRs by phase |
| Dependencies & Risks | 1536-1573 | 38 | Technical and external dependencies |
| Document Control (History) | 1575-1609 | 35 | Version history |
| Appendix: ADR References | 1611-1678 | 68 | ADR structure, 3-phase summary |

**Total**: 1678 lines

### Template Compliance

The BMAD PRD template (`_bmad/bmm/workflows/2-plan-workflows/prd/templates/prd-template.md`) is minimal (11 lines with only frontmatter). The current PRD **far exceeds** template requirements and follows a mature enterprise PRD format with:

- ✅ YAML frontmatter with version, status, agent tracking
- ✅ Document control section with references
- ✅ Executive summary with current vs target state
- ✅ Problem statement with market positioning
- ✅ User personas with pain points
- ✅ Phased development approach
- ✅ Detailed user journeys
- ✅ Functional requirements by phase
- ✅ Technical architecture section
- ✅ Non-functional requirements
- ✅ Success metrics (OKRs)
- ✅ Dependencies and risks
- ✅ Version history

### Document Health

| Aspect | Status | Notes |
|--------|--------|-------|
| **Frontmatter** | ✅ Valid | Version 2.1.0, status ACTIVE |
| **Versioning** | ✅ Good | Version history from 1.0.0 → 2.1.0 |
| **References** | ⚠️ Partial | References ADR-039 (PROPOSED, not APPROVED) |
| **Cross-links** | ✅ Good | 30+ `📋 Reference:` links to vision doc |
| **Timestamps** | ⚠️ Stale | Updated 2026-01-26, now 2 days old |
| **Status Markers** | ✅ Good | Uses ✅/⚠️/❌ consistently |
| **Code Examples** | ✅ Comprehensive | TypeScript interfaces, patterns |

---

## 2. Section-by-Section Validity

### 2.1 Frontmatter (Lines 1-9)

**Status**: UPDATE
**Alignment with Vision**: ✅
**Alignment with Code**: ⚠️
**Reason**: Version 2.1.0 claims ACTIVE status, but ADR-039 is still PROPOSED (not APPROVED per AGENTS.md). Should reflect current governance state.
**Action Items**:
- Update to v2.2.0 with today's date
- Note ADR-039 is now APPROVED per AGENTS.md

---

### 2.2 Executive Summary (Lines 28-66)

**Status**: UPDATE
**Alignment with Vision**: ✅
**Alignment with Code**: ⚠️
**Reason**: 
- Claims "Current State (2026-01-26)" but codebase diagnostic is from 2026-01-28 with newer findings
- "P0 Blockers: 3 P0 bugs partially resolved" - needs current status
- "80-90% Complete - 8-12 weeks" timeline needs validation

**Action Items**:
- Update current state to reflect 2026-01-28 diagnostic
- Update P0 blocker status
- Revise timeline based on EPIC-UXUI-03 completion

---

### 2.3 Problem Statement (Lines 68-165)

**Status**: KEEP
**Alignment with Vision**: ✅
**Alignment with Code**: ✅
**Reason**: Problem framing is evergreen - development setup friction, cloud IDE tradeoffs, and Via-Gent solution positioning remain valid. Well-written with comparative analysis.
**Action Items**: None - this section is solid.

---

### 2.4 Target Users (Lines 167-210)

**Status**: KEEP
**Alignment with Vision**: ✅
**Alignment with Code**: ✅
**Reason**: User personas (Alex, Jordan, Taylor) are well-defined with clear pain points and v2.0.0 benefits. Evergreen content.
**Action Items**: None.

---

### 2.5 3-Phase Development Approach (Lines 212-356)

**Status**: UPDATE
**Alignment with Vision**: ✅
**Alignment with Code**: ⚠️
**Reason**: 
- Phase 1A duration "4-6 weeks" needs reality check
- EPIC-0 learnings added but Phase 1A Plugin Requirements section (Lines 244-270) has specific implementation details that may be outdated
- Entry criteria reference ADR-039 which is now APPROVED

**Action Items**:
- Update Phase 1A status to reflect EPIC-UXUI-03 completion
- Verify Plugin Requirements match current implementation
- Update ADR-039 status to APPROVED

---

### 2.6 User Stories & Journeys (Lines 358-727)

**Status**: UPDATE
**Alignment with Vision**: ✅
**Alignment with Code**: ⚠️
**Reason**:
- Journey 1 (Desktop User): Claims `/hub` route exists but codebase diagnostic shows NO `/hub` route - it's `/` (index)
- Evidence sections contain many ⚠️ "Implementation needed" markers from 2026-01-26
- "Broken Steps" lists need validation against current state

**Conflicts Identified**:

| PRD Claim | Codebase Reality | Resolution |
|-----------|------------------|------------|
| "Route navigates to `/$projectId`" | Route exists ✅ | KEEP |
| "Hub page: `src/routes/index.tsx` ✅" | Index is Hub, no `/hub` | UPDATE claim |
| "FileTree plugin: needs implementation" | Implemented per diagnostic | UPDATE to ✅ |
| "Monaco plugin: POC stub" | Still POC per diagnostic | KEEP |

**Action Items**:
- Update all Evidence sections with current status
- Validate "Broken Steps" against 2026-01-28 reality
- Clarify `/` vs `/hub` route naming

---

### 2.7 Functional Requirements (Lines 729-1131)

**Status**: UPDATE
**Alignment with Vision**: ✅
**Alignment with Code**: ⚠️
**Reason**:
- Route Structure (Lines 736-748): Claims deprecated routes redirect to `/$projectId` but diagnostic shows NO redirects implemented
- Storage Gateway Contract (Lines 956-1000): EPIC-0 learnings are valuable but need validation
- TanStack AI SDK Integration (Lines 1015-1063): Still marked as incomplete

**Conflicts Identified**:

| PRD Claim (Section) | Vision Claim | Codebase Reality | Resolution |
|---------------------|--------------|------------------|------------|
| "deprecated routes redirect" (1.1) | "All deprecated routes redirect" | 14 routes exist, no redirects | UPDATE - mark as NOT IMPLEMENTED |
| "Plugin Registry: 5 max plugins" | 5 plugins max | No limit enforced in code | UPDATE - mark as NOT IMPLEMENTED |
| "Two always-loaded plugins" | Always-loaded: filetree, chat | All plugins optional in code | UPDATE - mark as NOT IMPLEMENTED |

**Action Items**:
- Add implementation status column to all requirement tables
- Mark unimplemented features clearly
- Update Storage Gateway section with EPIC-0 fixes if validated

---

### 2.8 Advanced Patterns - Phase 3 (Lines 1132-1365)

**Status**: KEEP (with UPDATE markers)
**Alignment with Vision**: ✅
**Alignment with Code**: ❌ (aspirational)
**Reason**: This section is explicitly Phase 3 (future) content. The framing is correct - these are not yet implemented. However, the vision gaps report shows:
- Cross-plugin communication: NOT IMPLEMENTED
- Multi-agent coordination: NOT IMPLEMENTED
- RAG integration: PARTIAL (infrastructure only)

**Action Items**:
- Add clear "ASPIRATIONAL - NOT IMPLEMENTED" header to section
- Add prerequisites from Phase 1A/1B/2 that must complete first

---

### 2.9 Technical Architecture (Lines 1367-1443)

**Status**: UPDATE
**Alignment with Vision**: ✅
**Alignment with Code**: ⚠️
**Reason**:
- Architecture Compliance table (Lines 1373-1382) shows accurate status markers
- Quality Metrics table (Lines 1435-1443) shows outdated numbers:
  - "God Components: 1" - diagnostic shows 3 god stores
  - "Error Boundary Coverage: 22.2%" - needs validation
  - "TypeScript Errors: 0" - AGENTS.md confirms 0 ✅

**Conflicts Identified**:

| PRD Metric | Diagnostic Finding | Resolution |
|------------|-------------------|------------|
| "God Components: 1 (AgentConfigDialog)" | 3 god stores >500 lines | UPDATE - use diagnostic data |
| "Total Stores: 179" | 68+ stores found | VERIFY - different counting method? |
| "Test Coverage: 60-70%" | Not verified | ADD diagnostic data |

**Action Items**:
- Update Quality Metrics with 2026-01-28 diagnostic data
- Clarify store counting methodology
- Add god store file names from diagnostic

---

### 2.10 Non-Functional Requirements (Lines 1445-1482)

**Status**: KEEP
**Alignment with Vision**: ✅
**Alignment with Code**: ✅
**Reason**: Performance targets, security requirements (OWASP Top 10 for Agentic Applications) are well-defined and remain valid targets.
**Action Items**: None - good reference content.

---

### 2.11 Success Metrics (Lines 1484-1534)

**Status**: UPDATE
**Alignment with Vision**: ✅
**Alignment with Code**: ⚠️
**Reason**: OKRs are well-structured but timelines need validation. Phase 1A "4-6 weeks" claimed - what's actual status?
**Action Items**:
- Add completion percentages per Objective
- Update timelines based on actual progress
- Cross-reference with sprint-status-2026-01-28.yaml

---

### 2.12 Dependencies & Risks (Lines 1536-1573)

**Status**: KEEP
**Alignment with Vision**: ✅
**Alignment with Code**: ✅
**Reason**: External dependencies and risks are evergreen. TanStack AI, WebContainers, FSA, Monaco - all still valid concerns.
**Action Items**: None.

---

### 2.13 Document Control History (Lines 1575-1609)

**Status**: UPDATE
**Alignment with Vision**: ✅
**Alignment with Code**: N/A
**Reason**: Version history is good but needs v2.2.0 entry for this analysis and subsequent updates.
**Action Items**:
- Add v2.2.0 entry with 2026-01-28 date
- Note: "Updated with codebase diagnostic reconciliation"

---

### 2.14 Appendix: ADR References (Lines 1611-1678)

**Status**: UPDATE
**Alignment with Vision**: ✅
**Alignment with Code**: ⚠️
**Reason**: ADR-039 is listed as "PROPOSED FOR APPROVAL" but AGENTS.md shows "ADR-039 (APPROVED)". Status needs update.
**Action Items**:
- Update ADR-039 status to APPROVED
- Add date of approval

---

## 3. Conflicts with Vision

| PRD Claim | Vision Claim | Resolution |
|-----------|--------------|------------|
| "Hub page: `src/routes/index.tsx`" (Line 396) | "The application has exactly **two routes**: `/hub` and `/$projectId`" | **Needs Decision**: Index IS the hub. UPDATE PRD to clarify `/` serves as `/hub` OR create actual `/hub` route |
| "deprecated routes redirect to `/$projectId`" (Line 744) | "All deprecated routes redirect to `/$projectId`" | **Use Vision**: Mark as NOT IMPLEMENTED, add to Phase 1A backlog |
| "GPT-5.1-Codex-Max (Nov 2025)" (Line 709) | RAW section says "GPT-5.2 variants" | **Use Vision RAW**: Update to GPT-5.2 (verified by web research) |
| "No separate `/setting` route" implied | "/setting route doesn't exist" | **Use Code**: `/settings.tsx` EXISTS - contradiction with vision. Needs route consolidation decision |
| "Plugin system fully specified" (Line 51) | "Plugin system: Basic structure defined" | **Use Vision**: Mark as "defined but not enforced" |
| "Single `/$projectId` route operational" (Line 49) | "Single route" | **Partial**: Route exists but legacy routes also exist. Mark route consolidation as TODO |

---

## 4. Missing from PRD

| Required by Vision/Diagnostic | Why Missing | Priority |
|-------------------------------|-------------|----------|
| **Route Consolidation Plan** | Vision says 2 routes, code has 14. No migration plan. | HIGH |
| **`/hub` Route Specification** | Vision claims `/hub` exists, codebase has `/` (index) | HIGH |
| **Orchestrator Implementation Status** | Vision describes orchestrator, PRD marks as ❌ but no implementation path | HIGH |
| **Context Compaction Implementation** | Vision describes LLM-based compaction, only `drop_oldest` implemented | MEDIUM |
| **`@filename` Reference Parsing** | Vision describes file references in chat, not found in code | MEDIUM |
| **File Lock Mechanism** | Vision describes locks during agent ops, not implemented | MEDIUM |
| **FileSystemObserver Integration** | Vision mentions Chrome 129+ feature, no implementation | LOW |
| **RAG Pipeline Details** | Tables exist but no pipeline documentation | MEDIUM |
| **Conflict Resolution UI** | Vision describes dialogs, not implemented | LOW |
| **Light Theme Specification** | UX spec v3.0.0 has section 14, PRD doesn't reference | LOW |

---

## 5. PRD Regeneration Recommendations

### 1. Keep These Sections As-Is
- Problem Statement (Lines 68-165)
- Target Users (Lines 167-210)
- Non-Functional Requirements (Lines 1445-1482)
- Dependencies & Risks (Lines 1536-1573)

### 2. Update These Sections With
- **Executive Summary**: Current state from 2026-01-28 diagnostic
- **3-Phase Development**: Actual completion status, EPIC-UXUI-03 done
- **User Stories**: Update Evidence sections, validate Broken Steps
- **Functional Requirements**: Add "Implementation Status" column, mark NOT IMPLEMENTED clearly
- **Technical Architecture**: Use diagnostic Quality Metrics data
- **Success Metrics**: Add completion percentages
- **Document Control**: Add v2.2.0 entry, update ADR-039 to APPROVED
- **Appendix**: Update ADR-039 status

### 3. Remove These Sections
- None - all sections have value. Consider archiving RAW section from vision doc if migrated there.

### 4. Add These New Sections
- **Route Consolidation Roadmap**: How to get from 14 routes to 2
- **Implementation Status Dashboard**: Quick-reference current vs target
- **UX Specification Reference**: Cross-link to 15 sharded UX spec sections
- **EPIC Tracker**: Cross-link to active/completed EPICs
- **Codebase Diagnostic Summary**: Embed or reference diagnostic findings

---

## 6. Suggested New PRD Outline

```markdown
# Product Requirements Document: Via-Gent (Project Alpha v2.2.0)

## Document Control
- Version: 2.2.0
- Updated: 2026-01-28
- Status: ACTIVE
- ADR Reference: ADR-039 (APPROVED)

## Quick Links
- Vision: new-fundamental-truths.md v2.0.0
- UX Spec: _bmad-output/planning-artifacts/ux-specification/index.md (15 sections)
- Architecture: _bmad-output/planning-artifacts/architecture.md v3.0.0
- Sprint Status: _bmad-output/sprint-artifacts/sprint-status-2026-01-28.yaml

## Implementation Status Dashboard [NEW]
| Area | Vision Target | Current Status | Gap |
|------|---------------|----------------|-----|
| Routes | 2 (/hub, /$projectId) | 14 routes | Route consolidation needed |
| Plugins | 6 plugins | 6 implemented, agents missing | Agents plugin |
| Orchestrator | Hierarchical pattern | State orchestrator only | Agent orchestrator |
| ...

## Executive Summary [UPDATED]
- Current State (2026-01-28)
- Target State
- Alignment Status

## Problem Statement [KEEP]
## Target Users [KEEP]

## 3-Phase Development Approach [UPDATED]
- Phase 1A: Status, what's done, what remains
- Phase 1B: Status
- Phase 2: Status
- Phase 3: Aspirational

## User Stories & Journeys [UPDATED]
- Evidence sections validated
- Broken Steps verified

## Functional Requirements [UPDATED]
- Each requirement has Implementation Status column

## Route Consolidation Roadmap [NEW]
- Current: 14 routes
- Target: 2 routes
- Migration steps

## Technical Architecture [UPDATED]
- Quality Metrics from latest diagnostic

## Non-Functional Requirements [KEEP]
## Success Metrics [UPDATED with %]
## Dependencies & Risks [KEEP]

## Appendix
- ADR References (ADR-039 APPROVED)
- UX Specification Index
- EPIC Tracker
```

---

## 7. Action Items Summary

| Priority | Action | Owner | Estimate |
|----------|--------|-------|----------|
| P0 | Update PRD version to 2.2.0 with today's date | analyst-ext | 5 min |
| P0 | Update ADR-039 status to APPROVED | analyst-ext | 5 min |
| P0 | Add Implementation Status Dashboard section | analyst-ext | 30 min |
| P1 | Validate all Evidence sections against diagnostic | dev-ext | 1 hour |
| P1 | Update Quality Metrics with diagnostic data | analyst-ext | 15 min |
| P1 | Add Route Consolidation Roadmap section | architect-ext | 1 hour |
| P2 | Reconcile GPT-5.1 → GPT-5.2 references | analyst-ext | 15 min |
| P2 | Add UX Specification cross-references | analyst-ext | 15 min |
| P2 | Update Success Metrics with completion % | analyst-ext | 30 min |

---

## 8. Conclusion

The legacy PRD is **well-structured and largely aligned** with the vision document. The primary issues are:

1. **Stale status markers** - Evidence sections claim "needs implementation" for items that may now be done
2. **Route mismatch** - 2-route claim vs 14-route reality needs explicit addressing
3. **Missing implementation tracking** - No quick-reference dashboard for current state

**Recommendation**: Create PRD v2.2.0 with:
- Implementation Status Dashboard at top
- Updated Evidence sections validated against 2026-01-28 diagnostic
- Route Consolidation Roadmap section
- All aspirational content clearly marked

The structure and content quality is high - this is an UPDATE not a REWRITE.

---

*Analysis completed: 2026-01-28 12:02:52*
*Analyst: analyst-ext*
*Timebox: 20 minutes*
*Status: COMPLETE*
