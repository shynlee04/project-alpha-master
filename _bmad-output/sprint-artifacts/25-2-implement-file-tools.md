# Story 25-2: Implement File Tools

**Epic:** [25 - AI Foundation Sprint](../epics/epic-25-ai-foundation-sprint.md)  
**Status:** `ready-for-dev`  
**Priority:** P0 (enables agent file operations)  
**Points:** 5  
**Created:** 2025-12-23T20:05:00+07:00

---

## Story

As a **developer using the AI agent**,  
I want **the agent to read, write, and list files in my project**,  
so that **it can understand my codebase and make changes on my behalf**.

---

## Acceptance Criteria

### AC-25-2-1: Tool Definition Pattern
- [ ] Each tool uses TanStack AI `toolDefinition()` with Zod schemas
- [ ] Tools follow the server tool pattern from TanStack AI 0.2.0

### AC-25-2-2: ReadFileTool
- [ ] Accepts `path` (string) - relative path to read
- [ ] Returns file content as string
- [ ] Uses `AgentFileTools.readFile()` facade
- [ ] Handles binary files (returns base64)

### AC-25-2-3: WriteFileTool  
- [ ] Accepts `path` (string), `content` (string)
- [ ] Marks `needsApproval: true` for approval flow (Story 25-5)
- [ ] Uses `AgentFileTools.writeFile()` with FileLock

### AC-25-2-4: ListFilesTool
- [ ] Accepts `path` (string) - directory path
- [ ] Returns array of file/directory entries
- [ ] Uses `AgentFileTools.listFiles()` facade

### AC-25-2-5: Unit Tests
- [ ] Each tool has unit tests mocking AgentFileTools
- [ ] Tests cover success, error, and edge cases
- [ ] Minimum 80% coverage

---

## Tasks / Subtasks

- [ ] T1: Create `src/lib/agent/tools/types.ts` (AC: all)
  - [ ] ToolConfig interface
  - [ ] ToolResult interface
  - [ ] ToolExecutionContext interface
- [ ] T2: Create `src/lib/agent/tools/base-tool.ts` (AC: 1)
  - [ ] Abstract base using toolDefinition pattern
- [ ] T3: Create `src/lib/agent/tools/read-file-tool.ts` (AC: 2)
  - [ ] ReadFileTool with AgentFileTools integration
- [ ] T4: Create `src/lib/agent/tools/write-file-tool.ts` (AC: 3)
  - [ ] WriteFileTool with needsApproval flag
- [ ] T5: Create `src/lib/agent/tools/list-files-tool.ts` (AC: 4)
  - [ ] ListFilesTool with directory listing
- [ ] T6: Create `src/lib/agent/tools/index.ts`
  - [ ] Export all tools and types
- [ ] T7: Write unit tests (AC: 5)
  - [ ] `__tests__/read-file-tool.test.ts`
  - [ ] `__tests__/write-file-tool.test.ts`
  - [ ] `__tests__/list-files-tool.test.ts`
- [ ] T8: Run test suite and TypeScript check

---

## Dev Notes

### TanStack AI Tool Pattern (v0.2.0 - December 2025)

```typescript
import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';

// Define tool with Zod schema
const readFileDef = toolDefinition({
  name: 'read_file',
  description: 'Read content of a file',
  inputSchema: z.object({
    path: z.string().describe('Relative file path'),
  }),
});

// Server-side implementation
const readFile = readFileDef.server(async ({ path }) => {
  const tools = getFileToolsFacade();
  return tools.readFile(path);
});

// Use in chat
chat({
  adapter,
  messages,
  tools: [readFile],
});
```

### Architecture Compliance

| Requirement | Implementation |
|-------------|----------------|
| Location | `src/lib/agent/tools/` |
| Depends on | `AgentFileTools` facade (Epic 12, Story 12-1) |
| FileLock | Write operations use `FileLock` from 12-1B |
| Events | Emit via `WorkspaceEventEmitter` |

### File Structure

```
src/lib/agent/tools/
├── types.ts              # Tool interfaces
├── base-tool.ts          # Abstract base (optional)
├── read-file-tool.ts     # ReadFileTool
├── write-file-tool.ts    # WriteFileTool
├── list-files-tool.ts    # ListFilesTool
├── index.ts              # Exports
└── __tests__/
    ├── read-file-tool.test.ts
    ├── write-file-tool.test.ts
    └── list-files-tool.test.ts
```

### Dependencies

```json
{
  "@tanstack/ai": "^0.2.0",
  "zod": "^3.23.8"
}
```

### Testing Pattern

```typescript
// Mock AgentFileTools facade
vi.mock('@/lib/agent/facades', () => ({
  fileToolsFacade: {
    readFile: vi.fn().mockResolvedValue('file content'),
    writeFile: vi.fn().mockResolvedValue(undefined),
    listFiles: vi.fn().mockResolvedValue([{ name: 'test.ts', type: 'file' }]),
  },
}));
```

---

## References

- [TanStack AI Tool Definition](https://github.com/tanstack/ai) - toolDefinition pattern
- [Story 12-1: AgentFileTools Facade](./12-1-create-agentfiletools-facade.md)
- [Story 12-1B: FileLock](./12-1b-add-concurrency-control.md)
- [Story 25-0: ProviderAdapterFactory](./25-0-create-provideradapterfactory.md)
- [Master Plan](./epic-25-12-28-master-implementation-plan.md)

---

## Dev Agent Record

### Agent Model Used


### Completion Notes List


### File List

