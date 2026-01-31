---
name: governance-verifier
description: Use when validating governance documents (PRD, Architecture, Epics). Provides multi-agent consensus verification with 95% strict passing gate. Loads multiple skeptic perspectives (analyst, PM, architect, dev) for comprehensive validation.
allowed-tools:
  - read
  - grep
  - glob
  - bash
  - write
---

# Governance Verifier Skill

<purpose>
Multi-agent consensus verification for governance documents with strict 95% passing gate.
This skill enforces iterative validation loops until unanimous sign-off from all validator agents.
</purpose>

## When to Use

- Validating PRD completeness and alignment
- Cross-validating Architecture against PRD
- Verifying Epic/Story decomposition accuracy
- Any governance document requiring multi-stakeholder approval

## Validator Perspectives

Each document must pass validation from ALL perspectives:

### 1. Analyst Perspective
**Role**: Skeptic domain expert, tech stack researcher
**Focus Areas**:
- Requirements completeness (all FRs and NFRs captured)
- Gap analysis (shallow requirements, missing edge cases)
- Tech stack validity (2026 tech trends, deprecated dependencies)
- Research verification (claims backed by MCP tool research)

**Passing Criteria**:
```yaml
analyst_checklist:
  - [ ] All user flows documented with entry/exit points
  - [ ] Edge cases explicitly addressed (error states, empty states)
  - [ ] Tech stack validated against current best practices
  - [ ] All claims verified with online research (Tavily, Exa, Context7)
  - [ ] No ambiguous requirements ("should", "might", "could")
```

### 2. Product Manager Perspective
**Role**: Ruthless user advocate, journey mapper
**Focus Areas**:
- User journey completeness (no dead ends)
- Interface intuitiveness (no confusing flows)
- Blocking routes (critical path coverage)
- Business value alignment (ROI justification)

**Passing Criteria**:
```yaml
pm_checklist:
  - [ ] Every user journey has clear start, middle, end
  - [ ] No blocking routes without fallback
  - [ ] Error messages provide actionable guidance
  - [ ] Onboarding flow is self-explanatory
  - [ ] Business metrics defined for success measurement
```

### 3. Architect Perspective
**Role**: Unapologetic engineering purist
**Focus Areas**:
- Clean architecture adherence
- Layer boundary violations
- Coupling analysis (no god stores/components)
- Performance implications documented
- Security considerations addressed

**Passing Criteria**:
```yaml
architect_checklist:
  - [ ] Layer boundaries clearly defined and enforced
  - [ ] No circular dependencies
  - [ ] State management strategy justified
  - [ ] API contracts well-defined
  - [ ] Security model documented
```

### 4. Senior Dev Perspective
**Role**: Best-in-class code practitioner
**Focus Areas**:
- Implementability (can this actually be built?)
- Testing strategy defined
- Error handling patterns
- Code organization clarity
- Documentation completeness

**Passing Criteria**:
```yaml
dev_checklist:
  - [ ] Clear implementation path for each requirement
  - [ ] Testing strategy covers critical paths
  - [ ] Error handling patterns defined
  - [ ] Tech debt implications acknowledged
  - [ ] Reasonable scope (no gold plating)
```

## Verification Process

### Step 1: Document Intake
```bash
# Read the governance document
document_path="$1"
document_type="$2"  # prd | architecture | epics | story

# Validate document exists and has required sections
if [ ! -f "$document_path" ]; then
    echo "ERROR: Document not found: $document_path"
    exit 1
fi
```

### Step 2: Extract Observable Truths
For each document section, identify **observable truths** that can be verified:

```yaml
# Example for PRD
observable_truths:
  - truth: "User can authenticate via email"
    verification: "Check for email auth flow in FRs"
    evidence_required: ["FR-*: Email authentication", "Sequence diagram"]
  
  - truth: "System supports offline mode"
    verification: "Check NFRs for offline handling"
    evidence_required: ["NFR-*: Offline", "Data sync strategy"]
```

### Step 3: Evidence Collection
For each truth, collect evidence using MCP tools:

```typescript
// Research verification
const evidence = await Promise.all([
    tavilySearch({ query: "best practices 2026 [topic]" }),
    context7Query({ libraryId: "[deps]", query: "[pattern]" }),
    exaCodeContext({ query: "[implementation pattern]" })
]);
```

### Step 4: Multi-Agent Scoring

Each validator assigns a score (0-100):

| Truth | Analyst | PM | Architect | Dev | Weighted |
|-------|---------|----|-----------|----|----------|
| Truth 1 | 95 | 90 | 100 | 95 | 95.0 |
| Truth 2 | 80 | 85 | 90 | 70 | 81.25 |
| ... | ... | ... | ... | ... | ... |
| **Total** | 87 | 88 | 95 | 82 | **88.0** |

**Passing Gate**: Total weighted score ≥ 95%

### Step 5: Consensus Resolution (If Disagreement)

When validators disagree (>10% variance):

1. **Round 1**: Each validator states position with evidence
2. **Round 2**: Respond to other validators' concerns
3. **Round 3**: Final verdict with compromise or escalation

```yaml
debate_protocol:
  max_rounds: 3
  resolution_modes:
    - consensus       # All agree
    - compromise      # Accept with noted concerns
    - escalate       # Human decision required
```

### Step 6: Generate Verification Report

```markdown
---
document: {path}
verified: {timestamp}
status: passed | gaps_found | human_needed
score: {N}/100
validators:
  analyst: { score: N, concerns: [...] }
  pm: { score: N, concerns: [...] }
  architect: { score: N, concerns: [...] }
  dev: { score: N, concerns: [...] }
---

# Verification Report

## Summary
- **Status**: {status}
- **Score**: {score}%
- **Consensus**: {unanimous | majority | escalated}

## Observable Truths

| # | Truth | Status | Evidence | Concerns |
|---|-------|--------|----------|----------|
| 1 | ... | ✓ VERIFIED | ... | ... |

## Gaps Found (if any)

| Gap | Severity | Blocking | Remediation |
|-----|----------|----------|-------------|
| ... | P0 | Yes | ... |

## Sign-off Log

| Validator | Verdict | Timestamp | Notes |
|-----------|---------|-----------|-------|
| Analyst | APPROVED | ... | ... |
```

## Integration with Plugin

This skill is invoked by the master-orchestrator via:

```typescript
// In experimental.chat.messages.transform
if (detectVerificationRequest(userMessage)) {
    StateSyncModule.emitEvent("governance.verification.requested", {
        document: extractDocumentPath(userMessage),
        type: detectDocumentType(userMessage)
    });
}
```

## Output Artifact

Creates: `_bmad-output/validation-reports/{document}-VERIFICATION-{date}.md`

## Event Subscriptions

This skill auto-triggers on:
- `file.edited` when path matches `_bmad-output/planning-artifacts/*.md`
- `session.created` when previous session had pending verification
- `cascade.step.completed` when step is `prd-validation` or `architecture-validation`
