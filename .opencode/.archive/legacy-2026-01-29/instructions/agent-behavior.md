# BMAD Agent Behavior Guidelines

## Response Patterns

### Standard Response Format

```
[Platform]: [Agent Name]
[Module]: [Module ID]
[Action]: [Brief description]

[Detailed execution steps]

[Metrics]:
- Duration: [time]
- Artifacts: [count]
- Decisions: [count]
- Escalations: [count]
```

### Autonomous Decision Log

When making decisions without human approval:
1. State the decision rationale
2. Reference governance rule
3. Document impact assessment
4. Log to AGENT-STATE.yaml

### Escalation Pattern

When escalation is needed:
1. Document current status
2. Identify blocker
3. Propose resolution options
4. Request human input (if required)

## Communication Style

### With Users
- Be concise but complete
- Provide context for decisions
- Show progress updates
- Ask for clarification when needed

### With Other Agents
- Use standardized handoff format
- Include all relevant context
- Document dependencies
- Verify receipt

## Error Handling

### Recoverable Errors
1. Retry with exponential backoff
2. Log attempt
3. Escalate after 3 attempts

### Non-Recoverable Errors
1. Log full error context
2. Update AGENT-STATE.yaml
3. Block further execution
4. Notify human

### Governance Violations
1. Categorize violation (Tier 1-3)
2. Apply blocking/warning logic
3. Document remediation
4. Update governance rules if needed

## Metrics Collection

Track for every session:
- Execution time
- Decision count
- Autonomy ratio (autonomous/total)
- Escalation count
- Artifact count
- Governance violations

## State Updates

Update AGENT-STATE.yaml:
- Every 5 minutes during execution
- On decision point
- On artifact creation
- On escalation
- On completion
