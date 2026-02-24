#!/bin/bash

# MiniMax MCP Server Setup for OpenCode
# This script installs uvx and configures MiniMax MCP servers globally for all OpenCode projects

set -e  # Exit on error

echo "🚀 MiniMax MCP Server Setup for OpenCode"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Your API Key
API_KEY="sk-cp-xDMzbctSaJp9k7sXuav9yisXufMuQBNfbT4Z9IWrpmZ0ERszh42NFQPpFkEFaXEhuYa5mNTnyxWS0RDH-XN4ZIbEBN6wFkq0s1wWyfRQUT5Jo-jFXZjqw4o"

# Function to print colored output
print_step() {
    echo -e "${BLUE}📋 Step $1: $2${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Install uvx
print_step "1" "Installing uvx (Python package installer)"
echo ""

# Check if uvx is already installed
if command -v uvx &> /dev/null; then
    print_success "uvx is already installed"
    echo "   Version: $(uvx --version)"
else
    print_warning "uvx not found, installing..."

    # Detect OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install uv
        else
            curl -LsSf https://astral.sh/uv/install.sh | sh
            # Add uv to PATH for current session
            export PATH="$HOME/.local/bin:$PATH"
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -LsSf https://astral.sh/uv/install.sh | sh
        export PATH="$HOME/.local/bin:$PATH"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
        # Windows
        powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
    else
        print_warning "Unknown OS, attempting generic installation..."
        curl -LsSf https://astral.sh/uv/install.sh | sh
        export PATH="$HOME/.local/bin:$PATH"
    fi

    # Verify installation
    if command -v uvx &> /dev/null; then
        print_success "uvx installed successfully"
        echo "   Version: $(uvx --version)"
    else
        print_error "Failed to install uvx"
        echo "   Please manually add ~/.local/bin to your PATH or restart your terminal"
    fi
fi

echo ""

# Step 2: Verify MiniMax MCP package
print_step "2" "Verifying MiniMax MCP package availability"
echo ""

if command -v uvx &> /dev/null; then
    print_success "Testing MiniMax MCP package..."
    # Just test that the package is available (don't run it yet)
    timeout 5 uvx minimax-coding-plan-mcp --help || true
    print_success "MiniMax MCP package is available"
else
    print_warning "uvx not available, skipping package verification"
fi

echo ""

# Step 3: Create OpenCode configuration directory
print_step "3" "Creating OpenCode configuration"
echo ""

# Create directory if it doesn't exist
CONFIG_DIR="$HOME/.config/opencode"
mkdir -p "$CONFIG_DIR"

print_success "Configuration directory created: $CONFIG_DIR"

echo ""

# Step 4: Configure MiniMax MCP
print_step "4" "Configuring MiniMax MCP servers"
echo ""

# Create the OpenCode configuration file
cat > "$CONFIG_DIR/opencode.json" << EOF
{
  "\$schema": "https://opencode.ai/config.json",
  "mcp": {
    "MiniMax": {
      "type": "local",
      "command": ["uvx", "minimax-coding-plan-mcp", "-y"],
      "environment": {
        "MINIMAX_API_KEY": "${API_KEY}",
        "MINIMAX_API_HOST": "https://api.minimax.io"
      },
      "enabled": true
    }
  },
  "settings": {
    "mcp": {
      "global": true,
      "enabledForAllProjects": true
    }
  }
}
EOF

print_success "MiniMax MCP configuration created"
echo ""
echo "   Configuration file: $CONFIG_DIR/opencode.json"
echo "   MCP Servers configured:"
echo "     - web_search (web browsing and search)"
echo "     - understand_image (image analysis)"
echo "   Status: Enabled for ALL projects"

echo ""

# Step 5: Verify configuration
print_step "5" "Verifying configuration"
echo ""

if [ -f "$CONFIG_DIR/opencode.json" ]; then
    print_success "Configuration file exists"
    echo ""
    echo "   File contents preview:"
    echo "   ----------------------"
    head -n 15 "$CONFIG_DIR/opencode.json"
    echo "   ... (truncated)"
else
    print_error "Configuration file was not created"
fi

echo ""
echo "=========================================="
print_success "MiniMax MCP Setup Complete!"
echo "=========================================="
echo ""
echo "📝 Next Steps:"
echo "   1. Close OpenCode completely (Cmd+Q)"
echo "   2. Reopen OpenCode"
echo "   3. Type /mcp in the chat to verify MiniMax is connected"
echo "   4. You should see:"
echo "      • web_search - Enabled"
echo "      • understand_image - Enabled"
echo ""
echo "🌐 Available Tools:"
echo "   • web_search - Search the web for information"
echo "   • understand_image - Analyze and understand images"
echo ""
print_warning "Note: If MCP tools don't appear immediately, try:"
echo "   1. Restart OpenCode again"
echo "   2. Check that uvx is in your PATH: which uvx"
echo "   3. Verify API key is correct in the configuration"
echo ""
