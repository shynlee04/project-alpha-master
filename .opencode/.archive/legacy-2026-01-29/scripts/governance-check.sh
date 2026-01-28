#!/bin/bash
# Pre-Request Governance Check Script - Natural Language Intent Detection
# Usage: ./governance-check.sh "user prompt"
# Compatible with bash 3.x+ (macOS default)

set -e

PROMPT="$1"
PROJECT_ROOT="/Users/apple/Documents/coding-projects/project-alpha-master"

echo "=== PRE-REQUEST GOVERNANCE CHECK ==="
echo ""

# ================================================================
# STEP 1: NATURAL LANGUAGE INTENT DETECTION (Fuzzy Matching)
# ================================================================

echo "Intent: Analyzing natural language..."

# Score tracking
REMEDIATION_SCORE=0
PLANNING_SCORE=0
IMPLEMENTATION_SCORE=0
GOVERNANCE_SCORE=0

# Remediation patterns
if echo "$PROMPT" | grep -qiE "correct course|correct-course|/correct-course"; then
  REMEDIATION_SCORE=$((REMEDIATION_SCORE + 3))
  echo "    → 'correct-course' found"
fi
if echo "$PROMPT" | grep -qiE "fix|fixing|fixes|fixed"; then
  REMEDIATION_SCORE=$((REMEDIATION_SCORE + 1))
  echo "    → 'fix' found"
fi
if echo "$PROMPT" | grep -qiE "remediate|remediation|remediating"; then
  REMEDIATION_SCORE=$((REMEDIATION_SCORE + 3))
  echo "    → 'remediate' found"
fi
if echo "$PROMPT" | grep -qiE "god store|godstore|god-store"; then
  REMEDIATION_SCORE=$((REMEDIATION_SCORE + 4))
  echo "    → 'god store' found"
fi
if echo "$PROMPT" | grep -qiE "typescript|typescript error|ts error|type error"; then
  REMEDIATION_SCORE=$((REMEDIATION_SCORE + 2))
  echo "    → 'typescript error' found"
fi
if echo "$PROMPT" | grep -qiE "stuck|blocked|stalled|deadlock|dead end"; then
  REMEDIATION_SCORE=$((REMEDIATION_SCORE + 3))
  echo "    → 'stuck/blocked' found"
fi
if echo "$PROMPT" | grep -qiE "refactor|refactoring"; then
  REMEDIATION_SCORE=$((REMEDIATION_SCORE + 1))
  echo "    → 'refactor' found"
fi
if echo "$PROMPT" | grep -qiE "component too large|split component|big component"; then
  REMEDIATION_SCORE=$((REMEDIATION_SCORE + 3))
  echo "    → 'component too large' found"
fi
if echo "$PROMPT" | grep -qiE "store too large|split store|big store"; then
  REMEDIATION_SCORE=$((REMEDIATION_SCORE + 3))
  echo "    → 'store too large' found"
fi
if echo "$PROMPT" | grep -qiE "circular|dependency cycle|cyclic"; then
  REMEDIATION_SCORE=$((REMEDIATION_SCORE + 2))
  echo "    → 'circular dependency' found"
fi
if echo "$PROMPT" | grep -qiE "something is wrong|this is broken|not working|doesn't work"; then
  REMEDIATION_SCORE=$((REMEDIATION_SCORE + 2))
  echo "    → 'broken/not working' found"
fi

# Planning patterns
if echo "$PROMPT" | grep -qiE "sprint|sprint planning"; then
  PLANNING_SCORE=$((PLANNING_SCORE + 3))
  echo "    → 'sprint' found"
fi
if echo "$PROMPT" | grep -qiE "story|stories|ticket|tickets"; then
  PLANNING_SCORE=$((PLANNING_SCORE + 1))
  echo "    → 'story' found"
fi
if echo "$PROMPT" | grep -qiE "epic|epics|feature group"; then
  PLANNING_SCORE=$((PLANNING_SCORE + 2))
  echo "    → 'epic' found"
fi
if echo "$PROMPT" | grep -qiE "backlog|backlog refinement|prioritize"; then
  PLANNING_SCORE=$((PLANNING_SCORE + 2))
  echo "    → 'backlog' found"
fi
if echo "$PROMPT" | grep -qiE "plan|planning|roadmap"; then
  PLANNING_SCORE=$((PLANNING_SCORE + 1))
  echo "    → 'plan' found"
fi

# Implementation patterns
if echo "$PROMPT" | grep -qiE "implement|implementation|implementing"; then
  IMPLEMENTATION_SCORE=$((IMPLEMENTATION_SCORE + 2))
  echo "    → 'implement' found"
fi
if echo "$PROMPT" | grep -qiE "create|creating|creation|add new"; then
  IMPLEMENTATION_SCORE=$((IMPLEMENTATION_SCORE + 1))
  echo "    → 'create' found"
fi
if echo "$PROMPT" | grep -qiE "develop|development|developing"; then
  IMPLEMENTATION_SCORE=$((IMPLEMENTATION_SCORE + 2))
  echo "    → 'develop' found"
fi
if echo "$PROMPT" | grep -qiE "feature|new feature|build feature"; then
  IMPLEMENTATION_SCORE=$((IMPLEMENTATION_SCORE + 1))
  echo "    → 'feature' found"
fi
if echo "$PROMPT" | grep -qiE "code|coding|write code"; then
  IMPLEMENTATION_SCORE=$((IMPLEMENTATION_SCORE + 1))
  echo "    → 'code' found"
fi
if echo "$PROMPT" | grep -qiE "can you help|help me|assist me|please create|please implement|can you build"; then
  IMPLEMENTATION_SCORE=$((IMPLEMENTATION_SCORE + 2))
  echo "    → 'can you help' found"
fi

# Governance patterns
if echo "$PROMPT" | grep -qiE "agents.md|agents md|update agents"; then
  GOVERNANCE_SCORE=$((GOVERNANCE_SCORE + 3))
  echo "    → 'agents.md' found"
fi
if echo "$PROMPT" | grep -qiE "constitution|bmad constitution"; then
  GOVERNANCE_SCORE=$((GOVERNANCE_SCORE + 3))
  echo "    → 'constitution' found"
fi
if echo "$PROMPT" | grep -qiE "standard|standards|coding standard"; then
  GOVERNANCE_SCORE=$((GOVERNANCE_SCORE + 2))
  echo "    → 'standard' found"
fi
if echo "$PROMPT" | grep -qiE "governance|governance update"; then
  GOVERNANCE_SCORE=$((GOVERNANCE_SCORE + 2))
  echo "    → 'governance' found"
fi

# Conversational patterns
if echo "$PROMPT" | grep -qiE "story.*stuck|stuck.*story|blocked story|not moving|dead end|at a standstill"; then
  REMEDIATION_SCORE=$((REMEDIATION_SCORE + 4))
  echo "  → Conversational: 'stuck story' detected"
fi
if echo "$PROMPT" | grep -qiE "what about|should we|could we|might we|let's plan"; then
  PLANNING_SCORE=$((PLANNING_SCORE + 2))
  echo "  → Conversational: 'what if' detected"
fi

# Determine intent
INTENT="general"
MAX_SCORE=0

if [ $REMEDIATION_SCORE -gt $MAX_SCORE ]; then
  MAX_SCORE=$REMEDIATION_SCORE
  INTENT="remediation"
fi
if [ $PLANNING_SCORE -gt $MAX_SCORE ]; then
  MAX_SCORE=$PLANNING_SCORE
  INTENT="planning"
fi
if [ $IMPLEMENTATION_SCORE -gt $MAX_SCORE ]; then
  MAX_SCORE=$IMPLEMENTATION_SCORE
  INTENT="implementation"
fi
if [ $GOVERNANCE_SCORE -gt $MAX_SCORE ]; then
  MAX_SCORE=$GOVERNANCE_SCORE
  INTENT="governance"
fi

echo ""
echo "Intent Analysis Result:"
echo "  remediation: $REMEDIATION_SCORE points"
echo "  planning: $PLANNING_SCORE points"
echo "  implementation: $IMPLEMENTATION_SCORE points"
echo "  governance: $GOVERNANCE_SCORE points"
echo ""
echo "  → DETECTED INTENT: $INTENT"

# ================================================================
# STEP 2: CONTEXT LOADING
# ================================================================

echo ""
echo "Loading governance documents..."

BMM_STATUS="$PROJECT_ROOT/bmm-workflow-status.yaml"
AGENTS="$PROJECT_ROOT/AGENTS.md"
SPRINT_STATUS="$PROJECT_ROOT/_bmad-output/sprint-artifacts/sprint-status.yaml"

# Extract values with proper trimming
WORKFLOW_STORY=""
WORKFLOW_EPIC=""

if [ -f "$BMM_STATUS" ]; then
  WORKFLOW_STORY=$(grep -E "^\s+story:" "$BMM_STATUS" 2>/dev/null | head -1 | awk '{print $2}' | tr -d '"' | tr -d ' ' || echo "")
  WORKFLOW_EPIC=$(grep -E "^\s+epic:" "$BMM_STATUS" 2>/dev/null | head -1 | awk '{print $2}' | tr -d '"' | tr -d ' ' || echo "")
fi

AGENTS_STORY=""
AGENTS_EPIC=""

if [ -f "$AGENTS" ]; then
  # Extract and trim properly
  AGENTS_EPIC=$(grep -E "^\|\s+\*\*Active Epic\*\*" "$AGENTS" 2>/dev/null | sed 's/.*|\s*[^|]*|\s*\([^|]*\)\s*|.*/\1/' | xargs | awk '{print $1}' | tr -d ':' || echo "")
  AGENTS_STORY=$(grep -E "^\|\s+\*\*Next Story\*\*" "$AGENTS" 2>/dev/null | sed 's/.*|\s*[^|]*|\s*\([^|]*\)\s*|.*/\1/' | xargs | awk '{print $1}' | tr -d ':' || echo "")
fi

echo "  ✓ bmm-workflow-status.yaml: story='$WORKFLOW_STORY', epic='$WORKFLOW_EPIC'"
echo "  ✓ AGENTS.md: story='$AGENTS_STORY', epic='$AGENTS_EPIC'"

# ================================================================
# STEP 3: GOVERNANCE CONSISTENCY CHECK
# ================================================================

echo ""
echo "Checking consistency..."

CONFLICTS=()

# Story ID check (trim whitespace before compare)
if [ -n "$WORKFLOW_STORY" ] && [ -n "$AGENTS_STORY" ]; then
  WORKFLOW_STORY_TRIM=$(echo "$WORKFLOW_STORY" | tr -d ' ')
  AGENTS_STORY_TRIM=$(echo "$AGENTS_STORY" | tr -d ' ')
  if [ "$WORKFLOW_STORY_TRIM" != "$AGENTS_STORY_TRIM" ]; then
    CONFLICTS+=("Story ID: workflow='$WORKFLOW_STORY' vs agents='$AGENTS_STORY'")
  fi
fi

# Epic ID check
if [ -n "$WORKFLOW_EPIC" ] && [ -n "$AGENTS_EPIC" ]; then
  WORKFLOW_EPIC_TRIM=$(echo "$WORKFLOW_EPIC" | tr -d ' ')
  AGENTS_EPIC_TRIM=$(echo "$AGENTS_EPIC" | tr -d ' ')
  if [ "$WORKFLOW_EPIC_TRIM" != "$AGENTS_EPIC_TRIM" ]; then
    CONFLICTS+=("Epic ID: workflow='$WORKFLOW_EPIC' vs agents='$AGENTS_EPIC'")
  fi
fi

# Sprint status check
if [ -f "$SPRINT_STATUS" ]; then
  if grep -q "$WORKFLOW_STORY" "$SPRINT_STATUS" 2>/dev/null; then
    echo "  ✓ Sprint status: Story found in sprint"
  else
    echo "  ⚠ Sprint status: Story NOT found in sprint"
    CONFLICTS+=("Story '$WORKFLOW_STORY' not found in sprint-status.yaml")
  fi
else
  echo "  ○ Sprint status: No sprint-status.yaml found (optional)"
fi

# ================================================================
# STEP 4: ACTION MATRIX
# ================================================================

echo ""
if [ ${#CONFLICTS[@]} -gt 0 ]; then
  echo "Issues found: ${#CONFLICTS[@]}"
  for c in "${CONFLICTS[@]}"; do
    echo "  ✗ $c"
  done
  echo ""
  
  case "$INTENT" in
    "remediation")
      echo "╔═══════════════════════════════════════════════════════════════════════╗"
      echo "║  ⚠️  GOVERNANCE DOCUMENTS OUT OF SYNC                             ║"
      echo "╠═══════════════════════════════════════════════════════════════════════╣"
      echo "║                                                                       ║"
      echo "║  You want to: $INTENT                                               ║"
      echo "  (understood from: \"$PROMPT\")"
      echo "║                                                                       ║"
      echo "║  But governance documents are inconsistent:                         ║"
      for c in "${CONFLICTS[@]}"; do
        echo "║    • $c"
      done
      echo "║                                                                       ║"
      echo "║  FIX FIRST before proceeding:                                       ║"
      echo "║    1. Update bmm-workflow-status.yaml                               ║"
      echo "║    2. Update AGENTS.md Quick Reference section                      ║"
      echo "║    3. Update sprint-status.yaml (if exists)                         ║"
      echo "║                                                                       ║"
      echo "║  [BLOCKED] - Remediation cannot proceed until fixed                ║"
      echo "║                                                                       ║"
      echo "╚═══════════════════════════════════════════════════════════════════════╝"
      echo ""
      exit 1
      ;;
      
    *)
      echo "⚠️  Documents have conflicts but proceeding (non-remediation intent)."
      ;;
  esac
else
  echo "✅ Governance check passed!"
  echo ""
  echo "Understood: $INTENT"
  echo "Original: \"$PROMPT\""
  echo ""
  echo "Proceeding with your request..."
fi

echo ""
echo "=== GOVERNANCE CHECK COMPLETE ==="
exit 0
