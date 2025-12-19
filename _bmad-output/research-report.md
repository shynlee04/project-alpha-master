# Technical Research Report - WebContainer & AI Agent Integration

> **Generated:** 2025-12-20  
> **Research Type:** Technical  
> **Sources:** Context7, Deepwiki, Exa, Official Docs

---

## Executive Summary

This research addresses critical integration issues for Project Alpha, focusing on:
1. WebContainer terminal working directory (BUG-01)
2. TanStack AI tool architecture patterns
3. xterm.js best practices for WebContainer integration

### Key Findings

| Issue | Solution | Confidence |
|-------|----------|------------|
| Terminal CWD | Use `spawn('jsh', { cwd: '/project' })` | ✅ High |
| AI Tools | Use `createServerFnTool` pattern | ✅ High |
| xterm.js | FitAddon + proper resize handling | ✅ High |

---

## Research Finding 1: WebContainer Spawn CWD Option

### Source
- Context7: `/websites/webcontainers_io_guides`
- Deepwiki: `stackblitz/webcontainer-docs`

### Critical Discovery

**The WebContainer API v1.2.0+ supports a `cwd` option in `SpawnOptions`:**

```typescript
// CORRECT - Sets working directory for spawned process
webcontainerInstance.spawn('jsh', { 
  cwd: '/project/path' 
});

// CORRECT - Run npm install in specific directory
webcontainerInstance.spawn('npm', ['install'], { 
  cwd: '/project' 
});

// ALTERNATIVE - Using turbo for cwd
webcontainer.spawn('turbo', [
  '--cwd', `~/projects/${id}`, 
  'exec', 'astro', 'dev'
]);
```

### SpawnOptions Interface

```typescript
interface SpawnOptions {
  cwd?: string;      // Working directory (relative to workdir)
  env?: Record<string, string | number | boolean>;
  output?: boolean;  // If false, no terminal output
  terminal?: { cols: number; rows: number };
}
```

### Application to BUG-01

**Current broken code:**
```typescript
// src/lib/webcontainer/terminal-adapter.ts
await this.webContainer.spawn('jsh'); // Spawns at root
```

**Fixed code:**
```typescript
await this.webContainer.spawn('jsh', { 
  cwd: projectPath  // Use the mounted project path
});
```

---

## Research Finding 2: TanStack AI Tool Architecture

### Source
- Exa: TanStack/ai GitHub
- Context7: `/websites/tanstack_start`

### createServerFnTool Pattern

TanStack AI provides a unified pattern for defining AI tools that are also callable as server functions:

```typescript
import { createServerFnTool } from '@tanstack/ai-react';
import { z } from 'zod';

// Define once - get both AI tool AND server function
const getProducts = createServerFnTool({
  name: 'getProducts',
  inputSchema: z.object({ 
    query: z.string() 
  }),
  execute: async ({ query }) => db.products.search(query),
});

// Use in AI chat
chat({ tools: [getProducts.server] });

// Call directly from components (no API endpoint needed!)
const products = await getProducts.serverFn({ query: 'laptop' });
```

### Tool Type Safety

```typescript
// Full type inference for tool calls
message.parts.forEach((part) => {
  if (part.type === 'tool-call' && part.name === 'add_to_cart') {
    // ✅ TypeScript knows part.name is 'add_to_cart'
    // ✅ part.input is typed as { itemId: string, quantity: number }
    // ✅ part.output is typed as expected
    console.log(part.output.cartId);
  }
});
```

### Parallel Tool Execution

TanStack AI supports parallel tool calls:

```
User: "Compare the weather in NYC, SF, and LA"

LLM calls (parallel):
- get_weather({city: "NYC"}) [index: 0]
- get_weather({city: "SF"}) [index: 1]
- get_weather({city: "LA"}) [index: 2]

All execute simultaneously, then LLM generates comparison.
```

### Application to Project Alpha

For implementing the developer agent tools (Epic 6):

```typescript
// src/lib/tools/implementations/read-file.ts
import { createServerFnTool } from '@tanstack/ai-react';
import { z } from 'zod';

export const readFileTool = createServerFnTool({
  name: 'read_file',
  inputSchema: z.object({
    path: z.string().describe('Relative path to file'),
    startLine: z.number().optional(),
    endLine: z.number().optional(),
  }),
  execute: async ({ path, startLine, endLine }) => {
    // Use SyncManager for unified file access
    const content = await syncManager.readFile(path);
    return { content };
  },
});
```

---

## Research Finding 3: xterm.js Integration Best Practices

### Source
- Context7: `/xtermjs/xterm.js`

### FitAddon for Proper Sizing

```typescript
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';

const terminal = new Terminal({
  cursorBlink: true,
  fontSize: 14
});

const fitAddon = new FitAddon();
terminal.loadAddon(fitAddon);

// Open terminal in container
terminal.open(containerElement);

// Fit to container size
fitAddon.fit();

// Handle terminal resize
terminal.onResize(({ cols, rows }) => {
  // Notify WebContainer process of new dimensions
  process.resize({ cols, rows });
});
```

### WebContainer + xterm.js Integration Pattern

```typescript
// Full integration pattern
const process = await webcontainerInstance.spawn('jsh', { 
  cwd: projectPath,
  terminal: { cols, rows }
});

// Pipe output to xterm
process.output.pipeTo(new WritableStream({
  write(data) {
    terminal.write(data);
  }
}));

// Pipe input from xterm to process
const inputWriter = process.input.getWriter();
terminal.onData((data) => {
  inputWriter.write(data);
});
```

---

## Research Finding 4: TanStack Start Server Functions

### Source
- Context7: `/websites/tanstack_start`

### Key Patterns

```typescript
// Create server-only function
import { createServerFn } from '@tanstack/react-start';

const getPosts = createServerFn()
  .validator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    const posts = await db.posts.findMany({
      where: { userId: data.userId }
    });
    return posts;
  });

// Use in route loader
export const Route = createFileRoute('/posts')({
  loader: () => getPosts(),
});

// Use with useQuery
function PostList() {
  const getPosts = useServerFn(getServerPosts);
  
  const { data } = useQuery({
    queryKey: ['posts'],
    queryFn: () => getPosts(),
  });
}
```

### Middleware Pattern

```typescript
import { createMiddleware } from '@tanstack/react-start';

const loggingMiddleware = createMiddleware({ type: 'function' })
  .client(() => {
    console.log('Client-side logging');
  })
  .server(() => {
    console.log('Server-side logging');
  });
```

---

## Recommendations for Epic 13 (BUG-01 Fix)

### Immediate Fix

1. **Update `TerminalAdapter.startShell()` signature:**
   ```typescript
   async startShell(projectPath?: string): Promise<void>
   ```

2. **Pass `cwd` option to spawn:**
   ```typescript
   this.shellProcess = await this.webContainer.spawn('jsh', {
     cwd: projectPath || '/',
     terminal: { cols: this.cols, rows: this.rows }
   });
   ```

3. **Update `XTerminal.tsx` to receive project path:**
   ```typescript
   interface XTerminalProps {
     projectPath?: string;
   }
   
   // Pass to startShell
   await adapter.startShell(projectPath);
   ```

### Validation

Test by:
1. Opening a project with `package.json` in root
2. Running `ls` in terminal - should show project files
3. Running `npm install` - should find `package.json`

---

## Recommendations for Epic 6 (AI Agent Tools)

### Tool Registry Pattern

```typescript
// src/lib/tools/registry.ts
class ToolRegistry {
  private tools: Map<string, ServerFnTool>;
  
  register(tool: ServerFnTool) {
    this.tools.set(tool.name, tool);
  }
  
  getToolsForChat(): Tool[] {
    return Array.from(this.tools.values())
      .map(t => t.server);
  }
}
```

### Planned Tools (from roo-code-agent-patterns.md)

| Tool | Priority | Status |
|------|----------|--------|
| `read_file` | P0 | Design |
| `write_file` | P0 | Design |
| `list_files` | P0 | Design |
| `execute_command` | P1 | Design |
| `search_code` | P2 | Future |
| `apply_diff` | P2 | Future |

---

## Sources Consulted

| Source | Tool | Topic |
|--------|------|-------|
| webcontainers.io/guides | Context7 | Spawn options, cwd |
| stackblitz/webcontainer-docs | Deepwiki | SpawnOptions interface |
| xtermjs/xterm.js | Context7 | FitAddon, integration |
| TanStack/ai | Exa | createServerFnTool |
| tanstack.com/start | Context7 | Server functions |

---

*Generated by BMAD Research Workflow - 2025-12-20*
