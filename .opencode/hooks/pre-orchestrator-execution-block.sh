#!/bin/bash
#
# PRE-ORCHESTRATOR-EXECUTION-BLOCK.SH
# =================================================================
# HARD ENFORCEMENT: Blocks bmad-ext-master-orchestrator from executing ANY tool directly
# Platform: OpenCode
# Severity: CRITICAL - No bypass possible
# =================================================================

set -euo pipefail

# Configuration
CONSTRAINT_FILE="/Users/apple/Documents/coding-projects/project-alpha-master/.opencode/orchestrator-constraints.json"
VIOLATION_LOG="/Users/apple/Documents/coding-projects/project-alpha-master/_bmad-ext/state/ORCHESTRATOR_VIOLATIONS.yaml"
LOOP_STATE="/Users/apple/Documents/coding-projects/project-alpha-master/_bmad-ext/state/LOOP_STATE.yaml"

# =================================================================
# STEP 1: Detect if current role is orchestrator
# =================================================================
detect_role() {
    # Check for orchestrator role markers in environment or arguments
    local role="${ORCHESTRATOR_ROLE:-}"
    
    # Check if the calling script/prompt contains orchestrator identifier
    if [[ "$0" == *"orchestrator"* ]] || [[ "$1" == *"orchestrator"* ]] 2>/dev/null; then
        echo "orchestrator"
        return 0
    fi
    
    # Check agent type from OpenCode context
    local agent_type="${AGENT_TYPE:-}"
    if [[ "$agent_type" == *"orchestrator"* ]]; then
        echo "orchestrator"
        return 0
    fi
    
    # Check for orchestrator in the current command context
    if echo "$@" | grep -qi "orchestrator"; then
        echo "orchestrator"
        return 0
    fi
    
    # Default to non-orchestrator
    echo "unknown"
    return 1
}

# =================================================================
# STEP 2: Check if any tool is being executed directly
# =================================================================
check_direct_tool_execution() {
    local detected_tools=()
    
    # Check for filesystem tools
    if [[ "$*" == *"filesystem_read"* ]] || [[ "$*" == *"filesystem_write"* ]] || \
       [[ "$*" == *"filesystem_edit"* ]] || [[ "$*" == *"filesystem_"* ]]; then
        detected_tools+=("filesystem_tools")
    fi
    
    # Check for read tool
    if [[ "$*" == *"read "* ]] && [[ "$*" != *"filesystem"* ]]; then
        detected_tools+=("read_tool")
    fi
    
    # Check for write tool  
    if [[ "$*" == *"write "* ]] && [[ "$*" != *"filesystem"* ]]; then
        detected_tools+=("write_tool")
    fi
    
    # Check for edit tool
    if [[ "$*" == *"edit "* ]] && [[ "$*" != *"filesystem"* ]]; then
        detected_tools+=("edit_tool")
    fi
    
    # Check for bash tool
    if [[ "$*" == *"bash "* ]] || [[ "$*" == *" command:"* ]]; then
        detected_tools+=("bash_tool")
    fi
    
    # Check for glob tool
    if [[ "$*" == *"glob "* ]]; then
        detected_tools+=("glob_tool")
    fi
    
    # Check for grep tool
    if [[ "$*" == *"grep "* ]]; then
        detected_tools+=("grep_tool")
    fi
    
    # Check for serena tools (except thinking/read_memory)
    if [[ "$*" == *"serena_"* ]] && [[ "$*" != *"serena_think"* ]] && \
       [[ "$*" != *"serena_read_memory"* ]] && [[ "$*" != *"serena_initial"* ]]; then
        detected_tools+=("serena_tools")
    fi
    
    # Check for lookup_type tools
    if [[ "$*" == *"lookup_type"* ]] || [[ "$*" == *"list_types"* ]]; then
        detected_tools+=("lookup_type_tools")
    fi
    
    # Check for github tools
    if [[ "$*" == *"github_"* ]]; then
        detected_tools+=("github_tools")
    fi
    
    # Check for web search tools
    if [[ "$*" == *"web-search-prime"* ]] || [[ "$*" == *"fetch_fetch"* ]] || \
       [[ "$*" == *"web-reader"* ]]; then
        detected_tools+=("web_tools")
    fi
    
    # Check for exa tools
    if [[ "$*" == *"exa_"* ]]; then
        detected_tools+=("exa_tools")
    fi
    
    # Check for brave tools
    if [[ "$*" == *"brave-"* ]]; then
        detected_tools+=("brave_tools")
    fi
    
    # Check for zread tools
    if [[ "$*" == *"zread_"* ]]; then
        detected_tools+=("zread_tools")
    fi
    
    # Check for deepwiki tools
    if [[ "$*" == *"deepwiki_"* ]]; then
        detected_tools+=("deepwiki_tools")
    fi
    
    # Check for chrome-devtools
    if [[ "$*" == *"chrome-devtools_"* ]]; then
        detected_tools+=("chrome_devtools")
    fi
    
    # Return detected tools
    if [ ${#detected_tools[@]} -gt 0 ]; then
        echo "${detected_tools[@]}"
        return 0
    fi
    
    return 1
}

# =================================================================
# STEP 3: Log violation
# =================================================================
log_violation() {
    local detected_tools="$1"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local violation_id=$(uuidgen 2>/dev/null || echo "$(date +%s)-$$")
    
    echo "=============================================="
    echo "🚨 CRITICAL VIOLATION DETECTED 🚨"
    echo "=============================================="
    echo "Timestamp: $timestamp"
    echo "Violation ID: $violation_id"
    echo "Role: bmad-ext-master-orchestrator"
    echo "Attempted Tools: $detected_tools"
    echo ""
    echo "ERROR: Orchestrator CANNOT execute tools directly!"
    echo "REQUIRED: Use 'task' tool to delegate to subagents only."
    echo "=============================================="
    
    # Log to violation file
    local log_entry="
violation_$violation_id:
  timestamp: $timestamp
  role: bmad-ext-master-orchestrator
  type: DIRECT_TOOL_EXECUTION
  detected_tools: $detected_tools
  status: BLOCKED
  action_required: HUMAN_INTERVENTION
  message: Orchestrator attempted direct tool execution - BLOCKED by pre-execution hook
"
    
    echo "$log_entry" >> "$VIOLATION_LOG"
    
    # Update LOOP_STATE
    if [ -f "$LOOP_STATE" ]; then
        local loop_update="
  - timestamp: $timestamp
    event: ORCHESTRATOR_VIOLATION
    violation_id: $violation_id
    details: Attempted to execute $detected_tools directly
"
        echo "$loop_update" >> "$LOOP_STATE"
    fi
    
    return 1
}

# =================================================================
# STEP 4: Block execution and escalate
# =================================================================
block_execution() {
    local detected_tools="$1"
    
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║         🚫 ORCHESTRATOR EXECUTION BLOCKED 🚫              ║"
    echo "╠════════════════════════════════════════════════════════════╣"
    echo "║ Role: bmad-ext-master-orchestrator                        ║"
    echo "║ Platform: OpenCode                                        ║"
    echo "║ Enforcement: HARD STOP                                    ║"
    echo "╠════════════════════════════════════════════════════════════╣"
    echo "║ Violation: Attempted direct tool execution                ║"
    echo "║ Blocked Tools: $detected_tools                             ║"
    echo "╠════════════════════════════════════════════════════════════╣"
    echo "║ CORRECT PATTERN:                                          ║"
    echo "║   Use the 'task' tool with subagent_type parameter        ║"
    echo "║                                                           ║"
    echo "║ Example:                                                  ║"
    echo "║   {                                                       ║"
    echo "║     \"subagent_type\": \"dev-ext\",                         ║"
    echo "║     \"prompt\": \"Implement feature X...\"                  ║"
    echo "║   }                                                       ║"
    echo "╠════════════════════════════════════════════════════════════╣"
    echo "║ This is NOT a suggestion. This is a HARD ENFORCEMENT.     ║"
    echo "║ No bypass is possible.                                    ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    
    # Exit with error code to prevent any further execution
    exit 99
}

# =================================================================
# MAIN ENFORCEMENT LOGIC
# =================================================================
main() {
    local role=""
    local detected_tools=""
    
    # Check if this is the orchestrator role
    if detect_role "$@"; then
        role="orchestrator"
        
        # Check if any tool is being executed directly
        if check_direct_tool_execution "$@"; then
            detected_tools="$?"
            log_violation "$detected_tools"
            block_execution "$detected_tools"
            exit 99
        fi
        
        # Additional check: verify task tool is being used
        if [[ "$*" != *"task"* ]]; then
            echo "╔════════════════════════════════════════════════════════════╗"
            echo "║         🚫 MISSING DELEGATION PATTERN 🚫                   ║"
            echo "╠════════════════════════════════════════════════════════════╣"
            echo "║ Orchestrator MUST use 'task' tool to delegate work!        ║"
            echo "║ Direct execution is FORBIDDEN.                             ║"
            echo "╚════════════════════════════════════════════════════════════╝"
            exit 99
        fi
    fi
    
    # Non-orchestrator roles can proceed
    echo "[GOVERNANCE] Pre-execution check passed (non-orchestrator role)"
    exit 0
}

# Execute main function with all arguments
main "$@"
