# Comprehensive Coding Agent Design Document

**Date:** 2025-12-24  
**Status:** DEEP RESEARCH COMPLETE  
**Purpose:** Design a real-world coding agent for Via-Gent IDE

---

## The Core Question: What Makes a Coding Agent Actually Useful?

After deep research into Roo-code patterns and 2025 AI agent design, a coding agent must answer these fundamental questions:

### 1. How Does the Agent Decide to Use Tools?

**Pattern: ReAct (Perception → Reasoning → Action) Loop**

```
User: "Create a React landing page"
  ↓
[PERCEIVE] Agent reads context:
- Current project structure (list_files)
- package.json dependencies
- Existing components
  ↓
[REASON] Agent plans:
"I need to create: index.tsx, Header.tsx, Hero.tsx, Footer.tsx"
"I'll use existing Tailwind setup from tailwind.config.js"
  ↓
[ACT] Agent executes:
- write_file('src/pages/index.tsx', ...)
- write_file('src/components/Header.tsx', ...)
  ↓
[VERIFY] Agent confirms:
- execute_command('tsc --noEmit')
```

**Via-Gent Gap:** No reasoning/planning layer. Tools exist but no orchestration.

---

### 2. How is Context Window Managed?

**Pattern: Context Engineering (Offload → Reduce → Isolate)**

| Strategy | Implementation |
|----------|----------------|
| **Offload** | Write notes to `agent.md` or project memory |
| **Reduce** | Summarize long files before adding to context |
| **Isolate** | Sub-agent for complex tasks with clean context |

**Critical Rule:** At 80% context usage, automatically:
1. Summarize conversation so far
2. Save to project memory
3. Start new conversation with summary

**Via-Gent Gap:** No context tracking or memory persistence.

---

### 3. How Are Multi-Turn Conversations Managed?

**Pattern: Thread-Based State**

```typescript
// Thread manages conversation history
interface Thread {
  id: string;
  projectId: string;
  messages: Message[];
  contextUsage: number; // 0-100%
  summary?: string;
}

// Agent is stateless - thread provides memory
function processMessage(thread: Thread, userMessage: string) {
  // Inject full history from thread
  const context = buildContext(thread.messages);
  
  // Send to LLM with history
  const response = await llm.chat(context + userMessage);
  
  // Update thread
  thread.messages.push({ role: 'assistant', content: response });
  
  // Check context limit
  if (thread.contextUsage > 80) {
    await condenseContext(thread);
  }
}
```

**Via-Gent Gap:** Uses single conversation with no thread management.

---

### 4. What System Instructions Does a Coding Agent Need?

**Based on Roo-code custom instructions:**

```markdown
# Coding Agent System Prompt

## Identity
You are a senior software engineer working inside Via-Gent IDE.
You have access to: read_file, write_file, list_files, execute_command.

## Workflow
1. **Understand First**: Before coding, read relevant files
2. **Plan Explicitly**: State your approach before writing code
3. **Execute Incrementally**: Make small, testable changes
4. **Verify Always**: Run tests/type checks after changes

## Tool Usage Rules
- ALWAYS read file before modifying
- NEVER write file without approval
- ALWAYS run type check after .ts/.tsx changes
- ALWAYS explain what each tool call will do

## Output Format
- Use markdown for explanations
- Use code blocks with language tags
- Show file diffs when modifying existing files
- Explain reasoning before code

## Context Management
- Track files you've read (don't re-read)
- Summarize long outputs
- Ask user to clarify ambiguous requirements
```

**Via-Gent Gap:** No system instructions defined. Agent has no identity or rules.

---

### 5. How Does the Agent Guide the User?

**Pattern: Progressive Disclosure with Signposting**

```
Agent: I'll create a React landing page with these components:
1. ✅ Header with navigation
2. ⏳ Hero section (working on this)
3. ⬜ Features grid
4. ⬜ Footer

Currently creating Hero section...
[Tool Call: write_file('src/components/Hero.tsx')]
```

**Rich Output Rendering Required:**
- ✅/⏳/⬜ Status icons for multi-step tasks
- Code blocks with syntax highlighting
- File diffs for modifications
- Tool execution status (pending/running/success/error)
- Token usage indicator

**Via-Gent Gap:** Plain text responses only. No rich rendering.

---

## MVP Design Decisions

### Decision 1: Single "Code" Mode for MVP

Skip multi-mode complexity. One agent with:
- All tools enabled
- Single system prompt
- User configures model/provider only

### Decision 2: Thread Per Project

Each project has ONE active thread.
- Thread persisted in IndexedDB
- Context tracking with 80% condensing rule
- Manual "New Conversation" button

### Decision 3: System Prompt Pre-configured

For MVP, system prompt is hardcoded:
- User cannot modify
- Optimized for React/TypeScript projects
- Clear tool usage rules

### Decision 4: Rich Output Rendering

Implement in EnhancedChatInterface:
- Tool call status badges
- Code blocks with file path headers
- Collapsible sections for long outputs
- Diff view for file modifications

---

## Implementation Checklist

### Phase A: Foundation (Must Have)

- [ ] Wire tool facades to AgentChatPanel (one-line fix)
- [ ] Add system prompt to agent configuration
- [ ] Create Thread interface and persistence
- [ ] Add context usage tracking

### Phase B: Rich Rendering (Must Have)

- [ ] Tool call status component
- [ ] Code block with copy/apply buttons
- [ ] Diff viewer for file changes
- [ ] Progress indicators for multi-step tasks

### Phase C: Context Management (Should Have)

- [ ] Token counting
- [ ] 80% threshold warning
- [ ] Context condensing logic
- [ ] Conversation summarization

### Phase D: User Guidance (Nice to Have)

- [ ] Task planning display
- [ ] Step-by-step progress
- [ ] Error explanation component
- [ ] "What's next?" suggestions

---

## Files to Create/Modify

| File | Change | Priority |
|------|--------|----------|
| `AgentChatPanel.tsx` | Wire tool facades | P0 |
| `system-prompt.ts` (NEW) | Hardcoded coding agent prompt | P0 |
| `thread-store.ts` (NEW) | Thread persistence | P0 |
| `ToolCallStatus.tsx` (NEW) | Rich tool rendering | P1 |
| `CodeDiffViewer.tsx` (NEW) | Show file diffs | P1 |
| `EnhancedChatInterface.tsx` | Rich message rendering | P1 |
| `context-tracker.ts` (NEW) | Token counting | P2 |

---

## Success Criteria

**MVP is DONE when:**

1. ✅ User types: "Create a Button component"
2. ✅ Agent PLANS: "I'll create a reusable Button.tsx with variants"
3. ✅ Agent EXECUTES: write_file with approval overlay
4. ✅ Rich OUTPUT: Shows code block with file path
5. ✅ File appears in FileTree (event bus propagation)
6. ✅ User can continue conversation with context
