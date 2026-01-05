# Shared Type Definitions

**Module:** `src/shared/types/index.ts`
**Status:** Active
**Last Updated:** 2026-01-05
**Exports:** 8 types (1 re-export)

## Overview

This module provides centralized type definitions for cross-cutting concerns used across all layers of the application. It serves as the single source of truth for common type definitions.

## Table of Contents

1. [Primitive Types](#primitive-types)
2. [Generic Interfaces](#generic-interfaces)
3. [Metadata Interfaces](#metadata-interfaces)
4. [Error Interfaces](#error-interfaces)
5. [Configuration Interfaces](#configuration-interfaces)

---

## Primitive Types

### Status

```typescript
export type Status = 'online' | 'offline' | 'busy' | 'error';
```

**Purpose:** Common status types for connection and entity states.

**Usage:**
- Agent connection status
- Provider availability
- System health indicators

**Example:**
```typescript
const agentStatus: Status = 'online';
const providerStatus: Status = 'busy';
```

---

### ProviderType

```typescript
export type ProviderType =
    | 'OpenRouter'
    | 'OpenAI'
    | 'Anthropic'
    | 'Mistral'
    | 'Google'
    | 'OpenAI Compatible';
```

**Purpose:** Enum-like type for LLM provider identification.

**Usage:**
- Provider selection dropdowns
- Model filtering by provider
- Provider-specific configurations

**Example:**
```typescript
const provider: ProviderType = 'OpenRouter';
const isAnthropic = (type: ProviderType) => type === 'Anthropic';
```

---

### UIVariant

```typescript
export type UIVariant = 'full' | 'compact' | 'minimal';
```

**Purpose:** Component rendering variant for different UI contexts.

**Usage:**
- Agent selector variants
- Workspace-specific UI
- Responsive component rendering

**Example:**
```typescript
const variant: UIVariant = 'compact';
const isFull = (v: UIVariant) => v === 'full';
```

---

## Generic Interfaces

### ApiResponse<T>

```typescript
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
    meta?: {
        timestamp: string;
        requestId: string;
    };
}
```

**Purpose:** Standardized API response wrapper for consistent error handling.

**Type Parameters:**
- `T`: The type of data returned in the response

**Properties:**
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `success` | `boolean` | Yes | Indicates if the request was successful |
| `data` | `T` | No | Response data on success |
| `error` | `object` | No | Error details on failure |
| `error.code` | `string` | Yes (if error) | Error code identifier |
| `error.message` | `string` | Yes (if error) | Human-readable error message |
| `error.details` | `unknown` | No | Additional error details |
| `meta` | `object` | No | Response metadata |
| `meta.timestamp` | `string` | Yes (if meta) | ISO timestamp of response |
| `meta.requestId` | `string` | Yes (if meta) | Unique request identifier |

**Usage Example:**
```typescript
interface User {
    id: string;
    name: string;
}

const response: ApiResponse<User> = {
    success: true,
    data: { id: '1', name: 'John' },
    meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req-123'
    }
};

const errorResponse: ApiResponse<User> = {
    success: false,
    error: {
        code: 'NOT_FOUND',
        message: 'User not found',
        details: { userId: '1' }
    }
};
```

---

### PaginatedResponse<T>

```typescript
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
        hasMore: boolean;
    };
}
```

**Purpose:** Extended ApiResponse with pagination metadata for list endpoints.

**Type Parameters:**
- `T`: The type of items in the paginated list

**Extends:** `ApiResponse<T[]>`

**Additional Properties:**
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `pagination.page` | `number` | Yes | Current page number (1-indexed) |
| `pagination.pageSize` | `number` | Yes | Number of items per page |
| `pagination.totalItems` | `number` | Yes | Total number of items |
| `pagination.totalPages` | `number` | Yes | Total number of pages |
| `pagination.hasMore` | `boolean` | Yes | Whether more pages exist |

**Usage Example:**
```typescript
interface Article {
    id: string;
    title: string;
}

const response: PaginatedResponse<Article> = {
    success: true,
    data: [
        { id: '1', title: 'Article 1' },
        { id: '2', title: 'Article 2' }
    ],
    pagination: {
        page: 1,
        pageSize: 10,
        totalItems: 25,
        totalPages: 3,
        hasMore: true
    },
    meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req-456'
    }
};
```

---

## Metadata Interfaces

### EntityMetadata

```typescript
export interface EntityMetadata {
    createdAt: string;
    updatedAt: string;
    version: number;
}
```

**Purpose:** Standardized metadata for domain entities.

**Properties:**
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `createdAt` | `string` | Yes | ISO timestamp of entity creation |
| `updatedAt` | `string` | Yes | ISO timestamp of last update |
| `version` | `number` | Yes | Entity version for optimistic locking |

**Usage Example:**
```typescript
interface Project extends EntityMetadata {
    id: string;
    name: string;
}

const project: Project = {
    id: 'proj-123',
    name: 'My Project',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-05T10:30:00Z',
    version: 5
};
```

---

## Error Interfaces

### ValidationError

```typescript
export interface ValidationError {
    field: string;
    message: string;
    code: string;
}
```

**Purpose:** Structured validation error representation for form validation.

**Properties:**
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `field` | `string` | Yes | Name of the field that failed validation |
| `message` | `string` | Yes | Human-readable error message |
| `code` | `string` | Yes | Machine-readable error code |

**Usage Example:**
```typescript
const errors: ValidationError[] = [
    {
        field: 'email',
        message: 'Invalid email format',
        code: 'INVALID_EMAIL'
    },
    {
        field: 'password',
        message: 'Password must be at least 8 characters',
        code: 'PASSWORD_TOO_SHORT'
    }
];
```

**Note:** This type is defined in `src/shared/types` but multiple modules define their own `ValidationError` interface, causing duplication. See adoption notes below.

---

## Configuration Interfaces

### PersistenceConfig

```typescript
export interface PersistenceConfig {
    key: string;
    version: number;
    encrypt: boolean;
    syncAcrossWorkspaces: boolean;
}
```

**Purpose:** Configuration for data persistence layer.

**Properties:**
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `key` | `string` | Yes | Storage key for persistence |
| `version` | `number` | Yes | Schema version for migrations |
| `encrypt` | `boolean` | Yes | Whether to encrypt stored data |
| `syncAcrossWorkspaces` | `boolean` | Yes | Whether to sync data across workspaces |

**Usage Example:**
```typescript
const config: PersistenceConfig = {
    key: 'agent-config',
    version: 1,
    encrypt: true,
    syncAcrossWorkspaces: false
};
```

---

## Re-exports

### WorkspaceType

```typescript
export type { WorkspaceType } from '@/domain/value-objects/workspace-type';
```

**Purpose:** Re-exports `WorkspaceType` from domain layer as single source of truth.

**Values:**
- `'ide'`: IDE workspace
- `'knowledge'`: Knowledge workspace
- `'study'`: Study workspace
- `'notes'`: Notes workspace

---

## Adoption Status

### Current Usage

**As of 2026-01-05, these types exist but are NOT imported in the active codebase.**

- **Current imports from @/shared/types:** 0
- **Files with duplicated types:** 4+ (defining their own ValidationError, etc.)

### Issues Identified

1. **No Active Imports:** The shared types module is not being used
2. **Type Duplication:** Multiple files define their own `ValidationError` interface:
   - `src/presentation/components/ui/AgentValidationFeedback.tsx`
   - `src/presentation/components/agent/AgentValidationErrors.tsx`
   - `src/lib/agent/providers/agent-validation-service.ts`
   - `src/application/services/AgentService.ts`

### Recommendations

1. **Phase 1:** Add imports for `ValidationError` to existing modules
2. **Phase 2:** Add imports for `ApiResponse` to API routes
3. **Phase 3:** Add imports for `EntityMetadata` to domain entities
4. **Phase 4:** Add imports for `PersistenceConfig` to persistence layer

---

## Dependencies

**Internal Dependencies:**
- `@/domain/value-objects/workspace-type` (re-export only)

**External Dependencies:**
- None

---

## Developer Notes

### Import Pattern

```typescript
// Correct import
import { ApiResponse, ValidationError, ProviderType } from '@/shared/types';

// Not yet implemented - will be available
import { debounce, deepClone } from '@/shared/utils';
import { APP_VERSION, DEFAULT_PAGE_SIZE } from '@/shared/constants';
```

### Type Compatibility

When adding new shared types, ensure:
1. Types are truly cross-cutting (used in 2+ modules)
2. Types are stable (not expected to change frequently)
3. Types are well-documented with JSDoc
4. Types follow existing naming conventions
