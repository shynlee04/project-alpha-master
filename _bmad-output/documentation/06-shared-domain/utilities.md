# Shared Utilities Documentation

**Module:** `src/shared/utils/`
**Status:** Not yet implemented
**Last Updated:** 2026-01-05

## Overview

The `src/shared/utils/` directory is reserved for shared utility functions that are used across multiple modules. Currently, this directory is empty and awaiting implementation.

## Planned Utilities

### Functions to be implemented:

1. **Type Guards**
   - `isDefined<T>(value: T | null | undefined): value is T`
   - `isString(value: unknown): value is string`
   - `isNumber(value: unknown): value is number`

2. **Object Utilities**
   - `deepClone<T>(obj: T): T`
   - `deepMerge<T, U>(target: T, source: U): T & U`
   - `pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>`
   - `omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>`

3. **String Utilities**
   - `camelToSnake(str: string): string`
   - `snakeToCamel(str: string): string`
   - `truncate(str: string, maxLength: number): string`

4. **Array Utilities**
   - `unique<T>(arr: T[], key?: keyof T): T[]`
   - `groupBy<T>(arr: T[], key: keyof T): Record<string, T[]>`
   - `chunk<T>(arr: T[], size: number): T[][]`

5. **Async Utilities**
   - `debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number): T`
   - `throttle<T extends (...args: unknown[]) => unknown>(fn: T, limit: number): T`
   - `retry<T>(fn: () => Promise<T>, retries: number, delay: number): Promise<T>`

## Development Notes

When implementing utilities:

1. **Pure Functions**: All utilities should be pure functions with no side effects
2. **Type Safety**: Use TypeScript generics for maximum type inference
3. **Performance**: Optimize for common use cases
4. **Testing**: Achieve 100% unit test coverage
5. **Documentation**: JSDoc comments for all exported functions

## Dependencies

- None (self-contained utilities)

## Usage Examples

```typescript
// Will be available after implementation
import { debounce, deepClone, unique } from '@/shared/utils';

// Debounce API calls
const search = debounce(async (query: string) => {
  return await api.search(query);
}, 300);

// Deep clone objects
const copied = deepClone(originalObject);

// Remove duplicates
const items = unique(array);
```
