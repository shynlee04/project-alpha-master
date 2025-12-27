# Project Alpha

> **100% Client-Side, AI-Powered IDE with WebContainers**

[![CI](https://github.com/YOUR_USERNAME/project-alpha/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/project-alpha/actions/workflows/ci.yml)
[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR_SITE_ID/deploy-status)](https://app.netlify.com/sites/YOUR_SITE_NAME/deploys)

## Features

- 🚀 **WebContainers** - Run Node.js directly in the browser
- 📁 **File System Access API** - Sync with local files
- 🤖 **AI Agent Integration** - Gemini-powered code assistant
- ✨ **Monaco Editor** - Full VS Code editing experience
- 🔒 **Client-Side Only** - Your code never leaves your browser

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open http://localhost:3000
```

## Development

```bash
# TypeScript check
pnpm typecheck

# Run tests
pnpm test

# Build for production
pnpm build
```

## Deployment

### Prerequisites

1. Create a Netlify site
2. Add GitHub repository secrets:
   - `NETLIFY_AUTH_TOKEN`: Personal access token from Netlify
   - `NETLIFY_SITE_ID`: Site ID from Netlify site settings

### Required Headers

This project requires specific COOP/COEP headers for WebContainers. These are configured in `public/_headers`.

See [Deployment Documentation](./DEPLOYMENT.md) for details.

## Tech Stack

- **Framework:** TanStack Start (React + Vite)
- **Editor:** Monaco Editor
- **Terminal:** xterm.js + WebContainers
- **Storage:** IndexedDB (idb)
- **AI:** TanStack AI + Gemini
- **Styling:** TailwindCSS 4.x

## License

MIT
