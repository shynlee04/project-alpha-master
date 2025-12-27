# Validation Standards

> **Last Updated:** 2025-12-21  
> **Applies to:** Via-Gent (Project Alpha)

---

## Validation Library

**Primary:** Zod 4.x  
**Reason:** Type-safe, TanStack integration, runtime validation

---

## Schema Definition

```typescript
import { z } from 'zod';

// Project metadata schema
export const ProjectMetadataSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  folderPath: z.string(),
  lastOpened: z.coerce.date(),
  layoutState: z.object({
    panels: z.array(z.number()),
    activeFile: z.string().optional(),
  }).optional(),
});

export type ProjectMetadata = z.infer<typeof ProjectMetadataSchema>;
```

---

## Form Validation

```tsx
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';

const ApiKeySchema = z.object({
  provider: z.enum(['gemini', 'openai', 'anthropic']),
  apiKey: z.string().min(20, 'API key too short'),
});

function ApiKeyForm() {
  const form = useForm({
    defaultValues: { provider: 'gemini', apiKey: '' },
    validatorAdapter: zodValidator(),
    onSubmit: async ({ value }) => {
      await saveApiKey(value);
    },
  });
  
  return (
    <form onSubmit={form.handleSubmit}>
      <form.Field
        name="apiKey"
        validators={{ onChange: ApiKeySchema.shape.apiKey }}
      >
        {(field) => (
          <>
            <Input
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors && (
              <p className="text-destructive text-sm">
                {field.state.meta.errors[0]}
              </p>
            )}
          </>
        )}
      </form.Field>
    </form>
  );
}
```

---

## File Path Validation

```typescript
// Path traversal protection (from Epic 3)
const FilePathSchema = z.string()
  .refine((path) => !path.includes('..'), 'Path traversal not allowed')
  .refine((path) => !path.startsWith('/'), 'Absolute paths not allowed')
  .refine((path) => !path.includes('\\'), 'Backslashes not allowed');
```

---

## General Practices

- **Client-Side for UX**: Immediate user feedback
- **Fail Early**: Validate on blur/change
- **Specific Errors**: Field-specific, localized messages
- **Type Safety**: Infer TypeScript types from Zod schemas
- **Allowlists**: Define what's allowed (path characters, file extensions)
- **Sanitize Input**: Block path traversal, script injection
