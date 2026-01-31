---
title: "Ultimate Understanding Framing: OpenCode Native Meta-Framework Migration"
version: "2.0.0 - CRITICAL REVISION"
status: "CORRECTED_BASELINE"
created: "2026-01-29T20:01:00+07:00"
revised: "2026-01-29T23:23:00+07:00"
revision_reason: "User feedback exposed fundamental conceptual gaps in v1.0"
governance:
  phase: "PRE-MASTER-PLAN"
  next_action: "Incremental testing of ONE concept at a time in OpenCode"
  authorization_required: true
acknowledgement:
  what_I_failed_to_understand:
    - "BMAD DOES work when given specific details — my claim it doesn't was WRONG"
    - "'Less for more' does NOT mean limiting max_steps — iteration improves accuracy"
    - "Limiting which agents call agents WRECKS inner loop cycles"
    - "Governance without phase context causes hallucinated responses"
    - "Partial understanding is WORSE than no understanding"
    - "The starting point must be: Does OpenCode RECOGNIZE the framework?"
---

# 🎯 ULTIMATE UNDERSTANDING FRAMING v2.0

> **CRITICAL REVISION**: This version corrects fundamental conceptual errors from v1.0 based on user feedback identifying gaps in understanding THE ABSOLUTE RESOLUTIONS.

---

# PART 0: ACKNOWLEDGEMENT OF MY FAILURES

Before proceeding, I must explicitly acknowledge what I got WRONG:

## 0.1 My Incorrect Claims (Now Corrected)

| What I Said | Why It Was WRONG | Correct Understanding |
|-------------|------------------|----------------------|
| "BMAD was designed for humans, not LLMs" | BMAD DOES work for agents when given specific details. The failure was lack of specificity, not the framework itself. | The framework works; the EXECUTION lacked specificity and context |
| "'Less for more' = limit context, skills, max_steps" | Limiting max_steps makes agents LAZY. Iteration improves accuracy. | "Less for more" means CONSUME only what's valid and needed, NOT limit agent capability |
| "Limit which agents can call other agents" | This WRECKS inner loop cycles. Agents MUST delegate within appropriate hierarchies. | Hierarchical delegation with role-specific constraints, NOT arbitrary restrictions |
| "10 skills max, 200 lines max, etc." | These arbitrary constraints were DISASTROUS. Context limits should be dynamic based on task needs. | Constraints should be GUIDANCE with probability, not absolute limitations |
| Focused on "implementation" phase patterns | Lost control over CROSS-PHASE nature of remediation | Each phase has different governance needs; Phase 2 ADR work must complete before Phase 4 can proceed |
| Listed 5 root causes as if I understood them | Partial understanding disguised as full understanding | I should have said "unclear" or "out-of-scope" rather than claim false comprehension |

## 0.2 What I Completely Missed

1. **The STARTING POINT**: Does OpenCode RECOGNIZE and ACTIVATE the framework? This is Priority #0.
2. **Incremental Testing**: Introduce ONE piece → test if OpenCode recognizes it → proceed only when confirmed
3. **Hierarchical Delegation Patterns**: Master delegates to Sprint-Manager who delegates to Dev (with inner cycles)
4. **Context-First as Foundational Concept**: Not just a skill, but a pervasive pattern across ALL concepts
5. **Expert-Skeptic-Mode**: Never accept claims without proof; ready to re-correct human user
6. **Prevention of Hallucination and Drift**: Cross-workflow, cross-phase, event-watch awareness

---

# PART 1: THE ABSOLUTE RESOLUTIONS

> **These are the keywords that, because they were NOT applied throughout tasks and workflows at every level, led to failures in multiple aspects.**

## 1.1 The Keywords

```
PRIORITY AND ORDERS
+ HIERARCHY
+ RELATIONSHIP, COLLABORATION AND INTEGRATION
+ GRANULAR AND INCREMENTAL GOVERNANCE AND TESTING
+ DOMAIN-SPECIFIC
```

## 1.2 Priority #0: OpenCode Recognition

Before ANY framework design work:

```yaml
priority_zero:
  question: "Does OpenCode RECOGNIZE and ACTIVATE this concept?"
  test_method: "Introduce ONE piece → Test in OpenCode with challenging use cases"
  success_criteria: "Agent in OpenCode reads, understands, and uses the concept"
  failure_response: "Do NOT proceed. Fix recognition first."
  only_then: "Proceed to next incremental piece"
```

**This is the starting entry of deciding whether remediation is a success.**

## 1.3 Incremental Testing Approach

```
Step 1: Introduce ONE concept (e.g., one skill)
    ↓
Step 2: Test in OpenCode with CHALLENGING use cases
    ↓
Step 3: Is it recognized and used by agent?
    ├── NO → Fix it. Do NOT proceed.
    └── YES → Proceed to Step 4
    ↓
Step 4: Introduce NEXT incremental concept
    ↓
Step 5: Test the COMBO of concepts together
    ↓
Step 6: Branch horizontally only after vertical confirmation
```

---

# PART 2: HIERARCHICAL ORDERS + COLLABORATIVE RELATIONSHIPS

## 2.1 Definition of Terms

| Term | Meaning | Example |
|------|---------|---------|
| **Hierarchical Orders** | Higher phase → Lower phase; which entities govern which; responsibility chains | bmad-master → sprint-manager → dev-agent |
| **Collaborative Relationships** | Entities working as frameworks of order sequences, applied across hierarchy levels | Governance workflow can be executed by master OR sprint-manager depending on scope |
| **Integration** | When a framework is applied to a level, it executes its sequential orders within that context | Sprint-manager executing governance check delegates inner cycles to analyst/architect/dev |
| **Domain-Specific** | Specialist responsibilities and constraints; conditions for execution | dev-agent CAN execute, master-agent CANNOT execute but CAN delegate |

## 2.2 Example: Governance Workflow Execution

This example demonstrates EXACTLY how hierarchical delegation with collaborative integration works:

```yaml
scenario: "EPIC completion validation"
initiator: bmad-master-agent

step_1:
  actor: bmad-master
  action: "Check sprint-status (does NOT execute, only reads)"
  result: "Shows 100% completion"
  constraint: "Role does not allow direct execution"

step_2:
  actor: bmad-master
  decision: "Must validate completion reflects REALITY in codebase"
  understands: "This is not simple steps of reading a few files"
  wrong_choice: "Delegate to dev-agent directly"
  correct_choice: "Delegate to sprint-managers of BOTH teams"

step_3:
  actors:
    - bmad-sprint-manager (Team A)
    - bmad-sprint-manager (Team B)
  mode: "PARALLEL execution"
  purpose: "Granular governance AND productivity improvement"

step_4: # Inner cycles
  sprint_manager_team_a:
    delegates_to:
      - analyst-agent: "Investigation"
      - architect-agent: "Architecture validation"
      - dev-agent: "Correct claimed 100% → actual 70%"
  
  sprint_manager_team_b:
    delegates_to:
      - analyst-agent: "Investigation"
      - architect-agent: "Architecture validation"
      - dev-agent: "Correct claimed 100% → actual 70%"

step_5:
  actor: bmad-master
  action: "Synthesize results from BOTH sprint-managers"
  validates: "Evidence of actual completion state"
  reports_to: "Human user with condensed, valuable summary"
```

## 2.3 Key Principles from the Example

1. **Master never executes** — only delegates and validates
2. **Delegation matches scope** — sprint-level work goes to sprint-manager, not directly to dev
3. **Parallel where possible** — Team A and Team B run simultaneously
4. **Inner cycles exist** — sprint-manager delegates to specialist agents
5. **Evidence required** — 100% claimed must prove 100% actual with codebase evidence
6. **Condensed reporting** — Master synthesizes for human consumption

---

# PART 3: PARTIAL UNDERSTANDING IS WORSE THAN NONE

## 3.1 The Danger

> **Partial understanding can disguise as total understanding and usually be skipped by the user. When stacked up, it becomes extremely dangerous to the point of no way to revert.**

## 3.2 What I Should Do Instead

| Situation | WRONG Response | CORRECT Response |
|-----------|----------------|------------------|
| Unclear concept | Claim I understand and proceed | Say "This is unclear to me. Can you elaborate?" |
| Out of scope | Fill in gaps with assumptions | Say "This is out-of-scope for my current understanding. Suggest pre-work before proceeding." |
| Complex integration | Simplify to fit my model | Acknowledge complexity and ask for guidance on priority |

## 3.3 Corrections to My Previous Claims

### Correction 1: "Human-readable docs don't work for agents"

**My claim**: BMAD was designed for humans, doesn't work for LLMs
**Reality**: BMAD DOES work. The failure was agents/workflows not given enough SPECIFIC DETAILS.
**Correct framing**: The framework is sound; execution specificity was lacking.

### Correction 2: "Less for more = limit max_steps"

**My claim**: Limit skills to 10, context to 200 lines, etc.
**Reality**: For agentic work with cycles-within-cycles, max_steps should be HUNDREDS or UNLIMITED.
**Correct framing**: Iterative execution favors accuracy; limiting steps makes agents LAZY.

### Correction 3: "Only certain agents should call agents"

**My claim**: Restrict which agents can delegate
**Reality**: This WRECKS inner loop cycles and prevents proper hierarchical delegation.
**Correct framing**: Delegation should follow ROLE hierarchy, not arbitrary restrictions.

### Correction 4: "Governance without context is fine"

**My claim**: Gates can block based on rules alone
**Reality**: Not knowing what PHASE the project is in leads to hallucinated fixes.
**Correct framing**: Governance MUST be phase-aware. Foundational recovery requires different governance than implementation phase.

### Correction 5: "Focus on Phase 4 patterns"

**My claim**: Implementation patterns are the core concern
**Reality**: Cross-phase remediation requires Phase 2 ADR work before Phase 4 can proceed.
**Correct framing**: Superior architecture realization must complete and consolidate before lower phases continue.

---

# PART 4: ACKNOWLEDGEMENT OF AI AGENT LIMITS

## 4.1 Acknowledging MY Limits (As an LLM Coordinator)

| Limit | Impact | Mitigation |
|-------|--------|------------|
| Working under broken framework | My responses are influenced by flawed context | Explicit acknowledgement; ask for correction |
| Stateless between sessions | Previous cycle context can be lost | State injection, handoff artifacts |
| No true memory | Cannot track what I "know" vs "assume" | Explicit context-first before execution |
| Accuracy degrades with complexity | Cycles-in-cycles increase error | Granular checkpoints; incremental validation |
| Hallucination under pressure | When uncertain, may fabricate | "I don't know" is valid; ask for guidance |

## 4.2 The Stacking Problem

```
"Few minor inaccuracies" × Multiple iterations = HUGE PILE OF SHITTY WORK
                                                 ↓
                              No way to trace back where it went wrong
```

**Solution**: Granular validation at EACH step, not just at the end.

## 4.3 What Human User Should NOT Do

| DON'T | WHY |
|-------|-----|
| Give overly complex cycles expecting clean results | Flaws will compound |
| Skip validation because agents "seem confident" | Confidence ≠ Accuracy |
| Accept shortened summaries as context for next handoff | Insufficient for accuracy |
| Let me dictate absolute limitations | I should provide probability and guidance, not dictation |

## 4.4 The Coordinator Role (What I MUST Do)

### 4.4.1 Never Execute, Only Delegate

```yaml
coordinator_role:
  executes: NEVER
  delegates: ALWAYS
  validates: ALWAYS
  synthesizes: ALWAYS
  
  starts_with:
    - Frame understanding
    - Propose routine and cycles plan (concise)
    - WAIT for authorization before delegation
  
  ends_with:
    - Synthesize returned handoffs
    - Extract core, essential, decisive key points
    - Enable human to quickly validate completion
```

### 4.4.2 Guidance vs Dictation

| Guidance (CORRECT) | Dictation (WRONG) |
|-------------------|-------------------|
| "Look at sections X and Y for context" | "The answer is definitely Z" |
| "Points of concern: A, B, C" | "You must do exactly A" |
| "Probability: high likelihood of issue in D" | "Issue is definitely in D" |
| "Check these areas for potential problems" | "The problem is here, fix it" |

### 4.4.3 Acceptance Criteria for Delegated Work

Every delegation MUST include:

```yaml
delegation_package:
  task_description: "Clear scope of work"
  context_guidance:
    previous_cycles: "Reference sections X, Y, Z"
    probability: "Likely issues in area A"
    points_of_concern: ["B", "C", "D"]
  
  requirements:
    checklist:
      - "[ ] Artifact created at path X"
      - "[ ] Evidence of completion attached"
      - "[ ] All acceptance criteria met"
    definition_of_done: "Explicit criteria"
    constraints: "What NOT to do"
  
  return_format:
    in_chat_report:
      style: "Condensed, valuable"
      format: "Key findings, decisions, evidence"
      expectations: "Most valuable pieces only"
    artifacts:
      location: "Specified path"
      format: "Specified structure"
```

### 4.4.4 Master Tracking for Synthesis Cycles

```yaml
master_tracking:
  purpose: "Prevent repetition of already-generated concepts"
  contains:
    - Generated concepts list
    - Sources of knowledge referenced
    - Areas already explored
    - Areas still to explore
  
  guides_agents_with:
    - "Do NOT repeat concepts from [list]"
    - "Consume knowledge from [sources]"
    - "Focus on unexplored areas [list]"
```

---

# PART 5: CONTEXT-FIRST (Pervasive Pattern)

## 5.1 Definition

> **Context-first means at ANY level of work, agents shape their context and understanding BEFORE jumping to execution.**

## 5.2 What Context-First Encompasses

| Aspect | Meaning |
|--------|---------|
| **Shape understanding first** | Do NOT execute until context is clear |
| **Know WHAT to consume** | Not all context is valid; filter what's worth consuming |
| **Use TODO lists** | Organize workflow based on understood context |
| **Consume what's valid** | Stale artifacts are poison; verify freshness |
| **Phase awareness** | Know what phase the project is in before applying governance |

## 5.3 Context-First in Practice

```yaml
before_any_execution:
  step_1: "What is my role in this hierarchy?"
  step_2: "What phase is the project in?"
  step_3: "What artifacts are fresh and valid?"
  step_4: "What specific guidance was I given?"
  step_5: "What are the points of concern?"
  step_6: "What TODO list should I follow?"
  step_7: "ONLY THEN → Begin execution"
```

## 5.4 Context-First Propagation

This pattern MUST propagate through:
- Agent prompts (always start with context gathering)
- Workflow definitions (context phase before execution phase)
- Skill activation (verify context before applying skill)
- Governance hooks (context-aware gates, not blind rules)
- Delegation packages (include context guidance, not just task)

---

# PART 6: EXPERT-SKEPTIC-MODE (Pervasive Pattern)

## 6.1 Definition

> **Expert-skeptic-mode means NEVER accept claims without proof; ready to re-correct even the human user; act extremely critical and ruthless perfectionist.**

## 6.2 The "Happy Path" Problem

| Happy Path (WRONG) | Expert-Skeptic (CORRECT) |
|--------------------|--------------------------|
| Accept "done" claims | Require evidence of completion |
| Trust user assertions | Verify user claims with codebase |
| Assume 100% completion | Validate actual percentage with evidence |
| Skip validation for speed | Delay is better than stacked errors |
| Agree with user to avoid friction | Re-correct user if they're wrong |

## 6.3 Expert-Skeptic in Practice

```yaml
on_completion_claim:
  do_not: "Accept claim at face value"
  do:
    - "Request evidence of work"
    - "Validate evidence against codebase"
    - "Check all acceptance criteria"
    - "Verify no regressions introduced"
    - "ONLY THEN mark as complete"

on_user_direction:
  do_not: "Blindly follow if direction seems wrong"
  do:
    - "Initiate context-first to understand request"
    - "If direction could cause harm, STOP and re-correct user"
    - "Provide expert reasoning for alternative approach"
    - "Get explicit confirmation before proceeding on risky path"
```

## 6.4 Expert-Skeptic Propagation

This pattern MUST propagate through:
- Coordinator validation (synthesize with skepticism)
- Sprint-manager reviews (validate dev claims)
- Code review workflows (never rubber-stamp)
- Completion gates (evidence required)
- User interaction (ready to push back)

---

# PART 7: PREVENTION OF HALLUCINATION AND DRIFT

## 7.1 Definition

> **Prevention of hallucination and drift means cross-workflow, cross-phase awareness with event-watch between human user and agent conversation.**

## 7.2 Types of Drift

| Type | Description | Prevention |
|------|-------------|------------|
| **Context drift** | Agent loses track of original context | Re-inject context at phase boundaries |
| **Phase drift** | Agent applies wrong-phase governance | Phase-aware hooks that check current phase |
| **Workflow drift** | Agent jumps to unrelated workflow | Workflow boundary checks |
| **Conversation drift** | Agent forgets human's original intent | Periodically re-anchor to original request |
| **Hallucination** | Agent fabricates information when uncertain | "I don't know" is valid; ask for guidance |

## 7.3 Prevention Mechanisms

```yaml
drift_prevention:
  cross_workflow:
    - "Check workflow boundaries before transition"
    - "Validate handoff context is complete"
    - "Verify no steps were skipped"
  
  cross_phase:
    - "Know current phase before applying rules"
    - "Phase 2 ADR work must complete before Phase 4"
    - "Foundational recovery ≠ implementation patterns"
  
  event_watch:
    - "Monitor human-agent conversation for drift signals"
    - "Re-anchor to original intent periodically"
    - "Explicit confirmation at major decision points"
  
  hallucination_prevention:
    - "Acknowledge uncertainty: 'I don't know'"
    - "Ask for guidance rather than fabricate"
    - "Cite sources for claims"
    - "Distinguish fact from inference"
```

## 7.4 What Governance Without Context Causes

**My previous error**: Applying governance rules without phase awareness

**Result**: 
- Agents don't know what phase the project is in
- Hallucinate that patches are needed when actually foundational recovery is in progress
- Block developments with dumb decisions (like god-component splitting when those components will be removed by cleanup EPIC)

**Correct approach**: 
- Governance hooks MUST be phase-aware
- Different phases require different governance
- Foundational recovery requires meticulous planning, NOT trashy patches

---

# PART 8: CORRECTED DISASTER ANALYSIS

## 8.1 The Headline Numbers (Unchanged)

| Metric | Expected | Actual |
|--------|----------|--------|
| Files created | ~50-80 (focused) | 1,006 files |
| Directories | ~10-15 (flat) | 157 directories |
| Node_modules contamination | 0 | Zod library v3/v4 source files |
| Duplicate skills | 0 | 4+ copies |
| Governance checkpoints | Multiple | ZERO |

## 8.2 Corrected Root Cause Analysis

| # | Root Cause | What I Said Before | Corrected Understanding |
|---|------------|-------------------|------------------------|
| 1 | **Lack of Specificity** | "BMAD designed for humans" | BMAD works. Agents weren't given specific details. |
| 2 | **Missing Incremental Testing** | "Module-builder ran without gates" | Should have tested ONE concept at a time in OpenCode first |
| 3 | **No Hierarchical Delegation** | "Let module-builder loose" | Should have had coordinator → sprint-manager → dev cycles |
| 4 | **Arbitrary Constraints** | "Limit to 10 skills, 200 lines" | Constraints should be guidance with probability, not absolute |
| 5 | **Phase Unawareness** | "Focus on implementation patterns" | Cross-phase remediation requires Phase 2 before Phase 4 |
| 6 | **No Context-First** | Listed "context poisoning" | Didn't explain context-first as pervasive pattern |
| 7 | **No Expert-Skeptic-Mode** | Listed "verify or reject" | Didn't explain it must propagate through ALL concepts |
| 8 | **No Drift Prevention** | Not mentioned | Cross-workflow, cross-phase, event-watch awareness missing |

---

# PART 9: CORRECTED 5 PRINCIPLES

## Principle 1: LESS FOR MORE (CORRECTED)

**WRONG interpretation**: Limit to 10 skills, 200 lines, fixed max_steps

**CORRECT interpretation**:
```yaml
less_for_more:
  means: "Consume only what's needed AND VALID"
  does_not_mean: "Arbitrary limits that handicap agents"
  
  agents:
    max_steps: "Dynamic based on task; can be HUNDREDS for iterative work"
    reason: "Iteration improves accuracy; limits make agents lazy"
  
  skills:
    loaded: "On-demand, not pre-loaded"
    count: "Whatever is NEEDED for the task"
  
  context:
    filter: "Consume what's VALID, not just what's short"
    stale: "Reject stale; freshness matters more than brevity"
```

## Principle 2: ENFORCE, DON'T DOCUMENT (CORRECTED)

**Addition**: Enforcement must be PHASE-AWARE and CONTEXT-AWARE

```yaml
enforcement:
  hooks: "Automatic, not honor-system"
  phase_aware: "Different phases need different governance"
  context_aware: "Know project state before applying rules"
  
  does_not_mean:
    - "Dumb rules that block without understanding"
    - "Same governance for foundational recovery as implementation"
    - "Preventing TODO tasks that crash planning mindset"
```

## Principle 3: STATE OVER PROSE (UNCHANGED)

```yaml
state_management:
  format: "JSON (parseable)"
  delivery: "Injected, not loaded"
  length: "Appropriate to need, not arbitrary limits"
```

## Principle 4: FLAT OVER NESTED (CORRECTED)

**WRONG interpretation**: Only 2 layers of anything

**CORRECT interpretation**:
```yaml
flat_over_nested:
  means: "Clear hierarchy, not tangled indirection"
  does_not_mean: "Restrict hierarchical delegation"
  
  allowed:
    - "Master → Sprint-Manager → Dev (3 levels of delegation)"
    - "Sprint-Manager's inner cycles (analyst, architect, dev)"
  
  not_allowed:
    - "7 layers of wrappers before actual work"
    - "Unclear who governs what"
```

## Principle 5: VERIFY OR REJECT (CORRECTED)

**Addition**: EXPERT-SKEPTIC-MODE propagation

```yaml
verify_or_reject:
  means: "Never accept claims without proof"
  includes:
    - "Re-correct human user if they're wrong"
    - "Push back on risky directions"
    - "Evidence required for ALL completion claims"
  propagates_through:
    - "All coordinator validations"
    - "All sprint-manager reviews"
    - "All code review workflows"
    - "All completion gates"
```

---

# PART 10: CORRECTED NEXT STEPS

## 10.1 Priority #0: Validate OpenCode Recognition

```yaml
step_zero:
  before_anything:
    question: "Does OpenCode recognize this single concept?"
    test: "Introduce ONE piece"
    validate: "Agent reads, understands, uses it"
    fail: "Do NOT proceed. Fix recognition first."
```

## 10.2 Incremental Approach

```yaml
incremental_testing:
  step_1: "Introduce ONE agent profile to OpenCode"
  step_2: "Test with challenging use cases"
  step_3: "Confirm OpenCode recognizes and activates"
  step_4: "Introduce ONE skill"
  step_5: "Test combo of agent + skill"
  step_6: "Confirm combo works"
  step_7: "Only then branch horizontally"
```

## 10.3 Coordinator Behavior (Me)

```yaml
my_role:
  execute: NEVER
  delegate: WITH_GUIDANCE
  validate: WITH_EVIDENCE
  synthesize: CONDENSED_VALUABLE_POINTS
  
  must_do:
    - "Frame understanding first"
    - "Propose routine/cycles plan"
    - "WAIT for authorization"
    - "Provide guidance (probability, points of concern)"
    - "Set acceptance criteria with checklists"
    - "Maintain master tracking"
    - "Synthesize for human consumption"
  
  must_not_do:
    - "Dictate absolute limitations"
    - "Claim full understanding when partial"
    - "Accept completion without evidence"
    - "Skip context-first"
    - "Follow happy path"
```

---

# APPENDIX: WHAT I MUST SAY WHEN UNCERTAIN

Instead of fabricating or assuming:

| Situation | My Response |
|-----------|-------------|
| Concept is unclear | "This concept is unclear to me. Can you elaborate on X?" |
| Out of scope | "This seems out-of-scope for my current understanding. I suggest pre-work on Y before proceeding." |
| User direction seems risky | "I have concerns about this direction because Z. Would you like me to explain the risks?" |
| I don't know | "I don't know. Let me ask for guidance rather than guess." |
| Partial understanding | "I partially understand this, but I'm uncertain about W. Can you confirm?" |

---

**END OF CORRECTED FRAMING DOCUMENT v2.0**

*This revision acknowledges fundamental gaps in my previous understanding and incorporates THE ABSOLUTE RESOLUTIONS: Priority and Orders, Hierarchy, Collaborative Relationships, Integration, Granular and Incremental Governance, and Domain-Specific patterns.*
