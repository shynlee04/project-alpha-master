# Build Configuration Documentation

## Overview

The Via-gent platform uses Vite 7 as its build tool with comprehensive configuration for development, production builds, and multiple deployment targets (Cloudflare, Netlify, Vercel).

## File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `package.json` | 132 | Project metadata and scripts |
| `vite.config.ts` | 270 | Vite configuration |
| `tsconfig.json` | 29 | TypeScript compiler options |
| `.env.example` | - | Environment variables template |
| `tsconfig.check.json` | - | Production-only type checking |

## package.json

### Scripts

```json
{
  "scripts": {
    "dev": "DEPLOY_TARGET=node vite dev --port 3000",
    "dev:cloudflare": "DEPLOY_TARGET=cloudflare vite dev --port 3000",
    "build": "NODE_OPTIONS='--max-old-space-size=8192' DEPLOY_TARGET=node vite build",
    "build:cloudflare": "NODE_OPTIONS='--max-old-space-size=8192' DEPLOY_TARGET=cloudflare vite build",
    "build:vercel": "NODE_OPTIONS='--max-old-space-size=8192' DEPLOY_TARGET=vercel vite build",
    "build:netlify": "NODE_OPTIONS='--max-old-space-size=8192' DEPLOY_TARGET=netlify vite build",
    "build:analyze": "pnpm build && node scripts/analyze-bundle.js",
    "preview": "vite preview",
    "test": "vitest run",
    "typecheck": "tsc -p tsconfig.check.json --noEmit --incremental",
    "typecheck:all": "tsc --noEmit",
    "i18n:extract": "i18next-scanner --config i18next-scanner.config.cjs",
    "lint": "eslint src --ext .ts,.tsx --max-warnings 0",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "governance": "node .scripts/check-size-limits.js && node .scripts/check-import-paths.js",
    "governance:size": "node .scripts/check-size-limits.js",
    "governance:imports": "node .scripts/check-import-paths.js"
  }
}
```

### Script Descriptions

| Script | Purpose |
|--------|---------|
| `dev` | Start development server (Node.js target) |
| `dev:cloudflare` | Start dev server (Cloudflare Pages target) |
| `build` | Production build (Node.js) with 8GB heap |
| `build:cloudflare` | Production build for Cloudflare Pages |
| `build:vercel` | Production build for Vercel |
| `build:netlify` | Production build for Netlify |
| `build:analyze` | Build with bundle analysis |
| `preview` | Preview production build |
| `test` | Run tests with Vitest |
| `typecheck` | TypeScript check (production code only, faster) |
| `typecheck:all` | TypeScript check (including test files) |
| `i18n:extract` | Extract translation keys from source |
| `lint` | ESLint with 0 warnings |
| `lint:fix` | Auto-fix ESLint issues |
| `governance` | Run all governance checks |
| `governance:size` | Check file size limits |
| `governance:imports` | Check import paths |

### Key Dependencies

#### Styling & i18n
```json
{
  "tailwindcss": "^4.1.18",
  "@tailwindcss/vite": "^4.1.18",
  "i18next": "^25.7.3",
  "react-i18next": "^16.5.0",
  "i18next-browser-languagedetector": "^8.2.0"
}
```

#### Framework & Router
```json
{
  "@tanstack/react-router": "1.144.0",
  "@tanstack/react-start": "1.145.2",
  "@tanstack/react-router-devtools": "1.144.0"
}
```

#### Testing
```json
{
  "vitest": "^4.0.16",
  "@testing-library/react": "^16.3.1",
  "@testing-library/user-event": "^14.6.1",
  "jsdom": "^27.4.0"
}
```

#### Build Tools
```json
{
  "vite": "^7.3.0",
  "typescript": "^5.9.3",
  "@vitejs/plugin-react": "^5.1.2"
}
```

## vite.config.ts

### Security Headers Plugin

```typescript
const securityHeadersPlugin: Plugin = {
  name: 'configure-security-headers',
  configureServer(server) {
    server.middlewares.use((_req, res, next) => {
      // Cross-Origin Isolation (required for WebContainers)
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

      // Security Headers
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

      next();
    });
  },
};
```

**Note:** CSP headers are NOT set in dev mode because they would block:
- IndexedDB operations
- File System Access API
- WebContainer internal operations

### Deployment Plugin Loading

```typescript
async function getDeploymentPlugin() {
  if (DEPLOY_TARGET === 'cloudflare') {
    const { cloudflare } = await import('@cloudflare/vite-plugin');
    return cloudflare({ viteEnvironment: { name: 'ssr' } });
  } else if (DEPLOY_TARGET === 'netlify') {
    const netlify = (await import('@netlify/vite-plugin-tanstack-start')).default;
    return netlify();
  } else if (DEPLOY_TARGET === 'vercel') {
    return null; // Standard build + vercel.json
  }
  return null;
}
```

### SSR Alias Resolve Plugin

Handles heavy library aliasing for SSR builds:

```typescript
{
  name: 'ssr-alias-resolve',
  enforce: 'pre',
  resolveId(source, _importer, options) {
    const isSsr = options?.ssr === true || (this.environment as any)?.name === 'ssr';

    if (isSsr) {
      const heavyLibraries = [
        // Mermaid ecosystem (~500KB)
        'mermaid',
        'cytoscape',
        // D3 ecosystem (~400KB)
        'd3', 'd3-array', 'd3-color', // ... more d3 modules
        // BlockNote editor (~400KB)
        '@blocknote/react', '@blocknote/core', '@blocknote/mantine',
        // ML/AI transformers (~800KB)
        '@xenova/transformers',
        // Monaco Editor (~5MB)
        '@monaco-editor/react', 'monaco-editor',
        // XTerm (~300KB)
        '@xterm/xterm', '@xterm/addon-fit', '@xterm/addon-web-links', '@xterm/addon-webgl',
        // And more...
      ];

      if (heavyLibraries.includes(source)) {
        return path.resolve(__dirname, './src/lib/mocks/empty.ts');
      }
    }
  }
}
```

### Plugins Array

```typescript
export default defineConfig(async () => {
  const deployPlugin = await getDeploymentPlugin();

  return {
    plugins: [
      securityHeadersPlugin,
      tanstackStart(),
      devtools({ eventBusConfig: { port: devtoolsEventBusPort } }),
      ...(deployPlugin ? [deployPlugin] : []),
      viteTsConfigPaths({ projects: ['./tsconfig.json'] }),
      tailwindcss(),
      viteReact(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      chunkSizeWarningLimit: 600,
    },
    optimizeDeps: {
      exclude: ['sharp', 'onnxruntime-node', '@xenova/transformers'],
    },
    environments: {
      ssr: {
        optimizeDeps: {
          exclude: [
            'sharp', 'onnxruntime-node', '@xenova/transformers',
            '@blocknote/core', '@blocknote/react', '@blocknote/mantine',
            '@xyflow/react', 'react-resizable-panels',
          ],
        },
      },
    },
    ssr: DEPLOY_TARGET === 'cloudflare' ? { noExternal: true } : { external: [...] },
  };
});
```

### Build Configuration

```typescript
build: {
  // Increase warning limit since we have large vendor chunks
  chunkSizeWarningLimit: 600,
  // Let Vite handle code splitting automatically
}
```

### SSR Configuration

```typescript
// Cloudflare (plugin handles everything)
ssr: {
  noExternal: true,
}

// Node/Vercel (explicit externalization)
ssr: {
  external: [
    '@monaco-editor/react', 'monaco-editor',
    '@xterm/xterm', '@xterm/addon-fit',
    '@xenova/transformers', 'onnxruntime-node', 'onnxruntime-web',
    'pdfjs-dist', '@blocknote/core', '@blocknote/react', '@blocknote/mantine',
    '@xyflow/react', 'react-resizable-panels', 'cytoscape', 'mermaid',
    'khroma', 'stylis', '@webcontainer/api', 'sharp',
  ],
  noExternal: [],
}
```

## tsconfig.json

```json
{
  "include": ["**/*.ts", "**/*.tsx"],
  "compilerOptions": {
    "target": "ES2022",
    "jsx": "react-jsx",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client", "vitest/globals", "vitest"],

    // Bundler mode
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": false,
    "noEmit": true,

    // Linting
    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### TypeScript Options

| Option | Value | Purpose |
|--------|-------|---------|
| `target` | ES2022 | Modern JavaScript target |
| `jsx` | react-jsx | React JSX transformation |
| `module` | ESNext | Modern module system |
| `moduleResolution` | bundler | Vite-style resolution |
| `strict` | true | Strict type checking |
| `noUnusedLocals` | true | Error on unused variables |
| `noUnusedParameters` | true | Error on unused parameters |
| `paths` | @/* → ./src/* | Path aliases |

### Production Type Checking

```json
// tsconfig.check.json
{
  "extends": "./tsconfig.json",
  "exclude": ["**/*.test.ts", "**/*.test.tsx", "**/__tests__/**"]
}
```

Using `pnpm typecheck` (excludes tests) is ~3x faster than `pnpm typecheck:all`.

## Environment Variables

### .env.example

```bash
# =============================================================================
# Sentry Error Monitoring (Optional)
# =============================================================================
# VITE_SENTRY_DSN - Your Sentry project DSN
# VITE_SENTRY_ENVIRONMENT - Environment tag (development, staging, production)
# VITE_SENTRY_SAMPLE_RATE - Error sampling rate (0.0 to 1.0)
# VITE_SENTRY_FORCE_ENABLED - Force enable in non-production

# =============================================================================
# Application Configuration
# =============================================================================
```

### Environment Variables Reference

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `DEPLOY_TARGET` | No | cloudflare | Deployment platform |
| `NODE_OPTIONS` | No | --max-old-space-size=8192 | Node.js heap size |
| `VITE_SENTRY_DSN` | No | - | Sentry error tracking |
| `VITE_SENTRY_ENVIRONMENT` | No | development | Sentry environment |
| `VITE_SENTRY_SAMPLE_RATE` | No | 1.0 | Sentry sampling |
| `TANSTACK_DEVTOOLS_EVENT_BUS_PORT` | No | 42071 | DevTools port |

### Deployment Targets

| Target | Build Command | Plugin |
|--------|---------------|--------|
| Cloudflare | `build:cloudflare` | @cloudflare/vite-plugin |
| Netlify | `build:netlify` | @netlify/vite-plugin-tanstack-start |
| Vercel | `build:vercel` | Standard build |
| Node.js | `build` | None |

## Build Process

### Development Build

```bash
pnpm dev
```

Starts Vite dev server on port 3000 with:
- Hot module replacement (HMR)
- Cross-Origin Isolation headers
- Source maps
- Fast refresh

### Production Build

```bash
pnpm build
```

Creates optimized production bundle with:
- Minification
- Tree shaking
- Code splitting
- Chunk optimization

### Bundle Analysis

```bash
pnpm build:analyze
```

Generates bundle analysis report using `scripts/analyze-bundle.js`.

## Testing Configuration

```json
// vitest.config.ts
{
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  }
}
```

## Governance Scripts

### File Size Limits

```bash
pnpm governance:size
```

Checks that files don't exceed size limits:
- Components: 300 lines
- Hooks: 150 lines
- Slice files: 120 lines
- Store facades: 300 lines
- Helpers: 120 lines

### Import Path Validation

```bash
pnpm governance:imports
```

Validates that imports follow project conventions.

## Known Issues and Limitations

1. **Vite 7 Type Definitions**: Async config types not fully supported
2. **Heavy Library SSR**: Requires ssr-alias-resolve plugin workaround
3. **CSP in Dev**: Must be omitted for IndexedDB/FSA/WebContainer
4. **Type Checking Speed**: Full typecheck (including tests) is slow

## Developer Notes

1. Use `DEPLOY_TARGET` env var to switch deployment targets
2. Run `pnpm typecheck` (not typecheck:all) for faster feedback
3. All environment variables must be prefixed with `VITE_` for client access
4. Heavy libraries are aliased to empty.ts during SSR to reduce bundle size
5. Cross-Origin Isolation is REQUIRED for WebContainer functionality
6. Use path aliases (`@/`) for cleaner imports
7. Run governance checks before committing
