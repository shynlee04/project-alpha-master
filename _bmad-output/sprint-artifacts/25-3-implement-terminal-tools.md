# Story 25-3: Implement Terminal Tools

**Epic:** [25 - AI Foundation Sprint](../epics/epic-25-ai-foundation-sprint.md)  
**Status:** `done`  
**Priority:** P0 (enables agent command execution)  
**Points:** 5  
**Created:** 2025-12-23T21:15:00+07:00  
**Completed:** 2025-12-23T21:25:00+07:00

---

## Story

As a **developer using the AI agent**,  
I want **the agent to execute terminal commands in my WebContainer**,  
so that **it can run scripts, install packages, and verify code changes**.

---

## Acceptance Criteria

### AC-25-3-1: Tool Definition Pattern
- [ ] Each tool uses TanStack AI `toolDefinition()` with Zod schemas
- [ ] Uses factory pattern for DI (like Story 25-2)

### AC-25-3-2: ExecuteCommandTool
- [ ] Accepts `command` (string), `args` (string[]), `timeout` (optional)
- [ ] Returns stdout, exitCode, and pid
- [ ] Uses `AgentTerminalTools.executeCommand()` facade

### AC-25-3-3: StartShellTool (Optional)
- [ ] Accepts `cwd` (optional string)
- [ ] Returns shell session info
- [ ] Marked as `needsApproval: true`

### AC-25-3-4: Unit Tests
- [ ] Each tool has unit tests mocking AgentTerminalTools
- [ ] Tests cover success, timeout, and error cases
- [ ] Minimum 80% coverage

---

## Tasks / Subtasks

- [ ] T1: Add terminal tool types to `types.ts`
  - [ ] ExecuteCommandInputSchema
  - [ ] ExecuteCommandOutput
- [ ] T2: Create `execute-command-tool.ts`
  - [ ] createExecuteCommandTool factory
  - [ ] 2-minute timeout from master plan
- [ ] T3: Write unit tests
  - [ ] `__tests__/execute-command-tool.test.ts`
- [ ] T4: Update `index.ts` exports
- [ ] T5: Run test suite and TypeScript check

---

## Dev Notes

### TanStack AI Tool Pattern (from Story 25-2)

```typescript
import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';

const executeCommandDef = toolDefinition({
  name: 'execute_command',
  description: 'Execute a terminal command',
  inputSchema: z.object({
    command: z.string().describe('Command to run'),
    args: z.array(z.string()).optional().describe('Arguments'),
    timeout: z.number().optional().describe('Timeout in ms'),
  }),
});

// Factory pattern for DI
export function createExecuteCommandTool(getTools: () => AgentTerminalTools) {
  return executeCommandDef.server(async (args: unknown) => {
    const { command, args: cmdArgs, timeout } = args as {...};
    return getTools().executeCommand(command, cmdArgs, { timeout });
  });
}
```

### Architecture Compliance

| Requirement | Implementation |
|-------------|----------------|
| Location | `src/lib/agent/tools/` |
| Depends on | `AgentTerminalTools` facade (Story 12-2) |
| Timeout | 2-minute default (120000ms) per master plan |
| Events | Facade emits `process:started`, `process:output`, `process:exited` |

### Existing Facade Interface (from 12-2)

```typescript
// src/lib/agent/facades/terminal-tools.ts
interface AgentTerminalTools {
  executeCommand(command: string, args?: string[], options?: CommandOptions): Promise<CommandResult>;
  startShell(projectPath?: string): Promise<ShellSession>;
  killProcess(pid: string): Promise<void>;
  isRunning(pid: string): boolean;
}
```

---

## References

- [TanStack AI Tool Definition](https://github.com/tanstack/ai)
- [Story 12-2: AgentTerminalTools Facade](./12-2-create-agentterminaltools-facade.md)
- [Story 25-2: File Tools](./25-2-implement-file-tools.md) - Same pattern
- [Master Plan](./epic-25-12-28-master-implementation-plan.md)

---

## Dev Agent Record

### Agent Model Used
Gemini 2.5 Pro + Antigravity Agent

### Completion Notes List
1. Created `createExecuteCommandTool` factory for DI
2. Used TanStack AI `toolDefinition().server()` pattern (same as Story 25-2)
3. Added 2-minute default timeout per master plan (120000ms)
4. ExecuteCommandInputSchema with command, args, timeout, cwd fields
5. 7 unit tests covering success, errors, timeouts, cwd handling

### File List
- `src/lib/agent/tools/types.ts` (MODIFIED) - Added terminal schemas
- `src/lib/agent/tools/execute-command-tool.ts` (NEW) - 73 lines
- `src/lib/agent/tools/index.ts` (MODIFIED) - Added terminal exports
- `src/lib/agent/tools/__tests__/execute-command-tool.test.ts` (NEW) - 7 tests
