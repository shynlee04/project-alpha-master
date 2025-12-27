# TanStack Router Search Params - Technical Research

**Research Date:** 2025-12-10
**Research Type:** Technical - High Priority
**Purpose:** Implementation guide for type-safe search param validation with Zod

---

## Executive Summary

TanStack Router provides seamless search parameter validation using `zodValidator` from `@tanstack/zod-adapter`. This enables type-safe, validated search parameters with automatic type inference, error handling, and middleware support for parameter management in via-gent's routing system.

**Key Findings:**
- ✅ Type-safe search parameter validation with Zod schemas
- ✅ Automatic type inference for route parameters
- ✅ Built-in error handling with errorComponent
- ✅ Middleware support (retain/strip default params)
- ✅ Fallback values for resilient validation

---

## 1. Core zodValidator API

### 1.1 Basic Usage

```typescript
import { z } from 'zod';
import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';

const searchSchema = z.object({
  query: z.string().min(1),
  page: z.number().int().positive().default(1),
});

export const Route = createFileRoute('/search')({
  validateSearch: zodValidator(searchSchema),
  component: SearchPage,
});

function SearchPage() {
  // Fully typed search parameters
  const search = Route.useSearch();
  // Type: { query: string; page: number }
}
```

**Source:** https://github.com/tanstack/router/blob/main/docs/router/framework/react/guide/search-params.md

### 1.2 Import Path

```typescript
// The correct import
import { zodValidator } from '@tanstack/zod-adapter';

// NOT from @tanstack/router directly
// This is a separate adapter package
```

**Note:** `@tanstack/zod-adapter` is a companion package for TanStack Router

### 1.3 Schema Location Best Practices

```typescript
// ✅ Good: Separate schema file
// src/routes/schemas/search-schema.ts
import { z } from 'zod';

export const searchSchema = z.object({
  query: z.string().min(1),
  page: z.number().int().positive().default(1),
  category: z.string().optional(),
});

// src/routes/search.tsx
import { searchSchema } from './schemas/search-schema';

export const Route = createFileRoute('/search')({
  validateSearch: zodValidator(searchSchema),
});
```

---

## 2. Search Parameter Types

### 2.1 Basic Types

```typescript
const basicSchema = z.object({
  // Strings
  query: z.string().min(1).max(100),
  
  // Numbers
  page: z.number().int().positive(),
  price: z.number().min(0),
  
  // Booleans
  inStock: z.boolean().default(false),
  
  // Enums
  sortBy: z.enum(['name', 'price', 'date']).default('name'),
  
  // Optional
  category: z.string().optional(),
  
  // With defaults
  limit: z.number().int().positive().default(20),
});
```

### 2.2 Complex Types

```typescript
const advancedSchema = z.object({
  // Arrays
  tags: z.array(z.string()).optional(),
  categoryIds: z.array(z.number().int()).optional(),
  
  // Date/time
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  
  // Email
  email: z.string().email().optional(),
  
  // Objects
  priceRange: z
    .object({
      min: z.number().min(0),
      max: z.number().min(0),
    })
    .refine((data) => data.max >= data.min, {
      message: 'Max price must be greater than or equal to min price',
    })
    .optional(),
});
```

**Source:** https://github.com/tanstack/router/blob/main/docs/router/framework/react/how-to/validate-search-params.md

### 2.3 Conditional Validation

```typescript
const conditionalSchema = z
  .object({
    searchType: z.enum(['basic', 'advanced']),
    query: z.string().min(1),
  })
  .and(
    z.discriminatedUnion('searchType', [
      z.object({
        searchType: z.literal('basic'),
        // Basic search requires only query
      }),
      z.object({
        searchType: z.literal('advanced'),
        // Advanced search requires additional fields
        category: z.string().min(1),
        minPrice: z.number().min(0),
        maxPrice: z.number().min(0),
      }),
    ]),
  );
```

**Source:** https://github.com/tanstack/router/blob/main/docs/router/framework/react/how-to/validate-search-params.md

---

## 3. Fallback Values

### 3.1 Using .default()

```typescript
const schemaWithDefaults = z.object({
  page: z.number().int().positive().default(1),
  sortBy: z.enum(['name', 'date']).default('name'),
  limit: z.number().int().positive().default(20),
});

// Missing values get defaults
// /search?query=laptop
// Result: { query: 'laptop', page: 1, sortBy: 'name', limit: 20 }
```

### 3.2 Using .catch() for Resilience

```typescript
const resilientSchema = z.object({
  // Use .catch() to provide fallback values on validation failure
  page: z.number().int().positive().catch(1),

  // Use .default() for missing values, .catch() for invalid values
  sortBy: z
    .enum(['name', 'date', 'relevance'])
    .default('relevance')
    .catch('relevance'),

  // Custom recovery logic
  dateRange: z
    .object({
      start: z.string().datetime(),
      end: z.string().datetime(),
    })
    .catch({
      start: new Date().toISOString(),
      end: new Date().toISOString(),
    })
    .optional(),
});
```

**Source:** https://github.com/tanstack/router/blob/main/docs/router/framework/react/how-to/validate-search-params.md

### 3.3 fallback() Helper

```typescript
import { fallback } from '@tanstack/router';

const optimizedSchema = z.object({
  page: fallback(z.number().int().positive(), 1),
  sortBy: fallback(z.enum(['name', 'date']), 'name'),
});

// Equivalent to .default().catch() pattern
```

---

## 4. Navigation with Search Parameters

### 4.1 Link Component

```typescript
import { Link } from '@tanstack/react-router';

// Replace all search params
<Link to="/products" search={{ category: 'electronics', page: 1 }}>
  Electronics
</Link>

// Navigate to same route with new search
<Link search={{ sort: 'price-asc' }}>Sort by Price</Link>

// Preserve all search params when changing routes
<Link to="/products" search={true}>
  View Products (Keep Filters)
</Link>

// Equivalent functional approach
<Link to="/products" search={(prev) => prev}>
  View Products (Functional)
</Link>
```

**Source:** https://github.com/tanstack/router/blob/main/docs/router/framework/react/how-to/navigate-with-search-params.md

### 4.2 Functional Updates

```typescript
// Preserve existing search, update page
<Link 
  search={(prev) => ({ ...prev, page: (prev.page || 1) + 1 })}
>
  Next Page
</Link>

// Toggle filter while keeping other params
<Link
  search={(prev) => ({
    ...prev,
    inStock: !prev.inStock,
  })}
>
  Toggle In Stock
</Link>

// Remove a search parameter
<Link
  search={(prev) => {
    const { category, ...rest } = prev;
    return rest;
  }}
>
  Clear Category Filter
</Link>
```

**Source:** https://github.com/tanstack/router/blob/main/docs/router/framework/react/how-to/navigate-with-search-params.md

### 4.3 useNavigate Hook

```typescript
import { useNavigate } from '@tanstack/react-router';

function ProductList() {
  const navigate = useNavigate({ from: Route.fullPath });

  return (
    <div>
      <button
        onClick={() => {
          navigate({
            search: (prev) => ({ page: prev.page + 1 }),
          });
        }}
      >
        Next Page
      </button>
    </div>
  );
}
```

**Source:** https://github.com/tanstack/router/blob/main/docs/router/framework/react/guide/search-params.md

---

## 5. Middleware

### 5.1 retainSearchParams

```typescript
import { retainSearchParams } from '@tanstack/react-router';

export const Route = createRootRoute({
  validateSearch: zodValidator(
    z.object({
      rootValue: z.string().optional(),
    }),
  ),
  search: {
    middlewares: [retainSearchParams(['rootValue'])],
  },
});
```

**Source:** https://github.com/tanstack/router/blob/main/docs/router/framework/react/guide/search-params.md

### 5.2 stripSearchParams

```typescript
import { stripSearchParams } from '@tanstack/react-router';

const defaultValues = {
  one: 'abc',
  two: 'xyz',
};

const searchSchema = z.object({
  one: z.string().default(defaultValues.one),
  two: z.string().default(defaultValues.two),
});

export const Route = createFileRoute('/hello')({
  validateSearch: zodValidator(searchSchema),
  search: {
    // strip default values from URL
    middlewares: [stripSearchParams(defaultValues)],
  },
});
```

**Source:** https://github.com/tanstack/router/blob/main/docs/router/framework/react/guide/search-params.md

### 5.3 Chain Multiple Middlewares

```typescript
export const Route = createFileRoute('/search')({
  validateSearch: zodValidator(
    z.object({
      retainMe: z.string().optional(),
      arrayWithDefaults: z.string().array().default(defaultValues),
      required: z.string(),
    }),
  ),
  search: {
    middlewares: [
      retainSearchParams(['retainMe']),
      stripSearchParams({ arrayWithDefaults: defaultValues }),
    ],
  },
});
```

**Source:** https://github.com/tanstack/router/blob/main/docs/router/framework/react/guide/search-params.md

---

## 6. Error Handling

### 6.1 errorComponent

```typescript
export const Route = createFileRoute('/search')({
  validateSearch: zodValidator(searchSchema),
  
  errorComponent: ({ error }) => {
    const router = useRouter();

    return (
      <div className="error">
        <h2>Invalid Search Parameters</h2>
        <p>{error.message}</p>
        <button onClick={() => router.navigate({ to: '/search', search: {} })}>
          Reset Search
        </button>
      </div>
    );
  },
  
  component: SearchPage,
});
```

**Source:** https://github.com/tanstack/router/blob/main/docs/router/framework/react/how-to/validate-search-params.md

### 6.2 Custom Error Messages

```typescript
const userFriendlySchema = z.object({
  query: z
    .string()
    .min(2, 'Search query must be at least 2 characters')
    .max(100, 'Search query cannot exceed 100 characters'),

  page: fallback(
    z
      .number()
      .int('Page must be a whole number')
      .positive('Page must be greater than 0'),
    1,
  ),

  category: z
    .enum(['electronics', 'clothing', 'books'], {
      errorMap: () => ({ message: 'Please select a valid category' }),
    })
    .optional(),
});
```

**Source:** https://github.com/tanstack/router/blob/main/docs/router/framework/react/how-to/validate-search-params.md

### 6.3 Error Boundaries

```typescript
// ❌ Wrong - will throw error and break route
const strictSchema = z.object({
  page: z.number().int().positive(), // No fallback
});

// ✅ Correct - provides fallback for invalid values
const resilientSchema = z.object({
  page: fallback(z.number().int().positive(), 1),
});

// ✅ Alternative - use errorComponent on route
export const Route = createFileRoute('/search')({
  validateSearch: resilientSchema,
  errorComponent: ({ error }) => <SearchError error={error} />,
  component: SearchPage,
});
```

**Source:** https://github.com/tanstack/router/blob/main/docs/router/framework/react/how-to/validate-search-params.md

---

## 7. Performance Optimization

### 7.1 Pre-compile Schemas

```typescript
// Pre-compile schemas for better performance
const compiledSchema = zodValidator(
  z.object({
    query: z.string().min(1),
    page: fallback(z.number().int().positive(), 1),
  }),
);

export const Route = createFileRoute('/search')({
  validateSearch: compiledSchema,
  component: SearchPage,
});
```

**Source:** https://github.com/tanstack/router/blob/main/docs/router/framework/react/how-to/validate-search-params.md

### 7.2 Selective Validation

```typescript
function SearchPage() {
  // Only validate specific fields when needed
  const search = Route.useSearch({
    select: (search) => ({
      query: search.query,
      page: search.page,
    }),
  });

  return <div>Search Results</div>;
}
```

**Source:** https://github.com/tanstack/router/blob/main/docs/router/framework/react/how-to/validate-search-params.md

### 7.3 Lazy Validation

```typescript
// ❌ Slow - complex validation on every navigation
const complexSchema = z.object({
  query: z.string().refine(async (val) => await validateQuery(val)),
  // ... many complex validations
});

// ✅ Fast - simplified validation with lazy refinement
const optimizedSchema = z.object({
  query: z.string().min(1), // Basic validation only
});

// Perform complex validation separately in component
function SearchPage() {
  const search = Route.useSearch();

  // Complex validation only when needed
  const [complexValidation, setComplexValidation] = useState(null);

  useEffect(() => {
    validateComplexRules(search).then(setComplexValidation);
  }, [search]);

  return <SearchResults search={search} validation={complexValidation} />;
}
```

**Source:** https://github.com/tanstack/router/blob/main/docs/router/framework/react/how-to/validate-search-params.md

---

## 8. via-gent Implementation

### 8.1 IDE Route Schemas

```typescript
// src/routes/schemas/ide-schemas.ts
import { z } from 'zod';

export const fileExplorerSchema = z.object({
  path: z.string().optional(),
  expanded: z.array(z.string()).optional(),
  showHidden: z.boolean().default(false),
});

export const searchSchema = z.object({
  query: z.string().optional(),
  regex: z.boolean().default(false),
  caseSensitive: z.boolean().default(false),
  fileTypes: z.array(z.string()).optional(),
});

export const terminalSchema = z.object({
  cwd: z.string().optional(),
  fontSize: z.number().int().min(8).max(32).default(14),
  historySize: z.number().int().min(50).max(1000).default(100),
});
```

### 8.2 Agent Chat Schemas

```typescript
export const agentChatSchema = z.object({
  agentId: z.enum(['orchestrator', 'planner', 'coder', 'validator']),
  conversationId: z.string().optional(),
  showThinking: z.boolean().default(false),
  autoApprove: z.boolean().default(false),
  maxIterations: z.number().int().min(1).max(20).default(10),
});

export const Route = createFileRoute('/chat/$agentId')({
  validateSearch: zodValidator(agentChatSchema),
  component: AgentChatPage,
});

function AgentChatPage() {
  const { agentId } = Route.useParams();
  const search = Route.useSearch();
  
  // Type: { agentId: string; showThinking: boolean; ... }
}
```

### 8.3 Settings Schema

```typescript
export const settingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  fontSize: z.number().int().min(10).max(24).default(14),
  tabSize: z.number().int().min(2).max(8).default(2),
  wordWrap: z.boolean().default(true),
  minimap: z.boolean().default(true),
  lineNumbers: z.boolean().default(true),
  autoSave: z.boolean().default(true),
  aiProvider: z.enum(['gemini', 'openai', 'anthropic']).optional(),
  apiKey: z.string().optional(), // Will be validated separately
});
```

---

## 9. Testing

### 9.1 Validation Tests

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import {
  createRouter,
  createMemoryHistory,
  RouterProvider,
} from '@tanstack/react-router';

describe('Search Validation Behavior', () => {
  it('should show error component when validation fails', async () => {
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ['/search?page=invalid&query='],
      }),
    });

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText('Invalid Search Parameters')).toBeInTheDocument();
    });
  });

  it('should apply fallback values correctly', async () => {
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ['/search?query=laptops'], // page missing
      }),
    });

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText('Page: 1')).toBeInTheDocument(); // Fallback applied
    });
  });
});
```

**Source:** https://github.com/tanstack/router/blob/main/docs/router/framework/react/how-to/validate-search-params.md

---

## 10. Server Functions

### 10.1 Input Validation

```typescript
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

const UserSchema = z.object({
  name: z.string().min(1),
  age: z.number().min(0),
});

export const createUser = createServerFn({ method: 'POST' })
  .inputValidator(UserSchema)
  .handler(async ({ data }) => {
    // data is fully typed and validated
    return `Created user: ${data.name}, age ${data.age}`;
  });
```

**Source:** https://github.com/tanstack/router/blob/main/docs/start/framework/react/guide/server-functions.md

### 10.2 FormData Validation

```typescript
export const submitForm = createServerFn({ method: 'POST' })
  .inputValidator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error('Expected FormData');
    }

    return {
      name: data.get('name')?.toString() || '',
      email: data.get('email')?.toString() || '',
    };
  })
  .handler(async ({ data }) => {
    // Process form data
    return { success: true };
  });
```

**Source:** https://github.com/tanstack/router/blob/main/docs/start/framework/react/guide/server-functions.md

---

## 11. Source References

1. **Search Params Guide**: https://github.com/tanstack/router/blob/main/docs/router/framework/react/guide/search-params.md
2. **Validation Guide**: https://github.com/tanstack/router/blob/main/docs/router/framework/react/how-to/validate-search-params.md
3. **Navigation**: https://github.com/tanstack/router/blob/main/docs/router/framework/react/how-to/navigate-with-search-params.md
4. **Server Functions**: https://github.com/tanstack/router/blob/main/docs/start/framework/react/guide/server-functions.md

---

## 12. Next Steps for via-gent Implementation

### Phase 1: Core Routes (Week 1)
1. Define schemas for all IDE routes
2. Implement zodValidator for file explorer
3. Add search param validation for chat
4. Test basic navigation

### Phase 2: Advanced Features (Week 2)
1. Add middleware for parameter management
2. Implement error components
3. Add fallback values for resilience
4. Performance testing

### Phase 3: Integration (Week 3)
1. Wire search params to UI state
2. Add URL sync for all panels
3. Test complex validation scenarios
4. Documentation

---

**Status:** ✅ Research Complete
**Confidence:** High
**Implementation Ready:** Yes
