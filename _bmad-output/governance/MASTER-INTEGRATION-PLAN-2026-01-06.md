# MASTER INTEGRATION PLAN: Option B + Comprehensive Remediation + Cross-Workspace Chat
**Document ID**: MIP-2026-01-06
**Version**: 1.0.0
**Created**: 2026-01-06T04:30:00+07:00
**Status**: PROPOSED - AWAITING APPROVAL
**Target Execution**: Autonomous ASGL Loop

---

## Executive Summary

This plan integrates **THREE MAJOR INITIATIVES** into a unified, autonomous execution system:

1. **Option B Architecture Redesign** (80 hours)
   - Strict route parameterization
   - Unified file system
   - Cross-workspace event bus
   - Mobile/desktop fallback
   - Project context system

2. **Comprehensive Remediation Sprint** (135 hours, 15 days)
   - 69 god stores → 0
   - 45 god components → reduced
   - 306 TS errors → 0
   - Test coverage 16.6% → 80%
   - Health score 46.4% → 95%

3. **Cross-Workspace Chat Platform** (506 points, 13 weeks)
   - 73 stories across 10 epics
   - Multi-workspace AI agents
   - Multimodal input/output
   - Context awareness engine
   - Agentic workflows

**Combined Vision**: 100% health, production-ready, cross-workspace agentic platform with tools CRUD, AI multimodality, chat threads, and functional IDE.

---

## Integration Strategy

### Dependency Mapping

```
Option B Architecture (Foundation)
    ↓
Comprehensive Remediation (Health)
    ↓
Cross-Workspace Chat (Features)
```

**Critical Path**: Option B MUST complete first (routes without $projectId block everything else).

**Parallel Execution Opportunities**:
- Remediation Phases 3-7 can run alongside Chat Epics 1-3
- Infrastructure hardening benefits both initiatives
- Testing and validation shared

---

## Phase Structure (20 Days, ~300 Hours)

### Phase 0: Critical Foundation (Day 0-1, 20 hours)
**Focus**: User journey blockers that prevent ANY progress

| Story | Source | Hours | Module |
|-------|--------|-------|--------|
| UJ-001 | Option B | 4 | architecture-remediation |
| UJ-002 | Option B | 2 | architecture-remediation |
| UJ-003 | Option B | 8 | architecture-remediation |
| UJ-004 | Option B | 6 | architecture-remediation |

**Success Criteria**: Users can see sync status, mount folders on mobile, save notes to filesystem, see cross-workspace changes.

---

### Phase 1: Architecture Redesign - Option B Core (Day 1-3, 24 hours)

#### 1.1 Route Parameterization (8 hours)
**Stories**:
- ARCH-REDESIGN-1: Strict Route Parameterization (4h)
- ARCH-REDESIGN-3: Project Hierarchy Support (4h)

**Module**: `architecture-remediation → workspace-architect`

**Acceptance**:
- ALL workspace routes require $projectId
- Routes without $projectId redirect to picker
- URL structure reflects project context

#### 1.2 Unified File System (8 hours)
**Stories**:
- ARCH-REDESIGN-2: Unified Note Systems (4h)
- UJ-003: Notes Save to Filesystem (4h)

**Module**: `architecture-remediation → file-sync-specialist`

**Acceptance**:
- Dexie + FSA → single source of truth
- Notes save directly to filesystem
- No split brain between notes and filesystem

#### 1.3 Cross-Workspace Event Bus (8 hours)
**Stories**:
- UJ-004: Cross-Workspace Reactivity (4h)
- S-009: Agent Selection Persistence (4h)

**Module**: `architecture-remediation → state-scanner`

**Acceptance**:
- File changes broadcast to all workspaces
- IDE file save reflects in Notes within 1s
- Note save reflects in IDE file tree within 1s

**Success Criteria**: Architecture foundation complete, all routes parameterized, file system unified, events flowing.

---

### Phase 2: Critical Blockers Resolution (Day 3-5, 15 hours)

**Source**: Comprehensive Remediation Sprint - Phase 1

| Story | Hours | Module | Description |
|-------|-------|--------|-------------|
| S-001 | 4 | bmad-core | Debug and Fix Model Loading Flow |
| S-002 | 3 | bmad-core | Fix Credential Vault SSR Compatibility |
| S-003 | 2 | bmad-core | Add API Key Status Visual Indicators |
| S-007 | 6 | bmad-core | Create Note-Folder Bridge |
| S-008 | 4 | bmad-core | Wire Bridge to Workspace Init |

**Module Routing**:
- S-001, S-002, S-003 → `deep-scan → security-scanner`
- S-007, S-008 → `architecture-remediation → file-sync-specialist`

**Success Criteria**: LLM models load on Vercel, Notes workspace loads project files, Agent selection persists.

---

### Phase 3: God Store Elimination (Day 5-10, 40 hours)

**Source**: Comprehensive Remediation Sprint - Phase 3
**Parallel**: Cross-Workspace Chat Epic 1 (Foundation)

#### 3.1 Worst Offenders First (20 hours)

| Store | Lines | Target Slices | Hours |
|-------|-------|---------------|-------|
| rag-store.ts | 1595 | 5 slices × 120 lines | 12 |
| conversation-threads-store.ts | 726 | 6 slices × 120 lines | 8 |

**Module**: `architecture-remediation → store-refactorer`

**Process**:
1. Analyze store dependencies
2. Extract bounded contexts (indexing, retrieval, search, chunks, embeddings)
3. Create focused slices ≤120 lines each
4. Implement facade for backward compatibility
5. Update all imports
6. Validate with TypeScript

#### 3.2 Second Tier Stores (12 hours)

| Store | Lines | Target Slices | Hours |
|-------|-------|---------------|-------|
| conversation-store.ts | 626 | 5 slices × 120 lines | 6 |
| agents-store.ts | 430 | 4 slices × 120 lines | 6 |

**Module**: `architecture-remediation → store-refactorer`

**Acceptance**:
- All slices ≤120 lines
- Single bounded store
- Facade for backwards compat
- Zero TS errors

#### 3.3 God Component Splitting (8 hours)

| Component | Lines | Target | Hours |
|-----------|-------|--------|-------|
| AgentConfigDialog.tsx | 1089 | ≤300 lines + hooks | 6 |
| Other god components | Variable | ≤300 lines | 2 |

**Module**: `architecture-remediation → component-splitter`

**Success Criteria**: God store count = 0, God component count reduced >50%, TypeScript check passes.

---

### Phase 4: Store Consolidation (Day 10-12, 20 hours)

**Source**: Comprehensive Remediation Sprint - Phase 4

| Story | Hours | Module | Description |
|-------|-------|--------|-------------|
| S-017 | 6 | architecture-remediation | Consolidate workspace-store Duplicates |
| S-018 | 6 | architecture-remediation | Consolidate rag-store Duplicates |
| S-019 | 4 | architecture-remediation | Consolidate knowledge-store Duplicates |

**Module**: `architecture-remediation → state-consolidation-cycle`

**Acceptance**:
- Single canonical location per store
- Facade at old location
- All imports updated

**Success Criteria**: 0 duplicate stores, single source of truth for all state.

---

### Phase 5: Cross-Workspace Chat - Epic 1 (Day 12-14, 16 hours)

**Source**: Cross-Workspace Chat Sprint - Epic 1
**Prerequisites**: Phase 1-4 complete (architecture + health foundation)

| Story | Points | Hours | Description |
|-------|--------|-------|-------------|
| E1-1 | 8 | 8 | Integrate UnifiedChatPanel into NotesPage |
| E1-2 | 8 | 8 | Create Notes-specific Chat Context |

**Module**: `bmm → dev` (with `architecture-remediation → component-splitter` oversight)

**Acceptance**:
- Chat panel visible in Notes workspace
- Context includes current file content
- Agent can read/write notes
- Commands work: /read, /write, /summarize

**Success Criteria**: Basic cross-workspace chat working, agents can interact with notes.

---

### Phase 6: TypeScript Error Resolution (Day 14-15, 6 hours)

**Source**: Comprehensive Remediation Sprint - Phase 4

| Batch | Errors | Hours | Module |
|-------|--------|-------|--------|
| Batch 1 | 150 | 3 | architecture-remediation → typescript-fixer |
| Batch 2 | 156 | 3 | architecture-remediation → typescript-fixer |

**Module**: `architecture-remediation → fix-typescript-errors`

**Acceptance**:
- 306 TS errors fixed
- Production code 0 errors
- No new errors introduced

**Success Criteria**: `pnpm typecheck` passes with 0 errors (production code only).

---

### Phase 7: Infrastructure Hardening (Day 15-17, 16 hours)

**Source**: Comprehensive Remediation Sprint - Phase 5
**Parallel**: Cross-Workspace Chat Epic 2 (Multimodal Input)

#### 7.1 Error Recovery (8 hours)

| Story | Hours | Module | Description |
|-------|-------|--------|-------------|
| S-022 | 4 | architecture-remediation | Break Circular Dependencies |
| S-024 | 4 | bmad-core | Eliminate Silent Failures |

**Module Routing**:
- S-022 → `architecture-remediation → eliminate-god-stores`
- S-024 → `bmm → dev`

**Acceptance**:
- All 23 silent failures replaced with proper error handling
- Circular dependencies broken
- User sees appropriate feedback

#### 7.2 Data Safety (8 hours)

| Story | Hours | Module | Description |
|-------|-------|--------|-------------|
| S-023 | 4 | bmm → dev | Implement IndexedDB Quota Handling |
| S-025 | 4 | bmm → dev | Add Error Boundaries to Critical Paths |

**Module**: `bmm → dev` (with `deep-scan → persistence-scanner` oversight)

**Acceptance**:
- Quota check before writes
- Eviction when full
- 100% error boundary coverage on critical paths

**Success Criteria**: No data loss, graceful error handling, user informed of all errors.

---

### Phase 8: Cross-Workspace Chat - Epic 2 (Day 17-19, 20 hours)

**Source**: Cross-Workspace Chat Sprint - Epic 2
**Prerequisites**: Epic 1 complete, infrastructure hardened

| Story | Points | Hours | Description |
|-------|--------|-------|-------------|
| E2-1 | 8 | 6 | Voice Input Integration |
| E2-2 | 8 | 6 | File Attachment System |
| E2-3 | 8 | 8 | Image Input Processing |

**Module**: `bmm → dev` (multimodal specialists)

**Acceptance**:
- Voice input works with Web Speech API
- Files can be attached to chat
- Images processed with vision models
- Mobile/desktop fallback for unsupported features

**Success Criteria**: Multimodal input working, voice + files + images all functional.

---

### Phase 9: Testing & Validation (Day 19-22, 40 hours)

**Source**: Comprehensive Remediation Sprint - Phase 6
**Parallel**: Cross-Workspace Chat Epic 3 (Context Awareness)

#### 9.1 Unit Tests (12 hours)

| Story | Hours | Module | Description |
|-------|-------|--------|-------------|
| S-026 | 6 | testing-test-writing | Write Unit Tests for Refactored Stores |
| S-027 | 6 | testing-test-writing | Write Integration Tests for Core Flows |

**Module**: `testing → test-writer`

**Acceptance**:
- Each new slice has unit tests
- Coverage for new code ≥80%
- API key → model load tested
- Workspace switching tested

#### 9.2 E2E Tests (12 hours)

| Story | Hours | Module | Description |
|-------|-------|--------|-------------|
| S-028 | 6 | testing-test-writing | Create E2E Test Suite |
| S-029 | 6 | testing-test-writing | Production Smoke Test Suite |

**Module**: `testing → test-automator`

**Acceptance**:
- Playwright setup complete
- Critical user journeys covered
- Runs in CI/CD
- Quick validation script runs against Vercel

#### 9.3 Chat Context Engine (16 hours)

| Story | Points | Hours | Description |
|-------|--------|-------|-------------|
| E3-1 | 8 | 6 | RAG Pipeline Integration |
| E3-2 | 8 | 6 | File Context Injection |
| E3-3 | 8 | 4 | Workspace Context Awareness |

**Module**: `bmm → architect` (RAG/context specialists)

**Acceptance**:
- Agent can search across all notes
- File content injected into chat context
- Agent understands current workspace context

**Success Criteria**: Test coverage ≥80%, E2E tests passing, agents aware of file/workspace context.

---

### Phase 10: Advanced Chat Features (Day 22-30, 100 hours)

**Source**: Cross-Workspace Chat Sprint - Epics 4-7
**Parallel**: Comprehensive Remediation Sprint - Phase 7 (Governance)

#### 10.1 Agentic Workflow Engine (30 hours)

| Epic | Stories | Points | Hours |
|------|---------|--------|-------|
| E4 | 10 stories | 78 | 30 |

**Module**: `bmm → architect` (agentic workflows)

**Features**:
- Multi-step agent tasks
- Tool use orchestration
- Workflow state management
- Error recovery and retries

#### 10.2 Rich Media Output (20 hours)

| Epic | Stories | Points | Hours |
|------|---------|--------|-------|
| E5 | 7 stories | 49 | 20 |

**Module**: `bmm → dev` (media specialists)

**Features**:
- Code execution in WebContainer
- Image generation display
- Audio/video playback
- Interactive charts

#### 10.3 Deep Research Mode (30 hours)

| Epic | Stories | Points | Hours |
|------|---------|--------|-------|
| E6 | 7 stories | 56 | 30 |

**Module**: `bmm → architect` (research specialists)

**Features**:
- Web search integration
- Document summarization
- Citation management
- Research assistant workflows

#### 10.4 Web Grounding (20 hours)

| Epic | Stories | Points | Hours |
|------|---------|--------|-------|
| E7 | 5 stories | 35 | 20 |

**Module**: `bmm → dev` (API integration)

**Features**:
- URL content fetching
- Web search in chat
- Source attribution
- Fact checking

**Success Criteria**: Advanced agentic features working, agents can research, execute code, display rich media.

---

### Phase 11: Final Polish & Governance (Day 30-35, 60 hours)

**Source**: Comprehensive Remediation Sprint - Phase 7
**Parallel**: Cross-Workspace Chat Sprint - Epics 8-10

#### 11.1 UI/UX Enhancements (16 hours)

| Epic | Stories | Points | Hours |
|------|---------|--------|-------|
| E8 | 5 stories | 28 | 16 |

**Module**: `bmm → ux-designer`

**Features**:
- Expandable chat panels
- Mobile optimization
- Keyboard shortcuts
- Dark mode polish

#### 11.2 Auto Model Selection (12 hours)

| Epic | Stories | Points | Hours |
|------|---------|--------|-------|
| E9 | 4 stories | 24 | 12 |

**Module**: `bmm → architect` (AI/ML)

**Features**:
- Model selection by task type
- Cost optimization
- Performance routing
- Fallback strategies

#### 11.3 Live Paper Format (8 hours)

| Epic | Stories | Points | Hours |
|------|---------|--------|-------|
| E10 | 7 stories | 49 | 8 |

**Module**: `bmm → dev` (document specialists)

**Features**:
- Live document editing
- Collaborative annotation
- Version history
- Export to PDF/Word

#### 11.4 Governance & Cleanup (24 hours)

| Story | Hours | Module | Description |
|-------|-------|--------|-------------|
| S-030 | 3 | asgl | Fix Design System Violations |
| S-031 | 2 | asgl | Create Child AGENTS.md Files |
| S-032 | 2 | asgl | Archive Orphan Artifacts |
| S-033 | 1 | deep-scan | Final Health Assessment |
| GOV-001 | 8 | asgl | Consolidate Governance to AGENTS.md |
| GOV-002 | 8 | asgl | Update All Documentation |

**Module**: `asgl → governance-update`

**Acceptance**:
- No hardcoded colors
- 8-bit shadows only
- All strings via t()
- Child AGENTS.md files created
- Orphan artifacts archived
- Health score ≥95%

**Success Criteria**: All features polished, governance current, documentation complete.

---

### Phase 12: Production Readiness Validation (Day 35, 8 hours)

**Final Validation Gates**

| Gate | Criteria | Tool | Status |
|------|----------|------|--------|
| Health Score | ≥95% | deep-scan | ⬜ |
| God Stores | 0 | state-scanner | ⬜ |
| God Components | 0 | architecture-scanner | ⬜ |
| TypeScript Errors | 0 (prod) | tsc | ⬜ |
| Test Coverage | ≥80% | coverage | ⬜ |
| E2E Tests | All passing | playwright | ⬜ |
| i18n Coverage | 100% (VI + EN) | grep | ⬜ |
| Design System | 0 violations | design-scanner | ⬜ |
| Performance | L1 targets | lighthouse | ⬜ |
| Security | 0 critical | snyk | ⬜ |

**Module**: `deep-scan → full-scan`

**Production Deployment Checklist**:
- [ ] All validation gates passed
- [ ] E2E tests passing in CI/CD
- [ ] Performance benchmarks met
- [ ] Security audit clean
- [ ] Documentation complete
- [ ] Monitoring configured
- [ ] Backup/restore tested
- [ ] Rollback plan documented

**Success Criteria**: 100% health score, production-ready, all features working, zero critical issues.

---

## Autonomous Execution System (ASGL)

### Loop Architecture

```yaml
autonomous_loop:
  name: "MASTER-INTEGRATION-LOOP-2026-01-06"
  framework: "ASGL v2.1"
  coordination: "BMAD Master Agent"
  execution_mode: "AUTONOMOUS_WITH_CHECKPOINTS"

  checkpoints:
    - phase: 0
      trigger: "User journey fixes complete"
      action: "Validate sync status, mobile mount, notes save, reactivity"

    - phase: 1
      trigger: "Architecture redesign complete"
      action: "Validate routes parameterized, file system unified, events flowing"

    - phase: 2
      trigger: "Critical blockers resolved"
      action: "Validate models load, notes workspace, agent persistence"

    - phase: 3
      trigger: "God stores eliminated"
      action: "Validate 0 god stores, all slices ≤120 lines, facade pattern"

    - phase: 4
      trigger: "Stores consolidated"
      action: "Validate 0 duplicates, single source of truth"

    - phase: 5
      trigger: "Chat Epic 1 complete"
      action: "Validate chat panel, agent-read/write, commands working"

    - phase: 6
      trigger: "TypeScript errors fixed"
      action: "Validate 0 errors in production code"

    - phase: 7
      trigger: "Infrastructure hardened"
      action: "Validate error handling, quota checks, error boundaries"

    - phase: 8
      trigger: "Chat Epic 2 complete"
      action: "Validate voice, files, images working"

    - phase: 9
      trigger: "Testing complete"
      action: "Validate ≥80% coverage, E2E tests passing"

    - phase: 10
      trigger: "Advanced chat features complete"
      action: "Validate agentic workflows, rich media, research mode"

    - phase: 11
      trigger: "Polish complete"
      action: "Validate UI/UX, model selection, documentation"

    - phase: 12
      trigger: "Production ready"
      action: "Validate all gates passed, deploy to production"
```

### Module Routing Matrix

| Phase | Module | Workflow | Agent | Purpose |
|-------|--------|----------|-------|---------|
| 0 | architecture-remediation | workspace-file-system-e2e | workspace-architect | User journey fixes |
| 1 | architecture-remediation | state-consolidation-cycle | file-sync-specialist | Option B core |
| 2 | deep-scan | targeted-scan | security-scanner | Critical blockers |
| 3 | architecture-remediation | eliminate-god-stores | store-refactorer | God store elimination |
| 4 | architecture-remediation | state-consolidation-cycle | store-refactorer | Store consolidation |
| 5 | bmm | feature-dev | dev | Chat Epic 1 |
| 6 | architecture-remediation | fix-typescript-errors | typescript-fixer | TS error resolution |
| 7 | bmm | feature-dev | dev + deep-scan | Infrastructure |
| 8 | bmm | feature-dev | dev | Chat Epic 2 |
| 9 | testing | test-driven-development | test-writer + test-automator | Testing |
| 10 | bmm | feature-dev | architect + dev | Advanced chat |
| 11 | bmm | feature-dev | ux-designer + dev | Polish |
| 12 | deep-scan | full-scan | all-scanners | Validation |

### Handoff Protocol

**Between Phases**:
1. Current phase completes
2. BMAD Master validates acceptance criteria
3. Generate handoff artifact
4. Update LOOP_STATE.yaml
5. Invoke next module/agent
6. Resume execution

**Error Recovery**:
- Phase fails → Rollback, fix, retry
- Module unavailable → Use fallback agent
- Blocked by external dependency → Pause, notify, resume when ready

### Progress Tracking

**Metrics**:
- Stories completed / total
- Hours spent / estimated
- Health score evolution
- TypeScript error count
- Test coverage percentage
- God store count
- God component count

**Artifacts**:
- Phase completion reports
- Deep-scan validation reports
- Handoff documents
- Updated LOOP_STATE.yaml
- Updated AGENTS.md (every 3 stories)

---

## Quality Gates

### Per-Story Gates

- [ ] Code written and reviewed
- [ ] Unit tests (≥80% coverage)
- [ ] Integration tests passing
- [ ] TypeScript compiles (0 errors in prod)
- [ ] No god components/stores created
- [ ] i18n complete (VI + EN)
- [ ] Design system compliant
- [ ] Documentation updated

### Per-Phase Gates

- [ ] All stories in phase complete
- [ ] Acceptance criteria met
- [ ] Deep-scan validation passed
- [ ] No regression in health score
- [ ] E2E tests passing (if applicable)
- [ ] Performance benchmarks met
- [ ] Security scan clean

### Final Gates

- [ ] Health score ≥95%
- [ ] God stores = 0
- [ ] God components = 0
- [ ] TypeScript errors = 0 (prod)
- [ ] Test coverage ≥80%
- [ ] E2E tests = 100% passing
- [ ] i18n coverage = 100% (VI + EN)
- [ ] Design system violations = 0
- [ ] All epics complete
- [ ] Documentation current

---

## Risk Management

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Option B scope creep | HIGH | MEDIUM | Strict story boundaries, phased delivery |
| God store refactoring breaks imports | HIGH | HIGH | Facade pattern, gradual migration |
| Chat epics block on architecture | HIGH | LOW | Parallel execution, clear dependencies |
| Test coverage targets not met | MEDIUM | MEDIUM | Test-writing from start, test-first approach |
| Performance regression | MEDIUM | LOW | Performance testing each phase |
| Module unavailability | MEDIUM | LOW | Fallback agents, manual override |
| User changes requirements | HIGH | MEDIUM | Checkpoint system, rollback capability |

---

## Success Criteria

### Technical Excellence

- [ ] Health score: 46.4% → 95% (+48.6%)
- [ ] God stores: 69 → 0 (-69)
- [ ] God components: 45 → 0 (-45)
- [ ] TypeScript errors: 306 → 0 (-306)
- [ ] Test coverage: 16.6% → 80% (+63.4%)
- [ ] i18n coverage: 85% → 100% (+15%)

### Feature Completeness

- [ ] Option B architecture: 100% complete
- [ ] Comprehensive remediation: 33/33 stories complete
- [ ] Cross-workspace chat: 73/73 stories complete
- [ ] All 10 chat epics delivered
- [ ] All 12 phases complete

### Production Readiness

- [ ] E2E tests: 100% passing
- [ ] Performance: L1 targets met
- [ ] Security: 0 critical vulnerabilities
- [ ] Monitoring: Configured and operational
- [ ] Documentation: Complete and current
- [ ] Backup/restore: Tested and verified

### User Experience

- [ ] Mobile: Fully functional on touch devices
- [ ] Desktop: Smooth 60fps performance
- [ ] Accessibility: WCAG 2.1 AA compliant
- [ ] i18n: Vietnamese + English complete
- [ ] Wow factor: Delightful interactions

---

## Governance Updates

### AGENTS.md Updates (Every 3 Stories)

- [ ] Architecture changes (Option B)
- [ ] Store refactoring progress
- [ ] New component patterns
- [ ] Chat feature additions
- [ ] Health score evolution
- [ ] Lessons learned

### Documentation Artifacts

- [ ] Option B architecture decisions
- [ ] Store refactoring patterns
- [ ] Chat platform architecture
- [ ] Testing strategy
- [ ] Deployment guide
- [ ] Operations runbook

---

## Approval & Execution

### To Approve This Plan

Reply with: **APPROVE - Execute Master Integration Plan**

### To Modify This Plan

Specify changes needed, I'll revise and resubmit.

### To Execute Autonomous Loop

Once approved, the ASGL system will:
1. Initialize LOOP_STATE.yaml with this plan
2. Create feature branch `feature/master-integration-2026-01-06`
3. Begin Phase 0 execution
4. Continue autonomously through all 12 phases
5. Generate completion report at end
6. Request deployment approval

**Estimated Timeline**: 35 days (5 weeks)
**Estimated Effort**: 300 hours
**Target Health Score**: 95%
**Confidence**: HIGH (all risks mitigated)

---

**Document Status**: PROPOSED - AWAITING USER APPROVAL
**Next Action**: User approval → Initialize autonomous execution

*Generated by BMAD Master Coordinator*
*Using BMAD V6 Framework + ASGL Module*
*Date: 2026-01-06T04:30:00+07:00*
