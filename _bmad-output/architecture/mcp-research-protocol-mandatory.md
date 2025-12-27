# MCP Research Protocol (Mandatory)

> All AI agents developing this project MUST use MCP research tools before implementing unfamiliar patterns.

### Required Research Steps

1. **Context7**: Query documentation for libraries (TanStack, WebContainers, isomorphic-git)
2. **Deepwiki**: Check GitHub repo wikis for implementation patterns
3. **Tavily/Exa**: Search for recent (2025) best practices
4. **Repomix**: Analyze current codebase structure before changes

### Example: Before Implementing New Feature

```bash
# Step 1: Check library docs
mcp_context7_get-library-docs --id "/tanstack/ai" --topic "client tools"

# Step 2: Search for patterns
mcp_exa_get_code_context_exa --query "TanStack AI client-side tool callbacks 2025"

# Step 3: Check current implementation
mcp_repomix_pack_codebase --directory "src/lib/agent" --style xml
```

---

*Generated via BMAD Architecture Workflow*  
*Project: Via-Gent Foundational Architectural Slice (Project Alpha)*  
*Last Updated: 2025-12-21T11:45:00+07:00*
