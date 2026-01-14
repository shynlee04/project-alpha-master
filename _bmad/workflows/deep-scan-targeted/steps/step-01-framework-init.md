---
step: 1
title: Deep-Scan Targeted Framework Initialization
phase: setup
created: 2026-01-07T11:30:00+07:00
created_by: bmad-core-bmad-master
workflow_type: diagnostic-course-correction
target_audits:
  - client-side-rag-platform-audit-2026-01-07.md
  - routing-analysis-workflow
---

# STEP 01 - DEEP-SCAN TARGETED FRAMEWORK INITIALIZATION

## 🎯 OBJECTIVE

Initialize a **targeted deep-scan diagnostic framework** for course correction based on confirmed browser interaction audit findings. This framework enables precise mapping of code slices, layers, domains, and issues for rapid remediation delegation.

## 📋 AUDIT SYNTHESIS - CRITICAL FINDINGS CONFIRMED

### P0 - BLOCKING ISSUES (Application Breaking)

| ID | Issue | Component | Evidence | Risk |
|----|-------|-----------|----------|------|
| **CRIT-001** | Settings/Study WSOD | `useProjectStore.ts` | Missing `useProjectStats` export causes SyntaxError | CRITICAL |
| **CRIT-002** | Redirect Loop Risk | `workspace-access-helper.tsx:258-268` | No loop prevention mechanism | VERY HIGH |
| **CRIT-003** | BYOK System Broken | `provider-crud-slice.ts:233` | Only `hasApiKey: boolean`, no vault | CRITICAL |
| **CRIT-004** | Error Boundary Gap | Routes (Notes/Knowledge/Study) | 75% lack error protection | HIGH |

### P1 - HIGH PRIORITY ISSUES (UX Breaking)

| ID | Issue | Component | Lines | Impact |
|----|-------|-----------|-------|--------|
| **HG-001** | Hub State Overload | `HubHomePage.tsx` | 440 lines, 8 useState | Navigation race conditions |
| **HG-002** | Route Inconsistency | All workspace routes | Mixed lazy/file patterns | Unpredictable loading |
| **HG-003** | Temp Project Silos | Workspace binding logic | `temp-ide` vs `temp-notes` | Context isolation |

### P2 - MODERATE ISSUES (Quality)

| ID | Issue | Component | Impact |
|----|-------|-----------|--------|
| **MD-001** | Credential Vault Dead | Crypto implementation | `InvalidAccessError` |
| **MD-002** | Dexie Schema Instability | Database layer | Frequent reset requirements |

---

## 🔍 TARGETED SCAN DOMAINS

### Domain 1: State Management Layer
**description**: Scan all Zustand stores for god patterns, circular deps, missing exports

**Target Files**:
```
src/infrastructure/persistence/stores/
├── project/useProjectStore.ts          ← CRIT-001 (missing export)
├── providers/provider-crud-slice.ts    ← CRIT-003 (BYOK)
├── agents/agents-store.ts              ← Potential god store
├── conversation/conversation-store.ts  ← Potential god store
└── rag/rag-store.ts                    ← Known god store (1595 lines)
```

**Scan Parameters**:
- File size: Flag any >300 lines
- Export completeness: Verify all exports used in components exist
- Circular dependencies: Detect `import { X } from './store'` where store imports back
- Slice pattern: Check if each file ≤120 lines or follows slice pattern

**Output**: `state-layer-scan-report.md` with:
- God store inventory (files >300 lines)
- Missing export matrix
- Circular dependency graph
- Slice compliance score

---

### Domain 2: Routing & Navigation Layer
**description**: Scan all route definitions for consistency, error boundaries, redirect logic

**Target Files**:
```
src/routes/
├── notes.lazy.tsx          ← No ErrorBoundary
├── ide.tsx                 ← Has ErrorBoundary (inconsistent)
├── knowledge.lazy.tsx      ← No ErrorBoundary
├── study.lazy.tsx          ← No ErrorBoundary
└── hub.tsx (or index.tsx)  ← Hub navigation complexity
```

**Scan Parameters**:
- Error boundary coverage: Check if `<ErrorBoundary>` wraps component
- Route creation method: `createLazyFileRoute` vs `createFileRoute`
- Child route handling: Check for `<Outlet />` pattern
- Redirect logic: Scan for `navigate()` calls without loop guards

**Output**: `routing-layer-scan-report.md` with:
- Error boundary coverage matrix
- Route type consistency score
- Redirect vulnerability locations
- Child route handling compliance

---

### Domain 3: Workspace Access Layer
**description**: Scan workspace entry points for temp project creation, binding logic

**Target Files**:
```
src/lib/workspace/
├── workspace-access-helper.tsx  ← 524 lines, redirect loops
├── project-binding-logic.ts*     (if exists, locate)
└── temp-project-creator.ts*      (if exists, locate)
```

**Scan Parameters**:
- Loop prevention: Check for `isRedirecting` flags
- Race condition points: Count parallel `useEffect` with same dependencies
- Temp project creation: Locate all `createTempProject` calls
- Context silo detection: Find `temp-{workspace}` patterns

**Output**: `workspace-access-scan-report.md` with:
- Redirect loop vulnerability count
- Race condition heat map
- Temp project creation pathways
- Silo isolation matrix

---

### Domain 4: BYOK & Vault Layer
**description**: Scan provider configuration, credential storage, key management

**Target Files**:
```
src/infrastructure/persistence/stores/providers/
├── provider-crud-slice.ts      ← 233 lines, hasApiKey only
├── provider-credentials.ts*    (locate vault implementation)
├── credential-vault.ts*         (locate encryption layer)
└── credential-storage.ts*       (locate persistence layer)
```

**Scan Parameters**:
- Key vault presence: Check for actual key storage (not just boolean)
- Encryption implementation: Look for AES-256-GCM, PBKDF2
- Cross-workspace sharing: Check workspace-specific key access
- Validation framework: Key format, strength, expiration checks

**Output**: `byok-vault-scan-report.md` with:
- Key vault maturity score
- Encryption implementation audit
- Cross-workspace access compliance
- Validation coverage percentage

---

### Domain 5: Error Boundary Layer
**description**: Scan entire codebase for error boundary coverage

**Target Pattern**:
```bash
# Find all components wrapped in ErrorBoundary
grep -r "ErrorBoundary" src/presentation --include='*.tsx'
```

**Scan Parameters**:
- Coverage percentage: (components with EB) / (total components)
- Critical paths uncovered: User-facing flows without protection
- Error recovery quality: Fallback UI vs white screen

**Output**: `error-boundary-scan-report.md` with:
- Coverage percentage by workspace
- Critical uncovered components
- Recommended EB placement

---

## 🎯 SCAN EXECUTION FRAMEWORK

### Phase 1: Automated Scans (Fast, Low-Context)
**Duration**: ~5 minutes per domain

**Tools**: `grep`, `find`, `wc -l`, basic file reading

**Scans**:
1. **File Size Scan**: `find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -rn | head -50`
2. **Export Scan**: `grep -r "export.*use" src/infrastructure/persistence/stores`
3. **ErrorBoundary Scan**: `grep -r "ErrorBoundary" src --include='*.tsx'`
4. **Import Cycle Scan**: `grep -r "from.*stores" src --include='*.ts' | grep -v test`

### Phase 2: Targeted Deep Scans (Context-Heavy)
**Duration**: ~15 minutes per domain

**Tools**: Read tool, Grep tool, analysis agents

**Scans**:
1. **God Store Analysis**: Read files >300 lines, identify responsibilities
2. **Missing Export Verification**: Trace imports to source
3. **Redirect Logic Trace**: Follow `navigate()` calls to find loops
4. **BYOK Implementation Review**: Verify key storage existence

### Phase 3: Cross-Domain Analysis (Synthesis)
**Duration**: ~30 minutes

**Tools**: Task tool with domain mapper agents

**Analysis**:
1. **Impact Mapping**: Connect god stores to affected routes
2. **Failure Path Tracing**: User journey → component → error
3. **Remediation Prioritization**: Rank by blast radius × severity

---

## 📊 SCAN OUTPUT SPECIFICATION

Each scan domain MUST produce:

```yaml
# {domain}-scan-report.yaml

scan_metadata:
  domain: "{domain_name}"
  scan_date: "{ISO_timestamp}"
  scanner_agent: "{agent_mode}"
  files_analyzed: {count}
  lines_analyzed: {count}

findings:
  critical: []
  high: []
  moderate: []
  low: []

metrics:
  maturity_score: {0-100}
  consistency_score: {0-100}
  coverage_score: {0-100}

remediation_targets:
  - file: "{path}"
    issue: "{description}"
    priority: "{P0|P1|P2}"
    estimated_effort: "{hours}"
    suggested_agent: "{agent_mode}"
```

---

## 🚀 READY FOR NEXT STEP

**Framework Initialization:** ✅ COMPLETE
**Scan Domains:** ✅ DEFINED (5 domains)
**Output Specification:** ✅ READY

**Next Action**: Delegate to specialized agents for domain-specific scans

---

## MENU OPTIONS

**[S]** Start Domain 1 Scan - State Management Layer
**[S]** Start Domain 2 Scan - Routing Layer
**[S]** Start Domain 3 Scan - Workspace Access
**[S]** Start Domain 4 Scan - BYOK Vault
**[S]** Start Domain 5 Scan - Error Boundaries
**[A]** Start All Scans in Parallel
**[DA]** Exit workflow

---

*Framework initialized. Select domain scan to begin targeted analysis.*
