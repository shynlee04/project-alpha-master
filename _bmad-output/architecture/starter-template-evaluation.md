# Starter Template Evaluation

### Primary Technology Domain

**Full-Stack Client-Side IDE** based on project requirements analysis.

### Selected Starter: TanStack Start (SPA Mode)

**Rationale for Selection:**

TanStack Start with SPA mode is the optimal choice because:

1. **Native TanStack AI integration** - Required for agent tools
2. **Selective SSR support** - `ssr: false` for WebContainers routes
3. **File-based routing** - Clean route structure for IDE/workspace
4. **React 19 compatible** - Modern React features
5. **Vite 7.x bundling** - Fast dev server and builds

**Initialization Command:**

```bash
npx -y create-tanstack-start@latest ./ --template default --package-manager pnpm
```

**Architectural Decisions Provided by Starter:**

| Category | Decision |
|----------|----------|
| **Language & Runtime** | TypeScript 5.x with strict mode |
| **Framework** | React 19 + TanStack Start |
| **Router** | TanStack Router (file-based) |
| **Styling** | CSS-in-CSS (Shadcn/ui compatible) |
| **Build Tooling** | Vite 7.x with TanStack Start plugin |
| **Testing** | Vitest 3.x |
| **Code Organization** | Feature-based with `src/routes`, `src/lib`, `src/components` |

---
