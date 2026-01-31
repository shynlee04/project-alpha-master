---
name: governance-signoff
description: Use when collecting multi-agent sign-offs for governance documents. Implements unanimous consensus protocol with structured debate for disagreement resolution. Requires ALL validators to approve.
allowed-tools:
  - read
  - write
---

# Governance Signoff Skill

<purpose>
Collect unanimous multi-agent sign-offs for governance documents.
Implements structured debate protocol when validators disagree.
All agents must approve for sign-off to pass.
</purpose>

## When to Use

- Final validation step before cascade completion
- Critical governance decisions requiring consensus
- Architecture Decision Records (ADR) requiring approval
- Any document requiring multi-stakeholder sign-off

## Required Agents

```yaml
validator_profiles:
  analyst-ext:
    domain: "Requirements, Tech Stack, Research"
    perspective: "Skeptic domain expert"
    scrutiny_areas:
      - completeness
      - accuracy
      - tech_validity
      - research_backing
    
  product-management-ext:
    domain: "User Experience, Business Value"
    perspective: "Ruthless user advocate"
    scrutiny_areas:
      - user_journey
      - blocking_routes
      - interface_clarity
      - business_alignment
    
  architect-ext:
    domain: "System Design, Engineering"
    perspective: "Engineering purist"
    scrutiny_areas:
      - clean_architecture
      - layer_boundaries
      - coupling_analysis
      - security_model
    
  dev-ext:
    domain: "Implementation, Testing"
    perspective: "Best-in-class practitioner"
    scrutiny_areas:
      - implementability
      - testing_strategy
      - error_handling
      - scope_realism
```

## Signoff Protocol

### Phase 1: Individual Review

Each agent reviews the document independently:

```yaml
review_template:
  agent: "{agent_id}"
  document: "{document_path}"
  reviewed_at: "{timestamp}"
  
  sections_reviewed:
    - section: "{section_name}"
      score: 0-100
      concerns: []
      evidence: []
  
  overall:
    score: 0-100
    verdict: "APPROVED" | "CONCERNS" | "REJECTED"
    blocking_issues: []
    minor_concerns: []
```

### Phase 2: Verdict Collection

```typescript
const collectVerdicts = async (sessionId: string): Promise<VerdictMap> => {
    const session = SignoffModule.sessions.get(sessionId);
    const verdicts: VerdictMap = {};
    
    for (const agent of session.required_agents) {
        const review = await requestAgentReview(agent, session.document);
        verdicts[agent] = {
            verdict: review.overall.verdict,
            score: review.overall.score,
            concerns: review.overall.blocking_issues,
            submitted_at: new Date().toISOString()
        };
    }
    
    return verdicts;
};
```

### Phase 3: Consensus Check

```yaml
consensus_rules:
  unanimous_approval:
    condition: "ALL agents verdict == APPROVED"
    result: "SIGNOFF_COMPLETE"
    
  has_concerns:
    condition: "ANY agent verdict == CONCERNS"
    result: "INITIATE_DISCUSSION"
    
  has_rejection:
    condition: "ANY agent verdict == REJECTED"
    result: "INITIATE_DEBATE"
```

### Phase 4: Debate Protocol (If Disagreement)

When validators disagree, structured debate begins:

#### Round 1: Position Statement
```yaml
debate_round_1:
  format: |
    ## Position Statement: {agent}
    
    **Verdict**: {verdict}
    **Core Concern**: {main_issue}
    
    ### Evidence
    - {evidence_1}
    - {evidence_2}
    
    ### Specific Objections
    1. {objection_1}
    2. {objection_2}
```

#### Round 2: Response to Objections
```yaml
debate_round_2:
  format: |
    ## Response: {agent} → {responding_to}
    
    ### Addressing Objections
    
    **On "{objection_1}"**:
    {response_with_evidence}
    
    **On "{objection_2}"**:
    {response_with_evidence}
    
    ### Updated Position
    {revised_verdict_if_any}
```

#### Round 3: Final Resolution
```yaml
debate_round_3:
  resolution_modes:
    consensus:
      description: "All parties reach agreement"
      action: "Proceed with sign-off"
      
    compromise:
      description: "Accept with documented concerns"
      action: "Add concerns to sign-off, proceed"
      conditions: ["No P0 blocking issues remain"]
      
    escalate:
      description: "Unresolved fundamental disagreement"
      action: "Pause cascade, request human decision"
      output: "ESCALATION.md with all positions"
```

## Signoff Artifact

Creates: `.opencode/governance/signoff-log.yaml`

```yaml
signoff_sessions:
  - id: "signoff-1706644800"
    document: "_bmad-output/planning-artifacts/prd.md"
    type: "prd"
    started_at: "2026-01-30T21:45:00Z"
    completed_at: "2026-01-30T22:15:00Z"
    
    verdicts:
      analyst-ext:
        verdict: "APPROVED"
        score: 97
        concerns: []
        submitted_at: "2026-01-30T21:50:00Z"
        
      product-management-ext:
        verdict: "CONCERNS"
        score: 92
        concerns:
          - "User onboarding flow lacks guided tour"
        submitted_at: "2026-01-30T21:55:00Z"
        resolved_in_round: 2
        final_verdict: "APPROVED"
        
      architect-ext:
        verdict: "APPROVED"
        score: 98
        concerns: []
        submitted_at: "2026-01-30T22:00:00Z"
        
      dev-ext:
        verdict: "APPROVED"
        score: 95
        concerns: []
        submitted_at: "2026-01-30T22:05:00Z"
    
    debate_log:
      rounds_used: 2
      resolved_concerns:
        - concern: "User onboarding flow lacks guided tour"
          resolution: "Added to scope as P1 enhancement"
          accepted_by: "product-management-ext"
    
    final_status: "APPROVED"
    consensus_type: "compromise"
```

## Agent Prompt Template

When requesting sign-off from an agent:

```markdown
## 🔏 SIGN-OFF REQUEST

**Document**: {document_path}
**Type**: {document_type}
**Your Role**: {agent_role}
**Cascade**: {cascade_id} (Step {current_step}/{total_steps})

### REVIEW MANDATE

As a **{perspective}** with expertise in **{domain}**, 
you must validate this document with extreme scrutiny.

### SCRUTINY AREAS

{scrutiny_areas_formatted}

### SCORING RUBRIC

| Score Range | Meaning |
|-------------|---------|
| 95-100 | Production-ready, no concerns |
| 85-94 | Minor polish needed, acceptable |
| 70-84 | Significant gaps, needs revision |
| <70 | Critical failures, block progression |

### YOUR VERDICT

Reply with exactly one of:
- **APPROVED** (score ≥ 95): All criteria met, no blocking issues
- **CONCERNS** (score 85-94): Minor issues that can be documented
- **REJECTED** (score < 85): Blocking issues that must be resolved

### REQUIRED OUTPUT

```yaml
verdict: APPROVED | CONCERNS | REJECTED
score: [0-100]
sections_reviewed:
  - section: "[name]"
    assessment: "[pass|warn|fail]"
    notes: "[specific feedback]"
blocking_issues: []  # List any P0 blockers
minor_concerns: []   # List P1-P2 items
evidence:
  - "[specific file/line/section reference]"
```

### EVIDENCE REQUIREMENT

All assessments must cite:
- Specific section or line numbers
- Exact quotes from document
- Reference to external validation (if applicable)
```

## Event Subscriptions

```yaml
signoff_events:
  - signoff.initiated     # Sign-off session started
  - signoff.verdict.submitted  # Agent submitted verdict
  - signoff.debate.started    # Disagreement detected
  - signoff.debate.round     # Debate round completed
  - signoff.resolved        # Consensus reached
  - signoff.escalated       # Human decision needed
  - signoff.completed       # All sign-offs collected
```
