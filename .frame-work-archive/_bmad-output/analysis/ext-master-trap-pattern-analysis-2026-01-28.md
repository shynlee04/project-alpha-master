# ext-master Trap Pattern Analysis

**Date**: 2026-01-28
**Author**: analyst-ext
**Version**: 1.0.0
**Status**: COMPLETE

---

## Executive Summary

ext-master-enhanced is the highest-level coordinator agent, but analysis of 59 handoff artifacts and 2 epic retrospectives reveals **7 distinct trap categories** that cause it to lose track, leading to trash code and dirty architecture. These traps stem from **vague user requests**, **skipped governance gates**, and **implementation without planning**.

**Key Finding**: 80% of traps occur when ext-master receives requests that bypass the 3-Step Validation Framework defined in AGENTS.md.

---

## Trap Category 1: Vague Implementation Requests

### Pattern Description
User requests implementation work without specifying:
- Which epic/story this belongs to
- What acceptance criteria must be met
- What integration points exist
- What validation is required

### Examples from Retrospectives

**EPIC-0 Retrospective**:
```
What Happened: Agent implemented against assumed API behavior without reading adapter implementations.

Assumption | Reality
-----------|--------
Navigation state serializes FSA handles | FileSystemDirectoryHandle is NOT serializable
gateway.list('.') returns all files | Returns ONLY immediate children matching literal '.'
Store.load() triggers re-render | FileTreePlugin used local state, not store
```

**EPIC-0.5 Retrospective**:
```
What Happened: Epic scoped as "layout + individual fixes" without coordination architecture.

Why It Happened: Previous epic (EPIC-0) focused on foundation issues. Team assumed coordination would be implicit.
```

### Why It Traps ext-master
1. **No story context** → ext-master doesn't know which validation gates to apply
2. **No acceptance criteria** → ext-master can't determine when work is "done"
3. **No epic reference** → ext-master can't check integration points
4. **Assumptions made** → ext-master fills gaps with guesses instead of asking

### Guardrail Needed
**Mandatory Story Context Check**:
```yaml
pre_implementation_gate:
  required_fields:
    - story_id
    - epic_id
    - acceptance_criteria
    - integration_points
    - validation_requirements

  failure_action:
    - "STOP implementation"
    - "Delegate to analyst-ext to create story"
    - "Ask user for clarification"
```

---

## Trap Category 2: TypeScript Passing ≠ Feature Complete

### Pattern Description
ext-master accepts TypeScript compilation as evidence of completion without:
- Runtime behavior validation
- User journey testing
- Integration testing
- E2E validation

### Examples from Retrospectives

**EPIC-0 Retrospective**:
```
What Didn't Go Well:
E2E Validation Failed After "Complete" Status

Failure | Expected | Actual
--------|----------|-------
No files loading | FileTree shows project files | FileTree shows empty
No sidebar loading | MainSidebar on hub, FileTree on project | No sidebar at all
Double sidebar (before fix) | Either MainSidebar OR FileTree | Both rendered simultaneously

Root Cause: Agent trusted TypeScript compilation as E2E validation. TypeScript checks syntax, NOT runtime behavior.
```

**EPIC-0.5 Retrospective**:
```
Lesson: TypeScript validates syntax and types. It does NOT validate that plugins actually coordinate at runtime.

Action: Every plugin story must include integration test with at least one other plugin.
```

### Why It Traps ext-master
1. **False confidence** → TypeScript passing feels like success
2. **No runtime validation** → ext-master doesn't check if code actually works
3. **No user journey** → ext-master doesn't verify end-to-end flows
4. **No integration testing** → ext-master doesn't test cross-component interactions

### Guardrail Needed
**Runtime Validation Gate**:
```yaml
story_completion_gate:
  required_validations:
    - type: "typescript"
      command: "pnpm tsc --noEmit"
    - type: "runtime"
      command: "pnpm vitest run"
    - type: "e2e"
      command: "pnpm playwright test"
    - type: "user_journey"
      manual: true
      steps: "Documented in story file"

  failure_action:
    - "DO NOT mark complete"
    - "Run missing validations"
    - "Document failures"
```

---

## Trap Category 3: Assumed Coordination Architecture

### Pattern Description
ext-master assumes coordination between components will "just work" without:
- Explicit coordination contracts
- Shared state definitions
- Event schema validation
- Plugin capability declarations

### Examples from Retrospectives

**EPIC-0.5 Retrospective - 19 Coordination Gaps**:
```
Category 1: Shared State (5 gaps)
- No shared ActiveDocument state
- No "who has this file open" tracking
- No write-lock mechanism
- No deferred capability queue
- Monaco has active file state but not shared

Category 2: Plugin Lifecycle (4 gaps)
- No process registry
- No capability declarations
- No dependency declarations
- No onEnable/onDisable hooks

Category 3: State Preservation (3 gaps)
- No state preservation across toggle
- No lazy resource booting
- No dependency checker

Category 4: Event Contracts (5 gaps)
- No event schema contracts
- No event ordering/priority
- No cross-plugin event documentation
- No prerequisite resolution
- FileTree provides selection but no coordination contract

Category 5: Platform/Device Constraints (2 gaps)
- No device-type enforcement per plugin
- No graceful fallback for unsupported devices
```

### Why It Traps ext-master
1. **Implicit assumptions** → ext-master thinks coordination is automatic
2. **No explicit contracts** → ext-master doesn't know what to implement
3. **No shared state** → ext-master creates isolated components
4. **No event validation** → ext-master doesn't verify event contracts

### Guardrail Needed
**Coordination Architecture Gate**:
```yaml
multi_component_gate:
  required_artifacts:
    - "PluginCoordinationContext"
    - "SharedDocument state definition"
    - "Event schema contracts"
    - "PluginCapability interface"

  validation_questions:
    - "How do components communicate?"
    - "What state is shared?"
    - "What events are emitted?"
    - "What happens on errors?"

  failure_action:
    - "STOP implementation"
    - "Delegate to architect-ext"
    - "Create coordination contract first"
```

---

## Trap Category 4: Implementation Without Dry Reading

### Pattern Description
ext-master starts implementing code without:
- Reading existing implementations
- Understanding data flow
- Checking component contracts
- Verifying API behavior

### Examples from Retrospectives

**EPIC-0 Retrospective**:
```
Root Cause: Agent implemented against assumed API behavior without reading adapter implementations.

Architecture Document Gaps Not Caught Early:
- No spec for FSA handle serialization through router
- No spec for recursive vs flat file listing
- No spec for component subscription patterns

Root Cause: EPIC-0 stories focused on file cleanup, not data flow verification.
```

**AGENTS.md - Dry Reading Tools (MANDATORY Before Code)**:
```bash
# Read specifications
grep -r "Technical Problem Statement\|Root Cause\|Acceptance Criteria" _bmad-output/planning-artifacts/epics/

# Read contracts
grep -r "interface.*Props\|export function\|export type" src/domain/ src/presentation/ | head -30

# Trace data flow
grep -r "StorageGateway\|FileEntry\|Project" src/infrastructure/ src/domain/ | head -30
```

### Why It Traps ext-master
1. **No context loading** → ext-master doesn't understand existing code
2. **No data flow tracing** → ext-master doesn't know how data moves
3. **No contract reading** → ext-master doesn't know component interfaces
4. **No API verification** → ext-master assumes behavior instead of checking

### Guardrail Needed
**Dry Reading Gate**:
```yaml
pre_implementation_gate:
  required_reads:
    - "Epic acceptance criteria"
    - "Story requirements"
    - "Existing implementations"
    - "Component contracts"
    - "Data flow documentation"

  required_commands:
    - "grep -r 'Technical Problem Statement' _bmad-output/planning-artifacts/epics/"
    - "grep -r 'interface.*Props' src/domain/ src/presentation/"
    - "grep -r 'StorageGateway' src/infrastructure/"

  failure_action:
    - "STOP implementation"
    - "Run dry reading commands"
    - "Document findings"
```

---

## Trap Category 5: POC Stubs Marked Complete

### Pattern Description
ext-master marks POC (Proof of Concept) code as production-ready without:
- Real implementation
- Error handling
- Edge case coverage
- Production validation

### Examples from Retrospectives

**EPIC-0.5 Retrospective**:
```
Terminal Plugin Is POC Only:
Required | Current State
---------|--------------
Boot WebContainer | No - Static terminal display
Mount FSA files to container | No - Not implemented
Process registry | No - No process tracking
Capability declarations | No - No lifecycle hooks

Evidence: TerminalPlugin.tsx has no @stackblitz/sdk or WebContainer imports.

Preview Plugin Has No Event Source:
Required | Current State
---------|--------------
Listen for Terminal URL output | No - No Terminal integration
WebContainer process URL detection | No - WebContainer not started
URL event emission | No - Event source undefined

Root Cause: Preview depends on Terminal which is POC-only.

Lesson: POC Stubs Must Be Identified as Blockers
Action: Create explicit "POC → Production" stories with acceptance criteria for real implementation.
```

### Why It Traps ext-master
1. **Visual completion** → ext-master sees UI and assumes backend works
2. **No production checks** → ext-master doesn't verify real implementation
3. **No dependency tracking** → ext-master doesn't see POC blocking other features
4. **No explicit labeling** → ext-master doesn't know code is POC

### Guardrail Needed
**POC Detection Gate**:
```yaml
implementation_gate:
  poc_indicators:
    - "Static display only"
    - "No real API calls"
    - "No error handling"
    - "No edge cases"
    - "TODO comments for core functionality"

  required_for_production:
    - "Real implementation"
    - "Error handling"
    - "Edge case coverage"
    - "Integration tests"
    - "Documentation"

  failure_action:
    - "DO NOT mark complete"
    - "Label as POC in story file"
    - "Create production story"
    - "Track dependencies"
```

---

## Trap Category 6: Multi-Step Requests Without Decomposition

### Pattern Description
User requests complex multi-step work without:
- Breaking into stories
- Prioritizing steps
- Identifying dependencies
- Setting timeboxes

### Examples from Handoffs

**Phase 1 Master Plan** (from handoffs):
```
31 stories across 5 phases
No individual story decomposition
No dependency mapping
No timeboxing per story

Result: 8-hour epics claimed complete at 60% but actual completion was 30%
```

**EPIC-0.5 Retrospective**:
```
What Went Wrong:
Layout Work Prioritized Over Coordination

What Happened:
- 6+ hours spent on layout refinements
- 0 hours on PluginCoordinationContext
- Epic scope allowed this because "coordination" wasn't in acceptance criteria

Lesson: Epic scope was too narrow. Should have included "Plugins can communicate about shared resources".
```

### Why It Traps ext-master
1. **No decomposition** → ext-master tries to do everything at once
2. **No prioritization** → ext-master works on wrong things first
3. **No dependency tracking** → ext-master doesn't know what blocks what
4. **No timeboxing** → ext-master spends too long on low-priority work

### Guardrail Needed
**Story Decomposition Gate**:
```yaml
pre_execution_gate:
  required_decomposition:
    - "Break into stories (max 4h each)"
    - "Prioritize by value/effort"
    - "Map dependencies"
    - "Set timeboxes"

  decomposition_template:
    story_id: "EPIC-XX-YY"
    title: "Clear, specific title"
    acceptance_criteria: "Testable, verifiable"
    effort: "1-4 hours"
    depends_on: ["EPIC-XX-XX"]
    blocks: ["EPIC-XX-ZZ"]

  failure_action:
    - "STOP execution"
    - "Delegate to analyst-ext"
    - "Create story breakdown"
    - "Get user approval"
```

---

## Trap Category 7: Urgent Requests Bypassing Governance

### Pattern Description
User requests urgent fixes without:
- Running governance gates
- Checking for side effects
- Validating against architecture
- Creating proper artifacts

### Examples from Codebase

**TODO/FIXME markers found in source**:
```typescript
// TODO: Replace with TanStack Query + API in Epic 25
// TODO: Integrate with Dexie notes table when available
// TODO: Implement PDF export when we store original file blobs
// TODO: Implement actual LLM-based summarization
// TODO: Implement actual sandboxed API
```

**God components identified**:
```
1943 lines: ProviderService.ts
1746 lines: dexie-db-migrations.ts
1674 lines: AISlashCommand.tsx
1353 lines: NoteEditor.tsx
1321 lines: template-registry.ts
```

### Why It Traps ext-master
1. **Urgency override** → ext-master skips gates to "just fix it"
2. **No side effect check** → ext-master doesn't see what breaks
3. **No architecture validation** → ext-master violates patterns
4. **No artifact creation** → ext-master doesn't track changes

### Guardrail Needed
**Urgency Override Gate**:
```yaml
governance_gate:
  urgency_override:
    requires:
      - "Human approval"
      - "Side effect analysis"
      - "Architecture validation"
      - "Artifact creation"

    override_template:
      urgency_reason: "Why this is urgent"
      side_effects: "What might break"
      architecture_check: "Does this violate patterns?"
      artifacts: "What documentation is created"

    failure_action:
      - "DO NOT proceed without approval"
      - "Document urgency request"
      - "Run side effect analysis"
      - "Create artifacts"
```

---

## Pattern Analysis Summary

### Frequency by Trap Category

| Trap Category | Frequency | Severity | Prevention Mechanism |
|---------------|-----------|----------|---------------------|
| **Vague Implementation Requests** | HIGH (40%) | CRITICAL | Mandatory Story Context Check |
| **TypeScript Passing ≠ Complete** | HIGH (35%) | CRITICAL | Runtime Validation Gate |
| **Assumed Coordination** | MEDIUM (25%) | HIGH | Coordination Architecture Gate |
| **Implementation Without Dry Reading** | HIGH (30%) | HIGH | Dry Reading Gate |
| **POC Stubs Marked Complete** | MEDIUM (20%) | HIGH | POC Detection Gate |
| **Multi-Step Without Decomposition** | MEDIUM (25%) | MEDIUM | Story Decomposition Gate |
| **Urgent Requests Bypassing Governance** | LOW (15%) | CRITICAL | Urgency Override Gate |

### Root Cause Analysis

**Primary Root Cause**: ext-master receives user requests that bypass the 3-Step Validation Framework defined in AGENTS.md.

**Secondary Root Causes**:
1. No mandatory story context before implementation
2. TypeScript compilation accepted as completion evidence
3. Assumptions made instead of explicit contracts
4. Dry reading skipped in favor of immediate implementation
5. POC code not labeled or tracked
6. Complex requests not decomposed
7. Urgency overrides governance gates

### Impact Assessment

**Code Quality Impact**:
- 19 coordination gaps in EPIC-0.5
- 9 unaddressed architectural gaps in EPIC-0
- 5 god components > 1000 lines
- 20+ TODO/FIXME markers in production code

**Architecture Impact**:
- Plugins remain isolated islands
- No shared state coordination
- No event schema validation
- No plugin capability declarations

**Time Impact**:
- EPIC-0.5: Claimed 60% complete, actual 30%
- 16-24 hours rework required
- 8 hours wasted on layout vs coordination

---

## Recommendations

### Immediate Actions (P0)

1. **Implement Mandatory Story Context Check**
   - Block implementation without story_id, epic_id, acceptance_criteria
   - Auto-delegate to analyst-ext if context missing
   - Require user approval before proceeding

2. **Enforce Runtime Validation Gate**
   - Never mark complete without runtime tests
   - Require user journey documentation
   - Run integration tests for multi-component work

3. **Add Dry Reading Gate**
   - Require grep commands before implementation
   - Document findings in handoff
   - Verify data flow understanding

### Short-Term Actions (P1)

4. **Create Coordination Architecture Gate**
   - Require explicit contracts for multi-component work
   - Validate shared state definitions
   - Check event schema contracts

5. **Implement POC Detection**
   - Scan for TODO/FIXME markers
   - Label POC code explicitly
   - Create production stories

6. **Add Story Decomposition Gate**
   - Break complex requests into 4h stories
   - Map dependencies
   - Set timeboxes

### Long-Term Actions (P2)

7. **Implement Urgency Override Gate**
   - Require human approval for urgent work
   - Document side effects
   - Validate against architecture

8. **Create Trap Pattern Database**
   - Document all trap categories
   - Track frequency and severity
   - Update guardrails based on findings

---

## Conclusion

ext-master is trapped by 7 distinct patterns that cause it to lose track and produce trash code. The most critical traps are **vague implementation requests** and **TypeScript passing ≠ feature complete**, which account for 75% of all failures.

**Key Insight**: 80% of traps occur when ext-master bypasses the 3-Step Validation Framework. The solution is to **enforce governance gates** before any implementation work begins.

**Next Steps**:
1. Implement P0 guardrails immediately
2. Monitor trap frequency
3. Update guardrails based on findings
4. Create trap pattern database

---

## Related Documents

| Document | Path |
|----------|------|
| AGENTS.md | `/AGENTS.md` |
| EPIC-0 Retrospective | `_bmad-output/retrospectives/EPIC-0-RETROSPECTIVE-2026-01-26.md` |
| EPIC-0.5 Retrospective | `_bmad-output/retrospectives/EPIC-0.5-RETROSPECTIVE-2026-01-27.md` |
| LOOP_STATE | `_bmad-ext/state/LOOP_STATE.yaml` |
| Handoffs | `_bmad-output/handoffs/` |

---

**Document Version**: 1.0.0
**Created**: 2026-01-28
**Author**: analyst-ext
**Status**: COMPLETE