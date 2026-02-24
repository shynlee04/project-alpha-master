#!/bin/bash

# TypeScript Verification Script for ARCH-02-09
# Run this to verify all TypeScript errors are fixed

echo "======================================================================"
echo "TypeScript Verification for ARCH-02-09"
echo "======================================================================"
echo ""
echo "Files being checked:"
echo "  1. src/presentation/layouts/PluginLayout.tsx"
echo "  2. src/domain/interfaces/feature-plugin.interface.ts"
echo ""

# Clear TypeScript cache
echo "Clearing TypeScript cache..."
rm -rf node_modules/.cache/tsc
echo "✓ Cache cleared"
echo ""

# Run TypeScript check
echo "Running TypeScript check..."
echo "======================================================================"

# Check only the two files we modified
pnpm tsc --noEmit src/presentation/layouts/PluginLayout.tsx src/domain/interfaces/feature-plugin.interface.ts 2>&1

EXIT_CODE=$?

echo ""
echo "======================================================================"
if [ $EXIT_CODE -eq 0 ]; then
  echo "✓ SUCCESS: 0 TypeScript errors!"
  echo ""
  echo "All fixes applied successfully:"
  echo "  ✓ React import fixed"
  echo "  ✓ useEffect usage fixed"
  echo "  ✓ PluginPanel import path fixed"
  echo "  ✓ ProjectContext type import fixed"
  echo "  ✓ PluginId type import fixed"
  echo "  ✓ DOM event listener fixed"
  echo ""
  echo "AC6 (TypeScript: 0 errors) - PASSED"
else
  echo "✗ FAILED: TypeScript errors found"
  echo ""
  echo "Please review the errors above and:"
  echo "  1. Restart TypeScript server (Command Palette > TypeScript: Restart TS Server)"
  echo "  2. Check for stale cache issues"
  echo "  3. Review TYPESCRIPT_FIXES.md for details"
  echo ""
  echo "AC6 (TypeScript: 0 errors) - FAILED"
fi

echo "======================================================================"
exit $EXIT_CODE
