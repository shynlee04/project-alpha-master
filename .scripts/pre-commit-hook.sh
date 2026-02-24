#!/bin/bash
###############################################################################
# Governance Enforcement: Pre-Commit Hook
#
# Validates all commits before allowing them to be created.
# Blocks commits that violate:
# - TypeScript errors (production code only)
# - ESLint violations
# - File size limits (stores ≤120 lines, components ≤300 lines)
# - Import path canonical compliance
#
# Installation:
#   cp .scripts/pre-commit-hook.sh .git/hooks/pre-commit
#   chmod +x .git/hooks/pre-commit
#
# Or use Husky (recommended):
#   npm install -D husky
#   npx husky set .husky/pre-commit ".scripts/pre-commit-hook.sh"
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Echo with color
echo_color() {
  echo -e "$2$1${NC}"
}

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$' || true)

if [ -z "$STAGED_FILES" ]; then
  # No TypeScript files staged, skip checks
  exit 0
fi

echo_color "🔍 Running governance validation..." "$BLUE"
echo ""

# Track if any check failed
FAILED=0

###############################################################################
# 1. TypeScript Check (production code only, excludes test files)
###############################################################################
echo_color "▶ TypeScript check (production code)..." "$BLUE"

# Check if pnpm is available
if command -v pnpm &> /dev/null; then
  if ! pnpm typecheck 2>&1; then
    echo_color "❌ TypeScript errors blocked" "$RED"
    echo_color "   Run 'pnpm typecheck' to see errors" "$YELLOW"
    FAILED=1
  else
    echo_color "   ✅ TypeScript check passed" "$GREEN"
  fi
else
  echo_color "   ⚠️  pnpm not found, skipping TypeScript check" "$YELLOW"
fi

###############################################################################
# 2. ESLint Check
###############################################################################
echo_color "▶ ESLint check..." "$BLUE"

if command -v pnpm &> /dev/null; then
  # Only lint staged files
  if ! pnpm lint $STAGED_FILES 2>&1; then
    echo_color "❌ Lint errors blocked" "$RED"
    echo_color "   Run 'pnpm lint' to fix errors" "$YELLOW"
    FAILED=1
  else
    echo_color "   ✅ Lint check passed" "$GREEN"
  fi
else
  echo_color "   ⚠️  pnpm not found, skipping lint check" "$YELLOW"
fi

###############################################################################
# 3. File Size Limit Check
###############################################################################
echo_color "▶ Size limit check..." "$BLUE"

if command -v node &> /dev/null; then
  if ! node .scripts/check-size-limits.js 2>&1; then
    echo_color "❌ Size violations blocked" "$RED"
    echo_color "   Split large files into smaller modules" "$YELLOW"
    FAILED=1
  fi
else
  echo_color "   ⚠️  node not found, skipping size check" "$YELLOW"
fi

###############################################################################
# 4. Import Path Validation
###############################################################################
echo_color "▶ Import path validation..." "$BLUE"

if command -v node &> /dev/null; then
  # Only check staged files for import violations
  if ! node .scripts/check-import-paths.js 2>&1; then
    echo_color "❌ Import violations blocked" "$RED"
    echo_color "   Update imports to use canonical paths" "$YELLOW"
    FAILED=1
  fi
else
  echo_color "   ⚠️  node not found, skipping import check" "$YELLOW"
fi

###############################################################################
# Final Result
###############################################################################
echo ""

if [ $FAILED -eq 1 ]; then
  echo_color "❌ Governance validation FAILED" "$RED"
  echo_color "" ""
  echo_color "Fix the issues above before committing." "$YELLOW"
  echo_color "To bypass (not recommended): git commit --no-verify" "$YELLOW"
  exit 1
fi

echo_color "✅ All governance checks passed" "$GREEN"
echo_color "" ""
exit 0
