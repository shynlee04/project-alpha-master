---
date: '2025-12-31'
time: '03:30:00'
phase: 'Implementation'
team: 'Team-A'
agent_mode: 'bmad-core-bmad-master'
---

# MCP Research Standards

_Standards for conducting research using Model Context Protocol (MCP) tools. This document defines best practices for using MCP servers to gather accurate, up-to-date information for implementation decisions._

---

## 1. MCP Research Protocol Overview

### 1.1 Available MCP Servers

| MCP Server | Purpose | Use When |
|------------|---------|----------|
| **Context7** | Official documentation queries | Library APIs, framework patterns, official guides |
| **Deepwiki** | Semantic tech stack questions | Architecture decisions, repo wikis, TanStack/WebContainer |
| **Tavily** | Web search and extraction | Current best practices, tutorials, blog posts |
| **Exa** | Semantic code search | Code examples, GitHub repos, technical discussions |
| **Repomix** | Codebase analysis | Understanding project structure, patterns |
| **filesystem** | Local file operations | Reading/writing project files |

### 1.2 Research Workflow

```
Step 1: Identify Research Need
    ↓
Step 2: Select Appropriate MCP Server(s)
    ↓
Step 3: Formulate Query (2-3 iterations)
    ↓
Step 4: Validate Results (minimum 3 sources)
    ↓
Step 5: Synthesize and Document
    ↓
Step 6: Apply to Implementation
```

---

## 2. Context7 MCP Usage

### 2.1 When to Use Context7

Use Context7 for:
- Official library documentation queries
- API signatures and usage patterns
- Framework configuration options
- TypeScript type definitions
- Best practices from library maintainers

### 2.2 Two-Step Query Process

Context7 requires a two-step process:

**Step 1: Resolve Library ID**
```typescript
// First, resolve the library to get Context7-compatible ID
mcp--context7--resolve-library-id({
  query: "How to use TanStack Router with TypeScript",
  libraryName: "@tanstack/react-router"
})
// Returns: "/tanstack/react-router" or similar
```

**Step 2: Query Documentation**
```typescript
// Then query the documentation with the resolved ID
mcp--context7--query-docs({
  libraryId: "/tanstack/react-router",
  query: "How to create typed route parameters with TanStack Router?"
})
// Returns: Documentation excerpts with code examples
```

### 2.3 Scoring-Based Selection

Context7 returns scored results. Use the highest-scoring result unless:
- The result is outdated (check date)
- The result doesn't match our use case
- A lower-scoring result is more specific to our need

**Selection Criteria:**
| Score | Action |
|-------|--------|
| 90-100 | Use directly |
| 70-89 | Validate against other sources |
| <70 | Reformulate query or try different library |

---

## 3. Deepwiki MCP Usage

### 3.1 When to Use Deepwiki

Use Deepwiki for:
- Semantic questions about tech stacks
- Architecture decisions and patterns
- Repository-specific knowledge (WebContainer, xterm.js)
- Understanding complex systems
- Best practices from established projects

### 3.2 Wiki Structure Query

```typescript
// Get available documentation topics
mcp--deepwiki--read_wiki_structure({
  repoName: "stackblitz/webcontainer"
})
// Returns: List of documentation sections
```

### 3.3 Semantic Question Query

```typescript
// Ask a semantic question about the repository
mcp--deepwiki--ask_question({
  repoName: "stackblitz/webcontainer",
  question: "How does WebContainer handle file synchronization and what are the limitations?"
})
// Returns: Detailed explanation with context
```

### 3.4 Content Query

```typescript
// Get specific documentation content
mcp--deepwiki--read_wiki_contents({
  repoName: "tanstack/router"
})
// Returns: Full documentation content
```

---

## 4. Tavily MCP Usage

### 4.1 When to Use Tavily

Use Tavily for:
- Current best practices (2025 standards)
- Tutorial and blog post references
- Community discussions and patterns
- Competitive analysis
- Troubleshooting guides

### 4.2 Search Configuration

```typescript
// Basic search
mcp--tavily--tavily-search({
  query: "React 19 Zustand best practices 2025",
  max_results: 10
})

// Advanced search with time filter
mcp--tavily--tavily-search({
  query: "TanStack AI streaming patterns",
  time_range: "month",  // Last month
  include_raw_content: true
})

// News/updates search
mcp--tavily--tavily-search({
  query: "WebContainer new features 2025",
  topic: "news",
  days: 30
})
```

### 4.3 Content Extraction

```typescript
// Extract content from specific URLs
mcp--tavily--tavily-extract({
  urls: [
    "https://tanstack.com/ai/latest/docs/api/functions/create-chat-api",
    "https://developer.stackblitz.com/platform/api/webcontainer-api"
  ],
  extract_depth: "advanced"
})
```

### 4.4 Site Crawling

```typescript
// Crawl documentation site
mcp--tavily--tavily-crawl({
  url: "https://tanstack.com/router",
  max_depth: 2,
  limit: 20,
  instructions: "Extract all information about route configuration and types"
})
```

---

## 5. Exa MCP Usage

### 5.1 When to Use Exa

Use Exa for:
- Semantic code search across GitHub
- Finding code examples and patterns
- Understanding library usage in real projects
- Finding related projects for reference
- Technical discussion search

### 5.2 Code Context Search

```typescript
// Search for code examples
mcp--exa--get_code_context_exa({
  query: "React Zustand persist middleware with Dexie IndexedDB TypeScript example",
  tokensNum: 5000
})
// Returns: Relevant code snippets with context
```

### 5.3 Web Search

```typescript
// Web search with live crawling
mcp--exa--web_search_exa({
  query: "best practices for React component testing with Vitest 2025",
  numResults: 10,
  type: "deep"
})
```

---

## 6. Repomix MCP Usage

### 6.1 When to Use Repomix

Use Repomix for:
- Understanding project structure
- Analyzing existing patterns
- Codebase overview for new developers
- Finding related code
- Generating skill packages

### 6.2 Codebase Analysis

```typescript
// Pack local codebase for analysis
mcp--repomix--pack_codebase({
  directory: "/Users/apple/Documents/coding-projects/project-alpha-master",
  style: "xml",
  topFilesLength: 20
})

// Pack with specific patterns
mcp--repomix--pack_codebase({
  directory: "/Users/apple/Documents/coding-projects/project-alpha-master/src/lib/agent",
  includePatterns: "**/*.ts",
  compress: true
})
```

### 6.3 Remote Repository Analysis

```typescript
// Analyze remote repository
mcp--repomix--pack_remote_repository({
  remote: "https://github.com/TanStack/router",
  style: "markdown",
  compress: true
})
```

### 6.4 Output Analysis

```typescript
// Attach and read packed output
mcp--repomix--attach_packed_output({
  path: "/Users/apple/Documents/coding-projects/project-alpha-master/repomix_output.xml"
})

// Search within packed output
mcp--repomix--grep_repomix_output({
  outputId: "abc123",
  pattern: "useShallow.*zustand",
  contextLines: 3
})
```

---

## 7. Research Validation Requirements

### 7.1 Minimum Source Requirement

Per BMAD V6 rules, all technical decisions MUST be validated against:

| Requirement | Minimum |
|-------------|---------|
| MCP server tools used | 3 |
| Iterative executions | 5 |
| Source citations | 3 |

### 7.2 Validation Checklist

Before applying research to implementation:

- [ ] Source is from official docs or reputable community
- [ ] Information is current (check date)
- [ ] Pattern matches our tech stack version
- [ ] Example code compiles with our TypeScript config
- [ ] Pattern is used in similar projects
- [ ] Potential issues are documented

### 7.3 Source Credibility Matrix

| Source Type | Credibility | Use For |
|-------------|-------------|---------|
| Official docs (Context7) | ★★★★★ | API signatures, configuration |
| Library GitHub issues | ★★★★ | Known limitations, workarounds |
| Deepwiki repo docs | ★★★★ | Architecture decisions |
| Exa code search | ★★★ | Implementation patterns |
| Tavily tutorials | ★★★ | Best practices, examples |
| Stack Overflow | ★★ | Quick solutions, verify with docs |

---

## 8. Query Formulation Best Practices

### 8.1 Effective Query Patterns

**Good Queries:**
```typescript
// Specific API usage
"How to use TanStack AI createChat API with streaming"

// Problem-focused
"Handling WebContainer file sync race conditions TypeScript"

// Version-specific
"React 19 useEffect cleanup pattern with TypeScript"

// Architecture question
"Best practice for Zustand store persistence with IndexedDB"
```

**Bad Queries:**
```typescript
// Too vague
"React state management"

// Too broad
"How to build a code editor with AI agent"

// Missing context
"Error handling"
```

### 8.2 Iterative Refinement

```typescript
// Iteration 1: Initial query
// Query: "Zustand with IndexedDB"
// Result: Too general, many approaches

// Iteration 2: Refined query
// Query: "Zustand persist middleware Dexie IndexedDB TypeScript"
// Result: Better, but some outdated

// Iteration 3: Final query
// Query: "Zustand 5.0 Dexie 4.0 persist storage TypeScript 2025"
// Result: Perfect match
```

---

## 9. Research Documentation

### 9.1 Required Documentation Format

All research MUST be documented:

```markdown
---
date: YYYY-MM-DD
query: Original research query
sources:
  - { name: "Context7 - @tanstack/react-router", url: "...", score: 95 }
  - { name: "Deepwiki - WebContainer", url: "...", score: 88 }
  - { name: "Tavily - Blog post", url: "...", date: "2025-12-15" }
findings:
  - Summary of key information
  - Code examples extracted
  - Best practice identified
validation:
  - Cross-referenced with codebase patterns
  - Verified against current version
  - Tested in isolation (if applicable)
application:
  - How this will be applied
  - Files affected
  - Implementation notes
---
```

### 9.2 Artifact Location

Research artifacts are stored in:
- `_bmad-output/research-artifacts/` - Major research
- `_bmad-output/docs/2025-MM-DD/` - Story-specific research
- Inline comments for small findings

---

## 10. Project-Specific Research Triggers

### 10.1 Mandatory Research Scenarios

Research MUST be conducted before implementing:

| Scenario | Trigger | Required Tools |
|----------|---------|----------------|
| New library integration | `import` of unfamiliar library | Context7 + Deepwiki |
| New API usage | `new` keyword or `import` from library | Context7 + Exa |
| Complex state patterns | `createStore` or `create()` | Context7 + Repomix |
| File system operations | `fs` or FileSystem Access API | Context7 + Deepwiki |
| AI/LLM integration | `ai` or `llm` imports | Context7 + Tavily |
| UI component patterns | New Radix UI or component library | Context7 + Exa |

### 10.2 Research Before Code

The MCP research protocol is MANDATORY before:

1. **Creating new agent tools** → Research tool patterns
2. **Adding new providers** → Research provider adapter interface
3. **Implementing stores** → Research state patterns
4. **Adding API routes** → Research API patterns
5. **Using new hooks** → Research hook patterns

---

## 11. Common Research Patterns

### 11.1 Zustand + Dexie Research

```typescript
// Query pattern for state persistence
const research = {
  query: "Zustand 5.0 persist middleware with Dexie IndexedDB TypeScript",
  tools: [
    "context7:resolve-library-id:zustand",
    "context7:query-docs:zustand persist middleware",
    "exa:get_code_context_exa:Zustand Dexie persist example"
  ]
};
```

### 11.2 TanStack AI Research

```typescript
// Query pattern for AI streaming
const research = {
  query: "TanStack AI 0.2 createChatProvider streaming SSE TypeScript",
  tools: [
    "context7:resolve-library-id:@tanstack/ai",
    "context7:query-docs:streaming responses",
    "deepwiki:ask_question:How to handle SSE streaming in TanStack AI"
  ]
};
```

### 11.3 WebContainer Research

```typescript
// Query pattern for WebContainer integration
const research = {
  query: "WebContainer API file sync limitations cross-origin isolation",
  tools: [
    "deepwiki:read_wiki_structure:stackblitz/webcontainer",
    "deepwiki:ask_question:How does WebContainer handle file synchronization",
    "tavily:search:WebContainer best practices 2025"
  ]
};
```

---

## 12. Research Quality Gates

### 12.1 Before Implementation

Research must pass these gates:

| Gate | Check |
|------|-------|
| Source Quality | All sources have credibility ≥ 3 stars |
| Currency | Sources from last 12 months (or stable version) |
| Completeness | All aspects of implementation covered |
| Validation | Minimum 3 sources agree on approach |

### 12.2 Documentation Check

| Check | Required |
|-------|----------|
| Frontmatter | date, query, sources documented |
| Findings | Key information summarized |
| Application | Implementation approach clear |
| References | URLs and versions cited |

---

## Related Documents

- [`coding-style.md`](coding-style.md): Coding conventions
- [`error-handling.md`](error-handling.md): Error handling patterns
- [`validation.md`](validation.md): Data validation standards
- [`.agent/rules/general-rules.md`](../../../.agent/rules/general-rules.md): AI agent rules
- [AGENTS.md](../../../../AGENTS.md): Project development patterns

---

*Last updated: 2025-12-31*
*Maintained by: @bmad-core-bmad-master*
*Next review: 2026-01-15*
