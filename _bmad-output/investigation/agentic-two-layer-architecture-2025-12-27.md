# Agentic Coding Architecture - Two-Layer System
**Date:** 2025-12-27
**Status:** ARCHITECTURE REDESIGN

## Executive Summary

Based on analysis of Roo Code/Kilo Code patterns, the Via-gent agentic system requires a **TWO-LAYER architecture**:

| Layer | Purpose | Visibility | Example |
|-------|---------|------------|---------|
| **Tool Constitution** | HOW to use tools | Hidden, always sent | `roo-code-system-prompt.xml` |
| **Agent Mode** | WHO the agent is | Selectable persona | `solo-dev-mode-2025-12-27.md` |

---

## Layer 1: Tool Constitution

### Purpose
- Master rules for tool usage
- Workflow patterns (step-by-step)
- Safety guidelines
- **NOT** tool descriptions (TanStack AI sends JSON schemas)

### Key Rules (from Kilo Code)

```
1. You MUST use exactly one tool per message
2. Every assistant message must include a tool call
3. Use tools step-by-step, each informed by previous result
4. ALWAYS wait for user confirmation after each tool use
5. Never assume success without explicit confirmation
```

### Tool Priority (from our analysis)

```
Need to see structure? → list_files
Need to read code?    → read_file  
Need to create/modify → write_file (requires approval)
Need to run command?  → execute_command (requires approval)
```

### Critical Fix: ACTION vs INSTRUCTION

```
❌ WRONG (Teaching):
"To create a React component, first run: npm install react"
"You should create a file called App.tsx with..."

✅ CORRECT (Executing):
*Call list_files to see project* 
*Call write_file to create App.tsx*
*Call execute_command for npm install*
```

---

## Layer 2: Agent Mode

### Purpose
- Defines agent persona/identity
- Cognitive analysis phase (HOW to think)
- Communication style
- Mode-specific rules

### Mode Structure (from solo-dev-mode)

```xml
<agent id="solo-dev" name="Barry">
  <activation>
    <step n="1">Load persona</step>
    <step n="2">Load config (user_name, language)</step>
    <step n="3">Cognitive Analysis Phase</step>
    <step n="4">Show greeting, await input</step>
  </activation>
  
  <persona>
    <role>Adaptive Senior Engineer</role>
    <identity>Vibe Coder for web, Data Scientist for AI</identity>
    <principles>Context is King, Stack Agnostic, Safety First</principles>
  </persona>
  
  <communication_style>
    - Vague requests → Consultative
    - Specific requests → Military precision
    - Noise → Summarizing
  </communication_style>
  
  <rules>
    - AMBIGUOUS → Ask 2-3 questions
    - SPECIFIC → Follow RELIGIOUSLY
    - IMPOSSIBLE → Educate + Alternative
    - NOISE → Extract only functional reqs
  </rules>
</agent>
```

### Cognitive Analysis (Pre-Response)

```
1. Intent Classification:
   - VAGUE → Consultancy Mode
   - SPECIFIC → Execution Mode
   - DATA-HEAVY → Python Routing
   - CONTRADICTORY → Correction Mode
   - NOISY → Extraction Mode

2. Tech Stack Routing:
   - Web Apps → React (Vite + Tailwind)
   - Data Science → Python (Streamlit)
   - Offline → Client-side + LocalStorage

3. Planning (before coding):
   - Output file tree structure first
   - Explain stack decision
   - Then execute
```

---

## Implementation in Via-gent

### Current State (Before)

```typescript
// system-prompt.ts - MIXED EVERYTHING INCORRECTLY
export const CODING_AGENT_SYSTEM_PROMPT = `
You are a senior software engineer...
You have access to these tools:
- read_file: ...
- write_file: ...
`;
```

**Problems:**
1. Tool descriptions redundant (TanStack AI sends JSON schemas)
2. No cognitive analysis phase
3. No persona/communication style
4. No intent classification
5. Single monolithic prompt

### New State (After)

```typescript
// system-prompt.ts - TWO-LAYER ARCHITECTURE

// Layer 1: Tool Constitution (hidden, always sent)
export const TOOL_CONSTITUTION = `
## TOOL USE CONSTITUTION
1. ACTION, NOT INSTRUCTION
2. STEP-BY-STEP EXECUTION
3. TOOL SELECTION PRIORITY
4. SAFETY GUIDELINES
5. OUTPUT FORMAT
`;

// Layer 2: Agent Mode (selectable)
export interface AgentMode {
    id: string;
    name: string;
    cognitivePhase: string;
    persona: string;
    communicationStyle: string;
    rules: string;
}

// Build complete prompt
export function buildSystemPrompt(mode: AgentMode): string {
    return [
        mode.persona,
        TOOL_CONSTITUTION,
        mode.cognitivePhase,
        mode.communicationStyle,
        mode.rules,
    ].join('\n\n');
}
```

---

## Key Differences from Kilo Code

| Aspect | Kilo Code (VSCode) | Via-gent (Browser) |
|--------|-------------------|-------------------|
| Tool Format | XML tags | TanStack AI function calling |
| Environment | Local filesystem | WebContainer sandbox |
| Approval | VSCode UI | ApprovalOverlay component |
| Persistence | VSCode state | IndexedDB (Dexie) |
| Tool Registration | Hardcoded XML | Dynamic tool definitions |

---

## What Kilo Code Has That We're Missing

### 1. `codebase_search` - Semantic Search
```xml
<codebase_search>
<query>User login and password hashing</query>
<path>src/auth</path>
</codebase_search>
```
**Via-gent Status:** NOT IMPLEMENTED
**MVP Impact:** Can skip for MVP, use list_files + read_file

### 2. `apply_diff` - Surgical Edits
```xml
<apply_diff>
<path>file.ts</path>
<diff>
<<<<<<< SEARCH
:start_line:1
old code
=======
new code
>>>>>>> REPLACE
</diff>
</apply_diff>
```
**Via-gent Status:** We have `write_file` (full rewrite only)
**MVP Impact:** Functional but less efficient

### 3. `update_todo_list` - Task Tracking
**Via-gent Status:** NOT IMPLEMENTED
**MVP Impact:** Not critical for MVP

### 4. `switch_mode` - Mode Switching
**Via-gent Status:** NOT IMPLEMENTED (single mode)
**MVP Impact:** Add post-MVP for multi-agent orchestration

### 5. `ask_followup_question` with Suggestions
```xml
<ask_followup_question>
<question>What is the path?</question>
<follow_up>
  <suggest>./src/config.json</suggest>
  <suggest>./config/app.json</suggest>
</follow_up>
</ask_followup_question>
```
**Via-gent Status:** NOT IMPLEMENTED
**MVP Impact:** Would improve UX significantly

---

## Immediate Action Items

### P0 (Blocking MVP)
1. ✅ Refactor system-prompt.ts to two-layer architecture
2. 🔲 Verify tool execution actually calls FileToolsFacade
3. 🔲 Debug why files not appearing in FileTree
4. 🔲 Fix persistence loss on refresh

### P1 (Post-MVP)
1. Add `codebase_search` tool
2. Add `apply_diff` tool for surgical edits
3. Add mode switching UI
4. Add `ask_followup_question` with suggestions

### P2 (Future)
1. Multi-agent orchestration
2. Context window management (pointer pattern, compaction)
3. Checkpoint/resume for long tasks

---

## Files Modified

| File | Change |
|------|--------|
| `src/lib/agent/system-prompt.ts` | Complete rewrite with two-layer architecture |
| `src/components/ide/AgentChatPanel.tsx` | Persistence + empty message filtering |
| `src/lib/agent/facades/file-tools-impl.ts` | Debug logging |
| `src/stores/auto-approve-store.ts` | New store for auto-approve settings |
| `src/components/chat/AutoApproveSettings.tsx` | New toggle-based UI |

---

## References

- `docs/2025-12-25/roo-code-system-prompt.xml` - Kilo Code tool constitution
- `docs/2025-12-27/solo-dev-mode-2025-12-27.md` - BMAD agent mode example
- `docs/2025-12-27/capturing-in-chat-responses-sample-2025-12-27.md` - Expected flow
