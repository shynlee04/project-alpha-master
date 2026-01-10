# Architecture & Refactoring Module

**Module ID**: MOD-B-ARCH
**Governance Tier**: Tier 3 (Archival)
**TTL**: 90 days
**Last Updated**: 2026-01-06
**Status**: Active

---

## Purpose

The Architecture & Refactoring module consolidates quality assurance, technical debt remediation, and codebase normalization capabilities. It provides deep scanning, comprehensive diagnostics, and systematic remediation workflows.

### Key Responsibilities

1. **Deep Codebase Scanning**: Multi-dimensional quality assessment across 7 dimensions
2. **God Store Elimination**: Systematic elimination of stores >300 lines
3. **Component Normalization**: Reduce components to ≤300 lines with extracted sub-components
4. **TypeScript Error Remediation**: Comprehensive type safety enforcement
5. **Architecture Health Monitoring**: Continuous tracking of technical debt metrics
6. **Workspace Architecture Planning**: Cross-workspace integration and file system E2E

---

## Agents

### 1. Master Architect
**File**: `agents/master-architect.md`
**Role**: Central coordinator for all architecture remediation workflows

**Capabilities**:
- Coordinate deep-scan execution across all 7 scanners
- Prioritize remediation tasks based on health impact
- Split god components and stores into focused modules
- Route specialized tasks to appropriate agents
- Track architecture health metrics over time

**Specializations**:
- Store refactoring (Zustand v5 patterns)
- Component splitting (≤300 lines per component)
- TypeScript error resolution (code files only)
- Architecture layer compliance (4-layer architecture)
- Workspace file system E2E implementation

---

## Workflows

### 1. Comprehensive Remediation
**File**: `workflows/comprehensive-remediation.md`

**Remediation Cycle**:
1. **Deep-Scan Phase**: Run all 7 quality scanners
2. **Analysis Phase**: Aggregate findings, prioritize by impact
3. **Remediation Phase**: Execute targeted fixes
4. **Validation Phase**: Verify improvements, re-scan
5. **Documentation Phase**: Update AGENTS.md with new patterns

**Scanner Suite** (from quality/ module):
- `state-scanner`: God store detection (>300 lines)
- `architecture-scanner`: Layer violations, god components
- `ux-scanner`: Hardcoded strings, accessibility issues
- `security-scanner`: Secret leaks, XSS vulnerabilities
- `performance-scanner`: Bundle bloat, render waste
- `types-scanner`: `any` types, type suppressions
- `workspace-scanner`: Cross-workspace leaks, event isolation

### 2. God Store Elimination
**Triggered**: When store >300 lines detected
**Agent**: `store-refactorer` (from architecture-remediation module)

**Process**:
1. Load god store, analyze structure
2. Identify logical groupings (≤120 lines per slice)
3. Extract slices with Zustand v5 individual selectors
4. Create facade for backward compatibility
5. Update all imports across codebase
6. Verify zero TypeScript errors

**Size Limits**:
- Individual slice: ≤120 lines
- Combined store: ≤300 lines
- God store (>500 lines): MUST be split immediately

### 3. Component Normalization
**Triggered**: When component >300 lines detected
**Agent**: `component-splitter` specialist

**Process**:
1. Analyze component structure and dependencies
2. Extract custom hooks, sub-components, utilities
3. Maintain zero breaking changes with facade patterns
4. Ensure all new modules ≤300 lines
5. Update test coverage (target ≥80%)

**Extraction Priority**:
1. Custom hooks (business logic isolation)
2. Sub-components (UI modularization)
3. Utility functions (reusability)
4. Type definitions (type safety)

### 4. TypeScript Error Remediation
**Agent**: `typescript-fixer` specialist

**Scope**:
- **Code Files**: ENFORCE - all errors must be addressed
- **Test Files**: EXCLUDE - test file errors are non-blocking
- **Command**: `pnpm typecheck` (excludes tests, ~3x faster)

**Strategy**:
1. Categorize errors by type (missing imports, type mismatches, etc.)
2. Batch similar errors for efficient resolution
3. Use tsconfig.check.json with incremental flag
4. Verify zero errors after each fix batch

---

## Configuration Files

### 1. Quality Metrics
**File**: `config/quality-metrics.yaml`

**Health Dimensions** (7 scanners):
```yaml
quality_dimensions:
  state_management:
    max_lines_per_store: 300
    max_lines_per_slice: 120
    target_test_coverage: 80%

  component_architecture:
    max_lines_per_component: 300
    max_nesting_level: 3
    max_functions_per_component: 10

  type_safety:
    max_any_types: 0  # Zero tolerance
    max_type_suppressions: 5
    code_file_enforcement: strict
    test_file_enforcement: excluded

  ux_compliance:
    max_hardcoded_strings: 0
    min_touch_targets: 44px
    i18n_coverage: 100%

  security:
    secret_leaks: 0  # Zero tolerance
    xss_vulnerabilities: 0
    unsafe_file_ops: 0

  performance:
    max_bundle_size: TBD
    max_render_waste: TBD
    min_lazy_loading: 80%

  workspace_integration:
    cross_workspace_leaks: 0
    event_isolation_violations: 0
    file_sync_failures: 0
```

### 2. Remediation Priorities
**File**: `config/remediation-priorities.yaml`

**Priority Matrix**:
| Issue | Severity | Autonomy | Action |
|-------|----------|----------|--------|
| God store >500 lines | P0 | Autonomous | Immediate split |
| TypeScript errors (code) | P0 | Autonomous | Fix immediately |
| Secret leaks | P0 | Block | Human notification |
| Component >300 lines | P1 | Autonomous | Schedule split |
| Tier 1 modification | P0 | Block | Immediate rejection |
| Accessibility violations | P2 | Autonomous | Fix in next story |

---

## Integration Points

### Module Dependencies
**Consumes From**:
- Core Governance Module (governance enforcement triggers)
- Sprint Execution Module (stories requiring remediation)

**Provides To**:
- All modules (quality assessment reports)
- Integration Testing Module (remediated code for testing)

### Workspace Integration
**Cross-Workspace E2E**:
- File system synchronization between workspaces
- Event isolation to prevent cross-workspace pollution
- Shared state management with proper cleanup
- Import path validation across workspace boundaries

---

## Artifacts Created

### Scanner Outputs
- `artifacts/state-scan-report.md`
- `artifacts/architecture-scan-report.md`
- `artifacts/ux-scan-report.md`
- `artifacts/security-scan-report.md`
- `artifacts/performance-scan-report.md`
- `artifacts/types-scan-report.md`
- `artifacts/workspace-scan-report.md`

### Remediation Artifacts
- `artifacts/store-refactoring-plan.md`
- `artifacts/component-splitting-plan.md`
- `artifacts/typescript-fix-log.md`
- `artifacts/health-improvement-report.md`

### Validation Reports
- `artifacts/post-remediation-scan.md`
- `artifacts/health-metrics-trend.md`
- `artifacts/technical-debt-register.md`

---

## Merged From

This module consolidates functionality from three previous modules:

### 1. architecture-remediation/
**Agents Retained**:
- `store-refactorer.md`
- `component-splitter.md`
- `workspace-architect.md`

**Workflows Retained**:
- `eliminate-god-stores.md`
- `normalize-components.md`
- `workspace-file-system-e2e.md`

### 2. quality/ (deep-scan)
**Scanners Integrated**:
- All 7 quality scanners
- Evidence synthesizer
- Comprehensive audit workflow

### 3. cham/ (audit)
**Capabilities Retained**:
- Code review expertise
- Technical debt assessment
- Architecture validation

---

## Quality Metrics

### Remediation Success
- **Target**: 95% health score improvement
- **Measurement**: Pre-remediation vs post-remediation scans
- **Baseline**: Current health score from sprint-status.yaml

### Technical Debt Reduction
- **Target**: Reduce god stores by 100%
- **Measurement**: Store count, size distribution
- **Target**: Reduce component lines by 50%
- **Measurement**: Component size distribution

### TypeScript Compliance
- **Target**: 0 errors in production code
- **Measurement**: `pnpm typecheck` exit code
- **Status**: Test files excluded (non-blocking)

---

## Success Criteria

✅ **Completed**:
1. Module consolidation (3→1)
2. Directory structure created
3. MANIFEST.md documentation

🔄 **In Progress**:
1. Master architect agent creation
2. Comprehensive remediation workflow
3. Quality metrics configuration

⏳ **Pending**:
1. Deep-scan agent integration
2. Store refactoring automation
3. Component splitting workflows
4. TypeScript error batch processing

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2026-01-06 | BMAD Framework Transformation - Consolidated from 3 modules |
| 1.x.x | 2025-12-XX | Original architecture-remediation module |
| 1.x.x | 2025-12-XX | Original quality (deep-scan) module |
| 1.x.x | 2025-12-XX | Original cham (audit) module |

---

## Related Files

- **Governance**: `_bmad/modules/core-governance/` (enforcement triggers)
- **Transformation Plan**: `/Users/apple/.claude/plans/valiant-purring-tower.md`
- **Agent Registry**: `.claude/config/unified-agent-registry.yaml`

---

**Module Status**: ✅ ACTIVE (consolidated)
**Next Review**: 2026-02-06 (30 days)
**Maintainer**: BMAD-Core-Master (orchestrates via master-architect)
