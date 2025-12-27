# Context Engineering for Multi-Agent Orchestration in Via-gent

**Document ID:** `_bmad-output/research/context-engineering-multi-agent-orchestration-2025-12-27.md`  
**Date:** 2025-12-27  
**Research Type:** Architecture + Patterns  
**Depth:** Comprehensive  
**Classification:** Strategic Technical Research

---

## Executive Summary

This document synthesizes research from **Google ADK**, **Anthropic**, **JetBrains Research**, and industry best practices to create a tailored context engineering strategy for Via-gent's multi-agent orchestration system. The key insight: **context is not a string buffer to append to—it's a compiled view over a richer stateful system**.

The research addresses the original question: *"How should I distribute context across system instructions, agent behaviors, tool outputs, codebase consumption, and conversation history to prevent context overflow errors?"*

### Key Findings

| Principle | Strategy | Via-gent Application |
|-----------|----------|---------------------|
| **Tiered Storage** | Separate storage from presentation | Use Dexie for persistent state, working context as computed view |
| **Context as Compiled View** | Transform stored state into minimal prompts | Implement context processors in agent factory |
| **Pointer Pattern** | Reference large data, don't inline it | Store tool outputs in IndexedDB, pass summaries |
| **Observation Masking** | Hide verbose tool outputs after N turns | Implement in `useAgentChatWithTools` |
| **Compaction** | Summarize old conversation turns | Add compaction processor before API call |
| **Scoped Handoffs** | Agents see minimum required context | BMAD workflow handoff documents |

---

## The Context Matrix: Via-gent Budget Distribution

Based on your architecture (TanStack AI, WebContainer, client-side tools), here's a tailored context budget:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         120k Token Context Window                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ TIER 1: System Core (~5k tokens / 4%)                                       │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ • Agent Identity (CODING_AGENT_SYSTEM_PROMPT)        [~800 tokens]      │ │
│ │ • Tool Definitions (4 tools w/ schemas)              [~1200 tokens]     │ │
│ │ • Project Context (project-context.md condensed)     [~2000 tokens]     │ │
│ │ • Behavioral Rules & Workflow Instructions           [~1000 tokens]     │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ TIER 2: Active Task (~12k tokens / 10%)                                     │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ • Current User Prompt                                [~500 tokens]      │ │
│ │ • Active Plan/Checklist (from compacted history)     [~2000 tokens]     │ │
│ │ • Target Files Being Edited (signatures only)        [~5000 tokens]     │ │
│ │ • Pending Approvals Context                          [~500 tokens]      │ │
│ │ • Error Context (if any)                             [~4000 tokens]     │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ TIER 3: Scratchpad/Reasoning (~18k tokens / 15%)                           │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ • Last 3-5 Reasoning Steps                           [~10000 tokens]    │ │
│ │ • Recent Tool Call Results (masked after 3 turns)    [~5000 tokens]     │ │
│ │ • Intermediate Artifacts (summaries)                 [~3000 tokens]     │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ TIER 4: Codebase Context (~60k tokens / 50%)                               │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ • Active File Contents (full, for editing)           [~20000 tokens]    │ │
│ │ • Reference Files (signatures/types only)            [~15000 tokens]    │ │
│ │ • Directory Structure (tree, not contents)           [~2000 tokens]     │ │
│ │ • RAG-Retrieved Snippets (on-demand)                 [~23000 tokens]    │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ TIER 5: Conversation History (~24k tokens / 20%)                           │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ • Compacted Summary of Old Turns                     [~4000 tokens]     │ │
│ │ • Recent 5-10 Conversation Turns (full)              [~15000 tokens]    │ │
│ │ • Tool Results (last 3 turns only, others masked)    [~5000 tokens]     │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ SAFETY BUFFER (~1k tokens / 1%)                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Architecture Recommendations for Via-gent

### 1. The "Context Compiler" Architecture

**Current State (Via-gent):**
```
User Message → useAgentChatWithTools → fetchServerSentEvents → /api/chat → LLM
```

**Recommended State:**
```
User Message 
    ↓
┌─────────────────────────────────────────────┐
│     Context Compilation Pipeline            │
├─────────────────────────────────────────────┤
│ 1. Token Counter (estimate current usage)   │
│ 2. History Compactor (if > 70% budget)      │
│ 3. Tool Result Masker (age > 3 turns)       │
│ 4. File Content Optimizer (signatures)      │
│ 5. System Prompt Assembler (static prefix)  │
└─────────────────────────────────────────────┘
    ↓
fetchServerSentEvents → /api/chat → LLM
```

### 2. Implement Context Tiers in Zustand

Create a dedicated context management store:

```typescript
// src/stores/context-manager.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ContextTier {
  tokens: number;
  content: unknown;
  lastUpdated: Date;
}

interface ContextManagerState {
  // Tier 1: System Core (static, rarely changes)
  systemCore: ContextTier;
  
  // Tier 2: Active Task (changes per task)
  activeTask: ContextTier;
  
  // Tier 3: Scratchpad (rolling window)
  scratchpad: ContextTier;
  
  // Tier 4: Codebase (dynamic RAG)
  codebaseContext: ContextTier;
  
  // Tier 5: Conversation (compacted)
  conversationHistory: ContextTier;
  
  // Computed
  totalTokens: number;
  budgetUtilization: number;
  
  // Actions
  compactHistory: () => Promise<void>;
  maskOldToolOutputs: (turnsToKeep: number) => void;
  updateTier: (tier: keyof ContextManagerState, content: unknown) => void;
  getCompiledContext: () => unknown[];
}

export const useContextManager = create<ContextManagerState>()(
  persist(
    (set, get) => ({
      // Implementation...
    }),
    {
      name: 'via-gent-context',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist non-ephemeral tiers
        systemCore: state.systemCore,
      }),
    }
  )
);
```

### 3. The Pointer Pattern for Tool Outputs

**Problem:** Tool outputs (file contents, command results) can consume 10-50k tokens.

**Solution:** Store in Dexie, return pointers to context.

```typescript
// src/lib/agent/context/tool-output-storage.ts
import { db } from '@/lib/state/dexie-db';

interface ToolOutputRecord {
  id: string;
  toolName: string;
  toolCallId: string;
  output: unknown;
  summary: string;
  tokenCount: number;
  createdAt: Date;
}

/**
 * Store large tool output and return a pointer + summary
 * The LLM sees the summary, not the raw output
 */
export async function storeToolOutput(
  toolName: string,
  toolCallId: string,
  rawOutput: unknown
): Promise<{ pointerId: string; summary: string }> {
  const output = typeof rawOutput === 'string' ? rawOutput : JSON.stringify(rawOutput);
  const tokenCount = estimateTokens(output);
  
  // Generate summary (use heuristics or small model)
  const summary = await generateToolOutputSummary(toolName, output, tokenCount);
  
  const id = crypto.randomUUID();
  await db.toolExecutions.add({
    id,
    toolName,
    toolCallId,
    output: rawOutput,
    summary,
    tokenCount,
    createdAt: new Date(),
  } as ToolOutputRecord);
  
  return { pointerId: id, summary };
}

/**
 * Generate a token-efficient summary of tool output
 */
function generateToolOutputSummary(
  toolName: string,
  output: string,
  tokenCount: number
): string {
  switch (toolName) {
    case 'list_files':
      // Parse and summarize directory listing
      const lines = output.split('\n');
      return `Found ${lines.length} items. Directories: ${countDirs(lines)}, Files: ${countFiles(lines)}. [Ref: can call read_reference to see details]`;
    
    case 'read_file':
      // Summarize file content
      const lineCount = output.split('\n').length;
      return `File read successfully (${lineCount} lines, ~${tokenCount} tokens). Content available for analysis.`;
    
    case 'execute_command':
      // Summarize command output
      if (output.includes('error') || output.includes('Error')) {
        return `Command completed with errors. Key issue: ${extractFirstError(output)}`;
      }
      return `Command completed successfully. Output: ${output.slice(0, 200)}...`;
    
    default:
      return `Tool executed. Result: ${tokenCount} tokens. [Use read_reference for full output]`;
  }
}
```

### 4. Observation Masking Implementation

Based on JetBrains Research findings, implement observation masking:

```typescript
// src/lib/agent/context/observation-masker.ts

interface MessagePart {
  type: 'text' | 'tool-call' | 'tool-result';
  content?: string;
  id?: string;
  turnIndex?: number;
}

interface UIMessage {
  role: 'user' | 'assistant' | 'tool';
  parts: MessagePart[];
  turnIndex: number;
}

/**
 * Mask tool outputs older than N turns
 * Keeps reasoning and actions intact, only masks observations
 */
export function maskOldObservations(
  messages: UIMessage[],
  currentTurn: number,
  turnsToKeep: number = 3
): UIMessage[] {
  return messages.map((msg) => {
    const age = currentTurn - msg.turnIndex;
    
    if (age <= turnsToKeep) {
      return msg; // Recent enough, keep full content
    }
    
    // Mask old tool results
    const maskedParts = msg.parts.map((part) => {
      if (part.type === 'tool-result') {
        return {
          ...part,
          content: `[Tool output from turn ${msg.turnIndex} - masked for context efficiency. Use read_reference("${part.id}") to retrieve if needed.]`,
        };
      }
      return part; // Keep reasoning and actions
    });
    
    return { ...msg, parts: maskedParts };
  });
}
```

### 5. History Compaction Strategy

Implement Anthropic's compaction approach:

```typescript
// src/lib/agent/context/history-compactor.ts

const COMPACTION_THRESHOLD = 0.7; // 70% of budget
const COMPACTION_WINDOW = 10; // Summarize oldest 10 turns

interface CompactionResult {
  summary: string;
  preservedTurns: UIMessage[];
  tokensSaved: number;
}

/**
 * Compact old conversation history into a summary
 * Called when context usage exceeds threshold
 */
export async function compactHistory(
  messages: UIMessage[],
  currentTokens: number,
  budgetLimit: number
): Promise<CompactionResult> {
  if (currentTokens / budgetLimit < COMPACTION_THRESHOLD) {
    return {
      summary: '',
      preservedTurns: messages,
      tokensSaved: 0,
    };
  }
  
  // Split into old (to compact) and recent (to preserve)
  const oldTurns = messages.slice(0, COMPACTION_WINDOW);
  const recentTurns = messages.slice(COMPACTION_WINDOW);
  
  // Generate summary using the agent's model (or a smaller one)
  const summary = await generateCompactionSummary(oldTurns);
  
  const tokensSaved = estimateTokens(serializeMessages(oldTurns)) - estimateTokens(summary);
  
  return {
    summary,
    preservedTurns: recentTurns,
    tokensSaved,
  };
}

const COMPACTION_PROMPT = `Summarize this conversation history, preserving:
1. Key decisions made and their rationale
2. Files created/modified and their purposes
3. Errors encountered and how they were resolved
4. Current task progress and next steps
5. Any user preferences or constraints mentioned

Be extremely concise. This summary will replace the original turns.`;

async function generateCompactionSummary(turns: UIMessage[]): Promise<string> {
  // Use a lightweight call to summarize
  // Could use the same model or a faster/cheaper one
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      messages: [
        { role: 'system', content: COMPACTION_PROMPT },
        { role: 'user', content: serializeMessages(turns) },
      ],
      modelId: 'google/gemini-2.0-flash-exp:free', // Fast, cheap model for summaries
      providerId: 'openrouter',
    }),
  });
  
  return await response.text();
}
```

### 6. Silent Reset for Long Sessions

For novice users who never clear context:

```typescript
// src/lib/agent/context/silent-reset.ts

const SILENT_RESET_THRESHOLD = 0.9; // 90% of budget

interface ResetCheckpoint {
  completedTasks: string[];
  pendingTasks: string[];
  workingFiles: string[];
  lastError?: string;
  userPreferences: Record<string, unknown>;
}

/**
 * Perform a "silent reset" when context is critically full
 * The user sees continuity, but the LLM gets a fresh start
 */
export async function performSilentReset(
  messages: UIMessage[],
  currentTokens: number,
  budgetLimit: number
): Promise<UIMessage[]> {
  if (currentTokens / budgetLimit < SILENT_RESET_THRESHOLD) {
    return messages;
  }
  
  console.warn('[Context] 🔄 Triggering silent reset - context at 90%');
  
  // 1. Extract checkpoint state
  const checkpoint = await extractCheckpoint(messages);
  
  // 2. Persist current file states to Dexie
  await persistWorkingFiles(checkpoint.workingFiles);
  
  // 3. Create fresh context with checkpoint
  const freshSystemMessage = buildFreshSystemWithCheckpoint(checkpoint);
  
  // 4. Keep only last 5 messages
  const recentMessages = messages.slice(-5);
  
  return [
    { role: 'system', parts: [{ type: 'text', content: freshSystemMessage }] },
    ...recentMessages,
  ];
}

function buildFreshSystemWithCheckpoint(checkpoint: ResetCheckpoint): string {
  return `${CODING_AGENT_SYSTEM_PROMPT}

## Session Continuation
You are resuming work on an ongoing task. Here is your checkpoint:

### Completed Tasks
${checkpoint.completedTasks.map(t => `- ✅ ${t}`).join('\n')}

### Pending Tasks
${checkpoint.pendingTasks.map(t => `- ⏳ ${t}`).join('\n')}

### Working Files
${checkpoint.workingFiles.map(f => `- ${f}`).join('\n')}

${checkpoint.lastError ? `### Last Error\n${checkpoint.lastError}` : ''}

Continue from where you left off.`;
}
```

### 7. File Content Optimization (JIT Loading)

Use signatures for reference files, full content only for active edits:

```typescript
// src/lib/agent/context/file-optimizer.ts

interface FileContextEntry {
  path: string;
  mode: 'full' | 'signature' | 'summary';
  content: string;
  tokens: number;
}

/**
 * Optimize file content for context efficiency
 * - Active file: Full content
 * - Reference files: Signatures/types only
 * - Large files: Summary only
 */
export async function optimizeFileContext(
  files: string[],
  activeFile: string | null
): Promise<FileContextEntry[]> {
  const entries: FileContextEntry[] = [];
  
  for (const filePath of files) {
    const content = await readFile(filePath);
    const tokens = estimateTokens(content);
    
    if (filePath === activeFile) {
      // Active file gets full content
      entries.push({
        path: filePath,
        mode: 'full',
        content,
        tokens,
      });
    } else if (tokens > 5000) {
      // Large files get summary only
      entries.push({
        path: filePath,
        mode: 'summary',
        content: await extractFileSummary(content, filePath),
        tokens: estimateTokens(content) / 10, // Rough estimate
      });
    } else {
      // Reference files get signatures
      entries.push({
        path: filePath,
        mode: 'signature',
        content: await extractSignatures(content, filePath),
        tokens: estimateTokens(content) / 4, // Rough estimate
      });
    }
  }
  
  return entries;
}

/**
 * Extract function/class signatures without implementation
 */
async function extractSignatures(content: string, filePath: string): Promise<string> {
  const ext = filePath.split('.').pop();
  
  if (['ts', 'tsx', 'js', 'jsx'].includes(ext || '')) {
    // Use regex or AST parser to extract signatures
    const signatures = content
      .match(/^(export\s+)?(interface|type|function|class|const)\s+\w+[^{]*/gm)
      ?.join('\n\n');
    
    return `// Signatures from ${filePath}\n${signatures || '// No exportable signatures found'}`;
  }
  
  // For other file types, return first 50 lines
  return content.split('\n').slice(0, 50).join('\n');
}
```

---

## Multi-Agent Context: BMAD Integration

### Scoped Handoffs

When BMAD Master delegates to specialized agents, use scoped context:

```typescript
// src/lib/agent/context/handoff-context.ts

interface HandoffContext {
  taskDescription: string;
  relevantFiles: string[];
  constraints: string[];
  acceptanceCriteria: string[];
  parentSessionSummary?: string;
}

/**
 * Create minimal context for sub-agent handoff
 * Sub-agent sees only what it needs, not parent's full history
 */
export function createHandoffContext(
  parentMessages: UIMessage[],
  task: string,
  files: string[]
): HandoffContext {
  // Extract only relevant parts from parent session
  const summary = extractTaskRelevantSummary(parentMessages, task);
  
  return {
    taskDescription: task,
    relevantFiles: files,
    constraints: extractConstraints(parentMessages),
    acceptanceCriteria: extractAcceptanceCriteria(task),
    parentSessionSummary: summary,
  };
}

/**
 * Build system prompt for sub-agent with scoped context
 */
export function buildSubAgentPrompt(handoff: HandoffContext): string {
  return `You are a specialized agent working on a focused task.

## Your Task
${handoff.taskDescription}

## Relevant Files
${handoff.relevantFiles.map(f => `- ${f}`).join('\n')}

## Constraints
${handoff.constraints.map(c => `- ${c}`).join('\n')}

## Acceptance Criteria
${handoff.acceptanceCriteria.map(ac => `- ${ac}`).join('\n')}

${handoff.parentSessionSummary ? `## Context from Parent Session\n${handoff.parentSessionSummary}` : ''}

Focus only on this task. Do not explore unrelated areas.`;
}
```

---

## Implementation Roadmap for Via-gent

### Phase 1: Foundation (Immediate)

| Task | Priority | Effort | File Location |
|------|----------|--------|---------------|
| Add token estimation utility | P0 | 2h | `src/lib/agent/context/token-estimator.ts` |
| Implement observation masking | P0 | 4h | `src/lib/agent/context/observation-masker.ts` |
| Add context budget tracking | P0 | 3h | `src/stores/context-manager.ts` |
| Modify `useAgentChatWithTools` to use masker | P0 | 2h | `src/lib/agent/hooks/use-agent-chat-with-tools.ts` |

### Phase 2: Optimization (Short-term)

| Task | Priority | Effort | File Location |
|------|----------|--------|---------------|
| Implement tool output pointer pattern | P1 | 4h | `src/lib/agent/context/tool-output-storage.ts` |
| Add file signature extraction | P1 | 6h | `src/lib/agent/context/file-optimizer.ts` |
| Implement history compaction | P1 | 8h | `src/lib/agent/context/history-compactor.ts` |
| Add context budget UI indicator | P1 | 3h | `src/components/chat/ContextBudgetIndicator.tsx` |

### Phase 3: Advanced (Medium-term)

| Task | Priority | Effort | File Location |
|------|----------|--------|---------------|
| Implement silent reset | P2 | 6h | `src/lib/agent/context/silent-reset.ts` |
| Add BMAD handoff context scoping | P2 | 8h | `src/lib/agent/context/handoff-context.ts` |
| Implement hybrid masking + summarization | P2 | 12h | `src/lib/agent/context/hybrid-compaction.ts` |
| Add context caching (prefix optimization) | P2 | 8h | `src/lib/agent/context/context-cache.ts` |

---

## Key Metrics to Track

| Metric | Target | Measurement |
|--------|--------|-------------|
| Context overflow errors | 0 | Error logging |
| Average context utilization | < 80% | Token counter |
| Compaction frequency | < 1 per 20 turns | Event logging |
| Silent reset frequency | < 1 per session | Event logging |
| Tool output token savings | > 60% | Before/after comparison |

---

## References

1. **Google Developers Blog**: [Architecting efficient context-aware multi-agent framework for production](https://developers.googleblog.com/architecting-efficient-context-aware-multi-agent-framework-for-production/)
2. **Anthropic**: [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
3. **JetBrains Research**: [Cutting Through the Noise: Smarter Context Management](https://blog.jetbrains.com/research/2025/12/efficient-context-management/)
4. **TanStack AI**: Context management via `truncation` and message handling
5. **Zustand**: Persist middleware for state management

---

## Appendix A: Gemini AI Conversation Analysis

The original Gemini AI conversation provided valuable starting points but requires refinement for Via-gent:

### What Gemini Got Right ✅

1. **Context Matrix concept** - Budget allocation by tier is sound
2. **Pointer Pattern** - Essential for tool output management
3. **Silent Reset** - Critical for novice user protection
4. **JIT File Loading** - Signatures vs full content distinction

### What Needs Adjustment for Via-gent ⚠️

| Gemini Suggestion | Via-gent Reality | Adjustment |
|-------------------|------------------|------------|
| "Use WASM parser for validation" | TanStack AI handles tool validation | Use Zod schemas instead |
| "Pre-commit validation loops" | WebContainer provides runtime validation | Leverage existing `pnpm tsc` via terminal tool |
| "60k tokens for codebase" | May be too aggressive for chat-heavy workflows | Use 50k with dynamic reallocation |
| "Local model for summarization" | No local model available in browser | Use cheapest OpenRouter model (gemini-2.0-flash-exp:free) |

### What Was Missing from Gemini ❌

1. **TanStack AI-specific patterns** - `addToolApprovalResponse`, message parts structure
2. **BMAD multi-agent handoffs** - Scoped context for sub-agents
3. **Hybrid masking + summarization** - JetBrains Research findings
4. **Context caching (prefix optimization)** - Google ADK approach
5. **Observation masking vs full summarization** - JetBrains found masking often sufficient

---

## Appendix B: Quick Reference - Token Estimation

```typescript
/**
 * Quick token estimation (4 chars ≈ 1 token for English)
 * More accurate than nothing, less overhead than tiktoken
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  
  // Rough estimation: 4 characters ≈ 1 token
  // Add 20% buffer for special tokens and encoding overhead
  return Math.ceil((text.length / 4) * 1.2);
}

/**
 * Estimate tokens for message array
 */
export function estimateMessagesTokens(messages: unknown[]): number {
  return messages.reduce((total, msg) => {
    const m = msg as { parts?: unknown[]; content?: string };
    if (m.parts) {
      return total + m.parts.reduce((partTotal, part) => {
        const p = part as { content?: string };
        return partTotal + estimateTokens(p.content || '');
      }, 0);
    }
    return total + estimateTokens(m.content || '');
  }, 0);
}
```

---

**Document Status:** Research Complete  
**Next Action:** Create Epic for Context Engineering implementation  
**Recommended Epic Priority:** P1 (after current MVP completion)
