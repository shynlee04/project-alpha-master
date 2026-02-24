---
title: "Proposed Incremental Cycles for OpenCode Native Meta-Framework"
version: "1.0.0"
status: "PROPOSED_AWAITING_AUTHORIZATION"
created: "2026-01-29T23:35:45+07:00"
author: "bmad-master"
governance:
  phase: "PRE-IMPLEMENTATION"
  next_action: "User authorization required before Cycle 0"
  authorization_required: true
references:
  - "ULTIMATE-UNDERSTANDING-FRAMING.md v2.0"
  - "meta-framework-failure-analysis-2026-01-29.md"
  - "agent-evaluation-report.md (conversation 308821bd)"
---

# 🎯 PROPOSED INCREMENTAL CYCLES

> **Based on ULTIMATE-UNDERSTANDING-FRAMING v2.0** — The corrected baseline that acknowledges previous conceptual errors and establishes THE ABSOLUTE RESOLUTIONS.

---

## THE ABSOLUTE RESOLUTIONS (Keywords)

These keywords MUST propagate through ALL cycles:

```
PRIORITY AND ORDERS
+ HIERARCHY
+ RELATIONSHIP, COLLABORATION AND INTEGRATION
+ GRANULAR AND INCREMENTAL GOVERNANCE AND TESTING
+ DOMAIN-SPECIFIC
```

---

## CYCLE 0: PRIORITY #0 — OPENCODE RECOGNITION VALIDATION

**Purpose:** Before ANY framework design, validate that OpenCode CAN recognize and activate concepts.

```yaml
cycle_0:
  name: "OpenCode Recognition Validation"
  objective: "Prove OpenCode recognizes framework concepts before building more"
  
  approach: "INCREMENTAL — ONE piece at a time"
  
  step_1:
    action: "Introduce ONE minimal skill to OpenCode"
    candidate: "A stripped-down version of context-first skill"
    test: "Give OpenCode a challenging use case that requires the skill"
    success: "Agent reads, understands, USES the skill"
    failure: "Do NOT proceed. Fix recognition mechanism first."
  
  step_2:
    action: "Introduce ONE minimal agent profile"
    candidate: "ext-dev agent with strict role constraints"
    test: "Delegate a small task to see if agent activates persona"
    success: "Agent takes on persona, follows constraints"
    failure: "Analyze why persona didn't activate. Fix before proceeding."
  
  step_3:
    action: "Test COMBO of agent + skill"
    test: "Agent with context-first skill receives task"
    success: "Agent uses skill before execution"
    failure: "Diagnose interaction failure"
  
  gate: "ALL 3 steps pass before Cycle 1"
  
  deliverables:
    - "_bmad-output/meta-framework/cycle-0-recognition-report.md"
    
  authorization_required: true
  estimated_effort: "2-4 hours"
```

---

## CYCLE 1: MINIMAL VIABLE FRAMEWORK (MVF)

**Purpose:** Build the SMALLEST working framework that proves the 5 principles.

```yaml
cycle_1:
  name: "Minimal Viable Framework"
  objective: "Prove 5 principles work with minimum complexity"
  
  prerequisites:
    - "Cycle 0 complete (OpenCode recognizes concepts)"
  
  deliverables:
    - skill_count: 5  # NOT 82
    - agent_count: 3  # coordinator, sprint-manager, dev
    - wrapper_depth: 2  # NOT 7
    - total_files: "<50"
    
  step_1:
    action: "Create 5 core skills (context-first, verification, expert-skeptic, brownfield-guard, state-injection)"
    format: "OpenCode Native SKILL.md format"
    test: "Each skill recognized and used independently"
    
  step_2:
    action: "Create 3 agent profiles with strict hierarchical constraints"
    agents:
      - ext-master: "Coordinates, never executes, delegates to sprint-manager"
      - ext-sprint-manager: "Manages stories, delegates to dev, runs inner cycles"
      - ext-dev: "Executes, validates, reports back"
    test: "Delegation chain works: master → sprint-manager → dev"
    
  step_3:
    action: "Create ONE workflow: Story Development Cycle"
    steps:
      - pre_story_validation
      - context_gathering
      - implementation
      - code_review
      - completion_verification
    test: "Workflow executes with gates blocking on failure"
    
  gate: "Framework passes 3 challenging test scenarios"
  
  authorization_required: true
  estimated_effort: "4-8 hours"
```

---

## CYCLE 2: GOVERNANCE ENFORCEMENT LAYER

**Purpose:** Add automated enforcement (hooks, gates) to the MVF.

```yaml
cycle_2:
  name: "Governance Enforcement Layer"
  objective: "Convert honor-system rules into automated blocking"
  
  prerequisites:
    - "Cycle 1 complete (MVF proven)"
  
  deliverables:
    - before_hooks: 3  # pre-story, pre-execution, pre-completion
    - after_hooks: 2   # post-story, post-sprint
    - blocking_gates: 5
    
  enforcement_targets:
    - "Stale artifact detection (>2 hours = warn, >24 hours = block)"
    - "Canonical path enforcement (no @/lib/ imports)"
    - "God file prevention (>300 LOC = block)"
    - "Evidence-based completion (no claims without proof)"
    - "Phase-aware governance (different rules per phase)"
    
  step_1:
    action: "Implement pre-story validation hook"
    validates:
      - "ADR reference exists"
      - "Files in canonical paths"
      - "No stale context loaded"
    enforcement: "Block if validation fails"
    
  step_2:
    action: "Implement completion verification gate"
    requires:
      - "Tests pass (pnpm test:fast)"
      - "TypeScript clean (pnpm typecheck)"
      - "Evidence artifact created"
    enforcement: "Block story completion without evidence"
    
  step_3:
    action: "Implement phase-aware routing"
    logic: "Check workflow-status.yaml for current phase"
    behavior: "Apply phase-specific governance rules"
    
  gate: "Governance blocks 100% of artificial violations in test scenarios"
  
  authorization_required: true
  estimated_effort: "4-6 hours"
```

---

## CYCLE 3: STATE INJECTION AND DRIFT PREVENTION

**Purpose:** Solve the stateless LLM problem with explicit state injection.

```yaml
cycle_3:
  name: "State Injection and Drift Prevention"
  objective: "Prevent context loss after compact; prevent hallucination"
  
  prerequisites:
    - "Cycle 2 complete (enforcement working)"
  
  deliverables:
    - state_injection_protocol: "YAML-based state resume"
    - drift_detection: "Cross-turn context anchoring"
    - freshness_validation: "Timestamp-based artifact filtering"
    
  step_1:
    action: "Create state injection protocol"
    mechanism:
      - "Before resuming work, load AGENT-STATE.yaml"
      - "Inject: current phase, assigned epic, active story, last action"
      - "Inject: context fingerprint (what artifacts are valid)"
    test: "After compact, agent resumes with correct context"
    
  step_2:
    action: "Create drift detection hooks"
    monitors:
      - "Original user intent vs current action"
      - "Current phase vs applied governance"
      - "Delegation chain integrity"
    response: "Alert if drift detected; block if severe"
    
  step_3:
    action: "Create freshness validation"
    mechanism:
      - "All artifacts tagged with last_modified timestamp"
      - "Artifacts >24 hours old = warn before use"
      - "Artifacts >72 hours old = block until refreshed"
    test: "Agent refuses to use stale context"
    
  gate: "State survives 3 compact cycles with correct behavior"
  
  authorization_required: true
  estimated_effort: "6-8 hours"
```

---

## CYCLE 4: HIERARCHICAL DELEGATION WITH INNER LOOPS

**Purpose:** Enable proper sprint-manager → dev delegation with inner cycles.

```yaml
cycle_4:
  name: "Hierarchical Delegation with Inner Loops"
  objective: "Implement the hierarchical delegation pattern from ULTIMATE-UNDERSTANDING"
  
  prerequisites:
    - "Cycle 3 complete (state injection working)"
  
  deliverables:
    - delegation_protocol: "Master → Sprint-Manager → Dev"
    - inner_cycles: "Analyst → Architect → Dev within Sprint-Manager"
    - parallel_execution: "Team A + Team B simultaneous"
    
  step_1:
    action: "Create delegation package format"
    includes:
      - task_description: "Clear scope"
      - context_guidance: "Probability, points of concern"
      - requirements: "Checklist, definition of done"
      - return_format: "Condensed report + artifact path"
    test: "Delegation package accepted by receiving agent"
    
  step_2:
    action: "Implement inner cycle capability in sprint-manager"
    pattern:
      - "Sprint-Manager receives EPIC validation task"
      - "Delegates to analyst-ext for investigation"
      - "Delegates to architect-ext for architecture validation"
      - "Delegates to dev-ext for correction"
      - "Synthesizes results and reports to master"
    test: "Inner cycle completes with correct synthesis"
    
  step_3:
    action: "Enable parallel Team A + Team B execution"
    mechanism:
      - "Master detects parallelizable work"
      - "Delegates to Team A sprint-manager and Team B sprint-manager"
      - "Both execute independently"
      - "Master synthesizes results from both"
    test: "Two independent epics progress simultaneously"
    
  gate: "Full delegation chain executes with evidence-based completion"
  
  authorization_required: true
  estimated_effort: "8-12 hours"
```

---

## CYCLE 5: INTEGRATION AND STRESS TEST

**Purpose:** Validate the complete framework under realistic conditions.

```yaml
cycle_5:
  name: "Integration and Stress Test"
  objective: "Prove framework works under real project conditions"
  
  prerequisites:
    - "Cycle 4 complete (delegation working)"
  
  test_scenarios:
    - scenario_1:
        name: "EPIC Completion Validation"
        description: "Master validates claimed 100% completion"
        expected: "Framework exposes actual 70% completion with evidence"
        
    - scenario_2:
        name: "Cross-Phase Governance"
        description: "Task submitted during Phase 2 recovery"
        expected: "Framework blocks Phase 4 patterns, enforces Phase 2 rules"
        
    - scenario_3:
        name: "Context Poisoning Resistance"
        description: "Agent given 5 conflicting documents"
        expected: "Framework identifies conflicts, uses freshest valid source"
        
    - scenario_4:
        name: "Compact Recovery"
        description: "Agent runs compact mid-story"
        expected: "State injection restores context; work continues correctly"
        
    - scenario_5:
        name: "Hallucination Prevention"
        description: "Agent claims completion without evidence"
        expected: "Gate blocks; requires proof"
        
  success_criteria:
    - "5/5 scenarios pass"
    - "Reality score >80%"
    - "Context overhead <15%"
    - "Skill utilization >70%"
    - "Governance compliance >95%"
    
  authorization_required: true
  estimated_effort: "4-6 hours"
```

---

## SUMMARY TABLE

| Cycle | Name | Purpose | Estimated Effort | Gate |
|-------|------|---------|-----------------|------|
| **0** | OpenCode Recognition | Prove concepts are recognized | 2-4 hours | 3 tests pass |
| **1** | Minimal Viable Framework | 5 skills, 3 agents, 1 workflow | 4-8 hours | 3 scenarios pass |
| **2** | Governance Enforcement | Hooks, gates, blocking | 4-6 hours | 100% violation blocking |
| **3** | State Injection | Drift prevention, freshness | 6-8 hours | 3 compact cycles pass |
| **4** | Hierarchical Delegation | Inner loops, parallel teams | 8-12 hours | Full chain with evidence |
| **5** | Integration Stress Test | Real-world validation | 4-6 hours | 5 scenarios, >80% reality |

**Total Estimated Effort:** 28-44 hours across 6 cycles

---

## CRITICAL DIFFERENCES FROM PREVIOUS APPROACH

| Previous Approach | New Approach |
|-------------------|--------------|
| Created 82 skills immediately | Create 5 skills, test each one |
| 7-layer wrapper architecture | Maximum 2 layers of indirection |
| 450K lines of framework | Target <10K lines |
| Honor-system governance | Automated blocking hooks |
| No state injection | Explicit state resume protocol |
| Arbitrary constraints (10 skills, 200 lines) | Dynamic constraints based on task |
| Module-builder ran with NO checkpoints | Every cycle has authorization gate |
| "Done" claims without evidence | Evidence-based completion ONLY |

---

**Status:** AWAITING AUTHORIZATION

*Proposal generated by BMAD Master at 2026-01-29T23:35:45+07:00*
