---
description: 'BMAD Pre-Request Governance Check - Always run before remediation workflows'
---

# Pre-Request Governance Check

> **Always run this BEFORE remediation workflows (correct-course, fix, god store, etc.)**
> 
> This ensures governance documents are consistent before any remediation work.

---

## Step 1: Detect Intent

Your original request: `{user_prompt}`

Detect intent type:
- remediation: "correct-course", "fix", "god store", "remediate", "typescript error"
- planning: "sprint", "story", "plan", "epic", "backlog"
- implementation: "implement", "create", "develop", "feature"

**Detected Intent**: `{intent}`

---

## Step 2: Load Governance Documents

```bash
# Always load these documents
Read: bmm-workflow-status.yaml
Read: AGENTS.md
Read: _bmad-output/sprint-artifacts/sprint-status.yaml (if exists)
Read: _bmad-ext/state/LOOP_STATE.yaml (if exists)
```

### Document Values

| Document | Story ID | Epic ID | Status |
|----------|----------|---------|--------|
| `bmm-workflow-status.yaml` | `{workflow_story_id}` | `{workflow_epic_id}` | `{workflow_status}` |
| `AGENTS.md` (Quick Ref) | `{agents_story_id}` | `{agents_epic_id}` | - |
| `sprint-status.yaml` | In sprint: `{in_sprint}` | - | `{sprint_status}` |

---

## Step 3: Check Consistency

### Consistency Checks

```yaml
checks:
  - name: "Story ID Consistency"
    status: "{PASS/FAIL}"
    detail: "bmm-workflow-status.yaml has '{workflow_story_id}', AGENTS.md has '{agents_story_id}'"
    
  - name: "Epic ID Consistency"
    status: "{PASS/FAIL}"
    detail: "bmm-workflow-status.yaml has '{workflow_epic_id}', AGENTS.md has '{agents_epic_id}'"
    
  - name: "Sprint Inclusion"
    status: "{PASS/WARNING/N/A}"
    detail: "Story {workflow_story_id} {is/is not} in sprint"
```

### Result: `{PASSED WITH CONFLICTS / PASSED CLEANLY / FAILED}`

---

## Step 4: Take Action

### IF CONFLICTS DETECTED and remediation intent:

```
╔═══════════════════════════════════════════════════════════════════════╗
║  ⚠️ GOVERNANCE DOCUMENTS OUT OF SYNC                                ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║  Your request triggers a remediation workflow, but governance        ║
║  documents are inconsistent:                                         ║
║                                                                       ║
║  Conflicts:                                                          ║
║  {list_all_conflicts}                                               ║
║                                                                       ║
║  Fix BEFORE proceeding:                                              ║
║  1. Update bmm-workflow-status.yaml                                  ║
║  2. Update AGENTS.md Quick Reference section                         ║
║  3. Update sprint-status.yaml (if exists)                            ║
║                                                                       ║
║  [BLOCKED - Request not sent to AI]                                 ║
╚═══════════════════════════════════════════════════════════════════════╝
```

### IF CONFLICTS DETECTED but non-remediation intent:

```
⚠️  Documents have inconsistencies, but your request type allows proceeding:

Conflicts:
{list_conflicts}

Options:
[C] Continue anyway (proceed with warning)
[R] Fix documents first (run governance update workflow)
```

### IF NO CONFLICTS:

```
✅ Governance check passed.

Documents are consistent.
Proceeding with your request...
```

---

## Next Step

Once governance check passes, execute the original request:

```
Original request: {user_prompt}
```
