# Epic 29: Agentic Execution Loop

**Status:** Backlog (Post-MVP)
**Priority:** P0
**Points:** 10
**Stories:** 4
**Created:** 2025-12-25
**Incident:** INC-2025-12-25-001
**Traceability:** MVP-3, MVP-4, MVP-5, MVP-6, MVP-7

## Epic Overview

Enable autonomous, multi-step agent execution in Via-gent IDE by implementing TanStack AI's `agentLoopStrategy`. Currently limited to 3 iterations as a temporary measure; this epic enables full iterative Plan → Act → Observe → Refine loops with intelligent termination.

## Business Value

- **User Impact:** Agents complete complex tasks without repeated prompting
- **Competitive Parity:** Matches capabilities of Cursor, Windsurf, Roo Code
- **Technical Enablement:** Unlocks multi-file refactoring, test-driven workflows
- **Risk Mitigation:** Prevents recurrence of iteration limitation issues

## Dependencies

- ✅ MVP-2: Chat Interface with Streaming
- ✅ MVP-3: Tool Execution - File Operations
- ✅ MVP-4: Tool Execution - Terminal Commands
- ✅ MVP-5: Approval Workflow
- ✅ MVP-6: Real-time UI Updates
- ✅ MVP-7: E2E Integration Testing

## Research Artifacts

- [Agentic Execution Loop Research](file:///_bmad-output/research/agentic-execution-loop-deep-research-2025-12-25.md)
- [Course Correction Analysis](file:///_bmad-output/course-corrections/read-file-and-agentic-execution-analysis-2025-12-25.md)
- [Agentic Coding Platforms Explanation](file:///_bmad-output/research/20205-12-25/agentic-coding-platforms-explanation.md)

---

## Stories

### Story 29-1: Agent Loop Strategy Implementation

**Points:** 3
**Priority:** P0
**Traceability:** MVP-3, MVP-4

#### Description
Implement core agent loop strategy with configurable iteration limits and state tracking.

#### Acceptance Criteria
- [ ] Add `agentLoopStrategy` to `use-agent-chat-with-tools.ts`
- [ ] Support configurable max iterations (default: 10)
- [ ] Track iteration count in component state
- [ ] Emit iteration events for UI updates
- [ ] Pass iteration context to tool execution

#### Technical Notes
```typescript
// In use-agent-chat-with-tools.ts
import { maxIterations } from '@tanstack/ai';

const chatOptions = useMemo(() => ({
  connection,
  tools: agentTools.getClientTools(),
  agentLoopStrategy: maxIterations(options.maxIterations ?? 10),
}), [connection, agentTools, options.maxIterations]);
```

---

### Story 29-2: Iteration UI & State Visualization

**Points:** 3
**Priority:** P1
**Traceability:** MVP-5, MVP-6

#### Description
Visualize agent iteration state in the chat interface.

#### Acceptance Criteria
- [ ] Display current iteration count (e.g., "Step 3/10")
- [ ] Show collapsible reasoning sections
- [ ] Add progress bar to approval overlay
- [ ] Implement pause/resume controls
- [ ] Visual indicator for iteration limits

#### Technical Notes
```typescript
// Event structure
interface AgentIterationEvent {
  iterationCount: number;
  maxIterations: number;
  toolCalled?: string;
  finishReason?: string;
}
```

---

### Story 29-3: Intelligent Termination Strategies

**Points:** 2
**Priority:** P1
**Traceability:** MVP-7

#### Description
Implement smart termination to prevent infinite loops.

#### Acceptance Criteria
- [ ] Combine multiple termination strategies
- [ ] Detect stuck states (3+ consecutive failures)
- [ ] Natural completion detection
- [ ] Timeout protection (60s max per loop)
- [ ] Per-agent iteration limits

#### Technical Notes
```typescript
const agentStrategy = combineStrategies([
  maxIterations(15),
  untilFinishReason(['stop']),
  stuckDetectionStrategy,
]);
```

---

### Story 29-4: Error Recovery & User Handoff

**Points:** 2
**Priority:** P1
**Traceability:** MVP-5, MVP-7

#### Description
Handle errors gracefully and enable user intervention.

#### Acceptance Criteria
- [ ] Automatic retry for transient errors
- [ ] Pause agent on persistent failures
- [ ] Provide clear error messages
- [ ] Suggest corrective actions
- [ ] Allow user to resume or abort

#### Technical Notes
```typescript
// Error recovery logic
if (error.isTransient && retryCount < 3) {
  retryOperation();
} else {
  pauseAgent();
  showErrorRecoveryUI();
}
```

---

## Definition of Done
- [ ] All stories completed with passing tests
- [ ] Multi-step agent task verified in browser (E2E)
- [ ] Iteration UI displays correctly
- [ ] Error recovery observable
- [ ] No infinite loops possible
- [ ] Documentation updated in AGENTS.md
- [ ] Screenshots of working feature captured

## Timeline
| Week | Milestone |
|------|-----------|
| Post-MVP Week 1 | Stories 29-1 + 29-2 |
| Post-MVP Week 2 | Stories 29-3 + 29-4 + E2E validation |

---

**Epic Owner:** BMAD Master
**Tech Lead:** Development Agent
**Created From:** Sprint Change Proposal SCP-2025-12-25-001
**Reference:** Course Correction INC-2025-12-25-001
