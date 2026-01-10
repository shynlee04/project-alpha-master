# ado-research

Execute ADO research workflow - orchestrate MCP tools for comprehensive information gathering.

## Overview

This command executes the ADO research synchronization workflow, orchestrating multiple MCP tools to gather comprehensive information before making any technical decisions.

## Prerequisites

- ADO module installed at `.bmad/ado/`
- Research topic or question defined
- MCP tools configured in `.bmad/ado/config.yaml`

## Usage

```
/ado-research [query] [--tools=deepwiki,context7,tavily] [--output=markdown]
```

**Parameters:**
- `query`: Research topic or question
- `--tools`: Comma-separated list of MCP tools to use (default: all configured)
- `--output`: Output format - `markdown` or `json` (default: markdown)

## Research Workflow

### Step 1: Initialize Research
1. **Load workflow** from `.bmad/ado/workflows/ado-research-sync/workflow.yaml`
2. **Identify topic** - what needs research?
3. **Select tools** - which MCP tools to use?
4. **Set up cache** - where to store results?

### Step 2: Multi-Tool Orchestration

ADO orchestrates these MCP tools (as configured):

#### DeepWiki
- **Purpose**: Research GitHub repositories
- **Best for**: Understanding codebase patterns, similar implementations
- **Output**: Repository analysis, code patterns, architectural decisions

#### Context7
- **Purpose**: Pull official documentation
- **Best for**: API references, framework guides, library documentation
- **Output**: Official docs, API specifications, best practices

#### Tavily
- **Purpose**: Multi-source semantic search
- **Best for**: Community solutions, Stack Overflow, technical articles
- **Output**: Community knowledge, practical solutions, real-world examples

#### Repomix
- **Purpose**: Packed repository analysis
- **Best for**: Analyzing complete codebases, understanding structure
- **Output**: Codebase overview, file structure, implementation patterns

#### Serena
- **Purpose**: Codebase navigation and refactoring
- **Best for**: Understanding existing codebase, finding code patterns
- **Output**: Code references, symbol analysis, refactoring suggestions

### Step 3: Research Execution

Each tool is executed with the research query:

```bash
# DeepWiki - GitHub repository research
deepwiki_search("query terms")
deepwiki_ask("specific questions about repository")

# Context7 - Official documentation
context7_resolve_library("library name")
context7_get_docs("library/version", "specific topic")

# Tavily - Web search
tavily_search("semantic query")
tavily_qna("specific question")

# Repomix - Repository analysis
repomix_pack("github.com/user/repo")
repomix_search("pattern")

# Serena - Code navigation
serena_find_symbol("function name")
serena_get_overview("file path")
```

### Step 4: Synthesis and Analysis

1. **Cross-reference findings**:
   - Compare official docs with community practices
   - Validate patterns across multiple sources
   - Identify contradictions or outdated information

2. **Confidence scoring**:
   - Official sources: High confidence (0.8-1.0)
   - Community consensus: Medium confidence (0.6-0.8)
   - Single source: Low confidence (0.4-0.6)

3. **Extract key insights**:
   - Best practices
   - Common pitfalls
   - Recommended patterns
   - Implementation details

### Step 5: Documentation

Research results are documented with:
- Source citations
- Confidence scores
- Key insights
- Actionable recommendations
- Related links and resources

## Research Cache

Research results are cached to avoid redundant queries:

```
docs/ado-artifacts/ado-research-cache/
├── [query-hash]/
│   ├── deepwiki/
│   │   ├── search-results.md
│   │   └── repository-analysis.md
│   ├── context7/
│   │   ├── library-docs.md
│   │   └── api-reference.md
│   ├── tavily/
│   │   ├── search-results.md
│   │   └── qna-results.md
│   ├── repomix/
│   │   ├── codebase-analysis.md
│   │   └── patterns.md
│   ├── serena/
│   │   ├── symbol-analysis.md
│   │   └── codebase-overview.md
│   ├── synthesis.md              # Cross-referenced insights
│   ├── confidence-scores.md      # Source reliability
│   └── recommendations.md        # Actionable advice
```

## Example Research Queries

### Framework Research
```
/ado-research "TanStack Start best practices for routing"
```
**Tools**: context7 (official docs), tavily (community practices)
**Output**: Routing patterns, configuration guides, common patterns

### Library Integration
```
/ado-research "Drizzle ORM with TypeScript patterns"
```
**Tools**: context7 (drizzle docs), deepwiki (example repos), tavily (Stack Overflow)
**Output**: Schema design, TypeScript integration, migration strategies

### Architecture Patterns
```
/ado-research "React component composition patterns"
```
**Tools**: deepwiki (component libraries), tavily (articles), repomix (example repos)
**Output**: Composition patterns, design patterns, implementation examples

### Bug Investigation
```
/ado-research "TypeScript type errors with React hooks"
```
**Tools**: tavily (Stack Overflow), context7 (React docs), deepwiki (example solutions)
**Output**: Common causes, solutions, prevention strategies

## MCP Tool Configuration

Tools are configured in `.bmad/ado/config.yaml`:

```yaml
mcp_tools_available:
  - deepwiki      # GitHub repository research
  - context7      # Official documentation
  - tavily        # Web search and Q&A
  - repomix       # Packed repo analysis
  - serena        # Codebase navigation

research:
  cache_ttl: 3600              # Cache duration (seconds)
  max_queries_per_task: 5      # Query limit per task
  mandatory_before:            # Mandatory research
    - code_generation
    - architecture_decisions
    - tech_spec_creation
    - dependency_integration
```

## Research Quality Standards

### Source Hierarchy
1. **Official Documentation** (confidence: 0.9-1.0)
   - Official library/framework docs
   - API references
   - Official guides and tutorials

2. **Authoritative Repositories** (confidence: 0.8-0.9)
   - Well-maintained GitHub repos
   - Official examples and starters
   - High-starred community projects

3. **Community Consensus** (confidence: 0.6-0.8)
   - Stack Overflow accepted answers
   - Multiple blog articles
   - Community best practices

4. **Individual Opinions** (confidence: 0.4-0.6)
   - Single blog post
   - Personal experiences
   - Experimental approaches

### Research Validation
- [ ] Cross-reference with official docs
- [ ] Check multiple sources for consensus
- [ ] Validate examples work
- [ ] Confirm current version compatibility
- [ ] Note any contradictions or outdated info

## Outputs

Research results are saved to:

1. **Immediate Output**:
   - Displayed in console during execution
   - Formatted markdown for readability
   - Confidence scores visible

2. **Cached Results**:
   - Saved to `docs/ado-artifacts/ado-research-cache/`
   - Reused for future queries
   - Includes timestamps and confidence scores

3. **Synthesis Report**:
   - Cross-referenced insights
   - Actionable recommendations
   - Source citations
   - Implementation guide

## Integration with ADO Phases

### Phase 1: Discovery
- **Primary usage** - comprehensive research
- **All tools** - deepwiki, context7, tavily, repomix, serena
- **Output** - research cache for planning phase

### Phase 2: Planning
- **Secondary usage** - validate decisions
- **Specific tools** - context7 (docs), deepwiki (examples)
- **Output** - architecture validation

### Phase 3: Implementation
- **Reference usage** - check implementation details
- **Targeted tools** - specific queries as needed
- **Output** - implementation guidance

## Success Criteria

Research is complete when:
- All relevant tools queried
- Multiple sources cross-referenced
- Confidence scores assigned
- Key insights documented
- Actionable recommendations provided
- Sources cited and accessible

## Examples

### Comprehensive Research
```
/ado-research "Building AI chat applications with streaming"
--tools=deepwiki,context7,tavily
--output=markdown
```
**Result**: Full research using all tools, comprehensive report with confidence scores.

### Targeted Research
```
/ado-research "Drizzle schema migration patterns"
--tools=context7,deepwiki
```
**Result**: Targeted research on migration strategies with official docs and examples.

### Quick Lookup
```
/ado-research "TypeScript strict mode best practices"
--tools=tavily
```
**Result**: Quick web search for community best practices.

## Common Research Questions

1. **What library/framework should I use?**
   - Use: context7 (docs), deepwiki (examples), tavily (comparisons)

2. **How do I implement this pattern?**
   - Use: deepwiki (code examples), tavily (tutorials), context7 (guides)

3. **What are the best practices?**
   - Use: context7 (official), tavily (community), deepwiki (real-world)

4. **How do I fix this error?**
   - Use: tavily (Stack Overflow), deepwiki (issue solutions)

5. **What are common pitfalls?**
   - Use: tavily (lessons learned), deepwiki (anti-patterns)

## Notes

- **Research before coding** - never implement without research
- **Multiple sources** - validate with 2+ sources
- **Confidence scoring** - rate source reliability
- **Cache results** - avoid redundant queries
- **Document everything** - sources, insights, recommendations

For more information, see:
- `.bmad/ado/workflows/ado-research-sync/workflow.yaml`
- `.bmad/ado/tasks/query-deepwiki.md`
- `.bmad/ado/tasks/query-context7.md`
- `.bmad/ado/README.md`
