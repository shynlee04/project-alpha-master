# MCP Research Protocol

> **Last Updated:** 2025-12-21  
> **Applies to:** All AI agents developing Via-Gent (Project Alpha)

---

## Purpose

AI agents MUST use MCP (Model Context Protocol) research tools before implementing unfamiliar patterns to avoid:

- ❌ Hallucinating API signatures
- ❌ Using outdated patterns
- ❌ Missing critical implementation details
- ❌ Assuming without verification

---

## Available MCP Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| **Context7** | Library documentation | API signatures, config patterns |
| **Deepwiki** | GitHub repo wikis | Architecture, design decisions |
| **Tavily** | Web search | Recent (2025) best practices |
| **Exa** | Code context search | Implementation examples |
| **Repomix** | Codebase analysis | Current project structure |

---

## Required Research Steps

### Before Implementing New Feature

```bash
# Step 1: Check library documentation
mcp_context7_resolve-library-id --libraryName "tanstack ai"
mcp_context7_get-library-docs --context7CompatibleLibraryID "/tanstack/ai" --topic "client tools"

# Step 2: Search for current patterns
mcp_exa_get_code_context_exa --query "TanStack AI client-side tool callbacks 2025"

# Step 3: Check project wiki if relevant
mcp_deepwiki_read_wiki_structure --repoName "stackblitz/webcontainers"
```

### Before Using New Library

```bash
# Step 1: Verify library exists and get docs
mcp_context7_resolve-library-id --libraryName "zustand"
mcp_context7_get-library-docs --context7CompatibleLibraryID "/pmndrs/zustand" --topic "react hooks"

# Step 2: Check for recent changes/updates
mcp_tavily_tavily-search --query "zustand 5.x breaking changes 2025"
```

### Before Major Refactoring

```bash
# Step 1: Analyze current structure
mcp_repomix_pack_codebase --directory "src/lib/filesystem" --style xml

# Step 2: Search for best practices
mcp_exa_get_code_context_exa --query "React file system access API patterns"
```

---

## Research Triggers

### ALWAYS Research When

- Using a library for the first time
- Implementing a complex pattern (SSR, streaming, workers)
- Integrating multiple technologies
- Handling browser-specific APIs (FSA, WebContainers, IndexedDB)
- Making architectural decisions

### MAY Skip Research When

- Simple styling changes
- Adding translations
- Updating existing patterns consistently
- Minor bug fixes in well-understood code

---

## Documentation

After researching, document findings in:

1. **Code comments** for complex implementations
2. **Architecture.md** for architectural decisions
3. **Retrospectives** for lessons learned

---

## Example: TanStack AI Tool Implementation

```markdown
## Research Conducted

1. **Context7**: Checked `/tanstack/ai` docs for `clientTools` API
2. **Exa**: Found pattern for tool result streaming
3. **Repomix**: Analyzed current `src/lib/agent` structure

## Key Findings

- Tools must return structured `ToolResult<T>` objects
- Use `onToolCall` callback for async execution
- Streaming requires SSE endpoint

## Implementation Notes

Based on research, implementing tool registry with typed definitions...
```

---

## Failure Mode

If MCP tools are unavailable:

1. **Log the issue** in development notes
2. **Use web search** as fallback
3. **Add TODO comment** to verify later
4. **Flag in PR** for manual review
