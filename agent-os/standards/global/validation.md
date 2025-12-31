---
date: '2025-12-31'
time: '03:18:00'
phase: 'Implementation'
team: 'Team-A'
agent_mode: 'bmad-core-bmad-master'
---

# Validation Standards

_This document defines validation patterns, input validation strategies, and data integrity requirements for the Via-gent project. All validation must use Zod for schema validation and follow the patterns defined here._

---

## 1. Validation Philosophy

### 1.1 Core Principles

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Fail Fast** | Validate inputs early and reject invalid data immediately | Zod schemas at function boundaries |
| **Defense in Depth** | Multiple validation layers for critical operations | Client + API + Business logic validation |
| **User-Friendly Errors** | Validation errors are actionable and understandable | UI displays specific error messages |
| **Type Safety** | Validation produces TypeScript types for downstream use | `z.infer<typeof schema>` for type inference |

### 1.2 Validation Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  (Form validation, UI feedback, keyboard navigation)        │
├─────────────────────────────────────────────────────────────┤
│                     API Boundary                             │
│  (Request validation, schema parsing, auth checks)          │
├─────────────────────────────────────────────────────────────┤
│                  Business Logic                              │
│  (Domain rules, cross-field validation, state transitions)  │
├─────────────────────────────────────────────────────────────┤
│                     Persistence                              │
│  (Database constraints, referential integrity)              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Zod Schema Patterns

### 2.1 Basic Schemas

```typescript
// src/lib/validation/schemas/common.ts
import { z } from 'zod';

// String schemas
export const nonEmptyString = z.string().min(1, 'Required field');
export const trimmedString = z.string().trim().min(1);
export const urlSchema = z.string().url('Invalid URL format');

// Numeric schemas
export const positiveNumber = z.number().positive('Must be positive');
export const naturalNumber = z.number().int().nonnegative();
export const percentage = z.number().min(0).max(100);

// Email schema
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .toLowerCase();

// UUID schema
export const uuidSchema = z
  .string()
  .uuid('Invalid UUID format')
  .or(z.string().uuid());

// File path schema
export const filePathSchema = z
  .string()
  .regex(/^[\w\-./]+$/, 'Invalid file path characters');
```

### 2.2 Complex Object Schemas

```typescript
// src/lib/validation/schemas/provider.ts
import { z } from 'zod';

// Provider configuration schema
export const providerConfigSchema = z.object({
  providerId: z.string().min(1, 'Provider ID required'),
  modelId: z.string().min(1, 'Model ID required'),
  apiKey: z.string().optional(),
  baseUrl: z.string().url().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
  enabledTools: z.array(z.string()).optional(),
});

export type ProviderConfig = z.infer<typeof providerConfigSchema>;

// Agent configuration schema
export const agentConfigSchema = z.object({
  id: uuidSchema,
  name: trimmedString.min(1, 'Agent name required').max(100),
  description: z.string().max(500).optional(),
  providerConfig: providerConfigSchema,
  systemPrompt: z.string().max(10000).optional(),
  autoApprove: z.boolean().default(false),
  approvedTools: z.array(z.string()).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AgentConfig = z.infer<typeof agentConfigSchema>;
```

### 2.3 Array and Collection Schemas

```typescript
// src/lib/validation/schemas/collections.ts
import { z } from 'zod';

// Non-empty array
export const nonEmptyArray = <T extends z.ZodType>(
  itemSchema: T,
  minSize: number = 1
) =>
  z
    .array(itemSchema)
    .min(minSize, `Must have at least ${minSize} item(s)`);

// Unique items array
export const uniqueItemsArray = <T extends z.ZodType>(
  itemSchema: T,
  comparator?: (a: unknown, b: unknown) => boolean
) =>
  z.array(itemSchema).refine(
    (items) => {
      const seen = new Set();
      return items.every((item) => {
        const key = comparator ? JSON.stringify(items.find(i => comparator(i, item))) : JSON.stringify(item);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    },
    { message: 'Array must contain unique items' }
  );

// Map-like object schema
export const recordSchema = <ValueSchema extends z.ZodType>(
  valueSchema: ValueSchema
) => z.record(z.string(), valueSchema);
```

### 2.4 Conditional and Discriminated Union Schemas

```typescript
// src/lib/validation/schemas/discriminated-unions.ts
import { z } from 'zod';

// Tool call with discriminator
export const toolCallSchema = z.discriminatedUnion('toolName', [
  z.object({
    toolName: z.literal('readFile'),
    args: z.object({
      path: filePathSchema,
      encoding: z.enum(['utf-8', 'base64']).optional(),
    }),
  }),
  z.object({
    toolName: z.literal('writeFile'),
    args: z.object({
      path: filePathSchema,
      content: z.string(),
      encoding: z.enum(['utf-8', 'base64']).optional(),
    }),
  }),
  z.object({
    toolName: z.literal('executeCommand'),
    args: z.object({
      command: nonEmptyString,
      workingDir: filePathSchema.optional(),
      timeout: z.number().positive().max(60000).optional(),
    }),
  }),
]);

export type ToolCall = z.infer<typeof toolCallSchema>;

// Conversation state with discriminator
export const conversationStateSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('idle'),
    lastMessage: z.string().optional(),
  }),
  z.object({
    status: z.literal('streaming'),
    messageId: uuidSchema,
    partialContent: z.string(),
  }),
  z.object({
    status: z.literal('completed'),
    messageId: uuidSchema,
    content: z.string(),
    toolCalls: z.array(toolCallSchema).optional(),
  }),
  z.object({
    status: z.literal('error'),
    messageId: uuidSchema,
    error: z.string(),
    canRetry: z.boolean(),
  }),
]);
```

---

## 3. Form Validation Patterns

### 3.1 React Hook Form Integration

```typescript
// src/lib/validation/react-hook-form.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { agentConfigSchema, AgentConfig } from './schemas/provider';

export function useAgentConfigForm(defaultValues?: Partial<AgentConfig>) {
  return useForm<AgentConfig>({
    resolver: zodResolver(agentConfigSchema),
    defaultValues: {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      providerConfig: {
        providerId: '',
        modelId: '',
        temperature: 0.7,
        maxTokens: 4096,
        enabledTools: [],
      },
      autoApprove: false,
      approvedTools: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...defaultValues,
    },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });
}
```

### 3.2 Form Validation Hooks

```typescript
// src/hooks/useFormValidation.ts
import { useCallback, useState } from 'react';
import { z } from 'zod';

type ValidationResult<T> = {
  data: T | null;
  errors: Record<keyof T, string | null>;
  isValid: boolean;
};

export function useFormValidation<T>(schema: z.ZodType<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(
    (data: unknown): ValidationResult<T> => {
      const result = schema.safeParse(data);

      if (result.success) {
        setErrors({});
        return {
          data: result.data,
          errors: {} as Record<keyof T, string | null>,
          isValid: true,
        };
      }

      const errorMap: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        const path = error.path.join('.');
        errorMap[path] = error.message;
      });
      setErrors(errorMap);

      return {
        data: null,
        errors: Object.fromEntries(
          Object.keys(data as object).map((key) => [key, errorMap[key] || null])
        ) as Record<keyof T, string | null>,
        isValid: false,
      };
    },
    [schema]
  );

  return { validate, errors, clearErrors: () => setErrors({}) };
}
```

### 3.3 Real-time Validation

```typescript
// src/components/ui/validation-feedback.tsx
import { useState, useEffect } from 'react';
import { z } from 'zod';

interface ValidationFeedbackProps<T> {
  value: T;
  schema: z.ZodType<T>;
  children: (result: { isValid: boolean; error?: string }) => React.ReactNode;
}

export function ValidationFeedback<T>({
  value,
  schema,
  children,
}: ValidationFeedbackProps<T>) {
  const [result, setResult] = useState<{ isValid: boolean; error?: string }>({
    isValid: true,
  });

  useEffect(() => {
    const parseResult = schema.safeParse(value);
    if (parseResult.success) {
      setResult({ isValid: true });
    } else {
      const firstError = parseResult.error.errors[0];
      setResult({
        isValid: false,
        error: firstError?.message || 'Invalid value',
      });
    }
  }, [value, schema]);

  return <>{children(result)}</>;
}
```

---

## 4. API Request Validation

### 4.1 API Route Validation

```typescript
// src/routes/api/chat.ts
import { defineApiRoute } from '@tanstack/react-start';
import { z } from 'zod';
import { chatRequestSchema } from '@/lib/validation/schemas/chat';

export const POST = defineApiRoute(async ({ request }) => {
  // Parse request body
  const body = await request.json();

  // Validate request
  const validationResult = chatRequestSchema.safeParse(body);
  if (!validationResult.success) {
    return new Response(
      JSON.stringify({
        error: 'Invalid request',
        details: validationResult.error.flatten(),
      }),
      { status: 400 }
    );
  }

  const { message, conversationId, agentId, stream } = validationResult.data;

  // Process request...
});
```

### 4.2 Query Parameter Validation

```typescript
// src/lib/validation/query-params.ts
import { z } from 'zod';

// Pagination query params
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Filter query params
export const filterSchema = paginationSchema.extend({
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'all']).default('all'),
  createdAfter: z.coerce.date().optional(),
  createdBefore: z.coerce.date().optional(),
});

export type FilterParams = z.infer<typeof filterSchema>;

// Usage in API route
export const GET = defineApiRoute(async ({ url }) => {
  const searchParams = url.searchParams;
  const params = Object.fromEntries(searchParams.entries());

  const result = filterSchema.safeParse(params);
  if (!result.success) {
    return new Response('Invalid query parameters', { status: 400 });
  }

  const { page, limit, search, status } = result.data;
  // Process request...
});
```

---

## 5. Business Logic Validation

### 5.1 Cross-Field Validation

```typescript
// src/lib/validation/schemas/business-rules.ts
import { z } from 'zod';

export const fileOperationSchema = z
  .object({
    operation: z.enum(['read', 'write', 'delete', 'execute']),
    path: z.string().min(1),
    content: z.string().optional(),
    overwrite: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.operation === 'write' && !data.content) {
        return false;
      }
      return true;
    },
    {
      message: 'Content is required for write operations',
      path: ['content'],
    }
  )
  .refine(
    (data) => {
      if (data.operation === 'delete' && data.path.includes('node_modules')) {
        return false;
      }
      return true;
    },
    {
      message: 'Cannot delete node_modules directory',
      path: ['path'],
    }
  );

export type FileOperation = z.infer<typeof fileOperationSchema>;
```

### 5.2 Async Validation

```typescript
// src/lib/validation/async-validator.ts
import { z } from 'zod';

interface AsyncValidationContext {
  existingIds: Set<string>;
  userPermissions: string[];
}

export const uniqueNameValidator = (
  existingNames: Set<string>
) =>
  z.string().refine(
    (name) => !existingNames.has(name.toLowerCase()),
    (name) => ({
      message: `Name "${name}" is already in use`,
      path: ['name'],
    })
  );

export const permissionValidator = (
  requiredPermission: string
) =>
  z.string().refine(
    async (userId) => {
      // Async check - would call permission service
      const hasPermission = await checkUserPermission(userId, requiredPermission);
      return hasPermission;
    },
    {
      message: `Missing required permission: ${requiredPermission}`,
      path: ['permissions'],
    }
  );

// Usage in schema
export const documentSchema = (
  context: AsyncValidationContext
) =>
  z.object({
    id: z.string(),
    name: uniqueNameValidator(context.existingIds),
    ownerId: permissionValidator('document.create'),
    content: z.string(),
  });
```

---

## 6. Error Handling for Validation

### 6.1 Error Classification

```typescript
// src/lib/utils/error-handling.ts
import { ZodError } from 'zod';

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code: string = 'VALIDATION_ERROR',
    public details?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function handleZodError(error: ZodError): ValidationError {
  const firstError = error.errors[0];
  return new ValidationError(
    firstError.message,
    firstError.path.join('.'),
    'ZOD_VALIDATION_ERROR',
    error.flatten()
  );
}

export function createValidationError(
  field: string,
  message: string,
  code: string = 'VALIDATION_ERROR'
): ValidationError {
  return new ValidationError(message, field, code);
}
```

### 6.2 User-Friendly Error Messages

```typescript
// src/lib/validation/error-messages.ts
export const validationErrorMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be no more than ${max} characters`,
  minValue: (min: number) => `Must be at least ${min}`,
  maxValue: (max: number) => `Must be no more than ${max}`,
  url: 'Please enter a valid URL',
  uuid: 'Please enter a valid identifier',
  pattern: 'Invalid format',
  unique: 'This value already exists',
  fileTooLarge: (maxSize: string) => `File must be smaller than ${maxSize}`,
  invalidFileType: 'File type not allowed',
} as const;

export function getUserFriendlyMessage(error: {
  message: string;
  code?: string;
  path?: string[];
}): string {
  // Map Zod error codes to user-friendly messages
  if (error.message.includes('Required')) {
    return validationErrorMessages.required;
  }
  if (error.message.includes('email')) {
    return validationErrorMessages.email;
  }
  if (error.message.includes('must be at least')) {
    const match = error.message.match(/must be at least (\d+)/);
    if (match) {
      return validationErrorMessages.minLength(parseInt(match[1]));
    }
  }
  return error.message;
}
```

---

## 7. Testing Validation

### 7.1 Unit Test Patterns

```typescript
// src/lib/validation/__tests__/schemas.test.ts
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { providerConfigSchema } from '../schemas/provider';

describe('Provider Config Schema', () => {
  describe('providerId validation', () => {
    it('should accept valid provider IDs', () => {
      const validIds = ['openrouter', 'anthropic', 'google-gemini'];
      for (const id of validIds) {
        const result = providerConfigSchema.safeParse({
          providerId: id,
          modelId: 'test-model',
        });
        expect(result.success).toBe(true);
      }
    });

    it('should reject empty provider ID', () => {
      const result = providerConfigSchema.safeParse({
        providerId: '',
        modelId: 'test-model',
      });
      expect(result.success).toBe(false);
      expect(result.error?.errors[0].path).toContain('providerId');
    });
  });

  describe('temperature validation', () => {
    it('should accept values between 0 and 2', () => {
      const result = providerConfigSchema.safeParse({
        providerId: 'test',
        modelId: 'test',
        temperature: 1.5,
      });
      expect(result.success).toBe(true);
    });

    it('should reject values above 2', () => {
      const result = providerConfigSchema.safeParse({
        providerId: 'test',
        modelId: 'test',
        temperature: 2.5,
      });
      expect(result.success).toBe(false);
    });
  });
});
```

### 7.2 Property-Based Testing

```typescript
// src/lib/validation/__tests__/property-based.test.ts
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { emailSchema, uuidSchema } from '../schemas/common';
import { generateEmails, generateUUIDs } from './generators';

describe('Email Schema - Property Tests', () => {
  it('should reject all generated invalid emails', () => {
    const invalidEmails = generateEmails({ validCount: 0, invalidCount: 100 });
    for (const email of invalidEmails) {
      const result = emailSchema.safeParse(email);
      expect(result.success).toBe(false);
    }
  });

  it('should accept all generated valid emails', () => {
    const validEmails = generateEmails({ validCount: 100, invalidCount: 0 });
    for (const email of validEmails) {
      const result = emailSchema.safeParse(email);
      expect(result.success).toBe(true);
    }
  });
});
```

---

## 8. Validation Best Practices

### 8.1 Performance Guidelines

| Practice | Description | Example |
|----------|-------------|---------|
| **Lazy Validation** | Validate only what you need | `schema.pick({ name: true })` |
| **Early Termination** | Fail fast on cheap validations | Validate required fields first |
| **Caching** | Cache compiled schemas | Use `z.lazy()` for recursive schemas |
| **Streaming** | Validate chunks for large data | Process arrays in batches |

### 8.2 Security Considerations

```typescript
// src/lib/validation/security.ts
import { z } from 'zod';

// Sanitize HTML to prevent XSS
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');
};

// Safe string schema
export const safeStringSchema = z.string().transform((val, ctx) => {
  const sanitized = sanitizeHtml(val);
  if (sanitized !== val) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Input contains potentially unsafe characters',
    });
    return z.NEVER;
  }
  return sanitized;
});

// Path traversal prevention
export const safePathSchema = z.string().refine(
  (path) => {
    // Prevent directory traversal
    const normalized = path.replace(/\.\.\//g, '');
    return path === normalized;
  },
  { message: 'Invalid path: directory traversal not allowed' }
);

// Command injection prevention
export const safeCommandSchema = z.string().refine(
  (command) => {
    // Block dangerous shell metacharacters
    const dangerous = /[;&|`$(){}[\]\\!#*?<>]/;
    return !dangerous.test(command);
  },
  { message: 'Command contains invalid characters' }
);
```

### 8.3 Internationalization Support

```typescript
// src/lib/validation/i18n.ts
import { z } from 'zod';

// Vietnamese phone number
export const vietnamPhoneSchema = z
  .string()
  .regex(
    /^(0|\+84)(3|5|7|8|9)([0-9]{8})$/,
    'Số điện thoại không hợp lệ'
  );

// Vietnamese ID number
export const vietnamIdSchema = z
  .string()
  .regex(
    /^[0-9]{9,12}$/,
    'Số CCCD/CMT không hợp lệ'
  );

// Localized string with length limits
export const localizedStringSchema = (maxLength: number) =>
  z.object({
    en: z.string().max(maxLength),
    vi: z.string().max(maxLength),
  });
```

---

## 9. Validation References

### 9.1 External Documentation

- [Zod Documentation](https://zod.dev)
- [React Hook Form](https://react-hook-form.com)
- [Zod Integration for React Hook Form](https://github.com/react-hook-form/resolvers)
- [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)

### 9.2 Related Files

- `src/lib/validation/schemas/` - Zod schema definitions
- `src/lib/utils/error-handling.ts` - Error handling utilities
- `src/components/ui/ErrorState.tsx` - Error display component
- `AGENTS.md` - Project-wide development guidelines

---

## 10. Checklist

### Validation Schema Creation

- [ ] Use Zod for all schema definitions
- [ ] Define input schemas at API boundaries
- [ ] Include user-friendly error messages
- [ ] Add type inference with `z.infer<typeof schema>`
- [ ] Test validation with valid and invalid inputs
- [ ] Handle async validation when needed
- [ ] Sanitize inputs to prevent XSS
- [ ] Prevent path traversal and command injection
- [ ] Support internationalized error messages

### Form Validation

- [ ] Integrate with React Hook Form
- [ ] Use `zodResolver` for schema validation
- [ ] Provide real-time feedback
- [ ] Display field-specific errors
- [ ] Support validation on blur and on change

### API Validation

- [ ] Validate all request bodies
- [ ] Validate query parameters
- [ ] Return structured error responses
- [ ] Log validation failures for debugging
- [ ] Rate-limit validation endpoints

---

*Document Version: 1.0.0*
*Last Updated: 2025-12-31*
*Next Review: 2026-01-07*
