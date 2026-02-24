#!/bin/bash
# validate-state-consolidation.sh
# Validates state consolidation progress for ARCH-01.2

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     State Consolidation Validation - ARCH-01.2               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0

check() {
  local name="$1"
  local condition="$2"
  if [ "$condition" = "true" ]; then
    echo -e "[${GREEN}PASS${NC}] $name"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    echo -e "[${RED}FAIL${NC}] $name"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
}

echo "=== 1. Circular Dependency Check ==="
CIRCULAR=$(grep -r "from '@/lib/state" src/infrastructure/ --include='*.ts*' 2>/dev/null | wc -l | tr -d ' ')
echo "   Infrastructure files importing from lib/state: $CIRCULAR"
check "No circular dependencies (infrastructure → lib/state)" "$([ "$CIRCULAR" -eq 0 ] && echo true || echo false)"
echo ""

echo "=== 2. Duplicate Folder Check ==="
if [ -d "src/lib/state/knowledge" ]; then
  KNOWLEDGE_EXISTS="true"
  echo "   src/lib/state/knowledge/ EXISTS"
else
  KNOWLEDGE_EXISTS="false"
  echo "   src/lib/state/knowledge/ DELETED"
fi
check "knowledge/ folder removed from lib/state" "$([ "$KNOWLEDGE_EXISTS" = "false" ] && echo true || echo false)"
echo ""

echo "=== 3. Store Migration Check ==="
if [ -f "src/infrastructure/persistence/stores/workspace/workspace-store.ts" ]; then
  WORKSPACE_STORE="true"
  echo "   workspace-store.ts: In infrastructure"
else
  WORKSPACE_STORE="false"
  echo "   workspace-store.ts: NOT in infrastructure"
fi
check "workspace-store.ts migrated to infrastructure" "$WORKSPACE_STORE"

if [ -f "src/infrastructure/persistence/stores/workspace/types.ts" ]; then
  WORKSPACE_TYPES="true"
  echo "   workspace-types.ts: In infrastructure"
else
  WORKSPACE_TYPES="false"
  echo "   workspace-types.ts: NOT in infrastructure"
fi
check "workspace-types.ts migrated to infrastructure" "$WORKSPACE_TYPES"
echo ""

echo "=== 4. Dead File Check ==="
if [ -f "src/lib/state/knowledge-store.ts.backup" ]; then
  DEAD="true"
  echo "   knowledge-store.ts.backup: EXISTS (should be deleted)"
else
  DEAD="false"
  echo "   knowledge-store.ts.backup: DELETED"
fi
check "Dead files removed" "$([ "$DEAD" = "false" ] && echo true || echo false)"
echo ""

echo "=== 5. Import Count Check ==="
OLD_IMPORTS=$(grep -r "from '@/lib/state" src/ --include='*.ts*' 2>/dev/null | grep -v "__tests__" | grep -v "lib/state/" | wc -l | tr -d ' ')
echo "   Production imports from lib/state (excluding tests, facades): $OLD_IMPORTS"
check "Production imports minimized (<20)" "$([ "$OLD_IMPORTS" -lt 20 ] && echo true || echo false)"
echo ""

echo "=== 6. TypeScript Check ==="
if pnpm typecheck > /dev/null 2>&1; then
  TS_PASS="true"
else
  TS_PASS="false"
fi
check "TypeScript compilation" "$TS_PASS"
echo ""

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                      SUMMARY                                  ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo -e "║  Passed: ${GREEN}$PASS_COUNT${NC}    Failed: ${RED}$FAIL_COUNT${NC}                               ║"
echo "╚══════════════════════════════════════════════════════════════╝"

if [ "$FAIL_COUNT" -gt 0 ]; then
  exit 1
fi
