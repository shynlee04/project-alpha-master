#!/bin/bash
# File Governance Wrapper - Convenience Script
# Usage: ./governance-wrapper.sh <command> [args]
# 
# Commands:
#   track <action> <file> [diff]    - Track file change (create/modify/remove)
#   check                            - Check for circular patterns
#   signals                          - Process agent signals
#   tree [force]                     - Update code tree
#   status                           - Show registry status
#   reset                            - Force reset registry
#   init                             - Initialize governance system

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="/Users/apple/Documents/coding-projects/project-alpha-master"
REGISTRY_DIR="$PROJECT_ROOT/_bmad-output/.archive/file-registry"

case "$1" in
  "track")
    shift
    "$SCRIPT_DIR/file-registry-tracker.sh" "$@"
    ;;
  "check"|"signals")
    "$SCRIPT_DIR/agent-signal-handler.sh"
    ;;
  "tree")
    shift
    "$SCRIPT_DIR/code-tree-updater.sh" "$@"
    ;;
  "status")
    echo "=== FILE GOVERNANCE STATUS ==="
    echo ""
    
    if [ -f "$REGISTRY_DIR/registry.json" ]; then
      echo "Registry: Initialized"
      local_entry_count=$(grep -o '"id"' "$REGISTRY_DIR/registry.json" 2>/dev/null | wc -l || echo "0")
      echo "Registry entries: $local_entry_count"
    else
      echo "Registry: Not initialized"
    fi
    
    if [ -f "$REGISTRY_DIR/index.json" ]; then
      local_last_reset=$(grep -o '"last_reset" *: *"[^"]*"' "$REGISTRY_DIR/index.json" 2>/dev/null | sed 's/.*: *"\([^"]*\)"/\1/' || echo "N/A")
      echo "Last reset: $local_last_reset"
    fi
    
    if [ -f "$REGISTRY_DIR/code-tree.json" ]; then
      local_tree_update=$(grep -o '"last_updated" *: *"[^"]*"' "$REGISTRY_DIR/code-tree.json" 2>/dev/null | sed 's/.*: *"\([^"]*\)"/\1/' || echo "N/A")
      echo "Tree updated: $local_tree_update"
    fi
    
    if [ -d "$REGISTRY_DIR/signals" ]; then
      local_signal_count=$(find "$REGISTRY_DIR/signals" -name "*.json" 2>/dev/null | wc -l || echo "0")
      echo "Pending signals: $local_signal_count"
    else
      echo "Pending signals: 0"
    fi
    ;;
  "reset")
    mkdir -p "$REGISTRY_DIR"
    echo '{"entries": [], "created_at": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'", "reset_count": 0}' > "$REGISTRY_DIR/registry.json"
    echo '{"file_hits": {}, "circular_signals": [], "last_reset": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}' > "$REGISTRY_DIR/index.json"
    echo "Registry reset."
    ;;
  "init")
    mkdir -p "$REGISTRY_DIR"
    echo '{"entries": [], "created_at": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'", "reset_count": 0}' > "$REGISTRY_DIR/registry.json"
    echo '{"file_hits": {}, "circular_signals": [], "last_reset": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}' > "$REGISTRY_DIR/index.json"
    echo '{"tree": {}, "last_updated": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}' > "$REGISTRY_DIR/code-tree.json"
    echo "Governance system initialized."
    ;;
  *)
    echo "File Governance Wrapper"
    echo ""
    echo "Usage: $0 <command> [args]"
    echo ""
    echo "Commands:"
    echo "  track <action> <file> [diff]  - Track file change"
    echo "  check                          - Check circular patterns"
    echo "  signals                        - Process agent signals"
    echo "  tree [force]                   - Update code tree"
    echo "  status                         - Show registry status"
    echo "  reset                          - Force reset registry"
    echo "  init                           - Initialize governance"
    echo ""
    echo "Examples:"
    echo "  $0 track create src/new/File.tsx"
    echo "  $0 track modify src/existing/File.tsx"
    echo "  $0 tree --force"
    echo "  $0 status"
    exit 1
    ;;
esac
