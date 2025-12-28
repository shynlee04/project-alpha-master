# Development Guide

## Prerequisites
- **Node.js**: Version 20 or higher recommended.
- **pnpm**: Preferred package manager (based on `pnpm-lock.yaml` presence).

## Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env`.
   - Configure necessary API keys (OpenAI, Gemini, etc.).

## Available Commands

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Start development server (Port 3000) |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run tests via Vitest |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm i18n:extract` | Extract translation strings |

## Testing
- **Unit/Integration**: `pnpm test`
- Tests are located in `__tests__` folders or alongside components (`*.test.tsx`).
- Uses Vitest with React Testing Library and axe-core for accessibility testing.

## Documentation
- Architecture and design docs in `docs/`
- Generated outputs in `_bmad-output/`
