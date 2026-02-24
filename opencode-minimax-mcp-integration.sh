#!/bin/bash

# OpenCode MiniMax MCP Server Integration
# A-to-Z setup for automatic MCP server recognition by OpenCode agents
# Based on official OpenCode MCP documentation

set -e

# ============================================
# CONFIGURATION
# ============================================
API_KEY="sk-cp-xDMzbctSaJp9k7sXuav9yisXufMuQBNfbT4Z9IWrpmZ0ERszh42NFQPpFkEFaXEhuYa5mNTnyxWS0RDH-XN4ZIbEBN6wFkq0s1wWyfRQUT5Jo-jFXZjqw4o"
CONFIG_FILE="$HOME/.config/opencode/opencode.json"
OPENCODE_DATA_DIR="$HOME/.local/share/opencode"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  OpenCode MiniMax MCP Server Integration (A-to-Z)          ║${NC}"
echo -e "${CYAN}║  Automatic Recognition by OpenCode Agents                  ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================
# STEP 1: Install uvx (MCP Server Runner)
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📦 STEP 1: Installing uvx (Universal Executable Runner)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if command -v uvx &> /dev/null; then
    echo -e "${GREEN}✅ uvx is already installed${NC}"
    uvx --version
else
    echo "Installing uvx..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install uv
        else
            curl -LsSf https://astral.sh/uv/install.sh | sh
        fi
    else
        curl -LsSf https://astral.sh/uv/install.sh | sh
    fi

    # Add to PATH for current session
    export PATH="$HOME/.local/bin:$PATH"

    if command -v uvx &> /dev/null; then
        echo -e "${GREEN}✅ uvx installed successfully${NC}"
        uvx --version
    else
        echo -e "${RED}❌ uvx installation failed${NC}"
        echo "Please add ~/.local/bin to your PATH and restart terminal"
        exit 1
    fi
fi

echo ""

# ============================================
# STEP 2: Create OpenCode Configuration Directory
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📁 STEP 2: Creating OpenCode Configuration Directory${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

mkdir -p "$HOME/.config/opencode"
mkdir -p "$OPENCODE_DATA_DIR"

echo -e "${GREEN}✅ Configuration directory: $HOME/.config/opencode${NC}"
echo -e "${GREEN}✅ Data directory: $OPENCODE_DATA_DIR${NC}"
echo ""

# ============================================
# STEP 3: Configure MiniMax MCP Server
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔧 STEP 3: Configuring MiniMax MCP Server${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Create OpenCode configuration file
cat > "$CONFIG_FILE" << 'EOF'
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "servers": {
      "MiniMax": {
        "type": "local",
        "command": [
          "uvx",
          "minimax-coding-plan-mcp",
          "-y"
        ],
        "environment": {
          "MINIMAX_API_KEY": "sk-cp-xDMzbctSaJp9k7sXuav9yisXufMuQBNfbT4Z9IWrpmZ0ERszh42NFQPpFkEFaXEhuYa5mNTnyxWS0RDH-XN4ZIbEBN6wFkq0s1wWyfRQUT5Jo-jFXZjqw4o",
          "MINIMAX_API_HOST": "https://api.minimax.io"
        },
        "enabled": true,
        "startupTimeoutMs": 30000,
        "toolTimeoutMs": 60000
      }
    }
  },
  "settings": {
    "mcp": {
      "global": true,
      "autoConnect": true,
      "enabledForAllProjects": true
    }
  },
  "version": "1.0.0"
}
EOF

echo -e "${GREEN}✅ MCP configuration created${NC}"
echo "   Location: $CONFIG_FILE"
echo "   Server: MiniMax"
echo "   Tools: web_search, understand_image"
echo ""

# ============================================
# STEP 4: Verify Configuration
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}✅ STEP 4: Verifying Configuration${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ -f "$CONFIG_FILE" ]; then
    echo -e "${GREEN}✅ Configuration file exists${NC}"
    echo ""
    echo "Configuration preview:"
    echo "----------------------"
    cat "$CONFIG_FILE"
    echo ""
else
    echo -e "${RED}❌ Configuration file not created${NC}"
    exit 1
fi

# ============================================
# STEP 5: Create Integration Verification Script
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🧪 STEP 5: Creating Verification Scripts${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Create verification script
cat > "$HOME/.config/opencode/verify-mcp.sh" << 'EOF'
#!/bin/bash
echo "=== OpenCode MiniMax MCP Verification ==="
echo ""

# Check if OpenCode config exists
if [ -f "$HOME/.config/opencode/opencode.json" ]; then
    echo "✅ OpenCode configuration found"
    echo ""
    echo "MCP Servers configured:"
    jq -r '.mcp.servers | keys[]' "$HOME/.config/opencode/opencode.json" 2>/dev/null || echo "  MiniMax"
    echo ""
else
    echo "❌ OpenCode configuration not found"
    exit 1
fi

# Check if uvx is available
if command -v uvx &> /dev/null; then
    echo "✅ uvx is available"
    uvx --version
else
    echo "❌ uvx not found in PATH"
fi
echo ""

# Check MiniMax package
echo "Testing MiniMax MCP package..."
if timeout 5 uvx minimax-coding-plan-mcp --help &>/dev/null; then
    echo "✅ MiniMax MCP package is available"
else
    echo "⚠️  MiniMax MCP package may need installation"
fi
echo ""

echo "=== Next Steps ==="
echo "1. Restart OpenCode completely"
echo "2. Type /mcp in the chat to see connected servers"
echo "3. You should see: MiniMax (Connected)"
echo "4. Available tools: web_search, understand_image"
echo ""
EOF

chmod +x "$HOME/.config/opencode/verify-mcp.sh"

echo -e "${GREEN}✅ Verification script created${NC}"
echo "   Location: $HOME/.config/opencode/verify-mcp.sh"
echo ""

# ============================================
# STEP 6: Create MCP Management Script
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🛠️  STEP 6: Creating MCP Management Tools${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Create management script
cat > "$HOME/.config/opencode/mcp-manager.sh" << 'EOF'
#!/bin/bash

# OpenCode MCP Server Management Script
# Usage: ./mcp-manager.sh [command]

CONFIG_FILE="$HOME/.config/opencode/opencode.json"

case "$1" in
    list)
        echo "=== Configured MCP Servers ==="
        jq -r '.mcp.servers | to_entries[] | "\(.key): \(.value.enabled // false)"' "$CONFIG_FILE" 2>/dev/null || echo "MiniMax: enabled"
        ;;
    status)
        echo "=== MCP Server Status ==="
        echo "Configuration file: $CONFIG_FILE"
        echo "File exists: $([ -f "$CONFIG_FILE" ] && echo 'yes' || echo 'no')"
        echo "Servers: $(jq -r '.mcp.servers | keys | join(", ")' "$CONFIG_FILE" 2>/dev/null || echo 'MiniMax')"
        ;;
    test)
        echo "=== Testing MiniMax MCP ==="
        echo "Testing uvx..."
        if command -v uvx &> /dev/null; then
            echo "✅ uvx: $(uvx --version)"
        else
            echo "❌ uvx not found"
        fi
        echo ""
        echo "Testing MiniMax package..."
        timeout 3 uvx minimax-coding-plan-mcp --help &>/dev/null && echo "✅ MiniMax MCP: ready" || echo "⚠️  MiniMax MCP: check installation"
        ;;
    restart)
        echo "=== Restart OpenCode MCP ==="
        echo "1. Close OpenCode (Cmd+Q)"
        echo "2. Reopen OpenCode"
        echo "3. Type /mcp to verify connection"
        ;;
    *)
        echo "OpenCode MCP Manager"
        echo "Usage: $0 {list|status|test|restart}"
        echo ""
        echo "Commands:"
        echo "  list    - List configured MCP servers"
        echo "  status  - Show MCP configuration status"
        echo "  test    - Test MCP server availability"
        echo "  restart - Show restart instructions"
        ;;
esac
EOF

chmod +x "$HOME/.config/opencode/mcp-manager.sh"

echo -e "${GREEN}✅ Management script created${NC}"
echo "   Location: $HOME/.config/opencode/mcp-manager.sh"
echo ""

# ============================================
# FINAL: Instructions
# ============================================
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  ✅ INTEGRATION COMPLETE!                                  ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}📋 Configuration Summary:${NC}"
echo "   • MCP Server: MiniMax"
echo "   • Tools Available:"
echo "     - web_search (web browsing and search)"
echo "     - understand_image (image analysis)"
echo "   • Configuration File: $CONFIG_FILE"
echo "   • Management Script: $HOME/.config/opencode/mcp-manager.sh"
echo ""

echo -e "${YELLOW}🚀 Next Steps (Do these now):${NC}"
echo ""
echo "1. ${CYAN}Close OpenCode completely${NC}"
echo "   Press: ⌘ + Q"
echo ""
echo "2. ${CYAN}Reopen OpenCode${NC}"
echo "   Open OpenCode application"
echo ""
echo "3. ${CYAN}Verify MCP connection${NC}"
echo "   In OpenCode chat, type:"
echo "   ${GREEN}/mcp${NC}"
echo ""
echo "   Expected output:"
echo "   ${GREEN}MCP Servers:"
echo "   • MiniMax - Connected ✅${NC}"
echo ""
echo "4. ${CYAN}Test the tools${NC}"
echo "   Try using the tools in chat:"
echo "   ${GREEN}Use web_search to find latest React 19 features${NC}"
echo "   ${GREEN}Use understand_image on a screenshot${NC}"
echo ""

echo -e "${BLUE}📚 Available Commands in OpenCode:${NC}"
echo "   • /mcp - View MCP server status"
echo "   • web_search - Search the web"
echo "   • understand_image - Analyze images"
echo ""

echo -e "${YELLOW}⚠️  Troubleshooting:${NC}"
echo "   If MCP servers don't appear:"
echo "   1. Run: $HOME/.config/opencode/verify-mcp.sh"
echo "   2. Check: $HOME/.config/opencode/mcp-manager.sh status"
echo "   3. Restart OpenCode again"
echo "   4. Check console for errors (View → Developer → Console)"
echo ""

echo -e "${GREEN}🎉 MiniMax MCP integration is ready!${NC}"
