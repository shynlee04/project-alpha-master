#!/bin/bash
# ARC Module Ralph Loop Runner
# Runs the autonomous course correction loop

set -e

PROJECT_ROOT="/Users/apple/Documents/coding-projects/project-alpha-master"
ARC_MODULE="$PROJECT_ROOT/_bmad-output/bmb-creations/arc-module"
PROMPT_FILE="$ARC_MODULE/PROMPT.md"
STATE_FILE="$ARC_MODULE/LOOP_STATE.yaml"
LOG_FILE="$ARC_MODULE/loop.log"
MAX_ITERATIONS=${1:-100}

cd "$PROJECT_ROOT"

echo "🔄 ARC Module Ralph Loop Starting..."
echo "   Max iterations: $MAX_ITERATIONS"
echo "   Prompt: $PROMPT_FILE"
echo "   State: $STATE_FILE"
echo ""

iteration=0

while [ $iteration -lt $MAX_ITERATIONS ]; do
  iteration=$((iteration + 1))
  
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📍 ITERATION $iteration / $MAX_ITERATIONS"
  echo "   $(date '+%Y-%m-%d %H:%M:%S')"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  # Run Claude with the prompt
  output=$(cat "$PROMPT_FILE" | claude-code --continue 2>&1)
  
  # Log output
  echo "$output" >> "$LOG_FILE"
  
  # Check for completion promise
  if echo "$output" | grep -q "<promise>ARC MODULE COMPLETE</promise>"; then
    echo ""
    echo "✅ ARC MODULE COMPLETE!"
    echo "   Total iterations: $iteration"
    echo "   Completed at: $(date '+%Y-%m-%d %H:%M:%S')"
    exit 0
  fi
  
  # Check for blocked promise
  if echo "$output" | grep -q "<promise>BLOCKED:"; then
    blocked_reason=$(echo "$output" | grep -o "<promise>BLOCKED:.*</promise>")
    echo ""
    echo "🚨 BLOCKED: $blocked_reason"
    echo "   Human intervention required"
    exit 1
  fi
  
  # Check for phase completion
  if echo "$output" | grep -q "<promise>PHASE.*COMPLETE</promise>"; then
    phase_complete=$(echo "$output" | grep -o "<promise>PHASE.*COMPLETE</promise>")
    echo ""
    echo "⏸️ $phase_complete"
    echo "   Continuing to next phase..."
  fi
  
  # Brief pause between iterations
  sleep 2
done

echo ""
echo "⚠️ Max iterations ($MAX_ITERATIONS) reached"
echo "   Loop stopped. Manual intervention may be needed."
exit 2
