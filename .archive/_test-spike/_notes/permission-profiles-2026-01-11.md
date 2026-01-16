# Permission Profiles Specification

**Document ID:** permission-profiles-2026-01-11  
**Created:** 2026-01-11  
**Author:** Test Spike Harness Implementation  
**Phase:** Implementation

## Overview

This document describes the permission profile system for the Test-Spike Harness. Permission profiles define what operations an agent can perform, providing granular control over tool access, filesystem operations, and other sensitive capabilities.

## Profile Types

### Predefined Profiles

| Profile | Description | Use Case |
|---------|-------------|----------|
| `read-only` | read_file operations only | Safe exploration, analysis |
| `write-only` | write_to_file operations only | Content generation |
| `full-access` | All operations permitted | Development, full control |
| `path-restricted` | Limited paths with restrictions | Safe testing environments |
| `custom` | User-defined profile | Custom configurations |

### Profile Comparison Matrix

| Operation | read-only | write-only | full-access | path-restricted |
|-----------|-----------|------------|-------------|-----------------|
| read_file | ✅ | ❌ | ✅ | ⚠️ (allowed paths) |
| write_to_file | ❌ | ✅ | ✅ | ⚠️ (allowed paths) |
| delete_file | ❌ | ❌ | ✅ | ⚠️ (allowed paths) |
| execute | ❌ | ❌ | ✅ | ❌ |
| list_files | ✅ | ❌ | ✅ | ⚠️ (allowed paths) |
| search_files | ✅ | ❌ | ✅ | ⚠️ (allowed paths) |

## Core Types

### PermissionProfile Type

```typescript
export type PermissionProfile = 
  | 'read-only'
  | 'write-only'
  | 'full-access'
  | 'path-restricted'
  | 'custom';
```

### Operation Types

```typescript
export type OperationType = 
  | 'read'
  | 'write'
  | 'delete'
  | 'execute'
  | 'list'
  | 'search'
  | 'create_directory'
  | 'move'
  | 'copy'
  | 'metadata';
```

### Path Restriction

```typescript
export interface PathRestriction {
  allowedPaths: string[];     // Glob patterns (e.g., '/test/**')
  deniedPaths: string[];      // Glob patterns (e.g., '/etc/**')
  maxDepth?: number;          // Maximum directory depth
  maxFileSize?: number;       // Maximum file size in bytes
}
```

### Permission Profile Configuration

```typescript
export interface PermissionProfileConfig {
  profile: PermissionProfile;
  allowedOperations: OperationType[];
  deniedOperations: OperationType[];
  pathRestriction?: PathRestriction;
  yoloMode?: boolean;         // Bypass all restrictions
  timeout?: number;           // Execution timeout in ms
  maxMemory?: number;         // Maximum memory in MB
}
```

## PermissionEnforcer Class

The core class that enforces permission boundaries.

```typescript
export class PermissionEnforcer {
  private config: PermissionProfileConfig;
  
  constructor(config: PermissionProfileConfig) {
    this.config = config;
  }
  
  canRead(path: string): boolean {
    // Check read permission for path
  }
  
  canWrite(path: string): boolean {
    // Check write permission for path
  }
  
  canExecute(tool: string): boolean {
    // Check tool execution permission
  }
  
  checkPermission(
    operation: string, 
    params: unknown
  ): PermissionResult {
    // Comprehensive permission check
  }
}
```

### Permission Result

```typescript
export interface PermissionResult {
  granted: boolean;
  reason: string;
  profile: string;
  timestamp: string;
  details?: {
    path?: string;
    operation?: string;
    restriction?: string;
  };
}
```

## Profile Definitions

### Read-Only Profile

```typescript
export const READ_ONLY_PROFILE: PermissionProfileConfig = {
  profile: 'read-only',
  allowedOperations: ['read', 'list', 'search', 'metadata'],
  deniedOperations: ['write', 'delete', 'execute', 'create_directory', 'move', 'copy'],
  yoloMode: false,
};
```

### write_to_file-Only Profile

```typescript
export const WRITE_ONLY_PROFILE: PermissionProfileConfig = {
  profile: 'write-only',
  allowedOperations: ['write', 'create_directory'],
  deniedOperations: ['read', 'delete', 'execute', 'list', 'search', 'move', 'copy'],
  yoloMode: false,
};
```

### Full-Access Profile

```typescript
export const FULL_ACCESS_PROFILE: PermissionProfileConfig = {
  profile: 'full-access',
  allowedOperations: ['read', 'write', 'delete', 'execute', 'list', 'search', 'create_directory', 'move', 'copy', 'metadata'],
  deniedOperations: [],
  yoloMode: false,
};
```

### Path-Restricted Profile

```typescript
export const PATH_RESTRICTED_PROFILE: PermissionProfileConfig = {
  profile: 'path-restricted',
  allowedOperations: ['read', 'write', 'list', 'search', 'create_directory'],
  deniedOperations: ['delete', 'execute', 'move', 'copy'],
  pathRestriction: {
    allowedPaths: ['/test-spike/**', '/tmp/**'],
    deniedPaths: ['/etc/**', '/root/**', '/home/**', '/var/log/**'],
    maxDepth: 5,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  },
  yoloMode: false,
};
```

## Path Matching

### Glob Pattern Matching

The system supports glob patterns for path matching:

| Pattern | Description | Example |
|---------|-------------|---------|
| `*` | Matches any characters | `*.txt` matches `file.txt` |
| `**` | Matches recursive directories | `**/*.ts` matches all .ts files |
| `?` | Matches single character | `file?.txt` matches `file1.txt` |
| `[abc]` | Matches any character in set | `file[12].txt` matches `file1.txt` |
| `[!abc]` | Matches any character not in set | `file[!1].txt` matches `file2.txt` |

### Matching Algorithm

```typescript
function matchesGlob(path: string, pattern: string): boolean {
  // Implementation using minimatch or similar
}
```

## Usage Examples

### Basic Permission Check

```typescript
const enforcer = new PermissionEnforcer(READ_ONLY_PROFILE);

const canRead = enforcer.canRead('/test/file.txt'); // true
const canWrite = enforcer.canWrite('/test/file.txt'); // false
```

### Complex Permission Check

```typescript
const result = enforcer.checkPermission('read_file', {
  path: '/test/file.txt',
  encoding: 'utf-8',
});

console.log(result);
// { granted: true, reason: 'allowed by profile', profile: 'read-only' }
```

### Path Restriction Check

```typescript
const restrictedEnforcer = new PermissionEnforcer(PATH_RESTRICTED_PROFILE);

const canRead = restrictedEnforcer.canRead('/etc/passwd'); // false
const canRead = restrictedEnforcer.canRead('/test/file.txt'); // true
```

## Custom Profiles

### Creating Custom Profiles

```typescript
const CUSTOM_PROFILE: PermissionProfileConfig = {
  profile: 'custom',
  allowedOperations: ['read', 'write', 'list'],
  deniedOperations: ['delete', 'execute'],
  pathRestriction: {
    allowedPaths: ['/workspace/**'],
    deniedPaths: ['/workspace/secrets/**'],
    maxDepth: 3,
  },
  yoloMode: false,
};

const customEnforcer = new PermissionEnforcer(CUSTOM_PROFILE);
```

### Profile Merging

Profiles can be merged to create composite permissions:

```typescript
function mergeProfiles(
  base: PermissionProfileConfig,
  override: Partial<PermissionProfileConfig>
): PermissionProfileConfig {
  // Merge logic
}
```

## Testing Profiles

### Test Matrix

| Profile | Expected Behavior |
|---------|-------------------|
| read-only | All read operations succeed, writes fail |
| write-only | All write operations succeed, reads fail |
| full-access | All operations succeed |
| path-restricted | Operations restricted to allowed paths |

### Automated Tests

```typescript
describe('PermissionEnforcer', () => {
  describe('read-only profile', () => {
    it('should allow read operations', () => {
      const enforcer = new PermissionEnforcer(READ_ONLY_PROFILE);
      expect(enforcer.canRead('/test/file.txt')).toBe(true);
    });
    
    it('should deny write operations', () => {
      const enforcer = new PermissionEnforcer(READ_ONLY_PROFILE);
      expect(enforcer.canWrite('/test/file.txt')).toBe(false);
    });
  });
});
```

## Security Considerations

### Defense in Depth

1. **Profile-level restrictions** - Primary permission boundary
2. **Path restrictions** - Secondary boundary for filesystem
3. **Tool-level validation** - Tertiary boundary for specific tools
4. **Runtime monitoring** - Continuous audit logging

### Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Privilege escalation | Strict path restrictions |
| Path traversal | Path normalization and validation |
| Resource exhaustion | Memory and timeout limits |
| Bypass attempts | YOLO mode requires explicit opt-in |

## Best Practices

1. **Use least privilege** - Start with minimal permissions
2. **Audit all checks** - Log every permission decision
3. **Fail closed** - Deny by default, allow explicitly
4. **Test profiles** - Validate profiles before deployment
5. **Document changes** - Track profile modifications

## References

- Source: [`_test-spike/_harness/permission-profiles.ts`](_test-spike/_harness/permission-profiles.ts)
- Related: [Logging Specification](logging-spec-2026-01-11.md)
- Related: [Test Scenarios](scenario-tests-2026-01-11.md)

---

**End of Document**
