#!/bin/bash
#
# MCP Integration Test Script
# Tests all MCP servers required for Integration Testing module
#
# Usage: ./test-mcp-integration.sh
#

set -e  # Exit on error

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                     MCP Integration Testing Suite                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test result function
test_result() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# ═══════════════════════════════════════════════════════════════════════════════
# Test 1: Check if Playwright MCP is installed
# ═══════════════════════════════════════════════════════════════════════════════
echo "Test 1: Playwright MCP Installation"
echo "────────────────────────────────────────────────────────────────────────────"

if command -v npx &> /dev/null; then
    if npx @playwright/mcp --version &> /dev/null 2>&1; then
        test_result 0 "Playwright MCP installed"
        npx @playwright/mcp --version
    else
        test_result 1 "Playwright MCP not found"
        echo -e "${YELLOW}⚠️  Install with: npm install -g @playwright/mcp${NC}"
    fi
else
    test_result 1 "npx not available"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# Test 2: Check if ChromeDev MCP is installed
# ═══════════════════════════════════════════════════════════════════════════════
echo "Test 2: ChromeDev MCP Installation"
echo "────────────────────────────────────────────────────────────────────────────"

if command -v npx &> /dev/null; then
    if npx @chromedev/mcp --version &> /dev/null 2>&1; then
        test_result 0 "ChromeDev MCP installed"
        npx @chromedev/mcp --version
    else
        test_result 1 "ChromeDev MCP not found"
        echo -e "${YELLOW}⚠️  Install with: npm install -g @chromedev/mcp${NC}"
    fi
else
    test_result 1 "npx not available"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# Test 3: Check if Zai-MCP-Server is installed
# ═══════════════════════════════════════════════════════════════════════════════
echo "Test 3: Zai-MCP-Server Installation"
echo "────────────────────────────────────────────────────────────────────────────"

if command -v npx &> /dev/null; then
    if npx @zai/mcp-server --version &> /dev/null 2>&1; then
        test_result 0 "Zai-MCP-Server installed"
        npx @zai/mcp-server --version
    else
        test_result 1 "Zai-MCP-Server not found"
        echo -e "${YELLOW}⚠️  Install with: npm install -g @zai/mcp-server${NC}"
    fi
else
    test_result 1 "npx not available"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# Test 4: Verify MCP configuration file exists
# ═══════════════════════════════════════════════════════════════════════════════
echo "Test 4: MCP Configuration File"
echo "────────────────────────────────────────────────────────────────────────────"

CONFIG_FILE="_bmad/modules/integration-testing/config/mcp-servers.yaml"
if [ -f "$CONFIG_FILE" ]; then
    test_result 0 "MCP config file exists: $CONFIG_FILE"
    echo "File size: $(wc -l < "$CONFIG_FILE") lines"
else
    test_result 1 "MCP config file not found: $CONFIG_FILE"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# Test 5: Verify .opencode platform integration
# ═══════════════════════════════════════════════════════════════════════════════
echo "Test 5: Platform Integration (.opencode)"
echo "────────────────────────────────────────────────────────────────────────────"

OPencode_CONFIG=".opencode/config/mcp-servers.yaml"
if [ -f "$OPencode_CONFIG" ]; then
    test_result 0 ".opencode MCP config exists: $OPencode_CONFIG"
    echo "File size: $(wc -l < "$OPencode_CONFIG") lines"
else
    test_result 1 ".opencode MCP config not found: $OPencode_CONFIG"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# Test 6: Check if API keys config file exists (gitignored)
# ═══════════════════════════════════════════════════════════════════════════════
echo "Test 6: API Keys Configuration"
echo "────────────────────────────────────────────────────────────────────────────"

API_KEYS_FILE="_bmad/modules/integration-testing/config/api-keys-prod.yaml"
if [ -f "$API_KEYS_FILE" ]; then
    test_result 0 "API keys file exists: $API_KEYS_FILE"

    # Check if file is gitignored
    if grep -q "api-keys-prod.yaml" .gitignore 2>/dev/null; then
        test_result 0 "API keys file is gitignored"
    else
        test_result 1 "API keys file is NOT gitignored (SECURITY RISK)"
        echo -e "${RED}⚠️  Add to .gitignore: _bmad/modules/integration-testing/config/api-keys-prod.yaml${NC}"
    fi
else
    test_result 1 "API keys file not found (expected - user must create)"
    echo -e "${YELLOW}⚠️  Create: $API_KEYS_FILE${NC}"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# Test 7: Verify screenshot output directories
# ═══════════════════════════════════════════════════════════════════════════════
echo "Test 7: Screenshot Output Directories"
echo "────────────────────────────────────────────────────────────────────────────"

BASELINE_DIR="_bmad-output/screenshots/baseline"
ACTUAL_DIR="_bmad-output/screenshots/actual"
DIFFS_DIR="_bmad-output/screenshots/diffs"

# Create directories if they don't exist
mkdir -p "$BASELINE_DIR" "$ACTUAL_DIR" "$DIFFS_DIR"

if [ -d "$BASELINE_DIR" ]; then
    test_result 0 "Baseline directory exists: $BASELINE_DIR"
else
    test_result 1 "Baseline directory not found: $BASELINE_DIR"
fi

if [ -d "$ACTUAL_DIR" ]; then
    test_result 0 "Actual directory exists: $ACTUAL_DIR"
else
    test_result 1 "Actual directory not found: $ACTUAL_DIR"
fi

if [ -d "$DIFFS_DIR" ]; then
    test_result 0 "Diffs directory exists: $DIFFS_DIR"
else
    test_result 1 "Diffs directory not found: $DIFFS_DIR"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# Test 8: Verify workflow files exist
# ═══════════════════════════════════════════════════════════════════════════════
echo "Test 8: Workflow Files"
echo "────────────────────────────────────────────────────────────────────────────"

BROWSER_AUTOMATION_WORKFLOW="_bmad/modules/integration-testing/workflows/browser-automation-suite.md"
if [ -f "$BROWSER_AUTOMATION_WORKFLOW" ]; then
    test_result 0 "Browser automation workflow exists"
    echo "File size: $(wc -l < "$BROWSER_AUTOMATION_WORKFLOW") lines"
else
    test_result 1 "Browser automation workflow not found"
fi

COMPREHENSIVE_REMEDIATION_WORKFLOW="_bmad/modules/architecture-refactoring/workflows/comprehensive-remediation.md"
if [ -f "$COMPREHENSIVE_REMEDIATION_WORKFLOW" ]; then
    test_result 0 "Comprehensive remediation workflow exists"
    echo "File size: $(wc -l < "$COMPREHENSIVE_REMEDIATION_WORKFLOW") lines"
else
    test_result 1 "Comprehensive remediation workflow not found"
fi

SPEC_DRIVEN_WORKFLOW="_bmad/modules/sprint-execution/workflows/spec-driven-development.md"
if [ -f "$SPEC_DRIVEN_WORKFLOW" ]; then
    test_result 0 "Spec-driven development workflow exists"
    echo "File size: $(wc -l < "$SPEC_DRIVEN_WORKFLOW") lines"
else
    test_result 1 "Spec-driven development workflow not found"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════════════════════════════════════════
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                               Test Summary                                   ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✅ All MCP integration tests passed!${NC}"
    echo ""
    echo "Next Steps:"
    echo "1. Install missing MCP servers (if any)"
    echo "2. Create api-keys-prod.yaml with production keys"
    echo "3. Run browser automation suite: _bmad/modules/integration-testing/workflows/browser-automation-suite.md"
    exit 0
else
    echo -e "${RED}❌ Some MCP integration tests failed${NC}"
    echo ""
    echo "Required Actions:"
    echo "1. Install missing MCP servers"
    echo "2. Create missing configuration files"
    echo "3. Re-run this test script"
    exit 1
fi
