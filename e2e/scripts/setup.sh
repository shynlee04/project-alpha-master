#!/bin/bash

# E2E Test Setup Script
# This script helps set up and run E2E tests

set -e

echo "🎭 Project Alpha - E2E Test Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
fi

echo "✅ Prerequisites check passed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
pnpm exec playwright install --with-deps

echo ""
echo "✅ Setup complete!"
echo ""
echo "Quick Start Commands:"
echo "  Run all tests:           pnpm test:e2e"
echo "  Run with UI:            pnpm test:e2e:ui"
echo "  Run specific workspace:  pnpm test:e2e ide-workspace"
echo "  Debug tests:             pnpm test:e2e:debug"
echo ""
echo "For more information, see e2e/README.md"
