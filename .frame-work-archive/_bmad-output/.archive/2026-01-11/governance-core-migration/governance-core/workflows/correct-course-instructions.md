# Correct Course - Adaptive Governance Instructions

**description:** Execute three enforcement checks before any work proceeds

**Critical Distinction:**
- This is NOT BMAD's sprint correct-course (which modifies epics/stories)
- This IS governance enforcement (three checks before work)

---

## Enforcement Check 1: Context First (Two-Step Hook)

### Step A: Gather Context

**Action:** Scan targeted domains (not entire codebase)

```yaml
# Load domains from governance-core/config/domains.yaml
# Priority domains for this task:
# 1. agent_ai_rag_multimodality (P0) - if agent/AI work
# 2. file_structure_governance (P0) - if creating/modifying files
# 3. state_persistence (P0) - if touching stores/state
# 4. domain - cross-domain analysis
# ... other domains as relevant
```

**Slicing Strategy:**
- Relevance: What matters for THIS task?
- Depth: Determine based on complexity (Quick Patch vs Independent Feature vs Architectural Conflict)
- Token Budget: Target <5K tokens (97% reduction from 150K full load)

**Integration with LOOP_STATE:**
```yaml
# Check staleness before loading context
anchor:
  staleness_threshold_hours: 4
  if: (now - human_intent_timestamp) > staleness_threshold_hours
  then: HALT and require re-confirmation
```

### Step B: Contextualize Prompt

**Action:** Auto-transform human prompt with gathered context

**Output:** Improved prompt ready for new session

---

## Enforcement Check 2: Agent as Expert

### Error Category Determination

**Quick Patch** (Immediate fix allowed):
- Single component change
- No cross-domain impact
- No state boundary violation
- Test coverage exists

**Independent Feature** (Isolated workflow):
- New feature or self-contained change
- Minimal cross-domain impact
- Clear boundaries
- Can be tested independently

**Architectural Conflict** (Comprehensive remediation required):
- Cross-domain impact
- State boundary violation
- Affects multiple features
- Requires journey mapping

### Action Decision

| Finding | Action |
|---------|--------|
| Quick Patch | ALLOW - Direct fix, no gate |
| Independent Feature | WARN - Lightweight gating |
| Architectural Conflict | BLOCK - Require comprehensive remediation |

**Detection Logic:**
```typescript
function detectConflict(issue: string): Category {
  // Check domain overlap
  const affectedDomains = analyzeDomains(issue);
  if (affectedDomains.length > 2) return "architectural_conflict";

  // Check state boundaries
  if (touchesStateBoundary(issue)) return "architectural_conflict";

  // Check journey impact
  if (affectsUserJourney(issue)) return "architectural_conflict";

  return "quick_patch";
}
```

---

## Enforcement Check 3: Research Required

### Auto-Trigger Research When:

1. **Technology Selection** - Choosing between alternatives (React vs Vue, TanStack vs React Router)
2. **Performance Trade-off** - Optimizing for speed vs bundle size vs memory
3. **Anti-Pattern Detection** - "This approach will cause X problem"
4. **Framework Comparison** - Integrating new library/framework
5. **Breaking Changes** - API changes affecting consumers
6. **Security Implications** - Auth, data handling, XSS risks

### Research Output

- Confidence scores
- Source citations
- Recommended approach
- Risk warnings

---

## Governance Report Generation

**After all three checks complete:**

```
┌─────────────────────────────────────────────────────────────┐
│                    GOVERNANCE REPORT                        │
├─────────────────────────────────────────────────────────────┤
│ Status: BLOCK / WARN / ALLOW                                │
│                                                              │
│ Context Check:    ✅ PASS (3 domains, 47 files, 2.3K tokens) │
│ Expert Analysis:  ⚠️ WARN  (Architectural conflict detected) │
│ Research Status:  ✅ COMPLETE (2 sources, high confidence)  │
│                                                              │
│ Recommendation:                                             │
│ "This change affects STATE, SYNC, and UX domains.           │
│  Quick patch will create circular dependency.               │
│  Required: Comprehensive remediation via Journey Mapper.    │
│  Estimated: 4-6 hours vs 30 min for quick patch."          │
│                                                              │
│ Human Override: Type "I am aware but..." to proceed anyway. │
└─────────────────────────────────────────────────────────────┘
```

---

## Human Override Pattern

**User Override:** "I am aware but..."

**Response:**
```
⚠️ PROCEED WITH CAUTION - Logged as technical debt
  Debt Ticket: DEBT-{uuid}
  Risk Multiplier: 1.5x (architectural_conflict)
  Estimated Remediation: 8-12 hours

  Dependencies skipped:
    - Stage 1: Basic Agent Tools
    - Context isolation not established

  Known risks:
    - Cross-workspace context leakage
    - No permission boundaries for CRUD
    - Thread storage may conflict with future design

  Review required before Stage 2 implementation.
```

**Debt Tracking:**
- All overrides logged with UUID
- Risk multiplier based on stages skipped
- Remediation estimate provided
- Dependencies skipped documented

---

## Stage Gating Integration

### When User Requests Stage N Feature

**Example:** User: "Add RAG context management for agents"

**Gatekeeper Response:**
```
🔒 BLOCKED - Stage 2 feature requested
  Current Stage: 0 (Governance Foundation)
  Required: Complete Stage 1 (Basic Agent Tools) first

  Stage 0 Progress:
  ✅ governance-core module structure
  ✅ config files (8 files)
  ✅ policy files (4 files)
  ⏳ P0 scanners (2/6 complete)

  To unlock Stage 1, complete Stage 0 scanners first.

  Type 'I am aware but...' to proceed with warning (logged as debt).
```

### Stage Transition Criteria

| Stage | Entry Criteria | Exit Criteria |
|-------|----------------|---------------|
| 0: Governance | Project start | All 6 P0 scanners operational |
| 1: Basic Tools | Stage 0 complete | Read-only + CRUD tools tested |
| 2: RAG | Stage 1 complete | Context isolation verified |
| 3: Multimodal | Stage 2 complete | Multimodal routing tested |
| 4: Advanced AI | Stage 3 complete | Multi-agent orchestration safe |

---

## Workflow Completion

**When ALLOW status:**
- Proceed with original task
- Register task in LOOP_STATE
- Update artifact registry if needed

**When WARN status:**
- Display warning to user
- Require explicit acknowledgment
- Log decision for audit trail

**When BLOCK status:**
- Stop workflow
- Display full governance report
- Offer "I am aware but..." override
- If override: Log debt and proceed

---

**Workflow Owner:** governance-core
**Integrates With:**
- `_bmad-ext/state/LOOP_STATE.yaml`
- `_bmad-ext/state/ARTIFACT_REGISTRY.yaml`
- `_bmad-ext/modules/arc-v2/workflows/diagnostic-first.md`

**Last Updated:** 2026-01-10
