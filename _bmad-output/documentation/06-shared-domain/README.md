# Shared Domain Documentation

**Module:** `src/shared`
**Scan Date:** 2026-01-05
**Status:** Partial Implementation (Types Only)

## Overview

The `src/shared` domain serves as the centralized repository for cross-cutting concerns that are used across multiple layers of the application architecture. It provides a single source of truth for common types, constants, utilities, and error classes.

## Directory Structure

```
src/shared/
├── types/          # ✅ Active - Shared type definitions
├── constants/      # ⏳ Reserved - Shared constants (not yet implemented)
├── errors/         # ⏳ Reserved - Shared error classes (not yet implemented)
└── utils/          # ⏳ Reserved - Shared utility functions (not yet implemented)
```

## Current Status

### Implemented

| Module | Status | Files | Purpose |
|--------|--------|-------|---------|
| `types` | Active | 1 | Centralized type definitions |

### Not Yet Implemented

| Module | Status | Purpose |
|--------|--------|---------|
| `constants` | Pending | Application-wide constants |
| `errors` | Pending | Shared error classes |
| `utils` | Pending | Shared utility functions |

## Shared Types

The `src/shared/types/index.ts` module exports the following types:

### Primitive Types

| Type | Definition | Purpose |
|------|------------|---------|
| `Status` | `'online' \| 'offline' \| 'busy' \| 'error'` | Entity and connection states |
| `ProviderType` | LLM provider enumeration | Provider identification |
| `UIVariant` | `'full' \| 'compact' \| 'minimal'` | Component rendering variants |

### Generic Interfaces

| Interface | Purpose |
|-----------|---------|
| `ApiResponse<T>` | Standardized API response wrapper |
| `PaginatedResponse<T>` | API response with pagination metadata |

### Metadata Interfaces

| Interface | Purpose |
|-----------|---------|
| `EntityMetadata` | Standardized entity timestamps and versioning |

### Error Interfaces

| Interface | Purpose |
|-----------|---------|
| `ValidationError` | Structured validation error representation |

### Configuration Interfaces

| Interface | Purpose |
|-----------|---------|
| `PersistenceConfig` | Data persistence layer configuration |

### Re-exports

| Type | Source | Purpose |
|------|--------|---------|
| `WorkspaceType` | `@/domain/value-objects/workspace-type` | Single source of truth |

## Usage

### Importing Shared Types

```typescript
// Import types from shared module
import { 
    ApiResponse, 
    ValidationError, 
    ProviderType,
    UIVariant,
    WorkspaceType 
} from '@/shared/types';

// Use in your code
const response: ApiResponse<User> = { success: true };
const error: ValidationError = { field: 'email', message: 'Invalid', code: 'ERR001' };
const provider: ProviderType = 'OpenRouter';
const variant: UIVariant = 'compact';
const workspace: WorkspaceType = 'knowledge';
```

### Importing Future Modules

```typescript
// Constants (when implemented)
import { APP_VERSION, DEFAULT_PAGE_SIZE } from '@/shared/constants';

// Errors (when implemented)
import { AppError, ValidationError } from '@/shared/errors';

// Utilities (when implemented)
import { debounce, deepClone, unique } from '@/shared/utils';
```

## Cross-Module Dependencies

### Imports

The `src/shared/types` module currently has **no active imports** in the codebase.

### Exports

| Consumer Module | Imported Types | Status |
|-----------------|----------------|--------|
| None | - | Types not yet adopted |

### Adoption Notes

The shared types module was created but has not been adopted across the codebase. Several files define their own duplicate type definitions:

- `ValidationError` is defined in 4+ locations instead of using shared type
- `ApiResponse` is not used in API routes despite existing
- `EntityMetadata` is not applied to domain entities

**Recommendation:** Begin phased adoption starting with `ValidationError`.

## Documentation Files

| File | Description |
|------|-------------|
| `scan-inventory.json` | Structured scan data and metadata |
| `file-structure.txt` | Tree view of directory structure |
| `utilities.md` | Documentation for utilities module |
| `constants.md` | Documentation for constants module |
| `shared-types.md` | Complete type definitions documentation |
| `README.md` | This file - English overview |
| `README-VI.md` | Vietnamese overview |

## Development Guidelines

### Adding New Types

When creating cross-cutting types:

1. **Verify Necessity:** Ensure the type is used in 2+ modules
2. **Location:** Add to `src/shared/types/index.ts`
3. **Documentation:** Add JSDoc comments
4. **Naming:** Follow existing naming conventions
5. **Testing:** Add type tests if applicable

### Adding New Constants

When creating application-wide constants:

1. **Verify Scope:** Ensure constant is truly global
2. **Location:** Add to `src/shared/constants/` (when implemented)
3. **Organization:** Group by feature/category
4. **Documentation:** Add JSDoc comments

### Adding New Utilities

When creating shared utility functions:

1. **Pure Functions:** Ensure no side effects
2. **Performance:** Optimize for common cases
3. **Testing:** Achieve 100% coverage
4. **Type Safety:** Use TypeScript generics

## Known Issues

### Type Duplication

Several modules define their own versions of shared types:

```typescript
// Duplicate ValidationError definitions found:
src/presentation/components/ui/AgentValidationFeedback.tsx
src/presentation/components/agent/AgentValidationErrors.tsx
src/lib/agent/providers/agent-validation-service.ts
src/application/services/AgentService.ts
```

**Resolution:** Migrate to shared `ValidationError` type.

### No Active Usage

The shared types module exists but is not imported anywhere:

- **Current imports:** 0
- **Potential consumers:** 10+ files

**Resolution:** Begin phased adoption in code review.

## Future Development

### Planned Modules

1. **Shared Constants** (`src/shared/constants/`)
   - Application metadata (name, version)
   - Configuration limits (max sizes, timeouts)
   - Feature flags
   - Validation rules

2. **Shared Errors** (`src/shared/errors/`)
   - `AppError` base class
   - `ValidationError` class
   - `AuthenticationError`
   - `AuthorizationError`
   - `NotFoundError`

3. **Shared Utils** (`src/shared/utils/`)
   - Type guards
   - Object utilities
   - String utilities
   - Array utilities
   - Async utilities

### Migration Path

1. **Phase 1:** Adopt `ValidationError` from shared types
2. **Phase 2:** Adopt `ApiResponse` in API routes
3. **Phase 3:** Create shared constants module
4. **Phase 4:** Create shared errors module
5. **Phase 5:** Create shared utils module

## Related Documentation

- **Architecture:** `_bmad-output/architecture/`
- **Deep Scan:** `_bmad/modules/deep-scan/`
- **ADR-024:** `_bmad-output/project-planning-artifacts/adr-state-consolidation-2026-01-04.md`

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-05 | Initial documentation, types only |
