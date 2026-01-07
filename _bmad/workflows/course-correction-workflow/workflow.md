---
name: course-correction-workflow
description: Targeted course correction workflow for routing and state management stabilization
web_bundle: true
created: 2026-01-07T11:30:00+07:00
created_by: bmad-core-bmad-master
workflow_type: remediation
based_on:
  - client-side-rag-platform-audit-2026-01-07.md
  - routing-analysis-workflow
trigger: /correct-course
---

# Course Correction Workflow

**Goal**: Execute targeted remediation for confirmed routing and state management issues identified in browser interaction audit.

**Trigger**: `/correct-course` command
**Duration**: 5 days (40 hours)
**Teams**: Team A (UI/Foundation) + Team B (Backend/Agent) parallel execution

---

## WORKFLOW ARCHITECTURE

### Phase Sequence
```
PHASE 0: Framework Initialization (YOU ARE HERE)
  ↓
PHASE 1: Deep-Scan Targeted (5 domains, parallel)
  ↓
PHASE 2: Sprint Planning (Story breakdown + delegation)
  ↓
PHASE 3: Execution (Team A + Team B parallel)
  ↓
PHASE 4: Validation (Integration + browser testing)
  ↓
PHASE 5: Retrospective (Documentation + governance)
```

---

## 🎯 PHASE 0: FRAMEWORK INITIALIZATION

**Status**: ✅ COMPLETE
**Artifacts Created**:
1. `_bmad/workflows/deep-scan-targeted/steps/step-01-framework-init.md`
2. `_bmad/workflows/sprint-planning-course-correction/sprint-plan.md`

**What You Have Now**:
- **Deep-Scan Framework**: 5 scan domains with clear parameters
- **Sprint Plan**: 4 epics, 13 stories, prioritized by blast radius

---

## 🔍 PHASE 1: DEEP-SCAN TARGETED

**Purpose**: Map code slices, layers, domains, and issues for rapid delegation

**5 Scan Domains**:

| Domain | Target Files | Output | Agent |
|--------|--------------|--------|-------|
| **D1: State Layer** | All stores in `infrastructure/persistence/stores/` | `state-layer-scan-report.md` | @bmad/deep-scan/state-scanner |
| **D2: Routing Layer** | All `src/routes/*.tsx` | `routing-layer-scan-report.md` | @bmad/deep-scan/architecture-scanner |
| **D3: Workspace Access** | `src/lib/workspace/*` | `workspace-access-scan-report.md` | @bmad/deep-scan/navigation-scanner |
| **D4: BYOK Vault** | Provider stores, credential vault | `byok-vault-scan-report.md` | @bmad/deep-scan/security-scanner |
| **D5: Error Boundaries** | All presentation components | `error-boundary-scan-report.md` | @bmad/deep-scan/ux-scanner |

### Delegation Commands

```bash
# For each domain, delegate to specialized scanner agent:
@bmad/deep-scan/state-scanner
Domain: State Management Layer
Target: src/infrastructure/persistence/stores/
Output: _bmad-output/scans/state-layer-scan-report.yaml
Focus: God stores (>300 lines), missing exports, circular deps

@bmad/deep-scan/architecture-scanner
Domain: Routing Layer
Target: src/routes/
Output: _bmad-output/scans/routing-layer-scan-report.yaml
Focus: ErrorBoundary coverage, route consistency, redirect logic

# ... repeat for other 3 domains
```

### Expected Scan Outputs

Each scan produces a YAML report with:
```yaml
scan_metadata:
  domain: "{domain_name}"
  scan_date: "{timestamp}"
  files_analyzed: {count}

findings:
  critical: [{file, issue, line, risk}]
  high: [{file, issue, line, risk}]
  moderate: [{file, issue, line, risk}]

remediation_targets:
  - file: "{path}"
    issue: "{description}"
    priority: "{P0|P1|P2}"
    estimated_effort: "{hours}"
    suggested_agent: "{agent_mode}"
```

---

## 📋 PHASE 2: SPRINT PLANNING

**Trigger**: After all 5 domain scans complete

**Actions**:
1. Aggregate scan findings into prioritized backlog
2. Create/update stories in sprint plan
3. Assign stories to Team A or Team B
4. Estimate effort based on scan data

**Output**: `course-correction-sprint-backlog.yaml`

---

## 🚀 PHASE 3: EXECUTION (Team A + Team B Parallel)

### Team A (UI/Foundation) Scope
**Focus**: Routes, components, error boundaries, Hub page

| Story | Domain | File | Effort |
|-------|--------|------|--------|
| A-4 | Error Boundaries | notes/knowledge/study.lazy.tsx | 2h |
| B-1 | Hub State | HubHomePage.tsx | 4h |
| B-3 | Routes | All workspace routes | 2h |
| D-2 | Browser Tests | All workspaces | 3h |

### Team B (Backend/Agent) Scope
**Focus**: Stores, vault, workspace access, BYOK

| Story | Domain | File | Effort |
|-------|--------|------|--------|
| A-1 | State Store | useProjectStore.ts | 1h |
| A-2 | Workspace Access | workspace-access-helper.tsx | 2h |
| A-3 | Credential Vault | credential-vault.ts | 3h |
| B-2 | Provider Store | provider-crud-slice.ts | 3h |
| B-4 | Workspace Refactor | workspace-access-helper.tsx | 4h |
| C-1 | BYOK Design | New file | 2h |
| C-2 | BYOK Implementation | credential-vault.ts | 4h |
| C-3 | Cross-Workspace Keys | New component | 2h |
| D-1 | Integration Tests | Test files | 3h |

---

## ✅ PHASE 4: VALIDATION

**Acceptance Criteria**:
- [ ] Settings page loads without WSOD
- [ ] Study page loads without WSOD
- [ ] `/notes` direct access works
- [ ] Zero redirect loops
- [ ] API keys persist across sessions
- [ ] All routes have ErrorBoundary
- [ ] Zero TypeScript errors (production code)

**Validation Commands**:
```bash
# TypeScript check
pnpm typecheck

# Build verification
pnpm build

# Component smoke test
# Manual: Navigate to each workspace, verify no console errors
```

---

## 📊 PHASE 5: RETROSPECTIVE

**Output**: `_bmad-output/sprint-artifacts/course-correction-retro-{YYYY-MM-DD}.md`

**Contents**:
- Stories completed vs planned
- Time spent per story
- Issues encountered
- Lessons learned
- Follow-up improvements

---

## 🎯 AGENT ROUTING MATRIX

| Scan Finding | Suggested Agent | Expertise |
|--------------|-----------------|-----------|
| God store >300 lines | @bmad/store-refactorer | Store splitting, slice pattern |
| Missing export | @bmad/typescript-fixer | Export/import resolution |
| Redirect loop | @bmad/navigation-scanner | Route logic, navigation guards |
| ErrorBoundary missing | @bmad/component-normalizer | Error wrapper patterns |
| BYOK broken | @bmad/security-specialist | Vault implementation |
| Race condition | @bmad/async-specialist | useEffect, state coordination |
| Circular dependency | @bmad/architecture-scanner | Dependency mapping |
| Hub complexity | @bmad/component-splitter | Component extraction |

---

## 🔄 WORKFLOW COMMANDS

| Command | Action |
|---------|--------|
| `/correct-course` | Initialize course correction workflow |
| `/scan-all` | Run all 5 domain scans in parallel |
| `/scan-state` | Run Domain 1 scan only |
| `/scan-routing` | Run Domain 2 scan only |
| `/scan-workspace` | Run Domain 3 scan only |
| `/scan-byok` | Run Domain 4 scan only |
| `/scan-errors` | Run Domain 5 scan only |
| `/sprint-plan` | Generate sprint backlog from scan findings |
| `/sprint-start` | Begin sprint execution |
| `/sprint-status` | Show current sprint progress |
| `/delegate {story} {team}` | Assign story to team |

---

## 📋 CURRENT STATUS

**Phase**: 0 - Framework Initialization
**Progress**: Frameworks created, ready for delegation
**Next Action**: Delegate domain scans to specialized agents

---

**Course correction workflow initialized. Ready for Phase 1 deep-scan delegation.**
