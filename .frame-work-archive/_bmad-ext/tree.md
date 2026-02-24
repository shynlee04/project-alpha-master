Your user’s .npmrc file (${HOME}/.npmrc)
has a `globalconfig` and/or a `prefix` setting, which are incompatible with nvm.
Run `nvm use --delete-prefix v22.20.0 --silent` to unset it.
> tree
.
├── agents
│   ├── _template-enhanced-agent.md
│   ├── AGENT-HIERARCHY.md
│   ├── analyst-ext.md
│   ├── architect-ext.md
│   ├── dev-ext.md
│   ├── ext-master-enhanced.md
│   ├── ext-master.md
│   ├── module-builder-ext.md
│   ├── product-management-ext.md
│   ├── tea-ext.md
│   ├── tech-writer-ext.md
│   └── ux-designer-ext.md
├── config.yaml
├── hooks
├── modules
│   ├── arc-v2
│   │   ├── agents
│   │   │   ├── component-splitter.md
│   │   │   ├── context-validator.md
│   │   │   ├── domain-scanner.md
│   │   │   ├── store-refactorer.md
│   │   │   └── workspace-architect.md
│   │   ├── MODULE.md
│   │   ├── scanners
│   │   └── workflows
│   │       └── diagnostic-first.md
│   ├── AUDIT-REPORT.md
│   ├── governance
│   │   ├── agent-rag
│   │   │   ├── conversation-threads.md
│   │   │   ├── multimodality-governance.md
│   │   │   ├── rag-context-governance.md
│   │   │   ├── staging-by-phase.md
│   │   │   └── tools-governance.md
│   │   ├── artifacts
│   │   │   ├── archiving-policy.md
│   │   │   ├── date-stamping-policy.md
│   │   │   ├── file-monitor.md
│   │   │   ├── naming-convention.md
│   │   │   └── registry.yaml
│   │   ├── config
│   │   │   ├── checklists.yaml
│   │   │   ├── domains.yaml
│   │   │   ├── gates.yaml
│   │   │   └── retention-policy.yaml
│   │   ├── MODULE.md
│   │   ├── policies
│   │   │   ├── artifact-lifecycle.md
│   │   │   ├── context-strategy.md
│   │   │   └── gating-policy.md
│   │   ├── scanners
│   │   │   ├── agent-ai-rag
│   │   │   │   └── GOVERNANCE.md
│   │   │   ├── agent-cluster-governance-scanner.md
│   │   │   ├── artifact-scanner.md
│   │   │   ├── deep-scan
│   │   │   │   └── COMPARISON-ENGINE.md
│   │   │   ├── domain-scanner.md
│   │   │   ├── file-structure
│   │   │   │   └── GOVERNANCE.md
│   │   │   ├── quality-agent-permissions-scanner.md
│   │   │   ├── quality-architecture-scanner.md
│   │   │   ├── quality-context-scanner.md
│   │   │   ├── quality-evidence-synthesizer.md
│   │   │   ├── quality-performance-scanner.md
│   │   │   ├── quality-persistence-scanner.md
│   │   │   ├── quality-security-scanner.md
│   │   │   ├── quality-state-scanner.md
│   │   │   ├── quality-types-scanner.md
│   │   │   ├── quality-ux-scanner.md
│   │   │   └── quality-workspace-scanner.md
│   │   └── workflows
│   │       ├── context-first
│   │       │   ├── steps
│   │       │   │   ├── step-01-scan.md
│   │       │   │   ├── step-01b-continue.md
│   │       │   │   ├── step-02-analyze.md
│   │       │   │   ├── step-03-contextualize.md
│   │       │   │   └── step-04-transform.md
│   │       │   └── workflow.md
│   │       ├── CORRECT-COURSE-GOVERNANCE.md
│   │       ├── expert-analysis
│   │       │   ├── steps
│   │       │   │   ├── step-01-init.md
│   │       │   │   ├── step-02-analyze-codebase.md
│   │       │   │   ├── step-03-compare-approach.md
│   │       │   │   └── step-04-recommend.md
│   │       │   └── workflow.md
│   │       ├── research-trigger
│   │       │   ├── steps
│   │       │   │   ├── step-01-init.md
│   │       │   │   ├── step-02-research.md
│   │       │   │   ├── step-03-analyze.md
│   │       │   │   └── step-04-complete.md
│   │       │   └── workflow.md
│   │       ├── story-continuity
│   │       │   └── workflow.md
│   │       └── three-core-concepts
│   │           ├── AGENT-EXPERT.md
│   │           ├── CONTEXT-FIRST.md
│   │           └── RESEARCH.md
│   ├── implementation
│   │   ├── COMMANDS.md
│   │   ├── config
│   │   │   ├── agent-tool-spec-template.yaml
│   │   │   └── journey-validation-rules.yaml
│   │   ├── MODULE.md
│   │   ├── templates
│   │   │   ├── enhanced-story-context-template.xml
│   │   │   └── enhanced-story-template.md
│   │   └── workflows
│   │       ├── correct-course
│   │       │   ├── steps
│   │       │   │   ├── step-01-receive-report.md
│   │       │   │   ├── step-02-categorize.md
│   │       │   │   ├── step-03-route.md
│   │       │   │   └── step-04-complete.md
│   │       │   └── workflow.md
│   │       └── story-cycle
│   │           ├── steps
│   │           │   ├── step-01-init.md
│   │           │   ├── step-01a-user-journey.md
│   │           │   ├── step-02-validate.md
│   │           │   ├── step-03-implement.md
│   │           │   ├── step-03a-agent-tool-spec.md
│   │           │   ├── step-04-test.md
│   │           │   ├── step-05-review.md
│   │           │   ├── step-06-done.md
│   │           │   ├── step-06a-reality-check.md
│   │           │   └── step-07-retrospective.md
│   │           └── workflow.md
│   ├── MODULE-HIERARCHY.md
│   ├── platform
│   │   └── claude-code
│   │       └── commands.yaml
│   └── sprint-planning-wrapper
│       ├── config
│       │   ├── cohesion-patterns.yaml
│       │   └── gating-rules.yaml
│       ├── MODULE.md
│       ├── scanners
│       │   ├── cohesion-scanner.md
│       │   ├── dependency-scanner.md
│       │   └── nonsense-detector.md
│       └── workflows
│           └── sprint-planning-enhanced
│               ├── steps
│               │   ├── step-01-discover-epics.md
│               │   ├── step-02-generate-status.md
│               │   ├── step-03-cohesion-check.md
│               │   ├── step-04-dependency-map.md
│               │   ├── step-05-reality-validation.md
│               │   ├── step-06-gatekeeping.md
│               │   └── step-07-handoff.md
│               └── workflow.md
├── orchestrator
│   ├── delegation-protocol.md
│   ├── escalation-protocol.md
│   ├── event-bus.yaml
│   ├── governance-auto-update.md
│   ├── master-orchestrator.md
│   ├── routing-rules.yaml
│   └── sub-agent-definitions.md
├── platform
│   ├── claude-code-concept-mapping.md
│   ├── phase-4-completion-report-2026-01-10.md
│   └── platform-wrapper-spec.md
├── prompts
│   └── perplexity-master-instruction-prompt.md
├── protocols
│   └── handoff.md
├── README.md
├── schemas
│   └── handoff-artifact.schema.yaml
├── shared-services
│   └── quality-scanner.md
├── state
│   ├── ARTIFACT_REGISTRY.yaml
│   └── LOOP_STATE.yaml
├── tree.md
└── workflows
    ├── governance-cycle
    │   └── steps
    ├── remediation-cycle
    │   ├── steps
    │   └── workflow.md
    └── story-cycle
        └── steps

56 directories, 134 files
 ~/Doc/cod/project-alpha-master/_bmad-ext  dev *2 !38 ?9                      ok  10:17:33 PM 