# Shared Constants Documentation

**Module:** `src/shared/constants/`
**Status:** Not yet implemented
**Last Updated:** 2026-01-05

## Overview

The `src/shared/constants/` directory is reserved for application-wide constants that are used across multiple modules. Currently, this directory is empty and awaiting implementation.

## Planned Constants

### Categories to be implemented:

1. **Application Constants**
   - `APP_NAME`: Application display name
   - `APP_VERSION`: Current version string
   - `API_BASE_URL`: Base URL for API requests
   - `MAX_FILE_SIZE`: Maximum file upload size in bytes

2. **Configuration Constants**
   - `DEFAULT_PAGE_SIZE`: Default pagination size
   - `MAX_PAGE_SIZE`: Maximum pagination size
   - `SESSION_TIMEOUT`: Session timeout in milliseconds
   - `TOKEN_REFRESH_INTERVAL`: Token refresh interval

3. **Feature Flags**
   - `ENABLE_DEBUG_MODE`: Enable debug features
   - `ENABLE_ANALYTICS`: Enable analytics tracking
   - `ENABLE_CRASH_REPORTING`: Enable crash reporting

4. **Validation Constants**
   - `MIN_AGENT_NAME_LENGTH`: Minimum agent name length
   - `MAX_AGENT_NAME_LENGTH`: Maximum agent name length
   - `MIN_DESCRIPTION_LENGTH`: Minimum description length
   - `MAX_DESCRIPTION_LENGTH`: Maximum description length

5. **Time Constants**
   - `ONE_SECOND`: 1000 milliseconds
   - `ONE_MINUTE`: 60 seconds in milliseconds
   - `ONE_HOUR`: 60 minutes in milliseconds
   - `ONE_DAY`: 24 hours in milliseconds

6. **Error Messages**
   - `ERROR_NETWORK_OFFLINE`: Network offline message
   - `ERROR_UNAUTHORIZED`: Unauthorized access message
   - `ERROR_SERVER_ERROR`: Server error message

## Development Notes

When adding constants:

1. **Single Source**: All cross-module constants should be defined here
2. **Immutability**: Use `const` declarations, never modify at runtime
3. **Grouping**: Organize by feature/category
4. **Type Safety**: Use appropriate types for values
5. **Documentation**: JSDoc comments explaining purpose

## Dependencies

- None (self-contained constants)

## Usage Examples

```typescript
// Will be available after implementation
import { APP_NAME, DEFAULT_PAGE_SIZE, ONE_DAY } from '@/shared/constants';

// Use constants
console.log(`${APP_NAME} v${APP_VERSION}`);
const pageSize = DEFAULT_PAGE_SIZE;
const expiry = Date.now() + ONE_DAY;
```
