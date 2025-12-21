# Error Handling Standards

> **Last Updated:** 2025-12-21  
> **Applies to:** Via-Gent (Project Alpha)

---

## Core Principle: Fail Gracefully

> From Epic 13 retrospective: *"First provide a helpful fallback UI, then explore creative solutions."*

---

## Custom Error Classes

```typescript
// src/lib/filesystem/sync-types.ts
export class SyncError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
  }
}

export class PermissionDeniedError extends SyncError {
  constructor() {
    super('Permission denied', 'PERMISSION_DENIED');
  }
}

export class FileNotFoundError extends SyncError {
  constructor(path: string) {
    super(`File not found: ${path}`, 'FILE_NOT_FOUND');
  }
}
```

---

## Error Handling Pattern

```typescript
try {
  await syncToWebContainer(handle);
} catch (error) {
  if (error instanceof PermissionDeniedError) {
    // User-facing: localized toast
    toast.error(t('sync.permission_denied'), {
      description: t('sync.permission_denied_description'),
      action: {
        label: t('sync.grant_access'),
        onClick: () => requestPermission(),
      },
    });
  } else if (error instanceof SyncError) {
    // User-facing: generic sync error
    toast.error(t('sync.failed'));
    console.error('Sync failed:', error.code, error.message);
  } else {
    // Unexpected: log for debugging
    console.error('Unexpected error:', error);
    toast.error(t('common.unexpected_error'));
  }
}
```

---

## Toast Notification Patterns

```typescript
// Success
toast.success(t('file.saved'));

// Error with description
toast.error(t('sync.failed'), {
  description: t('sync.try_again'),
});

// Error with action
toast.error(t('permission.denied'), {
  action: {
    label: t('permission.grant'),
    onClick: handleGrantPermission,
  },
});
```

---

## General Practices

- **User-Friendly Messages**: Localized, actionable
- **Fail Fast**: Validate early with custom error types
- **Specific Exceptions**: Use typed errors, not generic Error
- **Graceful Degradation**: Show fallback UI when features unavailable
- **Cleanup Resources**: Close IndexedDB connections in finally blocks
- **Logging**: Console.error for debugging, toast for users
