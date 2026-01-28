#!/bin/bash
# Agent Signal Handler - Processes Circular Pattern Signals
# Usage: ./agent-signal-handler.sh
# Monitors: _bmad-output/.archive/file-registry/CIRCULAR-SIGNAL-*.json
# Actions: Log, alert, optionally auto-correct

set -e

PROJECT_ROOT="/Users/apple/Documents/coding-projects/project-alpha-master"
REGISTRY_DIR="$PROJECT_ROOT/_bmad-output/.archive/file-registry"
SIGNAL_DIR="$REGISTRY_DIR/signals"
SIGNAL_LOG="$REGISTRY_DIR/signal-log.md"

get_timestamp() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

init() {
  mkdir -p "$SIGNAL_DIR"
  
  if [ ! -f "$SIGNAL_LOG" ]; then
    echo "# Agent Signal Log" > "$SIGNAL_LOG"
    echo "Generated: $(get_timestamp)" >> "$SIGNAL_LOG"
    echo "" >> "$SIGNAL_LOG"
  fi
}

process_signals() {
  echo "=== AGENT SIGNAL HANDLER ==="
  echo "Timestamp: $(get_timestamp)"
  echo ""
  
  # Find all circular signal files
  local signal_files=$(find "$SIGNAL_DIR" -name "CIRCULAR-SIGNAL-*.json" -type f 2>/dev/null)
  
  if [ -z "$signal_files" ]; then
    echo "No circular signals detected."
    exit 0
  fi
  
  local signal_count=$(echo "$signal_files" | wc -l | tr -d ' ')
  echo "Found $signal_count circular signal(s):"
  echo ""
  
  # Process each signal
  for signal_file in $signal_files; do
    process_signal "$signal_file"
  done
  
  echo ""
  echo "=== SIGNAL SUMMARY ==="
  echo "Total signals: $signal_count"
  echo "Log: $SIGNAL_LOG"
}

process_signal() {
  local signal_file="$1"
  local file=$(cat "$signal_file" | grep -o '"file": *"[^"]*"' | sed 's/.*": *"\([^"]*\)"/\1/')
  local count=$(cat "$signal_file" | grep -o '"change_count": [0-9]*' | sed 's/.*: //')
  local timestamp=$(cat "$signal_file" | grep -o '"timestamp": *"[^"]*"' | sed 's/.*": *"\([^"]*\)"/\1/')
  
  echo "⚠️  Signal: $file"
  echo "   Changes: $count times"
  echo "   Detected: $timestamp"
  
  # Log to signal log
  echo "## Circular Pattern Detected - $timestamp" >> "$SIGNAL_LOG"
  echo "**File:** \`$file\`" >> "$SIGNAL_LOG"
  echo "**Change Count:** $count" >> "$SIGNAL_LOG"
  echo "**Source:** $signal_file" >> "$SIGNAL_LOG"
  echo "" >> "$SIGNAL_LOG"
  
  # Generate agent guidance
  generate_guidance "$file" "$count"
  
  # Optionally archive signal
  local archive_file="$SIGNAL_DIR/archive/$(basename "$signal_file" .json)-$(date +%Y%m%d-%H%M%S).json"
  mkdir -p "$SIGNAL_DIR/archive"
  mv "$signal_file" "$archive_file"
  echo "   → Archived: $archive_file"
}

generate_guidance() {
  local file="$1"
  local count="$2"
  
  echo ""
  echo "Agent Guidance:"
  
  if [ $count -ge 5 ]; then
    echo "  🚨 SEVERE: $count changes detected - You may be stuck in a loop!"
    echo "  💡 Suggestion: Step back and reconsider your approach."
    echo "  📋 Questions to ask yourself:"
    echo "     1. Am I making incremental changes that don't converge?"
    echo "     2. Is there a simpler solution I'm overcomplicating?"
    echo "     3. Should I seek human input or pair programming?"
    echo ""
    echo "  ⚠️  Consider running: ./.opencode/scripts/file-governance/agent-signal-handler.sh"
  elif [ $count -ge 3 ]; then
    echo "  ⚠️  WARNING: $count changes detected - Check for circular patterns"
    echo "  💡 Suggestion: Review the last 3-5 changes to this file."
    echo "     • Are you undoing and redoing similar changes?"
    echo "     • Is there a deeper architectural issue?"
  fi
  
  # File-specific guidance
  if echo "$file" | grep -q "store"; then
    echo ""
    echo "  📦 Store-related: Consider splitting into smaller slices (≤120 lines)"
    echo "     Pattern: .opencode/scripts/file-governance/store-refactor-helper.sh"
  elif echo "$file" | grep -q "component"; then
    echo ""
    echo "  🧩 Component-related: Consider splitting oversized components (≤300 lines)"
    echo "     Pattern: .opencode/scripts/file-governance/component-splitter-helper.sh"
  elif echo "$file" | grep -q "test"; then
    echo ""
    echo "  🧪 Test-related: Consider simplifying test approach"
  fi
  
  echo ""
}

main() {
  init
  process_signals
}

main "$@"
