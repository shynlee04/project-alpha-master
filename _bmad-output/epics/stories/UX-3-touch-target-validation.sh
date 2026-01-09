#!/bin/bash
# UX-3 Touch Target Validation Script
# This script validates that all interactive elements meet WCAG 2.5.5 requirements

echo "=== UX-3 Touch Target Validation ==="
echo "Checking for touch target violations (elements < 44x44px)..."
echo ""

VIOLATIONS=0

# Check for common touch target violations in presentation components
# Violations: w-6, h-6 (24px), w-8, h-8 (32px) in interactive elements

echo "1. Checking for 24px touch targets (w-6, h-6)..."
W6_COUNT=$(grep -r "className.*w-6.*h-6" src/presentation/components --include="*.tsx" 2>/dev/null | grep -v "icon" | grep -v "Icon" | wc -l)
if [ "$W6_COUNT" -gt 0 ]; then
    echo "   ⚠️  Found $W6_COUNT potential 24px touch targets"
    grep -r "className.*w-6.*h-6" src/presentation/components --include="*.tsx" 2>/dev/null | grep -v "icon" | grep -v "Icon" | head -5
    VIOLATIONS=$((VIOLATIONS + W6_COUNT))
else
    echo "   ✅ No 24px touch targets found"
fi

echo ""
echo "2. Checking for 32px touch targets (w-8, h-8) in buttons..."
W8_BUTTON_COUNT=$(grep -r "w-8.*h-8" src/presentation/components --include="*.tsx" 2>/dev/null | grep -E "(button|Button)" | wc -l)
if [ "$W8_BUTTON_COUNT" -gt 0 ]; then
    echo "   ⚠️  Found $W8_BUTTON_COUNT potential 32px button touch targets"
    grep -r "w-8.*h-8" src/presentation/components --include="*.tsx" 2>/dev/null | grep -E "(button|Button)" | head -5
    VIOLATIONS=$((VIOLATIONS + W8_BUTTON_COUNT))
else
    echo "   ✅ No 32px button touch targets found"
fi

echo ""
echo "3. Checking for h-8 (32px) mobile headers..."
H8_HEADER_COUNT=$(grep -r "h-8 md:h-10" src/presentation/components --include="*.tsx" 2>/dev/null | wc -l)
if [ "$H8_HEADER_COUNT" -gt 0 ]; then
    echo "   ⚠️  Found $H8_HEADER_COUNT mobile headers with h-8 (32px)"
    grep -r "h-8 md:h-10" src/presentation/components --include="*.tsx" 2>/dev/null
    VIOLATIONS=$((VIOLATIONS + H8_HEADER_COUNT))
else
    echo "   ✅ No 32px mobile headers found"
fi

echo ""
echo "4. Checking for small switch dimensions (h-6)..."
SWITCH_H6=$(grep -r "h-6" src/presentation/components/ui/switch.tsx 2>/dev/null | grep -v "h-8" | wc -l)
if [ "$SWITCH_H6" -gt 0 ]; then
    echo "   ⚠️  Switch component has h-6 (24px) dimensions"
    VIOLATIONS=$((VIOLATIONS + 1))
else
    echo "   ✅ Switch dimensions appear compliant"
fi

echo ""
echo "5. Checking for small checkbox dimensions (h-6 w-6)..."
CHECKBOX_SIZE=$(grep -r "h-6.*w-6" src/presentation/components/ui/checkbox.tsx 2>/dev/null | wc -l)
if [ "$CHECKBOX_SIZE" -gt 0 ]; then
    echo "   ⚠️  Checkbox has 24x24px dimensions"
    VIOLATIONS=$((VIOLATIONS + 1))
else
    echo "   ✅ Checkbox dimensions appear compliant"
fi

echo ""
echo "=== Validation Summary ==="
if [ "$VIOLATIONS" -eq 0 ]; then
    echo "✅ PASS: All touch targets meet WCAG 2.5.5 requirements (44x44px minimum)"
    exit 0
else
    echo "❌ FAIL: Found $VIOLATIONS touch target violations"
    echo "   These need to be fixed before marking UX-3 as complete"
    exit 1
fi
