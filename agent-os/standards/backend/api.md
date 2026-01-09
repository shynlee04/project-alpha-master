---
date: 2026-01-09
time: "20:56:00"
phase: Standards
team: Team-A
last_updated_by: governance-cycle-3
---

# API Standards - Project Alpha

> **Stack:** TanStack Start + Server Functions | **No traditional REST API**

## Architecture Overview

Project Alpha uses **TanStack Start server functions** instead of traditional REST APIs. All server-side logic is handled through colocated server functions.

---

## Server Function Pattern

### Location

```
src/
├── routes/
│   ├── api/           # API route handlers
│   │   ├── ai.ts      # AI service endpoints
│   │   └── health.ts  # Health check
│   └── *.tsx          # Page routes with server loaders
└── domain/
    └── services/      # Business logic (called by server functions)
```

### Basic Server Function

```typescript
// src/routes/api/ai.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

const inputSchema = z.object({
  prompt: z.string().min(1).max(10000),
  model: z.string().optional(),
});

export const generateAI = createServerFn('POST', async (input: unknown) => {
  // Validate input
  const validated = inputSchema.parse(input);
  
  // Call domain service
  const result = await aiService.generate(validated);
  
  return { success: true, data: result };
});
```

### Loader Pattern (Data Fetching)

```typescript
// src/routes/notes.tsx
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const getNotesLoader = createServerFn('GET', async () => {
  // Server-side data fetching
  const notes = await noteService.getAll();
  return notes;
});

export const Route = createFileRoute('/notes')({
  loader: () => getNotesLoader(),
  component: NotesPage,
});
```

---

## Input Validation

### Always Use Zod

```typescript
import { z } from 'zod';

// ✅ REQUIRED: Schema-first validation
const createNoteSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().max(100000),
  projectId: z.string().uuid(),
});

export const createNote = createServerFn('POST', async (input: unknown) => {
  const validated = createNoteSchema.parse(input);
  // ...
});
```

### Common Validation Patterns

```typescript
// UUID validation
z.string().uuid()

// Email validation
z.string().email()

// Enum validation
z.enum(['draft', 'published', 'archived'])

// Optional with default
z.string().optional().default('untitled')

// Date validation
z.string().datetime() // ISO 8601

// Array with constraints
z.array(z.string()).min(1).max(100)
```

---

## Error Handling

### Consistent Error Response

```typescript
// Error response structure
interface APIError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Example error handling
export const updateNote = createServerFn('POST', async (input: unknown) => {
  try {
    const validated = updateNoteSchema.parse(input);
    const result = await noteService.update(validated);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: error.flatten(),
        },
      };
    }
    
    if (error instanceof NotFoundError) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
        },
      };
    }
    
    // Log unexpected errors
    console.error('Unexpected error:', error);
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    };
  }
});
```

---

## Response Patterns

### Success Response

```typescript
// Single item
return { success: true, data: note };

// List
return { success: true, data: notes, meta: { total: 100 } };

// No content
return { success: true };
```

### Error Codes

| Code | HTTP Equiv | Use Case |
|------|------------|----------|
| `VALIDATION_ERROR` | 400 | Invalid input |
| `UNAUTHORIZED` | 401 | No valid credentials |
| `FORBIDDEN` | 403 | No permission |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `CONFLICT` | 409 | Already exists |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Client-Side Consumption

```typescript
// Using server function from client
import { generateAI } from '@/routes/api/ai';

async function handleGenerate() {
  try {
    const result = await generateAI({ prompt: 'Hello' });
    if (result.success) {
      setResponse(result.data);
    } else {
      toast.error(result.error.message);
    }
  } catch (error) {
    toast.error('Network error');
  }
}
```

---

## Anti-Patterns

```typescript
// ❌ WRONG: No validation
export const badFn = createServerFn('POST', async (input: any) => {
  await db.insert(input); // Dangerous!
});

// ❌ WRONG: Throwing errors instead of returning
export const badFn = createServerFn('POST', async () => {
  throw new Error('Something failed'); // Client gets opaque error
});

// ❌ WRONG: Direct DB access in server function
export const badFn = createServerFn('GET', async () => {
  const notes = await db.notes.toArray(); // Should use service
});
```

---

## Related Standards

- **Validation:** `agent-os/standards/global/validation.md`
- **Error Handling:** `agent-os/standards/global/error-handling.md`
- **Domain Services:** `agent-os/standards/backend/models.md`
