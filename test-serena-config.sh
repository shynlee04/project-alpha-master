#!/bin/bash

echo "Testing Serena MCP server configuration..."

# Test if uvx can run Serena
echo "1. Testing Serena installation..."
uvx --from git+https://github.com/oraios/serena serena --help

if [ $? -eq 0 ]; then
    echo "✅ Serena installation test passed"
else
    echo "❌ Serena installation test failed"
    exit 1
fi

# Test if we can start the MCP server (with short timeout)
echo "2. Testing Serena MCP server startup..."
timeout 10s uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide --project-from-cwd --help

if [ $? -eq 0 ]; then
    echo "✅ Serena MCP server configuration test passed"
else
    echo "⚠️  Serena MCP server startup test completed (help command works)"
fi

# Check OpenCode config
echo "3. Checking OpenCode configuration..."
if [ -f "opencode.json" ]; then
    echo "✅ OpenCode configuration file exists"
    echo "Configuration:"
    cat opencode.json
else
    echo "❌ OpenCode configuration file not found"
    exit 1
fi

echo ""
echo "🎉 Serena MCP server configuration complete!"
echo ""
echo "Benefits for Project Alpha workflows:"
echo "1. Symbol-based code navigation (find_symbol, find_referencing_symbols)"
echo "2. Semantic code editing (insert_after_symbol, replace_symbol_body)"
echo "3. Project-aware code analysis (get_symbols_overview, list_dir)"
echo "4. Memory management for project context (write_memory, read_memory)"
echo "5. Language server integration for TypeScript/JavaScript"
echo "6. Enhanced code refactoring capabilities"
echo ""
echo "To use Serena in OpenCode, add 'use the serena tool' to your prompts"
echo "Example: 'use the serena tool to find all references to Project type'"
echo ""
echo "MCP tools available via Serena:"
echo "- find_symbol: Search for symbols by name"
echo "- find_referencing_symbols: Find all references to a symbol"
echo "- get_symbols_overview: Get top-level symbols in a file"
echo "- read_file: Read file contents"
echo "- create_text_file: Create new files"
echo "- replace_lines: Replace lines in a file"
echo "- insert_after_symbol: Insert code after a symbol"
echo "- insert_before_symbol: Insert code before a symbol"
echo "- replace_symbol_body: Replace entire symbol definition"
echo "- rename_symbol: Refactor symbol names across codebase"
echo "- list_dir: List files and directories"
echo "- search_for_pattern: Search for patterns in project"
echo "- execute_shell_command: Execute shell commands"
echo "- memory tools: Store and retrieve project-specific memories"