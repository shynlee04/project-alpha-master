# TanStack Router Context - State Preservation & Hierarchical DI

**Source**: https://tanstack.com/router/v1/docs/framework/react/guide/router-context
**Date**: 2026-01-14
**Research Date**: 2026-01-14

---

## Executive Summary

TanStack Router's **router context** provides:
- **Hierarchical dependency injection** - context passed down route tree
- **Type-safe context inheritance** - each route can modify/add to context
- **Invalidation mechanism** - `router.invalidate()` for context refresh
- **Breadcrumb accumulation** - access to all matched route contexts

---

## Core Concepts

### 1. Typed Router Context

```typescript
import { createRootRouteWithContext, createRouter } from '@tanstack/react-router'

interface MyRouterContext {
  user: User
  queryClient: QueryClient
}

// Create root route with context type
const rootRoute = createRootRouteWithContext<MyRouterContext>()({
  component: App,
})
```

### 2. Passing Initial Context

```typescript
const router = createRouter({
  routeTree,
  context: {
    user: { id: '123', name: 'John Doe' },
    queryClient: new QueryClient(),
  },
})
```

### 3. Context Invalidation

```typescript
function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
      router.invalidate() // ← Recomputes context for all routes
    })
    return unsubscribe
  }, [])

  return user
}
```

---

## Hierarchical Context Modification

Each route can **modify or extend** the context via `beforeLoad`:

```typescript
// Root context has: { foo: true }
// Child route adds: { bar: true }

export const Route = createFileRoute('/todos')({
  beforeLoad: () => {
    return {
      bar: true, // Added to context
    }
  },
  loader: ({ context }) => {
    context.foo // true (inherited from parent)
    context.bar // true (added by this route)
  },
})
```

---

## Breadcrumb Pattern

**Key insight for HARS**: Accumulated route context enables breadcrumb trails:

```typescript
const matches = useRouterState({ select: (s) => s.matches })

const breadcrumbs = matches
  .filter((match) => match.context.getTitle)
  .map(({ pathname, context }) => ({
    title: context.getTitle(),
    path: pathname,
  }))
```

This maps directly to our **drill-bounce-continue** pattern for hierarchical documents.

---

## Integration with Our Stack

| Our Component | TanStack Router Feature | HARS Application |
|----------------|------------------------|-----------------|
| **File System API** | Route context injection | Pass file handle through route tree |
| **Zustand Stores** | Context as DI container | Inject store instances into loaders |
| **Dexie Database** | QueryClient pattern | Pass db client to routes |
| **Monaco Editor** | Context inheritance | Editor config shared across IDE routes |

---

## Key Takeaways for HARS

1. **Router context is hierarchical** - perfect for our drill-down pattern
2. **Each route can contribute** to accumulated context (breadcrumbs)
3. **Invalidation is explicit** - we control when to recompute
4. **Type-safe throughout** - context contracts enforced at compile time

---

## Sources

- TanStack Router Docs: https://tanstack.com/router/latest/docs
- Router Context Guide: https://tanstack.com/router/v1/docs/framework/react/guide/router-context
- Context7 Research: /tanstack/router
