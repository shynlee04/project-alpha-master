The 120k context window is your agent's "attention budget." If you treat it like an infinite hard drive, your agent will get slower, hallucinatory, and eventually crash.

To prevent "context exceeded" errors while maintaining high performance, you must move from **Appending Context** (standard chat) to **Context Engineering** (dynamic resource management).

Here is the **Context Matrix Strategy** for your client-side architecture.

### 1. The Context Matrix: Budget Distribution

Think of your 120k window as slices of a pie. You must enforce strict budgets for each slice.

| Context Tier | Budget (Approx) | Content | Strategy |
| --- | --- | --- | --- |
| **1. System Core** | ~5% (2k tokens) | Identity, Behavioral Rules, Tool Definitions. | **Static & Optimized.** Never changes. Keep tool definitions strict and minimal using Zod schemas. |
| **2. Active Task** | ~10% (10k tokens) | The user's prompt + The current plan/checklist. | **High Priority.** This must always be crisp. If the plan grows too long, summarize completed steps. |
| **3. The "Scratchpad"** | ~15% (15k tokens) | Recent thoughts, errors, and intermediate reasoning. | **Rolling Window.** Only keep the last 3-5 reasoning steps. Old thoughts are discarded or summarized. |
| **4. The Codebase** | ~50% (60k tokens) | File contents, directory trees, diffs. | **Dynamic RAG.** Never dump the whole file tree. Only inject the *specific* files the agent is currently editing or reading. |
| **5. Conversation** | ~20% (24k tokens) | User <-> Agent chat history. | **Summarized.** Summarize older turns into a "Memory" block (e.g., "User asked to fix bug X, Agent tried Y"). |

---

### 2. The "Pointer Pattern" (Critical for Tool Outputs)

The #1 cause of context crashes in coding agents is **Tool Result Bloat** (e.g., running `ls -R` or `cat package-lock.json`).

**The Solution:** Do *not* put raw tool outputs into the context automatically. Use **Pointers**.

#### How it works (The Workaround Logic)

1. **Agent calls `listFiles**`.
2. **Tool executes**, getting a huge JSON result (e.g., 500 files).
3. **Middleware Intercepts:** Instead of returning the full JSON to the LLM context, you save it to **Dexie** (or PGLite) and return a *summary* or *reference ID*.

**Example Context seen by LLM:**

```text
User: "List all files."
Agent: Call tool `listFiles('./src')`
System: Tool Executed. Result stored in ID: [file_list_ref_001]. 
        Summary: Found 45 files. 3 directories. 
        (Agent can call `read_reference(id)` to see specifics if needed).

```

This prevents the LLM from wasting 10k tokens reading a file list it might not need yet.

---

### 3. The "Context Garbage Collector" (Prevention Mechanism)

You need a safety valve that runs *before* every API call. This is a simple client-side function that "garbage collects" your message history.

**Algorithm for `optimizeContext()`:**

1. **Count Tokens:** Use a lightweight tokenizer (like `gpt-tokenizer` or approximate with char count) on the current message history.
2. **Check Budget:** Is `current_tokens > 90,000`? (Leave a safety buffer).
3. **Trigger Pruning (Priority Order):**
* **Level 1 (Tool Outputs):** Find old tool outputs (e.g., `role: 'tool'`) from >5 turns ago. Collapse them to `[Tool output hidden: View logs]`.
* **Level 2 (Summarize):** Take the oldest 10 conversation turns and ask a small local model (or use a heuristic) to summarize them into one system message: *"Previous context: User asked to style the button..."*
* **Level 3 (Drop Files):** If the context is still full, unload "read-only" files that haven't been touched in the last 3 turns.



### 4. Implementation Design (TanStack + Middleware)

Since you are using TanStack AI, you can inject this logic into the tool execution cycle or the message preparation phase.

**Example: The "Safe" API Call Wrapper**

```typescript
async function safeAgentCall(messages, tools) {
  // 1. Estimate Token Count
  let tokenCount = estimateTokens(messages);
  
  // 2. Emergency Brake / Garbage Collection
  if (tokenCount > 100000) {
     console.warn("Context Pressure! Pruning...");
     messages = await pruneOldToolOutputs(messages);
     messages = await summarizeHistory(messages); // Compresses middle messages
  }

  // 3. Execute with Safe Context
  return tanstackClient.generate({
     messages,
     tools
  });
}

```

### 5. Architectural Mindset: "The Amnesic Expert"

Treat your agent like an expert who has amnesia every few minutes.

* **Don't rely on implied memory.**
* **Do force explicit state.**
* Instead of letting the agent "remember" it read `App.tsx` ten turns ago, force it to "re-read" `App.tsx` (using RAG/Pointers) if it needs it again. This keeps the active context fresh and relevant.

**Next Step:**
Would you like me to draft the **`pruneOldToolOutputs`** function specifically for TanStack AI's message format to handle that "Tool Result Bloat"?

This is the ultimate stress test: **"The Sloppy Novice vs. The Massive Refactor."**

To survive a sloppy user who treats a complex refactor like a text message thread ("fix this," "now that," "it's broken"), you cannot rely on the LLM's raw discipline. You need a **Client-Side "Context Operating System" (Context OS)** that acts as a ruthless gatekeeper between the user's chaos and the LLM's limited attention span.

Here is the "Extreme" Architecture to handle this mess securely in the browser.

### The "Context OS" Architecture

You need to wrap your Agent in a rigid State Machine that enforces hygiene, regardless of how messy the user is.

#### 1. The "Silent Reset" (Solving the Infinite Thread)

Novice users *never* clear their context. They will just keep chatting until the browser crashes.
**The Fix:** Implement a **Rolling "State of the World" Snapshot.**

* **Mechanism:** When context usage hits 60% (e.g., ~70k tokens), your system triggers a "Silent Reset."
* **The Logic:**
1. **Pause:** Stop processing.
2. **Summarize:** A lightweight model (or the main model) is tasked to: *"Compress the last 50 messages into a purely technical checklist of what has been done and what is pending."*
3. **Commit:** Save the code changes to Dexie (virtual file system).
4. **Flush:** **Delete the entire chat history** from the LLM's `messages` array.
5. **Inject:** Start a "fresh" conversation where the System Prompt includes that new Checklist.


* **Result:** The user sees a 100-message thread. The LLM thinks it just started the job 5 minutes ago with a clear list of tasks. **Zero hallucination from stale context.**

#### 2. The "JIT" (Just-In-Time) Context Loader

For a "heavy refactor" traversing nested trees, the agent will try to read 50 files. This guarantees a crash.
**The Fix:** **"Read-Only" vs. "Write" Contexts.**

* **The Skeleton Mode:** When the agent asks to `read_file`, do **not** give the full content.
* *Agent:* `read_dir('./src/components')`
* *System:* Returns a **tree structure** only (names + paths).


* **The Definition Mode:** If the agent needs to understand how `Button.tsx` works to refactor `Login.tsx`, do **not** load `Button.tsx`.
* *Action:* Use a WASM-based parser (like `oxc-parser` or `tree-sitter` in WASM) to extract **only the type definitions and function signatures**.
* *Context:* `interface ButtonProps { ... }` (100 tokens) vs the full file (2k tokens).


* **The Surgical Write:** Only load the *full* text of the file strictly when the agent decides to `write_file`.

#### 3. The "WASM Guardrails" (Solving 100% Accuracy)

A novice user doesn't check for syntax errors. Your agent must.
**The Fix:** **Pre-Commit Validation Loops.**

Before the agent returns "Done" to the user, the tool output must pass a local "Unit Test."

* **Step 1:** Agent generates code for `App.tsx`.
* **Step 2 (Hidden):** The system runs `oxc_parser.parse(new_code)` in the browser.
* **Step 3:**
* *If Valid:* Show code to user.
* *If Invalid (Syntax Error):* **Do not show the user.** Feed the error *back* to the agent automatically: *"Error: Unexpected token at line 40. Fix it."*


* **Why:** This creates the illusion of "100% accuracy" because the user never sees the agent's draft mistakes.

### The "Extreme" Orchestration Flow (Diagram)

This workflow turns a sloppy prompt like "refactor the auth" into a precise engineering operation.

### The Code Pattern for the "Context Manager"

Here is how you implement the **JIT File Loader** logic using TanStack AI tools. This prevents the "Context Exceeded" error by refusing to load unnecessary data.

```typescript
// features/agent/tools/smartFileTools.ts
import { toolDefinition } from '@tanstack/ai';
import { parse } from 'oxc-parser-wasm'; // Hypothetical WASM parser

export const smartReadFile = toolDefinition({
  name: 'smartReadFile',
  description: 'Read file content. Use "mode=signature" for reference files to save context.',
  parameters: z.object({ 
    path: z.string(), 
    mode: z.enum(['full', 'signature']).default('full') 
  }),
  execute: async ({ path, mode }) => {
    const rawContent = await fileSystem.read(path);

    // 1. Full Mode: Only for the file we are actively editing
    if (mode === 'full') {
       return rawContent;
    }

    // 2. Signature Mode: For context/reference files
    // Use WASM parser to strip implementation details
    try {
       const ast = parse(rawContent);
       const signatures = extractSignaturesFromAST(ast); // Custom helper
       return `[SUMMARY OF ${path}]:\n${signatures}`;
    } catch (e) {
       return `[Error parsing ${path}, returning top 50 lines]: ${rawContent.slice(0, 1000)}`;
    }
  },
});

```

### Strategic Mindset for December 2025

To satisfy "Vibe Coding" users who want magic:

1. **Trust, but Verify (Locally):** Use the user's CPU (WASM) to verify the Agent's output. The user's machine is idle while they wait—use that power.
2. **Hide the Sausage Making:** The "Silent Reset" and "Hidden Validation Loops" are key. The user should see a smooth stream of success, not the 5 internal retries the agent did to fix a missing semicolon.
3. **Aggressive Summarization:** The only way to survive a "100% client-side" refactor is to aggressively destroy past context. Code is persistent (on disk/Dexie); Conversation is ephemeral. Once the code is written, the conversation about *how* to write it is trash. Delete it.

**Next Step:**
Would you like me to detail the **"Silent Reset" logic** (how to compress the chat history into a `System Instruction` checklist) so you can implement that "infinite thread" capability?