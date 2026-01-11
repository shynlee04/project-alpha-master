# governance-core Migration Archive

**Archived:** 2026-01-11  
**Reason:** Duplicate module - consolidated into `governance/` v2.0  
**Status:** Archived

## What Was Archived

The entire `governance-core/` module has been moved to this archive because it was a duplicate of the enhanced `governance/` module.

## Why This Module Was Archived

1. **Duplicate Functionality**: Both `governance/` and `governance-core/` provided similar governance services
2. **Consolidation Decision**: The `governance/` module was upgraded to v2.0 to include all functionality from `governance-core/`
3. **Reduced Complexity**: Eliminating duplicate modules reduces confusion and maintenance burden

## Contents of This Archive

```
governance-core/
├── MODULE.md                      # Module definition
├── PROGRESS-2026-01-10.md         # Progress tracking
├── agents/                        # Empty directory
├── config/
│   ├── artifact-manager.yaml      # Artifact management config
│   ├── checklists/                # Governance checklists
│   │   ├── README.md
│   │   ├── artifact-freshness-gate.yaml
│   │   ├── epic-done-gate.yaml
│   │   ├── sprint-rotation-gate.yaml
│   │   ├── story-done-gate.yaml
│   │   └── story-start-gate.yaml
│   ├── context-poisoning.yaml     # Context validation config
│   ├── domains.yaml               # Domain configurations
│   ├── error-categories.yaml      # Error categorization
│   ├── override-policy.yaml       # Override policies
│   ├── research-triggers.yaml     # Research trigger rules
│   └── time-based-gates.yaml      # Time-based governance
├── core/
│   ├── context-first-service.ts   # Context-first implementation
│   ├── expert-analysis-engine.ts  # Expert analysis engine
│   └── governance-reporter.ts     # Governance reporting
├── hooks/
│   ├── claude-code/
│   │   ├── post-workflow.yaml
│   │   ├── session-start.yaml
│   │   └── user-prompt-submit.yaml
│   └── generic/
│       └── pre-execution.yaml
├── policies/
│   ├── artifact-lifecycle.md
│   ├── context-strategy.md
│   ├── remediation-categories.md
│   └── stage-gating.md
├── scanners/
│   ├── agent-ai-rag-scanner.md
│   └── file-structure-scanner.md
└── workflows/
    ├── auto-gate.md
    ├── context-first.md
    ├── correct-course-instructions.md
    ├── correct-course.yaml
    ├── expert-analysis.md
    ├── research-trigger.md
    └── stage-gate.md
```

## Migration Notes

If you need functionality from this archived module, it has been consolidated into:

**`_bmad-ext/modules/governance/` (v2.0)**

This includes:
- ✅ All governance workflows
- ✅ All checklists
- ✅ All scanners
- ✅ All policies
- ✅ Enhanced hooks for Claude Code and OpenCode

## References

- **MANIFEST.yaml Entry:** Updated to reference consolidated `governance/` module
- **MODULE.md (v2.0):** `_bmad-ext/modules/governance/MODULE.md`
- **Audit Report:** `_bmad-ext/modules/AUDIT-REPORT.md`

## Archive Created By

BMAD Extension Layer Activation - Phase 1 State Layer Completion
Session ID: ses-4693-2026-01-11
