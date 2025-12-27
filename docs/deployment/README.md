# Deployment Guide

> **Via-Gent** deployment documentation for production environments

## Overview

Via-Gent uses **Netlify** for hosting with **GitHub Actions** for CI/CD automation. The application is built with TanStack Start and supports both static assets and SSR (Server-Side Rendering) functions.

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GitHub Repository                             │
├─────────────────────────────────────────────────────────────────────┤
│  Push to main/dev    │     Pull Request to main                     │
│         │            │              │                                │
│         ▼            │              ▼                                │
│   ┌──────────┐       │       ┌──────────────┐                        │
│   │  ci.yml  │◄──────┼───────│  ci.yml      │                        │
│   │ (test)   │       │       │ (test+build) │                        │
│   └────┬─────┘       │       └──────────────┘                        │
│        │             │                                               │
│        ▼             │                                               │
│   ┌────────────┐     │                                               │
│   │ deploy.yml │     │                                               │
│   │  (Netlify) │     │                                               │
│   └─────┬──────┘     │                                               │
└─────────┼────────────┴──────────────────────────────────────────────┘
          │
          ▼
    ┌─────────────────────┐
    │      Netlify        │
    │  ┌───────────────┐  │
    │  │ dist/client/  │  │  ◄── Static assets
    │  └───────────────┘  │
    │  ┌───────────────┐  │
    │  │ SSR Functions │  │  ◄── Auto-configured by plugin
    │  └───────────────┘  │
    └─────────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 20.x
- pnpm 10.x
- GitHub account with repository access
- Netlify account

### Local Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

### Deploy to Production

1. **Automatic:** Push to `main` branch → triggers automatic deployment
2. **Manual:** Run `pnpm build` and deploy `dist/client/` to Netlify

## Configuration Files

| File | Purpose |
|------|---------|
| [netlify.toml](../netlify.toml) | Netlify build configuration and headers |
| [.github/workflows/ci.yml](../.github/workflows/ci.yml) | CI pipeline (tests, type check) |
| [.github/workflows/deploy.yml](../.github/workflows/deploy.yml) | CD to Netlify |
| [.env.example](../.env.example) | Environment variable template |

## Related Documentation

- [Netlify Setup Guide](./netlify-setup.md) - First-time Netlify configuration
- [Environment Variables](./environment-variables.md) - Complete env var reference
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions

---

## Build Output

The build process produces:

```
dist/
├── client/           # Static assets (CSS, JS, images)
│   ├── index.html
│   ├── assets/
│   └── ...
└── server/           # SSR functions (auto-configured)
    └── ...
```

## Security Headers

Via-Gent requires specific security headers for WebContainer support:

| Header | Value | Purpose |
|--------|-------|---------|
| `Cross-Origin-Opener-Policy` | `same-origin` | WebContainer isolation |
| `Cross-Origin-Embedder-Policy` | `require-corp` | Cross-origin resource handling |
| `Cross-Origin-Resource-Policy` | `cross-origin` | Resource sharing policy |

These are configured in both `netlify.toml` and output via `dist/_headers`.
