---
name: correct-course
description: Recovery handler when story is stuck or validation fails. Use when story exceeds 2x timebox, validation loops >3 times, or unresolvable blockers. Provides 5 recovery options split, defer, escalate, reduce scope, continue.
version: 2.0.0
# =============================================================================
# HIERARCHICAL TAXONOMY (BMAD Skills Manifest v3.0)
# =============================================================================
category: utility
parent: story-cycle
children: []
priority: 66
agents:
  - bmad-bmm-sm
triggers:
  - correct course
  - story stuck
  - recovery handler
  - /correct-course
---

# Utility: Correct Course

**description**: Recovery handler when story is stuck, validation fails repeatedly, or external blockers appear.

## When to Trigger

### Automatic Triggers
- Story exceeds 2x timebox estimate
- Validation loop count >3 on same step
- Unresolvable blockers identified

### Manual Triggers
- User requests `/correct-course {story_key}`
- Agent detects fundamental issues
- User says "story is stuck" or "help with story"

## Recovery Options

### Option A: Split Story

**When:** Story is too large or complex

**Actions:**
1. Identify clean split point
2. Create 2-3 smaller stories
3. Link dependencies
4. Close current story as "split"

**Example:**
```
Original: "Implement full authentication system"
Split into:
- Story A: Implement login form
- Story B: Implement token storage
- Story C: Implement logout
```

### Option B: Defer to Next Sprint

**When:** External blockers, insufficient information

**Actions:**
1. Document current state
2. Move to backlog
3. Set prerequisites for resumption

**Example:**
```
Defer reason: "Waiting for API design from backend team"
Prerequisites: "API spec must be approved"
```

### Option C: Escalate to Architect

**When:** Fundamental design issues, pattern uncertainty

**Actions:**
1. Create architect ticket
2. Provide full context
3. Await resolution before continuing

**Example:**
```
Escalation: "State management pattern unclear"
Context: "Need decision between Redux vs Zustand"
```

### Option D: Reduce Scope

**When:** Timebox exceeded, can ship partial value

**Actions:**
1. Identify must-have ACs
2. Move nice-to-haves to new story
3. Complete with reduced scope

**Example:**
```
Must-have: AC-1, AC-2 (core functionality)
Nice-to-have: AC-3, AC-4 (enhancements)
New story: "{story}-part-2"
```

### Option E: Continue with Acknowledged Risk

**When:** Issue is minor, acceptable workaround exists

**Actions:**
1. Document risk
2. Implement workaround
3. Add tech debt item

**Example:**
```
Risk: "Using temporary API that will be deprecated"
Workaround: "Plan migration for next quarter"
Tech debt: "Migrate to stable API"
```

## Process

### 1. Pause Current Workflow

```yaml
{story_key}:
  status: "needs-course-correction"
  paused_at: {timestamp}
  paused_step: {current_step}
```

### 2. Assess Situation

```markdown
## Course Correction Assessment

**Story:** {story_key}
**Assessed At:** {timestamp}
**Trigger:** {reason}

### Current State
- Step: {current_step}
- Attempts: {N}
- Time elapsed: {actual}/{estimated} hours
- Blockers: {list}

### Issues Identified
1. {issue_1}
   - Severity: {critical|major|minor}
   - Impact: {what_it_blocks}
```

### 3. Present Options to User

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          COURSE CORRECTION NEEDED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Story: {story_key}
Issue: {description}

Options:
[A] Split Story    - Break into 2-3 smaller stories
[B] Defer          - Move to next sprint
[C] Escalate       - Send to architect
[D] Reduce Scope   - Ship partial value
[E] Continue       - Acknowledge risk

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Select option: _
```

### 4. Execute Decision

Based on user selection, execute corresponding action.

### 5. Resume or Terminate

```yaml
# If resuming
{story_key}:
  status: "in-progress"
  course_correction_complete: true
  resumed_at: {timestamp}

# If terminating
{story_key}:
  status: {deferred|split|blocked}
  course_correction_complete: true
  closed_at: {timestamp}
```

## Course Correction Template

```markdown
## Course Correction Report

**Story:** {story_key}
**Date:** {timestamp}

### Trigger
{why_correction_was_needed}

### Assessment
{analysis_of_situation}

### Options Presented
1. **Split Story** - {pros/cons}
2. **Defer** - {pros/cons}
3. **Escalate** - {pros/cons}
4. **Reduce Scope** - {pros/cons}
5. **Continue** - {pros/cons}

### Decision
**Selected:** Option {X}
**By:** {user|agent}
**Reasoning:** {why_this_option}

### Outcome
{result_of_correction}

### Next Steps
{what_happens_next}
```

## Usage Example

```bash
User: /correct-course story=21-2-fix-auth

Agent: Story 21-2-fix-auth needs course correction

Current State:
- Step: 06-dev-story
- Attempts: 4 (exceeds threshold)
- Time: 65 min / 30 min estimate

Issue: Unable to implement auth without API spec

Options:
[A] Split Story - Separate API integration
[B] Defer - Wait for backend spec
[C] Escalate - Send to architect
[D] Reduce Scope - Mock auth for now
[E] Continue - Use placeholder API

Select option: _
```

## Decision Matrix

| Option | When to Use | Pros | Cons |
|--------|-------------|------|------|
| Split | Story too large | Clearer scope | More stories |
| Defer | External blockers | Proper planning | Delayed value |
| Escalate | Design issues | Expert input | Dependency |
| Reduce Scope | Timebox exceeded | Ship faster | Reduced value |
| Continue | Minor issues | Maintain flow | Tech debt |

---

**Source**: `_bmad/bmb/workflows/story-cycle/utils/_correct-course.md`
