# AI Agent Instructions: Using Local Dependency Libraries

**Created:** 2025-12-11  
**Purpose:** Guide AI agents on effectively using locally downloaded dependency libraries for accurate pattern learning and implementation.

---

## Overview

The `docs/dependencies-libraries/` directory contains full repositories and documentation of critical dependencies used in this project. These exist to provide AI agents with **accurate, verified patterns** rather than relying on assumptions from training data.

### Available Libraries

| Library | Location | Purpose |
|---------|----------|---------|
| **TanStack AI** | `tanstack-ai/` | AI chat, tools, streaming patterns |
| **TanStack Router** | `router-main/` | File-based routing, search params |
| **TanStack Store** | `store-main/` | Reactive state management |
| **WebContainers** | `webcontainer-api-starter-main/`, `webcontainer-docs-main/` | Browser-based Node.js runtime |
| **Monaco React** | `monaco-react-master/` | React bindings for Monaco Editor |
| **xterm.js** | `xterm.js-master/` | Terminal emulation |
| **isomorphic-git** | `isomorphic-git-main/` | Client-side Git implementation |
| **Roo Code** | `Roo-Code-main/` | Reference for agentic coding patterns |
| **DevTools** | `devtools-main/` | TanStack DevTools integration |

---

## Mandatory Research Protocol

### Before ANY Implementation

1. **Query local libraries FIRST** using innate tools
2. **Validate patterns** with MCP tools for latest updates
3. **Cross-reference** with official docs via Context7

### Tool Usage Priority

```
Priority 1: Local Search (Fast Context, grep, read_file)
     ↓
Priority 2: Local MCP (Repomix pack_codebase)
     ↓
Priority 3: External MCP (DeepWiki, Context7, Tavily)
     ↓
Priority 4: Web Search (for latest compatibility data)
```

---

## Innate Tools for Local Libraries

### Fast Context (code_search)

Use for broad pattern discovery:

```
Search: "useChat hook implementation patterns"
Folder: /docs/dependencies-libraries/tanstack-ai/
```

### Grep Search (grep_search)

Use for specific API signatures:

```yaml
Query: "toolDefinition"
SearchPath: /docs/dependencies-libraries/tanstack-ai/
Includes: ["*.ts", "*.tsx"]
```

### Read File (read_file)

After locating relevant files, read implementation details:

```
Path: /docs/dependencies-libraries/tanstack-ai/packages/core/src/tool.ts
```

---

## MCP Tools for Extended Research

### Repomix MCP (Local Repo Packing)

When local library content needs comprehensive analysis:

```typescript
// Pack entire local library for analysis
mcp10_pack_codebase({
  directory: "/docs/dependencies-libraries/tanstack-ai/",
  includePatterns: "**/*.ts,**/*.tsx",
  style: "xml"
})

// Then search packed output
mcp10_grep_repomix_output({
  outputId: "[returned-id]",
  pattern: "toolDefinition",
  contextLines: 5
})
```

### DeepWiki MCP (GitHub Repo Semantics)

When you need conceptual understanding beyond code:

```typescript
// Ask comprehensive questions about patterns
mcp2_ask_question({
  repoName: "TanStack/router",
  question: "How does file-based routing work with search params validation using Zod?"
})

// Get wiki structure first for complex topics
mcp2_read_wiki_structure({
  repoName: "stackblitz/webcontainer-core"
})
```

**Key DeepWiki Repos:**
- `TanStack/router` - Routing patterns
- `TanStack/query` - Data fetching patterns
- `stackblitz/webcontainer-core` - WebContainers API
- `stackblitz/webcontainer-docs` - WebContainers guides
- `xtermjs/xterm.js` - Terminal integration
- `isomorphic-git/isomorphic-git` - Git client patterns

### Context7 MCP (Official Documentation)

For authoritative API reference:

```typescript
// First resolve library ID
mcp1_resolve-library-id({ libraryName: "TanStack AI" })

// Then get specific documentation
mcp1_get-library-docs({
  context7CompatibleLibraryID: "/tanstack/ai",
  topic: "tool creation patterns",
  mode: "code"
})
```

### Tavily/Exa MCP (Latest Updates)

For browser compatibility and recent changes:

```typescript
mcp13_tavily-search({
  query: "TanStack AI 0.0.3 tool server pattern December 2025",
  max_results: 10,
  search_depth: "advanced"
})
```

---

## Library-Specific Patterns

### TanStack AI (`tanstack-ai/`)

**Key Files to Search:**
- `packages/core/src/tool.ts` - Tool definition patterns
- `packages/core/src/chat.ts` - Chat function patterns
- `packages/react/src/hooks/useChat.ts` - React hook patterns
- `packages/gemini/src/index.ts` - Gemini adapter patterns

**Critical Patterns:**
```typescript
// Tool definition (server-side)
const myTool = toolDefinition({
  description: "...",
  parameters: z.object({ /* ... */ }),
}).server(async ({ input }) => {
  // Tool implementation
  return result;
});

// Chat handler
export const { POST } = createServerFileRoute('/api/chat')({
  handler: async ({ request }) => {
    const { messages, tools } = await request.json();
    return chat({
      model: createGemini(apiKey),
      messages,
      tools,
    }).then(toStreamResponse);
  }
});
```

### WebContainers (`webcontainer-docs-main/docs/`)

**Key Files:**
- `docs/guides/working-with-the-file-system.md` - FS operations
- `docs/guides/running-processes.md` - Process spawn patterns
- `docs/api.md` - Full API reference
- `docs/guides/ai-agents.md` - AI integration patterns

**Critical Patterns:**
```typescript
// Boot and file system
const container = await WebContainer.boot();
await container.mount(files);

// Process with terminal
const proc = await container.spawn('npm', ['run', 'dev']);
proc.output.pipeTo(new WritableStream({
  write(data) { terminal.write(data); }
}));

// Resize terminal
proc.resize({ cols: 80, rows: 24 });
```

### xterm.js (`xterm.js-master/`)

**Key Files:**
- `src/browser/public/Terminal.ts` - Main Terminal API
- `addons/addon-fit/src/FitAddon.ts` - Auto-sizing
- `addons/addon-webgl/` - Performance rendering

**Critical Patterns:**
```typescript
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';

const terminal = new Terminal({ cursorBlink: true });
const fitAddon = new FitAddon();
terminal.loadAddon(fitAddon);
terminal.open(element);
fitAddon.fit();

// Cleanup
terminal.dispose();
```

### isomorphic-git (`isomorphic-git-main/`)

**Key Files:**
- `src/commands/*.js` - Git command implementations
- `src/models/*.js` - Data models

**Critical Patterns:**
```typescript
import * as git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';

// Use with custom FS (not node fs)
await git.clone({
  fs,
  http,
  dir: '/project',
  url: 'https://github.com/user/repo',
  corsProxy: 'https://cors.isomorphic-git.org'
});
```

### Monaco Editor (`monaco-react-master/`)

**Key Files:**
- `src/Editor/Editor.tsx` - Main editor component
- `src/hooks/*.ts` - React integration hooks

---

## Roo Code Reference Patterns

The `Roo-Code-main/` repository demonstrates professional agentic coding patterns:

### Tool Architecture

**BaseTool Pattern** (`src/core/tools/BaseTool.ts`):
```typescript
abstract class BaseTool<TName extends ToolName> {
  abstract readonly name: TName;
  abstract parseLegacy(params: Record<string, string>): ToolParams<TName>;
  abstract execute(params: ToolParams<TName>, task: Task, callbacks: ToolCallbacks): Promise<void>;
  async handlePartial(task: Task, block: ToolUse<TName>): Promise<void> {}
}
```

### MCP Integration

**MCP Tool Use** (`src/core/prompts/tools/use-mcp-tool.ts`):
- Server name + Tool name + JSON arguments pattern
- Defined input schemas for parameters

### Mode-Based Tool Filtering

**Filter Tools for Mode** (`src/core/prompts/tools/filter-tools-for-mode.ts`):
- Tools filtered by mode configuration
- Native tools vs MCP tools separation

---

## Fallback Protocol

When local libraries are **not accessible** or dependency is **not available locally**:

### Step 1: Try DeepWiki

```typescript
mcp2_ask_question({
  repoName: "[owner]/[repo]",
  question: "[specific implementation question]"
})
```

### Step 2: Try Context7

```typescript
mcp1_resolve-library-id({ libraryName: "[library name]" })
mcp1_get-library-docs({ context7CompatibleLibraryID: "[id]", topic: "[topic]" })
```

### Step 3: Try Tavily/Exa

```typescript
mcp13_tavily-search({
  query: "[library] [specific pattern] [current year]",
  search_depth: "advanced"
})
```

### Step 4: Web Search

```typescript
search_web({
  query: "[library] [pattern] official documentation"
})
```

---

## Anti-Patterns to Avoid

1. **❌ Assuming API patterns from memory** - Always verify with local/MCP sources
2. **❌ Using outdated patterns** - Check version-specific implementations
3. **❌ Ignoring local libraries** - They exist for accuracy
4. **❌ Single-source verification** - Cross-reference multiple tools
5. **❌ Skipping type definitions** - Always check `.d.ts` files

---

## Verification Checklist

Before implementing any dependency integration:

- [ ] Searched local library for relevant patterns
- [ ] Verified API signatures match project version
- [ ] Cross-referenced with official docs (Context7/DeepWiki)
- [ ] Checked browser compatibility (Tavily for Fugu APIs)
- [ ] Reviewed existing project implementations for consistency
- [ ] Validated types match TypeScript definitions

---

## Quick Reference Commands

```bash
# List all local libraries
ls -la docs/dependencies-libraries/

# Find specific patterns
grep -r "toolDefinition" docs/dependencies-libraries/tanstack-ai/

# Count implementations
grep -rc "useChat" docs/dependencies-libraries/tanstack-ai/

# Find type definitions
find docs/dependencies-libraries/ -name "*.d.ts" | head -20
```

---

*This document should be referenced by all AI agents before implementing any code that uses project dependencies.*
