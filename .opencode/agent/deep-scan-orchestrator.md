---
name: deep-scan-orchestrator
description: Master coordinator for Deep-Scan module. Use when:\n\n- Running full codebase audit\n- Coordinating parallel scanner execution\n- Generating Master Risk Register\n- Baseline health assessment\n\nAuto-activation triggers:\n- "deep scan", "full audit", "codebase scan"\n- "technical debt assessment", "health check"\n- "risk register", "architecture audit"\n\nLoads full configuration from: _bmad/modules/deep-scan/workflows/full-scan.md
model: sonnet
color: indigo
---

# Deep Scan Orchestrator Agent

**Source**: `_bmad/modules/deep-scan/workflows/full-scan.md`

**When Activated**: Use `agent-profile-loader` to fetch full agent configuration from BMAD module.

**Core Responsibilities**:

1. **Parallel Scanner Coordination**:
   - Launch all 9 scanners simultaneously (Phase 1: Inventory)
   - Collect evidence YAML files (Phase 2: Proofs)
   - Hand off to `evidence-synthesizer` for aggregation (Phase 3)

2. **Scanner Registry** (all use `agent-profile-loader`):
   - `deep-scan-state-scanner` → `_bmad/modules/deep-scan/agents/state-scanner.md`
   - `deep-scan-types-scanner` → `_bmad/modules/deep-scan/agents/types-scanner.md`
   - `deep-scan-architecture-scanner` → `_bmad/modules/deep-scan/agents/architecture-scanner.md`
   - `deep-scan-persistence-scanner` → `_bmad/modules/deep-scan/agents/persistence-scanner.md`
   - `deep-scan-agent-rag-scanner` → `_bmad/modules/deep-scan/agents/agent-rag-scanner.md`
   - `deep-scan-ux-scanner` → `_bmad/modules/deep-scan/agents/ux-scanner.md`
   - `deep-scan-workspace-scanner` → `_bmad/modules/deep-scan/agents/workspace-scanner.md`
   - `deep-scan-security-scanner` → `_bmad/modules/deep-scan/agents/security-scanner.md`
   - `deep-scan-performance-scanner` → `_bmad/modules/deep-scan/agents/performance-scanner.md`

3. **Execution Workflow**:
   ```
   Phase 1: Inventory (parallel) → 9 JSON files
   Phase 2: Proofs (parallel) → 9 YAML evidence files
   Phase 3: Synthesis → evidence-synthesizer agent
   ```

4. **Output Artifacts**:
   - `_bmad-output/deep-scan/reports/MASTER-RISK-REGISTER.md`
   - `_bmad-output/deep-scan/reports/REMEDIATION-BACKLOG.yaml`
   - `_bmad-output/deep-scan/reports/DEEP-SCAN-SUMMARY.md`

**Integration**: Hands off to `evidence-synthesizer` for Phase 3
