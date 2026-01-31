---
name: "conversation-threads-governance"
type: "governance-policy"
description: "Centralize and govern user-agent conversation threads"
version: "1.0.0"
critical: true
---

# Conversation Threads Governance

**description**: Centralize user-agent conversation threads to prevent scattered context and enable proper continuity.

## Problem Statement

Without centralized conversation management:
- **Scattered threads**: Same conversation across multiple files
- **Lost context**: Previous decisions not accessible
- **Repetition**: Same discussions repeated
- **No audit trail**: Can't trace how decisions were made
- **Handoff failures**: Agents can't pick up where others left off

## Governance Framework

### 1. Thread Registration

All conversations must be registered:

```yaml
conversation_registry:
  - thread_id: "{uuid}"
    title: "{conversation topic}"
    description: "{why this conversation exists}"
    participants: [agents and users involved]
    status: "{active|paused|completed|archived}"
    created_at: "{timestamp}"
    last_activity: "{timestamp}"

    context:
      workflow: "{associated workflow}"
      epic: "{if applicable}"
      story: "{if applicable}"
      artifacts_created: [list]

    handoff:
      ready_for: "{which agent should continue}"
      context_summary: "{what was accomplished}"
      next_steps: [what needs doing]
```

### 2. Thread Structure

```yaml
thread_template:
  metadata:
    thread_id: "{uuid}"
    title: "{Clear, descriptive title}"
    created_at: "{timestamp}"
    updated_at: "{timestamp}"
    status: "{active|paused|completed|archived}"

  participants:
    user: "{user_name}"
    agents: [list of agents involved]
    workflow: "{current workflow}"

  context:
    description: "{one-sentence goal}"
    background: [{reference to relevant context}]
    constraints: [limitations or requirements]

  conversation:
    - turn_id: "{incremental}"
      speaker: "{user|agent_name}"
      timestamp: "{timestamp}"
      content: "{message or decision}"
      artifacts: [files created or modified]
      decisions: [key decisions made]

  handoff:
    current_state: "{what's been accomplished}"
    pending_items: [what remains]
    next_agent: "{who should continue}"
    context_to_carry: [what to pass along]
```

### 3. Continuation Protocol

When an agent needs to continue a conversation:

```yaml
continuation_protocol:
  load_thread:
    - read_thread_by_id
    - verify_not_archived
    - check_handoff_readiness

  assess_state:
    - review_conversation_summary
    - identify_decisions_made
    - list_pending_items

  continue:
    - acknowledge_handoff
    - summarize_current_state
    - proceed_from_last_decision
```

### 4. Archiving Rules

```yaml
archiving_rules:
  archive_when:
    - workflow_completed
    - no_activity_for_72_hours
    - explicitly_marked_complete

  archive_format:
    - compress_thread_to_summary
    - extract_key_decisions
    - list_artifacts_created
    - store_in_{date}_archive/

  retention:
    - active_threads: "keep accessible"
    - completed_threads: "archive after 7 days"
    - archived_threads: "keep for 90 days"
    - then: "compress to historical record"
```

### 5. Handoff Protocol

```yaml
handoff_protocol:
  from_agent:
    - summarize_accomplishments
    - list_pending_items
    - identify_next_agent
    - create_handoff_artifact

  to_agent:
    - read_handoff_artifact
    - verify_context_clarity
    - acknowledge_receipt
    - continue_from_summary

  handoff_artifact:
    thread_id: "{uuid}"
    from: "{agent_name}"
    to: "{agent_name}"
    timestamp: "{timestamp}"

    summary:
      description: "{what was being worked on}"
      accomplished: [key achievements]
      decisions: [decisions made]

    pending:
      - item: "{what's left}"
        priority: "{level}"
        context: "{relevant details}"

    next_steps:
      - "{step 1}"
      - "{step 2}"
```

### 6. Quality Checks

```yaml
quality_checks:
  completeness:
    - thread_id_exists: true
    - participants_listed: true
    - description_defined: true
    - conversation_recorded: true

  consistency:
    - timestamps_sequential: true
    - no_duplicate_turns: true
    - handoffs_tracked: true

  accessibility:
    - thread_readable_by: [authorized agents]
    - archived_thread_accessible: true
    - search_index_current: true
```

## Thread Storage

```
_bmad-output/conversations/
├── active/
│   ├── {thread_id}.md         # Active conversation
│   └── handoffs/
│       └── {handoff_id}.md    # Handoff artifacts
├── archived/
│   └── {date}/
│       └── {thread_id}-summary.md
└── index.yaml                 # Thread registry
```

## Integration

**Used By**: All agents that participate in conversations

**Monitored By**: agent-rag-scanner

**Output**: Thread registry and handoff artifacts

## Critical Priority

Centralized conversation threads are CRITICAL for:
- Preventing context loss between agent handoffs
- Maintaining audit trail of decisions
- Avoiding repetitive discussions
- Enabling proper workflow continuation

**Every agent interaction MUST be tracked in a thread.**
