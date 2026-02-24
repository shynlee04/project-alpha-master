# OpenCode Plugin Event Research & Compaction Enhancement

**Date**: 2026-01-31T05:50:00+07:00  
**Purpose**: Research event payloads and enhance compaction for agent intelligence

---

## Part 1: Event Reference (What Each Event Exposes)

### Session Events

| Event | Exposed Properties | Enhancement Opportunity |
|-------|-------------------|------------------------|
| `session.created` | `info: Session.Info` (id, title, parentID, created, updated) | Track parent-child hierarchy for delegation |
| `session.compacted` | `sessionID`, compaction result | Archive pre-compaction state to brain |
| `session.deleted` | `sessionID` | Trigger brain archive |
| `session.idle` | `sessionID` | Detect completion claims |
| `session.status` | `sessionID`, status enum | Track active/idle transitions |
| `session.updated` | `sessionID`, delta | Monitor title/metadata changes |
| `session.error` | `sessionID`, error details | Log failures to brain |
| `session.diff` | `sessionID`, `FileDiff[]` | Track files changed per session |

### Tool Events

| Event | Exposed Properties | Enhancement Opportunity |
|-------|-------------------|------------------------|
| `tool.execute.before` | `tool`, `sessionID`, `params` (full args) | Intercept delegations, track tool usage |
| `tool.execute.after` | `tool`, `sessionID`, `params`, `output` | Validate completion, record artifacts |

### Message Events

| Event | Exposed Properties | Enhancement Opportunity |
|-------|-------------------|------------------------|
| `message.updated` | `sessionID`, `messageID`, `content` | Detect completion patterns in text |
| `message.part.updated` | `part: { sessionID, messageID, type, content }` | Fine-grained content tracking |

### File Events

| Event | Exposed Properties | Enhancement Opportunity |
|-------|-------------------|------------------------|
| `file.edited` | `path`, `changes` | Track artifact/code file changes |
| `file.watcher.updated` | `path` | Detect external file changes |

### Todo Events

| Event | Exposed Properties | Enhancement Opportunity |
|-------|-------------------|------------------------|
| `todo.updated` | `sessionID`, `content`, `status` | Track task decisions for brain |

---

## Part 2: Compaction Hook Deep Dive

### Source Code Analysis (OpenCode v1.x)

```typescript
// packages/opencode/src/session/compaction.ts (lines 1501-1510)
const compacting = await Plugin.trigger(
  "experimental.session.compacting",
  { sessionID: input.sessionID },  // INPUT
  { context: [], prompt: undefined },  // OUTPUT (mutable)
)

const defaultPrompt = "Provide a detailed prompt for continuing..."
const promptText = compacting.prompt ?? [defaultPrompt, ...compacting.context].join("\n\n")
```

### Key Findings

1. **Input**: Only `sessionID` is provided
2. **Output**: `context: string[]` (array to push) OR `prompt: string` (full replacement)
3. **If `prompt` is set**: `context` array is IGNORED
4. **Default behavior**: Joins defaultPrompt + context entries

### Current Shortcomings (from example compact message)

| Issue | Evidence | Root Cause |
|-------|----------|------------|
| No upstream context | Agent didn't know about parent session delegations | `session.children()` not called |
| No cross-session awareness | Worked on WRONG epic | No integration with workflow-status.yaml |
| False completion acceptance | Claimed stories 3-10 done | No validation gate in compaction |
| Agent drift not caught early | Implemented EPIC-04 instead of 02/03 | No intent anchor verification |

---

## Part 3: Enhanced Compaction Module Design

### Architecture: Split into 3 Phases

```
Phase A: PRE-COMPACT COLLECTION
├── Gather child session summaries (client.session.children)
├── Fetch workflow-status.yaml, sprint-status.yaml
├── Extract pending validations from ValidationGateModule
└── Build hierarchical context object

Phase B: INTELLIGENT FILTERING  
├── Filter stale artifacts (>24h not referenced)
├── Detect intent drift (compare turn_1 to current work)
├── Score decisions (only include final, non-superseded)
└── Identify validation gaps

Phase C: PROMPT GENERATION
├── Original intent anchor (VERBATIM turn 1-2)
├── Hierarchical agent context (parent → child chain)
├── Artifact LINKS only (not content)
├── Explicit blockers and pending validations
```

### New Module: HierarchicalCompactionEnhancer

```typescript
// Add to master-orchestrator.ts or new plugin
const HierarchicalCompactionEnhancer = {
  async enhance(input: { sessionID: string }, client: Client) {
    // 1. Get child sessions for this parent
    const children = await client.session.children({ path: { id: input.sessionID } });
    
    // 2. Build delegation chain
    const chain = children.map(c => ({
      id: c.id,
      title: c.title,
      agent: extractAgentFromTitle(c.title),
      status: c.status,
    }));
    
    // 3. Get workflow status
    const workflowStatus = await this.readWorkflowStatus();
    const sprintStatus = await this.readSprintStatus();
    
    // 4. Build hierarchical context
    return {
      delegation_chain: chain,
      workflow_phase: workflowStatus.current_phase,
      sprint_status: sprintStatus,
      pending_validations: ValidationGateModule.getPending(input.sessionID),
    };
  }
};
```

### Enhanced Compaction Hook

```typescript
"experimental.session.compacting": async (input, output) => {
  const ctx = await HierarchicalCompactionEnhancer.enhance(input, client);
  
  // Inject hierarchical context BEFORE default sections
  output.context.unshift(`
## HIERARCHICAL SESSION CONTEXT

### Parent-Child Delegation Chain
${yaml.stringify(ctx.delegation_chain)}

### Workflow Status (Verified)
Current Phase: ${ctx.workflow_phase}
Sprint Status: ${ctx.sprint_status.current_story}

### PENDING VALIDATIONS (BLOCK ON THESE)
${ctx.pending_validations.map(v => `- ${v.type}: ${v.reason}`).join('\n')}
`);

  // Original compaction prompt continues...
};
```

---

## Part 4: Custom Tool for Cross-Session Intelligence

### Tool: `session-context-loader`

```typescript
import { tool } from "@opencode-ai/plugin";

export default tool({
  description: `Load context from parent/child sessions in delegation hierarchy.
  Use when: Supreme Coordinator needs to understand what sub-agents did.`,
  args: {
    sessionID: tool.schema.string().describe("Session to get context for"),
    direction: tool.schema.enum(["parent", "children", "siblings"]),
  },
  async execute(args, context) {
    // Use SDK to fetch related sessions
    const client = await getClient();
    
    if (args.direction === "children") {
      const children = await client.session.children({ 
        path: { id: args.sessionID } 
      });
      
      return children.map(c => ({
        id: c.id,
        title: c.title,
        summary: c.summary, // If available
        status: c.status,
      }));
    }
    
    if (args.direction === "parent") {
      const session = await client.session.get({ 
        path: { id: args.sessionID } 
      });
      if (!session.parentID) return "No parent session";
      
      return client.session.get({ path: { id: session.parentID } });
    }
  },
});
```

---

## Part 5: Implementation Priority

| Priority | Enhancement | Impact | Effort |
|----------|-------------|--------|--------|
| P0 | Hierarchical context in compaction | Prevents drift across delegations | Medium |
| P0 | Pending validation list in compact | Forces completion checking | Low |
| P1 | Child session summaries on compact | Shows what sub-agents did | Medium |
| P1 | Intent drift detection | Catches wrong-epic scenarios early | Medium |
| P2 | `session-context-loader` tool | On-demand hierarchy access | Low |

---

## Part 6: SDK APIs for Implementation

### Confirmed Available

| API | Purpose | Verified |
|-----|---------|----------|
| `session.children({ path })` | Get child sessions | ✅ Yes (/session/:id/children) |
| `session.get({ path })` | Get session with parentID | ✅ Yes |
| `session.messages({ path })` | Get messages for summary | ✅ Yes |
| `session.prompt({ noReply: true })` | Inject context | ✅ Yes |
| `find.text({ query })` | Search for patterns | ✅ Yes |
| `file.read({ query })` | Read status files | ✅ Yes |

### NOT Available (Must Work Around)

| Need | Workaround |
|------|------------|
| Direct AI provider format access | Use experimental hooks to transform |
| Cross-session event subscription | Use session.children polling |
| Real-time parent notification | Archive to .brain, poll from parent |

---

## Next Steps

1. **Update implementation_plan.md** with compaction enhancement phase
2. **Create HierarchicalCompactionEnhancer** module
3. **Integrate with existing context-first-compaction.ts**
4. **Test with multi-agent delegation scenario**
