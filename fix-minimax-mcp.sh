#!/bin/bash

# Fix MiniMax MCP in OpenCode - Direct insertion into existing config

CONFIG_FILE="$HOME/.config/opencode/opencode.json"
API_KEY="sk-cp-xDMzbctSaJp9k7sXuav9yisXufMuQBNfbT4Z9IWrpmZ0ERszh42NFQPpFkEFaXEhuYa5mNTnyxWS0RDH-XN4ZIbEBN6wFkq0s1wWyfRQUT5Jo-jFXZjqw4o"

echo "🔧 Adding MiniMax MCP to existing OpenCode configuration..."
echo ""

# Create backup
cp "$CONFIG_FILE" "$CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"
echo "✅ Backup created: $CONFIG_FILE.backup.*"

# Use Python to properly add MiniMax to the mcp object
python3 << 'PYTHON_SCRIPT'
import json
import sys

config_file = "/Users/apple/.config/opencode/opencode.json"

try:
    with open(config_file, 'r') as f:
        config = json.load(f)

    # Ensure mcp object exists
    if 'mcp' not in config:
        config['mcp'] = {}

    # Add MiniMax server with correct format (matching existing servers)
    config['mcp']['minimax'] = {
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
        "enabled": True
    }

    with open(config_file, 'w') as f:
        json.dump(config, f, indent=2)

    print("✅ MiniMax MCP server added successfully!")
    print(f"   Server name: minimax")
    print(f"   Tools: web_search, understand_image")
    print(f"   Config file: {config_file}")

except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
PYTHON_SCRIPT

echo ""
echo "📋 Configuration added. Verifying..."

# Verify the addition
python3 << 'PYTHON_SCRIPT'
import json
config_file = "/Users/apple/.config/opencode/opencode.json"
with open(config_file, 'r') as f:
    config = json.load(f)

if 'mcp' in config and 'minimax' in config['mcp']:
    print("✅ MiniMax server found in configuration")
    minimax = config['mcp']['minimax']
    print(f"   Type: {minimax.get('type')}")
    print(f"   Command: {' '.join(minimax.get('command', []))}")
    print(f"   Enabled: {minimax.get('enabled')}")
else:
    print("❌ MiniMax server NOT found in configuration")
PYTHON_SCRIPT

echo ""
echo "🚀 Next steps:"
echo "1. Close OpenCode (Cmd+Q)"
echo "2. Wait 3 seconds"
echo "3. Reopen OpenCode"
echo "4. Type /mcp in chat"
echo "5. You should see: minimax - Connected ✅"
echo ""
echo "Expected output from /mcp:"
echo "  • context7 - Connected"
echo "  • fetch - Connected"
echo "  • github - Connected"
echo "  • minimax - Connected  ← NEW"
echo ""
