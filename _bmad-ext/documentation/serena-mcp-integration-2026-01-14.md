# Serena MCP Server Integration Guide

**Date:** 2026-01-14  
**Status:** ACTIVE  
**Integration Type:** OpenCode MCP Server  
**Version:** Latest (via uvx)  
**Maintainer:** BMAD Orchestrator  

---

## Overview

Serena is a powerful **coding agent toolkit** that provides semantic code understanding through the Model Context Protocol (MCP). Unlike traditional text-based tools, Serena enables symbolic code analysis and editing similar to an IDE's capabilities.

## Key Benefits for Project Alpha

### 1. **Semantic Code Understanding**
- **Symbol-based navigation**: Find functions, classes, interfaces by name
- **Reference tracking**: Discover all usages of a symbol across the codebase
- **Type-aware operations**: Understand TypeScript types and relationships

### 2. **Intelligent Code Editing**
- **Precise insertion**: Insert code before/after specific symbols
- **Symbol replacement**: Replace entire function/class definitions
- **Smart refactoring**: Rename symbols across the codebase

### 3. **Project Context Awareness**
- **Codebase indexing**: Understand project structure and dependencies
- **Memory management**: Store and retrieve project-specific context
- **Language server integration**: Leverage TypeScript language server capabilities

### 4. **Enhanced Developer Experience**
- **Reduced token usage**: Semantic operations are more efficient than text searches
- **Higher accuracy**: Symbol-based operations reduce errors
- **Better navigation**: Understand complex codebase relationships

---

## Installation & Configuration

### Prerequisites
```bash
# Install uv package manager
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### OpenCode Configuration
```json
{
  "mcp": {
    "serena": {
      "type": "local",
      "command": ["uvx", "--from", "git+https://github.com/oraios/serena", "serena", "start-mcp-server", "--context", "ide", "--project-from-cwd"],
      "enabled": true,
      "environment": {},
      "timeout": 30000
    }
  }
}
```

### Context Configuration
- **`--context ide`**: Optimized for IDE-like clients (OpenCode, Claude Code)
- **`--project-from-cwd`**: Auto-detects project from current directory
- **`--language-backend LSP`**: Uses Language Server Protocol (default)

---

## Available Tools

### Code Navigation Tools
| Tool | Purpose | Example Use |
|------|---------|-------------|
| `find_symbol` | Search for symbols by name | `find_symbol Project` |
| `find_referencing_symbols` | Find references to symbol | `find_referencing_symbols useProjectStore` |
| `get_symbols_overview` | List top-level symbols in file | `get_symbols_overview src/infrastructure/persistence/stores/project-store.ts` |
| `list_dir` | List directory contents | `list_dir src/presentation/components` |

### Code Editing Tools
| Tool | Purpose | Example Use |
|------|---------|-------------|
| `insert_after_symbol` | Insert code after symbol | `insert_after_symbol ProjectStore.initialize` |
| `insert_before_symbol` | Insert code before symbol | `insert_before_symbol ProjectStore.cleanup` |
| `replace_symbol_body` | Replace entire symbol | `replace_symbol_body ProjectStore.addProject` |
| `rename_symbol` | Rename across codebase | `rename_symbol oldFunctionName newFunctionName` |
| `replace_lines` | Replace lines in file | `replace_lines 10-20 with new content` |
| `create_text_file` | Create new file | `create_text_file src/utils/new-util.ts` |

### Project Management Tools
| Tool | Purpose | Example Use |
|------|---------|-------------|
| `activate_project` | Activate project context | `activate_project /path/to/project` |
| `onboarding` | Project structure analysis | `onboarding` |
| `search_for_pattern` | Search for patterns | `search_for_pattern "interface.*Project"` |
| `execute_shell_command` | Run shell commands | `execute_shell_command "npm test"` |

### Memory Tools
| Tool | Purpose | Example Use |
|------|---------|-------------|
| `write_memory` | Store project memory | `write_memory project-architecture Current architecture decisions` |
| `read_memory` | Retrieve memory | `read_memory project-architecture` |
| `list_memories` | List stored memories | `list_memories` |
| `delete_memory` | Remove memory | `delete_memory obsolete-memory` |

---

## Integration with BMAD Workflow

### 1. **Story Development Enhancement**
```
USE CASE: Refactoring a large component
BEFORE: grep searches, manual file reading, text replacement
AFTER: Serena's find_symbol + rename_symbol + find_referencing_symbols
```

### 2. **Architecture Remediation**
```
USE CASE: Eliminating god stores
BEFORE: Manual analysis of imports and dependencies
AFTER: Serena's get_symbols_overview + find_referencing_symbols
```

### 3. **TypeScript Error Resolution**
```
USE CASE: Fixing complex TypeScript errors
BEFORE: Manual type tracing and inference
AFTER: Serena's symbol analysis + language server integration
```

### 4. **Codebase Exploration**
```
USE CASE: Understanding unfamiliar code
BEFORE: Random file reading, grep patterns
AFTER: Serena's project indexing + symbol overview
```

---

## Usage Examples for Project Alpha

### Example 1: Finding All Store Usage
```typescript
// Use Serena to analyze store usage patterns
find_symbol "*Store" // Find all stores
find_referencing_symbols useProjectStore // Find all usages
get_symbols_overview src/infrastructure/persistence/stores/project-store.ts
```

### Example 2: Refactoring Component
```typescript
// Refactor large component into smaller ones
get_symbols_overview src/presentation/components/LargeComponent.tsx
find_referencing_symbols LargeComponent
rename_symbol LargeComponent MainComponent
```

### Example 3: Analyzing Dependencies
```typescript
// Analyze imports and dependencies
search_for_pattern "from.*stores.*"
find_symbol "use.*Hook"
```

### Example 4: Memory for Architecture Decisions
```typescript
// Store architecture decisions
write_memory architecture-decisions-2026-01-14 "
- Zustand stores pattern: individual slices ≤120 lines
- Clean architecture: infrastructure/persistence/stores/
- 8-bit design system: border-radius: 0, box-shadow: 4px 4px 0 0
- Import order: React → Third-party → Infrastructure → Domain → Presentation
"
```

---

## Performance Considerations

### Token Efficiency
- **Symbol operations**: ~50-100 tokens vs grep: ~500-1000 tokens
- **Memory storage**: Persistent context across sessions
- **Project indexing**: One-time cost, reusable across operations

### Context Management
```typescript
// Optimal workflow with Serena
1. activate_project /Users/apple/Documents/coding-projects/project-alpha-master
2. write_memory current-task "EPIC-FS file system implementation"
3. find_symbol FileSystem
4. get_symbols_overview src/infrastructure/filesystem/
5. find_referencing_symbols useFileSystem
```

---

## Troubleshooting

### Common Issues

1. **Project Indexing**
   ```bash
   # Re-index project if symbols not found
   cd /path/to/project
   uvx --from git+https://github.com/oraios/serena serena project index
   ```

2. **Language Server Issues**
   ```bash
   # Check TypeScript language server
   uvx --from git+https://github.com/oraios/serena serena project health-check
   ```

3. **MCP Connection**
   ```bash
   # Test Serena MCP server
   uvx --from git+https://github.com/oraios/serena serena start-mcp-server --help
   ```

### Debug Mode
```bash
# Enable verbose logging
uvx --from git+https://github.com/oraios/serena serena start-mcp-server --log-level DEBUG
```

---

## Best Practices

### 1. **Project Context First**
Always activate project context before performing operations:
```typescript
activate_project /Users/apple/Documents/coding-projects/project-alpha-master
```

### 2. **Memory for Recurring Patterns**
Store common patterns in memory:
```typescript
write_memory zustand-pattern "
export const useStore = create<StoreState>((set, get) => ({
  // State
  items: [],
  loading: false,
  
  // Actions
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) => set((state) => ({ 
    items: state.items.filter(item => item.id !== id) 
  })),
}))"
```

### 3. **Symbolic Before Textual**
Prefer symbol operations over text operations:
```typescript
// ✅ Better
find_symbol Project
insert_after_symbol Project.constructor

// ❌ Less efficient
search_for_pattern "class Project"
replace_lines 10-15
```

### 4. **Batch Operations**
Group related operations:
```typescript
// Analyze then refactor
get_symbols_overview src/stores/large-store.ts
find_referencing_symbols largeStore
// Plan refactoring based on analysis
```

---

## Integration with Other MCP Tools

### Context7 + Serena
```typescript
// Use Context7 for documentation, Serena for code
// 1. Research with Context7
"use context7 tool to find TypeScript best practices for Zustand"

// 2. Implement with Serena
"use serena tool to find all Zustand stores and refactor them"
```

### Repomix + Serena
```typescript
// Use Repomix for overview, Serena for detailed work
// 1. Get codebase overview with Repomix
"use repomix tool to analyze project structure"

// 2. Detailed refactoring with Serena
"use serena tool to split component FileExplorer into smaller modules"
```

### Tavily + Serena
```typescript
// Use Tavily for web research, Serena for implementation
// 1. Research patterns
"use tavily tool to search for modern file system patterns"

// 2. Implement researched patterns
"use serena tool to implement file system abstraction layer"
```

---

## Future Enhancements

### Planned Integrations
1. **BMAD Orchestrator Integration**
   - Automatic Serena activation for story development
   - Serena tools in agent workflows
   - Memory sharing between agents

2. **Enhanced TypeScript Support**
   - Type inference across files
   - Import/export analysis
   - Circular dependency detection

3. **Performance Optimization**
   - Incremental indexing
   - Cached symbol lookups
   - Parallel operation execution

### Roadmap
- [ ] Integration with BMAD story-cycle workflow
- [ ] Automated refactoring scripts using Serena
- [ ] Memory persistence across agent sessions
- [ ] Performance benchmarking and optimization

---

## References & Resources

### Official Documentation
- [Serena GitHub Repository](https://github.com/oraios/serena)
- [Serena Documentation](https://oraios.github.io/serena/)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)

### Project Alpha Integration
- Configuration: `opencode.json`
- Project: `/Users/apple/Documents/coding-projects/project-alpha-master`
- Context: `ide` (optimized for OpenCode)
- Language Backend: `LSP` (TypeScript language server)

### Support Channels
- GitHub Issues: https://github.com/oraios/serena/issues
- MCP Community: https://discord.gg/modelcontextprotocol

---

## Conclusion

Serena MCP server transforms OpenCode from a text-based assistant to a semantic coding partner. By integrating Serena into Project Alpha's workflow, we gain:

1. **10x faster code navigation** through symbol-based operations
2. **Higher accuracy** in refactoring and code modifications
3. **Reduced token usage** for complex operations
4. **Better project understanding** through indexing and memory
5. **Enhanced development velocity** across BMAD workflows

The integration is now active and ready for use in all OpenCode sessions. Agents should leverage Serena tools for code analysis, refactoring, and exploration tasks.