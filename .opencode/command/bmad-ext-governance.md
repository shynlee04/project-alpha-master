---
description: 'Run governance enforcement and update governance documents'
---

IT IS CRITICAL THAT YOU FOLLOW THESE STEPS:

<steps CRITICAL="TRUE">
1. LOAD the governance module from @_bmad-ext/modules/governance/MODULE.md
2. LOAD the governance auto-update protocol from @_bmad-ext/orchestrator/governance-auto-update.md
3. EXECUTE the three enforcement checks:
   a. Context-First (scan → contextualize → transform)
   b. Agent as Expert (bug level, approach flaws)
   c. Research Trigger (internet validation)
4. GENERATE governance report (ALLOW/WARN/BLOCK)
5. UPDATE AGENTS.md if trigger conditions met
6. UPDATE sprint-status.yaml if needed
7. REGISTER new artifacts in ARTIFACT_REGISTRY.yaml
</steps>

## Governance Triggers

- Story completion threshold (every 3 stories)
- Epic completion
- Critical architecture changes
- Sprint rotation
- Manual request

## Three Enforcement Concepts

1. **Context-First**: Auto-transform prompts with accurate context
2. **Agent as Expert**: Define bug level, detect approach flaws
3. **Research Trigger**: Internet-based validation for tech choices
