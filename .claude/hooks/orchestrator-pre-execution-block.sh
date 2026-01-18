#!/bin/bash
# Orchestrator Pre-Execution Block
# Enforces: bmad-ext-master-orchestrator NEVER executes tools directly

AGENT_ROLE=$(cat /dev/stdin 2>/dev/null | grep -o '"role"[^,]*' | cut -d'"' -f4)

if [[ "$AGENT_ROLE" == *"orchestrator"* ]] || [[ "$AGENT_ROLE" == *"master"* ]]; then
    # Check if any tool execution is attempted
    if [[ "$1" == "tool_call"* ]]; then
        echo "🚫 BLOCKED: Orchestrator attempting direct tool execution"
        echo "📋 Pattern: $2"
        echo "📋 Required Action: Delegate to subagent instead"
        echo ""
        echo "Available subagents:"
        echo "  - explore (codebase investigation)"
        echo "  - analyst-ext (research/analysis)"
        echo "  - architect-ext (architecture review)"
        echo "  - dev-ext (implementation)"
        echo "  - ux-designer-ext (design)"
        echo "  - tech-writer-ext (documentation)"
        echo "  - bmad-governance (governance enforcement)"
        echo "  - deep-scan-orchestrator (comprehensive scanning)"
        echo "  - real-world-validator (testing)"
        echo ""
        echo "Use 'task' tool with subagent_type parameter to delegate."
        exit 1
    fi
fi

# If we reach here, no orchestrator tool execution detected
exit 0
